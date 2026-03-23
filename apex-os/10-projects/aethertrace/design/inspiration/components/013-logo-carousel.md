# 013 — Logo Carousel (Time-Based Cycling Columns + Blur Transitions)

**Source:** 21st.dev (cult-ui)
**Type:** Social proof / trust component — vertically cycling logo grid with staggered columns
**Stack:** React, Tailwind CSS, TypeScript, Framer Motion
**Dependencies:** `framer-motion`, `@radix-ui/react-slot`, `class-variance-authority`
**Install:** `npm install framer-motion @radix-ui/react-slot class-variance-authority`

## What Makes This Hit

This is the "as seen at" / "trusted by" section pattern — but done with continuous motion instead of a static grid. Rather than showing a row of flat logos, this component creates living columns where logos cycle vertically with blur transitions. The staggering creates a subtle wave effect that makes the component feel like a live data feed rather than a marketing asset.

---

## The Core Architecture: One Global Clock Drives All Columns

The most important architectural decision in this component is the single parent clock pattern.

```tsx
// Parent: one counter incremented every 100ms
const [currentTime, setCurrentTime] = useState(0)
useEffect(() => {
  const intervalId = setInterval(() => setCurrentTime(t => t + 100), 100)
  return () => clearInterval(intervalId)
}, [])

// Each column: derives its state mathematically from the global clock
const adjustedTime = (currentTime + columnDelay) % (cycleInterval * logos.length)
const currentIndex = Math.floor(adjustedTime / cycleInterval)
```

**Why one clock instead of one interval per column?**

Multiple `setInterval` instances drift. JavaScript's event loop doesn't guarantee exact timing — each interval fires slightly late based on what else is running. Over 30 seconds, independent intervals can drift several hundred milliseconds apart. The wave effect depends on precise relative timing between columns. One clock → no drift, ever.

**The math explained:**
- `currentTime` = ms since mount (0, 100, 200, ...)
- `columnDelay = index * 200` = 0ms, 200ms, 400ms for cols 0, 1, 2
- `adjustedTime = (currentTime + columnDelay) % totalCycleLength` — wraps cleanly
- `currentIndex = floor(adjustedTime / 2000)` — switches every 2 seconds

The `%` (modulo) operation makes the whole thing loop automatically — no reset logic needed. When `adjustedTime` reaches `cycleInterval * logos.length`, it wraps to 0 and the cycle repeats.

---

## Fisher-Yates Shuffle

```tsx
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]  // copy — never mutate input
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
```

Fisher-Yates is the correct shuffle algorithm — O(n), each permutation equally probable. The semicolon before the destructuring assignment (`;[shuffled[i], shuffled[j]] = ...`) is a TypeScript/JavaScript ASI (Automatic Semicolon Insertion) guard — without it, the array destructuring could be misinterpreted as property access on the previous statement.

---

## Logo Distribution — Round-Robin + Equal-Length Padding

```tsx
const distributeLogos = (allLogos: Logo[], columnCount: number): Logo[][] => {
  const shuffled = shuffleArray(allLogos)
  const columns: Logo[][] = Array.from({ length: columnCount }, () => [])

  // Round-robin: logo[0]→col[0], logo[1]→col[1], logo[2]→col[2], logo[3]→col[0]...
  shuffled.forEach((logo, index) => {
    columns[index % columnCount].push(logo)
  })

  // Pad all columns to the same length
  const maxLength = Math.max(...columns.map(col => col.length))
  columns.forEach(col => {
    while (col.length < maxLength) {
      col.push(shuffled[Math.floor(Math.random() * shuffled.length)])
    }
  })

  return columns
}
```

**Why round-robin?** It ensures adjacent columns show different logos at any given moment. Sequential assignment would cluster similar logos in the same column.

**Why pad to equal length?** All columns must have the same number of logos for the global clock to work correctly. If col[0] has 5 logos and col[1] has 4, col[1]'s `currentIndex` would overflow. Equal length means `% (cycleInterval * logos.length)` is consistent across columns.

**Padding uses random picks**, not sequential fills — prevents the padded slots from being predictably the same logos every time.

---

## The Blur Transition — Spring In, Tween Out

```tsx
// ENTER: spring physics — natural "settle" feel
initial={{ y: "10%", opacity: 0, filter: "blur(8px)" }}
animate={{
  y: "0%",
  opacity: 1,
  filter: "blur(0px)",
  transition: { type: "spring", stiffness: 300, damping: 20, bounce: 0.2 }
}}

// EXIT: tween with easeIn — clean, fast departure
exit={{
  y: "-20%",
  opacity: 0,
  filter: "blur(6px)",
  transition: { type: "tween", ease: "easeIn", duration: 0.3 }
}}
```

**Enter = spring, Exit = tween.** This asymmetry is intentional:
- Spring entry: the logo "arrives" with a slight bounce and blur resolve. Feels alive, like something materializing.
- Tween exit: the logo "departs" cleanly, accelerating out of view. Fast exits prevent the transition from feeling sluggish.

