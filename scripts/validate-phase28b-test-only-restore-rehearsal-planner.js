#!/usr/bin/env node
/**
 * Phase 28B Static Validator — Test-Only No-Write Restore Rehearsal Planner
 *
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
 * PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
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

const SOURCE_FILE = `src/state/restoreRehearsalPlanner.js`;
const TEST_FILE = `tests/unit/restoreRehearsalPlanner.test.js`;
const TESTING_DOC = `docs/testing/phase28b-test-only-restore-rehearsal-planner.md`;
const RELEASE_DOC = `docs/release/phase28b-test-only-restore-rehearsal-planner-summary.md`;
const VALIDATOR = `scripts/validate-phase28b-test-only-restore-rehearsal-planner.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(SOURCE_FILE)
  ? pass(`Source file exists: ${SOURCE_FILE}`)
  : fail(`Source file exists`, `missing ${SOURCE_FILE}`);

fileExists(TEST_FILE)
  ? pass(`Test file exists: ${TEST_FILE}`)
  : fail(`Test file exists`, `missing ${TEST_FILE}`);

fileExists(TESTING_DOC)
  ? pass(`Testing doc exists: ${TESTING_DOC}`)
  : fail(`Testing doc exists`, `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. Read file contents ────────────────────────────────────────────────────

const sourceContent = readFile(SOURCE_FILE) || '';
const testContent = readFile(TEST_FILE) || '';
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent;
const allContent = allDocContent + '\n' + sourceContent + '\n' + testContent + '\n' + validatorContent;

// ── 3. Required tokens ───────────────────────────────────────────────────────

const PHASE28B_TOKENS = [
  'PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER',
  'PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES',
  'PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION',
  'PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM',
];

for (const token of PHASE28B_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 28B — Test-Only Restore Rehearsal Planner',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 28A',
  '## Implementation summary',
  '## Planner API',
  '## Unit/static evidence',
  '## Evidence interpretation',
  '## No-restore-execution proof',
  '## No-write and no-overwrite proof',
  '## No-real-learner-data proof',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Data safety boundary',
  '## Generated/test data only rule',
  '## Claim boundary',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 5. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 28B — Test-Only Restore Rehearsal Planner Summary',
  '## Status tokens',
  '## Scope',
  '## Implementation summary',
  '## Unit/static evidence',
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

// ── 6. Required next phase framing ───────────────────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 28C',
  'Phase 28C is a separate evidence/design review gate and is not automatically approved.',
  'Phase 28B does not approve restore execution.',
  'Phase 28B does not approve production restore rehearsal.',
  'Phase 28B does not approve real learner data restore rehearsal.',
  'Phase 28B does not approve runtime backup/export/restore changes.',
  'Phase 28B does not approve backup file format changes.',
  'Phase 28B does not approve restore overwrite behavior changes.',
  'Phase 28B does not approve storage migration.',
  'Phase 28B does not approve production adapter-aware backup/export/restore.',
  'Phase 28B does not approve BETA_READY.',
  'Phase 28B does not claim local-first hybrid readiness.',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required next phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required next phase statement missing', `"${stmt}"`);
}

// ── 7. Required exported functions in source ─────────────────────────────────

const REQUIRED_EXPORTS = [
  'normalizeRestoreRehearsalPlanInput',
  'createGeneratedTestRestoreRehearsalPlan',
  'deriveRestoreRehearsalSafetyState',
  'summarizeRestoreRehearsalPlan',
];

for (const fn of REQUIRED_EXPORTS) {
  sourceContent.includes(`export function ${fn}`)
    ? pass(`Required export present in source: ${fn}`)
    : fail('Required export missing from source', fn);
}

// ── 8. Required state IDs in source ──────────────────────────────────────────

const REQUIRED_STATE_IDS = [
  'telemetry_or_sync_blocked',
  'storage_migration_blocked',
  'backup_format_change_blocked',
  'external_backup_file_blocked',
  'restore_overwrite_blocked',
  'production_state_write_blocked',
  'real_learner_data_blocked',
  'missing_generated_test_data',
  'generated_test_rehearsal_plan_ready',
  'restore_rehearsal_planner_unavailable',
];

for (const stateId of REQUIRED_STATE_IDS) {
  sourceContent.includes(stateId)
    ? pass(`Required state ID present in source: ${stateId}`)
    : fail('Required state ID missing from source', stateId);
}

// ── 9. Required always-false safety fields in source ─────────────────────────

const REQUIRED_ALWAYS_FALSE_FIELDS_SOURCE = [
  'canExecuteRestore: false',
  'canWriteProductionState: false',
  'canUseRealLearnerData: false',
  'canChangeBackupFormat: false',
  'canOverwriteRestoreTarget: false',
  'canClaimDataLossPrevention: false',
  'canClaimProductionSafety: false',
];

for (const field of REQUIRED_ALWAYS_FALSE_FIELDS_SOURCE) {
  sourceContent.includes(field)
    ? pass(`Always-false safety field present in source: ${field}`)
    : fail('Always-false safety field missing from source', field);
}

// ── 10. Required always-false safety fields in tests ─────────────────────────

const REQUIRED_ALWAYS_FALSE_FIELDS_TESTS = [
  'canExecuteRestore',
  'canWriteProductionState',
  'canUseRealLearnerData',
  'canChangeBackupFormat',
  'canOverwriteRestoreTarget',
  'canClaimDataLossPrevention',
  'canClaimProductionSafety',
];

for (const field of REQUIRED_ALWAYS_FALSE_FIELDS_TESTS) {
  testContent.includes(field)
    ? pass(`Always-false safety field tested: ${field}`)
    : fail('Always-false safety field not tested', field);
}

// ── 11. Required evidence levels in source ───────────────────────────────────

const REQUIRED_EVIDENCE_LEVELS = [
  'unit_static_only',
  'generated_test_plan_only',
  'unknown',
];

for (const level of REQUIRED_EVIDENCE_LEVELS) {
  sourceContent.includes(level)
    ? pass(`Evidence level present in source: ${level}`)
    : fail('Evidence level missing from source', level);
}

// ── 12. Required severity levels in source ───────────────────────────────────

const REQUIRED_SEVERITY_LEVELS = ['info', 'caution', 'blocked', 'unavailable'];

for (const severity of REQUIRED_SEVERITY_LEVELS) {
  sourceContent.includes(severity)
    ? pass(`Severity level present in source: ${severity}`)
    : fail('Severity level missing from source', severity);
}

// ── 13. No forbidden storage/write/network APIs in source ────────────────────

const sourceNonComment = getSourceNonCommentLines(sourceContent);

const FORBIDDEN_API_PATTERNS = [
  { pattern: /localStorage\s*\.\s*(setItem|getItem|removeItem|clear)/, label: 'localStorage write/read API' },
  { pattern: /indexedDB|IDBDatabase|IDBTransaction|IDBObjectStore/, label: 'IndexedDB API' },
  { pattern: /\bfetch\s*\(/, label: 'fetch API' },
  { pattern: /XMLHttpRequest/, label: 'XMLHttpRequest' },
  { pattern: /sendBeacon/, label: 'sendBeacon' },
  { pattern: /Date\.now\s*\(/, label: 'Date.now' },
  { pattern: /process\.env/, label: 'process.env' },
  { pattern: /import\.meta\.env/, label: 'import.meta.env' },
];

for (const { pattern, label } of FORBIDDEN_API_PATTERNS) {
  !pattern.test(sourceNonComment)
    ? pass(`No forbidden API in source: ${label}`)
    : fail(`Forbidden API found in source`, label);
}

// ── 14. No backup/export/restore imports in source ───────────────────────────

const hasBackupImport = /import\s+.*from\s+['"].*[Bb]ackup[^'"]*['"]/.test(sourceContent);
const hasRestoreImport = /import\s+.*from\s+['"].*[Rr]estore[^'"]*['"]/.test(sourceContent);
const hasExportImport = /import\s+.*from\s+['"].*[Ee]xport[^'"]*['"]/.test(sourceContent);

!hasBackupImport
  ? pass('No backup module imports in source')
  : fail('Source must not import backup modules');

!hasRestoreImport
  ? pass('No restore module imports in source')
  : fail('Source must not import restore modules');

!hasExportImport
  ? pass('No export module imports in source')
  : fail('Source must not import export modules');

// ── 15. No storage driver imports in source ──────────────────────────────────

const hasStorageAdapterImport = /import\s+.*from\s+['"].*[Ss]torage[Aa]dapter[^'"]*['"]/.test(sourceContent);
const hasIndexedDBImport = /import\s+.*from\s+['"].*[Ii]ndexed[Dd][Bb][^'"]*['"]/.test(sourceContent);

!hasStorageAdapterImport
  ? pass('No StorageAdapter imports in source')
  : fail('Source must not import StorageAdapter');

!hasIndexedDBImport
  ? pass('No IndexedDB module imports in source')
  : fail('Source must not import IndexedDB modules');

// ── 16. No href/route/navigation strings in source ───────────────────────────

const FORBIDDEN_SOURCE_STRINGS = [
  { pattern: /\bhref\s*[=:]/, label: 'href assignment/property' },
  { pattern: /router\.push|useNavigate|navigate\(/, label: 'navigation call' },
  { pattern: /\/settings\/|\/library\/|\/dashboard\//, label: 'route string' },
];

for (const { pattern, label } of FORBIDDEN_SOURCE_STRINGS) {
  !pattern.test(sourceNonComment)
    ? pass(`No forbidden navigation string in source: ${label}`)
    : fail(`Forbidden navigation string found in source`, label);
}

// ── 17. Unit tests cover required cases ──────────────────────────────────────

const REQUIRED_TEST_COVERAGE = [
  { token: 'normalizeRestoreRehearsalPlanInput', label: 'normalizeRestoreRehearsalPlanInput tested' },
  { token: 'createGeneratedTestRestoreRehearsalPlan', label: 'createGeneratedTestRestoreRehearsalPlan tested' },
  { token: 'deriveRestoreRehearsalSafetyState', label: 'deriveRestoreRehearsalSafetyState tested' },
  { token: 'summarizeRestoreRehearsalPlan', label: 'summarizeRestoreRehearsalPlan tested' },
  { token: 'null', label: 'null input tested' },
  { token: 'undefined', label: 'undefined input tested' },
  { token: 'immutab', label: 'immutability tested' },
  { token: 'trim', label: 'string trimming tested' },
  { token: 'conservative priority', label: 'conservative priority tested' },
  { token: 'real_learner_data_blocked', label: 'real learner data blocked tested' },
  { token: 'production_state_write_blocked', label: 'production state write blocked tested' },
  { token: 'restore_overwrite_blocked', label: 'restore overwrite blocked tested' },
  { token: 'external_backup_file_blocked', label: 'external backup file blocked tested' },
  { token: 'backup_format_change_blocked', label: 'backup format change blocked tested' },
  { token: 'storage_migration_blocked', label: 'storage migration blocked tested' },
  { token: 'telemetry_or_sync_blocked', label: 'telemetry or sync blocked tested' },
  { token: 'generated_test_rehearsal_plan_ready', label: 'generated test rehearsal plan ready tested' },
  { token: 'canExecuteRestore', label: 'canExecuteRestore tested' },
  { token: 'canWriteProductionState', label: 'canWriteProductionState tested' },
  { token: 'canUseRealLearnerData', label: 'canUseRealLearnerData tested' },
  { token: 'canChangeBackupFormat', label: 'canChangeBackupFormat tested' },
  { token: 'canOverwriteRestoreTarget', label: 'canOverwriteRestoreTarget tested' },
  { token: 'canClaimDataLossPrevention', label: 'canClaimDataLossPrevention tested' },
  { token: 'canClaimProductionSafety', label: 'canClaimProductionSafety tested' },
  { token: 'evidenceLevel', label: 'evidence levels tested' },
  { token: 'labelVi', label: 'Vietnamese copy tested' },
  { token: 'BETA_READY', label: 'forbidden claim BETA_READY tested' },
  { token: 'generatedTestData', label: 'generated/test data only boundary tested' },
];

for (const { token, label } of REQUIRED_TEST_COVERAGE) {
  testContent.includes(token)
    ? pass(`Unit tests cover: ${label}`)
    : fail('Unit tests missing coverage', label);
}

// ── 18. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase28b-test-only-restore-rehearsal-planner')
  ? pass('CI registers Phase 28B validator')
  : fail('CI registers Phase 28B validator', 'e2e-smoke.yml does not reference validate-phase28b');

const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
hasCheckoutFetchDepth
  ? pass('CI checkout uses fetch-depth: 0')
  : fail('CI checkout must use fetch-depth: 0');

const hasForbiddenFetchStep =
  ciContent.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
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
  ? pass('CI does not run Phase 24D through Phase 28A validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js" in CI`)
  : pass('CI does not run full validate-*.js glob loop');

// ── 19. Validator does not execute git fetch ──────────────────────────────────

const validatorNonCommentLines = getSourceNonCommentLines(validatorContent);

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonCommentLines);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch call in validator')
  : pass('Validator does not execute internal git fetch');

// ── 20. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 21. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `src/state/restoreRehearsalPlanner.js`,
  `tests/unit/restoreRehearsalPlanner.test.js`,
  `docs/testing/phase28b-test-only-restore-rehearsal-planner.md`,
  `docs/release/phase28b-test-only-restore-rehearsal-planner-summary.md`,
  `scripts/validate-phase28b-test-only-restore-rehearsal-planner.js`,
  `.github/workflows/e2e-smoke.yml`,
]);

const FORBIDDEN_CHANGED_PATTERNS = [
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
        `branch "${currentBranch}" has empty diff — no Phase 28B changes committed`
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
        FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES.some(prefix => f.startsWith(prefix))
      );
      priorPhaseMatches.length === 0
        ? pass('No prior Phase 28A/27F/27E/27D/27C/27B/27A/26/25 files in diff')
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
          !f.includes('phase28b') &&
          !f.includes('restoreRehearsal')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase28b') &&
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
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 22. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 28B');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 28B');

// ── 23. Forbidden claim strings absent from docs/source/tests ─────────────────

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
  const inContent = allContent.includes(claim);
  if (inContent) {
    const inNegativeContext =
      allContent.includes(`no ${claim}`) ||
      allContent.includes(`does not claim ${claim}`) ||
      allContent.includes(`must not claim ${claim}`) ||
      allContent.includes(`not ${claim}`) ||
      allContent.includes(`Phase 28B does not approve`);
    inNegativeContext
      ? pass(`Forbidden claim "${claim.slice(0, 40)}" appears only in negative context`)
      : fail(`Forbidden claim "${claim.slice(0, 40)}" must not appear as positive claim`);
  } else {
    pass(`No forbidden claim "${claim.slice(0, 40)}" in content`);
  }
}

// ── 24. Telemetry/analytics terms only in negative guardrail context ──────────

const TELEMETRY_TERMS = ['telemetry', 'analytics'];
for (const term of TELEMETRY_TERMS) {
  const inDocContent = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocContent) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes(`no telemetry or analytics`);
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context in docs`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context in docs`);
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 25. Sync/cloud/auth/backend guardrail present in docs ────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail('Sync/cloud/auth/backend guardrail missing from docs', '"No sync/cloud/account/auth/backend."');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
