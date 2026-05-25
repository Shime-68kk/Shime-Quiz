#!/usr/bin/env node
/**
 * Phase 34A — Leader UI Effects Design Gate Validator
 *
 * PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_STATUS: COMPLETED_UI_EFFECTS_DESIGN_GATE
 * PHASE34A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE34A_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED
 * PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_DECISION: PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION
 * PHASE34A_DESIGN_SCOPE: DESIGN_GATE_AND_TARGET_AUDIT_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE34A_EFFECTS_BOUNDARY_STATUS: PERFORMANCE_ACCESSIBILITY_ROLLBACK_BOUNDARIES_DEFINED
 * PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const DESIGN_SPEC = 'docs/design/phase34a-leader-ui-effects-design-spec.md';
const TARGET_AUDIT = 'docs/design/phase34a-leader-ui-effects-target-audit.md';
const DESIGN_GATE = 'docs/testing/phase34a-leader-ui-effects-design-gate.md';
const SUMMARY = 'docs/release/phase34a-leader-ui-effects-design-gate-summary.md';
const SEED_34B = 'docs/planning/phase34b-leader-ui-effects-implementation-seed.md';
const VALIDATOR = 'scripts/validate-phase34a-leader-ui-effects-design-gate.js';
const CI = '.github/workflows/e2e-smoke.yml';

const ALLOWED_NEW = new Set([DESIGN_SPEC, TARGET_AUDIT, DESIGN_GATE, SUMMARY, SEED_34B, VALIDATOR]);
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

function includesCIActiveRun(ci, scriptName) {
  const escaped = scriptName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^\\s*run:\\s*node\\s+scripts/${escaped}\\s*$`, 'm').test(ci);
}

function includesCIHistoricalPhaseValidatorRun(ci) {
  return ci
    .split('\n')
    .map(line => line.trim())
    .some(line =>
      line.startsWith('run: node scripts/validate-phase') &&
      line !== 'run: node scripts/validate-phase34a-leader-ui-effects-design-gate.js'
    );
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

function requireNoPositiveClaims(content, label) {
  const lines = content.split('\n');
  const scannedLines = [];
  let inNotAllowedContext = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (
      lower.includes('claim not allowed') ||
      lower.includes('what phase 34a does not approve') ||
      lower.includes('what remains not approved') ||
      lower.includes('forbidden default approvals') ||
      lower.includes('guardrails') ||
      lower.includes('files explicitly out of scope')
    ) {
      inNotAllowedContext = true;
    }
    if (inNotAllowedContext && lower.startsWith('## ') && !lower.includes('what phase 34a does not approve') && !lower.includes('what remains not approved') && !lower.includes('forbidden default approvals') && !lower.includes('guardrails') && !lower.includes('files explicitly out of scope')) {
      inNotAllowedContext = false;
    }

    if (
      inNotAllowedContext ||
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
        lower.includes('out of scope')
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
    /\bbroad beta release\s+(?:approved|ready)\b/i,
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
    /\bBYOC\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bWebDAV\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bP2P\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bdevice-transfer\b.*\b(?:approved|enabled|implemented)\b/i,
    /\bordinary-user Data Safety visibility approved\b/i,
    /\bstress-tested readiness approved\b/i,
    /\bPhase 34B\b.*\b(?:is|was)\s+approved\b/i,
    /\bPhase 34B\b.*\b(?:is|was)\s+automatically approved\b/i,
    /\bLeader UI effects\b.*\b(?:implemented|enabled|shipped)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scanned)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} positive-claim guardrail scan complete`);
}

console.log('\n[1] Required files');

const designSpec = requireFile(DESIGN_SPEC);
const targetAudit = requireFile(TARGET_AUDIT);
const designGate = requireFile(DESIGN_GATE);
const summary = requireFile(SUMMARY);
const seed34b = requireFile(SEED_34B);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);
const docsContent = [designSpec, targetAudit, designGate, summary, seed34b].filter(Boolean).join('\n');

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
    else fail(`Expected new file must be added in Phase 34A: ${file} (status: ${status || 'missing'})`);
  }
  for (const file of ALLOWED_MODIFIED) {
    const status = statusMap.get(file);
    if (status === 'M') pass(`Expected modified file status M: ${file}`);
    else fail(`Expected modified file must be modified in Phase 34A: ${file} (status: ${status || 'missing'})`);
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
  /^docs\/testing\/phase(30|31|32|33)/,
  /^docs\/release\/phase(30|31|32|33)/,
  /^docs\/planning\/phase(30|31|32|33)/,
  /^docs\/design\/phase31b-/,
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

  if (includesCIActiveRun(ci, 'validate-phase34a-leader-ui-effects-design-gate.js')) {
    pass('CI registers active Phase 34A validator');
  } else {
    fail('CI must register active Phase 34A validator');
  }

  if (includesCIHistoricalPhaseValidatorRun(ci)) {
    fail('Prior validators must be comments only and not active Phase 34A blockers');
  } else {
    pass('Prior phase validators are not active Phase 34A blockers');
  }
}

console.log('\n[6] Required Phase 34A tokens');

const REQUIRED_TOKENS = [
  'PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_STATUS: COMPLETED_UI_EFFECTS_DESIGN_GATE',
  'PHASE34A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE34A_CONTROLLED_LIMITED_BETA_STATUS: GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS_CONFIRMED',
  'PHASE34A_DESIGN_SCOPE: DESIGN_GATE_AND_TARGET_AUDIT_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE34A_EFFECTS_BOUNDARY_STATUS: PERFORMANCE_ACCESSIBILITY_ROLLBACK_BOUNDARIES_DEFINED',
  'PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION_SEED_STATUS: PREPARED_PLANNING_SEED',
];

for (const token of REQUIRED_TOKENS) {
  if (docsContent.includes(token)) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}

console.log('\n[7] Decision token');

const DECISION_PREFIX = 'PHASE34A_LEADER_UI_EFFECTS_DESIGN_GATE_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE34B_LEADER_UI_EFFECTS_IMPLEMENTATION',
  'NEEDS_UI_EFFECTS_DESIGN_REWORK',
  'HOLD_LEADER_UI_EFFECTS_DESIGN',
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

console.log('\n[8] Design spec checks');

const DESIGN_SPEC_HEADINGS = [
  '# Phase 34A — Leader UI Effects Design Spec',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33F',
  '## Design method',
  '## Effect inventory',
  '## Effect ownership model',
  '## Candidate implementation surfaces',
  '## Performance budget',
  '## Accessibility and reduced-motion rules',
  '## Motion and visual language principles',
  '## Screenshot and manual evidence plan',
  '## Rollback and removal plan',
  '## Storage and data safety boundary',
  '## No cloud/sync/backend/account/auth claim boundary',
  '## No Beta Ready or public production claim boundary',
  '## Phase 34B implementation boundaries',
  '## What Phase 34A supports',
  '## What Phase 34A does not approve',
  '## Next recommended phase',
];
requireHeadings(designSpec, DESIGN_SPEC_HEADINGS, DESIGN_SPEC);

const EFFECT_INVENTORY = [
  'page/route entrance calm fade or slide',
  'card hover/press micro-interaction',
  'quiz answer feedback transition',
  'progress/completion celebration restraint',
  'settings/help panel transition',
  'skeleton/loading calm placeholder',
  'focus/keyboard-visible state polish',
  'reduced-motion fallback',
];
requirePhrases(designSpec, EFFECT_INVENTORY, `${DESIGN_SPEC} effect inventory`);

console.log('\n[9] Target audit checks');

const TARGET_AUDIT_HEADINGS = [
  '# Phase 34A — Leader UI Effects Target Audit',
  '## Scope',
  '## Read-only audit method',
  '## Candidate files inspected',
  '## Candidate UI surfaces',
  '## Recommended implementation ownership',
  '## Files explicitly out of scope',
  '## Risk notes',
  '## Evidence recommendations',
  '## Phase 34B candidate file ownership',
];
requireHeadings(targetAudit, TARGET_AUDIT_HEADINGS, TARGET_AUDIT);

const TARGET_AUDIT_COLUMNS = [
  'Likely owner component/file',
  'Proposed effect type',
  'Risk rating',
  'Reduced-motion required',
  'Screenshots/manual evidence required',
  'Phase 34B scope',
];
requirePhrases(targetAudit, TARGET_AUDIT_COLUMNS, `${TARGET_AUDIT} table column`);
requirePhrases(targetAudit, EFFECT_INVENTORY, `${TARGET_AUDIT} candidate surface`);
requirePhrases(
  targetAudit,
  [
    'src/layout/AppLayout.jsx',
    'src/layout/Sidebar.jsx',
    'src/layout/BottomNav.jsx',
    'src/routes/Dashboard.jsx',
    'src/components/learning/DashboardTodayCard.jsx',
    'src/routes/StudyRoom.jsx',
    'src/styles/global.css',
  ],
  `${TARGET_AUDIT} inspected candidate file`,
);
requirePhrases(targetAudit, ['Low', 'Medium', 'Yes', 'In scope', 'Deferred'], `${TARGET_AUDIT} required audit detail`);

console.log('\n[10] Design gate doc checks');

const DESIGN_GATE_HEADINGS = [
  '# Phase 34A — Leader UI Effects Design Gate',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 33F',
  '## Design gate method',
  '## Design gate table',
  '## Effect inventory review',
  '## Target audit review',
  '## Performance budget review',
  '## Accessibility and reduced-motion review',
  '## Evidence plan review',
  '## Rollback/removal review',
  '## Storage and data safety boundary review',
  '## Claim boundary review',
  '## Chosen design gate decision',
  '## Decision rationale',
  '## What Phase 34A supports',
  '## What Phase 34A does not approve',
  '## Next recommended phase',
];
requireHeadings(designGate, DESIGN_GATE_HEADINGS, DESIGN_GATE);

const DESIGN_GATE_COLUMNS = [
  'Design surface',
  'Phase 34A input',
  'Gate finding',
  'Required Phase 34B constraint',
  'Risk',
  'Claim allowed',
  'Claim not allowed',
];
requirePhrases(designGate, DESIGN_GATE_COLUMNS, `${DESIGN_GATE} table column`);

const DESIGN_GATE_ROWS = [
  'effect inventory',
  'target audit',
  'performance budget',
  'accessibility and reduced-motion',
  'evidence plan',
  'rollback/removal plan',
  'storage/data safety boundary',
  'no cloud/sync/backend/account/auth claim',
  'no Beta Ready/public production claim',
  'Phase 34B implementation seed',
];
requirePhrases(designGate, DESIGN_GATE_ROWS, `${DESIGN_GATE} table row`);

console.log('\n[11] Release summary checks');

const SUMMARY_HEADINGS = [
  '# Phase 34A — Leader UI Effects Design Gate Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Design result',
  '## Chosen decision',
  '## Decision rationale',
  '## Boundaries defined',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];
requireHeadings(summary, SUMMARY_HEADINGS, SUMMARY);

console.log('\n[12] Phase 34B seed checks');

const SEED_HEADINGS = [
  '# Phase 34B — Leader UI Effects Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 34A',
  '## Implementation constraints',
  '## Allowed implementation surfaces',
  '## Required evidence plan',
  '## Required tests or checks',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];
requireHeadings(seed34b, SEED_HEADINGS, SEED_34B);

const SEED_OPTIONS = [
  'HOLD_LEADER_UI_EFFECTS_IMPLEMENTATION',
  'NEEDS_UI_EFFECTS_IMPLEMENTATION_REWORK',
  'PASS_TO_PHASE34C_LEADER_UI_EFFECTS_EVIDENCE_REVIEW',
];
requirePhrases(seed34b, SEED_OPTIONS, `${SEED_34B} decision option`);

const SEED_CONSTRAINTS = [
  'small runtime/UI-only scope',
  'no storage/backup/restore behavior changes',
  'no route/data model changes',
  'no sync/cloud/backend/account/auth',
  'no telemetry',
  'no new dependencies unless separately justified',
  'CSS-first preferred',
  'prefers-reduced-motion',
  'rollback/removal plan required',
  'screenshot/manual evidence required',
  'build/unit/static validator required',
  'Phase 34B is a separate implementation gate and is not automatically approved.',
];
requirePhrases(seed34b, SEED_CONSTRAINTS, `${SEED_34B} implementation constraint`);

console.log('\n[13] Boundary checks');

const REQUIRED_BOUNDARIES = [
  'CSS-first effects where possible',
  'no new dependencies by default',
  'no animation that blocks quiz interaction',
  'prefers-reduced-motion',
  'short duration effects only',
  'no storage writes',
  'no network calls',
  'no telemetry',
  'no backend/cloud/sync claims',
  'rollback by removing the effect module/styles only',
  'performance budget',
  'accessibility',
  'reduced-motion',
  'rollback',
  'manual evidence',
];
requirePhrases(docsContent, REQUIRED_BOUNDARIES, 'Phase 34A required boundary');

const CARRIED_LIMITATIONS = [
  ['restore/adapter blocked-default-off follow-up required', 'Restore rehearsal browser lane: `BLOCKED_DEFAULT_OFF`', 'Adapter-awareness browser lane: `BLOCKED_DEFAULT_OFF`'],
  ['stress evidence follow-up required', 'Generated/test stress evidence: smoke-level only'],
  ['rollback/removal follow-up required', 'Rollback/removal evidence: simulation-only'],
  ['no real learner data evidence'],
  ['no public production readiness evidence'],
  ['no data-loss guarantee proof', 'No guaranteed data-loss prevention proof'],
  ['Data Safety UX remains internal-only', 'Data Safety UX is internal-only'],
  ['no sync/cloud/backend/auth/account', 'No sync/cloud/account/auth/backend', 'No cloud/sync/backend/account/auth'],
];
for (const variants of CARRIED_LIMITATIONS) {
  requireAnyPhrase(docsContent, variants, 'Carried limitation disclosure');
}

console.log('\n[14] Required next-phase statements');

const REQUIRED_NEXT_PHASE_STATEMENTS = [
  'Next recommended phase: Phase 34B — Leader UI Effects Implementation',
  'Phase 34B is a separate implementation gate and is not automatically approved.',
  'Phase 34A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 34A confirms GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS remains controlled-limited-beta-only.',
  'Phase 34A does not approve BETA_READY.',
  'Phase 34A does not approve public production readiness.',
  'Phase 34A does not approve guaranteed data-loss prevention.',
  'Phase 34A does not approve restore execution.',
  'Phase 34A does not approve production restore rehearsal.',
  'Phase 34A does not approve real learner data restore rehearsal.',
  'Phase 34A does not approve runtime backup/export/restore behavior changes.',
  'Phase 34A does not approve backup file format changes.',
  'Phase 34A does not approve restore overwrite behavior changes.',
  'Phase 34A does not approve storage migration.',
  'Phase 34A does not approve sync/cloud/account/auth/backend.',
  'Phase 34A does not approve telemetry/analytics.',
  'Phase 34A does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 34A does not approve BYOC/WebDAV/P2P/device-transfer implementation.',
  'Phase 34A does not approve limited settings visibility to ordinary users.',
  'Phase 34A does not implement Leader UI effects.',
];
for (const statement of REQUIRED_NEXT_PHASE_STATEMENTS) {
  if (includesPhrase(docsContent, statement)) pass(`Required boundary statement present: ${statement}`);
  else fail(`Required boundary statement missing: ${statement}`);
}

console.log('\n[15] Broad docs guardrail scan');
requireNoPositiveClaims(docsContent, 'Phase 34A docs');

if (ERRORS.length > 0) {
  console.error('\nERRORS');
  for (const error of ERRORS) console.error(`  FAIL  ${error}`);
  process.exit(1);
}

console.log('\nPhase 34A Leader UI effects design gate validation PASS');
