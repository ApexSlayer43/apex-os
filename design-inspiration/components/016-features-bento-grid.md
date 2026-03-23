# 016 — Features-8 Bento Grid (6-Column Responsive Grid + SVG Illustration Techniques)

**Source:** 21st.dev
**Type:** Features section — bento grid layout with 5 illustrated cards
**Stack:** React + Tailwind CSS v4 + TypeScript + shadcn Card/CardContent
**Dependencies:** `lucide-react`, `shadcn/card`
**Install:** `npx shadcn@latest add card && npm install lucide-react`
**Component path:** `/components/blocks/features-8.tsx` (blocks/, not ui/)

## What Makes This Hit

This is the modern SaaS features section pattern — five cards in a bento grid, each with a distinct visual treatment that communicates the feature's value without relying on photographs or external images. Every illustration is inline SVG, every color is a Tailwind token or CSS variable. Dark mode works without a single JavaScript check. The technical density is high: pseudo-element double rings, SVG gradient fills driven by `currentColor`, bleed panels, the `ring-background` avatar separator, a CSS-variable vertical divider, and `sm:w-[150%]` overflow charts. All of it pure CSS and inline SVG — zero runtime dependencies beyond the Card primitive.

---

## The 6-Column Bento Grid

```tsx
<div className="relative z-10 grid grid-cols-6 gap-3">
  <Card className="col-span-full lg:col-span-2" />   {/* Card 1 */}
  <Card className="col-span-full sm:col-span-3 lg:col-span-2" />  {/* Card 2 */}
  <Card className="col-span-full sm:col-span-3 lg:col-span-2" />  {/* Card 3 */}
  <Card className="col-span-full lg:col-span-3" />   {/* Card 4 */}
  <Card className="col-span-full lg:col-span-3" />   {/* Card 5 */}
</div>
```

Three breakpoints, one grid declaration:

**Mobile:** All `col-span-full` → single column stack.

**Tablet (sm):** Cards 2+3 become `sm:col-span-3` → two equal halves. Cards 1, 4, 5 stay full width.

**Desktop (lg):**
```
Row 1: [Card 1: 2/6] [Card 2: 2/6] [Card 3: 2/6]  ← three equal thirds
Row 2: [Card 4: 3/6]           [Card 5: 3/6]         ← two equal halves
```

**Why 6 columns and not 12?** Six is the LCM of 2 and 3, the only denominators used. A 12-column grid would work too but requires `col-span-4` (1/3) and `col-span-6` (1/2) — the 6-column approach uses smaller, more readable numbers with the same result.

**`gap-3` (12px):** Tighter than the standard `gap-4`/`gap-6`. Bento grids read better with a narrow gap — the cards feel like a cohesive panel system rather than independent floating units.

---

## `blocks/` vs `ui/` — File Path Convention

The demo imports from `@/components/blocks/features-8`, not `@/components/ui/`. This is the shadcn convention:
- `ui/`: atomic, reusable primitives (Button, Card, Input, Badge)
- `blocks/`: composed sections built from multiple `ui/` primitives (Features, Hero, Pricing, CTA)

Blocks are not meant to be reused atom-by-atom — they're meant to be dropped in, edited, and owned. `ui/` primitives are stable and shared; `blocks/` components are project-specific.

---

## Double-Ring Circle — Pure CSS, No Extra Wrapper

```tsx
<div className="relative flex aspect-square size-12 rounded-full border
  before:absolute before:-inset-2 before:rounded-full before:border
  dark:border-white/10 dark:before:border-white/5">
  <Icon className="m-auto" />
</div>
```

Two rings, one element. The inner ring is the div's own `border`. The outer ring is the `::before` pseudo-element:

- `before:absolute`: positions relative to the parent (which is `relative`)
- `before:-inset-2`: `inset: -8px` — expands 8px beyond the div in all directions
- `before:rounded-full before:border`: draws a circle border

**Result:** Inner ring at the div edge, outer ring 8px beyond it. Creates a "double halo" effect common in authentication icons, shield icons, and status indicators.

