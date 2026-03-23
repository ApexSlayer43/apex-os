# 014 — Shareholder Reports Carousel (Horizontal Scroll + CSS Snap + Scroll State Tracking)

**Source:** 21st.dev
**Type:** Content browsing component — horizontal scroll carousel with navigation arrows and snap scrolling
**Stack:** React, Tailwind CSS, TypeScript, shadcn CSS tokens
**Dependencies:** `lucide-react`, `@/lib/utils` (cn), `tailwind-scrollbar-hide`
**Install:** `npm install lucide-react tailwind-scrollbar-hide`

## What Makes This Hit

This is the investor relations page pattern — the one Zomato, Eternal, and every modern IR page uses. It's a horizontal document library that lives between a data table and an interactive gallery. The technical execution is unusually clean: no Framer Motion, no scroll libraries, no state machines — just three pieces of native browser behavior (CSS snap, `scrollBy`, scroll event measurement) wired together with two boolean state variables. The result is a component that feels polished and intentional with minimal complexity.

---

## `React.forwardRef` — Why the Section Gets a Ref

```tsx
const ShareholderReports = React.forwardRef<HTMLElement, ShareholderReportsProps>(
  ({ reports, title, subtitle, className }, ref) => {
    return <section ref={ref} className={...}>
```

`React.forwardRef` lets the parent pass a `ref` that attaches to the `<section>` element inside the component. Without it, a parent couldn't do:

```tsx
const reportsRef = useRef<HTMLElement>(null)
<ShareholderReports ref={reportsRef} />
reportsRef.current?.scrollIntoView({ behavior: "smooth" })
```

**When to use `forwardRef`:** Anytime a component is a semantic HTML section and the parent might need to scroll to it, measure it, or trigger focus on it. Standard for section-level components in single-page layouts where a navbar item jumps to that section.

**`displayName`:** Required when using `forwardRef`. Without it, the component appears as `"ForwardRef"` in React DevTools, error messages, and stack traces. `ShareholderReports.displayName = "ShareholderReports"` restores the readable name.

---

## Two Refs, One Component — The Ref Architecture

```tsx
// Forwarded ref: goes to <section> — for parent's scrollIntoView
const ShareholderReports = React.forwardRef<HTMLElement, ...>((props, ref) => {
  // Internal ref: goes to the scroll container — for scroll math
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  return (
    <section ref={ref}>          {/* ← parent's ref */}
      <div ref={scrollContainerRef}>  {/* ← our internal ref */}
```

The section and the scroll container are different elements with different purposes. The parent's ref is on the section (semantic structure). The internal ref is on the scroll container div (operational mechanics). They're never the same element — a section-level scroll-to is not the same as a container-level scroll measurement.

**The split:** `ref` (forwarded) handles the "where is this section?" question. `scrollContainerRef` (internal) handles the "how far has the user scrolled inside it?" question.

---

## `checkScrollability` — Reading Three Properties

```tsx
const checkScrollability = useCallback(() => {
  const container = scrollContainerRef.current
  if (!container) return

  setCanScrollLeft(container.scrollLeft > 0)
  setCanScrollRight(
    container.scrollLeft + container.clientWidth < container.scrollWidth - 1
  )
}, [])
```

Three DOM properties drive both arrow states:

- **`scrollLeft`** — how many px the container has scrolled from its left edge. `0` = fully scrolled to start. Increasing value = scrolled right.
- **`clientWidth`** — the visible width of the container (the "viewport" into the scroll content). Does not change as the user scrolls.
- **`scrollWidth`** — the total width of all content inside the container, whether visible or not.

**The math:** At rest: `scrollLeft = 0`, `scrollLeft + clientWidth < scrollWidth` → canScrollLeft false, canScrollRight true. Fully scrolled right: `scrollLeft + clientWidth ≈ scrollWidth` → both flip.

**The `-1` offset:**
```tsx
container.scrollLeft + container.clientWidth < container.scrollWidth - 1
```
Sub-pixel rendering can make `scrollWidth` 1px larger than the exact sum of scrollLeft + clientWidth even at the rightmost position. Without this `-1` buffer, the right arrow stays enabled when the user is fully scrolled right — it enables pressing the button and the container doesn't move, which looks broken. The `-1` collapses that edge case.

