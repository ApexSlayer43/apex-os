# 010 — Hero Odyssey (WebGL Lightning Shader + Interactive Hue Control)

**Source:** 21st.dev
**Type:** Full-page hero — WebGL GLSL lightning shader with live hue control
**Stack:** React, Tailwind CSS, TypeScript, Framer Motion, WebGL (raw, no library)
**Dependencies:** `framer-motion`
**Install:** `npm install framer-motion`

## What Makes This Hit

### The Core: Custom WebGL GLSL Fragment Shader

No Three.js. No Canvas 2D API. Pure WebGL — a full-screen quad (`-1` to `+1` NDC) with a custom fragment shader doing all the work. The pipeline is minimal on purpose:

1. Two triangles covering the entire viewport (6 vertices, hardcoded)
2. Vertex shader: passthrough — just sets `gl_Position`
3. Fragment shader: all visual logic — FBM noise + 1/dist beam + HSV→RGB

This is the lowest-level approach possible. Every pixel is computed by the GPU with zero JavaScript in the render loop (only uniform updates).

---

## The Lightning Algorithm — FBM + 1/dist Falloff

The lightning is not drawn as a path or curve. It emerges from the math.

### Step 1: Normalize UV
```glsl
vec2 uv = fragCoord / iResolution.xy;
uv = 2.0 * uv - 1.0;
uv.x *= iResolution.x / iResolution.y;  // aspect correct
uv.x += uXOffset;                         // horizontal shift
```
Pixels are remapped from `0..1` to `-1..+1`, centered at origin. Aspect correction ensures the lightning isn't stretched on non-square canvases.

### Step 2: Displace UV with FBM
```glsl
uv += 2.0 * fbm(uv * uSize + 0.8 * iTime * uSpeed) - 1.0;
```
The UV coordinates are warped by FBM noise before the distance calculation. This is what makes the lightning organic and non-straight. The `0.8 * iTime * uSpeed` drives temporal animation — the noise field shifts over time, making the lightning writhe.

**Why `2.0 * fbm(...) - 1.0`?** FBM outputs `0..1`. Multiplying by 2 and subtracting 1 recenters it to `-1..+1`, so the displacement is bidirectional (left and right, not just right).

### Step 3: FBM — 10 Octaves with Per-Octave Rotation
```glsl
float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    for (int i = 0; i < OCTAVE_COUNT; ++i) {
        value += amplitude * noise(p);
        p *= rotate2d(0.45);   // ~25.8° rotation per octave
        p *= 2.0;              // double frequency
        amplitude *= 0.5;      // halve amplitude
    }
    return value;
}
```

10 octaves stacks coarse-to-fine detail. Without rotation, each octave produces axis-aligned patterns that look grid-like. The `rotate2d(0.45)` between octaves breaks the grid alignment — the result looks genuinely organic.

The rotation matrix is computed per octave call:
```glsl
mat2 rotate2d(float theta) {
    float c = cos(theta);
    float s = sin(theta);
    return mat2(c, -s, s, c);
}
```
This is a 2x2 rotation matrix applied to the 2D sample position before each scale step.

### Step 4: 1/dist Beam with Flicker
```glsl
float dist = abs(uv.x);  // distance from X=0 axis (vertical beam center)
vec3 baseColor = hsv2rgb(vec3(uHue / 360.0, 0.7, 0.8));
vec3 col = baseColor * pow(mix(0.0, 0.07, hash11(iTime * uSpeed)) / dist, 1.0) * uIntensity;
```

`1/dist` falloff: pixels near X=0 are very bright, pixels far from X=0 are dark. After UV distortion, "near X=0" traces the lightning's tortured path through space.

`hash11(iTime * uSpeed)` adds frame-to-frame brightness variation (flicker). The mix from `0.0` to `0.07` keeps the flicker subtle — this is the "alive" quality of real electrical discharge.

---

## HSV to RGB — Vectorized GLSL

```glsl
vec3 hsv2rgb(vec3 c) {
    vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0,4.0,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
    return c.z * mix(vec3(1.0), rgb, c.y);
}
```

The hue (`uHue / 360.0`) is passed directly as the x component. This is a branch-free, single-expression HSV→RGB conversion. The mod arithmetic maps hue to R, G, B channels without any if-statements — GPU-optimal.

The `uHue` uniform takes values 0–360 (degrees, matching the CSS convention). Division by 360 normalizes to 0–1 for the GLSL math.

---

