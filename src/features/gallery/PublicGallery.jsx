import React, { useEffect, useState } from "react";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToGallery, GALLERY_CATEGORIES } from "./galleryService";
import { getYouTubeThumbnail } from "../../shared/youtube";
import GalleryLightbox from "./GalleryLightbox";
import "./PublicGallery.css";

const CATEGORIES = ["All Photos", ...GALLERY_CATEGORIES];

// Helper to generate Cloudinary URLs for thumb vs large
function getCloudinaryUrl(baseUrl, size = "thumb") {
  if (!baseUrl) return "";
  if (size === "thumb") {
    return baseUrl.replace(
      "/upload/",
      "/upload/w_400,h_300,c_fill,q_auto,f_auto/"
    );
  }
  if (size === "large") {
    return baseUrl.replace(
      "/upload/",
      "/upload/w_1600,h_1200,c_fill,q_auto,f_auto/"
    );
  }
  return baseUrl;
}

export default function PublicGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All Photos");
  const [openIndex, setOpenIndex] = useState(null);

  useEffect(() => {
    const unsub = subscribeToGallery((rows) => {
      setPhotos(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered =
    category === "All Photos"
      ? photos
      : photos.filter((p) => p.category === category);

  function changeCategory(c) {
    setCategory(c);
    setOpenIndex(null);
  }

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
              onClick={() => changeCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {loading && <div className="loading-line">Loading gallery…</div>}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">No photos in this category yet.</div>
        )}

        <div className="gallery-grid">
          {filtered.map((p, idx) => {
            const thumbSrc =
              p.mediaType === "video"
                ? getYouTubeThumbnail(p.url)
                : getCloudinaryUrl(p.url, "thumb");
            return (
              <div
                key={p.id}
                className="gallery-photo-wrap"
                onClick={() => setOpenIndex(idx)}
              >
                {thumbSrc ? (
                  <img
                    src={thumbSrc}
                    alt="Studio work"
                    className="gallery-photo"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="gallery-photo gallery-video-placeholder">
                    🎬
                  </div>
                )}
                {p.mediaType === "video" && (
                  <span className="gallery-play-badge">▶</span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {openIndex !== null && (
        <GalleryLightbox
          items={filtered.map((p) => ({
            ...p,
            url:
              p.mediaType === "video"
                ? p.url
                : getCloudinaryUrl(p.url, "large"), // ✅ use large version in lightbox
          }))}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onNavigate={setOpenIndex}
        />
      )}
    </PublicLayout>
  );
}