---

## The Scroll Event Listener — Passive Flag

```tsx
useEffect(() => {
  const container = scrollContainerRef.current
  if (!container) return

  checkScrollability()  // run once on mount

  container.addEventListener("scroll", checkScrollability, { passive: true })
  return () => container.removeEventListener("scroll", checkScrollability)
}, [checkScrollability])
```

**`{ passive: true }`:** Scroll event listeners can call `preventDefault()` to block the browser's native scroll behavior. When a listener is marked passive, the browser knows it will never call `preventDefault()` — this allows the browser to start scrolling immediately without waiting for the listener to finish executing. The performance gain is especially noticeable on touch devices and low-powered hardware.

**Initial `checkScrollability()` call:** The component might mount in a state that's already partially scrolled (e.g. browser restoring scroll position). Running the check immediately on mount ensures the arrow states are accurate from the first render.

**Cleanup:** `removeEventListener` in the return function. Without cleanup, if the component unmounts and remounts (tab switching, list virtualization, etc.), a new listener is added without the old one being removed — the handler fires twice per scroll event. Memory leak and double state updates.

---

## `scroll()` — 80% Width, Not 100%

```tsx
const scroll = useCallback((direction: "left" | "right") => {
  const container = scrollContainerRef.current
  if (!container) return

  container.scrollBy({
    left: direction === "right" ? container.clientWidth * 0.8 : -(container.clientWidth * 0.8),
    behavior: "smooth",
  })
}, [])
```

**`container.clientWidth * 0.8` instead of `1.0`:** At 100%, pressing the arrow scrolls an entire viewport width — the user loses their position reference entirely. No card from the previous view remains visible. At 80%, one card from the previous view remains partially visible at the edge after scrolling. This is the visual continuity cue — the user can see they moved forward, not teleported. The remaining sliver of the previous card anchors their sense of position in the list.

**`container.scrollBy()` vs `container.scrollLeft += amount`:** `scrollBy` takes `behavior: "smooth"` as a first-class option. Assigning to `scrollLeft` directly produces an instant jump. The smooth scroll is what makes the arrow buttons feel native rather than hacky.

**`useCallback` dependency:** The callback only reads `scrollContainerRef.current` (a ref, stable across renders) and doesn't depend on component state. Empty dependency array is correct — the function never needs to be recreated.

---

## CSS Snap Scrolling — Three Properties That Work Together

```tsx
// Scroll container
className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide"

// Card wrapper
<div key={report.id} className="snap-start">
  <ReportCard report={report} />
</div>
```

Three CSS properties create the snap behavior:

1. **`snap-x`** on the container — enables CSS scroll snapping in the horizontal axis. The scroll snap context lives on the overflow container.
2. **`snap-mandatory`** on the container — scroll MUST come to rest at a snap point. The alternative is `snap-proximity` (snaps only if scroll position is close enough to a point). Mandatory is correct for a card carousel — always land on a card, never between cards.
3. **`snap-start`** on each card — the left edge of the card is the snap point. When scrolling stops, the browser aligns the container's scroll position to the nearest `snap-start` element's left edge.

**Why snap is on the card wrapper, not the card:** If the card dimensions change (responsive resizing, different content lengths), the snap anchor moves. Putting `snap-start` on a fixed-position wrapper keeps the snap point at the left edge of the card slot regardless of what's inside.

**Interaction with `scrollBy`:** `scrollBy({ behavior: "smooth" })` and CSS snap cooperate. After `scrollBy` completes its smooth scroll animation, the browser's snap logic kicks in and finalizes the position at the nearest snap point. The JS scroll and CSS snap don't conflict — snap only applies when scrolling ends.

---

## `scrollbar-hide` — Functional Scroll Without Visual Scrollbar

```tsx
className="overflow-x-auto scrollbar-hide"
```

`scrollbar-hide` (from `tailwind-scrollbar-hide` plugin) hides the native horizontal scrollbar while keeping the overflow-x-auto scroll interaction intact. The scrollbar is cosmetically hidden — users can still scroll with touch swipe, trackpad swipe, or keyboard — but the scrollbar track doesn't appear.

