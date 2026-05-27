#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const RUNTIME_FILE = 'src/components/study/StudyResultSummary.jsx';
const TEST_FILE = 'tests/unit/streakFireIgnitionMicroMomentPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uil-streak-fire-ignition-micro-moment-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uil-streak-fire-ignition-micro-moment-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uim-streak-fire-ignition-micro-moment-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uil-streak-fire-ignition-micro-moment-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  CSS_FILE,
  RUNTIME_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIL_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_STATUS: COMPLETED_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_IMPLEMENTATION',
  'PHASE37UIL_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIL_RUNTIME_SCOPE: STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_ONLY_NO_STREAK_OR_COMPLETION_LOGIC_CHANGES',
  'PHASE37UIL_SELECTED_EFFECT: STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT',
  'PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIL_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW',
  'NEEDS_STREAK_FIRE_IGNITION_MICRO_MOMENT_REWORK',
  'HOLD_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_IMPLEMENTATION',
  'PASS_TO_STREAK_FIRE_IGNITION_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiK and UI plan',
  '## Completion/success surface discovery',
  '## Streak, daily goal, completion, and persistence boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted surface',
  '## Visual difference summary',
  '## One-surface containment review',
  '## Completion-state attachment review',
  '## Streak calculation preservation',
  '## Daily goal and completion logic preservation',
  '## Scoring, queue, scheduler, and data preservation',
  '## Storage, localStorage, and telemetry preservation',
  '## Pressure-loop and gamification guardrail review',
  '## Accessibility and contrast evidence',
  '## Focus-visible evidence',
  '## Reduced-motion evidence',
  '## Mobile 375px evidence',
  '## Desktop evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Phase 37C separation review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 37-uiL supports',
  '## What Phase 37-uiL does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing visual change',
  '## Evidence summary',
  '## Limitations carried forward',
  '## Pressure and motivation guardrails',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiM — Streak Fire Ignition Micro-Moment Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiL',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Phase 37-uiM is evidence review only',
  'Phase 37-uiM is not automatic runtime implementation',
  'LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'does not approve BETA_READY',
  'does not approve public production readiness',
  'does not approve release-readiness upgrade',
  'does not approve broad UI redesign',
  'does not approve streak calculation changes',
  'does not approve daily goal logic changes',
  'does not approve completion logic changes',
  'does not approve scoring/correctness/scheduler/queue/data changes',
  'does not approve storage/backup/restore behavior changes',
  'does not approve import/parser behavior changes',
  'does not approve route behavior changes',
  'does not approve event handler changes',
  'does not approve button handler changes',
  'does not approve form submission changes',
  'does not approve package/dependency changes',
  'does not approve sync/cloud/account/auth/backend',
  'does not approve telemetry/network calls',
  'does not approve localStorage writes',
  'does not approve streak counter',
  'does not approve daily goal engine',
  'does not approve penalty messaging',
  'does not approve social pressure',
  'does not approve sound',
  'does not approve confetti',
  'does not approve casino-like reward loop',
  'does not approve persistent chain status',
  'does not approve full Dynamic Canvas Themes',
  'does not approve full theme picker',
  'does not approve persisted theme preferences',
  'does not approve Collapsible Header implementation',
  'does not replace Phase 37C Limited Release Readiness Gap Review'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiM is evidence review only',
  'Phase 37-uiM is not automatic runtime implementation',
  'exact success/completion attachment',
  'no streak calculation changes',
  'no daily goal logic changes',
  'no completion logic changes',
  'no scoring/scheduler/queue/data changes',
  'no storage/localStorage/telemetry writes',
  'pressure guardrails',
  'reduced-motion',
  'mobile 375px',
  'desktop',
  'E2E smoke/onboarding',
  'Phase 37C separation',
  'must not approve streak engine',
  'daily goal engine',
  'pressure loop',
  'release readiness',
  'Beta Ready',
  'HOLD_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW',
  'NEEDS_STREAK_FIRE_IGNITION_MICRO_MOMENT_FIXES',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE',
  'PASS_TO_UI_MODERNIZATION_COHERENCE_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^e2e\//,
  /^tests\/(?!unit\/streakFireIgnitionMicroMomentPilot\.test\.jsx$)/,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/routes\/routeConfig\.js$/,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiL decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiL PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiL PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiL allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiK validator retained as historical reference; not run as Phase 37-uiL merge-blocking gate.',
    '# node scripts/validate-phase37-uik-elastic-tap-evidence-streak-fire-scope.js',
    'Validate Phase 37-uiL Streak Fire Ignition Micro-Moment Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  if (/^\s*run:\s*\|\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) fail('Workflow must not include a shell remote update step');
  const activePhaseValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase'));
  for (const command of activePhaseValidatorCommands) {
    if (command !== `node ${VALIDATOR_FILE}`) fail(`Prior phase validator is active as a blocker: ${command}`);
  }
}

