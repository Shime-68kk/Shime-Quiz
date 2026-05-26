#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const SCOPE_FILE = 'docs/research/phase36d-mobile-touch-library-tabs-scope.md';
const SUMMARY_FILE = 'docs/release/phase36d-mobile-touch-library-tabs-scope-summary.md';
const SEED_FILE = 'docs/planning/phase36e-library-mobile-tabs-touch-focus-pilot-implementation-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36d-mobile-touch-library-tabs-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  SCOPE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_STATUS: COMPLETED_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_GATE',
  'PHASE36D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_DECISION: PASS_TO_PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION',
  'PHASE36D_REVIEW_SCOPE: MOBILE_TOUCH_FOLLOWUP_AND_LIBRARY_TABS_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36D_SELECTED_CANDIDATE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT',
  'PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36E_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION',
  'NEEDS_MOBILE_TOUCH_LIBRARY_TABS_RESEARCH',
  'HOLD_MOBILE_TOUCH_FOLLOWUP_SCOPE',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_FIXES'
];

const SCOPE_HEADINGS = [
  '# Phase 36D — Mobile Touch Follow-up and Library Tabs Touch/Focus Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36C',
  '## Why this phase combines follow-up review and scope gate',
  '## Mobile touch follow-up review',
  '## Candidate comparison table',
  '## Selected candidate',
  '## Why Library Mobile Tabs Touch and Focus Pilot first',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 36E allowed files / expected areas',
  '## Phase 36E forbidden areas',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and touch evidence requirements',
  '## Risk assessment',
  '## Rollback plan for Phase 36E',
  '## Chosen scope decision',
  '## Decision rationale',
  '## What Phase 36D supports',
  '## What Phase 36D does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36D — Mobile Touch Follow-up and Library Tabs Touch/Focus Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Follow-up review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Decision rationale',
  '## Candidates deferred',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 36E — Library Mobile Tabs Touch and Focus Pilot Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36D',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and touch requirements',
  '## Validation required',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Candidate | User value | Expected implementation size | Risk | Mobile/accessibility impact | Decision'
];

const CANDIDATE_ROWS = [
  'Library Mobile Tabs Touch and Focus Pilot',
  'Dashboard Calm Home Mobile Density Pilot',
  'Study Room Mobile Answer Feedback Readability Pilot',
  'BottomNav Follow-up Fixes',
  'Accessibility Focus Polish Scope Gate',
  '375px No-Overflow Audit / Fix Candidate',
  'Elastic Button Compression Mobile Touch Follow-up',
  'Dynamic Canvas Themes Design Gate',
  'Streak Fire Ignition Design Gate',
  'Collapsible Header Scope Gate'
];

const SEED_REQUIRED_TEXT = [
  'Phase 36E is a small runtime pilot only.',
  'Phase 36E should target Library mobile tab switcher touch comfort and focus-visible behavior only.',
  'It should target Library mobile tab switcher touch comfort and focus-visible behavior only.',
  'HOLD_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_IMPLEMENTATION',
  'NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_REWORK',
  'PASS_TO_PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW',
  'Preserve tab roles, labels, `aria-selected`, `aria-controls`, panel mounting behavior, raw input preservation, and importStatus visibility.'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36E — Library Mobile Tabs Touch and Focus Pilot Implementation',
  'Phase 36E is a small runtime pilot and is not approval for broad mobile redesign.',
  'Phase 36D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36D does not approve BETA_READY.',
  'Phase 36D does not approve public production readiness.',
  'Phase 36D does not approve broad validation or stress-tested readiness.',
  'Phase 36D does not approve guaranteed data-loss prevention.',
  'Phase 36D does not approve storage/backup/restore behavior changes.',
  'Phase 36D does not approve import/parser behavior changes.',
  'Phase 36D does not approve sync/cloud/account/auth/backend.',
  'Phase 36D does not approve telemetry/network calls.',
  'Phase 36D does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36D does not approve route behavior changes.',
  'Phase 36D does not approve package/dependency changes.',
  'Phase 36D does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36D does not approve Dynamic Canvas Themes implementation.',
  'Phase 36D does not approve Streak Fire.',
  'Phase 36D does not approve Collapsible Header.',
  'Phase 36D does not approve broad UI redesign.',
  'Phase 36D does not approve new runtime UI implementation.',
  'Phase 36D does not approve broader mobile runtime changes.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36e-library-mobile-tabs-touch-focus-pilot-implementation-seed\.md$)/,
  /^docs\/research\/phase(?!36d-mobile-touch-library-tabs-scope\.md$)/,
  /^docs\/release\/phase(?!36d-mobile-touch-library-tabs-scope-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!36d-mobile-touch-library-tabs-scope\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|drop-zone|database|prompt|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /(^|\/)(route|navigation)(\/|$)/i
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
  if (missing.length > 0) fail(`Phase 36D PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36D PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36D allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36D: ${file}`);
  }
}

assertIncludes(SCOPE_FILE, SCOPE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SCOPE_FILE, TABLE_COLUMNS);
assertIncludes(SCOPE_FILE, CANDIDATE_ROWS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);

const docs = [read(SCOPE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = docs.match(/PHASE36D_MOBILE_TOUCH_LIBRARY_TABS_SCOPE_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36D decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36D decision value: ${value}`);
}

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36C validator retained as historical reference',
  '# node scripts/validate-phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review.js',
  'Validate Phase 36D Mobile Touch Follow-up and Library Tabs Touch/Focus Scope Gate',
  'node scripts/validate-phase36d-mobile-touch-library-tabs-scope.js'
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
  fail('Workflow must run exactly the active Phase 36D validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36D validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

if (/(^|[^A-Z_])BETA_READY\s+(is\s+)?(approved|ready|granted)|approves\s+BETA_READY/i.test(docs)) {
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
if (/physical-device safe-area validation (is complete|complete|passed|approved|validated)/i.test(docs)) {
  fail('Docs must not claim physical-device safe-area validation.');
}
if (!/physical-device safe-area validation remains unproven/i.test(docs)) {
  fail('Docs must carry forward the physical-device safe-area limitation.');
}

console.log(`Phase 36D Mobile Touch Follow-up and Library Tabs Touch/Focus Scope Gate validator passed (${diffMode}).`);
