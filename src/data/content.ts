export const identity = {
  name: "Nia Solis",
  cabin: "Cabin 07",
  city: "Lisbon",
  lat: "38.72° N",
  lng: "9.14° W",
  tz: "Europe/Lisbon",
  email: "hello@niasolis.studio",
  role: "Product designer & creative technologist",
  blurb:
    "Nia designs software that behaves like good objects: quiet, precise, and a little physical. Eight years across product studios, fintech and independent work.",
};

export type Project = {
  name: string;
  tag: string;
  year: string;
  image: string;
};

export const work: Project[] = [
  {
    name: "Apex",
    tag: "Field tools for wildlife tracking and conservation teams",
    year: "2025",
    image: "/work/apex.jpg",
  },
  {
    name: "Meridian",
    tag: "Private banking, rebuilt as a quiet instrument",
    year: "2024",
    image: "/work/meridian.jpg",
  },
  {
    name: "Folio",
    tag: "An independent magazine on making things slowly",
    year: "2023",
    image: "/work/folio.jpg",
  },
];

export type Port = {
  year: string;
  route: string;
  company: string;
  current?: boolean;
  title: string;
  copy: string;
};

export const passage: Port[] = [
  {
    year: "2025",
    route: "LIS → SFO",
    company: "Atelier",
    current: true,
    title: "Lead Product Designer",
    copy: "End-to-end product and brand work across mobile and web for a Lisbon-born, San Francisco-based studio, shipping to millions of people.",
  },
  {
    year: "2022",
    route: "BCN",
    company: "Northstar",
    title: "Senior Product Designer",
    copy: "Design systems and product architecture for a European fintech. The card, the ledger, and the 2 a.m. support flow.",
  },
  {
    year: "2019",
    route: "BER",
    company: "Independent",
    title: "Design Engineer",
    copy: "Three years of prototypes, editorial sites and odd commissions, learning to make interfaces that feel like objects.",
  },
  {
    year: "2017",
    route: "CPT",
    company: "First departure",
    title: "Junior Product Designer",
    copy: "Interfaces, icon sets, and the habit of asking why before how.",
  },
];
