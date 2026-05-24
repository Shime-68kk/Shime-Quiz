#!/usr/bin/env node
/**
 * scripts/validate-phase32a-beta-ready-remaining-evidence-reentry.js
 *
 * Phase 32A — Beta Ready Remaining Evidence Re-Entry Validator
 *
 * PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_STATUS: COMPLETED_REENTRY_PLANNING
 * PHASE32A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION
 * PHASE32A_REENTRY_SCOPE: PLANNING_EVIDENCE_REENTRY_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE32A_PHASE31_CHAIN_INPUT_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
 * PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const REENTRY_DOC   = `docs/testing/phase32a-beta-ready-remaining-evidence-reentry.md`;
const SUMMARY_DOC   = `docs/release/phase32a-beta-ready-remaining-evidence-reentry-summary.md`;
const SEED_32B      = `docs/planning/phase32b-remaining-evidence-collection-seed.md`;
const VALIDATOR_32A = `scripts/validate-phase32a-beta-ready-remaining-evidence-reentry.js`;
const CI            = `.github/workflows/e2e-smoke.yml`;

// Phase 31J inputs (must still exist)
const REDECISION_31J = `docs/testing/phase31j-data-safety-ux-visibility-redecision.md`;
const SUMMARY_31J    = `docs/release/phase31j-data-safety-ux-visibility-redecision-summary.md`;
const SEED_32A       = `docs/planning/phase32a-beta-ready-remaining-evidence-reentry-seed.md`;
const VALIDATOR_31J  = `scripts/validate-phase31j-data-safety-ux-visibility-redecision.js`;

const reentryDoc   = requireFile(REENTRY_DOC);
const summaryDoc   = requireFile(SUMMARY_DOC);
const seed32b      = requireFile(SEED_32B);
const validator32a = requireFile(VALIDATOR_32A);
const ci           = requireFile(CI);

const redecision31j = requireFile(REDECISION_31J);
const summary31j    = requireFile(SUMMARY_31J);
const seed32a       = requireFile(SEED_32A);
const validator31j  = requireFile(VALIDATOR_31J);

// ── 2. Git: verify origin/main reachable ─────────────────────────────────────
console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('git rev-parse --verify origin/main');
} catch {
  fail('git rev-parse --verify origin/main failed — origin/main not reachable');
}

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
  `docs/testing/phase32a-beta-ready-remaining-evidence-reentry.md`,
  `docs/release/phase32a-beta-ready-remaining-evidence-reentry-summary.md`,
  `docs/planning/phase32b-remaining-evidence-collection-seed.md`,
  `scripts/validate-phase32a-beta-ready-remaining-evidence-reentry.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 32A allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// No package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 32A`);
  }
}

// No generated artifacts
for (const f of changedFiles) {
  const firstSegment = f.split('/')[0];
  if (
    firstSegment === 'dist' ||
    firstSegment === 'coverage' ||
    firstSegment === 'node_modules' ||
    firstSegment === 'test-results' ||
    firstSegment === 'playwright-report'
  ) {
    fail(`Forbidden: generated artifact changed: ${f}`);
  }
}

// No src/tests/e2e changes
for (const f of changedFiles) {
  const firstSegment = f.split('/')[0];
  if (firstSegment === 'src') {
    fail(`Forbidden: src file changed in Phase 32A (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'tests') {
    fail(`Forbidden: tests file changed in Phase 32A (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'e2e') {
    fail(`Forbidden: e2e file changed in Phase 32A: ${f}`);
  }
  if (f.startsWith(`docs/adr/`)) {
    fail(`Forbidden: ADR file changed in Phase 32A: ${f}`);
  }
  if (f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md') {
    fail(`Forbidden: ${f} changed — release notes not allowed in Phase 32A`);
  }
}

// No storage driver, backup/export/restore, sync/cloud/backend, telemetry changes
const FORBIDDEN_PATH_PATTERNS = [
  /^src\/storage\//,
  /^src\/.*\/storage\//,
  /^src\/.*\/backup\//,
  /^src\/.*\/restore\//,
  /^src\/.*\/export\//,
  /^src\/.*\/import\//,
  /^src\/.*\/sync\//,
  /^src\/.*\/cloud\//,
  /^src\/.*\/backend\//,
  /^src\/.*\/auth\//,
  /^src\/.*\/account\//,
  /^src\/main\./,
  /^sw\.js$/,
  /^boot-guard\.js$/,
];

for (const f of changedFiles) {
  for (const pattern of FORBIDDEN_PATH_PATTERNS) {
    if (pattern.test(f)) {
      fail(`Forbidden path changed: ${f} (matches ${pattern})`);
      break;
    }
  }
}

// No prior phase files modified
const PRIOR_PHASE_PREFIXES = [
  `docs/planning/phase32a-beta-ready-remaining-evidence-reentry-seed`,
  `docs/planning/phase31j-`,
  `docs/planning/phase31i-`,
  `docs/planning/phase31h-`,
  `docs/planning/phase31g-`,
  `docs/planning/phase31f-`,
  `docs/planning/phase31e-`,
  `docs/planning/phase31d-`,
  `docs/planning/phase31c-`,
  `docs/planning/phase31b-`,
  `docs/planning/phase31a-`,
  `docs/planning/phase30`,
  `docs/release/phase31j-`,
  `docs/release/phase31i-`,
  `docs/release/phase31h-`,
  `docs/release/phase31g-`,
  `docs/release/phase31f-`,
  `docs/release/phase31e-`,
  `docs/release/phase31d-`,
  `docs/release/phase31c-`,
  `docs/release/phase31b-`,
  `docs/release/phase31a-`,
  `docs/release/phase30`,
  `docs/testing/phase31j-`,
  `docs/testing/phase31i-`,
  `docs/testing/phase31h-`,
  `docs/testing/phase31g-`,
  `docs/testing/phase31f-`,
  `docs/testing/phase31e-`,
  `docs/testing/phase31d-`,
  `docs/testing/phase31c-`,
  `scripts/validate-phase31j-`,
  `scripts/validate-phase31i-`,
  `scripts/validate-phase31h-`,
  `scripts/validate-phase31g-`,
  `scripts/validate-phase31f-`,
  `scripts/validate-phase31e-`,
  `scripts/validate-phase31d-`,
  `scripts/validate-phase31c-`,
  `scripts/validate-phase31b-`,
  `scripts/validate-phase31a-`,
  `scripts/validate-phase30`,
];
for (const f of changedFiles) {
  for (const prefix of PRIOR_PHASE_PREFIXES) {
    if (f.startsWith(prefix)) {
      fail(`Forbidden: prior phase file modified: ${f}`);
    }
  }
}

// ── 4. CI workflow checks ─────────────────────────────────────────────────────
console.log('\n[4] CI workflow checks');

if (ci) {
  if (/uses:\s+actions\/checkout@v4/.test(ci)) {
    pass('CI uses actions/checkout@v4');
  } else {
    fail('CI must use actions/checkout@v4');
  }

  if (/fetch-depth:\s+0/.test(ci)) {
    pass('CI checkout uses fetch-depth: 0');
  } else {
    fail('CI checkout must include fetch-depth: 0');
  }

  if (
    ci.includes('Validate Phase 32A') &&
    /node scripts\/validate-phase32a-beta-ready-remaining-evidence-reentry\.js/.test(ci)
  ) {
    pass('CI registers Phase 32A validator');
  } else {
    fail('CI must register Phase 32A validator with: node scripts/validate-phase32a-beta-ready-remaining-evidence-reentry.js');
  }

  // Phase 31J validator must be commented out (not an active Phase 32A blocker)
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31j-data-safety-ux-visibility-redecision\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31J validator as an active Phase 32A blocker');
  } else {
    pass('Phase 31J validator is commented out (not an active Phase 32A blocker)');
  }

  if (ci.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune')) {
    fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  } else {
    pass('CI does not include shell git fetch step');
  }

  if (/for f in scripts\/validate-\*\.js/.test(ci)) {
    fail('CI must not use a full for f in scripts/validate-*.js chain');
  } else {
    pass('CI does not use a full validate-*.js chain');
  }

  if (/continue-on-error:\s+true/.test(ci)) {
    fail('CI must not use continue-on-error: true');
  } else {
    pass('CI does not use continue-on-error: true');
  }
}

// ── 5. Validator self-checks ──────────────────────────────────────────────────
console.log('\n[5] Validator self-checks');

if (validator32a) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator32a)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator32a)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator32a)) {
    pass('Validator uses origin/main..HEAD for changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [reentryDoc, summaryDoc, seed32b, validator32a].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_STATUS: COMPLETED_REENTRY_PLANNING',
  'reentry status'
);
checkToken(
  'PHASE32A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE32A_REENTRY_SCOPE: PLANNING_EVIDENCE_REENTRY_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'reentry scope'
);
checkToken(
  'PHASE32A_PHASE31_CHAIN_INPUT_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE',
  'phase31 chain input status'
);
checkToken(
  'PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase32b seed status'
);

// ── 7. Re-entry decision token ────────────────────────────────────────────────
console.log('\n[7] Re-entry decision token');

const ALLOWED_DECISIONS = new Set([
  'PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION',
  'PHASE32A_BETA_READY_REENTRY_DECISION: NEEDS_REENTRY_REWORK',
  'PHASE32A_BETA_READY_REENTRY_DECISION: HOLD_BETA_READY_REENTRY',
]);

let decisionFound = false;
for (const d of ALLOWED_DECISIONS) {
  if (ALL_DOCS_CONTENT.includes(d)) {
    pass(`Allowed decision token found: ${d}`);
    decisionFound = true;
    break;
  }
}
if (!decisionFound) {
  fail(
    'Required decision token missing — must be one of: ' +
    'PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION / NEEDS_REENTRY_REWORK / HOLD_BETA_READY_REENTRY'
  );
}

// ── 8. Required re-entry doc headings ────────────────────────────────────────
console.log('\n[8] Required re-entry doc headings');

const REQUIRED_REENTRY_HEADINGS = [
  '# Phase 32A — Beta Ready Remaining Evidence Re-Entry',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31J',
  '## Re-entry method',
  '## Remaining evidence matrix',
  '## Phase 31 chain integration',
  '## Restore rehearsal evidence lane',
  '## Adapter-awareness evidence lane',
  '## LocalStorage before-after evidence lane',
  '## Larger generated/test stress evidence lane',
  '## Rollback/removal evidence lane',
  '## Claim/copy and legacy release notes lane',
  '## Data Safety UX integration lane',
  '## Beta Ready final re-decision input lane',
  '## Re-entry decision',
  '## Decision rationale',
  '## What Phase 32A supports',
  '## What Phase 32A does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_REENTRY_HEADINGS) {
  if (reentryDoc && reentryDoc.includes(heading)) {
    pass(`Re-entry doc heading present: ${heading}`);
  } else {
    fail(`Required re-entry doc heading missing: ${heading}`);
  }
}

// ── 9. Remaining evidence matrix columns and rows ─────────────────────────────
console.log('\n[9] Remaining evidence matrix columns and rows');

if (reentryDoc) {
  const MATRIX_COLUMNS = [
    'Evidence lane',
    'Prior status',
    'Evidence needed',
    'Data policy',
    'Execution owner',
    'Phase 32B collection plan',
    'Decision impact',
    'Claim allowed',
    'Claim not allowed',
  ];
  for (const col of MATRIX_COLUMNS) {
    if (reentryDoc.includes(col)) {
      pass(`Matrix column present: ${col}`);
    } else {
      fail(`Required matrix column missing: ${col}`);
    }
  }

  const MATRIX_ROWS = [
    'restore rehearsal browser lane',
    'adapter-awareness browser lane',
    'before/after localStorage diff',
    'larger generated/test stress evidence',
    'rollback/removal evidence',
    'claim/copy cleanup and legacy release notes review',
    'Data Safety UX internal visibility evidence integration',
    'Beta Ready final re-decision input review',
  ];
  for (const row of MATRIX_ROWS) {
    if (reentryDoc.includes(row)) {
      pass(`Matrix row present: ${row}`);
    } else {
      fail(`Required matrix row missing: ${row}`);
    }
  }
}

// ── 10. Required release summary headings ────────────────────────────────────
console.log('\n[10] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 32A — Beta Ready Remaining Evidence Re-Entry Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Re-entry result',
  '## Chosen decision',
  '## Decision rationale',
  '## Phase 31 chain input',
  '## Remaining evidence areas',
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

// ── 11. Required Phase 32B seed headings, token, and decision options ─────────
console.log('\n[11] Required Phase 32B seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32B — Remaining Evidence Collection Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 32A',
  '## Collection constraints',
  '## Required evidence packet',
  '## Required evidence lanes',
  '## Browser/manual evidence plan',
  '## Static evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32b && seed32b.includes(heading)) {
    pass(`Phase 32B seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32B seed heading missing: ${heading}`);
  }
}

if (seed32b && seed32b.includes('PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32B seed status token present');
} else {
  fail('Phase 32B seed status token missing: PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_REMAINING_EVIDENCE_COLLECTION',
  'NEEDS_EVIDENCE_PACKET',
  'PASS_TO_PHASE32C_REMAINING_EVIDENCE_REVIEW',
];
for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed32b && seed32b.includes(opt)) {
    pass(`Phase 32B seed decision option present: ${opt}`);
  } else {
    fail(`Phase 32B seed decision option missing: ${opt}`);
  }
}

// Phase 32B seed must require evidence packet path
const EVIDENCE_PACKET_PATH = '/home/quang/Documents/quiz_beta/phase32b-remaining-evidence-collection-packet.md';
if (seed32b && seed32b.includes(EVIDENCE_PACKET_PATH)) {
  pass('Phase 32B seed includes required evidence packet path');
} else {
  fail(`Phase 32B seed must include evidence packet path: ${EVIDENCE_PACKET_PATH}`);
}

// Phase 32B seed must state generated/test data only
if (seed32b && seed32b.includes('Generated/test data only')) {
  pass('Phase 32B seed states generated/test data only');
} else {
  fail('Phase 32B seed must state: Generated/test data only — no real learner data');
}

// Phase 32B must be framed as separate evidence collection gate
if (seed32b && seed32b.includes('Phase 32B is a separate evidence collection gate and is not automatically approved')) {
  pass('Phase 32B framed as separate evidence collection gate');
} else {
  fail('Phase 32B seed must state: Phase 32B is a separate evidence collection gate and is not automatically approved');
}

// ── 12. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[12] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 32A approved',
  'Phase 32A is approved',
  'Phase 32A approves BETA_READY',
  'Phase 32A approves public production',
  'Phase 32A approves restore execution',
  'Phase 32A approves production restore',
  'Phase 32A approves storage migration',
  'Phase 32A approves sync',
  'Phase 32A approves telemetry',
  'Phase 32A approves backup file format',
  'Phase 32A approves restore overwrite',
  'Phase 32A approves BYOC',
  'Phase 32A approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 32B approved',
  'Phase 32B automatically approved',
  'Phase 32B PASS',
];

const DOCS_CHECK_CONTENT = [reentryDoc, summaryDoc].filter(Boolean).join('\n');
for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (DOCS_CHECK_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 13. Required "does not approve" statements ───────────────────────────────
console.log('\n[13] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 32A does not approve BETA_READY',
  'Phase 32A does not approve public production readiness',
  'Phase 32A does not approve guaranteed data-loss prevention',
  'Phase 32A does not approve restore execution',
  'Phase 32A does not approve production restore rehearsal',
  'Phase 32A does not approve real learner data restore rehearsal',
  'Phase 32A does not approve runtime backup/export/restore behavior changes',
  'Phase 32A does not approve backup file format changes',
  'Phase 32A does not approve restore overwrite behavior changes',
  'Phase 32A does not approve storage migration',
  'Phase 32A does not approve sync/cloud/account/auth/backend',
  'Phase 32A does not approve telemetry/analytics',
  'Phase 32A does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 32A does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 32A does not approve limited settings visibility to ordinary users',
];

for (const stmt of REQUIRED_DOES_NOT_APPROVE) {
  if (ALL_DOCS_CONTENT.includes(stmt)) {
    pass(`Required statement present: "${stmt}"`);
  } else {
    fail(`Required statement missing: "${stmt}"`);
  }
}

// ── 14. Required next-phase statements ───────────────────────────────────────
console.log('\n[14] Required next-phase statements');

const REQUIRED_NEXT_PHASE_PHRASES = [
  'Next recommended phase: Phase 32B — Remaining Evidence Collection',
  'Phase 32B is a separate evidence collection gate and is not automatically approved',
  'Phase 32A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 32A does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
  }
}

// ── Final report ──────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('PHASE32A VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_STATUS: COMPLETED_REENTRY_PLANNING');
  console.log('PHASE32A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE32A_BETA_READY_REENTRY_DECISION: PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION');
  console.log('PHASE32A_REENTRY_SCOPE: PLANNING_EVIDENCE_REENTRY_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE32A_PHASE31_CHAIN_INPUT_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE');
  console.log('PHASE32B_REMAINING_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
