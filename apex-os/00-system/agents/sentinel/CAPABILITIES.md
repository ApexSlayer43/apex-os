---
type: agent-capabilities
agent: sentinel
version: 1.0.0
last-updated: 2026-03-22
---

# SENTINEL — Capabilities

## External Tools

**No external MCPs.** SENTINEL is pure orchestration.

SENTINEL operates through:
- File reading (vault markdown files)
- Strategic analysis (no tool calls)
- Human interaction (chat interface)
- Git history review (reasoning about system state)

## Plugin Skills

SENTINEL has access to skills from the following installed plugins:

### Operations Plugin (9 skills)
- `operations:status-report` — Generate status reports with KPIs, risks, action items
- `operations:process-doc` — Document business processes, flowcharts, RACI, SOPs
- `operations:process-optimization` — Analyze and improve business processes
- `operations:risk-assessment` — Identify, assess, and mitigate operational risks
- `operations:capacity-plan` — Workload analysis and utilization forecasting
- `operations:change-request` — Change management with impact analysis and rollback
- `operations:compliance-tracking` — Track compliance requirements and audit readiness
- `operations:runbook` — Create operational runbooks for recurring procedures
- `operations:vendor-review` — Vendor evaluation with cost analysis and risk assessment

### Product Management Plugin (7 skills)
- `product-management:roadmap-update` — Create or reprioritize product roadmap
- `product-management:sprint-planning` — Plan sprints, scope work, estimate capacity
- `product-management:stakeholder-update` — Generate stakeholder updates by audience
- `product-management:write-spec` — Write feature specs and PRDs
- `product-management:metrics-review` — Review product metrics with trend analysis
- `product-management:competitive-brief` — Competitive analysis for product strategy
- `product-management:synthesize-research` — Synthesize user research into insights

### Productivity Plugin (4 skills)
- `productivity:task-management` — Task tracking via shared TASKS.md
- `productivity:memory-management` — Two-tier memory system for working context
- `productivity:start` — Initialize productivity system and dashboard
- `productivity:update` — Sync tasks and refresh memory from activity

### Human Resources Plugin (9 skills)
- `human-resources:org-planning` — Headcount planning and org design
- `human-resources:interview-prep` — Structured interview plans and scorecards
- `human-resources:onboarding` — Onboarding checklists and first-week plans
- `human-resources:performance-review` — Performance review structure and calibration
- `human-resources:comp-analysis` — Compensation benchmarking and equity modeling
- `human-resources:draft-offer` — Draft offer letters with comp details
- `human-resources:people-report` — Headcount, attrition, and org health reports
- `human-resources:recruiting-pipeline` — Track recruiting pipeline stages
- `human-resources:policy-lookup` — Find and explain company policies

### Legal Plugin (9 skills)
- `legal:brief` — Contextual legal briefings
- `legal:compliance-check` — Compliance checks on proposed actions
- `legal:legal-response` — Templated legal inquiry responses
- `legal:legal-risk-assessment` — Legal risk classification and escalation
- `legal:meeting-briefing` — Meeting briefings with legal context
- `legal:review-contract` — Contract review against negotiation playbook
- `legal:signature-request` — Document routing for e-signature
- `legal:triage-nda` — Rapid NDA triage (GREEN/YELLOW/RED)
- `legal:vendor-check` — Vendor agreement status and gap analysis

**Why SENTINEL gets these:** SENTINEL is the master orchestrator — operations, product management, productivity, HR, and legal are all strategic coordination functions. SENTINEL uses these to manage the business, not to execute domain work.

## File Permissions

### Read Access

- **All system files:** `.claude/rules/**/*.md`, `00-system/**/*.md`, `CONSTITUTION.md`
- **All agent outputs:** `10-projects/**/*.md`, `20-areas/**/*.md`
- **State & sprint files:** `00-system/STATE.md`, `00-system/SPRINT.md`, `00-system/VAULT-INDEX.md`
- **Decision records:** `00-system/DECISIONS.md`
- **Rubrics:** `00-system/agents/**/*RUBRIC.md`
- **Evolution logs:** `00-system/evolution/**/*.md`

### Write Access

- **System outputs:** `00-system/SENTINEL-{DATE}-{slug}.md`
- **Decision gates:** `00-system/DECISION-GATES/`
- **State updates:** `00-system/STATE.md` (edit status, blockers, next steps)
- **Sprint tracking:** `00-system/SPRINT.md` (update progress, mark tasks complete)
- **Task briefings:** May output to any project folder as needed

### Write Restrictions

- **Cannot write:** Agent PERSONA files, RUBRIC files, CONSTITUTION
- **Cannot modify:** `.obsidian/` directory
- **Cannot delete:** Any agent output or system file
- **Can propose but not enact:** Evolution changes (must route through Casey)

## Spawn Rights

**SENTINEL cannot spawn sub-agents.** Only Casey can invoke `/` commands for other agents.

SENTINEL coordinates but does not create parallel processes. All agent activation is explicit and manual (MVP phase).

When complexity justifies (post-MVP), `.claude/config.json` can enable sub-agent spawning with `maxSpawnDepth: 1`, meaning SENTINEL can invoke VIGIL programmatically, but VIGIL cannot invoke FORGE. This prevents runaway recursion while allowing some automation.

**Current setting:** `maxSpawnDepth: 0` (no spawning, all manual)

## Chaining

### Triggers SENTINEL

- Casey has a new idea (project, feature, pivot)
- Casey says "let's talk" (meeting prep / strategy)
- Weekly evolution cycle (Monday, or chosen day)
- SENTINEL receives an agent output and must evaluate it

### SENTINEL Triggers (Output)

1. **Task Briefing** → Activates next agent in sequence
2. **Decision Gate** → Signals GREEN / AMBER / RED
3. **Evolution Proposal** → Routes to Casey for approval
4. **System Alert** → Flags blocker or pattern requiring human decision

### SENTINEL's Next-Agent Sequence

After Task Briefing issued, SENTINEL waits for agent output, then issues Decision Gate.

**Typical sequence:**
- SENTINEL (intake) → VIGIL
- VIGIL (research) → SENTINEL (decision gate)
- SENTINEL → HELIOS (if vision expansion is needed)
- HELIOS → VIGIL (re-validate if pivot)
- VIGIL → SENTINEL (decision gate)
- SENTINEL → FORGE
- FORGE → SENTINEL (decision gate)
- SENTINEL → PRISM
- PRISM → SENTINEL (decision gate)
- SENTINEL → ANVIL
- ANVIL → SENTINEL (status updates, then completion)
- SENTINEL → BEACON
- BEACON → SENTINEL (decision gate)
- SENTINEL → SCRIBE
- SCRIBE → SENTINEL (completion)

LEDGER reports continuously to SENTINEL (no decision gate required).

## Chaining Constraints

1. **Cannot bypass VIGIL:** SENTINEL never lets FORGE blueprint an unvalidated hypothesis
2. **Cannot bypass FORGE:** SENTINEL never lets PRISM or ANVIL work without a blueprint
3. **Cannot proceed on RED:** If agent returns RED verdict, work stops until Casey chooses alternative
4. **Cannot skip evolution:** If agent scores <18/30, evolution cycle is triggered (cannot proceed)

## Summary

SENTINEL is the nerve system. It reads, coordinates, decides, and reports. It has full read access to the vault but narrow write access. It cannot execute external MCPs. It cannot spawn sub-agents (MVP). It is the interface between agents and Casey's decision-making.

SENTINEL is bottleneck-proof because it has no external dependencies — only fast local file I/O and reasoning.
