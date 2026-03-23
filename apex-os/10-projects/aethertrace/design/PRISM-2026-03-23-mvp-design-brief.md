---
type: design-brief
agent: prism
project: aethertrace
status: complete
date: 2026-03-23
version: 2.0.0
sprint: S-2026-Q1-13
based-on:
  - "[[FORGE-2026-03-23-mvp-dual-path-blueprint]]"
  - "[[foundational-design-rules]]"
tags: [aethertrace, design, prism, visual-identity, ui, mvp]
summary: "Complete design brief for AetherTrace MVP. Trust Fortress style. Vault Steel palette. IBM Plex Sans typography. Page-by-page layout direction for all 6 routes. Component patterns. Accessibility non-negotiables. Handoff-ready for ANVIL."
---

# PRISM DESIGN BRIEF — AetherTrace

## The Design Problem

AetherTrace is not a dashboard. It is not a project management tool. It is not a photo app with a blockchain sticker on it.

AetherTrace is a **custody system**. The design must communicate one thing above all else: **this system is trustworthy because it is incapable of being anything else.** Not trustworthy because it says so. Trustworthy because the interface itself communicates restraint, permanence, and neutrality.

The users are construction subcontractors and federal contracting officers. They are not designers. They are not technologists. They are people who have been burned by systems that obscure, and they need a system that reveals. The design earns trust through what it *doesn't* do — no decorative animation, no playful copy, no gamified dashboards, no bright colors competing for attention. Everything serves the evidence.

### Design Principles (derived from Foundational Rules)

1. **Neutrality over personality** (A1) — AetherTrace is not Casey's ally or the user's friend. It is a neutral custodian. The design must feel institutional, not personal.
2. **Permanence over polish** (K1, I4) — Once evidence enters the system, it never changes. The UI must communicate finality. Upload → sealed. Plan activated → locked. Chain intact → verified.
3. **Transparency over trust** (K3, I5) — The verify page is the single most important design moment. Anyone can check. The design says: "Don't trust us. Verify."
4. **Restraint over capability** (A5, T2) — The system does not score, rank, interpret, or judge. The UI must never imply it does. No progress bars that suggest "good" or "bad." No color coding that implies quality. Status is binary: fulfilled or not. Chain is binary: intact or broken.
5. **Function over decoration** (T1) — Every visual element earns its place by serving custody. If it doesn't serve custody, it doesn't exist.

---

## VISUAL IDENTITY

### Style: Trust Fortress

Restrained palette (2–3 functional colors). Heavy whitespace. Institutional typography. Minimal animation — only where it communicates state change (upload complete, chain verified). No gradients. No glassmorphism. No rounded-everything softness. This is a vault, not a living room.

The closest physical analogy: a well-designed legal document. Clean margins. Clear hierarchy. Nothing decorative. Everything functional. The kind of document you'd hand to a judge and feel confident about.

### Palette: Vault Steel (Modified)

The core palette is Vault Steel from the Evidence/Legal/Compliance family, extended with semantic states and a dark mode variant.

#### Light Mode (Primary)

| Role | Color | Hex | Tailwind | Usage |
|------|-------|-----|----------|-------|
| **Primary** | Slate 800 | `#1E293B` | `slate-800` | Headers, primary buttons, nav background |
| **Secondary** | Slate 700 | `#334155` | `slate-700` | Secondary text, card headers, borders |
| **Accent** | Emerald 600 | `#059669` | `emerald-600` | Verified status, chain intact, success states |
| **Background** | Slate 50 | `#F8FAFC` | `slate-50` | Page background |
| **Surface** | White | `#FFFFFF` | `white` | Cards, panels, modals |
| **Text Primary** | Slate 900 | `#0F172A` | `slate-900` | Body text, headings |
| **Text Secondary** | Slate 600 | `#475569` | `slate-600` | Descriptions, metadata, timestamps |
| **Text Muted** | Slate 500 | `#64748B` | `slate-500` | Placeholders, disabled text |
| **Border** | Slate 200 | `#E2E8F0` | `slate-200` | Card borders, dividers, input borders |
| **Border Accent** | Slate 300 | `#CBD5E1` | `slate-300` | Focused input borders, hover states |