## Live Hue Control — The Uniform Update Pattern

The connection from slider → shader is:
1. React state: `const [lightningHue, setLightningHue] = useState(220)`
2. Passed as prop: `<Lightning hue={lightningHue} />`
3. In the render loop: `gl.uniform1f(uHueLocation, hue)`

Uniforms update every frame in the `requestAnimationFrame` loop. The new hue value is applied the next frame — effectively instant. No shader recompile, no canvas reset.

**The dependency array `[hue, xOffset, speed, intensity, size]`** on the `useEffect` means any prop change tears down the WebGL context and rebuilds it. For hue changes this happens every slider tick. A more optimized version would use a `useRef` to track hue and update it in the render loop without rebuilding.

---

## ElasticHueSlider — Native Input + Cosmetic Overlay Pattern

The slider uses a critical separation of concerns:
- **Native `<input type="range">`** — invisible (`z-20`, `appearance-none`, `bg-transparent`). Handles ALL mouse/touch drag events with zero custom code.
- **Styled track and fill** — purely cosmetic divs behind the native input.
- **Framer Motion thumb** — spring-animates on drag state, purely visual.

```tsx
// Native input — z-20, invisible, handles events
<input type="range" ... className="absolute inset-0 ... z-20" />
// Styled fill — z-10, width matches thumb position
<div style={{ width: `${thumbPosition}%` }} ... z-10 />
// Animated thumb — z-30, spring on drag
<motion.div animate={{ scale: isDragging ? 1.2 : 1 }} ... z-30 />
```

The `isDragging` state gates the spring parameters: `damping: 20` when dragging (looser, more elastic), `damping: 30` when released (snaps back). This creates the "elastic" feel without any physics simulation beyond a simple spring.

**`AnimatePresence key={value}`** on the value display replaces the element on each change, triggering enter/exit animations. The degree indicator feels alive — it doesn't just update, it breathes.

---

## FeatureItem — Glow Dot Pattern

```tsx
<div className="w-2 h-2 bg-white rounded-full group-hover:animate-pulse"></div>
<div className="absolute -inset-1 bg-white/20 rounded-full blur-sm opacity-70 group-hover:opacity-100"></div>
```

Two layers: the solid dot and its blurred halo. The halo is `blur-sm` + `bg-white/20` — a soft bloom around the dot. On hover: the dot pulses (`animate-pulse`) and the halo goes full opacity. The surrounding text also gets a `bg-white/10 blur-md` background that becomes visible on hover — the label "glows" as a unit.

`absolute ${position}` means the calling component fully controls placement via Tailwind strings like `"left-0 sm:left-10 top-40"`. This is a clean prop API for a positioned overlay element.

---

## Background Layer Stack

Five layers composited via absolute positioning (back to front):

1. **`bg-black/80` overlay** — reduces raw shader brightness. Without this, the GLSL output is eye-burning at full intensity.
2. **Ambient glow blob** — `w-[800px] h-[800px] rounded-full bg-gradient-to-b from-blue-500/20 to-purple-600/10 blur-3xl`. This is a large diffuse light source that creates the atmospheric "there's something glowing here" feel even at zero scroll.
3. **WebGL lightning canvas** — full-width, full-height, raw GLSL output.
4. **CSS sphere / planet** — `backdrop-blur-3xl rounded-full bg-[radial-gradient(circle_at_25%_90%,...)]`. The radial gradient with a highlight at `25% 90%` creates the illusion of a 3D orb with a light source hitting from the lower left. The `backdrop-blur-3xl` frosts everything behind the sphere — lightning appears behind glass.

**The radial-gradient sphere technique:**
```css
bg-[radial-gradient(circle_at_25%_90%,_#1e386b_15%,_#000000de_70%,_#000000ed_100%)]
```
- `circle_at_25%_90%` — light source in the lower-left quadrant (most natural for a planet lit from below)
- `#1e386b` — deep blue highlight (navy, not cyan)
- `#000000de / #000000ed` — near-black mid and outer regions
- The sphere appears 3D without any Three.js geometry, normal maps, or lighting math.

---

