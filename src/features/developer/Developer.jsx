import React from "react";
import "./Developer.css";

// -----------------------------------------------------------------------
// Edit everything in this one object to make the page yours — name, role,
// bio, contact links, tech stack, and services. Nothing else in this file
// needs to change for basic edits.
// -----------------------------------------------------------------------
const DEVELOPER = {
  name: "Mr. Chandrashekar",
  role: "Full-Stack Web Developer",
  photoUrl: "", // paste a photo URL here — a placeholder circle shows until you do
  badge: "Let's Work Together 🤝",
  headingLine1: "Let's Build",
  headingLine2: "Something Amazing",
  headingHighlight: "Together",
  bio: "I design and develop modern, responsive and scalable web applications for businesses, startups and individuals.",
  whatsapp: "8431163258",
  email: "chaandru5432@gmail.com",
  linkedin: "linkedin.com/in/chandrashekar",
  linkedinUrl: "https://linkedin.com/in/chandrashekar",
  location: "India",
};

const TECH_GROUPS = [
  {
    label: "Frontend",
    icon: "</>",
    items: [
      { name: "HTML5", icon: "🧡" },
      { name: "CSS3", icon: "🔷" },
      { name: "JavaScript", icon: "🟨" },
      { name: "TypeScript", icon: "🔵" },
      { name: "React", icon: "⚛️" },
      { name: "Tailwind CSS", icon: "🌊" },
    ],
  },
  {
    label: "Backend & Database",
    icon: "🗄️",
    items: [
      { name: "Java", icon: "☕" },
      { name: "Firebase", icon: "🔥" },
      { name: "SharePoint", icon: "🅢" },
      { name: "Node.js", icon: "🟢" },
      { name: "MySQL", icon: "🐬" },
    ],
  },
];

const SERVICES = [
  { icon: "🖥️", title: "Website Development", desc: "Modern and responsive business websites." },
  { icon: "📱", title: "Responsive Web Apps", desc: "Mobile-friendly web applications." },
  { icon: "🛒", title: "Business Management Systems", desc: "Custom solutions for your business needs." },
  { icon: "🎨", title: "UI/UX Design", desc: "Clean, modern and user-friendly designs." },
  { icon: "☁️", title: "Firebase Integration", desc: "Authentication, database and cloud functions." },
  { icon: "🛠️", title: "Maintenance & Support", desc: "Ongoing support and performance optimization." },
];

export default function Developer() {
  return (
    <div className="dev-page">
      <header className="dev-header">
        <div className="dev-header-inner">
          <div className="dev-brand">
            <span className="dev-brand-icon">
                  <img src="/images/JPsLogo.jpeg" alt={"JP"} />

            </span>
            <div>
              <div className="dev-brand-name">JP STUDIO</div>
              <div className="dev-brand-tagline">CAPTURING MEMORIES</div>
            </div>
          </div>
          <a href="/" className="dev-back-link" aria-label="Back to site">☰</a>
        </div>
      </header>

      <section className="dev-hero">
        <div className="dev-hero-text">
          <span className="dev-badge">{DEVELOPER.badge}</span>
          <h1>
            {DEVELOPER.headingLine1}
            <br />
            {DEVELOPER.headingLine2}
            <br />
            <span className="dev-highlight">{DEVELOPER.headingHighlight}</span>
          </h1>
          <p className="dev-bio">{DEVELOPER.bio}</p>
          <div className="dev-hero-actions">
            <a href={`https://wa.me/91${DEVELOPER.whatsapp}`} target="_blank" rel="noreferrer" className="dev-btn dev-btn-primary">
              ✈ Get In Touch
            </a>
            <a href="#dev-services" className="dev-btn dev-btn-outline">
              View Services
            </a>
          </div>
        </div>

        <div className="dev-hero-photo-wrap">
         <div className="dev-photo-circle">
  <img src="/images/DevProfile.jpeg" alt={DEVELOPER.name} />
</div>

          <div className="dev-name-tag">
            <div className="dev-name-tag-name">{DEVELOPER.name}</div>
            <div className="dev-name-tag-role">{DEVELOPER.role}</div>
          </div>
          <span className="dev-float-icon dev-float-1">{"</>"}</span>
          <span className="dev-float-icon dev-float-2">✓</span>
          <span className="dev-float-icon dev-float-3">⚙</span>
        </div>
      </section>

      <section className="dev-section">
        <div className="dev-card dev-tech-card">
          <div className="dev-tech-eyebrow">Technologies I Work With</div>
          {TECH_GROUPS.map((group) => (
            <div key={group.label} className="dev-tech-row">
              <div className="dev-tech-group-label">
                <span className="dev-tech-group-icon">{group.icon}</span>
                {group.label}
              </div>
              <div className="dev-tech-items">
                {group.items.map((item) => (
                  <div key={item.name} className="dev-tech-item">
                    <span className="dev-tech-item-icon">{item.icon}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="dev-section" id="dev-services">
        <div className="dev-section-eyebrow">My Services</div>
        <div className="dev-services-grid">
          {SERVICES.map((s) => (
            <div key={s.title} className="dev-card dev-service-card">
              <div className="dev-service-icon">{s.icon}</div>
              <div className="dev-service-title">{s.title}</div>
              <div className="dev-service-desc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="dev-section">
        <div className="dev-cta-banner">
          <div className="dev-cta-left">
            <span className="dev-cta-icon">✉️</span>
            <div>
              <div className="dev-cta-title">Have a Project in Mind?</div>
              <div className="dev-cta-desc">Let's discuss and turn your ideas into reality.</div>
            </div>
          </div>
          <a href={`mailto:${DEVELOPER.email}`} className="dev-btn dev-btn-primary">
            ✈ Send a Project Inquiry
          </a>
        </div>
      </section>

      <footer className="dev-footer">
        <div className="dev-section-eyebrow">Let's Connect</div>
        <div className="dev-connect-row">
          <a href={`https://wa.me/91${DEVELOPER.whatsapp}`} target="_blank" rel="noreferrer" className="dev-connect-item">
            <span className="dev-connect-icon">📞</span>
            <div>
              <div className="dev-connect-label">WhatsApp</div>
              <div className="dev-connect-value">{DEVELOPER.whatsapp}</div>
            </div>
          </a>
          <a href={`mailto:${DEVELOPER.email}`} className="dev-connect-item">
            <span className="dev-connect-icon">✉️</span>
            <div>
              <div className="dev-connect-label">Email</div>
              <div className="dev-connect-value">{DEVELOPER.email}</div>
            </div>
          </a>
          <a href={DEVELOPER.linkedinUrl} target="_blank" rel="noreferrer" className="dev-connect-item">
            <span className="dev-connect-icon">in</span>
            <div>
              <div className="dev-connect-label">LinkedIn</div>
              <div className="dev-connect-value">{DEVELOPER.linkedin}</div>
            </div>
          </a>
          <div className="dev-connect-item">
            <span className="dev-connect-icon">📍</span>
            <div>
              <div className="dev-connect-label">Location</div>
              <div className="dev-connect-value">{DEVELOPER.location}</div>
            </div>
          </div>
        </div>

        <div className="dev-footer-bottom">
          <span>💜 Built with passion by <strong>{DEVELOPER.name}</strong></span>
          <span>© {new Date().getFullYear()} JP Studio. All Rights Reserved.</span>
        </div>
      </footer>
    </div>
  );
}