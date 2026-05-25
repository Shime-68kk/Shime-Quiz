#!/usr/bin/env node
/**
 * Phase 33B — Controlled Limited Beta Prep Validator
 *
 * PHASE33B_CONTROLLED_LIMITED_BETA_PREP_STATUS: COMPLETED_CONTROLLED_LIMITED_BETA_PREP
 * PHASE33B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33B_CONTROLLED_LIMITED_BETA_PREP_DECISION: PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW
 * PHASE33B_PREP_SCOPE: CONTROLLED_LIMITED_BETA_PREP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33B_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_DISCLOSED_FOR_CONTROLLED_PREP
 * PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ERRORS = [];
const WARNINGS = [];

function fail(msg) { ERRORS.push(msg); }
function warn(msg) { WARNINGS.push(msg); }
function pass(msg) { console.log(`  PASS  ${msg}`); }

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
    return out ? out.split('\n').map(f => f.trim()).filter(Boolean) : [];
  } catch {
    fail('Could not run git diff --name-only origin/main..HEAD');
    return [];
  }
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCIHistoricalRun(ci) {
  return /^\s*run:\s*node\s+scripts\/validate-phase(1|2|30|31|32|33a)-/m.test(ci);
}

function hasPhrase(content, phrase) {
  return content.replace(/\s+/g, ' ').includes(phrase);
}

function fileStatusMap() {
  try {
    const out = execSync('git diff --name-status origin/main..HEAD', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
    const map = new Map();
    if (!out) return map;
    for (const line of out.split('\n')) {
      const [status, file] = line.split(/\s+/, 2);
      if (file) map.set(file, status);
    }
    return map;
  } catch {
    fail('Could not run git diff --name-status origin/main..HEAD');
    return new Map();
  }
}

console.log('\n[1] Required files');

const PREP_DOC = 'docs/testing/phase33b-controlled-limited-beta-prep.md';
const SUMMARY_DOC = 'docs/release/phase33b-controlled-limited-beta-prep-summary.md';
const SEED_33C = 'docs/planning/phase33c-controlled-limited-beta-prep-review-seed.md';
const VALIDATOR = 'scripts/validate-phase33b-controlled-limited-beta-prep.js';
const CI = '.github/workflows/e2e-smoke.yml';

const PHASE33A_DOC = 'docs/testing/phase33a-limited-beta-candidate-stabilization.md';
const PHASE33A_SUMMARY = 'docs/release/phase33a-limited-beta-candidate-stabilization-summary.md';
const PHASE33B_SEED = 'docs/planning/phase33b-controlled-limited-beta-prep-seed.md';

const prepDoc = requireFile(PREP_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed33c = requireFile(SEED_33C);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const phase33aDoc = requireFile(PHASE33A_DOC);
const phase33aSummary = requireFile(PHASE33A_SUMMARY);
const phase33bSeed = requireFile(PHASE33B_SEED);

const PHASE33B_DOCS_CONTENT = [prepDoc, summaryDoc, seed33c].filter(Boolean).join('\n');
const ALL_RELEVANT_CONTENT = [PHASE33B_DOCS_CONTENT, phase33aDoc, phase33aSummary, phase33bSeed].filter(Boolean).join('\n');

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
const statusMap = fileStatusMap();
const headSha = getGitSha('HEAD');
const originMainSha = getGitSha('origin/main');
const isPostMergeMainContext =
  changedFiles.length === 0 &&
  headSha !== null &&
  originMainSha !== null &&
  headSha === originMainSha;

pass(`Changed files detected: ${changedFiles.length}`);
if (isPostMergeMainContext) {
  pass('Post-merge main context detected; exact diff set skipped and content guardrails enforced');
}

const ALLOWED_NEW = new Set([PREP_DOC, SUMMARY_DOC, SEED_33C, VALIDATOR]);
const ALLOWED_MODIFIED = new Set([CI]);
const EXACT_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

if (!isPostMergeMainContext) {
  const actual = new Set(changedFiles);
  for (const f of changedFiles) {
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
      fail(`Expected new file must be added in this phase: ${f} (status: ${status || 'missing'})`);
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
  /^docs\/testing\/phase33a-/,
  /^docs\/release\/phase33a-/,
  /^docs\/planning\/phase33a-/,
  /^docs\/testing\/phase32/,
  /^docs\/release\/phase32/,
  /^docs\/planning\/phase32/,
];

for (const f of changedFiles) {
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

  if (includesCIActiveRun(ci, 'validate-phase33b-controlled-limited-beta-prep.js')) {
    pass('CI registers active Phase 33B validator');
  } else {
    fail('CI must register active Phase 33B validator');
  }

  if (includesCIHistoricalRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 33B blockers');
  } else {
    pass('Prior phase validators are not active Phase 33B blockers');
  }
}

console.log('\n[6] Required Phase 33B tokens');

const REQUIRED_TOKENS = [
  'PHASE33B_CONTROLLED_LIMITED_BETA_PREP_STATUS: COMPLETED_CONTROLLED_LIMITED_BETA_PREP',
  'PHASE33B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33B_PREP_SCOPE: CONTROLLED_LIMITED_BETA_PREP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33B_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_DISCLOSED_FOR_CONTROLLED_PREP',
  'PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (PHASE33B_DOCS_CONTENT.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE33B_CONTROLLED_LIMITED_BETA_PREP_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW',
  'NEEDS_PREP_REWORK',
  'HOLD_CONTROLLED_LIMITED_BETA_PREP',
];

let decisionValue = null;
for (const decision of ALLOWED_DECISIONS) {
  if (PHASE33B_DOCS_CONTENT.includes(`${DECISION_PREFIX} ${decision}`)) {
    decisionValue = decision;
    pass(`Decision token present: ${DECISION_PREFIX} ${decision}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Decision token missing or invalid. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);
}

console.log('\n[8] Prep doc headings, table columns, and rows');

const REQUIRED_PREP_HEADINGS = [
  '# Phase 33B — Controlled Limited Beta Prep',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33A',
  '## Prep method',
  '## Controlled limited beta prep table',
  '## Participant boundary',
  '## Limitation disclosure checklist',
  '## No public production wording',
  '## No Beta Ready wording',
  '## No data-loss guarantee wording',
  '## No cloud/sync/backend/account/auth claim',
  '## Restore and adapter follow-up',
  '## Stress and rollback follow-up',
  '## Data Safety UX internal-only status',
  '## Release/PR note template',
  '## Chosen prep decision',
  '## Decision rationale',
  '## What Phase 33B supports',
  '## What Phase 33B does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_PREP_HEADINGS) {
  if (prepDoc.includes(heading)) pass(`Prep doc heading present: ${heading}`);
  else fail(`Required prep doc heading missing: ${heading}`);
}

const REQUIRED_TABLE_COLUMNS = [
  'Prep surface',
  'Input from Phase 33A',
  'Prep action',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (prepDoc.includes(col)) pass(`Prep table column present: ${col}`);
  else fail(`Required prep table column missing: ${col}`);
}

const REQUIRED_PREP_ROWS = [
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
  'Phase 33C prep review',
];

for (const row of REQUIRED_PREP_ROWS) {
  if (prepDoc.toLowerCase().includes(row.toLowerCase())) pass(`Prep row present: ${row}`);
  else fail(`Required prep row missing: ${row}`);
}

console.log('\n[9] Release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 33B — Controlled Limited Beta Prep Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Prep result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations disclosed',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_SUMMARY_HEADINGS) {
  if (summaryDoc.includes(heading)) pass(`Summary heading present: ${heading}`);
  else fail(`Required summary heading missing: ${heading}`);
}

console.log('\n[10] Phase 33C seed');

const REQUIRED_33C_HEADINGS = [
  '# Phase 33C — Controlled Limited Beta Prep Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33B',
  '## Review constraints',
  '## Required review surfaces',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_33C_HEADINGS) {
  if (seed33c.includes(heading)) pass(`Phase 33C seed heading present: ${heading}`);
  else fail(`Required Phase 33C seed heading missing: ${heading}`);
}

if (seed33c.includes('PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 33C seed status token present');
} else {
  fail('Phase 33C seed status token missing');
}

const REQUIRED_33C_DECISIONS = [
  'HOLD_CONTROLLED_LIMITED_BETA_PREP_REVIEW',
  'NEEDS_PREP_REWORK',
  'PASS_TO_PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES',
];

for (const opt of REQUIRED_33C_DECISIONS) {
  if (seed33c.includes(opt)) pass(`Phase 33C decision option present: ${opt}`);
  else fail(`Phase 33C decision option missing: ${opt}`);
}

const SEPARATE_33C = 'Phase 33C is a separate controlled limited beta prep review gate and is not automatically approved';
if (hasPhrase(seed33c, SEPARATE_33C)) pass('Phase 33C is framed as a separate review gate');
else fail(`Phase 33C seed must state: ${SEPARATE_33C}`);

console.log('\n[11] Required next-phase and boundary statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 33C — Controlled Limited Beta Prep Review',
  'Phase 33C is a separate controlled limited beta prep review gate and is not automatically approved.',
  'Phase 33B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 33B does not approve BETA_READY.',
  'Phase 33B does not approve public production readiness.',
  'Phase 33B does not approve guaranteed data-loss prevention.',
  'Phase 33B does not approve restore execution.',
  'Phase 33B does not approve production restore rehearsal.',
  'Phase 33B does not approve real learner data restore rehearsal.',
  'Phase 33B does not approve runtime backup/export/restore behavior changes.',
  'Phase 33B does not approve backup file format changes.',
  'Phase 33B does not approve restore overwrite behavior changes.',
  'Phase 33B does not approve storage migration.',
  'Phase 33B does not approve sync/cloud/account/auth/backend.',
  'Phase 33B does not approve telemetry/analytics.',
  'Phase 33B does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 33B does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 33B does not approve limited settings visibility to ordinary users.',
];

for (const statement of REQUIRED_NEXT_PHASE_STATEMENTS) {
  if (PHASE33B_DOCS_CONTENT.includes(statement)) pass(`Required statement present: ${statement}`);
  else fail(`Required statement missing: ${statement}`);
}

console.log('\n[12] Forbidden approval claims');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'Beta Ready is approved',
  'public production readiness approved',
  'broad beta release approved',
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
  'Phase 33B approved',
  'Phase 33B is approved',
  'Phase 33B automatically approved',
  'Phase 33C approved',
  'Phase 33C is approved',
  'Phase 33C automatically approved',
  'PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW approves Beta Ready',
  'PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW means public production is approved',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (PHASE33B_DOCS_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain forbidden approval phrase: ${phrase}`);
  } else {
    pass(`Forbidden approval phrase absent: ${phrase}`);
  }
}

console.log('\n[13] Limitations disclosed');

const REQUIRED_LIMITATION_PHRASES = [
  'BLOCKED_DEFAULT_OFF',
  'not production proof',
  'smoke-level only',
  'simulation-only',
  'No real learner data evidence',
  'No public production readiness evidence',
  'No guaranteed data-loss prevention proof',
  'Data Safety UX',
  'internal-only',
  'No sync/cloud/account/auth/backend',
  'Phase 30C Beta Ready hold',
  'LIMITATIONS_DISCLOSED_FOR_CONTROLLED_PREP',
];

for (const phrase of REQUIRED_LIMITATION_PHRASES) {
  if (ALL_RELEVANT_CONTENT.includes(phrase)) pass(`Limitation phrase present: ${phrase}`);
  else fail(`Required limitation phrase missing: ${phrase}`);
}

console.log('\n[14] Package and generated artifact checks');

for (const f of ['package.json', 'package-lock.json']) {
  if (changedFiles.includes(f)) fail(`Package file changed: ${f}`);
  else pass(`Package file not changed: ${f}`);
}

for (const artifact of ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD']) {
  if (fs.existsSync(path.join(ROOT, artifact))) warn(`Generated artifact present and should be cleaned before handoff: ${artifact}`);
  else pass(`Generated artifact absent: ${artifact}`);
}

console.log('\n' + '='.repeat(72));
console.log('PHASE33B VALIDATOR RESULT');
console.log('='.repeat(72));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE33B_CONTROLLED_LIMITED_BETA_PREP_STATUS: COMPLETED_CONTROLLED_LIMITED_BETA_PREP');
  console.log('PHASE33B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE33B_CONTROLLED_LIMITED_BETA_PREP_DECISION: ${decisionValue}`);
  console.log('PHASE33B_PREP_SCOPE: CONTROLLED_LIMITED_BETA_PREP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE33B_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_DISCLOSED_FOR_CONTROLLED_PREP');
  console.log('PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
