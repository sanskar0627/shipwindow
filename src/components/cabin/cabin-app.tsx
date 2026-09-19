import { useEffect } from "react";
import { identity } from "@/data/content";
import { applyEnvironment, useShadeStore } from "@/store/shade";
import { IdentityPlaque } from "./identity-plaque";
import { InstrumentCluster } from "./instrument-cluster";
import { ShipWindow } from "./ship-window";

export function CabinApp() {
  const shade = useShadeStore((s) => s.shade);
  const hydrate = useShadeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // The simulation paints the room on every frame it runs; this keeps the
  // first paint, and any change that arrives without one, in step with it.
  useEffect(() => {
    applyEnvironment(shade);
  }, [shade]);

  return (
    <div className="cabin">
      <div className="cabin-glow" aria-hidden="true" />
      <div className="cabin-grain" aria-hidden="true" />
      <IdentityPlaque />

      <main className="cabin-main">
        <ShipWindow />
        <InstrumentCluster />

        <header className="hero">
          <h1 className="hero-title">{identity.role}</h1>
          <p className="hero-blurb">{identity.blurb}</p>
        </header>
      </main>
    </div>
  );
}
