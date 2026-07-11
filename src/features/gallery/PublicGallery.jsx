import React, { useState } from "react";
import PublicLayout from "../publicLayout/PublicLayout";
import STATIC_PHOTOS from "./staticPhotos";
import "./PublicGallery.css";

const CATEGORIES = [
  "All Photos",
  "Wedding",
  "Pre Wedding",
  "Baby Shoot",
  "Birthday",
  "Maternity",
  "Events"
];

export default function PublicGallery() {
  const [category, setCategory] = useState("All Photos");
  const [lightboxIndex, setLightboxIndex] = useState(null);

  // Flatten all categories if "All Photos" is selected
  const allPhotos = Object.values(STATIC_PHOTOS).flat();
  const filtered = category === "All Photos" ? allPhotos : STATIC_PHOTOS[category] || [];

  const openLightbox = (idx) => setLightboxIndex(idx);
  const closeLightbox = () => setLightboxIndex(null);

  const showPrev = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
  };

  const showNext = () => {
    setLightboxIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
  };

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Our Gallery</h1>
        <p>A few favorites from weddings, pre-weddings, birthdays and more.</p>
      </section>

      <section className="section">
        <div className="tab-row public-gallery-tabs">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`tab-pill${category === c ? " active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty-state">No photos in this category yet.</div>
        )}

        <div className="gallery-grid">
          {filtered.map((src, idx) => {
            const isVideo = src.endsWith(".mp4");
            return isVideo ? (
              <video
                key={idx}
                src={src}
                controls
                className="gallery-video"
                onClick={() => openLightbox(idx)}
              />
            ) : (
              <img
                key={idx}
                src={src}
                alt={`${category} ${idx + 1}`}
                className="gallery-photo"
                onClick={() => openLightbox(idx)}
              />
            );
          })}
        </div>
      </section>

      {lightboxIndex !== null && (
        <div className="gallery-lightbox">
          <button className="lightbox-close" onClick={closeLightbox}>×</button>
          <button className="lightbox-prev" onClick={showPrev}>‹</button>
          {filtered[lightboxIndex].endsWith(".mp4") ? (
            <video
              src={filtered[lightboxIndex]}
              controls
              autoPlay
              className="lightbox-video"
            />
          ) : (
            <img
              src={filtered[lightboxIndex]}
              alt="Enlarged"
              className="lightbox-image"
            />
          )}
          <button className="lightbox-next" onClick={showNext}>›</button>
        </div>
      )}
    </PublicLayout>
  );
}
