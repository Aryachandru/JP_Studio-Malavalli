import React, { useEffect, useRef, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { createBooking, subscribeToBookedDates } from "./bookingService";
import BookingCalendar from "./BookingCalendar";
import Dropdown from "../../shared/Dropdown";
import { upsertCustomerFromBooking } from "../customers/customerService";
import { subscribeToPackages, PACKAGE_CATEGORIES } from "../packages/packageService";
import { subscribeToSettings } from "../settings/settingsService";
import { useDialog } from "../../shared/DialogProvider";
import "./BookNow.css";

const STEPS = ["Event Details", "Package", "Review", "Confirmation"];

function formatDisplayDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Small dependency-free icons for the sidebar cards, so this file doesn't
// need lucide-react (or any icon package) to be installed.
function BoltIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}
function HeadsetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3v5Z" />
      <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3v5Z" />
    </svg>
  );
}

export default function BookNow() {
  const { alertDialog } = useDialog();
  const [searchParams] = useSearchParams();
  const preselectedPackage = searchParams.get("package") || "";

  const [step, setStep] = useState(0);
  const [packages, setPackages] = useState([]);
  const [bookedDates, setBookedDates] = useState({});
  const [settings, setSettings] = useState({});
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

  const calendarColRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      const active = rows.filter((p) => p.status === "Active");
      setPackages(active);
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

  useEffect(() => {
    const unsub = subscribeToBookedDates(setBookedDates);
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => data && setSettings(data));
    return () => unsub();
  }, []);

  const packagesForEventType = form.eventType
    ? packages.filter((p) => p.category === form.eventType)
    : packages;

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function scrollToCalendar() {
    calendarColRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function next() {
    if (step === 0 && (!form.customerName || !form.mobile || !form.eventDate || !form.eventType)) {
      await alertDialog("Please fill in your name, mobile number, event type and date.");
      return;
    }
    if (step === 1 && !form.packageName) {
      await alertDialog("Please select a package.");
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
      await alertDialog("Something went wrong, please try again: " + err.message, { tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  const stepProgress = STEPS.length > 1 ? Math.min(step, 2) / 2 : 0;
  const dateIsTaken = form.eventDate && (bookedDates[form.eventDate] || 0) > 0;

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Book Your Session</h1>
        <p>Takes less than two minutes — we'll confirm your slot shortly after.</p>
      </section>

      <section className="section">
        <div className={`card wizard-card${step === 0 ? " wizard-card-wide" : ""}`}>
          {step < 3 && (
            <div className="steps-row" style={{ "--progress": `${stepProgress * 100}%` }}>
              {STEPS.slice(0, 3).map((label, idx) => (
                <div key={label} className={`step-item${idx < step ? " done" : idx === step ? " active" : ""}`}>
                  <div className="step-circle">{idx < step ? "✓" : idx + 1}</div>
                  <span className="step-label">{label}</span>
                </div>
              ))}
            </div>
          )}

          {step === 0 && (
            <div className="booking-grid">
              <div className="booking-form-col">
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
                  <Dropdown
                    options={PACKAGE_CATEGORIES}
                    value={form.eventType}
                    onChange={(v) => {
                      setForm((f) => ({ ...f, eventType: v, packageName: "", amount: "" }));
                    }}
                    placeholder="Select event type"
                  />
                </div>
                <div className="field">
                  <label>Event Date</label>
                  <button type="button" className="date-preview-input" onClick={scrollToCalendar}>
                    <span className={form.eventDate ? "" : "date-preview-placeholder"}>
                      {form.eventDate ? formatDisplayDate(form.eventDate) : "Select date"}
                    </span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                  </button>
                  {dateIsTaken && (
                    <p className="wizard-note date-taken-note">
                      That date already has a booking — pick your date to see details.
                    </p>
                  )}
                </div>
                <div className="field">
                  <label>Event Location</label>
                  <input placeholder="Venue / city" value={form.location} onChange={(e) => update("location", e.target.value)} />
                </div>
              </div>

              <div className="booking-calendar-col" ref={calendarColRef}>
                <div className="calendar-panel">
                  <BookingCalendar
                    value={form.eventDate}
                    onChange={(iso) => update("eventDate", iso)}
                    bookedDates={bookedDates}
                  />
                </div>
                {dateIsTaken && (
                  <div className="date-warning-banner">
                    ⚠️ <strong>{formatDisplayDate(form.eventDate)}</strong> already
                    has a booking with us. You can still request this date, but we recommend
                    {settings.contactPhone ? (
                      <> calling us at <a href={`tel:${settings.contactPhone}`}>{settings.contactPhone}</a> first</>
                    ) : (
                      " contacting us first"
                    )}{" "}
                    to confirm we can fit you in before booking online.
                  </div>
                )}
                {form.eventDate && !dateIsTaken && (
                  <p className="wizard-note" style={{ marginTop: 8 }}>
                    Selected: {formatDisplayDate(form.eventDate)}
                  </p>
                )}
              </div>

              <div className="booking-sidebar-col">
                <div className="sidebar-photo">
                  {/* TODO: replace this src with the real photo */}
                  <img
                    src="/images/calenderimage.png"
                    alt="JP Studio"
                    className="sidebar-photo-img"
                  />
                </div>
                <div className="info-card">
                  <div className="info-card-icon icon-gold"><BoltIcon /></div>
                  <div>
                    <div className="info-card-title">Quick Booking</div>
                    <p className="info-card-text">Book your session in just a few clicks.</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon icon-blue"><ShieldIcon /></div>
                  <div>
                    <div className="info-card-title">Secure &amp; Reliable</div>
                    <p className="info-card-text">Your information is always safe with us.</p>
                  </div>
                </div>
                <div className="info-card">
                  <div className="info-card-icon icon-green"><HeadsetIcon /></div>
                  <div>
                    <div className="info-card-title">Expert Support</div>
                    <p className="info-card-text">Have questions? We're here to help.</p>
                  </div>
                </div>
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