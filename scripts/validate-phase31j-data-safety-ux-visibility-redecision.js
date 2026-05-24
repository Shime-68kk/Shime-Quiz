#!/usr/bin/env node
/**
 * scripts/validate-phase31j-data-safety-ux-visibility-redecision.js
 *
 * Phase 31J — Data Safety UX Visibility Re-Decision Validator
 *
 * PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_STATUS: COMPLETED_VISIBILITY_REDECISION
 * PHASE31J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: PASS_TO_LIMITED_INTERNAL_VISIBILITY
 * PHASE31J_VISIBILITY_SCOPE: REDECISION_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
 * PHASE31J_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_REVIEWED
 * PHASE31J_PHASE31_CHAIN_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE
 * PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED
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

const REDECISION_31J  = `docs/testing/phase31j-data-safety-ux-visibility-redecision.md`;
const SUMMARY_31J     = `docs/release/phase31j-data-safety-ux-visibility-redecision-summary.md`;
const SEED_32A        = `docs/planning/phase32a-beta-ready-remaining-evidence-reentry-seed.md`;
const VALIDATOR_31J   = `scripts/validate-phase31j-data-safety-ux-visibility-redecision.js`;
const CI              = `.github/workflows/e2e-smoke.yml`;

// Phase 31I inputs (must still exist)
const EVIDENCE_31I    = `docs/testing/phase31i-data-safety-ux-internal-browser-evidence.md`;
const SUMMARY_31I     = `docs/release/phase31i-data-safety-ux-internal-browser-evidence-summary.md`;
const SEED_31J        = `docs/planning/phase31j-data-safety-ux-visibility-redecision-seed.md`;
const VALIDATOR_31I   = `scripts/validate-phase31i-data-safety-ux-internal-browser-evidence.js`;

// Phase 31G source (must still exist)
const HELPER_31G      = `src/features/dataSafety/dataSafetyInternalVisibility.js`;

const redecision31j   = requireFile(REDECISION_31J);
const summary31j      = requireFile(SUMMARY_31J);
const seed32a         = requireFile(SEED_32A);
const validator31j    = requireFile(VALIDATOR_31J);
const ci              = requireFile(CI);

const evidence31i     = requireFile(EVIDENCE_31I);
const summary31i      = requireFile(SUMMARY_31I);
const seed31j         = requireFile(SEED_31J);
const validator31i    = requireFile(VALIDATOR_31I);
const helper31g       = requireFile(HELPER_31G);

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
  `docs/testing/phase31j-data-safety-ux-visibility-redecision.md`,
  `docs/release/phase31j-data-safety-ux-visibility-redecision-summary.md`,
  `docs/planning/phase32a-beta-ready-remaining-evidence-reentry-seed.md`,
  `scripts/validate-phase31j-data-safety-ux-visibility-redecision.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31J allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// No package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31J`);
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
    fail(`Forbidden: src file changed in Phase 31J (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'tests') {
    fail(`Forbidden: tests file changed in Phase 31J (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'e2e') {
    fail(`Forbidden: e2e file changed in Phase 31J: ${f}`);
  }
  if (f.startsWith(`docs/adr/`)) {
    fail(`Forbidden: ADR file changed in Phase 31J: ${f}`);
  }
  if (f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md') {
    fail(`Forbidden: ${f} changed — release notes not allowed in Phase 31J`);
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
  `docs/planning/phase31j-data-safety-ux-visibility-redecision-seed`,
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
  `docs/testing/phase31i-`,
  `docs/testing/phase31h-`,
  `docs/testing/phase31g-`,
  `docs/testing/phase31f-`,
  `docs/testing/phase31e-`,
  `docs/testing/phase31d-`,
  `docs/testing/phase31c-`,
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
    ci.includes('Validate Phase 31J') &&
    /node scripts\/validate-phase31j-data-safety-ux-visibility-redecision\.js/.test(ci)
  ) {
    pass('CI registers Phase 31J validator');
  } else {
    fail('CI must register Phase 31J validator with: node scripts/validate-phase31j-data-safety-ux-visibility-redecision.js');
  }

  // Phase 31I validator must be commented out (not an active Phase 31J blocker)
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31i-data-safety-ux-internal-browser-evidence\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31I validator as an active Phase 31J blocker');
  } else {
    pass('Phase 31I validator is commented out (not an active Phase 31J blocker)');
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

if (validator31j) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31j)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31j)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31j)) {
    pass('Validator uses origin/main..HEAD for changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [redecision31j, summary31j, seed32a, validator31j].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_STATUS: COMPLETED_VISIBILITY_REDECISION',
  'redecision status'
);
checkToken(
  'PHASE31J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31J_VISIBILITY_SCOPE: REDECISION_ONLY_NO_RUNTIME_VISIBILITY_CHANGE',
  'visibility scope'
);
checkToken(
  'PHASE31J_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_REVIEWED',
  'browser evidence source status'
);
checkToken(
  'PHASE31J_PHASE31_CHAIN_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE',
  'phase31 chain status'
);
checkToken(
  'PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase32a seed status'
);

// ── 7. Visibility re-decision token ──────────────────────────────────────────
console.log('\n[7] Visibility re-decision token');

const ALLOWED_DECISIONS = new Set([
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: PASS_TO_LIMITED_INTERNAL_VISIBILITY',
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: NEEDS_MORE_BROWSER_EVIDENCE',
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: HOLD_DATA_SAFETY_UX_VISIBILITY',
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: PASS_TO_LIMITED_SETTINGS_VISIBILITY',
]);

let decisionFound = false;
let decisionIsSettingsVisibility = false;
for (const d of ALLOWED_DECISIONS) {
  if (ALL_DOCS_CONTENT.includes(d)) {
    pass(`Allowed decision token found: ${d}`);
    decisionFound = true;
    if (d.endsWith('PASS_TO_LIMITED_SETTINGS_VISIBILITY')) decisionIsSettingsVisibility = true;
    break;
  }
}
if (!decisionFound) {
  fail(
    'Required decision token missing — must be one of: ' +
    'PASS_TO_LIMITED_INTERNAL_VISIBILITY / NEEDS_MORE_BROWSER_EVIDENCE / ' +
    'HOLD_DATA_SAFETY_UX_VISIBILITY / PASS_TO_LIMITED_SETTINGS_VISIBILITY'
  );
}

// PASS_TO_LIMITED_SETTINGS_VISIBILITY requires explicit stronger evidence/design approval statement
if (decisionIsSettingsVisibility) {
  const settingsEvidenceStmt =
    ALL_DOCS_CONTENT.includes('ordinary-user visibility has stronger evidence') ||
    ALL_DOCS_CONTENT.includes('full design approval') ||
    ALL_DOCS_CONTENT.includes('explicit product/release approval');
  if (!settingsEvidenceStmt) {
    fail(
      'PASS_TO_LIMITED_SETTINGS_VISIBILITY requires documentation of: ' +
      'stronger evidence, full design approval, and explicit product/release approval'
    );
  } else {
    pass('PASS_TO_LIMITED_SETTINGS_VISIBILITY has stronger evidence/design approval statement');
  }
}

// ── 8. Required re-decision doc headings ─────────────────────────────────────
console.log('\n[8] Required re-decision doc headings');

const REQUIRED_REDECISION_HEADINGS = [
  '# Phase 31J — Data Safety UX Visibility Re-Decision',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31I',
  '## Re-decision method',
  '## Visibility re-decision table',
  '## Internal browser evidence review',
  '## Limited internal visibility decision',
  '## Limited settings visibility boundary',
  '## Ordinary-user visibility boundary',
  '## Phase 31 chain closure',
  '## Chosen visibility re-decision',
  '## Decision rationale',
  '## What Phase 31J supports',
  '## What Phase 31J does not approve',
  '## Required gates before ordinary-user visibility',
  '## Open limitations',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_REDECISION_HEADINGS) {
  if (redecision31j && redecision31j.includes(heading)) {
    pass(`Re-decision heading present: ${heading}`);
  } else {
    fail(`Required re-decision heading missing: ${heading}`);
  }
}

// ── 9. Visibility re-decision table columns and rows ─────────────────────────
console.log('\n[9] Visibility re-decision table columns and rows');

if (redecision31j) {
  const TABLE_COLUMNS = [
    'Decision area',
    'Input evidence',
    'Evidence result',
    'Re-decision',
    'Limitation',
    'Decision impact',
    'Visibility allowed',
    'Visibility not allowed',
  ];
  for (const col of TABLE_COLUMNS) {
    if (redecision31j.includes(col)) {
      pass(`Table column present: ${col}`);
    } else {
      fail(`Required table column missing: ${col}`);
    }
  }

  const TABLE_ROWS = [
    'Phase 31I direct browser evidence',
    'default/no env hidden',
    'invalid env hidden',
    'explicit internal env visible',
    'no user-visible toggle',
    'inert placeholder actions',
    'no backup/export/restore execution',
    'no storage/network/telemetry side effects',
    'rollback by removing env flag',
    'BETA_READY absence',
    'ordinary-user visibility absence',
    'limited internal visibility',
    'limited settings visibility to ordinary users',
    'Phase 31 chain closure',
    'Phase 32A beta-ready evidence re-entry',
  ];
  for (const row of TABLE_ROWS) {
    if (redecision31j.includes(row)) {
      pass(`Table row present: ${row}`);
    } else {
      fail(`Required table row missing: ${row}`);
    }
  }
}

// ── 10. Required release summary headings ────────────────────────────────────
console.log('\n[10] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31J — Data Safety UX Visibility Re-Decision Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Re-decision result',
  '## Chosen decision',
  '## Decision rationale',
  '## Phase 31 chain closure',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_SUMMARY_HEADINGS) {
  if (summary31j && summary31j.includes(heading)) {
    pass(`Summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 11. Required Phase 32A seed headings, token, and decision options ─────────
console.log('\n[11] Required Phase 32A seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 32A — Beta Ready Remaining Evidence Re-Entry Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31J',
  '## Current readiness',
  '## Remaining evidence areas',
  '## Required evidence lanes',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed32a && seed32a.includes(heading)) {
    pass(`Phase 32A seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 32A seed heading missing: ${heading}`);
  }
}

if (seed32a && seed32a.includes('PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 32A seed status token present');
} else {
  fail('Phase 32A seed status token missing: PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_BETA_READY_REENTRY',
  'NEEDS_MORE_EVIDENCE',
  'PASS_TO_PHASE32B_REMAINING_EVIDENCE_COLLECTION',
];
for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed32a && seed32a.includes(opt)) {
    pass(`Phase 32A seed decision option present: ${opt}`);
  } else {
    fail(`Phase 32A seed decision option missing: ${opt}`);
  }
}

const REQUIRED_EVIDENCE_LANES = [
  'restore rehearsal browser lane',
  'adapter-awareness browser lane',
  'before/after localStorage diff',
  'larger generated/test stress evidence',
  'rollback/removal evidence',
  'claim/copy cleanup and legacy release notes review',
  'Data Safety UX internal visibility evidence integration',
  'Beta Ready final re-decision input review',
];
for (const lane of REQUIRED_EVIDENCE_LANES) {
  if (seed32a && seed32a.includes(lane)) {
    pass(`Phase 32A evidence lane present: ${lane}`);
  } else {
    fail(`Required Phase 32A evidence lane missing: ${lane}`);
  }
}

if (seed32a && seed32a.includes('Phase 32A is a separate planning/evidence re-entry gate and is not automatically approved')) {
  pass('Phase 32A framed as separate planning/evidence re-entry gate');
} else {
  fail('Phase 32A seed must state: Phase 32A is a separate planning/evidence re-entry gate and is not automatically approved');
}

// ── 12. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[12] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31J approved',
  'Phase 31J is approved',
  'Phase 31J approves BETA_READY',
  'Phase 31J approves public production',
  'Phase 31J approves restore execution',
  'Phase 31J approves production restore',
  'Phase 31J approves storage migration',
  'Phase 31J approves sync',
  'Phase 31J approves telemetry',
  'Phase 31J approves backup file format',
  'Phase 31J approves restore overwrite',
  'Phase 31J approves BYOC',
  'Phase 31J approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 32A approved',
  'Phase 32A automatically approved',
  'Phase 32A PASS',
];

const DOCS_CHECK_CONTENT = [redecision31j, summary31j].filter(Boolean).join('\n');
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
  'Phase 31J does not approve BETA_READY',
  'Phase 31J does not approve public production readiness',
  'Phase 31J does not approve guaranteed data-loss prevention',
  'Phase 31J does not approve restore execution',
  'Phase 31J does not approve production restore rehearsal',
  'Phase 31J does not approve real learner data restore rehearsal',
  'Phase 31J does not approve runtime backup/export/restore behavior changes',
  'Phase 31J does not approve backup file format changes',
  'Phase 31J does not approve restore overwrite behavior changes',
  'Phase 31J does not approve storage migration',
  'Phase 31J does not approve sync/cloud/account/auth/backend',
  'Phase 31J does not approve telemetry/analytics',
  'Phase 31J does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31J does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 31J does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 32A — Beta Ready Remaining Evidence Re-Entry',
  'Phase 32A is a separate planning/evidence re-entry gate and is not automatically approved',
  'Phase 31J confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31J does not approve BETA_READY',
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
console.log('PHASE31J VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_STATUS: COMPLETED_VISIBILITY_REDECISION');
  console.log('PHASE31J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION: PASS_TO_LIMITED_INTERNAL_VISIBILITY');
  console.log('PHASE31J_VISIBILITY_SCOPE: REDECISION_ONLY_NO_RUNTIME_VISIBILITY_CHANGE');
  console.log('PHASE31J_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_REVIEWED');
  console.log('PHASE31J_PHASE31_CHAIN_STATUS: INTERNAL_VISIBILITY_CHAIN_CLOSED_WITH_LIMITED_INTERNAL_SCOPE');
  console.log('PHASE32A_BETA_READY_REMAINING_EVIDENCE_REENTRY_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
