#!/usr/bin/env node
/**
 * scripts/validate-phase21c-stress-testing-filled-results.js
 *
 * Phase 21C static validator — Stress Testing Filled Results.
 *
 * Phase 21C is docs/static-validator/CI-only. It does not implement runtime
 * behavior, tests, e2e, dependencies, telemetry, analytics, import/storage/
 * backup/FSRS/sync runtime changes, cloud/account/auth/backend, or service
 * worker behavior.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const FILLED_RESULTS_FILE = `docs/testing/phase21c-stress-testing-filled-results.md`;
const EVIDENCE_SUMMARY_FILE = `docs/release/phase21c-stress-testing-filled-evidence-summary.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase21c-stress-testing-filled-results.js`;
const WORKFLOW_FILE = `.github/workflows/e2e-smoke.yml`;

const PHASE21A_RUN_PACK = `docs/testing/phase21a-manual-evidence-execution-run-pack.md`;
const PHASE21A_CHECKLIST = `docs/release/phase21a-evidence-execution-safety-checklist.md`;
const PHASE21B_RESULTS = `docs/testing/phase21b-real-user-testing-filled-results.md`;
const PHASE21B_SUMMARY = `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`;
const PHASE20I_RESULTS = `docs/testing/phase20i-performance-quota-import-stress-execution-results.md`;
const PHASE20I_SUMMARY = `docs/release/phase20i-performance-quota-import-stress-evidence-summary.md`;
const PHASE20J_ADR = `docs/adr/phase20j-final-beta-readiness-redecision.md`;
const PHASE20J_SUMMARY = `docs/release/phase20j-final-beta-readiness-evidence-summary.md`;

const phase21cForwardCompatEntries = [
  FILLED_RESULTS_FILE,
  EVIDENCE_SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
];

const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `test-results`,
  `playwright-report`,
  `coverage`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
  `.git`,
  `phase21c-stress-testing-filled-results.patch`,
  `phase21c-stress-testing-filled-results.zip`,
  `phase21c-stress-testing-filled-results-handoff.md`,
];

const requiredFilledResultsHeadings = [
  `# Phase 21C — Stress Testing Filled Results`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 21A`,
  `## Relationship to Phase 21B`,
  `## Relationship to Phase 20I`,
  `## Relationship to Phase 20J`,
  `## Evidence source rules`,
  `## Data safety rules`,
  `## Filled stress run count`,
  `## Filled stress result schema`,
  `## Small data set filled result`,
  `## Medium data set filled result`,
  `## Large data set filled result`,
  `## Startup responsiveness findings`,
  `## Dashboard today plan findings`,
  `## Study Room findings`,
  `## Import findings`,
  `## Storage quota findings`,
  `## Backup and restore findings`,
  `## Manual transfer findings`,
  `## Mobile/PWA findings`,
  `## FSRS and review schedule findings`,
  `## EduGen Draft Workshop boundary findings`,
  `## beta-ai naming findings`,
  `## Evidence completeness assessment`,
  `## Observed pass signals`,
  `## Observed hold signals`,
  `## Claim boundaries`,
  `## Phase 21D handoff`,
];

const requiredSummaryHeadings = [
  `# Phase 21C — Stress Testing Filled Evidence Summary`,
  `## Purpose`,
  `## Evidence status`,
  `## Filled stress runs`,
  `## Evidence quality`,
  `## What was validated`,
  `## What was not validated`,
  `## Pass signals`,
  `## Hold signals`,
  `## Performance assessment`,
  `## Storage quota assessment`,
  `## Import assessment`,
  `## Backup and restore assessment`,
  `## Manual transfer assessment`,
  `## Mobile/PWA assessment`,
  `## FSRS and review schedule assessment`,
  `## EduGen Draft Workshop boundary assessment`,
  `## beta-ai naming assessment`,
  `## Remaining evidence gaps`,
  `## Recommendation`,
  `## Phase 21B relationship`,
  `## Phase 21D readiness gate`,
];

const requiredStatusToken =
  `PERFORMANCE_STRESS_FILLED_RESULTS_STATUS: FILLED_RESULTS_DOCUMENT_READY`;
const requiredRunCountToken = `PERFORMANCE_STRESS_FILLED_RUNS: 0`;
const requiredHoldToken =
  `LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED`;

const requiredScenarioTerms = [
  `small data set`,
  `medium data set`,
  `large data set`,
  `app startup`,
  `Dashboard today plan`,
  `Study Room session`,
  `due cards / review schedule count`,
  `JSON import`,
  `CSV import`,
  `text/markdown import`,
  `EduGen Draft Workshop import boundary`,
  `storage quota estimate`,
  `large import warning`,
  `backup before risky action`,
  `restore from backup`,
  `repeated backup/restore rehearsal`,
  `manual export/import transfer`,
  `mobile viewport`,
  `PWA/service-worker cache boundary`,
  `FSRS experimental/off/default boundary`,
  `beta-ai naming absence`,
  `backup is not sync`,
  `restore may overwrite current data`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
];

const requiredSafetyTerms = [
  `Phase 21C records filled performance/quota/import stress testing results`,
  `Results must be based only on actual manual/user-provided evidence`,
  `PERFORMANCE_STRESS_FILLED_RUNS: 0`,
  `No telemetry is collected`,
  `No analytics are added`,
  `No runtime instrumentation is added`,
  `No runtime stress harness is added`,
  `Testers should use generated/duplicate/test data where possible`,
  `Backup should be created before risky`,
  `HOLD remains active`,
  `BETA_READY is not claimed in Phase 21C`,
  `Phase 21D must not reconsider BETA_READY unless`,
];

const forbiddenPositiveClaims = [
  `stress testing is complete`,
  `real user testing is complete`,
  `local-first hybrid beta is ready`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync is ready`,
  `production IndexedDB storage exists`,
  `storage migration is complete`,
  `backup/export is adapter-aware`,
  `restore is adapter-aware`,
  `data-loss prevention is guaranteed`,
  `built-in AI exists`,
  `AI quiz generation exists`,
  `OCR exists`,
  `beta-ai is acceptable public naming`,
];

const runtimeFilePrefixes = [
  `src/`,
  `tests/`,
  `e2e/`,
  `src/data/`,
  `src/quiz/`,
  `src/storage/`,
  `src/state/`,
  `src/scheduler/`,
  `src/sync/`,
  `src/cloud/`,
  `src/account/`,
  `src/auth/`,
  `src/backend/`,
  `src/ui/`,
];

const runtimeSpecificFiles = [
  `sw.js`,
  `package.json`,
  `package-lock.json`,
  `src/scheduler/fsrsAdapter.js`,
  `src/scheduler/fsrsScheduler.js`,
  `src/scheduler/fsrsEnrollment.js`,
  `src/state/fsrsMetadata.js`,
  `src/ui/FsrsExperimentalSettingsPanel.js`,
  `src/quiz/reviewSchedulerAdapter.js`,
  `src/storage/IndexedDBAdapter.js`,
  `src/storage/EventLog.js`,
  `src/storage/MigrationJournal.js`,
  `src/storage/SyncAdapter.js`,
  `src/storage/migrationJournal.js`,
  `src/storage/migrationRunner.js`,
  `src/storage/migrationManifest.js`,
  `src/storage/migrationRegistry.js`,
  `src/storage/backupCoverageMap.js`,
  `src/storage/StorageAdapter.js`,
  `src/storage/LocalStorageDriver.js`,
  `src/state/v2BackupRestore.js`,
  `src/quiz/dataBackup.js`,
  `src/ui/dataBackupPanel.js`,
  `src/data/importValidator.js`,
  `src/quiz/textQuizParser.js`,
  `src/quiz/textFileImport.js`,
];

const allowedChangedFiles = new Set([
  WORKFLOW_FILE,
  FILLED_RESULTS_FILE,
  EVIDENCE_SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
  `docs/testing/phase21e-manual-evidence-first-run-pack.md`,
  `docs/testing/phase21e-fillable-evidence-session-template.md`,
  `docs/release/phase21e-first-run-safety-and-claim-checklist.md`,
  `scripts/validate-phase21e-manual-evidence-first-run-pack.js`,
  `docs/testing/phase21f-first-manual-evidence-run-capture.md`,
  `docs/release/phase21f-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
]);

function fail(message) {
  console.error(`Phase 21C validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 21C validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
}

function normalize(text) {
  return text
    .replace(/[""]/g, `"`)
    .replace(/['']/g, `'`)
    .replace(/\s+/g, ` `)
    .trim();
}

function lowerNormalized(text) {
  return normalize(text).toLowerCase();
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: `utf8`, stdio: [`ignore`, `pipe`, `pipe`], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; scope checking may be limited: ${command}`);
    return ``;
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(items) {
  return [...new Set(items)].sort();
}

function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromBranchBase() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit(`git diff --name-only HEAD`, { silent: true })),
    ...splitLines(runGit(`git diff --cached --name-only`, { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit(`git ls-files --others --exclude-standard`, { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked }),
  ]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit(`git ls-files`, { silent: true })));
}

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function requiredFilesGuard() {
  for (const file of [
    FILLED_RESULTS_FILE,
    EVIDENCE_SUMMARY_FILE,
    VALIDATOR_SCRIPT,
    WORKFLOW_FILE,
    PHASE21A_RUN_PACK,
    PHASE21A_CHECKLIST,
    PHASE21B_RESULTS,
    PHASE21B_SUMMARY,
    PHASE20I_RESULTS,
    PHASE20I_SUMMARY,
    PHASE20J_ADR,
    PHASE20J_SUMMARY,
  ]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase21bStr = `node scripts/validate-phase21b-real-user-testing-filled-results.js`;
  const phase21cStr = `node scripts/validate-phase21c-stress-testing-filled-results.js`;

  if (!text.includes(phase21bStr)) fail(`${WORKFLOW_FILE} must register Phase 21B validator`);
  if (!text.includes(phase21cStr)) fail(`${WORKFLOW_FILE} must register Phase 21C validator`);
  if (text.indexOf(phase21cStr) <= text.indexOf(phase21bStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 21C after Phase 21B`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    if (runtimeSpecificFiles.includes(file)) fail(`Forbidden runtime/package/service-worker file changed in Phase 21C: ${file}`);
    if (runtimeFilePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Runtime, test, e2e, import, storage, backup, FSRS, sync, cloud, account, auth, backend, or UI file changed in Phase 21C: ${file}`);
    }
    fail(`Unexpected changed file outside Phase 21C scope: ${file}`);
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function combinedDocs() {
  return `${read(FILLED_RESULTS_FILE)}\n${read(EVIDENCE_SUMMARY_FILE)}`;
}

function requireTermAcrossDocs(term, termsName) {
  if (!lowerNormalized(combinedDocs()).includes(lowerNormalized(term))) {
    fail(`Required ${termsName} term "${term}" not found across Phase 21C docs`);
  }
}

function tokenGuard() {
  const combined = combinedDocs();
  if (!combined.includes(requiredStatusToken)) fail(`Phase 21C docs must include ${requiredStatusToken}`);
  if (!combined.includes(requiredRunCountToken)) fail(`Phase 21C docs must include ${requiredRunCountToken}`);
  if (!combined.includes(requiredHoldToken)) fail(`Phase 21C docs must include ${requiredHoldToken}`);
  if (!read(PHASE21B_RESULTS).includes(`REAL_USER_TEST_FILLED_SESSIONS: 0`)) {
    fail(`Phase 21B filled session count is missing`);
  }
  if (!read(PHASE20J_ADR).includes(requiredHoldToken)) fail(`Phase 20J HOLD decision is missing`);
  if (!combined.includes(`Phase 21B`)) fail(`Phase 21C docs must reference Phase 21B`);
  if (!combined.includes(`Phase 20J`)) fail(`Phase 21C docs must reference Phase 20J`);
}

function betaReadyDecisionGuard() {
  const activeBetaReadyPattern =
    /LOCAL_FIRST_HYBRID_BETA_(?:FINAL_)?REDECISION\s*:\s*BETA_READY|LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION\s*:\s*BETA_READY/;
  if (activeBetaReadyPattern.test(combinedDocs())) {
    fail(`Phase 21C must not declare BETA_READY`);
  }
}

function sectionName(line) {
  const match = normalize(line).match(/^##\s+(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function isForbiddenOrWarningSection(name) {
  return [
    `claim boundaries`,
    `phase 21d handoff`,
    `phase 21d readiness gate`,
    `observed hold signals`,
    `hold signals`,
    `remaining evidence gaps`,
    `recommendation`,
  ].includes(name);
}

function isNegatedClaimContext(line) {
  return /\b(if|unless|only if|only after|future|no|not|must not|does not|do not|none|without|forbidden|absent|absence|unshipped|not implemented|not selected|not supported|not allowed|not shipped|cannot|never|unchanged|reconsider|missing|imply|implied|misleading|hold|boundary|boundaries|pending|zero|is not|are not|requires|required|remains forbidden|do not claim|not complete)\b/i.test(line);
}

function forbiddenPositiveClaimGuardForFile(file) {
  const lines = read(file).split(/\r?\n/);
  let currentSection = null;

  for (const rawLine of lines) {
    const line = normalize(rawLine);
    const nextSection = sectionName(line);
    if (nextSection) currentSection = nextSection;
    if (currentSection && isForbiddenOrWarningSection(currentSection)) continue;

    const lowerLine = line.toLowerCase();
    for (const claim of forbiddenPositiveClaims) {
      if (!lowerLine.includes(lowerNormalized(claim))) continue;
      if (isNegatedClaimContext(line)) continue;
      fail(`${file} must not contain forbidden positive claim outside forbidden/warning sections: "${claim}" (line: ${line})`);
    }
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function historicalValidatorForwardCompatGuard() {
  const mergeBase = runGit(`git merge-base HEAD origin/main`, { silent: true });
  const changedValidators = changedFiles().filter(file =>
    file.startsWith(`scripts/validate-`) &&
    file.endsWith(`.js`) &&
    file !== VALIDATOR_SCRIPT
  );

  for (const validatorFile of changedValidators) {
    if (!mergeBase) {
      warn(`Cannot verify ${validatorFile} forward-compat: no merge base.`);
      continue;
    }

    const diff = runGit(`git diff ${mergeBase} HEAD -- "${validatorFile}"`, { silent: true });
    if (!diff || diff.includes(`--- /dev/null`)) continue;

    const addedLines = diff.split(`\n`)
      .filter(line => line.startsWith(`+`) && !line.startsWith(`+++`))
      .map(line => line.slice(1).trim())
      .filter(line => line.length > 0 && !line.startsWith(`//`) && !line.startsWith(`*`));

    for (const line of addedLines) {
      const extractedPaths = [
        ...line.matchAll(/'([^']+)'/g),
        ...line.matchAll(/`([^`]+)`/g),
        ...line.matchAll(/"([^"]+)"/g),
      ].map(([, path]) => path);

      for (const path of extractedPaths) {
        if (!path.includes(`/`)) continue;
        if (!path.endsWith(`.md`) && !path.endsWith(`.js`)) continue;
        if (phase21cForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-21C path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  scopeGuard();
  requireHeadings(FILLED_RESULTS_FILE, requiredFilledResultsHeadings);
  requireHeadings(EVIDENCE_SUMMARY_FILE, requiredSummaryHeadings);
  tokenGuard();
  betaReadyDecisionGuard();

  for (const term of requiredScenarioTerms) requireTermAcrossDocs(term, `scenario`);
  for (const term of requiredSafetyTerms) requireTermAcrossDocs(term, `safety`);

  forbiddenPositiveClaimGuardForFile(FILLED_RESULTS_FILE);
  forbiddenPositiveClaimGuardForFile(EVIDENCE_SUMMARY_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 21C Stress Testing Filled Results validation passed.`);
}

validate();
