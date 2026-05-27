#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37b-broader-actual-evidence-review.md';
const SUMMARY_FILE = 'docs/release/phase37b-broader-actual-evidence-review-summary.md';
const PHASE37C_SEED_FILE = 'docs/planning/phase37c-limited-release-readiness-gap-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37b-broader-actual-evidence-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  PHASE37C_SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW_STATUS: COMPLETED_BROADER_ACTUAL_EVIDENCE_REVIEW',
  'PHASE37B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37B_REVIEW_SCOPE: BROADER_ACTUAL_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37B_EVIDENCE_SCOPE: GENERATED_TEST_DATA_EVIDENCE_REVIEWED_WITH_LIMITATIONS_CARRIED_FORWARD',
  'PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'HOLD_BROADER_ACTUAL_EVIDENCE_REVIEW',
  'NEEDS_MORE_ACTUAL_EVIDENCE',
  'NEEDS_FIXES_BEFORE_READINESS_REVIEW',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW'
];

const REVIEW_HEADINGS = [
  '# Phase 37B — Broader Actual Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37A',
  '## Review method',
  '## Evidence review table',
  '## Dashboard evidence review',
  '## Library evidence review',
  '## Workshop and import evidence review',
  '## Study Room evidence review',
  '## Mobile 375px evidence review',
  '## Focus-visible and reduced-motion evidence review',
  '## Backup/export/import evidence review',
  '## E2E smoke and onboarding evidence review',
  '## Build and unit validation review',
  '## Not-run surfaces and limitations',
  '## Readiness impact review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37B supports',
  '## What Phase 37B does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37B — Broader Actual Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Readiness impact',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const PHASE37C_SEED_HEADINGS = [
  '# Phase 37C — Limited Release Readiness Gap Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37B',
  '## Gap surfaces to review',
  '## Evidence required',
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
  'CSV import with generated/test data',
  'Text/Markdown import with generated/test data',
  'Study Room answer/check/reveal',
  'Study Room queue/counter observation',
  'Mobile 375px Dashboard',
  'Mobile 375px Library',
  'Mobile 375px Study Room',
  'Focus-visible keyboard path',
  'Reduced-motion emulation',
  'Backup export/download control',
  'Backup import/restore execution',
  'Physical-device mobile audit',
  'Assistive-technology review',
  'E2E smoke',
  'E2E onboarding',
  'Build',
  'Unit tests',
  'Generated/test data policy',
  'No readiness upgrade',
  'Phase 37C gap review seed'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37C — Limited Release Readiness Gap Review',
  'Phase 37C is a review/gap analysis phase and is not automatic runtime implementation',
  'Phase 37B confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37B does not approve BETA_READY',
  'Phase 37B does not approve Beta Ready',
  'Phase 37B does not approve public production readiness',
  'Phase 37B does not approve broad validation',
  'Phase 37B does not approve stress-tested readiness',
  'Phase 37B does not approve guaranteed data-loss prevention',
  'Phase 37B does not approve accessibility certification',
  'Phase 37B does not approve assistive technology review completion',
  'Phase 37B does not approve physical-device audit completion',
  'Phase 37B does not approve storage/backup/restore behavior changes',
  'Phase 37B does not approve import/parser behavior changes',
  'Phase 37B does not approve sync/cloud/account/auth/backend',
  'Phase 37B does not approve telemetry/network calls',
  'Phase 37B does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 37B does not approve route behavior changes',
  'Phase 37B does not approve event handler changes',
  'Phase 37B does not approve tab-state changes',
  'Phase 37B does not approve package/dependency changes',
  'Phase 37B does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37B does not approve Dynamic Canvas Themes implementation',
  'Phase 37B does not approve Streak Fire',
  'Phase 37B does not approve Collapsible Header',
  'Phase 37B does not approve broad UI redesign',
  'Phase 37B does not approve automatic next runtime implementation'
];

const PHASE37C_DECISIONS = [
  'HOLD_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_BACKUP_RESTORE_REHEARSAL_EVIDENCE',
  'NEEDS_MORE_ACTUAL_USER_EVIDENCE',
  'PASS_TO_LIMITED_RELEASE_READINESS_RE_DECISION',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW'
];

const REQUIRED_LIMITATIONS = [
  'Backup import/restore execution remains `NOT_RUN_WITH_REASON`',
  'Physical-device mobile audit remains `NOT_RUN_WITH_REASON`',
  'Assistive-technology review remains `NOT_RUN_WITH_REASON`',
  'generated/test-data-only',
  'Chromium'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37c-limited-release-readiness-gap-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!37b-broader-actual-evidence-review-summary\.md$)/,
  /^docs\/review\/phase(?!37b-broader-actual-evidence-review\.md$)/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!37b-broader-actual-evidence-review\.js$)/,
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
  if (missing.length > 0) fail(`Phase 37B PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37B PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    /assistive[- ]technology review completion (complete|completed|approved|passed|claimed)/i,
    /physical-device audit completion (complete|completed|approved|passed|claimed)/i,
    /automatic next runtime implementation is approved/i,
    /Phase 37B .*approves Beta Ready/i,
    /Phase 37B .*approves public production readiness/i,
    /Phase 37B .*approves storage\/backup\/restore behavior changes/i,
    /Phase 37B .*approves import\/parser behavior changes/i
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
  if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37B allowlist: ${file}`);
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 37B: ${file}`);
  }
}

assertIncludes(REVIEW_FILE, REVIEW_HEADINGS);
assertIncludes(REVIEW_FILE, REQUIRED_EVIDENCE_ROWS);
assertIncludes(REVIEW_FILE, [
  'Evidence surface | Phase 37A result | Review finding | Remaining limitation | Readiness impact | Next action',
  'NOT_RUN_WITH_REASON',
  'Phase 37A materially broadened generated/test-data evidence',
  'Phase 37C - Limited Release Readiness Gap Review'
]);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(PHASE37C_SEED_FILE, PHASE37C_SEED_HEADINGS);
assertIncludes(PHASE37C_SEED_FILE, PHASE37C_DECISIONS);
assertIncludes(PHASE37C_SEED_FILE, [
  'Phase 37C is a review/gap analysis phase and is not automatic runtime implementation',
  'Phase 37C must not approve Beta Ready by default',
  'Phase 37C must review whether backup import/restore not-run status blocks any readiness upgrade',
  'Phase 37C must review physical-device and assistive-technology limitations',
  'Any readiness upgrade still requires explicit re-decision and guardrails',
  'Storage/backup/restore or migration changes require a separate design gate, rollback plan, and evidence plan'
]);

const docs = [read(REVIEW_FILE), read(SUMMARY_FILE), read(PHASE37C_SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}
for (const limitation of REQUIRED_LIMITATIONS) {
  if (!docs.includes(limitation)) fail(`Missing carried-forward limitation: ${limitation}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 37B decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 37B decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 37A validator retained as historical reference',
  '# node scripts/validate-phase37a-broader-actual-evidence-run.js',
  'Validate Phase 37B Broader Actual Evidence Review',
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
  fail(`Workflow must only run the active Phase 37B validator. Found: ${activePhaseValidatorRuns.join(', ')}`);
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 37B validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 37B Broader Actual Evidence Review validator passed (${diffMode}).`);
