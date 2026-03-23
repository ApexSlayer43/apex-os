# 015 — WebGL Chromatic Aberration Shader + Liquid Glass Button

**Source:** 21st.dev
**Type:** Full-screen WebGL background shader + glass-morphism CTA button
**Stack:** React + Three.js + Tailwind CSS + TypeScript + SVG filters
**Dependencies:** `three`, `@types/three`, `@radix-ui/react-slot`, `class-variance-authority`
**Install:** `npm install three @types/three @radix-ui/react-slot class-variance-authority`

## What Makes This Hit

Two components that belong together: a full-screen WebGL sinusoidal wave with real chromatic aberration, and a button that looks physically liquid on top of it. Neither would land the same alone. The shader creates a background that changes what's in front of it — making the glass button's backdrop distortion effect actually visible and meaningful. The technical depth here is significant: raw GLSL fragment shader math, SVG filter pipelines for CSS backdrop manipulation, a 9-layer box-shadow chain for physical glass simulation, and Three.js used as a minimal abstraction layer rather than a full 3D engine.

---

## WebGLShader: Architecture Overview

### `sceneRef` Object Pattern — One Ref for All Three.js State

```tsx
const sceneRef = useRef<{
  scene: THREE.Scene | null
  camera: THREE.OrthographicCamera | null
  renderer: THREE.WebGLRenderer | null
  mesh: THREE.Mesh | null
  uniforms: any
  animationId: number | null
}>({ scene: null, camera: null, renderer: null, mesh: null, uniforms: null, animationId: null })
```

