import React, { useRef } from "react";
import "./Carousel.css";

// Generic horizontal carousel used across the homepage (Packages, Recent
// Work, Testimonials, Video). Items scroll natively (touch-swipe works
// for free) with Prev/Next arrow buttons layered on top. How many items
// are visible at once is controlled entirely by CSS custom properties so
// each usage can tune it without touching this component — defaults
// match "2 on mobile, 3ish on tablet, 6 on laptop/desktop".
//
// Usage:
//   <Carousel>
//     {items.map((item) => <YourCard key={item.id} {...item} />)}
//   </Carousel>
export default function Carousel({ children, visibleMobile = 1, visibleTablet = 3, visibleDesktop = 4, className = "" }) {
  const trackRef = useRef(null);

  function scrollByPage(direction) {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.9 * direction;
    track.scrollBy({ left: amount, behavior: "smooth" });
  }

  const items = React.Children.toArray(children);
  if (items.length === 0) return null;

  // If there are fewer items than the "visible at once" target for a
  // breakpoint, using the full target as the flex-basis divisor leaves a
  // large empty gap next to the item(s) (e.g. 1 testimonial rendered at
  // 1/6th width on desktop). Clamping to the actual item count fixes
  // that — each item just takes a proportionally larger share instead.
  const effMobile = Math.max(1, Math.min(visibleMobile, items.length));
  const effTablet = Math.max(1, Math.min(visibleTablet, items.length));
  const effDesktop = Math.max(1, Math.min(visibleDesktop, items.length));
  const canScroll = items.length > effDesktop;

  return (
    <div
      className={`carousel-wrap ${className}`}
      style={{
        "--car-mobile": effMobile,
        "--car-tablet": effTablet,
        "--car-desktop": effDesktop,
      }}
    >
      {canScroll && (
        <button className="carousel-arrow carousel-arrow-left" onClick={() => scrollByPage(-1)} aria-label="Previous">
          ‹
        </button>
      )}

      <div className="carousel-track" ref={trackRef}>
        {items.map((child, i) => (
          <div className="carousel-item" key={child.key ?? i}>
            {child}
          </div>
        ))}
      </div>

      {canScroll && (
        <button className="carousel-arrow carousel-arrow-right" onClick={() => scrollByPage(1)} aria-label="Next">
          ›
        </button>
      )}
    </div>
  );
}