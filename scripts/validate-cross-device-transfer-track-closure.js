#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const failures = [];
const allowedChanged = new Set([
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/cross-device-transfer-track-closure.md',
  'docs/cross-device-transfer-ux-decision.md',
  'docs/cross-device-export-import.md',
  'docs/backup-transfer-safety-hardening.md',
  'docs/web-share-mobile-sharing-prototype-plan.md',
  'docs/web-share-runtime-qa-fallback-hardening.md',
  'docs/deployment-readiness.md',
  'docs/public-release-notes.md',
  'scripts/validate-cross-device-transfer-track-closure.js',
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
    { re: /automatic (?:cross-device )?sync implemented\??\s*(?:yes|true|implemented)/i, label: 'automatic sync implemented' },
    { re: /(?:cloud sync|cloud\/account sync|account sync|backend\/cloud\/account sync) implemented\??\s*(?:yes|true|implemented)/i, label: 'cloud/account sync implemented' },
    { re: /qr transfer implemented\??\s*(?:yes|true|implemented)/i, label: 'QR transfer implemented' },
    { re: /transfer[- ]code(?: flow)? implemented\??\s*(?:yes|true|implemented)/i, label: 'transfer code implemented' },
    { re: /webrtc(?:\/session)? transfer implemented\??\s*(?:yes|true|implemented)/i, label: 'WebRTC implemented' },
    { re: /encryption implemented\??\s*(?:yes|true|implemented)/i, label: 'encryption implemented' },
    { re: /99\.99% reliability(?:\s+is)?(?:\s+guaranteed|\s+achieved|\s+certified)/i, label: '99.99% reliability' },
    { re: /production\/security\/privacy certification\??\s*(?:yes|true|certified)/i, label: 'production/security/privacy certification' },
    { re: /release package(?:\/tag\/github release)? (?:created|published)\??\s*(?:yes|true|created|published)/i, label: 'release package/tag/GitHub Release created' },
  ];
  for (const { re, label } of patterns) {
    if (re.test(source)) fail(`${file} appears to make a forbidden positive claim: ${label}`);
  }
}

requireIncludes('docs/cross-device-transfer-track-closure.md', [
  'Phase 11H',
  'Phase 11A',
  'Phase 11B',
  'Phase 11C',
  'Phase 11D',
  'Phase 11E',
  'Phase 11F',
  'local-first/browser-local',
  'save backup files',
  'restore from backup files',
  'Web Share runtime prototype exists where supported',
  'Normal backup file download remains fallback',
  'Web Share support depends on browser/platform',
  'backup files may include private quiz/study data',
  'No QR transfer implemented',
  'No transfer-code flow implemented',
  'No WebRTC/session transfer implemented',
  'No backend/cloud/account sync implemented',
  'No automatic cross-device sync implemented',
  'No encryption implementation',
  'No backup format change',
  'No storage schema change',
  'No import/restore parser behavior change',
  'Release package/tag/GitHub Release remain uncreated/unpublished',
  'Allowed claims after Phase 11H',
  'Forbidden claims after Phase 11H',
  'Remaining limitations',
]);
requireIncludes('RELEASE_QA_V2.md', [
  'Phase 11H',
  'Cross-device Transfer Track Closure / Release Readiness Re-audit',
  'Phase 11A through Phase 11F continuity',
  'allowed claims and forbidden claims',
  'remaining limitations',
  'no runtime app code changed',
  'no package version or dependency change',
  'validate-cross-device-transfer-track-closure.js',
]);
requireIncludes('README.md', ['docs/cross-device-transfer-track-closure.md', 'Phase 11H', 'Web Share runtime prototype exists where supported', 'Normal backup file download remains fallback']);
requireIncludes('docs/public-release-notes.md', ['Phase 11H', 'cross-device transfer track closure', 'Web Share runtime prototype exists where supported', 'normal backup file download remains fallback']);
for (const file of [
  'docs/cross-device-transfer-ux-decision.md',
  'docs/cross-device-export-import.md',
  'docs/backup-transfer-safety-hardening.md',
  'docs/web-share-mobile-sharing-prototype-plan.md',
  'docs/web-share-runtime-qa-fallback-hardening.md',
  'docs/deployment-readiness.md',
]) {
  requireIncludes(file, ['Phase 11H', 'cross-device-transfer-track-closure.md', 'normal backup file download remains fallback']);
}
requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-cross-device-transfer-track-closure.js']);

