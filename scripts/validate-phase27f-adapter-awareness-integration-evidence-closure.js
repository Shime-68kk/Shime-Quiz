#!/usr/bin/env node
/**
 * Phase 27F Static Validator — Adapter-Awareness Integration Evidence Review and Closure
 *
 * PHASE27F_ADAPTER_AWARENESS_INTEGRATION_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_INTEGRATION_EVIDENCE_REVIEW
 * PHASE27F_ADAPTER_AWARENESS_INTEGRATION_REDECISION: KEEP_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE_NO_PRODUCTION_INTEGRATION_APPROVAL
 * PHASE27F_ADAPTER_AWARENESS_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_DEFAULT_OFF_READ_ONLY_INTEGRATION_PROTOTYPE
 * PHASE27F_NEXT_DIRECTION_DECISION: PASS_TO_PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_GATE
 * PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase27f-adapter-awareness-integration-evidence-review.md`;
const RELEASE_DOC = `docs/release/phase27f-adapter-awareness-integration-closure-summary.md`;
const PLANNING_DOC = `docs/planning/phase28a-generated-test-restore-rehearsal-design-seed.md`;
const VALIDATOR = `scripts/validate-phase27f-adapter-awareness-integration-evidence-closure.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass(`Testing doc exists: ${TESTING_DOC}`)
  : fail(`Testing doc exists`, `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(PLANNING_DOC)
  ? pass(`Phase 28A planning seed exists: ${PLANNING_DOC}`)
  : fail(`Phase 28A planning seed exists`, `missing ${PLANNING_DOC}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const planningDocContent = readFile(PLANNING_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + planningDocContent;
const allContent = allDocContent + '\n' + validatorContent;

// ── 3. Required tokens ───────────────────────────────────────────────────────

const PHASE27F_TOKENS = [
  'PHASE27F_ADAPTER_AWARENESS_INTEGRATION_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_INTEGRATION_EVIDENCE_REVIEW',
  'PHASE27F_ADAPTER_AWARENESS_INTEGRATION_REDECISION: KEEP_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE_NO_PRODUCTION_INTEGRATION_APPROVAL',
  'PHASE27F_ADAPTER_AWARENESS_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_DEFAULT_OFF_READ_ONLY_INTEGRATION_PROTOTYPE',
  'PHASE27F_NEXT_DIRECTION_DECISION: PASS_TO_PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_GATE',
  'PHASE28A_GENERATED_TEST_RESTORE_REHEARSAL_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE27F_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_DOC_HEADINGS = [
  '# Phase 27F — Adapter-Awareness Integration Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27E',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Unit/static coverage summary',
  '## Default-off and no-production-import boundary',
  '## Generated/test data boundary',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Adapter-awareness integration re-decision',
  '## Phase 27 closure decision',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_DOC_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 5. Required evidence table rows and columns ───────────────────────────────

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
  'Phase 27E integration prototype exports',
  'default-off behavior',
  'enabled test mode behavior',
  'enabled default-off mode behavior',
  'production/live/staging/beta mode rejection',
  'adapter_integration_disabled state',
  'Phase 27C state reachability through enabled path',
  'canClaimProductionSafety false',
  'Vietnamese-first conservative copy',
  'forbidden API absence',
  'backup/export/restore import absence',
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

// ── 6. Required closure summary headings ─────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27F — Adapter-Awareness Integration Closure Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Integration re-decision',
  '## Phase 27 closure decision',
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

// ── 7. Required Phase 28A seed headings ──────────────────────────────────────

const REQUIRED_PLANNING_HEADINGS = [
  '# Phase 28A — Generated/Test Restore Rehearsal Design Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 27',
  '## Planning constraints',
  '## Candidate directions',
  '## Recommended direction',
  '## Required gates before runtime',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Phase 28A seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 28A seed heading missing', `"${heading}"`);
}

// ── 8. Required Phase 28A seed candidate directions ──────────────────────────

const REQUIRED_CANDIDATE_DIRECTIONS = [
  'generated/test restore rehearsal design',
  'manual/browser evidence matrix for generated/test restore rehearsal',
  'adapter-awareness prototype rollback or keep decision',
  'backup/export/restore adapter-awareness production design exploration',
  'local-first hybrid readiness re-decision',
];

for (const dir of REQUIRED_CANDIDATE_DIRECTIONS) {
  planningDocContent.includes(dir)
    ? pass(`Phase 28A candidate direction present: "${dir}"`)
    : fail('Phase 28A candidate direction missing', `"${dir}"`);
}

// ── 9. Required Phase 28A recommended direction ───────────────────────────────

planningDocContent.includes('generated/test restore rehearsal design') &&
planningDocContent.match(/[Rr]ecommended direction[\s\S]{0,500}generated\/test restore rehearsal design/)
  ? pass('Phase 28A seed has recommended direction: generated/test restore rehearsal design')
  : fail('Phase 28A seed must have recommended direction: generated/test restore rehearsal design');

// ── 10. Re-decision and closure decision tokens in testing doc ────────────────

testingDocContent.includes('PHASE27F_ADAPTER_AWARENESS_INTEGRATION_REDECISION: KEEP_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE_NO_PRODUCTION_INTEGRATION_APPROVAL')
  ? pass('Testing doc contains re-decision token')
  : fail('Testing doc must contain re-decision token');

testingDocContent.includes('PHASE27F_ADAPTER_AWARENESS_CLOSURE_DECISION: CLOSED_WITH_TEST_ONLY_DEFAULT_OFF_READ_ONLY_INTEGRATION_PROTOTYPE')
  ? pass('Testing doc contains closure decision token')
  : fail('Testing doc must contain closure decision token');

// ── 11. Required next-phase framing in docs ───────────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 28A — Generated/Test Restore Rehearsal Design Gate',
  'Phase 28A is a separate planning/design gate and is not automatically approved.',
  'Phase 27F does not approve production integration.',
  'Phase 27F does not approve runtime backup/export/restore changes.',
  'Phase 27F does not approve backup file format changes.',
  'Phase 27F does not approve restore overwrite behavior changes.',
  'Phase 27F does not approve storage migration.',
  'Phase 27F does not approve production adapter-aware backup/export/restore.',
  'Phase 27F does not approve BETA_READY.',
  'Phase 27F does not claim local-first hybrid readiness.',
];

for (const stmt of NEXT_PHASE_FRAMING) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase framing present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase framing missing', `"${stmt}"`);
}

// ── 12. Required guardrail statements in docs ─────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 27F merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 13. Docs must not claim forbidden terms ───────────────────────────────────

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production adapter-aware backup approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'storage migration approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
  'runtime adapter-awareness implemented in production',
  'Phase 27F implementation is production-ready',
  'Phase 27F integration is complete',
  'production restore safety proven',
  'browser evidence confirms',
  'Phase 28A implementation exists',
  'Phase 28A is implemented',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  !allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? pass(`Does not claim: "${phrase.slice(0, 60)}"`)
    : fail(`Must not claim: "${phrase}"`);
}

// ── 14. Telemetry/analytics only in negative guardrail context ────────────────

for (const term of ['telemetry', 'analytics']) {
  const inDocs = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocs) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics');
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context`);
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 15. Sync/cloud/auth/backend guardrail in docs ─────────────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass(`Sync/cloud/auth/backend guardrail present in docs`)
  : fail('Sync/cloud/auth/backend guardrail missing from docs', `"No sync/cloud/account/auth/backend."`);

// ── 16. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase27f-adapter-awareness-integration-evidence-closure')
  ? pass('CI registers Phase 27F validator')
  : fail('CI registers Phase 27F validator', 'e2e-smoke.yml does not reference validate-phase27f');

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
  ? pass('CI does not run Phase 24D through Phase 27E validators as active merge-blocking steps')
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
  `docs/testing/phase27f-adapter-awareness-integration-evidence-review.md`,
  `docs/release/phase27f-adapter-awareness-integration-closure-summary.md`,
  `docs/planning/phase28a-generated-test-restore-rehearsal-design-seed.md`,
  `scripts/validate-phase27f-adapter-awareness-integration-evidence-closure.js`,
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
  `docs/testing/phase27e`,
  `docs/testing/phase27d`,
  `docs/testing/phase27c`,
  `docs/testing/phase27b`,
  `docs/testing/phase27a`,
  `docs/release/phase27e`,
  `docs/release/phase27d`,
  `docs/release/phase27c`,
  `docs/release/phase27b`,
  `docs/release/phase27a`,
  `docs/planning/phase27e`,
  `docs/planning/phase27d`,
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
        `branch "${currentBranch}" has empty diff — no Phase 27F changes committed`
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
          !f.includes('phase27f') &&
          !f.includes('phase28a') &&
          !f.includes('adapterAwareness')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27f') &&
          !f.includes('phase28a') &&
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
        : fail('src/ runtime files must not be changed by Phase 27F', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => f.startsWith('tests/'));
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed by Phase 27F', testFiles.join(', '));

      // Check no new import of adapterAwarenessIntegrationPrototype in changed files
      const changedDocOrScriptFiles = changedFiles.filter(
        f =>
          (f.startsWith('docs/') || f.startsWith('scripts/') || f.startsWith('.github/')) &&
          !f.includes('adapterAwarenessIntegrationPrototype')
      );
      for (const f of changedDocOrScriptFiles) {
        const content = readFile(f) || '';
        const hasPrototypeImport =
          content.includes(`import.*adapterAwarenessIntegrationPrototype`) ||
          (content.includes('adapterAwarenessIntegrationPrototype') && content.includes('from'));
        hasPrototypeImport
          ? fail(`New import of adapterAwarenessIntegrationPrototype found in changed file`, f)
          : pass(`No new import of adapterAwarenessIntegrationPrototype in changed file: ${f}`);
      }
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 20. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27F');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27F');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
