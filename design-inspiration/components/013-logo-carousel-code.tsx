// SOURCE: 21st.dev — Logo Carousel (cult-ui)
// DEPS: framer-motion, @radix-ui/react-slot, class-variance-authority
// STACK: React + Tailwind CSS + TypeScript + Framer Motion
// INSTALL: npm install framer-motion @radix-ui/react-slot class-variance-authority
// FILES:  /components/ui/logo-carousel.tsx   (this file)
//         /components/ui/gradient-heading.tsx (dependency — cult-ui)

// ─── SETUP NOTES ──────────────────────────────────────────────────────────────
// Requires shadcn project structure:
//   npx shadcn@latest init
//
// /components/ui is the shadcn contract path — all primitives must live here
// or @/components/ui imports break across the entire component ecosystem.

"use client"

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SVGProps,
} from "react"
import { AnimatePresence, motion } from "framer-motion"

// ─── TYPES ────────────────────────────────────────────────────────────────────
// Logo: the SVG component is typed as React.ComponentType<React.SVGProps<SVGSVGElement>>
// This allows any SVG icon (lucide, heroicons, custom inline SVGs, etc.) to be
// passed as a logo. The component receives className from LogoColumn for sizing.
interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

interface LogoColumnProps {
  logos: Logo[]
  index: number
  currentTime: number  // global clock in ms, increments by 100ms every tick
}

// ─── ARRAY UTILITIES ──────────────────────────────────────────────────────────

// Fisher-Yates shuffle — O(n), unbiased.
// Creates a copy (spread first) — never mutates the input array.
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// distributeLogos: evenly spreads logos across N columns.
// Step 1: shuffle all logos once.
// Step 2: round-robin assign (logo[0] → col[0], logo[1] → col[1], etc.)
//         This interleaves logos so adjacent columns don't show the same sequence.
// Step 3: pad shorter columns with random logos from the shuffled set so all
//         columns have the same length. This prevents the cycling from resetting
//         at different counts per column.
const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])

  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  // Pad to equal length — all columns must cycle at the same rate
  const maxLength = Math.max(...columns.map((col) => col.length))
  columns.forEach((col) => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })

  return columns
}

// ─── LOGO COLUMN ──────────────────────────────────────────────────────────────
// A single vertical slot that cycles through its assigned logos.
//
// CORE ALGORITHM: Time-based index derivation (no interval per column)
// The parent maintains ONE global clock (currentTime, increments by 100ms).
// Each column derives its current logo index from:
//   adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
//   currentIndex = floor(adjustedTime / cycleInterval)
//
// columnDelay = index * 200ms — staggers each column so they don't flip in sync.
// This creates the "wave" effect — columns cycle at slightly different phases
// of the same 2-second beat.
//
// WHY ONE GLOBAL CLOCK instead of per-column intervals:
// Multiple setIntervals drift independently over time → columns go out of phase
// unpredictably. One parent clock → mathematically perfect, deterministic stagger.
// This is the key architectural insight of the component.
//
// React.memo: prevents re-render of all columns when only one changes.
// Each column only re-renders when its own props change (logos, index, currentTime).
// Since currentTime changes every 100ms, memo saves only a little here — but the
// useMemo on CurrentLogo prevents the SVG component ref from changing until
// currentIndex actually changes (every 2000ms).
const LogoColumn: React.FC<LogoColumnProps> = React.memo(
  ({ logos, index, currentTime }) => {
    const cycleInterval = 2000     // ms between logo swaps
    const columnDelay = index * 200  // ms stagger between columns

    // Adjusted time wraps around the full cycle length
    const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)

    // Integer division gives the current logo slot (0 to logos.length-1)
    const currentIndex = Math.floor(adjustedTime / cycleInterval)

    // useMemo: the SVG component reference only changes when currentIndex changes
    // Without this, a new function reference would be created every 100ms tick,
    // causing unnecessary re-renders even though the same logo is showing
    const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex])

    return (
      // Column container: fixed size (responsive via md: prefix), overflow-hidden
      // clips logos that are mid-transition (entering from below or exiting upward)
      // Initial mount animation: slides up from y:50 and fades in
      // Staggered by index * 0.1s — columns appear sequentially on load
      <motion.div
        className="relative h-14 w-24 overflow-hidden md:h-24 md:w-48"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: index * 0.1,
          duration: 0.5,
          ease: "easeOut",
        }}
      >
        {/* AnimatePresence mode="wait": outgoing logo fully exits before incoming enters.
            Without "wait", logos would overlap during transition.
            Key: `${id}-${currentIndex}` — id alone isn't enough because the same logo
            can appear in multiple positions in the padded array. Index ensures
            re-animation even when the same logo repeats. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${logos[currentIndex].id}-${currentIndex}`}
            className="absolute inset-0 flex items-center justify-center"

            // ENTER: slides up 10% from below + fade in + blur resolves to sharp
            // Spring physics for enter creates a natural "settle" feel
            initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
            animate={{
              y: "0%",
              opacity: 1,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 300,  // how fast it accelerates toward target
                damping: 20,     // how quickly oscillation dies (20 = slight bounce)
                mass: 1,
                bounce: 0.2,
                duration: 0.5,
              },
            }}

            // EXIT: slides up 20% (past the top) + fade out + blurs back
            // Tween (not spring) for exit — exits should be clean/fast, not bouncy
            exit={{
              y: "-20%",
              opacity: 0,
              filter: "blur(6px)",
              transition: {
                type: "tween",
                ease: "easeIn",  // accelerates toward exit — natural departure feel
                duration: 0.3,
              },
            }}
          >
            {/* SVG logo: sized to 80×80 (mobile) / 128×128 (md), with max constraints
                so oversized SVGs (like the 800×800 BMW icon) don't blow out the cell */}
            <CurrentLogo className="h-20 w-20 max-h-[80%] max-w-[80%] object-contain md:h-32 md:w-32" />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    )
  }
)

