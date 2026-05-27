#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const CSS_FILE = 'src/styles/global.css';
const RUNTIME_FILE = 'src/layout/Sidebar.jsx';
const TEST_FILE = 'tests/unit/collapsibleAvatarHeaderPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uin-collapsible-avatar-header-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uin-collapsible-avatar-header-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uio-collapsible-avatar-header-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uin-collapsible-avatar-header-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  CSS_FILE,
  RUNTIME_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_STATUS: COMPLETED_COLLAPSIBLE_AVATAR_HEADER_PILOT_IMPLEMENTATION',
  'PHASE37UIN_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UIN_RUNTIME_SCOPE: COLLAPSIBLE_AVATAR_HEADER_PILOT_ONLY_NO_AUTH_PROFILE_OR_ROUTE_BEHAVIOR_CHANGES',
  'PHASE37UIN_SELECTED_EFFECT: COLLAPSIBLE_AVATAR_HEADER_PILOT',
  'PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UIN_COLLAPSIBLE_AVATAR_HEADER_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW',
  'NEEDS_COLLAPSIBLE_AVATAR_HEADER_REWORK',
  'HOLD_COLLAPSIBLE_AVATAR_HEADER_PILOT',
  'PASS_TO_COLLAPSIBLE_AVATAR_HEADER_RESEARCH_ONLY'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^tests\/(?!unit\/collapsibleAvatarHeaderPilot\.test\.jsx$)/,
  /^e2e\//,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/routes\//,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /^src\/layout\/BottomNav\.jsx$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

const FORBIDDEN_RUNTIME_PATTERNS = [
  /localStorage\s*\.\s*setItem/,
  /sessionStorage\s*\.\s*setItem/,
  /\bfetch\s*\(/,
  /XMLHttpRequest/,
  /navigator\.sendBeacon/,
  /avatarUpload|uploadAvatar/i,
  /signIn|signOut/i,
  /account\s*menu/i,
  /profile\s*backend/i,
  /setAttribute\(['"]data-theme/i
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
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37-uiN decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiN PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiN PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiN allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiM validator retained as historical reference; not run as Phase 37-uiN merge-blocking gate.',
    '# node scripts/validate-phase37-uim-streak-fire-evidence-collapsible-avatar-header-scope.js',
    'Validate Phase 37-uiN Collapsible Avatar Header Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37-uiN validation continue-on-error');
}

function assertRuntime(sidebar) {
  assertIncludes('Sidebar runtime', sidebar, [
    'phase37uin-collapsible-avatar-header-pilot',
    'data-phase37uin-collapsible-avatar-header="sidebar-brand-identity"',
    '<span className="brandMark" aria-hidden="true">S</span>',
    'APP_VERSION_LABEL',
    'useLocation',
    'navRoutes.findIndex',
    'item.path === location.pathname',
    'to={item.path}'
  ]);
  if (sidebar.includes('onClick=') || sidebar.includes('navigate(')) {
    fail('Sidebar pilot must not add click handlers or imperative navigation');
  }
}

function assertCss(css) {
  assertIncludes('global CSS', css, [
    'Phase 37-uiN — Collapsible Avatar Header Pilot',
    '.phase37uin-collapsible-avatar-header-pilot',
    '--phase37uin-avatar-cream',
    '--phase37uin-avatar-moss',
    '--phase37uin-avatar-glow',
    '.phase37uin-collapsible-avatar-header-pilot .brandMark',
    '@media (prefers-reduced-motion: reduce)',
    'transition: none;',
    'transform: none;'
  ]);
  if (!/\.phase37uin-collapsible-avatar-header-pilot[\s\S]*pointer-events:\s*none;/.test(css)) {
    fail('Phase 37-uiN decorative pseudo-element must be pointer-events none');
  }
}

function assertDocs(evidence, summary, seed) {
  assertIncludes('evidence doc', evidence, REQUIRED_TOKENS);
  assertIncludes('summary doc', summary, REQUIRED_TOKENS.filter(token => !token.startsWith('PHASE37UIO_')));
  assertIncludes('seed doc', seed, [
    'PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
  ]);
  const docs = [evidence, summary, seed];
  const combined = docs.join('\n');
  assertIncludes('Phase 37-uiN docs', combined, [
    'READY_FOR_PHASE37UIO_COLLAPSIBLE_AVATAR_HEADER_EVIDENCE_REVIEW',
    'one-surface containment',
    'passive marker',
    'no auth/profile/backend semantics',
    'no avatar upload',
    'no persisted identity',
    'no storage writes',
    'no telemetry or network calls',
    'no route/navigation changes',
    'Phase 37C',
    'does not approve BETA_READY'
  ]);
  assertDecisionToken(combined);
}

function assertBoundaryText(sidebar, css, testFile) {
  const changedRuntime = `${sidebar}\n${css}`;
  for (const pattern of FORBIDDEN_RUNTIME_PATTERNS) {
    if (pattern.test(changedRuntime)) fail(`Forbidden runtime behavior pattern found: ${pattern}`);
  }
  assertIncludes('unit test', testFile, [
    'post-merge-main',
    'validator-hotfix',
    'pr-diff',
    "git(['rev-parse', '--verify', 'origin/main'])"
  ]);
}

function main() {
  assertOriginMainAvailable();
  for (const file of REQUIRED_FILES) read(file);

  const files = changedFiles();
  const mode = classifyDiffMode(files);
  assertForbiddenChanges(files, mode);

  const workflow = read(WORKFLOW_FILE);
  const css = read(CSS_FILE);
  const sidebar = read(RUNTIME_FILE);
  const testFile = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);

  assertWorkflow(workflow);
  assertRuntime(sidebar);
  assertCss(css);
  assertDocs(evidence, summary, seed);
  assertBoundaryText(sidebar, css, testFile);

  console.log(`Phase 37-uiN validator passed (${mode}).`);
}

main();
