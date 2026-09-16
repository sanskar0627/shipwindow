import { Plane } from "lucide-react";
import { flightPlan, type FlightStop } from "@/data/content";

function Mark({ kind }: { kind: FlightStop["mark"] }) {
  if (kind === "atelier") {
    return (
      <span className="mark mark-atelier" aria-hidden="true">
        <span className="mark-disc mark-disc-a" />
        <span className="mark-disc mark-disc-b" />
      </span>
    );
  }
  if (kind === "northstar") {
    return (
      <span className="mark mark-star" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="mark-svg">
          <path
            d="M12 2.5 L14.2 9.2 H21.2 L15.6 13.4 L17.8 20.2 L12 16 L6.2 20.2 L8.4 13.4 L2.8 9.2 H9.8 Z"
            fill="currentColor"
          />
        </svg>
      </span>
    );
  }
  if (kind === "independent") {
    return (
      <span className="mark mark-independent" aria-hidden="true">
        <span className="mark-slash" />
      </span>
    );
  }
  return (
    <span className="mark mark-origin" aria-hidden="true">
      <span className="mark-dot" />
    </span>
  );
}

export function FlightPlan() {
  return (
    <section className="flight" aria-labelledby="flight-heading">
      <div className="flight-head">
        <p className="flight-kicker" id="flight-heading">
          Flight plan
        </p>
        <span className="flight-plane" aria-hidden="true">
          <Plane className="flight-plane-icon" strokeWidth={1.75} />
        </span>
      </div>

      <ol className="flight-list">
        {flightPlan.map((stop) => (
          <li key={stop.year + stop.company} className="flight-stop">
            <div className="flight-meta">
              <span className="flight-route">{stop.route}</span>
              <span className="flight-year">{stop.year}</span>
            </div>
            <span className="flight-node" aria-hidden="true" />
            <div className="flight-body">
              <div className="flight-company-row">
                <Mark kind={stop.mark} />
                <h3 className="flight-company">
                  {stop.company}
                  {stop.current ? (
                    <span className="flight-current">Current</span>
                  ) : null}
                </h3>
              </div>
              <p className="flight-title">{stop.title}</p>
              <p className="flight-copy">{stop.copy}</p>
              {stop.projects ? (
                <ul className="project-list">
                  {stop.projects.map((project) => (
                    <li key={project.name} className="project">
                      <img
                        src={project.image}
                        alt=""
                        className="project-thumb"
                      />
                      <div>
                        <p className="project-name">{project.name}</p>
                        <p className="project-tag">{project.tag}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
