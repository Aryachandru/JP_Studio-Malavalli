import React, { useEffect, useRef, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToGallery, uploadGalleryPhoto, deleteGalleryPhoto } from "./galleryService";
import "./AdminGallery.css";

const CATEGORIES = ["All Photos", "Wedding", "Pre Wedding", "Baby Shoot", "Birthday", "Maternity"];

export default function Gallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All Photos");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = subscribeToGallery((rows) => {
      setPhotos(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = category === "All Photos" ? photos : photos.filter((p) => p.category === category);

  async function handleFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const targetCategory = category === "All Photos" ? "Wedding" : category;
      await Promise.all(files.map((file) => uploadGalleryPhoto(file, targetCategory)));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id) {
    if (window.confirm("Delete this photo?")) await deleteGalleryPhoto(id);
  }

  return (
    <Layout title="Gallery">
      <div className="gallery-toolbar">
        <div className="tab-row" style={{ marginBottom: 0 }}>
          {CATEGORIES.map((c) => (
            <button key={c} className={`tab-pill${category === c ? " active" : ""}`} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
        <div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
          <button className="btn btn-gold" onClick={() => fileInputRef.current.click()} disabled={uploading}>
            {uploading ? "Uploading…" : "⬆ Upload Photos"}
          </button>
        </div>
      </div>

      {loading && <div className="loading-line">Loading gallery…</div>}
      {!loading && filtered.length === 0 && <div className="empty-state">No photos in this category yet.</div>}

      <div className="gallery-grid">
        {filtered.map((p) => (
          <div key={p.id} className="gallery-photo-wrap">
            <img src={p.url} alt={p.fileName || "Studio photo"} className="gallery-photo" />
            <button className="gallery-delete-btn" onClick={() => handleDelete(p.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </Layout>
  );
}
