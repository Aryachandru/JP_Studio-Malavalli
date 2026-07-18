import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../auth/auth";
import { useDialog } from "../../shared/DialogProvider";
import "./Sidebar.css";

// Every sidebar entry routes directly to its real page (as requested) —
// react-router's NavLink handles the "active" highlight automatically,
// so whichever page is open, the matching sidebar item lights up gold.
const NAV_ITEMS = [
  { to: "/admin", label: "Dashboard", icon: "🏠", end: true },
  { to: "/admin/bookings", label: "Bookings", icon: "📖" },
  { to: "/admin/calendar", label: "Calendar", icon: "📅" },
  { to: "/admin/packages", label: "Packages", icon: "📦" },
  { to: "/admin/offers", label: "Offers", icon: "🎉" },
  { to: "/admin/testimonials", label: "Testimonials", icon: "⭐" },
  { to: "/admin/clients", label: "Clients", icon: "👥" },
  { to: "/admin/gallery", label: "Gallery", icon: "🖼️" },
  { to: "/admin/photographers", label: "Photographers", icon: "📷" },
  { to: "/admin/reports", label: "Reports", icon: "📊" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

export default function Sidebar({ open, onClose }) {
  const { confirmDialog } = useDialog();
  const navigate = useNavigate();

  async function handleLogout() {
    if (await confirmDialog("Log out of JP Studio Admin?", { confirmLabel: "Log Out" })) {
      await logout();
      navigate("/admin/login");
    }
  }

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <div className="sidebar-brand">
        <div className="logo-badge">JP</div>
        <div className="brand-text">
          <b>JP STUDIO</b>
          <span>ADMIN PANEL</span>
        </div>
        <a href="/" className="sidebar-view-site" title="View public site">🌐</a>
        {/* Only visible on mobile/tablet drawer mode (see Sidebar.css) */}
        <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
          ✕
        </button>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onClose}
            className={({ isActive }) => `sidebar-link${isActive ? " active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-link" style={{ width: "100%", border: "none" }} onClick={handleLogout}>
          <span className="icon">⏻</span>
          Logout
        </button>
      </div>
    </aside>
  );
}