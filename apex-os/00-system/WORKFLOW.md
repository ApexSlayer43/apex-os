---
type: system-doc
status: active
version: 1.0.0
last-updated: 2026-03-22
---

# APEX OS — Battle Drill Workflow

This document explains HOW the battle drill executes on a day-to-day basis. It is the operational manual for running agents through the MVP sequence.

## The Battle Drill Sequence (Recap)

```
SENTINEL (intake + strategy)
    ↓
VIGIL (validate)
    ↓
HELIOS (expand vision — optional)
    ↓
VIGIL (re-validate if HELIOS pivoted)
    ↓
FORGE (blueprint)
    ↓
PRISM (design)
    ↓
ANVIL (build + deploy)
    ↓
BEACON (market)
    ↓
SCRIBE (content)

LEDGER (continuous — parallel track)
```

## Activation via Slash Commands

Agents activate via `/` commands in Claude Code or Claude Desktop.

### Starting a Battle Drill

When you have a new idea:

1. Open Claude Code or Claude Desktop
2. Type: `/sentinel`
3. Claude loads SENTINEL's PERSONA and awaits instructions
4. Provide the idea in one sentence: "Build a tool that cryptographically seals construction photos so contractors can't fake progress reports"
5. SENTINEL issues a **Task Briefing** with context and decision it unlocks

The briefing format:

```
TASK BRIEFING — {Project Name}

MISSION: {One sentence describing the task}

CONTEXT:
{2-3 sentences explaining why this matters, what validated this direction}

DELIVERABLE:
{What VIGIL needs to produce: research report, scoring matrix, etc.}

DECISION IT UNLOCKS:
{What Casey decides after this output: GO/PIVOT/NO-GO, or resource allocation}
```

Example:
```
TASK BRIEFING — Sealed Photos MVP

MISSION: Validate whether construction contractors will pay for cryptographic evidence sealing on photo uploads.

CONTEXT:
Energy Service Companies (ESCOs) cite $3.1B in annual dispute costs due to contractor over-billing on ESPC contracts. The load-bearing assumption: contractors fear dispute audits will catch fake progress evidence. Sealed photos with immutable timestamps would prove authenticity and reduce disputes.

DELIVERABLE:
VIGIL Research Report (0-30 scoring) on:
  - ESPC market size and pain intensity
  - 3-5 competitor landscape (photo verification tools, blockchain solutions)
  - Contractor willingness to pay (pricing discovery via calls/surveys)
  - Regulatory environment (do DOD/DOE require certain standards?)
  - GO / PIVOT / NO-GO verdict with confidence

DECISION IT UNLOCKS:
After VIGIL: GREEN = proceed to HELIOS. RED = abandon or pivot.
```

## Agent Handoffs

Each agent returns output to SENTINEL, who evaluates and decides the next step.

### Return Format (All Agents)

Every agent returns output in this format:

```yaml
---
type: agent-output
agent: {AGENT_NAME}
project: {PROJECT_SLUG}
status: complete
date: {YYYY-MM-DD}
summary: "{One-line summary}"
---

# Agent Output Title

[Content here]

## Self-Assessment

**Rubric Score:** {X}/30 (estimated)
**Confidence:** [HIGH / MODERATE / LOW]
**Next Agent Should Know:** [1-2 critical constraints or gaps]
**If Weak Output:** [Honest admission of what went wrong]
```

Example:
```yaml
---
type: agent-output
agent: vigil
project: sealed-photos
status: complete
date: 2026-03-22
summary: "ESPC market validated at 19 ESCOs on DOE IDIQ. GO verdict with MODERATE confidence. Load-bearing assumption: contractor adoption."
---

# VIGIL Research Report — Sealed Photos MVP

## Verdict
**GO** (Moderate Confidence, 24/30)

### Load-Bearing Assumption
Contractors will adopt a tool that adds friction to their workflow ONLY if it visibly reduces audit risk. If perceived as compliance theater, adoption fails.

### Signal Map
[Research content here...]

## Self-Assessment
Confidence: MODERATE (70%)
I validated market size but contractor pricing calls were thin (3 calls vs. 5 target). Recommend HELIOS test feature assumptions before FORGE blueprints full architecture.
```

### SENTINEL Decision Gate

After each agent returns, SENTINEL evaluates using a **Decision Gate**:

```
DECISION GATE — [Agent Name] Output

OUTPUT QUALITY: [Rubric score estimate]

DECISION:
[ ] GREEN — Proceed. Output is strong. Activate next agent.
[ ] AMBER — Adjust. One clarifying question before proceeding.
[ ] RED — Stop. Output invalidates hypothesis. Three alternative directions.

[If GREEN:]
Next Agent: {AGENT_NAME}
Briefing: [Auto-generated from current output]

[If AMBER:]
Question for Casey: "VIGIL scored contractor willingness but didn't test insurance angle. Should we brief HELIOS to expand that before FORGE blueprints?"
[Wait for Casey's direction, then adjust brief]

[If RED:]
The Problem: {What the output revealed}
Alternative 1: {Pivot direction A}
Alternative 2: {Pivot direction B}
Alternative 3: {Pivot direction C}
[Wait for Casey to choose]
```

