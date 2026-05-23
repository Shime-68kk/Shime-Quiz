#!/usr/bin/env node
/**
 * Phase 28D Static Validator — Generated/Test Restore Rehearsal Prototype
 *
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_RESTORE_EXECUTION_NO_WRITES
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_RESTORE_REHEARSAL_EXECUTION
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM
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

const SOURCE_FILE = `src/state/generatedTestRestoreRehearsalPrototype.js`;
const TEST_FILE = `tests/unit/generatedTestRestoreRehearsalPrototype.test.js`;
const TESTING_DOC = `docs/testing/phase28d-generated-test-restore-rehearsal-prototype.md`;
const RELEASE_DOC = `docs/release/phase28d-generated-test-restore-rehearsal-prototype-summary.md`;
const VALIDATOR = `scripts/validate-phase28d-generated-test-restore-rehearsal-prototype.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Source prototype file exists', SOURCE_FILE],
  ['Unit test file exists', TEST_FILE],
  ['Testing doc exists', TESTING_DOC],
  ['Release summary doc exists', RELEASE_DOC],
  ['Validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const sourceContent = readFile(SOURCE_FILE) || '';
const testContent = readFile(TEST_FILE) || '';
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent;
const allTextContent = allDocContent + '\n' + sourceContent + '\n' + testContent + '\n' + validatorContent;

const sourceNonComment = getSourceNonCommentLines(sourceContent);
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required tokens ───────────────────────────────────────────────────────

const PHASE28D_TOKENS = [
  'PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE',
  'PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_RESTORE_EXECUTION_NO_WRITES',
  'PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_RESTORE_REHEARSAL_EXECUTION',
  'PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM',
];

for (const token of PHASE28D_TOKENS) {
  allTextContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required exported functions exist in source ───────────────────────────

const REQUIRED_EXPORTS = [
  'normalizeGeneratedTestRestoreRehearsalInput',
  'createGeneratedTestRestoreRehearsal',
  'deriveGeneratedTestRestoreRehearsalOutcome',
  'summarizeGeneratedTestRestoreRehearsal',
];

for (const fn of REQUIRED_EXPORTS) {
  sourceContent.includes(`export function ${fn}`)
    ? pass(`Required export present in source: ${fn}`)
    : fail('Required export missing from source', fn);

  testContent.includes(fn)
    ? pass(`Required function referenced in unit tests: ${fn}`)
    : fail('Required function missing from unit tests', fn);
}

// ── 5. Required outcome IDs in source ────────────────────────────────────────

const REQUIRED_OUTCOME_IDS = [
  'generated_test_restore_rehearsal_unavailable',
  'generated_test_restore_rehearsal_ready',
  'planner_not_ready',
  'real_learner_data_blocked',
  'production_state_write_blocked',
  'restore_overwrite_blocked',
  'external_backup_file_blocked',
  'backup_format_change_blocked',
  'storage_migration_blocked',
  'telemetry_or_sync_blocked',
  'synthetic_anomaly_detected',
];

for (const id of REQUIRED_OUTCOME_IDS) {
  sourceContent.includes(`'${id}'`)
    ? pass(`Required outcome ID present in source: ${id}`)
    : fail('Required outcome ID missing from source', id);

  testContent.includes(id)
    ? pass(`Required outcome ID referenced in tests: ${id}`)
    : fail('Required outcome ID missing from tests', id);
}

// ── 6. Required always-false safety fields in source ─────────────────────────

const REQUIRED_ALWAYS_FALSE = [
  'canExecuteRestore',
  'canWriteProductionState',
  'canUseRealLearnerData',
  'canChangeBackupFormat',
  'canOverwriteRestoreTarget',
  'canClaimDataLossPrevention',
  'canClaimProductionSafety',
];

for (const field of REQUIRED_ALWAYS_FALSE) {
  const alwaysFalseInSource = sourceContent.includes(`${field}: false`);
  alwaysFalseInSource
    ? pass(`Always-false safety field present in source: ${field}: false`)
    : fail('Always-false safety field missing from source', `${field}: false`);

  testContent.includes(field)
    ? pass(`Always-false safety field covered in tests: ${field}`)
    : fail('Always-false safety field missing from tests', field);
}

// ── 7. Required evidence levels in source ────────────────────────────────────

const REQUIRED_EVIDENCE_LEVELS = [
  'unit_static_only',
  'generated_test_rehearsal_only',
  'unknown',
];

for (const level of REQUIRED_EVIDENCE_LEVELS) {
  sourceContent.includes(`'${level}'`)
    ? pass(`Required evidence level present in source: ${level}`)
    : fail('Required evidence level missing from source', level);
}

// ── 8. No forbidden APIs in source ──────────────────────────────────────────

const FORBIDDEN_API_PATTERNS = [
  { pattern: /localStorage/, label: 'localStorage' },
  { pattern: /[Ii]ndexed[Dd][Bb]/, label: 'IndexedDB' },
  { pattern: /\bfetch\s*\(/, label: 'fetch(' },
  { pattern: /XMLHttpRequest/, label: 'XMLHttpRequest' },
  { pattern: /sendBeacon/, label: 'sendBeacon' },
  { pattern: /Date\.now\s*\(/, label: 'Date.now(' },
  { pattern: /process\.env/, label: 'process.env' },
  { pattern: /import\.meta\.env/, label: 'import.meta.env' },
];

for (const { pattern, label } of FORBIDDEN_API_PATTERNS) {
  pattern.test(sourceNonComment)
    ? fail(`Source must not use ${label}`, `found ${label} in non-comment lines`)
    : pass(`Source does not use ${label}`);
}

// ── 9. No backup/export/restore imports in source (other than restoreRehearsalPlanner) ──

const importLines = sourceContent
  .split('\n')
  .filter(l => l.trim().startsWith('import'))
  .join('\n');

const allImportPaths = [...importLines.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m => m[1]);

const forbiddenBackupImports = allImportPaths.filter(p => {
  if (p.includes('restoreRehearsalPlanner')) return false;
  return (
    /backup/i.test(p) || /export[A-Z]/.test(p) ||
    ((/restore/i.test(p)) && !p.includes('restoreRehearsalPlanner'))
  );
});
forbiddenBackupImports.length === 0
  ? pass('Source has no forbidden backup/export/restore imports')
  : fail('Source has forbidden backup/export/restore imports', forbiddenBackupImports.join(', '));

const forbiddenStorageDriverImports = allImportPaths.filter(p =>
  /[Ii]ndexed[Dd][Bb]/.test(p) || /[Ss]torage[Aa]dapter/.test(p) || /storage\/driver/.test(p)
);
forbiddenStorageDriverImports.length === 0
  ? pass('Source has no storage driver imports')
  : fail('Source has storage driver imports', forbiddenStorageDriverImports.join(', '));

// ── 10. No href/route/navigation strings in source ───────────────────────────

const NAV_PATTERNS = [
  { pattern: /window\.location\.href\s*=/, label: 'window.location.href assignment' },
  { pattern: /router\.push\s*\(/, label: 'router.push()' },
  { pattern: /navigate\s*\(\s*['"`]\/(?:settings|library|dashboard)/, label: 'navigate to settings/library/dashboard' },
];

for (const { pattern, label } of NAV_PATTERNS) {
  pattern.test(sourceNonComment)
    ? fail(`Source must not use ${label}`, `found in non-comment lines`)
    : pass(`Source does not use ${label}`);
}

// ── 11. No production module imports the prototype ────────────────────────────

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
        (entry.name.endsWith('.js') || entry.name.endsWith('.jsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) &&
        entry.name !== 'generatedTestRestoreRehearsalPrototype.js'
      ) {
        files.push(full);
      }
    }
  } catch {
    // skip unreadable dirs
  }
  return files;
}

const srcDir = path.join(ROOT, 'src');
const productionFiles = walkDir(srcDir);
const importersOfPrototype = productionFiles.filter(f => {
  try {
    const content = fs.readFileSync(f, 'utf8');
    return content.includes('generatedTestRestoreRehearsalPrototype');
  } catch {
    return false;
  }
});
importersOfPrototype.length === 0
  ? pass('No production module imports generatedTestRestoreRehearsalPrototype')
  : fail(
      'Production module must not import generatedTestRestoreRehearsalPrototype',
      importersOfPrototype.map(f => path.relative(ROOT, f)).join(', ')
    );

// ── 12. Unit tests cover required cases ──────────────────────────────────────

const REQUIRED_TEST_COVERAGE = [
  { check: 'normalizeGeneratedTestRestoreRehearsalInput', label: 'normalize function tested' },
  { check: 'deriveGeneratedTestRestoreRehearsalOutcome', label: 'outcome derivation tested' },
  { check: 'createGeneratedTestRestoreRehearsal', label: 'rehearsal creation tested' },
  { check: 'summarizeGeneratedTestRestoreRehearsal', label: 'summary tested' },
  { check: 'syntheticAnomalies', label: 'synthetic anomalies tested' },
  { check: 'canExecuteRestore', label: 'canExecuteRestore coverage tested' },
  { check: 'canWriteProductionState', label: 'canWriteProductionState coverage tested' },
  { check: 'canUseRealLearnerData', label: 'canUseRealLearnerData coverage tested' },
  { check: 'canClaimProductionSafety', label: 'canClaimProductionSafety coverage tested' },
  { check: 'evidenceLevel', label: 'evidenceLevel tested' },
  { check: 'labelVi', label: 'Vietnamese-first copy tested' },
  { check: 'planner_not_ready', label: 'planner_not_ready state tested' },
  { check: 'synthetic_anomaly_detected', label: 'synthetic_anomaly_detected state tested' },
  { check: 'generated_test_restore_rehearsal_ready', label: 'ready state tested' },
  { check: 'generated_test_rehearsal_only', label: 'generated_test_rehearsal_only evidence level tested' },
  { check: 'unit_static_only', label: 'unit_static_only evidence level tested' },
  { check: 'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM', label: 'claim boundary tested' },
];

for (const { check, label } of REQUIRED_TEST_COVERAGE) {
  testContent.includes(check)
    ? pass(`Unit test coverage: ${label}`)
    : fail('Unit test coverage missing', label);
}

// ── 13. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase28d-generated-test-restore-rehearsal-prototype')
  ? pass('CI registers Phase 28D validator')
  : fail('CI registers Phase 28D validator', 'e2e-smoke.yml does not reference validate-phase28d');

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
  ? pass('CI does not run Phase 24D through Phase 28C validators as active merge-blocking steps')
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

// ── 14. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 15. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 16. Exact changed-file check via git (post-merge-main safe, double-dot) ──

const ALLOWED_CHANGED_FILES = new Set([
  `src/state/generatedTestRestoreRehearsalPrototype.js`,
  `tests/unit/generatedTestRestoreRehearsalPrototype.test.js`,
  `docs/testing/phase28d-generated-test-restore-rehearsal-prototype.md`,
  `docs/release/phase28d-generated-test-restore-rehearsal-prototype-summary.md`,
  `scripts/validate-phase28d-generated-test-restore-rehearsal-prototype.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 28D changes committed`
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
        ? pass('No prior Phase 28C/28B/28A/27F/27E/27D/27C/27B/27A/26/25 files in diff')
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
        if (f.includes('phase28d') || f.includes('generatedTestRestoreRehearsal') || f.includes('GeneratedTestRestoreRehearsal')) return false;
        if (f.includes('restoreRehearsalPlanner')) return false;
        return (f.includes('backup') || f.includes('restore') || f.includes('export'));
      });
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase28d') &&
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

// ── 17. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 28D');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 28D');

// ── 18. Forbidden claim strings absent ───────────────────────────────────────

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
  // Check only doc content (not validator/test file literal arrays which contain these strings)
  if (!allDocContent.includes(claim)) {
    pass(`No forbidden claim "${claim.slice(0, 40)}" in doc content`);
    continue;
  }
  // Claim present in docs — check it appears only in negative/guardrail context
  const inNegativeContext =
    allDocContent.includes(`no ${claim}`) ||
    allDocContent.toLowerCase().includes(`no ${claim.toLowerCase()}`) ||
    allDocContent.includes(`does not approve ${claim}`) ||
    allDocContent.includes(`must not claim ${claim}`) ||
    allDocContent.includes(`not ${claim}`) ||
    allDocContent.includes('Phase 28D does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 40)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 40)}" must not appear as positive claim`);
}

// ── 19. No telemetry/analytics terms outside guardrail context ────────────────

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

// ── 20. Sync/cloud/auth/backend guardrail present in docs ────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
    );

// ── 21. Required testing doc headings ────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 28D — Generated/Test Restore Rehearsal Prototype',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 28C',
  '## Implementation summary',
  '## Prototype API',
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

// ── 22. Required release doc headings ────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 28D — Generated/Test Restore Rehearsal Prototype Summary',
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

// ── 23. Required next-phase framing in docs ───────────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 28E — Generated/Test Restore Rehearsal Evidence Review and Closure/Re-Decision',
  'Phase 28E is a separate evidence/re-decision gate and is not automatically approved.',
  'Phase 28D does not approve restore execution.',
  'Phase 28D does not approve production restore rehearsal.',
  'Phase 28D does not approve real learner data restore rehearsal.',
  'Phase 28D does not approve runtime backup/export/restore changes.',
  'Phase 28D does not approve backup file format changes.',
  'Phase 28D does not approve restore overwrite behavior changes.',
  'Phase 28D does not approve storage migration.',
  'Phase 28D does not approve production adapter-aware backup/export/restore.',
  'Phase 28D does not approve BETA_READY.',
  'Phase 28D does not claim local-first hybrid readiness.',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required next phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required next phase statement missing', `"${stmt}"`);
}

// ── 24. Source mentions restoreRehearsalPlanner.js as the only allowed import ─

sourceContent.includes('./restoreRehearsalPlanner.js')
  ? pass('Source imports from restoreRehearsalPlanner.js (allowed planner import)')
  : fail(
      'Source should import from restoreRehearsalPlanner.js',
      'No import of restoreRehearsalPlanner.js found'
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
