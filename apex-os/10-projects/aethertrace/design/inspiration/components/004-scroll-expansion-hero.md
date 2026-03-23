# 004 — Scroll Expansion Hero

**Source:** 21st.dev
**Type:** Hero section / Full-screen scroll-driven media reveal
**Stack:** React, Tailwind CSS, TypeScript, Framer Motion, Next.js Image
**Dependencies:** `framer-motion`, `next/image`
**Install:** `npm install framer-motion`

## What Makes This Hit

### The Core Mechanic
This is a **scroll-hijacking media reveal** — the most cinematic interaction pattern in modern web design. Instead of normal page scroll, wheel/touch events are intercepted and converted into a `scrollProgress` value (0 → 1). That single value drives every visual state simultaneously:

- Media card: small (300×400px) → full viewport (1550×800px)
- Background image: opacity 1.0 → 0 (fades out behind expanding media)
- Media overlay: opacity 0.7 → 0.2 (media reveals itself as it expands)
- Title words: X position 0 → ±150vw (fly apart in opposite directions)
- Date/hint labels: fly apart in the same fashion, opposite directions from title
- Content section: opacity 0 → 1 (revealed only when `scrollProgress === 1`)

**This is not animation — it's state mapping.** The "animation" is just React re-rendering on every wheel tick. No keyframes, no timelines. `scrollProgress` is the single source of truth for the entire screen state.

### Visual Impact
- **The reveal moment** — when media hits full expansion and `showContent` flips to `true`, the full page content fades in (0.7s duration). After fighting through scroll resistance, the payload finally arrives. Earned reveals hit harder than instant ones.
- **Title split effect** — the two halves of the title fly to opposite sides of the screen as the media card grows through them. The media literally pushes the words apart. Spatial storytelling.
- **Background extinction** — the background image doesn't cut away, it dissolves out in real-time with scroll. The hero environment is consumed by the media.
- **Scroll resistance** — the page locks at Y=0 until fully expanded. The user has to "fight" to get there. This resistance is intentional — it creates physical weight and stakes for the reveal.
- **`mix-blend-difference` mode** — optional `textBlend` prop puts the title in difference blend mode. Where the title overlaps dark media it appears light; where it overlaps light it appears dark. Zero-cost automatic contrast on any background.

### Interaction Design
- **Wheel hijacking** — `passive: false` on `wheel` event listener, `preventDefault()` called on every wheel event when not fully expanded. The browser's default scroll is completely replaced.
- **Touch parity** — `touchstart`/`touchmove`/`touchend` with `passive: false` mirrors the wheel behavior. Mobile gets the same cinematic reveal.
- **Asymmetric touch sensitivity** — when scrolling backward (collapsing), `scrollFactor = 0.008`; forward `scrollFactor = 0.005`. Collapsing feels faster/easier than expanding. Intentional friction asymmetry.
- **Escape hatch** — once fully expanded (`mediaFullyExpanded = true`), normal scroll resumes. Scrolling up past Y=0 while fully expanded re-engages the collapse sequence. The system is reversible.
- **Mobile breakpoint detection** — `ResizeObserver` pattern replaced with simple `window.innerWidth < 768` check. Mobile gets different expansion targets (650×200px range vs 1250×400px desktop range).

### Technical Techniques
- **Single `scrollProgress` state drives all transforms** — no separate animated values, no `useSpring`. Direct inline style: `translateX(-${textTranslateX}vw)`. Intentional — `transition-none` on all elements means no CSS easing fights the direct value. The user's scroll speed IS the animation speed.
- **Framer Motion for opacity only** — `<motion.div>` is used only for the elements that need animated opacity (background, media overlay, content section). Position transforms skip Framer entirely. This avoids the "springy" feel on position-driven elements while keeping smooth fades.
- **`transition-none` class** — explicitly disables Tailwind's transition utilities on the layout elements. Without this, browser interpolation would add easing that conflicts with the direct-value scroll mapping.
- **`window.scrollTo(0, 0)` lock** — `handleScroll` fires on any native scroll event and resets to top when not fully expanded. Belt-and-suspenders lock to prevent partial scroll states.
- **YouTube vs. native video branching** — `mediaSrc.includes('youtube.com')` determines render path. YouTube gets an `<iframe>` with embed URL manipulation (autoplay, mute, loop, no controls). Native video gets `<video>` with `playsInline`, `disablePictureInPicture`, `disableRemotePlayback`.
- **`pointer-events-none` on video wrapper** — prevents the video from intercepting scroll/touch events that need to reach the window listener. Critical for touch devices where native video controls would otherwise steal the touchmove.
- **Reset on mediaType change** — `useEffect` with `[mediaType]` dep resets all state to initial values when switching between video/image. Prevents stale scroll state when parent component changes the media type.
- **`min-h-[100dvh]`** — uses dynamic viewport height (`dvh`) unit instead of `vh`. Accounts for mobile browser chrome (address bar) that `100vh` notoriously ignores.

