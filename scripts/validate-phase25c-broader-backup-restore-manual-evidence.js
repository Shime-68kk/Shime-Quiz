#!/usr/bin/env node
/**
 * Phase 25C static validator - broader backup/restore manual evidence.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE_DOC = `docs/testing/phase25c-broader-backup-restore-manual-evidence.md`;
const RELEASE_DOC = `docs/release/phase25c-broader-backup-restore-manual-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase25c-broader-backup-restore-manual-evidence.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([EVIDENCE_DOC, RELEASE_DOC, VALIDATOR, WORKFLOW]);

const forbiddenTouchedPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `docs/testing/phase25b-broader-backup-restore-evidence-run-pack.md`,
  `docs/release/phase25b-broader-backup-restore-evidence-run-pack-summary.md`,
  `scripts/validate-phase25b-broader-backup-restore-evidence-run-pack.js`,
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
];

const statusToken = `PHASE25C_BROADER_BACKUP_RESTORE_MANUAL_EVIDENCE_STATUS: COMPLETED_BROADER_MANUAL_EVIDENCE`;
const phase25bToken = `PHASE25B_BROADER_BACKUP_RESTORE_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`;

const evidenceHeadings = [
  `# Phase 25C - Broader Backup/Restore Manual Evidence`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Environment`,
  `## Data safety setup`,
  `## Generated/disposable test data used`,
  `## Evidence matrix`,
  `## Chromium/Chrome desktop result`,
  `## Mobile-ish viewport result`,
  `## Firefox or alternative browser result`,
  `## Backup/export result`,
  `## Restore/import result`,
  `## Reload-after-restore result`,
  `## No-new-UI/no-new-claim result`,
  `## Failure/anomaly log`,
  `## Overall result`,
  `## Evidence limitations`,
  `## Unavailable environments`,
  `## Rollback plan`,
  `## What Phase 25C can claim`,
  `## What Phase 25C must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const releaseHeadings = [
  `# Phase 25C - Broader Backup/Restore Manual Evidence Summary`,
  `## Status token`,
  `## Scope`,
  `## Evidence summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 25C is manual/browser evidence execution plus docs/static-validator/CI.`,
  `Phase 25C does not change runtime behavior.`,
  `Phase 25C does not modify Phase 24E scaffold behavior.`,
  `Phase 25C does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25C merge-blocking requirement.`,
];

const evidenceFields = [
  `Tester name/handle`,
  `Date/time`,
  `OS`,
  `Browser and version`,
  `Viewport`,
  `Node/npm versions`,
  `Commit SHA`,
  `App URL`,
  `Data safety setup`,
  `Generated/disposable test data used`,
  `Evidence matrix`,
  `Chromium/Chrome desktop result`,
  `Mobile-ish viewport result`,
  `Firefox or alternative browser result`,
  `Backup/export result`,
  `Restore/import result`,
  `Reload-after-restore result`,
  `No-new-UI/no-new-claim result`,
  `Failure/anomaly log`,
  `Overall result`,
  `Evidence limitations`,
  `Unavailable environments`,
];

const matrixHeaders = [
  `Environment`,
  `Browser/viewport`,
  `Generated test data`,
  `Backup/export steps`,
  `Restore/import steps`,
  `Reload-after-restore steps`,
  `Expected result`,
  `Observed result`,
  `Pass/fail`,
  `Limitations`,
];

const rollbackPlan = [
  `Remove docs/testing/phase25c-broader-backup-restore-manual-evidence.md.`,
  `Remove docs/release/phase25c-broader-backup-restore-manual-evidence-summary.md.`,
  `Remove scripts/validate-phase25c-broader-backup-restore-manual-evidence.js.`,
  `Remove Phase 25C CI registration.`,
  `No learner data migration or cleanup is required because Phase 25C changes no runtime behavior.`,
];

const negativeContext = [
  `does not`,
  `Do not`,
  `must not`,
  `not claim`,
  `No `,
  `no `,
  `not `,
  `NOT RUN`,
  `unavailable`,
  `unchanged`,
  `manual`,
  `not used`,
];

function fail(message) {
  console.error(`Phase 25C validation failed: ${message}`);
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
  requireIncludes(workflow, `node scripts/validate-phase25c-broader-backup-restore-manual-evidence.js`, `workflow`);
  if (workflow.includes(`continue-on-error: true`)) fail(`Workflow must not use continue-on-error: true`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`Workflow must not run full historical validator chain`);
  for (const validator of historicalValidators) {
    const activeRun = new RegExp(`^[^#\\n]*node\\s+scripts/${validator.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)}`, `m`);
    if (activeRun.test(workflow)) fail(`Workflow must not register ${validator} as a Phase 25C merge blocker`);
  }
}

function assertNoForbiddenPositiveClaims(text, label) {
  const terms = [
    `broad backup reliability`,
    `long-term retention`,
    `platform backup preservation`,
    `production adapter-aware backup/export/restore`,
    `sync/cloud/account/auth/backend`,
    `BETA_READY`,
    `guaranteed data-loss prevention`,
  ];
  const lines = text.split(/\r?\n/);
  for (const term of terms) {
    for (const line of lines.filter(candidate => candidate.includes(term))) {
      if (!negativeContext.some(marker => line.includes(marker))) {
        fail(`${label} has forbidden positive claim: ${line}`);
      }
    }
  }
}

function assertEvidenceMatrix(text) {
  const header = text.split(/\r?\n/).find(line => line.startsWith(`| Evidence ID |`));
  if (!header) fail(`Evidence matrix header missing`);
  for (const matrixHeader of matrixHeaders) {
    if (!header.includes(`| ${matrixHeader} `)) fail(`Evidence matrix missing required header: ${matrixHeader}`);
  }

  const rows = text.split(/\r?\n/).filter(line => /^\| 25C-\d{3} \|/.test(line));
  if (rows.length < 5) fail(`Evidence matrix must include existing Phase 25C evidence rows`);
  const headerColumnCount = header.split(`|`).length - 2;
  for (const row of rows) {
    const columnCount = row.split(`|`).length - 2;
    if (columnCount !== headerColumnCount) fail(`Evidence matrix row has ${columnCount} columns, expected ${headerColumnCount}: ${row}`);
  }
}

const evidence = read(EVIDENCE_DOC);
const release = read(RELEASE_DOC);
const validator = read(VALIDATOR);
const workflow = read(WORKFLOW);

requireAll(evidence, evidenceHeadings, `evidence doc`);
requireAll(release, releaseHeadings, `release summary`);
requireAll(evidence, [statusToken, phase25bToken], `evidence doc`);
requireAll(release, [statusToken, phase25bToken], `release summary`);
requireAll(evidence, requiredStatements, `evidence doc required statement`);
requireAll(release, requiredStatements, `release summary required statement`);
requireAll(evidence, evidenceFields, `evidence doc required field`);
assertEvidenceMatrix(evidence);
requireAll(evidence, rollbackPlan, `evidence doc rollback plan`);
requireAll(release, rollbackPlan, `release summary rollback plan`);

for (const text of [evidence, release]) {
  requireIncludes(text, `Generated/test data only`, `generated/test data statement`);
  requireIncludes(text, `Real learner data was not used`, `real learner data statement`);
  requireIncludes(text, `Browser/manual smoke was actually run`, `manual smoke statement`);
  requireIncludes(text, `NOT RUN - unavailable`, `unavailable environment statement`);
  requireIncludes(text, `Next recommended phase: Phase 25D - Backup Health UX Planning`, `next phase statement`);
  requireIncludes(text, `Phase 25D is a separate UX planning gate.`, `next phase gate statement`);
  requireIncludes(text, `Phase 25C does not approve production adapter-aware backup/export/restore.`, `approval guardrail`);
  assertNoForbiddenPositiveClaims(text, text === evidence ? `evidence doc` : `release summary`);
}

for (const placeholder of [`TODO`, `TBD`, `To be recorded`, `Not run in Phase 25B`]) {
  if (evidence.includes(placeholder) || release.includes(placeholder)) fail(`Placeholder remains: ${placeholder}`);
}

assertWorkflow(workflow);
assertChangedFiles();

if (!validator.includes(`Phase 25C static validator`)) fail(`Validator identity text missing`);

console.log(`Phase 25C broader backup/restore manual evidence validation passed.`);
