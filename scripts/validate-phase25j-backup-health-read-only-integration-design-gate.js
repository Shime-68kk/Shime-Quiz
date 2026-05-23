#!/usr/bin/env node
/**
 * Phase 25J Static Validator — Backup Health Read-Only Integration Design Gate
 *
 * PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE
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

const PLANNING_DOC = `docs/planning/phase25j-backup-health-read-only-integration-design-gate.md`;
const RELEASE_DOC = `docs/release/phase25j-backup-health-read-only-integration-design-gate-summary.md`;
const VALIDATOR = `scripts/validate-phase25j-backup-health-read-only-integration-design-gate.js`;
const CI_WORKFLOW = `.github/workflows/e2e-smoke.yml`;

fileExists(PLANNING_DOC)
  ? pass('Planning doc exists')
  : fail('Planning doc exists', `missing ${PLANNING_DOC}`);

fileExists(RELEASE_DOC)
  ? pass('Release summary doc exists')
  : fail('Release summary doc exists', `missing ${RELEASE_DOC}`);

fileExists(VALIDATOR)
  ? pass('Validator script exists')
  : fail('Validator script exists', `missing ${VALIDATOR}`);

// ── 2. CI workflow checks ────────────────────────────────────────────────────

const ciContent = readFile(CI_WORKFLOW) || '';

// Phase 25J validator must be an active run step
ciContent.includes('validate-phase25j')
  ? pass('CI registers Phase 25J validator')
  : fail('CI registers Phase 25J validator', 'e2e-smoke.yml does not reference validate-phase25j');

// CI must have an explicit fetch step before Phase 25J validator
ciContent.includes('Fetch origin main for Phase 25J validator')
  ? pass('CI has explicit fetch step before Phase 25J validator')
  : fail('CI has explicit fetch step before Phase 25J validator', 'missing "Fetch origin main for Phase 25J validator" step');

// Prior-phase validators (Phase 24D-HF1 through Phase 25I) must not be active run: steps.
// A commented-out line (starting with #) is allowed as historical reference.
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
];

// Extract non-comment lines that invoke node scripts/validate-
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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25I validators as active merge-blocking steps')
  : fail(
      'CI must not run prior-phase validators as active merge-blocking steps',
      `found active: ${priorPhaseViolations.join(', ')}`
    );

// Must not have a full validate-*.js glob loop
ciContent.includes(`for f in scripts/validate-*.js`)
  ? fail('CI does not run full validate-*.js glob loop', `found "for f in scripts/validate-*.js" in CI`)
  : pass('CI does not run full validate-*.js glob loop');

// No continue-on-error: true
ciContent.includes('continue-on-error: true')
  ? fail('CI workflow has no continue-on-error: true', 'found continue-on-error: true in e2e-smoke.yml')
  : pass('CI workflow has no continue-on-error: true');

// ── 3. Required doc tokens ───────────────────────────────────────────────────

const PHASE25J_TOKENS = [
  'PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE25J_BACKUP_HEALTH_READ_ONLY_INTEGRATION_DECISION: PASS_TO_PHASE25K_TEST_ONLY_DEFAULT_OFF_INTEGRATION_PROTOTYPE',
];

for (const docPath of [PLANNING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of PHASE25J_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 70)}`)
      : fail(`Doc ${docPath} missing token`, token);
  }
}

// ── 4. Phase 25I baseline tokens referenced ──────────────────────────────────

const PHASE25I_TOKENS = [
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER',
  'PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES',
  'PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE',
];

const allDocContent =
  (readFile(PLANNING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

for (const token of PHASE25I_TOKENS) {
  allDocContent.includes(token)
    ? pass(`Phase 25I baseline token referenced: ${token.slice(0, 60)}...`)
    : fail('Phase 25I baseline token missing', token);
}

// Phase 25I-HF1 post-merge context fix referenced
allDocContent.includes('Phase 25I-HF1')
  ? pass('Phase 25I-HF1 post-merge context fix is referenced')
  : fail('Phase 25I-HF1 post-merge context fix must be referenced in docs');

// ── 5. Required guardrail statements ────────────────────────────────────────

const REQUIRED_STATEMENTS = [
  'Phase 25J is docs/design/static-validator/CI-only.',
  'Phase 25J does not change runtime behavior.',
  'Phase 25J does not implement Backup Health UI.',
  'Phase 25J does not import or wire the Phase 25I signal layer into production UI.',
  'Phase 25J does not modify Phase 25I signal layer behavior.',
  'Phase 25J does not modify Phase 25G prototype behavior.',
  'Phase 25J does not modify Phase 24E scaffold behavior.',
  'Phase 25J does not implement production adapter-aware backup/export/restore.',
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25J merge-blocking requirement.`,
];

for (const stmt of REQUIRED_STATEMENTS) {
  const found = allDocContent.includes(stmt);
  found
    ? pass(`Required statement present: "${stmt.slice(0, 70)}..."`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 6. Required design coverage headings ────────────────────────────────────

const PLANNING_DOC_CONTENT = readFile(PLANNING_DOC) || '';

const REQUIRED_PLANNING_HEADINGS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Purpose',
  '## Design decision',
  '## Read-only integration boundary',
  '## Allowed future integration scope',
  '## Forbidden future integration scope',
  '## Potential integration target candidates',
  '## No-go integration targets',
  '## Phase 25I signal layer import boundary',
  '## UI and display boundary',
  '## Copy and tone boundary',
  '## Accessibility and i18n plan',
  '## Phase 25K framing',
  '## Evidence plan',
  '## Manual/browser smoke plan',
  '## Validator plan',
  '## Rollback/removal plan',
  '## Proposed file ownership for Phase 25K',
  '## Review and tester requirements',
  '## Go/no-go criteria',
  '## What Phase 25J can claim',
  '## What Phase 25J must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  PLANNING_DOC_CONTENT.includes(heading)
    ? pass(`Planning doc has heading: ${heading}`)
    : fail('Planning doc missing heading', heading);
}

const RELEASE_DOC_CONTENT = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_HEADINGS = [
  '## Status token',
  '## Scope',
  '## Design decision',
  '## Read-only integration boundary summary',
  '## Phase 25K framing',
  '## Evidence plan summary',
  '## Validation summary',
  '## Rollback plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  RELEASE_DOC_CONTENT.includes(heading)
    ? pass(`Release doc has heading: ${heading}`)
    : fail('Release doc missing heading', heading);
}

// ── 7. Allowed/forbidden future integration scope ────────────────────────────

const REQUIRED_ALLOWED_SCOPE = [
  'test-only or default-off by default',
  'read-only only',
  'local-only',
  'no writes',
  'no backup/export/restore behavior changes',
  'no backup file format changes',
  'no restore overwrite behavior changes',
  'no telemetry/analytics',
  'no sync/cloud/account/auth/backend',
  'no storage migration',
  'no IndexedDB production storage',
  'no BETA_READY',
];

for (const item of REQUIRED_ALLOWED_SCOPE) {
  allDocContent.includes(item)
    ? pass(`Allowed future scope defined: "${item}"`)
    : fail('Allowed future scope missing', `"${item}"`);
}

const REQUIRED_FORBIDDEN_SCOPE = [
  'no production-visible Backup Health UI by default',
  'no dashboard/settings/library card by default',
  'no navigation route by default',
  'no automatic backup claims',
  'no platform backup preservation claims',
  'no guaranteed data-loss prevention claims',
  'no scanning learner content',
  'no persistent tracking added to calculate health',
  'no production adapter-aware backup/export/restore',
];

for (const item of REQUIRED_FORBIDDEN_SCOPE) {
  allDocContent.includes(item)
    ? pass(`Forbidden future scope defined: "${item}"`)
    : fail('Forbidden future scope missing', `"${item}"`);
}

// ── 8. Phase 25K framing ─────────────────────────────────────────────────────

const REQUIRED_25K_FRAMING = [
  'Phase 25K — Backup Health Test-Only Default-Off Integration Prototype',
  'separate phase',
  'test-only or default-off by default',
  'no production-visible UI by default',
  'may import Phase 25I signal layer only if import gate passes',
  'must not change backup/export/restore behavior',
  'must not add telemetry/analytics',
  'must include unit tests, validator, strict reviewer, and tester if browser/user-facing behavior is claimed',
];

for (const item of REQUIRED_25K_FRAMING) {
  allDocContent.includes(item)
    ? pass(`Phase 25K framing present: "${item.slice(0, 70)}"`)
    : fail('Phase 25K framing missing', `"${item}"`);
}

// ── 9. Evidence plan ─────────────────────────────────────────────────────────

const REQUIRED_EVIDENCE_PLAN = [
  'unit coverage for integration target behavior',
  'unit coverage proving no writes',
  'validator coverage for no production-visible UI by default',
  'validator coverage for no backup/export/restore behavior changes',
  'validator coverage for no telemetry/analytics',
  'manual/browser smoke only if browser/user-facing behavior is claimed',
  'generated/test data only',
  'no real learner data',
  'rollback/removal check',
  'no-new-claim check',
  'accessibility/i18n copy check if any copy is displayed',
];

for (const item of REQUIRED_EVIDENCE_PLAN) {
  allDocContent.includes(item)
    ? pass(`Evidence plan item present: "${item.slice(0, 70)}"`)
    : fail('Evidence plan item missing', `"${item}"`);
}

// ── 10. No-go / must-not-claim list ──────────────────────────────────────────

const REQUIRED_NO_GO = [
  'runtime Backup Health UI implementation',
  'production-visible Backup Health UI',
  'production adapter-aware backup/export/restore',
  'backup file format changes',
  'restore overwrite behavior changes',
  'IndexedDB production storage',
  'storage migration',
  'sync/cloud/account/auth/backend',
  'telemetry/analytics',
  'BETA_READY',
  'guaranteed data-loss prevention',
  'platform backup preservation claims',
  'automatic backup claims',
  'persistent backup health tracking writes',
];

for (const item of REQUIRED_NO_GO) {
  allDocContent.includes(item)
    ? pass(`No-go/must-not-claim item present: "${item.slice(0, 70)}"`)
    : fail('No-go/must-not-claim item missing', `"${item}"`);
}

// ── 11. Rollback plan ────────────────────────────────────────────────────────

const REQUIRED_ROLLBACK = [
  `Remove docs/planning/phase25j-backup-health-read-only-integration-design-gate.md.`,
  `Remove docs/release/phase25j-backup-health-read-only-integration-design-gate-summary.md.`,
  `Remove scripts/validate-phase25j-backup-health-read-only-integration-design-gate.js.`,
  'Remove Phase 25J CI registration.',
  'No learner data migration or cleanup is required because Phase 25J changes no runtime behavior.',
];

for (const item of REQUIRED_ROLLBACK) {
  allDocContent.includes(item)
    ? pass(`Rollback plan item present: "${item.slice(0, 70)}"`)
    : fail('Rollback plan item missing', `"${item}"`);
}

// ── 12. Proposed file ownership ──────────────────────────────────────────────

PLANNING_DOC_CONTENT.includes('Proposed file ownership for Phase 25K')
  ? pass('Planning doc includes proposed file ownership section')
  : fail('Planning doc missing proposed file ownership section');

// ── 13. Next recommended phase statement ────────────────────────────────────

const NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 25K — Backup Health Test-Only Default-Off Integration Prototype',
  'Phase 25K is a separate test-only/default-off runtime integration gate and is not automatically approved.',
  'Phase 25J does not approve runtime Backup Health UI.',
  'Phase 25J does not approve production adapter-aware backup/export/restore.',
];

for (const stmt of NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase statement missing', `"${stmt}"`);
}

// ── 14. Docs do not claim forbidden items outside negation context ───────────

// Strip negation/must-not lines before checking for affirmative forbidden claims.
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
      lower.includes('phase 25j does not') ||
      lower.includes('phase 25j must not') ||
      lower.includes('forbidden') ||
      lower.includes('no-go') ||
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

// ── 15. Exact changed-file enforcement via git ───────────────────────────────

const EXACT_ALLOWED_CHANGED_FILES = new Set([
  `.github/workflows/e2e-smoke.yml`,
  PLANNING_DOC,
  RELEASE_DOC,
  VALIDATOR,
]);

// Fetch origin/main before diffing; GitHub Actions may use a shallow checkout.
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
          'diff is empty on non-main context; expected Phase 25J files'
        );
        fail('No forbidden files changed', 'cannot verify — diff is empty on non-main context');
      }
    } else {
      const unexpected = gitChangedFiles.filter(f => !EXACT_ALLOWED_CHANGED_FILES.has(f));

      unexpected.length === 0
        ? pass(`All changed files (${gitChangedFiles.length}) are within the authorized Phase 25J set`)
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
        f.startsWith('src/') ||
        f.startsWith('tests/') ||
        f.startsWith('e2e/') ||
        f.startsWith('docs/adr/')
      );
      forbiddenChanged.length === 0
        ? pass('No forbidden files changed (src/**, tests/**, e2e/**, package.json, sw.js, boot-guard.js, docs/adr/**)')
        : fail('Forbidden files must not be changed', forbiddenChanged.join(', '));

      // Check no historical validators changed
      const historicalValidatorChanged = gitChangedFiles.filter(f =>
        f.startsWith('scripts/validate-') && f !== VALIDATOR
      );
      historicalValidatorChanged.length === 0
        ? pass('No historical validators changed')
        : fail('Historical validators must not be changed', historicalValidatorChanged.join(', '));
    }
  }
}

// ── Final result ─────────────────────────────────────────────────────────────

console.log('');
if (allPass) {
  console.log('ALL CHECKS PASSED — Phase 25J static validation complete.');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — see FAIL lines above.');
  process.exit(1);
}
