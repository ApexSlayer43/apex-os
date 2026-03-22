---
type: system-doc
status: active
version: 1.0.0
last-updated: 2026-03-22
---

# APEX OS — Setup & Configuration Guide

## Overview

This guide walks through the complete setup of Apex OS for local development on Windows. The system runs as a coordinated multi-agent AI operating system inside an Obsidian vault, with tight integration between Claude Code and the vault through MCPs (Model Context Protocols).

Three-tier plugin philosophy: Day 1 (essential — install immediately), Week 1 (accelerators — install before first agent work), Week 2+ (nice-to-have — install as needed).

## Prerequisites

- Windows 10 or later
- Obsidian v1.5.0+
- Node.js 18+ (check: `node --version`)
- Git for Windows (installed, available in PowerShell)
- Claude Desktop or Claude Code CLI (for MCP access)

### Windows-Specific Gotchas (REQUIRED READING)

**Mullvad VPN Issue:** If Mullvad VPN is running, npm may fail to reach registry.npmjs.org. Solution: Either disable Mullvad during npm installs, or add explicit registry flag:
```
npm install --registry https://registry.npmjs.org
```

**PowerShell Command Chaining:** PowerShell does NOT support `&&` chaining. Run commands sequentially or use semicolons:
```powershell
# WRONG: git add -A && git commit -m "message"
# RIGHT: git add -A ; git commit -m "message"
```

**Path Spaces:** If your Obsidian vault path contains spaces, MCP tools may fail. Keep vault path clean, e.g., `C:\Users\Casey\Documents\apex-os\` not `C:\Users\Casey\My Documents\apex-os\`.

**IPv6 Issues:** If npm hangs on DNS lookups, set:
```
NODE_OPTIONS="--dns-result-order=ipv4first"
```

**File Input for Obsidian:** Obsidian REST API requires Obsidian to be running. The `obsidian-claude-code-mcp` connects via WebSocket to local instance. Shut down cleanly before switching machines.

---

## Day 1: Essential Setup

### 1. Obsidian Vault Initialization

```bash
git init
git add -A
git commit -m "Initial commit: Apex OS vault structure"
```

Verify `.git/` directory exists in vault root.

### 2. Obsidian Core Settings

1. Open Obsidian → Settings (Ctrl+comma)
2. **Community Plugins:** Toggle ON in "About" section
3. **Create 5 core folders:**
   - `.claude/` — Claude Code integration
   - `00-system/` — OS kernel
   - `10-projects/` — Business projects
   - `20-areas/` — Ongoing responsibilities
   - `30-resources/` — Reference knowledge base
   - `40-archive/` — Completed work
   - `50-journal/` — Daily notes

### 3. Day 1 Plugins (Install in this order)

These are NON-NEGOTIABLE. Install them before any agent work.

#### Plugin 1: Local REST API
- **Purpose:** WebSocket bridge for Claude Code integration
- **Install:** Community Plugins → Search "Local REST API" → Install (Abe Diaz Solis)
- **Enable:** Toggle ON
- **Settings:**
  - Leave default port (27123)
  - Do NOT change WebSocket settings
  - Do NOT require authentication
- **Verify:** Obsidian will display "Server started on 27123" in console

#### Plugin 2: obsidian-claude-code-mcp
- **Purpose:** Connects Claude Code directly to vault via WebSocket/HTTP
- **Install:**
  - Go to GitHub: https://github.com/iansinnott/obsidian-claude-code-mcp
  - Download latest `.zip` from Releases
  - Extract to: `{vault}/.obsidian/plugins/obsidian-claude-code-mcp/`
  - Reload Obsidian (Ctrl+Shift+R)
  - Community Plugins → Installed → Find "Claude Code MCP" → Enable
- **Settings:**
  - Vault root path: auto-detected (verify it matches your vault path)
  - WebSocket URL: `ws://localhost:27123` (default)
  - Save and reload
- **Verify:** Obsidian console shows "Claude Code MCP connected"

#### Plugin 3: Templater
- **Purpose:** Markdown automation for file generation
- **Install:** Community Plugins → Search "Templater" → Install (SilentVoid)
- **Settings:**
  - Template folder location: `00-system/templates/`
  - Enable "Trigger Templater on file creation"
  - Syntax highlighting: ON
