#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const EVIDENCE_FILE = 'docs/testing/phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review.md';
const SUMMARY_FILE = 'docs/release/phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review-summary.md';
const SEED_FILE = 'docs/planning/phase36j-mobile-accessibility-track-completion-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW',
  'PHASE36I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36I_REVIEW_SCOPE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_SCOPE_STATUS: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW',
  'NEEDS_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_FIXES',
  'HOLD_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36H',
  '## Review method',
  '## Core focus-visible evidence review table',
  '## CSS-only scope review',
  '## Focus-visible ownership review',
  '## Keyboard tab reachability review',
  '## Representative focus-visible control review',
  '## 375px mobile no-overflow review',
  '## Reduced-motion review',
  '## Desktop acceptability review',
  '## Handler/routing/state/data preservation review',
  '## Import/storage/scheduler/sync preservation review',
  '## E2E smoke and onboarding review',
  '## Accessibility claim boundary review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 36I supports',
  '## What Phase 36I does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review Summary',
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
  '# Phase 36J — Mobile/Accessibility Track Completion Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36I',
  '## Track surfaces to review',
  '## Evidence required',
  '## Completion review questions',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'CSS-only implementation scope',
  'no component JSX/runtime logic changes',
  'keyboard tab reachability',
  'primary button focus-visible',
  'nav/link item focus-visible',
  'Dashboard tab focus-visible',
  'Library tab focus-visible',
  'textarea focus-visible',
  '375px no horizontal overflow',
  'reduced-motion behavior',
  'desktop acceptability',
  'handler preservation',
  'routing preservation',
  'tab-state preservation',
  'import behavior preservation',
  'storage/data preservation',
  'scheduler/FSRS preservation',
  'sync/backend/auth/telemetry preservation',
  'package/dependency unchanged',
  'E2E smoke',
  'E2E onboarding',
  'static unit-test evidence boundary',
  'no accessibility certification',
  'no assistive technology review completion',
  'validator post-merge safety',
  'Phase 36J mobile/accessibility track completion review seed'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36J — Mobile/Accessibility Track Completion Review',
  'Phase 36J is a completion review and is not automatic runtime implementation.',
  'Phase 36I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36I does not approve BETA_READY.',
  'Phase 36I does not approve public production readiness.',
  'Phase 36I does not approve broad validation or stress-tested readiness.',
  'Phase 36I does not approve guaranteed data-loss prevention.',
  'Phase 36I does not approve accessibility certification.',
  'Phase 36I does not approve assistive technology review completion.',
  'Phase 36I does not approve storage/backup/restore behavior changes.',
  'Phase 36I does not approve import/parser behavior changes.',
  'Phase 36I does not approve sync/cloud/account/auth/backend.',
  'Phase 36I does not approve telemetry/network calls.',
  'Phase 36I does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36I does not approve route behavior changes.',
  'Phase 36I does not approve event handler changes.',
  'Phase 36I does not approve tab-state changes.',
  'Phase 36I does not approve package/dependency changes.',
  'Phase 36I does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36I does not approve Dynamic Canvas Themes implementation.',
  'Phase 36I does not approve Streak Fire.',
  'Phase 36I does not approve Collapsible Header.',
  'Phase 36I does not approve broad UI redesign.',
  'Phase 36I does not approve broader mobile/accessibility runtime changes.',
  'Phase 36I does not approve automatic next runtime implementation.'
];

const SEED_REQUIRED_TEXT = [
  'PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED',
  'Phase 36J is a completion review and is not automatic runtime implementation.',
  'Phase 36J should review the Phase 36 mobile/accessibility surfaces:',
  'Bottom Navigation Touch Comfort and Safe-Area Pilot',
  'Library Mobile Tabs Touch and Focus Pilot',
  'Core Interactive Focus Visible Consistency Pilot',
  'Phase 36J must not approve Beta Ready or public production readiness by default.',
  'Phase 36J must not approve accessibility certification or assistive technology review completion.',
  'Future Dynamic Canvas Themes, Streak Fire, and Collapsible Header remain separate gates.',
  'HOLD_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW',
  'NEEDS_MOBILE_ACCESSIBILITY_TRACK_FOLLOW_UP_FIXES',
  'PASS_TO_PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW',
  'PASS_TO_ONE_SEPARATE_FUTURE_UI_SCOPE_GATE'
];

