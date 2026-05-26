#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase35k-elastic-button-compression-pilot.js';
const REQUIRED_FILES = [
  'src/styles/global.css',
  'tests/unit/elasticButtonCompressionPilot.test.jsx',
  'docs/testing/phase35k-elastic-button-compression-pilot-evidence.md',
  'docs/release/phase35k-elastic-button-compression-pilot-summary.md',
  'docs/planning/phase35l-elastic-button-compression-pilot-evidence-review-seed.md',
  VALIDATOR_FILE,
  '.github/workflows/e2e-smoke.yml'
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);
const SELECTED_RUNTIME_FILES = [];
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW',
  'NEEDS_ELASTIC_BUTTON_COMPRESSION_PILOT_FIXES',
  'HOLD_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION'
];

const REQUIRED_TOKENS = [
  'PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_STATUS: COMPLETED_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION',
  'PHASE35K_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35K_RUNTIME_SCOPE: ELASTIC_BUTTON_COMPRESSION_PILOT_ONLY_NO_HANDLER_OR_DATA_CHANGES',
  'PHASE35K_SELECTED_EFFECT: ELASTIC_BUTTON_COMPRESSION_PILOT',
  'PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35K — Elastic Button Compression Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35J',
  '## Pilot target selection',
  '## Implementation summary',
  '## Changed files',
  '## Targeted button surfaces',
  '## Handler and behavior preservation',
  '## Desktop browser evidence',
  '## Mobile 375px evidence',
  '## Quick press and release evidence',
  '## Keyboard and focus evidence',
  '## Reduced-motion evidence',
  '## Disabled state evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 35K supports',
  '## What Phase 35K does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35K — Elastic Button Compression Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing change',
  '## Evidence summary',
  '## Validation summary',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 35L — Elastic Button Compression Pilot Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35K',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_OPTIONS = [
  'HOLD_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW',
  'NEEDS_ELASTIC_BUTTON_COMPRESSION_PILOT_FIXES',
  'PASS_TO_PHASE35M_NEXT_UI_POLISH_SCOPE'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35L — Elastic Button Compression Pilot Evidence Review',
  'Phase 35L is an evidence review and is not automatic next runtime implementation.',
  'Phase 35K confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35K does not approve BETA_READY.',
  'Phase 35K does not approve public production readiness.',
  'Phase 35K does not approve broad validation or stress-tested readiness.',
  'Phase 35K does not approve guaranteed data-loss prevention.',
  'Phase 35K does not approve storage/backup/restore behavior changes.',
  'Phase 35K does not approve sync/cloud/account/auth/backend.',
  'Phase 35K does not approve telemetry/network calls.',
  'Phase 35K does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35K does not approve route behavior changes.',
  'Phase 35K does not approve package/dependency changes.',
  'Phase 35K does not approve app-wide Elastic Button Compression.',
  'Phase 35K does not approve handler changes.',
  'Phase 35K does not approve submit behavior changes.',
  'Phase 35K does not approve pointer event routing changes.',
  'Phase 35K does not approve data behavior changes.',
  'Phase 35K does not approve Study Room answer feedback implementation.',
  'Phase 35K does not approve Streak Fire.',
  'Phase 35K does not approve Collapsible Header.',
  'Phase 35K does not approve Dynamic Canvas Themes implementation.'
];

const CSS_REQUIREMENTS = [
  '--elastic-button-compression-scale: 0.975',
  'transform: scale(var(--elastic-button-compression-scale))',
  'box-shadow: var(--elastic-button-compression-shadow)',
  ':active:not(:disabled):not([aria-busy=\'true\'])',
  '.button:focus-visible',
  '@media (prefers-reduced-motion: reduce)',
  'transform: none'
];

const PILOT_SELECTORS = [
  '.pageHeader__actions .button--primary',
  '.libraryWorkshopActionsCard .textImportActions .button--secondary',
  '.demoSampleQuickstartCard .textImportActions .button--secondary'
];

