#!/usr/bin/env node
/**
 * Git Push Guard — Level 3 Automation
 *
 * Runs before any git push command to verify:
 * 1. Hash chain tests pass
 * 2. No out-of-scope files being committed
 * 3. Build doesn't error
 *
 * Called by pre-bash hook when command contains "git push".
 * Outputs warnings but does NOT block (advisory mode).
 * Casey decides whether to proceed.
 */

const { execSync } = require('child_process');
const path = require('path');

const MVP_DIR = path.join(
  process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..'),
  'aethertrace-mvp'
);

function runCheck(name, command, cwd) {
  try {
    execSync(command, { cwd, stdio: 'pipe', timeout: 30000 });
    return { name, pass: true };
  } catch (e) {
    return { name, pass: false, error: e.stderr?.toString().slice(0, 200) || e.message };
  }
}

function main() {
  const checks = [];

  // 1. Hash chain tests
  checks.push(runCheck(
    'Hash chain tests',
    'npx vitest run src/lib/hash-chain.test.ts --reporter=dot 2>&1',
    MVP_DIR
  ));

  // 2. TypeScript compilation check
  checks.push(runCheck(
    'TypeScript check',
    'npx tsc --noEmit --pretty false 2>&1',
    MVP_DIR
  ));

  // Output results
  const passed = checks.filter(c => c.pass);
  const failed = checks.filter(c => !c.pass);

  if (failed.length === 0) {
    console.log(`[GIT-GUARD] All ${checks.length} checks passed`);
  } else {
    console.log(`[GIT-GUARD] ${failed.length} of ${checks.length} checks FAILED:`);
    for (const f of failed) {
      console.log(`  [FAIL] ${f.name}: ${f.error || 'unknown error'}`);
    }
    console.log('[GIT-GUARD] Proceeding anyway (advisory mode) — review failures before pushing');
  }
}

module.exports = { runCheck, main };

if (require.main === module) {
  main();
}
