#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-backlog-or-limited-release-readiness-review.md';
const SUMMARY_FILE = 'docs/release/phase37-backlog-or-limited-release-readiness-review-summary.md';
const PHASE37A_SEED_FILE = 'docs/planning/phase37a-broader-actual-evidence-run-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-backlog-or-limited-release-readiness-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  PHASE37A_SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_STATUS: COMPLETED_BACKLOG_OR_RELEASE_READINESS_REVIEW',
  'PHASE37_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37_REVIEW_SCOPE: BACKLOG_OR_RELEASE_READINESS_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37_SELECTED_NEXT_STEP: PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN',
  'PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN',
  'HOLD_PHASE37_BACKLOG_OR_RELEASE_READINESS_REVIEW',
  'NEEDS_MORE_ACTUAL_USER_EVIDENCE',
  'PASS_TO_LIMITED_RELEASE_READINESS_REVIEW',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW',
  'PASS_TO_ONE_SEPARATE_FUTURE_UI_SCOPE_GATE'
];

const REVIEW_HEADINGS = [
  '# Phase 37 — Backlog or Limited Release Readiness Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36J',
  '## Review method',
  '## Current readiness boundary',
  '## Phase 35 and Phase 36 carry-forward summary',
  '## Backlog and readiness option comparison table',
  '## Selected next step',
  '## Why Broader Actual Evidence Run first',
  '## Why this is review/planning, not runtime implementation',
  '## Phase 37A expected scope',
  '## Phase 37A forbidden areas',
  '## Evidence gaps before any readiness upgrade',
  '## Risk assessment',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37 supports',
  '## What Phase 37 does not approve',
  '## Next recommended phase'
];

const OPTION_ROWS = [
  'Broader Actual Evidence Run',
  'Limited Release Readiness Review',
  'Backlog Prioritization Review',
  'One Separate Future UI Scope Gate',
  'Dynamic Canvas Themes Design Gate',
  'Streak Fire Ignition Design Gate',
  'Collapsible Header Scope Gate',
  'Storage/Backup/Restore Design Gate',
  'Sync/Cloud/Account/Auth/Backend Track',
  'Hold For More Evidence'
];

const SUMMARY_HEADINGS = [
  '# Phase 37 — Backlog or Limited Release Readiness Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected next step',
  '## Decision rationale',
  '## Evidence gaps carried forward',
  '## Backlog carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const PHASE37A_SEED_HEADINGS = [
  '# Phase 37A — Broader Actual Evidence Run Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37',
  '## Evidence surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const PHASE37A_REQUIRED_TEXT = [
  'PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_SEED_STATUS: PREPARED_REVIEW_SEED',
  'Phase 37A is evidence planning/execution preparation first',
  'Phase 37A must not approve Beta Ready by default',
  'Any readiness upgrade requires broader actual evidence than current limited evidence',
  'Evidence should use generated/test data only unless explicitly approved',
  'HOLD_BROADER_ACTUAL_EVIDENCE_RUN',
  'NEEDS_MORE_EVIDENCE_PLANNING',
  'PASS_TO_BROADER_ACTUAL_EVIDENCE_RUN_EXECUTION',
  'PASS_TO_LIMITED_RELEASE_READINESS_REVIEW_AFTER_EVIDENCE'
];

