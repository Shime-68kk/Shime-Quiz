#!/usr/bin/env node
/**
 * Phase 25N Static Validator — Backup Health Evidence and Phase 25 Closure Gate
 *
 * PHASE25N_BACKUP_HEALTH_EVIDENCE_CLOSURE_STATUS: COMPLETED_LIMITED_EVIDENCE_AND_PHASE25_CLOSURE
 * PHASE25N_PHASE25_CLOSURE_DECISION: CLOSED_WITH_DEFAULT_OFF_VIEW_MODEL_AND_NO_PRODUCTION_UI_APPROVAL
 * PHASE25N_BACKUP_HEALTH_EVIDENCE_INTERPRETATION: LIMITED_STATIC_AND_LOCAL_AUTOMATED_EVIDENCE_NO_BROWSER_USER_FACING_CLAIM
 * PHASE26A_LOCAL_FIRST_HYBRID_READINESS_PLANNING_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase25n-backup-health-evidence-and-closure.md`;
const RELEASE_DOC = `docs/release/phase25n-phase25-backup-health-closure-summary.md`;
const PLANNING_DOC = `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`;
const VALIDATOR = `scripts/validate-phase25n-backup-health-evidence-closure-gate.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass('Testing doc exists')
  : fail('Testing doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(PLANNING_DOC)
  ? pass('Phase 26A planning seed exists')
  : fail('Phase 26A planning seed exists', `missing ${PLANNING_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase25n')
  ? pass('CI registers Phase 25N validator')
  : fail('CI registers Phase 25N validator', 'e2e-smoke.yml does not reference validate-phase25n');

ciContent.includes('Fetch origin main for Phase 25N validator')
  ? pass('CI has explicit fetch step before Phase 25N validator')
  : fail('CI has explicit fetch step before Phase 25N validator', 'missing "Fetch origin main for Phase 25N validator" step');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25M validators as active merge-blocking steps')
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

// ── 3. Required doc tokens ───────────────────────────────────────────────────

const PHASE25N_TOKENS = [
  'PHASE25N_BACKUP_HEALTH_EVIDENCE_CLOSURE_STATUS: COMPLETED_LIMITED_EVIDENCE_AND_PHASE25_CLOSURE',
  'PHASE25N_PHASE25_CLOSURE_DECISION: CLOSED_WITH_DEFAULT_OFF_VIEW_MODEL_AND_NO_PRODUCTION_UI_APPROVAL',
  'PHASE25N_BACKUP_HEALTH_EVIDENCE_INTERPRETATION: LIMITED_STATIC_AND_LOCAL_AUTOMATED_EVIDENCE_NO_BROWSER_USER_FACING_CLAIM',
];

for (const docPath of [TESTING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of PHASE25N_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 70)}`)
      : fail(`Doc ${docPath} missing token`, token);
  }
}

// ── 4. Phase 26A planning token ──────────────────────────────────────────────

const planningDocContent = readFile(PLANNING_DOC) || '';
planningDocContent.includes('PHASE26A_LOCAL_FIRST_HYBRID_READINESS_PLANNING_STATUS: PREPARED_PLANNING_SEED')
  ? pass('Phase 26A planning doc contains required planning token')
  : fail('Phase 26A planning doc missing PHASE26A_LOCAL_FIRST_HYBRID_READINESS_PLANNING_STATUS: PREPARED_PLANNING_SEED');

// ── 5. Manual/browser evidence status ───────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
testingDocContent.includes('NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED')
  ? pass('Testing doc contains manual/browser evidence status NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED')
  : fail('Testing doc must contain NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED for manual/browser evidence status');

// ── 6. Baseline tokens from prior phases ────────────────────────────────────

const PHASE25M_TOKENS = [
  'PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE',
  'PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES',
  'PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE',
  'PHASE25M_MANUAL_BROWSER_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
];

const PHASE25L_TOKENS = [
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES',
];

const PHASE25K_TOKENS = [
  'PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY',
];

const PHASE25I_TOKENS = [
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER',
  'PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES',
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE',
];

const allDocContent =
  (readFile(TESTING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

for (const token of PHASE25M_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25M baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25M baseline token missing', token);
}

for (const token of PHASE25L_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25L baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25L baseline token missing', token);
}

for (const token of PHASE25K_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25K baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25K baseline token missing', token);
}

for (const token of PHASE25I_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25I baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25I baseline token missing', token);
}

allDocContent.includes('Phase 25I-HF1')
  ? pass('Phase 25I-HF1 post-merge context fix is referenced')
  : fail('Phase 25I-HF1 post-merge context fix must be referenced in docs');

// ── 7. Required Phase 25 closure interpretation ──────────────────────────────

const REQUIRED_CLOSURE_STATEMENTS = [
  'Phase 25 closes with a default-off, read-only Backup Health view-model prototype.',
  'Phase 25 does not approve production-visible Backup Health UI by default.',
  'Phase 25 does not approve broad dashboard/settings/library rollout.',
  'Phase 25 does not approve production adapter-aware backup/export/restore.',
  'Phase 25 does not change backup/export/restore behavior.',
  'Phase 25 does not change backup file format.',
  'Phase 25 does not change restore overwrite behavior.',
  'Phase 25 does not add telemetry/analytics.',
  'Phase 25 does not add sync/cloud/account/auth/backend.',
  'Phase 25 does not prove broad backup reliability.',
  'Phase 25 does not guarantee data-loss prevention.',
  'Phase 25 does not claim BETA_READY.',
];

for (const stmt of REQUIRED_CLOSURE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Closure statement present: "${stmt.slice(0, 70)}"`)
    : fail('Closure statement missing', `"${stmt}"`);
}

// ── 8. Required guardrail statements ────────────────────────────────────────

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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25N merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 9. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Evidence interpretation',
  '## Phase 25 closure decision',
  '## Evidence table',
  '## Manual/browser evidence status',
  '## What Phase 25 closes as proven',
  '## What Phase 25 does not prove',
  '## Backup/export/restore boundary',
  '## Production UI boundary',
  '## Local-first/no-cloud boundary',
  '## Generated artifact cleanup',
  '## Validation summary',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_TESTING_SECTIONS) {
  testingDocContent.includes(section)
    ? pass(`Testing doc has section: ${section}`)
    : fail('Testing doc missing section', section);
}

// ── 10. Required release doc headings ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Closure decision',
  '## Evidence interpretation',
  '## Proven',
  '## Not proven',
  '## Validation summary',
  '## Rollback plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 11. Required Phase 26A planning doc headings ──────────────────────────────

const REQUIRED_PLANNING_SECTIONS = [
  '## Status token',
  '## Purpose',
  '## Phase 26A planning constraints',
  '## Candidate directions',
  '## Forbidden default approvals',
  '## Required gates before runtime',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const section of REQUIRED_PLANNING_SECTIONS) {
  planningDocContent.includes(section)
    ? pass(`Phase 26A planning doc has section: ${section}`)
    : fail('Phase 26A planning doc missing section', section);
}

// ── 12. Phase 26A planning constraints ───────────────────────────────────────

const REQUIRED_PLANNING_STATEMENTS = [
  'Phase 26A is planning-first and does not start runtime/storage/backup/restore changes automatically.',
  'Phase 26A must choose one direction before runtime work',
  'Phase 26A must not approve BETA_READY by default.',
  'Phase 26A must not approve sync/cloud/account/auth/backend.',
  'Phase 26A must not approve production adapter-aware backup/export/restore without a separate design/evidence gate.',
  'Phase 26A must not approve IndexedDB production migration without a separate design/evidence gate.',
];

for (const stmt of REQUIRED_PLANNING_STATEMENTS) {
  planningDocContent.includes(stmt)
    ? pass(`Phase 26A planning statement present: "${stmt.slice(0, 70)}"`)
    : fail('Phase 26A planning statement missing', `"${stmt}"`);
}

// ── 13. Evidence table required rows and columns ──────────────────────────────

const REQUIRED_EVIDENCE_ROWS = [
  'Phase 25K default-off integration prototype',
  'Phase 25M default-off UI view-model prototype',
  'No production-visible UI wiring',
  'No route/navigation/settings/library/dashboard wiring',
  'No write APIs',
  'No backup/export/restore behavior changes',
  'Vietnamese-first calm copy review',
  'Manual/browser evidence status',
  'Generated artifacts cleanup',
  'Patch apply integrity',
];

const REQUIRED_EVIDENCE_COLUMNS = [
  'Evidence area',
  'Evidence source',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const row of REQUIRED_EVIDENCE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table has required row: ${row}`)
    : fail('Evidence table missing required row', row);
}

for (const col of REQUIRED_EVIDENCE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence table has required column: ${col}`)
    : fail('Evidence table missing required column', col);
}

// ── 14. Rollback plan completeness ────────────────────────────────────────────

allDocContent.includes('Remove `docs/testing/phase25n-backup-health-evidence-and-closure.md`.')
  ? pass('Rollback plan includes testing doc removal')
  : fail('Rollback plan must include testing doc removal');

allDocContent.includes('Remove `docs/release/phase25n-phase25-backup-health-closure-summary.md`.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`.')
  ? pass('Rollback plan includes planning doc removal')
  : fail('Rollback plan must include planning doc removal');

allDocContent.includes('Remove `scripts/validate-phase25n-backup-health-evidence-closure-gate.js`.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 25N CI registration')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include Phase 25N CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 25N does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 15. Forbidden affirmative doc claims ─────────────────────────────────────

const docLinesStripped = allDocContent
  .split('\n')
  .filter(l => {
    const lower = l.toLowerCase();
    return !(
      lower.includes('does not claim') ||
      lower.includes('must not claim') ||
      lower.includes('do not claim') ||
      lower.includes('cannot claim') ||
      lower.includes('does not approve') ||
      lower.includes('must not approve') ||
      lower.includes('phase 25n does not') ||
      lower.includes('phase 25n must not') ||
      lower.includes('phase 25 does not') ||
      lower.includes('phase 25 must not') ||
      lower.includes('forbidden') ||
      lower.includes('not approved') ||
      lower.includes('does not add') ||
      lower.includes('does not implement') ||
      lower.includes('does not introduce') ||
      lower.includes('does not change') ||
      lower.includes('does not import') ||
      lower.includes('does not modify') ||
      lower.includes('does not create') ||
      lower.includes('does not wire') ||
      lower.includes('does not write') ||
      lower.includes('does not perform') ||
      lower.includes('does not prove') ||
      lower.includes('remains unchanged') ||
      lower.includes('no runtime') ||
      lower.includes('not automatically approved') ||
      lower.includes('not proven') ||
      lower.includes('not executed') ||
      lower.includes('no browser') ||
      lower.includes('not claimed')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
if (
  docLinesStripped.includes('BETA_READY: true') ||
  docLinesStripped.includes('BETA_READY=true') ||
  docLinesStripped.includes('status: BETA_READY')
) {
  forbiddenDocFound.push('affirmative BETA_READY status token');
}
if (
  docLinesStripped.includes('production UI is ready') ||
  docLinesStripped.includes('production Backup Health UI is available') ||
  docLinesStripped.includes('production Backup Health UI is live')
) {
  forbiddenDocFound.push('affirmative production Backup Health UI claim');
}
if (docLinesStripped.includes('guaranteed data-loss prevention is provided')) {
  forbiddenDocFound.push('affirmative guaranteed data-loss prevention claim');
}
if (docLinesStripped.includes('broad backup reliability is proven')) {
  forbiddenDocFound.push('affirmative broad backup reliability claim');
}

forbiddenDocFound.length === 0
  ? pass('Docs do not contain forbidden affirmative claims')
  : fail('Docs contain forbidden affirmative claims', forbiddenDocFound.join(', '));

// ── 16. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase25n-backup-health-evidence-and-closure.md`,
  `docs/release/phase25n-phase25-backup-health-closure-summary.md`,
  `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`,
  `scripts/validate-phase25n-backup-health-evidence-closure-gate.js`,
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
        `branch "${currentBranch}" has empty diff but is not main — this indicates the branch was not created from a correct baseline or no Phase 25N changes were committed`
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

      const generatedArtifacts = changedFiles.filter(f =>
        f.startsWith('node_modules/') ||
        f.startsWith('dist/') ||
        f.startsWith('coverage/') ||
        f.startsWith('test-results/') ||
        f.startsWith('playwright-report/') ||
        f === 'FETCH_HEAD'
      );
      generatedArtifacts.length === 0
        ? pass('No generated artifacts in changed files')
        : fail('Generated artifacts found in changed files', generatedArtifacts.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 17. No package/dependency changes ────────────────────────────────────────

const packageJson = readFile('package.json') || '';
const packageLock = readFile('package-lock.json') || '';

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 25N');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 25N');

// ── 18. No telemetry/analytics strings added ─────────────────────────────────

const telemetryPatterns = [
  'analytics(',
  'gtag(',
  'mixpanel(',
  'amplitude(',
  'segment(',
  'telemetry(',
  'datadog(',
  'Sentry.init(',
];

const newDocContent =
  (readFile(TESTING_DOC) || '') +
  (readFile(RELEASE_DOC) || '') +
  (readFile(PLANNING_DOC) || '');

const telemetryFound = telemetryPatterns.filter(p => newDocContent.toLowerCase().includes(p.toLowerCase()));
telemetryFound.length === 0
  ? pass('No telemetry/analytics strings in new Phase 25N files')
  : fail('Telemetry/analytics strings found in Phase 25N files', telemetryFound.join(', '));

// ── 19. Production backup/export/restore files unchanged ─────────────────────

const BACKUP_RESTORE_FILES = [
  'src/state/backupHealthSignal.js',
  'src/state/backupHealthIntegrationPrototype.js',
  'src/state/backupHealthUiPrototype.js',
];

for (const f of BACKUP_RESTORE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Production/prototype file not modified: ${f}`)
    : fail(`Phase 25N must not modify ${f}`);
}

// ── 20. Prior Phase 25M/25L/25K/25I files not modified ───────────────────────

const PRIOR_PHASE_FILES = [
  `docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md`,
  `docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md`,
  `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js`,
  `docs/planning/phase25l-backup-health-production-ui-design-gate.md`,
  `docs/release/phase25l-backup-health-production-ui-design-gate-summary.md`,
  `scripts/validate-phase25l-backup-health-production-ui-design-gate.js`,
  `docs/testing/phase25k-backup-health-test-only-default-off-integration-prototype.md`,
  `docs/release/phase25k-backup-health-test-only-default-off-integration-prototype-summary.md`,
  `scripts/validate-phase25k-backup-health-test-only-default-off-integration-prototype.js`,
  `docs/testing/phase25i-backup-health-thin-read-only-signal-layer.md`,
  `docs/release/phase25i-backup-health-thin-read-only-signal-layer-summary.md`,
  `scripts/validate-phase25i-backup-health-thin-read-only-signal-layer.js`,
];

for (const f of PRIOR_PHASE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Prior phase file not modified: ${f}`)
    : fail(`Phase 25N must not modify prior phase file: ${f}`);
}

// ── 21. No runtime/source/test/e2e/ADR files changed ─────────────────────────

const runtimeOrTestFiles = changedFiles.filter(f =>
  f.startsWith('src/') ||
  f.startsWith('tests/') ||
  f.startsWith('e2e/') ||
  f.startsWith('docs/adr/')
);
runtimeOrTestFiles.length === 0
  ? pass('No runtime/source/test/e2e/ADR files changed')
  : fail('Phase 25N must not change runtime/source/test/e2e/ADR files', runtimeOrTestFiles.join(', '));

// ── 22. Docs do not claim forbidden things ────────────────────────────────────

const allPhase25nContent =
  (readFile(TESTING_DOC) || '') +
  '\n' +
  (readFile(RELEASE_DOC) || '') +
  '\n' +
  (readFile(PLANNING_DOC) || '');

const allPhase25nLines = allPhase25nContent
  .split('\n')
  .filter(l => {
    const lower = l.toLowerCase();
    return !(
      lower.includes('does not claim') ||
      lower.includes('must not claim') ||
      lower.includes('do not claim') ||
      lower.includes('cannot claim') ||
      lower.includes('does not approve') ||
      lower.includes('must not approve') ||
      lower.includes('phase 25') ||
      lower.includes('phase 26a must not') ||
      lower.includes('forbidden') ||
      lower.includes('not approved') ||
      lower.includes('does not add') ||
      lower.includes('does not prove') ||
      lower.includes('not proven') ||
      lower.includes('remains unchanged') ||
      lower.includes('not automatically') ||
      lower.includes('not executed') ||
      lower.includes('no browser') ||
      lower.includes('not claimed')
    );
  })
  .join('\n');

!allPhase25nLines.includes('BETA_READY: true') && !allPhase25nLines.includes('BETA_READY=true')
  ? pass('Phase 25N docs do not claim BETA_READY')
  : fail('Phase 25N docs must not claim BETA_READY');

!allPhase25nLines.includes('production Backup Health UI is ready')
  ? pass('Phase 25N docs do not claim production Backup Health UI is ready')
  : fail('Phase 25N docs must not claim production Backup Health UI is ready');

!allPhase25nLines.includes('browser evidence was executed')
  ? pass('Phase 25N docs do not claim browser evidence was executed (without actual execution)')
  : fail('Phase 25N docs must not claim browser evidence execution unless actually performed');

// ── Final summary ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 25N validator OK');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — Phase 25N validator FAIL');
  process.exit(1);
}
