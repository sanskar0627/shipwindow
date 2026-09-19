import { voyage } from "@/data/content";

/**
 * Experience drawn as a chart course: a dotted route climbing from left to
 * right, a waypoint for each berth, and the ship sitting at today's position.
 * Below 720px the same course runs vertically down the left margin.
 */

// waypoint coordinates sit exactly on the route path below
const WAYPOINTS = [
  { x: 22, y: 102 },
  { x: 556, y: 60 },
];
const ROUTE =
  "M0 103 C 90 99 140 95 200 90 C 300 82 420 72 556 60 C 700 48 860 34 1000 24";

export function VoyageRoute() {
  return (
    <section className="voyage" aria-labelledby="voyage-h">
      <header className="voyage-head">
        <h2 className="kicker" id="voyage-h">
          Experience
        </h2>
        <span className="voyage-rule" aria-hidden="true" />
      </header>

      <svg
        className="voyage-chart"
        viewBox="0 0 1000 130"
        role="presentation"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="vr-fade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" />
            <stop offset="0.04" stopColor="#fff" />
            <stop offset="0.88" stopColor="#fff" />
            <stop offset="1" stopColor="#000" />
          </linearGradient>
          <mask id="vr-mask">
            <rect x="0" y="0" width="1000" height="130" fill="url(#vr-fade)" />
          </mask>
        </defs>

        <g mask="url(#vr-mask)">
          <path
            className="vr-line"
            d={ROUTE}
            fill="none"
            strokeWidth="1.2"
            strokeDasharray="1 7"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </g>

        {WAYPOINTS.map((w, i) => (
          <g
            key={i}
            className="vr-point"
            data-current={i === WAYPOINTS.length - 1}
          >
            {/* riser down to the berth it marks */}
            <line
              className="vr-riser"
              x1={w.x}
              y1={w.y + 7}
              x2={w.x}
              y2="128"
              strokeWidth="1"
              strokeDasharray="1 5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <circle
              className="vr-ring"
              cx={w.x}
              cy={w.y}
              r="5.5"
              fill="none"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
            <circle className="vr-dot" cx={w.x} cy={w.y} r="1.9" />
          </g>
        ))}

        {/* today: under way, a little past the last waypoint */}
        <g transform="translate(757 42) rotate(-4.6) scale(1.3)">
          <g className="vr-ship">
            <path
              className="vr-wake"
              d="M-26 5.5 h7 M-38 5.5 h5 M-48 5.5 h3.5"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
            <path className="vr-hull" d="M-11 1.5 H11 L8.2 6.4 H-8.2 Z" />
            <path className="vr-deck" d="M-3.6 -3.6 H3 V1.5 H-3.6 Z" />
            <path
              className="vr-mast"
              d="M-0.4 -3.6 V-8"
              strokeWidth="1"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </g>
        </g>
      </svg>

      <ol className="voyage-log">
        {voyage.map((p) => (
          <li
            key={p.company}
            className="berth"
            data-current={p.current ? "true" : "false"}
          >
            <p className="berth-dates">
              <span className="berth-mark" aria-hidden="true" />
              {p.from} — {p.to}
            </p>
            <h3 className="berth-company">{p.company}</h3>
            <p className="berth-role">{p.role}</p>
            <p className="berth-copy">{p.copy}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
