#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();

const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const EVIDENCE_FILE = 'docs/testing/phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review.md';
const SUMMARY_FILE = 'docs/release/phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review-summary.md';
const SEED_FILE = 'docs/planning/phase36g-mobile-accessibility-track-completion-or-next-scope-review-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase36f-library-mobile-tabs-touch-focus-pilot-evidence-review.js';

const REQUIRED_FILES = [
  WORKFLOW_FILE,
  EVIDENCE_FILE,
  SUMMARY_FILE,
  SEED_FILE,
  VALIDATOR_FILE
];

const ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW',
  'PHASE36F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE36F_REVIEW_SCOPE: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_SCOPE_STATUS: LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE36G_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_OR_NEXT_SCOPE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED'
];

const DECISION_TOKEN = 'PHASE36F_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW_DECISION';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE36G_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_OR_NEXT_SCOPE_REVIEW',
  'NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_FIXES',
  'HOLD_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_EVIDENCE_REVIEW'
];

const EVIDENCE_HEADINGS = [
  '# Phase 36F — Library Mobile Tabs Touch and Focus Pilot Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 36E',
  '## Review method',
  '## Library mobile tabs evidence review table',
  '## Tab semantics review',
  '## Panel mounting and raw input preservation review',
  '## importStatus visibility review',
  '## Import/parser/storage behavior preservation review',
  '## 375px mobile no-overflow review',
  '## Touch target and tap comfort review',
  '## Focus-visible review',
  '## Reduced-motion review',
  '## Desktop non-impact review',
  '## Workshop import reachability review',
  '## E2E smoke and onboarding review',
  '## Forbidden system change review',
  '## Validator post-merge safety review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 36F supports',
  '## What Phase 36F does not approve',
  '## Next recommended phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 36F — Library Mobile Tabs Touch and Focus Pilot Evidence Review Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Review result',
  '## Chosen decision',
  '## Decision rationale',
  '## Evidence carried forward',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Validator post-merge safety',
  '## Guardrails',
  '## Next recommended phase'
];

const SEED_HEADINGS = [
  '# Phase 36G — Mobile/Accessibility Track Completion or Next Scope Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 36F',
  '## Review options',
  '## Candidate next steps',
  '## Evidence required before implementation',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step'
];

const EVIDENCE_ROWS = [
  'tab roles preserved',
  'tab labels preserved',
  'aria-selected preserved',
  'aria-controls preserved',
  'panel mounting preserved',
  'raw input preservation',
  'importStatus visibility',
  'import tools reachable in Workshop',
  'import/parser behavior unchanged',
  'storage/backup/restore behavior unchanged',
  'schema/demo/EduGen behavior unchanged',
  'stored data unchanged',
  '375px no horizontal overflow',
  'Library tab touch target comfort',
  'focus-visible behavior',
  'reduced-motion behavior',
  'desktop Library non-impact',
  'E2E smoke',
  'E2E onboarding',
  'static unit-test evidence boundary',
  'physical-device audit not claimed',
  'validator post-merge safety',
  'Phase 36G mobile/accessibility track completion or next scope seed'
];

const REQUIRED_GUARDRAILS = [
  'Next recommended phase: Phase 36G — Mobile/Accessibility Track Completion or Next Scope Review',
  'Phase 36G is a review/scope gate and is not automatic runtime implementation.',
  'Phase 36F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 36F does not approve BETA_READY.',
  'Phase 36F does not approve public production readiness.',
  'Phase 36F does not approve broad validation or stress-tested readiness.',
  'Phase 36F does not approve guaranteed data-loss prevention.',
  'Phase 36F does not approve storage/backup/restore behavior changes.',
  'Phase 36F does not approve import/parser behavior changes.',
  'Phase 36F does not approve file import behavior changes.',
  'Phase 36F does not approve schema behavior changes.',
  'Phase 36F does not approve demo sample behavior changes.',
  'Phase 36F does not approve EduGen/draft workshop logic changes.',
  'Phase 36F does not approve stored data changes.',
  'Phase 36F does not approve sync/cloud/account/auth/backend.',
  'Phase 36F does not approve telemetry/network calls.',
  'Phase 36F does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 36F does not approve route behavior changes.',
  'Phase 36F does not approve package/dependency changes.',
  'Phase 36F does not approve Study Room correctness/scoring/scheduler/queue/data changes.',
  'Phase 36F does not approve Dynamic Canvas Themes implementation.',
  'Phase 36F does not approve Streak Fire.',
  'Phase 36F does not approve Collapsible Header.',
  'Phase 36F does not approve broad UI redesign.',
  'Phase 36F does not approve broader mobile runtime changes.',
  'Phase 36F does not approve automatic next runtime implementation.',
  'Phase 36F does not claim physical-device audit.'
];

