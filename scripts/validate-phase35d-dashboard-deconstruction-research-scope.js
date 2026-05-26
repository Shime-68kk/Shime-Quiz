#!/usr/bin/env node
/**
 * Phase 35D — Dashboard Deconstruction Research Scope Validator
 *
 * PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_STATUS: COMPLETED_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
 * PHASE35D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
 * PHASE35D_RESEARCH_SCOPE: DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
 * PHASE35D_DASHBOARD_SCOPE_STATUS: DASHBOARD_SURFACES_RESEARCHED_AND_PHASE35E_SEEDED
 * PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const ERRORS = [];

const RESEARCH_DOC = 'docs/research/phase35d-dashboard-deconstruction-research-scope.md';
const SUMMARY_DOC = 'docs/release/phase35d-dashboard-deconstruction-research-scope-summary.md';
const SEED_35E = 'docs/planning/phase35e-dashboard-calm-home-implementation-seed.md';
const VALIDATOR = 'scripts/validate-phase35d-dashboard-deconstruction-research-scope.js';
const CI = '.github/workflows/e2e-smoke.yml';

const REQUIRED_FILES = [RESEARCH_DOC, SUMMARY_DOC, SEED_35E, VALIDATOR, CI];
const ALLOWED_CHANGED_FILES = new Set(REQUIRED_FILES);
const GENERATED_ARTIFACTS = ['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', 'FETCH_HEAD'];

const REQUIRED_TOKENS = [
  'PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_STATUS: COMPLETED_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE',
  'PHASE35D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE35D_RESEARCH_SCOPE: DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE35D_DASHBOARD_SCOPE_STATUS: DASHBOARD_SURFACES_RESEARCHED_AND_PHASE35E_SEEDED',
  'PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED',
];

const DECISION_PREFIX = 'PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION:';
const ALLOWED_DECISIONS = [
  'PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION',
  'NEEDS_DASHBOARD_SCOPE_REWORK',
  'HOLD_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE',
];

const RESEARCH_HEADINGS = [
  '# Phase 35D — Dashboard Deconstruction Research Scope',
  '## Status tokens',
  '## Scope',
  '## Inputs from Phase 35C',
  '## Research method',
  '## Current Dashboard surface inventory',
  '## Dashboard overload findings',
  '## Calm Home candidate surfaces',
  '## Progress Journal candidate surfaces',
  '## Existing tests and assumptions to protect',
  '## Proposed Phase 35E candidate',
  '## Phase 35E allowed files / expected areas',
  '## Phase 35E forbidden areas',
  '## Accessibility and mobile considerations',
  '## Risk assessment',
  '## Rollback plan for Phase 35E',
  '## Chosen research decision',
  '## Decision rationale',
  '## What Phase 35D supports',
  '## What Phase 35D does not approve',
  '## Next recommended phase',
];

const SUMMARY_HEADINGS = [
  '# Phase 35D — Dashboard Deconstruction Research Scope Summary',
  '## Status tokens',
  '## Scope',
  '## Current readiness',
  '## Research result',
  '## Chosen decision',
  '## Decision rationale',
  '## Dashboard surfaces reviewed',
  '## Phase 35E candidate',
  '## Limitations carried forward',
  '## What is supported',
  '## What remains not approved',
  '## Validation summary',
  '## Guardrails',
  '## Next recommended phase',
];

const SEED_HEADINGS = [
  '# Phase 35E — Dashboard Calm Home Implementation Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 35D',
  '## Runtime candidate',
  '## User-facing intent',
  '## Allowed files / expected areas',
  '## Forbidden areas',
  '## Implementation guidance',
  '## Accessibility and mobile requirements',
  '## Validation required',
  '## Evidence required',
  '## Rollback plan',
  '## Decision options',
  '## Forbidden default approvals',
  '## Recommended next step',
];

const INVENTORY_ROWS = [
  'greeting / welcome header',
  'daily progress summary',
  '`Hành trình hôm nay`',
  'goals/targets',
  'statistics cards',
  'trends/session analytics',
  'weak/strong topics',
  'mastery/detail sections',
  'questions needing reinforcement',
  'review schedule',
  'smart practice',
  'study history',
  'data model / technical status sections',
];

const REQUIRED_STATEMENTS = [
  'Next recommended phase: Phase 35E — Dashboard Calm Home Implementation',
  'Phase 35E is a small runtime candidate and is not approval for a broad Dashboard redesign.',
  'Phase 35D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.',
  'Phase 35D does not approve BETA_READY.',
  'Phase 35D does not approve public production readiness.',
  'Phase 35D does not approve broad validation or stress-tested readiness.',
  'Phase 35D does not approve guaranteed data-loss prevention.',
  'Phase 35D does not approve storage/backup/restore behavior changes.',
  'Phase 35D does not approve sync/cloud/account/auth/backend.',
  'Phase 35D does not approve telemetry/network calls.',
  'Phase 35D does not approve built-in AI/OCR/API-key/BYOK behavior.',
  'Phase 35D does not approve Dashboard runtime redesign in this phase.',
  'Phase 35D does not approve Navigation indicator implementation.',
  'Phase 35D does not approve Elastic Button Compression implementation.',
  'Phase 35D does not approve Study Room polish.',
  'Phase 35D does not approve Streak Fire.',
  'Phase 35D does not approve Collapsible Header.',
  'Phase 35D does not approve Dynamic Canvas Themes implementation.',
];

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
  if (invalid.length) fail(`Invalid Phase 35D decision token value(s): ${invalid.join(', ')}`);
  else pass('Phase 35D decision token value is allowed');
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
    const rev = runGit(['rev-parse', '--verify', 'origin/main']);
    pass(`origin/main is available: ${rev}`);
  } catch {
    fail('origin/main must be available for Phase 35D validation');
  }
}

function requirePhase35CVisible() {
  try {
    const log = runGit(['log', '--oneline', '--decorate', 'origin/main', '--grep=35C', '-40']);
    if (log.includes('35C')) pass('Phase 35C is visible in origin/main log');
    else fail('Phase 35C is not visible in origin/main log');
  } catch {
    fail('Could not verify Phase 35C visibility in origin/main');
  }
}

function isForbiddenChangedFile(file) {
  if (ALLOWED_CHANGED_FILES.has(file)) return false;
  if (isGeneratedArtifactPath(file)) return true;

  const forbiddenPatterns = [
    /^src\//,
    /^tests\//,
    /^e2e\//,
    /^package\.json$/,
    /^package-lock\.json$/,
    /^sw\.js$/,
    /^boot-guard\.js$/,
    /^docs\/adr\//,
    /^RELEASE_NOTES(?:_V2)?\.md$/,
    /^docs\/(?:testing|design)\//,
    /^docs\/release\/(?!phase35d-dashboard-deconstruction-research-scope-summary\.md$)/,
    /^docs\/planning\/(?!phase35e-dashboard-calm-home-implementation-seed\.md$)/,
    /^docs\/research\/(?!phase35d-dashboard-deconstruction-research-scope\.md$)/,
    /^scripts\/(?!validate-phase35d-dashboard-deconstruction-research-scope\.js$)/,
    /^\.github\/workflows\/(?!e2e-smoke\.yml$)/,
    /^node_modules\//,
    /^dist\//,
    /^coverage\//,
    /^test-results\//,
    /^playwright-report\//,
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
        lower.includes('must not') ||
        lower.includes('forbidden') ||
        lower.includes('no runtime') ||
        lower.includes('no ') ||
        lower.includes('not ') ||
        lower.includes('only') ||
        lower.includes('limitation') ||
        lower.includes('limited_beta_candidate')
      );
    })
    .join('\n');

  const forbidden = [
    /\bBETA_READY\s+(?:is\s+)?approved\b/i,
    /\bpublic production\s+(?:is\s+)?(?:ready|approved)\b/i,
    /\bbroad validation\s+(?:is\s+)?approved\b/i,
    /\bstress-tested readiness\s+(?:is\s+)?approved\b/i,
    /\bguaranteed data-loss prevention\b/i,
    /\bsync\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bcloud\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bbackend\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bauth\b.*\b(?:approved|implemented|enabled)\b/i,
    /\btelemetry\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bAI\/OCR\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bDashboard runtime\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bNavigation indicator\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bElastic Button Compression\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bStudy Room polish\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bStreak Fire\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bCollapsible Header\b.*\b(?:approved|implemented|enabled)\b/i,
    /\bDynamic Canvas Themes\b.*\b(?:approved|implemented|enabled)\b/i,
  ];

  for (const pattern of forbidden) {
    if (pattern.test(scannedLines)) fail(`${label} contains forbidden positive claim: ${pattern}`);
  }
  pass(`${label} forbidden positive-claim scan complete`);
}

console.log('\n[1] Baseline availability');
requireOriginMainAvailable();
requirePhase35CVisible();

console.log('\n[2] Required files');
for (const file of REQUIRED_FILES) requireFile(file);

const researchDoc = requireFile(RESEARCH_DOC);
const summaryDoc = requireFile(SUMMARY_DOC);
const seed35e = requireFile(SEED_35E);
const validator = requireFile(VALIDATOR);
const ci = requireFile(CI);

console.log('\n[3] Tokens and decisions');
for (const token of REQUIRED_TOKENS) {
  if ([researchDoc, summaryDoc, seed35e, validator].some(content => content.includes(token))) pass(`Required token present: ${token}`);
  else fail(`Required token missing: ${token}`);
}
requireDecision(`${researchDoc}\n${summaryDoc}\n${validator}`);

console.log('\n[4] Headings, rows, and required statements');
requireHeadings(researchDoc, RESEARCH_HEADINGS, 'Research doc');
requireHeadings(summaryDoc, SUMMARY_HEADINGS, 'Summary doc');
requireHeadings(seed35e, SEED_HEADINGS, 'Phase 35E seed');
requirePhrases(researchDoc, ['Dashboard surface | Current purpose | Learner-facing home candidate | Progress Journal candidate | Risk | Phase 35E recommendation'], 'Research inventory table');
requirePhrases(researchDoc, INVENTORY_ROWS, 'Research inventory row');
requirePhrases(`${researchDoc}\n${summaryDoc}\n${seed35e}`, REQUIRED_STATEMENTS, 'Required next-phase/guardrail statement');
requirePhrases(seed35e, [
  'HOLD_DASHBOARD_CALM_HOME_IMPLEMENTATION',
  'NEEDS_DASHBOARD_IMPLEMENTATION_REWORK',
  'PASS_TO_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW',
], 'Phase 35E decision option');
requirePhrases(`${researchDoc}\n${summaryDoc}`, ['Limitations carried forward', 'Static research only', 'No runtime Dashboard'], 'Limitations carried forward');

console.log('\n[5] CI registration');
if (ci.includes('actions/checkout@v4') && ci.includes('fetch-depth: 0')) pass('Workflow uses actions/checkout@v4 with fetch-depth: 0');
else fail('Workflow must use actions/checkout@v4 with fetch-depth: 0');
if (includesCIActiveRun(ci, 'validate-phase35d-dashboard-deconstruction-research-scope.js')) pass('CI actively runs Phase 35D validator');
else fail('CI must actively run Phase 35D validator');
if (includesCICommentedRun(ci, 'validate-phase35c-library-bookshelf-evidence-review.js')) pass('Phase 35C validator retained as commented historical reference');
else fail('Phase 35C validator must be retained as commented historical reference');
const activeRuns = activePhaseValidatorRuns(ci);
if (activeRuns.length === 1 && activeRuns[0].includes('validate-phase35d-dashboard-deconstruction-research-scope.js')) pass('No prior validators active as Phase 35D blockers');
else fail(`Unexpected active phase validator runs: ${activeRuns.join('; ') || '(none)'}`);
const forbiddenWorkflowFetchCommand = ['git fetch origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
if (!ci.includes(forbiddenWorkflowFetchCommand)) pass('Workflow has no shell git fetch origin main step');
else fail('Workflow must not include shell git fetch origin main step');
if (!ci.includes('continue-on-error')) pass('Workflow has no continue-on-error');
else fail('Workflow must not use continue-on-error');
if (!/validate-phase\*|validate-\*|scripts\/validate-\*|for .*validate-phase/.test(ci)) pass('Workflow has no full validator glob chain');
else fail('Workflow must not run a full validator glob chain');

console.log('\n[6] Validator self-checks');
if (!validator.includes("spawnSync('git'")) fail('Validator must verify origin/main availability using git');
else pass('Validator includes git origin/main availability check');
if (!validator.includes('requireOriginMainAvailable')) fail('Validator missing requireOriginMainAvailable helper');
else pass('Validator verifies origin/main availability');
const forbiddenFetchCommand = ['git fetch origin', 'refs/heads/main:refs/remotes/origin/main', '--prune'].join(' ');
if (!validator.includes(forbiddenFetchCommand)) pass('Validator does not execute internal git fetch');
else fail('Validator must not execute internal git fetch');

console.log('\n[7] Changed files guard');
const changedFiles = getChangedFiles();
for (const file of changedFiles) {
  if (ALLOWED_CHANGED_FILES.has(file)) pass(`Changed file allowed: ${file}`);
  else if (isForbiddenChangedFile(file)) fail(`Forbidden changed file: ${file}`);
  else fail(`Unexpected changed file outside exact allowlist: ${file}`);
}
for (const file of REQUIRED_FILES) {
  if (changedFiles.includes(file)) pass(`Required changed file present: ${file}`);
  else fail(`Required changed file not detected: ${file}`);
}

console.log('\n[8] Forbidden approvals scan');
requireNoForbiddenPositiveClaims(researchDoc, 'Research doc');
requireNoForbiddenPositiveClaims(summaryDoc, 'Summary doc');
requireNoForbiddenPositiveClaims(seed35e, 'Phase 35E seed');

if (ERRORS.length) {
  console.error('\nPhase 35D validation failed:');
  for (const error of ERRORS) console.error(`  - ${error}`);
  process.exit(1);
}

console.log('\nPhase 35D validation passed.');
