#!/usr/bin/env node
/**
 * Phase 27E Static Validator — Thin Read-Only Adapter-Awareness Integration Prototype
 *
 * PHASE27E_THIN_READ_ONLY_INTEGRATION_STATUS: IMPLEMENTED_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE
 * PHASE27E_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27E_INTEGRATION_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_PRODUCTION_INTEGRATION
 * PHASE27E_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM
 *
 * Static analysis only. No imports of runtime modules.
 * Reads files as text and checks content.
 * Does not execute git fetch — origin/main provided by actions/checkout@v4 with fetch-depth: 0.
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

const TESTING_DOC = `docs/testing/phase27e-thin-read-only-adapter-awareness-integration-prototype.md`;
const RELEASE_DOC = `docs/release/phase27e-thin-read-only-adapter-awareness-integration-prototype-summary.md`;
const SOURCE_FILE = `src/state/adapterAwarenessIntegrationPrototype.js`;
const TEST_FILE = `tests/unit/adapterAwarenessIntegrationPrototype.test.js`;
const VALIDATOR = `scripts/validate-phase27e-thin-read-only-adapter-awareness-integration-prototype.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(TESTING_DOC)
  ? pass(`Testing doc exists: ${TESTING_DOC}`)
  : fail(`Testing doc exists`, `missing ${TESTING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass(`Release summary doc exists: ${RELEASE_DOC}`)
  : fail(`Release summary doc exists`, `missing ${RELEASE_DOC}`);

fileExists(SOURCE_FILE)
  ? pass(`Source file exists: ${SOURCE_FILE}`)
  : fail(`Source file exists`, `missing ${SOURCE_FILE}`);

fileExists(TEST_FILE)
  ? pass(`Test file exists: ${TEST_FILE}`)
  : fail(`Test file exists`, `missing ${TEST_FILE}`);

fileExists(VALIDATOR)
  ? pass(`Validator script exists: ${VALIDATOR}`)
  : fail(`Validator script exists`, `missing ${VALIDATOR}`);

fileExists(CI_WORKFLOW)
  ? pass(`CI workflow exists: ${CI_WORKFLOW}`)
  : fail(`CI workflow exists`, `missing ${CI_WORKFLOW}`);

// ── 2. Required tokens in docs and source ────────────────────────────────────

const testingDocContent = readFile(TESTING_DOC) || '';
const releaseDocContent = readFile(RELEASE_DOC) || '';
const sourceContent = readFile(SOURCE_FILE) || '';
const testContent = readFile(TEST_FILE) || '';
const validatorContent = readFile(VALIDATOR) || '';
const ciContent = readFile(CI_WORKFLOW) || '';

const allDocContent = testingDocContent + '\n' + releaseDocContent;
const allContent = allDocContent + '\n' + sourceContent + '\n' + validatorContent;

const PHASE27E_TOKENS = [
  'PHASE27E_THIN_READ_ONLY_INTEGRATION_STATUS: IMPLEMENTED_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE',
  'PHASE27E_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES',
  'PHASE27E_INTEGRATION_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_PRODUCTION_INTEGRATION',
  'PHASE27E_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM',
];

for (const token of PHASE27E_TOKENS) {
  allContent.includes(token)
    ? pass(`Required token present: ${token.slice(0, 80)}`)
    : fail('Required token missing', token);
}

// ── 3. Required testing doc headings ─────────────────────────────────────────

const REQUIRED_TESTING_DOC_HEADINGS = [
  '# Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 27D',
  '## Implementation summary',
  '## Integration API',
  '## Unit/static evidence',
  '## Evidence interpretation',
  '## Default-off behavior',
  '## No-write proof',
  '## Backup/export/restore boundary',
  '## Storage driver boundary',
  '## Data safety boundary',
  '## Generated/test data only rule',
  '## Claim boundary',
  '## Rollback/removal plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_TESTING_DOC_HEADINGS) {
  testingDocContent.includes(heading)
    ? pass(`Testing doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Testing doc heading missing', `"${heading}"`);
}

// ── 4. Required release summary headings ─────────────────────────────────────

const REQUIRED_RELEASE_HEADINGS = [
  '# Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype Summary',
  '## Status tokens',
  '## Scope',
  '## Implementation summary',
  '## Unit/static evidence',
  '## What is supported',
  '## What remains not proven',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc heading present: "${heading.slice(0, 70)}"`)
    : fail('Release doc heading missing', `"${heading}"`);
}

// ── 5. Required exports in source ────────────────────────────────────────────

const REQUIRED_EXPORTS = [
  'normalizeAdapterAwarenessSignalInput',
  'createAdapterAwarenessSignal',
  'deriveAdapterAwarenessFromSignals',
  'summarizeAdapterAwarenessIntegration',
];

for (const fn of REQUIRED_EXPORTS) {
  sourceContent.includes(`export function ${fn}`)
    ? pass(`Source exports: ${fn}`)
    : fail(`Source must export: ${fn}`);
}

// ── 6. Disabled/default-off behavior in source ───────────────────────────────

sourceContent.includes(`'adapter_integration_disabled'`) || sourceContent.includes(`"adapter_integration_disabled"`)
  ? pass(`Source contains adapter_integration_disabled state ID`)
  : fail(`Source must contain adapter_integration_disabled state ID`);

sourceContent.includes(`mode === 'test'`) || sourceContent.includes(`mode === "test"`)
  ? pass(`Source checks for test mode`)
  : fail(`Source must check for test mode`);

sourceContent.includes(`mode === 'default-off'`) || sourceContent.includes(`mode === "default-off"`)
  ? pass(`Source checks for default-off mode`)
  : fail(`Source must check for default-off mode`);

sourceContent.includes(`canClaimProductionSafety: false`)
  ? pass(`Source contains canClaimProductionSafety: false`)
  : fail(`Source must contain canClaimProductionSafety: false`);

// ── 7. Source imports only from adapterAwarenessModel ────────────────────────

const sourceFromClauses = sourceContent.match(/from\s+['"][^'"]+['"]/g) || [];
const nonModelFromClauses = sourceFromClauses.filter(f => !f.includes('adapterAwarenessModel'));
nonModelFromClauses.length === 0
  ? pass(`Source imports only from adapterAwarenessModel.js`)
  : fail(`Source must import only from adapterAwarenessModel.js`, `found non-model imports: ${nonModelFromClauses.join('; ')}`);

const REQUIRED_MODEL_IMPORTS = [
  'normalizeAdapterAwarenessInput',
  'deriveAdapterAwarenessState',
  'createAdapterCompatibilityWarning',
  'summarizeAdapterAwarenessForBackupHealth',
];

for (const fn of REQUIRED_MODEL_IMPORTS) {
  sourceContent.includes(fn)
    ? pass(`Source imports/uses Phase 27C function: ${fn}`)
    : fail(`Source must import/use Phase 27C function: ${fn}`);
}

// ── 8. Production/live/staging/beta mode rejection in source ─────────────────

// Source must only allow 'test' and 'default-off' modes — other mode strings must not appear as allowed values
const FORBIDDEN_ALLOWED_MODE_PATTERNS = [
  /mode\s*===\s*['"]production['"]/,
  /mode\s*===\s*['"]live['"]/,
  /mode\s*===\s*['"]staging['"]/,
  /mode\s*===\s*['"]beta['"]/,
];

for (const pattern of FORBIDDEN_ALLOWED_MODE_PATTERNS) {
  !pattern.test(sourceContent)
    ? pass(`Source does not allow mode: ${pattern}`)
    : fail(`Source must not allow forbidden mode`, `found: ${pattern}`);
}

// ── 9. No forbidden APIs in source (static check) ────────────────────────────

function getSourceNonCommentLines(content) {
  return content
    .split('\n')
    .filter(line => {
      const t = line.trim();
      return !t.startsWith('*') && !t.startsWith('//');
    })
    .join('\n');
}

const sourceNonComment = getSourceNonCommentLines(sourceContent);

const FORBIDDEN_SOURCE_APIS = [
  { pattern: /\blocalStorage\b/, label: 'localStorage' },
  { pattern: /\bindexedDB\b/, label: 'indexedDB' },
  { pattern: /\bfetch\(/, label: 'fetch(' },
  { pattern: /\bXMLHttpRequest\b/, label: 'XMLHttpRequest' },
  { pattern: /\bsendBeacon\b/, label: 'sendBeacon' },
  { pattern: /\bDate\.now\b/, label: 'Date.now' },
  { pattern: /\btelemetry\b/i, label: 'telemetry' },
  { pattern: /\banalytics\b/i, label: 'analytics' },
  { pattern: /process\.env/, label: 'process.env' },
  { pattern: /import\.meta\.env/, label: 'import.meta.env' },
  { pattern: /\bfs\./, label: 'fs.' },
  { pattern: /require\s*\(/, label: 'require(' },
];

for (const { pattern, label } of FORBIDDEN_SOURCE_APIS) {
  !pattern.test(sourceNonComment)
    ? pass(`Source does not use forbidden API: ${label}`)
    : fail(`Source must not use forbidden API: ${label}`);
}

// ── 10. No backup/export/restore imports in source ───────────────────────────

const backupImportPatterns = [
  /import.*v2BackupRestore/,
  /import.*[Bb]ackupRestore/,
  /import.*export.*restore/i,
];

for (const pattern of backupImportPatterns) {
  !pattern.test(sourceNonComment)
    ? pass(`Source does not import backup/restore modules`)
    : fail(`Source must not import backup/restore modules`);
}

// ── 11. No href/route/navigation/settings/library/dashboard strings in source ─

const FORBIDDEN_SOURCE_STRINGS = [
  { pattern: /\bhref\b/, label: 'href' },
  { pattern: /\bnavigate\b/, label: 'navigate' },
  { pattern: /\brouter\b/, label: 'router' },
  { pattern: /\/settings\//, label: '/settings/ route string' },
  { pattern: /\/library\//, label: '/library/ route string' },
  { pattern: /\/dashboard\//, label: '/dashboard/ route string' },
];

for (const { pattern, label } of FORBIDDEN_SOURCE_STRINGS) {
  !pattern.test(sourceNonComment)
    ? pass(`Source does not contain forbidden string: ${label}`)
    : fail(`Source must not contain forbidden string: ${label}`);
}

// ── 12. No production module imports integration prototype ────────────────────

const INTEGRATION_IMPORT_PATTERN = /adapterAwarenessIntegrationPrototype/;

function scanDirForPrototypeImport(dir) {
  const violations = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        violations.push(...scanDirForPrototypeImport(full));
      } else if (
        entry.isFile() &&
        /\.(js|ts|jsx|tsx)$/.test(entry.name) &&
        !full.includes('adapterAwarenessIntegrationPrototype')
      ) {
        const content = readFile(path.relative(ROOT, full));
        if (content && INTEGRATION_IMPORT_PATTERN.test(content)) {
          violations.push(path.relative(ROOT, full));
        }
      }
    }
  } catch {
    // skip unreadable dirs
  }
  return violations;
}

const srcViolations = scanDirForPrototypeImport(path.join(ROOT, 'src'));
srcViolations.length === 0
  ? pass(`No production src module imports adapterAwarenessIntegrationPrototype`)
  : fail(`Production src modules must not import adapterAwarenessIntegrationPrototype`, srcViolations.join(', '));

// ── 13. Unit tests cover required cases ──────────────────────────────────────

const REQUIRED_TEST_PATTERNS = [
  { pattern: /normalizeAdapterAwarenessSignalInput/, label: 'normalizeAdapterAwarenessSignalInput tested' },
  { pattern: /createAdapterAwarenessSignal/, label: 'createAdapterAwarenessSignal tested' },
  { pattern: /deriveAdapterAwarenessFromSignals/, label: 'deriveAdapterAwarenessFromSignals tested' },
  { pattern: /summarizeAdapterAwarenessIntegration/, label: 'summarizeAdapterAwarenessIntegration tested' },
  { pattern: /adapter_integration_disabled/, label: 'adapter_integration_disabled state tested' },
  { pattern: /canClaimProductionSafety/, label: 'canClaimProductionSafety tested' },
  { pattern: /enabled: false/, label: 'enabled: false tested' },
  { pattern: /mode.*test|test.*mode/, label: 'test mode tested' },
  { pattern: /default-off/, label: 'default-off mode tested' },
  { pattern: /production.*reject|reject.*production/i, label: 'production mode rejected' },
  { pattern: /Vietnamese|messageVi|labelVi|detailVi/, label: 'Vietnamese copy tested' },
  { pattern: /immutabilit|freeze|mutate/, label: 'immutability tested' },
  { pattern: /trimm|empty string/, label: 'trimming/empty string tested' },
  { pattern: /same_adapter_context/, label: 'same_adapter_context state tested' },
  { pattern: /different_adapter_context/, label: 'different_adapter_context state tested' },
  { pattern: /missing_source_adapter/, label: 'missing_source_adapter state tested' },
  { pattern: /missing_target_adapter/, label: 'missing_target_adapter state tested' },
  { pattern: /adapter_status_unavailable/, label: 'adapter_status_unavailable state tested' },
  { pattern: /restore_rehearsal_verified_generated_data/, label: 'restore_rehearsal_verified_generated_data state tested' },
  { pattern: /evidenceLevel|evidence_level|evidence level/i, label: 'evidence level tested' },
  { pattern: /forbidden.*claim|claim.*forbidden|FORBIDDEN_CLAIM|FORBIDDEN_PATTERNS/i, label: 'forbidden claim strings tested' },
  { pattern: /localStorage|indexedDB|fetch|sendBeacon|Date\.now/i, label: 'forbidden API static check in tests' },
  { pattern: /backup.*import|import.*backup/i, label: 'backup import static check in tests' },
  { pattern: /no production module|production.*import.*prototype|prototype.*import/i, label: 'no production module imports prototype tested' },
  { pattern: /generated.*test.*data|test.*data.*boundary/i, label: 'generated/test data boundary tested' },
];

for (const { pattern, label } of REQUIRED_TEST_PATTERNS) {
  pattern.test(testContent)
    ? pass(`Unit tests cover: ${label}`)
    : fail(`Unit tests must cover: ${label}`);
}

// ── 14. All Phase 27C state IDs referenced in source ─────────────────────────

const PHASE27C_STATE_IDS = [
  'adapter_status_unavailable',
  'restore_rehearsal_verified_generated_data',
  'missing_source_adapter',
  'missing_target_adapter',
  'different_adapter_context',
  'same_adapter_context',
  'unknown_adapter_state',
];

for (const stateId of PHASE27C_STATE_IDS) {
  sourceContent.includes(stateId) || testContent.includes(stateId)
    ? pass(`Phase 27C state ID referenced: ${stateId}`)
    : fail(`Phase 27C state ID must be referenced: ${stateId}`);
}

// ── 15. Required next-phase framing in docs ───────────────────────────────────

const NEXT_PHASE_FRAMING = [
  'Next recommended phase: Phase 27F — Adapter-Awareness Integration Evidence Review and Closure/Re-Decision',
  'Phase 27F is a separate evidence/re-decision gate and is not automatically approved.',
  'Phase 27E does not approve production integration.',
  'Phase 27E does not approve runtime backup/export/restore changes.',
  'Phase 27E does not approve backup file format changes.',
  'Phase 27E does not approve restore overwrite behavior changes.',
  'Phase 27E does not approve storage migration.',
  'Phase 27E does not approve production adapter-aware backup/export/restore.',
  'Phase 27E does not approve BETA_READY.',
];

for (const stmt of NEXT_PHASE_FRAMING) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase framing present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase framing missing', `"${stmt}"`);
}

// ── 16. Required guardrail statements in docs ─────────────────────────────────

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
  'Full historical scripts/validate-*.js chain is not used as a Phase 27E merge-blocking requirement.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_GUARDRAIL_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Guardrail statement present: "${stmt.slice(0, 70)}"`)
    : fail('Guardrail statement missing', `"${stmt}"`);
}

// ── 17. Docs must not claim forbidden terms ───────────────────────────────────

const FORBIDDEN_CLAIM_PHRASES = [
  'BETA_READY is approved',
  'production adapter-aware backup approved',
  'backup file format change approved',
  'restore overwrite behavior change approved',
  'storage migration approved',
  'guaranteed data-loss prevention achieved',
  'broad backup reliability achieved',
  'local-first hybrid readiness achieved',
  'runtime adapter-awareness implemented in production',
  'Phase 27E implementation is production-ready',
  'production restore safety proven',
  'browser evidence confirms',
  'Phase 27E integration is complete',
  'Phase 27F implementation is production-ready',
  'Phase 27F integration is complete',
];

for (const phrase of FORBIDDEN_CLAIM_PHRASES) {
  !allDocContent.toLowerCase().includes(phrase.toLowerCase())
    ? pass(`Does not claim: "${phrase.slice(0, 60)}"`)
    : fail(`Must not claim: "${phrase}"`);
}

// ── 18. No sync/cloud/account/auth/backend guardrail in docs ─────────────────

allDocContent.includes('No sync/cloud/account/auth/backend.')
  ? pass(`Sync/cloud/auth/backend guardrail present in docs`)
  : fail('Sync/cloud/auth/backend guardrail missing from docs', `"No sync/cloud/account/auth/backend."`);

// ── 19. Telemetry/analytics only in negative guardrail context in docs ─────────

for (const term of ['telemetry', 'analytics']) {
  const inDocs = allDocContent.toLowerCase().includes(term.toLowerCase());
  if (inDocs) {
    const inGuardrailContext =
      allDocContent.toLowerCase().includes(`no ${term}`) ||
      allDocContent.toLowerCase().includes('no telemetry or analytics');
    inGuardrailContext
      ? pass(`Telemetry/analytics term "${term}" appears only in negative guardrail context`)
      : fail(`Telemetry/analytics term "${term}" must only appear in negative guardrail context`);
  } else {
    pass(`No unpredicted telemetry/analytics term "${term}" in docs`);
  }
}

// ── 20. CI workflow checks ────────────────────────────────────────────────────

ciContent.includes('validate-phase27e-thin-read-only-adapter-awareness-integration-prototype')
  ? pass('CI registers Phase 27E validator')
  : fail('CI registers Phase 27E validator', 'e2e-smoke.yml does not reference validate-phase27e');

const hasCheckoutFetchDepth =
  ciContent.includes('fetch-depth: 0') || ciContent.includes("fetch-depth: '0'");
hasCheckoutFetchDepth
  ? pass('CI checkout uses fetch-depth: 0')
  : fail('CI checkout must use fetch-depth: 0');

// Confirm no shell git fetch for origin/main was added
const hasForbiddenFetchStep =
  ciContent.includes('git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
!hasForbiddenFetchStep
  ? pass('CI has no forbidden shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune')
  : fail('CI must not have shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');

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
  'validate-phase26d-limited',
  'validate-phase26d-hf1',
  'validate-phase26e',
  'validate-phase27a',
  'validate-phase27b',
  'validate-phase27c',
  'validate-phase27d',
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
  ? pass('CI does not run Phase 24D through Phase 27D validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js" in CI`)
  : pass('CI does not run full validate-*.js glob loop');

// ── 21. Validator does not execute git fetch ──────────────────────────────────

const validatorNonCommentLines = getSourceNonCommentLines(validatorContent);

// Check for execSync calls that invoke 'git fetch' — string constants containing
// the phrase for CI content-checking purposes are not flagged.
const hasExecSyncGitFetch = /execSync\s*\(\s*['"`]git\s+fetch/.test(validatorNonCommentLines);
hasExecSyncGitFetch
  ? fail('Validator must not execute internal git fetch', 'found execSync git fetch call in validator')
  : pass('Validator does not execute internal git fetch');

// ── 22. Validator verifies origin/main via git rev-parse ─────────────────────

validatorContent.includes('git rev-parse --verify origin/main')
  ? pass('Validator verifies origin/main via git rev-parse --verify origin/main')
  : fail('Validator must verify origin/main via git rev-parse --verify origin/main');

// ── 23. Exact changed-file check via git (post-merge-main safe) ───────────────

const ALLOWED_CHANGED_FILES = new Set([
  `src/state/adapterAwarenessIntegrationPrototype.js`,
  `tests/unit/adapterAwarenessIntegrationPrototype.test.js`,
  `docs/testing/phase27e-thin-read-only-adapter-awareness-integration-prototype.md`,
  `docs/release/phase27e-thin-read-only-adapter-awareness-integration-prototype-summary.md`,
  `scripts/validate-phase27e-thin-read-only-adapter-awareness-integration-prototype.js`,
  `.github/workflows/e2e-smoke.yml`,
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

const FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES = [
  `docs/testing/phase27d`,
  `docs/testing/phase27c`,
  `docs/testing/phase27b`,
  `docs/testing/phase27a`,
  `docs/release/phase27d`,
  `docs/release/phase27c`,
  `docs/release/phase27b`,
  `docs/release/phase27a`,
  `docs/planning/phase27d`,
  `docs/planning/phase27e-thin-read-only-integration-prototype-seed`,
  `scripts/validate-phase27d`,
  `scripts/validate-phase27c`,
  `scripts/validate-phase27b`,
  `scripts/validate-phase27a`,
  `docs/testing/phase26e`,
  `docs/release/phase26e`,
  `scripts/validate-phase26e`,
  `docs/testing/phase26d`,
  `docs/release/phase26d`,
  `scripts/validate-phase26d`,
  `docs/testing/phase26c`,
  `docs/release/phase26c`,
  `scripts/validate-phase26c`,
  `docs/testing/phase26b`,
  `docs/release/phase26b`,
  `scripts/validate-phase26b`,
  `docs/testing/phase26a`,
  `docs/release/phase26a`,
  `scripts/validate-phase26a`,
  `docs/testing/phase25n`,
  `docs/release/phase25n`,
  `scripts/validate-phase25n`,
];

let changedFiles = [];
let diffEmpty = false;
let onMain = false;
let originMainAvailable = false;

// Validator does NOT run its own git fetch.
// origin/main is made available by actions/checkout@v4 with fetch-depth: 0.
try {
  execSync('git rev-parse --verify origin/main', {
    cwd: ROOT,
    stdio: ['pipe', 'pipe', 'pipe'],
  });
  originMainAvailable = true;
} catch {
  originMainAvailable = false;
  fail(
    'origin/main available',
    'git rev-parse --verify origin/main failed — ensure actions/checkout@v4 uses fetch-depth: 0'
  );
}

if (originMainAvailable) {
  pass('origin/main is available (provided by workflow checkout step with fetch-depth: 0)');

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
        `branch "${currentBranch}" has empty diff — no Phase 27E changes committed`
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
        FORBIDDEN_PRIOR_PHASE_FILE_PREFIXES.some(prefix => f.startsWith(prefix))
      );
      priorPhaseMatches.length === 0
        ? pass('No prior phase files in diff')
        : fail('Prior phase files must not be changed', priorPhaseMatches.join(', '));

      const generatedArtifacts = changedFiles.filter(
        f =>
          f.startsWith(`node_modules/`) ||
          f.startsWith(`dist/`) ||
          f.startsWith(`coverage/`) ||
          f.startsWith(`test-results/`) ||
          f.startsWith(`playwright-report/`) ||
          f === 'FETCH_HEAD'
      );
      generatedArtifacts.length === 0
        ? pass('No generated artifacts in changed files')
        : fail('Generated artifacts found in changed files', generatedArtifacts.join(', '));

      const storageDriverFiles = changedFiles.filter(
        f => f.includes('IndexedDB') || f.includes('StorageAdapter') || f.includes(`storage/driver`)
      );
      storageDriverFiles.length === 0
        ? pass('No storage driver files changed')
        : fail('Storage driver files must not be changed', storageDriverFiles.join(', '));

      const backupRestoreFiles = changedFiles.filter(
        f =>
          (f.includes('backup') || f.includes('restore') || f.includes('export')) &&
          !f.includes('phase27e') &&
          !f.includes('adapterAwareness')
      );
      backupRestoreFiles.length === 0
        ? pass('No production backup/export/restore modules changed')
        : fail('Production backup/export/restore modules must not be changed', backupRestoreFiles.join(', '));

      const syncCloudFiles = changedFiles.filter(
        f =>
          (/sync/i.test(f) || /cloud/i.test(f) || /backend/i.test(f)) &&
          !f.includes('phase27e') &&
          !f.includes('e2e-smoke')
      );
      syncCloudFiles.length === 0
        ? pass('No sync/cloud/backend files changed')
        : fail('sync/cloud/backend files must not be changed', syncCloudFiles.join(', '));

      const telemetryFiles = changedFiles.filter(
        f => f.includes('telemetry') || f.includes('analytics') || f.includes('tracking')
      );
      telemetryFiles.length === 0
        ? pass('No telemetry/analytics files changed')
        : fail('Telemetry/analytics files must not be changed', telemetryFiles.join(', '));

      const e2eFiles = changedFiles.filter(f => f.startsWith(`e2e/`));
      e2eFiles.length === 0
        ? pass('No e2e files changed')
        : fail('e2e files must not be changed', e2eFiles.join(', '));

      const adrFiles = changedFiles.filter(f => f.startsWith(`docs/adr/`));
      adrFiles.length === 0
        ? pass('No ADR files changed')
        : fail('ADR files must not be changed', adrFiles.join(', '));

      // Check no new import of adapterAwarenessIntegrationPrototype in non-Phase-27E src files
      const nonPhase27eChangedSrcFiles = changedFiles.filter(
        f =>
          f.startsWith('src/') &&
          !f.includes('adapterAwarenessIntegrationPrototype')
      );
      for (const f of nonPhase27eChangedSrcFiles) {
        const content = readFile(f) || '';
        const hasPrototypeImport = content.includes('adapterAwarenessIntegrationPrototype');
        hasPrototypeImport
          ? fail(`New import of adapterAwarenessIntegrationPrototype found in changed file`, f)
          : pass(`No new import of adapterAwarenessIntegrationPrototype in changed file: ${f}`);
      }
    }
  } catch (e) {
    fail('git diff check', e.message);
  }
}

// ── 24. No package/dependency changes ────────────────────────────────────────

!changedFiles.includes('package.json')
  ? pass('package.json not in changed files')
  : fail('package.json must not be modified by Phase 27E');

!changedFiles.includes('package-lock.json')
  ? pass('package-lock.json not in changed files')
  : fail('package-lock.json must not be modified by Phase 27E');

// ── Final result ──────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('RESULT: ALL CHECKS PASSED');
  process.exit(0);
} else {
  console.log('RESULT: ONE OR MORE CHECKS FAILED');
  process.exit(1);
}
