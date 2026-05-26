#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase35o-study-room-answer-feedback-polish-evidence-review.js';
const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/testing/phase35o-study-room-answer-feedback-polish-evidence-review.md',
  'docs/release/phase35o-study-room-answer-feedback-polish-evidence-review-summary.md',
  'docs/planning/phase35p-core-ui-plan-completion-review-seed.md',
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW',
  'NEEDS_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_FIXES',
  'HOLD_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW'
];

const REQUIRED_TOKENS = [
  'PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW_STATUS: COMPLETED_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW',
  'PHASE35O_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35O_REVIEW_SCOPE: STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_SCOPE_STATUS: STUDY_ROOM_ANSWER_FEEDBACK_POLISH_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35O — Study Room Answer Feedback Polish Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35N',
  '## Review method',
  '## Study Room Answer Feedback Polish evidence review table',
  '## Correct answer visual review',
  '## Incorrect answer visual review',
  '## Neutral and loading state review',
  '## Correctness and scoring preservation review',
  '## Scheduler and queue preservation review',
  '## Action wiring preservation review',
  '## Forbidden effects review',
  '## E2E smoke and onboarding review',
  '## Accessibility and keyboard review',
  '## Reduced-motion review',
  '## Mobile and responsive review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 35O supports',
  '## What Phase 35O does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35O — Study Room Answer Feedback Polish Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Evidence carried forward',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 35P — Core UI Plan Completion Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35O',
  '## Core UI plan surfaces to review',
  '## Evidence required',
  '## Completion review questions',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'correct answer visual state',
  'incorrect answer visual state',
  'neutral/pre-answer state',
  'loading/disabled state if present',
  'queue counter stability',
  'answer action wiring',
  'no correctness changes',
  'no scoring changes',
  'no scheduler/FSRS changes',
  'no queue progression changes',
  'no data persistence changes',
  'no card selection changes',
  'no routing changes',
  'no answer submission handler changes',
  'no confetti/sound/particles/3D flip/casino-like feedback/streak pressure',
  'focus-visible behavior',
  'reduced-motion fallback',
  'mobile 375px no-overflow',
  'E2E smoke',
  'E2E onboarding',
  'validator post-merge safety',
  'Phase 35P core UI plan completion review seed'
];

const TABLE_COLUMNS = [
  'Review surface | Phase 35N evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim'
];

const SEED_OPTIONS = [
  'HOLD_CORE_UI_PLAN_COMPLETION_REVIEW',
  'NEEDS_CORE_UI_PLAN_FOLLOW_UP_FIXES',
  'PASS_TO_PHASE36_UI_POLISH_BACKLOG_REVIEW'
];

const SEED_REQUIRED_STATEMENTS = [
  'Phase 35P is a completion review for the core UI plan. It is not runtime implementation and is not automatic next runtime implementation.',
  'Library Bookshelf Tabs',
  'Dashboard Calm Home',
  'Hybrid Navigation Indicator',
  'Elastic Button Compression Pilot',
  'Study Room Answer Feedback Polish',
  'Phase 35P must not approve Beta Ready or public production readiness.',
  'Phase 35P must not start Dynamic Canvas Themes, Streak Fire, Collapsible Header, broad redesign, storage/sync/backend/auth, telemetry, or AI/OCR/API-key/BYOK behavior.'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35P — Core UI Plan Completion Review',
  'Phase 35P is a completion review and is not automatic next runtime implementation.',
  'Phase 35O confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35O does not approve BETA_READY.',
  'Phase 35O does not approve public production readiness.',
  'Phase 35O does not approve broad validation or stress-tested readiness.',
  'Phase 35O does not approve guaranteed data-loss prevention.',
  'Phase 35O does not approve storage/backup/restore behavior changes.',
  'Phase 35O does not approve sync/cloud/account/auth/backend.',
  'Phase 35O does not approve telemetry/network calls.',
  'Phase 35O does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35O does not approve route behavior changes.',
  'Phase 35O does not approve package/dependency changes.',
  'Phase 35O does not approve Study Room answer correctness changes.',
  'Phase 35O does not approve Study Room scoring changes.',
  'Phase 35O does not approve scheduler/FSRS behavior changes.',
  'Phase 35O does not approve queue progression changes.',
  'Phase 35O does not approve data persistence changes.',
  'Phase 35O does not approve card selection changes.',
  'Phase 35O does not approve answer submission handler changes.',
  'Phase 35O does not approve confetti, sound, particles, 3D card flip, casino-like feedback, or streak pressure.',
  'Phase 35O does not approve Streak Fire.',
  'Phase 35O does not approve Collapsible Header.',
  'Phase 35O does not approve Dynamic Canvas Themes implementation.',
  'Phase 35O does not approve new runtime UI implementation.'
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
    if (!files.includes(file)) fail(`Phase 35O PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35O allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 35O: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35o-study-room-answer-feedback-polish-evidence-review.md';
const summaryFile = 'docs/release/phase35o-study-room-answer-feedback-polish-evidence-review-summary.md';
const seedFile = 'docs/planning/phase35p-core-ui-plan-completion-review-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(evidenceFile, TABLE_COLUMNS);
assertIncludes(evidenceFile, EVIDENCE_ROWS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(seedFile, SEED_OPTIONS);
assertIncludes(seedFile, SEED_REQUIRED_STATEMENTS);

const phaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!phaseDocs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!phaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = phaseDocs.match(/PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 35O decision value: ${value}`);
}

assertIncludes(evidenceFile, [
  'visual-only wrapper around `StudyItemRenderer`',
  '`data-phase35n-answer-feedback-state="correct"`',
  '`data-phase35n-answer-feedback-state="incorrect"`',
  '`data-phase35n-answer-feedback-state="neutral"`',
  '`1 / 7`',
  'prefers-reduced-motion: reduce',
  '375px',
  '`npm run test:e2e:smoke`',
  '`npm run test:e2e:onboarding`'
]);

const workflow = read(workflowFile);
assertIncludes(workflowFile, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 35N validator retained as historical reference',
  '# node scripts/validate-phase35n-study-room-answer-feedback-polish.js',
  'Validate Phase 35O Study Room Answer Feedback Polish Evidence Review',
  'node scripts/validate-phase35o-study-room-answer-feedback-polish-evidence-review.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase35o-study-room-answer-feedback-polish-evidence-review.js')) {
  fail('Workflow must run exactly the active Phase 35O validator and no full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 35O validator must not execute internal git fetch.');
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

console.log(`Phase 35O Study Room Answer Feedback Polish Evidence Review validator passed (${diffMode}).`);