#### Semantic Colors (Both Modes)

| State | Color | Hex | Tailwind | Usage |
|-------|-------|-----|----------|-------|
| **Verified / Intact** | Emerald 600 | `#059669` | `emerald-600` | Chain intact, hash verified, requirement fulfilled |
| **Warning / Overdue** | Amber 500 | `#F59E0B` | `amber-500` | Overdue requirements, pending actions |
| **Error / Broken** | Red 600 | `#DC2626` | `red-600` | Chain broken, verification failed, system errors |
| **Pending** | Slate 400 | `#94A3B8` | `slate-400` | Unfulfilled requirements, awaiting upload |
| **Locked / Sealed** | Slate 800 | `#1E293B` | `slate-800` | Activated plans, sealed evidence (with lock icon) |

#### Dark Mode

| Role | Color | Hex | Tailwind | Usage |
|------|-------|-----|----------|-------|
| **Background** | Gray 950 | `#030712` | `gray-950` | Page background |
| **Surface** | Gray 900 | `#111827` | `gray-900` | Cards, panels |
| **Surface Elevated** | Gray 800 | `#1F2937` | `gray-800` | Modals, dropdowns, hover states |
| **Text Primary** | Gray 100 | `#F3F4F6` | `gray-100` | Body text, headings |
| **Text Secondary** | Gray 400 | `#9CA3AF` | `gray-400` | Descriptions, metadata |
| **Border** | Gray 700 | `#374151` | `gray-700` | Card borders, dividers |
| **Accent** | Emerald 500 | `#10B981` | `emerald-500` | Verified states (slightly brighter for dark bg) |

**Dark mode is secondary for MVP.** Build light mode first. Dark mode is a Tailwind `dark:` pass after light mode is complete. Do not build both simultaneously.

### Typography: IBM Plex Sans

| Role | Font | Weight | Size | Line Height | Tailwind |
|------|------|--------|------|-------------|----------|
| **Page Title** | IBM Plex Sans | 600 (Semibold) | 30px | 1.2 | `text-3xl font-semibold leading-tight` |
| **Section Header** | IBM Plex Sans | 600 (Semibold) | 20px | 1.3 | `text-xl font-semibold leading-snug` |
| **Card Title** | IBM Plex Sans | 500 (Medium) | 16px | 1.4 | `text-base font-medium` |
| **Body** | IBM Plex Sans | 400 (Regular) | 14px | 1.6 | `text-sm leading-relaxed` |
| **Small / Meta** | IBM Plex Sans | 400 (Regular) | 12px | 1.5 | `text-xs` |
| **Mono (hashes)** | IBM Plex Mono | 400 (Regular) | 13px | 1.5 | `font-mono text-sm` |

**Why IBM Plex Sans:** Industrial precision without coldness. Designed by IBM for institutional contexts — government, enterprise, compliance. It carries the implicit authority of systems that matter. It reads as "infrastructure" not "startup." This is exactly what AetherTrace needs.

**Why IBM Plex Mono for hashes:** Hash values are the product's core proof. They must be displayed in a monospace face that makes every character individually verifiable. IBM Plex Mono is the natural companion — same family, same authority, optimized for character-level reading.

**Google Fonts import:**
```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">
```

**Tailwind config:**
```js
fontFamily: {
  sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
  mono: ['IBM Plex Mono', 'monospace'],
}
```

---

## COMPONENT DIRECTION

### The Trust Signal — Verified Badge

This is the single most important visual element in AetherTrace. It appears whenever the hash chain is intact and evidence is verified.

**Design:**
- Emerald 600 circle with white checkmark (Lucide `ShieldCheck` icon)
- Adjacent text: "Chain Intact" or "Verified" in emerald-600, font-medium
- Never animated. Never bouncing. Never pulsing. Static. Permanent. Like a notary seal.
- Contrast: the broken chain state uses Red 600 with `ShieldAlert` icon and text "Chain Broken"

**Where it appears:**
- Project overview page — chain status for the entire project
- Evidence list — per-item verification status
- Evidence package export — verification stamp on PDF cover
- Public verify page — the centerpiece of the entire page

### Cards

Every major content container is a card. Cards are the primary organizational unit.

