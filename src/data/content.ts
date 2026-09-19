export const identity = {
  name: "Sanskar Shukla",
  city: "Bengaluru, IN",
  lat: "12.9716° N",
  lng: "77.5946° E",
  tz: "Asia/Kolkata",
  role: "Software Developer & Designer",
  blurb:
    "I've been building software and digital experiences for the past year.",
};

/**
 * Photographs seen through the porthole. Real photography only: shot from a
 * ship's deck or cabin, horizon roughly at the vertical middle, ≥1200px on
 * the short side. Crossfaded by shade position.
 */
export const seaPhotos = {
  day: "/ocean/day.webp",
  dusk: "/ocean/dusk.webp",
  night: "/ocean/night.webp",
};

export type Port = {
  company: string;
  role: string;
  from: string;
  to: string;
  current?: boolean;
  copy: string;
};

/** In sailing order: the route reads left to right, the ship sits at today. */
export const voyage: Port[] = [
  {
    company: "M81",
    role: "Full-Stack Developer",
    from: "07.2026",
    to: "12.2026",
    copy: "Client websites and internal automation tools, taken end to end from data model to the last pixel.",
  },
  {
    company: "Senzary",
    role: "Software Developer",
    from: "01.2026",
    to: "Present",
    current: true,
    copy: "Production IoT infrastructure: device pipelines, rule chains and the services that keep a fleet of sensors reporting.",
  },
];
