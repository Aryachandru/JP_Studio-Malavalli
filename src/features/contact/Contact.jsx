import React, { useEffect, useState } from "react";
import PublicLayout from "../publicLayout/PublicLayout";
import { subscribeToSettings } from "../settings/settingsService";
import "./Contact.css";

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2Z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}
function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}
function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    </svg>
  );
}
function StarIcon({ filled }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}
function PhoneIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .3 2 .6 2.9a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.2-1.2a2 2 0 0 1 2.1-.5c.9.3 1.9.5 2.9.6a2 2 0 0 1 1.8 2.1Z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </svg>
  );
}
function PinIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3Z" />
    </svg>
  );
}
function YoutubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.5 8.5s-.2-1.6-.9-2.3c-.8-.9-1.7-.9-2.1-1C16.9 5 12 5 12 5h0s-4.9 0-7.5.2c-.4.1-1.3.1-2.1 1-.7.7-.9 2.3-.9 2.3S1.3 10.3 1.3 12v1.9c0 1.7.2 3.5.2 3.5s.2 1.6.9 2.3c.8.9 1.9.9 2.4 1C6.6 20.9 12 21 12 21s4.9 0 7.5-.2c.4-.1 1.3-.1 2.1-1 .7-.7.9-2.3.9-2.3s.2-1.8.2-3.5V12c0-1.7-.2-3.5-.2-3.5Z" />
      <polygon points="10 9.5 10 14.5 15 12" />
    </svg>
  );
}
function WhatsappIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.5 8.5 0 0 1-12.4 7.6L3 20l1-5.4A8.5 8.5 0 1 1 21 11.5Z" />
      <path d="M8.5 9.5c0 3.5 2.5 6 6 6" />
    </svg>
  );
}

const initialMessage = { name: "", mobile: "", email: "", message: "" };

