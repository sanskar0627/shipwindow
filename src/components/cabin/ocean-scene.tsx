import { useEffect, useRef } from "react";
import { rgba, seaLight, type RGB, type SeaLight } from "@/lib/sea-light";
import { useShadeStore } from "@/store/shade";

const hash = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};

type Star = { x: number; y: number; r: number; p: number };

const STARS: Star[] = Array.from({ length: 110 }, (_, i) => ({
  x: hash(i * 3.1),
  y: hash(i * 7.7) ** 1.4,
  r: 0.35 + hash(i * 1.3) * 0.85,
  p: hash(i * 9.1) * Math.PI * 2,
}));

const CLOUDS = [
  { x: 0.08, y: 0.3, w: 0.34, h: 0.035, a: 0.55, v: 3.2 },
  { x: 0.55, y: 0.44, w: 0.46, h: 0.028, a: 0.5, v: 2.1 },
  { x: 0.82, y: 0.2, w: 0.22, h: 0.03, a: 0.35, v: 4.4 },
  { x: 0.3, y: 0.62, w: 0.6, h: 0.02, a: 0.55, v: 1.4 },
  { x: 0.7, y: 0.76, w: 0.5, h: 0.018, a: 0.6, v: 1.1 },
];

const MOON_GLINT: RGB = [226, 232, 255];

function drawScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dpr: number,
  L: SeaLight,
  time: number,
  still: boolean,
) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  ctx.globalAlpha = 1;

  // the ship rolls, very gently
  const roll = still
    ? 0
    : Math.sin(time * 0.32) * 0.013 + Math.sin(time * 0.13) * 0.006;
  const bob = still ? 0 : Math.sin(time * 0.41) * h * 0.006;

  ctx.save();
  ctx.translate(w / 2, h / 2 + bob);
  ctx.rotate(roll);
  ctx.translate(-w / 2, -h / 2);

  const m = w * 0.14;
  const X0 = -m;
  const X1 = w + m;
  const Y0 = -m;
  const Y1 = h + m;
  const W = X1 - X0;
  const hor = h * 0.56;

  // sky
  let g = ctx.createLinearGradient(0, Y0, 0, hor);
  g.addColorStop(0, rgba(L.skyTop));
  g.addColorStop(0.55, rgba(L.skyMid));
  g.addColorStop(1, rgba(L.skyHor));
  ctx.fillStyle = g;
  ctx.fillRect(X0, Y0, W, hor - Y0 + 1);

  // stars
  if (L.stars > 0.01) {
    ctx.fillStyle = "#ffffff";
    for (const s of STARS) {
      const tw = still ? 0.8 : 0.55 + 0.45 * Math.sin(time * 1.4 + s.p);
      ctx.globalAlpha = L.stars * tw * (0.4 + 0.6 * (1 - s.y));
      ctx.beginPath();
      ctx.arc(X0 + s.x * W, Y0 + s.y * (hor - Y0) * 0.92, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // sun
  const sx = L.sunX * w;
  const sy = L.sunY * h;
  const sr = w * 0.046;
  if (L.sunVisible > 0.01) {
    g = ctx.createRadialGradient(sx, sy, 0, sx, sy, w * 0.6);
    g.addColorStop(0, rgba(L.sunColor, 0.6 * L.sunVisible));
    g.addColorStop(0.18, rgba(L.sunColor, 0.22 * L.sunVisible));
    g.addColorStop(1, rgba(L.sunColor, 0));
    ctx.fillStyle = g;
    ctx.fillRect(X0, Y0, W, hor - Y0);
    ctx.globalAlpha = L.sunVisible;
    ctx.fillStyle = rgba(L.sunColor);
    ctx.shadowColor = rgba(L.sunColor, 0.9);
    ctx.shadowBlur = sr * 1.2;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // moon
  const mx = L.moonX * w;
  const my = L.moonY * h;
  if (L.moon > 0.01) {
    const mr = w * 0.028;
    g = ctx.createRadialGradient(mx, my, 0, mx, my, w * 0.34);
    g.addColorStop(0, `rgba(200,212,255,${0.22 * L.moon})`);
    g.addColorStop(1, "rgba(200,212,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(X0, Y0, W, hor - Y0);
    ctx.globalAlpha = L.moon;
    ctx.fillStyle = "#f1efe8";
    ctx.shadowColor = "rgba(220,228,255,.8)";
    ctx.shadowBlur = mr * 1.4;
    ctx.beginPath();
    ctx.arc(mx, my, mr, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // soft terminator for a waxing gibbous
    ctx.globalAlpha = L.moon * 0.35;
    ctx.fillStyle = rgba(L.skyTop);
    ctx.beginPath();
    ctx.arc(mx - mr * 0.55, my - mr * 0.1, mr * 0.92, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  // clouds: long, thin marine layers
  for (const c of CLOUDS) {
    const span = W + c.w * w * 2;
    const cx =
      X0 -
      c.w * w +
      ((((c.x * span + (still ? 0 : time * c.v)) % span) + span) % span);
    const cy = c.y * hor;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(c.w / c.h, 1);
    const r = c.h * h * 1.8;
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, r);
    const a = c.a * (0.75 - L.night * 0.35);
    cg.addColorStop(0, rgba(L.cloud, a));
    cg.addColorStop(0.5, rgba(L.cloud, a * 0.45));
    cg.addColorStop(1, rgba(L.cloud, 0));
    ctx.fillStyle = cg;
    ctx.fillRect(-r, -r, r * 2, r * 2);
    ctx.restore();
  }

  // horizon haze
  g = ctx.createLinearGradient(0, hor - h * 0.12, 0, hor);
  g.addColorStop(0, rgba(L.haze, 0));
  g.addColorStop(1, rgba(L.haze, 0.42 - L.night * 0.2));
  ctx.fillStyle = g;
  ctx.fillRect(X0, hor - h * 0.12, W, h * 0.12);

  // sea body
  g = ctx.createLinearGradient(0, hor, 0, Y1);
  g.addColorStop(0, rgba(L.seaHor));
  g.addColorStop(0.35, rgba(L.seaDeep, 1));
  g.addColorStop(1, rgba(L.seaDeep));
  ctx.fillStyle = g;
  ctx.fillRect(X0, hor, W, Y1 - hor);

  // broad reflection columns
  const column = (x: number, color: RGB, a: number) => {
    ctx.save();
    ctx.translate(x, hor);
    ctx.scale(0.28, 1);
    const cg = ctx.createRadialGradient(0, 0, 0, 0, 0, h * 0.6);
    cg.addColorStop(0, rgba(color, a));
    cg.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = cg;
    ctx.fillRect(-h * 0.6, 0, h * 1.2, h * 0.6);
    ctx.restore();
  };
  if (L.glitter > 0.01) column(sx, L.sunColor, 0.38 * L.glitter);
  if (L.moon > 0.01) column(mx, MOON_GLINT, 0.16 * L.moon);

  // wave field: dashes in perspective, glitter where light hits
  const sources: { x: number; a: number; c: string }[] = [];
  if (L.glitter > 0.01)
    sources.push({ x: sx, a: L.glitter, c: rgba(L.sunColor) });
  if (L.moon > 0.01)
    sources.push({ x: mx, a: L.moon * 0.75, c: rgba(MOON_GLINT) });

  const crest = rgba(L.haze);
  const trough = rgba(L.seaDeep);
  const N = 30;
  const tt = still ? 0 : time;
  for (let r = 0; r < N; r++) {
    const p = (r + 0.5) / N;
    const y0 = hor + (Y1 - hor) * p ** 1.9;
    const len = 1.5 + 30 * p;
    const thick = 0.5 + 2.4 * p;
    const spacing = len * (2.3 + hash(r) * 1.1);
    const speed = (4 + 20 * p) * (r % 2 ? 1 : -1);
    const off = hash(r * 13.7) * spacing + tt * speed;
    const base = Math.floor(off / spacing);
    const frac = off - base * spacing;
    const count = Math.ceil(W / spacing) + 2;
    const y = y0 + Math.sin(tt * 0.9 + r) * thick * 0.7;
    const crestA = (0.05 + 0.12 * p) * (1 - L.night * 0.55);
    const spread = w * (0.018 + 0.2 * p);

    for (let kk = 0; kk < count; kk++) {
      const id = kk - base;
      const jitter = (hash(id * 1.7 + r * 31.1) - 0.5) * spacing * 0.6;
      const x = X0 + kk * spacing + frac - spacing + jitter;
      const l = len * (0.6 + hash(id * 3.3 + r) * 0.8);

      ctx.globalAlpha = 0.28 * p;
      ctx.fillStyle = trough;
      ctx.fillRect(x, y + thick * 0.6, l, thick);

      ctx.globalAlpha = crestA * (0.5 + hash(id * 5.1 + r * 2.2));
      ctx.fillStyle = crest;
      ctx.fillRect(x, y - thick * 0.5, l, thick * 0.7);

      for (const s of sources) {
        const d = (x + l / 2 - s.x) / spread;
        const gg = Math.exp(-d * d);
        if (gg < 0.03) continue;
        const tw = still
          ? 0.7
          : Math.sin(tt * (2.2 + hash(id + r) * 2.4) + id * 1.3 + r * 0.7);
        if (tw < 0.15) continue;
        ctx.globalAlpha = Math.min(1, gg * s.a * (tw - 0.15) * 1.35);
        ctx.fillStyle = s.c;
        ctx.fillRect(x, y - thick, l, thick * 1.3);
      }
    }
  }
  ctx.globalAlpha = 1;

  // crisp horizon
  ctx.fillStyle = rgba(L.haze, 0.35 - L.night * 0.15);
  ctx.fillRect(X0, hor - 0.5, W, 1);

  ctx.restore();
}

export function OceanScene({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = true;
    const t0 = performance.now();

    const paint = (now: number) => {
      if (!w || !h) return;
      const L = seaLight(useShadeStore.getState().shade);
      drawScene(ctx, w, h, dpr, L, (now - t0) / 1000, still);
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.round(w * dpr));
      canvas.height = Math.max(1, Math.round(h * dpr));
      paint(performance.now());
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const loop = (now: number) => {
      raf = 0;
      if (!visible || document.hidden) return;
      paint(now);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!still && !raf && visible && !document.hidden)
        raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      kick();
    });
    io.observe(canvas);
    document.addEventListener("visibilitychange", kick);

    const unsub = still
      ? useShadeStore.subscribe(() => paint(performance.now()))
      : () => {};
    kick();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", kick);
      unsub();
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
