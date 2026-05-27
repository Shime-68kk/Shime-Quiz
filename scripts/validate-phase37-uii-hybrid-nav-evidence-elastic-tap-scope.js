#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uii-hybrid-nav-evidence-elastic-tap-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uii-hybrid-nav-evidence-elastic-tap-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uij-premium-elastic-tap-compression-token-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uii-hybrid-nav-evidence-elastic-tap-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_STATUS: COMPLETED_HYBRID_NAV_EVIDENCE_REVIEW_AND_ELASTIC_TAP_SCOPE_GATE',
  'PHASE37UII_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UII_REVIEW_SCOPE: HYBRID_NAV_EVIDENCE_REVIEW_AND_ELASTIC_TAP_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UII_SELECTED_CANDIDATE: PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT',
  'PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UII_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIJ_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT_IMPLEMENTATION',
  'HOLD_HYBRID_SLIDING_NAVIGATION_INDICATOR_EVIDENCE_REVIEW',
  'NEEDS_HYBRID_SLIDING_NAVIGATION_INDICATOR_FIXES',
  'PASS_TO_NAVIGATION_VISUAL_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_ELASTIC_TAP_COMPRESSION_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiI — Hybrid Sliding Navigation Evidence Review and Premium Elastic Tap Compression Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiH and UI plan',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiH evidence review table',
  '## Desktop Sidebar sliding indicator review',
  '## Mobile BottomNav sliding indicator review',
  '## Route, NavLink, click-handler, and page rendering preservation review',
  '## Active readability and contrast review',
  '## Focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px and safe-area review',
  '## Desktop layout review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Streak Fire / chain-effect plan note',
  '## Premium Elastic Tap risk review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Premium Elastic Tap Compression Token Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiJ allowed files / expected areas',
  '## Phase 37-uiJ forbidden areas',
  '## Evidence requirements for Phase 37-uiJ',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiI supports',
  '## What Phase 37-uiI does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiI — Hybrid Navigation Evidence Review and Elastic Tap Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## Streak Fire / chain-effect plan note',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiJ — Premium Elastic Tap Compression Token Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiI',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Responsive and motion requirements',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Button/action handler and layout restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Sidebar scoped host class',
  'Sidebar active-pill vertical movement',
  'BottomNav scoped host class',
  'BottomNav active-pill horizontal movement',
  'active text/icon readability',
  'focus-visible',
  'reduced-motion',
  'mobile safe-area preservation',
  '375px no-overflow',
  'desktop navigation layout',
  'route definitions unchanged',
  'router config unchanged',
  'NavLink destinations unchanged',
  'click handlers unchanged',
  'active page rendering unchanged',
  'package/dependency files unchanged',
  'storage/import/parser/scheduler boundaries',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'no readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Premium Elastic Tap Compression Token Pilot',
  'Streak Fire Ignition Scope Gate',
  'Collapsible Avatar Header Scope Gate',
  'Navigation Visual Backlog Review',
  'Dashboard Progress Motion Pilot',
  'Study Room Visual Backlog Review',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Return To Phase 37C Gap Review First'
];

const SEED_REQUIRED_TEXT = [
  'Phase 37-uiJ must be a bounded runtime pilot only if scoped to existing action components',
  'Preserve all action handlers',
  'form submit handlers',
  'button types',
  'disabled states',
  'route behavior',
  'storage/import/parser/scheduler/data behavior',
  'package files',
  'localStorage',
  'Do not add packages or animation libraries',
  'Do not scale text directly',
  'do not shift layout',
  'Reduced-motion fallback uses opacity/shadow only, not transform scale',
  'Do not affect disabled controls',
  'Initial targets should be bounded existing action surfaces only',
  'HOLD_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_PILOT',
  'NEEDS_PREMIUM_ELASTIC_TAP_COMPRESSION_TOKEN_REWORK',
  'PASS_TO_PHASE37UIK_PREMIUM_ELASTIC_TAP_COMPRESSION_EVIDENCE_REVIEW',
  'PASS_TO_ELASTIC_TAP_COMPRESSION_RESEARCH_ONLY'
];

const GUARDRAILS = [
  'does not approve BETA_READY',
  'public production readiness',
  'release-readiness upgrade',
  'runtime implementation in Phase 37-uiI',
  'broad UI redesign',
  'broad interaction rewrite',
  'route behavior changes',
  'event handler changes',
  'button handler changes',
  'form submission changes',
  'disabled state behavior changes',
  'package/dependency changes',
  'storage/backup/restore changes',
  'import/parser changes',
  'scheduler/FSRS changes',
  'Study Room scoring/correctness/scheduler/queue/data changes',
  'sync/cloud/account/auth/backend',
  'telemetry/network calls',
  'full Dynamic Canvas Themes',
  'full theme picker',
  'persisted preferences',
  'localStorage writes',
  'Streak Fire implementation',
  'Collapsible Header implementation',
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
      fail(`Unsupported Phase 37-uiI decision token: ${match[1]}`);
    }
  }
}

function assertOriginMainAvailable() {
  try {
    git(['rev-parse', '--verify', 'origin/main']);
  } catch {
    fail('origin/main is not available locally; provide it before running this validator');
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
  if (missing.length > 0) fail(`Phase 37-uiI PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiI PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiI allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiH validator retained as historical reference; not run as Phase 37-uiI merge-blocking gate.',
    'Validate Phase 37-uiI Hybrid Nav Evidence and Elastic Tap Scope',
    `node ${VALIDATOR_FILE}`
  ]);
  if (/continue-on-error:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error');
  if (/validate-phase\*|scripts\/validate-\*|for .*validate-phase|find .*validate-phase/.test(workflow)) {
    fail('Workflow must not use a full historical validator glob chain');
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
  if (/^\s*run:\s*\|\s*\n\s*git\s+(fetch|pull)/m.test(workflow)) {
    fail('Workflow must not include a shell remote update step');
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
  assertIncludes('Phase 37-uiJ seed', seed, SEED_REQUIRED_TEXT);
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
    /Phase 37-uiI approves?\s+BETA_READY/i,
    /Phase 37-uiI approves?\s+public production readiness/i,
    /Phase 37-uiI approves?\s+release-readiness upgrade/i,
    /Phase 37-uiI approves?\s+runtime implementation/i,
    /Phase 37-uiI approves?\s+broad UI redesign/i,
    /Phase 37-uiI approves?\s+route behavior changes/i,
    /Phase 37-uiI approves?\s+event handler changes/i,
    /Phase 37-uiI approves?\s+button handler changes/i,
    /Phase 37-uiI approves?\s+form submission changes/i,
    /Phase 37-uiI approves?\s+disabled state behavior changes/i,
    /Phase 37-uiI approves?\s+package\/dependency changes/i,
    /Phase 37-uiI approves?\s+localStorage writes/i,
    /Phase 37-uiI approves?\s+Streak Fire implementation/i,
    /Phase 37-uiI approves?\s+replacement of Phase 37C/i
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

  console.log(`Phase 37-uiI Hybrid Nav Evidence and Elastic Tap Scope validator passed (${mode}).`);
}

main();
