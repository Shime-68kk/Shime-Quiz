#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const DASHBOARD_FILE = 'src/routes/Dashboard.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/dynamicCanvasThemeTokenPreviewPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uib-dynamic-canvas-theme-token-preview-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uib-dynamic-canvas-theme-token-preview-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uic-dynamic-canvas-theme-token-preview-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uib-dynamic-canvas-theme-token-preview-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  DASHBOARD_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_STATUS: COMPLETED_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION',
  'PHASE37UIB_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIB_RUNTIME_SCOPE: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_ONLY_ONE_SURFACE_NO_PERSISTENCE',
  'PHASE37UIB_SELECTED_EFFECT: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT',
  'PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW',
  'NEEDS_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_REWORK',
  'HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiA',
  '## Dashboard ownership discovery',
  '## Theme and persistence boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted surface',
  '## Visual difference summary',
  '## One-surface containment review',
  '## No persistence and localStorage review',
  '## No global theme system review',
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
  '## What Phase 37-uiB supports',
  '## What Phase 37-uiB does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot Summary',
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
  '# Phase 37-uiC — Dynamic Canvas Theme Token Preview Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiB',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_DECISIONS = [
  'HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW',
  'NEEDS_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_FIXES',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiC — Dynamic Canvas Theme Token Preview Evidence Review',
  'Phase 37-uiC is evidence review only and is not automatic runtime implementation',
  'Phase 37-uiB confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiB does not approve BETA_READY',
  'Phase 37-uiB does not approve public production readiness',
  'Phase 37-uiB does not approve full Dynamic Canvas Themes',
  'Phase 37-uiB does not approve a full theme picker',
  'Phase 37-uiB does not approve persisted theme preferences',
  'Phase 37-uiB does not approve localStorage writes',
  'Phase 37-uiB does not approve mutation of the existing theme key',
  'Phase 37-uiB does not approve account-synced preferences',
  'Phase 37-uiB does not approve a global theme system',
  'Phase 37-uiB does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiB does not approve telemetry/network calls',
  'Phase 37-uiB does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 37-uiB does not approve storage/backup/restore behavior changes',
  'Phase 37-uiB does not approve import/parser behavior changes',
  'Phase 37-uiB does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiB does not approve route behavior changes',
  'Phase 37-uiB does not approve event handler changes',
  'Phase 37-uiB does not approve package/dependency changes',
  'Phase 37-uiB does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37-uiB does not approve Streak Fire',
  'Phase 37-uiB does not approve Collapsible Header',
  'Phase 37-uiB does not approve broad UI redesign',
  'Phase 37-uiB does not replace Phase 37C Limited Release Readiness Gap Review'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiC is evidence review only',
  'Phase 37-uiC is not automatic runtime implementation',
  'one-surface containment',
  'no persistence',
  'no localStorage writes',
  'no theme key mutation',
  'contrast/readability',
  'mobile 375px',
  'reduced-motion',
  'focus-visible',
  'desktop behavior',
  'Phase 37C separation',
  'must not approve full Dynamic Canvas Themes',
  'a full theme picker',
  'persisted preferences',
  'release readiness'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(-lock)?\.json$/,
  /^tests\/(?!unit\/dynamicCanvasThemeTokenPreviewPilot\.test\.jsx$)/,
  /^e2e\//,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37-uic-dynamic-canvas-theme-token-preview-evidence-review-seed\.md$)/,
  /^docs\/release\/phase(?!37-uib-dynamic-canvas-theme-token-preview-pilot-summary\.md$)/,
  /^docs\/testing\/phase(?!37-uib-dynamic-canvas-theme-token-preview-pilot-evidence\.md$)/,
  /^scripts\/validate-phase(?!37-uib-dynamic-canvas-theme-token-preview-pilot\.js$)/,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /^src\/routes\/(StudyRoom|Library)\.jsx$/,
  /^src\/layout\/(BottomNav|Sidebar)\.jsx$/,
  /^src\/(App|main)\.jsx$/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/
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
      fail(`Unsupported Phase 37-uiB decision token: ${match[1]}`);
    }
  }
}

