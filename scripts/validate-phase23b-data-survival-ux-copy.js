#!/usr/bin/env node
/**
 * Phase 23B static validator - data-survival UX and Vietnamese copy decision gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DECISION_DOC = `docs/research/phase23b-data-survival-ux-copy-decision.md`;
const RELEASE_SUMMARY = `docs/release/phase23b-data-survival-ux-copy-summary.md`;
const VALIDATOR = `scripts/validate-phase23b-data-survival-ux-copy.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23bPaths = [DECISION_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase23eForwardCompatPaths = [`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`, `docs/release/phase23e-data-survival-comprehension-plan-summary.md`, `scripts/validate-phase23e-data-survival-comprehension-plan.js`];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const allowedChanged = new Set([WORKFLOW, ...phase23bPaths]);
const phase23bForwardCompatPaths = new Set(phase23bPaths);
phase23bForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
phase23bForwardCompatPaths.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
phase23bForwardCompatPaths.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
allowedChanged.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
allowedChanged.add(`docs/release/phase23c-backup-health-design-summary.md`);
allowedChanged.add(`scripts/validate-phase23c-backup-health-design.js`);
allowedChanged.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
allowedChanged.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
allowedChanged.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
allowedChanged.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
allowedChanged.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
allowedChanged.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
for (const path of phase23fForwardCompatPaths) allowedChanged.add(path);
phase23bForwardCompatPaths.add(`docs/research/phase23b-data-survival-ux-copy-decision.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23b-data-survival-ux-copy-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23b-data-survival-ux-copy.js`);
phase23bForwardCompatPaths.add(`docs/research/phase23c-backup-health-last-backup-indicator-design.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23c-backup-health-design-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23c-backup-health-design.js`);
phase23bForwardCompatPaths.add(`docs/research/phase23d-backup-reminder-risk-friction-design.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23d-backup-reminder-risk-friction-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23d-backup-reminder-risk-friction-design.js`);
phase23bForwardCompatPaths.add(`docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`);
phase23bForwardCompatPaths.add(`docs/release/phase23e-data-survival-comprehension-plan-summary.md`);
phase23bForwardCompatPaths.add(`scripts/validate-phase23e-data-survival-comprehension-plan.js`);
for (const path of phase23fForwardCompatPaths) phase23bForwardCompatPaths.add(path);

const statusToken = `PHASE23B_DATA_SURVIVAL_UX_COPY_STATUS: COMPLETED_DOCS_ONLY`;
const nextPhaseText = `Phase 23C — Backup Health / Last-Backup Indicator Design Doc`;
const nextPhaseLine = `Next recommended phase: ${nextPhaseText}`;

const decisionHeadings = [
  `# Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Product stance`,
  `## UX surfaces`,
  `## Vietnamese copy library`,
  `## Tone rules`,
  `## Manual backup/export wording rules`,
  `## Platform backup uncertainty wording`,
  `## Forbidden wording patterns`,
  `## What Phase 23B can claim`,
  `## What Phase 23B must not claim`,
  `## Phase 23C roadmap implication`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 23B — Data-Survival UX Copy Summary`,
  `## Status token`,
  `## Scope`,
  `## UX copy summary`,
  `## Product stance`,
  `## What Phase 23B can claim`,
  `## What Phase 23B must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 23B is a docs-only UX/copy decision gate.`,
  `Phase 23B does not implement runtime UI.`,
  `Phase 23B does not make Shime BETA_READY.`,
  `Phase 23B does not make backup/export/restore adapter-aware.`,
  `Phase 23B does not verify platform backup behavior.`,
  `Phase 23B does not add sync, cloud, account, auth, or backend behavior.`,
];

const requiredSurfaces = [
  `onboarding where-your-data-lives panel`,
  `first meaningful content backup nudge`,
  `Settings Bảo vệ dữ liệu surface`,
  `backup health language`,
  `backup reminder language`,
  `pre-risk-action friction`,
  `restore overwrite warning`,
  `large import backup-before-action warning`,
  `manual backup/export wording`,
  `manual transfer wording`,
  `user-controlled backup file wording`,
  `platform backup verification-required wording`,
];

const copyExamples = [
  `Onboarding / where data lives`,
  `First backup nudge after meaningful content exists`,
  `Backup health fresh state`,
  `Backup health stale state`,
  `No backup yet state`,
  `Reminder after backup becomes old`,
  `Pre-restore backup prompt`,
  `Restore overwrite confirmation`,
  `Large import backup recommendation`,
  `Manual transfer explanation`,
  `Platform backup uncertainty explanation`,
  `Non-blaming recovery tone`,
];

const toneRules = [
  `calm`,
  `non-blaming`,
  `Vietnamese-first`,
  `plain-language`,
  `not panic-inducing`,
  `no jargon unless explained`,
  `never call manual backup/export sync`,
  `never imply platform backup is guaranteed`,
  `never imply backup prevents all data loss`,
];

const unsafeWordingPatterns = [
  `Your data is always safe.`,
  `Backup prevents data loss.`,
  `Sync your backup.`,
  `Platform backup will restore your data.`,
  `Delete/reinstall anytime.`,
  `BETA_READY.`,
  `Cloud sync.`,
];

const allowedClaims = [
  `Vietnamese-first data-survival UX copy direction exists.`,
  `Backup and restore risk copy has been planned.`,
  `Manual backup/export wording rules have been defined.`,
  `User-controlled backup file copy direction has been defined.`,
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
  console.error(`Phase 23B validation failed: ${message}`);
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
  return `${read(DECISION_DOC)}\n${read(RELEASE_SUMMARY)}`;
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23a = `node scripts/validate-phase23a-local-data-survival-research.js`;
  const phase23b = `node scripts/validate-phase23b-data-survival-ux-copy.js`;
  if (!workflow.includes(phase23b)) fail(`CI does not register Phase 23B validator`);
  if (workflow.indexOf(phase23b) <= workflow.indexOf(phase23a)) fail(`CI must register Phase 23B after Phase 23A`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateRequiredDocs() {
  for (const file of [DECISION_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  for (const file of [DECISION_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (!text.includes(statusToken)) fail(`${file} missing status token`);
    if (!text.includes(nextPhaseLine)) fail(`${file} missing exact next phase line`);
    for (const statement of positioningStatements) {
      if (!text.includes(statement)) fail(`${file} missing positioning statement: ${statement}`);
    }
    for (const rule of toneRules.slice(0, 5)) {
      if (!text.includes(rule)) fail(`${file} missing required tone rule: ${rule}`);
    }
  }
}

function validateDecisionCoverage() {
  const decision = read(DECISION_DOC);
  for (const surface of requiredSurfaces) {
    if (!decision.includes(surface)) fail(`Decision doc missing required UX surface: ${surface}`);
  }
  for (const example of copyExamples) {
    if (!decision.includes(example)) fail(`Decision doc missing Vietnamese copy example: ${example}`);
  }
  const vietnameseMarkers = [`Dữ liệu`, `sao lưu`, `tệp`, `khôi phục`, `thiết bị`];
  for (const marker of vietnameseMarkers) {
    if (!decision.includes(marker)) fail(`Decision doc copy library does not appear Vietnamese-first: ${marker}`);
  }
  for (const rule of toneRules) {
    if (!decision.includes(rule)) fail(`Decision doc missing tone rule: ${rule}`);
  }
  for (const pattern of unsafeWordingPatterns) {
    let index = decision.indexOf(pattern);
    let rejected = false;
    while (index !== -1) {
      const context = decision.slice(Math.max(0, index - 120), index + pattern.length + 160).toLowerCase();
      rejected = rejected || /reject|rejected|explicitly rejects/.test(context);
      index = decision.indexOf(pattern, index + 1);
    }
    if (!rejected) {
      fail(`Unsafe wording pattern is present but not explicitly rejected: ${pattern}`);
    }
  }
  for (const claim of allowedClaims) {
    if (!decision.includes(claim)) fail(`Decision doc missing allowed claim: ${claim}`);
  }
}

function validateAllowedClaimsInSummary() {
  const summary = read(RELEASE_SUMMARY);
  for (const claim of allowedClaims) {
    if (!summary.includes(claim)) fail(`Release summary missing allowed claim: ${claim}`);
  }
}

function validateForbiddenClaims() {
  const combined = normalize(combinedDocs()).toLowerCase();
  for (const claim of forbiddenClaims) {
    const needle = claim.toLowerCase();
    let index = combined.indexOf(needle);
    while (index !== -1) {
      const context = combined.slice(Math.max(0, index - 700), index + needle.length + 700);
      const guarded = /does not|must not|do not|not claim|not claimed|not make|not implement|not verify|without claiming|guardrails|verification required|explicitly rejects|rejected|unsafe wording|no runtime|not add|not automatic|must not imply/.test(context);
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
      if (line.includes(`phase23eForwardCompatPaths`)) continue;
      if (line.includes(`phase23fForwardCompatPaths`)) continue;
      if (line.includes(`isPhase23f`)) continue;
      const added = line.slice(1).trim();
      const commaOnly = removedLines.some(removed => (
        `${removed},` === added ||
        removed.replace(/\]\);?$/, `,`) === added ||
        removed.replace(/,\]\);?$/, `,`) === added ||
        removed.replace(/\]\.includes\(file\)\) continue;$/, `,`) === added ||
        removed.replace(/,\]\.includes\(file\)\) continue;$/, `,`) === added
      ));
      if (commaOnly) continue;
      if (![...phase23bForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths].some(path => line.includes(path))) {
        fail(`${file} has non-Phase-23B forward-compat addition: ${line}`);
      }
      for (const path of [...phase23bForwardCompatPaths, ...phase23eForwardCompatPaths, ...phase23fForwardCompatPaths]) {
        if (line.includes(path) && !line.includes(`\`${path}\``) && !line.includes(`'${path}'`) && !line.includes(`"${path}"`)) {
          fail(`${file} must add exact Phase 23B path only: ${line}`);
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

requireHeadings(DECISION_DOC, decisionHeadings);
requireHeadings(RELEASE_SUMMARY, summaryHeadings);
validateWorkflow();
validateRequiredDocs();
validateDecisionCoverage();
validateAllowedClaimsInSummary();
validateForbiddenClaims();
validateChangedScope();
validateHistoricalForwardCompat();
validateGeneratedArtifactsAbsent();

console.log(`Phase 23B data survival UX copy validation passed.`);
