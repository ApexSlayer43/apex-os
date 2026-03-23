# 009 — Hero Section with Smooth BG Shader (MeshGradient)

**Source:** 21st.dev
**Type:** Hero section / Animated WebGL mesh gradient background
**Stack:** React, Tailwind CSS, TypeScript, @paper-design/shaders-react
**Dependencies:** `@paper-design/shaders-react`
**Install:** `npm install @paper-design/shaders-react`

## What Makes This Hit

### The Core: `@paper-design/shaders-react`
**Paper Design Shaders** is a library of production-ready WebGL shader backgrounds exposed as React components with clean prop APIs. No Three.js, no GLSL files, no canvas setup. The entire WebGL mesh gradient renders via `<MeshGradient />` with 6 configurable parameters.

The `MeshGradient` shader creates an organic, fluid gradient that looks like light diffracting through colored glass — not a CSS gradient. CSS gradients are static interpolations between color stops. This is a procedural mesh where every vertex moves independently over time, driven by noise functions. The result is a surface that breathes.

**Key parameters:**
- `colors: string[]` — 3–6 hex colors blended across the mesh. More colors = richer, more complex blending.
- `distortion: 0–2` — how much the mesh deforms. `0` = smooth silky surface. `2` = chaotic, almost liquid turbulence.
- `swirl: 0–1` — rotational motion in the gradient. High swirl = marble/fluid effect.
- `speed: number` — animation rate. `0` = frozen. `1` = fast real-time motion. `0.2–0.5` = subtle, premium.
- `offsetX: number` — horizontal bias for gradient origin. Shifts the visual "weight" left or right.
- `grainMixer/grainOverlay: 0–1` — adds film grain texture to the gradient and/or the full screen. `0` in the demo = pure clean gradient. Add grain for an editorial/print feel.

### The `mounted` SSR Guard Pattern
```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);

// In JSX:
{mounted && <MeshGradient ... />}
```

`MeshGradient` uses WebGL, which requires `window` and a browser canvas API. These don't exist during server-side rendering (Next.js, Remix, etc.). Without this guard, the component throws on the server.

The `mounted` state starts `false` during SSR. After hydration, the `useEffect` fires (client-only), sets `mounted = true`, and the WebGL canvas renders. This is the standard pattern for any component that requires browser APIs (`window`, `document`, `canvas`, `WebGLRenderingContext`).

**Without this guard:**
- SSR build fails: `ReferenceError: window is not defined`
- Or: hydration mismatch between server-rendered HTML and client-rendered canvas

### Viewport Dimension Tracking
```tsx
const [dimensions, setDimensions] = useState({ width: 1920, height: 1080 });
useEffect(() => {
  const update = () => setDimensions({ width: window.innerWidth, height: window.innerHeight });
  update();
  window.addEventListener("resize", update);
  return () => window.removeEventListener("resize", update);
}, []);
```

`MeshGradient` takes explicit pixel dimensions. Default `1920×1080` ensures the canvas covers any screen on first render before measurements are available. The `update()` call immediately corrects this after mount, and `resize` keeps it accurate.

**Why not `100vw × 100vh` via CSS?** WebGL canvases need integer pixel dimensions for their drawing buffers. CSS percentages resolve to floats that can't be passed directly to WebGL. Measure → pass exact integers.

### The `fixed inset-0` Canvas Layer
```tsx
<div className="fixed inset-0 w-screen h-screen">
  {mounted && <MeshGradient ... />}
</div>
```

`position: fixed` pins the canvas to the viewport, not the document. This means the gradient **stays still as the user scrolls** — the content scrolls over it but the background remains locked. This creates a parallax-like depth effect without any JavaScript.

Compare to `position: absolute` — that would scroll with the page, producing a visible scroll seam at the bottom of the viewport.

**The layer stack:**
1. `fixed inset-0` canvas (WebGL gradient) — z-0
2. `absolute inset-0` veil div — z-0, pointer-events-none
3. `relative z-10` content container — above both

### The Legibility Veil
```tsx
<div className={`absolute inset-0 pointer-events-none ${veilOpacity}`} />
```

A thin semi-transparent overlay between the gradient and the text. The default `bg-white/20 dark:bg-black/25` adds just enough scrim to ensure text contrast without visually "killing" the gradient.

The key values:
- Too light (5–10%): text readability fails on bright gradient areas
- Too heavy (40–60%): the gradient becomes invisible, defeats the purpose
- Sweet spot (15–30%): gradient remains vivid, text remains legible

The `dark:` variant automatically flips from white-tinted to black-tinted in dark mode — one prop handles both themes.

`pointer-events-none` is critical — without it, the veil div intercepts mouse events, breaking hover states on any content above.

### Typography Architecture
**Three text levels, three treatments:**

1. **Headline** — `text-foreground` (adapts to theme), 4xl→80px responsive scaling, `text-balance` for multi-line distribution, custom font via `style={{ fontFamily, fontWeight }}`
2. **Highlight word** — `text-primary` (adapts to brand color via CSS variable), visually separated from headline text
3. **Description** — hardcoded `text-white` (NOT `text-muted-foreground`). On a colorful gradient background, the muted-foreground color may have insufficient contrast. White is guaranteed legible against any gradient with a proper veil.