**Dark mode opacity:** `dark:border-white/10 dark:before:border-white/5` — the outer ring is dimmer than the inner (5% vs 10% opacity). Subtlety gradient: just barely perceptible layers that add depth without competing with the icon.

**`aspect-square`:** Guarantees the div is always a perfect circle regardless of content or parent width. Without it, the icon's size could make the div non-square.

**`m-auto` on the icon:** Centers the icon inside the flex container. Works because flex + `m-auto` collapses all available space into the margins equally in all directions.

---

## SVG `currentColor` + Tailwind Classes — Theme-Aware SVG Without JavaScript

```tsx
<svg className="text-muted absolute inset-0 size-full" ...>
  <path fill="currentColor" />  {/* renders in text-muted color */}
</svg>
```

The `text-{color}` Tailwind class sets the CSS `color` property. SVG's `fill="currentColor"` and `stroke="currentColor"` inherit that CSS `color` value. This makes any SVG element theme-aware by just changing the wrapper's Tailwind text class.

**In this component:**
- Oval background: `text-muted` → muted gray
- Icon base layer: `text-zinc-400 dark:text-zinc-600`
- Chart line: `text-primary-600 dark:text-primary-500`
- Chart area: `text-primary/15 dark:text-primary/35`

Every color is a semantic token. Swap the theme and the whole component recolors.

---

## SVG `stopColor="currentColor"` — Gradient Stops That Respond to Dark Mode

```tsx
<linearGradient id="paint0_linear_0_1" ...>
  <stop stopColor="white" stopOpacity="0" />
  <stop className="text-primary-600 dark:text-primary-500" offset="1" stopColor="currentColor" />
</linearGradient>
```

Combining `className` on an SVG `<stop>` element with `stopColor="currentColor"`:
- `className="text-primary-600"` sets `color: var(--color-primary-600)` on the stop element
- `stopColor="currentColor"` reads that `color` value as the gradient stop color

This is the only way to make SVG gradient stops respond to Tailwind's dark mode variant. Without it, gradient stops must use hardcoded hex values that don't respond to dark mode.

**The limitation:** Browser support for `className` on SVG `<stop>` elements is widely supported in modern browsers but not IE11. For IE11 support, inline `style` is required.

---

## SVG ClipPath for Gradient Reveal Effect

```tsx
<g clipPath="url(#clip0_0_1)">
  <path d="..." fill="url(#paint0_linear_0_1)" />  {/* gradient-filled duplicate */}
</g>
...
<clipPath id="clip0_0_1">
  <rect width="129" height="72" fill="white" transform="translate(41)" />
</clipPath>
```

The technique:
1. Draw the full icon in muted gray (base layer, full opacity)
2. Draw the SAME path again as a gradient fill, but clip it to only show the BOTTOM portion

The gradient goes from `white/0` (transparent) at the top to `primary-600` at `y=72` (the horizontal midpoint). The `clipPath` rect starts at `y=0` with height 72 — so only the bottom half of the gradient-filled path is visible.

**Effect:** The icon appears to "fill up" with the primary color from the midpoint down, while the top half remains the base muted color. The horizontal accent line at `y=72` reinforces the waterline.

**Why duplicate the path?** SVG has no way to apply a gradient fill to only part of an existing path. The only solution is two identical paths stacked: one with the base fill, one with the gradient fill + clipPath restricting it.

---

## `fillRule="evenodd"` for Area Chart Fill Paths

```tsx
<path fillRule="evenodd" clipRule="evenodd" d="M3 123C3 123 14.3298..." fill="url(#gradient)" />
```

The area chart fill path traces: left-edge down → chart line across → right-edge down → bottom edge back to start. This creates a closed shape enclosing the chart area. `fillRule="evenodd"` determines how the fill handles overlapping regions when the path crosses itself — for chart areas, it ensures the fill is always inside the enclosed region regardless of path winding direction.