**Why hide it?** On macOS with "Show scrollbars: When scrolling", the scrollbar appears and disappears mid-scroll, causing layout shifts. On Windows, the scrollbar is permanently visible and takes 15-17px of width, causing cards to shift slightly. Hiding it produces consistent layout across OS/browser combinations. The nav arrows communicate "this scrolls" — the scrollbar isn't necessary for affordance.

---

## The `-mx` / `px` Bleed Pattern

```tsx
className="-mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
```

This pattern allows the scroll container to bleed edge-to-edge on mobile while maintaining the section's content padding. Here's how it works:

- The `<section>` has `px-4` padding (or the parent grid column has gutter padding).
- `-mx-4` on the scroll container negates that padding — the container now extends to the screen edge.
- `px-4` on the scroll container itself adds padding back — but only at the start and end of the scroll content.

Result: the card row starts flush with where the first card would be in the grid, and the scroll container itself touches the screen edges. On mobile, this makes the carousel feel full-width rather than inset. On larger screens (sm, lg), the same math scales up with the section padding.

**Without this:** The scroll container is constrained within the section's padding. Cards never reach the edge of the screen. The carousel looks like a contained widget rather than a full-width section.

---

## `pb-4` — Preventing Shadow Clipping

```tsx
className="flex gap-4 overflow-x-auto ... pb-4"
```

The card's `hover:shadow-lg` effect creates a drop shadow below the card. By default, `overflow: hidden` would clip anything outside the container's bounds — including shadows that extend below the cards. `pb-4` adds 16px of padding at the bottom of the scroll container, giving the shadow room to render without being clipped.

**Always add padding when shadow can bleed:** Any time you have `overflow-hidden` or `overflow-auto` containers with children that have box shadows, the shadow needs room inside the overflow boundary or it gets clipped.

---

## Card Hover — Lift + Scale + Shadow (All CSS)

```tsx
// On the outer card div:
"hover:-translate-y-1 hover:shadow-lg hover:shadow-black/20"

// On the cover image:
"transition-transform duration-500 group-hover:scale-105"
```

Two separate hover effects:
1. **Card lift:** `-translate-y-1` moves the entire card 4px upward. `shadow-lg shadow-black/20` adds a diffuse shadow that makes the lift feel three-dimensional.
2. **Image zoom:** `group-hover:scale-105` scales the cover image 5% — the `overflow-hidden` on the image container clips the overflow, so it appears as a subtle zoom within the card bounds.

**`group` pattern:** `group` on the card div, `group-hover:scale-105` on the image inside. Framer Motion is not needed — CSS `group-hover` propagates hover state from parent to any descendant with `group-hover:` classes, without JavaScript.

**`duration-500` on image vs `duration-300` on card:** The image zoom is slower (500ms) than the card lift (300ms implied by `transition-all`). The lift snaps quickly — immediate feedback. The zoom settles slowly — feels luxurious, like a physical object being examined. The asymmetric timing is intentional.

---

## `isNew` Badge — `bg-primary` Token

```tsx
{report.isNew && (
  <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground tracking-wide">
    NEW
  </span>
)}
```

`bg-primary text-primary-foreground` are shadcn's accent color tokens. In a default shadcn theme, primary is the brand's main action color (often indigo or slate-900 in dark mode). Using the token instead of a hardcoded color means:
1. The badge automatically matches the site's theme without per-project hardcoding.
2. Swapping the entire site's primary color (via shadcn's theme config) updates the badge for free.
3. Dark mode support is automatic — shadcn tokens flip based on the `.dark` class.

**`tracking-wide`:** Small text badges need letter-spacing to read clearly. At `text-xs` (12px), default tracking feels cramped for uppercase labels. `tracking-wide` adds 0.025em between letters.

---

## Navigation Arrows — Hidden on Mobile

```tsx
<div className="hidden shrink-0 items-center gap-2 sm:flex">
  {/* arrows */}
</div>
```

`hidden sm:flex` — the arrow buttons don't exist in the visual layout on mobile. Touch devices scroll natively with swipe. Showing arrows on mobile would add UI elements that duplicate native behavior and take space from the heading/subtitle row.

