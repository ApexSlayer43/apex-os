---
type: build-index
agent: anvil
project: aethertrace
status: pending
created: 2026-03-23
last-updated: 2026-03-23
summary: AetherTrace MVP build status and codebase reference
---

# AetherTrace — Build Index

> ANVIL activates after PRISM delivers the design spec. Do not build without the blueprint.

## Codebase Location

The live codebase lives at vault root for build stability:

```
{vault-root}/aethertrace-mvp/
```

**Absolute path (Windows):** `C:\Users\hall3\Downloads\Aethertrace\aethertrace-mvp\`

## Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Frontend + Backend | Next.js 14 (App Router) | Monolith — one deployment |
| Database | Supabase (Postgres + RLS) | Tenant isolation at DB layer |
| File Storage | Supabase Storage | Write-once policy |
| Auth | Supabase Auth | |
| Payments | Stripe | $199/mo and $499/mo |
| Hosting | Vercel | |
| Crypto | Node.js crypto | SHA-256, ~50 lines |
| Email | Resend | |

**Monthly infra at launch: ~$25/mo**

## Current App Structure

```
aethertrace-mvp/src/
├── app/
│   ├── page.tsx              ← landing page
│   ├── layout.tsx
│   ├── globals.css
│   ├── pricing/              ← pricing page
│   ├── verify/               ← public verification URL
│   ├── dashboard/            ← authenticated dashboard
│   ├── (auth)/               ← login / signup
│   └── api/                  ← API routes
├── components/               ← auth-form, evidence-uploader, verification-badge
└── lib/
    ├── hash-chain.ts         ← CORE — SHA-256 + custody chain logic
    ├── hash-chain.test.ts    ← tests (must pass before any UI work)
    ├── storage.ts
    ├── stripe.ts
    ├── rate-limit.ts
    ├── env.ts
    └── supabase/
```

## MVP Scope (FORGE-locked — do not modify without SENTINEL → FORGE)

**IN SCOPE:**
- Evidence capture (upload docs, photos, logs, notes) — SHA-256 hash + immutable timestamp
- Chain-of-custody ledger — append-only, cryptographically chained, tamper-evident
- Evidence package export — court-ready PDF + ZIP + verification
- Public verification URL — any third party verifies without auth
- Stripe checkout — $199/mo (5 projects) or $499/mo (unlimited)
- Access controls — submitters capture, owner exports, AetherTrace cannot modify

**OUT OF SCOPE (do not build yet):**
- Prime contractor accounts
- DoD/CMMC features
- AI analysis
- Procore integrations
- Blockchain
- Insurance integrations
- Offline mobile

## Build Non-Negotiables (from CONSTITUTION)

1. Hash chain must be correct on first pass — test before any UI
2. Write-once storage enforced at application AND storage bucket level
3. Evidence package must be understandable by a non-technical attorney

## ANVIL Sprint Log
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/build"
WHERE type = "build-log" OR type = "sprint-log"
SORT file.mday DESC
```