**SVG text-as-paths:** The app name and version numbers in Card 3 are `<path>` elements, not `<text>` elements. Paths render identically across all browsers without font loading. The tradeoff: paths are not accessible to screen readers and can't be selected as text. For decorative illustration SVGs, this is acceptable.

---

## `before:bg-(--color-border)` — Tailwind v4 CSS Variable Syntax

```tsx
<div className="before:bg-(--color-border) before:absolute before:inset-0 before:mx-auto before:w-px">
```

Tailwind v4 introduces arbitrary CSS variable shorthand: `bg-(--variable-name)` expands to `background-color: var(--variable-name)`. This is equivalent to `bg-[var(--color-border)]` in Tailwind v3 syntax but more concise.

`--color-border` is the shadcn CSS token for border color (defined in globals.css). Using it here means the divider line automatically matches the card border color in both light and dark mode.

**The vertical divider itself:**
```
before:absolute before:inset-0    → spans full column height
before:mx-auto                    → centers horizontally
before:w-px                       → 1px wide
```
A centered 1px vertical line without an extra element. The avatars then position themselves relative to this line using `calc()` offsets.

---

## `ring-background` Avatar Separator

```tsx
<div className="ring-background size-7 ring-4">
  <img className="size-full rounded-full" src="..." />
</div>
```

`ring-4 ring-background`: applies a 4px solid ring in the `background` color token. This creates a gap between the avatar and whatever is behind it (the divider line, other avatars, the card background).

**Why this works:** The ring isn't transparent — it's the same color as the page/card background. It paints over the divider line where the avatar crosses it, simulating a clipping gap without actual CSS clipping. The avatar appears to sit on top of the line cleanly.

**`ring-background` vs `border`:** A border adds to the element's size. A ring (via `outline` or `box-shadow`) is outside the layout box — it doesn't affect document flow. Avatars can overlap with rings without pushing adjacent elements.

---

## Avatar Positioning Math — `calc()` Alignment to a Center Line

```tsx
{/* Right-aligned: avatar edge sits on center line */}
<div className="flex w-[calc(50%+0.875rem)] items-center justify-end gap-2">
  <span>Label</span>
  <div className="size-7">Avatar</div>  {/* 28px = 1.75rem */}
</div>

{/* Left-aligned: starts at center line */}
<div className="ml-[calc(50%-1rem)] flex items-center gap-2">
  <div className="size-8">Avatar</div>  {/* 32px = 2rem */}
  <span>Label</span>
</div>
```

**Right-aligned row width:** `calc(50% + 0.875rem)`
- 50% of the container = the center line
- +0.875rem = half of the avatar size (size-7 = 1.75rem, half = 0.875rem)
- Result: the row extends to where the avatar's right edge sits at 50% + its half-width, so its CENTER is exactly on the 50% line

**Left-aligned margin:** `calc(50% - 1rem)`
- 50% of container = the center line
- -1rem = half of the avatar size (size-8 = 2rem, half = 1rem)
- Result: the row starts at the point where the avatar's left edge is half-an-avatar-width before the center line, so its CENTER is on the center line

Both formulas center the avatar on the divider line, regardless of avatar size. The different `size-7` vs `size-8` sizes use different offsets accordingly.

---

## The `-mb-6 -mr-6` Card Panel Bleed

```tsx
{/* Inside CardContent (which has p-6 = 24px padding): */}
<div className="-mb-6 -mr-6 mt-6 border-l border-t p-6 sm:ml-6">
```

**CardContent default padding:** `p-6` (24px all sides). Negative margins cancel specific sides:
- `-mb-6`: cancels bottom padding → panel touches card bottom edge
- `-mr-6`: cancels right padding → panel touches card right edge
- No `-ml-6`: keeps the left spacing so the panel has a gap from the left column
- `border-l border-t`: only the interior edges need borders (right + bottom are hidden by overflow)

**`overflow-hidden` on Card:** The card's `overflow-hidden` clips the panel at the card boundary. The panel extends to fill its negative-margin space, and Card clips it cleanly.

