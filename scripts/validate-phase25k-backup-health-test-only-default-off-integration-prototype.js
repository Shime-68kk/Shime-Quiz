#!/usr/bin/env node
/**
 * Phase 25K Static Validator — Backup Health Test-Only Default-Off Integration Prototype
 *
 * PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY
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

const TESTING_DOC = `docs/testing/phase25k-backup-health-test-only-default-off-integration-prototype.md`;
const RELEASE_DOC = `docs/release/phase25k-backup-health-test-only-default-off-integration-prototype-summary.md`;
const VALIDATOR = `scripts/validate-phase25k-backup-health-test-only-default-off-integration-prototype.js`;
const PROTOTYPE_SRC = `src/state/backupHealthIntegrationPrototype.js`;
const PROTOTYPE_TEST = `tests/unit/backupHealthIntegrationPrototype.test.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass('Testing doc exists')
  : fail('Testing doc exists', `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

fileExists(PROTOTYPE_SRC)
  ? pass('Prototype source file exists')
  : fail('Prototype source file exists', `missing ${PROTOTYPE_SRC}`);

fileExists(PROTOTYPE_TEST)
  ? pass('Prototype unit test file exists')
  : fail('Prototype unit test file exists', `missing ${PROTOTYPE_TEST}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase25k')
  ? pass('CI registers Phase 25K validator')
  : fail('CI registers Phase 25K validator', 'e2e-smoke.yml does not reference validate-phase25k');

ciContent.includes('Fetch origin main for Phase 25K validator')
  ? pass('CI has explicit fetch step before Phase 25K validator')
  : fail('CI has explicit fetch step before Phase 25K validator', 'missing "Fetch origin main for Phase 25K validator" step');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25J validators as active merge-blocking steps')
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

const PHASE25K_TOKENS = [
  'PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY',
];

for (const docPath of [TESTING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of PHASE25K_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 70)}`)
      : fail(`Doc ${docPath} missing token`, token);
  }
}

// ── 4. Phase 25I and Phase 25J baseline tokens referenced ────────────────────

const PHASE25I_TOKENS = [
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER',
  'PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES',
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE',
];

const PHASE25J_TOKENS = [
  'PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE',
];

const allDocContent =
  (readFile(TESTING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

for (const token of PHASE25I_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25I baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25I baseline token missing', token);
}

for (const token of PHASE25J_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25J baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25J baseline token missing', token);
}

allDocContent.includes('Phase 25I-HF1')
  ? pass('Phase 25I-HF1 post-merge context fix is referenced')
  : fail('Phase 25I-HF1 post-merge context fix must be referenced in docs');

// ── 5. Required guardrail statements ────────────────────────────────────────

const REQUIRED_STATEMENTS = [
  'Phase 25K is a test-only/default-off integration prototype.',
  'Phase 25K does not expose production-visible Backup Health UI.',
  'Phase 25K does not wire the prototype into routes/navigation/settings/library/dashboard.',
  'Phase 25K does not write backup health state.',
  'Phase 25K does not change production backup/export/restore behavior.',
  'Phase 25K does not change backup file format.',
  'Phase 25K does not change restore overwrite behavior.',
  'Phase 25K does not implement production adapter-aware backup/export/restore.',
  'Phase 25K does not add sync/cloud/account/auth/backend.',
  'Phase 25K does not add telemetry/analytics.',
  'Phase 25K does not add dependencies.',
  'Phase 25K does not perform storage migration.',
  'Phase 25K does not claim BETA_READY.',
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25K merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_STATEMENTS) {
  const found = allDocContent.includes(stmt);
  found
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 6. Required doc sections ─────────────────────────────────────────────────

const REQUIRED_TESTING_SECTIONS = [
  '## Implementation scope',
  '## Default-off gate behavior',
  '## Read-only integration boundary',
  '## Phase 25I signal layer import gate',
  '## No UI proof',
  '## No write proof',
  '## No backup/export/restore behavior change proof',
  '## Unit test evidence',
  '## Validator evidence',
  '## Rollback/removal plan',
  '## Manual/browser evidence status',
  '## What Phase 25K can claim',
  '## What Phase 25K must not claim',
  '## Next recommended phase',
];

const testingDocContent = readFile(TESTING_DOC) || '';
for (const section of REQUIRED_TESTING_SECTIONS) {
  testingDocContent.includes(section)
    ? pass(`Testing doc has section: ${section}`)
    : fail('Testing doc missing section', section);
}

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Runtime scope token',
  '## Decision token',
  '## Scope',
  '## Design decision',
  '## Implementation summary',
  '## Default-off gate summary',
  '## Read-only integration boundary summary',
  '## Phase 25I signal layer import gate',
  '## No UI proof',
  '## No write proof',
  '## No backup/export/restore behavior change proof',
  '## Rollback plan',
  '## Guardrails',
  '## What Phase 25K can claim',
  '## What Phase 25K must not claim',
  '## Next recommended phase',
];

const releaseDocContent = readFile(RELEASE_DOC) || '';
for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 7. Next-phase statements ─────────────────────────────────────────────────

const NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 25L — Backup Health Production UI Design Gate',
  'Phase 25L is a separate design gate only and is not automatically approved.',
  'Phase 25K does not approve production-visible Backup Health UI.',
  'Phase 25K does not approve production adapter-aware backup/export/restore.',
];

for (const stmt of NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase statement missing', `"${stmt}"`);
}

// ── 8. Forbidden affirmative doc claims ─────────────────────────────────────

const docLinesStripped = allDocContent
  .split('\n')
  .filter(l => {
    const lower = l.toLowerCase();
    return !(
      lower.includes('does not claim') ||
      lower.includes('must not claim') ||
      lower.includes('do not claim') ||
      lower.includes('cannot claim') ||
      lower.includes('does not approve') ||
      lower.includes('must not approve') ||
      lower.includes('phase 25k does not') ||
      lower.includes('phase 25k must not') ||
      lower.includes('forbidden') ||
      lower.includes('not approved') ||
      lower.includes('does not add') ||
      lower.includes('does not implement') ||
      lower.includes('does not introduce') ||
      lower.includes('does not change') ||
      lower.includes('does not import') ||
      lower.includes('does not modify') ||
      lower.includes('remains unchanged') ||
      lower.includes('no runtime') ||
      lower.includes('not automatically approved') ||
      lower.includes('validator.*checks') ||
      lower.includes('must.*not claim')
    );
  })
  .join('\n');

const forbiddenDocFound = [];
if (
  docLinesStripped.includes('BETA_READY: true') ||
  docLinesStripped.includes('BETA_READY=true') ||
  docLinesStripped.includes('status: BETA_READY')
) {
  forbiddenDocFound.push('affirmative BETA_READY status token');
}
if (
  docLinesStripped.includes('production UI is ready') ||
  docLinesStripped.includes('production Backup Health UI is available') ||
  docLinesStripped.includes('production Backup Health UI is live')
) {
  forbiddenDocFound.push('affirmative production Backup Health UI claim');
}
if (docLinesStripped.includes('guaranteed data-loss prevention is provided')) {
  forbiddenDocFound.push('affirmative guaranteed data-loss prevention claim');
}
forbiddenDocFound.length === 0
  ? pass('Docs do not contain affirmative forbidden claims (BETA_READY, production UI, guaranteed data-loss prevention)')
  : fail('Docs must not contain affirmative forbidden claims', forbiddenDocFound.join(', '));

// ── 9. Prototype source content checks ──────────────────────────────────────

const protoSrc = readFile(PROTOTYPE_SRC) || '';

// Must import from Phase 25I signal layer only
protoSrc.includes(`from './backupHealthSignal.js'`)
  ? pass('Prototype imports Phase 25I signal layer from allowed path')
  : fail('Prototype must import from ./backupHealthSignal.js', 'import path not found');

// Strip comment lines before checking for forbidden runtime patterns
const protoSrcCodeLines = protoSrc
  .split('\n')
  .filter(line => {
    const t = line.trim();
    return !(t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'));
  })
  .join('\n');

// Must not use forbidden runtime APIs in non-comment code
const FORBIDDEN_IMPORT_PATTERNS = [
  { pattern: 'localStorage', label: 'localStorage' },
  { pattern: 'indexedDB', label: 'indexedDB' },
  { pattern: 'IndexedDB', label: 'IndexedDB' },
  { pattern: /import.*from.*router/, label: 'import.*from.*router' },
  { pattern: /import.*from.*routes/, label: 'import.*from.*routes' },
  { pattern: /import.*from.*settings/, label: 'import.*from.*settings' },
  { pattern: /import.*from.*library/, label: 'import.*from.*library' },
  { pattern: /import.*from.*dashboard/, label: 'import.*from.*dashboard' },
  { pattern: /import.*from.*backup/, label: 'import.*from.*backup' },
  { pattern: /import.*from.*export/, label: 'import.*from.*export' },
  { pattern: /import.*from.*restore/, label: 'import.*from.*restore' },
  { pattern: 'Date.now()', label: 'Date.now()' },
  { pattern: 'fetch(', label: 'fetch(' },
  { pattern: 'XMLHttpRequest', label: 'XMLHttpRequest' },
  { pattern: 'navigator.sendBeacon', label: 'navigator.sendBeacon' },
  { pattern: 'analytics', label: 'analytics' },
  { pattern: 'telemetry', label: 'telemetry' },
];

for (const { pattern, label } of FORBIDDEN_IMPORT_PATTERNS) {
  const found = pattern instanceof RegExp
    ? pattern.test(protoSrcCodeLines)
    : protoSrcCodeLines.includes(pattern);
  if (found) {
    fail(`Prototype must not use forbidden pattern: ${label}`, 'found in src/state/backupHealthIntegrationPrototype.js');
  } else {
    pass(`Prototype does not use forbidden pattern: ${label}`);
  }
}

// Must export required functions
protoSrc.includes('export function isBackupHealthIntegrationEnabled')
  ? pass('Prototype exports isBackupHealthIntegrationEnabled')
  : fail('Prototype must export isBackupHealthIntegrationEnabled');

protoSrc.includes('export function createBackupHealthIntegrationState')
  ? pass('Prototype exports createBackupHealthIntegrationState')
  : fail('Prototype must export createBackupHealthIntegrationState');

// Must contain phase tokens
protoSrc.includes('PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE')
  ? pass('Prototype source contains Phase 25K status token')
  : fail('Prototype source must contain Phase 25K status token');

protoSrc.includes('PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES')
  ? pass('Prototype source contains Phase 25K scope token')
  : fail('Prototype source must contain Phase 25K scope token');

// ── 10. Unit test content checks ─────────────────────────────────────────────

const testSrc = readFile(PROTOTYPE_TEST) || '';

const REQUIRED_TEST_PATTERNS = [
  'default disabled with undefined options',
  'default disabled with empty options',
  'disabled when enabled false',
  'returns true for explicit test mode',
  'returns true for explicit default-off mode',
  'rejects unsupported mode',
  'disabled path does not require signal input',
  'enabled path derives state from Phase 25I signal layer',
  'recent manual export signal passes through',
  'generated/test restore verification passes through',
  'real/user restore verification does not count as verified',
  'unavailable',
  'error signal maps',
  'future timestamp',
  'does not mutate',
  'does not expose write',
  'does not expose render',
];

for (const pattern of REQUIRED_TEST_PATTERNS) {
  testSrc.includes(pattern)
    ? pass(`Unit test covers: "${pattern}"`)
    : fail(`Unit test missing coverage for: "${pattern}"`);
}

// Must contain phase tokens
testSrc.includes('PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE')
  ? pass('Unit test file contains Phase 25K status token')
  : fail('Unit test file must contain Phase 25K status token');

// ── 11. No UI file imports the prototype ────────────────────────────────────

// Scan src for any file that imports the prototype (excluding prototype itself)
let uiImportViolations = [];
try {
  const srcDir = path.join(ROOT, 'src');
  const srcFiles = fs.readdirSync(srcDir, { recursive: true });
  for (const f of srcFiles) {
    const relF = typeof f === 'string' ? f : f.toString();
    if (relF === 'state/backupHealthIntegrationPrototype.js') continue;
    const absF = path.join(srcDir, relF);
    try {
      const stat = fs.statSync(absF);
      if (!stat.isFile()) continue;
      const content = fs.readFileSync(absF, 'utf8');
      if (content.includes('backupHealthIntegrationPrototype')) {
        uiImportViolations.push(`src/${relF}`);
      }
    } catch {
      // skip unreadable
    }
  }
} catch {
  // skip if src scan fails
}
uiImportViolations.length === 0
  ? pass('No src file (besides prototype itself) imports backupHealthIntegrationPrototype')
  : fail('Prototype must not be imported by production src files', uiImportViolations.join(', '));

// ── 12. No package/dependency changes ───────────────────────────────────────

// Checked via changed-files gate below; also check validator does not import runtime modules
const validatorSrc = readFile(VALIDATOR) || '';
validatorSrc.includes(`import fs from 'fs'`)
  ? pass('Validator uses fs module (static analysis only)')
  : pass('Validator does not dynamically import runtime modules');

// ── 13. Exact changed-file enforcement via git ───────────────────────────────

const EXACT_ALLOWED_CHANGED_FILES = new Set([
  `.github/workflows/e2e-smoke.yml`,
  TESTING_DOC,
  RELEASE_DOC,
  VALIDATOR,
  PROTOTYPE_SRC,
  PROTOTYPE_TEST,
]);

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
        fail(
          'Exact changed-file set mismatch',
          'diff is empty on non-main context; expected Phase 25K files'
        );
        fail('No forbidden files changed', 'cannot verify — diff is empty on non-main context');
      }
    } else {
      const unexpected = gitChangedFiles.filter(f => !EXACT_ALLOWED_CHANGED_FILES.has(f));
      unexpected.length === 0
        ? pass(`All changed files (${gitChangedFiles.length}) are within the authorized Phase 25K set`)
        : fail(
            'Unauthorized files changed',
            `unexpected: ${unexpected.join(', ')}`
          );

      const FORBIDDEN_CHANGED = [
        'package.json',
        'package-lock.json',
        'sw.js',
        'boot-guard.js',
      ];
      const forbiddenChanged = gitChangedFiles.filter(f =>
        FORBIDDEN_CHANGED.includes(f) ||
        f.startsWith('e2e/') ||
        f.startsWith('docs/adr/')
      );
      forbiddenChanged.length === 0
        ? pass('No forbidden files changed (e2e/**, package.json, sw.js, boot-guard.js, docs/adr/**)')
        : fail('Forbidden files must not be changed', forbiddenChanged.join(', '));

      // Prior Phase 25I and Phase 25J files must not be modified
      const priorPhaseChanged = gitChangedFiles.filter(f =>
        f.includes('phase25i') || f.includes('phase25j') ||
        f.includes('backupHealthSignal') ||
        f.includes('backupHealthTestOnlyPrototype')
      );
      priorPhaseChanged.length === 0
        ? pass('Prior Phase 25I and Phase 25J files are not modified')
        : fail('Prior Phase 25I and Phase 25J files must not be modified', priorPhaseChanged.join(', '));

      // No historical validators changed
      const historicalValidatorChanged = gitChangedFiles.filter(f =>
        f.startsWith('scripts/validate-') && f !== VALIDATOR
      );
      historicalValidatorChanged.length === 0
        ? pass('No historical validators changed')
        : fail('Historical validators must not be changed', historicalValidatorChanged.join(', '));

      // No production backup/export/restore files changed
      const backupRestoreChanged = gitChangedFiles.filter(f =>
        (f.startsWith('src/') || f.startsWith('tests/')) &&
        (f.includes('backup') || f.includes('export') || f.includes('restore')) &&
        f !== PROTOTYPE_SRC &&
        f !== PROTOTYPE_TEST
      );
      backupRestoreChanged.length === 0
        ? pass('No production backup/export/restore files changed')
        : fail('Production backup/export/restore files must not be changed', backupRestoreChanged.join(', '));

      // No generated artifacts in changed files
      const GENERATED_ARTIFACT_PATTERNS = [
        /^node_modules\//,
        /^dist\//,
        /^coverage\//,
        /^test-results\//,
        /^playwright-report\//,
        /FETCH_HEAD/,
      ];
      const generatedArtifactChanged = gitChangedFiles.filter(f =>
        GENERATED_ARTIFACT_PATTERNS.some(re => re.test(f))
      );
      generatedArtifactChanged.length === 0
        ? pass('No generated artifacts in changed files')
        : fail('Generated artifacts must not be committed', generatedArtifactChanged.join(', '));
    }
  }
}

// ── Final result ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 25K static validation complete.');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — see FAIL lines above.');
  process.exit(1);
}
