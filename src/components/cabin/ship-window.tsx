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
  useShadeStore,
} from "@/store/shade";
import { LifeJacket } from "./life-jacket";

const LIP_PX = 14; // the rolled fabric always shows under the head rail
const SCREWS = 10;

// Around 40% the page is mid-crossover; the shade can pass it but never rests there.
const CROSS_LO = 0.35;
const CROSS_HI = 0.46;
const settle = (s: number, dir = 0) =>
  s > CROSS_LO && s < CROSS_HI
    ? dir > 0 || (dir === 0 && s >= (CROSS_LO + CROSS_HI) / 2)
      ? CROSS_HI
      : CROSS_LO
    : s;

/** where to let the blind come to rest after a throw */
function restAt(pos: number) {
  if (pos < 0.05) return animateShadeTo(0, { click: false });
  if (pos > 0.95) return animateShadeTo(1, { click: false });
  const s = settle(pos);
  if (s !== pos) return animateShadeTo(s, { click: false });
  persistShade(pos);
}

export function ShipWindow() {
  const shade = useShadeStore((s) => s.shade);
  const velocity = useShadeStore((s) => s.velocity);
  const dragging = useShadeStore((s) => s.dragging);
  const setDragging = useShadeStore((s) => s.setDragging);

  const glassRef = useRef<HTMLDivElement>(null);
  const live = useRef(false);
  const drag = useRef({
    startY: 0,
    startShade: 0,
    samples: [] as { y: number; t: number }[],
  });

  const span = () =>
    Math.max(
      1,
      (glassRef.current?.getBoundingClientRect().height ?? 1) - LIP_PX,
    );

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    live.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    grabShade();
    drag.current = {
      startY: e.clientY,
      startShade: useShadeStore.getState().shade,
      samples: [{ y: e.clientY, t: performance.now() }],
    };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live.current) return;
    const d = drag.current;
    const now = performance.now();
    d.samples.push({ y: e.clientY, t: now });
    while (d.samples.length > 2 && now - d.samples[0].t > 100)
      d.samples.shift();
    dragShadeTo(d.startShade + (e.clientY - d.startY) / span());
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
    const d = drag.current;
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
    const next = clamp(hit[0], 0, 1);
    animateShadeTo(settle(next, Math.sign(next - s)), { click: hit[1] });
  };

  useEffect(() => () => cancelShadeAnimation(), []);

  // Photos are stacked night → dusk → day and peeled away in order, so there
  // is always exactly one fully opaque frame underneath: no dim cross-dissolve.
  const dayA = 1 - smoothstep(0.1, 0.46, shade);
  const duskA = 1 - smoothstep(0.5, 0.86, shade);
  const skyLabel = shade < 0.28 ? "Day" : shade < 0.62 ? "Dusk" : "Night";
  const valueNow = Math.round(shade * 100);

  // sun glowing through the linen: strongest while the dusk frame is showing
  const backlight = clamp(0.16 * dayA + 0.55 * (duskA - dayA), 0, 0.6);
  // the pull swings against the direction of travel
  const tilt = clamp(-velocity * 7, -10, 10);

  return (
    <div className="window-block">
      <div className="bulkhead">
        <LifeJacket />

        <div
          className="ship-window"
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
          onDoubleClick={onDoubleClick}
          onKeyDown={onKeyDown}
        >
          <div className="port-outer">
            <div className="port-ring">
              {Array.from({ length: SCREWS }, (_, i) => (
                <span
                  key={i}
                  className="port-screw"
                  style={{ transform: `rotate(${(360 / SCREWS) * i + 18}deg)` }}
                >
                  <i />
                </span>
              ))}
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
                        style={{ opacity: duskA }}
                      />
                      <img
                        src={seaPhotos.day}
                        alt=""
                        draggable={false}
                        decoding="async"
                        fetchPriority="high"
                        className="sea-photo"
                        style={{ opacity: dayA }}
                      />
                    </div>
                  </div>
                  <div className="sea-grade" aria-hidden="true" />

                  <div
                    className="blind"
                    style={{
                      height: `calc(${LIP_PX}px + ${shade} * (100% - ${LIP_PX - 7}px))`,
                    }}
                  >
                    <div className="blind-cloth">
                      <div className="blind-weave" />
                      <div
                        className="blind-light"
                        style={{ opacity: backlight }}
                      />
                      <div className="blind-roll" />
                    </div>
                    <div className="blind-rail">
                      <span
                        className="blind-pull"
                        style={{
                          transform: `translateX(-50%) rotate(${tilt}deg)`,
                        }}
                        aria-hidden="true"
                      >
                        <span className="blind-pull-grip" />
                      </span>
                    </div>
                  </div>

                  <div className="glass-salt" aria-hidden="true" />
                  <div className="glass-sheen" aria-hidden="true" />
                  <div className="glass-edge" aria-hidden="true" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
