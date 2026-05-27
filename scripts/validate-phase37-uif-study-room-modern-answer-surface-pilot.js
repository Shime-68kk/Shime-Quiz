#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const STUDY_ROOM_FILE = 'src/routes/StudyRoom.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/studyRoomModernAnswerSurfacePilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uif-study-room-modern-answer-surface-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uif-study-room-modern-answer-surface-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uig-study-room-modern-answer-surface-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uif-study-room-modern-answer-surface-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  STUDY_ROOM_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_STATUS: COMPLETED_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION',
  'PHASE37UIF_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIF_RUNTIME_SCOPE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_ONLY_NO_SCORING_OR_QUEUE_BEHAVIOR_CHANGES',
  'PHASE37UIF_SELECTED_EFFECT: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT',
  'PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW',
  'NEEDS_STUDY_ROOM_MODERN_ANSWER_SURFACE_REWORK',
  'HOLD_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION',
  'PASS_TO_STUDY_ROOM_ANSWER_SURFACE_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiF — Study Room Modern Answer Surface Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Study Room discovery',
  '## Scoring/queue/scheduler boundaries',
  '## Implementation summary',
  '## Changed files',
  '## Visual difference',
  '## One-surface containment',
  '## Answer-card states',
  '## Selected/check/reveal preservation',
  '## Explanation visibility',
  '## Scoring preservation',
  '## Queue/scheduler/data preservation',
  '## Contrast',
  '## Focus-visible',
  '## Reduced-motion',
  '## Mobile 375px',
  '## Desktop',
  '## E2E impact',
  '## Phase 37C separation',
  '## Validation',
  '## Risks',
  '## Decision',
  '## Supported claims',
  '## Not-approved claims',
  '## Next phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiF — Study Room Modern Answer Surface Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing visual change',
  '## Evidence summary',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiG — Study Room Modern Answer Surface Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiF',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Phase 37-uiF confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiF does not approve BETA_READY',
  'Phase 37-uiF does not approve public production readiness',
  'Phase 37-uiF does not approve release-readiness upgrade',
  'Phase 37-uiF does not approve broad UI redesign',
  'Phase 37-uiF does not approve Study Room scoring/correctness/scheduler/queue/data changes',
  'Phase 37-uiF does not approve storage/import/parser changes',
  'Phase 37-uiF does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiF does not approve telemetry',
  'Phase 37-uiF does not approve route/event-handler changes',
  'Phase 37-uiF does not approve package changes',
  'Phase 37-uiF does not approve full Dynamic Canvas themes',
  'Phase 37-uiF does not approve theme picker',
  'Phase 37-uiF does not approve persisted preferences',
  'Phase 37-uiF does not approve localStorage writes',
  'Phase 37-uiF does not approve Streak Fire',
  'Phase 37-uiF does not approve Collapsible Header',
  'Phase 37-uiF does not approve replacement of Phase 37C',
  'Phase 37C Limited Release Readiness Gap Review remains separate',
  'Next recommended phase: Phase 37-uiG — Study Room Modern Answer Surface Evidence Review',
  'Phase 37-uiG is evidence review only and is not automatic runtime implementation'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiG is evidence review only',
  'must not approve scoring/correctness/scheduler/queue/data changes',
  'broad redesign',
  'release readiness',
  'Beta Ready',
  'Study Room answer surface',
  'answer cards',
  'selected state',
  'check or reveal feedback',
  'explanation framing',
  'desktop and 375px Study Room evidence',
  'focus-visible review',
  'reduced-motion review',
  'Phase 37C separation review'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^e2e\//,
  /^tests\/(?!unit\/studyRoomModernAnswerSurfacePilot\.test\.jsx$)/,
  /^src\/routes\/(?:Dashboard|Library)\.jsx$/,
  /^src\/layout\/(?:BottomNav|Sidebar)\.jsx$/,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function assertIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${label} missing required text: ${needle}`);
  }
}

function assertDecisionToken(text) {
  const matches = [...text.matchAll(new RegExp(`${DECISION_TOKEN}:\\s*([A-Z0-9_]+)`, 'g'))];
  if (matches.length === 0) fail(`Missing decision token: ${DECISION_TOKEN}`);
  for (const match of matches) {
    if (!ALLOWED_DECISIONS.includes(match[1])) {
      fail(`Unsupported Phase 37-uiF decision token: ${match[1]}`);
    }
  }
}

function assertOriginMainAvailable() {
  try {
    git(['rev-parse', '--verify', 'origin/main']);
  } catch {
    fail('origin/main is not available locally; checkout must provide it before running this validator');
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
      .filter(file => !/^node_modules\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 37-uiF PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiF PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertForbiddenChanges(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }
  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiF allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiE validator retained as historical reference',
    'Validate Phase 37-uiF Study Room Modern Answer Surface Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  const activePhaseValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase'));
  for (const command of activePhaseValidatorCommands) {
    if (command !== `node ${VALIDATOR_FILE}`) {
      fail(`Prior phase validator is active as a blocker: ${command}`);
    }
  }
}

function assertStudyRoomRuntime(studyRoom) {
  assertIncludes('Study Room runtime', studyRoom, [
    'phase37uif-study-room-modern-answer-surface-pilot',
    'data-phase37uif-answer-surface-state={answerFeedbackPolishState}',
    'data-phase35n-answer-feedback-state={answerFeedbackPolishState}',
    'currentItemState.checked',
    'currentItemState.revealed',
    'onCheck: checkCurrentAnswer',
    'onToggleReveal: toggleCurrentFlashcard',
    'onContinue={continueStudy}',
    'onClick={goToNext}'
  ]);
  if ((studyRoom.match(/phase37uif-study-room-modern-answer-surface-pilot/g) || []).length !== 1) {
    fail('Study Room must contain exactly one Phase 37-uiF host class');
  }
  const forbiddenRuntimePatterns = [
    /localStorage\s*\.\s*setItem/,
    /localStorage\s*\.\s*removeItem/,
    /setAttribute\(['"]data-theme/,
    /ThemePicker|persisted theme|account-synced/i,
    /correctStreak\s*=/,
    /schedulerKind\s*=/
  ];
  for (const pattern of forbiddenRuntimePatterns) {
    if (pattern.test(studyRoom)) fail(`Study Room runtime contains forbidden behavior/persistence pattern: ${pattern}`);
  }
}

function assertCss(css) {
  assertIncludes('CSS', css, [
    'Phase 37-uiF',
    '.phase37uif-study-room-modern-answer-surface-pilot',
    '--phase37uif-answer-surface',
    '--phase37uif-answer-border',
    '--phase37uif-answer-glow',
    '--phase37uif-answer-selected-surface',
    '--phase37uif-answer-correct-surface',
    '--phase37uif-answer-wrong-surface',
    '.phase37uif-study-room-modern-answer-surface-pilot .studyItemCard',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption:hover',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--selected',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--correct',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption--wrong',
    '.phase37uif-study-room-modern-answer-surface-pilot .shortAnswerField input',
    '.phase37uif-study-room-modern-answer-surface-pilot .flashcard--revealed',
    '.phase37uif-study-room-modern-answer-surface-pilot .studyInteraction > .studyFeedback[role=\'status\']',
    '.phase37uif-study-room-modern-answer-surface-pilot .choiceOption:focus-within',
    '@media (prefers-reduced-motion: reduce)'
  ]);
  const phaseBlockStart = css.indexOf('/* Phase 37-uiF');
  if (phaseBlockStart < 0) fail('Phase 37-uiF CSS block is missing');
  const phaseBlockEnd = css.indexOf('@keyframes study-answer-feedback-polish-enter', phaseBlockStart);
  if (phaseBlockEnd < 0) fail('Phase 37-uiF CSS block must appear before the existing answer feedback keyframes');
  const phaseBlock = css.slice(phaseBlockStart, phaseBlockEnd);
  if (/localStorage|data-theme|ThemePicker|Dashboard|Library|BottomNav|Sidebar/.test(phaseBlock)) {
    fail('Phase 37-uiF CSS block references forbidden persistence/theme/broad surfaces');
  }
}

function assertTest(test) {
  assertIncludes('unit test', test, [
    'Phase 37-uiF Study Room modern answer surface pilot',
    'adds one passive Study Room host marker',
    'scopes premium answer-card styling',
    'does not introduce persistence, routes, theme mutation, or prior validators as active gates'
  ]);
}

function assertDocs(evidence, summary, seed) {
  const docs = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('seed scope statements', seed, SEED_SCOPE_STATEMENTS);
  assertIncludes('scope boundary docs', docs, [
    'Study Room answer surface',
    'answer cards / selected state / check or reveal feedback / explanation framing',
    'src/routes/StudyRoom.jsx',
    'src/styles/global.css',
    'passive class',
    'no scoring correctness',
    'no localStorage',
    'Phase 37C Limited Release Readiness Gap Review remains separate',
    'pr-diff',
    'post-merge-main',
    'validator-hotfix'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiF approves?\s+BETA_READY/i,
    /Phase 37-uiF approves?\s+public production readiness/i,
    /Phase 37-uiF approves?\s+release-readiness upgrade/i,
    /Phase 37-uiF approves?\s+broad UI redesign/i,
    /Phase 37-uiF approves?\s+Study Room scoring\/correctness\/scheduler\/queue\/data changes/i,
    /Phase 37-uiF approves?\s+storage\/import\/parser changes/i,
    /Phase 37-uiF approves?\s+localStorage writes/i,
    /Phase 37-uiF approves?\s+replacement of Phase 37C/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  if (source.includes(['git', 'fetch'].join(' '))) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable'
  ]);
}

function main() {
  assertOriginMainAvailable();
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  for (const file of REQUIRED_FILES) read(file);

  const workflow = read(WORKFLOW_FILE);
  const studyRoom = read(STUDY_ROOM_FILE);
  const css = read(CSS_FILE);
  const test = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertStudyRoomRuntime(studyRoom);
  assertCss(css);
  assertTest(test);
  assertDocs(evidence, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiF Study Room Modern Answer Surface Pilot validator passed (${mode}).`);
}

main();
