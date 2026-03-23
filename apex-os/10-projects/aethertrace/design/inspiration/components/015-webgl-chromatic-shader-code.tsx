// SOURCE: 21st.dev — WebGL Chromatic Aberration Shader + Liquid Glass Button
// DEPS: three, @radix-ui/react-slot, class-variance-authority
// STACK: React + Three.js (r128+) + Tailwind CSS + TypeScript
// INSTALL: npm install three @types/three @radix-ui/react-slot class-variance-authority
// FILES:
//   /components/ui/web-gl-shader.tsx     ← WebGLShader (this section)
//   /components/ui/liquid-glass-button.tsx ← LiquidButton (second section)
//   /app/page.tsx or demo                ← DemoOne usage

// ─────────────────────────────────────────────────────────────────────────────
// PART 1: WebGLShader
// ─────────────────────────────────────────────────────────────────────────────
// A full-screen WebGL canvas rendering a chromatic aberration sine wave.
// Uses Three.js as the WebGL abstraction layer. The visual is a sinusoidal
// wave rendered separately for R, G, B channels with a lateral offset based
// on distance from center — creating a prismatic color split effect.

"use client"
import { useEffect, useRef } from "react"
import * as THREE from "three"

export function WebGLShader() {
  // canvasRef: the DOM canvas element that Three.js will render to.
  // We hand this directly to THREE.WebGLRenderer({ canvas }) so Three.js
  // renders into our React-managed canvas rather than creating its own.
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // sceneRef: bundles ALL Three.js mutable state into a single object ref.
  // WHY NOT multiple useState/useRef? Three.js objects are not React state —
  // they should never trigger re-renders. A single object ref avoids 6
  // separate useRef declarations and keeps related state co-located.
  // WHY useRef not useState? Three.js object mutations (time += 0.01 per frame)
  // must not trigger React re-renders. useRef is the correct container.
  const sceneRef = useRef<{
    scene: THREE.Scene | null
    camera: THREE.OrthographicCamera | null
    renderer: THREE.WebGLRenderer | null
    mesh: THREE.Mesh | null
    uniforms: any           // any: THREE.IUniform is overly strict for this pattern
    animationId: number | null
  }>({
    scene: null,
    camera: null,
    renderer: null,
    mesh: null,
    uniforms: null,
    animationId: null,
  })

  useEffect(() => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const { current: refs } = sceneRef  // destructure for cleaner access inside closures

    // ── GLSL Vertex Shader ──────────────────────────────────────────────────
    // The simplest possible vertex shader: pass-through for a full-screen quad.
    // attribute vec3 position: the geometry's vertex positions (three.js BufferAttribute).
    // gl_Position = vec4(position, 1.0): writes clip-space position directly.
    // No MVP matrix multiplication needed because the quad is already defined
    // in NDC (Normalized Device Coordinates): x ∈ [-1, 1], y ∈ [-1, 1].
    // Note: RawShaderMaterial requires explicit "attribute" declaration.
    // ShaderMaterial would inject these automatically; RawShaderMaterial does not.
    const vertexShader = `
      attribute vec3 position;
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `

    // ── GLSL Fragment Shader ────────────────────────────────────────────────
    // The actual visual effect. Runs once per pixel.
    //
    // UNIFORMS (JavaScript → GLSL):
    //   resolution: vec2 — canvas size in pixels (for aspect-correct coordinate mapping)
    //   time: float      — elapsed time (incremented 0.01/frame in animate())
    //   xScale: float    — frequency of the sine wave (waves per unit)
    //   yScale: float    — amplitude of the sine wave (vertical displacement)
    //   distortion: float — chromatic aberration strength (channel separation)
    //
    // COORDINATE SYSTEM SETUP:
    //   vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y)
    //   Transforms pixel coordinates to:
    //   - Center origin (0,0 at screen center)
    //   - Uniform scale (1 unit = min(width, height) / 2 px)
    //   - Range: ~[-1.78, 1.78] horizontal on widescreen, [-1, 1] vertical
    //
    // CHROMATIC ABERRATION:
    //   float d = length(p) * distortion
    //   d scales with distance from center. At center d=0, at edges d=max.
    //   The three channels get different x positions:
    //   rx = p.x * (1.0 + d)   ← red pushed outward
    //   gx = p.x               ← green unchanged (reference channel)
    //   bx = p.x * (1.0 - d)   ← blue pushed inward
    //   This mimics real lens chromatic aberration: red bends less than blue.
    //
    // SINE WAVE BRIGHTNESS (1/|y + sin(x)| formula):
    //   r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale)
    //   This creates a bright line wherever p.y ≈ -sin((rx+time)*xScale)*yScale.
    //   As the pixel approaches the sine curve, abs(denominator) → 0, brightness → ∞.
    //   The 0.05 numerator controls the "thickness" of the glow — smaller = thinner.
    //   The abs() ensures brightness above and below the curve (bidirectional glow).
    //   time shifts the sine argument → the wave scrolls horizontally over time.
    const fragmentShader = `
      precision highp float;
      uniform vec2 resolution;
      uniform float time;
      uniform float xScale;
      uniform float yScale;
      uniform float distortion;
      void main() {
        // Map pixel coordinates to centered, aspect-normalized space
        vec2 p = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

        // Chromatic aberration factor: grows with distance from center
        float d = length(p) * distortion;

        // Per-channel x positions (red out, green neutral, blue in)
        float rx = p.x * (1.0 + d);
        float gx = p.x;
        float bx = p.x * (1.0 - d);

        // 1/|y - sine| — bright where pixel is near the sine curve for each channel
        float r = 0.05 / abs(p.y + sin((rx + time) * xScale) * yScale);
        float g = 0.05 / abs(p.y + sin((gx + time) * xScale) * yScale);
        float b = 0.05 / abs(p.y + sin((bx + time) * xScale) * yScale);

        gl_FragColor = vec4(r, g, b, 1.0);
      }
    `

    const initScene = () => {
      refs.scene = new THREE.Scene()

      // WebGLRenderer receives our canvas — no new DOM element created.
      // Three.js will call canvas.getContext("webgl") internally.
      refs.renderer = new THREE.WebGLRenderer({ canvas })
      refs.renderer.setPixelRatio(window.devicePixelRatio)  // sharp on retina
      refs.renderer.setClearColor(new THREE.Color(0x000000))

      // OrthographicCamera(-1, 1, 1, -1, 0, -1):
      // Left=-1, Right=1, Top=1, Bottom=-1 — maps exactly to NDC space.
      // Near=0, Far=-1 (or any values, irrelevant for a flat 2D quad).
      // Because the quad vertices are in NDC and the camera maps [-1,1] to
      // the viewport, the quad fills the entire canvas regardless of resolution.
      // No perspective divide, no view frustum — pure 2D full-screen rendering.
      refs.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, -1)

      // Uniforms: the data bridge between JavaScript and the GLSL shader.
      // Each uniform must be { value: T } — Three.js unwraps this in the
      // RawShaderMaterial uniform binding process.
      refs.uniforms = {
        resolution: { value: [window.innerWidth, window.innerHeight] },
        time: { value: 0.0 },       // animation clock
        xScale: { value: 1.0 },     // wave frequency
        yScale: { value: 0.5 },     // wave amplitude
        distortion: { value: 0.05 },// chromatic aberration amount
      }

      // Full-screen quad geometry: two triangles covering NDC space.
      // Triangle 1: bottom-left, bottom-right, top-left
      // Triangle 2: bottom-right, top-left, top-right
      // Together they form a rectangle covering x ∈ [-1,1], y ∈ [-1,1].
      const position = [
        -1.0, -1.0, 0.0,   // bottom-left
         1.0, -1.0, 0.0,   // bottom-right
        -1.0,  1.0, 0.0,   // top-left
         1.0, -1.0, 0.0,   // bottom-right (shared edge)
        -1.0,  1.0, 0.0,   // top-left (shared edge)
         1.0,  1.0, 0.0,   // top-right
      ]
      const positions = new THREE.BufferAttribute(new Float32Array(position), 3)
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute("position", positions)

      // RawShaderMaterial vs ShaderMaterial:
      // ShaderMaterial automatically injects Three.js GLSL uniforms and
      // attributes (#include <common>, modelMatrix, etc.).
      // RawShaderMaterial is bare metal — only what you declare exists.
      // Required here because the vertex shader uses "attribute vec3 position"
      // explicitly instead of Three.js's injected "in vec3 position" (WebGL2).
      // Use RawShaderMaterial when you want full GLSL control with no magic injection.
      const material = new THREE.RawShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: refs.uniforms,
        side: THREE.DoubleSide,  // render both faces — prevents culling issues
      })

      refs.mesh = new THREE.Mesh(geometry, material)
      refs.scene.add(refs.mesh)

      handleResize()  // set correct initial renderer size
    }

    // animate: the rAF loop. Runs at native display refresh rate (60/90/120 Hz).
    // Increments time uniform by 0.01 per frame → wave scrolls at ~0.6 units/sec at 60fps.
    // To control speed independently of framerate, use a delta time approach:
    //   const now = performance.now(); const dt = (now - last) / 1000; last = now;
    //   refs.uniforms.time.value += dt * speed;
    // This component keeps it simple with fixed increment — fine for decorative BGs.
    const animate = () => {
      if (refs.uniforms) refs.uniforms.time.value += 0.01
      if (refs.renderer && refs.scene && refs.camera) {
        refs.renderer.render(refs.scene, refs.camera)
      }
      refs.animationId = requestAnimationFrame(animate)
    }

    // handleResize: updates renderer pixel dimensions and resolution uniform.
    // renderer.setSize(width, height, false): the `false` parameter prevents
    // Three.js from setting canvas.style.width/height to px values. We want
    // Tailwind's "w-full h-full" to control layout — not inline styles.
    // If updateStyle=true (default), Three.js injects style="width:Xpx;height:Ypx"
    // which overrides Tailwind CSS and makes the canvas a fixed px size.
    const handleResize = () => {
      if (!refs.renderer || !refs.uniforms) return
      const width = window.innerWidth
      const height = window.innerHeight
      refs.renderer.setSize(width, height, false)  // false = don't set style
      refs.uniforms.resolution.value = [width, height]
    }

    initScene()
    animate()
    window.addEventListener("resize", handleResize)

    // Cleanup: runs when component unmounts.
    // Three.js resources are not garbage-collected by React — they must be
    // explicitly disposed to free GPU memory. Missing cleanup causes:
    // - WebGL context leak (browsers have a limit of ~16 contexts per tab)
    // - GPU memory retention even after component is removed from DOM
    // - Orphaned rAF loop continuing to run after unmount (CPU waste)
    return () => {
      if (refs.animationId) cancelAnimationFrame(refs.animationId)  // stop rAF loop
      window.removeEventListener("resize", handleResize)
      if (refs.mesh) {
        refs.scene?.remove(refs.mesh)
        refs.mesh.geometry.dispose()            // GPU buffer memory
        if (refs.mesh.material instanceof THREE.Material) {
          refs.mesh.material.dispose()          // GPU shader program + texture memory
        }
      }
      refs.renderer?.dispose()                  // WebGL context itself
    }
  }, [])  // empty deps: run once on mount, cleanup on unmount

  // Fixed position canvas — renders behind all other content.
  // z-index is not set here; the stacking context is controlled by the
  // parent container (demo uses relative + z-index on children to layer above).
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full block"
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PART 2: LiquidButton
// ─────────────────────────────────────────────────────────────────────────────
// A glass-morphism button that distorts its backdrop using an SVG filter.
// Three-layer z-index stack:
//   Layer 1 (z-0):  box-shadow overlay — the multi-layered inset shadow creating
//                   the glass edge / refraction rim effect
//   Layer 2 (-z-10): backdrop div with backdropFilter: url("#container-glass")
//                   — reads pixels behind the button and distorts them
//   Layer 3 (z-10): content (children)
//
// The SVG filter (GlassFilter component) defines the distortion math.
// It lives hidden in the DOM as <svg class="hidden">, referenced by ID.

