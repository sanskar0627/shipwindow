import { create } from "zustand";
import { clamp } from "@/lib/utils";

const STORAGE_KEY = "window-seat-shade";

type ShadeState = {
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
      /* ignore */
    }
    set({ hydrated: true });
  },
}));

export function persistShade(value: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    /* ignore */
  }
}
