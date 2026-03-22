---
type: system-rules
status: active
version: 1.0.0
last-updated: 2026-03-22
---

# Evolution Protocol — Self-Improvement Loop

The evolution protocol is how Apex OS improves itself incrementally without losing coherence. It is the reflexion cycle: execute → evaluate → reflect → propose improvements → human gate → version increment → git track.

This protocol applies to agent instruction files (PERSONA.md files) and behavioral rules (.claude/rules/ files). NO other changes require this process.

## The Reflexion Cycle

```
Phase 1: Execute
  Agent completes task
  Output includes self-assessment (honest, not optimistic)

Phase 2: Evaluate
  SENTINEL reviews output against rubric
  Identifies gaps: execution, framing, decision quality

Phase 3: Reflect
  Agent writes 300-word reflection on:
    - What I did well
    - What I misunderstood
    - What the next agent downstream told me I got wrong
    - What I would do differently

Phase 4: Propose
  Agent proposes 1-2 specific instruction changes
  Includes rollback plan (what should be reverted if this breaks)
  Labeled: "PROPOSE: [specific change]"

Phase 5: Human Gate
  Casey reviews reflection + proposal
  Three options:
    - APPROVE: Change takes effect immediately
    - REQUEST REVISION: Send back with clarifying question
    - REJECT: Explain why, proposal archived

Phase 6: Version Increment
  If approved: Update PERSONA.md version field
  Example: 1.0.0 → 1.0.1 (small improvement)
  Example: 1.0.0 → 1.1.0 (significant behavioral shift)

Phase 7: Git Track
  Commit change with message: "agent-evolution: {AGENT} v{NEW_VERSION} — {brief reason}"
  Keep full reflection as commit message body (for history)
  Example: git commit -m "agent-evolution: VIGIL v1.0.1 — sharpen confidence scoring"
```

## When Evolution Is Triggered

Evolution happens in three cases:

1. **Weekly Cycle:** Every Monday (or chosen weekly day), SENTINEL initiates evaluation of all agents who worked that week
2. **After Weak Output:** SENTINEL detects output below rubric threshold, flags it, requests reflection
3. **After Decision Cascade:** When downstream agents (e.g., ANVIL, BEACON) surface problems caused by upstream agent's output, trigger evolution on the upstream agent

## Evaluation Rubrics

Each agent has a `RUBRIC.md` file in `00-system/agents/{agent}/RUBRIC.md`. Rubrics are scored 0-30 across 6 factors.

### Standard Rubric Format

```yaml
---
type: agent-rubric
agent: {AGENT_NAME}
version: 1.0.0
last-updated: 2026-03-22
---

# {AGENT_NAME} Evaluation Rubric (0-30 scale)

## Factor 1: Output Completeness (0-5 points)
- 5: All required deliverables present, formatted correctly, frontmatter correct
- 3: Deliverables present but formatting inconsistent or missing elements
- 1: Incomplete output, missing key sections
- 0: No output or completely unusable

## Factor 2: Evidence Quality (0-5 points)
**For research agents (VIGIL, HELIOS):**
- 5: All claims cited, sources traced, confidence levels assigned
- 3: Most claims cited, some sources missing, confidence present
- 1: Few citations, confidence vague or missing
- 0: No sources, no evidence chain

**For builder agents (FORGE, ANVIL):**
- 5: Decisions have clear trade-off analysis, constraints identified
- 3: Trade-offs mentioned but not fully explored
- 1: Decisions stated without justification
- 0: No rationale provided

## Factor 3: Decisiveness (0-5 points)
- 5: Clear recommendation or blueprint. No ambiguity. Moves work forward.
- 3: Recommendation present but hedged or with open questions
- 1: Neutral framing, decision left to downstream agent
- 0: No clear direction

## Factor 4: Scope Discipline (0-5 points)
- 5: Output stays in bounds, respects IN/OUT scope, no scope creep
- 3: Mostly scoped correctly with 1-2 minor boundary issues
- 1: Mixes concerns or exceeds mandate
- 0: Completely out of scope

## Factor 5: Communication (0-5 points)
**Written clarity, brevity, audience-fit:**
- 5: Precise language, no filler, reads like instructions not essays
- 3: Clear but verbose, could be tighter
- 1: Unclear or buried conclusions
- 0: Unreadable

## Factor 6: Downstream Utility (0-5 points)
**Does the next agent have what they need to act?**
- 5: Next agent can execute immediately without clarification
- 3: Next agent needs one clarifying conversation
- 1: Next agent needs significant back-and-forth
- 0: Output unusable by downstream agent

---

## Scoring Thresholds

- **24-30:** EXCELLENT. Archive output as reference. No evolution needed.
- **18-23:** GOOD. Output is usable. Monitor for patterns in next cycle.
- **12-17:** ACCEPTABLE but below target. Request reflection, propose improvement.
- **6-11:** WEAK. Do not use. Request full redo or evolution.
- **0-5:** UNUSABLE. Return to agent with feedback and revised brief.

Threshold for evolution trigger: **Below 18 points**
```

