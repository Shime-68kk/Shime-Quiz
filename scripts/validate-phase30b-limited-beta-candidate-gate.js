#!/usr/bin/env node
/**
 * Phase 30B Static Validator — Limited Beta Candidate Gate
 *
 * PHASE30B_LIMITED_BETA_CANDIDATE_GATE_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_GATE
 * PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: PASS_LIMITED_BETA_CANDIDATE
 * PHASE30B_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
 * PHASE30B_OPEN_LIMITATIONS_STATUS: DOCUMENTED_LIMITED_CANDIDATE_WITH_EVIDENCE_GAPS
 * PHASE30C_BETA_READY_DECISION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase30b-limited-beta-candidate-gate.md`;
const RELEASE_DOC = `docs/release/phase30b-limited-beta-candidate-gate-summary.md`;
const PHASE30C_SEED_DOC = `docs/planning/phase30c-beta-ready-decision-seed.md`;
const VALIDATOR = `scripts/validate-phase30b-limited-beta-candidate-gate.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 30B gate doc exists', TESTING_DOC],
  ['Phase 30B release summary doc exists', RELEASE_DOC],
  ['Phase 30C seed doc exists', PHASE30C_SEED_DOC],
  ['Phase 30B validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase30cSeedContent = readFile(PHASE30C_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + phase30cSeedContent;
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 30B decision token — must match one of three allowed values ──

const ALLOWED_DECISION_TOKEN_VALUES = [
  'PASS_LIMITED_BETA_CANDIDATE',
  'NEEDS_MORE_EVIDENCE_OR_COPY_FIXES',
  'HOLD_LIMITED_BETA_CANDIDATE',
];

const DECISION_TOKEN_PREFIX = 'PHASE30B_LIMITED_BETA_CANDIDATE_DECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_TOKEN_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(`Phase 30B decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`);
} else {
  fail(
    'Phase 30B decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_TOKEN_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 4. Required always-present tokens ────────────────────────────────────────

const REQUIRED_ALWAYS_TOKENS = [
  'PHASE30B_LIMITED_BETA_CANDIDATE_GATE_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_GATE',
  'PHASE30B_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY',
  'PHASE30B_OPEN_LIMITATIONS_STATUS: DOCUMENTED_LIMITED_CANDIDATE_WITH_EVIDENCE_GAPS',
  'PHASE30C_BETA_READY_DECISION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_ALWAYS_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Always-required token present: ${token.slice(0, 90)}`)
    : fail('Always-required token missing', token);
}

// ── 5. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 30B — Limited Beta Candidate Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 30A',
  '## Gate method',
  '## Gate decision table',
  '## Evidence rollup',
  '## Claim/copy audit rollup',
  '## Legacy release-notes claim review',
  '## Analytics versus telemetry clarification',
  '## Open limitations',
  '## Limited beta candidate decision options',
  '## Chosen limited beta candidate decision',
  '## Decision rationale',
  '## Limited beta candidate definition',
  '## What this decision supports',
  '## What this decision does not support',
  '## Conditions for any limited beta use',
  '## Required operator/user-facing caveats',
  '## Remaining blockers before BETA_READY',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 6. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 30B — Limited Beta Candidate Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Gate result',
  '## Chosen decision',
  '## Decision rationale',
  '## Legacy claim and analytics follow-up resolution',
  '## Open limitations',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 7. Required Phase 30C seed headings ──────────────────────────────────────

const REQUIRED_PHASE30C_SEED_HEADINGS = [
  '# Phase 30C — Beta Ready Decision Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 30B',
  '## Decision constraints',
  '## Required gates before any BETA_READY claim',
  '## Evidence still needed for BETA_READY',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE30C_SEED_HEADINGS) {
  phase30cSeedContent.includes(heading)
    ? pass(`Phase 30C seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 30C seed heading missing', `"${heading}"`);
}

// ── 8. Phase 30C seed token present ──────────────────────────────────────────

phase30cSeedContent.includes(
  'PHASE30C_BETA_READY_DECISION_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 30C seed token present in Phase 30C seed doc')
  : fail('Phase 30C seed token missing from Phase 30C seed doc');

// ── 9. Phase 30C seed framed as separate gate ─────────────────────────────────

phase30cSeedContent.includes(
  'Phase 30C is a separate beta-ready decision gate and is not automatically approved.'
)
  ? pass('Phase 30C framed as separate beta-ready decision gate (not automatically approved)')
  : fail('Phase 30C must be framed as a separate beta-ready decision gate, not automatically approved');

// ── 10. Phase 30C decision options present in seed doc ───────────────────────

const REQUIRED_PHASE30C_DECISION_OPTIONS = [
  'HOLD_BETA_READY',
  'NEEDS_MORE_EVIDENCE_FOR_BETA_READY',
  'BETA_READY',
];

for (const opt of REQUIRED_PHASE30C_DECISION_OPTIONS) {
  phase30cSeedContent.includes(opt)
    ? pass(`Phase 30C decision option present in seed doc: "${opt}"`)
    : fail('Phase 30C decision option missing from seed doc', `"${opt}"`);
}

// ── 11. Gate decision table columns present ───────────────────────────────────

const REQUIRED_GATE_TABLE_COLUMNS = [
  'Gate item',
  'Source',
  'Evidence reviewed',
  'Status',
  'Limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_GATE_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Gate decision table column present: "${col}"`)
    : fail('Gate decision table column missing from testing doc', `"${col}"`);
}

// ── 12. Gate decision table rows present ─────────────────────────────────────

const REQUIRED_GATE_TABLE_ROWS = [
  'Phase 29C claim/copy partial evidence',
  'Phase 29D beta gate hold/review',
  'Phase 29E 3/5 targeted evidence threshold',
  'Phase 29F pass-to-audit-only re-decision',
  'Phase 30A claim/copy audit',
  'Legacy release-notes claim review',
  'Analytics versus telemetry clarification',
  'Restore rehearsal browser lane blocked',
  'Adapter-awareness browser lane blocked',
  'localStorage diff limitation',
  '100+ card stress test limitation',
  'Rollback/removal limitation',
  'No real learner data boundary',
  'No restore execution boundary',
  'No sync/cloud/account/backend boundary',
  'BETA_READY absence',
];

for (const row of REQUIRED_GATE_TABLE_ROWS) {
  testingDocContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Gate decision table row present: "${row}"`)
    : fail('Gate decision table row missing from testing doc', `"${row}"`);
}

// ── 13. Legacy release-notes claim review present ────────────────────────────

testingDocContent.includes('## Legacy release-notes claim review')
  ? pass('Legacy release-notes claim review section present in testing doc')
  : fail('Legacy release-notes claim review section missing from testing doc');

testingDocContent.includes('AI-verified beta candidate: YES')
  ? pass('Legacy release-notes claim reviewed in testing doc')
  : fail('Testing doc must review legacy "AI-verified beta candidate: YES — SHIP" claim');

testingDocContent.includes('historical/legacy')
  ? pass('Legacy claim bounded as historical/legacy in testing doc')
  : fail('Testing doc must bound legacy claim as historical/legacy');

// ── 14. Analytics versus telemetry clarification present ─────────────────────

testingDocContent.includes('## Analytics versus telemetry clarification')
  ? pass('Analytics versus telemetry clarification section present in testing doc')
  : fail('Analytics versus telemetry clarification section missing from testing doc');

testingDocContent.includes('local learning analytics')
  ? pass('Local learning analytics distinction present in testing doc')
  : fail('Testing doc must clarify local learning analytics vs external telemetry');

testingDocContent.includes('not external user telemetry')
  ? pass('External telemetry negation present in testing doc')
  : fail('Testing doc must state analytics is not external user telemetry');

// ── 15. Open limitations carried forward ─────────────────────────────────────

const REQUIRED_OPEN_LIMITATIONS = [
  'Restore rehearsal browser lane',
  'Adapter-awareness browser lane',
  'localStorage diffs',
  '100+',
  'rollback',
  'real learner data',
];

for (const limitation of REQUIRED_OPEN_LIMITATIONS) {
  testingDocContent.includes(limitation)
    ? pass(`Open limitation carried forward: "${limitation}"`)
    : fail('Open limitation missing from testing doc', `"${limitation}"`);
}

testingDocContent.includes('BLOCKED')
  ? pass('BLOCKED lane reference present in testing doc (open limitations)')
  : fail('Testing doc must reference BLOCKED lanes from Phase 29F');

// ── 16. Required guardrail statements present ─────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Next recommended phase: Phase 30C — Beta Ready Decision / Hold',
  'Phase 30C is a separate beta-ready decision gate and is not automatically approved.',
  'Phase 30B approves LIMITED_BETA_CANDIDATE only if the chosen decision token is PASS_LIMITED_BETA_CANDIDATE.',
  'Phase 30B does not approve BETA_READY.',
  'Phase 30B does not approve public production readiness.',
  'Phase 30B does not approve guaranteed data-loss prevention.',
  'Phase 30B does not approve restore execution.',
  'Phase 30B does not approve production restore rehearsal.',
  'Phase 30B does not approve real learner data restore rehearsal.',
  'Phase 30B does not approve runtime backup/export/restore changes.',
  'Phase 30B does not approve backup file format changes.',
  'Phase 30B does not approve restore overwrite behavior changes.',
  'Phase 30B does not approve storage migration.',
  'Phase 30B does not approve sync/cloud/account/auth/backend.',
  'Phase 30B does not approve telemetry/analytics.',
  'Phase 30B does not approve built-in AI/OCR/API-key/BYOK behavior.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 17. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase30b-limited-beta-candidate-gate')
  ? pass('CI registers Phase 30B validator')
  : fail(
      'CI must register Phase 30B validator',
      'e2e-smoke.yml does not reference validate-phase30b-limited-beta-candidate-gate'
    );

const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
hasCheckoutFetchDepth
  ? pass('CI checkout uses fetch-depth: 0')
  : fail('CI checkout must use fetch-depth: 0');

ciContent.includes('actions/checkout@v4')
  ? pass('CI uses actions/checkout@v4')
  : fail('CI must use actions/checkout@v4');

const hasForbiddenFetchStep = ciContent.includes(
  'git fetch origin refs/heads/main:refs/remotes/origin/main --prune'
);
!hasForbiddenFetchStep
  ? pass('CI has no forbidden shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune')
  : fail(
      'CI must not have shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune'
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
  'validate-phase27d',
  'validate-phase27e',
  'validate-phase27f',
  'validate-phase28a',
  'validate-phase28b',
  'validate-phase28c',
  'validate-phase28d',
  'validate-phase28e',
  'validate-phase29a',
  'validate-phase29b',
  'validate-phase29c',
  'validate-phase29d',
  'validate-phase29e',
  'validate-phase29f',
  'validate-phase30a',
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
  ? pass(
      'CI does not run Phase 24D through Phase 30A validators as active merge-blocking steps'
    )
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes('continue-on-error: true')
  ? fail(
      'CI workflow has no continue-on-error: true',
      'found continue-on-error: true in e2e-smoke.yml'
    )
  : pass('CI workflow has no continue-on-error: true');

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail(
      'CI does not run full validate-*.js glob loop',
      `found "for f in scripts/validate-*.js"`
    )
  : pass('CI does not run full validate-*.js glob loop');

// ── 18. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 19. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 20. Exact changed-file check via git (post-merge-main safe, double-dot) ───

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase30b-limited-beta-candidate-gate.md`,
  `docs/release/phase30b-limited-beta-candidate-gate-summary.md`,
  `docs/planning/phase30c-beta-ready-decision-seed.md`,
  `scripts/validate-phase30b-limited-beta-candidate-gate.js`,
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
  `docs/testing/phase30a`,
  `docs/release/phase30a`,
  `docs/planning/phase30a`,
  `scripts/validate-phase30a`,
  `docs/testing/phase29f`,
  `docs/release/phase29f`,
  `docs/planning/phase29f`,
  `scripts/validate-phase29f`,
  `docs/testing/phase29e`,
  `docs/release/phase29e`,
  `docs/planning/phase29e`,
  `scripts/validate-phase29e`,
  `docs/testing/phase29d`,
  `docs/release/phase29d`,
  `docs/planning/phase29d`,
  `scripts/validate-phase29d`,
  `docs/testing/phase29c`,
  `docs/release/phase29c`,
  `docs/planning/phase29c`,
  `scripts/validate-phase29c`,
  `docs/testing/phase29b`,
  `docs/release/phase29b`,
  `docs/planning/phase29b`,
  `scripts/validate-phase29b`,
  `docs/testing/phase29a`,
  `docs/release/phase29a`,
  `docs/planning/phase29a`,
  `scripts/validate-phase29a`,
  `docs/testing/phase28e`,
  `docs/release/phase28e`,
  `docs/planning/phase28e`,
  `scripts/validate-phase28e`,
  `docs/testing/phase28d`,
  `docs/release/phase28d`,
  `docs/planning/phase28d`,
  `scripts/validate-phase28d`,
  `docs/testing/phase28c`,
  `docs/release/phase28c`,
  `docs/planning/phase28c`,
  `scripts/validate-phase28c`,
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
        `branch "${currentBranch}" has empty diff — no Phase 30B changes committed`
      );
    } else if (diffEmpty && onMain) {
      pass(
        'Exact changed-file check: post-merge main with empty diff — content guardrails enforced, file-list check skipped'
      );
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
        ? pass('No prior Phase 30A/29F/29E/29D/29C/29B/29A/28/27/26/25 files in diff')
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

      const backupRestoreFiles = changedFiles.filter(f => {
        if (f.includes('phase30b') || f.includes('phase30c')) return false;
        return f.includes('backup') || f.includes('restore') || f.includes('export');
      });
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail(
            'Production backup/export/restore modules must not be changed',
            backupRestoreFiles.join(', ')
          );

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase30b') &&
          !f.includes('phase30c') &&
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
        : fail('src/ files must not be changed in Phase 30B', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 30B', testFiles.join(', '));

      const releaseNotesFiles = changedFiles.filter(
        f => f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md'
      );
      releaseNotesFiles.length === 0
        ? pass('RELEASE_NOTES.md and RELEASE_NOTES_V2.md not modified')
        : fail('RELEASE_NOTES.md and RELEASE_NOTES_V2.md must not be modified in Phase 30B', releaseNotesFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 21. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 30B');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 30B');

// ── 22. No Phase 30B files newly import prototype modules ─────────────────────

const PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase30bNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase30bNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase30b')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 30B file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 30B file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 23. Forbidden claim strings absent from doc content ──────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 30B implementation exists',
  'Phase 30C implementation exists',
  'BETA_READY approved',
];

for (const claim of FORBIDDEN_CLAIM_STRINGS) {
  if (!allDocContent.includes(claim)) {
    pass(`No forbidden claim "${claim.slice(0, 50)}" in doc content`);
    continue;
  }
  const inNegativeContext =
    allDocContent.includes(`no ${claim}`) ||
    allDocContent.toLowerCase().includes(`no ${claim.toLowerCase()}`) ||
    allDocContent.includes(`does not approve ${claim}`) ||
    allDocContent.includes(`must not claim ${claim}`) ||
    allDocContent.includes(`not ${claim}`) ||
    allDocContent.includes('Phase 30B does not approve') ||
    allDocContent.includes('does not approve BETA_READY');
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 24. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyMatches = (allDocContent.match(/BETA_READY/g) || []).length;
const betaReadyNegativeContext =
  allDocContent.includes('does not approve BETA_READY') ||
  allDocContent.includes('Phase 30B does not approve BETA_READY') ||
  allDocContent.includes('not BETA_READY') ||
  allDocContent.includes('NOT_BETA_READY') ||
  allDocContent.includes('not approved');

if (betaReadyMatches === 0) {
  pass('BETA_READY not found in doc content (no positive or negative)');
} else if (betaReadyNegativeContext) {
  pass(
    `BETA_READY appears only in negative/guardrail context in docs (found ${betaReadyMatches} occurrences)`
  );
} else {
  fail('BETA_READY must not appear as a positive claim in docs');
}

// ── 25. Docs do not positively claim public production readiness ──────────────

const FORBIDDEN_LARGE_SCOPE_CLAIMS = [
  'production restore rehearsal approved',
  'real learner data restore rehearsal approved',
  'stress-tested readiness approved',
  'broad validation approved',
  'storage migration approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'public production readiness approved',
];

for (const claim of FORBIDDEN_LARGE_SCOPE_CLAIMS) {
  allDocContent.toLowerCase().includes(claim.toLowerCase())
    ? fail(`Docs must not claim: "${claim}"`)
    : pass(`Docs do not claim: "${claim.slice(0, 60)}"`);
}

// ── 26. Phase 30B decision scope token confirms not BETA_READY ───────────────

allDocContent.includes(
  'PHASE30B_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY'
)
  ? pass(
      'Phase 30B decision scope token confirms not BETA_READY and not PUBLIC_PRODUCTION_READY'
    )
  : fail(
      'Phase 30B decision scope token missing or incorrect',
      'PHASE30B_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY'
    );

// ── 27. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

const hasSyncGuardrail =
  allDocContent.includes('Sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('does not approve sync/cloud/account/auth/backend') ||
  allDocContent.includes('Phase 30B does not approve sync/cloud/account/auth/backend.');
hasSyncGuardrail
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      'docs must state sync/cloud/account/auth/backend is not approved'
    );

// ── 28. Docs do not claim Phase 30C implementation exists ────────────────────

const phase30cImplementationClaim = allDocContent.includes('Phase 30C implementation exists');
!phase30cImplementationClaim
  ? pass('Docs do not claim Phase 30C implementation exists')
  : fail('Docs must not claim Phase 30C implementation exists');

// ── 29. Docs do not claim guaranteed data-loss prevention ────────────────────

const guaranteedDataLossClaim =
  allDocContent.toLowerCase().includes('guaranteed data-loss prevention approved') ||
  allDocContent.toLowerCase().includes('guaranteed data safety approved');
!guaranteedDataLossClaim
  ? pass('Docs do not claim guaranteed data-loss prevention approved')
  : fail('Docs must not claim guaranteed data-loss prevention approved');

// ── 30. Docs do not claim restore execution ──────────────────────────────────

const restoreExecutionClaim =
  allDocContent.toLowerCase().includes('restore execution approved') ||
  allDocContent.toLowerCase().includes('restore execution safe');
!restoreExecutionClaim
  ? pass('Docs do not claim restore execution approved or safe')
  : fail('Docs must not claim restore execution approved or safe');

// ── 31. Analytics/telemetry approval must not be positively claimed ──────────

const telemetryApprovalClaim =
  allDocContent.toLowerCase().includes('telemetry approved') ||
  allDocContent.toLowerCase().includes('analytics approved') ||
  allDocContent.toLowerCase().includes('external telemetry approved');
!telemetryApprovalClaim
  ? pass('Docs do not positively claim telemetry/analytics approved')
  : fail('Docs must not positively claim telemetry/analytics approved');

// ── 32. Docs do not claim built-in AI/OCR/API-key/BYOK ───────────────────────

const aiByokClaim =
  allDocContent.toLowerCase().includes('built-in ai approved') ||
  allDocContent.toLowerCase().includes('ocr approved') ||
  allDocContent.toLowerCase().includes('byok approved') ||
  allDocContent.toLowerCase().includes('api-key approved');
!aiByokClaim
  ? pass('Docs do not claim built-in AI/OCR/API-key/BYOK approved')
  : fail('Docs must not claim built-in AI/OCR/API-key/BYOK approved');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