- **Create template folder:** `00-system/templates/` (Templater auto-creates if missing)

#### Plugin 4: Dataview
- **Purpose:** Live queries across vault markdown files
- **Install:** Community Plugins → Search "Dataview" → Install (Michael L.)
- **Settings:**
  - Enable JavaScript queries (needed for agent evaluation)
  - Set rendering timeout to 10s
  - Leave other defaults

#### Plugin 5: Obsidian Git
- **Purpose:** Auto-commit and branch management
- **Install:** Community Plugins → Search "Obsidian Git" → Install (Simpler Web)
- **Settings:**
  - Auto save interval: 10 minutes (for auto-commit)
  - Disable "Show status bar" (optional, reduces clutter)
  - Line author display: OFF
  - Commit message: "vault sync"
  - Pull on open: OFF (manual control preferred for MVP)
- **Verify:** Right-click vault name → "Open vault in terminal" works
- **Initial commit:**
  ```bash
  git log --oneline | head -5  # Verify history
  ```

### 4. Claude Desktop Configuration (MCP Setup)

**File location:** Windows typically stores this at:
```
%APPDATA%\Claude\claude_desktop_config.json
```

On Windows, this usually expands to:
```
C:\Users\{YourUsername}\AppData\Roaming\Claude\claude_desktop_config.json
```

**Configuration for Apex OS vault:**

```json
{
  "mcps": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-supabase",
        "--project-id",
        "{YOUR_SUPABASE_PROJECT_ID}",
        "--api-key",
        "{YOUR_SUPABASE_API_KEY}"
      ]
    },
    "vercel": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-vercel",
        "--token",
        "{YOUR_VERCEL_TOKEN}"
      ]
    },
    "figma": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-figma",
        "--access-token",
        "{YOUR_FIGMA_TOKEN}"
      ]
    },
    "obsidian-local": {
      "command": "ws://localhost:27123",
      "disabled": false
    }
  }
}
```

**IMPORTANT: Environment Variables**
Instead of hardcoding secrets in the config, use environment variables:

1. Create a `.env` file in vault root (NOT git-tracked):
```
SUPABASE_PROJECT_ID=your-project-id-here
SUPABASE_API_KEY=your-api-key-here
VERCEL_TOKEN=your-token-here
FIGMA_TOKEN=your-token-here
```

2. Update `claude_desktop_config.json` to reference them:
```json
{
  "mcps": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-supabase",
        "--project-id",
        "${SUPABASE_PROJECT_ID}",
        "--api-key",
        "${SUPABASE_API_KEY}"
      ]
    }
  }
}
```

3. Add `.env` to `.gitignore`:
```
.env
.env.local
```

4. Restart Claude Desktop after modifying `claude_desktop_config.json`.

### 5. Claude Code CLI Configuration (Windows)

If using Claude Code instead of Claude Desktop:

```bash
claude --version  # Verify installation
```

Create `.claude/config.json`:
```json
{
  "vault_path": "C:\\Users\\Casey\\Documents\\apex-os",
  "auto_commit": true,
  "commit_interval_minutes": 10,
  "mcp_config_path": ".claude/mcps.json"
}
```

Create `.claude/mcps.json` with same structure as above.

### 6. Verification Checklist — Day 1

Run this checklist before proceeding to Week 1:

- [ ] Obsidian opens and loads vault without errors
- [ ] Community Plugins are enabled (Settings → Community plugins)
- [ ] Local REST API running (Obsidian console: "Server started on 27123")
- [ ] obsidian-claude-code-mcp installed and connected (console: "Claude Code MCP connected")
- [ ] Templater, Dataview, Obsidian Git all installed and toggled ON
- [ ] Git initialized and initial commit exists: `git log --oneline | head -1`
- [ ] Claude Desktop/Code can read vault (open MCP inspector, verify connection)
- [ ] Create test note: `test-2026-03-22.md` with frontmatter and verify Dataview renders it
- [ ] Test git commit: Edit a note, save, verify Obsidian Git auto-commits in 10 min

**If verification fails:** Do not proceed to Week 1. Debug MCP connections first. Check Obsidian console for errors.

---

