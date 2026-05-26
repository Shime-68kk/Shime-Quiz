#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const VALIDATOR_FILE = 'scripts/validate-phase35l-elastic-button-compression-pilot-evidence-review.js';
const REQUIRED_FILES = [
  '.github/workflows/e2e-smoke.yml',
  'docs/testing/phase35l-elastic-button-compression-pilot-evidence-review.md',
  'docs/release/phase35l-elastic-button-compression-pilot-evidence-review-summary.md',
  'docs/planning/phase35m-next-ui-polish-scope-seed.md',
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW',
  'PHASE35L_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35L_REVIEW_SCOPE: ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_SCOPE_STATUS: ELASTIC_BUTTON_COMPRESSION_PILOT_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE35M_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED'
];

const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35M_NEXT_UI_POLISH_SCOPE',
  'NEEDS_ELASTIC_BUTTON_COMPRESSION_PILOT_FIXES',
  'HOLD_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 35L — Elastic Button Compression Pilot Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35K',
  '## Review method',
  '## Elastic Button Compression Pilot evidence review table',
  '## Target surface review',
  '## Quick press and release review',
  '## Disabled and loading state review',
  '## Handler and behavior preservation review',
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
  '## What Phase 35L supports',
  '## What Phase 35L does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 35L — Elastic Button Compression Pilot Evidence Review Summary',
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
  '# Phase 35M — Next UI Polish Scope Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35L',
  '## Candidate polish backlog',
  '## Selection rules',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const TABLE_COLUMNS = [
  'Review surface | Phase 35K evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim'
];

const TABLE_ROWS = [
  'Dashboard `Học tiếp`',
  'Library `Nạp JSON/CSV`',
  'Library `Dùng quiz mẫu`',
  'Study Room buttons intentionally skipped',
  'quick press/release',
  'disabled/loading state behavior',
  'focus-visible behavior',
  'reduced-motion fallback',
  'mobile 375px no-overflow',
  'no handler changes',
  'no submit behavior changes',
  'no pointer event routing changes',
  'no route behavior changes',
  'no data behavior changes',
  'no package/dependency changes',
  'E2E smoke',
  'E2E onboarding',
  'claim guardrails',
  'validator post-merge safety',
  'Phase 35M next UI polish scope seed'
];

const PHASE35M_BACKLOG = [
  'Study Room Answer Feedback Polish',
  'Mobile Touch Polish',
  'Accessibility Focus Polish',
  'Elastic Button Compression Pilot Follow-up Fixes if Phase 35L finds any',
  'Hybrid Navigation Indicator Follow-up Fixes if needed',
  'Dashboard Calm Home Evidence Follow-up Fixes if needed',
  'Streak Fire Ignition',
  'Collapsible Header',
  'Dynamic Canvas Themes'
];

const PHASE35M_DECISIONS = [
  'HOLD_NEXT_UI_POLISH_SCOPE',
  'NEEDS_NEXT_UI_POLISH_RESEARCH',
  'PASS_TO_ONE_SMALL_UI_POLISH_IMPLEMENTATION'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 35M — Next UI Polish Scope Gate',
  'Phase 35M is a scope gate and is not automatic runtime implementation.',
  'Phase 35L confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35L does not approve BETA_READY.',
  'Phase 35L does not approve public production readiness.',
  'Phase 35L does not approve broad validation or stress-tested readiness.',
  'Phase 35L does not approve guaranteed data-loss prevention.',
  'Phase 35L does not approve storage/backup/restore behavior changes.',
  'Phase 35L does not approve sync/cloud/account/auth/backend.',
  'Phase 35L does not approve telemetry/network calls.',
  'Phase 35L does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35L does not approve route behavior changes.',
  'Phase 35L does not approve package/dependency changes.',
  'Phase 35L does not approve app-wide Elastic Button Compression.',
  'Phase 35L does not approve handler changes.',
  'Phase 35L does not approve submit behavior changes.',
  'Phase 35L does not approve pointer event routing changes.',
  'Phase 35L does not approve data behavior changes.',
  'Phase 35L does not approve Study Room answer feedback implementation.',
  'Phase 35L does not approve Streak Fire.',
  'Phase 35L does not approve Collapsible Header.',
  'Phase 35L does not approve Dynamic Canvas Themes implementation.'
];