```
bg-white border border-slate-200 rounded-lg shadow-sm
dark:bg-gray-900 dark:border-gray-700

Padding: p-6 (standard), p-4 (compact/mobile)
No hover shadow escalation on static cards.
Interactive cards: hover:border-slate-300 transition-colors duration-150
```

**Card types:**
- **Project card** (dashboard) — name, status, evidence count, chain status badge, last activity timestamp
- **Evidence card** (evidence list) — file name, type icon, hash (truncated, monospace), timestamp, requirement tag if linked
- **Requirement card** (custody plan) — description, milestone, due date, status (pending/fulfilled/overdue/waived), linked evidence if fulfilled
- **Custody event card** (chain log) — event type, actor, timestamp, event hash (monospace)

### Tables

For the custody chain log and evidence inventory, tables are more appropriate than cards (dense, scannable data).

```
Table: w-full text-sm
Header: bg-slate-50 text-slate-600 font-medium text-xs uppercase tracking-wider
Row: border-b border-slate-100 hover:bg-slate-50/50
Cell: py-3 px-4
dark: header bg-gray-800, row border-gray-800, hover:bg-gray-800/50
```

Hash values in tables: `font-mono text-xs text-slate-500` — truncated with copy button. Full hash on click/hover.

### Buttons

Three tiers. No more.

| Tier | Usage | Light Mode | Dark Mode |
|------|-------|------------|-----------|
| **Primary** | Upload evidence, Export package, Activate plan | `bg-slate-800 text-white hover:bg-slate-700` | `bg-slate-200 text-gray-900 hover:bg-slate-300` |
| **Secondary** | Create project, Add requirement, View chain | `bg-white border border-slate-300 text-slate-700 hover:bg-slate-50` | `bg-gray-800 border-gray-600 text-gray-200 hover:bg-gray-700` |
| **Destructive** | (MVP: none. No delete operations.) | `bg-red-600 text-white hover:bg-red-700` | Same |

**Button sizing:** `px-4 py-2 rounded-md text-sm font-medium` (standard). `px-3 py-1.5 text-xs` (compact).

No pill buttons. No fully rounded buttons. `rounded-md` communicates institutional, not playful.

### Forms & Inputs

```
Input: border border-slate-300 rounded-md px-3 py-2 text-sm
       focus:ring-2 focus:ring-slate-400 focus:border-slate-400
       placeholder:text-slate-400
       dark:bg-gray-800 dark:border-gray-600 dark:focus:ring-slate-500

Label: text-sm font-medium text-slate-700 mb-1
       dark:text-gray-300

Error: text-sm text-red-600 mt-1
       border-red-300 focus:ring-red-400
```

File upload zone:
```
border-2 border-dashed border-slate-300 rounded-lg
bg-slate-50 hover:bg-slate-100 transition-colors
py-12 text-center
Icon: Lucide Upload (slate-400, w-8 h-8)
Text: "Drop evidence files here or click to upload"
Subtext: "PDF, JPG, PNG, HEIC, DOC — max 50MB per file"
```

### Status Indicators

Status is communicated through left border color + icon + text. Never through background color alone (accessibility — color cannot be the only indicator).

```
Fulfilled:  border-l-4 border-emerald-500 + ShieldCheck icon + "Fulfilled"
Pending:    border-l-4 border-slate-300   + Clock icon       + "Pending"
Overdue:    border-l-4 border-amber-500   + AlertTriangle    + "Overdue"
Waived:     border-l-4 border-slate-400   + Minus icon       + "Waived"
```

### Navigation

**Sidebar navigation** (desktop). Collapsed icon-only on smaller screens. Top bar on mobile.

```
Sidebar: w-64 bg-slate-800 text-white h-screen fixed
Nav item: px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50
Active:   bg-slate-700/70 text-white border-l-2 border-emerald-500
```

**Sidebar sections:**
1. Organization name + plan badge (Starter / Professional)
2. Projects list (collapsible if >5)
3. Within a project:
   - Overview
   - Custody Plan
   - Evidence
   - Chain Log
   - Export
4. Bottom: Account settings, Billing (Stripe portal link)

### Icons

Lucide React exclusively. No emoji. No custom SVGs unless absolutely necessary.

