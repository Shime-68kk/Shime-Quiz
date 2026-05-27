#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase36g-mobile-accessibility-track-focus-scope.md';
const SUMMARY_FILE = 'docs/release/phase36g-mobile-accessibility-track-focus-scope-summary.md';
const SEED_FILE = 'docs/planning/phase36h-core-interactive-focus-visible-consistency-pilot-implementation-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36g-mobile-accessibility-track-focus-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36G_MOBILE_ACCESSIBILITY_TRACK_SCOPE_STATUS: COMPLETED_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_AND_FOCUS_SCOPE_GATE',
  'PHASE36G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36G_REVIEW_SCOPE: MOBILE_ACCESSIBILITY_TRACK_COMPLETION_AND_FOCUS_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36G_SELECTED_CANDIDATE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT',
  'PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE36G_MOBILE_ACCESSIBILITY_TRACK_SCOPE_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION',
  'HOLD_MOBILE_ACCESSIBILITY_TRACK_REVIEW',
  'NEEDS_ACCESSIBILITY_FOCUS_RESEARCH',
  'PASS_TO_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW'
];

const REVIEW_HEADINGS = [
  '# Phase 36G — Mobile/Accessibility Track Completion and Accessibility Focus Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36F',
  '## Why this phase combines completion review and focus scope gate',
  '## Mobile/touch track completion review',
  '## Candidate next-step comparison table',
  '## Selected candidate',
  '## Why Core Interactive Focus Visible Consistency Pilot first',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 36H allowed files / expected areas',
  '## Phase 36H forbidden areas',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and keyboard evidence requirements',
  '## Risk assessment',
  '## Rollback plan for Phase 36H',
  '## Chosen scope decision',
  '## Decision rationale',
  '## What Phase 36G supports',
  '## What Phase 36G does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36G — Mobile/Accessibility Track Completion and Accessibility Focus Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Completion review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Decision rationale',
  '## Candidates deferred',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails'
];

const SEED_HEADINGS = [
  '# Phase 36H — Core Interactive Focus Visible Consistency Pilot Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36G',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility and reduced-motion requirements',
  '## Mobile and keyboard requirements',
  '## Validation required',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const CANDIDATE_ROWS = [
  'Close current mobile/touch track as sufficient for now',
  'Core Interactive Focus Visible Consistency Pilot',
  'Accessibility Focus Polish Scope Gate with more research',
  '375px No-Overflow Audit / Fix Candidate',
  'Dashboard Calm Home Mobile Density Pilot',
  'Study Room Mobile Answer Feedback Readability Pilot',
  'Elastic Button Compression Mobile Touch Follow-up',
  'Dynamic Canvas Themes Design Gate',
  'Streak Fire Ignition Design Gate',
  'Collapsible Header Scope Gate'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36H — Core Interactive Focus Visible Consistency Pilot Implementation',
  'Phase 36H is a small runtime pilot and is not approval for broad accessibility redesign.',
  'Phase 36G confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36G does not approve BETA_READY.',
  'Phase 36G does not approve public production readiness.',
  'Phase 36G does not approve broad validation or stress-tested readiness.',
  'Phase 36G does not approve guaranteed data-loss prevention.',
  'Phase 36G does not approve storage/backup/restore behavior changes.',
  'Phase 36G does not approve import/parser behavior changes.',
  'Phase 36G does not approve sync/cloud/account/auth/backend.',
  'Phase 36G does not approve telemetry/network calls.',
  'Phase 36G does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36G does not approve route behavior changes.',
  'Phase 36G does not approve package/dependency changes.',
  'Phase 36G does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36G does not approve accessibility certification.',
  'Phase 36G does not approve assistive technology review completion.',
  'Phase 36G does not approve Dynamic Canvas Themes implementation.',
  'Phase 36G does not approve Streak Fire.',
  'Phase 36G does not approve Collapsible Header.',
  'Phase 36G does not approve broad UI redesign.',
  'Phase 36G does not approve new runtime UI implementation.',
  'Phase 36G does not approve broader mobile/accessibility runtime changes.'
];

const SEED_REQUIRED_TEXT = [
  'PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED',
  'Phase 36H is a small runtime pilot only.',
  'It should target focus-visible consistency for existing core interactive controls only',
  'should prefer CSS-only or CSS/class-only changes',
  'must not change event handlers, routing, tab state, import behavior, storage, scheduler/FSRS, data, sync/backend/auth, telemetry, package files, dependencies, or page content',
  'Do not remove browser default focus semantics.',
  'must preserve reduced-motion behavior',
  'keyboard tab evidence',
  'focus-visible evidence',
  '375px mobile evidence',
  'reduced-motion evidence',
  'desktop evidence',
  'E2E smoke evidence',
  'E2E onboarding evidence',
  'rollback notes',
  'HOLD_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION',
  'NEEDS_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_REWORK',
  'PASS_TO_PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW',
  'must not implement Dynamic Canvas Themes, Streak Fire, Collapsible Header, broad mobile redesign, broad accessibility redesign, accessibility certification, or assistive technology review completion'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36h-core-interactive-focus-visible-consistency-pilot-implementation-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36g-mobile-accessibility-track-focus-scope-summary\.md$)/,
  /^docs\/review\/phase(?!36g-mobile-accessibility-track-focus-scope\.md$)/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!36g-mobile-accessibility-track-focus-scope\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /^src\/routes\//,
  /^src\/layout\//,
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
  if (missing.length > 0) fail(`Phase 36G PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36G PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    /Phase 36G (implements|implemented|ships|shipped|changes) .*runtime/i,
    /Phase 36G (changes|changed|modifies|modified) .*behavior/i,
    /(approved|approves)\s+(storage|backup|restore|import|parser|sync|cloud|account|auth|backend|telemetry|route|package|dependency|Study Room|scheduler|data)\s+.*changes/i,
    /(implemented|implements)\s+(Dynamic Canvas Themes|Streak Fire|Collapsible Header)/i
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

if (diffMode === 'validator-hotfix') {
  for (const file of changed) {
    if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36G allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36G: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);

assertIncludes(REVIEW_FILE, [
  'Candidate | User value | Expected implementation size | Risk | Accessibility/mobile impact | Decision',
  ...CANDIDATE_ROWS
]);

const docs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 36G decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36G decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36F validator retained as historical reference',
  '# node scripts/validate-phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review.js',
  'Validate Phase 36G Mobile/Accessibility Track Completion and Focus Scope Gate',
  `node ${VALIDATOR_FILE}`
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
  fail('Workflow must run exactly the active Phase 36G validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 36G validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 36G Mobile/Accessibility Track Completion and Focus Scope Gate validator passed (${diffMode}).`);
