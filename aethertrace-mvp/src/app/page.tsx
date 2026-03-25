/**
 * Landing Page — AetherTrace
 * PRISM design — Neutral Evidence Trustee
 * Converted from aethertrace-landing-final_6.html
 */

import Link from 'next/link'
import { ScrollReveal } from '@/components/scroll-reveal'

export default function HomePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#02050B', position: 'relative', zIndex: 1 }}>
      <ScrollReveal />
      <LandingNav />
      <Hero />
      <ProblemSection />
      <RoleSection />
      <LevelsSection />
      <HowSection />
      <NumbersSection />
      <QuoteSection />
      <CloseSection />
      <LandingFooter />
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════════════ */

function LandingNav() {
  return (
    <nav className="landing-nav">
      <a href="#" style={{ textDecoration: 'none', display: 'block', lineHeight: 0 }}>
        <NavRingSvg width={200} height={32} />
      </a>
      <ul className="landing-nav-links">
        <li><a href="#role">The Role</a></li>
        <li><a href="#levels">Who It Serves</a></li>
        <li><a href="#how">How It Works</a></li>
      </ul>
      <Link href="/signup" className="landing-nav-cta">Designate AetherTrace</Link>
    </nav>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HERO
   ═══════════════════════════════════════════════════════════════ */

function Hero() {
  return (
    <section className="landing-hero">
      {/* The locked mark */}
      <div className="hero-mark">
        <svg
          width="100%"
          viewBox="-20 0 1080 380"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ overflow: 'visible' }}
        >
          <defs>
            <filter id="fHg" x="-10%" y="-50%" width="120%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fHNode" x="-300%" y="-300%" width="700%" height="700%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="gHr" x1="40" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="rgba(126,184,247,0)" />
              <stop offset="8%" stopColor="rgba(126,184,247,0.4)" />
              <stop offset="28%" stopColor="rgba(200,220,255,0.7)" />
              <stop offset="48%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="52%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="72%" stopColor="rgba(200,220,255,0.7)" />
              <stop offset="92%" stopColor="rgba(126,184,247,0.4)" />
              <stop offset="100%" stopColor="rgba(126,184,247,0)" />
            </linearGradient>
            <clipPath id="cpHf"><rect x="-20" y="155" width="1080" height="225" /></clipPath>
            <clipPath id="cpHb"><rect x="-20" y="0" width="1080" height="155" /></clipPath>
          </defs>

          {/* Subtitle */}
          <text
            x="218" y="222" textAnchor="start"
            fontFamily="IBM Plex Mono" fontSize="10" letterSpacing="5"
            fill="rgba(90,120,160,0.58)"
          >NEUTRAL EVIDENCE TRUSTEE</text>

          {/* Wordmark */}
          <text
            x="520" y="200" textAnchor="middle"
            fontFamily="'Bebas Neue', sans-serif"
            fontSize="118" letterSpacing="8"
            fill="#FFFFFF"
            style={{ filter: 'drop-shadow(0 0 30px rgba(200,220,255,0.08))' }}
          >AETHERTRACE</text>

          {/* Ring back */}
          <ellipse
            cx="520" cy="155" rx="440" ry="108"
            stroke="rgba(126,184,247,0.18)" strokeWidth="1.5" fill="none"
            transform="rotate(-12 520 155)" clipPath="url(#cpHb)"
          />

          {/* Ring front */}
          <ellipse
            cx="520" cy="155" rx="440" ry="108"
            stroke="url(#gHr)" strokeWidth="2" fill="none"
            transform="rotate(-12 520 155)"
            clipPath="url(#cpHf)"
            filter="url(#fHg)"
            style={{ animation: 'glow-breathe 4s ease-in-out infinite' }}
          />

          {/* Custody node — t≈72° on tilted ellipse */}
          <circle cx="674" cy="227" r="20" fill="#7EB8F7" filter="url(#fHNode)" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
          <circle cx="674" cy="227" r="5" fill="#7EB8F7" />
        </svg>
      </div>

      <div className="hero-tagline">
        <h1><em>Neutral Evidence Trustee</em> for High-Stakes Operations.</h1>
      </div>

      <div className="hero-body">
        <p>Evidence doesn&apos;t fail because it doesn&apos;t exist.</p>
        <p>It fails because nobody neutral was holding it.</p>
      </div>

      <div className="hero-actions">
        <Link href="/signup" className="landing-btn-primary">Designate AetherTrace</Link>
        <a href="#role" className="landing-btn-ghost">What is a trustee</a>
      </div>

      <div className="hero-scroll">
        <div className="scroll-line" />
        <div className="scroll-text">Scroll</div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   THE PROBLEM
   ═══════════════════════════════════════════════════════════════ */

function ProblemSection() {
  return (
    <section className="landing-section" id="problem" style={{ borderTop: '1px solid rgba(22,48,88,0.2)' }}>
      <div className="section-eye reveal">The Governance Gap</div>

      <div className="problem-statement reveal d1">
        Evidence is mandatory<br />
        in high-risk programs.<br />
        <em>Neutral custody is not.</em>
      </div>

      <div className="problem-grid">
        <div className="problem-cell reveal">
          <div className="problem-cell-num">01 &middot; The Gap</div>
          <h3>Everyone holds evidence. Nobody is neutral.</h3>
          <p>Vendors operate inside operator control boundaries. Operators have outcomes at stake. Auditors arrive after the fact. <strong>There is no designated neutral party</strong> before the dispute opens.</p>
        </div>
        <div className="problem-cell reveal d1">
          <div className="problem-cell-num">02 &middot; The Cost</div>
          <h3>Reconstruction is becoming unacceptable.</h3>
          <p>Oversight bodies increasingly discount evidence assembled after a dispute begins. <strong>The era of fix it later is ending.</strong> Post-hoc assembly is slow, expensive, and challenged at every turn.</p>
        </div>
        <div className="problem-cell reveal d2">
          <div className="problem-cell-num">03 &middot; The Exposure</div>
          <h3>Subcontractors carry the most risk with the least protection.</h3>
          <p>Obligations flow down the hierarchy. <strong>Protection doesn&apos;t.</strong> The party who generates the evidence is the last party to control what happens to it when the dispute opens.</p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   THE ROLE
   ═══════════════════════════════════════════════════════════════ */

function RoleSection() {
  return (
    <section className="landing-section" id="role" style={{ borderTop: '1px solid rgba(22,48,88,0.2)' }}>
      <div className="section-eye reveal">The Role</div>

      <div className="role-grid">
        <div className="role-left reveal">
          <h2>Not a tool.<br /><em>A trustee.</em></h2>
          <p>A trustee holds something on behalf of all parties. A trustee has a duty. A trustee cannot be adverse to any beneficiary.</p>
          <p>You cannot buy software to solve a conflict of interest. Neutrality is a governance property — not a feature. As long as the operator holds the keys, the evidence is suspect.</p>
          <p>AetherTrace solves custody, not outcomes.</p>
        </div>
        <div className="reveal d1">
          <div className="role-principles">
            <Principle num="01" title="Designated Ex-Ante" body="AetherTrace is designated before execution begins. The acceptance boundary is defined before any work occurs — not after a dispute opens." />
            <Principle num="02" title="The Black Box Philosophy" body="We hold evidence without analyzing, certifying, or judging. We preserve presence, absence, and silence. Evidence remains credible even when all parties disagree." />
            <Principle num="03" title="Separated Authority" body="Custody, access, and interpretation are held by different parties. AetherTrace holds the record. Others decide outcomes. Trust the architecture — not the people." />
            <Principle num="04" title="No Retroactive Creation" body="Append-only. Time-indexed. Sealed at submission. No silent rewrite. No optimization. What was submitted is what is held." />
          </div>
        </div>
      </div>
    </section>
  )
}

function Principle({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <div className="principle">
      <div className="principle-num">{num}</div>
      <div>
        <h4>{title}</h4>
        <p>{body}</p>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   EVERY LEVEL
   ═══════════════════════════════════════════════════════════════ */

function LevelsSection() {
  return (
    <section className="landing-section" id="levels" style={{ borderTop: '1px solid rgba(22,48,88,0.2)', paddingBottom: 0 }}>
      <div className="section-eye reveal">Every Level of the Hierarchy</div>

      <div className="levels-head">
        <h2 className="reveal">Same trustee.<br /><em>Every party.</em><br />One record.</h2>
        <p className="reveal d1">The subcontractor sealing a daily log and the program office designating custody before a $500M operation are using the same product. The same neutrality. The same protection.</p>
      </div>

      <div className="levels-stack">
        <LevelRow
          role="Beachhead"
          name="Subcontractor"
          pain={<>You did the work. Your records are in the prime&apos;s system. When the dispute opens you&apos;re the last party with access to your own evidence — and <strong>the first party blamed for missing documentation.</strong></>}
          promise="&ldquo;Your evidence doesn&rsquo;t live in someone else&rsquo;s system anymore. Sealed the day you submitted it. Independent of everyone above you.&rdquo;"
          className="reveal"
        />
        <LevelRow
          role="Prime Contractor"
          name="Program Lead"
          pain={<>When a subcontractor dispute opens, your program evidence gets pulled in. <strong>Fragmented records across your supply chain become your audit risk</strong> — not just theirs.</>}
          promise="&ldquo;When your subcontractors&rsquo; records are sealed independently, your program evidence is stronger. Independent custody protects the whole chain.&rdquo;"
          className="reveal d1"
        />
        <LevelRow
          role="Federal"
          name="Program Office"
          pain={<>$1B+ in annual DoD audit remediation. Evidence assembled ex-post. IG and GAO scrutiny increasing. <strong>The era of reconstructing records after the dispute is ending.</strong></>}
          promise="&ldquo;Designated before execution. Neutral to all parties. When the audit arrives, the record is already there — sealed since T=0.&rdquo;"
          className="reveal d2"
        />
        <LevelRow
          role="Oversight"
          name="Auditor / IG"
          pain={<>Evidence held by interested parties. Records reconstructed after the fact. <strong>Audit findings weakened by chain-of-custody questions</strong> that should have been resolved before the program began.</>}
          promise="&ldquo;Evidence held by an independent trustee since T=0. No reconstruction. No interested parties. Just the record — exactly as it was submitted.&rdquo;"
          className="reveal d3"
        />
      </div>
    </section>
  )
}

function LevelRow({ role, name, pain, promise, className }: {
  role: string; name: string; pain: React.ReactNode; promise: string; className: string
}) {
  return (
    <div className={`level-row ${className}`}>
      <div className="level-id">
        <div className="level-role">{role}</div>
        <div className="level-name">{name}</div>
      </div>
      <div className="level-pain">
        <p>{pain}</p>
      </div>
      <div className="level-promise">
        <p dangerouslySetInnerHTML={{ __html: promise }} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════════════════════════ */

function HowSection() {
  return (
    <section className="landing-section" id="how" style={{ borderTop: '1px solid rgba(22,48,88,0.2)' }}>
      <div className="section-eye reveal">Custody as a System</div>

      <div className="how-head reveal">
        <h2>Simple to submit.<br />Impossible to compromise.</h2>
        <p>Four steps. No new workflows. No behavior change required. The evidence you already generate — sealed independently, available when authority asks.</p>
      </div>

      <div className="how-steps">
        <div className="how-step reveal">
          <div className="how-step-num">Step 01 &middot; Designation</div>
          <h3>Define the boundary before work begins.</h3>
          <p>AetherTrace is designated before execution. An acceptance boundary defines what counts as evidence. All parties know who holds the record before day one.</p>
        </div>
        <div className="how-step reveal d1">
          <div className="how-step-num">Step 02 &middot; Ingestion</div>
          <h3>Submit what you already report.</h3>
          <p>Daily logs. Photo evidence. Inspection records. Whatever you already generate. Type it in plain language, attach files, hit Seal. Append-only, cryptographically sealed at submission.</p>
        </div>
        <div className="how-step reveal d2">
          <div className="how-step-num">Step 03 &middot; Sealed Custody</div>
          <h3>The black box holds it. Nobody touches it.</h3>
          <p>No interpretation. No optimization. No silent rewrite. Time-indexed, access-controlled, held under separated authority. The record is what it is.</p>
        </div>
        <div className="how-step reveal d3">
          <div className="how-step-num">Step 04 &middot; Access</div>
          <h3>Retrieved under audit authority. Not before.</h3>
          <p>Authorized parties retrieve evidence under defined access authority. AI-assisted reconstruction for rapid export. No inference. No interpretation. The record speaks for itself.</p>
        </div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   NUMBERS
   ═══════════════════════════════════════════════════════════════ */

function NumbersSection() {
  return (
    <div className="numbers reveal">
      <div className="number-cell">
        <div className="number-val">70%</div>
        <div className="number-label">
          <strong>Of disputes caused by documentation failure</strong>
          <span>Not bad contracts. Not underbidding. The evidence was absent, incomplete, or held by the opposing party. The record determined the outcome — not the work.</span>
        </div>
      </div>
      <div className="number-cell">
        <div className="number-val">$84B</div>
        <div className="number-label">
          <strong>In disputed sums across 2,002 projects in 2024</strong>
          <span>~$42M average per project. A 2024 court ruling reversed damages entirely because there was no testimony to establish the amount. The work was done. The evidence wasn&apos;t held.</span>
        </div>
      </div>
      <div className="number-cell">
        <div className="number-val">2028</div>
        <div className="number-label">
          <strong>DoD clean audit deadline — already slipping</strong>
          <span>December 31, 2028 is the mandate. FM Systems has already pushed to FY2031. Congressional action is imminent if missed. The era of reconstructing records after the fact is ending.</span>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   QUOTE
   ═══════════════════════════════════════════════════════════════ */

function QuoteSection() {
  return (
    <div className="landing-quote">
      <div className="reveal" style={{ maxWidth: 800 }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 'clamp(20px, 2.8vw, 32px)',
          fontWeight: 400, fontStyle: 'italic',
          color: '#DCF0FF', lineHeight: 1.4,
          letterSpacing: '-0.01em', marginBottom: 24,
        }}>
          &ldquo;Whoever has the documentation writes the narrative. If they have records and you don&apos;t, you have no defense against their claim — whether it&apos;s accurate or not.&rdquo;
        </div>
        <div style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9, letterSpacing: '0.2em',
          textTransform: 'uppercase' as const, color: '#486080',
        }}>
          Industry Source &middot; Construction Dispute Analysis
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   CLOSE CTA
   ═══════════════════════════════════════════════════════════════ */

function CloseSection() {
  return (
    <section className="landing-close" id="designate">
      <div className="section-eye reveal">Designate AetherTrace</div>
      <h2 className="reveal">If evidence determines survival,<br /><em>custody is infrastructure.</em></h2>
      <p className="reveal d1">The record you need is the record you sealed before the dispute opened. Designation takes one conversation.</p>
      <div className="reveal d2">
        <a href="mailto:contact@aethertrace.io" className="landing-btn-primary">Request a Conversation</a>
        <div className="close-note">Validation, not capital. First conversation is a question — not a pitch.</div>
      </div>
    </section>
  )
}

/* ═══════════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════════ */

function LandingFooter() {
  return (
    <footer className="landing-footer">
      <a href="#" style={{ textDecoration: 'none', display: 'block', lineHeight: 0 }}>
        <FooterRingSvg />
      </a>
      <div className="footer-right">
        <div className="footer-tag">Neutral Evidence Trustee &middot; High-Stakes Operations</div>
        <div className="footer-tag" style={{ color: 'rgba(22,48,88,0.5)' }}>Confidential &middot; Category Validation &middot; 2026</div>
      </div>
    </footer>
  )
}

/* ═══════════════════════════════════════════════════════════════
   SHARED SVG COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function NavRingSvg({ width, height }: { width: number; height: number }) {
  return (
    <svg
      width={width} height={height}
      viewBox="-20 0 1100 330" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id="fNav" x="-12%" y="-80%" width="124%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="fNavNode" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="gNav" x1="40" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7EB8F7" stopOpacity="0" />
          <stop offset="8%" stopColor="#7EB8F7" stopOpacity="0.40" />
          <stop offset="28%" stopColor="#C8DCFF" stopOpacity="0.70" />
          <stop offset="48%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="52%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="72%" stopColor="#C8DCFF" stopOpacity="0.70" />
          <stop offset="92%" stopColor="#7EB8F7" stopOpacity="0.40" />
          <stop offset="100%" stopColor="#7EB8F7" stopOpacity="0" />
        </linearGradient>
        <clipPath id="cpNavF"><rect x="-30" y="155" width="1140" height="200" /></clipPath>
        <clipPath id="cpNavB"><rect x="-30" y="-10" width="1140" height="165" /></clipPath>
      </defs>
      <ellipse
        cx="520" cy="155" rx="440" ry="108"
        stroke="rgba(126,184,247,0.18)" strokeWidth="1.5" fill="none"
        transform="rotate(-12 520 155)" clipPath="url(#cpNavB)"
      />
      <text
        x="520" y="202" textAnchor="middle"
        fontFamily="'Bebas Neue', sans-serif"
        fontSize="118" letterSpacing="8" fill="#FFFFFF"
      >AETHERTRACE</text>
      <ellipse
        cx="520" cy="155" rx="440" ry="108"
        stroke="url(#gNav)" strokeWidth="2" fill="none"
        transform="rotate(-12 520 155)"
        clipPath="url(#cpNavF)"
        filter="url(#fNav)"
      />
      <circle cx="674" cy="227" r="18" fill="#7EB8F7" opacity="0.22" filter="url(#fNavNode)" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
      <circle cx="674" cy="227" r="4.5" fill="#7EB8F7" />
    </svg>
  )
}

function FooterRingSvg() {
  return (
    <svg
      width="220" height="36"
      viewBox="-20 0 1100 330" fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block' }}
    >
      <defs>
        <filter id="fFtr" x="-12%" y="-80%" width="124%" height="260%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="fFtrNode" x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <linearGradient id="gFtr" x1="40" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7EB8F7" stopOpacity="0" />
          <stop offset="8%" stopColor="#7EB8F7" stopOpacity="0.30" />
          <stop offset="28%" stopColor="#C8DCFF" stopOpacity="0.55" />
          <stop offset="48%" stopColor="#B8D4EE" stopOpacity="0.80" />
          <stop offset="52%" stopColor="#B8D4EE" stopOpacity="0.80" />
          <stop offset="72%" stopColor="#C8DCFF" stopOpacity="0.55" />
          <stop offset="92%" stopColor="#7EB8F7" stopOpacity="0.30" />
          <stop offset="100%" stopColor="#7EB8F7" stopOpacity="0" />
        </linearGradient>
        <clipPath id="cpFtrF"><rect x="-30" y="155" width="1140" height="200" /></clipPath>
        <clipPath id="cpFtrB"><rect x="-30" y="-10" width="1140" height="165" /></clipPath>
      </defs>
      <ellipse
        cx="520" cy="155" rx="440" ry="108"
        stroke="rgba(126,184,247,0.10)" strokeWidth="1.5" fill="none"
        transform="rotate(-12 520 155)" clipPath="url(#cpFtrB)"
      />
      <text
        x="520" y="202" textAnchor="middle"
        fontFamily="'Bebas Neue', sans-serif"
        fontSize="118" letterSpacing="8" fill="#B8D4EE"
      >AETHERTRACE</text>
      <ellipse
        cx="520" cy="155" rx="440" ry="108"
        stroke="url(#gFtr)" strokeWidth="2" fill="none"
        transform="rotate(-12 520 155)"
        clipPath="url(#cpFtrF)"
        filter="url(#fFtr)"
      />
      <circle cx="674" cy="227" r="16" fill="#7EB8F7" opacity="0.15" filter="url(#fFtrNode)" style={{ animation: 'nodePulse 4s ease-in-out infinite' }} />
      <circle cx="674" cy="227" r="4" fill="#7EB8F7" opacity="0.7" />
    </svg>
  )
}
