#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase36-ui-polish-backlog-review.js';
const REVIEW_FILE = 'docs/review/phase36-ui-polish-backlog-review.md';
const SUMMARY_FILE = 'docs/release/phase36-ui-polish-backlog-review-summary.md';
const SEED_FILE = 'docs/planning/phase36a-mobile-touch-polish-scope-seed.md';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_GATE',
  'NEEDS_UI_POLISH_BACKLOG_RESEARCH',
  'HOLD_UI_POLISH_BACKLOG_REVIEW'
];

const REQUIRED_TOKENS = [
  'PHASE36_UI_POLISH_BACKLOG_REVIEW_STATUS: COMPLETED_UI_POLISH_BACKLOG_REVIEW',
  'PHASE36_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION: PASS_TO_PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_GATE',
  'PHASE36_REVIEW_SCOPE: UI_POLISH_BACKLOG_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36_SELECTED_BACKLOG_CANDIDATE: MOBILE_TOUCH_POLISH_SCOPE_GATE',
  'PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED'
];

const REVIEW_HEADINGS = [
  '# Phase 36 — UI Polish Backlog Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35P',
  '## Review method',
  '## Backlog candidate comparison table',
  '## Selected backlog candidate',
  '## Why Mobile Touch Polish Scope Gate first',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 36A allowed files / expected areas',
  '## Phase 36A forbidden areas',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and touch evidence requirements',
  '## Risk assessment',
  '## Rollback plan for future runtime work',
  '## Chosen backlog decision',
  '## Decision rationale',
  '## What Phase 36 supports',
  '## What Phase 36 does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36 — UI Polish Backlog Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected backlog candidate',
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
  '# Phase 36A — Mobile Touch Polish Scope Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36',
  '## Candidate surfaces',
  '## Scope-gate questions',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision'
];

const CANDIDATE_ROWS = [
  'Mobile Touch Polish Scope Gate',
  'Accessibility Focus Polish Scope Gate',
  'Dynamic Canvas Themes Design Gate',
  'Streak Fire Ignition Design Gate',
  'Collapsible Header Scope Gate',
  'Library Bookshelf Follow-up Fixes',
  'Dashboard Calm Home Follow-up Fixes',
  'Hybrid Navigation Indicator Follow-up Fixes',
  'Elastic Button Compression Follow-up Fixes',
  'Study Room Answer Feedback Follow-up Fixes'
];

const SEED_OPTIONS = [
  'HOLD_MOBILE_TOUCH_POLISH_SCOPE',
  'NEEDS_MOBILE_TOUCH_POLISH_RESEARCH',
  'PASS_TO_ONE_SMALL_MOBILE_TOUCH_POLISH_IMPLEMENTATION'
];

const SEED_SURFACES = [
  'Dashboard Calm Home mobile density and touch targets',
  'Library Bookshelf mobile tabs/workshop touch targets',
  'Bottom navigation touch comfort and safe-area behavior',
  'Study Room mobile answer feedback readability',
  'Button compression on mobile touch surfaces',
  '375px no-overflow review',
  'reduced-motion and focus/touch affordance review'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36A — Mobile Touch Polish Scope Gate',
  'Phase 36A is a scope gate and is not automatic runtime implementation.',
  'Phase 36 confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36 does not approve BETA_READY.',
  'Phase 36 does not approve public production readiness.',
  'Phase 36 does not approve broad validation or stress-tested readiness.',
  'Phase 36 does not approve guaranteed data-loss prevention.',
  'Phase 36 does not approve storage/backup/restore behavior changes.',
  'Phase 36 does not approve sync/cloud/account/auth/backend.',
  'Phase 36 does not approve telemetry/network calls.',
  'Phase 36 does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36 does not approve route behavior changes.',
  'Phase 36 does not approve package/dependency changes.',
  'Phase 36 does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36 does not approve Dynamic Canvas Themes implementation.',
  'Phase 36 does not approve Streak Fire.',
  'Phase 36 does not approve Collapsible Header.',
  'Phase 36 does not approve broad UI redesign.',
  'Phase 36 does not approve new runtime UI implementation.',
  'Phase 36 does not approve mobile runtime changes.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^storage\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36a-mobile-touch-polish-scope-seed\.md$)/,
  /^docs\/review\/phase(?!36-ui-polish-backlog-review\.md$)/,
  /^docs\/release\/phase(?!36-ui-polish-backlog-review-summary\.md$)/,
  /^scripts\/validate-phase(?!36-ui-polish-backlog-review\.js$)/,
  /(^|\/)(backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
    if (!files.includes(file)) fail(`Phase 36 PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36 allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(REVIEW_FILE, TABLE_COLUMNS);
assertIncludes(REVIEW_FILE, CANDIDATE_ROWS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_OPTIONS);
assertIncludes(SEED_FILE, SEED_SURFACES);

const phaseDocs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!phaseDocs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!phaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = phaseDocs.match(/PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36_UI_POLISH_BACKLOG_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36 decision value: ${value}`);
}

assertIncludes(REVIEW_FILE, [
  'Mobile Touch Polish Scope Gate',
  '375px',
  'reduced-motion',
  'focus/touch affordance',
  'Phase 36 does not approve mobile runtime changes.'
]);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 35P validator retained as historical reference',
  '# node scripts/validate-phase35p-core-ui-plan-completion-review.js',
  'Validate Phase 36 UI Polish Backlog Review',
  'node scripts/validate-phase36-ui-polish-backlog-review.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase36-ui-polish-backlog-review.js')) {
  fail('Workflow must run exactly the active Phase 36 validator and no full historical validator chain.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36 validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

if (/BETA_READY\s+(is\s+)?(approved|ready|granted)|approves\s+BETA_READY/i.test(phaseDocs)) {
  fail('Docs must not approve BETA_READY.');
}
if (/public production readiness approved|production ready|stress-tested readiness approved/i.test(phaseDocs)) {
  fail('Docs must not approve production or stress-tested readiness.');
}
if (/(changed|updated|modified)\s+(answer\s+)?correctness|(changed|updated|modified)\s+scoring|(changed|updated|modified)\s+scheduler|(changed|updated|modified)\s+queue progression|(changed|updated|modified)\s+data persistence/i.test(phaseDocs)) {
  fail('Docs must not claim correctness/scoring/scheduler/queue/data behavior changes.');
}
if (/runtime (implementation|change|changes) (is|are) (approved|complete|implemented)|implemented mobile runtime/i.test(phaseDocs)) {
  fail('Docs must not claim runtime implementation.');
}

console.log(`Phase 36 UI Polish Backlog Review validator passed (${diffMode}).`);