for (const file of ['scripts/validate-cross-device-transfer-ux-decision.js', 'scripts/validate-cross-device-transfer-ux-copy.js', 'scripts/validate-backup-transfer-safety-hardening.js', 'scripts/validate-web-share-mobile-sharing-prototype-plan.js', 'scripts/validate-web-share-runtime-prototype.js', 'scripts/validate-web-share-runtime-fallback-hardening.js']) {
  if (!fs.existsSync(path.join(root, file))) fail(`${file} must exist for Phase 11 continuity`);
}
for (const file of ['docs/cross-device-transfer-ux-decision.md', 'docs/cross-device-export-import.md', 'docs/backup-transfer-safety-hardening.md', 'docs/web-share-mobile-sharing-prototype-plan.md', 'docs/web-share-runtime-qa-fallback-hardening.md']) {
  if (!fs.existsSync(path.join(root, file))) fail(`${file} must exist for Phase 11 continuity`);
}
const workflow = read('.github/workflows/e2e-smoke.yml');
for (const validator of ['validate-cross-device-transfer-ux-decision.js', 'validate-cross-device-transfer-ux-copy.js', 'validate-backup-transfer-safety-hardening.js', 'validate-web-share-mobile-sharing-prototype-plan.js', 'validate-web-share-runtime-prototype.js', 'validate-web-share-runtime-fallback-hardening.js', 'validate-cross-device-transfer-track-closure.js']) {
  if (!workflow.includes(`node scripts/${validator}`)) fail(`workflow must register ${validator}`);
}
const panel = read('src/components/learning/V2BackupRestorePanel.jsx');
for (const phrase of ['navigator.share', 'navigator.canShare', 'Sao lưu dữ liệu', 'Đã tạo file sao lưu', 'Chọn file sao lưu']) {
  if (!panel.includes(phrase)) fail(`V2BackupRestorePanel.jsx must preserve: ${phrase}`);
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
    vite: 'latest',
    zod: '^3.25.76',
  },
  devDependencies: {
    '@playwright/test': '^1.59.1',
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
for (const rel of walk(root)) {
  const base = path.basename(rel);
  if (/^\.env$/.test(base) || /^\.env\.(?!example$).+/.test(base) || /private.*key/i.test(rel) || /service-account/i.test(rel) || /credentials/i.test(rel) || /\.(pem|p12|key)$/i.test(rel)) fail(`secret-like/local-only file must not be included: ${rel}`);
}

for (const file of ['README.md', 'RELEASE_QA_V2.md', 'docs/cross-device-transfer-track-closure.md', 'docs/public-release-notes.md']) assertNoForbiddenPositiveClaims(file);

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const generatedPrefix = /^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/;
  for (const file of [...changed, ...untracked].filter((name) => !generatedPrefix.test(name))) {
    if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 11H scope: ${file}`);
    if (/^src\//.test(file)) fail(`runtime source file changed unexpectedly: ${file}`);
    if (/^e2e\//.test(file) || /\.spec\.[jt]sx?$|\.test\.[jt]sx?$/.test(file)) fail(`E2E spec/test logic changed unexpectedly: ${file}`);
    if (file === 'package.json' || file === 'package-lock.json') fail(`package/dependency file changed unexpectedly: ${file}`);
  }
  const srcDiff = execSync('git diff --name-only HEAD -- src e2e package.json package-lock.json', { encoding: 'utf8' }).trim();
  if (srcDiff) fail(`Phase 11H must not change runtime/e2e/package files: ${srcDiff}`);
} catch {
  // Git metadata is optional in release ZIPs.
}

if (failures.length) {
  console.error('Cross-device transfer track closure validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Cross-device transfer track closure validation passed.');
