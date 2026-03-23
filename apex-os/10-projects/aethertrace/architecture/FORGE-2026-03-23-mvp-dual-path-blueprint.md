---
type: system-blueprint
agent: forge
project: aethertrace
status: complete
date: 2026-03-23
sprint: S-2026-Q1-13
based-on:
  - "[[VIGIL-2026-03-22-mvp-market-revalidation]]"
  - "[[VIGIL-2026-03-23-sdvosb-federal-subcontractor-revalidation]]"
  - "[[HELIOS-2026-03-22-aethertrace-frame-expansion]]"
tags: [aethertrace, architecture, mvp, dual-path, forge]
summary: "Dual-path MVP blueprint. One domain-agnostic engine serves both Path A (SaaS for commercial subs) and Path B (federal subcontractor deliverables). 6-week build. Next.js + Supabase + SHA-256. Hash chain is the foundation — test before any UI."
---

# FORGE System Blueprint — AetherTrace Dual-Path MVP

## Based on VIGIL Verdicts
- Market Revalidation: GO — 28/30
- SDVOSB Federal Subcontractor: GO — 28/30
- HELIOS Directive: Architecture must be domain-agnostic from day one

## MVP Scope Statement

This MVP proves that construction subcontractors will pay $199/mo for cryptographic evidence custody that produces court-ready evidence packages — by delivering evidence capture, chain-of-custody ledger, evidence package export, public verification, and Stripe checkout. Nothing else.

The domain-agnostic engine simultaneously positions Casey for Path B (SDVOSB federal subcontracting) without any additional build work — the same hash chain, custody events, and verification URL serve both paths.

Build time estimate: 6 weeks, solo
Complexity rating: 3/5 — the hash chain is the hard part, everything else is standard CRUD

## In Scope / Out of Scope

### IN SCOPE (must ship):

✅ **Custody Plan + Evidence Requirements** — Before evidence capture begins, the trustee defines what will be custodied, at what milestones, by whom. Each requirement is a trackable item: pending, fulfilled, or overdue. The plan is hashed when activated (draft → active), locking it as a pre-dispute record of intent. This is what transforms AetherTrace from a filing cabinet into a custody service.

✅ **Evidence Capture Against Plan** — Upload documents, photos, logs, notes. SHA-256 hash computed on ingestion. Immutable timestamp recorded. Each upload can be tagged to a specific requirement in the custody plan, tracking fulfillment. Ad-hoc evidence (not mapped to a requirement) is also supported. This is the atomic unit of the entire system. Without it, nothing downstream works.

✅ **Chain-of-Custody Ledger** — Append-only, cryptographically chained, tamper-evident log of every custody event. Each event links to the previous event's hash, creating an unbreakable chain. This is AetherTrace's core differentiator — the thing no competitor does.

✅ **Evidence Package Export** — Court-ready PDF + ZIP bundle containing: all evidence items, full custody chain, hash verification data, human-readable summary. A non-technical attorney must be able to understand it. Path A calls this "court-ready." Path B calls this "audit-ready." Same package, different label.

✅ **Public Verification URL** — Any third party can verify evidence integrity without authentication. Enter a hash, get a YES/NO on whether the record exists and is unaltered. This is the "trust but verify" mechanism — the thing that makes AetherTrace credible to attorneys, auditors, and contracting officers.

✅ **Stripe Checkout** — $199/mo (up to 5 active projects) or $499/mo (unlimited). No free tier. No trial. Payment before custody begins. One-time setup. Stripe handles billing, invoicing, and payment failure.

✅ **Access Controls** — Role-based: Submitters can capture evidence. Only the Organization Owner can export evidence packages. AetherTrace (the system) cannot modify evidence after ingestion. This access model is a core trust guarantee.

✅ **Organization + Project Structure** — Multi-tenant. Each organization has projects. Each project contains evidence items. Tenant isolation at the database level via Supabase RLS.

### OUT OF SCOPE (post-MVP list — Sentinel owns this):

🚫 **Prime Contractor Accounts** — VIGIL confirmed Path A targets subcontractors. Prime accounts add complexity (multi-party access, billing hierarchies). Build when first prime asks for it.

