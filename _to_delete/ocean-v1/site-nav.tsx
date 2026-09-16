import { useEffect, useState } from "react";
import { identity } from "@/data/content";
import { animateShadeTo, useShadeStore } from "@/store/shade";

function useClock(tz: string) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);
  if (!now) return "--:--";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
}

/** A second, tiny porthole: the same control, reachable from anywhere on the page. */
function MiniPorthole() {
  const shade = useShadeStore((s) => s.shade);
  const markTouched = useShadeStore((s) => s.markTouched);
  const night = shade >= 0.5;
  return (
    <button
      type="button"
      className="mini"
      aria-label={
        night ? "Raise the shade (light mode)" : "Lower the shade (dark mode)"
      }
      aria-pressed={night}
      onClick={() => {
        markTouched();
        animateShadeTo(night ? 0 : 1);
      }}
    >
      <span className="mini-label">{night ? "Night" : "Day"}</span>
      <span className="mini-port" aria-hidden="true">
        <span className="mini-glass">
          <span
            className="mini-shade"
            style={{ height: `${12 + shade * 78}%` }}
          />
        </span>
      </span>
    </button>
  );
}

export function SiteNav() {
  const time = useClock(identity.tz);
  return (
    <nav className="nav" aria-label="Primary">
      <div className="nav-inner">
        <a href="#top" className="nav-brand">
          <span className="nav-name">{identity.name}</span>
          <span className="nav-meta">
            {identity.cabin} · {identity.city} {time}
          </span>
        </a>
        <div className="nav-links">
          <a href="#work">Work</a>
          <a href="#passage">Passage</a>
          <a href="#contact">Contact</a>
        </div>
        <MiniPorthole />
      </div>
    </nav>
  );
}
