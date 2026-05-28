#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37c-limited-release-readiness-gap-review-return.md';
const SUMMARY_FILE = 'docs/release/phase37c-limited-release-readiness-gap-review-return-summary.md';
const SEED_FILE = 'docs/planning/phase37d-limited-release-evidence-action-plan-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37c-limited-release-readiness-gap-review-return.js';

const REQUIRED_FILES = [WORKFLOW_FILE, REVIEW_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_STATUS: COMPLETED_LIMITED_RELEASE_READINESS_GAP_REVIEW_RETURN',
  'PHASE37C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37C_REVIEW_SCOPE: LIMITED_RELEASE_READINESS_GAP_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37C_SELECTED_CANDIDATE: PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN',
  'PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_SEED_STATUS: PREPARED_EVIDENCE_ACTION_PLAN_SEED'
];

const DECISION_TOKEN = 'PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_DECISION';
const EXPECTED_DECISION = 'PASS_TO_PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'HOLD_LIMITED_RELEASE_READINESS_REVIEW',
  'NEEDS_READINESS_GAP_REVIEW_FIXES',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY',
  'PASS_TO_MANUAL_EVIDENCE_COLLECTION_ONLY'
];

const REVIEW_HEADINGS = [
  '# Phase 37C — Limited Release Readiness Gap Review Return',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiW',
  '## Review method',
  '## UI completion versus release readiness',
  '## Current readiness status',
  '## Evidence reviewed',
  '## Readiness evidence inventory',
  '## UI modernization completion inputs',
  '## Actual-user evidence review',
  '## Manual browser evidence review',
  '## Mobile and physical-device evidence review',
  '## Assistive technology and accessibility evidence review',
  '## Reduced-motion and focus-visible evidence review',
  '## Backup, restore, and data-loss boundary review',
  '## Import/parser evidence review',
  '## Storage, migration, and local-first boundary review',
  '## Scheduler/FSRS boundary review',
  '## Privacy, telemetry, sync, account, and backend boundary review',
  '## Build, unit, smoke, onboarding, and validator evidence review',
  '## Known limitations and evidence gaps',
  '## Beta Ready claim review',
  '## Limited release risk assessment',
  '## Decision options considered',
  '## Selected candidate',
  '## Why Phase 37D Limited Release Evidence Action Plan next',
  '## Why this is review only, not runtime implementation',
  '## Phase 37D allowed files / expected areas',
  '## Phase 37D forbidden areas',
  '## Evidence requirements for Phase 37D',
  '## Rollback / hold plan',
  '## Chosen readiness decision',
  '## Decision rationale',
  '## What Phase 37C supports',
  '## What Phase 37C does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37C — Limited Release Readiness Gap Review Return Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Evidence gaps carried forward',
  '## UI completion boundary',
  '## Readiness risk position',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37D — Limited Release Evidence Action Plan Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37C',
  '## Action plan candidate',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Evidence collection requirements',
  '## Manual browser evidence requirements',
  '## Mobile and physical-device evidence requirements',
  '## Accessibility and assistive-technology evidence requirements',
  '## Backup/restore and import evidence requirements',
  '## Readiness boundaries',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_GAP_ROWS = [
  'actual-user evidence remains limited',
  'physical-device/mobile evidence remains limited',
  'assistive-technology evidence remains limited',
  'broader reduced-motion evidence remains limited',
  'backup/restore/manual evidence needs renewed review',
  'import/parser/manual evidence needs renewed review',
  'long-session/stress-adjacent evidence remains limited',
  'UI completion does not equal release readiness',
  'Dynamic Canvas expansion remains gated',
  'Beta Ready remains not approved'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN',
  'NEEDS_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_FIXES',
  'PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION',
  'PASS_TO_LIMITED_RELEASE_READINESS_HOLD',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37D is an evidence action plan, not Beta Ready.',
  'define the smallest safe set of evidence to collect next',
  'Phase 37D must not implement runtime changes unless explicitly scoped later.',
  'Phase 37D must not approve Beta Ready or public production readiness.',
  'actual/manual user evidence',
  'browser coverage',
  'mobile/physical device',
  'assistive tech',
  'reduced motion',
  'backup/restore',
  'import/parser',
  'local-first/privacy boundaries'
];

const GUARDRAILS = [
  'Phase 37C does not approve BETA_READY.',
  'Phase 37C does not approve public production readiness.',
  'Phase 37C does not approve release-readiness upgrade.',
  'Phase 37C does not approve runtime implementation in Phase 37C.',
  'Phase 37C does not approve broad UI redesign.',
  'Phase 37C does not approve Dynamic Canvas expansion.',
  'Phase 37C does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37C does not approve full theme picker runtime.',
  'Phase 37C does not approve persisted theme preferences.',
  'Phase 37C does not approve account-synced preferences.',
  'Phase 37C does not approve storage/backup/restore behavior changes.',
  'Phase 37C does not approve import/parser behavior changes.',
  'Phase 37C does not approve scheduler/FSRS behavior changes.',
  'Phase 37C does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37C does not approve streak calculation changes.',
  'Phase 37C does not approve daily goal logic changes.',
  'Phase 37C does not approve completion logic changes.',
  'Phase 37C does not approve route behavior changes.',
  'Phase 37C does not approve event handler changes.',
  'Phase 37C does not approve package/dependency changes.',
  'Phase 37C does not approve localStorage writes.',
  'Phase 37C does not approve sessionStorage writes.',
  'Phase 37C does not approve sync/cloud/account/auth/backend.',
  'Phase 37C does not approve telemetry/network calls.',
  'Phase 37C does not approve AI-generated themes.',
  'Phase 37C does not approve replacement of readiness evidence with UI evidence.'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(?:_V2)?\.md$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${label} missing required text: ${needle}`);
  }
}

function assertDecisionToken(text) {
  const matches = [...text.matchAll(new RegExp(`${DECISION_TOKEN}:\\s*([A-Z0-9_]+)`, 'g'))];
  if (matches.length === 0) fail(`Missing decision token: ${DECISION_TOKEN}`);
  for (const match of matches) {
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37C decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37C must include expected decision: ${EXPECTED_DECISION}`);
  }
}

