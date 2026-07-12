import React, { useEffect, useState, useRef } from "react";
import { subscribeToNotifications, markNotificationRead } from "./notificationService";
import { fireBrowserNotification } from "./reminderNotifications";
import "./Topbar.css";

export default function Topbar({ title, onMenuClick }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);
  // Tracks notification IDs we've already seen, so we only push-alert for
  // ones that are genuinely NEW — not the batch that loads in on first
  // mount (which would otherwise fire a browser notification for every
  // old item every time the admin opens a page).
  const seenIdsRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToNotifications((rows) => {
      if (seenIdsRef.current === null) {
        // First load on this page — just remember what's already here,
        // don't push-alert for any of it.
        seenIdsRef.current = new Set(rows.map((n) => n.id));
      } else {
        const newOnes = rows.filter((n) => !seenIdsRef.current.has(n.id));
        newOnes.forEach((n) => {
          fireBrowserNotification("JP Studio", n.message);
          seenIdsRef.current.add(n.id);
        });
      }
      setNotifications(rows);
    });
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