### Creating Agent-Specific Rubrics

Use the template above and customize Factor 2 and 6 for the agent's role:

**VIGIL (Intelligence):**
- Factor 2: Evidence must include competitor data, pricing, behavioral signals
- Factor 6: FORGE must have validated hypothesis to blueprint

**FORGE (Architecture):**
- Factor 2: Trade-offs must include second/third-order consequences
- Factor 6: PRISM and ANVIL must have unambiguous specifications

**ANVIL (Building):**
- Factor 2: Code must pass linting, tests, and deploy checks
- Factor 6: Product must be testable, deployable, and handed to BEACON

Detailed rubrics for each agent are in `00-system/agents/{agent}/RUBRIC.md`.

## Reflection Template

After output evaluation, if score is <18, agent writes reflection in `00-system/evolution/{AGENT}-{YYYY-MM-DD}-reflection.md`:

```yaml
---
type: agent-reflection
agent: {AGENT_NAME}
cycle: S-{YYYY}-Q{Q}-{N}
date: {YYYY-MM-DD}
output_file: "{FILE_THAT_TRIGGERED_REFLECTION}"
rubric_score: {X}/30
---

# Reflection: {AGENT_NAME} on {output_file_slug}

## What I Did Well

[2-3 things that worked in this output]

Example: "I correctly identified the load-bearing assumption about contractor willingness to pay."

## What I Misunderstood

[1-2 things I got wrong]

Example: "I assumed FORGE would blueprint insurance integrations, but that wasn't in scope. I wasted research time on something irrelevant."

## Feedback from Downstream

[What the next agent told me I missed or got wrong]

Example: "FORGE returned a note saying my unit economics were speculative. I should have sourced pricing from actual customer interviews, not industry averages."

## What I Would Do Differently Next Time

[Specific behavioral change]

Example: "In future market research, I will prioritit customer language (quotes) over analyst reports. Quotes are signals, reports are interpolation."

## Proposed Instruction Changes

**PROPOSE:** {Brief description of change}

**Specific Change:** In VIGIL PERSONA.md, replace [specific sentence] with [new sentence]

**Rationale:** [Why this change prevents the mistake]

**Rollback Plan:** If this causes [expected risk], revert by [specific git action]

---

[End reflection]
```

Keep reflections to ~300 words. They are input to SENTINEL's decision, not standalone documents.

## Proposal Format

Proposals go at the end of reflection files, clearly labeled:

```
**PROPOSE:** Sharpen confidence scoring for market size estimates

**Current Language:**
"Label confidence levels as STRONG / MODERATE / WEAK / INSUFFICIENT"

**Proposed Language:**
"Label confidence as:
  - STRONG (>80% of claims from primary sources, competitor validation)
  - MODERATE (50-80% primary sources, some inference)
  - WEAK (mostly inference, <50% primary sources)
  - INSUFFICIENT (no data to estimate)"

**Why This Works:**
Current language is vague. Specific thresholds force me to audit my sources before labeling.

**Rollback Plan:**
If this makes scoring too slow, revert to original language and add a time cap instead (15 min per estimate, not unlimited).
```

## Casey's Approval Workflow

When reflection is ready, Casey reviews using this checklist:

