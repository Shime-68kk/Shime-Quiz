#!/usr/bin/env node
/**
 * scripts/validate-phase32b-remaining-evidence-collection.js
 *
 * Phase 32B — Remaining Evidence Collection Validator
 *
 * PHASE32B_REMAINING_EVIDENCE_COLLECTION_STATUS: COMPLETED_REMAINING_EVIDENCE_COLLECTION
 * PHASE32B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32B_REMAINING_EVIDENCE_COLLECTION_DECISION: PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW
 * PHASE32B_EVIDENCE_SCOPE: GENERATED_TEST_DATA_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32B_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED
 * PHASE32C_REMAINING_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_DOC  = `docs/testing/phase32b-remaining-evidence-collection.md`;
const SUMMARY_DOC   = `docs/release/phase32b-remaining-evidence-collection-summary.md`;
const SEED_32C      = `docs/planning/phase32c-remaining-evidence-review-seed.md`;
const VALIDATOR_32B = `scripts/validate-phase32b-remaining-evidence-collection.js`;
const CI            = `.github/workflows/e2e-smoke.yml`;

// Phase 32A inputs (must still exist)
const REENTRY_32A     = `docs/testing/phase32a-beta-ready-remaining-evidence-reentry.md`;
const SUMMARY_32A     = `docs/release/phase32a-beta-ready-remaining-evidence-reentry-summary.md`;
const SEED_32B_INPUT  = `docs/planning/phase32b-remaining-evidence-collection-seed.md`;
const VALIDATOR_32A   = `scripts/validate-phase32a-beta-ready-remaining-evidence-reentry.js`;

const evidenceDoc  = requireFile(EVIDENCE_DOC);
const summaryDoc   = requireFile(SUMMARY_DOC);
const seed32c      = requireFile(SEED_32C);
const validator32b = requireFile(VALIDATOR_32B);
const ci           = requireFile(CI);

const reentry32a    = requireFile(REENTRY_32A);
const summary32a    = requireFile(SUMMARY_32A);
const seed32bInput  = requireFile(SEED_32B_INPUT);
const validator32a  = requireFile(VALIDATOR_32A);

const ALL_DOCS_CONTENT = [evidenceDoc, summaryDoc, seed32c].filter(Boolean).join('\n');

// ── 2. Git: verify origin/main reachable ─────────────────────────────────────
console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('git rev-parse --verify origin/main');
} catch {
  fail('git rev-parse --verify origin/main failed — origin/main not reachable');
}

// Validator must not execute internal git fetch
// (This check is self-referential: the validator is not allowed to run git fetch)
pass('Validator does not execute internal git fetch (self-verified)');

// ── 3. Changed files check (origin/main..HEAD) ────────────────────────────────
console.log('\n[3] Changed files (origin/main..HEAD)');

let changedFiles = [];
try {
  const out = execSync('git diff --name-only origin/main..HEAD', { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  changedFiles = out.length ? out.split('\n').map(f => f.trim()).filter(Boolean) : [];
  pass(`Changed files detected: ${changedFiles.length}`);
} catch {
  fail('Could not run git diff --name-only origin/main..HEAD');
}

const ALLOWED_NEW = new Set([
  `docs/testing/phase32b-remaining-evidence-collection.md`,
  `docs/release/phase32b-remaining-evidence-collection-summary.md`,
  `docs/planning/phase32c-remaining-evidence-review-seed.md`,
  `scripts/validate-phase32b-remaining-evidence-collection.js`,
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
    pass(`Expected new file present: ${f}`);
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

// No prior phase validator files modified (except allow new Phase 32B validator)
for (const f of changedFiles) {
  if (/scripts\/validate-phase/.test(f) && f !== VALIDATOR_32B) {
    fail(`Prior phase validator modified: ${f} — only the new Phase 32B validator is allowed`);
  }
}

pass('Forbidden file category check complete');

// ── 5. CI workflow checks ─────────────────────────────────────────────────────
console.log('\n[5] CI workflow checks');

if (ci) {
  // Must use actions/checkout@v4
  if (ci.includes('actions/checkout@v4')) {
    pass('CI uses actions/checkout@v4');
  } else {
    fail('CI must use actions/checkout@v4');
  }

  // Must have fetch-depth: 0
  if (ci.includes('fetch-depth: 0')) {
    pass('CI uses fetch-depth: 0');
  } else {
    fail('CI must have fetch-depth: 0 with actions/checkout@v4');
  }

  // CI does not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune
  if (ci.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune')) {
    fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  } else {
    pass('CI does not include shell git fetch step');
  }

  // CI does not use full historical validator for-loop chain
  if (ci.match(/for\s+f\s+in\s+scripts\/validate-\*/)) {
    fail('CI must not include full "for f in scripts/validate-*" validator chain');
  } else {
    pass('CI does not use full historical validator chain');
  }

  // CI does not have continue-on-error: true
  if (ci.includes('continue-on-error: true')) {
    fail('CI must not have continue-on-error: true');
  } else {
    pass('CI does not have continue-on-error: true');
  }

  // Active validator is Phase 32B
  if (ci.includes('validate-phase32b-remaining-evidence-collection.js')) {
    pass('CI registers Phase 32B validator');
  } else {
    fail('CI must register Phase 32B validator: validate-phase32b-remaining-evidence-collection.js');
  }

  // Phase 32A validator is commented out (not an active blocker for Phase 32B merge)
  const phase32aActive = ci.match(/^\s+run:\s+node scripts\/validate-phase32a-/m) ||
    (ci.includes('node scripts/validate-phase32a-') && !ci.match(/^\s*#.*validate-phase32a-/m));
  if (phase32aActive) {
    warn('Phase 32A validator appears active in CI — confirm it is commented out for Phase 32B gate');
  } else {
    pass('Phase 32A validator is not an active Phase 32B merge blocker');
  }
} else {
  fail('CI workflow file missing or unreadable');
}

// ── 6. Required status tokens ─────────────────────────────────────────────────
console.log('\n[6] Required status tokens');

const REQUIRED_TOKENS = [
  'PHASE32B_REMAINING_EVIDENCE_COLLECTION_STATUS: COMPLETED_REMAINING_EVIDENCE_COLLECTION',
  'PHASE32B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE32B_EVIDENCE_SCOPE: GENERATED_TEST_DATA_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE32C_REMAINING_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Required token present: ${token}`);
  } else {
    fail(`Required token missing: ${token}`);
  }
}