"use client"
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Standard shadcn Button — included as base primitive.
// LiquidButton is a separate component, not a variant of Button.
const buttonVariants = cva(
  "inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-primary-foreground hover:bg-destructive/90",
        cool: "dark:inset-shadow-2xs dark:inset-shadow-white/10 bg-linear-to-t border border-b-2 border-zinc-950/40 from-primary to-primary/85 shadow-md shadow-primary/20 ring-1 ring-inset ring-white/25 transition-[filter] duration-200 hover:brightness-110 active:brightness-90 dark:border-x-0 text-primary-foreground dark:text-primary-foreground dark:border-t-0 dark:border-primary/50 dark:ring-white/5",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// ── liquidbuttonVariants ────────────────────────────────────────────────────
// The LiquidButton's CVA definition. Default variant is "default" (bg-transparent)
// because the visual treatment is entirely in the box-shadow layers and the
// SVG backdrop filter — not in a background color.
// The `xl` and `xxl` sizes exist specifically for hero/CTA button usage.
const liquidbuttonVariants = cva(
  "inline-flex items-center transition-colors justify-center cursor-pointer gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        // default: transparent BG — the glass effect IS the visual
        default: "bg-transparent hover:scale-105 duration-300 transition text-primary",
        destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 text-xs gap-1.5 px-4 has-[>svg]:px-4",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-md px-8 has-[>svg]:px-6",
        xxl: "h-14 rounded-md px-10 has-[>svg]:px-8",
        icon: "size-9",
      },
    },
    defaultVariants: { variant: "default", size: "xxl" },
  }
)

