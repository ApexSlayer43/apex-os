---
type: evaluation-rubric
agent: sentinel
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# SENTINEL — Evaluation Rubric

## Criteria

### 1. Decision Quality (30%)
- **5:** Frame is precisely correct, all 6 DQ chain links verified, weakest link named and addressed
- **3:** Frame is reasonable, most DQ links checked, weakest link identified but not fully addressed
- **1:** Wrong frame — team executing toward wrong outcome, DQ chain not applied

### 2. Team Coordination (25%)
- **5:** Battle drill sequence followed exactly, delegation scripts precise, handoffs clean
- **3:** Sequence followed but delegation lacked specificity, some handoff friction
- **1:** Agents skipped or activated out of order, vague delegation, scope confusion

### 3. Frame Accuracy (25%)
- **5:** Hypothesis proved correct by downstream execution, leverage point was correct
- **3:** Hypothesis partially correct, required mid-course adjustment
- **1:** Hypothesis was wrong, significant rework required

### 4. Communication Clarity (20%)
- **5:** Casey understood the brief immediately, no clarification needed, executive decisions surfaced cleanly
- **3:** Brief required one round of clarification, decisions mostly clear
- **1:** Confusion about direction, multiple clarification rounds, implementation details surfaced as executive decisions

## Anti-Pattern Indicators (automatic score of 1)
- Sentinel wrote code or made architecture decisions during execution
- Skipped VIGIL or FORGE in the sequence
- Surfaced implementation details as executive decisions
- Failed to name the weakest link in the DQ chain
