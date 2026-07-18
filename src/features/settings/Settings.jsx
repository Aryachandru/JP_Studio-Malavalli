import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToSettings, saveSettings } from "./settingsService";
import { useDialog } from "../../shared/DialogProvider";
import "./Settings.css";

export default function Settings() {
  const { alertDialog } = useDialog();
  const [form, setForm] = useState({
    studioName: "JP Studio",
    ownerName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    googleMapsUrl: "",
    googleMapsEmbedUrl: "",
    heroImages: [],        // ✅ banner URLs
    youtubeUrls: [],       // ✅ YouTube URLs
  });
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      if (data) {
        setForm((f) => ({
          ...f,
          ...data,
          heroImages: data.heroImages || [],
          youtubeUrls: data.youtubeUrls || [],
        }));
      }
    });
    return () => unsub();
  }, []);

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    await alertDialog("Settings saved successfully!", { tone: "success" });
  }

  function removeHeroImage(idx) {
    setForm((f) => ({
      ...f,
      heroImages: f.heroImages.filter((_, i) => i !== idx),
    }));
  }

  function removeYoutubeUrl(idx) {
    setForm((f) => ({
      ...f,
      youtubeUrls: f.youtubeUrls.filter((_, i) => i !== idx),
    }));
  }

  const studioItems = [
    { key: "profile", icon: "👤", label: "Studio Profile" },
    { key: "banner", icon: "🖼️", label: "Homepage Banner Images" },
    { key: "video", icon: "▶️", label: "YouTube Videos" },
    { key: "contact", icon: "📞", label: "Contact Information" },
    { key: "social", icon: "🔗", label: "Social Media Links" },
    { key: "location", icon: "📍", label: "Location & Google Maps" },
    { key: "payment", icon: "💳", label: "Payment Settings" },
    { key: "notifications", icon: "🔔", label: "Notification Settings" },
  ];

  return (
    <Layout title="Settings">
      <div className="grid grid-2 settings-layout">
        <div className="card">
          <h3>Studio Settings</h3>
          {studioItems.map((item) => (
            <div key={item.key} className="settings-row" onClick={() => setActivePanel(item.key)}>
              <div className="settings-row-left">
                <span>{item.icon}</span>
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
              <span className="settings-chevron">›</span>
            </div>
          ))}
        </div>

        <div className="card">
          <h3>{activePanel ? studioItems.find((i) => i.key === activePanel)?.label : "Studio Profile"}</h3>

          {(activePanel === null || activePanel === "profile") && (
            <>
              <div className="field">
                <label>Studio Name</label>
                <input value={form.studioName} onChange={(e) => update("studioName", e.target.value)} />
              </div>
              <div className="field">
                <label>Owner Name</label>
                <input value={form.ownerName} onChange={(e) => update("ownerName", e.target.value)} />
              </div>
              <div className="field">
                <label>Address</label>
                <textarea rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </>
          )}

          {activePanel === "banner" && (
            <>
              <p className="settings-help-text">Paste image URLs — shown as slideshow.</p>
              {(form.heroImages || []).map((url, idx) => (
                <div key={idx} className="field">
                  <label>Banner {idx + 1}</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...form.heroImages];
                      newUrls[idx] = e.target.value;
                      update("heroImages", newUrls);
                    }}
                  />
                  <button onClick={() => removeHeroImage(idx)}>✕</button>
                </div>
              ))}
              <button onClick={() => update("heroImages", [...(form.heroImages || []), ""])}>+ Add Banner URL</button>
            </>
          )}
          {activePanel === "video" && (
            <>
              <p className="settings-help-text">Add multiple YouTube links.</p>
              {(form.youtubeUrls || []).map((url, idx) => (
                <div key={idx} className="field">
                  <label>YouTube Video {idx + 1}</label>
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...form.youtubeUrls];
                      newUrls[idx] = e.target.value;
                      update("youtubeUrls", newUrls);
                    }}
                  />
                  <button onClick={() => removeYoutubeUrl(idx)}>✕</button>
                </div>
              ))}
              <button onClick={() => update("youtubeUrls", [...(form.youtubeUrls || []), ""])}>+ Add Video</button>
            </>
          )}

          {activePanel === "contact" && (
            <>
              <div className="field">
                <label>Phone</label>
                <input value={form.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
              </div>
              <div className="field">
                <label>Email</label>
                <input value={form.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
              </div>
            </>
          )}

          {activePanel === "social" && (
            <>
              <div className="field">
                <label>Instagram</label>
                <input value={form.instagram} onChange={(e) => update("instagram", e.target.value)} />
              </div>
              <div className="field">
                <label>Facebook</label>
                <input value={form.facebook} onChange={(e) => update("facebook", e.target.value)} />
              </div>
              <div className="field">
                <label>WhatsApp Number</label>
                <input value={form.whatsapp} onChange={(e) => update("whatsapp", e.target.value)} placeholder="+91…" />
              </div>
            </>
          )}

          {activePanel === "location" && (
            <>
              <div className="field">
                <label>Google Maps Link</label>
                <input value={form.googleMapsUrl} onChange={(e) => update("googleMapsUrl", e.target.value)} />
              </div>
              <div className="field">
                <label>Google Maps Embed URL</label>
                <input value={form.googleMapsEmbedUrl} onChange={(e) => update("googleMapsEmbedUrl", e.target.value)} />
              </div>
            </>
          )}

          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
