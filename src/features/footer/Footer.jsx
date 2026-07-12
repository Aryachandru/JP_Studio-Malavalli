import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { subscribeToSettings } from "../settings/settingsService";
import "./Footer.css";

export default function Footer() {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    const unsub = subscribeToSettings((data) => {
      if (data) setSettings(data);
    });
    return () => unsub();
  }, []);

  return (
    <footer className="public-footer">
      <div className="public-footer-inner">
        <div className="footer-col">
          <div className="public-brand" style={{ marginBottom: 10 }}>
            <span className="public-logo-badge">JP</span>
            <span className="public-brand-text" style={{ color: "#fff" }}>
              {settings.studioName || "JP STUDIO"}
            </span>
          </div>
          <p className="footer-tagline">Capturing your moments, beautifully.</p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <Link to="/packages">Packages</Link>
          <Link to="/gallery">Gallery</Link>
          <Link to="/book">Book Now</Link>
          <Link to="/track">Track Booking</Link>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          {settings.contactPhone && <p>📞 {settings.contactPhone}</p>}
          {settings.contactEmail && <p>✉️ {settings.contactEmail}</p>}
          {settings.address && <p>📍 {settings.address}</p>}
        </div>

        <div className="footer-col">
          <h4>Follow Us</h4>
          <div className="footer-social-row">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noreferrer">Instagram</a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noreferrer">Facebook</a>
            )}
            {settings.whatsapp && (
              <a href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            )}
            
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {settings.studioName || "JP Studio"}. All rights reserved.
      </div>
    </footer>
  );
}
