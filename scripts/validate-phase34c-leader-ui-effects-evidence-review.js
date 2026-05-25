#!/usr/bin/env node
/**
 * Phase 34C — Leader UI Effects Evidence Review Validator
 *
 * PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_STATUS: COMPLETED_UI_EFFECTS_EVIDENCE_REVIEW
 * PHASE34C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE34C_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED
 * PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_DECISION: PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE
 * PHASE34C_EVIDENCE_SCOPE: UI_EFFECTS_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE34C_MANUAL_BROWSER_EVIDENCE_STATUS: LIMITED_LOCAL_EVIDENCE
 * PHASE34D_POST_MERGE_UI_EFFECTS_SANITY_SEED_STATUS: PREPARED_IF_NEEDED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const BROWSER_EVIDENCE = 'docs/testing/phase34c-leader-ui-effects-browser-evidence.md';
const REVIEW_DOC = 'docs/testing/phase34c-leader-ui-effects-evidence-review.md';
const SUMMARY_DOC = 'docs/release/phase34c-leader-ui-effects-evidence-review-summary.md';
const SEED_34D = 'docs/planning/phase34d-post-merge-ui-effects-sanity-seed.md';
const VALIDATOR = 'scripts/validate-phase34c-leader-ui-effects-evidence-review.js';
const CI = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [
  BROWSER_EVIDENCE,
  REVIEW_DOC,
  SUMMARY_DOC,
  SEED_34D,
  VALIDATOR,
  CI,
];

const ALLOWED_CHANGED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_STATUS: COMPLETED_UI_EFFECTS_EVIDENCE_REVIEW',
  'PHASE34C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE34C_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED',
  'PHASE34C_EVIDENCE_SCOPE: UI_EFFECTS_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE34D_POST_MERGE_UI_EFFECTS_SANITY_SEED_STATUS: PREPARED_IF_NEEDED',
];

const DECISION_PREFIX = 'PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE',
  'NEEDS_UI_EFFECTS_REWORK',
  'HOLD_LEADER_UI_EFFECTS',
  'PASS_TO_POST_MERGE_SANITY_IF_NEEDED',
];

const MANUAL_STATUS_PREFIX = 'PHASE34C_MANUAL_BROWSER_EVIDENCE_STATUS:';
const ALLOWED_MANUAL_STATUSES = [
  'PROVIDED',
  'LIMITED_LOCAL_EVIDENCE',
  'NOT_PROVIDED_NOT_CLAIMED',
];

function fail(message) {
  ERRORS.push(message);
}

function pass(message) {
  console.log(`  PASS  ${message}`);
}

function runGit(args) {
  return execFileSync('git', args, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
}

function gitLines(args) {
  const output = runGit(args);
  return output ? output.split('\n').map(line => line.trim()).filter(Boolean) : [];
}

function readFile(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return null;
  return fs.readFileSync(abs, 'utf8');
}

function requireFile(rel) {
  const content = readFile(rel);
  if (content === null) {
    fail(`Required file missing: ${rel}`);
    return '';
  }
  pass(`File exists: ${rel}`);
  return content;
}

function normalized(content) {
  return content.replace(/\s+/g, ' ').trim().toLowerCase();
}

function includesPhrase(content, phrase) {
  return normalized(content).includes(normalized(phrase));
}

function requireHeadings(content, headings, label) {
  for (const heading of headings) {
    if (content.includes(heading)) pass(`${label} heading present: ${heading}`);
    else fail(`${label} heading missing: ${heading}`);
  }
}

function requirePhrases(content, phrases, label) {
  for (const phrase of phrases) {
    if (includesPhrase(content, phrase)) pass(`${label} present: ${phrase}`);
    else fail(`${label} missing: ${phrase}`);
  }
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesActiveHistoricalValidator(ci) {
  return ci
    .split('\n')
    .map(line => line.trim())
    .some(line =>
      line.startsWith('run: node scripts/validate-phase') &&
      line !== `run: node ${VALIDATOR}`
    );
}

function isGeneratedArtifactPath(file) {
  return GENERATED_ARTIFACTS.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function getChangedFiles() {
  try {
    const committed = gitLines(['diff', '--name-only', 'origin/main..HEAD']);
    const worktree = gitLines(['diff', '--name-only']);
    const staged = gitLines(['diff', '--cached', '--name-only']);
    const untracked = gitLines(['ls-files', '--others', '--exclude-standard']);
    return [...new Set([...committed, ...worktree, ...staged, ...untracked])];
  } catch {
    fail('Could not determine changed files from origin/main..HEAD plus working tree');
    return [];
  }
}

function getGitSha(ref) {
  try {
    return runGit(['rev-parse', ref]);
  } catch {
    return null;
  }
}

function isPostMergeMainContext(changedFiles) {
  const headSha = getGitSha('HEAD');
  const originMainSha = getGitSha('origin/main');
  return changedFiles.length === 0 && headSha !== null && originMainSha !== null && headSha === originMainSha;
}

function isForbiddenChangedFile(file) {
  const forbiddenPatterns = [
    /^src\//,
    /^tests\//,
    /^e2e\//,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
    /^RELEASE_NOTES\.md$/,
    /^RELEASE_NOTES_V2\.md$/,
    /^docs\/adr\//,
    /^docs\/(testing|release|planning|design)\/phase(1[0-9]|2[0-9]|3[0-3])[-a-z0-9]*\.md$/,
    /^docs\/design\/phase34a-/,
    /^docs\/testing\/phase34a-/,
    /^docs\/release\/phase34a-/,
    /^docs\/planning\/phase34a-/,
    /^docs\/testing\/phase34b-/,
    /^docs\/release\/phase34b-/,
    /^docs\/planning\/phase34b-/,
    /^scripts\/validate-phase(?!34c-leader-ui-effects-evidence-review\.js$)/,
    /^sw\.js$/,
    /^boot-guard\.js$/,
  ];
  return forbiddenPatterns.some(pattern => pattern.test(file));
}

function requireNoForbiddenClaims(content, label) {
  const forbidden = [
    /\bBETA_READY\s+(?:is\s+)?approved\b/i,
    /\bBeta Ready\s+(?:is\s+)?approved\b/i,
    /\bpublic production\s+(?:is\s+)?(?:ready|approved)\b/i,
    /\bpublic production readiness\s+(?:is\s+)?approved\b/i,
    /\bproduction ready\b/i,
    /\bguaranteed data[- ]loss prevention\b/i,
    /\bdata[- ]loss guarantee\s+(?:is\s+)?(?:approved|provided|confirmed)\b/i,
    /\brestore execution\s+(?:is\s+)?approved\b/i,
    /\bproduction restore rehearsal\s+(?:is\s+)?approved\b/i,
    /\breal learner data restore rehearsal\s+(?:is\s+)?approved\b/i,
    /\bsync\s+(?:is\s+)?enabled\b/i,
    /\bcloud\s+(?:is\s+)?enabled\b/i,
    /\bbackend\s+(?:is\s+)?enabled\b/i,
    /\btelemetry\s+(?:is\s+)?enabled\b/i,
    /\banalytics\s+(?:is\s+)?enabled\b/i,
    /\bPhase 34C\b.*\bautomatically approved\b/i,
    /\bPhase 34D\b.*\bautomatically approved\b/i,
  ];

  const scannedLines = content
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      if (lower.includes('not approved')) return false;
      if (lower.includes('does not approve')) return false;
      if (lower.includes('not automatically approved')) return false;
      if (lower.includes('not lifted')) return false;
      if (lower.includes('not enabled')) return false;
      if (lower.includes('no telemetry')) return false;
      if (lower.includes('no network')) return false;
      if (lower.includes('no storage')) return false;
      if (lower.includes('none introduced')) return false;
      if (lower.includes('unresolved')) return false;
      if (lower.includes('forbidden')) return false;
      if (lower.includes('must not')) return false;
      return true;
    })
    .join('\n');

  for (const pattern of forbidden) {
    if (pattern.test(scannedLines)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

function requireDecision(content) {
  const matches = [...content.matchAll(new RegExp(`${DECISION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*([A-Z0-9_]+)`, 'g'))];
  const values = [...new Set(matches.map(match => match[1]))];
  if (values.length === 0) {
    fail(`Decision token missing. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);
    return null;
  }

  for (const value of values) {
    if (ALLOWED_DECISIONS.includes(value)) pass(`Allowed decision token present: ${DECISION_PREFIX} ${value}`);
    else fail(`Invalid decision token: ${DECISION_PREFIX} ${value}`);
  }
  return values[0];
}

function requireManualStatus(content) {
  const matches = [...content.matchAll(new RegExp(`${MANUAL_STATUS_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*([A-Z0-9_]+)`, 'g'))];
  const values = [...new Set(matches.map(match => match[1]))];
  if (values.length === 0) {
    fail(`Manual/browser evidence status token missing. Must be one of: ${ALLOWED_MANUAL_STATUSES.join(', ')}`);
    return null;
  }

  for (const value of values) {
    if (ALLOWED_MANUAL_STATUSES.includes(value)) pass(`Allowed manual/browser evidence status present: ${MANUAL_STATUS_PREFIX} ${value}`);
    else fail(`Invalid manual/browser evidence status: ${MANUAL_STATUS_PREFIX} ${value}`);
  }
  return values[0];
}

console.log('\n[1] Required files');

const files = new Map(REQUIRED_FILES.map(file => [file, requireFile(file)]));
const browserEvidence = files.get(BROWSER_EVIDENCE) || '';
const reviewDoc = files.get(REVIEW_DOC) || '';
const summaryDoc = files.get(SUMMARY_DOC) || '';
const seed34d = files.get(SEED_34D) || '';
const validator = files.get(VALIDATOR) || '';
const ci = files.get(CI) || '';
const phase34cDocs = [browserEvidence, reviewDoc, summaryDoc, seed34d].join('\n');

console.log('\n[2] Git baseline checks');

try {
  runGit(['rev-parse', '--verify', 'origin/main']);
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; fetch origin/main before validation');
}

try {
  const log = runGit(['log', '--oneline', '--decorate', 'origin/main', '--grep=34B', '-40']);
  if (/34B|phase34b|leader-ui-effects-implementation/i.test(log)) pass('Phase 34B is visible from origin/main history');
  else fail('Phase 34B merge is not visible from origin/main history');
} catch {
  fail('Could not inspect origin/main history for Phase 34B');
}

if (/exec(?:File)?Sync\s*\([^)]*['"`]git['"`][^)]*\[[^\]]*['"`]fetch['"`]/s.test(validator)) {
  fail('Validator must not execute internal git fetch');
} else {
  pass('Validator does not execute internal git fetch');
}

console.log('\n[3] CI workflow checks');

if (ci) {
  if (ci.includes('actions/checkout@v4')) pass('CI uses actions/checkout@v4');
  else fail('CI must use actions/checkout@v4');

  if (ci.includes('fetch-depth: 0')) pass('CI uses fetch-depth: 0');
  else fail('CI must use fetch-depth: 0');

  if (/\bgit\s+fetch\b/.test(ci)) fail('CI must not include a shell git fetch step');
  else pass('CI does not include a shell git fetch step');

  if (ci.includes('continue-on-error: true')) fail('CI must not have continue-on-error: true');
  else pass('CI does not have continue-on-error: true');

  if (/for\s+\w+\s+in\s+scripts\/validate-\*/.test(ci) || /scripts\/validate-\*\.js/.test(ci)) {
    fail('CI must not include a full historical validator glob chain');
  } else {
    pass('CI does not include a full historical validator glob chain');
  }

  if (includesCIActiveRun(ci, 'validate-phase34c-leader-ui-effects-evidence-review.js')) {
    pass('CI registers active Phase 34C validator');
  } else {
    fail('CI must register active Phase 34C validator');
  }

  if (includesActiveHistoricalValidator(ci)) {
    fail('Historical validators must be comments only and not active Phase 34C blockers');
  } else {
    pass('Historical validators are not active Phase 34C blockers');
  }
}

