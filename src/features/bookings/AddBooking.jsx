import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../adminShell/Layout";
import { createBooking } from "./bookingService";
import { upsertCustomerFromBooking } from "../customers/customerService";
import { subscribeToPackages, PACKAGE_CATEGORIES } from "../packages/packageService";
import "./AddBooking.css";

const STEPS = ["Event Details", "Package", "Payment", "Confirmation"];

export default function AddBooking() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    eventType: "",
    eventDate: "",
    location: "",
    packageName: "",
    amount: "",
    photographer: "",
    advancePaid: "",
  });

  useEffect(() => {
    const unsub1 = subscribeToPackages(setPackages);
    return () => {
      unsub1();
    };
  }, []);

  // Cascading dropdown: only show packages matching the chosen event type.
  const packagesForEventType = form.eventType
    ? packages.filter((p) => p.category === form.eventType)
    : packages;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    if (step === 0 && (!form.customerName || !form.mobile || !form.eventDate)) {
      alert("Please fill in customer name, mobile number and event date.");
      return;
    }
    if (step === 1 && !form.packageName) {
      alert("Please select a package.");
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function back() {
    setStep((s) => Math.max(s - 1, 0));
  }

  function selectPackage(pkg) {
    update("packageName", pkg.name);
    update("amount", pkg.price);
  }

  async function handleConfirm() {
    setSaving(true);
    try {
      const { id } = await createBooking(form, "admin");
      await upsertCustomerFromBooking(form);
      navigate(`/admin/bookings/${id}`);
    } catch (err) {
      alert("Something went wrong: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout title="Add New Booking">
      <div className="card wizard-card">
        <div className="steps-row">
          {STEPS.map((label, idx) => (
            <div key={label} className={`step-item${idx < step ? " done" : idx === step ? " active" : ""}`}>
              <div className="step-circle">{idx < step ? "✓" : idx + 1}</div>
              <span className="step-label">{label}</span>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div>
            <div className="field">
              <label>Customer Name</label>
              <input placeholder="Enter full name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
            </div>
            <div className="field">
              <label>Mobile Number</label>
              <input placeholder="Enter mobile number" value={form.mobile} onChange={(e) => update("mobile", e.target.value)} />
            </div>
            <div className="field">
              <label>Email (Optional)</label>
              <input placeholder="Enter email" value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="field">
              <label>Event Type</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value, packageName: "", amount: "" }))}
              >
                <option value="">Select event type</option>
                {PACKAGE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Event Date</label>
              <input type="date" value={form.eventDate} onChange={(e) => update("eventDate", e.target.value)} />
            </div>
            <div className="field">
              <label>Event Location</label>
              <input placeholder="Enter location" value={form.location} onChange={(e) => update("location", e.target.value)} />
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: 4 }}>Choose a Package</h3>
            <p style={{ fontSize: 12, color: "var(--ink-400)", marginBottom: 12 }}>
              Showing {form.eventType || "all"} packages.
            </p>
            {packagesForEventType.length === 0 && <div className="empty-state">No {form.eventType} packages found. Add one from the Packages page.</div>}
            {packagesForEventType.map((p) => (
              <div
                key={p.id}
                className={`list-row package-option${form.packageName === p.name ? " selected" : ""}`}
                onClick={() => selectPackage(p)}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-400)" }}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                </div>
                {form.packageName === p.name && <span style={{ color: "var(--gold-600)" }}>✓ Selected</span>}
              </div>
            ))}
            <div className="field" style={{ marginTop: 16 }}>
              <label>Photographer</label>
              <input placeholder="Assign a photographer" value={form.photographer} onChange={(e) => update("photographer", e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="field">
              <label>Total Package Amount</label>
              <input type="number" value={form.amount} onChange={(e) => update("amount", e.target.value)} />
            </div>
            <div className="field">
              <label>Advance Paid (Optional)</label>
              <input type="number" placeholder="0" value={form.advancePaid} onChange={(e) => update("advancePaid", e.target.value)} />
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-400)" }}>
              Balance due: ₹{(Number(form.amount || 0) - Number(form.advancePaid || 0)).toLocaleString("en-IN")}
            </p>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 style={{ marginBottom: 14 }}>Review &amp; Confirm</h3>
            <SummaryRow label="Customer" value={form.customerName} />
            <SummaryRow label="Mobile" value={form.mobile} />
            <SummaryRow label="Event" value={`${form.eventType} · ${form.eventDate}`} />
            <SummaryRow label="Location" value={form.location} />
            <SummaryRow label="Package" value={form.packageName} />
            <SummaryRow label="Photographer" value={form.photographer || "Unassigned"} />
            <SummaryRow label="Amount" value={`₹${Number(form.amount || 0).toLocaleString("en-IN")}`} />
          </div>
        )}

        <div className="wizard-actions">
          {step > 0 && (
            <button className="btn btn-ghost" onClick={back}>
              Back
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={next}>
              Next
            </button>
          ) : (
            <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleConfirm} disabled={saving}>
              {saving ? "Creating…" : "Confirm Booking"}
            </button>
          )}
        </div>
      </div>
    </Layout>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="summary-row">
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
    </div>
  );
}
