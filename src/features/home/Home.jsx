import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToPackages } from "../packages/packageService";
//import { subscribeToGallery } from "../gallery/galleryService";
import { subscribeToSettings } from "../settings/settingsService";
import STATIC_PHOTOS from "../gallery/staticPhotos";
import "./Home.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const QUICK_LINKS = [
  { to: "/packages", icon: "📦", title: "Packages", desc: "Browse our photography packages" },
  { to: "/gallery", icon: "🖼️", title: "Gallery", desc: "See our recent work" },
  { to: "/book", icon: "📅", title: "Book Now", desc: "Reserve your date in minutes" },
  { to: "/track", icon: "🔍", title: "Track Booking", desc: "Check your project status" },
  // { to: "/contact", icon: "📍", title: "Contact & Location", desc: "Visit us or reach out" },
];

export default function Home() {
  const [packages, setPackages] = useState([]);
  //const [photos, setPhotos] = useState([]);
  const [settings, setSettings] = useState({});
  const allPhotos = Object.values(STATIC_PHOTOS).flat();
  // Track screen width for responsive row limits
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);

    const unsub1 = subscribeToPackages(setPackages);
    const unsub3 = subscribeToSettings((data) => data && setSettings(data));

    return () => {
      window.removeEventListener("resize", handleResize);
      unsub1();
      unsub3();
    };
  }, []);
  const settingsCarousel = {
  dots: true,
  infinite: true,
  speed: 500,
  slidesToShow: width <= 480 ? 2 : width <= 768 ? 3 : 6, 
  slidesToScroll: 1,
};

  // Decide how many photos to show (2 rows)
  let limit = 12; // default laptop (6 per row → 12 total)
  if (width <= 480) limit = 10;      // mobile (2 per row → 4 total)
  else if (width <= 768) limit = 10; // tablet (3 per row → 6 total)

  const previewPhotos = allPhotos.slice(0, limit);
  const featuredPackages = packages.filter((p) => p.status === "Active").slice(0, 3);
  //const previewPhotos = photos.slice(0, 6);

  return (
    <PublicLayout>
      {/* ---------------- Hero ---------------- */}
      <section
        className="hero"
        style={{
          backgroundImage: settings.heroImageUrl
            ? `linear-gradient(rgba(15,18,30,0.55), rgba(15,18,30,0.55)), url(${settings.heroImageUrl})`
            : undefined,
        }}
      >
        <div className="hero-content">
          <h1>{settings.studioName || "JP Studio"}</h1>
          <p>Capturing your weddings, pre-weddings and life's biggest moments — beautifully, always.</p>
          <div className="hero-actions">
            <Link to="/book" className="btn btn-gold btn-lg">Book Your Session</Link>
            <Link to="/gallery" className="btn btn-outline btn-lg">View Gallery</Link>
          </div>
        </div>
      </section>

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

      {featuredPackages.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Popular Packages</h2>
            <Link to="/packages" className="section-view-all">View All →</Link>
          </div>
          <div className="grid grid-3 package-preview-grid">
            {[...featuredPackages]  // clone array
              .sort((a, b) => a.price - b.price)  
              .map((p) => (
                <div key={p.id} className="card package-preview-card">
                  <div
                    className="package-preview-thumb"
                    style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
                  />
                  <h3>{p.name}</h3>
                  <p className="package-preview-price">
                    ₹{Number(p.price).toLocaleString("en-IN")}
                  </p>
                  {p.description && <p className="package-preview-desc">{p.description}</p>}
                  <Link
                    to={`/book?package=${encodeURIComponent(p.name)}`}
                    className="btn btn-gold btn-block"
                  >
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
      <Link to="/gallery" className="section-view-all">
        View Full Gallery →
      </Link>
    </div>
    <Slider {...settingsCarousel}>
      {previewPhotos.map((src, idx) => (
        <div key={idx}>
          <img
            src={src}
            alt={`Recent work ${idx + 1}`}
            className="gallery-preview-photo"
            loading="lazy"
          />
        </div>
      ))}
    </Slider>
  </section>
)}

      {/* ---------------- Gallery preview ---------------- */}
      {/* {previewPhotos.length > 0 && (
        <section className="section">
          <div className="section-head">
            <h2>Recent Work</h2>
            <Link to="/gallery" className="section-view-all">View Full Gallery →</Link>
          </div>
          <div className="gallery-preview-grid">
            {previewPhotos.map((p) => (
              <img key={p.id} src={p.url} alt={p.fileName || "Studio photo"} className="gallery-preview-photo" />
            ))}
          </div>
        </section>
      )} */}

      {/* ---------------- CTA banner ---------------- */}
      <section className="cta-banner">
        <h2>Ready to freeze your favorite moments?</h2>
        <p>Tell us your date and package — we'll take care of the rest.</p>
        <Link to="/book" className="btn btn-gold btn-lg">Book Your Session Now</Link>
      </section>
    </PublicLayout>
  );
}
