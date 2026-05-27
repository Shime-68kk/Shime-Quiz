#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const REVIEW_FILE = 'docs/review/phase37-uic-dynamic-canvas-token-preview-evidence-library-scope.md';
const SUMMARY_FILE = 'docs/release/phase37-uic-dynamic-canvas-token-preview-evidence-library-scope-summary.md';
const SEED_FILE = 'docs/planning/phase37-uid-library-shelf-modern-collection-cards-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uic-dynamic-canvas-token-preview-evidence-library-scope.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  REVIEW_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_STATUS: COMPLETED_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_AND_LIBRARY_SCOPE_GATE',
  'PHASE37UIC_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIC_REVIEW_SCOPE: DYNAMIC_CANVAS_TOKEN_PREVIEW_EVIDENCE_REVIEW_AND_LIBRARY_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIC_SELECTED_CANDIDATE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT',
  'PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION',
  'HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW',
  'NEEDS_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_FIXES',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_BACKLOG_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW',
  'NEEDS_LIBRARY_SHELF_MODERN_CARDS_RESEARCH'
];

const REVIEW_HEADINGS = [
  '# Phase 37-uiC — Dynamic Canvas Token Preview Evidence Review and Library Shelf Modern Cards Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiB',
  '## UI leadership direction',
  '## Review method',
  '## Phase 37-uiB evidence review table',
  '## Dashboard token preview containment review',
  '## Persistence and theme-key boundary review',
  '## Theme ownership boundary review',
  '## Visual difference review',
  '## Accessibility, contrast, and focus-visible review',
  '## Reduced-motion review',
  '## Mobile 375px and desktop review',
  '## E2E smoke and onboarding review',
  '## Phase 37C release-readiness separation review',
  '## Next visual candidate comparison table',
  '## Selected candidate',
  '## Why Library Shelf Modern Collection Cards Pilot next',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiD allowed files / expected areas',
  '## Phase 37-uiD forbidden areas',
  '## Evidence requirements for Phase 37-uiD',
  '## Rollback / hold plan',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 37-uiC supports',
  '## What Phase 37-uiC does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiC — Dynamic Canvas Token Preview Evidence Review and Library Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Selected candidate',
  '## Evidence accepted',
  '## Limitations carried forward',
  '## Next visual direction',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiC',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Mobile and desktop requirements',
  '## Import, parser, storage, and Library tab restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'Dashboard scoped host class',
  'Dashboard-only CSS selector containment',
  'Visual token-preview treatment',
  'No localStorage writes',
  'No existing theme key mutation',
  'No full theme picker',
  'No persisted preferences',
  'No global theme system',
  'Theme ownership files unchanged',
  'Contrast/readability',
  'Focus-visible',
  'Reduced-motion',
  '375px Dashboard no-overflow',
  'Desktop Dashboard',
  'E2E smoke',
  'E2E onboarding',
  'Phase 37C separation',
  'No readiness upgrade'
];

const CANDIDATE_ROWS = [
  'Library Shelf Modern Collection Cards Pilot',
  'Study Room Modern Answer Surface Pilot',
  'Dashboard Token Preview Expansion',
  'Library Workshop Import Surface Visual Refresh',
  'BottomNav Visual Identity Follow-up',
  'Full Dynamic Canvas Themes',
  'Full Theme Picker',
  'Persisted Theme Preferences',
  'Streak Fire',
  'Collapsible Header',
  'Return To Phase 37C Gap Review First'
];

