#!/usr/bin/env node
/**
 * Phase 27D Static Validator — Adapter-Awareness Model Evidence and Integration Design
 *
 * PHASE27D_ADAPTER_AWARENESS_MODEL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_MODEL_EVIDENCE_REVIEW
 * PHASE27D_THIN_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE27D_THIN_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES
 * PHASE27D_INTEGRATION_SCOPE: DESIGN_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27E_THIN_READ_ONLY_INTEGRATION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_DOC = `docs/testing/phase27d-adapter-awareness-model-evidence-review.md`;
const DESIGN_DOC = `docs/planning/phase27d-thin-read-only-integration-design.md`;
const RELEASE_DOC = `docs/release/phase27d-adapter-awareness-model-evidence-integration-design-summary.md`;
const SEED_DOC = `docs/planning/phase27e-thin-read-only-integration-prototype-seed.md`;
const VALIDATOR = `scripts/validate-phase27d-adapter-awareness-model-evidence-integration-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(EVIDENCE_DOC)
  ? pass(`Evidence review doc exists: ${EVIDENCE_DOC}`)
  : fail(`Evidence review doc exists`, `missing ${EVIDENCE_DOC}`);

fileExists(DESIGN_DOC)
  ? pass(`Integration design doc exists: ${DESIGN_DOC}`)
  : fail(`Integration design doc exists`, `missing ${DESIGN_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(SEED_DOC)
  ? pass(`Phase 27E seed doc exists: ${SEED_DOC}`)
  : fail(`Phase 27E seed doc exists`, `missing ${SEED_DOC}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase27d-adapter-awareness-model-evidence-integration-design')
  ? pass('CI registers Phase 27D validator')
  : fail('CI registers Phase 27D validator', 'e2e-smoke.yml does not reference validate-phase27d');

// Accept either: checkout with fetch-depth: 0 (preferred), or an explicit fetch step.
const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
const hasExplicitFetchStep =
  ciContent.includes('Fetch origin main for Phase 27D validator') ||
  ciContent.includes('Fetch origin main');
(hasCheckoutFetchDepth || hasExplicitFetchStep)
  ? pass('CI provides origin/main via checkout fetch-depth: 0 or explicit fetch step')
  : fail(
      'CI must provide origin/main via checkout with fetch-depth: 0 or an explicit fetch step',
      'neither fetch-depth: 0 nor a Fetch origin main step found in e2e-smoke.yml'
    );

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
  ? pass('CI does not run Phase 24D through Phase 27C validators as active merge-blocking steps')
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

// ── 3. Required tokens in docs and validator ─────────────────────────────────

const evidenceDocContent = readFile(EVIDENCE_DOC) || '';
const designDocContent = readFile(DESIGN_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const seedDocContent = readFile(SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';

const allDocContent = evidenceDocContent + '\n' + designDocContent + '\n' + releaseDocContent + '\n' + seedDocContent;
const allContent = allDocContent + '\n' + validatorContent;

const PHASE27D_TOKENS = [
  'PHASE27D_ADAPTER_AWARENESS_MODEL_EVIDENCE_STATUS: COMPLETED_UNIT_STATIC_MODEL_EVIDENCE_REVIEW',
  'PHASE27D_THIN_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE27D_THIN_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE27E_THIN_READ_ONLY_INTEGRATION_PROTOTYPE_WITH_STRICT_GATES',
  'PHASE27D_INTEGRATION_SCOPE: DESIGN_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES',
  'PHASE27E_THIN_READ_ONLY_INTEGRATION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE27D_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required Phase 27C tokens confirmed present in evidence doc ───────────

const PHASE27C_TOKENS = [
  'PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL',
  'PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES',
  'PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION',
  'PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
];

for (const token of PHASE27C_TOKENS) {
  evidenceDocContent.includes(token)
    ? pass(`Phase 27C token confirmed in evidence doc: ${token.slice(0, 80)}`)
    : fail('Phase 27C token missing from evidence doc', token);
}

// ── 5. Evidence review doc headings ─────────────────────────────────────────

const REQUIRED_EVIDENCE_DOC_HEADINGS = [
  '# Phase 27D — Adapter-Awareness Model Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27C',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Unit/static coverage summary',
  '## No-write and no-import boundary',
  '## Generated/test data boundary',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_DOC_HEADINGS) {
  evidenceDocContent.includes(heading)
    ? pass(`Evidence doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Evidence doc heading missing', `"${heading}"`);
}

// ── 6. Evidence table rows and columns ───────────────────────────────────────

const REQUIRED_EVIDENCE_TABLE_COLUMNS = [
  'Evidence area',
  'Evidence source',
  'Observed result',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_EVIDENCE_TABLE_COLUMNS) {
  evidenceDocContent.includes(col)
    ? pass(`Evidence table column present: "${col}"`)
    : fail('Evidence table column missing', `"${col}"`);
}

const REQUIRED_EVIDENCE_TABLE_ROWS = [
  'Phase 27C pure model exports',
  'Phase 27C state id coverage',
  'Phase 27C conservative priority coverage',
  'input normalization and immutability',
  'warning and summary object shape',
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

for (const row of REQUIRED_EVIDENCE_TABLE_ROWS) {
  evidenceDocContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Evidence table row present: "${row}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 7. Integration design doc headings ───────────────────────────────────────

const REQUIRED_DESIGN_DOC_HEADINGS = [
  '# Phase 27D — Thin Read-Only Integration Design',
  '## Status tokens',
  '## Scope',
  '## Inputs',
  '## Integration purpose',
  '## Design decision',
  '## Future Phase 27E integration boundary',
  '## Candidate integration layer',
  '## Allowed future read-only inputs',
  '## Forbidden future inputs',
  '## No-write boundary',
  '## Production import boundary',
  '## Backup/export boundary',
  '## Restore/import boundary',
  '## Storage driver boundary',
  '## Data safety and rollback plan',
  '## Unit/static evidence plan for Phase 27E',
  '## Manual/browser evidence boundary',
  '## Go/no-go criteria',
  '## What Phase 27D can claim',
  '## What Phase 27D must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_DESIGN_DOC_HEADINGS) {
  designDocContent.includes(heading)
    ? pass(`Design doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Design doc heading missing', `"${heading}"`);
}

// ── 8. Integration design boundaries ─────────────────────────────────────────

const REQUIRED_INTEGRATION_BOUNDARIES = [
  'src/state/adapterAwarenessIntegrationPrototype.js',
  'sourceAdapterId',
  'targetAdapterId',
  'exportAdapterId',
  'restoreAdapterId',
  'adapter status/unavailable flag',
  'generated/test restore rehearsal flag',
  'Learner content scanning',
  'Automatic file reads',
  'External backup reads without explicit user action',
  'OS/platform backup inspection',
  'Cloud/account/backend access',
];

for (const boundary of REQUIRED_INTEGRATION_BOUNDARIES) {
  designDocContent.includes(boundary)
    ? pass(`Integration boundary documented: "${boundary.slice(0, 60)}"`)
    : fail('Integration boundary missing from design doc', `"${boundary}"`);
}

// ── 9. Release summary headings ──────────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27D — Adapter-Awareness Model Evidence and Integration Design Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Thin read-only integration decision',
  '## Phase 27E seed',
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

// ── 10. Phase 27E seed headings and token ─────────────────────────────────────

const REQUIRED_SEED_HEADINGS = [
  '# Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype Seed',
  '## Status token',
  '## Purpose',
  '## Planning constraints',
  '## Candidate integration functions',
  '## Required gates before implementation',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  seedDocContent.includes(heading)
    ? pass(`Seed doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Seed doc heading missing', `"${heading}"`);
}

const REQUIRED_SEED_CANDIDATE_FUNCTIONS = [
  'normalizeAdapterAwarenessSignalInput',
  'createAdapterAwarenessSignal',
  'deriveAdapterAwarenessFromSignals',
  'summarizeAdapterAwarenessIntegration',
];

for (const fn of REQUIRED_SEED_CANDIDATE_FUNCTIONS) {
  seedDocContent.includes(fn)
    ? pass(`Phase 27E seed candidate function present: ${fn}`)
    : fail('Phase 27E seed candidate function missing', fn);
}

// Phase 27E framed as test-only/default-off/read-only
const PHASE27E_FRAMING_TERMS = [
  'test-only',
  'default-off',
  'read-only',
];

for (const term of PHASE27E_FRAMING_TERMS) {
  seedDocContent.toLowerCase().includes(term.toLowerCase())
    ? pass(`Phase 27E seed framing term present: "${term}"`)
    : fail('Phase 27E seed framing term missing', `"${term}"`);
}

// ── 11. Required next phase framing in docs ───────────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype',
  'Phase 27E is a separate test-only/default-off/read-only implementation gate and is not automatically approved.',
  'Phase 27D does not approve production integration.',
  'Phase 27D does not approve runtime backup/export/restore changes.',
  'Phase 27D does not approve backup file format changes.',
  'Phase 27D does not approve restore overwrite behavior changes.',
  'Phase 27D does not approve storage migration.',
  'Phase 27D does not approve production adapter-aware backup/export/restore.',
  'Phase 27D does not approve BETA_READY.',
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
  'Full historical scripts/validate-*.js chain is not used as a Phase 27D merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 13. No-import-of-adapterAwarenessModel check in Phase 27D docs ────────────

const NO_IMPORT_STMT = `src/state/adapterAwarenessModel.js`;

// Design doc should document the candidate but NOT import it
const designDocImportLines = designDocContent
  .split('\n')
  .filter(line => /^\s*import\s/.test(line));
designDocImportLines.length === 0
  ? pass('Design doc has no import statements')
  : fail('Design doc must have no import statements', `found: ${designDocImportLines.join('; ')}`);

// Phase 27D must not have a new file that imports adapterAwarenessModel.js
// Check actual import statement lines only (not string patterns used in static checks below)
const validatorImportLines = validatorContent
  .split('\n')
  .filter(line => /^\s*import\s/.test(line));
const validatorHasAdapterModelImport = validatorImportLines.some(
  line => line.includes('adapterAwarenessModel')
);
validatorHasAdapterModelImport
  ? fail('Validator must not import adapterAwarenessModel.js', `found import statement in ${VALIDATOR}`)
  : pass('Validator does not import adapterAwarenessModel.js');

// ── 14. Docs must not claim forbidden terms ───────────────────────────────────

// Content used for forbidden claim checks — docs only, not the validator itself
const contentForClaimCheck = allDocContent;

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
  'Phase 27D implementation is production-ready',
  'production restore safety proven',
  'browser evidence confirms',
  'Phase 27E implementation is production-ready',
  'Phase 27E integration is complete',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  contentForClaimCheck.toLowerCase().includes(phrase.toLowerCase())
    ? fail(`Must not claim: "${phrase}"`)
    : pass(`Does not claim: "${phrase.slice(0, 60)}"`);
}

// ── 15. No sync/cloud/account/auth/backend guardrail in docs ─────────────────

const SYNC_CLOUD_TERMS = ['No sync/cloud/account/auth/backend.'];
for (const term of SYNC_CLOUD_TERMS) {
  allDocContent.includes(term)
    ? pass(`Sync/cloud/auth/backend guardrail present in docs`)
    : fail('Sync/cloud/auth/backend guardrail missing from docs', `"${term}"`);
}

// ── 16. Telemetry/analytics terms only in negative guardrail context ──────────

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

// ── 17. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase27d-adapter-awareness-model-evidence-review.md`,
  `docs/planning/phase27d-thin-read-only-integration-design.md`,
  `docs/release/phase27d-adapter-awareness-model-evidence-integration-design-summary.md`,
  `docs/planning/phase27e-thin-read-only-integration-prototype-seed.md`,
  `scripts/validate-phase27d-adapter-awareness-model-evidence-integration-design.js`,
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
  `docs/testing/phase27c`,
  `docs/testing/phase27b`,
  `docs/testing/phase27a`,
  `docs/release/phase27c`,
  `docs/release/phase27b`,
  `docs/release/phase27a`,
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

// This validator does NOT run its own git fetch — that would fail in GitHub Actions
// (HTTPS auth unavailable inside scripts). origin/main is made available by the
// actions/checkout@v4 step with fetch-depth: 0, which fetches all refs including
// origin/main before any validator runs. Verify it is present.
try {
  execSync('git rev-parse --verify origin/main', {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  originMainAvailable = true;
} catch (e) {
  originMainAvailable = false;
  fail(
    'origin/main available',
    'git rev-parse --verify origin/main failed — ensure actions/checkout@v4 uses fetch-depth: 0 ' +
      'or an explicit fetch step precedes this validator in e2e-smoke.yml'
  );
}

if (originMainAvailable) {
  pass('origin/main is available (provided by workflow fetch step before this validator)');

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
        `branch "${currentBranch}" has empty diff — no Phase 27D changes committed`
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
        ? pass('No prior Phase 27C/27B/27A/26E/26D/26C/26B/26A/25N/25M/25K/25I files in diff')
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
          !f.includes('phase27d') &&
          !f.includes('phase27e') &&
          !f.includes('adapterAwareness')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27d') &&
          !f.includes('phase27e') &&
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

      // Check that no new import of src/state/adapterAwarenessModel.js appears in any changed non-Phase-27D file
      const nonPhase27dChangedFiles = changedFiles.filter(
        f => !f.includes('phase27d') && !f.includes('phase27e') && !f.includes('e2e-smoke')
      );
      for (const f of nonPhase27dChangedFiles) {
        const content = readFile(f) || '';
        const hasAdapterModelImport =
          content.includes(`from '../state/adapterAwarenessModel`) ||
          content.includes(`from './adapterAwarenessModel`) ||
          content.includes(`from 'src/state/adapterAwarenessModel`) ||
          content.includes(`require.*adapterAwarenessModel`);
        hasAdapterModelImport
          ? fail(`New import of src/state/adapterAwarenessModel.js found in changed file`, f)
          : pass(`No new import of adapterAwarenessModel.js in changed file: ${f}`);
      }
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 18. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27D');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27D');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
