# 008 — Horizon Hero Section (Three.js + GSAP Scroll Flythrough)

**Source:** 21st.dev
**Type:** Full-page immersive hero — scroll-driven 3D camera flythrough
**Stack:** React, TypeScript, Three.js, GSAP, custom GLSL shaders
**Dependencies:** `three`, `gsap`
**Install:** `npm install three gsap` + `npm install --save-dev @types/three`

## Screenshot
Massive red "HORIZON" headline over a 3D night sky — mountain silhouettes in front, star field behind, bloom glow on the sun/horizon light, glowing vertical light beam descending from headline, scroll counter at bottom (00/02). Side hamburger menu with vertical "SPACE" text rotated 90°.

## What Makes This Hit

### Five Simultaneous Visual Systems
This component runs five independent visual systems in a single WebGL scene, all active simultaneously:

1. **Three-layer star field** — custom GLSL vertex/fragment shaders, depth-based rotation, additive blending
2. **Animated nebula plane** — sine-wave vertex displacement + color-mixing fragment shader
3. **Procedural mountain silhouettes** — `THREE.Shape` + `ShapeGeometry`, 4 depth layers
4. **Atmosphere sphere** — Fresnel-like edge glow (rim lighting without lighting)
5. **Post-processing bloom** — `UnrealBloomPass` on top of everything

The combination produces the effect of standing inside a planet's atmosphere at night, looking at a mountain range against a cosmic sky. No textures, no assets — everything is procedural geometry + shaders.

---

## System 1: Star Field — Custom GLSL + Depth Layers

### The Technique
Three separate `THREE.Points` objects, each with 5000 stars on a sphere of radius 200–1000. Each layer has different rotation speed via the `depth` uniform:

```glsl
float angle = time * 0.05 * (1.0 - depth * 0.3);
mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
pos.xy = rot * pos.xy;
```

Layer 0 (foreground): rotates at `time * 0.05`
Layer 1 (mid): rotates at `time * 0.035`
Layer 2 (background): rotates at `time * 0.02`

This creates parallax depth between layers. Stars feel like they're at different distances.

### Star Size Perspective Scaling
```glsl
gl_PointSize = size * (300.0 / -mvPosition.z);
```
Point size scales inversely with Z depth — classic perspective point scaling. Stars closer to camera appear larger. Automatic depth cue without any distance calculations.

### Circular Star Shape
```glsl
float dist = length(gl_PointCoord - vec2(0.5));
if (dist > 0.5) discard;
float opacity = 1.0 - smoothstep(0.0, 0.5, dist);
```
`gl_PointCoord` gives 0-1 UV coordinates within each point quad. Discarding fragments beyond 0.5 from center creates circular stars. `smoothstep` fades the edge for soft glow.

### Color Distribution
- 70% white (neutral brightness variation)
- 20% warm/orange (`hsl(0.08, 0.5, 0.8)`)
- 10% cool blue (`hsl(0.6, 0.5, 0.8)`)

Mimics real star color distribution — the warm/cool mix with predominantly white creates a believable night sky.

### `AdditiveBlending` + `depthWrite: false`
These two settings are mandatory for star fields:
- `AdditiveBlending` — overlapping stars add light, no dark pixels from transparency
- `depthWrite: false` — stars don't write to the depth buffer, allowing them to overlap without z-fighting

---

## System 2: Nebula — Animated Vertex Displacement Plane

A massive `PlaneGeometry(8000, 4000, 100, 100)` behind the scene. The vertex shader displaces Z using sine waves:

```glsl
float elevation = sin(pos.x * 0.01 + time) * cos(pos.y * 0.01 + time) * 20.0;
pos.z += elevation;
```

The fragment shader mixes two colors (blue `0x0033ff` ↔ pink `0xff0066`) based on animated UV:
```glsl
float mixFactor = sin(vUv.x * 10.0 + time) * cos(vUv.y * 10.0 + time);
vec3 color = mix(color1, color2, mixFactor * 0.5 + 0.5);
```

Alpha is `opacity * (1.0 - length(vUv - 0.5) * 2.0)` — fades to transparent at the edges. The plane has a radial alpha gradient so it blends naturally into the star field.

At scroll > 70%, mountains fly to Z=600000 (instant off-screen removal). The nebula is repositioned to the last mountain's Z, revealing the full nebula at the end of the scroll journey.

---

## System 3: Mountain Silhouettes — Procedural ShapeGeometry

4 mountain layers, each with:
- Sinusoidal ridge generation: `sin(i * 0.1) * height + sin(i * 0.05) * height * 0.5`
- Random noise: `Math.random() * height * 0.2`
- Bottom closed at Y=-300 (invisible floor)
- Increasing distance from camera (-50, -100, -150, -200)
- Decreasing opacity (1.0, 0.8, 0.6, 0.4)
- Darker blues in front, lighter blues behind (atmospheric depth)

`THREE.Shape` → `THREE.ShapeGeometry` creates a 2D filled polygon from the ridge points. This is the correct approach for silhouette backgrounds — no vertex normals needed, no lighting, just flat color with MeshBasicMaterial.

### Parallax Animation
In the scroll handler:
```js
const speed = 1 + i * 0.9;
const targetZ = mountain.userData.baseZ + scrollY * speed * 0.5;
```
Each layer moves at a different speed proportional to its index. Layer 0 (front) moves slowest; Layer 3 (back) moves fastest. This is inverted parallax — normally foreground moves faster. The mountains are moving INTO the camera as you scroll deeper, creating a "flying through" sensation.

---

## System 4: Atmosphere — Fresnel Rim Shader

A `SphereGeometry(600)` with `side: THREE.BackSide` (renders the inside of the sphere). The fragment shader:

