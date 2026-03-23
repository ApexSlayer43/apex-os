# AetherTrace Build Protocol — How to Use the Vault
**Standing order effective:** March 23, 2026

---

## The Problem This Solves

Without a protocol, the vault becomes shelf furniture. Components get cataloged and never touched.
This protocol makes the vault the FIRST stop, not an afterthought.

---

## Standing Orders for Every UI Build Session

### Step 1 — Check VAULT-MAP.md before writing any UI code
Open `Aethertrace/design-inspiration/VAULT-MAP.md`.
Find the page/section you're building.
Note the mapped component number.

### Step 2 — Read the code file before copying it
Open `Aethertrace/design-inspiration/components/0XX-name-code.tsx`.
The annotations explain WHY every decision was made.
The AetherTrace adaptation section at the bottom tells you exactly how to retheme it.

### Step 3 — Read the analysis file for any non-obvious pattern
Open `Aethertrace/design-inspiration/components/0XX-name.md`.
The "Design Principles to Extract" section is a checklist.
If the component uses a pattern you haven't seen before (e.g. `ring-background`, `before:bg-(--color-border)`), read it.

### Step 4 — Apply the adaptation, don't copy-paste raw
Every `.md` file has an "AetherTrace Adaptation" section.
Use the exact color swaps, copy changes, and variant specs written there.
Don't improvise the AetherTrace theme — it's already designed.

### Step 5 — Note what you used in the component status board
Update `VAULT-MAP.md` status column: `NOT MAPPED → IN USE → DEPLOYED`.
Keeps the map honest as the build progresses.

---

## Session Start Checklist

When beginning any UI build session, run through these in order:

```
□ 1. Read CLAUDE.md — confirm which MVP feature is the target
□ 2. Open VAULT-MAP.md — find the relevant component(s)
□ 3. Read the -code.tsx file for the mapped component
□ 4. Note the AetherTrace adaptation specs from the .md file
□ 5. Run the PRISM design system search if making color/typography decisions
       python3 ui-ux-pro-max/scripts/search.py "<query>" --design-system -p "AetherTrace"
□ 6. Build using vault components, not from scratch
```

---

## The Two Non-Negotiables

**1. Never build a UI section without checking the vault first.**
If the vault has a component that covers the use case, use it.
Building from scratch when the vault has the answer wastes time and produces inconsistent output.

**2. Never copy-paste raw — always apply the AetherTrace adaptation.**
Raw components have placeholder copy, wrong colors, and generic icons.
Every `.md` file has specific adaptation instructions. Follow them.

---

## When the Vault Doesn't Have What You Need

1. Note the gap — what component type is missing?
2. Find a candidate on 21st.dev
3. Feed it in as a new component (Casey pastes code, I catalog it)
4. Add it to VAULT-MAP.md before building with it

The vault grows with the build. Don't skip the catalog step.

---

## Component Readiness for Immediate Use

These components require minimal retheme — closest to production-ready:

| Component | Why It's Ready | What Still Needs Changing |
|---|---|---|
| **012 AI Input** | File upload, paste detection, progress states all work | Copy (model selector → chain type), color (indigo → teal), button label |
| **014 Reports Carousel** | Card gallery, scroll state, nav arrows all work | Content (reports → custody packages), badge (NEW → SEALED/VERIFIED), cover images |
| **016 Bento Grid** | Full layout, dark mode, responsive all work | Headings, body copy, icon choices, stat ("100%" → "SHA-256") |
| **015 Liquid Glass Button** | Glass effect, sizes, dark mode all work | Color (`text-white border` already used in demo — keep it) |
| **013 Logo Carousel** | Timing, animation, distribution all work | Actual logos (ASA, ABC, DoD shield, construction companies) |

---

## AetherTrace Design Tokens (Apply to All Components)

```css
/* Primary accent — teal */
--primary: #0d9488;          /* teal-600 */
--primary-foreground: #f0fdfa; /* teal-50 */

/* App backgrounds */
--background-deep: #060b14;   /* deep navy — page root */
--background-card: #0a1628;   /* steel dark — card surface */
--background-panel: #0d1f3c;  /* slightly lighter — panels */

/* Text */
--text-primary: #f1f5f9;      /* slate-100 */
--text-muted: #64748b;        /* slate-500 */
--text-teal: #5eead4;         /* teal-300 — accent text */

/* Status */
--status-sealed: #0d9488;     /* teal — active custody */
--status-verified: #16a34a;   /* green-600 — third-party verified */
--status-alert: #d97706;      /* amber-600 — tamper detected */
--status-error: #dc2626;      /* red-600 — chain broken */

/* Chain UI */
--chain-line: #1e3a5f;        /* navy — custody chain connectors */
--hash-text: #5eead4;         /* teal-300 — SHA-256 hashes in monospace */
```

Apply these by replacing shadcn token references in vault components:
- `text-primary-600` → `text-teal-600`
- `text-primary-500` → `text-teal-500`
- `bg-primary` → `bg-teal-600`
- `bg-card` → `bg-[#0a1628]`
- `bg-background` → `bg-[#060b14]`

---

## File Structure When Building

```
Aethertrace/
├── design-inspiration/
│   ├── VAULT-MAP.md          ← start here every session
│   ├── BUILD-PROTOCOL.md     ← this file
│   └── components/           ← 16 cataloged components
│       ├── 0XX-name-code.tsx
│       └── 0XX-name.md
│
├── src/                      ← actual AetherTrace Next.js app
│   ├── app/
│   │   ├── page.tsx          ← landing (uses 015, 016, 013)
│   │   ├── dashboard/        ← uses 009, 014
│   │   ├── project/[id]/     ← custody ledger view
│   │   ├── evidence/new/     ← uses 012
│   │   ├── verify/[hash]/    ← public verify (uses 015)
│   │   └── pricing/          ← uses 011, 015
│   └── components/
│       ├── ui/               ← shadcn primitives (Card, Button, etc.)
│       └── blocks/           ← adapted vault components live here
│           ├── landing-hero.tsx        ← from 015
│           ├── features-section.tsx    ← from 016
│           ├── evidence-input.tsx      ← from 012
│           ├── custody-archive.tsx     ← from 014
│           ├── sealing-overlay.tsx     ← from 011
│           └── verify-result.tsx       ← from 015
```

Vault components get adapted into `/src/components/blocks/` — never modify the vault originals.
The vault is read-only reference. `blocks/` is the build layer.

---

## The One-Sentence Rule

> Before writing a single line of UI code, say: "Which vault component covers this?"
> If the answer is "none," check the vault map again.
> Only build from scratch when you can confirm no vault component applies.
