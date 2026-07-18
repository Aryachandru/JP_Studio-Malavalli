import React, { useState } from "react";
import { submitTestimonial } from "./testimonialService";
import { useDialog } from "../../shared/DialogProvider";
import "./TestimonialForm.css";

export default function TestimonialForm({ bookingCode, customerName, onSubmitted }) {
  const { alertDialog } = useDialog();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) {
      await alertDialog("Please write a few words about your experience.");
      return;
    }
    setSubmitting(true);
    try {
      await submitTestimonial({ bookingCode, customerName, rating, message: message.trim() });
      onSubmitted();
    } catch (err) {
      await alertDialog("Couldn't submit your review — please try again: " + err.message, { tone: "error" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="testimonial-form-card">
      <h4>How was your experience?</h4>
      <p className="testimonial-form-hint">Your review helps other couples and families find us.</p>

      <div className="testimonial-star-row">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className={`testimonial-star${n <= (hoverRating || rating) ? " filled" : ""}`}
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        rows={3}
        placeholder="Tell us what you loved (or what we could improve)…"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="testimonial-textarea"
      />

      <button className="btn btn-gold btn-block" onClick={handleSubmit} disabled={submitting}>
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}