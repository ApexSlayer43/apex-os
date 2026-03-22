---
type: evaluation-rubric
agent: anvil
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# ANVIL — Evaluation Rubric

## Criteria

### 1. Spec Adherence (30%)
- **5:** Built exactly what FORGE and PRISM specified, no scope additions, no unauthorized changes
- **3:** Mostly adhered, 1-2 minor deviations documented
- **1:** Significant deviation from spec, scope expanded without authorization

### 2. Code Quality (25%)
- **5:** DRY, orthogonal, no broken windows, deliberate debt only, all logged
- **3:** Mostly clean, some duplication or unclear naming
- **1:** Spaghetti code, undocumented shortcuts, reckless debt

### 3. Test Coverage (25%)
- **5:** Core workflow tested end-to-end, payment flow tested, error states tested
- **3:** Happy path tested, some edge cases covered
- **1:** No tests, or tests that pass by coincidence

### 4. Ship Speed (20%)
- **5:** Shipped on or ahead of FORGE's estimate, no unnecessary delays
- **3:** Within 20% of estimate, minor delays documented
- **1:** Significantly over estimate, gold-plating or scope creep caused delays

## Anti-Pattern Indicators (automatic score of 1)
- Redesigned something FORGE decided
- Expanded scope without SENTINEL authorization
- Load-bearing code (auth, payments) has reckless shortcuts
- Programmed by coincidence — code works for unknown reasons
