#!/usr/bin/env node
/**
 * Phase 28A Static Validator — Generated/Test Restore Rehearsal Design Gate
 *
 * PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: PASS_TO_PHASE28B_TEST_ONLY_NO_WRITE_RESTORE_REHEARSAL_PLANNER
 * PHASE28A_RESTORE_REHEARSAL_SCOPE: DESIGN_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_WRITES
 * PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED
 * PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED
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

const DESIGN_DOC = `docs/planning/phase28a-generated-test-restore-rehearsal-design.md`;
const RUN_PACK_DOC = `docs/testing/phase28a-generated-test-restore-rehearsal-run-pack.md`;
const RELEASE_DOC = `docs/release/phase28a-generated-test-restore-rehearsal-design-summary.md`;
const PHASE28B_SEED = `docs/planning/phase28b-test-only-restore-rehearsal-planner-seed.md`;
const VALIDATOR = `scripts/validate-phase28a-generated-test-restore-rehearsal-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(DESIGN_DOC)
  ? pass(`Design doc exists: ${DESIGN_DOC}`)
  : fail(`Design doc exists`, `missing ${DESIGN_DOC}`);

fileExists(RUN_PACK_DOC)
  ? pass(`Run pack doc exists: ${RUN_PACK_DOC}`)
  : fail(`Run pack doc exists`, `missing ${RUN_PACK_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(PHASE28B_SEED)
  ? pass(`Phase 28B seed exists: ${PHASE28B_SEED}`)
  : fail(`Phase 28B seed exists`, `missing ${PHASE28B_SEED}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. Read file contents ────────────────────────────────────────────────────

const designDocContent = readFile(DESIGN_DOC) || '';
const runPackDocContent = readFile(RUN_PACK_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase28bSeedContent = readFile(PHASE28B_SEED) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = designDocContent + '\n' + runPackDocContent + '\n' + releaseDocContent + '\n' + phase28bSeedContent;
const allContent = allDocContent + '\n' + validatorContent;

// ── 3. Required tokens ───────────────────────────────────────────────────────

const PHASE28A_TOKENS = [
  'PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: PASS_TO_PHASE28B_TEST_ONLY_NO_WRITE_RESTORE_REHEARSAL_PLANNER',
  'PHASE28A_RESTORE_REHEARSAL_SCOPE: DESIGN_ONLY_GENERATED_TEST_DATA_NO_REAL_LEARNER_DATA_NO_WRITES',
  'PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED',
  'PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE28A_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required design doc headings ──────────────────────────────────────────

const REQUIRED_DESIGN_HEADINGS = [
  '# Phase 28A — Generated/Test Restore Rehearsal Design Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27F',
  '## Direction choice',
  '## Purpose',
  '## Generated/test restore rehearsal problem statement',
  '## Evidence boundary',
  '## Generated/test data rule',
  '## No-real-learner-data boundary',
  '## No-write and no-overwrite boundary',
  '## Backup/export boundary',
  '## Restore/import boundary',
  '## Storage driver boundary',
  '## Adapter-awareness relationship',
  '## Future Phase 28B planner boundary',
  '## Manual/browser evidence boundary',
  '## Data safety and rollback plan',
  '## Go/no-go criteria',
  '## What Phase 28A can claim',
  '## What Phase 28A must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_DESIGN_HEADINGS) {
  designDocContent.includes(heading)
    ? pass(`Design doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Design doc heading missing', `"${heading}"`);
}

// ── 5. Required run pack headings ─────────────────────────────────────────────

const REQUIRED_RUN_PACK_HEADINGS = [
  '# Phase 28A — Generated/Test Restore Rehearsal Run Pack',
  '## Status token',
  '## Scope',
  '## Run-pack status',
  '## Purpose',
  '## Phase 28B evidence matrix',
  '## Data safety rules',
  '## Generated/test data requirement',
  '## No-real-learner-data rule',
  '## No-write/no-overwrite rule',
  '## Manual/browser evidence boundary',
  '## Pass/fail criteria for Phase 28B',
  '## Failure/anomaly recording',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RUN_PACK_HEADINGS) {
  runPackDocContent.includes(heading)
    ? pass(`Run pack heading present: "${heading.slice(0, 70)}"`)
    : fail('Run pack heading missing', `"${heading}"`);
}

// ── 6. Required evidence matrix columns ──────────────────────────────────────

const REQUIRED_TABLE_COLUMNS = [
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

for (const col of REQUIRED_TABLE_COLUMNS) {
  runPackDocContent.includes(col)
    ? pass(`Evidence matrix column present: "${col}"`)
    : fail('Evidence matrix column missing', `"${col}"`);
}

// ── 7. Required evidence matrix rows ─────────────────────────────────────────

const REQUIRED_TABLE_ROWS = [
  'generated/test data fixture definition',
  'no real learner data',
  'no production state writes',
  'no restore overwrite behavior',
  'backup file format unchanged',
  'restore/import behavior unchanged',
  'storage driver behavior unchanged',
  'adapter-awareness signal compatibility',
  'test-only planner boundary',
  'manual/browser evidence plan',
  'failure/anomaly recording',
  'rollback/removal plan',
  'no telemetry/analytics',
  'no sync/cloud/account/auth/backend',
];

for (const row of REQUIRED_TABLE_ROWS) {
  runPackDocContent.includes(row)
    ? pass(`Evidence matrix row present: "${row}"`)
    : fail('Evidence matrix row missing', `"${row}"`);
}

// ── 8. Run pack must be PREPARED_NOT_EXECUTED ─────────────────────────────────

runPackDocContent.includes('PHASE28A_RESTORE_REHEARSAL_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED')
  ? pass('Run pack status is PREPARED_NOT_EXECUTED')
  : fail('Run pack status must be PREPARED_NOT_EXECUTED');

!runPackDocContent.includes('EXECUTED_PHASE28A')
  ? pass('Run pack does not claim execution in Phase 28A')
  : fail('Run pack must not claim execution in Phase 28A');

runPackDocContent.includes('NOT_RUN_PHASE28A_PREPARED_ONLY')
  ? pass('Run pack observed results are NOT_RUN_PHASE28A_PREPARED_ONLY')
  : fail('Run pack must use NOT_RUN_PHASE28A_PREPARED_ONLY for observed results');

// ── 9. Required release summary headings ─────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 28A — Generated/Test Restore Rehearsal Design Summary',
  '## Status tokens',
  '## Scope',
  '## Direction choice',
  '## Design decision',
  '## Run-pack status',
  '## Phase 28B seed',
  '## What is allowed next',
  '## What is not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release summary heading present: "${heading.slice(0, 70)}"`)
    : fail('Release summary heading missing', `"${heading}"`);
}

// ── 10. Required Phase 28B seed headings ─────────────────────────────────────

const REQUIRED_PHASE28B_HEADINGS = [
  '# Phase 28B — Test-Only Restore Rehearsal Planner Seed',
  '## Status token',
  '## Purpose',
  '## Planning constraints',
  '## Candidate planner functions',
  '## Required gates before implementation',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE28B_HEADINGS) {
  phase28bSeedContent.includes(heading)
    ? pass(`Phase 28B seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 28B seed heading missing', `"${heading}"`);
}

// ── 11. Required Phase 28B candidate planner function names ───────────────────

const REQUIRED_PLANNER_FUNCTIONS = [
  'normalizeRestoreRehearsalPlanInput',
  'createGeneratedTestRestoreRehearsalPlan',
  'deriveRestoreRehearsalSafetyState',
  'summarizeRestoreRehearsalPlan',
];

for (const fn of REQUIRED_PLANNER_FUNCTIONS) {
  phase28bSeedContent.includes(fn)
    ? pass(`Phase 28B candidate function name present: "${fn}"`)
    : fail('Phase 28B candidate function name missing', `"${fn}"`);
}

// ── 12. Phase 28B framed as test-only/no-write ───────────────────────────────

phase28bSeedContent.includes('test-only/no-write') || phase28bSeedContent.includes('Test-Only No-Write')
  ? pass('Phase 28B seed frames Phase 28B as test-only/no-write')
  : fail('Phase 28B seed must frame Phase 28B as test-only/no-write');

phase28bSeedContent.includes('PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED')
  ? pass('Phase 28B seed has required seed status token')
  : fail('Phase 28B seed must have PHASE28B_TEST_ONLY_RESTORE_REHEARSAL_PLANNER_SEED_STATUS: PREPARED_PLANNING_SEED');

// ── 13. Direction choice explicit in design doc ───────────────────────────────

designDocContent.includes('generated/test restore rehearsal design') &&
designDocContent.match(/[Dd]irection choice[\s\S]{0,300}generated\/test restore rehearsal design/)
  ? pass('Design doc has explicit direction choice: generated/test restore rehearsal design')
  : fail('Design doc must have explicit direction choice: generated/test restore rehearsal design');

// ── 14. No-real-learner-data boundary stated ──────────────────────────────────

designDocContent.includes('No-real-learner-data boundary') || designDocContent.includes('no-real-learner-data boundary')
  ? pass('Design doc states no-real-learner-data boundary')
  : fail('Design doc must state no-real-learner-data boundary');

designDocContent.includes('No real learner data') || designDocContent.includes('no real learner data')
  ? pass('Design doc states no real learner data rule')
  : fail('Design doc must state no real learner data rule');

// ── 15. No-write/no-overwrite boundary stated ─────────────────────────────────

designDocContent.includes('No-write and no-overwrite boundary') ||
designDocContent.includes('no-write and no-overwrite boundary') ||
designDocContent.includes('No-write/no-overwrite boundary')
  ? pass('Design doc states no-write and no-overwrite boundary')
  : fail('Design doc must state no-write and no-overwrite boundary');

// ── 16. Required next-phase framing ──────────────────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 28B — Test-Only No-Write Restore Rehearsal Planner',
  'Phase 28B is a separate test-only/no-write implementation gate and is not automatically approved.',
  'Phase 28A does not approve production restore rehearsal.',
  'Phase 28A does not approve real learner data restore rehearsal.',
  'Phase 28A does not approve runtime backup/export/restore changes.',
  'Phase 28A does not approve backup file format changes.',
  'Phase 28A does not approve restore overwrite behavior changes.',
  'Phase 28A does not approve storage migration.',
  'Phase 28A does not approve production adapter-aware backup/export/restore.',
  'Phase 28A does not approve BETA_READY.',
  'Phase 28A does not claim local-first hybrid readiness.',
];

for (const stmt of NEXT_PHASE_FRAMING) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase framing present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase framing missing', `"${stmt}"`);
}

// ── 17. Required guardrail statements ────────────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Production backup/export/restore behavior remains unchanged by this phase.',
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
  'Full historical scripts/validate-*.js chain is not used as a Phase 28A merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 18. Docs must not claim forbidden terms ───────────────────────────────────

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production restore rehearsal proven',
  'production adapter-aware backup approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'storage migration approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
  'runtime restore rehearsal implemented in production',
  'Phase 28A implementation is production-ready',
  'Phase 28A integration is complete',
  'production restore safety proven',
  'browser evidence confirms',
  'Phase 28B implementation exists',
  'Phase 28B is implemented',
  'real learner data restore rehearsal approved',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  !allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? pass(`Does not claim: "${phrase.slice(0, 60)}"`)
    : fail(`Must not claim: "${phrase}"`);
}

// ── 19. Telemetry/analytics only in negative guardrail context ────────────────

for (const term of ['telemetry', 'analytics']) {
  const inDocs = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocs) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics') ||
      allDocContent.toLowerCase().includes('no telemetry/analytics');
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context`);
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 20. Sync/cloud/auth/backend guardrail in docs ─────────────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail('Sync/cloud/auth/backend guardrail missing from docs', `"No sync/cloud/account/auth/backend."`);

// ── 21. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase28a-generated-test-restore-rehearsal-design')
  ? pass('CI registers Phase 28A validator')
  : fail('CI registers Phase 28A validator', 'e2e-smoke.yml does not reference validate-phase28a');

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
  ? pass('CI does not run Phase 24D through Phase 27F validators as active merge-blocking steps')
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

// ── 22. Validator does not execute git fetch ──────────────────────────────────

const validatorNonCommentLines = getSourceNonCommentLines(validatorContent);

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonCommentLines);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch call in validator')
  : pass('Validator does not execute internal git fetch');

// ── 23. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 24. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/planning/phase28a-generated-test-restore-rehearsal-design.md`,
  `docs/testing/phase28a-generated-test-restore-rehearsal-run-pack.md`,
  `docs/release/phase28a-generated-test-restore-rehearsal-design-summary.md`,
  `docs/planning/phase28b-test-only-restore-rehearsal-planner-seed.md`,
  `scripts/validate-phase28a-generated-test-restore-rehearsal-design.js`,
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
  /^src\//,
  /^tests\//,
];

const FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES = [
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
let diffEmpty = false;
let onMain = false;
let originMainAvailable = false;

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
    diffEmpty = changedFiles.length === 0;

    pass('git diff origin/main..HEAD uses double-dot (not triple-dot)');

    if (diffEmpty && !onMain) {
      fail(
        'Exact changed-file check: non-main empty diff must fail',
        `branch "${currentBranch}" has empty diff — no Phase 28A changes committed`
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
        ? pass('No prior phase files in diff')
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
          !f.includes('phase28a') &&
          !f.includes('phase28b') &&
          !f.includes('adapterAwareness')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase28a') &&
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

      const srcFiles = changedFiles.filter(f => f.startsWith('src/'));
      srcFiles.length === 0
        ? pass('No src/ runtime files changed')
        : fail('src/ runtime files must not be changed by Phase 28A', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => f.startsWith('tests/'));
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed by Phase 28A', testFiles.join(', '));

      // Check no new JS import of production backup/restore modules in changed files
      const JS_IMPORT_BACKUP_RE = /^import\s+.*from\s+['"][^'"]*(?:backup|restore|export)[^'"]*['"]/m;
      const changedDocOrScriptFiles = changedFiles.filter(
        f =>
          (f.startsWith('docs/') || f.startsWith('scripts/') || f.startsWith('.github/')) &&
          !f.includes('phase28a') &&
          !f.includes('phase28b')
      );
      for (const f of changedDocOrScriptFiles) {
        const content = readFile(f) || '';
        const hasBackupImport = JS_IMPORT_BACKUP_RE.test(content);
        hasBackupImport
          ? fail(`New import of production backup/restore module found in changed file`, f)
          : pass(`No new import of production backup/restore module in changed file: ${f}`);
      }
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 25. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 28A');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 28A');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
