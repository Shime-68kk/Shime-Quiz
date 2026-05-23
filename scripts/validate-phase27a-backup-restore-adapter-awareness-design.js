#!/usr/bin/env node
/**
 * Phase 27A Static Validator — Backup/Export/Restore Adapter-Awareness Design Gate
 *
 * PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE
 * PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DECISION: PASS_TO_PHASE27B_ADAPTER_AWARENESS_EVIDENCE_AND_RUNTIME_DESIGN_REVIEW
 * PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
 *
 * Static analysis only. No imports of runtime modules.
 * Reads files as text and checks content.
 * Exit code 0 = all checks pass. Exit code 1 = one or more checks fail.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let allPass = true;

function pass(label) {
  console.log(`PASS  ${label}`);
}

function fail(label, detail = '') {
  console.log(`FAIL  ${label}${detail ? ' — ' + detail : ''}`);
  allPass = false;
}

function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ── 1. Required files exist ──────────────────────────────────────────────────

const PLANNING_DOC = `docs/planning/phase27a-backup-restore-adapter-awareness-design.md`;
const TESTING_DOC = `docs/testing/phase27a-backup-restore-adapter-awareness-run-pack.md`;
const RELEASE_DOC = `docs/release/phase27a-backup-restore-adapter-awareness-design-summary.md`;
const VALIDATOR = `scripts/validate-phase27a-backup-restore-adapter-awareness-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(PLANNING_DOC)
  ? pass('Planning/design doc exists')
  : fail('Planning/design doc exists', `missing ${PLANNING_DOC}`);

fileExists(TESTING_DOC)
  ? pass('Testing/run-pack doc exists')
  : fail('Testing/run-pack doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass('CI workflow exists')
  : fail('CI workflow exists', `missing ${CI_WORKFLOW}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase27a-backup-restore-adapter-awareness-design')
  ? pass('CI registers Phase 27A validator')
  : fail('CI registers Phase 27A validator', 'e2e-smoke.yml does not reference validate-phase27a');

(ciContent.includes('Fetch origin main for Phase 27A validator') ||
  ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step before Phase 27A validator')
  : fail('CI has explicit fetch step before Phase 27A validator', 'missing fetch step before Phase 27A validator');

const PRIOR_PHASE_VALIDATOR_SLUGS = [
  'validate-phase24d',
  'validate-phase24e',
  'validate-phase24f',
  'validate-phase24g',
  'validate-phase24h',
  'validate-phase25a',
  'validate-phase25b',
  'validate-phase25c',
  'validate-phase25d',
  'validate-phase25e',
  'validate-phase25f',
  'validate-phase25g',
  'validate-phase25h',
  'validate-phase25i',
  'validate-phase25j',
  'validate-phase25k',
  'validate-phase25l',
  'validate-phase25m',
  'validate-phase25n',
  'validate-phase26a',
  'validate-phase26b',
  'validate-phase26c',
  'validate-phase26d-limited',
  'validate-phase26d-hf1',
  'validate-phase26e',
];

const activeValidatorLines = ciContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return false;
    return trimmed.includes('node scripts/validate-');
  })
  .join('\n');

const priorPhaseViolations = PRIOR_PHASE_VALIDATOR_SLUGS.filter(slug =>
  activeValidatorLines.includes(slug)
);
priorPhaseViolations.length === 0
  ? pass('CI does not run Phase 24D through Phase 26E validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js" in CI`)
  : pass('CI does not run full validate-*.js glob loop');

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

// ── 3. Required tokens in docs ───────────────────────────────────────────────

const planningDocContent = readFile(PLANNING_DOC) || '';
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const allDocContent = planningDocContent + '\n' + testingDocContent + '\n' + releaseDocContent;

const PHASE27A_TOKENS = [
  'PHASE27A_LOCAL_FIRST_HYBRID_DIRECTION_STATUS: COMPLETED_DIRECTION_CHOICE',
  'PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE27A_BACKUP_RESTORE_ADAPTER_AWARENESS_DECISION: PASS_TO_PHASE27B_ADAPTER_AWARENESS_EVIDENCE_AND_RUNTIME_DESIGN_REVIEW',
  'PHASE27A_ADAPTER_AWARENESS_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
];

for (const token of PHASE27A_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required headings in planning/design doc ──────────────────────────────

const REQUIRED_PLANNING_HEADINGS = [
  '# Phase 27A — Backup/Export/Restore Adapter-Awareness Design Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 26E',
  '## Direction choice',
  '## Purpose',
  '## Adapter-awareness problem statement',
  '## Current evidence boundary',
  '## Future adapter-aware signal candidates',
  '## Allowed future signals',
  '## Forbidden future signals',
  '## Backup/export boundary',
  '## Restore/import boundary',
  '## Storage driver boundary',
  '## Data safety and no-data-loss guardrails',
  '## Generated/test data only rule',
  '## Manual/browser evidence boundary',
  '## Runtime implementation boundary',
  '## Rollback/removal plan for future runtime phases',
  '## Phase 27B framing',
  '## What Phase 27A can claim',
  '## What Phase 27A must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Planning doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Planning doc heading missing', `"${heading}"`);
}

// ── 5. Required headings in testing/run-pack doc ─────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 27A — Backup/Export/Restore Adapter-Awareness Run Pack',
  '## Status token',
  '## Scope',
  '## Run-pack status',
  '## Purpose',
  '## Phase 27B evidence matrix',
  '## Data safety rules',
  '## Manual/browser evidence boundary',
  '## Adapter-awareness design review checks',
  '## Pass/fail criteria for Phase 27B',
  '## Failure/anomaly recording',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 6. Required headings in release/summary doc ──────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27A — Backup/Export/Restore Adapter-Awareness Design Summary',
  '## Status tokens',
  '## Scope',
  '## Direction choice',
  '## Design decision',
  '## Run-pack status',
  '## What is allowed next',
  '## What is not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 7. Direction choice documented ───────────────────────────────────────────

planningDocContent.includes('backup/export/restore adapter-awareness design as the next local-first hybrid direction')
  ? pass('Planning doc states direction choice: backup/export/restore adapter-awareness design')
  : fail('Planning doc must state direction choice: backup/export/restore adapter-awareness design');

allDocContent.includes('COMPLETED_DIRECTION_CHOICE')
  ? pass('Docs contain COMPLETED_DIRECTION_CHOICE token')
  : fail('Docs must contain COMPLETED_DIRECTION_CHOICE token');

// ── 8. Allowed future signals documented ─────────────────────────────────────

const ALLOWED_FUTURE_SIGNALS = [
  'storage adapter identity',
  'export source metadata',
  'restore target adapter compatibility warning',
  'generated/test restore rehearsal evidence',
  'unavailable/unknown adapter state',
];

for (const signal of ALLOWED_FUTURE_SIGNALS) {
  allDocContent.toLowerCase().includes(signal.toLowerCase())
    ? pass(`Allowed future signal documented: "${signal}"`)
    : fail('Allowed future signal missing', `"${signal}"`);
}

// ── 9. Forbidden future signals documented ───────────────────────────────────

const FORBIDDEN_FUTURE_SIGNALS = [
  'scanning learner content',
  'reading external backup files without explicit user action',
  'OS/platform backup',
  'cloud/account/backend',
  'telemetry',
  'persistent tracking added only to calculate health',
  'automatic backup detection',
  'platform backup preservation claim',
  'guaranteed data-loss prevention claim',
  'backup file format change without separate',
  'restore overwrite behavior change without separate',
  'storage migration without separate',
];

for (const signal of FORBIDDEN_FUTURE_SIGNALS) {
  allDocContent.toLowerCase().includes(signal.toLowerCase())
    ? pass(`Forbidden future signal documented: "${signal.slice(0, 60)}"`)
    : fail('Forbidden future signal missing', `"${signal}"`);
}

// ── 10. Run pack PREPARED_NOT_EXECUTED — no execution claim ──────────────────

testingDocContent.includes('PREPARED_NOT_EXECUTED')
  ? pass('Run pack contains PREPARED_NOT_EXECUTED token')
  : fail('Run pack must contain PREPARED_NOT_EXECUTED token');

testingDocContent.includes('No evidence has been executed')
  ? pass('Run pack states no evidence executed in Phase 27A')
  : fail('Run pack must state no evidence executed in Phase 27A');

const FORBIDDEN_EXECUTION_CLAIMS = [
  'EXECUTED_PHASE27A',
  'evidence executed in Phase 27A',
  'run pack executed',
  'evidence collected in Phase 27A',
];

for (const claim of FORBIDDEN_EXECUTION_CLAIMS) {
  allDocContent.toLowerCase().includes(claim.toLowerCase())
    ? fail(`Docs must not claim run pack execution: "${claim}"`)
    : pass(`Docs do not claim run pack execution: "${claim.slice(0, 60)}"`);
}

// ── 11. Evidence matrix columns present ──────────────────────────────────────

const REQUIRED_MATRIX_COLUMNS = [
  'Evidence area',
  'Command/check',
  'Data requirement',
  'Expected result',
  'Observed result',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_MATRIX_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence matrix column present: "${col}"`)
    : fail('Evidence matrix column missing', `"${col}"`);
}

// ── 12. Evidence matrix rows present ─────────────────────────────────────────

const REQUIRED_MATRIX_ROWS = [
  'current backup/export behavior unchanged',
  'current restore/import behavior unchanged',
  'current storage driver behavior unchanged',
  'backup file format unchanged',
  'restore overwrite behavior unchanged',
  'adapter identity candidate review',
  'export metadata candidate review',
  'restore compatibility warning candidate review',
  'generated/test data restore rehearsal plan',
  'manual/browser evidence plan',
  'no learner content scanning',
  'no external file reads without explicit user action',
  'no telemetry/analytics',
  'rollback/removal plan',
];

for (const row of REQUIRED_MATRIX_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence matrix row present: "${row.slice(0, 60)}"`)
    : fail('Evidence matrix row missing', `"${row}"`);
}

// ── 13. NOT_RUN_PHASE27A_PREPARED_ONLY in evidence matrix ────────────────────

testingDocContent.includes('NOT_RUN_PHASE27A_PREPARED_ONLY')
  ? pass('Evidence matrix contains NOT_RUN_PHASE27A_PREPARED_ONLY observed results')
  : fail('Evidence matrix must contain NOT_RUN_PHASE27A_PREPARED_ONLY observed results');

// ── 14. Phase 27B framing documented ─────────────────────────────────────────

const PHASE27B_FRAMING_REQUIRED = [
  'Next recommended phase: Phase 27B',
  'Phase 27B is a separate evidence/design review gate and is not automatically approved',
  'Phase 27A does not approve runtime backup/export/restore changes',
  'Phase 27A does not approve backup file format changes',
  'Phase 27A does not approve restore overwrite behavior changes',
  'Phase 27A does not approve storage migration',
  'Phase 27A does not approve production adapter-aware backup/export/restore',
  'Phase 27A does not approve BETA_READY',
];

for (const stmt of PHASE27B_FRAMING_REQUIRED) {
  allDocContent.includes(stmt)
    ? pass(`Phase 27B framing present: "${stmt.slice(0, 70)}"`)
    : fail('Phase 27B framing missing', `"${stmt}"`);
}

// ── 15. Must-not-claim boundaries in docs ────────────────────────────────────

const MUST_NOT_CLAIM_TERMS = [
  'backup/export/restore adapter-awareness design',
  'backup file format',
  'restore overwrite behavior',
  'storage migration',
  'adapter-aware backup',
  'local-first hybrid readiness',
  'BETA_READY',
  'guaranteed data-loss prevention',
  'broad backup reliability',
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  allDocContent.includes(term)
    ? pass(`Must-not-claim boundary present in docs: "${term.slice(0, 60)}"`)
    : fail('Must-not-claim boundary missing from docs', `"${term}"`);
}

// ── 16. Required guardrail statements ────────────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Production backup/export/restore behavior remains unchanged by this patch.',
  'Backup file format remains unchanged.',
  'Restore overwrite behavior remains unchanged.',
  'Current localStorage backup compatibility remains unchanged.',
  'Default storage driver remains unchanged.',
  'No IndexedDB.',
  'No storage migration.',
  'No sync/cloud/account/auth/backend.',
  'No telemetry or analytics.',
  'No BETA_READY.',
  'Historical full-chain validators remain manual/local/scheduled audit guidance.',
  'Full historical scripts/validate-*.js chain is not used as a Phase 27A merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 17. Docs do not claim BETA_READY, production implementation, etc. ─────────

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production adapter-aware backup approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'storage migration approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
  'runtime adapter-awareness implemented',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? fail(`Docs must not claim: "${phrase}"`)
    : pass(`Docs do not claim: "${phrase.slice(0, 60)}"`);
}

// ── 18. Exact changed-file check via git ─────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/planning/phase27a-backup-restore-adapter-awareness-design.md`,
  `docs/testing/phase27a-backup-restore-adapter-awareness-run-pack.md`,
  `docs/release/phase27a-backup-restore-adapter-awareness-design-summary.md`,
  `scripts/validate-phase27a-backup-restore-adapter-awareness-design.js`,
  `.github/workflows/e2e-smoke.yml`,
]);

const FORBIDDEN_CHANGED_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^sw\.js$/,
  /^boot-guard\.js$/,
  /^docs\/adr\//,
  /node_modules/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
];

const FORBIDDEN_PRIOR_PHASE_FILES = [
  'docs/testing/phase26e',
  'docs/release/phase26e',
  'scripts/validate-phase26e',
  'docs/testing/phase26d',
  'docs/release/phase26d',
  'scripts/validate-phase26d',
  'docs/testing/phase26c',
  'docs/release/phase26c',
  'scripts/validate-phase26c',
  'docs/testing/phase26b',
  'docs/release/phase26b',
  'scripts/validate-phase26b',
  'docs/testing/phase26a',
  'docs/release/phase26a',
  'scripts/validate-phase26a',
  'docs/testing/phase25n',
  'docs/release/phase25n',
  'scripts/validate-phase25n',
  'docs/testing/phase25m',
  'docs/release/phase25m',
  'scripts/validate-phase25m',
  'docs/testing/phase25k',
  'docs/release/phase25k',
  'scripts/validate-phase25k',
  'docs/testing/phase25i',
  'docs/release/phase25i',
  'scripts/validate-phase25i',
];

let changedFiles = [];
let diffEmpty = false;
let onMain = false;
let fetchError = false;

try {
  execSync(`git fetch origin refs/heads/main:refs/remotes/origin/main --prune`, {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (e) {
  fetchError = true;
  fail('origin/main fetch', `git fetch failed: ${e.message}`);
}

if (!fetchError) {
  pass('Validator explicitly fetches origin/main');

  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    onMain = currentBranch === 'main';

    const diffOutput = execSync('git diff origin/main..HEAD --name-only', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();

    changedFiles = diffOutput ? diffOutput.split('\n').filter(Boolean) : [];
    diffEmpty = changedFiles.length === 0;

    pass('git diff origin/main..HEAD uses double-dot (not triple-dot)');

    if (diffEmpty && !onMain) {
      fail(
        'Exact changed-file check: non-main empty diff must fail',
        `branch "${currentBranch}" has empty diff but is not main — no Phase 27A changes committed`
      );
    } else if (diffEmpty && onMain) {
      pass('Exact changed-file check: post-merge main with empty diff — content guardrails enforced, file-list check skipped');
    } else {
      const unexpectedFiles = changedFiles.filter(f => !ALLOWED_CHANGED_FILES.has(f));
      const missingAllowed = [...ALLOWED_CHANGED_FILES].filter(f => !changedFiles.includes(f));
      const forbiddenPatternMatches = changedFiles.filter(f =>
        FORBIDDEN_CHANGED_PATTERNS.some(p => p.test(f))
      );

      unexpectedFiles.length === 0
        ? pass('Changed files are a subset of allowed files')
        : fail('Unexpected changed files', unexpectedFiles.join(', '));

      missingAllowed.length === 0
        ? pass('All allowed files are present in the diff')
        : fail('Missing expected changed files', missingAllowed.join(', '));

      forbiddenPatternMatches.length === 0
        ? pass('No forbidden-pattern files in diff')
        : fail('Forbidden-pattern files found in diff', forbiddenPatternMatches.join(', '));

      const priorPhaseMatches = changedFiles.filter(f =>
        FORBIDDEN_PRIOR_PHASE_FILES.some(prior => f.includes(prior))
      );
      priorPhaseMatches.length === 0
        ? pass('No prior Phase 26E/26D/26C/26B/26A/25N/25M/25K/25I files in diff')
        : fail('Prior phase files must not be changed', priorPhaseMatches.join(', '));

      const generatedArtifacts = changedFiles.filter(
        f =>
          f.startsWith(`node_modules/`) ||
          f.startsWith(`dist/`) ||
          f.startsWith(`coverage/`) ||
          f.startsWith(`test-results/`) ||
          f.startsWith(`playwright-report/`) ||
          f === 'FETCH_HEAD'
      );
      generatedArtifacts.length === 0
        ? pass('No generated artifacts in changed files')
        : fail('Generated artifacts found in changed files', generatedArtifacts.join(', '));

      const storageDriverFiles = changedFiles.filter(
        f => f.includes('IndexedDB') || f.includes('StorageAdapter') || f.includes(`storage/driver`)
      );
      storageDriverFiles.length === 0
        ? pass('No storage driver files changed')
        : fail('Storage driver files must not be changed', storageDriverFiles.join(', '));

      const backupRestoreFiles = changedFiles.filter(
        f =>
          (f.includes('backup') || f.includes('restore') || f.includes('export')) &&
          !f.includes('phase27a')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27a') &&
          !f.includes('e2e-smoke')
      );
      syncCloudFiles.length === 0
        ? pass('No sync/cloud/backend files changed')
        : fail('sync/cloud/backend files must not be changed', syncCloudFiles.join(', '));

      const telemetryFiles = changedFiles.filter(
        f => f.includes('telemetry') || f.includes('analytics') || f.includes('tracking')
      );
      telemetryFiles.length === 0
        ? pass('No telemetry/analytics files changed')
        : fail('Telemetry/analytics files must not be changed', telemetryFiles.join(', '));

      const runtimeSourceFiles = changedFiles.filter(
        f => f.startsWith(`src/`) || f.startsWith(`tests/`) || f.startsWith(`e2e/`)
      );
      runtimeSourceFiles.length === 0
        ? pass('No runtime/source/test/e2e files changed')
        : fail('Runtime/source/test/e2e files must not be changed', runtimeSourceFiles.join(', '));

      const adrFiles = changedFiles.filter(f => f.startsWith(`docs/adr/`));
      adrFiles.length === 0
        ? pass('No ADR files changed')
        : fail('ADR files must not be changed', adrFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 19. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27A');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27A');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
