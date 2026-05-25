#!/usr/bin/env node
/**
 * Phase 33C — Controlled Limited Beta Prep Review Validator
 *
 * PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_STATUS: COMPLETED_CONTROLLED_PREP_REVIEW
 * PHASE33C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_DECISION: PASS_TO_PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES
 * PHASE33C_REVIEW_SCOPE: CONTROLLED_LIMITED_BETA_PREP_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33C_LIMITATION_REVIEW_STATUS: LIMITATIONS_DISCLOSURE_REVIEWED_AND_CARRIED_FORWARD
 * PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ERRORS = [];
const WARNINGS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

function fail(msg) { ERRORS.push(msg); }
function warn(msg) { WARNINGS.push(msg); }
function pass(msg) { console.log(`  PASS  ${msg}`); }

function isGeneratedArtifactPath(file) {
  return GENERATED_ARTIFACTS.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function readFile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8');
}

function requireFile(rel) {
  const content = readFile(rel);
  if (content === null) {
    fail(`Required file missing: ${rel}`);
    return '';
  }
  pass(`File exists: ${rel}`);
  return content;
}

function getGitSha(ref) {
  try {
    return execSync(`git rev-parse ${ref}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function getChangedFiles() {
  try {
    const out = execSync('git diff --name-only origin/main..HEAD', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
    const committed = out ? out.split('\n').map(f => f.trim()).filter(Boolean) : [];
    if (committed.length > 0) return committed;

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      const worktreeOut = execSync('git diff --name-only', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
      const untrackedOut = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
      const worktree = worktreeOut ? worktreeOut.split('\n').map(f => f.trim()).filter(Boolean) : [];
      const untracked = untrackedOut ? untrackedOut.split('\n').map(f => f.trim()).filter(Boolean) : [];
      return [...new Set([...worktree, ...untracked])];
    }

    return [];
  } catch {
    fail('Could not determine changed files from origin/main..HEAD and working tree fallback');
    return [];
  }
}

function fileStatusMap() {
  try {
    const out = execSync('git diff --name-status origin/main..HEAD', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
    const map = new Map();
    for (const line of out ? out.split('\n') : []) {
      const parts = line.split(/\s+/);
      const status = parts[0];
      const file = parts[1];
      if (file) map.set(file, status);
    }

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      const worktreeOut = execSync('git diff --name-status', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
      for (const line of worktreeOut ? worktreeOut.split('\n') : []) {
        const parts = line.split(/\s+/);
        const status = parts[0];
        const file = parts[1];
        if (file) map.set(file, status);
      }

      const untrackedOut = execSync('git ls-files --others --exclude-standard', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
      for (const file of untrackedOut ? untrackedOut.split('\n').map(f => f.trim()).filter(Boolean) : []) {
        if (isGeneratedArtifactPath(file)) continue;
        if (!map.has(file)) map.set(file, 'A');
      }
    }

    return map;
  } catch {
    fail('Could not determine changed file status from origin/main..HEAD and working tree fallback');
    return new Map();
  }
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCIHistoricalValidatorRun(ci) {
  return /^\s*run:\s*node\s+scripts\/validate-phase(1|2|30|31|32|33a|33b)-/m.test(ci);
}

function hasPhrase(content, phrase) {
  return content.replace(/\s+/g, ' ').includes(phrase);
}

function requireHeadings(content, headings, label) {
  for (const heading of headings) {
    if (content.includes(heading)) pass(`${label} heading present: ${heading}`);
    else fail(`${label} heading missing: ${heading}`);
  }
}

function requirePhrases(content, phrases, label) {
  for (const phrase of phrases) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) pass(`${label} present: ${phrase}`);
    else fail(`${label} missing: ${phrase}`);
  }
}

function requireAnyPhrase(content, phrases, label) {
  for (const phrase of phrases) {
    if (content.toLowerCase().includes(phrase.toLowerCase())) {
      pass(`${label} present: ${phrase}`);
      return;
    }
  }
  fail(`${label} missing. Expected one of: ${phrases.join(' | ')}`);
}

console.log('\n[1] Required files');

const REVIEW_DOC = 'docs/testing/phase33c-controlled-limited-beta-prep-review.md';
const SUMMARY_DOC = 'docs/release/phase33c-controlled-limited-beta-prep-review-summary.md';
const SEED_33D = 'docs/planning/phase33d-limited-beta-candidate-release-notes-seed.md';
const VALIDATOR = 'scripts/validate-phase33c-controlled-limited-beta-prep-review.js';
const CI = '.github/workflows/e2e-smoke.yml';

const reviewDoc = requireFile(REVIEW_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed33d = requireFile(SEED_33D);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);

const PHASE33C_DOCS_CONTENT = [reviewDoc, summaryDoc, seed33d].filter(Boolean).join('\n');

console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; run from a repository with origin/main fetched before validation');
}

const validatorFetchExecPattern = /execSync\s*\([^)]*git\s+fetch/s;
if (validatorFetchExecPattern.test(validator)) {
  fail('Validator must not execute internal git fetch');
} else {
  pass('Validator does not execute internal git fetch');
}

console.log('\n[3] Changed files (origin/main..HEAD)');

const changedFiles = getChangedFiles();
const relevantChangedFiles = changedFiles.filter(f => !isGeneratedArtifactPath(f));
const statusMap = fileStatusMap();
const headSha = getGitSha('HEAD');
const originMainSha = getGitSha('origin/main');
const isPostMergeMainContext =
  relevantChangedFiles.length === 0 &&
  headSha !== null &&
  originMainSha !== null &&
  headSha === originMainSha;

pass(`Changed files detected: ${relevantChangedFiles.length}`);
if (isPostMergeMainContext) {
  pass('Post-merge main context detected; exact changed-file checks skipped and content guardrails enforced');
}

const ALLOWED_NEW = new Set([REVIEW_DOC, SUMMARY_DOC, SEED_33D, VALIDATOR]);
const ALLOWED_MODIFIED = new Set([CI]);
const EXACT_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

if (!isPostMergeMainContext) {
  const actual = new Set(relevantChangedFiles);
  for (const f of relevantChangedFiles) {
    if (EXACT_ALLOWED.has(f)) {
      pass(`Allowed changed file: ${f}`);
    } else {
      fail(`Unexpected changed file: ${f}`);
    }
  }

  for (const f of EXACT_ALLOWED) {
    if (actual.has(f)) {
      pass(`Expected changed file present: ${f}`);
    } else {
      fail(`Expected changed file missing from origin/main..HEAD diff: ${f}`);
    }
  }

  for (const f of ALLOWED_NEW) {
    const status = statusMap.get(f);
    if (status === 'A') {
      pass(`Expected new file status A: ${f}`);
    } else {
      fail(`Expected new file must be added in Phase 33C: ${f} (status: ${status || 'missing'})`);
    }
  }

  const workflowStatus = statusMap.get(CI);
  if (workflowStatus === 'M') {
    pass('Workflow is the only expected modified existing file');
  } else {
    fail(`Workflow should be modified with status M (status: ${workflowStatus || 'missing'})`);
  }
}

console.log('\n[4] Forbidden file categories');

const FORBIDDEN_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^sw\.js$/,
  /^boot-guard\.js$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES\.md$/,
  /^RELEASE_NOTES_V2\.md$/,
  /^docs\/testing\/phase(30|31|32|33a|33b)/,
  /^docs\/release\/phase(30|31|32|33a|33b)/,
  /^docs\/planning\/phase(30|31|32|33a|33b)/,
];

for (const f of relevantChangedFiles) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(f)) {
      fail(`Forbidden file or area changed: ${f}`);
    }
  }
  if (/^scripts\/validate-phase/.test(f) && f !== VALIDATOR) {
    fail(`Prior phase validator modified: ${f}`);
  }
}
pass('Forbidden file category check complete');

console.log('\n[5] CI workflow checks');

if (ci) {
  if (ci.includes('actions/checkout@v4')) pass('CI uses actions/checkout@v4');
  else fail('CI must use actions/checkout@v4');

  if (ci.includes('fetch-depth: 0')) pass('CI uses fetch-depth: 0');
  else fail('CI must use fetch-depth: 0');

  const forbiddenFetch = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (ci.includes(forbiddenFetch)) fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  else pass('CI does not include forbidden shell git fetch step');

  if (/for\s+\w+\s+in\s+scripts\/validate-\*/.test(ci) || /scripts\/validate-\*\.js/.test(ci)) {
    fail('CI must not include a full historical validator glob chain');
  } else {
    pass('CI does not include a full historical validator glob chain');
  }

  if (ci.includes('continue-on-error: true')) fail('CI must not have continue-on-error: true');
  else pass('CI does not have continue-on-error: true');

  if (includesCIActiveRun(ci, 'validate-phase33c-controlled-limited-beta-prep-review.js')) {
    pass('CI registers active Phase 33C validator');
  } else {
    fail('CI must register active Phase 33C validator');
  }

  if (includesCIHistoricalValidatorRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 33C blockers');
  } else {
    pass('Prior phase validators are not active Phase 33C blockers');
  }
}

