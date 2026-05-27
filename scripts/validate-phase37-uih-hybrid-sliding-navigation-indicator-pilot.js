#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const SIDEBAR_FILE = 'src/layout/Sidebar.jsx';
const BOTTOM_NAV_FILE = 'src/layout/BottomNav.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/hybridSlidingNavigationIndicatorPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uih-hybrid-sliding-navigation-indicator-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uih-hybrid-sliding-navigation-indicator-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uii-hybrid-sliding-navigation-indicator-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uih-hybrid-sliding-navigation-indicator-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  SIDEBAR_FILE,
  BOTTOM_NAV_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_STATUS: COMPLETED_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION',
  'PHASE37UIH_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIH_RUNTIME_SCOPE: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_ONLY_NO_ROUTE_OR_HANDLER_BEHAVIOR_CHANGES',
  'PHASE37UIH_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT',
  'PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIH_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'NEEDS_HYBRID_SLIDING_NAVIGATION_INDICATOR_REWORK',
  'HOLD_HYBRID_SLIDING_NAVIGATION_INDICATOR_PILOT_IMPLEMENTATION',
  'PASS_TO_HYBRID_NAVIGATION_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiG and UI plan',
  '## Navigation ownership discovery',
  '## Route and active-state boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted surfaces',
  '## Visual difference summary',
  '## Desktop Sidebar indicator evidence',
  '## Mobile BottomNav indicator evidence',
  '## Active route and NavLink preservation',
  '## Click handler and page rendering preservation',
  '## Focus-visible evidence',
  '## Reduced-motion evidence',
  '## Mobile 375px evidence',
  '## Safe-area evidence',
  '## Desktop evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Phase 37C separation review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 37-uiH supports',
  '## What Phase 37-uiH does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiH — Hybrid Sliding Navigation Indicator Pilot Summary',
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
  '# Phase 37-uiI — Hybrid Sliding Navigation Indicator Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiH',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiI — Hybrid Sliding Navigation Indicator Evidence Review',
  'Phase 37-uiI is evidence review only and is not automatic runtime implementation',
  'Phase 37-uiH confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiH does not approve BETA_READY',
  'Phase 37-uiH does not approve public production readiness',
  'Phase 37-uiH does not approve release-readiness upgrade',
  'Phase 37-uiH does not approve broad UI redesign',
  'Phase 37-uiH does not approve broad navigation rewrite',
  'Phase 37-uiH does not approve route behavior changes',
  'Phase 37-uiH does not approve event handler changes',
  'Phase 37-uiH does not approve `NavLink` destination changes',
  'Phase 37-uiH does not approve router configuration changes',
  'Phase 37-uiH does not approve active page rendering changes',
  'Phase 37-uiH does not approve package/dependency changes',
  'Phase 37-uiH does not approve storage/backup/restore behavior changes',
  'Phase 37-uiH does not approve import/parser behavior changes',
  'Phase 37-uiH does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiH does not approve Study Room scoring/correctness/scheduler/queue/data changes',
  'Phase 37-uiH does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiH does not approve telemetry/network calls',
  'Phase 37-uiH does not approve full Dynamic Canvas Themes',
  'Phase 37-uiH does not approve full theme picker',
  'Phase 37-uiH does not approve persisted theme preferences',
  'Phase 37-uiH does not approve localStorage writes',
  'Phase 37-uiH does not approve Streak Fire',
  'Phase 37-uiH does not approve Collapsible Header',
  'Phase 37C Limited Release Readiness Gap Review remains separate'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiI is evidence review only',
  'Phase 37-uiI is not automatic runtime implementation',
  'desktop Sidebar indicator movement',
  'mobile BottomNav indicator movement',
  'active item readability',
  'active icon/text color',
  'focus-visible',
  'reduced-motion',
  'mobile safe-area',
  '375px no-overflow',
  'route/NavLink preservation',
  'click handler preservation',
  'active route logic',
  'page rendering',
  'E2E smoke/onboarding',
  'Phase 37C separation',
  'HOLD_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'NEEDS_HYBRID_SLIDING_NAVIGATION_INDICATOR_FIXES',
  'PASS_TO_PREMIUM_ELASTIC_TAP_COMPRESSION_SCOPE_GATE',
  'PASS_TO_NAVIGATION_VISUAL_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'must not approve broad navigation rewrite, route changes, release readiness, or Beta Ready'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^tests\/(?!unit\/hybridSlidingNavigationIndicatorPilot\.test\.jsx$)/,
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
      fail(`Unsupported Phase 37-uiH decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiH PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiH PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiH allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiG validator retained as historical reference; not run as Phase 37-uiH merge-blocking gate.',
    'Validate Phase 37-uiH Hybrid Sliding Navigation Indicator Pilot',
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

function assertRuntime(sidebar, bottomNav) {
  assertIncludes('Sidebar runtime', sidebar, [
    'phase37uih-hybrid-sliding-navigation-indicator-pilot--desktop',
    'primaryNavIndicatorHost',
    'primaryNavSlidingIndicator',
    'aria-hidden="true"',
    'useLocation',
    'navRoutes.findIndex',
    'item.path === location.pathname',
    '--phase37uih-active-index',
    'to={item.path}'
  ]);
  assertIncludes('BottomNav runtime', bottomNav, [
    'phase37uih-hybrid-sliding-navigation-indicator-pilot--mobile',
    'phase36b-bottom-nav-touch-pilot',
    'primaryNavIndicatorHost',
    'primaryNavSlidingIndicator',
    'aria-hidden="true"',
    'useLocation',
    'navRoutes.findIndex',
    'item.path === location.pathname',
    '--phase37uih-active-index',
    'to={item.path}'
  ]);
  const runtime = `${sidebar}\n${bottomNav}`;
  for (const pattern of [/onClick=/, /navigate\(/, /localStorage\s*\.\s*(setItem|removeItem|clear)/, /fetch\(/, /sendBeacon/]) {
    if (pattern.test(runtime)) fail(`Navigation runtime contains forbidden behavior pattern: ${pattern}`);
  }
}

function assertCss(css) {
  assertIncludes('CSS', css, [
    '.phase37uih-hybrid-sliding-navigation-indicator-pilot',
    '--phase37uih-nav-cream',
    '--phase37uih-nav-moss',
    '--phase37uih-nav-shadow',
    '--phase37uih-active-index',
    '.sideNav .primaryNavSlidingIndicator',
    '.bottomNav.phase36b-bottom-nav-touch-pilot .primaryNavSlidingIndicator',
    'calc(var(--phase37uih-active-index, var(--nav-active-index, 0)) * var(--nav-item-step, 58px))',
    'calc(var(--phase37uih-active-index, var(--nav-active-index, 0)) * (100% + var(--nav-item-gap, 0px)))',
    '.phase37uih-hybrid-sliding-navigation-indicator-pilot .navItem--active .navItem__icon',
    '.phase37uih-hybrid-sliding-navigation-indicator-pilot .bottomNav__item--active span[aria-hidden=\'true\']',
    '@media (prefers-reduced-motion: reduce)',
    '--phase36b-bottom-nav-safe-area',
    '.navItem:focus-visible',
    '.bottomNav__item:focus-visible'
  ]);
  if (/localStorage\s*\.\s*(setItem|removeItem|clear)|setAttribute\(['"]data-theme/.test(css)) {
    fail('CSS must not contain persistence or theme mutation behavior');
  }
}

function assertDocs(evidence, summary, seed) {
  const docs = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('seed requirements', seed, SEED_REQUIRED_TEXT);
  assertIncludes('scope boundary docs', docs, [
    'Desktop Sidebar active item indicator',
    'Mobile BottomNav active item indicator',
    'src/layout/Sidebar.jsx',
    'src/layout/BottomNav.jsx',
    'route/NavLink preservation',
    'click handler preservation',
    'active route logic',
    'page rendering',
    'pr-diff',
    'post-merge-main',
    'validator-hotfix'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiH approves?\s+BETA_READY/i,
    /Phase 37-uiH approves?\s+public production readiness/i,
    /Phase 37-uiH approves?\s+release-readiness upgrade/i,
    /Phase 37-uiH approves?\s+broad navigation rewrite/i,
    /Phase 37-uiH approves?\s+route behavior changes/i,
    /Phase 37-uiH approves?\s+event handler changes/i,
    /Phase 37-uiH approves?\s+`?NavLink`? destination changes/i,
    /Phase 37-uiH approves?\s+active page rendering changes/i,
    /Phase 37-uiH approves?\s+package\/dependency changes/i,
    /Phase 37-uiH approves?\s+localStorage writes/i,
    /Phase 37-uiH approves?\s+replacement of Phase 37C/i,
    /(changed|updated|modified)\s+(route|NavLink|destination|click handler|active-route|active route|page rendering)/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertTest(test) {
  assertIncludes('unit test', test, [
    'Phase 37-uiH',
    'adds passive Phase 37-uiH host markers',
    'without changing links or handlers',
    'cream and moss sliding-pill treatment',
    'post-merge-main safe'
  ]);
}

function assertValidatorSelfSource(source) {
  if (source.includes(`git(['${'fetch'}`)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable',
    'classifyDiffMode',
    'assertForbiddenChanges'
  ]);
}

function main() {
  assertOriginMainAvailable();
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  for (const file of REQUIRED_FILES) read(file);

  const workflow = read(WORKFLOW_FILE);
  const sidebar = read(SIDEBAR_FILE);
  const bottomNav = read(BOTTOM_NAV_FILE);
  const css = read(CSS_FILE);
  const test = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertRuntime(sidebar, bottomNav);
  assertCss(css);
  assertTest(test);
  assertDocs(evidence, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiH Hybrid Sliding Navigation Indicator Pilot validator passed (${mode}).`);
}

main();
