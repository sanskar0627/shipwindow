import { create } from "zustand";
import { clamp, smoothstep } from "@/lib/utils";
import { playShadeClick } from "@/lib/shade-audio";

const STORAGE_KEY = "porthole-shade";

type ShadeState = {
  /** 0 = fully raised (day), 1 = fully lowered (night) */
  shade: number;
  dragging: boolean;
  hydrated: boolean;
  setShade: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  hydrate: () => void;
};

export const useShadeStore = create<ShadeState>((set) => ({
  shade: 0,
  dragging: false,
  hydrated: false,
  setShade: (value) => {
    const v = clamp(value, 0, 1);
    paint(v, 0);
    set({ shade: v });
  },
  setDragging: (dragging) => set({ dragging }),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          const v = clamp(n, 0, 1);
          paint(v, 0);
          set({ shade: v, hydrated: true });
          return;
        }
      }
    } catch {
      /* storage unavailable */
    }
    set({ hydrated: true });
  },
}));

export function persistShade(value: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* storage unavailable */
  }
}

/* ───────────────────────── painting, without React ─────────────────────────
   The blind, the pull and the three sea frames are driven by custom properties
   written straight to the DOM on each animation frame. Nothing here changes
   layout and nothing here re-renders the tree: the browser only moves one
   composited layer and adjusts a couple of opacities. React is told the value
   again only when the readout would show a different number.                 */

let target: HTMLElement | null = null;

/** The porthole registers itself here so the simulation can paint it. */
export function setShadeTarget(el: HTMLElement | null) {
  target = el;
  if (el) paint(useShadeStore.getState().shade, 0);
}

/** Light for the whole room, derived from one number. */
export function applyEnvironment(pos: number) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.style.setProperty("--shade", pos.toFixed(4));

  // One long S across the whole travel, so the room is always changing
  // rather than sitting in a day, dusk or night preset.
  const tone = smoothstep(0.02, 0.98, pos);

  // Golden hour is a wide, quiet bell the light drifts through — it warms
  // the room before it goes cool, and never arrives as its own scene.
  const dusk = Math.exp(-(((pos - 0.46) / 0.34) ** 2));

  // Type has to change value somewhere or dark letters vanish on a dark
  // wall. It happens late and slowly, once the wall is already under the
  // words, so the flip reads as light leaving rather than a repaint.
  const ink = smoothstep(0.4, 0.74, pos);

  root.style.setProperty("--tone", tone.toFixed(4));
  root.style.setProperty("--dusk", dusk.toFixed(4));
  root.style.setProperty("--night", smoothstep(0.58, 1, pos).toFixed(4));
  root.style.setProperty("--ink", ink.toFixed(4));
  // 1 where text and wall are closest, 0 at both ends — a soft halo for
  // the moment they pass, kept small so it never flashes as a third colour.
  root.style.setProperty("--veil", (4 * ink * (1 - ink)).toFixed(4));
  const scheme = pos > 0.6 ? "dark" : "light";
  if (root.style.colorScheme !== scheme) root.style.colorScheme = scheme;
}

function paint(pos: number, vel: number) {
  applyEnvironment(pos);
  if (!target) return;
  // 0 at the lip, 1 at the sill: the cloth, the rail and the tab all ride it
  target.style.setProperty("--hem", pos.toFixed(4));
  // the pull swings against the direction of travel
  target.style.setProperty(
    "--tilt",
    `${clamp(-vel * 7, -10, 10).toFixed(2)}deg`,
  );
  // the frames overlap rather than queue, so the sky is never holding still
  target.style.setProperty(
    "--day-a",
    (1 - smoothstep(0.02, 0.58, pos)).toFixed(4),
  );
  target.style.setProperty(
    "--dusk-a",
    (1 - smoothstep(0.36, 0.98, pos)).toFixed(4),
  );
}

/* ───────────────────────────── physics ─────────────────────────────
   The blind is simulated as a small mass on a roller:
   · grab   → it follows the hand through a stiff spring (a hint of weight)
   · release → it keeps its momentum and coasts against roller friction
   · seek   → a soft spring carries it to a target (taps, keys, snaps)
   · stops  → it lands on the top/bottom stop with a small damped bounce
*/

type Mode = "idle" | "grab" | "coast" | "seek";

const sim = {
  mode: "idle" as Mode,
  pos: 0,
  vel: 0,
  target: 0,
  raf: 0,
  last: 0,
  lastInput: 0,
  hitStop: false,
  onRest: null as null | ((pos: number) => void),
};

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function publish(settled = false) {
  paint(sim.pos, sim.vel);
  const known = useShadeStore.getState().shade;
  // React hears about it only when the number on screen would change
  if (settled || Math.round(known * 100) !== Math.round(sim.pos * 100)) {
    useShadeStore.setState({ shade: sim.pos });
  }
}

