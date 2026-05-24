#!/usr/bin/env node
/**
 * scripts/validate-phase31d-data-safety-ux-evidence-review.js
 *
 * Phase 31D — Data Safety UX Evidence Review Validator
 *
 * PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_EVIDENCE_REVIEW
 * PHASE31D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31D_EVIDENCE_SCOPE: DEFAULT_OFF_PROTOTYPE_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_31D = `docs/testing/phase31d-data-safety-ux-evidence-review.md`;
const SUMMARY_31D = `docs/release/phase31d-data-safety-ux-evidence-review-summary.md`;
const SEED_31E = `docs/planning/phase31e-data-safety-ux-controlled-visibility-seed.md`;
const VALIDATOR_31D = `scripts/validate-phase31d-data-safety-ux-evidence-review.js`;
const CI = `.github/workflows/e2e-smoke.yml`;

// Phase 31C inputs (must still exist)
const EVIDENCE_31C = `docs/testing/phase31c-data-safety-ux-prototype-evidence.md`;
const SEED_31D = `docs/planning/phase31d-data-safety-ux-evidence-review-seed.md`;
const VALIDATOR_31C = `scripts/validate-phase31c-data-safety-ux-prototype.js`;

const evidence31d = requireFile(EVIDENCE_31D);
const summary31d = requireFile(SUMMARY_31D);
const seed31e = requireFile(SEED_31E);
const validator31d = requireFile(VALIDATOR_31D);
const ci = requireFile(CI);
const evidence31c = requireFile(EVIDENCE_31C);
const seed31d_doc = requireFile(SEED_31D);
const validator31c = requireFile(VALIDATOR_31C);

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
  `docs/testing/phase31d-data-safety-ux-evidence-review.md`,
  `docs/release/phase31d-data-safety-ux-evidence-review-summary.md`,
  `docs/planning/phase31e-data-safety-ux-controlled-visibility-seed.md`,
  `scripts/validate-phase31d-data-safety-ux-evidence-review.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31D allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// Check no package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31D`);
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
    fail(`Forbidden: ${f} changed — src/tests/e2e/ADR/release-notes not allowed in Phase 31D`);
  }
}

// Check no prior phase doc/script changes
const PRIOR_PHASE_PREFIXES = [
  'docs/planning/phase31c-',
  'docs/planning/phase31b-',
  'docs/planning/phase31a-',
  'docs/planning/phase30',
  'docs/release/phase31c-',
  'docs/release/phase31b-',
  'docs/release/phase31a-',
  'docs/release/phase30',
  'docs/testing/phase31c-',
  'docs/testing/phase31b-',
  'docs/testing/phase31a-',
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
    ci.includes('Validate Phase 31D') &&
    /node scripts\/validate-phase31d-data-safety-ux-evidence-review\.js/.test(ci)
  ) {
    pass('CI registers Phase 31D validator');
  } else {
    fail('CI must register Phase 31D validator with: node scripts/validate-phase31d-data-safety-ux-evidence-review.js');
  }

  // Phase 31C validator must be commented out
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31c-data-safety-ux-prototype\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31C validator as an active Phase 31D blocker');
  } else {
    pass('Phase 31C validator is commented out (not an active Phase 31D blocker)');
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

if (validator31d) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31d)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31d)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31d)) {
    pass('Validator uses origin/main..HEAD for post-merge-main safe changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [evidence31d, summary31d, seed31e, validator31d].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_EVIDENCE_REVIEW',
  'evidence review status'
);
checkToken(
  'PHASE31D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31D_EVIDENCE_SCOPE: DEFAULT_OFF_PROTOTYPE_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'evidence scope'
);
checkToken(
  'PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase31e seed status'
);

// ── 7. Decision token value check ─────────────────────────────────────────────
console.log('\n[7] Decision token value');

const ALLOWED_DECISIONS = new Set([
  'PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE',
  'PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: NEEDS_MORE_EVIDENCE',
  'PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: HOLD_DATA_SAFETY_UX_PROTOTYPE',
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
  fail('Required decision token missing — must be one of: PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE / NEEDS_MORE_EVIDENCE / HOLD_DATA_SAFETY_UX_PROTOTYPE');
}

// ── 8. Manual browser evidence status token check ─────────────────────────────
console.log('\n[8] Manual browser evidence status token');

const ALLOWED_BROWSER_STATUSES = new Set([
  'PHASE31D_MANUAL_BROWSER_EVIDENCE_STATUS: PROVIDED_AND_REVIEWED',
  'PHASE31D_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED',
]);

let browserStatusFound = false;
for (const s of ALLOWED_BROWSER_STATUSES) {
  if (ALL_DOCS_CONTENT.includes(s)) {
    pass(`Allowed manual browser evidence status found: ${s}`);
    browserStatusFound = true;
    break;
  }
}
if (!browserStatusFound) {
  fail('Required manual browser evidence status token missing — must be one of: PROVIDED_AND_REVIEWED / NOT_PROVIDED_NOT_CLAIMED');
}

// ── 9. Required headings in evidence review doc ───────────────────────────────
console.log('\n[9] Required headings in evidence review doc');

const REQUIRED_HEADINGS = [
  '# Phase 31D — Data Safety UX Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31C',
  '## Evidence method',
  '## Evidence review table',
  '## Manual browser evidence status',
  '## Default-off behavior review',
  '## Settings render boundary review',
  '## Static UI section review',
  '## Storage and network boundary review',
  '## Backup/export/restore boundary review',
  '## Telemetry/sync/cloud/backend boundary review',
  '## Unit test evidence review',
  '## Build and validator evidence review',
  '## Rollback evidence review',
  '## Open limitations',
  '## Chosen evidence decision',
  '## Decision rationale',
  '## What Phase 31D supports',
  '## What Phase 31D does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_HEADINGS) {
  if (evidence31d && evidence31d.includes(heading)) {
    pass(`Required heading present: ${heading}`);
  } else {
    fail(`Required heading missing in evidence review doc: ${heading}`);
  }
}

// ── 10. Evidence review table columns and rows ────────────────────────────────
console.log('\n[10] Evidence review table columns and rows');

const REQUIRED_TABLE_COLUMNS = [
  'Evidence area',
  'Source',
  'Evidence reviewed',
  'Status',
  'Limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];

for (const col of REQUIRED_TABLE_COLUMNS) {
  if (evidence31d && evidence31d.includes(col)) {
    pass(`Evidence table column present: ${col}`);
  } else {
    fail(`Evidence table column missing: ${col}`);
  }
}

const REQUIRED_TABLE_ROWS = [
  'Phase 31C default-off flag',
  'Settings default empty config',
  'test/dev activation',
  'nine static UI sections',
  'placeholder/inert',
  'no storage writes',
  'no network',
  'no backup',
  'no sync',
  'unit test',
  'build evidence',
  'validator evidence',
  'patch apply',
  'rollback',
  'manual browser',
  'BETA_READY',
];

for (const row of REQUIRED_TABLE_ROWS) {
  if (evidence31d && evidence31d.toLowerCase().includes(row.toLowerCase())) {
    pass(`Evidence table row present: ${row}`);
  } else {
    fail(`Evidence table row missing: ${row}`);
  }
}

// ── 11. Required release summary headings ────────────────────────────────────
console.log('\n[11] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31D — Data Safety UX Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Evidence result',
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
  if (summary31d && summary31d.includes(heading)) {
    pass(`Required summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 12. Phase 31E seed headings and tokens ────────────────────────────────────
console.log('\n[12] Phase 31E seed headings and tokens');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 31E — Data Safety UX Controlled Visibility Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31D',
  '## Visibility constraints',
  '## Allowed visibility options',
  '## Required gates before any visibility change',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed31e && seed31e.includes(heading)) {
    pass(`Required seed heading present: ${heading}`);
  } else {
    fail(`Required seed heading missing: ${heading}`);
  }
}

if (seed31e && seed31e.includes('PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 31E seed token present');
} else {
  fail('Phase 31E seed token missing: PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_DATA_SAFETY_UX_VISIBILITY',
  'NEEDS_MORE_EVIDENCE',
  'PASS_TO_DEFAULT_OFF_INTERNAL_VISIBILITY',
  'PASS_TO_LIMITED_SETTINGS_VISIBILITY',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed31e && seed31e.includes(opt)) {
    pass(`Phase 31E seed decision option present: ${opt}`);
  } else {
    fail(`Phase 31E seed decision option missing: ${opt}`);
  }
}

// ── 13. Forbidden approval phrases in docs ────────────────────────────────────
console.log('\n[13] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31E approved',
  'Phase 31E pass',
  'Phase 31E PASS',
  'Phase 31D approves BETA_READY',
  'Phase 31D approves public production',
  'Phase 31D approves restore execution',
  'Phase 31D approves production restore',
  'Phase 31D approves storage migration',
  'Phase 31D approves sync',
  'Phase 31D approves telemetry',
  'Phase 31D approves backup file format',
  'Phase 31D approves restore overwrite',
  'Phase 31D approves BYOC',
];

const DOCS_CHECK_CONTENT = [evidence31d, summary31d].filter(Boolean).join('\n');
for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (DOCS_CHECK_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// Check that evidence doc explicitly states no broad validation
if (evidence31d && evidence31d.includes('No broad validation has been performed')) {
  pass('Evidence doc states no broad validation has been performed');
} else if (evidence31d) {
  fail('Evidence doc must state: No broad validation has been performed');
}

// ── 14. Required "does not approve" statements ───────────────────────────────
console.log('\n[14] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 31D does not approve BETA_READY',
  'Phase 31D does not approve public production readiness',
  'Phase 31D does not approve guaranteed data-loss prevention',
  'Phase 31D does not approve restore execution',
  'Phase 31D does not approve production restore rehearsal',
  'Phase 31D does not approve real learner data restore rehearsal',
  'Phase 31D does not approve runtime backup/export/restore behavior changes',
  'Phase 31D does not approve backup file format changes',
  'Phase 31D does not approve restore overwrite behavior changes',
  'Phase 31D does not approve storage migration',
  'Phase 31D does not approve sync/cloud/account/auth/backend',
  'Phase 31D does not approve telemetry/analytics',
  'Phase 31D does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31D does not approve BYOC/WebDAV/P2P/device-transfer implementation',
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
  'Next recommended phase: Phase 31E — Data Safety UX Controlled Visibility Gate',
  'Phase 31E is a separate visibility gate and is not automatically approved',
  'Phase 31D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31D does not approve BETA_READY',
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
console.log('PHASE31D VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_EVIDENCE_REVIEW');
  console.log('PHASE31D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31D_DATA_SAFETY_UX_EVIDENCE_DECISION: PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE');
  console.log('PHASE31D_EVIDENCE_SCOPE: DEFAULT_OFF_PROTOTYPE_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE31E_DATA_SAFETY_UX_CONTROLLED_VISIBILITY_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nRESULT: FAIL (${ERRORS.length} error${ERRORS.length !== 1 ? 's' : ''})`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  process.exit(1);
}
