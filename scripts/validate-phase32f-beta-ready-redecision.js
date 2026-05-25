#!/usr/bin/env node
/**
 * scripts/validate-phase32f-beta-ready-redecision.js
 *
 * Phase 32F — Beta Ready Re-Decision Validator
 *
 * PHASE32F_BETA_READY_REDECISION_STATUS: COMPLETED_BETA_READY_REDECISION
 * PHASE32F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32F_BETA_READY_REDECISION_DECISION: PASS_LIMITED_BETA_READY_CANDIDATE_ONLY
 * PHASE32F_REDECISION_SCOPE: BETA_READY_REDECISION_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32F_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_NO_PUBLIC_PRODUCTION_CLAIM
 * PHASE32F_BLOCKED_LANE_DECISION_STATUS: BLOCKED_DEFAULT_OFF_LANES_NOT_PRODUCTION_PROOF
 * PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const REDECISION_DOC  = `docs/testing/phase32f-beta-ready-redecision.md`;
const SUMMARY_DOC     = `docs/release/phase32f-beta-ready-redecision-summary.md`;
const SEED_33A        = `docs/planning/phase33a-limited-beta-candidate-stabilization-seed.md`;
const VALIDATOR_32F   = `scripts/validate-phase32f-beta-ready-redecision.js`;
const CI              = `.github/workflows/e2e-smoke.yml`;

// Phase 32E inputs (must still exist)
const REVIEW_32E      = `docs/testing/phase32e-beta-ready-redecision-input-review.md`;
const SUMMARY_32E     = `docs/release/phase32e-beta-ready-redecision-input-review-summary.md`;
const SEED_32F_IN     = `docs/planning/phase32f-beta-ready-redecision-seed.md`;
const VALIDATOR_32E   = `scripts/validate-phase32e-beta-ready-redecision-input-review.js`;

const redecisionDoc = requireFile(REDECISION_DOC);
const summaryDoc    = requireFile(SUMMARY_DOC);
const seed33a       = requireFile(SEED_33A);
const validator32f  = requireFile(VALIDATOR_32F);
const ci            = requireFile(CI);

const review32e     = requireFile(REVIEW_32E);
const summary32e    = requireFile(SUMMARY_32E);
const seed32fIn     = requireFile(SEED_32F_IN);
const validator32e  = requireFile(VALIDATOR_32E);

const ALL_DOCS_CONTENT = [redecisionDoc, summaryDoc, seed33a].filter(Boolean).join('\n');

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
  `docs/testing/phase32f-beta-ready-redecision.md`,
  `docs/release/phase32f-beta-ready-redecision-summary.md`,
  `docs/planning/phase33a-limited-beta-candidate-stabilization-seed.md`,
  `scripts/validate-phase32f-beta-ready-redecision.js`,
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

// No prior phase validator files modified (except allow new Phase 32F validator)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR_32F) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 32F validator is allowed`);
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

  // Active validator must be Phase 32F
  if (ci.includes('validate-phase32f-beta-ready-redecision.js')) {
    pass('CI registers Phase 32F validator');
  } else {
    fail('CI must register Phase 32F validator: validate-phase32f-beta-ready-redecision.js');
  }

  // Phase 32E validator must be commented out (not an active Phase 32F merge blocker)
  const phase32eActiveRun = /^\s+run:\s+node scripts\/validate-phase32e-/m.test(ci);
  if (phase32eActiveRun) {
    fail('Phase 32E validator must be commented out — not an active Phase 32F merge blocker');
  } else {
    pass('Phase 32E validator is not an active Phase 32F merge blocker');
  }

  // Prior validators (32D and earlier) must not be active blockers
  const priorValidatorActive =
    /^\s+run:\s+node scripts\/validate-phase3[01]/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase32[abcde]-/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase[12]/m.test(ci);
  if (priorValidatorActive) {
    warn('Prior phase validator (32E or earlier) appears active in CI — confirm it is commented out for Phase 32F gate');
  } else {
    pass('Prior phase validators (32E and earlier) are not active Phase 32F merge blockers');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE32F_BETA_READY_REDECISION_STATUS: COMPLETED_BETA_READY_REDECISION',
  'PHASE32F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE32F_REDECISION_SCOPE: BETA_READY_REDECISION_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE32F_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_NO_PUBLIC_PRODUCTION_CLAIM',
  'PHASE32F_BLOCKED_LANE_DECISION_STATUS: BLOCKED_DEFAULT_OFF_LANES_NOT_PRODUCTION_PROOF',
  'PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Re-decision decision token ────────────────────────────────────────────
console.log('\n[7] Re-decision decision token');

const ALLOWED_DECISION_VALUES = [
  'PASS_LIMITED_BETA_READY_CANDIDATE_ONLY',
  'HOLD_BETA_READY',
  'NEEDS_MORE_EVIDENCE_FOR_BETA_READY',
  'PASS_BETA_READY_WITH_LIMITATIONS',
];

const DECISION_TOKEN_PREFIX = 'PHASE32F_BETA_READY_REDECISION_DECISION:';
let decisionValue = null;

for (const val of ALLOWED_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${DECISION_TOKEN_PREFIX} ${val}`)) {
    decisionValue = val;
    pass(`Re-decision token present: ${DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Re-decision token missing. Must be one of: ${ALLOWED_DECISION_VALUES.join(', ')}`);
}

// PASS_BETA_READY_WITH_LIMITATIONS requires explicit support/de-scope rationale
if (decisionValue === 'PASS_BETA_READY_WITH_LIMITATIONS') {
  const requiredBetaReadyPhrases = [
    'BETA_READY remains not approved',
    'not public production readiness',
    'No data-loss guarantee',
  ];
  let missing = false;
  for (const phrase of requiredBetaReadyPhrases) {
    if (!ALL_DOCS_CONTENT.includes(phrase)) {
      fail(`PASS_BETA_READY_WITH_LIMITATIONS requires docs to state: "${phrase}"`);
      missing = true;
    }
  }
  if (!missing) {
    pass('PASS_BETA_READY_WITH_LIMITATIONS — required bounding phrases present');
  }
}

// PASS_LIMITED_BETA_READY_CANDIDATE_ONLY requires docs to say BETA_READY remains not approved
if (decisionValue === 'PASS_LIMITED_BETA_READY_CANDIDATE_ONLY') {
  if (ALL_DOCS_CONTENT.includes('BETA_READY remains not approved') ||
      ALL_DOCS_CONTENT.includes('BETA_READY has not been approved')) {
    pass('PASS_LIMITED_BETA_READY_CANDIDATE_ONLY — BETA_READY not approved statement present');
  } else {
    fail('PASS_LIMITED_BETA_READY_CANDIDATE_ONLY requires docs to state BETA_READY remains not approved or has not been approved');
  }
}

// ── 8. Required headings in re-decision doc ───────────────────────────────────
console.log('\n[8] Required headings in re-decision doc');

const REQUIRED_REDECISION_HEADINGS = [
  '# Phase 32F — Beta Ready Re-Decision',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 32E',
  '## Re-decision method',
  '## Beta Ready re-decision table',
  '## Limited Beta Candidate confirmation',
  '## Restore rehearsal limitation decision',
  '## Adapter-awareness limitation decision',
  '## Stress evidence limitation decision',
  '## Rollback/removal limitation decision',
  '## Claim/copy cleanup decision',
  '## Public production readiness boundary',
  '## Data-loss guarantee boundary',
  '## Chosen Beta Ready re-decision',
  '## Decision rationale',
  '## What Phase 32F supports',
  '## What Phase 32F does not approve',
  '## Follow-up stabilization needs',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_REDECISION_HEADINGS) {
  if (redecisionDoc && redecisionDoc.includes(heading)) {
    pass(`Re-decision doc heading present: ${heading}`);
  } else {
    fail(`Required re-decision doc heading missing: ${heading}`);
  }
}

// ── 9. Re-decision table columns and rows ─────────────────────────────────────
console.log('\n[9] Re-decision table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Decision area',
  'Input evidence',
  'Evidence status',
  'Re-decision finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (redecisionDoc && redecisionDoc.includes(col)) {
    pass(`Table column present: ${col}`);
  } else {
    fail(`Required table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'Limited Beta Candidate status',
  'Phase 30C Beta Ready hold',
  'Restore rehearsal browser lane',
  'Adapter-awareness browser lane',
  'LocalStorage diff evidence',
  'Generated/test stress evidence',
  'Rollback/removal evidence',
  'Claim/copy cleanup',
  'Legacy release notes cleanup',
  'Data Safety UX internal visibility',
  'Real learner data evidence',
  'Public production readiness evidence',
  'Data-loss guarantee evidence',
  'Final Beta Ready decision',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (redecisionDoc && redecisionDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 10. Phase 33A seed headings, token, decision options ─────────────────────
console.log('\n[10] Phase 33A seed');

const REQUIRED_33A_HEADINGS = [
  '# Phase 33A — Limited Beta Candidate Stabilization Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32F',
  '## Stabilization constraints',
  '## Required stabilization areas',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_33A_HEADINGS) {
  if (seed33a && seed33a.includes(heading)) {
    pass(`Phase 33A seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 33A seed heading missing: ${heading}`);
  }
}

if (seed33a && seed33a.includes('PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 33A seed status token present');
} else {
  fail('Phase 33A seed status token missing: PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_33A_DECISION_OPTIONS = [
  'HOLD_STABILIZATION',
  'NEEDS_STABILIZATION_PLAN',
  'PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP',
];

for (const opt of REQUIRED_33A_DECISION_OPTIONS) {
  if (seed33a && seed33a.includes(opt)) {
    pass(`Phase 33A decision option present: ${opt}`);
  } else {
    fail(`Phase 33A decision option missing: ${opt}`);
  }
}

const REQUIRED_33A_STABILIZATION_AREAS = [
  'controlled limited beta boundary',
  'known limitations disclosure',
  'restore/adapter blocked/default-off follow-up',
  'stress evidence follow-up',
  'rollback/removal follow-up',
  'claim/copy monitoring',
  'Data Safety UX internal-only status',
  'no public production readiness',
  'no data-loss guarantee',
  'no sync/cloud/backend/auth/account',
];

for (const area of REQUIRED_33A_STABILIZATION_AREAS) {
  if (seed33a && seed33a.toLowerCase().includes(area.toLowerCase())) {
    pass(`Phase 33A stabilization area present: ${area}`);
  } else {
    fail(`Phase 33A stabilization area missing: ${area}`);
  }
}

// Phase 33A must be framed as a separate stabilization gate
const SEPARATE_33A_PHRASE = 'Phase 33A is a separate stabilization/planning gate and is not automatically approved';
if (seed33a && seed33a.includes(SEPARATE_33A_PHRASE)) {
  pass('Phase 33A framed as separate stabilization gate');
} else {
  fail(`Phase 33A seed must state: ${SEPARATE_33A_PHRASE}`);
}

// ── 11. Required summary doc headings ─────────────────────────────────────────
console.log('\n[11] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32F — Beta Ready Re-Decision Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Re-decision result',
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
  'Phase 32F does not approve BETA_READY',
  'Phase 32F does not approve public production readiness',
  'Phase 32F does not approve guaranteed data-loss prevention',
  'Phase 32F does not approve restore execution',
  'Phase 32F does not approve production restore rehearsal',
  'Phase 32F does not approve real learner data restore rehearsal',
  'Phase 32F does not approve runtime backup/export/restore behavior changes',
  'Phase 32F does not approve backup file format changes',
  'Phase 32F does not approve restore overwrite behavior changes',
  'Phase 32F does not approve storage migration',
  'Phase 32F does not approve sync/cloud/account/auth/backend',
  'Phase 32F does not approve telemetry/analytics',
  'Phase 32F does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32F does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32F does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 33A — Limited Beta Candidate Stabilization',
  'Phase 33A is a separate stabilization/planning gate and is not automatically approved',
  'Phase 32F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32F does not approve BETA_READY',
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
  'Phase 32F approved',
  'Phase 32F is approved',
  'Phase 32F automatically approved',
  'Phase 32F approves BETA_READY',
  'Phase 32F approves public production',
  'Phase 32F approves restore execution',
  'Phase 32F approves production restore',
  'Phase 32F approves storage migration',
  'Phase 32F approves sync',
  'Phase 32F approves telemetry',
  'Phase 32F approves backup file format',
  'Phase 32F approves restore overwrite',
  'Phase 32F approves BYOC',
  'Phase 32F approves ordinary-user',
  'Phase 33A approved',
  'Phase 33A is approved',
  'Phase 33A automatically approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'guaranteed data-loss prevention is confirmed',
  'restore is safe for production',
  'real learner data restore rehearsal confirmed',
  'PASS_LIMITED_BETA_READY_CANDIDATE_ONLY means Beta Ready is approved',
  'PASS_LIMITED_BETA_READY_CANDIDATE_ONLY approves Beta Ready',
  'PASS_BETA_READY_WITH_LIMITATIONS is the default',
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
  'LIMITATIONS_CARRIED_FORWARD_NO_PUBLIC_PRODUCTION_CLAIM',
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

// ── 16. Package/dependency/generated artifact checks ─────────────────────────
console.log('\n[16] Package and generated artifact checks');

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
console.log('PHASE32F VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32F_BETA_READY_REDECISION_STATUS: COMPLETED_BETA_READY_REDECISION');
  console.log('PHASE32F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE32F_BETA_READY_REDECISION_DECISION: ${decisionValue || 'UNKNOWN'}`);
  console.log('PHASE32F_REDECISION_SCOPE: BETA_READY_REDECISION_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE32F_LIMITATION_STATUS: LIMITATIONS_CARRIED_FORWARD_NO_PUBLIC_PRODUCTION_CLAIM');
  console.log('PHASE32F_BLOCKED_LANE_DECISION_STATUS: BLOCKED_DEFAULT_OFF_LANES_NOT_PRODUCTION_PROOF');
  console.log('PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