## Week 1: Agent Accelerators

Install these ONLY after Day 1 verification passes. These plugins speed up agent work but are not essential.

### Plugin 6: QuickAdd
- **Purpose:** Macro automation for recurring workflows
- **Install:** Community Plugins → Search "QuickAdd" → Install (Chrisgr)
- **Settings:**
  - Create "New Agent Output" macro that auto-generates YAML frontmatter
  - Create "Daily Standup" macro that opens today's journal with template
  - Map to hotkeys: Alt+Shift+N for new output, Alt+Shift+S for standup
- **Example Macro (QuickAdd Editor):**
  ```
  ---
  type: agent-output
  agent: AGENT_NAME
  project: AGENT_PROJECT
  status: draft
  date: {{DATE}}
  summary: ""
  ---

  # {{PROMPT}}
  ```
- **Do NOT use:** For destructive operations (delete, replace). Use manually.

### Plugin 7: Calendar
- **Purpose:** Visual sprint planning
- **Install:** Community Plugins → Search "Calendar" → Install (Elias Meijs)
- **Settings:**
  - Set to weekly view
  - Link to `50-journal/{YYYY}-W{WW}.md`
- **Use:** Visual timeline for sprint milestones

### Plugin 8: Advanced Tables
- **Purpose:** Spreadsheet-like editing for P&L, scorecard tables
- **Install:** Community Plugins → Search "Advanced Tables" → Install (Tony Fast)
- **Settings:**
  - Enable formula support
  - Enable cell wrapping
- **Use:** LEDGER financial tables, VIGIL scoring matrices

### Plugin 9: Excalidraw
- **Purpose:** Whiteboard diagrams (system maps, user flows)
- **Install:** Community Plugins → Search "Excalidraw" → Install (Zsviczian)
- **Settings:**
  - Auto-save to `.excalidraw` subfolder in project
  - Default export format: SVG (for clean scaling)
- **Use:** FORGE system diagrams, PRISM user flow maps

---

## Week 2+: Optional Enhancements

These plugins are nice-to-have and can be added after Week 1 without disrupting workflow.

### Plugin 10: Readwise Official
- **Purpose:** Sync highlights from web reading (for VIGIL research)
- **Install if:** You highlight articles for competitive intelligence
- **Settings:** Connect Readwise account, sync daily

### Plugin 11: Obsidian Link Converter
- **Purpose:** Manage wikilinks at scale
- **Install if:** You're doing large-scale note restructuring
- **Settings:** Preview before converting

### Plugin 12: Copilot (Claude-based)
- **Purpose:** In-vault AI suggestions
- **Install if:** You want real-time agent hints while writing
- **Settings:** Connect to Claude API, set model to Claude 3.5 Sonnet

---

## Slash Commands Setup

In Claude Code, agents activate via slash commands. These are defined in `.claude/commands/` and auto-load.

### Create Agent Command Files

Create one file per agent in `.claude/commands/`:

#### `.claude/commands/sentinel.md`
```
# /sentinel

Activate SENTINEL — Master Orchestrator

Read PERSONA at: 00-system/agents/sentinel/PERSONA.md
Read STATE at: 00-system/STATE.md
Then await instructions.
```

#### `.claude/commands/vigil.md`
```
# /vigil

Activate VIGIL — Intelligence Analyst

Read PERSONA at: 00-system/agents/vigil/PERSONA.md
Read STATE at: 00-system/STATE.md
Then conduct research per briefing.
```

#### Repeat for all 9 agents: `/forge`, `/prism`, `/anvil`, `/beacon`, `/scribe`, `/ledger`, `/helios`

Each command file is minimal — just the activation trigger and pointer to PERSONA.

---

## Initial State & Decision Files

Create these files ONCE, before first agent work:

### `00-system/STATE.md`
```yaml
---
type: system-state
status: active
last-updated: 2026-03-22
---

# System State

## Current Cycle
- Cycle: S-2026-Q2-00 (Pre-MVP)
- Focus: Apex OS bootstrap complete
- Next: First battle drill (awaiting project idea)

## Agent Readiness
- SENTINEL: Ready
- VIGIL: Ready
- HELIOS: Ready
- FORGE: Ready
- PRISM: Ready
- ANVIL: Ready
- BEACON: Ready
- SCRIBE: Ready
- LEDGER: Ready

## Recent Changes
- 2026-03-22: Initial setup complete. All plugins installed and verified.

## Blockers
None.
```

