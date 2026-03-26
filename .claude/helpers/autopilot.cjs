#!/usr/bin/env node
/**
 * AetherTrace Autopilot — Level 2 Automation
 *
 * Reads the task list, identifies the next incomplete task,
 * generates a Precision Brief, and outputs it as a prompt
 * for the scheduled task system to execute.
 *
 * This replaces the broken Ruflo autopilot module with a
 * lightweight Node.js driver that uses the vault as its task source.
 *
 * Flow:
 * 1. Read SPRINT.md for current task list
 * 2. Find first task with status "pending"
 * 3. Read FORGE blueprint for task context
 * 4. Generate a Precision Brief (5 elements)
 * 5. Output the brief as a prompt for execution
 * 6. If no tasks remain, output completion notice
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
const SPRINT_PATH = path.join(VAULT_ROOT, 'apex-os', '00-system', 'SPRINT.md');
const STATE_PATH = path.join(VAULT_ROOT, 'apex-os', '00-system', 'STATE.md');
const BUILD_LOG_DIR = path.join(VAULT_ROOT, 'apex-os', '10-projects', 'aethertrace', 'build');

// Task definitions with Precision Briefs pre-built
const TASK_REGISTRY = [
  {
    id: 'subscription-guard',
    name: 'Subscription guard middleware',
    objective: 'Create middleware that checks org subscription status before allowing API calls. Active subscription = proceed. Inactive/past_due = 402. Starter plan = max 5 active projects. Professional = unlimited.',
    constraints: 'Do not modify existing API routes directly — create a reusable middleware function they import. Do not touch the Stripe webhook handler. Do not add new tables.',
    context: 'Organizations table has subscription_status (inactive/active/past_due/canceled) and plan (starter/professional). Stripe webhook already updates these fields. Evidence upload, custody plan creation, and export routes need protection. Read-only routes (verification, chain view) should work even for past_due (grace period).',
    deliverable: 'One file: lib/subscription.ts with checkSubscription() middleware. Update evidence upload route as the first integration example. One test verifying each status code.',
    decisionBoundary: 'If the grace period logic (allowing reads for past_due) seems wrong, stop and ask. If any route is unclear on whether it needs protection, stop and ask.',
    sprintStatus: 'pending',
  },
  {
    id: 'design-tokens',
    name: 'Design tokens in Tailwind',
    objective: 'Translate BRAND-SPEC.md color palette, typography, and spacing into Tailwind CSS configuration so all components use tokens instead of hardcoded values.',
    constraints: 'Do not change the brand spec values — implement exactly what PRISM locked. Do not refactor existing components in this task — only create the token system. IBM Plex Mono and Inter must be loaded via next/font, not CDN links.',
    context: 'Brand spec at apex-os/10-projects/aethertrace/design/BRAND-SPEC.md. Colors: void #040D21, deep #0a1628, card #0d1b35, navy #0f1f3d, silver #C8D4E8, bright #E8EEFF, dim #46607a, breach #EF4444. Typography: IBM Plex Mono (headings) + Inter (body). Currently landing page uses inline styles.',
    deliverable: 'Updated tailwind.config.ts with brand tokens. Updated app/layout.tsx with next/font loading. One CSS file or @layer with glow utilities. No component refactoring.',
    decisionBoundary: 'If Tailwind v4 has a different config format than expected, stop and check the docs first.',
    sprintStatus: 'pending',
  },
  {
    id: 'test-script',
    name: 'Add test script and verify tests pass',
    objective: 'Add "test": "vitest" to package.json scripts and verify all 22 hash chain tests pass.',
    constraints: 'Do not modify any test files. Do not modify hash-chain.ts. Only touch package.json.',
    context: 'vitest is already installed as a devDependency. lib/hash-chain.test.ts has 22 tests. No vitest.config.ts exists — vitest should auto-detect.',
    deliverable: 'Updated package.json with test script. Terminal output showing all 22 tests pass.',
    decisionBoundary: 'If any test fails, stop immediately — do not fix. Report the failure.',
    sprintStatus: 'pending',
  },
  {
    id: 'email-notifications',
    name: 'Email notifications via Resend',
    objective: 'Set up Resend for transactional emails: welcome on signup, confirmation when evidence is sealed, notification when export package is ready.',
    constraints: 'Do not add marketing emails. Do not store email content in the database. Do not send emails in development mode unless RESEND_API_KEY is set. Maximum 3 email templates.',
    context: 'Resend is in the FORGE stack decision. No Resend SDK installed yet. Auth signup happens via Supabase Auth. Evidence upload is at api/evidence/upload/route.ts. Export is at api/projects/[projectId]/export/route.ts.',
    deliverable: 'lib/email.ts with 3 template functions. Resend SDK installed. Emails triggered from signup, upload, and export routes. Graceful fallback if API key missing.',
    decisionBoundary: 'If Supabase Auth webhook for signup is complex, stop and ask whether to use Supabase built-in emails instead.',
    sprintStatus: 'pending',
  },
  {
    id: 'custody-plan-ui',
    name: 'Custody plan UI page',
    objective: 'Build the custody plan management UI where users create plans, add requirements, activate (lock) plans, and see completeness status.',
    constraints: 'Use existing API routes (custody-plan, requirements). Do not create new API routes. Follow BRAND-SPEC.md colors and typography. Do not add features beyond what FORGE specified.',
    context: 'API routes exist: GET/POST/PATCH at api/projects/[projectId]/custody-plan and POST/PATCH at api/projects/[projectId]/requirements. Schema supports draft/active/completed/archived status. Completeness is calculated in the verify endpoint.',
    deliverable: 'One page at dashboard/projects/[projectId]/plan/page.tsx. Shows current plan or create-new flow. Requirement list with add/fulfill actions. Activate button with confirmation. Completeness progress bar.',
    decisionBoundary: 'If the plan activation UX is unclear (should it be a modal? inline?), stop and ask.',
    sprintStatus: 'pending',
  },
  {
    id: 'duplicate-cleanup',
    name: 'Consolidate duplicate components',
    objective: 'Remove duplicate seal-chat-box.tsx, sealed-feed.tsx, and seal-shell.tsx that exist in both components/ and dashboard/projects/[projectId]/seal/.',
    constraints: 'Keep the version in dashboard/projects/[projectId]/seal/ as the source of truth (it is more recent). Update any imports that reference the components/ copies. Do not change functionality.',
    context: 'Duplicates: components/seal-chat-box.tsx vs dashboard/.../seal/seal-chat-box.tsx. Same for sealed-feed.tsx and seal-shell.tsx. The dashboard versions were built later and may have fixes.',
    deliverable: 'Delete 3 files from components/. Update imports in any file that referenced them. Verify no broken imports.',
    decisionBoundary: 'If the two versions have meaningful differences (not just copies), stop and surface both versions for review.',
    sprintStatus: 'pending',
  },
  {
    id: 'production-deploy',
    name: 'Production deploy to Vercel',
    objective: 'Deploy aethertrace-mvp to Vercel. Verify the full flow works: signup, create project, upload evidence, view chain, export package, public verification.',
    constraints: 'Use Stripe test mode keys for initial deploy. Do not configure custom domain yet — just get the Vercel URL working. Do not modify any code unless the build fails.',
    context: 'Next.js 16 project at aethertrace-mvp/. Supabase project pcjuknjzslwhbieerhyb is active. .env.local has all keys.',
    deliverable: 'Working Vercel deployment URL. Smoke test confirming signup through verification flow works.',
    decisionBoundary: 'If the build fails, report the error — do not guess at fixes. If environment variables need to be set on Vercel, list them and ask for confirmation before setting.',
    sprintStatus: 'pending',
  },
];

function getNextTask() {
  return TASK_REGISTRY.find(t => t.sprintStatus === 'pending') || null;
}

function generatePrompt(task) {
  return `ANVIL BUILD TASK — ${task.name}

PRECISION BRIEF:

① OBJECTIVE: ${task.objective}

② CONSTRAINTS: ${task.constraints}

③ CONTEXT: ${task.context}

④ DELIVERABLE: ${task.deliverable}

⑤ DECISION BOUNDARY: ${task.decisionBoundary}

Read the FORGE blueprint at apex-os/10-projects/aethertrace/architecture/FORGE-2026-03-23-mvp-dual-path-blueprint.md for full context. Read BRAND-SPEC.md if this involves UI. Use the Ruflo swarm for parallel execution if the task has independent subtasks. Update STATE.md and build log when complete.`;
}

function main() {
  const task = getNextTask();

  if (!task) {
    console.log('ALL TASKS COMPLETE. AetherTrace MVP is ready for production deploy verification.');
    console.log('Next battle drill step: BEACON (go-to-market).');
    return;
  }

  console.log(generatePrompt(task));
}

// Export for use by scheduled tasks and hooks
module.exports = { TASK_REGISTRY, getNextTask, generatePrompt };

// Run if called directly
if (require.main === module) {
  main();
}