function assertDocs(evidence, summary, seed) {
  const docs = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('Phase 37-uiM seed', seed, SEED_REQUIRED_TEXT);
  assertIncludes('validator safety docs', docs, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'exact changed-file allowlist',
    'no generated artifacts'
  ]);
  assertIncludes('selected runtime file documentation', docs, [
    RUNTIME_FILE,
    'data-phase37uil-streak-fire-ignition="session-complete-summary"',
    'src/routes/StudyRoom.jsx'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiL approves?\s+BETA_READY/i,
    /Phase 37-uiL approves?\s+public production readiness/i,
    /Phase 37-uiL approves?\s+release-readiness upgrade/i,
    /Phase 37-uiL approves?\s+broad UI redesign/i,
    /Phase 37-uiL approves?\s+streak calculation changes/i,
    /Phase 37-uiL approves?\s+daily goal logic changes/i,
    /Phase 37-uiL approves?\s+completion logic changes/i,
    /Phase 37-uiL approves?\s+scoring\/correctness\/scheduler\/queue\/data changes/i,
    /Phase 37-uiL approves?\s+storage\/backup\/restore behavior changes/i,
    /Phase 37-uiL approves?\s+import\/parser behavior changes/i,
    /Phase 37-uiL approves?\s+localStorage writes/i,
    /Phase 37-uiL approves?\s+pressure loop/i,
    /Phase 37-uiL approves?\s+replacement of Phase 37C/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertRuntime(runtime, studyRoom) {
  assertIncludes('runtime marker', runtime, [
    'phase37uil-streak-fire-ignition-micro-moment-pilot',
    'data-phase37uil-streak-fire-ignition="session-complete-summary"',
    'studyResultHero'
  ]);
  if ((runtime.match(/phase37uil-streak-fire-ignition-micro-moment-pilot/g) || []).length !== 1) {
    fail('Runtime marker must appear exactly once in the selected completion surface');
  }
  if (studyRoom.includes('phase37uil-streak-fire-ignition-micro-moment-pilot')) {
    fail('StudyRoom state/logic file must not carry the Phase 37-uiL runtime marker');
  }
  assertIncludes('StudyRoom completion boundary', studyRoom, [
    'function finishSession({ allowIncomplete = false } = {})',
    'const summary = createStudyAttemptSummary(items, getCurrentAttemptState());',
    'const historyResult = saveStudyHistoryRecord(historyRecord);',
    'setCompletedAttempt({'
  ]);
}

function assertCss(css) {
  assertIncludes('CSS pilot', css, [
    'Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot',
    '.phase37uil-streak-fire-ignition-micro-moment-pilot',
    '.phase37uil-streak-fire-ignition-micro-moment-pilot::before',
    '.phase37uil-streak-fire-ignition-micro-moment-pilot::after',
    'phase37uil-streak-fire-success-aura',
    'phase37uil-streak-fire-ignition-ring',
    'pointer-events: none',
    '@media (prefers-reduced-motion: reduce)',
    'animation: none'
  ]);
  if (/confetti|new Audio|AudioContext|streak counter|daily goal engine|persistent chain status/i.test(css)) {
    fail('CSS contains forbidden pressure-loop or media feature text');
  }
}

function assertNoForbiddenWrites(label, text) {
  const forbidden = [
    /localStorage\s*\.\s*setItem/,
    /sessionStorage\s*\.\s*setItem/,
    /setAttribute\(['"]data-theme/,
    /fetch\s*\(/,
    /navigator\.sendBeacon/,
    /new\s+Audio/,
    /AudioContext/,
    /confetti/i
  ];
  for (const pattern of forbidden) {
    if (pattern.test(text)) fail(`${label} contains forbidden runtime write/network/media pattern: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  if (/\bgit\s+(fetch|pull)\b/.test(source)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable',
    'classifyDiffMode',
    'assertForbiddenChanges',
    'FORBIDDEN_CHANGE_PATTERNS'
  ]);
}

function main() {
  assertOriginMainAvailable();
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  for (const file of REQUIRED_FILES) read(file);

  const workflow = read(WORKFLOW_FILE);
  const css = read(CSS_FILE);
  const runtime = read(RUNTIME_FILE);
  const studyRoom = read('src/routes/StudyRoom.jsx');
  const test = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertDocs(evidence, summary, seed);
  assertRuntime(runtime, studyRoom);
  assertCss(css);
  assertNoForbiddenWrites('runtime/CSS', `${runtime}\n${css}`);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiL Streak Fire Ignition Micro-Moment Pilot validator passed (${mode}).`);
}

main();
