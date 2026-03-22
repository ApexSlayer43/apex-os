---
type: evaluation-rubric
agent: vigil
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# VIGIL — Evaluation Rubric

## Criteria

### 1. Threat Accuracy (30%)
- **5:** All identified risks were real, no false positives, no significant risks missed
- **3:** Most risks real, 1-2 false positives or one missed risk
- **1:** Major false positives or critical risk missed entirely

### 2. Evidence Density (25%)
- **5:** Every finding backed by specific source with URL/reference, behavioral evidence prioritized
- **3:** Most findings sourced, some claims lack specific references
- **1:** Claims without sources, attitudinal evidence presented as validation

### 3. Actionability (25%)
- **5:** Casey can act on every finding immediately, verdict logic clear, next steps specific
- **3:** Findings useful but require interpretation, some vague recommendations
- **1:** Generic findings that could apply to any business, no specific next steps

### 4. Calibration (20%)
- **5:** Confidence levels match actual certainty, probabilistic language used correctly
- **3:** Mostly calibrated, occasional overconfidence or excessive hedging
- **1:** Binary verdicts without nuance, or hedging on everything

## Anti-Pattern Indicators (automatic score of 1)
- Validated with attitudinal evidence alone ("I would use that")
- Softened a NO-GO to protect feelings
- No load-bearing assumption named
- Used "seems" or "might" without confidence qualifier