function fail(message) {
  throw new Error(message);
}

function rel(file) {
  return path.resolve(ROOT, file);
}

function read(file) {
  const fullPath = rel(file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
  }
}

function changedFiles() {
  const mergeBaseDiff = git(['diff', '--name-only', 'origin/main...HEAD']);
  const unstaged = git(['diff', '--name-only']);
  const staged = git(['diff', '--cached', '--name-only']);
  const untracked = git(['ls-files', '--others', '--exclude-standard']);
  return Array.from(new Set(
    `${mergeBaseDiff}\n${unstaged}\n${staged}\n${untracked}`
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(file => !/^(node_modules|dist|coverage|test-results|playwright-report)\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  for (const file of REQUIRED_FILES) {
    if (!files.includes(file)) fail(`Phase 35K PR diff must include required file: ${file}`);
  }
  return 'pr-diff';
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);

if (diffMode === 'validator-hotfix') {
  for (const file of changed) {
    if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35K allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35K: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35K: ${file}`);
  if (/^tests\//.test(file) && file !== 'tests/unit/elasticButtonCompressionPilot.test.jsx') {
    fail(`Only the Phase 35K unit test may change under tests/: ${file}`);
  }
  if (/^src\//.test(file) && file !== 'src/styles/global.css' && !SELECTED_RUNTIME_FILES.includes(file)) {
    fail(`Unapproved runtime source file changed: ${file}`);
  }
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35K: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35K: ${file}`);
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|database|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35k-elastic-button-compression-pilot-evidence.md';
const summaryFile = 'docs/release/phase35k-elastic-button-compression-pilot-summary.md';
const seedFile = 'docs/planning/phase35l-elastic-button-compression-pilot-evidence-review-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';
const cssFile = 'src/styles/global.css';
const unitFile = 'tests/unit/elasticButtonCompressionPilot.test.jsx';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(seedFile, SEED_OPTIONS);

const phaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!phaseDocs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!phaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = phaseDocs.match(/PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 35K decision value: ${value}`);
}

const css = read(cssFile);
assertIncludes(cssFile, CSS_REQUIREMENTS);
assertIncludes(cssFile, PILOT_SELECTORS);
const addedCssLines = git(['diff', '--', cssFile])
  .split(/\r?\n/)
  .filter(line => line.startsWith('+') && !line.startsWith('+++'))
  .join('\n');
if (/pointer-events\s*:\s*none/.test(addedCssLines)) fail('Phase 35K CSS must not add pointer-events: none.');

const unit = read(unitFile);
assertIncludes(unitFile, [
  'elastic button compression pilot',
  'pointer-events: none',
  'prefers-reduced-motion: reduce',
  'Validate Phase 35K Elastic Button Compression Pilot'
]);

const workflow = read(workflowFile);
assertIncludes(workflowFile, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 35J validator retained as historical reference',
  '# node scripts/validate-phase35j-next-ui-polish-scope.js',
  'Validate Phase 35K Elastic Button Compression Pilot',
  'node scripts/validate-phase35k-elastic-button-compression-pilot.js'
]);
if (/Validate Phase 35J Next UI Polish Scope/.test(workflow)) fail('Phase 35J validator must be historical comment only.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase35k-elastic-button-compression-pilot.js')) {
  fail('Workflow must run exactly the active Phase 35K validator and no full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 35K validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'SELECTED_RUNTIME_FILES'
]);

if (!phaseDocs.includes('Study Room buttons were skipped')) {
  fail('Evidence must document that Study Room buttons were skipped for this pilot.');
}

for (const runtimeFile of SELECTED_RUNTIME_FILES) {
  if (!phaseDocs.includes(runtimeFile)) fail(`Selected runtime file is not documented: ${runtimeFile}`);
}

console.log(`Phase 35K Elastic Button Compression Pilot validator passed (${diffMode}).`);
