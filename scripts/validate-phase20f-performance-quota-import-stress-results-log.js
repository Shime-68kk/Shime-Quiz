#!/usr/bin/env node
/**
 * scripts/validate-phase20f-performance-quota-import-stress-results-log.js
 *
 * Phase 20F static validator — Performance / Quota / Import Stress Results Log.
 *
 * Phase 20F is docs/static-validator/CI-only. It does not implement runtime
 * stress fixtures, runtime instrumentation, telemetry, analytics, storage
 * behavior, FSRS behavior, backup/export/restore behavior, import parser
 * behavior, sync, cloud/account/auth/backend, UI behavior changes, tests, or
 * dependencies.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESULTS_LOG_FILE    = `docs/testing/phase20f-performance-quota-import-stress-results-log.md`;
const EVIDENCE_PROTO_FILE = `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`;
const VALIDATOR_SCRIPT    = `scripts/validate-phase20f-performance-quota-import-stress-results-log.js`;
const WORKFLOW_FILE       = `.github/workflows/e2e-smoke.yml`;
const PHASE20E_VALIDATOR  = `scripts/validate-phase20e-real-user-testing-results-log.js`;
const PHASE20D_VALIDATOR  = `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js`;

// Phase 20F forward-compat entries: the only paths historical validators may add.
const phase20fForwardCompatEntries = [
  `docs/testing/phase20f-performance-quota-import-stress-results-log.md`,
  `docs/release/phase20f-performance-quota-import-stress-evidence-protocol.md`,
  `scripts/validate-phase20f-performance-quota-import-stress-results-log.js`,
  `docs/adr/phase20g-beta-readiness-redecision-after-evidence.md`,
  `docs/release/phase20g-beta-readiness-redecision-evidence-summary.md`,
  `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`,
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

// Pre-Phase-20F exact entries already present in historical validators.
const previousForwardCompatEntries = [
  `docs/testing/phase20e-real-user-testing-results-log.md`,
  `docs/release/phase20e-real-user-testing-evidence-protocol.md`,
  `scripts/validate-phase20e-real-user-testing-results-log.js`,
];

const broadPathPatterns = [
  `src/`,
  `src/storage/`,
  `docs/`,
  `scripts/`,
  `tests/`,
  `e2e/`,
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
  `phase20f-performance-quota-import-stress-results-log.patch`,
  `phase20f-performance-quota-import-stress-results-log.zip`,
  `phase20f-performance-quota-import-stress-results-log-handoff.md`,
];

const requiredResultsLogHeadings = [
  `# Phase 20F — Performance / Quota / Import Stress Results Log`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 20C`,
  `## Relationship to Phase 20D HOLD`,
  `## Relationship to Phase 20E`,
  `## Test execution rules`,
  `## Data safety rules`,
  `## What to record`,
  `## What not to record`,
  `## Required pre-test backup checklist`,
  `## Test data set template`,
  `## Small data set result`,
  `## Medium data set result`,
  `## Large data set result`,
  `## Startup responsiveness result`,
  `## Dashboard today plan result`,
  `## Study Room result`,
  `## Import result`,
  `## Storage quota result`,
  `## Backup and restore result`,
  `## Manual transfer result`,
  `## Mobile/PWA result`,
  `## FSRS and review schedule result`,
  `## Evidence summary`,
  `## Hold signals`,
  `## Pass signals`,
  `## Claim boundaries`,
  `## Phase 20G handoff`,
];

const requiredEvidenceProtoHeadings = [
  `# Phase 20F — Performance / Quota / Import Stress Evidence Protocol`,
  `## Purpose`,
  `## Evidence status`,
  `## Minimum evidence needed before Phase 20G`,
  `## Test environment boundary`,
  `## Data set definitions`,
  `## Performance protocol`,
  `## Storage quota protocol`,
  `## Import protocol`,
  `## Backup and restore protocol`,
  `## Manual transfer protocol`,
  `## Mobile/PWA protocol`,
  `## FSRS and review schedule protocol`,
  `## Stop conditions`,
  `## Evidence quality rubric`,
  `## What counts as passing evidence`,
  `## What counts as hold evidence`,
  `## Claim boundaries`,
  `## Phase 20E relationship`,
  `## Phase 20G readiness gate`,
];

const requiredStatusToken = `performance_stress_execution_status: results_log_template_ready`;
const requiredHoldReference = `local_first_hybrid_beta_decision: hold`;

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
  `Phase 20F creates a stress-test results log structure`,
  `does not claim stress testing is complete unless actual manual`,
  `No telemetry is collected`,
  `No analytics are added`,
  `No runtime instrumentation is added`,
  `Testers should use generated/duplicate/test data where possible`,
  `Backup must be created before risky import/restore/manual transfer testing`,
  `Stop if import creates confusing or unsafe data`,
  `Stop if backup/restore results are unclear`,
  `Stop if due cards/review schedule counts look inconsistent`,
  `Stop if storage quota warning is unclear or missing for risky import sizes`,
  `Stop if PWA/cache behavior is confusing`,
  `Stop if beta-ai or AI capability implication appears in public copy`,
];

const forbiddenPositiveClaims = [
  `local_first_hybrid_beta_decision: beta_ready`,
  `beta ready`,
  `beta-ready`,
  `stress testing is complete`,
  `performance stress testing is complete`,
  `quota stress testing is complete`,
  `import stress testing is complete`,
  `telemetry is collected`,
  `analytics are added`,
  `runtime instrumentation is added`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `built-in ai exists`,
  `ai quiz generation exists`,
  `ocr exists`,
  `beta-ai is acceptable`,
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

const phase20fAllowedChangedFiles = new Set([
  WORKFLOW_FILE,
  RESULTS_LOG_FILE,
  EVIDENCE_PROTO_FILE,
  VALIDATOR_SCRIPT,
  `docs/adr/phase20g-beta-readiness-redecision-after-evidence.md`,
  `docs/release/phase20g-beta-readiness-redecision-evidence-summary.md`,
  `scripts/validate-phase20g-beta-readiness-redecision-after-evidence.js`,
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
  console.error(`Phase 20F validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 20F validation warning: ${message}`);
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
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE, VALIDATOR_SCRIPT, WORKFLOW_FILE, PHASE20E_VALIDATOR, PHASE20D_VALIDATOR]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20eStr = `node scripts/validate-phase20e-real-user-testing-results-log.js`;
  const phase20fStr = `node scripts/validate-phase20f-performance-quota-import-stress-results-log.js`;

  if (!text.includes(phase20eStr)) fail(`${WORKFLOW_FILE} must register Phase 20E validator`);
  if (!text.includes(phase20fStr)) fail(`${WORKFLOW_FILE} must register Phase 20F validator`);
  if (text.indexOf(phase20fStr) <= text.indexOf(phase20eStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 20F validator after Phase 20E`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (phase20fAllowedChangedFiles.has(file)) continue;
    if (firstSegment(file) === `src`) fail(`src/ file changed in Phase 20F (forbidden): ${file}`);
    if (firstSegment(file) === `tests`) fail(`tests/ file changed in Phase 20F (forbidden): ${file}`);
    if (firstSegment(file) === `e2e`) fail(`e2e/ file changed in Phase 20F (forbidden): ${file}`);
    if (file === `package.json`) fail(`package.json changed in Phase 20F (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 20F (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 20F (forbidden)`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    fail(`Unexpected changed file outside Phase 20F scope: ${file}`);
  }
}

function runtimeGuard(label, files) {
  const changed = new Set(changedFiles());
  for (const file of files) {
    if (changed.has(file)) fail(`${label} changed in Phase 20F (forbidden): ${file}`);
  }
}

function syncCloudAccountGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`].includes(file)) continue;
    if (syncCloudAccountRuntimePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`sync/cloud/account/auth/backend runtime file changed in Phase 20F (forbidden): ${file}`);
    }
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function requireTermAcrossFiles(term, files) {
  const combined = files.map(f => lowerNormalized(read(f))).join(` `);
  if (!combined.includes(lowerNormalized(term))) {
    fail(`Required term "${term}" not found across Phase 20F docs`);
  }
}

function statusTokenGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = lowerNormalized(read(file));
    if (!text.includes(requiredStatusToken)) {
      fail(`${file} must include status token: "PERFORMANCE_STRESS_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY"`);
    }
  }
}

function relationshipGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = lowerNormalized(read(file));
    if (!text.includes(requiredHoldReference)) fail(`${file} must reference Phase 20D HOLD decision token`);
    if (!text.includes(`phase 20e`)) fail(`${file} must reference Phase 20E relationship`);
  }
}

function noBetaReadyActiveClaimGuard() {
  for (const file of [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]) {
    const text = read(file);
    if (/LOCAL_FIRST_HYBRID_BETA_DECISION\s*:\s*BETA_READY/.test(text)) {
      fail(`${file} must not declare LOCAL_FIRST_HYBRID_BETA_DECISION: BETA_READY as an active claim`);
    }
  }
}

function isForbiddenClaimSection(line) {
  return /^##\s+(Claim boundaries|Hold signals|Stop conditions|What counts as hold evidence|What not to record)/i.test(normalize(line));
}

function isNextSection(line) {
  return /^##\s+/.test(line);
}

function isNegatedClaimContext(line) {
  return /\b(if|later|future|only if|no|not|must not|does not|do not|none|without|forbidden|disallowed|absent|absence|unshipped|not implemented|not yet|cannot|never|unchanged|unless|only.*after|only.*when|reconsider|missing|imply|implication|misleading|risk|hold|boundary|boundaries)\b/i.test(line);
}

function forbiddenPositiveClaimGuardForFile(file) {
  const lines = read(file).split(/\r?\n/);
  let inForbiddenClaimSection = false;

  for (const rawLine of lines) {
    const line = normalize(rawLine);
    if (isForbiddenClaimSection(line)) {
      inForbiddenClaimSection = true;
      continue;
    }
    if (isNextSection(line)) inForbiddenClaimSection = false;
    if (inForbiddenClaimSection) continue;

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

      for (const broadPath of broadPathPatterns) {
        if (extractedPaths.some(path => path === broadPath)) {
          fail(`Historical validator ${validatorFile} adds forbidden broad path allowlist: '${broadPath}'`);
        }
      }

      for (const path of extractedPaths) {
        if (!path.includes(`/`)) continue;
        if (!path.endsWith(`.md`) && !path.endsWith(`.js`)) continue;
        if (phase20fForwardCompatEntries.includes(path)) continue;
        if (previousForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-20F path entry: '${path}'`);
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
  requireHeadings(RESULTS_LOG_FILE, requiredResultsLogHeadings);
  requireHeadings(EVIDENCE_PROTO_FILE, requiredEvidenceProtoHeadings);
  statusTokenGuard();
  relationshipGuard();
  noBetaReadyActiveClaimGuard();

  for (const term of requiredScenarioTerms) {
    requireTermAcrossFiles(term, [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]);
  }

  for (const term of requiredSafetyTerms) {
    requireTermAcrossFiles(term, [RESULTS_LOG_FILE, EVIDENCE_PROTO_FILE]);
  }

  forbiddenPositiveClaimGuardForFile(RESULTS_LOG_FILE);
  forbiddenPositiveClaimGuardForFile(EVIDENCE_PROTO_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 20F Performance / Quota / Import Stress Results Log validation passed.`);
}

validate();
