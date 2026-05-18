#!/usr/bin/env node
/**
 * scripts/validate-phase20i-performance-quota-import-stress-execution-results.js
 *
 * Phase 20I static validator — Performance Quota Import Stress Execution Results.
 *
 * Phase 20I is docs/static-validator/CI-only. It does not implement runtime
 * behavior, tests, e2e, dependencies, telemetry, analytics, import/storage/
 * backup/FSRS/sync runtime changes, cloud/account/auth/backend, or service
 * worker behavior.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESULTS_FILE = `docs/testing/phase20i-performance-quota-import-stress-execution-results.md`;
const SUMMARY_FILE = `docs/release/phase20i-performance-quota-import-stress-evidence-summary.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`;
const WORKFLOW_FILE = `.github/workflows/e2e-smoke.yml`;
const PHASE20G_ADR = `docs/adr/phase20g-beta-readiness-redecision-after-evidence.md`;
const PHASE20G_SUMMARY = `docs/release/phase20g-beta-readiness-redecision-evidence-summary.md`;
const PHASE20G_VALIDATOR = `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`;

const phase20iForwardCompatEntries = [
  RESULTS_FILE,
  SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/adr/phase20j-final-beta-readiness-redecision.md`,
  `docs/release/phase20j-final-beta-readiness-evidence-summary.md`,
  `scripts/validate-phase20j-final-beta-readiness-redecision.js`,
  `docs/testing/phase21a-manual-evidence-execution-run-pack.md`,
  `docs/release/phase21a-evidence-execution-safety-checklist.md`,
  `scripts/validate-phase21a-manual-evidence-execution-run-pack.js`,
  `docs/testing/phase21b-real-user-testing-filled-results.md`,
  `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `docs/testing/phase21c-stress-testing-filled-results.md`,
  `docs/release/phase21c-stress-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
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
  `phase20i-performance-quota-import-stress-execution-results.patch`,
  `phase20i-performance-quota-import-stress-execution-results.zip`,
  `phase20i-performance-quota-import-stress-execution-results-handoff.md`,
];

const requiredResultsHeadings = [
  `# Phase 20I — Performance / Quota / Import Stress Execution Results`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 20F`,
  `## Relationship to Phase 20G`,
  `## Relationship to Phase 20H`,
  `## Evidence source rules`,
  `## Data safety rules`,
  `## Recorded stress run count`,
  `## Stress run result schema`,
  `## Small data set run`,
  `## Medium data set run`,
  `## Large data set run`,
  `## Startup responsiveness observations`,
  `## Dashboard today plan observations`,
  `## Study Room observations`,
  `## Import observations`,
  `## Storage quota observations`,
  `## Backup and restore observations`,
  `## Manual transfer observations`,
  `## Mobile/PWA observations`,
  `## FSRS and review schedule observations`,
  `## EduGen Draft Workshop boundary observations`,
  `## beta-ai naming observations`,
  `## Observed pass signals`,
  `## Observed hold signals`,
  `## Evidence completeness assessment`,
  `## Claim boundaries`,
  `## Phase 20J handoff`,
];

const requiredSummaryHeadings = [
  `# Phase 20I — Performance / Quota / Import Stress Evidence Summary`,
  `## Purpose`,
  `## Evidence status`,
  `## Recorded stress runs`,
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
  `## Phase 20H relationship`,
  `## Phase 20J readiness gate`,
];

const requiredStatusToken =
  `PERFORMANCE_STRESS_EXECUTION_STATUS: EXECUTION_RESULTS_LOG_READY`;
const requiredRecordedToken = `PERFORMANCE_STRESS_RECORDED_RUNS: 0`;
const requiredHoldToken =
  `LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE`;

const requiredScenarioTerms = [
  `small data set`,
  `medium data set`,
  `large data set`,
  `app startup`,
  `Dashboard today plan`,
  `Study Room session`,
  `due cards / review schedule`,
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
];

const requiredSafetyTerms = [
  `Phase 20I creates a stress execution results evidence artifact`,
  `Results must be based only on actual manual/user-provided evidence`,
  `PERFORMANCE_STRESS_RECORDED_RUNS: 0`,
  `No telemetry is collected`,
  `No analytics are added`,
  `runtime instrumentation`,
  `runtime stress harness`,
  `Testers should use generated/duplicate/test data where possible`,
  `Backup should be created before risky`,
  `backup is not sync`,
  `Restore may overwrite current data`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
  `Do not record private study content`,
  `Do not record credentials`,
  `HOLD remains active until enough evidence exists`,
  `BETA_READY is not claimed in Phase 20I`,
];

const forbiddenPositiveClaims = [
  `LOCAL_FIRST_HYBRID_BETA_REDECISION: BETA_READY`,
  `local-first hybrid beta is ready`,
  `stress testing is complete`,
  `real user testing is complete`,
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

const fsrsRuntimeFiles = [
  `src/scheduler/fsrsAdapter.js`,
  `src/scheduler/fsrsScheduler.js`,
  `src/scheduler/fsrsEnrollment.js`,
  `src/state/fsrsMetadata.js`,
  `src/ui/FsrsExperimentalSettingsPanel.js`,
  `src/quiz/reviewSchedulerAdapter.js`,
];

const storageRuntimeFiles = [
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
];

const backupRestoreRuntimeFiles = [
  `src/state/v2BackupRestore.js`,
  `src/quiz/dataBackup.js`,
  `src/ui/dataBackupPanel.js`,
];

const importRuntimeFiles = [
  `src/data/importValidator.js`,
  `src/quiz/textQuizParser.js`,
  `src/quiz/textFileImport.js`,
];

const syncCloudAccountRuntimePrefixes = [
  `src/sync/`,
  `src/cloud/`,
  `src/account/`,
  `src/auth/`,
  `src/backend/`,
];

const phase20iAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  RESULTS_FILE,
  SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/adr/phase20j-final-beta-readiness-redecision.md`,
  `docs/release/phase20j-final-beta-readiness-evidence-summary.md`,
  `scripts/validate-phase20j-final-beta-readiness-redecision.js`,
  `docs/testing/phase21a-manual-evidence-execution-run-pack.md`,
  `docs/release/phase21a-evidence-execution-safety-checklist.md`,
  `scripts/validate-phase21a-manual-evidence-execution-run-pack.js`,
  `docs/testing/phase21b-real-user-testing-filled-results.md`,
  `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `docs/testing/phase21c-stress-testing-filled-results.md`,
  `docs/release/phase21c-stress-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
]);

function fail(message) {
  console.error(`Phase 20I validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20I validation warning: ${message}`);
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

function firstSegment(file) {
  return file.indexOf(`/`) >= 0 ? file.slice(0, file.indexOf(`/`)) : file;
}

function isGeneratedArtifact(file) {
  return generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function requiredFilesGuard() {
  for (const file of [
    RESULTS_FILE,
    SUMMARY_FILE,
    VALIDATOR_SCRIPT,
    WORKFLOW_FILE,
    PHASE20G_ADR,
    PHASE20G_SUMMARY,
    PHASE20G_VALIDATOR,
  ]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20hStr = `node scripts/validate-phase20h-real-user-testing-execution-results.js`;
  const phase20iStr = `node scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`;

  if (!text.includes(phase20hStr)) fail(`${WORKFLOW_FILE} must register Phase 20H validator`);
  if (!text.includes(phase20iStr)) fail(`${WORKFLOW_FILE} must register Phase 20I validator`);
  if (text.indexOf(phase20iStr) <= text.indexOf(phase20hStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20I after Phase 20H`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (phase20iAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === `src`) fail(`src/ file changed in Phase 20I (forbidden): ${file}`);
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20I (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20I (forbidden): ${file}`);
    if (file === `package.json`) fail(`package.json changed in Phase 20I (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 20I (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 20I (forbidden)`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    fail(`Unexpected changed file outside Phase 20I scope: ${file}`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20I (forbidden): ${file}`);
  }
}

function syncCloudAccountGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`].includes(file)) continue;
    if (syncCloudAccountRuntimePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`sync/cloud/account/auth/backend runtime file changed in Phase 20I (forbidden): ${file}`);
    }
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function requireTermAcrossDocs(term) {
  const combined = lowerNormalized(`${read(RESULTS_FILE)}\n${read(SUMMARY_FILE)}`);
  if (!combined.includes(lowerNormalized(term))) {
    fail(`Required term "${term}" not found across Phase 20I docs`);
  }
}

function tokenGuard() {
  const combined = `${read(RESULTS_FILE)}\n${read(SUMMARY_FILE)}`;
  for (const token of [requiredStatusToken, requiredRecordedToken, requiredHoldToken]) {
    if (!combined.includes(token)) fail(`Phase 20I docs must include ${token}`);
  }
}

function betaReadyDecisionGuard() {
  const activeBetaReadyPattern =
    /LOCAL_FIRST_HYBRID_BETA_REDECISION\s*:\s*BETA_READY/;
  const combined = `${read(RESULTS_FILE)}\n${read(SUMMARY_FILE)}`;
  if (activeBetaReadyPattern.test(combined)) {
    fail(`Phase 20I must not declare LOCAL_FIRST_HYBRID_BETA_REDECISION: BETA_READY`);
  }
}

function sectionName(line) {
  const match = normalize(line).match(/^##\s+(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function isForbiddenOrWarningSection(name) {
  return [
    `claim boundaries`,
    `phase 20j handoff`,
    `phase 20j readiness gate`,
    `recommendation`,
    `what was not validated`,
    `hold signals`,
    `observed hold signals`,
    `evidence completeness assessment`,
    `remaining evidence gaps`,
  ].includes(name);
}

function isNegatedClaimContext(line) {
  return /\b(if|unless|only if|only after|after|future|no|not|must not|does not|do not|none|without|forbidden|absent|absence|unshipped|not implemented|not selected|not supported|not allowed|not shipped|cannot|never|unchanged|reconsider|missing|imply|misleading|hold|boundary|boundaries|pending|zero|is not|are not)\b/i.test(line);
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
        if (phase20iForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20I path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  scopeGuard();
  runtimeGuard(`FSRS runtime file`, fsrsRuntimeFiles);
  runtimeGuard(`Storage/runtime file`, storageRuntimeFiles);
  runtimeGuard(`Backup/export/restore runtime file`, backupRestoreRuntimeFiles);
  runtimeGuard(`Import parser/runtime file`, importRuntimeFiles);
  syncCloudAccountGuard();
  requireHeadings(RESULTS_FILE, requiredResultsHeadings);
  requireHeadings(SUMMARY_FILE, requiredSummaryHeadings);
  tokenGuard();
  betaReadyDecisionGuard();

  for (const term of [...requiredScenarioTerms, ...requiredSafetyTerms]) {
    requireTermAcrossDocs(term);
  }

  forbiddenPositiveClaimGuardForFile(RESULTS_FILE);
  forbiddenPositiveClaimGuardForFile(SUMMARY_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20I Performance Quota Import Stress Execution Results validation passed.`);
}

validate();
