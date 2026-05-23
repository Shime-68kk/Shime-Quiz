#!/usr/bin/env node
/**
 * Phase 25L Static Validator — Backup Health Production UI Design Gate
 *
 * PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE
 * PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES
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

const PLANNING_DOC = `docs/planning/phase25l-backup-health-production-ui-design-gate.md`;
const RELEASE_DOC = `docs/release/phase25l-backup-health-production-ui-design-gate-summary.md`;
const VALIDATOR = `scripts/validate-phase25l-backup-health-production-ui-design-gate.js`;
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

ciContent.includes('validate-phase25l')
  ? pass('CI registers Phase 25L validator')
  : fail('CI registers Phase 25L validator', 'e2e-smoke.yml does not reference validate-phase25l');

ciContent.includes('Fetch origin main for Phase 25L validator')
  ? pass('CI has explicit fetch step before Phase 25L validator')
  : fail('CI has explicit fetch step before Phase 25L validator', 'missing "Fetch origin main for Phase 25L validator" step');

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
  ? pass('CI does not run Phase 24D-HF1 through Phase 25K validators as active merge-blocking steps')
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

// ── 3. Required Phase 25L doc tokens ────────────────────────────────────────

const PHASE25L_TOKENS = [
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DESIGN_STATUS: COMPLETED_DESIGN_GATE',
  'PHASE25L_BACKUP_HEALTH_PRODUCTION_UI_DECISION: PASS_TO_PHASE25M_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_WITH_STRICT_GATES',
];

for (const docPath of [PLANNING_DOC, RELEASE_DOC]) {
  const docContent = readFile(docPath) || '';
  for (const token of PHASE25L_TOKENS) {
    docContent.includes(token)
      ? pass(`Doc ${docPath} contains token: ${token.slice(0, 70)}`)
      : fail(`Doc ${docPath} missing token`, token);
  }
}

// ── 4. Phase 25K and Phase 25I baseline tokens referenced ───────────────────

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
  (readFile(PLANNING_DOC) || '') + '\n' + (readFile(RELEASE_DOC) || '');

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

// ── 5. Required guardrail statements ────────────────────────────────────────

const REQUIRED_STATEMENTS = [
  'Phase 25L is docs/design/static-validator/CI-only.',
  'Phase 25L does not change runtime behavior.',
  'Phase 25L does not implement Backup Health UI.',
  'Phase 25L does not import or wire the Phase 25K prototype into production UI.',
  'Phase 25L does not import or wire the Phase 25I signal layer into production UI.',
  'Phase 25L does not modify Phase 25K prototype behavior.',
  'Phase 25L does not modify Phase 25I signal layer behavior.',
  'Phase 25L does not modify Phase 25G prototype behavior.',
  'Phase 25L does not modify Phase 24E scaffold behavior.',
  'Phase 25L does not implement production adapter-aware backup/export/restore.',
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25L merge-blocking requirement.`,
  'No browser/manual evidence claimed because no production-visible UI or browser/user-facing behavior is exposed.',
  'Manual/browser evidence required before any user-facing runtime UI or browser behavior claim.',
];

for (const stmt of REQUIRED_STATEMENTS) {
  const found = allDocContent.includes(stmt);
  found
    ? pass(`Required statement present: "${stmt.slice(0, 70)}"`)
    : fail('Required statement missing', `"${stmt}"`);
}

// ── 6. Required planning doc headings ───────────────────────────────────────

const planningDocContent = readFile(PLANNING_DOC) || '';

const REQUIRED_PLANNING_HEADINGS = [
  '## Status token',
  '## Scope',
  '## Inputs',
  '## Purpose',
  '## Design decision',
  '## Production UI boundary',
  '## Allowed future Phase 25M UI prototype scope',
  '## Forbidden future UI scope',
  '## Potential UI surfaces',
  '## No-go UI surfaces',
  '## Copy and tone requirements',
  '## Vietnamese-first copy requirements',
  '## Accessibility requirements',
  '## Phase 25K prototype import boundary',
  '## Phase 25I signal layer import boundary',
  '## No-write and no-telemetry boundary',
  '## Backup/export/restore boundary',
  '## Phase 25M framing',
  '## Evidence plan',
  '## Manual/browser smoke plan',
  '## Validator plan',
  '## Rollback/removal plan',
  '## Proposed file ownership for Phase 25M',
  '## Review and tester requirements',
  '## Go/no-go criteria',
  '## What Phase 25L can claim',
  '## What Phase 25L must not claim',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_PLANNING_HEADINGS) {
  planningDocContent.includes(heading)
    ? pass(`Planning doc has heading: ${heading}`)
    : fail('Planning doc missing heading', heading);
}

// ── 7. Required release doc headings ────────────────────────────────────────

const releaseDocContent = readFile(RELEASE_DOC) || '';

const REQUIRED_RELEASE_HEADINGS = [
  '## Status token',
  '## Scope',
  '## Design decision',
  '## Production UI boundary summary',
  '## Phase 25M framing',
  '## Evidence plan summary',
  '## Validation summary',
  '## Rollback plan',
  '## Guardrails',
  '## Next recommended phase',
];

for (const heading of REQUIRED_RELEASE_HEADINGS) {
  releaseDocContent.includes(heading)
    ? pass(`Release doc has heading: ${heading}`)
    : fail('Release doc missing heading', heading);
}

// ── 8. Allowed/forbidden future UI scope present ─────────────────────────────

const ALLOWED_SCOPE_REQUIRED = [
  'default-off by default',
  'limited-surface prototype only',
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
  'must use calm Vietnamese-first copy',
  'must avoid alarmist language',
  'must show backup health as a reminder/status hint, not a guarantee',
];

for (const item of ALLOWED_SCOPE_REQUIRED) {
  allDocContent.includes(item)
    ? pass(`Allowed scope item present: "${item.slice(0, 60)}"`)
    : fail('Allowed scope item missing', `"${item}"`);
}

const FORBIDDEN_SCOPE_REQUIRED = [
  'no production-visible UI by default without explicit gate',
  'no broad dashboard/settings/library rollout',
  'no navigation route by default',
  'no automatic backup claims',
  'no platform backup preservation claims',
  'no guaranteed data-loss prevention claims',
  'no scanning learner content',
  'no persistent tracking added to calculate health',
  'no production adapter-aware backup/export/restore',
  'no account/cloud recovery copy',
];

for (const item of FORBIDDEN_SCOPE_REQUIRED) {
  allDocContent.includes(item)
    ? pass(`Forbidden scope item present: "${item.slice(0, 60)}"`)
    : fail('Forbidden scope item missing', `"${item}"`);
}

// ── 9. Phase 25M framing present ─────────────────────────────────────────────

const PHASE25M_FRAMING_REQUIRED = [
  'Phase 25M — Backup Health Limited Default-Off UI Prototype',
  'separate phase',
  'default-off by default',
  'limited UI surface only',
  'may import Phase 25K prototype only if import gate passes',
  'must not change backup/export/restore behavior',
  'must not add telemetry/analytics',
  'must include unit tests, validator, strict reviewer, and tester if browser/user-facing behavior is claimed',
];

for (const item of PHASE25M_FRAMING_REQUIRED) {
  allDocContent.includes(item)
    ? pass(`Phase 25M framing present: "${item.slice(0, 60)}"`)
    : fail('Phase 25M framing missing', `"${item}"`);
}

// ── 10. Evidence plan present ────────────────────────────────────────────────

const EVIDENCE_PLAN_REQUIRED = [
  'unit coverage for UI state mapping',
  'unit coverage proving no writes',
  'validator coverage for default-off UI',
  'validator coverage for no broad production rollout',
  'validator coverage for no backup/export/restore behavior changes',
  'validator coverage for no telemetry/analytics',
  'manual/browser smoke required if browser/user-facing behavior is claimed',
  'generated/test data only',
  'no real learner data',
  'rollback/removal check',
  'no-new-claim check',
  'accessibility check',
  'Vietnamese-first copy review',
];

for (const item of EVIDENCE_PLAN_REQUIRED) {
  allDocContent.includes(item)
    ? pass(`Evidence plan item present: "${item.slice(0, 60)}"`)
    : fail('Evidence plan item missing', `"${item}"`);
}

// ── 11. No-go list and rollback plan present ─────────────────────────────────

const NOGO_LIST_REQUIRED = [
  'runtime Backup Health UI implementation',
  'production-visible Backup Health UI',
  'broad dashboard/settings/library rollout',
  'production adapter-aware backup/export/restore',
  'backup file format changes',
  'restore overwrite behavior changes',
  'IndexedDB production storage',
  'storage migration',
  'BETA_READY',
  'guaranteed data-loss prevention',
  'platform backup preservation claims',
  'automatic backup claims',
  'persistent backup health tracking writes',
];

for (const item of NOGO_LIST_REQUIRED) {
  allDocContent.includes(item)
    ? pass(`No-go list item present: "${item.slice(0, 60)}"`)
    : fail('No-go list item missing', `"${item}"`);
}

allDocContent.includes('Remove docs/planning/phase25l-backup-health-production-ui-design-gate.md.')
  ? pass('Rollback plan includes planning doc removal')
  : fail('Rollback plan must include planning doc removal');

allDocContent.includes('Remove docs/release/phase25l-backup-health-production-ui-design-gate-summary.md.')
  ? pass('Rollback plan includes release doc removal')
  : fail('Rollback plan must include release doc removal');

allDocContent.includes('Remove scripts/validate-phase25l-backup-health-production-ui-design-gate.js.')
  ? pass('Rollback plan includes validator removal')
  : fail('Rollback plan must include validator removal');

allDocContent.includes('Remove Phase 25L CI registration.')
  ? pass('Rollback plan includes CI registration removal')
  : fail('Rollback plan must include CI registration removal');

allDocContent.includes('No learner data migration or cleanup is required because Phase 25L changes no runtime behavior.')
  ? pass('Rollback plan states no learner data migration required')
  : fail('Rollback plan must state no learner data migration required');

// ── 12. Next-phase statements ────────────────────────────────────────────────

const NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 25M — Backup Health Limited Default-Off UI Prototype',
  'Phase 25M is a separate limited/default-off runtime UI prototype gate and is not automatically approved.',
  'Phase 25L does not approve production-visible Backup Health UI by default.',
  'Phase 25L does not approve production adapter-aware backup/export/restore.',
];

for (const stmt of NEXT_PHASE_STATEMENTS) {
  allDocContent.includes(stmt)
    ? pass(`Next-phase statement present: "${stmt.slice(0, 70)}"`)
    : fail('Next-phase statement missing', `"${stmt}"`);
}

// ── 13. Proposed file ownership present ──────────────────────────────────────

allDocContent.includes('Proposed file ownership for Phase 25M') ||
planningDocContent.includes('Proposed file ownership for Phase 25M')
  ? pass('Proposed file ownership for Phase 25M is present')
  : fail('Proposed file ownership for Phase 25M must be present in planning doc');

// ── 14. Forbidden affirmative doc claims ─────────────────────────────────────

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
      lower.includes('phase 25l does not') ||
      lower.includes('phase 25l must not') ||
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
if (docLinesStripped.includes('production adapter-aware backup/export/restore is implemented')) {
  forbiddenDocFound.push('affirmative production adapter-aware backup claim');
}
forbiddenDocFound.length === 0
  ? pass('Docs do not contain affirmative forbidden claims (BETA_READY, production UI, guaranteed data-loss prevention, adapter-aware backup)')
  : fail('Docs must not contain affirmative forbidden claims', forbiddenDocFound.join(', '));

// ── 15. Exact changed-file enforcement via git ───────────────────────────────

const EXACT_ALLOWED_CHANGED_FILES = new Set([
  `.github/workflows/e2e-smoke.yml`,
  PLANNING_DOC,
  RELEASE_DOC,
  VALIDATOR,
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
          'diff is empty on non-main context; expected Phase 25L files'
        );
        fail('No forbidden files changed', 'cannot verify — diff is empty on non-main context');
      }
    } else {
      const unexpected = gitChangedFiles.filter(f => !EXACT_ALLOWED_CHANGED_FILES.has(f));
      unexpected.length === 0
        ? pass(`All changed files (${gitChangedFiles.length}) are within the authorized Phase 25L set`)
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

      // Prior Phase 25I, 25J, 25K files must not be modified
      const priorPhaseChanged = gitChangedFiles.filter(f =>
        f.includes('phase25i') || f.includes('phase25j') || f.includes('phase25k') ||
        f.includes('backupHealthSignal') ||
        f.includes('backupHealthIntegrationPrototype') ||
        f.includes('backupHealthTestOnlyPrototype')
      );
      priorPhaseChanged.length === 0
        ? pass('Prior Phase 25I, Phase 25J, and Phase 25K files are not modified')
        : fail('Prior Phase 25I, Phase 25J, and Phase 25K files must not be modified', priorPhaseChanged.join(', '));

      // No historical validators changed (allow only current Phase 25L validator)
      const historicalValidatorChanged = gitChangedFiles.filter(f =>
        f.startsWith('scripts/validate-') && f !== VALIDATOR
      );
      historicalValidatorChanged.length === 0
        ? pass('No historical validators changed')
        : fail('Historical validators must not be changed', historicalValidatorChanged.join(', '));

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
  console.log('ALL CHECKS PASSED — Phase 25L static validation complete.');
  process.exit(0);
} else {
  console.log('ONE OR MORE CHECKS FAILED — see FAIL lines above.');
  process.exit(1);
}
