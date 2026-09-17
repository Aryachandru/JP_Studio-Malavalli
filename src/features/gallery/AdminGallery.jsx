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
      <section className="page-header gallery-page-header">
        <div className="gallery-header-grid">
          <div className="gallery-header-text">
            <span className="gallery-eyebrow">Our Gallery</span>
            <h1>
              Capturing Life's Beautiful <span className="accent">Moments</span>
            </h1>
            <p>
              Explore a collection of real work — from weddings and pre-weddings to special moments and more.
            </p>

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
          </div>

          <div className="gallery-header-art" aria-hidden="true">
            <div className="gallery-header-leaf" />
            <span className="gallery-header-caption">
              Real People. Real Stories.
              <br />
              Beautiful Frames.
            </span>
            <div className="gallery-header-art-frame">
              {/* TODO: replace this src with the real photo */}
              <img
                src="/images/gallery-hero.jpg"
                alt="JP Studio"
                className="gallery-header-art-img"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section gallery-section">
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