function assertOriginMainAvailable() {
  try {
    git(['rev-parse', '--verify', 'origin/main']);
  } catch {
    fail('origin/main is not available locally; update remotes before running this validator');
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
  if (missing.length > 0) fail(`Phase 37-uiB PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiB PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertForbiddenChanges(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }
  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiB allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Validate Phase 37-uiB Dynamic Canvas Theme Token Preview Pilot',
    `node ${VALIDATOR_FILE}`,
    'Phase 37-uiA validator retained as historical reference'
  ]);
  const forbiddenWorkflowFetch = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (workflow.includes(forbiddenWorkflowFetch)) {
    fail('Workflow must not shell out to update origin/main');
  }
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

function stripCssComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '');
}

function assertRuntimeBoundaries(dashboard, css) {
  assertIncludes('Dashboard runtime', dashboard, [
    'className="pageStack phase37uib-dynamic-canvas-token-preview"'
  ]);
  if ((dashboard.match(/phase37uib-dynamic-canvas-token-preview/g) || []).length !== 1) {
    fail('Dashboard should contain exactly one Phase 37-uiB host class occurrence');
  }
  assertIncludes('CSS', css, [
    'Phase 37-uiB',
    '.phase37uib-dynamic-canvas-token-preview',
    '--phase37uib-canvas-wash',
    '--phase37uib-panel-bg',
    '.phase37uib-dynamic-canvas-token-preview .dashboardCalmTab:focus-visible',
    '@media (max-width: 560px)'
  ]);
  const runtime = `${dashboard}\n${stripCssComments(css)}`;
  if (/localStorage\s*\.\s*(setItem|removeItem|clear)|window\.localStorage\s*\.\s*(setItem|removeItem|clear)/.test(runtime)) {
    fail('Runtime pilot must not write localStorage');
  }
  if (/setAttribute\(\s*['"]data-theme['"]|dataset\.theme|THEME_KEY|setTheme|toggleTheme/.test(runtime)) {
    fail('Runtime pilot must not mutate data-theme or the existing theme key');
  }
  if (/ThemePicker|theme picker|persisted theme|account-synced|account synced|global theme system/i.test(runtime)) {
    fail('Runtime pilot must not add picker/preference/global theme system code');
  }
}

function assertDocs(evidence, summary, seed) {
  const docs = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('Phase 37-uiC seed', seed, SEED_DECISIONS);
  assertIncludes('Phase 37-uiC seed scope', seed, SEED_SCOPE_STATEMENTS);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('runtime file documentation', docs, [
    DASHBOARD_FILE,
    'one-surface',
    'no localStorage write',
    'no existing `theme` key mutation',
    'Phase 37C Limited Release Readiness Gap Review'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiB approves?\s+BETA_READY/i,
    /Phase 37-uiB approves?\s+public production readiness/i,
    /Phase 37-uiB approves?\s+full Dynamic Canvas Themes/i,
    /Phase 37-uiB approves?\s+a full theme picker/i,
    /Phase 37-uiB approves?\s+persisted theme preferences/i,
    /Phase 37-uiB approves?\s+localStorage writes/i,
    /Phase 37-uiB approves?\s+account-synced preferences/i,
    /Phase 37-uiB approves?\s+a global theme system/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  const forbiddenFetchPhrase = ['git', 'fetch'].join(' ');
  if (source.includes(forbiddenFetchPhrase)) fail('Validator must not update remotes internally');
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
  const dashboard = read(DASHBOARD_FILE);
  const css = read(CSS_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertRuntimeBoundaries(dashboard, css);
  assertDocs(evidence, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiB Dynamic Canvas Theme Token Preview Pilot validator passed (${mode}).`);
}

main();