**`rounded-tl-(--radius)`:** CSS variable shorthand for `border-top-left-radius: var(--radius)`. Rounds only the top-left corner of the panel — the corner that's visible. The other three corners are hidden under overflow or against the card edge.

---

## `sm:w-[150%]` — The Overflow Chart

```tsx
<svg className="w-full sm:w-[150%]" viewBox="0 0 366 231">
```

On `sm+` screens, the SVG is explicitly wider than its container — it spills 50% beyond the right edge. The card's `overflow-hidden` clips this, creating the impression of data extending beyond the visible frame.

**Why this works visually:** Charts that end at the card edge look truncated — the data appears to stop because the container stopped. Allowing the chart to bleed off-screen communicates that the data continues. The viewer completes the line mentally.

**`viewBox="0 0 366 231"`:** The SVG maintains its internal coordinate system at full resolution. The 150% CSS width scales up the rendering, but the path coordinates don't change.

---

## Three-Dot Terminal Chrome

```tsx
<div className="absolute left-3 top-2 flex gap-1">
  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
  <span className="block size-2 rounded-full border dark:border-white/10 dark:bg-white/10"></span>
</div>
```

Three 8px circles mimicking macOS window control buttons. In light mode: subtle border dots. In dark mode: white/10 background + white/10 border — barely visible halos.

**The signifier:** These dots make the chart panel read as a "window" or "terminal" — a software UI screenshot rather than an abstract chart. The context shift makes the technical content feel like a product demo.

**`absolute left-3 top-2`:** Positions in the top-left of the panel, which already has `p-6`. The absolute positioning escapes the padding and sits against the panel's own edge.

---

## Design Principles to Extract

1. **6-column bento grid** — `grid-cols-6` with `col-span-2` (1/3) and `col-span-3` (1/2). Six columns are the minimum to express both 1/2 and 1/3 splits in one grid. `gap-3` keeps cards tight as a system.

2. **Three-breakpoint responsive spanning** — `col-span-full sm:col-span-3 lg:col-span-2` covers mobile stack → tablet pairs → desktop thirds. Read right-to-left to understand the intent.

3. **`blocks/` path for composed sections** — sections that use multiple `ui/` primitives belong in `blocks/`, not `ui/`. `ui/` is for reusable atoms.

4. **`text-{color}` + `fill="currentColor"` = theme-aware SVG** — any SVG element with `fill="currentColor"` or `stroke="currentColor"` inherits its color from the nearest CSS `color` property. Wrap in a div with a Tailwind text class to control it.

5. **`stopColor="currentColor"` + `className` on `<stop>`** — the only way to make SVG gradient stops respond to Tailwind's dark mode variants. Requires setting CSS `color` on the `<stop>` element via className.

6. **SVG clipPath for gradient reveal** — two identical paths: base layer (full opacity, flat color) + gradient layer (restricted by clipPath). Used to show "partial fill" effects without JavaScript.

7. **Pseudo-element double ring** — `before:absolute before:-inset-2 before:rounded-full before:border` on a `rounded-full` div creates an outer ring without a wrapper element. Use for icon containers, status indicators, avatar frames.

8. **`aspect-square` on icon containers** — guarantees circular containers stay circular regardless of content height. Always pair with `rounded-full` for circles.

9. **`m-auto` inside flex for centering** — icon inside a `flex` container with `m-auto` centers in all directions, equivalent to `items-center justify-center` but without requiring those on the container.

10. **`before:bg-(--color-border)` vertical divider** — Tailwind v4 CSS variable syntax. Pseudo-element `before:absolute before:inset-0 before:mx-auto before:w-px` = 1px centered vertical line. No extra DOM element needed.

11. **`ring-background` for avatar-on-divider separation** — `ring-4 ring-background` paints the card's background color as a ring, visually lifting the avatar off whatever is behind it (lines, other avatars, backgrounds). Better than transparent gap.

