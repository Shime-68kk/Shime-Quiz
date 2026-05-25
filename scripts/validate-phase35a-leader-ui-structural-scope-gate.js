#!/usr/bin/env node
/**
 * Phase 35A — Leader UI Structural Scope Gate Validator
 *
 * PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_STATUS: COMPLETED_LEADER_UI_SCOPE_GATE
 * PHASE35A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
 * PHASE35A_SCOPE_TYPE: DESIGN_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE35A_UI_PLAN_HANDLING: STRATEGIC_REFERENCE_NOT_FULL_IMPLEMENTATION
 * PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const DESIGN_DOC = 'docs/design/phase35a-leader-ui-structural-scope-gate.md';
const REVIEW_DOC = 'docs/testing/phase35a-leader-ui-structural-scope-review.md';
const SUMMARY_DOC = 'docs/release/phase35a-leader-ui-structural-scope-summary.md';
const SEED_35B = 'docs/planning/phase35b-leader-ui-library-bookshelf-seed.md';
const VALIDATOR = 'scripts/validate-phase35a-leader-ui-structural-scope-gate.js';
const CI = '.github/workflows/e2e-smoke.yml';

const ALLOWED_NEW = new Set([DESIGN_DOC, REVIEW_DOC, SUMMARY_DOC, SEED_35B, VALIDATOR]);
const ALLOWED_MODIFIED = new Set([CI]);
const EXACT_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

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

function requireAnyPhrase(content, phrases, label) {
  for (const phrase of phrases) {
    if (includesPhrase(content, phrase)) {
      pass(`${label} present: ${phrase}`);
      return;
    }
  }
  fail(`${label} missing. Expected one of: ${phrases.join(' | ')}`);
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

function fileStatusMap() {
  const map = new Map();
  try {
    for (const line of gitLines(['diff', '--name-status', 'origin/main..HEAD'])) {
      const parts = line.split(/\s+/);
      if (parts[1]) map.set(parts[1], parts[0]);
    }
    for (const line of gitLines(['diff', '--name-status'])) {
      const parts = line.split(/\s+/);
      if (parts[1] && map.get(parts[1]) !== 'A') map.set(parts[1], parts[0]);
    }
    for (const line of gitLines(['diff', '--cached', '--name-status'])) {
      const parts = line.split(/\s+/);
      if (parts[1] && map.get(parts[1]) !== 'A') map.set(parts[1], parts[0]);
    }
    for (const file of gitLines(['ls-files', '--others', '--exclude-standard'])) {
      if (!isGeneratedArtifactPath(file) && !map.has(file)) map.set(file, 'A');
    }
  } catch {
    fail('Could not determine changed file status from origin/main..HEAD plus working tree');
  }
  return map;
}

function requireNoPositiveClaims(content, label) {
  const scannedLines = content
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return !(
        lower.includes('not approved') ||
        lower.includes('does not approve') ||
        lower.includes('does not implement') ||
        lower.includes('not a mandate') ||
        lower.includes('not full implementation') ||
        lower.includes('not automatically approved') ||
        lower.includes('not enabled') ||
        lower.includes('no ') ||
        lower.includes('must not') ||
        lower.includes('forbidden') ||
        lower.includes('defer') ||
        lower.includes('deferred') ||
        lower.includes('reject') ||
        lower.includes('non-goal') ||
        lower.includes('out of scope')
      );
    })
    .join('\n');

  const forbidden = [
    /\bBETA_READY\s+(?:is\s+)?approved\b/i,
    /\bBeta Ready\s+(?:is\s+)?approved\b/i,
    /\bpublic production\s+(?:is\s+)?(?:ready|approved)\b/i,
    /\bpublic production readiness\s+(?:is\s+)?approved\b/i,
    /\bproduction ready\b/i,
    /\bbroad validation\s+(?:is\s+)?(?:approved|complete|confirmed)\b/i,
    /\bstress-tested readiness\s+(?:is\s+)?(?:approved|complete|confirmed)\b/i,
    /\bguaranteed data[- ]loss prevention\s+(?:is\s+)?(?:approved|provided|confirmed)\b/i,
    /\bstorage\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbackup\b.*\b(?:approved|implemented|enabled)\b/i,
    /\brestore\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bsync\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bcloud\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbackend\b.*\b(?:approved|implemented|enabled)\b/i,
    /\baccount\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bauth\b.*\b(?:approved|implemented|enabled)\b/i,
    /\btelemetry\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bnetwork\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bimport parser\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bdatabase pipeline\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bprompt builder\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bfile drop-zone lifecycle\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bscheduler\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bFSRS\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bdata model\b.*\b(?:approved|implemented|enabled)\b/i,
    /\broute behavior\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bDynamic Canvas Themes\b.*\b(?:approved|implemented|enabled)\b/i,
    /\b3D card flip\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bconfetti\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bcasino-like effects\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bsound\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bdistracting animation\b.*\b(?:approved|implemented|enabled)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scannedLines)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} forbidden positive-claim scan complete`);
}

console.log('\n[1] Required files');

const designDoc = requireFile(DESIGN_DOC);
const reviewDoc = requireFile(REVIEW_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed35b = requireFile(SEED_35B);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [designDoc, reviewDoc, summaryDoc, seed35b].filter(Boolean).join('\n');

console.log('\n[2] Git checks');

try {
  runGit(['rev-parse', '--verify', 'origin/main']);
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; make origin/main available before validation');
}

if (/exec(?:File)?Sync\s*\([^)]*['"`]git['"`][^)]*\[[^\]]*['"`]fetch['"`]/s.test(validator)) {
  fail('Validator must not execute internal git fetch');
} else {
  pass('Validator does not execute internal git fetch');
}

console.log('\n[3] Changed files (origin/main..HEAD plus working tree)');

const changedFiles = getChangedFiles();
const relevantChangedFiles = changedFiles.filter(file => !isGeneratedArtifactPath(file));
const statusMap = fileStatusMap();
const headSha = getGitSha('HEAD');
const originMainSha = getGitSha('origin/main');
const isPostMergeMainContext =
  relevantChangedFiles.length === 0 &&
  headSha !== null &&
  originMainSha !== null &&
  headSha === originMainSha;

pass(`Changed files detected: ${relevantChangedFiles.length}`);
if (isPostMergeMainContext) {
  pass('Post-merge main context detected; exact changed-file checks skipped and content guardrails enforced');
}

if (!isPostMergeMainContext) {
  const actual = new Set(relevantChangedFiles);
  for (const file of relevantChangedFiles) {
    if (EXACT_ALLOWED.has(file)) pass(`Allowed changed file: ${file}`);
    else fail(`Unexpected changed file: ${file}`);
  }
  for (const file of EXACT_ALLOWED) {
    if (actual.has(file)) pass(`Expected changed file present: ${file}`);
    else fail(`Expected changed file missing from origin/main..HEAD diff or working tree: ${file}`);
  }
  for (const file of ALLOWED_NEW) {
    const status = statusMap.get(file);
    if (status === 'A') pass(`Expected new file status A: ${file}`);
    else fail(`Expected new file must be added in Phase 35A: ${file} (status: ${status || 'missing'})`);
  }
  for (const file of ALLOWED_MODIFIED) {
    const status = statusMap.get(file);
    if (status === 'M') pass(`Expected modified file status M: ${file}`);
    else fail(`Expected modified file must be modified in Phase 35A: ${file} (status: ${status || 'missing'})`);
  }
}

console.log('\n[4] Forbidden file categories');

const FORBIDDEN_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package\.json$/,
  /^package-lock\.json$/,
  /^sw\.js$/,
  /^boot-guard\.js$/,
  /^docs\/adr\//,
  /^RELEASE_NOTES\.md$/,
  /^RELEASE_NOTES_V2\.md$/,
  /^runtime\//,
  /^docs\/(?:design|testing|release|planning)\/phase(?:1[0-9]|2[0-9]|3[0-4])[-a-z0-9]*\.md$/,
];

for (const file of relevantChangedFiles) {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(file)) fail(`Forbidden file or area changed: ${file}`);
  }
  if (/^scripts\/validate-phase/.test(file) && file !== VALIDATOR) {
    fail(`Prior phase validator modified: ${file}`);
  }
}
pass('Forbidden file category check complete');

console.log('\n[5] CI workflow checks');

if (ci) {
  if (ci.includes('actions/checkout@v4')) pass('CI uses actions/checkout@v4');
  else fail('CI must use actions/checkout@v4');

  if (ci.includes('fetch-depth: 0')) pass('CI uses fetch-depth: 0');
  else fail('CI must use fetch-depth: 0');

  const forbiddenFetch = ['git', 'fetch', 'origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
  if (ci.includes(forbiddenFetch)) fail('CI must not include shell git fetch origin refs/heads/main:refs/remotes/origin/main --prune');
  else pass('CI does not include forbidden shell git fetch step');

  if (/for\s+\w+\s+in\s+scripts\/validate-\*/.test(ci) || /scripts\/validate-\*\.js/.test(ci)) {
    fail('CI must not include a full historical validator glob chain');
  } else {
    pass('CI does not include a full historical validator glob chain');
  }

  if (ci.includes('continue-on-error: true')) fail('CI must not have continue-on-error: true');
  else pass('CI does not have continue-on-error: true');

  if (includesCIActiveRun(ci, 'validate-phase35a-leader-ui-structural-scope-gate.js')) {
    pass('CI registers active Phase 35A validator');
  } else {
    fail('CI must register active Phase 35A validator');
  }

  if (includesActiveHistoricalValidator(ci)) {
    fail('Prior validators must be comments only and not active Phase 35A blockers');
  } else {
    pass('Prior phase validators are not active Phase 35A blockers');
  }
}

