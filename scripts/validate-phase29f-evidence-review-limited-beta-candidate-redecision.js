#!/usr/bin/env node
/**
 * Phase 29F Static Validator — Evidence Review and Limited Beta Candidate Re-Decision
 *
 * PHASE29F_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE29C_29D_29E_EVIDENCE_REVIEW
 * PHASE29F_LIMITED_BETA_CANDIDATE_REDECISION: PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT
 * PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
 * PHASE29F_OPEN_GAPS_STATUS: DOCUMENTED_BLOCKED_LANES_AND_LIMITATIONS
 * PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase29f-evidence-review-limited-beta-candidate-redecision.md`;
const RELEASE_DOC = `docs/release/phase29f-evidence-review-limited-beta-candidate-redecision-summary.md`;
const PHASE30A_SEED_DOC = `docs/planning/phase30a-limited-beta-candidate-claim-copy-boundary-audit-seed.md`;
const VALIDATOR = `scripts/validate-phase29f-evidence-review-limited-beta-candidate-redecision.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 29F evidence review doc exists', TESTING_DOC],
  ['Phase 29F release summary doc exists', RELEASE_DOC],
  ['Phase 30A seed doc exists', PHASE30A_SEED_DOC],
  ['Phase 29F validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase30aSeedContent = readFile(PHASE30A_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + phase30aSeedContent;
const allTextContent = allDocContent + '\n' + validatorContent;

const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 29F decision token — must match one of three allowed values ──

const ALLOWED_DECISION_TOKEN_VALUES = [
  'PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT',
  'NEEDS_MORE_EVIDENCE_BEFORE_LIMITED_BETA_CANDIDATE_PREP',
  'HOLD_BETA_GATE',
];

const DECISION_TOKEN_PREFIX = 'PHASE29F_LIMITED_BETA_CANDIDATE_REDECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_TOKEN_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(`Phase 29F decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`);
} else {
  fail(
    'Phase 29F decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_TOKEN_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 4. Required always-present tokens ────────────────────────────────────────

const REQUIRED_ALWAYS_TOKENS = [
  'PHASE29F_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE29C_29D_29E_EVIDENCE_REVIEW',
  'PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY',
  'PHASE29F_OPEN_GAPS_STATUS: DOCUMENTED_BLOCKED_LANES_AND_LIMITATIONS',
  'PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_ALWAYS_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Always-required token present: ${token.slice(0, 90)}`)
    : fail('Always-required token missing', token);
}

// ── 5. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 29F — Evidence Review and Limited Beta Candidate Re-Decision',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 29C through Phase 29E',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Lane rollup',
  '## Phase 29C evidence review',
  '## Phase 29D beta gate review',
  '## Phase 29E targeted evidence review',
  '## Open evidence gaps',
  '## Limited beta candidate decision options',
  '## Chosen limited beta candidate re-decision',
  '## Decision rationale',
  '## What this decision supports',
  '## What this decision does not support',
  '## Restore rehearsal blocked-lane interpretation',
  '## Adapter-awareness blocked-lane interpretation',
  '## LocalStorage diff limitation',
  '## Stress-adjacent limitation',
  '## Rollback/removal limitation',
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
  '# Phase 29F — Evidence Review and Limited Beta Candidate Re-Decision Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence result',
  '## Chosen re-decision',
  '## Decision rationale',
  '## Open gaps',
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

// ── 7. Required Phase 30A seed headings ──────────────────────────────────────

const REQUIRED_PHASE30A_SEED_HEADINGS = [
  '# Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 29F',
  '## Audit constraints',
  '## Claim surfaces to audit',
  '## Required gates before audit execution',
  '## Forbidden default approvals',
  '## Required allowed wording boundaries',
  '## Required forbidden wording checks',
  '## Evidence packet requirements',
  '## Decision options',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE30A_SEED_HEADINGS) {
  phase30aSeedContent.includes(heading)
    ? pass(`Phase 30A seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 30A seed heading missing', `"${heading}"`);
}

// ── 8. Phase 30A seed token present ──────────────────────────────────────────

phase30aSeedContent.includes(
  'PHASE30A_LIMITED_BETA_CANDIDATE_AUDIT_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 30A seed token present in Phase 30A seed doc')
  : fail('Phase 30A seed token missing from Phase 30A seed doc');

// ── 9. Phase 30A seed framed as separate gate ─────────────────────────────────

phase30aSeedContent.includes(
  'Phase 30A is a separate claim/copy audit gate and is not automatically approved.'
)
  ? pass('Phase 30A framed as separate claim/copy audit gate (not automatically approved)')
  : fail('Phase 30A must be framed as a separate claim/copy audit gate, not automatically approved');

// ── 10. Phase 30A decision options present in seed doc ───────────────────────

const REQUIRED_PHASE30A_DECISION_OPTIONS = [
  'HOLD_LIMITED_BETA_CANDIDATE',
  'NEEDS_COPY_OR_CLAIM_FIXES',
  'PASS_TO_LIMITED_BETA_CANDIDATE_GATE',
];

for (const opt of REQUIRED_PHASE30A_DECISION_OPTIONS) {
  phase30aSeedContent.includes(opt)
    ? pass(`Phase 30A decision option present in seed doc: "${opt}"`)
    : fail('Phase 30A decision option missing from seed doc', `"${opt}"`);
}

// ── 11. Phase 30A claim surfaces present in seed doc ─────────────────────────

const REQUIRED_CLAIM_SURFACES = [
  'landing page visible copy',
  'dashboard copy',
  'library/import copy',
  'backup/export/restore copy if visible',
  'settings copy',
  'release notes/PR notes',
  'user-facing docs',
  'any future limited beta candidate wording',
];

for (const surface of REQUIRED_CLAIM_SURFACES) {
  phase30aSeedContent.toLowerCase().includes(surface.toLowerCase())
    ? pass(`Phase 30A claim surface present in seed doc: "${surface}"`)
    : fail('Phase 30A claim surface missing from seed doc', `"${surface}"`);
}

// ── 12. Evidence review table columns present ─────────────────────────────────

const REQUIRED_EVIDENCE_TABLE_COLUMNS = [
  'Evidence area',
  'Source phase',
  'Evidence reviewed',
  'Status',
  'Limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_EVIDENCE_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Evidence review table column present: "${col}"`)
    : fail('Evidence review table column missing from testing doc', `"${col}"`);
}

// ── 13. Evidence review table rows present ───────────────────────────────────

const REQUIRED_EVIDENCE_TABLE_ROWS = [
  'Phase 29C claim/copy audit partial evidence',
  'Phase 29D partial evidence review',
  'Phase 29E backup health targeted lane',
  'Phase 29E stress-adjacent demo preview lane',
  'Phase 29E rollback/removal navigation lane',
  'Phase 29E restore rehearsal blocked lane',
  'Phase 29E adapter-awareness blocked lane',
  'localStorage before/after diff limitation',
  'no real learner data boundary',
  'no restore execution boundary',
  'no sync/cloud/account/backend boundary',
  'no telemetry/analytics approval',
  'limited beta candidate prep readiness',
  'BETA_READY absence',
];

for (const row of REQUIRED_EVIDENCE_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence review table row present: "${row.slice(0, 70)}"`)
    : fail('Evidence review table row missing from testing doc', `"${row}"`);
}

// ── 14. Lane rollup: 3/5 threshold, two BLOCKED, three PASS_WITH_LIMITATIONS ─

const blockedCount = (testingDocContent.match(/\bBLOCKED\b/g) || []).length;
const passWithLimitationsCount = (testingDocContent.match(/PASS_WITH_LIMITATIONS/g) || []).length;

blockedCount >= 2
  ? pass(`Lane rollup: at least 2 BLOCKED references found in testing doc (found ${blockedCount})`)
  : fail(
      'Lane rollup: testing doc must contain at least 2 BLOCKED lane references',
      `found ${blockedCount}`
    );

passWithLimitationsCount >= 3
  ? pass(
      `Lane rollup: at least 3 PASS_WITH_LIMITATIONS references found in testing doc (found ${passWithLimitationsCount})`
    )
  : fail(
      'Lane rollup: testing doc must contain at least 3 PASS_WITH_LIMITATIONS lane references',
      `found ${passWithLimitationsCount}`
    );

testingDocContent.includes('3/5 threshold')
  ? pass('Lane rollup: 3/5 threshold reference present in testing doc')
  : fail('Lane rollup: testing doc must reference 3/5 threshold');

// ── 15. Decision options include all four required options ────────────────────

const REQUIRED_DECISION_OPTIONS_IN_TESTING_DOC = [
  'HOLD_BETA_GATE',
  'NEEDS_MORE_EVIDENCE',
  'PASS_TO_LIMITED_BETA_CANDIDATE_PREP',
  'PASS_TO_PHASE30A_LIMITED_BETA_CANDIDATE_CLAIM_COPY_BOUNDARY_AUDIT',
];

for (const opt of REQUIRED_DECISION_OPTIONS_IN_TESTING_DOC) {
  testingDocContent.includes(opt)
    ? pass(`Decision option present in testing doc: "${opt}"`)
    : fail('Decision option missing from testing doc', `"${opt}"`);
}

// ── 16. Required guardrail statements present ─────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Next recommended phase: Phase 30A — Limited Beta Candidate Claim/Copy Boundary Audit',
  'Phase 30A is a separate claim/copy audit gate and is not automatically approved.',
  'Phase 29F does not approve LIMITED_BETA_CANDIDATE.',
  'Phase 29F does not approve BETA_READY.',
  'Phase 29F does not approve public production readiness.',
  'Phase 29F does not approve guaranteed data-loss prevention.',
  'Phase 29F does not approve restore execution.',
  'Phase 29F does not approve production restore rehearsal.',
  'Phase 29F does not approve real learner data restore rehearsal.',
  'Phase 29F does not approve runtime backup/export/restore changes.',
  'Phase 29F does not approve backup file format changes.',
  'Phase 29F does not approve restore overwrite behavior changes.',
  'Phase 29F does not approve storage migration.',
  'Phase 29F does not approve sync/cloud/account/auth/backend.',
  'Phase 29F does not approve telemetry/analytics.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 17. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase29f-evidence-review-limited-beta-candidate-redecision')
  ? pass('CI registers Phase 29F validator')
  : fail(
      'CI must register Phase 29F validator',
      'e2e-smoke.yml does not reference validate-phase29f-evidence-review-limited-beta-candidate-redecision'
    );

const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
hasCheckoutFetchDepth
  ? pass('CI checkout uses fetch-depth: 0')
  : fail('CI checkout must use fetch-depth: 0');

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
      'CI does not run Phase 24D through Phase 29E validators as active merge-blocking steps'
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
  `docs/testing/phase29f-evidence-review-limited-beta-candidate-redecision.md`,
  `docs/release/phase29f-evidence-review-limited-beta-candidate-redecision-summary.md`,
  `docs/planning/phase30a-limited-beta-candidate-claim-copy-boundary-audit-seed.md`,
  `scripts/validate-phase29f-evidence-review-limited-beta-candidate-redecision.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 29F changes committed`
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
        ? pass('No prior Phase 29E/29D/29C/29B/29A/28/27/26/25 files in diff')
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
        if (f.includes('phase29f') || f.includes('phase30a')) return false;
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
          !f.includes('phase29f') &&
          !f.includes('phase30a') &&
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
        : fail('src/ files must not be changed in Phase 29F', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 29F', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 21. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 29F');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 29F');

// ── 22. No Phase 29F files newly import prototype modules ─────────────────────

const PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase29fNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase29fNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase29f')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 29F file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 29F file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 23. Forbidden claim strings absent ───────────────────────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'local_first_hybrid_ready',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 29F implementation exists',
  'LIMITED_BETA_CANDIDATE approved',
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
    allDocContent.includes('Phase 29F does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 24. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyMatches = (allDocContent.match(/BETA_READY/g) || []).length;
const betaReadyNegativeContext =
  allDocContent.includes('does not approve BETA_READY') ||
  allDocContent.includes('Phase 29F does not approve BETA_READY') ||
  allDocContent.includes('BETA_READY absence') ||
  allDocContent.includes('not BETA_READY') ||
  allDocContent.includes('NOT_BETA_READY') ||
  allDocContent.includes('NO_BETA_READY');

if (betaReadyMatches === 0) {
  pass('BETA_READY not found in doc content (no positive or negative)');
} else if (betaReadyNegativeContext) {
  pass(`BETA_READY appears only in negative/guardrail context in docs (found ${betaReadyMatches} occurrences)`);
} else {
  fail('BETA_READY must not appear as a positive claim in docs');
}

// ── 25. No telemetry/analytics terms outside guardrail context ────────────────

const TELEMETRY_TERMS = ['telemetry', 'analytics'];
for (const term of TELEMETRY_TERMS) {
  const inDocContent = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocContent) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics') ||
      allDocContent.toLowerCase().includes('no telemetry/analytics') ||
      allDocContent.toLowerCase().includes('no telemetry');
    inGuardrailContext
      ? pass(
          `Telemetry/analytics term "${term}" appears only in negative guardrail context in docs`
        )
      : fail(
          `Telemetry/analytics term "${term}" must only appear in negative guardrail context in docs`
        );
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 26. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
    );

// ── 27. Docs do not positively claim broad or stress-tested readiness ─────────

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

// ── 28. Phase 29F decision scope token verifies not BETA_READY ───────────────

allDocContent.includes('PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY')
  ? pass('Phase 29F decision scope token confirms not BETA_READY and not public production ready')
  : fail(
      'Phase 29F decision scope token missing or incorrect',
      'PHASE29F_DECISION_SCOPE: PASS_TO_AUDIT_ONLY_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY'
    );

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
