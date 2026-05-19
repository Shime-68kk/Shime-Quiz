#!/usr/bin/env node
/**
 * Phase 22D static validator - Beta readiness re-decision with actual evidence.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const ADR = `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`;
const SUMMARY = `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const PHASE22A_EVIDENCE = `docs/testing/phase22a-actual-first-manual-evidence-run.md`;
const PHASE22A_SUMMARY = `docs/release/phase22a-first-manual-evidence-run-summary.md`;
const PHASE22B_EVIDENCE = `docs/testing/phase22b-real-user-evidence-filled-results.md`;
const PHASE22B_SUMMARY = `docs/release/phase22b-real-user-evidence-summary.md`;
const PHASE22C_EVIDENCE = `docs/testing/phase22c-stress-evidence-filled-results.md`;
const PHASE22C_SUMMARY = `docs/release/phase22c-stress-evidence-summary.md`;

const phase22dPaths = [ADR, SUMMARY, VALIDATOR];

const requiredAdrHeadings = [
  `# Phase 22D — Beta Readiness Re-decision With Actual Evidence`,
  `## Purpose`,
  `## Decision`,
  `## Evidence consumed`,
  `## Relationship to Phase 22A`,
  `## Relationship to Phase 22B`,
  `## Relationship to Phase 22C`,
  `## Current actual evidence status`,
  `## Real-user evidence assessment`,
  `## Stress evidence assessment`,
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
  `## What Phase 22D explicitly does not implement`,
  `## Post-Phase-22 path`,
  `## Acceptance criteria`,
];

const requiredSummaryHeadings = [
  `# Phase 22D — Beta Readiness Actual Evidence Summary`,
  `## Purpose`,
  `## Decision summary`,
  `## Evidence inventory`,
  `## Phase 22A evidence`,
  `## Phase 22B evidence`,
  `## Phase 22C evidence`,
  `## Real-user evidence count`,
  `## Stress evidence count`,
  `## Evidence strengths`,
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

const requiredTokens = [
  `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_LIMITED_ACTUAL_EVIDENCE`,
  `PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`,
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES`,
  `REAL_USER_EVIDENCE_FILLED_STATUS: UPDATED_WITH_PHASE22A_INTERNAL_MANUAL_EVIDENCE`,
  `REAL_USER_EVIDENCE_FILLED_SESSIONS: 1`,
  `STRESS_EVIDENCE_FILLED_STATUS: UPDATED_WITH_LIMITED_PHASE22A_STRESS_ADJACENT_EVIDENCE`,
  `STRESS_EVIDENCE_FILLED_RUNS: 1`,
];

const requiredTerms = [
  `Actual evidence now exists`,
  `evidence remains limited`,
  `HOLD remains active`,
  `BETA_READY is not selected`,
  `One internal/manual browser session`,
  `not broad real-user testing`,
  `Limited stress-adjacent evidence`,
  `not full stress testing`,
  `Sync/cloud/account/auth/backend remain absent`,
  `Production IndexedDB storage remains absent`,
  `Backup/export/restore are not adapter-aware`,
  `Data-loss prevention is not guaranteed`,
  `Built-in AI/OCR/AI quiz generation are not shipped`,
  `beta-ai naming cleanup remains preserved`,
  `22E — Broader manual evidence run with larger import coverage`,
  `22F — Actual stress run with larger import/quota/backup rehearsal`,
  `22G — Filled evidence update after broader runs`,
  `22H — Beta readiness re-decision with broader actual evidence`,
  `Do not unlock sync/runtime/migration based on Phase 22D`,
];

const forbiddenPositiveClaims = [
  `broad real-user testing is complete`,
  `broad real-user testing complete`,
  `full stress testing is complete`,
  `full stress testing complete`,
  `local-first hybrid beta is ready`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync is ready`,
  `production IndexedDB storage exists`,
  `storage migration is complete`,
  `backup/export/restore are adapter-aware`,
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
  `phase22d-beta-readiness-redecision-actual-evidence.patch`,
  `phase22d-beta-readiness-redecision-actual-evidence.zip`,
  `phase22d-beta-readiness-redecision-actual-evidence-handoff.md`,
];
const allowedChanged = new Set([WORKFLOW, ...phase22dPaths]);
allowedChanged.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
allowedChanged.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
allowedChanged.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
allowedChanged.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
allowedChanged.add(`docs/release/phase23c-backup-health-design-summary.md`);
allowedChanged.add(`scripts/validate-phase23c-backup-health-design.js`);
const phase22dForwardCompatPaths = new Set(phase22dPaths);
phase22dForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase22dForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase22dForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase22dForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
allowedChanged.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase22dForwardCompatPaths.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
phase22dForwardCompatPaths.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase22e-broader-manual-evidence.js`);

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
phase22dForwardCompatPaths.add(`docs/testing/phase22f-actual-stress-run.md`);
phase22dForwardCompatPaths.add(`docs/release/phase22f-actual-stress-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase22f-actual-stress-run.js`);
phase22dForwardCompatPaths.add(`docs/testing/phase22g-filled-evidence-update.md`);
phase22dForwardCompatPaths.add(`docs/release/phase22g-filled-evidence-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase22g-filled-evidence-update.js`);
phase22dForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase22dForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase22dForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase22dForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase22dForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);
function fail(message) {
  console.error(`Phase 22D validation failed: ${message}`);
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

function combinedDocs() {
  return `${read(ADR)}\n${read(SUMMARY)}`;
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase22c = `node scripts/validate-phase22c-fill-stress-evidence-results.js`;
  const phase22d = `node scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`;
  if (!workflow.includes(phase22d)) fail(`CI does not register Phase 22D validator`);
  if (workflow.indexOf(phase22d) <= workflow.indexOf(phase22c)) {
    fail(`CI must register Phase 22D after Phase 22C`);
  }
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateSourceEvidence() {
  const sourceText = `${read(PHASE22A_EVIDENCE)}\n${read(PHASE22A_SUMMARY)}\n${read(PHASE22B_EVIDENCE)}\n${read(PHASE22B_SUMMARY)}\n${read(PHASE22C_EVIDENCE)}\n${read(PHASE22C_SUMMARY)}`;
  for (const token of requiredTokens.slice(1)) {
    if (!sourceText.includes(token)) fail(`Source evidence missing token: ${token}`);
  }
  const docs = combinedDocs();
  for (const file of [PHASE22A_EVIDENCE, PHASE22A_SUMMARY, PHASE22B_EVIDENCE, PHASE22B_SUMMARY, PHASE22C_EVIDENCE, PHASE22C_SUMMARY]) {
    if (!docs.includes(file)) fail(`Phase 22D docs must reference ${file}`);
  }
  for (const token of requiredTokens) {
    if (!docs.includes(token)) fail(`Phase 22D docs missing required token: ${token}`);
  }
}

function validateTerms() {
  const text = normalize(combinedDocs()).toLowerCase();
  for (const term of requiredTerms) {
    if (!text.includes(term.toLowerCase())) fail(`Phase 22D docs missing required term: ${term}`);
  }
}

function validateNoActiveForbiddenClaims() {
  const docs = combinedDocs();
  const combined = normalize(docs).toLowerCase();
  if (/BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(docs)) fail(`Active BETA_READY claim found`);
  for (const claim of forbiddenPositiveClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 900), index + needle.length + 300);
      const safeContext = /not selected|not claimed|does not claim|do not claim|must not|not broad|not full|not proof|not external|remain absent|remains absent|are not adapter-aware|is not guaranteed|are not shipped|is not acceptable|forbidden claims|hold remains active|evidence gaps|before .*reconsidered|no .*claim|incomplete/.test(context);
      if (!safeContext) fail(`Forbidden positive claim appears outside warning context: ${claim}`);
      index = combined.indexOf(needle, index + 1);
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
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) {
      fail(`Forbidden runtime/test/e2e/package path changed: ${file}`);
    }
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) {
      fail(`Unexpected changed file: ${file}`);
    }
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR);
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
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (isCommaOnlyContinuationChange) continue;
      if (![...phase22dForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22D forward-compat addition: ${line}`);
      }
      for (const path of phase22dForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22D path only: ${line}`);
        }
      }
    }
  }
}

for (const file of [...phase22dPaths, PHASE22A_EVIDENCE, PHASE22A_SUMMARY, PHASE22B_EVIDENCE, PHASE22B_SUMMARY, PHASE22C_EVIDENCE, PHASE22C_SUMMARY]) read(file);
requireHeadings(ADR, requiredAdrHeadings);
requireHeadings(SUMMARY, requiredSummaryHeadings);
validateWorkflow();
validateSourceEvidence();
validateTerms();
validateNoActiveForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();

console.log(`Phase 22D beta readiness re-decision actual evidence validation passed.`);
