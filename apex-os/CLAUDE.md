# APEX OS — Agent Coordination Operating System

## Overview
Apex OS is a self-evolving multi-agent AI operating system coordinated through this Obsidian vault. Nine executive agents operate through markdown files with persistent memory, standardized handoffs, and evaluation-driven self-improvement.

## Owner
Casey Hall — former 13J Fire Control Specialist, Range Safety NCO at Grafenwoehr, medically retired. Building businesses through this agent team.

## Architecture
- **Vault = execution surface.** Agents read from and write to markdown files.
- **Each agent** has a persona at `00-system/agents/{name}/PERSONA.md`, rubric at `RUBRIC.md`, and capabilities at `CAPABILITIES.md`
- **State** tracked in `00-system/STATE.md`, sprints in `00-system/SPRINT.md`
- **All outputs** use standardized YAML frontmatter for Dataview queries
- **Git** for version control, rollback, and evolution tracking

## The Executive Team
| Agent | Role | Domain |
|-------|------|--------|
| SENTINEL | Master Orchestrator | Strategy, coordination, evolution cycles |
| VIGIL | Intelligence Analyst | Research, validation, market intelligence |
| HELIOS | Visionary | Blue ocean thinking, expansion, creative reframes |
| FORGE | System Architect | Technical design, stack selection, MVP scoping |
| PRISM | UI/UX Designer | Design systems, wireframes, user flows, accessibility |
| ANVIL | Builder | Implementation, deployment, sprint execution |
| BEACON | Marketer | Positioning, channels, launch sequencing, copy |
| SCRIBE | Content Creator | Newsletter, social, YouTube, brand voice |
| LEDGER | Finance & Accounting | P&L, unit economics, cash flow, tax prep |

## Battle Drill Sequence
```
SENTINEL → VIGIL → HELIOS → VIGIL (re-validate if pivot)
→ FORGE → PRISM → ANVIL → BEACON → SCRIBE
LEDGER runs continuously across all projects
```

## Active Projects
- **AetherTrace:** `10-projects/aethertrace/` — Cryptographic evidence custody system

## Agent Protocol
1. ALWAYS read `00-system/STATE.md` before starting any task
2. ALWAYS read the relevant agent `PERSONA.md` before adopting that role
3. ALWAYS read `CONSTITUTION.md` constraints before any work
4. Output files MUST include frontmatter: type, agent, project, status, date, summary
5. Use naming convention: `{AGENT}-{YYYY-MM-DD}-{slug}.md`
6. Commit after every successful change

## Vault Structure
- `.claude/` — Claude Code integration: slash commands (`/vigil`, `/forge`, etc.) and auto-loaded rules
- `00-system/` — OS kernel: state, sprints, decisions, agents, templates, VAULT-INDEX
- `10-projects/` — One subfolder per business with agent output subfolders
- `20-areas/` — Ongoing responsibilities (brand, infrastructure, finance)
- `30-resources/` — Reference knowledge base (frameworks, market intel, tech)
- `40-archive/` — Completed / inactive work
- `50-journal/` — Daily, weekly, monthly notes and inbox

## Conventions
- Wiki-links `[[]]` for all cross-references
- ISO dates everywhere (YYYY-MM-DD)
- Snake_case for folder names, kebab-case for file names
- NEVER modify files in `.obsidian/` directory
- Preserve existing backlinks when editing notes
- Ask before bulk operations affecting >10 files

## Reference Documents (read when relevant)
- **Agent personas:** `00-system/agents/` — Read when activating any agent role
- **Battle drill:** `00-system/BATTLE-DRILL.md` — The full pipeline protocol
- **Sprint:** `00-system/SPRINT.md` — Current sprint goals and progress
- **Decisions:** `00-system/DECISIONS.md` — Architecture Decision Records
- **Naming:** `00-system/NAMING.md` — File naming conventions
- **Constitution:** `CONSTITUTION.md` — Immutable rules (read before ANY work)
- **Vault index:** `00-system/VAULT-INDEX.md` — Live system dashboard
- **Setup guide:** `00-system/SETUP.md` — Plugin installation, MCP configuration, Windows environment
- **Workflow:** `00-system/WORKFLOW.md` — Battle drill execution, state transitions, slash command activation
- **Git strategy:** `00-system/GIT-STRATEGY.md` — Branch model, commit format, rollback procedures
- **Agent capabilities:** `00-system/agents/{name}/CAPABILITIES.md` — Tool access, permissions, chaining
- **Agent commands:** `.claude/commands/` — Slash commands to activate any agent
- **Auto-rules:** `.claude/rules/` — Behavioral rules loaded every session
- **Evolution protocol:** `.claude/rules/evolution-protocol.md` — Self-improvement cycle for agent instructions

## Commands
```bash
git add -A && git commit -m "vault sync" && git push
```