export default function Contact() {
  const [settings, setSettings] = useState({});
  const [messageForm, setMessageForm] = useState(initialMessage);
  const [sendError, setSendError] = useState(false);

  useEffect(() => {
    const unsub = subscribeToSettings((data) => data && setSettings(data));
    return () => unsub();
  }, []);

  function updateMessage(key, value) {
    setMessageForm((f) => ({ ...f, [key]: value }));
    if (sendError) setSendError(false);
  }

  function handleSendMessage(e) {
    e.preventDefault();
    if (!messageForm.name || !messageForm.mobile || !messageForm.message) return;

    if (!settings.whatsapp) {
      setSendError(true);
      return;
    }

    const phone = settings.whatsapp.replace(/[^0-9]/g, "");
    const text =
      `New enquiry from website:\n` +
      `Name: ${messageForm.name}\n` +
      `Mobile: ${messageForm.mobile}\n` +
      `Email: ${messageForm.email || "-"}\n` +
      `Message: ${messageForm.message}`;
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;

    window.open(url, "_blank", "noopener,noreferrer");
    setMessageForm(initialMessage);
  }

  return (
    <PublicLayout>
      <section className="page-header contact-page-header">
        <div className="contact-header-text">
          <span className="contact-pill">Get In Touch</span>
          <h1>
            Contact &amp; <span className="accent">Location</span>
          </h1>
          <p>
            We'd love to hear from you. Reach out to us for any queries, support or booking assistance. We're here to help.
          </p>

          <div className="contact-feature-row">
            <div className="contact-feature">
              <span className="contact-feature-icon icon-gold"><CameraIcon /></span>
              <span>Capture Your Moments</span>
            </div>
            <div className="contact-feature">
              <span className="contact-feature-icon icon-rose"><HeartIcon /></span>
              <span>Professional Support</span>
            </div>
            <div className="contact-feature">
              <span className="contact-feature-icon icon-blue"><ShieldIcon /></span>
              <span>Safe &amp; Secure Bookings</span>
            </div>
          </div>
        </div>

        <div className="contact-header-art">
          <span className="contact-header-caption">Let's Stay Connected</span>
          <div className="contact-header-art-frame">
            {/* TODO: replace this src with the real photo */}
            <img
              src="/images/jpimage.png"
              alt="JP Studio"
              className="contact-header-art-img"
            />
          </div>
        </div>
      </section>

      <section className="section contact-grid">
        <div className="card contact-info-card">
          <div className="contact-card-body">
            <h3>Get in Touch</h3>
            <p className="contact-info-intro">
              We're always ready to assist. Feel free to reach out to us on any of the following channels.
            </p>

            {settings.contactPhone && (
              <a href={`tel:${settings.contactPhone}`} className="contact-row">
                <span className="contact-icon"><PhoneIcon /></span>
                <span>
                  <span className="contact-row-label">Phone</span>
                  <span className="contact-row-value">{settings.contactPhone}</span>
                </span>
              </a>
            )}
            {settings.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="contact-row">
                <span className="contact-icon"><MailIcon /></span>
                <span>
                  <span className="contact-row-label">Email</span>
                  <span className="contact-row-value">{settings.contactEmail}</span>
                </span>
              </a>
            )}
            {settings.address && (
              <div className="contact-row">
                <span className="contact-icon"><PinIcon /></span>
                <span>
                  <span className="contact-row-label">Address</span>
                  <span className="contact-row-value">{settings.address}</span>
                </span>
              </div>
            )}
            {settings.whatsapp && (
              <a
                href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="contact-row"
              >
                <span className="contact-icon"><WhatsappIcon /></span>
                <span>
                  <span className="contact-row-label">WhatsApp</span>
                  <span className="contact-row-value">Chat with us</span>
                </span>
              </a>
            )}

            {(settings.instagram || settings.facebook || settings.youtube || settings.whatsapp) && (
              <>
                <div className="contact-follow-label">Follow Us</div>
                <div className="contact-social-row">
                  {settings.instagram && (
                    <a href={settings.instagram} target="_blank" rel="noreferrer" className="social-circle social-instagram" aria-label="Instagram">
                      <InstagramIcon />
                    </a>
                  )}
                  {settings.facebook && (
                    <a href={settings.facebook} target="_blank" rel="noreferrer" className="social-circle social-facebook" aria-label="Facebook">
                      <FacebookIcon />
                    </a>
                  )}
                  {settings.youtube && (
                    <a href={settings.youtube} target="_blank" rel="noreferrer" className="social-circle social-youtube" aria-label="YouTube">
                      <YoutubeIcon />
                    </a>
                  )}
                  {settings.whatsapp && (
                    <a
                      href={`https://wa.me/${settings.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="social-circle social-whatsapp"
                      aria-label="WhatsApp"
                    >
                      <WhatsappIcon />
                    </a>
                  )}
                </div>
              </>
            )}
          </div>

          {settings.googleMapsUrl && (
            <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" className="btn btn-gold btn-block contact-card-cta">
              📍 View on Google Maps
            </a>
          )}
        </div>

        <div className="card contact-form-card">
          <form onSubmit={handleSendMessage}>
            <div className="contact-card-body">
              <h3>Send Us a Message</h3>
              <p className="contact-info-intro">Fill in the form below and we'll get back to you soon.</p>

              <div className="field">
                <label>Your Name</label>
                <input placeholder="Enter your full name" value={messageForm.name} onChange={(e) => updateMessage("name", e.target.value)} />
              </div>
              <div className="field">
                <label>Mobile Number</label>
                <input placeholder="Enter mobile number" value={messageForm.mobile} onChange={(e) => updateMessage("mobile", e.target.value)} />
              </div>
              <div className="field">
                <label>Email (Optional)</label>
                <input placeholder="Enter email" value={messageForm.email} onChange={(e) => updateMessage("email", e.target.value)} />
              </div>
              <div className="field">
                <label>Your Message</label>
                <textarea
                  placeholder="Tell us about your event…"
                  rows={4}
                  value={messageForm.message}
                  onChange={(e) => updateMessage("message", e.target.value)}
                />
              </div>
            </div>

            <div className="contact-card-cta">
              <button type="submit" className="btn btn-gold btn-block">
                <SendIcon /> Send via WhatsApp
              </button>
              {sendError && (
                <p className="contact-form-error">
                  WhatsApp number isn't set up yet — please reach us using the details on the left.
                </p>
              )}
            </div>
          </form>
        </div>

        <div className="card contact-map-card">
          <div className="contact-map-header">
            <div className="contact-map-title">JP STUDIO</div>
            {settings.address && <div className="contact-map-address">{settings.address}</div>}
            {settings.rating && settings.reviewCount && (
              <div className="contact-map-rating">
                {settings.rating.toFixed(1)}
                <span className="contact-map-stars">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} filled={i < Math.round(settings.rating)} />
                  ))}
                </span>
                ({settings.reviewCount})
              </div>
            )}
            {settings.googleMapsUrl && (
              <a href={settings.googleMapsUrl} target="_blank" rel="noreferrer" className="contact-map-link">
                View larger map
              </a>
            )}
          </div>

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