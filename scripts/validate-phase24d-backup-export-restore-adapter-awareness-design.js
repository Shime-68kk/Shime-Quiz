#!/usr/bin/env node
/**
 * Phase 24D static validator - backup/export/restore adapter-awareness design gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const DESIGN_DOC = `docs/research/phase24d-backup-export-restore-adapter-awareness-design.md`;
const RELEASE_SUMMARY = `docs/release/phase24d-backup-export-restore-adapter-awareness-summary.md`;
const VALIDATOR = `scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase24dPaths = [DESIGN_DOC, RELEASE_SUMMARY, VALIDATOR];
const allowedChanged = new Set([WORKFLOW, ...phase24dPaths]);

const validDecisionTokens = [
  `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: PASS_TO_PHASE24E_TEST_ONLY_SCAFFOLD_WITH_ROLLBACK_GATES`,
  `PHASE24D_BACKUP_RESTORE_ADAPTER_AWARENESS_DESIGN_DECISION: HOLD_FOR_BACKUP_RESTORE_DESIGN_REVISION`,
];

const priorTokens = [
  `PHASE24A_RESIDUAL_DIRECT_STORAGE_AUDIT_STATUS: COMPLETED_AUDIT_ONLY`,
  `PHASE24B_STORAGE_ADAPTER_BOUNDARY_DECISION: PASS_TO_PHASE24C_LOW_RISK_SCAFFOLD_PLANNING_WITH_RUNTIME_GATES`,
  `PHASE24C_HELP_TOUR_STORAGE_ADAPTER_SCAFFOLD_STATUS: COMPLETED_LOW_RISK_RUNTIME_SCAFFOLD`,
];

const designHeadings = [
  `# Phase 24D — Backup/Export/Restore Adapter-Awareness Design Gate`,
  `## Decision token`,
  `## Scope`,
  `## Inputs`,
  `## Design goals`,
  `## Current boundary`,
  `## Future adapter-aware boundaries`,
  `## Design matrix`,
  `## Restore safety requirements`,
  `## Backup/export compatibility requirements`,
  `## Rollback and evidence requirements`,
  `## Phase 24E gate conditions`,
  `## What Phase 24D can claim`,
  `## What Phase 24D must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24D — Backup/Export/Restore Adapter-Awareness Summary`,
  `## Decision token`,
  `## Scope`,
  `## Design summary`,
  `## Restore safety requirements`,
  `## Backup/export compatibility requirements`,
  `## Phase 24E gate conditions`,
  `## What Phase 24D can claim`,
  `## What Phase 24D must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 24D is docs/design/static-validator/CI-only.`,
  `Phase 24D does not change runtime behavior.`,
  `Phase 24D does not implement adapter-aware backup/export/restore.`,
  `Phase 24D does not change backup/export/restore file formats.`,
  `Phase 24D does not change restore overwrite behavior.`,
  `Phase 24D does not implement IndexedDB.`,
  `Phase 24D does not implement storage migration.`,
  `Phase 24D does not change the default storage driver.`,
  `Phase 24D does not add sync, cloud, account, auth, or backend behavior.`,
  `Phase 24D does not make Shime BETA_READY.`,
  `Phase 24D only defines a future backup/export/restore adapter-awareness design gate.`,
];

const designCoverage = [
  `adapter-aware backup/export purpose`,
  `adapter-aware restore purpose`,
  `current local-first backup boundary`,
  `future StorageAdapter read boundary`,
  `future StorageAdapter write boundary`,
  `backup file format compatibility`,
  `backup payload versioning`,
  `manifest or metadata boundary`,
  `restore preview requirement`,
  `restore overwrite confirmation`,
  `dry-run restore requirement`,
  `rollback snapshot requirement`,
  `post-restore verification requirement`,
  `same-adapter round trip`,
  `cross-adapter round trip`,
  `localStorage default driver compatibility`,
  `IndexedDB future-driver risk`,
  `partial restore failure handling`,
  `unknown adapter state handling`,
  `corrupt backup file handling`,
  `large backup/import risk`,
  `manual backup/export is not sync`,
  `user-controlled backup file remains required`,
  `platform backup is not guaranteed`,
  `no-cloud/default-off trust boundary`,
  `privacy and local-only constraints`,
  `Phase 24E scaffold limits`,
];

const matrixColumns = [
  `Area`,
  `Current behavior / assumption`,
  `Future adapter-aware requirement`,
  `Data-loss risk`,
  `Required safety gate`,
  `Phase 24E allowed action`,
  `Phase 24E forbidden action`,
];

const matrixRows = [
  `backup/export read path`,
  `backup file format`,
  `restore preview`,
  `restore overwrite confirmation`,
  `rollback snapshot`,
  `post-restore verification`,
  `same-adapter round trip`,
  `cross-adapter round trip`,
  `localStorage default driver`,
  `future IndexedDB driver`,
  `partial failure handling`,
  `corrupt backup handling`,
  `large backup/import`,
  `manual transfer`,
];

const phase24eGateConditions = [
  `Phase 24E must be default OFF or test-only.`,
  `Phase 24E must not change production backup/export/restore behavior by default.`,
  `Phase 24E must not change backup file format without a compatibility plan.`,
  `Phase 24E must not remove existing localStorage backup compatibility.`,
  `Phase 24E must not implement IndexedDB production storage.`,
  `Phase 24E must not migrate data.`,
  `Phase 24E must include rollback snapshot design.`,
  `Phase 24E must include restore preview or explicit overwrite confirmation preservation.`,
  `Phase 24E must include post-restore verification.`,
  `Phase 24E must include strict changed-file ownership.`,
  `Phase 24E must include reviewer before push/PR.`,
  `Phase 24E must include tester/local validation.`,
];

const rollbackEvidence = [
  `rollback plan required before runtime scaffold`,
  `dry-run or test-only mode required before production behavior`,
  `same-adapter round-trip evidence required`,
  `cross-adapter compatibility evidence required before broader claims`,
  `restore overwrite safety evidence required`,
  `backup file compatibility evidence required`,
  `no data-loss guarantee may be claimed`,
];

const allowedClaims = [
  `Backup/export/restore adapter-awareness design direction exists.`,
  `Restore preview, rollback, dry-run, and verification requirements have been defined.`,
  `Phase 24E can be scoped separately as default-OFF or test-only scaffold if the design passes.`,
  `Production adapter-aware backup/export/restore is not implemented.`,
];

const forbiddenClaims = [
  `BETA_READY`,
  `local-first hybrid beta ready`,
  `production IndexedDB storage exists`,
  `StorageAdapter expansion broadly implemented`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `adapter-aware backup/export/restore implemented`,
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
  `Phase 24E through 24F are automatically approved`,
  `runtime backup/export/restore changes are broadly approved`,
  `IndexedDB pilot is approved`,
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

const forbiddenTouchedPrefixes = [
  `src/`,
  `tests/`,
  `e2e/`,
  `docs/adr/`,
];

const forbiddenTouchedFiles = [
  `package.json`,
  `package-lock.json`,
  `sw.js`,
  `boot-guard.js`,
];

function fail(message) {
  console.error(`Phase 24D validation failed: ${message}`);
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

function mustNotSection(file, text) {
  return text.match(/## What Phase 24D must not claim[\s\S]*?(?=\n## |$)/g)?.join(`\n`) || fail(`${file} is missing must-not-claim section`);
}

function withoutMustNotSections(text) {
  return text
    .replace(/## What Phase 24D must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bnot approved\b|\bnot automatically approved\b|\bnot implemented\b|\bnot change\b|\bnot claim\b/i.test(line))
    .filter(line => !line.includes(`Backup/export/restore adapter-awareness design direction exists.`))
    .filter(line => !line.includes(`Phase 24D only defines a future backup/export/restore adapter-awareness design gate.`))
    .join(`\n`);
}

function countDecisionTokens(text) {
  return validDecisionTokens.reduce((count, token) => count + (text.match(new RegExp(token, `g`)) || []).length, 0);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24c = `node scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`;
  const phase24d = `node scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`;
  if (!workflow.includes(phase24d)) fail(`CI does not register Phase 24D validator`);
  if (workflow.indexOf(phase24d) <= workflow.indexOf(phase24c)) fail(`CI must register Phase 24D after Phase 24C`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of phase24dPaths) read(file);
  requireHeadings(DESIGN_DOC, designHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [DESIGN_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (countDecisionTokens(text) !== 1) fail(`${file} must contain exactly one valid Phase 24D decision token`);
    for (const token of priorTokens) requireIncludes(file, text, token);
    for (const statement of positioningStatements) requireIncludes(file, text, statement);
    for (const gate of phase24eGateConditions) requireIncludes(file, text, gate);
    for (const evidence of rollbackEvidence) requireIncludes(file, text, evidence);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
    requireIncludes(file, text, `Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only`);
    requireIncludes(file, text, `Phase 24E is a separate runtime gate.`);
    requireIncludes(file, text, `Phase 24D does not approve production adapter-aware backup/export/restore.`);
  }

  const design = read(DESIGN_DOC);
  for (const term of designCoverage) requireIncludes(DESIGN_DOC, design, term);
  for (const column of matrixColumns) requireIncludes(DESIGN_DOC, design, column);
  for (const row of matrixRows) requireIncludes(DESIGN_DOC, design, `| ${row} |`);
}

function validateForbiddenClaims() {
  const combined = `${read(DESIGN_DOC)}\n${read(RELEASE_SUMMARY)}`;
  for (const file of [DESIGN_DOC, RELEASE_SUMMARY]) {
    const section = mustNotSection(file, read(file));
    for (const claim of forbiddenClaims) {
      if (!section.includes(claim)) fail(`${file} must-not-claim section must include: ${claim}`);
    }
  }
  const outsideMustNot = withoutMustNotSections(combined);
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim sections or negative guardrails: ${claim}`);
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
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
    for (const phase24dPath of phase24dPaths) {
      if (!diff.includes(phase24dPath)) fail(`${file} missing exact Phase 24D forward-compat path: ${phase24dPath}`);
    }
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      const isPathEntry = phase24dPaths.some(path => line.includes(path));
      const isCompatName = line.includes(`phase24dForwardCompatPaths`) || line.includes(`phase24dPaths`);
      const isCompatSpread = line.includes(`...phase24dForwardCompatPaths`);
      const isCompatGuard = line.includes(`isPhase24d`) || line.includes(`phase24dPath`) || line.includes(`requiredForwardCompatPaths`) || line.includes(`allowedChanged.has(file)`);
      const isCompatPhase24cSkip = line.includes(`scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`);
      const isCompatMessage = line.includes(`Phase 24D forward-compat path`) || line.includes(`Phase 24D forward-compat entries`) || line.includes(`non-forward-compat addition`) || line.includes(`forward-compat`);
      if (!isPathEntry && !isCompatName && !isCompatSpread && !isCompatGuard && !isCompatMessage && !isCompatPhase24cSkip) {
        fail(`${file} contains non-Phase-24D forward-compat addition: ${line}`);
      }
      if (/docs\/research\/\*\*|docs\/release\/\*\*|scripts\/\*\*/.test(line)) {
        fail(`${file} contains a folder-wide Phase 24D allowlist entry: ${line}`);
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
    if (file === `FETCH_HEAD` || file === `.env` || file === `.env.local` || file.endsWith(`.log`)) {
      fail(`Generated artifact must not be present as untracked output: ${file}`);
    }
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateChangedFiles();
validateHistoricalForwardCompatEntries();
validateGeneratedArtifactsAbsent();

console.log(`Phase 24D backup/export/restore adapter-awareness design validation passed.`);
