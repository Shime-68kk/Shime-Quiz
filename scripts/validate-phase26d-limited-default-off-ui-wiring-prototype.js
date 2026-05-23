#!/usr/bin/env node
/**
 * Phase 26D Static Validator — Limited Default-Off UI Wiring Prototype
 *
 * PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER
 * PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES
 * PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM
 * PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE
 * PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER
 * PHASE26D_SELECTED_DEV_HARNESS_WIRING_FILE: src/routes/routeConfig.js
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

const COMPONENT_FILE = `src/components/dev/BackupHealthDevHarness.jsx`;
const TEST_FILE = `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`;
const TESTING_DOC = `docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md`;
const RELEASE_DOC = `docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md`;
const VALIDATOR = `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;
const SELECTED_WIRING_FILE = `src/routes/routeConfig.js`;

fileExists(COMPONENT_FILE)
  ? pass('Component file exists')
  : fail('Component file exists', `missing ${COMPONENT_FILE}`);

fileExists(TEST_FILE)
  ? pass('Test file exists')
  : fail('Test file exists', `missing ${TEST_FILE}`);

fileExists(TESTING_DOC)
  ? pass('Testing doc exists')
  : fail('Testing doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

fileExists(SELECTED_WIRING_FILE)
  ? pass('Selected dev harness wiring file exists')
  : fail('Selected dev harness wiring file exists', `missing ${SELECTED_WIRING_FILE}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase26d')
  ? pass('CI registers Phase 26D validator')
  : fail('CI registers Phase 26D validator', 'e2e-smoke.yml does not reference validate-phase26d');

(ciContent.includes('Fetch origin main for Phase 26D validator') || ciContent.includes('Fetch origin main'))
  ? pass('CI has explicit fetch step for Phase 26D validator')
  : fail('CI has explicit fetch step for Phase 26D validator', 'missing fetch step before Phase 26D validator');

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
  'validate-phase25i',
  'validate-phase25j',
  'validate-phase25k',
  'validate-phase25l',
  'validate-phase25m',
  'validate-phase25n',
  'validate-phase26a',
  'validate-phase26b',
  'validate-phase26c',
];

const activeValidatorLines = ciContent
  .split('\n')
  .filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('#')) return false;
    return trimmed.includes('node scripts/validate-');
  })
  .join('\n');

const priorPhaseViolations = PRIOR_PHASE_VALIDATOR_SLUGS.filter(slug =>
  activeValidatorLines.includes(slug)
);
priorPhaseViolations.length === 0
  ? pass('CI does not run Phase 24D-HF1 through Phase 26C validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js" in CI`)
  : pass('CI does not run full validate-*.js glob loop');

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

// ── 3. Required doc tokens ───────────────────────────────────────────────────

const PHASE26D_TOKENS = [
  'PHASE26D_LIMITED_DEFAULT_OFF_UI_WIRING_PROTOTYPE_STATUS: IMPLEMENTED_HIDDEN_DEFAULT_OFF_PROTOTYPE_PENDING_TESTER',
  'PHASE26D_UI_WIRING_SCOPE: HIDDEN_DEFAULT_OFF_DEV_TEST_HARNESS_NO_PRODUCTION_NAV_NO_WRITES',
  'PHASE26D_MANUAL_BROWSER_TESTER_STATUS: REQUIRED_BEFORE_BROWSER_BEHAVIOR_CLAIM',
  'PHASE26D_UI_WIRING_DECISION: HOLD_FOR_STRICT_REVIEW_AND_TESTER_BEFORE_MERGE',
  'PHASE26D_TESTER_RUN_PACK_STATUS: PREPARED_FOR_EXTERNAL_TESTER',
  'PHASE26D_SELECTED_DEV_HARNESS_WIRING_FILE: src/routes/routeConfig.js',
];

const allDocContent =
  (readFile(TESTING_DOC) || '') + '\n' +
  (readFile(RELEASE_DOC) || '') + '\n' +
  (readFile(COMPONENT_FILE) || '') + '\n' +
  (readFile(TEST_FILE) || '');

for (const token of PHASE26D_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 4. Selected dev harness wiring file is recorded ─────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';

(testingDocContent.includes('PHASE26D_SELECTED_DEV_HARNESS_WIRING_FILE: src/routes/routeConfig.js') ||
 releaseDocContent.includes('PHASE26D_SELECTED_DEV_HARNESS_WIRING_FILE: src/routes/routeConfig.js'))
  ? pass('Selected dev harness wiring file path recorded in docs')
  : fail('Selected dev harness wiring file path must be recorded in docs');

// ── 5. Wiring file has hidden harness entry ──────────────────────────────────

const wiringFileContent = readFile(SELECTED_WIRING_FILE) || '';

wiringFileContent.includes('/dev/backup-health-harness')
  ? pass('Wiring file has /dev/backup-health-harness route entry')
  : fail('Wiring file must have /dev/backup-health-harness route entry');

// Check showInNav: false for the new route
const routeBlockMatch = wiringFileContent.match(
  /path:\s*['"]\/dev\/backup-health-harness['"][\s\S]{0,200}?showInNav:\s*(true|false)/
);
if (routeBlockMatch) {
  routeBlockMatch[1] === 'false'
    ? pass('/dev/backup-health-harness route has showInNav: false')
    : fail('/dev/backup-health-harness route must have showInNav: false', `found showInNav: ${routeBlockMatch[1]}`);
} else {
  fail('/dev/backup-health-harness showInNav check failed', 'could not find showInNav field near route entry');
}

wiringFileContent.includes('/dev/fsrs-ui-fixture')
  ? pass('Existing /dev/fsrs-ui-fixture route is still present (unchanged)')
  : fail('/dev/fsrs-ui-fixture must remain in wiring file (was not supposed to be removed)');

// ── 6. Component forbidden API checks ────────────────────────────────────────

const componentContent = readFile(COMPONENT_FILE) || '';

const FORBIDDEN_APIS = [
  ['localStorage.', 'localStorage property access'],
  ['indexedDB.', 'indexedDB property access'],
  ['new IDBFactory', 'IDBFactory instantiation'],
  ['fetch(', 'fetch() call'],
  ['new XMLHttpRequest', 'XMLHttpRequest instantiation'],
  ['sendBeacon(', 'sendBeacon() call'],
  ['analytics(', 'analytics() call'],
  ['gtag(', 'gtag() call'],
  ['Date.now()', 'Date.now() direct call'],
];

for (const [pattern, label] of FORBIDDEN_APIS) {
  componentContent.includes(pattern)
    ? fail(`Component must not use ${label}`, `found "${pattern}" in ${COMPONENT_FILE}`)
    : pass(`Component does not use ${label}`);
}

// fs/file APIs
(componentContent.includes(`from 'fs'`) || componentContent.includes(`from 'node:fs'`) || componentContent.includes('readFileSync'))
  ? fail('Component must not import fs or use readFileSync')
  : pass('Component does not import fs or file APIs');

// ── 7. Component: no href or nav link patterns ───────────────────────────────

const hrefInComponent = componentContent.match(/href\s*=/);
hrefInComponent
  ? fail('Component must not contain href attribute', `found href= in ${COMPONENT_FILE}`)
  : pass('Component does not contain href attribute');

componentContent.includes('showInNav')
  ? fail('Component must not reference showInNav', `found showInNav in ${COMPONENT_FILE}`)
  : pass('Component does not reference showInNav');

componentContent.includes('navRoutes')
  ? fail('Component must not reference navRoutes', `found navRoutes in ${COMPONENT_FILE}`)
  : pass('Component does not reference navRoutes');

const routeRegPattern = /path:\s*['"`]\/[^'"`]+['"`]/;
routeRegPattern.test(componentContent)
  ? fail('Component must not contain route registration pattern', `found path: "/..." in ${COMPONENT_FILE}`)
  : pass('Component does not contain route registration pattern');

// react-router imports
componentContent.includes(`from 'react-router`)
  ? fail('Component must not import from react-router')
  : pass('Component does not import from react-router');

// ── 8. Component: imports Phase 25M view-model only from allowed path ─────────

componentContent.includes(`from '../../state/backupHealthUiPrototype.js'`)
  ? pass('Component imports from backupHealthUiPrototype.js (allowed path)')
  : fail('Component must import from backupHealthUiPrototype.js', `allowed path: ../../state/backupHealthUiPrototype.js`);

componentContent.includes('createBackupHealthUiModel')
  ? pass('Component imports createBackupHealthUiModel')
  : fail('Component must import createBackupHealthUiModel');

(componentContent.includes(`from '../../state/backupHealthIntegrationPrototype`) ||
 componentContent.includes(`from '../state/backupHealthIntegrationPrototype`))
  ? fail('Component must not import backupHealthIntegrationPrototype directly')
  : pass('Component does not import backupHealthIntegrationPrototype directly');

componentContent.includes('backupHealthSignal')
  ? fail('Component must not import backupHealthSignal directly')
  : pass('Component does not import backupHealthSignal directly');

// Backup/restore imports
const backupImportPatterns = [
  'exportBackup',
  'importBackup',
  'restoreBackup',
  'IndexedDBAdapter',
  'StorageAdapter',
];
for (const pattern of backupImportPatterns) {
  componentContent.includes(pattern)
    ? fail(`Component must not reference ${pattern}`)
    : pass(`Component does not reference ${pattern}`);
}

// ── 9. Component: no forbidden claim language ─────────────────────────────────

// Check that rendered JSX strings (outside comments) do not contain forbidden claims.
// We check for patterns specific to rendered UI text rather than comment references.
const FORBIDDEN_CLAIM_STRINGS = [
  'tự động sao lưu',
  'đồng bộ đám mây',
  'khôi phục tài khoản',
  'platform preservation',
  'broad backup reliability',
  'production adapter-aware',
  '>BETA_READY<',
  'BETA_READY</div>',
  '>guaranteed data-loss',
  '>automatic backup',
  '>cloud sync',
  '>account recovery',
];

for (const claim of FORBIDDEN_CLAIM_STRINGS) {
  componentContent.includes(claim)
    ? fail(`Component must not contain forbidden claim: "${claim}"`)
    : pass(`Component does not contain forbidden claim: "${claim.slice(0, 40)}"`);
}

// ── 10. Component: dashboard/settings/library scope check ────────────────────

const BROAD_ROLLOUT_PATTERNS = [
  ['DashboardCard', 'DashboardCard reference'],
  ['dashboardCard', 'dashboardCard reference'],
  ['SettingsCard', 'SettingsCard reference'],
  ['settingsCard', 'settingsCard reference'],
  ['LibraryCard', 'LibraryCard reference'],
  ['libraryCard', 'libraryCard reference'],
];

for (const [pattern, label] of BROAD_ROLLOUT_PATTERNS) {
  componentContent.includes(pattern)
    ? fail(`Component must not contain ${label}`)
    : pass(`Component does not contain ${label}`);
}

// ── 11. Unit tests: scope checks ─────────────────────────────────────────────

const testContent = readFile(TEST_FILE) || '';

const REQUIRED_TEST_PATTERNS = [
  ['disabled by default with undefined props', 'default-off with undefined'],
  ['disabled by default with null props', 'default-off with null'],
  ['disabled with empty props object', 'default-off with empty object'],
  ['disabled with enabled false', 'default-off with enabled false'],
  ['enabled only with explicit test mode', 'explicit test mode'],
  ['enabled only with explicit default-off mode', 'explicit default-off mode'],
  ['rejects production mode', 'rejects production mode'],
  ['rejects live mode', 'rejects live mode'],
  ['does not mutate props object', 'does not mutate inputs'],
  ['does not call localStorage', 'no localStorage in source'],
  ['does not call fetch(', 'no fetch in source'],
  ['does not contain href attribute', 'no href in source'],
  ['does not claim BETA_READY', 'no BETA_READY claim in source'],
  ['react-router', 'no react-router import'],
];

for (const [pattern, label] of REQUIRED_TEST_PATTERNS) {
  testContent.includes(pattern)
    ? pass(`Unit tests include: ${label}`)
    : fail(`Unit tests must include: ${label}`, `missing pattern: "${pattern}"`);
}

// ── 12. Docs: must-not-claim boundary ────────────────────────────────────────

const MUST_NOT_CLAIM_TERMS = [
  'production-visible Backup Health UI',
  'broad dashboard/settings/library rollout',
  'production adapter-aware backup/export/restore',
  'backup file format',
  'restore overwrite behavior',
  'IndexedDB production storage',
  'storage migration',
  'sync/cloud/account/auth/backend',
  'telemetry or analytics',
  'guaranteed data-loss prevention',
  'broad backup reliability',
  'BETA_READY',
];

for (const term of MUST_NOT_CLAIM_TERMS) {
  (testingDocContent.includes(term) || releaseDocContent.includes(term))
    ? pass(`Must-not-claim boundary present: "${term.slice(0, 60)}"`)
    : fail('Must-not-claim boundary missing', `"${term}"`);
}

// ── 13. Docs: required guardrail statements ───────────────────────────────────

const REQUIRED_GUARDRAIL_STATEMENTS = [
  'Production backup/export/restore behavior remains unchanged by this patch.',
  'Backup file format remains unchanged.',
  'Restore overwrite behavior remains unchanged.',
  'Current localStorage backup compatibility remains unchanged.',
  'Default storage driver remains unchanged.',
  'No IndexedDB.',
  'No storage migration.',
  'No sync/cloud/account/auth/backend.',
  'No telemetry or analytics.',
  'No BETA_READY.',
  'Historical full-chain validators remain manual/local/scheduled audit guidance.',
  'Full historical scripts/validate-*.js chain is not used as a Phase 26D merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

const combinedDocContent = testingDocContent + '\n' + releaseDocContent;

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  combinedDocContent.includes(stmt)
    ? pass(`Required guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required guardrail statement missing', `"${stmt}"`);
}

// ── 14. Docs: tester status — no tester execution claimed ────────────────────

const FORBIDDEN_TESTER_CLAIM_STRINGS = [
  'tester execution confirmed',
  'tester verified',
  'browser test passed',
  'manual test passed',
  'TESTER_COMPLETED',
  'BROWSER_VERIFIED',
];

for (const claim of FORBIDDEN_TESTER_CLAIM_STRINGS) {
  combinedDocContent.toLowerCase().includes(claim.toLowerCase())
    ? fail(`Docs must not claim tester execution: "${claim}"`)
    : pass(`Docs do not claim tester execution: "${claim.slice(0, 40)}"`);
}

combinedDocContent.includes('PREPARED_FOR_EXTERNAL_TESTER')
  ? pass('Docs correctly use PREPARED_FOR_EXTERNAL_TESTER status (not claimed as executed)')
  : fail('Docs must contain PREPARED_FOR_EXTERNAL_TESTER status token');

// ── 15. Rollback plan completeness ────────────────────────────────────────────

combinedDocContent.includes('Remove `src/components/dev/BackupHealthDevHarness.jsx`.')
  ? pass('Rollback plan includes component removal')
  : fail('Rollback plan must include component removal');

combinedDocContent.includes('Remove `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`.')
  ? pass('Rollback plan includes test file removal')
  : fail('Rollback plan must include test file removal');

combinedDocContent.includes('Remove `docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md`.')
  ? pass('Rollback plan includes testing doc removal')
  : fail('Rollback plan must include testing doc removal');

combinedDocContent.includes('Remove `docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md`.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

combinedDocContent.includes('Remove `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js`.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

combinedDocContent.includes('Remove Phase 26D CI registration')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include Phase 26D CI registration removal');

combinedDocContent.includes('No learner data migration or cleanup is required because Phase 26D does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 16. Next phase framing ───────────────────────────────────────────────────

const PHASE26E_FRAMING = [
  'Next recommended phase: Phase 26E — Phase 26D Tester Evidence Review and UI Wiring Re-Decision',
  'Phase 26E is a separate evidence/re-decision gate and is not automatically approved.',
  'Phase 26D does not approve production-visible Backup Health UI.',
  'Phase 26D does not approve production adapter-aware backup/export/restore.',
  'Phase 26D does not approve BETA_READY.',
];

for (const stmt of PHASE26E_FRAMING) {
  combinedDocContent.includes(stmt)
    ? pass(`Phase 26E framing statement present: "${stmt.slice(0, 70)}"`)
    : fail('Phase 26E framing statement missing', `"${stmt}"`);
}

// ── 17. Exact changed-file check via git ──────────────────────────────────────

const ALLOWED_CHANGED_FILES = new Set([
  `src/components/dev/BackupHealthDevHarness.jsx`,
  `tests/unit/components/dev/BackupHealthDevHarness.test.jsx`,
  `docs/testing/phase26d-limited-default-off-ui-wiring-prototype.md`,
  `docs/release/phase26d-limited-default-off-ui-wiring-prototype-summary.md`,
  `scripts/validate-phase26d-limited-default-off-ui-wiring-prototype.js`,
  `.github/workflows/e2e-smoke.yml`,
  `src/routes/routeConfig.js`,
]);

const FORBIDDEN_CHANGED_PATTERNS = [
  /^e2e\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^sw\.js$/,
  /^boot-guard\.js$/,
  /^docs\/adr\//,
  /node_modules/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
];

const FORBIDDEN_PRIOR_PHASE_FILES = [
  'docs/planning/phase26c',
  'docs/testing/phase26c',
  'docs/release/phase26c',
  'scripts/validate-phase26c',
  'docs/planning/phase26b',
  'docs/testing/phase26b',
  'docs/release/phase26b',
  'scripts/validate-phase26b',
  'docs/planning/phase26a',
  'docs/testing/phase26a',
  'docs/release/phase26a',
  'scripts/validate-phase26a',
  'docs/planning/phase25n',
  'docs/testing/phase25n',
  'docs/release/phase25n',
  'scripts/validate-phase25n',
  'src/state/backupHealthUiPrototype.js',
  'tests/unit/backupHealthUiPrototype.test.js',
  'scripts/validate-phase25m',
  'scripts/validate-phase25k',
  'scripts/validate-phase25i',
];

let changedFiles = [];
let diffEmpty = false;
let onMain = false;
let fetchError = false;

try {
  execSync(`git fetch origin refs/heads/main:refs/remotes/origin/main --prune`, {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
} catch (e) {
  fetchError = true;
  fail('origin/main fetch', `git fetch failed: ${e.message}`);
}

if (!fetchError) {
  pass('Validator explicitly fetches origin/main');

  try {
    const currentBranch = execSync('git rev-parse --abbrev-ref HEAD', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();
    onMain = currentBranch === 'main';

    const diffOutput = execSync('git diff origin/main..HEAD --name-only', {
      cwd: ROOT,
      encoding: 'utf8',
    }).trim();

    changedFiles = diffOutput ? diffOutput.split('\n').filter(Boolean) : [];
    diffEmpty = changedFiles.length === 0;

    pass('git diff origin/main..HEAD uses double-dot (not triple-dot)');

    if (diffEmpty && !onMain) {
      fail(
        'Exact changed-file check: non-main empty diff must fail',
        `branch "${currentBranch}" has empty diff but is not main — no Phase 26D changes committed`
      );
    } else if (diffEmpty && onMain) {
      pass('Exact changed-file check: post-merge main with empty diff — content guardrails enforced, file-list check skipped');
    } else {
      const unexpectedFiles = changedFiles.filter(f => !ALLOWED_CHANGED_FILES.has(f));
      const missingAllowed = [...ALLOWED_CHANGED_FILES].filter(f => !changedFiles.includes(f));
      const forbiddenPatternMatches = changedFiles.filter(f =>
        FORBIDDEN_CHANGED_PATTERNS.some(p => p.test(f))
      );

      unexpectedFiles.length === 0
        ? pass('Changed files are a subset of allowed files')
        : fail('Unexpected changed files', unexpectedFiles.join(', '));

      missingAllowed.length === 0
        ? pass('All allowed files are present in the diff')
        : fail('Missing expected changed files', missingAllowed.join(', '));

      forbiddenPatternMatches.length === 0
        ? pass('No forbidden-pattern files in diff')
        : fail('Forbidden-pattern files found in diff', forbiddenPatternMatches.join(', '));

      const priorPhaseMatches = changedFiles.filter(f =>
        FORBIDDEN_PRIOR_PHASE_FILES.some(prior => f.includes(prior))
      );
      priorPhaseMatches.length === 0
        ? pass('No prior Phase 26C/26B/26A/25N/25M/25K/25I files in diff')
        : fail('Prior phase files must not be changed', priorPhaseMatches.join(', '));

      const generatedArtifacts = changedFiles.filter(f =>
        f.startsWith('node_modules/') ||
        f.startsWith('dist/') ||
        f.startsWith('coverage/') ||
        f.startsWith(`test-results/`) ||
        f.startsWith('playwright-report/') ||
        f === 'FETCH_HEAD'
      );
      generatedArtifacts.length === 0
        ? pass('No generated artifacts in changed files')
        : fail('Generated artifacts found in changed files', generatedArtifacts.join(', '));

      // Broad route/nav wiring check: only the selected dev-only harness file is allowed
      const broadNavFiles = changedFiles.filter(f => {
        if (f === SELECTED_WIRING_FILE) return false; // allowed — dev harness file
        return (
          f.startsWith(`src/routes/`) ||
          f === 'src/App.jsx' ||
          f === 'src/App.tsx' ||
          f === 'src/main.jsx' ||
          f === 'src/main.tsx'
        );
      });
      broadNavFiles.length === 0
        ? pass('No broad navigation/route files changed (except selected dev harness wiring file)')
        : fail('Broad navigation/route files must not be changed', broadNavFiles.join(', '));

      // Storage driver check
      const storageDriverFiles = changedFiles.filter(f =>
        f.includes('IndexedDB') || f.includes('StorageAdapter') || f.includes('storage/driver')
      );
      storageDriverFiles.length === 0
        ? pass('No storage driver files changed')
        : fail('Storage driver files must not be changed', storageDriverFiles.join(', '));

      // Backup/restore module check
      const backupRestoreFiles = changedFiles.filter(f =>
        (f.includes('backup') || f.includes('restore') || f.includes('export')) &&
        !f.includes('phase26d') && !f.includes('BackupHealthDev')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 18. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 26D');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 26D');

// ── 19. No telemetry/analytics strings added in component ────────────────────

const telemetryPatterns = [
  'analytics(',
  'gtag(',
  'sendBeacon(',
  'amplitude(',
  'mixpanel(',
  'segment(',
  'datadog(',
  'sentry(',
];

for (const pattern of telemetryPatterns) {
  componentContent.includes(pattern)
    ? fail(`Component must not contain telemetry pattern: "${pattern}"`)
    : pass(`Component does not contain telemetry pattern: "${pattern}"`);
}

// ── 20. Wiring file breadth check ─────────────────────────────────────────────

// The wiring file should only add one new route, not change production routes
wiringFileContent.includes('/dev/backup-health-harness')
  ? pass('Wiring file contains Phase 26D dev route')
  : fail('Wiring file must contain /dev/backup-health-harness route');

// Confirm all production routes still present
const productionRoutes = ['/dashboard', '/library', '/study-room', '/settings'];
for (const route of productionRoutes) {
  wiringFileContent.includes(route)
    ? pass(`Production route still present: ${route}`)
    : fail(`Production route must not be removed: ${route}`);
}

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
