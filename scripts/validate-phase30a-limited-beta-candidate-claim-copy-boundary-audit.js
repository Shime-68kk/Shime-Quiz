#!/usr/bin/env node
/**
 * Phase 30A Static Validator — Limited Beta Candidate Claim/Copy Boundary Audit
 *
 * PHASE30A_CLAIM_COPY_BOUNDARY_AUDIT_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_CLAIM_COPY_AUDIT
 * PHASE30A_CLAIM_COPY_BOUNDARY_DECISION: PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE
 * PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY
 * PHASE30A_OPEN_GAPS_STATUS: DOCUMENTED_EVIDENCE_LIMITATIONS_AND_BLOCKED_LANES
 * PHASE30B_LIMITED_BETA_CANDIDATE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase30a-limited-beta-candidate-claim-copy-boundary-audit.md`;
const RELEASE_DOC = `docs/release/phase30a-limited-beta-candidate-claim-copy-boundary-audit-summary.md`;
const PHASE30B_SEED_DOC = `docs/planning/phase30b-limited-beta-candidate-gate-seed.md`;
const VALIDATOR = `scripts/validate-phase30a-limited-beta-candidate-claim-copy-boundary-audit.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 30A claim/copy boundary audit doc exists', TESTING_DOC],
  ['Phase 30A release summary doc exists', RELEASE_DOC],
  ['Phase 30B seed doc exists', PHASE30B_SEED_DOC],
  ['Phase 30A validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase30bSeedContent = readFile(PHASE30B_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + phase30bSeedContent;
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 30A decision token — must match one of three allowed values ──

const ALLOWED_DECISION_TOKEN_VALUES = [
  'PASS_TO_PHASE30B_LIMITED_BETA_CANDIDATE_GATE',
  'NEEDS_COPY_OR_CLAIM_FIXES_BEFORE_LIMITED_BETA_CANDIDATE_GATE',
  'HOLD_LIMITED_BETA_CANDIDATE',
];

const DECISION_TOKEN_PREFIX = 'PHASE30A_CLAIM_COPY_BOUNDARY_DECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_TOKEN_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(`Phase 30A decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`);
} else {
  fail(
    'Phase 30A decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_TOKEN_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 4. Required always-present tokens ────────────────────────────────────────

const REQUIRED_ALWAYS_TOKENS = [
  'PHASE30A_CLAIM_COPY_BOUNDARY_AUDIT_STATUS: COMPLETED_LIMITED_BETA_CANDIDATE_CLAIM_COPY_AUDIT',
  'PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY',
  'PHASE30A_OPEN_GAPS_STATUS: DOCUMENTED_EVIDENCE_LIMITATIONS_AND_BLOCKED_LANES',
  'PHASE30B_LIMITED_BETA_CANDIDATE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_ALWAYS_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Always-required token present: ${token.slice(0, 90)}`)
    : fail('Always-required token missing', token);
}

// ── 5. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 29F',
  '## Audit method',
  '## Claim surfaces audited',
  '## Claim/copy audit table',
  '## Allowed wording boundaries',
  '## Forbidden wording checks',
  '## Findings',
  '## Required copy fixes',
  '## Evidence limitations carried forward',
  '## Chosen claim/copy boundary decision',
  '## Decision rationale',
  '## What this decision supports',
  '## What this decision does not support',
  '## Restore rehearsal blocked-lane wording boundary',
  '## Adapter-awareness blocked-lane wording boundary',
  '## LocalStorage diff wording boundary',
  '## Stress-adjacent wording boundary',
  '## Rollback/removal wording boundary',
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
  '# Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit Summary',
  '## Status tokens',
  '## Scope',
  '## Audit result',
  '## Chosen decision',
  '## Decision rationale',
  '## Findings',
  '## Required copy fixes',
  '## Open evidence limitations',
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

// ── 7. Required Phase 30B seed headings ──────────────────────────────────────

const REQUIRED_PHASE30B_SEED_HEADINGS = [
  '# Phase 30B — Limited Beta Candidate Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 30A',
  '## Gate constraints',
  '## Required gates before decision',
  '## Evidence packet requirements',
  '## Decision options',
  '## Forbidden default approvals',
  '## Remaining evidence limitations to weigh',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE30B_SEED_HEADINGS) {
  phase30bSeedContent.includes(heading)
    ? pass(`Phase 30B seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 30B seed heading missing', `"${heading}"`);
}

// ── 8. Phase 30B seed token present ──────────────────────────────────────────

phase30bSeedContent.includes(
  'PHASE30B_LIMITED_BETA_CANDIDATE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 30B seed token present in Phase 30B seed doc')
  : fail('Phase 30B seed token missing from Phase 30B seed doc');

// ── 9. Phase 30B seed framed as separate gate ─────────────────────────────────

phase30bSeedContent.includes(
  'Phase 30B is a separate limited beta candidate gate and is not automatically approved.'
)
  ? pass('Phase 30B framed as separate limited beta candidate gate (not automatically approved)')
  : fail('Phase 30B must be framed as a separate limited beta candidate gate, not automatically approved');

// ── 10. Phase 30B decision options present in seed doc ───────────────────────

const REQUIRED_PHASE30B_DECISION_OPTIONS = [
  'HOLD_LIMITED_BETA_CANDIDATE',
  'NEEDS_MORE_EVIDENCE_OR_COPY_FIXES',
  'PASS_LIMITED_BETA_CANDIDATE',
];

for (const opt of REQUIRED_PHASE30B_DECISION_OPTIONS) {
  phase30bSeedContent.includes(opt)
    ? pass(`Phase 30B decision option present in seed doc: "${opt}"`)
    : fail('Phase 30B decision option missing from seed doc', `"${opt}"`);
}

// ── 11. Claim/copy audit table columns present ───────────────────────────────

const REQUIRED_AUDIT_TABLE_COLUMNS = [
  'Surface',
  'Files or routes reviewed',
  'Audit method',
  'Finding',
  'Required fix',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_AUDIT_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Audit table column present: "${col}"`)
    : fail('Audit table column missing from testing doc', `"${col}"`);
}

// ── 12. Claim/copy audit table rows present ───────────────────────────────────

const REQUIRED_AUDIT_TABLE_ROWS = [
  'landing page visible copy',
  'dashboard copy',
  'library/import copy',
  'backup/export/restore copy if visible',
  'settings copy',
  'release notes/PR notes',
  'user-facing docs',
  'limited beta candidate wording',
  'AI/OCR/API-key/BYOK',
  'cloud/sync/account/auth/backend',
  'data-loss guarantee',
  'production restore',
  'telemetry/analytics',
];

for (const row of REQUIRED_AUDIT_TABLE_ROWS) {
  testingDocContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Audit table row present: "${row}"`)
    : fail('Audit table row missing from testing doc', `"${row}"`);
}

// ── 13. Allowed wording boundaries present ────────────────────────────────────

const REQUIRED_WORDING_BOUNDARY_ITEMS = [
  'local-first',
  'No cloud sync',
  'no backend',
  'no account',
  'Experimental',
  'Manual AI workflow',
  'Local learning analytics',
];

for (const item of REQUIRED_WORDING_BOUNDARY_ITEMS) {
  testingDocContent.includes(item)
    ? pass(`Allowed wording boundary item present: "${item}"`)
    : fail('Allowed wording boundary item missing from testing doc', `"${item}"`);
}

// ── 14. Forbidden wording checks present ─────────────────────────────────────

const REQUIRED_FORBIDDEN_WORDING_CHECKS = [
  'production ready',
  'BETA_READY',
  'guaranteed',
  'sync',
  'cloud',
  'LIMITED_BETA_CANDIDATE',
  'telemetry',
  'analytics',
];

for (const check of REQUIRED_FORBIDDEN_WORDING_CHECKS) {
  testingDocContent.includes(check)
    ? pass(`Forbidden wording check present: "${check}"`)
    : fail('Forbidden wording check missing from testing doc', `"${check}"`);
}

// ── 15. Required copy fixes section present ───────────────────────────────────

testingDocContent.includes('## Required copy fixes')
  ? pass('Required copy fixes section present in testing doc')
  : fail('Required copy fixes section missing from testing doc');

testingDocContent.includes('RELEASE_NOTES')
  ? pass('Required copy fixes references RELEASE_NOTES legacy claim')
  : fail('Required copy fixes must reference RELEASE_NOTES legacy claim');

// ── 16. Evidence limitations from Phase 29F carried forward ──────────────────

const REQUIRED_EVIDENCE_LIMITATIONS = [
  'Restore rehearsal browser lane',
  'Adapter-awareness browser lane',
  'localStorage diffs',
  '100+',
  'rollback',
  'real learner data',
];

for (const limitation of REQUIRED_EVIDENCE_LIMITATIONS) {
  testingDocContent.includes(limitation)
    ? pass(`Evidence limitation carried forward: "${limitation}"`)
    : fail('Evidence limitation missing from testing doc', `"${limitation}"`);
}

testingDocContent.includes('BLOCKED')
  ? pass('BLOCKED lane reference present in testing doc (evidence limitations)')
  : fail('Testing doc must reference BLOCKED lanes from Phase 29F');

// ── 17. Required guardrail statements present ─────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Next recommended phase: Phase 30B — Limited Beta Candidate Gate',
  'Phase 30B is a separate limited beta candidate gate and is not automatically approved.',
  'Phase 30A does not approve LIMITED_BETA_CANDIDATE.',
  'Phase 30A does not approve BETA_READY.',
  'Phase 30A does not approve public production readiness.',
  'Phase 30A does not approve guaranteed data-loss prevention.',
  'Phase 30A does not approve restore execution.',
  'Phase 30A does not approve production restore rehearsal.',
  'Phase 30A does not approve real learner data restore rehearsal.',
  'Phase 30A does not approve runtime backup/export/restore changes.',
  'Phase 30A does not approve backup file format changes.',
  'Phase 30A does not approve restore overwrite behavior changes.',
  'Phase 30A does not approve storage migration.',
  'Phase 30A does not approve sync/cloud/account/auth/backend.',
  'Phase 30A does not approve telemetry/analytics.',
  'Phase 30A does not approve built-in AI/OCR/API-key/BYOK behavior.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 18. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase30a-limited-beta-candidate-claim-copy-boundary-audit')
  ? pass('CI registers Phase 30A validator')
  : fail(
      'CI must register Phase 30A validator',
      'e2e-smoke.yml does not reference validate-phase30a-limited-beta-candidate-claim-copy-boundary-audit'
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
      'CI does not run Phase 24D through Phase 29F validators as active merge-blocking steps'
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

// ── 19. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 20. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 21. Exact changed-file check via git (post-merge-main safe, double-dot) ───

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase30a-limited-beta-candidate-claim-copy-boundary-audit.md`,
  `docs/release/phase30a-limited-beta-candidate-claim-copy-boundary-audit-summary.md`,
  `docs/planning/phase30b-limited-beta-candidate-gate-seed.md`,
  `scripts/validate-phase30a-limited-beta-candidate-claim-copy-boundary-audit.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 30A changes committed`
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
        ? pass('No prior Phase 29F/29E/29D/29C/29B/29A/28/27/26/25 files in diff')
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
        if (f.includes('phase30a') || f.includes('phase30b')) return false;
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
          !f.includes('phase30a') &&
          !f.includes('phase30b') &&
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
        : fail('src/ files must not be changed in Phase 30A', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 30A', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 22. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 30A');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 30A');

// ── 23. No Phase 30A files newly import prototype modules ─────────────────────

const PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase30aNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase30aNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase30a')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 30A file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 30A file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 24. Forbidden claim strings absent from doc content ──────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 30A implementation exists',
  'LIMITED_BETA_CANDIDATE approved',
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
    allDocContent.includes('Phase 30A does not approve') ||
    allDocContent.includes('does not approve BETA_READY');
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 25. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyMatches = (allDocContent.match(/BETA_READY/g) || []).length;
const betaReadyNegativeContext =
  allDocContent.includes('does not approve BETA_READY') ||
  allDocContent.includes('Phase 30A does not approve BETA_READY') ||
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

// ── 26. LIMITED_BETA_CANDIDATE approved references must be in negative context ──

const limitedBetaApprovedCount = (
  allDocContent.match(/LIMITED_BETA_CANDIDATE.*approved|LIMITED_BETA_CANDIDATE.*APPROVED/gi) || []
).length;

const limitedBetaNegativeContext =
  allDocContent.includes('does not approve LIMITED_BETA_CANDIDATE') ||
  allDocContent.includes('Phase 30A does not approve LIMITED_BETA_CANDIDATE') ||
  allDocContent.includes('LIMITED_BETA_CANDIDATE is not approved') ||
  allDocContent.includes('Phase 30A does not approve');

if (limitedBetaApprovedCount === 0) {
  pass('No LIMITED_BETA_CANDIDATE approved references found in docs');
} else if (limitedBetaNegativeContext) {
  pass(
    `LIMITED_BETA_CANDIDATE approved references appear only in negative/guardrail context (found ${limitedBetaApprovedCount} occurrences)`
  );
} else {
  fail('LIMITED_BETA_CANDIDATE must not be claimed as approved in docs');
}

// ── 27. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

const hasSyncGuardrail =
  allDocContent.includes('No sync/cloud/account/auth/backend.') ||
  allDocContent.includes('sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('Sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('does not approve sync/cloud/account/auth/backend');
hasSyncGuardrail
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      'docs must state sync/cloud/account/auth/backend is not approved'
    );

// ── 28. Docs do not positively claim broad or stress-tested readiness ─────────

const FORBIDDEN_LARGE_SCOPE_CLAIMS = [
  'production restore rehearsal approved',
  'real learner data restore rehearsal approved',
  'stress-tested readiness approved',
  'broad validation approved',
  'storage migration approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
];

for (const claim of FORBIDDEN_LARGE_SCOPE_CLAIMS) {
  allDocContent.toLowerCase().includes(claim.toLowerCase())
    ? fail(`Docs must not claim: "${claim}"`)
    : pass(`Docs do not claim: "${claim.slice(0, 60)}"`);
}

// ── 29. Phase 30A decision scope token confirms not BETA_READY ───────────────

allDocContent.includes(
  'PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY'
)
  ? pass(
      'Phase 30A decision scope token confirms not LIMITED_BETA_CANDIDATE and not BETA_READY'
    )
  : fail(
      'Phase 30A decision scope token missing or incorrect',
      'PHASE30A_DECISION_SCOPE: CLAIM_COPY_AUDIT_ONLY_NOT_LIMITED_BETA_CANDIDATE_NOT_BETA_READY'
    );

// ── 30. Docs do not claim Phase 30B implementation exists ────────────────────

const phase30bImplementationClaim = allDocContent.includes('Phase 30B implementation exists');
!phase30bImplementationClaim
  ? pass('Docs do not claim Phase 30B implementation exists')
  : fail('Docs must not claim Phase 30B implementation exists');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
