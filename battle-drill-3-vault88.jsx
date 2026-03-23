import { useState, useEffect } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Fira+Sans:wght@300;400;500;600;700&display=swap";

const c = {
  bg: "#0A0F1C",
  surface: "#111827",
  card: "#1A2235",
  border: "#2A3548",
  text: "#E2E8F0",
  textMuted: "#64748B",
  green: "#10B981",
  greenDim: "rgba(16,185,129,0.15)",
  amber: "#F59E0B",
  amberDim: "rgba(245,158,11,0.15)",
  red: "#EF4444",
  redDim: "rgba(239,68,68,0.15)",
  blue: "#3B82F6",
  blueDim: "rgba(59,130,246,0.1)",
  white: "#FFFFFF",
};

const s = {
  page: {
    fontFamily: "'Fira Sans', sans-serif",
    backgroundColor: c.bg,
    color: c.text,
    minHeight: "100vh",
    margin: 0,
  },
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.75rem 2rem",
    backgroundColor: c.surface,
    borderBottom: `1px solid ${c.border}`,
  },
  logo: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.95rem",
    fontWeight: 700,
    color: c.green,
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
  },
  logoBlock: {
    width: "8px",
    height: "8px",
    backgroundColor: c.green,
    borderRadius: "2px",
    boxShadow: `0 0 8px ${c.green}`,
  },
  navRight: {
    display: "flex",
    gap: "1.5rem",
    alignItems: "center",
  },
  navLink: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 500,
    color: c.textMuted,
    cursor: "pointer",
  },
  navBtn: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.75rem",
    fontWeight: 600,
    color: c.bg,
    backgroundColor: c.green,
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
  },

  // Hero dashboard
  hero: {
    padding: "3rem 2rem 2rem",
  },
  heroTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem",
  },
  heroTitle: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "clamp(1.5rem, 3vw, 2rem)",
    fontWeight: 700,
    color: c.text,
    lineHeight: 1.2,
  },
  heroSub: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 400,
    color: c.textMuted,
    marginTop: "0.25rem",
  },
  liveTag: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.7rem",
    fontWeight: 600,
    color: c.green,
    backgroundColor: c.greenDim,
    padding: "0.3rem 0.75rem",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
  },
  liveDot: {
    width: "6px",
    height: "6px",
    backgroundColor: c.green,
    borderRadius: "50%",
    boxShadow: `0 0 6px ${c.green}`,
  },

  // Metrics
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  metricCard: {
    backgroundColor: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: "8px",
    padding: "1.25rem",
  },
  metricLabel: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.7rem",
    fontWeight: 500,
    color: c.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "0.5rem",
  },
  metricValue: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "1.8rem",
    fontWeight: 700,
    lineHeight: 1,
    marginBottom: "0.25rem",
  },
  metricChange: (positive) => ({
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.7rem",
    fontWeight: 500,
    color: positive ? c.green : c.red,
  }),

  // Garage table
  tableSection: {
    padding: "0 2rem 3rem",
  },
  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  tableTitle: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.9rem",
    fontWeight: 600,
    color: c.text,
  },
  tableFilter: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.7rem",
    color: c.textMuted,
    backgroundColor: c.card,
    border: `1px solid ${c.border}`,
    borderRadius: "4px",
    padding: "0.4rem 0.8rem",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: c.card,
    borderRadius: "8px",
    overflow: "hidden",
    border: `1px solid ${c.border}`,
  },
  th: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.65rem",
    fontWeight: 600,
    color: c.textMuted,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    textAlign: "left",
    padding: "0.75rem 1rem",
    backgroundColor: c.surface,
    borderBottom: `1px solid ${c.border}`,
  },
  td: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.8rem",
    color: c.text,
    padding: "0.75rem 1rem",
    borderBottom: `1px solid ${c.border}`,
  },
  tdMono: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.75rem",
  },
  statusBadge: (status) => ({
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.65rem",
    fontWeight: 600,
    padding: "0.2rem 0.5rem",
    borderRadius: "3px",
    color: status === "online" ? c.green : status === "warning" ? c.amber : c.red,
    backgroundColor: status === "online" ? c.greenDim : status === "warning" ? c.amberDim : c.redDim,
  }),
  occupancyBar: {
    width: "100%",
    height: "4px",
    backgroundColor: c.border,
    borderRadius: "2px",
    overflow: "hidden",
    marginTop: "4px",
  },
  occupancyFill: (pct) => ({
    width: `${pct}%`,
    height: "100%",
    backgroundColor: pct > 90 ? c.red : pct > 70 ? c.amber : c.green,
    borderRadius: "2px",
    transition: "width 0.5s ease",
  }),

  // Features
  featuresSection: {
    padding: "3rem 2rem",
    borderTop: `1px solid ${c.border}`,
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "1px",
    backgroundColor: c.border,
    border: `1px solid ${c.border}`,
    borderRadius: "8px",
    overflow: "hidden",
  },
  featureCell: {
    backgroundColor: c.surface,
    padding: "1.5rem",
  },
  featureTitle: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 600,
    color: c.text,
    marginBottom: "0.4rem",
  },
  featureDesc: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.8rem",
    fontWeight: 400,
    color: c.textMuted,
    lineHeight: 1.5,
  },
  featureCode: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.7rem",
    color: c.green,
    marginTop: "0.5rem",
  },

  // CTA
  cta: {
    padding: "4rem 2rem",
    textAlign: "center",
    borderTop: `1px solid ${c.border}`,
  },
  ctaTitle: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "1.5rem",
    fontWeight: 700,
    color: c.text,
    marginBottom: "0.5rem",
  },
  ctaSub: {
    fontFamily: "'Fira Sans', sans-serif",
    fontSize: "0.85rem",
    color: c.textMuted,
    marginBottom: "2rem",
  },
  ctaBtn: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.8rem",
    fontWeight: 600,
    color: c.bg,
    backgroundColor: c.green,
    border: "none",
    borderRadius: "4px",
    padding: "0.8rem 2rem",
    cursor: "pointer",
    boxShadow: `0 0 20px rgba(16,185,129,0.2)`,
  },

  footer: {
    padding: "2rem",
    textAlign: "center",
    borderTop: `1px solid ${c.border}`,
  },
  footerText: {
    fontFamily: "'Fira Code', monospace",
    fontSize: "0.65rem",
    color: c.textMuted,
  },
};

