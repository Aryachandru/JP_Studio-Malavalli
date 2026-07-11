import React, { useEffect, useState } from "react";
import Layout from "../adminShell/Layout";
import { subscribeToSettings, saveSettings } from "./settingsService";
import "./Settings.css";

export default function Settings() {
  const [form, setForm] = useState({
    studioName: "JP Studio",
    ownerName: "",
    contactPhone: "",
    contactEmail: "",
    address: "",
    instagram: "",
    facebook: "",
    whatsapp: "",
    youtube: "",
    googleMapsUrl: "",
    googleMapsEmbedUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [activePanel, setActivePanel] = useState(null);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      if (data) setForm((f) => ({ ...f, ...data }));
    });
    return () => unsub();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await saveSettings(form);
    setSaving(false);
    setActivePanel(null);
  }

  const studioItems = [
    { key: "profile", icon: "👤", label: "Studio Profile" },
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
          <h3 style={{ marginBottom: 10 }}>Studio Settings</h3>
          {studioItems.map((item) => (
            <div key={item.key} className="settings-row" onClick={() => setActivePanel(item.key)}>
              <div className="settings-row-left">
                <span>{item.icon}</span>
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </div>
              <span className="settings-chevron">›</span>
            </div>
          ))}

          <h3 style={{ margin: "22px 0 10px" }}>App Settings</h3>
          <div className="settings-row"><span>🔒 Change Password</span><span className="settings-chevron">›</span></div>
          <div className="settings-row"><span>📄 Privacy Policy</span><span className="settings-chevron">›</span></div>
          <div className="settings-row"><span>📄 Terms &amp; Conditions</span><span className="settings-chevron">›</span></div>

          <div className="settings-version">
            JP STUDIO · Version 1.0.0
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 14 }}>
            {activePanel ? studioItems.find((i) => i.key === activePanel)?.label : "Studio Profile"}
          </h3>

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
              <div className="field">
                <label>Homepage Banner Image URL</label>
                <input
                  value={form.heroImageUrl || ""}
                  onChange={(e) => update("heroImageUrl", e.target.value)}
                  placeholder="https://…  (shown behind the headline on your homepage)"
                />
              </div>
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
              <div className="field">
  <label>YouTube</label>
  <input
    value={form.youtube}
    onChange={(e) => update("youtube", e.target.value)}
    placeholder="https://youtube.com/..."
  />
</div>

            </>
          )}

          {activePanel === "location" && (
            <>
              <div className="field">
                <label>Google Maps Link (shown as "View on Map" button)</label>
                <input
                  value={form.googleMapsUrl}
                  onChange={(e) => update("googleMapsUrl", e.target.value)}
                  placeholder="https://maps.google.com/?q=…  (paste your share link here)"
                />
              </div>
              <div className="field">
                <label>Google Maps Embed URL (Optional — shows a live map on Contact page)</label>
                <input
                  value={form.googleMapsEmbedUrl}
                  onChange={(e) => update("googleMapsEmbedUrl", e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=…"
                />
              </div>
              <p style={{ color: "var(--ink-400)", fontSize: 12 }}>
                Get the embed link from Google Maps → Share → Embed a map → copy the URL
                inside <code>src="..."</code>.
              </p>
            </>
          )}

          {(activePanel === "payment" || activePanel === "notifications") && (
            <p style={{ color: "var(--ink-400)", fontSize: 13 }}>
              Wire this panel up to your payment gateway or notification provider config.
            </p>
          )}

          <button className="btn btn-gold" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </Layout>
  );
}
