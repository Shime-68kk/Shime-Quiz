#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uiq-ui-modernization-coherence-evidence-backlog-closure-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uiq-ui-modernization-coherence-evidence-backlog-closure-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uir-ui-backlog-closure-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uiq-ui-modernization-coherence-evidence-backlog-closure-scope.js';

const REQUIRED_FILES = [WORKFLOW_FILE, REVIEW_FILE, SUMMARY_FILE, SEED_FILE, VALIDATOR_FILE];
const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW_STATUS: COMPLETED_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW_AND_BACKLOG_CLOSURE_SCOPE_GATE',
  'PHASE37UIQ_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIQ_REVIEW_SCOPE: UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW_AND_BACKLOG_CLOSURE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIQ_SELECTED_CANDIDATE: UI_BACKLOG_CLOSURE_REVIEW',
  'PHASE37UIR_UI_BACKLOG_CLOSURE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIR_UI_BACKLOG_CLOSURE_REVIEW',
  'HOLD_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW',
  'NEEDS_UI_MODERNIZATION_COHERENCE_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY',
  'NEEDS_UI_BACKLOG_CLOSURE_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiQ — UI Modernization Coherence Evidence Review and UI Backlog Closure Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiP and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiP evidence review table',
  '## Cross-surface coherence quality review',
  '## Dashboard coherence review',
  '## Library coherence review',
  '## Study Room coherence review',
  '## Navigation coherence review',
  '## Tactile action coherence review',
  '## Completion micro-moment coherence review',
  '## Sidebar/header identity coherence review',
  '## Selector containment review',
  '## Runtime/system preservation review',
  '## Storage, localStorage, sessionStorage, and telemetry preservation review',
  '## Dynamic Canvas and theme-system guardrail review',
  '## Accessibility, contrast, and focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px review',
  '## Desktop layout review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## UI modernization arc inventory',
  '## Remaining UI backlog review',
  '## Next candidate comparison table',
  '## Selected candidate',
  '## Why UI Backlog Closure Review next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiR allowed files / expected areas',
  '## Phase 37-uiR forbidden areas',
  '## Evidence requirements for Phase 37-uiR',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiQ supports',
  '## What Phase 37-uiQ does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiQ — UI Modernization Coherence Evidence Review and Backlog Closure Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## UI modernization arc inventory',
  '## Remaining UI backlog direction',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiR — UI Backlog Closure Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiQ',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Dashboard visual coherence',
  'Library visual coherence',
  'Study Room visual coherence',
  'Hybrid navigation coherence',
  'tactile action coherence',
  'Streak Fire micro-moment coherence',
  'Sidebar/header identity coherence',
  'CSS-only implementation',
  'no optional runtime JSX changes',
  'selector containment to Phase 37 markers',
  'no design-system rewrite',
  'no Dynamic Canvas Themes',
  'no theme picker',
  'no persisted preferences',
  'no route changes',
  'no handler changes',
  'no data/storage/import/parser/scheduler changes',
  'no localStorage/sessionStorage writes',
  'no telemetry/network calls',
  'reduced-motion coverage',
  'focus-visible coverage',
  'contrast/readability',
  '375px no-overflow',
  'desktop rendering',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const ARC_ITEMS = [
  'Phase 37 Dashboard visual refresh / Dynamic Canvas token preview',
  'Phase 37 Library shelf modern collection cards',
  'Phase 37 Study Room modern answer surface',
  'Phase 37 Hybrid sliding navigation indicator',
  'Phase 37 Premium elastic tap compression',
  'Phase 37 Streak Fire ignition micro-moment',
  'Phase 37 Collapsible avatar/header identity surface',
  'Phase 37 UI Modernization Coherence Pass'
];

const CANDIDATES = [
  'UI Backlog Closure Review',
  'Phase 37C Limited Release Readiness Gap Review',
  'Dynamic Canvas Themes Design Gate Only',
  'UI Coherence Fixes',
  'Dashboard Progress Motion Pilot',
  'Study Room Visual Backlog Review',
  'Navigation Visual Backlog Review',
  'Full Dynamic Canvas Themes Runtime',
  'Full Theme Picker Runtime'
];

