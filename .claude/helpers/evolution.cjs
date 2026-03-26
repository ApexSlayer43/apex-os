#!/usr/bin/env node
/**
 * Agent Evolution Measurement System
 *
 * Three capabilities:
 * 1. recordMetric()  — Store version-tagged metrics after every task
 * 2. compareVersions() — Compare current version against previous
 * 3. checkRollback()  — Flag if new version is >10% worse
 *
 * Metrics are stored as JSON files in .claude/evolution/{agent}/
 * Each file is a metric snapshot tagged to the agent version.
 *
 * Constitution compliance:
 * - All metrics are deterministic (counts, percentages, binary)
 * - No LLM self-assessment scores stored as fact
 * - Rollback triggers surface to Casey, never auto-revert (Art. III)
 */

const fs = require('fs');
const path = require('path');

const VAULT_ROOT = process.env.CLAUDE_PROJECT_DIR || path.resolve(__dirname, '..', '..');
const EVOLUTION_DIR = path.join(VAULT_ROOT, '.claude', 'evolution');

// ─── Deterministic Metric Definitions ───────────────────────────────────────

const METRIC_DEFINITIONS = {
  SENTINEL: {
    downstream_clarifications: { unit: 'count', direction: 'lower_is_better', description: 'Questions the next agent had to ask' },
    rework_delegations: { unit: 'count', direction: 'lower_is_better', description: 'Times SENTINEL had to re-delegate same task' },
    casey_approval_rate: { unit: 'percentage', direction: 'higher_is_better', description: 'Percentage of outputs Casey approved without revision' },
    gate_accuracy: { unit: 'percentage', direction: 'higher_is_better', description: 'GREEN gates that proved correct downstream' },
  },
  VIGIL: {
    sources_cited: { unit: 'count', direction: 'higher_is_better', description: 'Number of sources with URLs in report' },
    behavioral_evidence_ratio: { unit: 'percentage', direction: 'higher_is_better', description: 'Behavioral signals vs attitudinal in report' },
    forge_clarifications: { unit: 'count', direction: 'lower_is_better', description: 'Questions FORGE asked after receiving VIGIL report' },
    verdict_accuracy: { unit: 'binary', direction: 'higher_is_better', description: 'GO/PIVOT/NO-GO proved correct by market (delayed measurement)' },
  },
  HELIOS: {
    frames_validated: { unit: 'percentage', direction: 'higher_is_better', description: 'Expanded frames that survived VIGIL revalidation' },
    casey_energy: { unit: 'binary', direction: 'higher_is_better', description: 'Casey felt energized / saw new possibilities' },
    actionability: { unit: 'binary', direction: 'higher_is_better', description: 'VIGIL could validate the expanded frame without rework' },
  },
  FORGE: {
    anvil_clarifications: { unit: 'count', direction: 'lower_is_better', description: 'Questions ANVIL asked during build' },
    blueprint_coverage: { unit: 'percentage', direction: 'higher_is_better', description: 'Percentage of blueprint items ANVIL could execute' },
    rework_count: { unit: 'count', direction: 'lower_is_better', description: 'Times blueprint had to be revised during build' },
    schema_accuracy: { unit: 'percentage', direction: 'higher_is_better', description: 'Schema deployed without modification from blueprint' },
  },
  PRISM: {
    brand_deviations: { unit: 'count', direction: 'lower_is_better', description: 'Hardcoded values that should be tokens in shipped UI' },
    iterations_to_approval: { unit: 'count', direction: 'lower_is_better', description: 'Versions before Casey approved' },
    anvil_design_questions: { unit: 'count', direction: 'lower_is_better', description: 'Times ANVIL asked for design clarification' },
  },
  ANVIL: {
    test_pass_rate: { unit: 'percentage', direction: 'higher_is_better', description: 'Tests passing / total tests' },
    build_errors: { unit: 'count', direction: 'lower_is_better', description: 'TypeScript or runtime errors' },
    scope_violations: { unit: 'count', direction: 'lower_is_better', description: 'Out-of-scope items detected by hooks' },
    blueprint_compliance: { unit: 'percentage', direction: 'higher_is_better', description: 'Routes matching FORGE spec / total FORGE routes' },
    debt_items: { unit: 'count', direction: 'neutral', description: 'Deliberate debt entries logged (tracking, not judging)' },
    sessions_per_phase: { unit: 'count', direction: 'lower_is_better', description: 'Sessions needed to complete a build phase' },
  },
  BEACON: {
    customers_acquired: { unit: 'count', direction: 'higher_is_better', description: 'Paying customers from launch campaign' },
    copy_revision_rounds: { unit: 'count', direction: 'lower_is_better', description: 'Rounds of copy revision before Casey approved' },
    vigil_language_usage: { unit: 'percentage', direction: 'higher_is_better', description: 'Copy using VIGIL customer language vs generic' },
  },
  SCRIBE: {
    content_on_schedule: { unit: 'percentage', direction: 'higher_is_better', description: 'Content published on calendar date / total scheduled' },
    casey_voice_match: { unit: 'binary', direction: 'higher_is_better', description: 'Content sounds like Casey, not generic AI' },
    revision_rounds: { unit: 'count', direction: 'lower_is_better', description: 'Rounds before publish-ready' },
  },
  LEDGER: {
    figures_sourced: { unit: 'percentage', direction: 'higher_is_better', description: 'Figures traceable to source document / total figures' },
    anomalies_caught: { unit: 'count', direction: 'higher_is_better', description: 'Cost anomalies flagged before they became problems' },
    projections_labeled: { unit: 'percentage', direction: 'higher_is_better', description: 'Projections with confidence levels / total projections' },
  },
};

