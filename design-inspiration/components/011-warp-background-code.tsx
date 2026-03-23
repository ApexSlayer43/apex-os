// SOURCE: 21st.dev — Warp Background
// DEPS: motion (npm install motion), shadcn/card, @/lib/utils (cn)
// STACK: React + Tailwind CSS + TypeScript + CSS 3D transforms + Framer Motion
// INSTALL: npm install motion

// ─── SETUP NOTES ──────────────────────────────────────────────────────────────
// Requires shadcn project structure. If not set up:
//   npx shadcn@latest init
//
// Component goes to: /components/ui/warp-background.tsx
// shadcn convention: ALL reusable UI primitives live in /components/ui/
// This matters because @/components/ui is the expected import path throughout
// the entire shadcn ecosystem. Diverging breaks all shadcn component imports.
//
// Dependencies:
//   /components/ui/card.tsx         — shadcn Card (see demo)
//   /lib/utils.ts                   — cn() utility (ships with shadcn init)
//   motion/react                    — Framer Motion v11+ package name

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import React, { HTMLAttributes, useCallback, useMemo } from "react";

// ─── WARPBACKGROUND PROPS ─────────────────────────────────────────────────────
// All props are optional with sensible defaults. The component wraps any
// children inside a 3D-perspective border box with animated beam effects.
interface WarpBackgroundProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  perspective?: number;    // CSS perspective in px — lower = more extreme 3D distortion
  beamsPerSide?: number;   // how many beams spawn per side (top/bottom/left/right)
  beamSize?: number;       // beam width as % of container, also drives grid cell size
  beamDelayMax?: number;   // max random start delay in seconds
  beamDelayMin?: number;   // min random start delay in seconds
  beamDuration?: number;   // time for one full beam travel in seconds
  gridColor?: string;      // CSS color for grid lines — defaults to shadcn --border token
}

// ─── BEAM COMPONENT ───────────────────────────────────────────────────────────
// A single animated beam rectangle that travels from container bottom to top.
//
// KEY TECHNIQUE: CSS custom properties on inline style + Tailwind arbitrary values
// The beam uses `[var(--x)]`, `[var(--width)]`, `[var(--aspect-ratio)]` etc.
// to pass values from props into Tailwind arbitrary class strings. This avoids
// dynamic class generation (which purges in production) while keeping
// animation values data-driven.
//
// KEY TECHNIQUE: `100cqmax` container query unit
// `cqmax` = the larger of the container's width or height.
// `y: "100cqmax"` means the beam starts one full container-max below its origin.
// This ensures the beam is fully off-screen at start regardless of container shape.
// `y: "-100%"` is the endpoint — fully above the container top.
// The beam travels exactly far enough to cross the entire container.
const Beam = ({
  width,
  x,
  delay,
  duration,
}: {
  width: string | number;   // beam width, e.g. "5%"
  x: string | number;       // horizontal position within the grid plane
  delay: number;            // seconds before first animation starts
  duration: number;         // seconds for one full transit
}) => {
  // Random hue per beam instance — each beam is a different color.
  // Since this runs once at mount (no deps), hue is stable per beam lifetime.
  const hue = Math.floor(Math.random() * 360);

  // Random aspect ratio 1:1 to 1:10 — controls beam length.
  // A tall, narrow beam looks like a laser streak vs. a short wide one.
  const ar = Math.floor(Math.random() * 10) + 1;

  return (
    <motion.div
      style={
        {
          // CSS custom properties injected as inline style — picked up by
          // Tailwind arbitrary value classes below
          "--x": `${x}`,
          "--width": `${width}`,
          "--aspect-ratio": `${ar}`,
          "--background": `linear-gradient(hsl(${hue} 80% 60%), transparent)`,
        } as React.CSSProperties
      }
      className={
        // [aspect-ratio:1/var(--aspect-ratio)] — uses CSS aspect-ratio property
        // [background:var(--background)]       — applies the random hsl gradient
        // [width:var(--width)]                 — beam width from parent prop
        // left-[var(--x)]                      — horizontal position in the plane
        `absolute left-[var(--x)] top-0 [aspect-ratio:1/var(--aspect-ratio)] [background:var(--background)] [width:var(--width)]`
      }
      // Start: y = "100cqmax" (fully below the container), centered on x axis
      // End:   y = "-100%"    (fully above the container), centered on x axis
      // x: "-50%" centers the beam on its left-[var(--x)] anchor point
      initial={{ y: "100cqmax", x: "-50%" }}
      animate={{ y: "-100%", x: "-50%" }}
      transition={{
        duration,
        delay,
        repeat: Infinity,   // loops forever
        ease: "linear",     // constant speed — not ease-in/out — for consistent travel rate
      }}
    />
  );
};

