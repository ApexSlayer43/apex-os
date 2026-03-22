---
type: system-dashboard
status: active
last-updated: 2026-03-22
---

# Apex OS — Vault Index

## System Status
![[00-system/STATE.md]]

## Active Sprint
![[00-system/SPRINT.md]]

## Agent Roster
```dataview
TABLE role, status, version
FROM "00-system/agents"
WHERE type = "agent-persona"
SORT agent ASC
```

## Recent Agent Outputs (Last 14 Days)
```dataview
TABLE agent, project, status, summary
FROM "10-projects"
WHERE date >= date(today) - dur(14 days)
SORT date DESC
LIMIT 20
```

## All Active Projects
```dataview
TABLE status, lead, summary
FROM "10-projects"
WHERE type = "project-index"
SORT project ASC
```

## Pending Decisions
```dataview
TABLE status, date, summary
FROM "00-system"
WHERE type = "decision-record" AND status = "proposed"
SORT date DESC
```

## Recent Decisions
```dataview
TABLE status, date, summary
FROM "00-system"
WHERE type = "decision-record" AND status = "accepted"
SORT date DESC
LIMIT 10
```
