#!/usr/bin/env node
/**
 * Phase 22G static validator - filled evidence update after broader manual and stress runs.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const EVIDENCE = `docs/testing/phase22g-filled-evidence-update.md`;
const SUMMARY = `docs/release/phase22g-filled-evidence-summary.md`;
const VALIDATOR = `scripts/validate-phase22g-filled-evidence-update.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase22gPaths = [EVIDENCE, SUMMARY, VALIDATOR];
const phase23eForwardCompatPaths = [`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`, `docs/release/phase23e-data-survival-comprehension-plan-summary.md`, `scripts/validate-phase23e-data-survival-comprehension-plan.js`];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const phase24bForwardCompatPaths = [`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`, `docs/release/phase24b-storage-adapter-boundary-summary.md`, `scripts/validate-phase24b-storage-adapter-boundary-decision.js`];
const phase24cForwardCompatPaths = [`src/ui/helpTourStorage.js`, `src/ui/helpTour.js`, `tests/unit/helpTourStorageAdapterScaffold.test.js`, `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`, `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`, `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`];
// Phase 24D forward-compat entries (Backup/Export/Restore Adapter-Awareness Design)
const phase24dForwardCompatPaths = [`docs/research/phase24d-backup-export-restore-adapter-awareness-design.md`, `docs/release/phase24d-backup-export-restore-adapter-awareness-summary.md`, `scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`];
const phase24dHf1ForwardCompatPaths = [`docs/research/phase24d-hf1-validator-forward-compat-maintenance.md`, `docs/release/phase24d-hf1-validator-forward-compat-summary.md`, `scripts/register-phase-forward-compat.js`, `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`];
const allowedChanged = new Set([WORKFLOW, ...phase22gPaths]);
for (const path of phase24dForwardCompatPaths) allowedChanged.add(path);
for (const path of phase24dHf1ForwardCompatPaths) allowedChanged.add(path);
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
const phase22gForwardCompatPaths = new Set(phase22gPaths);
phase22gForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase22gForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase22gForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase22gForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase22gForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase22gForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
phase22gForwardCompatPaths.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase22gForwardCompatPaths.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase22gForwardCompatPaths.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);

allowedChanged.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
allowedChanged.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
allowedChanged.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
allowedChanged.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
allowedChanged.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
allowedChanged.add(`scripts/validate-phase23a-local-data-survival-research.js`);
phase22gForwardCompatPaths.add(`docs/release/phase22h-beta-readiness-redecision-broader-evidence.md`);
phase22gForwardCompatPaths.add(`docs/testing/phase22h-beta-readiness-evidence-matrix.md`);
phase22gForwardCompatPaths.add(`scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`);
phase22gForwardCompatPaths.add(`docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`);
phase22gForwardCompatPaths.add(`docs/release/phase23a-local-data-survival-research-summary.md`);
phase22gForwardCompatPaths.add(`scripts/validate-phase23a-local-data-survival-research.js`);

const testingHeadings = [
  `# Phase 22G — Filled Evidence Update After Broader Manual and Stress Runs`,
  `## Status tokens`,
  `## Evidence sources consumed`,
  `## Filled evidence summary`,
  `## Evidence coverage improvements`,
  `## Remaining evidence gaps`,
  `## Evidence interpretation for Phase 22H`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 22G — Filled Evidence Summary`,
  `## Status tokens`,
  `## Scope`,
  `## Evidence consumed`,
  `## What Phase 22G can claim`,
  `## What Phase 22G must not claim`,
  `## Remaining evidence gaps`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const phase22gTokens = [
  `PHASE22G_FILLED_EVIDENCE_UPDATE_STATUS: UPDATED_WITH_PHASE22E_AND_PHASE22F_ACTUAL_EVIDENCE`,
  `PHASE22G_MANUAL_EVIDENCE_SCENARIOS_CONSUMED: 12`,
  `PHASE22G_STRESS_EVIDENCE_SCENARIOS_CONSUMED: 12`,
];

const priorEvidenceTokens = [
  `PHASE22E_BROADER_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`,
  `PHASE22E_BROADER_MANUAL_EVIDENCE_SCENARIOS_RECORDED: 12`,
  `PHASE22F_ACTUAL_STRESS_RUN_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS`,
  `PHASE22F_ACTUAL_STRESS_SCENARIOS_RECORDED: 12`,
];

const requiredInterpretationTerms = [
  `broader manual evidence exists from Phase 22E`,
  `actual stress-oriented evidence exists from Phase 22F`,
  `evidence coverage improved compared with Phase 22D`,
  `Phase 22H can re-decide beta readiness using broader actual evidence`,
  `generated/test-data`,
  `anonymized`,
];

const remainingGaps = [
  `second physical device transfer`,
  `real storage exhaustion`,
  `cross-browser coverage`,
  `PWA/offline behavior`,
  `real mobile file picker behavior`,
  `long-duration endurance`,
  `broad external real-user evidence`,
];

const forbiddenPositiveClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `broad external real-user testing complete`,
  `full production stress testing complete`,
  `production readiness`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `guaranteed data-loss prevention`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
];

const forbiddenPrefixes = [
  `src/`,
  `tests/`,
  `e2e/`,
  `docs/adr/`,
];
const forbiddenFiles = [`package.json`, `package-lock.json`, `sw.js`];
const forbiddenPathPatterns = [
  /(^|\/)(runtime|import|storage|backup|restore)(\/|$)/i,
  /(^|\/)(fsrs|sync|cloud|account|auth|backend)(\/|$)/i,
  /(^|\/)(dependencies|telemetry|analytics)(\/|$)/i,
];
const generatedArtifacts = [
  `node_modules`,
  `dist`,
  `coverage`,
  `test-results`,
  `playwright-report`,
  `FETCH_HEAD`,
  `.env`,
  `.env.local`,
  `phase22g-filled-evidence-update.patch`,
  `phase22g-filled-evidence-update.zip`,
  `phase22g-filled-evidence-update-handoff.md`,
];

function fail(message) {
  console.error(`Phase 22G validation failed: ${message}`);
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
  ].filter(file => !generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) && !file.endsWith(`.log`));
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
  const phase22f = `node scripts/validate-phase22f-actual-stress-run.js`;
  const phase22g = `node scripts/validate-phase22g-filled-evidence-update.js`;
  if (!workflow.includes(phase22g)) fail(`CI does not register Phase 22G validator`);
  if (workflow.indexOf(phase22g) <= workflow.indexOf(phase22f)) fail(`CI must register Phase 22G after Phase 22F`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateTokens() {
  for (const file of [EVIDENCE, SUMMARY]) {
    const text = read(file);
    for (const token of phase22gTokens) {
      if (!text.includes(token)) fail(`${file} missing required Phase 22G token: ${token}`);
    }
    for (const token of priorEvidenceTokens) {
      if (!text.includes(token)) fail(`${file} missing prior evidence token: ${token}`);
    }
  }
}

function validateInterpretation() {
  const docs = combinedDocs();
  const lower = normalize(docs).toLowerCase();
  for (const term of requiredInterpretationTerms) {
    if (!lower.includes(term.toLowerCase())) fail(`Docs missing interpretation term: ${term}`);
  }
}

function validateRemainingGaps() {
  for (const file of [EVIDENCE, SUMMARY]) {
    const text = read(file).toLowerCase();
    for (const gap of remainingGaps) {
      if (!text.includes(gap.toLowerCase())) fail(`${file} missing remaining gap: ${gap}`);
    }
  }
}

function validateForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenPositiveClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 260), index + needle.length + 260);
      const guarded = /must not|does not|do not|not claim|not claimed|remaining gaps|guardrails|absent|absence|without|no runtime/.test(context);
      if (!guarded) fail(`Forbidden positive claim appears outside guarded context: ${claim}`);
      index = combined.indexOf(needle, index + 1);
    }
  }
}

function validateChangedScope() {
  const files = changedFiles();
  for (const file of files) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact must not be tracked or present in changed files: ${file}`);
    }
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (allowedChanged.has(file)) continue;
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file))) fail(`Forbidden runtime area changed: ${file}`);
    if (!allowedChanged.has(file) && !file.startsWith(`scripts/validate-`)) fail(`Unexpected changed file: ${file}`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR && file !== `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase23e-data-survival-comprehension-plan.js`) continue;
    if (file === `scripts/validate-phase23f-phase23-decision-gate.js`) continue;
    if (file === `scripts/validate-phase24a-residual-direct-storage-audit.js`) continue;
    if (file === `scripts/validate-phase24b-storage-adapter-boundary-decision.js`) continue;
    if (file === `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`) continue;
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
      if (line.includes(`phase24dForwardCompatPaths`)) continue;
      if (line.includes(`phase24dHf1ForwardCompatPaths`)) continue;
      if (line.includes(`Phase 24D forward-compat entries`)) continue;
      if (line.includes(`Phase 24C forward-compat entries`)) continue;
      if (line.includes(`allowedChanged.has(file)`)) continue;
      if (line.includes(`AllowedChangedFiles.has(file)`)) continue;
      if (line.includes(`allowedChangedFiles.has(file)`)) continue;
      if (line.includes(`forwardCompatPath`)) continue;
      if (line.includes(`isPhase23f`)) continue;
      if (line.includes(`isPhase24a`)) continue;
      if (line.includes(`isPhase24b`)) continue;
      if (line.includes(`isPhase24c`)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase22gForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths, ...phase24dForwardCompatPaths, ...phase24dHf1ForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-22G forward-compat addition: ${line}`);
      }
      for (const path of [...phase22gForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths, ...phase24dForwardCompatPaths, ...phase24dHf1ForwardCompatPaths]) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 22G path only: ${line}`);
        }
      }
    }
  }
}

function validateGeneratedArtifactsAbsent() {
  for (const file of lines(runGit(`git ls-files`))) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked: ${file}`);
    }
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be tracked: ${file}`);
  }
  for (const file of lines(runGit(`git ls-files --others --exclude-standard`))) {
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be present: ${file}`);
  }
}

for (const file of phase22gPaths) read(file);
requireHeadings(EVIDENCE, testingHeadings);
requireHeadings(SUMMARY, summaryHeadings);
validateWorkflow();
validateTokens();
validateInterpretation();
validateRemainingGaps();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 22G filled evidence update validation passed.`);