## Framer Motion Stagger Pattern

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } },
};
```

Both the FeatureItem container and the hero text container use the same variant pair. Each `motion.div` wrapping a child inherits from `containerVariants` and fires `itemVariants` automatically. The `staggerChildren: 0.3` fires each child 300ms after the previous one.

`delayChildren: 0.2` adds a 200ms buffer before the first child fires — gives the WebGL canvas time to initialize before the text appears over it.

**`y: 20` entry** — elements rise from 20px below their final position. `easeOut` means they start fast and settle. This is the standard "slide up and fade in" pattern for hero content.

---

## Design Principles to Extract

1. **WebGL fragment shaders without Three.js** — raw WebGL for full-screen effects is ~100 lines of boilerplate. No library overhead. For 2D shader effects (gradients, noise, lightning, fire, water), this is the lightest approach.
2. **FBM = organic motion** — fractal Brownian motion is the go-to algorithm for anything that should look alive: smoke, fire, lightning, clouds, terrain. 10 octaves gives detail without performance cost.
3. **Per-octave rotation in FBM** — `rotate2d(0.45)` between octaves breaks axis-aligned artifact patterns. Always rotate in FBM for organic results.
4. **1/dist falloff for beams/rays** — `intensity / distance` is the universal formula for glowing lines and beams. Apply after UV distortion to get non-straight beams.
5. **HSV→RGB in GLSL for color animation** — hue as a single float uniform, then convert in-shader. This lets you animate color with a single number rather than RGB triplets.
6. **Hue uniform = live color control** — any color param can be a uniform. Update in the render loop. Real-time color control costs nothing.
7. **Native input + cosmetic overlay = reliable sliders** — the native range input handles all events (mouse, touch, keyboard, accessibility). Styled overlays are pure CSS/Framer. Never fight the browser's input handling.
8. **`AnimatePresence key={value}`** for live values — each change creates a new element, triggering enter/exit. Use for anything that updates frequently and should feel "alive" (scores, counters, live metrics).
9. **`isDragging` spring gating** — `damping: 20` on drag (loose), `damping: 30` on release (snaps back). Two numbers create the elastic feel.
10. **Glow dot pattern** — solid dot + blurred halo behind it. Opacity boost on hover. Universal floating label/indicator pattern. Scales from UI status dots to map markers to feature callouts.
11. **`backdrop-blur` + `radial-gradient` sphere** — CSS-only 3D planet. Gradient at `circle_at_25% 90%` = lower-left light source (natural). Backdrop-blur suggests depth/glass. No Three.js needed for background orbs.
12. **Layer compositing via absolute stacking** — complex backgrounds = 4-5 `absolute inset-0` divs each doing one job. Black overlay for brightness control. Blur blob for ambient. Canvas for shader. CSS shapes for foreground elements.
13. **`staggerChildren` + `delayChildren`** — the 200ms delay buys time for WebGL init before text appears. Stagger creates the "UI assembles itself" feeling. Both set in the container variant, not individual children.
14. **`scale-50` on the slider** — the slider is rendered at full size and shrunk 50% via CSS transform. Keeps the component's internal layout clean (full-size hit targets, readable code) while fitting a compact space. Transform-scaling is safer than halving all dimensions.

---

## AetherTrace Adaptation

This component maps directly to AetherTrace's core identity: invisible infrastructure becoming visible through light.

**Lightning → Hash Chain visualization:**
- The lightning beam IS the chain — a cryptographic thread running through noise (uncertainty), remaining intact.
- Set `hue` to `178` (teal) for AetherTrace brand color
- `speed: 0.9` — slower, more deliberate (infrastructure doesn't rush)
- `intensity: 0.45` — present but not overwhelming

**FeatureItems → Evidence metadata:**
```
SHA-256 / on capture
Chain / append-only
Timestamp / immutable
Verify / public URL
```

**Sphere → Custody container:**
The CSS orb becomes the "evidence locker" — the lightning (events) stream through the darkness, the orb holds what's been secured. Adjust the radial gradient:
```css
bg-[radial-gradient(circle_at_25%_90%,_#0e7c7b_10%,_#0a2540de_65%,_#060b14ed_100%)]
```
(AetherTrace Steel+Teal palette instead of blue)

**Hue slider → "Verify by Domain" control:**
In AetherTrace, the slider could change the evidence domain theme:
- `0–60°` (red→yellow) = construction evidence
- `120–180°` (green→teal) = federal/DoD evidence
- `220–260°` (blue→indigo) = financial/legal evidence
Each domain gets its own color temperature.

**Headline:**
```
Your Evidence.
Cryptographically Sealed.
```
`font-light` at `text-7xl` with the gradient subhead treatment is exactly right for infrastructure positioning — not a product, a protocol.

---

## Raw Code Reference
See: `010-hero-odyssey-code.tsx`
