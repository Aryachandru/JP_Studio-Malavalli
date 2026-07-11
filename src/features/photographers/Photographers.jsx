import React, { useEffect, useMemo, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToBookings } from "../bookings/bookingService";
import "./Photographers.css";

// Photographers aren't a first-class collection in the mockup, so this
// page derives a live roster + workload straight from booking records.
// Swap in a dedicated `photographers` Firestore collection any time.
export default function Photographers() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const unsub = subscribeToBookings(setBookings);
    return () => unsub();
  }, []);

  const roster = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      const name = b.photographer || "Unassigned";
      if (!map[name]) map[name] = { name, total: 0, active: 0 };
      map[name].total += 1;
      if (!b.cancelled && (b.stageIndex ?? 0) < 6) map[name].active += 1;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [bookings]);

  return (
    <Layout title="Photographers">
      <div className="card">
        <h3 style={{ marginBottom: 14 }}>Photographer Workload</h3>
        {roster.length === 0 && <div className="empty-state">No bookings assigned yet.</div>}
        {roster.map((p) => (
          <div key={p.name} className="list-row">
            <div className="avatar-circle photographer-avatar">
              {p.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "var(--ink-400)" }}>{p.active} active project(s)</div>
            </div>
            <div style={{ fontWeight: 700 }}>{p.total} total</div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
