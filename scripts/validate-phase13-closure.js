#!/usr/bin/env node
import fs from 'node:fs';
import { execSync } from 'node:child_process';

const requiredFiles = [
  'docs/phase13-closure-fsrs-entry-decision.md',
  'docs/phase14-fsrs-implementation-scope.md',
  'docs/phase14-risk-and-validation-plan.md',
  'scripts/validate-phase13-closure.js',
];

const coreAllowedChangedFiles = new Set([
  ...requiredFiles,
  '.github/workflows/e2e-smoke.yml',
]);

const historicalValidatorCompatibilityFiles = new Set([
  'scripts/validate-backup-transfer-safety-hardening.js',
  'scripts/validate-cross-device-export-import.js',
  'scripts/validate-cross-device-transfer-track-closure.js',
  'scripts/validate-cross-device-transfer-ux-copy.js',
  'scripts/validate-cross-device-transfer-ux-decision.js',
  'scripts/validate-dashboard-today-card-runtime.js',
  'scripts/validate-dashboard-today-card-ux-plan.js',
  'scripts/validate-edugen-boundary-polish.js',
  'scripts/validate-final-main-release-authorization.js',
  'scripts/validate-final-public-release-readiness-reaudit.js',
  'scripts/validate-final-release-execution-checklist.js',
  'scripts/validate-github-release-publication-plan.js',
  'scripts/validate-manual-evidence-execution-checklist.js',
  'scripts/validate-manual-evidence-results-log.js',
  'scripts/validate-manual-evidence-run-pack.js',
  'scripts/validate-phase12-closure-release-decision.js',
  'scripts/validate-phase12-roadmap-risk-register.js',
  'scripts/validate-phase13-fsrs-plan.js',
  'scripts/validate-phase13-local-adaptive-roadmap.js',
  'scripts/validate-phase13-review-engine-audit.js',
  'scripts/validate-release-candidate-freeze-final-decision.js',
  'scripts/validate-release-candidate-tag-publish-gate.js',
  'scripts/validate-release-package-assembly-plan.js',
  'scripts/validate-release-tag-creation-plan.js',
  'scripts/validate-storage-capacity-indexeddb-migration-plan.js',
  'scripts/validate-storage-quota-warning-runtime.js',
  'scripts/validate-study-flow-micro-feedback-plan.js',
  'scripts/validate-study-flow-micro-feedback-runtime.js',
  'scripts/validate-unit-test-foundation-plan.js',
  'scripts/validate-vitest-unit-test-foundation.js',
  'scripts/validate-web-share-mobile-sharing-prototype-plan.js',
  'scripts/validate-web-share-runtime-fallback-hardening.js',
  'scripts/validate-web-share-runtime-prototype.js',
]);

const forbiddenChangedFiles = new Set([
  'package.json',
  'package-lock.json',
  'vite.config.js',
  'vite.config.mjs',
  'playwright.config.js',
]);

const forbiddenChangedPrefixes = ['src/', 'e2e/', 'tests/'];
const generatedArtifacts = [
  'node_modules',
  'dist',
  'test-results',
  'playwright-report',
  'coverage',
  'FETCH_HEAD',
  '.env',
  '.env.local',
  '.git',
];
const registryTerms = ['applied-caas', 'artifactory', 'internal.api.openai', 'packages.applied'];

function fail(message) {
  console.error(`Phase 13D closure validation failed: ${message}`);
  process.exit(1);
}

function warn(message) {
  console.warn(`Phase 13D closure validation warning: ${message}`);
}

function read(file) {
  if (!fs.existsSync(file)) fail(`Missing required file: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function normalize(text) {
  return String(text)
    .toLowerCase()
    .replace(/[`*_()[\]{}:;,.!?"']/g, ' ')
    .replace(/[\/\\]+/g, ' ')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function runGit(command, options = {}) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...options }).trim();
  } catch {
    if (!options.silent) warn(`Git command failed; changed-file scope checking may be limited: ${command}`);
    return '';
  }
}

function splitLines(output) {
  return output ? output.split(/\r?\n/).map(line => line.trim()).filter(Boolean) : [];
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b));
}

function changedFilesFromPullRequestBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (!baseRef) return [];
  runGit(`git fetch --no-tags --depth=1 origin ${baseRef}`, { silent: true });
  const mergeBase = runGit(`git merge-base HEAD origin/${baseRef}`, { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromBranchBase() {
  const originMain = runGit('git rev-parse --verify origin/main', { silent: true });
  if (!originMain) return [];
  const mergeBase = runGit('git merge-base HEAD origin/main', { silent: true });
  if (!mergeBase) return [];
  return splitLines(runGit(`git diff --name-only ${mergeBase} HEAD`, { silent: true }));
}

function changedFilesFromLocalFallbacks({ includeUntracked = true } = {}) {
  const files = [
    ...splitLines(runGit('git diff --name-only HEAD', { silent: true })),
    ...splitLines(runGit('git diff --cached --name-only', { silent: true })),
  ];
  if (includeUntracked) files.push(...splitLines(runGit('git ls-files --others --exclude-standard', { silent: true })));
  return files;
}

function changedFiles({ includeUntracked = true } = {}) {
  const prBaseFiles = changedFilesFromPullRequestBase();
  if (prBaseFiles.length > 0) return uniqueSorted(prBaseFiles);
  return uniqueSorted([
    ...changedFilesFromBranchBase(),
    ...changedFilesFromLocalFallbacks({ includeUntracked }),
  ]);
}

function trackedFiles() {
  return uniqueSorted(splitLines(runGit('git ls-files', { silent: true })));
}

function requireIncludes(file, terms) {
  const text = normalize(read(file));
  for (const term of terms) {
    if (!text.includes(normalize(term))) fail(`${file} must mention: ${term}`);
  }
}

function requireAny(file, label, terms) {
  const text = normalize(read(file));
  if (!terms.some(term => text.includes(normalize(term)))) {
    fail(`${file} must mention ${label}; accepted wording: ${terms.join(' | ')}`);
  }
}

function closureDecisionGuard() {
  requireIncludes('docs/phase13-closure-fsrs-entry-decision.md', [
    'Phase 13D',
    'docs/static-validator/CI-only',
    'FSRS entry decision',
    'Phase 14A',
    'adapter boundary',
    'opt-in',
    'new-card',
    'rollback',
    'backup/export/import',
    'local-first',
    'not implemented',
    'no runtime implementation',
    'current scheduler',
    'difficulty',
    'stability',
    'retrievability',
    'Again',
    'Hard',
    'Good',
    'Easy',
    'easeFactor to FSRS difficulty mapping is unreliable',
  ]);
  requireAny('docs/phase13-closure-fsrs-entry-decision.md', 'ts-fsrs not added or not installed', [
    'no ts-fsrs dependency',
    'does not add a ts-fsrs',
    'ts-fsrs is not installed',
    'ts-fsrs remains a research reference',
  ]);
  requireAny('docs/phase13-closure-fsrs-entry-decision.md', 'scheduler versioning', [
    'schedulerVersion',
    'schedulerKind',
  ]);
}

function implementationScopeGuard() {
  requireIncludes('docs/phase14-fsrs-implementation-scope.md', [
    'Phase 14A',
    'Phase 14B',
    'Phase 14C',
    'Phase 14D',
    'Phase 14E',
    'Phase 14F',
    'current scheduler',
    'versioned model scaffolding',
    'normalized due summary',
    'schemaVersion: v2-review-schedule-v1',
    'Again',
    'Hard',
    'Good',
    'Easy',
    'New',
    'Learning',
    'Review',
    'Relearning',
    'difficulty',
    'stability',
    'retrievability',
    'scheduleReview',
    'getDueStatus',
    'getDueSummary',
    'rollback',
  ]);
  requireAny('docs/phase14-fsrs-implementation-scope.md', 'schedulerKind or schedulerVersion', [
    'schedulerKind',
    'schedulerVersion',
  ]);
}

function riskAndValidationGuard() {
  requireIncludes('docs/phase14-risk-and-validation-plan.md', [
    'data corruption',
    'due schedule',
    'migration',
    'review logs',
    'four-rating',
    'Study Room',
    'Dashboard',
    'weighted practice',
    'backup',
    'rollback',
    'localStorage',
    'ts-fsrs',
    'overclaim',
    'local-first',
    'GitHub Actions',
    'E2E',
    'claim gate',
    'no hidden upload',
    'Phase Owner',
  ]);
}

function lineIsSafe(line) {
  const safeMarkers = [
    'not implemented',
    'not installed',
    'not added',
    'not publicly claim',
    'not claim',
    'no runtime',
    'no runtime implementation',
    'no dependency',
    'no dependencies',
    'no ts-fsrs dependency',
    'no public claim',
    'future',
    'planned',
    'proposal',
    'roadmap',
    'research',
    'architecture',
    'planning artifact',
    'planning language only',
    'requires phase 14',
    'requires later phase',
    'after phase 14',
    'later phase',
    'only after',
    'must not claim',
    'forbidden',
    'unsafe',
    'unless',
    'does not',
    'do not',
    'must not',
    'before runtime implementation',
    'before claiming',
    'is not',
    'are not',
    'was not',
    'cannot be',
    'none are implemented',
  ];
  const normalizedLine = normalize(line);
  return safeMarkers.some(marker => normalizedLine.includes(normalize(marker)));
}

function claimGuard() {
  const claimFiles = [
    'docs/phase13-closure-fsrs-entry-decision.md',
    'docs/phase14-fsrs-implementation-scope.md',
    'docs/phase14-risk-and-validation-plan.md',
  ];
  const unsafeClaims = [
    'FSRS implemented',
    'FSRS is implemented',
    'FSRS runtime is available',
    'ts-fsrs installed',
    'Glicko-2 implemented',
    'Glicko-2 is implemented',
    'IRT implemented',
    'IRT is implemented',
    'Transformers.js implemented',
    'Transformers.js is implemented',
    'semantic search implemented',
    'semantic search is implemented',
    'PowerSync implemented',
    'PowerSync is implemented',
    'ElectricSQL implemented',
    'ElectricSQL is implemented',
    'automatic sync implemented',
    'automatic sync is implemented',
    'cloud sync implemented',
    'cloud sync is implemented',
    'IndexedDB migration implemented',
    'IndexedDB runtime migration is implemented',
    'built-in AI implemented',
    'built-in AI is implemented',
    'external AI/API implemented',
    'external AI/API is implemented',
    'OCR implemented',
    'OCR is implemented',
    'production certified',
    'security certified',
    'accessibility certified',
    'performance certified',
  ];

  for (const file of claimFiles) {
    const lines = read(file).split(/\r?\n/);
    let inClaimBoundarySection = false;
    for (const [index, line] of lines.entries()) {
      if (/^##\s+/.test(line)) inClaimBoundarySection = false;
      const normalizedLine = normalize(line);
      if (
        (normalizedLine.includes('forbidden') && normalizedLine.includes('claim')) ||
        normalizedLine.includes('public claim boundary') ||
        normalizedLine.includes('claim gate')
      ) {
        inClaimBoundarySection = true;
      }
      for (const claim of unsafeClaims) {
        if (normalizedLine.includes(normalize(claim)) && !inClaimBoundarySection && !lineIsSafe(line)) {
          fail(`Unsupported implementation claim in ${file}:${index + 1}: ${line.trim()}`);
        }
      }
    }
  }
}

function scopeGuard() {
  const changed = changedFiles();
  const allowedChangedFiles = new Set([...coreAllowedChangedFiles, ...historicalValidatorCompatibilityFiles]);
  for (const file of changed) {
    if (generatedArtifacts.some(artifact => file === artifact || file.startsWith(`${artifact}/`))) {
      continue;
    }
    if (forbiddenChangedFiles.has(file)) fail(`Forbidden file changed: ${file}`);
    if (forbiddenChangedPrefixes.some(prefix => file.startsWith(prefix))) fail(`Forbidden runtime/test path changed: ${file}`);
    if (allowedChangedFiles.has(file)) continue;
    if (file.startsWith('scripts/validate-')) {
      fail(`Unexpected validator changed without exact Phase 13D compatibility allowlist: ${file}`);
    }
    fail(`Unexpected changed file for Phase 13D scope: ${file}`);
  }
}

function generatedArtifactGuard() {
  const files = uniqueSorted([...changedFiles({ includeUntracked: false }), ...trackedFiles()]);
  for (const artifact of generatedArtifacts) {
    if (files.some(file => file === artifact || file.startsWith(`${artifact}/`))) {
      fail(`Generated artifact appears in changed or tracked files: ${artifact}`);
    }
  }
}

function packageRegistryGuard() {
  for (const file of ['package.json', 'package-lock.json']) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, 'utf8');
    for (const term of registryTerms) {
      if (text.includes(term)) fail(`${file} contains internal registry term: ${term}`);
    }
  }
}

function workflowGuard() {
  const workflow = '.github/workflows/e2e-smoke.yml';
  if (!fs.existsSync(workflow)) fail(`Workflow file missing: ${workflow}`);
  const text = fs.readFileSync(workflow, 'utf8');
  if (!text.includes('node scripts/validate-phase13-closure.js')) {
    fail('Workflow must run Phase 13D closure validator: node scripts/validate-phase13-closure.js');
  }
  if (/continue-on-error:\s*true/i.test(text)) {
    fail('Workflow must not add broad continue-on-error: true.');
  }
}

function validate() {
  for (const file of requiredFiles) read(file);
  closureDecisionGuard();
  implementationScopeGuard();
  riskAndValidationGuard();
  claimGuard();
  scopeGuard();
  generatedArtifactGuard();
  packageRegistryGuard();
  workflowGuard();
  console.log('Phase 13D closure validation passed.');
}

validate();
