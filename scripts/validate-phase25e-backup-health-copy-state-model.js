#!/usr/bin/env node
/**
 * Phase 25E static validator - backup health copy and state model gate.
 * CI registers Phase 25E validator as the current-phase merge gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PLANNING_DOC = `docs/planning/phase25e-backup-health-copy-state-model.md`;
const RELEASE_DOC = `docs/release/phase25e-backup-health-copy-state-model-summary.md`;
const VALIDATOR = `scripts/validate-phase25e-backup-health-copy-state-model.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([PLANNING_DOC, RELEASE_DOC, VALIDATOR, WORKFLOW]);
const forbiddenTouchedPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/planning/phase25d-backup-health-ux-planning.md`,
  `docs/release/phase25d-backup-health-ux-planning-summary.md`,
  `scripts/validate-phase25d-backup-health-ux-planning.js`,
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
];

const statusToken = `PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_STATUS: COMPLETED_COPY_STATE_MODEL_GATE`;
const decisionToken = `PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_DECISION: PASS_TO_PHASE25F_RUNTIME_DESIGN_GATE_ONLY_IF_APPROVED`;
const phase25dStatus = `PHASE25D_BACKUP_HEALTH_UX_PLANNING_STATUS: COMPLETED_UX_PLANNING_GATE`;
const phase25dDecision = `PHASE25D_BACKUP_HEALTH_UX_DECISION: PASS_TO_PHASE25E_COPY_AND_STATE_MODEL_BEFORE_RUNTIME`;

const planningHeadings = [
  `# Phase 25E — Backup Health Copy and State Model Gate`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## Copy principles`,
  `## Future-only backup health state model`,
  `## State microcopy table`,
  `## Safe copy examples`,
  `## Forbidden copy examples`,
  `## Copy tone`,
  `## Evidence required before runtime`,
  `## Phase 25F gate framing`,
  `## Rollback plan`,
  `## What Phase 25E can claim`,
  `## What Phase 25E must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const releaseHeadings = [
  `# Phase 25E — Backup Health Copy and State Model Summary`,
  `## Status token`,
  `## Scope`,
  `## Copy/state model summary`,
  `## Safe copy boundaries`,
  `## Phase 25F gate framing`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];
const requiredStatements = [
  `Phase 25E is docs/copy/static-validator/CI-only.`,
  `Phase 25E does not change runtime behavior.`,
  `Phase 25E does not implement backup health UI.`,
  `Phase 25E does not modify Phase 24E scaffold behavior.`,
  `Phase 25E does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25E merge-blocking requirement.`,
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
  `State name`,
  `User-facing meaning`,
  `Primary microcopy`,
  `Secondary microcopy`,
  `Allowed action label`,
  `Allowed copy`,
  `Forbidden copy`,
  `Evidence required before runtime implementation`,
  `Telemetry/analytics boundary`,
];
const safeCopyTopics = [
  `Manual backup reminder`,
  `Local-first explanation`,
  `Browser storage can be cleared warning`,
  `User-owned backup file explanation`,
  `Restore verification limited to generated/test data`,
  `Backup status unknown`,
  `Backup status unavailable`,
];
const forbiddenCopyTopics = [
  `Automatic backup`,
  `Cloud sync`,
  `Account recovery`,
  `Platform backup preservation`,
  `Guaranteed data-loss prevention`,
  `Production adapter-aware backup/export/restore`,
  `BETA_READY`,
];
const toneRequirements = [
  `Tone must be calm, non-alarmist, Vietnamese-first, local-first, and learner-owned.`,
  `Copy should nudge manual backup without fear.`,
  `Copy should avoid shame, urgency inflation, or guarantees.`,
  `Copy should avoid implying Shime Quiz monitors private data.`,
];
const phase25fGate = [
  `Phase 25F is not automatically approved by Phase 25E.`,
  `Phase 25F must be a separate runtime design gate if opened.`,
  `Phase 25F must not implement runtime backup health UI unless separately approved after design review.`,
  `Phase 25F must include file ownership, rollback/removal plan, copy review, generated/test data evidence plan, manual/browser smoke plan, current-phase validator, strict reviewer, and tester evidence if manual/browser behavior is claimed.`,
];
const rollbackPlan = [
  `Remove docs/planning/phase25e-backup-health-copy-state-model.md.`,
  `Remove docs/release/phase25e-backup-health-copy-state-model-summary.md.`,
  `Remove scripts/validate-phase25e-backup-health-copy-state-model.js.`,
  `Remove Phase 25E CI registration.`,
  `No learner data migration or cleanup is required because Phase 25E changes no runtime behavior.`,
];
const nextPhase = [
  `Next recommended phase: Phase 25F — Backup Health Runtime Design Gate`,
  `Phase 25F is a separate runtime design gate and is not automatically approved.`,
  `Phase 25E does not approve runtime backup health UI.`,
  `Phase 25E does not approve production adapter-aware backup/export/restore.`,
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
  `before runtime`,
  `separately approved`,
  `limited to`,
  `must describe`,
];

function fail(message) {
  console.error(`Phase 25E validation failed: ${message}`);
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
  requireIncludes(workflow, `node scripts/validate-phase25e-backup-health-copy-state-model.js`, `workflow`);
  if (workflow.includes(`node scripts/validate-phase25d-backup-health-ux-planning.js`)) {
    fail(`Workflow must not register Phase 25D as a Phase 25E merge blocker`);
  }
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const escaped = validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${escaped}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25E merge blocker`);
  }
}

function assertStateModel(text, label) {
  requireAll(text, stateFields, `${label} state fields`);
  for (const state of states) {
    const row = text.split(/\r?\n/).find(line => line.includes(`| ${state} |`));
    if (!row) fail(`${label} missing state row: ${state}`);
    const columnCount = row.split(`|`).length - 2;
    if (columnCount !== 9) fail(`${label} state row must have 9 columns: ${row}`);
    requireIncludes(row, `none`, `${label} telemetry boundary for ${state}`);
    for (const required of [`Separate runtime design gate`, `generated/test data evidence`]) {
      if (!row.includes(required)) fail(`${label} state row missing evidence requirement "${required}": ${state}`);
    }
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
    `platform backup preservation`,
    `platform-level backup preservation`,
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
  requireAll(text, [statusToken, decisionToken, phase25dStatus, phase25dDecision], `${label} tokens`);
  requireAll(text, requiredStatements, `${label} required statements`);
  requireAll(text, toneRequirements, `${label} tone requirements`);
  requireAll(text, phase25fGate, `${label} Phase 25F framing`);
  requireAll(text, rollbackPlan, `${label} rollback plan`);
  requireAll(text, nextPhase, `${label} next phase`);
  requireAll(text, safeCopyTopics, `${label} safe copy examples`);
  requireAll(text, forbiddenCopyTopics, `${label} forbidden copy examples`);
  assertNoForbiddenPositiveClaims(text, label);
}

function main() {
  const planning = read(PLANNING_DOC);
  const release = read(RELEASE_DOC);
  const validator = read(VALIDATOR);
  const workflow = read(WORKFLOW);

  assertDoc(planning, planningHeadings, `planning doc`);
  assertDoc(release, releaseHeadings, `release summary`);
  assertStateModel(planning, `planning doc`);

  requireIncludes(validator, `CI registers Phase 25E validator`, `validator self-description`);
  assertWorkflow(workflow);
  assertChangedFiles();

  console.log(`Phase 25E backup health copy/state-model validation passed.`);
}

main();
