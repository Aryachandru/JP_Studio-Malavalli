import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import StatusBadge from "../../shared/StatusBadge";
import {
  subscribeToBooking,
  updateBookingStage,
  updateBooking,
  cancelBooking,
  addPayment,
  removePayment,
  totalPaid,
} from "./bookingService";
import { markCustomerBookingCompleted } from "../customers/customerService";
import { STAGES, getTopLevelStatus, stageStatusOf } from "../../shared/statuses";
import { useDialog } from "../../shared/DialogProvider";
import Dropdown from "../../shared/Dropdown";
import "./BookingDetails.css";

const TABS = ["Details", "Status Timeline", "Payments", "Photo Links", "Notes"];

export default function BookingDetails() {
  const { alertDialog, confirmDialog } = useDialog();
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [tab, setTab] = useState("Details");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [nextStage, setNextStage] = useState("");
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentNote, setPaymentNote] = useState("");
  const [savingPayment, setSavingPayment] = useState(false);
  const [photoSelectionLink, setPhotoSelectionLink] = useState("");
  const [deliveryLink, setDeliveryLink] = useState("");
  const [savingLinks, setSavingLinks] = useState(false);

  useEffect(() => {
    const unsub = subscribeToBooking(id, (data) => {
      setBooking(data);
      if (data) {
        setForm(data);
        setPhotoSelectionLink(data.photoSelectionLink || "");
        setDeliveryLink(data.deliveryLink || "");
        const idx = Math.min((data.stageIndex ?? 0) + 1, STAGES.length - 1);
        setNextStage(STAGES[idx]);
      }
    });
    return () => unsub();
  }, [id]);

  if (!booking) {
    return (
      <Layout title="Booking Details">
        <div className="loading-line">Loading booking…</div>
      </Layout>
    );
  }

  const topStatus = getTopLevelStatus(booking.stageIndex, booking.cancelled);

  async function handleSaveEdit() {
    setSaving(true);
    await updateBooking(id, {
      customerName: form.customerName,
      mobile: form.mobile,
      email: form.email,
      eventType: form.eventType,
      eventDate: form.eventDate,
      location: form.location,
      packageName: form.packageName,
      amount: Number(form.amount) || 0,
      photographer: form.photographer,
    });
    setSaving(false);
    setEditing(false);
  }

  async function handleUpdateStatus() {
    const targetIndex = STAGES.indexOf(nextStage);
    if (targetIndex < 0) return;
    setSaving(true);
    await updateBookingStage(id, targetIndex, booking.stageHistory || []);
    if (targetIndex === STAGES.length - 1) {
      await markCustomerBookingCompleted(booking.mobile);
    }
    setSaving(false);
  }

  async function handleCancel() {
    if (await confirmDialog("Cancel this booking? This cannot be undone from here.", { tone: "warning", confirmLabel: "Cancel Booking" })) {
      await cancelBooking(id);
    }
  }

  async function handleAddPayment() {
    if (!paymentAmount || Number(paymentAmount) <= 0) {
      await alertDialog("Enter a payment amount greater than 0.");
      return;
    }
    setSavingPayment(true);
    try {
      await addPayment(id, booking.payments, {
        amount: paymentAmount,
        method: paymentMethod,
        note: paymentNote,
      });
      setPaymentAmount("");
      setPaymentNote("");
    } finally {
      setSavingPayment(false);
    }
  }

  async function handleRemovePayment(index) {
    if (await confirmDialog("Remove this payment entry?", { tone: "warning", confirmLabel: "Remove" })) {
      await removePayment(id, booking.payments, index);
    }
  }

  async function handleSaveLinks() {
    setSavingLinks(true);
    try {
      await updateBooking(id, {
        photoSelectionLink: photoSelectionLink.trim(),
        deliveryLink: deliveryLink.trim(),
      });
      await alertDialog("Links saved — the customer will see these on their Track Booking page.", { tone: "success" });
    } finally {
      setSavingLinks(false);
    }
  }

  return (
    <Layout title="Booking Details">
      <div className="card booking-header-card">
        <div className="avatar-thumb booking-header-avatar">
          {booking.customerName?.[0] || "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div className="booking-header-title-row">
            <h2 style={{ fontSize: 18 }}>{booking.bookingCode}</h2>
            <StatusBadge label={topStatus} />
          </div>
          <div style={{ color: "var(--ink-600)", fontSize: 14, marginTop: 4 }}>{booking.packageName}</div>
          <div style={{ color: "var(--ink-400)", fontSize: 12, marginTop: 2 }}>
            Booked on {booking.createdAt?.toDate ? booking.createdAt.toDate().toLocaleDateString() : "—"}
          </div>
        </div>
        <button className="btn btn-ghost" onClick={() => navigate("/admin/bookings")}>
          ← Back to Bookings
        </button>
      </div>

      <div className="tab-row">
        {TABS.map((t) => (
          <button key={t} className={`tab-pill${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-2 booking-details-grid">
        {/* LEFT: tab content */}
        <div className="card">
          {tab === "Details" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
                <h3>Booking Information</h3>
                <button className="btn btn-outline" onClick={() => setEditing((e) => !e)}>
                  {editing ? "Cancel Edit" : "Edit Booking"}
                </button>
              </div>

              {!editing ? (
                <InfoGrid booking={booking} />
              ) : (
                <EditForm form={form} setForm={setForm} onSave={handleSaveEdit} saving={saving} />
              )}
            </>
          )}

          {tab === "Status Timeline" && (
            <>
              <h3 style={{ marginBottom: 16 }}>Current Status</h3>
              <div className="timeline">
                {STAGES.map((stage, idx) => {
                  const state =
                    idx < (booking.stageIndex ?? 0)
                      ? "done"
                      : idx === (booking.stageIndex ?? 0)
                      ? "active"
                      : "";
                  const historyEntry = (booking.stageHistory || []).find((h) => h.stage === stage);
                  return (
                    <div key={stage} className={`timeline-item ${state}`}>
                      <div className="timeline-dot">{state === "done" ? "✓" : ""}</div>
                      <div className="t-title">{stage}</div>
                      <div className="t-date">
                        {historyEntry
                          ? new Date(historyEntry.date).toLocaleString()
                          : state === "active"
                          ? "In Progress"
                          : "Upcoming"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {tab === "Payments" && (
            <>
              <h3 style={{ marginBottom: 14 }}>Payments</h3>

              {(() => {
                const paid = totalPaid(booking.payments);
                const total = Number(booking.amount) || 0;
                const balance = total - paid;
                return (
                  <div className="payment-summary-grid">
                    <div className="payment-summary-box">
                      <div className="payment-summary-label">Total Package Amount</div>
                      <div className="payment-summary-value">₹{total.toLocaleString("en-IN")}</div>
                    </div>
                    <div className="payment-summary-box paid">
                      <div className="payment-summary-label">Received So Far</div>
                      <div className="payment-summary-value">₹{paid.toLocaleString("en-IN")}</div>
                    </div>
                    <div className={`payment-summary-box ${balance > 0 ? "due" : "clear"}`}>
                      <div className="payment-summary-label">{balance > 0 ? "Balance Due" : "Fully Paid"}</div>
                      <div className="payment-summary-value">₹{Math.max(balance, 0).toLocaleString("en-IN")}</div>
                    </div>
                  </div>
                );
              })()}

              <h4 className="payment-history-head">Payment History</h4>
              {(!booking.payments || booking.payments.length === 0) && (
                <div className="empty-state">No payments recorded yet — add the first one below.</div>
              )}
              {(booking.payments || []).map((p, i) => (
                <div key={i} className="list-row payment-row">
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>
                      ₹{Number(p.amount).toLocaleString("en-IN")} · {p.method}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>
                      {new Date(p.date).toLocaleString()}{p.note ? ` · ${p.note}` : ""}
                    </div>
                  </div>
                  <button className="btn btn-ghost" style={{ color: "var(--red)" }} onClick={() => handleRemovePayment(i)}>
                    ✕
                  </button>
                </div>
              ))}

              <div className="payment-add-form">
                <h4 className="payment-history-head">Record a Payment</h4>
                <div className="grid grid-2">
                  <div className="field">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 10000"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label>Method</label>
                    <Dropdown
                      options={["Cash", "UPI", "Bank Transfer", "Card", "Other"]}
                      value={paymentMethod}
                      onChange={setPaymentMethod}
                    />
                  </div>
                </div>
                <div className="field">
                  <label>Note (Optional)</label>
                  <input
                    placeholder="e.g. Advance payment"
                    value={paymentNote}
                    onChange={(e) => setPaymentNote(e.target.value)}
                  />
                </div>
                <button className="btn btn-gold" onClick={handleAddPayment} disabled={savingPayment}>
                  {savingPayment ? "Saving…" : "Add Payment"}
                </button>
              </div>
            </>
          )}

          {tab === "Photo Links" && (
            <>
              <h3 style={{ marginBottom: 6 }}>Photo Links</h3>
              <p className="photo-links-intro">
                Paste a Google Drive (or any) folder link here instead of uploading individual photos —
                customers get one link to browse and download at their own pace, on their own device,
                without straining anyone's storage. Whatever you save here shows up immediately on the
                customer's Track Booking page.
              </p>

              <div className="field">
                <label>
                  📸 Photo Selection Link
                  {photoSelectionLink && <span className="photo-link-status added">Added</span>}
                </label>
                <input
                  placeholder="https://drive.google.com/drive/folders/…"
                  value={photoSelectionLink}
                  onChange={(e) => setPhotoSelectionLink(e.target.value)}
                />
                <p className="photo-links-hint">
                  Share this once raw/proof photos are ready for the customer to pick their favorites.
                </p>
              </div>

              <div className="field">
                <label>
                  🎉 Final Delivery Link
                  {deliveryLink && <span className="photo-link-status added">Added</span>}
                </label>
                <input
                  placeholder="https://drive.google.com/drive/folders/…"
                  value={deliveryLink}
                  onChange={(e) => setDeliveryLink(e.target.value)}
                />
                <p className="photo-links-hint">
                  Share this once final edited photos are ready — typically when you move this booking to
                  "Ready for Delivery".
                </p>
              </div>

              <button className="btn btn-gold" onClick={handleSaveLinks} disabled={savingLinks}>
                {savingLinks ? "Saving…" : "Save Links"}
              </button>
            </>
          )}

          {tab === "Notes" && (
            <>
              <h3 style={{ marginBottom: 14 }}>Internal Notes</h3>
              <div className="field">
                <textarea rows={4} placeholder="Add a note about this booking…" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
              <button
                className="btn btn-gold"
                onClick={async () => {
                  const notes = [...(booking.notes || []), { text: note, date: new Date().toISOString() }];
                  await updateBooking(id, { notes });
                  setNote("");
                }}
                disabled={!note.trim()}
              >
                Save Note
              </button>
              <div style={{ marginTop: 16 }}>
                {(booking.notes || []).slice().reverse().map((n, i) => (
                  <div key={i} className="list-row">
                    <div>
                      <div style={{ fontSize: 13 }}>{n.text}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-400)" }}>{new Date(n.date).toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* RIGHT: Update status panel */}
        <div className="card">
          <h3 style={{ marginBottom: 14 }}>Update Status</h3>
          <div className="field">
            <label>Update Status To</label>
            <Dropdown options={STAGES} value={nextStage} onChange={setNextStage} />
          </div>
          <button className="btn btn-gold btn-block" onClick={handleUpdateStatus} disabled={saving}>
            {saving ? "Updating…" : "Update Status"}
          </button>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <div style={{ fontSize: 13, color: "var(--ink-600)", marginBottom: 8 }}>Current stage</div>
            <StatusBadge label={stageStatusOf(booking)} />
          </div>

          {!booking.cancelled && (
            <button className="btn btn-ghost btn-block" style={{ marginTop: 16, color: "var(--red)" }} onClick={handleCancel}>
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

function InfoGrid({ booking }) {
  const rows = [
    ["Customer Name", booking.customerName],
    ["Mobile Number", booking.mobile],
    ["Email", booking.email || "—"],
    ["Event Type", booking.eventType],
    ["Event Date", booking.eventDate],
    ["Location", booking.location],
    ["Package", booking.packageName],
    ["Amount", `₹${Number(booking.amount || 0).toLocaleString("en-IN")}`],
    ["Photographer", booking.photographer || "Unassigned"],
  ];
  return (
    <div className="grid grid-2">
      {rows.map(([label, value]) => (
        <div key={label} className="info-grid-item">
          <div className="info-grid-label">{label}</div>
          <div className="info-grid-value">{value}</div>
        </div>
      ))}
    </div>
  );
}

function EditForm({ form, setForm, onSave, saving }) {
  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }
  return (
    <div>
      <div className="grid grid-2">
        <div className="field">
          <label>Customer Name</label>
          <input value={form.customerName || ""} onChange={(e) => update("customerName", e.target.value)} />
        </div>
        <div className="field">
          <label>Mobile Number</label>
          <input value={form.mobile || ""} onChange={(e) => update("mobile", e.target.value)} />
        </div>
        <div className="field">
          <label>Email</label>
          <input value={form.email || ""} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div className="field">
          <label>Event Type</label>
          <input value={form.eventType || ""} onChange={(e) => update("eventType", e.target.value)} />
        </div>
        <div className="field">
          <label>Event Date</label>
          <input type="date" value={form.eventDate || ""} onChange={(e) => update("eventDate", e.target.value)} />
        </div>
        <div className="field">
          <label>Location</label>
          <input value={form.location || ""} onChange={(e) => update("location", e.target.value)} />
        </div>
        <div className="field">
          <label>Package</label>
          <input value={form.packageName || ""} onChange={(e) => update("packageName", e.target.value)} />
        </div>
        <div className="field">
          <label>Amount</label>
          <input type="number" value={form.amount || 0} onChange={(e) => update("amount", e.target.value)} />
        </div>
        <div className="field">
          <label>Photographer</label>
          <input value={form.photographer || ""} onChange={(e) => update("photographer", e.target.value)} />
        </div>
      </div>
      <button className="btn btn-gold" onClick={onSave} disabled={saving}>
        {saving ? "Saving…" : "Save Changes"}
      </button>
    </div>
  );
}