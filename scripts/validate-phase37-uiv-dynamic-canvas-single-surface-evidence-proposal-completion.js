#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uiv-dynamic-canvas-single-surface-evidence-proposal-completion.md';
const SUMMARY_FILE = 'docs/release/phase37-uiv-dynamic-canvas-single-surface-evidence-proposal-completion-summary.md';
const SEED_FILE = 'docs/planning/phase37-uiw-ui-proposal-completion-and-handoff-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uiv-dynamic-canvas-single-surface-evidence-proposal-completion.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW_STATUS: COMPLETED_DYNAMIC_CANVAS_SINGLE_SURFACE_EVIDENCE_REVIEW_AND_UI_PROPOSAL_COMPLETION_SCOPE',
  'PHASE37UIV_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIV_REVIEW_SCOPE: DYNAMIC_CANVAS_SINGLE_SURFACE_EVIDENCE_REVIEW_AND_UI_PROPOSAL_COMPLETION_SCOPE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIV_SELECTED_CANDIDATE: UI_PROPOSAL_COMPLETION_AND_HANDOFF',
  'PHASE37UIW_UI_PROPOSAL_COMPLETION_AND_HANDOFF_SEED_STATUS: PREPARED_COMPLETION_HANDOFF_SEED'
];

const DECISION_TOKEN = 'PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW_DECISION';
const EXPECTED_DECISION = 'PASS_TO_PHASE37UIW_UI_PROPOSAL_COMPLETION_AND_HANDOFF';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW',
  'NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiV — Dynamic Canvas Single-Surface Evidence Review and UI Proposal Completion Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiU and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiU evidence review table',
  '## Selected Dashboard preview surface review',
  '## Single-surface containment review',
  '## Moss Library visual quality review',
  '## Theme-state and persistence preservation review',
  '## Global app, body, html, and root preservation review',
  '## Theme picker and preference guardrail review',
  '## Routing, handler, and Dashboard data preservation review',
  '## Storage, localStorage, sessionStorage, and telemetry preservation review',
  '## Accessibility, contrast, and readability review',
  '## Focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px review',
  '## Desktop review',
  '## E2E smoke and onboarding review',
  '## Rollback review',
  '## Phase 37C release-readiness separation review',
  '## UI proposal completion inventory',
  '## Completed shime-ui-plan coverage table',
  '## Remaining UI gaps and evidence gaps',
  '## Dynamic Canvas future-risk position',
  '## Next candidate comparison table',
  '## Selected candidate',
  '## Why UI Proposal Completion and Handoff next',
  '## Why this is evidence review and scope gate, not runtime implementation',
  '## Phase 37-uiW allowed files / expected areas',
  '## Phase 37-uiW forbidden areas',
  '## Evidence requirements for Phase 37-uiW',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiV supports',
  '## What Phase 37-uiV does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiV — Dynamic Canvas Single-Surface Evidence Review and UI Proposal Completion Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## UI proposal coverage',
  '## Remaining evidence gaps',
  '## Dynamic Canvas future-risk position',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiW — UI Proposal Completion and Handoff Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiV',
  '## Completion candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Completion inventory requirements',
  '## Evidence summary requirements',
  '## Remaining gap requirements',
  '## Release-readiness separation requirements',
  '## Future UI track recommendations',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'selected surface marker in `src/routes/Dashboard.jsx`',
  '`DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW`',
  'scoped Moss Library CSS',
  'no full Dynamic Canvas Themes runtime',
  'no theme picker',
  'no persisted preferences',
  'no account-synced preferences',
  'no CSS variable theme engine',
  'no global app theme',
  'no body/html/root mutation',
  'no localStorage writes',
  'no sessionStorage writes',
  'no route-dependent theme state',
  'no route changes',
  'no handler changes',
  'no Dashboard data behavior changes',
  'no storage/import/parser/scheduler changes',
  'no scoring/queue/streak/completion changes',
  'no telemetry/network calls',
  'contrast/readability evidence',
  'focus-visible evidence',
  'reduced-motion evidence',
  '375px mobile evidence',
  'desktop evidence',
  'E2E smoke',
  'E2E onboarding',
  'rollback evidence',
  'Phase 37C separation',
  'no readiness upgrade'
];

const PLAN_ROWS = [
  'Library Bookshelf / Bookshelf Architecture',
  'Dashboard Calm Home / Progress Journal Split',
  'Hybrid Sliding Navigation Indicator',
  'Elastic Button Compression',
  'Study Room Answer Feedback Polish',
  'Streak Fire Ignition Micro-Moment',
  'Collapsible Avatar Header / Header Identity',
  'UI Modernization Coherence Pass',
  'Dynamic Canvas Themes Design Gate',
  'Dynamic Canvas Themes Single-Surface Preview'
];

const REMAINING_GAPS = [
  'broader visual screenshots',
  'more physical-device evidence',
  'broader reduced-motion verification',
  'broader assistive technology evidence',
  'contrast/readability proof beyond limited browser evidence',
  'Dynamic Canvas expansion still gated',
  'Phase 37C readiness gaps remain separate'
];

