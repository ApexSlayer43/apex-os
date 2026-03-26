---
type: system-doc
status: active
created: 2026-03-26
created-by: Casey
warning: This protocol is mandatory. No brief, no build. No exceptions.
---

# PRECISION BRIEF PROTOCOL

Before any task gets executed, the following five elements must be present. If any are missing, **stop and ask for them**.

## ① OBJECTIVE — What does done look like exactly?

Not a direction. A destination. Specific, measurable, unambiguous. If you can't tell when it's finished, the objective isn't precise enough.

- **Weak:** "Build the compliance scoring feature"
- **Precise:** "Score a trader's uploaded CSV against FTMO's daily drawdown rule and return pass/fail with the specific violation flagged"

## ② CONSTRAINTS — What can it NOT do?

Hard limits. Non-negotiables. This is the most skipped element and causes the most bugs. Every assumption Claude fills in on its own is a potential mistake. Constraints eliminate the gap.

> Example: "Must not modify the sessions table. Must not return tier names. Severity values are LOW/MED/HIGH/CRITICAL only. No new files unless absolutely necessary."

## ③ CONTEXT — What already exists?

What's built, what's deployed, what's in the schema, what was decided last session. Without this Claude rebuilds what already exists or conflicts with live infrastructure.

> Example: "Compute engine lives at /backend/src/compute.ts. Schema Contract is in the vault. Sessions table already has X columns. Don't duplicate — extend."

## ④ DELIVERABLE — Exact output format

What are you handing back and in what form. A function, a file, a report, a schema change, a list. Specific. Scoped. No ambiguity.

> Example: "One TypeScript function added to compute.ts. One unit test. No new files. Comment every non-obvious line."

## ⑤ DECISION BOUNDARY — What requires my approval?

Where does the agent execute autonomously and where does it stop and check in. This is your command authority. Define it upfront.

> Example: "If any schema change is required, stop and surface it before proceeding. If the rule logic is ambiguous, flag it — don't interpret."

## Full Brief Example

> Objective: Score uploaded CSV against FTMO daily drawdown rule, return pass/fail with violation detail. Constraints: don't touch sessions table, severity enum LOW/MED/HIGH/CRITICAL only, no new files. Context: compute engine at /backend/src/compute.ts, Schema Contract in vault, FTMO ruleset not yet structured — that's part of this task. Deliverable: TypeScript function in compute.ts plus one test. Decision boundary: stop and flag if schema change needed or if FTMO rule has ambiguous interpretation.

## The Rule

**No brief, no build.** Five elements present, we execute. One element missing, we stop and fill it in first. Every time. No exceptions.