### `00-system/DECISIONS.md`
```yaml
---
type: decisions-log
status: active
---

# Architecture Decision Records

## ADR-001: Monolith vs. Microservices

**Decision:** Monolith for MVP

**Rationale:** Solo founder, single deployment surface, time-to-market

**Alternatives Rejected:** Microservices (complexity debt), Serverless-first (cold start risk)

**Consequences:** Monolith requires clear internal boundaries. Refactoring to services later is lower risk than discovering services were wrong choice.

**Status:** Active. Revisit only if per-instance throughput becomes bottleneck (>1000 req/s).

---

Add one ADR per major technical choice.
```

---

## Testing the Setup (Week 1 Verification)

### Test 1: Agent Activation
```
Open Claude Code / Claude Desktop
Type: /sentinel
Verify: SENTINEL persona loads and responds
```

### Test 2: Vault Integration
```
Create file: 00-system/test-2026-03-22.md
Add content via Claude
Verify: File appears in Obsidian within 5 seconds
```

### Test 3: Git Auto-Commit
```
Wait 10 minutes (Obsidian Git auto-commit interval)
Terminal: git log --oneline | head -3
Verify: "vault sync" commits appear
```

### Test 4: Cross-MCP Access
In Claude, test each MCP individually:
```
/sentinel
Run Supabase MCP: "Show me my projects"
Verify: Project list returns
```

If any test fails, check `.claude/rules/` for auto-loaded rules and manually reload if needed.

---

## Troubleshooting

### "Local REST API not responding"
- Obsidian crashed. Restart.
- Check console (Ctrl+Shift+I) for errors.
- Verify port 27123 is not in use: `netstat -ano | findstr 27123`

### "obsidian-claude-code-mcp not connecting"
- Check Obsidian console: should see "Claude Code MCP connected"
- If not: verify plugin is in `.obsidian/plugins/obsidian-claude-code-mcp/manifest.json`
- Restart Obsidian (Ctrl+Shift+R)

### "MCP tools not available in Claude"
- Check that `claude_desktop_config.json` is in correct location
- Restart Claude Desktop (full exit, not minimize)
- Verify `.env` variables are set if using env-based config

### "PowerShell git commands fail"
- Use semicolons instead of && : `git add -A ; git commit -m "message"`
- Or use cmd.exe: `cmd /c "git add -A && git commit -m "message""`

### "npm install hangs when Mullvad VPN is on"
- Either disable Mullvad during npm installs
- Or use explicit registry: `npm install --registry https://registry.npmjs.org`

---

## Maintenance (Monthly)

1. **Plugin updates:** Obsidian Community Plugins → Check for updates monthly
2. **Git cleanup:** `git gc` to optimize `.git/` size (once per quarter)
3. **Obsidian cache clear:** Delete `.obsidian/.cache/` if search seems sluggish
4. **obsidian-claude-code-mcp updates:** Check GitHub releases monthly

---

## Reference: Windows Path Examples

All paths in this guide use forward slashes. Windows paths with backslashes for reference:

```
Vault root:          C:\Users\Casey\Documents\apex-os\
Obsidian config:     C:\Users\Casey\Documents\apex-os\.obsidian\
Claude Desktop cfg:  C:\Users\Casey\AppData\Roaming\Claude\claude_desktop_config.json
Plugins folder:      C:\Users\Casey\Documents\apex-os\.obsidian\plugins\
Templates folder:    C:\Users\Casey\Documents\apex-os\00-system\templates\
.env file:           C:\Users\Casey\Documents\apex-os\.env
```

When in doubt, use forward slashes in JSON configs and code. Windows understands both.

---

## Next Steps After Setup

Once verification passes:

1. Create your first project folder under `10-projects/`
2. Read `CONSTITUTION.md` fully (immutable rules)
3. Read `BATTLE-DRILL.md` (agent sequence)
4. Run SENTINEL for project intake briefing
5. Let agents execute in sequence

Setup is complete. Apex OS is ready.
