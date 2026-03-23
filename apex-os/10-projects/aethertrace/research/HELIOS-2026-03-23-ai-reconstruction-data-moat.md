---
type: vision-analysis
agent: helios
project: aethertrace
status: complete
date: 2026-03-23
category: frame-expansion
sprint: S-2026-Q1-13
tags: [aethertrace, vision, ai-reconstruction, data-moat, path-d, evidence-reconstruction]
summary: "Casey identified the data moat: AI-powered evidence reconstruction on years of custodied, structured, hash-verified data. What currently costs $500K-$2M and takes 6-18 months becomes a report generated in minutes. Path D: attorneys and experts pay per-reconstruction ($10K-$50K per report). This only works because of the custody plan — without structure, AI can't reconstruct. The data gets more valuable every month. No change to MVP."
---

# HELIOS Vision Analysis — AI Evidence Reconstruction + Data Moat

## The Reframe
AetherTrace isn't just custodying evidence — it's building the most valuable dataset in construction and federal project disputes. After 1-10 years of structured, hash-chained, custody-plan-mapped evidence accumulation, AI can reconstruct project narratives in minutes that currently take experts 6-18 months and cost $500K-$2M. The custody plan is what makes this possible — it provides the structure AI needs. This is the data moat.

## The Current Pain — Evidence Reconstruction

When a major construction dispute ($30M+) or federal audit occurs:
- Attorneys hire expert witnesses at $300-500/hour
- Experts spend 6-18 months manually reviewing documents, photos, emails, change orders
- Core question: "What actually happened, in what order, and can we prove it?"
- Reconstruction cost: $500K-$2M on major disputes
- Reconstruction quality depends on evidence that is scattered, unstructured, and often controlled by the opposing party
- Much evidence is lost, altered, or never captured in the first place

## The AI Reconstruction Invariant (Non-Negotiable Design Rule)

**The AI can NEVER infer. It can ONLY construct derived evidence from data that already lives in the custody chain.**

This is an architectural invariant on the same level as the hash chain itself. It means:

- Every statement in a reconstruction output MUST trace to a specific hash in the chain
- If evidence does not exist in the chain, the AI reports "NO EVIDENCE EXISTS" — it does not fill the gap
- The AI does not interpret, speculate, predict, or estimate
- The AI does not say "it appears that" or "based on context" or "likely"
- The AI assembles verified facts into readable narrative — it is a compiler, not an analyst
- Gaps are reported as findings, not filled with inference — absence IS the evidence
- The reconstruction output inherits the integrity of its source material because every input is hash-verified

**Why this matters legally:**
- AI inference = opinion = challengeable in court = liability
- AI reconstruction from verified evidence = derived fact = every claim has a cryptographic receipt = defensible
- This also eliminates hallucination risk — the AI literally cannot fabricate because the chain is the only source of truth

**Example of what reconstruction produces:**
"Evidence item #47 (hash: a3f8c1..., ingested: 2027-03-15, chain position: 47, chain status: INTACT) documents HVAC unit delivery. Custody Plan Requirement 14 (HVAC installation verification) due date: March 1, 2027. Status: fulfilled 14 days late."

**Example of what reconstruction NEVER produces:**
"Based on the available evidence, it appears the HVAC installation was likely delayed due to supply chain issues."

The first is derived from the chain. The second is inference. AetherTrace only produces the first. Ever.

## What AI Reconstruction on AetherTrace Data Looks Like

AetherTrace evidence after 1-10 years is:
- **Structured** — tagged to requirements in the custody plan
- **Time-ordered** — hash chain provides verified chronological sequence
- **Verified** — SHA-256 proves nothing was altered since ingestion
- **Complete (or measurably incomplete)** — custody plan defines "complete," completeness dashboard tracks fulfillment

AI reconstruction capabilities (all derived, never inferred):
1. **Narrative reconstruction** — Chronological project history with every evidence item linked to its custody plan requirement. Every sentence maps to a hash.
2. **Gap analysis** — Which requirements were never fulfilled, which were late, where the project deviated from plan. Gaps are findings, not problems to solve.
3. **Pattern detection** — Across multiple projects: contractor behavior patterns, common failure points, recurring documentation gaps. Patterns derived from custody plan completion rates and timing — not interpreted.
4. **Dispute preparation** — Surface the evidence items relevant to a specific claim, with chain verification status and requirement mapping. The attorney interprets. The AI assembles.
5. **Savings verification (ESPC)** — Compare custodied M&V data against reported savings over multi-year performance periods, identify specific divergence points with hash references. Numbers only — no conclusions.
6. **Timeline compression** — 6-18 months of expert analysis → minutes of structured report generation. Same work, same rigor, same traceability — just faster.

