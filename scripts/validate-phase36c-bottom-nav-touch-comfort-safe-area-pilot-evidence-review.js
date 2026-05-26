#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const EVIDENCE_FILE = 'docs/testing/phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review.md';
const SUMMARY_FILE = 'docs/release/phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review-summary.md';
const SEED_FILE = 'docs/planning/phase36d-mobile-touch-followup-scope-or-backlog-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW',
  'PHASE36C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW',
  'PHASE36C_REVIEW_SCOPE: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_SCOPE_STATUS: BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36D_MOBILE_TOUCH_FOLLOWUP_SCOPE_OR_BACKLOG_REVIEW',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_FIXES',
  'HOLD_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36B',
  '## Review method',
  '## Bottom Navigation evidence review table',
  '## 375px mobile no-overflow review',
  '## Touch target comfort review',
  '## Safe-area behavior and fallback review',
  '## Active route indicator review',
  '## Tap navigation review',
  '## Route and navigation preservation review',
  '## Accessibility and focus-visible review',
  '## Reduced-motion review',
  '## Desktop and sidebar non-impact review',
  '## E2E smoke and onboarding review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 36C supports',
  '## What Phase 36C does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36C — Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Evidence carried forward',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 36D — Mobile Touch Follow-up Scope or Backlog Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36C',
  '## Review options',
  '## Candidate follow-up surfaces',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Review surface | Phase 36B evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim'
];

const TABLE_ROWS = [
  '375px mobile no horizontal overflow',
  'bottom nav touch target comfort',
  'safe-area fallback path',
  'physical device safe-area limitation',
  'active route indicator correctness',
  'tap Library reaches `/library`',
  '`NavLink` destinations unchanged',
  'no click handler changes',
  'active-route logic unchanged',
  'page rendering outside BottomNav unchanged',
  'focus-visible behavior',
  'reduced-motion behavior',
  'desktop bottom nav hidden',
  'desktop sidebar non-impact',
  'E2E smoke',
  'E2E onboarding',
  'package/dependency unchanged',
  'storage/data/scheduler/import/sync/backend/auth/telemetry unchanged',
  'validator post-merge safety',
  'Phase 36D follow-up scope/backlog review seed'
];

const SEED_OPTIONS = [
  'HOLD_MOBILE_TOUCH_FOLLOWUP_REVIEW',
  'NEEDS_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_FIXES',
  'PASS_TO_ONE_SMALL_MOBILE_TOUCH_FOLLOWUP_SCOPE_GATE',
  'PASS_TO_ACCESSIBILITY_FOCUS_POLISH_SCOPE_GATE'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 36D is a review/scope gate and is not automatic runtime implementation.',
  'Physical-device safe-area validation remains unproven and must be carried forward.',
  'Any future runtime candidate must select exactly one small surface.',
  'Any future runtime candidate must preserve route/data/storage/scheduler/import/sync/backend/auth/telemetry behavior.',
  'Any future runtime candidate must include 375px evidence, touch evidence, focus evidence, reduced-motion evidence, and rollback notes.',
  'Dynamic Canvas Themes, Streak Fire, and Collapsible Header remain separate future gates.'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36D — Mobile Touch Follow-up Scope or Backlog Review',
  'Phase 36D is a review/scope gate and is not automatic runtime implementation.',
  'Phase 36C confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36C does not approve BETA_READY.',
  'Phase 36C does not approve public production readiness.',
  'Phase 36C does not approve broad validation or stress-tested readiness.',
  'Phase 36C does not approve guaranteed data-loss prevention.',
  'Phase 36C does not approve storage/backup/restore behavior changes.',
  'Phase 36C does not approve sync/cloud/account/auth/backend.',
  'Phase 36C does not approve telemetry/network calls.',
  'Phase 36C does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36C does not approve route behavior changes.',
  'Phase 36C does not approve NavLink destination changes.',
  'Phase 36C does not approve click handler changes.',
  'Phase 36C does not approve active-route logic changes.',
  'Phase 36C does not approve page rendering changes outside BottomNav.',
  'Phase 36C does not approve package/dependency changes.',
  'Phase 36C does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36C does not approve Dynamic Canvas Themes implementation.',
  'Phase 36C does not approve Streak Fire.',
  'Phase 36C does not approve Collapsible Header.',
  'Phase 36C does not approve broad UI redesign.',
  'Phase 36C does not approve broader mobile runtime changes.',
  'Phase 36C does not claim physical-device safe-area validation.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36d-mobile-touch-followup-scope-or-backlog-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review\.md$)/,
  /^scripts\/validate-phase(?!36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review\.js$)/,
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
  if (missing.length > 0) fail(`Phase 36C PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36C PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36C allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36C: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(EVIDENCE_FILE, TABLE_COLUMNS);
assertIncludes(EVIDENCE_FILE, TABLE_ROWS);
assertIncludes(SEED_FILE, SEED_OPTIONS);
assertIncludes(SEED_FILE, SEED_SCOPE_STATEMENTS);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const decisionMatches = docs.match(/PHASE36C_BOTTOM_NAV_TOUCH_COMFORT_SAFE_AREA_PILOT_EVIDENCE_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE36C decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36C decision value: ${value}`);
}

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36B validator retained as historical reference',
  '# node scripts/validate-phase36b-bottom-nav-touch-comfort-safe-area-pilot.js',
  'Validate Phase 36C Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review',
  'node scripts/validate-phase36c-bottom-nav-touch-comfort-safe-area-pilot-evidence-review.js'
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
  fail('Workflow must run exactly the active Phase 36C validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\['fetch'/.test(validatorSource) || /execFileSync\('git',\s*\['fetch'/.test(validatorSource)) {
  fail('Phase 36C validator must not execute internal git fetch.');
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

console.log(`Phase 36C Bottom Navigation Touch Comfort and Safe-Area Pilot Evidence Review validator passed (${diffMode}).`);