// ─── WARP BACKGROUND ──────────────────────────────────────────────────────────
// The main component. Renders a bordered container with CSS 3D perspective.
// Four planes (top, bottom, left, right) are CSS-transformed to face outward,
// each rendering a grid + animated beams that appear to travel toward the viewer.
//
// ARCHITECTURE: The effect requires two layers:
//
// 1. THE 3D PERSPECTIVE SHELL
//    An `absolute inset-0` div with `[perspective:var(--perspective)]` and
//    `[transform-style:preserve-3d]` — this is the 3D stage.
//    [clip-path:inset(0)] clips beams that would overflow the container edges.
//    [container-type:size] enables container query units (cqmax, cqi, cqh).
//
// 2. FOUR GRID PLANES (one per side)
//    Each plane is a div positioned at the corresponding edge and CSS-transformed
//    to lay flat in 3D space, facing outward. The planes hold the grid pattern
//    (via CSS background-image) AND the animated beams.
//
//    Plane dimensions use container query units:
//    - [width:100cqi]   = 100% of container inline dimension (matches top/bottom width)
//    - [height:100cqmax] = 100% of the larger container dimension (deep enough for beams)
//    - [width:100cqh]   = 100% of container block dimension (matches left/right height)
//
// 3. CHILDREN LAYER
//    A simple `relative` div that sits above the 3D effect layer.
export const WarpBackground: React.FC<WarpBackgroundProps> = ({
  children,
  perspective = 100,             // px — 100px is fairly dramatic. Higher = subtler.
  className,
  beamsPerSide = 3,
  beamSize = 5,                  // 5% = 20 cells per side (100/5)
  beamDelayMax = 3,
  beamDelayMin = 0,
  beamDuration = 3,
  gridColor = "hsl(var(--border))",  // shadcn CSS variable — adapts to dark/light mode
  ...props
}) => {

  // ── BEAM POSITION GENERATOR ──────────────────────────────────────────────
  // Distributes beams evenly across the grid cells of one side.
  // cellsPerSide = total number of grid cells in the side (100 / beamSize)
  // step = how many cells to skip between beams (cellsPerSide / beamsPerSide)
  // Each beam gets a random delay within [beamDelayMin, beamDelayMax]
  //
  // Result: beam x positions snap to grid cell boundaries (not arbitrary pixels),
  // so beams always align with the grid lines. This makes the grid feel intentional.
  const generateBeams = useCallback(() => {
    const beams = [];
    const cellsPerSide = Math.floor(100 / beamSize);
    const step = cellsPerSide / beamsPerSide;
    for (let i = 0; i < beamsPerSide; i++) {
      const x = Math.floor(i * step);  // grid cell index (not %)
      const delay = Math.random() * (beamDelayMax - beamDelayMin) + beamDelayMin;
      beams.push({ x, delay });
    }
    return beams;
  }, [beamsPerSide, beamSize, beamDelayMax, beamDelayMin]);

  // useMemo: generate once per prop change. Each side has independent random delays.
  // All four sides call generateBeams separately so beam timing is desynchronized.
  const topBeams    = useMemo(() => generateBeams(), [generateBeams]);
  const rightBeams  = useMemo(() => generateBeams(), [generateBeams]);
  const bottomBeams = useMemo(() => generateBeams(), [generateBeams]);
  const leftBeams   = useMemo(() => generateBeams(), [generateBeams]);

  return (
    // Outer wrapper: the visible bordered card that children sit inside.
    // `relative` is required so the absolute 3D layer positions correctly.
    // `rounded border p-20` — shadcn-compatible styling (swap as needed).
    <div className={cn("relative rounded border p-20", className)} {...props}>

      {/* ── 3D PERSPECTIVE SHELL ─────────────────────────────────────────── */}
      {/* pointer-events-none: beams are purely decorative, no click interference */}
      {/* [clip-path:inset(0)]: clips beams at container edges */}
      {/* [container-type:size]: enables cqmax/cqi/cqh units inside */}
      {/* [perspective:var(--perspective)]: sets the 3D vanishing point */}
      {/* [transform-style:preserve-3d]: allows child transforms to be 3D */}
      <div
        style={
          {
            "--perspective": `${perspective}px`,
            "--grid-color": gridColor,
            "--beam-size": `${beamSize}%`,
          } as React.CSSProperties
        }
        className={
          "pointer-events-none absolute left-0 top-0 size-full overflow-hidden [clip-path:inset(0)] [container-type:size] [perspective:var(--perspective)] [transform-style:preserve-3d]"
        }
      >

        {/* ── TOP PLANE ──────────────────────────────────────────────────── */}
        {/* Transform: rotateX(-90deg) lays the plane flat, hinging at the top edge.
            [transform-origin:50%_0%] = hinge at top center.
            [height:100cqmax] = deep enough for beams to travel full distance.
            [width:100cqi] = matches the container's inline (horizontal) width.
            Background = CSS grid pattern using two orthogonal linear-gradients:
            - One gradient for horizontal lines (1px every beamSize%)
            - One gradient for vertical lines (1px every beamSize%)
            Result: a perspective grid that recedes toward the horizon. */}
        <div className="absolute [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]">
          {topBeams.map((beam, index) => (
            <Beam
              key={`top-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}  // convert grid cell index to % position
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>

        {/* ── BOTTOM PLANE ───────────────────────────────────────────────── */}
        {/* top-full = positioned at the bottom edge of the container.
            Same rotateX(-90deg) but hinges from the bottom — beams appear
            to travel away from viewer at the bottom of the component. */}
        <div className="absolute top-full [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:50%_0%] [transform:rotateX(-90deg)] [width:100cqi]">
          {bottomBeams.map((beam, index) => (
            <Beam
              key={`bottom-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>

        {/* ── LEFT PLANE ─────────────────────────────────────────────────── */}
        {/* Transform: rotate(90deg) rotateX(-90deg) — rotate in Z then X.
            The Z rotation first aligns the plane to the left edge,
            then X rotation lays it flat into 3D space.
            [transform-origin:0%_0%] = hinge at top-left corner.
            [width:100cqh] = container block dimension (matches the height). */}
        <div className="absolute left-0 top-0 [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [transform-origin:0%_0%] [transform:rotate(90deg)_rotateX(-90deg)] [width:100cqh]">
          {leftBeams.map((beam, index) => (
            <Beam
              key={`left-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>

        {/* ── RIGHT PLANE ────────────────────────────────────────────────── */}
        {/* Transform: rotate(-90deg) rotateX(-90deg) — mirror of left plane.
            [transform-origin:100%_0%] = hinge at top-right corner. */}
        <div className="absolute right-0 top-0 [transform-style:preserve-3d] [background-size:var(--beam-size)_var(--beam-size)] [background:linear-gradient(var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_-0.5px_/var(--beam-size)_var(--beam-size),linear-gradient(90deg,_var(--grid-color)_0_1px,_transparent_1px_var(--beam-size))_50%_50%_/var(--beam-size)_var(--beam-size)] [container-type:inline-size] [height:100cqmax] [width:100cqh] [transform-origin:100%_0%] [transform:rotate(-90deg)_rotateX(-90deg)]">
          {rightBeams.map((beam, index) => (
            <Beam
              key={`right-${index}`}
              width={`${beamSize}%`}
              x={`${beam.x * beamSize}%`}
              delay={beam.delay}
              duration={beamDuration}
            />
          ))}
        </div>

      </div>

      {/* ── CHILDREN ─────────────────────────────────────────────────────── */}
      {/* relative: stacks above the absolute 3D layer. Any content goes here. */}
      <div className="relative">{children}</div>
    </div>
  );
};

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*
import { WarpBackground } from "@/components/ui/warp-background";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";

// Default — 3 beams per side, random hues, 5% grid
<WarpBackground>
  <Card className="w-80">
    <CardContent className="flex flex-col gap-2 p-4">
      <CardTitle>Congratulations on Your Promotion!</CardTitle>
      <CardDescription>
        Your hard work and dedication have paid off.
      </CardDescription>
    </CardContent>
  </Card>
</WarpBackground>

// Dense grid, many beams, fast — data processing feel
<WarpBackground
  beamSize={3}           // smaller cells = denser grid
  beamsPerSide={6}       // more simultaneous beams
  beamDuration={1.5}     // faster travel
  perspective={150}      // shallower perspective = subtler 3D
>
  <YourContent />
</WarpBackground>

// AetherTrace: evidence sealed state
// Teal/cyan beams, slower, deliberate — "the chain is running"
<WarpBackground
  beamSize={4}
  beamsPerSide={4}
  beamDuration={4}
  beamDelayMax={5}
  gridColor="rgba(20, 184, 166, 0.2)"  // teal grid lines
  perspective={80}
>
  <EvidenceCard />
</WarpBackground>

// High-alert red — tamper detected / dispute mode
<WarpBackground
  beamSize={5}
  beamsPerSide={5}
  beamDuration={0.8}
  beamDelayMax={0.5}
  gridColor="rgba(239, 68, 68, 0.3)"   // red grid lines
>
  <AlertCard />
</WarpBackground>

// Minimal — just the grid, no visible beams (set duration very long)
<WarpBackground
  beamsPerSide={1}
  beamDuration={20}
  beamDelayMax={15}
  gridColor="rgba(255,255,255,0.05)"
>
  <HeroContent />
</WarpBackground>
*/
