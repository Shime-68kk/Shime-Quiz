#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase35p-core-ui-plan-completion-review.js';
const REVIEW_FILE = 'docs/review/phase35p-core-ui-plan-completion-review.md';
const SUMMARY_FILE = 'docs/release/phase35p-core-ui-plan-completion-review-summary.md';
const SEED_FILE = 'docs/planning/phase36-ui-polish-backlog-review-seed.md';
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
  'PASS_TO_PHASE36_UI_POLISH_BACKLOG_REVIEW',
  'NEEDS_CORE_UI_PLAN_FOLLOW_UP_FIXES',
  'HOLD_CORE_UI_PLAN_COMPLETION_REVIEW'
];

const REQUIRED_TOKENS = [
  'PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW_STATUS: COMPLETED_CORE_UI_PLAN_COMPLETION_REVIEW',
  'PHASE35P_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35P_REVIEW_SCOPE: CORE_UI_PLAN_COMPLETION_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35P_CORE_UI_PLAN_SCOPE_STATUS: CORE_UI_PLAN_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE36_UI_POLISH_BACKLOG_REVIEW_SEED_STATUS: PREPARED_BACKLOG_REVIEW_SEED'
];

const REVIEW_HEADINGS = [
  '# Phase 35P — Core UI Plan Completion Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35O',
  '## Review method',
  '## Core UI plan completion table',
  '## Library Bookshelf Tabs review',
  '## Dashboard Calm Home review',
  '## Hybrid Navigation Indicator review',
  '## Elastic Button Compression Pilot review',
  '## Study Room Answer Feedback Polish review',
  '## Cross-cutting accessibility and reduced-motion review',
  '## Desktop and mobile evidence review',
  '## Validator post-merge safety review',
  '## Deferred optional UI backlog',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen completion decision',
  '## Decision rationale',
  '## What Phase 35P supports',
  '## What Phase 35P does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35P — Core UI Plan Completion Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Core UI plan surfaces completed',
  '## Evidence carried forward',
  '## Limitations carried forward',
  '## Deferred backlog',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 36 — UI Polish Backlog Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35P',
  '## Backlog categories',
  '## Candidate backlog',
  '## Selection rules',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Core surface | Implementation phase | Evidence review phase | Completion finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim'
];

const COMPLETION_ROWS = [
  'Library Bookshelf Tabs',
  'Dashboard Calm Home',
  'Hybrid Navigation Indicator',
  'Elastic Button Compression Pilot',
  'Study Room Answer Feedback Polish',
  'accessibility/focus',
  'reduced-motion',
  'desktop evidence',
  '375px mobile evidence',
  'validator post-merge safety',
  'no package/dependency changes',
  'no storage/sync/backend/auth/telemetry changes',
  'no Beta Ready approval',
  'deferred Dynamic Canvas Themes',
  'deferred Streak Fire',
  'deferred Collapsible Header',
  'Phase 36 UI Polish Backlog Review seed'
];

const SEED_OPTIONS = [
  'HOLD_UI_POLISH_BACKLOG_REVIEW',
  'NEEDS_UI_POLISH_RESEARCH',
  'PASS_TO_ONE_SMALL_PHASE36_UI_POLISH_SCOPE_GATE'
];

const SEED_BACKLOG = [
  'Mobile Touch Polish',
  'Accessibility Focus Polish',
  'Dynamic Canvas Themes',
  'Streak Fire Ignition',
  'Collapsible Header',
  'Dashboard Calm Home Follow-up Fixes if needed',
  'Hybrid Navigation Indicator Follow-up Fixes if needed',
  'Elastic Button Compression Follow-up Fixes if needed',
  'Study Room Answer Feedback Follow-up Fixes if needed'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36 — UI Polish Backlog Review',
  'Phase 36 is a backlog review/scope gate and is not automatic runtime implementation.',
  'Phase 35P confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35P does not approve BETA_READY.',
  'Phase 35P does not approve public production readiness.',
  'Phase 35P does not approve broad validation or stress-tested readiness.',
  'Phase 35P does not approve guaranteed data-loss prevention.',
  'Phase 35P does not approve storage/backup/restore behavior changes.',
  'Phase 35P does not approve sync/cloud/account/auth/backend.',
  'Phase 35P does not approve telemetry/network calls.',
  'Phase 35P does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35P does not approve route behavior changes.',
  'Phase 35P does not approve package/dependency changes.',
  'Phase 35P does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 35P does not approve Dynamic Canvas Themes implementation.',
  'Phase 35P does not approve Streak Fire.',
  'Phase 35P does not approve Collapsible Header.',
  'Phase 35P does not approve new runtime UI implementation.'
];

const SEED_REQUIRED_STATEMENTS = [
  'Phase 36 is a backlog review/scope gate and is not automatic runtime implementation.',
  'Dynamic Canvas Themes, Streak Fire, and Collapsible Header require separate gates and are not approved by default.',
  'Any Phase 36 runtime candidate must preserve local-first, no-cloud, no-telemetry, no package changes by default, reduced-motion support, and mobile evidence.'
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
  /^docs\/(testing|research|design)\//,
  /^docs\/planning\/phase35[a-o]/,
  /^docs\/release\/phase35[a-o]/,
  /^scripts\/validate-phase35[a-o]/,
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
    if (!files.includes(file)) fail(`Phase 35P PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35P allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 35P: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(REVIEW_FILE, TABLE_COLUMNS);
assertIncludes(REVIEW_FILE, COMPLETION_ROWS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_OPTIONS);
assertIncludes(SEED_FILE, SEED_BACKLOG);
assertIncludes(SEED_FILE, SEED_REQUIRED_STATEMENTS);

const phaseDocs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!phaseDocs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!phaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = phaseDocs.match(/PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 35P decision value: ${value}`);
}

assertIncludes(REVIEW_FILE, [
  'Phase 35B',
  'Phase 35C',
  'Phase 35E',
  'Phase 35F',
  'Phase 35H',
  'Phase 35I',
  'Phase 35K',
  'Phase 35L',
  'Phase 35N',
  'Phase 35O',
  '`pr-diff`',
  '`post-merge-main`',
  '`validator-hotfix`',
  '375px'
]);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 35O validator retained as historical reference',
  '# node scripts/validate-phase35o-study-room-answer-feedback-polish-evidence-review.js',
  'Validate Phase 35P Core UI Plan Completion Review',
  'node scripts/validate-phase35p-core-ui-plan-completion-review.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase35p-core-ui-plan-completion-review.js')) {
  fail('Workflow must run exactly the active Phase 35P validator and no full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 35P validator must not execute internal git fetch.');
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

console.log(`Phase 35P Core UI Plan Completion Review validator passed (${diffMode}).`);
