import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToOffers, createOffer, updateOffer, deleteOffer, toggleOfferActive } from "./offerService";
import "./AdminOffers.css";

const EMPTY_FORM = { title: "", message: "", active: true };

export default function AdminOffers() {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    const unsub = subscribeToOffers((rows) => {
      setOffers(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  function openNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(offer) {
    setForm(offer);
    setEditingId(offer.id);
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.title || !form.message) {
      alert("Please fill in both a title and message.");
      return;
    }
    if (editingId) {
      await updateOffer(editingId, { title: form.title, message: form.message, active: form.active });
    } else {
      await createOffer(form);
    }
    setShowForm(false);
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this offer?")) await deleteOffer(id);
  }

  return (
    <Layout title="Offers & Announcements">
      <p className="offers-intro">
        Offers you mark Active show as a banner on the public homepage — great for seasonal discounts
        ("10% off wedding packages this month") or announcements ("New drone shoot add-on available!").
      </p>

      <div className="offers-toolbar">
        <button className="btn btn-gold" onClick={openNew}>
          + New Offer
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 18 }}>
          <h3 style={{ marginBottom: 14 }}>{editingId ? "Edit Offer" : "New Offer"}</h3>
          <div className="field">
            <label>Title</label>
            <input
              placeholder="e.g. Monsoon Special"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="field">
            <label>Message</label>
            <textarea
              rows={2}
              placeholder="e.g. Get 10% off all Wedding packages booked this July!"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <div className="field">
            <label className="offer-active-toggle">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
              />
              Show this on the public site right now
            </label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-gold" onClick={handleSave}>
              Save Offer
            </button>
            <button className="btn btn-ghost" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="card">
        {loading && <div className="loading-line">Loading offers…</div>}
        {!loading && offers.length === 0 && <div className="empty-state">No offers yet. Create your first one above.</div>}
        {offers.map((o) => (
          <div key={o.id} className="list-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{o.title}</div>
              <div style={{ fontSize: 13, color: "var(--ink-600)" }}>{o.message}</div>
              <span
                className="badge offer-status-badge"
                style={{
                  background: o.active ? "var(--green-bg)" : "#eef0f5",
                  color: o.active ? "var(--green)" : "var(--ink-400)",
                }}
                onClick={() => toggleOfferActive(o.id, o.active)}
              >
                {o.active ? "Live on site" : "Hidden"}
              </span>
            </div>
            <button className="btn btn-ghost" onClick={() => openEdit(o)}>✏️</button>
            <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={() => handleDelete(o.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