Instead of six separate `useRef` calls, all Three.js state lives in one object ref. Reasons:
1. Three.js objects are not React state — mutating them must not trigger re-renders. `useRef` is correct.
2. One object ref vs. six individual refs: less declaration noise, clearer that these are coupled (you can't have a mesh without a scene).
3. `const { current: refs } = sceneRef` inside `useEffect` gives clean access without `.current` everywhere.

**The `any` type on `uniforms`:** Three.js's `IUniform<T>` type requires knowing each uniform's type at compile time. For a uniform object with `vec2`, `float` etc., this gets verbose. `any` is a pragmatic tradeoff for shader uniform maps.

---

### `THREE.WebGLRenderer({ canvas })` — Adopting an Existing Canvas

```tsx
refs.renderer = new THREE.WebGLRenderer({ canvas })
```

Three.js normally creates its own `<canvas>` element when you call `new WebGLRenderer()`. Passing `{ canvas }` adopts an existing canvas instead. This is required when React manages the canvas element (via `canvasRef`) — otherwise Three.js creates a second canvas that doesn't attach to the DOM correctly.

**`renderer.setSize(width, height, false)`:** The `false` argument (updateStyle) prevents Three.js from injecting `style="width:Xpx;height:Ypx"` inline styles on the canvas. Without it, Tailwind's `w-full h-full` gets overridden. Always `false` when you want CSS to control canvas layout.

**`renderer.setPixelRatio(window.devicePixelRatio)`:** Renders at device resolution (2x on Retina). Without it, the canvas renders at 1x and gets scaled up by CSS, looking blurry on high-DPI screens.

---

### `OrthographicCamera(-1, 1, 1, -1, 0, -1)` — The 2D Shader Camera

```tsx
refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)
```

Parameters: `left, right, top, bottom, near, far`.

Setting left=-1, right=1, top=1, bottom=-1 creates a camera whose view frustum maps exactly to NDC (Normalized Device Coordinates). Since the full-screen quad is defined with vertices at `(±1, ±1)`, the camera sees the quad edge-to-edge without any perspective distortion.

**Why Orthographic, not Perspective?** A perspective camera adds vanishing point foreshortening. For a 2D full-screen shader quad, this would distort the corners. The orthographic camera is a pure identity mapping from geometry space to screen space — the quad is flat, the camera is flat.

**`near=0, far=-1`:** The near/far clipping planes don't matter here because the quad is at z=0. Any non-degenerate values work.

---

### The Full-Screen Quad — Two Triangles in NDC

```tsx
const position = [
  -1.0, -1.0, 0.0,  // bottom-left
   1.0, -1.0, 0.0,  // bottom-right
  -1.0,  1.0, 0.0,  // top-left
   1.0, -1.0, 0.0,  // bottom-right (shared)
  -1.0,  1.0, 0.0,  // top-left (shared)
   1.0,  1.0, 0.0,  // top-right
]
```

Two triangles forming a rectangle covering the entire NDC space. This is the standard "full-screen quad" pattern for shader effects — every pixel in the final image will be processed by the fragment shader exactly once. No normals, no UVs — just positions.

**Not `PlaneGeometry`?** `THREE.PlaneGeometry` would work too but requires knowing the camera setup to fill the screen correctly. Explicit NDC coordinates are more direct — no math required to figure out the right plane size.

**`RawShaderMaterial` vs `ShaderMaterial`:**
- `ShaderMaterial`: Three.js injects `#include <common>`, `uniform mat4 modelMatrix`, `in vec3 position` (WebGL2), etc. Easier to use but harder to understand exactly what's in scope.
- `RawShaderMaterial`: Bare GLSL. Nothing injected. You declare everything. Requires `attribute vec3 position` explicitly. Perfect when you want to understand exactly what the GPU receives.

---

### The Fragment Shader — Math Deep Dive

#### Coordinate Normalization

```glsl
vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
```

`gl_FragCoord.xy` is in pixels: `(0,0)` at bottom-left, `(width, height)` at top-right.

The transformation:
1. `* 2.0`: expands range to `[0, 2*width]`
2. `- resolution`: centers at origin, range `[-width, width]`
3. `/ min(...)`: normalizes so the shorter axis spans `[-1, 1]`

Result on 1920×1080:
- `p.x` spans `[-1.78, 1.78]` (wider because width > height)
- `p.y` spans `[-1, 1]` (normalized to 1 because height is smaller)

This is aspect-ratio-correct coordinate space. Drawing a circle with `length(p) < r` gives an actual circle, not an ellipse.

#### Chromatic Aberration

```glsl
float d = length(p) * distortion;
float rx = p.x * (1.0 + d);
float gx = p.x;
float bx = p.x * (1.0 - d);
```

`length(p)` is distance from center (0 at center, ~1.78 at far corners). Multiplied by `distortion` (0.05 by default), this gives a small offset factor that grows outward.

The three channels use different x positions:
- Red: scaled outward by `(1 + d)` — at edge, rx is ~5% further right than center
- Green: unscaled — reference channel
- Blue: scaled inward by `(1 - d)` — at edge, bx is ~5% to the left of red

This models real optical chromatic aberration: different wavelengths of light refract at slightly different angles through a lens. Red (longer wavelength) bends less; blue (shorter) bends more. At the center (d=0), all three channels overlap perfectly. Toward the edges, they separate.

#### The `1/|y + sin(x)|` Formula

```glsl
float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
```

This is the wave brightness function. Breaking it down:

`sin((rx + time) * xScale) * yScale` — a sine wave at x-position `rx`, animated by `time`, with frequency `xScale` and amplitude `yScale`.

`p.y + sin(...)` — how far the current pixel is from the wave's y-position. At the wave, this is 0. Above or below, it grows.

`abs(...)` — makes brightness symmetric above and below the wave line.

`0.05 / abs(...)` — as the pixel approaches the wave (`abs → 0`), brightness approaches infinity. Far from the wave, brightness approaches 0. This creates a bright line (the wave) that glows outward with falloff.

The `0.05` numerator controls the "thickness" of the glow: 0.05 means the function crosses ~1.0 brightness at y-offset 0.05 from the wave. Smaller numerator = thinner, sharper line.

This same formula applied to three slightly different x positions (rx, gx, bx) creates three offset waves — one per color channel — that separate more at the edges due to the chromatic aberration displacement.

---

### The rAF Loop — Time Uniform Updates

```tsx
const animate = () => {
  if (refs.uniforms) refs.uniforms.time.value += 0.01
  refs.animationId = requestAnimationFrame(animate)
}
```

`+= 0.01 per frame` at 60fps = `+0.6 units/second`. The sine argument is `(x + time) * xScale`, so time shifts the phase of the sine wave — scrolling it horizontally at a rate of `0.6 * xScale` units/second.

**Framerate dependency:** This is a fixed increment, so the animation runs 50% faster on a 90Hz monitor. For framerate-independent animation:
```tsx
let last = performance.now()
const animate = () => {
  const now = performance.now()
  const dt = (now - last) / 1000
  last = now
  refs.uniforms.time.value += dt * 0.6  // 0.6 units/sec regardless of framerate
  ...
}
```
For a decorative background, the fixed increment is fine.

---

### Cleanup — GPU Memory Management

```tsx
return () => {
  if (refs.animationId) cancelAnimationFrame(refs.animationId)
  window.removeEventListener("resize", handleResize)
  if (refs.mesh) {
    refs.scene?.remove(refs.mesh)
    refs.mesh.geometry.dispose()
    if (refs.mesh.material instanceof THREE.Material) {
      refs.mesh.material.dispose()
    }
  }
  refs.renderer?.dispose()
}
```

Three.js resources live on the GPU. React doesn't know about them — garbage collection won't free GPU memory when the component unmounts. Manual disposal required:

- `cancelAnimationFrame`: stops the rAF loop. Without this, the loop continues after unmount, calling `.render()` on a disposed renderer → error.
- `geometry.dispose()`: frees the vertex buffer (the Float32Array uploaded to GPU).
- `material.dispose()`: frees the compiled GLSL shader program + any textures.
- `renderer.dispose()`: releases the WebGL context. Browsers limit active contexts per page (~16). Failing to dispose causes `"Too many active WebGL contexts"` errors after enough mounts/unmounts.

**The `instanceof THREE.Material` check:** `mesh.material` can be `Material | Material[]`. The check handles the single-material case. For multi-material meshes, loop over the array.

---

## LiquidButton: Architecture Overview

### Three-Layer Z-Index Stack

```
z-10  │  Content (children)           ← what user reads
 z-0  │  Shadow overlay div           ← glass rim / edge refraction
-z-10 │  Backdrop distortion div      ← the actual glass effect (what's behind)
```

The button element itself is `position: relative` (the stacking context root). Children use absolute positioning to fill the button area.

### Layer 1: The Multi-Shadow Glass Rim

```tsx
shadow-[0_0_6px_rgba(0,0,0,0.03),
        0_2px_6px_rgba(0,0,0,0.08),
        inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),
        inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),
        inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),
        inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),
        inset_0_0_6px_6px_rgba(0,0,0,0.12),
        inset_0_0_2px_2px_rgba(0,0,0,0.06),
        0_0_12px_rgba(255,255,255,0.15)]
```

Nine shadows on one element. Decoded:

**Outer shadows (real light/depth):**
- `0 0 6px rgba(0,0,0,0.03)` — ambient haze, barely visible
- `0 2px 6px rgba(0,0,0,0.08)` — soft drop shadow (button floating above surface)
- `0 0 12px rgba(255,255,255,0.15)` — outer white halo (glass refracting ambient light)

**Inset shadows (glass edge simulation):**
- `inset 3px 3px 0.5px -3px rgba(0,0,0,0.9)` — top-left edge catch shadow (strong, thin due to negative spread)
- `inset -3px -3px 0.5px -3px rgba(0,0,0,0.85)` — bottom-right edge (same technique, opposite corner)
- `inset 1px 1px 1px -0.5px rgba(0,0,0,0.6)` — secondary top-left softening
- `inset -1px -1px 1px -0.5px rgba(0,0,0,0.6)` — secondary bottom-right softening
- `inset 0 0 6px 6px rgba(0,0,0,0.12)` — inner diffuse glow (center of glass is slightly darker)
- `inset 0 0 2px 2px rgba(0,0,0,0.06)` — tight inner glow, slightly less

**Dark mode inverts the logic:** All `rgba(0,0,0,...)` become `rgba(255,255,255,...)` and vice versa. The glass rim reads as light on dark UI.

**The negative spread trick:** `inset 3px 3px 0.5px -3px` — offset=3px, blur=0.5px, spread=-3px. Negative spread shrinks the shadow until it only shows where the offset pushed it. Creates a thin, bright edge line at the corner rather than a full-face inset shadow. This is how you simulate the beveled edge of thick glass.

### Layer 2: SVG Backdrop Distortion

```tsx
style={{ backdropFilter: 'url("#container-glass")' }}
```

CSS `backdropFilter` applies a visual effect to the content BEHIND the element. Standard values: `blur(8px)`, `brightness(0.8)`. But you can also reference an SVG filter by ID — this is what enables the distortion (not just blur).

**Why this is non-obvious:** Most glass-morphism effects use `backdrop-filter: blur(X)`. This button goes further — it displaces the backdrop pixels using fractal noise before blurring, creating actual liquid distortion rather than just frosted glass.

**Browser support:** `backdropFilter` with SVG filter ID has mixed support. Chromium-based browsers support it. Firefox support is limited. Gracefully degrades to no effect (button still looks good, just without the distortion).

**`isolate` on the backdrop div:** Creates a new stacking context. Without `isolate`, the `-z-10` would be relative to the page root rather than the button — potentially placing the backdrop below page background elements.

**`overflow-hidden` on the backdrop div:** The SVG filter displaces pixels outside the button's bounds. `overflow-hidden` clips this spillage so distortion doesn't show outside the button shape.

### The SVG Filter Pipeline

```
feTurbulence → feGaussianBlur → feDisplacementMap → feGaussianBlur → feComposite
```

**`feTurbulence`** (baseFrequency=0.05, numOctaves=1): Generates Perlin-like fractal noise. `baseFrequency=0.05` means one full noise cycle every 20 pixels — large, slow turbulence. `numOctaves=1` = smooth, single-frequency noise (no fine detail).

**First `feGaussianBlur`** (stdDeviation=2): Smooths the noise so displacement has gradual transitions. Without this, the displacement would have sharp edges — looking jagged rather than liquid.

**`feDisplacementMap`** (scale=70): The distortion step. For each pixel in the source, reads the noise map and moves the pixel by `noise * scale` in x and y. `scale=70` means pixels can move up to 70px from their original position. This is the "liquid" part — the backdrop pixels slosh around according to the noise map.

`xChannelSelector="R"` and `yChannelSelector="B"`: Use the Red channel to drive horizontal displacement, Blue for vertical. R and B are decorrelated in fractal noise, giving natural-looking 2D displacement.

**Second `feGaussianBlur`** (stdDeviation=4): Applies frosted glass blur to the displaced result. The combination of displacement + blur = liquid glass. Displacement alone = fun-house mirror. Blur alone = regular frosted glass. Together = realistic liquid glass.

**`feComposite operator="over"`**: Composites the result with itself — effectively a pass-through. Used to explicitly close the filter output. Some browser implementations require a terminal `feComposite` to finalize the result correctly.

---

## Design Principles to Extract

1. **Single object `useRef` for coupled mutable state** — bundle all Three.js objects (`scene, camera, renderer, mesh, uniforms, animationId`) into one ref. Cleaner than 6 separate refs. Signals "these are a group."

2. **`THREE.WebGLRenderer({ canvas })` — adopt an existing canvas** — always pass React's ref canvas to Three.js rather than letting Three.js create one. Prevents DOM detachment issues.

3. **`renderer.setSize(w, h, false)` — never let Three.js set inline styles** — the `false` flag is required when Tailwind (or any CSS class) controls canvas layout. Without it, `w-full h-full` is overridden by inline px values.

4. **`OrthographicCamera(-1,1,1,-1,0,-1)` for 2D shader quads** — the identity mapping camera. Vertices in NDC fill the screen perfectly. No perspective distortion. The correct camera for any full-screen effect.

5. **`RawShaderMaterial` for explicit GLSL control** — no Three.js injection magic. Requires explicit `attribute` declarations. Use when you want full understanding of what runs on the GPU.

6. **Full-screen quad = 6 vertex NDC positions** — two triangles at `(±1, ±1, 0)`. The universal pattern for "run this shader on every pixel."

7. **Aspect-ratio-correct shader coordinates** — `(fragCoord * 2 - resolution) / min(resolution.x, resolution.y)` centers and normalizes coordinates so circles are circles regardless of viewport aspect ratio.

8. **Chromatic aberration = per-channel x offset scaled by center distance** — `rx = p.x * (1 + dist * amount)`. At center: no split. At edges: channels separate. Models real lens physics.

9. **`1/|y - sine|` for wave glow** — brightness spikes at the wave position, falls off with distance. The numerator controls glow thickness. Works for any procedural "bright line" effect.

10. **GPU resource cleanup is mandatory** — `geometry.dispose()`, `material.dispose()`, `renderer.dispose()`, `cancelAnimationFrame`. React GC never handles GPU memory. Omitting cleanup causes WebGL context exhaustion.

11. **`renderer.setPixelRatio(devicePixelRatio)`** — always set for Retina/HiDPI displays. Without it, WebGL renders at 1x and gets CSS-scaled → blurry shader.

12. **Three-layer button z-index stack** — content (z-10) / shadow overlay (z-0) / backdrop effect (-z-10). The glass shadow and the backdrop distortion must be separate elements because one is above content and one is below the button background.

13. **Negative spread for thin edge shadows** — `inset 3px 3px 0.5px -3px` creates a bright edge line at one corner only. Negative spread cancels the blur spread everywhere except where offset pushed it. The technique for simulating beveled glass edges.

14. **`backdropFilter: url("#svg-filter-id")` — SVG filters for backdrop effects** — not just `blur()`. Any SVG filter pipeline (turbulence, displacement, composite) can be applied to the backdrop. Enables liquid distortion that `blur()` alone cannot achieve.

15. **SVG `feDisplacementMap` pipeline for liquid glass** — Turbulence → smooth noise → displace backdrop pixels → blur displaced result. The ordering matters: displacement before blur creates liquid look. Blur before displacement would just smear then warp.

16. **`isolate` for z-index relative stacking** — `isolate` creates a new stacking context. Children with negative z-index are relative to the isolated ancestor, not the page root.

17. **`overflow-hidden` on backdrop distortion div** — SVG displacement pushes pixels outside element bounds. Clip them to maintain button shape.

18. **GlassFilter as a co-located SVG** — the filter SVG definition travels with the button component. Pragmatic for demos; for production with multiple buttons, hoist to layout root to avoid duplicate filter IDs in the DOM.

19. **`pointer-events-none` on content wrapper** — prevents the inner `z-10` div from intercepting click events. The button element handles all interaction.

20. **`hover:scale-105 duration-300`** — the subtle scale on hover is the only interaction feedback for LiquidButton. The glass effect is the dominant visual; the scale confirms it's interactive without competing.

---

## AetherTrace Adaptation

### The "Sealing Event" Background

The WebGL chromatic shader is exactly right for AetherTrace's evidence sealing moment — the UI state when a custody package is being finalized. The sinusoidal RGB split reads as "data being written" — information flowing through the system. The chromatic aberration creates a sense of energy.

**Shader uniform adjustments for AetherTrace:**
```tsx
refs.uniforms = {
  resolution: { value: [w, h] },
  time: { value: 0.0 },
  xScale: { value: 0.7 },      // slower wave frequency (more deliberate)
  yScale: { value: 0.3 },      // lower amplitude (tighter wave, more precision)
  distortion: { value: 0.03 }, // subtle aberration (not chaotic, controlled)
}
```

**Color interpretation:** The red/green/blue sine separation maps well to AetherTrace's verification stages:
- Single green channel visible = hash computed
- Green + blue converging = chain linked
- All three aligned = sealed

This could be driven by animating the `distortion` uniform from high → low over a 3-second sealing sequence.

### The "Verify" CTA

LiquidButton fits perfectly on top of the shader background. The liquid glass effect requires interesting content behind it to be visible — the shader provides exactly that. The button distorting the wave pattern underneath it is a literal metaphor for AetherTrace: the protocol as a transparent layer that reveals, but doesn't alter, what's underneath.

```tsx
// AetherTrace "Seal Evidence" CTA on shader background
<div className="relative flex flex-col items-center justify-center min-h-screen">
  <WebGLShader />
  <div className="relative z-10 flex flex-col items-center gap-8">
    <div className="text-center">
      <p className="text-teal-400 text-sm tracking-widest uppercase mb-2">
        Chain ID: 7a3f9b2c...
      </p>
      <h1 className="text-white text-5xl font-bold tracking-tight">
        Ready to Seal
      </h1>
      <p className="text-white/50 mt-2">
        14 evidence items • SHA-256 verified
      </p>
    </div>
    <LiquidButton
      className="text-teal-300 border border-teal-500/40 rounded-full"
      size="xl"
    >
      Seal Package
    </LiquidButton>
  </div>
</div>
```

### Hash Animation Idea

Drive the `distortion` uniform from JavaScript to animate the chromatic aberration during the hashing process:

```tsx
// In the rAF loop during a "sealing" state:
// distortion ramps from 0.15 (active) down to 0.005 (settled/sealed)
const targetDistortion = isSealing ? 0.15 : 0.005
refs.uniforms.distortion.value += (targetDistortion - refs.uniforms.distortion.value) * 0.05
// lerp toward target — smooth transition, no snapping
```

Visual narrative: chromatic chaos while hashing, channels converging as the seal completes. The physics of light alignment as a metaphor for cryptographic finality.

---

## Raw Code Reference
See: `015-webgl-chromatic-shader-code.tsx`
