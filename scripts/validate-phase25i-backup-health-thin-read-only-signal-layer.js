#!/usr/bin/env node
/**
 * Phase 25I Static Validator — Backup Health Thin Read-Only Signal Layer
 *
 * PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER
 * PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES
 * PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE
 *
 * Static analysis only. No imports of runtime modules.
 * Reads files as text and checks content.
 * Exit code 0 = all checks pass. Exit code 1 = one or more checks fail.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

let allPass = true;

function pass(label) {
  console.log(`PASS  ${label}`);
}

function fail(label, detail = '') {
  console.log(`FAIL  ${label}${detail ? ' — ' + detail : ''}`);
  allPass = false;
}

function readFile(relPath) {
  const abs = path.join(ROOT, relPath);
  try {
    return fs.readFileSync(abs, 'utf8');
  } catch {
    return null;
  }
}

function fileExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

// ── 1. Required files exist ──────────────────────────────────────────────────

const SIGNAL_LAYER = 'src/state/backupHealthSignal.js';
const UNIT_TEST = 'tests/unit/backupHealthSignal.test.js';
const TESTING_DOC = 'docs/testing/phase25i-backup-health-thin-read-only-signal-layer.md';
const RELEASE_DOC = 'docs/release/phase25i-backup-health-thin-read-only-signal-layer-summary.md';
const VALIDATOR = 'scripts/validate-phase25i-backup-health-thin-read-only-signal-layer.js';
const CI_WORKFLOW = '.github/workflows/e2e-smoke.yml';

fileExists(SIGNAL_LAYER)
  ? pass('Signal layer file exists')
  : fail('Signal layer file exists', `missing ${SIGNAL_LAYER}`);

fileExists(UNIT_TEST)
  ? pass('Unit test file exists')
  : fail('Unit test file exists', `missing ${UNIT_TEST}`);

fileExists(TESTING_DOC)
  ? pass('Testing doc exists')
  : fail('Testing doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

// Phase 25I validator must be an active run step
ciContent.includes('validate-phase25i')
  ? pass('CI registers Phase 25I validator')
  : fail('CI registers Phase 25I validator', 'e2e-smoke.yml does not reference validate-phase25i');

// Old validators (Phase 24D-HF1 through Phase 25H) must not be active run: steps.
// An "active" step is an uncommented `run: node scripts/validate-<slug>.js` line.
// Commented-out lines (starting with #) are allowed as historical references.
const PRIOR_PHASE_VALIDATOR_SLUGS = [
  'validate-phase24d',
  'validate-phase24e',
  'validate-phase24f',
  'validate-phase24g',
  'validate-phase24h',
  'validate-phase25a',
  'validate-phase25b',
  'validate-phase25c',
  'validate-phase25d',
  'validate-phase25e',
  'validate-phase25f',
  'validate-phase25g',
  'validate-phase25h',
];

// Extract active (uncommented) run lines from the CI workflow
const activeRunLines = ciContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    return trimmed.startsWith('run:') || trimmed.startsWith('- run:');
  })
  .join('\n');

// Also check indented run lines that follow a step (lines containing "node scripts/validate-")
// Extract all non-comment lines that invoke node scripts/validate-
const activeValidatorLines = ciContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return false; // comment line
    return trimmed.includes('node scripts/validate-');
  })
  .join('\n');

const priorPhaseViolations = PRIOR_PHASE_VALIDATOR_SLUGS.filter(slug =>
  activeValidatorLines.includes(slug)
);
priorPhaseViolations.length === 0
  ? pass('CI does not run Phase 24D-HF1 through Phase 25H validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

// Must not have a full validate-*.js glob loop
ciContent.includes('for f in scripts/validate-*.js')
  ? fail('CI does not run full validate-*.js glob loop', 'found "for f in scripts/validate-*.js" in CI')
  : pass('CI does not run full validate-*.js glob loop');

// No continue-on-error: true
ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

// ── 3. Required doc tokens ───────────────────────────────────────────────────

const REQUIRED_TOKENS = [
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER',
  'PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES',
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE',
];

for (const docPath of [TESTING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of REQUIRED_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 60)}...`)
      : fail(`Doc ${docPath} contains token`, `missing: ${token}`);
  }
}

// ── 4. Guardrail statements in docs ─────────────────────────────────────────

const REQUIRED_GUARDRAILS = [
  'Phase 25I does not add production UI for Backup Health display',
  'Phase 25I does not wire the signal layer into any production React component or context',
  'Phase 25I does not write to localStorage or IndexedDB',
  'Phase 25I does not perform data migration',
  'Phase 25I does not change backup, export, or restore behavior',
  'Phase 25I does not add network requests or telemetry',
  'Phase 25I does not claim BETA_READY status for Backup Health UI',
  'Phase 25I does not allow UI/routes/settings/library/dashboard files to import the signal layer',
  'Phase 25I does not allow backup/restore modules to import the signal layer',
  'Phase 25I does not modify package.json or package-lock.json',
  'Phase 25I does not add browser-only APIs',
  'Phase 25I does not modify the Phase 25G prototype helper',
];

for (const guardrail of REQUIRED_GUARDRAILS) {
  const testingDocContent = readFile(TESTING_DOC) || '';
  const releaseDocContent = readFile(RELEASE_DOC) || '';
  const found = testingDocContent.includes(guardrail) || releaseDocContent.includes(guardrail);
  found
    ? pass(`Guardrail present: "${guardrail.slice(0, 60)}..."`)
    : fail(`Guardrail missing`, `"${guardrail}"`);
}

// ── 5. Exact changed-file enforcement via git ────────────────────────────────

// The allowed set covers Phase 25I original files and Phase 25I-HF1 authorized hotfix files.
// All changed files on a non-main branch must be within this set.
const EXACT_ALLOWED_CHANGED_FILES = new Set([
  '.github/workflows/e2e-smoke.yml',
  SIGNAL_LAYER,
  UNIT_TEST,
  TESTING_DOC,
  RELEASE_DOC,
  VALIDATOR,
  'docs/release/phase25i-hf1-post-merge-validator-context-summary.md',
]);

// Fetch and verify origin/main before diffing; GitHub Actions can use a shallow checkout.
let originMainAvailable = false;
try {
  execSync('git fetch origin refs/heads/main:refs/remotes/origin/main --prune', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  execSync('git rev-parse --verify origin/main', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  originMainAvailable = true;
} catch (error) {
  originMainAvailable = false;
  fail(
    'Exact changed-file git check — origin/main not available after explicit fetch',
    error.stderr?.toString?.().trim() || error.message
  );
}

if (originMainAvailable) {
let gitChangedFiles = null;
try {
  const diffOutput = execSync('git diff --name-only origin/main..HEAD', {
    cwd: ROOT,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
  gitChangedFiles = diffOutput ? diffOutput.split('\n').map(f => f.trim()).filter(Boolean) : [];
} catch (error) {
  gitChangedFiles = null;
  fail(
    'Exact changed-file git check',
    `git diff origin/main..HEAD failed — ${error.stderr?.toString?.().trim() || error.message}`
  );
}

if (gitChangedFiles !== null) {
  // Detect post-merge main context: diff is empty because HEAD IS origin/main.
  // Accept GITHUB_REF / GITHUB_REF_NAME env vars (set by GitHub Actions) or fall
  // back to comparing HEAD sha with origin/main sha locally.
  const isPostMergeMain = (() => {
    const ref = process.env.GITHUB_REF || '';
    const refName = process.env.GITHUB_REF_NAME || '';
    if (ref === 'refs/heads/main' || refName === 'main') return true;
    try {
      const headSha = execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
      const originSha = execSync('git rev-parse origin/main', { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
      return headSha === originSha;
    } catch {
      return false;
    }
  })();

  if (gitChangedFiles.length === 0) {
    if (isPostMergeMain) {
      pass('Exact changed-file check skipped for post-merge main context; content guardrails remain enforced.');
      pass('No forbidden files changed (post-merge main context; no diff to check)');
    } else {
      // Empty diff on a non-main branch is unexpected — enforce strictly
      fail(
        'Exact changed-file set mismatch',
        `diff is empty on non-main context; expected 6 Phase 25I files`
      );
      fail('No forbidden files changed', 'cannot verify — diff is empty on non-main context');
    }
  } else {
    const unexpected = gitChangedFiles.filter(f => !EXACT_ALLOWED_CHANGED_FILES.has(f));

    // Enforce: no unexpected files. Do not require all allowed files to be present
    // (a hotfix may only touch a subset of the authorized set).
    unexpected.length === 0
      ? pass(`All changed files (${gitChangedFiles.length}) are within the authorized Phase 25I set`)
      : fail(
          'Unauthorized files changed',
          `unexpected: ${unexpected.join(', ')}`
        );

    // Explicitly check forbidden files are not changed
    const FORBIDDEN_CHANGED = [
      'package.json',
      'package-lock.json',
      'sw.js',
      'boot-guard.js',
    ];
    const forbiddenChanged = gitChangedFiles.filter(f =>
      FORBIDDEN_CHANGED.includes(f) ||
      f.startsWith('docs/adr/') ||
      f.startsWith('e2e/')
    );
    forbiddenChanged.length === 0
      ? pass('No forbidden files changed (package.json, package-lock.json, sw.js, boot-guard.js, docs/adr/**, e2e/**)')
      : fail('Forbidden files must not be changed', forbiddenChanged.join(', '));
  }
}
} // end originMainAvailable block

// Check docs reference package.json constraint (belt-and-suspenders doc check)
const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';

testingDocContent.includes('package.json') || releaseDocContent.includes('package.json')
  ? pass('Docs reference package.json constraint (no package changes)')
  : fail('Docs reference package.json constraint', 'docs should mention package.json is not modified');

// ── 6. Signal layer content checks ──────────────────────────────────────────

const signalLayerContent = readFile(SIGNAL_LAYER) || '';

// No telemetry API calls (check only non-comment lines)
const signalLayerNonCommentLines = signalLayerContent
  .split('\n')
  .filter(line => !line.trim().startsWith('*') && !line.trim().startsWith('//'))
  .join('\n');

const telemetryCallPatterns = [
  'mixpanel.', 'segment.', 'amplitude.', 'gtag(', 'ga(',
  'dataLayer.push', 'sendBeacon(', 'posthog.', 'analytics.track',
];
const telemetryFound = telemetryCallPatterns.filter(p => signalLayerNonCommentLines.includes(p));
telemetryFound.length === 0
  ? pass('Signal layer has no telemetry API calls')
  : fail('Signal layer has no telemetry API calls', `found: ${telemetryFound.join(', ')}`);

// No UI/router/storage/backup/export/restore imports (check only import statements)
const signalLayerImportLines = signalLayerContent
  .split('\n')
  .filter(line => /^\s*import\s/.test(line))
  .join('\n');

const forbiddenImports = [
  '/router', '/Router', 'react-router',
  '/ui/', '/UI/', 'Dashboard', 'StudyRoom', 'SettingsPanel',
  'BackupManager', 'ExportManager', 'RestoreManager', 'ImportManager',
  '/storage/', 'StorageAdapter', 'IndexedDBAdapter',
  '/library/', '/settings/', '/routes/',
];
const forbiddenImportFound = forbiddenImports.filter(p => signalLayerImportLines.includes(p));
forbiddenImportFound.length === 0
  ? pass('Signal layer does not import UI/router/storage/backup/export/restore modules')
  : fail('Signal layer does not import forbidden modules', `found: ${forbiddenImportFound.join(', ')}`);

// No write APIs
const forbiddenAPIs = [
  'localStorage.setItem', 'localStorage.removeItem', 'localStorage.clear',
  'indexedDB.open', 'indexedDB.deleteDatabase',
  'fetch(', 'XMLHttpRequest', 'navigator.sendBeacon',
  'fs.writeFile', 'fs.appendFile', 'fs.writeFileSync',
];
const forbiddenAPIFound = forbiddenAPIs.filter(p => signalLayerContent.includes(p));
forbiddenAPIFound.length === 0
  ? pass('Signal layer does not use write/network APIs')
  : fail('Signal layer does not use write/network APIs', `found: ${forbiddenAPIFound.join(', ')}`);

// Exports required pure functions
const requiredExports = [
  'export function createBackupHealthSignal',
  'export function normalizeBackupHealthSignals',
  'export function deriveBackupHealthFromSignals',
];
for (const exp of requiredExports) {
  signalLayerContent.includes(exp)
    ? pass(`Signal layer exports required function: ${exp.replace('export function ', '')}`)
    : fail(`Signal layer missing required export`, exp);
}

// Imports from Phase 25G prototype
signalLayerContent.includes(`from './backupHealthTestOnlyPrototype.js'`)
  ? pass('Signal layer imports from Phase 25G prototype')
  : fail('Signal layer imports from Phase 25G prototype', 'missing import from backupHealthTestOnlyPrototype.js');

// ── 7. No production file imports signal layer ───────────────────────────────

const PRODUCTION_DIRS_TO_SCAN = [
  'src/components',
  'src/pages',
  'src/routes',
  'src/views',
  'src/settings',
  'src/library',
  'src/dashboard',
  'src/backup',
  'src/restore',
  'src/export',
  'src/import',
];

const FORBIDDEN_IMPORT_PATTERNS = [
  'backupHealthSignal',
  'backupHealthTestOnlyPrototype',
];

let productionImportViolations = [];

for (const dir of PRODUCTION_DIRS_TO_SCAN) {
  const absDir = path.join(ROOT, dir);
  if (!fs.existsSync(absDir)) continue;

  function scanDir(dirPath) {
    let entries;
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && /\.(js|jsx|ts|tsx)$/.test(entry.name)) {
        let content;
        try {
          content = fs.readFileSync(fullPath, 'utf8');
        } catch {
          continue;
        }
        for (const pattern of FORBIDDEN_IMPORT_PATTERNS) {
          if (content.includes(pattern)) {
            productionImportViolations.push(`${path.relative(ROOT, fullPath)} imports ${pattern}`);
          }
        }
      }
    }
  }

  scanDir(absDir);
}

productionImportViolations.length === 0
  ? pass('No production UI/routes/settings/library/dashboard/backup/restore file imports signal layer or Phase 25G helper')
  : fail('Production files must not import signal layer', productionImportViolations.join('; '));

// ── 8. Unit test content checks ──────────────────────────────────────────────

const unitTestContent = readFile(UNIT_TEST) || '';

const requiredTestCases = [
  'UNKNOWN',
  'NO_BACKUP_RECORDED',
  'RECENT_MANUAL_BACKUP',
  'BACKUP_MAY_BE_STALE',
  'RESTORE_VERIFIED_TEST_DATA',
  'STATUS_UNAVAILABLE',
  'lastManualExportCompletedAtMs',
  'normalizeBackupHealthSignals',
  'createBackupHealthSignal',
  'deriveBackupHealthFromSignals',
];

for (const tc of requiredTestCases) {
  unitTestContent.includes(tc)
    ? pass(`Unit tests cover required case: ${tc}`)
    : fail(`Unit tests missing required case`, tc);
}

// ── 9. Docs do not claim production UI or BETA_READY ────────────────────────

const allDocContent = (readFile(TESTING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

// Check no affirmative production UI claim (allowing the "does not" / "must not" guardrail lines)
// Strip all negation lines before checking for forbidden affirmative claims.
const docLinesStripped = allDocContent
  .split('\n')
  .filter(l => {
    const lower = l.toLowerCase();
    return !(
      lower.includes('does not claim') ||
      lower.includes('must not claim') ||
      lower.includes('do not claim') ||
      lower.includes('cannot claim') ||
      lower.includes('docs do not claim') ||
      lower.includes('- does not claim') ||
      lower.includes('does not add') ||
      lower.includes('phase 25i does not') ||
      lower.includes('docs must not claim') ||
      lower.includes('no.*claim') ||
      lower.includes('validator.*checks.*not claim') ||
      // Strip lines that are validator check descriptions of what to reject
      lower.includes('claim production') ||
      lower.includes('claim beta_ready')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
// BETA_READY: true / BETA_READY=true / status: BETA_READY are clear affirmative claims
if (docLinesStripped.includes('BETA_READY: true') || docLinesStripped.includes('BETA_READY=true') || docLinesStripped.includes('status: BETA_READY')) {
  forbiddenDocFound.push('BETA_READY affirmative status token');
}
// "production UI is ready" is an affirmative claim (not negation)
if (docLinesStripped.includes('production UI is ready') || docLinesStripped.includes('production Backup Health UI is available')) {
  forbiddenDocFound.push('affirmative production UI claim');
}
forbiddenDocFound.length === 0
  ? pass('Docs do not contain affirmative production Backup Health UI or BETA_READY claims')
  : fail('Docs must not claim production UI or BETA_READY', forbiddenDocFound.join(', '));

// ── 10. Signal layer tokens in signal layer file ─────────────────────────────

for (const token of REQUIRED_TOKENS) {
  signalLayerContent.includes(token)
    ? pass(`Signal layer contains status token: ${token.slice(0, 60)}...`)
    : fail(`Signal layer missing status token`, token);
}

// ── Final result ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 25I static validation complete.');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — see FAIL lines above.');
  process.exit(1);
}