const SEED_REQUIRED_TEXT = [
  'PHASE36G_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_OR_NEXT_SCOPE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED',
  'Phase 36G is a review/scope gate and is not automatic runtime implementation.',
  'Phase 36G may close the current mobile/touch track if no high-value safe candidate remains.',
  'Phase 36G may select Accessibility Focus Polish Scope Gate if evidence supports it.',
  'Any future runtime candidate must select exactly one small surface.',
  'Any future runtime candidate must preserve route/data/storage/scheduler/import/sync/backend/auth/telemetry behavior.',
  'Any future runtime candidate must include 375px evidence, touch evidence when relevant, focus evidence, reduced-motion evidence, and rollback notes.',
  'Dynamic Canvas Themes, Streak Fire, and Collapsible Header remain separate future gates.',
  'HOLD_MOBILE_ACCESSIBILITY_TRACK_REVIEW',
  'NEEDS_LIBRARY_MOBILE_TABS_TOUCH_FOCUS_PILOT_FIXES',
  'PASS_TO_MOBILE_ACCESSIBILITY_TRACK_COMPLETION_REVIEW',
  'PASS_TO_ACCESSIBILITY_FOCUS_POLISH_SCOPE_GATE',
  'PASS_TO_ONE_SMALL_MOBILE_TOUCH_FOLLOWUP_SCOPE_GATE'
];

const REQUIRED_REVIEW_TEXT = [
  'tab roles, labels, `aria-selected`, and `aria-controls` were preserved',
  'both panels remained mounted with the existing `hidden` inactive state',
  'raw workshop text input persisted across tab switches',
  '`importStatus` remained outside both Library tab panels',
  'did not change import/parser behavior',
  'did not change file import behavior',
  'did not change storage/backup/restore behavior',
  'did not change schema behavior',
  'did not change demo sample behavior',
  'did not change EduGen/draft workshop logic',
  'did not change those systems',
  '375px browser no-horizontal-overflow evidence exists',
  'Library tab tap comfort improved in browser evidence',
  'Library tab focus-visible behavior was reviewed',
  'Library tab reduced-motion handling was reviewed',
  'Desktop Library non-impact was reviewed',
  'Existing Workshop import tools remain reachable',
  'Static unit-test evidence exists within pilot scope',
  'Physical-device audit is not claimed'
];

const FORBIDDEN_CHANGE_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(-lock)?\.json$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES(_V2)?\.md$/,
  /^docs\/planning\/phase(?!36g-mobile-accessibility-track-completion-or-next-scope-review-seed\.md$)/,
  /^docs\/research\/phase/,
  /^docs\/release\/phase(?!36f-library-mobile-tabs-touch-focus-pilot-evidence-review-summary\.md$)/,
  /^docs\/review\/phase/,
  /^docs\/testing\/phase(?!36f-library-mobile-tabs-touch-focus-pilot-evidence-review\.md$)/,
  /^scripts\/validate-phase(?!36f-library-mobile-tabs-touch-focus-pilot-evidence-review\.js$)/,
  /^node_modules\//,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^FETCH_HEAD$/,
  /(^|\/)(storage|backup|restore|import|parser|database|prompt|drop-zone|scheduler|fsrs|FSRS|sync|auth|backend|telemetry)(\/|$)/,
  /^src\/routes\/StudyRoom\.jsx$/,
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

