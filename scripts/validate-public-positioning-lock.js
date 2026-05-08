import fs from 'fs';
import path from 'path';

const root = process.cwd();
const expectedVersion = '2.0.0-beta-ai.1';
const fail = (message) => { console.error(`validate-public-positioning-lock: ${message}`); process.exit(1); };
const readRequired = (relativePath) => {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) fail(`${relativePath} is missing`);
  return fs.readFileSync(fullPath, 'utf8');
};
const assertMatches = (content, regex, label) => { if (!regex.test(content)) fail(label); };
const assertIncludes = (content, needle, label) => {
  if (!content.toLowerCase().includes(needle.toLowerCase())) fail(`${label} must include "${needle}"`);
};

const packageJson = JSON.parse(readRequired('package.json'));
if (packageJson.version !== expectedVersion) fail(`package version changed from expected ${expectedVersion}`);
const packageLock = JSON.parse(readRequired('package-lock.json'));
if (packageLock.version !== expectedVersion || packageLock.packages?.['']?.version !== expectedVersion) {
  fail('package-lock version changed unexpectedly');
}

const readme = readRequired('README.md');
const publicNotes = readRequired('docs/public-release-notes.md');
const demoScript = readRequired('docs/demo-script.md');
const deploymentReadiness = readRequired('docs/deployment-readiness.md');
const visualGuidance = readRequired('docs/visual-asset-guidance.md');
const screenshotChecklist = readRequired('docs/screenshot-checklist.md');
const releaseQa = readRequired('RELEASE_QA_V2.md');
const workflow = readRequired('.github/workflows/e2e-smoke.yml');

assertMatches(readme, /Current RC capabilities|Current release-candidate|RC capability/i, 'README.md must include current RC capability positioning');
assertMatches(readme, /local-first/i, 'README.md must mention local-first positioning');
assertMatches(readme, /Dùng quiz mẫu|demo sample quickstart/i, 'README.md must mention demo sample quickstart');
assertMatches(readme, /Library.*empty-state|empty-state.*Library|Thư viện.*trống/i, 'README.md must mention Library empty-state onboarding');
assertMatches(readme, /Dashboard.*first-run|Dashboard.*getting-started|Dashboard.*callout/i, 'README.md must mention Dashboard first-run onboarding');
assertMatches(readme, /JSON\/CSV/i, 'README.md must mention JSON/CSV import');
assertMatches(readme, /text\/Markdown|Markdown draft/i, 'README.md must mention text/Markdown import');
assertMatches(readme, /\.txt.*\.md|\.md.*\.txt/i, 'README.md must mention local .txt/.md file import');
assertMatches(readme, /PDF\/DOCX\/PPTX\/ZIP.*EduGen|EduGen.*PDF\/DOCX\/PPTX\/ZIP/i, 'README.md must mention document import via separate EduGen');
assertMatches(readme, /manual AI|prompt\/export|copy\/paste|copy-paste/i, 'README.md must mention manual AI workflow');
assertMatches(readme, /quality review|advisory/i, 'README.md must mention advisory quality review');
assertMatches(readme, /demo sample pack|demo\/readiness|readiness docs/i, 'README.md must mention demo sample pack/readiness docs');

assertMatches(publicNotes, /Phase 8N[\s\S]*Phase 8T|8N[\s\S]*8T|onboarding and demo quickstart polish/i, 'public release notes must mention Phase 8N-8T or equivalent onboarding/demo quickstart verification');
assertMatches(publicNotes, /Ubuntu browser/i, 'public release notes must mention Ubuntu browser verification');
assertMatches(publicNotes, /demo sample quickstart/i, 'public release notes must mention demo sample quickstart');
assertMatches(publicNotes, /Library empty-state/i, 'public release notes must mention Library empty-state onboarding');
assertMatches(publicNotes, /Dashboard first-run/i, 'public release notes must mention Dashboard first-run onboarding');
assertMatches(publicNotes, /preview|review|confirm-save|xem trước|xác nhận/i, 'public release notes must mention preview/review/confirm-save safety');
assertMatches(publicNotes, /auto-load|auto-save|does not auto|không tự/i, 'public release notes must mention no auto-load/no auto-save');
assertMatches(publicNotes, /EduGen.*separate|separate.*EduGen|EduGen.*riêng/i, 'public release notes must preserve EduGen separate boundary');
assertMatches(publicNotes, /manual copy\/paste|manual copy-paste|manual AI|copy\/paste workflow/i, 'public release notes must preserve manual-only AI boundary');

assertMatches(demoScript, /Recommended RC demo path|recommended demo path/i, 'demo script must include recommended demo path');
assertMatches(demoScript, /Start on Dashboard|Dashboard first-run/i, 'demo script path must start on Dashboard first-run onboarding');
assertMatches(demoScript, /go to Library|Library as the safe|Mở Thư viện|to Library/i, 'demo script path must go to Library');
assertMatches(demoScript, /Dùng quiz mẫu|demo sample/i, 'demo script path must include demo sample quickstart');
assertMatches(demoScript, /preview[\s\S]*quality review|quality review[\s\S]*preview|xem trước[\s\S]*kiểm tra chất lượng/i, 'demo script must include preview/quality review');
assertMatches(demoScript, /Confirm save only if desired|confirm save only if desired|xác nhận/i, 'demo script must describe confirm-save as optional for demo');
assertMatches(demoScript, /manual AI|copy\/paste|copy-paste/i, 'demo script must mention honest manual AI workflow');
assertMatches(demoScript, /EduGen.*separate|separately.*EduGen|EduGen.*riêng/i, 'demo script must mention EduGen separately');
assertMatches(demoScript, /Do not claim screenshots already exist/i, 'demo script must not claim screenshots exist without assets');