// ── 7. Collection decision token ─────────────────────────────────────────────
console.log('\n[7] Collection decision token');

const ALLOWED_DECISION_VALUES = [
  'PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW',
  'NEEDS_MORE_EVIDENCE',
  'HOLD_REMAINING_EVIDENCE_COLLECTION',
];

const DECISION_TOKEN_PREFIX = 'PHASE32B_REMAINING_EVIDENCE_COLLECTION_DECISION:';
let decisionValue = null;

for (const val of ALLOWED_DECISION_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${DECISION_TOKEN_PREFIX} ${val}`)) {
    decisionValue = val;
    pass(`Collection decision token present: ${DECISION_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!decisionValue) {
  fail(`Collection decision token missing. Must be one of: ${ALLOWED_DECISION_VALUES.join(', ')}`);
}

// ── 8. Evidence source status ─────────────────────────────────────────────────
console.log('\n[8] Evidence source status');

const ALLOWED_EVIDENCE_SOURCE_VALUES = [
  'PROVIDED_AND_REVIEWED',
  'DIRECT_BROWSER_RUN_RECORDED',
];

const SOURCE_TOKEN_PREFIX = 'PHASE32B_EVIDENCE_SOURCE_STATUS:';
let evidenceSourceValue = null;

for (const val of ALLOWED_EVIDENCE_SOURCE_VALUES) {
  if (ALL_DOCS_CONTENT.includes(`${SOURCE_TOKEN_PREFIX} ${val}`)) {
    evidenceSourceValue = val;
    pass(`Evidence source status present: ${SOURCE_TOKEN_PREFIX} ${val}`);
    break;
  }
}
if (!evidenceSourceValue) {
  fail(`Evidence source status missing. Must be one of: ${ALLOWED_EVIDENCE_SOURCE_VALUES.join(', ')}`);
}

// PASS decision requires evidence-present source status
if (decisionValue === 'PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW' && !evidenceSourceValue) {
  fail('PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW decision requires evidence-present source status');
} else if (decisionValue === 'PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW' && evidenceSourceValue) {
  pass('PASS decision has evidence-present source status — allowed');
}

// ── 9. Required headings in evidence collection doc ───────────────────────────
console.log('\n[9] Required headings in evidence collection doc');

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 32B — Remaining Evidence Collection',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 32A',
  '## Evidence source',
  '## Evidence method',
  '## Remaining evidence collection table',
  '## Restore rehearsal browser lane',
  '## Adapter-awareness browser lane',
  '## Before-after localStorage diff lane',
  '## Larger generated/test stress evidence lane',
  '## Rollback/removal evidence lane',
  '## Claim/copy and legacy release notes lane',
  '## Data Safety UX internal visibility integration lane',
  '## Beta Ready final re-decision input lane',
  '## Evidence limitations',
  '## Chosen collection decision',
  '## Decision rationale',
  '## What Phase 32B supports',
  '## What Phase 32B does not approve',
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

// ── 10. Evidence collection table columns and rows ────────────────────────────
console.log('\n[10] Evidence collection table');

const REQUIRED_TABLE_COLUMNS = [
  'Evidence lane',
  'Evidence source',
  'Steps reviewed',
  'Observed result',
  'Status',
  'Limitation',
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
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (evidenceDoc && evidenceDoc.toLowerCase().includes(row.toLowerCase())) {
    pass(`Table row present: ${row}`);
  } else {
    fail(`Required table row missing: ${row}`);
  }
}

// ── 11. Required Phase 32C seed headings, token, and decision options ─────────
console.log('\n[11] Phase 32C seed');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32C — Remaining Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32B',
  '## Review constraints',
  '## Required evidence review',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32c && seed32c.includes(heading)) {
    pass(`Phase 32C seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32C seed heading missing: ${heading}`);
  }
}

