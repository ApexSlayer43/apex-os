Aethertrace Vault — Persistent Context
What AetherTrace Is
AetherTrace is a neutral, cryptographically enforced custody system that transforms raw events into immutable, verifiable evidence with preserved time, identity, and lineage. It performs ONE function: prove that an event happened, when it happened, who produced it, and whether the record has been altered. It is NOT: analytics, AI, a dashboard, a scoring system, a decision engine, or a blockchain product.
Strategic Position
AetherTrace is Integrity Infrastructure — defining a new category, not competing in an existing one. Analogies: TCP/IP → data transmission. HTTPS → secure communication. AetherTrace → verifiable reality. VIGIL Score: 28/30 — highest in Battle Drill history. Zero direct competitors across four independent search vectors.
The Structural Flaw It Addresses
The party that performs the work controls the evidence of that work's quality. This produces:
* $5–12B annually in U.S. construction dispute transaction costs
* $4.1 trillion in DoD assets receiving disclaimer audit opinions 7 consecutive years
* 70% ESPC savings overstatement rate (documented by GAO)
* $1B/year DoD audit remediation spending The design invariant: custody must be independent of accountability.
Go-To-Market Sequence
* Phase 1 (Month 1–6): Commercial construction subcontractors — contractor protection play, short sales cycle
* Phase 2 (Month 6–12): ESPC evidence custody — enter DoD energy market via 19 ESCOs on DOE IDIQ
* Phase 3 (Month 12–24): OTA/SBIR pathway — direct DoD entry before Dec 2028 audit deadline
* Phase 4 (Year 2+): Protocol standardization + insurance ecosystem
MVP Scope (Weeks 1–6)
IN SCOPE:
* Evidence capture (upload docs, photos, logs, notes) — SHA-256 hash + immutable timestamp on ingestion
* Chain-of-custody ledger — append-only, cryptographically chained, tamper-evident
* Evidence package export — court-ready PDF + ZIP bundle with verification
* Public verification URL — any third party verifies integrity without authentication
* Stripe checkout — $199/mo (5 projects) or $499/mo (unlimited)
* Access controls — submitters capture, only owner exports, AetherTrace cannot modify OUT OF SCOPE (do not build yet):
* Prime contractor accounts, DoD/CMMC features, AI analysis, Procore integrations, blockchain, insurance integrations, offline mobile
Stack
* Frontend/Backend: Next.js (App Router + API Routes) — monolith, one deployment
* Database: Supabase (Postgres + RLS) — tenant isolation at database layer
* File Storage: Supabase Storage — write-once policy, evidence cannot be overwritten
* Auth: Supabase Auth
* Payments: Stripe
* Hosting: Vercel
* Crypto: Node.js built-in crypto — SHA-256, ~50 lines of code
* Email: Resend Monthly infra at launch: ~$25/mo
Data Model (Core Invariant — Never Changes)
Organization → Project → EvidenceItem → CustodyEvent → EvidencePackage Hash chains on both EvidenceItem and CustodyEvent. Domain-agnostic engine. Construction-specific UI layer only.
Pricing
* $199/mo — up to 5 active projects
* $499/mo — unlimited projects
* No free tier. No trial. Payment before custody begins.
* ROI: one lost $30K claim pays for 12+ years at $199/mo.
Key Watch Item
DoD clean audit deadline: December 31, 2028. FM Systems target already pushed to FY2031. Failure = congressional action = mandate trigger. AetherTrace must be operationally positioned before this occurs.
Build Risks (Non-Negotiable)
1. Hash chain must be correct on first pass — test before any UI
2. Write-once storage must be enforced at application AND storage bucket level
3. Evidence package must be understandable by a non-technical attorney
Windows Environment Notes
* PowerShell does not support && chaining — run commands sequentially
* Mullvad VPN may block npm — use --registry https://registry.npmjs.org
* NODE_OPTIONS="--dns-result-order=ipv4first" if IPv6 connection issues occur

UI/UX Design Intelligence (UI Pro Max Skill)
Location: Aethertrace/ui-ux-pro-max/ (persists on local machine)
This is a fully functional design intelligence engine with BM25 search across 16 CSV databases. It contains 161 reasoning rules, 67+ UI styles, 161 color palettes, 57 typography pairings, 25 chart types, and 99 UX guidelines.
How to Use (Every Session)
Run from the Aethertrace/ui-ux-pro-max/ directory:
* Full design system: python3 scripts/search.py "<keywords>" --design-system -p "ProjectName"
* Domain search: python3 scripts/search.py "<query>" --domain <domain> [-n max_results]
* Stack search: python3 scripts/search.py "<query>" --stack <stack>
Available Domains: product, style, typography, color, landing, chart, ux, react, web, prompt
Available Stacks: html-tailwind (default), react, nextjs, astro, vue, nuxtjs, nuxt-ui, svelte, swiftui, react-native, flutter, shadcn, jetpack-compose
When to Use
* Any UI/UX design decision — run --design-system first
* Choosing styles, colors, fonts — run --domain with relevant domain
* Before building any page or component — generate design system, then build
* UX review or accessibility check — run --domain ux
Standing Order: For any AetherTrace UI work, run the design system search BEFORE writing code. Do not guess at styles, colors, or typography — search first.

