import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import {
  subscribeToTestimonials,
  approveTestimonial,
  unapproveTestimonial,
  toggleFeatured,
  deleteTestimonial,
} from "./testimonialService";
import { useDialog } from "../../shared/DialogProvider";
import "./AdminTestimonials.css";

const TABS = ["Pending", "Approved", "All"];

export default function AdminTestimonials() {
  const { confirmDialog } = useDialog();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Pending");

  useEffect(() => {
    const unsub = subscribeToTestimonials((rows) => {
      setItems(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered =
    tab === "Pending" ? items.filter((t) => !t.approved) :
    tab === "Approved" ? items.filter((t) => t.approved) :
    items;

  async function handleDelete(id) {
    if (await confirmDialog("Delete this review permanently?", { tone: "warning", confirmLabel: "Delete" })) {
      await deleteTestimonial(id);
    }
  }

  return (
    <Layout title="Testimonials">
      <p className="testimonials-intro">
        New reviews land here as "Pending" and won't show on your public site until you Approve them.
        Mark a few as "Featured" to have them prioritized on the homepage.
      </p>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t} className={`tab-pill${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t}
            {t === "Pending" && items.some((i) => !i.approved) && (
              <span className="pending-count">{items.filter((i) => !i.approved).length}</span>
            )}
          </button>
        ))}
      </div>

      <div className="card">
        {loading && <div className="loading-line">Loading reviews…</div>}
        {!loading && filtered.length === 0 && <div className="empty-state">Nothing here yet.</div>}

        {filtered.map((t) => (
          <div key={t.id} className="testimonial-admin-row">
            <div className="testimonial-admin-stars">{"★".repeat(t.rating)}{"☆".repeat(5 - t.rating)}</div>
            <div className="testimonial-admin-body">
              <div className="testimonial-admin-name">
                {t.customerName}
                {t.bookingCode && <span className="testimonial-admin-code"> · {t.bookingCode}</span>}
              </div>
              <p className="testimonial-admin-message">{t.message}</p>
            </div>
            <div className="testimonial-admin-actions">
              {t.approved ? (
                <button className="btn btn-ghost" onClick={() => unapproveTestimonial(t.id)}>Unapprove</button>
              ) : (
                <button className="btn btn-outline" onClick={() => approveTestimonial(t.id)}>Approve</button>
              )}
              <button
                className={`btn btn-ghost${t.featured ? " testimonial-featured-active" : ""}`}
                onClick={() => toggleFeatured(t.id, t.featured)}
              >
                {t.featured ? "★ Featured" : "☆ Feature"}
              </button>
              <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={() => handleDelete(t.id)}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}