**`filter: "blur(8px)"` on enter and `"blur(6px)"` on exit:** The entering logo is more blurred (8px) because it's coming from nothing — high blur = emergence. The exiting logo is less blurred (6px) because it's already "real" and just fading away.

**`y: "10%"` enter vs `y: "-20%"` exit:** Enters from just below (10%), exits further above (-20%). The asymmetry creates a sense of upward flow — logos stream upward through the column, which maps to the metaphor of a feed or stream of information.

---

## AnimatePresence `mode="wait"`

```tsx
<AnimatePresence mode="wait">
  <motion.div key={`${logos[currentIndex].id}-${currentIndex}`} ...>
```

`mode="wait"` means: the exiting element fully completes its exit animation before the entering element starts its enter animation. Without this, both elements would be present simultaneously and overlap.

**Key uniqueness:** `${id}-${currentIndex}` not just `${id}`. Because `distributeLogos` pads shorter columns with random repeated logos, the same logo ID can appear at multiple positions in the array. If only `id` were the key, React would think the component didn't change when moving from one occurrence of the same logo to another — no animation would trigger. Including `currentIndex` ensures every slot transition creates a new key, guaranteeing the animation fires.

---

## `React.memo` + `useMemo` — Preventing Unnecessary Renders

```tsx
const LogoColumn = React.memo(({ logos, index, currentTime }) => {
  const CurrentLogo = useMemo(() => logos[currentIndex].img, [logos, currentIndex])
  ...
})
```

`React.memo` prevents `LogoColumn` from re-rendering unless its props change. Since `currentTime` changes every 100ms, `LogoColumn` WILL re-render every 100ms — but memo prevents re-renders from parent state changes that don't affect these props.

`useMemo` on `CurrentLogo`: the component reference (`logos[currentIndex].img`) only changes every 2000ms (when `currentIndex` changes). Without `useMemo`, a new function reference would be created every 100ms tick even though `currentIndex` hasn't changed, forcing React to re-evaluate the SVG render.

**The render optimization hierarchy:**
1. `React.memo` — prevents re-render from irrelevant parent changes
2. `useMemo` — prevents SVG component reference churn within valid re-renders
3. Single global clock — prevents drift, ensures only one timer drives 100ms updates

---

## `React.ComponentType<React.SVGProps<SVGSVGElement>>` — The SVG Prop Type

```tsx
interface Logo {
  name: string
  id: number
  img: React.ComponentType<React.SVGProps<SVGSVGElement>>
}
```

This type says: `img` is any React component that accepts standard SVG props. This means:
- Lucide icons work directly (`img: Shield`)
- Inline SVG functions work (`img: VercelIcon`)
- Any component that accepts `className`, `width`, `height`, `fill`, etc. works

`LogoColumn` passes `className` for sizing:
```tsx
<CurrentLogo className="h-20 w-20 max-h-[80%] max-w-[80%] object-contain md:h-32 md:w-32" />
```

The `max-h-[80%]` and `max-w-[80%]` constraints are crucial — some source SVGs (BMW is 800×800, Vercel is 256×222) are very large. The `max-*` percentage constraints cap them within the column cell regardless of source dimensions. `object-contain` ensures aspect ratio is preserved.

---

## GradientHeading — The `bg-clip-text` Pattern

```tsx
const headingVariants = cva(
  "tracking-tight pb-3 bg-clip-text text-transparent",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-t from-neutral-700 to-neutral-800 dark:from-stone-200 dark:to-neutral-200",
        secondary: "bg-gradient-to-t from-neutral-500 to-neutral-600 ...",
        light: "bg-gradient-to-t from-neutral-200 to-neutral-300",
      },
      size: { xxl: "text-5xl sm:text-6xl lg:text-[6rem]", ... },
      weight: { ... }
    }
  }
)
```

`bg-clip-text text-transparent` is the gradient text pattern. The gradient is applied as a background, then `bg-clip-text` clips it to the text shape, and `text-transparent` makes the text itself transparent — revealing the gradient through the letterforms.

**`pb-3` on the span (not the heading):** The gradient is clipped to the element's bounding box. Descenders (the tails of "g", "y", "p") extend below the text baseline. Without `pb-3`, the bottom of descenders gets clipped by the box. The padding adds space below the text to include descenders in the clipping region.

**`asChild` pattern via Radix Slot:**
```tsx
const Comp = asChild ? Slot : "h3"
return (
  <Comp ref={ref} {...props}>
    <span className={headingVariants({ ... })}>
      {children}
    </span>
  </Comp>
)
```

`asChild` allows rendering as any element (h1, h2, div, a) without prop drilling. `Slot` merges the component's props with the child's props, forwarding everything correctly. Without `asChild`, the heading is always an `<h3>`. With it, the caller controls the element.

---

## Column Stagger — Two Separate Stagger Systems

There are actually two stagger animations in this component:

**1. Mount stagger (one-time):** When the carousel first renders, columns slide in from below with `delay: index * 0.1`. Col 0 appears at 0ms, col 1 at 100ms, col 2 at 200ms.