assertMatches(deploymentReadiness, /frontend-only deployment.*app shell|app shell.*frontend-only deployment|static Vite app/i, 'deployment readiness must say frontend-only deployment can host app shell');
assertMatches(deploymentReadiness, /VITE_FILE_PROCESSOR_URL/i, 'deployment readiness must mention VITE_FILE_PROCESSOR_URL');
assertMatches(deploymentReadiness, /browser-reachable.*EduGen|EduGen.*browser-reachable|separately hosted.*EduGen/i, 'deployment readiness must require browser-reachable separate EduGen for document import');
assertMatches(deploymentReadiness, /browser storage|localStorage|browser-local/i, 'deployment readiness must mention browser-local storage');
assertMatches(deploymentReadiness, /no backend|does not include backend|not include backend|no backend\/auth\/cloud sync/i, 'deployment readiness must say no backend/auth/cloud sync');
assertMatches(deploymentReadiness, /no built-in AI|does not include.*AI provider|manual AI/i, 'deployment readiness must say no built-in AI/API provider');
assertMatches(deploymentReadiness, /no OCR|OCR is not included|not OCR/i, 'deployment readiness must say no OCR');

const visualCombined = `${visualGuidance}\n${screenshotChecklist}`;
assertMatches(visualCombined, /Dashboard first-run onboarding/i, 'visual guidance or screenshot checklist must include Dashboard first-run onboarding capture candidate');
assertMatches(visualCombined, /Library empty-state onboarding/i, 'visual guidance or screenshot checklist must include Library empty-state onboarding capture candidate');
assertMatches(visualCombined, /Library demo sample quickstart|Dùng quiz mẫu/i, 'visual guidance or screenshot checklist must include Library demo quickstart capture candidate');
assertMatches(visualCombined, /demo sample preview.*quality review|Demo sample preview and quality review/i, 'visual guidance or screenshot checklist must include demo sample preview/quality review capture candidate');

assertMatches(releaseQa, /Phase 8U/i, 'RELEASE_QA_V2.md must include Phase 8U');
assertMatches(releaseQa, /public positioning lock|RC Polish Summary|current RC capability/i, 'Phase 8U notes must document public positioning lock');
assertMatches(releaseQa, /Phase 8N-8T|8N-8T|Ubuntu browser verification/i, 'Phase 8U notes must document onboarding/demo verification references');
assertMatches(releaseQa, /docs-only|documentation\/public positioning\/readiness only|No runtime app behavior changes/i, 'Phase 8U notes must document docs-only scope');
assertMatches(releaseQa, /validate-public-positioning-lock\.js/i, 'Phase 8U notes must mention validator');

for (const validator of [
  'node scripts/validate-public-positioning-lock.js',
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

const publicDocs = [
  ['README.md', readme],
  ['docs/public-release-notes.md', publicNotes],
  ['docs/demo-script.md', demoScript],
  ['docs/deployment-readiness.md', deploymentReadiness],
  ['docs/visual-asset-guidance.md', visualGuidance],
  ['docs/screenshot-checklist.md', screenshotChecklist]
];
const guardedContext = /(unsupported|not supported|do not claim|do not say|do not imply|avoid|does not|do not|no\s+|not a|not provide|without|is not bundled|not bundled|separate|separately|requires|manual|only|guardrail|caveat|không|khong|forbidden|boundary|not include|not included|not certify|does not certify)/i;
const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation|tạo quiz bằng AI tích hợp/i },
  { label: 'AI API integration', pattern: /AI API integration|AI\/API integration|external AI\/API integration|calls external AI APIs|Shime calls external AI APIs/i },
  { label: 'API key support', pattern: /API key support|supports API keys|API-key support|hỗ trợ API key/i },
  { label: 'BYOK support', pattern: /BYOK support|supports BYOK|hỗ trợ BYOK/i },
  { label: 'OCR support', pattern: /OCR support|supports OCR|hỗ trợ OCR/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime|EduGen được đóng gói/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|backend accounts|cloud sync|authentication, or cloud sync|đồng bộ đám mây/i },
  { label: 'production/security certification', pattern: /production certified|production-certified|security certification|security certified|hosted production\/security certification/i },
  { label: 'frontend-only document import without EduGen', pattern: /frontend-only (?:deployment )?(?:can|supports).*PDF\/DOCX\/PPTX\/ZIP.*without.*EduGen|without a browser-reachable EduGen service/i }
];
for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const { label, pattern } of misleadingClaims) {
      if (pattern.test(line)) {
        const context = `${lines[index - 8] || ''} ${lines[index - 7] || ''} ${lines[index - 6] || ''} ${lines[index - 5] || ''} ${lines[index - 4] || ''} ${lines[index - 3] || ''} ${lines[index - 2] || ''} ${lines[index - 1] || ''} ${line} ${lines[index + 1] || ''}`;
        if (!guardedContext.test(context)) {
          fail(`${file}:${index + 1} contains unguarded misleading claim: ${label}`);
        }
      }
    }
  });
}

const screenshotDir = path.join(root, 'docs/assets/screenshots');
if (fs.existsSync(screenshotDir)) {
  const imageFiles = fs.readdirSync(screenshotDir).filter((name) => /\.(png|jpe?g|webp|gif)$/i.test(name));
  if (imageFiles.length > 0) fail('Phase 8U must not add screenshot/image assets');
}

console.log('validate-public-positioning-lock: PASS');
