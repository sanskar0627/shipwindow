import { useEffect } from "react";
import { identity } from "@/data/content";
import { seaLight } from "@/lib/sea-light";
import { smoothstep } from "@/lib/utils";
import { useShadeStore } from "@/store/shade";
import { BridgeReadout } from "./bridge-readout";
import { Porthole } from "./porthole";
import { SiteNav } from "./site-nav";
import { Contact, Passage, SelectedWork } from "./voyage-sections";

/** Pipe the light model into CSS so every surface responds continuously. */
function useEnvironment() {
  const shade = useShadeStore((s) => s.shade);
  const hydrate = useShadeStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    const L = seaLight(shade);
    const root = document.documentElement;
    root.style.setProperty("--shade", shade.toFixed(4));
    // surfaces darken on an S-curve; ink flips where the surface crosses mid-tone
    // (a double smoothstep keeps the low-contrast crossover brief)
    const tone = smoothstep(0, 1, smoothstep(0.2, 0.6, shade));
    root.style.setProperty("--tone", tone.toFixed(4));
    root.style.setProperty("--ink", smoothstep(0.37, 0.43, shade).toFixed(4));
    root.style.setProperty("--day", L.day.toFixed(4));
    root.style.setProperty("--dusk", L.dusk.toFixed(4));
    root.style.setProperty(
      "--warm",
      Math.exp(-(((shade - 0.4) / 0.2) ** 2)).toFixed(4),
    );
    root.style.setProperty("--night", L.night.toFixed(4));
    root.style.setProperty("--amb", L.amb.map((c) => c | 0).join(" "));
    root.style.setProperty("--amb-a", L.ambA.toFixed(3));
    root.style.setProperty("--sun-x", L.sunX.toFixed(4));
    root.style.setProperty("--sun-y", L.sunY.toFixed(4));
    root.style.colorScheme = shade > 0.4 ? "dark" : "light";
    root.dataset.theme = shade > 0.4 ? "dark" : "light";
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta)
      meta.setAttribute(
        "content",
        getComputedStyle(document.body).backgroundColor,
      );
  }, [shade]);
}

export function CabinApp() {
  useEnvironment();

  return (
    <div className="cabin" id="top">
      <div className="cabin-grain" aria-hidden="true" />
      <SiteNav />

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="kicker">
              {identity.role} · {identity.lat} {identity.lng}
            </p>
            <h1 className="hero-title">
              Open the window to daylight.
              <span className="hero-title-2">Close it to enter the night.</span>
            </h1>
            <p className="hero-blurb">{identity.blurb}</p>
            <div className="hero-actions">
              <a className="btn btn-primary" href="#work">
                View selected work
              </a>
              <a className="btn btn-ghost" href="#contact">
                Get in touch
              </a>
            </div>
            <BridgeReadout />
          </div>
          <Porthole />
        </section>

        <SelectedWork />
        <Passage />
        <Contact />
      </main>

      <footer className="footer">
        <span>© {identity.name}</span>
        <span>The shade is the switch</span>
      </footer>
    </div>
  );
}
