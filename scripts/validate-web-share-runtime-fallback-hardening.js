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
  // historical validator's existing scope guardrails.
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
function walk(dir, results = []) {
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir)) {
    if (['.git', 'node_modules', 'dist', 'test-results', 'playwright-report', 'coverage'].includes(name)) continue;
    const full = path.join(dir, name);
    const rel = path.relative(root, full).replace(/\\/g, '/');
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, results);
    else results.push(rel);
  }
  return results;
}
function assertNoForbiddenPositiveClaims(file) {
  const source = read(file);
  const patterns = [
    { re: /(?:can claim )?qr transfer implemented\??\s*yes/i, label: 'QR transfer implemented' },
    { re: /(?:can claim )?webrtc(?:\/session)? transfer implemented\??\s*yes/i, label: 'WebRTC/session transfer implemented' },
    { re: /(?:can claim )?(?:cloud\/account sync|cloud sync|account sync|backend\/cloud\/account sync) implemented\??\s*yes/i, label: 'backend/cloud/account sync implemented' },
    { re: /(?:can claim )?automatic (?:cross-device )?sync implemented\??\s*yes/i, label: 'automatic sync implemented' },
    { re: /(?:can claim )?encryption implemented\??\s*yes/i, label: 'encryption implemented' },
    { re: /(?:can claim )?backup format(?:\/storage schema\/import behavior)? changed\??\s*yes/i, label: 'backup format/storage/import behavior changed' },
    { re: /release (?:package|tag).*created\??\s*yes/i, label: 'release package/tag created' },
    { re: /github release published\??\s*yes/i, label: 'GitHub Release published' },
  ];
  for (const { re, label } of patterns) {
    if (re.test(source)) fail(`${file} appears to make a forbidden positive claim: ${label}`);
  }
}


requireIncludes('RELEASE_QA_V2.md', [
  'Phase 11F',
  'Web Share Runtime QA / Fallback Hardening',
  'unsupported browser fallback guidance',
  'user cancel behavior',
  'share failure behavior',
  'normal backup file download remains fallback',
  'no cloud/automatic sync',
  'no QR/WebRTC',
  'no backup format change',
  'no storage schema change',
  'no import/restore behavior change',
  'validate-web-share-runtime-fallback-hardening.js',
]);

requireIncludes('docs/web-share-runtime-qa-fallback-hardening.md', [
  'Phase 11F',
  'completed/merged through Phase 11E',
  'Web Share runtime prototype exists where supported',
  'normal backup file download remains fallback',
  'Restore from backup remains available',
  'Unsupported browser behavior',
  'navigator.share',
  'navigator.canShare',
  'User cancel behavior',
  'Share failure behavior',
  'backup files may contain private quiz/study data',
  'does not upload backup files to a server',
  'does not create cloud sync',
  'does not create automatic sync',
  'No QR transfer',
  'No WebRTC/session transfer',
  'No backend/cloud/account sync',
  'No encryption implementation',
  'does not change the backup file format, storage schema, or import/restore behavior',
  'browser with Web Share support',
  'browser without Web Share support',
  'canShare false/unsupported path',
]);

const panel = read('src/components/learning/V2BackupRestorePanel.jsx');
for (const phrase of [
  'navigator.share',
  'navigator.canShare',
  'Sao lưu dữ liệu',
  'Đã tạo file sao lưu',
  'Chọn file sao lưu',
  'Chia sẻ file sao lưu',
  'không hỗ trợ',
  'hủy',
  'thất bại',
  'Sao lưu dữ liệu để tải file',
]) {
  if (!panel.includes(phrase)) fail(`V2BackupRestorePanel.jsx must include: ${phrase}`);
}

requireIncludes('README.md', ['Phase 11F', 'Web Share runtime QA / fallback hardening', 'normal backup file download remains the fallback', 'does not create cloud sync or automatic sync']);
for (const file of [
  'docs/web-share-mobile-sharing-prototype-plan.md',
  'docs/backup-transfer-safety-hardening.md',
  'docs/cross-device-export-import.md',
  'docs/deployment-readiness.md',
  'docs/public-release-notes.md',
]) {
  requireIncludes(file, ['Phase 11F', 'Web Share fallback', 'normal backup file download remains fallback']);
}
requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-web-share-runtime-fallback-hardening.js']);

const docs = ['README.md', 'RELEASE_QA_V2.md', 'docs/web-share-runtime-qa-fallback-hardening.md', 'docs/web-share-mobile-sharing-prototype-plan.md', 'docs/backup-transfer-safety-hardening.md', 'docs/cross-device-export-import.md', 'docs/deployment-readiness.md', 'docs/public-release-notes.md'];
for (const file of docs) {
  requireIncludes(file, ['backup files may include', 'no QR', 'no WebRTC', 'no backend/cloud/account sync', 'no automatic sync', 'no encryption']);
}

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
} catch {
  trackedFiles = walk(root);
}
for (const forbiddenPath of ['node_modules', 'dist', 'test-results', 'playwright-report', 'coverage']) {
  if (trackedFiles.some((file) => file === forbiddenPath || file.startsWith(`${forbiddenPath}/`))) fail(`generated artifact directory must not be tracked or included: ${forbiddenPath}`);
}
const allFiles = walk(root);
const secretPatterns = [/^\.env$/, /^\.env\.(?!example$).+/, /private.*key/i, /service-account/i, /credentials/i, /\.pem$/i, /\.p12$/i, /\.key$/i];
for (const rel of allFiles) {
  const base = path.basename(rel);
  if (secretPatterns.some((pattern) => pattern.test(base) || pattern.test(rel))) fail(`secret-like/local-only file must not be included: ${rel}`);
  const lower = rel.toLowerCase();
  if (/(^|\/)(backend|server|api|auth|account|cloud-sync|sync-service)(\/|\.)/.test(lower)) fail(`unexpected backend/cloud/account sync file added: ${rel}`);
  if (/(qr|qrcode|webrtc|datachannel|signaling|transfer-code)/i.test(rel) && !rel.startsWith('docs/') && rel !== 'scripts/validate-web-share-runtime-fallback-hardening.js') fail(`unexpected QR/WebRTC/transfer-code implementation file added: ${rel}`);
}
for (const file of docs) assertNoForbiddenPositiveClaims(file);
assertNoForbiddenPositiveClaims('src/components/learning/V2BackupRestorePanel.jsx');

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const generatedPrefix = /^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/;
  for (const file of [...changed, ...untracked].filter((name) => !generatedPrefix.test(name))) {
    if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 11F scope: ${file}`);
    if ((/^e2e\//.test(file) || /\.spec\.[jt]sx?$|\.test\.[jt]sx?$/.test(file)) && !allowedChanged.has(file)) fail(`E2E spec/test logic changed unexpectedly: ${file}`);
    if (/^src\//.test(file) && !allowedChanged.has(file) && file !== 'src/components/learning/V2BackupRestorePanel.jsx') fail(`unrelated runtime source file changed unexpectedly: ${file}`);
    if ((file === 'package.json' || file === 'package-lock.json') && !allowedChanged.has(file)) fail(`package/dependency file changed unexpectedly: ${file}`);
    if (file !== 'src/components/learning/V2BackupRestorePanel.jsx' && /(storage|schema|parser|importValidator|v2BackupRestore|localStorageSync)/i.test(file) && !allowedChanged.has(file)) fail(`storage/import/backup behavior source changed unexpectedly: ${file}`);
  }
} catch {
  // Git metadata is optional in release ZIPs.
}

if (failures.length) {
  console.error('Web Share runtime fallback hardening validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Web Share runtime fallback hardening validation passed.');
