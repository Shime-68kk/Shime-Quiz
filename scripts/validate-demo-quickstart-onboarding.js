import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta.1';

const fail = (message) => {
  console.error(`validate-demo-quickstart-onboarding: ${message}`);
  process.exit(1);
};

const readRequired = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`);
  return fs.readFileSync(fullPath, 'utf8');
};

const assertIncludes = (content, needle, label) => {
  if (!content.toLowerCase().includes(needle.toLowerCase())) fail(`${label} must include "${needle}"`);
};

const assertMatches = (content, regex, label) => {
  if (!regex.test(content)) fail(label);
};

const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) fail(`package version changed from expected ${expectedVersion}`);
const packageLock = JSON.parse(readRequired('package-lock.json'));
if (packageLock.version !== expectedVersion || packageLock.packages?.['']?.version !== expectedVersion) fail('package-lock version changed unexpectedly');

const libraryRoute = readRequired('src/routes/Library.jsx');
const readme = readRequired('README.md');
const demoScript = readRequired('docs/demo-script.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const workflow = readRequired('.github/workflows/e2e-smoke.yml');
readRequired('src/data/demoSampleQuiz.js');
for (const requiredPath of [
  'docs/demo-samples/README.md',
  'scripts/validate-demo-sample-quickstart.js',
  'scripts/validate-visual-asset-guidance.js',
  'scripts/validate-demo-sample-pack.js'
]) readRequired(requiredPath);

assertMatches(libraryRoute, /Mới dùng Shime\?|Bấm [“"]Dùng quiz mẫu[”"] để thử nhanh quy trình tạo quiz|first-run|onboarding/i, 'Library.jsx must include first-run onboarding hint copy near the demo quickstart');
assertMatches(libraryRoute, /Dùng quiz mẫu/, 'Library.jsx must still include the Dùng quiz mẫu button/copy');
assertMatches(libraryRoute, /\.\.\/data\/demoSampleQuiz\.js/, 'Library demo quickstart must still import the local demo sample module');
assertMatches(libraryRoute, /loadDemoSampleQuickstart/, 'Library demo quickstart handler must still exist');
assertMatches(libraryRoute, /parseLearningDataJson\(JSON\.stringify\(demoSampleQuiz\)\)/, 'demo quickstart must still route through existing JSON import validation');
assertMatches(libraryRoute, /reviewQuizDraftQuality\(/, 'demo quickstart must still route through advisory quality review');
assertMatches(libraryRoute, /setPreview\(/, 'demo quickstart must still create preview instead of direct save');

const cardMatch = libraryRoute.match(/<Card title="Thử nhanh với quiz mẫu"[\s\S]*?<\/Card>/);
if (!cardMatch) fail('Could not isolate the demo sample quickstart card');
const quickstartCard = cardMatch[0];
assertMatches(quickstartCard, /Mới dùng Shime\?|Bấm [“"]Dùng quiz mẫu[”"]/i, 'demo quickstart card must contain onboarding hint copy');
assertMatches(quickstartCard, /xem trước|kiểm tra chất lượng|đánh giá chất lượng|review|preview/i, 'onboarding hint must mention preview/review or quality-review safety');
assertMatches(quickstartCard, /xác nhận trước khi lưu|xác nhận lưu|confirm-save|confirm save/i, 'onboarding hint must mention confirm-save safety');
assertMatches(quickstartCard, /Không dùng AI\/API|không gọi AI\/API|does not call AI\/API/i, 'onboarding hint must state no AI/API calls');
assertMatches(quickstartCard, /không cần EduGen|không dùng EduGen|does not use EduGen/i, 'onboarding hint must state no EduGen requirement');
assertMatches(quickstartCard, /Không tự lưu|không auto-save|does not auto-save/i, 'demo quickstart card must preserve no auto-save wording');

const handlerMatch = libraryRoute.match(/function\s+loadDemoSampleQuickstart\s*\([^)]*\)\s*{([\s\S]*?)\n\s*}\n\n\s*async function handleImportFile/);
if (!handlerMatch) fail('Could not isolate loadDemoSampleQuickstart handler');
const quickstartHandler = handlerMatch[1];
if (/setLearningData\s*\(/.test(quickstartHandler)) fail('demo quickstart handler must not auto-save by calling setLearningData');
if (/resetLearningDataToMock\s*\(|localStorage\.clear|localStorage\.removeItem|localStorage\.setItem/.test(quickstartHandler)) fail('demo quickstart handler must not reset or mutate localStorage directly');
if (/extractSingleFile\s*\(|getFileProcessorBaseUrl\s*\(/.test(quickstartHandler)) fail('demo quickstart handler must not require EduGen');
if (/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(quickstartHandler)) fail('demo quickstart handler must not call a network/API path');

const forbiddenPositiveClaims = [
  { label: 'auto-save claim', pattern: /auto-?saves|tự động lưu|auto save/i },
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation|tạo quiz bằng AI tích hợp/i },
  { label: 'external AI/API calls', pattern: /calls external AI APIs|external AI\/API integration|gọi AI\/API bên ngoài/i },
  { label: 'API key/BYOK support', pattern: /API key support|BYOK support|hỗ trợ API key|hỗ trợ BYOK/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR|hỗ trợ OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime|EduGen được đóng gói/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts|đồng bộ đám mây/i }
];
const guardedContext = /(does not|do not|does shime include|không|khong|no\s+|not supported|unsupported|avoid|forbidden|without|separate|not bundled|manual|only|guardrail|caveat)/i;
for (const [file, content] of [
  ['src/routes/Library.jsx', libraryRoute],
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/public-release-notes.md', publicNotes],
  ['RELEASE_QA_V2.md', releaseQa]
]) {
  content.split(/\r?\n/).forEach((line, index) => {
    for (const claim of forbiddenPositiveClaims) {
      if (claim.pattern.test(line) && !guardedContext.test(line)) {
        fail(`${file}:${index + 1} contains misleading onboarding claim without guarded context: ${claim.label}`);
      }
    }
  });
}

for (const [file, content] of [
  ['README.md', readme],
  ['docs/demo-script.md', demoScript],
  ['docs/public-release-notes.md', publicNotes]
]) {
  assertMatches(content, /first-run|onboarding|hint|Mới dùng Shime|new users|discover/i, `${file} must document the first-run/onboarding hint`);
  assertMatches(content, /does not auto-load|does not auto-save|không tự tải|không tự lưu|no auto-load|no auto-save/i, `${file} must document no auto-load or no auto-save`);
  assertMatches(content, /preview|review|confirm-save|xem trước|kiểm tra chất lượng|xác nhận lưu/i, `${file} must document preview/review/confirm-save safety`);
  assertMatches(content, /does not call AI\/API|không gọi AI\/API|no AI\/API/i, `${file} must document no AI/API calls`);
  assertMatches(content, /does not require EduGen|không cần EduGen|does not use EduGen|không dùng EduGen/i, `${file} must document no EduGen requirement`);
}

assertMatches(releaseQa, /Phase 8P/i, 'RELEASE_QA_V2.md must include Phase 8P');
assertMatches(releaseQa, /no auto-load|does not auto-load/i, 'Phase 8P QA notes must document no auto-load');
assertMatches(releaseQa, /no auto-save|does not auto-save/i, 'Phase 8P QA notes must document no auto-save');
assertMatches(releaseQa, /no storage key|storage schema|schema migration/i, 'Phase 8P QA notes must document no storage schema change');
assertMatches(releaseQa, /validate-demo-quickstart-onboarding\.js/i, 'Phase 8P QA notes must document new validator');

assertIncludes(workflow, 'node scripts/validate-demo-quickstart-onboarding.js', 'CI workflow');
assertIncludes(workflow, 'node scripts/validate-demo-sample-quickstart.js', 'CI workflow');
for (const validator of [
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

const migrationLikeFiles = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', 'coverage', 'test-results', 'playwright-report', '.git'].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    const rel = path.relative(root, full);
    if (entry.isDirectory()) walk(full);
    else if (/migration|schema-version|storage-schema/i.test(rel)) migrationLikeFiles.push(rel);
  }
};
walk(path.join(root, 'src'));
if (migrationLikeFiles.length) fail(`unexpected storage schema/migration-like source files found: ${migrationLikeFiles.join(', ')}`);

console.log(JSON.stringify({
  onboardingHint: true,
  quickstartStillUsesPreview: true,
  migrationLikeFiles: migrationLikeFiles.length
}, null, 2));
console.log('validate-demo-quickstart-onboarding: PASS');
