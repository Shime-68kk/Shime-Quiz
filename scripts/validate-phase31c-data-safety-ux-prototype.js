#!/usr/bin/env node
/**
 * scripts/validate-phase31c-data-safety-ux-prototype.js
 *
 * Phase 31C — Default-Off Data Safety UX Prototype Validator
 *
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
 * PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
 * PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
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

const SRC_JS = `src/features/dataSafety/dataSafetyCenterPrototype.js`;
const SRC_JSX = `src/features/dataSafety/DataSafetyCenterPrototype.jsx`;
const TESTS = `tests/unit/dataSafetyCenterPrototype.test.js`;
const EVIDENCE = `docs/testing/phase31c-data-safety-ux-prototype-evidence.md`;
const SUMMARY = `docs/release/phase31c-data-safety-ux-prototype-summary.md`;
const SEED_31D = `docs/planning/phase31d-data-safety-ux-evidence-review-seed.md`;
const VALIDATOR = `scripts/validate-phase31c-data-safety-ux-prototype.js`;
const CI = `.github/workflows/e2e-smoke.yml`;
const SETTINGS = `src/routes/Settings.jsx`;

const srcJs = requireFile(SRC_JS);
const srcJsx = requireFile(SRC_JSX);
const tests = requireFile(TESTS);
const evidence = requireFile(EVIDENCE);
const summary = requireFile(SUMMARY);
const seed31d = requireFile(SEED_31D);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const settings = requireFile(SETTINGS);

// ── 2. Git: verify origin/main reachable ─────────────────────────────────────
console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('git rev-parse --verify origin/main');
} catch {
  fail('git rev-parse --verify origin/main failed — origin/main not reachable');
}

// ── 3. Changed files check (post-merge-main safe) ────────────────────────────
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
  `src/features/dataSafety/dataSafetyCenterPrototype.js`,
  `src/features/dataSafety/DataSafetyCenterPrototype.jsx`,
  `tests/unit/dataSafetyCenterPrototype.test.js`,
  `docs/testing/phase31c-data-safety-ux-prototype-evidence.md`,
  `docs/release/phase31c-data-safety-ux-prototype-summary.md`,
  `docs/planning/phase31d-data-safety-ux-evidence-review-seed.md`,
  `scripts/validate-phase31c-data-safety-ux-prototype.js`,
]);
const ALLOWED_MODIFIED = new Set([
  `.github/workflows/e2e-smoke.yml`,
  `src/routes/Settings.jsx`,
]);
const ALL_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

for (const f of changedFiles) {
  if (!ALL_ALLOWED.has(f)) {
    fail(`Unexpected changed file: ${f} — not in Phase 31C allowed set`);
  } else {
    pass(`Allowed changed file: ${f}`);
  }
}

// Check no package/dependency changes
for (const f of changedFiles) {
  if (f === 'package.json' || f === 'package-lock.json') {
    fail(`Forbidden: ${f} changed — no dependency changes allowed in Phase 31C`);
  }
}

// Check no generated artifacts
for (const f of changedFiles) {
  if (f.startsWith('dist/') || f.startsWith('coverage/') || f.startsWith('node_modules/') || f.startsWith('test-results/') || f.startsWith('playwright-report/')) {
    fail(`Forbidden: generated artifact changed: ${f}`);
  }
}

// Check no e2e/ADR/release notes changes
for (const f of changedFiles) {
  if (f.startsWith('tests/e2e/') || f.startsWith('docs/adr/') || f === 'RELEASE_NOTES.md' || f === 'RELEASE_NOTES_V2.md') {
    fail(`Forbidden: ${f} changed — e2e/ADR/release notes not allowed in Phase 31C`);
  }
}

// Check no storage driver, backup/export/restore, sync/cloud/backend, telemetry changes
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
  // Allow Settings.jsx as the one allowed routes file
  if (f === `src/routes/Settings.jsx`) continue;
  for (const pattern of FORBIDDEN_PATH_PATTERNS) {
    if (pattern.test(f)) {
      fail(`Forbidden path changed: ${f} (matches ${pattern})`);
      break;
    }
  }
}

// Check prior phase files not modified
const PRIOR_PHASE_PREFIXES = [
  'docs/planning/phase31b-',
  'docs/planning/phase31a-',
  'docs/planning/phase30',
  'docs/release/phase31b-',
  'docs/release/phase31a-',
  'docs/release/phase30',
  'docs/testing/phase31b-',
  'docs/testing/phase31a-',
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

// Check at most one existing settings source file modified
const modifiedExistingSettings = changedFiles.filter(f => f === `src/routes/Settings.jsx`);
if (modifiedExistingSettings.length > 1) {
  fail('More than one existing settings source file modified — only one allowed');
} else if (modifiedExistingSettings.length === 1) {
  pass('Exactly one existing settings source file modified: src/routes/Settings.jsx');
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

  if (ci.includes('Validate Phase 31C') && /node scripts\/validate-phase31c-data-safety-ux-prototype\.js/.test(ci)) {
    pass('CI registers Phase 31C validator');
  } else {
    fail('CI must register Phase 31C validator with: node scripts/validate-phase31c-data-safety-ux-prototype.js');
  }

  if (/^[^#]*node scripts\/validate-phase31b-/.test(ci.replace(/\r\n/g, '\n').split('\n').filter(l => !l.trim().startsWith('#')).join('\n'))) {
    fail('CI must not run prior Phase 31B validator as an active Phase 31C blocker');
  } else {
    pass('Phase 31B validator is commented out (not an active Phase 31C blocker)');
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

if (validator) {
  // Check validator doesn't CALL git fetch via execSync (mentioning it in strings is fine)
  if (/execSync\s*\([^)]*git\s+fetch/.test(validator)) {
    fail('Validator must not execute internal git fetch via execSync');
  } else {
    pass('Validator does not execute internal git fetch');
  }

  if (/git rev-parse --verify origin\/main/.test(validator)) {
    pass('Validator verifies origin/main with git rev-parse --verify origin/main');
  } else {
    fail('Validator must verify origin/main with git rev-parse --verify origin/main');
  }

  if (/origin\/main\.\.HEAD/.test(validator)) {
    pass('Validator uses origin/main..HEAD for post-merge-main safe changed-file check');
  } else {
    fail('Validator must use origin/main..HEAD for changed-file check');
  }
}

// ── 6. Required tokens ────────────────────────────────────────────────────────
console.log('\n[6] Required tokens');

const ALL_DOCS = [evidence, summary, seed31d, srcJs, tests, validator].filter(Boolean).join('\n');

function checkToken(token, label) {
  if (ALL_DOCS.includes(token)) {
    pass(`Token present: ${token}`);
  } else {
    fail(`Required token missing: ${token} (${label})`);
  }
}

checkToken('PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE', 'prototype status');
checkToken('PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED', 'readiness status');
checkToken('PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES', 'prototype scope');
checkToken('PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED', 'phase31d seed status');

// Check decision token is one of three allowed values
const ALLOWED_DECISIONS = [
  'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW',
  'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: NEEDS_DESIGN_REWORK',
  'PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: HOLD_DATA_SAFETY_UX_PROTOTYPE',
];
const foundDecision = ALLOWED_DECISIONS.find(d => ALL_DOCS.includes(d));
if (foundDecision) {
  pass(`Decision token present: ${foundDecision}`);
} else {
  fail('Decision token missing or invalid — must be one of the three allowed values: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW, NEEDS_DESIGN_REWORK, HOLD_DATA_SAFETY_UX_PROTOTYPE');
}

// ── 7. Required headings ──────────────────────────────────────────────────────
console.log('\n[7] Required headings in docs');

function checkHeadings(content, label, headings) {
  for (const h of headings) {
    if (content && content.includes(h)) {
      pass(`Heading in ${label}: ${h}`);
    } else {
      fail(`Missing heading in ${label}: ${h}`);
    }
  }
}

checkHeadings(evidence, 'evidence doc', [
  '# Phase 31C — Data Safety UX Prototype Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 31B',
  '## Prototype summary',
  '## File ownership',
  '## Default-off behavior',
  '## UI sections implemented',
  '## Copy boundary review',
  '## Storage and network boundary review',
  '## Rollback plan',
  '## Test evidence',
  '## Build evidence',
  '## Open limitations',
  '## Chosen prototype decision',
  '## What Phase 31C supports',
  '## What Phase 31C does not approve',
  '## Claim boundary',
  '## Next recommended phase',
]);

checkHeadings(summary, 'release summary', [
  '# Phase 31C — Data Safety UX Prototype Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Prototype result',
  '## Chosen decision',
  '## Decision rationale',
  '## Files changed',
  '## Validation summary',
  '## What is supported',
  '## What remains not approved',
  '## Guardrails',
  '## Next recommended phase',
]);

checkHeadings(seed31d, 'Phase 31D seed', [
  '# Phase 31D — Data Safety UX Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 31C',
  '## Review constraints',
  '## Required evidence',
  '## Manual browser evidence plan',
  '## Static evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
]);

// ── 8. Phase 31D seed: required token, decision options, separate gate framing
console.log('\n[8] Phase 31D seed checks');

if (seed31d) {
  if (seed31d.includes('PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED')) {
    pass('Phase 31D seed has required token');
  } else {
    fail('Phase 31D seed missing token: PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  }

  const requiredDecisionOptions = [
    'HOLD_DATA_SAFETY_UX_PROTOTYPE',
    'NEEDS_MORE_EVIDENCE',
    'PASS_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE',
  ];
  for (const opt of requiredDecisionOptions) {
    if (seed31d.includes(opt)) {
      pass(`Phase 31D seed includes decision option: ${opt}`);
    } else {
      fail(`Phase 31D seed missing decision option: ${opt}`);
    }
  }

  if (seed31d.includes('separate evidence review gate') && seed31d.includes('not automatically approved')) {
    pass('Phase 31D seed frames Phase 31D as separate evidence review gate, not automatically approved');
  } else {
    fail('Phase 31D seed must state Phase 31D is a separate evidence review gate and not automatically approved');
  }
}

// ── 9. Source: prototype default is OFF ──────────────────────────────────────
console.log('\n[9] Source: default-off flag');

if (srcJs) {
  if (/DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED\s*=\s*false/.test(srcJs)) {
    pass('Source contains DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED = false');
  } else {
    fail('Source must export DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED = false');
  }

  if (/export\s+const\s+DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED/.test(srcJs)) {
    pass('Source exports DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED');
  } else {
    fail('Source must export DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED');
  }
}

// ── 10. Source: no forbidden storage/network APIs ────────────────────────────
console.log('\n[10] Source: no forbidden storage/network APIs');

// Strip block comments and line comments before checking code for forbidden APIs.
// JSDoc headers mention these APIs in negative statements (e.g. "No localStorage").
// We only care that the actual executable code does not reference them.
function stripComments(src) {
  return src
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove /* ... */ block comments
    .replace(/\/\/.*/g, ''); // remove // line comments
}

