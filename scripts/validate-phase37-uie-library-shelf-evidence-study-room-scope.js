#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uie-library-shelf-evidence-study-room-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uie-library-shelf-evidence-study-room-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uif-study-room-modern-answer-surface-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uie-library-shelf-evidence-study-room-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE',
  'PHASE37UIE_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIE_REVIEW_SCOPE: LIBRARY_SHELF_EVIDENCE_REVIEW_AND_STUDY_ROOM_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIE_SELECTED_CANDIDATE: STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT',
  'PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIF_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT_IMPLEMENTATION',
  'HOLD_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW',
  'NEEDS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_FIXES',
  'PASS_TO_LIBRARY_VISUAL_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_STUDY_ROOM_ANSWER_SURFACE_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiE — Library Shelf Evidence Review and Study Room Modern Answer Surface Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiD and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiD evidence review table',
  '## Library shelf visual quality review',
  '## One-surface containment review',
  '## Library tab semantics review',
  '## Panel mounting, raw input, and importStatus review',
  '## Import, parser, and storage boundary review',
  '## Accessibility, contrast, and focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px and desktop review',
  '## Workshop import reachability review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Study Room Modern Answer Surface Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiF allowed files / expected areas',
  '## Phase 37-uiF forbidden areas',
  '## Evidence requirements for Phase 37-uiF',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiE supports',
  '## What Phase 37-uiE does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiE — Library Shelf Evidence Review and Study Room Scope Summary',
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
  '# Phase 37-uiF — Study Room Modern Answer Surface Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiE',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Mobile and desktop requirements',
  '## Study Room scoring, queue, scheduler, and data restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Library passive host class',
  'Library shelf scoped CSS containment',
  'Modern collection-card visual treatment',
  'One-surface containment',
  'Library tab labels',
  'Library tab roles',
  'aria-selected',
  'aria-controls',
  'panel mounting',
  'raw input preservation',
  'importStatus visibility',
  'Workshop/import reachability',
  'parser behavior',
  'storage/backup/restore boundary',
  'contrast/readability',
  'focus-visible',
  'reduced-motion',
  '375px Library rendering',
  'desktop Library rendering',
  'populated Library state',
  'empty Library state',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Study Room Modern Answer Surface Pilot',
  'Study Room Explanation Reveal Polish',
  'Premium Elastic Tap Compression',
  'Hybrid Sliding Navigation Indicator',
  'Library Visual Backlog Review',
  'Dashboard Token Preview Expansion',
  'Full Dynamic Canvas Themes',
  'Streak Fire Ignition',
  'Collapsible Header',
  'Return To Phase 37C Gap Review First'
];

