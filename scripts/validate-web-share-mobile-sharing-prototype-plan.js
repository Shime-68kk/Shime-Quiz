#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const root = process.cwd();
const failures = [];
const allowedChanged = new Set([

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
function requireAny(file, phrases, label) {
  const source = norm(read(file));
  if (!phrases.some((phrase) => source.includes(norm(phrase)))) fail(`${file} must mention one of: ${label || phrases.join(' | ')}`);
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
function assertNoUnsupportedPositiveClaims(file) {
  const source = read(file);
  const patterns = [
    { re: /web share (?:runtime )?(?:implemented|added)\??\s*(yes|pass)/i, label: 'Web Share runtime implemented' },
    { re: /qr transfer (?:implemented|added)\??\s*(yes|pass)/i, label: 'QR transfer implemented' },
    { re: /webrtc(?:\/session)? transfer (?:implemented|added)\??\s*(yes|pass)/i, label: 'WebRTC/session transfer implemented' },
    { re: /(?:backend\/cloud\/account sync|cloud\/account sync|account sync|cloud sync) (?:implemented|added)\??\s*(yes|pass)/i, label: 'backend/cloud/account sync implemented' },
    { re: /automatic (?:cross-device )?sync (?:implemented|added)\??\s*(yes|pass)/i, label: 'automatic sync implemented' },
    { re: /encryption (?:implemented|added)\??\s*(yes|pass)/i, label: 'encryption implemented' },
    { re: /backup format (?:changed|updated)\??\s*(yes|pass)/i, label: 'backup format changed' },
    { re: /storage schema (?:changed|updated)\??\s*(yes|pass)/i, label: 'storage schema changed' },
    { re: /import\/restore behavior (?:changed|updated)\??\s*(yes|pass)/i, label: 'import/restore behavior changed' },
    { re: /release (?:package|tag).*created\??\s*(yes|pass)/i, label: 'release package/tag created' },
    { re: /github release published\??\s*(yes|pass)/i, label: 'GitHub Release published' },
  ];
  const safeNegation = /\b(no|not|does not|do not|without|unless|was not|were not|is not|isn't|doesn't|future|plan|planned|candidate|fallback|forbidden claims|do not claim)\b/i;
  for (const { re, label } of patterns) {
    for (const match of source.matchAll(new RegExp(re.source, `${re.flags.replace('g', '')}g`))) {
      const context = source.slice(Math.max(0, match.index - 90), match.index + match[0].length + 60);
      if (!safeNegation.test(context)) fail(`${file} appears to make an unsupported positive claim: ${label}`);
    }
  }
}

requireIncludes('docs/web-share-mobile-sharing-prototype-plan.md', [
  'Phase 11D',
  'Web Share / Mobile Sharing Prototype Plan',
  'Completed/merged through Phase 11C',
  'current portability remains manual backup/export/import',
  'browser/native share sheet',
  'fallback remains normal backup file download',
  'restore from backup file remains available',
  'backup files may contain quiz content, answers, progress, and study history',
  'Do not upload backup files to a Shime server',
  'No cloud sync claim',
  'No Web Share runtime is implemented in Phase 11D',
  'No QR transfer implemented',
  'No WebRTC/session transfer implemented',
  'No backend/cloud/account sync implemented',
  'No automatic sync implemented',
  'No encryption implemented',
  'change backup file format',
  'change storage schema',
  'change import/restore behavior',
  'change runtime app code',
]);
requireAny('docs/web-share-mobile-sharing-prototype-plan.md', ['Web Share / mobile sharing prototype plan', 'Web Share / Mobile Sharing Prototype Plan'], 'Web Share / mobile sharing prototype plan');
requireIncludes('README.md', ['docs/web-share-mobile-sharing-prototype-plan.md', 'No Web Share runtime was implemented', 'manual backup/export/import']);
requireIncludes('RELEASE_QA_V2.md', ['Phase 11D', 'Web Share / Mobile Sharing Prototype Plan', 'validate-web-share-mobile-sharing-prototype-plan.js']);
requireIncludes('docs/cross-device-transfer-ux-decision.md', ['web-share-mobile-sharing-prototype-plan.md']);
requireIncludes('docs/cross-device-export-import.md', ['web-share-mobile-sharing-prototype-plan.md']);
requireIncludes('docs/backup-transfer-safety-hardening.md', ['web-share-mobile-sharing-prototype-plan.md']);
requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-web-share-mobile-sharing-prototype-plan.js']);

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
try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const generatedPrefix = /^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/;
  for (const file of [...changed, ...untracked].filter((name) => !generatedPrefix.test(name))) {
    if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 11D scope: ${file}`);
    if (/^src\//.test(file) && !allowedChanged.has(file)) fail(`runtime source file changed unexpectedly: ${file}`);
    if ((/^e2e\//.test(file) || /\.spec\.[jt]sx?$|\.test\.[jt]sx?$/.test(file)) && !allowedChanged.has(file)) fail(`E2E spec/test logic changed unexpectedly: ${file}`);
    if ((file === 'package.json' || file === 'package-lock.json') && !allowedChanged.has(file)) fail(`package/dependency file changed unexpectedly: ${file}`);
    if (/(storage|schema|parser|importValidator|v2BackupRestore|localStorageSync|backup|restore|import)/i.test(file) && !allowedChanged.has(file)) {
      fail(`backup/restore/import/storage source behavior changed unexpectedly: ${file}`);
    }
  }
} catch (error) {
  // Git metadata is optional in clean release packages.
}

if (failures.length) {
  console.error('Web Share mobile sharing prototype plan validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('Web Share mobile sharing prototype plan validation passed.');