console.log('\n[6] Required Phase 33C tokens');

const REQUIRED_TOKENS = [
  'PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_STATUS: COMPLETED_CONTROLLED_PREP_REVIEW',
  'PHASE33C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33C_REVIEW_SCOPE: CONTROLLED_LIMITED_BETA_PREP_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33C_LIMITATION_REVIEW_STATUS: LIMITATIONS_DISCLOSURE_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (PHASE33C_DOCS_CONTENT.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES',
  'NEEDS_PREP_REWORK',
  'HOLD_CONTROLLED_LIMITED_BETA_PREP_REVIEW',
];

let decisionValue = null;
for (const decision of ALLOWED_DECISIONS) {
  if (PHASE33C_DOCS_CONTENT.includes(`${DECISION_PREFIX} ${decision}`)) {
    decisionValue = decision;
    pass(`Decision token present: ${DECISION_PREFIX} ${decision}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Decision token missing or invalid. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);
}

console.log('\n[8] Review doc headings, table columns, and rows');

const REQUIRED_REVIEW_HEADINGS = [
  '# Phase 33C — Controlled Limited Beta Prep Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33B',
  '## Review method',
  '## Controlled limited beta prep review table',
  '## Participant boundary review',
  '## Limitation disclosure checklist review',
  '## No public production wording review',
  '## No Beta Ready wording review',
  '## No data-loss guarantee wording review',
  '## No cloud/sync/backend/account/auth claim review',
  '## Restore and adapter follow-up review',
  '## Stress and rollback follow-up review',
  '## Data Safety UX internal-only status review',
  '## Release/PR note template review',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 33C supports',
  '## What Phase 33C does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

requireHeadings(reviewDoc, REQUIRED_REVIEW_HEADINGS, 'Review doc');

const REQUIRED_TABLE_COLUMNS = [
  'Review surface',
  'Phase 33B input',
  'Review finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

requirePhrases(reviewDoc, REQUIRED_TABLE_COLUMNS, 'Review table column');

const REQUIRED_REVIEW_ROWS = [
  'limited beta participant boundary',
  'limitation disclosure checklist',
  'no public production wording',
  'no Beta Ready wording',
  'no data-loss guarantee wording',
  'no cloud/sync/backend/account/auth claim',
  'restore/adapter blocked-default-off follow-up',
  'stress/rollback follow-up',
  'Data Safety UX internal-only status',
  'release/PR note template for controlled limited beta candidate',
  'Phase 33D limited beta candidate release notes',
];

requirePhrases(reviewDoc, REQUIRED_REVIEW_ROWS, 'Review row');

requireAnyPhrase(
  reviewDoc,
  [
    'avoids Beta Ready/public production/data-loss guarantee/restore execution/cloud/sync/backend claims',
    'The template avoids: - Beta Ready / public production / data-loss guarantee / restore execution claims. - Cloud/sync/backend/account/auth claims.',
    'template avoids all prohibited claims',
  ],
  'Release/PR note template avoided-claims boundary',
);

console.log('\n[9] Release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 33C — Controlled Limited Beta Prep Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

requireHeadings(summaryDoc, REQUIRED_SUMMARY_HEADINGS, 'Summary');

console.log('\n[10] Phase 33D seed');

const REQUIRED_33D_HEADINGS = [
  '# Phase 33D — Limited Beta Candidate Release Notes Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33C',
  '## Release notes constraints',
  '## Required release-note surfaces',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

requireHeadings(seed33d, REQUIRED_33D_HEADINGS, 'Phase 33D seed');

const REQUIRED_33D_DECISIONS = [
  'HOLD_LIMITED_BETA_CANDIDATE_RELEASE_NOTES',
  'NEEDS_RELEASE_NOTES_REWORK',
  'PASS_TO_PHASE33E_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_REVIEW',
];

requirePhrases(seed33d, REQUIRED_33D_DECISIONS, 'Phase 33D decision option');

const REQUIRED_RELEASE_NOTE_SURFACES = [
  'controlled limited beta candidate release note',
  'current readiness boundary',
  'limitation disclosure',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'no cloud/sync/backend/account/auth claim',
  'Data Safety UX internal-only status',
  'follow-up limitations section',
];

requirePhrases(seed33d, REQUIRED_RELEASE_NOTE_SURFACES, 'Phase 33D release-note surface');

const SEPARATE_33D = 'Phase 33D is a separate release-notes preparation gate and is not automatically approved.';
if (hasPhrase(seed33d, SEPARATE_33D)) pass('Phase 33D is framed as a separate release-notes gate');
else fail(`Phase 33D seed must state: ${SEPARATE_33D}`);

console.log('\n[11] Required next-phase and boundary statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 33D — Limited Beta Candidate Release Notes',
  'Phase 33D is a separate release-notes preparation gate and is not automatically approved.',
  'Phase 33C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 33C does not approve BETA_READY.',
  'Phase 33C does not approve public production readiness.',
  'Phase 33C does not approve guaranteed data-loss prevention.',
  'Phase 33C does not approve restore execution.',
  'Phase 33C does not approve production restore rehearsal.',
  'Phase 33C does not approve real learner data restore rehearsal.',
  'Phase 33C does not approve runtime backup/export/restore behavior changes.',
  'Phase 33C does not approve backup file format changes.',
  'Phase 33C does not approve restore overwrite behavior changes.',
  'Phase 33C does not approve storage migration.',
  'Phase 33C does not approve sync/cloud/account/auth/backend.',
  'Phase 33C does not approve telemetry/analytics.',
  'Phase 33C does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 33C does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 33C does not approve limited settings visibility to ordinary users.',
];

for (const statement of REQUIRED_NEXT_PHASE_STATEMENTS) {
  if (PHASE33C_DOCS_CONTENT.includes(statement)) pass(`Required statement present: ${statement}`);
  else fail(`Required statement missing: ${statement}`);
}

console.log('\n[12] Forbidden approval claims');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'Beta Ready is approved',
  'public production readiness approved',
  'broad beta release approved',
  'broad beta release is approved',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'guaranteed data-loss prevention is confirmed',
  'data-loss guarantee confirmed',
  'restore execution approved',
  'restore is safe for production',
  'production restore rehearsal approved',
  'real learner data restore rehearsal confirmed',
  'sync/cloud/account/auth/backend approved',
  'telemetry approved',
  'BYOC approved',
  'WebDAV approved',
  'P2P approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 33C approved',
  'Phase 33C is approved',
  'Phase 33C automatically approved',
  'Phase 33D approved',
  'Phase 33D is approved',
  'Phase 33D automatically approved',
  'PASS_TO_PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES approves Beta Ready',
  'PASS_TO_PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES means public production is approved',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (PHASE33C_DOCS_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain forbidden approval phrase: ${phrase}`);
  } else {
    pass(`Forbidden approval phrase absent: ${phrase}`);
  }
}