const GUARDRAILS = [
  'BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiQ',
  'broad UI redesign',
  'broad design-system rewrite',
  'full Dynamic Canvas Themes runtime',
  'full theme picker runtime',
  'persisted theme preferences',
  'storage/backup/restore behavior changes',
  'import/parser behavior changes',
  'scheduler/FSRS behavior changes',
  'scoring/correctness/scheduler/queue/data changes',
  'streak calculation changes',
  'daily goal logic changes',
  'completion logic changes',
  'route behavior changes',
  'event handler changes',
  'NavLink destination changes',
  'router configuration changes',
  'active page rendering changes',
  'package/dependency changes',
  'localStorage writes',
  'sessionStorage writes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'replacement of Phase 37C'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiR is review/closure only',
  'Phase 37-uiR is not automatic runtime implementation',
  'completed UI phases',
  'unresolved UI issues',
  'evidence gaps',
  'screenshots/browser evidence availability',
  'mobile/desktop/reduced-motion/focus-visible status',
  'remaining high-risk ideas',
  'readiness boundaries',
  'Phase 37C Limited Release Readiness Gap Review',
  'HOLD_UI_BACKLOG_CLOSURE_REVIEW',
  'NEEDS_UI_BACKLOG_CLOSURE_FIXES',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_DESIGN_GATE_ONLY',
  'PASS_TO_UI_TRACK_ARCHIVE_AND_HANDOFF'
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
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiQ decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiQ PR diff missing required file(s): ${missing.join(', ')}`);
  return 'pr-diff';
}

function assertForbiddenChanges(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }
  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiQ allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'Phase 37-uiP validator retained as historical reference; not run as Phase 37-uiQ merge-blocking gate.',
    '# node scripts/validate-phase37-uip-ui-modernization-coherence-pass-pilot.js',
    'Validate Phase 37-uiQ UI Modernization Coherence Evidence and Backlog Closure Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/git\s+fetch/.test(workflow)) fail('workflow must not include a shell git fetch step');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiQ validation continue-on-error');
  const activeValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37-'));
  if (activeValidatorCommands.length !== 1 || activeValidatorCommands[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only the Phase 37-uiQ validator as the active Phase 37 validator. Found: ${activeValidatorCommands.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('Phase 37-uiQ tokens', combined, REQUIRED_TOKENS);
  assertDecisionToken(combined);
  assertIncludes('evidence rows', review, EVIDENCE_ROWS);
  assertIncludes('UI modernization arc inventory', review, ARC_ITEMS);
  assertIncludes('summary UI modernization arc inventory', summary, ARC_ITEMS);
  assertIncludes('candidate rows', review, CANDIDATES);
  assertIncludes('guardrail statements', combined, GUARDRAILS);
  assertIncludes('Phase 37-uiR seed required text', seed, SEED_REQUIRED_TEXT);
}

function assertNoGeneratedArtifacts(files) {
  for (const file of files) {
    if (/^(dist|coverage|test-results|playwright-report)\//.test(file)) {
      fail(`Generated artifact must not be part of Phase 37-uiQ diff: ${file}`);
    }
  }
}

function assertNoInternalFetch() {
  const validator = read(VALIDATOR_FILE);
  if (/git\s*\(\s*\[\s*['"]fetch['"]/.test(validator) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validator)) {
    fail('validator must not perform an internal git fetch');
  }
  assertIncludes('validator post-merge safety modes', validator, ['pr-diff', 'post-merge-main', 'validator-hotfix']);
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);
  assertNoGeneratedArtifacts(files);
  assertDocs(read(REVIEW_FILE), read(SUMMARY_FILE), read(SEED_FILE));
  assertWorkflow(read(WORKFLOW_FILE));
  assertNoInternalFetch();
  console.log(`Phase 37-uiQ validator passed (${mode}).`);
}

main();
