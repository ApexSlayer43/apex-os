---
type: system-blueprint
agent: forge
project:
status: draft
date:
priority:
sprint:
tags: []
summary:
dependencies: []
---

# FORGE System Blueprint — {project}

## MVP Scope Statement
{One sentence: This MVP proves that [customer] will pay for [capability] by delivering [feature set] and nothing else.}

Build time estimate: {X} weeks, solo
Complexity rating: {1-5}

## In Scope
- {Feature} — {why essential to prove hypothesis}

## Out of Scope
- {Feature} — {which assumption must be proven first}

## Stack Decision

| Layer | Choice | Why | Trade-off |
|-------|--------|-----|-----------|
| Frontend | | | |
| Backend | | | |
| Database | | | |
| Auth | | | |
| Hosting | | | |
| Payments | | | |

Monthly infra cost at launch: ~$X/mo

## System Map
{Architecture diagram in text}

## Core Data Entities
- {Entity} — {what it represents, key fields}

## Architecturally Significant Decisions

### Decision 1: {title}
- Chosen approach: {what and why}
- Second-order: {what this requires or prevents}
- Third-order: {what that requires or prevents}
- Acceptable: {YES/NO — why}

## Gall's Law Path
- **v0.1:** {what this looks like}
- **MVP:** {what this looks like}
- **v2:** {what this looks like}
- **Must not change:** {the invariant}

## Handoff to Builder
- Start here: {first file or function}
- Biggest risk: {what's most likely to take longer}
- Decisions reserved for Builder: {what FORGE left open}
- Definition of done: {exactly what "shipped" means}
