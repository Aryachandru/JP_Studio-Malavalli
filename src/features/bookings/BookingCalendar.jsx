import React, { useState } from "react";
import "./BookingCalendar.css";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toISODate(y, m, d) {
  const mm = String(m + 1).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

// A month-grid date picker. `bookedDates` is the live map from
// subscribeToBookedDates() in bookingService.js — {date: count}, no
// customer info in it at all.
//
// IMPORTANT: booked dates are NOT blocked from selection — a studio can
// run more than one shoot a day (different photographers, a quick
// birthday shoot alongside a wedding, etc), so the admin needs to be able
// to add multiple bookings on the same date. Booked dates just render
// shaded so it's obvious at a glance, and the parent component (Book Now)
// shows a "please call to confirm" note when the picked date is already
// taken by someone else. Only PAST dates are actually unclickable.
export default function BookingCalendar({ value, onChange, bookedDates = {} }) {
  const initial = value ? new Date(value) : new Date();
  const [cursor, setCursor] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  const today = startOfToday();
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

  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth();

  function isPast(iso) {
    if (!iso) return false;
    return new Date(iso) < today;
  }
  function isBooked(iso) {
    if (!iso) return false;
    return (bookedDates[iso] || 0) > 0;
  }

  return (
    <div className="bcal">
      <div className="bcal-nav">
        <button
          type="button"
          className="bcal-nav-btn"
          onClick={() => setCursor(new Date(year, month - 1, 1))}
          disabled={isCurrentMonth}
        >
          ‹
        </button>
        <div className="bcal-month-label">
          {cursor.toLocaleString("default", { month: "long" })} {year}
        </div>
        <button type="button" className="bcal-nav-btn" onClick={() => setCursor(new Date(year, month + 1, 1))}>
          ›
        </button>
      </div>

      <div className="bcal-grid">
        {DAY_NAMES.map((d) => (
          <div key={d} className="bcal-day-name">{d}</div>
        ))}
        {cells.map((c, i) => {
          const past = c.muted || isPast(c.iso);
          const booked = !c.muted && isBooked(c.iso);
          const selected = c.iso && c.iso === value;
          return (
            <button
              type="button"
              key={i}
              className={`bcal-cell${c.muted ? " muted" : ""}${past ? " disabled" : ""}${booked ? " booked" : ""}${selected ? " selected" : ""}`}
              disabled={past}
              onClick={() => c.iso && onChange(c.iso)}
              title={booked ? "Someone already has a booking on this date" : undefined}
            >
              {c.day}
              {booked && !selected && <span className="bcal-booked-dot" />}
            </button>
          );
        })}
      </div>

      <div className="bcal-legend">
        <span><i className="bcal-swatch available" /> Available</span>
        <span><i className="bcal-swatch booked" /> Already Booked (still selectable)</span>
        <span><i className="bcal-swatch selected" /> Selected</span>
      </div>
    </div>
  );
}