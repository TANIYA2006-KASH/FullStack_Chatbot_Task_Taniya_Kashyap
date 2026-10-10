import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="DroneTV Assistant home">
      <svg width="30" height="30" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="16" fill="var(--ink)" />
        <path d="M12 12l13 13M52 12L39 25M12 52l13-13M52 52L39 39" stroke="var(--telemetry)" strokeWidth="5" strokeLinecap="round" />
        <circle cx="32" cy="32" r="9" fill="var(--beacon)" />
      </svg>
      <span>DroneTV <b>Assistant</b></span>
    </Link>
  );
}

export default function Navbar() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-inner">
        <Logo />
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main">
          <Link to="/#services">Services</Link>
          <Link to="/#courses">Courses</Link>
          <Link to="/#faq">FAQ</Link>
          <Link to="/#contact">Contact</Link>
          <NavLink to="/chat">Chatbot</NavLink>
          <NavLink to="/admin">Admin</NavLink>
        </nav>
        <div className="nav-actions">
          <button className="icon-btn" onClick={toggle} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>
    </header>
  );
}
