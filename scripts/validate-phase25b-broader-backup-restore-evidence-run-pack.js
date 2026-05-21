#!/usr/bin/env node
/**
 * Phase 25B static validator - broader backup/restore evidence run pack.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RUN_PACK_DOC = `docs/testing/phase25b-broader-backup-restore-evidence-run-pack.md`;
const RELEASE_DOC = `docs/release/phase25b-broader-backup-restore-evidence-run-pack-summary.md`;
const VALIDATOR = `scripts/validate-phase25b-broader-backup-restore-evidence-run-pack.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  RUN_PACK_DOC,
  RELEASE_DOC,
  VALIDATOR,
  WORKFLOW,
]);

const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `coverage`,
  `test-results`,
  `playwright-report`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
];

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
  `docs/planning/phase25a-planning-gate-seed.md`,
  `docs/planning/phase25a-backup-restore-direction-decision.md`,
  `scripts/validate-phase25a-backup-restore-direction-decision.js`,
  `scripts/register-phase-forward-compat.js`,
  `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
  `scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
  `scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
  `scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`,
  `scripts/validate-phase24g-manual-smoke-run-pack.js`,
  `scripts/validate-phase24g-b-manual-smoke-evidence.js`,
  `scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`,
];

const productionBackupRestoreFiles = [
  `src/components/learning/BackupBeforeImportNotice.jsx`,
  `src/components/learning/V2BackupRestorePanel.jsx`,
  `src/quiz/dataBackup.js`,
  `src/state/v2BackupRestore.js`,
  `src/ui/dataBackupPanel.js`,
];

const statusToken = `PHASE25B_BROADER_BACKUP_RESTORE_EVIDENCE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`;
const decisionToken = `PHASE25A_BACKUP_RESTORE_DIRECTION_DECISION: PASS_TO_PHASE25B_BROADER_EVIDENCE_BEFORE_RUNTIME`;

const runPackHeadings = [
  `# Phase 25B — Broader Backup/Restore Manual Evidence Run Pack`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## Prerequisites`,
  `## Environment fields`,
  `## Data safety setup`,
  `## Generated/test data rules`,
  `## Browser/device matrix`,
  `## Backup/export checklist`,
  `## Restore/import checklist`,
  `## Reload-after-restore checklist`,
  `## No-new-UI/no-new-claim checklist`,
  `## Evidence table`,
  `## Failure/anomaly recording format`,
  `## Pass/fail criteria`,
  `## Phase 25C outline`,
  `## Rollback plan`,
  `## What Phase 25B can claim`,
  `## What Phase 25B must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const releaseHeadings = [
  `# Phase 25B — Broader Backup/Restore Manual Evidence Run Pack Summary`,
  `## Status token`,
  `## Scope`,
  `## Run pack summary`,
  `## Phase 25C outline`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 25B is docs/testing/static-validator/CI-only.`,
  `Phase 25B prepares a broader manual evidence run pack but does not execute manual/browser evidence.`,
  `Phase 25B does not change runtime behavior.`,
  `Phase 25B does not modify Phase 24E scaffold behavior.`,
  `Phase 25B does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25B merge-blocking requirement.`,
];

const matrixRows = [
  `Chromium/Chrome desktop baseline`,
  `Firefox or alternative browser if available`,
  `Mobile-ish viewport in Chromium/Chrome if available`,
  `Reload-after-restore check`,
  `No-new-UI/no-new-claim check`,
];

const matrixFields = [
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

const checklistCoverage = [
  `Purpose`,
  `Prerequisites`,
  `Environment fields`,
  `Data safety setup`,
  `Generated/test data rules`,
  `Browser/device matrix`,
  `Backup/export checklist`,
  `Restore/import checklist`,
  `Reload-after-restore checklist`,
  `No-new-UI/no-new-claim checklist`,
  `Failure/anomaly recording format`,
  `Evidence table`,
  `Pass/fail criteria`,
  `What can be claimed after execution`,
  `What cannot be claimed after execution`,
  `Follow-up action rules`,
];

const dataSafety = [
  `Use generated/test data only.`,
  `Do not use real learner data.`,
  `Create disposable datasets before restore testing.`,
  `Keep temporary screenshots/logs outside the repo unless a later phase explicitly scopes artifact handling.`,
  `Do not claim broad backup reliability.`,
  `Do not claim long-term retention.`,
  `Do not claim browser/device matrix completion unless actually executed.`,
  `Do not claim platform backup preservation.`,
  `Do not claim production adapter-aware backup/export/restore.`,
  `Do not claim sync/cloud/account/auth/backend.`,
  `Do not claim BETA_READY.`,
];

const phase25cOutline = [
  `Phase 25C — Execute Broader Backup/Restore Manual Evidence`,
  `- execute the Phase 25B matrix with generated/test data only`,
  `- record each environment honestly`,
  `- record unavailable browsers/devices as not run, not pass`,
  `- include backup/export, restore/import, reload-after-restore, and no-new-claim checks`,
  `- keep screenshots/logs outside the repo unless explicitly scoped`,
  `- do not claim broad reliability or data-loss prevention`,
  `- do not approve runtime changes`,
];

const rollbackPlan = [
  `Remove docs/testing/phase25b-broader-backup-restore-evidence-run-pack.md.`,
  `Remove docs/release/phase25b-broader-backup-restore-evidence-run-pack-summary.md.`,
  `Remove scripts/validate-phase25b-broader-backup-restore-evidence-run-pack.js.`,
  `Remove Phase 25B CI registration.`,
  `No learner data migration or cleanup is required because Phase 25B changes no runtime behavior.`,
];

const nextPhase = [
  `Next recommended phase: Phase 25C — Execute Broader Backup/Restore Manual Evidence`,
  `Phase 25C is a separate evidence execution gate.`,
  `Phase 25B does not approve production adapter-aware backup/export/restore.`,
];

function fail(message) {
  console.error(`Phase 25B validation failed: ${message}`);
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

function lines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function changedFiles() {
  const base = runGit(`git merge-base HEAD origin/main`);
  const diffFiles = base ? lines(runGit(`git diff --name-only ${base} HEAD`)) : [];
  const localFiles = [
    ...lines(runGit(`git diff --name-only`)),
    ...lines(runGit(`git diff --cached --name-only`)),
    ...lines(runGit(`git ls-files --others --exclude-standard`)),
  ].filter(file => !generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) && !file.endsWith(`.log`));
  return [...new Set([...diffFiles, ...localFiles])].sort();
}

function requireIncludes(file, text, value) {
  if (!text.includes(value)) fail(`${file} is missing required text: ${value}`);
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) requireIncludes(file, text, heading);
}

function workflowRunLines(workflow) {
  return workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith(`run:`))
    .map(line => line.replace(/^run:\s*/, ``));
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const runLines = workflowRunLines(workflow);
  const phase25b = `node scripts/validate-phase25b-broader-backup-restore-evidence-run-pack.js`;
  const blockedValidators = [
    `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
    `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
    `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
    `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`,
    `node scripts/validate-phase24g-manual-smoke-run-pack.js`,
    `node scripts/validate-phase24g-b-manual-smoke-evidence.js`,
    `node scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`,
    `node scripts/validate-phase25a-backup-restore-direction-decision.js`,
  ];

  if (!runLines.includes(phase25b)) fail(`CI must run the Phase 25B validator as the current-phase gate`);
  for (const blocked of blockedValidators) {
    if (runLines.includes(blocked)) fail(`CI must not run historical validator as a Phase 25B merge-blocking gate: ${blocked}`);
    if (workflow.includes(blocked)) fail(`CI workflow must not register historical validator during Phase 25B: ${blocked}`);
  }
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [RUN_PACK_DOC, RELEASE_DOC, VALIDATOR]) read(file);
  requireHeadings(RUN_PACK_DOC, runPackHeadings);
  requireHeadings(RELEASE_DOC, releaseHeadings);

  const runPack = read(RUN_PACK_DOC);
  for (const item of checklistCoverage) requireIncludes(RUN_PACK_DOC, runPack, item);
  for (const row of matrixRows) requireIncludes(RUN_PACK_DOC, runPack, row);
  for (const field of matrixFields) requireIncludes(RUN_PACK_DOC, runPack, field);

  for (const file of [RUN_PACK_DOC, RELEASE_DOC]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, decisionToken);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const safety of dataSafety) requireIncludes(file, text, safety);
    for (const line of phase25cOutline) requireIncludes(file, text, line);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of nextPhase) requireIncludes(file, text, line);
  }
}

function validateNoExecutedEvidenceClaims() {
  const badPatterns = [
    /\bPhase 25B manual\/browser evidence was executed\b/i,
    /\bPhase 25B browser evidence was executed\b/i,
    /\bPhase 25B manual evidence was executed\b/i,
    /\bPhase 25B executed\b/i,
    /\bPhase 25B completed the browser\/device matrix\b/i,
    /\bPhase 25B passed the browser\/device matrix\b/i,
  ];

  for (const file of [RUN_PACK_DOC, RELEASE_DOC]) {
    const text = read(file);
    for (const pattern of badPatterns) {
      if (pattern.test(text)) fail(`${file} appears to claim manual/browser evidence execution: ${pattern}`);
    }
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden runtime/test/ADR path changed: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (file.startsWith(`scripts/validate-`) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }
}

function validateProductionBackupRestoreUnchanged() {
  const changed = changedFiles();
  for (const file of productionBackupRestoreFiles) {
    if (changed.includes(file)) fail(`Production backup/restore module changed: ${file}`);
  }

  const diff = runGit(`git diff --name-only origin/main -- ${productionBackupRestoreFiles.map(file => `"${file}"`).join(` `)}`);
  if (diff) fail(`Production backup/restore module diff detected:\n${diff}`);
}

function validateNoBroadAllowlists() {
  const validator = read(VALIDATOR);
  if (/allowedChanged\s*=\s*new Set\(\[\s*\]\)/.test(validator)) fail(`validator must not use an empty broad allowlist`);
  if (/startsWith\(`src\/`\).*allowed/i.test(validator)) fail(`validator must not broadly allow src/`);
  if (!validator.includes(`productionBackupRestoreFiles`)) fail(`validator must explicitly check production backup/restore modules`);
  if (!validator.includes(`scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`)) {
    fail(`validator must explicitly guard the Phase 24H historical validator`);
  }
}

validateWorkflow();
validateDocs();
validateNoExecutedEvidenceClaims();
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 25B broader backup/restore evidence run pack validation passed.`);