🚫 **DoD/CMMC Features** — Path B requires SDVOSB certification and relationship building (Months 4-12). The MVP engine serves federal needs without federal-specific features. CMMC compliance is a v2 concern.

🚫 **AI Analysis** — HELIOS confirmed AetherTrace is NOT an analytics product. It custodies evidence. It does not interpret it. AI analysis is a different product for a different day.

🚫 **Procore/PlanGrid Integration** — Requires API partnership agreements and sustained engineering. Zero customers have asked for it. YAGNI.

🚫 **Blockchain** — SHA-256 hash chain provides identical tamper-evidence guarantees without the gas fees, latency, or complexity. CLAUDE.md is explicit: "~50 lines of code." No blockchain.

🚫 **Insurance Integrations** — HELIOS identified insurance as an adjacent system. Adjacent means later. Not now.

🚫 **Offline Mobile** — Service workers, sync conflict resolution, and offline-first architecture triple the build time. Ship web-first. Mobile PWA is v2.

🚫 **Federal Audit-Specific Report Templates** — The evidence package export works for both commercial and federal use. Federal-specific report formatting (e.g., SF-330 attachment format) is a template layer added in Path B timeline (Month 6+), not an MVP engineering decision.

🚫 **Team Management / User Invitations** — Organization Owner creates the org. For MVP, additional submitters are added manually by the Owner. Self-service invitation flow is polish, not proof.

## Stack Decision

| Layer | Choice | Why | Trade-off |
|-------|--------|-----|-----------|
| Frontend | Next.js 14 (App Router) | Casey's stack. SSR for SEO on marketing pages. App Router for modern patterns. One framework, no context-switching. | Slightly more complex than plain React. Worth it for the routing and API consolidation. |
| Backend | Next.js API Routes | Monolith. One codebase, one deployment. API routes handle all server logic. No separate Express server. | If WebSockets needed later (real-time custody events), extract to a service. That's v2. |
| Database | Supabase (Postgres + RLS) | Managed Postgres. Row-Level Security enforces tenant isolation at the database layer — not the application layer. This is a security architecture decision, not a convenience choice. | Vendor lock-in to Supabase. Acceptable: Postgres is portable. RLS policies are SQL. Migration path exists. |
| File Storage | Supabase Storage | Write-once bucket policy. Evidence files cannot be overwritten or deleted after upload. This is enforced at the storage layer, not the application layer. | Less flexible than S3. That inflexibility is the feature. |
| Auth | Supabase Auth | Integrated with the database. RLS policies reference auth.uid() directly. Zero additional integration. | Less feature-rich than Clerk/Auth0. Doesn't matter — AetherTrace needs login, not social auth or MFA (yet). |
| Payments | Stripe | Industry standard. Checkout Sessions for the payment flow. Webhooks for subscription lifecycle. Customer Portal for self-service billing. | 2.9% + 30¢ per transaction. At $199/mo, that's ~$6.07/customer/mo. Acceptable. |
| Hosting | Vercel | One-click deploy from GitHub. Preview deployments for every PR. Edge functions if needed. Generous free tier covers MVP. | Vendor lock-in to Vercel's edge runtime. Acceptable for MVP. Next.js deploys anywhere if needed. |
| Crypto | Node.js built-in `crypto` | SHA-256 hashing. HMAC for chain linking. No external library. ~50 lines of code. Battle-tested, no supply chain risk. | No fancy key management. Not needed — AetherTrace computes hashes, not encryption. |
| Email | Resend | Transactional emails: welcome, evidence submitted confirmation, package export ready. Simple API, generous free tier. | Less feature-rich than SendGrid. Doesn't matter for transactional email. |

**Monthly infra cost at launch:** ~$25/mo (Supabase free tier + Vercel free tier + Resend free tier + domain)
**Monthly infra cost at 100 customers:** ~$75/mo (Supabase Pro $25 + Vercel Pro $20 + Resend $20 + domain $10)

## System Map

