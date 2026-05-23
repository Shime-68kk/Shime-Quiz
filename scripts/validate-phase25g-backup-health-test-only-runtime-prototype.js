#!/usr/bin/env node
/**
 * Phase 25G static validator - backup health test-only runtime prototype.
 * CI registers Phase 25G validator as the current-phase merge gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const TESTING_DOC = `docs/testing/phase25g-backup-health-test-only-runtime-prototype.md`;
const RELEASE_DOC = `docs/release/phase25g-backup-health-test-only-runtime-prototype-summary.md`;
const PROTOTYPE = `src/state/backupHealthTestOnlyPrototype.js`;
const UNIT_TEST = `tests/unit/backupHealthTestOnlyPrototype.test.js`;
const VALIDATOR = `scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([TESTING_DOC, RELEASE_DOC, PROTOTYPE, UNIT_TEST, VALIDATOR, WORKFLOW]);

const forbiddenTouchedPrefixes = [
  `e2e/`,
  `docs/adr/`,
];

const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/planning/phase25f-backup-health-runtime-design-gate.md`,
  `docs/release/phase25f-backup-health-runtime-design-gate-summary.md`,
  `scripts/validate-phase25f-backup-health-runtime-design-gate.js`,
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
];

const statusToken = `PHASE25G_BACKUP_HEALTH_TEST_ONLY_RUNTIME_PROTOTYPE_STATUS: COMPLETED_TEST_ONLY_PROTOTYPE`;
const runtimeScopeToken = `PHASE25G_BACKUP_HEALTH_RUNTIME_SCOPE: TEST_ONLY_NO_PRODUCTION_IMPORTS_NO_UI`;
const phase25fTokens = [
  `PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_GATE_STATUS: COMPLETED_DESIGN_GATE`,
  `PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE25G_TEST_ONLY_RUNTIME_PROTOTYPE_WITH_STRICT_GATES`,
];

const requiredGuardrailStatements = [
  `Phase 25G is a test-only runtime prototype.`,
  `Phase 25G uses Option A only: test-only helper/module with unit tests and no production imports.`,
  `Phase 25G exposes no production Backup Health UI.`,
  `Phase 25G does not change production backup/export/restore behavior.`,
  `Phase 25G does not change backup file format.`,
  `Phase 25G does not change restore overwrite behavior.`,
  `Phase 25G does not implement production adapter-aware backup/export/restore.`,
  `Phase 25G does not add sync/cloud/account/auth/backend.`,
  `Phase 25G does not add telemetry/analytics.`,
  `Phase 25G does not add dependencies.`,
  `Phase 25G does not perform storage migration.`,
  `Phase 25G does not claim BETA_READY.`,
];

const requiredStateIds = [
  `unknown`,
  `no_backup_recorded`,
  `recent_manual_backup`,
  `backup_may_be_stale`,
  `restore_verified_test_data`,
  `status_unavailable`,
];

const requiredRollbackLines = [
  `Remove src/state/backupHealthTestOnlyPrototype.js`,
  `Remove tests/unit/backupHealthTestOnlyPrototype.test.js`,
  `Remove docs/testing/phase25g-backup-health-test-only-runtime-prototype.md`,
  `Remove docs/release/phase25g-backup-health-test-only-runtime-prototype-summary.md`,
  `Remove scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js`,
  `Remove Phase 25G CI registration`,
  `No learner data migration or cleanup is required`,
];

const requiredTestCoverage = [
  `unknown`,
  `no_backup_recorded`,
  `recent_manual_backup`,
  `stale`,
  `restore_verified_test_data`,
  `status_unavailable`,
  `mutation`,
  `Phase 25E`,
];

const testingDocHeadings = [
  `# Phase 25G — Backup Health Test-Only Runtime Prototype`,
  `## Status token`,
  `## Runtime scope token`,
  `## Phase 25F baseline`,
  `## Implementation scope`,
  `## Changed files`,
  `## State model`,
  `## Test-only proof`,
  `## No production import proof`,
  `## Unit test evidence`,
  `## Validator evidence`,
  `## Rollback/removal plan`,
  `## Manual/browser evidence status`,
  `## Known limitations`,
  `## What Phase 25G can claim`,
  `## What Phase 25G must not claim`,
  `## Next recommended phase`,
];

const releaseDocHeadings = [
  `# Phase 25G — Backup Health Test-Only Runtime Prototype: Release Summary`,
  `## Status token`,
  `## Runtime scope token`,
  `## Phase 25F baseline`,
  `## Implementation scope`,
  `## Summary`,
  `## Changed files`,
  `## State model`,
  `## Test-only proof`,
  `## No production import proof`,
  `## Unit test evidence`,
  `## Validator evidence`,
  `## Rollback/removal plan`,
  `## Manual/browser evidence status`,
  `## Known limitations`,
  `## What Phase 25G can claim`,
  `## What Phase 25G must not claim`,
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

const negativeContext = [`must not claim`, `does not`, `not claim`, `not implemented`];

const forbiddenPrototypeImports = [
  `./v2BackupRestore`,
  `./localStorageSync`,
  `./store`,
  `../routes`,
  `../components`,
  `../App`,
  `../storage/`,
  `localStorage`,
  `indexedDB`,
  `window.indexedDB`,
  `navigator.sendBeacon`,
  `fetch(`,
  `telemetry`,
  `analytics`,
];

const requiredPrototypeExports = [
  `export const BACKUP_HEALTH_STATE`,
  `export const BACKUP_HEALTH_STATE_LABELS`,
  `export const DEFAULT_STALE_THRESHOLD_MS`,
  `export function deriveBackupHealthState`,
];

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
    if (/^src\/state\/v2BackupRestore/.test(file)) fail(`Forbidden production backup file changed: ${file}`);
    if (/^src\/state\/adapterAwareBackupRestore/.test(file)) fail(`Forbidden Phase 24E scaffold changed: ${file}`);
    if (/^src\/storage\//.test(file)) fail(`Forbidden storage driver changed: ${file}`);
    if (/\/(routes?|components?|App|dashboard|library|settings|navigation)/.test(file)) {
      fail(`Forbidden UI/navigation/route file changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  requireIncludes(workflow, `node scripts/validate-phase25g-backup-health-test-only-runtime-prototype.js`, `workflow`);
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const escaped = validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${escaped}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25G merge blocker`);
  }
}

function assertDoc(text, headings, label) {
  requireAll(text, headings, `${label} headings`);
  requireIncludes(text, statusToken, `${label} status token`);
  requireIncludes(text, runtimeScopeToken, `${label} runtime scope token`);
  requireAll(text, phase25fTokens, `${label} Phase 25F baseline`);
  requireAll(text, requiredGuardrailStatements, `${label} guardrail statements`);
  requireAll(text, requiredStateIds, `${label} state ids`);
  requireAll(text, requiredRollbackLines, `${label} rollback plan`);
  requireIncludes(text, `No browser/manual evidence claimed`, `${label} manual evidence status`);
  requireIncludes(text, `Manual/browser evidence required before any user-facing runtime UI claim`, `${label} manual evidence gate`);
  requireIncludes(text, `Phase 25H`, `${label} next phase`);
  assertNoForbiddenPositiveClaims(text, label);
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

function assertPrototype(text) {
  requireAll(text, requiredPrototypeExports, `prototype`);
  // Check only non-comment lines for forbidden runtime patterns
  const codeLines = text.split(/\r?\n/).filter(l => {
    const trimmed = l.trimStart();
    return !trimmed.startsWith(`//`) && !trimmed.startsWith(`*`) && !trimmed.startsWith(`/*`);
  }).join(`\n`);
  for (const forbidden of forbiddenPrototypeImports) {
    if (codeLines.includes(forbidden)) fail(`Prototype must not use: ${forbidden}`);
  }
  for (const stateId of requiredStateIds) {
    if (!text.includes(stateId)) fail(`Prototype missing required state id: ${stateId}`);
  }
}

function assertNoProductionImport() {
  const srcFiles = runGit(`git ls-files src/`).split(/\r?\n/).filter(Boolean).filter(f => f !== PROTOTYPE);
  for (const file of srcFiles) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, `utf8`);
    if (content.includes(`backupHealthTestOnlyPrototype`)) {
      fail(`Production file must not import prototype: ${file}`);
    }
  }
}

function assertUnitTest(text) {
  requireIncludes(text, `backupHealthTestOnlyPrototype`, `unit test`);
  requireIncludes(text, `deriveBackupHealthState`, `unit test`);
  requireIncludes(text, `BACKUP_HEALTH_STATE`, `unit test`);
  for (const coverage of requiredTestCoverage) {
    if (!text.includes(coverage)) fail(`Unit test missing coverage: ${coverage}`);
  }
}

function assertNoTelemetryAdded() {
  // Check only source code files for live telemetry/analytics usage (not docs/validators that document restrictions)
  const telemetryPatterns = [/amplitude/i, /mixpanel/i, /\/gtag/, /navigator\.sendBeacon/];
  for (const file of [PROTOTYPE, UNIT_TEST]) {
    if (!fs.existsSync(file)) continue;
    const codeLines = fs.readFileSync(file, `utf8`).split(/\r?\n/).filter(l => {
      const t = l.trimStart();
      return !t.startsWith(`//`) && !t.startsWith(`*`) && !t.startsWith(`/*`);
    }).join(`\n`);
    for (const pat of telemetryPatterns) {
      if (pat.test(codeLines)) fail(`File ${file} must not use live telemetry/analytics: ${pat}`);
    }
  }
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
  const testingDoc = read(TESTING_DOC);
  const releaseDoc = read(RELEASE_DOC);
  const prototype = read(PROTOTYPE);
  const unitTest = read(UNIT_TEST);
  const workflow = read(WORKFLOW);

  if (!fs.existsSync(VALIDATOR)) fail(`Required validator not found: ${VALIDATOR}`);

  assertDoc(testingDoc, testingDocHeadings, `testing doc`);
  assertDoc(releaseDoc, releaseDocHeadings, `release summary`);
  assertPrototype(prototype);
  assertNoProductionImport();
  assertUnitTest(unitTest);
  assertWorkflow(workflow);
  assertChangedFiles();
  assertNoTelemetryAdded();
  assertNoDependencyChanges();
  assertNoSyncCloudFiles();

  if (failures.length > 0) {
    console.error(`Phase 25G validation FAILED:\n${failures.map(f => `  - ${f}`).join(`\n`)}`);
    process.exit(1);
  }

  console.log(`Phase 25G backup health test-only runtime prototype validation passed.`);
}

main();
