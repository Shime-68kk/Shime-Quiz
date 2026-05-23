#!/usr/bin/env node
/**
 * Phase 26E Static Validator — Tester Evidence Review, UI Wiring Re-Decision
 *
 * PHASE26E_TESTER_EVIDENCE_REVIEW_STATUS: COMPLETED_TESTER_EVIDENCE_REVIEW
 * PHASE26E_UI_WIRING_REDECISION: KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL
 * PHASE26E_PHASE26_CLOSURE_DECISION: CLOSED_WITH_HIDDEN_DEFAULT_OFF_HARNESS_AND_LIMITED_TESTER_EVIDENCE
 * PHASE26E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING
 * PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase26e-tester-evidence-and-ui-wiring-redecision.md`;
const RELEASE_DOC = `docs/release/phase26e-phase26-ui-wiring-closure-summary.md`;
const PLANNING_DOC = `docs/planning/phase27a-local-first-hybrid-next-direction-planning-seed.md`;
const VALIDATOR = `scripts/validate-phase26e-tester-evidence-ui-wiring-redecision.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass('Testing/evidence doc exists')
  : fail('Testing/evidence doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(PLANNING_DOC)
  ? pass('Phase 27A planning seed doc exists')
  : fail('Phase 27A planning seed doc exists', `missing ${PLANNING_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass('CI workflow exists')
  : fail('CI workflow exists', `missing ${CI_WORKFLOW}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase26e')
  ? pass('CI registers Phase 26E validator')
  : fail('CI registers Phase 26E validator', 'e2e-smoke.yml does not reference validate-phase26e');

(ciContent.includes('Fetch origin main for Phase 26E validator') || ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step before Phase 26E validator')
  : fail('CI has explicit fetch step before Phase 26E validator', 'missing fetch step before Phase 26E validator');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 26D validators as active merge-blocking steps')
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

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const planningDocContent = readFile(PLANNING_DOC) || '';
const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + planningDocContent;

const PHASE26E_TOKENS = [
  'PHASE26E_TESTER_EVIDENCE_REVIEW_STATUS: COMPLETED_TESTER_EVIDENCE_REVIEW',
  'PHASE26E_UI_WIRING_REDECISION: KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL',
  'PHASE26E_PHASE26_CLOSURE_DECISION: CLOSED_WITH_HIDDEN_DEFAULT_OFF_HARNESS_AND_LIMITED_TESTER_EVIDENCE',
  'PHASE26E_NEXT_DIRECTION_DECISION: PASS_TO_PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING',
  'PHASE27A_LOCAL_FIRST_HYBRID_NEXT_DIRECTION_PLANNING_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE26E_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required headings in testing doc ──────────────────────────────────────

const REQUIRED_TESTING_DOC_HEADINGS = [
  '# Phase 26E — Tester Evidence and UI Wiring Re-Decision',
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Tester evidence summary',
  '## Strict reviewer evidence summary',
  '## UI wiring re-decision',
  '## Phase 26 closure decision',
  '## Evidence table',
  '## What Phase 26 now supports',
  '## What Phase 26 still does not prove',
  '## Hidden harness boundary',
  '## Production UI boundary',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Local-first/no-cloud boundary',
  '## Claim boundary',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_DOC_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 60)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 5. Required headings in release doc ──────────────────────────────────────

const REQUIRED_RELEASE_DOC_HEADINGS = [
  '# Phase 26E — Phase 26 UI Wiring Closure Summary',
  '## Status token',
  '## Scope',
  '## Tester evidence review',
  '## UI wiring re-decision',
  '## Phase 26 closure decision',
  '## What is supported',
  '## What remains not proven',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_DOC_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 60)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 6. Required headings in Phase 27A planning doc ───────────────────────────

const REQUIRED_PLANNING_DOC_HEADINGS = [
  '# Phase 27A — Local-First Hybrid Next Direction Planning Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 26',
  '## Candidate directions',
  '## Recommended direction',
  '## Forbidden default approvals',
  '## Required gates before runtime',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PLANNING_DOC_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Planning doc heading present: "${heading.slice(0, 60)}"`)
    : fail('Planning doc heading missing', `"${heading}"`);
}

// ── 7. Evidence table: required columns ──────────────────────────────────────

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

// ── 8. Evidence table: required rows ─────────────────────────────────────────

const REQUIRED_TABLE_ROWS = [
  'Phase 26D strict reviewer final decision',
  'Phase 26D tester decision',
  'blank/null default route behavior',
  'no production navigation link',
  'no settings/library/dashboard broad rollout',
  'no localStorage or IndexedDB writes',
  'no unexpected network or telemetry requests',
  'no backup/export/restore action triggered',
  'accessibility quick check',
  'enabled copy limitation',
  'generated/test data only',
  'patch/build/unit/validator evidence',
];

for (const row of REQUIRED_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table row present: "${row.slice(0, 60)}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 9. Tester evidence interpretation text ───────────────────────────────────

const TESTER_EVIDENCE_REQUIRED_STATEMENTS = [
  'Phase 26D tester evidence satisfied the Phase 26D tester gate.',
  'Tester evidence was based on user-provided local browser evidence.',
  'The tester did not personally run the local server.',
  'The enabled harness copy was not browser-tested because no exposed opt-in mechanism exists in Phase 26D.',
  'This limitation is acceptable for Phase 26E because the browser-accessible route is expected to remain blank/null by default, and enabled-copy safety is covered by unit/static evidence.',
];

for (const stmt of TESTER_EVIDENCE_REQUIRED_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Tester evidence interpretation present: "${stmt.slice(0, 70)}"`)
    : fail('Tester evidence interpretation missing', `"${stmt}"`);
}

// ── 10. UI wiring re-decision: keeps hidden harness, no production UI ─────────

testingDocContent.includes('KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL')
  ? pass('UI wiring re-decision keeps hidden harness with no production UI approval')
  : fail('UI wiring re-decision must contain KEEP_HIDDEN_DEFAULT_OFF_HARNESS_NO_PRODUCTION_UI_APPROVAL');

const PRODUCTION_UI_APPROVAL_FORBIDDEN = [
  'APPROVED_PRODUCTION_UI',
  'PRODUCTION_UI_APPROVED',
  'APPROVE_PRODUCTION_VISIBLE',
];
for (const forbidden of PRODUCTION_UI_APPROVAL_FORBIDDEN) {
  allDocContent.includes(forbidden)
    ? fail(`Docs must not contain production UI approval token: "${forbidden}"`)
    : pass(`Docs do not contain forbidden production UI approval token: "${forbidden}"`);
}

// ── 11. Phase 26 closure interpretation: required statements ─────────────────

const PHASE26_CLOSURE_REQUIRED = [
  'Phase 26 closes with a hidden/default-off developer/test harness only.',
  'Phase 26 does not approve production-visible Backup Health UI.',
  'Phase 26 does not approve broad dashboard/settings/library rollout.',
  'Phase 26 does not approve production adapter-aware backup/export/restore.',
  'Phase 26 does not change backup/export/restore behavior.',
  'Phase 26 does not change backup file format.',
  'Phase 26 does not change restore overwrite behavior.',
  'Phase 26 does not add telemetry/analytics.',
  'Phase 26 does not add sync/cloud/account/auth/backend.',
  'Phase 26 does not prove broad backup reliability.',
  'Phase 26 does not guarantee data-loss prevention.',
  'Phase 26 does not claim BETA_READY.',
  'Phase 26 does not claim local-first hybrid readiness.',
];

for (const stmt of PHASE26_CLOSURE_REQUIRED) {
  allDocContent.includes(stmt)
    ? pass(`Phase 26 closure statement present: "${stmt.slice(0, 70)}"`)
    : fail('Phase 26 closure statement missing', `"${stmt}"`);
}

// ── 12. Phase 27A planning seed: required content ────────────────────────────

planningDocContent.includes('planning-first')
  ? pass('Phase 27A planning doc states planning-first')
  : fail('Phase 27A planning doc must state it is planning-first');

planningDocContent.includes('must choose one direction before')
  ? pass('Phase 27A planning doc states must choose one direction before runtime')
  : fail('Phase 27A planning doc must state: must choose one direction before runtime');

const CANDIDATE_DIRECTIONS = [
  'hidden harness polish or rollback decision',
  'limited production UI design exploration',
  'backup/export/restore adapter-awareness design',
  'broader manual/browser evidence matrix',
  'local-first hybrid readiness decision',
];

for (const dir of CANDIDATE_DIRECTIONS) {
  planningDocContent.includes(dir)
    ? pass(`Phase 27A candidate direction present: "${dir}"`)
    : fail('Phase 27A candidate direction missing', `"${dir}"`);
}

planningDocContent.includes('backup/export/restore adapter-awareness design')
  ? pass('Phase 27A recommended direction is backup/export/restore adapter-awareness design')
  : fail('Phase 27A recommended direction must be backup/export/restore adapter-awareness design');

// ── 13. Must-not-claim boundaries in docs ────────────────────────────────────

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
  'local-first hybrid readiness',
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  allDocContent.includes(term)
    ? pass(`Must-not-claim boundary present: "${term.slice(0, 60)}"`)
    : fail('Must-not-claim boundary missing', `"${term}"`);
}

// ── 14. Phase 27A forbidden approvals list ───────────────────────────────────

const PHASE27A_FORBIDDEN_APPROVALS = [
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
  'local-first hybrid readiness claim',
];

for (const item of PHASE27A_FORBIDDEN_APPROVALS) {
  planningDocContent.includes(item)
    ? pass(`Phase 27A forbidden approval listed: "${item.slice(0, 60)}"`)
    : fail('Phase 27A forbidden approval missing from list', `"${item}"`);
}

// ── 15. Required guardrail statements ────────────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 26E merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

const combinedDocContent = testingDocContent + '\n' + releaseDocContent;

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  combinedDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 16. Docs do not claim BETA_READY, production UI, or production restore ───

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production UI approved',
  'production-visible UI approved',
  'production adapter-aware backup approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? fail(`Docs must not claim: "${phrase}"`)
    : pass(`Docs do not claim: "${phrase.slice(0, 60)}"`);
}

// ── 17. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase26e-tester-evidence-and-ui-wiring-redecision.md`,
  `docs/release/phase26e-phase26-ui-wiring-closure-summary.md`,
  `docs/planning/phase27a-local-first-hybrid-next-direction-planning-seed.md`,
  `scripts/validate-phase26e-tester-evidence-ui-wiring-redecision.js`,
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
  'docs/testing/phase26d',
  'docs/release/phase26d-limited',
  'docs/release/phase26d-hf1',
  'scripts/validate-phase26d-limited',
  'scripts/validate-phase26d-hf1',
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
        `branch "${currentBranch}" has empty diff but is not main — no Phase 26E changes committed`
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
        !f.includes('phase26e')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(f =>
        (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
        !f.includes('phase26e') &&
        !f.includes('e2e-smoke')
      );
      syncCloudFiles.length === 0
        ? pass('No sync/cloud/backend files changed')
        : fail('sync/cloud/backend files must not be changed', syncCloudFiles.join(', '));

      const telemetryFiles = changedFiles.filter(f =>
        f.includes('telemetry') || f.includes('analytics') || f.includes('tracking')
      );
      telemetryFiles.length === 0
        ? pass('No telemetry/analytics files changed')
        : fail('Telemetry/analytics files must not be changed', telemetryFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 18. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26E');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26E');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
