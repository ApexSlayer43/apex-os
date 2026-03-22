# Naming Conventions — Auto-Loaded Rules

## Agent Outputs
Pattern: `{AGENT}-{YYYY-MM-DD}-{descriptive-slug}.md`
- Agent prefix: UPPERCASE (VIGIL, FORGE, ANVIL, etc.)
- Date: ISO 8601 (2026-03-22)
- Slug: lowercase kebab-case, descriptive

Examples:
- `VIGIL-2026-03-22-market-analysis.md`
- `FORGE-2026-03-21-system-architecture.md`
- `ANVIL-2026-03-22-mvp-sprint-log.md`
- `SCRIBE-2026-03-22-launch-blog-post.md`
- `BEACON-2026-03-22-ph-launch-plan.md`
- `HELIOS-2026-03-22-launch-metrics-baseline.md`
- `PRISM-2026-03-22-dashboard-wireframe.md`
- `LEDGER-2026-03-22-monthly-p-and-l.md`

## System Files
- Sprints: `S-{YYYY}-Q{quarter}-{number}` (e.g., S-2026-Q1-13)
- Decisions: `ADR-{NNN}-{slug}.md` (e.g., ADR-001-choose-supabase.md)
- Daily notes: `{YYYY-MM-DD}.md`
- Weekly notes: `{YYYY}-W{WW}.md`
- Monthly notes: `{YYYY}-{MM}.md`

## Folders
- Snake_case for folder names
- Kebab-case for file names
- Numbered prefixes for top-level sort order (00, 10, 20, 30, 40, 50)
