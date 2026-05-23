#!/usr/bin/env node
/**
 * Phase 26A Static Validator — Local-First Hybrid Readiness Direction
 *
 * PHASE26A_LOCAL_FIRST_HYBRID_READINESS_DIRECTION_STATUS: COMPLETED_DIRECTION_AND_RUN_PACK_GATE
 * PHASE26A_LOCAL_FIRST_HYBRID_DIRECTION_DECISION: PASS_TO_PHASE26B_BROADER_EVIDENCE_EXECUTION_BEFORE_RUNTIME
 * PHASE26A_LOCAL_FIRST_HYBRID_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
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

const PLANNING_DOC = `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`;
const TESTING_DOC = `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`;
const RELEASE_DOC = `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`;
const VALIDATOR = `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(PLANNING_DOC)
  ? pass('Planning direction doc exists')
  : fail('Planning direction doc exists', `missing ${PLANNING_DOC}`);

fileExists(TESTING_DOC)
  ? pass('Testing evidence run pack doc exists')
  : fail('Testing evidence run pack doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase26a')
  ? pass('CI registers Phase 26A validator')
  : fail('CI registers Phase 26A validator', 'e2e-smoke.yml does not reference validate-phase26a');

(ciContent.includes('Fetch origin main for Phase 26A validator') || ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step for Phase 26A validator')
  : fail('CI has explicit fetch step for Phase 26A validator', 'missing fetch step before Phase 26A validator');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25N validators as active merge-blocking steps')
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

const PHASE26A_TOKENS = [
  'PHASE26A_LOCAL_FIRST_HYBRID_READINESS_DIRECTION_STATUS: COMPLETED_DIRECTION_AND_RUN_PACK_GATE',
  'PHASE26A_LOCAL_FIRST_HYBRID_DIRECTION_DECISION: PASS_TO_PHASE26B_BROADER_EVIDENCE_EXECUTION_BEFORE_RUNTIME',
  'PHASE26A_LOCAL_FIRST_HYBRID_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
];

const allDocContent =
  (readFile(PLANNING_DOC) || '') + '\n' +
  (readFile(TESTING_DOC) || '') + '\n' +
  (readFile(RELEASE_DOC) || '');

for (const token of PHASE26A_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 70)}`)
    : fail('Required token missing', token);
}

// ── 4. Required direction doc headings ───────────────────────────────────────

const planningDocContent = readFile(PLANNING_DOC) || '';

const REQUIRED_PLANNING_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Purpose',
  '## Direction decision',
  '## Candidate directions considered',
  '## Chosen direction',
  '## Deferred directions',
  '## Why broaden evidence before runtime',
  '## Evidence needed before stronger claims',
  '## Runtime work boundary',
  '## Storage and backup/export/restore boundary',
  '## Production UI boundary',
  '## Local-first/no-cloud boundary',
  '## Claim boundary',
  '## Phase 26B framing',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_PLANNING_SECTIONS) {
  planningDocContent.includes(section)
    ? pass(`Planning doc has section: ${section}`)
    : fail('Planning doc missing section', section);
}

// ── 5. All four candidate directions appear ───────────────────────────────────

const CANDIDATE_DIRECTIONS = [
  'broaden evidence matrix',
  'limited default-off UI wiring design',
  'backup/export/restore adapter-awareness planning',
  'local-first hybrid closure/readiness decision',
];

for (const direction of CANDIDATE_DIRECTIONS) {
  planningDocContent.includes(direction)
    ? pass(`Candidate direction present: "${direction}"`)
    : fail('Candidate direction missing', `"${direction}"`);
}

// ── 6. Chosen direction is broaden evidence matrix ────────────────────────────

planningDocContent.includes('Chosen direction: **broaden evidence matrix**') ||
planningDocContent.includes('Chosen direction\n\n**broaden evidence matrix**') ||
(planningDocContent.includes('## Chosen direction') && planningDocContent.includes('broaden evidence matrix'))
  ? pass('Chosen direction is broaden evidence matrix')
  : fail('Chosen direction must be broaden evidence matrix');

// ── 7. Deferred directions exist and are marked not approved ─────────────────

const DEFERRED_DIRECTION_TERMS = [
  'limited default-off UI wiring design',
  'backup/export/restore adapter-awareness planning',
  'local-first hybrid closure/readiness decision',
];

planningDocContent.includes('## Deferred directions')
  ? pass('Deferred directions section present')
  : fail('Deferred directions section missing');

for (const dir of DEFERRED_DIRECTION_TERMS) {
  planningDocContent.includes(dir)
    ? pass(`Deferred direction mentioned: "${dir}"`)
    : fail('Deferred direction missing', `"${dir}"`);
}

(planningDocContent.includes('not approved by default') || planningDocContent.includes('not approved'))
  ? pass('Deferred directions are marked not approved')
  : fail('Deferred directions must be marked as not approved by default');

// ── 8. Required testing doc headings ─────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';

const REQUIRED_TESTING_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Run-pack status',
  '## Purpose',
  '## Evidence matrix',
  '## Data safety rules',
  '## Manual/browser evidence boundary',
  '## Pass/fail criteria for Phase 26B',
  '## Failure/anomaly recording',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const section of REQUIRED_TESTING_SECTIONS) {
  testingDocContent.includes(section)
    ? pass(`Testing doc has section: ${section}`)
    : fail('Testing doc missing section', section);
}

// ── 9. Evidence matrix required rows and columns ──────────────────────────────

const REQUIRED_EVIDENCE_ROWS = [
  'clean install/build/unit baseline',
  'Phase 25K default-off integration behavior',
  'Phase 25M default-off view-model behavior',
  'no production-visible UI wiring',
  'no route/navigation/settings/library/dashboard wiring',
  'no write APIs',
  'no backup/export/restore behavior changes',
  'no storage driver changes',
  'Vietnamese-first copy boundary',
  'generated/test data only',
  'manual/browser smoke optional only if user-facing behavior is later claimed',
];

const REQUIRED_EVIDENCE_COLUMNS = [
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

for (const row of REQUIRED_EVIDENCE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence matrix has required row: ${row}`)
    : fail('Evidence matrix missing required row', row);
}

for (const col of REQUIRED_EVIDENCE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence matrix has required column: ${col}`)
    : fail('Evidence matrix missing required column', col);
}

// ── 10. Run pack is PREPARED_NOT_EXECUTED and does not claim execution ────────

testingDocContent.includes('PREPARED_NOT_EXECUTED')
  ? pass('Testing doc contains PREPARED_NOT_EXECUTED status')
  : fail('Testing doc must contain PREPARED_NOT_EXECUTED status');

testingDocContent.includes('NOT_RUN_PHASE26A_PREPARED_ONLY')
  ? pass('Testing doc uses NOT_RUN_PHASE26A_PREPARED_ONLY for unexecuted observed results')
  : fail('Testing doc must use NOT_RUN_PHASE26A_PREPARED_ONLY for unexecuted observed results');

const testingLines = testingDocContent.split('\n').filter(l => {
  const lower = l.toLowerCase();
  return !(
    lower.includes('not_run') ||
    lower.includes('prepared_not_executed') ||
    lower.includes('not executed') ||
    lower.includes('not claimed') ||
    lower.includes('does not execute') ||
    lower.includes('no evidence run') ||
    lower.includes('prepared only')
  );
}).join('\n');

!testingLines.includes('Phase 26B evidence execution')
  ? pass('Testing doc does not claim Phase 26B evidence execution')
  : fail('Testing doc must not claim Phase 26B evidence execution');

// ── 11. Phase 26B framing statements ─────────────────────────────────────────

const PHASE26B_FRAMING_STATEMENTS = [
  'Next recommended phase: Phase 26B — Broader Local-First Hybrid Evidence Execution and Readiness Re-Decision',
  'Phase 26B is a separate evidence execution/re-decision gate and is not automatically approved.',
  'Phase 26A does not approve runtime/storage/backup/restore changes.',
  'Phase 26A does not approve production-visible Backup Health UI.',
  'Phase 26A does not approve production adapter-aware backup/export/restore.',
  'Phase 26A does not approve BETA_READY.',
];

for (const stmt of PHASE26B_FRAMING_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Phase 26B framing statement present: "${stmt.slice(0, 70)}"`)
    : fail('Phase 26B framing statement missing', `"${stmt}"`);
}

// ── 12. Must-not-claim boundaries ────────────────────────────────────────────

const MUST_NOT_CLAIM_TERMS = [
  'BETA_READY',
  'production-visible Backup Health UI',
  'broad dashboard/settings/library rollout',
  'production adapter-aware backup/export/restore',
  'backup file format changes',
  'restore overwrite behavior changes',
  'IndexedDB production storage',
  'storage migration',
  'sync/cloud/account/auth/backend',
  'telemetry/analytics',
  'guaranteed data-loss prevention',
  'platform backup preservation claims',
  'automatic backup claims',
  'broad backup reliability',
  'local-first hybrid readiness claim beyond planning',
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  allDocContent.includes(term)
    ? pass(`Must-not-claim boundary present: "${term}"`)
    : fail('Must-not-claim boundary missing', `"${term}"`);
}

// ── 13. Required release doc headings ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Direction decision',
  '## Run-pack status',
  '## Chosen direction',
  '## Deferred directions',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 14. Required guardrail statements ────────────────────────────────────────

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
  `Full historical scripts/validate-*.js chain is not used as a Phase 26A merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 15. Rollback plan completeness ────────────────────────────────────────────

allDocContent.includes('Remove `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`.')
  ? pass('Rollback plan includes planning doc removal')
  : fail('Rollback plan must include planning doc removal');

allDocContent.includes('Remove `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`.')
  ? pass('Rollback plan includes testing doc removal')
  : fail('Rollback plan must include testing doc removal');

allDocContent.includes('Remove `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 26A CI registration')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include Phase 26A CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 26A does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 16. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`,
  `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`,
  `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`,
  `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`,
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
        `branch "${currentBranch}" has empty diff but is not main — this indicates the branch was not created from a correct baseline or no Phase 26A changes were committed`
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
        f.startsWith(`test-results/`) ||
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

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26A');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26A');

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
  (readFile(PLANNING_DOC) || '') +
  (readFile(TESTING_DOC) || '') +
  (readFile(RELEASE_DOC) || '');

const telemetryFound = telemetryPatterns.filter(p =>
  newDocContent.toLowerCase().includes(p.toLowerCase())
);
telemetryFound.length === 0
  ? pass('No telemetry/analytics strings in new Phase 26A files')
  : fail('Telemetry/analytics strings found in Phase 26A files', telemetryFound.join(', '));

// ── 19. Production backup/export/restore files unchanged ─────────────────────

const BACKUP_RESTORE_FILES = [
  `src/state/backupHealthSignal.js`,
  `src/state/backupHealthIntegrationPrototype.js`,
  `src/state/backupHealthUiPrototype.js`,
];

for (const f of BACKUP_RESTORE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Production/prototype file not modified: ${f}`)
    : fail(`Phase 26A must not modify ${f}`);
}

// ── 20. Prior Phase 25N/25M/25L/25K/25I files not modified ───────────────────

const PRIOR_PHASE_FILES = [
  `docs/testing/phase25n-backup-health-evidence-and-closure.md`,
  `docs/release/phase25n-phase25-backup-health-closure-summary.md`,
  `scripts/validate-phase25n-backup-health-evidence-closure-gate.js`,
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
  `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`,
];

for (const f of PRIOR_PHASE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Prior phase file not modified: ${f}`)
    : fail(`Phase 26A must not modify prior phase file: ${f}`);
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
  : fail('Phase 26A must not change runtime/source/test/e2e/ADR files', runtimeOrTestFiles.join(', '));

// ── 22. Docs do not contain forbidden affirmative claims ─────────────────────

const allPhase26aLines = allDocContent
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
      lower.includes('phase 26a does not') ||
      lower.includes('phase 26a must not') ||
      lower.includes('phase 26b is a separate') ||
      lower.includes('not automatically approved') ||
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
      lower.includes('does not expose') ||
      lower.includes('does not migrate') ||
      lower.includes('remains unchanged') ||
      lower.includes('no runtime') ||
      lower.includes('not proven') ||
      lower.includes('not executed') ||
      lower.includes('no browser') ||
      lower.includes('not claimed') ||
      lower.includes('not required') ||
      lower.includes('deferred')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
if (
  allPhase26aLines.includes('BETA_READY: true') ||
  allPhase26aLines.includes('BETA_READY=true') ||
  allPhase26aLines.includes('status: BETA_READY')
) {
  forbiddenDocFound.push('affirmative BETA_READY status token');
}
if (
  allPhase26aLines.includes('production UI is ready') ||
  allPhase26aLines.includes('production Backup Health UI is available') ||
  allPhase26aLines.includes('production Backup Health UI is live')
) {
  forbiddenDocFound.push('affirmative production Backup Health UI claim');
}
if (allPhase26aLines.includes('guaranteed data-loss prevention is provided')) {
  forbiddenDocFound.push('affirmative guaranteed data-loss prevention claim');
}
if (allPhase26aLines.includes('broad backup reliability is proven')) {
  forbiddenDocFound.push('affirmative broad backup reliability claim');
}
if (allPhase26aLines.includes('browser evidence was executed')) {
  forbiddenDocFound.push('affirmative browser evidence execution claim');
}

forbiddenDocFound.length === 0
  ? pass('Docs do not contain forbidden affirmative claims')
  : fail('Docs contain forbidden affirmative claims', forbiddenDocFound.join(', '));

// ── Final summary ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 26A validator OK');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — Phase 26A validator FAIL');
  process.exit(1);
}
