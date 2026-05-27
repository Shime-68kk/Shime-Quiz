#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uig-study-room-evidence-hybrid-nav-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uig-study-room-evidence-hybrid-nav-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uih-hybrid-sliding-navigation-indicator-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uig-study-room-evidence-hybrid-nav-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_STATUS: COMPLETED_STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE',
  'PHASE37UIG_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIG_REVIEW_SCOPE: STUDY_ROOM_EVIDENCE_REVIEW_AND_HYBRID_NAV_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIG_SELECTED_CANDIDATE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT',
  'PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION',
  'HOLD_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW',
  'NEEDS_STUDY_ROOM_MODERN_ANSWER_SURFACE_FIXES',
  'PASS_TO_STUDY_ROOM_VISUAL_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_HYBRID_NAVIGATION_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiG — Study Room Answer Surface Evidence Review and Hybrid Sliding Navigation Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiF and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiF evidence review table',
  '## Study Room visual quality review',
  '## One-surface containment review',
  '## Answer state preservation review',
  '## Scoring, queue, scheduler, and data boundary review',
  '## Explanation visibility review',
  '## Accessibility, contrast, and focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px and desktop review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Hybrid navigation risk review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Hybrid Sliding Navigation Indicator Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiH allowed files / expected areas',
  '## Phase 37-uiH forbidden areas',
  '## Evidence requirements for Phase 37-uiH',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiG supports',
  '## What Phase 37-uiG does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiG — Study Room Evidence Review and Hybrid Navigation Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiG',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Responsive and motion requirements',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Navigation routing, active-state, and event-handler restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Study Room passive host class',
  'Study Room scoped CSS containment',
  'Modern answer-card visual treatment',
  'selected answer state',
  'correct feedback state',
  'incorrect feedback state',
  'flashcard reveal state',
  'explanation visibility',
  'scoring correctness preservation',
  'answer evaluation preservation',
  'queue logic boundary',
  'scheduler/FSRS boundary',
  'question data and stored progress boundary',
  'contrast/readability',
  'focus-visible',
  'reduced-motion',
  '375px Study Room rendering',
  'desktop Study Room rendering',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Hybrid Sliding Navigation Indicator Pilot',
  'Premium Elastic Tap Compression Token',
  'Study Room Visual Backlog Review',
  'Dashboard Progress Motion Pilot',
  'Streak Fire Ignition Widget',
  'Collapsible Header Scope Gate',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Return To Phase 37C Gap Review First'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiH is a runtime pilot only if scoped to the existing navigation active indicator',
  'modern sliding active-pill indicator',
  'Preserve route definitions',
  'NavLink` destinations',
  'click handlers',
  'active route logic',
  'page rendering',
  'BottomNav behavior',
  'Sidebar behavior',
  'focus-visible',
  'reduced-motion',
  'mobile safe-area behavior',
  'must not add dependencies',
  'must not add dependencies, change routes, router config',
  'localStorage',
  'desktop navigation evidence',
  'mobile bottom navigation evidence',
  'active indicator movement evidence',
  'active text/icon color evidence',
  '375px no-overflow evidence',
  'E2E smoke/onboarding',
  'rollback notes'
];

const GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiG',
  'broad UI redesign',
  'route behavior changes',
  'event handler changes',
  'NavLink destination changes',
  'router configuration changes',
  'active page rendering changes',
  'package/dependency changes',
  'storage/backup/restore behavior changes',
  'import/parser behavior changes',
  'scheduler/FSRS behavior changes',
  'Study Room scoring/correctness/scheduler/queue/data changes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'full Dynamic Canvas Themes',
  'full theme picker',
  'persisted preferences',
  'localStorage writes',
  'Streak Fire',
  'Collapsible Header',
  'replacement of Phase 37C'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(?:_V2)?\.md$/,
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
      fail(`Unsupported Phase 37-uiG decision token: ${match[1]}`);
    }
  }
}

function assertOriginMainAvailable() {
  try {
    git(['rev-parse', '--verify', 'origin/main']);
  } catch {
    fail('origin/main is not available locally; provide it before running this validator');
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
  if (missing.length > 0) fail(`Phase 37-uiG PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiG PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiG allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiF validator retained as historical reference; not run as Phase 37-uiG merge-blocking gate.',
    'Validate Phase 37-uiG Study Room Evidence and Hybrid Navigation Scope',
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
  if (/^\s*run:\s*\|\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) {
    fail('Workflow must not include a shell remote update step');
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
  assertIncludes('Phase 37-uiH seed', seed, SEED_REQUIRED_TEXT);
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
    /Phase 37-uiG approves?\s+BETA_READY/i,
    /Phase 37-uiG approves?\s+public production readiness/i,
    /Phase 37-uiG approves?\s+release-readiness upgrade/i,
    /Phase 37-uiG approves?\s+runtime implementation/i,
    /Phase 37-uiG approves?\s+broad UI redesign/i,
    /Phase 37-uiG approves?\s+route behavior changes/i,
    /Phase 37-uiG approves?\s+package\/dependency changes/i,
    /Phase 37-uiG approves?\s+localStorage writes/i,
    /Phase 37-uiG approves?\s+replacement of Phase 37C/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  if (/git\s+fetch|git\s+pull/.test(source)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable',
    'classifyDiffMode',
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

  console.log(`Phase 37-uiG Study Room Evidence and Hybrid Navigation Scope validator passed (${mode}).`);
}

main();
