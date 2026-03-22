---
type: system-doc
status: active
version: 1.0.0
last-updated: 2026-03-22
---

# Git Strategy — Version Control for Apex OS

The vault is a git repository. Every significant change is committed. This creates an audit trail of how the system evolved and makes rollback possible.

## Branch Strategy

Apex OS uses a simple **main + dev** branching model:

- **main** — The live system. Production-ready state of all agents and rules.
- **dev** — Working branch for agents and improvements. All new work lands here first.

### Branch Rules

1. **main is always stable:** You can git reset to any commit on main and the system works
2. **dev is the working area:** Agents commit to dev, then periodic dev → main merges
3. **No force pushes:** Only rebase with care, and only on personal dev branches
4. **One feature per dev branch:** If working on two separate improvements, use dev-feature-1 and dev-feature-2

### Typical Workflow

```
git checkout main         # Start from stable
git pull                  # Get latest
git checkout -b dev       # Switch to dev

[Do work: run agents, create outputs, make edits]

git add -A
git commit -m "..."

[More work...]

git add -A
git commit -m "..."

[When agent cycle is complete]

git checkout main
git pull
git merge dev            # Merge dev into main
git push origin main

git checkout dev
git rebase main          # Keep dev in sync
```

## Auto-Commit (Obsidian Git Plugin)

Obsidian Git auto-commits every 10 minutes with message `vault sync`. This prevents data loss if Claude or Obsidian crashes.

### How It Works

1. You edit a note
2. Obsidian saves it to disk
3. After 10 min idle time, Obsidian Git runs: `git add -A && git commit -m "vault sync"`
4. No push (manual control)

This creates many small commits. That's fine — they're save points, not meaningful units of work.

### Disable Auto-Commit if Needed

