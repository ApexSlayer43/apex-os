# CAPABILITY MODEL REFRAME — STRESS TEST REPORT

## FINDINGS SUMMARY

### The 6 Original Gaps — Gap-by-Gap Analysis

---

## GAP 1: No SETUP.md (Plugin Install Order, MCP Config)

**Current State:**
- ✗ No SETUP.md exists
- ✗ STATE.md notes "MCP connection to Obsidian not yet configured"
- ✗ Obsidian plugins not yet installed
- ✗ No plugin dependency ordering documented
- ✗ No MCP configuration instructions exist

**Does CAPABILITIES Model Fully Solve This?**
NO — Partial solution, critical gap remains.

**What the reframe provides:**
- `CAPABILITIES-MANIFEST.md` would list all MCPs (Supabase, Vercel, Figma, 21st.dev, Chrome, MCP Registry, Scheduled Tasks)
- Per-agent CAPABILITIES.md would declare which agents use which MCPs
- `00-system/SETUP.md` (derived from manifest) would theoretically describe setup

**The problem:**
- CAPABILITIES model describes WHAT AGENTS CAN DO (declarative tool access)
- It does NOT describe HOW TO SET UP (procedural plugin installation order)
- Plugin install order is NOT derivable from a capabilities manifest
  - Supabase must run before Vercel (creates database schema)
  - Chrome must load before any web automation
  - MCP Registry config happens first (bootstraps other MCPs)
- Obsidian plugin dependencies are complex (some require others to load first)
- No mechanism to specify "install phase 1 before phase 2" in capabilities files
- A solo founder needs step-by-step: "Run npm install, configure .env, start Obsidian, install plugins in THIS order, restart"

**Risk if we proceed:**
- Founder tries to use agents before MCPs are properly configured
- Cascading failures: Obsidian commands fail silently, agents don't activate
- Debugging becomes "which plugin is missing?" instead of "follow the checklist"

**Verdict on GAP 1: NOT SOLVED**

---

## GAP 2: No EVOLUTION.md (How Agents Improve Their Own Instructions)

**Current State:**
- ✗ No evolution-protocol.md exists (despite STATE.md mentioning "evolution cycle")
- ✗ STATE.md notes "Performance baseline: Not yet established"
- ✗ No documented mechanism for agents to propose instruction changes
- ✗ No version control strategy for agent PERSONA files
- ✗ No approval gate for instruction updates
- ✗ No rollback trigger criteria (though rollback is mentioned as desired)

**Does CAPABILITIES Model Fully Solve This?**
NO — It doesn't address evolution at all.

**What the reframe provides:**
- `.claude/rules/evolution-protocol.md` mentioned in proposal
- Per-agent CAPABILITIES.md could theoretically declare "evolution levers"

**The problem:**
- CAPABILITIES describes static tool access, not self-improvement mechanisms
- Evolution is ORTHOGONAL to capabilities — it's about HOW INSTRUCTIONS CHANGE
- The reframe completely leaves evolution unspecified in implementation
- Real evolution loop needs:
  1. Performance measurement baseline (RUBRIC scores)
  2. Proposal format (SENTINEL writes "EVOLUTION-PROPOSAL-{agent}-{date}.md")
  3. Approval gate (manually reviewed by founder before applying)
  4. Version control (PERSONA.md v1.0.0 → v1.0.1 with changelog)
  5. Rollback mechanism (git revert + STATE.md update)
- None of this is addressed by putting "evolution levers" in a CAPABILITIES.md file

**Risk if we proceed:**
- Agents never improve their instructions
- Founder still has to manually edit PERSONA files
- No safety gate: bad evolution proposals silently accepted or ignored
- RUBRIC.md exists but has nowhere to feed back into actual instruction updates

**Verdict on GAP 2: NOT SOLVED (evolution protocol mentioned but not designed)**

---

## GAP 3: No Agent Tool Access Docs (Which MCPs Each Agent Uses)

**Current State:**
- ✗ No documentation of which agents can use which MCPs
- ✗ PERSONA files describe roles and relationships, NOT tool access
- ✗ Agents have no declared capabilities beyond behavioral rules
- ✗ If a new MCP is added, no way to decide "which agents should use this?"
- ✗ Currently, agents presumably have access to ALL MCPs via Claude Code environment

