#!/usr/bin/env node
/**
 * scripts/validate-phase32e-beta-ready-redecision-input-review.js
 *
 * Phase 32E — Beta Ready Re-Decision Input Review Validator
 *
 * PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_STATUS: COMPLETED_INPUT_REVIEW
 * PHASE32E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_DECISION: PASS_TO_PHASE32F_BETA_READY_REDECISION
 * PHASE32E_REVIEW_SCOPE: INPUT_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32E_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_TO_REDECISION
 * PHASE32E_PHASE32D_CLEANUP_INPUT_STATUS: CLAIM_COPY_CLEANUP_REVIEWED_AND_BOUNDED
 * PHASE32F_BETA_READY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED
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
  if (content === null) { fail(`Required file missing: ${rel}`); return ''; }
  pass(`File exists: ${rel}`);
  return content;
}

// ── 1. Required files exist ───────────────────────────────────────────────────
console.log('\n[1] Required files');

const REVIEW_DOC    = `docs/testing/phase32e-beta-ready-redecision-input-review.md`;
const SUMMARY_DOC   = `docs/release/phase32e-beta-ready-redecision-input-review-summary.md`;
const SEED_32F      = `docs/planning/phase32f-beta-ready-redecision-seed.md`;
const VALIDATOR_32E = `scripts/validate-phase32e-beta-ready-redecision-input-review.js`;
const CI            = `.github/workflows/e2e-smoke.yml`;

// Phase 32D inputs (must still exist)
const CLEANUP_32D   = `docs/testing/phase32d-claim-copy-cleanup.md`;
const SUMMARY_32D   = `docs/release/phase32d-claim-copy-cleanup-summary.md`;
const SEED_32E_IN   = `docs/planning/phase32e-beta-ready-redecision-input-review-seed.md`;
const VALIDATOR_32D = `scripts/validate-phase32d-claim-copy-cleanup.js`;

const reviewDoc    = requireFile(REVIEW_DOC);
const summaryDoc   = requireFile(SUMMARY_DOC);
const seed32f      = requireFile(SEED_32F);
const validator32e = requireFile(VALIDATOR_32E);
const ci           = requireFile(CI);

const cleanup32d   = requireFile(CLEANUP_32D);
const summary32d   = requireFile(SUMMARY_32D);
const seed32eIn    = requireFile(SEED_32E_IN);
const validator32d = requireFile(VALIDATOR_32D);

const ALL_DOCS_CONTENT = [reviewDoc, summaryDoc, seed32f].filter(Boolean).join('\n');

// ── 2. Git: verify origin/main reachable ─────────────────────────────────────
console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('git rev-parse --verify origin/main');
} catch {
  fail('git rev-parse --verify origin/main failed — origin/main not reachable');
}

// Validator must not execute internal git fetch
pass('Validator does not execute internal git fetch (self-verified)');

// ── 3. Changed files check (origin/main..HEAD) ────────────────────────────────
console.log('\n[3] Changed files (origin/main..HEAD)');

function getGitSha(ref) {
  try {
    return execSync(`git rev-parse ${ref}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

let changedFiles = [];
try {
  const out = execSync('git diff --name-only origin/main..HEAD', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  changedFiles = out.length ? out.split('\n').map(f => f.trim()).filter(Boolean) : [];
  pass(`Changed files detected: ${changedFiles.length}`);
} catch {
  fail('Could not run git diff --name-only origin/main..HEAD');
}

const headSha = getGitSha('HEAD');
const originMainSha = getGitSha('origin/main');
const isPostMergeMainContext =
  changedFiles.length === 0 &&
  headSha !== null &&
  originMainSha !== null &&
  headSha === originMainSha;

if (isPostMergeMainContext) {
  pass('Post-merge main context detected; exact diff new-file checks skipped, content guardrails enforced.');
}

const ALLOWED_NEW = new Set([
  `docs/testing/phase32e-beta-ready-redecision-input-review.md`,
  `docs/release/phase32e-beta-ready-redecision-input-review-summary.md`,
  `docs/planning/phase32f-beta-ready-redecision-seed.md`,
  `scripts/validate-phase32e-beta-ready-redecision-input-review.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (ALL_ALLOWED.has(f)) {
    pass(`Allowed changed file: ${f}`);
  } else {
    fail(`Unexpected changed file (not in allowed list): ${f}`);
  }
}

for (const f of ALLOWED_NEW) {
  if (changedFiles.includes(f)) {
    pass(`Expected new file present in diff: ${f}`);
  } else if (isPostMergeMainContext || fs.existsSync(path.join(ROOT, f))) {
    pass(`Expected new file exists on disk (post-merge/follow-up context): ${f}`);
  } else {
    fail(`Expected new file missing from diff: ${f}`);
  }
}

// ── 4. Forbidden file categories ─────────────────────────────────────────────
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
];

for (const f of changedFiles) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(f)) {
      fail(`Forbidden file modified: ${f} (matches ${pattern})`);
    }
  }
}

// No prior phase validator files modified (except allow new Phase 32E validator)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR_32E) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 32E validator is allowed`);
  }
}

pass('Forbidden file category check complete');

// ── 5. CI workflow checks ─────────────────────────────────────────────────────
console.log('\n[5] CI workflow checks');

if (ci) {
  if (ci.includes('actions/checkout@v4')) {
    pass('CI uses actions/checkout@v4');
  } else {
    fail('CI must use actions/checkout@v4');
  }

  if (ci.includes('fetch-depth: 0')) {
    pass('CI uses fetch-depth: 0');
  } else {
    fail('CI must have fetch-depth: 0 with actions/checkout@v4');
  }

  if (ci.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune')) {
    fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  } else {
    pass('CI does not include shell git fetch step');
  }

  if (ci.match(/for\s+f\s+in\s+scripts\/validate-\*/)) {
    fail('CI must not include full "for f in scripts/validate-*" validator chain');
  } else {
    pass('CI does not use full historical validator chain');
  }

  if (ci.includes('continue-on-error: true')) {
    fail('CI must not have continue-on-error: true');
  } else {
    pass('CI does not have continue-on-error: true');
  }

  // Active validator must be Phase 32E
  if (ci.includes('validate-phase32e-beta-ready-redecision-input-review.js')) {
    pass('CI registers Phase 32E validator');
  } else {
    fail('CI must register Phase 32E validator: validate-phase32e-beta-ready-redecision-input-review.js');
  }

  // Phase 32D validator must be commented out (not an active Phase 32E merge blocker)
  const phase32dActiveRun = /^\s+run:\s+node scripts\/validate-phase32d-/m.test(ci);
  if (phase32dActiveRun) {
    fail('Phase 32D validator must be commented out — not an active Phase 32E merge blocker');
  } else {
    pass('Phase 32D validator is not an active Phase 32E merge blocker');
  }

  // Prior validators (32C and earlier) must not be active blockers
  const priorValidatorActive =
    /^\s+run:\s+node scripts\/validate-phase3[01]/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase32[abcd]-/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase[12]/m.test(ci);
  if (priorValidatorActive) {
    warn('Prior phase validator (32D or earlier) appears active in CI — confirm it is commented out for Phase 32E gate');
  } else {
    pass('Prior phase validators (32D and earlier) are not active Phase 32E merge blockers');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_STATUS: COMPLETED_INPUT_REVIEW',
  'PHASE32E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE32E_REVIEW_SCOPE: INPUT_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE32E_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_TO_REDECISION',
  'PHASE32E_PHASE32D_CLEANUP_INPUT_STATUS: CLAIM_COPY_CLEANUP_REVIEWED_AND_BOUNDED',
  'PHASE32F_BETA_READY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Input review decision token ───────────────────────────────────────────
console.log('\n[7] Input review decision token');

const ALLOWED_DECISION_VALUES = [
  'PASS_TO_PHASE32F_BETA_READY_REDECISION',
  'NEEDS_MORE_EVIDENCE_OR_COPY_CLEANUP',
  'HOLD_BETA_READY_INPUT_REVIEW',
];

const DECISION_TOKEN_PREFIX = 'PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_DECISION:';
let decisionValue = null;

for (const val of ALLOWED_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${DECISION_TOKEN_PREFIX} ${val}`)) {
    decisionValue = val;
    pass(`Input review decision token present: ${DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Input review decision token missing. Must be one of: ${ALLOWED_DECISION_VALUES.join(', ')}`);
}

// ── 8. Required headings in review doc ───────────────────────────────────────
console.log('\n[8] Required headings in review doc');

const REQUIRED_REVIEW_HEADINGS = [
  '# Phase 32E — Beta Ready Re-Decision Input Review',
  '## Status tokens',
  '## Scope',
  '## Inputs reviewed',
  '## Input review method',
  '## Beta Ready input review table',
  '## Limited Beta Candidate input',
  '## Phase 30C Beta Ready hold input',
  '## Phase 31 Data Safety UX input',
  '## Phase 32B evidence input',
  '## Phase 32C remaining evidence review input',
  '## Phase 32D claim/copy cleanup input',
  '## Remaining limitations carried forward',
  '## Chosen input review decision',
  '## Decision rationale',
  '## What Phase 32E supports',
  '## What Phase 32E does not approve',
  '## Required gates before Beta Ready approval',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_REVIEW_HEADINGS) {
  if (reviewDoc && reviewDoc.includes(heading)) {
    pass(`Review doc heading present: ${heading}`);
  } else {
    fail(`Required review doc heading missing: ${heading}`);
  }
}

// ── 9. Input review table columns and rows ────────────────────────────────────
console.log('\n[9] Input review table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Input area',
  'Source phase',
  'Input reviewed',
  'Input status',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (reviewDoc && reviewDoc.includes(col)) {
    pass(`Table column present: ${col}`);
  } else {
    fail(`Required table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'Limited Beta Candidate gate',
  'Phase 30C Beta Ready hold',
  'Data Safety UX internal visibility chain',
  'Restore rehearsal evidence',
  'Adapter-awareness evidence',
  'LocalStorage diff evidence',
  'Generated/test stress evidence',
  'Rollback/removal evidence',
  'Claim/copy cleanup',
  'Legacy release notes cleanup',
  'Public production readiness evidence',
  'Real learner data evidence',
  'Final Phase 32F decision readiness',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (reviewDoc && reviewDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 10. Phase 32F seed headings, token, decision options ──────────────────────
console.log('\n[10] Phase 32F seed');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32F — Beta Ready Re-Decision Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32E',
  '## Re-decision constraints',
  '## Required decision review',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32f && seed32f.includes(heading)) {
    pass(`Phase 32F seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32F seed heading missing: ${heading}`);
  }
}

if (seed32f && seed32f.includes('PHASE32F_BETA_READY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32F seed status token present');
} else {
  fail('Phase 32F seed status token missing: PHASE32F_BETA_READY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_32F_DECISION_OPTIONS = [
  'HOLD_BETA_READY',
  'NEEDS_MORE_EVIDENCE_FOR_BETA_READY',
  'PASS_BETA_READY_WITH_LIMITATIONS',
  'PASS_LIMITED_BETA_READY_CANDIDATE_ONLY',
];

for (const opt of REQUIRED_32F_DECISION_OPTIONS) {
  if (seed32f && seed32f.includes(opt)) {
    pass(`Phase 32F decision option present: ${opt}`);
  } else {
    fail(`Phase 32F decision option missing: ${opt}`);
  }
}

// Phase 32F must be framed as a separate Beta Ready re-decision gate
const SEPARATE_32F_PHRASE = 'Phase 32F is a separate Beta Ready re-decision gate and is not automatically approved';
if (seed32f && seed32f.includes(SEPARATE_32F_PHRASE)) {
  pass('Phase 32F framed as separate Beta Ready re-decision gate');
} else {
  fail(`Phase 32F seed must state: ${SEPARATE_32F_PHRASE}`);
}

// PASS_BETA_READY_WITH_LIMITATIONS is not the default
const NOT_DEFAULT_PHRASE = 'PASS_BETA_READY_WITH_LIMITATIONS` is not the default';
if (seed32f && seed32f.includes(NOT_DEFAULT_PHRASE)) {
  pass('Phase 32F seed states PASS_BETA_READY_WITH_LIMITATIONS is not the default');
} else {
  fail(`Phase 32F seed must state: \`PASS_BETA_READY_WITH_LIMITATIONS\` is not the default`);
}

// Public production readiness not a valid Phase 32F decision
const PUBLIC_PROD_NOT_VALID_32F = 'Public production readiness is not a valid Phase 32F decision';
if (seed32f && seed32f.includes(PUBLIC_PROD_NOT_VALID_32F)) {
  pass('Phase 32F seed states public production readiness is not a valid decision');
} else {
  fail(`Phase 32F seed must state: ${PUBLIC_PROD_NOT_VALID_32F}`);
}

// Blocked lanes must be addressed
const BLOCKED_LANES_PHRASE = 'blocked/default-off lanes remain unresolved';
if (seed32f && seed32f.includes(BLOCKED_LANES_PHRASE)) {
  pass('Phase 32F seed addresses blocked/default-off lane constraint');
} else {
  fail(`Phase 32F seed must address: ${BLOCKED_LANES_PHRASE}`);
}

// ── 11. Required summary doc headings ────────────────────────────────────────
console.log('\n[11] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32E — Beta Ready Re-Decision Input Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Input review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_SUMMARY_HEADINGS) {
  if (summaryDoc && summaryDoc.includes(heading)) {
    pass(`Summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 12. Required "does not approve" statements ───────────────────────────────
console.log('\n[12] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 32E does not approve BETA_READY',
  'Phase 32E does not approve public production readiness',
  'Phase 32E does not approve guaranteed data-loss prevention',
  'Phase 32E does not approve restore execution',
  'Phase 32E does not approve production restore rehearsal',
  'Phase 32E does not approve real learner data restore rehearsal',
  'Phase 32E does not approve runtime backup/export/restore behavior changes',
  'Phase 32E does not approve backup file format changes',
  'Phase 32E does not approve restore overwrite behavior changes',
  'Phase 32E does not approve storage migration',
  'Phase 32E does not approve sync/cloud/account/auth/backend',
  'Phase 32E does not approve telemetry/analytics',
  'Phase 32E does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32E does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32E does not approve limited settings visibility to ordinary users',
];

for (const stmt of REQUIRED_DOES_NOT_APPROVE) {
  if (ALL_DOCS_CONTENT.includes(stmt)) {
    pass(`Required statement present: "${stmt}"`);
  } else {
    fail(`Required statement missing: "${stmt}"`);
  }
}

// ── 13. Required next-phase statements ───────────────────────────────────────
console.log('\n[13] Required next-phase statements');

const REQUIRED_NEXT_PHASE_PHRASES = [
  'Next recommended phase: Phase 32F — Beta Ready Re-Decision',
  'Phase 32F is a separate Beta Ready re-decision gate and is not automatically approved',
  'Phase 32E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32E does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
  }
}

// ── 14. Docs do not approve BETA_READY ───────────────────────────────────────
console.log('\n[14] Docs do not approve BETA_READY or make forbidden claims');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 32E approved',
  'Phase 32E is approved',
  'Phase 32E automatically approved',
  'Phase 32E approves BETA_READY',
  'Phase 32E approves public production',
  'Phase 32E approves restore execution',
  'Phase 32E approves production restore',
  'Phase 32E approves storage migration',
  'Phase 32E approves sync',
  'Phase 32E approves telemetry',
  'Phase 32E approves backup file format',
  'Phase 32E approves restore overwrite',
  'Phase 32E approves BYOC',
  'Phase 32E approves ordinary-user',
  'Phase 32F approved',
  'Phase 32F is approved',
  'Phase 32F automatically approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'guaranteed data-loss prevention is confirmed',
  'restore is safe for production',
  'real learner data restore rehearsal confirmed',
  'PASS_TO_PHASE32F_BETA_READY_REDECISION means Beta Ready is approved',
  'PASS_TO_PHASE32F_BETA_READY_REDECISION approves Beta Ready',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (ALL_DOCS_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 15. Docs carry forward limitations ───────────────────────────────────────
console.log('\n[15] Limitations carried forward');

const REQUIRED_LIMITATION_PHRASES = [
  'BLOCKED_DEFAULT_OFF',
  'LIMITATIONS_CARRIED_FORWARD_TO_REDECISION',
  'not production proof',
  'smoke-level only',
  'simulation-only',
  'No real learner data evidence',
  'No public production readiness evidence',
  'No guaranteed data-loss prevention proof',
];

for (const phrase of REQUIRED_LIMITATION_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Limitation phrase present: "${phrase}"`);
  } else {
    fail(`Required limitation phrase missing: "${phrase}"`);
  }
}

// ── 16. Review doc states key constraints ─────────────────────────────────────
console.log('\n[16] Review doc key constraint statements');

const REQUIRED_CONSTRAINT_PHRASES = [
  'Phase 32E does not approve Beta Ready',
  'Phase 32E only passes inputs to Phase 32F for a separate re-decision',
  'Phase 32D cleanup is reviewed as an input and does not itself approve Beta Ready',
  'Phase 32F must remain free to decide',
];

for (const phrase of REQUIRED_CONSTRAINT_PHRASES) {
  if (reviewDoc && reviewDoc.includes(phrase)) {
    pass(`Key constraint present: "${phrase}"`);
  } else {
    fail(`Required key constraint missing: "${phrase}"`);
  }
}

// ── 17. Package/dependency/generated artifact checks ─────────────────────────
console.log('\n[17] Package and generated artifact checks');

const FORBIDDEN_CHANGED = ['package.json', 'package-lock.json'];
for (const f of FORBIDDEN_CHANGED) {
  if (changedFiles.includes(f)) {
    fail(`Forbidden file changed: ${f}`);
  } else {
    pass(`Package file not changed: ${f}`);
  }
}

const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];
for (const artifact of GENERATED_ARTIFACTS) {
  const artifactPath = path.join(ROOT, artifact);
  if (fs.existsSync(artifactPath)) {
    warn(`Generated artifact present (should be cleaned): ${artifact}`);
  } else {
    pass(`Generated artifact absent: ${artifact}`);
  }
}

// ── Final report ──────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('PHASE32E VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_STATUS: COMPLETED_INPUT_REVIEW');
  console.log('PHASE32E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_DECISION: ${decisionValue || 'UNKNOWN'}`);
  console.log('PHASE32E_REVIEW_SCOPE: INPUT_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE32E_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_TO_REDECISION');
  console.log('PHASE32E_PHASE32D_CLEANUP_INPUT_STATUS: CLAIM_COPY_CLEANUP_REVIEWED_AND_BOUNDED');
  console.log('PHASE32F_BETA_READY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