**`text-balance` vs `text-pretty`:**
- `text-balance`: distributes words evenly across lines for multi-line headlines (prevents "orphan" single words on last line)
- `text-pretty`: optimizes for readability in body text (avoids hyphenation awkwardness)
One class each, dramatically improved typography with zero JavaScript.

### CTA Button Design
```tsx
className="px-6 py-4 sm:px-8 sm:py-6 rounded-full border-4 bg-[rgba(63,63,63,1)] border-card text-white hover:bg-[rgba(63,63,63,0.9)] transition-colors"
```

Key decisions:
- `rounded-full` — pill shape, softer than rectangular buttons
- `border-4` — thick 4px border. Against a colorful gradient, this creates visual separation and makes the button feel solid/grounded.
- `border-card` — uses the shadcn `card` color variable (typically light gray). Creates a subtle halo that lifts the button off the background.
- `bg-[rgba(63,63,63,1)]` — dark gray, not pure black. The `1` alpha means fully opaque. The hover variant uses `0.9` — extremely subtle transparency change that works as a hover cue on any background.
- No shadow — the border does all the work of visual separation.

### Full Prop API — Design Philosophy
Every visual parameter is exposed as a prop with sensible defaults. This makes the component:
- **Reusable across brands** — swap colors, stop. Done.
- **Testable** — iterate on `distortion` and `speed` without touching layout
- **Composable** — parent components control shader behavior without knowing implementation details

The split between structural props (`maxWidth`, `className`) and shader props (`distortion`, `swirl`, `speed`) is intentional. They change at different frequencies — shader props are tuned per brand, structural props are tuned per layout.

---

## Design Principles to Extract

1. **`@paper-design/shaders-react` is a shortcut to $10K-level backgrounds** — one npm install, one component, WebGL quality without custom GLSL. Use for any premium hero that needs organic motion.
2. **`mounted` guard is mandatory for any browser-API-dependent component** — SSR compatibility requires gating WebGL/canvas renders behind `useEffect`. Always default to safe server values.
3. **`position: fixed` for full-viewport backgrounds that don't scroll** — the gradient stays pinned; content scrolls over it. This is the correct architectural choice for "wallpaper" backgrounds.
4. **Legibility veil at 15–30% opacity** — thin enough to keep the gradient vivid, thick enough for text contrast. Dark mode: flip to black tint.
5. **`pointer-events-none` on all decorative overlay divs** — without this, invisible divs silently break interactivity.
6. **`text-white` on gradient backgrounds, not `text-muted-foreground`** — semantic tokens assume a known background. On a dynamic gradient, only white is guaranteed contrast.
7. **`text-balance` on headlines, `text-pretty` on body** — two CSS properties, dramatically better typography. Zero JavaScript.
8. **`text-primary` for the highlight word** — connects the hero highlight to the brand color system automatically. Adapts to any shadcn theme.
9. **`border-4` pill button on gradient backgrounds** — thick borders create visual grounding when there's no reliable contrast background. The border is the container.
10. **Expose every shader parameter as a prop with sensible defaults** — distortion, swirl, speed, offsetX. Designers iterate on these numbers without touching code structure.
11. **`grainMixer` and `grainOverlay` at 0** = pure digital. Set to `0.1–0.3` for editorial/print aesthetic. Grain adds tactility to what would otherwise feel too computery.
12. **Default to safe dimensions (1920×1080), then measure** — prevents layout flicker on first render. Always initialize dimensions before `window` is available.

---

## Palette System for AetherTrace

The gradient colors drive the entire emotional register of the hero. Recommended palettes:

**Steel + Teal (trust + precision):**
```js
colors: ["#060b14", "#0d1f35", "#0a2540", "#1a3a5c", "#0e7c7b", "#14b8b7"]
```

**Midnight + Emerald (verification + security):**
```js
colors: ["#030712", "#0f172a", "#0d2137", "#064e3b", "#065f46", "#0e7c5b"]
```

**Charcoal + Electric Blue (infrastructure + data):**
```js
colors: ["#09090b", "#1c1917", "#18181b", "#1e293b", "#1e3a8a", "#1d4ed8"]
```

**For all AetherTrace palettes:**
- `distortion: 0.4–0.7` — organic but controlled (reflects precision)
- `swirl: 0.2–0.4` — subtle motion (reflects stability)
- `speed: 0.15–0.3` — slow, deliberate (reflects permanence)
- `veilOpacity: "bg-black/35"` — darker veil for dark palettes

---

## Setup Instructions

```bash
# shadcn init (if not already set up)
npx shadcn@latest init

# Install the shader library
npm install @paper-design/shaders-react

# Place component at
# /components/ui/hero-section-with-smooth-bg-shader.tsx
```

**Why `/components/ui/`?** shadcn convention. All atomic UI components live here. Keeps import paths consistent (`@/components/ui/...`) and integrates with shadcn's CLI-managed component ecosystem.

## Raw Code Reference
See: `009-mesh-gradient-hero-code.tsx`
