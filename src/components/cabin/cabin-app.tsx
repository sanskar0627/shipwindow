import { useEffect } from "react";
import { identity } from "@/data/content";
import { persistShade, useShadeStore } from "@/store/shade";
import { FlightPlan } from "./flight-plan";
import { IdentityPlaque } from "./identity-plaque";
import { InstrumentCluster } from "./instrument-cluster";
import { WindowShade } from "./window-shade";

export function CabinApp() {
  const shade = useShadeStore((s) => s.shade);
  const hydrate = useShadeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--shade", shade.toFixed(4));
    root.style.colorScheme = shade > 0.52 ? "dark" : "light";
    persistShade(shade);
  }, [shade]);

  return (
    <div className="cabin">
      <div className="cabin-glow" aria-hidden="true" />
      <div className="cabin-grain" aria-hidden="true" />
      <IdentityPlaque />

      <main className="cabin-main">
        <WindowShade />
        <InstrumentCluster />

        <header className="hero">
          <h1 className="hero-title">{identity.role}</h1>
          <p className="hero-blurb">{identity.blurb}</p>
        </header>

        <FlightPlan />
      </main>

      <footer className="cabin-footer">
        <p>Window Seat · The shade is the sun</p>
        <p>Available for select collaborations</p>
      </footer>
    </div>
  );
}
