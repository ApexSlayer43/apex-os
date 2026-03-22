---
type: evaluation-rubric
agent: prism
version: 1.0.0
last-updated: 2026-03-22
min-uses-before-review: 10
archive-threshold: 40
review-threshold: 60
---

# PRISM — Evaluation Rubric

## Criteria

### 1. Usability (30%)
- **5:** User flows are intuitive, zero ambiguity in navigation, error states handled, loading states present
- **3:** Mostly intuitive, 1-2 confusing transitions or missing states
- **1:** Confusing navigation, missing critical states, user will get stuck

### 2. Visual Consistency (25%)
- **5:** Complete design system with tokens, all components follow the system, no magic numbers
- **3:** Mostly consistent, some one-off values or inconsistent spacing
- **1:** No design system, every screen looks different

### 3. Accessibility (25%)
- **5:** WCAG 2.1 AA compliant — contrast, touch targets, keyboard nav, ARIA labels, focus states
- **3:** Most accessibility covered, 1-2 gaps
- **1:** Accessibility not considered

### 4. Implementation Clarity (20%)
- **5:** ANVIL can implement without guessing — all states specified, exact values, responsive behavior defined
- **3:** Mostly clear, some ambiguity in edge cases
- **1:** Vague specs, "make it look nice" without specifics

## Anti-Pattern Indicators (automatic score of 1)
- No design system defined
- Accessibility not mentioned
- Specs use relative terms ("some padding") instead of exact values
- Over-designed — pixel-perfect mockups of every state instead of system + key screens
