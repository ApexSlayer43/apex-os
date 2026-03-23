---
type: project-index
project: aethertrace
status: prism-pending
lead: sentinel
created: 2026-03-22
last-updated: 2026-03-23
tags: [aethertrace, evidence-custody, truth-infrastructure, protocol-layer]
summary: Neutral cryptographic custody protocol for high-stakes operational evidence. Truth infrastructure — not SaaS.
---

# AetherTrace — Project Hub

> *One function: prove that an event happened, when it happened, who produced it, and whether the record has been altered.*

## Strategic Position

AetherTrace is Truth Infrastructure — a protocol layer like TCP/IP or HTTPS. "Adopters" not "customers." Construction is the first domain the protocol runs in — not the product. VIGIL Score: 28/30. Zero direct competitors.

## Battle Drill Status

| Step | Agent | Status | Output |
|------|-------|--------|--------|
| 1 — SENTINEL | Strategic framing | ✅ COMPLETE | `00-system/SENTINEL-2026-03-23-battle-drill-v2-brief.md` |
| 2 — VIGIL | Market validation (28/30 GO) | ✅ COMPLETE | `research/` |
| 3 — HELIOS | Visionary expansion (Path D AI layer) | ✅ COMPLETE | `research/` |
| 4 — VIGIL | Re-validate after HELIOS pivot | ✅ COMPLETE | `research/` |
| 5 — FORGE | MVP blueprint (6 weeks, 7 phases) | ✅ COMPLETE | `architecture/` |
| 6 — PRISM | Design system + component spec | ⏳ **NEXT** | inspiration vault ready |
| 7 — ANVIL | Build MVP | ⏳ PENDING | — |
| 8 — BEACON | Go-to-market | ⏳ PENDING | — |
| 9 — SCRIBE | Launch content | ⏳ PENDING | — |

**PRISM activation checklist:**
1. Read `design/inspiration/VAULT-MAP.md`
2. Read `design/inspiration/BUILD-PROTOCOL.md`
3. Run `python3 ../../../../ui-ux-pro-max/scripts/search.py "cryptographic evidence custody" --design-system -p "AetherTrace"`
4. Read `../../../../ui-ux-pro-max/PRISM-OVERRIDE.md`
5. Produce design spec → save to `design/PRISM-{date}-aethertrace-design-system.md`

## Revenue Paths

| Path | Market | Entry Price | Status |
|------|--------|-------------|--------|
| A — Commercial | Construction subcontractors | $199–499/mo | MVP target |
| B — Federal | SDVOSB / ESPC / DoD energy | $90K–320K/project | Phase 2 |
| D — Intelligence | Attorneys, insurers, lenders, bonding | $10K–50K/report | Platform endgame |

**DoD clean audit deadline: December 31, 2028.** AetherTrace must be operationally positioned before this.

## Codebase (lives at vault root — not moved)

| Repo | Path from vault root | Status |
|------|---------------------|--------|
| Next.js MVP | `aethertrace-mvp/` | Active — full app router, src/, lib/ |
| Early scaffold | `aethertrace/` | Archive — hash-chain tests |

See → [[build/_index]] for full build status and stack reference.

## Key Assets

| Asset | Location |
|-------|----------|
| Architecture diagram | `architecture/AetherTrace-Architecture-v2.html` |
| UI build spec | `design/AETHERTRACE-UI-PROMPT.md` |
| Team presentation | `AetherTrace-Team-Presentation.pptx` |
| Component vault (16 components) | `design/inspiration/components/` |
| Component-to-page map | `design/inspiration/VAULT-MAP.md` |
| Build protocol | `design/inspiration/BUILD-PROTOCOL.md` |
| Design intelligence engine | `../../../../ui-ux-pro-max/` |
| Design previews (v1–v5) | `design/previews/` |
| VIGIL battle drills (15) | `research/battle-drills/` |

---

## Agent Outputs

### Research
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/research"
WHERE type != null
SORT file.mday DESC
```

### Architecture
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/architecture"
WHERE type != null
SORT file.mday DESC
```

### Design
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/design"
WHERE type != null
SORT file.mday DESC
```

### Build
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/build"
WHERE type != null
SORT file.mday DESC
```

### Finance
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/finance"
WHERE type != null
SORT file.mday DESC
```

### Marketing
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/marketing"
WHERE type != null
SORT file.mday DESC
```

### Content
```dataview
TABLE status, file.mday AS updated
FROM "apex-os/10-projects/aethertrace/content"
WHERE type != null
SORT file.mday DESC
```
