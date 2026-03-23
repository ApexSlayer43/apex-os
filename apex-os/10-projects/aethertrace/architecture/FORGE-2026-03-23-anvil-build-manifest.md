---
type: build-manifest
agent: forge
project: aethertrace
status: complete
date: 2026-03-23
sprint: S-2026-Q1-13
parent: "[[FORGE-2026-03-23-mvp-dual-path-blueprint]]"
tags: [aethertrace, architecture, build-manifest, anvil, task-decomposition]
summary: "Task-level build manifest decomposing the FORGE blueprint into discrete, verifiable ANVIL sessions. Each task is scoped to fit within a single context window with clear inputs, outputs, and done gates. Derived from Anthropic best practices: narrow scope, verification criteria, clean context per task."
---

# ANVIL Build Manifest — AetherTrace MVP

## Purpose

The FORGE blueprint defines WHAT gets built and WHY. This manifest defines the EXECUTION ORDER — each task scoped so ANVIL can execute it in a single, focused session with a clean context window.

## Execution Rules

1. **One task per session.** Start each task with `/clear` or a fresh session.
2. **Read the blueprint first.** Every session begins by reading the relevant section of `FORGE-2026-03-23-mvp-dual-path-blueprint.md`.
3. **Verify before marking done.** Every task has a VERIFY step. If verification fails, the task is not done.
4. **No scope expansion.** If a task surfaces new work, log it — don't build it.
5. **Cite invariants.** Per Foundational Principles A1/L1, comments must reference which rule the code preserves.
6. **Fail closed.** Per G1, if something breaks mid-task, stop. Don't patch around it.

## Dependency Notation

- `→` means "blocks" (downstream task cannot start until this completes)
- `‖` means "can run in parallel"
- `※` means "requires external action" (Supabase dashboard, Stripe dashboard, etc.)

---

## PHASE 1: Foundation

### Task 1.1 — Hash Chain Library
**Input:** Hash chain spec from blueprint (Section: "The Hash Chain — How It Works")
**Build:**
- Create `lib/hash-chain.ts`
- Implement `computeContentHash(file: Buffer): string` — SHA-256 of raw file bytes
- Implement `computeChainHash(contentHash: string, timestamp: string, previousHash: string | "GENESIS"): string`
- Implement `computeEventHash(eventData: object): string`
- Implement `computeEventChainHash(eventHash: string, timestamp: string, previousHash: string | "GENESIS"): string`
- Implement `verifyChain(items: ChainItem[]): { valid: boolean, brokenAt?: number }`
- Export TypeScript types: `ChainItem`, `ChainVerificationResult`
- Every function comment cites L1 (ordering is a system property)

**Verify:**
- Unit tests exist and pass
- Manual: call each function with known inputs and confirm deterministic output

**Output:** `lib/hash-chain.ts`
**Blocks:** Every task in Phase 2+

→ Task 1.2

---

### Task 1.2 — Hash Chain Tests
**Input:** `lib/hash-chain.ts` from Task 1.1
**Build:**
- Create `lib/hash-chain.test.ts` (Vitest)
- Test: genesis block uses "GENESIS" string
- Test: chain of 3 items produces correct sequential hashes
- Test: verification passes on valid chain
- Test: verification catches tampered hash (modify one item, verify reports brokenAt)
- Test: verification catches deleted item (remove middle item, verify reports brokenAt)
- Test: verification catches reordered items
- Test: empty chain returns valid
- Test: single-item chain returns valid
- Test: same content at different timestamps produces different chain hashes (L3)
- Test: concurrent inserts produce different chain positions (race condition guard)

**Verify:**
- `npx vitest run lib/hash-chain.test.ts` — all pass, 0 failures
- Coverage: every exported function has ≥1 test

**Output:** `lib/hash-chain.test.ts`
**Blocks:** Phase 2

→ Phase 2

---

## PHASE 2: Project Scaffold + Database

### Task 2.1 — Next.js Project Init
**Input:** Stack decision from blueprint
**Build:**
- `npx create-next-app@14 aethertrace --typescript --tailwind --app --src-dir`
- Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `stripe`
- Install dev dependencies: `vitest`, `@testing-library/react`
- Create `.env.local.example` with required env vars (no secrets)
- Copy `lib/hash-chain.ts` and `lib/hash-chain.test.ts` into project
- Configure Vitest in `vitest.config.ts`
- Confirm hash chain tests still pass in new project

**Verify:**
- `npm run dev` starts without errors
- `npx vitest run` — hash chain tests pass
- Project structure matches blueprint system map

**Output:** Working Next.js 14 project with hash chain library
**Blocks:** All subsequent tasks

