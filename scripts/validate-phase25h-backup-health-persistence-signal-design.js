#!/usr/bin/env node
/**
 * Phase 25H static validator - backup health persistence signal design gate.
 * CI registers Phase 25H validator as the current-phase merge gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DESIGN_DOC = `docs/planning/phase25h-backup-health-persistence-signal-design.md`;
const RELEASE_DOC = `docs/release/phase25h-backup-health-persistence-signal-design-summary.md`;
const VALIDATOR = `scripts/validate-phase25h-backup-health-persistence-signal-design.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([DESIGN_DOC, RELEASE_DOC, VALIDATOR, WORKFLOW]);

const forbiddenTouchedPrefixes = [
  `src/`,
  `tests/`,
  `e2e/`,
  `docs/adr/`,
];

const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/testing/phase25g-backup-health-test-only-runtime-prototype.md`,
  `docs/release/phase25g-backup-health-test-only-runtime-prototype-summary.md`,
  `scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js`,
  `src/state/backupHealthTestOnlyPrototype.js`,
  `src/state/v2BackupRestore.js`,
  `src/state/adapterAwareBackupRestoreTestScaffold.js`,
  `src/state/localStorageSync.js`,
  `src/state/store.js`,
];

const generatedArtifacts = [
  `node_modules/`,
  `dist/`,
  `coverage/`,
  `test-results/`,
  `playwright-report/`,
  `FETCH_HEAD`,
];

const historicalValidators = [
  `validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
  `validate-phase24d-hf2-ci-validator-strategy-reset.js`,
  `validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
  `validate-phase24f-regression-evidence-after-adapter-changes.js`,
  `validate-phase24g-manual-smoke-run-pack.js`,
  `validate-phase24g-b-manual-smoke-evidence.js`,
  `validate-phase24h-phase24-closure-phase25-planning-gate.js`,
  `validate-phase25a-backup-restore-direction-decision.js`,
  `validate-phase25b-broader-backup-restore-evidence-run-pack.js`,
  `validate-phase25c-broader-backup-restore-manual-evidence.js`,
  `validate-phase25d-backup-health-ux-planning.js`,
  `validate-phase25e-backup-health-copy-state-model.js`,
  `validate-phase25f-backup-health-runtime-design-gate.js`,
  `validate-phase25g-backup-health-test-only-runtime-prototype.js`,
];

const statusToken = `PHASE25H_BACKUP_HEALTH_PERSISTENCE_SIGNAL_DESIGN_STATUS: COMPLETED_DESIGN_GATE`;
const decisionToken = `PHASE25H_BACKUP_HEALTH_PERSISTENCE_SIGNAL_DECISION: PASS_TO_PHASE25I_THIN_READ_ONLY_SIGNAL_LAYER_WITH_STRICT_GATES`;

const phase25gTokens = [
  `PHASE25G_BACKUP_HEALTH_TEST_ONLY_RUNTIME_PROTOTYPE_STATUS: COMPLETED_TEST_ONLY_PROTOTYPE`,
  `PHASE25G_BACKUP_HEALTH_RUNTIME_SCOPE: TEST_ONLY_NO_PRODUCTION_IMPORTS_NO_UI`,
];

const requiredScopeStatements = [
  `Phase 25H is docs/design/static-validator/CI-only.`,
  `Phase 25H does not change runtime behavior.`,
  `Phase 25H does not implement Backup Health UI.`,
  `Phase 25H does not import or wire the Phase 25G helper into production.`,
  `Phase 25H does not modify Phase 25G runtime prototype behavior.`,
  `Phase 25H does not modify Phase 24E scaffold behavior.`,
  `Phase 25H does not implement production adapter-aware backup/export/restore.`,
  `Production backup/export/restore behavior remains unchanged by this patch.`,
  `Backup file format remains unchanged.`,
  `Restore overwrite behavior remains unchanged.`,
  `Current localStorage backup compatibility remains unchanged.`,
  `Default storage driver remains unchanged.`,
  `No IndexedDB.`,
  `No storage migration.`,
  `No sync/cloud/account/auth/backend.`,
  `No telemetry or analytics.`,
  `No BETA_READY.`,
  `Historical full-chain validators remain manual/local/scheduled audit guidance.`,
  `Full historical scripts/validate-*.js chain is not used as a Phase 25H merge-blocking requirement.`,
];

const requiredAllowedSignals = [
  `read-only signal: last manual export completion timestamp if already available without changing export behavior`,
  `read-only signal: generated/test restore verification timestamp only if already available without changing restore behavior`,
  `read-only signal: unavailable/error state only from local in-memory failure handling`,
];

const requiredForbiddenSignals = [
  `do not infer backup existence from private learner content`,
  `do not scan quiz/library/study data to determine backup health`,
  `do not read external files`,
  `do not inspect OS/platform backups`,
  `do not access cloud/account/backend state`,
  `do not use telemetry/analytics`,
  `do not add persistent tracking just to calculate health`,
  `do not treat browser/device/platform backup as verified`,
];

const requiredWritePersistenceBoundary = [
  `A future Phase 25I must be read-only by default.`,
  `A future Phase 25I must not write new backup health state by default.`,
  `A future Phase 25I must not migrate data.`,
  `A future Phase 25I must not change backup/export/restore writes.`,
  `A future Phase 25I must not change backup file format.`,
  `A future Phase 25I must not change restore overwrite behavior.`,
  `Any later write/persistence behavior requires a separate design gate after Phase 25I.`,
];

const requiredPhase25IFraming = [
  `Phase 25I — Backup Health Thin Read-Only Signal Layer`,
  `separate phase`,
  `read-only by default`,
  `no UI by default unless separately approved`,
  `may import Phase 25G helper only if production-import gate passes`,
  `must not change backup/export/restore behavior`,
  `must not add telemetry/analytics`,
  `must include unit tests, validator, reviewer, and tester if browser behavior is claimed`,
];

const requiredProposedFileOwnership = [
  `Potential read-only signal helper file`,
  `Potential unit test file`,
  `Potential docs file`,
  `Potential validator file`,
  `Explicit no-go files`,
  `Actual file ownership must be re-confirmed in Phase 25I before edits`,
];

const requiredEvidencePlan = [
  `unit coverage for read-only signal extraction`,
  `unit coverage proving no writes`,
  `validator coverage for no production UI wiring`,
  `validator coverage for no backup/export/restore behavior changes`,
  `manual/browser smoke only if browser behavior is claimed`,
  `generated/test data only`,
  `no real learner data`,
  `no telemetry/analytics`,
  `rollback/removal check`,
  `no-new-claim check`,
];

const requiredNoGoList = [
  `does not approve runtime Backup Health UI implementation`,
  `does not approve production adapter-aware backup/export/restore`,
  `does not approve backup file format changes`,
  `does not approve restore overwrite behavior changes`,
  `does not approve IndexedDB production storage`,
  `does not approve storage migration`,
  `does not approve sync/cloud/account/auth/backend`,
  `does not approve telemetry/analytics`,
  `does not claim BETA_READY`,
  `does not claim guaranteed data-loss prevention`,
  `does not approve platform backup preservation claims`,
  `does not approve automatic backup claims`,
  `does not approve persistent backup health tracking writes`,
];

const requiredRollbackLines = [
  `Remove docs/planning/phase25h-backup-health-persistence-signal-design.md`,
  `Remove docs/release/phase25h-backup-health-persistence-signal-design-summary.md`,
  `Remove scripts/validate-phase25h-backup-health-persistence-signal-design.js`,
  `Remove Phase 25H CI registration`,
  `No learner data migration or cleanup is required because Phase 25H changes no runtime behavior`,
];

const requiredNextPhase = [
  `Next recommended phase: Phase 25I — Backup Health Thin Read-Only Signal Layer`,
  `Phase 25I is a separate read-only runtime gate and is not automatically approved.`,
  `Phase 25H does not approve runtime Backup Health UI.`,
  `Phase 25H does not approve production adapter-aware backup/export/restore.`,
];

const designDocHeadings = [
  `# Phase 25H — Backup Health Persistence Signal Design`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## Design decision`,
  `## Read-only signal boundary`,
  `## Allowed future signals`,
  `## Forbidden future signals`,
  `## Write and persistence boundary`,
  `## Phase 25G helper import boundary`,
  `## Backup/export/restore interaction boundary`,
  `## UI boundary`,
  `## Proposed file ownership for Phase 25I`,
  `## Phase 25I framing`,
  `## Evidence plan`,
  `## Manual/browser smoke plan`,
  `## Validator plan`,
  `## Rollback/removal plan`,
  `## Review and tester requirements`,
  `## Go/no-go criteria`,
  `## What Phase 25H can claim`,
  `## What Phase 25H must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const releaseDocHeadings = [
  `# Phase 25H — Backup Health Persistence Signal Design Summary`,
  `## Status token`,
  `## Scope`,
  `## Design decision`,
  `## Read-only signal boundary summary`,
  `## Phase 25I framing`,
  `## Evidence plan summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const mustNotClaimTerms = [
  `runtime backup health UI is implemented`,
  `runtime backup health UI implementation`,
  `production adapter-aware backup/export/restore`,
  `broad backup reliability`,
  `guaranteed data-loss prevention`,
  `automatic backup`,
  `BETA_READY`,
];

const negativeContext = [`must not claim`, `does not`, `not claim`, `not implemented`, `does not approve`, `No `];

let failures = [];

function fail(msg) {
  failures.push(msg);
}

function read(path) {
  if (!fs.existsSync(path)) {
    fail(`Required file not found: ${path}`);
    return ``;
  }
  return fs.readFileSync(path, `utf8`);
}

function runGit(command) {
  try {
    return execSync(command, { encoding: `utf8`, stdio: [`ignore`, `pipe`, `ignore`] }).trim();
  } catch {
    return ``;
  }
}

function requireIncludes(text, needle, label) {
  if (!text.includes(needle)) fail(`${label} missing: ${needle}`);
}

function requireAll(text, needles, label) {
  for (const needle of needles) requireIncludes(text, needle, label);
}

function changedFiles() {
  const output = [
    runGit(`git diff --name-only --diff-filter=ACMRTUXB origin/main...HEAD`),
    runGit(`git diff --name-only --diff-filter=ACMRTUXB`),
    runGit(`git ls-files --others --exclude-standard`),
  ].filter(Boolean).join(`\n`);
  return [...new Set(output.split(/\r?\n/).map(line => line.trim()).filter(Boolean))]
    .filter(file => !generatedArtifacts.some(artifact =>
      artifact.endsWith(`/`) ? file.startsWith(artifact) : file === artifact
    ))
    .sort();
}

function assertChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden changed prefix: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden changed file: ${file}`);
    if (/^scripts\/validate-/.test(file) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
    if (/^src\//.test(file)) fail(`Forbidden src file changed: ${file}`);
    if (/^tests\//.test(file)) fail(`Forbidden tests file changed: ${file}`);
    if (/^e2e\//.test(file)) fail(`Forbidden e2e file changed: ${file}`);
    if (/^docs\/adr\//.test(file)) fail(`Forbidden ADR file changed: ${file}`);
    if (/\/(routes?|components?|App|dashboard|library|settings|navigation)/.test(file)) {
      fail(`Forbidden UI/navigation/route file changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  requireIncludes(workflow, `node scripts/validate-phase25h-backup-health-persistence-signal-design.js`, `workflow`);
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const escaped = validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${escaped}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25H merge blocker`);
  }
}

function assertNoForbiddenPositiveClaims(text, label) {
  for (const term of mustNotClaimTerms) {
    for (const line of text.split(/\r?\n/).filter(l => l.includes(term))) {
      if (!negativeContext.some(marker => line.includes(marker))) {
        fail(`${label} has forbidden positive claim: ${line.trim()}`);
      }
    }
  }
}

function assertDesignDoc(text) {
  requireAll(text, designDocHeadings, `design doc headings`);
  requireIncludes(text, statusToken, `design doc status token`);
  requireIncludes(text, decisionToken, `design doc decision token`);
  requireAll(text, phase25gTokens, `design doc Phase 25G baseline`);
  requireAll(text, requiredScopeStatements, `design doc scope statements`);
  requireAll(text, requiredAllowedSignals, `design doc allowed future signals`);
  requireAll(text, requiredForbiddenSignals, `design doc forbidden future signals`);
  requireAll(text, requiredWritePersistenceBoundary, `design doc write/persistence boundary`);
  requireAll(text, requiredPhase25IFraming, `design doc Phase 25I framing`);
  requireAll(text, requiredProposedFileOwnership, `design doc proposed file ownership`);
  requireAll(text, requiredEvidencePlan, `design doc evidence plan`);
  requireAll(text, requiredNoGoList, `design doc no-go list`);
  requireAll(text, requiredRollbackLines, `design doc rollback plan`);
  requireAll(text, requiredNextPhase, `design doc next phase`);
  requireIncludes(text, `No browser/manual evidence is claimed in Phase 25H`, `design doc manual evidence status`);
  requireIncludes(text, `Manual/browser evidence is required before any user-facing runtime UI claim`, `design doc manual evidence gate`);
  assertNoForbiddenPositiveClaims(text, `design doc`);
}

function assertReleaseDoc(text) {
  requireAll(text, releaseDocHeadings, `release doc headings`);
  requireIncludes(text, statusToken, `release doc status token`);
  requireIncludes(text, decisionToken, `release doc decision token`);
  requireAll(text, phase25gTokens, `release doc Phase 25G baseline`);
  requireAll(text, requiredScopeStatements, `release doc scope statements`);
  requireAll(text, requiredAllowedSignals, `release doc allowed future signals`);
  requireAll(text, requiredForbiddenSignals, `release doc forbidden future signals`);
  requireAll(text, requiredWritePersistenceBoundary, `release doc write/persistence boundary`);
  requireAll(text, requiredPhase25IFraming, `release doc Phase 25I framing`);
  requireAll(text, requiredEvidencePlan, `release doc evidence plan`);
  requireAll(text, requiredNoGoList, `release doc no-go list`);
  requireAll(text, requiredRollbackLines, `release doc rollback plan`);
  requireAll(text, requiredNextPhase, `release doc next phase`);
  requireIncludes(text, `No browser/manual evidence is claimed in Phase 25H`, `release doc manual evidence status`);
  requireIncludes(text, `Manual/browser evidence is required before any user-facing runtime UI claim`, `release doc manual evidence gate`);
  assertNoForbiddenPositiveClaims(text, `release doc`);
}

function assertNoDependencyChanges() {
  const changed = changedFiles();
  if (changed.includes(`package.json`)) fail(`package.json must not be changed`);
  if (changed.includes(`package-lock.json`)) fail(`package-lock.json must not be changed`);
}

function assertNoSyncCloudFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (/sync|cloud|account|auth|backend/.test(file)) {
      fail(`Forbidden sync/cloud/account/auth/backend file changed: ${file}`);
    }
  }
}

function main() {
  const designDoc = read(DESIGN_DOC);
  const releaseDoc = read(RELEASE_DOC);
  const workflow = read(WORKFLOW);

  if (!fs.existsSync(VALIDATOR)) fail(`Required validator not found: ${VALIDATOR}`);

  assertDesignDoc(designDoc);
  assertReleaseDoc(releaseDoc);
  assertWorkflow(workflow);
  assertChangedFiles();
  assertNoDependencyChanges();
  assertNoSyncCloudFiles();

  if (failures.length > 0) {
    console.error(`Phase 25H validation FAILED:\n${failures.map(f => `  - ${f}`).join(`\n`)}`);
    process.exit(1);
  }

  console.log(`Phase 25H backup health persistence signal design validation passed.`);
}

main();
