#!/usr/bin/env node
/**
 * Phase 24H static validator - Phase 24 closure and Phase 25 planning gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const CLOSURE_DOC = `docs/release/phase24h-phase24-closure-phase25-planning-gate.md`;
const PLANNING_DOC = `docs/planning/phase25a-planning-gate-seed.md`;
const VALIDATOR = `scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  CLOSURE_DOC,
  PLANNING_DOC,
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
  `scripts/validate-phase24g-b-manual-smoke-evidence.js`,
];

const productionBackupRestoreFiles = [
  `src/components/learning/BackupBeforeImportNotice.jsx`,
  `src/components/learning/V2BackupRestorePanel.jsx`,
  `src/quiz/dataBackup.js`,
  `src/state/v2BackupRestore.js`,
  `src/ui/dataBackupPanel.js`,
];

const statusToken = `PHASE24H_CLOSURE_PHASE25_PLANNING_GATE_STATUS: CLOSED_WITH_PHASE25A_PLANNING_REQUIRED`;
const closureDecision = `Phase 24 closure decision: CLOSED_WITH_LIMITED_MANUAL_EVIDENCE_AND_NO_PRODUCTION_ADAPTER_AWARE_BACKUP_RESTORE_APPROVAL`;

const phaseTokens = [
  `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`,
  `PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES`,
  `PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD`,
  `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`,
  `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`,
  `PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD`,
  `PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE`,
  `PHASE24G_MANUAL_SMOKE_RUN_PACK_STATUS: PREPARED_NOT_EXECUTED`,
  `PHASE24G_B_MANUAL_SMOKE_EVIDENCE_STATUS: COMPLETED_MANUAL_EVIDENCE`,
];

const closureHeadings = [
  `# Phase 24H — Phase 24 Closure / Phase 25 Planning Gate`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Phase 24 closure decision`,
  `## Phase-by-phase summary`,
  `## Proven`,
  `## Not proven`,
  `## Release and claim guardrails`,
  `## Rollback plan`,
  `## What Phase 24H can claim`,
  `## What Phase 24H must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const planningHeadings = [
  `# Phase 25A Planning Gate Seed`,
  `## Status token`,
  `## Scope`,
  `## Why Phase 25A is planning-first`,
  `## Candidate directions`,
  `## Required gates before runtime work`,
  `## Forbidden claims`,
  `## Local-first guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24H is docs/release/static-validator/CI-only.`,
  `Phase 24H does not change runtime behavior.`,
  `Phase 24H does not modify Phase 24E scaffold behavior.`,
  `Phase 24H does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 24H merge-blocking requirement.`,
];

const provenItems = [
  `Proven:`,
  `- Phase 24E scaffold is test-only/default-off.`,
  `- Phase 24E scaffold is not production-wired.`,
  `- Existing production backup/export/restore modules were not changed by Phase 24H.`,
  `- A single local Chromium manual smoke run covered generated/test backup and restore evidence in Phase 24G-B.`,
  `- Current-phase CI strategy is active.`,
];

const notProvenItems = [
  `Not proven:`,
  `- broad backup reliability`,
  `- long-term retention`,
  `- browser/device matrix`,
  `- production adapter-aware backup/export/restore`,
  `- IndexedDB production storage`,
  `- storage migration safety`,
  `- sync/cloud/account/auth/backend`,
  `- BETA_READY`,
  `- guaranteed data-loss prevention`,
];

const rollbackPlan = [
  `Remove docs/release/phase24h-phase24-closure-phase25-planning-gate.md.`,
  `Remove docs/planning/phase25a-planning-gate-seed.md.`,
  `Remove scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js.`,
  `Remove Phase 24H CI registration.`,
  `No learner data migration or cleanup is required because Phase 24H changes no runtime behavior.`,
];

const phase25Requirements = [
  `Phase 25A must be planning-first.`,
  `Phase 25A must not start runtime storage or backup/restore changes without a design gate.`,
  `Phase 25A must decide between:`,
  `- broader backup/restore manual evidence`,
  `- backup health UX planning`,
  `- production adapter-aware backup/restore design gate`,
  `- local data survival / recovery UX refinement`,
  `Phase 25A must keep local-first/no-cloud/default-off identity.`,
  `Phase 25A must not claim BETA_READY.`,
];

const nextPhase = [
  `Next recommended phase: Phase 25A — Planning Gate / Backup Restore Direction Decision`,
  `Phase 25A is a separate planning gate.`,
  `Phase 24H does not approve production adapter-aware backup/export/restore.`,
];

const phaseCoverage = [
  `Phase 24A residual direct storage audit`,
  `Phase 24B storage adapter boundary decision`,
  `Phase 24C help tour storage adapter scaffold`,
  `Phase 24D backup/export/restore adapter-awareness design`,
  `Phase 24D-HF2 CI validator strategy reset`,
  `Phase 24E adapter-aware backup/restore test-only scaffold`,
  `Phase 24F regression evidence after adapter changes`,
  `Phase 24G-A backup/restore manual smoke run pack`,
  `Phase 24G-B backup/restore manual smoke evidence`,
  `What was locked`,
  `What was not approved`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `broad backup reliability`,
  `guaranteed data-loss prevention`,
  `production adapter-aware backup/export/restore`,
  `IndexedDB production storage`,
  `storage migration safety`,
  `sync/cloud/account/auth/backend`,
];

function fail(message) {
  console.error(`Phase 24H validation failed: ${message}`);
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
  if (/^-\s*(broad backup reliability|long-term retention|browser\/device matrix|production adapter-aware backup\/export\/restore|IndexedDB production storage|storage migration safety|sync\/cloud\/account\/auth\/backend|BETA_READY|guaranteed data-loss prevention)\s*$/i.test(line)) {
    return true;
  }
  return /\bdoes not\b|\bmust not\b|\bDo not\b|\bNo \b|\bnot approve\b|\bnot approved\b|\bnot proven\b|\bunchanged\b|\bwithout\b|\bforbidden\b|\bguardrail\b|\bRollback\b|\bRemove\b|\bCLOSED_WITH_LIMITED_MANUAL_EVIDENCE_AND_NO_PRODUCTION_ADAPTER_AWARE_BACKUP_RESTORE_APPROVAL\b/i.test(line);
}

function outsideNegativeContext(text) {
  return text
    .replace(/## What Phase 24H must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .replace(/## Forbidden claims[\s\S]*?(?=\n## |$)/g, ``)
    .replace(/## Not proven[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !negativeOrGuardrailLine(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const runLines = workflowRunLines(workflow);
  const phase24h = `node scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`;
  const historicalValidators = [
    `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
    `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
    `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`,
    `node scripts/validate-phase24g-manual-smoke-run-pack.js`,
    `node scripts/validate-phase24g-b-manual-smoke-evidence.js`,
  ];

  if (!runLines.includes(phase24h)) fail(`CI must run the Phase 24H validator as the current-phase gate`);
  if (workflow.includes(`node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`)) {
    fail(`CI must not register Phase 24D-HF1 validator`);
  }
  for (const historical of historicalValidators) {
    if (runLines.includes(historical)) fail(`CI must not run historical validator as a Phase 24H merge-blocking gate: ${historical}`);
  }
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [CLOSURE_DOC, PLANNING_DOC, VALIDATOR]) read(file);
  requireHeadings(CLOSURE_DOC, closureHeadings);
  requireHeadings(PLANNING_DOC, planningHeadings);

  for (const file of [CLOSURE_DOC, PLANNING_DOC]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, closureDecision);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const item of provenItems) requireIncludes(file, text, item);
    for (const item of notProvenItems) requireIncludes(file, text, item);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of nextPhase) requireIncludes(file, text, line);
  }

  const closure = read(CLOSURE_DOC);
  for (const token of phaseTokens) requireIncludes(CLOSURE_DOC, closure, token);
  for (const coverage of phaseCoverage) requireIncludes(CLOSURE_DOC, closure, coverage);

  const planning = read(PLANNING_DOC);
  for (const requirement of phase25Requirements) requireIncludes(PLANNING_DOC, planning, requirement);
}

function validateForbiddenClaims() {
  const scoped = outsideNegativeContext(`${read(CLOSURE_DOC)}\n${read(PLANNING_DOC)}`);
  for (const claim of forbiddenClaims) {
    if (scoped.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
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
  if (!validator.includes(`scripts/validate-phase24g-b-manual-smoke-evidence.js`)) {
    fail(`validator must explicitly guard the Phase 24G-B historical validator`);
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 24H closure and Phase 25 planning gate validation passed.`);