```tsx
<motion.div
  initial={{ opacity: 0, y: 50 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: index * 0.1 }}
>
```

**2. Cycle stagger (ongoing):** Each column's clock is offset by `index * 200ms`. Col 0 flips at 0, 2000, 4000ms. Col 1 flips at 200, 2200, 4200ms. Col 2 flips at 400, 2400, 4400ms.

The two systems are independent — the mount stagger runs once, the cycle stagger runs forever. They use different mechanisms: the mount stagger uses Framer's `delay` prop, the cycle stagger uses the `columnDelay` offset in the time math.

---

## Design Principles to Extract

1. **One global clock for synchronized multi-element animation** — one `setInterval` at the parent, pass `currentTime` as a prop. Eliminates timer drift across multiple child intervals.
2. **Time-based index derivation** — `floor(time / interval) % length` gives a deterministic current index. No state machines, no transitions needed in logic. The math IS the state.
3. **`%` (modulo) for automatic looping** — `adjustedTime % totalCycle` wraps cleanly to 0 without any reset logic. Use whenever you need cyclical progression.
4. **Spring for enter, tween for exit** — enters feel alive (spring physics, slight bounce). Exits feel clean (tween, easeIn, fast). The asymmetry creates arrival/departure quality.
5. **Blur as transition medium** — `filter: blur(8px)` → `blur(0px)` on enter looks like emergence from the ether. More dramatic than opacity alone. GPU-composited (no layout impact).
6. **`AnimatePresence mode="wait"` for sequential transitions** — exit completes before enter starts. Prevents logo overlap during swap.
7. **Key includes position, not just identity** — `${id}-${index}` ensures the same component appearing at different positions triggers distinct animations.
8. **`React.ComponentType<SVGProps>` as the logo interface** — accepts any SVG-compatible component. Lucide icons, inline SVGs, icon libraries all work without adaptation.
9. **`max-h-[80%] max-w-[80%]`** — constrain SVG icons by percentage of their container, not by absolute pixels. Handles source SVGs of any intrinsic size.
10. **Round-robin distribution with equal-length padding** — ensures no two adjacent columns show the same logo simultaneously, and all columns have the same cycle length.
11. **Fisher-Yates for unbiased shuffle** — O(n) and each permutation equally probable. The standard for randomizing arrays.
12. **`pb-3` on `bg-clip-text` elements** — prevents descender clipping on gradient text. Always add bottom padding to gradient text spans.
13. **`asChild` via Radix Slot for polymorphic headings** — renders as any element without prop drilling. The component controls styling, the caller controls the element type.
14. **`useCallback` on the clock updater** — stable function reference prevents the interval from being recreated on every render.
15. **`useMemo` on the current logo ref** — prevents SVG component reference churn between 100ms clock ticks when the logo hasn't actually changed.

---

## AetherTrace Adaptation

**The "Who Trusts the Chain" social proof section.**

Logo carousels are standard social proof infrastructure, but AetherTrace's adopters aren't consumer brands — they're federal agencies, contractors, and industry bodies. The carousel communicates that the protocol has institutional adoption.

### Government / Industry Logo Set
```tsx
const aethertraceAdopters = [
  { name: "Department of Defense",     id: 1,  img: DoDIcon },
  { name: "General Services Admin",    id: 2,  img: GSAIcon },
  { name: "US Army Corps Engineers",   id: 3,  img: USACEIcon },
  { name: "Energy Department",         id: 4,  img: DOEIcon },
  { name: "Associated Subcontractors", id: 5,  img: ASAIcon },
  { name: "Hensel Phelps",             id: 6,  img: HenselPhelpsIcon },
  { name: "Turner Construction",       id: 7,  img: TurnerIcon },
  { name: "Clark Construction",        id: 8,  img: ClarkIcon },
]
```

### Section Layout
```tsx
<section className="py-20 border-y border-teal-900/20 bg-[#060b14]">
  <div className="max-w-4xl mx-auto text-center space-y-8">
    <GradientHeading variant="secondary" size="sm">
      Adopted by builders and agencies that can't afford to be wrong
    </GradientHeading>
    <LogoCarousel columnCount={4} logos={aethertraceAdopters} />
  </div>
</section>
```

### Styling Adjustments
- Background: `#060b14` (AetherTrace deep navy) instead of white
- Logo SVGs: use white/light fills (`fill="white"` or `fill="currentColor"` with `text-white` className) since they'll display on dark background
- `GradientHeading variant="light"` for the light-on-dark version
- Slower cycle: extend `cycleInterval` to 3000ms (government logos feel more authoritative at a slower pace)

### The Conceptual Fit
A cycling logo carousel on dark background with blurred transitions maps directly to AetherTrace's identity — a neutral layer that multiple parties flow through. The logos cycling through columns = different entities, different domains, all flowing through the same protocol. The blur = the chain doing its work invisibly. The stagger = events arriving independently, sequenced by the protocol.

---

## Raw Code Reference
See: `013-logo-carousel-code.tsx`