12. **`calc(50% ± half-avatar-size)` for center-line avatar alignment** — right-aligned: `w-[calc(50%+0.875rem)]`. Left-aligned: `ml-[calc(50%-1rem)]`. Centers the avatar on the divider line precisely. Adjust the rem value to match avatar size.

13. **`-mb-6 -mr-6` bleed panels** — negative margins cancel parent `p-6` to let inner panels reach card edges. Pair with `border-l border-t` (only visible edges) and `overflow-hidden` on the card for clean clipping.

14. **`rounded-tl-(--radius)` for single-corner rounding** — Tailwind v4 syntax. Rounds only the interior corner of a bleed panel. The other corners are hidden by overflow or abut the card edge.

15. **`sm:w-[150%]` overflowing chart** — charts that bleed off the right edge communicate "data continues." The card's `overflow-hidden` clips safely. Feels richer than a chart that ends at the container boundary.

16. **Three-dot terminal chrome** — three `size-2 rounded-full` spans read as macOS window controls. Transforms a chart panel into a "software window" context, making technical content feel like a product screenshot.

17. **`fillRule="evenodd"` for area fill paths** — required when the fill path winds around itself (chart line + closure path). Ensures the fill region is the interior of the enclosed area regardless of winding direction.

18. **`strokeWidth={1}` for icon lightness** — Lucide icons with `strokeWidth={1}` feel lightweight and refined vs the default `strokeWidth={2}`. Match the surrounding design's visual weight. Bento feature cards are usually mid-weight, not bold.

19. **`space-y-12 lg:space-y-6`** — tight spacing on desktop (cards are wide, content fills them horizontally). More space on mobile where the column is narrow and content is stacked. Responsive spacing that tracks content density.

20. **`sm:-my-6 sm:-mr-6` on avatar column** — expands the right column to fill the card's padded edges on `sm+`, matching the bleed behavior of Card 4's chart panel. Keeps the visual language consistent across cards.

---

## AetherTrace Adaptation

### The Integrity Infrastructure Bento

AetherTrace's features section should mirror this bento approach — five distinct value props, each with a visual metaphor that communicates without explanation.

**Proposed card assignments:**

**Card 1 (stat):** `100% Immutable` → same oval background pattern, "100%" replaced with "SHA-256" in monospace, or "0 Alterations" as the stat. Communicates the zero-compromise invariant.

**Card 2 (circular icon):** Chain link / fingerprint icon with gradient reveal → the concentric circle SVG already looks like a fingerprint scanner or signal. Relabeled "Tamper-Evident by Design." The gradient reveal communicates "verified."

**Card 3 (chart):** Replace the download metrics chart with a custody event timeline — a live-looking sparkline showing evidence ingestion events over time. Header shows "AetherTrace Protocol" instead of "download.app."

**Card 4 (shield icon + waveform):** Relabeled "Defense-Grade Evidence Chain." Waveform reads as "constant verification activity." The shield icon is already perfect — no change needed.

**Card 5 (users + avatar column):** Relabeled "Multi-Party Custody" or "Independent Verification Network." Swap GitHub avatars for: Sub (contractor), Prime (GC), Auditor (third party) — three parties on the same chain, staggered alternating pattern matching the existing layout.

### AetherTrace Color Mapping

The component uses `text-primary-600 dark:text-primary-500` throughout for accent elements. In AetherTrace's design system:
- `primary`: teal (`#0d9488` or shadcn's teal palette)
- Chart lines, gradient overlays, horizontal accent rules → all teal
- Card background: `bg-[#0a1628]` (dark steel) or standard `bg-card` for mixed-mode

### The "Chain Health" Chart Variant (Card 3)

Instead of a download metrics chart, a chain integrity timeline:
```
X-axis: time (last 30 days)
Y-axis: custody events logged
Line: smooth curve showing evidence ingestion rate
Area: teal/15 fill
Annotation: "Last sealed: 4 minutes ago" badge in the header
```
The chart communicates active use — the chain is being written, not just existing. Operational aliveness matters for a protocol that needs to be trusted.

---

## Raw Code Reference
See: `016-features-bento-grid-code.tsx`
