#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const failures = [];
const allowedChanged = new Set([
  // Phase 14B compatibility: allow only the approved internal/test-only
  // FSRS wrapper prototype files and exact ts-fsrs package metadata.
  'package.json',
  'package-lock.json',
  'docs/phase14b-fsrs-wrapper-test-prototype.md',
  'scripts/validate-phase14b-fsrs-wrapper.js',
  'src/quiz/fsrsWrapper.js',
  'tests/unit/fsrsWrapper.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14C compatibility: allow only the approved FSRS persistence
  // backup harness files while preserving older phase guardrails.
  'docs/phase14c-fsrs-persistence-backup-harness.md',
  'scripts/validate-phase14c-fsrs-persistence-harness.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/fsrsPersistenceHarness.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14D compatibility: allow only the approved developer-gated
  // FSRS adapter routing files while preserving older phase guardrails.
  'docs/phase14f-fsrs-experimental-toggle-plan.md',
  'scripts/validate-phase14f-toggle-plan.js',
  'docs/phase14e-fsrs-user-facing-entry-decision.md',
  'scripts/validate-phase14e-fsrs-user-facing-entry.js',
  'docs/phase14d-developer-gated-fsrs-adapter-routing.md',
  'scripts/validate-phase14d-fsrs-adapter-routing.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'tests/unit/reviewSchedulerAdapter.phase14d.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 14A compatibility: allow only the approved scheduler adapter
  // boundary scaffolding files while preserving older phase guardrails.
  'docs/phase14a-scheduler-adapter-boundary.md',
  'scripts/validate-phase14a-scheduler-adapter.js',
  'src/quiz/reviewSchedulerAdapter.js',
  'src/state/reviewScheduleStorage.js',
  'tests/unit/reviewSchedulerAdapter.test.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13D compatibility: allow only the approved FSRS entry
  // decision docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-closure-fsrs-entry-decision.md',
  'docs/phase14-fsrs-implementation-scope.md',
  'docs/phase14-risk-and-validation-plan.md',
  'scripts/validate-phase13-closure.js',
  '.github/workflows/e2e-smoke.yml',

  // Phase 13C compatibility: allow only the approved local adaptive
  // learning roadmap docs/static-validator files while preserving older
  // phase guardrails.
  'docs/phase13-local-adaptive-learning-roadmap.md',
  'docs/phase13-intelligence-layer-boundaries.md',
  'docs/phase13-phase14-plus-roadmap.md',
  'scripts/validate-phase13-local-adaptive-roadmap.js',

  // Phase 13B compatibility: allow only the approved FSRS migration
  // architecture docs/static-validator/CI files while preserving older
  // phase guardrails.
  'docs/phase13-fsrs-migration-architecture.md',
  'docs/phase13-fsrs-data-model-plan.md',
  'docs/phase13-fsrs-risk-register.md',
  'scripts/validate-phase13-fsrs-plan.js',


  // Phase 12J compatibility: allow only the approved closure/release-decision
  // docs/static-validator/CI files while preserving older phase guardrails.
  '.github/workflows/e2e-smoke.yml',

  // Phase 13A compatibility: allow only the approved current review
  // engine audit docs/static-validator/CI files while preserving this
  // historical validator's Phase 11 guardrails.
  'docs/phase13-current-review-engine-audit.md',
  'docs/phase13-review-engine-claim-boundaries.md',
  'scripts/validate-phase13-review-engine-audit.js',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/phase12-closure-release-decision.md',
  'scripts/validate-phase12-closure-release-decision.js',
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
  'scripts/validate-phase12-roadmap-risk-register.js',
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
const friendlySourceFiles = ['src/components/learning/V2BackupRestorePanel.jsx'];

function fail(message) { failures.push(message); }
function read(file) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) {
    fail(`${file} is missing`);
    return '';
  }
  return fs.readFileSync(target, 'utf8');
}
function norm(value) {
  return value.toLowerCase().replace(/[\u2010-\u2015]/g, '-').replace(/\s+/g, ' ');
}
function requireIncludes(file, phrases) {
  const source = norm(read(file));
  for (const phrase of phrases) {
    if (!source.includes(norm(phrase))) fail(`${file} must mention: ${phrase}`);
  }
}
function requireAnyInText(text, phrases, label) {
  const source = norm(text);
  if (!phrases.some((phrase) => source.includes(norm(phrase)))) {
    fail(`Must include one of: ${label || phrases.join(' | ')}`);
  }
}
function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git' || name === 'node_modules' || name === 'dist' || name === 'test-results' || name === 'playwright-report' || name === 'coverage') continue;
    const full = path.join(dir, name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, results);
    else results.push(rel);
  }
  return results;
}
function assertNoUnsupportedPositiveClaims(file) {
  const source = read(file);
  const patterns = [
    { re: /qr transfer implemented\??\s*(yes|pass)/i, label: 'QR transfer implemented' },
    { re: /web share implemented\??\s*(yes|pass)/i, label: 'Web Share implemented' },
    { re: /webrtc(?:\/session)? transfer implemented\??\s*(yes|pass)/i, label: 'WebRTC/session transfer implemented' },
    { re: /cloud(?:\/account)? sync implemented\??\s*(yes|pass)/i, label: 'cloud/account sync implemented' },
    { re: /account sync implemented\??\s*(yes|pass)/i, label: 'account sync implemented' },
    { re: /automatic (?:cross-device )?sync implemented\??\s*(yes|pass)/i, label: 'automatic sync implemented' },
    { re: /encryption implemented\??\s*(yes|pass)/i, label: 'encryption implemented' },
    { re: /release package (?:created|uploaded|published|created\/published)\??\s*(yes|pass)/i, label: 'release package created/uploaded/published' },
    { re: /github release published\??\s*(yes|pass)/i, label: 'GitHub Release published' },
    { re: /release tag created\??\s*(yes|pass)/i, label: 'release tag created' },
    { re: /(?:we|shime|phase 11b|this phase) (?:now )?(?:implemented|added|created) (?:qr transfer|web share|webrtc|cloud sync|account sync|automatic sync|encryption)/i, label: 'unsupported implementation claim' },
  ];
  const safeNegation = /\b(no|not|does not|do not|without|unless|was not|were not|wasn't|is not|isn't)\b/i;
  for (const { re, label } of patterns) {
    for (const match of source.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))) {
      const start = Math.max(0, match.index - 80);
      const context = source.slice(start, match.index + match[0].length + 40);
      if (!safeNegation.test(context)) fail(`${file} appears to make an unsupported positive claim: ${label}`);
    }
  }
}

