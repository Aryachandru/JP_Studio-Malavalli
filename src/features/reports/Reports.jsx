import React, { useEffect, useMemo, useState } from "react";
import Layout from "../adminShell/Layout";
import StatCard from "../../shared/StatCard";
import { subscribeToBookings } from "../bookings/bookingService";
import { getTopLevelStatus, TOP_LEVEL } from "../../shared/statuses";
import "./Reports.css";

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleString("default", { month: "long", year: "numeric" });
}

function shiftMonth(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return monthKey(d);
}

export default function Reports() {
  const [bookings, setBookings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));

  useEffect(() => {
    const unsub = subscribeToBookings(setBookings);
    return () => unsub();
  }, []);

  // Bookings tagged with the month they were CREATED (i.e. when the order
  // came in) — this is what "orders this month" / "collection this month"
  // means below. Bookings without a createdAt yet (mid-write) are skipped.
  const bookingsWithMonth = useMemo(() => {
    return bookings
      .filter((b) => b.createdAt && b.createdAt.toDate)
      .map((b) => ({ ...b, _monthKey: monthKey(b.createdAt.toDate()) }));
  }, [bookings]);

  const previousMonth = shiftMonth(selectedMonth, -1);

  const currentMonthBookings = bookingsWithMonth.filter((b) => b._monthKey === selectedMonth);
  const previousMonthBookings = bookingsWithMonth.filter((b) => b._monthKey === previousMonth);

  function summarize(rows) {
    const revenue = rows.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    const completed = rows.filter((b) => getTopLevelStatus(b.stageIndex, b.cancelled) === TOP_LEVEL.COMPLETED).length;
    const cancelled = rows.filter((b) => b.cancelled).length;
    return { orders: rows.length, revenue, completed, cancelled };
  }

  const current = summarize(currentMonthBookings);
  const previous = summarize(previousMonthBookings);

  function pctChange(curr, prev) {
    if (prev === 0) return curr === 0 ? 0 : 100;
    return Math.round(((curr - prev) / prev) * 100);
  }

  const orderDelta = pctChange(current.orders, previous.orders);
  const revenueDelta = pctChange(current.revenue, previous.revenue);

  const byEventType = useMemo(() => {
    const map = {};
    currentMonthBookings.forEach((b) => {
      const key = b.eventType || "Other";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [currentMonthBookings]);
  const maxCount = Math.max(1, ...byEventType.map(([, c]) => c));

  return (
    <Layout title="Reports">
      <div className="reports-month-picker">
        <button className="btn btn-ghost" onClick={() => setSelectedMonth(shiftMonth(selectedMonth, -1))}>
          ‹ Previous
        </button>
        <h3>{monthLabel(selectedMonth)}</h3>
        <button
          className="btn btn-ghost"
          onClick={() => setSelectedMonth(shiftMonth(selectedMonth, 1))}
          disabled={selectedMonth >= monthKey(new Date())}
        >
          Next ›
        </button>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 20 }}>
        <StatCard
          label="Orders This Month"
          value={current.orders}
          delta={<span style={{ color: orderDelta >= 0 ? "var(--green)" : "var(--red)" }}>{orderDelta >= 0 ? "+" : ""}{orderDelta}% vs last month</span>}
        />
        <StatCard
          label="Collection This Month"
          value={`₹${current.revenue.toLocaleString("en-IN")}`}
          delta={<span style={{ color: revenueDelta >= 0 ? "var(--green)" : "var(--red)" }}>{revenueDelta >= 0 ? "+" : ""}{revenueDelta}% vs last month</span>}
        />
        <StatCard label="Completed" value={current.completed} />
        <StatCard label="Cancelled" value={current.cancelled} />
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ marginBottom: 14 }}>{monthLabel(selectedMonth)} vs {monthLabel(previousMonth)}</h3>
        <div className="compare-row">
          <div className="compare-col">
            <div className="compare-month-label">{monthLabel(previousMonth)}</div>
            <div className="compare-value">{previous.orders} orders</div>
            <div className="compare-value">₹{previous.revenue.toLocaleString("en-IN")}</div>
          </div>
          <div className="compare-arrow">→</div>
          <div className="compare-col highlight">
            <div className="compare-month-label">{monthLabel(selectedMonth)}</div>
            <div className="compare-value">{current.orders} orders</div>
            <div className="compare-value">₹{current.revenue.toLocaleString("en-IN")}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>{monthLabel(selectedMonth)} — Bookings by Event Type</h3>
        {byEventType.length === 0 && <div className="empty-state">No orders in this month yet.</div>}
        {byEventType.map(([type, count]) => (
          <div key={type} className="report-bar-row">
            <div className="report-bar-head">
              <span>{type}</span>
              <span style={{ fontWeight: 600 }}>{count}</span>
            </div>
            <div className="report-bar-track">
              <div className="report-bar-fill" style={{ width: `${(count / maxCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
