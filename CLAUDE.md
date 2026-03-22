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