const REQUIRED_REVIEW_TEXT = [
  'CSS-only implementation in `src/styles/global.css`',
  'Focus-visible ownership',
  'keyboard Tab reached representative controls',
  'representative focus-visible evidence',
  '375px browser evidence showing no horizontal document overflow',
  'Physical-device audit is not claimed',
  'assistive-technology limitations are explicitly carried forward',
  'Static unit-test evidence boundary is carried forward',
  'did not change event handlers',
  'did not change import/parser behavior',
  'storage/backup/restore behavior',
  'scheduler/FSRS behavior',
  'sync/cloud/account/auth/backend behavior',
  'does not approve accessibility certification',
  'does not approve assistive technology review completion'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36j-mobile-accessibility-track-completion-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36i-core-interactive-focus-visible-consistency-pilot-evidence-review-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!36i-core-interactive-focus-visible-consistency-pilot-evidence-review\.md$)/,
  /^scripts\/validate-phase(?!36i-core-interactive-focus-visible-consistency-pilot-evidence-review\.js$)/,
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
  if (missing.length > 0) fail(`Phase 36I PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36I PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    /Phase 36I (changes(?! no)|changed|modifies|modified) .*(handler|routing|route|tab-state|import|storage|data|scheduler|FSRS|sync|auth|backend|telemetry|package)/i,
    /(approved|approves)\s+(storage|backup|restore|import|parser|sync|cloud|account|auth|backend|telemetry|route|event handler|tab-state|package|dependency|Study Room|scheduler|data)\s+.*changes/i,
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

for (const file of changed) {
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36I allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36I: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(EVIDENCE_FILE, EVIDENCE_ROWS);
assertIncludes(EVIDENCE_FILE, REQUIRED_REVIEW_TEXT);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 36I decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36I decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36H validator retained as historical reference',
  '# node scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js',
  'Validate Phase 36I Core Interactive Focus Visible Consistency Pilot Evidence Review',
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
const phase36iStepPattern = new RegExp(
  `- name: Validate Phase 36I Core Interactive Focus Visible Consistency Pilot Evidence Review[\\s\\S]*?run: \\|\\n\\s+node ${VALIDATOR_FILE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
);
if (!phase36iStepPattern.test(workflow)) {
  fail('Workflow must run the active Phase 36I validator as the registered CI gate.');
}
const phase36hActiveStepPattern = /- name: Validate Phase 36H Core Interactive Focus Visible Consistency Pilot\s*\n(?:\s+[^\n#][^\n]*\n)*\s+run: node scripts\/validate-phase36h-core-interactive-focus-visible-consistency-pilot\.js/;
if (phase36hActiveStepPattern.test(workflow)) {
  fail('Phase 36H validator must not be an active Phase 36I blocker.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 36I validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

const packageChanges = changed.filter(file => /^package(-lock)?\.json$/.test(file));
if (packageChanges.length > 0) fail(`Package files must not be changed: ${packageChanges.join(', ')}`);
const e2eChanges = changed.filter(file => /^e2e\//.test(file));
if (e2eChanges.length > 0) fail(`E2E specs must not be changed: ${e2eChanges.join(', ')}`);

if (/accessibility certification completed|assistive technology review completed/i.test(docs)) {
  fail('Docs must not claim accessibility certification or assistive technology review completion.');
}

console.log(`Phase 36I Core Interactive Focus Visible Consistency Pilot Evidence Review validator passed (${diffMode}).`);
