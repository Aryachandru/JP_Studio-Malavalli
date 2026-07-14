import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToPackages } from "../packages/packageService";
import { subscribeToGallery } from "../gallery/galleryService";
import { subscribeToSettings } from "../settings/settingsService";
import { getYouTubeEmbedUrl, getYouTubeThumbnail } from "../../shared/youtube";
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

  const featuredPackages = packages.filter((p) => p.status === "Active").slice(0, 3);
  const previewPhotos = photos.slice(0, 6);
  const heroImages = settings.heroImages && settings.heroImages.length > 0
    ? settings.heroImages
    : settings.heroImageUrl
    ? [settings.heroImageUrl]
    : [];
  const youtubeEmbedUrl = useMemo(() => getYouTubeEmbedUrl(settings.youtubeUrl), [settings.youtubeUrl]);

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
          <div className="grid grid-3 package-preview-grid">
            {featuredPackages.map((p) => (
              <div key={p.id} className="card package-preview-card">
                <div
                  className="package-preview-thumb"
                  style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
                />
                <h3>{p.name}</h3>
                <p className="package-preview-price">₹{Number(p.price).toLocaleString("en-IN")}</p>
                {p.description && <p className="package-preview-desc">{p.description}</p>}
                <Link to={`/book?package=${encodeURIComponent(p.name)}`} className="btn btn-gold btn-block">
                  Book This Package
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- Gallery preview ---------------- */}
      {previewPhotos.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Recent Work</h2>
            <Link to="/gallery" className="section-view-all">View Full Gallery →</Link>
          </div>
          <div className="gallery-preview-grid">
            {previewPhotos.map((p) => {
              const thumbSrc = p.mediaType === "video" ? getYouTubeThumbnail(p.url) || p.url : p.url;
              return (
                <Link key={p.id} to="/gallery" className="gallery-preview-photo-wrap">
                  <img src={thumbSrc} alt="Studio work" className="gallery-preview-photo" />
                  {p.mediaType === "video" && <span className="gallery-preview-play">▶</span>}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ---------------- YouTube video ---------------- */}
      {youtubeEmbedUrl && (
        <section className="section">
          <div className="section-head">
            <h2>Watch Our Story</h2>
          </div>
          <div className="youtube-embed-wrap">
            <iframe
              src={youtubeEmbedUrl}
              title="Studio video"
              className="youtube-embed-iframe"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </section>
      )}

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