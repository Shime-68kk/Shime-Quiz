#!/usr/bin/env node
/**
 * Phase 35C — Library Bookshelf Evidence Review Validator
 *
 * PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
 * PHASE35C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
 * PHASE35C_REVIEW_SCOPE: LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE35C_LIBRARY_BOOKSHELF_SCOPE_STATUS: LIBRARY_TAB_SEGMENTATION_REVIEWED_AND_CARRIED_FORWARD
 * PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_SEED_STATUS: PREPARED_RESEARCH_SCOPE_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];

const EVIDENCE_DOC = 'docs/testing/phase35c-library-bookshelf-evidence-review.md';
const SUMMARY_DOC = 'docs/release/phase35c-library-bookshelf-evidence-review-summary.md';
const SEED_35D = 'docs/planning/phase35d-dashboard-deconstruction-research-scope-seed.md';
const VALIDATOR = 'scripts/validate-phase35c-library-bookshelf-evidence-review.js';
const CI = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [EVIDENCE_DOC, SUMMARY_DOC, SEED_35D, VALIDATOR, CI];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const REQUIRED_TOKENS = [
  'PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
  'PHASE35C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35C_REVIEW_SCOPE: LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35C_LIBRARY_BOOKSHELF_SCOPE_STATUS: LIBRARY_TAB_SEGMENTATION_REVIEWED_AND_CARRIED_FORWARD',
  'PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_SEED_STATUS: PREPARED_RESEARCH_SCOPE_SEED',
];

const DECISION_PREFIX = 'PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE',
  'NEEDS_LIBRARY_BOOKSHELF_FIXES',
  'HOLD_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
];

const PHASE_35D_DECISION_OPTIONS = [
  'HOLD_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE',
  'NEEDS_DASHBOARD_SCOPE_REWORK',
  'PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION',
];

const ALLOWED_CHANGED_FILES = new Set([
  CI,
  EVIDENCE_DOC,
  SUMMARY_DOC,
  SEED_35D,
  VALIDATOR,
]);

function fail(message) {
  ERRORS.push(message);
}

function pass(message) {
  console.log(`  PASS  ${message}`);
}

function runGit(args) {
  const result = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  if (result.status !== 0) {
    const detail = result.stderr || result.error?.message || `git exited with ${result.status}`;
    throw new Error(detail.trim());
  }
  return result.stdout.trim();
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

function requireDecision(content) {
  const escaped = DECISION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...content.matchAll(new RegExp(`${escaped}\\s*([A-Z0-9_]+)`, 'g'))];
  if (!matches.length) {
    fail(`Missing decision token: ${DECISION_PREFIX}`);
    return;
  }

  const invalid = matches.map(match => match[1]).filter(value => !ALLOWED_DECISIONS.includes(value));
  if (invalid.length) fail(`Invalid Phase 35C decision token value(s): ${invalid.join(', ')}`);
  else pass('Phase 35C decision token value is allowed');
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCICommentedRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*#\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function activePhaseValidatorRuns(ci) {
  return ci
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.startsWith('run: node scripts/validate-phase'));
}

function isGeneratedArtifactPath(file) {
  return GENERATED_ARTIFACTS.some(artifact => file === artifact || file.startsWith(`${artifact}/`));
}

function getChangedFiles() {
  try {
    const committed = gitLines(['diff', '--name-only', 'origin/main..HEAD']);
    const worktree = gitLines(['diff', '--name-only']);
    const staged = gitLines(['diff', '--cached', '--name-only']);
    const untracked = gitLines(['ls-files', '--others', '--exclude-standard']).filter(file => !isGeneratedArtifactPath(file));
    return [...new Set([...committed, ...worktree, ...staged, ...untracked])];
  } catch {
    fail('Could not determine changed files from origin/main..HEAD plus working tree');
    return [];
  }
}

function requireOriginMainAvailable() {
  try {
    const mergeCommit = runGit(['rev-parse', '--verify', 'origin/main']);
    pass(`origin/main is available: ${mergeCommit}`);
  } catch {
    fail('origin/main must be available for Phase 35C validation');
  }
}

function requirePhase35BVisible() {
  const phase35bFiles = [
    'docs/testing/phase35b-library-bookshelf-evidence.md',
    'docs/release/phase35b-library-bookshelf-summary.md',
    'docs/planning/phase35c-library-bookshelf-evidence-review-seed.md',
    'scripts/validate-phase35b-library-bookshelf.js',
  ];

  for (const file of phase35bFiles) {
    if (fs.existsSync(path.join(ROOT, file))) pass(`Phase 35B file visible: ${file}`);
    else fail(`Phase 35B file missing from baseline: ${file}`);
  }
}

function isForbiddenChangedFile(file) {
  if (ALLOWED_CHANGED_FILES.has(file)) return false;
  if (isGeneratedArtifactPath(file)) return true;

  const forbiddenPatterns = [
    /^package\.json$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
    /^docs\/(?!testing\/phase35c-library-bookshelf-evidence-review\.md$|release\/phase35c-library-bookshelf-evidence-review-summary\.md$|planning\/phase35d-dashboard-deconstruction-research-scope-seed\.md$)/,
    /^src\//,
    /^tests?\//,
    /^e2e\//,
    /^runtime\//,
    /^scripts\/(?!validate-phase35c-library-bookshelf-evidence-review\.js$)/,
    /^\.github\/workflows\/(?!e2e-smoke\.yml$)/,
  ];

  return forbiddenPatterns.some(pattern => pattern.test(file));
}

function requireNoForbiddenPositiveClaims(content, label) {
  const scannedLines = content
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return !(
        lower.includes('not approved') ||
        lower.includes('does not approve') ||
        lower.includes('does not change') ||
        lower.includes('did not change') ||
        lower.includes('no ') ||
        lower.includes('not ') ||
        lower.includes('forbidden') ||
        lower.includes('must not') ||
        lower.includes('non-goal') ||
        lower.includes('out of scope') ||
        lower.includes('limitation') ||
        lower.includes('limited_beta_candidate')
      );
    })
    .join('\n');

  const forbidden = [
    /\bBETA_READY\s+(?:is\s+)?approved\b/i,
    /\bpublic production\s+(?:is\s+)?(?:ready|approved)\b/i,
    /\bpublic production readiness\s+(?:is\s+)?approved\b/i,
    /\bproduction ready\b/i,
    /\bDashboard\b.*\b(?:implemented|approved|ready)\b/i,
    /\bDynamic Canvas Themes\b.*\b(?:implemented|approved|enabled)\b/i,
    /\bsync\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bcloud\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbackend\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bauth\b.*\b(?:approved|implemented|enabled)\b/i,
    /\btelemetry\b.*\b(?:approved|implemented|enabled)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scannedLines)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} forbidden positive-claim scan complete`);
}

console.log('\n[1] Baseline availability');
requireOriginMainAvailable();
requirePhase35BVisible();

console.log('\n[2] Required files');
const evidenceDoc = requireFile(EVIDENCE_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed35d = requireFile(SEED_35D);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [evidenceDoc, summaryDoc, seed35d].join('\n');

console.log('\n[3] Required headings');
requireHeadings(evidenceDoc, [
  '# Phase 35C — Library Bookshelf Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35B',
  '## Review method',
  '## Library Bookshelf evidence review table',
  '## Default shelf tab review',
  '## Workshop tab review',
  '## E2E smoke and onboarding fix review',
  '## Raw input state preservation review',
  '## Accessibility and keyboard review',
  '## Reduced-motion review',
  '## Mobile and responsive review',
  '## Forbidden system change review',
  '## Claim guardrail review',
  '## Risks and follow-up',
  '## Chosen review decision',
  '## Decision rationale',
  '## What Phase 35C supports',
  '## What Phase 35C does not approve',
  '## Next recommended phase',
], EVIDENCE_DOC);

requireHeadings(summaryDoc, [
  '# Phase 35C — Library Bookshelf Evidence Review Summary',
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
  '## Guardrails',
  '## Next recommended phase',
], SUMMARY_DOC);

requireHeadings(seed35d, [
  '# Phase 35D — Dashboard Deconstruction Research Scope Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35C',
  '## Why research/scope before runtime',
  '## Candidate surfaces to inspect',
  '## Research questions',
  '## Evidence plan',
  '## Non-goals',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
], SEED_35D);

console.log('\n[4] Status tokens and decision values');
requirePhrases(docsContent, REQUIRED_TOKENS, 'Phase 35C docs');
requireDecision(docsContent);
requirePhrases(seed35d, PHASE_35D_DECISION_OPTIONS, 'Phase 35D decision option');

console.log('\n[5] Required review rows and claims');
requirePhrases(evidenceDoc, [
  'default `Kệ sách của tôi` shelf tab',
  '`Xưởng nạp tài liệu` workshop tab',
  'raw input state preservation',
  'smoke E2E tab-targeting fix',
  'onboarding E2E tab-targeting fix',
  'accessibility and keyboard behavior',
  'reduced-motion behavior',
  'mobile 375px behavior',
  'import/parser/database/prompt/drop-zone preservation',
  'backup/restore/storage/scheduler/FSRS/route preservation',
  'readiness and claim guardrails',
  'Phase 35D dashboard research/scope seed',
], 'Phase 35C evidence review table row');

requirePhrases(evidenceDoc, [
  'Review surface | Phase 35B evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim',
], 'Phase 35C evidence review table header');

console.log('\n[6] CI registration');
if (includesCIActiveRun(ci, 'validate-phase35c-library-bookshelf-evidence-review.js')) pass('CI actively runs Phase 35C validator');
else fail('CI must actively run scripts/validate-phase35c-library-bookshelf-evidence-review.js');

if (includesCICommentedRun(ci, 'validate-phase35b-library-bookshelf.js')) pass('Phase 35B validator is retained as historical/commented');
else fail('Phase 35B validator must be historical/commented, not active');

const activePhaseRuns = activePhaseValidatorRuns(ci);
const unexpectedActive = activePhaseRuns.filter(line => line !== 'run: node scripts/validate-phase35c-library-bookshelf-evidence-review.js');
if (unexpectedActive.length) fail(`Unexpected active historical phase validator(s): ${unexpectedActive.join('; ')}`);
else pass('No unexpected active historical phase validators');

console.log('\n[7] Changed-file boundaries');
const changedFiles = getChangedFiles();
if (changedFiles.length) {
  for (const file of changedFiles) {
    if (isGeneratedArtifactPath(file)) fail(`Generated artifact changed: ${file}`);
    else if (isForbiddenChangedFile(file)) fail(`Forbidden or out-of-scope changed file: ${file}`);
    else pass(`Changed file allowed: ${file}`);
  }
} else {
  pass('No changed files detected relative to origin/main');
}

console.log('\n[8] Forbidden positive claims');
requireNoForbiddenPositiveClaims(docsContent, 'Phase 35C docs');

console.log('\n[9] Validator self-check');
if (validator.includes('PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW')) {
  pass('Validator embeds Phase 35C status token');
} else {
  fail('Validator must embed the Phase 35C status token');
}

if (ERRORS.length) {
  console.error('\nPhase 35C Library Bookshelf Evidence Review validation FAILED:');
  for (const error of ERRORS) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\nPhase 35C Library Bookshelf Evidence Review validation PASSED.');
