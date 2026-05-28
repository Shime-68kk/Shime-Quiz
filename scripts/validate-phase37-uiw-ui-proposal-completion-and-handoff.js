#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uiw-ui-proposal-completion-and-handoff.md';
const SUMMARY_FILE = 'docs/release/phase37-uiw-ui-proposal-completion-and-handoff-summary.md';
const SEED_FILE = 'docs/planning/phase37c-limited-release-readiness-gap-review-return-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uiw-ui-proposal-completion-and-handoff.js';

const REQUIRED_FILES = [WORKFLOW_FILE, REVIEW_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIW_UI_PROPOSAL_COMPLETION_AND_HANDOFF_STATUS: COMPLETED_UI_PROPOSAL_COMPLETION_AND_HANDOFF',
  'PHASE37UIW_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIW_REVIEW_SCOPE: UI_PROPOSAL_COMPLETION_AND_HANDOFF_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIW_SELECTED_CANDIDATE: PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_RETURN_STATUS: RECOMMENDED_RETURN_TO_READINESS_GAP_REVIEW'
];

const DECISION_TOKEN = 'PHASE37UIW_UI_PROPOSAL_COMPLETION_AND_HANDOFF_DECISION';
const EXPECTED_DECISION = 'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'HOLD_UI_PROPOSAL_COMPLETION_AND_HANDOFF',
  'NEEDS_UI_PROPOSAL_COMPLETION_FIXES',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY',
  'PASS_TO_PHASE38_UI_RESEARCH_BACKLOG_ONLY'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiW — UI Proposal Completion and Handoff',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiV and UI plan',
  '## UI leadership direction',
  '## Completion method',
  '## Executive summary for system leader',
  '## Completed UI proposal coverage table',
  '## Phase-by-phase UI modernization inventory',
  '## User-facing improvements delivered',
  '## Modernity and aesthetic gains',
  '## Evidence quality summary',
  '## Remaining evidence gaps',
  '## Remaining UI backlog',
  '## Dynamic Canvas future-risk position',
  '## Non-approved claims and boundaries',
  '## Runtime/system preservation summary',
  '## Local-first and privacy preservation summary',
  '## Accessibility, reduced-motion, focus-visible, and contrast status',
  '## Mobile and desktop status',
  '## Phase 37C release-readiness separation',
  '## Recommended return path',
  '## Next candidate comparison table',
  '## Selected candidate',
  '## Why return to Phase 37C next',
  '## Why this is completion/handoff, not runtime implementation',
  '## Phase 37C return allowed files / expected areas',
  '## Phase 37C return forbidden areas',
  '## Evidence requirements for Phase 37C return',
  '## Rollback / hold plan',
  '## Chosen completion decision',
  '## Decision rationale',
  '## What Phase 37-uiW supports',
  '## What Phase 37-uiW does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiW — UI Proposal Completion and Handoff Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Completion result',
  '## Chosen decision',
  '## Selected candidate',
  '## Completed UI proposal coverage',
  '## User-facing visual outcome',
  '## Evidence accepted',
  '## Evidence gaps carried forward',
  '## Future UI risk position',
  '## Recommended return path',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37C — Limited Release Readiness Gap Review Return Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiW',
  '## Return candidate',
  '## Why return to readiness review',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Evidence required',
  '## Readiness boundaries',
  '## UI proposal completion inputs',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const COVERAGE_ROWS = [
  'Library Bookshelf / Bookshelf Architecture',
  'Dashboard Calm Home / Progress Journal Split',
  'Hybrid Sliding Navigation Indicator',
  'Elastic Button Compression',
  'Study Room Answer Feedback Polish',
  'Streak Fire Ignition Micro-Moment',
  'Collapsible Avatar Header / Header Identity',
  'UI Modernization Coherence Pass',
  'Dynamic Canvas Themes Design Gate',
  'Dynamic Canvas Themes Single-Surface Preview',
  'UI Proposal Completion and Handoff'
];

const INVENTORY_ROWS = [
  'Phase 37 Library/bookshelf modernization',
  'Phase 37 Dashboard visual refresh / Dynamic Canvas token preview',
  'Phase 37 Study Room answer feedback polish',
  'Phase 37 Hybrid navigation indicator',
  'Phase 37 Premium elastic tap compression',
  'Phase 37 Streak Fire ignition micro-moment',
  'Phase 37 Collapsible avatar/header identity',
  'Phase 37 UI modernization coherence pass',
  'Phase 37 Dynamic Canvas design gate',
  'Phase 37 Dynamic Canvas single-surface scope/preview/evidence review',
  'Phase 37 UI proposal completion'
];

const REMAINING_EVIDENCE_GAPS = [
  'broader visual screenshots',
  'more physical-device evidence',
  'broader reduced-motion verification',
  'broader assistive-technology evidence',
  'contrast/readability proof beyond limited browser evidence',
  'broader long-session regression observation',
  'broader manual user evidence',
  'Phase 37C readiness gaps remain separate'
];

