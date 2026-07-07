#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const WORKFLOW_FILE = '.github/workflows/e2e-smoke.yml';
const INPUT_SEED_FILE = 'docs/planning/phase37f-limited-release-evidence-review-seed.md';
const REVIEW_FILE = 'docs/testing/phase37f-limited-release-evidence-review.md';
const SUMMARY_FILE = 'docs/release/phase37f-limited-release-evidence-review-summary.md';
const NEXT_SEED_FILE = 'docs/planning/app-h1-safe-learning-capsule-contract-seed.md';
const VALIDATOR_FILE = 'scripts/validate-phase37f-limited-release-evidence-review.js';

const REQUIRED_FILES = [WORKFLOW_FILE, INPUT_SEED_FILE, REVIEW_FILE, SUMMARY_FILE, NEXT_SEED_FILE, VALIDATOR_FILE];
const PHASE37F_ALLOWED_FILES = new Set(REQUIRED_FILES);

const REQUIRED_TOKENS = [
  'PHASE37F_LIMITED_RELEASE_EVIDENCE_REVIEW_STATUS: COMPLETED_LIMITED_RELEASE_EVIDENCE_REVIEW',
  'PHASE37F_LIMITED_RELEASE_DECISION: LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN',
  'PHASE37F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED',
  'PHASE37F_REVIEW_SCOPE: DOCS_TESTING_RELEASE_CI_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES',
  'PHASE37F_SELECTED_NEXT_PHASE: APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT',
  'PHASE37F_RUNTIME_SCOPE_CONTAMINATION_STATUS: UNSTAGED_RUNTIME_WORK_SEPARATED_FROM_PHASE37F_PACKET',
  'APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_SEED_STATUS: PREPARED_SAFE_LEARNING_CAPSULE_CONTRACT_SEED'
];

const DECISION_TOKEN = 'PHASE37F_LIMITED_RELEASE_DECISION';
const ALLOWED_DECISIONS = [
  'LIMITED_BETA_APPROVED',
  'LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN',
  'LIMITED_BETA_BLOCKED_RUNTIME_SCOPE_CONTAMINATION',
  'LIMITED_BETA_REVIEW_INCONCLUSIVE'
];
const EXPECTED_DECISION = 'LIMITED_BETA_NOT_APPROVED_EVIDENCE_GAPS_REMAIN';

const REVIEW_HEADINGS = [
  '# Phase 37F — Limited Release Evidence Review',
  '## Status tokens',
  '## Scope',
  '## Inputs reviewed',
  '## Root conclusion',
  '## Decision',
  '## Evidence reviewed by area',
  '## Evidence gaps blocking approval',
  '## Stop condition review',
  '## Runtime scope contamination review',
  '## Device Bridge and robot deferral',
  '## No raw quiz or user data',
  '## Release boundary',
  '## Recommended next phase'
];

const SUMMARY_HEADINGS = [
  '# Phase 37F — Limited Release Evidence Review Summary',
  '## Status tokens',
  '## Root conclusion',
  '## Decision status',
  '## Evidence sufficient',
  '## Beta Ready',
  '## Key approval blockers',
  '## Runtime scope contamination',
  '## Device Bridge and robot status',
  '## Files in this phase',
  '## CI validation',
  '## Next recommended phase',
  '## Recommendation'
];

const SEED_HEADINGS = [
  '# APP-H1 — Safe Learning Capsule Contract Seed',
  '## Status token',
  '## Purpose',
  '## Inputs from Phase 37F',
  '## Scope',
  '## Forbidden by default',
  '## Privacy boundary',
  '## Recommended next step'
];

const REQUIRED_GAPS = [
  'No physical-device evidence',
  'Chromium only',
  'No real screen reader',
  'destructive confirmation',
  'malformed, duplicate, edge-length, multilingual, CSV',
  'production-build',
  'Long-session evidence is short',
  'UI modernization evidence is not release-readiness evidence'
];

const REQUIRED_BOUNDARIES = [
  'Beta Ready approved: No',
  'Public production readiness approved: No',
  'Evidence sufficient for limited beta approval: No',
  'Phase 37F does not approve `BETA_READY`',
  'Phase 37F does not approve public production readiness',
  'Phase 37F does not approve runtime implementation',
  'Phase 37F explicitly excludes that work',
  'Future Device Bridge and robot work is deferred to a separate phase',
  'No raw quiz prompts, answers, explanations, imported files, user-authored content, source metadata, study history details, backup payloads, or personally identifying data'
];

const FORBIDDEN_APPROVAL_TEXT = [
  'PHASE37F_LIMITED_RELEASE_DECISION: LIMITED_BETA_APPROVED',
  'Beta Ready approved: Yes',
  'Evidence sufficient for limited beta approval: Yes',
  'Public production readiness approved: Yes'
];

