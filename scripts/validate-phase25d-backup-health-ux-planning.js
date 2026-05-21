#!/usr/bin/env node
/**
 * Phase 25D static validator - backup health UX planning gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PLANNING_DOC = `docs/planning/phase25d-backup-health-ux-planning.md`;
const RELEASE_DOC = `docs/release/phase25d-backup-health-ux-planning-summary.md`;
const VALIDATOR = `scripts/validate-phase25d-backup-health-ux-planning.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([PLANNING_DOC, RELEASE_DOC, VALIDATOR, WORKFLOW]);
const forbiddenTouchedPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/testing/phase25c-broader-backup-restore-manual-evidence.md`,
  `docs/release/phase25c-broader-backup-restore-manual-evidence-summary.md`,
  `scripts/validate-phase25c-broader-backup-restore-manual-evidence.js`,
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
];

const statusToken = `PHASE25D_BACKUP_HEALTH_UX_PLANNING_STATUS: COMPLETED_UX_PLANNING_GATE`;
const decisionToken = `PHASE25D_BACKUP_HEALTH_UX_DECISION: PASS_TO_PHASE25E_COPY_AND_STATE_MODEL_BEFORE_RUNTIME`;
const phase25cToken = `PHASE25C_BROADER_BACKUP_RESTORE_MANUAL_EVIDENCE_STATUS: COMPLETED_BROADER_MANUAL_EVIDENCE`;

const planningHeadings = [
  `# Phase 25D - Backup Health UX Planning`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## User problem`,
  `## UX principles`,
  `## Manual backup mental model`,
  `## Backup health state model`,
  `## Copy boundaries`,
  `## Entry points`,
  `## Empty state / reminder direction`,
  `## Failure and uncertainty handling`,
  `## Evidence requirements before runtime`,
  `## Runtime gating requirements`,
  `## Phase 25E outline`,
  `## Rollback plan`,
  `## What Phase 25D can claim`,
  `## What Phase 25D must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const releaseHeadings = [
  `# Phase 25D - Backup Health UX Planning Summary`,
  `## Status token`,
  `## Scope`,
  `## UX planning summary`,
  `## State model summary`,
  `## Phase 25E outline`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const requiredStatements = [
  `Phase 25D is docs/planning/static-validator/CI-only.`,
  `Phase 25D does not change runtime behavior.`,
  `Phase 25D does not implement backup health UI.`,
  `Phase 25D does not modify Phase 24E scaffold behavior.`,
  `Phase 25D does not implement production adapter-aware backup/export/restore.`,
  `Production backup/export/restore behavior remains unchanged by this patch.`,
  `Backup file format remains unchanged.`,
  `Restore overwrite behavior remains unchanged.`,
  `Current localStorage backup compatibility remains unchanged.`,
  `Default storage driver remains unchanged.`,
  `No IndexedDB.`,
  `No storage migration.`,
  `No sync/cloud/account/auth/backend.`,
  `No BETA_READY.`,
  `Historical full-chain validators remain manual/local/scheduled audit guidance.`,
  `Full historical scripts/validate-*.js chain is not used as a Phase 25D merge-blocking requirement.`,
];
const coverage = [
  `Purpose`,
  `User problem`,
  `UX principles`,
  `Non-alarmist tone`,
  `Manual backup mental model`,
  `Backup health state model`,
  `Copy boundaries`,
  `Entry points`,
  `Empty state / reminder direction`,
  `Failure and uncertainty handling`,
  `Evidence requirements before runtime`,
  `Runtime gating requirements`,
  `What can be claimed`,
  `What must not be claimed`,
  `Follow-up action rules`,
];
const states = [
  `Unknown backup status`,
  `No backup recorded in this browser`,
  `Recent manual backup recorded`,
  `Backup may be stale`,
  `Restore recently verified on generated/test data`,
  `Backup status unavailable`,
];
const stateColumns = [
  `User-facing meaning`,
  `Allowed copy`,
  `Forbidden copy`,
  `Evidence required before runtime implementation`,
];
const copyBoundaries = [
  `Allowed copy may remind users to make a manual backup.`,
  `Allowed copy may say backups are user-owned files.`,
  `Allowed copy may say Shime Quiz is local-first and data is stored on this device/browser.`,
  `Allowed copy may say browser/device storage can be cleared by the user, browser, OS, or device reset.`,
  `Forbidden copy must not imply automatic backup.`,
  `Forbidden copy must not imply cloud sync.`,
  `Forbidden copy must not imply account recovery.`,
  `Forbidden copy must not imply platform-level backup preservation.`,
  `Forbidden copy must not imply guaranteed data-loss prevention.`,
  `Forbidden copy must not imply production adapter-aware backup/export/restore.`,
];
const evidenceRequirements = [
  `a separate runtime design gate`,
  `explicit file ownership`,
  `rollback/removal plan`,
  `copy review`,
  `generated/test data evidence`,
  `browser/manual smoke evidence`,
  `no production backup/restore behavior changes unless separately approved`,
  `current-phase validator`,
  `strict reviewer before push/PR`,
  `tester evidence if manual/browser behavior is claimed`,
];
const phase25eOutline = [
  `Phase 25E - Backup Health Copy and State Model Gate`,
  `refine state names and microcopy`,
  `keep scope docs/copy/static-validator unless separately approved`,
  `do not implement runtime UI by default`,
  `do not change backup/export/restore behavior`,
  `require reviewer before push/PR`,
];
const rollbackPlan = [
  `Remove docs/planning/phase25d-backup-health-ux-planning.md.`,
  `Remove docs/release/phase25d-backup-health-ux-planning-summary.md.`,
  `Remove scripts/validate-phase25d-backup-health-ux-planning.js.`,
  `Remove Phase 25D CI registration.`,
  `No learner data migration or cleanup is required because Phase 25D changes no runtime behavior.`,
];
const nextPhase = [
  `Next recommended phase: Phase 25E - Backup Health Copy and State Model Gate`,
  `Phase 25E is a separate copy/state-model gate.`,
  `Phase 25D does not approve runtime backup health UI.`,
  `Phase 25D does not approve production adapter-aware backup/export/restore.`,
];
const negativeContext = [`does not`, `Do not`, `must not`, `Must not`, `not claim`, `No `, `no `, `not `, `without`, `unchanged`, `Forbidden`, `future`, `before runtime`, `separately approved`];

function fail(message) {
  console.error(`Phase 25D validation failed: ${message}`);
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
  for (const file of changedFiles()) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden changed prefix: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden changed file: ${file}`);
    if (/^scripts\/validate-/.test(file) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
  }
}

function assertWorkflow(workflow) {
  requireIncludes(workflow, `node scripts/validate-phase25d-backup-health-ux-planning.js`, `workflow`);
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const escaped = validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${escaped}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25D merge blocker`);
  }
}

function assertNoForbiddenPositiveClaims(text, label) {
  const terms = [
    `runtime backup health UI is implemented`,
    `production adapter-aware backup/export/restore`,
    `broad backup reliability`,
    `guaranteed data-loss prevention`,
    `automatic backup`,
    `cloud sync`,
    `account recovery`,
    `platform-level backup preservation`,
    `platform backup preservation`,
    `BETA_READY`,
  ];
  for (const term of terms) {
    for (const line of text.split(/\r?\n/).filter(candidate => candidate.includes(term))) {
      if (!negativeContext.some(marker => line.includes(marker))) fail(`${label} has forbidden positive claim: ${line}`);
    }
  }
}

function assertStateModel(text, label) {
  requireAll(text, stateColumns, `${label} state model columns`);
  for (const state of states) {
    const row = text.split(/\r?\n/).find(line => line.includes(`| ${state} |`));
    if (!row) fail(`${label} missing state row: ${state}`);
    const columnCount = row.split(`|`).length - 2;
    if (columnCount !== 5) fail(`${label} state row must have 5 columns: ${row}`);
    for (const required of [`Separate runtime design gate`, `generated/test data evidence`, `browser/manual smoke evidence`]) {
      if (!row.includes(required)) fail(`${label} state row missing evidence requirement "${required}": ${state}`);
    }
  }
}

const planning = read(PLANNING_DOC);
const release = read(RELEASE_DOC);
const validator = read(VALIDATOR);
const workflow = read(WORKFLOW);

requireAll(planning, planningHeadings, `planning doc`);
requireAll(release, releaseHeadings, `release summary`);

for (const text of [planning, release]) {
  const label = text === planning ? `planning doc` : `release summary`;
  requireAll(text, [statusToken, decisionToken, phase25cToken], label);
  requireAll(text, requiredStatements, `${label} required statement`);
  requireAll(text, copyBoundaries, `${label} copy boundary`);
  requireAll(text, evidenceRequirements, `${label} evidence-before-runtime requirement`);
  requireAll(text, phase25eOutline, `${label} Phase 25E outline`);
  requireAll(text, rollbackPlan, `${label} rollback plan`);
  requireAll(text, nextPhase, `${label} next phase`);
  assertStateModel(text, label);
  assertNoForbiddenPositiveClaims(text, label);
}

requireAll(planning, coverage, `planning doc UX planning coverage`);
requireIncludes(planning, `What Phase 25D can claim`, `planning doc what can be claimed`);
requireIncludes(planning, `What Phase 25D must not claim`, `planning doc what must not be claimed`);
requireIncludes(planning, `Future entry points`, `planning doc entry points`);
requireIncludes(planning, `Unknown, stale, and unavailable states should be treated as uncertainty`, `planning doc uncertainty handling`);

for (const placeholder of [`TODO`, `TBD`, `To be recorded`]) {
  if (planning.includes(placeholder) || release.includes(placeholder)) fail(`Placeholder remains: ${placeholder}`);
}

assertWorkflow(workflow);
assertChangedFiles();

if (!validator.includes(`Phase 25D static validator`)) fail(`Validator identity text missing`);

console.log(`Phase 25D backup health UX planning validation passed.`);
