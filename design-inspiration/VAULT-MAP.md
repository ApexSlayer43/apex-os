# AetherTrace Design Vault — Component Map
**Last updated:** March 23, 2026
**Vault location:** `Aethertrace/design-inspiration/components/`
**Total components cataloged:** 16 (001–016)

---

## How to Use This Map

When starting any AetherTrace UI page or feature, look it up here first.
Each component has a **USE STATUS** and a **SPECIFIC ADAPTATION** note.
Before writing any UI code, read the `-code.tsx` file for the mapped component.
The code is annotated — every architectural decision is explained inline.

---

## AetherTrace MVP Page Map

### LANDING PAGE (Marketing)

| Section | Component | File | Key Pattern |
|---|---|---|---|
| **Hero — primary candidate** | 015 WebGL Chromatic Shader + Liquid Glass Button | `015-webgl-chromatic-shader-code.tsx` | Full-screen shader BG + glass CTA. Chromatic aberration = data integrity visual |
| **Hero — alternate** | 010 Hero Odyssey | `010-hero-odyssey-code.tsx` | WebGL lightning + ElasticHueSlider. More interactive, color-controllable |
| **Hero — alternate** | 008 Horizon Hero | `008-horizon-hero-code.tsx` | Cinematic scroll-triggered reveal. Strong for authority/gravitas |
| **Features section** | 016 Features Bento Grid | `016-features-bento-grid-code.tsx` | 6-col bento, 5 cards. Map to: 100% Immutable / Tamper-Evident / Chain Speed / Defense-Grade / Multi-Party |
| **Background texture** | 011 Warp Background | `011-warp-background-code.tsx` | 3D CSS planes + animated beams. Use behind features or pricing section |
| **Background texture** | 009 Mesh Gradient Hero | `009-mesh-gradient-hero-code.tsx` | Subtle animated mesh. Safe for any section needing depth without distraction |
| **Social proof / "Who trusts the chain"** | 013 Logo Carousel | `013-logo-carousel-code.tsx` | Rotating logo grid. Swap brand logos → agency names, contractor logos, DoD seals |
| **3D accent / trust object** | 002 COBE Globe | `002-cobe-globe-code.tsx` | Interactive globe. Use to suggest global/federal infrastructure reach |
| **Scroll storytelling** | 004 Scroll Expansion Hero | `004-scroll-expansion-hero-code.tsx` | Full-screen scroll-locked expansion. Use for "How It Works" narrative section |

---

### APP PAGES (Authenticated)

| Page | Component | File | Specific Use |
|---|---|---|---|
| **Dashboard — project list background** | 009 Mesh Gradient Hero | `009-mesh-gradient-hero-code.tsx` | Subtle animated background for the main dashboard shell |
| **Evidence Capture — input interface** | 012 Claude-Style AI Input | `012-claude-style-ai-input-code.tsx` | File upload + note input tray. Rename model selector → chain type. Add hash-in-progress state |
| **Evidence Archive — browse sealed packages** | 014 Shareholder Reports Carousel | `014-shareholder-reports-carousel-code.tsx` | Horizontal scroll card gallery. Each card = one sealed custody package with SEALED/VERIFIED badge |
| **Sealing State — full-screen loading** | 011 Warp Background | `011-warp-background-code.tsx` | Full-screen warp during hash computation. Drive `distortion` uniform low→high→settle via JS |
| **Sealing State — hero overlay** | 015 WebGL Chromatic Shader | `015-webgl-chromatic-shader-code.tsx` | Animate `distortion` uniform: high (active) → 0.005 (settled). Channels converging = sealed |

---

### PUBLIC VERIFICATION PAGE (Unauthenticated)

| Section | Component | File | Use |
|---|---|---|---|
| **Background** | 015 WebGL Chromatic Shader | `015-webgl-chromatic-shader-code.tsx` | Low distortion (0.01), slow animation — calm/authoritative. This page must feel institutional |
| **Result card / CTA** | 015 Liquid Glass Button | `015-webgl-chromatic-shader-code.tsx` | "Package Verified ✓" as a glass card sitting on the shader. Visual: the chain is transparent |

