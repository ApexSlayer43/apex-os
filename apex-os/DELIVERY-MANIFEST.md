---
type: system-doc
status: complete
date: 2026-03-22
---

# FORGE Delivery Manifest — Apex OS Complete Specification

## Overview

FORGE has delivered the complete architectural specification for Apex OS vault operations. All five mandatory file types have been written with full fidelity, detail, and implementability. ANVIL can now execute directly from these specifications without ambiguity.

## Deliverables (14 Files)

### FILE 1: 00-system/SETUP.md
**Purpose:** Procedural setup guide for Windows environment

**Contents:**
- Day 1 essential setup (Obsidian plugins, Claude Desktop MCP configuration)
- Week 1 accelerator plugins (QuickAdd, Calendar, Advanced Tables, Excalidraw)
- Week 2+ optional enhancements (Readwise, Link Converter, Copilot)
- Windows-specific gotchas (Mullvad VPN, PowerShell, path spaces, IPv6)
- Claude Desktop config.json with actual MCP definitions (Supabase, Vercel, Figma)
- Claude Code CLI configuration
- Verification checklist (Day 1 and Week 1)
- Troubleshooting guide
- Maintenance schedule (monthly updates, git cleanup)

**Key Features:**
- Complete JSON configs for MCPs (with env variable support)
- Agent slash command setup
- Initial STATE.md and DECISIONS.md templates
- All testing procedures
- Windows path examples

---

### FILE 2: .claude/rules/evolution-protocol.md
**Purpose:** Self-improvement loop for continuous agent instruction refinement

**Contents:**
- Reflexion cycle (7 phases: execute → evaluate → reflect → propose → human gate → version increment → git track)
- When evolution is triggered (weak output <18/30, weekly cycle, decision cascade)
- Evaluation rubrics (0-30 scale, 6 factors per agent)
- Rubric scoring thresholds (EXCELLENT 24-30, GOOD 18-23, ACCEPTABLE 12-17, WEAK 6-11, UNUSABLE 0-5)
- Reflection template (300 words: what went well, misunderstood, downstream feedback, proposed changes)
- Proposal format (specific change, rationale, rollback plan)
- Casey's approval workflow (three options: APPROVE / REVISE / REJECT)
- Version increment strategy (PATCH, MINOR, MAJOR semantic versioning)
- Git commit tracking (all evolutions become commits for audit trail)
- Rollback procedure (instant revert, no discussion)
- Rubric rotation (3-cycle maximum without review)
- Pattern detection (SENTINEL analyzes recurring issues)
- Quarterly retros (assess what worked, what failed, role fitness)

**Key Features:**
- Evolution is triggered automatically on <18/30 scores
- All changes are reversible via git
- Constitution rules prevent rogue evolution
- Version numbers track improvement history
- Pattern reports surface systemic issues (not individual agent failure)

---

### FILE 3: 00-system/WORKFLOW.md
**Purpose:** Operational manual for running the battle drill on day-to-day basis

**Contents:**
- Battle drill sequence (9-step execution path)
- Agent activation via slash commands (/sentinel, /vigil, /forge, etc.)
- Task briefing format (mission, context, deliverable, decision it unlocks)
- Agent return format (YAML frontmatter, self-assessment, rubric score estimate)
- SENTINEL decision gate (GREEN / AMBER / RED)
- State transitions (IDLE, INTAKE, RESEARCH, VISION, RE-VALIDATE, DESIGN, LAYOUT, BUILD, LAUNCH, PUBLISH, FINANCE)
- Blocked transitions (no ANVIL without FORGE + PRISM)
- Error handling (3 options: sharpen & retry, proceed with caveat, escalate)
- Manual orchestration during MVP (no automation yet, full transparency)
- Batch by mode pattern (ANVIL batches 5 parallel sessions, each by mode)
- Completion signaling (what signals each agent is done)
- QuickAdd macros (future acceleration, not yet live)
- Error case recovery (output quality degrades, ANVIL gets stuck, pivot mid-build)
- Continuous tracks (LEDGER always-on, SENTINEL always-on)
- Daily checklist for Casey (10 steps)
- Progress measurement (working increments, not time spent)

**Key Features:**
- No automation during MVP (manual is explicit and higher quality)
- Every handoff is visible and gated by SENTINEL
- Errors are handled with options, not blame
- Batch by mode prevents context fragmentation
- 2-hour rule prevents wall-pounding

---