console.log('\n[4] Changed files and forbidden areas');

const changedFiles = getChangedFiles().filter(file => !isGeneratedArtifactPath(file));
pass(`Changed files detected: ${changedFiles.length}`);

if (isPostMergeMainContext(changedFiles)) {
  pass('Post-merge main context detected; changed-file checks skipped');
} else {
  for (const file of changedFiles) {
    if (ALLOWED_CHANGED_FILES.has(file)) pass(`Allowed Phase 34C changed file: ${file}`);
    else fail(`Changed file outside exact Phase 34C allowed set: ${file}`);

    if (isForbiddenChangedFile(file)) fail(`Forbidden file or area changed in Phase 34C: ${file}`);
  }

  const requiredChangedWhenPresent = [BROWSER_EVIDENCE, VALIDATOR, CI];
  for (const file of requiredChangedWhenPresent) {
    if (changedFiles.includes(file)) pass(`Codex lane changed file present: ${file}`);
    else fail(`Codex lane expected changed file missing from diff: ${file}`);
  }
}

console.log('\n[5] Tokens and decisions');

for (const token of REQUIRED_TOKENS) {
  if (phase34cDocs.includes(token) || validator.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

const decision = requireDecision(phase34cDocs);
const manualStatus = requireManualStatus(phase34cDocs);
if (manualStatus === 'NOT_PROVIDED_NOT_CLAIMED' && decision === 'PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE') {
  fail('Strong limited-evidence pass is not allowed when manual/browser evidence status is NOT_PROVIDED_NOT_CLAIMED');
}

console.log('\n[6] Browser evidence document checks');

requireHeadings(
  browserEvidence,
  [
    '## Status tokens',
    '## Scope',
    '## Inputs from Phase 34B',
    '## Evidence method',
    '## Browser/runtime evidence table',
    '## Normal-motion render evidence',
    '## Reduced-motion render evidence',
    '## Keyboard/focus evidence',
    '## Console/runtime error evidence',
    '## Storage and data safety evidence',
    '## Network and telemetry evidence',
    '## Rollback/removal evidence',
    '## Screenshot evidence status',
    '## Evidence limitations',
    '## Evidence conclusion',
  ],
  BROWSER_EVIDENCE,
);

requirePhrases(
  browserEvidence,
  [
    'Evidence surface | Method | Result | Limitation | Follow-up',
    'E01 active effect',
    'E02 active effect',
    'E03 active effect',
    'E04 deferred and inactive',
    'prefers-reduced-motion behavior',
    'keyboard/focus visibility',
    'no console/runtime errors',
    'no storage writes',
    'no network/telemetry calls',
    'rollback/removal path',
    'screenshot/manual evidence status',
    'LIMITED_LOCAL_EVIDENCE',
  ],
  `${BROWSER_EVIDENCE} table/rows`,
);

console.log('\n[7] Evidence review document checks');

requireHeadings(
  reviewDoc,
  [
    '## Status tokens',
    '## Scope',
    '## Inputs reviewed',
    '## Review method',
    '## Evidence review table',
    '## Runtime UI effects review',
    '## Reduced-motion/accessibility review',
    '## Storage/network/telemetry boundary review',
    '## Rollback/removal review',
    '## Manual/browser evidence review',
    '## Readiness and claim boundary review',
    '## Chosen evidence review decision',
    '## Decision rationale',
    '## What Phase 34C supports',
    '## What Phase 34C does not approve',
    '## Next recommended phase',
  ],
  REVIEW_DOC,
);

requirePhrases(
  reviewDoc,
  [
    'Evidence surface | Method | Result | Limitation | Follow-up',
    'E01 CardAnswerRevealEffect',
    'E02 RatingButtonFeedbackEffect',
    'E03 SessionCompleteEffect',
    'E04 ProgressTickEffect',
    'LIMITED_LOCAL_EVIDENCE',
  ],
  `${REVIEW_DOC} review rows`,
);

console.log('\n[8] Release summary and Phase 34D seed checks');

requireHeadings(
  summaryDoc,
  [
    '## Status tokens',
    '## Scope',
    '## Current readiness',
    '## Evidence result',
    '## Chosen decision',
    '## Decision rationale',
    '## Evidence limitations',
    '## What is supported',
    '## What remains not approved',
    '## Validation summary',
    '## Guardrails',
    '## Next recommended phase',
  ],
  SUMMARY_DOC,
);

requireHeadings(
  seed34d,
  [
    '## Status token',
    '## Purpose',
    '## Inputs from Phase 34C',
    '## Sanity constraints',
    '## Required sanity surfaces',
    '## Decision options',
    '## Forbidden default approvals',
    '## Recommended next step',
  ],
  SEED_34D,
);

requirePhrases(
  seed34d,
  [
    'PHASE34D_POST_MERGE_UI_EFFECTS_SANITY_SEED_STATUS: PREPARED_IF_NEEDED',
    'SKIP_POST_MERGE_SANITY_NO_ISSUES',
    'RUN_POST_MERGE_SANITY',
    'HOTFIX_UI_EFFECTS',
  ],
  `${SEED_34D} token/options`,
);

console.log('\n[9] Runtime/source boundary checks');

const changedRuntimeFiles = changedFiles.filter(file =>
  /^src\//.test(file) ||
  /^tests\//.test(file) ||
  /^e2e\//.test(file) ||
  /^package\.json$/.test(file) ||
  /^package-lock\.json$/.test(file) ||
  /^RELEASE_NOTES(?:_V2)?\.md$/.test(file)
);

if (changedRuntimeFiles.length === 0) {
  pass('No runtime/source/test/package/release-note changes in Phase 34C diff');
} else {
  for (const file of changedRuntimeFiles) fail(`Runtime/source/test/package/release-note change is forbidden in Phase 34C: ${file}`);
}

console.log('\n[10] Evidence limitations and claim boundaries');

requirePhrases(
  phase34cDocs,
  [
    'Evidence limitations',
    'LIMITED_LOCAL_EVIDENCE',
    'BETA_READY is not approved',
    'Public production readiness is not approved',
    'E04',
    'deferred',
  ],
  'Phase 34C limitation disclosure',
);

if (/\[PLACEHOLDER\b|fill from|integration time/i.test(phase34cDocs)) {
  fail('Phase 34C docs must not contain unresolved placeholder or integration-time markers');
} else {
  pass('Phase 34C docs contain no unresolved placeholder or integration-time markers');
}

requireNoForbiddenClaims(phase34cDocs, 'Phase 34C docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 34C Leader UI effects evidence review validation PASS');
