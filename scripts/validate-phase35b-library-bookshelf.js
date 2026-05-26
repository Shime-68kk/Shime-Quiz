#!/usr/bin/env node
/**
 * Phase 35B — Leader UI Library Bookshelf Tab System Validator
 *
 * PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_STATUS: COMPLETED_LIBRARY_BOOKSHELF_TAB_SYSTEM
 * PHASE35B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_DECISION: READY_FOR_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
 * PHASE35B_RUNTIME_SCOPE: LIBRARY_UI_TAB_SEGMENTATION_ONLY_NO_DATA_OR_IMPORT_LOGIC_CHANGES
 * PHASE35B_LIBRARY_DEFAULT_TAB: KE_SACH_CUA_TOI_DEFAULT_LEARNER_FACING_SHELF
 * PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];

const EVIDENCE_DOC = 'docs/testing/phase35b-library-bookshelf-evidence.md';
const SUMMARY_DOC = 'docs/release/phase35b-library-bookshelf-summary.md';
const SEED_35C = 'docs/planning/phase35c-library-bookshelf-evidence-review-seed.md';
const VALIDATOR = 'scripts/validate-phase35b-library-bookshelf.js';
const CI = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [EVIDENCE_DOC, SUMMARY_DOC, SEED_35C, VALIDATOR, CI];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const REQUIRED_TOKENS = [
  'PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_STATUS: COMPLETED_LIBRARY_BOOKSHELF_TAB_SYSTEM',
  'PHASE35B_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35B_RUNTIME_SCOPE: LIBRARY_UI_TAB_SEGMENTATION_ONLY_NO_DATA_OR_IMPORT_LOGIC_CHANGES',
  'PHASE35B_LIBRARY_DEFAULT_TAB: KE_SACH_CUA_TOI_DEFAULT_LEARNER_FACING_SHELF',
  'PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED',
];

const DECISION_PREFIX = 'PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_DECISION:';
const ALLOWED_DECISIONS = [
  'READY_FOR_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
  'NEEDS_LIBRARY_BOOKSHELF_FIXES',
  'HOLD_LIBRARY_BOOKSHELF_RUNTIME',
];

const REQUIRED_SEED_OPTIONS = [
  'PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_SCOPE_GATE',
  'NEEDS_LIBRARY_BOOKSHELF_FIXES',
  'HOLD_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
];

const ALLOWED_CHANGED_FILES = new Set([
  'src/routes/Library.jsx',
  'src/styles/global.css',
  'tests/unit/libraryBookshelfTabs.test.jsx',
  'e2e/smoke.spec.js',
  EVIDENCE_DOC,
  SUMMARY_DOC,
  SEED_35C,
  VALIDATOR,
  CI,
]);

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

function isForbiddenChangedFile(file) {
  if (ALLOWED_CHANGED_FILES.has(file)) return false;

  const forbiddenPatterns = [
    /^package\.json$/,
    /^package-lock\.json$/,
    /^yarn\.lock$/,
    /^sw\.js$/,
    /^boot-guard\.js$/,
    /^docs\/adr\//,
    /^RELEASE_NOTES\.md$/,
    /^RELEASE_NOTES_V2\.md$/,
    /^src\/storage\//,
    /^src\/.*\/storage\//,
    /^src\/.*\/backup\//,
    /^src\/.*\/restore\//,
    /^src\/.*\/sync\//,
    /^src\/.*\/cloud\//,
    /^src\/.*\/backend\//,
    /^src\/.*\/account\//,
    /^src\/.*\/auth\//,
    /^src\/.*\/telemetry\//,
    /^src\/.*\/analytics\//,
    /^src\/.*\/fsrs\//,
    /^src\/.*\/scheduler\//,
    /^src\/.*\/import[^/]*\//,
    /^src\/.*\/parser[^/]*\//,
    /^src\/.*\/prompt[^/]*\//,
    /^src\/data\/.*(?:Import|Parser|Validator|Prompt|Model|Schema|Store|Storage|Backup|Restore|Export|Query|Database).*\.js$/,
    /^src\/services\//,
    /^src\/state\//,
    /^src\/quiz\//,
    /^src\/edugen\//,
    /^src\/learning\//,
    /^src\/routes\/(?!Library\.jsx$)/,
    /^src\/components\/(?!.*Library).*$/,
    /^src\//,
    /^tests\/(?!unit\/libraryBookshelfTabs\.test\.jsx$)/,
    /^e2e\/(?!smoke\.spec\.js$)/,
    /^scripts\/validate-phase(?!35b-library-bookshelf\.js$)/,
    /^docs\/(testing|release|planning|design)\/phase(?!35[bc]-)/,
  ];

  return forbiddenPatterns.some(pattern => pattern.test(file));
}

function requireDecision(content) {
  const escaped = DECISION_PREFIX.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matches = [...content.matchAll(new RegExp(`${escaped}\\s*([A-Z0-9_]+)`, 'g'))];
  if (!matches.length) {
    fail(`Missing decision token: ${DECISION_PREFIX}`);
    return;
  }

  const invalid = matches.map(match => match[1]).filter(value => !ALLOWED_DECISIONS.includes(value));
  if (invalid.length) fail(`Invalid Phase 35B decision token value(s): ${invalid.join(', ')}`);
  else pass('Phase 35B decision token value is allowed');
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
    /\bbroad validation\s+(?:is\s+)?(?:approved|complete|confirmed)\b/i,
    /\bstress-tested readiness\s+(?:is\s+)?(?:approved|complete|confirmed)\b/i,
    /\bguaranteed data[- ]loss prevention\s+(?:is\s+)?(?:approved|provided|confirmed)\b/i,
    /\bsync\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bcloud\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbackend\b.*\b(?:approved|implemented|enabled)\b/i,
    /\baccount\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bauth\b.*\b(?:approved|implemented|enabled)\b/i,
    /\btelemetry\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bnetwork calls?\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbuilt-in AI\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bOCR\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bAPI-key\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bBYOK\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bDynamic Canvas Themes\b.*\b(?:approved|implemented|enabled)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scannedLines)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} forbidden positive-claim scan complete`);
}

console.log('\n[1] Required files');
const evidenceDoc = requireFile(EVIDENCE_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed35c = requireFile(SEED_35C);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [evidenceDoc, summaryDoc, seed35c].join('\n');

console.log('\n[2] Required headings');
requireHeadings(evidenceDoc, [
  '# Phase 35B — Library Bookshelf Evidence',
  '## Status tokens',
  '## Scope',
  '## Runtime files changed',
  '## Library component discovery',
  '## Implementation summary',
  '## Default shelf tab verification',
  '## Import workshop tab verification',
  '## Raw input state preservation verification',
  '## Accessibility verification',
  '## Reduced motion verification',
  '## Mobile/responsive verification',
  '## Regression checks',
  '## Manual browser evidence',
  '## Validation summary',
  '## Known limitations',
  '## Next recommended phase',
], EVIDENCE_DOC);

requireHeadings(summaryDoc, [
  '# Phase 35B — Library Bookshelf Summary',
  '## Status tokens',
  '## Scope',
  '## What changed',
  '## What did not change',
  '## Guardrails',
  '## Validation summary',
  '## Reviewer/tester expectation',
  '## Next recommended phase',
], SUMMARY_DOC);

requireHeadings(seed35c, [
  '# Phase 35C — Library Bookshelf Evidence Review Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35B',
  '## Review focus',
  '## Tester focus',
  '## Decision options',
  '## Forbidden approvals',
  '## Recommended next step',
], SEED_35C);

console.log('\n[3] Status tokens');
requirePhrases(docsContent, REQUIRED_TOKENS, 'Phase 35B docs');
requireDecision(docsContent);
requirePhrases(seed35c, REQUIRED_SEED_OPTIONS, 'Phase 35C decision options');

console.log('\n[4] Scope and evidence wording');
requireAnyPhrase(docsContent, [
  'Library UI tab segmentation only',
  'LIBRARY_UI_TAB_SEGMENTATION_ONLY_NO_DATA_OR_IMPORT_LOGIC_CHANGES',
], 'Library UI tab segmentation only statement');
requireAnyPhrase(docsContent, [
  'raw input state',
  'raw textarea',
  'typed textarea',
], 'raw input state statement');
requireAnyPhrase(docsContent, [
  'survived switching',
  'survives repeated tab switching',
  'evidence gap',
  'manual browser evidence',
], 'raw input preservation verification or evidence gap');
requireAnyPhrase(docsContent, [
  'Phase 35C Library Bookshelf evidence review',
  'Phase 35C — Library Bookshelf Evidence Review',
  'Phase 35C evidence review',
  'READY_FOR_PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW',
], 'next recommended phase statement');

console.log('\n[5] CI registration');
if (includesCIActiveRun(ci, 'validate-phase35b-library-bookshelf.js')) pass('CI actively runs Phase 35B validator');
else fail('CI must actively run scripts/validate-phase35b-library-bookshelf.js');

if (/^\s*#\s*node\s+scripts\/validate-phase35a-leader-ui-structural-scope-gate\.js\s*$/m.test(ci)) {
  pass('Phase 35A validator is retained as historical/commented');
} else {
  fail('Phase 35A validator must be historical/commented, not active');
}

const activePhaseRuns = activePhaseValidatorRuns(ci);
const unexpectedActive = activePhaseRuns.filter(line => line !== 'run: node scripts/validate-phase35b-library-bookshelf.js');
if (unexpectedActive.length) fail(`Unexpected active historical phase validator(s): ${unexpectedActive.join('; ')}`);
else pass('No unexpected active historical phase validators');

console.log('\n[6] Changed-file boundaries');
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

if (changedFiles.includes('package.json') || changedFiles.includes('package-lock.json')) {
  fail('Package files must not change in Phase 35B');
} else {
  pass('Package files unchanged');
}

console.log('\n[7] Forbidden positive claims');
requireNoForbiddenPositiveClaims(docsContent, 'Phase 35B docs');

console.log('\n[8] Validator self-check');
if (validator.includes('PHASE35B_LEADER_UI_LIBRARY_BOOKSHELF_STATUS: COMPLETED_LIBRARY_BOOKSHELF_TAB_SYSTEM')) {
  pass('Validator embeds Phase 35B status token');
} else {
  fail('Validator must embed the Phase 35B status token');
}

if (ERRORS.length) {
  console.error('\nPhase 35B Library Bookshelf validation FAILED:');
  for (const error of ERRORS) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\nPhase 35B Library Bookshelf validation PASSED.');
