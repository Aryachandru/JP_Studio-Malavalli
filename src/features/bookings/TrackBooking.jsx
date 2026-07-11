import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import StatusBadge from "../../shared/StatusBadge";
import { trackBookingByCodeAndMobile } from "./bookingService";
import { STAGES, getTopLevelStatus } from "../../shared/statuses";
import "./TrackBooking.css";

export default function TrackBooking() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [mobile, setMobile] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  async function handleSearch(e) {
    e.preventDefault();
    setError("");
    setBooking(null);
    if (!code.trim() || !mobile.trim()) {
      setError("Please enter both your booking code and mobile number.");
      return;
    }
    setLoading(true);
    try {
      const result = await trackBookingByCodeAndMobile(code, mobile);
      console.log("Booking lookup result:", result);
      if (result.error === "not_found") {
        setError("We couldn't find a booking with that code. Double-check it and try again.");
      } else if (result.error === "mismatch") {
        setError("That mobile number doesn't match this booking code.");
      } else if (result.error === "firebase_error") {
        setError(
          `Something went wrong talking to the server (${result.firebaseCode || "unknown error"}). ` +
          `If you're the site admin: this usually means firestore.rules hasn't been deployed to your live ` +
          `Firebase project yet, or src/firebase/config.js isn't pointed at the right project.`
        );
      } else {
        setBooking(result.booking);
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Track Your Booking</h1>
        <p>Enter your booking code and the mobile number you booked with.</p>
      </section>

      <section className="section">
        <form className="card track-form" onSubmit={handleSearch}>
          <div className="field">
            <label>Booking Code</label>
            <input placeholder="e.g. JP1007" value={code} onChange={(e) => setCode(e.target.value)} />
          </div>
          <div className="field">
            <label>Mobile Number</label>
            <input placeholder="The number you booked with" value={mobile} onChange={(e) => setMobile(e.target.value)} />
          </div>
          {error && <p className="track-error">{error}</p>}
          <button className="btn btn-gold btn-block" disabled={loading}>
            {loading ? "Searching…" : "Track Booking"}
          </button>
        </form>

        {booking && (
          <div className="card track-result">
            <div className="track-result-head">
              <div>
                <h3>{booking.bookingCode}</h3>
                <p className="track-result-sub">{booking.eventType} · {booking.eventDate}</p>
              </div>
              <StatusBadge label={getTopLevelStatus(booking.stageIndex, booking.cancelled)} />
            </div>

             <div className="track-greeting">
      <h4>Hi {booking.customerName},</h4>
      <p className="track-greeting-sub">
    "Your booking is on track — thanks for staying with us!
  </p>
    </div>

            <div className="timeline">
              {STAGES.map((stage, idx) => {
                const state =
                  idx < (booking.stageIndex ?? 0) ? "done" : idx === (booking.stageIndex ?? 0) ? "active" : "";
                const historyEntry = (booking.stageHistory || []).find((h) => h.stage === stage);
                return (
                  <div key={stage} className={`timeline-item ${state}`}>
                    <div className="timeline-dot">{state === "done" ? "✓" : ""}</div>
                    <div className="t-title">{stage}</div>
                    <div className="t-date">
                      {historyEntry ? new Date(historyEntry.date).toLocaleDateString() : state === "active" ? "In Progress" : "Upcoming"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </PublicLayout>
  );
}