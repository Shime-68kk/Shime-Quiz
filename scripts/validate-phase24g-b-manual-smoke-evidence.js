#!/usr/bin/env node
/**
 * Phase 24G-B static validator - backup/restore manual smoke evidence.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE_DOC = `docs/testing/phase24g-b-backup-restore-manual-smoke-evidence.md`;
const RELEASE_SUMMARY = `docs/release/phase24g-b-manual-smoke-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase24g-b-manual-smoke-evidence.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  EVIDENCE_DOC,
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
  `scripts/validate-phase24g-manual-smoke-run-pack.js`,
];

const productionBackupRestoreFiles = [
  `src/components/learning/BackupBeforeImportNotice.jsx`,
  `src/components/learning/V2BackupRestorePanel.jsx`,
  `src/quiz/dataBackup.js`,
  `src/state/v2BackupRestore.js`,
  `src/ui/dataBackupPanel.js`,
];

const statusToken = `PHASE24G_B_MANUAL_SMOKE_EVIDENCE_STATUS: COMPLETED_MANUAL_EVIDENCE`;
const phase24dToken = `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`;
const phase24dHf2Token = `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`;
const phase24eToken = `PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD`;
const phase24fToken = `PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE`;
const phase24gAToken = `PHASE24G_MANUAL_SMOKE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`;

const evidenceHeadings = [
  `# Phase 24G-B — Backup/Restore Manual Smoke Evidence`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Environment`,
  `## Data safety setup`,
  `## Test data used`,
  `## Backup/export smoke result`,
  `## Restore/import smoke result`,
  `## No-new-UI/no-new-claim result`,
  `## Failure/anomaly log`,
  `## Overall result`,
  `## Evidence limitations`,
  `## Rollback plan`,
  `## What Phase 24G-B can claim`,
  `## What Phase 24G-B must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24G-B — Manual Smoke Evidence Summary`,
  `## Status token`,
  `## Scope`,
  `## Evidence summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24G-B is manual/browser evidence execution plus docs/static-validator/CI.`,
  `Phase 24G-B does not change runtime behavior.`,
  `Phase 24G-B does not modify Phase 24E scaffold behavior.`,
  `Phase 24G-B does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 24G-B merge-blocking requirement.`,
];

const requiredEvidenceFields = [
  `Tester name/handle`,
  `Date/time`,
  `OS`,
  `Browser and version or unknown`,
  `Node/npm versions`,
  `Commit SHA`,
  `App URL`,
  `Data safety setup`,
  `Test data used`,
  `Backup/export smoke result`,
  `Restore/import smoke result`,
  `No-new-UI/no-new-claim result`,
  `Failure/anomaly log`,
  `Overall result`,
  `Evidence limitations`,
];

const evidenceQualityStatements = [
  `Use generated/test data only.`,
  `Real learner data was not used.`,
  `Browser/manual smoke was actually run: yes`,
  `No app failure or anomaly was observed during the completed evidence run.`,
  `This evidence confirms only the observed existing user-visible backup/export/restore smoke path with generated/test data.`,
];

const rollbackPlan = [
  `Remove docs/testing/phase24g-b-backup-restore-manual-smoke-evidence.md.`,
  `Remove docs/release/phase24g-b-manual-smoke-evidence-summary.md.`,
  `Remove scripts/validate-phase24g-b-manual-smoke-evidence.js.`,
  `Remove Phase 24G-B CI registration.`,
  `No learner data migration or cleanup is required because Phase 24G-B changes no runtime behavior.`,
];

const nextPhase = [
  `Next recommended phase: Phase 24H — Phase 24 Closure / Phase 25 Planning Gate`,
  `Phase 24H is a separate closure/planning gate.`,
  `Phase 24G-B does not approve production adapter-aware backup/export/restore.`,
];

const forbiddenClaims = [
  `BETA_READY`,
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
  console.error(`Phase 24G-B validation failed: ${message}`);
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
  return /\bdoes not\b|\bmust not\b|\bDo not\b|\bNo \b|\bnot approve\b|\bunchanged\b|\bnot used\b|\bnot claim\b|\bnot a\b|\bnot cloud\b|\bdoes not create\b|\bmust not claim\b|\bWhat Phase 24G-B must not claim\b/i.test(line);
}

function textOutsideNegativeContext(text) {
  return text
    .replace(/## What Phase 24G-B must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !negativeOrGuardrailLine(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const runLines = workflowRunLines(workflow);
  const phase24gB = `node scripts/validate-phase24g-b-manual-smoke-evidence.js`;
  const phase24dHf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;
  const phase24dHf2 = `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
  const phase24e = `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`;
  const phase24f = `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`;
  const phase24gA = `node scripts/validate-phase24g-manual-smoke-run-pack.js`;

  if (!runLines.includes(phase24gB)) fail(`CI must run the Phase 24G-B validator as the current-phase gate`);
  if (workflow.includes(phase24dHf1)) fail(`CI must not register Phase 24D-HF1 validator`);
  for (const historical of [phase24dHf2, phase24e, phase24f, phase24gA]) {
    if (runLines.includes(historical)) fail(`CI must not run historical validator as a Phase 24G-B merge-blocking gate: ${historical}`);
  }
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function requireNonPlaceholderField(file, text, field) {
  const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  const pattern = new RegExp(`${escaped}:\\s*(.+)`, `i`);
  const match = text.match(pattern);
  if (!match) fail(`${file} is missing non-placeholder field: ${field}`);
  const value = match[1].trim();
  if (!value || /^(todo|tbd|unknown|n\/a|\[.*\]|pending)$/i.test(value)) {
    fail(`${file} has placeholder value for ${field}: ${value}`);
  }
}

function validateDocs() {
  for (const file of [EVIDENCE_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(EVIDENCE_DOC, evidenceHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [EVIDENCE_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    for (const token of [phase24dToken, phase24dHf2Token, phase24eToken, phase24fToken, phase24gAToken]) requireIncludes(file, text, token);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of nextPhase) requireIncludes(file, text, line);
    requireIncludes(file, text, `Use generated/test data only.`);
    requireIncludes(file, text, `Real learner data was not used.`);
  }

  const evidence = read(EVIDENCE_DOC);
  for (const field of requiredEvidenceFields) requireIncludes(EVIDENCE_DOC, evidence, field);
  for (const field of [`Tester name/handle`, `Date/time`, `OS`, `Browser and version or unknown`, `Node/npm versions`, `Commit SHA`, `App URL`]) {
    requireNonPlaceholderField(EVIDENCE_DOC, evidence, field);
  }
  for (const statement of evidenceQualityStatements) requireIncludes(EVIDENCE_DOC, evidence, statement);
  requireIncludes(EVIDENCE_DOC, evidence, `Screenshot notes were stored outside the repository`);
  requireIncludes(EVIDENCE_DOC, evidence, `Overall result: PASS`);

  const summary = read(RELEASE_SUMMARY);
  for (const field of [`Tester name/handle`, `Date/time`, `OS`, `Browser and version or unknown`, `Node/npm versions`, `Commit SHA`, `App URL`]) {
    requireNonPlaceholderField(RELEASE_SUMMARY, summary, field);
  }
  requireIncludes(RELEASE_SUMMARY, summary, `Browser/manual smoke was actually run: yes.`);
  requireIncludes(RELEASE_SUMMARY, summary, `Backup/export smoke result: PASS.`);
  requireIncludes(RELEASE_SUMMARY, summary, `Restore/import smoke result: PASS.`);
  requireIncludes(RELEASE_SUMMARY, summary, `No-new-UI/no-new-claim result: PASS.`);
}

function validateForbiddenClaims() {
  const outsideNegative = textOutsideNegativeContext(`${read(EVIDENCE_DOC)}\n${read(RELEASE_SUMMARY)}`);
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
  if (!validator.includes(`scripts/validate-phase24g-manual-smoke-run-pack.js`)) fail(`validator must explicitly guard the Phase 24G-A historical validator`);
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 24G-B manual smoke evidence validation passed.`);
