#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uim-streak-fire-evidence-collapsible-avatar-header-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uim-streak-fire-evidence-collapsible-avatar-header-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uin-collapsible-avatar-header-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uim-streak-fire-evidence-collapsible-avatar-header-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_STATUS: COMPLETED_STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE',
  'PHASE37UIM_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIM_REVIEW_SCOPE: STREAK_FIRE_EVIDENCE_REVIEW_AND_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIM_SELECTED_CANDIDATE: COLLAPSIBLE_AVATAR_HEADER_PILOT',
  'PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION',
  'HOLD_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW',
  'NEEDS_STREAK_FIRE_IGNITION_MICRO_MOMENT_FIXES',
  'PASS_TO_UI_MODERNIZATION_COHERENCE_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_RESEARCH_ONLY'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiM — Streak Fire Evidence Review and Collapsible Avatar Header Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiL and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiL evidence review table',
  '## Streak Fire visual quality review',
  '## Completion-state attachment review',
  '## Streak, daily goal, completion, scoring, queue, and scheduler preservation review',
  '## Storage, localStorage, telemetry, and network preservation review',
  '## Handler, form, disabled, and route preservation review',
  '## Pressure-loop and motivation guardrail review',
  '## Accessibility, contrast, focus-visible, and reduced-motion review',
  '## Mobile 375px and desktop review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Collapsible Avatar Header risk review',
  '## Header identity scope guardrail review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Collapsible Avatar Header Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiN allowed files / expected areas',
  '## Phase 37-uiN forbidden areas',
  '## Evidence requirements for Phase 37-uiN',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiM supports',
  '## What Phase 37-uiM does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiM — Streak Fire Evidence and Collapsible Avatar Header Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## Collapsible Avatar Header scope',
  '## App-shell/header identity guardrails',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiN — Collapsible Avatar Header Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiM',
  '## Runtime candidate',
  '## User-facing intent',
  '## Visual-only app-shell/header identity boundary',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## App-shell, navigation, and route restrictions',
  '## Auth, account, profile, storage, and telemetry restrictions',
  '## Responsive and motion requirements',
  '## Accessibility and focus requirements',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'exact success/completion attachment',
  'one-surface containment',
  'passive marker',
  'CSS-only visual treatment',
  'no new completion state',
  'no streak calculation changes',
  'no daily goal logic changes',
  'no completion logic changes',
  'no scoring changes',
  'no queue or scheduler changes',
  'no data logic changes',
  'no storage or localStorage writes',
  'no telemetry or network calls',
  'no route/navigation changes',
  'no handlers or form submission changes',
  'no disabled behavior changes',
  'pressure-loop exclusions',
  'reduced-motion fallback',
  'focus-visible preservation',
  'mobile 375px behavior',
  'desktop behavior',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Collapsible Avatar Header Pilot',
  'Streak Fire Expansion Backlog',
  'Elastic Tap Expansion Backlog',
  'UI Modernization Coherence Review',
  'Dashboard Progress Motion Pilot',
  'Navigation Visual Backlog Review',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Return To Phase 37C Gap Review First'
];

const SEED_REQUIRED_TEXT = [
  'Collapsible Avatar Header Pilot',
  'modern app-shell/header identity visual pilot only',
  'must not create or imply sign-in',
  'account recovery',
  'cloud sync',
  'profile editing',
  'avatar upload',
  'persisted identity',
  'auth/account/profile backend',
  'telemetry',
  'network behavior',
  'src/layout/AppLayout.jsx',
  'src/layout/Sidebar.jsx',
  'src/layout/BottomNav.jsx',
  'src/components/PageHeader.jsx',
  'src/styles/global.css',
  'route definitions',
  'NavLink destinations',
  'no storage/localStorage/telemetry writes',
  'mobile 375px',
  'desktop',
  'E2E smoke',
  'E2E onboarding',
  'HOLD_COLLAPSIBLE_AVATAR_HEADER_PILOT',
  'NEEDS_COLLAPSIBLE_AVATAR_HEADER_REWORK',
  'PASS_TO_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_RESEARCH_ONLY',
  'PASS_TO_UI_MODERNIZATION_COHERENCE_REVIEW'
];

const GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiM',
  'broad UI redesign',
  'Streak Fire expansion',
  'streak calculation changes',
  'daily goal logic changes',
  'completion logic changes',
  'scoring/correctness/scheduler/queue/data changes',
  'route behavior changes',
  'navigation destination changes',
  'event handler changes',
  'button handler changes',
  'form submission changes',
  'disabled state behavior changes',
  'package/dependency changes',
  'storage/backup/restore changes',
  'import/parser changes',
  'scheduler/FSRS changes',
  'sync/cloud/account/auth/backend',
  'profile backend',
  'avatar upload',
  'telemetry/network calls',
  'localStorage writes',
  'Collapsible Avatar Header implementation',
  'replacement of Phase 37C'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^docs\/testing\//,
  /^docs\/adr\//,
  /^RELEASE_NOTES(?:_V2)?\.md$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
      fail(`Unsupported Phase 37-uiM decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiM PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiM PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiM allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiL validator retained as historical reference; not run as Phase 37-uiM merge-blocking gate.',
    '# node scripts/validate-phase37-uil-streak-fire-ignition-micro-moment-pilot.js',
    'Validate Phase 37-uiM Streak Fire Evidence and Collapsible Avatar Header Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  if (/^\s*run:\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) {
    fail('Workflow must not include a shell remote update step');
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

function assertDocs(review, summary, seed) {
  const docs = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('evidence rows', review, EVIDENCE_ROWS);
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37-uiN seed', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrails', docs, GUARDRAILS);
  assertIncludes('validator safety docs', docs, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'exact changed-file allowlist',
    'no generated artifacts',
    'no active historical validator chain'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiM approves?\s+BETA_READY/i,
    /Phase 37-uiM approves?\s+public production readiness/i,
    /Phase 37-uiM approves?\s+release-readiness upgrade/i,
    /Phase 37-uiM approves?\s+runtime implementation/i,
    /Phase 37-uiM approves?\s+broad UI redesign/i,
    /Phase 37-uiM approves?\s+Streak Fire expansion/i,
    /Phase 37-uiM approves?\s+streak calculation changes/i,
    /Phase 37-uiM approves?\s+daily goal logic changes/i,
    /Phase 37-uiM approves?\s+completion logic changes/i,
    /Phase 37-uiM approves?\s+scoring\/correctness\/scheduler\/queue\/data changes/i,
    /Phase 37-uiM approves?\s+storage\/backup\/restore changes/i,
    /Phase 37-uiM approves?\s+import\/parser changes/i,
    /Phase 37-uiM approves?\s+localStorage writes/i,
    /Phase 37-uiM approves?\s+Collapsible Avatar Header implementation/i,
    /Phase 37-uiM approves?\s+replacement of Phase 37C/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
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
  const review = read(REVIEW_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertDocs(review, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiM Streak Fire Evidence and Collapsible Avatar Header Scope validator passed (${mode}).`);
}

main();