Key icons:
- `ShieldCheck` — verified/intact (emerald)
- `ShieldAlert` — broken/failed (red)
- `Lock` — sealed/activated plan
- `Upload` — evidence upload
- `FileText` — evidence item (document)
- `Image` — evidence item (photo)
- `Link` — chain/custody link
- `Clock` — timestamp/pending
- `AlertTriangle` — overdue/warning
- `Package` — evidence package export
- `ExternalLink` — public verification URL
- `Copy` — copy hash to clipboard
- `Check` — requirement fulfilled
- `ChevronRight` — navigation
- `Settings` — account settings

---

## PAGE-BY-PAGE LAYOUT

### 1. `/dashboard` — Project List

**Purpose:** Show all projects with chain status at a glance.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  Projects                    [+ New Project] │
│            │                                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ Project Name              Chain: ✓ Intact│ │
│            │  │ 14 evidence items · Last activity 2h ago│ │
│            │  │ Plan: 18/22 requirements fulfilled      │ │
│            │  └─────────────────────────────────────────┘ │
│            │                                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ Project Name              Chain: ✓ Intact│ │
│            │  │ 7 evidence items · Last activity 1d ago │ │
│            │  │ Plan: 5/12 requirements fulfilled       │ │
│            │  └─────────────────────────────────────────┘ │
│            │                                              │
│            │  [Empty state: "Create your first project    │
│            │   to begin custodying evidence."]            │
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- Project cards show chain status, evidence count, plan completeness — the three things that matter
- No thumbnails, no preview images, no decorative elements
- Sort by last activity (most recent first)
- Empty state is direct and instructional, not cute

### 2. `/project/[id]` — Project Overview

**Purpose:** Single-screen summary of project custody status.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  ← Back to Projects                         │
│            │  Project Name                                │
│            │  Created Mar 15, 2026 · Active               │
│            │                                              │
│            │  ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│            │  │ Evidence  │ │  Chain   │ │  Plan    │     │
│            │  │   14      │ │ ✓ Intact │ │ 18/22   │     │
│            │  │  items    │ │ 47 events│ │ complete │     │
│            │  └──────────┘ └──────────┘ └──────────┘     │
│            │                                              │
│            │  Recent Activity                             │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ ↑ Foundation photo uploaded  · 2h ago   │ │
│            │  │ ↑ Inspection report uploaded · 5h ago   │ │
│            │  │ ⊕ Plan requirement added    · 1d ago   │ │
│            │  └─────────────────────────────────────────┘ │
│            │                                              │
│            │  [Export Evidence Package]  [Share Verify URL]│
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- Three stat cards at top: evidence count, chain status, plan completeness
- Chain status card is the visual anchor — largest, most prominent
- Recent activity feed shows custody events in reverse chronological
- Export and verify actions are always visible (primary + secondary buttons)

### 3. `/project/[id]/plan` — Custody Plan

**Purpose:** Define and track what evidence WILL be custodied.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  Custody Plan: Phase 1 Construction         │
│            │  Status: 🔒 Active (locked Mar 12, 2026)    │
│            │  Plan Hash: a3f8...c291 [Copy]               │
│            │                                              │
│            │  Completeness: 18 of 22 requirements         │
│            │  ████████████████░░░░ 82%                    │
│            │                                              │
│            │  Pre-Construction ─────────────────────       │
│            │  ┃ ✓ Site survey photos        Mar 10        │
│            │  ┃ ✓ Permit documentation      Mar 11        │
│            │  ┃ ○ Soil test results         Mar 20 ⚠ DUE │
│            │                                              │
│            │  Phase 1: Foundation ──────────────────       │
│            │  ┃ ✓ Foundation inspection     Mar 14        │
│            │  ┃ ✓ Concrete delivery receipt Mar 15        │
│            │  ┃ ○ Rebar placement photo     Pending       │
│            │                                              │
│            │  [+ Add Requirement]  (hidden if plan active)│
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- Plan status and hash are prominent — this is a legal document
- Completeness bar uses emerald fill on slate background. Not a progress bar that implies "good/bad" — it's a factual count.
- Requirements grouped by milestone
- Each requirement shows: description, due date, status (fulfilled ✓ / pending ○ / overdue ⚠)
- Fulfilled requirements link to their evidence item
- Add Requirement button disappears when plan is activated (locked)
- Plan activation is a deliberate action with a confirmation modal: "Activating this plan locks it permanently. The plan hash will be recorded. This cannot be undone."

### 4. `/project/[id]/evidence` — Evidence Items

**Purpose:** Browse all evidence items with their chain position and requirement links.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  Evidence                     [Upload]      │
│            │  14 items · Chain intact                     │
│            │                                              │
│            │  Filter: [All] [Photos] [Documents] [Other] │
│            │                                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ 📄 Foundation Inspection Report.pdf      │ │
│            │  │ Chain #14 · Ingested Mar 15, 10:42 AM   │ │
│            │  │ Hash: a3f8d2...c291e7 [Copy] [Verify]   │ │
│            │  │ Fulfills: Foundation inspection (Phase 1)│ │
│            │  └─────────────────────────────────────────┘ │
│            │                                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ 🖼 concrete-pour-north-wall.jpg          │ │
│            │  │ Chain #13 · Ingested Mar 15, 09:18 AM   │ │
│            │  │ Hash: 7b2e91...f4a803 [Copy] [Verify]   │ │
│            │  │ Ad-hoc evidence (no requirement linked)  │ │
│            │  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- File type icon (Lucide `FileText` for docs, `Image` for photos) — not thumbnails in MVP
- Chain position shown prominently (#14, #13...) — this is the chain
- Hash values in monospace, truncated, with copy + verify actions
- Requirement link shown if evidence fulfills a plan requirement
- "Ad-hoc evidence" label for items not linked to a requirement (still valid, still chained)
- Upload button is always visible and prominent

### 5. `/project/[id]/export` — Evidence Package

**Purpose:** Generate and download the court-ready / audit-ready evidence package.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│ [Sidebar]  │  Evidence Package Export                     │
│            │                                              │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ Package Contents                        │ │
│            │  │                                         │ │
│            │  │ ✓ Custody Plan + Requirements    (1)    │ │
│            │  │ ✓ Completeness Report            (1)    │ │
│            │  │ ✓ Evidence Items                 (14)   │ │
│            │  │ ✓ Full Custody Chain Log         (47)   │ │
│            │  │ ✓ Hash Verification Data         (1)    │ │
│            │  │ ✓ Independent Verification Guide (1)    │ │
│            │  │                                         │ │
│            │  │ Chain Status: ✓ Intact                  │ │
│            │  │ Plan Completeness: 18/22 (82%)          │ │
│            │  └─────────────────────────────────────────┘ │
│            │                                              │
│            │  [Generate Evidence Package]                  │
│            │                                              │
│            │  Previous Exports                             │
│            │  ┌─────────────────────────────────────────┐ │
│            │  │ Package #1 · Generated Mar 18, 2:30 PM  │ │
│            │  │ 14 items · 47 events · Chain intact      │ │
│            │  │ [Download ZIP]                           │ │
│            │  └─────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- Shows exactly what will be in the package before generation
- Chain status and plan completeness shown — these are what attorneys/auditors look for
- Generate button triggers background processing with a loading state (skeleton, not spinner)
- Previous exports listed below — each package is a custody event itself
- No "preview" of the PDF — the PDF is the deliverable, not a screen

### 6. `/verify/[hash]` — Public Verification

**Purpose:** Any third party verifies evidence integrity without authentication. This is AetherTrace's trust mechanism.

**Layout:**
```
┌──────────────────────────────────────────────────┐
│                                                          │
│              ┌─ AetherTrace ─┐                           │
│              │  Evidence      │                           │
│              │  Verification  │                           │
│              └────────────────┘                           │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Enter evidence hash to verify                      │ │
│  │  ┌───────────────────────────────────────────────┐  │ │
│  │  │ a3f8d2e1...                                   │  │ │
│  │  └───────────────────────────────────────────────┘  │ │
│  │  [Verify]                                           │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ── VERIFICATION RESULT ──────────────────────────────   │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  ✓ EVIDENCE VERIFIED                               │ │
│  │                                                     │ │
│  │  This evidence item exists in the AetherTrace       │ │
│  │  custody chain and has not been altered.             │ │
│  │                                                     │ │
│  │  Ingested:        March 15, 2026 at 10:42 AM UTC    │ │
│  │  Chain Position:  #14 of 14                         │ │
│  │  Chain Status:    Intact (all links verified)       │ │
│  │  Content Hash:    a3f8d2e1...c291e7f4               │ │
│  │  Chain Hash:      7b2e9103...f4a80312               │ │
│  │                                                     │ │
│  │  This verification was performed independently.     │ │
│  │  AetherTrace does not control this result.          │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  What is AetherTrace? →                                  │
│                                                          │
└──────────────────────────────────────────────────┘
```

**Key decisions:**
- **No sidebar. No navigation. No login.** This is a public page. Clean, centered, single-purpose.
- The verification result is the largest, most prominent element
- Verified state: emerald left border, `ShieldCheck` icon, "EVIDENCE VERIFIED" in semibold
- Failed state: red left border, `ShieldAlert` icon, "VERIFICATION FAILED — Evidence not found or has been altered"
- The disclaimer "This verification was performed independently. AetherTrace does not control this result." is critical — it's the design expression of rule A1 (Non-Authority) and K3 (Independent Verification)
- "What is AetherTrace?" link at bottom — the only marketing touch on this page. Light. Not pushy.
- Responsive: works on any device. An attorney checking this on their phone in a courtroom must get the same clarity.

---

## SPACING SYSTEM

Use Tailwind's default spacing scale consistently:

| Token | px | Usage |
|-------|-----|-------|
| `space-1` | 4px | Icon-to-text gap |
| `space-2` | 8px | Tight element grouping |
| `space-3` | 12px | Form field spacing |
| `space-4` | 16px | Card internal padding (compact) |
| `space-6` | 24px | Card internal padding (standard) |
| `space-8` | 32px | Section separation |
| `space-12` | 48px | Page section separation |

**Max content width:** `max-w-5xl` (1024px) for main content. `max-w-lg` (512px) for the verify page.

---

## RESPONSIVE BREAKPOINTS

| Breakpoint | px | Layout Change |
|------------|-----|---------------|
| Mobile | <768px | Sidebar collapses to bottom nav. Cards stack vertically. Tables become card lists. |
| Tablet | 768-1024px | Sidebar collapses to icon-only. Content uses full width. |
| Desktop | >1024px | Full sidebar + content area. |

---

## ANIMATION RULES

1. **Allowed:** `transition-colors duration-150` on hover states. `transition-opacity` on loading states. Skeleton shimmer on async content.
2. **Prohibited:** Entrance animations. Slide-ins. Bounce. Scale transforms on hover. Any animation that implies playfulness.
3. **Required:** `prefers-reduced-motion` media query respected. All transitions disabled when user has reduced motion enabled.
4. **Loading states:** Skeleton screens (pulsing slate-200 blocks) for async content. Spinner only for single-action buttons (upload, export generation). Never a full-page spinner.

---

## ACCESSIBILITY NON-NEGOTIABLES

These are not suggestions. ANVIL must implement all of these:

1. **Color contrast:** 4.5:1 minimum for all text. Verified with Slate 900 on Slate 50 (contrast: 15.4:1 ✓). Emerald 600 on white (contrast: 4.6:1 ✓).
2. **Focus states:** Visible `ring-2 ring-slate-400 ring-offset-2` on all interactive elements.
3. **Keyboard navigation:** Tab order matches visual order. All actions reachable via keyboard.
4. **Color is never the only indicator:** Status always includes icon + text alongside color.
5. **Form labels:** Every input has an associated `<label>` element.
6. **Alt text:** Meaningful alt text on all images. Evidence file previews: alt = filename.
7. **Touch targets:** Minimum 44x44px on all interactive elements.
8. **Screen reader:** Announce status changes (chain verified, upload complete) via `aria-live` regions.

---

## ANTI-PATTERNS — WHAT ANVIL MUST NOT BUILD

| Don't | Why | Instead |
|-------|-----|---------|
| Dashboard with charts/graphs | AetherTrace doesn't analyze — it custodies (A5) | Show counts, statuses, and timestamps. No pie charts. No trend lines. |
| Color-coded quality scores | Implies judgment the system is prohibited from making (A1) | Binary states: fulfilled/not, intact/broken, verified/failed |
| Notification badges with counts | Creates urgency/gamification inappropriate for custody | Timestamps on last activity. No red badges. |
| Animated upload success confetti | Undermines institutional tone | Static checkmark + "Evidence ingested. Chain updated." |
| Rounded avatar bubbles | Personal/social feel inappropriate for custody | Text-only user identification (name + role) |
| "Get Started!" / "Let's go!" copy | Too casual for institutional infrastructure | "Create your first project to begin custodying evidence." |
| Progress rings/gauges for completeness | Implies a goal to reach 100% — plan completeness is factual, not motivational | "18 of 22 requirements fulfilled" — text + simple bar |
| Feature tour / onboarding tooltips | Implies the product is complex enough to need explaining | If the UI needs a tour, the UI is wrong. Simplify. |
| Gradient backgrounds | Decorative. Undermines Trust Fortress restraint. | Flat `slate-50` background. Solid `white` cards. |

---

## HANDOFF TO ANVIL

### Implementation Order (Design Alignment with FORGE Phases)

**Phase 1-5 (Backend):** No design decisions needed. Hash chain, database, API routes — FORGE's blueprint governs.

**Phase 6 (UI):** This is where PRISM's brief takes effect. Build in this order:

1. **Tailwind config** — fonts, colors, extend theme with Vault Steel palette
2. **Layout shell** — sidebar nav + main content area + responsive collapse
3. **Component library** — cards, buttons, inputs, status indicators, tables (shadcn/ui as base, customized to Vault Steel)
4. **Dashboard** → **Project Overview** → **Evidence List** → **Custody Plan** → **Export** → **Verify Page**
5. **Dark mode pass** — add `dark:` variants after light mode is complete

### shadcn/ui Customization

Use shadcn/ui as the component foundation. Override these defaults:

```
--primary: 222.2 47.4% 11.2%     → Slate 800 (#1E293B)
--primary-foreground: 0 0% 100%  → White
--accent: 160 84% 39.4%          → Emerald 600 (#059669)
--background: 210 40% 98%        → Slate 50 (#F8FAFC)
--card: 0 0% 100%                → White
--border: 214.3 31.8% 91.4%      → Slate 200 (#E2E8F0)
--radius: 0.375rem               → rounded-md (not rounded-lg)
```

### Files ANVIL Creates

```
tailwind.config.ts     — Extended theme (Vault Steel palette, IBM Plex fonts)
app/globals.css        — CSS variables, font imports, base styles
app/layout.tsx         — Root layout with sidebar
components/ui/         — shadcn/ui components (customized)
components/sidebar.tsx — Navigation sidebar
components/status.tsx  — Status indicator component (fulfilled/pending/overdue)
components/hash.tsx    — Hash display component (truncated, copy, verify link)
components/trust-signal.tsx — The ShieldCheck verified badge
```

### What PRISM Decided (ANVIL Does Not Override)

- Palette: Vault Steel. No substitutions.
- Typography: IBM Plex Sans + IBM Plex Mono. No substitutions.
- Style: Trust Fortress. No glassmorphism, no gradients, no rounded-full.
- Icons: Lucide React. No emoji. No custom SVGs.
- Status indicators: Left border + icon + text. Always.
- Verify page: No auth, no sidebar, centered single-purpose layout.
- Animations: transitions only. No entrance animations.

### What ANVIL Decides

- Exact shadcn/ui component variants to use
- Drag-and-drop vs. click file upload (or both)
- Exact sidebar collapse behavior
- Error message copy (but must follow T3 — explicit errors)
- Loading skeleton patterns
- Exact responsive breakpoint behaviors

---

## DESIGN BRIEF COMPLETE

Visual identity locked. Component direction set. Page layouts defined. Accessibility mandated. Anti-patterns documented.

ANVIL can build the UI with this brief. Every decision has a reason tied to AetherTrace's purpose: neutral, permanent, verifiable custody.

The design says one thing: **"This is infrastructure you can trust — because it was designed to be incapable of deception."**
