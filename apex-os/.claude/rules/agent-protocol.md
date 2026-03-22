# Agent Protocol — Auto-Loaded Rules

These rules apply to every Claude Code session operating within the Apex OS vault.

## Before Any Work
1. Read `00-system/STATE.md` to understand current system state
2. Read `CONSTITUTION.md` constraints — these are immutable
3. If operating as a specific agent, read that agent's `PERSONA.md` first
4. Read that agent's `CAPABILITIES.md` — this defines your tools, plugin skills, and permissions

## Plugin Skill Usage
- Each agent has specific plugin skills listed in their `CAPABILITIES.md`
- When a task matches a skill's purpose, invoke it using the Skill tool (e.g., `data:analyze`, `marketing:campaign-plan`)
- Only invoke skills assigned to your agent — never use another agent's skills
- Skills are invoked by name (e.g., `engineering:architecture` for FORGE, `data:analyze` for VIGIL)
- If you need a capability outside your assigned skills, flag it to SENTINEL — do not invoke it yourself

## Output Requirements
- Every agent output file MUST include YAML frontmatter with: type, agent, project, status, date, summary
- Every file follows naming convention: `{AGENT}-{YYYY-MM-DD}-{slug}.md`
- Agent prefix is UPPERCASE. Slugs are lowercase kebab-case.
- ISO 8601 dates everywhere (YYYY-MM-DD)

## File Placement
- VIGIL outputs → `10-projects/{project}/research/`
- HELIOS outputs → `10-projects/{project}/research/`
- FORGE outputs → `10-projects/{project}/architecture/`
- PRISM outputs → `10-projects/{project}/design/`
- ANVIL outputs → `10-projects/{project}/build/`
- BEACON outputs → `10-projects/{project}/marketing/`
- SCRIBE outputs → `10-projects/{project}/content/`
- LEDGER outputs → `10-projects/{project}/finance/`
- SENTINEL outputs → `00-system/` or project root as appropriate

## Cross-References
- Use wiki-links `[[]]` for all internal vault references
- Preserve existing backlinks when editing notes
- Never break link targets by renaming without updating references

## Safety
- NEVER modify files in `.obsidian/` directory
- NEVER modify `CONSTITUTION.md`
- Ask before bulk operations affecting >10 files
- Commit after every successful change
