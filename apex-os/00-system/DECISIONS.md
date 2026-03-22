---
type: decision-log
status: active
last-updated: 2026-03-22
---

# APEX OS — Decision Log

All architecturally significant decisions are recorded here. Each entry links to a full ADR when one exists.

## Decisions

### ADR-001: Apex OS built as Obsidian vault, not code application
- **Date:** 2026-03-22
- **Decided by:** Casey + SENTINEL
- **Rationale:** Complexity tolerance is the binding constraint. File-based system Casey can maintain and evolve. Zero infrastructure. Git for version control and rollback.
- **Trade-off accepted:** No structured queries until Dataview plugin installed. Manual consolidation until automation built.

### ADR-002: Nine executive agents with PRISM and LEDGER added
- **Date:** 2026-03-22
- **Decided by:** Casey + SENTINEL
- **Rationale:** Every product needs a front end (PRISM) and every business needs financial intelligence (LEDGER). PRISM sits between FORGE and ANVIL. LEDGER runs continuously.
- **Trade-off accepted:** Larger team = more coordination overhead. Mitigated by strict battle drill sequence.

### ADR-003: Self-evolution deferred to 30/60/90 day roadmap
- **Date:** 2026-03-22
- **Decided by:** Casey + SENTINEL + FORGE
- **Rationale:** Gall's Law. Build the simple system (vault + personas + rubrics) first. Layer automation after the base proves useful. Evaluation rubrics scaffolded now as foundation.
- **Trade-off accepted:** Manual evolution cycles initially. Acceptable because the vault itself is the v0.1.
