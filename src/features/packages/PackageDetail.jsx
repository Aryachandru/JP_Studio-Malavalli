import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToPackages } from "./packageService";
import "./PackageDetail.css";

export default function PackageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      const match = rows.find((p) => p.id === id);
      setPkg(match || null);
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: pkg?.name, url });
      } catch {
        // user cancelled share — no-op
      }
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied to clipboard!");
    }
  }

  if (loading) {
    return (
      <PublicLayout>
        <div className="loading-line">Loading package…</div>
      </PublicLayout>
    );
  }

  if (!pkg) {
    return (
      <PublicLayout>
        <section className="section" style={{ textAlign: "center" }}>
          <h2>Package not found</h2>
          <p style={{ color: "var(--ink-400)", marginBottom: 16 }}>
            This package may have been removed or renamed.
          </p>
          <Link to="/packages" className="btn btn-gold">Browse All Packages</Link>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section package-detail-section">
        <div className="package-detail-top">
          <button className="btn btn-ghost" onClick={() => navigate("/packages")}>← Back</button>
          <button className="btn btn-ghost" onClick={handleShare}>🔗 Share</button>
        </div>

        <div className="card package-detail-card">
          <div
            className="package-detail-hero"
            style={{ backgroundImage: pkg.imageUrl ? `url(${pkg.imageUrl})` : undefined }}
          />
          <span className="package-detail-category">{pkg.category}</span>
          <h1>{pkg.name}</h1>
          <div className="package-detail-price">₹{Number(pkg.price).toLocaleString("en-IN")}</div>

          {pkg.description && <p className="package-detail-desc">{pkg.description}</p>}

          {pkg.inclusions && pkg.inclusions.length > 0 && (
            <>
              <h3 className="package-detail-subhead">What's Included</h3>
              <ul className="package-detail-inclusions">
                {pkg.inclusions.map((inc, i) => (
                  <li key={i}>✓ {inc}</li>
                ))}
              </ul>
            </>
          )}

          <Link to={`/book?package=${encodeURIComponent(pkg.name)}`} className="btn btn-gold btn-block package-detail-cta">
            Book This Package
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
