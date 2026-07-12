import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "./Navbar.css";

const LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/packages", label: "Packages" },
  { to: "/gallery", label: "Gallery" },
  { to: "/book", label: "Book Now" },
  { to: "/track", label: "Track Booking" },
  { to: "/contact", label: "Contact" },
  { to: "/developer", label: "Developer Info" },

];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="public-navbar">
      <div className="public-navbar-inner">
       <NavLink to="/" className="public-brand" onClick={() => setOpen(false)}>
  <span className="public-logo-badge">
    <img src="/images/JPsLogo.jpeg" alt="JP Studio Logo" className="public-logo-img" />
  </span>
  <span className="public-brand-text">JP STUDIO</span>
</NavLink>


        <nav className="public-nav-links desktop-only">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? "active" : "")}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="public-navbar-actions desktop-only">
          <NavLink to="/admin/login" className="btn btn-outline btn-sm">
            Admin Login
          </NavLink>
        </div>

        <button className="public-hamburger" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="public-mobile-menu">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => `public-mobile-link${isActive ? " active" : ""}`}
            >
              {l.label}
            </NavLink>
          ))}
          <div className="public-mobile-divider" />
          <NavLink to="/admin/login" onClick={() => setOpen(false)} className="public-mobile-link admin-link">
            🔐 Admin Login
          </NavLink>
        </div>
      )}
    </header>
  );
}
