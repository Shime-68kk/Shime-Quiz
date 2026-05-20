#!/usr/bin/env node
/**
 * Phase 23E static validator - data-survival comprehension evidence-run plan.
 */

import fs from 'node:fs';
import { execSync } from 'node:child_process';

const PLAN_DOC = `docs/research/phase23e-data-survival-comprehension-evidence-run-plan.md`;
const RELEASE_SUMMARY = `docs/release/phase23e-data-survival-comprehension-plan-summary.md`;
const VALIDATOR = `scripts/validate-phase23e-data-survival-comprehension-plan.js`;
const WORKFLOW = `.github/workflows/e2e-smoke.yml`;

const phase23ePaths = [PLAN_DOC, RELEASE_SUMMARY, VALIDATOR];
const phase23fForwardCompatPaths = [`docs/release/phase23f-phase23-decision-gate.md`, `docs/research/phase23f-data-survival-decision-matrix.md`, `scripts/validate-phase23f-phase23-decision-gate.js`];
const phase24aForwardCompatPaths = [`docs/research/phase24a-residual-direct-storage-audit.md`, `docs/release/phase24a-residual-direct-storage-audit-summary.md`, `scripts/validate-phase24a-residual-direct-storage-audit.js`];
const phase24bForwardCompatPaths = [`docs/research/phase24b-storage-adapter-coverage-boundary-decision.md`, `docs/release/phase24b-storage-adapter-boundary-summary.md`, `scripts/validate-phase24b-storage-adapter-boundary-decision.js`];
const phase24cForwardCompatPaths = [`src/ui/helpTourStorage.js`, `src/ui/helpTour.js`, `tests/unit/helpTourStorageAdapterScaffold.test.js`, `docs/research/phase24c-help-tour-storage-adapter-scaffold.md`, `docs/release/phase24c-help-tour-storage-adapter-scaffold-summary.md`, `scripts/validate-phase24c-help-tour-storage-adapter-scaffold.js`];
const allowedChanged = new Set([
  WORKFLOW,
  ...phase23ePaths,
  ...phase23fForwardCompatPaths,
  ...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths,
  `scripts/validate-phase22h-beta-readiness-redecision-broader-evidence.js`,
  `scripts/validate-phase23a-local-data-survival-research.js`,
  `scripts/validate-phase23b-data-survival-ux-copy.js`,
  `scripts/validate-phase23c-backup-health-design.js`,
  `scripts/validate-phase23d-backup-reminder-risk-friction-design.js`,
]);

const statusToken = `PHASE23E_DATA_SURVIVAL_COMPREHENSION_PLAN_STATUS: COMPLETED_DOCS_ONLY`;
const nextPhaseLine = `Next recommended phase: Phase 23F — Phase 23 Decision Gate`;

