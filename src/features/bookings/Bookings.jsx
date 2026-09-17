import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToBookings } from "./bookingService";
import {
  getTopLevelStatus,
  stageStatusOf,
  TOP_LEVEL,
} from "../../shared/statuses";
import "./Bookings.css";

const TABS = [
  "All",
  TOP_LEVEL.CONFIRMED,
  TOP_LEVEL.IN_PROGRESS,
  TOP_LEVEL.COMPLETED,
  TOP_LEVEL.CANCELLED,
];

const PAGE_SIZE = 6;

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const navigate = useNavigate();

  /* =========================================================
     FIREBASE BOOKINGS
     ========================================================= */

  useEffect(() => {
    const unsub = subscribeToBookings((rows) => {
      setBookings(rows);
      setLoading(false);
    });

    return () => {
      if (typeof unsub === "function") {
        unsub();
      }
    };
  }, []);

  /* =========================================================
     FILTER BOOKINGS
     ========================================================= */

  const filtered = useMemo(() => {
    let rows = [...bookings];

    /* Status filter */
    if (tab !== "All") {
      rows = rows.filter(
        (b) =>
          getTopLevelStatus(b.stageIndex, b.cancelled) === tab
      );
    }

    /* Search */
    if (search.trim()) {
      const q = search.trim().toLowerCase();

      rows = rows.filter((b) => {
        const bookingCode =
          b.bookingCode?.toLowerCase() || "";

        const customerName =
          b.customerName?.toLowerCase() || "";

        const mobile =
          b.mobile?.toString().toLowerCase() || "";

        return (
          bookingCode.includes(q) ||
          customerName.includes(q) ||
          mobile.includes(q)
        );
      });
    }

    return rows;
  }, [bookings, tab, search]);

  /* =========================================================
     PAGINATION
     ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const pageRows = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  function changeTab(t) {
    setTab(t);
    setPage(1);
  }

  /* =========================================================
     STATUS COUNTS
     ========================================================= */

  const counts = useMemo(() => {
    return {
      all: bookings.length,

      confirmed: bookings.filter(
        (b) =>
          getTopLevelStatus(
            b.stageIndex,
            b.cancelled
          ) === TOP_LEVEL.CONFIRMED
      ).length,

      inProgress: bookings.filter(
        (b) =>
          getTopLevelStatus(
            b.stageIndex,
            b.cancelled
          ) === TOP_LEVEL.IN_PROGRESS
      ).length,

      completed: bookings.filter(
        (b) =>
          getTopLevelStatus(
            b.stageIndex,
            b.cancelled
          ) === TOP_LEVEL.COMPLETED
      ).length,

      cancelled: bookings.filter(
        (b) =>
          getTopLevelStatus(
            b.stageIndex,
            b.cancelled
          ) === TOP_LEVEL.CANCELLED
      ).length,
    };
  }, [bookings]);

  /* =========================================================
     TOTAL COLLECTION
     ========================================================= */

  const totalCollection = useMemo(() => {
    return bookings.reduce(
      (sum, booking) =>
        sum + (Number(booking.amount) || 0),
      0
    );
  }, [bookings]);

  /* =========================================================
     STATUS
     ========================================================= */

  function getBookingStatus(booking) {
    const topStatus = getTopLevelStatus(
      booking.stageIndex,
      booking.cancelled
    );

    if (topStatus === TOP_LEVEL.IN_PROGRESS) {
      return stageStatusOf(booking);
    }

    return topStatus;
  }

  /* =========================================================
     EVENT ICON
     ========================================================= */

  function getEventIcon(eventType) {
    const type = String(eventType || "").toLowerCase();

    if (type.includes("wedding")) return "💍";
    if (type.includes("baby")) return "👶";
    if (type.includes("birthday")) return "🎂";
    if (type.includes("maternity")) return "🤰";
    if (type.includes("house")) return "🏠";
    if (type.includes("product")) return "📦";
    if (type.includes("drone")) return "🚁";
    if (type.includes("model")) return "👤";

    return "📸";
  }

  return (
    <Layout title="Bookings">

      <div className="bookings-page">

        {/* =================================================
            PAGE HEADER
        ================================================== */}

        <div className="bookings-page-header">

          <div>
            <div className="bookings-heading-row">

              <div className="bookings-heading-icon">
                📅
              </div>

              <div>
                <h1>Bookings</h1>

                <p>
                  Manage your bookings, clients and event schedules.
                </p>
              </div>

            </div>
          </div>

          <button
            className="new-booking-button"
            onClick={() =>
              navigate("/admin/bookings/new")
            }
          >
            <span className="plus-icon">+</span>
            New Booking
          </button>

        </div>


        {/* =================================================
            SUMMARY CARDS
        ================================================== */}

        <div className="booking-summary-grid">

          <div
            className="booking-summary-card"
            onClick={() => changeTab("All")}
          >
            <div className="summary-icon blue">
              📋
            </div>

            <div className="summary-info">
              <span>Total Bookings</span>
              <strong>{counts.all}</strong>
            </div>
          </div>


          <div
            className="booking-summary-card"
            onClick={() =>
              changeTab(TOP_LEVEL.CONFIRMED)
            }
          >
            <div className="summary-icon green">
              ✓
            </div>

            <div className="summary-info">
              <span>Confirmed</span>
              <strong>{counts.confirmed}</strong>
            </div>
          </div>


          <div
            className="booking-summary-card"
            onClick={() =>
              changeTab(TOP_LEVEL.IN_PROGRESS)
            }
          >
            <div className="summary-icon purple">
              ◷
            </div>

            <div className="summary-info">
              <span>In Progress</span>
              <strong>{counts.inProgress}</strong>
            </div>
          </div>


          <div className="booking-summary-card">

            <div className="summary-icon orange">
              ₹
            </div>

            <div className="summary-info">
              <span>Total Collection</span>

              <strong>
                ₹
                {totalCollection.toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

          </div>

        </div>


        {/* =================================================
            SEARCH + FILTER SECTION
        ================================================== */}

        <div className="bookings-control-panel">

          <div className="bookings-toolbar">

            <div className="modern-search-box">

              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Search by Booking ID, Name, Mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />

              {search && (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearch("");
                    setPage(1);
                  }}
                >
                  ×
                </button>
              )}

            </div>

          </div>


          {/* FILTER TABS */}

          <div className="booking-filter-row">

            {TABS.map((t) => {

              let count = counts.all;

              if (t === TOP_LEVEL.CONFIRMED) {
                count = counts.confirmed;
              }

              if (t === TOP_LEVEL.IN_PROGRESS) {
                count = counts.inProgress;
              }

              if (t === TOP_LEVEL.COMPLETED) {
                count = counts.completed;
              }

              if (t === TOP_LEVEL.CANCELLED) {
                count = counts.cancelled;
              }

              return (
                <button
                  key={t}
                  className={`booking-filter ${
                    tab === t ? "active" : ""
                  }`}
                  onClick={() => changeTab(t)}
                >
                  <span>{t}</span>

                  <span className="filter-count">
                    {count}
                  </span>
                </button>
              );
            })}

          </div>

        </div>


        {/* =================================================
            BOOKINGS LIST
        ================================================== */}

        <div className="bookings-list-card">

          {/* LIST HEADER */}

          <div className="bookings-list-header">

            <div>
              <h2>Recent Bookings</h2>

              <p>
                {filtered.length} booking
                {filtered.length === 1 ? "" : "s"} found
              </p>
            </div>

            <div className="booking-header-count">
              {filtered.length}
            </div>

          </div>


          {/* LOADING */}

          {loading && (
            <div className="bookings-loading">

              <div className="loading-spinner"></div>

              <span>
                Loading bookings...
              </span>

            </div>
          )}


          {/* EMPTY */}

          {!loading && pageRows.length === 0 && (
            <div className="bookings-empty">

              <div className="empty-booking-icon">
                📅
              </div>

              <h3>
                No bookings found
              </h3>

              <p>
                {search
                  ? "Try changing your search."
                  : "Create a new booking to get started."}
              </p>

              {!search && (
                <button
                  className="empty-create-button"
                  onClick={() =>
                    navigate("/admin/bookings/new")
                  }
                >
                  + New Booking
                </button>
              )}

            </div>
          )}


          {/* BOOKING CARDS */}

          {!loading && pageRows.length > 0 && (
            <div className="booking-items">

              {pageRows.map((b) => {

                const status = getBookingStatus(b);

                return (
                  <div
                    key={b.id}
                    className="booking-item"
                    onClick={() =>
                      navigate(
                        `/admin/bookings/${b.id}`
                      )
                    }
                  >

                    {/* LEFT ICON */}

                    <div className="booking-event-icon">
                      {getEventIcon(b.eventType)}
                    </div>


                    {/* MAIN INFORMATION */}

                    <div className="booking-main-info">

                      <div className="booking-title-row">

                        <h3>
                          {b.customerName ||
                            "Unknown Client"}
                        </h3>

                        <span className="booking-code">
                          {b.bookingCode ||
                            "No ID"}
                        </span>

                      </div>


                      <div className="booking-details-row">

                        <span>
                          📅{" "}
                          {b.eventDate ||
                            "Date not set"}
                        </span>

                        <span className="detail-divider">
                          •
                        </span>

                        <span>
                          📱{" "}
                          {b.mobile ||
                            "No mobile"}
                        </span>

                        <span className="detail-divider">
                          •
                        </span>

                        <span className="booking-amount">
                          ₹
                          {Number(
                            b.amount || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </span>

                      </div>


                      <div className="booking-meta-row">

                        {b.eventType && (
                          <span className="event-type-tag">
                            {b.eventType}
                          </span>
                        )}

                        {b.source === "admin" && (
                          <span className="source-tag admin-source">
                            👤 Booked by Admin
                          </span>
                        )}

                        {b.source === "public" && (
                          <span className="source-tag client-source">
                            🌐 Booked by Client
                          </span>
                        )}

                      </div>

                    </div>


                    {/* RIGHT SIDE */}

                    <div className="booking-right">

                      <StatusBadge
                        label={status}
                      />

                      <span className="booking-view-arrow">
                        →
                      </span>

                    </div>

                  </div>
                );
              })}

            </div>
          )}


          {/* =================================================
              PAGINATION
          ================================================== */}

          {!loading &&
            pageRows.length > 0 &&
            totalPages > 1 && (

              <div className="booking-pagination">

                <button
                  className="pagination-arrow"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((p) =>
                      Math.max(1, p - 1)
                    )
                  }
                >
                  ‹
                </button>


                {Array.from({
                  length: totalPages,
                }).map((_, i) => {

                  const pageNumber = i + 1;

                  return (
                    <button
                      key={pageNumber}
                      className={`pagination-number ${
                        page === pageNumber
                          ? "active"
                          : ""
                      }`}
                      onClick={() =>
                        setPage(pageNumber)
                      }
                    >
                      {pageNumber}
                    </button>
                  );
                })}


                <button
                  className="pagination-arrow"
                  disabled={page === totalPages}
                  onClick={() =>
                    setPage((p) =>
                      Math.min(
                        totalPages,
                        p + 1
                      )
                    )
                  }
                >
                  ›
                </button>

              </div>
            )}

        </div>

      </div>

    </Layout>
  );
}