**`shrink-0` on the arrow container:** The header row uses `flex` with the title on the left and arrows on the right. `shrink-0` prevents the arrow container from compressing if the title text wraps. Without it, a long title could push the arrows together or cause them to overlap.

**`disabled:opacity-30`:** At 0 (start), the left arrow dims. At the end of the list, the right arrow dims. The arrow is still in the DOM — no layout shift — but clearly communicates "no more scrollable content in this direction."

---

## Mobile Scroll Hint

```tsx
<p className="mt-3 text-center text-xs text-muted-foreground sm:hidden">
  Swipe to explore
</p>
```

`sm:hidden` — appears only on mobile. Arrow buttons communicate scrollability on desktop. Mobile users have no arrows, so a text hint fills that gap. The hint is minimal — it doesn't need to explain much. The physical affordance of "cards partially visible at the edge" already communicates scrollability; the text reinforces it.

---

## `aspect-[3/4]` — Image Container Sizing

```tsx
<div className="relative overflow-hidden aspect-[3/4]">
  <img className="h-full w-full object-cover ..." />
```

`aspect-[3/4]` maintains a consistent portrait aspect ratio regardless of the card width. As the card width changes (240px mobile → 280px sm), the image height adjusts proportionally. `h-full w-full object-cover` fills the aspect-ratio box regardless of the image's intrinsic dimensions.

**Why portrait?** Document/report covers are inherently portrait-oriented (like a book or PDF). Portrait cards in a horizontal carousel create a natural visual rhythm — tall and narrow, scanning left to right. Landscape cards in a horizontal carousel would make the carousel very tall for the amount of content shown per card.

---

## Design Principles to Extract

1. **`React.forwardRef` for section components** — allows parents to call `scrollIntoView()` on a named section. Standard for any section-level component in single-page layouts. Always add `displayName`.

2. **Two refs in one component** — forwarded ref for parent access (the section element), internal ref for operational mechanics (the scroll container). Never confuse them. Different elements, different purposes.

3. **`scrollLeft`, `scrollWidth`, `clientWidth` triad** — the three properties that determine scroll position state. `canScrollLeft = scrollLeft > 0`. `canScrollRight = scrollLeft + clientWidth < scrollWidth - 1`. All scroll state logic derives from these three.

4. **`-1` precision offset for right-edge detection** — sub-pixel rendering makes `scrollLeft + clientWidth` slightly less than `scrollWidth` even at the rightmost position. Subtracting 1px prevents the right arrow from staying enabled at the end of the list.

5. **`{ passive: true }` on scroll listeners** — marks the listener as non-blocking. Browser can start scrolling immediately without waiting for the JS handler. Required for scroll performance on mobile.

6. **80% viewport scroll, not 100%** — `clientWidth * 0.8` keeps one card partially visible from the previous view after scrolling. Visual continuity cue. 100% is a teleport; 80% is a navigation.

7. **`scrollBy` with `behavior: "smooth"` over direct `scrollLeft` assignment** — built-in smooth animation, works with CSS snap, no polyfill needed.

8. **`snap-x snap-mandatory` + `snap-start` pair** — the container declares the snap context; each card wrapper declares its snap point. Always use `snap-mandatory` for carousels (always land on a card). Use `snap-start` on a wrapper so card dimension changes don't shift the anchor.

9. **`scrollbar-hide` for cross-platform consistency** — hides the scrollbar cosmetically without breaking scroll interaction. Prevents OS-specific scrollbar appearance differences from causing layout shifts.

10. **`-mx-4 px-4` bleed pattern** — negate the parent's padding with negative margin, restore it with matching padding on the scroll container. Makes the card row full-width on mobile while keeping card content aligned to the grid.

11. **`pb-4` to prevent shadow clipping** — `overflow-auto` clips box shadows that extend outside the container. Add bottom padding equal to or greater than the shadow spread to give shadows room.

12. **CSS `group` + `group-hover` for multi-element hover** — `group` on the card, `group-hover:scale-105` on the image inside. Parent hover state cascades to descendants without JavaScript event listeners or state.