function LiquidButton({
  className,
  variant,
  size,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof liquidbuttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(
        "relative",  // establishes stacking context for absolute children
        liquidbuttonVariants({ variant, size, className })
      )}
      {...props}
    >
      {/* ── Layer 1: Glass rim / shadow overlay (z-0) ── */}
      {/* This div renders the physical-glass illusion via box-shadow. */}
      {/* It has NO background — it's pure shadow. The shadows create: */}
      {/*   - Inset shadows for the glass edge refraction rim           */}
      {/*   - Outer diffuse shadow for depth below the button           */}
      {/*   - Inner bloom shadows for the frosted-glass glow            */}
      {/*                                                               */}
      {/* Two shadow sets via dark: prefix — light mode and dark mode   */}
      {/* each need different shadow colors (rgba black vs rgba white). */}
      {/*                                                               */}
      {/* Light mode key shadows (decoded):                             */}
      {/*   inset 3px 3px 0.5px -3px rgba(0,0,0,0.9)   ← top-left rim */}
      {/*   inset -3px -3px 0.5px -3px rgba(0,0,0,0.85) ← bottom-right */}
      {/*   inset 1px 1px 1px -0.5px rgba(0,0,0,0.6)   ← soft inner rim*/}
      {/*   inset 0 0 6px 6px rgba(0,0,0,0.12)          ← inner glow    */}
      {/*   0 0 12px rgba(255,255,255,0.15)              ← outer halo    */}
      <div className="absolute top-0 left-0 z-0 h-full w-full rounded-full
          shadow-[0_0_6px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3px_rgba(0,0,0,0.9),inset_-3px_-3px_0.5px_-3px_rgba(0,0,0,0.85),inset_1px_1px_1px_-0.5px_rgba(0,0,0,0.6),inset_-1px_-1px_1px_-0.5px_rgba(0,0,0,0.6),inset_0_0_6px_6px_rgba(0,0,0,0.12),inset_0_0_2px_2px_rgba(0,0,0,0.06),0_0_12px_rgba(255,255,255,0.15)]
      transition-all
      dark:shadow-[0_0_8px_rgba(0,0,0,0.03),0_2px_6px_rgba(0,0,0,0.08),inset_3px_3px_0.5px_-3.5px_rgba(255,255,255,0.09),inset_-3px_-3px_0.5px_-3.5px_rgba(255,255,255,0.85),inset_1px_1px_1px_-0.5px_rgba(255,255,255,0.6),inset_-1px_-1px_1px_-0.5px_rgba(255,255,255,0.6),inset_0_0_6px_6px_rgba(255,255,255,0.12),inset_0_0_2px_2px_rgba(255,255,255,0.06),0_0_12px_rgba(0,0,0,0.15)]" />

      {/* ── Layer 2: Backdrop distortion (-z-10) ── */}
      {/* backdropFilter: url("#container-glass") — references the hidden SVG  */}
      {/* filter defined in GlassFilter below. The filter runs:                */}
      {/*   1. feTurbulence → generates fractal noise map                      */}
      {/*   2. feGaussianBlur → smooths the noise                             */}
      {/*   3. feDisplacementMap → warps the backdrop pixels using noise       */}
      {/*   4. feGaussianBlur → applies final frosted-glass blur              */}
      {/* The CSS `backdropFilter` applies this to what's BEHIND the element,  */}
      {/* not the element itself. -z-10 places this below even the button bg.  */}
      {/* `isolate` on the div ensures it creates its own stacking context     */}
      {/* so the -z-10 is relative to the button, not the page root.          */}
      {/* overflow-hidden clips the distorted backdrop to the button shape.   */}
      <div
        className="absolute top-0 left-0 isolate -z-10 h-full w-full overflow-hidden rounded-md"
        style={{ backdropFilter: 'url("#container-glass")' }}
      />

      {/* ── Layer 3: Content (z-10) ── */}
      {/* pointer-events-none: the content div itself shouldn't intercept     */}
      {/* click events — the button element does. Without this, clicking on   */}
      {/* the text inside would hit the inner div before bubbling to button.  */}
      <div className="pointer-events-none z-10">
        {children}
      </div>

      {/* GlassFilter: hidden SVG defining the backdrop distortion filter.    */}
      {/* Must be in the DOM to be referenced by url("#container-glass").     */}
      {/* Rendered inside the button so it travels with the component.        */}
      {/* In a real app, render GlassFilter once at layout root level to      */}
      {/* avoid duplicate SVG filter definitions when multiple buttons exist.  */}
      <GlassFilter />
    </Comp>
  )
}

