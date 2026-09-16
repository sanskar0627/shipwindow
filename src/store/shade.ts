import { create } from "zustand";
import { clamp } from "@/lib/utils";
import { playShadeClick } from "@/lib/shade-audio";

const STORAGE_KEY = "porthole-shade";

type ShadeState = {
  shade: number;
  dragging: boolean;
  touched: boolean;
  hydrated: boolean;
  setShade: (value: number) => void;
  setDragging: (dragging: boolean) => void;
  markTouched: () => void;
  hydrate: () => void;
};

export const useShadeStore = create<ShadeState>((set) => ({
  shade: 0,
  dragging: false,
  touched: false,
  hydrated: false,
  setShade: (value) => set({ shade: clamp(value, 0, 1) }),
  setDragging: (dragging) => set({ dragging }),
  markTouched: () => set({ touched: true }),
  hydrate: () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw != null) {
        const n = Number(raw);
        if (!Number.isNaN(n)) {
          set({ shade: clamp(n, 0, 1), hydrated: true, touched: true });
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

let raf: number | null = null;

export function cancelShadeAnimation() {
  if (raf != null) {
    cancelAnimationFrame(raf);
    raf = null;
  }
}

/** Glide the shade like a weighted roller blind. */
export function animateShadeTo(
  target: number,
  { click = true, persist = true }: { click?: boolean; persist?: boolean } = {},
) {
  cancelShadeAnimation();
  const { setShade } = useShadeStore.getState();
  const start = useShadeStore.getState().shade;
  const to = clamp(target, 0, 1);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const finish = () => {
    if (persist) persistShade(to);
    if (click && Math.abs(to - start) > 0.04) playShadeClick();
  };

  if (reduced || Math.abs(to - start) < 0.002) {
    setShade(to);
    finish();
    return;
  }

  const dist = Math.abs(to - start);
  const dur = 380 + dist * 620;
  const t0 = performance.now();
  // slight overshoot-free settle: fast start, long soft landing
  const ease = (x: number) => 1 - (1 - x) ** 4;
  const step = (now: number) => {
    const p = Math.min(1, (now - t0) / dur);
    setShade(start + (to - start) * ease(p));
    if (p < 1) {
      raf = requestAnimationFrame(step);
    } else {
      raf = null;
      finish();
    }
  };
  raf = requestAnimationFrame(step);
}
