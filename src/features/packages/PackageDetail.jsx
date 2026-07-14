import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PublicLayout from "../publicLayout/PublicLayout";
import {
  subscribeToPackages,
  PACKAGE_CATEGORIES,
} from "./packageService";
import "./PublicPackages.css";

export default function PublicPackages() {
  const [packages, setPackages] = useState([]);
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPackages((rows) => {
      setPackages(rows);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const filtered =
    category === "All"
      ? packages.filter((p) => p.status === "Active")
      : packages.filter(
          (p) =>
            p.status === "Active" &&
            p.category === category
        );

  return (
    <PublicLayout>
      <section className="section">

        <div className="section-head">
          <h2>Photography Packages</h2>
        </div>

        <div className="package-tabs">
          <button
            className={category === "All" ? "active" : ""}
            onClick={() => setCategory("All")}
          >
            All
          </button>

          {PACKAGE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={category === cat ? "active" : ""}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading && (
          <div className="loading-line">
            Loading packages...
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            No packages available.
          </div>
        )}

        <div className="grid grid-3">

          {filtered.map((pkg) => (
            <div className="card" key={pkg.id}>

              <div
                className="package-thumb"
                style={{
                  backgroundImage: pkg.imageUrl
                    ? `url(${pkg.imageUrl})`
                    : undefined,
                }}
              />

              <span className="package-category">
                {pkg.category}
              </span>

              <h3>{pkg.name}</h3>

              <div className="package-price">
                ₹{Number(pkg.price).toLocaleString("en-IN")}
              </div>

              {pkg.description && (
                <p>{pkg.description}</p>
              )}

              <Link
                to={`/packages/${pkg.id}`}
                className="btn btn-outline btn-block"
              >
                View Details
              </Link>

              <Link
                to={`/book?package=${encodeURIComponent(pkg.name)}`}
                className="btn btn-gold btn-block"
              >
                Book Now
              </Link>

            </div>
          ))}

        </div>

      </section>
    </PublicLayout>
  );
}