const CANDIDATE_ROWS = [
  'UI Proposal Completion and Handoff',
  'Phase 37C Limited Release Readiness Gap Review',
  'UI Track Archive and Handoff',
  'Dynamic Canvas Themes Research Only',
  'Dynamic Canvas Expansion Scope Gate',
  'Full Dynamic Canvas Themes Runtime',
  'Full Theme Picker Runtime',
  'Persisted Theme Preferences Runtime'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_UI_PROPOSAL_COMPLETION_AND_HANDOFF',
  'NEEDS_UI_PROPOSAL_COMPLETION_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiW is docs/review/completion/handoff only.',
  'Phase 37-uiW is not runtime implementation.',
  'must summarize completed UI proposal coverage',
  'remaining gaps',
  'evidence quality',
  'non-approved claims',
  'future UI recommendations',
  'recommended return path',
  'may recommend returning to Phase 37C Limited Release Readiness Gap Review',
  'must not approve Beta Ready',
  'public production readiness',
  'Dynamic Canvas expansion',
  'full theme picker',
  'persisted preferences',
  'storage/auth/backend',
  'telemetry',
  'broad redesign'
];

const GUARDRAILS = [
  'Phase 37-uiV does not approve BETA_READY.',
  'Phase 37-uiV does not approve public production readiness.',
  'Phase 37-uiV does not approve release-readiness upgrade.',
  'Phase 37-uiV does not approve runtime implementation in Phase 37-uiV.',
  'Phase 37-uiV does not approve Dynamic Canvas Themes expansion.',
  'Phase 37-uiV does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37-uiV does not approve full theme picker runtime.',
  'Phase 37-uiV does not approve persisted theme preferences.',
  'Phase 37-uiV does not approve account-synced preferences.',
  'Phase 37-uiV does not approve CSS variable theme engine implementation.',
  'Phase 37-uiV does not approve global app theme implementation.',
  'Phase 37-uiV does not approve body/html/root theme changes.',
  'Phase 37-uiV does not approve app root theme changes.',
  'Phase 37-uiV does not approve route-dependent theme state.',
  'Phase 37-uiV does not approve storage/backup/restore behavior changes.',
  'Phase 37-uiV does not approve import/parser behavior changes.',
  'Phase 37-uiV does not approve scheduler/FSRS behavior changes.',
  'Phase 37-uiV does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37-uiV does not approve streak calculation changes.',
  'Phase 37-uiV does not approve daily goal logic changes.',
  'Phase 37-uiV does not approve completion logic changes.',
  'Phase 37-uiV does not approve route behavior changes.',
  'Phase 37-uiV does not approve event handler changes.',
  'Phase 37-uiV does not approve NavLink destination changes.',
  'Phase 37-uiV does not approve router configuration changes.',
  'Phase 37-uiV does not approve active page rendering changes.',
  'Phase 37-uiV does not approve package/dependency changes.',
  'Phase 37-uiV does not approve localStorage writes.',
  'Phase 37-uiV does not approve sessionStorage writes.',
  'Phase 37-uiV does not approve sync/cloud/account/auth/backend.',
  'Phase 37-uiV does not approve telemetry/network calls.',
  'Phase 37-uiV does not approve AI-generated themes.',
  'Phase 37-uiV does not approve replacement of Phase 37C.'
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
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiV decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37-uiV must include expected decision: ${EXPECTED_DECISION}`);
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
  return Array.from(new Set(`${mergeBaseDiff}\n${unstaged}\n${staged}\n${untracked}`
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(file => !/^node_modules\//.test(file))
    .filter(file => file !== 'FETCH_HEAD'))).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 37-uiV PR diff missing required file(s): ${missing.join(', ')}`);
  return 'pr-diff';
}

function assertChangedFiles(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }

  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiV allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiU validator retained as historical reference; not run as Phase 37-uiV merge-blocking gate.',
    '# node scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js',
    'Validate Phase 37-uiV Dynamic Canvas Single-Surface Evidence and UI Proposal Completion',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiV validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiV validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('evidence rows', review, EVIDENCE_ROWS);
  assertIncludes('completed plan rows', combined, PLAN_ROWS);
  assertIncludes('remaining gap rows', combined, REMAINING_GAPS);
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37-uiW seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37-uiW seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('selected surface documentation', combined, [
    'src/routes/Dashboard.jsx',
    'src/styles/global.css',
    'Moss Library',
    'DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW',
    'UI_PROPOSAL_COMPLETION_AND_HANDOFF',
    'Next recommended phase: Phase 37-uiW — UI Proposal Completion and Handoff.'
  ]);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report|node_modules)\//.test(file)) {
      fail(`Generated artifact must not be changed or untracked: ${file}`);
    }
  }
}

function assertNoInternalFetch() {
  const validator = read(VALIDATOR_FILE);
  if (/git\s*\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validator)) {
    fail('validator must not perform an internal git fetch');
  }
  assertIncludes('validator changed-file modes', validator, ['pr-diff', 'post-merge-main', 'validator-hotfix']);
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertChangedFiles(files, mode);
  assertNoGeneratedArtifacts(files);
  assertDocs(read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoInternalFetch();
  console.log(`Phase 37-uiV Dynamic Canvas Single-Surface Evidence and UI Proposal Completion validator passed (${mode}).`);
}

main();