requireIncludes('RELEASE_QA_V2.md', [
  'Phase 11B',
  'Cross-device Transfer UX Copy + Backup Flow Polish',
  'transfer UX copy',
  'backup/restore',
  'no QR transfer implementation',
  'no WebRTC/session transfer implementation',
  'no Web Share/PWA Share Target implementation',
  'no backend/cloud/account sync',
  'no storage schema change',
  'no package version or dependency changes',
  'validate-cross-device-transfer-ux-copy.js',
]);
requireIncludes('docs/cross-device-transfer-ux-decision.md', ['Phase 11B', 'transfer UX copy polish']);
requireIncludes('docs/cross-device-export-import.md', ['Transfer data', 'Save backup file', 'Restore from backup', 'manual backup/export/import']);
requireAnyInText(read('docs/cross-device-export-import.md'), ['friendly transfer language', 'friendlier transfer language'], 'friendly transfer language');
requireIncludes('README.md', ['Phase 11B', 'manual backup/export/import', 'Save backup file', 'Restore from backup']);

const uiSource = friendlySourceFiles.map(read).join('\n');
for (const phrase of [
  'Transfer data',
  'This device only',
  'Save backup file',
  'Restore from backup',
  'Move my quizzes to this device',
  'Backup files may include quiz content, answers, progress, and study history',
  'does not create automatic cloud sync',
]) {
  if (!uiSource.includes(phrase)) fail(`UI/source must include friendly transfer copy: ${phrase}`);
}
requireAnyInText(uiSource, ['Receive data', 'Receive data from a backup file'], 'Receive data');

requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-cross-device-transfer-ux-copy.js']);

