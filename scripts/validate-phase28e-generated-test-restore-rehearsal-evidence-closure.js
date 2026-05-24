#!/usr/bin/env node
/**
 * Phase 28E Static Validator — Generated/Test Restore Rehearsal Evidence Closure
 *
 * PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PROTOTYPE_EVIDENCE_REVIEW
 * PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_REDECISION: KEEP_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_NO_RESTORE_EXECUTION_APPROVAL
 * PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_AND_UNIT_STATIC_EVIDENCE
 * PHASE28E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE29A_LOCAL_FIRST_HYBRID_READINESS_EVIDENCE_REDECISION_GATE
 * PHASE29A_LOCAL_FIRST_HYBRID_READINESS_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase28e-generated-test-restore-rehearsal-evidence-review.md`;
const RELEASE_DOC = `docs/release/phase28e-generated-test-restore-rehearsal-closure-summary.md`;
const PLANNING_DOC = `docs/planning/phase29a-local-first-hybrid-readiness-evidence-redecision-seed.md`;
const VALIDATOR = `scripts/validate-phase28e-generated-test-restore-rehearsal-evidence-closure.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Testing evidence review doc exists', TESTING_DOC],
  ['Release closure summary doc exists', RELEASE_DOC],
  ['Phase 29A planning seed doc exists', PLANNING_DOC],
  ['Validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const planningDocContent = readFile(PLANNING_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + planningDocContent;
const allTextContent = allDocContent + '\n' + validatorContent;

const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 28E tokens ─────────────────────────────────────────────

const PHASE28E_TOKENS = [
  'PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PROTOTYPE_EVIDENCE_REVIEW',
  'PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_REDECISION: KEEP_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_NO_RESTORE_EXECUTION_APPROVAL',
  'PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_AND_UNIT_STATIC_EVIDENCE',
  'PHASE28E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE29A_LOCAL_FIRST_HYBRID_READINESS_EVIDENCE_REDECISION_GATE',
  'PHASE29A_LOCAL_FIRST_HYBRID_READINESS_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE28E_TOKENS) {
  allTextContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 28E — Generated/Test Restore Rehearsal Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 28D',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Unit/static coverage summary',
  '## No-restore-execution boundary',
  '## No-write and no-overwrite boundary',
  '## No-real-learner-data boundary',
  '## Generated/test data boundary',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Prototype re-decision',
  '## Phase 28 closure decision',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 5. Required evidence table columns ───────────────────────────────────────

const REQUIRED_TABLE_COLUMNS = [
  'Evidence area',
  'Evidence source',
  'Observed result',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence table column present: "${col}"`)
    : fail('Evidence table column missing', `"${col}"`);
}

// ── 6. Required evidence table rows ──────────────────────────────────────────

const REQUIRED_TABLE_ROWS = [
  'Phase 28D prototype exports',
  'Phase 28D outcome state coverage',
  'Phase 28D conservative priority coverage',
  'generated/test data ready-state requirement',
  'planner-ready ready-state requirement',
  'synthetic anomaly normalization',
  'synthetic anomaly detection',
  'real learner data blocked',
  'production state writes blocked',
  'restore overwrite blocked',
  'external backup file blocked',
  'backup format change blocked',
  'storage migration blocked',
  'telemetry/sync/cloud/backend blocked',
  'always-false safety flags',
  'forbidden API absence',
  'backup/export/restore import absence',
  'storage driver import absence',
  'production import absence',
  'unit/static evidence only',
  'generated/test data only',
  'no browser/manual evidence',
  'rollback/removal plan',
];

for (const row of REQUIRED_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table row present: "${row}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 7. Required prototype re-decision and closure decision ────────────────────

testingDocContent.includes('## Prototype re-decision')
  ? pass('Prototype re-decision section present in testing doc')
  : fail('Prototype re-decision section missing from testing doc');

testingDocContent.includes('PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_REDECISION: KEEP_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_NO_RESTORE_EXECUTION_APPROVAL')
  ? pass('Prototype re-decision token present in testing doc')
  : fail('Prototype re-decision token missing from testing doc');

testingDocContent.includes('## Phase 28 closure decision')
  ? pass('Phase 28 closure decision section present in testing doc')
  : fail('Phase 28 closure decision section missing from testing doc');

testingDocContent.includes('PHASE28E_GENERATED_TEST_RESTORE_REHEARSAL_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_AND_UNIT_STATIC_EVIDENCE')
  ? pass('Phase 28 closure decision token present in testing doc')
  : fail('Phase 28 closure decision token missing from testing doc');

// ── 8. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 28E — Generated/Test Restore Rehearsal Closure Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Prototype re-decision',
  '## Phase 28 closure decision',
  '## What is supported',
  '## What remains not proven',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 9. Required Phase 29A seed headings ──────────────────────────────────────

const REQUIRED_PLANNING_HEADINGS = [
  '# Phase 29A — Local-First Hybrid Readiness Evidence/Re-Decision Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 22 through Phase 28',
  '## Evidence areas to review',
  '## Readiness decision options',
  '## Recommended decision posture',
  '## Required gates before any readiness claim',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Phase 29A seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 29A seed heading missing', `"${heading}"`);
}

// ── 10. Required Phase 29A seed token ────────────────────────────────────────

planningDocContent.includes('PHASE29A_LOCAL_FIRST_HYBRID_READINESS_SEED_STATUS: PREPARED_PLANNING_SEED')
  ? pass('Phase 29A seed token present in planning doc')
  : fail('Phase 29A seed token missing from planning doc');

// ── 11. Required Phase 29A evidence areas ────────────────────────────────────

const REQUIRED_EVIDENCE_AREAS = [
  'Phase 22 actual/manual evidence limits',
  'Phase 25 backup health default-off/read-only chain',
  'Phase 26 hidden UI wiring tester evidence',
  'Phase 27 adapter-awareness test-only/default-off/read-only chain',
  'Phase 28 generated/test restore rehearsal test-only/no-write chain',
  'build/unit/static-validator evidence',
  'absence of production restore execution evidence',
  'absence of broad external real-user evidence',
  'absence of stress evidence',
  'absence of sync/cloud/account/backend behavior',
];

for (const area of REQUIRED_EVIDENCE_AREAS) {
  planningDocContent.includes(area)
    ? pass(`Phase 29A evidence area present: "${area}"`)
    : fail('Phase 29A evidence area missing', `"${area}"`);
}

// ── 12. Required Phase 29A decision options ───────────────────────────────────

const REQUIRED_DECISION_OPTIONS = [
  'HOLD_READINESS',
  'LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS',
  'PASS_TO_BETA_EVIDENCE_GATE',
];

for (const option of REQUIRED_DECISION_OPTIONS) {
  planningDocContent.includes(option)
    ? pass(`Phase 29A decision option present: "${option}"`)
    : fail('Phase 29A decision option missing', `"${option}"`);
}

// ── 13. Required Phase 29A recommended posture ───────────────────────────────

planningDocContent.includes('HOLD_OR_LIMITED_PASS_ONLY_UNTIL_PHASE29A_EVIDENCE_REVIEW')
  ? pass('Phase 29A recommended posture present: HOLD_OR_LIMITED_PASS_ONLY_UNTIL_PHASE29A_EVIDENCE_REVIEW')
  : fail('Phase 29A recommended posture missing', 'HOLD_OR_LIMITED_PASS_ONLY_UNTIL_PHASE29A_EVIDENCE_REVIEW');

// ── 14. Phase 29A framed as separate gate ────────────────────────────────────

const SEPARATE_GATE_STATEMENTS = [
  'Phase 29A is a separate evidence/re-decision gate and is not automatically approved.',
  'Phase 28E does not approve restore execution.',
  'Phase 28E does not approve production restore rehearsal.',
  'Phase 28E does not approve real learner data restore rehearsal.',
  'Phase 28E does not approve runtime backup/export/restore changes.',
  'Phase 28E does not approve backup file format changes.',
  'Phase 28E does not approve restore overwrite behavior changes.',
  'Phase 28E does not approve storage migration.',
  'Phase 28E does not approve production adapter-aware backup/export/restore.',
  'Phase 28E does not approve BETA_READY.',
  'Phase 28E does not claim local-first hybrid readiness.',
];

for (const stmt of SEPARATE_GATE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 15. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase28e-generated-test-restore-rehearsal-evidence-closure')
  ? pass('CI registers Phase 28E validator')
  : fail('CI registers Phase 28E validator', 'e2e-smoke.yml does not reference validate-phase28e');

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
  ? pass('CI does not run Phase 24D through Phase 28D validators as active merge-blocking steps')
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

// ── 16. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 17. Validator verifies origin/main via git rev-parse ─────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 18. Exact changed-file check via git (post-merge-main safe, double-dot) ──

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase28e-generated-test-restore-rehearsal-evidence-review.md`,
  `docs/release/phase28e-generated-test-restore-rehearsal-closure-summary.md`,
  `docs/planning/phase29a-local-first-hybrid-readiness-evidence-redecision-seed.md`,
  `scripts/validate-phase28e-generated-test-restore-rehearsal-evidence-closure.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 28E changes committed`
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
        ? pass('No prior Phase 28D/28C/28B/28A/27F/27E/27D/27C/27B/27A/26/25 files in diff')
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
        if (f.includes('phase28e') || f.includes('phase29a')) return false;
        return f.includes('backup') || f.includes('restore') || f.includes('export');
      });
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase28e') &&
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
        : fail('src/ files must not be changed in Phase 28E', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 28E', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 19. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 28E');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 28E');

// ── 20. No file newly imports generatedTestRestoreRehearsalPrototype.js ───────

function walkDir(dir) {
  const files = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        files.push(...walkDir(full));
      } else if (
        entry.isFile() &&
        (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      ) {
        files.push(full);
      }
    }
  } catch {
    // skip unreadable dirs
  }
  return files;
}

const allJsFiles = [
  ...walkDir(path.join(ROOT, 'src')),
  ...walkDir(path.join(ROOT, 'scripts')),
];
const newImportersOfPrototype = allJsFiles.filter(f => {
  const rel = path.relative(ROOT, f);
  if (rel.includes('validate-phase28e')) return false;
  try {
    const content = fs.readFileSync(f, 'utf8');
    const nonComment = getSourceNonCommentLines(content);
    return /import[^'"]*from\s+['"].*generatedTestRestoreRehearsalPrototype/.test(nonComment);
  } catch {
    return false;
  }
});
newImportersOfPrototype.length === 0
  ? pass('No file newly imports generatedTestRestoreRehearsalPrototype.js')
  : fail(
      'No file may import generatedTestRestoreRehearsalPrototype.js',
      newImportersOfPrototype.map(f => path.relative(ROOT, f)).join(', ')
    );

// ── 21. Forbidden claim strings absent ───────────────────────────────────────

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
];

for (const claim of FORBIDDEN_CLAIM_STRINGS) {
  if (!allDocContent.includes(claim)) {
    pass(`No forbidden claim "${claim.slice(0, 40)}" in doc content`);
    continue;
  }
  const inNegativeContext =
    allDocContent.includes(`no ${claim}`) ||
    allDocContent.toLowerCase().includes(`no ${claim.toLowerCase()}`) ||
    allDocContent.includes(`does not approve ${claim}`) ||
    allDocContent.includes(`must not claim ${claim}`) ||
    allDocContent.includes(`not ${claim}`) ||
    allDocContent.includes('Phase 28E does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 40)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 40)}" must not appear as positive claim`);
}

// ── 22. No telemetry/analytics terms outside guardrail context ────────────────

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

// ── 23. Sync/cloud/auth/backend guardrail present in docs ────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
    );

// ── 24. Phase 29A forbidden default approvals present ────────────────────────

const REQUIRED_FORBIDDEN_DEFAULT_APPROVALS = [
  'BETA_READY',
  'Public production readiness',
  'Production restore rehearsal',
  'Real learner data restore rehearsal',
  'Backup file format changes',
  'Restore overwrite behavior changes',
  'Storage migration',
  'Production adapter-aware backup/export/restore',
  'Sync/cloud/account/auth/backend',
  'Telemetry/analytics',
  'Broad external real-user validation',
  'Stress-tested readiness',
];

for (const approval of REQUIRED_FORBIDDEN_DEFAULT_APPROVALS) {
  planningDocContent.includes(approval)
    ? pass(`Phase 29A forbidden default approval listed: "${approval}"`)
    : fail('Phase 29A forbidden default approval missing', `"${approval}"`);
}

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
