#!/usr/bin/env node
/**
 * Phase 27C Static Validator — Test-Only No-Write Adapter-Awareness Model
 *
 * PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL
 * PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION
 * PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM
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

const SOURCE_FILE = `src/state/adapterAwarenessModel.js`;
const TEST_FILE = `tests/unit/adapterAwarenessModel.test.js`;
const TESTING_DOC = `docs/testing/phase27c-test-only-adapter-awareness-model.md`;
const RELEASE_DOC = `docs/release/phase27c-test-only-adapter-awareness-model-summary.md`;
const VALIDATOR = `scripts/validate-phase27c-test-only-adapter-awareness-model.js`;
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

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase27c-test-only-adapter-awareness-model')
  ? pass('CI registers Phase 27C validator')
  : fail('CI registers Phase 27C validator', 'e2e-smoke.yml does not reference validate-phase27c');

(ciContent.includes('Fetch origin main for Phase 27C validator') ||
  ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step before Phase 27C validator')
  : fail('CI has explicit fetch step before Phase 27C validator', 'missing fetch step');

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
  ? pass('CI does not run Phase 24D-HF1/HF2 through Phase 27B validators as active merge-blocking steps')
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

// ── 3. Required tokens in source, docs, and validator ───────────────────────

const sourceContent = readFile(SOURCE_FILE) || '';
const testContent = readFile(TEST_FILE) || '';
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent;
const allSourceContent = sourceContent + '\n' + testContent + '\n' + validatorContent;
const allContent = allDocContent + '\n' + allSourceContent;

// Non-comment source lines for API/import checks (strips JSDoc and // lines)
const sourceNonCommentContent = sourceContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    return !trimmed.startsWith('*') && !trimmed.startsWith('//');
  })
  .join('\n');

// Content used for forbidden claim checks — docs + source + tests only, not the validator itself
const contentForClaimCheck = allDocContent + '\n' + sourceContent + '\n' + testContent;

const PHASE27C_TOKENS = [
  'PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL',
  'PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES',
  'PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION',
  'PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
];

for (const token of PHASE27C_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required exported functions exist in source ───────────────────────────

const REQUIRED_EXPORTS = [
  'normalizeAdapterAwarenessInput',
  'deriveAdapterAwarenessState',
  'createAdapterCompatibilityWarning',
  'summarizeAdapterAwarenessForBackupHealth',
];

for (const fn of REQUIRED_EXPORTS) {
  sourceContent.includes(`export function ${fn}`)
    ? pass(`Required export present in source: ${fn}`)
    : fail(`Required export missing from source`, fn);
}

for (const fn of REQUIRED_EXPORTS) {
  testContent.includes(fn)
    ? pass(`Unit tests reference required export: ${fn}`)
    : fail(`Unit tests do not reference required export`, fn);
}

// ── 5. Required state IDs exist in source ────────────────────────────────────

const REQUIRED_STATE_IDS = [
  'adapter_status_unavailable',
  'restore_rehearsal_verified_generated_data',
  'missing_source_adapter',
  'missing_target_adapter',
  'different_adapter_context',
  'same_adapter_context',
  'unknown_adapter_state',
];

for (const stateId of REQUIRED_STATE_IDS) {
  sourceContent.includes(stateId)
    ? pass(`Required state ID present in source: ${stateId}`)
    : fail(`Required state ID missing from source`, stateId);
}

for (const stateId of REQUIRED_STATE_IDS) {
  testContent.includes(stateId)
    ? pass(`Unit tests cover state ID: ${stateId}`)
    : fail(`Unit tests do not cover state ID`, stateId);
}

// ── 6. canClaimProductionSafety is present and false in source/tests ──────────

sourceContent.includes('canClaimProductionSafety')
  ? pass('canClaimProductionSafety present in source')
  : fail('canClaimProductionSafety missing from source');

const productionSafetyFalseMatches = (sourceContent.match(/canClaimProductionSafety:\s*false/g) || []).length;
productionSafetyFalseMatches > 0
  ? pass(`canClaimProductionSafety: false appears in source (${productionSafetyFalseMatches} times)`)
  : fail('canClaimProductionSafety: false not found in source');

const productionSafetyTrueMatches = (sourceContent.match(/canClaimProductionSafety:\s*true/g) || []).length;
productionSafetyTrueMatches === 0
  ? pass('canClaimProductionSafety: true never appears in source')
  : fail('canClaimProductionSafety: true must not appear in source', `found ${productionSafetyTrueMatches} occurrences`);

testContent.includes('canClaimProductionSafety')
  ? pass('canClaimProductionSafety present in tests')
  : fail('canClaimProductionSafety missing from tests');

testContent.includes('expect(summary.canClaimProductionSafety).toBe(false)')
  ? pass('tests assert canClaimProductionSafety is false')
  : fail('tests must assert canClaimProductionSafety is false');

// ── 7. No forbidden APIs in source ───────────────────────────────────────────

const FORBIDDEN_SOURCE_APIS = [
  { pattern: /\blocalStorage\b/, label: 'localStorage' },
  { pattern: /\bindexedDB\b/, label: 'indexedDB' },
  { pattern: /\bfetch\(/, label: 'fetch(' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bsendBeacon\b/, label: 'sendBeacon' },
  { pattern: /\bDate\.now\b/, label: 'Date.now' },
  { pattern: /telemetry/i, label: 'telemetry' },
  { pattern: /analytics/i, label: 'analytics' },
  { pattern: /\bfs\.readFile\b/, label: 'fs.readFile' },
  { pattern: /\bfs\.writeFile\b/, label: 'fs.writeFile' },
  { pattern: /\breadFileSync\b/, label: 'readFileSync' },
  { pattern: /\bwriteFileSync\b/, label: 'writeFileSync' },
];

for (const { pattern, label } of FORBIDDEN_SOURCE_APIS) {
  pattern.test(sourceNonCommentContent)
    ? fail(`Source must not use: ${label}`, `found ${label} in ${SOURCE_FILE}`)
    : pass(`Source does not use: ${label}`);
}

// ── 8. No backup/export/restore imports in source ────────────────────────────

const FORBIDDEN_SOURCE_IMPORTS = [
  { pattern: /import.*v2BackupRestore/i, label: 'v2BackupRestore import' },
  { pattern: /import.*backup/i, label: 'backup import' },
  { pattern: /from.*backup/i, label: 'from backup' },
  { pattern: /import.*restore/i, label: 'restore import' },
  { pattern: /from.*restore/i, label: 'from restore' },
  { pattern: /import.*storageAdapter/i, label: 'storageAdapter import' },
  { pattern: /from.*storageAdapter/i, label: 'from storageAdapter' },
];

for (const { pattern, label } of FORBIDDEN_SOURCE_IMPORTS) {
  pattern.test(sourceNonCommentContent)
    ? fail(`Source must not import: ${label}`, `found in ${SOURCE_FILE}`)
    : pass(`Source does not import: ${label}`);
}

// Source must have no import statements at all (pure functions, no imports)
const sourceImportLines = sourceContent.split('\n').filter(line => /^\s*import\s/.test(line));
sourceImportLines.length === 0
  ? pass('Source file has no import statements (pure module)')
  : fail('Source file must have no import statements', `found: ${sourceImportLines.join('; ')}`);

// ── 9. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_DOC_HEADINGS = [
  '# Phase 27C — Test-Only Adapter-Awareness Model',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27B',
  '## Implementation summary',
  '## Model API',
  '## Unit/static evidence',
  '## Evidence interpretation',
  '## No-write proof',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Data safety boundary',
  '## Generated/test data only rule',
  '## Claim boundary',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_DOC_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 10. Required release summary headings ────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27C — Test-Only Adapter-Awareness Model Summary',
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

// ── 11. Required next phase framing in docs ───────────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 27D — Adapter-Awareness Model Evidence Review and Thin Read-Only Integration Design',
  'Phase 27D is a separate evidence/design review gate and is not automatically approved.',
  'Phase 27C does not approve production integration.',
  'Phase 27C does not approve runtime backup/export/restore changes.',
  'Phase 27C does not approve backup file format changes.',
  'Phase 27C does not approve restore overwrite behavior changes.',
  'Phase 27C does not approve storage migration.',
  'Phase 27C does not approve production adapter-aware backup/export/restore.',
  'Phase 27C does not approve BETA_READY.',
];

for (const stmt of NEXT_PHASE_FRAMING) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase framing present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase framing missing', `"${stmt}"`);
}

// ── 12. Required guardrail statements in docs ─────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 27C merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 13. Unit tests cover required cases ──────────────────────────────────────

const REQUIRED_TEST_COVERAGE_STRINGS = [
  'exports',
  'null/undefined/non-object',
  'input immutability',
  'string trimming',
  'empty string',
  'alias',
  'adapter_status_unavailable',
  'restore_rehearsal_verified_generated_data',
  'missing_source_adapter',
  'missing_target_adapter',
  'different_adapter_context',
  'same_adapter_context',
  'warning object shape',
  'summary object shape',
  'canClaimProductionSafety',
  'evidence level',
  'Vietnamese',
  'forbidden claim',
  'no forbidden APIs',
  'no backup/export/restore imports',
  'generated/test data only',
];

for (const term of REQUIRED_TEST_COVERAGE_STRINGS) {
  testContent.toLowerCase().includes(term.toLowerCase())
    ? pass(`Unit tests cover required case: "${term}"`)
    : fail('Unit tests missing required case coverage', `"${term}"`);
}

// ── 14. Docs must not claim forbidden terms ───────────────────────────────────

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
  'Phase 27C implementation is production-ready',
  'production restore safety proven',
  'browser evidence confirms',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  contentForClaimCheck.toLowerCase().includes(phrase.toLowerCase())
    ? fail(`Must not claim: "${phrase}"`)
    : pass(`Does not claim: "${phrase.slice(0, 60)}"`);
}

// ── 15. No route/navigation/settings/library/dashboard imports in source ──────

const FORBIDDEN_PRODUCTION_IMPORTS = [
  /import.*route/i,
  /import.*navigation/i,
  /import.*settings/i,
  /import.*library/i,
  /import.*dashboard/i,
  /import.*StudyRoom/i,
  /import.*StudyGoal/i,
  /import.*studyGoalStorage/i,
  /import.*studyHistoryStorage/i,
  /import.*reviewScheduleStorage/i,
  /import.*recommendationFeedbackStorage/i,
];

for (const pattern of FORBIDDEN_PRODUCTION_IMPORTS) {
  pattern.test(sourceNonCommentContent)
    ? fail(`Source must not import production module matching: ${pattern}`)
    : pass(`Source does not import production module: ${pattern.toString().slice(0, 40)}`);
}

// ── 16. No package/dependency changes ────────────────────────────────────────

// (Checked via changed-file list below — package.json and package-lock.json must not be in diff)

// ── 17. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `src/state/adapterAwarenessModel.js`,
  `tests/unit/adapterAwarenessModel.test.js`,
  `docs/testing/phase27c-test-only-adapter-awareness-model.md`,
  `docs/release/phase27c-test-only-adapter-awareness-model-summary.md`,
  `scripts/validate-phase27c-test-only-adapter-awareness-model.js`,
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
  'docs/testing/phase27b',
  'docs/testing/phase27a',
  'docs/release/phase27b',
  'docs/release/phase27a',
  'scripts/validate-phase27b',
  'scripts/validate-phase27a',
  'docs/testing/phase26e',
  'docs/release/phase26e',
  'scripts/validate-phase26e',
  'docs/testing/phase26d',
  'docs/release/phase26d',
  'scripts/validate-phase26d',
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
        `branch "${currentBranch}" has empty diff — no Phase 27C changes committed`
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
        ? pass('No prior Phase 27B/27A/26E/26D/26C/26B/26A/25N/25M/25K/25I files in diff')
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
          !f.includes('phase27c') &&
          !f.includes('adapterAwareness')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27c') &&
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

// ── 18. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27C');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27C');

// ── 19. No sync/cloud/account/auth/backend guardrail in docs ─────────────────

const SYNC_CLOUD_TERMS = ['No sync/cloud/account/auth/backend.'];
for (const term of SYNC_CLOUD_TERMS) {
  allDocContent.includes(term)
    ? pass(`Sync/cloud/auth/backend guardrail present in docs`)
    : fail('Sync/cloud/auth/backend guardrail missing from docs', `"${term}"`);
}

// ── 20. Telemetry/analytics terms only in negative guardrail context ──────────

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

// ── 21. Evidence levels present in source ────────────────────────────────────

const REQUIRED_EVIDENCE_LEVELS = [
  'unit_static_only',
  'generated_test_rehearsal_only',
  'unknown',
];

for (const level of REQUIRED_EVIDENCE_LEVELS) {
  sourceContent.includes(level)
    ? pass(`Evidence level present in source: ${level}`)
    : fail('Evidence level missing from source', level);
}

// ── 22. Severity levels present in source ────────────────────────────────────

const REQUIRED_SEVERITY_LEVELS = ['info', 'caution', 'unavailable'];
for (const severity of REQUIRED_SEVERITY_LEVELS) {
  sourceContent.includes(severity)
    ? pass(`Severity level present in source: ${severity}`)
    : fail('Severity level missing from source', severity);
}

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
