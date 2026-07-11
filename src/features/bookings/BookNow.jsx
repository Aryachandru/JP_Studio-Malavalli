import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { createBooking } from "./bookingService";
import { upsertCustomerFromBooking } from "../customers/customerService";
import { subscribeToPackages, PACKAGE_CATEGORIES } from "../packages/packageService";
import "./BookNow.css";

const STEPS = ["Event Details", "Package", "Review", "Confirmation"];

export default function BookNow() {
  const [searchParams] = useSearchParams();
  const preselectedPackage = searchParams.get("package") || "";

  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [confirmedCode, setConfirmedCode] = useState(null);
  const [form, setForm] = useState({
    customerName: "",
    mobile: "",
    email: "",
    eventType: "",
    eventDate: "",
    location: "",
    packageName: preselectedPackage,
    amount: "",
  });

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      const active = rows.filter((p) => p.status === "Active");
      setPackages(active);
      // If arriving with ?package=Name, lock in its price (and event type) too.
      if (preselectedPackage) {
        const match = active.find((p) => p.name === preselectedPackage);
        if (match) {
          setForm((f) => ({ ...f, packageName: match.name, amount: match.price, eventType: f.eventType || match.category }));
        }
      }
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cascading dropdown: only show packages that match the chosen event type.
  // If the customer picked "Wedding", only Wedding packages appear in Step 2.
  const packagesForEventType = form.eventType
    ? packages.filter((p) => p.category === form.eventType)
    : packages;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function next() {
    if (step === 0 && (!form.customerName || !form.mobile || !form.eventDate || !form.eventType)) {
      alert("Please fill in your name, mobile number, event type and date.");
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
      const { id } = await createBooking(form, "public");
      await upsertCustomerFromBooking(form);
      setConfirmedCode(id);
      setStep(3);
    } catch (err) {
      alert("Something went wrong, please try again: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Book Your Session</h1>
        <p>Takes less than two minutes — we'll confirm your slot shortly after.</p>
      </section>

      <section className="section">
        <div className="card wizard-card">
          {step < 3 && (
            <div className="steps-row">
              {STEPS.slice(0, 3).map((label, idx) => (
                <div key={label} className={`step-item${idx < step ? " done" : idx === step ? " active" : ""}`}>
                  <div className="step-circle">{idx < step ? "✓" : idx + 1}</div>
                  <span className="step-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <div>
              <div className="field">
                <label>Your Name</label>
                <input placeholder="Enter your full name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} />
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
                  onChange={(e) => {
                    update("eventType", e.target.value);
                    // Changing event type resets any package chosen from a
                    // different category, since it would no longer be valid.
                    setForm((f) => ({ ...f, eventType: e.target.value, packageName: "", amount: "" }));
                  }}
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
                <input placeholder="Venue / city" value={form.location} onChange={(e) => update("location", e.target.value)} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h3 style={{ marginBottom: 4 }}>Choose a Package</h3>
              <p className="wizard-note" style={{ marginBottom: 12 }}>
                Showing {form.eventType || "all"} packages{form.eventType ? "" : " — pick an event type in Step 1 to narrow this down"}.
              </p>
              {packagesForEventType.length === 0 && (
                <div className="empty-state">No {form.eventType} packages available right now.</div>
              )}
              {packagesForEventType.map((p) => (
                <div
                  key={p.id}
                  className={`list-row package-option${form.packageName === p.name ? " selected" : ""}`}
                  onClick={() => selectPackage(p)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-400)" }}>₹{Number(p.price).toLocaleString("en-IN")}</div>
                    {p.inclusions && p.inclusions.length > 0 && (
                      <div style={{ fontSize: 11, color: "var(--ink-400)", marginTop: 4 }}>
                        {p.inclusions.slice(0, 3).join(" · ")}
                      </div>
                    )}
                  </div>
                  {form.packageName === p.name && <span style={{ color: "var(--gold-600)" }}>✓ Selected</span>}
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 style={{ marginBottom: 14 }}>Review &amp; Confirm</h3>
              <SummaryRow label="Name" value={form.customerName} />
              <SummaryRow label="Mobile" value={form.mobile} />
              <SummaryRow label="Event" value={`${form.eventType} · ${form.eventDate}`} />
              <SummaryRow label="Location" value={form.location} />
              <SummaryRow label="Package" value={form.packageName} />
              <SummaryRow label="Amount" value={`₹${Number(form.amount || 0).toLocaleString("en-IN")}`} />
              <p className="wizard-note">
                By confirming, our team will reach out on your mobile number to finalize details.
              </p>
            </div>
          )}

          {step === 3 && confirmedCode && (
            <div className="booking-success">
              <div className="booking-success-icon">✓</div>
              <h2>Booking Confirmed!</h2>
              <p>Your booking code is</p>
              <div className="booking-success-code">{confirmedCode}</div>
              <p className="wizard-note">
                Save this code — you'll need it along with your mobile number to track your booking status.
              </p>
              <div className="wizard-actions">
                <Link to={`/track?code=${confirmedCode}`} className="btn btn-gold" style={{ flex: 1, justifyContent: "center" }}>
                  Track This Booking
                </Link>
                <Link to="/" className="btn btn-ghost" style={{ flex: 1, justifyContent: "center" }}>
                  Back to Home
                </Link>
              </div>
            </div>
          )}

          {step < 3 && (
            <div className="wizard-actions">
              {step > 0 && (
                <button className="btn btn-ghost" onClick={back}>
                  Back
                </button>
              )}
              {step < 2 ? (
                <button className="btn btn-gold" style={{ flex: 1 }} onClick={next}>
                  Next
                </button>
              ) : (
                <button className="btn btn-gold" style={{ flex: 1 }} onClick={handleConfirm} disabled={saving}>
                  {saving ? "Booking…" : "Confirm Booking"}
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
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
