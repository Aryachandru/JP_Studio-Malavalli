import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToPackages, PACKAGE_CATEGORIES } from "./packageService";
import "./PublicPackages.css";

const TABS = ["All", ...PACKAGE_CATEGORIES];

export default function PublicPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("All");

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      setPackages(rows.filter((p) => p.status === "Active"));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = tab === "All" ? packages : packages.filter((p) => p.category === tab);

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Our Packages</h1>
        <p>Pick the package that fits your celebration — every one is customizable on request.</p>
      </section>

      <section className="section">
        <div className="tab-row public-package-tabs">
          {TABS.map((t) => (
            <button key={t} className={`tab-pill${tab === t ? " active" : ""}`} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {loading && <div className="loading-line">Loading packages…</div>}
        {!loading && filtered.length === 0 && (
          <div className="empty-state">No packages in this category yet — please check back soon.</div>
        )}

        <div className="grid grid-3 public-package-grid">
          {filtered.map((p) => (
            <div key={p.id} className="card public-package-card">
              <div
                className="public-package-thumb"
                style={{ backgroundImage: p.imageUrl ? `url(${p.imageUrl})` : undefined }}
              />
              <span className="public-package-category">{p.category}</span>
              <h3>{p.name}</h3>
              <div className="public-package-price">₹{Number(p.price).toLocaleString("en-IN")}</div>
              {p.description && <p className="public-package-desc">{p.description}</p>}

              {p.inclusions && p.inclusions.length > 0 && (
                <ul className="public-package-inclusions">
                  {p.inclusions.map((inc, i) => (
                    <li key={i}>✓ {inc}</li>
                  ))}
                </ul>
              )}

              <Link to={`/book?package=${encodeURIComponent(p.name)}`} className="btn btn-gold btn-block">
                Book This Package
              </Link>
              <Link to={`/packages/${p.id}`} className="btn btn-ghost btn-block public-package-view-details">
                View Details
              </Link>
            </div>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}