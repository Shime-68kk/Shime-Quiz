#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uis-dynamic-canvas-themes-design-gate.md';
const SUMMARY_FILE = 'docs/release/phase37-uis-dynamic-canvas-themes-design-gate-summary.md';
const SEED_FILE = 'docs/planning/phase37-uit-dynamic-canvas-themes-single-surface-scope-gate-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uis-dynamic-canvas-themes-design-gate.js';

const REQUIRED_FILES = [WORKFLOW_FILE, REVIEW_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY',
  'PHASE37UIS_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIS_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIS_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE',
  'PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE_SEED_STATUS: PREPARED_SCOPE_GATE_SEED'
];

const DECISION_TOKEN = 'PHASE37UIS_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIT_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE',
  'HOLD_DYNAMIC_CANVAS_THEMES_DESIGN_GATE',
  'NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiS — Dynamic Canvas Themes Design Gate Only',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiR and UI plan',
  '## UI leadership direction',
  '## Design gate method',
  '## Why Dynamic Canvas Themes are high risk',
  '## Current UI modernization baseline',
  '## Candidate theme direction inventory',
  '## Allowed theme-token categories',
  '## Forbidden theme-token categories',
  '## Allowed candidate surfaces',
  '## Forbidden candidate surfaces',
  '## Single-surface pilot recommendation',
  '## Theme-state and persistence policy',
  '## Accessibility, contrast, and readability requirements',
  '## Reduced-motion and animation requirements',
  '## Focus-visible requirements',
  '## Mobile 375px and desktop requirements',
  '## Local-first and privacy guardrails',
  '## Storage, localStorage, sessionStorage, and telemetry guardrails',
  '## Routing, handlers, data, scheduler, and import guardrails',
  '## Rollback and kill-switch design requirements',
  '## Evidence requirements before any runtime pilot',
  '## Future runtime pilot minimum scope',
  '## Phase 37C release-readiness separation review',
  '## Next candidate comparison table',
  '## Selected candidate',
  '## Why Dynamic Canvas Themes Single-Surface Scope Gate next',
  '## Why this is design gate, not runtime implementation',
  '## Phase 37-uiT allowed files / expected areas',
  '## Phase 37-uiT forbidden areas',
  '## What Phase 37-uiS supports',
  '## What Phase 37-uiS does not approve',
  '## Chosen design gate decision',
  '## Decision rationale',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiS — Dynamic Canvas Themes Design Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Design gate result',
  '## Chosen decision',
  '## Selected candidate',
  '## Dynamic Canvas Themes risk position',
  '## Candidate theme directions',
  '## Single-surface pilot direction',
  '## Theme-state and persistence policy',
  '## Evidence required before runtime',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiT — Dynamic Canvas Themes Single-Surface Scope Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiS',
  '## Scope gate candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Candidate surface selection rules',
  '## Theme-token restrictions',
  '## Theme-state and persistence restrictions',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const THEME_DIRECTIONS = [
  'Calm Study Desk',
  'Morning Paper',
  'Moss Library',
  'Focus Night Preview',
  'Low-contrast Cream',
  'High-contrast Accessible Variant'
];

const ALLOWED_TOKEN_CATEGORIES = [
  'surface color tokens',
  'subtle border tokens',
  'shadow depth tokens',
  'focus ring tokens',
  'non-persistent preview tokens',
  'reduced-motion-safe accent tokens'
];

const FORBIDDEN_TOKEN_CATEGORIES = [
  'persisted user preference tokens',
  'account-synced preference tokens',
  'localStorage/sessionStorage-backed theme tokens',
  'route-dependent theme state',
  'import/scheduler/scoring state tokens',
  'telemetry-driven personalization',
  'AI-generated theme tokens'
];

const ALLOWED_SURFACES = [
  'Dashboard Dynamic Canvas token preview only',
  'one static preview card',
  'one documentation-only preview table',
  'one Storybook-like docs surface if it already exists'
];

const FORBIDDEN_SURFACES = [
  'global app root',
  'body/html global theme',
  'routing shell',
  'all pages at once',
  'Study Room scoring/answer state',
  'storage/import/parser/scheduler surfaces',
  'auth/account/profile surfaces',
  'localStorage/sessionStorage',
  'backend/sync/cloud'
];

const CANDIDATE_ROWS = [
  'Dynamic Canvas Themes Single-Surface Scope Gate',
  'Phase 37C Limited Release Readiness Gap Review',
  'UI Track Archive And Handoff',
  'Dynamic Canvas Themes Research Only',
  'Full Dynamic Canvas Themes Runtime',
  'Full Theme Picker Runtime',
  'Persisted Theme Preferences Runtime',
  'Account-Synced Theme Preferences'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_SCOPE_GATE',
  'NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_RESEARCH',
  'PASS_TO_PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
];

const GUARDRAILS = [
  'BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiS',
  'Dynamic Canvas Themes runtime',
  'full theme picker runtime',
  'persisted theme preferences',
  'account-synced preferences',
  'CSS variable theme engine implementation',
  'global app theme implementation',
  'body/html global theme changes',
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
  'AI-generated themes',
  'replacement of Phase 37C'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiT is scope gate only',
  'Phase 37-uiT is not runtime implementation',
  'must choose at most one low-risk candidate surface',
  'Future Phase 37-uiU, if approved, must be a non-persistent visual preview only',
  'No theme picker',
  'persistence',
  'localStorage/sessionStorage writes',
  'account-synced preferences',
  'CSS variable theme engine',
  'global app theme',
  'route changes',
  'storage/import/parser/scheduler/data changes',
  'packages',
  'telemetry',
  'backend work'
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiS decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiS PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiS allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'Phase 37-uiR validator retained as historical reference; not run as Phase 37-uiS merge-blocking gate.',
    '# node scripts/validate-phase37-uir-ui-backlog-closure-dynamic-canvas-design-gate.js',
    'Validate Phase 37-uiS Dynamic Canvas Themes Design Gate',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/git\s+fetch/.test(workflow)) fail('workflow must not include a shell git fetch step');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiS validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiS validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('Phase 37-uiS tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('candidate theme direction inventory', review, THEME_DIRECTIONS);
  assertIncludes('summary candidate theme directions', summary, THEME_DIRECTIONS);
  assertIncludes('allowed theme-token categories', combined, ALLOWED_TOKEN_CATEGORIES);
  assertIncludes('forbidden theme-token categories', combined, FORBIDDEN_TOKEN_CATEGORIES);
  assertIncludes('allowed candidate surfaces', combined, ALLOWED_SURFACES);
  assertIncludes('forbidden candidate surfaces', combined, FORBIDDEN_SURFACES);
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37-uiT seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37-uiT seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report)\//.test(file)) {
      fail(`Generated artifact must not be part of Phase 37-uiS diff: ${file}`);
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
  console.log(`Phase 37-uiS validator passed (${mode}).`);
}

main();
