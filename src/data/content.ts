export const identity = {
  name: "Nia Solis",
  city: "Lisbon, PT",
  lat: "38.7223° N",
  lng: "9.1393° W",
  tz: "Europe/Lisbon",
  role: "Software Designer & Creative Technologist",
  blurb:
    "Pushing pixels for 8 years with an engineering mindset, obsessing over the details and the why behind great products.",
};

export type Project = {
  name: string;
  tag: string;
  image: string;
};

export type FlightStop = {
  year: string;
  route: string;
  company: string;
  current?: boolean;
  title: string;
  copy: string;
  mark: "atelier" | "northstar" | "independent" | "origin";
  projects?: Project[];
};

export const flightPlan: FlightStop[] = [
  {
    year: "2025",
    route: "LIS → SFO",
    company: "Atelier",
    current: true,
    title: "Lead Product Designer",
    copy: "Lisbon-born, San Francisco-based product studio. Leading end-to-end product and brand work across mobile and web, shipping to millions of people.",
    mark: "atelier",
    projects: [
      {
        name: "Apex",
        tag: "Wildlife tracking products driving conservation efforts worldwide",
        image: "/work/apex.jpg",
      },
      {
        name: "Meridian",
        tag: "Private banking, rebuilt as a quiet instrument",
        image: "/work/meridian.jpg",
      },
      {
        name: "Folio",
        tag: "An independent magazine on making things slowly",
        image: "/work/folio.jpg",
      },
    ],
  },
  {
    year: "2022",
    route: "BCN",
    company: "Northstar",
    title: "Senior Product Designer",
    copy: "Design systems and product architecture for a European fintech. Shipped the card, the ledger, and the 2 a.m. support flow.",
    mark: "northstar",
  },
  {
    year: "2019",
    route: "BER",
    company: "Independent",
    title: "Design Engineer",
    copy: "A three-year stretch of prototypes, editorial sites, and odd commissions — learning to make interfaces that feel like objects.",
    mark: "independent",
  },
  {
    year: "2017",
    route: "CPT",
    company: "First flight",
    title: "Junior Product Designer",
    copy: "The first boarding pass. Interfaces, icon sets, and the habit of asking why before how.",
    mark: "origin",
  },
];
