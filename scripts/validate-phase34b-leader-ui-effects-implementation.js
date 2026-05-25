#!/usr/bin/env node
/**
 * Phase 34B — Leader UI Effects Implementation Validator
 *
 * PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_STATUS: COMPLETED_UI_EFFECTS_IMPLEMENTATION
 * PHASE34B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE34B_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED
 * PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_DECISION: PASS_TO_PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW
 * PHASE34B_IMPLEMENTATION_SCOPE: SMALL_UI_ONLY_EFFECTS_NO_DATA_BEHAVIOR_CHANGES
 * PHASE34B_REDUCED_MOTION_STATUS: PREFERS_REDUCED_MOTION_SUPPORTED
 * PHASE34B_ROLLBACK_STATUS: ROLLBACK_BY_REMOVING_EFFECT_FILES_OR_IMPORTS_ONLY
 * PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const DESIGN_SPEC_34A = 'docs/design/phase34a-leader-ui-effects-design-spec.md';
const TARGET_AUDIT_34A = 'docs/design/phase34a-leader-ui-effects-target-audit.md';
const SEED_34B = 'docs/planning/phase34b-leader-ui-effects-implementation-seed.md';
const EVIDENCE_34B = 'docs/testing/phase34b-leader-ui-effects-implementation-evidence.md';
const SUMMARY_34B = 'docs/release/phase34b-leader-ui-effects-implementation-summary.md';
const SEED_34C = 'docs/planning/phase34c-leader-ui-effects-evidence-review-seed.md';
const VALIDATOR = 'scripts/validate-phase34b-leader-ui-effects-implementation.js';
const CI = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [
  DESIGN_SPEC_34A,
  TARGET_AUDIT_34A,
  SEED_34B,
  EVIDENCE_34B,
  SUMMARY_34B,
  SEED_34C,
  VALIDATOR,
  CI,
];

const REQUIRED_TOKENS = [
  'PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_STATUS: COMPLETED_UI_EFFECTS_IMPLEMENTATION',
  'PHASE34B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE34B_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED',
  'PHASE34B_IMPLEMENTATION_SCOPE: SMALL_UI_ONLY_EFFECTS_NO_DATA_BEHAVIOR_CHANGES',
  'PHASE34B_REDUCED_MOTION_STATUS: PREFERS_REDUCED_MOTION_SUPPORTED',
  'PHASE34B_ROLLBACK_STATUS: ROLLBACK_BY_REMOVING_EFFECT_FILES_OR_IMPORTS_ONLY',
  'PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
];

const DECISION_PREFIX = 'PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW',
  'NEEDS_UI_EFFECTS_IMPLEMENTATION_REWORK',
  'HOLD_LEADER_UI_EFFECTS_IMPLEMENTATION',
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

function getGitSha(ref) {
  try {
    return runGit(['rev-parse', ref]);
  } catch {
    return null;
  }
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

function extractHeadingSection(content, heading) {
  const start = content.indexOf(heading);
  if (start === -1) return '';
  const next = content.slice(start + heading.length).search(/\n#{1,6}\s+/);
  return next === -1
    ? content.slice(start)
    : content.slice(start, start + heading.length + next);
}

function extractBacktickPaths(section) {
  const paths = new Set();
  const pattern = /`([^`\n]+)`/g;
  let match;
  while ((match = pattern.exec(section)) !== null) {
    const value = match[1].trim();
    if (
      /^(src|docs|scripts|tests|e2e|\.github)\//.test(value) ||
      /^package(-lock)?\.json$/.test(value) ||
      /^RELEASE_NOTES(_V2)?\.md$/.test(value)
    ) {
      paths.add(value);
    }
  }
  return paths;
}

function isAllowedChangedFile(file) {
  if ([EVIDENCE_34B, SUMMARY_34B, SEED_34C, VALIDATOR, CI].includes(file)) return true;
  if (/^src\/.*\.(css|jsx|tsx|js|ts)$/.test(file)) return true;
  if (/^tests\/.*effects.*\.test\.(js|jsx|ts|tsx)$/.test(file)) return true;
  return false;
}

function isForbiddenFile(file) {
  const forbiddenPatterns = [
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
    /^src\/storage\//,
    /^src\/analytics\//,
    /^src\/services\//,
    /^src\/state\/.*(backup|restore|adapter|rehearsal)/i,
    /^src\/quiz\/dataBackup\./,
    /^src\/data\/.*(backup|restore|export|import|migration)/i,
    /^src\/routes\/routeConfig\./,
    /^src\/routes\/Library\./,
    /^src\/routes\/Settings\./,
    /^sw\.js$/,
    /^boot-guard\.js$/,
    /^e2e\//,
  ];
  if (/^scripts\/validate-phase/.test(file) && file !== VALIDATOR) return true;
  return forbiddenPatterns.some(pattern => pattern.test(file));
}

function requireNoForbiddenSourceContent(file, content) {
  const forbiddenPatterns = [
    /\blocalStorage\b/,
    /\bsessionStorage\b/,
    /\bindexedDB\b/i,
    /\bfetch\s*\(/,
    /\bXMLHttpRequest\b/,
    /\bsendBeacon\b/,
    /\brequestAnimationFrame\s*\(/,
    /\bnew\s+Animation\s*\(/,
    /\banalytics\b/i,
    /\btelemetry\b/i,
    /\bbackup\b/i,
    /\brestore\b/i,
    /\bimportFrom\b/i,
    /\bcloud\b/i,
    /\bsync\b/i,
    /\bauth\b/i,
    /\baccount\b/i,
  ];
  for (const pattern of forbiddenPatterns) {
    if (pattern.test(content)) fail(`${file} contains forbidden runtime/data/network marker: ${pattern}`);
  }
}

function requireNoPositiveClaims(content, label) {
  const lines = content.split('\n');
  const scannedLines = [];
  let guardedContext = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('what phase 34b does not approve') ||
      lower.includes('what remains not approved') ||
      lower.includes('forbidden default approvals') ||
      lower.includes('guardrails') ||
      lower.includes('network and telemetry boundary') ||
      lower.includes('storage and data safety boundary')
    ) {
      guardedContext = true;
    }
    if (guardedContext && lower.startsWith('## ') && !lower.includes('does not approve') && !lower.includes('not approved') && !lower.includes('forbidden default approvals') && !lower.includes('guardrails') && !lower.includes('boundary')) {
      guardedContext = false;
    }
    if (
      guardedContext ||
      line.trim().startsWith('|') ||
      line.trim().startsWith('-') ||
      line.trim().startsWith('*') ||
      /^\d+\./.test(line.trim()) ||
      line.trim().startsWith('`')
    ) {
      continue;
    }
    if (
      !(
        lower.includes('not approved') ||
        lower.includes('does not approve') ||
        lower.includes('no ') ||
        lower.includes('not allowed') ||
        lower.includes('must not') ||
        lower.includes('forbidden') ||
        lower.includes('prohibited') ||
        lower.includes('not implemented') ||
        lower.includes('not automatically approved') ||
        lower.includes('not a data-loss guarantee') ||
        lower.includes('not public production') ||
        lower.includes('controlled-limited-beta-only') ||
        lower.includes('controlled limited beta only') ||
        lower.includes('out of scope') ||
        lower.includes('unresolved')
      )
    ) {
      scannedLines.push(line);
    }
  }

  const scanned = scannedLines.join('\n');
  const forbidden = [
    /\bBETA_READY\s+(?:is\s+)?approved\b/i,
    /\bBeta Ready\s+(?:is\s+)?approved\b/i,
    /\bproduction ready\b/i,
    /\bpublic production\s+(?:ready|approved)\b/i,
    /\bpublic production readiness\s+approved\b/i,
    /\bguaranteed data[- ]loss prevention\s+(?:approved|provided|confirmed)\b/i,
    /\bdata[- ]loss guarantee\s+(?:approved|provided|confirmed)\b/i,
    /\brestore execution approved\b/i,
    /\bproduction restore rehearsal approved\b/i,
    /\breal learner data restore rehearsal approved\b/i,
    /\bsync enabled\b/i,
    /\bcloud enabled\b/i,
    /\bbackend enabled\b/i,
    /\btelemetry enabled\b/i,
    /\banalytics enabled\b/i,
    /\bordinary-user Data Safety visibility approved\b/i,
    /\bPhase 34B\b.*\b(?:is|was)\s+automatically approved\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scanned)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

console.log('\n[1] Required files');

const files = new Map(REQUIRED_FILES.map(file => [file, requireFile(file)]));
const evidence = files.get(EVIDENCE_34B) || '';
const summary = files.get(SUMMARY_34B) || '';
const seed34c = files.get(SEED_34C) || '';
const validator = files.get(VALIDATOR) || '';
const ci = files.get(CI) || '';
const phase34bDocs = [evidence, summary, seed34c].join('\n');

console.log('\n[2] Git baseline checks');

try {
  runGit(['rev-parse', '--verify', 'origin/main']);
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; fetch origin/main before validation');
}

if (/exec(?:File)?Sync\s*\([^)]*['"`]git['"`][^)]*\[[^\]]*['"`]fetch['"`]/s.test(validator)) {
  fail('Validator must not execute internal git fetch');
} else {
  pass('Validator does not execute internal git fetch');
}

const phase34aMergeVisible = (() => {
  try {
    const log = runGit(['log', '--oneline', '--decorate', 'origin/main', '--grep=34A', '-40']);
    return /34A|phase34a|leader-ui-effects-design-gate/i.test(log);
  } catch {
    return false;
  }
})();
if (phase34aMergeVisible) pass('Phase 34A is visible from origin/main history');
else fail('Phase 34A merge is not visible from origin/main history');

console.log('\n[3] CI workflow checks');

if (ci) {
  if (ci.includes('actions/checkout@v4')) pass('CI uses actions/checkout@v4');
  else fail('CI must use actions/checkout@v4');

  if (ci.includes('fetch-depth: 0')) pass('CI uses fetch-depth: 0');
  else fail('CI must use fetch-depth: 0');

  if (/\bgit\s+fetch\b/.test(ci)) fail('CI must not include a shell git fetch step');
  else pass('CI does not include a shell git fetch step');

  if (/for\s+\w+\s+in\s+scripts\/validate-\*/.test(ci) || /scripts\/validate-\*\.js/.test(ci)) {
    fail('CI must not include a full historical validator glob chain');
  } else {
    pass('CI does not include a full historical validator glob chain');
  }

  if (ci.includes('continue-on-error: true')) fail('CI must not have continue-on-error: true');
  else pass('CI does not have continue-on-error: true');

  if (includesCIActiveRun(ci, 'validate-phase34b-leader-ui-effects-implementation.js')) {
    pass('CI registers active Phase 34B validator');
  } else {
    fail('CI must register active Phase 34B validator');
  }

  if (includesActiveHistoricalValidator(ci)) {
    fail('Prior validators must be comments only and not active Phase 34B blockers');
  } else {
    pass('Prior phase validators are not active Phase 34B blockers');
  }
}

