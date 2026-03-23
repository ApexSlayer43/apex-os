---
type: system-audit
created: 2026-03-23
audited-by: cowork-session
status: findings-documented
---

# Skill Capability Audit — 2026-03-23

## Purpose
Verify that all Apex OS agent skills are actually utilizing their reference files, scripts, and data directories — not just listing them passively.

## Finding: The Reference Gap

**Every skill with reference files has the same structural flaw.**

All skills list their references in a `## REFERENCE FILES` section at the bottom of SKILL.md. None of them include a mandatory step in their operating protocol to actually READ those files before starting work.

The references are a library shelf. They need to be a standing order.

## Inventory

| Skill | Reference Files | Mandatory Read Step? | Gap |
|-------|----------------|---------------------|-----|
| ANVIL | `build-patterns.md` | NO | Listed at bottom only |
| FORGE | `scope-patterns.md`, `stack-decision-guide.md` | NO | Listed at bottom only |
| SENTINEL | `decision-architecture.md`, `team-protocols.md`, `business-archetypes.md` | NO | Listed at bottom only |
| VIGIL | `research-sources.md`, `validation-frameworks.md` | NO | Listed at bottom only |
| BEACON | `channel-guide.md`, `copy-templates.md` | NO | Listed at bottom only |
| HELIOS | `scamper-guide.md`, `blue-ocean-canvas.md`, `order-of-effects.md` | NO | Listed at bottom only |
| SCRIBE | `story-bank.md`, `voice-examples.md` | PARTIAL | Mentions inline but no mandatory step |
| PRISM | `search.py` + data (via pointers) | PARTIAL | Has usage commands but script path resolves through plugin runtime only |
| OPS-CHECK | None | N/A | No references to load |
| SKILL-CREATOR | `schemas.md` + 9 scripts + agents/ | YES (built-in) | Scripts are functional tools, not passive references |

## Root Cause

Skills were built with reference files as supplementary material — "here if you need them." But the agent follows the step-by-step protocol in the skill. If reading references isn't a numbered step in the protocol, it doesn't happen reliably.

## The Fix: Step 0 Pattern

Every skill with reference files needs a **Step 0: Load References** inserted at the top of its operating protocol:

```markdown
### Step 0: Load References (mandatory — before any other step)
Before proceeding, read the following files using the Read tool:
- `references/[file].md` — [what it contains and why it matters]

Do not skip this step. These files contain institutional knowledge
that prevents repeated mistakes and ensures consistency across sessions.
```

## PRISM-Specific Issue

PRISM's `search.py` and data directories are **pointer files** that resolve through the plugin runtime, not the OS filesystem. The actual paths (`../../../src/ui-ux-pro-max/data`) don't exist on disk. This means:

- PRISM's 97 color palettes, 57 font pairings, and domain-specific data are **inaccessible at runtime**
- PRISM can only use design knowledge baked into the SKILL.md text itself
- The search.py commands listed in SKILL.md will fail if executed directly

**Fix options:**
1. Inline the most critical data (top palettes, top font pairings) directly into SKILL.md
2. Convert pointer files to real files with actual content
3. Accept PRISM operates from SKILL.md knowledge only (current state, just make it explicit)

## Recommended Upgrade Sequence

Priority order based on battle drill position (AetherTrace build):

1. **ANVIL** — next to activate, needs `build-patterns.md` for stack implementation patterns
2. **PRISM** — next in drill after this audit, needs design data accessible
3. **FORGE** — already ran for AetherTrace, but fix for future projects
4. **SCRIBE** — needs story-bank.md for authentic content, closest to correct already
5. **SENTINEL** — 3 reference files, all critical for orchestration decisions
6. **VIGIL** — research sources and validation frameworks
7. **BEACON** — channel guide and copy templates
8. **HELIOS** — SCAMPER, blue ocean, order of effects

## Decision Needed

- [ ] Approve Step 0 pattern for all skills
- [ ] Decide PRISM data access approach (inline vs. convert vs. accept)
- [ ] Set priority: fix all now vs. fix on activation (just-in-time)

## Status
Findings documented. Awaiting Casey's decision on fix approach before upgrading skills.


---

## Resolution — Completed 2026-03-23

All 8 agent skills upgraded with:
1. **Step 0: Load References** — mandatory read of reference files before any work
2. **Connected MCP Tools** — Supabase, Vercel, Figma, 21st.dev, Obsidian, Chrome, WebSearch, Scheduled Tasks mapped to relevant skills
3. **Connected Plugin Skills** — 15 personal plugins mapped to agent skills with specific function-level guidance

### Upgrade Summary

| Skill | References | MCPs | Plugin Skills | Status |
|-------|-----------|------|---------------|--------|
| ANVIL | `build-patterns.md` | Supabase, Vercel, 21st.dev | Engineering (6), Design (2), Data (3) | INSTALLED |
| PRISM | Inline palettes/fonts/styles | Figma, 21st.dev | Design (7), Brand voice (1) | INSTALLED |
| FORGE | `scope-patterns.md`, `stack-decision-guide.md` | Supabase, Vercel, Figma | Engineering (3), PM (2) | INSTALLED |
| SCRIBE | `story-bank.md`, `voice-examples.md` | Obsidian | Marketing (2), Brand voice (1) | INSTALLED |
| SENTINEL | `decision-architecture.md`, `team-protocols.md`, `business-archetypes.md` | Obsidian, Scheduled Tasks | PM (3), Operations (4), Productivity (2), Enterprise Search (2), Legal (2), Sales (1), Common Room (1) | INSTALLED |
| VIGIL | `research-sources.md`, `validation-frameworks.md` | Chrome, WebSearch, WebFetch | Sales (2), Marketing (2), PM (2), Enterprise Search (2), Apollo (2), Common Room (2), Data (2), Legal (1) | INSTALLED |
| BEACON | `channel-guide.md`, `copy-templates.md` | Vercel, Chrome, WebSearch | Marketing (7), Sales (4), Brand voice (1), Apollo (2), Common Room (2), Data (2) | INSTALLED |
| HELIOS | `scamper-guide.md`, `blue-ocean-canvas.md`, `order-of-effects.md` | Chrome, WebSearch | PM (1), Marketing (1), Enterprise Search (2), Common Room (1) | INSTALLED |

### Decisions Made
- [x] Approved Step 0 pattern for all skills
- [x] PRISM data access: Inline critical data (20 palettes, 20 font pairings, 12 styles)
- [x] Fix timing: Upgraded all 8 skills in one session
- [x] Plugin mapping: All 15 personal plugins mapped to relevant skills with function-level guidance


---

## Verification — Completed 2026-03-23

All 8 skills verified via automated grep of installed SKILL.md files:

- Every skill has exactly 1 `Step 0:` section
- Every skill has exactly 1 `Connected MCP Tools` section
- Every skill has exactly 1 `Connected Plugin Skills` section
- PRISM has 6 `INLINE DESIGN DATA` sections (palettes, fonts, styles)
- Plugin counts match approved mapping
- MCP assignments match approved mapping

**Status: COMPLETE. All skills upgraded and verified.**
