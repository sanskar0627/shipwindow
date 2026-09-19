import { useCallback, useEffect, useRef, useState } from "react";
import { voyage } from "@/data/content";
import { CompanyMark } from "./company-mark";

/**
 * Experience, plotted as a passage plan: the ship sits at the top, at today,
 * and a dotted course runs back down the chart through every berth behind it.
 *
 * The course is not a straight rule. A vessel making this passage boards off
 * the rhumb line and comes back to it, so the line eases out of the ship dead
 * straight, stands off one way, crosses back and closes the last waypoint on
 * the centre again — one easy S over the whole chart rather than a wiggle.
 *
 * Because the berths are text and text reflows, the geometry cannot be a
 * hard-coded path: the waypoints are measured from the rendered rows, and the
 * line is sampled from the same function that places them, so a ring always
 * sits exactly on the course no matter how the copy wraps.
 */

const AMP = 24; // how far off the centre line the course stands, at most
const STEP = 6; // px between samples along the course

/** t runs 0 (at the ship) → 1 (the far end of the chart) */
function courseX(t: number, amp: number) {
  // straight where it leaves the ship, and closed up again at the far end
  const settle = Math.min(1, t / 0.1);
  const close = Math.min(1, (1 - t) / 0.07);
  return Math.sin(t * Math.PI * 1.9) * amp * settle * close;
}

type Course = {
  w: number;
  h: number;
  cx: number;
  /** right edge of the rail column — where a spur hands off to the berth */
  rx: number;
  y0: number;
  ys: number[];
};

function ShipMark() {
  return (
    <svg className="ship-mark" viewBox="-8 -13 16 26" role="presentation">
      {/* a hull seen from above, fine bow to the top: heading into today */}
      <path
        className="ship-hull"
        d="M0 -12.4 C2.9 -8.4 4.6 -3.8 4.6 0.4 V8.2 Q4.6 9.9 2.9 9.9 H-2.9 Q-4.6 9.9 -4.6 8.2 V0.4 C-4.6 -3.8 -2.9 -8.4 0 -12.4 Z"
      />
      {/* deckhouse aft, and the foremast forward of it */}
      <path className="ship-house" d="M-2.4 1.4 H2.4 V5.8 H-2.4 Z" />
      <path className="ship-house" d="M-1.1 -4.6 H1.1 V-1.2 H-1.1 Z" />
    </svg>
  );
}

/** "01.2026" → "01", "Present" → "NOW" */
const month = (s: string) => (/^\d/.test(s) ? s.slice(0, 2) : "NOW");
const year = (s: string) => (/^\d/.test(s) ? s.slice(3) : "");

