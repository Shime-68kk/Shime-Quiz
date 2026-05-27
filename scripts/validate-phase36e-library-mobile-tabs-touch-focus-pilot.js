#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const LIBRARY_FILE = 'src/routes/Library.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/libraryMobileTabsTouchFocusPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase36e-library-mobile-tabs-touch-focus-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase36e-library-mobile-tabs-touch-focus-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36e-library-mobile-tabs-touch-focus-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  LIBRARY_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);
const SELECTED_RUNTIME_FILES = [LIBRARY_FILE];

const REQUIRED_TOKENS = [
  'PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_STATUS: COMPLETED_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION',
  'PHASE36E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36E_RUNTIME_SCOPE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_ONLY_NO_IMPORT_OR_STORAGE_BEHAVIOR_CHANGES',
  'PHASE36E_SELECTED_EFFECT: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT',
  'PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW',
  'NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_FIXES',
  'HOLD_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36E — Library Mobile Tabs Touch and Focus Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36D',
  '## Library tab ownership discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted Library tab surfaces',
  '## Tab semantics preservation',
  '## Import and storage behavior preservation',
  '## Panel mounting and raw input preservation',
  '## ImportStatus visibility preservation',
  '## 375px mobile evidence',
  '## Touch comfort and tap target evidence',
  '## Keyboard and focus-visible evidence',
  '## Reduced-motion evidence',
  '## Desktop non-impact review',
  '## E2E impact',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 36E supports',
  '## What Phase 36E does not approve'
];

const SUMMARY_HEADINGS = [
  '# Phase 36E — Library Mobile Tabs Touch and Focus Pilot Summary',
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
  '# Phase 36F — Library Mobile Tabs Touch and Focus Pilot Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36E',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const SEED_REQUIRED_TEXT = [
  'HOLD_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW',
  'NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_FIXES',
  'PASS_TO_PHASE36G_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_OR_NEXT_SCOPE',
  'Phase 36F is an evidence review and is not automatic next runtime implementation.'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36F — Library Mobile Tabs Touch and Focus Pilot Evidence Review',
  'Phase 36F is an evidence review and is not automatic next runtime implementation.',
  'Phase 36E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36E does not approve BETA_READY.',
  'Phase 36E does not approve public production readiness.',
  'Phase 36E does not approve broad validation or stress-tested readiness.',
  'Phase 36E does not approve guaranteed data-loss prevention.',
  'Phase 36E does not approve storage/backup/restore behavior changes.',
  'Phase 36E does not approve import/parser behavior changes.',
  'Phase 36E does not approve file import behavior changes.',
  'Phase 36E does not approve schema behavior changes.',
  'Phase 36E does not approve demo sample behavior changes.',
  'Phase 36E does not approve EduGen/draft workshop logic changes.',
  'Phase 36E does not approve stored data changes.',
  'Phase 36E does not approve sync/cloud/account/auth/backend.',
  'Phase 36E does not approve telemetry/network calls.',
  'Phase 36E does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36E does not approve route behavior changes.',
  'Phase 36E does not approve package/dependency changes.',
  'Phase 36E does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36E does not approve Dynamic Canvas Themes implementation.',
  'Phase 36E does not approve Streak Fire.',
  'Phase 36E does not approve Collapsible Header.',
  'Phase 36E does not approve broad UI redesign.',
  'Phase 36E does not approve broader mobile runtime changes.'
];

const PRESERVATION_TEXT = [
  'tab roles',
  'labels',
  'aria-selected',
  'aria-controls',
  'panel mounting',
  'raw input preservation',
  'importStatus visibility'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(-lock)?\.json$/,
  /^e2e\//,
  /^tests\/(?!unit\/libraryMobileTabsTouchFocusPilot\.test\.jsx$)/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36f-library-mobile-tabs-touch-focus-pilot-evidence-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36e-library-mobile-tabs-touch-focus-pilot-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!36e-library-mobile-tabs-touch-focus-pilot-evidence\.md$)/,
  /^scripts\/validate-phase(?!36e-library-mobile-tabs-touch-focus-pilot\.js$)/,
  /^src\/(?!routes\/Library\.jsx$|styles\/global\.css$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /^src\/routes\/StudyRoom\.jsx$/,
  /^src\/layout\/(BottomNav|Sidebar)\.jsx$/,
  /^src\/(App|main)\.jsx$/
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
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 36E PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36E PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36E allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36E: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
for (const text of PRESERVATION_TEXT) {
  if (!docs.includes(text)) fail(`Docs must mention preservation of ${text}.`);
}
for (const file of SELECTED_RUNTIME_FILES) {
  if (!docs.includes(`Selected runtime file: ${file}`)) {
    fail(`Docs must document exact selected runtime file: ${file}`);
  }
}

const decisionMatches = docs.match(/PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36E decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36E decision value: ${value}`);
}

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36D validator retained as historical reference',
  '# node scripts/validate-phase36d-mobile-touch-library-tabs-scope.js',
  'Validate Phase 36E Library Mobile Tabs Touch and Focus Pilot',
  'node scripts/validate-phase36e-library-mobile-tabs-touch-focus-pilot.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = workflow
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.startsWith('run: node scripts/validate-phase'))
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes(VALIDATOR_FILE)) {
  fail('Workflow must run exactly the active Phase 36E validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36E validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

const library = read(LIBRARY_FILE);
assertIncludes(LIBRARY_FILE, [
  'className="libraryTabList phase36e-library-tabs-touch-pilot"',
  'role="tablist"',
  'role="tab"',
  'Kệ sách của tôi',
  'Xưởng nạp tài liệu',
  "aria-selected={libraryTab === 'shelf'}",
  "aria-selected={libraryTab === 'workshop'}",
  'aria-controls="library-panel-shelf"',
  'aria-controls="library-panel-workshop"',
  'id="library-panel-shelf"',
  'id="library-panel-workshop"',
  "hidden={libraryTab !== 'shelf'}",
  "hidden={libraryTab !== 'workshop'}",
  'importStatus ? <Toast'
]);
if ((library.match(/phase36e-library-tabs-touch-pilot/g) || []).length !== 1) {
  fail('Phase 36E runtime class must be scoped to the Library tablist.');
}

const css = read(CSS_FILE);
assertIncludes(CSS_FILE, [
  'Phase 36E',
  '.phase36e-library-tabs-touch-pilot',
  '.phase36e-library-tabs-touch-pilot .libraryTab:focus-visible',
  'min-height: 48px',
  'min-width: 44px',
  'touch-action: manipulation',
  '@media (max-width: 560px)',
  'overflow-wrap: anywhere',
  '@media (prefers-reduced-motion: reduce)',
  'transition: none'
]);

if (/(^|[^A-Z_])BETA_READY\s+(is\s+)?(approved|ready|granted)|approves\s+BETA_READY/i.test(docs)) {
  fail('Docs must not approve BETA_READY.');
}
if (/public production readiness approved|production ready|stress-tested readiness approved/i.test(docs)) {
  fail('Docs must not approve production or stress-tested readiness.');
}
if (/(changed|updated|modified)\s+(import|parser|storage|backup|restore|schema|demo sample|EduGen|stored data)\s+behavior/i.test(docs)) {
  fail('Docs must not claim import/storage/parser/backup/restore/schema/demo/EduGen behavior changes.');
}

console.log(`Phase 36E Library Mobile Tabs Touch and Focus Pilot validator passed (${diffMode}).`);