// ─── LOGO CAROUSEL ────────────────────────────────────────────────────────────
// Orchestrating component. Maintains the global clock and distributed logo sets.
interface LogoCarouselProps {
  columnCount?: number  // default 2
  logos: Logo[]
}

export function LogoCarousel({ columnCount = 2, logos }: LogoCarouselProps) {
  const [logoSets, setLogoSets] = useState<Logo[][]>([])
  const [currentTime, setCurrentTime] = useState(0)

  // Global clock: increments by 100ms every tick.
  // useCallback: stable function reference prevents the interval from resetting
  // on every render. Without useCallback, the effect cleanup would fire every
  // render, creating and destroying intervals rapidly.
  const updateTime = useCallback(() => {
    setCurrentTime((prevTime) => prevTime + 100)
  }, [])

  // One interval drives all columns — deterministic, no drift
  useEffect(() => {
    const intervalId = setInterval(updateTime, 100)
    return () => clearInterval(intervalId)
  }, [updateTime])

  // Distribute logos to columns on mount and when config changes
  // distributeLogos runs once (or when logos/columnCount changes)
  // The shuffle happens inside, so initial distribution is random on each mount
  useEffect(() => {
    const distributedLogos = distributeLogos(logos, columnCount)
    setLogoSets(distributedLogos)
  }, [logos, columnCount])

  return (
    // flex space-x-4: horizontal layout with gap between columns
    <div className="flex space-x-4">
      {logoSets.map((logos, index) => (
        <LogoColumn
          key={index}
          logos={logos}
          index={index}
          currentTime={currentTime}
        />
      ))}
    </div>
  )
}

// Export LogoColumn for use in custom carousel layouts
export { LogoColumn }

// ─── GRADIENT HEADING (cult-ui) ───────────────────────────────────────────────
// Dependency for the demo. Wraps any heading element in a bg-clip-text gradient.
// Copy to /components/ui/gradient-heading.tsx separately.
//
// Usage in demo:
//   <GradientHeading variant="secondary">The best are already here</GradientHeading>
//   <GradientHeading size="xxl">Join new cult</GradientHeading>

// ─── DEMO USAGE ───────────────────────────────────────────────────────────────
/*
import { LogoCarousel } from "@/components/ui/logo-carousel"
import type { SVGProps } from "react"

// Define logo SVG components
function VercelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 256 222" {...props}>
      <path fill="#000" d="m128 0 128 221.705H0z" />
    </svg>
  )
}

// Logo array — any SVG component works
const logos = [
  { name: "Vercel", id: 1, img: VercelIcon },
  { name: "TypeScript", id: 2, img: TypeScriptIcon },
  { name: "Supabase", id: 3, img: SupabaseIcon },
]

// 2 columns (default)
<LogoCarousel logos={logos} />

// 3 columns
<LogoCarousel columnCount={3} logos={logos} />

// 5 columns — dense grid, more logos cycling simultaneously
<LogoCarousel columnCount={5} logos={logos} />

// AetherTrace "Trusted By" section:
// - logos = [DepartmentOfDefense, GSA, USACE, EnergyDepartment, ...]
// - columnCount={4} for horizontal balance
// - Wrap in a section with muted background for social proof positioning
<section className="py-16 border-y border-teal-900/30">
  <GradientHeading variant="secondary" size="sm">
    Custody trusted by
  </GradientHeading>
  <LogoCarousel columnCount={4} logos={federalLogos} />
</section>
*/

// ─── FULL DEMO (from 21st.dev) ────────────────────────────────────────────────
// The demo includes inline SVG definitions for 14 brand logos:
// Apple, Supabase, Vercel, Lowes, Ally, Pierre, BMW, Claude, Next.js,
// Tailwind CSS, Upstash, TypeScript, Stripe, OpenAI
// See: https://21st.dev for the complete demo.tsx with all SVG definitions.
