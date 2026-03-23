# 007 — Hero Section 5 (Full-Page Hero + Scroll Nav + Infinite Slider)

**Source:** 21st.dev
**Type:** Complete hero page layout — fixed nav + fullscreen video hero + social proof logo bar
**Stack:** React, Tailwind CSS, TypeScript, motion/react, framer-motion, shadcn/ui
**Dependencies:** `motion`, `framer-motion`, `lucide-react`, `@radix-ui/react-slot`, `class-variance-authority`, `react-use-measure`
**Install:** `npm install motion framer-motion lucide-react @radix-ui/react-slot class-variance-authority react-use-measure`

## What Makes This Hit

### Three Independent Systems Working Together
This component is really three systems:
1. **Scroll-aware frosted glass nav** — fixed header that transitions on scroll
2. **Fullscreen video hero** — CSS-inverted background video with foreground text overlay
3. **Infinite logo slider** — physics-driven ticker with dual edge fade (gradient + progressive blur)

Each system is independently reusable. The combination is a complete, production-quality landing page above-the-fold experience.

---

## System 1: Scroll-Aware Frosted Glass Nav

### The Scroll Detection Pattern
```tsx
const { scrollYProgress } = useScroll();
scrollYProgress.on('change', (latest) => {
  setScrolled(latest > 0.05);
});
```
`useScroll()` from `motion/react` returns a `MotionValue` (not a React state) that updates continuously without re-renders. The `.on('change', cb)` subscription fires the callback when the value changes. At 5% scroll depth (`> 0.05`), `scrolled` flips to `true`.

**Why `MotionValue` instead of `window.addEventListener('scroll')`?**
- MotionValue subscriptions are passive by default, no performance impact
- Automatic cleanup via the returned `unsubscribe` function
- Integrated with Framer Motion's rendering pipeline — smoother

### Frosted Glass Transition
```tsx
cn('...rounded-3xl px-6 transition-all duration-300', scrolled && 'bg-background/50 backdrop-blur-2xl')
```
`bg-background/50` — 50% opacity background color (adapts to dark/light mode via CSS variable).
`backdrop-blur-2xl` — 40px blur of whatever is behind the nav. Creates the frosted glass effect.
`transition-all duration-300` — smooth 300ms interpolation when `scrolled` flips.

The nav starts completely transparent (invisible on top of the hero image). On scroll it materializes — glass pill floating above the page content.

### CSS-Only Hamburger Icon Swap
The hamburger ↔ X animation uses **zero JavaScript state for the icons**. The `data-state` attribute on the `<nav>` element drives the entire animation:

```tsx
<nav data-state={menuState && 'active'} className="group ...">
  <Menu className="group-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 duration-200" />
  <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 -rotate-180 scale-0 opacity-0 duration-200" />
```

When `data-state="active"`:
- Menu icon: rotates 180°, scales to 0, fades out
- X icon: rotates from -180° to 0°, scales from 0 to 100%, fades in

This is the **Tailwind group-data attribute pattern** — extremely powerful for CSS-driven state animations without JavaScript animation libraries. The `className` strings read as conditionals: "when ancestor has `data-state=active`, apply these classes."

### Mobile Menu Panel
```tsx
className="... group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden ..."
```
Same pattern — the entire mobile menu panel is `display:none` by default (`hidden`). When `data-state=active` exists on the parent nav, `group-data-[state=active]:block` overrides it to show. On desktop (`lg:`), it's `flex` always via `lg:flex`.

---

## System 2: Fullscreen Video Hero

### The CSS `invert` Filter Technique
```tsx
className="opacity-50 invert dark:opacity-35 dark:invert-0 dark:lg:opacity-75"
```
This is a brilliant technique for light/dark mode video adaptation:
- **Light mode**: `invert` flips the video colors. A dark sci-fi video (DNA helix, particles) becomes a light, airy version. `opacity-50` tones it down.
- **Dark mode**: `dark:invert-0` removes the invert. `dark:opacity-35` or `dark:lg:opacity-75` — darker on mobile (preserve battery), brighter on desktop.

**This means a single dark-themed video works beautifully in both light and dark modes.** No need for two video sources. No JavaScript mode detection needed. Pure CSS.

### Hero Layout — Text on Video
```
[section]
  [div: relative py-24 lg:pt-72]
    [div: relative z-10]  ← foreground text
      headline, subhead, CTAs
    [div: absolute inset-1]  ← background video
      <video>
```
The `lg:pt-72` (288px top padding) pushes the text down so it sits vertically centered against the navbar. The video div is `absolute inset-1` — 4px inset from the section edges — with `overflow-hidden rounded-3xl border`. On mobile it's `aspect-[2/3]` (portrait crop); on desktop `sm:aspect-video` (16:9).

### Pill-Shaped CTAs
```tsx
className="h-12 rounded-full pl-5 pr-3 text-base"
```
`rounded-full` on `h-12` (48px tall) = perfect pill shape. `pl-5 pr-3` — more padding left, less right — because the ChevronRight icon at the end creates visual right-weight balance. Asymmetric padding for optical balance with icons is a detail that separates considered design from templates.

---

## System 3: Infinite Logo Slider

