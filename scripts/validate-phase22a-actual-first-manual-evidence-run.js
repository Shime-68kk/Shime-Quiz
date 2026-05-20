#!/usr/bin/env node
/**
 * Phase 22A static validator - Actual First Manual Evidence Run Execution.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE = `docs/testing/phase22a-actual-first-manual-evidence-run.md`;
const SUMMARY = `docs/release/phase22a-first-manual-evidence-run-summary.md`;
const VALIDATOR = `scripts/validate-phase22a-actual-first-manual-evidence-run.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase22aPaths = [EVIDENCE, SUMMARY, VALIDATOR];
const phase23eForwardCompatPaths = [`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`, `docs/release/phase23e-data-survival-comprehension-plan-summary.md`, `scripts/validate-phase23e-data-survival-comprehension-plan.js`];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const phase24bForwardCompatPaths = [`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`, `docs/release/phase24b-storage-adapter-boundary-summary.md`, `scripts/validate-phase24b-storage-adapter-boundary-decision.js`];
const phase24cForwardCompatPaths = [`src/ui/helpTourStorage.js`, `src/ui/helpTour.js`, `tests/unit/helpTourStorageAdapterScaffold.test.js`, `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`, `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`, `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`];

const requiredEvidenceHeadings = [
  `# Phase 22A — Actual First Manual Evidence Run`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 21G`,
  `## Relationship to Phase 21E`,
  `## Relationship to Phase 21F`,
  `## Evidence source rules`,
  `## Privacy and anonymization rules`,
  `## Execution environment`,
  `## Execution status`,
  `## Commands run`,
  `## Manual/browser access status`,
  `## Data set used`,
  `## Backup-before-test confirmation`,
  `## Scenario results`,
  `## App startup result`,
  `## Onboarding result`,
  `## Small library result`,
  `## Study session result`,
  `## Backup result`,
  `## Restore result`,
  `## Manual transfer result`,
  `## Mobile/PWA result`,
  `## Trust-copy comprehension result`,
  `## Vietnamese-first copy comprehension result`,
  `## FSRS boundary result`,
  `## EduGen Draft Workshop boundary result`,
  `## beta-ai naming result`,
  `## Pass signals`,
  `## Hold signals`,
  `## Data safety notes`,
  `## Claim-safety notes`,
  `## Evidence completeness assessment`,
  `## Phase 22B handoff`,
  `## Phase 22C handoff`,
  `## Phase 22D handoff`,
];

const requiredSummaryHeadings = [
  `# Phase 22A — First Manual Evidence Run Summary`,
  `## Purpose`,
  `## Status`,
  `## Execution status`,
  `## Evidence quality`,
  `## What was executed`,
  `## What was not executed`,
  `## Pass signals`,
  `## Hold signals`,
  `## Data safety assessment`,
  `## Backup and restore assessment`,
  `## Manual transfer assessment`,
  `## Trust-copy comprehension assessment`,
  `## Vietnamese-first copy assessment`,
  `## FSRS and review schedule assessment`,
  `## EduGen boundary assessment`,
  `## Mobile/PWA assessment`,
  `## beta-ai naming assessment`,
  `## Remaining evidence gaps`,
  `## Recommendation`,
  `## Phase 22B relationship`,
  `## Phase 22C relationship`,
  `## Phase 22D readiness gate`,
];

const validEvidenceStatuses = [
  `PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`,
  `PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: BLOCKED_BY_ENVIRONMENT`,
  `PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: NOT_EXECUTED`,
];
const validExecutedStatuses = [
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES`,
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO`,
];

const requiredScenarioTerms = [
  `app startup`,
  `onboarding`,
  `small library`,
  `Study Room`,
  `backup`,
  `restore`,
  `manual transfer`,
  `mobile`,
  `PWA`,
  `trust-copy`,
  `Vietnamese-first`,
  `FSRS`,
  `EduGen`,
  `beta-ai`,
];

const requiredSafetyTerms = [
  `anonymized`,
  `generated/test data`,
  `No private study content`,
  `Backup is not sync`,
  `Restore may overwrite current data`,
  `manual transfer file`,
  `not cloud or account sync`,
  `no account/cloud/sync/backend`,
  `No telemetry`,
  `No app code was changed`,
  `Data-loss prevention is not guaranteed`,
];

const requiredReferences = [
  `Phase 21G`,
  `Phase 21E`,
  `Phase 21F`,
  `Phase 22B`,
  `Phase 22C`,
  `Phase 22D`,
];

const forbiddenClaims = [
  `BETA_READY`,
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

const forbiddenPrefixes = [
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
];
const forbiddenFiles = [`package.json`, `package-lock.json`, `sw.js`];
const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `coverage`,
  `test-results`,
  `playwright-report`,
  `FETCH_HEAD`,
  `phase22a-actual-first-manual-evidence-run.patch`,
  `phase22a-actual-first-manual-evidence-run.zip`,
  `phase22a-actual-first-manual-evidence-run-handoff.md`,
];
const allowedChanged = new Set([WORKFLOW, ...phase22aPaths]);
allowedChanged.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
allowedChanged.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
allowedChanged.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
allowedChanged.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
allowedChanged.add(`docs/release/phase23c-backup-health-design-summary.md`);
allowedChanged.add(`scripts/validate-phase23c-backup-health-design.js`);
allowedChanged.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
allowedChanged.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
allowedChanged.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
allowedChanged.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChanged.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChanged.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChanged.add(`docs/release/phase23f-phase23-decision-gate.md`);
allowedChanged.add(`docs/research/phase23f-data-survival-decision-matrix.md`);
allowedChanged.add(`scripts/validate-phase23f-phase23-decision-gate.js`);
allowedChanged.add(`docs/research/phase24a-residual-direct-storage-audit.md`);
allowedChanged.add(`docs/release/phase24a-residual-direct-storage-audit-summary.md`);
allowedChanged.add(`scripts/validate-phase24a-residual-direct-storage-audit.js`);
allowedChanged.add(`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`);
allowedChanged.add(`docs/release/phase24b-storage-adapter-boundary-summary.md`);
allowedChanged.add(`scripts/validate-phase24b-storage-adapter-boundary-decision.js`);
// Phase 24C forward-compat entries (Help Tour StorageAdapter scaffold)
allowedChanged.add(`src/ui/helpTourStorage.js`);
allowedChanged.add(`src/ui/helpTour.js`);
allowedChanged.add(`tests/unit/helpTourStorageAdapterScaffold.test.js`);
allowedChanged.add(`docs/research/phase24c-help-tour-storage-adapter-scaffold.md`);
allowedChanged.add(`docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`);
allowedChanged.add(`scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`);
allowedChanged.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChanged.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChanged.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChanged.add(`docs/release/phase23f-phase23-decision-gate.md`);
allowedChanged.add(`docs/research/phase23f-data-survival-decision-matrix.md`);
allowedChanged.add(`scripts/validate-phase23f-phase23-decision-gate.js`);
allowedChanged.add(`docs/research/phase24a-residual-direct-storage-audit.md`);
allowedChanged.add(`docs/release/phase24a-residual-direct-storage-audit-summary.md`);
allowedChanged.add(`scripts/validate-phase24a-residual-direct-storage-audit.js`);
allowedChanged.add(`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`);
allowedChanged.add(`docs/release/phase24b-storage-adapter-boundary-summary.md`);
allowedChanged.add(`scripts/validate-phase24b-storage-adapter-boundary-decision.js`);
allowedChanged.add(`docs/testing/phase22b-real-user-evidence-filled-results.md`);
allowedChanged.add(`docs/release/phase22b-real-user-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22b-fill-real-user-evidence-results.js`);
allowedChanged.add(`docs/testing/phase22c-stress-evidence-filled-results.md`);
allowedChanged.add(`docs/release/phase22c-stress-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22c-fill-stress-evidence-results.js`);
allowedChanged.add(`docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`);
allowedChanged.add(`docs/release/phase22d-beta-readiness-actual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
const phase22aForwardCompatPaths = new Set(phase22aPaths);
phase22aForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase22aForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase22aForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase22aForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
phase22aForwardCompatPaths.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase22aForwardCompatPaths.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
allowedChanged.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase22aForwardCompatPaths.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase22aForwardCompatPaths.add(`docs/testing/phase22b-real-user-evidence-filled-results.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22b-real-user-evidence-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22b-fill-real-user-evidence-results.js`);
phase22aForwardCompatPaths.add(`docs/testing/phase22c-stress-evidence-filled-results.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22c-stress-evidence-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22c-fill-stress-evidence-results.js`);
phase22aForwardCompatPaths.add(`docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22d-beta-readiness-actual-evidence-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);

allowedChanged.add(`docs/testing/phase22f-actual-stress-run.md`);
allowedChanged.add(`docs/release/phase22f-actual-stress-summary.md`);
allowedChanged.add(`scripts/validate-phase22f-actual-stress-run.js`);

allowedChanged.add(`docs/testing/phase22g-filled-evidence-update.md`);
allowedChanged.add(`docs/release/phase22g-filled-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22g-filled-evidence-update.js`);
allowedChanged.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
allowedChanged.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
allowedChanged.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
allowedChanged.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
allowedChanged.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
allowedChanged.add(`scripts/validate-phase23a-local-data-survival-research.js`);
phase22aForwardCompatPaths.add(`docs/testing/phase22f-actual-stress-run.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22f-actual-stress-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22f-actual-stress-run.js`);
phase22aForwardCompatPaths.add(`docs/testing/phase22g-filled-evidence-update.md`);
phase22aForwardCompatPaths.add(`docs/release/phase22g-filled-evidence-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22g-filled-evidence-update.js`);
phase22aForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase22aForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase22aForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase22aForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase22aForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);
function fail(message) {
  console.error(`Phase 22A validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
}

function normalize(text) {
  return text.replace(/\s+/g, ` `).trim();
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
  ].filter(file => !generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)));
  return [...new Set([...diffFiles, ...localFiles])].sort();
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function requireIncludes(file, terms) {
  const text = read(file);
  const lowered = text.toLowerCase();
  for (const term of terms) {
    if (!lowered.includes(term.toLowerCase())) fail(`${file} is missing required text: ${term}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase21g = `node scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`;
  const phase22a = `node scripts/validate-phase22a-actual-first-manual-evidence-run.js`;
  if (!workflow.includes(phase22a)) fail(`CI does not register Phase 22A validator`);
  if (workflow.indexOf(phase22a) <= workflow.indexOf(phase21g)) {
    fail(`CI must register Phase 22A after Phase 21G`);
  }
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateStatusTokens() {
  const combined = `${read(EVIDENCE)}\n${read(SUMMARY)}`;
  const evidenceMatches = validEvidenceStatuses.filter(status => combined.includes(status));
  const executedMatches = validExecutedStatuses.filter(status => combined.includes(status));
  if (evidenceMatches.length !== 1) fail(`Expected exactly one valid Phase 22A evidence status token`);
  if (executedMatches.length !== 1) fail(`Expected exactly one valid first-run executed token`);

  const evidenceStatus = evidenceMatches[0];
  const executedStatus = executedMatches[0];
  const evidence = normalize(read(EVIDENCE)).toLowerCase();
  const summary = normalize(read(SUMMARY)).toLowerCase();
  const combinedLower = `${evidence} ${summary}`;

  if (evidenceStatus.includes(`EXECUTED_WITH_ANONYMIZED_RESULTS`) !== executedStatus.endsWith(`YES`)) {
    fail(`Executed evidence status and first-run executed token disagree`);
  }

  if (executedStatus.endsWith(`YES`)) {
    for (const term of [`commands run`, `anonymized`, `observed`, `playwright`, `backup`, `restore`, `study`, `mobile`]) {
      if (!combinedLower.includes(term)) fail(`Executed status requires anonymized command/scenario observations: ${term}`);
    }
    if (/not executed for this record|no actual first-run result was provided/i.test(combinedLower)) {
      fail(`Executed status must not include not-executed result claims`);
    }
  } else {
    const unsafeExecutedClaims = [
      `was executed with anonymized results`,
      `actual anonymized observations`,
      `restore completed`,
      `import succeeded`,
    ];
    for (const claim of unsafeExecutedClaims) {
      if (combinedLower.includes(claim)) fail(`Non-executed status must not claim executed results: ${claim}`);
    }
  }
}

function validateChangedScope() {
  const files = changedFiles();
  for (const file of files) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked or present in changed files: ${file}`);
    }
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (allowedChanged.has(file)) continue;
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Forbidden runtime/test/e2e/package path changed: ${file}`);
    }
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) {
      fail(`Unexpected changed file: ${file}`);
    }
  }
}

function validateNoActiveForbiddenClaims() {
  const combined = normalize(`${read(EVIDENCE)}\n${read(SUMMARY)}`).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 900), index + needle.length + 260);
      const safeContext = /not claimed|does not claim|must not|not claim|no .*claim|not enough|not complete|not tested|unacceptable|forbidden|hold remains active|unless enough|data-loss prevention is not guaranteed|no built-in|no critical|no beta|zero/.test(context);
      if (!safeContext) fail(`Forbidden positive claim appears outside forbidden/warning section: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
  if (/BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(`${read(EVIDENCE)}\n${read(SUMMARY)}`)) {
    fail(`Active BETA_READY claim found`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR && file !== `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase23e-data-survival-comprehension-plan.js`) continue;
    if (file === `scripts/validate-phase23f-phase23-decision-gate.js`) continue;
    if (file === `scripts/validate-phase24a-residual-direct-storage-audit.js`) continue;
    if (file === `scripts/validate-phase24b-storage-adapter-boundary-decision.js`) continue;
    if (file === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    const removedLines = diff.split(/\r?\n/)
      .filter(line => line.startsWith(`-`) && !line.startsWith(`---`))
      .map(line => line.slice(1).trim());
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      if (line.includes(`phase23eForwardCompatPaths`)) continue;
      if (line.includes(`phase23fForwardCompatPaths`)) continue;
      if (line.includes(`phase24aForwardCompatPaths`)) continue;
      if (line.includes(`phase24bForwardCompatPaths`)) continue;
      if (line.includes(`phase24cForwardCompatPaths`)) continue;
      if (line.includes(`Phase 24C forward-compat entries`)) continue;
      if (line.includes(`allowedChanged.has(file)`)) continue;
      if (line.includes(`AllowedChangedFiles.has(file)`)) continue;
      if (line.includes(`allowedChangedFiles.has(file)`)) continue;
      if (line.includes(`isPhase23f`)) continue;
      if (line.includes(`isPhase24a`)) continue;
      if (line.includes(`isPhase24b`)) continue;
      if (line.includes(`isPhase24c`)) continue;
      const added = line.slice(1).trim();
      const isCommaOnlyContinuationChange = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added
        || removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (isCommaOnlyContinuationChange) continue;
      if (![...phase22aForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22A forward-compat addition: ${line}`);
      }
      for (const path of [...phase22aForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths]) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22A path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase22aPaths) read(file);
requireHeadings(EVIDENCE, requiredEvidenceHeadings);
requireHeadings(SUMMARY, requiredSummaryHeadings);
requireIncludes(EVIDENCE, requiredScenarioTerms);
requireIncludes(SUMMARY, requiredScenarioTerms);
requireIncludes(EVIDENCE, requiredSafetyTerms);
requireIncludes(SUMMARY, [`anonymized`, `generated/test data`, `Data-loss prevention is not guaranteed`, `BETA_READY is not claimed`]);
requireIncludes(EVIDENCE, requiredReferences);
requireIncludes(SUMMARY, requiredReferences);
validateWorkflow();
validateStatusTokens();
validateChangedScope();
validateNoActiveForbiddenClaims();
validateHistoricalForwardCompat();

console.log(`Phase 22A actual first manual evidence run validation passed.`);
