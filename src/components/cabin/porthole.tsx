import { useEffect, useRef, useState } from "react";
import { seaLight } from "@/lib/sea-light";
import { clamp } from "@/lib/utils";
import {
  animateShadeTo,
  cancelShadeAnimation,
  persistShade,
  useShadeStore,
} from "@/store/shade";
import { OceanScene } from "./ocean-scene";
import { WallCaustics } from "./wall-caustics";

const TOP_LIP = 0.075; // fraction of glass height the rolled shade always occupies
const BOTTOM_GAP = 0.1; // a sliver of glass stays open at night: moonlight leaks in
const BOLTS = 12;

// Around 40% the page is mid-crossover between light and dark ink. The shade
// can pass through it, but never rests there.
const CROSS_LO = 0.35;
const CROSS_HI = 0.46;
const settle = (s: number, dir: number) =>
  s > CROSS_LO && s < CROSS_HI
    ? dir > 0
      ? CROSS_HI
      : dir < 0
        ? CROSS_LO
        : s < 0.405
          ? CROSS_LO
          : CROSS_HI
    : s;

export function Porthole() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);
  const touched = useShadeStore((s) => s.touched);
  const setShade = useShadeStore((s) => s.setShade);
  const setDragging = useShadeStore((s) => s.setDragging);
  const markTouched = useShadeStore((s) => s.markTouched);

  const glassRef = useRef<HTMLDivElement>(null);
  const [glassH, setGlassH] = useState(0);
  const live = useRef(false);
  const drag = useRef({ startY: 0, startShade: 0, lastY: 0, lastT: 0, v: 0 });

  useEffect(() => {
    const el = glassRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() =>
      setGlassH(el.getBoundingClientRect().height),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // teach the affordance once: the shade breathes a little
  useEffect(() => {
    if (touched) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const a = window.setTimeout(() => {
      if (useShadeStore.getState().touched) return;
      animateShadeTo(0.1, { click: false, persist: false });
      window.setTimeout(() => {
        if (!useShadeStore.getState().touched)
          animateShadeTo(0, { click: false, persist: false });
      }, 700);
    }, 1600);
    return () => window.clearTimeout(a);
  }, [touched]);

  const travel = (px: number) => {
    const h = glassRef.current?.getBoundingClientRect().height || 1;
    return px / (h * (1 - TOP_LIP - BOTTOM_GAP));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    cancelShadeAnimation();
    markTouched();
    live.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = {
      startY: e.clientY,
      startShade: useShadeStore.getState().shade,
      lastY: e.clientY,
      lastT: performance.now(),
      v: 0,
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live.current) return;
    const now = performance.now();
    const d = drag.current;
    const dt = now - d.lastT;
    if (dt > 0) d.v = d.v * 0.4 + (travel(e.clientY - d.lastY) / dt) * 0.6;
    d.lastY = e.clientY;
    d.lastT = now;
    setShade(d.startShade + travel(e.clientY - d.startY));
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
    const v = drag.current.v;
    const moved = Math.abs(e.clientY - drag.current.startY);
    if (moved < 4) {
      // a tap on the pull: toggle
      animateShadeTo(s < 0.5 ? 1 : 0);
    } else if (Math.abs(v) > 0.0016) {
      // a flick lets the roller run to its stop
      animateShadeTo(v > 0 ? 1 : 0);
    } else if (s < 0.06) animateShadeTo(0);
    else if (s > 0.94) animateShadeTo(1);
    else if (settle(s, 0) !== s) animateShadeTo(settle(s, 0), { click: false });
    else persistShade(s);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const s = useShadeStore.getState().shade;
    const step = e.shiftKey ? 0.25 : 0.08;
    const map: Record<string, number | undefined> = {
      ArrowDown: s + step,
      ArrowRight: s + step,
      PageDown: s + 0.25,
      ArrowUp: s - step,
      ArrowLeft: s - step,
      PageUp: s - 0.25,
      Home: 0,
      End: 1,
      Enter: s < 0.5 ? 1 : 0,
      " ": s < 0.5 ? 1 : 0,
    };
    const next = map[e.key];
    if (next === undefined) return;
    e.preventDefault();
    markTouched();
    const big =
      e.key === "Home" || e.key === "End" || e.key === "Enter" || e.key === " ";
    const target = settle(clamp(next, 0, 1), Math.sign(next - s));
    animateShadeTo(target, { click: big });
  };

  const L = seaLight(shade);
  const pct = Math.round(shade * 100);
  const drop = TOP_LIP + shade * (1 - TOP_LIP - BOTTOM_GAP);
  const backlit = (1 - shade) * 0.2 + L.dusk * 0.35;

  return (
    <div className="stage">
      <div className="stage-panel" aria-hidden="true" />
      <WallCaustics />
      <div className="light-pool" aria-hidden="true" />

      <div className="porthole-wrap">
        <div
          className="porthole"
          data-dragging={dragging ? "true" : "false"}
          role="slider"
          tabIndex={0}
          aria-label="Porthole shade. Lower it to switch the site to night."
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
          aria-valuetext={`${L.phase}, shade ${pct} percent lowered`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onKeyDown={onKeyDown}
        >
          <div className="ph-reveal" />
          <div className="ph-ring">
            {Array.from({ length: BOLTS }, (_, i) => (
              <span
                key={i}
                className="ph-bolt"
                style={{
                  transform: `rotate(${(360 / BOLTS) * i + 15}deg) translateY(-50%)`,
                }}
              >
                <i />
              </span>
            ))}
            <div className="ph-seat">
              <div className="ph-glass" ref={glassRef}>
                <OceanScene className="ph-scene" />

                <div className="ph-shade" style={{ height: `${drop * 100}%` }}>
                  <div className="ph-cloth">
                    <div
                      className="ph-texture"
                      style={{ height: glassH ? `${glassH}px` : "100%" }}
                    />
                    <div
                      className="ph-backlight"
                      style={{
                        height: glassH ? `${glassH}px` : "100%",
                        opacity: backlit,
                        background: `radial-gradient(circle at ${L.sunX * 100}% ${L.sunY * 100}%, rgba(${L.sunColor.map((c) => c | 0).join(",")},0.9) 0%, rgba(${L.sunColor.map((c) => c | 0).join(",")},0.25) 22%, transparent 55%)`,
                      }}
                    />
                    <div
                      className="ph-backlight"
                      style={{
                        height: glassH ? `${glassH}px` : "100%",
                        opacity: L.moon * 0.5,
                        background: `radial-gradient(circle at ${L.moonX * 100}% ${L.moonY * 100}%, rgba(210,222,255,0.55) 0%, rgba(210,222,255,0.12) 16%, transparent 40%)`,
                      }}
                    />
                    <div className="ph-roll" />
                  </div>
                  <div className="ph-rail">
                    <span className="ph-pull">
                      <span className="ph-pull-slot" />
                    </span>
                  </div>
                </div>

                <div className="ph-vignette" />
                <div className="ph-reflect" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="stage-caption" aria-hidden="true">
        <span>Starboard · 07</span>
        <span className="stage-caption-rule" />
        <span>{touched ? L.phase : "Drag the shade"}</span>
      </div>
    </div>
  );
}
