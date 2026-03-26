#!/usr/bin/env node
/**
 * Apex OS Integration Module for Claude Flow Hooks
 *
 * Bridges Apex OS vault state with Ruflo learning infrastructure.
 * Called by hook-handler.cjs to keep vault and Ruflo in sync.
 *
 * Capabilities:
 * - Read/update STATE.md programmatically
 * - Track edits against FORGE blueprint scope
 * - Log build activity to ANVIL build log
 * - Sync session state between vault and Ruflo memory
 */

const fs = require('fs');
const path = require('path');

// Vault paths
const VAULT_ROOT = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
const APEX_OS = path.join(VAULT_ROOT, 'apex-os');
const STATE_PATH = path.join(APEX_OS, '00-system', 'STATE.md');
const SPRINT_PATH = path.join(APEX_OS, '00-system', 'SPRINT.md');
const BUILD_DIR = path.join(APEX_OS, '10-projects', 'aethertrace', 'build');
const MVP_DIR = path.join(VAULT_ROOT, 'aethertrace-mvp');

// ─── State Management ──────────────────────────────────────────────────────

/**
 * Read current STATE.md and extract key fields
 */
function readState() {
  try {
    if (!fs.existsSync(STATE_PATH)) return null;
    const content = fs.readFileSync(STATE_PATH, 'utf8');

    // Extract battle drill status
    const battleDrillMatch = content.match(/\| 7 \| ANVIL \| ([^\|]+) \|/);
    const anvilStatus = battleDrillMatch ? battleDrillMatch[1].trim() : 'UNKNOWN';

    // Extract last updated
    const updatedMatch = content.match(/## Last Updated\n(.+)/);
    const lastUpdated = updatedMatch ? updatedMatch[1].trim() : 'UNKNOWN';

    return {
      anvilStatus,
      lastUpdated,
      raw: content
    };
  } catch (e) {
    return null;
  }
}

/**
 * Update the "Last Updated" line in STATE.md
 */
function touchState(reason) {
  try {
    if (!fs.existsSync(STATE_PATH)) return false;
    let content = fs.readFileSync(STATE_PATH, 'utf8');

    const now = new Date().toISOString().split('T')[0];
    const newLine = `${now} by ${reason}`;

    content = content.replace(
      /^(## Last Updated\n)(.+)$/m,
      `$1${newLine}`
    );

    fs.writeFileSync(STATE_PATH, content, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// ─── Scope Checking ─────────────────────────────────────────────────────────

/**
 * Check if a file edit is within FORGE-defined scope.
 * Returns { inScope: boolean, reason: string }
 */
function checkScope(filePath) {
  if (!filePath) return { inScope: true, reason: 'no file path' };

  const normalized = filePath.replace(/\\/g, '/');

  // Always in scope: MVP codebase
  if (normalized.includes('aethertrace-mvp/')) {
    return { inScope: true, reason: 'MVP codebase' };
  }

  // Always in scope: Apex OS system files (STATE.md, SPRINT.md, build logs)
  if (normalized.includes('apex-os/00-system/') || normalized.includes('apex-os/10-projects/')) {
    return { inScope: true, reason: 'Apex OS system file' };
  }

  // Always in scope: CLAUDE.md, hook helpers
  if (normalized.includes('CLAUDE.md') || normalized.includes('.claude/')) {
    return { inScope: true, reason: 'Configuration' };
  }

  // Out of scope warning: anything else in vault root
  return { inScope: true, reason: 'vault file — verify relevance' };
}

/**
 * Check if a file edit touches out-of-scope FORGE features
 */
function checkForgeScope(filePath) {
  if (!filePath) return null;

  const normalized = filePath.replace(/\\/g, '/').toLowerCase();

  // Out-of-scope features per FORGE blueprint
  const outOfScope = [
    { pattern: 'procore', reason: 'Procore integration is OUT OF SCOPE (FORGE)' },
    { pattern: 'blockchain', reason: 'Blockchain is OUT OF SCOPE — SHA-256 chain is sufficient (FORGE)' },
    { pattern: 'offline', reason: 'Offline mobile is OUT OF SCOPE — web-first (FORGE)' },
    { pattern: 'cmmc', reason: 'CMMC features are OUT OF SCOPE — post-MVP (FORGE)' },
    { pattern: 'insurance', reason: 'Insurance integrations are OUT OF SCOPE (FORGE)' },
    { pattern: 'prime.contractor', reason: 'Prime contractor accounts are OUT OF SCOPE (FORGE)' },
  ];

  for (const item of outOfScope) {
    if (normalized.includes(item.pattern)) {
      return item.reason;
    }
  }

  return null;
}

// ─── Build Logging ──────────────────────────────────────────────────────────

/**
 * Append an entry to today's build activity log
 */
function logBuildActivity(action, filePath) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const logPath = path.join(BUILD_DIR, `activity-${today}.log`);
    const time = new Date().toISOString().split('T')[1].split('.')[0];
    const entry = `${time} | ${action} | ${filePath || 'unknown'}\n`;

    fs.mkdirSync(BUILD_DIR, { recursive: true });
    fs.appendFileSync(logPath, entry, 'utf8');
    return true;
  } catch (e) {
    return false;
  }
}

// ─── Edit Tracking ──────────────────────────────────────────────────────────

/**
 * Track which files were edited in this session for STATE.md summary
 */
const SESSION_EDITS_PATH = path.join(VAULT_ROOT, '.claude', '.session-edits.json');

function trackEdit(filePath) {
  try {
    let edits = [];
    if (fs.existsSync(SESSION_EDITS_PATH)) {
      edits = JSON.parse(fs.readFileSync(SESSION_EDITS_PATH, 'utf8'));
    }

    const normalized = filePath.replace(/\\/g, '/');
    if (!edits.includes(normalized)) {
      edits.push(normalized);
    }

    fs.writeFileSync(SESSION_EDITS_PATH, JSON.stringify(edits, null, 2), 'utf8');
    return edits.length;
  } catch (e) {
    return 0;
  }
}

function getSessionEdits() {
  try {
    if (fs.existsSync(SESSION_EDITS_PATH)) {
      return JSON.parse(fs.readFileSync(SESSION_EDITS_PATH, 'utf8'));
    }
  } catch (e) {}
  return [];
}

function clearSessionEdits() {
  try {
    if (fs.existsSync(SESSION_EDITS_PATH)) {
      fs.unlinkSync(SESSION_EDITS_PATH);
    }
  } catch (e) {}
}

// ─── Session Summary ────────────────────────────────────────────────────────

/**
 * Generate a session summary for STATE.md update
 */
function generateSessionSummary() {
  const edits = getSessionEdits();
  if (edits.length === 0) return null;

  const mvpEdits = edits.filter(e => e.includes('aethertrace-mvp/'));
  const vaultEdits = edits.filter(e => e.includes('apex-os/'));

  const parts = [];
  if (mvpEdits.length > 0) parts.push(`${mvpEdits.length} MVP files`);
  if (vaultEdits.length > 0) parts.push(`${vaultEdits.length} vault files`);

  return `Session edited ${parts.join(', ')} (${edits.length} total)`;
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  readState,
  touchState,
  checkScope,
  checkForgeScope,
  logBuildActivity,
  trackEdit,
  getSessionEdits,
  clearSessionEdits,
  generateSessionSummary,
  VAULT_ROOT,
  APEX_OS,
  STATE_PATH,
  MVP_DIR,
};