### InfiniteSlider Architecture
The `InfiniteSlider` works by:
1. `useMeasure()` (`react-use-measure`) — gets the real rendered width of the container
2. `useMotionValue(0)` — creates a Framer `MotionValue` for the X translation
3. `animate(translation, [from, to], { repeat: Infinity, repeatType: 'loop' })` — drives the value continuously
4. **Children rendered twice** (`{children}{children}`) — the list is duplicated so when it reaches the end, the second copy is already in place. The animation resets to `from` on each `onRepeat` callback, creating a seamless loop.

The `contentSize = width + gap` ensures the animation loop distance matches the actual rendered content size (measured live, not hardcoded).

**Hover velocity change:**
When `durationOnHover` prop is provided, hovering triggers `setIsTransitioning(true)` and a new duration. The `isTransitioning` branch uses `Math.abs((translation.get() - to) / contentSize)` to calculate the remaining fraction of the loop and adjusts the transition duration proportionally. The slider smoothly accelerates/decelerates rather than jumping speed instantly.

### ProgressiveBlur Architecture
Standard `backdrop-filter: blur(Npx)` creates a hard blurred edge. `ProgressiveBlur` creates a **graduated blur**: 8 layered `<div>` elements stacked, each with:
- `backdropFilter: blur(index * blurIntensity)`  — increasing blur per layer
- `maskImage: linear-gradient(...)` — each layer only shows a thin band of the gradient

The result: blur goes from 0 at the content center to `8 * blurIntensity`px at the edge. Visually, the logos "dissolve" into blur rather than hitting a sharp cutoff.

**Dual-edge treatment with two techniques:**
```tsx
{/* Gradient color fade */}
<div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
{/* Progressive blur */}
<ProgressiveBlur className="absolute left-0 top-0 h-full w-20" direction="left" blurIntensity={1} />
```
Both applied simultaneously: the color gradient hides logos by matching background color, the blur adds physical softness. Double-layered edge treatment is what separates premium sliders from generic ones.

### `dark:invert` on Logo Images
All logo `<img>` elements have `dark:invert`. SVG logos are typically black on transparent. In dark mode, `invert` flips them to white. Simple, automatic, no separate dark-mode versions needed.

---

## Design Principles to Extract

1. **`useScroll` MotionValue + `.on('change')` subscription** is the correct scroll detection pattern in Framer/motion projects. No event listeners, no cleanup ceremonies.
2. **Frosted glass nav: starts transparent, materializes on scroll** — the nav being invisible initially lets the hero image breathe. The glass pill appearing on scroll is the reveal moment.
3. **CSS `invert` filter + opacity for dark/light video adaptation** — one video source, two modes. Any high-contrast dark video works in light mode inverted.
4. **`group-data-[state=active]:*` Tailwind pattern** for CSS-driven state animations — no JavaScript animation logic, no `AnimatePresence`, no springs. Just attribute + class. Use for hamburgers, dropdowns, accordions.
5. **`data-state` attribute on ancestor + `group` class** = CSS state machine pattern. The hamburger icon swap is ~4 lines of Tailwind and zero JS animation code.
6. **Asymmetric button padding** (`pl-5 pr-3`) — compensate for icon visual weight. Always reduce padding on the icon side.
7. **`useMeasure` for dynamic content sizing** — never hardcode slider/carousel dimensions. Measure the DOM, use real values. Adapts to any content, any screen size.
8. **Children doubled (`{children}{children}`) for infinite loop** — the simplest infinite scroll technique. No complex position tracking. Just duplicate and reset.
9. **Dual edge fade: gradient color + progressive blur** — gradient hides logos; blur softens them. Both together look premium. Either alone looks adequate.
10. **`aspect-[2/3]` on mobile, `sm:aspect-video` on desktop** — adaptive video aspect ratio. Portrait on mobile (fills the screen differently), landscape on desktop (cinema feel).
11. **`text-balance` on headlines** — CSS `text-wrap: balance` distributes line breaks more evenly for multi-line headlines. One class, better typography.
12. **`lg:pt-72` large top padding** — gives the navbar room and vertically positions the hero text in the lower third of the viewport. The text "lands" in the reading zone, not at the very top.

---

## AetherTrace Adaptations

**Nav:** Replace logo SVG with AetherTrace wordmark. Nav items: "How It Works", "Adopters", "Evidence API", "Pricing". Auth buttons: "Request Access" + "Verify Evidence".

**Video:** Replace DNA video with a dark particle/chain animation. With CSS `invert`, a black-background chain-link animation would appear white/light on the light-mode hero. The `opacity-50` keeps it subtle.

**Headline:** "Your Evidence. Cryptographically Sealed." + subhead: "AetherTrace transforms raw events into mathematically unalterable records — before disputes begin."

**CTA Pills:** "Start Protecting Evidence" (primary, pill) + "See How It Works" (ghost pill).

**Logo Bar:** "Trusted by" → swap logos for subcontractor association logos (ASA, ABC) and government agency seals. Or use text-based client names if logo rights are a concern.

## Setup
```bash
npx shadcn@latest init
npx shadcn@latest add button card
npm install motion framer-motion lucide-react react-use-measure @radix-ui/react-slot class-variance-authority
```

## Raw Code Reference
See: `007-hero-section-5-code.tsx`
