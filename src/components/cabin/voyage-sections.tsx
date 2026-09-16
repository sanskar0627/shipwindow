import { ArrowUpRight } from "lucide-react";
import { identity, passage, work } from "@/data/content";

export function SelectedWork() {
  return (
    <section className="section" id="work" aria-labelledby="work-h">
      <header className="section-head">
        <p className="kicker">01 · Selected work</p>
        <h2 className="section-title" id="work-h">
          Things built to be used every day.
        </h2>
      </header>
      <ul className="work-grid">
        {work.map((p) => (
          <li key={p.name} className="work-card">
            <a href="#contact" className="work-link">
              <div className="work-media">
                <img src={p.image} alt="" className="work-img" loading="lazy" />
              </div>
              <div className="work-meta">
                <div>
                  <p className="work-name">{p.name}</p>
                  <p className="work-tag">{p.tag}</p>
                </div>
                <span className="work-year">{p.year}</span>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Passage() {
  return (
    <section className="section" id="passage" aria-labelledby="passage-h">
      <header className="section-head">
        <p className="kicker">02 · Passage</p>
        <h2 className="section-title" id="passage-h">
          Ports of call.
        </h2>
      </header>
      <ol className="log">
        {passage.map((p) => (
          <li key={p.year} className="log-row">
            <div className="log-when">
              <span className="log-year">{p.year}</span>
              <span className="log-route">{p.route}</span>
            </div>
            <div className="log-body">
              <h3 className="log-company">
                {p.company}
                {p.current ? <span className="log-now">Aboard</span> : null}
              </h3>
              <p className="log-title">{p.title}</p>
              <p className="log-copy">{p.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Contact() {
  return (
    <section className="contact" id="contact" aria-labelledby="contact-h">
      <p className="kicker">03 · Contact</p>
      <h2 className="contact-title" id="contact-h">
        Available for a few
        <br />
        <em>select collaborations.</em>
      </h2>
      <a className="btn btn-primary" href={`mailto:${identity.email}`}>
        {identity.email}
        <ArrowUpRight size={16} strokeWidth={1.75} />
      </a>
    </section>
  );
}
