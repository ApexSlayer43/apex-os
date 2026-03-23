import { useState, useEffect } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Cormorant:wght@300;400;500;600;700&family=Jost:wght@300;400;500;600;700&display=swap";

const colors = {
  bg: "#FAFAF9",
  surface: "#F5F0E8",
  charcoal: "#1C1917",
  stone: "#44403C",
  warmAccent: "#A16207",
  cream: "#F5F0E1",
  muted: "#78716C",
  border: "#D6D3D1",
  white: "#FFFFFF",
};

const styles = {
  page: {
    fontFamily: "'Jost', sans-serif",
    backgroundColor: colors.bg,
    color: colors.charcoal,
    minHeight: "100vh",
    margin: 0,
    padding: 0,
    overflowX: "hidden",
  },
  // Hero
  hero: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "4rem 2rem",
    position: "relative",
    background: `linear-gradient(180deg, ${colors.charcoal} 0%, #292524 60%, ${colors.stone} 100%)`,
  },
  heroKanji: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(6rem, 15vw, 14rem)",
    fontWeight: 300,
    color: "rgba(255,255,255,0.06)",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    letterSpacing: "-0.02em",
    userSelect: "none",
    pointerEvents: "none",
  },
  heroLine: {
    width: "1px",
    height: "80px",
    backgroundColor: colors.warmAccent,
    margin: "0 auto 2rem",
    opacity: 0.6,
  },
  heroTitle: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(1rem, 2.5vw, 1.3rem)",
    fontWeight: 400,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: "0.35em",
    textTransform: "uppercase",
    marginBottom: "1.5rem",
  },
  heroName: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(3rem, 8vw, 6rem)",
    fontWeight: 300,
    color: colors.white,
    letterSpacing: "-0.02em",
    lineHeight: 1,
    marginBottom: "1.5rem",
  },
  heroSub: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "clamp(0.85rem, 1.5vw, 1rem)",
    fontWeight: 300,
    color: "rgba(255,255,255,0.45)",
    maxWidth: "420px",
    lineHeight: 1.7,
    marginBottom: "3rem",
    letterSpacing: "0.02em",
  },
  heroCta: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: colors.warmAccent,
    backgroundColor: "transparent",
    border: `1px solid ${colors.warmAccent}`,
    padding: "1rem 2.5rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },
  heroCtaHover: {
    backgroundColor: colors.warmAccent,
    color: colors.white,
  },

  // Philosophy
  philosophy: {
    padding: "8rem 2rem",
    textAlign: "center",
    backgroundColor: colors.bg,
  },
  philLabel: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: "2rem",
  },
  philQuote: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(1.5rem, 3.5vw, 2.5rem)",
    fontWeight: 300,
    color: colors.charcoal,
    maxWidth: "700px",
    margin: "0 auto",
    lineHeight: 1.5,
    fontStyle: "italic",
  },
  philDivider: {
    width: "40px",
    height: "1px",
    backgroundColor: colors.warmAccent,
    margin: "3rem auto 0",
    opacity: 0.5,
  },

  // Services
  services: {
    padding: "6rem 2rem",
    backgroundColor: colors.surface,
  },
  servicesInner: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  servicesLabel: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: "3rem",
    textAlign: "center",
  },
  serviceGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "2px",
  },
  serviceCard: {
    backgroundColor: colors.white,
    padding: "3rem 2rem",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "default",
  },
  serviceCardHover: {
    backgroundColor: colors.charcoal,
  },
  serviceIcon: {
    fontSize: "1.8rem",
    marginBottom: "1.5rem",
    opacity: 0.8,
  },
  serviceName: {
    fontFamily: "'Cormorant', serif",
    fontSize: "1.3rem",
    fontWeight: 600,
    marginBottom: "0.75rem",
    color: colors.charcoal,
  },
  serviceNameHover: {
    color: colors.white,
  },
  serviceDesc: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 300,
    color: colors.muted,
    lineHeight: 1.7,
  },
  serviceDescHover: {
    color: "rgba(255,255,255,0.5)",
  },
  servicePrice: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.15em",
    color: colors.warmAccent,
    marginTop: "1.5rem",
    textTransform: "uppercase",
  },

  // Process
  process: {
    padding: "8rem 2rem",
    backgroundColor: colors.bg,
    textAlign: "center",
  },
  processLabel: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.3em",
    textTransform: "uppercase",
    color: colors.muted,
    marginBottom: "4rem",
  },
  processSteps: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: "3rem",
    maxWidth: "800px",
    margin: "0 auto",
    flexWrap: "wrap",
  },
  processStep: {
    flex: "1 1 150px",
    maxWidth: "200px",
  },
  processNum: {
    fontFamily: "'Cormorant', serif",
    fontSize: "3rem",
    fontWeight: 300,
    color: colors.border,
    lineHeight: 1,
    marginBottom: "1rem",
  },
  processTitle: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: colors.charcoal,
    marginBottom: "0.75rem",
  },
  processDesc: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 300,
    color: colors.muted,
    lineHeight: 1.6,
  },

  // Testimonial
  testimonial: {
    padding: "6rem 2rem",
    backgroundColor: colors.charcoal,
    textAlign: "center",
  },
  testQuote: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(1.2rem, 2.5vw, 1.8rem)",
    fontWeight: 300,
    color: "rgba(255,255,255,0.8)",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: 1.6,
    fontStyle: "italic",
  },
  testAuthor: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: colors.warmAccent,
    marginTop: "2rem",
  },

  // CTA
  ctaSection: {
    padding: "8rem 2rem",
    backgroundColor: colors.bg,
    textAlign: "center",
  },
  ctaTitle: {
    fontFamily: "'Cormorant', serif",
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 300,
    color: colors.charcoal,
    marginBottom: "1rem",
    lineHeight: 1.2,
  },
  ctaSub: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 300,
    color: colors.muted,
    marginBottom: "3rem",
    maxWidth: "400px",
    margin: "0 auto 3rem",
    lineHeight: 1.7,
  },
  ctaButton: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.75rem",
    fontWeight: 500,
    letterSpacing: "0.25em",
    textTransform: "uppercase",
    color: colors.white,
    backgroundColor: colors.charcoal,
    border: "none",
    padding: "1.2rem 3rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
  },

  // Footer
  footer: {
    padding: "3rem 2rem",
    textAlign: "center",
    borderTop: `1px solid ${colors.border}`,
  },
  footerText: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 300,
    letterSpacing: "0.15em",
    color: colors.muted,
  },
  footerAddress: {
    fontFamily: "'Jost', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 300,
    color: colors.border,
    marginTop: "0.5rem",
  },
};