const STUDY_ROOM_REVIEW_STATEMENTS = [
  'Study Room buttons were intentionally skipped',
  'Study Room buttons intentionally skipped',
  'Phase 35L does not approve Study Room answer feedback implementation.'
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
  for (const file of REQUIRED_FILES) {
    if (!files.includes(file)) fail(`Phase 35L PR diff must include required file: ${file}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 35L allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (/^src\//.test(file)) fail(`Runtime source file must not change in Phase 35L: ${file}`);
  if (/^tests\//.test(file)) fail(`Unit test file must not change in Phase 35L: ${file}`);
  if (/^e2e\//.test(file)) fail(`E2E spec file must not change in Phase 35L: ${file}`);
  if (/^package(-lock)?\.json$/.test(file)) fail(`Package file must not change in Phase 35L: ${file}`);
  if (/^docs\/adr\//.test(file)) fail(`ADR file must not change in Phase 35L: ${file}`);
  if (/^RELEASE_NOTES(_V2)?\.md$/.test(file)) fail(`Release notes file must not change in Phase 35L: ${file}`);
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

const evidenceFile = 'docs/testing/phase35l-elastic-button-compression-pilot-evidence-review.md';
const summaryFile = 'docs/release/phase35l-elastic-button-compression-pilot-evidence-review-summary.md';
const seedFile = 'docs/planning/phase35m-next-ui-polish-scope-seed.md';
const workflowFile = '.github/workflows/e2e-smoke.yml';

assertIncludes(evidenceFile, EVIDENCE_HEADINGS);
assertIncludes(summaryFile, SUMMARY_HEADINGS);
assertIncludes(seedFile, SEED_HEADINGS);
assertIncludes(evidenceFile, TABLE_COLUMNS);
assertIncludes(evidenceFile, TABLE_ROWS);
assertIncludes(evidenceFile, STUDY_ROOM_REVIEW_STATEMENTS);
assertIncludes(seedFile, [
  'PHASE35M_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED',
  ...PHASE35M_BACKLOG,
  ...PHASE35M_DECISIONS,
  'Phase 35M is a scope gate and is not automatic runtime implementation.'
]);

const allPhaseDocs = [read(evidenceFile), read(summaryFile), read(seedFile)].join('\n');

for (const token of REQUIRED_TOKENS) {
  if (!allPhaseDocs.includes(token)) fail(`Missing status token: ${token}`);
}

const decisionMatches = allPhaseDocs.match(/PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_DECISION: ([A-Z0-9_]+)/g) || [];
if (decisionMatches.length === 0) fail('Missing PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW_DECISION token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Invalid Phase 35L decision token: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!allPhaseDocs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}

const workflow = read(workflowFile);
if (!workflow.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
if (!workflow.includes('fetch-depth: 0')) fail('Workflow checkout must use fetch-depth: 0.');
if (!workflow.includes('run: node scripts/validate-phase35l-elastic-button-compression-pilot-evidence-review.js')) {
  fail('CI must register Phase 35L validator.');
}
if (!workflow.includes('# node scripts/validate-phase35k-elastic-button-compression-pilot.js')) {
  fail('Phase 35K validator must be retained as commented historical reference.');
}
if (workflow.includes('refs/heads/main:refs/remotes/origin/main')) fail('Workflow must not shell-fetch origin/main.');
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/validate-phase35k-elastic-button-compression-pilot\.js/.test(workflow.replace(/# node scripts\/validate-phase35k-elastic-button-compression-pilot\.js/g, ''))) {
  fail('Prior Phase 35K validator must not remain active as a Phase 35L blocker.');
}
if ((workflow.match(/run:\s*node scripts\/validate-phase\d+/g) || []).length > 1) {
  fail('Workflow must not run a full historical validator chain.');
}
if (/validate-phase\*|validate-phase\{|\bls scripts\/validate-phase|for .*validate-phase|scripts\/validate-phase\d+\*|find .*validate-phase/.test(workflow)) {
  fail('Workflow must not use a full validator glob chain.');
}

const validator = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"][\s\S]*['"]fetch['"]/.test(validator)) {
  fail('Phase 35L validator must not update remotes internally.');
}
if (!validator.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
  fail('Phase 35L validator must verify origin/main availability.');
}
for (const mode of ['pr-diff', 'post-merge-main', 'validator-hotfix']) {
  if (!validator.includes(mode)) fail(`Phase 35L validator must support ${mode} mode.`);
}

const forbiddenApprovalPatterns = [
  /BETA_READY is approved/i,
  /approves BETA_READY/i,
  /Phase 35L approves public production readiness/i,
  /Phase 35L approves broad validation/i,
  /Phase 35L approves stress-tested readiness/i,
  /Phase 35L approves guaranteed data-loss prevention/i,
  /Phase 35L approves storage\/backup\/restore behavior changes/i,
  /Phase 35L approves sync\/cloud\/account\/auth\/backend/i,
  /Phase 35L approves telemetry\/network calls/i,
  /Phase 35L approves built-in AI\/OCR\/API-key\/BYOK behavior/i,
  /Phase 35L approves route behavior changes/i,
  /Phase 35L approves package\/dependency changes/i,
  /Phase 35L approves app-wide Elastic Button Compression/i,
  /Phase 35L approves handler changes/i,
  /Phase 35L approves submit behavior changes/i,
  /Phase 35L approves pointer event routing changes/i,
  /Phase 35L approves data behavior changes/i,
  /Phase 35L approves Study Room answer feedback implementation/i,
  /Phase 35L approves Streak Fire/i,
  /Phase 35L approves Collapsible Header/i,
  /Phase 35L approves Dynamic Canvas Themes implementation/i
];

for (const pattern of forbiddenApprovalPatterns) {
  if (pattern.test(allPhaseDocs)) fail(`Docs contain forbidden approval language: ${pattern}`);
}

if (/Study Room answer feedback (was|is) implemented/i.test(allPhaseDocs.replace(/Not allowed claim/g, ''))) {
  fail('Docs must not claim Study Room answer feedback was implemented.');
}

console.log(`validate-phase35l-elastic-button-compression-pilot-evidence-review passed (${diffMode}).`);