const REMAINING_UI_BACKLOG = [
  'Dynamic Canvas expansion remains gated',
  'full Dynamic Canvas Themes remains not approved',
  'theme picker remains not approved',
  'persisted theme preferences remain not approved',
  'account-synced preferences remain not approved',
  'broad design-system rewrite remains not approved',
  'future UI research only after readiness review'
];

const CANDIDATE_ROWS = [
  'Phase 37C Limited Release Readiness Gap Review',
  'UI Track Archive and Handoff',
  'Dynamic Canvas Themes Research Only',
  'Phase 38 UI Research Backlog Only',
  'Dynamic Canvas Expansion Runtime',
  'Full Dynamic Canvas Themes Runtime',
  'Full Theme Picker Runtime',
  'Persisted Theme Preferences Runtime'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_RETURN',
  'NEEDS_READINESS_GAP_REVIEW_PREP',
  'PASS_TO_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37C return is not automatic Beta Ready.',
  'Phase 37C return must review readiness gaps separately from UI modernization',
  'browser coverage',
  'physical-device evidence',
  'reduced-motion',
  'assistive technology',
  'backup/restore/manual evidence',
  'actual user testing',
  'Phase 37C return must not approve release readiness unless independent readiness evidence supports it.',
  'UI modernization completion does not close readiness gaps.'
];

const GUARDRAILS = [
  'Phase 37-uiW does not approve BETA_READY.',
  'Phase 37-uiW does not approve public production readiness.',
  'Phase 37-uiW does not approve release-readiness upgrade.',
  'Phase 37-uiW does not approve runtime implementation in Phase 37-uiW.',
  'Phase 37-uiW does not approve broad UI redesign.',
  'Phase 37-uiW does not approve broad design-system rewrite.',
  'Phase 37-uiW does not approve Dynamic Canvas Themes expansion.',
  'Phase 37-uiW does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37-uiW does not approve full theme picker runtime.',
  'Phase 37-uiW does not approve persisted theme preferences.',
  'Phase 37-uiW does not approve account-synced preferences.',
  'Phase 37-uiW does not approve CSS variable theme engine implementation.',
  'Phase 37-uiW does not approve global app theme implementation.',
  'Phase 37-uiW does not approve body/html/root theme changes.',
  'Phase 37-uiW does not approve app root theme changes.',
  'Phase 37-uiW does not approve route-dependent theme state.',
  'Phase 37-uiW does not approve storage/backup/restore behavior changes.',
  'Phase 37-uiW does not approve import/parser behavior changes.',
  'Phase 37-uiW does not approve scheduler/FSRS behavior changes.',
  'Phase 37-uiW does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37-uiW does not approve streak calculation changes.',
  'Phase 37-uiW does not approve daily goal logic changes.',
  'Phase 37-uiW does not approve completion logic changes.',
  'Phase 37-uiW does not approve route behavior changes.',
  'Phase 37-uiW does not approve event handler changes.',
  'Phase 37-uiW does not approve NavLink destination changes.',
  'Phase 37-uiW does not approve router configuration changes.',
  'Phase 37-uiW does not approve active page rendering changes.',
  'Phase 37-uiW does not approve package/dependency changes.',
  'Phase 37-uiW does not approve localStorage writes.',
  'Phase 37-uiW does not approve sessionStorage writes.',
  'Phase 37-uiW does not approve sync/cloud/account/auth/backend.',
  'Phase 37-uiW does not approve telemetry/network calls.',
  'Phase 37-uiW does not approve AI-generated themes.',
  'Phase 37-uiW does not approve replacement of Phase 37C.'
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiW decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37-uiW must include expected decision: ${EXPECTED_DECISION}`);
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
  if (missing.length > 0) fail(`Phase 37-uiW PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiW allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiV validator retained as historical reference; not run as Phase 37-uiW merge-blocking gate.',
    '# node scripts/validate-phase37-uiv-dynamic-canvas-single-surface-evidence-proposal-completion.js',
    'Validate Phase 37-uiW UI Proposal Completion and Handoff',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiW validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiW validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('completed coverage rows', combined, COVERAGE_ROWS);
  assertIncludes('phase inventory rows', review, INVENTORY_ROWS);
  assertIncludes('remaining evidence gaps', combined, REMAINING_EVIDENCE_GAPS);
  assertIncludes('remaining UI backlog', combined, REMAINING_UI_BACKLOG);
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37C return seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37C return seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('handoff context', combined, [
    'UI_PROPOSAL_COMPLETION_AND_HANDOFF',
    'DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW',
    'src/routes/Dashboard.jsx',
    'src/styles/global.css',
    'Moss Library',
    'Next recommended phase: Phase 37C Limited Release Readiness Gap Review.'
  ]);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report|node_modules)\//.test(file)) {
      fail(`Generated artifact must not be changed or untracked: ${file}`);
    }
  }
}

function assertNoHistoricalValidatorChain() {
  const workflow = read(WORKFLOW_FILE);
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1) {
    fail(`workflow must not run a full historical validator chain: ${activeValidatorCommands.join(', ')}`);
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
  assertNoHistoricalValidatorChain();
  assertNoInternalFetch();
  console.log(`Phase 37-uiW UI Proposal Completion and Handoff validator passed (${mode}).`);
}

main();
