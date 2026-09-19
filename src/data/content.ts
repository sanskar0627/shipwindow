export const identity = {
  name: "Sanskar Shukla",
  city: "Bermuda Triangle",
  lat: "25.0000° N",
  lng: "71.0000° W",
  tz: "Atlantic/Bermuda",
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

/** What was carried on a given leg — the work itself, one line each. */
export type Cargo = {
  name: string;
  copy: string;
};

export type Port = {
  company: string;
  /** picks the drawn mark in <CompanyMark>; falls back to a monogram */
  mark: "senzary" | "m81";
  role: string;
  from: string;
  to: string;
  current?: boolean;
  copy: string;
  cargo?: Cargo[];
};

/**
 * The course, plotted newest first: the ship is at the top of the chart, at
 * today, and the line runs back down through the berths behind it.
 */
export const voyage: Port[] = [
  {
    company: "Senzary",
    mark: "senzary",
    role: "Software Developer",
    from: "01.2026",
    to: "Present",
    current: true,
    copy: "Production IoT infrastructure: device pipelines, rule chains and the services that keep a fleet of sensors reporting.",
    cargo: [
      {
        name: "Device pipelines",
        copy: "Telemetry from the sensor to the dashboard, without gaps",
      },
      {
        name: "Rule chains",
        copy: "Thresholds, alerts and automations running on live fleet data",
      },
    ],
  },
  {
    company: "M81",
    mark: "m81",
    role: "Full-Stack Developer",
    from: "07.2026",
    to: "12.2026",
    copy: "Client websites and internal automation tools, taken end to end from data model to the last pixel.",
    cargo: [
      {
        name: "Client websites",
        copy: "Shipped end to end, from the data model to the last pixel",
      },
      {
        name: "Internal automation",
        copy: "Tooling that took the repetitive work off the team's desk",
      },
    ],
  },
];