console.log('\n[13] Limitations carried forward');

const REQUIRED_LIMITATION_PHRASE_GROUPS = [
  [
    'restore/adapter blocked-default-off follow-up required',
    'Restore/adapter blocked-default-off follow-up',
    'restore/adapter blocked-default-off lanes',
  ],
  [
    'stress evidence follow-up required',
    'Follow-up required: production-representative stress evidence run',
    'stress/rollback evidence gaps',
  ],
  [
    'rollback/removal follow-up required',
    'Follow-up required: live rollback evidence run against representative data',
    'stress/rollback evidence gaps',
  ],
  ['no real learner data evidence'],
  ['no public production readiness evidence'],
  ['no data-loss guarantee proof', 'No guaranteed data-loss prevention proof'],
  ['Data Safety UX remains internal-only'],
  ['no sync/cloud/backend/auth/account', 'No sync/cloud/account/auth/backend evidence present or intended'],
  ['LIMITATIONS_DISCLOSURE_REVIEWED_AND_CARRIED_FORWARD'],
];

for (const phrases of REQUIRED_LIMITATION_PHRASE_GROUPS) {
  requireAnyPhrase(PHASE33C_DOCS_CONTENT, phrases, 'Limitation carried forward');
}

console.log('\n[14] Package and generated artifact checks');

for (const f of ['package.json', 'package-lock.json']) {
  if (relevantChangedFiles.includes(f)) fail(`Package file changed: ${f}`);
  else pass(`Package file not changed: ${f}`);
}

for (const artifact of GENERATED_ARTIFACTS) {
  if (fs.existsSync(path.join(ROOT, artifact))) warn(`Generated artifact present and should be cleaned before handoff: ${artifact}`);
  else pass(`Generated artifact absent: ${artifact}`);
}

console.log('\n' + '='.repeat(72));
console.log('PHASE33C VALIDATOR RESULT');
console.log('='.repeat(72));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_STATUS: COMPLETED_CONTROLLED_PREP_REVIEW');
  console.log('PHASE33C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_DECISION: ${decisionValue}`);
  console.log('PHASE33C_REVIEW_SCOPE: CONTROLLED_LIMITED_BETA_PREP_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE33C_LIMITATION_REVIEW_STATUS: LIMITATIONS_DISCLOSURE_REVIEWED_AND_CARRIED_FORWARD');
  console.log('PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