const planHeadings = [
  `# Phase 23E — Evidence-Run Plan for Data-Survival Comprehension`,
  `## Status token`,
  `## Scope`,
  `## Inputs`,
  `## Research goals`,
  `## Participant profile`,
  `## Session setup`,
  `## Scenario list`,
  `## Comprehension questions`,
  `## Evidence thresholds`,
  `## Observation log template`,
  `## Tone and ethics rules`,
  `## Evidence interpretation rules`,
  `## What Phase 23E can claim`,
  `## What Phase 23E must not claim`,
  `## Phase 23F roadmap implication`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const summaryHeadings = [
  `# Phase 23E — Data-Survival Comprehension Plan Summary`,
  `## Status token`,
  `## Scope`,
  `## Plan summary`,
  `## Research scenarios`,
  `## Evidence thresholds`,
  `## Ethics and anonymization`,
  `## What Phase 23E can claim`,
  `## What Phase 23E must not claim`,
  `## Guardrails`,
  `## Next recommended phase`,
];

const positioningStatements = [
  `Phase 23E is a docs-only evidence-run planning gate.`,
  `Phase 23E does not execute user research sessions.`,
  `Phase 23E does not collect personal data.`,
  `Phase 23E does not implement runtime UI.`,
  `Phase 23E does not implement backup reminders.`,
  `Phase 23E does not implement backup health tracking.`,
  `Phase 23E does not change backup/export/restore behavior.`,
  `Phase 23E does not make Shime BETA_READY.`,
  `Phase 23E does not make backup/export/restore adapter-aware.`,
  `Phase 23E does not verify platform backup behavior.`,
  `Phase 23E does not add sync, cloud, account, auth, or backend behavior.`,
];

const coverageTerms = [
  `research goals`,
  `participant profile`,
  `Recommended sample size`,
  `non-technical Vietnamese learners`,
  `generated/test data only`,
  `Do not collect personal data`,
  `Session setup`,
  `Task script`,
  `Scenario list`,
  `Comprehension questions`,
  `Success criteria`,
  `Failure criteria`,
  `anonymized`,
  `Observation log template`,
  `Moderator notes`,
  `Evidence interpretation rules`,
  `Small-sample limitations`,
  `Phase 23F can decide`,
  `What forces HOLD or redesign`,
];

const scenarios = [
  `where your data lives explanation`,
  `first backup nudge comprehension`,
  `backup health state comprehension`,
  `backup reminder comprehension`,
  `restore overwrite warning comprehension`,
  `large import backup-before-action comprehension`,
  `manual transfer to another device comprehension`,
  `platform backup uncertainty comprehension`,
  `non-blaming recovery tone comprehension`,
  `manual backup/export is not sync comprehension`,
];

const questionChecks = [
  `where is Shime data stored by default`,
  `uninstalled or site data is cleared`,
  `manual backup/export the same as sync`,
  `platform backup will preserve`,
  `restore from a backup over current local data`,
  `backup is stale`,
  `guarantee data-loss prevention`,
  `sync, cloud, account, auth, or backend behavior is present`,
  `before changing to another device`,
  `before a risky import or restore`,
];

const thresholds = [
  `PASS_RESEARCH_DIRECTION`,
  `HOLD_FOR_COPY_REVISION`,
  `HOLD_FOR_UX_REDESIGN`,
  `BLOCKED_BY_RECRUITMENT_OR_ENVIRONMENT`,
];

const observationColumns = [
  `Participant ID`,
  `Scenario`,
  `Prompt shown`,
  `Participant explanation`,
  `Observed confusion`,
  `Researcher note`,
  `Outcome`,
  `Follow-up needed`,
];

const ethicsRules = [
  `Use generated/test data only.`,
  `Do not collect personal learning data.`,
  `Use anonymized participant IDs.`,
  `Do not pressure participants to disclose personal device or backup habits.`,
  `Do not frame misunderstanding as user failure.`,
  `Keep Vietnamese-first and non-blaming tone.`,
  `Do not claim broad external real-user evidence from this small plan alone.`,
];

const allowedClaims = [
  `A data-survival comprehension evidence-run plan exists.`,
  `Comprehension scenarios and questions have been planned.`,
  `Anonymized observation rules have been defined.`,
  `Phase 23F can use this plan to decide whether to run evidence, revise copy, or redesign UX direction.`,
];

const forbiddenClaims = [
  `broad external real-user evidence complete`,
  `data-survival comprehension evidence complete`,
  `sync exists`,
  `cloud sync exists`,
  `account/auth/backend exists`,
  `production sync ready`,
  `production IndexedDB storage exists`,
  `storage migration complete`,
  `backup/export adapter-aware`,
  `restore adapter-aware`,
  `backup reminder is implemented`,
  `pre-risk-action friction is implemented`,
  `backup health tracking is implemented`,
  `last-backup tracking is implemented`,
  `guaranteed data-loss prevention`,
  `platform backup will preserve user data`,
  `built-in AI`,
  `AI quiz generation`,
  `OCR`,
  `external AI/API integration`,
  `beta-ai public naming acceptable`,
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
  console.error(`Phase 23E validation failed: ${message}`);
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

function combinedDocs() {
  return `${read(PLAN_DOC)}\n${read(RELEASE_SUMMARY)}`;
}

function requireHeadings(file, headings) {
  const text = read(file);
  for (const heading of headings) {
    if (!text.includes(heading)) fail(`${file} is missing heading: ${heading}`);
  }
}

function validateWorkflow() {
  const workflow = read(WORKFLOW);
  const phase23d = `node scripts/validate-phase23d-backup-reminder-risk-friction-design.js`;
  const phase23e = `node scripts/validate-phase23e-data-survival-comprehension-plan.js`;
  if (!workflow.includes(phase23e)) fail(`CI does not register Phase 23E validator`);
  if (workflow.indexOf(phase23e) <= workflow.indexOf(phase23d)) fail(`CI must register Phase 23E after Phase 23D`);
  if (/continue-on-error:\s*true/i.test(workflow)) fail(`workflow must not use continue-on-error: true`);
}

function validateRequiredDocs() {
  for (const file of [PLAN_DOC, RELEASE_SUMMARY, VALIDATOR]) read(file);
  requireHeadings(PLAN_DOC, planHeadings);
  requireHeadings(RELEASE_SUMMARY, summaryHeadings);

  for (const file of [PLAN_DOC, RELEASE_SUMMARY]) {
    const text = read(file);
    if (!text.includes(statusToken)) fail(`${file} missing status token`);
    if (!text.includes(nextPhaseLine)) fail(`${file} missing exact next phase line`);
    for (const statement of positioningStatements) {
      if (!text.includes(statement)) fail(`${file} missing positioning statement: ${statement}`);
    }
    for (const rule of ethicsRules) {
      if (!text.includes(rule)) fail(`${file} missing ethics rule: ${rule}`);
    }
    for (const claim of allowedClaims) {
      if (!text.includes(claim)) fail(`${file} missing allowed claim: ${claim}`);
    }
  }
}

function validatePlanCoverage() {
  const plan = read(PLAN_DOC);
  for (const term of coverageTerms) {
    if (!plan.toLowerCase().includes(term.toLowerCase())) fail(`${PLAN_DOC} missing coverage term: ${term}`);
  }
  for (const scenario of scenarios) {
    if (!plan.includes(scenario)) fail(`${PLAN_DOC} missing scenario: ${scenario}`);
  }
  for (const question of questionChecks) {
    if (!plan.toLowerCase().includes(question.toLowerCase())) fail(`${PLAN_DOC} missing comprehension question check: ${question}`);
  }
  const numberedQuestions = [...plan.matchAll(/^\d+\.\s+/gm)].length;
  if (numberedQuestions < 10) fail(`${PLAN_DOC} must include at least 10 comprehension questions`);
  for (const threshold of thresholds) {
    if (!plan.includes(threshold)) fail(`${PLAN_DOC} missing threshold: ${threshold}`);
  }
  for (const column of observationColumns) {
    if (!plan.includes(column)) fail(`${PLAN_DOC} missing observation log column: ${column}`);
  }
  if (!/Participant IDs must be anonymized\./.test(plan)) fail(`${PLAN_DOC} must state participant IDs are anonymized`);
}

function validateSummaryCoverage() {
  const summary = read(RELEASE_SUMMARY);
  for (const scenario of scenarios) {
    if (!summary.includes(scenario)) fail(`${RELEASE_SUMMARY} missing scenario: ${scenario}`);
  }
  for (const threshold of thresholds) {
    if (!summary.includes(threshold)) fail(`${RELEASE_SUMMARY} missing threshold: ${threshold}`);
  }
  if (!summary.includes(`What forces HOLD or redesign`)) fail(`${RELEASE_SUMMARY} missing HOLD/redesign summary`);
}

function validateForbiddenClaims() {
  const docs = combinedDocs();
  const mustNotClaimSections = [...docs.matchAll(/## What Phase 23E must not claim([\s\S]*?)(?=\n## |$)/g)]
    .map(match => match[1])
    .join(`\n`);
  for (const claim of forbiddenClaims) {
    if (!mustNotClaimSections.toLowerCase().includes(claim.toLowerCase())) {
      fail(`must-not-claim section missing forbidden claim: ${claim}`);
    }
  }
}

function validateChangedFiles() {
  const files = changedFiles();
  for (const file of files) {
    const isHistoricalValidator = file.startsWith(`scripts/validate-`) && file !== VALIDATOR;
    if (!allowedChanged.has(file) && !isHistoricalValidator) fail(`Unexpected changed file: ${file}`);
    if (allowedChanged.has(file)) continue;
    if (forbiddenPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden path changed: ${file}`);
    if (forbiddenFiles.includes(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenPathPatterns.some(pattern => pattern.test(file))) fail(`Forbidden runtime/storage/sync path changed: ${file}`);
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact changed: ${file}`);
    }
  }
}

function validateHistoricalForwardCompatEntries() {
  const historicalFiles = changedFiles().filter(file => file.startsWith(`scripts/validate-`) && file !== VALIDATOR);
  for (const file of historicalFiles) {
    const diff = runGit(`git diff -- ${file}`);
    if (!diff) continue;
    for (const line of diff.split(/\r?\n/)) {
      if (!line.startsWith(`+`) || line.startsWith(`+++`)) continue;
      if (/^\+\s*[\]\)}]*;?\s*$/.test(line)) continue;
      if (line.includes(`if (/^`)) continue;
      if (line.includes(`line.includes(\`if (/^`)) continue;
      if (line.includes(`line.includes(\`line.includes`)) continue;
      const isPhase23ePathEntry = [...phase23ePaths].some(path => line.includes(path));
      const isPhase23fPathEntry = [...phase23fForwardCompatPaths].some(path => line.includes(path));
      const isPhase24aPathEntry = [...phase24aForwardCompatPaths, ...phase24bForwardCompatPaths, ...phase24cForwardCompatPaths].some(path => line.includes(path));
      const isPhase23eForwardCompatLogic = line.includes(`phase23eForwardCompatPaths`);
      const isPhase23fForwardCompatLogic = line.includes(`phase23fForwardCompatPaths`);
      const isPhase24aForwardCompatLogic = line.includes(`phase24aForwardCompatPaths`);
      const isPhase24bForwardCompatLogic = line.includes(`phase24bForwardCompatPaths`);
      const isPhase24cForwardCompatLogic = line.includes(`phase24cForwardCompatPaths`);
      const isRequiredForwardCompatLogic = line.includes(`requiredForwardCompatPaths`);
      const isPhase23fGuardLogic = line.includes(`isPhase23f`);
      const isPhase24aGuardLogic = line.includes(`isPhase24a`);
      const isPhase24bGuardLogic = line.includes(`isPhase24b`);
      const isPhase24cGuardLogic = line.includes(`isPhase24c`) || line.includes(`allowedChanged.has(file)`) || line.includes(`AllowedChangedFiles.has(file)`) || line.includes(`allowedChangedFiles.has(file)`);
      const isForwardCompatMessage = line.includes(`forward-compat`) || line.includes(`non-forward-compat addition`);
      if (!isPhase23ePathEntry && !isPhase23fPathEntry && !isPhase24aPathEntry && !isPhase23eForwardCompatLogic && !isPhase23fForwardCompatLogic && !isPhase24aForwardCompatLogic && !isPhase24bForwardCompatLogic && !isPhase24cForwardCompatLogic && !isRequiredForwardCompatLogic && !isPhase23fGuardLogic && !isPhase24aGuardLogic && !isPhase24bGuardLogic && !isPhase24cGuardLogic && !isForwardCompatMessage) {
        fail(`${file} contains non-Phase-23E forward-compat addition: ${line}`);
      }
    }
    const isPhase24aOnlyForwardCompat = phase24aForwardCompatPaths.some(path => diff.includes(path));
    const isPhase24bOnlyForwardCompat = phase24bForwardCompatPaths.some(path => diff.includes(path));
    const isPhase24cOnlyForwardCompat = phase24cForwardCompatPaths.some(path => diff.includes(path));
    if (!isPhase24aOnlyForwardCompat && !isPhase24cOnlyForwardCompat) {
      for (const path of phase23ePaths) {
        if (!diff.includes(path)) fail(`${file} missing Phase 23E forward-compat path: ${path}`);
      }
    }
    const requiredForwardCompatPaths = isPhase24cOnlyForwardCompat ? phase24cForwardCompatPaths : (isPhase24bOnlyForwardCompat ? phase24bForwardCompatPaths : phase24aForwardCompatPaths);
    for (const path of requiredForwardCompatPaths) {
      if (!diff.includes(path)) fail(`${file} missing ${isPhase24cOnlyForwardCompat ? `Phase 24C` : (isPhase24bOnlyForwardCompat ? `Phase 24B` : `Phase 24A`)} forward-compat path: ${path}`);
    }
  }
}

validateWorkflow();
validateRequiredDocs();
validatePlanCoverage();
validateSummaryCoverage();
validateForbiddenClaims();
validateChangedFiles();
validateHistoricalForwardCompatEntries();

console.log(`Phase 23E data-survival comprehension plan validation passed.`);
