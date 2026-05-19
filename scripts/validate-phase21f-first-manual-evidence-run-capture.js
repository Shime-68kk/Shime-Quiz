#!/usr/bin/env node
/**
 * Phase 21F static validator - First Manual Evidence Run Capture.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const CAPTURE = `docs/testing/phase21f-first-manual-evidence-run-capture.md`;
const SUMMARY = `docs/release/phase21f-first-manual-evidence-run-summary.md`;
const VALIDATOR = `scripts/validate-phase21f-first-manual-evidence-run-capture.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase21fPaths = [CAPTURE, SUMMARY, VALIDATOR, `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`, `docs/release/phase21g-phase22-readiness-handoff.md`, `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`, `docs/testing/phase22a-actual-first-manual-evidence-run.md`, `docs/release/phase22a-first-manual-evidence-run-summary.md`, `scripts/validate-phase22a-actual-first-manual-evidence-run.js`, `docs/testing/phase22b-real-user-evidence-filled-results.md`, `docs/release/phase22b-real-user-evidence-summary.md`, `scripts/validate-phase22b-fill-real-user-evidence-results.js`, `docs/testing/phase22c-stress-evidence-filled-results.md`, `docs/release/phase22c-stress-evidence-summary.md`, `scripts/validate-phase22c-fill-stress-evidence-results.js`, `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`, `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`, `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`, `docs/testing/phase22e-broader-manual-evidence-run.md`, `docs/release/phase22e-broader-manual-evidence-summary.md`, `scripts/validate-phase22e-broader-manual-evidence.js`, `docs/testing/phase22f-actual-stress-run.md`, `docs/release/phase22f-actual-stress-summary.md`, `scripts/validate-phase22f-actual-stress-run.js`];
phase21fPaths.push(`docs/testing/phase22g-filled-evidence-update.md`);
phase21fPaths.push(`docs/release/phase22g-filled-evidence-summary.md`);
phase21fPaths.push(`scripts/validate-phase22g-filled-evidence-update.js`);

const requiredCaptureHeadings = [
  `# Phase 21F — First Manual Evidence Run Capture`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 21E`,
  `## Relationship to Phase 21D`,
  `## Evidence source rules`,
  `## Privacy and anonymization rules`,
  `## First run execution status`,
  `## Captured run metadata`,
  `## Environment observed`,
  `## Version observed`,
  `## Data set used`,
  `## Backup-before-test confirmation`,
  `## Scenario results`,
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
  `## Pass signals`,
  `## Hold signals`,
  `## Data safety notes`,
  `## Claim-safety notes`,
  `## Evidence completeness assessment`,
  `## Phase 21G handoff`,
  `## Phase 21H handoff`,
];

const requiredSummaryHeadings = [
  `# Phase 21F — First Manual Evidence Run Summary`,
  `## Purpose`,
  `## Status`,
  `## Execution status`,
  `## Evidence quality`,
  `## What was captured`,
  `## What was not captured`,
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
  `## Phase 21G relationship`,
  `## Phase 21H readiness gate`,
];

const requiredTerms = [
  `FIRST_MANUAL_EVIDENCE_RUN_CAPTURE_STATUS: CAPTURE_DOCUMENT_READY`,
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO`,
  `Phase 21F creates a capture document for the first manual evidence run`,
  `Results must be based only on actual user/tester-provided evidence`,
  `Do not record private study content`,
  `Do not record contact information`,
  `Do not record credentials`,
  `does not collect telemetry`,
  `does not add analytics`,
  `HOLD remains active until enough evidence exists`,
  `BETA_READY is not claimed in Phase 21F`,
  `Phase 21E`,
  `Phase 21D`,
];

const scenarioTerms = [
  `onboarding`,
  `create/import small library`,
  `study session`,
  `due cards / review schedule count`,
  `backup before risky action`,
  `restore from backup`,
  `manual export/import transfer`,
  `mobile/PWA basic usage`,
  `local-first copy comprehension`,
  `no-cloud/default-off trust copy`,
  `Vietnamese-first copy comprehension`,
  `FSRS experimental/off/default boundary`,
  `EduGen Draft Workshop boundary`,
  `beta-ai naming absence`,
  `Backup is not sync`,
  `Restore may overwrite current data`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
];

const safetyTerms = [
  `anonymized`,
  `No private study content`,
  `contact information`,
  `credentials`,
  `telemetry`,
  `analytics`,
  `backup file contents`,
  `raw sensitive test content`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
];

const forbiddenClaims = [
  `first manual evidence run has been executed`,
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

const allowedChanged = new Set([WORKFLOW, ...phase21fPaths]);
allowedChanged.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
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
  `phase21f-first-manual-evidence-run-capture.patch`,
  `phase21f-first-manual-evidence-run-capture.zip`,
  `phase21f-first-manual-evidence-run-capture-handoff.md`,
];

allowedChanged.add(`docs/testing/phase22f-actual-stress-run.md`);
allowedChanged.add(`docs/release/phase22f-actual-stress-summary.md`);
allowedChanged.add(`scripts/validate-phase22f-actual-stress-run.js`);

allowedChanged.add(`docs/testing/phase22g-filled-evidence-update.md`);
allowedChanged.add(`docs/release/phase22g-filled-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22g-filled-evidence-update.js`);
function fail(message) {
  console.error(`Phase 21F validation failed: ${message}`);
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

function requireIncludes(file, terms) {
  const text = read(file);
  const lowered = text.toLowerCase();
  for (const term of terms) {
    if (!lowered.includes(term.toLowerCase())) fail(`${file} is missing required text: ${term}`);
  }
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
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

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase21e = `node scripts/validate-phase21e-manual-evidence-first-run-pack.js`;
  const phase21f = `node scripts/validate-phase21f-first-manual-evidence-run-capture.js`;
  if (!workflow.includes(phase21f)) fail(`CI does not register Phase 21F validator`);
  if (workflow.indexOf(phase21f) <= workflow.indexOf(phase21e)) {
    fail(`CI must register Phase 21F after Phase 21E`);
  }
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateChangedScope() {
  const files = changedFiles();
  for (const file of files) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked or present in changed files: ${file}`);
    }
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden runtime/test/e2e path changed: ${file}`);
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) {
      fail(`Unexpected changed file: ${file}`);
    }
  }
}

function validateNoActiveForbiddenClaims() {
  const combined = normalize(`${read(CAPTURE)}\n${read(SUMMARY)}`).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 1000), index + needle.length + 160);
      const safeContext = /forbidden claims after phase 21f|forbidden claims|unless actual results were provided|does not claim|do not claim|not claimed|not acceptable|must not be described|no |not |without |no .* claimed/.test(context);
      if (!safeContext) fail(`Forbidden positive claim appears outside forbidden/warning section: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
  if (/BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(`${read(CAPTURE)}\n${read(SUMMARY)}`)) {
    fail(`Active BETA_READY claim found`);
  }
}

function validateNoExecutedClaimWithoutEvidence() {
  const combined = normalize(`${read(CAPTURE)}\n${read(SUMMARY)}`).toLowerCase();
  if (!combined.includes(`first_manual_evidence_run_executed: no`)) {
    fail(`Missing FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO`);
  }
  if (/first manual evidence run (was|is) executed/i.test(combined)) {
    fail(`Claim that the run has executed appears without actual evidence`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR && file !== `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      if (!phase21fPaths.some(path => line.includes(path))) {
        fail(`${file} has non-Phase-21F forward-compat addition: ${line}`);
      }
      for (const path of phase21fPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 21F path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase21fPaths) read(file);
requireHeadings(CAPTURE, requiredCaptureHeadings);
requireHeadings(SUMMARY, requiredSummaryHeadings);
requireIncludes(CAPTURE, requiredTerms);
requireIncludes(SUMMARY, requiredTerms);
requireIncludes(CAPTURE, scenarioTerms);
requireIncludes(SUMMARY, scenarioTerms);
requireIncludes(CAPTURE, safetyTerms);
requireIncludes(SUMMARY, safetyTerms);
validateWorkflow();
validateChangedScope();
validateNoActiveForbiddenClaims();
validateNoExecutedClaimWithoutEvidence();
validateHistoricalForwardCompat();

console.log(`Phase 21F first manual evidence run capture validation passed.`);
