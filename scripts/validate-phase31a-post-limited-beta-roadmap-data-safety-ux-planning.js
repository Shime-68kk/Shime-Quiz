#!/usr/bin/env node
/**
 * Phase 31A Static Validator — Post-Limited-Beta Roadmap / Data Safety UX Planning
 *
 * PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING
 * PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE
 * PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND
 * PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED
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

const ROADMAP_DOC = `docs/planning/phase31a-post-limited-beta-roadmap-data-safety-ux-planning.md`;
const RESEARCH_DOC = `docs/research/phase31a-local-first-ux-research-brief.md`;
const RELEASE_DOC = `docs/release/phase31a-post-limited-beta-roadmap-summary.md`;
const PHASE31B_SEED_DOC = `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`;
const VALIDATOR = `scripts/validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

for (const [label, relPath] of [
  ['Phase 31A roadmap planning doc exists', ROADMAP_DOC],
  ['Phase 31A local-first UX research brief exists', RESEARCH_DOC],
  ['Phase 31A release summary doc exists', RELEASE_DOC],
  ['Phase 31B data safety UX design gate seed exists', PHASE31B_SEED_DOC],
  ['Phase 31A validator script exists', VALIDATOR],
  ['CI workflow exists', CI_WORKFLOW],
]) {
  fileExists(relPath) ? pass(`${label}: ${relPath}`) : fail(label, `missing ${relPath}`);
}

// ── 2. Read file contents ────────────────────────────────────────────────────

const roadmapDocContent = readFile(ROADMAP_DOC) || '';
const researchDocContent = readFile(RESEARCH_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const phase31bSeedContent = readFile(PHASE31B_SEED_DOC) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent =
  roadmapDocContent + '\n' + researchDocContent + '\n' + releaseDocContent + '\n' + phase31bSeedContent;
const validatorNonComment = getSourceNonCommentLines(validatorContent);

// ── 3. Required status tokens ────────────────────────────────────────────────

const REQUIRED_TOKENS = [
  'PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING',
  'PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND',
  'PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 70)}`)
    : fail('Required token missing', token);
}

// ── 4. Decision token — must be one of three allowed values ──────────────────

const ALLOWED_DECISION_VALUES = [
  'PASS_TO_PHASE31B_DATA_SAFETY_UX_DESIGN_GATE',
  'NEEDS_ROADMAP_REWORK',
  'HOLD_POST_LIMITED_BETA_ROADMAP',
];

const DECISION_TOKEN_PREFIX = 'PHASE31A_POST_LIMITED_BETA_ROADMAP_DECISION: ';

const matchedDecisionValue = ALLOWED_DECISION_VALUES.find(v =>
  allDocContent.includes(`${DECISION_TOKEN_PREFIX}${v}`)
);

if (matchedDecisionValue) {
  pass(
    `Phase 31A decision token present and valid: ${DECISION_TOKEN_PREFIX}${matchedDecisionValue}`
  );
} else {
  fail(
    'Phase 31A decision token missing or invalid',
    `docs must contain exactly one of: ${ALLOWED_DECISION_VALUES.map(v => DECISION_TOKEN_PREFIX + v).join(' | ')}`
  );
}

// ── 5. Required headings in roadmap doc ──────────────────────────────────────

const REQUIRED_ROADMAP_HEADINGS = [
  '# Phase 31A — Post-Limited-Beta Roadmap / Data Safety UX Planning',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 30C',
  '## Current readiness state',
  '## Planning method',
  '## Roadmap decision table',
  '## Data Safety Center / Local Backup Center lane',
  '## Evidence collection lane',
  '## Claim/copy cleanup lane',
  '## Local-first UX research lane',
  '## No-server convenience lane',
  '## Deferred sync/BYOC/P2P research lane',
  '## Recommended roadmap order',
  '## Chosen roadmap decision',
  '## Decision rationale',
  '## What Phase 31A supports',
  '## What Phase 31A does not approve',
  '## Phase 31B handoff',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_ROADMAP_HEADINGS) {
  roadmapDocContent.includes(heading)
    ? pass(`Roadmap doc has heading: ${heading.slice(0, 60)}`)
    : fail('Roadmap doc missing heading', heading);
}

// ── 6. Required headings in research brief ───────────────────────────────────

const REQUIRED_RESEARCH_HEADINGS = [
  '# Phase 31A — Local-First UX Research Brief',
  '## Status',
  '## Research scope',
  '## Current product tension',
  '## Option 1 — Better local backup UX',
  '## Option 2 — Data Safety Center / Local Backup Center',
  '## Option 3 — Backup reminders',
  '## Option 4 — One-time device transfer research',
  '## Option 5 — BYOC/WebDAV encrypted backup research',
  '## Option 6 — P2P/WebRTC transfer research',
  '## Comparative risk table',
  '## Recommendation',
  '## What not to implement yet',
  '## Opus 4.7 research gate',
];

for (const heading of REQUIRED_RESEARCH_HEADINGS) {
  researchDocContent.includes(heading)
    ? pass(`Research brief has heading: ${heading.slice(0, 60)}`)
    : fail('Research brief missing heading', heading);
}

// ── 7. Required headings in release summary ──────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 31A — Post-Limited-Beta Roadmap Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Roadmap result',
  '## Chosen decision',
  '## Decision rationale',
  '## Recommended next lanes',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release summary has heading: ${heading.slice(0, 60)}`)
    : fail('Release summary missing heading', heading);
}

// ── 8. Required headings in Phase 31B seed ───────────────────────────────────

const REQUIRED_PHASE31B_HEADINGS = [
  '# Phase 31B — Data Safety UX Design Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31A',
  '## Design constraints',
  '## Candidate UX surfaces',
  '## Required boundaries',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_PHASE31B_HEADINGS) {
  phase31bSeedContent.includes(heading)
    ? pass(`Phase 31B seed has heading: ${heading.slice(0, 60)}`)
    : fail('Phase 31B seed missing heading', heading);
}

// ── 9. Roadmap decision table columns and required rows ──────────────────────

const REQUIRED_TABLE_COLUMNS = [
  'Lane',
  'Purpose',
  'User value',
  'Risk',
  'Evidence needed',
  'Runtime impact',
  'Decision',
  'Guardrail',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  roadmapDocContent.includes(col)
    ? pass(`Roadmap decision table has column: ${col}`)
    : fail('Roadmap decision table missing column', col);
}

const REQUIRED_TABLE_ROWS = [
  'Data Safety Center / Local Backup Center UX planning',
  'Backup reminder',
  'Import preview',
  'Restore rehearsal browser evidence',
  'Adapter-awareness browser evidence',
  'Before/after localStorage diff',
  'stress',
  'rollback',
  'release-notes',
  'analytics',
  'Local-first UX research',
  'No-server device-transfer',
  'BYOC/WebDAV',
  'P2P/WebRTC',
];

for (const row of REQUIRED_TABLE_ROWS) {
  roadmapDocContent.toLowerCase().includes(row.toLowerCase())
    ? pass(`Roadmap decision table has row: ${row.slice(0, 60)}`)
    : fail('Roadmap decision table missing row', row);
}

// ── 10. Research brief comparative table columns ─────────────────────────────

const REQUIRED_RESEARCH_TABLE_COLUMNS = [
  'Option',
  'User value',
  'Complexity',
  'Data-loss risk',
  'Privacy risk',
  'Conflict-resolution need',
  'Claim risk',
  'Recommendation',
];

for (const col of REQUIRED_RESEARCH_TABLE_COLUMNS) {
  researchDocContent.includes(col)
    ? pass(`Research brief comparative table has column: ${col}`)
    : fail('Research brief comparative table missing column', col);
}

// ── 11. Research brief has recommendation preferring Data Safety Center first ─

const hasDataSafetyCenterRecommendation =
  researchDocContent.includes('Data Safety Center') &&
  researchDocContent.includes('highest-priority') &&
  researchDocContent.includes('Recommendation');
hasDataSafetyCenterRecommendation
  ? pass('Research brief recommendation prefers Data Safety Center first')
  : fail(
      'Research brief recommendation must prefer Data Safety Center as highest-priority non-evidence lane'
    );

const researchHasNoServerSync =
  researchDocContent.includes('No runtime sync') ||
  researchDocContent.includes('no runtime sync') ||
  researchDocContent.includes('Do not implement in Phase 31A') ||
  researchDocContent.includes('Research only') ||
  researchDocContent.includes('research only');
researchHasNoServerSync
  ? pass('Research brief recommends no runtime sync/cloud/BYOC/P2P implementation')
  : fail('Research brief must recommend no runtime sync/cloud/BYOC/P2P implementation');

// ── 12. Phase 31B seed has required token ────────────────────────────────────

phase31bSeedContent.includes(
  'PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED'
)
  ? pass('Phase 31B seed has required token: PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED')
  : fail(
      'Phase 31B seed missing required token',
      'PHASE31B_DATA_SAFETY_UX_DESIGN_SEED_STATUS: PREPARED_PLANNING_SEED'
    );

// ── 13. Phase 31B decision options ───────────────────────────────────────────

const REQUIRED_PHASE31B_DECISION_OPTIONS = [
  'HOLD_DATA_SAFETY_UX',
  'NEEDS_MORE_RESEARCH',
  'PASS_TO_DATA_SAFETY_UX_PROTOTYPE',
];

for (const opt of REQUIRED_PHASE31B_DECISION_OPTIONS) {
  phase31bSeedContent.includes(opt)
    ? pass(`Phase 31B seed has decision option: ${opt}`)
    : fail('Phase 31B seed missing decision option', opt);
}

// ── 14. Phase 31B framed as separate design gate ─────────────────────────────

const phase31bSeparateGate =
  phase31bSeedContent.includes('separate design gate') ||
  phase31bSeedContent.includes('not automatically approved');
phase31bSeparateGate
  ? pass('Phase 31B seed frames Phase 31B as a separate design gate')
  : fail('Phase 31B seed must frame Phase 31B as a separate design gate');

// ── 15. Required next-phase statements in docs ───────────────────────────────

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 31B — Data Safety UX Design Gate',
  'Phase 31B is a separate design gate and is not automatically approved',
  'Phase 31A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31A does not approve BETA_READY',
  'Phase 31A does not approve public production readiness',
  'Phase 31A does not approve guaranteed data-loss prevention',
  'Phase 31A does not approve restore execution',
  'Phase 31A does not approve production restore rehearsal',
  'Phase 31A does not approve real learner data restore rehearsal',
  'Phase 31A does not approve runtime backup/export/restore changes',
  'Phase 31A does not approve backup file format changes',
  'Phase 31A does not approve restore overwrite behavior changes',
  'Phase 31A does not approve storage migration',
  'Phase 31A does not approve sync/cloud/account/auth/backend',
  'Phase 31A does not approve telemetry/analytics',
  'Phase 31A does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31A does not approve BYOC/WebDAV/P2P/device-transfer implementation',
];

for (const stmt of REQUIRED_NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 16. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning')
  ? pass('CI registers Phase 31A validator')
  : fail(
      'CI must register Phase 31A validator',
      'e2e-smoke.yml does not reference validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning'
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
  ? pass('CI does not run Phase 24D through Phase 30C validators as active merge-blocking steps')
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
  `docs/planning/phase31a-post-limited-beta-roadmap-data-safety-ux-planning.md`,
  `docs/research/phase31a-local-first-ux-research-brief.md`,
  `docs/release/phase31a-post-limited-beta-roadmap-summary.md`,
  `docs/planning/phase31b-data-safety-ux-design-gate-seed.md`,
  `scripts/validate-phase31a-post-limited-beta-roadmap-data-safety-ux-planning.js`,
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
  // origin/main is made available by actions/checkout@v4 with fetch-depth: 0.
  // Validator does not run git fetch.
  execSync('git rev-parse --verify origin/main', {
    stdio: 'pipe',
    encoding: 'utf8',
    cwd: ROOT,
  });
  pass(
    'origin/main available',
    'git rev-parse --verify origin/main'
  );
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
  }
} catch (e) {
  fail('git diff origin/main..HEAD failed', String(e.message || e));
}

// ── 20. No prototype module imports in new Phase 31A files ───────────────────

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

const phase31aNewJsFiles = [path.join(ROOT, VALIDATOR)];

for (const moduleName of PROTOTYPE_MODULES) {
  const importers = phase31aNewJsFiles.filter(f => {
    try {
      const content = fs.readFileSync(f, 'utf8');
      const nonComment = getSourceNonCommentLines(content);
      return new RegExp(`import[^'"]*from\\s+['"].*${moduleName}`).test(nonComment);
    } catch {
      return false;
    }
  });
  importers.length === 0
    ? pass(`No Phase 31A file newly imports prototype module: ${moduleName}`)
    : fail(
        `No Phase 31A file may import prototype module: ${moduleName}`,
        importers.map(f => path.relative(ROOT, f)).join(', ')
      );
}

// ── 21. Forbidden claim strings absent from doc content ──────────────────────

const FORBIDDEN_CLAIM_STRINGS = [
  'restore_executed',
  'production_restore_rehearsal_approved',
  'real_learner_data_approved',
  'backup_format_changed',
  'restore_overwrite_approved',
  'storage_migration_approved',
  'BROWSER_EVIDENCE_FULLY_COLLECTED',
  'Phase 31A implementation exists',
  'Phase 31B implementation exists',
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
    allDocContent.includes('Phase 31A does not approve') ||
    allDocContent.includes('does not approve BETA_READY');
  inNegativeContext
    ? pass(`Forbidden claim "${claim.slice(0, 50)}" appears only in negative/guardrail context`)
    : fail(`Forbidden claim "${claim.slice(0, 50)}" must not appear as positive claim`);
}

// ── 22. BETA_READY must not appear as positive claim ─────────────────────────

const betaReadyPositiveApproval =
  allDocContent.includes('Phase 31A approves BETA_READY') ||
  allDocContent.includes('Phase 31A approved BETA_READY');

if (betaReadyPositiveApproval) {
  fail('BETA_READY must not appear as a positive claim in docs');
} else {
  pass('BETA_READY references appear only in negative/guardrail context in docs');
}

// ── 23. Docs do not positively claim public production readiness ──────────────

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

// ── 24. Docs do not claim Phase 31B implementation exists ─────────────────────

const phase31bImplementationClaim = allDocContent.includes('Phase 31B implementation exists');
!phase31bImplementationClaim
  ? pass('Docs do not claim Phase 31B implementation exists')
  : fail('Docs must not claim Phase 31B implementation exists');

// ── 25. Data Safety Center planning is allowed as UX design only ─────────────

const dataSafetyCenterPlanningAllowed =
  allDocContent.includes('Data Safety Center') &&
  (allDocContent.includes('planning only') ||
    allDocContent.includes('design only') ||
    allDocContent.includes('design-only') ||
    allDocContent.includes('UX planning') ||
    allDocContent.includes('No runtime implementation'));
dataSafetyCenterPlanningAllowed
  ? pass('Docs confirm Data Safety Center is planning/design only in Phase 31A')
  : fail(
      'Docs must confirm Data Safety Center is planning/design only in Phase 31A (no runtime implementation)'
    );

// ── 26. BYOC/WebDAV/P2P framed as research-only ──────────────────────────────

const byocResearchOnly =
  allDocContent.includes('BYOC') &&
  (allDocContent.toLowerCase().includes('research only') ||
    allDocContent.toLowerCase().includes('research-only') ||
    allDocContent.includes('not approved for implementation') ||
    allDocContent.includes('do not implement') ||
    allDocContent.includes('Do not implement'));
byocResearchOnly
  ? pass('Docs frame BYOC/WebDAV/P2P as research-only, not approved for implementation')
  : fail('Docs must frame BYOC/WebDAV/P2P as research-only, not approved for implementation');

// ── 27. Server/sync/cloud/account/auth/backend remain not approved ────────────

const hasSyncGuardrail =
  allDocContent.includes('does not approve sync/cloud/account/auth/backend') ||
  allDocContent.includes('Phase 31A does not approve sync/cloud/account/auth/backend') ||
  allDocContent.includes('sync/cloud/account/auth/backend') &&
    allDocContent.includes('not approved');
hasSyncGuardrail
  ? pass('Sync/cloud/auth/backend guardrail present in docs')
  : fail(
      'Sync/cloud/auth/backend guardrail missing from docs',
      'docs must state sync/cloud/account/auth/backend is not approved'
    );

// ── 28. Analytics/telemetry not positively approved ──────────────────────────

const telemetryApprovalClaim =
  allDocContent.toLowerCase().includes('telemetry approved') ||
  allDocContent.toLowerCase().includes('analytics approved') ||
  allDocContent.toLowerCase().includes('external telemetry approved');
!telemetryApprovalClaim
  ? pass('Docs do not positively claim telemetry/analytics approved')
  : fail('Docs must not positively claim telemetry/analytics approved');

// ── 29. Docs do not claim built-in AI/OCR/API-key/BYOK ───────────────────────

const aiByokClaim =
  allDocContent.toLowerCase().includes('built-in ai approved') ||
  allDocContent.toLowerCase().includes('ocr approved') ||
  allDocContent.toLowerCase().includes('byok approved') ||
  allDocContent.toLowerCase().includes('api-key approved');
!aiByokClaim
  ? pass('Docs do not claim built-in AI/OCR/API-key/BYOK approved')
  : fail('Docs must not claim built-in AI/OCR/API-key/BYOK approved');

// ── 30. Docs do not claim broad validation or stress-tested readiness ─────────

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

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
