# 011 — Warp Background (CSS 3D Perspective Grid + Framer Motion Beams)

**Source:** 21st.dev
**Type:** Wrapper component — perspective grid with animated light beams from all four sides
**Stack:** React, Tailwind CSS, TypeScript, Framer Motion (motion/react), CSS 3D transforms
**Dependencies:** `motion`, shadcn/card, `@/lib/utils` (cn)
**Install:** `npm install motion`

## What Makes This Hit

This component does something visually distinctive using zero WebGL and zero canvas — pure CSS 3D transforms, container query units, and Framer Motion. The result looks like a sci-fi energy field or hyperspace jump animation wrapping any arbitrary content. The engineering is surprisingly lean given the output.

---

## The Core Mechanism: CSS 3D Plane Folding

The entire effect is four flat `<div>` elements — one per side — folded outward using CSS `rotateX` and `rotate` transforms to face the viewer:

### Top Plane
```css
transform: rotateX(-90deg);
transform-origin: 50% 0%;  /* hinge at top edge center */
```
The plane starts vertical (matching the container's top edge) and rotates -90° around the X axis, folding flat away from the viewer. From the viewer's perspective with `perspective: 100px`, it appears as a receding grid floor extending from the top border.

### Bottom Plane
```css
/* Positioned at top: 100% (bottom edge of container) */
transform: rotateX(-90deg);
transform-origin: 50% 0%;  /* hinge at top of this div = bottom of container */
```
Same transform, different anchor. Appears as a receding grid floor below the container.

### Left Plane
```css
transform: rotate(90deg) rotateX(-90deg);
transform-origin: 0% 0%;  /* hinge at top-left corner */
```
Two-step: `rotate(90deg)` first aligns the plane along the left edge (rotates in Z), then `rotateX(-90deg)` folds it flat into 3D space. The order of transform operations matters — CSS applies right-to-left.

### Right Plane
```css
transform: rotate(-90deg) rotateX(-90deg);
transform-origin: 100% 0%;  /* hinge at top-right corner */
```
Mirror of the left.

**Why it works visually:** With a low `perspective` value (e.g. 100px), the 3D distortion is extreme — the grid planes appear to recede dramatically. The beams traveling along those planes appear to approach the viewer from the horizon, which creates the warp/hyperspace feel.

---

## Container Query Units — The Critical Sizing Technique

Standard `%` units in absolutely positioned elements are relative to the positioned parent — unpredictable in a 3D-transformed context. Container query units are relative to the **container query ancestor**, which is explicitly set via `[container-type:size]`.

```css
[container-type:size]      /* on the 3D shell — establishes the container */
[container-type:inline-size] /* on each plane — allows cqi within the plane */
```

Units used:
- **`100cqi`** — 100% of the container's inline dimension (horizontal width). Used for `width` of top/bottom planes so they exactly match the container width.
- **`100cqh`** — 100% of the container's block dimension (vertical height). Used for `width` of left/right planes so they match the container height.
- **`100cqmax`** — 100% of the **larger** of width or height. Used for `height` of all planes so they extend far enough for beams to travel. The beams start at `y: "100cqmax"` — guaranteed to be fully off-screen regardless of container proportions.

**Why `100cqmax` for beam travel?** If the container is 400×200px, cqmax = 400px. The beam starts 400px below the plane's top edge and ends 100% (of its own height) above — it will clear any container shape. Without this, beams in square containers would appear to pop in from mid-air on non-square sides.

---

## The Grid Pattern — CSS Multi-Background Trick

Each plane renders a grid using two overlapping `linear-gradient` backgrounds:
```css
background:
  /* Horizontal lines: 1px line every beamSize% */
  linear-gradient(var(--grid-color) 0 1px, transparent 1px var(--beam-size))
    50% -0.5px / var(--beam-size) var(--beam-size),
  /* Vertical lines: 1px line every beamSize% */
  linear-gradient(90deg, var(--grid-color) 0 1px, transparent 1px var(--beam-size))
    50% 50% / var(--beam-size) var(--beam-size);
```

Two gradients in a single `background` property, comma-separated. The first draws horizontal lines (gradient from color to transparent), the second draws vertical lines (rotated 90°). Together they form a grid.

The `-0.5px` offset on the first gradient is sub-pixel correction — prevents the top grid line from appearing at the very edge where floating-point rendering can cause a hairline gap.

**`beamSize` does double duty:** It controls both the grid cell size AND the beam width. When a beam is exactly one cell wide and positioned on a cell boundary, it travels perfectly along a grid column — the beam appears to be a streak of light illuminating one path in the grid. The grid and beams feel like one system, not two overlaid effects.

---

## Beam Architecture — CSS Custom Properties via Inline Style

The `Beam` component uses a pattern that appears throughout 21st.dev components: **pass values as CSS custom properties on inline style, then reference them in Tailwind arbitrary value classes.**

```tsx
// Set as inline style — accessible in CSS
style={{
  "--x": `${x}`,
  "--width": `${width}`,
  "--aspect-ratio": `${ar}`,
  "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
} as React.CSSProperties}

// Reference in Tailwind arbitrary classes
className={`
  left-[var(--x)]
  [width:var(--width)]
  [aspect-ratio:1/var(--aspect-ratio)]
  [background:var(--background)]
`}
```

**Why not just use `style` for everything?** Tailwind's `left-[var(--x)]` generates a static CSS class that can be included in Tailwind's purge list. The dynamic value comes from CSS variables at runtime — the Tailwind class string itself is static. This means it survives production builds without needing to safelist dynamic values.

---

## Beam Randomization Strategy

Three random values per beam, computed once at mount:

1. **Hue** (`Math.random() * 360`) — full spectrum, each beam is a different color. The `hsl(${hue} 80% 60%)` formula ensures high saturation (80%) and good brightness (60%) regardless of hue — no muddy or dark beams.

2. **Aspect ratio** (`Math.random() * 10 + 1`) — 1:1 to 1:10. Controls beam length. A ratio of 1:10 with beamSize=5% means the beam is 5% wide and 50% tall — a long streaking ray. A ratio of 1:1 gives a square blob.

3. **Delay** (from `generateBeams`) — `Math.random() * (max - min) + min` — staggered start times prevent all beams from traveling in sync, which would look mechanical.

**The hue and ar are inside the component** — they don't come from props. This means each time the component mounts, every beam gets fresh random values. If you want stable/reproducible beams (e.g. for a specific brand color), move hue out to a prop.

---

## `useCallback` + `useMemo` for Beam Generation

```tsx
const generateBeams = useCallback(() => { ... }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

const topBeams    = useMemo(() => generateBeams(), [generateBeams]);
const rightBeams  = useMemo(() => generateBeams(), [generateBeams]);
const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
const leftBeams   = useMemo(() => generateBeams(), [generateBeams]);
```

`useCallback` memoizes the generator function — it only recreates if beam config props change. `useMemo` calls it four times independently (once per side), each producing a different random array. If `generateBeams` were called inline during render, it would produce new random values every render cycle — the beams would flicker and reset randomly.

The separation of `useCallback` (stable function) + `useMemo` (stable result) is the correct pattern for expensive or random computations used in render.

---

## `[clip-path:inset(0)]` — Why Not `overflow-hidden`?

The 3D shell uses `[clip-path:inset(0)]` instead of `overflow-hidden`. This distinction is critical for 3D transformed children.

`overflow-hidden` clips in 2D screen space after all transforms are applied — it can clip content inside the 3D scene unexpectedly and can interfere with `transform-style:preserve-3d`.

`clip-path:inset(0)` clips at the element's border box in CSS layout space, before 3D transforms are composed. It's compatible with `preserve-3d` and clips the beams exactly at the container edge without disrupting the 3D rendering context.

---

## CSS Variable Cascade for theming

```tsx
gridColor = "hsl(var(--border))"  // shadcn CSS variable
```

The default `gridColor` uses the shadcn `--border` token. This means the grid automatically adapts to dark/light mode and respects any shadcn theme customization. Custom shadcn themes that change `--border` will change the grid color with zero code changes.

For a custom color, pass a raw CSS value: `gridColor="rgba(20, 184, 166, 0.3)"` (teal). The value is injected via `--grid-color` CSS variable and consumed in the background gradient class.

---

## Design Principles to Extract

1. **CSS 3D plane folding for perspective floors/walls** — `rotateX(-90deg)` + `transform-origin` at the edge creates a flat plane extending away from the viewer. No WebGL needed for perspective grid effects.

2. **Transform order matters in CSS** — `rotate(90deg) rotateX(-90deg)` is not the same as `rotateX(-90deg) rotate(90deg)`. CSS transforms compose right-to-left. Align to target axis first (Z rotation), then fold (X rotation).

3. **`preserve-3d` must be on every ancestor** — `transform-style:preserve-3d` doesn't cascade. Every element in the 3D hierarchy needs it, or child transforms collapse to 2D.

4. **Container query units for 3D sizing** — `cqi`, `cqh`, `cqmax` are the correct way to size elements within a 3D-transformed context. `%` is unreliable across transform layers.

5. **`100cqmax` for cross-container animation distance** — when animating something that needs to travel through an unknown-shape container, `cqmax` guarantees it starts and ends fully off-screen.

6. **CSS variable props → Tailwind arbitrary values** — the pattern `style={{ "--x": value }}` + `className="left-[var(--x)]"` passes dynamic values into static Tailwind classes. Production-safe without safelisting.

7. **CSS multi-background for grids** — two `linear-gradient` backgrounds comma-separated: one for horizontal lines, one for vertical. No SVG, no borders, no pseudo-elements. Grid density controlled by `background-size`.

8. **`beamSize` as a unified grid+beam unit** — when beam width = grid cell width, beams travel along grid columns. The visual coherence comes from this alignment. One number controls both dimensions.

9. **`clip-path:inset(0)` over `overflow-hidden` in 3D contexts** — clip-path respects `preserve-3d` hierarchies. `overflow-hidden` can collapse them.

10. **`hsl(hue 80% 60%)` for always-visible random hues** — fixing saturation at 80% and lightness at 60% ensures any random hue produces a vivid, mid-brightness color. Dark or washed-out random colors are eliminated by the formula.

11. **`useCallback` + `useMemo` for stable random arrays** — compute random values once at mount. `useCallback` memoizes the function, `useMemo` memoizes the result. Prevents re-randomization on every render.

12. **`ease: "linear"` for travel animations** — beams should travel at constant speed (like actual light or energy). Easing would make them appear to accelerate/decelerate — wrong for this physics metaphor.

13. **`repeat: Infinity` with staggered delays** — each beam loops forever with its own random initial delay. The desynchronization is what makes the field feel "alive" rather than mechanical.

14. **Independent random arrays per side** — calling `generateBeams()` four times independently gives each side its own timing. If all four sides shared one beam array, all sides would flash simultaneously — too rhythmic, not organic.

---

## AetherTrace Adaptation

WarpBackground is the perfect wrapper for AetherTrace's highest-signal moments: when evidence is being sealed, when a package is exported, when verification passes.

**The metaphor is exact:** Beams traveling along a grid toward a central point = evidence events streaming into the chain. The container holding children = the sealed custody state. The grid = the structure (chain) that underlies everything.

### Evidence Sealing State
```tsx
// Slow, teal beams — deliberate custody, not chaos
<WarpBackground
  beamSize={4}
  beamsPerSide={4}
  beamDuration={5}
  beamDelayMax={6}
  gridColor="rgba(20, 184, 166, 0.18)"  // AetherTrace teal, low opacity
  perspective={120}                      // shallower — professional, not sci-fi
  className="rounded-xl border-teal-900/40"
>
  <EvidencePackageCard />
</WarpBackground>
```

### Verification Success State
```tsx
// Fast, bright green — instant verification
<WarpBackground
  beamSize={3}
  beamsPerSide={6}
  beamDuration={1.2}
  beamDelayMax={0.8}
  gridColor="rgba(34, 197, 94, 0.25)"   // green
>
  <VerifiedBadge hash="sha256:a3f..." />
</WarpBackground>
```

### Tamper / Dispute Alert State
```tsx
// Aggressive — chain break detected
<WarpBackground
  beamSize={5}
  beamsPerSide={5}
  beamDuration={0.6}
  beamDelayMax={0.3}
  gridColor="rgba(239, 68, 68, 0.3)"    // red
>
  <TamperAlertCard />
</WarpBackground>
```

### Feature/Pricing Card Wrapper
The default config (3 beams, 3s duration, random hues) is already strong for wrapping any card in the marketing site. Wrapping a pricing card in WarpBackground communicates "this isn't a static table — this is active infrastructure." The randomized hues mean no two card views look identical — it feels alive.

---

## Raw Code Reference
See: `011-warp-background-code.tsx`