1. Read rubric score. Is it <18? (If not, no evolution needed)
2. Read reflection. Does agent's self-assessment match actual output?
3. Read proposal. Is the change specific? Reversible? Proportional?
4. Make decision:
   - **APPROVE** → Comment in reflection file: "APPROVED — v{NEW_VERSION} takes effect immediately"
   - **REVISE** → Ask one clarifying question, return to agent
   - **REJECT** → Explain why, move on (reflection archived for pattern detection)

Decisions are final. No appeals. Evolution moves forward.

## Version Increment Strategy

Semantic versioning for agent instructions:

- **PATCH (1.0.0 → 1.0.1):** Small behavioral refinement (clarify scoring threshold, tighten language)
- **MINOR (1.0.0 → 1.1.0):** Significant behavioral change (new evaluation approach, new capability)
- **MAJOR (1.0.0 → 2.0.0):** Role or purpose change (reserved for major strategy pivots)

Typically you will see PATCH updates in weekly cycles.

## Git Commit Tracking

Every approved evolution gets a git commit:

```bash
git add 00-system/agents/{AGENT}/PERSONA.md
git add 00-system/evolution/{AGENT}-{DATE}-reflection.md
git commit -m "agent-evolution: {AGENT} v{OLD} → v{NEW} — {reason}

{Full reflection text for commit message body}"
```

Example commit:
```
agent-evolution: VIGIL v1.0.0 → v1.0.1 — tighten confidence scoring thresholds

[Reflection text here: what was wrong, why it matters, how change fixes it]
```

This creates a git log that shows agent evolution across time. Use `git log --grep="agent-evolution"` to see all improvements.

## Rollback Procedure

If an evolution change causes problems:

1. SENTINEL flags issue immediately
2. Identify the commit: `git log --grep="agent-evolution" | head -5`
3. Revert: `git revert {COMMIT_HASH}`
4. Write brief post-mortem: why did the change fail?
5. Archive failed proposal for pattern analysis

Rollback is instant. No discussion. Safety > perfectionism.

## Rubric Rotation (Constitution Rule #14)

Same rubric cannot be used for >3 consecutive cycles without human review. This prevents metrics from becoming stale.

Every 3 weeks, SENTINEL reviews rubric:
- Are factors still relevant to the agent's role?
- Has the agent's context changed?
- Should thresholds be adjusted?

Rubric changes require Casey's approval (they affect scoring going forward).

## Pattern Detection

After 4 weeks of evolution data, SENTINEL generates a "Pattern Report" identifying:
- Which agents consistently score highest/lowest
- Which factors are most often flagged
- Which proposals recur (pattern to fix at source, not patch)

Example: If VIGIL always scores low on "Downstream Utility," the pattern is not that VIGIL is bad — the pattern is that SENTINEL's briefs to VIGIL are ambiguous. Fix the brief, not the agent.

## Tools for Evolution

All evolution work happens in `00-system/evolution/` folder:

- `{AGENT}-{DATE}-reflection.md` — Agent's self-assessment
- `{AGENT}-rubric.md` — Evaluation criteria (one per agent)
- `evolution-log.md` — Running tally of all evolution cycles

Evolution log example:
```yaml
---
type: evolution-log
---

# Evolution Cycles

## Cycle: S-2026-Q2-01 (Week 1)

### VIGIL
- Score: 22/30 (GOOD)
- Status: No evolution needed

### FORGE
- Score: 18/30 (BORDERLINE)
- Reflection: 00-system/evolution/FORGE-2026-03-30-reflection.md
- Proposal: Sharpen scope discipline language
- Casey's Decision: APPROVED
- New Version: 1.0.1
- Commit: {HASH}

---

[Continue for each agent and cycle]
```

## Quarterly Retros

Every quarter, SENTINEL runs a "System Retro":
- Which evolutions worked? (Measure by improved scores next cycle)
- Which evolutions failed? (Measure by rollbacks or ongoing low scores)
- Are agents in the right roles? (Should anyone's mandate change?)
- Are the MCPs serving the agents? (Tool gaps?)

Retro output: `S-{YYYY}-Q{Q}-retro.md` sent to Casey with recommendations for Q{next}.

---

This protocol ensures Apex OS learns without losing structure, improves without chaos, and stays small enough for one person to maintain.

Evolution is continuous. The system gets better every week.
