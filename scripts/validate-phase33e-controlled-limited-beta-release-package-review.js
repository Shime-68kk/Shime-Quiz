#!/usr/bin/env node
/**
 * Phase 33E — Controlled Limited Beta Release Package Review Validator
 *
 * PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_STATUS: COMPLETED_RELEASE_PACKAGE_AND_REVIEW
 * PHASE33E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_DECISION: PASS_TO_PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO
 * PHASE33E_PACKAGE_SCOPE: CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33E_LIMITATION_PACKAGE_STATUS: LIMITATIONS_INCLUDED_REVIEWED_AND_CARRIED_FORWARD
 * PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const RELEASE_PACKAGE_DOC = 'docs/release/phase33e-controlled-limited-beta-release-package.md';
const REVIEW_DOC = 'docs/testing/phase33e-controlled-limited-beta-release-package-review.md';
const SEED_33F = 'docs/planning/phase33f-controlled-limited-beta-final-go-no-go-seed.md';
const VALIDATOR = 'scripts/validate-phase33e-controlled-limited-beta-release-package-review.js';
const CI = '.github/workflows/e2e-smoke.yml';

const ALLOWED_NEW = new Set([RELEASE_PACKAGE_DOC, REVIEW_DOC, SEED_33F, VALIDATOR]);
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

function isGeneratedArtifactPath(file) {
  return GENERATED_ARTIFACTS.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
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

function getChangedFiles() {
  try {
    const committed = gitLines(['diff', '--name-only', 'origin/main..HEAD']);
    if (committed.length > 0) return committed;

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      const worktree = gitLines(['diff', '--name-only']);
      const staged = gitLines(['diff', '--cached', '--name-only']);
      const untracked = gitLines(['ls-files', '--others', '--exclude-standard']);
      return [...new Set([...worktree, ...staged, ...untracked])];
    }
    return [];
  } catch {
    fail('Could not determine changed files from origin/main..HEAD and working tree fallback');
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

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      for (const line of gitLines(['diff', '--name-status'])) {
        const parts = line.split(/\s+/);
        if (parts[1]) map.set(parts[1], parts[0]);
      }
      for (const line of gitLines(['diff', '--cached', '--name-status'])) {
        const parts = line.split(/\s+/);
        if (parts[1]) map.set(parts[1], parts[0]);
      }
      for (const file of gitLines(['ls-files', '--others', '--exclude-standard'])) {
        if (!isGeneratedArtifactPath(file) && !map.has(file)) map.set(file, 'A');
      }
    }
  } catch {
    fail('Could not determine changed file status from origin/main..HEAD and working tree fallback');
  }
  return map;
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCIHistoricalPhaseValidatorRun(ci) {
  return /^\s*run:\s*node\s+scripts\/validate-phase(1|2|30|31|32|33[a-d])-/m.test(ci);
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

function requireTableRows(content, rows, label) {
  for (const row of rows) {
    if (includesPhrase(content, row)) pass(`${label} row present: ${row}`);
    else fail(`${label} row missing: ${row}`);
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

function requireNoPositiveClaims(content, label) {
  const lines = content.split('\n');
  const scannedLines = [];
  let inClaimsNotAllowed = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes('claims not allowed')) inClaimsNotAllowed = true;
    if (inClaimsNotAllowed && (lower.startsWith('## ') || lower.includes('pre-publication claim boundary review'))) {
      inClaimsNotAllowed = false;
    }

    if (
      inClaimsNotAllowed ||
      line.trim().startsWith('|') ||
      line.trim().startsWith('-') ||
      line.trim().startsWith('*') ||
      /^\d+\./.test(line.trim())
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
        lower.includes('not intended') ||
        lower.includes('not present') ||
        lower.includes('not found') ||
        lower.includes('not lifted') ||
        lower.includes('not for public') ||
        lower.includes('not automatically approved') ||
        lower.includes('ordinary-user visibility is not') ||
        lower.includes('claim boundary')
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
    /\bguaranteed data[- ]loss prevention\b/i,
    /\bdata[- ]loss guarantee\s+(?:approved|provided|confirmed)\b/i,
    /\brestore is safe\b/i,
    /\brestore execution approved\b/i,
    /\bproduction restore rehearsal approved\b/i,
    /\bsync enabled\b/i,
    /\bcloud enabled\b/i,
    /\bbackend enabled\b/i,
    /\btelemetry enabled\b/i,
    /\bBYOC\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bWebDAV\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bP2P\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bordinary-user Data Safety visibility approved\b/i,
    /\bbroad beta release approved\b/i,
    /\bstress-tested readiness approved\b/i,
    /\bPhase 33F .*\b(?:is|was)\s+approved\b/i,
    /\bPhase 33F .*\b(?:is|was)\s+automatically approved\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scanned)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

console.log('\n[1] Required files');

const releasePackageDoc = requireFile(RELEASE_PACKAGE_DOC);
const reviewDoc = requireFile(REVIEW_DOC);
const seed33f = requireFile(SEED_33F);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [releasePackageDoc, reviewDoc, seed33f].filter(Boolean).join('\n');

console.log('\n[2] Git checks');

try {
  runGit(['rev-parse', '--verify', 'origin/main']);
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; fetch origin/main before validation');
}

if (/exec(?:File)?Sync\s*\([^)]*git\s+fetch/s.test(validator)) {
  fail('Validator must not execute internal git fetch');
} else {
  pass('Validator does not execute internal git fetch');
}

console.log('\n[3] Changed files (origin/main..HEAD)');

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
    else fail(`Expected changed file missing from origin/main..HEAD diff: ${file}`);
  }
  for (const file of ALLOWED_NEW) {
    const status = statusMap.get(file);
    if (status === 'A') pass(`Expected new file status A: ${file}`);
    else fail(`Expected new file must be added in Phase 33E: ${file} (status: ${status || 'missing'})`);
  }
  for (const file of ALLOWED_MODIFIED) {
    const status = statusMap.get(file);
    if (status === 'M') pass(`Expected modified file status M: ${file}`);
    else fail(`Expected modified file must be modified in Phase 33E: ${file} (status: ${status || 'missing'})`);
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
  /^docs\/testing\/phase(30|31|32|33[a-d])/,
  /^docs\/release\/phase(30|31|32|33[a-d])/,
  /^docs\/planning\/phase(30|31|32|33[a-e])/,
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

  if (includesCIActiveRun(ci, 'validate-phase33e-controlled-limited-beta-release-package-review.js')) {
    pass('CI registers active Phase 33E validator');
  } else {
    fail('CI must register active Phase 33E validator');
  }

  if (includesCIHistoricalPhaseValidatorRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 33E blockers');
  } else {
    pass('Prior phase validators are not active Phase 33E blockers');
  }
}

console.log('\n[6] Required Phase 33E tokens');

const REQUIRED_TOKENS = [
  'PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_STATUS: COMPLETED_RELEASE_PACKAGE_AND_REVIEW',
  'PHASE33E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33E_PACKAGE_SCOPE: CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33E_LIMITATION_PACKAGE_STATUS: LIMITATIONS_INCLUDED_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (docsContent.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO',
  'NEEDS_RELEASE_PACKAGE_REWORK',
  'HOLD_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE',
];

let decisionValue = null;
for (const decision of ALLOWED_DECISIONS) {
  if (docsContent.includes(`${DECISION_PREFIX} ${decision}`)) {
    decisionValue = decision;
    pass(`Decision token present: ${DECISION_PREFIX} ${decision}`);
    break;
  }
}
if (!decisionValue) fail(`Decision token missing or invalid. Must be one of: ${ALLOWED_DECISIONS.join(', ')}`);

console.log('\n[8] Release package doc checks');

const RELEASE_PACKAGE_HEADINGS = [
  '# Phase 33E — Controlled Limited Beta Release Package',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33D',
  '## Package method',
  '## Release package table',
  '## Current readiness boundary',
  '## Participant boundary',
  '## Release notes summary',
  '## Limitation disclosure package',
  '## Validation evidence summary',
  '## Reviewer evidence summary',
  '## Claim boundary package',
  '## Data Safety UX internal-only status',
  '## No cloud/sync/backend/account/auth claim',
  '## Controlled limited beta release note template',
  '## Package review result',
  '## Chosen package decision',
  '## Decision rationale',
  '## What Phase 33E supports',
  '## What Phase 33E does not approve',
  '## Next recommended phase',
];
requireHeadings(releasePackageDoc, RELEASE_PACKAGE_HEADINGS, RELEASE_PACKAGE_DOC);

const RELEASE_PACKAGE_COLUMNS = [
  'Package surface',
  'Input source',
  'Package content',
  'Review finding',
  'Remaining limitation',
  'Claim allowed',
  'Claim not allowed',
];
requirePhrases(releasePackageDoc, RELEASE_PACKAGE_COLUMNS, `${RELEASE_PACKAGE_DOC} table column`);

const RELEASE_PACKAGE_ROWS = [
  'current readiness boundary',
  'participant boundary',
  'release notes summary',
  'limitation disclosure',
  'validation evidence summary',
  'reviewer evidence summary',
  'claim boundary',
  'Data Safety UX internal-only status',
  'no cloud/sync/backend/account/auth claim',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'Phase 33F final go/no-go seed',
];
requireTableRows(releasePackageDoc, RELEASE_PACKAGE_ROWS, `${RELEASE_PACKAGE_DOC} table`);

const TEMPLATE_FORBIDDEN_BOUNDARIES = [
  'Beta Ready',
  'public production',
  'data-loss guarantee',
  'restore execution',
  'production restore rehearsal',
  'cloud/sync/backend/account/auth',
  'telemetry',
];
requirePhrases(releasePackageDoc, TEMPLATE_FORBIDDEN_BOUNDARIES, `${RELEASE_PACKAGE_DOC} controlled limited beta release note template boundary`);
requireAnyPhrase(
  releasePackageDoc,
  ['ordinary-user Data Safety visibility', 'ordinary-user Data Safety UX visibility', 'not approved for ordinary users'],
  `${RELEASE_PACKAGE_DOC} controlled limited beta release note template ordinary-user Data Safety boundary`,
);

console.log('\n[9] Review doc checks');

const REVIEW_HEADINGS = [
  '# Phase 33E — Controlled Limited Beta Release Package Review',
  '## Status tokens',
  '## Scope',
  '## Inputs reviewed',
  '## Review method',
  '## Release package review table',
  '## Current readiness boundary review',
  '## Participant boundary review',
  '## Release notes summary review',
  '## Limitation disclosure review',
  '## Validation evidence summary review',
  '## Reviewer evidence summary review',
  '## Claim boundary review',
  '## Data Safety UX internal-only status review',
  '## No cloud/sync/backend/account/auth claim review',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 33E supports',
  '## What Phase 33E does not approve',
  '## Next recommended phase',
];
requireHeadings(reviewDoc, REVIEW_HEADINGS, REVIEW_DOC);

const REVIEW_COLUMNS = [
  'Review surface',
  'Package input',
  'Review finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];
requirePhrases(reviewDoc, REVIEW_COLUMNS, `${REVIEW_DOC} table column`);

const REVIEW_ROWS = [
  'current readiness boundary',
  'participant boundary',
  'release notes summary',
  'limitation disclosure',
  'validation evidence summary',
  'reviewer evidence summary',
  'claim boundary',
  'Data Safety UX internal-only status',
  'no cloud/sync/backend/account/auth claim',
  'controlled limited beta release note template',
  'Phase 33F final go/no-go seed',
];
requireTableRows(reviewDoc, REVIEW_ROWS, `${REVIEW_DOC} table`);

console.log('\n[10] Phase 33F seed checks');

const SEED_HEADINGS = [
  '# Phase 33F — Controlled Limited Beta Final Go/No-Go Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33E',
  '## Go/No-Go constraints',
  '## Required decision surfaces',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];
requireHeadings(seed33f, SEED_HEADINGS, SEED_33F);

const SEED_OPTIONS = [
  'NO_GO_CONTROLLED_LIMITED_BETA',
  'NEEDS_RELEASE_PACKAGE_REWORK',
  'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS',
];
requirePhrases(seed33f, SEED_OPTIONS, `${SEED_33F} decision option`);

const DECISION_SURFACES = [
  'release package completeness',
  'participant boundary',
  'limitation disclosure',
  'validation evidence summary',
  'reviewer evidence summary',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'no cloud/sync/backend/account/auth claim',
  'Data Safety UX internal-only status',
  'final go/no-go decision',
];
requirePhrases(seed33f, DECISION_SURFACES, `${SEED_33F} decision surface`);
requirePhrases(seed33f, ['Phase 33F is a separate final go/no-go gate and is not automatically approved.'], `${SEED_33F} final gate boundary`);

console.log('\n[11] Required next-phase and limitation statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 33F — Controlled Limited Beta Final Go/No-Go',
  'Phase 33F is a separate final go/no-go gate and is not automatically approved.',
  'Phase 33E confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 33E does not approve BETA_READY.',
  'Phase 33E does not approve public production readiness.',
  'Phase 33E does not approve guaranteed data-loss prevention.',
  'Phase 33E does not approve restore execution.',
  'Phase 33E does not approve production restore rehearsal.',
  'Phase 33E does not approve real learner data restore rehearsal.',
  'Phase 33E does not approve runtime backup/export/restore behavior changes.',
  'Phase 33E does not approve backup file format changes.',
  'Phase 33E does not approve restore overwrite behavior changes.',
  'Phase 33E does not approve storage migration.',
  'Phase 33E does not approve sync/cloud/account/auth/backend.',
  'Phase 33E does not approve telemetry/analytics.',
  'Phase 33E does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 33E does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 33E does not approve limited settings visibility to ordinary users.',
];
for (const statement of REQUIRED_NEXT_PHASE_STATEMENTS) {
  if (includesPhrase(docsContent, statement)) pass(`Required boundary statement present: ${statement}`);
  else fail(`Required boundary statement missing: ${statement}`);
}

const CARRIED_LIMITATIONS = [
  ['restore/adapter blocked-default-off follow-up required', 'Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF`', 'Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF`'],
  ['stress evidence follow-up required', 'Generated/test stress evidence: smoke-level only'],
  ['rollback/removal follow-up required', 'Rollback/removal evidence: simulation-only'],
  ['no real learner data evidence'],
  ['no public production readiness evidence'],
  ['no data-loss guarantee proof', 'No guaranteed data-loss prevention proof'],
  ['Data Safety UX remains internal-only', 'Data Safety UX is internal-only', 'Data Safety UX internal-only status'],
  ['no sync/cloud/backend/auth/account', 'No sync/cloud/account/auth/backend', 'No cloud/sync/backend/account/auth'],
];
for (const variants of CARRIED_LIMITATIONS) {
  requireAnyPhrase(docsContent, variants, 'Carried limitation disclosure');
}

console.log('\n[12] Broad docs guardrail scan');
requireNoPositiveClaims(docsContent, 'Phase 33E docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 33E controlled limited beta release package review validation PASS');
