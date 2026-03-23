import { useState, useEffect } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&family=Varela+Round&display=swap";

const c = {
  teal: "#0D9488",
  tealLight: "#14B8A6",
  tealBg: "#F0FDFA",
  orange: "#EA580C",
  orangeLight: "#FED7AA",
  bg: "#FAFDFB",
  card: "#FFFFFF",
  text: "#134E4A",
  textLight: "#64748B",
  border: "#D1FAE5",
  white: "#FFFFFF",
  softGreen: "#ECFDF5",
  urgentRed: "#DC2626",
};

const s = {
  page: {
    fontFamily: "'Nunito Sans', sans-serif",
    backgroundColor: c.bg,
    color: c.text,
    minHeight: "100vh",
    margin: 0,
  },
  // Nav
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1rem 2rem",
    backgroundColor: c.white,
    borderBottom: `1px solid ${c.border}`,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "1.4rem",
    color: c.teal,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoPaw: {
    fontSize: "1.6rem",
  },
  navLinks: {
    display: "flex",
    gap: "2rem",
    alignItems: "center",
  },
  navLink: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: c.textLight,
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 0.2s ease",
  },
  navCta: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: c.white,
    backgroundColor: c.teal,
    border: "none",
    borderRadius: "9999px",
    padding: "0.6rem 1.5rem",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  // Hero
  hero: {
    padding: "5rem 2rem 4rem",
    textAlign: "center",
    backgroundColor: c.tealBg,
    position: "relative",
    overflow: "hidden",
  },
  heroBadge: {
    display: "inline-block",
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    color: c.teal,
    backgroundColor: c.white,
    border: `1px solid ${c.border}`,
    borderRadius: "9999px",
    padding: "0.4rem 1rem",
    marginBottom: "1.5rem",
  },
  heroTitle: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "clamp(2rem, 5vw, 3.2rem)",
    color: c.text,
    lineHeight: 1.2,
    marginBottom: "1rem",
    maxWidth: "650px",
    margin: "0 auto 1rem",
  },
  heroHighlight: {
    color: c.teal,
  },
  heroSub: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "1.05rem",
    fontWeight: 400,
    color: c.textLight,
    maxWidth: "500px",
    margin: "0 auto 2rem",
    lineHeight: 1.6,
  },
  heroActions: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
  },
  btnPrimary: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: c.white,
    backgroundColor: c.teal,
    border: "none",
    borderRadius: "9999px",
    padding: "0.9rem 2rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 14px rgba(13,148,136,0.3)",
  },
  btnSecondary: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: c.teal,
    backgroundColor: c.white,
    border: `2px solid ${c.teal}`,
    borderRadius: "9999px",
    padding: "0.9rem 2rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  heroTrust: {
    marginTop: "2.5rem",
    display: "flex",
    justifyContent: "center",
    gap: "2rem",
    flexWrap: "wrap",
  },
  trustItem: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: c.textLight,
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  trustCheck: {
    color: c.teal,
    fontSize: "1rem",
  },

  // How it works
  howSection: {
    padding: "5rem 2rem",
    textAlign: "center",
    backgroundColor: c.white,
  },
  sectionLabel: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 700,
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    color: c.teal,
    marginBottom: "0.5rem",
  },
  sectionTitle: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    color: c.text,
    marginBottom: "3rem",
  },
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "2rem",
    maxWidth: "900px",
    margin: "0 auto",
  },
  stepCard: {
    backgroundColor: c.softGreen,
    borderRadius: "16px",
    padding: "2rem 1.5rem",
    textAlign: "center",
  },
  stepNum: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "2rem",
    color: c.teal,
    marginBottom: "0.75rem",
  },
  stepTitle: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    color: c.text,
    marginBottom: "0.5rem",
  },
  stepDesc: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 400,
    color: c.textLight,
    lineHeight: 1.6,
  },

  // Features
  features: {
    padding: "5rem 2rem",
    backgroundColor: c.bg,
  },
  featuresInner: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  featureRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1.5rem",
  },
  featureCard: {
    backgroundColor: c.white,
    borderRadius: "16px",
    padding: "2rem",
    border: `1px solid ${c.border}`,
    transition: "box-shadow 0.2s ease",
  },
  featureIcon: {
    fontSize: "1.5rem",
    marginBottom: "1rem",
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: c.tealBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "1rem",
    fontWeight: 700,
    color: c.text,
    marginBottom: "0.5rem",
  },
  featureDesc: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 400,
    color: c.textLight,
    lineHeight: 1.6,
  },

  // Urgent
  urgent: {
    padding: "3rem 2rem",
    backgroundColor: "#FEF2F2",
    textAlign: "center",
    borderTop: `3px solid ${c.urgentRed}`,
  },
  urgentTitle: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "1.3rem",
    color: c.urgentRed,
    marginBottom: "0.5rem",
  },
  urgentDesc: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.9rem",
    color: "#991B1B",
    marginBottom: "1.5rem",
  },
  urgentBtn: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 700,
    color: c.white,
    backgroundColor: c.urgentRed,
    border: "none",
    borderRadius: "9999px",
    padding: "0.9rem 2rem",
    cursor: "pointer",
  },

  // Pricing
  pricing: {
    padding: "5rem 2rem",
    textAlign: "center",
    backgroundColor: c.white,
  },
  priceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.5rem",
    maxWidth: "850px",
    margin: "2rem auto 0",
  },
  priceCard: (featured) => ({
    backgroundColor: featured ? c.teal : c.white,
    borderRadius: "20px",
    padding: "2.5rem 2rem",
    border: featured ? "none" : `1px solid ${c.border}`,
    color: featured ? c.white : c.text,
    position: "relative",
    boxShadow: featured ? "0 8px 30px rgba(13,148,136,0.25)" : "none",
  }),
  priceName: (featured) => ({
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    color: featured ? "rgba(255,255,255,0.7)" : c.textLight,
    marginBottom: "0.5rem",
  }),
  priceAmount: (featured) => ({
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "2.5rem",
    color: featured ? c.white : c.text,
    marginBottom: "0.25rem",
  }),
  pricePer: (featured) => ({
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.8rem",
    color: featured ? "rgba(255,255,255,0.6)" : c.textLight,
    marginBottom: "1.5rem",
  }),
  priceFeature: (featured) => ({
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    color: featured ? "rgba(255,255,255,0.85)" : c.textLight,
    padding: "0.4rem 0",
    borderBottom: `1px solid ${featured ? "rgba(255,255,255,0.15)" : c.border}`,
    textAlign: "left",
  }),
  priceBtn: (featured) => ({
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: featured ? c.teal : c.white,
    backgroundColor: featured ? c.white : c.teal,
    border: "none",
    borderRadius: "9999px",
    padding: "0.8rem 2rem",
    cursor: "pointer",
    marginTop: "1.5rem",
    width: "100%",
    transition: "opacity 0.2s ease",
  }),

  // Footer
  footer: {
    padding: "3rem 2rem",
    textAlign: "center",
    backgroundColor: c.text,
    color: "rgba(255,255,255,0.5)",
  },
  footerLogo: {
    fontFamily: "'Varela Round', sans-serif",
    fontSize: "1.2rem",
    color: c.white,
    marginBottom: "0.5rem",
  },
  footerText: {
    fontFamily: "'Nunito Sans', sans-serif",
    fontSize: "0.75rem",
  },
};

