# AetherTrace Brand Identity — Locked
# AetherTrace Brand Identity — Locked

**Date locked:** March 24, 2026
**Last updated:** March 24, 2026 — Typography system refined, landing page locked

---

## Master Mark

The full wordmark with orbital ring IS the brand mark at all sizes. No separate icon or monogram.

- **Wordmark:** AETHERTRACE — Bebas Neue, all caps, letter-spacing 8px
- **Descriptor:** NEUTRAL EVIDENCE TRUSTEE — IBM Plex Mono 400, letter-spacing 5px, left-aligned starting under "AETHER" at x=218
- **Ring:** Single orbital ellipse — cx 520, cy 155, rx 440, ry 108, tilt −12°
  - Back half: `rgba(126,184,247,0.18)`, stroke-width 1.5, no filter
  - Front half: white gradient stroke, stroke-width 2, feGaussianBlur stdDeviation 4
  - Animation: `glow-breathe` 4s ease-in-out infinite
- **Custody node:** Mathematically positioned at 72° on tilted ellipse — cx 674, cy 227
- **ViewBox:** `-20 0 1100 330`
- **Source SVG:** `AETHERTRACE-mark.svg`

### Ring Gradient (userSpaceOnUse, x1=40 x2=1000)
```
0%   → #7EB8F7 opacity 0
8%   → #7EB8F7 opacity 0.40
28%  → #C8DCFF opacity 0.70
48%  → #FFFFFF opacity 0.95
52%  → #FFFFFF opacity 0.95
72%  → #C8DCFF opacity 0.70
92%  → #7EB8F7 opacity 0.40
100% → #7EB8F7 opacity 0
```

### Usage at Scale
- **Nav / Footer:** Same SVG technique, scaled via width/height attributes. Nav: width 200, height 32. Footer: width 220, height 36, dimmed to `--shi` (#B8D4EE).
- **Hero:** Full width, max-width 1000px
- **Standalone mark file:** `AETHERTRACE-mark.svg`

---

## Typography System

Three-font system. Each font has a defined role — never substituted.

| Font | Role | Used For |
|---|---|---|
| Bebas Neue | Display | Wordmark, number values only |
| Instrument Serif | Editorial | All headings (h1–h4), section statements, quotes, close CTA |
| IBM Plex Mono 300/400 | Operational | All body copy paragraphs |
| Inter 300/400 | Interface | Nav, buttons, labels, metadata, section eyes, step numbers |

### Sizing
- **Hero h1:** `clamp(22px, 3vw, 36px)` — Instrument Serif, italic em
- **Section h2:** `clamp(32px, 4vw, 52px)` — Instrument Serif, letter-spacing −0.02em
- **Section h3:** 17–18px — Instrument Serif
- **Section h4:** 16px — Instrument Serif
- **Body:** 11px, line-height 2 — IBM Plex Mono
- **Labels / eyes:** 9–10px, letter-spacing 0.2–0.22em — Inter, uppercase
- **Number vals:** 72px — Bebas Neue

### Italic usage
`em` tags throughout headings render as true Instrument Serif italic. This is intentional — not decorative. It marks the key claim in each section heading.

---

## Palette

| Token | Hex | Use |
|---|---|---|
| Void | #02050B | Page background |
| Navy | #06101E | Section/card surfaces |
| Navy2 | #081422 | Hover states |
| Rim | #163058 | Borders, dividers |
| Dim | #284870 | Muted elements |
| Slo | #486080 | Body text, ghost elements |
| Smid | #7AAAC8 | Emphasis in body copy |
| Shi | #B8D4EE | Secondary text, footer mark |
| Pure | #DCF0FF | Heading text |
| Glow | #7EB8F7 | Ring accent, section eyes |
| Cold | #B8D4FF | Ring gradient mid |
| Luminous | #FFFFFF | Wordmark, ring peak, primary headings |

---

## Landing Page — Design Decisions

**File:** `aethertrace-landing-final.html`
**Status:** Locked — March 24, 2026

### Sections (in order)
1. **Nav** — Fixed, backdrop blur 8px, Bebas Neue logo with inline SVG ring
2. **Hero** — Full viewport, master mark centered, Instrument Serif tagline, mono body, two CTAs
3. **The Governance Gap** — 3-cell problem grid
4. **The Role** — 2-col, "Not a tool. A trustee." + 4 principles
5. **Every Level** — 4-row stack: Subcontractor, Prime, Program Office, Auditor/IG
6. **How It Works** — 4-step grid: Designation → Ingestion → Sealed Custody → Access
7. **Numbers** — 3-cell: 70%, $84B, 2028
8. **Quote bar** — Navy bg, full-width Instrument Serif italic pull quote
9. **Close CTA** — "If evidence determines survival, custody is infrastructure."
10. **Footer** — Bebas Neue logo with inline SVG ring

### Key Copy Decisions
- Hero tagline: *"Evidence doesn't fail because it doesn't exist. It fails because nobody neutral was holding it."*
- CTA language: "Designate AetherTrace" — not "Get Started" or "Sign Up"
- Close: "Validation, not capital. First conversation is a question — not a pitch."
- Quote: *"Whoever has the documentation writes the narrative. If they have records and you don't, you have no defense against their claim — whether it's accurate or not."*

### Numbers (from VIGIL report)
- **70%** — construction disputes caused by documentation failure
- **$84B** — disputed sums across 2,002 projects (2024), ~$42M average
- **2028** — DoD clean audit deadline, already slipping to FY2031

### Scroll Reveal
IntersectionObserver, threshold 0.05, rootMargin `0px 0px -20px 0px`. All `.reveal` elements animate from `opacity:0 translateY(20px)` to visible on scroll.

---

## Source Files
- `AETHERTRACE-mark.svg` — Production master mark SVG
- `aethertrace-brand-locked.html` — Brand identity system document
- `aethertrace-landing-final.html` — Locked landing page
