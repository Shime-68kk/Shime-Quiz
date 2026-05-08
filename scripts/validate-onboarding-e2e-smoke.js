#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(ROOT, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath} is missing.`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) failures.push(message || `Missing ${needle}`);
}

function assertMatches(haystack, regex, message) {
  if (!regex.test(haystack)) failures.push(message || `Pattern not found: ${regex}`);
}

function assertNotMatches(haystack, regex, message) {
  if (regex.test(haystack)) failures.push(message || `Forbidden pattern found: ${regex}`);
}

const specPath = 'e2e/onboarding-smoke.spec.js';
const spec = read(specPath);
const pkgText = read('package.json');
const workflow = read('.github/workflows/e2e-smoke.yml');
const packageLockText = read('package-lock.json');
const dashboard = read('src/routes/Dashboard.jsx');
const library = read('src/routes/Library.jsx');

const pkg = pkgText ? JSON.parse(pkgText) : { scripts: {}, dependencies: {}, devDependencies: {} };
const packageLock = packageLockText ? JSON.parse(packageLockText) : { packages: { '': {} } };
const lockRoot = packageLock.packages?.[''] || {};

assertIncludes(spec, "test('Dashboard first-run onboarding", 'onboarding E2E spec must cover Dashboard first-run onboarding.');
assertIncludes(spec, "test('Library onboarding", 'onboarding E2E spec must cover Library empty-state/onboarding.');
assertIncludes(spec, "test('Demo sample quickstart", 'onboarding E2E spec must cover demo sample quickstart safety.');
assertMatches(spec, /Chưa có dữ liệu học tập|first-run onboarding/i, 'spec must assert Dashboard first-run onboarding text.');
assertMatches(spec, /Thư viện của bạn đang trống|Library onboarding/i, 'spec must cover Library empty-state onboarding text.');
assertIncludes(spec, 'Dùng quiz mẫu', 'spec must cover the “Dùng quiz mẫu” quickstart.');
assertMatches(spec, /Xem trước file nạp|preview/i, 'spec must check preview/validation appears.');
assertMatches(spec, /Đánh giá chất lượng bản nháp|quality review/i, 'spec must check quality review appears.');
assertMatches(spec, /Đã import và lưu cục bộ|localStorage|auto-save/i, 'spec must check no auto-save before confirmation.');
assertMatches(spec, /API key|BYOK/i, 'spec must check API key/BYOK UI is absent.');
assertMatches(spec, /EduGen/i, 'spec must ensure EduGen is not required for the demo quickstart.');
assertMatches(spec, /localStorage\.clear\(\)|sessionStorage\.clear\(\)/, 'spec must start from clean browser storage.');
assertNotMatches(spec, /fetch\(|route\(.*EduGen|localhost:3001|VITE_FILE_PROCESSOR_URL/i, 'onboarding E2E must not require EduGen or network setup.');

assertIncludes(pkgText, 'test:e2e:onboarding', 'package.json must include test:e2e:onboarding script.');
assertIncludes(pkg.scripts?.['test:e2e:onboarding'] || '', 'e2e/onboarding-smoke.spec.js', 'test:e2e:onboarding must target the onboarding smoke spec.');
assertIncludes(workflow, 'node scripts/validate-onboarding-e2e-smoke.js', 'CI workflow must run validate-onboarding-e2e-smoke.');
assertIncludes(workflow, 'npm run test:e2e:onboarding', 'CI workflow must run onboarding E2E smoke after Playwright setup.');

[
  'validate-public-positioning-lock',
  'validate-dashboard-first-run-onboarding',
  'validate-library-empty-state-onboarding',
  'validate-demo-quickstart-onboarding',
  'validate-demo-sample-quickstart',
  'validate-visual-asset-guidance',
  'validate-demo-sample-pack',
  'validate-demo-readiness-docs',
  'validate-public-release-docs',
  'validate-release-candidate-status',
  'validate-dashboard-plan-completion-guard',
  'validate-ai-draft-evaluation-fixtures',
  'validate-ai-integration-readiness',
  'validate-ai-output-import-hardening',
  'validate-ai-prompt-export',
  'validate-ai-planning-docs',
  'validate-import-ux-release-readiness',
  'validate-quiz-draft-quality',
  'validate-edugen-document-integration',
  'validate-edugen-pdf-integration',
  'validate-text-file-import',
  'validate-text-quiz-parser',
  'validate-backup-restore-recovery',
  'validate-dashboard-performance',
  'validate-import-validation',
  'validate-storage-sync',
  'validate-weighted-selection',
  'validate-recommendation-feedback',
  'validate-exam-readiness',
  'validate-v2-release-hardening',
  'validate-smoke-fixture'
].forEach(name => assertIncludes(workflow, name, `CI workflow must preserve ${name}.`));

assertIncludes(workflow, 'npx playwright install --with-deps chromium', 'CI workflow must preserve Playwright Chromium install.');
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must preserve existing E2E smoke command.');
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not add broad continue-on-error.');

assertIncludes(dashboard, 'Chưa có dữ liệu học tập', 'Dashboard onboarding implementation must remain present.');
assertIncludes(library, 'Dùng quiz mẫu', 'Library demo quickstart must remain present.');
assertIncludes(library, 'demoSampleQuiz', 'Library quickstart must still reference the local demo sample module.');

const rootVersion = pkg.version;
const lockVersion = lockRoot.version;
if (rootVersion !== lockVersion) failures.push(`package.json version (${rootVersion}) must match package-lock root version (${lockVersion}).`);
const dependencyKinds = ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
for (const kind of dependencyKinds) {
  const pkgDeps = JSON.stringify(pkg[kind] || {});
  const lockDeps = JSON.stringify(lockRoot[kind] || {});
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} changed without matching lock root metadata.`);
}

const runtimeFilesChangedMarker = ['src/routes/Dashboard.jsx', 'src/routes/Library.jsx', 'src/data/'].some(marker => spec.includes(marker));
if (runtimeFilesChangedMarker) {
  failures.push('onboarding E2E spec must not imply runtime source edits are part of this phase.');
}

const publicDocs = [
  'README.md',
  'docs/public-release-notes.md',
  'docs/demo-script.md',
  'RELEASE_QA_V2.md'
].map(read).join('\n');

assertMatches(publicDocs, /Phase 8V|onboarding E2E smoke/i, 'docs must mention Phase 8V onboarding E2E smoke coverage.');

function isGuardedUnsupportedClaimLine(line) {
  return /does not|do not|no |not |without|unsupported|forbidden|không|absence of|avoid claiming|avoid|only if future|future/i.test(line);
}

const forbiddenClaimPatterns = [
  /built-in AI generation/i,
  /AI API integration/i,
  /external AI\/API calls/i,
  /API key support/i,
  /BYOK support/i,
  /OCR support/i,
  /EduGen bundled/i,
  /cloud sync/i,
  /production certified|security certification/i
];

publicDocs.split(/\r?\n/).forEach((line, index) => {
  forbiddenClaimPatterns.forEach(pattern => {
    if (pattern.test(line) && !isGuardedUnsupportedClaimLine(line)) {
      failures.push(`Unsupported claim appears unguarded on public doc line ${index + 1}: ${line.trim()}`);
    }
  });
});

if (failures.length) {
  console.error('validate-onboarding-e2e-smoke failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-onboarding-e2e-smoke passed.');
