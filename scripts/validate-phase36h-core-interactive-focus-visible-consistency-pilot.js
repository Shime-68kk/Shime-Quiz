#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const UNIT_TEST_FILE = 'tests/unit/coreInteractiveFocusVisibleConsistencyPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase36h-core-interactive-focus-visible-consistency-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase36h-core-interactive-focus-visible-consistency-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase36i-core-interactive-focus-visible-consistency-pilot-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36h-core-interactive-focus-visible-consistency-pilot.js';

const REQUIRED_FILES = [
  CSS_FILE,
  UNIT_TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE,
  WORKFLOW_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_STATUS: COMPLETED_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION',
  'PHASE36H_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36H_RUNTIME_SCOPE: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_ONLY_NO_HANDLER_OR_ROUTING_CHANGES',
  'PHASE36H_SELECTED_EFFECT: CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT',
  'PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED'
];

const DECISION_TOKEN = 'PHASE36H_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW',
  'NEEDS_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_FIXES',
  'HOLD_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_IMPLEMENTATION'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36H — Core Interactive Focus Visible Consistency Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36G',
  '## Focus-visible ownership discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted interactive surfaces',
  '## Handler and routing preservation',
  '## State and data preservation',
  '## Keyboard tab evidence',
  '## Focus-visible evidence',
  '## 375px mobile evidence',
  '## Reduced-motion evidence',
  '## Desktop evidence',
  '## E2E impact',
  '## Accessibility claim boundary',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 36H supports',
  '## What Phase 36H does not approve'
];

const SUMMARY_HEADINGS = [
  '# Phase 36H — Core Interactive Focus Visible Consistency Pilot Summary',
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
  '# Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36H',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36I — Core Interactive Focus Visible Consistency Pilot Evidence Review',
  'Phase 36I is an evidence review and is not automatic next runtime implementation.',
  'Phase 36H confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36H does not approve BETA_READY.',
  'Phase 36H does not approve public production readiness.',
  'Phase 36H does not approve broad validation or stress-tested readiness.',
  'Phase 36H does not approve guaranteed data-loss prevention.',
  'Phase 36H does not approve accessibility certification.',
  'Phase 36H does not approve assistive technology review completion.',
  'Phase 36H does not approve storage/backup/restore behavior changes.',
  'Phase 36H does not approve import/parser behavior changes.',
  'Phase 36H does not approve sync/cloud/account/auth/backend.',
  'Phase 36H does not approve telemetry/network calls.',
  'Phase 36H does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36H does not approve route behavior changes.',
  'Phase 36H does not approve event handler changes.',
  'Phase 36H does not approve tab-state changes.',
  'Phase 36H does not approve package/dependency changes.',
  'Phase 36H does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36H does not approve Dynamic Canvas Themes implementation.',
  'Phase 36H does not approve Streak Fire.',
  'Phase 36H does not approve Collapsible Header.',
  'Phase 36H does not approve broad UI redesign.',
  'Phase 36H does not approve broader mobile/accessibility runtime changes.'
];

const SEED_REQUIRED_TEXT = [
  'PHASE36I_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
  'HOLD_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_EVIDENCE_REVIEW',
  'NEEDS_CORE_INTERACTIVE_FOCUS_VISIBLE_CONSISTENCY_PILOT_FIXES',
  'PASS_TO_PHASE36J_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW'
];

const CSS_REQUIRED_TEXT = [
  'Phase 36H',
  '--phase36h-core-focus-visible-outline',
  '--phase36h-core-focus-visible-offset',
  '--phase36h-core-focus-visible-shadow',
  '.button:focus-visible',
  '.navItem:focus-visible',
  '.bottomNav__item:focus-visible',
  '.dashboardCalmTab:focus-visible',
  '.libraryTab:focus-visible',
  '.shortAnswerField input:focus-visible',
  '.studyGoalField select:focus-visible',
  'outline: var(--phase36h-core-focus-visible-outline)',
  'outline-offset: var(--phase36h-core-focus-visible-offset)',
  'box-shadow: var(--phase36h-core-focus-visible-shadow)',
  '@media (prefers-reduced-motion: reduce)'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(-lock)?\.json$/,
  /^e2e\//,
  /^tests\/(?!unit\/coreInteractiveFocusVisibleConsistencyPilot\.test\.jsx$)/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36i-core-interactive-focus-visible-consistency-pilot-evidence-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36h-core-interactive-focus-visible-consistency-pilot-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!36h-core-interactive-focus-visible-consistency-pilot-evidence\.md$)/,
  /^scripts\/validate-phase(?!36h-core-interactive-focus-visible-consistency-pilot\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /^src\/(?!styles\/global\.css$)/,
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
  if (missing.length > 0) fail(`Phase 36H PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36H PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    /Phase 36H (changes|changed|modifies|modified) .*(handler|routing|route|tab-state|import|storage|data|scheduler|FSRS|sync|auth|backend|telemetry|package)/i,
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
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36H allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36H: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);
assertIncludes(CSS_FILE, CSS_REQUIRED_TEXT);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 36H decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36H decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36G validator retained as historical reference',
  '# node scripts/validate-phase36g-mobile-accessibility-track-focus-scope.js',
  'Validate Phase 36H Core Interactive Focus Visible Consistency Pilot',
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
  fail('Workflow must run exactly the active Phase 36H validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 36H validator must not execute internal git fetch.');
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

console.log(`Phase 36H Core Interactive Focus Visible Consistency Pilot validator passed (${diffMode}).`);
