import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToBookings } from "../bookings/bookingService";
import { stageStatusOf } from "../../shared/statuses";
import "./CalendarView.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toISODate(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

export default function CalendarView() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(toISODate(today.getFullYear(), today.getMonth(), today.getDate()));
  const [bookings, setBookings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToBookings(setBookings);
    return () => unsub();
  }, []);

  const bookingsByDate = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.eventDate) return;
      if (!map[b.eventDate]) map[b.eventDate] = [];
      map[b.eventDate].push(b);
    });
    return map;
  }, [bookings]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDayIdx = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells = [];
  for (let i = firstDayIdx - 1; i >= 0; i--) {
    cells.push({ day: daysInPrevMonth - i, muted: true, iso: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, muted: false, iso: toISODate(year, month, d) });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length, muted: true, iso: null });
  }

  const selectedBookings = bookingsByDate[selected] || [];

  return (
    <Layout title="Calendar">
      <div className="grid grid-2 calendar-layout">
        <div className="card">
          <div className="calendar-nav-head">
            <button className="btn btn-ghost" onClick={() => setCursor(new Date(year, month - 1, 1))}>
              ‹
            </button>
            <h3>
              {cursor.toLocaleString("default", { month: "long" })} {year}
            </h3>
            <button className="btn btn-ghost" onClick={() => setCursor(new Date(year, month + 1, 1))}>
              ›
            </button>
          </div>

          <div className="cal-grid">
            {DAY_NAMES.map((d) => (
              <div key={d} className="cal-day-name">
                {d}
              </div>
            ))}
            {cells.map((c, i) => {
              const dayBookings = c.iso ? bookingsByDate[c.iso] || [] : [];
              const hasBookings = dayBookings.length > 0;
              const hasCancelledOnly = hasBookings && dayBookings.every((b) => b.cancelled);
              return (
                <div
                  key={i}
                  className={`cal-cell${c.muted ? " muted" : ""}${selected === c.iso ? " selected" : ""}${hasBookings ? " booked" : ""}${hasCancelledOnly ? " booked-cancelled" : ""}`}
                  onClick={() => c.iso && setSelected(c.iso)}
                >
                  <span className="cal-day-number">{c.day}</span>
                  {dayBookings.length > 1 && <span className="cal-count-badge">{dayBookings.length}</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>
            {new Date(selected).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
          </h3>
          {selectedBookings.length === 0 && <div className="empty-state">No bookings on this date.</div>}
          {selectedBookings.map((b) => (
            <div key={b.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/bookings/${b.id}`)}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>
                  {b.customerName} ({b.bookingCode})
                </div>
                <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{b.eventType}</div>
              </div>
              <StatusBadge label={stageStatusOf(b)} />
            </div>
          ))}
          <button
            className="btn btn-outline btn-block"
            style={{ marginTop: 16 }}
            onClick={() => navigate("/admin/bookings")}
          >
            View All Events
          </button>
        </div>
      </div>
    </Layout>
  );
}
