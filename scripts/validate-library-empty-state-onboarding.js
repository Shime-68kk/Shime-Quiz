import fs from 'fs';
import path from 'path';
const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';
const fail = (message) => { console.error(`validate-library-empty-state-onboarding: ${message}`); process.exit(1); };
const readRequired = (relativePath) => { const fullPath = path.join(root, relativePath); if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`); return fs.readFileSync(fullPath, 'utf8'); };
const assertIncludes = (content, needle, label) => { if (!content.toLowerCase().includes(needle.toLowerCase())) fail(`${label} must include "${needle}"`); };
const assertMatches = (content, regex, label) => { if (!regex.test(content)) fail(label); };
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
for (const requiredPath of ['src/data/demoSampleQuiz.js','scripts/validate-demo-sample-quickstart.js','scripts/validate-demo-quickstart-onboarding.js','scripts/validate-visual-asset-guidance.js','scripts/validate-demo-sample-pack.js','docs/demo-samples/README.md']) readRequired(requiredPath);
assertMatches(libraryRoute, /Thư viện của bạn đang trống|Library has no saved quiz items|empty-state|libraryEmptyOnboardingCard/i, 'Library.jsx must include empty-state onboarding copy');
assertMatches(libraryRoute, /subjectCards\.length\s*===\s*0[\s\S]*Thư viện của bạn đang trống|summary\.itemCount\s*===\s*0[\s\S]*Thư viện của bạn đang trống/i, 'empty-state onboarding must be gated to an empty library state');
assertMatches(libraryRoute, /Bắt đầu nhanh bằng quiz mẫu|Dùng quiz mẫu/i, 'empty-state copy must point to the demo sample quickstart');
assertMatches(libraryRoute, /JSON\/CSV|Nạp JSON\/CSV|import JSON\/CSV/i, 'empty-state copy must point to JSON/CSV import');
assertMatches(libraryRoute, /text\/Markdown|văn bản\/Markdown|dán nội dung text\/Markdown/i, 'empty-state copy must point to text/Markdown paste or import');
assertMatches(libraryRoute, /AI trong Shime hiện là quy trình thủ công|manual AI|copy sang công cụ bên ngoài|copy-paste/i, 'empty-state copy must describe AI workflow as manual-only');
assertMatches(libraryRoute, /EduGen chạy riêng|separate EduGen|được cấu hình|configured/i, 'empty-state copy must describe EduGen as separate/configured for document import');
assertMatches(libraryRoute, /xem trước|kiểm tra chất lượng|xác nhận trước khi lưu|confirm-save|review/i, 'empty-state copy must preserve preview/review/confirm-save wording');
assertMatches(libraryRoute, /không tự nạp|does not auto-load|không auto-load|not auto-load/i, 'empty-state copy must state no auto-load or equivalent');
assertMatches(libraryRoute, /không tự lưu|does not auto-save|không auto-save|not auto-save/i, 'empty-state copy must state no auto-save or equivalent');
assertMatches(libraryRoute, /Dùng quiz mẫu/, 'Dùng quiz mẫu quickstart must still exist');
assertMatches(libraryRoute, /\.\.\/data\/demoSampleQuiz\.js/, 'Library quickstart must still import the local demo sample module');
assertMatches(libraryRoute, /loadDemoSampleQuickstart/, 'Library quickstart handler must still exist');
assertMatches(libraryRoute, /parseLearningDataJson\(JSON\.stringify\(demoSampleQuiz\)\)/, 'demo quickstart must still route through existing JSON import validation');
assertMatches(libraryRoute, /reviewQuizDraftQuality\(/, 'demo quickstart must still route through advisory quality review');
assertMatches(libraryRoute, /setPreview\(/, 'demo quickstart must still create preview instead of direct save');
const handlerMatch = libraryRoute.match(/function\s+loadDemoSampleQuickstart\s*\([^)]*\)\s*{([\s\S]*?)\n\s*}\n\n\s*async function handleImportFile/);
if (!handlerMatch) fail('Could not isolate loadDemoSampleQuickstart handler');
const quickstartHandler = handlerMatch[1];
if (/setLearningData\s*\(/.test(quickstartHandler)) fail('demo quickstart handler must not auto-save by calling setLearningData');
if (/resetLearningDataToMock\s*\(|localStorage\.clear|localStorage\.removeItem|localStorage\.setItem/.test(quickstartHandler)) fail('demo quickstart handler must not reset or mutate localStorage directly');
if (/extractSingleFile\s*\(|getFileProcessorBaseUrl\s*\(/.test(quickstartHandler)) fail('demo quickstart handler must not require EduGen');
if (/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(quickstartHandler)) fail('demo quickstart handler must not call a network/API path');
const guardedContext = /(does not|do not|does shime include|không|khong|no\s+|not supported|unsupported|avoid|forbidden|without|separate|separately|not bundled|manual|only|guardrail|caveat|requires|không phải|khong phai|not a)/i;
const forbiddenPositiveClaims = [
  { label: 'auto-load claim', pattern: /auto-?loads|tự động nạp|tự nạp mẫu/i },
  { label: 'auto-save claim', pattern: /auto-?saves|tự động lưu|auto save/i },
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation|tạo quiz bằng AI tích hợp/i },
  { label: 'external AI/API calls', pattern: /calls external AI APIs|external AI\/API integration|gọi AI\/API bên ngoài/i },
  { label: 'API key/BYOK support', pattern: /API key support|BYOK support|hỗ trợ API key|hỗ trợ BYOK/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR|hỗ trợ OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime|EduGen được đóng gói/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts|đồng bộ đám mây/i }
];
for (const [file, content] of [['src/routes/Library.jsx', libraryRoute], ['README.md', readme], ['docs/demo-script.md', demoScript], ['docs/public-release-notes.md', publicNotes], ['RELEASE_QA_V2.md', releaseQa]]) {
  content.split(/\r?\n/).forEach((line, index) => { for (const claim of forbiddenPositiveClaims) if (claim.pattern.test(line) && !guardedContext.test(line)) fail(`${file}:${index + 1} contains misleading empty-state claim without guarded context: ${claim.label}`); });
}
for (const [file, content] of [['README.md', readme], ['docs/demo-script.md', demoScript], ['docs/public-release-notes.md', publicNotes]]) {
  assertMatches(content, /empty-state|empty state|Library has no saved quiz items|thư viện.*trống/i, `${file} must document the Library empty-state onboarding`);
  assertMatches(content, /demo sample|quiz mẫu|Dùng quiz mẫu/i, `${file} must mention demo sample quickstart in empty-state context`);
  assertMatches(content, /JSON\/CSV/i, `${file} must mention JSON/CSV import in empty-state context`);
  assertMatches(content, /text\/Markdown|văn bản\/Markdown/i, `${file} must mention text/Markdown import in empty-state context`);
  assertMatches(content, /manual AI|AI.*manual|copy-paste|copy\/paste|thủ công/i, `${file} must mention manual AI workflow in empty-state context`);
  assertMatches(content, /EduGen.*separate|separate EduGen|EduGen.*riêng|separately configured EduGen/i, `${file} must mention separate/configured EduGen in empty-state context`);
  assertMatches(content, /does not auto-load|does not auto-save|không tự nạp|không tự lưu|no auto-load|no auto-save/i, `${file} must document no auto-load/no auto-save`);
  assertMatches(content, /preview|review|confirm-save|xem trước|kiểm tra chất lượng|xác nhận lưu/i, `${file} must document preview/review/confirm-save safety`);
}
assertMatches(releaseQa, /Phase 8Q/i, 'RELEASE_QA_V2.md must include Phase 8Q');
assertMatches(releaseQa, /empty-state onboarding|empty-state|thư viện.*trống/i, 'Phase 8Q QA notes must document Library empty-state onboarding');
assertMatches(releaseQa, /no auto-load|does not auto-load|không tự nạp/i, 'Phase 8Q QA notes must document no auto-load');
assertMatches(releaseQa, /no auto-save|does not auto-save|không tự lưu/i, 'Phase 8Q QA notes must document no auto-save');
assertMatches(releaseQa, /No import\/parser changes|no import\/parser changes/i, 'Phase 8Q QA notes must document no import/parser change');
assertMatches(releaseQa, /storage schema|schema migration|storage\/backup schema/i, 'Phase 8Q QA notes must document no storage schema change');
assertMatches(releaseQa, /validate-library-empty-state-onboarding\.js/i, 'Phase 8Q QA notes must document new validator');
assertIncludes(workflow, 'node scripts/validate-library-empty-state-onboarding.js', 'CI workflow');
assertIncludes(workflow, 'node scripts/validate-demo-quickstart-onboarding.js', 'CI workflow');
assertIncludes(workflow, 'node scripts/validate-demo-sample-quickstart.js', 'CI workflow');
for (const validator of ['validate-visual-asset-guidance','validate-demo-sample-pack','validate-demo-readiness-docs','validate-public-release-docs','validate-release-candidate-status','validate-dashboard-plan-completion-guard','validate-ai-draft-evaluation-fixtures','validate-ai-integration-readiness','validate-ai-output-import-hardening','validate-ai-prompt-export','validate-ai-planning-docs','validate-import-ux-release-readiness','validate-quiz-draft-quality','validate-edugen-document-integration','validate-edugen-pdf-integration','validate-text-file-import','validate-text-quiz-parser','validate-backup-restore-recovery','validate-dashboard-performance','validate-import-validation','validate-storage-sync','validate-weighted-selection','validate-recommendation-feedback','validate-exam-readiness','validate-v2-release-hardening','validate-smoke-fixture']) assertIncludes(workflow, validator, 'CI workflow');
const migrationLikeFiles = [];
const walk = (dir) => { for (const entry of fs.readdirSync(dir, { withFileTypes: true })) { if (['node_modules','dist','coverage','test-results','playwright-report','.git'].includes(entry.name)) continue; const full = path.join(dir, entry.name); const rel = path.relative(root, full); if (entry.isDirectory()) walk(full); else if (/migration|schema-version|storage-schema/i.test(rel)) migrationLikeFiles.push(rel); } };
walk(path.join(root, 'src'));
if (migrationLikeFiles.length) fail(`unexpected storage schema/migration-like source files found: ${migrationLikeFiles.join(', ')}`);
console.log(JSON.stringify({ libraryEmptyStateOnboarding: true, quickstartStillUsesPreview: true, migrationLikeFiles: migrationLikeFiles.length }, null, 2));
console.log('validate-library-empty-state-onboarding: PASS');
