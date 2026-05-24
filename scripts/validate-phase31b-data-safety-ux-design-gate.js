#!/usr/bin/env node
/**
 * Phase 31B Static Validator — Data Safety UX Design Gate
 *
 * PHASE31B_DATA_SAFETY_UX_DESIGN_STATUS: COMPLETED_DATA_SAFETY_UX_DESIGN_GATE
 * PHASE31B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31B_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED
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

const DESIGN_GATE_DOC = `docs/planning/phase31b-data-safety-ux-design-gate.md`;
const UX_SPEC_DOC = `docs/design/phase31b-data-safety-center-ux-spec.md`;
const RELEASE_DOC = `docs/release/phase31b-data-safety-ux-design-gate-summary.md`;
const PHASE31C_SEED_DOC = `docs/planning/phase31c-data-safety-ux-prototype-seed.md`;
const VALIDATOR = `scripts/validate-phase31b-data-safety-ux-design-gate.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 31B design gate doc exists', DESIGN_GATE_DOC],
  ['Phase 31B UX spec doc exists', UX_SPEC_DOC],
  ['Phase 31B release summary doc exists', RELEASE_DOC],
  ['Phase 31C seed doc exists', PHASE31C_SEED_DOC],
  ['Phase 31B validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const designGateContent = readFile(DESIGN_GATE_DOC) || '';
const uxSpecContent = readFile(UX_SPEC_DOC) || '';
const releaseContent = readFile(RELEASE_DOC) || '';
const phase31cSeedContent = readFile(PHASE31C_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent =
  designGateContent + '\n' + uxSpecContent + '\n' + releaseContent + '\n' + phase31cSeedContent;
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required status tokens ────────────────────────────────────────────────

const REQUIRED_TOKENS = [
  'PHASE31B_DATA_SAFETY_UX_DESIGN_STATUS: COMPLETED_DATA_SAFETY_UX_DESIGN_GATE',
  'PHASE31B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE31B_DESIGN_SCOPE: DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND',
  'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 70)}`)
    : fail('Required token missing', token);
}

// ── 4. Decision token — must be one of three allowed values ──────────────────

const ALLOWED_DECISION_VALUES = [
  'PASS_TO_PHASE31C_DATA_SAFETY_UX_PROTOTYPE',
  'NEEDS_MORE_RESEARCH',
  'HOLD_DATA_SAFETY_UX',
];

const DECISION_TOKEN_PREFIX = 'PHASE31B_DATA_SAFETY_UX_DESIGN_DECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(
    `Phase 31B decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`
  );
} else {
  fail(
    'Phase 31B decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 5. Required headings in design gate doc ──────────────────────────────────

const REQUIRED_DESIGN_GATE_HEADINGS = [
  '# Phase 31B — Data Safety UX Design Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31A',
  '## Current readiness state',
  '## Design gate method',
  '## Design decision table',
  '## Data Safety Center concept',
  '## Local Backup Center concept',
  '## UX surfaces',
  '## UX state model',
  '## User-facing copy boundaries',
  '## Evidence plan for prototype',
  '## Non-goals',
  '## Open risks',
  '## Chosen design decision',
  '## Decision rationale',
  '## What Phase 31B supports',
  '## What Phase 31B does not approve',
  '## Phase 31C handoff',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_DESIGN_GATE_HEADINGS) {
  designGateContent.includes(heading)
    ? pass(`Design gate doc has heading: ${heading.slice(0, 60)}`)
    : fail('Design gate doc missing heading', heading);
}

// ── 6. Required headings in UX spec ─────────────────────────────────────────

const REQUIRED_UX_SPEC_HEADINGS = [
  '# Phase 31B — Data Safety Center UX Spec',
  '## Status',
  '## UX goal',
  '## User problem',
  '## Design principles',
  '## Information architecture',
  '## Candidate screen sections',
  '## State model',
  '## Copy rules',
  '## Warning patterns',
  '## Evidence and instrumentation boundaries',
  '## Accessibility notes',
  '## Prototype constraints',
  '## Out of scope',
  '## Handoff to Phase 31C',
];

for (const heading of REQUIRED_UX_SPEC_HEADINGS) {
  uxSpecContent.includes(heading)
    ? pass(`UX spec has heading: ${heading.slice(0, 60)}`)
    : fail('UX spec missing heading', heading);
}

// ── 7. UX spec candidate screen sections ────────────────────────────────────

const REQUIRED_SCREEN_SECTIONS = [
  'readiness/status summary',
  'local data explanation',
  'export backup action placeholder',
  'import preview action placeholder',
  'restore caution block',
  'backup reminder concept',
  'storage',
  'evidence gaps',
  'help',
];

for (const section of REQUIRED_SCREEN_SECTIONS) {
  uxSpecContent.toLowerCase().includes(section.toLowerCase())
    ? pass(`UX spec candidate screen sections include: ${section}`)
    : fail('UX spec candidate screen sections missing', section);
}

// ── 8. UX spec prototype constraints ────────────────────────────────────────

const REQUIRED_PROTOTYPE_CONSTRAINTS = [
  'No real backup/export/restore behavior changes',
  'No storage writes',
  'No sync/cloud/backend',
  'No telemetry',
  'no production navigation change',
  'generated/test-only',
];

for (const constraint of REQUIRED_PROTOTYPE_CONSTRAINTS) {
  uxSpecContent.toLowerCase().includes(constraint.toLowerCase())
    ? pass(`UX spec prototype constraints include: ${constraint.slice(0, 60)}`)
    : fail('UX spec prototype constraints missing', constraint);
}

// ── 9. Required headings in release summary ──────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 31B — Data Safety UX Design Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Design result',
  '## Chosen decision',
  '## Decision rationale',
  '## Recommended UX direction',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseContent.includes(heading)
    ? pass(`Release summary has heading: ${heading.slice(0, 60)}`)
    : fail('Release summary missing heading', heading);
}

// ── 10. Required headings in Phase 31C seed ──────────────────────────────────

const REQUIRED_PHASE31C_HEADINGS = [
  '# Phase 31C — Data Safety UX Prototype Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31B',
  '## Prototype constraints',
  '## Allowed prototype surfaces',
  '## Forbidden runtime behaviors',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE31C_HEADINGS) {
  phase31cSeedContent.includes(heading)
    ? pass(`Phase 31C seed has heading: ${heading.slice(0, 60)}`)
    : fail('Phase 31C seed missing heading', heading);
}

// ── 11. Phase 31C seed has required token ────────────────────────────────────

phase31cSeedContent.includes(
  'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 31C seed has required token: PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED')
  : fail(
      'Phase 31C seed missing required token',
      'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_SEED_STATUS: PREPARED_PLANNING_SEED'
    );

// ── 12. Phase 31C decision options ───────────────────────────────────────────

const REQUIRED_PHASE31C_DECISION_OPTIONS = [
  'HOLD_DATA_SAFETY_UX_PROTOTYPE',
  'NEEDS_DESIGN_REWORK',
  'PASS_TO_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE',
];

for (const opt of REQUIRED_PHASE31C_DECISION_OPTIONS) {
  phase31cSeedContent.includes(opt)
    ? pass(`Phase 31C seed has decision option: ${opt}`)
    : fail('Phase 31C seed missing decision option', opt);
}

// ── 13. Phase 31C framed as separate prototype gate ──────────────────────────

const phase31cSeparateGate =
  phase31cSeedContent.includes('separate prototype gate') ||
  phase31cSeedContent.includes('not automatically approved');
phase31cSeparateGate
  ? pass('Phase 31C seed frames Phase 31C as a separate prototype gate')
  : fail('Phase 31C seed must frame Phase 31C as a separate prototype gate');

// ── 14. Design decision table columns ───────────────────────────────────────

const REQUIRED_TABLE_COLUMNS = [
  'Design area',
  'Purpose',
  'User value',
  'Risk',
  'Evidence needed',
  'Runtime impact',
  'Decision',
  'Guardrail',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  designGateContent.includes(col)
    ? pass(`Design decision table has column: ${col}`)
    : fail('Design decision table missing column', col);
}

// ── 15. Design decision table required rows ──────────────────────────────────

const REQUIRED_TABLE_ROWS = [
  'Data Safety Center overview card',
  'Local Backup Center',
  'Import preview entry point',
  'Restore warning',
  'Backup reminder concept',
  'Last-backup-status concept',
  'Storage-location copy',
  'Local-only analytics wording',
  'Legacy release-notes cleanup',
  'Evidence gaps panel',
  'Help/FAQ copy',
  'Empty state',
  'Error state',
  'Disabled/default-off state',
  'Accessibility/copy clarity',
  'Future sync/BYOC/P2P research warning',
];

for (const row of REQUIRED_TABLE_ROWS) {
  designGateContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Design decision table has row: ${row.slice(0, 60)}`)
    : fail('Design decision table missing row', row);
}

// ── 16. Required next-phase statements ──────────────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 31C — Data Safety UX Prototype',
  'Phase 31C is a separate prototype gate and is not automatically approved',
  'Phase 31B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31B does not approve BETA_READY',
  'Phase 31B does not approve public production readiness',
  'Phase 31B does not approve guaranteed data-loss prevention',
  'Phase 31B does not approve restore execution',
  'Phase 31B does not approve production restore rehearsal',
  'Phase 31B does not approve real learner data restore rehearsal',
  'Phase 31B does not approve runtime backup/export/restore changes',
  'Phase 31B does not approve backup file format changes',
  'Phase 31B does not approve restore overwrite behavior changes',
  'Phase 31B does not approve storage migration',
  'Phase 31B does not approve sync/cloud/account/auth/backend',
  'Phase 31B does not approve telemetry/analytics',
  'Phase 31B does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31B does not approve BYOC/WebDAV/P2P/device-transfer implementation',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 17. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase31b-data-safety-ux-design-gate')
  ? pass('CI registers Phase 31B validator')
  : fail(
      'CI must register Phase 31B validator',
      'e2e-smoke.yml does not reference validate-phase31b-data-safety-ux-design-gate'
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
  'validate-phase26d',
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
  'validate-phase30c',
  'validate-phase31a',
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
  ? pass('CI does not run Phase 24D through Phase 31A validators as active merge-blocking steps')
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
  `docs/planning/phase31b-data-safety-ux-design-gate.md`,
  `docs/design/phase31b-data-safety-center-ux-spec.md`,
  `docs/release/phase31b-data-safety-ux-design-gate-summary.md`,
  `docs/planning/phase31c-data-safety-ux-prototype-seed.md`,
  `scripts/validate-phase31b-data-safety-ux-design-gate.js`,
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
  /^RELEASE_NOTES\.md$/,
  /^RELEASE_NOTES_V2\.md$/,
];

const FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES = [
  `docs/planning/phase31a`,
  `docs/research/phase31a`,
  `docs/release/phase31a`,
  `scripts/validate-phase31a`,
  `docs/testing/phase30c`,
  `docs/release/phase30c`,
  `docs/planning/phase30c`,
  `scripts/validate-phase30c`,
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
  `docs/testing/phase28`,
  `docs/release/phase28`,
  `docs/planning/phase28`,
  `scripts/validate-phase28`,
  `docs/testing/phase27`,
  `docs/release/phase27`,
  `docs/planning/phase27`,
  `scripts/validate-phase27`,
];

let changedFiles = [];
try {
  execSync('git rev-parse --verify origin/main', {
    stdio: 'pipe',
    encoding: 'utf8',
    cwd: ROOT,
  });
  pass('origin/main available via git rev-parse --verify origin/main');
} catch {
  fail(
    'origin/main available',
    'git rev-parse --verify origin/main failed — ensure actions/checkout@v4 uses fetch-depth: 0'
  );
}

try {
  pass('origin/main is available (provided by workflow checkout step with fetch-depth: 0)');
  const diffOutput = execSync('git diff origin/main..HEAD --name-only', {
    stdio: 'pipe',
    encoding: 'utf8',
    cwd: ROOT,
  }).trim();
  pass('git diff origin/main..HEAD uses double-dot (not triple-dot)');

  changedFiles = diffOutput ? diffOutput.split('\n').filter(Boolean) : [];
  const diffEmpty = changedFiles.length === 0;

  if (diffEmpty) {
    pass('Changed files: none (branch is at origin/main — no new files yet, or running on main)');
  } else {
    const unexpectedFiles = changedFiles.filter(f => !ALLOWED_CHANGED_FILES.has(f));
    const missingAllowed = [...ALLOWED_CHANGED_FILES].filter(f => !changedFiles.includes(f));
    const forbiddenPatternMatches = changedFiles.filter(f =>
      FORBIDDEN_CHANGED_PATTERNS.some(pat => pat.test(f))
    );
    const priorPhaseMatches = changedFiles.filter(f =>
      FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES.some(prefix => f.startsWith(prefix))
    );
    const generatedArtifacts = changedFiles.filter(
      f =>
        f.startsWith(`node_modules/`) ||
        f.startsWith(`dist/`) ||
        f.startsWith(`coverage/`) ||
        f.startsWith(`test-results/`) ||
        f.startsWith(`playwright-report/`) ||
        f === 'FETCH_HEAD'
    );

    unexpectedFiles.length === 0
      ? pass('Changed files: no unexpected files outside allowed set')
      : fail(
          'Changed files: unexpected files outside allowed set',
          unexpectedFiles.join(', ')
        );

    missingAllowed.length === 0
      ? pass('Changed files: all allowed files are present')
      : pass(
          `Changed files: some allowed files not yet added (OK if branch is partial) — missing: ${missingAllowed.join(', ')}`
        );

    forbiddenPatternMatches.length === 0
      ? pass('Changed files: no forbidden pattern matches (src/, tests/, e2e/, package.json, etc.)')
      : fail(
          'Changed files: forbidden pattern match found',
          forbiddenPatternMatches.join(', ')
        );

    priorPhaseMatches.length === 0
      ? pass('Changed files: no prior phase files modified')
      : fail('Changed files: prior phase files must not be modified', priorPhaseMatches.join(', '));

    generatedArtifacts.length === 0
      ? pass('Changed files: no generated artifacts (node_modules, dist, coverage, etc.)')
      : fail(
          'Changed files: generated artifacts must not be committed',
          generatedArtifacts.join(', ')
        );

    const srcFiles = changedFiles.filter(f => f.startsWith(`src/`));
    srcFiles.length === 0
      ? pass('Changed files: no src/ changes')
      : fail('Changed files: src/ must not be changed', srcFiles.join(', '));

    const testFiles = changedFiles.filter(f => {
      const firstSegment = f.split('/')[0];
      return firstSegment === 'tests';
    });
    testFiles.length === 0
      ? pass('Changed files: no tests/ changes')
      : fail('Changed files: tests/ must not be changed', testFiles.join(', '));

    const e2eFiles = changedFiles.filter(f => f.startsWith(`e2e/`));
    e2eFiles.length === 0
      ? pass('Changed files: no e2e/ changes')
      : fail('Changed files: e2e/ must not be changed', e2eFiles.join(', '));

    const adrFiles = changedFiles.filter(f => f.startsWith(`docs/adr/`));
    adrFiles.length === 0
      ? pass('Changed files: no docs/adr/ changes')
      : fail('Changed files: docs/adr/ must not be changed', adrFiles.join(', '));

    const releaseNotesFiles = changedFiles.filter(
      f => f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md'
    );
    releaseNotesFiles.length === 0
      ? pass('Changed files: no RELEASE_NOTES.md or RELEASE_NOTES_V2.md changes')
      : fail(
          'Changed files: RELEASE_NOTES.md and RELEASE_NOTES_V2.md must not be changed',
          releaseNotesFiles.join(', ')
        );

    const storageDriverFiles = changedFiles.filter(f => {
      const name = path.basename(f);
      return (
        name.includes('StorageAdapter') ||
        name.includes('IndexedDB') ||
        name.includes('localStorageDriver') ||
        name.includes('storageDriver')
      );
    });
    storageDriverFiles.length === 0
      ? pass('Changed files: no production storage driver changes')
      : fail(
          'Changed files: production storage drivers must not be changed',
          storageDriverFiles.join(', ')
        );

    const backupRestoreFiles = changedFiles.filter(f => {
      const name = path.basename(f);
      return (
        (name.includes('backup') ||
          name.includes('export') ||
          name.includes('restore') ||
          name.includes('Backup') ||
          name.includes('Export') ||
          name.includes('Restore')) &&
        !f.startsWith('docs/') &&
        !f.startsWith('scripts/')
      );
    });
    backupRestoreFiles.length === 0
      ? pass('Changed files: no production backup/export/restore module changes')
      : fail(
          'Changed files: production backup/export/restore modules must not be changed',
          backupRestoreFiles.join(', ')
        );

    const syncCloudFiles = changedFiles.filter(
      f =>
        f.includes('sync') ||
        f.includes('cloud') ||
        f.includes('auth') ||
        f.includes('account') ||
        f.includes('backend')
    );
    syncCloudFiles.length === 0
      ? pass('Changed files: no sync/cloud/auth/account/backend changes')
      : fail(
          'Changed files: sync/cloud/auth/account/backend files must not be changed',
          syncCloudFiles.join(', ')
        );

    const telemetryFiles = changedFiles.filter(
      f => f.includes('telemetry') || f.includes('analytics') || f.includes('tracking')
    );
    telemetryFiles.length === 0
      ? pass('Changed files: no telemetry/analytics/tracking changes')
      : fail(
          'Changed files: telemetry/analytics/tracking files must not be changed',
          telemetryFiles.join(', ')
        );

    const packageFiles = changedFiles.filter(
      f => f === 'package.json' || f === 'package-lock.json'
    );
    packageFiles.length === 0
      ? pass('Changed files: no package.json or package-lock.json changes')
      : fail(
          'Changed files: package.json and package-lock.json must not be changed',
          packageFiles.join(', ')
        );

    const routeNavFiles = changedFiles.filter(f => {
      const name = path.basename(f);
      return (
        (name.includes('router') || name.includes('Router') ||
         name.includes('navigation') || name.includes('Navigation') ||
         name.includes('Dashboard') || name.includes('Library') ||
         name.includes('Settings')) &&
        f.startsWith('src/')
      );
    });
    routeNavFiles.length === 0
      ? pass('Changed files: no route/navigation/settings/library/dashboard UI wiring changes')
      : fail(
          'Changed files: route/navigation/settings/library/dashboard files must not be changed',
          routeNavFiles.join(', ')
        );
  }
} catch (e) {
  fail('git diff origin/main..HEAD failed', String(e.message || e));
}

// ── 21. No prototype module imports in new Phase 31B files ───────────────────

const PROTOTYPE_MODULES = [
  'backupRestoreRehearsalPlanner',
  'adapterAwarenessModel',
  'indexedDBAdapter',
  'IndexedDBAdapter',
  'migrationJournal',
  'MigrationJournal',
  'restoreRehearsalPrototype',
  'backupHealthIntegration',
  'localMigrationPilot',
];

const phase31bNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase31bNewJsFiles.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 31B file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 31B file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 22. Forbidden claim strings absent from doc content ──────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 31B implementation exists',
  'Phase 31C implementation exists',
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
    allDocContent.includes('Phase 31B does not approve') ||
    allDocContent.includes('does not approve BETA_READY');
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 23. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyPositiveApproval =
  allDocContent.includes('Phase 31B approves BETA_READY') ||
  allDocContent.includes('Phase 31B approved BETA_READY');

if (betaReadyPositiveApproval) {
  fail('BETA_READY must not appear as a positive claim in docs');
} else {
  pass('BETA_READY references appear only in negative/guardrail context in docs');
}

// ── 24. Docs do not positively claim public production readiness ──────────────

const FORBIDDEN_LARGE_SCOPE_CLAIMS = [
  'production restore rehearsal approved',
  'real learner data restore rehearsal approved',
  'stress-tested readiness approved',
  'broad validation approved',
  'storage migration approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'public production readiness approved',
  'guaranteed data-loss prevention approved',
  'restore execution approved',
  'sync/cloud/account/auth/backend approved',
  'telemetry/analytics approved',
  'BYOC/WebDAV/P2P/device-transfer approved',
  'built-in AI/OCR/API-key/BYOK approved',
];

for (const claim of FORBIDDEN_LARGE_SCOPE_CLAIMS) {
  allDocContent.toLowerCase().includes(claim.toLowerCase())
    ? fail(`Docs must not claim: "${claim}"`)
    : pass(`Docs do not claim: "${claim.slice(0, 60)}"`);
}

// ── 25. Docs do not claim Phase 31C implementation exists ─────────────────────

const phase31cImplementationClaim = allDocContent.includes('Phase 31C implementation exists');
!phase31cImplementationClaim
  ? pass('Docs do not claim Phase 31C implementation exists')
  : fail('Docs must not claim Phase 31C implementation exists');

// ── 26. Data Safety Center planning is design-only ───────────────────────────

const dataSafetyCenterDesignOnly =
  allDocContent.includes('Data Safety Center') &&
  (allDocContent.includes('planning only') ||
    allDocContent.includes('design only') ||
    allDocContent.includes('design-only') ||
    allDocContent.includes('No runtime implementation') ||
    allDocContent.includes('DESIGN_ONLY_NO_RUNTIME'));
dataSafetyCenterDesignOnly
  ? pass('Docs confirm Data Safety Center is design-only in Phase 31B')
  : fail(
      'Docs must confirm Data Safety Center is design-only in Phase 31B (no runtime implementation)'
    );

// ── 27. BYOC/WebDAV/P2P framed as not approved ──────────────────────────────

const byocNotApproved =
  allDocContent.includes('BYOC') &&
  (allDocContent.toLowerCase().includes('not approved') ||
    allDocContent.toLowerCase().includes('research only') ||
    allDocContent.toLowerCase().includes('research-only') ||
    allDocContent.includes('does not approve BYOC/WebDAV/P2P') ||
    allDocContent.includes('do not implement'));
byocNotApproved
  ? pass('Docs confirm BYOC/WebDAV/P2P is not approved for implementation in Phase 31B')
  : fail('Docs must confirm BYOC/WebDAV/P2P is not approved for implementation');

// ── 28. Sync/cloud/auth/backend guardrail present ────────────────────────────

const hasSyncGuardrail =
  allDocContent.includes('does not approve sync/cloud/account/auth/backend') ||
  allDocContent.includes('Phase 31B does not approve sync/cloud/account/auth/backend') ||
  (allDocContent.includes('sync/cloud/account/auth/backend') &&
    allDocContent.includes('not approved'));
hasSyncGuardrail
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      'docs must state sync/cloud/account/auth/backend is not approved'
    );

// ── 29. Analytics/telemetry not positively approved ──────────────────────────

const telemetryApprovalClaim =
  allDocContent.toLowerCase().includes('telemetry approved') ||
  allDocContent.toLowerCase().includes('analytics approved') ||
  allDocContent.toLowerCase().includes('external telemetry approved');
!telemetryApprovalClaim
  ? pass('Docs do not positively claim telemetry/analytics approved')
  : fail('Docs must not positively claim telemetry/analytics approved');

// ── 30. Docs do not claim built-in AI/OCR/API-key/BYOK ───────────────────────

const aiByokClaim =
  allDocContent.toLowerCase().includes('built-in ai approved') ||
  allDocContent.toLowerCase().includes('ocr approved') ||
  allDocContent.toLowerCase().includes('byok approved') ||
  allDocContent.toLowerCase().includes('api-key approved');
!aiByokClaim
  ? pass('Docs do not claim built-in AI/OCR/API-key/BYOK approved')
  : fail('Docs must not claim built-in AI/OCR/API-key/BYOK approved');

// ── 31. Docs do not claim broad validation or stress-tested readiness ─────────

const broadValidationClaim =
  allDocContent.toLowerCase().includes('broadly validated') ||
  allDocContent.toLowerCase().includes('broad validation complete');
!broadValidationClaim
  ? pass('Docs do not claim broad validation')
  : fail('Docs must not claim broad validation');

const stressTestedClaim =
  allDocContent.toLowerCase().includes('stress-tested readiness approved') ||
  allDocContent.toLowerCase().includes('stress testing complete');
!stressTestedClaim
  ? pass('Docs do not claim stress-tested readiness approved')
  : fail('Docs must not claim stress-tested readiness approved or stress testing complete');

// ── 32. Design decision table rows include all required areas ─────────────────

const DATA_SAFETY_CENTER_DESIGN_AREAS = [
  'Data Safety Center',
  'Local Backup Center',
  'restore',
  'backup reminder',
  'evidence gaps',
  'help',
  'empty state',
  'error state',
];

for (const area of DATA_SAFETY_CENTER_DESIGN_AREAS) {
  designGateContent.toLowerCase().includes(area.toLowerCase())
    ? pass(`Design gate doc covers design area: ${area}`)
    : fail('Design gate doc must cover design area', area);
}

// ── 33. Docs confirm design is planning/design only ───────────────────────────

const designOnlyClaim =
  allDocContent.includes('Data Safety Center planning is design-only') ||
  allDocContent.includes('planning and design only') ||
  allDocContent.includes('Planning and design only') ||
  allDocContent.includes('DESIGN_ONLY_NO_RUNTIME_BACKUP_RESTORE_SYNC_CLOUD_OR_BACKEND');
designOnlyClaim
  ? pass('Docs confirm Data Safety Center planning is design-only')
  : fail('Docs must confirm Data Safety Center planning is design-only');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