---

### PRICING / CHECKOUT

| Section | Component | File | Use |
|---|---|---|---|
| **Section background** | 011 Warp Background | `011-warp-background-code.tsx` | Use the `tamper-alert` variant (amber beams) for urgency on the "no free tier" pricing page |
| **CTA button** | 015 Liquid Glass Button | `015-webgl-chromatic-shader-code.tsx` | "Start Chain" / "Seal Your First Project" — glass button on dark background |

---

## Component Status Board

| # | Component | AetherTrace Page | Priority | Notes |
|---|---|---|---|---|
| 001 | Hero Futuristic | Not mapped | LOW | Superseded by 008/010/015 for AetherTrace tone |
| 002 | COBE Globe | Landing — global reach | MED | Good for "infrastructure, not SaaS" framing |
| 003 | Hero ASCII | Not mapped | LOW | Too playful for AetherTrace's institutional tone |
| 004 | Scroll Expansion Hero | Landing — How It Works | MED | Scroll-locked narrative section for protocol explanation |
| 005 | Animated Hero | Not mapped | LOW | Generic; replaced by more specific options |
| 006 | Spline Scene | Landing — 3D accent | MED | If a 3D custody chain object is designed in Spline |
| 007 | Hero Section 5 | Not mapped | LOW | Covered by stronger options |
| 008 | Horizon Hero | Landing — alternate hero | HIGH | Strongest non-shader option. Cinematic scroll + reveal |
| 009 | Mesh Gradient Hero | Dashboard background | HIGH | Subtle animation, doesn't compete with data |
| 010 | Hero Odyssey | Landing — alt hero | HIGH | Interactive hue slider = user agency. Lightning = chain energy |
| 011 | Warp Background | Sealing state + Pricing | HIGH | The "something is happening" visual. 3 variants ready |
| 012 | AI Input | Evidence capture | **CRITICAL** | Direct MVP use. Rename, retheme, deploy as-is |
| 013 | Logo Carousel | Landing — social proof | MED | Needs real logos. Placeholder: ASA, ABC, DoD logos |
| 014 | Reports Carousel | Evidence archive | HIGH | Direct MVP use. Card = custody package |
| 015 | WebGL Shader + Liquid Glass | Landing hero + Verify page | **CRITICAL** | The AetherTrace signature visual |
| 016 | Features Bento Grid | Landing — features | HIGH | 5 AetherTrace value props, adapted copy ready |

---

## Build Priority Order

Based on MVP scope (Weeks 1–6) from CLAUDE.md:

**Week 1–2: Core app shell**
1. Evidence capture page → pull `012` (AI Input)
2. Dashboard shell → pull `009` (Mesh Gradient) for background

**Week 2–3: Landing page**
3. Hero → pull `015` (Shader + Liquid Glass)
4. Features → pull `016` (Bento Grid)
5. Social proof → pull `013` (Logo Carousel)

**Week 3–4: Evidence archive**
6. Custody package browser → pull `014` (Reports Carousel)

**Week 4–5: Sealing + verification states**
7. Sealing state UI → pull `011` (Warp Background)
8. Public verify page → pull `015` (Shader, low distortion variant)

**Week 5–6: Pricing + polish**
9. Pricing section → pull `011` (Warp, amber variant)
10. CTA buttons site-wide → pull `015` (Liquid Glass Button)

---

## Quick Reference: "What component do I need?"

| If you're building... | Use component |
|---|---|
| A full-screen animated hero background | 015 or 010 |
| Something that communicates "data is being processed" | 011 |
| A file/evidence upload input | 012 |
| A browsable card gallery of past documents | 014 |
| A 5-feature section with illustrations | 016 |
| A social proof logo strip | 013 |
| A subtle background for app pages | 009 |
| A dramatic scroll-reveal section | 004 or 008 |
| A glass/transparent interactive button | 015 (LiquidButton) |
| A public verification result display | 015 (shader, low distortion) |
