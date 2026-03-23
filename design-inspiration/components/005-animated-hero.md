# 005 — Animated Hero (Cycling Title Words)

**Source:** 21st.dev
**Type:** Hero section / Headline word cycling animation
**Stack:** React, Tailwind CSS, TypeScript, Framer Motion, shadcn/ui
**Dependencies:** `framer-motion`, `lucide-react`, `@radix-ui/react-slot`, `class-variance-authority`
**Install:** `npm install framer-motion lucide-react @radix-ui/react-slot class-variance-authority`

## What Makes This Hit

### The Core Mechanic
A **vertical word ticker** embedded inside a headline. One container holds N words simultaneously. All N are absolutely positioned in the same slot. Only one is visible at a time — the active word slides in from below with a spring physics feel, the previous word exits upward, all others wait out of frame below. This creates the illusion of a single word slot that cycles through options.

The state machine is elegantly minimal:
- `titleNumber` (integer) — index of currently visible word
- `setTimeout` cycling every 2000ms — advances `titleNumber % titles.length`
- Framer `animate` prop receives the `index` vs `titleNumber` comparison:
  - `index === titleNumber` → `y: 0, opacity: 1` (show this word)
  - `index < titleNumber` → `y: -150, opacity: 0` (exit upward — already shown)
  - `index > titleNumber` → `y: 150, opacity: 0` (waiting below — not yet shown)

### Visual Details
- **`overflow-hidden` container** — the slot `<span>` clips the absolute words as they travel through y: ±150. Without this, the words would be visible outside the headline region mid-transition.
- **`&nbsp;` placeholder** — the empty `&nbsp;` inside the container gives the slot its height before any word renders. Without it the container collapses to 0 height.
- **Spring physics** — `type: "spring", stiffness: 50` gives each word entrance a natural bounce-deceleration feel. Lower stiffness = slower, softer landing. Higher = snappier.
- **`absolute` positioning** — all words occupy the same (x, y) origin within the container. The container doesn't reflow when words swap. No layout shift.
- **Directional exit logic** — `titleNumber > index ? -150 : 150` means past words exit UP (continuing their direction of travel), future words wait BELOW (entering from below when their time comes). This creates a consistent "slot machine rolling upward" feel.

### Layout Architecture — The Three-Layer Hero Stack
1. **Badge row** — announcement pill / CTA using `<Button variant="secondary">` with an icon. Small, top-aligned, draws the eye first.
2. **Headline block** — large `text-5xl → text-7xl`, `max-w-2xl`, centered. Static text + animated word slot inline.
3. **Subhead + CTA row** — muted body text then a two-button row (outline secondary + filled primary).

This is the canonical modern SaaS hero structure. Every B2B and dev-tools site uses some version of this. Its power is in the ordering — badge creates social proof, headline makes the promise, subhead explains the mechanism, CTAs capture intent.

### shadcn/ui Integration
- **`<Button>`** — uses the full shadcn button component with `variant` and `size` props. Brings in `@radix-ui/react-slot` (for `asChild` composition), `class-variance-authority` (for variant management), and the `cn()` utility.
- **Design token references** — `text-muted-foreground`, `bg-primary`, `bg-secondary`, `border-input`, `hover:bg-accent` are all shadcn CSS variable references. The component automatically adapts to any shadcn theme.
- **`text-spektr-cyan-50`** — a custom color token (not default shadcn). Requires adding to `tailwind.config.js`:
  ```js
  colors: {
    spektr: {
      cyan: { 50: '#your-color-here' }
    }
  }
  ```
  Or replace with any Tailwind color class (`text-cyan-100`, `text-sky-200`, etc.).

### Adaptation Notes
**Replace the cycling words** with brand-relevant terms:
- AetherTrace: `["immutable", "verifiable", "cryptographic", "court-ready", "tamper-proof"]`
- The static opener becomes: `"Your evidence is"`
- Each cycling word completes the sentence

**Color swap for dark/technical themes:**
- Replace `text-spektr-cyan-50` with `text-emerald-400` or `text-white`
- Set `bg-background` to black, update `text-muted-foreground` to white/40
- Spring stiffness can go up to 80-100 for a snappier technical feel

**Timing:** 2000ms per word. For more urgency: 1500ms. For more gravitas: 2500ms.

**Add a gradient** to the cycling word slot to make the active word feel more energetic:
```tsx
className="absolute font-semibold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent"
```

### Design Principles to Extract
1. **Word cycling in a fixed-height slot** is a dead-simple way to convey product range without switching pages or adding sections. One container, N value props.
2. **`overflow-hidden` + `absolute` positioning** is the core technique. The container holds height via `&nbsp;`, words stack in the same slot, clip at the boundary.
3. **Directional exit logic** (`past exits UP, future waits BELOW`) creates a consistent physics narrative — the slot always rolls in one direction, like a real mechanical ticker.
4. **Spring physics for text entrances** — `stiffness: 50` feels natural without feeling slow. This is the sweet spot for headline-size text.
5. **The badge/announcement pill** above a hero headline is the highest-leverage trust element. It signals active momentum ("we just launched...") before the value prop lands.
6. **`text-muted-foreground` for body text** — always use the semantic token, never a raw gray class. Adapts to dark/light mode automatically.
7. **Two-button CTA pattern** — outline (soft ask: call/learn more) + filled (hard ask: sign up/start). The contrast directs attention to the primary action while keeping the secondary visible.
8. **`tracking-tighter` on large headlines** — at `text-5xl`+ tight tracking looks intentional and modern. Default tracking looks like a template.
9. **`useMemo` for static arrays in effects** — `titles` wrapped in `useMemo` prevents the array from being recreated on every render, avoiding infinite effect loops. Important pattern whenever arrays live inside components with `useEffect` deps.
10. **`font-regular` on the headline, `font-semibold` on the cycling word** — weight contrast within a single headline line draws the eye to the animated word.

### Project Setup (if starting from scratch)
```bash
# 1. Initialize shadcn project
npx shadcn@latest init

# 2. Add button component
npx shadcn@latest add button

# 3. Install animation deps
npm install framer-motion lucide-react

# 4. Place component at /components/ui/animated-hero.tsx
```

**Why `/components/ui/`?** shadcn's convention. All base components live here. The CLI auto-generates to this path. Keeping components here ensures `@/components/ui/button` imports resolve without path changes and aligns with any tooling that expects the shadcn structure.

## Raw Code Reference
See: `005-animated-hero-code.tsx`
