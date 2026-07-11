import React, { useEffect, useState, useRef } from "react";
import { subscribeToNotifications, markNotificationRead } from "./notificationService";
import "./Topbar.css";

export default function Topbar({ title, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToNotifications(setNotifications);
    return () => unsub();
  }, []);

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        {/* Only shown on tablet/mobile — see Topbar.css */}
        <button className="hamburger-btn" onClick={onMenuClick} aria-label="Toggle menu">
          ☰
        </button>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <div className="bell-wrap" ref={wrapRef}>
          <button className="bell-btn" onClick={() => setOpen((o) => !o)} aria-label="Notifications">
            🔔
            {unreadCount > 0 && <span className="bell-dot">{unreadCount}</span>}
          </button>
          {open && (
            <div className="notif-dropdown">
              <div className="notif-head">Notifications</div>
              {notifications.length === 0 && <div className="notif-empty">You're all caught up</div>}
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item${n.read ? "" : " unread"}`}
                  onClick={() => markNotificationRead(n.id)}
                >
                  {n.message}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
