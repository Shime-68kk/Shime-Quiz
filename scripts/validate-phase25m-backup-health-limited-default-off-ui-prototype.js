#!/usr/bin/env node
/**
 * Phase 25M Static Validator — Backup Health Limited Default-Off UI View-Model Prototype
 *
 * PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE
 * PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES
 * PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE
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

const TESTING_DOC = `docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md`;
const RELEASE_DOC = `docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md`;
const VALIDATOR = `scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js`;
const UI_PROTOTYPE_SRC = `src/state/backupHealthUiPrototype.js`;
const UI_PROTOTYPE_TEST = `tests/unit/backupHealthUiPrototype.test.js`;
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

fileExists(UI_PROTOTYPE_SRC)
  ? pass('UI prototype source file exists')
  : fail('UI prototype source file exists', `missing ${UI_PROTOTYPE_SRC}`);

fileExists(UI_PROTOTYPE_TEST)
  ? pass('UI prototype unit test file exists')
  : fail('UI prototype unit test file exists', `missing ${UI_PROTOTYPE_TEST}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

ciContent.includes('validate-phase25m')
  ? pass('CI registers Phase 25M validator')
  : fail('CI registers Phase 25M validator', 'e2e-smoke.yml does not reference validate-phase25m');

ciContent.includes('Fetch origin main for Phase 25M validator')
  ? pass('CI has explicit fetch step before Phase 25M validator')
  : fail('CI has explicit fetch step before Phase 25M validator', 'missing "Fetch origin main for Phase 25M validator" step');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25L validators as active merge-blocking steps')
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

const PHASE25M_TOKENS = [
  'PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE',
  'PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES',
  'PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE',
];

for (const docPath of [TESTING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of PHASE25M_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 70)}`)
      : fail(`Doc ${docPath} missing token`, token);
  }
}

// ── 4. Manual evidence run pack status token ─────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
testingDocContent.includes('PHASE25M_MANUAL_BROWSER_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED')
  ? pass('Testing doc contains manual evidence run pack status token PREPARED_NOT_EXECUTED')
  : fail('Testing doc must contain PHASE25M_MANUAL_BROWSER_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED');

// ── 5. Phase 25K and Phase 25L baseline tokens referenced ────────────────────

const PHASE25L_TOKENS = [
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES',
];

const PHASE25K_TOKENS = [
  'PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES',
  'PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY',
];

const PHASE25I_TOKENS = [
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER',
  'PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES',
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE',
];

const allDocContent =
  (readFile(TESTING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

for (const token of PHASE25L_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25L baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25L baseline token missing', token);
}

for (const token of PHASE25K_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25K baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25K baseline token missing', token);
}

for (const token of PHASE25I_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25I baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25I baseline token missing', token);
}

allDocContent.includes('Phase 25I-HF1')
  ? pass('Phase 25I-HF1 post-merge context fix is referenced')
  : fail('Phase 25I-HF1 post-merge context fix must be referenced in docs');

// ── 6. Required guardrail statements ────────────────────────────────────────

const REQUIRED_STATEMENTS = [
  'Phase 25M is a limited default-off UI view-model prototype.',
  'Phase 25M does not expose production-visible Backup Health UI.',
  'Phase 25M does not create React/JSX UI components.',
  'Phase 25M does not wire the view model into routes/navigation/settings/library/dashboard.',
  'Phase 25M does not write backup health state.',
  'Phase 25M does not change production backup/export/restore behavior.',
  'Phase 25M does not change backup file format.',
  'Phase 25M does not change restore overwrite behavior.',
  'Phase 25M does not implement production adapter-aware backup/export/restore.',
  'Phase 25M does not add sync/cloud/account/auth/backend.',
  'Phase 25M does not add telemetry/analytics.',
  'Phase 25M does not add dependencies.',
  'Phase 25M does not perform storage migration.',
  'Phase 25M does not claim BETA_READY.',
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25M merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_STATEMENTS) {
  const found = allDocContent.includes(stmt);
  found
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 7. Required testing doc sections ────────────────────────────────────────

const REQUIRED_TESTING_SECTIONS = [
  '## Implementation scope',
  '## Default-off gate behavior',
  '## Read-only UI view-model boundary',
  '## Phase 25K prototype import gate',
  '## No production UI proof',
  '## No route/navigation/settings/library/dashboard proof',
  '## No write proof',
  '## No backup/export/restore behavior change proof',
  '## Vietnamese-first copy review',
  '## Accessibility considerations',
  '## Unit test evidence',
  '## Validator evidence',
  '## Manual/browser evidence status',
  '## Manual/browser evidence run pack',
  '## Rollback/removal plan',
  '## What Phase 25M can claim',
  '## What Phase 25M must not claim',
  '## Next recommended phase',
];

for (const section of REQUIRED_TESTING_SECTIONS) {
  testingDocContent.includes(section)
    ? pass(`Testing doc has section: ${section}`)
    : fail('Testing doc missing section', section);
}

// ── 8. Required release doc sections ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_SECTIONS = [
  '## Status token',
  '## Runtime scope token',
  '## Decision token',
  '## Scope',
  '## Design decision',
  '## Implementation summary',
  '## Default-off gate summary',
  '## Read-only UI view-model boundary summary',
  '## Phase 25K prototype import gate',
  '## No UI proof',
  '## No write proof',
  '## No backup/export/restore behavior change proof',
  '## Rollback plan',
  '## Guardrails',
  '## What Phase 25M can claim',
  '## What Phase 25M must not claim',
  '## Next recommended phase',
];

for (const section of REQUIRED_RELEASE_SECTIONS) {
  releaseDocContent.includes(section)
    ? pass(`Release doc has section: ${section}`)
    : fail('Release doc missing section', section);
}

// ── 9. Next-phase statements ─────────────────────────────────────────────────

const NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 25N — Backup Health Manual Evidence and Phase 25 Closure Gate',
  'Phase 25N is a separate evidence/closure gate and is not automatically approved.',
  'Phase 25M does not approve production-visible Backup Health UI by default.',
  'Phase 25M does not approve production adapter-aware backup/export/restore.',
];

for (const stmt of NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase statement missing', `"${stmt}"`);
}

// ── 10. Rollback plan completeness ───────────────────────────────────────────

allDocContent.includes('Remove src/state/backupHealthUiPrototype.js.')
  ? pass('Rollback plan includes UI prototype source removal')
  : fail('Rollback plan must include src/state/backupHealthUiPrototype.js removal');

allDocContent.includes('Remove tests/unit/backupHealthUiPrototype.test.js.')
  ? pass('Rollback plan includes UI prototype test removal')
  : fail('Rollback plan must include tests/unit/backupHealthUiPrototype.test.js removal');

allDocContent.includes('Remove docs/testing/phase25m-backup-health-limited-default-off-ui-prototype.md.')
  ? pass('Rollback plan includes testing doc removal')
  : fail('Rollback plan must include testing doc removal');

allDocContent.includes('Remove docs/release/phase25m-backup-health-limited-default-off-ui-prototype-summary.md.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove scripts/validate-phase25m-backup-health-limited-default-off-ui-prototype.js.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 25M CI registration.')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 25M does not migrate data or change backup/export/restore behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 11. Forbidden affirmative doc claims ─────────────────────────────────────

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
      lower.includes('phase 25m does not') ||
      lower.includes('phase 25m must not') ||
      lower.includes('forbidden') ||
      lower.includes('not approved') ||
      lower.includes('does not add') ||
      lower.includes('does not implement') ||
      lower.includes('does not introduce') ||
      lower.includes('does not change') ||
      lower.includes('does not import') ||
      lower.includes('does not modify') ||
      lower.includes('does not create') ||
      lower.includes('does not wire') ||
      lower.includes('does not write') ||
      lower.includes('does not perform') ||
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
if (docLinesStripped.includes('browser/manual evidence was executed in Phase 25M')) {
  forbiddenDocFound.push('affirmative browser/manual evidence execution claim');
}
if (docLinesStripped.includes('production adapter-aware backup/export/restore is implemented')) {
  forbiddenDocFound.push('affirmative production adapter-aware backup claim');
}
forbiddenDocFound.length === 0
  ? pass('Docs do not contain affirmative forbidden claims (BETA_READY, production UI, guaranteed data-loss prevention, adapter-aware backup, executed evidence)')
  : fail('Docs must not contain affirmative forbidden claims', forbiddenDocFound.join(', '));

// ── 12. UI prototype source content checks ───────────────────────────────────

const protoSrc = readFile(UI_PROTOTYPE_SRC) || '';

// Must import from Phase 25K integration prototype only
protoSrc.includes(`from './backupHealthIntegrationPrototype.js'`)
  ? pass('UI prototype imports Phase 25K integration prototype from allowed path')
  : fail('UI prototype must import from ./backupHealthIntegrationPrototype.js', 'import path not found');

// Must not import from forbidden paths
const protoSrcCodeLines = protoSrc
  .split('\n')
  .filter(line => {
    const t = line.trim();
    return !(t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'));
  })
  .join('\n');

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
    fail(`UI prototype must not use forbidden pattern: ${label}`, `found in ${UI_PROTOTYPE_SRC}`);
  } else {
    pass(`UI prototype does not use forbidden pattern: ${label}`);
  }
}

// Must not contain JSX/React component exports
// Check non-comment code lines only to avoid false positives from "No JSX/React" comment text
const protoNonCommentCode = protoSrc
  .split('\n')
  .filter(line => {
    const t = line.trim();
    return !(t.startsWith('//') || t.startsWith('*') || t.startsWith('/*'));
  })
  .join('\n');
const hasReactImport = /import\s+(?:React|{[^}]*})\s+from\s+['"]react['"]/i.test(protoNonCommentCode);
const hasJsxReturn = protoNonCommentCode.includes('return (') &&
  (protoNonCommentCode.includes('</') || protoNonCommentCode.includes('/>'));
const hasJsx = hasReactImport || hasJsxReturn;
hasJsx
  ? fail('UI prototype must not contain JSX/React component exports')
  : pass('UI prototype does not contain JSX/React component exports');

// Must export required functions
protoSrc.includes('export function isBackupHealthUiPrototypeEnabled')
  ? pass('UI prototype exports isBackupHealthUiPrototypeEnabled')
  : fail('UI prototype must export isBackupHealthUiPrototypeEnabled');

protoSrc.includes('export function createBackupHealthUiModel')
  ? pass('UI prototype exports createBackupHealthUiModel')
  : fail('UI prototype must export createBackupHealthUiModel');

// Must contain phase tokens
protoSrc.includes('PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE')
  ? pass('UI prototype source contains Phase 25M status token')
  : fail('UI prototype source must contain Phase 25M status token');

protoSrc.includes('PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES')
  ? pass('UI prototype source contains Phase 25M scope token')
  : fail('UI prototype source must contain Phase 25M scope token');

// ── 13. Unit test content checks ─────────────────────────────────────────────

const testSrc = readFile(UI_PROTOTYPE_TEST) || '';

const REQUIRED_TEST_PATTERNS = [
  'default disabled with undefined options',
  'default disabled with empty options',
  'disabled when enabled false',
  'enabled only for explicit test',
  'enabled only for explicit default-off',
  'rejects unsupported production',
  'disabled path does not require signal input',
  'enabled path derives view model from Phase 25K integration prototype',
  'recent manual backup maps to calm Vietnamese copy',
  'stale backup maps to non-alarmist reminder copy',
  'generated/test restore verification maps to limited evidence copy',
  'real/user restore verification does not count as verified',
  'unavailable/error signal maps conservatively',
  'unknown/no-input states map conservatively',
  'copy does not contain forbidden guarantee language',
  'does not mutate',
  'does not use write APIs',
  'does not expose render/show/open/navigate methods',
  'does not contain route or href strings',
];

for (const pattern of REQUIRED_TEST_PATTERNS) {
  testSrc.includes(pattern)
    ? pass(`Unit test covers: "${pattern}"`)
    : fail(`Unit test missing coverage for: "${pattern}"`);
}

// Must contain phase tokens
testSrc.includes('PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE')
  ? pass('Unit test file contains Phase 25M status token')
  : fail('Unit test file must contain Phase 25M status token');

// ── 14. No src file (besides prototype itself) imports the UI prototype ──────

let uiImportViolations = [];
try {
  const srcDir = path.join(ROOT, 'src');
  const srcFiles = fs.readdirSync(srcDir, { recursive: true });
  for (const f of srcFiles) {
    const relF = typeof f === 'string' ? f : f.toString();
    if (relF === `state/backupHealthUiPrototype.js`) continue;
    const absF = path.join(srcDir, relF);
    try {
      const stat = fs.statSync(absF);
      if (!stat.isFile()) continue;
      const content = fs.readFileSync(absF, 'utf8');
      if (content.includes('backupHealthUiPrototype')) {
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
  ? pass('No src file (besides UI prototype itself) imports backupHealthUiPrototype')
  : fail('UI prototype must not be imported by production src files', uiImportViolations.join(', '));

// Also check no backup/export/restore module imports the UI prototype
// (already covered by the src scan above, but make explicit)
uiImportViolations.length === 0
  ? pass('No backup/export/restore module imports the UI prototype')
  : fail('No backup/export/restore module must import backupHealthUiPrototype', uiImportViolations.join(', '));

// ── 15. Exact changed-file enforcement via git ───────────────────────────────

const EXACT_ALLOWED_CHANGED_FILES = new Set([
  `.github/workflows/e2e-smoke.yml`,
  TESTING_DOC,
  RELEASE_DOC,
  VALIDATOR,
  UI_PROTOTYPE_SRC,
  UI_PROTOTYPE_TEST,
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
          'diff is empty on non-main context; expected Phase 25M files'
        );
        fail('No forbidden files changed', 'cannot verify — diff is empty on non-main context');
      }
    } else {
      const unexpected = gitChangedFiles.filter(f => !EXACT_ALLOWED_CHANGED_FILES.has(f));
      unexpected.length === 0
        ? pass(`All changed files (${gitChangedFiles.length}) are within the authorized Phase 25M set`)
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

      // Prior Phase 25I, 25J, 25K, 25L files must not be modified
      const priorPhaseChanged = gitChangedFiles.filter(f =>
        f.includes('phase25i') || f.includes('phase25j') ||
        f.includes('phase25k') || f.includes('phase25l') ||
        f.includes('backupHealthSignal') ||
        f.includes('backupHealthIntegrationPrototype') ||
        f.includes('backupHealthTestOnlyPrototype')
      );
      priorPhaseChanged.length === 0
        ? pass('Prior Phase 25I, Phase 25J, Phase 25K, and Phase 25L files are not modified')
        : fail('Prior Phase 25I, Phase 25J, Phase 25K, and Phase 25L files must not be modified', priorPhaseChanged.join(', '));

      // No historical validators changed (allow only current Phase 25M validator)
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
        f !== UI_PROTOTYPE_SRC &&
        f !== UI_PROTOTYPE_TEST
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

      // No telemetry/analytics files changed
      const telemetryChanged = gitChangedFiles.filter(f =>
        f.includes('telemetry') || f.includes('analytics')
      );
      telemetryChanged.length === 0
        ? pass('No telemetry/analytics files changed')
        : fail('Telemetry/analytics files must not be changed', telemetryChanged.join(', '));

      // No sync/cloud/account/auth/backend files changed
      const syncChanged = gitChangedFiles.filter(f =>
        f.includes('sync') || f.includes('cloud') ||
        f.includes('account') || f.includes('auth') ||
        f.includes('backend')
      );
      syncChanged.length === 0
        ? pass('No sync/cloud/account/auth/backend files changed')
        : fail('Sync/cloud/account/auth/backend files must not be changed', syncChanged.join(', '));
    }
  }
}

// ── Final result ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 25M static validation complete.');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — see FAIL lines above.');
  process.exit(1);
}
