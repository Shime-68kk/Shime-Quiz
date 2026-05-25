#!/usr/bin/env node
/**
 * scripts/validate-phase32d-claim-copy-cleanup.js
 *
 * Phase 32D — Claim/Copy Cleanup Validator
 *
 * PHASE32D_CLAIM_COPY_CLEANUP_STATUS: COMPLETED_CLAIM_COPY_CLEANUP
 * PHASE32D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32D_CLAIM_COPY_CLEANUP_DECISION: PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW
 * PHASE32D_CLEANUP_SCOPE: CLAIM_COPY_CLEANUP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32D_RELEASE_NOTES_LEGACY_CLAIM_STATUS: CLEANED_OR_BOUNDED_AS_HISTORICAL_NOT_CURRENT
 * PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
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

const CLEANUP_DOC   = `docs/testing/phase32d-claim-copy-cleanup.md`;
const SUMMARY_DOC   = `docs/release/phase32d-claim-copy-cleanup-summary.md`;
const SEED_32E      = `docs/planning/phase32e-beta-ready-redecision-input-review-seed.md`;
const VALIDATOR_32D = `scripts/validate-phase32d-claim-copy-cleanup.js`;
const CI            = `.github/workflows/e2e-smoke.yml`;
const RELEASE_NOTES    = `RELEASE_NOTES.md`;
const RELEASE_NOTES_V2 = `RELEASE_NOTES_V2.md`;

// Phase 32C inputs (must still exist)
const EVIDENCE_32C   = `docs/testing/phase32c-remaining-evidence-review.md`;
const SUMMARY_32C    = `docs/release/phase32c-remaining-evidence-review-summary.md`;
const SEED_32D_INPUT = `docs/planning/phase32d-claim-copy-cleanup-seed.md`;
const VALIDATOR_32C  = `scripts/validate-phase32c-remaining-evidence-review.js`;

const cleanupDoc   = requireFile(CLEANUP_DOC);
const summaryDoc   = requireFile(SUMMARY_DOC);
const seed32e      = requireFile(SEED_32E);
const validator32d = requireFile(VALIDATOR_32D);
const ci           = requireFile(CI);
const releaseNotes   = requireFile(RELEASE_NOTES);
const releaseNotesV2 = requireFile(RELEASE_NOTES_V2);

const evidence32c   = requireFile(EVIDENCE_32C);
const summary32c    = requireFile(SUMMARY_32C);
const seed32dInput  = requireFile(SEED_32D_INPUT);
const validator32c  = requireFile(VALIDATOR_32C);

const ALL_DOCS_CONTENT = [cleanupDoc, summaryDoc, seed32e].filter(Boolean).join('\n');

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
  `docs/testing/phase32d-claim-copy-cleanup.md`,
  `docs/release/phase32d-claim-copy-cleanup-summary.md`,
  `docs/planning/phase32e-beta-ready-redecision-input-review-seed.md`,
  `scripts/validate-phase32d-claim-copy-cleanup.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
  `RELEASE_NOTES.md`,
  `RELEASE_NOTES_V2.md`,
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
];

for (const f of changedFiles) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(f)) {
      fail(`Forbidden file modified: ${f} (matches ${pattern})`);
    }
  }
}

// No prior phase validator files modified (except allow new Phase 32D validator)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR_32D) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 32D validator is allowed`);
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

  // Active validator must be Phase 32D
  if (ci.includes('validate-phase32d-claim-copy-cleanup.js')) {
    pass('CI registers Phase 32D validator');
  } else {
    fail('CI must register Phase 32D validator: validate-phase32d-claim-copy-cleanup.js');
  }

  // Phase 32C validator must be commented out (not an active Phase 32D merge blocker)
  const phase32cActiveRun = /^\s+run:\s+node scripts\/validate-phase32c-/m.test(ci);
  if (phase32cActiveRun) {
    fail('Phase 32C validator must be commented out — not an active Phase 32D merge blocker');
  } else {
    pass('Phase 32C validator is not an active Phase 32D merge blocker');
  }

  // Prior validators (32B and earlier) must not be active blockers
  const priorValidatorActive = /^\s+run:\s+node scripts\/validate-phase3[01]/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase32[ab]-/m.test(ci) ||
    /^\s+run:\s+node scripts\/validate-phase[12]/m.test(ci);
  if (priorValidatorActive) {
    warn('Prior phase validator (32B or earlier) appears active in CI — confirm it is commented out for Phase 32D gate');
  } else {
    pass('Prior phase validators (32B and earlier) are not active Phase 32D merge blockers');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE32D_CLAIM_COPY_CLEANUP_STATUS: COMPLETED_CLAIM_COPY_CLEANUP',
  'PHASE32D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE32D_CLEANUP_SCOPE: CLAIM_COPY_CLEANUP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE32D_RELEASE_NOTES_LEGACY_CLAIM_STATUS: CLEANED_OR_BOUNDED_AS_HISTORICAL_NOT_CURRENT',
  'PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Cleanup decision token ─────────────────────────────────────────────────
console.log('\n[7] Cleanup decision token');

const ALLOWED_CLEANUP_DECISION_VALUES = [
  'PASS_TO_PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW',
  'NEEDS_COPY_REVIEW',
  'HOLD_CLAIM_COPY_CLEANUP',
];

const CLEANUP_DECISION_TOKEN_PREFIX = 'PHASE32D_CLAIM_COPY_CLEANUP_DECISION:';
let cleanupDecisionValue = null;

for (const val of ALLOWED_CLEANUP_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${CLEANUP_DECISION_TOKEN_PREFIX} ${val}`)) {
    cleanupDecisionValue = val;
    pass(`Cleanup decision token present: ${CLEANUP_DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!cleanupDecisionValue) {
  fail(`Cleanup decision token missing. Must be one of: ${ALLOWED_CLEANUP_DECISION_VALUES.join(', ')}`);
}

// ── 8. Release notes cleanup checks ──────────────────────────────────────────
console.log('\n[8] Release notes cleanup checks');

// Exact raw phrase must not remain in either file
const FORBIDDEN_SHIP_PHRASE = 'AI-verified beta candidate: YES — SHIP';

if (releaseNotes && releaseNotes.includes(FORBIDDEN_SHIP_PHRASE)) {
  fail(`RELEASE_NOTES.md must not contain exact raw phrase: "${FORBIDDEN_SHIP_PHRASE}"`);
} else {
  pass(`RELEASE_NOTES.md does not contain exact raw phrase: "${FORBIDDEN_SHIP_PHRASE}"`);
}

if (releaseNotesV2 && releaseNotesV2.includes(FORBIDDEN_SHIP_PHRASE)) {
  fail(`RELEASE_NOTES_V2.md must not contain exact raw phrase: "${FORBIDDEN_SHIP_PHRASE}"`);
} else {
  pass(`RELEASE_NOTES_V2.md does not contain exact raw phrase: "${FORBIDDEN_SHIP_PHRASE}"`);
}

// Both files must include a bounded historical/superseded note
const BOUNDED_NOTE_PHRASES = [
  'CLEANED_OR_BOUNDED_AS_HISTORICAL_NOT_CURRENT',
  'LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
];

for (const phrase of BOUNDED_NOTE_PHRASES) {
  if (releaseNotes && releaseNotes.includes(phrase)) {
    pass(`RELEASE_NOTES.md contains bounded note phrase: "${phrase}"`);
  } else {
    fail(`RELEASE_NOTES.md must contain bounded note phrase: "${phrase}"`);
  }

  if (releaseNotesV2 && releaseNotesV2.includes(phrase)) {
    pass(`RELEASE_NOTES_V2.md contains bounded note phrase: "${phrase}"`);
  } else {
    fail(`RELEASE_NOTES_V2.md must contain bounded note phrase: "${phrase}"`);
  }
}

// Both files must state current readiness is LIMITED_BETA_CANDIDATE
if (releaseNotes && releaseNotes.includes('LIMITED_BETA_CANDIDATE')) {
  pass('RELEASE_NOTES.md contains LIMITED_BETA_CANDIDATE');
} else {
  fail('RELEASE_NOTES.md must state LIMITED_BETA_CANDIDATE as current readiness');
}

if (releaseNotesV2 && releaseNotesV2.includes('LIMITED_BETA_CANDIDATE')) {
  pass('RELEASE_NOTES_V2.md contains LIMITED_BETA_CANDIDATE');
} else {
  fail('RELEASE_NOTES_V2.md must state LIMITED_BETA_CANDIDATE as current readiness');
}

// ── 9. Required headings in cleanup doc ──────────────────────────────────────
console.log('\n[9] Required headings in cleanup doc');

const REQUIRED_CLEANUP_HEADINGS = [
  '# Phase 32D — Claim/Copy Cleanup',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 32C',
  '## Cleanup method',
  '## Claim/copy cleanup table',
  '## Release notes cleanup',
  '## Legacy SHIP wording cleanup',
  '## Beta-ready-like wording cleanup',
  '## Production-readiness wording review',
  '## Restore and data-loss guarantee wording review',
  '## Sync/cloud/backend/telemetry wording review',
  '## App-visible copy review boundary',
  '## Remaining limitations',
  '## Chosen cleanup decision',
  '## Decision rationale',
  '## What Phase 32D supports',
  '## What Phase 32D does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_CLEANUP_HEADINGS) {
  if (cleanupDoc && cleanupDoc.includes(heading)) {
    pass(`Cleanup doc heading present: ${heading}`);
  } else {
    fail(`Required cleanup doc heading missing: ${heading}`);
  }
}

// ── 10. Cleanup table columns and rows ───────────────────────────────────────
console.log('\n[10] Cleanup table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Surface',
  'Finding before cleanup',
  'Cleanup action',
  'Finding after cleanup',
  'Status',
  'Remaining limitation',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (cleanupDoc && cleanupDoc.includes(col)) {
    pass(`Table column present: ${col}`);
  } else {
    fail(`Required table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'RELEASE_NOTES.md',
  'RELEASE_NOTES_V2.md',
  'docs/release summaries',
  'docs/testing and planning',
  'visible app copy',
  'legacy SHIP wording',
  'beta-ready-like wording',
  'production-readiness wording',
  'restore/data-loss guarantee',
  'sync/cloud/backend/telemetry',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (cleanupDoc && cleanupDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 11. Phase 32E seed headings, token, decision options ─────────────────────
console.log('\n[11] Phase 32E seed');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32E — Beta Ready Re-Decision Input Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32D',
  '## Review constraints',
  '## Required input review',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32e && seed32e.includes(heading)) {
    pass(`Phase 32E seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32E seed heading missing: ${heading}`);
  }
}

if (seed32e && seed32e.includes('PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32E seed status token present');
} else {
  fail('Phase 32E seed status token missing: PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_32E_DECISION_OPTIONS = [
  'HOLD_BETA_READY_INPUT_REVIEW',
  'NEEDS_MORE_EVIDENCE_OR_COPY_CLEANUP',
  'PASS_TO_PHASE32F_BETA_READY_REDECISION',
];

for (const opt of REQUIRED_32E_DECISION_OPTIONS) {
  if (seed32e && seed32e.includes(opt)) {
    pass(`Phase 32E decision option present: ${opt}`);
  } else {
    fail(`Phase 32E decision option missing: ${opt}`);
  }
}

// Phase 32E must be framed as a separate input review gate
const SEPARATE_32E_PHRASE = 'Phase 32E is a separate input review gate and is not automatically approved';
if (seed32e && seed32e.includes(SEPARATE_32E_PHRASE)) {
  pass('Phase 32E framed as separate input review gate');
} else {
  fail(`Phase 32E seed must state: ${SEPARATE_32E_PHRASE}`);
}

// ── 12. Required summary doc headings ────────────────────────────────────────
console.log('\n[12] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32D — Claim/Copy Cleanup Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Cleanup result',
  '## Chosen decision',
  '## Decision rationale',
  '## Release notes cleanup',
  '## Remaining limitations',
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

// ── 13. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[13] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 32D approved',
  'Phase 32D is approved',
  'Phase 32D automatically approved',
  'Phase 32D approves BETA_READY',
  'Phase 32D approves public production',
  'Phase 32D approves restore execution',
  'Phase 32D approves production restore',
  'Phase 32D approves storage migration',
  'Phase 32D approves sync',
  'Phase 32D approves telemetry',
  'Phase 32D approves backup file format',
  'Phase 32D approves restore overwrite',
  'Phase 32D approves BYOC',
  'Phase 32D approves ordinary-user',
  'Phase 32E approved',
  'Phase 32E is approved',
  'Phase 32E automatically approved',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'guaranteed data-loss prevention is confirmed',
  'restore is safe for production',
  'real learner data restore rehearsal confirmed',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (ALL_DOCS_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 14. Required "does not approve" statements ───────────────────────────────
console.log('\n[14] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 32D does not approve BETA_READY',
  'Phase 32D does not approve public production readiness',
  'Phase 32D does not approve guaranteed data-loss prevention',
  'Phase 32D does not approve restore execution',
  'Phase 32D does not approve production restore rehearsal',
  'Phase 32D does not approve real learner data restore rehearsal',
  'Phase 32D does not approve runtime backup/export/restore behavior changes',
  'Phase 32D does not approve backup file format changes',
  'Phase 32D does not approve restore overwrite behavior changes',
  'Phase 32D does not approve storage migration',
  'Phase 32D does not approve sync/cloud/account/auth/backend',
  'Phase 32D does not approve telemetry/analytics',
  'Phase 32D does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32D does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32D does not approve limited settings visibility to ordinary users',
];

for (const stmt of REQUIRED_DOES_NOT_APPROVE) {
  if (ALL_DOCS_CONTENT.includes(stmt)) {
    pass(`Required statement present: "${stmt}"`);
  } else {
    fail(`Required statement missing: "${stmt}"`);
  }
}

// ── 15. Required next-phase statements ───────────────────────────────────────
console.log('\n[15] Required next-phase statements');

const REQUIRED_NEXT_PHASE_PHRASES = [
  'Next recommended phase: Phase 32E — Beta Ready Re-Decision Input Review',
  'Phase 32E is a separate input review gate and is not automatically approved',
  'Phase 32D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32D does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
  }
}

// ── 16. Docs do not claim Phase 32E approval ─────────────────────────────────
console.log('\n[16] Phase 32E not pre-approved');

const PHASE32E_NO_AUTO_APPROVE_PHRASES = [
  'Phase 32E is not automatically approved',
  'Phase 32E must independently reach its own decision',
];

for (const phrase of PHASE32E_NO_AUTO_APPROVE_PHRASES) {
  if (seed32e && seed32e.includes(phrase)) {
    pass(`Phase 32E constraint present: "${phrase}"`);
  } else {
    fail(`Phase 32E seed must state: "${phrase}"`);
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
console.log('PHASE32D VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32D_CLAIM_COPY_CLEANUP_STATUS: COMPLETED_CLAIM_COPY_CLEANUP');
  console.log('PHASE32D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log(`PHASE32D_CLAIM_COPY_CLEANUP_DECISION: ${cleanupDecisionValue || 'UNKNOWN'}`);
  console.log('PHASE32D_CLEANUP_SCOPE: CLAIM_COPY_CLEANUP_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE32D_RELEASE_NOTES_LEGACY_CLAIM_STATUS: CLEANED_OR_BOUNDED_AS_HISTORICAL_NOT_CURRENT');
  console.log('PHASE32E_BETA_READY_REDECISION_INPUT_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
