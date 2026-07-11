import React, { useEffect, useState } from "react";
import { subscribeToOffers } from "./offerService";
import "./OfferBanner.css";

// Shows ALL active offers across every public page (wired in via
// PublicLayout). If there's exactly one, it sits still. If there's more
// than one, they scroll continuously left-to-right like a marquee so all
// of them get seen without needing extra vertical space.
export default function OfferBanner() {
  const [offers, setOffers] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("jpstudio_dismissed_offers") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    const unsub = subscribeToOffers((rows) => {
      setOffers(rows.filter((o) => o.active));
    });
    return () => unsub();
  }, []);

  const visibleOffers = offers.filter((o) => !dismissedIds.includes(o.id));

  function dismissAll() {
    const ids = visibleOffers.map((o) => o.id);
    const updated = [...dismissedIds, ...ids];
    localStorage.setItem("jpstudio_dismissed_offers", JSON.stringify(updated));
    setDismissedIds(updated);
  }

  if (visibleOffers.length === 0) return null;

  const isMarquee = visibleOffers.length > 1;
  // Duplicate the offer list once so the CSS marquee loop has no visible
  // seam/gap when it wraps back to the start.
  const trackItems = isMarquee ? [...visibleOffers, ...visibleOffers] : visibleOffers;

  return (
    <div className="offer-banner">
      <span className="offer-banner-icon">🎉</span>

      <div className="offer-banner-viewport">
        <div className={`offer-banner-track${isMarquee ? " scrolling" : ""}`}>
          {trackItems.map((offer, idx) => (
            <span className="offer-banner-item" key={`${offer.id}-${idx}`}>
              <strong>{offer.title}:</strong> {offer.message}
            </span>
          ))}
        </div>
      </div>

      <button className="offer-banner-close" onClick={dismissAll} aria-label="Dismiss">✕</button>
    </div>
  );
}