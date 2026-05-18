import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta.1';
const fail = (message) => { console.error(`validate-dashboard-first-run-onboarding: ${message}`); process.exit(1); };
const readRequired = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`);
  return fs.readFileSync(fullPath, 'utf8');
};
const assertIncludes = (content, needle, label) => {
  if (!content.toLowerCase().includes(needle.toLowerCase())) fail(`${label} must include "${needle}"`);
};
const assertMatches = (content, regex, label) => { if (!regex.test(content)) fail(label); };

const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) fail(`package version changed from expected ${expectedVersion}`);
const packageLock = JSON.parse(readRequired('package-lock.json'));
if (packageLock.version !== expectedVersion || packageLock.packages?.['']?.version !== expectedVersion) fail('package-lock version changed unexpectedly');

const dashboard = readRequired('src/routes/Dashboard.jsx');
const libraryRoute = readRequired('src/routes/Library.jsx');
const readme = readRequired('README.md');
const demoScript = readRequired('docs/demo-script.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const workflow = readRequired('.github/workflows/e2e-smoke.yml');

for (const requiredPath of [
  'scripts/validate-library-empty-state-onboarding.js',
  'scripts/validate-demo-quickstart-onboarding.js',
  'scripts/validate-demo-sample-quickstart.js',
  'src/data/demoSampleQuiz.js'
]) readRequired(requiredPath);

assertMatches(dashboard, /Chưa có dữ liệu học tập|first-run|empty-data|isFirstRunEmptyState/i, 'Dashboard source must include first-run empty-state onboarding copy or equivalent');
assertMatches(dashboard, /isFirstRunEmptyState\s*=|dataSource\.sourceType\s*===\s*['"]mock['"]/i, 'Dashboard callout must be gated by an empty-data condition');
assertMatches(dashboard, /isFirstRunEmptyState\s*\?\s*\(/, 'Dashboard callout should not be always shown');
assertMatches(dashboard, /Thư viện|\/library|Mở Thư viện/i, 'Dashboard callout must point users to Library');
assertMatches(dashboard, /Dùng quiz mẫu|quiz mẫu/i, 'Dashboard callout must point to demo sample quickstart');
assertMatches(dashboard, /JSON\/CSV|import JSON\/CSV|Nạp JSON\/CSV/i, 'Dashboard callout must point to JSON/CSV import');
assertMatches(dashboard, /text\/Markdown|văn bản\/Markdown|dán nội dung text\/Markdown/i, 'Dashboard callout must point to text/Markdown paste/import');
assertMatches(dashboard, /AI trong Shime.*thủ công|manual AI|copy\/paste|copy-paste|Shime không gọi AI\/API/i, 'Dashboard callout must describe AI workflow as manual-only');
assertMatches(dashboard, /EduGen chạy riêng|EduGen.*được cấu hình|separate.*EduGen|separately configured EduGen/i, 'Dashboard callout must describe EduGen as separate/configured for document import');
assertMatches(dashboard, /xem trước|kiểm tra chất lượng|xác nhận trước khi lưu|preview|review|confirm-save/i, 'Dashboard callout must preserve preview/review/confirm-save wording');
assertMatches(dashboard, /không tự nạp|không auto-load|does not auto-load|Không auto-load/i, 'Dashboard callout must state no auto-load');
assertMatches(dashboard, /không tự lưu|không auto-save|does not auto-save|Không auto-save/i, 'Dashboard callout must state no auto-save');
assertMatches(dashboard, /navigate\(['"]\/library['"]\)/, 'Dashboard callout should use the existing router navigation pattern to Library');
if (/setLearningData\s*\(|resetLearningDataToMock\s*\(|localStorage\.clear|localStorage\.removeItem|localStorage\.setItem|demoSampleQuiz/.test(dashboard)) {
  fail('Dashboard first-run onboarding must not load/save/reset storage or import the demo sample directly');
}

assertMatches(libraryRoute, /Dùng quiz mẫu/, 'Library Dùng quiz mẫu quickstart must still exist');
assertMatches(libraryRoute, /Thư viện của bạn đang trống/, 'Library empty-state onboarding must remain intact');
assertMatches(libraryRoute, /\.\.\/data\/demoSampleQuiz\.js/, 'Library quickstart must still reference the local demo sample module');
assertMatches(libraryRoute, /parseLearningDataJson\(JSON\.stringify\(demoSampleQuiz\)\)/, 'Library quickstart must still route through import validation');
assertMatches(libraryRoute, /reviewQuizDraftQuality\(/, 'Library quickstart must still route through quality review');
assertMatches(libraryRoute, /setPreview\(/, 'Library quickstart must still create preview');
const handlerMatch = libraryRoute.match(/function\s+loadDemoSampleQuickstart\s*\([^)]*\)\s*{([\s\S]*?)\n\s*}\n\n\s*async function handleImportFile/);
if (!handlerMatch) fail('Could not isolate loadDemoSampleQuickstart handler');
const quickstartHandler = handlerMatch[1];
if (/setLearningData\s*\(|resetLearningDataToMock\s*\(|localStorage\.clear|localStorage\.removeItem|localStorage\.setItem|fetch\s*\(|XMLHttpRequest|extractSingleFile\s*\(/.test(quickstartHandler)) {
  fail('Library quickstart must not auto-save, reset storage, call network/API, or require EduGen');
}

for (const [file, content] of [
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/public-release-notes.md', publicNotes]
]) {
  assertMatches(content, /Dashboard.*first-run|Dashboard.*getting-started|Dashboard.*callout|Dashboard.*hint|Dashboard.*empty/i, `${file} must document Dashboard first-run onboarding`);
  assertMatches(content, /Library|Thư viện/i, `${file} must point to Library as the safe start location`);
  assertMatches(content, /demo sample|quiz mẫu|Dùng quiz mẫu/i, `${file} must mention demo sample quickstart`);
  assertMatches(content, /JSON\/CSV/i, `${file} must mention JSON/CSV import`);
  assertMatches(content, /text\/Markdown|văn bản\/Markdown/i, `${file} must mention text/Markdown import`);
  assertMatches(content, /manual AI|AI.*manual|copy-paste|copy\/paste|thủ công/i, `${file} must mention manual AI copy/paste workflow`);
  assertMatches(content, /EduGen.*separate|separate EduGen|EduGen.*riêng|separately configured EduGen/i, `${file} must mention separately configured EduGen`);
  assertMatches(content, /does not auto-load|does not auto-save|không tự nạp|không tự lưu|no auto-load|no auto-save/i, `${file} must document no auto-load/no auto-save`);
  assertMatches(content, /preview|review|confirm-save|xem trước|kiểm tra chất lượng|xác nhận/i, `${file} must document preview/review/confirm-save safety`);
}
assertMatches(releaseQa, /Phase 8S/i, 'RELEASE_QA_V2.md must include Phase 8S');
assertMatches(releaseQa, /Dashboard first-run|Dashboard.*empty-state|first-run callout/i, 'Phase 8S QA notes must document Dashboard first-run onboarding');
assertMatches(releaseQa, /no auto-load|does not auto-load|không tự nạp/i, 'Phase 8S QA notes must document no auto-load');
assertMatches(releaseQa, /no auto-save|does not auto-save|không tự lưu/i, 'Phase 8S QA notes must document no auto-save');
assertMatches(releaseQa, /storage schema|schema migration|storage\/backup schema/i, 'Phase 8S QA notes must document no storage schema change');
assertMatches(releaseQa, /scoring\/SRT\/mastery|SRT\/mastery|scoring/i, 'Phase 8S QA notes must document no scoring/SRT/mastery change');
assertMatches(releaseQa, /validate-dashboard-first-run-onboarding\.js/i, 'Phase 8S QA notes must document new validator');

for (const validator of [
  'node scripts/validate-dashboard-first-run-onboarding.js',
  'node scripts/validate-library-empty-state-onboarding.js',
  'node scripts/validate-demo-quickstart-onboarding.js',
  'node scripts/validate-demo-sample-quickstart.js',
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
]) assertIncludes(workflow, validator, 'CI workflow');

const guardedContext = /(unsupported|not supported|do not claim|do not say|do not imply|avoid|does not|do not|no\s+|not a|not provide|without|is not bundled|not bundled|separate|separately|requires|manual|only|guardrail|caveat|không|khong|forbidden|boundary|does shime include)/i;
const misleadingClaims = [
  { label: 'auto-load claim', pattern: /auto-?loads|tự động nạp|tự nạp mẫu/i },
  { label: 'auto-save claim', pattern: /auto-?saves|tự động lưu|auto save/i },
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation|tạo quiz bằng AI tích hợp/i },
  { label: 'external AI/API call', pattern: /calls external AI APIs|external AI\/API integration|Shime calls external AI APIs|gọi AI\/API bên ngoài/i },
  { label: 'API key/BYOK support', pattern: /API key support|BYOK support|hỗ trợ API key|hỗ trợ BYOK/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR|hỗ trợ OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime|EduGen được đóng gói/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts|đồng bộ đám mây/i },
  { label: 'production certified', pattern: /production certified|production-certified|security certification|security certified/i }
];
for (const [file, content] of [
  ['src/routes/Dashboard.jsx', dashboard],
  ['src/routes/Library.jsx', libraryRoute],
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/public-release-notes.md', publicNotes],
  ['RELEASE_QA_V2.md', releaseQa]
]) {
  content.split(/\r?\n/).forEach((line, index) => {
    for (const claim of misleadingClaims) {
      if (claim.pattern.test(line) && !guardedContext.test(line)) fail(`${file}:${index + 1} contains misleading claim without guarded context: ${claim.label}`);
    }
  });
}

const migrationLikeFiles = [];
const walk = (dir) => {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else {
      const rel = path.relative(root, full);
      if (/migration|schema-migration|storage-schema/i.test(rel)) migrationLikeFiles.push(rel);
    }
  }
};
walk(path.join(root, 'src'));
if (migrationLikeFiles.length) fail(`unexpected storage schema/migration-like source files found: ${migrationLikeFiles.join(', ')}`);

console.log(JSON.stringify({ dashboardFirstRunOnboarding: true, libraryQuickstartPreserved: true, migrationLikeFiles: 0 }, null, 2));
console.log('validate-dashboard-first-run-onboarding: PASS');
