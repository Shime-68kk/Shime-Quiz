#!/usr/bin/env node
/**
 * scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js
 *
 * Phase 20G static validator — Beta Readiness Re-decision After Evidence.
 *
 * Phase 20G is docs/static-validator/CI-only. It does not implement runtime
 * behavior, tests, e2e, dependencies, telemetry, analytics, import/storage/
 * backup/FSRS/sync runtime changes, cloud/account/auth/backend, or service
 * worker behavior.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR_FILE = `docs/adr/phase20g-beta-readiness-redecision-after-evidence.md`;
const SUMMARY_FILE = `docs/release/phase20g-beta-readiness-redecision-evidence-summary.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`;
const WORKFLOW_FILE = `.github/workflows/e2e-smoke.yml`;

const PHASE20D_ADR = `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`;
const PHASE20D_EVIDENCE = `docs/release/phase20d-beta-hold-evidence.md`;
const PHASE20E_LOG = `docs/testing/phase20e-real-user-testing-results-log.md`;
const PHASE20E_PROTOCOL = `docs/release/phase20e-real-user-testing-evidence-protocol.md`;
const PHASE20F_LOG = `docs/testing/phase20f-performance-quota-import-stress-results-log.md`;
const PHASE20F_PROTOCOL = `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`;
const PHASE20F_VALIDATOR = `scripts/validate-phase20f-performance-quota-import-stress-results-log.js`;

const phase20gForwardCompatEntries = [
  ADR_FILE,
  SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/testing/phase20h-real-user-testing-execution-results.md`,
  `docs/testing/phase20i-performance-quota-import-stress-execution-results.md`,
  `docs/release/phase20h-real-user-testing-evidence-summary.md`,
  `docs/release/phase20i-performance-quota-import-stress-evidence-summary.md`,
  `scripts/validate-phase20h-real-user-testing-execution-results.js`,
  `scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`,
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
  `phase20g-beta-readiness-redecision-after-evidence.patch`,
  `phase20g-beta-readiness-redecision-after-evidence.zip`,
  `phase20g-beta-readiness-redecision-after-evidence-handoff.md`,
];

const requiredAdrHeadings = [
  `# Phase 20G — Beta Readiness Re-decision After Evidence`,
  `## Purpose`,
  `## Decision`,
  `## Evidence consumed`,
  `## Relationship to Phase 20D`,
  `## Relationship to Phase 20E`,
  `## Relationship to Phase 20F`,
  `## Current evidence status`,
  `## Real-user testing evidence status`,
  `## Performance/quota/import stress evidence status`,
  `## Beta readiness re-decision`,
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
  `## What Phase 20G explicitly does not implement`,
  `## Required next evidence phases`,
  `## Acceptance criteria`,
];

const requiredSummaryHeadings = [
  `# Phase 20G — Beta Readiness Re-decision Evidence Summary`,
  `## Purpose`,
  `## Decision summary`,
  `## Evidence inventory`,
  `## Phase 20D evidence`,
  `## Phase 20E evidence`,
  `## Phase 20F evidence`,
  `## Real-user testing result count`,
  `## Stress-test result count`,
  `## Missing evidence`,
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
  `## Next steps`,
];

const requiredDecisionToken =
  `LOCAL_FIRST_HYBRID_BETA_REDECISION: HOLD_PENDING_EXECUTED_EVIDENCE`;

const requiredTerms = [
  `Phase 20G does not claim beta-ready`,
  `Phase 20G preserves the Phase 20D HOLD decision`,
  `Phase 20E is a results log template unless actual sessions are recorded`,
  `Phase 20F is a stress results log template unless actual results are recorded`,
  `If sessions/results are 0 or absent, BETA_READY is not allowed`,
  `Sync remains unshipped`,
  `Cloud/account/auth/backend remain absent`,
  `Production IndexedDB storage remains absent`,
  `Backup/export/restore are not adapter-aware`,
  `Data-loss prevention is not guaranteed`,
  `Built-in AI/OCR/AI quiz generation are not shipped`,
  `beta-ai naming cleanup remains preserved`,
  `20H — Real user testing execution results`,
  `20I — Performance/quota/import stress execution results`,
  `20J — Beta readiness re-decision after executed evidence`,
  `Phase 20G must not unlock sync/runtime/migration`,
];

const forbiddenPositiveClaims = [
  `LOCAL_FIRST_HYBRID_BETA_REDECISION: BETA_READY`,
  `local-first hybrid beta is ready`,
  `real user testing is complete`,
  `stress testing is complete`,
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

const phase20gAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  ADR_FILE,
  SUMMARY_FILE,
  VALIDATOR_SCRIPT,
  `docs/testing/phase20h-real-user-testing-execution-results.md`,
  `docs/testing/phase20i-performance-quota-import-stress-execution-results.md`,
  `docs/release/phase20h-real-user-testing-evidence-summary.md`,
  `docs/release/phase20i-performance-quota-import-stress-evidence-summary.md`,
  `scripts/validate-phase20h-real-user-testing-execution-results.js`,
  `scripts/validate-phase20i-performance-quota-import-stress-execution-results.js`,
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
  console.error(`Phase 20G validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20G validation warning: ${message}`);
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
    ADR_FILE,
    SUMMARY_FILE,
    VALIDATOR_SCRIPT,
    WORKFLOW_FILE,
    PHASE20D_ADR,
    PHASE20D_EVIDENCE,
    PHASE20E_LOG,
    PHASE20E_PROTOCOL,
    PHASE20F_LOG,
    PHASE20F_PROTOCOL,
    PHASE20F_VALIDATOR,
  ]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20fStr = `node scripts/validate-phase20f-performance-quota-import-stress-results-log.js`;
  const phase20gStr = `node scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`;

  if (!text.includes(phase20fStr)) fail(`${WORKFLOW_FILE} must register Phase 20F validator`);
  if (!text.includes(phase20gStr)) fail(`${WORKFLOW_FILE} must register Phase 20G validator`);
  if (text.indexOf(phase20gStr) <= text.indexOf(phase20fStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20G after Phase 20F`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
  `docs/testing/phase22a-actual-first-manual-evidence-run.md`,
  `docs/release/phase22a-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase22a-actual-first-manual-evidence-run.js`,
  `docs/testing/phase22b-real-user-evidence-filled-results.md`,
  `docs/release/phase22b-real-user-evidence-summary.md`,
  `scripts/validate-phase22b-fill-real-user-evidence-results.js`,
  `docs/testing/phase22c-stress-evidence-filled-results.md`,
  `docs/release/phase22c-stress-evidence-summary.md`,
  `scripts/validate-phase22c-fill-stress-evidence-results.js`,
  `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`,
  `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`,
  `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`,
  `docs/testing/phase22e-broader-manual-evidence-run.md`,
  `docs/release/phase22e-broader-manual-evidence-summary.md`,
  `scripts/validate-phase22e-broader-manual-evidence.js`,].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (phase20gAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === `src`) fail(`src/ file changed in Phase 20G (forbidden): ${file}`);
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20G (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20G (forbidden): ${file}`);
    if (file === `package.json`) fail(`package.json changed in Phase 20G (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 20G (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 20G (forbidden)`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    fail(`Unexpected changed file outside Phase 20G scope: ${file}`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20G (forbidden): ${file}`);
  }
}

function syncCloudAccountGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`,
  `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`,
  `docs/release/phase21g-phase22-readiness-handoff.md`,
  `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`,
  `docs/testing/phase22a-actual-first-manual-evidence-run.md`,
  `docs/release/phase22a-first-manual-evidence-run-summary.md`,
  `scripts/validate-phase22a-actual-first-manual-evidence-run.js`,
  `docs/testing/phase22b-real-user-evidence-filled-results.md`,
  `docs/release/phase22b-real-user-evidence-summary.md`,
  `scripts/validate-phase22b-fill-real-user-evidence-results.js`,
  `docs/testing/phase22c-stress-evidence-filled-results.md`,
  `docs/release/phase22c-stress-evidence-summary.md`,
  `scripts/validate-phase22c-fill-stress-evidence-results.js`,
  `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`,
  `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`,
  `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`,
  `docs/testing/phase22e-broader-manual-evidence-run.md`,
  `docs/release/phase22e-broader-manual-evidence-summary.md`,
  `scripts/validate-phase22e-broader-manual-evidence.js`,].includes(file)) continue;
    if (syncCloudAccountRuntimePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`sync/cloud/account/auth/backend runtime file changed in Phase 20G (forbidden): ${file}`);
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
  const combined = lowerNormalized(`${read(ADR_FILE)}\n${read(SUMMARY_FILE)}`);
  if (!combined.includes(lowerNormalized(term))) {
    fail(`Required term "${term}" not found across Phase 20G docs`);
  }
}

function decisionTokenGuard() {
  for (const file of [ADR_FILE, SUMMARY_FILE]) {
    if (!read(file).includes(requiredDecisionToken)) {
      fail(`${file} must include ${requiredDecisionToken}`);
    }
  }
}

function evidenceTemplateGuard() {
  const phase20e = read(PHASE20E_LOG);
  const phase20f = read(PHASE20F_LOG);
  const docs = `${read(ADR_FILE)}\n${read(SUMMARY_FILE)}`;

  if (!/Sessions recorded:\s*0 of 5 minimum required/i.test(phase20e)) {
    fail(`${PHASE20E_LOG} no longer shows zero recorded real-user sessions; re-decision must be revisited`);
  }
  if (!/Sessions completed:\s*0 of 5 minimum required/i.test(phase20e)) {
    fail(`${PHASE20E_LOG} evidence summary no longer shows zero completed real-user sessions`);
  }
  if (!/Stress results recorded:\s*0\b/i.test(phase20f)) {
    fail(`${PHASE20F_LOG} no longer shows zero stress results; re-decision must be revisited`);
  }
  if (!/Real-user testing result count:\s*0 completed sessions/i.test(docs)) {
    fail(`${SUMMARY_FILE} must record real-user testing result count as 0 completed sessions`);
  }
  if (!/Stress-test result count:\s*0 completed stress results/i.test(docs)) {
    fail(`${SUMMARY_FILE} must record stress-test result count as 0 completed stress results`);
  }
}

function betaReadyDecisionGuard() {
  const combinedDocs = `${read(ADR_FILE)}\n${read(SUMMARY_FILE)}`;
  const activeBetaReadyPattern =
    /LOCAL_FIRST_HYBRID_BETA_REDECISION\s*:\s*BETA_READY/;
  if (activeBetaReadyPattern.test(combinedDocs)) {
    fail(`Phase 20G must not declare LOCAL_FIRST_HYBRID_BETA_REDECISION: BETA_READY without executed evidence`);
  }
}

function sectionName(line) {
  const match = normalize(line).match(/^##\s+(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function isForbiddenOrWarningSection(name) {
  return [
    `why beta_ready is not selected`,
    `conditions required before beta_ready`,
    `user-facing claim boundaries`,
    `what phase 20g explicitly does not implement`,
    `missing evidence`,
    `hold signals`,
    `recommendation`,
  ].includes(name);
}

function isNegatedClaimContext(line) {
  return /\b(if|unless|only if|only after|after|future|no|not|must not|does not|do not|none|without|forbidden|absent|absence|unshipped|not implemented|not selected|not supported|not allowed|not shipped|cannot|never|unchanged|reconsider|missing|imply|misleading|hold|boundary|boundaries|pending|zero)\b/i.test(line);
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
        if (phase20gForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20G path entry: '${path}'`);
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
  requireHeadings(ADR_FILE, requiredAdrHeadings);
  requireHeadings(SUMMARY_FILE, requiredSummaryHeadings);
  decisionTokenGuard();
  evidenceTemplateGuard();
  betaReadyDecisionGuard();

  for (const term of requiredTerms) {
    requireTermAcrossDocs(term);
  }

  forbiddenPositiveClaimGuardForFile(ADR_FILE);
  forbiddenPositiveClaimGuardForFile(SUMMARY_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20G Beta Readiness Re-decision After Evidence validation passed.`);
}

validate();
