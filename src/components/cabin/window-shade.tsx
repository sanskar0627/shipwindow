import { useCallback, useEffect, useRef } from "react";
import { persistShade, useShadeStore } from "@/store/shade";
import { playShadeClick } from "@/lib/shade-audio";
import { clamp, smoothstep } from "@/lib/utils";

const LIP_PX = 16;

export function WindowShade() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);
  const setShade = useShadeStore((s) => s.setShade);
  const setDragging = useShadeStore((s) => s.setDragging);

  const glassRef = useRef<HTMLDivElement>(null);
  const live = useRef(false);
  const anim = useRef<number | null>(null);
  const drag = useRef({
    startY: 0,
    startShade: 0,
    lastY: 0,
    lastT: 0,
    velocity: 0,
  });

  const cancelAnim = useCallback(() => {
    if (anim.current != null) {
      cancelAnimationFrame(anim.current);
      anim.current = null;
    }
  }, []);

  const animateTo = useCallback(
    (target: number, withClick = true) => {
      cancelAnim();
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const start = useShadeStore.getState().shade;
      if (reduced || Math.abs(target - start) < 0.002) {
        setShade(target);
        persistShade(target);
        if (withClick && Math.abs(target - start) > 0.04) playShadeClick();
        return;
      }
      const dist = Math.abs(target - start);
      const dur = 260 + dist * 240;
      const t0 = performance.now();
      const ease = (t: number) => 1 - (1 - t) ** 3;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        setShade(start + (target - start) * ease(t));
        if (t < 1) {
          anim.current = requestAnimationFrame(step);
        } else {
          anim.current = null;
          persistShade(target);
          if (withClick) playShadeClick();
        }
      };
      anim.current = requestAnimationFrame(step);
    },
    [cancelAnim, setShade],
  );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    cancelAnim();
    live.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const now = performance.now();
    drag.current = {
      startY: e.clientY,
      startShade: useShadeStore.getState().shade,
      lastY: e.clientY,
      lastT: now,
      velocity: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live.current) return;
    const glass = glassRef.current;
    if (!glass) return;
    const h = glass.getBoundingClientRect().height || 1;
    const now = performance.now();
    const dt = now - drag.current.lastT;
    const dy = e.clientY - drag.current.startY;
    const next = drag.current.startShade + dy / h;
    if (dt > 0) {
      drag.current.velocity = (e.clientY - drag.current.lastY) / h / dt;
    }
    drag.current.lastY = e.clientY;
    drag.current.lastT = now;
    setShade(next);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live.current) return;
    live.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const s = useShadeStore.getState().shade;
    const v = drag.current.velocity;
    if (Math.abs(v) > 0.0014) {
      animateTo(v > 0 ? 1 : 0);
    } else if (s < 0.1) {
      animateTo(0);
    } else if (s > 0.9) {
      animateTo(1);
    } else {
      persistShade(s);
    }
  };

  const onDoubleClick = () => {
    const s = useShadeStore.getState().shade;
    animateTo(s < 0.5 ? 1 : 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const s = useShadeStore.getState().shade;
    if (e.key === "ArrowDown" || e.key === "PageDown") {
      e.preventDefault();
      animateTo(clamp(s + 0.12, 0, 1), false);
    } else if (e.key === "ArrowUp" || e.key === "PageUp") {
      e.preventDefault();
      animateTo(clamp(s - 0.12, 0, 1), false);
    } else if (e.key === "Home") {
      e.preventDefault();
      animateTo(0);
    } else if (e.key === "End") {
      e.preventDefault();
      animateTo(1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      animateTo(s < 0.5 ? 1 : 0);
    }
  };

  useEffect(() => () => cancelAnim(), [cancelAnim]);

  const day = 1 - smoothstep(0.12, 0.52, shade);
  const dusk = Math.exp(-(((shade - 0.42) / 0.22) ** 2));
  const night = smoothstep(0.36, 0.72, shade);
  const skyLabel =
    shade < 0.28 ? "Day" : shade < 0.62 ? "Dusk" : "Night";
  const valueNow = Math.round(shade * 100);

  return (
    <div className="window-block">
      <div
        className="cabin-window"
        data-dragging={dragging ? "true" : "false"}
        role="slider"
        tabIndex={0}
        aria-label="Cabin window shade"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={valueNow}
        aria-valuetext={`${skyLabel}, shade ${valueNow} percent`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={onDoubleClick}
        onKeyDown={onKeyDown}
      >
        <div className="win-outer">
          <div className="win-gasket">
            <div className="win-glass" ref={glassRef}>
              <img
                src="/skies/night.jpg"
                alt=""
                draggable={false}
                className="sky sky-night"
                style={{ opacity: night }}
              />
              <img
                src="/skies/dusk.jpg"
                alt=""
                draggable={false}
                className="sky sky-dusk"
                style={{ opacity: dusk }}
              />
              <img
                src="/skies/day.jpg"
                alt=""
                draggable={false}
                className="sky sky-day"
                style={{ opacity: day }}
              />
              <div
                className="shade"
                style={{
                  height: `calc(${LIP_PX}px + ${shade} * (100% - ${LIP_PX}px))`,
                }}
              >
                <div className="shade-ribs" />
                <div className="shade-tab" aria-hidden="true">
                  <span className="shade-groove" />
                </div>
              </div>
              <div className="glare" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
