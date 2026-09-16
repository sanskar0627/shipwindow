import { useEffect, useRef, useState } from "react";
import { seaPhotos } from "@/data/content";
import { clamp, smoothstep } from "@/lib/utils";
import {
  animateShadeTo,
  cancelShadeAnimation,
  persistShade,
  useShadeStore,
} from "@/store/shade";

/** Shade travel, in px from the top of the glass. */
const LIP_PX = 14; // the rolled fabric is always visible under the head rail
const FOOT_PX = 16; // fully lowered, the pull still sits inside the round glass
const SCREWS = 10;

// Around 40% the page is mid-crossover; the shade can pass it but never rests there.
const settle = (s: number, dir = 0) =>
  s > 0.35 && s < 0.46
    ? dir > 0 || (dir === 0 && s >= 0.405)
      ? 0.46
      : 0.35
    : s;

type Layer = keyof typeof seaPhotos;

function SeaPhoto({ layer, opacity }: { layer: Layer; opacity: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={seaPhotos[layer]}
      alt=""
      draggable={false}
      decoding="async"
      className={`sea-photo sea-${layer}`}
      style={{ opacity }}
      onError={() => setFailed(true)}
    />
  );
}

export function ShipWindow() {
  const shade = useShadeStore((s) => s.shade);
  const dragging = useShadeStore((s) => s.dragging);
  const setShade = useShadeStore((s) => s.setShade);
  const setDragging = useShadeStore((s) => s.setDragging);

  const glassRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState(0);
  const live = useRef(false);
  const drag = useRef({ startY: 0, startShade: 0, lastY: 0, lastT: 0, v: 0 });

  const travel = (px: number) => {
    const h = glassRef.current?.getBoundingClientRect().height ?? 1;
    return px / Math.max(1, h - LIP_PX - FOOT_PX);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    cancelShadeAnimation();
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
    const d = drag.current;
    const now = performance.now();
    const dt = now - d.lastT;
    if (dt > 0) {
      d.v = d.v * 0.35 + (travel(e.clientY - d.lastY) / dt) * 0.65;
      // the pull swings a little against the direction of travel
      setTilt(clamp(-d.v * 2600, -9, 9));
    }
    d.lastY = e.clientY;
    d.lastT = now;
    setShade(d.startShade + travel(e.clientY - d.startY));
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!live.current) return;
    live.current = false;
    setDragging(false);
    setTilt(0);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    const s = useShadeStore.getState().shade;
    const { startY, lastT } = drag.current;
    // a pause before letting go cancels the flick
    const v = performance.now() - lastT > 90 ? 0 : drag.current.v;
    if (Math.abs(e.clientY - startY) < 4) animateShadeTo(s < 0.5 ? 1 : 0);
    else if (Math.abs(v) > 0.0014) animateShadeTo(v > 0 ? 1 : 0);
    else if (s < 0.08) animateShadeTo(0);
    else if (s > 0.92) animateShadeTo(1);
    else if (settle(s) !== s) animateShadeTo(settle(s), { click: false });
    else persistShade(s);
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

  const day = 1 - smoothstep(0.12, 0.52, shade);
  const dusk = Math.exp(-(((shade - 0.42) / 0.22) ** 2));
  const night = smoothstep(0.36, 0.72, shade);
  const skyLabel = shade < 0.28 ? "Day" : shade < 0.62 ? "Dusk" : "Night";
  const valueNow = Math.round(shade * 100);
  // sunlight glowing through the linen, strongest when the sun sits low
  const backlight = 0.18 * day + 0.5 * dusk * (1 - night);

  return (
    <div className="window-block">
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
                    <SeaPhoto layer="night" opacity={night} />
                    <SeaPhoto layer="dusk" opacity={dusk} />
                    <SeaPhoto layer="day" opacity={day} />
                  </div>
                </div>
                <div className="sea-grade" aria-hidden="true" />

                <div
                  className="blind"
                  style={{
                    height: `calc(${LIP_PX}px + ${shade} * (100% - ${LIP_PX + FOOT_PX}px))`,
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
                <div className="glass-cabin" aria-hidden="true" />
                <div className="glass-sheen" aria-hidden="true" />
                <div className="glass-edge" aria-hidden="true" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