const SEED_DECISIONS = [
  'HOLD_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT',
  'NEEDS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_REWORK',
  'PASS_TO_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW',
  'PASS_TO_LIBRARY_SHELF_VISUAL_RESEARCH_ONLY'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiD is a runtime pilot only if scoped to Library shelf visual cards',
  'visually fresher and more modern than previous Library polish',
  'stronger card treatment',
  'shelf atmosphere',
  'collection-card depth',
  'subtle gradients',
  'border/glow tokens',
  'modern empty-state framing',
  'hover/focus affordances',
  'preserve Library tabs',
  'aria-selected',
  'aria-controls',
  'panel mounting',
  'raw input preservation',
  'importStatus',
  'import tools',
  'parser behavior',
  'file import behavior',
  'storage/backup/restore behavior',
  'routes/navigation',
  'sync/backend/auth/telemetry',
  'must not touch Study Room',
  'Dashboard',
  'BottomNav',
  'Sidebar',
  'App',
  'main',
  'theme persistence files',
  'design-system token ownership files',
  'must not implement Dynamic Canvas full theme system',
  'theme picker',
  'persisted preferences',
  'localStorage writes',
  'global theme system',
  '375px Library evidence',
  'desktop evidence',
  'focus-visible evidence',
  'reduced-motion evidence',
  'contrast/readability evidence',
  'import/workshop reachability evidence',
  'e2e smoke',
  'onboarding e2e',
  'rollback notes'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiD — Library Shelf Modern Collection Cards Pilot',
  'Phase 37-uiD is a small runtime pilot and is not automatic broad redesign',
  'Phase 37-uiC confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiC does not approve BETA_READY',
  'Phase 37-uiC does not approve public production readiness',
  'Phase 37-uiC does not approve full Dynamic Canvas Themes',
  'Phase 37-uiC does not approve full theme picker',
  'Phase 37-uiC does not approve persisted theme preferences',
  'Phase 37-uiC does not approve localStorage writes',
  'Phase 37-uiC does not approve mutation of the existing theme key',
  'Phase 37-uiC does not approve account-synced preferences',
  'Phase 37-uiC does not approve a global theme system',
  'Phase 37-uiC does not approve storage/backup/restore behavior changes',
  'Phase 37-uiC does not approve import/parser behavior changes',
  'Phase 37-uiC does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiC does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiC does not approve telemetry/network calls',
  'Phase 37-uiC does not approve route behavior changes',
  'Phase 37-uiC does not approve event handler changes',
  'Phase 37-uiC does not approve package/dependency changes',
  'Phase 37-uiC does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37-uiC does not approve Streak Fire',
  'Phase 37-uiC does not approve Collapsible Header',
  'Phase 37-uiC does not approve release-readiness upgrade',
  'Phase 37-uiC does not replace Phase 37C Limited Release Readiness Gap Review'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37-uid-library-shelf-modern-collection-cards-pilot-seed\.md$)/,
  /^docs\/release\/phase(?!37-uic-dynamic-canvas-token-preview-evidence-library-scope-summary\.md$)/,
  /^docs\/review\/phase(?!37-uic-dynamic-canvas-token-preview-evidence-library-scope\.md$)/,
  /^docs\/testing\//,
  /^scripts\/validate-phase(?!37-uic-dynamic-canvas-token-preview-evidence-library-scope\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  throw new Error(message);
}

function read(file) {
  const fullPath = path.resolve(ROOT, file);
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
      fail(`Unsupported Phase 37-uiC decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiC PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiC PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiC allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Validate Phase 37-uiC Dynamic Canvas Token Preview Evidence and Library Scope',
    `node ${VALIDATOR_FILE}`,
    'Phase 37-uiB validator retained as historical reference'
  ]);
  const forbiddenWorkflowFetch = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (workflow.includes(forbiddenWorkflowFetch)) {
    fail('Workflow must not shell out to update origin/main');
  }
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
}

function assertDocs(review, summary, seed) {
  const docs = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('docs tokens', docs, REQUIRED_TOKENS);
  assertDecisionToken(docs);
  assertIncludes('evidence table rows', review, EVIDENCE_ROWS);
  assertIncludes('candidate table rows', review, CANDIDATE_ROWS);
  assertIncludes('seed decisions', seed, SEED_DECISIONS);
  assertIncludes('seed scope statements', seed, SEED_SCOPE_STATEMENTS);
  assertIncludes('guardrails', docs, REQUIRED_GUARDRAILS);
  assertIncludes('scope boundary docs', docs, [
    'docs/review/research/release/planning/static-validator/CI-only',
    'no runtime behavior changes',
    'Phase 37C Limited Release Readiness Gap Review remains separate',
    'Phase 37-uiD is a small runtime pilot and is not automatic broad redesign'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiC approves?\s+BETA_READY/i,
    /Phase 37-uiC approves?\s+public production readiness/i,
    /Phase 37-uiC approves?\s+full Dynamic Canvas Themes/i,
    /Phase 37-uiC approves?\s+full theme picker/i,
    /Phase 37-uiC approves?\s+persisted theme preferences/i,
    /Phase 37-uiC approves?\s+localStorage writes/i,
    /Phase 37-uiC approves?\s+account-synced preferences/i,
    /Phase 37-uiC approves?\s+a global theme system/i,
    /Phase 37-uiC implements?\s+runtime/i,
    /Phase 37-uiC changes?\s+runtime/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval/runtime claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  const forbiddenFetchPhrase = ['git', 'fetch'].join(' ');
  if (source.includes(forbiddenFetchPhrase)) fail('Validator must not update remotes internally');
  assertIncludes('validator mode support', source, [
    'pr-diff',
    'post-merge-main',
    'validator-hotfix',
    'assertOriginMainAvailable'
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

  console.log(`Phase 37-uiC Dynamic Canvas Token Preview Evidence and Library Scope validator passed (${mode}).`);
}

main();