```
[Browser] → [Next.js App (Vercel)]
               ├── /app (React UI)
               │    ├── /dashboard — project list, evidence feed
               │    ├── /project/[id] — project overview + completeness dashboard
               │    ├── /project/[id]/plan — custody plan builder + requirement tracker
               │    ├── /project/[id]/evidence — evidence items, custody log
               │    ├── /project/[id]/export — package generation
               │    └── /verify/[hash] — public verification (no auth)
               │
               └── /api (API Routes)
                    ├── /api/plan/create — create custody plan for project
                    ├── /api/plan/[id]/activate — lock plan + hash (draft → active)
                    ├── /api/plan/[id]/requirements — CRUD requirements
                    ├── /api/evidence/upload — file + metadata + requirement_id → hash + custody event
                    ├── /api/evidence/[id] — read evidence item
                    ├── /api/custody/[projectId] — full custody chain
                    ├── /api/completeness/[projectId] — plan completeness status
                    ├── /api/export/[projectId] — generate evidence package (includes plan + completeness)
                    ├── /api/verify/[hash] — public hash verification
                    ├── /api/stripe/checkout — create checkout session
                    └── /api/stripe/webhook — handle subscription events

[Supabase]
  ├── Postgres (with RLS)
  │    ├── organizations
  │    ├── projects
  │    ├── custody_plans
  │    ├── evidence_requirements
  │    ├── evidence_items
  │    ├── custody_events
  │    ├── evidence_packages
  │    └── subscriptions
  │
  ├── Storage
  │    └── evidence-files (write-once bucket)
  │
  └── Auth
       └── users → organizations (membership)

[External]
  ├── Stripe — payments + subscription lifecycle
  └── Resend — transactional email
```

## The Trustee Function — How AetherTrace Actually Works

AetherTrace is not a passive evidence bucket. It is a custody service with a defined workflow that maps to how real projects operate — especially in procurement, where the work is planned before it's executed.

### The Workflow (How Casey Operates as Trustee)

**Step 1: Custody Plan** — Before any evidence is captured, the trustee (Casey or the org owner) creates a Custody Plan for the project. This defines: what evidence categories will be custodied, at what milestones, by whom, and what constitutes a complete custody record. In construction: "We will custody daily progress photos, inspection reports at each milestone, material delivery receipts, and change order documentation." In ESPC: "We will custody M&V baseline readings, monthly performance data, equipment installation verification, and commissioning reports."

**Step 2: Evidence Requirements** — Each custody plan contains specific Evidence Requirements — the individual items that MUST be captured. These are checkboxes, not suggestions. "Foundation inspection photo — due at milestone 1." "HVAC commissioning report — due at milestone 3." The plan defines what "complete" looks like before the first piece of evidence arrives.

**Step 3: Evidence Capture Against Plan** — Submitters upload evidence and tag it to a specific requirement in the plan. The system tracks: which requirements have been fulfilled, which are pending, which are overdue. Every upload is hashed and chained as before — but now it's mapped to a requirement, not floating in a void.

**Step 4: Completeness Verification** — At any point, the trustee can see a completeness dashboard: 14 of 22 requirements fulfilled, 3 pending, 5 overdue. The evidence package export includes this completeness status. An attorney or auditor doesn't just see "here are some files" — they see "here is what was supposed to be custodied, here is what was actually custodied, and here is the gap."

**Step 5: Evidence Package Export** — Same as before, but now includes the custody plan, requirement status, and completeness score alongside the hash chain and verification data.

### Why This Matters

For **Path A** (commercial SaaS): A subcontractor who defines their custody plan before work begins has a fundamentally stronger legal position. "We planned to custody these 22 items. All 22 are here, cryptographically verified." vs. "Here are some photos we took."

For **Path B** (federal subcontractor): Casey sits at the planning table during project kickoff. "I'm your evidence custodian. Here's the custody plan. These are the items we'll track against your milestones." This is a professional service, not a software subscription. The custody plan IS the deliverable that primes pay for — the software is just the engine that enforces it.

For **legal credibility**: A pre-defined custody plan that was created before any dispute existed is exponentially more credible than ad-hoc evidence collection. It shows intent, process, and completeness — the three things attorneys and auditors look for.

## Core Data Model

This is the heart of AetherTrace. The data model is domain-agnostic by design — per HELIOS directive. Construction-specific language appears only in the UI layer.

### Entity Definitions

