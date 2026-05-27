#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase36j-mobile-accessibility-track-completion-review.md';
const SUMMARY_FILE = 'docs/release/phase36j-mobile-accessibility-track-completion-review-summary.md';
const PHASE37_SEED_FILE = 'docs/planning/phase37-backlog-or-release-readiness-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36j-mobile-accessibility-track-completion-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  PHASE37_SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_STATUS: COMPLETED_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW',
  'PHASE36J_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36J_REVIEW_SCOPE: MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36J_MOBILE_ACCESSIBILITY_TRACK_SCOPE_STATUS: MOBILE_ACCESSIBILITY_TRACK_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW',
  'NEEDS_MOBILE_ACCESSIBILITY_TRACK_FOLLOW_UP_FIXES',
  'HOLD_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW',
  'PASS_TO_ONE_SEPARATE_FUTURE_UI_SCOPE_GATE'
];

const REVIEW_HEADINGS = [
  '# Phase 36J — Mobile/Accessibility Track Completion Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36I',
  '## Review method',
  '## Mobile/accessibility track completion table',
  '## Bottom Navigation pilot review',
  '## Library Mobile Tabs pilot review',
  '## Core Focus-visible pilot review',
  '## Cross-track accessibility and reduced-motion review',
  '## Mobile and 375px evidence review',
  '## E2E smoke and onboarding review',
  '## Evidence boundary review',
  '## Deferred backlog review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen completion decision',
  '## Decision rationale',
  '## What Phase 36J supports',
  '## What Phase 36J does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36J — Mobile/Accessibility Track Completion Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Track surfaces reviewed',
  '## Evidence carried forward',
  '## Limitations carried forward',
  '## Deferred backlog',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const PHASE37_SEED_HEADINGS = [
  '# Phase 37 — Backlog or Limited Release Readiness Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36J',
  '## Review options',
  '## Candidate review tracks',
  '## Evidence required before any readiness upgrade',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const COMPLETION_ROWS = [
  'UI Polish Backlog Review',
  'Mobile Touch Polish Scope Gate',
  'Bottom Navigation pilot',
  'Bottom Navigation evidence review',
  'Library Mobile Tabs pilot',
  'Library evidence review',
  'Core Focus-visible pilot',
  'Core focus-visible evidence review',
  '375px evidence',
  'focus-visible evidence',
  'reduced-motion evidence',
  'E2E smoke/onboarding',
  'static unit-test boundary',
  'physical-device audit limitation',
  'assistive-technology limitation',
  'no accessibility certification',
  'no Beta Ready approval',
  'no runtime changes in Phase 36J',
  'Phase 37 seed'
];

const REQUIRED_GUARDRAILS = [
  'Phase 36J confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36J does not approve BETA_READY.',
  'Phase 36J does not approve Beta Ready',
  'Phase 36J does not approve public production readiness',
  'Phase 36J does not approve broad validation',
  'Phase 36J does not approve stress-tested readiness',
  'Phase 36J does not approve guaranteed data-loss prevention',
  'Phase 36J does not approve accessibility certification',
  'Phase 36J does not approve assistive technology review completion',
  'Phase 36J does not approve physical-device audit completion',
  'Phase 36J does not approve storage/backup/restore behavior changes',
  'Phase 36J does not approve import/parser behavior changes',
  'Phase 36J does not approve sync/cloud/account/auth/backend',
  'Phase 36J does not approve telemetry/network calls',
  'Phase 36J does not approve route behavior changes',
  'Phase 36J does not approve event handler changes',
  'Phase 36J does not approve tab-state changes',
  'Phase 36J does not approve package/dependency changes',
  'Phase 36J does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 36J does not approve Dynamic Canvas Themes',
  'Phase 36J does not approve Streak Fire',
  'Phase 36J does not approve Collapsible Header',
  'Phase 36J does not approve broad UI redesign',
  'Phase 36J does not approve broader mobile/accessibility runtime changes',
  'Phase 36J does not approve automatic next runtime implementation'
];

const PHASE37_REQUIRED_TEXT = [
  'PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED',
  'Phase 37 is review/planning first',
  'does not automatically implement runtime work',
  'does not approve Beta Ready by default',
  'Any readiness upgrade requires broader actual evidence than the current limited evidence.',
  'HOLD_PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW',
  'NEEDS_MORE_ACTUAL_USER_EVIDENCE',
  'PASS_TO_LIMITED_RELEASE_READINESS_REVIEW',
  'PASS_TO_ONE_SEPARATE_FUTURE_UI_SCOPE_GATE',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW'
];

const REQUIRED_REVIEW_TEXT = [
  'Phase 36I reviewed the merged Phase 36H Core Interactive Focus Visible Consistency Pilot evidence',
  'Bottom Navigation Touch Comfort and Safe-Area Pilot',
  'Library Mobile Tabs Touch and Focus',
  'Core Interactive Focus Visible Consistency',
  '375px browser evidence',
  'representative focus-visible evidence',
  'reduced-motion evidence',
  'E2E smoke and onboarding evidence',
  'Physical-device audit completion is not claimed',
  'Assistive technology review completion is not claimed',
  'accessibility certification is not claimed',
  'Phase 37 — Backlog or Limited Release Readiness Review',
  'Phase 37 must be review/planning first',
  'must not automatically implement runtime work',
  'must not automatically implement runtime work or approve Beta Ready'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37-backlog-or-release-readiness-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36j-mobile-accessibility-track-completion-review-summary\.md$)/,
  /^docs\/review\/phase(?!36j-mobile-accessibility-track-completion-review\.md$)/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!36j-mobile-accessibility-track-completion-review\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/,
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
  if (missing.length > 0) fail(`Phase 36J PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36J PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertNoForbiddenClaims(text) {
  const forbiddenClaims = [
    /\bBETA_READY\b\s+(is\s+)?(approved|ready|granted)/i,
    /approves\s+BETA_READY/i,
    /public production readiness approved/i,
    /\bproduction ready\b/i,
    /stress-tested readiness approved/i,
    /guaranteed data-loss prevention approved/i,
    /accessibility certification (complete|completed|approved|passed|claimed)/i,
    /assistive technology review completion (complete|completed|approved|passed|claimed)/i,
    /physical-device audit completion (complete|completed|approved|passed|claimed)/i,
    /Phase 36J (changes(?! no)|changed|modifies|modified) .*(handler|routing|route|tab-state|import|storage|data|scheduler|FSRS|sync|auth|backend|telemetry|package)/i,
    /(approved|approves)\s+(storage|backup|restore|import|parser|sync|cloud|account|auth|backend|telemetry|route|event handler|tab-state|package|dependency|Study Room|scheduler|data)\s+.*changes/i,
    /(implemented|implements)\s+(Dynamic Canvas Themes|Streak Fire|Collapsible Header)/i,
    /Phase 37 .*approves Beta Ready/i,
    /automatic next runtime implementation is approved/i
  ];
  for (const pattern of forbiddenClaims) {
    if (pattern.test(text)) fail(`Docs contain forbidden readiness/product/system claim: ${pattern}`);
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);

for (const file of changed) {
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36J allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36J: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(REVIEW_FILE, COMPLETION_ROWS);
assertIncludes(REVIEW_FILE, REQUIRED_REVIEW_TEXT);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(PHASE37_SEED_FILE, PHASE37_SEED_HEADINGS);
assertIncludes(PHASE37_SEED_FILE, PHASE37_REQUIRED_TEXT);

const docs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(PHASE37_SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 36J decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36J decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36I validator retained as historical reference',
  '# node scripts/validate-phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review.js',
  'Validate Phase 36J Mobile/Accessibility Track Completion Review',
  `node ${VALIDATOR_FILE}`
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const singleLineStepValidatorRuns = workflow
  .split(/\r?\n/)
  .filter(line => /^\s{8}run: node scripts\/validate-phase/.test(line))
  .filter(line => !line.includes('validate-smoke-fixture'));
if (singleLineStepValidatorRuns.length > 0) {
  fail(`Workflow must not use single-line active phase validator runs. Found: ${singleLineStepValidatorRuns.join(', ')}`);
}
const phase36jStepPattern = new RegExp(
  `- name: Validate Phase 36J Mobile/Accessibility Track Completion Review[\\s\\S]*?run: \\|\\n\\s+node ${VALIDATOR_FILE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
);
if (!phase36jStepPattern.test(workflow)) {
  fail('Workflow must run the active Phase 36J validator as the registered CI gate.');
}
const phase36iActiveStepPattern = /- name: Validate Phase 36I Core Interactive Focus Visible Consistency Pilot Evidence Review\s*\n(?:\s+[^\n#][^\n]*\n)*\s+run: \|\s*\n\s+node scripts\/validate-phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review\.js/;
if (phase36iActiveStepPattern.test(workflow)) {
  fail('Phase 36I validator must be commented historical reference only.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 36J validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 36J Mobile/Accessibility Track Completion Review validator passed (${diffMode}).`);