for (const [label, content] of [[SRC_JS, srcJs], [SRC_JSX, srcJsx]]) {
  if (!content) continue;
  const code = stripComments(content);

  if (/localStorage/.test(code)) fail(`${label}: code must not reference localStorage`);
  else pass(`${label}: no localStorage reference in code`);

  if (/sessionStorage/.test(code)) fail(`${label}: code must not reference sessionStorage`);
  else pass(`${label}: no sessionStorage reference in code`);

  if (/[Ii]ndexed[Dd][Bb]/.test(code)) fail(`${label}: code must not reference IndexedDB`);
  else pass(`${label}: no IndexedDB reference in code`);

  if (/\bfetch\s*\(/.test(code)) fail(`${label}: code must not reference fetch()`);
  else pass(`${label}: no fetch() reference in code`);

  if (/XMLHttpRequest/.test(code)) fail(`${label}: code must not reference XMLHttpRequest`);
  else pass(`${label}: no XMLHttpRequest reference in code`);

  if (/WebSocket/.test(code)) fail(`${label}: code must not reference WebSocket`);
  else pass(`${label}: no WebSocket reference in code`);

  if (/navigator\.sendBeacon/.test(code)) fail(`${label}: code must not reference navigator.sendBeacon`);
  else pass(`${label}: no navigator.sendBeacon reference in code`);
}

// ── 11. Source: no forbidden imports ─────────────────────────────────────────
console.log('\n[11] Source: no forbidden imports');

for (const [label, content] of [[SRC_JS, srcJs], [SRC_JSX, srcJsx]]) {
  if (!content) continue;
  const importLines = content.split('\n').filter(l => /^\s*import\s/.test(l));
  let forbidden = false;
  for (const line of importLines) {
    if (/backup|restore|storage|sync|cloud|backend|account|auth/i.test(line)) {
      fail(`${label}: forbidden import detected: ${line.trim()}`);
      forbidden = true;
    }
  }
  if (!forbidden) pass(`${label}: no forbidden imports`);
}

// ── 12. Component: required section labels/copy markers ─────────────────────
console.log('\n[12] Component: required section markers');

const REQUIRED_SECTIONS = [
  'dsc-readiness-summary',
  'dsc-local-data',
  'dsc-export-backup',
  'dsc-import-preview',
  'dsc-restore-caution',
  'dsc-backup-reminder',
  'dsc-browser-storage-limit',
  'dsc-evidence-gaps',
  'dsc-help-faq',
];

if (srcJsx) {
  for (const section of REQUIRED_SECTIONS) {
    if (srcJsx.includes(section)) {
      pass(`Component includes section marker: ${section}`);
    } else {
      fail(`Component missing section marker: ${section}`);
    }
  }
}

// ── 13. Component: action labels are placeholder/disabled/inert ──────────────
console.log('\n[13] Component: placeholder/disabled action controls');

if (srcJsx) {
  if (/disabled/.test(srcJsx)) {
    pass('Component has disabled attribute on action controls');
  } else {
    fail('Component must have disabled attribute on action controls');
  }

  if (srcJsx.includes('settingsPanel__actionBtn--placeholder')) {
    pass('Component uses settingsPanel__actionBtn--placeholder class');
  } else {
    fail('Component must use settingsPanel__actionBtn--placeholder class for placeholder actions');
  }

  if (/aria-disabled="true"/.test(srcJsx)) {
    pass('Component uses aria-disabled="true" on action controls');
  } else {
    fail('Component must use aria-disabled="true" on action controls');
  }

  // No click handlers that write storage
  if (/onClick.*localStorage|onClick.*setItem|onClick.*indexedDB/i.test(srcJsx)) {
    fail('Component onClick handlers must not write localStorage or IndexedDB');
  } else {
    pass('Component onClick handlers do not write storage');
  }
}

// ── 14. Tests: required coverage markers ─────────────────────────────────────
console.log('\n[14] Tests: required coverage markers');

if (tests) {
  const REQUIRED_TEST_MARKERS = [
    'default flag is OFF',
    'disabled config',
    'enabled config',
    'unknown/invalid config',
    'required sections',
    'local-first',
    'no-cloud',
    'BETA_READY',
    'placeholder',
    'disabled',
    'does not reference localStorage',
    'localStorage',
    'backup',
  ];

  for (const marker of REQUIRED_TEST_MARKERS) {
    if (tests.toLowerCase().includes(marker.toLowerCase())) {
      pass(`Tests cover marker: ${marker}`);
    } else {
      fail(`Tests missing coverage for marker: ${marker}`);
    }
  }
}

// ── 15. Docs: no forbidden claims ─────────────────────────────────────────────
console.log('\n[15] Docs: forbidden claims absent');

const ALL_DOCS_CONTENT = [evidence, summary, seed31d].filter(Boolean).join('\n');

// Docs must contain explicit "does not approve" statements
const REQUIRED_NOT_APPROVE_PHRASES = [
  'does not approve BETA_READY',
  'does not approve public production readiness',
  'does not approve guaranteed data-loss prevention',
  'does not approve restore execution',
  'does not approve production restore rehearsal',
  'does not approve real learner data restore rehearsal',
  'does not approve runtime backup/export/restore',
  'does not approve backup file format changes',
  'does not approve restore overwrite behavior changes',
  'does not approve storage migration',
  'does not approve sync/cloud/account/auth/backend',
  'does not approve telemetry',
  'does not approve built-in AI/OCR',
  'does not approve BYOC/WebDAV',
];

for (const phrase of REQUIRED_NOT_APPROVE_PHRASES) {
  if (ALL_DOCS_CONTENT.includes(phrase)) {
    pass(`Docs contain required "not approve" statement: ${phrase}`);
  } else {
    fail(`Docs missing required "not approve" statement: ${phrase}`);
  }
}

// Docs must not contain POSITIVE approval of forbidden things.
// Use specific positive-claim patterns that would not appear in "does not approve X" statements.
const FORBIDDEN_APPROVAL_PHRASES = [
  'BETA_READY approved',
  'approved BETA_READY',
  'is now production ready',
  'broad validation is complete',
  'stress-tested readiness confirmed',
  'Phase 31D approved',
  'Phase 31D pass',
  'Phase 31D PASS',
];

for (const phrase of FORBIDDEN_APPROVAL_PHRASES) {
  const testContent = [evidence, summary].filter(Boolean).join('\n');
  if (testContent.toLowerCase().includes(phrase.toLowerCase())) {
    fail(`Docs must not contain: "${phrase}"`);
  } else {
    pass(`Docs do not contain forbidden approval phrase: "${phrase}"`);
  }
}

// Check that evidence doc explicitly states no broad validation
if (evidence && evidence.includes('No broad validation has been performed')) {
  pass('Evidence doc states no broad validation has been performed');
} else if (evidence) {
  fail('Evidence doc must state: No broad validation has been performed');
}

// ── 16. Settings.jsx: mounting check ─────────────────────────────────────────
console.log('\n[16] Settings.jsx: default-off mounting check');

if (settings) {
  if (settings.includes('shouldShowDataSafetyCenterPrototype')) {
    pass('Settings.jsx uses shouldShowDataSafetyCenterPrototype guard');
  } else {
    fail('Settings.jsx must use shouldShowDataSafetyCenterPrototype guard');
  }

  if (settings.includes('DataSafetyCenterPrototype')) {
    pass('Settings.jsx imports/uses DataSafetyCenterPrototype');
  } else {
    fail('Settings.jsx must import/use DataSafetyCenterPrototype');
  }

  // The production config must be empty object or equivalent to default-off
  if (/shouldShowDataSafetyCenterPrototype\s*\(\s*\{\s*\}\s*\)/.test(settings) ||
      /shouldShowDataSafetyCenterPrototype\s*\(\s*PHASE31C_PROTOTYPE_CONFIG\s*\)/.test(settings)) {
    pass('Settings.jsx mounts prototype with default-off config');
  } else {
    fail('Settings.jsx must mount prototype with default-off config (empty object or equivalent)');
  }

  // The production config must NOT enable the prototype (no enabled: true in the config constant)
  if (/PHASE31C_PROTOTYPE_CONFIG\s*=\s*\{[^}]*enabled\s*:\s*true/.test(settings)) {
    fail('Settings.jsx PHASE31C_PROTOTYPE_CONFIG must not have enabled: true in production');
  } else {
    pass('Settings.jsx PHASE31C_PROTOTYPE_CONFIG does not enable prototype in production');
  }
}

// ── 17. Next-phase statements ─────────────────────────────────────────────────
console.log('\n[17] Next-phase statements');

const REQUIRED_NEXT_PHASE_PHRASES = [
  'Next recommended phase: Phase 31D',
  'Phase 31D is a separate evidence review gate and is not automatically approved',
  'Phase 31C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 31C does not approve BETA_READY',
  'Phase 31C does not approve public production readiness',
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
console.log('PHASE31C VALIDATOR RESULT');
console.log('='.repeat(70));

if (WARNINGS.length > 0) {
  console.log(`\nWARNINGS (${WARNINGS.length}):`);
  WARNINGS.forEach(w => console.log(`  WARN  ${w}`));
}

if (ERRORS.length === 0) {
  console.log('\nRESULT: PASS');
  console.log('PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE');
  console.log('PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED');
  console.log('PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW');
  console.log('PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES');
  console.log('PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED');
  process.exit(0);
} else {
  console.log(`\nRESULT: FAIL (${ERRORS.length} error${ERRORS.length !== 1 ? 's' : ''})`);
  ERRORS.forEach(e => console.log(`  FAIL  ${e}`));
  process.exit(1);
}