## State Transitions

The system is always in one of these states:

- **IDLE:** No active project. Awaiting Casey's idea.
- **INTAKE:** SENTINEL is framing the hypothesis. Output: Task Briefing.
- **RESEARCH:** VIGIL is validating. Output: Intelligence Report with verdict.
- **VISION:** HELIOS is expanding possibility space (optional). Output: Frame expansion + questions.
- **RE-VALIDATE:** VIGIL is re-checking HELIOS's pivot. Output: Updated verdict with new confidence.
- **DESIGN:** FORGE is blueprinting. Output: System specification.
- **LAYOUT:** PRISM is designing UI/UX. Output: Design system + wireframes.
- **BUILD:** ANVIL is implementing. Output: Code deployments + status updates.
- **LAUNCH:** BEACON is marketing. Output: Go-to-market plan + landing page copy.
- **PUBLISH:** SCRIBE is producing content. Output: Newsletter, social, video scripts.
- **FINANCE:** LEDGER is tracking continuously. Output: Monthly P&L, anomaly flags (parallel to all states).

State transitions are BLOCKED until the previous agent completes. ANVIL cannot start until FORGE and PRISM are done.

## Error Handling — Weak Output

What happens when an agent returns output below 18/30 (threshold for evolution)?

**Option 1: Sharpen and Retry (Preferred)**
- SENTINEL issues a revised briefing with more specific constraints
- Example: "VIGIL, your competitor analysis was thin. Add 3-5 specific feature comparisons. Retry in 30 minutes."
- Agent revises and resubmits
- Cost: 30 min additional work. Benefit: higher quality downstream.

**Option 2: Proceed with Caveat**
- SENTINEL flags the weakness and proceeds to next agent
- Next agent is explicitly warned: "Previous output was thin on X. You will need to [mitigate / double-check / ask Casey]"
- Cost: Risk that weak upstream output cascades downstream
- Use ONLY when time pressure is critical (not MVP phase)

**Option 3: Escalate**
- SENTINEL returns to Casey: "Output is unusable. We need direction: Do you want me to [retry with revised brief] or [abandon this direction]?"
- Cost: Delays decision
- Benefit: Prevents sunk-cost fallacy
- Use ONLY when root cause is unclear

## Manual Orchestration (MVP Phase)

During MVP (now through month 6), everything is **manual**.

1. Casey has an idea
2. Casey opens Claude: Type `/sentinel`
3. SENTINEL issues briefing
4. Casey types `/vigil` and copies briefing into the session
5. VIGIL produces output
6. Casey copies output back into Obsidian
7. Casey types `/sentinel` and gives output to SENTINEL for gate decision
8. Repeat: `/forge`, `/prism`, `/anvil`, `/beacon`, `/scribe` in sequence

This is NOT inefficient. It's explicit. Casey sees every handoff. Quality is high because there's friction.

### Batch by Mode

For ANVIL's build phase, batch by mode:

**Mode 1: Architecture** (ANVIL session 1)
- Read FORGE blueprint
- Read PRISM design spec
- Plan build sequence
- Create `/00-system/agents/anvil/ANVIL-{DATE}-build-plan.md`

**Mode 2: Data + Auth** (ANVIL session 2, Day 2)
- Database schema
- User auth flow
- Deployment setup
- Code: data model + auth middleware

**Mode 3: Core Feature** (ANVIL session 3, Day 3)
- Tracer bullet: end-to-end skeleton
- Test the core loop
- Deploy to staging
- Status: "Evidence upload → hash → ledger entry works"

**Mode 4: Payment** (ANVIL session 4, Day 4)
- Stripe integration
- Tier selection
- Checkout flow
- Test actual payments

**Mode 5: Polish + Deploy** (ANVIL session 5, Day 5)
- Error pages
- Loading states
- Responsive fixes
- Deploy to production

Each mode is a full Claude session with context of previous modes. This prevents context fragmentation.

## Completion Signaling

Work is complete when the next agent in the sequence has everything they need.

**VIGIL is complete when:**
- Verdict is clear (GO / PIVOT / NO-GO)
- Load-bearing assumption is named
- Evidence is sourced
- FORGE can blueprint from this

**FORGE is complete when:**
- MVP scope is defined (IN / OUT)
- Stack is selected (with trade-offs)
- Data model is drawn
- Architecturally significant decisions are made
- PRISM and ANVIL can execute from this

**PRISM is complete when:**
- Design system is defined (colors, type, spacing, components)
- All screens are wireframed (with states)
- Component specs are written (default, hover, active, disabled, error)
- ANVIL can implement without guessing

