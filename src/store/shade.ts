import { create } from "zustand";
import { clamp } from "@/lib/utils";
import { playShadeClick } from "@/lib/shade-audio";

const STORAGE_KEY = "porthole-shade";

type ShadeState = {
  /** 0 = fully raised (day), 1 = fully lowered (night) */
  shade: number;
  /** shade units per second, for motion-driven details (the swinging pull) */
  velocity: number;
  dragging: boolean;
  hydrated: boolean;
  setShade: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  hydrate: () => void;
};

export const useShadeStore = create<ShadeState>((set) => ({
  shade: 0,
  velocity: 0,
  dragging: false,
  hydrated: false,
  setShade: (value) => set({ shade: clamp(value, 0, 1) }),
  setDragging: (dragging) => set({ dragging }),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          set({ shade: clamp(n, 0, 1), hydrated: true });
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
  hitStop: false,
  onRest: null as null | ((pos: number) => void),
};

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function publish() {
  useShadeStore.setState({ shade: sim.pos, velocity: sim.vel });
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
    publish();
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
  sim.hitStop = false;
  sim.onRest = null;
  if (reducedMotion()) return;
  run();
}

/** Where the hand wants the shade to be (may overshoot 0..1; the stops hold it). */
export function dragShadeTo(target: number) {
  sim.target = clamp(target, 0, 1);
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
