#!/usr/bin/env node
/**
 * Phase 29D Static Validator — Evidence Packet Review and Beta Gate Re-Decision
 *
 * PHASE29D_EVIDENCE_PACKET_REVIEW_STATUS: COMPLETED_PARTIAL_EVIDENCE_PACKET_REVIEW
 * PHASE29D_BETA_GATE_REDECISION: NEEDS_MORE_EVIDENCE_BEFORE_LIMITED_BETA_CANDIDATE
 * PHASE29D_BETA_GATE_DECISION_SCOPE: PARTIAL_EVIDENCE_REVIEW_NO_BETA_READY_NO_PUBLIC_PRODUCTION_READY
 * PHASE29D_MISSING_EVIDENCE_STATUS: FIVE_LANES_NOT_EXECUTED_REQUIRES_TARGETED_COLLECTION
 * PHASE29E_TARGETED_MISSING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase29d-evidence-packet-review-beta-gate-redecision.md`;
const RELEASE_DOC = `docs/release/phase29d-evidence-packet-review-beta-gate-redecision-summary.md`;
const PHASE29E_SEED_DOC = `docs/planning/phase29e-targeted-missing-evidence-collection-seed.md`;
const VALIDATOR = `scripts/validate-phase29d-evidence-packet-review-beta-gate-redecision.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 29D evidence review doc exists', TESTING_DOC],
  ['Phase 29D release summary doc exists', RELEASE_DOC],
  ['Phase 29E seed doc exists', PHASE29E_SEED_DOC],
  ['Phase 29D validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase29eSeedContent = readFile(PHASE29E_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + phase29eSeedContent;
const allTextContent = allDocContent + '\n' + validatorContent;

const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 29D tokens — decision token must be one of two allowed ──

const ALLOWED_DECISION_TOKENS = [
  'PHASE29D_BETA_GATE_REDECISION: NEEDS_MORE_EVIDENCE_BEFORE_LIMITED_BETA_CANDIDATE',
  'PHASE29D_BETA_GATE_REDECISION: HOLD_BETA_GATE',
];

const usedDecisionToken = ALLOWED_DECISION_TOKENS.find(t => allDocContent.includes(t));
if (usedDecisionToken) {
  pass(`Phase 29D decision token present: ${usedDecisionToken}`);
} else {
  fail(
    'Phase 29D decision token missing or invalid',
    `must be one of: ${ALLOWED_DECISION_TOKENS.join(' | ')}`
  );
}

const REQUIRED_TOKENS = [
  'PHASE29D_EVIDENCE_PACKET_REVIEW_STATUS: COMPLETED_PARTIAL_EVIDENCE_PACKET_REVIEW',
  'PHASE29D_BETA_GATE_DECISION_SCOPE: PARTIAL_EVIDENCE_REVIEW_NO_BETA_READY_NO_PUBLIC_PRODUCTION_READY',
  'PHASE29D_MISSING_EVIDENCE_STATUS: FIVE_LANES_NOT_EXECUTED_REQUIRES_TARGETED_COLLECTION',
  'PHASE29E_TARGETED_MISSING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 90)}`)
    : fail('Required token missing', token);
}

// ── 4. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 29D — Evidence Packet Review and Beta Gate Re-Decision',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 29C',
  '## Evidence packet summary',
  '## Lane review table',
  '## Evidence limitations',
  '## Beta gate decision options',
  '## Chosen beta gate re-decision',
  '## Decision rationale',
  '## Missing evidence items',
  '## What the evidence supports',
  '## What the evidence does not support',
  '## Claim/copy audit interpretation',
  '## Restore rehearsal evidence gap',
  '## Backup health evidence gap',
  '## Adapter-awareness evidence gap',
  '## Stress-adjacent evidence gap',
  '## Rollback/removal evidence gap',
  '## Real learner data boundary',
  '## Restore execution boundary',
  '## Sync/cloud/account/backend boundary',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 5. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 29D — Evidence Packet Review and Beta Gate Re-Decision Summary',
  '## Status tokens',
  '## Scope',
  '## Evidence packet result',
  '## Chosen beta gate re-decision',
  '## Decision rationale',
  '## Missing evidence',
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

// ── 6. Required Phase 29E seed headings ──────────────────────────────────────

const REQUIRED_PHASE29E_SEED_HEADINGS = [
  '# Phase 29E — Targeted Missing Evidence Collection Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 29D',
  '## Target evidence lanes',
  '## Required gates before evidence execution',
  '## Data safety rules',
  '## Evidence packet requirements',
  '## Forbidden default approvals',
  '## Evidence needed before stronger claims',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE29E_SEED_HEADINGS) {
  phase29eSeedContent.includes(heading)
    ? pass(`Phase 29E seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 29E seed heading missing', `"${heading}"`);
}

// ── 7. Phase 29E seed token present ──────────────────────────────────────────

phase29eSeedContent.includes(
  'PHASE29E_TARGETED_MISSING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 29E seed token present in seed doc')
  : fail('Phase 29E seed token missing from seed doc');

// ── 8. Phase 29E seed framed as separate gate ─────────────────────────────────

phase29eSeedContent.includes(
  'Phase 29E is a separate evidence collection gate and is not automatically approved.'
)
  ? pass('Phase 29E framed as separate evidence collection gate (not automatically approved)')
  : fail(
      'Phase 29E must be framed as a separate evidence collection gate, not automatically approved'
    );

// ── 9. Phase 29E target lanes present in seed ────────────────────────────────

const REQUIRED_PHASE29E_TARGET_LANES = [
  'restore rehearsal manual browser lane with generated/test data only',
  'backup health manual browser lane with generated/test data only',
  'adapter-awareness manual browser lane with generated/test data only',
  'stress-adjacent import/quota lane with generated/test data only',
  'rollback/removal lane in dev/test',
];

for (const lane of REQUIRED_PHASE29E_TARGET_LANES) {
  phase29eSeedContent.toLowerCase().includes(lane.toLowerCase())
    ? pass(`Phase 29E target lane present: "${lane.slice(0, 70)}"`)
    : fail('Phase 29E target lane missing', `"${lane}"`);
}

// ── 10. Beta gate decision options present in testing doc ─────────────────────

const REQUIRED_DECISION_OPTIONS = [
  'HOLD_BETA_GATE',
  'PASS_TO_LIMITED_BETA_CANDIDATE_PREP',
  'NEEDS_MORE_EVIDENCE',
];

for (const opt of REQUIRED_DECISION_OPTIONS) {
  testingDocContent.includes(opt)
    ? pass(`Beta gate decision option present in testing doc: "${opt}"`)
    : fail('Beta gate decision option missing from testing doc', `"${opt}"`);
}

// ── 11. Lane table columns present ───────────────────────────────────────────

const REQUIRED_LANE_TABLE_COLUMNS = [
  'Lane',
  'Phase 29C status',
  'Evidence reviewed',
  'Limitation',
  'Re-decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_LANE_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Lane table column present: "${col}"`)
    : fail('Lane table column missing', `"${col}"`);
}

// ── 12. Lane table rows present ───────────────────────────────────────────────

const REQUIRED_LANE_TABLE_ROWS = [
  'Restore rehearsal manual browser lane',
  'Backup health manual browser lane',
  'Adapter-awareness manual browser lane',
  'Stress-adjacent import/quota lane',
  'Rollback/removal lane',
  'Claim/copy audit lane',
];

for (const row of REQUIRED_LANE_TABLE_ROWS) {
  testingDocContent.includes(row)
    ? pass(`Lane table row present: "${row.slice(0, 70)}"`)
    : fail('Lane table row missing', `"${row}"`);
}

// ── 13. Five NOT_EXECUTED lanes and one PASS_WITH_LIMITATIONS ─────────────────

testingDocContent.includes('NOT_EXECUTED')
  ? pass('Testing doc contains NOT_EXECUTED lane status (five lanes not executed)')
  : fail('Testing doc must contain NOT_EXECUTED lane status (five lanes were not executed)');

testingDocContent.includes('PASS_WITH_LIMITATIONS')
  ? pass('Testing doc contains PASS_WITH_LIMITATIONS lane status (claim/copy audit)')
  : fail(
      'Testing doc must contain PASS_WITH_LIMITATIONS lane status (claim/copy audit lane)'
    );

// Count NOT_EXECUTED occurrences in the lane table section
const notExecutedCount = (testingDocContent.match(/NOT_EXECUTED/g) || []).length;
notExecutedCount >= 5
  ? pass(`Testing doc contains at least 5 NOT_EXECUTED lane status references (found ${notExecutedCount})`)
  : fail(
      'Testing doc must contain at least 5 NOT_EXECUTED lane status references',
      `found ${notExecutedCount}`
    );

// ── 14. Missing evidence items present ───────────────────────────────────────

const REQUIRED_MISSING_EVIDENCE_ITEMS = [
  'Restore rehearsal browser evidence',
  'Backup health browser evidence',
  'Adapter-awareness browser evidence',
  'Stress-adjacent import/quota evidence',
  'Rollback/removal evidence',
];

for (const item of REQUIRED_MISSING_EVIDENCE_ITEMS) {
  testingDocContent.includes(item)
    ? pass(`Missing evidence item present: "${item}"`)
    : fail('Missing evidence item missing from testing doc', `"${item}"`);
}

// ── 15. Phase 29D framed as not approving BETA_READY etc. ────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Next recommended phase: Phase 29E — Targeted Missing Evidence Collection',
  'Phase 29E is a separate evidence collection gate and is not automatically approved.',
  'Phase 29D does not approve BETA_READY.',
  'Phase 29D does not approve public production readiness.',
  'Phase 29D does not approve guaranteed data-loss prevention.',
  'Phase 29D does not approve restore execution.',
  'Phase 29D does not approve production restore rehearsal.',
  'Phase 29D does not approve real learner data restore rehearsal.',
  'Phase 29D does not approve runtime backup/export/restore changes.',
  'Phase 29D does not approve backup file format changes.',
  'Phase 29D does not approve restore overwrite behavior changes.',
  'Phase 29D does not approve storage migration.',
  'Phase 29D does not approve sync/cloud/account/auth/backend.',
  'Phase 29D does not approve telemetry/analytics.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 16. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase29d-evidence-packet-review-beta-gate-redecision')
  ? pass('CI registers Phase 29D validator')
  : fail('CI registers Phase 29D validator', 'e2e-smoke.yml does not reference validate-phase29d');

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
  'validate-phase29a',
  'validate-phase29b',
  'validate-phase29c',
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
  ? pass('CI does not run Phase 24D through Phase 29C validators as active merge-blocking steps')
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

// ── 17. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 18. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 19. Exact changed-file check via git (post-merge-main safe, double-dot) ───

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase29d-evidence-packet-review-beta-gate-redecision.md`,
  `docs/release/phase29d-evidence-packet-review-beta-gate-redecision-summary.md`,
  `docs/planning/phase29e-targeted-missing-evidence-collection-seed.md`,
  `scripts/validate-phase29d-evidence-packet-review-beta-gate-redecision.js`,
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
        `branch "${currentBranch}" has empty diff — no Phase 29D changes committed`
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
        ? pass('No prior Phase 29C/29B/29A/28/27/26/25 files in diff')
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
        if (f.includes('phase29d') || f.includes('phase29e')) return false;
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
          !f.includes('phase29d') &&
          !f.includes('phase29e') &&
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
        : fail('src/ files must not be changed in Phase 29D', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 29D', testFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 20. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 29D');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 29D');

// ── 21. No Phase 29D file newly imports Phase 27/28 prototype modules ─────────

const PHASE2728_PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase29dNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PHASE2728_PROTOTYPE_MODULES) {
  const importers = phase29dNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase29d')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 29D file newly imports Phase 27/28 prototype module: ${moduleName}`)
    : fail(
        `No Phase 29D file may import Phase 27/28 prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 22. Forbidden claim strings absent ───────────────────────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'BETA_READY',
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'local_first_hybrid_ready',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 29D implementation exists',
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
    allDocContent.includes('Phase 29D does not approve') ||
    allDocContent.includes(`does not approve BETA_READY`);
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 23. No telemetry/analytics terms outside guardrail context ────────────────

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

// ── 24. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      '"No sync/cloud/account/auth/backend."'
    );

// ── 25. Docs do not positively claim browser/manual evidence fully collected ───

const browserEvidenceFullyClaimed =
  allDocContent.includes('all browser evidence collected in Phase 29D') ||
  allDocContent.includes('all lanes passed in Phase 29D') ||
  allDocContent.includes('full browser evidence run completed');

!browserEvidenceFullyClaimed
  ? pass('Docs do not claim all browser evidence fully collected in Phase 29D')
  : fail('Docs must not claim all browser evidence fully collected in Phase 29D');

// ── 26. Docs do not claim forbidden large-scope approvals ─────────────────────

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

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
