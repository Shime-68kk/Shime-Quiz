#!/usr/bin/env node
/**
 * Phase 25F static validator - backup health runtime design gate.
 * CI registers Phase 25F validator as the current-phase merge gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PLANNING_DOC = `docs/planning/phase25f-backup-health-runtime-design-gate.md`;
const RELEASE_DOC = `docs/release/phase25f-backup-health-runtime-design-gate-summary.md`;
const VALIDATOR = `scripts/validate-phase25f-backup-health-runtime-design-gate.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([PLANNING_DOC, RELEASE_DOC, VALIDATOR, WORKFLOW]);
const forbiddenTouchedPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/planning/phase25e-backup-health-copy-state-model.md`,
  `docs/release/phase25e-backup-health-copy-state-model-summary.md`,
  `scripts/validate-phase25e-backup-health-copy-state-model.js`,
];
const generatedArtifacts = [`node_modules/`, `dist/`, `coverage/`, `test-results/`, `playwright-report/`, `FETCH_HEAD`];
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
];

const statusToken = `PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_GATE_STATUS: COMPLETED_DESIGN_GATE`;
const decisionTokens = [
  `PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_DECISION: PASS_TO_PHASE25G_TEST_ONLY_RUNTIME_PROTOTYPE_WITH_STRICT_GATES`,
  `PHASE25F_BACKUP_HEALTH_RUNTIME_DESIGN_DECISION: HOLD_RUNTIME_UNTIL_MORE_EVIDENCE`,
];
const expectedDecisionToken = decisionTokens[0];
const phase25eTokens = [
  `PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_STATUS: COMPLETED_COPY_STATE_MODEL_GATE`,
  `PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_DECISION: PASS_TO_PHASE25F_RUNTIME_DESIGN_GATE_ONLY_IF_APPROVED`,
];

const planningHeadings = [
  `# Phase 25F — Backup Health Runtime Design Gate`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## Design decision`,
  `## Runtime boundary`,
  `## Allowed future runtime scope`,
  `## Forbidden future runtime scope`,
  `## Proposed file ownership for Phase 25G`,
  `## Future state model`,
  `## Future persistence boundary`,
  `## Backup/export/restore interaction boundary`,
  `## Copy integration boundary`,
  `## Accessibility and i18n considerations`,
  `## Rollback/removal plan`,
  `## Evidence plan`,
  `## Manual/browser smoke plan`,
  `## Validator plan`,
  `## Review and tester requirements`,
  `## Go/no-go criteria`,
  `## What Phase 25F can claim`,
  `## What Phase 25F must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const releaseHeadings = [
  `# Phase 25F — Backup Health Runtime Design Gate Summary`,
  `## Status token`,
  `## Scope`,
  `## Design decision`,
  `## Runtime boundary summary`,
  `## Phase 25G gate summary`,
  `## Evidence plan summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const requiredStatements = [
  `Phase 25F is docs/design/static-validator/CI-only.`,
  `Phase 25F does not change runtime behavior.`,
  `Phase 25F does not implement backup health UI.`,
  `Phase 25F does not modify Phase 24E scaffold behavior.`,
  `Phase 25F does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25F merge-blocking requirement.`,
];
const futureRuntimeScope = [
  `test-only or default-off`,
  `small-scope`,
  `copy-aligned with Phase 25E`,
  `non-telemetry`,
  `local-only`,
  `no sync/cloud/account/auth/backend`,
  `no production adapter-aware backup/export/restore`,
  `no backup file format changes`,
  `no restore overwrite behavior changes`,
  `no data migration`,
  `no IndexedDB production storage`,
  `reviewer-required before push/PR`,
  `tester-required if manual/browser behavior is claimed`,
];
const fileOwnership = [
  `Potential UI/component file ownership`,
  `Potential state/helper file ownership`,
  `Potential unit test file ownership`,
  `Potential validator file ownership`,
  `Potential docs ownership`,
  `Explicit no-go files`,
  `Actual file ownership must be re-confirmed in Phase 25G before edits.`,
];
const states = [
  `Unknown backup status`,
  `No backup recorded in this browser`,
  `Recent manual backup recorded`,
  `Backup may be stale`,
  `Restore recently verified on generated/test data`,
  `Backup status unavailable`,
];
const stateFields = [
  `Potential source signal`,
  `Storage/persistence consideration`,
  `Allowed user-facing copy source`,
  `Risk`,
  `Rollback behavior`,
  `Evidence required before runtime`,
];
const evidencePlan = [
  `unit coverage for state derivation`,
  `validator coverage for copy and guardrails`,
  `manual/browser smoke with generated/test data only`,
  `reload behavior check`,
  `no-new-claim check`,
  `accessibility/i18n copy check`,
  `rollback/removal check`,
  `no real learner data`,
  `no telemetry/analytics`,
];
const noGoClaims = [
  `runtime backup health UI implementation`,
  `production adapter-aware backup/export/restore`,
  `backup file format changes`,
  `restore overwrite behavior changes`,
  `IndexedDB production storage`,
  `storage migration`,
  `sync/cloud/account/auth/backend`,
  `telemetry/analytics`,
  `BETA_READY`,
  `guaranteed data-loss prevention`,
  `platform backup preservation claims`,
  `automatic backup claims`,
];
const rollbackPlan = [
  `Remove docs/planning/phase25f-backup-health-runtime-design-gate.md.`,
  `Remove docs/release/phase25f-backup-health-runtime-design-gate-summary.md.`,
  `Remove scripts/validate-phase25f-backup-health-runtime-design-gate.js.`,
  `Remove Phase 25F CI registration.`,
  `No learner data migration or cleanup is required because Phase 25F changes no runtime behavior.`,
];
const nextPhase = [
  `Next recommended phase: Phase 25G — Backup Health Test-Only Runtime Prototype`,
  `Phase 25G is a separate test-only/default-off runtime prototype gate.`,
  `Phase 25F does not approve production runtime backup health UI.`,
  `Phase 25F does not approve production adapter-aware backup/export/restore.`,
];
const runtimeCoverage = [
  `Purpose`,
  `Design decision`,
  `Runtime boundary`,
  `Allowed future runtime scope`,
  `Forbidden future runtime scope`,
  `Future persistence boundary`,
  `Backup/export/restore interaction boundary`,
  `Copy integration boundary`,
  `Accessibility`,
  `Rollback/removal plan`,
  `Evidence plan`,
  `Manual/browser smoke plan`,
  `Validator plan`,
  `Review and tester requirements`,
  `Go/no-go criteria`,
];
const negativeContext = [
  `does not`,
  `Do not`,
  `must not`,
  `Must not`,
  `not claim`,
  `No `,
  `no `,
  `not `,
  `without`,
  `unchanged`,
  `Forbidden`,
  `future`,
  `Future`,
  `before runtime`,
  `separately approved`,
  `test-only`,
  `default-off`,
  `strict gates`,
  `must be`,
  `only be`,
  `must include`,
  `must identify`,
  `no-go`,
  `absence of`,
];

function fail(message) {
  console.error(`Phase 25F validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
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
    .filter(file => !generatedArtifacts.some(artifact => artifact.endsWith(`/`) ? file.startsWith(artifact) : file === artifact))
    .sort();
}

function assertChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden changed prefix: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden changed file: ${file}`);
    if (/^scripts\/validate-/.test(file) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
  }
}

function assertWorkflow(workflow) {
  requireIncludes(workflow, `node scripts/validate-phase25f-backup-health-runtime-design-gate.js`, `workflow`);
  if (workflow.includes(`node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`)) {
    fail(`Workflow must not register Phase 24D-HF1 as a Phase 25F merge blocker`);
  }
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const escaped = validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${escaped}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25F merge blocker`);
  }
}

function assertDecision(text, label) {
  const found = decisionTokens.filter(token => text.includes(token));
  if (found.length !== 1) fail(`${label} must contain exactly one Phase 25F decision token`);
  requireIncludes(text, expectedDecisionToken, `${label} recommended decision`);
}

function assertStateModel(text, label) {
  requireAll(text, stateFields, `${label} state fields`);
  for (const state of states) {
    requireIncludes(text, state, `${label} future state model`);
  }
}

function assertNoForbiddenPositiveClaims(text, label) {
  const terms = [
    `runtime backup health UI is implemented`,
    `runtime backup health UI implementation`,
    `production adapter-aware backup/export/restore`,
    `broad backup reliability`,
    `guaranteed data-loss prevention`,
    `automatic backup`,
    `platform backup preservation`,
    `platform-level backup preservation`,
    `backup file format changes`,
    `restore overwrite behavior changes`,
    `IndexedDB production storage`,
    `storage migration`,
    `sync/cloud/account/auth/backend`,
    `telemetry/analytics`,
    `BETA_READY`,
  ];
  for (const term of terms) {
    for (const line of text.split(/\r?\n/).filter(candidate => candidate.includes(term))) {
      if (!negativeContext.some(marker => line.includes(marker))) fail(`${label} has forbidden positive claim: ${line}`);
    }
  }
}

function assertDoc(text, headings, label) {
  requireAll(text, headings, `${label} headings`);
  requireIncludes(text, statusToken, `${label} status token`);
  assertDecision(text, label);
  requireAll(text, phase25eTokens, `${label} Phase 25E reference`);
  requireAll(text, requiredStatements, `${label} required statements`);
  requireAll(text, futureRuntimeScope, `${label} future runtime scope`);
  requireAll(text, fileOwnership, `${label} file ownership`);
  requireAll(text, evidencePlan, `${label} evidence plan`);
  requireAll(text, noGoClaims, `${label} must-not-claim list`);
  requireAll(text, rollbackPlan, `${label} rollback plan`);
  requireAll(text, nextPhase, `${label} next phase`);
  assertStateModel(text, label);
  assertNoForbiddenPositiveClaims(text, label);
}

function main() {
  const planning = read(PLANNING_DOC);
  const release = read(RELEASE_DOC);
  const validator = read(VALIDATOR);
  const workflow = read(WORKFLOW);

  assertDoc(planning, planningHeadings, `planning doc`);
  assertDoc(release, releaseHeadings, `release summary`);
  requireAll(planning, runtimeCoverage, `planning doc runtime design coverage`);
  requireIncludes(validator, `CI registers Phase 25F validator`, `validator self-description`);
  assertWorkflow(workflow);
  assertChangedFiles();

  console.log(`Phase 25F backup health runtime design gate validation passed.`);
}

main();
