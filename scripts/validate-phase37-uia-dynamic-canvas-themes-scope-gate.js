#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const RESEARCH_FILE = 'docs/research/phase37-uia-dynamic-canvas-themes-scope-gate.md';
const SUMMARY_FILE = 'docs/release/phase37-uia-dynamic-canvas-themes-scope-gate-summary.md';
const SEED_FILE = 'docs/planning/phase37-uib-dynamic-canvas-theme-token-preview-pilot-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uia-dynamic-canvas-themes-scope-gate.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  RESEARCH_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_STATUS: COMPLETED_DYNAMIC_CANVAS_THEMES_SCOPE_GATE',
  'PHASE37UIA_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIA_REVIEW_SCOPE: DYNAMIC_CANVAS_THEMES_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37UIA_SELECTED_CANDIDATE: DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT',
  'PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED'
];

const DECISION_TOKEN = 'PHASE37UIA_DYNAMIC_CANVAS_THEMES_SCOPE_GATE_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE37UIB_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT_IMPLEMENTATION',
  'HOLD_DYNAMIC_CANVAS_THEMES_SCOPE_GATE',
  'NEEDS_DYNAMIC_CANVAS_THEMES_RESEARCH',
  'PASS_TO_BACKLOG_PRIORITIZATION_REVIEW',
  'PASS_TO_PHASE37C_LIMITED_RELEASE_READINESS_GAP_REVIEW_FIRST'
];

