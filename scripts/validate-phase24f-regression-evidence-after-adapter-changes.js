#!/usr/bin/env node
/**
 * Phase 24F static validator - regression evidence after Phase 24E adapter changes.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const TESTING_DOC = `docs/testing/phase24f-regression-evidence-after-adapter-changes.md`;
const RELEASE_SUMMARY = `docs/release/phase24f-regression-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;
const PHASE24E_IMPLEMENTATION = `src/state/adapterAwareBackupRestoreTestScaffold.js`;
const PHASE24E_TEST = `tests/unit/adapterAwareBackupRestoreTestScaffold.test.js`;

const allowedChanged = new Set([
  TESTING_DOC,
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
];

const productionBackupRestoreFiles = [
  `src/components/learning/BackupBeforeImportNotice.jsx`,
  `src/components/learning/V2BackupRestorePanel.jsx`,
  `src/quiz/dataBackup.js`,
  `src/state/v2BackupRestore.js`,
  `src/ui/dataBackupPanel.js`,
];

const statusToken = `PHASE24F_REGRESSION_EVIDENCE_AFTER_ADAPTER_CHANGES_STATUS: COMPLETED_EVIDENCE_GATE`;
const phase24dToken = `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`;
const phase24dHf2Token = `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`;
const phase24eToken = `PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD`;

const testingHeadings = [
  `# Phase 24F — Regression Evidence After Adapter Changes`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Evidence summary`,
  `## Command evidence`,
  `## Static guardrail evidence`,
  `## Browser/manual smoke`,
  `## Rollback plan`,
  `## What Phase 24F can claim`,
  `## What Phase 24F must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24F — Regression Evidence Summary`,
  `## Status token`,
  `## Scope`,
  `## Evidence summary`,
  `## Validation summary`,
  `## Rollback plan`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24F is evidence/docs/static-validator/CI-only.`,
  `Phase 24F does not change runtime behavior.`,
  `Phase 24F does not modify Phase 24E scaffold behavior.`,
  `Phase 24F does not implement production adapter-aware backup/export/restore.`,
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
  `Full historical scripts/validate-*.js chain is not used as a Phase 24F merge-blocking requirement.`,
];

const evidenceTerms = [
  `npm ci`,
  `Phase 24E targeted unit test`,
  `Phase 24E validator`,
  `Phase 24F validator`,
  `npm run build`,
  `npm run test:unit`,
  `patch apply check against clean origin/main`,
  `changed-files scope check`,
  `production import scan for adapterAwareBackupRestoreTestScaffold`,
  `production backup/restore module unchanged check`,
];

const rollbackPlan = [
  `Remove docs/testing/phase24f-regression-evidence-after-adapter-changes.md.`,
  `Remove docs/release/phase24f-regression-evidence-summary.md.`,
  `Remove scripts/validate-phase24f-regression-evidence-after-adapter-changes.js.`,
  `Remove Phase 24F CI registration.`,
  `No learner data migration or cleanup is required because Phase 24F changes no runtime behavior.`,
];

const forbiddenClaims = [
  `BETA_READY`,
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
  console.error(`Phase 24F validation failed: ${message}`);
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

function escaped(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}

function workflowRunLines(workflow) {
  return workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith(`run:`))
    .map(line => line.replace(/^run:\s*/, ``));
}

function withoutMustNotSections(text) {
  return text
    .replace(/## What Phase 24F must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bNo \b|\bunchanged\b|\bnot approve\b/i.test(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const runLines = workflowRunLines(workflow);
  const phase24f = `node scripts/validate-phase24f-regression-evidence-after-adapter-changes.js`;
  const phase24dHf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;
  const phase24dHf2 = `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
  const phase24e = `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`;

  if (!runLines.includes(phase24f)) fail(`CI must run the Phase 24F validator as the current-phase gate`);
  if (workflow.includes(phase24dHf1)) fail(`CI must not register Phase 24D-HF1 validator`);
  if (runLines.includes(phase24dHf2)) fail(`CI must not run Phase 24D-HF2 validator as a Phase 24F merge-blocking gate`);
  if (runLines.includes(phase24e)) fail(`CI must not run Phase 24E validator as a Phase 24F merge-blocking gate`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [TESTING_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(TESTING_DOC, testingHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [TESTING_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, phase24dToken);
    requireIncludes(file, text, phase24dHf2Token);
    requireIncludes(file, text, phase24eToken);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const term of evidenceTerms) requireIncludes(file, text, term);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    requireIncludes(file, text, `Next recommended phase: Phase 24G — Backup/Restore Manual Smoke Evidence or Phase 25A Planning Gate`);
    requireIncludes(file, text, `Phase 24G/25A is a separate gate.`);
    requireIncludes(file, text, `Phase 24F does not approve production adapter-aware backup/export/restore.`);
  }

  requireIncludes(TESTING_DOC, read(TESTING_DOC), `Browser/manual smoke was not run in this phase.`);
}

function validateForbiddenClaims() {
  const text = `${read(TESTING_DOC)}\n${read(RELEASE_SUMMARY)}`;
  const mustNotSections = text.match(/## What Phase 24F must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || ``;
  for (const claim of forbiddenClaims) requireIncludes(`Phase 24F docs must-not sections`, mustNotSections, claim);

  const outsideMustNot = withoutMustNotSections(text);
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
  }
}

function validatePhase24EScaffoldBoundary() {
  const implementation = read(PHASE24E_IMPLEMENTATION);
  requireIncludes(PHASE24E_IMPLEMENTATION, implementation, `test-only/scaffold-only`);
  requireIncludes(PHASE24E_IMPLEMENTATION, implementation, `getStorageAdapter`);

  const productionReferences = runGit(`git grep -n "adapterAwareBackupRestoreTestScaffold" -- src ":!${PHASE24E_IMPLEMENTATION}"`);
  if (productionReferences) fail(`production source must not import or reference the Phase 24E test scaffold:\n${productionReferences}`);

  const test = read(PHASE24E_TEST);
  requireIncludes(PHASE24E_TEST, test, `phase24e_test_`);
  const keyConstants = [...test.matchAll(/const\s+KEY_[A-Z0-9_]+\s*=\s*['"`]([^'"`]+)['"`]/g)]
    .map(match => match[1]);
  if (keyConstants.length === 0) fail(`${PHASE24E_TEST} must define explicit scaffold test keys`);
  const invalidKeys = keyConstants.filter(key => !key.startsWith(`phase24e_test_`));
  if (invalidKeys.length > 0) fail(`${PHASE24E_TEST} contains non-phase24e_test_ scaffold keys: ${invalidKeys.join(`, `)}`);
  if (/localStorage\s*\./.test(test)) fail(`${PHASE24E_TEST} must not use localStorage directly`);
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
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validatePhase24EScaffoldBoundary();
validateChangedFiles();
validateProductionBackupRestoreUnchanged();
validateNoBroadAllowlists();

console.log(`Phase 24F regression evidence after adapter changes validation passed.`);