// ── GlassFilter ──────────────────────────────────────────────────────────────
// Hidden SVG containing the backdrop distortion filter definition.
// Referenced by backdropFilter: url("#container-glass") in LiquidButton.
//
// FILTER PIPELINE (read top to bottom):
//
// 1. feTurbulence (type="fractalNoise", baseFrequency="0.05 0.05", numOctaves=1)
//    Generates a smooth fractal noise texture. baseFrequency=0.05 creates large,
//    slow turbulence (lower = larger blobs). numOctaves=1 keeps it simple.
//    type="fractalNoise" produces smooth gradients (vs "turbulence" which is spiky).
//    Output: noise image → "turbulence"
//
// 2. feGaussianBlur (stdDeviation=2)
//    Smooths the noise pattern further. Prevents harsh edges in the displacement.
//    Output: blurred noise → "blurredNoise"
//
// 3. feDisplacementMap (in="SourceGraphic", in2="blurredNoise", scale=70)
//    The key step. Takes the original backdrop (SourceGraphic) and uses the
//    noise map to move each pixel. R channel moves pixels horizontally,
//    B channel moves pixels vertically (xChannelSelector, yChannelSelector).
//    scale=70: each pixel displaced up to 70px — creates the liquid distortion.
//    Higher scale = more distortion (more "drunk glass" effect).
//    Output: displaced backdrop → "displaced"
//
// 4. feGaussianBlur (stdDeviation=4)
//    Final blur applied to the displaced image. This creates the frosted glass
//    look — the displaced backdrop is blurry, not just warped.
//    Output: blurred displaced → "finalBlur"
//
// 5. feComposite (operator="over")
//    Composites finalBlur over itself — effectively a no-op here, used to
//    explicitly output the final result. Ensures filter chain terminates cleanly.
function GlassFilter() {
  return (
    <svg className="hidden">
      <defs>
        <filter
          id="container-glass"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          {/* Step 1: Generate turbulent noise texture */}
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.05 0.05"
            numOctaves="1"
            seed="1"
            result="turbulence"
          />
          {/* Step 2: Smooth the noise to prevent harsh displacement edges */}
          <feGaussianBlur in="turbulence" stdDeviation="2" result="blurredNoise" />
          {/* Step 3: Displace backdrop pixels using the noise map */}
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurredNoise"
            scale="70"
            xChannelSelector="R"
            yChannelSelector="B"
            result="displaced"
          />
          {/* Step 4: Blur the displaced result → frosted glass look */}
          <feGaussianBlur in="displaced" stdDeviation="4" result="finalBlur" />
          {/* Step 5: Output — feComposite operator="over" as a chain terminator */}
          <feComposite in="finalBlur" in2="finalBlur" operator="over" />
        </filter>
      </defs>
    </svg>
  )
}

