import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToBookings } from "../bookings/bookingService";
import { getTopLevelStatus, stageStatusOf, TOP_LEVEL } from "../../shared/statuses";
import { ensureNotificationPermission, notifyTomorrowBookings } from "../adminShell/reminderNotifications";
import "./Dashboard.css";

/* ------------------------------------------------------------------ */
/* Small inline icons (no extra deps) so the file stays self-contained */
/* ------------------------------------------------------------------ */
const Icon = {
  Calendar: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3 10h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Clock: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7v5l3.5 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Check: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12.5l2.5 2.5L16 9.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Rupee: (p) => (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" {...p}>
      <path d="M7 6h10M7 10h10M7 6c4 0 6 1.4 6 4s-2 4-6 4h-1l7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Bell: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  Bolt: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Box: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M4.5 7.5 12 12l7.5-4.5M12 12v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  ),
  Users: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 20c.7-3.4 3-5 5.5-5s4.8 1.6 5.5 5M15 8.5a3 3 0 1 1 3.6 2.9M16 15c2 .3 3.6 1.8 4.3 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  Chart: (p) => (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" {...p}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Arrow: (p) => (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" {...p}>
      <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const DAY_MS = 24 * 60 * 60 * 1000;

function isoDaysAgo(n) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function shortLabel(iso) {
  // "2026-09-16" -> "16 Sep"
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

/** Mini sparkline, no external chart library needed */
function Sparkline({ values, color, height = 40, width = 100 }) {
  if (!values || values.length < 2) {
    return <svg width={width} height={height} />;
  }
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${height - ((v - min) / range) * (height - 6) - 3}`)
    .join(" ");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="sparkline">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Compares this-week vs last-week totals for a small trend indicator */
function trendOf(currentSeries) {
  const mid = Math.ceil(currentSeries.length / 2);
  const prevSum = currentSeries.slice(0, mid).reduce((a, b) => a + b, 0);
  const curSum = currentSeries.slice(mid).reduce((a, b) => a + b, 0);
  if (prevSum === 0) return curSum > 0 ? { dir: "up", pct: 100 } : { dir: "flat", pct: 0 };
  const pct = Math.round(((curSum - prevSum) / prevSum) * 100);
  return { dir: pct >= 0 ? "up" : "down", pct: Math.abs(pct) };
}

function StatCardV2({ icon, label, value, series, accent, variant }) {
  const trend = trendOf(series);
  return (
    <div className={`stat-card-v2 stat-card-v2--${variant}`}>
      <div className="stat-card-v2-top">
        <span className="stat-card-v2-icon" style={{ background: accent.iconBg, color: accent.iconColor }}>
          {icon}
        </span>
        <span className="stat-card-v2-label">{label}</span>
        <span className="stat-card-v2-menu">⋯</span>
      </div>
      <div className="stat-card-v2-bottom">
        <div>
          <div className="stat-card-v2-value">{value}</div>
          <div className={`stat-card-v2-trend stat-card-v2-trend--${trend.dir}`}>
            {trend.dir === "down" ? "↓" : "↑"} {trend.pct}%{" "}
            <span className="stat-card-v2-trend-sub">vs last 7 days</span>
          </div>
        </div>
        <Sparkline values={series} color={accent.line} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRange, setChartRange] = useState(7); // 7 or 30
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

  const todayISO = useMemo(() => isoDaysAgo(0), []);
  const tomorrowISO = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  /* ---- 14-day daily buckets, used for both stat totals + sparklines ---- */
  const dailyBuckets = useMemo(() => {
    const days = Array.from({ length: 14 }, (_, i) => isoDaysAgo(13 - i));
    const buckets = Object.fromEntries(
      days.map((iso) => [iso, { total: 0, inProgress: 0, completed: 0, revenue: 0 }])
    );
    bookings.forEach((b) => {
      const bucket = buckets[b.eventDate];
      if (!bucket) return; // outside the 14-day window
      const top = getTopLevelStatus(b.stageIndex, b.cancelled);
      bucket.total += 1;
      if (top === TOP_LEVEL.IN_PROGRESS) bucket.inProgress += 1;
      if (top === TOP_LEVEL.COMPLETED) bucket.completed += 1;
      bucket.revenue += Number(b.amount) || 0;
    });
    return days.map((iso) => ({ iso, ...buckets[iso] }));
  }, [bookings]);

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

  const last7 = dailyBuckets.slice(7); // most recent 7 of the 14 buckets

  const revenueChartData = useMemo(() => {
    const days = Array.from({ length: chartRange }, (_, i) => isoDaysAgo(chartRange - 1 - i));
    return days.map((iso) => {
      const found = bookings
        .filter((b) => b.eventDate === iso && !b.cancelled)
        .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
      return { iso, label: shortLabel(iso), value: found };
    });
  }, [bookings, chartRange]);

  const recent = bookings.slice(0, 6);

  // Bookings whose event is TOMORROW — the "remind me a day before" feature.
  const remindersTomorrow = useMemo(
    () => bookings.filter((b) => !b.cancelled && b.eventDate === tomorrowISO),
    [bookings, tomorrowISO]
  );

  // Upcoming shoots (today + next 14 days), for the sidebar widget
  const upcomingShoots = useMemo(() => {
    return bookings
      .filter((b) => !b.cancelled && b.eventDate >= todayISO)
      .sort((a, b) => (a.eventDate > b.eventDate ? 1 : -1))
      .slice(0, 5);
  }, [bookings, todayISO]);

  useEffect(() => {
    if (remindersTomorrow.length > 0 && notifPermission === "granted") {
      notifyTomorrowBookings(remindersTomorrow);
    }
  }, [remindersTomorrow, notifPermission]);

  async function handleEnableNotifications() {
    const result = await ensureNotificationPermission();
    setNotifPermission(result);
  }

  const todayLabel = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const maxRevenue = Math.max(...revenueChartData.map((d) => d.value), 1);
  const niceMax = Math.ceil(maxRevenue / 2500) * 2500 || 2500;

  return (
    <Layout title="Dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back! Here's what's happening with your studio today.</p>
        </div>
        <div className="dashboard-date-card">
          <span className="dashboard-date-icon"><Icon.Calendar /></span>
          <div>
            <div className="dashboard-date-text">{todayLabel}</div>
            <div className="dashboard-date-sub">Good to see you again!</div>
          </div>
        </div>
      </div>

      <div className="grid grid-4 dashboard-stat-grid">
        <StatCardV2
          label="Total Bookings"
          value={stats.total}
          series={last7.map((d) => d.total)}
          variant="total"
          icon={<Icon.Calendar />}
          accent={{ iconBg: "#e3edff", iconColor: "#3b6df5", line: "#3b6df5" }}
        />
        <StatCardV2
          label="In Progress"
          value={stats.inProgress}
          series={last7.map((d) => d.inProgress)}
          variant="progress"
          icon={<Icon.Clock />}
          accent={{ iconBg: "#dcf7ea", iconColor: "#12b76a", line: "#12b76a" }}
        />
        <StatCardV2
          label="Completed"
          value={stats.completed}
          series={last7.map((d) => d.completed)}
          variant="completed"
          icon={<Icon.Check />}
          accent={{ iconBg: "#efe6ff", iconColor: "#8b5cf6", line: "#8b5cf6" }}
        />
        <StatCardV2
          label="Revenue"
          value={`₹${stats.revenue.toLocaleString("en-IN")}`}
          series={last7.map((d) => d.revenue)}
          variant="revenue"
          icon={<Icon.Rupee />}
          accent={{ iconBg: "rgba(255,255,255,0.25)", iconColor: "#fff", line: "#ffffff" }}
        />
      </div>

      {notifPermission !== "granted" && notifPermission !== "unsupported" && (
        <div className="card notif-permission-card">
          <div className="notif-permission-left">
            <span className="notif-permission-icon"><Icon.Bell /></span>
            <div>
              <strong>Turn on reminders</strong>
              <p>Get a notification on this device whenever you have a shoot the next day.</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleEnableNotifications}>
            <Icon.Bell /> Enable Notifications
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

      <div className="dashboard-main-grid">
        {/* ---------------- Main column ---------------- */}
        <div className="dashboard-main-col">
          <div className="card">
            <div className="dashboard-recent-head">
              <div className="dashboard-recent-head-left">
                <span className="dashboard-recent-icon"><Icon.Calendar /></span>
                <div>
                  <h3>Recent Bookings</h3>
                  <div className="dashboard-recent-sub">Latest bookings from your studio</div>
                </div>
              </div>
              <span className="dashboard-view-all" onClick={() => navigate("/admin/bookings")}>
                View All <Icon.Arrow />
              </span>
            </div>

            {loading && <div className="loading-line">Loading bookings…</div>}

            {!loading && recent.length === 0 && (
              <div className="empty-state empty-state--illustrated">
                <EmptyBookingsIllustration />
                <div className="empty-state-title">No bookings yet</div>
                <div className="empty-state-sub">Create one from the Bookings page.</div>
                <button className="btn btn-primary" onClick={() => navigate("/admin/bookings")}>
                  Go to Bookings
                </button>
              </div>
            )}

            {!loading && recent.length > 0 && (
              <div className="table-scroll">
                <table className="recent-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Client Name</th>
                      <th>Package</th>
                      <th>Date &amp; Time</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((b, i) => (
                      <tr key={b.id} onClick={() => navigate(`/admin/bookings/${b.id}`)}>
                        <td data-label="#">{i + 1}</td>
                        <td data-label="Client Name">
                          <div className="recent-table-client">
                            <span className="avatar-thumb dashboard-avatar">{b.customerName?.[0] || "?"}</span>
                            <div>
                              <div className="recent-table-name">{b.customerName}</div>
                              <div className="recent-table-code">{b.bookingCode}</div>
                            </div>
                          </div>
                        </td>
                        {/* NOTE: adjust field name if your booking model calls this differently (e.g. b.packageName) */}
                        <td data-label="Package">{b.package || b.packageName || b.eventType || "—"}</td>
                        <td data-label="Date & Time">
                          {b.eventDate}
                          {b.eventTime ? ` · ${b.eventTime}` : ""}
                        </td>
                        <td data-label="Status">
                          <StatusBadge label={stageStatusOf(b)} />
                        </td>
                        <td data-label="Amount">₹{(Number(b.amount) || 0).toLocaleString("en-IN")}</td>
                        <td data-label="Action">
                          <button
                            className="btn-icon-link"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/admin/bookings/${b.id}`);
                            }}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ---------------- Sidebar column ---------------- */}
        <div className="dashboard-side-col">
          <div className="card side-card">
            <div className="side-card-head">
              <Icon.Bolt /> <h3>Quick Actions</h3>
            </div>
            <div className="quick-actions-grid">
              {/* NOTE: point these at your real routes if they differ */}
              <button className="quick-action quick-action--blue" onClick={() => navigate("/admin/bookings/new")}>
                <Icon.Calendar /> New Booking <Icon.Arrow />
              </button>
              <button className="quick-action quick-action--purple" onClick={() => navigate("/admin/packages/new")}>
                <Icon.Box /> Add Package <Icon.Arrow />
              </button>
              <button className="quick-action quick-action--green" onClick={() => navigate("/admin/calendar")}>
                <Icon.Calendar /> View Calendar <Icon.Arrow />
              </button>
              <button className="quick-action quick-action--pink" onClick={() => navigate("/admin/clients")}>
                <Icon.Users /> View Clients <Icon.Arrow />
              </button>
            </div>
          </div>

          <div className="card side-card">
            <div className="side-card-head side-card-head--split">
              <div className="side-card-head-left">
                <Icon.Calendar /> <h3>Upcoming Shoots</h3>
              </div>
              <span className="dashboard-view-all" onClick={() => navigate("/admin/bookings")}>
                View All <Icon.Arrow />
              </span>
            </div>
            {upcomingShoots.length === 0 ? (
              <div className="empty-state empty-state--mini">
                <div className="empty-state-title">No upcoming Shoots</div>
                <div className="empty-state-sub">You don't have any scheduled shoots yet.</div>
              </div>
            ) : (
              upcomingShoots.map((b) => (
                <div key={b.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/bookings/${b.id}`)}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.customerName}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{b.eventDate}</div>
                  </div>
                  <StatusBadge label={stageStatusOf(b)} />
                </div>
              ))
            )}
          </div>

          <div className="card side-card">
            <div className="side-card-head side-card-head--split">
              <div className="side-card-head-left">
                <Icon.Chart /> <h3>Revenue Overview</h3>
              </div>
              <select
                className="chart-range-select"
                value={chartRange}
                onChange={(e) => setChartRange(Number(e.target.value))}
              >
                <option value={7}>Last 7 Days</option>
                <option value={30}>Last 30 Days</option>
              </select>
            </div>
            <RevenueLineChart data={revenueChartData} niceMax={niceMax} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

/* ------------------------------------------------------------------ */
/* Revenue line chart — plain SVG, no chart library dependency         */
/* ------------------------------------------------------------------ */
function RevenueLineChart({ data, niceMax }) {
  const width = 280;
  const height = 140;
  const padLeft = 46;
  const padBottom = 20;
  const plotW = width - padLeft - 8;
  const plotH = height - padBottom - 8;

  const stepX = data.length > 1 ? plotW / (data.length - 1) : 0;
  const points = data.map((d, i) => {
    const x = padLeft + i * stepX;
    const y = 8 + plotH - (d.value / niceMax) * plotH;
    return { x, y, ...d };
  });
  const linePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(niceMax * f));

  // Show at most ~7 x-axis labels to avoid crowding on 30-day view
  const labelEvery = Math.max(1, Math.ceil(data.length / 7));

  return (
    <svg className="revenue-chart" viewBox={`0 0 ${width} ${height}`} width="100%">
      {ticks.map((t, i) => {
        const y = 8 + plotH - (t / niceMax) * plotH;
        return (
          <g key={i}>
            <line x1={padLeft} y1={y} x2={width - 4} y2={y} stroke="var(--ink-100, #eef1f6)" strokeWidth="1" />
            <text x={padLeft - 8} y={y + 4} textAnchor="end" fontSize="9" fill="var(--ink-400, #94a3b8)">
              ₹{t.toLocaleString("en-IN")}
            </text>
          </g>
        );
      })}
      <polyline points={linePoints} fill="none" stroke="#3b6df5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="#3b6df5" />
      ))}
      {points.map((p, i) =>
        i % labelEvery === 0 ? (
          <text key={i} x={p.x} y={height - 4} textAnchor="middle" fontSize="9" fill="var(--ink-400, #94a3b8)">
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Empty-state illustration for Recent Bookings                        */
/* ------------------------------------------------------------------ */
function EmptyBookingsIllustration() {
  return (
    <svg width="140" height="110" viewBox="0 0 140 110" fill="none">
      <ellipse cx="70" cy="98" rx="46" ry="8" fill="#eef2fb" />
      <rect x="30" y="20" width="60" height="60" rx="8" fill="#eaf0ff" stroke="#c9d9ff" strokeWidth="1.5" />
      <rect x="30" y="20" width="60" height="16" rx="8" fill="#c9d9ff" />
      <circle cx="42" cy="28" r="2.5" fill="#fff" />
      <circle cx="50" cy="28" r="2.5" fill="#fff" />
      <line x1="30" y1="50" x2="90" y2="50" stroke="#c9d9ff" strokeWidth="1" />
      <line x1="30" y1="64" x2="90" y2="64" stroke="#c9d9ff" strokeWidth="1" />
      <rect x="66" y="52" width="36" height="30" rx="6" fill="#fff" stroke="#c9d9ff" strokeWidth="1.5" />
      <circle cx="84" cy="64" r="6" fill="#eaf0ff" stroke="#c9d9ff" strokeWidth="1.2" />
      <path d="M72 78l7-8 6 6 5-5 8 7" stroke="#c9d9ff" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
    </svg>
  );
}