#!/usr/bin/env node
/**
 * Phase 22B static validator - Fill Real-User Evidence With Actual Results.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE = `docs/testing/phase22b-real-user-evidence-filled-results.md`;
const SUMMARY = `docs/release/phase22b-real-user-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase22b-fill-real-user-evidence-results.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;
const PHASE22A_EVIDENCE = `docs/testing/phase22a-actual-first-manual-evidence-run.md`;
const PHASE22A_SUMMARY = `docs/release/phase22a-first-manual-evidence-run-summary.md`;

const phase22bPaths = [EVIDENCE, SUMMARY, VALIDATOR];

const requiredEvidenceHeadings = [
  `# Phase 22B — Real-User Evidence Filled Results`,
  `## Purpose`,
  `## Status`,
  `## Relationship to Phase 22A`,
  `## Relationship to Phase 21B`,
  `## Evidence source rules`,
  `## Privacy and anonymization rules`,
  `## Filled evidence count`,
  `## Evidence classification`,
  `## Session 1 — Phase 22A internal manual/browser evidence`,
  `## Additional user/tester sessions`,
  `## What was observed`,
  `## What was not observed`,
  `## Data safety findings`,
  `## Backup and restore findings`,
  `## Manual transfer findings`,
  `## Local-first copy findings`,
  `## Vietnamese-first copy findings`,
  `## FSRS and review schedule findings`,
  `## EduGen Draft Workshop boundary findings`,
  `## Mobile/PWA findings`,
  `## beta-ai naming findings`,
  `## Pass signals`,
  `## Hold signals`,
  `## Evidence completeness assessment`,
  `## Claim boundaries`,
  `## Phase 22C handoff`,
  `## Phase 22D handoff`,
];

const requiredSummaryHeadings = [
  `# Phase 22B — Real-User Evidence Summary`,
  `## Purpose`,
  `## Status`,
  `## Evidence quality`,
  `## Filled evidence count`,
  `## Evidence source`,
  `## What passed`,
  `## What remains untested`,
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
  `## Phase 22C relationship`,
  `## Phase 22D readiness gate`,
];

const validStatuses = [
  `REAL_USER_EVIDENCE_FILLED_STATUS: UPDATED_WITH_PHASE22A_INTERNAL_MANUAL_EVIDENCE`,
  `REAL_USER_EVIDENCE_FILLED_STATUS: BLOCKED_NO_USABLE_EVIDENCE`,
];

const validSessionCounts = [
  `REAL_USER_EVIDENCE_FILLED_SESSIONS: 1`,
  `REAL_USER_EVIDENCE_FILLED_SESSIONS: 0`,
];

const requiredTerms = [
  `Phase 22A`,
  `PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`,
  `FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES`,
  `internal/manual browser evidence`,
  `not broad external real-user research`,
  `No private study content is recorded`,
  `No contact information is recorded`,
  `No credentials are recorded`,
  `No telemetry or analytics were added`,
  `Broader real-user testing remains incomplete`,
  `HOLD remains active`,
  `BETA_READY is not claimed`,
  `app startup`,
  `onboarding`,
  `create/import small library`,
  `generated JSON import`,
  `study session`,
  `due cards / review schedule count`,
  `backup before risky action`,
  `restore from backup`,
  `manual export/import transfer`,
  `local-first copy comprehension`,
  `no-cloud/default-off trust copy`,
  `Vietnamese-first copy`,
  `FSRS experimental/off/default boundary`,
  `EduGen Draft Workshop boundary`,
  `mobile viewport`,
  `beta-ai naming absence`,
  `backup is not sync`,
  `restore may overwrite current data`,
  `no account/cloud/sync/backend`,
  `no built-in AI/OCR/AI generation`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `broad real-user testing is complete`,
  `real-user testing is complete`,
  `real user testing is complete`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync is ready`,
  `data-loss prevention is guaranteed`,
  `built-in AI exists`,
  `OCR exists`,
  `AI quiz generation exists`,
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
  `phase22b-fill-real-user-evidence-results.patch`,
  `phase22b-fill-real-user-evidence-results.zip`,
  `phase22b-fill-real-user-evidence-results-handoff.md`,
];
const allowedChanged = new Set([WORKFLOW, ...phase22bPaths, `docs/testing/phase22c-stress-evidence-filled-results.md`, `docs/release/phase22c-stress-evidence-summary.md`, `scripts/validate-phase22c-fill-stress-evidence-results.js`, `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`, `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`, `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`]);
allowedChanged.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
allowedChanged.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
allowedChanged.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
const phase22bForwardCompatPaths = new Set([...phase22bPaths, `docs/testing/phase22c-stress-evidence-filled-results.md`, `docs/release/phase22c-stress-evidence-summary.md`, `scripts/validate-phase22c-fill-stress-evidence-results.js`, `docs/adr/phase22d-beta-readiness-redecision-actual-evidence.md`, `docs/release/phase22d-beta-readiness-actual-evidence-summary.md`, `scripts/validate-phase22d-beta-readiness-redecision-actual-evidence.js`]);
phase22bForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase22bForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
allowedChanged.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
allowedChanged.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
allowedChanged.add(`scripts/validate-phase22e-broader-manual-evidence.js`);
phase22bForwardCompatPaths.add(`docs/testing/phase22e-broader-manual-evidence-run.md`);
phase22bForwardCompatPaths.add(`docs/release/phase22e-broader-manual-evidence-summary.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase22e-broader-manual-evidence.js`);

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
phase22bForwardCompatPaths.add(`docs/testing/phase22f-actual-stress-run.md`);
phase22bForwardCompatPaths.add(`docs/release/phase22f-actual-stress-summary.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase22f-actual-stress-run.js`);
phase22bForwardCompatPaths.add(`docs/testing/phase22g-filled-evidence-update.md`);
phase22bForwardCompatPaths.add(`docs/release/phase22g-filled-evidence-summary.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase22g-filled-evidence-update.js`);
phase22bForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase22bForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase22bForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase22bForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase22bForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);
function fail(message) {
  console.error(`Phase 22B validation failed: ${message}`);
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
  return `${read(EVIDENCE)}\n${read(SUMMARY)}`;
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase22a = `node scripts/validate-phase22a-actual-first-manual-evidence-run.js`;
  const phase22b = `node scripts/validate-phase22b-fill-real-user-evidence-results.js`;
  if (!workflow.includes(phase22b)) fail(`CI does not register Phase 22B validator`);
  if (workflow.indexOf(phase22b) <= workflow.indexOf(phase22a)) {
    fail(`CI must register Phase 22B after Phase 22A`);
  }
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateStatusTokens() {
  const combined = combinedDocs();
  const statusMatches = validStatuses.filter(status => combined.includes(status));
  const sessionMatches = validSessionCounts.filter(status => combined.includes(status));
  if (statusMatches.length !== 1) fail(`Expected exactly one valid Phase 22B status token`);
  if (sessionMatches.length !== 1) fail(`Expected exactly one valid Phase 22B session count token`);
  if (statusMatches[0].endsWith(`UPDATED_WITH_PHASE22A_INTERNAL_MANUAL_EVIDENCE`) !== sessionMatches[0].endsWith(`1`)) {
    fail(`Phase 22B status and session count disagree`);
  }
  if (sessionMatches[0].endsWith(`1`) && !combined.includes(`FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES`)) {
    fail(`Session count 1 requires Phase 22A executed evidence token reference`);
  }
}

function validatePhase22AReference() {
  const phase22aCombined = `${read(PHASE22A_EVIDENCE)}\n${read(PHASE22A_SUMMARY)}`;
  if (!phase22aCombined.includes(`PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`)) {
    fail(`Phase 22A evidence is not executed with anonymized results`);
  }
  if (!phase22aCombined.includes(`FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES`)) {
    fail(`Phase 22A executed evidence token is missing`);
  }
  const combined = combinedDocs();
  for (const file of [PHASE22A_EVIDENCE, PHASE22A_SUMMARY]) {
    if (!combined.includes(file)) fail(`Phase 22B docs must reference ${file}`);
  }
}

function validateTerms() {
  const text = normalize(combinedDocs()).toLowerCase();
  for (const term of requiredTerms) {
    if (!text.includes(term.toLowerCase())) fail(`Phase 22B docs missing required term: ${term}`);
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

function validateNoActiveForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 900), index + needle.length + 300);
      const safeContext = /not claimed|does not claim|must not|not claim|no .*claim|not enough|not complete|not observed|not tested|unacceptable|forbidden|hold remains active|unless enough|data-loss prevention is not guaranteed|no built-in|no positive|absence|absent|remains incomplete/.test(context);
      if (!safeContext) fail(`Forbidden positive claim appears outside forbidden/warning section: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
  if (/BETA_READY\s*[:=]\s*(READY|YES|TRUE)/i.test(combinedDocs())) fail(`Active BETA_READY claim found`);
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
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (isCommaOnlyContinuationChange) continue;
      if (![...phase22bForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22B forward-compat addition: ${line}`);
      }
      for (const path of phase22bForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22B path only: ${line}`);
        }
      }
    }
  }
}

for (const file of [...phase22bPaths, PHASE22A_EVIDENCE, PHASE22A_SUMMARY]) read(file);
requireHeadings(EVIDENCE, requiredEvidenceHeadings);
requireHeadings(SUMMARY, requiredSummaryHeadings);
validateWorkflow();
validateStatusTokens();
validatePhase22AReference();
validateTerms();
validateChangedScope();
validateNoActiveForbiddenClaims();
validateHistoricalForwardCompat();

console.log(`Phase 22B fill real-user evidence results validation passed.`);
