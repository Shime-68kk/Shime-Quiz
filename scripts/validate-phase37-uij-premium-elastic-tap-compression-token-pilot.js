#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/premiumElasticTapCompressionTokenPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uij-premium-elastic-tap-compression-token-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uij-premium-elastic-tap-compression-token-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uik-premium-elastic-tap-compression-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uij-premium-elastic-tap-compression-token-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_STATUS: COMPLETED_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_IMPLEMENTATION',
  'PHASE37UIJ_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIJ_RUNTIME_SCOPE: PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_ONLY_NO_HANDLER_OR_LAYOUT_BEHAVIOR_CHANGES',
  'PHASE37UIJ_SELECTED_EFFECT: PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT',
  'PHASE37UIK_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIK_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW',
  'NEEDS_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_REWORK',
  'HOLD_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_IMPLEMENTATION',
  'PASS_TO_ELASTIC_TAP_COMPRESSION_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiI and UI plan',
  '## Action surface discovery',
  '## Disabled and handler boundary discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted action surfaces',
  '## Visual difference summary',
  '## CSS-only containment review',
  '## Handler and form behavior preservation',
  '## Disabled-state preservation',
  '## Route and navigation behavior preservation',
  '## Study Room scoring and answer behavior preservation',
  '## Storage, import, parser, and scheduler preservation',
  '## Accessibility and contrast evidence',
  '## Focus-visible evidence',
  '## Reduced-motion evidence',
  '## Mobile 375px evidence',
  '## Desktop evidence',
  '## E2E impact',
  '## Streak Fire / chain-effect deferral',
  '## Forbidden system change review',
  '## Phase 37C separation review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 37-uiJ supports',
  '## What Phase 37-uiJ does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing interaction change',
  '## Evidence summary',
  '## Limitations carried forward',
  '## Streak Fire / chain-effect deferral',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiK — Premium Elastic Tap Compression Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiJ',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiK — Premium Elastic Tap Compression Evidence Review',
  'Phase 37-uiK is evidence review only and is not automatic runtime implementation',
  'Phase 37-uiJ confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiJ does not approve BETA_READY',
  'Phase 37-uiJ does not approve public production readiness',
  'Phase 37-uiJ does not approve release-readiness upgrade',
  'Phase 37-uiJ does not approve broad UI redesign',
  'Phase 37-uiJ does not approve broad interaction rewrite',
  'Phase 37-uiJ does not approve route behavior changes',
  'Phase 37-uiJ does not approve event handler changes',
  'Phase 37-uiJ does not approve button handler changes',
  'Phase 37-uiJ does not approve form submission changes',
  'Phase 37-uiJ does not approve button type changes',
  'Phase 37-uiJ does not approve disabled state behavior changes',
  'Phase 37-uiJ does not approve package/dependency changes',
  'Phase 37-uiJ does not approve storage/backup/restore behavior changes',
  'Phase 37-uiJ does not approve import/parser behavior changes',
  'Phase 37-uiJ does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiJ does not approve Study Room scoring/correctness/scheduler/queue/data changes',
  'Phase 37-uiJ does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiJ does not approve telemetry/network calls',
  'Phase 37-uiJ does not approve full Dynamic Canvas Themes',
  'Phase 37-uiJ does not approve full theme picker',
  'Phase 37-uiJ does not approve persisted theme preferences',
  'Phase 37-uiJ does not approve localStorage writes',
  'Phase 37-uiJ does not approve Streak Fire implementation',
  'Phase 37-uiJ does not approve Collapsible Header implementation',
  'Phase 37-uiJ does not replace Phase 37C Limited Release Readiness Gap Review'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiK is evidence review only',
  'Phase 37-uiK is not automatic runtime implementation',
  'target selector containment',
  'no handler changes',
  'no button type changes',
  'no form behavior changes',
  'no disabled-control effect',
  'no layout shift',
  'no direct text scaling',
  'reduced-motion fallback',
  'mouse/touch press behavior',
  'keyboard focus-visible',
  'mobile 375px',
  'desktop behavior',
  'E2E smoke/onboarding',
  'Phase 37C separation',
  'HOLD_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW',
  'NEEDS_PREMIUM_ELASTIC_TAP_COMPRESSION_FIXES',
  'PASS_TO_STREAK_FIRE_IGNITION_SCOPE_GATE',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_SCOPE_GATE',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'must not approve broad interaction rewrite, Streak Fire, Collapsible Header, release readiness, or Beta Ready'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^tests\/(?!unit\/premiumElasticTapCompressionTokenPilot\.test\.jsx$)/,
  /^e2e\//,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/routes\//,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
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
      fail(`Unsupported Phase 37-uiJ decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiJ PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiJ PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiJ allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiI validator retained as historical reference; not run as Phase 37-uiJ merge-blocking gate.',
    '# node scripts/validate-phase37-uii-hybrid-nav-evidence-elastic-tap-scope.js',
    'Validate Phase 37-uiJ Premium Elastic Tap Compression Token Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
  }
  if (/^\s*git\s+fetch\s+origin\s+refs\/heads\/main:refs\/remotes\/origin\/main\s+--prune/m.test(workflow)) {
    fail('Workflow must not include the forbidden shell remote update command');
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

function assertCss(css) {
  assertIncludes('CSS', css, [
    'Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot',
    '--phase37uij-elastic-tap-press-transform: translateY(1px) scale(0.985)',
    '--phase37uij-elastic-tap-shadow',
    '--phase37uij-elastic-tap-restoration',
    '--phase37uij-elastic-tap-reduced-opacity',
    '.button, .navItem, .bottomNav__item, .libraryTab, .dashboardCalmTab, .choiceOption',
    ".button:not(:disabled):not([aria-disabled='true']):not([aria-busy='true'])",
    ".libraryTab:not(:disabled):not([aria-disabled='true'])",
    ".dashboardCalmTab:not(:disabled):not([aria-disabled='true'])",
    ".choiceOption:not([aria-disabled='true'])",
    'box-shadow: var(--phase37uij-elastic-tap-shadow)',
    'transform: var(--phase37uij-elastic-tap-press-transform)',
    ':focus-visible:active',
    '@media (prefers-reduced-motion: reduce)',
    'opacity: var(--phase37uij-elastic-tap-reduced-opacity)',
    'transform: none'
  ]);
  if (/\.button:active\s*\{[\s\S]*transform:\s*var\(--phase37uij-elastic-tap-press-transform\)/.test(css)) {
    fail('CSS must exclude disabled and busy controls from Phase 37-uiJ compression');
  }
  if (/localStorage\s*\.\s*(setItem|removeItem|clear)|setAttribute\(['"]data-theme/.test(css)) {
    fail('CSS must not contain persistence or theme mutation behavior');
  }
  const reducedMotionBlock = css.match(/@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{[\s\S]*?--phase37uij-elastic-tap-reduced-opacity[\s\S]*?\n\}/);
  if (!reducedMotionBlock || !reducedMotionBlock[0].includes('transform: none')) {
    fail('Reduced-motion fallback must avoid transform scale');
  }
}

function assertTest(test) {
  assertIncludes('unit test', test, [
    'Phase 37-uiJ',
    'CSS-only',
    'excludes disabled or busy buttons',
    'reduced-motion feedback without transform scale',
    'post-merge-main safe'
  ]);
}

function assertDocs(evidence, summary, seed) {
  const docs = `${evidence}\n${summary}\n${seed}`;
  assertIncludes('evidence headings', evidence, EVIDENCE_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('seed requirements', seed, SEED_REQUIRED_TEXT);
  assertIncludes('scope boundary docs', docs, [
    '.button',
    '.navItem',
    '.bottomNav__item',
    '.libraryTab',
    '.dashboardCalmTab',
    '.choiceOption',
    'CSS-only',
    'disabled',
    'focus-visible',
    'reduced-motion',
    'Streak Fire remains deferred',
    'Phase 37C remains separate',
    'pr-diff',
    'post-merge-main',
    'validator-hotfix'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiJ approves?\s+BETA_READY/i,
    /Phase 37-uiJ approves?\s+public production readiness/i,
    /Phase 37-uiJ approves?\s+release-readiness upgrade/i,
    /Phase 37-uiJ approves?\s+broad UI redesign/i,
    /Phase 37-uiJ approves?\s+broad interaction rewrite/i,
    /Phase 37-uiJ approves?\s+route behavior changes/i,
    /Phase 37-uiJ approves?\s+event handler changes/i,
    /Phase 37-uiJ approves?\s+button handler changes/i,
    /Phase 37-uiJ approves?\s+form submission changes/i,
    /Phase 37-uiJ approves?\s+button type changes/i,
    /Phase 37-uiJ approves?\s+disabled state behavior changes/i,
    /Phase 37-uiJ approves?\s+package\/dependency changes/i,
    /Phase 37-uiJ approves?\s+localStorage writes/i,
    /Phase 37-uiJ approves?\s+Streak Fire implementation/i,
    /Phase 37-uiJ approves?\s+Collapsible Header implementation/i,
    /\b(changed|updated|modified)\s+(handler|button type|form submission|route behavior|storage|scheduler|import|parser)\b/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval claim: ${pattern}`);
  }
  if (/localStorage\s*\.\s*(setItem|removeItem|clear)/.test(docs)) {
    fail('Docs must not describe localStorage mutation');
  }
}

function assertValidatorSelfSource(source) {
  if (source.includes(`git(['${'fetch'}`)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable',
    'classifyDiffMode',
    'assertForbiddenChanges'
  ]);
}

function main() {
  assertOriginMainAvailable();
  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  for (const file of REQUIRED_FILES) read(file);

  const workflow = read(WORKFLOW_FILE);
  const css = read(CSS_FILE);
  const test = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertCss(css);
  assertTest(test);
  assertDocs(evidence, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiJ Premium Elastic Tap Compression Token Pilot validator passed (${mode}).`);
}

main();
