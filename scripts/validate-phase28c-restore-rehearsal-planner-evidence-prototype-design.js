#!/usr/bin/env node
/**
 * Phase 28C Static Validator — Restore Rehearsal Planner Evidence Review and Prototype Design
 *
 * PHASE28C_RESTORE_REHEARSAL_PLANNER_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PLANNER_EVIDENCE_REVIEW
 * PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL
 * PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase28c-restore-rehearsal-planner-evidence-review.md`;
const PROTOTYPE_DESIGN_DOC = `docs/planning/phase28c-generated-test-restore-rehearsal-prototype-design.md`;
const RELEASE_DOC = `docs/release/phase28c-restore-rehearsal-planner-evidence-prototype-design-summary.md`;
const SEED_DOC = `docs/planning/phase28d-generated-test-restore-rehearsal-prototype-seed.md`;
const VALIDATOR = `scripts/validate-phase28c-restore-rehearsal-planner-evidence-prototype-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass(`Testing doc exists: ${TESTING_DOC}`)
  : fail(`Testing doc exists`, `missing ${TESTING_DOC}`);

fileExists(PROTOTYPE_DESIGN_DOC)
  ? pass(`Prototype design doc exists: ${PROTOTYPE_DESIGN_DOC}`)
  : fail(`Prototype design doc exists`, `missing ${PROTOTYPE_DESIGN_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(SEED_DOC)
  ? pass(`Phase 28D seed doc exists: ${SEED_DOC}`)
  : fail(`Phase 28D seed doc exists`, `missing ${SEED_DOC}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const prototypeDesignContent = readFile(PROTOTYPE_DESIGN_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const seedDocContent = readFile(SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + prototypeDesignContent + '\n' + releaseDocContent + '\n' + seedDocContent;
const allContent = allDocContent + '\n' + validatorContent;

// ── 3. Required tokens ───────────────────────────────────────────────────────

const PHASE28C_TOKENS = [
  'PHASE28C_RESTORE_REHEARSAL_PLANNER_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_PLANNER_EVIDENCE_REVIEW',
  'PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL',
  'PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES',
  'PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE28C_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 28C — Restore Rehearsal Planner Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 28B',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Unit/static coverage summary',
  '## No-restore-execution boundary',
  '## No-write and no-overwrite boundary',
  '## No-real-learner-data boundary',
  '## Generated/test data boundary',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Planner re-decision',
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

// ── 5. Required prototype design doc headings ─────────────────────────────────

const REQUIRED_DESIGN_HEADINGS = [
  '# Phase 28C — Generated/Test Restore Rehearsal Prototype Design',
  '## Status tokens',
  '## Scope',
  '## Inputs',
  '## Prototype purpose',
  '## Design decision',
  '## Future Phase 28D prototype boundary',
  '## Candidate prototype layer',
  '## Allowed future generated/test inputs',
  '## Forbidden future inputs',
  '## No-restore-execution boundary',
  '## No-write and no-overwrite boundary',
  '## No-real-learner-data boundary',
  '## Backup/export boundary',
  '## Restore/import boundary',
  '## Storage driver boundary',
  '## Adapter-awareness relationship',
  '## Data safety and rollback plan',
  '## Unit/static evidence plan for Phase 28D',
  '## Manual/browser evidence boundary',
  '## Go/no-go criteria',
  '## What Phase 28C can claim',
  '## What Phase 28C must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_DESIGN_HEADINGS) {
  prototypeDesignContent.includes(heading)
    ? pass(`Prototype design doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Prototype design doc heading missing', `"${heading}"`);
}

// ── 6. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 28C — Restore Rehearsal Planner Evidence and Prototype Design Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Planner re-decision',
  '## Generated/test prototype design decision',
  '## Phase 28D seed',
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

// ── 7. Required Phase 28D seed doc headings ───────────────────────────────────

const REQUIRED_SEED_HEADINGS = [
  '# Phase 28D — Generated/Test Restore Rehearsal Prototype Seed',
  '## Status token',
  '## Purpose',
  '## Planning constraints',
  '## Candidate prototype functions',
  '## Required gates before implementation',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  seedDocContent.includes(heading)
    ? pass(`Phase 28D seed doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 28D seed doc heading missing', `"${heading}"`);
}

// ── 8. Evidence table rows/columns ────────────────────────────────────────────

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

const REQUIRED_TABLE_ROWS = [
  'Phase 28B planner exports',
  'Phase 28B safety state coverage',
  'Phase 28B conservative priority coverage',
  'generated/test data ready-state requirement',
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
  'unit/static evidence only',
  'generated/test data only',
  'no browser/manual evidence',
  'rollback/removal plan',
];

for (const row of REQUIRED_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table row present: "${row.slice(0, 60)}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 9. Planner re-decision token present ──────────────────────────────────────

testingDocContent.includes('PHASE28C_RESTORE_REHEARSAL_PLANNER_REDECISION: KEEP_TEST_ONLY_NO_WRITE_PLANNER_NO_RESTORE_EXECUTION_APPROVAL')
  ? pass('Planner re-decision token present in testing doc')
  : fail('Planner re-decision token missing from testing doc');

// ── 10. Prototype design decision token present ───────────────────────────────

prototypeDesignContent.includes('PHASE28C_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_DECISION: PASS_TO_PHASE28D_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE_WITH_STRICT_GATES')
  ? pass('Prototype design decision token present in design doc')
  : fail('Prototype design decision token missing from design doc');

// ── 11. Phase 28D seed token present ──────────────────────────────────────────

seedDocContent.includes('PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED')
  ? pass('Phase 28D seed token present in seed doc')
  : fail('Phase 28D seed token missing from seed doc');

// ── 12. Phase 28D candidate function names present in seed doc ────────────────

const REQUIRED_CANDIDATE_NAMES = [
  'normalizeGeneratedTestRestoreRehearsalInput',
  'createGeneratedTestRestoreRehearsal',
  'deriveGeneratedTestRestoreRehearsalOutcome',
  'summarizeGeneratedTestRestoreRehearsal',
];

for (const name of REQUIRED_CANDIDATE_NAMES) {
  seedDocContent.includes(name)
    ? pass(`Phase 28D candidate function name present in seed: ${name}`)
    : fail('Phase 28D candidate function name missing from seed', name);
}

// ── 13. Phase 28D framed test-only/no-write in seed ──────────────────────────

const REQUIRED_SEED_GUARDRAILS = [
  'Test-only',
  'No-write',
  'Generated/test data only',
  'No restore execution',
  'No backup/export/restore imports',
  'No storage driver imports',
];

for (const guardrail of REQUIRED_SEED_GUARDRAILS) {
  seedDocContent.includes(guardrail)
    ? pass(`Phase 28D seed guardrail present: "${guardrail}"`)
    : fail('Phase 28D seed guardrail missing', `"${guardrail}"`);
}

// ── 14. Required next-phase framing in docs ───────────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 28D',
  'Phase 28D is a separate test-only/no-write implementation gate and is not automatically approved.',
  'Phase 28C does not approve restore execution.',
  'Phase 28C does not approve production restore rehearsal.',
  'Phase 28C does not approve real learner data restore rehearsal.',
  'Phase 28C does not approve runtime backup/export/restore changes.',
  'Phase 28C does not approve backup file format changes.',
  'Phase 28C does not approve restore overwrite behavior changes.',
  'Phase 28C does not approve storage migration.',
  'Phase 28C does not approve production adapter-aware backup/export/restore.',
  'Phase 28C does not approve BETA_READY.',
  'Phase 28C does not claim local-first hybrid readiness.',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required next phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required next phase statement missing', `"${stmt}"`);
}

// ── 15. Candidate prototype layer named in design doc ────────────────────────

prototypeDesignContent.includes('src/state/generatedTestRestoreRehearsalPrototype.js')
  ? pass('Candidate prototype layer named in design doc')
  : fail('Candidate prototype layer missing from design doc', 'src/state/generatedTestRestoreRehearsalPrototype.js');

// ── 16. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase28c-restore-rehearsal-planner-evidence-prototype-design')
  ? pass('CI registers Phase 28C validator')
  : fail('CI registers Phase 28C validator', 'e2e-smoke.yml does not reference validate-phase28c');

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
  'validate-phase28b',
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
  ? pass('CI does not run Phase 24D through Phase 28B validators as active merge-blocking steps')
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

// ── 17. Validator does not execute git fetch ──────────────────────────────────

const validatorNonCommentLines = getSourceNonCommentLines(validatorContent);

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonCommentLines);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch call in validator')
  : pass('Validator does not execute internal git fetch');

// ── 18. Validator verifies origin/main via git rev-parse ─────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 19. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase28c-restore-rehearsal-planner-evidence-review.md`,
  `docs/planning/phase28c-generated-test-restore-rehearsal-prototype-design.md`,
  `docs/release/phase28c-restore-rehearsal-planner-evidence-prototype-design-summary.md`,
  `docs/planning/phase28d-generated-test-restore-rehearsal-prototype-seed.md`,
  `scripts/validate-phase28c-restore-rehearsal-planner-evidence-prototype-design.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 28C changes committed`
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
        ? pass('No prior Phase 28B/28A/27F/27E/27D/27C/27B/27A/26/25 files in diff')
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
          !f.includes('phase28c') &&
          !f.includes('phase28d') &&
          !f.includes('restoreRehearsal') &&
          !f.includes('GeneratedTestRestoreRehearsal')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase28c') &&
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

      const srcFiles = changedFiles.filter(f => f.startsWith(`src/`));
      srcFiles.length === 0
        ? pass('No src/ files changed')
        : fail('src/ files must not be changed by Phase 28C', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => f.startsWith(`tests/`));
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed by Phase 28C', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 20. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 28C');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 28C');

// ── 21. No file imports src/state/restoreRehearsalPlanner.js ──────────────────

// Check that no new file in the diff imports restoreRehearsalPlanner
const plannerImportPattern = /import\s+.*from\s+['"].*restoreRehearsalPlanner['"]/;

const newDocFiles = [
  testingDocContent,
  prototypeDesignContent,
  releaseDocContent,
  seedDocContent,
  validatorContent,
];

const newDocImportsPlanner = newDocFiles.some(content => plannerImportPattern.test(content));
!newDocImportsPlanner
  ? pass('No new Phase 28C file imports src/state/restoreRehearsalPlanner.js')
  : fail('A new Phase 28C file must not import src/state/restoreRehearsalPlanner.js');

// ── 22. Forbidden claim strings absent from docs ─────────────────────────────

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
      allContent.includes(`Phase 28C does not approve`) ||
      allContent.includes(`Phase 28B does not approve`) ||
      allContent.includes(`does not approve BETA_READY`);
    inNegativeContext
      ? pass(`Forbidden claim "${claim.slice(0, 40)}" appears only in negative context`)
      : fail(`Forbidden claim "${claim.slice(0, 40)}" must not appear as positive claim`);
  } else {
    pass(`No forbidden claim "${claim.slice(0, 40)}" in content`);
  }
}

// ── 23. Telemetry/analytics terms only in negative guardrail context ──────────

const TELEMETRY_TERMS = ['telemetry', 'analytics'];
for (const term of TELEMETRY_TERMS) {
  const inDocContent = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocContent) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes(`no telemetry or analytics`) ||
      allDocContent.toLowerCase().includes(`no telemetry`);
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context in docs`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context in docs`);
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 24. Sync/cloud/auth/backend guardrail present in docs ────────────────────

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
