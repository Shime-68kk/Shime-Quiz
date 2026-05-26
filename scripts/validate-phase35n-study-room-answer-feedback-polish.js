#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase35n-study-room-answer-feedback-polish.js';
const SELECTED_RUNTIME_FILES = ['src/routes/StudyRoom.jsx'];
const REQUIRED_FILES = [
  'src/styles/global.css',
  'tests/unit/studyRoomAnswerFeedbackPolish.test.jsx',
  'docs/testing/phase35n-study-room-answer-feedback-polish-evidence.md',
  'docs/release/phase35n-study-room-answer-feedback-polish-summary.md',
  'docs/planning/phase35o-study-room-answer-feedback-polish-evidence-review-seed.md',
  VALIDATOR_FILE,
  '.github/workflows/e2e-smoke.yml',
  ...SELECTED_RUNTIME_FILES
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW',
  'NEEDS_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_FIXES',
  'HOLD_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION'
];

const REQUIRED_TOKENS = [
  'PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_STATUS: COMPLETED_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_IMPLEMENTATION',
  'PHASE35N_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35N_RUNTIME_SCOPE: STUDY_ROOM_VISUAL_FEEDBACK_ONLY_NO_CORRECTNESS_OR_SCHEDULER_CHANGES',
  'PHASE35N_SELECTED_EFFECT: STUDY_ROOM_ANSWER_FEEDBACK_POLISH',
  'PHASE35O_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35N — Study Room Answer Feedback Polish Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35M',
  '## Study Room ownership discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted feedback surfaces',
  '## Correctness and behavior preservation',
  '## Correct answer visual evidence',
  '## Incorrect answer visual evidence',
  '## Neutral and loading state evidence',
  '## Desktop browser evidence',
  '## Mobile 375px evidence',
  '## Keyboard and focus evidence',
  '## Reduced-motion evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 35N supports',
  '## What Phase 35N does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35N — Study Room Answer Feedback Polish Summary',
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
  '# Phase 35O — Study Room Answer Feedback Polish Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35N',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_OPTIONS = [
  'HOLD_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_EVIDENCE_REVIEW',
  'NEEDS_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_FIXES',
  'PASS_TO_PHASE35P_CORE_UI_PLAN_COMPLETION_REVIEW'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35O — Study Room Answer Feedback Polish Evidence Review',
  'Phase 35O is an evidence review and is not automatic next runtime implementation.',
  'Phase 35N confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35N does not approve BETA_READY.',
  'Phase 35N does not approve public production readiness.',
  'Phase 35N does not approve broad validation or stress-tested readiness.',
  'Phase 35N does not approve guaranteed data-loss prevention.',
  'Phase 35N does not approve storage/backup/restore behavior changes.',
  'Phase 35N does not approve sync/cloud/account/auth/backend.',
  'Phase 35N does not approve telemetry/network calls.',
  'Phase 35N does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35N does not approve route behavior changes.',
  'Phase 35N does not approve package/dependency changes.',
  'Phase 35N does not approve Study Room answer correctness changes.',
  'Phase 35N does not approve Study Room scoring changes.',
  'Phase 35N does not approve scheduler/FSRS behavior changes.',
  'Phase 35N does not approve queue progression changes.',
  'Phase 35N does not approve data persistence changes.',
  'Phase 35N does not approve card selection changes.',
  'Phase 35N does not approve answer submission handler changes.',
  'Phase 35N does not approve confetti, sound, particles, 3D card flip, casino-like feedback, or streak pressure.',
  'Phase 35N does not approve Streak Fire.',
  'Phase 35N does not approve Collapsible Header.',
  'Phase 35N does not approve Dynamic Canvas Themes implementation.'
];

const CSS_REQUIREMENTS = [
  '.studyAnswerFeedbackPolish',
  '.studyAnswerFeedbackPolish--correct',
  '.studyAnswerFeedbackPolish--incorrect',
  '.studyAnswerFeedbackPolish--checked',
  '.studyAnswerFeedbackPolish--revealed',
  'study-answer-feedback-polish-enter',
  '@media (prefers-reduced-motion: reduce)',
  'animation: none',
  '.choiceOption:focus-within',
  '.shortAnswerField input:focus-visible'
];

const RUNTIME_REQUIREMENTS = [
  'answerFeedbackPolishState',
  'currentItemState.checked',
  'objectiveCorrect === true',
  'objectiveCorrect === false',
  'currentItemState.revealed',
  'data-phase35n-answer-feedback-state',
  'studyAnswerFeedbackPolish'
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
    if (!files.includes(file)) fail(`Phase 35N PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35N allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35N: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35N: ${file}`);
  if (/^tests\//.test(file) && file !== 'tests/unit/studyRoomAnswerFeedbackPolish.test.jsx') {
    fail(`Only the Phase 35N unit test may change under tests/: ${file}`);
  }
  if (/^src\//.test(file) && file !== 'src/styles/global.css' && !SELECTED_RUNTIME_FILES.includes(file)) {
    fail(`Unapproved runtime source file changed: ${file}`);
  }
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35N: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35N: ${file}`);
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|database|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35n-study-room-answer-feedback-polish-evidence.md';
const summaryFile = 'docs/release/phase35n-study-room-answer-feedback-polish-summary.md';
const seedFile = 'docs/planning/phase35o-study-room-answer-feedback-polish-evidence-review-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';
const cssFile = 'src/styles/global.css';
const unitFile = 'tests/unit/studyRoomAnswerFeedbackPolish.test.jsx';
const runtimeFile = 'src/routes/StudyRoom.jsx';

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
for (const runtimePath of SELECTED_RUNTIME_FILES) {
  if (!phaseDocs.includes(runtimePath)) fail(`Selected runtime file is not documented: ${runtimePath}`);
}

const decisionMatches = phaseDocs.match(/PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35N_STUDY_ROOM_ANSWER_FEEDBACK_POLISH_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 35N decision value: ${value}`);
}

assertIncludes(cssFile, CSS_REQUIREMENTS);
assertIncludes(runtimeFile, RUNTIME_REQUIREMENTS);

const runtime = read(runtimeFile);
if (/setCurrentIndex\s*\([^)]*checkCurrentAnswer/.test(runtime)) {
  fail('Phase 35N must not change queue progression from answer checking.');
}
if (!runtime.includes('setCheckedByItemId(current => ({ ...current, [currentItemId]: true }))')) {
  fail('Study Room answer checked handler invariant was not found.');
}

const unit = read(unitFile);
assertIncludes(unitFile, [
  'Phase 35N Study Room Answer Feedback Polish',
  'data-phase35n-answer-feedback-state',
  'prefers-reduced-motion: reduce',
  'Validate Phase 35N Study Room Answer Feedback Polish'
]);

const workflow = read(workflowFile);
assertIncludes(workflowFile, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 35M validator retained as historical reference',
  '# node scripts/validate-phase35m-next-ui-polish-scope.js',
  'Validate Phase 35N Study Room Answer Feedback Polish',
  'node scripts/validate-phase35n-study-room-answer-feedback-polish.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase35n-study-room-answer-feedback-polish.js')) {
  fail('Workflow must run exactly the active Phase 35N validator and no full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 35N validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'SELECTED_RUNTIME_FILES'
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

console.log(`Phase 35N Study Room Answer Feedback Polish validator passed (${diffMode}).`);