const FORBIDDEN_PACKET_PATTERNS = [
  /^src\//,
  /^tests\//,
  /^e2e\//,
  /^package(?:-lock)?\.json$/,
  /^dist\//,
  /^coverage\//,
  /^test-results\//,
  /^playwright-report\//,
  /^node_modules\//,
  /^firmware\//,
  /^tools\//,
  /\.(?:png|jpe?g|gif|webp|avif|bmp|ico|pdf|zip|gz|tar|mp4|mov|webm)$/i
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function warn(message) {
  console.warn(message);
}

function git(args) {
  return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${label} missing required text: ${needle}`);
  }
}

function assertNotIncludes(label, text, needles) {
  for (const needle of needles) {
    if (text.includes(needle)) fail(`${label} contains forbidden approval text: ${needle}`);
  }
}

function assertDecision(text) {
  const matches = [...text.matchAll(new RegExp(`${DECISION_TOKEN}:\\s*([A-Z0-9_]+)`, 'g'))];
  if (matches.length === 0) fail(`Missing decision token: ${DECISION_TOKEN}`);
  for (const match of matches) {
    if (!ALLOWED_DECISIONS.includes(match[1])) fail(`Unsupported Phase 37F decision: ${match[1]}`);
  }
  if (!matches.some(match => match[1] === EXPECTED_DECISION)) {
    fail(`Phase 37F must preserve expected conservative decision: ${EXPECTED_DECISION}`);
  }
}

function gitLines(args) {
  try {
    return git(args).split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

function localWorktreeFiles() {
  return Array.from(new Set([
    ...gitLines(['diff', '--name-only']),
    ...gitLines(['diff', '--cached', '--name-only']),
    ...gitLines(['ls-files', '--others', '--exclude-standard'])
  ])).sort();
}

function phase37fPacketFiles(files) {
  return files.filter(file => PHASE37F_ALLOWED_FILES.has(file) || /phase37f-limited-release-evidence-review|app-h1-safe-learning-capsule-contract-seed/.test(file));
}

function assertPhase37fPacketScope(files) {
  const packet = phase37fPacketFiles(files);
  const missing = REQUIRED_FILES.filter(file => !fs.existsSync(path.join(ROOT, file)));
  if (missing.length > 0) fail(`Phase 37F packet missing required file(s): ${missing.join(', ')}`);
  for (const file of packet) {
    if (!PHASE37F_ALLOWED_FILES.has(file)) fail(`Unexpected Phase 37F packet file: ${file}`);
    for (const pattern of FORBIDDEN_PACKET_PATTERNS) {
      if (pattern.test(file)) fail(`Forbidden file included in Phase 37F packet: ${file}`);
    }
  }
}

function assertDirtyRuntimeSeparated(files, combinedDocs) {
  const outOfScope = files.filter(file => {
    if (PHASE37F_ALLOWED_FILES.has(file)) return false;
    return FORBIDDEN_PACKET_PATTERNS.some(pattern => pattern.test(file));
  });
  if (outOfScope.length > 0) {
    assertIncludes('runtime scope contamination discussion', combinedDocs, [
      'UNSTAGED_RUNTIME_WORK_SEPARATED_FROM_PHASE37F_PACKET',
      'Phase 37F explicitly excludes that work',
      'Those files are not evidence for limited beta approval'
    ]);
    warn(`Phase 37F validator noticed out-of-scope local work and confirmed it is excluded: ${outOfScope.length} file(s).`);
  }
}

function assertWorkflow(workflow) {
  assertIncludes('workflow', workflow, [
    'actions/checkout@v4',
    'fetch-depth: 0',
    'Validate Phase 37F Limited Release Evidence Review',
    `node ${VALIDATOR_FILE}`,
    '# node scripts/validate-phase37e-manual-readiness-evidence-collection.js'
  ]);
  if (/^\s*git\s+(fetch|pull)\b/m.test(workflow)) fail('workflow must not include shell git fetch/pull steps');
  if (workflow.includes('continue-on-error: true')) fail('workflow must not mark Phase 37F validation continue-on-error');
  const activePhase37Validators = workflow
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.startsWith('node scripts/validate-phase37'));
  if (activePhase37Validators.length !== 1 || activePhase37Validators[0] !== `node ${VALIDATOR_FILE}`) {
    fail(`workflow must run only Phase 37F as the active Phase 37 validator. Found: ${activePhase37Validators.join(', ')}`);
  }
}

function assertDocs(review, summary, seed) {
  const combined = `${review}\n${summary}\n${seed}`;
  assertIncludes('review headings', review, REVIEW_HEADINGS);
  assertIncludes('summary headings', summary, SUMMARY_HEADINGS);
  assertIncludes('seed headings', seed, SEED_HEADINGS);
  assertIncludes('required tokens', combined, REQUIRED_TOKENS);
  assertDecision(combined);
  assertIncludes('evidence gaps', combined, REQUIRED_GAPS);
  assertIncludes('readiness boundaries', combined, REQUIRED_BOUNDARIES);
  assertNotIncludes('Phase 37F docs', combined, FORBIDDEN_APPROVAL_TEXT);
  assertIncludes('next phase', combined, ['APP-H1_SAFE_LEARNING_CAPSULE_CONTRACT']);
}

function main() {
  for (const file of REQUIRED_FILES) read(file);
  const review = read(REVIEW_FILE);
  const summary = read(SUMMARY_FILE);
  const seed = read(NEXT_SEED_FILE);
  const workflow = read(WORKFLOW_FILE);
  const combinedDocs = `${review}\n${summary}\n${seed}`;
  const files = localWorktreeFiles();
  assertPhase37fPacketScope(files);
  assertDirtyRuntimeSeparated(files, combinedDocs);
  assertDocs(review, summary, seed);
  assertWorkflow(workflow);
  console.log('Phase 37F Limited Release Evidence Review validator passed.');
}

main();