### FILE 4: 00-system/GIT-STRATEGY.md
**Purpose:** Version control policy and practices for vault

**Contents:**
- Branch strategy (main = production, dev = working, no force pushes)
- Auto-commit via Obsidian Git (every 10 minutes, "vault sync" message)
- Commit message format (TYPE: AGENT project — reason)
- Commit types (agent-output, agent-evolution, system-update, feature, fix, docs)
- What gets tracked vs. excluded (.env, .obsidian/, node_modules excluded)
- Rollback procedures (4 cases: undo last commit, revert specific commit, reset to known good, recover deleted file)
- Merge conflict resolution (find conflicts, choose manually, stage, commit)
- Merge strategy (fast-forward preferred, rebase if needed)
- Tagging releases (semantic version tags for milestones)
- Git logs for agent tracking (grep patterns for VIGIL, evolution, projects)
- Push to remote (MVP is local-only, can push later)
- Continuous integration (future, not yet implemented)
- Useful git aliases (.gitconfig suggestions)
- Vault size monitoring (gc --aggressive if >1GB)

**Key Features:**
- Every agent output becomes a commit
- Every evolution becomes a commit with full reflection in message body
- Commits are small, frequent, reversible
- Clean audit trail for future analysis
- Prevents accidental data loss

---

### FILE 5-13: Agent CAPABILITIES Files (9 agents)
**Purpose:** Precise specification of each agent's tools, file access, spawn rights, and chaining behavior

Each file contains:

#### SENTINEL — 00-system/agents/sentinel/CAPABILITIES.md
- No external tools (pure orchestration)
- Full read access to vault
- Narrow write access (system outputs only)
- Cannot spawn sub-agents
- Triggers all agents in sequence via SENTINEL's decision gates

#### VIGIL — 00-system/agents/vigil/CAPABILITIES.md
- **Tools:** Claude in Chrome (web research), MCP Registry (discover new tools)
- **Files:** Read research context, write to research/ folder
- **Spawn:** No
- **Chaining:** Always first. Triggers HELIOS or FORGE via SENTINEL.
- **Modes:** Market validation, assumption audit, competitor deep dive, customer language harvest
- **Output:** Intelligence Report with GO/PIVOT/NO-GO verdict (0-30 score)

#### HELIOS — 00-system/agents/helios/CAPABILITIES.md
- **Tools:** Claude in Chrome (horizon scanning only)
- **Files:** Read research + project context, write to analytics/ folder
- **Spawn:** No
- **Chaining:** After VIGIL's initial GO. Routes back through VIGIL if pivots frame.
- **Modes:** Blue Ocean expansion, second/third-order consequences, SCAMPER transformations, Long-Now thinking
- **Output:** Vision document + one new question

#### FORGE — 00-system/agents/forge/CAPABILITIES.md
- **Tools:** Supabase search_docs, Figma get_design_context (read-only, architecture reference)
- **Files:** Read research + architecture context, write to architecture/ folder
- **Spawn:** No
- **Chaining:** After VIGIL GO (and after HELIOS if pivot). Triggers PRISM + ANVIL via SENTINEL.
- **Modes:** MVP blueprint, stack selection, Gall's Law pathway, data model design, decision arbitration
- **Output:** System Blueprint with IN/OUT scope locked (unambiguous for ANVIL)

#### PRISM — 00-system/agents/prism/CAPABILITIES.md
- **Tools:** Figma all tools, 21st.dev component_builder/inspiration/refiner, logo_search
- **Files:** Read architecture + research context, write to design/ folder
- **Spawn:** No
- **Chaining:** After FORGE blueprint. Parallel input to ANVIL (not sequential).
- **Modes:** Full design system, key screen wireframes, component specification, user flow mapping, accessibility audit
- **Output:** Design System + Component Specs (exact pixel values, all states)

#### ANVIL — 00-system/agents/anvil/CAPABILITIES.md
- **Tools:** Supabase execute_sql/apply_migration/generate_typescript_types/get_logs, Vercel deploy_to_vercel/get_deployment/get_runtime_logs, Supabase branch/edge function/merge/reset operations
- **Files:** Read blueprint + design + build history, write to build/ folder
- **Spawn:** No
- **Chaining:** After FORGE + PRISM complete. Triggers BEACON via SENTINEL.
- **Modes:** 5 build sessions (Architecture review, Data+Auth, Core feature skeleton, Payment, Polish+Deploy)
- **Output:** Build Plan + Status Updates (working increments, never redesigns)

