import { useEffect } from "react";
import { identity } from "@/data/content";
import { smoothstep } from "@/lib/utils";
import { useShadeStore } from "@/store/shade";
import { IdentityPlaque } from "./identity-plaque";
import { InstrumentCluster } from "./instrument-cluster";
import { ShipWindow } from "./ship-window";
import { VoyageRoute } from "./voyage-route";

export function CabinApp() {
  const shade = useShadeStore((s) => s.shade);
  const hydrate = useShadeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--shade", shade.toFixed(4));
    // The room darkens on an S-curve and the ink flips over a short span, so
    // text never sits on a same-tone background for long.
    const tone = smoothstep(0, 1, smoothstep(0.2, 0.6, shade));
    root.style.setProperty("--tone", tone.toFixed(4));
    root.style.setProperty("--ink", smoothstep(0.37, 0.43, shade).toFixed(4));
    root.style.setProperty(
      "--dusk",
      Math.exp(-(((shade - 0.45) / 0.18) ** 2)).toFixed(4),
    );
    root.style.setProperty("--night", smoothstep(0.55, 0.95, shade).toFixed(4));
    root.style.colorScheme = shade > 0.5 ? "dark" : "light";
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

        <VoyageRoute />
      </main>
    </div>
  );
}
