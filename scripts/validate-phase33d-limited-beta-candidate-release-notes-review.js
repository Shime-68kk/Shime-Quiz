#!/usr/bin/env node
/**
 * Phase 33D — Limited Beta Candidate Release Notes Review Validator
 *
 * PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_REVIEW_STATUS: COMPLETED_RELEASE_NOTES_AND_REVIEW
 * PHASE33D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_REVIEW_DECISION: PASS_TO_PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE
 * PHASE33D_RELEASE_NOTES_SCOPE: RELEASE_NOTES_AND_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33D_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_INCLUDED_AND_REVIEWED
 * PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const ERRORS = [];
const WARNINGS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

function fail(msg) { ERRORS.push(msg); }
function warn(msg) { WARNINGS.push(msg); }
function pass(msg) { console.log(`  PASS  ${msg}`); }

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

function getGitSha(ref) {
  try {
    return execSync(`git rev-parse ${ref}`, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  } catch {
    return null;
  }
}

function gitLines(command) {
  const out = execSync(command, { cwd: ROOT, stdio: 'pipe' }).toString().trim();
  return out ? out.split('\n').map(f => f.trim()).filter(Boolean) : [];
}

function getChangedFiles() {
  try {
    const committed = gitLines('git diff --name-only origin/main..HEAD');
    if (committed.length > 0) return committed;

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      const worktree = gitLines('git diff --name-only');
      const staged = gitLines('git diff --cached --name-only');
      const untracked = gitLines('git ls-files --others --exclude-standard');
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
    for (const line of gitLines('git diff --name-status origin/main..HEAD')) {
      const parts = line.split(/\s+/);
      if (parts[1]) map.set(parts[1], parts[0]);
    }

    const headSha = getGitSha('HEAD');
    const originMainSha = getGitSha('origin/main');
    if (headSha && originMainSha && headSha === originMainSha) {
      for (const line of gitLines('git diff --name-status')) {
        const parts = line.split(/\s+/);
        if (parts[1]) map.set(parts[1], parts[0]);
      }
      for (const line of gitLines('git diff --cached --name-status')) {
        const parts = line.split(/\s+/);
        if (parts[1]) map.set(parts[1], parts[0]);
      }
      for (const file of gitLines('git ls-files --others --exclude-standard')) {
        if (!isGeneratedArtifactPath(file) && !map.has(file)) map.set(file, 'A');
      }
    }

    return map;
  } catch {
    fail('Could not determine changed file status from origin/main..HEAD and working tree fallback');
    return map;
  }
}

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCIHistoricalValidatorRun(ci) {
  return /^\s*run:\s*node\s+scripts\/validate-phase(1|2|30|31|32|33a|33b|33c)-/m.test(ci);
}

function normalized(content) {
  return content.replace(/\s+/g, ' ');
}

function includesPhrase(content, phrase) {
  return content.toLowerCase().includes(phrase.toLowerCase());
}

function looselyIncludesPhrase(content, phrase) {
  const simplify = value => value
    .replace(/[`*_>]/g, '')
    .replace(/[-—–]/g, ' ')
    .replace(/[./:;,()[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  return simplify(content).includes(simplify(phrase));
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
    if (includesPhrase(content, phrase) || looselyIncludesPhrase(content, phrase)) {
      pass(`${label} present: ${phrase}`);
      return;
    }
  }
  fail(`${label} missing. Expected one of: ${phrases.join(' | ')}`);
}

function stripAllowedNegativeGuardrails(content) {
  return content
    .replace(/BETA_READY\s+(?:is\s+)?not\s+approved/gi, '')
    .replace(/Beta Ready\s+(?:is\s+)?not\s+approved/gi, '')
    .replace(/does\s+not\s+approve\s+BETA_READY/gi, '')
    .replace(/does\s+not\s+approve\s+Beta Ready/gi, '')
    .replace(/BETA_READY\s+remains\s+not\s+approved/gi, '')
    .replace(/BETA_READY\s+positive\s+claim\s+language/gi, '')
    .replace(/BETA_READY\s+or\s+higher\s+readiness\s+language/gi, '')
    .replace(/public\s+production\s+readiness\s+(?:is\s+)?not\s+approved/gi, '')
    .replace(/does\s+not\s+approve\s+public\s+production\s+readiness/gi, '')
    .replace(/no\s+public\s+production\s+readiness\s+evidence/gi, '')
    .replace(/no\s+public\s+production\s+wording/gi, '')
    .replace(/no\s+public\s+production(?:,|\s+or)/gi, '')
    .replace(/does\s+not\s+approve\s+guaranteed\s+data-loss\s+prevention/gi, '')
    .replace(/no\s+data-loss\s+guarantee/gi, '')
    .replace(/no\s+guaranteed\s+data-loss\s+prevention\s+proof/gi, '')
    .replace(/not\s+a\s+guaranteed\s+rollback\s+proof/gi, '')
    .replace(/guaranteed\s+data\s+loss\s+prevention/gi, '')
    .replace(/guaranteed\s+data-loss\s+prevention/gi, '')
    .replace(/does\s+not\s+approve\s+restore\s+execution/gi, '')
    .replace(/restore\s+execution\s+is\s+not\s+approved/gi, '')
    .replace(/no\s+restore\s+execution/gi, '')
    .replace(/no\s+restore\s+execution\s+wording/gi, '')
    .replace(/restore\s+is\s+safe/gi, '')
    .replace(/does\s+not\s+approve\s+production\s+restore\s+rehearsal/gi, '')
    .replace(/does\s+not\s+approve\s+sync\/cloud\/account\/auth\/backend/gi, '')
    .replace(/does\s+not\s+approve\s+sync\/cloud\/backend\/account\/auth/gi, '')
    .replace(/no\s+sync\/cloud\/account\/auth\/backend/gi, '')
    .replace(/no\s+sync\/cloud\/backend\/account\/auth/gi, '')
    .replace(/no\s+cloud\/sync\/backend\/account\/auth/gi, '')
    .replace(/no\s+cloud\/sync\/backend\/auth\/account/gi, '')
    .replace(/no\s+cloud\/sync\/backend/gi, '')
    .replace(/no\s+cloud\s+sync,\s+account,\s+auth,\s+backend,\s+BYOC,\s+WebDAV,\s+P2P,\s+or\s+device-transfer\s+is\s+available\s+or\s+approved/gi, '')
    .replace(/sync\s+enabled/gi, '')
    .replace(/cloud\s+enabled/gi, '')
    .replace(/backend\s+enabled/gi, '')
    .replace(/does\s+not\s+approve\s+telemetry\/analytics/gi, '')
    .replace(/telemetry\s+enabled/gi, '')
    .replace(/No\s+telemetry\/analytics/gi, '')
    .replace(/does\s+not\s+approve\s+BYOC\/WebDAV\/P2P\/device-transfer\s+implementation/gi, '')
    .replace(/BYOC\/WebDAV\/P2P\/device-transfer\s+implementation/gi, '')
    .replace(/BYOC,\s+WebDAV,\s+P2P,\s+or\s+device-transfer\s+is\s+available\s+or\s+approved/gi, '')
    .replace(/does\s+not\s+approve\s+limited\s+settings\s+visibility\s+to\s+ordinary\s+users/gi, '');
}

function requireNoPositiveClaims(content, label) {
  const scanned = stripAllowedNegativeGuardrails(content)
    .split('\n')
    .filter(line => {
      const lower = line.toLowerCase();
      return !(
        lower.includes('prohibited wording checked') ||
        lower.includes('claim not allowed') ||
        lower.includes('must not') ||
        lower.includes('not approved') ||
        lower.includes('not claim') ||
        lower.includes('does not approve') ||
        lower.includes('confirmed absence') ||
        lower.includes('forbidden default approvals') ||
        lower.includes('use "production ready"') ||
        lower.includes('use "beta ready"') ||
        lower.includes('use "sync enabled"') ||
        lower.startsWith('- approve ') ||
        lower.startsWith('- treat ') ||
        lower.startsWith('| no ') ||
        lower.includes('positive claim')
      );
    })
    .join('\n');
  const forbidden = [
    /\bBETA_READY\s+approved\b/i,
    /\bBeta Ready\s+approved\b/i,
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
    /\bPhase 33E .*\b(?:is|was)\s+automatically approved\b/i,
  ];
  for (const pattern of forbidden) {
    if (pattern.test(scanned)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

console.log('\n[1] Required files');

const RELEASE_NOTES = 'RELEASE_NOTES.md';
const RELEASE_NOTES_V2 = 'RELEASE_NOTES_V2.md';
const REVIEW_DOC = 'docs/testing/phase33d-limited-beta-candidate-release-notes-review.md';
const SUMMARY_DOC = 'docs/release/phase33d-limited-beta-candidate-release-notes-summary.md';
const SEED_33E = 'docs/planning/phase33e-controlled-limited-beta-release-package-seed.md';
const VALIDATOR = 'scripts/validate-phase33d-limited-beta-candidate-release-notes-review.js';
const CI = '.github/workflows/e2e-smoke.yml';

const releaseNotes = requireFile(RELEASE_NOTES);
const releaseNotesV2 = requireFile(RELEASE_NOTES_V2);
const reviewDoc = requireFile(REVIEW_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed33e = requireFile(SEED_33E);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [releaseNotes, releaseNotesV2, reviewDoc, summaryDoc, seed33e].filter(Boolean).join('\n');

console.log('\n[2] Git checks');

try {
  execSync('git rev-parse --verify origin/main', { cwd: ROOT, stdio: 'pipe' });
  pass('origin/main is available');
} catch {
  fail('origin/main is not available; fetch origin/main before validation');
}

const validatorFetchExecPattern = /execSync\s*\([^)]*git\s+fetch/s;
if (validatorFetchExecPattern.test(validator)) fail('Validator must not execute internal git fetch');
else pass('Validator does not execute internal git fetch');

console.log('\n[3] Changed files (origin/main..HEAD)');

const changedFiles = getChangedFiles();
const relevantChangedFiles = changedFiles.filter(f => !isGeneratedArtifactPath(f));
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

const ALLOWED_NEW = new Set([REVIEW_DOC, SUMMARY_DOC, SEED_33E, VALIDATOR]);
const ALLOWED_MODIFIED = new Set([CI, RELEASE_NOTES, RELEASE_NOTES_V2]);
const EXACT_ALLOWED = new Set([...ALLOWED_NEW, ...ALLOWED_MODIFIED]);

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
    else fail(`Expected new file must be added in Phase 33D: ${file} (status: ${status || 'missing'})`);
  }
  for (const file of ALLOWED_MODIFIED) {
    const status = statusMap.get(file);
    if (status === 'M') pass(`Expected modified file status M: ${file}`);
    else fail(`Expected modified file must be modified in Phase 33D: ${file} (status: ${status || 'missing'})`);
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
  /^docs\/testing\/phase(30|31|32|33a|33b|33c)/,
  /^docs\/release\/phase(30|31|32|33a|33b|33c)/,
  /^docs\/planning\/phase(30|31|32|33a|33b|33c)/,
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

  if (includesCIActiveRun(ci, 'validate-phase33d-limited-beta-candidate-release-notes-review.js')) {
    pass('CI registers active Phase 33D validator');
  } else {
    fail('CI must register active Phase 33D validator');
  }

  if (includesCIHistoricalValidatorRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 33D blockers');
  } else {
    pass('Prior phase validators are not active Phase 33D blockers');
  }
}

console.log('\n[6] Required Phase 33D tokens');

const REQUIRED_TOKENS = [
  'PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_REVIEW_STATUS: COMPLETED_RELEASE_NOTES_AND_REVIEW',
  'PHASE33D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33D_RELEASE_NOTES_SCOPE: RELEASE_NOTES_AND_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33D_LIMITATION_DISCLOSURE_STATUS: LIMITATIONS_INCLUDED_AND_REVIEWED',
  'PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (docsContent.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE33D_LIMITED_BETA_CANDIDATE_RELEASE_NOTES_REVIEW_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE33E_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE',
  'NEEDS_RELEASE_NOTES_REWORK',
  'HOLD_LIMITED_BETA_CANDIDATE_RELEASE_NOTES',
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

console.log('\n[8] Release notes checks');

const releaseNoteRequiredPhrases = [
  'LIMITED_BETA_CANDIDATE',
  'controlled limited beta',
  'limitation',
  'Data Safety UX',
  'internal-only',
];
requirePhrases(releaseNotes, releaseNoteRequiredPhrases, RELEASE_NOTES);
requirePhrases(releaseNotesV2, releaseNoteRequiredPhrases, RELEASE_NOTES_V2);
requireAnyPhrase(releaseNotes, ['BETA_READY not approved', 'BETA_READY is not approved', 'BETA_READY remains not approved'], `${RELEASE_NOTES} BETA_READY boundary`);
requireAnyPhrase(releaseNotesV2, ['BETA_READY not approved', 'BETA_READY is not approved', 'BETA_READY remains not approved'], `${RELEASE_NOTES_V2} BETA_READY boundary`);
requireAnyPhrase(releaseNotes, ['public production readiness not approved', 'Public production readiness is not approved'], `${RELEASE_NOTES} public production boundary`);
requireAnyPhrase(releaseNotesV2, ['public production readiness not approved', 'Public production readiness is not approved'], `${RELEASE_NOTES_V2} public production boundary`);
requireAnyPhrase(releaseNotes, ['no cloud/sync/backend/account/auth', 'no sync/cloud/account/auth/backend', 'no sync/cloud/backend/account/auth', 'does not approve sync/cloud/account/auth/backend'], `${RELEASE_NOTES} cloud boundary`);
requireAnyPhrase(releaseNotesV2, ['no cloud/sync/backend/account/auth', 'no sync/cloud/account/auth/backend', 'no sync/cloud/backend/account/auth', 'does not approve sync/cloud/account/auth/backend'], `${RELEASE_NOTES_V2} cloud boundary`);
requireAnyPhrase(releaseNotes, ['no data-loss guarantee', 'does not approve guaranteed data-loss prevention'], `${RELEASE_NOTES} data-loss boundary`);
requireAnyPhrase(releaseNotesV2, ['no data-loss guarantee', 'does not approve guaranteed data-loss prevention'], `${RELEASE_NOTES_V2} data-loss boundary`);
requireAnyPhrase(releaseNotes, ['does not approve restore execution', 'no restore execution', 'Restore execution is not approved'], `${RELEASE_NOTES} restore boundary`);
requireAnyPhrase(releaseNotesV2, ['does not approve restore execution', 'no restore execution', 'Restore execution is not approved'], `${RELEASE_NOTES_V2} restore boundary`);
requireNoPositiveClaims(releaseNotes, RELEASE_NOTES);
requireNoPositiveClaims(releaseNotesV2, RELEASE_NOTES_V2);

console.log('\n[9] Review doc headings, table columns, and rows');

const REQUIRED_REVIEW_HEADINGS = [
  '# Phase 33D — Limited Beta Candidate Release Notes Review',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33C',
  '## Release notes method',
  '## Release notes review table',
  '## RELEASE_NOTES.md update',
  '## RELEASE_NOTES_V2.md update',
  '## Limited Beta Candidate wording review',
  '## Beta Ready wording review',
  '## Public production wording review',
  '## Data-loss guarantee wording review',
  '## Restore execution wording review',
  '## Cloud/sync/backend/account/auth wording review',
  '## Telemetry wording review',
  '## Data Safety UX visibility wording review',
  '## Limitation disclosure review',
  '## Chosen release notes decision',
  '## Decision rationale',
  '## What Phase 33D supports',
  '## What Phase 33D does not approve',
  '## Claim boundary',
  '## Next recommended phase',
];
requireHeadings(reviewDoc, REQUIRED_REVIEW_HEADINGS, REVIEW_DOC);

const REVIEW_TABLE_COLUMNS = [
  'Release-note surface',
  'Update made',
  'Review finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];
requirePhrases(reviewDoc, REVIEW_TABLE_COLUMNS, `${REVIEW_DOC} table column`);

const REVIEW_TABLE_ROWS = [
  'RELEASE_NOTES.md limited beta candidate entry',
  'RELEASE_NOTES_V2.md limited beta candidate entry',
  'current readiness boundary',
  'limitation disclosure',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'no cloud/sync/backend/account/auth claim',
  'Data Safety UX internal-only status',
  'Phase 33E release package seed',
];
requirePhrases(reviewDoc, REVIEW_TABLE_ROWS, `${REVIEW_DOC} table row`);

console.log('\n[10] Release summary checks');

const REQUIRED_SUMMARY_HEADINGS = [
  '# Phase 33D — Limited Beta Candidate Release Notes Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Release notes result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations disclosed',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];
requireHeadings(summaryDoc, REQUIRED_SUMMARY_HEADINGS, SUMMARY_DOC);

console.log('\n[11] Phase 33E seed checks');

const REQUIRED_SEED_HEADINGS = [
  '# Phase 33E — Controlled Limited Beta Release Package Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33D',
  '## Package constraints',
  '## Required package surfaces',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];
requireHeadings(seed33e, REQUIRED_SEED_HEADINGS, SEED_33E);

const REQUIRED_SEED_OPTIONS = [
  'HOLD_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE',
  'NEEDS_RELEASE_PACKAGE_REWORK',
  'PASS_TO_PHASE33F_CONTROLLED_LIMITED_BETA_RELEASE_PACKAGE_REVIEW',
];
requirePhrases(seed33e, REQUIRED_SEED_OPTIONS, `${SEED_33E} decision option`);
requireAnyPhrase(seed33e, ['separate controlled limited beta release package gate'], `${SEED_33E} separate gate framing`);
requireAnyPhrase(seed33e, ['not automatically approved'], `${SEED_33E} approval boundary`);

const REQUIRED_PACKAGE_SURFACES = [
  'release notes',
  'limitation disclosure',
  'participant boundary',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'no cloud/sync/backend/account/auth claim',
  'Data Safety UX internal-only status',
  'validation evidence summary',
  'reviewer evidence summary',
];
requirePhrases(seed33e, REQUIRED_PACKAGE_SURFACES, `${SEED_33E} package surface`);

console.log('\n[12] Required next-phase and limitation statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 33E — Controlled Limited Beta Release Package',
  'Phase 33E is a separate controlled limited beta release package gate and is not automatically approved.',
  'Phase 33D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 33D does not approve BETA_READY.',
  'Phase 33D does not approve public production readiness.',
  'Phase 33D does not approve guaranteed data-loss prevention.',
  'Phase 33D does not approve restore execution.',
  'Phase 33D does not approve production restore rehearsal.',
  'Phase 33D does not approve real learner data restore rehearsal.',
  'Phase 33D does not approve runtime backup/export/restore behavior changes.',
  'Phase 33D does not approve backup file format changes.',
  'Phase 33D does not approve restore overwrite behavior changes.',
  'Phase 33D does not approve storage migration.',
  'Phase 33D does not approve sync/cloud/account/auth/backend.',
  'Phase 33D does not approve telemetry/analytics.',
  'Phase 33D does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 33D does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 33D does not approve limited settings visibility to ordinary users.',
];
for (const statement of REQUIRED_NEXT_PHASE_STATEMENTS) {
  if (normalized(docsContent).includes(normalized(statement))) pass(`Required boundary statement present: ${statement}`);
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
  ['no sync/cloud/backend/auth/account', 'No sync/cloud/account/auth/backend', 'No sync/cloud/account/auth/backend evidence present or intended'],
];
for (const variants of CARRIED_LIMITATIONS) {
  requireAnyPhrase(docsContent, variants, 'Carried limitation disclosure');
}

console.log('\n[13] Broad docs guardrail scan');
requireNoPositiveClaims(docsContent, 'Phase 33D docs and release notes');

if (WARNINGS.length > 0) {
  console.log('\nWARNINGS');
  for (const warning of WARNINGS) console.log(`  WARN  ${warning}`);
}

if (ERRORS.length > 0) {
  console.error('\nFAILURES');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 33D limited beta candidate release notes review validation PASS');
