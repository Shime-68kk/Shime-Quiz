#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const LIBRARY_FILE = 'src/routes/Library.jsx';
const CSS_FILE = 'src/styles/global.css';
const TEST_FILE = 'tests/unit/libraryShelfModernCollectionCardsPilot.test.jsx';
const EVIDENCE_FILE = 'docs/testing/phase37-uid-library-shelf-modern-collection-cards-pilot-evidence.md';
const SUMMARY_FILE = 'docs/release/phase37-uid-library-shelf-modern-collection-cards-pilot-summary.md';
const SEED_FILE = 'docs/planning/phase37-uie-library-shelf-modern-collection-cards-evidence-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37-uid-library-shelf-modern-collection-cards-pilot.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  LIBRARY_FILE,
  CSS_FILE,
  TEST_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_STATUS: COMPLETED_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION',
  'PHASE37UID_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37UID_RUNTIME_SCOPE: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_ONLY_NO_IMPORT_OR_STORAGE_BEHAVIOR_CHANGES',
  'PHASE37UID_SELECTED_EFFECT: LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT',
  'PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE37UID_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_DECISION';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE37UIE_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_EVIDENCE_REVIEW',
  'NEEDS_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_REWORK',
  'HOLD_LIBRARY_SHELF_MODERN_COLLECTION_CARDS_PILOT_IMPLEMENTATION',
  'PASS_TO_LIBRARY_SHELF_VISUAL_RESEARCH_ONLY'
];

const EVIDENCE_HEADINGS = [
  '# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Evidence',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 37-uiC and UI plan',
  '## Library ownership discovery',
  '## Implementation summary',
  '## Changed files',
  '## Targeted surface',
  '## Visual difference summary',
  '## One-surface containment review',
  '## Library tab semantics preservation',
  '## Panel mounting and raw input preservation',
  '## importStatus visibility review',
  '## Import, parser, and storage preservation',
  '## Accessibility and contrast evidence',
  '## Focus-visible evidence',
  '## Reduced-motion evidence',
  '## Mobile 375px evidence',
  '## Desktop evidence',
  '## Workshop import reachability evidence',
  '## E2E impact',
  '## Forbidden system change review',
  '## Phase 37C separation review',
  '## Claim guardrail review',
  '## Validation summary',
  '## Risks and follow-up',
  '## Decision',
  '## What Phase 37-uiD supports',
  '## What Phase 37-uiD does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37-uiD — Library Shelf Modern Collection Cards Pilot Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Runtime result',
  '## Chosen decision',
  '## User-facing visual change',
  '## Evidence summary',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 37-uiE — Library Shelf Modern Collection Cards Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37-uiD',
  '## Review surfaces',
  '## Evidence required',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 37-uiE — Library Shelf Modern Collection Cards Evidence Review',
  'Phase 37-uiE is evidence review only and is not automatic runtime implementation',
  'Phase 37-uiD confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status',
  'Phase 37-uiD does not approve BETA_READY',
  'Phase 37-uiD does not approve public production readiness',
  'Phase 37-uiD does not approve broad UI redesign',
  'Phase 37-uiD does not approve full Dynamic Canvas Themes',
  'Phase 37-uiD does not approve a full theme picker',
  'Phase 37-uiD does not approve persisted theme preferences',
  'Phase 37-uiD does not approve localStorage writes',
  'Phase 37-uiD does not approve mutation of the existing theme key',
  'Phase 37-uiD does not approve account-synced preferences',
  'Phase 37-uiD does not approve a global theme system',
  'Phase 37-uiD does not approve sync/cloud/account/auth/backend',
  'Phase 37-uiD does not approve telemetry/network calls',
  'Phase 37-uiD does not approve storage/backup/restore behavior changes',
  'Phase 37-uiD does not approve import/parser behavior changes',
  'Phase 37-uiD does not approve scheduler/FSRS behavior changes',
  'Phase 37-uiD does not approve route behavior changes',
  'Phase 37-uiD does not approve event handler changes',
  'Phase 37-uiD does not approve package/dependency changes',
  'Phase 37-uiD does not change Dashboard, Study Room, BottomNav, Sidebar, App, or main',
  'Phase 37-uiD does not replace Phase 37C Limited Release Readiness Gap Review'
];

