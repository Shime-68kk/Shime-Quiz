#!/usr/bin/env node
/**
 * Phase 24D-HF2 static validator - CI validator strategy reset gate.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const RESEARCH_DOC = `docs/research/phase24d-hf2-ci-validator-strategy-reset.md`;
const RELEASE_SUMMARY = `docs/release/phase24d-hf2-ci-validator-strategy-summary.md`;
const VALIDATOR = `scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const allowedChanged = new Set([RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR, WORKFLOW]);

const statusToken = `PHASE24D_HF2_CI_VALIDATOR_STRATEGY_STATUS: COMPLETED_CURRENT_PHASE_GATE_RESET`;

const researchHeadings = [
  `# Phase 24D-HF2 — CI Validator Strategy Reset / Current-Phase Gate`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Problem statement`,
  `## Root cause`,
  `## Decision`,
  `## Current PR gate`,
  `## Historical full-chain audit`,
  `## Guardrails`,
  `## Rollback plan`,
  `## Validation plan`,
  `## What Phase 24D-HF2 can claim`,
  `## What Phase 24D-HF2 must not claim`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 24D-HF2 — CI Validator Strategy Summary`,
  `## Status token`,
  `## Scope`,
  `## Strategy summary`,
  `## Guardrails`,
  `## Rollback plan`,
  `## Validation summary`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 24D-HF2 is CI/docs/static-validator only.`,
  `Phase 24D-HF2 does not change runtime behavior.`,
  `Phase 24D-HF2 does not implement Phase 24E.`,
  `Phase 24D-HF2 does not modify historical validators.`,
  `Phase 24D-HF2 does not weaken current-phase validators.`,
  `Phase 24D-HF2 separates current PR validation from historical full-chain audit debt.`,
  `Phase 24D-HF2 does not make Shime BETA_READY.`,
];

const strategyTerms = [
  `run the Phase 24D-HF2 validator explicitly`,
  `run build and unit tests`,
  `do not rerun Phase 24D validator as a merge-blocking PR gate because Phase 24D validator passed in its own phase`,
  `For Phase 24D-HF2, the default e2e-smoke gate is the Phase 24D-HF2 validator plus build and unit tests.`,
  `HF2 does not rerun Phase 24D validator as a merge-blocking PR gate.`,
  `Phase 24D validator passed in its own phase.`,
  `do not run the entire historical scripts/validate-*.js chain as a default PR blocker`,
  `full scripts/validate-*.js chain remains useful`,
  `run it manually, locally, or on scheduled/maintenance workflows`,
  `full chain failures from historical forward-compat debt should create maintenance tasks, not force unrelated runtime phases to patch old validators`,
  `historical/current-pr-adjacent validators may still be run manually when intentionally debugging validator debt`,
  `current-phase validators must remain strict`,
  `no broad allowlists`,
  `no runtime/source/package files are allowed in this phase`,
];

const rollbackPlan = [
  `Revert .github/workflows/e2e-smoke.yml.`,
  `Remove docs/research/phase24d-hf2-ci-validator-strategy-reset.md.`,
  `Remove docs/release/phase24d-hf2-ci-validator-strategy-summary.md.`,
  `Remove scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js.`,
  `No runtime data migration or cleanup is required because no runtime behavior changes.`,
];

const allowedClaims = [
  `Current PR validation is separated from historical full-chain validator audit debt.`,
  `Current-phase validators remain strict.`,
  `Historical full-chain validation remains available as manual/local/scheduled audit guidance.`,
  `Runtime behavior is unchanged.`,
];

const forbiddenClaims = [
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
  `scripts/validate-phase18c-manual-migration-ux-plan.js`,
  `scripts/validate-phase18d-internal-test-only-local-migration-pilot.js`,
  `scripts/validate-phase18e-limited-local-backend-pilot-rollback-gates.js`,
  `scripts/validate-phase19a-fsrs-public-opt-in-sequencing-gate.js`,
  `scripts/validate-phase19b-optional-sync-architecture-decision.js`,
  `scripts/validate-phase19c-optional-sync-conflict-model.js`,
  `scripts/validate-phase19d-no-cloud-default-off-trust-copy.js`,
  `scripts/validate-phase20a-beta-local-first-hybrid-stabilization.js`,
  `scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`,
  `scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`,
  `scripts/register-phase-forward-compat.js`,
  `scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`,
  `docs/research/phase24d-hf1-validator-forward-compat-maintenance.md`,
  `docs/release/phase24d-hf1-validator-forward-compat-summary.md`,
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
  console.error(`Phase 24D-HF2 validation failed: ${message}`);
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

function section(file, text, heading) {
  return text.match(new RegExp(`${heading.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)}[\\s\\S]*?(?=\\n## |$)`))?.[0] || fail(`${file} is missing section: ${heading}`);
}

function withoutMustNotSections(text) {
  return text
    .replace(/## What Phase 24D-HF2 must not claim[\s\S]*?(?=\n## |$)/g, ``)
    .split(/\r?\n/)
    .filter(line => !/\bdoes not\b|\bmust not\b|\bnot approve\b|\bnot implemented\b|\bnot change\b|\bnot claim\b/i.test(line))
    .join(`\n`);
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase24d = `node scripts/validate-phase24d-backup-export-restore-adapter-awareness-design.js`;
  const phase24dHf2 = `node scripts/validate-phase24d-hf2-ci-validator-strategy-reset.js`;
  const phase24dHf1 = `node scripts/validate-phase24d-hf1-validator-forward-compat-maintenance.js`;

  if (!workflow.includes(phase24dHf2)) fail(`CI does not register Phase 24D-HF2 validator`);
  const phase24dStep = new RegExp(`run:\\s*${phase24d.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`)}`);
  if (phase24dStep.test(workflow)) fail(`CI must not run Phase 24D validator as a default e2e-smoke PR gate`);
  if (workflow.includes(phase24dHf1)) fail(`CI must not register Phase 24D-HF1 validator`);
  if (/for\s+f\s+in\s+scripts\/validate-\*\.js/.test(workflow)) fail(`CI must not run full scripts/validate-*.js chain as default e2e-smoke PR gate`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateDocs() {
  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(RESEARCH_DOC, researchHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [RESEARCH_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    requireIncludes(file, text, statusToken);
    for (const statement of positioningStatements) requireIncludes(file, text, statement);
    for (const term of strategyTerms) requireIncludes(file, text, term);
    for (const line of rollbackPlan) requireIncludes(file, text, line);
    for (const claim of allowedClaims) requireIncludes(file, text, claim);
    requireIncludes(file, text, `Next recommended phase: Phase 24E — Adapter-Aware Backup/Export/Restore Scaffold, default OFF or test-only`);
    requireIncludes(file, text, `Phase 24E is a separate runtime/data-loss-risk gate.`);
    requireIncludes(file, text, `Phase 24D-HF2 does not approve production adapter-aware backup/export/restore.`);
  }
}

function validateForbiddenClaims() {
  const research = read(RESEARCH_DOC);
  const mustNot = section(RESEARCH_DOC, research, `## What Phase 24D-HF2 must not claim`);
  for (const claim of forbiddenClaims) requireIncludes(RESEARCH_DOC, mustNot, claim);

  const outsideMustNot = withoutMustNotSections(`${research}\n${read(RELEASE_SUMMARY)}`);
  for (const claim of forbiddenClaims) {
    if (outsideMustNot.includes(claim)) fail(`forbidden claim is present outside must-not-claim or negative guardrail text: ${claim}`);
  }
}

function validateChangedFiles() {
  const changed = changedFiles();
  for (const file of changed) {
    if (!allowedChanged.has(file)) fail(`Unexpected changed file: ${file}`);
    if (forbiddenTouchedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenTouchedFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`)) || file.endsWith(`.log`)) {
      fail(`Generated artifact should not be changed: ${file}`);
    }
  }
}

function validateHistoricalValidatorsUnchanged() {
  const changed = changedFiles();
  for (const file of changed) {
    if (file.startsWith(`scripts/validate-`) && file !== VALIDATOR) fail(`Historical validator changed: ${file}`);
  }
}

function validateGeneratedArtifactsAbsent() {
  for (const file of lines(runGit(`git ls-files`))) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact must not be tracked: ${file}`);
    }
    if (file.endsWith(`.log`)) fail(`Generated log artifact must not be tracked: ${file}`);
  }
}

validateWorkflow();
validateDocs();
validateForbiddenClaims();
validateChangedFiles();
validateHistoricalValidatorsUnchanged();
validateGeneratedArtifactsAbsent();

console.log(`Phase 24D-HF2 CI validator strategy reset validation passed.`);
