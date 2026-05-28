#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const RUNTIME_FILE = 'src/routes/Dashboard.jsx';
const TEST_FILE = 'tests/unit/dynamicCanvasThemesSingleSurfacePreviewPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uiv-dynamic-canvas-themes-single-surface-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uiu-dynamic-canvas-themes-single-surface-preview-pilot.js';

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
  'PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_IMPLEMENTATION',
  'PHASE37UIU_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIU_RUNTIME_SCOPE: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_ONLY_NO_THEME_STATE_OR_PERSISTENCE_CHANGES',
  'PHASE37UIU_SELECTED_SURFACE: DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW',
  'PHASE37UIU_SELECTED_EFFECT: DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT',
  'PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIU_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_DECISION';
const EXPECTED_DECISION = 'READY_FOR_PHASE37UIV_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_REWORK',
  'HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_PREVIEW_PILOT_IMPLEMENTATION',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiT and UI plan',
  '## Selected Dashboard preview surface discovery',
  '## Theme-state, persistence, routing, storage, and telemetry boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Selected surface',
  '## Selected preview direction',
  '## User-facing visual difference',
  '## Single-surface containment review',
  '## CSS-only theme preview containment review',
  '## Runtime attachment review',
  '## Theme picker and persistence preservation',
  '## Global app theme preservation',
  '## Body/html/root theme preservation',
  '## Routing, handler, and data preservation',
  '## Storage, localStorage, sessionStorage, and telemetry preservation',
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
  '## What Phase 37-uiU supports',
  '## What Phase 37-uiU does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiU — Dynamic Canvas Themes Single-Surface Preview Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## Selected surface',
  '## Selected preview direction',
  '## User-facing visual change',
  '## Evidence summary',
  '## Limitations carried forward',
  '## Theme-state and persistence guardrails',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiV — Dynamic Canvas Themes Single-Surface Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiU',
  '## Review surface',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_EVIDENCE_REVIEW',
  'NEEDS_DYNAMIC_CANVAS_THEMES_SINGLE_SURFACE_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiV — Dynamic Canvas Themes Single-Surface Evidence Review.',
  'Phase 37-uiV is evidence review only and is not automatic runtime implementation.',
  'Phase 37-uiU confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 37-uiU does not approve BETA_READY.',
  'Phase 37-uiU does not approve public production readiness.',
  'Phase 37-uiU does not approve release-readiness upgrade.',
  'Phase 37-uiU does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37-uiU does not approve full theme picker runtime.',
  'Phase 37-uiU does not approve persisted theme preferences.',
  'Phase 37-uiU does not approve account-synced preferences.',
  'Phase 37-uiU does not approve CSS variable theme engine implementation.',
  'Phase 37-uiU does not approve global app theme implementation.',
  'Phase 37-uiU does not approve body/html global theme changes.',
  'Phase 37-uiU does not approve app root theme changes.',
  'Phase 37-uiU does not approve route-dependent theme state.',
  'Phase 37-uiU does not approve storage/backup/restore behavior changes.',
  'Phase 37-uiU does not approve import/parser behavior changes.',
  'Phase 37-uiU does not approve scheduler/FSRS behavior changes.',
  'Phase 37-uiU does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37-uiU does not approve streak calculation changes.',
  'Phase 37-uiU does not approve daily goal logic changes.',
  'Phase 37-uiU does not approve completion logic changes.',
  'Phase 37-uiU does not approve route behavior changes.',
  'Phase 37-uiU does not approve event handler changes.',
  'Phase 37-uiU does not approve NavLink destination changes.',
  'Phase 37-uiU does not approve router configuration changes.',
  'Phase 37-uiU does not approve active page rendering changes.',
  'Phase 37-uiU does not approve package/dependency changes.',
  'Phase 37-uiU does not approve localStorage writes.',
  'Phase 37-uiU does not approve sessionStorage writes.',
  'Phase 37-uiU does not approve sync/cloud/account/auth/backend.',
  'Phase 37-uiU does not approve telemetry/network calls.',
  'Phase 37-uiU does not approve AI-generated themes.',
  'Phase 37-uiU does not replace Phase 37C Limited Release Readiness Gap Review.'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiV is evidence review only.',
  'Phase 37-uiV is not automatic runtime implementation.',
  'selected Dashboard preview surface only',
  'non-persistence',
  'no theme picker',
  'no localStorage/sessionStorage writes',
  'no global app theme',
  'no body/html/root mutation',
  'no CSS variable theme engine',
  'no routing/handler/data/storage/import/scheduler/scoring changes',
  'no telemetry/network calls',
  'contrast/readability',
  'focus-visible',
  'reduced-motion',
  '375px mobile',
  'desktop',
  'E2E smoke/onboarding',
  'rollback',
  'Phase 37C separation',
  'must not approve full Dynamic Canvas Themes',
  'must not approve full theme picker',
  'must not approve persisted preferences',
  'must not approve release readiness',
  'must not approve Beta Ready'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^e2e\//,
  /^tests\/(?!unit\/dynamicCanvasThemesSingleSurfacePreviewPilot\.test\.jsx$)/,
  /^src\/App\.jsx$/,
  /^src\/main\.jsx$/,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiU decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37-uiU must include expected ready decision: ${EXPECTED_DECISION}`);
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
  if (missing.length > 0) fail(`Phase 37-uiU PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiU allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiT validator retained as historical reference; not run as Phase 37-uiU merge-blocking gate.',
    '# node scripts/validate-phase37-uit-dynamic-canvas-themes-single-surface-scope-gate.js',
    'Validate Phase 37-uiU Dynamic Canvas Themes Single-Surface Preview Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (workflow.includes(['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' '))) {
    fail('workflow must not include forbidden shell origin/main fetch');
  }
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiU validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiU validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(evidence, summary, seed) {
  const combined = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('Phase 37-uiV seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37-uiV seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, REQUIRED_GUARDRAILS);
  assertIncludes('selected runtime documentation', combined, [
    RUNTIME_FILE,
    'className="pageStack phase37uib-dynamic-canvas-token-preview phase37uiu-dynamic-canvas-single-surface-preview-pilot"',
    'data-phase37uiu-dynamic-canvas-preview="moss-library"',
    'Moss Library',
    'DASHBOARD_DYNAMIC_CANVAS_TOKEN_PREVIEW'
  ]);
}

function assertRuntime(dashboard) {
  assertIncludes('Dashboard runtime marker', dashboard, [
    'phase37uib-dynamic-canvas-token-preview phase37uiu-dynamic-canvas-single-surface-preview-pilot',
    'data-phase37uiu-dynamic-canvas-preview="moss-library"'
  ]);
  if ((dashboard.match(/phase37uiu-dynamic-canvas-single-surface-preview-pilot/g) || []).length !== 1) {
    fail('Dashboard runtime must contain exactly one Phase 37-uiU preview class marker');
  }
  if ((dashboard.match(/data-phase37uiu-dynamic-canvas-preview/g) || []).length !== 1) {
    fail('Dashboard runtime must contain exactly one Phase 37-uiU preview data marker');
  }
  for (const pattern of [
    /localStorage\s*\.\s*(setItem|removeItem|clear)/,
    /sessionStorage\s*\.\s*(setItem|removeItem|clear)/,
    /setAttribute\(['"]data-theme/,
    /ThemePicker|theme picker|persisted theme|account-synced/i,
    /\bfetch\s*\(|sendBeacon|XMLHttpRequest/
  ]) {
    if (pattern.test(dashboard)) fail(`Dashboard runtime contains forbidden Phase 37-uiU pattern: ${pattern}`);
  }
}

function assertCss(css) {
  assertIncludes('Phase 37-uiU CSS', css, [
    '.phase37uiu-dynamic-canvas-single-surface-preview-pilot[data-phase37uiu-dynamic-canvas-preview=\'moss-library\']',
    '--phase37uiu-moss-library-paper',
    '--phase37uiu-moss-library-moss',
    '--phase37uiu-moss-library-glow',
    'pointer-events: none;',
    '@media (prefers-reduced-motion: reduce)'
  ]);
  if (/(?:^|\n)\s*(body|html|:root|#root)\s*(\[data-theme|\.theme-|--phase37uiu)/i.test(css)) {
    fail('Phase 37-uiU CSS must not mutate body/html/root/app theme behavior');
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
  assertDocs(read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertRuntime(read(RUNTIME_FILE));
  assertCss(read(CSS_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoInternalFetch();
  console.log(`Phase 37-uiU Dynamic Canvas Themes Single-Surface Preview Pilot validator passed (${mode}).`);
}

main();
