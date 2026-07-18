import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToGallery, addGalleryItem, deleteGalleryItem, GALLERY_CATEGORIES } from "./galleryService";
import { getYouTubeThumbnail } from "../../shared/youtube";
import { useDialog } from "../../shared/DialogProvider";
import Dropdown from "../../shared/Dropdown";
import "./AdminGallery.css";

const FILTER_TABS = ["All Photos", ...GALLERY_CATEGORIES];

export default function Gallery() {
  const { alertDialog, confirmDialog } = useDialog();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("All Photos");

  const [formCategory, setFormCategory] = useState(GALLERY_CATEGORIES[0]);
  const [mediaType, setMediaType] = useState("image");
  const [urlInput, setUrlInput] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsub = subscribeToGallery((rows) => {
      setItems(rows);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = filterCategory === "All Photos" ? items : items.filter((p) => p.category === filterCategory);

  async function handleAdd() {
    if (!urlInput.trim()) {
      await alertDialog("Please paste an image or video URL first.");
      return;
    }
    setSaving(true);
    try {
      await addGalleryItem({ url: urlInput, category: formCategory, mediaType });
      setUrlInput("");
    } catch (err) {
      await alertDialog("Couldn't add that item: " + err.message, { tone: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (await confirmDialog("Remove this item from the gallery?", { tone: "warning", confirmLabel: "Remove" })) {
      await deleteGalleryItem(id);
    }
  }

  return (
    <Layout title="Gallery">
      <div className="card gallery-add-card">
        <h3 style={{ marginBottom: 4 }}>Add to Gallery</h3>
        <p className="gallery-add-hint">
          Paste a link to an image or video (a YouTube link works for video, or a direct file URL) — no upload needed.
        </p>

        <div className="grid grid-3 gallery-add-grid">
          <div className="field">
            <label>Category</label>
            <Dropdown options={GALLERY_CATEGORIES} value={formCategory} onChange={setFormCategory} />
          </div>
          <div className="field">
            <label>Type</label>
            <Dropdown
              options={[{ value: "image", label: "Image" }, { value: "video", label: "Video" }]}
              value={mediaType}
              onChange={setMediaType}
            />
          </div>
          <div className="field">
            <label>{mediaType === "video" ? "Video URL (YouTube or direct file)" : "Image URL"}</label>
            <input
              placeholder={mediaType === "video" ? "https://youtube.com/watch?v=… or https://…/video.mp4" : "https://…/photo.jpg"}
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
          </div>
        </div>

        <button className="btn btn-gold" onClick={handleAdd} disabled={saving}>
          {saving ? "Adding…" : "+ Add to Gallery"}
        </button>
      </div>

      <div className="tab-row" style={{ marginTop: 22 }}>
        {FILTER_TABS.map((c) => (
          <button key={c} className={`tab-pill${filterCategory === c ? " active" : ""}`} onClick={() => setFilterCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {loading && <div className="loading-line">Loading gallery…</div>}
      {!loading && filtered.length === 0 && <div className="empty-state">No items in this category yet.</div>}

      <div className="gallery-grid">
        {filtered.map((p) => {
          const thumbSrc = p.mediaType === "video" ? getYouTubeThumbnail(p.url) : p.url;
          return (
            <div key={p.id} className="gallery-photo-wrap">
              {thumbSrc ? (
                <img src={thumbSrc} alt="Gallery item" className="gallery-photo" loading="lazy" decoding="async" />
              ) : (
                <div className="gallery-photo gallery-video-placeholder">🎬</div>
              )}
              {p.mediaType === "video" && <span className="gallery-video-badge">▶ Video</span>}
              <button className="gallery-delete-btn" onClick={() => handleDelete(p.id)}>
                🗑️
              </button>
            </div>
          );
        })}
      </div>
    </Layout>
  );
}