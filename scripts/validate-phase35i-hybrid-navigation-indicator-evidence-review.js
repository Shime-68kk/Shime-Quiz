#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/testing/phase35i-hybrid-navigation-indicator-evidence-review.md',
  'docs/release/phase35i-hybrid-navigation-indicator-evidence-review-summary.md',
  'docs/planning/phase35j-next-ui-polish-scope-seed.md',
  'scripts/validate-phase35i-hybrid-navigation-indicator-evidence-review.js'
];

const VALIDATOR_FILE = 'scripts/validate-phase35i-hybrid-navigation-indicator-evidence-review.js';
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_STATUS: COMPLETED_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'PHASE35I_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35I_REVIEW_SCOPE: HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35I_HYBRID_NAVIGATION_INDICATOR_SCOPE_STATUS: HYBRID_NAVIGATION_INDICATOR_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE35J_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35J_NEXT_UI_POLISH_SCOPE',
  'NEEDS_HYBRID_NAVIGATION_INDICATOR_FIXES',
  'HOLD_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35I — Hybrid Navigation Indicator Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35H',
  '## Review method',
  '## Hybrid Navigation Indicator evidence review table',
  '## Desktop indicator review',
  '## Mobile indicator review',
  '## Route behavior preservation review',
  '## Study Room focusMode review',
  '## E2E smoke and onboarding review',
  '## Accessibility and keyboard review',
  '## Reduced-motion review',
  '## Mobile and responsive review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 35I supports',
  '## What Phase 35I does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35I — Hybrid Navigation Indicator Evidence Review Summary',
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
  '# Phase 35J — Next UI Polish Scope Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35I',
  '## Candidate polish backlog',
  '## Selection rules',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Review surface | Phase 35H evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim'
];

const TABLE_ROWS = [
  'desktop active indicator',
  'mobile active indicator',
  'dashboard route indicator',
  'library route indicator',
  'settings route indicator',
  'study-room route behavior',
  'Study Room focusMode nav hiding',
  'keyboard/focus behavior',
  'reduced-motion behavior',
  'mobile 375px no-overflow',
  'E2E smoke',
  'E2E onboarding',
  'no route/destination changes',
  'no package/dependency changes',
  'claim guardrails',
  'validator post-merge safety',
  'Phase 35J next UI polish scope seed'
];

const PHASE35J_BACKLOG = [
  'Elastic Button Compression',
  'Study Room Answer Feedback Polish',
  'Mobile Touch Polish',
  'Accessibility Focus Polish',
  'Dashboard Calm Home Evidence Follow-up Fixes',
  'Hybrid Navigation Indicator Follow-up Fixes if Phase 35I finds any'
];

const PHASE35J_DECISIONS = [
  'HOLD_NEXT_UI_POLISH_SCOPE',
  'NEEDS_NEXT_UI_POLISH_RESEARCH',
  'PASS_TO_ONE_SMALL_UI_POLISH_IMPLEMENTATION'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35J — Next UI Polish Scope Gate',
  'Phase 35J is a scope gate and is not automatic runtime implementation.',
  'Phase 35I confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35I does not approve BETA_READY.',
  'Phase 35I does not approve public production readiness.',
  'Phase 35I does not approve broad validation or stress-tested readiness.',
  'Phase 35I does not approve guaranteed data-loss prevention.',
  'Phase 35I does not approve storage/backup/restore behavior changes.',
  'Phase 35I does not approve sync/cloud/account/auth/backend.',
  'Phase 35I does not approve telemetry/network calls.',
  'Phase 35I does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35I does not approve route behavior changes.',
  'Phase 35I does not approve package/dependency changes.',
  'Phase 35I does not approve broad navigation rewrite.',
  'Phase 35I does not approve Elastic Button Compression implementation.',
  'Phase 35I does not approve Study Room polish.',
  'Phase 35I does not approve Streak Fire.',
  'Phase 35I does not approve Collapsible Header.',
  'Phase 35I does not approve Dynamic Canvas Themes implementation.'
];

