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
  'docs/manual-evidence-execution-checklist.md',
  'docs/manual-evidence-results-log.md',
  'docs/manual-evidence-run-pack.md',
  'docs/release-candidate-freeze-final-decision.md',
  'docs/final-main-release-authorization.md',
  'docs/final-release-execution-checklist.md',
  'docs/mobile-ux-smoke.md',
  'docs/edugen-boundary-polish.md',
  'docs/cross-device-export-import.md',
  'docs/screenshot-asset-pack.md',
  'docs/performance-bundle-audit.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
  'scripts/validate-manual-evidence-execution-checklist.js',

  // Phase 12G compatibility: allow only the approved Vitest unit-test foundation
  // package/doc/test/validator changes while preserving existing phase guardrails.
  '.github/workflows/e2e-smoke.yml',
  'README.md',
  'RELEASE_QA_V2.md',
  'docs/deployment-readiness.md',
  'docs/phase12-roadmap-risk-register.md',
  'docs/public-release-notes.md',
  'docs/unit-test-foundation-plan.md',
  'docs/vitest-unit-test-foundation.md',
  'package-lock.json',
  'package.json',
  'scripts/validate-vitest-unit-test-foundation.js',
  'tests/unit/scoring.test.js',
  'tests/unit/storageQuotaEstimate.test.js',
  'tests/unit/weightedSelection.test.js',
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
  'scripts/validate-unit-test-foundation-plan.js',
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
  if (!phrases.some((phrase) => source.includes(norm(phrase)))) {
    fail(`${file} must mention one of: ${label || phrases.join(' | ')}`);
  }
}
function requireLinkOrMention(file) {
  const source = norm(read(file));
  if (!source.includes('manual-evidence-execution-checklist.md') && !source.includes('manual evidence execution checklist') && !source.includes('evidence capture guide')) {
    fail(`${file} must link to or mention the manual evidence execution checklist`);
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

function assertNoForbiddenPositiveClaims(file) {
  const source = read(file);
  const explicitPositiveClaims = [
    { re: /screenshots? captured\??\s*(yes|pass)/i, label: 'screenshots captured' },
    { re: /mobile ux passed\??\s*(yes|pass)/i, label: 'mobile UX passed' },
    { re: /configured edugen import passed\??\s*(yes|pass)/i, label: 'configured EduGen import passed' },
    { re: /cross-device restore passed\??\s*(yes|pass)/i, label: 'cross-device restore passed' },
    { re: /e2e passed\??\s*(yes|pass)/i, label: 'E2E passed' },
    { re: /lighthouse\/core web vitals passed\??\s*(yes|pass)/i, label: 'Lighthouse/Core Web Vitals passed' },
    { re: /final release executed\??\s*(yes|pass)/i, label: 'final release executed' },
    { re: /release package (created|uploaded|published|created\/published)\??\s*(yes|pass)/i, label: 'release package created/uploaded/published' },
    { re: /github release published\??\s*(yes|pass)/i, label: 'GitHub Release published' },
    { re: /release tag created\??\s*(yes|pass)/i, label: 'release tag created' },
    { re: /(production|security|accessibility|performance) certification\??\s*(yes|pass)/i, label: 'certification' },
    { re: /built-in ai generation\??\s*(yes|pass)/i, label: 'built-in AI generation' },
    { re: /ocr\??\s*(yes|pass)/i, label: 'OCR' },
    { re: /backend\/cloud sync\??\s*(yes|pass)/i, label: 'backend/cloud sync' },
  ];
  for (const item of explicitPositiveClaims) {
    if (item.re.test(source)) fail(`${file} appears to make an unsupported positive claim: ${item.label}`);
  }
}

requireIncludes('docs/manual-evidence-execution-checklist.md', [
  'Phase 10T',
  'Manual Evidence Execution Checklist',
  'Evidence Capture Guide',
  'Completed/merged through Phase 10S',
  'Manual evidence results log exists',
  'No manual evidence is executed by this phase',
  'No screenshots are captured by this phase',
  'PASS may only be recorded after actual run evidence exists',
  'docs/manual-evidence-results-log.md',
  'Private user data should not be included',
  'latest validated main',
  'clean working tree',
  'npm ci',
  'npm run build',
  'full static validator chain',
  'screenshot capture guide',
  'Do not create fake/mock screenshots',
  '360x640',
  '375x667',
  '390x844',
  '412x915',
  '768x1024',
  'configured EduGen/File Processor import smoke',
  'browser-reachable processor URL',
  'EduGen/File Processor is not bundled',
  'frontend-only document conversion is not claimed',
  'cross-device backup/restore smoke',
  'clean profile or second device/profile',
  'backup files as private user data',
  'npm run test:e2e:smoke',
  'npm run test:e2e:onboarding',
  'environment-blocked is not product failure',
  'Lighthouse/Core Web Vitals',
  'no certification',
  'Release tag has not been created',
  'GitHub Release has not been published',
  'Release package has not been created',
  'Release package has not been published',
]);
requireAny('docs/manual-evidence-execution-checklist.md', [
  'Release package has not been created or published',
  'Release package has not been created.\n- Release package has not been published',
], 'release package has not been created or published');

requireLinkOrMention('README.md');
requireIncludes('RELEASE_QA_V2.md', ['Phase 10T', 'manual evidence execution checklist', 'Evidence Capture Guide', 'validate-manual-evidence-execution-checklist.js']);

for (const file of [
  'docs/manual-evidence-results-log.md',
  'docs/manual-evidence-run-pack.md',
  'docs/release-candidate-freeze-final-decision.md',
  'docs/final-main-release-authorization.md',
  'docs/final-release-execution-checklist.md',
  'docs/mobile-ux-smoke.md',
  'docs/edugen-boundary-polish.md',
  'docs/cross-device-export-import.md',
  'docs/screenshot-asset-pack.md',
  'docs/performance-bundle-audit.md',
  'docs/public-release-notes.md',
  'docs/deployment-readiness.md',
]) requireLinkOrMention(file);

requireIncludes('.github/workflows/e2e-smoke.yml', ['node scripts/validate-manual-evidence-execution-checklist.js']);

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

const secretPatterns = [/^\.env$/, /^\.env\.(?!example$).+/, /private.*key/i, /service-account/i, /credentials/i, /\.pem$/i, /\.p12$/i, /\.key$/i];
for (const rel of walk(root)) {
  const base = path.basename(rel);
  if (secretPatterns.some((pattern) => pattern.test(base) || pattern.test(rel))) fail(`secret-like/local-only file must not be included: ${rel}`);
}

for (const file of walk(root).filter((f) => f === 'README.md' || f === 'RELEASE_QA_V2.md' || f.startsWith('docs/'))) {
  assertNoForbiddenPositiveClaims(file);
}

try {
  execSync('git rev-parse --is-inside-work-tree', { stdio: 'ignore' });
  const changed = execSync('git diff --name-only HEAD', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' }).split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const generatedPrefix = /^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/;
  for (const file of [...changed, ...untracked].filter((name) => !generatedPrefix.test(name))) {
    if (!allowedChanged.has(file)) fail(`unexpected changed/untracked file outside Phase 10T scope: ${file}`);
    if ((/^(src|app|components|lib|tests|e2e|playwright|public)\//.test(file) || /\.spec\.[jt]sx?$|\.test\.[jt]sx?$/.test(file)) && !allowedChanged.has(file)) {
      fail(`runtime or E2E test logic file changed unexpectedly: ${file}`);
    }
  }
} catch (error) {
  // Git metadata is not required in clean release packages. CI/local repos receive stronger scope checks.
}

if (failures.length) {
  console.error('Manual evidence execution checklist validation failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Manual evidence execution checklist validation passed.');
