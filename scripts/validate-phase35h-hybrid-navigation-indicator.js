#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const RUNTIME_FILES = [
  'src/layout/Sidebar.jsx',
  'src/layout/BottomNav.jsx'
];

const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/testing/phase35h-hybrid-navigation-indicator-evidence.md',
  'docs/release/phase35h-hybrid-navigation-indicator-summary.md',
  'docs/planning/phase35i-hybrid-navigation-indicator-evidence-review-seed.md',
  'scripts/validate-phase35h-hybrid-navigation-indicator.js',
  'src/styles/global.css',
  'tests/unit/hybridNavigationIndicator.test.jsx',
  ...RUNTIME_FILES
];

const VALIDATOR_FILE = 'scripts/validate-phase35h-hybrid-navigation-indicator.js';
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE35H_HYBRID_NAVIGATION_INDICATOR_STATUS: COMPLETED_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION',
  'PHASE35H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35H_RUNTIME_SCOPE: PRIMARY_NAVIGATION_VISUAL_INDICATOR_ONLY_NO_ROUTE_BEHAVIOR_CHANGES',
  'PHASE35H_SELECTED_EFFECT: HYBRID_SLIDING_NAVIGATION_INDICATOR',
  'PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'NEEDS_HYBRID_NAVIGATION_INDICATOR_FIXES',
  'HOLD_HYBRID_NAVIGATION_INDICATOR_IMPLEMENTATION'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35H — Hybrid Navigation Indicator Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35G',
  '## Implementation summary',
  '## Changed files',
  '## Navigation component ownership',
  '## Active route detection',
  '## Indicator behavior',
  '## Route behavior preservation',
  '## Desktop browser evidence',
  '## Mobile 375px evidence',
  '## Keyboard and focus evidence',
  '## Reduced-motion evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 35H supports',
  '## What Phase 35H does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35H — Hybrid Navigation Indicator Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing change',
  '## Evidence summary',
  '## Validation summary',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 35I — Hybrid Navigation Indicator Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35H',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_OPTIONS = [
  'HOLD_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'NEEDS_HYBRID_NAVIGATION_INDICATOR_FIXES',
  'PASS_TO_PHASE35J_NEXT_UI_POLISH_SCOPE'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35I — Hybrid Navigation Indicator Evidence Review',
  'Phase 35I is an evidence review and is not automatic next runtime implementation.',
  'Phase 35H confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35H does not approve BETA_READY.',
  'Phase 35H does not approve public production readiness.',
  'Phase 35H does not approve broad validation or stress-tested readiness.',
  'Phase 35H does not approve guaranteed data-loss prevention.',
  'Phase 35H does not approve storage/backup/restore behavior changes.',
  'Phase 35H does not approve sync/cloud/account/auth/backend.',
  'Phase 35H does not approve telemetry/network calls.',
  'Phase 35H does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35H does not approve route behavior changes.',
  'Phase 35H does not approve package/dependency changes.',
  'Phase 35H does not approve broad navigation rewrite.',
  'Phase 35H does not approve Elastic Button Compression implementation.',
  'Phase 35H does not approve Study Room polish.',
  'Phase 35H does not approve Streak Fire.',
  'Phase 35H does not approve Collapsible Header.',
  'Phase 35H does not approve Dynamic Canvas Themes implementation.'
];

const SELECTED_RUNTIME_DOC_STATEMENTS = [
  'Selected runtime files: `src/layout/Sidebar.jsx` and `src/layout/BottomNav.jsx`',
  'Static inspection found that the primary navigation is split between desktop sidebar and mobile bottom navigation'
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

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
  }
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
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
    if (!files.includes(file)) fail(`Phase 35H PR diff must include required file: ${file}`);
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
    if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35H allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35H: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35H: ${file}`);
  if (/^tests\//.test(file) && file !== 'tests/unit/hybridNavigationIndicator.test.jsx') {
    fail(`Unexpected test file changed in Phase 35H: ${file}`);
  }
  if (file === 'src/routes/routeConfig.js') fail('Route definitions must not change in Phase 35H.');
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35H: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35H: ${file}`);
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|database|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35h-hybrid-navigation-indicator-evidence.md';
const summaryFile = 'docs/release/phase35h-hybrid-navigation-indicator-summary.md';
const seedFile = 'docs/planning/phase35i-hybrid-navigation-indicator-evidence-review-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';
const cssFile = 'src/styles/global.css';
const testFile = 'tests/unit/hybridNavigationIndicator.test.jsx';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(seedFile, SEED_OPTIONS);
assertIncludes(evidenceFile, SELECTED_RUNTIME_DOC_STATEMENTS);

const allPhaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35H_HYBRID_NAVIGATION_INDICATOR_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35H_HYBRID_NAVIGATION_INDICATOR_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35H decision token: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!allPhaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const workflow = read(workflowFile);
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('run: node scripts/validate-phase35h-hybrid-navigation-indicator.js')) {
  fail('CI must register Phase 35H validator.');
}
if (!workflow.includes('# node scripts/validate-phase35g-next-ui-polish-scope.js')) {
  fail('Phase 35G validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/validate-phase35g-next-ui-polish-scope\.js/.test(workflow.replace(/# node scripts\/validate-phase35g-next-ui-polish-scope\.js/g, ''))) {
  fail('Prior Phase 35G validator must not remain active as a Phase 35H blocker.');
}
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}
if (/validate-phase\*|validate-phase\{|\bls scripts\/validate-phase|for .*validate-phase|scripts\/validate-phase\d+\*|find .*validate-phase/.test(workflow)) {
  fail('Workflow must not use a full validator glob chain.');
}

const validator = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35H validator must not update remotes internally.');
}
if (!validator.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
  fail('Phase 35H validator must verify origin/main availability.');
}
for (const mode of ['pr-diff', 'post-merge-main', 'validator-hotfix']) {
  if (!validator.includes(mode)) fail(`Phase 35H validator must support ${mode} mode.`);
}

const sidebar = read('src/layout/Sidebar.jsx');
const bottomNav = read('src/layout/BottomNav.jsx');
const runtime = `${sidebar}\n${bottomNav}`;
for (const source of [sidebar, bottomNav]) {
  if (!source.includes('useLocation')) fail('Runtime nav files must use route/location-based active state.');
  if (!source.includes('navRoutes.findIndex')) fail('Runtime nav files must compute an active index from navRoutes.');
  if (!source.includes('item.path === location.pathname')) fail('Runtime nav files must preserve route-path-based active detection.');
  if (!source.includes('primaryNavIndicatorHost')) fail('Runtime nav files must include primaryNavIndicatorHost.');
  if (!source.includes('primaryNavSlidingIndicator')) fail('Runtime nav files must include primaryNavSlidingIndicator.');
  if (!source.includes('to={item.path}')) fail('Runtime nav files must preserve NavLink destinations.');
  if (source.includes('onClick=') || source.includes('navigate(')) fail('Runtime nav files must not change click semantics.');
}
if (!runtime.includes('Tổng quan') && !read('src/routes/routeConfig.js').includes("label: 'Tổng quan'")) {
  fail('Existing nav labels must remain available.');
}
if (runtime.includes('Hôm nay')) fail('Phase 35H must not introduce unrelated non-nav labels.');

const css = read(cssFile);
for (const needle of [
  '.primaryNavIndicatorHost',
  '.primaryNavSlidingIndicator',
  'transform 210ms cubic-bezier(0.2, 0.8, 0.2, 1)',
  'translate3d',
  '.navItem:focus-visible',
  '.bottomNav__item:focus-visible',
  '@media (max-width: 860px)',
  '@media (max-width: 380px)',
  '@media (prefers-reduced-motion: reduce)',
  'transition: none'
]) {
  if (!css.includes(needle)) fail(`CSS missing required indicator/focus/responsive/reduced-motion text: ${needle}`);
}

const unit = read(testFile);
for (const needle of [
  'Hybrid Sliding Navigation Indicator',
  'useLocation',
  'primaryNavSlidingIndicator',
  'to={item.path}',
  'prefers-reduced-motion',
  'does not introduce storage, sync, telemetry, auth, or backend behavior'
]) {
  if (!unit.includes(needle)) fail(`Unit test missing required Phase 35H guard: ${needle}`);
}

const forbiddenApprovalPatterns = [
  /BETA_READY is approved/i,
  /approves BETA_READY/i,
  /Phase 35H approves public production readiness/i,
  /Phase 35H approves broad validation/i,
  /Phase 35H approves stress-tested readiness/i,
  /Phase 35H approves guaranteed data-loss prevention/i,
  /Phase 35H approves storage\/backup\/restore behavior changes/i,
  /Phase 35H approves sync\/cloud\/account\/auth\/backend/i,
  /Phase 35H approves telemetry\/network calls/i,
  /Phase 35H approves built-in AI\/OCR\/API-key\/BYOK behavior/i,
  /Phase 35H approves route behavior changes/i,
  /Phase 35H approves package\/dependency changes/i,
  /Phase 35H approves broad navigation rewrite/i,
  /Phase 35H approves Elastic Button Compression implementation/i,
  /Phase 35H approves Study Room polish/i,
  /Phase 35H approves Streak Fire/i,
  /Phase 35H approves Collapsible Header/i,
  /Phase 35H approves Dynamic Canvas Themes implementation/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

console.log(`validate-phase35h-hybrid-navigation-indicator passed (${diffMode}).`);