console.log('\n[4] Changed files and manifest checks');

const changedFiles = getChangedFiles();
const relevantChangedFiles = changedFiles.filter(file => !isGeneratedArtifactPath(file));
const headSha = getGitSha('HEAD');
const originMainSha = getGitSha('origin/main');
const isPostMergeMainContext =
  relevantChangedFiles.length === 0 &&
  headSha !== null &&
  originMainSha !== null &&
  headSha === originMainSha;

pass(`Changed files detected: ${relevantChangedFiles.length}`);
if (isPostMergeMainContext) {
  pass('Post-merge main context detected; diff-based exact file checks skipped');
} else {
  const manifestSection = extractHeadingSection(evidence, '## Exact changed files');
  const manifestFiles = extractBacktickPaths(manifestSection);

  if (manifestFiles.size > 0) pass('Evidence manifest lists changed files with backtick paths');
  else fail('Evidence manifest must list exact changed files under ## Exact changed files using backtick paths');

  const actual = new Set(relevantChangedFiles);
  for (const file of relevantChangedFiles) {
    if (isAllowedChangedFile(file)) pass(`Allowed changed file: ${file}`);
    else fail(`Changed file outside Phase 34B allowed areas: ${file}`);

    if (isForbiddenFile(file)) fail(`Forbidden file or area changed: ${file}`);
    if (manifestFiles.has(file)) pass(`Changed file present in evidence manifest: ${file}`);
    else fail(`Changed file missing from evidence manifest: ${file}`);
  }

  for (const file of manifestFiles) {
    if (actual.has(file)) pass(`Manifest file present in diff: ${file}`);
    else fail(`Evidence manifest lists file not present in diff: ${file}`);
  }
}

