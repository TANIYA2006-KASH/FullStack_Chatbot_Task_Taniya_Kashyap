import { ArrowRight, Camera, Clapperboard, Map as MapIcon, Radar, ShieldCheck, Sprout } from 'lucide-react';
import { COURSES, FAQS, SERVICES } from '../data/content';
import type { Service } from '../data/content';

const ICONS: Record<Service['icon'], JSX.Element> = {
  camera: <Camera size={22} />,
  map: <MapIcon size={22} />,
  sprout: <Sprout size={22} />,
  radar: <Radar size={22} />,
  film: <Clapperboard size={22} />,
  shield: <ShieldCheck size={22} />,
};

export function ServicesSection({ onEnquire }: { onEnquire: (interest: string) => void }) {
  return (
    <section id="services" className="section">
      <div className="container">
        <div className="section-head">
          <h2>Services built around what you need to see from above</h2>
          <p>From a single wedding shoot to a 500-acre survey, pick a service and tell us the details.</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((s, i) => (
            <article key={s.id} className={`service ${i === 0 ? 'feature' : ''}`}>
              <span className="service-icon">{ICONS[s.icon]}</span>
              <h3>{s.title}</h3>
              <p>{s.summary}</p>
              <button className="link-btn" onClick={() => onEnquire(s.title)}>
                Get a quote <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CoursesSection({ onEnquire }: { onEnquire: (interest: string) => void }) {
  return (
    <section id="courses" className="section section-alt">
      <div className="container">
        <div className="section-head">
          <h2>Learn to fly, shoot and map with drones</h2>
          <p>Practical programs for students and working professionals. No experience needed for the first course.</p>
        </div>
        <ul className="course-list">
          {COURSES.map((c) => (
            <li key={c.id} className="course">
              <div className="course-main">
                <h3>{c.title}</h3>
                <p>{c.summary}</p>
              </div>
              <dl className="course-meta">
                <div>
                  <dt>Level</dt>
                  <dd><span className={`level level-${c.level.toLowerCase()}`}>{c.level}</span></dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{c.duration}</dd>
                </div>
                <div>
                  <dt>Format</dt>
                  <dd>{c.mode}</dd>
                </div>
              </dl>
              <button className="btn btn-outline" onClick={() => onEnquire(c.title)}>
                Enquire
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ProcessSection() {
  const steps = [
    ['Tell us what you need', 'Chat with the assistant or fill in the form. It takes about two minutes.'],
    ['We review and call you', 'A team member checks your enquiry and gets in touch, usually within a working day.'],
    ['Fly, learn or get delivery', 'Start your batch, schedule the shoot, or receive your survey data.'],
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <h2>What happens after you reach out</h2>
        </div>
        <ol className="process">
          {steps.map(([t, d], i) => (
            <li key={t}>
              <span className="step-no">{i + 1}</span>
              <div>
                <h3>{t}</h3>
                <p>{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section id="faq" className="section section-alt">
      <div className="container narrow">
        <div className="section-head">
          <h2>Quick answers</h2>
        </div>
        <div className="faq">
          {FAQS.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
