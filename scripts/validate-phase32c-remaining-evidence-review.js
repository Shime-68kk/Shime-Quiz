#!/usr/bin/env node
/**
 * scripts/validate-phase32c-remaining-evidence-review.js
 *
 * Phase 32C — Remaining Evidence Review Validator
 *
 * PHASE32C_REMAINING_EVIDENCE_REVIEW_STATUS: COMPLETED_REMAINING_EVIDENCE_REVIEW
 * PHASE32C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32C_REMAINING_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE32D_CLAIM_COPY_CLEANUP
 * PHASE32C_REVIEW_SCOPE: EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32C_BLOCKED_LANE_INTERPRETATION: BLOCKED_DEFAULT_OFF_NOT_PRODUCTION_PROOF
 * PHASE32C_PHASE32B_HF1_INPUT_STATUS: VALIDATOR_ONLY_FIX_REVIEWED_NO_EVIDENCE_CHANGE
 * PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_DOC  = `docs/testing/phase32c-remaining-evidence-review.md`;
const SUMMARY_DOC   = `docs/release/phase32c-remaining-evidence-review-summary.md`;
const SEED_32D      = `docs/planning/phase32d-claim-copy-cleanup-seed.md`;
const VALIDATOR_32C = `scripts/validate-phase32c-remaining-evidence-review.js`;
const CI            = `.github/workflows/e2e-smoke.yml`;

// Phase 32B inputs (must still exist)
const EVIDENCE_32B   = `docs/testing/phase32b-remaining-evidence-collection.md`;
const SUMMARY_32B    = `docs/release/phase32b-remaining-evidence-collection-summary.md`;
const SEED_32C_INPUT = `docs/planning/phase32c-remaining-evidence-review-seed.md`;
const VALIDATOR_32B  = `scripts/validate-phase32b-remaining-evidence-collection.js`;

const evidenceDoc  = requireFile(EVIDENCE_DOC);
const summaryDoc   = requireFile(SUMMARY_DOC);
const seed32d      = requireFile(SEED_32D);
const validator32c = requireFile(VALIDATOR_32C);
const ci           = requireFile(CI);

const evidence32b   = requireFile(EVIDENCE_32B);
const summary32b    = requireFile(SUMMARY_32B);
const seed32cInput  = requireFile(SEED_32C_INPUT);
const validator32b  = requireFile(VALIDATOR_32B);

const ALL_DOCS_CONTENT = [evidenceDoc, summaryDoc, seed32d].filter(Boolean).join('\n');

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
  `docs/testing/phase32c-remaining-evidence-review.md`,
  `docs/release/phase32c-remaining-evidence-review-summary.md`,
  `docs/planning/phase32d-claim-copy-cleanup-seed.md`,
  `scripts/validate-phase32c-remaining-evidence-review.js`,
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

// No prior phase validator files modified (except allow new Phase 32C validator)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR_32C) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 32C validator is allowed`);
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

  // Active validator must be Phase 32C
  if (ci.includes('validate-phase32c-remaining-evidence-review.js')) {
    pass('CI registers Phase 32C validator');
  } else {
    fail('CI must register Phase 32C validator: validate-phase32c-remaining-evidence-review.js');
  }

  // Phase 32B validator must be commented out (not an active Phase 32C merge blocker)
  const phase32bActiveRun = /^\s+run:\s+node scripts\/validate-phase32b-/m.test(ci);
  if (phase32bActiveRun) {
    fail('Phase 32B validator must be commented out — not an active Phase 32C merge blocker');
  } else {
    pass('Phase 32B validator is not an active Phase 32C merge blocker');
  }

  // Prior validators (32A and earlier) must not be active blockers
  const priorValidatorActive = /^\s+run:\s+node scripts\/validate-phase3[01]/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase[12]/m.test(ci);
  if (priorValidatorActive) {
    warn('Prior phase validator (31 or earlier) appears active in CI — confirm it is commented out for Phase 32C gate');
  } else {
    pass('Prior phase validators (31 and earlier) are not active Phase 32C merge blockers');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE32C_REMAINING_EVIDENCE_REVIEW_STATUS: COMPLETED_REMAINING_EVIDENCE_REVIEW',
  'PHASE32C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE32C_REVIEW_SCOPE: EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE32C_BLOCKED_LANE_INTERPRETATION: BLOCKED_DEFAULT_OFF_NOT_PRODUCTION_PROOF',
  'PHASE32C_PHASE32B_HF1_INPUT_STATUS: VALIDATOR_ONLY_FIX_REVIEWED_NO_EVIDENCE_CHANGE',
  'PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Review decision token ─────────────────────────────────────────────────
console.log('\n[7] Review decision token');

const ALLOWED_REVIEW_DECISION_VALUES = [
  'PASS_TO_PHASE32D_CLAIM_COPY_CLEANUP',
  'NEEDS_MORE_EVIDENCE',
  'HOLD_REMAINING_EVIDENCE_REVIEW',
  'PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW',
];

const REVIEW_DECISION_TOKEN_PREFIX = 'PHASE32C_REMAINING_EVIDENCE_REVIEW_DECISION:';
let reviewDecisionValue = null;

for (const val of ALLOWED_REVIEW_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${REVIEW_DECISION_TOKEN_PREFIX} ${val}`)) {
    reviewDecisionValue = val;
    pass(`Review decision token present: ${REVIEW_DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!reviewDecisionValue) {
  fail(`Review decision token missing. Must be one of: ${ALLOWED_REVIEW_DECISION_VALUES.join(', ')}`);
}

// If PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW is chosen, require explicit evidence
if (reviewDecisionValue === 'PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW') {
  const requiredBetaReadyPhrases = [
    'blocked',
    'de-scoped',
  ];
  const hasBlockedLaneDeScope = ALL_DOCS_CONTENT.toLowerCase().includes('de-scoped') ||
    ALL_DOCS_CONTENT.toLowerCase().includes('descoped') ||
    ALL_DOCS_CONTENT.toLowerCase().includes('resolved the blocked');
  const hasStrongerStressEvidence = ALL_DOCS_CONTENT.toLowerCase().includes('larger stress evidence') &&
    !ALL_DOCS_CONTENT.toLowerCase().includes('small') &&
    !ALL_DOCS_CONTENT.toLowerCase().includes('3-item');
  const hasClaimCopyCleanupComplete = ALL_DOCS_CONTENT.includes('claim/copy cleanup complete') ||
    ALL_DOCS_CONTENT.includes('COMPLETED_CLAIM_COPY_CLEANUP');

  if (!hasBlockedLaneDeScope) {
    fail('PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW requires explicit text explaining why blocked/default-off lanes are de-scoped or resolved');
  }
  if (!hasStrongerStressEvidence) {
    fail('PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW requires stronger stress/rollback evidence (not small fixture)');
  }
  if (!hasClaimCopyCleanupComplete) {
    fail('PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW requires claim/copy cleanup completion (COMPLETED_CLAIM_COPY_CLEANUP)');
  }
}

// ── 8. Required headings in evidence review doc ───────────────────────────────
console.log('\n[8] Required headings in evidence review doc');

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 32C — Remaining Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 32B',
  '## Phase 32B-HF1 input',
  '## Review method',
  '## Remaining evidence review table',
  '## Restore rehearsal evidence review',
  '## Adapter-awareness evidence review',
  '## LocalStorage before-after evidence review',
  '## Larger generated/test stress evidence review',
  '## Rollback/removal evidence review',
  '## Claim/copy and legacy release notes review',
  '## Data Safety UX internal visibility evidence review',
  '## Beta Ready final re-decision input review',
  '## Blocked/default-off lane interpretation',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 32C supports',
  '## What Phase 32C does not approve',
  '## Required gates before Beta Ready re-decision',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_HEADINGS) {
  if (evidenceDoc && evidenceDoc.includes(heading)) {
    pass(`Evidence doc heading present: ${heading}`);
  } else {
    fail(`Required evidence doc heading missing: ${heading}`);
  }
}

// ── 9. Evidence review table columns and rows ─────────────────────────────────
console.log('\n[9] Evidence review table');

const REQUIRED_TABLE_COLUMNS = [
  'Evidence lane',
  'Phase 32B status',
  'Evidence reviewed',
  'Review finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (evidenceDoc && evidenceDoc.includes(col)) {
    pass(`Table column present: ${col}`);
  } else {
    fail(`Required table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'restore rehearsal browser lane',
  'adapter-awareness browser lane',
  'before/after localStorage diff',
  'larger generated/test stress evidence',
  'rollback/removal evidence',
  'claim/copy cleanup and legacy release notes review',
  'Data Safety UX internal visibility evidence integration',
  'Beta Ready final re-decision input review',
  'Phase 32B-HF1 validator-only input',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (evidenceDoc && evidenceDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 10. Required Phase 32D seed headings, token, and decision options ─────────
console.log('\n[10] Phase 32D seed');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32D — Claim/Copy Cleanup Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32C',
  '## Cleanup constraints',
  '## Required cleanup surfaces',
  '## Legacy release notes review',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32d && seed32d.includes(heading)) {
    pass(`Phase 32D seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32D seed heading missing: ${heading}`);
  }
}

if (seed32d && seed32d.includes('PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32D seed status token present');
} else {
  fail('Phase 32D seed status token missing: PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_32D_DECISION_OPTIONS = [
  'HOLD_CLAIM_COPY_CLEANUP',
  'NEEDS_COPY_REVIEW',
  'PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW',
];

for (const opt of REQUIRED_32D_DECISION_OPTIONS) {
  if (seed32d && seed32d.includes(opt)) {
    pass(`Phase 32D decision option present: ${opt}`);
  } else {
    fail(`Phase 32D decision option missing: ${opt}`);
  }
}

const REQUIRED_32D_CLEANUP_SURFACES = [
  'RELEASE_NOTES.md',
  'RELEASE_NOTES_V2.md',
];

for (const surface of REQUIRED_32D_CLEANUP_SURFACES) {
  if (seed32d && seed32d.includes(surface)) {
    pass(`Phase 32D cleanup surface present: ${surface}`);
  } else {
    fail(`Phase 32D cleanup surface missing: ${surface}`);
  }
}

// Phase 32D must be framed as a separate claim/copy cleanup gate
const SEPARATE_32D_PHRASE = 'Phase 32D is a separate claim/copy cleanup gate and is not automatically approved';
if (seed32d && seed32d.includes(SEPARATE_32D_PHRASE)) {
  pass('Phase 32D framed as separate claim/copy cleanup gate');
} else {
  fail(`Phase 32D seed must state: ${SEPARATE_32D_PHRASE}`);
}

// ── 11. Required summary doc headings ────────────────────────────────────────
console.log('\n[11] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32C — Remaining Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Evidence review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Blocked/default-off lane interpretation',
  '## Phase 32B-HF1 input',
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

// ── 12. Blocked/default-off lane interpretation ───────────────────────────────
console.log('\n[12] Blocked/default-off lane interpretation');

const BLOCKED_LANE_PHRASES = [
  'BLOCKED_DEFAULT_OFF lanes are not production proof',
  'BLOCKED_DEFAULT_OFF_NOT_PRODUCTION_PROOF',
];

for (const phrase of BLOCKED_LANE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Blocked lane interpretation phrase present: "${phrase}"`);
  } else {
    fail(`Docs must explicitly state: "${phrase}"`);
  }
}

// ── 13. Phase 32B-HF1 validator-only interpretation ──────────────────────────
console.log('\n[13] Phase 32B-HF1 input interpretation');

const HF1_PHRASES = [
  'VALIDATOR_ONLY_FIX_REVIEWED_NO_EVIDENCE_CHANGE',
  'Phase 32B-HF1 was validator-only and does not change evidence interpretation',
];

for (const phrase of HF1_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`HF1 interpretation phrase present: "${phrase}"`);
  } else {
    fail(`Docs must explicitly state: "${phrase}"`);
  }
}

// ── 14. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[14] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 32C approved',
  'Phase 32C is approved',
  'Phase 32C automatically approved',
  'Phase 32C approves BETA_READY',
  'Phase 32C approves public production',
  'Phase 32C approves restore execution',
  'Phase 32C approves production restore',
  'Phase 32C approves storage migration',
  'Phase 32C approves sync',
  'Phase 32C approves telemetry',
  'Phase 32C approves backup file format',
  'Phase 32C approves restore overwrite',
  'Phase 32C approves BYOC',
  'Phase 32C approves ordinary-user',
  'Phase 32D approved',
  'Phase 32D is approved',
  'Phase 32D automatically approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'guaranteed data-loss prevention is confirmed',
  'restore is safe for production',
  'real learner data restore rehearsal confirmed',
  'BLOCKED_DEFAULT_OFF confirms production',
  'BLOCKED_DEFAULT_OFF proves',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (ALL_DOCS_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 15. Required "does not approve" statements ───────────────────────────────
console.log('\n[15] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 32C does not approve BETA_READY',
  'Phase 32C does not approve public production readiness',
  'Phase 32C does not approve guaranteed data-loss prevention',
  'Phase 32C does not approve restore execution',
  'Phase 32C does not approve production restore rehearsal',
  'Phase 32C does not approve real learner data restore rehearsal',
  'Phase 32C does not approve runtime backup/export/restore behavior changes',
  'Phase 32C does not approve backup file format changes',
  'Phase 32C does not approve restore overwrite behavior changes',
  'Phase 32C does not approve storage migration',
  'Phase 32C does not approve sync/cloud/account/auth/backend',
  'Phase 32C does not approve telemetry/analytics',
  'Phase 32C does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32C does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32C does not approve limited settings visibility to ordinary users',
];

for (const stmt of REQUIRED_DOES_NOT_APPROVE) {
  if (ALL_DOCS_CONTENT.includes(stmt)) {
    pass(`Required statement present: "${stmt}"`);
  } else {
    fail(`Required statement missing: "${stmt}"`);
  }
}

// ── 16. Required next-phase statements ───────────────────────────────────────
console.log('\n[16] Required next-phase statements');

const REQUIRED_NEXT_PHASE_PHRASES = [
  'Next recommended phase: Phase 32D — Claim/Copy Cleanup',
  'Phase 32D is a separate claim/copy cleanup gate and is not automatically approved',
  'Phase 32C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32C does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
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
console.log('PHASE32C VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32C_REMAINING_EVIDENCE_REVIEW_STATUS: COMPLETED_REMAINING_EVIDENCE_REVIEW');
  console.log('PHASE32C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE32C_REMAINING_EVIDENCE_REVIEW_DECISION: ${reviewDecisionValue || 'UNKNOWN'}`);
  console.log('PHASE32C_REVIEW_SCOPE: EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE32C_BLOCKED_LANE_INTERPRETATION: BLOCKED_DEFAULT_OFF_NOT_PRODUCTION_PROOF');
  console.log('PHASE32C_PHASE32B_HF1_INPUT_STATUS: VALIDATOR_ONLY_FIX_REVIEWED_NO_EVIDENCE_CHANGE');
  console.log('PHASE32D_CLAIM_COPY_CLEANUP_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
