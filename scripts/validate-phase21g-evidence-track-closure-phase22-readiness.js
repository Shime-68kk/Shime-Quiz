#!/usr/bin/env node
/**
 * Phase 21G static validator - Evidence Track Closure / Phase 22 Readiness.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR = `docs/adr/phase21g-evidence-track-closure-phase22-readiness.md`;
const HANDOFF = `docs/release/phase21g-phase22-readiness-handoff.md`;
const VALIDATOR = `scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase21gPaths = [ADR, HANDOFF, VALIDATOR];

const requiredAdrHeadings = [
  `# Phase 21G — Evidence Track Closure / Phase 22 Readiness`,
  `## Purpose`,
  `## Closure decision`,
  `## Phase 21 status`,
  `## Evidence artifacts created`,
  `## Evidence not yet executed`,
  `## Relationship to Phase 21A`,
  `## Relationship to Phase 21B`,
  `## Relationship to Phase 21C`,
  `## Relationship to Phase 21D`,
  `## Relationship to Phase 21E`,
  `## Relationship to Phase 21F`,
  `## Current evidence counters`,
  `## Why BETA_READY is not selected`,
  `## Phase 22 readiness decision`,
  `## Recommended Phase 22 path`,
  `## Data safety boundary`,
  `## Backup and restore boundary`,
  `## Import and quota boundary`,
  `## FSRS and scheduler boundary`,
  `## Optional sync boundary`,
  `## No-cloud/default-off trust boundary`,
  `## beta-ai naming boundary`,
  `## User-facing claim boundaries`,
  `## What Phase 21G explicitly does not implement`,
  `## Acceptance criteria`,
];

const requiredHandoffHeadings = [
  `# Phase 21G — Phase 22 Readiness Handoff`,
  `## Purpose`,
  `## Phase 21 closure summary`,
  `## Evidence inventory`,
  `## Evidence counters`,
  `## Documents ready for manual execution`,
  `## What is still missing`,
  `## HOLD rationale`,
  `## Phase 22 recommended sequence`,
  `## Phase 22A recommendation`,
  `## Phase 22B recommendation`,
  `## Phase 22C recommendation`,
  `## Phase 22D recommendation`,
  `## Data safety checklist`,
  `## Claim boundary checklist`,
  `## Runtime boundary checklist`,
  `## What must not be claimed`,
  `## What may be claimed`,
  `## Handoff to implementation coordinator`,
  `## Handoff to manual tester`,
  `## Handoff to future reviewer`,
];

const requiredTerms = [
  `PHASE21_EVIDENCE_TRACK_STATUS: CLOSED_READY_FOR_ACTUAL_EXECUTION`,
  `PHASE21_EXECUTED_EVIDENCE_STATUS: NOT_EXECUTED`,
  `Phase 21 evidence-preparation track is closed`,
  `Phase 21 did not execute evidence`,
  `HOLD remains active`,
  `BETA_READY is not claimed`,
  `docs/static-validator/CI-only`,
  `does not implement sync/runtime/storage migration`,
  `Sync remains unshipped`,
  `Cloud/account/auth/backend remain absent`,
  `Production IndexedDB storage remains absent`,
  `Backup/export/restore are not adapter-aware`,
  `Data-loss prevention is not guaranteed`,
  `Built-in AI/OCR/AI quiz generation are not shipped`,
  `beta-ai naming cleanup remains preserved`,
  `Phase 22`,
];

const phaseTerms = [`Phase 21A`, `Phase 21B`, `Phase 21C`, `Phase 21D`, `Phase 21E`, `Phase 21F`];
const counterTerms = [
  `REAL_USER_TEST_FILLED_SESSIONS: 0`,
  `PERFORMANCE_STRESS_FILLED_RUNS: 0`,
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO`,
];
const phase22PathTerms = [
  `22A — Actual first manual evidence run execution`,
  `22B — Fill real-user evidence with actual results`,
  `22C — Fill stress evidence with actual results`,
  `22D — Beta readiness re-decision with actual evidence`,
  `Phase 22 does not automatically unlock sync/runtime/migration`,
];

const forbiddenClaims = [
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

const allowedChanged = new Set([WORKFLOW, ...phase21gPaths]);
allowedChanged.add(`docs/testing/phase22a-actual-first-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22a-first-manual-evidence-run-summary.md`);
allowedChanged.add(`scripts/validate-phase22a-actual-first-manual-evidence-run.js`);
allowedChanged.add(`docs/testing/phase22b-real-user-evidence-filled-results.md`);
allowedChanged.add(`docs/release/phase22b-real-user-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22b-fill-real-user-evidence-results.js`);
allowedChanged.add(`docs/testing/phase22c-stress-evidence-filled-results.md`);
allowedChanged.add(`docs/release/phase22c-stress-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22c-fill-stress-evidence-results.js`);
allowedChanged.add(`docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`);
allowedChanged.add(`docs/release/phase22d-beta-readiness-actual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
const phase21gForwardCompatPaths = new Set(phase21gPaths);
allowedChanged.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase21gForwardCompatPaths.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase21gForwardCompatPaths.add(`docs/testing/phase22a-actual-first-manual-evidence-run.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22a-first-manual-evidence-run-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22a-actual-first-manual-evidence-run.js`);
phase21gForwardCompatPaths.add(`docs/testing/phase22b-real-user-evidence-filled-results.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22b-real-user-evidence-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22b-fill-real-user-evidence-results.js`);
phase21gForwardCompatPaths.add(`docs/testing/phase22c-stress-evidence-filled-results.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22c-stress-evidence-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22c-fill-stress-evidence-results.js`);
phase21gForwardCompatPaths.add(`docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22d-beta-readiness-actual-evidence-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
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
  `phase21g-evidence-track-closure-phase22-readiness.patch`,
  `phase21g-evidence-track-closure-phase22-readiness.zip`,
  `phase21g-evidence-track-closure-phase22-readiness-handoff.md`,
];

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
phase21gForwardCompatPaths.add(`docs/testing/phase22f-actual-stress-run.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22f-actual-stress-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22f-actual-stress-run.js`);
phase21gForwardCompatPaths.add(`docs/testing/phase22g-filled-evidence-update.md`);
phase21gForwardCompatPaths.add(`docs/release/phase22g-filled-evidence-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22g-filled-evidence-update.js`);
phase21gForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase21gForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase21gForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase21gForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase21gForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);
function fail(message) {
  console.error(`Phase 21G validation failed: ${message}`);
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
  const phase21f = `node scripts/validate-phase21f-first-manual-evidence-run-capture.js`;
  const phase21g = `node scripts/validate-phase21g-evidence-track-closure-phase22-readiness.js`;
  if (!workflow.includes(phase21g)) fail(`CI does not register Phase 21G validator`);
  if (workflow.indexOf(phase21g) <= workflow.indexOf(phase21f)) {
    fail(`CI must register Phase 21G after Phase 21F`);
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
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Forbidden runtime/test/e2e path changed: ${file}`);
    }
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) {
      fail(`Unexpected changed file: ${file}`);
    }
  }
}

function validateNoActiveForbiddenClaims() {
  const combined = normalize(`${read(ADR)}\n${read(HANDOFF)}`).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 1000), index + needle.length + 240);
      const safeContext = /forbidden claims after phase 21g|forbidden claims|what must not be claimed|do not claim|does not claim|not claim|not claimed|not complete|not selected|not shipped|not acceptable|is not acceptable|not user evidence|must not|absent|zero|no executed|no actual|without actual/.test(context);
      if (!safeContext) fail(`Forbidden positive claim appears outside forbidden/warning section: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
  if (/BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(`${read(ADR)}\n${read(HANDOFF)}`)) {
    fail(`Active BETA_READY claim found`);
  }
}

function validateNoExecutedClaimWithoutEvidence() {
  const combined = normalize(`${read(ADR)}\n${read(HANDOFF)}`).toLowerCase();
  if (!combined.includes(`phase21_executed_evidence_status: not_executed`)) {
    fail(`Missing PHASE21_EXECUTED_EVIDENCE_STATUS: NOT_EXECUTED`);
  }
  if (!combined.includes(`first_manual_evidence_run_executed: no`)) {
    fail(`Missing FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: NO`);
  }
  const executedMatches = combined.matchAll(/(.{0,80})(manual evidence|first manual evidence run|real user testing|stress testing) (was|is|has been) executed(.{0,80})/gi);
  for (const match of executedMatches) {
    const context = `${match[1]}${match[2]} ${match[3]} executed${match[4]}`;
    if (!/not been executed|not executed|has not been executed|do not claim|forbidden claims|what must not be claimed/.test(context)) {
      fail(`Claim that evidence has executed appears without actual evidence`);
    }
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR && file !== `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase22g-filled-evidence-update.js`) continue;
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    const removedLines = diff.split(/\r?\n/)
      .filter(line => line.startsWith(`-`) && !line.startsWith(`---`))
      .map(line => line.slice(1).trim());
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      const added = line.slice(1).trim();
      const isCommaOnlyContinuationChange = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (isCommaOnlyContinuationChange) continue;
      if (![...phase21gForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-21G forward-compat addition: ${line}`);
      }
      for (const path of phase21gForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 21G path only: ${line}`);
        }
      }
    }
  }
}

for (const file of phase21gPaths) read(file);
requireHeadings(ADR, requiredAdrHeadings);
requireHeadings(HANDOFF, requiredHandoffHeadings);
requireIncludes(ADR, requiredTerms);
requireIncludes(HANDOFF, requiredTerms);
requireIncludes(ADR, phaseTerms);
requireIncludes(HANDOFF, phaseTerms);
requireIncludes(ADR, counterTerms);
requireIncludes(HANDOFF, counterTerms);
requireIncludes(ADR, phase22PathTerms);
requireIncludes(HANDOFF, phase22PathTerms);
validateWorkflow();
validateChangedScope();
validateNoActiveForbiddenClaims();
validateNoExecutedClaimWithoutEvidence();
validateHistoricalForwardCompat();

console.log(`Phase 21G evidence track closure / Phase 22 readiness validation passed.`);
