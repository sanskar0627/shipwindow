import { useEffect, useState } from "react";
import { identity } from "@/data/content";

function useIdentityClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: identity.tz,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(now);

  const tz =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: identity.tz,
      timeZoneName: "shortOffset",
      hour: "numeric",
    })
      .formatToParts(now)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT+1";

  return { time, tz };
}

export function IdentityPlaque() {
  const { time, tz } = useIdentityClock();

  return (
    <aside className="plaque">
      <span className="plaque-rule" aria-hidden="true" />
      <p className="plaque-name">{identity.name}</p>
      <p className="plaque-line">{identity.city}</p>
      <p className="plaque-line">
        {identity.lat}
        <span className="plaque-dot">,</span>
        {identity.lng}
      </p>
      <p className="plaque-line plaque-clock">
        <span>{tz.replace("GMT", "UTC")}</span>
        <span className="plaque-time">{time}</span>
      </p>
    </aside>
  );
}
