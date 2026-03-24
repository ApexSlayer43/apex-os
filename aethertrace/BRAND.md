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

---

## Dashboard — Design Locked

**Date locked:** March 24, 2026
**File:** `aethertrace-mvp/src/app/dashboard/page.tsx` + `layout.tsx` (to be rebuilt)

### Layout
- No sidebar. Full width. Single column. Sticky nav 64px. Content padding `80px 52px 120px`.
- Background: `#02050B` (Void) everywhere.

### Nav — 64px, sticky, `rgba(2,5,11,0.96)`, `backdrop-filter: blur(12px)`, border-bottom `1px solid rgba(22,48,88,0.3)`
- **Left:** Full master mark as inline SVG — same ring technique as landing page. `width=180 height=28`, viewBox `-20 0 1100 330`. Includes custody node (cx 674, cy 227). Ring glows on front half.
- **Right:** User email — IBM Plex Mono 10px `#284870`. Sign out — Inter 10px, letter-spacing 0.14em, uppercase, `#284870`, hover `#7EB8F7`.

### Command Header
- Eye label: Inter 9px, letter-spacing 0.28em, uppercase, `#7EB8F7`. Line before it: `24px × 1px`, `#7EB8F7`, glow `box-shadow: 0 0 6px rgba(126,184,247,0.6)`.
- Workspace name: Instrument Serif 40px, `#DCF0FF`, letter-spacing -0.02em, line-height 1.1.
- Subscription status: IBM Plex Mono 10px, `#486080`, letter-spacing 0.1em. e.g. `"PROFESSIONAL · ACTIVE"`.
- **New project input (top right):** Instrument Serif 18px, `#B8D4EE`, borderless except bottom border `1px solid rgba(22,48,88,0.5)`. Focus: border-bottom `#7EB8F7`, color `#DCF0FF`, caret `#7EB8F7`. Placeholder: italic, `#284870`. Width 220px. Hint below: IBM Plex Mono 8px, `#284870`, uppercase — `"Press ↵ Enter to create"`.

### Stats Strip — 3 cells
- Container: `display:grid; grid-template-columns:repeat(3,1fr); gap:1px; background:rgba(22,48,88,0.22); border:1px solid rgba(22,48,88,0.28)`. Margin-bottom 64px.
- Each cell: `background:#06101E; padding:40px 44px`.
- Label: Inter 9px, letter-spacing 0.22em, uppercase, `#486080`. Margin-bottom 16px.
- Value (numeric): Bebas Neue 56px, `#FFFFFF`, letter-spacing 1px.
- Value (Custody Status): Instrument Serif 34px. `#10B981` if active, `#F59E0B` if inactive. Only time these colors appear.
- Sub: IBM Plex Mono 9px, `#284870`, letter-spacing 0.08em.

### Project List
- Container: `gap:1px; background:rgba(22,48,88,0.15)`. Margin-top 12px.
- Section label above: Inter 9px, letter-spacing 0.24em, uppercase, `#486080`.

#### Project Row — 80px tall
- `padding: 0 52px`. `background: #06101E`. `border-left: 2px solid transparent`.
- Hover: `background: #081422`, `border-left-color: #7EB8F7`, `box-shadow: -3px 0 16px rgba(126,184,247,0.14)`.
- Archived rows: `opacity: 0.5`.
- **Left:** folder icon 15×13px `#7AAAC8` (archived: `#486080`). Project name: Inter 14px weight 500 `#B8D4EE`, letter-spacing -0.01em. Date below: IBM Plex Mono 9px `#284870`.
- **Right (flex, gap 36px):** Items sealed count — IBM Plex Mono 14px `#7AAAC8`, label 8px uppercase `#284870`. Last sealed time — IBM Plex Mono 10px `#486080`, min-width 90px. Status badge. Chevron 12px `#163058` → hover `#486080`.
- **Active badge:** `background:rgba(16,185,129,0.06); border:1px solid rgba(16,185,129,0.16); color:#10B981`. IBM Plex Mono 8px, letter-spacing 0.14em, uppercase.
- **Archived badge:** `background:rgba(22,48,88,0.3); border:1px solid rgba(22,48,88,0.5); color:#486080`.

#### Inline Create Row — docked below project list
- `height:80px; padding:0 52px; background:#04090F; border-left:2px solid rgba(126,184,247,0.12); border-top:1px dashed rgba(22,48,88,0.3); display:flex; align-items:center; gap:20px`.
- Folder icon: `#7EB8F7`, opacity 0.14.
- Input: Instrument Serif 14px, `#7AAAC8`, borderless, transparent bg, caret `#7EB8F7`. Focus: `#B8D4EE`. Placeholder: italic `#163058` — `"Name new project…"`. Flex 1.
- Hint right: IBM Plex Mono 8px, letter-spacing 0.14em, uppercase, `#163058` — `"↵ to seal"`.
- On Enter: submit project name, clear input.

### Spacing
- Page padding: `80px 52px 120px`
- Header → stats: 64px
- Stats → projects label: 64px
- Between sections: 48px
