#!/usr/bin/env node
/**
 * Phase 26C Static Validator — Limited Default-Off UI Wiring Design Gate
 *
 * PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE
 * PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
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

const DESIGN_DOC = `docs/planning/phase26c-limited-default-off-ui-wiring-design.md`;
const RUN_PACK_DOC = `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`;
const RELEASE_DOC = `docs/release/phase26c-limited-default-off-ui-wiring-design-summary.md`;
const VALIDATOR = `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(DESIGN_DOC)
  ? pass('Design doc exists')
  : fail('Design doc exists', `missing ${DESIGN_DOC}`);

fileExists(RUN_PACK_DOC)
  ? pass('Run pack doc exists')
  : fail('Run pack doc exists', `missing ${RUN_PACK_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase26c')
  ? pass('CI registers Phase 26C validator')
  : fail('CI registers Phase 26C validator', 'e2e-smoke.yml does not reference validate-phase26c');

(ciContent.includes('Fetch origin main for Phase 26C validator') || ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step for Phase 26C validator')
  : fail('CI has explicit fetch step for Phase 26C validator', 'missing fetch step before Phase 26C validator');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 26B validators as active merge-blocking steps')
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

const PHASE26C_TOKENS = [
  'PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DECISION: PASS_TO_PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_WITH_TESTER_GATE',
  'PHASE26C_UI_WIRING_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
];

const allDocContent =
  (readFile(DESIGN_DOC) || '') + '\n' +
  (readFile(RUN_PACK_DOC) || '') + '\n' +
  (readFile(RELEASE_DOC) || '');

for (const token of PHASE26C_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required design doc headings ──────────────────────────────────────────

const designDocContent = readFile(DESIGN_DOC) || '';

const REQUIRED_DESIGN_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Purpose',
  '## Design decision',
  '## Limited default-off UI wiring boundary',
  '## Allowed future Phase 26D implementation scope',
  '## Forbidden future implementation scope',
  '## Candidate limited surfaces',
  '## Chosen future surface',
  '## Deferred surfaces',
  '## Phase 25M view-model import boundary',
  '## Default-off gate requirements',
  '## No-write and no-telemetry boundary',
  '## Backup/export/restore boundary',
  '## Vietnamese-first copy boundary',
  '## Accessibility and keyboard navigation plan',
  '## Manual/browser evidence plan',
  '## Validator plan',
  '## Rollback/removal plan',
  '## Proposed file ownership for Phase 26D',
  '## Review and tester requirements',
  '## Go/no-go criteria',
  '## What Phase 26C can claim',
  '## What Phase 26C must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_DESIGN_SECTIONS) {
  designDocContent.includes(section)
    ? pass(`Design doc has section: ${section}`)
    : fail('Design doc missing section', section);
}

// ── 5. Candidate surfaces exist ───────────────────────────────────────────────

const CANDIDATE_SURFACES = [
  'hidden default-off developer/test harness surface',
  'settings-local-data backup health hint',
  'library backup health hint',
  'dashboard backup health hint',
  'navigation route',
];

for (const surface of CANDIDATE_SURFACES) {
  designDocContent.includes(surface)
    ? pass(`Candidate surface present: "${surface}"`)
    : fail('Candidate surface missing', `"${surface}"`);
}

// ── 6. Chosen future surface is hidden default-off developer/test harness ─────

(
  designDocContent.includes('Chosen future Phase 26D surface: hidden default-off developer/test harness surface') ||
  (designDocContent.includes('## Chosen future surface') && designDocContent.includes('hidden default-off developer/test harness surface'))
)
  ? pass('Chosen future surface is hidden default-off developer/test harness surface')
  : fail('Chosen future surface must be hidden default-off developer/test harness surface');

// ── 7. Deferred surfaces exist ────────────────────────────────────────────────

const DEFERRED_SURFACES = [
  'settings-local-data backup health hint is deferred',
  'library backup health hint is deferred',
  'dashboard backup health hint is deferred',
  'navigation route is forbidden by default',
];

for (const surface of DEFERRED_SURFACES) {
  designDocContent.includes(surface)
    ? pass(`Deferred surface present: "${surface}"`)
    : fail('Deferred surface statement missing', `"${surface}"`);
}

// ── 8. Allowed future Phase 26D implementation scope ─────────────────────────

const ALLOWED_SCOPE_TERMS = [
  'limited hidden/default-off UI wiring prototype',
  'read-only only',
  'local-only',
  'default-off by default',
  'explicit test/default-off gate required',
  'may import Phase 25M view-model only if import gate passes',
  'no production-visible UI by default',
  'no broad dashboard/settings/library rollout',
  'no navigation route',
  'no writes',
  'no backup/export/restore behavior changes',
  'no storage driver changes',
  'no telemetry/analytics',
  'no sync/cloud/account/auth/backend',
  'no storage migration',
  'no IndexedDB production storage',
  'no BETA_READY',
  'generated/test data only for evidence',
  'tester/manual evidence required before any user-facing/browser behavior claim',
];

for (const term of ALLOWED_SCOPE_TERMS) {
  designDocContent.includes(term)
    ? pass(`Allowed Phase 26D scope term present: "${term.slice(0, 60)}"`)
    : fail('Allowed Phase 26D scope term missing', `"${term}"`);
}

// ── 9. Forbidden future implementation scope ──────────────────────────────────

const FORBIDDEN_SCOPE_TERMS = [
  'production-visible Backup Health UI by default',
  'broad dashboard/settings/library rollout',
  'navigation route',
  'automatic backup claims',
  'platform backup preservation claims',
  'guaranteed data-loss prevention claims',
  'cloud/account recovery copy',
  'scanning learner content',
  'persistent tracking added to calculate health',
  'production adapter-aware backup/export/restore',
  'telemetry/analytics',
  'storage migration',
  'IndexedDB production storage',
  'sync/cloud/account/auth/backend',
  'BETA_READY',
];

for (const term of FORBIDDEN_SCOPE_TERMS) {
  designDocContent.includes(term)
    ? pass(`Forbidden Phase 26D scope term present: "${term.slice(0, 60)}"`)
    : fail('Forbidden Phase 26D scope term missing', `"${term}"`);
}

// ── 10. Phase 26D framing statements ─────────────────────────────────────────

const PHASE26D_FRAMING_STATEMENTS = [
  'Next recommended phase: Phase 26D — Limited Default-Off UI Wiring Prototype and Tester Evidence',
  'Phase 26D is a separate scoped implementation/evidence gate and is not automatically approved.',
  'Phase 26C does not approve production-visible Backup Health UI.',
  'Phase 26C does not approve broad dashboard/settings/library rollout.',
  'Phase 26C does not approve production adapter-aware backup/export/restore.',
  'Phase 26C does not approve BETA_READY.',
];

for (const stmt of PHASE26D_FRAMING_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Phase 26D framing statement present: "${stmt.slice(0, 80)}"`)
    : fail('Phase 26D framing statement missing', `"${stmt}"`);
}

// ── 11. Run pack is PREPARED_NOT_EXECUTED and does not claim execution ────────

const runPackDocContent = readFile(RUN_PACK_DOC) || '';

runPackDocContent.includes('PREPARED_NOT_EXECUTED')
  ? pass('Run pack doc contains PREPARED_NOT_EXECUTED status')
  : fail('Run pack doc must contain PREPARED_NOT_EXECUTED status');

runPackDocContent.includes('NOT_RUN_PHASE26C_PREPARED_ONLY')
  ? pass('Run pack doc uses NOT_RUN_PHASE26C_PREPARED_ONLY for unexecuted observed results')
  : fail('Run pack doc must use NOT_RUN_PHASE26C_PREPARED_ONLY for unexecuted observed results');

// ── 12. Required run pack headings ────────────────────────────────────────────

const REQUIRED_RUN_PACK_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Run-pack status',
  '## Purpose',
  '## Phase 26D evidence matrix',
  '## Data safety rules',
  '## Manual/browser evidence boundary',
  '## Tester requirement',
  '## Pass/fail criteria for Phase 26D',
  '## Failure/anomaly recording',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const section of REQUIRED_RUN_PACK_SECTIONS) {
  runPackDocContent.includes(section)
    ? pass(`Run pack doc has section: ${section}`)
    : fail('Run pack doc missing section', section);
}

// ── 13. Evidence matrix required columns ─────────────────────────────────────

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
  runPackDocContent.includes(col)
    ? pass(`Evidence matrix has required column: ${col}`)
    : fail('Evidence matrix missing required column', col);
}

// ── 14. Evidence matrix required rows ─────────────────────────────────────────

const REQUIRED_MATRIX_ROWS = [
  'default-off gate behavior',
  'hidden test harness is not production-visible',
  'Phase 25M view-model import boundary',
  'no route/navigation/settings/library/dashboard broad rollout',
  'no write APIs',
  'no backup/export/restore behavior changes',
  'no storage driver changes',
  'no telemetry/analytics',
  'Vietnamese-first copy boundary',
  'accessibility and keyboard quick check',
  'manual/browser smoke with generated/test data only if user-facing behavior is claimed',
  'rollback/removal check',
];

for (const row of REQUIRED_MATRIX_ROWS) {
  runPackDocContent.includes(row)
    ? pass(`Evidence matrix has required row: ${row}`)
    : fail('Evidence matrix missing required row', row);
}

// ── 15. Required release doc headings ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Design decision',
  '## Chosen future surface',
  '## Deferred surfaces',
  '## Run-pack status',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 16. Must-not-claim boundaries ────────────────────────────────────────────

const MUST_NOT_CLAIM_TERMS = [
  'production-visible Backup Health UI',
  'broad dashboard/settings/library rollout',
  'production adapter-aware backup/export/restore',
  'backup file format',
  'restore overwrite behavior',
  'IndexedDB production storage',
  'storage migration',
  'sync/cloud/account/auth/backend',
  'telemetry or analytics',
  'guaranteed data-loss prevention',
  'broad backup reliability',
  'BETA_READY',
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  allDocContent.includes(term)
    ? pass(`Must-not-claim boundary present: "${term}"`)
    : fail('Must-not-claim boundary missing', `"${term}"`);
}

// ── 17. Required guardrail statements ────────────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 26C merge-blocking requirement.',
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 80)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 18. Rollback plan completeness ────────────────────────────────────────────

allDocContent.includes('Remove `docs/planning/phase26c-limited-default-off-ui-wiring-design.md`.')
  ? pass('Rollback plan includes design doc removal')
  : fail('Rollback plan must include design doc removal');

allDocContent.includes('Remove `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`.')
  ? pass('Rollback plan includes run pack doc removal')
  : fail('Rollback plan must include run pack doc removal');

allDocContent.includes('Remove `docs/release/phase26c-limited-default-off-ui-wiring-design-summary.md`.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 26C CI registration')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include Phase 26C CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 26C does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 19. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/planning/phase26c-limited-default-off-ui-wiring-design.md`,
  `docs/testing/phase26c-limited-default-off-ui-wiring-run-pack.md`,
  `docs/release/phase26c-limited-default-off-ui-wiring-design-summary.md`,
  `scripts/validate-phase26c-limited-default-off-ui-wiring-design.js`,
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
        `branch "${currentBranch}" has empty diff but is not main — no Phase 26C changes committed`
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

// ── 20. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26C');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26C');

// ── 21. No telemetry/analytics strings added ─────────────────────────────────

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
  (readFile(DESIGN_DOC) || '') +
  (readFile(RUN_PACK_DOC) || '') +
  (readFile(RELEASE_DOC) || '');

const telemetryFound = telemetryPatterns.filter(p =>
  newDocContent.toLowerCase().includes(p.toLowerCase())
);
telemetryFound.length === 0
  ? pass('No telemetry/analytics strings in new Phase 26C files')
  : fail('Telemetry/analytics strings found in Phase 26C files', telemetryFound.join(', '));

// ── 22. Production backup/export/restore files unchanged ─────────────────────

const BACKUP_RESTORE_FILES = [
  `src/state/backupHealthSignal.js`,
  `src/state/backupHealthIntegrationPrototype.js`,
  `src/state/backupHealthUiPrototype.js`,
];

for (const f of BACKUP_RESTORE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Production/prototype file not modified: ${f}`)
    : fail(`Phase 26C must not modify ${f}`);
}

// ── 23. Prior Phase 26B/26A/25N/25M/25L/25K/25I files not modified ───────────

const PRIOR_PHASE_FILES = [
  `docs/testing/phase26b-local-first-hybrid-evidence-execution.md`,
  `docs/release/phase26b-local-first-hybrid-readiness-redecision-summary.md`,
  `scripts/validate-phase26b-local-first-hybrid-evidence-redecision.js`,
  `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`,
  `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`,
  `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`,
  `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`,
  `docs/testing/phase25n-backup-health-evidence-and-closure.md`,
  `scripts/validate-phase25n-backup-health-evidence-closure-gate.js`,
  `docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md`,
  `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js`,
  `docs/planning/phase25l-backup-health-production-ui-design-gate.md`,
  `scripts/validate-phase25l-backup-health-production-ui-design-gate.js`,
  `docs/testing/phase25k-backup-health-test-only-default-off-integration-prototype.md`,
  `scripts/validate-phase25k-backup-health-test-only-default-off-integration-prototype.js`,
  `docs/testing/phase25i-backup-health-thin-read-only-signal-layer.md`,
  `scripts/validate-phase25i-backup-health-thin-read-only-signal-layer.js`,
];

for (const f of PRIOR_PHASE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Prior phase file not modified: ${f}`)
    : fail(`Phase 26C must not modify prior phase file: ${f}`);
}

// ── 24. No runtime/source/test/e2e/ADR files changed ─────────────────────────

const runtimeOrTestFiles = changedFiles.filter(f =>
  f.startsWith('src/') ||
  f.startsWith('tests/') ||
  f.startsWith('e2e/') ||
  f.startsWith('docs/adr/')
);
runtimeOrTestFiles.length === 0
  ? pass('No runtime/source/test/e2e/ADR files changed')
  : fail('Phase 26C must not change runtime/source/test/e2e/ADR files', runtimeOrTestFiles.join(', '));

// ── 25. No sync/cloud/account/auth/backend files changed ─────────────────────

const syncCloudFiles = changedFiles.filter(f =>
  f.includes('sync') ||
  f.includes('cloud') ||
  f.includes('account') ||
  f.includes('auth') ||
  f.includes('backend')
);
syncCloudFiles.length === 0
  ? pass('No sync/cloud/account/auth/backend files changed')
  : fail('Phase 26C must not change sync/cloud/account/auth/backend files', syncCloudFiles.join(', '));

// ── 26. Docs do not contain forbidden affirmative claims ─────────────────────

const allPhase26cLines = allDocContent
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
      lower.includes('phase 26c does not') ||
      lower.includes('phase 26c must not') ||
      lower.includes('phase 26d is a separate') ||
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
      lower.includes('deferred') ||
      lower.includes('what phase 26c must not claim') ||
      lower.includes('what phase 26c can claim') ||
      lower.includes('forbidden future implementation scope') ||
      lower.includes('not permitted') ||
      lower.includes('not approved by') ||
      lower.includes('may not') ||
      lower.includes('must not')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
if (
  allPhase26cLines.includes('BETA_READY: true') ||
  allPhase26cLines.includes('BETA_READY=true') ||
  allPhase26cLines.includes('status: BETA_READY')
) {
  forbiddenDocFound.push('affirmative BETA_READY status token');
}
if (
  allPhase26cLines.includes('production UI is ready') ||
  allPhase26cLines.includes('production Backup Health UI is available') ||
  allPhase26cLines.includes('production Backup Health UI is live')
) {
  forbiddenDocFound.push('affirmative production Backup Health UI claim');
}
if (allPhase26cLines.includes('guaranteed data-loss prevention is provided')) {
  forbiddenDocFound.push('affirmative guaranteed data-loss prevention claim');
}
if (allPhase26cLines.includes('broad backup reliability is proven')) {
  forbiddenDocFound.push('affirmative broad backup reliability claim');
}
if (allPhase26cLines.includes('browser evidence was executed')) {
  forbiddenDocFound.push('affirmative browser evidence execution claim');
}
if (allPhase26cLines.includes('run-pack execution completed') || allPhase26cLines.includes('run pack executed')) {
  forbiddenDocFound.push('affirmative run-pack execution claim');
}

forbiddenDocFound.length === 0
  ? pass('Docs do not contain forbidden affirmative claims')
  : fail('Docs contain forbidden affirmative claims', forbiddenDocFound.join(', '));

// ── Final summary ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 26C validator OK');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — Phase 26C validator FAIL');
  process.exit(1);
}
