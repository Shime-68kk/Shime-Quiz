#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js';
const BOTTOM_NAV_FILE = 'src/layout/BottomNav.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/bottomNavTouchComfortSafeAreaPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase36b-bottom-nav-touch-comfort-safe-area-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase36b-bottom-nav-touch-comfort-safe-area-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review-seed.md';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const SELECTED_RUNTIME_FILES = [
  BOTTOM_NAV_FILE,
  CSS_FILE
];

const REQUIRED_FILES = [
  BOTTOM_NAV_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE,
  WORKFLOW_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_FIXES',
  'HOLD_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION'
];

const REQUIRED_TOKENS = [
  'PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_STATUS: COMPLETED_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION',
  'PHASE36B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_DECISION: READY_FOR_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW',
  'PHASE36B_RUNTIME_SCOPE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_ONLY_NO_ROUTE_OR_HANDLER_CHANGES',
  'PHASE36B_SELECTED_EFFECT: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT',
  'PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36A',
  '## BottomNav ownership discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted bottom navigation surfaces',
  '## Route and navigation behavior preservation',
  '## Safe-area behavior evidence',
  '## 375px mobile evidence',
  '## Touch comfort and tap target evidence',
  '## Active and pressed state evidence',
  '## Keyboard and focus evidence',
  '## Reduced-motion evidence',
  '## Desktop and sidebar non-impact review',
  '## E2E impact',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 36B supports',
  '## What Phase 36B does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing change',
  '## Evidence summary',
  '## Validation summary',
  '## Limitations carried forward'
];

const SEED_HEADINGS = [
  '# Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36B',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_OPTIONS = [
  'HOLD_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_FIXES',
  'PASS_TO_PHASE36D_MOBILE_TOUCH_POLISH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review',
  'Phase 36C is an evidence review and is not automatic next runtime implementation.',
  'Phase 36B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36B does not approve BETA_READY.',
  'Phase 36B does not approve public production readiness.',
  'Phase 36B does not approve broad validation or stress-tested readiness.',
  'Phase 36B does not approve guaranteed data-loss prevention.',
  'Phase 36B does not approve storage/backup/restore behavior changes.',
  'Phase 36B does not approve sync/cloud/account/auth/backend.',
  'Phase 36B does not approve telemetry/network calls.',
  'Phase 36B does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36B does not approve route behavior changes.',
  'Phase 36B does not approve NavLink destination changes.',
  'Phase 36B does not approve click handler changes.',
  'Phase 36B does not approve active-route logic changes.',
  'Phase 36B does not approve page rendering changes outside bottom navigation.',
  'Phase 36B does not approve package/dependency changes.',
  'Phase 36B does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36B does not approve Dynamic Canvas Themes implementation.',
  'Phase 36B does not approve Streak Fire.',
  'Phase 36B does not approve Collapsible Header.',
  'Phase 36B does not approve broad UI redesign.',
  'Phase 36B does not approve broader mobile runtime changes.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(-lock)?\.json$/,
  /^tests\/(?!unit\/bottomNavTouchComfortSafeAreaPilot\.test\.jsx$)/,
  /^e2e\//,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36b-bottom-nav-touch-comfort-safe-area-pilot-summary\.md$)/,
  /^docs\/review\/phase/,
  /^scripts\/validate-phase(?!36b-bottom-nav-touch-comfort-safe-area-pilot\.js$)/,
  /^src\/routes\//,
  /^src\/App\.jsx$/,
  /^src\/main\.jsx$/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  throw new Error(message);
}

function rel(file) {
  return path.resolve(ROOT, file);
}

function read(file) {
  const fullPath = rel(file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
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
      .filter(file => !/^(node_modules|dist|coverage|test-results|playwright-report)\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  for (const file of REQUIRED_FILES) {
    if (!files.includes(file)) fail(`Phase 36B PR diff must include required file: ${file}`);
  }
  return 'pr-diff';
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);

if (diffMode === 'validator-hotfix') {
  for (const file of changed) {
    if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36B allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36B: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_OPTIONS);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
for (const file of SELECTED_RUNTIME_FILES) {
  if (!docs.includes(file)) fail(`Selected runtime file is not documented: ${file}`);
}

const decisionMatches = docs.match(/PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36B decision value: ${value}`);
}

const bottomNav = read(BOTTOM_NAV_FILE);
assertIncludes(BOTTOM_NAV_FILE, [
  'phase36b-bottom-nav-touch-pilot',
  'navRoutes.findIndex',
  'item.path === location.pathname',
  'to={item.path}',
  '--nav-active-index',
  '--nav-item-count'
]);
if (/onClick=|navigate\(/.test(bottomNav)) fail('BottomNav must not add click handlers or imperative navigation.');

const css = read(CSS_FILE);
assertIncludes(CSS_FILE, [
  '.bottomNav.phase36b-bottom-nav-touch-pilot',
  '--phase36b-bottom-nav-safe-area',
  'var(--bottom-nav-safe-area, 0px)',
  'calc(10px + var(--phase36b-bottom-nav-safe-area))',
  '.bottomNav__item:focus-visible',
  '@media (prefers-reduced-motion: reduce)'
]);
if (!/\.bottomNav\.phase36b-bottom-nav-touch-pilot \.bottomNav__item[\s\S]*min-height:\s*52px/.test(css)) {
  fail('Phase 36B CSS must include a scoped comfortable bottom nav item min-height.');
}
if (!/\.primaryNavSlidingIndicator,[\s\S]*\.bottomNav__item[\s\S]*transition:\s*none;/.test(css)) {
  fail('Reduced-motion block must cover bottom nav item and indicator transitions.');
}

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36A validator retained as historical reference',
  '# node scripts/validate-phase36a-mobile-touch-polish-scope.js',
  'Validate Phase 36B Bottom Navigation Touch Comfort and Safe-Area Pilot',
  'node scripts/validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js')) {
  fail('Workflow must run exactly the active Phase 36B validator and no full historical validator chain.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36B validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'SELECTED_RUNTIME_FILES',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

if (/BETA_READY\s+(is\s+)?(approved|ready|granted)|approves\s+BETA_READY/i.test(docs)) {
  fail('Docs must not approve BETA_READY.');
}
if (/public production readiness approved|production ready|stress-tested readiness approved/i.test(docs)) {
  fail('Docs must not approve production or stress-tested readiness.');
}
if (/(changed|updated|modified)\s+(route|NavLink|destination|click handler|active-route|active route|page rendering)/i.test(docs)) {
  fail('Docs must not claim route/NavLink/handler/active-route/page rendering changes.');
}
if (/(changed|updated|modified)\s+(answer\s+)?correctness|(changed|updated|modified)\s+scoring|(changed|updated|modified)\s+scheduler|(changed|updated|modified)\s+queue progression|(changed|updated|modified)\s+data persistence/i.test(docs)) {
  fail('Docs must not claim correctness/scoring/scheduler/queue/data behavior changes.');
}

console.log(`Phase 36B Bottom Navigation Touch Comfort and Safe-Area Pilot validator passed (${diffMode}).`);