const metrics = [
  { label: "Total Spaces", value: "4,832", change: "+120", positive: true, color: c.blue },
  { label: "Occupied Now", value: "3,617", change: "74.8%", positive: true, color: c.green },
  { label: "Revenue (MTD)", value: "$847K", change: "+12.3%", positive: true, color: c.green },
  { label: "Incidents", value: "3", change: "-2 vs last month", positive: true, color: c.amber },
];

const garages = [
  { name: "Gateway Tower A", id: "GT-A", capacity: 820, occupied: 756, status: "online", revenue: "$184K" },
  { name: "Riverside Deck", id: "RVD", capacity: 1200, occupied: 891, status: "online", revenue: "$226K" },
  { name: "City Center Underground", id: "CCU", capacity: 650, occupied: 643, status: "warning", revenue: "$198K" },
  { name: "Airport Long-Term B", id: "ALT-B", capacity: 1540, occupied: 1102, status: "online", revenue: "$189K" },
  { name: "Memorial Hospital", id: "MH-1", capacity: 622, occupied: 225, status: "online", revenue: "$50K" },
];

const feats = [
  { title: "Real-Time Occupancy", desc: "Sensor-level visibility into every space. Know what's open, what's full, what's expiring.", code: "GET /api/v2/garages/{id}/occupancy" },
  { title: "Revenue Analytics", desc: "Hourly, daily, monthly breakdowns. Rate optimization suggestions based on demand curves.", code: "Revenue up 18% with dynamic pricing" },
  { title: "Incident Management", desc: "Gate failures, sensor faults, security events. Auto-escalation with configurable thresholds.", code: "MTTR reduced from 4.2h to 0.8h" },
  { title: "Multi-Site Rollup", desc: "One view across your entire portfolio. Drill down to individual garages, levels, and zones.", code: "Supports 1–500 facilities" },
  { title: "Hardware Agnostic", desc: "Works with SKIDATA, TIBA, FlashParking, HUB, or any PARCS system. No rip-and-replace.", code: "12 integrations shipping" },
  { title: "API-First", desc: "Everything in the dashboard is available via API. Build your own reports. Trigger your own alerts.", code: "REST + WebSocket + Webhooks" },
];