// ─── Metric Storage ─────────────────────────────────────────────────────────

/**
 * Record a version-tagged metric snapshot for an agent
 */
function recordMetric(agent, version, taskId, metrics) {
  const agentDir = path.join(EVOLUTION_DIR, agent.toLowerCase());
  fs.mkdirSync(agentDir, { recursive: true });

  const snapshot = {
    agent: agent.toUpperCase(),
    version,
    taskId,
    timestamp: new Date().toISOString(),
    metrics, // { metric_name: value, ... }
  };

  const filename = `${version}_${Date.now()}.json`;
  fs.writeFileSync(
    path.join(agentDir, filename),
    JSON.stringify(snapshot, null, 2),
    'utf8'
  );

  return snapshot;
}

/**
 * Get all metric snapshots for an agent, optionally filtered by version
 */
function getSnapshots(agent, version = null) {
  const agentDir = path.join(EVOLUTION_DIR, agent.toLowerCase());
  if (!fs.existsSync(agentDir)) return [];

  const files = fs.readdirSync(agentDir).filter(f => f.endsWith('.json'));
  const snapshots = files.map(f => {
    try {
      return JSON.parse(fs.readFileSync(path.join(agentDir, f), 'utf8'));
    } catch { return null; }
  }).filter(Boolean);

  if (version) {
    return snapshots.filter(s => s.version === version);
  }

  return snapshots.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// ─── Version Comparison ─────────────────────────────────────────────────────

/**
 * Compare two versions of an agent across all recorded metrics
 * Returns delta for each metric and an overall verdict
 */
function compareVersions(agent, versionOld, versionNew) {
  const oldSnapshots = getSnapshots(agent, versionOld);
  const newSnapshots = getSnapshots(agent, versionNew);

  if (oldSnapshots.length === 0) {
    return { error: `No data for ${agent} ${versionOld}`, comparable: false };
  }
  if (newSnapshots.length === 0) {
    return { error: `No data for ${agent} ${versionNew}`, comparable: false };
  }

  const definitions = METRIC_DEFINITIONS[agent.toUpperCase()] || {};
  const comparison = {};
  let improvements = 0;
  let regressions = 0;
  let unchanged = 0;

  // Average each metric across snapshots
  const avgMetrics = (snapshots) => {
    const sums = {};
    const counts = {};
    for (const snap of snapshots) {
      for (const [key, value] of Object.entries(snap.metrics || {})) {
        if (typeof value === 'number') {
          sums[key] = (sums[key] || 0) + value;
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    }
    const avgs = {};
    for (const key of Object.keys(sums)) {
      avgs[key] = sums[key] / counts[key];
    }
    return avgs;
  };

  const oldAvg = avgMetrics(oldSnapshots);
  const newAvg = avgMetrics(newSnapshots);

  // Compare each metric
  const allKeys = new Set([...Object.keys(oldAvg), ...Object.keys(newAvg)]);
  for (const key of allKeys) {
    const oldVal = oldAvg[key];
    const newVal = newAvg[key];
    const def = definitions[key] || { direction: 'neutral' };

    if (oldVal === undefined || newVal === undefined) {
      comparison[key] = { oldVal, newVal, delta: null, verdict: 'NO_DATA' };
      continue;
    }

    const delta = newVal - oldVal;
    const deltaPercent = oldVal !== 0 ? (delta / oldVal) * 100 : (delta > 0 ? 100 : 0);

    let verdict = 'UNCHANGED';
    if (Math.abs(deltaPercent) < 1) {
      verdict = 'UNCHANGED';
      unchanged++;
    } else if (def.direction === 'higher_is_better') {
      verdict = delta > 0 ? 'IMPROVED' : 'REGRESSED';
    } else if (def.direction === 'lower_is_better') {
      verdict = delta < 0 ? 'IMPROVED' : 'REGRESSED';
    } else {
      verdict = 'CHANGED';
    }

    if (verdict === 'IMPROVED') improvements++;
    if (verdict === 'REGRESSED') regressions++;

    comparison[key] = {
      oldVal: Math.round(oldVal * 100) / 100,
      newVal: Math.round(newVal * 100) / 100,
      delta: Math.round(delta * 100) / 100,
      deltaPercent: Math.round(deltaPercent * 10) / 10,
      direction: def.direction,
      unit: def.unit,
      verdict,
    };
  }

  return {
    agent: agent.toUpperCase(),
    versionOld,
    versionNew,
    oldSampleSize: oldSnapshots.length,
    newSampleSize: newSnapshots.length,
    comparable: true,
    metrics: comparison,
    summary: { improvements, regressions, unchanged },
    overallVerdict: regressions > improvements ? 'REGRESSED' : improvements > regressions ? 'IMPROVED' : 'STABLE',
  };
}

// ─── Rollback Check ─────────────────────────────────────────────────────────

/**
 * Check if any agent's current version has regressed >10% on any metric
 * Returns a list of rollback candidates
 */
function checkRollbacks() {
  const candidates = [];

  for (const agent of Object.keys(METRIC_DEFINITIONS)) {
    const snapshots = getSnapshots(agent);
    if (snapshots.length < 2) continue;

    // Find unique versions
    const versions = [...new Set(snapshots.map(s => s.version))].sort();
    if (versions.length < 2) continue;

    const currentVersion = versions[versions.length - 1];
    const previousVersion = versions[versions.length - 2];

    const comparison = compareVersions(agent, previousVersion, currentVersion);
    if (!comparison.comparable) continue;

    // Check for >10% regression on any metric
    for (const [metric, data] of Object.entries(comparison.metrics)) {
      if (data.verdict === 'REGRESSED' && Math.abs(data.deltaPercent) > 10) {
        candidates.push({
          agent,
          currentVersion,
          previousVersion,
          metric,
          delta: data.deltaPercent,
          unit: data.unit,
          recommendation: `${agent} ${currentVersion} regressed ${Math.abs(data.deltaPercent)}% on ${metric}. Consider rollback to ${previousVersion}.`,
        });
      }
    }
  }

  return candidates;
}

// ─── Report Generation ──────────────────────────────────────────────────────

/**
 * Generate a full evolution report for all agents
 */
function generateReport() {
  const report = {
    generatedAt: new Date().toISOString(),
    agents: {},
    rollbackCandidates: checkRollbacks(),
  };

  for (const agent of Object.keys(METRIC_DEFINITIONS)) {
    const snapshots = getSnapshots(agent);
    const versions = [...new Set(snapshots.map(s => s.version))].sort();

    report.agents[agent] = {
      versions,
      totalSnapshots: snapshots.length,
      latestVersion: versions[versions.length - 1] || 'none',
    };

    if (versions.length >= 2) {
      const currentVersion = versions[versions.length - 1];
      const previousVersion = versions[versions.length - 2];
      report.agents[agent].comparison = compareVersions(agent, previousVersion, currentVersion);
    }
  }

  return report;
}

// ─── Exports ────────────────────────────────────────────────────────────────

module.exports = {
  METRIC_DEFINITIONS,
  recordMetric,
  getSnapshots,
  compareVersions,
  checkRollbacks,
  generateReport,
  EVOLUTION_DIR,
};

// ─── CLI ────────────────────────────────────────────────────────────────────

if (require.main === module) {
  const [,, command, ...args] = process.argv;

  if (command === 'report') {
    const report = generateReport();
    console.log(JSON.stringify(report, null, 2));
  } else if (command === 'record') {
    // node evolution.cjs record FORGE 2.0.0 task-id metric1=value1 metric2=value2
    const [agent, version, taskId, ...metricArgs] = args;
    const metrics = {};
    for (const arg of metricArgs) {
      const [key, val] = arg.split('=');
      metrics[key] = parseFloat(val);
    }
    const snap = recordMetric(agent, version, taskId, metrics);
    console.log('Recorded:', JSON.stringify(snap, null, 2));
  } else if (command === 'compare') {
    const [agent, vOld, vNew] = args;
    const result = compareVersions(agent, vOld, vNew);
    console.log(JSON.stringify(result, null, 2));
  } else if (command === 'rollback-check') {
    const candidates = checkRollbacks();
    if (candidates.length === 0) {
      console.log('No rollback candidates. All agents stable or improving.');
    } else {
      console.log('ROLLBACK CANDIDATES:');
      for (const c of candidates) {
        console.log(`  [WARNING] ${c.recommendation}`);
      }
    }
  } else {
    console.log('Usage: evolution.cjs <report|record|compare|rollback-check>');
  }
}