### Layout Architecture
- **Absolute-centered expanding card** — `absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` positions the media card exactly centered. Width/height driven by `scrollProgress` via inline style. No flexbox gymnastics — just centered absolute positioning with animated dimensions.
- **Z-index stack**: background (z-0) → media card (z-0, absolute) → title overlay (z-10) → content section (z-10)
- **Content section below the fold** — the `<motion.section>` with children is rendered below the `min-h-[100dvh]` hero section. It exists in DOM immediately but is `opacity: 0` until expansion completes. Then normal scroll resumes through it.
- **Container + full-width** — `container mx-auto` for the content, but media card uses viewport-relative sizing with `maxWidth: 95vw`. The card can break out of the container constraint at full expansion.

### Design Principles to Extract
1. **Scroll-hijacking creates cinematic weight** — locking the scroll and mapping it to a single state machine is the technique. Apply to any reveal that needs earned attention.
2. **Single `progress` float (0→1) as universal state driver** — one number controls everything on screen. This is cleaner than coordinating multiple animations.
3. **`transition-none` on scroll-mapped elements** — CSS transitions fight direct-value scroll mapping. Disable them on anything position-driven; keep them on opacity.
4. **Title split on first word / rest of title** — `title.split(' ')[0]` + `.slice(1).join(' ')`. Simple split, massive visual impact. Works on any two-word+ title.
5. **`mix-blend-difference` as automatic contrast** — zero-cost legibility on any background without computing text colors per background region.
6. **Asymmetric interaction resistance** — make collapsing (undo) easier than expanding (commit). Users should feel forward momentum, not frustration going back.
7. **Earned reveal > instant reveal** — the 0.7s fade-in after the "fight" to expand creates emotional payoff. The resistance IS the design.
8. **`pointer-events-none` on media wrappers** — always block media elements from stealing scroll/touch events in scroll-hijacked interfaces.
9. **`passive: false` + `preventDefault()` is the unlock** — this is what makes scroll hijacking possible. Without it, the browser handles the event before your code can.
10. **`100dvh` not `100vh` for mobile** — non-negotiable on any full-screen component. `dvh` is the correct unit.

### Use Cases
- **Product launch pages** — scroll to reveal the product hero video
- **Portfolio case study openers** — scroll to expand the project featured image
- **Film/event announcement pages** — scroll to reveal the trailer
- **AetherTrace landing page** — scroll to expand a visualization of the chain/ledger, title "EVIDENCE. CUSTODY." flies apart, chain visualization fills the viewport, then the value prop section reveals below
- **AetherTrace evidence package demo** — scroll to expand a "redacted document" image that reveals a verified evidence package, demonstrating the custody concept
- Any context where you want to turn the scroll gesture into a commitment/reveal ritual

## Adaptation Notes for AetherTrace
Replace the cosmic space video with a dark visualization — either:
- The chain ledger animating block by block
- A document getting timestamped in real-time
- Black background + the SHA-256 hash appearing character by character

Title: `"EVIDENCE. CUSTODY."` — first word "EVIDENCE." flies left, "CUSTODY." flies right as the visualization expands through them.

Color palette: `text-blue-200` → `text-emerald-400` or `text-white` to match AetherTrace's dark/precision aesthetic.

## Raw Code Reference
See: `004-scroll-expansion-hero-code.tsx`
