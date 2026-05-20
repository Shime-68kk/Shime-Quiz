#!/usr/bin/env node
/**
 * Phase 23F static validator - Phase 23 decision gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DECISION_DOC = `docs/release/phase23f-phase23-decision-gate.md`;
const MATRIX_DOC = `docs/research/phase23f-data-survival-decision-matrix.md`;
const VALIDATOR = `scripts/validate-phase23f-phase23-decision-gate.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23fPaths = [DECISION_DOC, MATRIX_DOC, VALIDATOR];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const allowedChanged = new Set([
  WORKFLOW,
  ...phase23fPaths,
  ...phase24aForwardCompatPaths,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `scripts/validate-phase23b-data-survival-ux-copy.js`,
  `scripts/validate-phase23c-backup-health-design.js`,
  `scripts/validate-phase23d-backup-reminder-risk-friction-design.js`,
  `scripts/validate-phase23e-data-survival-comprehension-plan.js`,
]);

const passDecision = `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: PASS_TO_PHASE24A_AUDIT_ONLY_WITH_RUNTIME_GATES`;
const holdDecision = `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: HOLD_FOR_PHASE23_REVISION`;
const validDecisions = [passDecision, holdDecision];
const nextPhaseText = `Phase 24A — Residual Direct-Storage Audit`;
const nextPhaseLine = `Next recommended phase: ${nextPhaseText}`;
const phase22hHold = `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_BROADER_ACTUAL_EVIDENCE_STILL_LIMITED`;

const phaseTokens = [
  `PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY`,
  `PHASE23B_DATA_SURVIVAL_UX_COPY_STATUS: COMPLETED_DOCS_ONLY`,
  `PHASE23C_BACKUP_HEALTH_DESIGN_STATUS: COMPLETED_DOCS_ONLY`,
  `PHASE23D_BACKUP_REMINDER_RISK_FRICTION_DESIGN_STATUS: COMPLETED_DOCS_ONLY`,
  `PHASE23E_DATA_SURVIVAL_COMPREHENSION_PLAN_STATUS: COMPLETED_DOCS_ONLY`,
];

const decisionHeadings = [
  `# Phase 23F — Phase 23 Decision Gate`,
  `## Decision token`,
  `## Scope`,
  `## Inputs consumed`,
  `## Phase 23 completion summary`,
  `## Decision rationale`,
  `## What Phase 23F approves`,
  `## What Phase 23F does not approve`,
  `## Phase 24 gate sequence`,
  `## Remaining blockers and non-claims`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const matrixHeadings = [
  `# Phase 23F — Data Survival Decision Matrix`,
  `## Decision token`,
  `## Inputs consumed`,
  `## Decision matrix`,
  `## Runtime gates`,
  `## Beta readiness boundary`,
  `## Remaining blockers and non-claims`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const passConstraints = [
  `Phase 23 research/design/planning is complete enough to proceed to Phase 24A.`,
  `Phase 24A must be audit-only.`,
  `Phase 24A must not change runtime behavior.`,
  `Phase 24A must not migrate storage.`,
  `Phase 24A must not implement StorageAdapter expansion.`,
  `Phase 24A must not implement IndexedDB.`,
  `Phase 24A must not implement adapter-aware backup/export/restore.`,
  `Phase 24A must not implement sync, cloud, account, auth, or backend behavior.`,
  `BETA_READY remains unavailable.`,
];

const phase24Sequence = [
  `24A — Residual Direct-Storage Audit`,
  `24B — StorageAdapter Coverage Plan / Boundary Decision`,
  `24C — One Low-Risk Storage Module Adapter Scaffold`,
  `24D — Backup/Export/Restore Adapter-Awareness Design Gate`,
  `24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only`,
  `24F — Regression Evidence After Adapter Changes`,
];

const approvalBoundary = [
  `Only Phase 24A is approved next.`,
  `Phase 24B–24F are directional and require separate phase gates.`,
];

const remainingBlockers = [
  `BETA_READY`,
  `external data-survival comprehension evidence executed`,
  `broad external real-user evidence complete`,
  `runtime backup health implementation`,
  `runtime backup reminder implementation`,
  `runtime pre-risk-action friction implementation`,
  `backup/export adapter-awareness`,
  `restore adapter-awareness`,
  `production IndexedDB storage`,
  `storage migration`,
  `sync/cloud/account/auth/backend`,
  `platform backup verification`,
  `guaranteed data-loss prevention`,
];

const allowedClaims = [
  `Phase 23 docs/research/design/planning is complete.`,
  `A Phase 24A audit-only next step is approved.`,
  `Runtime storage changes remain gated.`,
  `Data-survival comprehension evidence is planned but not executed.`,
  `BETA_READY remains unavailable.`,
];

const matrixColumns = [
  `Area`,
  `Evidence / input`,
  `Current state`,
  `Decision`,
  `Remaining risk`,
  `Next action`,
];

const matrixRows = [
  `Phase 23A research gate`,
  `Phase 23B UX/copy decision`,
  `Phase 23C backup health design`,
  `Phase 23D reminder/friction design`,
  `Phase 23E comprehension plan`,
  `Readiness for Phase 24A audit-only`,
  `Runtime readiness`,
  `Beta readiness`,
];

const forbiddenClaims = [
  `local-first hybrid beta ready`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup reminder is implemented`,
  `pre-risk-action friction is implemented`,
  `backup health tracking is implemented`,
  `last-backup tracking is implemented`,
  `platform backup will preserve user data`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
];

const forbiddenPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
const forbiddenFiles = [`package.json`, `package-lock.json`, `sw.js`];
const forbiddenPathPatterns = [
  /(^|\/)(runtime|import|storage|backup|restore)(\/|$)/i,
  /(^|\/)(fsrs|sync|cloud|account|auth|backend)(\/|$)/i,
  /(^|\/)(dependencies|telemetry|analytics)(\/|$)/i,
];
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

function fail(message) {
  console.error(`Phase 23F validation failed: ${message}`);
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

function countDecisionTokens(text) {
  return validDecisions.reduce((count, token) => count + (text.match(new RegExp(token, `g`)) || []).length, 0);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23e = `node scripts/validate-phase23e-data-survival-comprehension-plan.js`;
  const phase23f = `node scripts/validate-phase23f-phase23-decision-gate.js`;
  if (!workflow.includes(phase23f)) fail(`CI does not register Phase 23F validator`);
  if (workflow.indexOf(phase23f) <= workflow.indexOf(phase23e)) fail(`CI must register Phase 23F after Phase 23E`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of phase23fPaths) read(file);
  requireHeadings(DECISION_DOC, decisionHeadings);
  requireHeadings(MATRIX_DOC, matrixHeadings);

  for (const file of [DECISION_DOC, MATRIX_DOC]) {
    const text = read(file);
    if (countDecisionTokens(text) !== 1) fail(`${file} must contain exactly one valid Phase 23F decision token`);
    for (const token of phaseTokens) requireIncludes(file, text, token);
    requireIncludes(file, text, phase22hHold);
    for (const item of phase24Sequence) requireIncludes(file, text, item);
    for (const item of approvalBoundary) requireIncludes(file, text, item);
    for (const item of remainingBlockers) requireIncludes(file, text, item);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
    requireIncludes(file, text, nextPhaseLine);
    if (text.includes(passDecision)) {
      for (const constraint of passConstraints) requireIncludes(file, text, constraint);
    }
  }
}

function validateMatrix() {
  const text = read(MATRIX_DOC);
  const tableLines = text.split(/\r?\n/).filter(line => line.trim().startsWith(`|`) && line.includes(`|`));
  if (tableLines.length < matrixRows.length + 2) fail(`decision matrix table is missing or incomplete`);
  const header = tableLines[0];
  for (const column of matrixColumns) {
    if (!header.includes(column)) fail(`decision matrix is missing column: ${column}`);
  }
  for (const row of matrixRows) {
    if (!tableLines.some(line => line.includes(row))) fail(`decision matrix is missing row: ${row}`);
  }
}

function validateForbiddenClaims() {
  const combined = `${read(DECISION_DOC)}\n${read(MATRIX_DOC)}`;
  for (const claim of forbiddenClaims) {
    if (combined.includes(claim)) fail(`forbidden claim is present: ${claim}`);
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden area changed: ${file}`);
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file))) fail(`Forbidden path pattern changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }
}

function validateHistoricalForwardCompat() {
  const changed = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file !== VALIDATOR);
  for (const file of changed) {
    const text = read(file);
    for (const phase23fPath of phase23fPaths) {
      if (!text.includes(phase23fPath)) fail(`${file} is missing exact Phase 23F forward-compat path: ${phase23fPath}`);
    }
    for (const phase24aPath of phase24aForwardCompatPaths) {
      if (!text.includes(phase24aPath)) fail(`${file} is missing exact Phase 24A forward-compat path: ${phase24aPath}`);
    }
  }
}

function validateGeneratedArtifactsAbsent() {
  for (const file of lines(runGit(`git ls-files`))) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked: ${file}`);
    }
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be tracked: ${file}`);
  }
  for (const file of lines(runGit(`git ls-files --others --exclude-standard`))) {
    if (file.endsWith(`.log`)) {
      fail(`Generated artifact must not be present as untracked output: ${file}`);
    }
  }
}

validateWorkflow();
validateDocs();
validateMatrix();
validateForbiddenClaims();
validateChangedFiles();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 23F decision gate validation passed.`);