console.log('\n[6] Required tokens');

const REQUIRED_TOKENS = [
  'PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_STATUS: COMPLETED_LEADER_UI_SCOPE_GATE',
  'PHASE35A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35A_SCOPE_TYPE: DESIGN_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35A_UI_PLAN_HANDLING: STRATEGIC_REFERENCE_NOT_FULL_IMPLEMENTATION',
  'PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (docsContent.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION',
  'NEEDS_UI_SCOPE_REWORK',
  'HOLD_LEADER_UI_SCOPE_GATE',
];
const decisionMatches = [...docsContent.matchAll(/PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION:\s*([A-Z0-9_]+)/g)];
const decisionValues = [...new Set(decisionMatches.map(match => match[1]))];
if (decisionValues.length === 0) {
  fail(`Decision token missing. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);
} else {
  for (const value of decisionValues) {
    if (ALLOWED_DECISIONS.includes(value)) pass(`${DECISION_PREFIX} ${value}`);
    else fail(`Invalid decision token: ${DECISION_PREFIX} ${value}`);
  }
}

console.log('\n[8] Required headings');

requireHeadings(designDoc, [
  '# Phase 35A — Leader UI Structural Scope Gate',
  '## Status tokens',
  '## Scope',
  '## Current readiness boundary',
  '## Inputs reviewed',
  '## Screenshot evidence summary',
  '## UI problem framing',
  '## Strategic interpretation of shime-ui-plan.md',
  '## Candidate comparison table',
  '## Staged Leader UI roadmap',
  '## Chosen Phase 35B candidate',
  '## Why Library Bookshelf goes first',
  '## Why Dashboard deconstruction waits',
  '## Why navigation polish waits',
  '## Explicit non-goals',
  '## Forbidden claims and systems',
  '## Rollback strategy for future runtime phases',
  '## Validation and evidence plan',
  '## Next recommended phase',
], DESIGN_DOC);

requireHeadings(reviewDoc, [
  '# Phase 35A — Leader UI Structural Scope Review',
  '## Status tokens',
  '## Scope review',
  '## Inputs reviewed',
  '## Screenshot evidence reviewed',
  '## Candidate comparison review',
  '## Roadmap safety review',
  '## Phase 35B seed review',
  '## Guardrail review',
  '## No runtime implementation review',
  '## Forbidden claims review',
  '## Forbidden system changes review',
  '## Validator and CI review plan',
  '## Reviewer checklist',
  '## Tester checklist for Phase 35B',
  '## Open questions',
  '## Review decision',
], REVIEW_DOC);

requireHeadings(summaryDoc, [
  '# Phase 35A — Leader UI Structural Scope Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Summary of decision',
  '## What was reviewed',
  '## What Phase 35A supports',
  '## What Phase 35A does not approve',
  '## Chosen Phase 35B candidate',
  '## Limitations carried forward',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
], SUMMARY_DOC);

requireHeadings(seed35b, [
  '# Phase 35B — Leader UI Library Bookshelf Tab System Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35A',
  '## Implementation candidate',
  '## User-facing intent',
  '## Strict scope',
  '## Non-goals',
  '## Allowed files / expected areas for Phase 35B',
  '## Forbidden areas for Phase 35B',
  '## Implementation guidance',
  '## State preservation requirements',
  '## Accessibility and reduced-motion requirements',
  '## Manual evidence plan',
  '## Validation required',
  '## Coder deliverables',
  '## Reviewer focus',
  '## Tester focus',
  '## Rollback plan',
  '## Decision options',
  '## Recommended next step',
], SEED_35B);

console.log('\n[9] Candidate and roadmap checks');

requirePhrases(docsContent, [
  'Library Bookshelf Tab System',
  'Dashboard simplification / Progress Journal split',
  'Hybrid Sliding Navigation Indicator',
  'Elastic Button Compression',
  'Study Room answer/feedback polish',
  'Streak Fire Ignition',
  'Collapsible Header',
  'Dynamic Canvas Themes',
], 'Required candidate');

requirePhrases(designDoc, [
  'Candidate | Screen/area | User value | Implementation risk | Data/logic risk | Expected changed areas in future phase | Why now / why later | Decision',
  'Phase 35B — Library Bookshelf Tab System',
  'Phase 35C — Library Bookshelf Evidence Review / Follow-up Fixes',
  'Phase 35D — Dashboard Deconstruction Scope Gate',
  'Phase 35E — Dashboard Calm Home / Progress Journal Split',
  'Phase 35F — Hybrid Sliding Navigation Indicator',
  'Phase 35G — Elastic Button Compression',
  'Phase 35H — Study Room Answer Feedback Polish',
  'Phase 35I — Advanced Settings UI Polish Scope Gate',
  'Phase 35J — Optional Streak Fire Ignition Gate',
  'Phase 35K — Collapsible Header Research / Gate',
  'Phase 35L+ — Dynamic Canvas Themes Design/Data-Safety Gate only if explicitly approved',
], `${DESIGN_DOC} staged roadmap`);

requireAnyPhrase(designDoc, [
  'small phases, not a broad redesign',
  'staged, small phases',
  'does not combine all major UI changes into one runtime phase',
], `${DESIGN_DOC} staged roadmap safety`);

requirePhrases(seed35b, [
  'Library Bookshelf Tab System',
  'Default tab: `Kệ sách của tôi`',
  'Secondary tab: `Xưởng nạp tài liệu`',
  'Keep import/configuration tools away from default learner-facing shelf',
  'Use local UI state only unless a later phase explicitly approves otherwise',
  'Do not alter import parsers',
  'Do not alter local database query pipelines',
  'Do not alter prompt builders',
  'Do not alter file drop-zone lifecycles',
  'Do not alter backup/restore behavior',
  'Preserve raw text/input state during tab switches',
  'Preserve current Library data and study entry behavior',
  'Reduced motion: instant or non-animated tab switch is acceptable',
  'Rollback should be possible by removing the small component/CSS diff',
  'HOLD_LIBRARY_BOOKSHELF_IMPLEMENTATION',
  'NEEDS_LIBRARY_BOOKSHELF_SCOPE_REWORK',
  'PASS_TO_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
], `${SEED_35B} required seed content`);

requireAnyPhrase(seed35b, [
  'first implementation candidate',
  'Implementation candidate: Library Bookshelf Tab System',
], `${SEED_35B} first implementation candidate`);

console.log('\n[10] Required boundary statements');

requirePhrases(docsContent, [
  'Next recommended phase: Phase 35B — Leader UI Library Bookshelf Tab System',
  'Phase 35A is a structural scope gate and does not implement runtime UI changes.',
  'Phase 35A treats shime-ui-plan.md as strategic reference, not a full implementation mandate.',
  'Phase 35A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35A does not approve BETA_READY.',
  'Phase 35A does not approve public production readiness.',
  'Phase 35A does not approve broad validation or stress-tested readiness.',
  'Phase 35A does not approve guaranteed data-loss prevention.',
  'Phase 35A does not approve storage, backup, restore, sync, cloud, backend, account, auth, telemetry, or network changes.',
  'Phase 35A does not approve import parser, local database pipeline, prompt builder, file drop-zone lifecycle, scheduler, FSRS, data model, or route behavior changes.',
  'Phase 35A does not approve Dynamic Canvas Themes implementation.',
  'Phase 35A does not approve 3D card flip, confetti, casino-like effects, sound, or distracting animation.',
], 'Required Phase 35A boundary statement');

console.log('\n[11] Forbidden effect deferral checks');

for (const subject of [
  'Dynamic Canvas Themes implementation',
  '3D card flip',
  'confetti',
  'casino-like effects',
  'sound',
  'distracting animation',
]) {
  if (
    includesPhrase(docsContent, 'Phase 35A does not approve 3D card flip, confetti, casino-like effects, sound, or distracting animation.') &&
    ['3D card flip', 'confetti', 'casino-like effects', 'sound', 'distracting animation'].includes(subject)
  ) {
    pass(`Forbidden visual/system effect deferred or rejected: ${subject}`);
  } else {
    requireAnyPhrase(docsContent, [
      `does not approve ${subject}`,
      `rejects ${subject}`,
      `defer ${subject}`,
      `deferred ${subject}`,
    ], `Forbidden visual/system effect deferred or rejected: ${subject}`);
  }
}

console.log('\n[12] Broad docs guardrail scan');
requireNoPositiveClaims(docsContent, 'Phase 35A docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 35A Leader UI structural scope gate validation PASS');