const SEED_DECISIONS = [
  'HOLD_STUDY_ROOM_MODERN_ANSWER_SURFACE_PILOT',
  'NEEDS_STUDY_ROOM_MODERN_ANSWER_SURFACE_REWORK',
  'PASS_TO_PHASE37UIG_STUDY_ROOM_MODERN_ANSWER_SURFACE_EVIDENCE_REVIEW',
  'PASS_TO_STUDY_ROOM_ANSWER_SURFACE_RESEARCH_ONLY'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiF is a runtime pilot only if scoped to Study Room answer surface visuals',
  'stronger answer-card treatment',
  'calm selected/check/reveal states',
  'explanation reveal framing',
  'subtle feedback surfaces',
  'depth/border/glow tokens',
  'hover/focus affordances',
  'reduced-motion-safe transitions',
  'preserve scoring correctness',
  'answer evaluation',
  'scheduler/FSRS',
  'queue logic',
  'question data',
  'stored progress',
  'routes/navigation',
  'event handlers',
  'package files',
  'sync/backend/auth/telemetry',
  'gamification pressure',
  'confetti',
  'sound',
  'casino-like effects',
  'Streak Fire',
  'Collapsible Header',
  'full Dynamic Canvas themes',
  'theme picker',
  'persisted preferences',
  'localStorage writes'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiF — Study Room Modern Answer Surface Pilot',
  'Phase 37-uiE confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiE does not approve BETA_READY',
  'Phase 37-uiE does not approve public production readiness',
  'Phase 37-uiE does not approve release-readiness upgrade',
  'Phase 37-uiE does not approve broad UI redesign',
  'Phase 37-uiE does not approve full Dynamic Canvas Themes',
  'Phase 37-uiE does not approve theme picker',
  'Phase 37-uiE does not approve persisted preferences',
  'Phase 37-uiE does not approve localStorage writes',
  'Phase 37-uiE does not approve existing theme key mutation',
  'Phase 37-uiE does not approve account-synced preferences',
  'Phase 37-uiE does not approve global theme system',
  'Phase 37-uiE does not approve storage/backup/restore changes',
  'Phase 37-uiE does not approve import/parser changes',
  'Phase 37-uiE does not approve scheduler/FSRS changes',
  'Phase 37-uiE does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37-uiE does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiE does not approve telemetry',
  'Phase 37-uiE does not approve route behavior changes',
  'Phase 37-uiE does not approve event handler changes',
  'Phase 37-uiE does not approve package/dependency changes',
  'Phase 37-uiE does not approve Streak Fire',
  'Phase 37-uiE does not approve Collapsible Header',
  'Phase 37-uiE does not replace Phase 37C',
  'Phase 37C Limited Release Readiness Gap Review remains separate'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(?:_V2)?\.md$/,
  /^docs\/planning\/phase(?!37-uif-study-room-modern-answer-surface-pilot-seed\.md$)/,
  /^docs\/release\/phase(?!37-uie-library-shelf-evidence-study-room-scope-summary\.md$)/,
  /^docs\/review\/phase(?!37-uie-library-shelf-evidence-study-room-scope\.md$)/,
  /^docs\/testing\//,
  /^scripts\/validate-phase(?!37-uie-library-shelf-evidence-study-room-scope\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  throw new Error(message);
}

function read(file) {
  const fullPath = path.resolve(ROOT, file);
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
      fail(`Unsupported Phase 37-uiE decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiE PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiE PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiE allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiD validator retained as historical reference',
    'Validate Phase 37-uiE Library Shelf Evidence and Study Room Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  const remoteUpdatePhrase = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (workflow.includes(remoteUpdatePhrase)) fail('Workflow must not shell out to update origin/main');
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

function assertDocs(review, summary, seed) {
  const docs = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('evidence table rows', review, EVIDENCE_ROWS);
  assertIncludes('candidate table rows', review, CANDIDATE_ROWS);
  assertIncludes('seed decisions', seed, SEED_DECISIONS);
  assertIncludes('seed scope statements', seed, SEED_SCOPE_STATEMENTS);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('scope boundary docs', docs, [
    'docs/review/research/release/planning/static-validator/CI-only',
    'no runtime behavior changes',
    'Study Room Modern Answer Surface Pilot',
    'Phase 37C Limited Release Readiness Gap Review remains separate',
    'pr-diff',
    'post-merge-main',
    'validator-hotfix'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiE approves?\s+BETA_READY/i,
    /Phase 37-uiE approves?\s+public production readiness/i,
    /Phase 37-uiE approves?\s+release-readiness upgrade/i,
    /Phase 37-uiE approves?\s+broad UI redesign/i,
    /Phase 37-uiE approves?\s+full Dynamic Canvas Themes/i,
    /Phase 37-uiE approves?\s+theme picker/i,
    /Phase 37-uiE approves?\s+persisted preferences/i,
    /Phase 37-uiE approves?\s+localStorage writes/i,
    /Phase 37-uiE approves?\s+Study Room correctness\/scoring\/scheduler\/queue\/data changes/i,
    /Phase 37-uiE implements?\s+runtime/i,
    /Phase 37-uiE changes?\s+runtime/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval/runtime claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  const remoteUpdatePhrase = ['git', 'fetch'].join(' ');
  if (source.includes(remoteUpdatePhrase)) fail('Validator must not update remotes internally');
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
  const review = read(REVIEW_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertDocs(review, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiE Library Shelf Evidence and Study Room Scope validator passed (${mode}).`);
}

main();