PRISM Override
When PRISM activates, read Aethertrace/ui-ux-pro-max/PRISM-OVERRIDE.md BEFORE using PRISM's built-in inline data. The override file connects PRISM to the full search engine (161 reasoning rules, 67+ styles, 161 palettes, 57 font pairings) and changes PRISM's output format to include implementation-ready specs (CSS variables, design tokens, component specs) that ANVIL can build from directly without guessing. PRISM's inline data (20 palettes, 20 fonts, 12 styles) is the fallback only.


## CRITICAL UPDATE — March 23, 2026: AetherTrace is Truth Infrastructure, Not SaaS
All previous references to AetherTrace as a SaaS product are superseded. AetherTrace is a protocol layer — like TCP/IP or HTTPS — that makes verifiable reality possible. "Customers" is SaaS language. "Adopters" is infrastructure language. All copy, GTM, build decisions, and positioning must reflect this.

## Business Architecture — One Engine, Three Paths
One core engine (SHA-256 hashing, cryptographic chaining, immutable timestamps, public verification). Three revenue paths. Diagram: Aethertrace/AetherTrace-Architecture-v2.html

Path A: Write Access (Commercial)
Commercial subcontractors pay $199/mo to write evidence to the chain. Output: court-ready evidence packages (PDF + ZIP + public verification URL). Entry point: subs who've been burned by GCs controlling documentation. Construction is the first domain the protocol runs in — not the product itself. Construction is to AetherTrace what email was to ARPANET.

Path B: Write Access (Federal)
Casey as SDVOSB Trustee. Federal projects at CMMC/audit compliance standards. $90K–320K per project. Output: audit-ready evidence packages. Entry points: ESPC evidence custody (19 ESCOs on DOE IDIQ), OTA/SBIR pathway, DoD audit deadline Dec 2028. This is the government legitimacy anchor.

Path D: Intelligence Access (AI Reconstruction)
AI reconstructs reality from the chain on command. Every claim traceable to a hash + timestamp. Consumers: attorneys ($10K–50K per report, months to minutes), expert witnesses, insurers (claim verification), bonding companies (contractor risk profiles), lenders (evidence-backed due diligence). Path D is what makes Paths A and B more valuable — subs aren't just documenting, they're building a dataset an AI can reconstruct into a court-ready narrative at any time. Path C (raw read access) was absorbed into Path D — nobody pays to read raw chain data, they pay for intelligence derived from it.

## Infrastructure Playbook (VIGIL Intel — How Real Infrastructure Gets Shipped)
Seven patterns extracted from TCP/IP, HTTPS, PDF, Stripe, FICO, and double-entry bookkeeping:
1. A crisis makes the problem undeniable (AetherTrace: $4.1T unauditable DoD assets, Dec 2028 deadline)
2. Verification is free, creation is where value flows (public verification URL = free; custody = paid)
3. Government adoption is the legitimacy anchor (Path B federal pathway)
4. Target the builders, not the buyers (subs adopt first, GCs follow)
5. Make the alternative look primitive (self-custodied evidence = letting the evaluated control the evaluation)
6. Standard gets adopted then formalized, not the other way around (become the standard through adoption)
7. Simplicity wins every time (one function, one protocol)

## Subcontractor Field Intelligence (VIGIL Dossier — March 2026)
The Structural Trap: When subs enter documentation into a GC's system (Procore, PlanGrid), the GC owns that data. In a dispute, the GC can and will revoke the sub's access to their own evidence.
Key stat: Average U.S. construction dispute value $60.1M (Arcadis 2025). Industry bleeds $4–12B/yr in dispute transaction costs. Average resolution: 12.5 months.
Current workarounds: Excel/paper (no chain of custody), GC's platform (GC owns it), duplicate entry (eSub), or nothing at all.
AetherTrace entry point: "Your evidence. Your custody. Mathematically unalterable. The GC can't revoke what they never controlled."
Reach channels: ASA chapter meetings (3,500+ member cos), ABC Convention, World of Concrete, LCI Congress, ContractorTalk.com, Reddit trade subs, construction YouTube influencers.
