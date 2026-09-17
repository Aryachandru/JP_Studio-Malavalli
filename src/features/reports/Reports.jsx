import React, { useEffect, useMemo, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToBookings } from "../bookings/bookingService";
import { getTopLevelStatus, TOP_LEVEL } from "../../shared/statuses";
import "./Reports.css";

function monthKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key) {
  const [y, m] = key.split("-").map(Number);

  return new Date(y, m - 1, 1).toLocaleString("default", {
    month: "long",
    year: "numeric",
  });
}

function shiftMonth(key, delta) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);

  return monthKey(d);
}

function formatMoney(amount) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function pctChange(curr, prev) {
  if (prev === 0) {
    return curr === 0 ? 0 : 100;
  }

  return Math.round(((curr - prev) / prev) * 100);
}

const EVENT_TYPES = [
  "Wedding",
  "Pre Wedding",
  "Baby Shoot",
  "Birthday",
  "Maternity",
  "House Warming",
  "Model/Portfolio",
  "Product Photography",
  "Drone Photography",
  "Custom",
];

export default function Reports() {
  const [bookings, setBookings] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(monthKey(new Date()));

  useEffect(() => {
    const unsub = subscribeToBookings(setBookings);

    return () => {
      if (typeof unsub === "function") {
        unsub();
      }
    };
  }, []);

  /*
   * Add month key based on CREATED DATE.
   */
  const bookingsWithMonth = useMemo(() => {
    return bookings
      .filter((b) => b.createdAt && b.createdAt.toDate)
      .map((b) => ({
        ...b,
        _monthKey: monthKey(b.createdAt.toDate()),
      }));
  }, [bookings]);

  const previousMonth = shiftMonth(selectedMonth, -1);

  const currentMonthBookings = useMemo(
    () =>
      bookingsWithMonth.filter(
        (booking) => booking._monthKey === selectedMonth
      ),
    [bookingsWithMonth, selectedMonth]
  );

  const previousMonthBookings = useMemo(
    () =>
      bookingsWithMonth.filter(
        (booking) => booking._monthKey === previousMonth
      ),
    [bookingsWithMonth, previousMonth]
  );

  function summarize(rows) {
    const revenue = rows.reduce(
      (sum, booking) => sum + (Number(booking.amount) || 0),
      0
    );

    const completed = rows.filter(
      (booking) =>
        getTopLevelStatus(
          booking.stageIndex,
          booking.cancelled
        ) === TOP_LEVEL.COMPLETED
    ).length;

    const cancelled = rows.filter((booking) => booking.cancelled).length;

    return {
      orders: rows.length,
      revenue,
      completed,
      cancelled,
    };
  }

  const current = summarize(currentMonthBookings);
  const previous = summarize(previousMonthBookings);

  const orderDelta = pctChange(current.orders, previous.orders);
  const revenueDelta = pctChange(current.revenue, previous.revenue);

  /*
   * Event-wise summary.
   */
  const eventSummary = useMemo(() => {
    return EVENT_TYPES.map((type) => {
      const rows = currentMonthBookings.filter(
        (booking) =>
          String(booking.eventType || "").toLowerCase() ===
          type.toLowerCase()
      );

      const collection = rows.reduce(
        (sum, booking) => sum + (Number(booking.amount) || 0),
        0
      );

      const cancelled = rows.filter((booking) => booking.cancelled).length;

      const completed = rows.filter(
        (booking) =>
          getTopLevelStatus(
            booking.stageIndex,
            booking.cancelled
          ) === TOP_LEVEL.COMPLETED
      ).length;

      let status = "No data";
      let statusClass = "no-data";

      if (rows.length > 0) {
        if (cancelled === rows.length) {
          status = "Cancelled";
          statusClass = "cancelled";
        } else if (completed === rows.length) {
          status = "Completed";
          statusClass = "completed";
        } else {
          status = "Active";
          statusClass = "active";
        }
      }

      return {
        type,
        orders: rows.length,
        collection,
        status,
        statusClass,
      };
    });
  }, [currentMonthBookings]);

  /*
   * Only event types having bookings are used for the chart.
   */
  const byEventType = useMemo(() => {
    return eventSummary
      .filter((item) => item.orders > 0)
      .sort((a, b) => b.orders - a.orders);
  }, [eventSummary]);

  const maxCount = Math.max(
    1,
    ...byEventType.map((item) => item.orders)
  );

  const todayMonth = monthKey(new Date());

  /*
   * Small helper for percentage text.
   */
  const deltaText = (value) => {
    if (value > 0) return `+${value}%`;
    return `${value}%`;
  };

  return (
    <Layout title="Reports">
      <div className="reports-page">

        {/* =========================
            PAGE HEADER
        ========================== */}
        <div className="reports-header">

          <div className="reports-title-area">
            <div className="reports-title-icon">
              <span>▥</span>
            </div>

            <div>
              <h1>Reports</h1>
              <p>
                Track your performance, bookings and monthly statistics at a glance.
              </p>
            </div>
          </div>

          <div className="reports-month-selector">
            <div className="month-calendar-icon">
              📅
            </div>

            <div className="month-selector-text">
              <strong>{monthLabel(selectedMonth)}</strong>
              <span>View reports for this month</span>
            </div>

            <button
              type="button"
              className="month-arrow"
              onClick={() =>
                setSelectedMonth(shiftMonth(selectedMonth, -1))
              }
              title="Previous month"
            >
              ‹
            </button>

            <button
              type="button"
              className="month-arrow"
              onClick={() =>
                setSelectedMonth(shiftMonth(selectedMonth, 1))
              }
              disabled={selectedMonth >= todayMonth}
              title="Next month"
            >
              ›
            </button>
          </div>

        </div>


        {/* =========================
            STAT CARDS
        ========================== */}
        <div className="reports-stat-grid">

          {/* Orders */}
          <div className="report-stat-card orders-card">
            <div className="report-stat-top">
              <div className="report-stat-icon blue">
                📅
              </div>

              <div className="report-stat-title">
                <span>Orders This Month</span>
                <strong>{current.orders}</strong>
              </div>
            </div>

            <div className="report-stat-bottom">
              <span
                className={
                  orderDelta >= 0
                    ? "delta positive"
                    : "delta negative"
                }
              >
                ↑ {deltaText(orderDelta)}
              </span>

              <span>vs last month</span>

              <div className="mini-chart blue-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>


          {/* Collection */}
          <div className="report-stat-card collection-card">
            <div className="report-stat-top">
              <div className="report-stat-icon green">
                ₹
              </div>

              <div className="report-stat-title">
                <span>Collection This Month</span>
                <strong>{formatMoney(current.revenue)}</strong>
              </div>
            </div>

            <div className="report-stat-bottom">
              <span
                className={
                  revenueDelta >= 0
                    ? "delta positive"
                    : "delta negative"
                }
              >
                ↑ {deltaText(revenueDelta)}
              </span>

              <span>vs last month</span>

              <div className="mini-chart green-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>


          {/* Completed */}
          <div className="report-stat-card completed-card">
            <div className="report-stat-top">
              <div className="report-stat-icon purple">
                ✓
              </div>

              <div className="report-stat-title">
                <span>Completed</span>
                <strong>{current.completed}</strong>
              </div>
            </div>

            <div className="report-stat-bottom">
              <span className="delta positive">
                ↑ 0%
              </span>

              <span>vs last month</span>

              <div className="mini-chart purple-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>


          {/* Cancelled */}
          <div className="report-stat-card cancelled-card">
            <div className="report-stat-top">
              <div className="report-stat-icon orange">
                ×
              </div>

              <div className="report-stat-title">
                <span>Cancelled</span>
                <strong>{current.cancelled}</strong>
              </div>
            </div>

            <div className="report-stat-bottom">
              <span className="delta positive">
                ↑ 0%
              </span>

              <span>vs last month</span>

              <div className="mini-chart orange-chart">
                <span />
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>
            </div>
          </div>

        </div>


        {/* =========================
            COMPARISON + QUICK INSIGHTS
        ========================== */}
        <div className="reports-middle-grid">

          {/* Monthly Comparison */}
          <div className="report-panel comparison-panel">

            <div className="panel-heading">
              <div className="panel-heading-icon blue-bg">
                ↕
              </div>

              <div>
                <h2>Monthly Orders Comparison</h2>
                <p>
                  See how your bookings performed compared to the previous month.
                </p>
              </div>

              <div className="comparison-legend">
                <span>
                  <i className="legend-dot previous-dot" />
                  {monthLabel(previousMonth)}
                </span>

                <span>
                  <i className="legend-dot current-dot" />
                  {monthLabel(selectedMonth)}
                </span>
              </div>
            </div>

            <div className="comparison-boxes">

              <div className="comparison-month previous">
                <div className="comparison-calendar purple">
                  📅
                </div>

                <div>
                  <span>{monthLabel(previousMonth)}</span>
                  <strong>{previous.orders} orders</strong>
                  <strong>{formatMoney(previous.revenue)}</strong>
                </div>
              </div>

              <div className="comparison-arrow">
                →
              </div>

              <div className="comparison-month current">
                <div className="comparison-calendar blue">
                  📅
                </div>

                <div>
                  <span>{monthLabel(selectedMonth)}</span>
                  <strong>{current.orders} orders</strong>
                  <strong>{formatMoney(current.revenue)}</strong>
                </div>
              </div>

            </div>

          </div>


          {/* Quick Insights */}
          <div className="report-panel insights-panel">

            <div className="insights-decoration">
              <span>↗</span>
              <span>▮</span>
              <span>▮</span>
              <span>▮</span>
            </div>

            <div className="insight-icon">
              💡
            </div>

            <div className="insight-content">
              <h2>Quick Insights</h2>

              <p>
                Keep track of your latest bookings,
                revenue and performance.
              </p>

              <button
                type="button"
                className="view-details-button"
                onClick={() =>
                  document
                    .querySelector(".event-summary-panel")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    })
                }
              >
                View Details
                <span>→</span>
              </button>
            </div>

          </div>

        </div>


        {/* =========================
            EVENT REPORT
        ========================== */}
        <div className="report-panel event-report-panel">

          <div className="event-report-left">

            <div className="event-heading">
              <div className="event-heading-icon">
                📅
              </div>

              <div>
                <h2>Bookings by Event Type</h2>
                <p>
                  {current.orders === 0
                    ? "No orders in this month yet."
                    : `${current.orders} order${
                        current.orders === 1 ? "" : "s"
                      } this month.`}
                </p>
              </div>
            </div>

            {byEventType.length === 0 ? (
              <div className="event-empty">

                <div className="empty-calendar">
                  📅
                </div>

                <h3>No bookings yet</h3>

                <p>
                  Create one from the Bookings page.
                </p>

                <button
                  type="button"
                  className="go-bookings-button"
                  onClick={() => {
                    window.location.href = "/admin/bookings";
                  }}
                >
                  📅
                  <span>Go to Bookings</span>
                </button>

              </div>
            ) : (
              <div className="event-bars">

                {byEventType.map((item) => (
                  <div
                    key={item.type}
                    className="event-bar-row"
                  >
                    <div className="event-bar-header">
                      <span>{item.type}</span>
                      <strong>{item.orders}</strong>
                    </div>

                    <div className="event-bar-track">
                      <div
                        className="event-bar-fill"
                        style={{
                          width: `${
                            (item.orders / maxCount) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                ))}

              </div>
            )}

          </div>


          {/* =========================
              EVENT SUMMARY TABLE
          ========================== */}
          <div className="event-summary-panel">

            <h3>Event-wise Summary</h3>

            <div className="summary-table-wrapper">
              <table className="event-summary-table">

                <thead>
                  <tr>
                    <th>Event Type</th>
                    <th>Orders</th>
                    <th>Collection</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {eventSummary.map((item, index) => (
                    <tr key={item.type}>

                      <td>
                        <div className="event-name-cell">

                          <span
                            className={`event-round-icon event-color-${index}`}
                          >
                            {item.type === "Wedding"
                              ? "💍"
                              : item.type === "Pre Wedding"
                              ? "💜"
                              : item.type === "Baby Shoot"
                              ? "👶"
                              : item.type === "Birthday"
                              ? "🎂"
                              : item.type === "Maternity"
                              ? "👩"
                              : item.type === "House Warming"
                              ? "🏠"
                              : item.type === "Model/Portfolio"
                              ? "👤"
                              : item.type === "Product Photography"
                              ? "📦"
                              : item.type === "Drone Photography"
                              ? "🚁"
                              : "✨"}
                          </span>

                          <span>{item.type}</span>

                        </div>
                      </td>

                      <td>{item.orders}</td>

                      <td>{formatMoney(item.collection)}</td>

                      <td>
                        <span
                          className={`status-pill ${item.statusClass}`}
                        >
                          {item.status}
                        </span>
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>
            </div>

          </div>

        </div>

      </div>
    </Layout>
  );
}