#### BEACON — 00-system/agents/beacon/CAPABILITIES.md
- **Tools:** Claude in Chrome (competitor research), Scheduled Tasks (campaign scheduling)
- **Files:** Read research + product readiness, write to marketing/ folder
- **Spawn:** No
- **Chaining:** After ANVIL deploys. Triggers SCRIBE via SENTINEL.
- **Modes:** Dunford positioning, landing page copy, First 10 protocol, launch channel plan, competitive differentiation
- **Output:** Marketing Brief with positioning locked (unambiguous for SCRIBE)

#### SCRIBE — 00-system/agents/scribe/CAPABILITIES.md
- **Tools:** Claude in Chrome (content research only)
- **Files:** Read positioning + research context, write to content/ folder
- **Spawn:** No
- **Chaining:** Last in battle drill. Also activated independently by Casey for weekly content.
- **Modes:** Launch announcement, weekly newsletter, X threads, LinkedIn posts, YouTube scripts
- **Output:** Content drafts (Casey approves before publish)

#### LEDGER — 00-system/agents/ledger/CAPABILITIES.md
- **Tools:** Supabase execute_sql (queries only, never modify), Scheduled Tasks (monthly reminders)
- **Files:** Read all project data, write to finance/ folder
- **Spawn:** No
- **Chaining:** Operates continuously (parallel to all other agents, not in sequence)
- **Modes:** Monthly P&L, unit economics per stream, project cost accounting, quarterly tax estimation, anomaly detection
- **Output:** Financial reports (every number traceable, conservative estimates, no hallucination)

---

## Key Design Constraints (Non-Negotiable)

1. **VIGIL before FORGE. Always.** No unvalidated blueprints.
2. **FORGE before ANVIL. Always.** No scope creep. ANVIL executes exactly.
3. **ANVIL executes, never redesigns.** Blueprint is binding.
4. **SENTINEL coordinates, never builds.** Pure orchestration.
5. **PRISM designs for VIGIL's customer.** Not personal preference.
6. **BEACON writes from VIGIL's language.** Never invents copy.
7. **SCRIBE anchors to real events.** No generic content.
8. **LEDGER never halluculates numbers.** Deterministic only.
9. **Evolution is traceable.** Every improvement is git-tracked and reversible.
10. **Manual orchestration during MVP.** Transparency > automation.

---

## Complexity Tolerance

Entire system is designed for ONE person (Casey) to maintain:

- **Setup:** ~2 hours (Day 1 plugins, one-time)
- **Weekly cycle:** ~5 hours (SENTINEL intake + agent batching)
- **Monthly maintenance:** ~1 hour (git cleanup, plugin updates)
- **Evolution:** ~30 min per agent (read reflection, approve change, version increment)

No system complexity without justification. No premature automation. High fidelity, low overhead.

---

## Implementation Path for ANVIL

1. Read CLAUDE.md overview (understand role)
2. Read SETUP.md (Day 1 plugins, config)
3. Read CONSTITUTION.md (immutable rules)
4. Read BATTLE-DRILL.md (sequence)
5. Read WORKFLOW.md (daily operations)
6. Read SETUP.md verification checklist (test everything)
7. Execute: Create first project, run SENTINEL intake, proceed through battle drill

All agent behaviors are defined in their respective CAPABILITIES.md files. No ambiguity.

---

## Files Delivered

```
00-system/SETUP.md                                    ✓
.claude/rules/evolution-protocol.md                   ✓
00-system/WORKFLOW.md                                 ✓
00-system/GIT-STRATEGY.md                             ✓
00-system/agents/sentinel/CAPABILITIES.md             ✓
00-system/agents/vigil/CAPABILITIES.md                ✓
00-system/agents/helios/CAPABILITIES.md               ✓
00-system/agents/forge/CAPABILITIES.md                ✓
00-system/agents/prism/CAPABILITIES.md                ✓
00-system/agents/anvil/CAPABILITIES.md                ✓
00-system/agents/beacon/CAPABILITIES.md               ✓
00-system/agents/scribe/CAPABILITIES.md               ✓
00-system/agents/ledger/CAPABILITIES.md               ✓
DELIVERY-MANIFEST.md (this file)                      ✓
```

---

FORGE specification is complete. Apex OS is ready for ANVIL to execute.

The system is precise, implementable, and maintainable by one person.

Build it.
