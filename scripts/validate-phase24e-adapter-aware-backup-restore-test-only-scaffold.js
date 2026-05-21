#!/usr/bin/env node
/**
 * Phase 24E static validator - adapter-aware backup/restore test-only scaffold.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const IMPLEMENTATION = `src/state/adapterAwareBackupRestoreTestScaffold.js`;
const TEST = `tests/unit/adapterAwareBackupRestoreTestScaffold.test.js`;
const RESEARCH_DOC = `docs/research/phase24e-adapter-aware-backup-restore-test-only-scaffold.md`;
const RELEASE_SUMMARY = `docs/release/phase24e-adapter-aware-backup-restore-test-only-scaffold-summary.md`;
const VALIDATOR = `scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([
  IMPLEMENTATION,
  TEST,
  RESEARCH_DOC,
  RELEASE_SUMMARY,
  VALIDATOR,
  WORKFLOW
]);

const statusToken = `PHASE24E_ADAPTER_AWARE_BACKUP_RESTORE_SCAFFOLD_STATUS: COMPLETED_TEST_ONLY_SCAFFOLD`;
const phase24dToken = `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`;
const phase24dHf2Token = `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`;

const researchHeadings = [
  `# Phase 24E — Adapter-Aware Backup/Export/Restore Test-Only Scaffold`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Test-only scaffold summary`,
  `## Implementation boundary`,
  `## Rollback plan`,
  `## Evidence plan`,
  `## Validation results`,
  `## What Phase 24E can claim`,
  `## What Phase 24E must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24E — Adapter-Aware Backup/Export/Restore Test-Only Scaffold Summary`,
  `## Status token`,
  `## Scope`,
  `## Runtime summary`,
  `## Rollback plan`,
  `## Evidence plan`,
  `## What Phase 24E can claim`,
  `## What Phase 24E must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const requiredStatements = [
  `Phase 24E is test-only/default-off scaffold.`,
  `Production backup/export/restore behavior is unchanged.`,
  `Backup file format is unchanged.`,
  `Restore overwrite behavior is unchanged.`,
  `Current localStorage backup compatibility is unchanged.`,
  `Default storage driver is unchanged.`,
  `No IndexedDB.`,
  `No storage migration.`,
  `No sync/cloud/account/auth/backend.`,
  `No BETA_READY.`,
  `Phase 24D-HF2 is the current CI strategy baseline.`,
  `Historical full-chain validators remain manual/local/scheduled audit guidance.`,
  `Phase 24E does not modify historical validators.`,
];

const rollbackPlan = [
  `Remove src/state/adapterAwareBackupRestoreTestScaffold.js.`,
  `Remove tests/unit/adapterAwareBackupRestoreTestScaffold.test.js.`,
  `Remove Phase 24E docs and validator.`,
  `Remove Phase 24E CI registration.`,
  `No learner data migration or cleanup is required because Phase 24E uses only test-only scaffold code and phase24e_test_ keys in tests.`,
  `Production backup/export/restore behavior remains unchanged.`,
];

const evidencePlan = [
  `Run npm ci.`,
  `Run the targeted Phase 24E scaffold unit test.`,
  `Run the Phase 24E validator.`,
  `Run npm run build.`,
  `Run npm run test:unit.`,
  `Run patch apply check against clean origin/main.`,
  `Require strict reviewer before push/PR.`,
  `Require tester/local validation before merge.`,
  `Do not use the full historical scripts/validate-*.js chain as a merge-blocking Phase 24E requirement.`,
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
  `src/storage/`,
  `src/ui/`,
  `src/components/`,
  `src/routes/`,
  `src/quiz/`,
  `tests/e2e/`,
  `e2e/`,
  `docs/adr/`,
];

const forbiddenTouchedFiles = [
  `src/state/v2BackupRestore.js`,
  `src/state/reviewScheduleStorage.js`,
  `src/state/settingsStorage.js`,
  `src/state/studyDraftStorage.js`,
  `src/state/studyGoalStorage.js`,
  `src/state/studyHistoryStorage.js`,
  `src/state/studyPlanProgressStorage.js`,
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `scripts/register-phase-forward-compat.js`,
  `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
  `scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`,
];

function fail(message) {
  console.error(`Phase 24E validation failed: ${message}`);
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

function requireRegex(file, text, pattern, message) {
  if (!pattern.test(text)) fail(`${file} ${message}`);
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) requireIncludes(file, text, heading);
}

function section(file, text, heading) {
  return text.match(new RegExp(`${heading.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)}[\\s\\S]*?(?=\\n## |$)`))?.[0] || fail(`${file} is missing section: ${heading}`);
}

function withoutMustNotSections(text) {
  return text
    .replace(/## What Phase 24E must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bNo \b|\bunchanged\b|\bnot approve\b/i.test(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24e = `node scripts/validate-phase24e-adapter-aware-backup-restore-test-only-scaffold.js`;
  const phase24dHf2 = `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
  const phase24dHf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;

  requireIncludes(WORKFLOW, workflow, phase24e);
  if (workflow.includes(phase24dHf1)) fail(`CI must not register Phase 24D-HF1 validator`);
  if (new RegExp(`run:\\s*${phase24dHf2.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)}`).test(workflow)) {
    fail(`CI must not run Phase 24D-HF2 validator as the Phase 24E merge-blocking gate`);
  }
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default PR blocker`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [IMPLEMENTATION, TEST, RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(RESEARCH_DOC, researchHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, phase24dToken);
    requireIncludes(file, text, phase24dHf2Token);
    for (const statement of requiredStatements) requireIncludes(file, text, statement);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of evidencePlan) requireIncludes(file, text, line);
    requireIncludes(file, text, `Next recommended phase: Phase 24F — Regression Evidence After Adapter Changes`);
    requireIncludes(file, text, `Phase 24F is a separate evidence gate.`);
    requireIncludes(file, text, `Phase 24E does not approve production adapter-aware backup/export/restore.`);
  }
}

function validateForbiddenClaims() {
  const text = `${read(RESEARCH_DOC)}\n${read(RELEASE_SUMMARY)}`;
  const mustNotSections = text.match(/## What Phase 24E must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || ``;
  for (const claim of forbiddenClaims) requireIncludes(`Phase 24E docs must-not sections`, mustNotSections, claim);
  const outsideMustNot = withoutMustNotSections(text);
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
  }
}

function validateImplementation() {
  const source = read(IMPLEMENTATION);
  requireIncludes(IMPLEMENTATION, source, `import { getStorageAdapter } from '../storage/storageAdapterRegistry.js'`);
  requireRegex(IMPLEMENTATION, source, /test-only\/scaffold-only|test-only scaffold/i, `must contain test-only/scaffold-only wording`);
  for (const exportedName of [
    `PHASE24E_TEST_BACKUP_SCHEMA_VERSION`,
    `createAdapterAwareBackupTestSnapshot`,
    `previewAdapterAwareRestoreTestSnapshot`,
    `restoreAdapterAwareBackupTestSnapshot`,
  ]) {
    requireRegex(IMPLEMENTATION, source, new RegExp(`export\\s+(const|function)\\s+${exportedName}\\b`), `must export ${exportedName}`);
  }
  for (const field of [`schemaVersion`, `createdAt`, `testOnly`, `adapterBoundary`, `entries`]) {
    requireIncludes(IMPLEMENTATION, source, field);
  }
  requireIncludes(IMPLEMENTATION, source, `confirmOverwrite`);
  requireIncludes(IMPLEMENTATION, source, `dryRun`);
  if (/localStorage\s*\.\s*(getItem|setItem|removeItem)/.test(source)) fail(`${IMPLEMENTATION} must not directly call localStorage`);
}

function validateTests() {
  const test = read(TEST);
  requireIncludes(TEST, test, `setStorageAdapterForTests`);
  requireIncludes(TEST, test, `resetStorageAdapterForTests`);
  requireIncludes(TEST, test, `phase24e_test_`);
  for (const term of [`dryRun`, `confirmOverwrite`, `corrupt`, `verification`, `same-adapter round trip`, `Throwing`]) {
    requireIncludes(TEST, test, term);
  }
}

function validateNoProductionImports() {
  const output = runGit(`git grep -n "adapterAwareBackupRestoreTestScaffold" -- src ":!${IMPLEMENTATION}"`);
  if (output) fail(`production source must not import or reference the test scaffold:\n${output}`);
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix)) && file !== IMPLEMENTATION) fail(`Forbidden path changed: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }
}

function validateHistoricalValidatorsUnchanged() {
  const changed = changedFiles();
  for (const file of changed) {
    if (file.startsWith(`scripts/validate-`) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
  }
}

function validateNoBroadAllowlists() {
  const validator = read(VALIDATOR);
  if (/allowedChanged\s*=\s*new Set\(\[\s*\]\)/.test(validator)) fail(`validator must not use an empty broad allowlist`);
  if (/startsWith\(`src\/`\).*allowed/i.test(validator)) fail(`validator must not broadly allow src/`);
}

function validateGeneratedArtifactsAbsent() {
  for (const artifact of generatedArtifacts) {
    if (artifact === `node_modules`) continue;
    if (fs.existsSync(artifact)) fail(`Generated artifact present: ${artifact}`);
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateImplementation();
validateTests();
validateNoProductionImports();
validateChangedFiles();
validateHistoricalValidatorsUnchanged();
validateNoBroadAllowlists();
validateGeneratedArtifactsAbsent();

console.log(`Phase 24E adapter-aware backup/restore test-only scaffold validation passed.`);
