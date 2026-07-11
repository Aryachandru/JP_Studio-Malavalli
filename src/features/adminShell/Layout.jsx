import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import "./Layout.css";

export default function Layout({ title, children }) {
  // Sidebar is always visible on laptop/desktop (see Sidebar.css).
  // On tablet/mobile it becomes an off-canvas drawer controlled here.
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Dark backdrop shown behind the drawer on mobile/tablet only */}
      <div
        className={`sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      <div className="main-area">
        <Topbar title={title} onMenuClick={() => setSidebarOpen((o) => !o)} />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
}
