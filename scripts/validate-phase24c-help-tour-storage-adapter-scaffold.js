#!/usr/bin/env node
/**
 * Phase 24C static validator - Help Tour StorageAdapter scaffold.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESEARCH_DOC = `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`;
const RELEASE_SUMMARY = `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`;
const HELPER = `src/ui/helpTourStorage.js`;
const HELP_TOUR = `src/ui/helpTour.js`;
const TEST = `tests/unit/helpTourStorageAdapterScaffold.test.js`;
const VALIDATOR = `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const statusToken = `PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD`;
const phase24bToken = `PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES`;
const phase24cPaths = [HELPER, HELP_TOUR, TEST, RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase24dForwardCompatPaths = [
  `docs/research/phase24d-backup-export-restore-adapter-awareness-design.md`,
  `docs/release/phase24d-backup-export-restore-adapter-awareness-summary.md`,
  `scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`,
];
const allowedChanged = new Set([HELP_TOUR, WORKFLOW, ...phase24cPaths, ...phase24dForwardCompatPaths]);

const researchHeadings = [
  `# Phase 24C — Help Tour StorageAdapter Scaffold`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Selected low-risk boundary`,
  `## Implementation summary`,
  `## Files changed`,
  `## Rollback plan`,
  `## Evidence plan`,
  `## Validation results`,
  `## What Phase 24C can claim`,
  `## What Phase 24C must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24C — Help Tour StorageAdapter Scaffold Summary`,
  `## Status token`,
  `## Scope`,
  `## Runtime summary`,
  `## Rollback plan`,
  `## Evidence plan`,
  `## What Phase 24C can claim`,
  `## What Phase 24C must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 24C implements one low-risk Help Tour completion flag StorageAdapter scaffold.`,
  `Phase 24C does not change the default storage driver.`,
  `Phase 24C does not migrate data.`,
  `Phase 24C does not implement IndexedDB.`,
  `Phase 24C does not touch backup/export/restore runtime.`,
  `Phase 24C does not make backup/export/restore adapter-aware.`,
  `Phase 24C does not change learner data persistence.`,
  `Phase 24C does not change scheduler or FSRS runtime behavior.`,
  `Phase 24C does not add sync, cloud, account, auth, or backend behavior.`,
  `Phase 24C does not make Shime BETA_READY.`,
];

const rollbackPlan = [
  `Revert src/ui/helpTour.js to direct Help Tour completion flag persistence.`,
  `Remove src/ui/helpTourStorage.js.`,
  `Remove tests/unit/helpTourStorageAdapterScaffold.test.js.`,
  `Keep the storage key shime_tour_done unchanged during rollback.`,
  `No learner data migration or cleanup is required because the same key and default LocalStorageAdapter are used.`,
];

const evidencePlan = [
  `Unit test the helper with an in-memory StorageAdapter.`,
  `Run Phase 24B validator.`,
  `Run Phase 24C validator.`,
  `Run full scripts/validate-*.js chain.`,
  `Run npm ci.`,
  `Run npm run build.`,
  `Run npm run test:unit.`,
  `Optional local browser smoke: Help Tour can be dismissed and does not re-open after reload with the same local storage.`,
];

const allowedClaims = [
  `One low-risk Help Tour completion flag now uses the active StorageAdapter.`,
  `The production default remains LocalStorageAdapter.`,
  `The shime_tour_done key remains unchanged.`,
  `No data migration was performed.`,
  `Backup/export/restore remains gated.`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `production IndexedDB storage exists`,
  `StorageAdapter expansion broadly implemented`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
  `Phase 24D through 24F are automatically approved`,
  `runtime storage changes are broadly approved`,
  `IndexedDB pilot is approved`,
  `backup/restore adapter-awareness runtime work is approved`,
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
  `src/state/`,
  `src/storage/`,
  `src/data/`,
  `src/quiz/`,
  `src/components/`,
  `src/routes/`,
  `tests/unit/helpers/`,
  `e2e/`,
  `docs/adr/`,
];

const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
  `src/ui/theme.js`,
  `src/state/reviewScheduleStorage.js`,
  `src/state/settingsStorage.js`,
  `src/state/studyDraftStorage.js`,
  `src/state/studyGoalStorage.js`,
  `src/state/studyHistoryStorage.js`,
  `src/state/studyPlanProgressStorage.js`,
  `src/state/v2BackupRestore.js`,
];

function fail(message) {
  console.error(`Phase 24C validation failed: ${message}`);
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

function withoutMustNotSections(text) {
  return text
    .replace(/## What Phase 24C must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bnot approved\b|\bnot automatically approved\b|\bremains gated\b/i.test(line))
    .join(`\n`);
}

function validateDocs() {
  for (const file of phase24cPaths) read(file);
  requireHeadings(RESEARCH_DOC, researchHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, phase24bToken);
    for (const statement of positioningStatements) requireIncludes(file, text, statement);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const line of evidencePlan) requireIncludes(file, text, line);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
    requireIncludes(file, text, `Next recommended phase: Phase 24D — Backup/Export/Restore Adapter-Awareness Design Gate`);
    requireIncludes(file, text, `Phase 24D is a separate design gate.`);
    requireIncludes(file, text, `Phase 24C does not approve adapter-aware backup/export/restore runtime work.`);
  }
}

function validateForbiddenClaims() {
  const text = `${read(RESEARCH_DOC)}\n${read(RELEASE_SUMMARY)}`;
  const mustNotSections = text.match(/## What Phase 24C must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || ``;
  for (const claim of forbiddenClaims) {
    if (!mustNotSections.includes(claim)) fail(`must-not-claim sections must include: ${claim}`);
  }
  const outsideMustNot = withoutMustNotSections(text);
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
  }
}

function validateRuntime() {
  const helpTour = read(HELP_TOUR);
  if (/localStorage\s*\.\s*getItem/.test(helpTour)) fail(`${HELP_TOUR} must not directly call localStorage.getItem`);
  if (/localStorage\s*\.\s*setItem/.test(helpTour)) fail(`${HELP_TOUR} must not directly call localStorage.setItem`);
  requireIncludes(HELP_TOUR, helpTour, `readHelpTourDone`);
  requireIncludes(HELP_TOUR, helpTour, `markHelpTourDone`);

  const helper = read(HELPER);
  requireIncludes(HELPER, helper, `getStorageAdapter`);
  if (!/HELP_TOUR_DONE_STORAGE_KEY\s*=\s*["']shime_tour_done["']/.test(helper)) {
    fail(`${HELPER} must export HELP_TOUR_DONE_STORAGE_KEY as shime_tour_done`);
  }
  requireIncludes(HELPER, helper, `readHelpTourDone`);
  requireIncludes(HELPER, helper, `markHelpTourDone`);
  if (/indexedDB|IndexedDB/.test(helper)) fail(`${HELPER} must not reference IndexedDB`);
  if (/localStorage\s*\.\s*(getItem|setItem|removeItem)/.test(helper)) fail(`${HELPER} must not directly call localStorage`);

  const test = read(TEST);
  requireIncludes(TEST, test, `setStorageAdapterForTests`);
  requireIncludes(TEST, test, `resetStorageAdapterForTests`);
  requireIncludes(TEST, test, `shime_tour_done`);
  requireIncludes(TEST, test, `MemoryAdapter`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24b = `node scripts/validate-phase24b-storage-adapter-boundary-decision.js`;
  const phase24c = `node scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`;
  if (!workflow.includes(phase24c)) fail(`CI does not register Phase 24C validator`);
  if (workflow.indexOf(phase24c) <= workflow.indexOf(phase24b)) fail(`CI must register Phase 24C after Phase 24B`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }

  const runtimeFiles = changed.filter(file => file.startsWith(`src/`) && file !== HELPER && file !== HELP_TOUR);
  if (runtimeFiles.length) fail(`Runtime files outside Help Tour scope changed: ${runtimeFiles.join(`, `)}`);
}

function validateHistoricalForwardCompatEntries() {
  const historicalFiles = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file !== VALIDATOR);
  for (const file of historicalFiles) {
    const diff = runGit(`git diff -- ${file}`);
    if (!diff) continue;
    const isPhase24dForwardCompat = phase24dForwardCompatPaths.some(path => diff.includes(path));
    const requiredForwardCompatPaths = isPhase24dForwardCompat ? phase24dForwardCompatPaths : phase24cPaths;
    for (const forwardCompatPath of requiredForwardCompatPaths) {
      if (!diff.includes(forwardCompatPath)) fail(`${file} missing exact ${isPhase24dForwardCompat ? `Phase 24D` : `Phase 24C`} forward-compat path: ${forwardCompatPath}`);
    }
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      if (line.includes(`if (/^`)) continue;
      if (line.includes(`line.includes(\`/^`)) continue;
      if (line.includes(`line.includes(\`line.includes`)) continue;
      const isPathEntry = phase24cPaths.some(path => line.includes(path)) || phase24dForwardCompatPaths.some(path => line.includes(path));
      const isCompatName = line.includes(`phase24cForwardCompatPaths`) || line.includes(`phase24cPaths`) || line.includes(`phase24dForwardCompatPaths`);
      const isCompatSpread = line.includes(`...phase24cForwardCompatPaths`) || line.includes(`...phase24dForwardCompatPaths`);
      const isCompatGuard = line.includes(`isPhase24c`) || line.includes(`phase24cPath`) || line.includes(`isPhase24d`) || line.includes(`phase24dPath`) || line.includes(`requiredForwardCompatPaths`) || line.includes(`AllowedChangedFiles.has(file)`) || line.includes(`allowedChangedFiles.has(file)`) || line.includes(`allowedChanged.has(file)`);
      const isCompatMessage = line.includes(`Phase 24C forward-compat path`) || line.includes(`Phase 24C forward-compat entries`) || line.includes(`Phase 24D forward-compat path`) || line.includes(`Phase 24D forward-compat entries`) || line.includes(`non-forward-compat addition`) || line.includes(`forward-compat`);
      if (!isPathEntry && !isCompatName && !isCompatSpread && !isCompatGuard && !isCompatMessage) {
        fail(`${file} contains non-forward-compat addition: ${line}`);
      }
      if (/src\/ui\/\*\*|tests\/unit\/\*\*|docs\/research\/\*\*|docs\/release\/\*\*/.test(line)) {
        fail(`${file} contains a folder-wide forward-compat allowlist entry: ${line}`);
      }
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
    if (file === `FETCH_HEAD` || file === `.env` || file === `.env.local` || file.endsWith(`.log`)) {
      fail(`Generated artifact must not be present as untracked output: ${file}`);
    }
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateRuntime();
validateChangedFiles();
validateHistoricalForwardCompatEntries();
validateGeneratedArtifactsAbsent();

console.log(`Phase 24C Help Tour StorageAdapter scaffold validation passed.`);
