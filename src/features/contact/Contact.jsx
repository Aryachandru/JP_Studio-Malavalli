import React, { useEffect, useState } from "react";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToSettings } from "../settings/settingsService";
import "./Contact.css";

export default function Contact() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const unsub = subscribeToSettings((data) => data && setSettings(data));
    return () => unsub();
  }, []);

  return (
    <PublicLayout>
      <section className="page-header">
        <h1>Contact &amp; Location</h1>
        <p>Reach out or drop by the studio — we'd love to hear about your event.</p>
      </section>

      <section className="section contact-grid">
        <div className="card contact-info-card">
          <h3>Get in Touch</h3>

          {settings.contactPhone && (
            <a href={`tel:${settings.contactPhone}`} className="contact-row">
              <span className="contact-icon">📞</span>
              <span>{settings.contactPhone}</span>
            </a>
          )}
          {settings.contactEmail && (
            <a href={`mailto:${settings.contactEmail}`} className="contact-row">
              <span className="contact-icon">✉️</span>
              <span>{settings.contactEmail}</span>
            </a>
          )}
          {settings.address && (
            <div className="contact-row">
              <span className="contact-icon">📍</span>
              <span>{settings.address}</span>
            </div>
          )}
          {settings.whatsapp && (
            <a
              href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="contact-row"
            >
              <span className="contact-icon">💬</span>
              <span>Chat on WhatsApp</span>
            </a>
          )}

          <div className="contact-social-row">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                Instagram
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                Facebook
              </a>
            )}
          </div>

          {settings.googleMapsUrl && (
            <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-gold btn-block" style={{ marginTop: 18 }}>
              📍 View on Google Maps
            </a>
          )}
        </div>

        <div className="card contact-map-card">
          {settings.googleMapsEmbedUrl ? (
            <iframe
              title="Studio location"
              src={settings.googleMapsEmbedUrl}
              className="contact-map-iframe"
              loading="lazy"
              allowFullScreen
            />
          ) : (
            <div className="contact-map-placeholder">
              <span>📍</span>
              <p>Map will appear here once the studio adds a Google Maps link in Settings.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