```sql
-- Organizations (tenants)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_customer_id TEXT,
  subscription_status TEXT DEFAULT 'inactive', -- inactive, active, past_due, canceled
  plan TEXT DEFAULT 'starter', -- starter (5 projects), professional (unlimited)
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Projects (containers for evidence)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active', -- active, archived
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Custody Plans (the trustee function — defines what WILL be custodied)
-- Created BEFORE evidence capture begins. This is the contract.
CREATE TABLE custody_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,              -- e.g., "Phase 1 Construction Custody Plan"
  description TEXT,                -- scope of custody
  status TEXT DEFAULT 'draft',     -- draft, active, completed, archived
  plan_hash TEXT NOT NULL,         -- SHA-256 of plan contents at activation
  activated_at TIMESTAMPTZ,        -- when plan moved from draft → active (locked)
  completed_at TIMESTAMPTZ,        -- when all requirements fulfilled
  metadata JSONB DEFAULT '{}',     -- flexible: milestones, parties, contract refs
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Evidence Requirements (what MUST be custodied — defined in advance)
-- Each requirement is a checkbox: either fulfilled or not
CREATE TABLE evidence_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custody_plan_id UUID NOT NULL REFERENCES custody_plans(id),
  category TEXT NOT NULL,          -- e.g., "inspection", "delivery", "testing", "m&v"
  description TEXT NOT NULL,       -- e.g., "Foundation inspection photo at milestone 1"
  milestone TEXT,                  -- optional grouping: "Pre-construction", "Phase 1", etc.
  due_date TIMESTAMPTZ,            -- when this evidence is expected
  required BOOLEAN DEFAULT true,   -- required vs. optional evidence
  status TEXT DEFAULT 'pending',   -- pending, fulfilled, overdue, waived
  fulfilled_by UUID REFERENCES evidence_items(id), -- links to the actual evidence when captured
  fulfilled_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,    -- display ordering within plan
  metadata JSONB DEFAULT '{}',     -- flexible: responsible party, notes
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Evidence Items (the atomic unit)
-- DOMAIN-AGNOSTIC: no construction-specific fields
CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  submitted_by UUID NOT NULL REFERENCES auth.users(id),
  file_path TEXT NOT NULL,          -- Supabase Storage path
  file_name TEXT NOT NULL,          -- original filename
  file_type TEXT NOT NULL,          -- MIME type
  file_size BIGINT NOT NULL,        -- bytes
  content_hash TEXT NOT NULL,       -- SHA-256 of file contents
  requirement_id UUID REFERENCES evidence_requirements(id), -- links to custody plan requirement (NULL if ad-hoc)
  metadata JSONB DEFAULT '{}',      -- flexible metadata (labels, notes, location)
  chain_hash TEXT NOT NULL,         -- hash linking to previous item in project chain
  chain_position INTEGER NOT NULL,  -- sequential position in chain
  previous_hash TEXT,               -- explicit reference to previous item's chain_hash (NULL for first)
  captured_at TIMESTAMPTZ NOT NULL, -- when the evidence was captured (user-reported)
  time_confidence TEXT DEFAULT 'user-reported', -- L3 compliance: 'user-reported', 'device-generated', 'system-generated'
  ingested_at TIMESTAMPTZ DEFAULT now(), -- when AetherTrace received it (system-generated)
  UNIQUE(project_id, chain_position)
);

-- Custody Events (append-only log)
-- Every action on every evidence item is recorded here
CREATE TABLE custody_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_item_id UUID NOT NULL REFERENCES evidence_items(id),
  project_id UUID NOT NULL REFERENCES projects(id),
  actor_id UUID NOT NULL REFERENCES auth.users(id),
  event_type TEXT NOT NULL,         -- ingested, viewed, exported, verified, ingestion_failed (G2: failure is evidence)
  event_hash TEXT NOT NULL,         -- SHA-256 of event data
  chain_hash TEXT NOT NULL,         -- hash linking to previous custody event
  chain_position INTEGER NOT NULL,  -- sequential position in custody chain
  previous_hash TEXT,               -- explicit reference to previous event's chain_hash
  event_data JSONB DEFAULT '{}',    -- event-specific metadata
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, chain_position)
);

-- Evidence Packages (exported bundles)
CREATE TABLE evidence_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),
  generated_by UUID NOT NULL REFERENCES auth.users(id),
  package_hash TEXT NOT NULL,       -- SHA-256 of the complete package
  file_path TEXT NOT NULL,          -- Supabase Storage path to ZIP
  evidence_count INTEGER NOT NULL,
  custody_event_count INTEGER NOT NULL,
  chain_valid BOOLEAN NOT NULL,     -- was the chain intact at time of export?
  generated_at TIMESTAMPTZ DEFAULT now()
);
```