export default function Vault88() {
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
    <div style={{ ...s.page, opacity: loaded ? 1 : 0, transition: "opacity 0.5s ease" }}>
      {/* Nav */}
      <nav style={s.nav}>
        <div style={s.logo}><div style={s.logoBlock} /> VAULT 88</div>
        <div style={s.navRight}>
          <span style={s.navLink}>Docs</span>
          <span style={s.navLink}>Integrations</span>
          <span style={s.navLink}>Pricing</span>
          <button style={s.navBtn}>Request Demo</button>
        </div>
      </nav>

      {/* Hero / Dashboard Preview */}
      <section style={s.hero}>
        <div style={s.heroTop}>
          <div>
            <h1 style={s.heroTitle}>Garage management that<br />doesn't waste your time.</h1>
            <div style={s.heroSub}>Real-time occupancy, revenue, and ops across your entire parking portfolio.</div>
          </div>
          <div style={s.liveTag}><div style={s.liveDot} /> LIVE DEMO DATA</div>
        </div>

        <div style={s.metricsGrid}>
          {metrics.map((m, i) => (
            <div key={i} style={s.metricCard}>
              <div style={s.metricLabel}>{m.label}</div>
              <div style={{ ...s.metricValue, color: m.color }}>{m.value}</div>
              <div style={s.metricChange(m.positive)}>{m.change}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Garage Table */}
      <section style={s.tableSection}>
        <div style={s.tableHeader}>
          <div style={s.tableTitle}>Facilities</div>
          <div style={s.tableFilter}>Filter: All Active</div>
        </div>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Facility</th>
              <th style={s.th}>ID</th>
              <th style={s.th}>Status</th>
              <th style={s.th}>Occupancy</th>
              <th style={s.th}>Revenue (MTD)</th>
            </tr>
          </thead>
          <tbody>
            {garages.map((g, i) => {
              const pct = Math.round((g.occupied / g.capacity) * 100);
              return (
                <tr key={i}>
                  <td style={s.td}>{g.name}</td>
                  <td style={{ ...s.td, ...s.tdMono, color: c.textMuted }}>{g.id}</td>
                  <td style={s.td}><span style={s.statusBadge(g.status)}>{g.status.toUpperCase()}</span></td>
                  <td style={s.td}>
                    <span style={{ ...s.tdMono, fontSize: "0.75rem" }}>{g.occupied}/{g.capacity} ({pct}%)</span>
                    <div style={s.occupancyBar}>
                      <div style={s.occupancyFill(pct)} />
                    </div>
                  </td>
                  <td style={{ ...s.td, ...s.tdMono }}>{g.revenue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Features */}
      <section style={s.featuresSection}>
        <div style={s.featuresGrid}>
          {feats.map((f, i) => (
            <div key={i} style={s.featureCell}>
              <div style={s.featureTitle}>{f.title}</div>
              <div style={s.featureDesc}>{f.desc}</div>
              <div style={s.featureCode}>{f.code}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={s.cta}>
        <div style={s.ctaTitle}>See your portfolio in one view.</div>
        <div style={s.ctaSub}>30-minute setup. No hardware changes. Cancel anytime.</div>
        <button style={s.ctaBtn}>Request a Demo →</button>
      </section>

      <footer style={s.footer}>
        <div style={s.footerText}>VAULT 88 · Parking Intelligence Platform · © 2026</div>
      </footer>
    </div>
  );
}