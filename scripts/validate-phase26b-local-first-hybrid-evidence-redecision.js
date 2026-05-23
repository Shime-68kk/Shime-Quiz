#!/usr/bin/env node
/**
 * Phase 26B Static Validator — Local-First Hybrid Evidence Re-Decision
 *
 * PHASE26B_LOCAL_FIRST_HYBRID_EVIDENCE_STATUS: COMPLETED_BROADER_STATIC_LOCAL_EVIDENCE
 * PHASE26B_LOCAL_FIRST_HYBRID_EVIDENCE_INTERPRETATION: BROADER_STATIC_LOCAL_AUTOMATED_EVIDENCE_NO_BROWSER_USER_FACING_CLAIM
 * PHASE26B_LOCAL_FIRST_HYBRID_READINESS_DECISION: HOLD_READINESS_PASS_TO_PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_GATE
 * PHASE26B_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED
 * PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase26b-local-first-hybrid-evidence-execution.md`;
const RELEASE_DOC = `docs/release/phase26b-local-first-hybrid-readiness-redecision-summary.md`;
const SEED_DOC = `docs/planning/phase26c-limited-default-off-ui-wiring-design-seed.md`;
const VALIDATOR = `scripts/validate-phase26b-local-first-hybrid-evidence-redecision.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass('Testing evidence execution doc exists')
  : fail('Testing evidence execution doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(SEED_DOC)
  ? pass('Phase 26C planning seed doc exists')
  : fail('Phase 26C planning seed doc exists', `missing ${SEED_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase26b')
  ? pass('CI registers Phase 26B validator')
  : fail('CI registers Phase 26B validator', 'e2e-smoke.yml does not reference validate-phase26b');

(ciContent.includes('Fetch origin main for Phase 26B validator') || ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step for Phase 26B validator')
  : fail('CI has explicit fetch step for Phase 26B validator', 'missing fetch step before Phase 26B validator');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 26A validators as active merge-blocking steps')
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

const PHASE26B_TOKENS = [
  'PHASE26B_LOCAL_FIRST_HYBRID_EVIDENCE_STATUS: COMPLETED_BROADER_STATIC_LOCAL_EVIDENCE',
  'PHASE26B_LOCAL_FIRST_HYBRID_EVIDENCE_INTERPRETATION: BROADER_STATIC_LOCAL_AUTOMATED_EVIDENCE_NO_BROWSER_USER_FACING_CLAIM',
  'PHASE26B_LOCAL_FIRST_HYBRID_READINESS_DECISION: HOLD_READINESS_PASS_TO_PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_GATE',
  'PHASE26B_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED',
  'PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED',
];

const allDocContent =
  (readFile(TESTING_DOC) || '') + '\n' +
  (readFile(RELEASE_DOC) || '') + '\n' +
  (readFile(SEED_DOC) || '');

for (const token of PHASE26B_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing/evidence doc headings ────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';

const REQUIRED_TESTING_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Evidence interpretation',
  '## Readiness decision',
  '## Evidence execution table',
  '## Manual/browser evidence status',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Production UI boundary',
  '## Local-first/no-cloud boundary',
  '## Claim boundary',
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

// ── 5. Evidence table required columns ───────────────────────────────────────

const REQUIRED_EVIDENCE_COLUMNS = [
  'Evidence area',
  'Command/check',
  'Data requirement',
  'Observed result',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_EVIDENCE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence table has required column: ${col}`)
    : fail('Evidence table missing required column', col);
}

// ── 6. Evidence table required rows ──────────────────────────────────────────

const REQUIRED_EVIDENCE_ROWS = [
  'npm ci clean install baseline',
  'build baseline',
  'full unit test baseline',
  'Phase 25K default-off integration behavior',
  'Phase 25M default-off view-model behavior',
  'no production-visible UI wiring',
  'no route/navigation/settings/library/dashboard wiring',
  'no write APIs',
  'no backup/export/restore behavior changes',
  'no storage driver changes',
  'Vietnamese-first copy boundary',
  'generated/test data only',
  'manual/browser evidence status',
  'generated artifact cleanup',
  'patch apply integrity',
];

for (const row of REQUIRED_EVIDENCE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table has required row: ${row}`)
    : fail('Evidence table missing required row', row);
}

// ── 7. Manual/browser evidence status check ───────────────────────────────────

testingDocContent.includes('NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED')
  ? pass('Evidence doc contains NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED status')
  : fail('Evidence doc must contain NOT_EXECUTED_NO_USER_FACING_BEHAVIOR_CLAIMED status');

// Ensure no affirmative browser/manual execution claim appears outside negation context
const testingLines = testingDocContent.split('\n').filter(l => {
  const lower = l.toLowerCase();
  return !(
    lower.includes('not_executed') ||
    lower.includes('not executed') ||
    lower.includes('not claimed') ||
    lower.includes('does not execute') ||
    lower.includes('no browser') ||
    lower.includes('no evidence run') ||
    lower.includes('not required') ||
    lower.includes('not applicable') ||
    lower.includes('not run') ||
    lower.includes('not performed') ||
    lower.includes('was not executed')
  );
}).join('\n');

!testingLines.includes('browser evidence was executed')
  ? pass('Evidence doc does not claim browser evidence execution')
  : fail('Evidence doc must not affirmatively claim browser evidence execution');

// ── 8. Readiness decision holds readiness and passes only to Phase 26C ───────

allDocContent.includes('HOLD_READINESS_PASS_TO_PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_GATE')
  ? pass('Readiness decision holds readiness and passes to Phase 26C design gate')
  : fail('Readiness decision must be HOLD_READINESS_PASS_TO_PHASE26C_LIMITED_DEFAULT_OFF_UI_WIRING_DESIGN_GATE');

allDocContent.includes('Phase 26C is a separate design gate and is not automatically approved.')
  ? pass('Docs state Phase 26C is a separate design gate')
  : fail('Docs must state Phase 26C is a separate design gate');

// ── 9. Phase 26C seed headings ────────────────────────────────────────────────

const seedDocContent = readFile(SEED_DOC) || '';

const REQUIRED_SEED_SECTIONS = [
  '## Status token',
  '## Purpose',
  '## Planning constraints',
  '## Candidate limited surfaces',
  '## Required gates before runtime',
  '## Forbidden default approvals',
  '## Evidence needed before user-facing claims',
  '## Recommended next step',
];

for (const section of REQUIRED_SEED_SECTIONS) {
  seedDocContent.includes(section)
    ? pass(`Phase 26C seed doc has section: ${section}`)
    : fail('Phase 26C seed doc missing section', section);
}

seedDocContent.includes('PREPARED_PLANNING_SEED')
  ? pass('Phase 26C seed doc contains PREPARED_PLANNING_SEED token')
  : fail('Phase 26C seed doc must contain PREPARED_PLANNING_SEED token');

seedDocContent.includes('does not automatically approve runtime UI wiring') ||
seedDocContent.includes('planning/design-first')
  ? pass('Phase 26C seed states it is planning/design-first and does not automatically approve runtime UI wiring')
  : fail('Phase 26C seed must state it is planning/design-first and does not automatically approve runtime UI wiring');

// ── 10. Must-not-claim boundaries exist ──────────────────────────────────────

const MUST_NOT_CLAIM_TERMS = [
  'BETA_READY',
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
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  allDocContent.includes(term)
    ? pass(`Must-not-claim boundary present: "${term}"`)
    : fail('Must-not-claim boundary missing', `"${term}"`);
}

// ── 11. Required release doc headings ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Scope',
  '## Evidence interpretation',
  '## Readiness decision',
  '## Evidence summary',
  '## What is supported',
  '## What remains not proven',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 12. Required guardrail statements ────────────────────────────────────────

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
  `Full historical scripts/validate-*.js chain is not used as a Phase 26B merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 80)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 13. Rollback plan completeness ────────────────────────────────────────────

allDocContent.includes('Remove `docs/testing/phase26b-local-first-hybrid-evidence-execution.md`.')
  ? pass('Rollback plan includes testing doc removal')
  : fail('Rollback plan must include testing doc removal');

allDocContent.includes('Remove `docs/release/phase26b-local-first-hybrid-readiness-redecision-summary.md`.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove `docs/planning/phase26c-limited-default-off-ui-wiring-design-seed.md`.')
  ? pass('Rollback plan includes seed doc removal')
  : fail('Rollback plan must include seed doc removal');

allDocContent.includes('Remove `scripts/validate-phase26b-local-first-hybrid-evidence-redecision.js`.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 26B CI registration')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include Phase 26B CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 26B does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 14. Next recommended phase framing statements ────────────────────────────

const PHASE26C_FRAMING_STATEMENTS = [
  'Next recommended phase: Phase 26C — Limited Default-Off UI Wiring Design Gate',
  'Phase 26C is a separate design gate and is not automatically approved.',
  'Phase 26B does not approve runtime UI wiring.',
  'Phase 26B does not approve production adapter-aware backup/export/restore.',
  'Phase 26B does not approve BETA_READY.',
];

for (const stmt of PHASE26C_FRAMING_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Phase 26C framing statement present: "${stmt.slice(0, 80)}"`)
    : fail('Phase 26C framing statement missing', `"${stmt}"`);
}

// ── 15. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase26b-local-first-hybrid-evidence-execution.md`,
  `docs/release/phase26b-local-first-hybrid-readiness-redecision-summary.md`,
  `docs/planning/phase26c-limited-default-off-ui-wiring-design-seed.md`,
  `scripts/validate-phase26b-local-first-hybrid-evidence-redecision.js`,
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
        `branch "${currentBranch}" has empty diff but is not main — no Phase 26B changes committed`
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

// ── 16. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26B');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26B');

// ── 17. No telemetry/analytics strings added ─────────────────────────────────

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
  (readFile(SEED_DOC) || '');

const telemetryFound = telemetryPatterns.filter(p =>
  newDocContent.toLowerCase().includes(p.toLowerCase())
);
telemetryFound.length === 0
  ? pass('No telemetry/analytics strings in new Phase 26B files')
  : fail('Telemetry/analytics strings found in Phase 26B files', telemetryFound.join(', '));

// ── 18. Production backup/export/restore files unchanged ─────────────────────

const BACKUP_RESTORE_FILES = [
  `src/state/backupHealthSignal.js`,
  `src/state/backupHealthIntegrationPrototype.js`,
  `src/state/backupHealthUiPrototype.js`,
];

for (const f of BACKUP_RESTORE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Production/prototype file not modified: ${f}`)
    : fail(`Phase 26B must not modify ${f}`);
}

// ── 19. Prior Phase 26A/25N/25M/25L/25K/25I files not modified ───────────────

const PRIOR_PHASE_FILES = [
  `docs/planning/phase26a-local-first-hybrid-readiness-direction.md`,
  `docs/planning/phase26a-local-first-hybrid-readiness-planning-seed.md`,
  `docs/testing/phase26a-local-first-hybrid-evidence-run-pack.md`,
  `docs/release/phase26a-local-first-hybrid-readiness-direction-summary.md`,
  `scripts/validate-phase26a-local-first-hybrid-readiness-direction.js`,
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
];

for (const f of PRIOR_PHASE_FILES) {
  !changedFiles.includes(f)
    ? pass(`Prior phase file not modified: ${f}`)
    : fail(`Phase 26B must not modify prior phase file: ${f}`);
}

// ── 20. No runtime/source/test/e2e/ADR files changed ─────────────────────────

const runtimeOrTestFiles = changedFiles.filter(f =>
  f.startsWith('src/') ||
  f.startsWith('tests/') ||
  f.startsWith('e2e/') ||
  f.startsWith('docs/adr/')
);
runtimeOrTestFiles.length === 0
  ? pass('No runtime/source/test/e2e/ADR files changed')
  : fail('Phase 26B must not change runtime/source/test/e2e/ADR files', runtimeOrTestFiles.join(', '));

// ── 21. No sync/cloud/account/auth/backend files changed ─────────────────────

const syncCloudFiles = changedFiles.filter(f =>
  f.includes('sync') ||
  f.includes('cloud') ||
  f.includes('account') ||
  f.includes('auth') ||
  f.includes('backend')
);
syncCloudFiles.length === 0
  ? pass('No sync/cloud/account/auth/backend files changed')
  : fail('Phase 26B must not change sync/cloud/account/auth/backend files', syncCloudFiles.join(', '));

// ── 22. Docs do not contain forbidden affirmative claims ─────────────────────

const allPhase26bLines = allDocContent
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
      lower.includes('phase 26b does not') ||
      lower.includes('phase 26b must not') ||
      lower.includes('phase 26c is a separate') ||
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
      lower.includes('what remains not proven') ||
      lower.includes('what the evidence does not prove') ||
      lower.includes('forbidden default approvals') ||
      lower.includes('not permitted') ||
      lower.includes('not approved by')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
if (
  allPhase26bLines.includes('BETA_READY: true') ||
  allPhase26bLines.includes('BETA_READY=true') ||
  allPhase26bLines.includes('status: BETA_READY')
) {
  forbiddenDocFound.push('affirmative BETA_READY status token');
}
if (
  allPhase26bLines.includes('production UI is ready') ||
  allPhase26bLines.includes('production Backup Health UI is available') ||
  allPhase26bLines.includes('production Backup Health UI is live')
) {
  forbiddenDocFound.push('affirmative production Backup Health UI claim');
}
if (allPhase26bLines.includes('guaranteed data-loss prevention is provided')) {
  forbiddenDocFound.push('affirmative guaranteed data-loss prevention claim');
}
if (allPhase26bLines.includes('broad backup reliability is proven')) {
  forbiddenDocFound.push('affirmative broad backup reliability claim');
}
if (allPhase26bLines.includes('browser evidence was executed')) {
  forbiddenDocFound.push('affirmative browser evidence execution claim');
}

forbiddenDocFound.length === 0
  ? pass('Docs do not contain forbidden affirmative claims')
  : fail('Docs contain forbidden affirmative claims', forbiddenDocFound.join(', '));

// ── Final summary ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 26B validator OK');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — Phase 26B validator FAIL');
  process.exit(1);
}