### Key Relationships
```
Organization (1) ──→ (many) Projects
Project (1) ──→ (many) Custody Plans
Custody Plan (1) ──→ (many) Evidence Requirements
Evidence Requirement (1) ──→ (0 or 1) Evidence Item (fulfillment link)
Project (1) ──→ (many) Evidence Items (hash-chained)
Evidence Item (0 or 1) ←── (0 or 1) Evidence Requirement (requirement_id)
Project (1) ──→ (many) Custody Events (hash-chained)
Project (1) ──→ (many) Evidence Packages
Evidence Item (1) ──→ (many) Custody Events
```

The custody plan → requirement → evidence item chain is the trustee workflow:
Plan defines requirements. Requirements get fulfilled by evidence items.
Evidence items are hash-chained regardless of whether they fulfill a requirement.
Ad-hoc evidence (requirement_id = NULL) is still valid — it just isn't mapped to the plan.

### The Hash Chain — How It Works

This is the most architecturally significant piece of code in the system. ~50 lines. Must be correct on first pass.

```
Evidence Item Chain (per project):
  Item 1: chain_hash = SHA-256(content_hash + ingested_at + "GENESIS")
  Item 2: chain_hash = SHA-256(content_hash + ingested_at + Item1.chain_hash)
  Item 3: chain_hash = SHA-256(content_hash + ingested_at + Item2.chain_hash)
  ...
  Item N: chain_hash = SHA-256(content_hash + ingested_at + ItemN-1.chain_hash)

Custody Event Chain (per project):
  Event 1: chain_hash = SHA-256(event_hash + created_at + "GENESIS")
  Event 2: chain_hash = SHA-256(event_hash + created_at + Event1.chain_hash)
  ...

Verification:
  Walk the chain from genesis to tip.
  Recompute each chain_hash from its inputs.
  If any recomputed hash ≠ stored hash → CHAIN BROKEN → evidence tampered.
```

**Non-negotiable: The hash chain must be tested in isolation before any UI code is written.** This is Build Risk #1 from CLAUDE.md.

### Row-Level Security (RLS) Policies

```sql
-- Organizations: users can only see their own org
CREATE POLICY org_isolation ON organizations
  FOR ALL USING (owner_id = auth.uid() OR id IN (
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

-- Projects: users can only see projects in their org
CREATE POLICY project_isolation ON projects
  FOR ALL USING (org_id IN (
    SELECT id FROM organizations WHERE owner_id = auth.uid()
    UNION
    SELECT org_id FROM org_members WHERE user_id = auth.uid()
  ));

-- Evidence Items: same org isolation
CREATE POLICY evidence_isolation ON evidence_items
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    )
  ));

-- Custody Events: same pattern
-- Evidence Packages: same pattern

-- CRITICAL: Evidence items and custody events are INSERT-ONLY for non-owners
-- Only SELECT and INSERT. No UPDATE. No DELETE. Ever.
CREATE POLICY evidence_immutable ON evidence_items
  FOR INSERT WITH CHECK (
    submitted_by = auth.uid() AND
    project_id IN (SELECT id FROM projects WHERE org_id IN (
      SELECT id FROM organizations WHERE owner_id = auth.uid()
      UNION
      SELECT org_id FROM org_members WHERE user_id = auth.uid()
    ))
  );

-- Storage: write-once policy on evidence-files bucket
-- Configured in Supabase Storage settings, not SQL
```

### Supabase Storage — Write-Once Enforcement

Two layers of protection:

1. **Application layer:** API route checks if file path already exists before upload. Rejects overwrites.
2. **Storage bucket policy:** `evidence-files` bucket configured with:
   - INSERT: allowed (authenticated users in correct org)
   - UPDATE: denied
   - DELETE: denied

This is enforced at Supabase's storage layer. Even if the application has a bug, files cannot be overwritten.

## Architecturally Significant Decisions