```glsl
float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
```

`dot(vNormal, vec3(0,0,1))` = 1 at the point closest to camera, 0 at the rim. `0.7 - dot(...)` inverts this, then `pow(..., 2.0)` sharpens the rim. Result: transparent center, glowing blue rim. This is the atmosphere glow visible on planets from space — achieved with zero lighting, zero environment maps.

The `pulse` uniform adds a breathing animation:
```glsl
float pulse = sin(time * 2.0) * 0.1 + 0.9; // oscillates 0.8–1.0
```

---

## System 5: UnrealBloomPass Post-Processing

```js
new UnrealBloomPass(resolution, strength=0.8, radius=0.4, threshold=0.85)
```

- **strength=0.8** — significant glow intensity
- **radius=0.4** — glow spread (0=tight, 1=very spread)
- **threshold=0.85** — only pixels brighter than 85% intensity get bloom

This is what gives the stars, nebula, and atmosphere their glow. Without bloom, the scene looks flat. With bloom, bright elements appear to emit light.

Bloom is processed via `EffectComposer` + `RenderPass` + `UnrealBloomPass` pipeline. **Always use `refs.composer.render()` instead of `refs.renderer.render()` in the animation loop when post-processing is active.**

---

## GSAP Animation System

### Two-Phase Initialization
1. Three.js initializes → sets `isReady = true`
2. Second `useEffect` watches `isReady` → fires GSAP timeline

This prevents GSAP from trying to animate DOM elements before Three.js canvas is painted (which would cause flicker).

### Character Stagger Reveal
```js
const titleChars = titleRef.current.querySelectorAll('.title-char');
tl.from(titleChars, { y: 200, opacity: 0, duration: 1.5, stagger: 0.05, ease: "power4.out" });
```

Each character in the title is a separate `<span class="title-char">`. GSAP staggers them by 50ms — the word explodes into view character by character. `power4.out` = aggressive ease-in → snap to position.

`y: 200` — characters start 200px below. Combined with `overflow: hidden` on the title container, they're invisible until they enter the visible region. The `overflow: hidden` clip is what makes this work — without it, the characters would be visible below the headline.

### GSAP Ease Reference (used in this component)
- `power3.out` — fast start, slow finish. Used for menu slide-in.
- `power4.out` — very fast start, very slow finish. Used for character reveal.
- `power2.out` — moderate. Used for scroll indicator.

---

## Scroll-Driven Camera Flythrough

### The Waypoint System
```js
const cameraPositions = [
  { x: 0, y: 30, z: 300 },   // Section 0: in front of mountains
  { x: 0, y: 40, z: -50 },   // Section 1: through mountains
  { x: 0, y: 50, z: -700 }   // Section 2: deep into nebula
];
```

Camera target is interpolated between current and next waypoint using `sectionProgress` (fractional position within a section). The target values are written to `refs.targetCamera*` (mutation on the ref object, not state — no re-renders).

### Lerp in Animation Loop (not in scroll handler)
The scroll handler only sets targets. The `animate()` loop performs the actual smoothing:
```js
const s = 0.05;
smoothCameraPos.current.x += (refs.targetCameraX - smoothCameraPos.current.x) * s;
```

At `s=0.05`, the camera covers 5% of remaining distance per frame at 60fps. This creates a ~1 second settling time for large movements (feels cinematic). The scroll handler writes to `threeRefs.current` directly (mutation) — no state updates, no re-renders, smooth 60fps movement.

### Floating Sine Overlay
```js
camera.position.x = smoothCameraPos.x + Math.sin(time * 0.1) * 2;
camera.position.y = smoothCameraPos.y + Math.cos(time * 0.15) * 1;
```
Adds ±2px X and ±1px Y floating motion on top of the scroll position. At slow scroll speeds this is visible as a gentle breathing/floating sensation. At fast scroll it's masked by the larger movement.

---

## Visual Design Principles

1. **Massive red headline on dark 3D scene** — the color contrast (red `#ff2200` against near-black mountains and blue stars) creates instant visual hierarchy. Nothing competes with the headline.
2. **Vertical light beam through headline** — the long vertical line (CSS or a Three.js geometry) creates a vanishing point visual anchor. Eye follows it from headline to horizon.
3. **Section counter `00/02`** — tabular number formatting with leading zeros. Signals controlled, deliberate scroll experience. Borrowed from film/editorial design.
4. **`writing-mode: vertical-rl`** on "SPACE" side text — rotated text as spatial orientation cue. Implies depth/dimensionality in the UI chrome.
5. **`ACESFilmicToneMapping` + `toneMappingExposure: 0.5`** — cinematic color grading baked into the renderer. Dark, moody, film-like. Not flat digital.
6. **Mountain at 70% scroll → Z=600000** — a hard cut that removes the terrain layer to reveal the cosmic nebula behind. The cut happens while the camera is already moving fast, so it's imperceptible as a "pop."

---

## AetherTrace Adaptation

Replace the fantasy/space theme with a **cryptographic/surveillance aesthetic**:
- Mountains → glowing grid/wireframe city blocks (dark with neon edges)
- Star field → floating data particles / hash character rain (0x1A2B3C...)
- Nebula → blockchain ledger visualization (glowing horizontal lines)
- Title → "AETHERTRACE" in the same oversized bold treatment, white or green instead of red
- Waypoints: Section 0 = ground level (evidence collection), Section 1 = mid-air (chain verification), Section 2 = space-level (immutable record, permanent)
- Bloom on the hash characters as they fly past = cryptographic verification "glow"

The scroll arc tells the story: you start at the evidence level, fly through verification, arrive at permanent immutable storage.

## Raw Code Reference
See: `008-horizon-hero-code.tsx`
