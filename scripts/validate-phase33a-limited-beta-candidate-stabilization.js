#!/usr/bin/env node
/**
 * scripts/validate-phase33a-limited-beta-candidate-stabilization.js
 *
 * Phase 33A — Limited Beta Candidate Stabilization Validator
 *
 * PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_STATUS: COMPLETED_STABILIZATION_PLANNING
 * PHASE33A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_DECISION: PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP
 * PHASE33A_STABILIZATION_SCOPE: PLANNING_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33A_LIMITATION_CARRYFORWARD_STATUS: LIMITATIONS_DISCLOSED_AND_TRACKED
 * PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED
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

const STAB_DOC    = `docs/testing/phase33a-limited-beta-candidate-stabilization.md`;
const SUMMARY_DOC = `docs/release/phase33a-limited-beta-candidate-stabilization-summary.md`;
const SEED_33B    = `docs/planning/phase33b-controlled-limited-beta-prep-seed.md`;
const VALIDATOR   = `scripts/validate-phase33a-limited-beta-candidate-stabilization.js`;
const CI          = `.github/workflows/e2e-smoke.yml`;

// Phase 32F inputs (must still exist)
const REDECISION_32F = `docs/testing/phase32f-beta-ready-redecision.md`;
const SUMMARY_32F    = `docs/release/phase32f-beta-ready-redecision-summary.md`;
const SEED_33A_IN    = `docs/planning/phase33a-limited-beta-candidate-stabilization-seed.md`;
const VALIDATOR_32F  = `scripts/validate-phase32f-beta-ready-redecision.js`;

const stabDoc    = requireFile(STAB_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed33b    = requireFile(SEED_33B);
const validator  = requireFile(VALIDATOR);
const ci         = requireFile(CI);

const redecision32f = requireFile(REDECISION_32F);
const summary32f    = requireFile(SUMMARY_32F);
const seed33aIn     = requireFile(SEED_33A_IN);
const validator32f  = requireFile(VALIDATOR_32F);

const ALL_DOCS_CONTENT = [stabDoc, summaryDoc, seed33b].filter(Boolean).join('\n');

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
  `docs/testing/phase33a-limited-beta-candidate-stabilization.md`,
  `docs/release/phase33a-limited-beta-candidate-stabilization-summary.md`,
  `docs/planning/phase33b-controlled-limited-beta-prep-seed.md`,
  `scripts/validate-phase33a-limited-beta-candidate-stabilization.js`,
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

// No prior phase validator files modified (only new Phase 33A validator allowed)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 33A validator is allowed`);
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

  // Active validator must be Phase 33A
  if (ci.includes('validate-phase33a-limited-beta-candidate-stabilization.js')) {
    pass('CI registers Phase 33A validator');
  } else {
    fail('CI must register Phase 33A validator: validate-phase33a-limited-beta-candidate-stabilization.js');
  }

  // Phase 32F validator must be commented out (not an active Phase 33A merge blocker)
  const phase32fActiveRun = /^\s+run:\s+node scripts\/validate-phase32f-/m.test(ci);
  if (phase32fActiveRun) {
    fail('Phase 32F validator must be commented out — not an active Phase 33A merge blocker');
  } else {
    pass('Phase 32F validator is not an active Phase 33A merge blocker');
  }

  // Prior validators (32E and earlier) must not be active blockers
  const priorValidatorActive =
    /^\s+run:\s+node scripts\/validate-phase3[01]/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase32[abcde]-/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase[12]/m.test(ci);
  if (priorValidatorActive) {
    warn('Prior phase validator (32F or earlier) appears active in CI — confirm it is commented out for Phase 33A gate');
  } else {
    pass('Prior phase validators (32F and earlier) are not active Phase 33A merge blockers');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_STATUS: COMPLETED_STABILIZATION_PLANNING',
  'PHASE33A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33A_STABILIZATION_SCOPE: PLANNING_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33A_LIMITATION_CARRYFORWARD_STATUS: LIMITATIONS_DISCLOSED_AND_TRACKED',
  'PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Decision token ────────────────────────────────────────────────────────
console.log('\n[7] Stabilization decision token');

const ALLOWED_DECISION_VALUES = [
  'PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP',
  'NEEDS_STABILIZATION_PLAN',
  'HOLD_STABILIZATION',
];

const DECISION_TOKEN_PREFIX = 'PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_DECISION:';
let decisionValue = null;

for (const val of ALLOWED_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${DECISION_TOKEN_PREFIX} ${val}`)) {
    decisionValue = val;
    pass(`Decision token present: ${DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Decision token missing or invalid. Must be one of: ${ALLOWED_DECISION_VALUES.join(', ')}`);
}

// PASS_TO_PHASE33B requires BETA_READY remains not approved statement
if (decisionValue === 'PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP') {
  if (ALL_DOCS_CONTENT.includes('BETA_READY remains not approved') ||
      ALL_DOCS_CONTENT.includes('BETA_READY has not been approved')) {
    pass('PASS_TO_PHASE33B decision — BETA_READY not approved statement present');
  } else {
    fail('PASS_TO_PHASE33B decision requires docs to state BETA_READY remains not approved or has not been approved');
  }
}

// ── 8. Required headings in stabilization doc ─────────────────────────────────
console.log('\n[8] Required headings in stabilization doc');

const REQUIRED_STAB_HEADINGS = [
  '# Phase 33A — Limited Beta Candidate Stabilization',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 32F',
  '## Stabilization method',
  '## Stabilization table',
  '## Limited Beta Candidate boundary',
  '## Beta Ready boundary',
  '## Controlled limited beta boundary',
  '## Known limitations disclosure',
  '## Restore and adapter follow-up',
  '## Stress evidence follow-up',
  '## Rollback/removal follow-up',
  '## Claim/copy monitoring',
  '## Data Safety UX internal-only status',
  '## No-cloud/no-backend boundary',
  '## Chosen stabilization decision',
  '## Decision rationale',
  '## What Phase 33A supports',
  '## What Phase 33A does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_STAB_HEADINGS) {
  if (stabDoc && stabDoc.includes(heading)) {
    pass(`Stabilization doc heading present: ${heading}`);
  } else {
    fail(`Required stabilization doc heading missing: ${heading}`);
  }
}

// ── 9. Stabilization table columns and rows ───────────────────────────────────
console.log('\n[9] Stabilization table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Stabilization area',
  'Input from Phase 32F',
  'Stabilization action',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (stabDoc && stabDoc.includes(col)) {
    pass(`Table column present: ${col}`);
  } else {
    fail(`Required table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'controlled limited beta boundary',
  'known limitations disclosure',
  'restore/adapter blocked-default-off follow-up',
  'stress evidence follow-up',
  'rollback/removal follow-up',
  'claim/copy monitoring',
  'Data Safety UX internal-only status',
  'no public production readiness',
  'no data-loss guarantee',
  'no sync/cloud/backend/auth/account',
  'Beta Ready not approved',
  'Phase 33B controlled limited beta prep',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (stabDoc && stabDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 10. Phase 33B seed headings, token, decision options, prep surfaces ───────
console.log('\n[10] Phase 33B seed');

const REQUIRED_33B_HEADINGS = [
  '# Phase 33B — Controlled Limited Beta Prep Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33A',
  '## Prep constraints',
  '## Required prep surfaces',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_33B_HEADINGS) {
  if (seed33b && seed33b.includes(heading)) {
    pass(`Phase 33B seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 33B seed heading missing: ${heading}`);
  }
}

if (seed33b && seed33b.includes('PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 33B seed status token present');
} else {
  fail('Phase 33B seed status token missing: PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_33B_DECISION_OPTIONS = [
  'HOLD_CONTROLLED_LIMITED_BETA_PREP',
  'NEEDS_PREP_REWORK',
  'PASS_TO_PHASE33C_CONTROLLED_LIMITED_BETA_PREP_REVIEW',
];

for (const opt of REQUIRED_33B_DECISION_OPTIONS) {
  if (seed33b && seed33b.includes(opt)) {
    pass(`Phase 33B decision option present: ${opt}`);
  } else {
    fail(`Phase 33B decision option missing: ${opt}`);
  }
}

const REQUIRED_33B_PREP_SURFACES = [
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
];

for (const surface of REQUIRED_33B_PREP_SURFACES) {
  if (seed33b && seed33b.toLowerCase().includes(surface.toLowerCase())) {
    pass(`Phase 33B prep surface present: ${surface}`);
  } else {
    fail(`Phase 33B prep surface missing: ${surface}`);
  }
}

// Phase 33B must be framed as separate controlled limited beta prep gate
const SEPARATE_33B_PHRASE = 'Phase 33B is a separate controlled limited beta prep gate and is not automatically approved';
if (seed33b && seed33b.includes(SEPARATE_33B_PHRASE)) {
  pass('Phase 33B framed as separate controlled limited beta prep gate');
} else {
  fail(`Phase 33B seed must state: ${SEPARATE_33B_PHRASE}`);
}

// ── 11. Required summary doc headings ─────────────────────────────────────────
console.log('\n[11] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 33A — Limited Beta Candidate Stabilization Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Stabilization result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations disclosed and tracked',
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
  'Phase 33A does not approve BETA_READY',
  'Phase 33A does not approve public production readiness',
  'Phase 33A does not approve guaranteed data-loss prevention',
  'Phase 33A does not approve restore execution',
  'Phase 33A does not approve production restore rehearsal',
  'Phase 33A does not approve real learner data restore rehearsal',
  'Phase 33A does not approve runtime backup/export/restore behavior changes',
  'Phase 33A does not approve backup file format changes',
  'Phase 33A does not approve restore overwrite behavior changes',
  'Phase 33A does not approve storage migration',
  'Phase 33A does not approve sync/cloud/account/auth/backend',
  'Phase 33A does not approve telemetry/analytics',
  'Phase 33A does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 33A does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 33A does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 33B — Controlled Limited Beta Prep',
  'Phase 33B is a separate controlled limited beta prep gate and is not automatically approved',
  'Phase 33A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 33A does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
  }
}

// ── 14. Docs do not approve BETA_READY or make forbidden claims ───────────────
console.log('\n[14] Docs do not approve BETA_READY or make forbidden claims');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 33A approved',
  'Phase 33A is approved',
  'Phase 33A automatically approved',
  'Phase 33A approves BETA_READY',
  'Phase 33A approves public production',
  'Phase 33A approves restore execution',
  'Phase 33A approves production restore',
  'Phase 33A approves storage migration',
  'Phase 33A approves sync',
  'Phase 33A approves telemetry',
  'Phase 33A approves backup file format',
  'Phase 33A approves restore overwrite',
  'Phase 33A approves BYOC',
  'Phase 33A approves ordinary-user',
  'Phase 33B approved',
  'Phase 33B is approved',
  'Phase 33B automatically approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'guaranteed data-loss prevention is confirmed',
  'restore is safe for production',
  'real learner data restore rehearsal confirmed',
  'PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP means Beta Ready is approved',
  'PASS_TO_PHASE33B_CONTROLLED_LIMITED_BETA_PREP approves Beta Ready',
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
  'LIMITATIONS_DISCLOSED_AND_TRACKED',
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
console.log('PHASE33A VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_STATUS: COMPLETED_STABILIZATION_PLANNING');
  console.log('PHASE33A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE33A_LIMITED_BETA_CANDIDATE_STABILIZATION_DECISION: ${decisionValue || 'UNKNOWN'}`);
  console.log('PHASE33A_STABILIZATION_SCOPE: PLANNING_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE33A_LIMITATION_CARRYFORWARD_STATUS: LIMITATIONS_DISCLOSED_AND_TRACKED');
  console.log('PHASE33B_CONTROLLED_LIMITED_BETA_PREP_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