console.log('\n[5] Required tokens and decisions');

for (const token of REQUIRED_TOKENS) {
  if (phase34bDocs.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

let decisionValue = null;
for (const decision of ALLOWED_DECISIONS) {
  if (phase34bDocs.includes(`${DECISION_PREFIX} ${decision}`)) {
    decisionValue = decision;
    pass(`Decision token present: ${DECISION_PREFIX} ${decision}`);
    break;
  }
}
if (!decisionValue) fail(`Decision token missing or invalid. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);

console.log('\n[6] Evidence document checks');

requireHeadings(
  evidence,
  [
    '# Phase 34B',
    '## Status tokens',
    '## Scope',
    '## Inputs from Phase 34A',
    '## Implementation method',
    '## Exact changed files',
    '## Implemented effects table',
    '## Reduced-motion support',
    '## Performance boundary',
    '## Accessibility boundary',
    '## Storage and data safety boundary',
    '## Network and telemetry boundary',
    '## Rollback/removal plan',
    '## Manual/screenshot evidence status',
    '## Validation evidence',
    '## Chosen implementation decision',
    '## What Phase 34B supports',
    '## What Phase 34B does not approve',
    '## Next recommended phase',
  ],
  EVIDENCE_34B,
);

requirePhrases(
  evidence,
  [
    'Effect surface',
    'Files changed',
    'Effect type',
    'Reduced-motion behavior',
    'Risk',
    'Rollback action',
    'Evidence status',
    'E01',
    'E02',
    'E03',
    'E04',
  ],
  `${EVIDENCE_34B} implemented effects table`,
);

requirePhrases(
  evidence,
  [
    'PREFERS_REDUCED_MOTION_SUPPORTED',
    'prefers-reduced-motion',
    'no storage writes',
    'no network calls',
    'no telemetry',
    'rollback',
  ],
  `${EVIDENCE_34B} boundary`,
);

if (/(PROVIDED|NOT_PROVIDED_NOT_CLAIMED|LIMITED_LOCAL_EVIDENCE_ONLY)/.test(evidence)) {
  pass('Manual/screenshot evidence status is one of the allowed values');
} else {
  fail('Manual/screenshot evidence status must be PROVIDED, NOT_PROVIDED_NOT_CLAIMED, or LIMITED_LOCAL_EVIDENCE_ONLY');
}

console.log('\n[7] Release summary checks');

requireHeadings(
  summary,
  [
    '# Phase 34B',
    '## Status tokens',
    '## Scope',
    '## Current readiness',
    '## Implementation result',
    '## Chosen decision',
    '## Implemented surfaces',
    '## Reduced-motion and accessibility',
    '## Rollback/removal',
    '## Validation summary',
    '## Guardrails',
    '## Next recommended phase',
  ],
  SUMMARY_34B,
);

console.log('\n[8] Phase 34C seed checks');

requireHeadings(
  seed34c,
  [
    '# Phase 34C',
    '## Status token',
    '## Purpose',
    '## Inputs from Phase 34B',
    '## Evidence constraints',
    '## Required evidence surfaces',
    '## Decision options',
    '## Forbidden default approvals',
    '## Recommended next step',
  ],
  SEED_34C,
);

requirePhrases(
  seed34c,
  [
    'PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
    'HOLD_LEADER_UI_EFFECTS',
    'NEEDS_UI_EFFECTS_REWORK',
    'PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE',
    'PASS_TO_POST_MERGE_SANITY_IF_NEEDED',
    'EV01',
    'EV02',
    'EV03',
    'EV04',
    'EV05',
    'EV06',
    'EV07',
  ],
  `${SEED_34C} token/options/evidence surfaces`,
);

console.log('\n[9] Runtime implementation guardrails');

const changedSourceFiles = relevantChangedFiles.filter(file => /^src\/.*\.(css|jsx|tsx|js|ts)$/.test(file));
const changedCssFiles = changedSourceFiles.filter(file => file.endsWith('.css'));

if (isPostMergeMainContext || changedSourceFiles.length > 0) {
  pass('Runtime source change presence is compatible with implementation context');
} else {
  fail('Phase 34B implementation must include runtime/UI source changes when not running post-merge on main');
}

if (changedCssFiles.length > 0) {
  const cssContent = changedCssFiles.map(file => readFile(file) || '').join('\n');
  if (cssContent.includes('prefers-reduced-motion')) pass('Changed CSS includes prefers-reduced-motion support');
  else fail('Changed CSS must include prefers-reduced-motion support');
} else if (!isPostMergeMainContext) {
  fail('Phase 34B implementation must include CSS-first effect changes');
}

for (const file of changedSourceFiles) {
  const content = readFile(file) || '';
  requireNoForbiddenSourceContent(file, content);
}
pass('Runtime implementation guardrail scan complete');

console.log('\n[10] Claim boundary checks');

requireNoPositiveClaims(phase34bDocs, 'Phase 34B docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 34B Leader UI effects implementation validation PASS');
