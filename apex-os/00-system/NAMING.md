---
type: system-doc
status: active
last-updated: 2026-03-22
---

# APEX OS — Naming Conventions

## Agent Output Files
Pattern: `{AGENT}-{YYYY-MM-DD}-{slug}.md`
- Agent prefix is UPPERCASE for visual prominence
- Dates are ISO 8601 for chronological sorting
- Slugs are lowercase kebab-case
- Examples:
  - `VIGIL-2026-03-22-market-analysis.md`
  - `FORGE-2026-03-21-system-architecture.md`
  - `ANVIL-2026-03-22-mvp-sprint-log.md`
  - `SCRIBE-2026-03-22-launch-blog-post.md`
  - `BEACON-2026-03-22-ph-launch-plan.md`
  - `HELIOS-2026-03-22-launch-metrics-baseline.md`
  - `LEDGER-2026-03-22-monthly-financial-report.md`
  - `PRISM-2026-03-22-design-system.md`

## Sprint IDs
Pattern: `S-{YYYY}-Q{N}-{WW}`
- Example: `S-2026-Q1-13` (2026, Quarter 1, Week 13)

## Decision Records
Pattern: `ADR-{NNN}-{slug}.md`
- Example: `ADR-001-choose-supabase.md`

## Folders
- Snake_case for folder names
- All lowercase
- Examples: `market-intelligence/`, `tech-stack/`

## Files (non-agent)
- Kebab-case for file names
- All lowercase except system files (STATE.md, SPRINT.md, etc.)
- System files: UPPERCASE (CONSTITUTION.md, CLAUDE.md, STATE.md, SPRINT.md, DECISIONS.md)

## Frontmatter
Every output file MUST include:
```yaml
---
type: {document type}
agent: {producing agent}
project: {project name}
status: {draft | review | final | archived}
date: {YYYY-MM-DD}
summary: {one-line summary}
---
```

Additional fields vary by agent (see templates).

## Wiki-Links
- Use `[[]]` for all cross-references within the vault
- Link to personas: `[[00-system/agents/sentinel/PERSONA|SENTINEL]]`
- Link to projects: `[[10-projects/aethertrace/_index|AetherTrace]]`
