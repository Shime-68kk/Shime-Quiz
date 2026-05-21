#!/usr/bin/env node
/**
 * Phase 25A static validator - backup/restore direction decision.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PLANNING_DOC = `docs/planning/phase25a-backup-restore-direction-decision.md`;
const RELEASE_DOC = `docs/release/phase25a-backup-restore-direction-summary.md`;
const VALIDATOR = `scripts/validate-phase25a-backup-restore-direction-decision.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  PLANNING_DOC,
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

const statusToken = `PHASE25A_BACKUP_RESTORE_DIRECTION_STATUS: COMPLETED_PLANNING_GATE`;
const decisionToken = `PHASE25A_BACKUP_RESTORE_DIRECTION_DECISION: PASS_TO_PHASE25B_BROADER_EVIDENCE_BEFORE_RUNTIME`;

const planningHeadings = [
  `# Phase 25A — Backup/Restore Direction Decision`,
  `## Status token`,
  `## Direction decision`,
  `## Scope`,
  `## Options compared`,
  `## Why Option A is safest`,
  `## Not approved`,
  `## Phase 25B outline`,
  `## Rollback plan`,
  `## Next recommended phase`,
];

const releaseHeadings = [
  `# Phase 25A — Backup/Restore Direction Summary`,
  `## Status token`,
  `## Direction decision`,
  `## Scope`,
  `## Options compared`,
  `## Why Option A is safest`,
  `## Not approved`,
  `## Phase 25B outline`,
  `## Rollback plan`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 25A is docs/planning/static-validator/CI-only.`,
  `Phase 25A does not change runtime behavior.`,
  `Phase 25A does not modify Phase 24E scaffold behavior.`,
  `Phase 25A does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 25A merge-blocking requirement.`,
];

const options = [
  `Option A: Broader backup/restore manual evidence`,
  `Option B: Backup health UX planning`,
  `Option C: Production adapter-aware backup/restore design gate`,
  `Option D: Local data survival / recovery UX refinement`,
  `Option A first: Broader backup/restore manual evidence before runtime.`,
];

const safestReasons = [
  `Phase 24G-B evidence is limited to a single local Chromium manual smoke run.`,
  `Broader evidence should come before production backup/restore runtime changes.`,
  `This avoids converting limited evidence into broad reliability claims.`,
  `This keeps local-first/no-cloud/default-off identity intact.`,
];

const notApproved = [
  `Phase 25A does not approve:`,
  `- production adapter-aware backup/export/restore`,
  `- backup file format changes`,
  `- restore overwrite behavior changes`,
  `- IndexedDB production storage`,
  `- storage migration`,
  `- sync/cloud/account/auth/backend`,
  `- BETA_READY`,
  `- guaranteed data-loss prevention`,
  `- platform backup preservation claims`,
];

const phase25bOutline = [
  `Phase 25B — Broader Backup/Restore Manual Evidence Run Pack`,
  `- create a browser/device/manual evidence matrix`,
  `- require generated/test data only`,
  `- preserve current backup/export/restore behavior`,
  `- include Chromium/Chrome desktop if available`,
  `- include Firefox or another browser if available`,
  `- include mobile-ish viewport if available`,
  `- include backup/export, restore/import, reload-after-restore, and no-new-claim checks`,
  `- do not claim broad reliability`,
  `- do not approve runtime changes`,
];

const rollbackPlan = [
  `Remove docs/planning/phase25a-backup-restore-direction-decision.md.`,
  `Remove docs/release/phase25a-backup-restore-direction-summary.md.`,
  `Remove scripts/validate-phase25a-backup-restore-direction-decision.js.`,
  `Remove Phase 25A CI registration.`,
  `No learner data migration or cleanup is required because Phase 25A changes no runtime behavior.`,
];

const nextPhase = [
  `Next recommended phase: Phase 25B — Broader Backup/Restore Manual Evidence Run Pack`,
  `Phase 25B is a separate evidence planning gate.`,
  `Phase 25A does not approve production adapter-aware backup/export/restore.`,
];

function fail(message) {
  console.error(`Phase 25A validation failed: ${message}`);
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
  const phase25a = `node scripts/validate-phase25a-backup-restore-direction-decision.js`;
  const historicalValidators = [
    `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
    `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`,
    `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`,
    `node scripts/validate-phase24g-manual-smoke-run-pack.js`,
    `node scripts/validate-phase24g-b-manual-smoke-evidence.js`,
    `node scripts/validate-phase24h-phase24-closure-phase25-planning-gate.js`,
  ];

  if (!runLines.includes(phase25a)) fail(`CI must run the Phase 25A validator as the current-phase gate`);
  for (const historical of historicalValidators) {
    if (runLines.includes(historical)) fail(`CI must not run historical validator as a Phase 25A merge-blocking gate: ${historical}`);
  }
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [PLANNING_DOC, RELEASE_DOC, VALIDATOR]) read(file);
  requireHeadings(PLANNING_DOC, planningHeadings);
  requireHeadings(RELEASE_DOC, releaseHeadings);

  for (const file of [PLANNING_DOC, RELEASE_DOC]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, decisionToken);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const option of options) requireIncludes(file, text, option);
    for (const reason of safestReasons) requireIncludes(file, text, reason);
    for (const item of notApproved) requireIncludes(file, text, item);
    for (const line of phase25bOutline) requireIncludes(file, text, line);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of nextPhase) requireIncludes(file, text, line);
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
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 25A backup/restore direction decision validation passed.`);