## Why This Only Works with the Custody Plan

Random uploaded files cannot be reconstructed into a coherent narrative — they're just a pile of documents. Evidence captured against a custody plan has structure:

- "This photo was uploaded to fulfill Requirement 14 (foundation inspection at milestone 2)"
- "It was due March 15, fulfilled March 17"
- "Hash chain confirms no alteration since ingestion"
- "Custody plan was locked (hashed) on January 3 — before construction began"

That structure is what makes AI reconstruction possible. Without the plan, there's no skeleton for the narrative. Without the skeleton, AI produces summaries — not legal-grade reconstruction.

Casey's instinct on the trustee function was the architectural decision that enables Path D.

## The Four-Path Revenue Stack

| Path | Who Pays | What For | Revenue Model | Timeline |
|------|----------|----------|---------------|----------|
| A — SaaS | Builder | WRITE evidence | $199-499/mo | Month 1+ |
| B — Federal Sub | Federal primes | Casey as SDVOSB custodian | $90K-320K/project | Month 6+ |
| C — Financial Access | Lender/insurer/bonding | READ evidence in real-time | Per-project or enterprise license | Year 2+ |
| D — AI Reconstruction | Attorney/expert/insurer | AI-powered evidence reconstruction | $10K-50K per reconstruction | Year 3+ |

### Path D Pricing Logic
- Current cost of expert evidence reconstruction: $500K-$2M over 6-18 months
- AetherTrace AI reconstruction: $10K-$50K in minutes
- That's 95-98% cost reduction and 99%+ time reduction
- ROI is immediate and obvious to any litigator or insurer
- Per-reconstruction pricing, not subscription — each report is a discrete deliverable
- Premium tiers: basic narrative ($10K), full dispute preparation with strongest-evidence ranking ($25K), expert-witness-grade report with chain verification appendix ($50K)

### The Data Moat
A competitor can copy the hash chain algorithm tomorrow. They cannot replicate:
- 3+ years of structured, custodied evidence on hundreds of projects
- Custody plans that were locked before disputes existed
- Completeness records showing what was and wasn't captured
- The network of builders, lenders, and legal professionals already using the platform

The data compounds. Every month of custody makes the reconstruction more valuable. Every project adds to the pattern detection capability. This is a moat that deepens with time — the opposite of a technology moat that erodes.

## Second and Third Order Consequences

**First order:** AI reconstructs evidence narratives from custodied data.
**Second order:** Expert witness industry disrupted. Attorneys who use AetherTrace reconstruction win disputes faster and cheaper. Word spreads. Demand for AetherTrace custody increases — because future reconstruction capability becomes a reason to custody evidence NOW.
**Third order:** Insurance companies start requiring AetherTrace custody specifically because reconstruction capability reduces their claims costs. "AetherTrace Custodied" becomes an underwriting factor. The feedback loop: more custody → better AI models → better reconstruction → more demand for custody.

## Architecture Implications

**No change to MVP.** CLAUDE.md is explicit: "AI analysis — do not build yet."

The current architecture already supports Path D because:
1. Evidence items have structured metadata (JSONB) — AI can query it
2. Requirements link evidence to custody plan — AI has the narrative skeleton
3. Completeness API returns structured JSON — AI knows what's present and missing
4. Hash chain provides verified chronological ordering — AI has a trustworthy timeline
5. Domain-agnostic engine — AI reconstruction works across construction, ESPC, or any future domain

**When Path D activates (Year 3+):**
- AI inference layer reads existing data via internal API
- No schema changes required
- No engine modifications required
- New endpoints: `/api/reconstruct/[projectId]`, `/api/patterns/[orgId]`
- Report generation: structured output → formatted PDF
- Estimated build: 4-6 weeks when activated

## The Question to Carry

If AetherTrace becomes the standard evidence custody layer AND the standard reconstruction engine — if custodying evidence on AetherTrace today means you can reconstruct your entire project history in minutes five years from now — does the act of NOT custodying evidence become negligent? Does "we didn't use AetherTrace" become the construction equivalent of "we didn't have insurance"?

## Handoff to SENTINEL

No change to MVP. No change to 6-week build. Path D is a Year 3+ capability that the current architecture already supports. The custody plan is the load-bearing decision — it's what gives AI the structure needed for reconstruction. Proceed to ANVIL.

The strategic sequence is now:
1. Path A (SaaS) → builds technology + customer base + evidence accumulation
2. Path B (SDVOSB federal sub) → builds high-value contracts + federal credibility
3. Path C (lender access) → builds platform + network effects
4. Path D (AI reconstruction) → builds data moat + disrupts expert witness industry

Each path funds and enables the next. The MVP serves all four because the engine is domain-agnostic and the data model is structured for it.
