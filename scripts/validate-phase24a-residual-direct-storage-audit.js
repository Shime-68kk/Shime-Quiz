#!/usr/bin/env node
/**
 * Phase 24A static validator - residual direct-storage audit.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const AUDIT_DOC = `docs/research/phase24a-residual-direct-storage-audit.md`;
const RELEASE_SUMMARY = `docs/release/phase24a-residual-direct-storage-audit-summary.md`;
const VALIDATOR = `scripts/validate-phase24a-residual-direct-storage-audit.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aPaths = [AUDIT_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase24bForwardCompatPaths = [`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`, `docs/release/phase24b-storage-adapter-boundary-summary.md`, `scripts/validate-phase24b-storage-adapter-boundary-decision.js`];
const allowedChanged = new Set([
  WORKFLOW,
  ...phase24aPaths,
  ...phase24bForwardCompatPaths,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `scripts/validate-phase23e-data-survival-comprehension-plan.js`,
  `scripts/validate-phase23f-phase23-decision-gate.js`,
]);

const statusToken = `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`;
const nextPhaseLine = `Next recommended phase: Phase 24B — StorageAdapter Coverage Plan / Boundary Decision`;

const auditHeadings = [
  `# Phase 24A — Residual Direct-Storage Audit`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Audit methodology`,
  `## Search patterns and areas inspected`,
  `## Classification rules`,
  `## Residual direct-storage findings`,
  `## Sensitive touchpoint coverage`,
  `## Unknowns and limitations`,
  `## What Phase 24A can claim`,
  `## What Phase 24A must not claim`,
  `## Phase 24B recommendation`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24A — Residual Direct-Storage Audit Summary`,
  `## Status token`,
  `## Scope`,
  `## Audit summary`,
  `## Key findings`,
  `## Sensitive touchpoints`,
  `## What Phase 24A can claim`,
  `## What Phase 24A must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 24A is audit-only.`,
  `Phase 24A reads/searches code but does not change runtime behavior.`,
  `Phase 24A does not implement StorageAdapter expansion.`,
  `Phase 24A does not implement IndexedDB.`,
  `Phase 24A does not implement storage migration.`,
  `Phase 24A does not make backup/export/restore adapter-aware.`,
  `Phase 24A does not add sync, cloud, account, auth, or backend behavior.`,
  `Phase 24A does not make Shime BETA_READY.`,
  `Phase 24A only informs Phase 24B boundary planning.`,
];

const searchConcepts = [
  `localStorage`,
  `sessionStorage`,
  `indexedDB`,
  `window.localStorage`,
  `window.sessionStorage`,
  `globalThis.localStorage`,
  `Storage API usage`,
  `custom storage wrappers`,
  `backup/export/import/restore storage touchpoints`,
  `migration/journal/storage adapter touchpoints`,
  `FSRS storage touchpoints`,
  `settings/preferences persistence`,
  `Study Room or review scheduler persistence touchpoints`,
  `EduGen/import draft persistence touchpoints`,
  `service worker/cache references if relevant`,
];

const classificationBuckets = [
  `adapter candidate`,
  `explicitly whitelisted`,
  `needs design review`,
  `backup/export/restore sensitive`,
  `migration sensitive`,
  `do-not-touch until later phase`,
  `false positive / not app persistence`,
];

const tableColumns = [
  `Area`,
  `File or pattern`,
  `Storage usage`,
  `Current role`,
  `Classification`,
  `Risk`,
  `Phase 24B follow-up`,
];

const sensitiveTerms = [
  `backup/export`,
  `restore`,
  `import`,
  `settings/preferences`,
  `review scheduling`,
  `FSRS metadata`,
  `EduGen/import draft data`,
  `service worker or cache behavior`,
  `migration or journal references`,
];

const allowedClaims = [
  `Residual direct-storage usage has been audited.`,
  `Direct-storage findings have been classified.`,
  `Phase 24B can use the audit to plan StorageAdapter boundaries.`,
];

const separateGateStatements = [
  `Phase 24B is a separate gate.`,
  `Phase 24A does not approve runtime storage changes.`,
  `Phase 24A does not approve StorageAdapter implementation.`,
  `Phase 24A does not approve IndexedDB.`,
  `Phase 24A does not approve adapter-aware backup/export/restore implementation.`,
];

const forbiddenClaims = [
  `local-first hybrid beta ready`,
  `production IndexedDB storage exists`,
  `StorageAdapter expansion implemented`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
  `Phase 24B through 24F are automatically approved`,
  `runtime storage changes are approved`,
  `IndexedDB pilot is approved`,
  `backup/restore adapter-awareness runtime work is approved`,
];

const forbiddenPrefixes = [`src/`, `tests/`, `e2e/`, `docs/adr/`];
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
  console.error(`Phase 24A validation failed: ${message}`);
  process.exit(1);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, `utf8`);
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

function requireIncludes(file, text, value) {
  if (!text.includes(value)) fail(`${file} is missing required text: ${value}`);
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) requireIncludes(file, text, heading);
}

function docsWithoutMustNotClaimSections() {
  return `${read(AUDIT_DOC)}\n${read(RELEASE_SUMMARY)}`
    .replace(/## What Phase 24A must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bNo `src|\bnot approved\b/i.test(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23f = `node scripts/validate-phase23f-phase23-decision-gate.js`;
  const phase24a = `node scripts/validate-phase24a-residual-direct-storage-audit.js`;
  if (!workflow.includes(phase24a)) fail(`CI does not register Phase 24A validator`);
  if (workflow.indexOf(phase24a) <= workflow.indexOf(phase23f)) fail(`CI must register Phase 24A after Phase 23F`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of phase24aPaths) read(file);
  requireHeadings(AUDIT_DOC, auditHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [AUDIT_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    requireIncludes(file, text, nextPhaseLine);
    for (const statement of positioningStatements) requireIncludes(file, text, statement);
    for (const statement of separateGateStatements) requireIncludes(file, text, statement);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
  }

  const audit = read(AUDIT_DOC);
  for (const concept of searchConcepts) requireIncludes(AUDIT_DOC, audit, concept);
  for (const bucket of classificationBuckets) requireIncludes(AUDIT_DOC, audit, bucket);
  for (const column of tableColumns) requireIncludes(AUDIT_DOC, audit, column);
  for (const term of sensitiveTerms) requireIncludes(AUDIT_DOC, audit, term);
  if (!audit.includes(`not found in this audit`)) fail(`${AUDIT_DOC} must record empty areas as not found in this audit`);
}

function validateForbiddenClaims() {
  const permittedMustNotSections = `${read(AUDIT_DOC)}\n${read(RELEASE_SUMMARY)}`
    .match(/## What Phase 24A must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || ``;
  if (!permittedMustNotSections.includes(`BETA_READY`)) fail(`must-not-claim sections must include BETA_READY`);
  const outsideMustNot = docsWithoutMustNotClaimSections();
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections: ${claim}`);
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file)) && !file.startsWith(`scripts/validate-`)) {
      fail(`Forbidden runtime/storage/sync path changed: ${file}`);
    }
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }
}

function validateHistoricalForwardCompatEntries() {
  const historicalFiles = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file !== VALIDATOR);
  for (const file of historicalFiles) {
    const diff = runGit(`git diff -- ${file}`);
    if (!diff) continue;
    const isPhase24bOnlyForwardCompat = phase24bForwardCompatPaths.some(path => diff.includes(path));
    const requiredForwardCompatPaths = isPhase24bOnlyForwardCompat ? phase24bForwardCompatPaths : phase24aPaths;
    for (const phase24aPath of requiredForwardCompatPaths) {
      if (!diff.includes(phase24aPath)) fail(`${file} missing exact ${isPhase24bOnlyForwardCompat ? `Phase 24B` : `Phase 24A`} forward-compat path: ${phase24aPath}`);
    }
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      const isPathEntry = phase24aPaths.some(path => line.includes(path)) || phase24bForwardCompatPaths.some(path => line.includes(path));
      const isCompatName = line.includes(`phase24aForwardCompatPaths`) || line.includes(`phase24aPaths`) || line.includes(`phase24bForwardCompatPaths`);
      const isCompatSpread = line.includes(`...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths`) || line.includes(`...phase24bForwardCompatPaths`);
      const isCompatGuard = line.includes(`isPhase24a`) || line.includes(`phase24aPath`) || line.includes(`isPhase24b`) || line.includes(`isRequiredForwardCompatLogic`) || line.includes(`requiredForwardCompatPaths`);
      const isCompatMessage = line.includes(`Phase 24A forward-compat path`) || line.includes(`Phase 24A forward-compat entries`) || line.includes(`Phase 24B forward-compat path`) || line.includes(`Phase 24B forward-compat entries`) || line.includes(`isForwardCompatMessage`) || line.includes(`non-forward-compat addition`) || line.includes(`forward-compat`);
      if (!isPathEntry && !isCompatName && !isCompatSpread && !isCompatGuard && !isCompatMessage) {
        fail(`${file} contains non-forward-compat addition: ${line}`);
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
    if (file.endsWith(`.log`)) fail(`Generated artifact must not be present as untracked output: ${file}`);
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateChangedFiles();
validateHistoricalForwardCompatEntries();
validateGeneratedArtifactsAbsent();

console.log(`Phase 24A residual direct-storage audit validation passed.`);
