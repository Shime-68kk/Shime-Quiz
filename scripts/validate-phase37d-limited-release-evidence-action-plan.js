#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const PLAN_FILE = 'docs/planning/phase37d-limited-release-evidence-action-plan.md';
const SUMMARY_FILE = 'docs/release/phase37d-limited-release-evidence-action-plan-summary.md';
const SEED_FILE = 'docs/testing/phase37e-manual-readiness-evidence-collection-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37d-limited-release-evidence-action-plan.js';

const REQUIRED_FILES = [WORKFLOW_FILE, PLAN_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_STATUS: COMPLETED_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN',
  'PHASE37D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37D_PLAN_SCOPE: LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37D_SELECTED_CANDIDATE: PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION',
  'PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_SEED_STATUS: PREPARED_MANUAL_EVIDENCE_COLLECTION_SEED'
];

const DECISION_TOKEN = 'PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_DECISION';
const EXPECTED_DECISION = 'PASS_TO_PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'HOLD_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN',
  'NEEDS_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN_FIXES',
  'PASS_TO_LIMITED_RELEASE_READINESS_HOLD',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW'
];

const PLAN_HEADINGS = [
  '# Phase 37D — Limited Release Evidence Action Plan',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37C',
  '## Action plan method',
  '## Current readiness boundary',
  '## Evidence principles',
  '## Evidence lanes overview',
  '## Lane 1 — Manual browser readiness evidence',
  '## Lane 2 — Mobile and physical-device evidence',
  '## Lane 3 — Accessibility and assistive-technology evidence',
  '## Lane 4 — Reduced-motion and focus-visible evidence',
  '## Lane 5 — Backup, restore, and data-loss boundary evidence',
  '## Lane 6 — Import/parser evidence',
  '## Lane 7 — Local-first, privacy, telemetry, sync, account, and backend boundary evidence',
  '## Lane 8 — Long-session and stress-adjacent evidence',
  '## Lane 9 — UI modernization regression evidence',
  '## Evidence templates',
  '## Anonymization and privacy rules',
  '## Stop conditions',
  '## Pass / hold / needs-fix criteria',
  '## Evidence files expected from Phase 37E',
  '## Validation commands for Phase 37E',
  '## Runtime and system boundaries',
  '## Beta Ready claim boundary',
  '## Limited release risk position',
  '## Selected candidate',
  '## Why Phase 37E Manual Readiness Evidence Collection next',
  '## Why this is an action plan, not runtime implementation',
  '## Phase 37E allowed files / expected areas',
  '## Phase 37E forbidden areas',
  '## Rollback / hold plan',
  '## Chosen action plan decision',
  '## Decision rationale',
  '## What Phase 37D supports',
  '## What Phase 37D does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37D — Limited Release Evidence Action Plan Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Action plan result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence lanes',
  '## Stop conditions',
  '## Evidence gaps addressed',
  '## Readiness boundary',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37E — Manual Readiness Evidence Collection Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37D',
  '## Evidence collection candidate',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Manual browser evidence requirements',
  '## Mobile and physical-device evidence requirements',
  '## Accessibility and assistive-technology evidence requirements',
  '## Reduced-motion and focus-visible requirements',
  '## Backup/restore and data-loss boundary evidence requirements',
  '## Import/parser evidence requirements',
  '## Local-first and privacy boundary evidence requirements',
  '## Long-session and stress-adjacent evidence requirements',
  '## UI modernization regression evidence requirements',
  '## Evidence templates',
  '## Stop conditions',
  '## Readiness boundaries',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_LANE_ROWS = [
  'manual browser readiness evidence',
  'mobile and physical-device evidence',
  'accessibility and assistive-technology evidence',
  'reduced-motion and focus-visible evidence',
  'backup/restore and data-loss boundary evidence',
  'import/parser evidence',
  'local-first/privacy/telemetry/sync/account/backend boundary evidence',
  'long-session and stress-adjacent evidence',
  'UI modernization regression evidence'
];

const STOP_CONDITIONS = [
  'data loss or suspected data loss',
  'storage/backup/restore inconsistency',
  'import/parser corruption or mismatch',
  'route/navigation blocker',
  'inaccessible keyboard/focus path',
  'unreadable contrast',
  'reduced-motion violation',
  'unexpected localStorage/sessionStorage writes',
  'telemetry/network/sync/account/backend behavior appears',
  'validation/build/unit/E2E failure'
];

const SEED_DECISION_OPTIONS = [
  'HOLD_MANUAL_READINESS_EVIDENCE_COLLECTION',
  'NEEDS_MANUAL_READINESS_EVIDENCE_COLLECTION_FIXES',
  'PASS_TO_PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW',
  'PASS_TO_LIMITED_RELEASE_READINESS_HOLD',
  'PASS_TO_RUNTIME_FIX_PHASE_IF_BLOCKER_FOUND'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37E is evidence collection, not Beta Ready.',
  'Phase 37E may produce docs/evidence records and screenshots if explicitly scoped',
  'must not implement runtime changes',
  'must use generated/test data only and avoid personal/private user content',
  'must not approve Beta Ready or public production readiness',
  'manual browser',
  'mobile/physical device',
  'assistive tech',
  'reduced motion',
  'focus-visible',
  'backup/restore',
  'import/parser',
  'local-first/privacy boundaries',
  'long-session/stress-adjacent',
  'UI modernization regression'
];

const GUARDRAILS = [
  'Phase 37D does not approve BETA_READY.',
  'Phase 37D does not approve public production readiness.',
  'Phase 37D does not approve release-readiness upgrade.',
  'Phase 37D does not approve runtime implementation in Phase 37D.',
  'Phase 37D does not approve broad UI redesign.',
  'Phase 37D does not approve Dynamic Canvas expansion.',
  'Phase 37D does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37D does not approve full theme picker runtime.',
  'Phase 37D does not approve persisted theme preferences.',
  'Phase 37D does not approve account-synced preferences.',
  'Phase 37D does not approve storage/backup/restore behavior changes.',
  'Phase 37D does not approve import/parser behavior changes.',
  'Phase 37D does not approve scheduler/FSRS behavior changes.',
  'Phase 37D does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37D does not approve streak calculation changes.',
  'Phase 37D does not approve daily goal logic changes.',
  'Phase 37D does not approve completion logic changes.',
  'Phase 37D does not approve route behavior changes.',
  'Phase 37D does not approve event handler changes.',
  'Phase 37D does not approve package/dependency changes.',
  'Phase 37D does not approve localStorage writes.',
  'Phase 37D does not approve sessionStorage writes.',
  'Phase 37D does not approve sync/cloud/account/auth/backend.',
  'Phase 37D does not approve telemetry/network calls.',
  'Phase 37D does not approve AI-generated themes.',
  'Phase 37D does not approve replacement of readiness evidence with UI evidence.',
  'Phase 37D does not approve guaranteed data-loss prevention.'
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37D decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37D must include expected decision: ${EXPECTED_DECISION}`);
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
  if (missing.length > 0) fail(`Phase 37D PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37D allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37C validator retained as historical reference; not run as Phase 37D merge-blocking gate.',
    '# node scripts/validate-phase37c-limited-release-readiness-gap-review-return.js',
    'Validate Phase 37D Limited Release Evidence Action Plan',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37D validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37D validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(plan, summary, seed) {
  const combined = `${plan}\n${summary}\n${seed}`;
  assertIncludes('plan headings', plan, PLAN_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('evidence lane rows', combined, EVIDENCE_LANE_ROWS);
  assertIncludes('stop condition rows', combined, STOP_CONDITIONS);
  assertIncludes('Phase 37E seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37E seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('handoff context', combined, [
    'Phase 37C',
    'LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
    'UI completion does not equal release readiness',
    'generated/test data',
    'anonymized',
    'pass/hold/needs-fix',
    'Next recommended phase: PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION.'
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
  assertDocs(read(PLAN_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoHistoricalValidatorChain();
  assertNoInternalFetch();
  console.log(`Phase 37D Limited Release Evidence Action Plan validator passed (${mode}).`);
}

main();
