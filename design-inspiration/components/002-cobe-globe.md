# 002 — Interactive 3D Globe (Cobe)

**Source:** 21st.dev
**Type:** Data visualization / Global presence indicator
**Stack:** React, cobe library, Tailwind CSS, TypeScript
**Dependencies:** cobe

## What Makes This Hit

### Visual Impact
- **Dotted globe rendering** — world map as a dot matrix on a sphere, NOT a flat map or image. The dots create a refined, data-forward aesthetic.
- **Light mode elegance** — white base color, subtle glow, clean against white background. This is proof that premium doesn't require dark mode.
- **Arc connections** — curved lines between cities (NYC → London) showing data flow / global reach. Animated, not static.
- **City markers with labels** — dark monospace tooltips (#1a1a2e bg) positioned via CSS Anchor Positioning API. Labels blur in/out based on globe visibility.
- **Slow auto-rotation** — 0.003 speed, continuous, meditative. The globe feels alive without demanding attention.

### Interaction Design
- **Drag to rotate** — pointer down starts grab, tracks velocity for momentum. After release, globe continues spinning with deceleration (0.95 friction).
- **Cursor feedback** — grab → grabbing cursor states
- **Theta clamping** — vertical rotation bounded (-0.4 to 0.4) with elastic snap-back, prevents disorienting over-rotation
- **Velocity momentum** — max velocity capped at 0.15, dt-based calculation for smooth physics feel

### Technical Techniques
- **cobe library** — lightweight WebGL globe renderer. ~5KB. Renders dot-map globe with markers, arcs, configurable colors. Much lighter than Three.js for this specific use case.
- **CSS Anchor Positioning** — `positionAnchor: --cobe-${id}`, `bottom: anchor(top)`, `left: anchor(center)`. Cutting-edge CSS API for positioning labels relative to globe markers.
- **Visibility-driven blur** — `filter: blur(calc((1 - var(--cobe-visible-${id}, 0)) * 8px))` — labels blur out as markers rotate to back of globe. Elegant progressive disclosure.
- **ResizeObserver initialization** — if canvas has 0 width on mount (hidden tabs, SSR), waits for resize before initializing. Robust.
- **Opacity fade-in** — canvas starts at opacity 0, transitions to 1 after globe initializes (1.2s ease). No flash of empty canvas.
- **requestAnimationFrame loop** — continuous render with phi accumulation for rotation, manual cleanup on unmount.

### Prop Architecture (Reusability)
Fully configurable via props:
- `markers` — array of {id, location: [lat, lng], label}
- `arcs` — array of {id, from, to, label?}
- `markerColor` / `baseColor` / `arcColor` / `glowColor` — RGB tuples [0-1]
- `dark` — 0 (light) to 1 (dark mode)
- `mapBrightness` — controls dot visibility (10 = very visible)
- `speed` / `theta` / `diffuse` — rotation and lighting
- `markerSize` / `markerElevation` / `arcWidth` / `arcHeight` — sizing

### Design Principles to Extract
1. **Dot-matrix globe = instant "global tech company" signal** — used by Vercel, Stripe, countless $10K+ sites
2. **Light mode + subtle glow + dotted rendering = premium minimalism** without needing dark backgrounds
3. **Monospace labels at 0.6rem with letter-spacing 0.08em** = data-confident typography for map annotations
4. **Blur-based visibility** (not just opacity) creates depth — things on the back of the globe feel far away
5. **Momentum-based interaction** makes the globe feel physical, not mechanical
6. **Auto-rotation is the idle state, interaction pauses it** — respects user intent
7. **One library (cobe, 5KB) replaces what would be hundreds of lines of Three.js** for this specific pattern

### Use Cases
- "Global infrastructure" sections (CDN, data centers, offices)
- "Trusted worldwide" social proof
- Hero section centerpiece for global platforms
- Data flow visualization (arcs between regions)
- AetherTrace: could show evidence custody locations, federal installations, global verification nodes

## Raw Code Reference
See: `002-cobe-globe-code.tsx`
