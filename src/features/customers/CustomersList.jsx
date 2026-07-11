import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import { subscribeToCustomers } from "./customerService";
import "./CustomersList.css";

export default function CustomersList() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = subscribeToCustomers((rows) => {
      setCustomers(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = customers.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return c.name?.toLowerCase().includes(q) || c.mobile?.includes(q);
  });

  return (
    <Layout title="Clients">
      <div className="search-box clients-search">
        <span>🔍</span>
        <input placeholder="Search clients…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card">
        {loading && <div className="loading-line">Loading clients…</div>}
        {!loading && filtered.length === 0 && <div className="empty-state">No clients yet.</div>}
        {filtered.map((c) => (
          <div key={c.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/clients/${c.id}`)}>
            <div className="avatar-circle client-avatar">
              {c.name?.[0] || "?"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{c.mobile}</div>
            </div>
            <div className="client-row-stats">
              <div style={{ fontWeight: 700, fontSize: 13 }}>₹{Number(c.totalSpent || 0).toLocaleString("en-IN")}</div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{c.totalBookings || 0} bookings</div>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