13. **Asymmetric transition duration for enter/exit quality** — card lift: 300ms (responsive, immediate). Image zoom: 500ms (slow, deliberate). Quick lift + slow zoom creates a physical luxury feel. Same duration for both feels mechanical.

14. **`shrink-0` on flex children that must not compress** — the arrow button container uses `shrink-0` to prevent title text wrapping from pushing arrows together.

15. **`hidden sm:flex` for device-appropriate affordances** — arrows are for pointer devices, swipe is for touch. Showing both is redundant. Split them with responsive display classes.

16. **shadcn CSS tokens for badge color** — `bg-primary text-primary-foreground` for the isNew badge. Uses the site's theme system. Free dark mode support. Free theme switching.

17. **Portrait `aspect-[3/4]` for document carousels** — document covers are portrait by nature. Portrait cards in horizontal carousels create natural visual rhythm. Fixes height across responsive widths.

18. **Scroll hint text on mobile only** — `sm:hidden` text hint fills the affordance gap created by hiding arrows on mobile. The partially visible edge card is the primary cue; text is reinforcement.

---

## AetherTrace Adaptation

**The Evidence Package Archive** — the section where authenticated users browse and download past exports.

Every custody export produces a PDF + ZIP bundle. After enough projects run through the chain, the archive becomes a valuable asset — a timestamped, hash-verified history of every sealed package. This component is the right pattern for browsing that archive.

### Evidence Package as Report Card

```tsx
interface EvidencePackage {
  id: string
  projectName: string       // maps to: title
  dateRange: string         // maps to: period ("Mar 1 – Mar 15, 2024")
  year: string              // maps to: year
  thumbnailUrl: string      // maps to: coverImage (PDF preview page 1)
  isNew: boolean            // maps to: isNew (exported < 7 days ago)
  bundleSize: string        // maps to: fileSize ("3.4 MB")
  itemCount: number         // maps to: pages (renamed to "items")
}
```

### Section Variant
```tsx
<ShareholderReports
  title="Custody Archive"
  subtitle="All exported evidence packages — hash-verified, court-ready"
  reports={packages.map(pkg => ({
    id: pkg.id,
    title: pkg.projectName,
    period: pkg.dateRange,
    year: pkg.year,
    coverImage: pkg.thumbnailUrl,
    isNew: pkg.exportedWithin7Days,
    fileSize: pkg.bundleSize,
    pages: pkg.itemCount,
  }))}
/>
```

### Styling Adjustments
- Background: Section sits on `bg-[#060b14]` (AetherTrace deep navy)
- Card background: `bg-[#0a1628]` or `bg-[#0d1f3c]` — steel dark instead of warm card
- Badge: Replace "NEW" with "SEALED" (teal) or "VERIFIED" (green) — use semantic status not recency
- Cover image: The first page of the PDF export, server-rendered as a thumbnail at export time
- Gradient overlay on image: `from-teal-900/60 to-transparent` — AetherTrace teal instead of black/50
- Arrow buttons: Use teal border/hover instead of default foreground tokens

### The Conceptual Fit
The pattern that makes this work for AetherTrace: investors browse reports → clients browse sealed custody packages. Both are browsing a curated archive of authoritative documents. The horizontal carousel communicates "there's a history here — scroll through it." For AetherTrace, that history is the proof. Every card in the carousel is a sealed moment in time that can't be altered. The carousel IS the ledger, made visual.

### Verification Badge Variant
Instead of "NEW" → "VERIFIED" with a green background when the package has been independently verified:
```tsx
isVerified ? (
  <span className="rounded-full bg-green-600/90 px-2.5 py-1 text-xs font-semibold text-white">
    ✓ VERIFIED
  </span>
) : (
  <span className="rounded-full bg-teal-600/90 px-2.5 py-1 text-xs font-semibold text-white">
    SEALED
  </span>
)
```
Two states: SEALED (custody locked, not yet independently verified) vs. VERIFIED (third-party verification completed). This maps directly to AetherTrace's two-phase custody model and communicates chain integrity at a glance.

---

## Raw Code Reference
See: `014-shareholder-reports-carousel-code.tsx`
