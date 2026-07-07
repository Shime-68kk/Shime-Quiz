#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const EVIDENCE_FILE = 'docs/testing/phase37e-manual-readiness-evidence-collection.md';
const SUMMARY_FILE = 'docs/release/phase37e-manual-readiness-evidence-collection-summary.md';
const SEED_FILE = 'docs/planning/phase37f-limited-release-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37e-manual-readiness-evidence-collection.js';

const REQUIRED_FILES = [WORKFLOW_FILE, EVIDENCE_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_STATUS: COMPLETED_MANUAL_READINESS_EVIDENCE_COLLECTION',
  'PHASE37E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37E_COLLECTION_SCOPE: MANUAL_READINESS_EVIDENCE_COLLECTION_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37E_SELECTED_CANDIDATE: PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW',
  'PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_LIMITED_RELEASE_EVIDENCE_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37E_MANUAL_READINESS_EVIDENCE_COLLECTION_DECISION';
const EXPECTED_DECISION = 'PASS_TO_PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW';
const ALLOWED_DECISIONS = [
  EXPECTED_DECISION,
  'HOLD_MANUAL_READINESS_EVIDENCE_COLLECTION',
  'NEEDS_MANUAL_READINESS_EVIDENCE_COLLECTION_FIXES',
  'PASS_TO_LIMITED_RELEASE_READINESS_HOLD',
  'PASS_TO_RUNTIME_FIX_PHASE_IF_BLOCKER_FOUND',
  'PASS_TO_PHASE37D_LIMITED_RELEASE_EVIDENCE_ACTION_PLAN'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37E — Manual Readiness Evidence Collection',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37D',
  '## Environment and limitations',
  '## Evidence collection method',
  '## Evidence summary table',
  '## Lane 1 — Manual browser readiness evidence',
  '## Lane 2 — Mobile and physical-device evidence',
  '## Lane 3 — Accessibility and assistive-technology evidence',
  '## Lane 4 — Reduced-motion and focus-visible evidence',
  '## Lane 5 — Backup, restore, and data-loss boundary evidence',
  '## Lane 6 — Import/parser evidence',
  '## Lane 7 — Local-first, privacy, telemetry, sync, account, and backend boundary evidence',
  '## Lane 8 — Long-session and stress-adjacent evidence',
  '## Lane 9 — UI modernization regression evidence',
  '## Validation/build/unit/E2E evidence',
  '## Stop conditions review',
  '## Evidence limitations',
  '## Risk impact of limitations',
  '## Readiness boundary',
  '## Beta Ready claim boundary',
  '## Decision',
  '## What Phase 37E supports',
  '## What Phase 37E does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37E — Manual Readiness Evidence Collection Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Collection result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence collected',
  '## Evidence not collected or limited',
  '## Stop conditions',
  '## Readiness boundary',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37F — Limited Release Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37E',
  '## Evidence review candidate',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Evidence review requirements',
  '## Manual browser evidence review requirements',
  '## Mobile and physical-device evidence review requirements',
  '## Accessibility and assistive-technology evidence review requirements',
  '## Reduced-motion and focus-visible evidence review requirements',
  '## Backup/restore and data-loss boundary evidence review requirements',
  '## Import/parser evidence review requirements',
  '## Local-first and privacy boundary evidence review requirements',
  '## Long-session and stress-adjacent evidence review requirements',
  '## UI modernization regression evidence review requirements',
  '## Stop condition review requirements',
  '## Readiness boundaries',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'manual browser readiness evidence',
  'mobile viewport 375px evidence',
  'desktop viewport evidence',
  'physical-device evidence',
  'accessibility and assistive-technology evidence',
  'reduced-motion evidence',
  'focus-visible evidence',
  'backup/restore evidence',
  'import/parser evidence',
  'local-first/privacy boundary evidence',
  'telemetry/network boundary evidence',
  'sync/account/backend boundary evidence',
  'long-session/stress-adjacent evidence',
  'UI modernization regression evidence',
  'validation/build/unit/E2E evidence'
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
  'HOLD_LIMITED_RELEASE_EVIDENCE_REVIEW',
  'NEEDS_ADDITIONAL_MANUAL_READINESS_EVIDENCE',
  'PASS_TO_LIMITED_RELEASE_READINESS_HOLD',
  'PASS_TO_PHASE37G_LIMITED_RELEASE_READINESS_DECISION',
  'PASS_TO_RUNTIME_FIX_PHASE_IF_BLOCKER_FOUND'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37F is evidence review, not Beta Ready by default.',
  'Phase 37F must weigh collected evidence and limitations.',
  'Phase 37F must not approve Beta Ready or public production readiness unless evidence explicitly supports a later separate readiness decision.',
  'Phase 37F must preserve `LIMITED_BETA_CANDIDATE` unless the evidence review explicitly escalates to a separate readiness decision phase.'
];

const GUARDRAILS = [
  'Phase 37E does not approve BETA_READY.',
  'Phase 37E does not approve public production readiness.',
  'Phase 37E does not approve release-readiness upgrade.',
  'Phase 37E does not approve runtime implementation in Phase 37E.',
  'Phase 37E does not approve broad UI redesign.',
  'Phase 37E does not approve Dynamic Canvas expansion.',
  'Phase 37E does not approve full Dynamic Canvas Themes runtime.',
  'Phase 37E does not approve full theme picker runtime.',
  'Phase 37E does not approve persisted theme preferences.',
  'Phase 37E does not approve account-synced preferences.',
  'Phase 37E does not approve storage/backup/restore behavior changes.',
  'Phase 37E does not approve import/parser behavior changes.',
  'Phase 37E does not approve scheduler/FSRS behavior changes.',
  'Phase 37E does not approve scoring/correctness/scheduler/queue/data changes.',
  'Phase 37E does not approve streak calculation changes.',
  'Phase 37E does not approve daily goal logic changes.',
  'Phase 37E does not approve completion logic changes.',
  'Phase 37E does not approve route behavior changes.',
  'Phase 37E does not approve event handler changes.',
  'Phase 37E does not approve package/dependency changes.',
  'Phase 37E does not approve localStorage writes.',
  'Phase 37E does not approve sessionStorage writes.',
  'Phase 37E does not approve sync/cloud/account/auth/backend.',
  'Phase 37E does not approve telemetry/network calls.',
  'Phase 37E does not approve AI-generated themes.',
  'Phase 37E does not approve replacement of readiness evidence with UI evidence.',
  'Phase 37E does not approve guaranteed data-loss prevention.'
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
  /^node_modules\//,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

const BINARY_OR_SCREENSHOT_PATTERNS = [
  /\.(?:png|jpe?g|gif|webp|avif|bmp|ico|pdf|zip|gz|tar|mp4|mov|webm)$/i,
  /(^|\/)screenshots?\//i
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37E decision token: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37E must include expected decision: ${EXPECTED_DECISION}`);
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
  if (missing.length > 0) fail(`Phase 37E PR diff missing required file(s): ${missing.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37E allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
    for (const pattern of BINARY_OR_SCREENSHOT_PATTERNS) {
      if (pattern.test(file)) fail(`Screenshot or binary artifact must not be changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37D validator retained as commented historical reference only; not run as Phase 37E merge-blocking gate.',
    '# node scripts/validate-phase37d-limited-release-evidence-action-plan.js',
    'Validate Phase 37E Manual Readiness Evidence Collection',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37E validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37E validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(evidence, summary, seed) {
  const combined = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('evidence summary rows', combined, EVIDENCE_ROWS);
  assertIncludes('stop condition rows', combined, STOP_CONDITIONS);
  assertIncludes('Phase 37F seed decision options', seed, SEED_DECISION_OPTIONS);
  assertIncludes('Phase 37F seed required text', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('handoff context', combined, [
    'generated/test data',
    'No personal/private user content',
    'not executed',
    'risk',
    'Phase 37F',
    'LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
    'Next recommended phase: PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW.'
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
  assertDocs(read(EVIDENCE_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoHistoricalValidatorChain();
  assertNoInternalFetch();
  console.log(`Phase 37E Manual Readiness Evidence Collection validator passed (${mode}).`);
}

main();
