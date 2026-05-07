import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';
const fail = (message) => { console.error(`validate-demo-sample-quickstart: ${message}`); process.exit(1); };
const readRequired = (relativePath) => { const fullPath = path.join(root, relativePath); if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`); return fs.readFileSync(fullPath, 'utf8'); };
const assertIncludes = (content, needle, label) => { if (!content.toLowerCase().includes(needle.toLowerCase())) fail(`${label} must include "${needle}"`); };
const assertMatches = (content, regex, label) => { if (!regex.test(content)) fail(label); };
const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) fail(`package version changed from expected ${expectedVersion}`);
const packageLock = JSON.parse(readRequired('package-lock.json'));
if (packageLock.version !== expectedVersion || packageLock.packages?.['']?.version !== expectedVersion) fail('package-lock version changed unexpectedly');
const demoSampleModule = readRequired('src/data/demoSampleQuiz.js');
const libraryRoute = readRequired('src/routes/Library.jsx');
const readme = readRequired('README.md');
const demoScript = readRequired('docs/demo-script.md');
const screenshotChecklist = readRequired('docs/screenshot-checklist.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const workflow = readRequired('.github/workflows/e2e-smoke.yml');
for (const relativePath of ['docs/demo-samples/README.md','docs/demo-samples/shime-demo-quiz.json','docs/demo-samples/shime-demo-quiz.csv','docs/demo-samples/shime-demo-text-markdown.md','docs/demo-samples/shime-demo-manual-ai-output.md','docs/visual-asset-guidance.md']) readRequired(relativePath);
assertMatches(demoSampleModule, /export\s+const\s+demoSampleQuiz|export\s+default\s+demoSampleQuiz/, 'demo sample module must export demoSampleQuiz');
assertMatches(demoSampleModule, /multiple_choice/, 'demo sample must include multiple-choice content');
assertMatches(demoSampleModule, /choices\s*:/, 'demo sample must include choices');
assertMatches(demoSampleModule, /explanation\s*:/, 'demo sample should include explanations');
assertMatches(demoSampleModule, /in-app-demo-sample|v2-demo-quickstart/, 'demo sample should identify local quickstart source');
assertIncludes(libraryRoute, '../data/demoSampleQuiz.js', 'Library route');
assertMatches(libraryRoute, /Dùng quiz mẫu|Load demo sample|Thử với bộ mẫu/, 'Library route must include demo sample quickstart UI copy');
assertMatches(libraryRoute, /loadDemoSampleQuickstart/, 'Library route must include a demo sample quickstart handler');
assertMatches(libraryRoute, /parseLearningDataJson\(JSON\.stringify\(demoSampleQuiz\)\)/, 'demo sample should enter existing JSON import validation path');
assertMatches(libraryRoute, /reviewQuizDraftQuality\(/, 'demo sample path must use existing quiz draft quality review');
assertMatches(libraryRoute, /setPreview\(/, 'demo sample path must set an import preview');
assertMatches(libraryRoute, /xem trước|đánh giá chất lượng|xác nhận lưu|confirm-save|confirm save/is, 'Library quickstart copy must mention preview/review/confirm-save safety');
assertMatches(libraryRoute, /không do Shime tạo bằng AI|không gọi AI\/API|does not call AI\/API|not AI-generated/is, 'Library quickstart copy must state honest AI/API boundary');
assertMatches(libraryRoute, /không dùng EduGen|does not use EduGen/is, 'Library quickstart copy must state that EduGen is not used');
assertMatches(libraryRoute, /Không tự lưu|does not auto-save|không auto-save/is, 'Library quickstart copy must state no auto-save');
const handlerMatch = libraryRoute.match(/function\s+loadDemoSampleQuickstart\s*\([^)]*\)\s*{([\s\S]*?)\n\s*}\n\n\s*async function handleImportFile/);
if (!handlerMatch) fail('Could not isolate loadDemoSampleQuickstart handler for auto-save guard');
const quickstartHandler = handlerMatch[1];
if (/setLearningData\s*\(/.test(quickstartHandler)) fail('demo sample quickstart handler must not call setLearningData or auto-save');
if (/resetLearningDataToMock\s*\(|localStorage\.clear|localStorage\.removeItem/.test(quickstartHandler)) fail('demo sample quickstart handler must not reset or destructively mutate localStorage');
if (/extractSingleFile\s*\(|getFileProcessorBaseUrl\s*\(/.test(quickstartHandler)) fail('demo sample quickstart handler must not use EduGen file processing');
if (/fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/.test(quickstartHandler)) fail('demo sample quickstart handler must not make network/API calls');
for (const [file, content] of [['README.md', readme], ['docs/demo-script.md', demoScript], ['docs/screenshot-checklist.md', screenshotChecklist], ['docs/public-release-notes.md', publicNotes], ['RELEASE_QA_V2.md', releaseQa]]) assertMatches(content, /demo sample quickstart|Dùng quiz mẫu|quiz mẫu|in-app demo sample/i, `${file} must document the in-app demo sample quickstart`);
assertMatches(readme, /preview|xem trước/i, 'README must mention preview safety for demo quickstart');
assertMatches(readme, /confirm save|xác nhận lưu|explicitly confirm save/i, 'README must mention confirm-save safety for demo quickstart');
assertMatches(readme, /does not call AI\/API|không gọi AI\/API|does not auto-save/i, 'README must mention AI/API or auto-save boundary for demo quickstart');
assertMatches(releaseQa, /Phase 8N/i, 'RELEASE_QA_V2.md must include Phase 8N');
assertIncludes(workflow, 'node scripts/validate-demo-sample-quickstart.js', 'CI workflow');
for (const validator of ['validate-visual-asset-guidance','validate-demo-sample-pack','validate-demo-readiness-docs','validate-public-release-docs','validate-release-candidate-status','validate-dashboard-plan-completion-guard','validate-ai-draft-evaluation-fixtures','validate-ai-integration-readiness','validate-ai-output-import-hardening','validate-ai-prompt-export','validate-ai-planning-docs','validate-import-ux-release-readiness','validate-quiz-draft-quality','validate-edugen-document-integration','validate-edugen-pdf-integration','validate-text-file-import','validate-text-quiz-parser','validate-backup-restore-recovery','validate-dashboard-performance','validate-import-validation','validate-storage-sync','validate-weighted-selection','validate-recommendation-feedback','validate-exam-readiness','validate-v2-release-hardening','validate-smoke-fixture']) assertIncludes(workflow, validator, 'CI workflow');
const { demoSampleQuiz } = await import('../src/data/demoSampleQuiz.js');
const { validateLearningDataImport } = await import('../src/data/importValidator.js');
const { reviewQuizDraftQuality } = await import('../src/data/quizDraftQuality.js');
const validation = validateLearningDataImport(demoSampleQuiz);
if (!validation.canImport) fail(`demo sample module must pass existing import validation: ${validation.errors?.map((error) => error.message).join('; ')}`);
if (validation.normalizedData.items.length < 3) fail('demo sample quickstart must include multiple usable items');
const qualityReview = reviewQuizDraftQuality(validation.normalizedData);
if (qualityReview.summary?.errorCount) fail('demo sample quickstart should not produce quality-review errors');
const guardedContext = /(unsupported|not supported|do not claim|do not say|do not imply|do not publish|should not|avoid|does not|does not include|does not provide|does not call|do not provide|no\s+|not a|without claiming|without implying|without requiring|is not bundled|not bundled|separate|separately|requires|manual|only|guardrail|caveat|current release candidate does not include|không|khong|does shime include)/i;
const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|calls external AI APIs|external AI API calls|Shime calls external AI APIs/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'API key support', pattern: /API key support|API-key support/i },
  { label: 'BYOK support', pattern: /BYOK support/i },
  { label: 'cloud sync', pattern: /cloud sync/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|backend accounts|backend, account sync/i },
  { label: 'production certified', pattern: /production certified|production-certified/i },
  { label: 'security certification', pattern: /security certification|security certified|security-certified/i }
];
for (const [file, content] of [['README.md', readme], ['docs/demo-script.md', demoScript], ['docs/screenshot-checklist.md', screenshotChecklist], ['docs/public-release-notes.md', publicNotes], ['RELEASE_QA_V2.md', releaseQa]]) content.split(/\r?\n/).forEach((line, index) => { for (const claim of misleadingClaims) if (claim.pattern.test(line) && !guardedContext.test(line)) fail(`${file}:${index + 1} contains misleading claim without unsupported/forbidden context: ${claim.label}`); });
if (!fs.existsSync(path.join(root, 'src/services/fileProcessorClient.js'))) fail('EduGen client source is unexpectedly missing');
console.log(JSON.stringify({ demoItems: validation.normalizedData.items.length, qualityWarnings: qualityReview.summary?.warningCount || 0, qualityErrors: qualityReview.summary?.errorCount || 0 }, null, 2));
console.log('validate-demo-sample-quickstart: PASS');