→ Task 2.2 ‖ Task 2.3

---

### Task 2.2 — Supabase Project + Schema Migration ※
**Input:** Entity definitions from blueprint (Section: "Core Data Model")
**Build:**
- Create `supabase/migrations/001_initial_schema.sql`
- All 8 tables: organizations, projects, custody_plans, evidence_requirements, evidence_items, custody_events, evidence_packages, subscriptions (if not on organizations)
- Include org_members table for multi-user support
- All constraints, foreign keys, unique indexes per blueprint
- Add CHECK constraints: status fields limited to valid enum values
- Add indexes on: project_id (evidence_items, custody_events), custody_plan_id (evidence_requirements), org_id (projects)
- Comments on every table cite the invariant it serves

**Verify:**
- SQL runs clean against a fresh Supabase project (no syntax errors)
- All tables created with correct columns and types
- Foreign key relationships match blueprint entity diagram

**Output:** `supabase/migrations/001_initial_schema.sql`
**Blocks:** Task 2.4

---

### Task 2.3 — Supabase Auth Configuration ※
**Input:** Auth requirements from blueprint
**Build:**
- Configure Supabase Auth (email/password for MVP)
- Create `lib/supabase/client.ts` — browser client
- Create `lib/supabase/server.ts` — server-side client (for API routes)
- Create `lib/supabase/middleware.ts` — auth middleware for Next.js
- Create `middleware.ts` at project root — protect /dashboard/* routes

**Verify:**
- Can sign up a test user via Supabase dashboard
- Server client can query auth.users
- Middleware redirects unauthenticated requests away from /dashboard

**Output:** Supabase auth integration files
**Blocks:** Task 2.5

---

### Task 2.4 — RLS Policies
**Input:** RLS policy definitions from blueprint, Task 2.2 schema
**Build:**
- Create `supabase/migrations/002_rls_policies.sql`
- Enable RLS on all tables
- Implement org_isolation, project_isolation, evidence_isolation policies per blueprint
- Implement INSERT-ONLY policy on evidence_items and custody_events (no UPDATE, no DELETE)
- Add policy for custody_plans (org members can read, org owner can create/activate)
- Add policy for evidence_requirements (same as custody_plans)

**Verify:**
- Create two test users in different orgs
- User A cannot see User B's projects (test via Supabase SQL editor with auth.uid() override)
- INSERT on evidence_items succeeds
- UPDATE on evidence_items fails with RLS violation
- DELETE on evidence_items fails with RLS violation

**Output:** `supabase/migrations/002_rls_policies.sql`
**Blocks:** Task 2.5

---

### Task 2.5 — Storage Bucket (Write-Once) ※
**Input:** Storage requirements from blueprint
**Build:**
- Create `evidence-files` storage bucket in Supabase
- Configure bucket policy: INSERT allowed, UPDATE denied, DELETE denied
- Create `lib/storage.ts` — upload function that:
  - Checks if file path exists before upload (application-layer guard)
  - Uploads to `evidence-files/{org_id}/{project_id}/{uuid}/{filename}`
  - Returns storage path
- Application-layer overwrite rejection (even if bucket policy fails)

**Verify:**
- Upload a test file — succeeds
- Upload same path again — application layer rejects
- Attempt to delete via Supabase client — storage policy rejects
- Attempt to update via Supabase client — storage policy rejects

**Output:** `lib/storage.ts`, configured Supabase bucket
**Blocks:** Phase 3

→ Phase 3

---

## PHASE 3: Core API

### Task 3.1 — Evidence Upload API
**Input:** evidence_items schema, hash chain library, storage library
**Build:**
- Create `app/api/evidence/upload/route.ts`
- Accept: file (multipart), project_id, requirement_id (optional), captured_at, metadata
- Flow:
  1. Auth check (Supabase session)
  2. Subscription check (org must be active)
  3. Upload file to storage (lib/storage.ts)
  4. Compute content_hash (lib/hash-chain.ts)
  5. Query previous chain item for this project (SELECT MAX chain_position)
  6. Compute chain_hash using previous_hash
  7. INSERT evidence_item (within transaction — BEGIN/COMMIT per blueprint Decision 2)
  8. INSERT custody_event (type: "ingested")
  9. If requirement_id provided, UPDATE evidence_requirement (fulfilled_by, fulfilled_at, status)
  10. Return evidence_item with chain verification data
- On failure at any step: log custody_event with type "ingestion_failed" (G2), return explicit error (T3)

**Verify:**
- Upload a file → evidence_item created with correct hash
- Upload second file → chain_position incremented, previous_hash correct
- Upload with requirement_id → requirement status updated to "fulfilled"
- Upload with invalid project_id → explicit error returned
- Upload without auth → 401

**Output:** `app/api/evidence/upload/route.ts`
**Blocks:** Task 3.4, Phase 4

---

### Task 3.2 — Custody Plan CRUD API
**Input:** custody_plans schema, hash chain library
**Build:**
- Create `app/api/plan/create/route.ts` — POST: create draft custody plan
- Create `app/api/plan/[id]/route.ts` — GET: read plan, PATCH: update draft plan
- Create `app/api/plan/[id]/activate/route.ts` — POST: hash plan contents + lock (draft → active)
  - Compute plan_hash = SHA-256 of JSON.stringify(plan + requirements at activation time)
  - Set activated_at timestamp
  - After activation, plan and its requirements are immutable
- Auth + org membership check on all routes
- Draft plans can be edited. Active plans cannot.

**Verify:**
- Create plan → returns draft plan with id
- Update draft plan → succeeds
- Activate plan → plan_hash computed, status = "active", activated_at set
- Update active plan → explicit error "Plan is locked"
- Read plan from different org → 403

**Output:** `app/api/plan/` routes
**Blocks:** Task 3.3

---

### Task 3.3 — Evidence Requirements API
**Input:** evidence_requirements schema, Task 3.2 plan routes
**Build:**
- Create `app/api/plan/[id]/requirements/route.ts` — GET all, POST new requirement
- Create `app/api/plan/[id]/requirements/[reqId]/route.ts` — PATCH, DELETE (draft plans only)
- Requirements can only be added/edited/deleted while plan is in "draft" status
- Once plan is activated, requirements are frozen
- Sort by sort_order field

**Verify:**
- Add 3 requirements to draft plan → all created with correct custody_plan_id
- Activate plan → requirements frozen
- Attempt to add requirement to active plan → explicit error
- GET requirements → returns sorted list

**Output:** `app/api/plan/[id]/requirements/` routes
**Blocks:** Task 3.4

---

### Task 3.4 — Completeness + Chain Verification APIs
**Input:** evidence_requirements, evidence_items schemas
**Build:**
- Create `app/api/completeness/[projectId]/route.ts`
  - Query all evidence_requirements across all active plans for project
  - Count: total, fulfilled, pending, overdue
  - Return: completeness percentage, requirement-level status list
- Create `app/api/custody/[projectId]/route.ts`
  - Return full custody event chain for project, ordered by chain_position
- Create `app/api/verify/[hash]/route.ts` (PUBLIC — no auth required)
  - Accept content_hash
  - Look up evidence_item by content_hash
  - Walk the chain from genesis to that item
  - Verify chain integrity
  - Return: { exists: boolean, ingested_at?: string, chainIntact?: boolean }
  - NO file content, NO metadata, NO project info (public endpoint — minimal disclosure)

**Verify:**
- Completeness API returns correct counts after uploading evidence against requirements
- Custody chain API returns ordered events
- Verify API with valid hash → exists: true, chainIntact: true
- Verify API with unknown hash → exists: false
- Verify API requires no authentication

**Output:** Completeness, custody chain, and public verification routes
**Blocks:** Phase 4

→ Phase 4

---

## PHASE 4: Evidence Package Export

### Task 4.1 — Package Generator Library
**Input:** Blueprint Phase 4 spec, all Phase 3 APIs
**Build:**
- Create `lib/package-generator.ts`
- Generates:
  1. `evidence_package.pdf` — human-readable report containing:
     - Project name and date range
     - Custody plan (what was supposed to be custodied)
     - Completeness report (X of Y requirements, status of each)
     - Evidence inventory (filename, hash, ingested_at, requirement fulfilled)
     - Full custody event log with timestamps and hashes
     - Chain verification status (INTACT or BROKEN AT position X)
     - Instructions for independent verification (the /verify URL)
  2. `chain_verification.json` — machine-readable chain data
  3. `custody_plan.json` — plan + requirements + fulfillment status
  4. `README.txt` — plain-language instructions for an attorney
  5. All original evidence files
  6. ZIP bundle of everything above
- Compute package_hash = SHA-256 of the final ZIP

**Verify:**
- Generate package for test project with 3 evidence items + custody plan
- ZIP contains all expected files
- PDF is readable (open it, confirm content makes sense)
- chain_verification.json matches actual chain state
- README.txt is understandable by a non-technical reader

**Output:** `lib/package-generator.ts`
**Blocks:** Task 4.2

---

### Task 4.2 — Export API Route
**Input:** `lib/package-generator.ts`, evidence_packages schema
**Build:**
- Create `app/api/export/[projectId]/route.ts`
- Auth check: only org owner can export (per blueprint access controls)
- Call package-generator
- Upload ZIP to Supabase storage
- INSERT evidence_packages record (package_hash, file_path, counts, chain_valid)
- INSERT custody_event (type: "exported") for each evidence item in the package
- Return download URL (signed, time-limited)

**Verify:**
- Export request from org owner → ZIP download works
- Export request from submitter (non-owner) → 403
- evidence_packages record created with correct counts
- Custody events logged for each item

**Output:** `app/api/export/[projectId]/route.ts`
**Blocks:** Phase 6

→ Phase 5 (can start in parallel with Phase 4)

---

## PHASE 5: Stripe Integration

### Task 5.1 — Stripe Checkout + Webhook ※
**Input:** Blueprint Stripe spec, pricing ($199/$499)
**Build:**
- Create `lib/stripe.ts` — Stripe client, price IDs, helper functions
- Create `app/api/stripe/checkout/route.ts`
  - Create Checkout Session with correct price_id based on plan selection
  - Include org_id in metadata
  - Redirect to Stripe Checkout
- Create `app/api/stripe/webhook/route.ts`
  - Verify webhook signature
  - Handle events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice.payment_failed
  - Update organization subscription_status and stripe_customer_id

**Verify:**
- Stripe test mode: complete checkout → organization status = "active"
- Cancel subscription → organization status = "canceled"
- Payment failure → organization status = "past_due"
- Invalid webhook signature → rejected

**Output:** `lib/stripe.ts`, Stripe API routes
**Blocks:** Task 5.2

---

### Task 5.2 — Subscription Guard Middleware
**Input:** Task 5.1, organizations table
**Build:**
- Create `lib/subscription.ts` — check org subscription status
- Add subscription check to all protected API routes:
  - evidence upload, plan creation, export — require active subscription
  - read operations (custody chain, completeness) — allow for past_due (grace period)
- Enforce plan limits: starter (5 active projects), professional (unlimited)

**Verify:**
- API calls with active subscription → succeed
- API calls with inactive subscription → 402 with clear message
- Create 6th project on starter plan → explicit error about plan limit

**Output:** `lib/subscription.ts`, updated API routes
**Blocks:** Phase 6

→ Phase 6

---

## PHASE 6: UI

### Task 6.1 — Layout + Auth Pages
**Input:** PRISM design brief (pending), Next.js project
**Build:**
- Create `app/layout.tsx` — root layout with navigation
- Create `app/(auth)/login/page.tsx` — email/password login
- Create `app/(auth)/signup/page.tsx` — email/password signup + org creation
- Create `app/(dashboard)/layout.tsx` — authenticated layout with sidebar nav
- Install icon library (Lucide per PRISM checklist)
- Responsive at 375px, 768px, 1024px, 1440px

**Verify:**
- Signup → creates user + organization
- Login → redirects to dashboard
- Unauthenticated → redirected to login
- Responsive: no horizontal scroll on mobile

**Output:** Auth pages + layout components
**Blocks:** Tasks 6.2-6.5

---

### Task 6.2 — Dashboard + Project List
**Input:** Task 6.1 layout, projects API
**Build:**
- Create `app/(dashboard)/dashboard/page.tsx`
- Show list of projects for current org
- Show subscription status
- "New Project" button → create project modal/form
- Project card shows: name, evidence count, last activity, completeness %

**Verify:**
- Dashboard loads with correct project list
- Create project → appears in list
- Empty state shows helpful message

**Output:** Dashboard page
**Blocks:** Task 6.3

---

### Task 6.3 — Project Detail + Custody Plan UI
**Input:** Task 6.2, custody plan API, requirements API
**Build:**
- Create `app/(dashboard)/project/[id]/page.tsx` — project overview
- Create `app/(dashboard)/project/[id]/plan/page.tsx` — custody plan builder
  - Create/edit draft plan
  - Add/edit/remove requirements (while draft)
  - Activate plan (with confirmation — irreversible)
  - Show activated plan as read-only with fulfillment status
- Completeness dashboard: progress bar, requirement checklist with status icons

**Verify:**
- Create custody plan with 5 requirements
- Activate plan → UI shows locked state
- Completeness shows 0/5 pending

**Output:** Project detail + plan pages
**Blocks:** Task 6.4

---

### Task 6.4 — Evidence Upload + Custody Log UI
**Input:** Task 6.3, evidence upload API, custody chain API
**Build:**
- Create `app/(dashboard)/project/[id]/evidence/page.tsx`
  - File upload (drag-and-drop + file picker)
  - Optional: tag to a requirement from the active custody plan
  - Show upload progress, hash confirmation on success
  - Evidence list: filename, hash (truncated), ingested_at, requirement linked
- Create custody log section:
  - Chronological list of all custody events
  - Event type, actor, timestamp, hash

**Verify:**
- Upload file → appears in evidence list with correct hash
- Tag to requirement → requirement shows "fulfilled" in plan view
- Completeness updates (e.g., 1/5 fulfilled)
- Custody log shows ingestion event

**Output:** Evidence + custody log pages
**Blocks:** Task 6.5

---

### Task 6.5 — Export + Public Verification Pages
**Input:** Task 6.4, export API, verify API
**Build:**
- Create export trigger on `app/(dashboard)/project/[id]/export/page.tsx`
  - "Generate Evidence Package" button (owner only)
  - Loading state during generation
  - Download link when complete
  - Show previous exports
- Create `app/verify/[hash]/page.tsx` (PUBLIC — no auth)
  - Input field: paste a hash
  - Result: exists/not found, ingested date, chain status
  - Branded but minimal — this is a trust page
  - No login required, no sidebar, no dashboard chrome

**Verify:**
- Generate package → download ZIP, confirm PDF readable
- Copy hash from evidence item → paste in verify page → "Evidence verified, chain intact"
- Enter unknown hash → "No evidence found for this hash"
- Verify page accessible without login

**Output:** Export page + public verification page

→ Phase 7

---

## PHASE 7: Polish + Deploy

### Task 7.1 — Error Handling + Loading States
**Input:** All Phase 6 pages
**Build:**
- Add error boundaries to all pages
- Add loading skeletons (not spinners) per PRISM checklist
- Add toast notifications for: upload success, export ready, errors
- Ensure all API errors surface clear messages (T3 compliance)
- Add `prefers-reduced-motion` check on any animations

**Verify:**
- Simulate API failure → user sees clear error, not blank screen
- Slow connection → loading skeleton visible
- Every API error has a human-readable message

**Output:** Updated UI components

---

### Task 7.2 — Email Notifications
**Input:** Resend integration
**Build:**
- Install Resend SDK
- Create `lib/email.ts` — email templates
- Welcome email on signup
- Evidence submitted confirmation (to org owner)
- Export ready notification
- Trigger emails from relevant API routes

**Verify:**
- Sign up → welcome email received
- Upload evidence → org owner gets notification
- Generate export → notification with download context

**Output:** `lib/email.ts`, updated API routes

---

### Task 7.3 — Production Deploy ※
**Input:** All previous tasks complete
**Build:**
- Set production environment variables on Vercel
- Configure custom domain + SSL
- Set Supabase to production mode
- Configure Stripe live keys (when ready for real payments)
- DNS configuration
- Final smoke test on production URL

**Verify:**
- Production URL loads
- Full flow: signup → pay (test mode) → create project → plan → upload → export → verify
- No console errors
- Lighthouse score: Performance >70, Accessibility >90

**Output:** Live production URL

---

## Task Summary

| Phase | Tasks | Est. Sessions | Dependencies |
|-------|-------|---------------|-------------|
| 1: Foundation | 1.1, 1.2 | 2 | None |
| 2: Scaffold + DB | 2.1, 2.2, 2.3, 2.4, 2.5 | 5 | Phase 1 |
| 3: Core API | 3.1, 3.2, 3.3, 3.4 | 4 | Phase 2 |
| 4: Export | 4.1, 4.2 | 2 | Phase 3 |
| 5: Stripe | 5.1, 5.2 | 2 | Phase 2 (can parallel Phase 3-4) |
| 6: UI | 6.1, 6.2, 6.3, 6.4, 6.5 | 5 | Phase 3, 4, 5 |
| 7: Polish | 7.1, 7.2, 7.3 | 3 | Phase 6 |
| **TOTAL** | **23 tasks** | **23 sessions** | |

## Parallel Opportunities

- Task 2.2 ‖ Task 2.3 (schema and auth are independent)
- Phase 5 can start during Phase 3-4 (Stripe doesn't depend on core API)
- Tasks 7.1 and 7.2 can run in parallel

## ANVIL Session Template

Every ANVIL session should follow this pattern:

```
1. /clear (fresh context)
2. Read: FORGE blueprint (relevant section)
3. Read: This manifest (current task)
4. Read: Foundational Design Rules (if touching data model or hash chain)
5. Build the task
6. Run VERIFY steps
7. Commit with message: "anvil: task X.Y — [description]"
```
