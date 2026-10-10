import { Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT } from '../data/content';
import { Logo } from './Navbar';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div>
          <Logo />
          <p className="muted">A demo support and lead assistant built for the IPAGE Group internship assignment.</p>
        </div>
        <ul className="contact-list">
          <li><Mail size={16} /> {CONTACT.email}</li>
          <li><Phone size={16} /> {CONTACT.phone}</li>
          <li><MapPin size={16} /> {CONTACT.city}</li>
        </ul>
        <nav aria-label="Footer" className="footer-links">
          <Link to="/#services">Services</Link>
          <Link to="/#courses">Courses</Link>
          <Link to="/chat">Chatbot</Link>
          <Link to="/admin">Admin</Link>
        </nav>
      </div>
    </footer>
  );
}