function assertOriginMainAvailable() {
  try {
    git(['rev-parse', '--verify', 'origin/main']);
  } catch {
    fail('origin/main is not available locally; checkout must provide it before running this validator');
  }
}

function changedFiles() {
  const mergeBaseDiff = git(['diff', '--name-only', 'origin/main...HEAD']);
  const unstaged = git(['diff', '--name-only']);
  const staged = git(['diff', '--cached', '--name-only']);
  const untracked = git(['ls-files', '--others', '--exclude-standard']);
  return Array.from(new Set(`${mergeBaseDiff}\n${unstaged}\n${staged}\n${untracked}`
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean)
    .filter(file => !/^node_modules\//.test(file))
    .filter(file => file !== 'FETCH_HEAD'))).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 37C PR diff missing required file(s): ${missing.join(', ')}`);
  return 'pr-diff';
}

function assertChangedFiles(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }

  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37C allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiW validator retained as historical reference; not run as Phase 37C merge-blocking gate.',
    '# node scripts/validate-phase37-uiw-ui-proposal-completion-and-handoff.js',
    'Validate Phase 37C Limited Release Readiness Gap Review Return',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37C validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37C validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('evidence gap rows', combined, EVIDENCE_GAP_ROWS);
  assertIncludes('Phase 37D seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37D seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('handoff context', combined, [
    'PHASE37UIW_SELECTED_CANDIDATE: PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
    'PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_RETURN_STATUS: RECOMMENDED_RETURN_TO_READINESS_GAP_REVIEW',
    'Phase 37-uiW',
    'UI completion does not equal release readiness',
    'LIMITED_BETA_CANDIDATE',
    'Next recommended phase: PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN.'
  ]);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report|node_modules)\//.test(file)) {
      fail(`Generated artifact must not be changed or untracked: ${file}`);
    }
  }
}

function assertNoHistoricalValidatorChain() {
  const workflow = read(WORKFLOW_FILE);
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37'));
  if (activeValidatorCommands.length !== 1) {
    fail(`workflow must not run a full historical validator chain: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertNoInternalFetch() {
  const validator = read(VALIDATOR_FILE);
  if (/git\s*\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validator)) {
    fail('validator must not perform an internal git fetch');
  }
  assertIncludes('validator changed-file modes', validator, ['pr-diff', 'post-merge-main', 'validator-hotfix']);
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertChangedFiles(files, mode);
  assertNoGeneratedArtifacts(files);
  assertDocs(read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoHistoricalValidatorChain();
  assertNoInternalFetch();
  console.log(`Phase 37C Limited Release Readiness Gap Review Return validator passed (${mode}).`);
}

main();