These are the decisions whose cost to change later is HIGH. Everything else ANVIL decides.

### Decision 1: Domain-Agnostic Engine, Construction-Specific UI

**Chosen approach:** The data model, hash chain, custody events, and verification system contain zero construction-specific logic. Construction terminology (project, jobsite, inspection) appears only in UI labels and copy. The engine processes "evidence items" and "custody events" — it doesn't know or care whether they're construction photos, ESPC M&V data, or medical records.

**Second-order:** This means the `metadata` field on evidence_items is JSONB — flexible, schemaless. The engine stores whatever metadata the UI sends. Construction UI sends `{location: "Building A", trade: "plumbing"}`. Federal UI (later) sends `{facility: "Fort Hood", esco: "Ameresco", task_order: "DE-0001"}`. Same column. Same engine.

**Third-order:** When Path B activates (Month 6+), Casey adds a federal-focused UI theme/template layer. Zero backend changes. Zero database migrations. Zero hash chain modifications. The engine is already serving both paths.

**Acceptable: YES.** This is HELIOS's directive and it's correct. The cost of domain-agnostic design is one JSONB column instead of typed fields. The benefit is that Path B requires zero re-architecture.

### Decision 2: Hash Chain at Application Layer, Not Database Triggers

**Chosen approach:** Hash chain computation happens in the Next.js API route, not in Postgres triggers or functions.

**Second-order:** This means the API route must query the previous item's chain_hash before inserting the new item. Requires a database read before every write. Adds ~10ms per evidence upload.

**Third-order:** Chain verification can run anywhere — in the API, in the browser, in an export script. Not coupled to the database. If Casey ever needs to move off Supabase, the chain logic moves with the code.

**Acceptable: YES.** 10ms per upload is invisible to users. Portability is worth more than the micro-optimization of database triggers. The Builder should use a database transaction (BEGIN/COMMIT) to ensure the read-then-write is atomic — prevents race conditions on concurrent uploads.

### Decision 3: Monolith on Vercel, Not Microservices

**Chosen approach:** Single Next.js application. API routes, React frontend, and export generation all in one deployment.

**Second-order:** Export generation (PDF + ZIP) runs in Vercel serverless functions. Vercel has a 60-second timeout on the Pro plan (10 seconds on free). Large exports may need background processing.

**Third-order:** If export generation exceeds 60 seconds for large projects (100+ evidence items), extract to a Supabase Edge Function or a lightweight worker. This is a v2 optimization, not an MVP concern — first customers will have 5-20 evidence items per project.

**Acceptable: YES.** One deployment, one codebase, one monitoring surface. Extract when (not if) you need to.

### Decision 4: Stripe Checkout Sessions, Not Custom Payment UI

**Chosen approach:** Redirect to Stripe Checkout for payment. No custom payment form. Stripe Customer Portal for billing management.

**Second-order:** Less control over the checkout UX. Cannot customize the payment page beyond Stripe's options.

**Third-order:** Stripe handles PCI compliance, payment failures, dunning, receipts, and tax calculation. Building this ourselves would take 3+ weeks and introduce security liability.

**Acceptable: YES.** The checkout experience is not AetherTrace's differentiator. Custody is. Don't build what Stripe already built.

### Decision 5: Public Verification Page — Unauthenticated

**Chosen approach:** `/verify/[hash]` is a public page. No login required. Anyone with a hash can verify whether that evidence item exists and is unaltered.

**Second-order:** This means hash values must not leak sensitive information. The hash proves existence and integrity, not content. The verification page shows: "This evidence item was ingested on [date] and its chain is intact" — not the file itself.

**Third-order:** This public URL is what makes AetherTrace credible to third parties — attorneys, auditors, opposing counsel, contracting officers. It's the "don't trust us, verify" mechanism. Without it, AetherTrace is just another SaaS claiming integrity. With it, integrity is provable.

**Acceptable: YES.** This is a core trust mechanism, not a feature. It ships in the MVP.

## The Gall's Law Path

### v0.1 (Working foundation — Week 1-2, never shown to users)
Hash chain library + tests. Evidence upload API that computes hash, chains it, stores it. Custody event logging. Chain verification function. All tested in isolation. No UI. If the chain works, everything else is CRUD. If it doesn't, nothing else matters.

