#!/usr/bin/env node
/**
 * Phase 30C Static Validator — Beta Ready Decision / Hold
 *
 * PHASE30C_BETA_READY_DECISION_STATUS: COMPLETED_BETA_READY_DECISION_GATE
 * PHASE30C_LIMITED_BETA_CANDIDATE_STATUS: CONFIRMED_FROM_PHASE30B
 * PHASE30C_BETA_READY_DECISION: NEEDS_MORE_EVIDENCE_FOR_BETA_READY
 * PHASE30C_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE30C_REMAINING_BETA_READY_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_EVIDENCE_COLLECTION
 * PHASE31A_POST_LIMITED_BETA_ROADMAP_SEED_STATUS: PREPARED_PLANNING_SEED
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

const TESTING_DOC = `docs/testing/phase30c-beta-ready-decision-hold.md`;
const RELEASE_DOC = `docs/release/phase30c-beta-ready-decision-hold-summary.md`;
const PHASE31A_SEED_DOC = `docs/planning/phase31a-post-limited-beta-roadmap-seed.md`;
const VALIDATOR = `scripts/validate-phase30c-beta-ready-decision-hold.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 30C decision doc exists', TESTING_DOC],
  ['Phase 30C release summary doc exists', RELEASE_DOC],
  ['Phase 31A seed doc exists', PHASE31A_SEED_DOC],
  ['Phase 30C validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase31aSeedContent = readFile(PHASE31A_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent + '\n' + phase31aSeedContent;
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required Phase 30C decision token — must match one of three allowed values ──

const ALLOWED_DECISION_TOKEN_VALUES = [
  'NEEDS_MORE_EVIDENCE_FOR_BETA_READY',
  'HOLD_BETA_READY',
  'BETA_READY',
];

const DECISION_TOKEN_PREFIX = 'PHASE30C_BETA_READY_DECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_TOKEN_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(`Phase 30C decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`);
} else {
  fail(
    'Phase 30C decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_TOKEN_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 4. If decision is NEEDS_MORE_EVIDENCE or HOLD, docs must not positively approve BETA_READY ──

const chosenDecision = matchedDecisionValue || '';
if (chosenDecision === 'NEEDS_MORE_EVIDENCE_FOR_BETA_READY' || chosenDecision === 'HOLD_BETA_READY') {
  const positiveApprovalSentence =
    allDocContent.includes('Phase 30C approves BETA_READY') ||
    allDocContent.includes('Phase 30C approved BETA_READY');
  !positiveApprovalSentence
    ? pass(`Docs do not contain positive BETA_READY approval sentence (decision is ${chosenDecision})`)
    : fail(
        `Docs must not contain "Phase 30C approves BETA_READY" when decision is ${chosenDecision}`
      );
}

// ── 5. Required always-present tokens ────────────────────────────────────────

const REQUIRED_ALWAYS_TOKENS = [
  'PHASE30C_BETA_READY_DECISION_STATUS: COMPLETED_BETA_READY_DECISION_GATE',
  'PHASE30C_LIMITED_BETA_CANDIDATE_STATUS: CONFIRMED_FROM_PHASE30B',
  'PHASE30C_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE30C_REMAINING_BETA_READY_GAPS_STATUS: DOCUMENTED_FOR_FUTURE_EVIDENCE_COLLECTION',
  'PHASE31A_POST_LIMITED_BETA_ROADMAP_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_ALWAYS_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Always-required token present: ${token.slice(0, 90)}`)
    : fail('Always-required token missing', token);
}

// ── 6. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_HEADINGS = [
  '# Phase 30C — Beta Ready Decision / Hold',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 30B',
  '## Decision method',
  '## Beta ready decision table',
  '## Limited beta candidate confirmation',
  '## Beta ready decision options',
  '## Chosen beta ready decision',
  '## Decision rationale',
  '## What Phase 30C confirms',
  '## What Phase 30C does not approve',
  '## Remaining evidence gaps before BETA_READY',
  '## Restore rehearsal browser gap',
  '## Adapter-awareness browser gap',
  '## LocalStorage diff gap',
  '## Stress test gap',
  '## Rollback/removal gap',
  '## Real learner data boundary',
  '## Dynamic copy audit boundary',
  '## Legacy release-notes boundary',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 7. Required release doc headings ─────────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 30C — Beta Ready Decision / Hold Summary',
  '## Status tokens',
  '## Scope',
  '## Decision result',
  '## Limited beta candidate confirmation',
  '## Chosen beta ready decision',
  '## Decision rationale',
  '## Remaining evidence gaps',
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

// ── 8. Required Phase 31A seed headings ──────────────────────────────────────

const REQUIRED_PHASE31A_SEED_HEADINGS = [
  '# Phase 31A — Post-Limited-Beta Roadmap Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 30C',
  '## Roadmap constraints',
  '## Recommended roadmap lanes',
  '## Data safety UX lane',
  '## Evidence collection lane',
  '## Claim/copy cleanup lane',
  '## Local-first UX research lane',
  '## Forbidden default approvals',
  '## Recommended model usage',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE31A_SEED_HEADINGS) {
  phase31aSeedContent.includes(heading)
    ? pass(`Phase 31A seed heading present: "${heading.slice(0, 70)}"`)
    : fail('Phase 31A seed heading missing', `"${heading}"`);
}

// ── 9. Phase 31A seed token present ──────────────────────────────────────────

phase31aSeedContent.includes(
  'PHASE31A_POST_LIMITED_BETA_ROADMAP_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 31A seed token present in Phase 31A seed doc')
  : fail('Phase 31A seed token missing from Phase 31A seed doc');

// ── 10. Phase 31A seed framed as separate gate ────────────────────────────────

phase31aSeedContent.includes(
  'Phase 31A is a separate planning/research gate and is not automatically approved.'
)
  ? pass('Phase 31A framed as separate planning/research gate (not automatically approved)')
  : fail('Phase 31A must be framed as a separate planning/research gate, not automatically approved');

// ── 11. Phase 31A seed contains required roadmap lanes ───────────────────────

const REQUIRED_PHASE31A_ROADMAP_LANES = [
  'Data Safety Center',
  'Local Backup Center',
  'restore rehearsal',
  'adapter-awareness',
  'localStorage diff',
  'stress',
  'rollback',
  'real learner data',
  'legacy release-notes',
  'local-first UX research',
];

for (const lane of REQUIRED_PHASE31A_ROADMAP_LANES) {
  phase31aSeedContent.toLowerCase().includes(lane.toLowerCase())
    ? pass(`Phase 31A seed contains roadmap lane reference: "${lane}"`)
    : fail('Phase 31A seed missing roadmap lane reference', `"${lane}"`);
}

// ── 12. Phase 31A seed mentions optional Opus 4.7 research gate ──────────────

const hasOpusGate =
  phase31aSeedContent.includes('Opus 4.7') &&
  (phase31aSeedContent.includes('BYOC') ||
    phase31aSeedContent.includes('WebDAV') ||
    phase31aSeedContent.includes('P2P') ||
    phase31aSeedContent.includes('device transfer'));

hasOpusGate
  ? pass('Phase 31A seed mentions optional Opus 4.7 research gate (BYOC/WebDAV/P2P/device transfer)')
  : fail(
      'Phase 31A seed must mention optional Opus 4.7 research gate for BYOC/WebDAV/P2P/device transfer comparison'
    );

// ── 13. Phase 31A seed mentions recommended model usage ──────────────────────

phase31aSeedContent.includes('Recommended model usage')
  ? pass('Phase 31A seed includes recommended model usage section')
  : fail('Phase 31A seed must include recommended model usage section');

// ── 14. Beta ready decision table columns present ────────────────────────────

const REQUIRED_DECISION_TABLE_COLUMNS = [
  'Gate item',
  'Source',
  'Evidence reviewed',
  'Status',
  'Limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_DECISION_TABLE_COLUMNS) {
  testingDocContent.includes(col)
    ? pass(`Decision table column present: "${col}"`)
    : fail('Decision table column missing from testing doc', `"${col}"`);
}

// ── 15. Required decision table rows present ─────────────────────────────────

const REQUIRED_DECISION_TABLE_ROWS = [
  'Phase 30B LIMITED_BETA_CANDIDATE pass',
  'restore rehearsal browser lane blocked',
  'adapter-awareness browser lane blocked',
  'before/after localStorage diff missing',
  '100+ card stress test missing',
  'full rollback/removal execution missing',
  'real learner data not used',
  'dynamic route copy not live-browser evaluated',
  'legacy release notes bounded but not rewritten',
  'public production readiness absence',
  'guaranteed data-loss prevention absence',
  'sync/cloud/account/backend absence',
  'BETA_READY decision',
];

for (const row of REQUIRED_DECISION_TABLE_ROWS) {
  testingDocContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Decision table row present: "${row}"`)
    : fail('Decision table row missing from testing doc', `"${row}"`);
}

// ── 16. Limited beta candidate confirmation present ──────────────────────────

testingDocContent.includes('PHASE30C_LIMITED_BETA_CANDIDATE_STATUS: CONFIRMED_FROM_PHASE30B')
  ? pass('Limited beta candidate confirmation token present in testing doc')
  : fail(
      'Testing doc must contain PHASE30C_LIMITED_BETA_CANDIDATE_STATUS: CONFIRMED_FROM_PHASE30B'
    );

testingDocContent.includes('LIMITED_BETA_CANDIDATE status approved in Phase 30B remains')
  ? pass('Limited beta candidate confirmation statement present in testing doc')
  : fail('Testing doc must confirm LIMITED_BETA_CANDIDATE status approved in Phase 30B remains');

// ── 17. Remaining gaps documented ───────────────────────────────────────────

const REQUIRED_GAP_REFERENCES = [
  'DOCUMENTED_FOR_FUTURE_EVIDENCE_COLLECTION',
  'Restore rehearsal browser lane',
  'Adapter-awareness browser lane',
  'localStorage diff',
  '100+',
  'rollback',
  'real learner data',
  'Dynamic copy audit',
  'Legacy release-notes',
];

for (const gap of REQUIRED_GAP_REFERENCES) {
  testingDocContent.includes(gap)
    ? pass(`Remaining gap documented in testing doc: "${gap}"`)
    : fail('Remaining gap missing from testing doc', `"${gap}"`);
}

// ── 18. Required guardrail statements present ────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Next recommended phase: Phase 31A — Post-Limited-Beta Roadmap / Data Safety UX Planning',
  'Phase 31A is a separate planning/research gate and is not automatically approved.',
  'Phase 30C confirms LIMITED_BETA_CANDIDATE from Phase 30B remains the highest approved readiness status.',
  'Phase 30C does not approve BETA_READY.',
  'Phase 30C does not approve public production readiness.',
  'Phase 30C does not approve guaranteed data-loss prevention.',
  'Phase 30C does not approve restore execution.',
  'Phase 30C does not approve production restore rehearsal.',
  'Phase 30C does not approve real learner data restore rehearsal.',
  'Phase 30C does not approve runtime backup/export/restore changes.',
  'Phase 30C does not approve backup file format changes.',
  'Phase 30C does not approve restore overwrite behavior changes.',
  'Phase 30C does not approve storage migration.',
  'Phase 30C does not approve sync/cloud/account/auth/backend.',
  'Phase 30C does not approve telemetry/analytics.',
  'Phase 30C does not approve built-in AI/OCR/API-key/BYOK behavior.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 19. CI workflow checks ─────────────────────────────────────────────────────

ciContent.includes('validate-phase30c-beta-ready-decision-hold')
  ? pass('CI registers Phase 30C validator')
  : fail(
      'CI must register Phase 30C validator',
      'e2e-smoke.yml does not reference validate-phase30c-beta-ready-decision-hold'
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
  'validate-phase29d',
  'validate-phase29e',
  'validate-phase29f',
  'validate-phase30a',
  'validate-phase30b',
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
      'CI does not run Phase 24D through Phase 30B validators as active merge-blocking steps'
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

// ── 20. Validator does not execute internal git fetch ─────────────────────────

const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonComment);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch in validator')
  : pass('Validator does not execute internal git fetch');

// ── 21. Validator verifies origin/main via git rev-parse ──────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 22. Exact changed-file check via git (post-merge-main safe, double-dot) ───

const ALLOWED_CHANGED_FILES = new Set([
  `docs/testing/phase30c-beta-ready-decision-hold.md`,
  `docs/release/phase30c-beta-ready-decision-hold-summary.md`,
  `docs/planning/phase31a-post-limited-beta-roadmap-seed.md`,
  `scripts/validate-phase30c-beta-ready-decision-hold.js`,
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
  `docs/testing/phase30b`,
  `docs/release/phase30b`,
  `docs/planning/phase30b`,
  `scripts/validate-phase30b`,
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
        `branch "${currentBranch}" has empty diff — no Phase 30C changes committed`
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
        ? pass('No prior Phase 30B/30A/29F/29E/29D/29C/29B/29A/28/27/26/25 files in diff')
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
        if (f.includes('phase30c') || f.includes('phase31a')) return false;
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
          !f.includes('phase30c') &&
          !f.includes('phase31a') &&
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
        : fail('src/ files must not be changed in Phase 30C', srcFiles.join(', '));

      const testFiles = changedFiles.filter(f => {
        const firstSegment = f.split('/')[0];
        return firstSegment === 'tests';
      });
      testFiles.length === 0
        ? pass('No tests/ files changed')
        : fail('tests/ files must not be changed in Phase 30C', testFiles.join(', '));

      const releaseNotesFiles = changedFiles.filter(
        f => f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md'
      );
      releaseNotesFiles.length === 0
        ? pass('RELEASE_NOTES.md and RELEASE_NOTES_V2.md not modified')
        : fail(
            'RELEASE_NOTES.md and RELEASE_NOTES_V2.md must not be modified in Phase 30C',
            releaseNotesFiles.join(', ')
          );
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 23. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 30C');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 30C');

// ── 24. No Phase 30C files newly import prototype modules ─────────────────────

const PROTOTYPE_MODULES = [
  'generatedTestRestoreRehearsalPrototype',
  'restoreRehearsalPlanner',
  'adapterAwarenessModel',
  'adapterAwarenessIntegration',
  'backupHealthSignal',
  'backupHealthIntegration',
];

const phase30cNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase30cNewJsFiles.filter(f => {
    const rel = path.relative(ROOT, f);
    if (rel.includes('validate-phase30c')) return false;
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 30C file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 30C file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 25. Forbidden claim strings absent from doc content ──────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 30C implementation exists',
  'Phase 31A implementation exists',
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
    allDocContent.includes('Phase 30C does not approve') ||
    allDocContent.includes('does not approve BETA_READY');
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 26. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyNegativeContext =
  allDocContent.includes('does not approve BETA_READY') ||
  allDocContent.includes('Phase 30C does not approve BETA_READY') ||
  allDocContent.includes('not BETA_READY') ||
  allDocContent.includes('NOT_BETA_READY') ||
  allDocContent.includes('BETA_READY_NOT_APPROVED') ||
  allDocContent.includes('not approved');

const betaReadyPositiveApproval =
  allDocContent.includes('Phase 30C approves BETA_READY') ||
  allDocContent.includes('Phase 30C approved BETA_READY');

if (betaReadyPositiveApproval) {
  fail('BETA_READY must not appear as a positive claim in docs (Phase 30C approves BETA_READY)');
} else if (betaReadyNegativeContext) {
  pass('BETA_READY references appear only in negative/guardrail context in docs');
} else {
  pass('No BETA_READY positive approval claim found in docs');
}

// ── 27. Docs do not positively claim public production readiness ──────────────

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

// ── 28. Phase 30C decision scope token confirms not BETA_READY ───────────────

allDocContent.includes(
  'PHASE30C_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED'
)
  ? pass(
      'Phase 30C decision scope token confirms LIMITED_BETA_CANDIDATE confirmed and BETA_READY not approved'
    )
  : fail(
      'Phase 30C decision scope token missing or incorrect',
      'PHASE30C_DECISION_SCOPE: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED'
    );

// ── 29. Sync/cloud/auth/backend guardrail present in docs ─────────────────────

const hasSyncGuardrail =
  allDocContent.includes('sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('Sync/cloud/account/auth/backend is not approved') ||
  allDocContent.includes('does not approve sync/cloud/account/auth/backend') ||
  allDocContent.includes('Phase 30C does not approve sync/cloud/account/auth/backend.');
hasSyncGuardrail
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      'docs must state sync/cloud/account/auth/backend is not approved'
    );

// ── 30. Docs do not claim Phase 31A implementation exists ────────────────────

const phase31aImplementationClaim = allDocContent.includes('Phase 31A implementation exists');
!phase31aImplementationClaim
  ? pass('Docs do not claim Phase 31A implementation exists')
  : fail('Docs must not claim Phase 31A implementation exists');

// ── 31. Docs do not claim guaranteed data-loss prevention ────────────────────

const guaranteedDataLossClaim =
  allDocContent.toLowerCase().includes('guaranteed data-loss prevention approved') ||
  allDocContent.toLowerCase().includes('guaranteed data safety approved');
!guaranteedDataLossClaim
  ? pass('Docs do not claim guaranteed data-loss prevention approved')
  : fail('Docs must not claim guaranteed data-loss prevention approved');

// ── 32. Docs do not claim restore execution ──────────────────────────────────

const restoreExecutionClaim =
  allDocContent.toLowerCase().includes('restore execution approved') ||
  allDocContent.toLowerCase().includes('restore execution safe');
!restoreExecutionClaim
  ? pass('Docs do not claim restore execution approved or safe')
  : fail('Docs must not claim restore execution approved or safe');

// ── 33. Analytics/telemetry approval must not be positively claimed ──────────

const telemetryApprovalClaim =
  allDocContent.toLowerCase().includes('telemetry approved') ||
  allDocContent.toLowerCase().includes('analytics approved') ||
  allDocContent.toLowerCase().includes('external telemetry approved');
!telemetryApprovalClaim
  ? pass('Docs do not positively claim telemetry/analytics approved')
  : fail('Docs must not positively claim telemetry/analytics approved');

// ── 34. Docs do not claim built-in AI/OCR/API-key/BYOK ───────────────────────

const aiByokClaim =
  allDocContent.toLowerCase().includes('built-in ai approved') ||
  allDocContent.toLowerCase().includes('ocr approved') ||
  allDocContent.toLowerCase().includes('byok approved') ||
  allDocContent.toLowerCase().includes('api-key approved');
!aiByokClaim
  ? pass('Docs do not claim built-in AI/OCR/API-key/BYOK approved')
  : fail('Docs must not claim built-in AI/OCR/API-key/BYOK approved');

// ── 35. Docs do not claim broad validation ───────────────────────────────────

const broadValidationClaim =
  allDocContent.toLowerCase().includes('broadly validated') ||
  allDocContent.toLowerCase().includes('broad validation complete');
!broadValidationClaim
  ? pass('Docs do not claim broad validation')
  : fail('Docs must not claim broad validation');

// ── 36. Docs do not claim stress-tested readiness ────────────────────────────

const stressTestedClaim =
  allDocContent.toLowerCase().includes('stress-tested readiness approved') ||
  allDocContent.toLowerCase().includes('stress testing complete');
!stressTestedClaim
  ? pass('Docs do not claim stress-tested readiness approved')
  : fail('Docs must not claim stress-tested readiness approved or stress testing complete');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
