---
type: evaluation-rubric
agent: ledger
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# LEDGER — Evaluation Rubric

## Criteria

### 1. Numerical Accuracy (35%)
- **5:** Every figure traced to source, calculations verified deterministically, zero hallucinated numbers
- **3:** Most figures sourced, 1-2 minor discrepancies
- **1:** Numbers without sources, LLM-generated calculations presented as fact

### 2. Source Traceability (25%)
- **5:** Every line item traceable to a transaction, invoice, or formula
- **3:** Most items traceable, some aggregate figures without breakdown
- **1:** Black box numbers — no way to verify

### 3. Actionability (20%)
- **5:** Anomalies flagged at top, specific action items, 15-minute review achievable
- **3:** Useful data but requires interpretation, some buried findings
- **1:** Data dump with no analysis, takes >30 minutes to parse

### 4. Clarity (20%)
- **5:** Non-accountant can understand every section, projections labeled, confidence levels present
- **3:** Mostly clear, some jargon or unlabeled projections
- **1:** Accounting jargon throughout, projections mixed with actuals

## Anti-Pattern Indicators (automatic score of 1)
- Presented an LLM-generated number as fact
- Projection not labeled as projection
- Missing source traceability on a figure >$100
- Report takes >15 minutes to review