function stops() {
  // end stops: clamp and bounce a little, click once on a firm landing
  if (sim.pos <= 0 || sim.pos >= 1) {
    const edge = sim.pos <= 0 ? 0 : 1;
    const into = edge === 0 ? sim.vel < 0 : sim.vel > 0;
    sim.pos = edge;
    if (into) {
      if (Math.abs(sim.vel) > 0.45 && !sim.hitStop) {
        playShadeClick();
        sim.hitStop = true;
      }
      sim.vel = Math.abs(sim.vel) > 0.35 ? -sim.vel * 0.22 : 0;
    }
  }
}

function step(now: number) {
  const dt = Math.min(0.034, (now - sim.last) / 1000 || 0.016);
  sim.last = now;

  // A hand that has gone quiet this long is a pointer-up we never heard: a
  // lost capture, a browser gesture, a tab switch. Let the blind settle
  // instead of holding the frame loop open for the rest of the session.
  if (sim.mode === "grab" && now - sim.lastInput > 2000) {
    sim.mode = "coast";
    sim.vel = 0;
    useShadeStore.setState({ dragging: false });
  }

  if (sim.mode === "grab") {
    // stiff, slightly under-damped follow
    const k = 520;
    const c = 2 * Math.sqrt(k) * 0.82;
    sim.vel += (k * (sim.target - sim.pos) - c * sim.vel) * dt;
    sim.pos += sim.vel * dt;
    sim.pos = clamp(sim.pos, 0, 1);
  } else if (sim.mode === "coast") {
    sim.vel *= Math.exp(-dt * 3.2); // roller friction
    if (Math.abs(sim.vel) < 0.045) sim.vel = 0; // static friction: it stops, it doesn't creep
    sim.pos += sim.vel * dt;
    stops();
  } else if (sim.mode === "seek") {
    const k = 95;
    const c = 2 * Math.sqrt(k) * 0.86;
    sim.vel += (k * (sim.target - sim.pos) - c * sim.vel) * dt;
    sim.pos += sim.vel * dt;
    stops();
  }

  publish();

  const settled =
    sim.mode !== "grab" &&
    Math.abs(sim.vel) < 0.004 &&
    (sim.mode === "coast" || Math.abs(sim.target - sim.pos) < 0.0015);

  if (settled) {
    if (sim.mode === "seek") sim.pos = sim.target;
    sim.vel = 0;
    sim.mode = "idle";
    publish(true);
    sim.raf = 0;
    const cb = sim.onRest;
    sim.onRest = null;
    cb?.(sim.pos);
    return;
  }
  sim.raf = requestAnimationFrame(step);
}

function run() {
  sim.pos = useShadeStore.getState().shade;
  if (!sim.raf) {
    sim.last = performance.now();
    sim.raf = requestAnimationFrame(step);
  }
}

export function cancelShadeAnimation() {
  if (sim.raf) cancelAnimationFrame(sim.raf);
  sim.raf = 0;
  sim.mode = "idle";
  sim.vel = 0;
  sim.onRest = null;
}

/** Hand on the pull. */
export function grabShade() {
  sim.pos = useShadeStore.getState().shade;
  sim.mode = "grab";
  sim.target = sim.pos;
  sim.lastInput = performance.now();
  sim.hitStop = false;
  sim.onRest = null;
  if (reducedMotion()) return;
  run();
}

/** Where the hand wants the shade to be (may overshoot 0..1; the stops hold it). */
export function dragShadeTo(target: number) {
  sim.target = clamp(target, 0, 1);
  sim.lastInput = performance.now();
  if (reducedMotion()) {
    useShadeStore.getState().setShade(sim.target);
  }
}

/** Let go with the hand's velocity (shade units / second). */
export function releaseShade(velocity: number, onRest?: (pos: number) => void) {
  if (reducedMotion()) {
    const s = useShadeStore.getState().shade;
    onRest?.(s);
    return;
  }
  sim.mode = "coast";
  // blend the hand's speed with the blind's own momentum
  sim.vel = velocity * 0.75 + sim.vel * 0.25;
  sim.hitStop = false;
  sim.onRest = onRest ?? null;
  run();
}

/** Glide to a position on a soft spring. */
export function animateShadeTo(
  target: number,
  { click = true, persist = true }: { click?: boolean; persist?: boolean } = {},
) {
  const to = clamp(target, 0, 1);
  const from = useShadeStore.getState().shade;
  if (reducedMotion() || Math.abs(to - from) < 0.002) {
    useShadeStore.getState().setShade(to);
    if (persist) persistShade(to);
    if (click && Math.abs(to - from) > 0.04) playShadeClick();
    return;
  }
  sim.mode = "seek";
  sim.target = to;
  // only a travel all the way to a stop earns the click (fired by the stop)
  sim.hitStop = !click;
  sim.onRest = persist ? (p) => persistShade(p) : null;
  run();
}
