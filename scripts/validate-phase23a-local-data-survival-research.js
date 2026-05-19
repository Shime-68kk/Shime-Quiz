#!/usr/bin/env node
/**
 * Phase 23A static validator - local data survival research gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESEARCH_DOC = `docs/research/phase23a-local-data-survival-uninstall-device-loss-research.md`;
const RELEASE_SUMMARY = `docs/release/phase23a-local-data-survival-research-summary.md`;
const VALIDATOR = `scripts/validate-phase23a-local-data-survival-research.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23aPaths = [RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR];
const allowedChanged = new Set([WORKFLOW, ...phase23aPaths]);
const phase23aForwardCompatPaths = new Set(phase23aPaths);
phase23aForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase23aForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase23aForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase23aForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase23aForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase23aForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
allowedChanged.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
allowedChanged.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
allowedChanged.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
allowedChanged.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
allowedChanged.add(`docs/release/phase23c-backup-health-design-summary.md`);
allowedChanged.add(`scripts/validate-phase23c-backup-health-design.js`);
phase23aForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase23aForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase23aForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase23aForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase23aForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase23aForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);

const statusToken = `PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY`;
const nextPhase = `Next recommended phase: Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc`;

const researchHeadings = [
  `# Phase 23A — Local Data Survival / Uninstall & Device-Loss Protection Research Gate`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Platform risk research`,
  `## Data survival risk matrix`,
  `## User expectations`,
  `## Local-first is not data-safe by itself`,
  `## User-controlled backup file strategy`,
  `## Backup health implications`,
  `## Backup reminder implications`,
  `## Pre-risk-action friction implications`,
  `## Verification-required flags`,
  `## What Phase 23A can claim`,
  `## What Phase 23A must not claim`,
  `## Phase 23B–23F roadmap implication`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 23A — Local Data Survival Research Summary`,
  `## Status token`,
  `## Scope`,
  `## Research summary`,
  `## Key risks identified`,
  `## Product stance`,
  `## What Phase 23A can claim`,
  `## What Phase 23A must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 23A is a docs-only research gate.`,
  `Phase 23A does not implement runtime data-survival behavior.`,
  `Phase 23A does not make Shime BETA_READY.`,
  `Phase 23A does not make backup/export/restore adapter-aware.`,
  `Phase 23A does not verify platform backup behavior.`,
];

const researchCoverageTerms = [
  `Android native app uninstall risk`,
  `Android TWA or PWA uninstall risk`,
  `iOS native app uninstall risk`,
  `iOS PWA storage risk`,
  `Desktop and mobile browser clear-site-data risk`,
  `Private or incognito mode risk`,
  `Browser switch risk`,
  `Device loss or broken device risk`,
  `Storage pressure or quota eviction risk`,
  `Platform backup verification-required flags`,
  `User expectations and misunderstanding risks`,
  `Local-first is not data-safe by itself`,
  `User-controlled backup file strategy`,
  `Backup health implications`,
  `Backup reminder implications`,
  `Pre-risk-action friction implications`,
  `Phase 23B–23F roadmap implication`,
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
  console.error(`Phase 23A validation failed: ${message}`);
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
  return `${read(RESEARCH_DOC)}\n${read(RELEASE_SUMMARY)}`;
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase22h = `node scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`;
  const phase23a = `node scripts/validate-phase23a-local-data-survival-research.js`;
  if (!workflow.includes(phase23a)) fail(`CI does not register Phase 23A validator`);
  if (workflow.indexOf(phase23a) <= workflow.indexOf(phase22h)) fail(`CI must register Phase 23A after Phase 22H`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateRequiredDocs() {
  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (!text.includes(statusToken)) fail(`${file} missing status token`);
    if (!text.includes(nextPhase)) fail(`${file} missing required next phase`);
    for (const statement of positioningStatements) {
      if (!text.includes(statement)) fail(`${file} missing positioning statement: ${statement}`);
    }
  }
}

function validateResearchCoverage() {
  const research = read(RESEARCH_DOC);
  const normalized = normalize(research).toLowerCase();
  for (const term of researchCoverageTerms) {
    if (!normalized.includes(term.toLowerCase())) fail(`Research doc missing required coverage term: ${term}`);
  }
  const verificationRequiredCount = (research.match(/verification required/g) || []).length;
  if (verificationRequiredCount < 10) fail(`Research doc must mark platform behavior as verification required`);
}

function validateForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 700), index + needle.length + 700);
      const guarded = /does not|must not|do not|not claim|not claimed|not make|not implement|not verify|without claiming|guardrails|verification required|no runtime|no source|not present|not treated as verified|not imply/.test(context);
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
    const diff = runGit(`git diff --unified=0 origin/main -- ${file}`);
    const removedLines = diff.split(/\r?\n/)
      .filter(line => line.startsWith(`-`) && !line.startsWith(`---`))
      .map(line => line.slice(1).trim());
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)]*;?\s*$/.test(line)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase23aForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-23A forward-compat addition: ${line}`);
      }
      for (const path of phase23aForwardCompatPaths) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 23A path only: ${line}`);
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

requireHeadings(RESEARCH_DOC, researchHeadings);
requireHeadings(RELEASE_SUMMARY, summaryHeadings);
validateWorkflow();
validateRequiredDocs();
validateResearchCoverage();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 23A local data survival research validation passed.`);
