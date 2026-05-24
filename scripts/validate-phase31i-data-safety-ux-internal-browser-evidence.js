#!/usr/bin/env node
/**
 * scripts/validate-phase31i-data-safety-ux-internal-browser-evidence.js
 *
 * Phase 31I — Data Safety UX Internal Browser Evidence Validator
 *
 * PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_STATUS: COMPLETED_INTERNAL_BROWSER_EVIDENCE_REVIEW
 * PHASE31I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE
 * PHASE31I_EVIDENCE_SCOPE: INTERNAL_BROWSER_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED
 * PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_31I   = `docs/testing/phase31i-data-safety-ux-internal-browser-evidence.md`;
const SUMMARY_31I    = `docs/release/phase31i-data-safety-ux-internal-browser-evidence-summary.md`;
const SEED_31J       = `docs/planning/phase31j-data-safety-ux-visibility-redecision-seed.md`;
const VALIDATOR_31I  = `scripts/validate-phase31i-data-safety-ux-internal-browser-evidence.js`;
const CI             = `.github/workflows/e2e-smoke.yml`;

// Phase 31H inputs (must still exist)
const EVIDENCE_31H   = `docs/testing/phase31h-data-safety-ux-internal-visibility-evidence-review.md`;
const SUMMARY_31H    = `docs/release/phase31h-data-safety-ux-internal-visibility-evidence-review-summary.md`;
const SEED_31I_FROM_31H = `docs/planning/phase31i-data-safety-ux-internal-browser-evidence-seed.md`;
const VALIDATOR_31H  = `scripts/validate-phase31h-data-safety-ux-internal-visibility-evidence-review.js`;

// Phase 31G inputs (must still exist)
const HELPER_31G     = `src/features/dataSafety/dataSafetyInternalVisibility.js`;
const EVIDENCE_31G   = `docs/testing/phase31g-data-safety-ux-internal-visibility-implementation-evidence.md`;

const evidence31i   = requireFile(EVIDENCE_31I);
const summary31i    = requireFile(SUMMARY_31I);
const seed31j       = requireFile(SEED_31J);
const validator31i  = requireFile(VALIDATOR_31I);
const ci            = requireFile(CI);

const evidence31h   = requireFile(EVIDENCE_31H);
const summary31h    = requireFile(SUMMARY_31H);
const seed31iFrom31h = requireFile(SEED_31I_FROM_31H);
const validator31h  = requireFile(VALIDATOR_31H);

const helper31g     = requireFile(HELPER_31G);
const evidence31g   = requireFile(EVIDENCE_31G);

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
  `docs/testing/phase31i-data-safety-ux-internal-browser-evidence.md`,
  `docs/release/phase31i-data-safety-ux-internal-browser-evidence-summary.md`,
  `docs/planning/phase31j-data-safety-ux-visibility-redecision-seed.md`,
  `scripts/validate-phase31i-data-safety-ux-internal-browser-evidence.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31I allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// No package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31I`);
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
    fail(`Forbidden: src file changed in Phase 31I (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'tests') {
    fail(`Forbidden: tests file changed in Phase 31I (docs/validator-only phase): ${f}`);
  }
  if (firstSegment === 'e2e') {
    fail(`Forbidden: e2e file changed in Phase 31I: ${f}`);
  }
  if (f.startsWith(`docs/adr/`)) {
    fail(`Forbidden: ADR file changed in Phase 31I: ${f}`);
  }
  if (f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md') {
    fail(`Forbidden: ${f} changed — release notes not allowed in Phase 31I`);
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
  `docs/planning/phase31i-data-safety-ux-internal-browser-evidence-seed`,
  `docs/planning/phase31h-`,
  `docs/planning/phase31g-`,
  `docs/planning/phase31f-`,
  `docs/planning/phase31e-`,
  `docs/planning/phase31d-`,
  `docs/planning/phase31c-`,
  `docs/planning/phase31b-`,
  `docs/planning/phase31a-`,
  `docs/planning/phase30`,
  `docs/release/phase31h-`,
  `docs/release/phase31g-`,
  `docs/release/phase31f-`,
  `docs/release/phase31e-`,
  `docs/release/phase31d-`,
  `docs/release/phase31c-`,
  `docs/release/phase31b-`,
  `docs/release/phase31a-`,
  `docs/release/phase30`,
  `docs/testing/phase31h-`,
  `docs/testing/phase31g-`,
  `docs/testing/phase31f-`,
  `docs/testing/phase31e-`,
  `docs/testing/phase31d-`,
  `docs/testing/phase31c-`,
  `docs/testing/phase31b-`,
  `docs/testing/phase31a-`,
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
    ci.includes('Validate Phase 31I') &&
    /node scripts\/validate-phase31i-data-safety-ux-internal-browser-evidence\.js/.test(ci)
  ) {
    pass('CI registers Phase 31I validator');
  } else {
    fail('CI must register Phase 31I validator with: node scripts/validate-phase31i-data-safety-ux-internal-browser-evidence.js');
  }

  // Phase 31H validator must be commented out (not an active Phase 31I blocker)
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31h-data-safety-ux-internal-visibility-evidence-review\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31H validator as an active Phase 31I blocker');
  } else {
    pass('Phase 31H validator is commented out (not an active Phase 31I blocker)');
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

if (validator31i) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31i)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31i)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31i)) {
    pass('Validator uses origin/main..HEAD for changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [evidence31i, summary31i, seed31j, validator31i].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_STATUS: COMPLETED_INTERNAL_BROWSER_EVIDENCE_REVIEW',
  'browser evidence status'
);
checkToken(
  'PHASE31I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31I_EVIDENCE_SCOPE: INTERNAL_BROWSER_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'evidence scope'
);
// Source status: accept either evidence-present value
if (
  ALL_DOCS_CONTENT.includes('PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: PROVIDED_AND_REVIEWED') ||
  ALL_DOCS_CONTENT.includes('PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED')
) {
  pass('Token present: PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS (evidence-present value)');
} else {
  fail('Required token missing: PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS must be PROVIDED_AND_REVIEWED or DIRECT_BROWSER_RUN_RECORDED');
}
checkToken(
  'PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase31j seed status'
);

// ── 7. Browser evidence decision token ───────────────────────────────────────
console.log('\n[7] Browser evidence decision token');

const ALLOWED_DECISIONS = new Set([
  'PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE',
  'PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: NEEDS_MORE_EVIDENCE',
  'PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: HOLD_INTERNAL_BROWSER_EVIDENCE',
]);

let decisionFound = false;
let decisionIsPass = false;
for (const d of ALLOWED_DECISIONS) {
  if (ALL_DOCS_CONTENT.includes(d)) {
    pass(`Allowed decision token found: ${d}`);
    decisionFound = true;
    if (d.endsWith('PASS_INTERNAL_BROWSER_EVIDENCE')) decisionIsPass = true;
    break;
  }
}
if (!decisionFound) {
  fail(
    'Required decision token missing — must be one of: ' +
    'PASS_INTERNAL_BROWSER_EVIDENCE / NEEDS_MORE_EVIDENCE / HOLD_INTERNAL_BROWSER_EVIDENCE'
  );
}

// ── 8. Browser evidence source status ────────────────────────────────────────
console.log('\n[8] Browser evidence source status');

const EVIDENCE_PRESENT_STATUSES = new Set([
  'PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: PROVIDED_AND_REVIEWED',
  'PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED',
]);

let sourceStatusFound = false;
let sourceStatusIsEvidencePresent = false;
for (const s of EVIDENCE_PRESENT_STATUSES) {
  if (ALL_DOCS_CONTENT.includes(s)) {
    pass(`Evidence-present source status found: ${s}`);
    sourceStatusFound = true;
    sourceStatusIsEvidencePresent = true;
    break;
  }
}
if (!sourceStatusFound) {
  fail(
    'Required browser evidence source status missing — must be one of: ' +
    'PROVIDED_AND_REVIEWED / DIRECT_BROWSER_RUN_RECORDED'
  );
}

// PASS decision requires evidence-present source status
if (decisionIsPass && !sourceStatusIsEvidencePresent) {
  fail('PASS_INTERNAL_BROWSER_EVIDENCE decision requires an evidence-present source status (PROVIDED_AND_REVIEWED or DIRECT_BROWSER_RUN_RECORDED)');
} else if (decisionIsPass && sourceStatusIsEvidencePresent) {
  pass('PASS_INTERNAL_BROWSER_EVIDENCE decision has evidence-present source status');
}

// ── 9. Required evidence doc headings ────────────────────────────────────────
console.log('\n[9] Required evidence doc headings');

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 31I — Data Safety UX Internal Browser Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31H',
  '## Browser evidence source',
  '## Browser evidence method',
  '## Browser evidence table',
  '## Default no-env lane',
  '## Invalid env lane',
  '## Explicit internal env lane',
  '## Placeholder action lane',
  '## Storage and network lane',
  '## Rollback lane',
  '## Evidence limitations',
  '## Chosen browser evidence decision',
  '## Decision rationale',
  '## What Phase 31I supports',
  '## What Phase 31I does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_HEADINGS) {
  if (evidence31i && evidence31i.includes(heading)) {
    pass(`Evidence heading present: ${heading}`);
  } else {
    fail(`Required evidence heading missing: ${heading}`);
  }
}

// ── 10. Browser evidence table columns and rows ───────────────────────────────
console.log('\n[10] Browser evidence table columns and rows');

if (evidence31i) {
  const TABLE_COLUMNS = [
    'Lane',
    'Evidence source',
    'Steps reviewed',
    'Observed result',
    'Status',
    'Limitation',
    'Decision impact',
    'Claim allowed',
    'Claim not allowed',
  ];
  for (const col of TABLE_COLUMNS) {
    if (evidence31i.includes(col)) {
      pass(`Table column present: ${col}`);
    } else {
      fail(`Required table column missing: ${col}`);
    }
  }

  const TABLE_ROWS = [
    'default no-env Settings hidden',
    'invalid env Settings hidden',
    'explicit internal env Settings visible',
    'no user-visible toggle',
    'placeholder/inert actions',
    'no backup/export/restore execution',
    'storage snapshot / no unexpected storage writes',
    'network/backend/telemetry absence',
    'rollback by removing env flag',
    'BETA_READY absence',
    'ordinary-user visibility absence',
  ];
  for (const row of TABLE_ROWS) {
    if (evidence31i.includes(row)) {
      pass(`Table row present: ${row}`);
    } else {
      fail(`Required table row missing: ${row}`);
    }
  }
}

// ── 11. Required release summary headings ────────────────────────────────────
console.log('\n[11] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31I — Data Safety UX Internal Browser Evidence Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Browser evidence result',
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
  if (summary31i && summary31i.includes(heading)) {
    pass(`Summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 12. Phase 31J seed headings, token, and decision options ──────────────────
console.log('\n[12] Phase 31J seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 31J — Data Safety UX Visibility Re-Decision Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31I',
  '## Re-decision constraints',
  '## Evidence required',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed31j && seed31j.includes(heading)) {
    pass(`Phase 31J seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 31J seed heading missing: ${heading}`);
  }
}

if (seed31j && seed31j.includes('PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 31J seed status token present');
} else {
  fail('Phase 31J seed status token missing: PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_DATA_SAFETY_UX_VISIBILITY',
  'NEEDS_MORE_BROWSER_EVIDENCE',
  'PASS_TO_LIMITED_INTERNAL_VISIBILITY',
  'PASS_TO_LIMITED_SETTINGS_VISIBILITY',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed31j && seed31j.includes(opt)) {
    pass(`Phase 31J seed decision option present: ${opt}`);
  } else {
    fail(`Phase 31J seed decision option missing: ${opt}`);
  }
}

if (seed31j && seed31j.includes('Phase 31J is a separate visibility re-decision gate and is not automatically approved')) {
  pass('Phase 31J framed as separate visibility re-decision gate');
} else {
  fail('Phase 31J seed must state: Phase 31J is a separate visibility re-decision gate and is not automatically approved');
}

// ── 13. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[13] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31I approved',
  'Phase 31I is approved',
  'Phase 31I approves BETA_READY',
  'Phase 31I approves public production',
  'Phase 31I approves restore execution',
  'Phase 31I approves production restore',
  'Phase 31I approves storage migration',
  'Phase 31I approves sync',
  'Phase 31I approves telemetry',
  'Phase 31I approves backup file format',
  'Phase 31I approves restore overwrite',
  'Phase 31I approves BYOC',
  'Phase 31I approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 31J approved',
  'Phase 31J automatically approved',
  'Phase 31J PASS',
  'browser-confirmed default-off confirmed',
];

const DOCS_CHECK_CONTENT = [evidence31i, summary31i].filter(Boolean).join('\n');
for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (DOCS_CHECK_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 14. Required "does not approve" statements ───────────────────────────────
console.log('\n[14] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 31I does not approve BETA_READY',
  'Phase 31I does not approve public production readiness',
  'Phase 31I does not approve guaranteed data-loss prevention',
  'Phase 31I does not approve restore execution',
  'Phase 31I does not approve production restore rehearsal',
  'Phase 31I does not approve real learner data restore rehearsal',
  'Phase 31I does not approve runtime backup/export/restore behavior changes',
  'Phase 31I does not approve backup file format changes',
  'Phase 31I does not approve restore overwrite behavior changes',
  'Phase 31I does not approve storage migration',
  'Phase 31I does not approve sync/cloud/account/auth/backend',
  'Phase 31I does not approve telemetry/analytics',
  'Phase 31I does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31I does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 31I does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 31J — Data Safety UX Visibility Re-Decision',
  'Phase 31J is a separate visibility re-decision gate and is not automatically approved',
  'Phase 31I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31I does not approve BETA_READY',
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
console.log('PHASE31I VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_STATUS: COMPLETED_INTERNAL_BROWSER_EVIDENCE_REVIEW');
  console.log('PHASE31I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_DECISION: PASS_INTERNAL_BROWSER_EVIDENCE');
  console.log('PHASE31I_EVIDENCE_SCOPE: INTERNAL_BROWSER_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE31I_BROWSER_EVIDENCE_SOURCE_STATUS: DIRECT_BROWSER_RUN_RECORDED');
  console.log('PHASE31J_DATA_SAFETY_UX_VISIBILITY_REDECISION_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nERRORS (${ERRORS.length}):`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  console.log('\nRESULT: FAIL');
  process.exit(1);
}
