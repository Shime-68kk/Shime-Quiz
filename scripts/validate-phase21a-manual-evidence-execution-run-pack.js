#!/usr/bin/env node
/**
 * scripts/validate-phase21a-manual-evidence-execution-run-pack.js
 *
 * Phase 21A static validator — Manual Evidence Execution Run Pack.
 *
 * Phase 21A is docs/static-validator/CI-only. It does not implement runtime
 * behavior, tests, e2e, dependencies, telemetry, analytics, import/storage/
 * backup/FSRS/sync runtime changes, cloud/account/auth/backend, or service
 * worker behavior.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RUN_PACK_FILE = `docs/testing/phase21a-manual-evidence-execution-run-pack.md`;
const SAFETY_CHECKLIST_FILE = `docs/release/phase21a-evidence-execution-safety-checklist.md`;
const VALIDATOR_SCRIPT = `scripts/validate-phase21a-manual-evidence-execution-run-pack.js`;
const WORKFLOW_FILE = `.github/workflows/e2e-smoke.yml`;

const PHASE20J_ADR = `docs/adr/phase20j-final-beta-readiness-redecision.md`;
const PHASE20J_SUMMARY = `docs/release/phase20j-final-beta-readiness-evidence-summary.md`;
const PHASE20J_VALIDATOR = `scripts/validate-phase20j-final-beta-readiness-redecision.js`;

const phase21aForwardCompatEntries = [
  `scripts/validate-phase23e-data-survival-comprehension-plan.js`,
  `scripts/validate-phase23f-phase23-decision-gate.js`,
  `docs/research/phase24a-residual-direct-storage-audit.md`,
  `docs/release/phase24a-residual-direct-storage-audit-summary.md`,
  `scripts/validate-phase24a-residual-direct-storage-audit.js`,
  `docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`,
  `docs/release/phase24b-storage-adapter-boundary-summary.md`,
  `scripts/validate-phase24b-storage-adapter-boundary-decision.js`,
  RUN_PACK_FILE,
  SAFETY_CHECKLIST_FILE,
  VALIDATOR_SCRIPT,
  `docs/testing/phase21b-real-user-testing-filled-results.md`,
  `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `docs/testing/phase21c-stress-testing-filled-results.md`,
  `docs/release/phase21c-stress-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
  `docs/adr/phase21d-beta-readiness-redecision-filled-evidence.md`,
  `docs/release/phase21d-beta-readiness-filled-evidence-summary.md`,
  `scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`,
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
  `scripts/validate-phase22e-broader-manual-evidence.js`,
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
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
  `phase21a-manual-evidence-execution-run-pack.patch`,
  `phase21a-manual-evidence-execution-run-pack.zip`,
  `phase21a-manual-evidence-execution-run-pack-handoff.md`,
];

const requiredRunPackHeadings = [
  `# Phase 21A — Manual Evidence Execution Run Pack`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 20J`,
  `## Evidence execution principle`,
  `## Required tester safety rules`,
  `## Required pre-run backup`,
  `## Required test data rules`,
  `## Real-user testing run sequence`,
  `## Stress testing run sequence`,
  `## Onboarding scenario`,
  `## Small library scenario`,
  `## Larger library import scenario`,
  `## Study session scenario`,
  `## Backup and restore scenario`,
  `## Manual transfer scenario`,
  `## Mobile/PWA scenario`,
  `## FSRS boundary scenario`,
  `## EduGen Draft Workshop boundary scenario`,
  `## Local-first trust-copy comprehension scenario`,
  `## Vietnamese-first copy comprehension scenario`,
  `## Stop conditions`,
  `## Evidence recording format`,
  `## Pass signal checklist`,
  `## Hold signal checklist`,
  `## Claim boundaries`,
  `## Phase 21B handoff`,
  `## Phase 21C handoff`,
  `## Phase 21D handoff`,
];

const requiredSafetyHeadings = [
  `# Phase 21A — Evidence Execution Safety Checklist`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 20J HOLD`,
  `## Who may run this checklist`,
  `## What data may be used`,
  `## What data must not be used`,
  `## Backup-before-test checklist`,
  `## Restore-risk checklist`,
  `## Import-risk checklist`,
  `## Manual-transfer-risk checklist`,
  `## FSRS/review-schedule-risk checklist`,
  `## Mobile/PWA-risk checklist`,
  `## Trust-copy-risk checklist`,
  `## Privacy checklist`,
  `## Evidence quality checklist`,
  `## Stop conditions`,
  `## Required artifacts from a manual run`,
  `## What counts as usable evidence`,
  `## What does not count as usable evidence`,
  `## Claim boundaries`,
  `## Phase 21B relationship`,
  `## Phase 21C relationship`,
  `## Phase 21D readiness gate`,
];

const requiredStatusToken =
  `MANUAL_EVIDENCE_RUN_PACK_STATUS: READY_FOR_MANUAL_EXECUTION`;
const requiredHoldToken =
  `LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION: HOLD_EXECUTED_EVIDENCE_REQUIRED`;

const requiredScenarioTerms = [
  `onboarding`,
  `create/import small library`,
  `import larger library`,
  `study session`,
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
  `Vietnamese-first copy comprehension`,
  `local-first trust-copy comprehension`,
];

const requiredSafetyTerms = [
  `Phase 21A creates a manual run pack only`,
  `Phase 21A does not execute the run pack`,
  `does not collect telemetry`,
  `does not add analytics`,
  `does not add runtime instrumentation`,
  `Testers must not use irreplaceable study data without backup`,
  `Testers should use duplicate/generated/test data where possible`,
  `Create a backup before risky import`,
  `Testing must stop if backup/restore behavior is unclear`,
  `Testing must stop if the user believes cloud/account/backend exists`,
  `Testing must stop if due/review schedule counts appear inconsistent`,
  `Testing must stop if beta-ai naming`,
  `No private study content should be copied into public docs`,
  `No contact information should be recorded`,
  `No credentials should be recorded`,
  `No telemetry/analytics should be added`,
  `No cloud/account/backend claims should be made`,
  `No AI/OCR/AI quiz generation claims should be made`,
  `Evidence should be anonymized and summarized`,
  `Raw sensitive test content should not be committed`,
  `BETA_READY requires actual evidence after 21B/21C and a 21D re-decision`,
];

const forbiddenPositiveClaims = [
  `manual evidence has been executed`,
  `real user testing is complete`,
  `stress testing is complete`,
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

const allowedChangedFiles = new Set([
  WORKFLOW_FILE,
  RUN_PACK_FILE,
  SAFETY_CHECKLIST_FILE,
  VALIDATOR_SCRIPT,
  `docs/testing/phase21b-real-user-testing-filled-results.md`,
  `docs/release/phase21b-real-user-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21b-real-user-testing-filled-results.js`,
  `docs/testing/phase21c-stress-testing-filled-results.md`,
  `docs/release/phase21c-stress-testing-filled-evidence-summary.md`,
  `scripts/validate-phase21c-stress-testing-filled-results.js`,
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
  `scripts/validate-phase22e-broader-manual-evidence.js`,
  `docs/testing/phase22g-filled-evidence-update.md`,
  `docs/release/phase22g-filled-evidence-summary.md`,
  `scripts/validate-phase22g-filled-evidence-update.js`,
  `docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`,
  `docs/testing/phase22h-beta-readiness-evidence-matrix.md`,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`,
  `docs/release/phase23a-local-data-survival-research-summary.md`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `docs/testing/phase22f-actual-stress-run.md`,
  `docs/release/phase22f-actual-stress-summary.md`,
  `scripts/validate-phase22f-actual-stress-run.js`,
]);
allowedChangedFiles.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
allowedChangedFiles.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
allowedChangedFiles.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
allowedChangedFiles.add(`docs/release/phase23c-backup-health-design-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase23c-backup-health-design.js`);
allowedChangedFiles.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
allowedChangedFiles.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
allowedChangedFiles.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChangedFiles.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChangedFiles.add(`docs/release/phase23f-phase23-decision-gate.md`);
allowedChangedFiles.add(`docs/research/phase23f-data-survival-decision-matrix.md`);
allowedChangedFiles.add(`scripts/validate-phase23f-phase23-decision-gate.js`);
allowedChangedFiles.add(`docs/research/phase24a-residual-direct-storage-audit.md`);
allowedChangedFiles.add(`docs/release/phase24a-residual-direct-storage-audit-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase24a-residual-direct-storage-audit.js`);
allowedChangedFiles.add(`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`);
allowedChangedFiles.add(`docs/release/phase24b-storage-adapter-boundary-summary.md`);
allowedChangedFiles.add(`scripts/validate-phase24b-storage-adapter-boundary-decision.js`);

function fail(message) {
  console.error(`Phase 21A validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 21A validation warning: ${message}`);
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
    RUN_PACK_FILE,
    SAFETY_CHECKLIST_FILE,
    VALIDATOR_SCRIPT,
    WORKFLOW_FILE,
    PHASE20J_ADR,
    PHASE20J_SUMMARY,
    PHASE20J_VALIDATOR,
  ]) {
    read(file);
  }
}

function workflowGuard() {
  const text = read(WORKFLOW_FILE);
  const phase20jStr = `node scripts/validate-phase20j-final-beta-readiness-redecision.js`;
  const phase21aStr = `node scripts/validate-phase21a-manual-evidence-execution-run-pack.js`;

  if (!text.includes(phase20jStr)) fail(`${WORKFLOW_FILE} must register Phase 20J validator`);
  if (!text.includes(phase21aStr)) fail(`${WORKFLOW_FILE} must register Phase 21A validator`);
  if (text.indexOf(phase21aStr) <= text.indexOf(phase20jStr)) {
    fail(`${WORKFLOW_FILE} must register Phase 21A after Phase 20J`);
  }
  if (/continue-on-error:\s*true/i.test(text)) fail(`${WORKFLOW_FILE} must not use continue-on-error: true`);
}

function scopeGuard() {
  for (const file of changedFiles()) {
    if ([`docs/testing/phase21e-manual-evidence-first-run-pack.md`, `docs/testing/phase21e-fillable-evidence-session-template.md`, `docs/release/phase21e-first-run-safety-and-claim-checklist.md`, `scripts/validate-phase21e-manual-evidence-first-run-pack.js`].includes(file)) continue;
    if (isGeneratedArtifact(file)) continue;
    if (allowedChangedFiles.has(file)) continue;
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`)) continue;
    if (runtimeFilePrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Runtime, test, e2e, import, storage, backup, FSRS, sync, cloud, account, auth, backend, or UI file changed in Phase 21A: ${file}`);
    }
    if (file === `package.json`) fail(`package.json changed in Phase 21A (forbidden)`);
    if (file === `package-lock.json`) fail(`package-lock.json changed in Phase 21A (forbidden)`);
    if (file === `sw.js`) fail(`sw.js changed in Phase 21A (forbidden)`);
    fail(`Unexpected changed file outside Phase 21A scope: ${file}`);
  }
}

function requireHeadings(file, headings) {
  const text = normalize(read(file));
  for (const heading of headings) {
    if (!text.includes(normalize(heading))) fail(`${file} must include required heading: "${heading}"`);
  }
}

function combinedDocs() {
  return `${read(RUN_PACK_FILE)}\n${read(SAFETY_CHECKLIST_FILE)}`;
}

function requireTermAcrossDocs(term) {
  if (!lowerNormalized(combinedDocs()).includes(lowerNormalized(term))) {
    fail(`Required term "${term}" not found across Phase 21A docs`);
  }
}

function tokenGuard() {
  const combined = combinedDocs();
  if (!combined.includes(requiredStatusToken)) fail(`Phase 21A docs must include ${requiredStatusToken}`);
  if (!combined.includes(requiredHoldToken)) fail(`Phase 21A docs must reference ${requiredHoldToken}`);
  if (!read(PHASE20J_ADR).includes(requiredHoldToken)) fail(`Phase 20J HOLD / executed-evidence-required decision is missing`);
}

function betaReadyDecisionGuard() {
  const activeBetaReadyPattern =
    /LOCAL_FIRST_HYBRID_BETA_(?:FINAL_)?REDECISION\s*:\s*BETA_READY|LOCAL_FIRST_HYBRID_BETA_FINAL_DECISION\s*:\s*BETA_READY/;
  if (activeBetaReadyPattern.test(combinedDocs())) {
    fail(`Phase 21A must not declare BETA_READY`);
  }
}

function sectionName(line) {
  const match = normalize(line).match(/^##\s+(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function isForbiddenOrWarningSection(name) {
  return [
    `claim boundaries`,
    `stop conditions`,
    `hold signal checklist`,
    `what does not count as usable evidence`,
    `phase 21d handoff`,
    `phase 21d readiness gate`,
  ].includes(name);
}

function isNegatedClaimContext(line) {
  return /\b(if|unless|only if|only after|after|future|no|not|must not|does not|do not|none|without|forbidden|absent|absence|unshipped|not implemented|not selected|not supported|not allowed|not shipped|cannot|never|unchanged|reconsider|missing|imply|implied|misleading|hold|boundary|boundaries|pending|zero|is not|are not|requires|required|remains forbidden|do not claim)\b/i.test(line);
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
    if (validatorFile === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
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
        if (phase21aForwardCompatEntries.includes(path)) continue;
        if (path.startsWith(`docs/`) || path.startsWith(`tests/`) || path.startsWith(`scripts/`)) {
          fail(`Historical validator ${validatorFile} adds non-Phase-21A path entry: '${path}'`);
        }
      }
    }
  }
}

function validate() {
  requiredFilesGuard();
  workflowGuard();
  scopeGuard();
  requireHeadings(RUN_PACK_FILE, requiredRunPackHeadings);
  requireHeadings(SAFETY_CHECKLIST_FILE, requiredSafetyHeadings);
  tokenGuard();
  betaReadyDecisionGuard();

  for (const term of requiredScenarioTerms) requireTermAcrossDocs(term);
  for (const term of requiredSafetyTerms) requireTermAcrossDocs(term);

  forbiddenPositiveClaimGuardForFile(RUN_PACK_FILE);
  forbiddenPositiveClaimGuardForFile(SAFETY_CHECKLIST_FILE);
  generatedArtifactGuard();
  historicalValidatorForwardCompatGuard();
  console.log(`Phase 21A Manual Evidence Execution Run Pack validation passed.`);
}

validate();
