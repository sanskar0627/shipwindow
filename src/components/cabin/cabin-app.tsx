import { useEffect } from "react";
import { identity } from "@/data/content";
import { smoothstep } from "@/lib/utils";
import { useShadeStore } from "@/store/shade";
import { IdentityPlaque } from "./identity-plaque";
import { InstrumentCluster } from "./instrument-cluster";
import { ShipWindow } from "./ship-window";

export function CabinApp() {
  const shade = useShadeStore((s) => s.shade);
  const hydrate = useShadeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--shade", shade.toFixed(4));

    // One long S across the whole travel, so the room is always changing
    // rather than sitting in a day, dusk or night preset.
    const tone = smoothstep(0.02, 0.98, shade);

    // Golden hour is a wide, quiet bell the light drifts through — it warms
    // the room before it goes cool, and never arrives as its own scene.
    const dusk = Math.exp(-(((shade - 0.46) / 0.34) ** 2));

    // Type has to change value somewhere or dark letters vanish on a dark
    // wall. It happens late and slowly, once the wall is already under the
    // words, so the flip reads as light leaving rather than a repaint.
    const ink = smoothstep(0.4, 0.74, shade);

    root.style.setProperty("--tone", tone.toFixed(4));
    root.style.setProperty("--dusk", dusk.toFixed(4));
    root.style.setProperty("--night", smoothstep(0.58, 1, shade).toFixed(4));
    root.style.setProperty("--ink", ink.toFixed(4));
    // 1 where text and wall are closest, 0 at both ends — a soft halo for
    // the moment they pass, kept small so it never flashes as a third colour.
    root.style.setProperty("--veil", (4 * ink * (1 - ink)).toFixed(4));
    root.style.colorScheme = shade > 0.6 ? "dark" : "light";
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