**ANVIL is complete when:**
- Product is deployed to production
- All FORGE requirements are met
- All PRISM design specs are implemented
- It is testable by BEACON (working happy path)

**BEACON is complete when:**
- Positioning is clear (Dunford 5-point analysis)
- Landing page copy is written (PAS structure, customer language)
- Launch channel is chosen (and first 10 customer plan exists)
- SCRIBE has positioning context for content

**SCRIBE is complete when:**
- Launch announcement is published
- Weekly content calendar exists
- Brand voice is calibrated
- Content is published to all channels

## QuickAdd Macros (Future Acceleration)

Currently manual. When complexity justifies it (post-MVP), add QuickAdd macros.

Example macro: "New Agent Output"

```
Prompt: "Enter agent name (VIGIL/FORGE/etc) and project:"
Action: Create {AGENT}-{DATE}-{slug}.md with frontmatter template
```

Example macro: "Decision Gate"

```
Prompt: "GREEN / AMBER / RED? Next agent name?"
Action: Create SENTINEL-{DATE}-decision-gate-{project}.md with gate template
```

Do NOT automate the thinking. Automate the paperwork.

## Error Cases & Recovery

### Case 1: Agent Output Quality Degrades Mid-Cycle

Example: PRISM's wireframes don't match FORGE's system boundaries.

**Recovery:**
1. SENTINEL flags: "Output mismatch on API boundaries. PRISM, are you working from FORGE's latest blueprint?"
2. PRISM verifies blueprint (it didn't read the latest version)
3. PRISM revises design
4. ANVIL proceeds with corrected spec

**Prevention:** SENTINEL's briefing always includes link to upstream output.

### Case 2: ANVIL Gets Stuck (2-Hour Rule)

ANVIL is blocked on a technical problem (e.g., Stripe integration complexity).

**Recovery:**
1. ANVIL tries for 2 hours (hard stop)
2. ANVIL reports blocker: "Stripe webhook testing requires third-party service. I've isolated the problem to [specific component]."
3. SENTINEL escalates to Casey: "ANVIL is blocked on Stripe webhooks. Options: (A) accept placeholder for now, (B) debug together, (C) pivot to test mode."
4. Casey chooses. Work resumes.

**Why 2 hours?** Enough time to solve 90% of problems. Beyond that, it's not debugging — it's wall-pounding. Get help.

### Case 3: Pivot During Build

Casey decides mid-ANVIL to change scope (e.g., "Add photo verification to sealed photos").

**Recovery:**
1. ANVIL stops (commit current state)
2. SENTINEL issues new brief to VIGIL (validate photo verification angle)
3. VIGIL returns verdict
4. If GREEN: SENTINEL briefs FORGE with new spec additions
5. FORGE updates blueprint (out-of-scope items → post-MVP list)
6. PRISM updates design (if UI changes)
7. ANVIL resumes from checkpoint
8. Never backfill. New scope starts fresh.

## Continuous Tracks

### LEDGER (Parallel, Always-On)

While other agents work, LEDGER tracks:
- Every infrastructure cost (Supabase, Vercel, etc.)
- Every hour spent per project (estimated from session length)
- Revenue per hour per stream
- Cash runway

LEDGER outputs monthly reports without being asked. Reports are filed and surfaced to SENTINEL only if anomalies detected.

### SENTINEL (Orchestration)

SENTINEL doesn't wait for battle drill sequence. SENTINEL also:
- Monitors agent output quality
- Flags weak outputs for evolution
- Proposes instruction improvements weekly
- Manages STATE.md (keeps system snapshot current)

---

## Daily Checklist for Casey

When running a battle drill:

- [ ] Start with SENTINEL (intake)
- [ ] Read previous agent's output completely
- [ ] Copy output into next agent's session
- [ ] Next agent reads STATE.md and PERSONA before responding
- [ ] Let agent complete (no interruptions mid-thought)
- [ ] Copy agent output back to Obsidian
- [ ] Commit: `git add -A && git commit -m "agent output: {AGENT} {DATE}"`
- [ ] Read SENTINEL's decision gate (GREEN / AMBER / RED)
- [ ] Decide: proceed or adjust brief

## Measuring Progress

Progress is measured in working increments, not time spent.

**VIGIL Progress:** From "hypothesis" to "verdict + evidence"
**FORGE Progress:** From "verdict" to "blueprint + stack choice"
**PRISM Progress:** From "blueprint" to "design system + wireframes"
**ANVIL Progress:** From "wireframes" to "deployed feature"
**BEACON Progress:** From "product" to "first 10 customers"
**SCRIBE Progress:** From "positioning" to "published content"

Each checkpoint is a git commit. Each commit is "I could ship this today if I had to."

---

This workflow is simple enough for one person, explicit enough for high quality, and documented enough to improve over time.

Run the battle drill. Ship. Measure. Improve.
