#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uik-elastic-tap-evidence-streak-fire-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uik-elastic-tap-evidence-streak-fire-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uil-streak-fire-ignition-micro-moment-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uik-elastic-tap-evidence-streak-fire-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIK_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW_STATUS: COMPLETED_ELASTIC_TAP_EVIDENCE_REVIEW_AND_STREAK_FIRE_SCOPE_GATE',
  'PHASE37UIK_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIK_REVIEW_SCOPE: ELASTIC_TAP_EVIDENCE_REVIEW_AND_STREAK_FIRE_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIK_SELECTED_CANDIDATE: STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT',
  'PHASE37UIL_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIK_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIL_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT_IMPLEMENTATION',
  'HOLD_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW',
  'NEEDS_PREMIUM_ELASTIC_TAP_COMPRESSION_FIXES',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_STREAK_FIRE_IGNITION_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiK — Premium Elastic Tap Evidence Review and Streak Fire Ignition Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiJ and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiJ evidence review table',
  '## Elastic tap visual quality review',
  '## Target selector containment review',
  '## Handler, form, and button-type preservation review',
  '## Disabled and busy state preservation review',
  '## Focus-visible review',
  '## Reduced-motion fallback review',
  '## Mobile 375px and desktop review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Streak Fire risk review',
  '## Chain-effect pressure guardrail review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Streak Fire Ignition Micro-Moment Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiL allowed files / expected areas',
  '## Phase 37-uiL forbidden areas',
  '## Evidence requirements for Phase 37-uiL',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiK supports',
  '## What Phase 37-uiK does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiK — Elastic Tap Evidence Review and Streak Fire Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## Streak Fire pressure guardrails',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiL — Streak Fire Ignition Micro-Moment Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiK',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Calm motivation and pressure guardrails',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Completion state, streak logic, and persistence restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'CSS-only implementation',
  'bounded target selectors',
  '`.button` press behavior',
  '`.navItem` press behavior',
  '`.bottomNav__item` press behavior',
  '`.libraryTab` press behavior',
  '`.dashboardCalmTab` press behavior',
  '`.choiceOption` press behavior',
  'disabled controls excluded',
  'busy controls excluded',
  'no handler changes',
  'no form submission changes',
  'no button type changes',
  'no route behavior changes',
  'no direct text scaling',
  'no layout-affecting properties',
  'reduced-motion fallback',
  'focus-visible preservation',
  'mobile 375px behavior',
  'desktop behavior',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Streak Fire Ignition Micro-Moment Pilot',
  'Collapsible Avatar Header Scope Gate',
  'Elastic Tap Expansion Backlog',
  'Study Room Visual Backlog Review',
  'Navigation Visual Backlog Review',
  'Dashboard Progress Motion Pilot',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Return To Phase 37C Gap Review First'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiL is a runtime pilot only if a safe existing completion/success surface exists',
  'brief, quiet visual acknowledgement when an existing completion/success state appears',
  'must not implement or modify streak calculation',
  'must not add a streak counter',
  'daily goal engine',
  'loss aversion',
  'penalty messaging',
  'social pressure',
  'sound',
  'confetti',
  'casino-like reward loop',
  'persistent chain status',
  'must not write localStorage or storage',
  'must not change scheduler/FSRS',
  'scoring',
  'queue',
  'Study data',
  'routes',
  'handlers',
  'packages',
  'sync/cloud/account/auth/backend',
  'telemetry',
  'static glow instead of animation',
  'If no safe existing completion/success state is discovered, Phase 37-uiL must HOLD or switch to research-only',
  'HOLD_STREAK_FIRE_IGNITION_MICRO_MOMENT_PILOT',
  'NEEDS_STREAK_FIRE_IGNITION_MICRO_MOMENT_REWORK',
  'PASS_TO_PHASE37UIM_STREAK_FIRE_IGNITION_MICRO_MOMENT_EVIDENCE_REVIEW',
  'PASS_TO_STREAK_FIRE_IGNITION_RESEARCH_ONLY'
];

const GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiK',
  'broad UI redesign',
  'Streak Fire runtime implementation',
  'streak calculation changes',
  'daily goal logic changes',
  'completion logic changes',
  'scoring/correctness/scheduler/queue/data changes',
  'storage/backup/restore changes',
  'import/parser changes',
  'route behavior changes',
  'event handler changes',
  'button handler changes',
  'form submission changes',
  'disabled state behavior changes',
  'package/dependency changes',
  'scheduler/FSRS changes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'localStorage writes',
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
      fail(`Unsupported Phase 37-uiK decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiK PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiK PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiK allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiJ validator retained as historical reference; not run as Phase 37-uiK merge-blocking gate.',
    '# node scripts/validate-phase37-uij-premium-elastic-tap-compression-token-pilot.js',
    'Validate Phase 37-uiK Elastic Tap Evidence and Streak Fire Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  if (/^\s*run:\s*\|\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) {
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
  assertIncludes('candidate rows', review, CANDIDATE_ROWS);
  assertIncludes('Phase 37-uiL seed', seed, SEED_REQUIRED_TEXT);
  assertIncludes('guardrails', docs, GUARDRAILS);
  assertIncludes('validator safety docs', docs, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'exact changed-file allowlist',
    'no generated artifacts',
    'no active historical validator chain'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiK approves?\s+BETA_READY/i,
    /Phase 37-uiK approves?\s+public production readiness/i,
    /Phase 37-uiK approves?\s+release-readiness upgrade/i,
    /Phase 37-uiK approves?\s+runtime implementation/i,
    /Phase 37-uiK approves?\s+broad UI redesign/i,
    /Phase 37-uiK approves?\s+Streak Fire runtime implementation/i,
    /Phase 37-uiK approves?\s+streak calculation changes/i,
    /Phase 37-uiK approves?\s+daily goal logic changes/i,
    /Phase 37-uiK approves?\s+completion logic changes/i,
    /Phase 37-uiK approves?\s+scoring\/correctness\/scheduler\/queue\/data changes/i,
    /Phase 37-uiK approves?\s+storage\/backup\/restore changes/i,
    /Phase 37-uiK approves?\s+import\/parser changes/i,
    /Phase 37-uiK approves?\s+localStorage writes/i,
    /Phase 37-uiK approves?\s+replacement of Phase 37C/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  if (/git\s+fetch|git\s+pull/.test(source)) fail('Validator must not update remotes internally');
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

  console.log(`Phase 37-uiK Elastic Tap Evidence and Streak Fire Scope validator passed (${mode}).`);
}

main();
