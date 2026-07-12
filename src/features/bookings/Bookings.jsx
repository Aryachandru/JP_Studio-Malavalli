import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToBookings } from "./bookingService";
import { getTopLevelStatus, stageStatusOf, TOP_LEVEL } from "../../shared/statuses";
import "./Bookings.css";

const TABS = ["All", TOP_LEVEL.CONFIRMED, TOP_LEVEL.IN_PROGRESS, TOP_LEVEL.COMPLETED, TOP_LEVEL.CANCELLED];
const PAGE_SIZE = 6;

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToBookings((rows) => {
      setBookings(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    let rows = bookings;
    if (tab !== "All") {
      rows = rows.filter((b) => getTopLevelStatus(b.stageIndex, b.cancelled) === tab);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (b) =>
          b.bookingCode?.toLowerCase().includes(q) ||
          b.customerName?.toLowerCase().includes(q) ||
          b.mobile?.includes(q)
      );
    }
    return rows;
  }, [bookings, tab, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function changeTab(t) {
    setTab(t);
    setPage(1);
  }

  return (
    <Layout title="Bookings">
      <div className="bookings-toolbar">
        <div className="search-box bookings-search">
          <span>🔍</span>
          <input
            placeholder="Search by Booking ID, Name, Mobile…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <button className="btn btn-gold" onClick={() => navigate("/admin/bookings/new")}>
          + New Booking
        </button>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t} className={`tab-pill${tab === t ? " active" : ""}`} onClick={() => changeTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        {loading && <div className="loading-line">Loading bookings…</div>}
        {!loading && pageRows.length === 0 && <div className="empty-state">No bookings match this filter.</div>}

        {pageRows.map((b) => (
          <div
            key={b.id}
            className="list-row"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/admin/bookings/${b.id}`)}
          >
            <div className="avatar-thumb booking-avatar">
              {b.customerName?.[0] || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>
                {b.bookingCode} · {b.customerName}
              </div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                {b.eventDate} · ₹{Number(b.amount || 0).toLocaleString("en-IN")}
                {b.source === "admin" && <span className="source-tag">Booked by Client</span>}
              </div>
            </div>
            <StatusBadge label={getTopLevelStatus(b.stageIndex, b.cancelled) === TOP_LEVEL.IN_PROGRESS ? stageStatusOf(b) : getTopLevelStatus(b.stageIndex, b.cancelled)} />
          </div>
        ))}

        {totalPages > 1 && (
          <div className="pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`page-btn${page === i + 1 ? " active" : ""}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
