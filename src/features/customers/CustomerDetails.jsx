import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import { subscribeToCustomer } from "./customerService";
import { subscribeToBookings } from "../bookings/bookingService";
import { stageStatusOf } from "../../shared/statuses";
import "./CustomerDetails.css";

export default function CustomerDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsub1 = subscribeToCustomer(id, setCustomer);
    const unsub2 = subscribeToBookings((all) => {
      setBookings(all.filter((b) => b.mobile === id));
    });
    return () => {
      unsub1();
      unsub2();
    };
  }, [id]);

  if (!customer) {
    return (
      <Layout title="Customer Details">
        <div className="loading-line">Loading customer…</div>
      </Layout>
    );
  }

  return (
    <Layout title="Customer Details">
      <div className="card customer-header-card">
        <div className="avatar-circle customer-header-avatar">
          {customer.name?.[0] || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 18 }}>{customer.name}</h2>
          <div style={{ color: "var(--ink-600)", fontSize: 13, marginTop: 2 }}>{customer.mobile}</div>
          <div style={{ color: "var(--ink-400)", fontSize: 13 }}>{customer.email}</div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/admin/clients")}>
          ← Back to Clients
        </button>
      </div>

      <div className="card customer-address-card">
        <div className="customer-address-label">Address</div>
        <div className="customer-address-value">{customer.address || "—"}</div>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 18 }}>
        <div className="card stat-card">
          <div className="stat-label">Total Bookings</div>
          <div className="stat-value">{customer.totalBookings || 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">₹{Number(customer.totalSpent || 0).toLocaleString("en-IN")}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{customer.completed || 0}</div>
        </div>
        <div className="card stat-card">
          <div className="stat-label">In Progress</div>
          <div className="stat-value">{customer.inProgress || 0}</div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 12 }}>All Bookings</h3>
        {bookings.length === 0 && <div className="empty-state">No bookings for this client yet.</div>}
        {bookings.map((b) => (
          <div key={b.id} className="list-row" style={{ cursor: "pointer" }} onClick={() => navigate(`/admin/bookings/${b.id}`)}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{b.bookingCode}</div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                {b.eventDate} · ₹{Number(b.amount || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <StatusBadge label={stageStatusOf(b)} />
          </div>
        ))}
      </div>
    </Layout>
  );
}
