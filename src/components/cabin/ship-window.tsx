import { useEffect, useRef } from "react";
import { seaPhotos } from "@/data/content";
import { clamp, smoothstep } from "@/lib/utils";
import {
  animateShadeTo,
  cancelShadeAnimation,
  dragShadeTo,
  grabShade,
  persistShade,
  releaseShade,
  setShadeTarget,
  useShadeStore,
} from "@/store/shade";
import { LifeJacket } from "./life-jacket";
import { LifeRing } from "./life-ring";

const LIP_PX = 14; // the rolled fabric always shows under the head rail
const SCREWS = 10;

// The blind, the pull and the three sea frames read their position from custom
// properties the simulation writes each frame, so a drag never re-renders this
// component and never touches layout. These objects are constant on purpose.
const DAY_STYLE = { opacity: "var(--day-a, 1)" } as React.CSSProperties;
const DUSK_STYLE = { opacity: "var(--dusk-a, 1)" } as React.CSSProperties;

/** where to let the blind come to rest after a throw */
function restAt(pos: number) {
  if (pos < 0.05) return animateShadeTo(0, { click: false });
  if (pos > 0.95) return animateShadeTo(1, { click: false });
  persistShade(pos);
}

export function ShipWindow() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);
  const setDragging = useShadeStore((s) => s.setDragging);

  const frameRef = useRef<HTMLDivElement>(null);
  const glassRef = useRef<HTMLDivElement>(null);
  const drag = useRef({
    id: null as number | null,
    startY: 0,
    startShade: 0,
    samples: [] as { y: number; t: number }[],
  });

  useEffect(() => {
    setShadeTarget(frameRef.current);
    return () => setShadeTarget(null);
  }, []);

  // A release the element never hears — outside the window, after a lost
  // capture, or when the tab loses focus — still ends the drag.
  useEffect(() => {
    if (!dragging) return;
    const bail = () => {
      if (drag.current.id === null) return;
      drag.current.id = null;
      setDragging(false);
      releaseShade(0, restAt);
    };
    window.addEventListener("pointerup", bail);
    window.addEventListener("pointercancel", bail);
    window.addEventListener("blur", bail);
    return () => {
      window.removeEventListener("pointerup", bail);
      window.removeEventListener("pointercancel", bail);
      window.removeEventListener("blur", bail);
    };
  }, [dragging, setDragging]);

  const span = () =>
    Math.max(
      1,
      (glassRef.current?.getBoundingClientRect().height ?? 1) - LIP_PX,
    );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // one hand at a time: a second finger never hijacks a drag in progress
    if (e.button !== 0 || drag.current.id !== null) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* capture is a nicety, not a requirement */
    }
    grabShade();
    drag.current = {
      id: e.pointerId,
      startY: e.clientY,
      startShade: useShadeStore.getState().shade,
      samples: [{ y: e.clientY, t: performance.now() }],
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const now = performance.now();
    d.samples.push({ y: e.clientY, t: now });
    while (d.samples.length > 2 && now - d.samples[0].t > 100)
      d.samples.shift();
    dragShadeTo(d.startShade + (e.clientY - d.startY) / span());
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = null;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const now = performance.now();
    const first = d.samples[0];
    const lastSample = d.samples[d.samples.length - 1];
    const moved = Math.abs(e.clientY - d.startY);

    if (moved < 4) {
      // a tap on the pull: all the way, the other way
      const s = useShadeStore.getState().shade;
      animateShadeTo(s < 0.5 ? 1 : 0);
      return;
    }

    // hand speed over the last ~100ms; a pause before letting go means no throw
    const dt = (lastSample.t - first.t) / 1000;
    const stale = now - lastSample.t > 80;
    const v = !stale && dt > 0.008 ? (lastSample.y - first.y) / span() / dt : 0;
    releaseShade(clamp(v, -9, 9), restAt);
  };

  const onLostCapture = (e: React.PointerEvent<HTMLDivElement>) => {
    if (drag.current.id !== e.pointerId) return;
    drag.current.id = null;
    setDragging(false);
    releaseShade(0, restAt);
  };

  const onDoubleClick = () => {
    animateShadeTo(useShadeStore.getState().shade < 0.5 ? 1 : 0);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const s = useShadeStore.getState().shade;
    const keys: Record<string, [number, boolean]> = {
      ArrowDown: [s + 0.12, false],
      PageDown: [s + 0.12, false],
      ArrowUp: [s - 0.12, false],
      PageUp: [s - 0.12, false],
      Home: [0, true],
      End: [1, true],
      Enter: [s < 0.5 ? 1 : 0, true],
      " ": [s < 0.5 ? 1 : 0, true],
    };
    const hit = keys[e.key];
    if (!hit) return;
    e.preventDefault();
    animateShadeTo(clamp(hit[0], 0, 1), { click: hit[1] });
  };

  useEffect(() => () => cancelShadeAnimation(), []);

  const skyLabel = shade < 0.32 ? "Day" : shade < 0.68 ? "Dusk" : "Night";
  const valueNow = Math.round(shade * 100);
  // first paint — and the server's render — start where the simulation would
  const initial = {
    "--hem": shade.toFixed(4),
    "--day-a": (1 - smoothstep(0.02, 0.58, shade)).toFixed(4),
    "--dusk-a": (1 - smoothstep(0.36, 0.98, shade)).toFixed(4),
  } as React.CSSProperties;

  return (
    <div className="window-block">
      <LifeRing />

      <div className="bulkhead">
        <LifeJacket />

        <div
          className="ship-window"
          ref={frameRef}
          style={initial}
          data-dragging={dragging ? "true" : "false"}
          role="slider"
          tabIndex={0}
          aria-label="Cabin porthole shade"
          aria-orientation="vertical"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={valueNow}
          aria-valuetext={`${skyLabel}, shade ${valueNow} percent`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onLostPointerCapture={onLostCapture}
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
        >
          <div className="port-outer">
            <div className="port-ring">
              {Array.from({ length: SCREWS }, (_, i) => {
                const angle = (360 / SCREWS) * i + 18;
                // only the screws turned toward the key catch it
                const lit = Math.max(
                  0,
                  Math.cos(((angle - 225) * Math.PI) / 180),
                );
                return (
                  <span
                    key={i}
                    className="port-screw"
                    style={
                      {
                        transform: `rotate(${angle}deg)`,
                        "--lit": (0.34 + 0.66 * lit).toFixed(3),
                      } as React.CSSProperties
                    }
                  >
                    <i />
                  </span>
                );
              })}
              <div className="port-gasket">
                <div className="port-glass" ref={glassRef}>
                  <div className="sea-swell">
                    <div className="sea-roll">
                      <img
                        src={seaPhotos.night}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="sea-photo"
                      />
                      <img
                        src={seaPhotos.dusk}
                        alt=""
                        draggable={false}
                        decoding="async"
                        className="sea-photo"
                        style={DUSK_STYLE}
                      />
                      <img
                        src={seaPhotos.day}
                        alt=""
                        draggable={false}
                        decoding="async"
                        fetchPriority="high"
                        className="sea-photo"
                        style={DAY_STYLE}
                      />
                    </div>
                  </div>
                  <div className="sea-grade" aria-hidden="true" />

                  {/* the cloth is a full-height sheet that slides on the
                      compositor: its height never changes, so a drag costs
                      no layout and no repaint of the glass */}
                  <div className="blind" aria-hidden="true">
                    <div className="blind-cloth">
                      <div className="blind-weave" />
                      <div className="blind-light" />
                      <div className="blind-hem" />
                      <div className="blind-rail" />
                    </div>
                    <div className="blind-roll" />
                  </div>

                  <div className="glass-salt" aria-hidden="true" />
                  <div className="glass-reflect" aria-hidden="true" />
                  <div className="glass-edge" aria-hidden="true" />
                </div>

                {/* sits on the gasket, not in the clipped pane — so at full
                    shade it still hangs proud of the steel ring instead of
                    disappearing under the sill */}
                <span className="blind-pull" aria-hidden="true">
                  <span className="blind-pull-grip" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
