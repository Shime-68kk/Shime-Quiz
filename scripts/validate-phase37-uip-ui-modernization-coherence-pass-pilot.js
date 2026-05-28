#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/uiModernizationCoherencePassPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uip-ui-modernization-coherence-pass-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uip-ui-modernization-coherence-pass-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uiq-ui-modernization-coherence-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uip-ui-modernization-coherence-pass-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_STATUS: COMPLETED_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION',
  'PHASE37UIP_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIP_RUNTIME_SCOPE: UI_MODERNIZATION_COHERENCE_PASS_PILOT_ONLY_NO_DESIGN_SYSTEM_OR_RUNTIME_BEHAVIOR_REWRITE',
  'PHASE37UIP_SELECTED_EFFECT: UI_MODERNIZATION_COHERENCE_PASS_PILOT',
  'PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW',
  'NEEDS_UI_MODERNIZATION_COHERENCE_PASS_REWORK',
  'HOLD_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION',
  'PASS_TO_UI_COHERENCE_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiP — UI Modernization Coherence Pass Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiO and UI plan',
  '## Modernized surface discovery',
  '## Runtime and system boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted surfaces',
  '## Visual difference summary',
  '## CSS-only containment review',
  '## Cross-surface coherence review',
  '## Dashboard evidence',
  '## Library evidence',
  '## Study Room evidence',
  '## Navigation evidence',
  '## Tactile action evidence',
  '## Completion micro-moment evidence',
  '## Sidebar/header identity evidence',
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
  '## What Phase 37-uiP supports',
  '## What Phase 37-uiP does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiP — UI Modernization Coherence Pass Pilot Summary',
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
  '# Phase 37-uiQ — UI Modernization Coherence Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiP',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_SURFACES = [
  'Dashboard visual refresh / Dynamic Canvas token preview',
  'Library shelf modern collection cards',
  'Study Room modern answer surface',
  'Hybrid sliding navigation indicator',
  'Premium elastic tap compression',
  'Streak Fire ignition micro-moment',
  'Collapsible avatar/header identity surface'
];

const REQUIRED_CSS_TEXT = [
  'Phase 37-uiP — UI Modernization Coherence Pass Pilot',
  '--phase37uip-coherence-paper',
  '--phase37uip-coherence-border',
  '--phase37uip-coherence-shadow-lg',
  '--phase37uip-coherence-motion',
  '.phase37uib-dynamic-canvas-token-preview',
  '.phase37uid-library-shelf-modern-collection-cards-pilot',
  '.phase37uif-study-room-modern-answer-surface-pilot',
  '.phase37uih-hybrid-sliding-navigation-indicator-pilot',
  '.phase37uil-streak-fire-ignition-micro-moment-pilot',
  '.phase37uin-collapsible-avatar-header-pilot',
  '@media (prefers-reduced-motion: reduce)',
  'transition: none;'
];

const REQUIRED_GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'broad UI redesign',
  'broad design-system rewrite',
  'full Dynamic Canvas Themes',
  'full theme picker',
  'persisted theme preferences',
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
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'localStorage writes',
  'sessionStorage writes',
  'Phase 37C replacement'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiQ is evidence review only and is not automatic runtime implementation',
  'Dashboard visual refresh / Dynamic Canvas token preview',
  'Library shelf modern collection cards',
  'Study Room modern answer surface',
  'Hybrid sliding navigation indicator',
  'tactile actions',
  'completion micro-moment',
  'Sidebar/header identity',
  'selector containment',
  'no design-system rewrite',
  'no theme system',
  'no storage/localStorage/sessionStorage/telemetry writes',
  'no route/handler/data changes',
  'mobile 375px',
  'desktop',
  'focus-visible',
  'reduced-motion',
  'E2E smoke/onboarding',
  'Phase 37C separation',
  'HOLD_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW',
  'NEEDS_UI_MODERNIZATION_COHERENCE_FIXES',
  'PASS_TO_UI_BACKLOG_CLOSURE_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^tests\/(?!unit\/uiModernizationCoherencePassPilot\.test\.jsx$)/,
  /^e2e\//,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/routes\//,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

const FORBIDDEN_RUNTIME_PATTERNS = [
  /localStorage\s*\.\s*setItem/,
  /sessionStorage\s*\.\s*setItem/,
  /setAttribute\(['"]data-theme/i,
  /\bThemePicker\b/i,
  /persisted theme/i,
  /theme picker/i,
  /account-synced/i,
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /navigator\.sendBeacon/
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiP decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiP PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiP allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiO validator retained as historical reference; not run as Phase 37-uiP merge-blocking gate.',
    '# node scripts/validate-phase37-uio-collapsible-avatar-header-evidence-ui-coherence-scope.js',
    'Validate Phase 37-uiP UI Modernization Coherence Pass Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiP validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiP validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
  if (/git\s+fetch/.test(workflow)) fail('workflow must not include a shell git fetch step');
}

function assertCss(css) {
  assertIncludes('global CSS', css, REQUIRED_CSS_TEXT);
  const rootBlocks = [...css.matchAll(/:root\s*\{[^}]*\}/g)].map(match => match[0]);
  if (rootBlocks.some(block => block.includes('--phase37uip-'))) {
    fail('Phase 37-uiP tokens must not be declared as a global :root theme engine');
  }
  if (/Phase 37-uiP[\s\S]*(localStorage|sessionStorage|data-theme|ThemePicker)/i.test(css)) {
    fail('Phase 37-uiP CSS must not reference persistence or theme picker behavior');
  }
  if (!/Phase 37-uiP[\s\S]*prefers-reduced-motion:\s*reduce[\s\S]*transition:\s*none;/.test(css)) {
    fail('Phase 37-uiP CSS must include reduced-motion transition removal');
  }
}

function assertDocs(evidence, summary, seed) {
  assertIncludes('evidence doc headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary doc headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed doc headings', seed, SEED_HEADINGS);
  assertIncludes('Phase 37-uiP docs tokens', `${evidence}\n${summary}\n${seed}`, REQUIRED_TOKENS);
  assertIncludes('Phase 37-uiP docs surfaces', `${evidence}\n${summary}\n${seed}`, REQUIRED_SURFACES);
  assertIncludes('Phase 37-uiP docs guardrails', `${evidence}\n${summary}\n${seed}`, REQUIRED_GUARDRAILS);
  assertIncludes('Phase 37-uiQ seed required text', seed, SEED_REQUIRED_TEXT);
  assertDecisionToken(`${evidence}\n${summary}`);
}

function assertRuntimeBoundary(css, testFile) {
  for (const pattern of FORBIDDEN_RUNTIME_PATTERNS) {
    if (pattern.test(css)) fail(`Forbidden runtime behavior pattern found in CSS: ${pattern}`);
  }
  assertIncludes('unit test', testFile, [
    'post-merge-main',
    'validator-hotfix',
    'pr-diff',
    "git(['rev-parse', '--verify', 'origin/main'])"
  ]);
}

function assertGeneratedArtifactsAbsent(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report)\//.test(file)) {
      fail(`Generated artifact must not be part of Phase 37-uiP diff: ${file}`);
    }
  }
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);

  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);
  assertGeneratedArtifactsAbsent(files);

  const workflow = read(WORKFLOW_FILE);
  const css = read(CSS_FILE);
  const testFile = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);

  assertWorkflow(workflow);
  assertCss(css);
  assertDocs(evidence, summary, seed);
  assertRuntimeBoundary(css, testFile);

  console.log(`Phase 37-uiP validator passed (${mode}).`);
}

main();
