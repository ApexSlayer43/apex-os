# AetherTrace — Complete UI/UX Build Prompt

## What AetherTrace Is

AetherTrace is a cryptographic evidence custody system for construction subcontractors. It performs one function: prove that a document existed at a specific time and has not been altered since.

When a subcontractor uploads a photo, inspection report, receipt, or daily log, AetherTrace immediately generates a SHA-256 hash of the file, stamps it with an immutable timestamp, and chains it to the previous piece of evidence using cryptographic linking. The result is a tamper-evident chain where altering any single file breaks every hash that follows it — visibly and mathematically.

The product exists because of a structural flaw in construction: the party that does the work controls the evidence of that work's quality. When a prime contractor disputes a subcontractor's claim, the sub's photos live on their phone and their reports live in their email. None of it is independently verifiable. AetherTrace separates custody from accountability.

This costs the U.S. construction industry $5–12 billion annually in dispute transaction costs. The average claim a sub loses without proof is $30,000. AetherTrace costs $199/month — one lost claim pays for over 12 years of the service.

## Who Uses It

Mechanical, electrical, and plumbing subcontractors — small to mid-size firms (5–50 employees) who do work on commercial and government construction projects. They've been burned before. They lost a $30K–$100K claim because their phone photos weren't enough. They don't need to be convinced the problem exists. They need a solution that's credible enough to hold up when things go sideways.

The user opens AetherTrace at 6 AM before heading to the jobsite. They upload yesterday's inspection photos, see "EVIDENCE SEALED" confirmation, check that the chain is intact, and close the tab. Total interaction: 90 seconds. The product works in the background. Its value is realized months later when a dispute happens and the evidence package holds up.

## The Experience

AetherTrace is not a SaaS app. It is not a project management tool. It is not a file storage service.

AetherTrace is a **modern, premium evidence vault** you access through a browser.

The experience should communicate: *this is where evidence becomes permanent.* Not through density or intimidation — through polish, precision, and gravity. The interface should feel like a product built by people who understand both cryptography and design. Think Linear meets evidence custody. Vercel's polish applied to legal-grade infrastructure.

### Visual References
- **Linear** — clean dark interface, smooth transitions, information-dense but beautiful
- **Vercel** — deployment status, polished dark dashboard, clean typography
- **Raycast** — premium dark aesthetic, subtle gradients, seamless interactions
- **Stripe** — attention to typographic detail, clean documentation feel

### What It Is NOT
- Not a Bloomberg terminal (too dense, too dated)
- Not brutalist (not trying to look intimidating)
- Not generic SaaS (not Notion/Asana with a dark coat)
- Not playful or friendly (this protects legal evidence, not manages tasks)

## Design System

### Colors
```
Background:        #09090B  (zinc-950 — true dark, not blue-tinted)
Surface:           #18181B  (zinc-900)
Surface elevated:  #27272A  (zinc-800)
Border:            rgba(255, 255, 255, 0.08)
Border hover:      rgba(255, 255, 255, 0.15)
Text primary:      #FAFAFA
Text secondary:    #A1A1AA  (zinc-400)
Text muted:        #71717A  (zinc-500)
Accent:            #10B981  (emerald-500) — ONLY for sealed/verified/intact status
Accent hover:      #34D399  (emerald-400)
Accent surface:    rgba(16, 185, 129, 0.1)
Accent border:     rgba(16, 185, 129, 0.2)
Blue:              #3B82F6  (for "exported" actions)
Purple:            #A855F7  (for "verified" actions)
```

Emerald means one thing: **the system is confirming integrity.** It is not decorative. When you see green, the evidence is sealed and the chain is intact.

### Typography
- **Headings:** Inter, -0.025em tracking, weight 600
- **Body:** Inter, 14px, line-height 1.6
- **Technical elements** (hashes, timestamps, labels, status, navigation): IBM Plex Mono, 12-13px
- **Small labels:** 11px, uppercase, 0.05em tracking, zinc-500

### Spacing & Shape
- Border radius: 8px cards, 6px inputs/buttons, 12px for large containers, 9999px for badges
- Card padding: 24px
- Section spacing: 48-64px between major sections
- Max content width: 1200px centered
- Subtle shadows: `0 1px 2px rgba(0,0,0,0.3), 0 1px 3px rgba(0,0,0,0.2)`

### Effects
- Subtle emerald gradient glow behind hero: `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(16,185,129,0.12), transparent)`
- Smooth transitions: `all 0.2s ease` on interactive elements
- Hover: `translateY(-1px)` + brighter border on cards
- Pulsing green dot for live chain status
- Page content fade-in on load
- `prefers-reduced-motion` media query respected

