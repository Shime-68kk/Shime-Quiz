#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  'src/routes/Dashboard.jsx',
  'src/styles/global.css',
  'tests/unit/dashboardCalmHomeTabs.test.jsx',
  'docs/testing/phase35e-dashboard-calm-home-evidence.md',
  'docs/release/phase35e-dashboard-calm-home-summary.md',
  'docs/planning/phase35f-dashboard-calm-home-evidence-review-seed.md',
  'scripts/validate-phase35e-dashboard-calm-home.js',
  '.github/workflows/e2e-smoke.yml'
];

const OPTIONAL_E2E_FILES = [
  'e2e/smoke.spec.js',
  'e2e/onboarding-smoke.spec.js'
];

const EXPECTED_PHASE35E_CHANGED_FILES = [...REQUIRED_FILES];
const VALIDATOR_FILE = 'scripts/validate-phase35e-dashboard-calm-home.js';
const ALLOWED_FILES = new Set([...REQUIRED_FILES, ...OPTIONAL_E2E_FILES]);

const REQUIRED_TOKENS = [
  'PHASE35E_DASHBOARD_CALM_HOME_STATUS: COMPLETED_DASHBOARD_CALM_HOME_IMPLEMENTATION',
  'PHASE35E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35E_RUNTIME_SCOPE: DASHBOARD_LOCAL_UI_SEGMENTATION_ONLY_NO_DATA_OR_SCHEDULER_CHANGES',
  'PHASE35E_DASHBOARD_DEFAULT_VIEW: HOM_NAY_DEFAULT_LEARNER_FACING_CALM_HOME',
  'PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW',
  'NEEDS_DASHBOARD_CALM_HOME_FIXES',
  'HOLD_DASHBOARD_CALM_HOME_IMPLEMENTATION'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35E — Dashboard Calm Home Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35D',
  '## Implementation summary',
  '## Changed files',
  '## Default Hôm nay view evidence',
  '## Nhật ký tiến độ view evidence',
  '## Raw UI state preservation notes',
  '## Existing Dashboard test assumptions',
  '## E2E updates, if any',
  '## Accessibility and keyboard evidence',
  '## Reduced-motion evidence',
  '## Mobile and responsive evidence',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 35E supports',
  '## What Phase 35E does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35E — Dashboard Calm Home Summary',
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
  '# Phase 35F — Dashboard Calm Home Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35E',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
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
  const output = git(['diff', '--name-only', 'origin/main...HEAD']);
  const unstaged = git(['diff', '--name-only']);
  const staged = git(['diff', '--cached', '--name-only']);
  const untracked = git(['ls-files', '--others', '--exclude-standard']);
  return Array.from(new Set(
    `${output}\n${unstaged}\n${staged}\n${untracked}`
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean)
      .filter(file => !/^(node_modules|dist|coverage|test-results|playwright-report)\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();

if (changed.includes('src/dashboard/DashboardLearningDataContext.jsx')) {
  fail('DashboardLearningDataContext.jsx must not be changed.');
}

for (const file of changed) {
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change: ${file}`);
  if (/^(src\/)?(storage|.*\/storage|.*\/backup|.*\/restore|.*\/import|.*\/parser|.*\/scheduler|.*\/fsrs|.*\/sync|.*\/auth|.*\/backend|.*\/telemetry)\//.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';

  const hasPhase35eImplementationDiff = files.some(file => (
    EXPECTED_PHASE35E_CHANGED_FILES.includes(file) && file !== VALIDATOR_FILE
  ));
  if (hasPhase35eImplementationDiff) return 'pr-diff';

  fail(`Unable to classify Phase 35E validator diff mode for changed files: ${files.join(', ')}`);
}

const diffMode = classifyDiffMode(changed);

if (diffMode === 'pr-diff') {
  for (const file of EXPECTED_PHASE35E_CHANGED_FILES) {
    if (!changed.includes(file)) fail(`Phase 35E PR diff must include expected file: ${file}`);
  }
}

if (diffMode === 'validator-hotfix') {
  for (const file of changed) {
    if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35E allowlist: ${file}`);
  }
}

for (const file of changed.filter(file => file.startsWith('e2e/'))) {
  if (!OPTIONAL_E2E_FILES.includes(file)) fail(`Unexpected E2E file changed: ${file}`);
  const e2eText = read(file);
  if (!e2eText.includes('Nhật ký tiến độ')) fail(`${file} must target Nhật ký tiến độ when changed.`);
}

const allPhaseDocs = [
  read('docs/testing/phase35e-dashboard-calm-home-evidence.md'),
  read('docs/release/phase35e-dashboard-calm-home-summary.md'),
  read('docs/planning/phase35f-dashboard-calm-home-evidence-review-seed.md')
].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35E_DASHBOARD_CALM_HOME_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35E_DASHBOARD_CALM_HOME_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35E decision token: ${value}`);
}

assertIncludes('docs/testing/phase35e-dashboard-calm-home-evidence.md', EVIDENCE_HEADINGS);
assertIncludes('docs/release/phase35e-dashboard-calm-home-summary.md', SUMMARY_HEADINGS);
assertIncludes('docs/planning/phase35f-dashboard-calm-home-evidence-review-seed.md', SEED_HEADINGS);
assertIncludes('docs/planning/phase35f-dashboard-calm-home-evidence-review-seed.md', [
  'HOLD_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW',
  'NEEDS_DASHBOARD_CALM_HOME_FIXES',
  'PASS_TO_PHASE35G_NEXT_UI_POLISH_SCOPE'
]);

const workflow = read('.github/workflows/e2e-smoke.yml');
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('node scripts/validate-phase35e-dashboard-calm-home.js')) {
  fail('CI must register Phase 35E validator.');
}
if (!workflow.includes('# node scripts/validate-phase35d-dashboard-deconstruction-research-scope.js')) {
  fail('Phase 35D validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}

const validator = read('scripts/validate-phase35e-dashboard-calm-home.js');
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35E validator must not update remotes internally.');
}

const dashboard = read('src/routes/Dashboard.jsx');
assertIncludes('src/routes/Dashboard.jsx', [
  'Hôm nay',
  'Nhật ký tiến độ',
  'role="tablist"',
  'aria-selected=',
  'hidden={dashboardView !==',
  '<DashboardTodayCard />',
  '<TodayJourneyCard />',
  '<StudyGoalCard />',
  '<HistoryAnalyticsPanel />',
  '<MasteryInsightsPanel />',
  '<ReviewSchedulePanel />',
  '<SmartPracticePanel />',
  '<StudyHistoryPanel compact />'
]);
if (!/useState\(['"]today['"]\)/.test(dashboard)) fail('Dashboard default tab state must be today.');

const css = read('src/styles/global.css');
assertIncludes('src/styles/global.css', [
  '.dashboardCalmTabs',
  '.dashboardCalmTab',
  '.dashboardCalmTab:focus-visible',
  '.dashboardCalmPanel[hidden]',
  '@media (max-width: 560px)',
  '@media (prefers-reduced-motion: reduce)'
]);

const forbiddenApprovalPatterns = [
  /\bBETA_READY\b(?!_NOT_APPROVED)/,
  /public production readiness is approved/i,
  /broad validation is approved/i,
  /stress-tested readiness is approved/i,
  /guaranteed data-loss prevention/i,
  /sync\/cloud\/backend is approved/i,
  /telemetry is approved/i,
  /AI\/OCR is approved/i,
  /Dynamic Canvas Themes implementation is approved/i,
  /broad Dashboard redesign is approved/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

console.log(`validate-phase35e-dashboard-calm-home passed (${diffMode}).`);
