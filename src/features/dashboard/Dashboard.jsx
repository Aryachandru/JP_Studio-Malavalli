import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatCard from "../../shared/StatCard";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToBookings } from "../bookings/bookingService";
import { getTopLevelStatus, stageStatusOf, TOP_LEVEL } from "../../shared/statuses";
import { ensureNotificationPermission, notifyTomorrowBookings } from "../adminShell/reminderNotifications";
import "./Dashboard.css";

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== "undefined" ? Notification.permission : "unsupported"
  );
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToBookings((rows) => {
      setBookings(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const stats = useMemo(() => {
    let inProgress = 0;
    let completed = 0;
    let revenue = 0;
    bookings.forEach((b) => {
      const top = getTopLevelStatus(b.stageIndex, b.cancelled);
      if (top === TOP_LEVEL.IN_PROGRESS) inProgress += 1;
      if (top === TOP_LEVEL.COMPLETED) completed += 1;
      revenue += Number(b.amount) || 0;
    });
    return { total: bookings.length, inProgress, completed, revenue };
  }, [bookings]);

  const recent = bookings.slice(0, 6);

  // Bookings whose event is TOMORROW — this is the "remind me a day before"
  // feature. It's computed live on every load; pair it with the optional
  // Cloud Function in /functions (see README) if you want an actual push
  // notification to the admin's phone instead of just this in-app card.
  const tomorrowISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const remindersTomorrow = useMemo(
    () => bookings.filter((b) => !b.cancelled && b.eventDate === tomorrowISO),
    [bookings, tomorrowISO]
  );

  // Fire a real OS/browser notification once per day when there's a shoot
  // tomorrow — see reminderNotifications.js for the APK upgrade path.
  useEffect(() => {
    if (remindersTomorrow.length > 0 && notifPermission === "granted") {
      notifyTomorrowBookings(remindersTomorrow);
    }
  }, [remindersTomorrow, notifPermission]);

  async function handleEnableNotifications() {
    const result = await ensureNotificationPermission();
    setNotifPermission(result);
  }

  return (
    <Layout title="Dashboard">
      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <StatCard label="Total Bookings" value={stats.total} />
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Completed" value={stats.completed} />
        <StatCard label="Revenue" value={`₹${stats.revenue.toLocaleString("en-IN")}`} />
      </div>

      {notifPermission !== "granted" && notifPermission !== "unsupported" && (
        <div className="card notif-permission-card">
          <div>
            <strong>Turn on reminders</strong>
            <p>Get a notification on this device whenever you have a shoot the next day.</p>
          </div>
          <button className="btn btn-outline" onClick={handleEnableNotifications}>
            Enable Notifications
          </button>
        </div>
      )}

      {remindersTomorrow.length > 0 && (
        <div className="card reminder-card">
          <div className="reminder-head">
            <span className="reminder-icon">⏰</span>
            <h3>Reminder: {remindersTomorrow.length} shoot{remindersTomorrow.length > 1 ? "s" : ""} tomorrow</h3>
          </div>
          {remindersTomorrow.map((b) => (
            <div key={b.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/bookings/${b.id}`)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {b.customerName} · {b.eventType}
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                  {b.location} · {b.photographer || "Unassigned"}
                </div>
              </div>
              <StatusBadge label={stageStatusOf(b)} />
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <div className="dashboard-recent-head">
          <h3>Recent Bookings</h3>
          <span className="dashboard-view-all" onClick={() => navigate("/admin/bookings")}>
            View All
          </span>
        </div>

        {loading && <div className="loading-line">Loading bookings…</div>}
        {!loading && recent.length === 0 && (
          <div className="empty-state">No bookings yet. Create one from the Bookings page.</div>
        )}

        {recent.map((b) => (
          <div
            key={b.id}
            className="list-row"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/admin/bookings/${b.id}`)}
          >
            <div className="avatar-thumb dashboard-avatar">
              {b.customerName?.[0] || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {b.bookingCode} · {b.customerName}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{b.eventDate}</div>
            </div>
            <StatusBadge label={stageStatusOf(b)} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
