#!/usr/bin/env node
/**
 * scripts/validate-phase31e-data-safety-ux-controlled-visibility-gate.js
 *
 * Phase 31E — Data Safety UX Controlled Visibility Gate Validator
 *
 * PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_STATUS: COMPLETED_CONTROLLED_VISIBILITY_GATE
 * PHASE31E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY
 * PHASE31E_VISIBILITY_SCOPE: VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE
 * PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
 * PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED
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

const GATE_31E = `docs/testing/phase31e-data-safety-ux-controlled-visibility-gate.md`;
const SUMMARY_31E = `docs/release/phase31e-data-safety-ux-controlled-visibility-summary.md`;
const SEED_31F = `docs/planning/phase31f-data-safety-ux-internal-visibility-seed.md`;
const VALIDATOR_31E = `scripts/validate-phase31e-data-safety-ux-controlled-visibility-gate.js`;
const CI = `.github/workflows/e2e-smoke.yml`;

// Phase 31D inputs (must still exist)
const EVIDENCE_31D = `docs/testing/phase31d-data-safety-ux-evidence-review.md`;
const SUMMARY_31D = `docs/release/phase31d-data-safety-ux-evidence-review-summary.md`;
const SEED_31E = `docs/planning/phase31e-data-safety-ux-controlled-visibility-seed.md`;
const VALIDATOR_31D = `scripts/validate-phase31d-data-safety-ux-evidence-review.js`;

const gate31e = requireFile(GATE_31E);
const summary31e = requireFile(SUMMARY_31E);
const seed31f = requireFile(SEED_31F);
const validator31e = requireFile(VALIDATOR_31E);
const ci = requireFile(CI);
const evidence31d = requireFile(EVIDENCE_31D);
const summary31d = requireFile(SUMMARY_31D);
const seed31e_doc = requireFile(SEED_31E);
const validator31d = requireFile(VALIDATOR_31D);

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
  `docs/testing/phase31e-data-safety-ux-controlled-visibility-gate.md`,
  `docs/release/phase31e-data-safety-ux-controlled-visibility-summary.md`,
  `docs/planning/phase31f-data-safety-ux-internal-visibility-seed.md`,
  `scripts/validate-phase31e-data-safety-ux-controlled-visibility-gate.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31E allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// Check no package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31E`);
  }
}

// Check no generated artifacts
for (const f of changedFiles) {
  if (
    f.startsWith('dist/') ||
    f.startsWith('coverage/') ||
    f.startsWith('node_modules/') ||
    f.startsWith(`test-results/`) ||
    f.startsWith(`playwright-report/`)
  ) {
    fail(`Forbidden: generated artifact changed: ${f}`);
  }
}

// Check no src/tests/e2e/ADR/release-notes changes
for (const f of changedFiles) {
  if (
    f.startsWith('src/') ||
    f.startsWith('tests/') ||
    f.startsWith('e2e/') ||
    f.startsWith('docs/adr/') ||
    f === 'RELEASE_NOTES.md' ||
    f === 'RELEASE_NOTES_V2.md'
  ) {
    fail(`Forbidden: ${f} changed — src/tests/e2e/ADR/release-notes not allowed in Phase 31E`);
  }
}

// Check no prior phase doc/script changes
const PRIOR_PHASE_PREFIXES = [
  'docs/planning/phase31d-',
  'docs/planning/phase31c-',
  'docs/planning/phase31b-',
  'docs/planning/phase31a-',
  'docs/planning/phase30',
  'docs/release/phase31d-',
  'docs/release/phase31c-',
  'docs/release/phase31b-',
  'docs/release/phase31a-',
  'docs/release/phase30',
  'docs/testing/phase31d-',
  'docs/testing/phase31c-',
  'docs/testing/phase31b-',
  'docs/testing/phase31a-',
  'scripts/validate-phase31d-',
  'scripts/validate-phase31c-',
  'scripts/validate-phase31b-',
  'scripts/validate-phase31a-',
  'scripts/validate-phase30',
];
for (const f of changedFiles) {
  for (const prefix of PRIOR_PHASE_PREFIXES) {
    if (f.startsWith(prefix)) {
      fail(`Forbidden: prior phase file modified: ${f}`);
    }
  }
}

// Check no backup/export/restore/storage/sync/cloud/backend/telemetry module changes
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
  /^src\/routes\//,
  /^src\/main\./,
  /^src\/serviceWorker/,
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
    ci.includes('Validate Phase 31E') &&
    /node scripts\/validate-phase31e-data-safety-ux-controlled-visibility-gate\.js/.test(ci)
  ) {
    pass('CI registers Phase 31E validator');
  } else {
    fail('CI must register Phase 31E validator with: node scripts/validate-phase31e-data-safety-ux-controlled-visibility-gate.js');
  }

  // Phase 31D validator must be commented out
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31d-data-safety-ux-evidence-review\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31D validator as an active Phase 31E blocker');
  } else {
    pass('Phase 31D validator is commented out (not an active Phase 31E blocker)');
  }

  if (ci.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune')) {
    fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  } else {
    pass('CI does not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
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

// ── 5. Validator self-check ───────────────────────────────────────────────────
console.log('\n[5] Validator self-checks');

if (validator31e) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31e)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31e)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31e)) {
    pass('Validator uses origin/main..HEAD for post-merge-main safe changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [gate31e, summary31e, seed31f, validator31e].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_STATUS: COMPLETED_CONTROLLED_VISIBILITY_GATE',
  'controlled visibility status'
);
checkToken(
  'PHASE31E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31E_VISIBILITY_SCOPE: VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE',
  'visibility scope'
);
checkToken(
  'PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase31f seed status'
);

// ── 7. Decision token value check ─────────────────────────────────────────────
console.log('\n[7] Decision token value');

const ALLOWED_DECISIONS = new Set([
  'PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY',
  'PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: NEEDS_MORE_EVIDENCE',
  'PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: HOLD_DATA_SAFETY_UX_VISIBILITY',
  'PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_LIMITED_SETTINGS_VISIBILITY',
]);

let decisionFound = false;
let chosenDecision = null;
for (const d of ALLOWED_DECISIONS) {
  if (ALL_DOCS_CONTENT.includes(d)) {
    pass(`Allowed decision token found: ${d}`);
    decisionFound = true;
    chosenDecision = d;
    break;
  }
}
if (!decisionFound) {
  fail('Required decision token missing — must be one of: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY / NEEDS_MORE_EVIDENCE / HOLD_DATA_SAFETY_UX_VISIBILITY / PASS_TO_LIMITED_SETTINGS_VISIBILITY');
}

// ── 8. Manual browser evidence status token check ─────────────────────────────
console.log('\n[8] Manual browser evidence status token');

const ALLOWED_BROWSER_STATUSES = new Set([
  'PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: PROVIDED_AND_REVIEWED',
  'PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED',
]);

let browserStatusFound = false;
let chosenBrowserStatus = null;
for (const s of ALLOWED_BROWSER_STATUSES) {
  if (ALL_DOCS_CONTENT.includes(s)) {
    pass(`Allowed manual browser evidence status found: ${s}`);
    browserStatusFound = true;
    chosenBrowserStatus = s;
    break;
  }
}
if (!browserStatusFound) {
  fail('Required manual browser evidence status token missing — must be one of: PROVIDED_AND_REVIEWED / NOT_PROVIDED_NOT_CLAIMED');
}

// ── 9. PASS_TO_LIMITED_SETTINGS_VISIBILITY must not be used with NOT_PROVIDED_NOT_CLAIMED
console.log('\n[9] Limited settings visibility guard');

if (
  chosenDecision === 'PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_LIMITED_SETTINGS_VISIBILITY' &&
  chosenBrowserStatus === 'PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED'
) {
  fail(
    'PASS_TO_LIMITED_SETTINGS_VISIBILITY requires manual browser evidence — ' +
    'PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS must not be NOT_PROVIDED_NOT_CLAIMED'
  );
} else {
  pass('Limited settings visibility guard: decision/browser-evidence combination is valid');
}

// ── 10. Required headings in controlled visibility gate doc ───────────────────
console.log('\n[10] Required headings in controlled visibility gate doc');

const REQUIRED_GATE_HEADINGS = [
  '# Phase 31E — Data Safety UX Controlled Visibility Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31D',
  '## Visibility gate method',
  '## Visibility decision table',
  '## Manual browser evidence boundary',
  '## Default-off internal visibility lane',
  '## Limited settings visibility lane',
  '## Visibility decision options',
  '## Chosen visibility decision',
  '## Decision rationale',
  '## What Phase 31E supports',
  '## What Phase 31E does not approve',
  '## Required gates before broader visibility',
  '## Open limitations',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_GATE_HEADINGS) {
  if (gate31e && gate31e.includes(heading)) {
    pass(`Required heading present: ${heading}`);
  } else {
    fail(`Required heading missing in controlled visibility gate doc: ${heading}`);
  }
}

// ── 11. Visibility decision table columns and rows ────────────────────────────
console.log('\n[11] Visibility decision table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Visibility option',
  'Source',
  'Evidence reviewed',
  'Status',
  'Limitation',
  'Decision impact',
  'Visibility allowed',
  'Visibility not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (gate31e && gate31e.includes(col)) {
    pass(`Visibility table column present: ${col}`);
  } else {
    fail(`Visibility table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'keep hidden/default-off',
  'default-off internal visibility',
  'limited settings visibility',
  'ordinary-user visibility',
  'manual browser evidence status',
  'static/unit evidence from Phase 31D',
  'rollback simplicity',
  'no storage/network/backup side effects',
  'BETA_READY absence',
  'sync/cloud/backend absence',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (gate31e && gate31e.toLowerCase().includes(row.toLowerCase())) {
    pass(`Visibility table row present: ${row}`);
  } else {
    fail(`Visibility table row missing: ${row}`);
  }
}

// ── 12. Required release summary headings ────────────────────────────────────
console.log('\n[12] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31E — Data Safety UX Controlled Visibility Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Visibility result',
  '## Chosen decision',
  '## Decision rationale',
  '## Manual browser evidence status',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_SUMMARY_HEADINGS) {
  if (summary31e && summary31e.includes(heading)) {
    pass(`Required summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 13. Phase 31F seed headings, token, and decision options ──────────────────
console.log('\n[13] Phase 31F seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 31F — Data Safety UX Internal Visibility Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31E',
  '## Internal visibility constraints',
  '## Allowed internal visibility options',
  '## Required gates before implementation',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed31f && seed31f.includes(heading)) {
    pass(`Required seed heading present: ${heading}`);
  } else {
    fail(`Required seed heading missing: ${heading}`);
  }
}

if (seed31f && seed31f.includes('PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 31F seed token present');
} else {
  fail('Phase 31F seed token missing: PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_INTERNAL_VISIBILITY',
  'NEEDS_MANUAL_BROWSER_EVIDENCE',
  'PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed31f && seed31f.includes(opt)) {
    pass(`Phase 31F seed decision option present: ${opt}`);
  } else {
    fail(`Phase 31F seed decision option missing: ${opt}`);
  }
}

// Phase 31F must be framed as a separate gate
if (seed31f && seed31f.includes('Phase 31F is a separate internal visibility gate and is not automatically approved')) {
  pass('Phase 31F framed as separate internal visibility gate');
} else {
  fail('Phase 31F seed must state: Phase 31F is a separate internal visibility gate and is not automatically approved');
}

// ── 14. Forbidden approval phrases in docs ────────────────────────────────────
console.log('\n[14] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31E approved',
  'Phase 31E is approved',
  'Phase 31E has passed',
  'Phase 31F approved',
  'Phase 31F automatically approved',
  'Phase 31F pass',
  'Phase 31F PASS',
  'Phase 31E approves BETA_READY',
  'Phase 31E approves public production',
  'Phase 31E approves restore execution',
  'Phase 31E approves production restore',
  'Phase 31E approves storage migration',
  'Phase 31E approves sync',
  'Phase 31E approves telemetry',
  'Phase 31E approves backup file format',
  'Phase 31E approves restore overwrite',
  'Phase 31E approves BYOC',
  'Phase 31E approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
];

const DOCS_CHECK_CONTENT = [gate31e, summary31e].filter(Boolean).join('\n');
for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (DOCS_CHECK_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// Check that gate doc explicitly states no broad validation
if (gate31e && gate31e.includes('No broad validation has been performed')) {
  pass('Gate doc states no broad validation has been performed');
} else if (gate31e) {
  fail('Gate doc must state: No broad validation has been performed');
}

// ── 15. Required "does not approve" statements ───────────────────────────────
console.log('\n[15] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 31E does not approve BETA_READY',
  'Phase 31E does not approve public production readiness',
  'Phase 31E does not approve guaranteed data-loss prevention',
  'Phase 31E does not approve restore execution',
  'Phase 31E does not approve production restore rehearsal',
  'Phase 31E does not approve real learner data restore rehearsal',
  'Phase 31E does not approve runtime backup/export/restore behavior changes',
  'Phase 31E does not approve backup file format changes',
  'Phase 31E does not approve restore overwrite behavior changes',
  'Phase 31E does not approve storage migration',
  'Phase 31E does not approve sync/cloud/account/auth/backend',
  'Phase 31E does not approve telemetry/analytics',
  'Phase 31E does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31E does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 31E does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 31F — Data Safety UX Internal Visibility Gate',
  'Phase 31F is a separate internal visibility gate and is not automatically approved',
  'Phase 31E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31E does not approve BETA_READY',
];

for (const phrase of REQUIRED_NEXT_PHASE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Next-phase statement present: "${phrase}"`);
  } else {
    fail(`Next-phase statement missing: "${phrase}"`);
  }
}

// ── 17. Gate doc key statements ───────────────────────────────────────────────
console.log('\n[17] Gate doc key statements');

const REQUIRED_GATE_STATEMENTS = [
  'Phase 31E does not change runtime visibility',
  'Phase 31E passes only to a separate Phase 31F internal visibility gate',
  'Limited settings visibility to ordinary users is not approved without manual browser evidence',
  'Manual browser evidence remains',
  'NOT_PROVIDED_NOT_CLAIMED',
];

for (const stmt of REQUIRED_GATE_STATEMENTS) {
  if (gate31e && gate31e.includes(stmt)) {
    pass(`Gate doc statement present: "${stmt}"`);
  } else {
    fail(`Gate doc statement missing: "${stmt}"`);
  }
}

// ── Final report ──────────────────────────────────────────────────────────────
console.log('\n' + '='.repeat(70));
console.log('PHASE31E VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_STATUS: COMPLETED_CONTROLLED_VISIBILITY_GATE');
  console.log('PHASE31E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31E_DATA_SAFETY_UX_VISIBILITY_DECISION: PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY');
  console.log('PHASE31E_VISIBILITY_SCOPE: VISIBILITY_GATE_ONLY_NO_RUNTIME_VISIBILITY_CHANGE');
  console.log('PHASE31E_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED');
  console.log('PHASE31F_DATA_SAFETY_UX_INTERNAL_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nRESULT: FAIL (${ERRORS.length} error${ERRORS.length !== 1 ? 's' : ''})`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  process.exit(1);
}
