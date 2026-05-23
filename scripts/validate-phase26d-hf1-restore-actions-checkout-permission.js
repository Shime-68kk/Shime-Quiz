#!/usr/bin/env node
/**
 * Phase 26D-HF1 Static Validator — Restore GitHub Actions Checkout Permission
 *
 * PHASE26D_HF1_CHECKOUT_PERMISSION_STATUS: COMPLETED_CI_HOTFIX
 * PHASE26D_HF1_CHECKOUT_PERMISSION_DECISION: RESTORE_ACTIONS_CHECKOUT_CONTENTS_READ_ONLY
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

const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;
const RELEASE_DOC = `docs/release/phase26d-hf1-restore-actions-checkout-permission-summary.md`;
const VALIDATOR = `scripts/validate-phase26d-hf1-restore-actions-checkout-permission.js`;

fileExists(CI_WORKFLOW)
  ? pass('CI workflow file exists')
  : fail('CI workflow file exists', `missing ${CI_WORKFLOW}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow: top-level permissions block ──────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

// Check permissions block exists with contents: read
const hasPermissionsBlock = /^permissions:\s*\n\s+contents:\s*read/m.test(ciContent);
hasPermissionsBlock
  ? pass('CI workflow has top-level permissions: contents: read')
  : fail('CI workflow must have top-level permissions: contents: read', 'missing or malformed permissions block');

// Ensure no duplicate permissions blocks
const permissionMatches = (ciContent.match(/^permissions:/mg) || []).length;
permissionMatches <= 1
  ? pass('CI workflow has at most one permissions block')
  : fail('CI workflow must not have duplicate permissions blocks', `found ${permissionMatches} occurrences`);

// ── 3. CI workflow: checkout action still present ────────────────────────────

ciContent.includes('actions/checkout@v4')
  ? pass('CI workflow still uses actions/checkout@v4')
  : fail('CI workflow must still use actions/checkout@v4');

// ── 4. CI workflow: Phase 26D-HF1 validator registered as active validator ───

ciContent.includes('validate-phase26d-hf1-restore-actions-checkout-permission')
  ? pass('CI registers Phase 26D-HF1 validator')
  : fail('CI registers Phase 26D-HF1 validator', 'e2e-smoke.yml does not reference validate-phase26d-hf1');

const activeValidatorLines = ciContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return false;
    return trimmed.includes('node scripts/validate-');
  })
  .join('\n');

activeValidatorLines.includes('validate-phase26d-hf1-restore-actions-checkout-permission')
  ? pass('Phase 26D-HF1 validator is an active (uncommented) step')
  : fail('Phase 26D-HF1 validator must be an active (uncommented) step in CI');

// ── 5. CI workflow: no continue-on-error: true ───────────────────────────────

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

// ── 6. CI workflow: no full validate-*.js glob loop ──────────────────────────

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js"`)
  : pass('CI does not run full validate-*.js glob loop');

// ── 7. CI workflow: prior phase validators not active merge-blocking gates ───

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
];

const priorPhaseViolations = PRIOR_PHASE_VALIDATOR_SLUGS.filter(slug =>
  activeValidatorLines.includes(slug)
);
priorPhaseViolations.length === 0
  ? pass('CI does not run Phase 24D through Phase 26D validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

// ── 8. Required doc tokens ───────────────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_TOKENS = [
  'PHASE26D_HF1_CHECKOUT_PERMISSION_STATUS: COMPLETED_CI_HOTFIX',
  'PHASE26D_HF1_CHECKOUT_PERMISSION_DECISION: RESTORE_ACTIONS_CHECKOUT_CONTENTS_READ_ONLY',
];

for (const token of REQUIRED_TOKENS) {
  releaseDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 9. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `.github/workflows/e2e-smoke.yml`,
  `docs/release/phase26d-hf1-restore-actions-checkout-permission-summary.md`,
  `scripts/validate-phase26d-hf1-restore-actions-checkout-permission.js`,
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
  'docs/testing/phase26d',
  'docs/release/phase26d-limited',
  'scripts/validate-phase26d-limited',
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
        `branch "${currentBranch}" has empty diff but is not main — no Phase 26D-HF1 changes committed`
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
        ? pass('No prior Phase 26D/26C/26B/26A/25N/25M/25K/25I files in diff')
        : fail('Prior phase files must not be changed', priorPhaseMatches.join(', '));

      const generatedArtifacts = changedFiles.filter(f =>
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

      const storageDriverFiles = changedFiles.filter(f =>
        f.includes('IndexedDB') || f.includes('StorageAdapter') || f.includes(`storage/driver`)
      );
      storageDriverFiles.length === 0
        ? pass('No storage driver files changed')
        : fail('Storage driver files must not be changed', storageDriverFiles.join(', '));

      const backupRestoreFiles = changedFiles.filter(f =>
        (f.includes('backup') || f.includes('restore') || f.includes('export')) &&
        !f.includes('phase26d-hf1')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 10. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26D-HF1');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26D-HF1');

// ── 11. No sync/cloud/account/auth/backend files changed ─────────────────────

const syncCloudPatterns = [
  /sync/i,
  /cloud/i,
  /account/i,
  /auth(?!or)/i,
  /backend/i,
];

const syncCloudFiles = changedFiles.filter(f =>
  syncCloudPatterns.some(p => p.test(f)) &&
  !f.includes('phase26d-hf1') &&
  !f.includes('e2e-smoke')
);
syncCloudFiles.length === 0
  ? pass('No sync/cloud/account/auth/backend files changed')
  : fail('sync/cloud/account/auth/backend files must not be changed', syncCloudFiles.join(', '));

// ── 12. No telemetry/analytics files added ────────────────────────────────────

const telemetryFiles = changedFiles.filter(f =>
  f.includes('telemetry') || f.includes('analytics') || f.includes('tracking')
);
telemetryFiles.length === 0
  ? pass('No telemetry/analytics files changed')
  : fail('Telemetry/analytics files must not be changed', telemetryFiles.join(', '));

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