### MVP (First 10 customers — Week 3-6)
Working web app: sign up → pay → create project → upload evidence → see custody chain → export evidence package → share verification URL. Clean but minimal UI. No onboarding wizard, no tooltips, no animations. The product's value is in the custody chain, not the interface.

### v2 (After hypothesis proven, if signal strong)
Federal report templates (audit-ready formatting). Mobile PWA for field capture. Prime contractor accounts. Procore integration if demanded. Custom domains for verification URLs (client.aethertrace.com/verify/[hash]). This is where Path B diverges from Path A at the UI layer — same engine, different presentation.

### What must NOT change between v0.1 and v2:
The hash chain algorithm. The custody event schema. The verification logic. The evidence_items and custody_events table structures. The custody plan + requirements structure. These are the invariant core. Everything else can change.

### Design Invariant — AI Reconstruction Rule (Future Path D)
When AI reconstruction is built (Year 3+), this rule is immutable: **The AI can NEVER infer. It can ONLY construct derived evidence from data that already lives in the custody chain.** Every statement must trace to a specific hash. Gaps are reported as findings, not filled. The AI is a compiler, not an analyst. This is what makes reconstruction legally defensible and eliminates hallucination risk. This invariant is on the same level as the hash chain — it is non-negotiable.

## Build Sequence

ANVIL executes in this order. Each phase has a clear "done" gate.

### Phase 1: Foundation (Week 1)
**What:** Hash chain library + comprehensive tests
**Done gate:** 100% of hash chain tests pass. Chain creation, chain verification, broken-chain detection, genesis block handling, concurrent upload safety — all tested.
**Files:** `lib/hash-chain.ts`, `lib/hash-chain.test.ts`

### Phase 2: Database + Auth (Week 1-2)
**What:** Supabase project setup. Schema migration. RLS policies. Auth configuration. Storage bucket with write-once policy.
**Done gate:** Can create org, create project, upload file to storage, insert evidence_item with hash chain, and verify RLS blocks cross-tenant access.
**Files:** `supabase/migrations/001_initial_schema.sql`, `supabase/seed.sql`

### Phase 3: Custody Plan + Core API (Week 2-3)
**What:** Custody plan CRUD, evidence requirement management, plan activation (hash + lock), evidence upload with requirement tagging, custody event logging, chain verification, completeness tracking.
**Done gate:** Can create a custody plan with requirements, activate (lock) it, upload evidence tagged to a requirement, see completeness status (X of Y requirements fulfilled), see custody chain via API, verify chain integrity via API. All behind auth. All with RLS enforced.
**Files:** `app/api/plan/`, `app/api/evidence/`, `app/api/custody/`, `app/api/completeness/`, `app/api/verify/`

### Phase 4: Evidence Package Export (Week 3-4)
**What:** Generate PDF + ZIP bundle from a project's evidence chain. PDF includes: custody plan (what was supposed to be custodied), completeness report (X of Y requirements fulfilled with status of each), evidence inventory, full custody log with timestamps and hashes, chain verification status, instructions for third-party verification.
**Done gate:** Export produces a ZIP containing: evidence_package.pdf (with custody plan + completeness report), all original files, chain_verification.json, custody_plan.json, README.txt explaining how to verify independently. An attorney or auditor can see: "22 items were planned. 22 items were custodied. Chain is intact."
**Files:** `app/api/export/`, `lib/package-generator.ts`

### Phase 5: Stripe Integration (Week 4)
**What:** Checkout session creation, webhook handling, subscription status tracking, customer portal link.
**Done gate:** Can complete a payment, receive webhook, update subscription status, and enforce subscription check on protected routes.
**Files:** `app/api/stripe/`, `lib/stripe.ts`

### Phase 6: UI + Public Verification (Week 4-6)
**What:** Dashboard, project view, evidence upload UI, custody log view, export trigger, public verification page.
**Done gate:** A real human can sign up, pay, create a project, upload evidence, view the custody chain, export a package, and share a verification URL — without touching the command line.
**Files:** `app/(dashboard)/`, `app/verify/[hash]/`

### Phase 7: Polish + Deploy (Week 6)
**What:** Error handling, loading states, email notifications (welcome, evidence submitted, export ready), production environment variables, DNS, SSL.
**Done gate:** App is live on a real domain. A stranger can sign up and use it.

