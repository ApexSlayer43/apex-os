# 003 — Hero ASCII (Vitruvian Man / Technical HUD)

**Source:** 21st.dev
**Type:** Hero section / Full-screen immersive dark
**Stack:** React, Tailwind CSS, TypeScript, UnicornStudio (external canvas service)
**Dependencies:** UnicornStudio CDN script (runtime-loaded)

## What Makes This Hit

### Visual Impact
- **ASCII/dot-matrix Vitruvian Man** — Da Vinci's Vitruvian Man rendered as a dot-matrix / ASCII art canvas animation on pure black. The combination of classical anatomy reference + digital rendering = instant "we take craft seriously" signal.
- **Pure black + white only** — zero color. The restraint IS the design. No gradients, no accent colors. Just white elements on black at varying opacities (0.2 to 1.0). This is harder to pull off than color and reads as more sophisticated.
- **Layered depth through opacity** — corner frames at 0.3, decorative dots at 0.4, body text at 0.8, title at 1.0. Creates visual hierarchy purely through transparency, no size tricks needed.
- **Corner frame accents** — L-shaped border fragments in all four corners of the viewport. Military/technical HUD aesthetic. Says "this is a system, not a website."
- **Dither pattern** — CSS `repeating-linear-gradient` creating a crosshatch/halftone texture on a 3px grid. Bridges the gap between the digital canvas animation and the CSS UI layer.

### Typography & Content
- **100% monospace** — every single text element uses `font-mono`. No serif, no sans-serif anywhere. This is a bold commitment that creates absolute visual consistency.
- **All-caps with wide tracking** — title at `letter-spacing: 0.1em`, `tracking-wider` throughout. The spacing makes monospace feel designed, not default.
- **Technical notation as decoration** — "LAT: 37.7749° • LONG: 122.4194°" coordinates in the header, "SISYPHUS.PROTOCOL" in the footer, "SYSTEM.ACTIVE", "V1.0.0", "◐ RENDERING", "FRAME: ∞". None of this is functional. All of it builds atmosphere.
- **Infinity symbol (∞) as motif** — used as decorative separator in the rule line above the title, in the footer notation, and in the "FRAME: ∞" status. Ties to the "Endless Pursuit" / Sisyphus theme.
- **Decorative dot array** — 40 tiny (0.5px) white dots in a row between title and body. Minimal, textural, technical.

### Interaction Design
- **Button hover: corner accent reveal** — on hover, small L-shaped border fragments appear at -top-1/-left-1 and -bottom-1/-right-1 of the primary CTA. Subtle, precise, technical. `opacity-0 → opacity-100` with `group-hover`.
- **Button hover: invert** — both CTAs invert from transparent/white-border to white-bg/black-text on hover. Clean binary state change.
- **Pulsing status dots** — three dots in the footer with staggered `animation-delay` (0s, 0.2s, 0.4s) and decreasing opacity (0.6, 0.4, 0.2). Reads as "system alive."

### Technical Techniques
- **UnicornStudio integration** — external canvas animation service loaded via dynamic `<script>` injection. The `data-us-project="OMzqyUv6M3kSnv0JeAtC"` attribute targets a specific UnicornStudio project. This is NOT self-hosted animation — it's a SaaS canvas renderer.
- **Canvas clip-path cropping** — `clip-path: inset(0 0 10% 0)` crops the bottom 10% of the canvas to hide branding watermark. Practical technique for using external canvas services.
- **Branding removal system** — aggressive DOM mutation observer pattern that runs every 50ms to find and remove UnicornStudio branding elements. Targets by text content, title attributes, href attributes, and class names. Includes CSS fallbacks for display:none, visibility:hidden, opacity:0, and position offscreen.
- **Mobile-responsive content hiding** — heavy use of `hidden lg:block` to strip desktop-only decorative elements on mobile (coordinates, dot arrays, corner accents, status bars, dither patterns). Mobile gets a simplified version.
- **CSS star field for mobile** — when UnicornStudio canvas is hidden on mobile, a `stars-bg` class creates a static starfield using 8 layered `radial-gradient` dots at different positions and sizes. Lightweight fallback that maintains the dark/technical mood.
- **Style injection via useEffect** — both the script and CSS are dynamically created and appended to `<head>`, with cleanup on unmount. Pattern for integrating external services without polluting global styles.
- **Footer positioned at `bottom: 5vh`** — not fixed to viewport bottom, offset by 5vh. The corner frame accents match this offset. Creates a "framed viewport" effect where content lives inside an implied border.

### Layout Architecture
- **Split layout** — canvas animation occupies left half (implicitly, via absolute positioning), CTA content explicitly takes `lg:w-1/2` on the right with `justify-end`. Content is right-aligned on desktop, full-width on mobile.
- **Viewport framing** — the 4 corner accents + top header border + bottom footer border create a visual frame 12px inset from viewport edges. Everything inside feels "contained" like a technical readout.
- **Z-index layering** — canvas at z-0 (default), content at z-10, header/footer/corners at z-20. Clean three-layer stack.

### Design Principles to Extract
1. **Monospace + all-caps + wide tracking = instant "technical system" identity** without any imagery at all
2. **Corner frame brackets are the cheapest way to make any layout feel like a HUD** — 4 divs, border on 2 sides each, done
3. **Technical notation (coordinates, version numbers, protocol names) as pure decoration** builds atmosphere even when non-functional
4. **Opacity-based hierarchy (0.3 → 0.4 → 0.6 → 0.8 → 1.0)** is more sophisticated than size-based hierarchy for dark themes
5. **Black + white only, no color at all, reads as more premium than black + accent color** — restraint signals confidence
6. **External canvas services (UnicornStudio) can provide $10K-level animation without custom shader work** — trade-off is dependency + branding removal
7. **CSS dither patterns (`repeating-linear-gradient` at 3px grid)** bridge digital and analog aesthetics cheaply
8. **Mobile doesn't need the same experience** — strip decorative elements aggressively, provide atmosphere (starfield) without the heavy canvas
9. **Button hover corner-accent reveal** is a micro-interaction that costs almost nothing but feels extremely considered
10. **`bottom: 5vh` offset for footer + matching corner accents = framed viewport** — simple CSS, massive atmosphere upgrade

### Use Cases
- Developer tools / CLI product landing pages
- Cybersecurity / defense tech marketing
- Technical infrastructure products (like AetherTrace)
- Studio / agency portfolios with technical positioning
- Any product where "precision" and "system" are core brand signals
- AetherTrace: the HUD aesthetic + monospace + corner frames + technical notation maps directly to "evidence custody system" / "cryptographic verification" positioning

## Raw Code Reference
See: `003-hero-ascii-code.tsx`
