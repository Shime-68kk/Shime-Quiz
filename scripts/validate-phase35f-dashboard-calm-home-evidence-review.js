#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/testing/phase35f-dashboard-calm-home-evidence-review.md',
  'docs/release/phase35f-dashboard-calm-home-evidence-review-summary.md',
  'docs/planning/phase35g-next-ui-polish-scope-seed.md',
  'scripts/validate-phase35f-dashboard-calm-home-evidence-review.js'
];

const VALIDATOR_FILE = 'scripts/validate-phase35f-dashboard-calm-home-evidence-review.js';
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_STATUS: COMPLETED_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW',
  'PHASE35F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35F_REVIEW_SCOPE: DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35F_DASHBOARD_CALM_HOME_SCOPE_STATUS: DASHBOARD_CALM_HOME_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE35G_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35G_NEXT_UI_POLISH_SCOPE',
  'NEEDS_DASHBOARD_CALM_HOME_FIXES',
  'HOLD_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35F — Dashboard Calm Home Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35E',
  '## Review method',
  '## Dashboard Calm Home evidence review table',
  '## Default Hôm nay view review',
  '## Nhật ký tiến độ view review',
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
  '## What Phase 35F supports',
  '## What Phase 35F does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35F — Dashboard Calm Home Evidence Review Summary',
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
  '# Phase 35G — Next UI Polish Scope Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35F',
  '## Candidate polish backlog',
  '## Selection rules',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_ROWS = [
  'default `Hôm nay` view',
  '`Chào mừng quay lại`',
  '`Học tiếp`',
  '`Nhật ký tiến độ`',
  'progress/analytics surfaces',
  'E2E smoke',
  'E2E onboarding',
  'keyboard/focus behavior',
  'reduced-motion behavior',
  'mobile 375px behavior',
  'no data/query/scheduler/storage changes',
  'validator post-merge safety',
  'claim guardrails',
  'Phase 35G next UI polish scope seed'
];

const PHASE35G_BACKLOG = [
  'Hybrid Sliding Navigation Indicator',
  'Elastic Button Compression',
  'Study Room Answer Feedback Polish',
  'Dashboard Calm Home Evidence Follow-up Fixes',
  'Mobile Touch Polish',
  'Accessibility Focus Polish'
];

const PHASE35G_DECISIONS = [
  'HOLD_NEXT_UI_POLISH_SCOPE',
  'NEEDS_NEXT_UI_POLISH_RESEARCH',
  'PASS_TO_ONE_SMALL_UI_POLISH_IMPLEMENTATION'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35G — Next UI Polish Scope Gate',
  'Phase 35G is a scope gate and is not automatic runtime implementation.',
  'Phase 35F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35F does not approve BETA_READY.',
  'Phase 35F does not approve public production readiness.',
  'Phase 35F does not approve broad validation or stress-tested readiness.',
  'Phase 35F does not approve guaranteed data-loss prevention.',
  'Phase 35F does not approve storage/backup/restore behavior changes.',
  'Phase 35F does not approve sync/cloud/account/auth/backend.',
  'Phase 35F does not approve telemetry/network calls.',
  'Phase 35F does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35F does not approve new Dashboard runtime changes.',
  'Phase 35F does not approve Navigation indicator implementation.',
  'Phase 35F does not approve Elastic Button Compression implementation.',
  'Phase 35F does not approve Study Room polish.',
  'Phase 35F does not approve Streak Fire.',
  'Phase 35F does not approve Collapsible Header.',
  'Phase 35F does not approve Dynamic Canvas Themes implementation.'
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
    if (!files.includes(file)) fail(`Phase 35F PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35F allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^src\//.test(file)) fail(`Runtime source file must not change in Phase 35F: ${file}`);
  if (/^tests\//.test(file)) fail(`Unit test file must not change in Phase 35F: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35F: ${file}`);
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35F: ${file}`);
  if (/^(storage|backup|restore|import|parser|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
  if (/^(src\/)?(.*\/)?(storage|backup|restore|import|parser|scheduler|fsrs|sync|auth|backend|telemetry)\//i.test(file)) {
    fail(`Forbidden system area changed: ${file}`);
  }
}

const evidenceFile = 'docs/testing/phase35f-dashboard-calm-home-evidence-review.md';
const summaryFile = 'docs/release/phase35f-dashboard-calm-home-evidence-review-summary.md';
const seedFile = 'docs/planning/phase35g-next-ui-polish-scope-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(evidenceFile, TABLE_ROWS);
assertIncludes(seedFile, [
  'PHASE35G_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED',
  ...PHASE35G_BACKLOG,
  ...PHASE35G_DECISIONS,
  'Phase 35G is a scope gate and is not automatic runtime implementation.'
]);

const allPhaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35F decision token: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!allPhaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const workflow = read(workflowFile);
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('run: node scripts/validate-phase35f-dashboard-calm-home-evidence-review.js')) {
  fail('CI must register Phase 35F validator.');
}
if (!workflow.includes('# node scripts/validate-phase35e-dashboard-calm-home.js')) {
  fail('Phase 35E validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/validate-phase35[eE]-dashboard-calm-home\.js/.test(workflow.replace(/# node scripts\/validate-phase35e-dashboard-calm-home\.js/g, ''))) {
  fail('Prior Phase 35E validator must not remain active as a Phase 35F blocker.');
}
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}
if (/validate-phase\*|validate-phase\{|\bls scripts\/validate-phase|for .*validate-phase|scripts\/validate-phase\d+\*|find .*validate-phase/.test(workflow)) {
  fail('Workflow must not use a full validator glob chain.');
}

const validator = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35F validator must not update remotes internally.');
}
if (!validator.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
  fail('Phase 35F validator must verify origin/main availability.');
}
for (const mode of ['pr-diff', 'post-merge-main', 'validator-hotfix']) {
  if (!validator.includes(mode)) fail(`Phase 35F validator must support ${mode} mode.`);
}

const forbiddenApprovalPatterns = [
  /BETA_READY is approved/i,
  /approves BETA_READY/i,
  /Phase 35F approves public production readiness/i,
  /Phase 35F approves broad validation/i,
  /Phase 35F approves stress-tested readiness/i,
  /Phase 35F approves guaranteed data-loss prevention/i,
  /Phase 35F approves storage\/backup\/restore behavior changes/i,
  /Phase 35F approves sync\/cloud\/account\/auth\/backend/i,
  /Phase 35F approves telemetry\/network calls/i,
  /Phase 35F approves built-in AI\/OCR\/API-key\/BYOK behavior/i,
  /Phase 35F approves new Dashboard runtime changes/i,
  /Phase 35F approves Navigation indicator implementation/i,
  /Phase 35F approves Elastic Button Compression implementation/i,
  /Phase 35F approves Study Room polish/i,
  /Phase 35F approves Streak Fire/i,
  /Phase 35F approves Collapsible Header/i,
  /Phase 35F approves Dynamic Canvas Themes implementation/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

console.log(`validate-phase35f-dashboard-calm-home-evidence-review passed (${diffMode}).`);
