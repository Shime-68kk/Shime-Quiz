#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uir-ui-backlog-closure-dynamic-canvas-design-gate.md';
const SUMMARY_FILE = 'docs/release/phase37-uir-ui-backlog-closure-dynamic-canvas-design-gate-summary.md';
const SEED_FILE = 'docs/planning/phase37-uis-dynamic-canvas-themes-design-gate-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uir-ui-backlog-closure-dynamic-canvas-design-gate.js';

const REQUIRED_FILES = [WORKFLOW_FILE, REVIEW_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIR_UI_BACKLOG_CLOSURE_REVIEW_STATUS: COMPLETED_UI_BACKLOG_CLOSURE_REVIEW_AND_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_SCOPE',
  'PHASE37UIR_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIR_REVIEW_SCOPE: UI_BACKLOG_CLOSURE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIR_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY',
  'PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_SEED_STATUS: PREPARED_DESIGN_GATE_SEED'
];

const DECISION_TOKEN = 'PHASE37UIR_UI_BACKLOG_CLOSURE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY',
  'HOLD_UI_BACKLOG_CLOSURE_REVIEW',
  'NEEDS_UI_BACKLOG_CLOSURE_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiR — UI Backlog Closure Review and Dynamic Canvas Themes Design Gate Scope',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiQ and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Completed Phase 37 UI modernization arc inventory',
  '## Completed UI phase table',
  '## Modernized surface evidence summary',
  '## Remaining UI issue inventory',
  '## Evidence gap inventory',
  '## Mobile, desktop, reduced-motion, focus-visible, and contrast status',
  '## High-risk UI ideas remaining',
  '## Dynamic Canvas Themes risk review',
  '## Why Dynamic Canvas Themes requires design gate before runtime',
  '## Phase 37C release-readiness separation review',
  '## Next candidate comparison table',
  '## Selected candidate',
  '## Why Dynamic Canvas Themes Design Gate Only next',
  '## Why this is closure/review, not runtime implementation',
  '## Phase 37-uiS allowed files / expected areas',
  '## Phase 37-uiS forbidden areas',
  '## Evidence requirements for Phase 37-uiS',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiR supports',
  '## What Phase 37-uiR does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiR — UI Backlog Closure and Dynamic Canvas Design Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Completed UI modernization arc',
  '## Remaining UI backlog',
  '## Evidence gaps carried forward',
  '## Dynamic Canvas Themes risk position',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiS — Dynamic Canvas Themes Design Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiR',
  '## Design gate candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Design questions',
  '## Theme-state and persistence restrictions',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const COMPLETED_UI_PHASE_ROWS = [
  'Dashboard visual refresh / Dynamic Canvas token preview',
  'Library shelf modern collection cards',
  'Study Room modern answer surface',
  'Hybrid sliding navigation indicator',
  'Premium elastic tap compression',
  'Streak Fire ignition micro-moment',
  'Collapsible avatar/header identity surface',
  'UI Modernization Coherence Pass',
  'UI Modernization Coherence Evidence Review'
];

const REMAINING_UI_ISSUES = [
  'visual evidence gaps',
  '375px mobile gaps',
  'desktop browser evidence gaps',
  'reduced-motion verification gaps',
  'focus-visible verification gaps',
  'contrast/readability follow-up',
  'any known risky ideas not yet implemented',
  'why these gaps do not equal Beta Ready'
];

const CANDIDATES = [
  'Dynamic Canvas Themes Design Gate Only',
  'Phase 37C Limited Release Readiness Gap Review',
  'UI Track Archive And Handoff',
  'UI Coherence Fixes',
  'Dashboard Progress Motion Pilot',
  'Study Room Visual Backlog Review',
  'Navigation Visual Backlog Review',
  'Full Dynamic Canvas Themes Runtime',
  'Full Theme Picker Runtime'
];

const GUARDRAILS = [
  'BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiR',
  'Dynamic Canvas Themes runtime',
  'full theme picker runtime',
  'persisted theme preferences',
  'CSS variable theme engine',
  'storage/backup/restore behavior changes',
  'import/parser behavior changes',
  'scheduler/FSRS behavior changes',
  'scoring/correctness/scheduler/queue/data changes',
  'streak calculation changes',
  'daily goal logic changes',
  'completion logic changes',
  'route behavior changes',
  'event handler changes',
  'NavLink destination changes',
  'router configuration changes',
  'active page rendering changes',
  'package/dependency changes',
  'localStorage writes',
  'sessionStorage writes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'replacement of Phase 37C'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiS is design gate only',
  'Phase 37-uiS is not runtime implementation',
  'must not add theme picker',
  'persistence',
  'localStorage/sessionStorage writes',
  'account-synced preferences',
  'CSS variable theme engine',
  'route changes',
  'storage/import/parser/scheduler/data changes',
  'packages',
  'telemetry',
  'backend work',
  'candidate theme tokens',
  'allowed surfaces',
  'contrast targets',
  'reduced-motion requirements',
  'rollback plan',
  'evidence checklist',
  'Any future runtime pilot must be smaller than full Dynamic Canvas Themes',
  'one low-risk surface',
  'HOLD_DYNAMIC_CANVAS_THEMES_DESIGN_GATE',
  'NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH',
  'PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SCOPE_GATE',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
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
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiR decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiR PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiR allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'Phase 37-uiQ validator retained as historical reference; not run as Phase 37-uiR merge-blocking gate.',
    '# node scripts/validate-phase37-uiq-ui-modernization-coherence-evidence-backlog-closure-scope.js',
    'Validate Phase 37-uiR UI Backlog Closure and Dynamic Canvas Design Gate',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/git\s+fetch/.test(workflow)) fail('workflow must not include a shell git fetch step');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiR validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiR validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('Phase 37-uiR tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('completed UI phase table rows', review, COMPLETED_UI_PHASE_ROWS);
  assertIncludes('summary completed UI phase rows', summary, COMPLETED_UI_PHASE_ROWS);
  assertIncludes('remaining UI issue inventory rows', review, REMAINING_UI_ISSUES);
  assertIncludes('candidate rows', review, CANDIDATES);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('Phase 37-uiS seed required text', seed, SEED_REQUIRED_TEXT);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report)\//.test(file)) {
      fail(`Generated artifact must not be part of Phase 37-uiR diff: ${file}`);
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
    fail(`workflow must not run a full historical validator chain. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertNoInternalFetch() {
  const validator = read(VALIDATOR_FILE);
  if (/git\s*\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validator)) {
    fail('validator must not perform an internal git fetch');
  }
  assertIncludes('validator post-merge safety modes', validator, ['pr-diff', 'post-merge-main', 'validator-hotfix']);
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);
  assertNoGeneratedArtifacts(files);
  assertDocs(read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoHistoricalValidatorChain();
  assertNoInternalFetch();
  console.log(`Phase 37-uiR validator passed (${mode}).`);
}

main();