const steps = [
  { num: "1", title: "Download the App", desc: "Free on iOS and Android. Create your pet's profile in 60 seconds." },
  { num: "2", title: "Describe Symptoms", desc: "Text, photo, or video. Our vets see what you see." },
  { num: "3", title: "Connect with a Vet", desc: "Licensed veterinarian on video within 15 minutes. No appointments." },
];

const features = [
  { icon: "🩺", title: "Licensed Vets Only", desc: "Every vet on PawLink is state-licensed with 5+ years clinical experience. No AI chatbots." },
  { icon: "📍", title: "Built for Rural", desc: "No vet clinic nearby? No problem. Get expert care from anywhere with a cell signal." },
  { icon: "💊", title: "Rx to Your Door", desc: "Prescriptions sent to your nearest pharmacy or delivered to your mailbox." },
  { icon: "🐾", title: "All Species Welcome", desc: "Dogs, cats, horses, goats, chickens — our vets cover large and small animals." },
  { icon: "📋", title: "Full Medical Records", desc: "Every visit documented. Share records with your local vet seamlessly." },
  { icon: "🌙", title: "24/7 Emergency Triage", desc: "Not sure if it's an emergency? Our triage team helps you decide — any hour." },
];

export default function PawLink() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_URL;
    document.head.appendChild(link);
    setTimeout(() => setLoaded(true), 100);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div style={{ ...s.page, opacity: loaded ? 1 : 0, transition: "opacity 0.6s ease" }}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}>
          <span style={s.logoPaw}>🐾</span> PawLink
        </div>
        <div style={s.navLinks}>
          <span style={s.navLink}>How It Works</span>
          <span style={s.navLink}>Pricing</span>
          <span style={s.navLink}>For Vets</span>
          <button style={s.navCta}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={s.hero}>
        <div style={s.heroBadge}>Now available in 38 states</div>
        <h1 style={s.heroTitle}>
          Your pet deserves a vet.<br />
          <span style={s.heroHighlight}>Even out here.</span>
        </h1>
        <p style={s.heroSub}>
          Video vet visits in under 15 minutes. Prescriptions delivered.
          Built for the 60 million Americans who live more than 30 minutes
          from the nearest veterinary clinic.
        </p>
        <div style={s.heroActions}>
          <button style={s.btnPrimary}>Start Free Visit</button>
          <button style={s.btnSecondary}>See How It Works</button>
        </div>
        <div style={s.heroTrust}>
          <span style={s.trustItem}><span style={s.trustCheck}>✓</span> Licensed vets</span>
          <span style={s.trustItem}><span style={s.trustCheck}>✓</span> No appointment needed</span>
          <span style={s.trustItem}><span style={s.trustCheck}>✓</span> Prescriptions included</span>
        </div>
      </section>

      {/* How It Works */}
      <section style={s.howSection}>
        <div style={s.sectionLabel}>How It Works</div>
        <h2 style={s.sectionTitle}>Three steps to peace of mind</h2>
        <div style={s.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} style={s.stepCard}>
              <div style={s.stepNum}>{step.num}</div>
              <div style={s.stepTitle}>{step.title}</div>
              <div style={s.stepDesc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={s.features}>
        <div style={s.featuresInner}>
          <div style={{ textAlign: "center", marginBottom: "3rem" }}>
            <div style={s.sectionLabel}>Why PawLink</div>
            <h2 style={s.sectionTitle}>Real vets. Real care. Real fast.</h2>
          </div>
          <div style={s.featureRow}>
            {features.map((f, i) => (
              <div key={i} style={s.featureCard}>
                <div style={s.featureIcon}>{f.icon}</div>
                <div style={s.featureTitle}>{f.title}</div>
                <div style={s.featureDesc}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Urgent Banner */}
      <section style={s.urgent}>
        <div style={s.urgentTitle}>Is your pet in distress right now?</div>
        <div style={s.urgentDesc}>
          Our emergency triage team can help you determine if this is an emergency
          and connect you with the right care immediately.
        </div>
        <button style={s.urgentBtn}>Emergency Triage — Free</button>
      </section>

      {/* Pricing */}
      <section style={s.pricing}>
        <div style={s.sectionLabel}>Simple Pricing</div>
        <h2 style={s.sectionTitle}>Less than one drive to the vet</h2>
        <div style={s.priceGrid}>
          <div style={s.priceCard(false)}>
            <div style={s.priceName(false)}>Single Visit</div>
            <div style={s.priceAmount(false)}>$35</div>
            <div style={s.pricePer(false)}>per visit</div>
            {["15-min video consultation", "Photo & video sharing", "Written care plan", "Rx if needed"].map((f, i) => (
              <div key={i} style={s.priceFeature(false)}>✓ {f}</div>
            ))}
            <button style={s.priceBtn(false)}>Book a Visit</button>
          </div>
          <div style={s.priceCard(true)}>
            <div style={s.priceName(true)}>PawLink+</div>
            <div style={s.priceAmount(true)}>$19</div>
            <div style={s.pricePer(true)}>per month · unlimited visits</div>
            {["Unlimited video visits", "24/7 emergency triage", "Rx delivery included", "Multi-pet family plan", "Full medical records"].map((f, i) => (
              <div key={i} style={s.priceFeature(true)}>✓ {f}</div>
            ))}
            <button style={s.priceBtn(true)}>Start Free Trial</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={s.footer}>
        <div style={s.footerLogo}>🐾 PawLink</div>
        <div style={s.footerText}>Veterinary telehealth for everyone, everywhere.</div>
      </footer>
    </div>
  );
}