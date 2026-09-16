import { clamp, smoothstep } from "@/lib/utils";

/**
 * One continuous light model for the whole site.
 * shade 0 → early-afternoon sun over open water
 * shade ~0.5 → sun touching the horizon
 * shade 1 → moonlit night
 * The porthole scene, the wall caustics and every CSS token read from this.
 */

export type RGB = [number, number, number];

const hex = (h: string): RGB => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

type Key = {
  t: number;
  skyTop: RGB;
  skyMid: RGB;
  skyHor: RGB;
  seaHor: RGB;
  seaDeep: RGB;
  haze: RGB;
  cloud: RGB;
  sun: RGB;
};

const k = (
  t: number,
  skyTop: string,
  skyMid: string,
  skyHor: string,
  seaHor: string,
  seaDeep: string,
  haze: string,
  cloud: string,
  sun: string,
): Key => ({
  t,
  skyTop: hex(skyTop),
  skyMid: hex(skyMid),
  skyHor: hex(skyHor),
  seaHor: hex(seaHor),
  seaDeep: hex(seaDeep),
  haze: hex(haze),
  cloud: hex(cloud),
  sun: hex(sun),
});

const KEYS: Key[] = [
  k(
    0,
    "#3f7fc0",
    "#7fb2dd",
    "#d7eaf3",
    "#8fb4cb",
    "#1c4a6e",
    "#f4fbff",
    "#ffffff",
    "#fffdf2",
  ),
  k(
    0.3,
    "#4a7db6",
    "#8fb0cf",
    "#efe4d2",
    "#a7b2b6",
    "#244565",
    "#fff3df",
    "#fbf4ea",
    "#fff1cf",
  ),
  k(
    0.5,
    "#2f3f72",
    "#9a6f8a",
    "#f59a5e",
    "#d98c62",
    "#2a2f4d",
    "#ffc48a",
    "#f2a07a",
    "#ffc27a",
  ),
  k(
    0.64,
    "#161f45",
    "#3d3f6e",
    "#8a6a8c",
    "#5a5474",
    "#151a33",
    "#b69ab4",
    "#5b577c",
    "#ff8a4f",
  ),
  k(
    0.8,
    "#070b1c",
    "#111a38",
    "#26315a",
    "#1d2644",
    "#070a16",
    "#3a4670",
    "#2a3252",
    "#ff8a4f",
  ),
  k(
    1,
    "#02040b",
    "#070c1c",
    "#131d3a",
    "#10172d",
    "#020309",
    "#212c4d",
    "#151b31",
    "#ff8a4f",
  ),
];

const mixC = (a: RGB, b: RGB, t: number): RGB => [
  a[0] + (b[0] - a[0]) * t,
  a[1] + (b[1] - a[1]) * t,
  a[2] + (b[2] - a[2]) * t,
];

export const rgba = (c: RGB, a = 1) =>
  `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a.toFixed(3)})`;

export type SeaLight = {
  t: number;
  skyTop: RGB;
  skyMid: RGB;
  skyHor: RGB;
  seaHor: RGB;
  seaDeep: RGB;
  haze: RGB;
  cloud: RGB;
  sunColor: RGB;
  sunX: number;
  sunY: number;
  sunVisible: number;
  glitter: number;
  moon: number;
  moonX: number;
  moonY: number;
  stars: number;
  caustic: number;
  day: number;
  dusk: number;
  night: number;
  amb: RGB;
  ambA: number;
  phase: string;
  shipTime: string;
  lux: string;
};

const DAY_AMB: RGB = [255, 243, 222];
const DUSK_AMB: RGB = [255, 150, 92];
const NIGHT_AMB: RGB = [126, 152, 255];

export function seaLight(shade: number): SeaLight {
  const t = clamp(shade, 0, 1);

  let i = 0;
  while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const u = smoothstep(0, 1, (t - a.t) / (b.t - a.t));
  const m = (key: keyof Omit<Key, "t">) => mixC(a[key], b[key], u);

  const sunProgress = clamp(t / 0.68, 0, 1);
  const dusk = Math.exp(-(((t - 0.5) / 0.13) ** 2));
  const day = 1 - smoothstep(0.15, 0.55, t);
  const night = smoothstep(0.55, 0.85, t);
  const moon = smoothstep(0.6, 0.86, t);

  let amb = mixC(DAY_AMB, DUSK_AMB, clamp(dusk * 1.2, 0, 1));
  amb = mixC(amb, NIGHT_AMB, night);

  const minutes = Math.round(12 * 60 + 40 + t * 660);
  const hh = String(Math.floor(minutes / 60) % 24).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");

  const luxN = 1000 * (1 - t) ** 2.4 + 0.3 * moon;
  const lux = luxN >= 10 ? String(Math.round(luxN)) : luxN.toFixed(1);

  const phase =
    t < 0.22
      ? "Daylight"
      : t < 0.42
        ? "Afternoon"
        : t < 0.6
          ? "Golden hour"
          : t < 0.78
            ? "Blue hour"
            : "Night";

  return {
    t,
    skyTop: m("skyTop"),
    skyMid: m("skyMid"),
    skyHor: m("skyHor"),
    seaHor: m("seaHor"),
    seaDeep: m("seaDeep"),
    haze: m("haze"),
    cloud: m("cloud"),
    sunColor: m("sun"),
    sunX: 0.4 + 0.12 * t,
    sunY: 0.14 + 0.58 * sunProgress ** 1.25,
    sunVisible: 1 - smoothstep(0.58, 0.7, t),
    glitter: 1 - smoothstep(0.5, 0.62, t),
    moon,
    moonX: 0.7,
    moonY: 0.36 - 0.12 * moon,
    stars: smoothstep(0.64, 0.95, t),
    caustic: 1 - smoothstep(0.05, 0.62, t),
    day,
    dusk,
    night,
    amb,
    ambA: clamp(0.5 * day + 0.42 * dusk + 0.2 * night, 0, 0.6),
    phase,
    shipTime: `${hh}:${mm}`,
    lux,
  };
}