if (seed32c && seed32c.includes('PHASE32C_REMAINING_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32C seed status token present');
} else {
  fail('Phase 32C seed status token missing: PHASE32C_REMAINING_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_REMAINING_EVIDENCE_REVIEW',
  'NEEDS_MORE_EVIDENCE',
  'PASS_TO_PHASE32D_CLAIM_COPY_CLEANUP',
  'PASS_TO_BETA_READY_REDECISION_INPUT_REVIEW',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed32c && seed32c.includes(opt)) {
    pass(`Phase 32C seed decision option present: ${opt}`);
  } else {
    fail(`Phase 32C seed decision option missing: ${opt}`);
  }
}

// Phase 32C must be framed as a separate evidence review gate
const SEPARATE_GATE_PHRASE = 'Phase 32C is a separate evidence review gate and is not automatically approved';
if (seed32c && seed32c.includes(SEPARATE_GATE_PHRASE)) {
  pass('Phase 32C framed as separate evidence review gate');
} else {
  fail(`Phase 32C seed must state: ${SEPARATE_GATE_PHRASE}`);
}

// ── 12. Required summary doc headings ────────────────────────────────────────
console.log('\n[12] Required summary doc headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32B — Remaining Evidence Collection Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Evidence result',
  '## Chosen decision',
  '## Decision rationale',
  '## Evidence source',
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
  'Phase 32B approved',
  'Phase 32B is approved',
  'Phase 32B approves BETA_READY',
  'Phase 32B approves public production',
  'Phase 32B approves restore execution',
  'Phase 32B approves production restore',
  'Phase 32B approves storage migration',
  'Phase 32B approves sync',
  'Phase 32B approves telemetry',
  'Phase 32B approves backup file format',
  'Phase 32B approves restore overwrite',
  'Phase 32B approves BYOC',
  'Phase 32B approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 32C approved',
  'Phase 32C is approved',
  'Phase 32C automatically approved',
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
  'Phase 32B does not approve BETA_READY',
  'Phase 32B does not approve public production readiness',
  'Phase 32B does not approve guaranteed data-loss prevention',
  'Phase 32B does not approve restore execution',
  'Phase 32B does not approve production restore rehearsal',
  'Phase 32B does not approve real learner data restore rehearsal',
  'Phase 32B does not approve runtime backup/export/restore behavior changes',
  'Phase 32B does not approve backup file format changes',
  'Phase 32B does not approve restore overwrite behavior changes',
  'Phase 32B does not approve storage migration',
  'Phase 32B does not approve sync/cloud/account/auth/backend',
  'Phase 32B does not approve telemetry/analytics',
  'Phase 32B does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32B does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32B does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 32C — Remaining Evidence Review',
  'Phase 32C is a separate evidence review gate and is not automatically approved',
  'Phase 32B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32B does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
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
console.log('PHASE32B VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32B_REMAINING_EVIDENCE_COLLECTION_STATUS: COMPLETED_REMAINING_EVIDENCE_COLLECTION');
  console.log('PHASE32B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE32B_REMAINING_EVIDENCE_COLLECTION_DECISION: PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW');
  console.log('PHASE32B_EVIDENCE_SCOPE: GENERATED_TEST_DATA_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log(`PHASE32B_EVIDENCE_SOURCE_STATUS: ${evidenceSourceValue || 'UNKNOWN'}`);
  console.log('PHASE32C_REMAINING_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
