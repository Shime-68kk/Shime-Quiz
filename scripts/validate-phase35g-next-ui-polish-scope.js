#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/research/phase35g-next-ui-polish-scope.md',
  'docs/release/phase35g-next-ui-polish-scope-summary.md',
  'docs/planning/phase35h-hybrid-navigation-indicator-implementation-seed.md',
  'scripts/validate-phase35g-next-ui-polish-scope.js'
];

const VALIDATOR_FILE = 'scripts/validate-phase35g-next-ui-polish-scope.js';
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE35G_NEXT_UI_POLISH_SCOPE_STATUS: COMPLETED_NEXT_UI_POLISH_SCOPE_GATE',
  'PHASE35G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35G_REVIEW_SCOPE: NEXT_UI_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35G_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR',
  'PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35H_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION',
  'NEEDS_NEXT_UI_POLISH_RESEARCH',
  'HOLD_NEXT_UI_POLISH_SCOPE'
];

const SCOPE_HEADINGS = [
  '# Phase 35G — Next UI Polish Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35F',
  '## Candidate comparison method',
  '## Candidate comparison table',
  '## Selected candidate',
  '## Why Hybrid Sliding Navigation Indicator first',
  '## Phase 35H allowed files / expected areas',
  '## Phase 35H forbidden areas',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and responsive requirements',
  '## Risk assessment',
  '## Rollback plan for Phase 35H',
  '## Chosen scope decision',
  '## Decision rationale',
  '## What Phase 35G supports',
  '## What Phase 35G does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35G — Next UI Polish Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Scope result',
  '## Chosen decision',
  '## Selected candidate',
  '## Decision rationale',
  '## Candidates deferred',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 35H — Hybrid Navigation Indicator Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35G',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and responsive requirements',
  '## Validation required',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const CANDIDATE_ROWS = [
  'Hybrid Sliding Navigation Indicator',
  'Elastic Button Compression',
  'Study Room Answer Feedback Polish',
  'Dashboard Calm Home Evidence Follow-up Fixes',
  'Mobile Touch Polish',
  'Accessibility Focus Polish'
];

const TABLE_COLUMNS = [
  'Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision'
];

const SEED_OPTIONS = [
  'HOLD_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION',
  'NEEDS_HYBRID_NAVIGATION_INDICATOR_REWORK',
  'PASS_TO_PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35H — Hybrid Navigation Indicator Implementation',
  'Phase 35H is a small runtime candidate and is not approval for broad navigation rewrite.',
  'Phase 35G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35G does not approve BETA_READY.',
  'Phase 35G does not approve public production readiness.',
  'Phase 35G does not approve broad validation or stress-tested readiness.',
  'Phase 35G does not approve guaranteed data-loss prevention.',
  'Phase 35G does not approve storage/backup/restore behavior changes.',
  'Phase 35G does not approve sync/cloud/account/auth/backend.',
  'Phase 35G does not approve telemetry/network calls.',
  'Phase 35G does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35G does not approve route behavior changes.',
  'Phase 35G does not approve package/dependency changes.',
  'Phase 35G does not approve Elastic Button Compression implementation.',
  'Phase 35G does not approve Study Room polish.',
  'Phase 35G does not approve Streak Fire.',
  'Phase 35G does not approve Collapsible Header.',
  'Phase 35G does not approve Dynamic Canvas Themes implementation.'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 35H should be a small runtime candidate only',
  'without changing routes',
  'It must not add packages.',
  'It must not alter sidebar/nav item semantics beyond visual active/transition polish.',
  'Preserve keyboard focus',
  'reduced-motion',
  'desktop and 375px mobile evidence'
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

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
  }
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
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
    if (!files.includes(file)) fail(`Phase 35G PR diff must include required file: ${file}`);
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
    if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35G allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^src\//.test(file)) fail(`Runtime source file must not change in Phase 35G: ${file}`);
  if (/^tests\//.test(file)) fail(`Unit test file must not change in Phase 35G: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35G: ${file}`);
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35G: ${file}`);
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35G: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35G: ${file}`);
  if (/^(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

const scopeFile = 'docs/research/phase35g-next-ui-polish-scope.md';
const summaryFile = 'docs/release/phase35g-next-ui-polish-scope-summary.md';
const seedFile = 'docs/planning/phase35h-hybrid-navigation-indicator-implementation-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';

assertIncludes(scopeFile, SCOPE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(scopeFile, TABLE_COLUMNS);
assertIncludes(scopeFile, CANDIDATE_ROWS);
assertIncludes(seedFile, SEED_OPTIONS);
assertIncludes(seedFile, SEED_SCOPE_STATEMENTS);

const allPhaseDocs = [read(scopeFile), read(summaryFile), read(seedFile)].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35G_NEXT_UI_POLISH_SCOPE_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35G decision token: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!allPhaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const workflow = read(workflowFile);
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('run: node scripts/validate-phase35g-next-ui-polish-scope.js')) {
  fail('CI must register Phase 35G validator.');
}
if (!workflow.includes('# node scripts/validate-phase35f-dashboard-calm-home-evidence-review.js')) {
  fail('Phase 35F validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/validate-phase35f-dashboard-calm-home-evidence-review\.js/.test(workflow.replace(/# node scripts\/validate-phase35f-dashboard-calm-home-evidence-review\.js/g, ''))) {
  fail('Prior Phase 35F validator must not remain active as a Phase 35G blocker.');
}
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}
if (/validate-phase\*|validate-phase\{|\bls scripts\/validate-phase|for .*validate-phase|scripts\/validate-phase\d+\*|find .*validate-phase/.test(workflow)) {
  fail('Workflow must not use a full validator glob chain.');
}

const validator = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35G validator must not update remotes internally.');
}
if (!validator.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
  fail('Phase 35G validator must verify origin/main availability.');
}
for (const mode of ['pr-diff', 'post-merge-main', 'validator-hotfix']) {
  if (!validator.includes(mode)) fail(`Phase 35G validator must support ${mode} mode.`);
}

const forbiddenApprovalPatterns = [
  /BETA_READY is approved/i,
  /approves BETA_READY/i,
  /Phase 35G approves public production readiness/i,
  /Phase 35G approves broad validation/i,
  /Phase 35G approves stress-tested readiness/i,
  /Phase 35G approves guaranteed data-loss prevention/i,
  /Phase 35G approves storage\/backup\/restore behavior changes/i,
  /Phase 35G approves sync\/cloud\/account\/auth\/backend/i,
  /Phase 35G approves telemetry\/network calls/i,
  /Phase 35G approves built-in AI\/OCR\/API-key\/BYOK behavior/i,
  /Phase 35G approves route behavior changes/i,
  /Phase 35G approves package\/dependency changes/i,
  /Phase 35G approves Elastic Button Compression implementation/i,
  /Phase 35G approves Study Room polish/i,
  /Phase 35G approves Streak Fire/i,
  /Phase 35G approves Collapsible Header/i,
  /Phase 35G approves Dynamic Canvas Themes implementation/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

console.log(`validate-phase35g-next-ui-polish-scope passed (${diffMode}).`);
