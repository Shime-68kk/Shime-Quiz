#!/usr/bin/env node
/**
 * Phase 24B static validator - StorageAdapter boundary decision.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DECISION_DOC = `docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`;
const RELEASE_SUMMARY = `docs/release/phase24b-storage-adapter-boundary-summary.md`;
const VALIDATOR = `scripts/validate-phase24b-storage-adapter-boundary-decision.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase24bPaths = [DECISION_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase24cForwardCompatPaths = [
  `src/ui/helpTourStorage.js`,
  `src/ui/helpTour.js`,
  `tests/unit/helpTourStorageAdapterScaffold.test.js`,
  `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`,
  `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`,
  `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`,
];
const allowedChanged = new Set([WORKFLOW, ...phase24bPaths, ...phase24cForwardCompatPaths, `scripts/validate-phase24a-residual-direct-storage-audit.js`]);

const validDecisionTokens = [
  `PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES`,
  `PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: HOLD_FOR_STORAGE_BOUNDARY_REVISION`,
];
const phase24aToken = `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`;
const phase23fToken = `PHASE23_DATA_SURVIVAL_RESEARCH_DECISION: PASS_TO_PHASE24A_AUDIT_ONLY_WITH_RUNTIME_GATES`;
const nextPhase = `Phase 24C — One Low-Risk Storage Module Adapter Scaffold`;
const nextPhaseLine = `Next recommended phase: ${nextPhase}`;
const separateGate = `Phase 24C is a separate runtime gate and is not automatically approved by Phase 24B.`;

const decisionHeadings = [
  `# Phase 24B — StorageAdapter Coverage Plan / Boundary Decision`,
  `## Decision token`,
  `## Scope`,
  `## Inputs`,
  `## Phase 24A audit interpretation`,
  `## Boundary categories`,
  `## Boundary matrix`,
  `## Low-risk candidate recommendation`,
  `## Sensitive and do-not-touch areas`,
  `## Phase 24C gate conditions`,
  `## What Phase 24B can claim`,
  `## What Phase 24B must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24B — StorageAdapter Boundary Summary`,
  `## Decision token`,
  `## Scope`,
  `## Boundary summary`,
  `## Low-risk candidate recommendation`,
  `## Sensitive areas that remain gated`,
  `## Phase 24C gate conditions`,
  `## What Phase 24B can claim`,
  `## What Phase 24B must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 24B is docs/design/static-validator/CI-only.`,
  `Phase 24B does not change runtime behavior.`,
  `Phase 24B does not implement StorageAdapter expansion.`,
  `Phase 24B does not implement IndexedDB.`,
  `Phase 24B does not implement storage migration.`,
  `Phase 24B does not make backup/export/restore adapter-aware.`,
  `Phase 24B does not add sync, cloud, account, auth, or backend behavior.`,
  `Phase 24B does not make Shime BETA_READY.`,
  `Phase 24B only defines future StorageAdapter coverage boundaries.`,
];

const boundaryCategories = [
  `safe low-risk adapter candidate`,
  `explicitly whitelisted direct-storage usage`,
  `needs design review before implementation`,
  `backup/export/restore sensitive`,
  `migration sensitive`,
  `do-not-touch until later phase`,
  `false positive / not app persistence`,
];

const tableColumns = [
  `Area`,
  `Representative files or patterns`,
  `Phase 24A classification`,
  `Phase 24B boundary decision`,
  `Runtime risk`,
  `Allowed next action`,
  `Forbidden next action`,
];

const requiredAreas = [
  `legacy quiz modules`,
  `v2 library/state modules`,
  `settings/preferences`,
  `Study Room drafts`,
  `review scheduling`,
  `recommendationFeedbackStorage adapter-backed reference path`,
  `backup/export`,
  `restore`,
  `import`,
  `FSRS metadata`,
  `EduGen/import draft data`,
  `migration/journal references`,
  `IndexedDB dry-run/test-only references`,
  `service worker Cache API references`,
  `UI preference flags`,
];

const phase24cGates = [
  `Phase 24C must choose exactly one low-risk storage module or boundary.`,
  `Phase 24C must not touch backup/export/restore runtime.`,
  `Phase 24C must not touch IndexedDB.`,
  `Phase 24C must not change default storage driver.`,
  `Phase 24C must not migrate data.`,
  `Phase 24C must include rollback plan.`,
  `Phase 24C must include evidence plan.`,
  `Phase 24C must include strict changed-file ownership.`,
  `Phase 24C must include reviewer before push/PR.`,
  `Phase 24C must include tester/local validation if runtime behavior changes.`,
];

const allowedClaims = [
  `StorageAdapter coverage boundaries have been planned.`,
  `Low-risk candidate areas have been identified.`,
  `Backup/export/restore sensitive areas remain gated.`,
  `Phase 24C can be scoped separately if the boundary decision passes.`,
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
  `Phase 24C through 24F are automatically approved`,
  `runtime storage changes are approved broadly`,
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
  console.error(`Phase 24B validation failed: ${message}`);
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

function countDecisionTokens(text) {
  return validDecisionTokens.reduce((count, token) => count + text.split(token).length - 1, 0);
}

function docsWithoutMustNotClaimSections() {
  return `${read(DECISION_DOC)}\n${read(RELEASE_SUMMARY)}`
    .replace(/## What Phase 24B must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bnot approved\b|\bnot automatically approved\b/i.test(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24a = `node scripts/validate-phase24a-residual-direct-storage-audit.js`;
  const phase24b = `node scripts/validate-phase24b-storage-adapter-boundary-decision.js`;
  if (!workflow.includes(phase24b)) fail(`CI does not register Phase 24B validator`);
  if (workflow.indexOf(phase24b) <= workflow.indexOf(phase24a)) fail(`CI must register Phase 24B after Phase 24A`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of phase24bPaths) read(file);
  requireHeadings(DECISION_DOC, decisionHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [DECISION_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (countDecisionTokens(text) !== 1) fail(`${file} must include exactly one valid decision token`);
    requireIncludes(file, text, phase24aToken);
    requireIncludes(file, text, phase23fToken);
    requireIncludes(file, text, nextPhaseLine);
    requireIncludes(file, text, separateGate);
    for (const statement of positioningStatements) requireIncludes(file, text, statement);
    for (const gate of phase24cGates) requireIncludes(file, text, gate);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
  }

  const decision = read(DECISION_DOC);
  for (const category of boundaryCategories) requireIncludes(DECISION_DOC, decision, category);
  for (const column of tableColumns) requireIncludes(DECISION_DOC, decision, column);
  for (const area of requiredAreas) requireIncludes(DECISION_DOC, decision, area);
  if (!decision.includes(`| Area | Representative files or patterns | Phase 24A classification | Phase 24B boundary decision | Runtime risk | Allowed next action | Forbidden next action |`)) {
    fail(`${DECISION_DOC} is missing the required boundary matrix table header`);
  }

  const summary = read(RELEASE_SUMMARY);
  for (const area of requiredAreas) requireIncludes(RELEASE_SUMMARY, summary, area);
}

function validateForbiddenClaims() {
  const permittedMustNotSections = `${read(DECISION_DOC)}\n${read(RELEASE_SUMMARY)}`
    .match(/## What Phase 24B must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || ``;
  if (!permittedMustNotSections.includes(`BETA_READY`)) fail(`must-not-claim sections must include BETA_READY`);
  const outsideMustNot = docsWithoutMustNotClaimSections();
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections: ${claim}`);
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    const isPhase24cForwardCompat = phase24cForwardCompatPaths.includes(file);
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (!isPhase24cForwardCompat && forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (!isPhase24cForwardCompat && forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (!isPhase24cForwardCompat && forbiddenPathPatterns.some(pattern => pattern.test(file)) && !file.startsWith(`scripts/validate-`)) {
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
    const isPhase24cForwardCompat = phase24cForwardCompatPaths.some(path => diff.includes(path));
    const requiredForwardCompatPaths = isPhase24cForwardCompat ? phase24cForwardCompatPaths : phase24bPaths;
    for (const requiredPath of requiredForwardCompatPaths) {
      if (!diff.includes(requiredPath)) fail(`${file} missing exact ${isPhase24cForwardCompat ? `Phase 24C` : `Phase 24B`} forward-compat path: ${requiredPath}`);
    }
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      if (line.includes(`if (/^`)) continue;
      if (line.includes(`line.includes(\`/^`)) continue;
      if (line.includes(`line.includes(\`line.includes`)) continue;
      const isPathEntry = phase24bPaths.some(path => line.includes(path)) || phase24cForwardCompatPaths.some(path => line.includes(path));
      const isCompatName = line.includes(`phase24bForwardCompatPaths`) || line.includes(`phase24bPaths`) || line.includes(`phase24cForwardCompatPaths`);
      const isCompatSpread = line.includes(`...phase24bForwardCompatPaths`) || line.includes(`...phase24cForwardCompatPaths`);
      const isCompatGuard = line.includes(`isPhase24b`) || line.includes(`phase24bPath`) || line.includes(`isPhase24c`) || line.includes(`phase24cPath`) || line.includes(`requiredForwardCompatPaths`) || line.includes(`phase24aPath`) || line.includes(`validate-phase24a-residual-direct-storage-audit.js`) || line.includes(`AllowedChangedFiles.has(file)`) || line.includes(`allowedChangedFiles.has(file)`) || line.includes(`allowedChanged.has(file)`);
      const isCompatMessage = line.includes(`Phase 24B forward-compat path`) || line.includes(`Phase 24B forward-compat entries`) || line.includes(`Phase 24C forward-compat path`) || line.includes(`Phase 24C forward-compat entries`) || line.includes(`non-forward-compat addition`) || line.includes(`forward-compat`);
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

console.log(`Phase 24B StorageAdapter boundary decision validation passed.`);
