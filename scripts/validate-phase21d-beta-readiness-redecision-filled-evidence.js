#!/usr/bin/env node
/**
 * scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js
 *
 * Phase 21D static validator — Beta Readiness Re-decision With Filled Evidence.
 *
 * Phase 21D is docs/static-validator/CI-only. It does not implement runtime
 * behavior, tests, e2e, dependencies, telemetry, analytics, import/storage/
 * backup/FSRS/sync runtime changes, cloud/account/auth/backend, or service
 * worker behavior.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE = `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`;
const EVIDENCE_SUMMARY_FILE = `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`;
const WORKFLOW_FILE = `.github/workflows/e2e-smoke.yml`;

const PHASE21A_RUN_PACK = `docs/testing/phase21a-manual-evidence-execution-run-pack.md`;
const PHASE21A_CHECKLIST = `docs/release/phase21a-evidence-execution-safety-checklist.md`;
const PHASE21B_RESULTS = `docs/testing/phase21b-real-user-testing-filled-results.md`;
const PHASE21B_SUMMARY = `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`;
const PHASE21C_RESULTS = `docs/testing/phase21c-stress-testing-filled-results.md`;
const PHASE21C_SUMMARY = `docs/release/phase21c-stress-testing-filled-evidence-summary.md`;
const PHASE20J_ADR = `docs/adr/phase20j-final-beta-readiness-redecision.md`;
const PHASE20J_SUMMARY = `docs/release/phase20j-final-beta-readiness-evidence-summary.md`;
const PHASE20D_ADR = `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`;

const phase21dForwardCompatEntries = [
  ADR_FILE,
  EVIDENCE_SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/testing/phase21e-manual-evidence-first-run-pack.md`,
  `docs/testing/phase21e-fillable-evidence-session-template.md`,
  `docs/release/phase21e-first-run-safety-and-claim-checklist.md`,
  `scripts/validate-phase21e-manual-evidence-first-run-pack.js`,
  `docs/testing/phase21f-first-manual-evidence-run-capture.md`,
  `docs/release/phase21f-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
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
  `phase21d-beta-readiness-redecision-filled-evidence.patch`,
  `phase21d-beta-readiness-redecision-filled-evidence.zip`,
  `phase21d-beta-readiness-redecision-filled-evidence-handoff.md`,
];

const requiredAdrHeadings = [
  `# Phase 21D — Beta Readiness Re-decision With Filled Evidence`,
  `## Purpose`,
  `## Decision`,
  `## Evidence consumed`,
  `## Relationship to Phase 20J`,
  `## Relationship to Phase 21A`,
  `## Relationship to Phase 21B`,
  `## Relationship to Phase 21C`,
  `## Current filled evidence status`,
  `## Real-user testing filled evidence status`,
  `## Stress testing filled evidence status`,
  `## Why BETA_READY is not selected`,
  `## Conditions required before BETA_READY`,
  `## Data safety decision`,
  `## Backup and restore decision`,
  `## Import and quota decision`,
  `## FSRS and scheduler decision`,
  `## Optional sync decision`,
  `## No-cloud/default-off trust decision`,
  `## beta-ai naming decision`,
  `## User-facing claim boundaries`,
  `## What Phase 21D explicitly does not implement`,
  `## Post-Phase-21 path`,
  `## Acceptance criteria`,
];

const requiredSummaryHeadings = [
  `# Phase 21D — Beta Readiness Filled Evidence Summary`,
  `## Purpose`,
  `## Decision summary`,
  `## Evidence inventory`,
  `## Phase 21B evidence`,
  `## Phase 21C evidence`,
  `## Real-user testing filled session count`,
  `## Stress testing filled run count`,
  `## Evidence gaps`,
  `## Hold signals`,
  `## Pass signals`,
  `## Data safety assessment`,
  `## Backup and restore assessment`,
  `## Import and quota assessment`,
  `## FSRS and scheduler assessment`,
  `## Optional sync assessment`,
  `## No-cloud/default-off trust assessment`,
  `## beta-ai naming assessment`,
  `## Recommendation`,
  `## Required evidence before release reconsideration`,
  `## Next steps`,
];

const requiredDecisionToken =
  `LOCAL_FIRST_HYBRID_BETA_FILLED_EVIDENCE_DECISION: HOLD_INSUFFICIENT_FILLED_EVIDENCE`;
const requiredSessionCountToken = `REAL_USER_TEST_FILLED_SESSIONS: 0`;
const requiredRunCountToken = `PERFORMANCE_STRESS_FILLED_RUNS: 0`;
const requiredPhase20jHoldToken =
  `LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED`;

const requiredTerms = [
  `Phase 21D does not claim beta-ready`,
  `filled evidence remains insufficient`,
  `Phase 21D is docs/static-validator/CI-only`,
  `Phase 21D does not implement storage migration`,
  `Sync remains unshipped`,
  `Cloud/account/auth/backend remain absent`,
  `Production IndexedDB storage remains absent`,
  `Backup/export/restore are not adapter-aware`,
  `Data-loss prevention is not guaranteed`,
  `Built-in AI/OCR/AI quiz generation are not shipped`,
  `beta-ai naming cleanup remains preserved`,
  `actual manual evidence collection before beta-ready reconsideration`,
  `21E — Manual evidence execution guidance for first real run`,
  `21F — Filled real-user evidence update after actual sessions`,
  `21G — Filled stress evidence update after actual runs`,
  `21H — Beta readiness re-decision with actual filled evidence`,
];

const forbiddenPositiveClaims = [
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
  ADR_FILE,
  EVIDENCE_SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `docs/testing/phase21e-manual-evidence-first-run-pack.md`,
  `docs/testing/phase21e-fillable-evidence-session-template.md`,
  `docs/release/phase21e-first-run-safety-and-claim-checklist.md`,
  `scripts/validate-phase21e-manual-evidence-first-run-pack.js`,
  `docs/testing/phase21f-first-manual-evidence-run-capture.md`,
  `docs/release/phase21f-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
]);

function fail(message) {
  console.error(`Phase 21D validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 21D validation warning: ${message}`);
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
    ADR_FILE,
    EVIDENCE_SUMMARY_FILE,
    VALIDATOR_SCRIPT,
    WORKFLOW_FILE,
    PHASE21A_RUN_PACK,
    PHASE21A_CHECKLIST,
    PHASE21B_RESULTS,
    PHASE21B_SUMMARY,
    PHASE21C_RESULTS,
    PHASE21C_SUMMARY,
    PHASE20J_ADR,
    PHASE20J_SUMMARY,
    PHASE20D_ADR,
  ]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase21cStr = `node scripts/validate-phase21c-stress-testing-filled-results.js`;
  const phase21dStr = `node scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`;

  if (!text.includes(phase21cStr)) fail(`${WORKFLOW_FILE} must register Phase 21C validator`);
  if (!text.includes(phase21dStr)) fail(`${WORKFLOW_FILE} must register Phase 21D validator`);
  if (text.indexOf(phase21dStr) <= text.indexOf(phase21cStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 21D after Phase 21C`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    if (runtimeSpecificFiles.includes(file)) fail(`Forbidden runtime/package/service-worker file changed in Phase 21D: ${file}`);
    if (runtimeFilePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Runtime, test, e2e, import, storage, backup, FSRS, sync, cloud, account, auth, backend, or UI file changed in Phase 21D: ${file}`);
    }
    fail(`Unexpected changed file outside Phase 21D scope: ${file}`);
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function combinedDocs() {
  return `${read(ADR_FILE)}\n${read(EVIDENCE_SUMMARY_FILE)}`;
}

function requireTermAcrossDocs(term, termsName) {
  if (!lowerNormalized(combinedDocs()).includes(lowerNormalized(term))) {
    fail(`Required ${termsName} term "${term}" not found across Phase 21D docs`);
  }
}

function tokenGuard() {
  const combined = combinedDocs();
  if (!combined.includes(requiredDecisionToken)) fail(`Phase 21D docs must include ${requiredDecisionToken}`);
  if (!combined.includes(requiredSessionCountToken)) fail(`Phase 21D docs must include ${requiredSessionCountToken}`);
  if (!combined.includes(requiredRunCountToken)) fail(`Phase 21D docs must include ${requiredRunCountToken}`);
  if (!read(PHASE21B_RESULTS).includes(requiredSessionCountToken)) fail(`Phase 21B filled session count is missing`);
  if (!read(PHASE21C_RESULTS).includes(requiredRunCountToken)) fail(`Phase 21C filled run count is missing`);
  if (!read(PHASE20J_ADR).includes(requiredPhase20jHoldToken)) fail(`Phase 20J HOLD decision is missing`);
  for (const phase of [`Phase 21A`, `Phase 21B`, `Phase 21C`, `Phase 20J`, `Phase 20D`]) {
    if (!combined.includes(phase)) fail(`Phase 21D docs must reference ${phase}`);
  }
}

function betaReadyDecisionGuard() {
  const combined = combinedDocs();
  const activeBetaReadyPattern =
    /LOCAL_FIRST_HYBRID_BETA_(?:FILLED_EVIDENCE_DECISION|(?:FINAL_)?REDECISION|FINAL_DECISION)\s*:\s*BETA_READY/;
  if (activeBetaReadyPattern.test(combined)) fail(`Phase 21D must not declare BETA_READY without sufficient filled evidence`);
}

function sectionName(line) {
  const match = normalize(line).match(/^##\s+(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function isForbiddenOrWarningSection(name) {
  return [
    `user-facing claim boundaries`,
    `why beta_ready is not selected`,
    `conditions required before beta_ready`,
    `hold signals`,
    `evidence gaps`,
    `recommendation`,
    `required evidence before release reconsideration`,
    `acceptance criteria`,
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
        if (phase21dForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-21D path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  scopeGuard();
  requireHeadings(ADR_FILE, requiredAdrHeadings);
  requireHeadings(EVIDENCE_SUMMARY_FILE, requiredSummaryHeadings);
  tokenGuard();
  betaReadyDecisionGuard();

  for (const term of requiredTerms) requireTermAcrossDocs(term, `evidence/decision`);

  forbiddenPositiveClaimGuardForFile(ADR_FILE);
  forbiddenPositiveClaimGuardForFile(EVIDENCE_SUMMARY_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 21D Beta Readiness Re-decision With Filled Evidence validation passed.`);
}

validate();
