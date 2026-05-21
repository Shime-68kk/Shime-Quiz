#!/usr/bin/env node
/**
 * Phase 24G-A static validator - backup/restore manual smoke run pack.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RUN_PACK = `docs/testing/phase24g-backup-restore-manual-smoke-run-pack.md`;
const RELEASE_SUMMARY = `docs/release/phase24g-manual-smoke-run-pack-summary.md`;
const VALIDATOR = `scripts/validate-phase24g-manual-smoke-run-pack.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  RUN_PACK,
  RELEASE_SUMMARY,
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
  `scripts/register-phase-forward-compat.js`,
  `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
  `scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
  `scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
  `scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`,
];

const productionBackupRestoreFiles = [
  `src/components/learning/BackupBeforeImportNotice.jsx`,
  `src/components/learning/V2BackupRestorePanel.jsx`,
  `src/quiz/dataBackup.js`,
  `src/state/v2BackupRestore.js`,
  `src/ui/dataBackupPanel.js`,
];

const statusToken = `PHASE24G_MANUAL_SMOKE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`;
const phase24dToken = `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`;
const phase24dHf2Token = `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`;
const phase24eToken = `PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD`;
const phase24fToken = `PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE`;

const runPackHeadings = [
  `# Phase 24G-A — Backup/Restore Manual Smoke Run Pack`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Purpose`,
  `## Prerequisites`,
  `## Environment fields`,
  `## Data safety setup`,
  `## Test data rules`,
  `## Backup/export smoke checklist`,
  `## Restore smoke checklist`,
  `## No-new-UI/no-new-claim checklist`,
  `## Evidence table`,
  `## Failure recording format`,
  `## Pass/fail criteria`,
  `## Rollback plan`,
  `## What Phase 24G-A can claim`,
  `## What Phase 24G-A must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24G-A — Manual Smoke Run Pack Summary`,
  `## Status token`,
  `## Scope`,
  `## Run pack summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24G-A is docs/testing/static-validator/CI-only.`,
  `Phase 24G-A prepares a manual smoke run pack but does not execute manual/browser smoke.`,
  `Phase 24G-A does not change runtime behavior.`,
  `Phase 24G-A does not modify Phase 24E scaffold behavior.`,
  `Phase 24G-A does not implement production adapter-aware backup/export/restore.`,
  `Production backup/export/restore behavior remains unchanged.`,
  `Backup file format remains unchanged.`,
  `Restore overwrite behavior remains unchanged.`,
  `Current localStorage backup compatibility remains unchanged.`,
  `Default storage driver remains unchanged.`,
  `No IndexedDB.`,
  `No storage migration.`,
  `No sync/cloud/account/auth/backend.`,
  `No BETA_READY.`,
  `Historical full-chain validators remain manual/local/scheduled audit guidance.`,
  `Full historical scripts/validate-*.js chain is not used as a Phase 24G-A merge-blocking requirement.`,
];

const coverageTerms = [
  `Purpose`,
  `Prerequisites`,
  `Environment fields`,
  `Data safety setup`,
  `Test data rules`,
  `Backup/export smoke checklist`,
  `Restore smoke checklist`,
  `No-new-UI/no-new-claim checklist`,
  `Failure recording format`,
  `Evidence table`,
  `Pass/fail criteria`,
  `What can be claimed after execution`,
  `What cannot be claimed after execution`,
  `Follow-up action rules`,
];

const manualSmokeConstraints = [
  `Use generated/test data only.`,
  `Do not use real learner data.`,
  `Before restore testing, create a disposable test dataset.`,
  `Do not claim broad data-loss prevention.`,
  `Do not claim platform backup preservation.`,
  `Do not claim production adapter-aware backup/export/restore.`,
  `Do not claim sync/cloud/account/auth/backend.`,
  `Record browser, OS, app URL, commit SHA, date/time, tester name/handle, and observed result.`,
  `If browser/manual smoke is not actually run, status remains PREPARED_NOT_EXECUTED.`,
];

const rollbackPlan = [
  `Remove docs/testing/phase24g-backup-restore-manual-smoke-run-pack.md.`,
  `Remove docs/release/phase24g-manual-smoke-run-pack-summary.md.`,
  `Remove scripts/validate-phase24g-manual-smoke-run-pack.js.`,
  `Remove Phase 24G-A CI registration.`,
  `No learner data migration or cleanup is required because Phase 24G-A changes no runtime behavior.`,
];

const nextPhase = [
  `Next recommended phase: Phase 24G-B — Execute Backup/Restore Manual Smoke Evidence`,
  `Phase 24G-B is a separate evidence execution gate.`,
  `Phase 24G-A does not approve production adapter-aware backup/export/restore.`,
];

const executionClaimPatterns = [
  /\bmanual\/browser smoke was (run|executed|completed|passed)\b/i,
  /\bbrowser\/manual smoke was (run|executed|completed|passed)\b/i,
  /\bmanual smoke was (run|executed|completed|passed)\b/i,
  /\bbrowser smoke was (run|executed|completed|passed)\b/i,
  /\bPASS:\s*manual\/browser smoke\b/i,
  /\bPASS:\s*browser\/manual smoke\b/i,
];

const forbiddenClaims = [
  `BETA_READY`,
  `manual/browser smoke was executed`,
  `broad data-loss prevention`,
  `platform backup preservation`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `adapter-aware backup/export/restore implemented for production`,
  `production adapter-aware backup/export/restore`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
];

function fail(message) {
  console.error(`Phase 24G-A validation failed: ${message}`);
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

function negativeOrGuardrailLine(line) {
  return /\bdoes not\b|\bmust not\b|\bDo not\b|\bNo \b|\bnot approve\b|\bunchanged\b|\bforbids\b|\bnot actually run\b|\bPREPARED_NOT_EXECUTED\b|\bWhat cannot be claimed\b|\bWhat Phase 24G-A must not claim\b/i.test(line);
}

function textOutsideNegativeContext(text) {
  return text
    .replace(/## What Phase 24G-A must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !negativeOrGuardrailLine(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const runLines = workflowRunLines(workflow);
  const phase24g = `node scripts/validate-phase24g-manual-smoke-run-pack.js`;
  const phase24dHf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;
  const phase24dHf2 = `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
  const phase24e = `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`;
  const phase24f = `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`;

  if (!runLines.includes(phase24g)) fail(`CI must run the Phase 24G-A validator as the current-phase gate`);
  if (workflow.includes(phase24dHf1)) fail(`CI must not register Phase 24D-HF1 validator`);
  if (runLines.includes(phase24dHf2)) fail(`CI must not run Phase 24D-HF2 validator as a Phase 24G-A merge-blocking gate`);
  if (runLines.includes(phase24e)) fail(`CI must not run Phase 24E validator as a Phase 24G-A merge-blocking gate`);
  if (runLines.includes(phase24f)) fail(`CI must not run Phase 24F validator as a Phase 24G-A merge-blocking gate`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [RUN_PACK, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(RUN_PACK, runPackHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [RUN_PACK, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, phase24dToken);
    requireIncludes(file, text, phase24dHf2Token);
    requireIncludes(file, text, phase24eToken);
    requireIncludes(file, text, phase24fToken);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const constraint of manualSmokeConstraints) requireIncludes(file, text, constraint);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of nextPhase) requireIncludes(file, text, line);
  }

  const runPack = read(RUN_PACK);
  for (const term of coverageTerms) requireIncludes(RUN_PACK, runPack, term);
  requireIncludes(RUN_PACK, runPack, `pass, fail, blocked, or not run`);
  requireIncludes(RUN_PACK, runPack, `tester name/handle`);
  requireIncludes(RUN_PACK, runPack, `date/time`);
  requireIncludes(RUN_PACK, runPack, `commit SHA`);
  requireIncludes(RUN_PACK, runPack, `app URL`);
  requireIncludes(RUN_PACK, runPack, `browser and browser version`);
  requireIncludes(RUN_PACK, runPack, `OS and OS version`);
  requireIncludes(RUN_PACK, runPack, `observed result`);

  const summary = read(RELEASE_SUMMARY);
  for (const term of coverageTerms) requireIncludes(RELEASE_SUMMARY, summary, term);
}

function validateNoExecutedSmokeClaims() {
  const text = textOutsideNegativeContext(`${read(RUN_PACK)}\n${read(RELEASE_SUMMARY)}`);
  for (const pattern of executionClaimPatterns) {
    const match = text.match(pattern);
    if (match) fail(`docs must not claim manual/browser smoke was executed: ${match[0]}`);
  }
}

function validateForbiddenClaims() {
  const text = `${read(RUN_PACK)}\n${read(RELEASE_SUMMARY)}`;
  const outsideNegative = textOutsideNegativeContext(text);
  for (const claim of forbiddenClaims) {
    if (outsideNegative.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
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
  if (!validator.includes(`forbiddenTouchedFiles`)) fail(`validator must explicitly list forbidden historical validators`);
}

validateWorkflow();
validateDocs();
validateNoExecutedSmokeClaims();
validateForbiddenClaims();
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 24G-A manual smoke run pack validation passed.`);
