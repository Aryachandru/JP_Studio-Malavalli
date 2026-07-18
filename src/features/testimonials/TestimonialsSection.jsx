import React, { useEffect, useState } from "react";
import { subscribeToApprovedTestimonials } from "./testimonialService";
import Carousel from "../../shared/Carousel";
import "./TestimonialsSection.css";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const unsub = subscribeToApprovedTestimonials(setTestimonials);
    return () => unsub();
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  // Prefer featured testimonials first, then fill with the rest
  const featured = testimonials.filter((t) => t.featured);
  const rest = testimonials.filter((t) => !t.featured);
  const shown = [...featured, ...rest];

  return (
    <section className="section">
      <div className="section-head">
        <h2>What Our Clients Say ❤️</h2>
      </div>
      <Carousel visibleDesktop={2} visibleTablet={1} visibleMobile={1}>
        {shown.map((t) => (
          <div key={t.id} className="card testimonial-card">
            <div className="testimonial-stars">
              {"★".repeat(t.rating)}
              <span className="testimonial-stars-empty">
                {"★".repeat(5 - t.rating)}
              </span>
            </div>
            <p className="testimonial-message">“{t.message}”</p>
            <div className="testimonial-author">— {t.customerName}</div>
          </div>
        ))}
      </Carousel>
    </section>
  );
}
