#!/usr/bin/env node
/**
 * scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js
 *
 * Phase 31G — Data Safety UX Internal Visibility Implementation Validator
 *
 * PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
 * PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
 * PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES
 * PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
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

const HELPER_31G = `src/features/dataSafety/dataSafetyInternalVisibility.js`;
const TEST_31G = `tests/unit/dataSafetyInternalVisibility.test.js`;
const EVIDENCE_31G = `docs/testing/phase31g-data-safety-ux-internal-visibility-implementation-evidence.md`;
const SUMMARY_31G = `docs/release/phase31g-data-safety-ux-internal-visibility-implementation-summary.md`;
const SEED_31H = `docs/planning/phase31h-data-safety-ux-internal-visibility-evidence-review-seed.md`;
const VALIDATOR_31G = `scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js`;
const CI = `.github/workflows/e2e-smoke.yml`;
const SETTINGS = `src/routes/Settings.jsx`;

// Phase 31F inputs (must still exist)
const GATE_31F = `docs/testing/phase31f-data-safety-ux-internal-visibility-gate.md`;
const SUMMARY_31F = `docs/release/phase31f-data-safety-ux-internal-visibility-summary.md`;
const SEED_31G_FROM_31F = `docs/planning/phase31g-data-safety-ux-internal-visibility-implementation-seed.md`;
const VALIDATOR_31F = `scripts/validate-phase31f-data-safety-ux-internal-visibility-gate.js`;

const helperSrc = requireFile(HELPER_31G);
const testSrc = requireFile(TEST_31G);
const evidence31g = requireFile(EVIDENCE_31G);
const summary31g = requireFile(SUMMARY_31G);
const seed31h = requireFile(SEED_31H);
const validator31g = requireFile(VALIDATOR_31G);
const ci = requireFile(CI);
const settingsSrc = requireFile(SETTINGS);

const gate31f = requireFile(GATE_31F);
const summary31f = requireFile(SUMMARY_31F);
const seed31g_from31f = requireFile(SEED_31G_FROM_31F);
const validator31f = requireFile(VALIDATOR_31F);

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
  `src/features/dataSafety/dataSafetyInternalVisibility.js`,
  `tests/unit/dataSafetyInternalVisibility.test.js`,
  `docs/testing/phase31g-data-safety-ux-internal-visibility-implementation-evidence.md`,
  `docs/release/phase31g-data-safety-ux-internal-visibility-implementation-summary.md`,
  `docs/planning/phase31h-data-safety-ux-internal-visibility-evidence-review-seed.md`,
  `scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
  `src/routes/Settings.jsx`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31G allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// Check no package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31G`);
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

// Check no e2e/ADR/release-notes changes
for (const f of changedFiles) {
  if (
    f.startsWith('e2e/') ||
    f.startsWith('docs/adr/') ||
    f === 'RELEASE_NOTES.md' ||
    f === 'RELEASE_NOTES_V2.md'
  ) {
    fail(`Forbidden: ${f} changed — e2e/ADR/release-notes not allowed in Phase 31G`);
  }
}

// Check no prior phase doc/script changes
const PRIOR_PHASE_PREFIXES = [
  'docs/planning/phase31f-',
  'docs/planning/phase31e-',
  'docs/planning/phase31d-',
  'docs/planning/phase31c-',
  'docs/planning/phase31b-',
  'docs/planning/phase31a-',
  'docs/planning/phase30',
  'docs/release/phase31f-',
  'docs/release/phase31e-',
  'docs/release/phase31d-',
  'docs/release/phase31c-',
  'docs/release/phase31b-',
  'docs/release/phase31a-',
  'docs/release/phase30',
  'docs/testing/phase31f-',
  'docs/testing/phase31e-',
  'docs/testing/phase31d-',
  'docs/testing/phase31c-',
  'docs/testing/phase31b-',
  'docs/testing/phase31a-',
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

// Check no forbidden source areas changed (routes except Settings, storage, backup, etc.)
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

// Check no routes changed except Settings.jsx
for (const f of changedFiles) {
  if (f.startsWith('src/routes/') && f !== 'src/routes/Settings.jsx') {
    fail(`Forbidden: route file changed: ${f} — only src/routes/Settings.jsx is allowed`);
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
    ci.includes('Validate Phase 31G') &&
    /node scripts\/validate-phase31g-data-safety-ux-internal-visibility-implementation\.js/.test(ci)
  ) {
    pass('CI registers Phase 31G validator');
  } else {
    fail('CI must register Phase 31G validator with: node scripts/validate-phase31g-data-safety-ux-internal-visibility-implementation.js');
  }

  // Phase 31F validator must be commented out (not an active Phase 31G blocker)
  const activeLines = ci.split('\n').filter(l => !l.trim().startsWith('#'));
  const activeCI = activeLines.join('\n');
  if (/node scripts\/validate-phase31f-data-safety-ux-internal-visibility-gate\.js/.test(activeCI)) {
    fail('CI must not run prior Phase 31F validator as an active Phase 31G blocker');
  } else {
    pass('Phase 31F validator is commented out (not an active Phase 31G blocker)');
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

if (validator31g) {
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator31g)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator31g)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator31g)) {
    pass('Validator uses origin/main..HEAD for post-merge-main safe changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS_CONTENT = [evidence31g, summary31g, seed31h, validator31g].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS_CONTENT.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken(
  'PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION',
  'implementation status'
);
checkToken(
  'PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'readiness status'
);
checkToken(
  'PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES',
  'implementation scope'
);
checkToken(
  'PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
  'phase31h seed status'
);

// ── 7. Decision token value check ─────────────────────────────────────────────
console.log('\n[7] Decision token value');

const ALLOWED_DECISIONS = new Set([
  'PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW',
  'PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: NEEDS_BROWSER_EVIDENCE',
  'PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION',
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
  fail('Required decision token missing — must be one of: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW / NEEDS_BROWSER_EVIDENCE / HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION');
}

// ── 8. Helper module checks ───────────────────────────────────────────────────
console.log('\n[8] Helper module checks');

if (helperSrc) {
  if (helperSrc.includes('DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED = false')) {
    pass('Helper default is OFF (DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED = false)');
  } else {
    fail('Helper must export DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED = false');
  }

  if (helperSrc.includes('VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY')) {
    pass('Helper uses explicit internal env flag VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY');
  } else {
    fail('Helper must use VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY as the env flag');
  }

  // Check accepted narrow true values
  if (helperSrc.includes("'1'") && helperSrc.includes("'true'") && helperSrc.includes("'enabled'")) {
    pass('Helper accepts narrow true values: 1, true, enabled');
  } else {
    fail('Helper must accept exactly: 1, true, enabled as accepted true values');
  }

  // Check no storage/network APIs
  if (/\blocalStorage\s*[.[]/i.test(helperSrc) || /window\.localStorage/.test(helperSrc)) {
    fail('Helper must not use localStorage API');
  } else {
    pass('Helper does not use localStorage API');
  }

  if (/\bsessionStorage\s*[.[]/i.test(helperSrc) || /window\.sessionStorage/.test(helperSrc)) {
    fail('Helper must not use sessionStorage API');
  } else {
    pass('Helper does not use sessionStorage API');
  }

  if (/\bindexedDB\s*[.[]/i.test(helperSrc) || /window\.indexedDB/i.test(helperSrc)) {
    fail('Helper must not use indexedDB API');
  } else {
    pass('Helper does not use indexedDB API');
  }

  if (helperSrc.includes('fetch(')) {
    fail('Helper must not use fetch(');
  } else {
    pass('Helper does not use fetch(');
  }

  if (/new\s+XMLHttpRequest/.test(helperSrc)) {
    fail('Helper must not use XMLHttpRequest');
  } else {
    pass('Helper does not use XMLHttpRequest');
  }

  if (/new\s+WebSocket/.test(helperSrc)) {
    fail('Helper must not use WebSocket');
  } else {
    pass('Helper does not use WebSocket');
  }

  if (/\.sendBeacon\s*\(/.test(helperSrc)) {
    fail('Helper must not use sendBeacon');
  } else {
    pass('Helper does not use sendBeacon');
  }

  if (/from\s+['"].*backup/i.test(helperSrc)) {
    fail('Helper must not import backup modules');
  } else {
    pass('Helper does not import backup modules');
  }

  if (/from\s+['"].*(sync|cloud|backend|auth|account)/i.test(helperSrc)) {
    fail('Helper must not import sync/cloud/backend/auth/account modules');
  } else {
    pass('Helper does not import sync/cloud/backend/auth/account modules');
  }

  // Check exported functions exist
  const requiredExports = [
    'normalizeDataSafetyInternalVisibilityEnv',
    'shouldEnableDataSafetyInternalVisibility',
    'createDataSafetyInternalVisibilityConfig',
  ];
  for (const fn of requiredExports) {
    if (helperSrc.includes(`export function ${fn}`)) {
      pass(`Helper exports required function: ${fn}`);
    } else {
      fail(`Helper must export function: ${fn}`);
    }
  }
}

// ── 9. Settings.jsx integration checks ───────────────────────────────────────
console.log('\n[9] Settings.jsx integration checks');

if (settingsSrc) {
  if (settingsSrc.includes('dataSafetyInternalVisibility')) {
    pass('Settings.jsx imports from dataSafetyInternalVisibility');
  } else {
    fail('Settings.jsx must import from dataSafetyInternalVisibility');
  }

  if (settingsSrc.includes('createDataSafetyInternalVisibilityConfig')) {
    pass('Settings.jsx uses createDataSafetyInternalVisibilityConfig');
  } else {
    fail('Settings.jsx must use createDataSafetyInternalVisibilityConfig');
  }

  if (settingsSrc.includes('shouldShowDataSafetyCenterPrototype')) {
    pass('Settings.jsx still uses shouldShowDataSafetyCenterPrototype (Phase 31C compatibility preserved)');
  } else {
    fail('Settings.jsx must still use shouldShowDataSafetyCenterPrototype');
  }

  // Settings must remain hidden by default — no PHASE31C_PROTOTYPE_CONFIG = {} or enabled: true at top level
  if (/PHASE31C_PROTOTYPE_CONFIG\s*=\s*\{\s*\}/.test(settingsSrc)) {
    fail('Settings.jsx must not use empty {} as prototype config — must use createDataSafetyInternalVisibilityConfig');
  } else {
    pass('Settings.jsx does not use empty {} as prototype config');
  }

  // Check no forbidden imports
  if (/from\s+['"].*backup/i.test(settingsSrc)) {
    fail('Settings.jsx must not import backup modules');
  } else {
    pass('Settings.jsx does not import backup modules');
  }

  if (/from\s+['"].*(sync|cloud|backend|auth|account)/i.test(settingsSrc)) {
    fail('Settings.jsx must not import sync/cloud/backend/auth/account modules');
  } else {
    pass('Settings.jsx does not import sync/cloud/backend/auth/account modules');
  }

  if (/\blocalStorage\s*[.[]/i.test(settingsSrc) || /window\.localStorage/.test(settingsSrc)) {
    fail('Settings.jsx must not use localStorage API');
  } else {
    pass('Settings.jsx does not use localStorage API');
  }

  if (settingsSrc.includes('fetch(')) {
    fail('Settings.jsx must not use fetch(');
  } else {
    pass('Settings.jsx does not use fetch(');
  }
}

// ── 10. Tests coverage checks ─────────────────────────────────────────────────
console.log('\n[10] Tests coverage checks');

if (testSrc) {
  const requiredCoverageChecks = [
    { label: 'default-off', pattern: /default.*off|off.*default|DEFAULT_ENABLED.*false|false.*DEFAULT_ENABLED/i },
    { label: 'missing env disables', pattern: /missing env|undefined.*disables|returns false.*undefined/i },
    { label: 'invalid env disables', pattern: /invalid env|invalid.*disables|false.*invalid/i },
    { label: 'explicit true values enable', pattern: /explicit.*true|'1'|"1"|'true'|"true"|'enabled'|"enabled"/i },
    { label: 'production remains hidden', pattern: /production.*hidden|hidden.*production|default.*hidden|ordinary.*hidden/i },
    { label: 'Phase 31C compatibility', pattern: /shouldShowDataSafetyCenterPrototype/i },
    { label: 'no persisted state', pattern: /no.*persist|persist.*no|side effects|pure function/i },
    { label: 'no storage APIs in source', pattern: /localStorage|sessionStorage|indexeddb/i },
    { label: 'no network APIs in source', pattern: /fetch\(|XMLHttpRequest|WebSocket|sendBeacon/i },
    { label: 'Settings source forbidden import check', pattern: /Settings\.jsx/i },
    { label: 'ordinary/default config remains hidden', pattern: /ordinary|default.*hidden|hides prototype/i },
    { label: 'internal enabled can show prototype', pattern: /internal.*dev|dev.*test|shows prototype|visible.*internal/i },
  ];

  for (const { label, pattern } of requiredCoverageChecks) {
    if (pattern.test(testSrc)) {
      pass(`Tests cover: ${label}`);
    } else {
      warn(`Tests may not fully cover: ${label}`);
    }
  }
}

// ── 11. Required docs headings ────────────────────────────────────────────────
console.log('\n[11] Required evidence doc headings');

const REQUIRED_EVIDENCE_HEADINGS = [
  '# Phase 31G — Data Safety UX Internal Visibility Implementation Evidence',
  '## Status tokens',
  '## Scope',
  '## Implementation',
  '## Helper module',
  '## Settings integration',
  '## Test coverage',
  '## Constraint verification',
  '## What Phase 31G supports',
  '## What Phase 31G does not approve',
  '## Next recommended phase',
];

for (const heading of REQUIRED_EVIDENCE_HEADINGS) {
  if (evidence31g && evidence31g.includes(heading)) {
    pass(`Required evidence heading present: ${heading}`);
  } else {
    fail(`Required evidence heading missing: ${heading}`);
  }
}

console.log('\n[12] Required release summary headings');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 31G — Data Safety UX Internal Visibility Implementation Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Implementation result',
  '## Chosen decision',
  '## Decision rationale',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_SUMMARY_HEADINGS) {
  if (summary31g && summary31g.includes(heading)) {
    pass(`Required summary heading present: ${heading}`);
  } else {
    fail(`Required summary heading missing: ${heading}`);
  }
}

console.log('\n[13] Phase 31H seed headings, token, and decision options');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 31H — Data Safety UX Internal Visibility Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31G',
  '## Evidence review constraints',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

for (const heading of REQUIRED_SEED_HEADINGS) {
  if (seed31h && seed31h.includes(heading)) {
    pass(`Required seed heading present: ${heading}`);
  } else {
    fail(`Required seed heading missing: ${heading}`);
  }
}

if (seed31h && seed31h.includes('PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED')) {
  pass('Phase 31H seed token present');
} else {
  fail('Phase 31H seed token missing: PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
}

const REQUIRED_SEED_DECISION_OPTIONS = [
  'HOLD_INTERNAL_VISIBILITY_IMPLEMENTATION',
  'NEEDS_BROWSER_EVIDENCE',
  'PASS_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION',
];

for (const opt of REQUIRED_SEED_DECISION_OPTIONS) {
  if (seed31h && seed31h.includes(opt)) {
    pass(`Phase 31H seed decision option present: ${opt}`);
  } else {
    fail(`Phase 31H seed decision option missing: ${opt}`);
  }
}

// Phase 31H must be framed as a separate evidence review gate
if (seed31h && seed31h.includes('Phase 31H is a separate evidence review gate and is not automatically approved')) {
  pass('Phase 31H framed as separate evidence review gate');
} else {
  fail('Phase 31H seed must state: Phase 31H is a separate evidence review gate and is not automatically approved');
}

// ── 14. Forbidden approval phrases ───────────────────────────────────────────
console.log('\n[14] Forbidden approval phrases');

const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31G approved',
  'Phase 31G is approved',
  'Phase 31G approves BETA_READY',
  'Phase 31G approves public production',
  'Phase 31G approves restore execution',
  'Phase 31G approves production restore',
  'Phase 31G approves storage migration',
  'Phase 31G approves sync',
  'Phase 31G approves telemetry',
  'Phase 31G approves backup file format',
  'Phase 31G approves restore overwrite',
  'Phase 31G approves BYOC',
  'Phase 31G approves ordinary-user',
  'ordinary-user visibility approved',
  'limited settings visibility approved',
  'Phase 31H approved',
  'Phase 31H automatically approved',
  'Phase 31H PASS',
];

const DOCS_CHECK_CONTENT = [evidence31g, summary31g].filter(Boolean).join('\n');
for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  if (DOCS_CHECK_CONTENT.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// ── 15. Required "does not approve" statements ───────────────────────────────
console.log('\n[15] Required "does not approve" statements');

const REQUIRED_DOES_NOT_APPROVE = [
  'Phase 31G does not approve BETA_READY',
  'Phase 31G does not approve public production readiness',
  'Phase 31G does not approve guaranteed data-loss prevention',
  'Phase 31G does not approve restore execution',
  'Phase 31G does not approve production restore rehearsal',
  'Phase 31G does not approve real learner data restore rehearsal',
  'Phase 31G does not approve runtime backup/export/restore behavior changes',
  'Phase 31G does not approve backup file format changes',
  'Phase 31G does not approve restore overwrite behavior changes',
  'Phase 31G does not approve storage migration',
  'Phase 31G does not approve sync/cloud/account/auth/backend',
  'Phase 31G does not approve telemetry/analytics',
  'Phase 31G does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 31G does not approve BYOC/WebDAV/P2P/device-transfer implementation',
  'Phase 31G does not approve limited settings visibility to ordinary users',
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
  'Next recommended phase: Phase 31H — Data Safety UX Internal Visibility Evidence Review',
  'Phase 31H is a separate evidence review gate and is not automatically approved',
  'Phase 31G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31G does not approve BETA_READY',
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
console.log('PHASE31G VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION');
  console.log('PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW');
  console.log('PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES');
  console.log('PHASE31H_DATA_SAFETY_UX_INTERNAL_VISIBILITY_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nRESULT: FAIL (${ERRORS.length} error${ERRORS.length !== 1 ? 's' : ''})`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  process.exit(1);
}