const serviceData = [
  {
    icon: "◇",
    name: "Single Knife",
    desc: "Hand-sharpened to your preferred angle. Stropped and polished. Returned within 48 hours.",
    price: "From $35",
  },
  {
    icon: "▽",
    name: "Full Set",
    desc: "Every blade in your collection restored. Each edge profiled individually. Chef consultation included.",
    price: "From $120",
  },
  {
    icon: "○",
    name: "Restoration",
    desc: "Chipped, rusted, or neglected blades brought back. Thinning, re-profiling, and mirror finishing.",
    price: "From $65",
  },
];

const processData = [
  { num: "01", title: "Deliver", desc: "Drop off your knives or schedule a pickup across Portland metro." },
  { num: "02", title: "Assess", desc: "Each blade is examined. We discuss your cutting style and preferences." },
  { num: "03", title: "Sharpen", desc: "Whetstones only. No power grinders. Progressive grit from 400 to 8000." },
  { num: "04", title: "Return", desc: "Stropped, polished, and edge-tested. Returned sharper than new." },
];

function ServiceCard({ icon, name, desc, price }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...styles.serviceCard,
        ...(hovered ? styles.serviceCardHover : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.serviceIcon}>{icon}</div>
      <div style={{ ...styles.serviceName, ...(hovered ? styles.serviceNameHover : {}) }}>{name}</div>
      <div style={{ ...styles.serviceDesc, ...(hovered ? styles.serviceDescHover : {}) }}>{desc}</div>
      <div style={styles.servicePrice}>{price}</div>
    </div>
  );
}

export default function Katsura() {
  const [ctaHovered, setCtaHovered] = useState(false);
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
    <div style={{ ...styles.page, opacity: loaded ? 1 : 0, transition: "opacity 0.8s ease" }}>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroKanji}>桂</div>
        <div style={styles.heroLine} />
        <div style={styles.heroTitle}>Portland's Knife Sharpening Atelier</div>
        <h1 style={styles.heroName}>Katsura</h1>
        <p style={styles.heroSub}>
          Traditional Japanese whetstone sharpening for those who understand
          that a blade is only as good as the hand that maintains it.
        </p>
        <button
          style={{ ...styles.heroCta, ...(ctaHovered ? styles.heroCtaHover : {}) }}
          onMouseEnter={() => setCtaHovered(true)}
          onMouseLeave={() => setCtaHovered(false)}
        >
          Book a Sharpening
        </button>
      </section>

      {/* Philosophy */}
      <section style={styles.philosophy}>
        <div style={styles.philLabel}>Philosophy</div>
        <p style={styles.philQuote}>
          "A dull knife is more dangerous than a sharp one.
          It demands force where precision should suffice."
        </p>
        <div style={styles.philDivider} />
      </section>

      {/* Services */}
      <section style={styles.services}>
        <div style={styles.servicesInner}>
          <div style={styles.servicesLabel}>Services</div>
          <div style={styles.serviceGrid}>
            {serviceData.map((s, i) => (
              <ServiceCard key={i} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={styles.process}>
        <div style={styles.processLabel}>The Process</div>
        <div style={styles.processSteps}>
          {processData.map((p, i) => (
            <div key={i} style={styles.processStep}>
              <div style={styles.processNum}>{p.num}</div>
              <div style={styles.processTitle}>{p.title}</div>
              <div style={styles.processDesc}>{p.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={styles.testimonial}>
        <p style={styles.testQuote}>
          "I've sent my Misono UX10 to three different sharpeners.
          Katsura is the only one that returned it better than it left the factory."
        </p>
        <div style={styles.testAuthor}>James K. — Executive Chef, Canard</div>
      </section>

      {/* CTA */}
      <section style={styles.ctaSection}>
        <h2 style={styles.ctaTitle}>Your blade deserves better.</h2>
        <p style={styles.ctaSub}>
          No power grinders. No rush jobs. Every edge shaped by hand
          on traditional Japanese whetstones.
        </p>
        <button
          style={{ ...styles.ctaButton, opacity: ctaHovered ? 0.85 : 1 }}
        >
          Schedule Your Service
        </button>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerText}>KATSURA — EST. 2024</div>
        <div style={styles.footerAddress}>SE Division St, Portland, Oregon</div>
      </footer>
    </div>
  );
}