## Quality Attributes

**Non-negotiable for MVP:**
- **Data integrity** — Hash chain must be correct. Write-once storage must be enforced. These are the product. If they're wrong, the product is worthless.
- **Tenant isolation** — One organization must never see another's evidence. RLS at database layer, not application layer.
- **Immutability** — After ingestion, evidence items and custody events cannot be modified or deleted by anyone, including AetherTrace administrators.

**Can be improved post-MVP:**
- **Performance** — Acceptable for <100 concurrent users. Optimize when needed.
- **UI polish** — Functional > beautiful for first 10 customers.
- **Mobile experience** — Responsive web, not native app. PWA later.

**Explicitly deferred:**
- **CMMC compliance** — Not needed for Path A. Research for Path B in Month 4-6.
- **SOC 2** — Important for enterprise sales. Not needed for first 10 customers.
- **Multi-region** — Single region (us-east-1) for MVP. Geo-redundancy is a scale concern.
- **Automated backups** — Supabase handles this on Pro plan. Manual backup strategy for free tier.

## Handoff to Builder

**Start here:** `lib/hash-chain.ts` — the hash chain library and its tests. Everything else depends on this being correct. Do not write a single line of UI code until the hash chain tests pass.

**Biggest risk during build:** Evidence package export (Phase 4). PDF generation in serverless environments has quirks — library compatibility, memory limits, font handling. Budget extra time. If it slips, it slips here.

**Decisions reserved for Builder:**
- Component library choice (shadcn/ui recommended but not mandated)
- File upload UX pattern (drag-and-drop, file picker, or both)
- Dashboard layout and navigation structure
- Error message copy
- Loading state design
- Test framework (Vitest recommended)

**Definition of done:** A person who has never seen AetherTrace can visit the production URL, pay $199, create a project, define a custody plan with 5 evidence requirements, upload evidence against those requirements, see a completeness dashboard showing 3 of 5 fulfilled, view the custody chain, export an evidence package that includes the plan + completeness report + hash chain, and send a verification URL to someone who confirms the evidence is intact. That person does not need to understand cryptography. They need to understand: "This is what was supposed to be custodied. This is what was custodied. The chain is intact."

## Foundational Principles Compliance

This blueprint has been reviewed against the AetherTrace Foundational Design Rules document (Locked, Phase I + enduring). All 27 rules checked. 24 fully aligned. 3 addressed via schema additions:

- **L3 (Time Is Metadata)** — Added `time_confidence` field to evidence_items. Captured time is metadata with stated confidence, never absolute truth.
- **G2 (Failure Is Evidence)** — Added `ingestion_failed` event type to custody_events. System failures are logged as evidence, not hidden.
- **T3 (Explicit Errors)** — ANVIL directive: every API endpoint must return explicit error responses. No silent 200s on partial failure. Silence is a failure mode.

**ANVIL Builder Directives (from Foundational Principles):**
1. No code may be written without referencing which invariant it preserves (L1). Comments must cite rule IDs.
2. When ordering ambiguity exists, surface uncertainty — do not resolve silently (L2).
3. Fail closed. If hash computation fails, ingestion stops. No partial acceptance (G1).
4. Log failed ingestion attempts as custody events with type `ingestion_failed` (G2).
5. No component may infer intent or meaning from data (T2). This applies to ALL code, including helper functions.
6. Explicit errors over silent success (T3). Every API response must be unambiguous about success or failure.
7. Storage is untrusted (C5). Integrity is verified from hashes, not assumed from infrastructure.

## Handoff to SENTINEL

Blueprint complete. Stack decided. Scope locked. Trustee function integrated.
MVP build time: 6 weeks, solo.
Architecturally significant decisions: 5 — all resolved.
Biggest build risk: evidence package export (PDF generation in serverless).
Domain-agnostic engine confirmed — zero backend changes needed for Path B.
Key addition: Custody Plan + Evidence Requirements — transforms AetherTrace from a filing cabinet into a custody service. The plan defines what gets custodied BEFORE work begins. This is what Casey sells on Path B.

Sentinel — ANVIL can activate with this brief attached. The first commit is `lib/hash-chain.ts`.
