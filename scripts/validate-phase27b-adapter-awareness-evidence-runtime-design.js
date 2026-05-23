#!/usr/bin/env node
/**
 * Phase 27B Static Validator — Adapter-Awareness Evidence and Runtime Design Review
 *
 * PHASE27B_ADAPTER_AWARENESS_EVIDENCE_STATUS: COMPLETED_STATIC_LOCAL_EVIDENCE_REVIEW
 * PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_STATUS: COMPLETED_RUNTIME_DESIGN_REVIEW
 * PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL
 * PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM
 * PHASE27C_TEST_ONLY_ADAPTER_AWARENESS_MODEL_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_DOC = `docs/testing/phase27b-adapter-awareness-evidence-review.md`;
const RUNTIME_DESIGN_DOC = `docs/planning/phase27b-adapter-awareness-runtime-design-review.md`;
const RELEASE_DOC = `docs/release/phase27b-adapter-awareness-evidence-runtime-design-summary.md`;
const PHASE27C_SEED_DOC = `docs/planning/phase27c-test-only-adapter-awareness-model-seed.md`;
const VALIDATOR = `scripts/validate-phase27b-adapter-awareness-evidence-runtime-design.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(EVIDENCE_DOC)
  ? pass('Evidence review doc exists')
  : fail('Evidence review doc exists', `missing ${EVIDENCE_DOC}`);

fileExists(RUNTIME_DESIGN_DOC)
  ? pass('Runtime design review doc exists')
  : fail('Runtime design review doc exists', `missing ${RUNTIME_DESIGN_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(PHASE27C_SEED_DOC)
  ? pass('Phase 27C seed doc exists')
  : fail('Phase 27C seed doc exists', `missing ${PHASE27C_SEED_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass('CI workflow exists')
  : fail('CI workflow exists', `missing ${CI_WORKFLOW}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase27b-adapter-awareness-evidence-runtime-design')
  ? pass('CI registers Phase 27B validator')
  : fail('CI registers Phase 27B validator', 'e2e-smoke.yml does not reference validate-phase27b');

(ciContent.includes('Fetch origin main for Phase 27B validator') ||
  ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step before Phase 27B validator')
  : fail('CI has explicit fetch step before Phase 27B validator', 'missing fetch step before Phase 27B validator');

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
  ? pass('CI does not run Phase 24D-HF1/HF2 through Phase 27A validators as active merge-blocking steps')
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

const evidenceDocContent = readFile(EVIDENCE_DOC) || '';
const runtimeDesignDocContent = readFile(RUNTIME_DESIGN_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const seedDocContent = readFile(PHASE27C_SEED_DOC) || '';
const allDocContent =
  evidenceDocContent + '\n' + runtimeDesignDocContent + '\n' + releaseDocContent + '\n' + seedDocContent;

const PHASE27B_TOKENS = [
  'PHASE27B_ADAPTER_AWARENESS_EVIDENCE_STATUS: COMPLETED_STATIC_LOCAL_EVIDENCE_REVIEW',
  'PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_STATUS: COMPLETED_RUNTIME_DESIGN_REVIEW',
  'PHASE27B_ADAPTER_AWARENESS_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE27C_TEST_ONLY_NO_WRITE_ADAPTER_AWARENESS_MODEL',
  'PHASE27B_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: STATIC_LOCAL_DESIGN_EVIDENCE_NO_RUNTIME_BEHAVIOR_CLAIM',
  'PHASE27C_TEST_ONLY_ADAPTER_AWARENESS_MODEL_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE27B_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Required headings in evidence review doc ──────────────────────────────

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 27B — Adapter-Awareness Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27A',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Static/local checks performed',
  '## Generated/test data boundary',
  '## Manual/browser evidence boundary',
  '## What the evidence supports',
  '## What the evidence does not prove',
  '## Backup/export boundary',
  '## Restore/import boundary',
  '## Storage driver boundary',
  '## Data safety guardrails',
  '## Claim boundary',
  '## Rollback/removal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_HEADINGS) {
  evidenceDocContent.includes(heading)
    ? pass(`Evidence doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Evidence doc heading missing', `"${heading}"`);
}

// ── 5. Evidence table columns present ────────────────────────────────────────

const REQUIRED_EVIDENCE_COLUMNS = [
  'Evidence area',
  'Evidence source',
  'Observed result',
  'Status',
  'Limitations',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_EVIDENCE_COLUMNS) {
  evidenceDocContent.includes(col)
    ? pass(`Evidence table column present: "${col}"`)
    : fail('Evidence table column missing', `"${col}"`);
}

// ── 6. Evidence table rows present ───────────────────────────────────────────

const REQUIRED_EVIDENCE_ROWS = [
  'current backup/export behavior unchanged',
  'current restore/import behavior unchanged',
  'current storage driver behavior unchanged',
  'backup file format unchanged',
  'restore overwrite behavior unchanged',
  'adapter identity candidate review',
  'export metadata candidate review',
  'restore compatibility warning candidate review',
  'generated/test data restore rehearsal plan',
  'manual/browser evidence plan',
  'no learner content scanning',
  'no external file reads without explicit user action',
  'no telemetry/analytics',
  'rollback/removal plan',
];

for (const row of REQUIRED_EVIDENCE_ROWS) {
  evidenceDocContent.includes(row)
    ? pass(`Evidence table row present: "${row.slice(0, 60)}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 7. Required headings in runtime design review doc ────────────────────────

const REQUIRED_RUNTIME_DESIGN_HEADINGS = [
  '# Phase 27B — Adapter-Awareness Runtime Design Review',
  '## Status tokens',
  '## Scope',
  '## Inputs',
  '## Runtime design purpose',
  '## Design decision',
  '## Future Phase 27C model boundary',
  '## Adapter identity model',
  '## Export metadata model',
  '## Restore compatibility warning model',
  '## Unknown/unavailable adapter state',
  '## No-write boundary',
  '## Backup file format boundary',
  '## Restore overwrite boundary',
  '## Storage migration boundary',
  '## Data safety and rollback plan',
  '## Unit/static evidence plan for Phase 27C',
  '## Manual/browser evidence plan for future UI or restore behavior',
  '## Go/no-go criteria',
  '## What Phase 27B can claim',
  '## What Phase 27B must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RUNTIME_DESIGN_HEADINGS) {
  runtimeDesignDocContent.includes(heading)
    ? pass(`Runtime design doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Runtime design doc heading missing', `"${heading}"`);
}

// ── 8. Runtime design doc contains all required boundaries ───────────────────

const REQUIRED_RUNTIME_DESIGN_BOUNDARIES = [
  'No-write boundary',
  'Backup file format boundary',
  'Restore overwrite boundary',
  'Storage migration boundary',
  'no side effects',
  'generated/test data only',
  'no real backup files',
];

for (const boundary of REQUIRED_RUNTIME_DESIGN_BOUNDARIES) {
  runtimeDesignDocContent.toLowerCase().includes(boundary.toLowerCase())
    ? pass(`Runtime design boundary present: "${boundary}"`)
    : fail('Runtime design boundary missing', `"${boundary}"`);
}

// ── 9. Required headings in release/summary doc ──────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27B — Adapter-Awareness Evidence and Runtime Design Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Runtime design decision',
  '## Phase 27C seed',
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

// ── 10. Required headings in Phase 27C seed doc ──────────────────────────────

const REQUIRED_SEED_HEADINGS = [
  '# Phase 27C — Test-Only Adapter-Awareness Model Seed',
  '## Status token',
  '## Purpose',
  '## Planning constraints',
  '## Candidate model functions',
  '## Required gates before implementation',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  seedDocContent.includes(heading)
    ? pass(`Phase 27C seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 27C seed heading missing', `"${heading}"`);
}

// ── 11. Phase 27C seed contains required candidate model function names ───────

const REQUIRED_CANDIDATE_FUNCTIONS = [
  'normalizeAdapterAwarenessInput',
  'deriveAdapterAwarenessState',
  'createAdapterCompatibilityWarning',
  'summarizeAdapterAwarenessForBackupHealth',
];

for (const fn of REQUIRED_CANDIDATE_FUNCTIONS) {
  seedDocContent.includes(fn)
    ? pass(`Phase 27C seed contains candidate function: "${fn}"`)
    : fail('Phase 27C seed missing candidate function', `"${fn}"`);
}

// ── 12. Phase 27C framed as test-only/no-write ───────────────────────────────

const PHASE27C_TEST_ONLY_REQUIRED = [
  'test-only',
  'no-write',
  'pure function',
  'generated/test data only',
];

for (const term of PHASE27C_TEST_ONLY_REQUIRED) {
  seedDocContent.toLowerCase().includes(term.toLowerCase())
    ? pass(`Phase 27C seed frames test-only/no-write: "${term}"`)
    : fail('Phase 27C seed must frame as test-only/no-write', `"${term}"`);
}

// ── 13. Next phase framing documented in all docs ────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 27C — Test-Only No-Write Adapter-Awareness Model',
  'Phase 27C is a separate test-only implementation gate and is not automatically approved',
  'Phase 27B does not approve production runtime backup/export/restore changes',
  'Phase 27B does not approve backup file format changes',
  'Phase 27B does not approve restore overwrite behavior changes',
  'Phase 27B does not approve storage migration',
  'Phase 27B does not approve production adapter-aware backup/export/restore',
  'Phase 27B does not approve BETA_READY',
];

for (const stmt of NEXT_PHASE_FRAMING) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase framing present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase framing missing', `"${stmt}"`);
}

// ── 14. Required guardrail statements in docs ────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 27B merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 15. Docs must not claim forbidden terms ───────────────────────────────────

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production adapter-aware backup approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'storage migration approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
  'runtime adapter-awareness implemented',
  'Phase 27C implementation exists',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? fail(`Docs must not claim: "${phrase}"`)
    : pass(`Docs do not claim: "${phrase.slice(0, 60)}"`);
}

// ── 16. Exact changed-file check via git ─────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase27b-adapter-awareness-evidence-review.md`,
  `docs/planning/phase27b-adapter-awareness-runtime-design-review.md`,
  `docs/release/phase27b-adapter-awareness-evidence-runtime-design-summary.md`,
  `docs/planning/phase27c-test-only-adapter-awareness-model-seed.md`,
  `scripts/validate-phase27b-adapter-awareness-evidence-runtime-design.js`,
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
  'docs/testing/phase27a',
  'docs/release/phase27a',
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
        `branch "${currentBranch}" has empty diff but is not main — no Phase 27B changes committed`
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
        ? pass('No prior Phase 27A/26E/26D/26C/26B/26A/25N/25M/25K/25I files in diff')
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
          !f.includes('phase27b') &&
          !f.includes('phase27c')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27b') &&
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

      const runtimeSourceFiles = changedFiles.filter(
        f => f.startsWith(`src/`) || f.startsWith(`tests/`) || f.startsWith(`e2e/`)
      );
      runtimeSourceFiles.length === 0
        ? pass('No runtime/source/test/e2e files changed')
        : fail('Runtime/source/test/e2e files must not be changed', runtimeSourceFiles.join(', '));

      const adrFiles = changedFiles.filter(f => f.startsWith(`docs/adr/`));
      adrFiles.length === 0
        ? pass('No ADR files changed')
        : fail('ADR files must not be changed', adrFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 17. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27B');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27B');

// ── 18. Telemetry/analytics strings not added outside negative guardrails ─────

const TELEMETRY_TERMS = ['telemetry', 'analytics', 'tracking'];
for (const term of TELEMETRY_TERMS) {
  const docOccurrences = allDocContent.toLowerCase().split(term.toLowerCase()).length - 1;
  if (docOccurrences > 0) {
    const inGuardrailContext = allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes(`no telemetry or analytics`);
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context`);
  } else {
    pass(`No unpredicted telemetry/analytics term: "${term}"`);
  }
}

// ── 19. No sync/cloud/account/auth/backend files referenced outside negative guardrails ─

const SYNC_CLOUD_TERMS = ['sync/cloud/account/auth/backend'];
for (const term of SYNC_CLOUD_TERMS) {
  const present = allDocContent.includes(term);
  present
    ? pass(`Sync/cloud/auth/backend term appears as guardrail boundary in docs: "${term.slice(0, 40)}"`)
    : fail('Sync/cloud/auth/backend guardrail boundary missing from docs', `"${term}"`);
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
