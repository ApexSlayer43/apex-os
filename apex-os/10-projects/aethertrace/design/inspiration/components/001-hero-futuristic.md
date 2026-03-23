# 001 — Hero Futuristic (3D WebGPU)

**Source:** 21st.dev
**Type:** Hero section / Full-screen immersive
**Stack:** React, Three.js (WebGPU renderer), @react-three/fiber, @react-three/drei, Tailwind CSS, TypeScript
**Dependencies:** three, @react-three/fiber, @react-three/drei

## What Makes This Hit

### Visual Impact
- **3D abstract organic form** on pure black background — NOT a flat hero, not a gradient, not a static image. A living, breathing 3D object.
- **Red scanning line effect** sweeps vertically across the scene (sinusoidal oscillation) — creates the feeling of something being analyzed/revealed
- **Bloom post-processing** — the glow bleeds light past object edges, creating cinematic depth
- **Depth map parallax** — the 3D form responds to mouse pointer position, creating subtle parallax that rewards interaction
- **Halftone dot pattern** — cell noise creates a dot matrix overlay that flows across the surface, revealing red scan lines beneath

### Typography & Animation
- **Word-by-word title reveal** — "BUILD YOUR DREAMS" appears one word at a time with 600ms stagger + random glitch delays (0-70ms jitter per word)
- **Uppercase, extrabold, massive scale** — text-3xl to text-7xl responsive, font-extrabold
- **Subtitle fade-in** — appears 800ms after title completes, separate animation
- **"Scroll to explore" CTA** — bottom-positioned button with animated down arrow, delayed appearance (2.2s)

### Technical Techniques
- **WebGPU Renderer** — not WebGL. Uses THREE.WebGPURenderer with async init. This is cutting-edge browser rendering.
- **TSL (Three Shading Language)** — shader nodes built in JavaScript: `texture()`, `uniform()`, `uv()`, `smoothstep()`, `blendScreen()`, `mix()`, `add()`. No GLSL strings.
- **Post-processing pipeline:** scene pass → bloom pass → scan line effect → red overlay → final composite
- **Depth-based flow effect:** `oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))))` creates a flowing reveal that follows depth contours
- **Cell noise dot grid:** `mx_cell_noise_float(tUv.mul(tiling).div(2))` with 120x tiling creates the halftone pattern
- **Fade-in on texture load:** mesh starts at opacity 0, lerps to 1 at 0.07 rate after textures are confirmed loaded

### Design Principles to Extract
1. **Black background + single dramatic 3D element = instant premium feel**
2. **Post-processing (bloom, scan lines) adds cinematic quality that CSS can't touch**
3. **Mouse-reactive elements make the page feel alive without requiring user action**
4. **Staggered text reveal with micro-random delays creates organic feel (not mechanical)**
5. **The scan line is simple (sin wave oscillation) but the visual impact is massive**
6. **Depth maps turn 2D textures into pseudo-3D — cheaper than full 3D modeling**

### Key CSS Classes
- `h-svh` — full viewport height
- `z-60` — high z-index for text overlay above canvas
- `pointer-events-none` — text doesn't block 3D interaction
- `fade-in` / `fade-in-subtitle` — custom CSS animations (not defined in component, needs global CSS)
- `explore-btn` — custom styled button class

### Adaptation Notes
- The 3D form texture + depth map are external images (postimg.cc URLs) — swap these for any subject
- Red scan line color is hardcoded `vec3(1, 0, 0)` — change RGB values for different scan colors
- Scale factor (0.40) controls how much of the viewport the 3D form occupies
- Bloom strength/threshold are props — adjustable per use case
- `fullScreenEffect` prop toggles whether scan line affects whole screen or just the object

## Raw Code Reference
See: `001-hero-futuristic-code.tsx` (both hero-futuristic.tsx and demo.tsx variants)
