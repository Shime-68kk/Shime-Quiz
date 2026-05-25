#!/usr/bin/env node
/**
 * Phase 33F — Controlled Limited Beta Final Go/No-Go Validator
 *
 * PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_STATUS: COMPLETED_FINAL_GO_NO_GO
 * PHASE33F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_DECISION: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS
 * PHASE33F_GO_NO_GO_SCOPE: CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE33F_LIMITATION_STATUS: LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY
 * PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const GO_NO_GO_DOC = 'docs/testing/phase33f-controlled-limited-beta-final-go-no-go.md';
const SUMMARY_DOC = 'docs/release/phase33f-controlled-limited-beta-final-go-no-go-summary.md';
const SEED_34A = 'docs/planning/phase34a-leader-ui-effects-design-gate-seed.md';
const VALIDATOR = 'scripts/validate-phase33f-controlled-limited-beta-final-go-no-go.js';
const CI = '.github/workflows/e2e-smoke.yml';

const ALLOWED_NEW = new Set([GO_NO_GO_DOC, SUMMARY_DOC, SEED_34A, VALIDATOR]);
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
  return /^\s*run:\s*node\s+scripts\/validate-phase(1|2|30|31|32|33[a-e])-/m.test(ci);
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
  let inNotAllowedContext = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('claim not allowed') ||
      lower.includes('what phase 33f does not approve') ||
      lower.includes('what remains not approved') ||
      lower.includes('forbidden default approvals') ||
      lower.includes('guardrails')
    ) {
      inNotAllowedContext = true;
    }
    if (inNotAllowedContext && lower.startsWith('## ') && !lower.includes('what phase 33f does not approve') && !lower.includes('what remains not approved') && !lower.includes('forbidden default approvals') && !lower.includes('guardrails')) {
      inNotAllowedContext = false;
    }

    if (
      inNotAllowedContext ||
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
        lower.includes('not automatically approved') ||
        lower.includes('not a data-loss guarantee') ||
        lower.includes('not public production') ||
        lower.includes('only for controlled limited beta')
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
    /\bPhase 34A\b.*\b(?:is|was)\s+approved\b/i,
    /\bPhase 34A\b.*\b(?:is|was)\s+automatically approved\b/i,
    /\bLeader UI effects\b.*\b(?:implemented|enabled|shipped|approved for implementation)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scanned)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

console.log('\n[1] Required files');

const goNoGoDoc = requireFile(GO_NO_GO_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed34a = requireFile(SEED_34A);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [goNoGoDoc, summaryDoc, seed34a].filter(Boolean).join('\n');

console.log('\n[2] Git checks');

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
    else fail(`Expected new file must be added in Phase 33F: ${file} (status: ${status || 'missing'})`);
  }
  for (const file of ALLOWED_MODIFIED) {
    const status = statusMap.get(file);
    if (status === 'M') pass(`Expected modified file status M: ${file}`);
    else fail(`Expected modified file must be modified in Phase 33F: ${file} (status: ${status || 'missing'})`);
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
  /^docs\/testing\/phase(30|31|32|33[a-e])/,
  /^docs\/release\/phase(30|31|32|33[a-e])/,
  /^docs\/planning\/phase(30|31|32|33[a-f])/,
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

  if (includesCIActiveRun(ci, 'validate-phase33f-controlled-limited-beta-final-go-no-go.js')) {
    pass('CI registers active Phase 33F validator');
  } else {
    fail('CI must register active Phase 33F validator');
  }

  if (includesCIHistoricalPhaseValidatorRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 33F blockers');
  } else {
    pass('Prior phase validators are not active Phase 33F blockers');
  }
}

console.log('\n[6] Required Phase 33F tokens');

const REQUIRED_TOKENS = [
  'PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_STATUS: COMPLETED_FINAL_GO_NO_GO',
  'PHASE33F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE33F_GO_NO_GO_SCOPE: CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE33F_LIMITATION_STATUS: LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY',
  'PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (docsContent.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE33F_CONTROLLED_LIMITED_BETA_FINAL_GO_NO_GO_DECISION:';
const ALLOWED_DECISIONS = [
  'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS',
  'NEEDS_RELEASE_PACKAGE_REWORK',
  'NO_GO_CONTROLLED_LIMITED_BETA',
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

console.log('\n[8] Final go/no-go doc checks');

const GO_NO_GO_HEADINGS = [
  '# Phase 33F — Controlled Limited Beta Final Go/No-Go',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33E',
  '## Go/No-Go method',
  '## Final go/no-go table',
  '## Release package completeness',
  '## Participant boundary',
  '## Limitation disclosure',
  '## Validation evidence summary',
  '## Reviewer evidence summary',
  '## Current readiness boundary',
  '## Claim boundary',
  '## Data Safety UX internal-only status',
  '## No cloud/sync/backend/account/auth claim',
  '## Final go/no-go decision',
  '## Decision rationale',
  '## What Phase 33F supports',
  '## What Phase 33F does not approve',
  '## Phase 34A UI effects handoff',
  '## Next recommended phase',
];
requireHeadings(goNoGoDoc, GO_NO_GO_HEADINGS, GO_NO_GO_DOC);

const GO_NO_GO_COLUMNS = [
  'Decision surface',
  'Phase 33E input',
  'Go/No-Go finding',
  'Remaining limitation',
  'Decision impact',
  'Claim allowed',
  'Claim not allowed',
];
requirePhrases(goNoGoDoc, GO_NO_GO_COLUMNS, `${GO_NO_GO_DOC} table column`);

const GO_NO_GO_ROWS = [
  'release package completeness',
  'participant boundary',
  'limitation disclosure',
  'validation evidence summary',
  'reviewer evidence summary',
  'current readiness boundary',
  'claim boundary',
  'Data Safety UX internal-only status',
  'no cloud/sync/backend/account/auth claim',
  'no Beta Ready wording',
  'no public production wording',
  'no data-loss guarantee wording',
  'no restore execution wording',
  'final go/no-go decision',
  'Phase 34A Leader UI Effects Design Gate seed',
];
requireTableRows(goNoGoDoc, GO_NO_GO_ROWS, `${GO_NO_GO_DOC} table`);
requireAnyPhrase(
  goNoGoDoc,
  [
    'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS is not BETA_READY',
    'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS is not equivalent to BETA_READY',
    'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS does not approve BETA_READY',
    'GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS is issued. This is not BETA_READY.',
  ],
  `${GO_NO_GO_DOC} final decision Beta Ready boundary`,
);
requirePhrases(
  goNoGoDoc,
  [
    'not public production readiness',
    'not a data-loss guarantee',
  ],
  `${GO_NO_GO_DOC} final decision boundary`,
);

console.log('\n[9] Release summary checks');

const SUMMARY_HEADINGS = [
  '# Phase 33F — Controlled Limited Beta Final Go/No-Go Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Final go/no-go result',
  '## Chosen decision',
  '## Decision rationale',
  '## Limitations accepted for controlled limited beta only',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];
requireHeadings(summaryDoc, SUMMARY_HEADINGS, SUMMARY_DOC);

console.log('\n[10] Phase 34A seed checks');

const SEED_HEADINGS = [
  '# Phase 34A — Leader UI Effects Design Gate Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 33F',
  '## Design constraints',
  '## Required design surfaces',
  '## Required evidence plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];
requireHeadings(seed34a, SEED_HEADINGS, SEED_34A);

const SEED_OPTIONS = [
  'HOLD_LEADER_UI_EFFECTS_DESIGN',
  'NEEDS_UI_EFFECTS_DESIGN_REWORK',
  'PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION',
];
requirePhrases(seed34a, SEED_OPTIONS, `${SEED_34A} decision option`);

const DESIGN_SURFACES = [
  'effect inventory and ownership',
  'performance budget',
  'accessibility and reduced-motion rules',
  'no storage/backup/restore behavior changes',
  'no cloud/sync/backend/account/auth claims',
  'no data-loss guarantee claims',
  'no Beta Ready/public production claims',
  'screenshots/manual evidence plan',
  'rollback/removal plan',
  'final implementation scope boundaries',
];
requirePhrases(seed34a, DESIGN_SURFACES, `${SEED_34A} design surface`);
requirePhrases(
  seed34a,
  ['Phase 34A is a separate Leader UI effects design gate and is not automatically approved.'],
  `${SEED_34A} approval boundary`,
);

console.log('\n[11] Required next-phase and limitation statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 34A — Leader UI Effects Design Gate',
  'Phase 34A is a separate Leader UI effects design gate and is not automatically approved.',
  'Phase 33F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 33F does not approve BETA_READY.',
  'Phase 33F does not approve public production readiness.',
  'Phase 33F does not approve guaranteed data-loss prevention.',
  'Phase 33F does not approve restore execution.',
  'Phase 33F does not approve production restore rehearsal.',
  'Phase 33F does not approve real learner data restore rehearsal.',
  'Phase 33F does not approve runtime backup/export/restore behavior changes.',
  'Phase 33F does not approve backup file format changes.',
  'Phase 33F does not approve restore overwrite behavior changes.',
  'Phase 33F does not approve storage migration.',
  'Phase 33F does not approve sync/cloud/account/auth/backend.',
  'Phase 33F does not approve telemetry/analytics.',
  'Phase 33F does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 33F does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 33F does not approve limited settings visibility to ordinary users.',
  'Phase 33F does not implement Leader UI effects.',
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
  ['limitations accepted for controlled limited beta only', 'LIMITATIONS_ACCEPTED_FOR_CONTROLLED_LIMITED_BETA_ONLY'],
];
for (const variants of CARRIED_LIMITATIONS) {
  requireAnyPhrase(docsContent, variants, 'Carried limitation disclosure');
}

console.log('\n[12] Broad docs guardrail scan');
requireNoPositiveClaims(docsContent, 'Phase 33F docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 33F controlled limited beta final go/no-go validation PASS');