const REQUIRED_REVIEW_TEXT = [
  'Phase 36J completed the mobile/accessibility track review',
  'LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 35 completed the core UI plan',
  'Phase 36 completed the mobile/accessibility track',
  '| Option | User value | Evidence need | Risk | Readiness impact | Decision |',
  'Next recommended phase: Phase 37A — Broader Actual Evidence Run.',
  'Phase 37A is evidence planning/execution preparation first and is not automatic runtime implementation.',
  'limited actual user evidence',
  'no broad external validation',
  'no stress-tested readiness',
  'no physical-device audit completion',
  'no assistive-technology review completion',
  'no accessibility certification',
  'no guaranteed data-loss prevention evidence'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37A — Broader Actual Evidence Run.',
  'Phase 37A is evidence planning/execution preparation first and is not automatic runtime implementation.',
  'Phase 37 confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 37 does not approve BETA_READY.',
  'Phase 37 does not approve Beta Ready',
  'Phase 37 does not approve public production readiness',
  'Phase 37 does not approve broad validation',
  'Phase 37 does not approve stress-tested readiness',
  'Phase 37 does not approve guaranteed data-loss prevention',
  'Phase 37 does not approve accessibility certification',
  'Phase 37 does not approve assistive technology review completion',
  'Phase 37 does not approve physical-device audit completion',
  'Phase 37 does not approve storage/backup/restore behavior changes',
  'Phase 37 does not approve import/parser behavior changes',
  'Phase 37 does not approve sync/cloud/account/auth/backend',
  'Phase 37 does not approve telemetry/network calls',
  'Phase 37 does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 37 does not approve route behavior changes',
  'Phase 37 does not approve event handler changes',
  'Phase 37 does not approve tab-state changes',
  'Phase 37 does not approve package/dependency changes',
  'Phase 37 does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37 does not approve Dynamic Canvas Themes implementation',
  'Phase 37 does not approve Streak Fire',
  'Phase 37 does not approve Collapsible Header',
  'Phase 37 does not approve broad UI redesign',
  'Phase 37 does not approve automatic next runtime implementation'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37a-broader-actual-evidence-run-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!37-backlog-or-limited-release-readiness-review-summary\.md$)/,
  /^docs\/review\/phase(?!37-backlog-or-limited-release-readiness-review\.md$)/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!37-backlog-or-limited-release-readiness-review\.js$)/,
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
  if (missing.length > 0) fail(`Phase 37 PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37 PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertNoForbiddenClaims(text) {
  const forbiddenClaims = [
    /\bBETA_READY\b\s+(is\s+)?(approved|ready|granted)/i,
    /approves\s+BETA_READY/i,
    /Beta Ready\s+(is\s+)?(approved|granted)/i,
    /public production readiness approved/i,
    /\bproduction ready\b/i,
    /broad validation approved/i,
    /stress-tested readiness approved/i,
    /guaranteed data-loss prevention approved/i,
    /accessibility certification (complete|completed|approved|passed|claimed)/i,
    /assistive technology review completion (complete|completed|approved|passed|claimed)/i,
    /physical-device audit completion (complete|completed|approved|passed|claimed)/i,
    /Phase 37 (changes(?! no)|changed|modifies|modified) .*(handler|routing|route|tab-state|import|storage|data|scheduler|FSRS|sync|auth|backend|telemetry|package)/i,
    /(approved|approves)\s+(storage|backup|restore|import|parser|sync|cloud|account|auth|backend|telemetry|route|event handler|tab-state|package|dependency|Study Room|scheduler|data)\s+.*changes/i,
    /(implemented|implements)\s+(Dynamic Canvas Themes|Streak Fire|Collapsible Header)/i,
    /automatic next runtime implementation is approved/i,
    /Phase 37A .*approves Beta Ready/i
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
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37 allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 37: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(REVIEW_FILE, OPTION_ROWS);
assertIncludes(REVIEW_FILE, REQUIRED_REVIEW_TEXT);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(PHASE37A_SEED_FILE, PHASE37A_SEED_HEADINGS);
assertIncludes(PHASE37A_SEED_FILE, PHASE37A_REQUIRED_TEXT);

const docs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(PHASE37A_SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 37 decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 37 decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36J validator retained as historical reference',
  '# node scripts/validate-phase36j-mobile-accessibility-track-completion-review.js',
  'Validate Phase 37 Backlog or Limited Release Readiness Review',
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
const phase37StepPattern = new RegExp(
  `- name: Validate Phase 37 Backlog or Limited Release Readiness Review[\\s\\S]*?run: \\|\\n\\s+node ${VALIDATOR_FILE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`
);
if (!phase37StepPattern.test(workflow)) {
  fail('Workflow must run the active Phase 37 validator as the registered CI gate.');
}
const workflowLines = workflow.split(/\r?\n/);
for (let index = 0; index < workflowLines.length; index += 1) {
  const line = workflowLines[index];
  if (!/^\s*- name: Validate Phase (?:[0-9]|3[0-6])(?:\D|$)/.test(line)) continue;
  const window = workflowLines.slice(index, index + 8).join('\n');
  if (/\n\s+run: \|\s*\n\s+node scripts\/validate-phase(?:[0-9]|3[0-6])/.test(window)) {
    fail('Prior phase validators must be commented historical references only.');
  }
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 37 validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 37 Backlog or Limited Release Readiness Review validator passed (${diffMode}).`);