const RESEARCH_HEADINGS = [
  '# Phase 37-uiA — Dynamic Canvas Themes Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37B and system leader feedback',
  '## Why Dynamic Canvas Themes is higher risk than micro-effects',
  '## Discovery method',
  '## Existing Dynamic Canvas / theme ownership findings',
  '## Affected surface map',
  '## Risk table',
  '## Candidate option comparison',
  '## Selected candidate',
  '## Why Dynamic Canvas Theme Token Preview Pilot first',
  '## Why this is a scope gate, not runtime implementation',
  '## Phase 37-uiB allowed files / expected areas',
  '## Phase 37-uiB forbidden areas',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Persistence and localStorage restrictions',
  '## Evidence requirements for any runtime pilot',
  '## Rollback / hold plan',
  '## Chosen scope decision',
  '## Decision rationale',
  '## What Phase 37-uiA supports',
  '## What Phase 37-uiA does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiA — Dynamic Canvas Themes Scope Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Scope gate result',
  '## Chosen decision',
  '## Selected candidate',
  '## Risk findings',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiA',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility, contrast, and reduced-motion requirements',
  '## Persistence and localStorage restrictions',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_RISK_ROWS = [
  'Theme state',
  'CSS variables',
  'localStorage',
  'user preference persistence',
  'global surface blast radius',
  'accessibility contrast',
  'reduced-motion',
  'mobile 375px layout',
  'screenshots/manual evidence',
  'storage/backup/restore boundary',
  'sync/account/backend boundary'
];

const REQUIRED_CANDIDATE_ROWS = [
  'Dynamic Canvas Theme Token Preview Pilot',
  'Static Theme Token Audit Only',
  'One-Surface Non-Persisted Canvas Accent Pilot',
  'Full Theme Picker',
  'Persisted User Theme Preference',
  'Global Theme System',
  'Account-Synced Theme Preference',
  'Hold For More Research',
  'Return To Phase 37C Gap Review First'
];

const SEED_DECISIONS = [
  'HOLD_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_PILOT',
  'NEEDS_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_REWORK',
  'PASS_TO_PHASE37UIC_DYNAMIC_CANVAS_THEME_TOKEN_PREVIEW_EVIDENCE_REVIEW',
  'PASS_TO_DYNAMIC_CANVAS_THEMES_RESEARCH_ONLY'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiB — Dynamic Canvas Theme Token Preview Pilot',
  'Phase 37-uiB is a small runtime pilot only if discovery supports it',
  'Phase 37-uiA confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiA does not approve BETA_READY',
  'Phase 37-uiA does not approve public production readiness',
  'Phase 37-uiA does not approve broad validation or stress-tested readiness',
  'Phase 37-uiA does not approve guaranteed data-loss prevention',
  'Phase 37-uiA does not approve Dynamic Canvas Themes full implementation',
  'Phase 37-uiA does not approve a full theme picker',
  'Phase 37-uiA does not approve persisted theme preferences',
  'Phase 37-uiA does not approve localStorage writes',
  'Phase 37-uiA does not approve account-synced preferences',
  'Phase 37-uiA does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiA does not approve telemetry/network calls',
  'Phase 37-uiA does not approve built-in AI/OCR/API-key/BYOK behavior',
  'Phase 37-uiA does not approve storage/backup/restore behavior changes',
  'Phase 37-uiA does not approve import/parser behavior changes',
  'Phase 37-uiA does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiA does not approve route behavior changes',
  'Phase 37-uiA does not approve event handler changes',
  'Phase 37-uiA does not approve package/dependency changes',
  'Phase 37-uiA does not approve Study Room correctness/scoring/scheduler/queue/data changes',
  'Phase 37-uiA does not approve Streak Fire',
  'Phase 37-uiA does not approve Collapsible Header',
  'Phase 37-uiA does not approve broad UI redesign',
  'Phase 37-uiA does not approve automatic next runtime implementation'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiB may be a small runtime pilot only if discovery supports it',
  'must not implement a full theme picker',
  'must not implement persisted theme preferences',
  'must not write localStorage',
  'must not sync preferences or require account/auth/backend',
  'must not change storage/backup/restore behavior',
  'must not change import/parser/scheduler/data behavior',
  'must not add packages or dependencies',
  'Prefer one surface and one scoped CSS/token preview',
  'contrast evidence',
  '375px evidence',
  'focus-visible evidence',
  'reduced-motion evidence',
  'desktop evidence',
  'rollback notes'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!37-uib-dynamic-canvas-theme-token-preview-pilot-seed\.md$)/,
  /^docs\/research\/phase(?!37-uia-dynamic-canvas-themes-scope-gate\.md$)/,
  /^docs\/release\/phase(?!37-uia-dynamic-canvas-themes-scope-gate-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase/,
  /^scripts\/validate-phase(?!37-uia-dynamic-canvas-themes-scope-gate\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|cloud|auth|backend|telemetry)(\/|$)/,
  /^src\/routes\/StudyRoom\.jsx$/,
  /^src\/routes\/Library\.jsx$/,
  /^src\/layout\/(BottomNav|Sidebar)\.jsx$/,
  /^src\/(App|main)\.jsx$/
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

function assertIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${label} missing required text: ${needle}`);
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
  if (missing.length > 0) fail(`Phase 37-uiA PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiA PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertForbiddenChanges(files, mode) {
  if (mode === 'post-merge-main') return;
  if (mode === 'validator-hotfix') {
    for (const file of files) {
      if (file !== VALIDATOR_FILE) fail(`Validator hotfix mode may only change ${VALIDATOR_FILE}: ${file}`);
    }
    return;
  }
  for (const file of files) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiA allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertDecisionToken(text) {
  const matches = [...text.matchAll(new RegExp(`${DECISION_TOKEN}:\\s*([A-Z0-9_]+)`, 'g'))];
  if (matches.length === 0) fail(`Missing decision token: ${DECISION_TOKEN}`);
  for (const match of matches) {
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Invalid Phase 37-uiA decision token: ${match[1]}`);
  }
}

function assertNoForbiddenClaims(text) {
  const forbiddenClaims = [
    /\bBETA_READY\b\s+(is\s+)?(approved|ready|granted)/i,
    /approves\s+BETA_READY/i,
    /public production readiness approved/i,
    /\bproduction ready\b/i,
    /broad validation approved/i,
    /stress-tested readiness approved/i,
    /guaranteed data-loss prevention approved/i,
    /Dynamic Canvas Themes full implementation approved/i,
    /full theme picker approved/i,
    /persisted theme preferences approved/i,
    /localStorage writes approved/i,
    /account-synced preferences approved/i,
    /global theme system approved/i,
    /runtime implementation completed/i,
    /implemented runtime/i,
    /implemented a full theme picker/i,
    /implemented persisted/i,
    /implemented localStorage writes/i,
    /implemented account-synced/i,
    /implemented global theme/i
  ];
  for (const pattern of forbiddenClaims) {
    if (pattern.test(text)) fail(`Forbidden approval/runtime claim found: ${pattern}`);
  }
}

function assertWorkflow(workflowText) {
  if (!workflowText.includes('uses: actions/checkout@v4')) fail('Workflow must use actions/checkout@v4.');
  if (!workflowText.includes('fetch-depth: 0')) fail('Workflow checkout must set fetch-depth: 0.');
  if (/git\s+fetch\s+origin\s+refs\/heads\/main:refs\/remotes\/origin\/main\s+--prune/.test(workflowText)) {
    fail('Workflow must not shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune.');
  }
  if (/continue-on-error:\s*true/.test(workflowText)) fail('Workflow must not use continue-on-error.');
  if (!/^\s*- name:\s*Validate Phase 37-uiA Dynamic Canvas Themes Scope Gate\s*$/m.test(workflowText)) {
    fail('Workflow must register the active Phase 37-uiA validator.');
  }
  if (!/^(\s*)node scripts\/validate-phase37-uia-dynamic-canvas-themes-scope-gate\.js\s*$/m.test(workflowText)) {
    fail('Workflow must run the Phase 37-uiA validator.');
  }
  if (/^\s*node scripts\/validate-phase37b-broader-actual-evidence-review\.js\s*$/m.test(workflowText)) {
    fail('Phase 37B validator must be historical comment only, not active.');
  }
  if (/validate-phase3[0-9].*validate-phase3[0-9].*validate-phase3[0-9]/s.test(workflowText.replace(/#.*$/gm, ''))) {
    fail('Workflow must not use a full historical validator glob chain.');
  }
}

function assertValidatorSelf(validatorText) {
  if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorText) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorText)) {
    fail('Validator must not execute internal git fetch.');
  }
  if (!validatorText.includes("git(['rev-parse', '--verify', 'origin/main'])")) {
    fail('Validator must verify origin/main availability.');
  }
  assertIncludes('validator', validatorText, ['pr-diff', 'post-merge-main', 'validator-hotfix']);
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);
assertForbiddenChanges(changed, diffMode);

const research = read(RESEARCH_FILE);
const summary = read(SUMMARY_FILE);
const seed = read(SEED_FILE);
const workflow = read(WORKFLOW_FILE);
const validator = read(VALIDATOR_FILE);
const allDocs = `${research}\n${summary}\n${seed}`;

assertIncludes('phase docs', allDocs, REQUIRED_TOKENS);
assertDecisionToken(allDocs);
assertIncludes(RESEARCH_FILE, research, RESEARCH_HEADINGS);
assertIncludes(SUMMARY_FILE, summary, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, seed, SEED_HEADINGS);
assertIncludes(`${RESEARCH_FILE} risk rows`, research, REQUIRED_RISK_ROWS);
assertIncludes(`${RESEARCH_FILE} candidate rows`, research, REQUIRED_CANDIDATE_ROWS);
assertIncludes(`${SEED_FILE} decisions`, seed, SEED_DECISIONS);
assertIncludes(`${SEED_FILE} scope statements`, seed, SEED_SCOPE_STATEMENTS);
assertIncludes('guardrails', allDocs, REQUIRED_GUARDRAILS);
assertIncludes('Phase 37C separation', allDocs, ['Phase 37C remains separate']);
assertNoForbiddenClaims(allDocs);
assertWorkflow(workflow);
assertValidatorSelf(validator);

console.log(`Phase 37-uiA Dynamic Canvas Themes scope gate validation passed (${diffMode}).`);
