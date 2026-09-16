import { useEffect, useRef } from "react";
import { seaLight } from "@/lib/sea-light";
import { useShadeStore } from "@/store/shade";

const RES = 96;

/**
 * Sunlight bouncing off the water onto the cabin wall.
 * Rendered tiny, then scaled and blurred by CSS so it reads as light, not pattern.
 */
export function WallCaustics() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    canvas.width = RES;
    canvas.height = RES;
    const img = ctx.createImageData(RES, RES);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t0 = performance.now();
    let raf = 0;
    let last = 0;
    let visible = true;

    const paint = (now: number) => {
      const L = seaLight(useShadeStore.getState().shade);
      const strength = L.caustic;
      canvas.style.opacity = strength.toFixed(3);
      if (strength < 0.01) return;
      const t = still ? 4 : (now - t0) / 1000;
      const [cr, cg, cb] = L.amb;
      const d = img.data;
      for (let y = 0; y < RES; y++) {
        for (let x = 0; x < RES; x++) {
          const dx = x - RES / 2;
          const dy = y - RES / 2;
          const v =
            Math.sin(x * 0.16 + t * 0.9) +
            Math.sin(y * 0.19 - t * 0.7) +
            Math.sin(x * 0.11 + y * 0.13 + t * 1.1) +
            Math.sin(Math.sqrt(dx * dx + dy * dy) * 0.21 - t * 0.8);
          let c = 1 - Math.abs(Math.sin(v * 1.35));
          c = c ** 7;
          const i = (y * RES + x) * 4;
          d[i] = cr;
          d[i + 1] = cg;
          d[i + 2] = cb;
          d[i + 3] = Math.min(255, c * 255);
        }
      }
      ctx.putImageData(img, 0, 0);
    };

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      if (now - last > 40) {
        last = now;
        paint(now);
      }
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!still && !raf && visible && !document.hidden)
        raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      kick();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", kick);
    paint(performance.now());
    const unsub = still
      ? useShadeStore.subscribe(() => paint(performance.now()))
      : () => {};
    kick();

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      unsub();
    };
  }, []);

  return <canvas ref={ref} className="caustics" aria-hidden="true" />;
}
