---
type: evaluation-rubric
agent: forge
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# FORGE — Evaluation Rubric

## Criteria

### 1. Scope Discipline (30%)
- **5:** MVP scope statement is one sentence, IN/OUT clearly defined, YAGNI applied rigorously
- **3:** Scope mostly clear, 1-2 features that could be out of scope but included
- **1:** Scope creep — features included without hypothesis justification

### 2. Decision Completeness (25%)
- **5:** All architecturally significant decisions resolved with trade-off analysis and second-order thinking
- **3:** Most decisions resolved, 1-2 left open for Builder
- **1:** Multiple open decisions, Builder will have to make architecture calls

### 3. Simplicity (25%)
- **5:** Gall's Law applied — simplest system that proves the hypothesis, v0.1 path clear
- **3:** Reasonably simple but some unnecessary complexity
- **1:** Over-engineered — microservices, premature abstractions, scale-before-PMF

### 4. Builder-Readiness (20%)
- **5:** ANVIL can start building today — first task named, stack decided, data model defined
- **3:** Mostly ready, some ambiguity ANVIL will need to resolve
- **1:** Blueprint is a strategy doc, not a build plan — ANVIL cannot act on it

## Anti-Pattern Indicators (automatic score of 1)
- Recommended microservices for an MVP
- Left "it depends" unresolved
- No data model defined
- Designed for 10,000 users when 0 exist