function assertIncludes(file, needles) {
  const text = read(file);
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${file} missing required text: ${needle}`);
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
      .filter(file => !/^(node_modules|dist|coverage|test-results|playwright-report)\//.test(file))
      .filter(file => file !== 'FETCH_HEAD')
  )).sort();
}

function classifyDiffMode(files) {
  if (files.length === 0) return 'post-merge-main';
  if (files.length === 1 && files[0] === VALIDATOR_FILE) return 'validator-hotfix';
  const missing = REQUIRED_FILES.filter(file => !files.includes(file));
  if (missing.length > 0) fail(`Phase 36F PR diff missing required file(s): ${missing.join(', ')}`);
  if (files.length !== REQUIRED_FILES.length) {
    fail(`Phase 36F PR diff must contain exactly the allowed files. Found: ${files.join(', ')}`);
  }
  return 'pr-diff';
}

function assertNoForbiddenClaims(text) {
  const forbiddenClaims = [
    /\bBETA_READY\b\s+(is\s+)?(approved|ready|granted)/i,
    /approves\s+BETA_READY/i,
    /public production readiness approved/i,
    /\bproduction ready\b/i,
    /stress-tested readiness approved/i,
    /guaranteed data-loss prevention approved/i,
    /(approved|approves)\s+(import|parser|storage|backup|restore|schema|demo sample|EduGen|stored data)\s+behavior changes/i,
    /(changed|updated|modified)\s+(import|parser|storage|backup|restore|schema|demo sample|EduGen|stored data)\s+behavior/i,
    /physical-device audit (complete|completed|approved|passed)/i
  ];
  for (const pattern of forbiddenClaims) {
    if (pattern.test(text)) fail(`Docs contain forbidden readiness/product/system claim: ${pattern}`);
  }
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(rel(file))) fail(`Required file does not exist: ${file}`);
}

git(['rev-parse', '--verify', 'origin/main']);

const changed = changedFiles();
const diffMode = classifyDiffMode(changed);

if (diffMode === 'validator-hotfix') {
  for (const file of changed) {
    if (file !== VALIDATOR_FILE) fail(`validator-hotfix may only change ${VALIDATOR_FILE}: ${file}`);
  }
}

if (diffMode !== 'post-merge-main') {
  for (const file of changed) {
    if (!ALLOWED_FILES.has(file)) fail(`Changed file is outside Phase 36F allowlist: ${file}`);
  }
}

for (const file of changed) {
  if (FORBIDDEN_CHANGE_PATTERNS.some(pattern => pattern.test(file))) {
    fail(`Forbidden file or area changed in Phase 36F: ${file}`);
  }
}

assertIncludes(EVIDENCE_FILE, EVIDENCE_HEADINGS);
assertIncludes(SUMMARY_FILE, SUMMARY_HEADINGS);
assertIncludes(SEED_FILE, SEED_HEADINGS);
assertIncludes(SEED_FILE, SEED_REQUIRED_TEXT);

const evidence = read(EVIDENCE_FILE);
assertIncludes(EVIDENCE_FILE, [
  'Review surface | Phase 36E evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim',
  ...EVIDENCE_ROWS,
  ...REQUIRED_REVIEW_TEXT
]);

const docs = [evidence, read(SUMMARY_FILE), read(SEED_FILE)].join('\n');
for (const token of REQUIRED_TOKENS) {
  if (!docs.includes(token)) fail(`Missing required status token: ${token}`);
}

const decisionMatches = docs.match(new RegExp(`${DECISION_TOKEN}: ([A-Z0-9_]+)`, 'g')) || [];
if (decisionMatches.length === 0) fail('Missing Phase 36F decision token.');
for (const match of decisionMatches) {
  const value = match.split(': ')[1];
  if (!ALLOWED_DECISIONS.includes(value)) fail(`Unsupported Phase 36F decision value: ${value}`);
}

for (const guardrail of REQUIRED_GUARDRAILS) {
  if (!docs.includes(guardrail)) fail(`Missing required guardrail statement: ${guardrail}`);
}
assertNoForbiddenClaims(docs);

const workflow = read(WORKFLOW_FILE);
assertIncludes(WORKFLOW_FILE, [
  'uses: actions/checkout@v4',
  'fetch-depth: 0',
  'Phase 36E validator retained as historical reference',
  '# node scripts/validate-phase36e-library-mobile-tabs-touch-focus-pilot.js',
  'Validate Phase 36F Library Mobile Tabs Touch and Focus Pilot Evidence Review',
  `node ${VALIDATOR_FILE}`
]);
if (/continue-on-error\s*:\s*true/.test(workflow)) fail('Workflow must not use continue-on-error.');
if (/git fetch origin refs\/heads\/main:refs\/remotes\/origin\/main --prune/.test(workflow)) {
  fail('Workflow must not shell-fetch origin/main.');
}
const activeValidatorRuns = workflow
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.startsWith('run: node scripts/validate-phase'))
  .filter(line => !line.includes('validate-smoke-fixture'));
if (activeValidatorRuns.length !== 1 || !activeValidatorRuns[0].includes(VALIDATOR_FILE)) {
  fail('Workflow must run exactly the active Phase 36F validator and no prior validators as active blockers.');
}
if (/for .*validate-phase|validate-phase\*|scripts\/validate-phase.*forEach|ls scripts\/validate-phase/.test(workflow)) {
  fail('Workflow must not run a full historical validator chain.');
}

const validatorSource = read(VALIDATOR_FILE);
if (/git\(\s*\[\s*['"]fetch['"]/.test(validatorSource) || /execFileSync\(\s*['"]git['"]\s*,\s*\[\s*['"]fetch['"]/.test(validatorSource)) {
  fail('Phase 36F validator must not execute internal git fetch.');
}
assertIncludes(VALIDATOR_FILE, [
  'pr-diff',
  'post-merge-main',
  'validator-hotfix',
  "git(['rev-parse', '--verify', 'origin/main'])",
  'classifyDiffMode',
  'FORBIDDEN_CHANGE_PATTERNS'
]);

console.log(`Phase 36F Library Mobile Tabs Touch and Focus Pilot Evidence Review validator passed (${diffMode}).`);
