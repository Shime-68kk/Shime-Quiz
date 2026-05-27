#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const EVIDENCE_FILE = 'docs/testing/phase37a-broader-actual-evidence-run.md';
const SUMMARY_FILE = 'docs/release/phase37a-broader-actual-evidence-run-summary.md';
const PHASE37B_SEED_FILE = 'docs/planning/phase37b-broader-actual-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37a-broader-actual-evidence-run.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  PHASE37B_SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_STATUS: COMPLETED_BROADER_ACTUAL_EVIDENCE_RUN',
  'PHASE37A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37A_EVIDENCE_SCOPE: BROADER_ACTUAL_EVIDENCE_RUN_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37A_DATA_SCOPE: GENERATED_TEST_DATA_ONLY_UNLESS_EXPLICITLY_APPROVED',
  'PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW',
  'NEEDS_MORE_EVIDENCE_EXECUTION',
  'HOLD_BROADER_ACTUAL_EVIDENCE_RUN',
  'NEEDS_BROADER_ACTUAL_EVIDENCE_FIXES'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37A - Broader Actual Evidence Run',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37',
  '## Evidence method',
  '## Test data policy',
  '## Evidence run table',
  '## Dashboard evidence',
  '## Library shelf evidence',
  '## Library workshop and import evidence',
  '## Study Room evidence',
  '## Mobile 375px evidence',
  '## Focus-visible evidence',
  '## Reduced-motion evidence',
  '## Backup/export/import rehearsal evidence',
  '## E2E smoke and onboarding evidence',
  '## Build and unit validation evidence',
  '## Not-run surfaces and reasons',
  '## Evidence boundaries',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen evidence decision',
  '## Decision rationale',
  '## What Phase 37A supports',
  '## What Phase 37A does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37A - Broader Actual Evidence Run Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Evidence result',
  '## Chosen decision',
  '## Evidence surfaces covered',
  '## Not-run surfaces',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const PHASE37B_SEED_HEADINGS = [
  '# Phase 37B - Broader Actual Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37A',
  '## Evidence to review',
  '## Review questions',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_EVIDENCE_ROWS = [
  'Dashboard baseline smoke',
  'Library shelf view',
  'Library workshop tools',
  'JSON import with generated/test data',
  'CSV/text import with generated/test data',
  'Study Room answer/check/reveal',
  'Study Room queue/counter observation',
  'Mobile 375px Dashboard',
  'Mobile 375px Library',
  'Mobile 375px Study Room',
  'Focus-visible keyboard path',
  'Reduced-motion check',
  'Backup/export/import rehearsal',
  'E2E smoke',
  'E2E onboarding',
  'Build',
  'Unit tests',
  'Generated/test data policy',
  'No runtime changes',
  'No readiness upgrade'
];

const REQUIRED_GUARDRAILS = [
  'Phase 37A does not approve Beta Ready',
  'Phase 37A does not approve public production readiness',
  'Phase 37A does not approve broad validation',
  'Phase 37A does not approve stress-tested readiness',
  'Phase 37A does not approve guaranteed data-loss prevention',
  'Phase 37A does not approve accessibility certification',
  'Phase 37A does not approve assistive technology review completion',
  'Phase 37A does not approve physical-device audit completion',
  'Phase 37A does not approve storage/backup/restore behavior changes',
  'Phase 37A does not approve import/parser behavior changes',
  'Phase 37A does not approve sync/cloud/account/auth/backend',
  'Phase 37A does not approve telemetry/network calls',
  'Phase 37A does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 37A does not approve route behavior changes',
  'Phase 37A does not approve event handler changes',
  'Phase 37A does not approve tab-state changes',
  'Phase 37A does not approve package/dependency changes',
  'Phase 37A does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37A does not approve Dynamic Canvas Themes',
  'Phase 37A does not approve Streak Fire',
  'Phase 37A does not approve Collapsible Header',
  'Phase 37A does not approve broad UI redesign',
  'Phase 37A does not approve automatic next runtime implementation'
];

const PHASE37B_DECISIONS = [
  'HOLD_BROADER_ACTUAL_EVIDENCE_REVIEW',
  'NEEDS_MORE_ACTUAL_EVIDENCE',
  'NEEDS_FIXES_BEFORE_READINESS_REVIEW',
  'PASS_TO_LIMITED_RELEASE_READINESS_REVIEW',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37b-broader-actual-evidence-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!37a-broader-actual-evidence-run-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!37a-broader-actual-evidence-run\.md$)/,
  /^scripts\/validate-phase(?!37a-broader-actual-evidence-run\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/,
  /^src\/routes\/StudyRoom\.jsx$/,
  /^src\/routes\/Library\.jsx$/,
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
      .filter(file => !/^node_modules\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 37A PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37A PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37A allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 37A: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(EVIDENCE_FILE, REQUIRED_EVIDENCE_ROWS);
assertIncludes(EVIDENCE_FILE, [
  'Surface | Data used | Evidence action | Result | Limitation | Decision impact',
  'NOT_RUN_WITH_REASON',
  'npm run test:e2e:smoke',
  'npm run test:e2e:onboarding',
  'npm run build',
  'npm run test:unit',
  'No real/private user data was used',
  'No runtime behavior changes'
]);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(PHASE37B_SEED_FILE, PHASE37B_SEED_HEADINGS);
assertIncludes(PHASE37B_SEED_FILE, PHASE37B_DECISIONS);
assertIncludes(PHASE37B_SEED_FILE, [
  'Phase 37B is an evidence review, not automatic runtime implementation',
  'Phase 37B must not approve Beta Ready by default'
]);

const docs = [read(EVIDENCE_FILE), read(SUMMARY_FILE), read(PHASE37B_SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 37A decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 37A decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 37 validator retained as historical reference',
  '# node scripts/validate-phase37-backlog-or-limited-release-readiness-review.js',
  'Validate Phase 37A Broader Actual Evidence Run',
  `node ${VALIDATOR_FILE}`
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activePhaseValidatorRuns = workflow
  .split(/\r?\n/)
  .filter(line => /^\s*node scripts\/validate-phase/.test(line))
  .filter(line => !line.includes(VALIDATOR_FILE));
if (activePhaseValidatorRuns.length > 0) {
  fail(`Workflow must only run the active Phase 37A validator. Found: ${activePhaseValidatorRuns.join(', ')}`);
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 37A validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 37A Broader Actual Evidence Run validator passed (${diffMode}).`);