const STUDY_ROOM_REVIEW_STATEMENTS = [
  'existing `/study-room` `focusMode` behavior hides primary navigation',
  'not a regression',
  'does not claim the active indicator is visible on hidden-nav pages'
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

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
  }
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
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
    if (!files.includes(file)) fail(`Phase 35I PR diff must include required file: ${file}`);
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
    if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35I allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^src\//.test(file)) fail(`Runtime source file must not change in Phase 35I: ${file}`);
  if (/^tests\//.test(file)) fail(`Unit test file must not change in Phase 35I: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35I: ${file}`);
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35I: ${file}`);
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35I: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35I: ${file}`);
  if (/^(storage|backup|restore|import|parser|drop-zone|database|prompt|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|drop-zone|database|prompt|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
  if (/route|navigation/i.test(file) && !ALLOWED_FILES.has(file)) {
    fail(`Route/navigation implementation or unapproved navigation file changed: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35i-hybrid-navigation-indicator-evidence-review.md';
const summaryFile = 'docs/release/phase35i-hybrid-navigation-indicator-evidence-review-summary.md';
const seedFile = 'docs/planning/phase35j-next-ui-polish-scope-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(evidenceFile, TABLE_COLUMNS);
assertIncludes(evidenceFile, TABLE_ROWS);
assertIncludes(evidenceFile, STUDY_ROOM_REVIEW_STATEMENTS);
assertIncludes(seedFile, [
  'PHASE35J_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED',
  ...PHASE35J_BACKLOG,
  ...PHASE35J_DECISIONS,
  'Phase 35J is a scope gate and is not automatic runtime implementation.',
  'Streak Fire, Collapsible Header, and Dynamic Canvas Themes need separate gates and are not approved by default.'
]);

const allPhaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35I_HYBRID_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35I decision token: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!allPhaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const workflow = read(workflowFile);
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('run: node scripts/validate-phase35i-hybrid-navigation-indicator-evidence-review.js')) {
  fail('CI must register Phase 35I validator.');
}
if (!workflow.includes('# node scripts/validate-phase35h-hybrid-navigation-indicator.js')) {
  fail('Phase 35H validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/validate-phase35h-hybrid-navigation-indicator\.js/.test(workflow.replace(/# node scripts\/validate-phase35h-hybrid-navigation-indicator\.js/g, ''))) {
  fail('Prior Phase 35H validator must not remain active as a Phase 35I blocker.');
}
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}
if (/validate-phase\*|validate-phase\{|\bls scripts\/validate-phase|for .*validate-phase|scripts\/validate-phase\d+\*|find .*validate-phase/.test(workflow)) {
  fail('Workflow must not use a full validator glob chain.');
}

const validator = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35I validator must not update remotes internally.');
}
if (!validator.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
  fail('Phase 35I validator must verify origin/main availability.');
}
for (const mode of ['pr-diff', 'post-merge-main', 'validator-hotfix']) {
  if (!validator.includes(mode)) fail(`Phase 35I validator must support ${mode} mode.`);
}

const forbiddenApprovalPatterns = [
  /BETA_READY is approved/i,
  /approves BETA_READY/i,
  /Phase 35I approves public production readiness/i,
  /Phase 35I approves broad validation/i,
  /Phase 35I approves stress-tested readiness/i,
  /Phase 35I approves guaranteed data-loss prevention/i,
  /Phase 35I approves storage\/backup\/restore behavior changes/i,
  /Phase 35I approves sync\/cloud\/account\/auth\/backend/i,
  /Phase 35I approves telemetry\/network calls/i,
  /Phase 35I approves built-in AI\/OCR\/API-key\/BYOK behavior/i,
  /Phase 35I approves route behavior changes/i,
  /Phase 35I approves package\/dependency changes/i,
  /Phase 35I approves broad navigation rewrite/i,
  /Phase 35I approves Elastic Button Compression implementation/i,
  /Phase 35I approves Study Room polish/i,
  /Phase 35I approves Streak Fire/i,
  /Phase 35I approves Collapsible Header/i,
  /Phase 35I approves Dynamic Canvas Themes implementation/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

console.log(`validate-phase35i-hybrid-navigation-indicator-evidence-review passed (${diffMode}).`);