export { Button, buttonVariants, liquidbuttonVariants, LiquidButton }

// ─────────────────────────────────────────────────────────────────────────────
// PART 3: Demo Composition (DemoOne)
// ─────────────────────────────────────────────────────────────────────────────
// Shows how WebGLShader + LiquidButton compose.
// The shader is fixed-position (behind everything).
// The content is relative-positioned (above the shader via stacking context).
// The double-border treatment (outer + inner [#27272a]) creates a framed
// panel effect — a common editorial design pattern.
/*

import { WebGLShader } from "@/components/ui/web-gl-shader"
import { LiquidButton } from "@/components/ui/liquid-glass-button"

export default function DemoOne() {
  return (
    // overflow-hidden: clips the shader canvas (which is fixed) from showing
    // outside this container on certain mobile browsers.
    <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">

      // WebGLShader renders behind everything — fixed position, no z-index set.
      // Stacking order: fixed elements stack below positioned elements that come
      // later in DOM order. The relative divs below naturally stack on top.
      <WebGLShader />

      // Double-border frame: outer div with border, inner main with border.
      // Both use border-[#27272a] (zinc-800 equivalent) — a subtle dark rule
      // that reads against both the shader background and the content.
      <div className="relative border border-[#27272a] p-2 w-full mx-auto max-w-3xl">
        <main className="relative border border-[#27272a] py-10 overflow-hidden">

          // Hero headline — fluid type via clamp: min 2rem, preferred 8vw, max 7rem
          <h1 className="mb-3 text-white text-center text-7xl font-extrabold tracking-tighter md:text-[clamp(2rem,8vw,7rem)]">
            Design is Everything
          </h1>

          <p className="text-white/60 px-6 text-center text-xs md:text-sm lg:text-lg">
            Unleashing creativity through bold visuals, seamless interfaces, and limitless possibilities.
          </p>

          // Availability indicator: ping animation (animate-ping) + static dot
          // animate-ping: CSS keyframe scale 0→2 with opacity 0→0, simulating sonar pulse.
          // Two elements at same position: animated ring (opacity-75) + static dot.
          <div className="my-8 flex items-center justify-center gap-1">
            <span className="relative flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            <p className="text-xs text-green-500">Available for New Projects</p>
          </div>

          <div className="flex justify-center">
            // LiquidButton: text-white (overrides default text-primary),
            // border (adds a 1px border that the glass shadows work against),
            // rounded-full, size="xl" (h-12 px-8)
            <LiquidButton className="text-white border rounded-full" size="xl">
              Let's Go
            </LiquidButton>
          </div>

        </main>
      </div>
    </div>
  )
}

*/
