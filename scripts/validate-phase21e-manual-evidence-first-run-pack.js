#!/usr/bin/env node
/**
 * Phase 21E static validator - Manual Evidence First Run Pack.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PACK = `docs/testing/phase21e-manual-evidence-first-run-pack.md`;
const TEMPLATE = `docs/testing/phase21e-fillable-evidence-session-template.md`;
const CHECKLIST = `docs/release/phase21e-first-run-safety-and-claim-checklist.md`;
const VALIDATOR = `scripts/validate-phase21e-manual-evidence-first-run-pack.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase21ePaths = [PACK, TEMPLATE, CHECKLIST, VALIDATOR, `docs/testing/phase21f-first-manual-evidence-run-capture.md`, `docs/release/phase21f-first-manual-evidence-run-summary.md`, `scripts/validate-phase21f-first-manual-evidence-run-capture.js`, `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`, `docs/release/phase21g-phase22-readiness-handoff.md`, `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`, `docs/testing/phase22a-actual-first-manual-evidence-run.md`, `docs/release/phase22a-first-manual-evidence-run-summary.md`, `scripts/validate-phase22a-actual-first-manual-evidence-run.js`, `docs/testing/phase22b-real-user-evidence-filled-results.md`, `docs/release/phase22b-real-user-evidence-summary.md`, `scripts/validate-phase22b-fill-real-user-evidence-results.js`];

const requiredPackHeadings = [
  `# Phase 21E — Manual Evidence First Run Pack`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 21A`,
  `## Relationship to Phase 21D`,
  `## First-run principle`,
  `## Who should run this`,
  `## What data to use`,
  `## What data not to use`,
  `## Pre-run backup checklist`,
  `## First-run sequence overview`,
  `## Step 1 — Environment and version check`,
  `## Step 2 — Create or import small library`,
  `## Step 3 — Study session check`,
  `## Step 4 — Backup creation check`,
  `## Step 5 — Restore rehearsal check`,
  `## Step 6 — Manual transfer rehearsal check`,
  `## Step 7 — Mobile/PWA observation check`,
  `## Step 8 — Local-first trust-copy comprehension check`,
  `## Step 9 — Vietnamese-first copy comprehension check`,
  `## Step 10 — Evidence summary`,
  `## Stop conditions`,
  `## Fillable evidence handoff`,
  `## Claim boundaries`,
  `## Phase 21F handoff`,
  `## Phase 21G handoff`,
  `## Phase 21H handoff`,
];

const requiredTemplateHeadings = [
  `# Phase 21E — Fillable Evidence Session Template`,
  `## Purpose`,
  `## Status`,
  `## Privacy rules`,
  `## Session metadata`,
  `## Tester profile`,
  `## Environment`,
  `## Version observed`,
  `## Data set used`,
  `## Backup-before-test confirmation`,
  `## Scenario checklist`,
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
  `## Final tester summary`,
  `## Leader review notes`,
];

const requiredChecklistHeadings = [
  `# Phase 21E — First Run Safety and Claim Checklist`,
  `## Purpose`,
  `## Status`,
  `## Before the run`,
  `## During the run`,
  `## After the run`,
  `## Data safety checklist`,
  `## Backup and restore checklist`,
  `## Manual transfer checklist`,
  `## Trust-copy checklist`,
  `## Vietnamese-first copy checklist`,
  `## FSRS boundary checklist`,
  `## EduGen boundary checklist`,
  `## Mobile/PWA checklist`,
  `## Claim-safety checklist`,
  `## Stop conditions`,
  `## What may be recorded`,
  `## What must not be recorded`,
  `## How to summarize evidence`,
  `## Phase 21F readiness gate`,
  `## Phase 21G readiness gate`,
  `## Phase 21H readiness gate`,
];

const requiredTerms = [
  `MANUAL_EVIDENCE_FIRST_RUN_PACK_STATUS: READY_FOR_FIRST_MANUAL_RUN`,
  `MANUAL_EVIDENCE_FIRST_RUN_COMPLETED: NO`,
  `LOCAL_FIRST_HYBRID_BETA_FILLED_EVIDENCE_DECISION: HOLD_INSUFFICIENT_FILLED_EVIDENCE`,
  `REAL_USER_TEST_FILLED_SESSIONS: 0`,
  `PERFORMANCE_STRESS_FILLED_RUNS: 0`,
  `Phase 21E does not execute the first run`,
  `HOLD remains active until actual filled evidence exists`,
  `BETA_READY is not claimed`,
  `duplicate/generated/test data`,
  `Do not use irreplaceable study data without backup`,
  `Backup is not sync`,
  `Restore may overwrite current data`,
  `Stop if backup/restore behavior is unclear`,
  `Stop if the tester believes backup is sync`,
  `Stop if the tester believes cloud/account/backend exists`,
  `Stop if due/review counts look inconsistent`,
  `Stop if beta-ai or AI capability implication appears`,
];

const scenarioTerms = [
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
  `Backup is not sync`,
  `restore may overwrite current data`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
  `Vietnamese-first copy comprehension`,
  `local-first trust-copy comprehension`,
];

const safetyTerms = [
  `no private study content should be committed`,
  `No contact info should be recorded`,
  `No credentials should be recorded`,
  `No telemetry/analytics should be added`,
  `no cloud/account/backend claims`,
  `no AI/OCR/AI quiz generation claims`,
  `Evidence should be anonymized and summarized`,
  `Raw sensitive test content should not be committed`,
  `BETA_READY requires actual filled evidence and a later re-decision`,
  `[fill after manual run]`,
  `[do not include private study content]`,
  `[pass / hold / not tested]`,
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

const allowedChanged = new Set([WORKFLOW, ...phase21ePaths]);
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
  `phase21e-manual-evidence-first-run-pack.patch`,
  `phase21e-manual-evidence-first-run-pack.zip`,
  `phase21e-manual-evidence-first-run-pack-handoff.md`,
];

function fail(message) {
  console.error(`Phase 21E validation failed: ${message}`);
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
  const phase21d = `node scripts/validate-phase21d-beta-readiness-redecision-filled-evidence.js`;
  const phase21e = `node scripts/validate-phase21e-manual-evidence-first-run-pack.js`;
  if (!workflow.includes(phase21e)) fail(`CI does not register Phase 21E validator`);
  if (workflow.indexOf(phase21e) <= workflow.indexOf(phase21d)) {
    fail(`CI must register Phase 21E after Phase 21D`);
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
  const combined = normalize(`${read(PACK)}\n${read(TEMPLATE)}\n${read(CHECKLIST)}`).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    const first = combined.indexOf(needle);
    if (first === -1) continue;
    const allowedContext = combined.lastIndexOf(`forbidden claims after phase 21e`, first);
    if (allowedContext === -1 || first - allowedContext > 1200) {
      fail(`Forbidden positive claim appears outside forbidden/warning section: ${claim}`);
    }
  }
  if (/\bBETA_READY\b/.test(read(PACK).replace(`BETA_READY is not claimed`, ``))) {
    // Other mentions are allowed only as explicit negative or later-gate warnings.
    const activeReady = /BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(read(PACK));
    if (activeReady) fail(`Active BETA_READY claim found`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR);
  for (const file of changedValidators) {
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      if (!phase21ePaths.some(path => line.includes(path))) {
        fail(`${file} has non-Phase-21E forward-compat addition: ${line}`);
      }
      for (const path of phase21ePaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 21E path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase21ePaths) read(file);
requireHeadings(PACK, requiredPackHeadings);
requireHeadings(TEMPLATE, requiredTemplateHeadings);
requireHeadings(CHECKLIST, requiredChecklistHeadings);
requireIncludes(PACK, requiredTerms);
requireIncludes(`${PACK}`, scenarioTerms);
requireIncludes(CHECKLIST, safetyTerms);
requireIncludes(TEMPLATE, [`[fill after manual run]`, `[do not include private study content]`, `[pass / hold / not tested]`]);
validateWorkflow();
validateChangedScope();
validateNoActiveForbiddenClaims();
validateHistoricalForwardCompat();

console.log(`Phase 21E manual evidence first-run pack validation passed.`);
