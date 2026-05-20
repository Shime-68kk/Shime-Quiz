#!/usr/bin/env node
/**
 * Phase 23C static validator - backup health / last-backup indicator design gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DESIGN_DOC = `docs/research/phase23c-backup-health-last-backup-indicator-design.md`;
const RELEASE_SUMMARY = `docs/release/phase23c-backup-health-design-summary.md`;
const VALIDATOR = `scripts/validate-phase23c-backup-health-design.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23cPaths = [DESIGN_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase23eForwardCompatPaths = [`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`, `docs/release/phase23e-data-survival-comprehension-plan-summary.md`, `scripts/validate-phase23e-data-survival-comprehension-plan.js`];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const allowedChanged = new Set([WORKFLOW, ...phase23cPaths]);
const phase23cForwardCompatPaths = new Set(phase23cPaths);
phase23cForwardCompatPaths.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase23cForwardCompatPaths.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase23cForwardCompatPaths.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
phase23cForwardCompatPaths.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase23cForwardCompatPaths.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase23cForwardCompatPaths.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChanged.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
allowedChanged.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
allowedChanged.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
allowedChanged.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChanged.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChanged.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
for (const path of phase23fForwardCompatPaths) allowedChanged.add(path);
for (const path of phase24aForwardCompatPaths) allowedChanged.add(path);
for (const path of phase23fForwardCompatPaths) phase23cForwardCompatPaths.add(path);
for (const path of phase24aForwardCompatPaths) phase23cForwardCompatPaths.add(path);

const statusToken = `PHASE23C_BACKUP_HEALTH_DESIGN_STATUS: COMPLETED_DOCS_ONLY`;
const nextPhaseText = `Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc`;
const nextPhaseLine = `Next recommended phase: ${nextPhaseText}`;

const designHeadings = [
  `# Phase 23C — Backup Health / Last-Backup Indicator Design Doc`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Product stance`,
  `## Backup health concept`,
  `## Backup freshness states`,
  `## Threshold direction`,
  `## Placement direction`,
  `## Vietnamese copy examples`,
  `## Accessibility rules`,
  `## Manual backup/export wording rules`,
  `## Platform backup uncertainty`,
  `## What Phase 23C can claim`,
  `## What Phase 23C must not claim`,
  `## Implementation prerequisites`,
  `## Phase 23D roadmap implication`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 23C — Backup Health Design Summary`,
  `## Status token`,
  `## Scope`,
  `## Design summary`,
  `## Backup health states`,
  `## Product stance`,
  `## What Phase 23C can claim`,
  `## What Phase 23C must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 23C is a docs-only backup health design gate.`,
  `Phase 23C does not implement runtime UI.`,
  `Phase 23C does not implement backup health tracking.`,
  `Phase 23C does not change backup/export/restore behavior.`,
  `Phase 23C does not make Shime BETA_READY.`,
  `Phase 23C does not make backup/export/restore adapter-aware.`,
  `Phase 23C does not verify platform backup behavior.`,
  `Phase 23C does not add sync, cloud, account, auth, or backend behavior.`,
];

const designCoverageTerms = [
  `backup health concept`,
  `last backup timestamp meaning`,
  `backup freshness states`,
  `no-backup-yet state`,
  `fresh backup state`,
  `aging backup state`,
  `stale backup state`,
  `unknown backup state`,
  `suggested threshold direction`,
  `where backup health may appear`,
  `Settings Bảo vệ dữ liệu surface`,
  `Dashboard or home-surface lightweight indicator`,
  `restore and import risk surfaces`,
  `user-controlled backup file stance`,
  `manual backup/export is not sync`,
  `platform backup is not guaranteed`,
  `accessibility color plus text rule`,
  `Vietnamese-first labels`,
  `non-blaming tone`,
  `what the indicator can claim`,
  `what the indicator must not claim`,
  `implementation prerequisites`,
  `Phase 23D roadmap implication`,
];

const freshnessStates = [
  `NO_BACKUP_YET`,
  `FRESH_BACKUP`,
  `AGING_BACKUP`,
  `STALE_BACKUP`,
  `UNKNOWN_BACKUP_STATE`,
];

const stateRequiredContent = [
  `Product meaning`,
  `Suggested Vietnamese label`,
  `Suggested helper copy`,
  `Recommended tone`,
  `What not to imply`,
];

const copyExamples = [
  `No backup yet`,
  `Fresh backup`,
  `Aging backup`,
  `Stale backup`,
  `Unknown backup state`,
  `Backup health badge short label`,
  `Settings backup health helper`,
  `Dashboard/home lightweight indicator`,
  `Restore/import risk reminder using backup health`,
  `Non-blaming stale-backup reminder`,
];

const accessibilityRules = [
  `Backup health must not rely on color alone.`,
  `Every color state must have a text label.`,
  `Copy must remain clear in Vietnamese.`,
  `Tone must be calm and non-blaming.`,
  `Indicators must not block normal study flow by default.`,
];

const allowedClaims = [
  `Backup health design direction exists.`,
  `Last-backup indicator states have been planned.`,
  `Vietnamese-first backup health copy has been drafted.`,
  `Accessibility and tone rules for backup health have been defined.`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `backup health is implemented`,
  `last-backup tracking is implemented`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
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
];

function fail(message) {
  console.error(`Phase 23C validation failed: ${message}`);
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

function combinedDocs() {
  return `${read(DESIGN_DOC)}\n${read(RELEASE_SUMMARY)}`;
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23b = `node scripts/validate-phase23b-data-survival-ux-copy.js`;
  const phase23c = `node scripts/validate-phase23c-backup-health-design.js`;
  if (!workflow.includes(phase23c)) fail(`CI does not register Phase 23C validator`);
  if (workflow.indexOf(phase23c) <= workflow.indexOf(phase23b)) fail(`CI must register Phase 23C after Phase 23B`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateRequiredDocs() {
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (!text.includes(statusToken)) fail(`${file} missing status token`);
    if (!text.includes(nextPhaseLine)) fail(`${file} missing exact next phase line`);
    for (const statement of positioningStatements) {
      if (!text.includes(statement)) fail(`${file} missing positioning statement: ${statement}`);
    }
    for (const rule of accessibilityRules) {
      if (!text.includes(rule)) fail(`${file} missing accessibility rule: ${rule}`);
    }
  }
}

function validateDesignCoverage() {
  const design = read(DESIGN_DOC);
  const normalized = normalize(design).toLowerCase();
  for (const term of designCoverageTerms) {
    if (!normalized.includes(term.toLowerCase())) fail(`Design doc missing required coverage term: ${term}`);
  }
  for (const state of freshnessStates) {
    if (!design.includes(state)) fail(`Design doc missing freshness state: ${state}`);
  }
  for (const content of stateRequiredContent) {
    if (!design.includes(content)) fail(`Design doc missing state content column: ${content}`);
  }
  for (const example of copyExamples) {
    if (!design.includes(example)) fail(`Design doc missing Vietnamese copy example: ${example}`);
  }
  const vietnameseMarkers = [`sao lưu`, `tệp`, `dữ liệu`, `khôi phục`, `thiết bị`];
  for (const marker of vietnameseMarkers) {
    if (!design.toLowerCase().includes(marker)) fail(`Design doc does not appear Vietnamese-first: ${marker}`);
  }
}

function validateAllowedClaims() {
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    for (const claim of allowedClaims) {
      if (!text.includes(claim)) fail(`${file} missing allowed claim: ${claim}`);
    }
  }
}

function validateForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 700), index + needle.length + 700);
      const guarded = /does not|must not|do not|not claim|not claimed|not make|not implement|not verify|without claiming|guardrails|verification required|reject|rejected|not guaranteed|not automatic|must not imply|no runtime|no sync|no platform backup/.test(context);
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
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file))) fail(`Forbidden runtime area changed: ${file}`);
    if (file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR) continue;
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
  }
}

function validateHistoricalForwardCompat() {
  const changedValidators = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file.endsWith(`.js`) && file !== VALIDATOR);
  for (const file of changedValidators) {
    if (file === `scripts/validate-phase23e-data-survival-comprehension-plan.js`) continue;
    if (file === `scripts/validate-phase23f-phase23-decision-gate.js`) continue;
    if (file === `scripts/validate-phase24a-residual-direct-storage-audit.js`) continue;
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
      if (line.includes(`isPhase23f`)) continue;
      if (line.includes(`isPhase24a`)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase23cForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-23C forward-compat addition: ${line}`);
      }
      for (const path of [...phase23cForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths, ...phase24aForwardCompatPaths]) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 23C path only: ${line}`);
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

requireHeadings(DESIGN_DOC, designHeadings);
requireHeadings(RELEASE_SUMMARY, summaryHeadings);
validateWorkflow();
validateRequiredDocs();
validateDesignCoverage();
validateAllowedClaims();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 23C backup health design validation passed.`);