const pkg = JSON.parse(read('package.json'));
const lock = JSON.parse(read('package-lock.json'));
if (pkg.version !== '2.0.0-beta-ai.1') fail(`package.json version changed: expected 2.0.0-beta-ai.1, got ${pkg.version}`);
if (lock.version !== '2.0.0-beta-ai.1') fail(`package-lock.json version changed: expected 2.0.0-beta-ai.1, got ${lock.version}`);
const expectedDeps = {
  dependencies: {
    '@vitejs/plugin-react': 'latest',
    react: 'latest',
    'react-dom': 'latest',
    'react-router-dom': 'latest',
    'ts-fsrs': '5.3.3',
    vite: 'latest',
    zod: '^3.25.76',
  },
  devDependencies: {
    '@playwright/test': '^1.59.1',
    vitest: '^4.1.5',
  },
};
for (const field of ['dependencies', 'devDependencies']) {
  const actual = JSON.stringify(pkg[field] || {}, Object.keys(pkg[field] || {}).sort());
  const expected = JSON.stringify(expectedDeps[field], Object.keys(expectedDeps[field]).sort());
  if (actual !== expected) fail(`package.json ${field} changed unexpectedly`);
}
const lockRoot = lock.packages && lock.packages[''];
if (lockRoot) {
  for (const field of ['dependencies', 'devDependencies']) {
    const actual = JSON.stringify(lockRoot[field] || {}, Object.keys(lockRoot[field] || {}).sort());
    const expected = JSON.stringify(expectedDeps[field], Object.keys(expectedDeps[field]).sort());
    if (actual !== expected) fail(`package-lock.json root ${field} changed unexpectedly`);
  }
}

let trackedFiles = [];
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  trackedFiles = execSync('git ls-files', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
} catch (error) {
  trackedFiles = walk(root);
}
for (const forbiddenPath of ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage']) {
  if (trackedFiles.some((file) => file === forbiddenPath || file.startsWith(`${forbiddenPath}/`))) {
    fail(`generated artifact directory must not be tracked or included: ${forbiddenPath}`);
  }
}
const allFiles = walk(root);
const secretPatterns = [/^\.env$/, /^\.env\.(?!example$).+/, /private.*key/i, /service-account/i, /credentials/i, /\.pem$/i, /\.p12$/i, /\.key$/i];
for (const rel of allFiles) {
  const base = path.basename(rel);
  if (secretPatterns.some((pattern) => pattern.test(base) || pattern.test(rel))) fail(`secret-like/local-only file must not be included: ${rel}`);
}
for (const file of allFiles.filter((f) => f === 'README.md' || f === 'RELEASE_QA_V2.md' || f.startsWith('docs/') || f.startsWith('src/'))) {
  assertNoUnsupportedPositiveClaims(file);
}
for (const rel of allFiles) {
  const lower = rel.toLowerCase();
  if (/(^|\/)(backend|server|api|auth|account|cloud-sync|sync-service)(\/|\.)/.test(lower)) fail(`unexpected backend/cloud/account sync file added: ${rel}`);
  if (/(qr|qrcode|webshare|share-target|webrtc|datachannel|signaling|transfer-code)/i.test(rel) && !rel.startsWith('docs/') && rel !== 'scripts/validate-cross-device-transfer-ux-copy.js') {
    fail(`unexpected QR/WebRTC/WebShare runtime implementation file added: ${rel}`);
  }
}
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const generatedPrefix = /^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/;
  for (const file of [...changed, ...untracked].filter((name) => !generatedPrefix.test(name))) {
    if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 11B scope: ${file}`);
    if ((/^e2e\//.test(file) || /\.spec\.[jt]sx?$|\.test\.[jt]sx?$/.test(file)) && !allowedChanged.has(file)) fail(`E2E spec/test logic changed unexpectedly: ${file}`);
    if (/^(src|app|components|lib)\//.test(file) && !allowedChanged.has(file) && !friendlySourceFiles.includes(file)) fail(`unrelated runtime source file changed unexpectedly: ${file}`);
    if (friendlySourceFiles.includes(file)) {
      // Allowed Phase 11B runtime UI copy-only file.
    } else if (friendlySourceFiles.includes(file)) {
      // Allowed Phase 11B runtime UI copy-only file.
    } else if (/(storage|schema|parser|importValidator|v2BackupRestore|localStorageSync)/i.test(file) && !allowedChanged.has(file)) fail(`storage/import/backup behavior source changed unexpectedly: ${file}`);
  }
} catch (error) {
  // Git metadata is optional in clean release packages.
}

if (failures.length) {
  console.error('Cross-device transfer UX copy validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Cross-device transfer UX copy validation passed.');
