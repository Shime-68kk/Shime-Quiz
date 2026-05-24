#!/usr/bin/env node
/**
 * scripts/validate-phase31h-data-safety-ux-internal-visibility-evidence-review.js
 *
 * Phase 31H — Data Safety UX Internal Visibility Evidence Review Validator
 *
 * PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_STATUS: COMPLETED_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
 * PHASE31H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
 * PHASE31H_EVIDENCE_SCOPE: INTERNAL_VISIBILITY_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED
 * PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED
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

const EVIDENCE_31H = `docs/testing/phase31h-data-safety-ux-internal-visibility-evidence-review.md`;
const SUMMARY_31H  = `docs/release/phase31h-data-safety-ux-internal-visibility-evidence-review-summary.md`;
const SEED_31I     = `docs/planning/phase31i-data-safety-ux-internal-browser-evidence-seed.md`;
const VALIDATOR_31H = `scripts/validate-phase31h-data-safety-ux-internal-visibility-evidence-review.js`;
const CI           = `.github/workflows/e2e-smoke.yml`;

// Phase 31G inputs (must still exist)
const HELPER_31G   = `src/features/dataSafety/dataSafetyInternalVisibility.js`;
const EVIDENCE_31G = `docs/testing/phase31g-data-safety-ux-internal-visibility-implementation-evidence.md`;
const SUMMARY_31G  = `docs/release/phase31g-data-safety-ux-internal-visibility-implementation-summary.md`;
const SEED_31H_FROM_31G = `docs/planning/phase31h-data-safety-ux-internal-visibility-evidence-review-seed.md`;
const VALIDATOR_31G = `scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js`;

const evidence31h = requireFile(EVIDENCE_31H);
const summary31h  = requireFile(SUMMARY_31H);
const seed31i     = requireFile(SEED_31I);
const validator31h = requireFile(VALIDATOR_31H);
const ci          = requireFile(CI);

const helper31g      = requireFile(HELPER_31G);
const evidence31g    = requireFile(EVIDENCE_31G);
const summary31g     = requireFile(SUMMARY_31G);
const seed31hFrom31g = requireFile(SEED_31H_FROM_31G);
const validator31g   = requireFile(VALIDATOR_31G);

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
  `docs/testing/phase31h-data-safety-ux-internal-visibility-evidence-review.md`,
  `docs/release/phase31h-data-safety-ux-internal-visibility-evidence-review-summary.md`,
  `docs/planning/phase31i-data-safety-ux-internal-browser-evidence-seed.md`,
  `scripts/validate-phase31h-data-safety-ux-internal-visibility-evidence-review.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31H allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// No package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31H`);
  }
}

// No generated artifacts
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

// No src/tests/e2e/ADR/release-notes changes
for (const f of changedFiles) {
  if (f.startsWith('src/')) {
    fail(`Forbidden: src file changed in Phase 31H (docs/validator-only phase): ${f}`);
  }
  if (f.startsWith('tests/')) {
    fail(`Forbidden: tests file changed in Phase 31H (docs/validator-only phase): ${f}`);
  }
  if (f.startsWith('e2e/')) {
    fail(`Forbidden: e2e file changed in Phase 31H: ${f}`);
  }
  if (f.startsWith('docs/adr/')) {
    fail(`Forbidden: ADR file changed in Phase 31H: ${f}`);
  }
  if (f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md') {
    fail(`Forbidden: ${f} changed — release notes not allowed in Phase 31H`);
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
  'docs/planning/phase31h-data-safety-ux-internal-visibility-evidence-review-seed',
  'docs/planning/phase31g-',
  'docs/planning/phase31f-',
  'docs/planning/phase31e-',
  'docs/planning/phase31d-',
  'docs/planning/phase31c-',
  'docs/planning/phase31b-',
  'docs/planning/phase31a-',
  'docs/planning/phase30',
  'docs/release/phase31g-',
  'docs/release/phase31f-',
  'docs/release/phase31e-',
  'docs/release/phase31d-',
  'docs/release/phase31c-',
  'docs/release/phase31b-',
  'docs/release/phase31a-',
  'docs/release/phase30',
  'docs/testing/phase31g-',
  'docs/testing/phase31f-',
  'docs/testing/phase31e-',
  'docs/testing/phase31d-',
  'docs/testing/phase31c-',
  'docs/testing/phase31b-',
  'docs/testing/phase31a-',
  'scripts/validate-phase31g-',
  'scripts/validate-phase31f-',
  'scripts/validate-phase31e-',
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
    ci.includes('Validate Phase 31H') &&
    /node scripts\/validate-phase31h-data-safety-ux-internal-visibility-evidence-review\.js/.test(ci)
  ) {
    pass('CI registers Phase 31H validator');
  } else {
    fail('CI must register Phase 31H validator with: node scripts/validate-phase31h-data-safety-ux-internal-visibility-evidence-review.js');
  }

  // Phase 31G validator must be commented out (not an active Phase 31H blocker)
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31g-data-safety-ux-internal-visibility-implementation\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31G validator as an active Phase 31H blocker');
  } else {
    pass('Phase 31G validator is commented out (not an active Phase 31H blocker)');
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

if (validator31h) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31h)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31h)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31h)) {
    pass('Validator uses origin/main..HEAD for changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [evidence31h, summary31h, seed31i, validator31h].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_STATUS: COMPLETED_INTERNAL_VISIBILITY_EVIDENCE_REVIEW',
  'evidence review status'
);
checkToken(
  'PHASE31H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31H_EVIDENCE_SCOPE: INTERNAL_VISIBILITY_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'evidence scope'
);
checkToken(
  'PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase31i seed status'
);

// ── 7. Evidence decision token ────────────────────────────────────────────────
console.log('\n[7] Evidence decision token');

const ALLOWED_DECISIONS = new Set([
  'PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION',
  'PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: NEEDS_BROWSER_EVIDENCE',
  'PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION',
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
    'PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION / ' +
    'NEEDS_BROWSER_EVIDENCE / HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION'
  );
}

// ── 8. Manual browser evidence status token ───────────────────────────────────
console.log('\n[8] Manual browser evidence status token');

const ALLOWED_BROWSER_STATUSES = new Set([
  'PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: PROVIDED_AND_REVIEWED',
  'PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED',
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
  fail(
    'Required manual browser evidence status token missing — must be one of: ' +
    'PROVIDED_AND_REVIEWED / NOT_PROVIDED_NOT_CLAIMED'
  );
}

// ── 9. Required evidence review doc headings ──────────────────────────────────
console.log('\n[9] Required evidence review doc headings');

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 31H — Data Safety UX Internal Visibility Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31G',
  '## Evidence method',
  '## Evidence review table',
  '## Manual browser evidence status',
  '## Default-off behavior review',
  '## Env flag activation review',
  '## Settings integration review',
  '## Ordinary-user visibility boundary review',
  '## Storage and network boundary review',
  '## Backup/export/restore boundary review',
  '## Telemetry/sync/cloud/backend boundary review',
  '## Unit test evidence review',
  '## Build and validator evidence review',
  '## Rollback evidence review',
  '## Open limitations',
  '## Chosen evidence decision',
  '## Decision rationale',
  '## What Phase 31H supports',
  '## What Phase 31H does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_HEADINGS) {
  if (evidence31h && evidence31h.includes(heading)) {
    pass(`Evidence heading present: ${heading}`);
  } else {
    fail(`Required evidence heading missing: ${heading}`);
  }
}

// ── 10. Evidence review table columns and rows ────────────────────────────────
console.log('\n[10] Evidence review table columns and rows');

if (evidence31h) {
  const TABLE_COLUMNS = [
    'Evidence area',
    'Source',
    'Evidence reviewed',
    'Status',
    'Limitation',
    'Decision impact',
    'Claim allowed',
    'Claim not allowed',
  ];
  for (const col of TABLE_COLUMNS) {
    if (evidence31h.includes(col)) {
      pass(`Table column present: ${col}`);
    } else {
      fail(`Required table column missing: ${col}`);
    }
  }

  const TABLE_ROWS = [
    'Phase 31G internal visibility helper default-off',
    'missing env flag hidden',
    'invalid env hidden',
    'explicit true env values',
    'dev/test/internal-compatible activation',
    'ordinary production hidden',
    'Settings integration limited to Settings.jsx',
    'no user-visible toggle',
    'no storage/persistence APIs',
    'no network/backend/telemetry APIs',
    'no backup/export/restore imports or behavior changes',
    'no sync/cloud/account/auth imports',
    'unit test evidence',
    'build evidence',
    'validator evidence',
    'patch apply evidence',
    'rollback plan evidence',
    'manual browser evidence status',
    'BETA_READY absence',
  ];
  for (const row of TABLE_ROWS) {
    if (evidence31h.includes(row)) {
      pass(`Table row present: ${row}`);
    } else {
      fail(`Required table row missing: ${row}`);
    }
  }
}

// ── 11. Required release summary headings ────────────────────────────────────
console.log('\n[11] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31H — Data Safety UX Internal Visibility Evidence Review Summary',
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
  if (summary31h && summary31h.includes(heading)) {
    pass(`Summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

// ── 12. Phase 31I seed headings, token, and decision options ──────────────────
console.log('\n[12] Phase 31I seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 31I — Data Safety UX Internal Browser Evidence Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31H',
  '## Browser evidence constraints',
  '## Required browser checks',
  '## Required static checks',
  '## Required rollback checks',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed31i && seed31i.includes(heading)) {
    pass(`Phase 31I seed heading present: ${heading}`);
  } else {
    fail(`Required Phase 31I seed heading missing: ${heading}`);
  }
}

if (seed31i && seed31i.includes('PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 31I seed status token present');
} else {
  fail('Phase 31I seed status token missing: PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_INTERNAL_BROWSER_EVIDENCE',
  'NEEDS_MORE_EVIDENCE',
  'PASS_INTERNAL_BROWSER_EVIDENCE',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed31i && seed31i.includes(opt)) {
    pass(`Phase 31I seed decision option present: ${opt}`);
  } else {
    fail(`Phase 31I seed decision option missing: ${opt}`);
  }
}

if (seed31i && seed31i.includes('Phase 31I is a separate browser evidence gate and is not automatically approved')) {
  pass('Phase 31I framed as separate browser evidence gate');
} else {
  fail('Phase 31I seed must state: Phase 31I is a separate browser evidence gate and is not automatically approved');
}

// ── 13. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[13] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31H approved',
  'Phase 31H is approved',
  'Phase 31H approves BETA_READY',
  'Phase 31H approves public production',
  'Phase 31H approves restore execution',
  'Phase 31H approves production restore',
  'Phase 31H approves storage migration',
  'Phase 31H approves sync',
  'Phase 31H approves telemetry',
  'Phase 31H approves backup file format',
  'Phase 31H approves restore overwrite',
  'Phase 31H approves BYOC',
  'Phase 31H approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 31I approved',
  'Phase 31I automatically approved',
  'Phase 31I PASS',
  'browser-confirmed default-off confirmed',
  'browser-confirmed ordinary-user hidden confirmed',
];

const DOCS_CHECK_CONTENT = [evidence31h, summary31h].filter(Boolean).join('\n');
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
  'Phase 31H does not approve BETA_READY',
  'Phase 31H does not approve public production readiness',
  'Phase 31H does not approve guaranteed data-loss prevention',
  'Phase 31H does not approve restore execution',
  'Phase 31H does not approve production restore rehearsal',
  'Phase 31H does not approve real learner data restore rehearsal',
  'Phase 31H does not approve runtime backup/export/restore behavior changes',
  'Phase 31H does not approve backup file format changes',
  'Phase 31H does not approve restore overwrite behavior changes',
  'Phase 31H does not approve storage migration',
  'Phase 31H does not approve sync/cloud/account/auth/backend',
  'Phase 31H does not approve telemetry/analytics',
  'Phase 31H does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31H does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 31H does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 31I — Data Safety UX Internal Browser Evidence',
  'Phase 31I is a separate browser evidence gate and is not automatically approved',
  'Phase 31H confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31H does not approve BETA_READY',
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
console.log('PHASE31H VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_STATUS: COMPLETED_INTERNAL_VISIBILITY_EVIDENCE_REVIEW');
  console.log('PHASE31H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_DECISION: PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION');
  console.log('PHASE31H_EVIDENCE_SCOPE: INTERNAL_VISIBILITY_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES');
  console.log('PHASE31H_MANUAL_BROWSER_EVIDENCE_STATUS: NOT_PROVIDED_NOT_CLAIMED');
  console.log('PHASE31I_DATA_SAFETY_UX_INTERNAL_BROWSER_EVIDENCE_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nRESULT: FAIL (${ERRORS.length} error${ERRORS.length !== 1 ? 's' : ''})`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  process.exit(1);
}