const SEED_SCOPE_STATEMENTS = [
  'Phase 37-uiE is evidence review only',
  'Phase 37-uiE is not automatic runtime implementation',
  'Library shelf view / Kệ sách của tôi',
  'modern collection cards',
  'one-surface containment',
  'no Library tab behavior changes',
  'no panel mounting changes',
  'no raw input preservation changes',
  'importStatus remains visible outside panels',
  'no import/parser/storage behavior changes',
  'contrast/readability',
  'mobile 375px',
  'desktop behavior',
  'reduced-motion',
  'focus-visible',
  'Workshop import reachability',
  'Phase 37C separation'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^package(?:-lock)?\.json$/,
  /^e2e\//,
  /^src\/routes\/(?:Dashboard|StudyRoom)\.jsx$/,
  /^src\/layout\/(?:BottomNav|Sidebar)\.jsx$/,
  /^src\/(?:App|main)\.jsx$/,
  /^src\/ui\/theme\.js$/,
  /^src\/boot-guard\.js$/,
  /^src\/design-system\/tokens\.css$/,
  /(^|\/)(storage|backup|restore|import|parser|database|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
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
      fail(`Unsupported Phase 37-uiD decision token: ${match[1]}`);
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
  if (missing.length > 0) fail(`Phase 37-uiD PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 37-uiD PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
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
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 37-uiD allowlist: ${file}`);
    for (const pattern of FORBIDDEN_CHANGE_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file/area changed: ${file}`);
    }
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'uses: actions/checkout@v4',
    'fetch-depth: 0',
    'Phase 37-uiC validator retained as historical reference',
    'Validate Phase 37-uiD Library Shelf Modern Collection Cards Pilot',
    `node ${VALIDATOR_FILE}`
  ]);
  const remoteUpdatePhrase = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (workflow.includes(remoteUpdatePhrase)) fail('Workflow must not shell out to update origin/main');
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

function assertLibraryRuntime(library) {
  assertIncludes('Library runtime', library, [
    'pageStack phase37uid-library-shelf-modern-collection-cards-pilot',
    'role="tablist" className="libraryTabList phase36e-library-tabs-touch-pilot"',
    'Kệ sách của tôi',
    'Xưởng nạp tài liệu',
    "aria-selected={libraryTab === 'shelf'}",
    "aria-selected={libraryTab === 'workshop'}",
    'aria-controls="library-panel-shelf"',
    'aria-controls="library-panel-workshop"',
    'id="library-panel-shelf"',
    'id="library-panel-workshop"',
    "hidden={libraryTab !== 'shelf'}",
    "hidden={libraryTab !== 'workshop'}",
    'className="libraryTabPanel"',
    'const [textDraft, setTextDraft] = useState',
    'const [aiPromptSource, setAiPromptSource] = useState',
    'importStatus ? <Toast',
    'librarySubjectGrid',
    'libraryEmptyOnboardingCard',
    'libraryCardBody',
    'libraryStats',
    'topicPill'
  ]);
  if ((library.match(/role="tab"/g) || []).length !== 2) fail('Library must keep exactly two tab buttons');
  if ((library.match(/phase37uid-library-shelf-modern-collection-cards-pilot/g) || []).length !== 1) {
    fail('Library must contain exactly one Phase 37-uiD host class');
  }
  if (library.indexOf('importStatus ? <Toast') <= library.lastIndexOf('id="library-panel-workshop"')) {
    fail('importStatus Toast must remain outside the Library tab panels');
  }
  const forbiddenRuntimePatterns = [
    /localStorage\s*\.\s*setItem/,
    /setAttribute\(['"]data-theme/,
    /ThemePicker|persisted theme|account-synced/i
  ];
  for (const pattern of forbiddenRuntimePatterns) {
    if (pattern.test(library)) fail(`Library runtime contains forbidden persistence/theme pattern: ${pattern}`);
  }
}

function assertCss(css) {
  assertIncludes('CSS', css, [
    'Phase 37-uiD',
    '.phase37uid-library-shelf-modern-collection-cards-pilot',
    '--phase37uid-shelf-card',
    '--phase37uid-shelf-border',
    '--phase37uid-shelf-glow',
    '--phase37uid-shelf-focus',
    '.phase37uid-library-shelf-modern-collection-cards-pilot #library-panel-shelf',
    '.phase37uid-library-shelf-modern-collection-cards-pilot .librarySubjectGrid > .card',
    '.phase37uid-library-shelf-modern-collection-cards-pilot .libraryEmptyOnboardingCard',
    '.phase37uid-library-shelf-modern-collection-cards-pilot .topicPill:focus-visible',
    '@media (max-width: 560px)',
    '@media (prefers-reduced-motion: reduce)'
  ]);
  const phaseBlockStart = css.indexOf('/* Phase 37-uiD');
  const phaseBlockEnd = css.indexOf('/* Phase 36H', phaseBlockStart);
  const phaseBlock = css.slice(phaseBlockStart, phaseBlockEnd);
  if (phaseBlockStart < 0 || phaseBlockEnd < 0) fail('Phase 37-uiD CSS block must be bounded before Phase 36H');
  if (!/\.phase37uid-library-shelf-modern-collection-cards-pilot[\s\S]*#library-panel-shelf/.test(phaseBlock)) {
    fail('Phase 37-uiD CSS must scope shelf panel rules to the pilot host class');
  }
  if (/Dashboard|StudyRoom|BottomNav|Sidebar|App\.jsx|main\.jsx/.test(phaseBlock)) {
    fail('Phase 37-uiD CSS block references forbidden broad surfaces');
  }
}

function assertTest(test) {
  assertIncludes('unit test', test, [
    'Phase 37-uiD library shelf modern collection cards pilot',
    'pageStack phase37uid-library-shelf-modern-collection-cards-pilot',
    'keeps shelf and workshop panel mounting plus importStatus placement intact',
    'does not introduce persistence, a theme picker, or forbidden runtime files'
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
  assertIncludes('seed scope statements', seed, SEED_SCOPE_STATEMENTS);
  assertIncludes('scope boundary docs', docs, [
    'Library shelf view / Kệ sách của tôi',
    'modern collection cards',
    'bookshelf/editorial atmosphere',
    'src/routes/Library.jsx',
    'src/styles/global.css',
    'no import/parser/storage behavior changes',
    'Phase 37C Limited Release Readiness Gap Review remains separate',
    'pr-diff',
    'post-merge-main',
    'validator-hotfix'
  ]);
  const forbiddenApprovalClaims = [
    /Phase 37-uiD approves?\s+BETA_READY/i,
    /Phase 37-uiD approves?\s+public production readiness/i,
    /Phase 37-uiD approves?\s+broad UI redesign/i,
    /Phase 37-uiD approves?\s+full Dynamic Canvas Themes/i,
    /Phase 37-uiD approves?\s+persisted theme preferences/i,
    /Phase 37-uiD approves?\s+localStorage writes/i,
    /Phase 37-uiD approves?\s+import\/parser behavior changes/i,
    /Phase 37-uiD approves?\s+storage\/backup\/restore behavior changes/i,
    /Phase 37-uiD changes?\s+Dashboard/i,
    /Phase 37-uiD changes?\s+Study Room/i
  ];
  for (const pattern of forbiddenApprovalClaims) {
    if (pattern.test(docs)) fail(`Docs contain forbidden approval/runtime claim: ${pattern}`);
  }
}

function assertValidatorSelfSource(source) {
  const remoteUpdatePhrase = ['git', 'fetch'].join(' ');
  if (source.includes(remoteUpdatePhrase)) fail('Validator must not update remotes internally');
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
  const library = read(LIBRARY_FILE);
  const css = read(CSS_FILE);
  const test = read(TEST_FILE);
  const evidence = read(EVIDENCE_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(SEED_FILE);
  const validator = read(VALIDATOR_FILE);

  assertWorkflow(workflow);
  assertLibraryRuntime(library);
  assertCss(css);
  assertTest(test);
  assertDocs(evidence, summary, seed);
  assertValidatorSelfSource(validator);

  console.log(`Phase 37-uiD Library Shelf Modern Collection Cards Pilot validator passed (${mode}).`);
}

main();
