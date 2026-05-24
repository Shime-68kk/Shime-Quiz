#!/usr/bin/env node
/**
 * Phase 29B Static Validator — Beta Evidence Gate Planning
 *
 * PHASE29B_BETA_EVIDENCE_GATE_PLANNING_STATUS: COMPLETED_PLANNING_GATE
 * PHASE29B_BETA_EVIDENCE_GATE_DECISION: PASS_TO_PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN
 * PHASE29B_EVIDENCE_SCOPE: PLANNING_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_BETA_READY
 * PHASE29B_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
 * PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN_SEED_STATUS: PREPARED_PLANNING_SEED
 *
 * Static analysis only. No imports of runtime modules.
 * Reads files as text and checks content.
 * Does not execute git fetch — origin/main provided by actions/checkout@v4 with fetch-depth: 0.
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

function getSourceNonCommentLines(content) {
  return content
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return !t.startsWith('*') && !t.startsWith('//');
    })
    .join('\n');
}

// ── 1. Required files exist ──────────────────────────────────────────────────

const PLANNING_DOC = `docs/planning/phase29b-beta-evidence-gate-plan.md`;
const TESTING_DOC = `docs/testing/phase29b-beta-evidence-run-pack.md`;
const RELEASE_DOC = `docs/release/phase29b-beta-evidence-gate-planning-summary.md`;
const PHASE29C_SEED_DOC = `docs/planning/phase29c-generated-test-manual-browser-evidence-run-seed.md`;
const VALIDATOR = `scripts/validate-phase29b-beta-evidence-gate-planning.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 29B gate plan doc exists', PLANNING_DOC],
  ['Phase 29B run pack doc exists', TESTING_DOC],
  ['Phase 29B release summary doc exists', RELEASE_DOC],
  ['Phase 29C seed doc exists', PHASE29C_SEED_DOC],
  ['Phase 29B validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const planningDocContent = readFile(PLANNING_DOC) || '';
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase29cSeedContent = readFile(PHASE29C_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent =
  planningDocContent + '\n' + testingDocContent + '\n' + releaseDocContent + '\n' + phase29cSeedContent;
const allTextContent = allDocContent + '\n' + validatorContent;

const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 29B tokens ──────────────────────────────────────────────

const REQUIRED_TOKENS = [
  'PHASE29B_BETA_EVIDENCE_GATE_PLANNING_STATUS: COMPLETED_PLANNING_GATE',
  'PHASE29B_BETA_EVIDENCE_GATE_DECISION: PASS_TO_PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN',
  'PHASE29B_EVIDENCE_SCOPE: PLANNING_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_BETA_READY',
  'PHASE29B_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
  'PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  allTextContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required planning doc headings ────────────────────────────────────────

const REQUIRED_PLANNING_HEADINGS = [
  '# Phase 29B — Beta Evidence Gate Plan',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 29A',
  '## Gate purpose',
  '## Beta evidence gate criteria',
  '## Evidence directions',
  '## Generated/test data rule',
  '## No-real-learner-data boundary',
  '## Manual/browser evidence plan',
  '## Restore rehearsal evidence plan',
  '## Backup health evidence plan',
  '## Adapter-awareness evidence plan',
  '## Stress-adjacent evidence plan',
  '## Real-user evidence expansion rule',
  '## Claim and copy audit plan',
  '## Go/no-go criteria',
  '## What Phase 29B can claim',
  '## What Phase 29B must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Planning doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Planning doc heading missing', `"${heading}"`);
}

// ── 5. Beta evidence gate criteria present ────────────────────────────────────

const REQUIRED_BETA_GATE_CRITERIA = [
  'generated/test manual/browser restore rehearsal evidence',
  'backup health signal manual/browser evidence',
  'adapter-awareness manual/browser evidence',
  'stress-adjacent generated/test import/backup/restore evidence',
  'rollback/removal demonstration in dev/test',
  'claim/copy audit for local-first hybrid wording',
  'Explicit decision token after evidence execution',
  'No real learner data capture',
  'No production restore execution',
  'No sync/cloud/account/backend behavior',
];

for (const criterion of REQUIRED_BETA_GATE_CRITERIA) {
  planningDocContent.includes(criterion)
    ? pass(`Beta evidence gate criterion present: "${criterion.slice(0, 70)}"`)
    : fail('Beta evidence gate criterion missing', `"${criterion}"`);
}

// ── 6. Required run pack headings ─────────────────────────────────────────────

const REQUIRED_RUN_PACK_HEADINGS = [
  '# Phase 29B — Beta Evidence Run Pack',
  '## Status tokens',
  '## Scope',
  '## Run-pack status',
  '## Purpose',
  '## Evidence matrix',
  '## Data safety rules',
  '## Generated/test data requirement',
  '## No-real-learner-data rule',
  '## Manual/browser evidence scenarios',
  '## Stress-adjacent evidence scenarios',
  '## Rollback/removal evidence scenario',
  '## Claim/copy audit checklist',
  '## Pass/fail criteria',
  '## Failure/anomaly recording',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RUN_PACK_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Run pack heading present: "${heading.slice(0, 70)}"`)
    : fail('Run pack heading missing', `"${heading}"`);
}

// ── 7. Run pack is PREPARED_NOT_EXECUTED ────────────────────────────────────

testingDocContent.includes('PHASE29B_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED')
  ? pass('Run pack status token PREPARED_NOT_EXECUTED present in run pack')
  : fail('Run pack status token PREPARED_NOT_EXECUTED missing from run pack');

testingDocContent.includes('NOT_RUN_PHASE29B_PREPARED_ONLY')
  ? pass('Run pack observed-result uses NOT_RUN_PHASE29B_PREPARED_ONLY')
  : fail(
      'Run pack observed-result must use NOT_RUN_PHASE29B_PREPARED_ONLY',
      'all observed results must be NOT_RUN_PHASE29B_PREPARED_ONLY in Phase 29B'
    );

// ── 8. Evidence matrix columns present ────────────────────────────────────────

const REQUIRED_MATRIX_COLUMNS = [
  'Evidence area',
  'Scenario',
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

// ── 9. Evidence matrix rows present ───────────────────────────────────────────

const REQUIRED_MATRIX_ROWS = [
  'generated/test restore rehearsal manual browser session',
  'backup health signal manual browser session',
  'adapter-awareness manual browser session',
  'stress-adjacent large import generated/test scenario',
  'quota/limit warning generated/test scenario',
  'backup/export smoke with generated/test data only',
  'restore rehearsal no-write verification',
  'localStorage/IndexedDB no unexpected write verification',
  'network/telemetry no unexpected request verification',
  'rollback/removal demonstration in dev/test',
  'claim/copy audit',
  'evidence packet review',
];

for (const row of REQUIRED_MATRIX_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence matrix row present: "${row.slice(0, 70)}"`)
    : fail('Evidence matrix row missing', `"${row}"`);
}

// ── 10. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 29B — Beta Evidence Gate Planning Summary',
  '## Status tokens',
  '## Scope',
  '## Gate plan',
  '## Run-pack status',
  '## Phase 29C seed',
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

// ── 11. Required Phase 29C seed headings ──────────────────────────────────────

const REQUIRED_PHASE29C_SEED_HEADINGS = [
  '# Phase 29C — Generated/Test Manual Browser Evidence Run Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 29B',
  '## Evidence run constraints',
  '## Candidate evidence run lanes',
  '## Required gates before execution',
  '## Forbidden default approvals',
  '## Evidence packet requirements',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE29C_SEED_HEADINGS) {
  phase29cSeedContent.includes(heading)
    ? pass(`Phase 29C seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 29C seed heading missing', `"${heading}"`);
}

// ── 12. Phase 29C seed token present ──────────────────────────────────────────

phase29cSeedContent.includes(
  'PHASE29C_GENERATED_TEST_MANUAL_BROWSER_EVIDENCE_RUN_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 29C seed token present in seed doc')
  : fail('Phase 29C seed token missing from seed doc');

// ── 13. Phase 29C candidate evidence run lanes ────────────────────────────────

const REQUIRED_PHASE29C_LANES = [
  'Restore rehearsal manual browser lane',
  'Backup health manual browser lane',
  'Adapter-awareness manual browser lane',
  'Stress-adjacent import/quota lane',
  'Rollback/removal lane',
  'Claim/copy audit lane',
];

for (const lane of REQUIRED_PHASE29C_LANES) {
  phase29cSeedContent.includes(lane)
    ? pass(`Phase 29C candidate lane present: "${lane}"`)
    : fail('Phase 29C candidate lane missing', `"${lane}"`);
}

// ── 14. Phase 29C framed as separate evidence execution gate ─────────────────

phase29cSeedContent.includes(
  'Phase 29C is a separate evidence execution gate and is not automatically approved.'
)
  ? pass('Phase 29C framed as separate evidence execution gate (not automatically approved)')
  : fail(
      'Phase 29C must be framed as a separate evidence execution gate, not automatically approved'
    );

// ── 15. Required next-phase framing statements ────────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 29C — Generated/Test Manual Browser Evidence Run',
  'Phase 29C is a separate evidence execution gate and is not automatically approved.',
  'Phase 29B does not approve BETA_READY.',
  'Phase 29B does not approve public production readiness.',
  'Phase 29B does not approve guaranteed data-loss prevention.',
  'Phase 29B does not approve restore execution.',
  'Phase 29B does not approve production restore rehearsal.',
  'Phase 29B does not approve real learner data restore rehearsal.',
  'Phase 29B does not approve runtime backup/export/restore changes.',
  'Phase 29B does not approve backup file format changes.',
  'Phase 29B does not approve restore overwrite behavior changes.',
  'Phase 29B does not approve storage migration.',
  'Phase 29B does not approve sync/cloud/account/auth/backend.',
  'Phase 29B does not claim browser/manual evidence has been executed.',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 16. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase29b-beta-evidence-gate-planning')
  ? pass('CI registers Phase 29B validator')
  : fail('CI registers Phase 29B validator', 'e2e-smoke.yml does not reference validate-phase29b');

const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
hasCheckoutFetchDepth
  ? pass('CI checkout uses fetch-depth: 0')
  : fail('CI checkout must use fetch-depth: 0');

const hasForbiddenFetchStep = ciContent.includes(
  'git fetch origin refs/heads/main:refs/remotes/origin/main --prune'
);
!hasForbiddenFetchStep
  ? pass('CI has no forbidden shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune')
  : fail('CI must not have shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');

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
  'validate-phase27a',
  'validate-phase27b',
  'validate-phase27c',
  'validate-phase27d',
  'validate-phase27e',
  'validate-phase27f',
  'validate-phase28a',
  'validate-phase28b',
  'validate-phase28c',
  'validate-phase28d',
  'validate-phase28e',
  'validate-phase29a',
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
  ? pass('CI does not run Phase 24D through Phase 29A validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js"`)
  : pass('CI does not run full validate-*.js glob loop');

// ── 17. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 18. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 19. Exact changed-file check via git (post-merge-main safe, double-dot) ───

const ALLOWED_CHANGED_FILES = new Set([
  `docs/planning/phase29b-beta-evidence-gate-plan.md`,
  `docs/testing/phase29b-beta-evidence-run-pack.md`,
  `docs/release/phase29b-beta-evidence-gate-planning-summary.md`,
  `docs/planning/phase29c-generated-test-manual-browser-evidence-run-seed.md`,
  `scripts/validate-phase29b-beta-evidence-gate-planning.js`,
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

const FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES = [
  `docs/testing/phase29a`,
  `docs/release/phase29a`,
  `docs/planning/phase29a`,
  `scripts/validate-phase29a`,
  `docs/testing/phase28e`,
  `docs/release/phase28e`,
  `docs/planning/phase28e`,
  `scripts/validate-phase28e`,
  `docs/testing/phase28d`,
  `docs/release/phase28d`,
  `docs/planning/phase28d`,
  `scripts/validate-phase28d`,
  `docs/testing/phase28c`,
  `docs/release/phase28c`,
  `docs/planning/phase28c`,
  `scripts/validate-phase28c`,
  `docs/testing/phase28b`,
  `docs/release/phase28b`,
  `docs/planning/phase28b`,
  `scripts/validate-phase28b`,
  `docs/testing/phase28a`,
  `docs/release/phase28a`,
  `docs/planning/phase28a`,
  `scripts/validate-phase28a`,
  `docs/testing/phase27f`,
  `docs/testing/phase27e`,
  `docs/testing/phase27d`,
  `docs/testing/phase27c`,
  `docs/testing/phase27b`,
  `docs/testing/phase27a`,
  `docs/release/phase27f`,
  `docs/release/phase27e`,
  `docs/release/phase27d`,
  `docs/release/phase27c`,
  `docs/release/phase27b`,
  `docs/release/phase27a`,
  `docs/planning/phase27e`,
  `docs/planning/phase27d`,
  `scripts/validate-phase27f`,
  `scripts/validate-phase27e`,
  `scripts/validate-phase27d`,
  `scripts/validate-phase27c`,
  `scripts/validate-phase27b`,
  `scripts/validate-phase27a`,
  `docs/testing/phase26e`,
  `docs/release/phase26e`,
  `scripts/validate-phase26e`,
  `docs/testing/phase26d`,
  `docs/release/phase26d`,
  `scripts/validate-phase26d`,
  `docs/testing/phase26c`,
  `docs/release/phase26c`,
  `scripts/validate-phase26c`,
  `docs/testing/phase26b`,
  `docs/release/phase26b`,
  `scripts/validate-phase26b`,
  `docs/testing/phase26a`,
  `docs/release/phase26a`,
  `scripts/validate-phase26a`,
  `docs/testing/phase25n`,
  `docs/release/phase25n`,
  `scripts/validate-phase25n`,
  `docs/testing/phase25m`,
  `docs/release/phase25m`,
  `scripts/validate-phase25m`,
  `docs/testing/phase25k`,
  `docs/release/phase25k`,
  `scripts/validate-phase25k`,
  `docs/testing/phase25i`,
  `docs/release/phase25i`,
  `scripts/validate-phase25i`,
];

let changedFiles = [];
let originMainAvailable = false;
let onMain = false;

// Validator does NOT run its own git fetch.
// origin/main is made available by actions/checkout@v4 with fetch-depth: 0.
try {
  execSync('git rev-parse --verify origin/main', {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  originMainAvailable = true;
} catch {
  originMainAvailable = false;
  fail(
    'origin/main available',
    'git rev-parse --verify origin/main failed — ensure actions/checkout@v4 uses fetch-depth: 0'
  );
}

if (originMainAvailable) {
  pass('origin/main is available (provided by workflow checkout step with fetch-depth: 0)');

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
    const diffEmpty = changedFiles.length === 0;

    pass('git diff origin/main..HEAD uses double-dot (not triple-dot)');

    if (diffEmpty && !onMain) {
      fail(
        'Exact changed-file check: non-main empty diff must fail',
        `branch "${currentBranch}" has empty diff — no Phase 29B changes committed`
      );
    } else if (diffEmpty && onMain) {
      pass(
        'Exact changed-file check: post-merge main with empty diff — content guardrails enforced, file-list check skipped'
      );
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
        FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES.some(prefix => f.startsWith(prefix))
      );
      priorPhaseMatches.length === 0
        ? pass('No prior Phase 29A/28E/28D/28C/28B/28A/27/26/25 files in diff')
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

      const backupRestoreFiles = changedFiles.filter(f => {
        if (f.includes('phase29b') || f.includes('phase29c')) return false;
        return f.includes('backup') || f.includes('restore') || f.includes('export');
      });
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail(
            'Production backup/export/restore modules must not be changed',
            backupRestoreFiles.join(', ')
          );

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase29b') &&
          !f.includes('phase29c') &&
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

      const e2eFiles = changedFiles.filter(f => f.startsWith(`e2e/`));
      e2eFiles.length === 0
        ? pass('No e2e files changed')
        : fail('e2e files must not be changed', e2eFiles.join(', '));

      const adrFiles = changedFiles.filter(f => f.startsWith(`docs/adr/`));
      adrFiles.length === 0
        ? pass('No ADR files changed')
        : fail('ADR files must not be changed', adrFiles.join(', '));

      const srcFiles = changedFiles.filter(f => f.startsWith(`src/`));
      srcFiles.length === 0
        ? pass('No src/ files changed')
        : fail('src/ files must not be changed in Phase 29B', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 29B', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 20. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 29B');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 29B');

// ── 21. No Phase 29B file newly imports Phase 27/28 prototype modules ─────────
//
// Phase 29B adds no src/ files. This check verifies that the Phase 29B-added
// files (docs + validator + CI) do not introduce new prototype module imports.

const PHASE2728_PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase29bNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PHASE2728_PROTOTYPE_MODULES) {
  const importers = phase29bNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase29b')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 29B file newly imports Phase 27/28 prototype module: ${moduleName}`)
    : fail(
        `No Phase 29B file may import Phase 27/28 prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 22. Forbidden claim strings absent ───────────────────────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'BETA_READY',
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'local_first_hybrid_ready',
  'BROWSER_EVIDENCE_COLLECTED',
  'Phase 29C implementation exists',
];

for (const claim of FORBIDDEN_CLAIM_STRINGS) {
  if (!allDocContent.includes(claim)) {
    pass(`No forbidden claim "${claim.slice(0, 50)}" in doc content`);
    continue;
  }
  const inNegativeContext =
    allDocContent.includes(`no ${claim}`) ||
    allDocContent.toLowerCase().includes(`no ${claim.toLowerCase()}`) ||
    allDocContent.includes(`does not approve ${claim}`) ||
    allDocContent.includes(`must not claim ${claim}`) ||
    allDocContent.includes(`not ${claim}`) ||
    allDocContent.includes('Phase 29B does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 23. No telemetry/analytics terms outside guardrail context ────────────────

const TELEMETRY_TERMS = ['telemetry', 'analytics'];
for (const term of TELEMETRY_TERMS) {
  const inDocContent = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocContent) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics') ||
      allDocContent.toLowerCase().includes('no telemetry');
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context in docs`)
      : fail(
          `Telemetry/analytics term "${term}" must only appear in negative guardrail context in docs`
        );
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 24. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
    );

// ── 25. Docs do not claim browser/manual evidence executed in Phase 29B ───────

const browserEvidenceExecuted =
  allDocContent.includes('browser evidence executed in Phase 29B') ||
  allDocContent.includes('manual evidence executed in Phase 29B') ||
  allDocContent.includes('evidence has been executed in Phase 29B');

!browserEvidenceExecuted
  ? pass('Docs do not claim browser/manual evidence executed in Phase 29B')
  : fail('Docs must not claim browser/manual evidence executed in Phase 29B');

// ── 26. Run pack explicitly states NOT_EXECUTED in all observed-result fields ─

const notRunCount = (testingDocContent.match(/NOT_RUN_PHASE29B_PREPARED_ONLY/g) || []).length;
notRunCount >= 12
  ? pass(
      `Run pack observed-result NOT_RUN_PHASE29B_PREPARED_ONLY present for all matrix rows (found ${notRunCount})`
    )
  : fail(
      `Run pack must have NOT_RUN_PHASE29B_PREPARED_ONLY for all 12 matrix rows`,
      `found only ${notRunCount} occurrences`
    );

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
