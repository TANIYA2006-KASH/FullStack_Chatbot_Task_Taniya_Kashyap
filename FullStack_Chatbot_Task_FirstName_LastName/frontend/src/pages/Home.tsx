import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import DroneHero from '../components/DroneHero';
import EnquiryForm from '../components/EnquiryForm';
import { CoursesSection, FaqSection, ProcessSection, ServicesSection } from '../components/Sections';
import { CONTACT } from '../data/content';

export default function Home() {
  const [prefill, setPrefill] = useState<{ interest: string; nonce: number } | undefined>();

  const enquire = (interest: string) => {
    setPrefill({ interest, nonce: Date.now() });
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <h1>See your project from the sky, or learn to fly it yourself</h1>
            <p>
              Drone filming, surveying, spraying and pilot training in one place. Ask our assistant a question, get a quote, or book a course in a couple of minutes.
            </p>
            <div className="hero-cta">
              <Link to="/chat" className="btn btn-primary btn-lg">
                <MessageCircle size={20} /> Chat with the assistant
              </Link>
              <a href="#contact" className="btn btn-ghost btn-lg">
                Send an enquiry <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <DroneHero />
        </div>
      </section>

      <ServicesSection onEnquire={enquire} />
      <CoursesSection onEnquire={enquire} />
      <ProcessSection />
      <FaqSection />

      <section id="contact" className="section">
        <div className="container contact-grid">
          <div>
            <h2>Tell us what you have in mind</h2>
            <p className="lead">Fill in the form and a team member will get back to you. You can also reach us directly.</p>
            <ul className="contact-list large">
              <li><Mail size={18} /> {CONTACT.email}</li>
              <li><Phone size={18} /> {CONTACT.phone}</li>
              <li><MapPin size={18} /> {CONTACT.city}</li>
            </ul>
            <p className="muted">{CONTACT.hours}</p>
          </div>
          <div className="card">
            <EnquiryForm prefill={prefill} />
          </div>
        </div>
      </section>
    </>
  );
}