export function VoyageRoute() {
  const chartRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<HTMLSpanElement>(null);
  const pinRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [course, setCourse] = useState<Course | null>(null);

  const measure = useCallback(() => {
    const chart = chartRef.current;
    const start = startRef.current;
    if (!chart || !start) return;

    const box = chart.getBoundingClientRect();
    const head = start.getBoundingClientRect();
    const next: Course = {
      w: Math.round(box.width),
      h: Math.round(box.height),
      cx: head.left - box.left + head.width / 2,
      rx: head.right - box.left,
      y0: head.bottom - box.top + 10,
      ys: pinRefs.current.map((pin) => {
        if (!pin) return 0;
        const r = pin.getBoundingClientRect();
        return r.top - box.top + r.height / 2;
      }),
    };

    setCourse((prev) =>
      prev &&
      prev.w === next.w &&
      prev.h === next.h &&
      prev.cx === next.cx &&
      prev.rx === next.rx &&
      prev.y0 === next.y0 &&
      prev.ys.every((y, i) => y === next.ys[i])
        ? prev
        : next,
    );
  }, []);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(chart);
    // a late webfont reflows the rows without changing the chart's height
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [measure]);

  // the course ends a little past the last berth, the way a track runs on
  const y1 = course ? course.h - 4 : 0;
  const span = course ? Math.max(1, y1 - course.y0) : 1;
  // a narrow rail gets a correspondingly narrower board off the centre line
  const amp = course ? Math.min(AMP, (course.rx - course.cx) * 0.66) : 0;
  const atY = (y: number) =>
    course ? course.cx + courseX((y - course.y0) / span, amp) : 0;

  let path = "";
  if (course) {
    const pts: string[] = [];
    for (let y = course.y0; y < y1; y += STEP) {
      pts.push(`${atY(y).toFixed(1)} ${y.toFixed(1)}`);
    }
    pts.push(`${atY(y1).toFixed(1)} ${y1.toFixed(1)}`);
    path = `M${pts.join(" L")}`;
  }

  return (
    <section className="voyage" aria-labelledby="voyage-h">
      <header className="voyage-head">
        <h2 className="voyage-title" id="voyage-h">
          Experience
        </h2>
        <span className="voyage-rule" aria-hidden="true" />
      </header>

      <div className="chart" ref={chartRef}>
        {course && (
          <svg
            className="course"
            viewBox={`0 0 ${course.w} ${course.h}`}
            width={course.w}
            height={course.h}
            role="presentation"
            aria-hidden="true"
          >
            <defs>
              {/* the wake is freshest behind the ship and older further back */}
              <linearGradient
                id="vr-wake"
                x1="0"
                y1={course.y0}
                x2="0"
                y2={y1}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0" stopColor="#fff" />
                <stop offset="0.35" stopColor="#fff" stopOpacity="0.72" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.4" />
              </linearGradient>
              <mask id="vr-wakemask">
                <rect width={course.w} height={course.h} fill="url(#vr-wake)" />
              </mask>
            </defs>

            <g mask="url(#vr-wakemask)">
              <path
                className="course-line"
                d={path}
                fill="none"
                strokeWidth="1.2"
                strokeDasharray="1 7"
                strokeLinecap="round"
              />
            </g>

            {course.ys.map((y, i) => (
              <g
                key={i}
                className="course-point"
                data-current={voyage[i]?.current ? "true" : "false"}
              >
                {/* the short spur off the course to the berth it marks */}
                <line
                  className="course-spur"
                  x1={atY(y) + 8}
                  y1={y}
                  x2={course.rx - 4}
                  y2={y}
                  strokeWidth="1"
                  strokeDasharray="1 5"
                  strokeLinecap="round"
                />
                <circle
                  className="course-ring"
                  cx={atY(y)}
                  cy={y}
                  r="5.5"
                  fill="none"
                  strokeWidth="1.2"
                />
                <circle className="course-dot" cx={atY(y)} cy={y} r="1.9" />
              </g>
            ))}

            {/* where the track runs out */}
            <circle className="course-end" cx={atY(y1)} cy={y1} r="1.5" />
          </svg>
        )}

        <div className="chart-start">
          <span className="chart-when" />
          <span className="chart-pin" ref={startRef}>
            <ShipMark />
          </span>
          <span className="chart-label">Passage plan</span>
        </div>

        <ol className="log">
          {voyage.map((p, i) => (
            <li
              key={p.company}
              className="berth"
              data-current={p.current ? "true" : "false"}
            >
              <p className="berth-when">
                <span className="berth-leg">
                  {month(p.from)}
                  <span className="berth-arrow">›</span>
                  {month(p.to)}
                </span>
                <span className="berth-year">{year(p.from)}</span>
              </p>

              <span
                className="berth-pin"
                ref={(el) => {
                  pinRefs.current[i] = el;
                }}
                aria-hidden="true"
              />

              <div className="berth-body">
                <CompanyMark id={p.mark} name={p.company} />
                <h3 className="berth-company">
                  {p.company}
                  {p.current && <span className="berth-now">Current</span>}
                </h3>
                <p className="berth-role">{p.role}</p>
                <p className="berth-copy">{p.copy}</p>

                {p.cargo && (
                  <ul className="manifest">
                    {p.cargo.map((c) => (
                      <li key={c.name} className="cargo">
                        <span className="cargo-tile" aria-hidden="true">
                          <span />
                        </span>
                        <span className="cargo-text">
                          <span className="cargo-name">{c.name}</span>
                          <span className="cargo-copy">{c.copy}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