### Icons
SVG only. No emojis. No HTML entities. Use Lucide icons or custom inline SVGs for: shield, lock, checkmark, upload arrow, document, chain-link, arrow-right, plus, x.

## Tech Stack

- **Frontend/Backend:** Next.js 14 (App Router + API Routes)
- **Database:** Supabase (Postgres + Row Level Security)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage (write-once policy — files cannot be overwritten)
- **Payments:** Stripe Checkout
- **Hosting:** Vercel
- **Crypto:** Node.js built-in crypto (SHA-256)
- **Email:** Resend
- **Styling:** Tailwind CSS

## Data Model

```
Organization (tenant)
  → Project (job site)
    → EvidenceItem (uploaded file — hashed and chained)
      → CustodyEvent (log entry: INGESTED, EXPORTED, VERIFIED, ACCESSED)
    → EvidencePackage (court-ready export bundle)
```

### Hash Chain Formula
```
chainHash = SHA-256(contentHash + ingestedAt + previousChainHash)
```
First item in each project uses `"GENESIS"` as its previous hash.

## Pages to Build

### 1. Landing Page (`/`)

**Navigation:**
- Left: ◆ AetherTrace (logo + wordmark)
- Right: "Pricing" link, "Sign in" link, "Protect your work" emerald button

**Hero Section:**
- Emerald gradient glow behind content (subtle, atmospheric)
- Eyebrow text: `EVIDENCE CUSTODY FOR SUBCONTRACTORS` (small, uppercase, emerald, monospace)
- Headline: **"You did the work. You took the photos. You still lost the claim."** (large, white, Inter 600)
- Subtext: "AetherTrace locks every document, photo, and inspection report into a cryptographic chain the moment you upload it. Timestamped. Hash-sealed. Independently verifiable. No one can alter it. Not even us." (zinc-400, 16px)
- Two CTAs:
  - "Lock down your evidence" → emerald filled button → links to /signup
  - "See the math" → ghost/outline button → links to /pricing

**Pain Quote Section:**
- Subtle bordered card, slightly elevated surface
- Italic quote: *"I had every photo, every daily report. But when the prime disputed the punchlist, my phone timestamps weren't enough. I couldn't prove the photos weren't taken after the fact."*
- Attribution: `— Mechanical subcontractor, $42K disputed claim, 2024` (monospace, zinc-500)

