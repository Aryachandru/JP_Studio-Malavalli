import React, { useState } from "react";
import { submitProjectInquiry } from "./inquiryService";
import { useDialog } from "../../shared/DialogProvider";
import Dropdown from "../../shared/Dropdown";
import "./GetStartedModal.css";

const PROJECT_TYPES = [
  { value: "Business Website", icon: "🌐" },
  { value: "Portfolio Website", icon: "👤" },
  { value: "Photography Website", icon: "📷" },
  { value: "E-commerce Website", icon: "🛒" },
  { value: "Web Application", icon: "💻" },
  { value: "SharePoint Solution", icon: "🅢" },
  { value: "Custom Software", icon: "⚙️" },
  { value: "Other", icon: "…" },
];

const BUDGET_OPTIONS = [
  "Under ₹50,000",
  "₹50,000 - ₹1,00,000",
  "₹1,00,000 - ₹3,00,000",
  "₹3,00,000+",
  "Not sure yet",
];

const TIMELINE_OPTIONS = ["Less than 1 Month", "1 - 3 Months", "3 - 6 Months", "Flexible / Not sure"];

const DESCRIPTION_LIMIT = 500;

const EMPTY_FORM = {
  projectType: "",
  name: "",
  phone: "",
  email: "",
  description: "",
  budget: "",
  timeline: "",
};

export default function GetStartedModal({ onClose }) {
  const { alertDialog } = useDialog();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function goNext() {
    if (step === 1 && !form.projectType) {
      await alertDialog("Please choose a project type to continue.");
      return;
    }
    if (step === 2 && (!form.name || !form.phone || !form.email || !form.description)) {
      await alertDialog("Please fill in your name, phone, email, and a short project description.");
      return;
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      await submitProjectInquiry(form);
      setSubmitted(true);
    } catch (err) {
      await alertDialog("Something went wrong sending your request — please try again: " + err.message, { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="gsm-overlay" onClick={onClose}>
      <div className="gsm-panel" onClick={(e) => e.stopPropagation()}>
        <div className="gsm-header">
          {step > 1 && !submitted ? (
            <button className="gsm-back" onClick={goBack}>← Back</button>
          ) : (
            <span />
          )}
          <span className="gsm-header-title">Get Started</span>
          <button className="gsm-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {!submitted && (
          <div className="gsm-stepper">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div className={`gsm-step-dot${n < step ? " done" : n === step ? " active" : ""}`}>
                  {n < step ? "✓" : n}
                </div>
                {n < 3 && <div className={`gsm-step-line${n < step ? " done" : ""}`} />}
              </React.Fragment>
            ))}
          </div>
        )}

        <div className="gsm-body">
          {submitted ? (
            <div className="gsm-success">
              <div className="gsm-success-icon">✓</div>
              <h2>Request Sent!</h2>
              <p>Thanks {form.name.split(" ")[0]} — I'll get back to you at {form.email} within a day or two.</p>
              <button className="gsm-btn gsm-btn-primary gsm-btn-block" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <>
              {step === 1 && (
                <>
                  <h2>Let's Build Something Amazing Together! 🚀</h2>
                  <p className="gsm-subtitle">What type of project do you need?</p>
                  <div className="gsm-radio-list">
                    {PROJECT_TYPES.map((t) => (
                      <label
                        key={t.value}
                        className={`gsm-radio-row${form.projectType === t.value ? " selected" : ""}`}
                      >
                        <span className="gsm-radio-icon">{t.icon}</span>
                        <span className="gsm-radio-label">{t.value}</span>
                        <input
                          type="radio"
                          name="projectType"
                          checked={form.projectType === t.value}
                          onChange={() => update("projectType", t.value)}
                        />
                        <span className="gsm-radio-dot" />
                      </label>
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h2>Tell Us About Your Project 📋</h2>
                  <p className="gsm-subtitle">Please provide some details so I can understand your requirements better.</p>

                  <div className="gsm-field">
                    <label>Your Name</label>
                    <input placeholder="Enter your full name" value={form.name} onChange={(e) => update("name", e.target.value)} />
                  </div>
                  <div className="gsm-field">
                    <label>Phone Number</label>
                    <input placeholder="Enter your phone number" value={form.phone} onChange={(e) => update("phone", e.target.value)} />
                  </div>
                  <div className="gsm-field">
                    <label>Email Address</label>
                    <input type="email" placeholder="Enter your email address" value={form.email} onChange={(e) => update("email", e.target.value)} />
                  </div>
                  <div className="gsm-field">
                    <label>Project Description</label>
                    <textarea
                      rows={4}
                      maxLength={DESCRIPTION_LIMIT}
                      placeholder="Describe your project in detail…"
                      value={form.description}
                      onChange={(e) => update("description", e.target.value)}
                    />
                    <div className="gsm-char-count">{form.description.length}/{DESCRIPTION_LIMIT}</div>
                  </div>
                  <div className="gsm-field">
                    <label>Estimated Budget</label>
                    <Dropdown
                      options={BUDGET_OPTIONS}
                      value={form.budget}
                      onChange={(v) => update("budget", v)}
                      placeholder="Select your budget range"
                    />
                  </div>
                  <div className="gsm-field">
                    <label>Expected Timeline</label>
                    <Dropdown
                      options={TIMELINE_OPTIONS}
                      value={form.timeline}
                      onChange={(v) => update("timeline", v)}
                      placeholder="Select timeline"
                    />
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2>Review &amp; Submit ✈</h2>
                  <p className="gsm-subtitle">Almost there! Please review your details and submit your request.</p>

                  <div className="gsm-review-card">
                    <div className="gsm-review-eyebrow">Project Summary</div>
                    <ReviewRow icon="📄" label="Project Type" value={form.projectType} />
                    <ReviewRow icon="💰" label="Budget" value={form.budget || "—"} />
                    <ReviewRow icon="⏱" label="Timeline" value={form.timeline || "—"} />
                  </div>

                  <div className="gsm-review-card">
                    <div className="gsm-review-eyebrow">Your Information</div>
                    <ReviewRow icon="👤" label="Name" value={form.name} />
                    <ReviewRow icon="📞" label="Phone" value={form.phone} />
                    <ReviewRow icon="✉️" label="Email" value={form.email} />
                  </div>

                  <div className="gsm-review-card">
                    <div className="gsm-review-eyebrow">Project Description</div>
                    <p className="gsm-review-desc">{form.description}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {!submitted && (
          <div className="gsm-footer">
            <div className="gsm-secure-note">🔒 Your information is 100% secure</div>
            <div className="gsm-footer-actions">
              {step > 1 && (
                <button className="gsm-btn gsm-btn-ghost" onClick={goBack}>
                  Back
                </button>
              )}
              {step < 3 ? (
                <button className="gsm-btn gsm-btn-primary" onClick={goNext} style={{ flex: 1 }}>
                  Next →
                </button>
              ) : (
                <button className="gsm-btn gsm-btn-primary" onClick={handleSubmit} disabled={submitting} style={{ flex: 1 }}>
                  {submitting ? "Sending…" : "Submit Request ✈"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ icon, label, value }) {
  return (
    <div className="gsm-review-row">
      <span className="gsm-review-row-label"><span>{icon}</span> {label}</span>
      <span className="gsm-review-row-value">{value}</span>
    </div>
  );
}