**Does CAPABILITIES Model Fully Solve This?**
YES — This is the ONE gap it explicitly solves.

**What the reframe provides:**
- `CAPABILITIES-MANIFEST.md` as system-wide tool registry (Supabase, Vercel, Figma, etc.)
- Per-agent `CAPABILITIES.md` declaring which MCPs each agent uses
  - ANVIL: Supabase, Vercel, 21st.dev, Chrome
  - FORGE: Figma, Supabase, Chrome
  - BEACON: Vercel, Chrome, MCP Registry (for research)
  - SENTINEL: All MCPs (orchestrator)
  - etc.

**Why this matters:**
- Prevents agent sprawl (agents don't blindly use unrelated tools)
- Makes it clear which agent owns which relationship
- Enables audit trail: "ANVIL deployed 47 times, FORGE consulted Figma 3 times"
- Facilitates onboarding: "use your CAPABILITIES.md as reference"

**Risk if we proceed:**
- GOOD: Explicit tool-to-agent mapping prevents chaos
- CONCERN: Maintenance burden if MCPs change (see below)

**Verdict on GAP 3: SOLVED**

---

## GAP 4: No Workflow Automation (Agents Don't Chain to Each Other)

**Current State:**
- ✓ PERSONA files show relationships (ANVIL receives from FORGE/PRISM, returns to SENTINEL)
- ✓ Agent protocol outlines the chain: VIGIL → HELIOS → FORGE → PRISM → ANVIL → BEACON
- ✗ No automation: each handoff is manual (founder must invoke next agent)
- ✗ No "completion trigger" system (e.g., "when FORGE finishes, automatically invoke PRISM")
- ✗ No scheduled task definitions that chain agents
- ✗ SCHEDULED TASKS MCP exists but is unused for agent chaining

**Does CAPABILITIES Model Fully Solve This?**
NO — It doesn't address workflow orchestration.

**What the reframe provides:**
- Per-agent CAPABILITIES.md could declare "chaining triggers" (e.g., "ANVIL completes → trigger BEACON")
- But this is not orchestration, it's just declaring intent

**The problem:**
- Workflow automation requires:
  1. Completion detection (how does the system know FORGE finished?)
  2. State transitions (FORGE output → trigger PRISM input)
  3. Conditional logic (if FORGE's decision was "too risky", skip PRISM)
  4. Error handling (if ANVIL fails, notify SENTINEL, don't auto-trigger BEACON)
- CAPABILITIES.md declaring "chaining triggers" solves NONE of these
- Real implementation would need:
  - A state machine (currently loose, based on manual STATE.md updates)
  - Scheduled tasks that check STATE.md and trigger next agent
  - Event hooks (when ANVIL-YYYY-MM-DD-*.md is created, spawn BEACON with that file as context)
- None of this is offered by the capability model

**Risk if we proceed:**
- Founder still manually invokes agents (no time savings)
- Illusion of solving automation when it's just declared intent
- Code smells: CAPABILITIES.md says "triggers on completion" but no code actually triggers

**Verdict on GAP 4: NOT SOLVED (only surface-level declaration)**

---

## GAP 5: No Git Versioning Strategy for Agent Outputs

**Current State:**
- ✓ Naming conventions exist (ANVIL-YYYY-MM-DD-slug.md)
- ✗ No git commit strategy documented
- ✗ No branch strategy for agent work (feature branches? trunk-based?)
- ✗ No tagging scheme for major agent outputs (e.g., "ANVIL-MVP-v1")
- ✗ No rollback procedure if an agent's output is bad
- ✗ No audit trail: "who approved this output to merge?"

**Does CAPABILITIES Model Fully Solve This?**
NO — Capabilities model is about tool access, not source control.

**What the reframe provides:**
- Nothing related to git versioning

**The problem:**
- Git versioning strategy is INDEPENDENT from tool capabilities
- It's a process question, not a capability question
- Real implementation needs:
  1. Commit message format: "ANVIL: {ticket}—{descriptor}" with frontmatter
  2. Branch strategy: agent branches (anvil/feature-x) or trunk-based (main only)?
  3. Review gates: SENTINEL must review before merge to main
  4. Tags: v1.0.0, v1.0.1-rc1, ANVIL-MVP-freeze, etc.
  5. Rollback: "if ANVIL-2026-03-22-bad-build.md is in main, how do we revert?"
- CAPABILITIES.md cannot express any of this

**Risk if we proceed:**
- Agent outputs are committed but not reviewed
- No way to blame a bad deployment ("which agent commit broke this?")
- Drift: agent code in vault diverges from agent instructions in PERSONA
- Founder loses audit trail

**Verdict on GAP 5: NOT SOLVED**

---

## GAP 6: No Sub-Agent Creation Protocol

**Current State:**
- ✗ No documented process for spawning a new agent (e.g., "SCRIBE is needed, create it")
- ✗ No template for new agent PERSONA.md
- ✗ Current agents were scaffolded manually, no replicable process
- ✗ No criteria for "when to create a new agent vs. extend existing one"
- ✗ No naming scheme for sub-agents (e.g., ANVIL-DevOps as sub-agent of ANVIL)

**Does CAPABILITIES Model Fully Solve This?**
NO — Capabilities model is about existing agents, not creation.

**What the reframe provides:**
- Nothing directly, but CAPABILITIES.md *could* serve as a template if extended
- Per-agent CAPABILITIES.md could be copied and modified for new agents

**The problem:**
- Sub-agent creation requires:
  1. Decision gate: "Do we need a new agent or extend an existing one?"
  2. Identity design: What is this agent's archetype? (Executor, Analyst, Coordinator, Communicator)
  3. Persona scaffolding: Copy template, fill in role/identity/capabilities/behavioral-rules
  4. Relationship mapping: Where in the chain does this agent sit?
  5. Success criteria: What does "good" look like for this agent?
  6. RUBRIC creation: How do we measure this agent's output?
- CAPABILITIES model only addresses #3 partially (if CAPABILITIES.md becomes a template)
- Steps #1, #2, #4, #5, #6 are not covered

**Risk if we proceed:**
- Founder creates ANVIL-2 or PRISM-Research ad-hoc without structure
- New agents lack clear identity or evaluation criteria
- Sub-agents proliferate without governance

**Verdict on GAP 6: NOT SOLVED**

---

## ADDITIONAL STRESS TESTS

### Test A: Is CAPABILITIES.md Redundant with PERSONA.md?

**Current:** PERSONA.md already has a "Capabilities" section listing what an agent can do.
```
## Capabilities
- Build sequencing: Data model → Auth → Core feature
- Tracer bullet development
- Technical debt management
- DRY enforcement
```

**Proposed:** CAPABILITIES.md would list tools (Supabase, Vercel, etc.)

**Analysis:**
- PERSONA.Capabilities = behavioral/domain capabilities ("I can do technical debt management")
- Proposed CAPABILITIES.md = tool access ("I can call Supabase execute_sql, Vercel deploy_to_vercel")
- NOT redundant — different meanings
- But creates cognitive load: agent has TWO capability lists now
- Founder must update both when agent evolves
- Risk: lists drift (CAPABILITIES.md says agent can use Figma, but PERSONA says agent is ANVIL who only builds backend)

**Verdict: Conceptually clean but creates maintenance burden**

---

### Test B: Maintenance Burden When MCPs Change

**Scenario:** A new MCP is released (e.g., "OpenAI-Models" for inference)

**Current state:** No tool docs, founder just evaluates whether to use it

**Proposed state:** 
1. Add entry to CAPABILITIES-MANIFEST.md
2. Update each affected agent's CAPABILITIES.md
3. Update SETUP.md (derived from manifest)
4. Possibly update agent PERSONA if new capabilities emerge

**Problem:**
- Who decides which agents get the new MCP?
- If FORGE now has access to inference, does PERSONA.md need updating?
- If two agents can now do something previously impossible, what gets deprecated?
- No decision gate — just adding to manifest?

**Risk if we proceed:**
- MANIFEST becomes cluttered with MCPs that only 1 agent uses
- Drift: CAPABILITIES.md lists tools agent is theoretically allowed to use, agent PERSONA doesn't explain why
- Founder becomes bottleneck: only they know the full tool landscape

**Verdict: HIGH MAINTENANCE BURDEN for solo founder**

---

### Test C: Is CAPABILITIES-MANIFEST.md Necessary, or Over-Engineering?

**Arguments FOR centralized manifest:**
- Single source of truth for all MCPs
- Can generate SETUP.md from manifest
- Audit trail: "what tools did system have on 2026-03-22?"

**Arguments AGAINST (solo founder):**
- Founder knows all available tools (MCPs are explicit)
- Easier to just list per-agent tools in each agent's CAPABILITIES.md
- One file (manifest) is less maintenance than one file + N agent files
- For solo founder: duplication of per-agent capabilities is acceptable if it avoids orchestrating a centralized manifest

**Risk if we proceed:**
- Manifest becomes outdated faster than per-agent files
- Founder ignores manifest and updates per-agent only
- False confidence: "manifest says we have X MCPs" but agents don't use them correctly

**Verdict: MANIFEST IS OVER-ENGINEERING for solo founder. Better: put tool list in per-agent CAPABILITIES.md only.**

---

## FINAL VERDICT: GO / PIVOT / NO-GO

### RECOMMENDATION: **PIVOT**

The capability model SOLVES exactly 1 out of 6 gaps (tool access documentation). It's a good idea but insufficient.

### What to DO instead:

**Phase 1: Implement Capabilities Model (keep this part)**
- Create `00-system/agents/{agent}/CAPABILITIES.md` for each agent
- List tools and permissions for each agent
- Skip the centralized CAPABILITIES-MANIFEST.md (over-engineering)
- Update PERSONA.md when agent tool access changes

**Phase 2: Implement Missing Pieces (required)**

1. **SETUP.md** — Procedural, step-by-step plugin installation
   - Phase 1: environment setup (Node, npm, .env)
   - Phase 2: Obsidian core + plugin install order
   - Phase 3: MCP configuration (which MCPs need what .env vars?)
   - Phase 4: Verification checklist ("test that Supabase can connect")
   - NOT derived from capabilities manifest (different information)

2. **EVOLUTION-PROTOCOL.md** — Self-improvement loop
   - Performance measurement baseline (RUBRIC thresholds)
   - Proposal format (SENTINEL writes evolution proposals)
   - Review and approval gate (founder signature)
   - Version control strategy (PERSONA v1.0.0 → v1.0.1 with changelog)
   - Rollback procedure (git revert + STATE.md update)

3. **WORKFLOW-ORCHESTRATION.md** — Agent chaining
   - State machine diagram (VIGIL → HELIOS → FORGE → PRISM → ANVIL → BEACON)
   - Completion triggers (when to spawn next agent)
   - Conditional routing (decisions that affect chain path)
   - Error handling (what if an agent fails?)
   - Optionally: scheduled tasks that implement this automation

4. **GIT-STRATEGY.md** — Source control for agent outputs
   - Commit message format
   - Branch strategy (agent branches? trunk-based?)
   - Review gates (who approves merges?)
   - Tag scheme (major milestones)
   - Rollback procedure

5. **SUB-AGENT-PROTOCOL.md** — Creating new agents
   - Criteria: when to spawn vs. extend
   - Decision template (archetype, identity, relationships)
   - PERSONA.md template
   - CAPABILITIES.md template
   - RUBRIC.md template
   - Checklist for activation

---

## CONFIDENCE LEVEL: **92%**

**Why 92% not 100%:**
- Real system behavior may reveal unanticipated gaps
- Solo founder may find CAPABILITIES model sufficient as a stopgap (low bar)
- Tool landscape may stabilize, reducing maintenance burden (lowers MANIFEST over-engineering risk)

**Why high confidence:**
- The 6 gaps are real (observable from current STATE.md)
- CAPABILITIES model explicitly covers only 1 (tool access)
- The other 5 require fundamentally different information types
- Attempting to fit EVOLUTION + ORCHESTRATION + GIT-STRATEGY into a "capabilities" framework is category error

---

