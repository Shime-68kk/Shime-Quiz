#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase36a-mobile-touch-polish-scope.js';
const SCOPE_FILE = 'docs/research/phase36a-mobile-touch-polish-scope.md';
const SUMMARY_FILE = 'docs/release/phase36a-mobile-touch-polish-scope-summary.md';
const SEED_FILE = 'docs/planning/phase36b-bottom-nav-touch-comfort-safe-area-pilot-implementation-seed.md';
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  SCOPE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION',
  'NEEDS_MOBILE_TOUCH_POLISH_RESEARCH',
  'HOLD_MOBILE_TOUCH_POLISH_SCOPE'
];

const REQUIRED_TOKENS = [
  'PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_STATUS: COMPLETED_MOBILE_TOUCH_POLISH_SCOPE_GATE',
  'PHASE36A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION: PASS_TO_PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION',
  'PHASE36A_REVIEW_SCOPE: MOBILE_TOUCH_POLISH_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36A_SELECTED_CANDIDATE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT',
  'PHASE36B_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const SCOPE_HEADINGS = [
  '# Phase 36A — Mobile Touch Polish Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36',
  '## Mobile touch review method',
  '## Candidate comparison table',
  '## Selected candidate',
  '## Why Bottom Navigation Touch Comfort and Safe-Area Pilot first',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 36B allowed files / expected areas',
  '## Phase 36B forbidden areas',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and touch evidence requirements',
  '## Risk assessment',
  '## Rollback plan for Phase 36B',
  '## Chosen scope decision',
  '## Decision rationale',
  '## What Phase 36A supports',
  '## What Phase 36A does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36A — Mobile Touch Polish Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Scope result',
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
  '# Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36A',
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
  'Bottom Navigation Touch Comfort and Safe-Area Pilot',
  'Library Bookshelf Mobile Tabs / Workshop Touch Polish',
  'Dashboard Calm Home Mobile Density Polish',
  'Study Room Mobile Answer Feedback Readability Polish',
  'Elastic Button Compression Mobile Touch Follow-up',
  'Accessibility Focus Polish Scope Gate',
  '375px No-Overflow Audit / Fix Candidate',
  'Dynamic Canvas Themes Design Gate',
  'Streak Fire Ignition Design Gate',
  'Collapsible Header Scope Gate'
];

const SEED_OPTIONS = [
  'HOLD_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_IMPLEMENTATION',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_REWORK',
  'PASS_TO_PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 36B is a small runtime pilot',
  'mobile `BottomNav` touch comfort and safe-area behavior only',
  'must not change route definitions',
  '`NavLink` destinations',
  'click handlers',
  'active-route logic',
  'page rendering',
  'storage',
  'data',
  'scheduler/FSRS',
  'import',
  'sync',
  'backend',
  'auth',
  'telemetry',
  'package files',
  'dependencies',
  'Prefer CSS/class adjustments and minimal component-local changes',
  'preserve keyboard/focus-visible behavior',
  'reduced-motion support',
  '375px mobile evidence',
  'safe-area evidence or fallback notes',
  'tap-target/touch comfort evidence',
  'no-horizontal-overflow evidence',
  'E2E smoke/onboarding evidence',
  'must not implement Library, Dashboard, Study Room, Dynamic Canvas Themes, Streak Fire, or Collapsible Header changes'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36B — Bottom Navigation Touch Comfort and Safe-Area Pilot Implementation',
  'Phase 36B is a small runtime pilot and is not approval for broad mobile redesign.',
  'Phase 36A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36A does not approve BETA_READY.',
  'Phase 36A does not approve public production readiness.',
  'Phase 36A does not approve broad validation or stress-tested readiness.',
  'Phase 36A does not approve guaranteed data-loss prevention.',
  'Phase 36A does not approve storage/backup/restore behavior changes.',
  'Phase 36A does not approve sync/cloud/account/auth/backend.',
  'Phase 36A does not approve telemetry/network calls.',
  'Phase 36A does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36A does not approve route behavior changes.',
  'Phase 36A does not approve package/dependency changes.',
  'Phase 36A does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36A does not approve Dynamic Canvas Themes implementation.',
  'Phase 36A does not approve Streak Fire.',
  'Phase 36A does not approve Collapsible Header.',
  'Phase 36A does not approve broad UI redesign.',
  'Phase 36A does not approve new runtime UI implementation.',
  'Phase 36A does not approve mobile runtime changes.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^storage\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36b-bottom-nav-touch-comfort-safe-area-pilot-implementation-seed\.md$)/,
  /^docs\/research\/phase(?!36a-mobile-touch-polish-scope\.md$)/,
  /^docs\/release\/phase(?!36a-mobile-touch-polish-scope-summary\.md$)/,
  /^docs\/review\/phase/,
  /^scripts\/validate-phase(?!36a-mobile-touch-polish-scope\.js$)/,
  /(^|\/)(backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
    if (!files.includes(file)) fail(`Phase 36A PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36A allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36A: ${file}`);
  }
}

assertIncludes(SCOPE_FILE, SCOPE_HEADINGS);
assertIncludes(SCOPE_FILE, TABLE_COLUMNS);
assertIncludes(SCOPE_FILE, CANDIDATE_ROWS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_OPTIONS);
assertIncludes(SEED_FILE, SEED_SCOPE_STATEMENTS);

const phaseDocs = [read(SCOPE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!phaseDocs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!phaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = phaseDocs.match(/PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36A_MOBILE_TOUCH_POLISH_SCOPE_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36A decision value: ${value}`);
}

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36 validator retained as historical reference',
  '# node scripts/validate-phase36-ui-polish-backlog-review.js',
  'Validate Phase 36A Mobile Touch Polish Scope Gate',
  'node scripts/validate-phase36a-mobile-touch-polish-scope.js'
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = (workflow.match(/run:\s*node scripts\/validate-phase[0-9a-z-]+\.js/g) || [])
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes('validate-phase36a-mobile-touch-polish-scope.js')) {
  fail('Workflow must run exactly the active Phase 36A validator and no full historical validator chain.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36A validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

if (/BETA_READY\s+(is\s+)?(approved|ready|granted)|approves\s+BETA_READY/i.test(phaseDocs)) {
  fail('Docs must not approve BETA_READY.');
}
if (/public production readiness approved|production ready|stress-tested readiness approved/i.test(phaseDocs)) {
  fail('Docs must not approve production or stress-tested readiness.');
}
if (/(changed|updated|modified)\s+(answer\s+)?correctness|(changed|updated|modified)\s+scoring|(changed|updated|modified)\s+scheduler|(changed|updated|modified)\s+queue progression|(changed|updated|modified)\s+data persistence/i.test(phaseDocs)) {
  fail('Docs must not claim correctness/scoring/scheduler/queue/data behavior changes.');
}
if (/Phase 36A[^.\n]*(runtime (implementation|change|changes) (is|are) (approved|complete|implemented)|implemented mobile runtime)/i.test(phaseDocs)) {
  fail('Docs must not claim Phase 36A runtime implementation.');
}

console.log(`Phase 36A Mobile Touch Polish Scope validator passed (${diffMode}).`);
