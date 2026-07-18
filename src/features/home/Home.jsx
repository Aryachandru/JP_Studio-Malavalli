import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToPackages } from "../packages/packageService";
import { subscribeToGallery } from "../gallery/galleryService";
import { subscribeToSettings } from "../settings/settingsService";
import { getYouTubeThumbnail } from "../../shared/youtube";
import GalleryLightbox from "../gallery/GalleryLightbox";
import TestimonialsSection from "../testimonials/TestimonialsSection";
import Carousel from "../../shared/Carousel";
import "./Home.css";

const QUICK_LINKS = [
  { to: "/packages", icon: "📦", title: "Packages", desc: "Browse our photography packages" },
  { to: "/gallery", icon: "🖼️", title: "Gallery", desc: "See our recent work" },
  { to: "/book", icon: "📅", title: "Book Now", desc: "Reserve your date in minutes" },
  { to: "/track", icon: "🔍", title: "Track Booking", desc: "Check your project status" },
  { to: "/contact", icon: "📍", title: "Contact & Location", desc: "Visit us or reach out" },
];

export default function Home() {
  const [packages, setPackages] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({});
  const [openVideoIndex, setOpenVideoIndex] = useState(null);

  useEffect(() => {
    const unsub1 = subscribeToPackages(setPackages);
    const unsub2 = subscribeToGallery(setPhotos);
    const unsub3 = subscribeToSettings((data) => data && setSettings(data));
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, []);

  const featuredPackages = packages.filter((p) => p.status === "Active");
  // Capped (not the full gallery) so the homepage doesn't load dozens of
  // externally-hosted images at once — the full gallery lives at /gallery.
  const previewPhotos = photos.slice(0, 12);

  const heroImages = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : settings.heroImageUrl
    ? [settings.heroImageUrl]
    : [];

  const youtubeUrls = settings.youtubeUrls && settings.youtubeUrls.length > 0
    ? settings.youtubeUrls
    : settings.youtubeUrl
    ? [settings.youtubeUrl]
    : [];
  const videoItems = youtubeUrls.map((url) => ({ mediaType: "video", url }));

  return (
    <PublicLayout>
      <HeroCarousel images={heroImages} studioName={settings.studioName} />

      {/* ---------------- Quick access grid ---------------- */}
      <section className="section">
        <div className="quick-grid">
          {QUICK_LINKS.map((q) => (
            <Link key={q.to} to={q.to} className="quick-card">
              <div className="quick-card-icon">{q.icon}</div>
              <div className="quick-card-title">{q.title}</div>
              <div className="quick-card-desc">{q.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ---------------- Featured packages ---------------- */}
      {featuredPackages.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Popular Packages</h2>
            <Link to="/packages" className="section-view-all">View All →</Link>
          </div>
          <Carousel>
            {featuredPackages.map((p) => (
              <div key={p.id} className="card package-preview-card">
                <div
                  className="package-preview-thumb"
                  style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
                />
                <h3>{p.name}</h3>
                <p className="package-preview-price">₹{Number(p.price).toLocaleString("en-IN")}</p>
                <Link to={`/book?package=${encodeURIComponent(p.name)}`} className="btn btn-gold btn-block">
                  Book This Package
                </Link>
              </div>
            ))}
          </Carousel>
        </section>
      )}

      {/* ---------------- Gallery preview ---------------- */}
      {previewPhotos.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Recent Work</h2>
            <Link to="/gallery" className="section-view-all">View Full Gallery →</Link>
          </div>
          <Carousel>
            {previewPhotos.map((p) => {
              const thumbSrc = p.mediaType === "video" ? getYouTubeThumbnail(p.url) || p.url : p.url;
              return (
                <Link key={p.id} to="/gallery" className="gallery-preview-photo-wrap">
                  <img src={thumbSrc} alt="Studio work" className="gallery-preview-photo" loading="lazy" decoding="async" />
                  {p.mediaType === "video" && <span className="gallery-preview-play">▶</span>}
                </Link>
              );
            })}
          </Carousel>
        </section>
      )}

      {/* ---------------- YouTube videos ---------------- */}
      {videoItems.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Watch Our Story</h2>
          </div>
          <Carousel visibleDesktop={4} visibleTablet={2} visibleMobile={1}>
            {videoItems.map((v, idx) => (
              <button
                key={v.url + idx}
                type="button"
                className="video-preview-card"
                onClick={() => setOpenVideoIndex(idx)}
              >
                <img
                  src={getYouTubeThumbnail(v.url)}
                  alt="Studio video"
                  className="video-preview-thumb"
                  loading="lazy"
                  decoding="async"
                />
                <span className="video-preview-play">▶</span>
              </button>
            ))}
          </Carousel>
        </section>
      )}

      {openVideoIndex !== null && (
        <GalleryLightbox
          items={videoItems}
          index={openVideoIndex}
          onClose={() => setOpenVideoIndex(null)}
          onNavigate={setOpenVideoIndex}
        />
      )}

      {/* ---------------- Testimonials ---------------- */}
      <TestimonialsSection />

      {/* ---------------- CTA banner ---------------- */}
      <section className="cta-banner">
        <h2>Ready to freeze your favorite moments?</h2>
        <p>Tell us your date and package — we'll take care of the rest.</p>
        <Link to="/book" className="btn btn-gold btn-lg">Book Your Session Now</Link>
      </section>
    </PublicLayout>
  );
}

// Auto-advancing image carousel for the homepage banner. Handles any
// number of images (1 to however many the admin uploads in Settings),
// fits the browser width at every screen size via CSS (see Home.css),
// and pauses auto-advance while the user is actively looking at a
// specific slide by clicking a dot (resumes after a few seconds).
function HeroCarousel({ images, studioName }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  useEffect(() => {
    // If the image list shrinks (admin removed a photo), keep index valid.
    if (index >= images.length) setIndex(0);
  }, [images.length, index]);

  return (
    <section className="hero">
      <div className="hero-slides">
        {images.length === 0 ? (
          <div className="hero-slide hero-slide-empty" />
        ) : (
          images.map((url, i) => (
            <div
              key={url + i}
              className={`hero-slide${i === index ? " active" : ""}`}
              style={{ backgroundImage: `linear-gradient(rgba(15,18,30,0.55), rgba(15,18,30,0.55)), url(${url})` }}
            />
          ))
        )}
      </div>

      <div className="hero-content">
        <h1>{studioName || "JP Studio"}</h1>
        <p>Capturing your weddings, pre-weddings and life's biggest moments — beautifully, always.</p>
        <div className="hero-actions">
          <Link to="/book" className="btn btn-gold btn-lg">Book Your Session</Link>
          <Link to="/gallery" className="btn btn-outline btn-lg">View Gallery</Link>
        </div>
      </div>

      {images.length > 1 && (
        <div className="hero-dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`hero-dot${i === index ? " active" : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Show slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}