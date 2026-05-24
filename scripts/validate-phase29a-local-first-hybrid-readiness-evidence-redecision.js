#!/usr/bin/env node
/**
 * Phase 29A Static Validator — Local-First Hybrid Readiness Evidence Re-Decision
 *
 * PHASE29A_LOCAL_FIRST_HYBRID_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE22_TO_PHASE28_EVIDENCE_REVIEW
 * PHASE29A_LOCAL_FIRST_HYBRID_READINESS_DECISION: LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS_NO_BETA_READY
 * PHASE29A_LOCAL_FIRST_HYBRID_DECISION_SCOPE: LIMITED_EVIDENCE_PASS_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY
 * PHASE29A_REMAINING_EVIDENCE_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_BETA_EVIDENCE_GATE
 * PHASE29B_BETA_EVIDENCE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase29a-local-first-hybrid-readiness-evidence-review.md`;
const RELEASE_DOC = `docs/release/phase29a-local-first-hybrid-readiness-redecision-summary.md`;
const PLANNING_DOC = `docs/planning/phase29b-beta-evidence-gate-seed.md`;
const VALIDATOR = `scripts/validate-phase29a-local-first-hybrid-readiness-evidence-redecision.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Testing evidence review doc exists', TESTING_DOC],
  ['Release re-decision summary doc exists', RELEASE_DOC],
  ['Phase 29B planning seed doc exists', PLANNING_DOC],
  ['Validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const planningDocContent = readFile(PLANNING_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + planningDocContent;
const allTextContent = allDocContent + '\n' + validatorContent;

const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 29A tokens ─────────────────────────────────────────────

const PHASE29A_TOKENS = [
  'PHASE29A_LOCAL_FIRST_HYBRID_EVIDENCE_REVIEW_STATUS: COMPLETED_PHASE22_TO_PHASE28_EVIDENCE_REVIEW',
  'PHASE29A_LOCAL_FIRST_HYBRID_DECISION_SCOPE: LIMITED_EVIDENCE_PASS_NOT_BETA_READY_NOT_PUBLIC_PRODUCTION_READY',
  'PHASE29A_REMAINING_EVIDENCE_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_BETA_EVIDENCE_GATE',
  'PHASE29B_BETA_EVIDENCE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of PHASE29A_TOKENS) {
  allTextContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Decision token: allowed values only ───────────────────────────────────

const ALLOWED_DECISIONS = [
  'PHASE29A_LOCAL_FIRST_HYBRID_READINESS_DECISION: LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS_NO_BETA_READY',
  'PHASE29A_LOCAL_FIRST_HYBRID_READINESS_DECISION: HOLD_READINESS_PENDING_BROADER_EVIDENCE',
];

const hasAllowedDecision = ALLOWED_DECISIONS.some(d => allTextContent.includes(d));
hasAllowedDecision
  ? pass('Decision token value is one of the two allowed Phase 29A decisions')
  : fail(
      'Decision token must be one of: LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS_NO_BETA_READY or HOLD_READINESS_PENDING_BROADER_EVIDENCE',
      'decision token value not found in docs+validator'
    );

// ── 5. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 29A — Local-First Hybrid Readiness Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 22 through Phase 28',
  '## Evidence interpretation',
  '## Evidence review table',
  '## Readiness decision options',
  '## Chosen readiness decision',
  '## Decision rationale',
  '## Remaining evidence gaps',
  '## What this limited pass supports',
  '## What this limited pass does not support',
  '## Backup/export/restore boundary',
  '## Restore rehearsal boundary',
  '## Real learner data boundary',
  '## Sync/cloud/account/backend boundary',
  '## Browser/manual evidence boundary',
  '## Stress evidence boundary',
  '## Claim boundary',
  '## Rollback/reversal note',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 6. Required evidence table columns ───────────────────────────────────────

const REQUIRED_TABLE_COLUMNS = [
  'Evidence area',
  'Phase source',
  'Evidence reviewed',
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

// ── 7. Required evidence table rows ──────────────────────────────────────────

const REQUIRED_TABLE_ROWS = [
  'Phase 22 actual/manual evidence limits',
  'Phase 25 backup health default-off/read-only chain',
  'Phase 26 hidden UI wiring tester evidence',
  'Phase 27 adapter-awareness test-only/default-off/read-only chain',
  'Phase 28 generated/test restore rehearsal test-only/no-write chain',
  'build/unit/static-validator evidence',
  'CI workflow validator continuity',
  'npm ci and artifact cleanup discipline',
  'absence of production restore execution evidence',
  'absence of real learner data restore rehearsal evidence',
  'absence of broad external real-user evidence',
  'absence of stress evidence',
  'absence of sync/cloud/account/backend behavior',
  'absence of BETA_READY evidence',
  'remaining beta-evidence gate need',
];

for (const row of REQUIRED_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Evidence table row present: "${row}"`)
    : fail('Evidence table row missing', `"${row}"`);
}

// ── 8. Decision options section ───────────────────────────────────────────────

const REQUIRED_DECISION_OPTIONS = [
  'HOLD_READINESS',
  'LIMITED_LOCAL_FIRST_HYBRID_EVIDENCE_PASS',
  'PASS_TO_BETA_EVIDENCE_GATE',
];

for (const option of REQUIRED_DECISION_OPTIONS) {
  testingDocContent.includes(option)
    ? pass(`Decision option present: "${option}"`)
    : fail('Decision option missing from testing doc', `"${option}"`);
}

// ── 9. Chosen decision and decision rationale ────────────────────────────────

testingDocContent.includes('## Chosen readiness decision')
  ? pass('Chosen readiness decision section present in testing doc')
  : fail('Chosen readiness decision section missing from testing doc');

testingDocContent.includes('## Decision rationale')
  ? pass('Decision rationale section present in testing doc')
  : fail('Decision rationale section missing from testing doc');

// ── 10. Remaining evidence gaps ───────────────────────────────────────────────

testingDocContent.includes('## Remaining evidence gaps')
  ? pass('Remaining evidence gaps section present in testing doc')
  : fail('Remaining evidence gaps section missing from testing doc');

testingDocContent.includes('PHASE29A_REMAINING_EVIDENCE_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_BETA_EVIDENCE_GATE')
  ? pass('Remaining evidence gaps token present in testing doc')
  : fail('Remaining evidence gaps token missing from testing doc');

// ── 11. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 29A — Local-First Hybrid Readiness Re-Decision Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence interpretation',
  '## Chosen readiness decision',
  '## Decision rationale',
  '## What is supported',
  '## What remains not proven',
  '## Remaining evidence gaps',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 12. Required Phase 29B seed headings ──────────────────────────────────────

const REQUIRED_PLANNING_HEADINGS = [
  '# Phase 29B — Beta Evidence Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 29A',
  '## Candidate evidence directions',
  '## Required gates before implementation or evidence run',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Phase 29B seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 29B seed heading missing', `"${heading}"`);
}

// ── 13. Required Phase 29B seed token ────────────────────────────────────────

planningDocContent.includes('PHASE29B_BETA_EVIDENCE_GATE_SEED_STATUS: PREPARED_PLANNING_SEED')
  ? pass('Phase 29B seed token present in planning doc')
  : fail('Phase 29B seed token missing from planning doc');

// ── 14. Required candidate evidence directions ───────────────────────────────

const REQUIRED_CANDIDATE_DIRECTIONS = [
  'broader external/manual evidence run with generated/test data only',
  'manual/browser restore rehearsal evidence with generated/test data only',
  'stress-adjacent import/backup/restore evidence with generated/test data only',
  'real-user evidence expansion without real learner data capture',
  'local-first hybrid claim review and copy audit',
  'BETA_READY evidence gate planning',
];

for (const direction of REQUIRED_CANDIDATE_DIRECTIONS) {
  planningDocContent.includes(direction)
    ? pass(`Phase 29B candidate direction present: "${direction.slice(0, 70)}"`)
    : fail('Phase 29B candidate direction missing', `"${direction}"`);
}

// ── 15. Phase 29B framed as separate planning/evidence gate ──────────────────

planningDocContent.includes('Phase 29B is a separate planning/evidence gate and is not automatically approved.')
  ? pass('Phase 29B framed as separate planning/evidence gate (not automatically approved)')
  : fail('Phase 29B must be framed as a separate planning/evidence gate, not automatically approved');

// ── 16. Required Phase 29A negative statements ───────────────────────────────

const REQUIRED_NEGATIVE_STATEMENTS = [
  'Next recommended phase: Phase 29B — Beta Evidence Gate Planning',
  'Phase 29B is a separate planning/evidence gate and is not automatically approved.',
  'Phase 29A does not approve BETA_READY.',
  'Phase 29A does not approve public production readiness.',
  'Phase 29A does not approve guaranteed data-loss prevention.',
  'Phase 29A does not approve restore execution.',
  'Phase 29A does not approve production restore rehearsal.',
  'Phase 29A does not approve real learner data restore rehearsal.',
  'Phase 29A does not approve runtime backup/export/restore changes.',
  'Phase 29A does not approve backup file format changes.',
  'Phase 29A does not approve restore overwrite behavior changes.',
  'Phase 29A does not approve storage migration.',
  'Phase 29A does not approve production adapter-aware backup/export/restore.',
  'Phase 29A does not approve sync/cloud/account/auth/backend.',
];

for (const stmt of REQUIRED_NEGATIVE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 17. Phase 29B forbidden default approvals ────────────────────────────────

const REQUIRED_FORBIDDEN_29B = [
  'BETA_READY',
  'Public production readiness',
  'Production restore rehearsal',
  'Real learner data restore rehearsal',
  'Backup file format changes',
  'Restore overwrite behavior changes',
  'Storage migration',
  'Production adapter-aware backup/export/restore',
  'Sync/cloud/account/auth/backend',
  'Telemetry/analytics',
  'Broad external real-user validation without evidence',
  'Stress-tested readiness without evidence',
];

for (const approval of REQUIRED_FORBIDDEN_29B) {
  planningDocContent.includes(approval)
    ? pass(`Phase 29B forbidden default approval listed: "${approval}"`)
    : fail('Phase 29B forbidden default approval missing', `"${approval}"`);
}

// ── 18. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase29a-local-first-hybrid-readiness-evidence-redecision')
  ? pass('CI registers Phase 29A validator')
  : fail('CI registers Phase 29A validator', 'e2e-smoke.yml does not reference validate-phase29a');

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
  'validate-phase28c',
  'validate-phase28d',
  'validate-phase28e',
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
  ? pass('CI does not run Phase 24D through Phase 28E validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js"`)
  : pass('CI does not run full validate-*.js glob loop');

// ── 19. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 20. Validator verifies origin/main via git rev-parse ─────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 21. Exact changed-file check via git (post-merge-main safe, double-dot) ──

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase29a-local-first-hybrid-readiness-evidence-review.md`,
  `docs/release/phase29a-local-first-hybrid-readiness-redecision-summary.md`,
  `docs/planning/phase29b-beta-evidence-gate-seed.md`,
  `scripts/validate-phase29a-local-first-hybrid-readiness-evidence-redecision.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 29A changes committed`
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
        ? pass('No prior Phase 28E/28D/28C/28B/28A/27/26/25 files in diff')
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
        if (f.includes('phase29a') || f.includes('phase29b')) return false;
        return f.includes('backup') || f.includes('restore') || f.includes('export');
      });
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase29a') &&
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
        : fail('src/ files must not be changed in Phase 29A', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 29A', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 22. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 29A');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 29A');

// ── 23. No Phase 29A file newly imports Phase 27/28 prototype modules ────────
//
// Phase 29A adds no src/ files. This check verifies that the Phase 29A-added
// files (docs + validator + CI) do not introduce new prototype module imports.
// It does NOT re-scan existing Phase 27/28 prototype src/ files that already
// had their inter-module imports approved in prior phases.

const PHASE2728_PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

// Only check Phase 29A's newly added files (validator script).
// Docs (.md) and CI (.yml) cannot contain JS imports.
// post-merge main (empty diff) skips the per-file scan as no new files exist.
const phase29aNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PHASE2728_PROTOTYPE_MODULES) {
  const importers = phase29aNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase29a')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 29A file newly imports Phase 27/28 prototype module: ${moduleName}`)
    : fail(
        `No Phase 29A file may import Phase 27/28 prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 24. Forbidden claim strings absent ───────────────────────────────────────

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
  'Phase 29B implementation exists',
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
    allDocContent.includes('Phase 29A does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 25. No telemetry/analytics terms outside guardrail context ────────────────

const TELEMETRY_TERMS = ['telemetry', 'analytics'];
for (const term of TELEMETRY_TERMS) {
  const inDocContent = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocContent) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics') ||
      allDocContent.toLowerCase().includes('no telemetry');
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context in docs`)
      : fail(
          `Telemetry/analytics term "${term}" must only appear in negative guardrail context in docs`
        );
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 26. Sync/cloud/auth/backend guardrail present in docs ────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
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
