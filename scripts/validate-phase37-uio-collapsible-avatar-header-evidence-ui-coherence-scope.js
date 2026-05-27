#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uio-collapsible-avatar-header-evidence-ui-coherence-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uio-collapsible-avatar-header-evidence-ui-coherence-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uip-ui-modernization-coherence-pass-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uio-collapsible-avatar-header-evidence-ui-coherence-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_STATUS: COMPLETED_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE',
  'PHASE37UIO_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIO_REVIEW_SCOPE: COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_AND_UI_COHERENCE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIO_SELECTED_CANDIDATE: UI_MODERNIZATION_COHERENCE_PASS_PILOT',
  'PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIP_UI_MODERNIZATION_COHERENCE_PASS_PILOT_IMPLEMENTATION',
  'HOLD_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW',
  'NEEDS_COLLAPSIBLE_AVATAR_HEADER_FIXES',
  'PASS_TO_UI_BACKLOG_CLOSURE_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_UI_COHERENCE_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiO — Collapsible Avatar Header Evidence Review and UI Modernization Coherence Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiN and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiN evidence review table',
  '## Collapsible avatar/header visual quality review',
  '## One-surface containment review',
  '## Header/avatar surface attachment review',
  '## Route, NavLink, navigation, and page rendering preservation review',
  '## Auth, account, profile, storage, localStorage, sessionStorage, and telemetry preservation review',
  '## Accessibility, contrast, and focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px and sidebar-hidden behavior review',
  '## Desktop layout review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## UI modernization coherence risk review',
  '## Modernized surface inventory',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why UI Modernization Coherence Pass Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiP allowed files / expected areas',
  '## Phase 37-uiP forbidden areas',
  '## Evidence requirements for Phase 37-uiP',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiO supports',
  '## What Phase 37-uiO does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiO — Collapsible Avatar Header Evidence Review and UI Coherence Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## Modernized surface inventory',
  '## UI coherence guardrails',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiP — UI Modernization Coherence Pass Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiO',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Responsive and motion requirements',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Cross-surface coherence restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Sidebar brand identity passive marker',
  'exact header/avatar/sidebar brand attachment',
  'scoped cream/moss paper-glass CSS containment',
  'no collapse engine',
  'no scroll listener',
  'no auth/account/profile backend',
  'no account menu',
  'no avatar upload',
  'no persisted identity',
  'no cloud sync',
  'no storage/localStorage/sessionStorage writes',
  'no telemetry/network calls',
  'route definitions unchanged',
  'NavLink destinations unchanged',
  'active page rendering unchanged',
  'Sidebar navigation semantics unchanged',
  'BottomNav unchanged',
  'package/dependency files unchanged',
  'reduced-motion fallback',
  'focus-visible unaffected',
  'mobile sidebar-hidden behavior',
  '375px no-overflow',
  'desktop rendering',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const MODERNIZED_SURFACES = [
  'Dashboard visual refresh / Dynamic Canvas token preview',
  'Library shelf modern collection cards',
  'Study Room modern answer surface',
  'Hybrid sliding navigation indicator',
  'Premium elastic tap compression',
  'Streak Fire ignition micro-moment',
  'Collapsible avatar/header identity surface'
];

const CANDIDATE_ROWS = [
  'UI Modernization Coherence Pass Pilot',
  'UI Backlog Closure Review',
  'Dashboard Progress Motion Pilot',
  'Study Room Visual Backlog Review',
  'Navigation Visual Backlog Review',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Phase 37C Limited Release Readiness Gap Review First'
];

const SEED_REQUIRED_TEXT = [
  'UI Modernization Coherence Pass Pilot',
  'visual coherence across already-modernized Phase 37 surfaces',
  'surface language',
  'density',
  'border glow',
  'shadow',
  'motion timing',
  'CSS and at most two runtime files',
  'passive class alignment',
  'must not redesign flows',
  'change copy',
  'change layout architecture',
  'add themes',
  'add preferences',
  'design-system rewrite',
  'routing',
  'handlers',
  'storage/import/parser/scheduler/scoring/queue/data/streak/completion logic',
  'auth/profile/backend',
  'telemetry',
  'packages',
  'localStorage/sessionStorage',
  'Phase 37C boundaries',
  'HOLD_UI_MODERNIZATION_COHERENCE_PASS_PILOT',
  'NEEDS_UI_MODERNIZATION_COHERENCE_PASS_REWORK',
  'PASS_TO_PHASE37UIQ_UI_MODERNIZATION_COHERENCE_EVIDENCE_REVIEW',
  'PASS_TO_UI_COHERENCE_RESEARCH_ONLY'
];

const GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiO',
  'broad UI redesign',
  'broad design-system rewrite',
  'full Dynamic Canvas Themes',
  'full theme picker',
  'persisted theme preferences',
  'auth/account/profile backend',
  'avatar upload',
  'cloud identity',
  'storage/backup/restore changes',
  'import/parser changes',
  'scheduler/FSRS changes',
  'scoring/queue/data changes',
  'streak/daily-goal/completion changes',
  'route behavior changes',
  'event handler changes',
  'NavLink/router/page-rendering changes',
  'package changes',
  'localStorage/sessionStorage writes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'replacement of Phase 37C'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^docs\/testing\//,
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

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
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
    if (!ALLOWED_DECISIONS.includes(match[1])) {
      fail(`Unsupported Phase 37-uiO decision token: ${match[1]}`);
    }
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
  if (missing.length > 0) fail(`Phase 37-uiO PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiO PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiO allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiN validator retained as historical reference; not run as Phase 37-uiO merge-blocking gate.',
    '# node scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js',
    'Validate Phase 37-uiO Collapsible Avatar Header Evidence and UI Coherence Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  if (/^\s*run:\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) {
    fail('Workflow must not include a shell remote update step');
  }
  const activePhaseValidatorCommands = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase'));
  for (const command of activePhaseValidatorCommands) {
    if (command !== `node ${VALIDATOR_FILE}`) {
      fail(`Prior phase validator is active as a blocker: ${command}`);
    }
  }
}

function assertDocs(review, summary, seed) {
  const docs = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('evidence rows', review, EVIDENCE_ROWS);
  assertIncludes('modernized surface inventory', docs, MODERNIZED_SURFACES);
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37-uiP seed', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrails', docs, GUARDRAILS);
  assertIncludes('validator safety docs', docs, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'exact changed-file allowlist',
    'no generated artifacts',
    'no active historical validator chain'
  ]);
}

function assertValidatorSelfSource(source) {
  if (/\bgit\s+(fetch|pull)\b/.test(source)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable',
    'classifyDiffMode',
    'assertForbiddenChanges',
    'FORBIDDEN_CHANGE_PATTERNS'
  ]);
}

function main() {
  assertOriginMainAvailable();
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  for (const file of REQUIRED_FILES) read(file);

  const workflow = read(WORKFLOW_FILE);
  const review = read(REVIEW_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertDocs(review, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiO Collapsible Avatar Header Evidence and UI Coherence Scope validator passed (${mode}).`);
}

main();