For focused work (e.g., ANVIL's 2-hour sprints), disable auto-commit:
- Obsidian Settings → Community Plugins → Obsidian Git → Disable
- Re-enable when done

### Verify Auto-Commit is Working

```bash
git log --oneline | head -10
```

You should see `vault sync` commits every 10 minutes. If not, check:
1. Obsidian Git is enabled (Settings → Community Plugins)
2. No uncommitted changes (`git status` should show clean)
3. Obsidian is running (REST API must be active)

## Commit Message Format

All manual commits (not auto-commit) follow a format:

```
{TYPE}: {AGENT} {project} — {brief reason}

{Detailed explanation if needed, wrapped at 72 characters}
```

### Commit Types

- **agent-output:** Agent completed work. Include rubric score estimate.
- **agent-evolution:** Agent instruction was improved. Include old version → new version.
- **system-update:** System file change (CONSTITUTION, BATTLE-DRILL, etc.)
- **feature:** New capability added to vault (new plugin, new automation)
- **fix:** Bug fix or correction
- **docs:** Documentation update

### Examples

```
agent-output: VIGIL sealed-photos — market validation complete (23/30)

Contractor pricing discovery via 5 discovery calls.
Load-bearing assumption: adoption friction vs. audit benefit.
```

```
agent-evolution: FORGE v1.0.0 → v1.0.1 — sharpen scope discipline

New rule: All OUT OF SCOPE items must be listed in output.
Prevents scope creep into post-MVP phases.

See: 00-system/evolution/FORGE-2026-03-22-reflection.md
```

```
system-update: CONSTITUTION article V — strengthen output standards

Require source traceability for all evidence claims.
Applies to all agents, measured in rubric updates.
```

```
feature: QuickAdd macro — agent output template generator

Reduces boilerplate. Macro creates {AGENT}-{DATE}-{slug}.md
with correct frontmatter. Saves ~2 min per agent session.
```

## What Gets Tracked vs. Excluded

### TRACKED in git (commit these)

- `00-system/**/*.md` — System kernel files (PERSONA, RUBRIC, STATE, DECISIONS)
- `10-projects/**/*.md` — Agent outputs and project documentation
- `20-areas/**/*.md` — Ongoing responsibilities and area management
- `30-resources/**/*.md` — Reference knowledge base
- `.claude/commands/**/*.md` — Slash command definitions
- `.claude/rules/**/*.md` — Agent behavioral rules
- `CONSTITUTION.md` — Immutable rules
- All markdown files with frontmatter

### NOT TRACKED (.gitignore)

```
# Environment & secrets
.env
.env.local
.env.*.local

# Obsidian internals (DO NOT TRACK)
.obsidian/
.obsidian/cache/
.obsidian/workspace
.obsidian/plugins/

# Temp files
*.tmp
*.swp
*~

# Build artifacts
node_modules/
dist/
build/
.next/

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.sublime-workspace

# Large files
*.log
*.zip
*.tar.gz

# Excalidraw drawings (optional)
*.excalidraw.png
```

Example `.gitignore`:
```
# Apex OS .gitignore

# Secrets
.env
.env.local

# Obsidian
.obsidian/
.obsidian/cache/
.obsidian/workspace
.obsidian/plugins/*
!.obsidian/plugins/.gitkeep

# Node
node_modules/
package-lock.json

# OS
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/

# Temp
*.tmp
*.swp
*~
.logTemp
```

## Rollback Procedures

### Case 1: Undo Last Commit

If you committed something wrong seconds ago:

```bash
git reset --soft HEAD~1
```

This undoes the commit but keeps changes staged. You can edit and recommit.

### Case 2: Revert a Specific Commit

If a commit from hours/days ago introduced a problem:

```bash
git revert {COMMIT_HASH}
```

This creates a NEW commit that undoes the changes. It preserves history (important for audit trail).

**Example:**
```bash
git log --oneline | head -5
# See: abc1234 agent-evolution: VIGIL v1.0.1
git revert abc1234
git commit -m "Revert VIGIL evolution: scores dropped after change"
```

### Case 3: Go Back to Last Known Good

If current state is broken, revert to a known good commit:

```bash
git log --oneline | head -20  # Find a good commit
git reset --hard {GOOD_COMMIT_HASH}
```

**WARNING:** `--hard` destroys uncommitted changes. Use only when sure.

### Case 4: Recover Deleted Content

If you deleted a file accidentally:

```bash
git log --diff-filter=D --summary | head -20  # Find deletion
git checkout {COMMIT_BEFORE_DELETION}^ -- {FILENAME}
```

This restores the file from before it was deleted.

## Merge Conflict Resolution

Conflicts occur when humans and agents edit the same file. This is rare but possible.

### When Conflicts Happen

```bash
git merge dev
# CONFLICT (content): Merge conflict in 10-projects/myproject/research.md
```

### Resolution Steps

1. **Find conflicts:**
   ```bash
   git status  # Shows conflicted files
   ```

2. **Open the file.** Git marks conflicts:
   ```markdown
   <<<<<<< HEAD
   [Casey's version]
   =======
   [VIGIL's version]
   >>>>>>> dev
   ```

3. **Choose what to keep:**
   - Keep Casey's version: delete VIGIL's section (between `=======` and `>>>>>>>`)
   - Keep VIGIL's version: delete Casey's section (between `<<<<<<<` and `=======`)
   - Keep both: delete the conflict markers, arrange content logically

4. **Stage the resolution:**
   ```bash
   git add 10-projects/myproject/research.md
   git commit -m "Merge dev: resolved conflict in research output"
   ```

### Prevention Strategy

Conflicts are rare if agents write to their own project folders:
- VIGIL outputs to `10-projects/{project}/research/`
- FORGE outputs to `10-projects/{project}/architecture/`
- ANVIL outputs to `10-projects/{project}/build/`

Casey edits `00-system/` and project root files. Agents don't edit those. Conflicts prevented.

## Merge Strategy: dev → main

Use **fast-forward merges** when possible (keeps history clean):

```bash
git checkout main
git pull origin main
git merge --ff-only dev
```

If dev has diverged from main, rebase first:

```bash
git checkout dev
git rebase main
git checkout main
git merge --ff-only dev
```

This keeps the commit history linear (easier to read later).

## Tagging Releases

After each significant milestone, create a tag:

```bash
git tag -a v0.1.0-mvp -m "Sealed Photos MVP — first customers"
git push origin --tags
```

Tags create release checkpoints. You can always `git checkout v0.1.0-mvp` to see the exact state at launch.

## Git Logs for Agent Tracking

Finding all agent work:

```bash
# All VIGIL outputs
git log --oneline | grep "VIGIL"

# All evolution cycles
git log --oneline | grep "agent-evolution"

# All work on sealed-photos project
git log --oneline | grep "sealed-photos"

# Last 20 commits
git log --oneline | head -20

# Commits by date range
git log --since="2026-03-15" --until="2026-03-22" --oneline
```

## Pushing to Remote

MVP phase uses local-only git. When ready to share/backup:

```bash
git remote add origin https://github.com/{user}/{repo}.git
git branch -M main
git push -u origin main
```

Then keep in sync:

```bash
git pull                # Pull from remote before work
git push                # Push after finishing work
```

## Continuous Integration (Not Yet)

When ANVIL deploys code, we'll add CI/CD:

```yaml
# .github/workflows/deploy.yml (future)

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test
      - run: npm run build
      - run: vercel --prod
```

For now: manual deployment. ANVIL runs tests locally, then pushes manually to production.

## Git Discipline Rules (From CONSTITUTION)

From Article V:

- **Commit after every successful change:** Atomic changes. Save points.
- **Never bundle unrelated work:** One feature per commit.
- **Keep commits small:** 50-200 lines per commit is ideal.
- **Write descriptive messages:** Future-you will thank you.

## Useful Aliases

Add to `.gitconfig`:

```ini
[alias]
  st = status
  co = checkout
  br = branch
  ci = commit
  unstage = reset HEAD --
  last = log -1 HEAD
  visual = log --graph --oneline --all
  agents = log --grep="agent-output\|agent-evolution"
```

Then use:
```bash
git agents          # See all agent work
git visual          # See commit graph
git last            # See last commit
```

## Monitoring Vault Size

Over time, the vault git repo grows. Monitor:

```bash
du -sh .git/        # Size of git database
git count-objects   # Number of objects stored
```

If > 1GB, run garbage collection:

```bash
git gc --aggressive
git prune
```

This compresses old commits without losing history.

---

Git is the system memory. It proves what happened, when, and why. Commit often. Push rarely (MVP). Never lose work.