**Chain Visualization:**
- Visual representation of 3 linked evidence blocks showing:
  - Position numbers (#24, #23, #22)
  - Filenames (daily_inspection_0322.pdf, duct_photo_B_east.jpg, material_receipt_freight.pdf)
  - Truncated hashes in monospace
  - Connecting lines between blocks (subtle emerald gradient)
- This is an illustration, not a data dump. Clean, elegant, modern.

**How It Works:**
- Section label: `HOW IT WORKS` (small uppercase monospace)
- Three steps in a horizontal row:
  - **01 — Upload your evidence:** "Photos, inspection reports, receipts, daily logs. Any file. The moment it enters AetherTrace, it gets a SHA-256 hash and an immutable timestamp. Done."
  - **02 — The chain seals it:** "Every item links to the one before it. Change one file and the entire chain breaks visibly. This isn't a promise. It's math."
  - **03 — Anyone can verify:** "Give the attorney the link. They verify the evidence independently. No login. No account. No trust required. The hash proves it."

**Problem Statement:**
- Headline: **"The party that does the work controls the evidence."**
- Body: "That's the structural flaw. When a prime disputes your claim, your photos live on your phone and your reports live in your email. None of it is independently verifiable. AetherTrace separates custody from accountability."
- Two stats side by side:
  - **$5–12B** — US construction dispute costs / year
  - **$30K** — Average claim a sub loses without proof

**Objection Handler:**
- "One lost claim pays for over a decade of AetherTrace. The question is not the cost. The question is what you lose without proof."
- Math line: `$199/mo × 12 = $2,388/yr — One $30K claim = 12.5 years covered` (monospace)

**Footer:**
- `AETHERTRACE · CRYPTOGRAPHIC EVIDENCE CUSTODY` (monospace, zinc-600, centered)

---

### 2. Login Page (`/login`)

- Dark background, centered layout
- ◆ AetherTrace logo
- Tagline: "Secure evidence custody" (small, zinc-500, monospace)
- Card with:
  - Heading: **"Sign in to your vault"**
  - Email input (label: EMAIL)
  - Password input (label: PASSWORD)
  - "Sign in" emerald button (full width)
- Below card: "No account? Create one" with link to /signup

---

### 3. Signup Page (`/signup`)

- Same layout as login
- Card with:
  - Heading: **"Create your vault"**
  - Company name input (label: COMPANY)
  - Email input (label: EMAIL)
  - Password input (label: PASSWORD, placeholder: "Minimum 8 characters")
  - "Create vault" emerald button (full width)
- Below card: "Already have an account? Sign in" with link to /login

---

### 4. Dashboard (`/dashboard`)

**Navigation:**
- Left: ◆ AetherTrace | `Hall Mechanical Services` (org name, zinc-500, monospace)
- Right: `hall324@gmail.com` (zinc-400) | "Sign out" link

**Stats Row (3 cards):**
- PROJECTS → **3** (large monospace number)
- EVIDENCE SEALED → **47** (large monospace number)
- VAULT STATUS → **ACTIVE** (large monospace, emerald color)

**Projects Section:**
- Header row: "Your projects" label (left) + project name input + "Create" emerald button (right)
- Project cards/rows with left accent borders:
  - **Fort Hood HVAC Retrofit — Bldg 4127** | 2026-03-15 | `24 sealed` | `ACTIVE` badge (emerald)
  - **Grafenwöhr Range Facility Upgrade** | 2026-03-08 | `18 sealed` | `ACTIVE` badge (emerald)
  - **Base Housing Electrical — Phase 1** | 2026-02-22 | `5 sealed` | `CLOSED` badge (zinc/gray)
- Active projects: emerald left border (4px). Closed: gray left border.
- Clicking a project navigates to the project page.

---

### 5. Project Page (`/dashboard/projects/[projectId]`)

**Navigation:**
- Left: `← VAULT` (back link) / **Fort Hood HVAC Retrofit — Bldg 4127** (project name)
- Right: `● CHAIN INTACT` badge (emerald, pulsing green dot) + "Export court package" outline button

**Upload Section:**
- Label: `SEAL NEW EVIDENCE` (uppercase monospace)
- Dropzone: dashed border, upload icon (SVG), "Drop file here to seal it into the chain", file types: `PDF, JPG, PNG, CSV, JSON, ZIP · 50MB max` (monospace, zinc-500)
- Confirmation card (shown after upload): emerald-bordered card with:
  - `◆ EVIDENCE SEALED` header (emerald, monospace)
  - Filename: **daily_inspection_report_0322.pdf**
  - `Position #24 · f92d1a7b3c5e08429d6f4a8e1b3c7d2a5f0e9b4c` (monospace, emerald)

**Evidence Chain:**
- Label: `EVIDENCE CHAIN · 24 SEALED ITEMS` (uppercase monospace)
- Timeline visualization with emerald dots connected by lines:
  - **#24** — daily_inspection_report_0322.pdf
    - Content: `a7c3e9f21b4d8a6e...` | Chain: `f92d1a7b3c5e0842...`
    - Sealed: `2026-03-22 16:15Z` | Size: `2.4 MB`
  - **#23** — duct_photo_section_B_east.jpg
    - Content: `3b8f2d1c6a9e7045...` | Chain: `c4e81f3a9d2b5670...`
    - Sealed: `2026-03-21 14:30Z` | Size: `4.7 MB`
  - **#22** — material_receipt_carrier_freight.pdf
    - Content: `9e4d7a2f1c8b3056...` | Chain: `d5f29a8c1b4e7063...`
    - Sealed: `2026-03-20 09:12Z` | Size: `856 KB`
  - `⋮ 19 more sealed items`
- Each chain item has a left emerald border and shows hashes prominently in monospace.

**Custody Log:**
- Label: `CUSTODY LOG · 28 EVENTS` (uppercase monospace)
- Table rows with action tags and timestamps:
  - `SEALED` (emerald badge) — daily_inspection_report_0322.pdf — 2026-03-22 16:15Z
  - `SEALED` (emerald badge) — duct_photo_section_B_east.jpg — 2026-03-21 14:30Z
  - `EXPORTED` (blue badge) — Court package — 22 items — 2026-03-20 17:00Z
  - `VERIFIED` (purple badge) — Full chain — integrity confirmed — 2026-03-20 16:58Z
  - `SEALED` (emerald badge) — material_receipt_carrier_freight.pdf — 2026-03-20 09:12Z

---

### 6. Verification Page (`/verify/[hash]`)

This is a **public page** — no authentication required. Anyone with the link can verify evidence.

- ◆ AetherTrace logo + "Independent evidence verification" (monospace subtitle)
- Large emerald circle with SVG checkmark (seal icon, glowing)
- `INTEGRITY CONFIRMED` (uppercase, monospace, emerald, letter-spaced)
- **"This Evidence Has Not Been Altered"** (large heading, white)
- "The cryptographic chain hash was independently recomputed and matches the sealed record." (zinc-400)
- Detail card with labeled rows:
  - FILE: daily_inspection_report_0322.pdf
  - TYPE: application/pdf (monospace)
  - SIZE: 2.4 MB (monospace)
  - POSITION: #24 of 24 (monospace)
  - CAPTURED: 2026-03-22T16:15:00Z (monospace)
  - SEALED: 2026-03-22T16:15:03Z (monospace)
  - CONTENT HASH: a7c3e9f21b4d8a6e5c90b3f42d817e6a9c0d5f281b4e7a3c6d9f2e5b8a1c4d70 (monospace)
  - CHAIN HASH: f92d1a7b3c5e08429d6f4a8e1b3c7d2a5f0e9b4c6d8a1e3f5b7c2d9a4e6f0182 (monospace)
  - PREVIOUS HASH: c4e81f3a9d2b56703e8d1a4f7c9b2e5d0a6f3c8b1e4d7a2f5c9e0b3d6a8f1c42 (monospace)
  - RECOMPUTED: f92d1a7b3c5e08429d6f4a8e1b3c7d2a5f0e9b4c6d8a1e3f5b7c2d9a4e6f0182 (monospace, **emerald** — matches chain hash)
- **Verification method** section:
  - "The chain hash is computed as SHA-256(content + timestamp + previous). The first item in every chain uses GENESIS as its previous hash. Altering any single item invalidates every hash that follows. The recomputed hash above was calculated independently and matches the sealed record. AetherTrace cannot modify evidence after ingestion."
- Footer: `Verified 2026-03-23T10:30:00Z · AetherTrace Evidence Custody`

---

### 7. Pricing Page (`/pricing`)

**Navigation:**
- Left: ◆ AetherTrace
- Right: "Sign in" link

**Hero:**
- Headline: **"What does it cost to lose a claim you should have won?"**
- Subtext: "AetherTrace costs less per year than a single hour with a construction attorney. The evidence it protects is worth the claim itself." (zinc-400)

**Two Pricing Cards:**

**Standard — $199/mo**
- Subtitle: "Subs protecting their work"
- Features (with emerald checkmarks):
  - 5 active projects
  - SHA-256 chain on every file
  - Immutable custody ledger
  - Court-ready export packages
  - Public verification links
  - 50MB per evidence file
- CTA: "Protect your projects" (outline/ghost button)

**Professional — $499/mo** (RECOMMENDED badge)
- Subtitle: "Firms running multiple jobs"
- Features (with emerald checkmarks):
  - Unlimited projects
  - Everything in Standard
  - Priority sealing
  - Team member access
  - Bulk evidence upload
  - Dedicated support
- CTA: "Protect your firm" (emerald filled button)

**ROI Section:**
- Label: `THE MATH ON ONE PREVENTED CLAIM` (uppercase monospace)
- Three columns:
  - **$30K** — Average disputed claim
  - **$2,388** — Annual Standard cost
  - **12.5×** (emerald) — Return on one claim

---

## Copy Guidelines

All copy follows these rules:
- Short sentences. No compound sentences where two simple ones will do.
- Real numbers over vague claims ($30K, $5-12B, 12.5 years, $199/mo)
- Customer language, not technical jargon (sealed not ingested, vault not account, evidence not files)
- No AI buzzwords (intelligent, smart, powered by, leverage, utilize)
- No SaaS buzzwords (get started, unlock, supercharge, seamless, robust)
- One CTA per section. Never more.
- Vulnerability before competence — lead with the pain, then the solution
- The competitive alternative is phone photos + filing cabinet, not other software

## Key Terminology
- "Sealed" not "uploaded" or "ingested"
- "Vault" not "account" or "workspace"
- "Evidence" not "files" or "documents"
- "Chain intact" not "status: healthy"
- "Court package" not "export" or "download"
- "Protect" not "get started" or "sign up"

## What Makes AetherTrace Look Like AetherTrace

1. The chain visualization is the visual identity. Linked blocks with hashes should appear on the landing page, in the product, and in marketing materials.
2. Emerald on dark zinc is the color signature. Not blue. Not purple. Emerald = integrity confirmed.
3. Monospace hashes displayed prominently — not hidden in metadata. The hash IS the proof. Show it.
4. The product feels like it's already running. Evidence is being sealed. The chain is intact. You're entering an operating system, not a blank canvas.
5. No free tier. No trial. Payment before custody begins. The pricing communicates: this is serious infrastructure, not a freemium experiment.
