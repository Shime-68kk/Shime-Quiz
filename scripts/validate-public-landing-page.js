#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const root = process.cwd();
const failures = [];

function read(relativePath) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${relativePath} is missing.`);
    return '';
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function assertIncludes(content, needle, message) {
  if (!content.includes(needle)) failures.push(message || `Missing ${needle}`);
}

function assertMatches(content, regex, message) {
  if (!regex.test(content)) failures.push(message || `Missing pattern ${regex}`);
}

function assertNotMatches(content, regex, message) {
  if (regex.test(content)) failures.push(message || `Forbidden pattern ${regex}`);
}

function collectFiles(startRelative, regex) {
  const start = path.join(root, startRelative);
  if (!fs.existsSync(start)) return [];
  const files = [];
  const stack = [start];
  while (stack.length) {
    const current = stack.pop();
    const stat = fs.statSync(current);
    if (stat.isDirectory()) {
      fs.readdirSync(current).forEach(entry => stack.push(path.join(current, entry)));
    } else if (regex.test(current)) {
      files.push(current);
    }
  }
  return files;
}

function gitTrackedFiles() {
  try {
    return execSync('git ls-files', { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      .split(/\r?\n/)
      .filter(Boolean);
  } catch {
    return [];
  }
}

const doc = read('docs/public-landing-page.md');
const readme = read('README.md');
const releaseQa = read('RELEASE_QA_V2.md');
const finalAudit = read('docs/final-rc-audit.md');
const releaseDraft = read('docs/github-release-draft.md');
const publishChecklist = read('docs/release-tag-publish-checklist.md');
const workflow = read('.github/workflows/e2e-smoke.yml');
const home = read('src/routes/Home.jsx');
const main = read('src/main.jsx');
const routeConfig = read('src/routes/routeConfig.js');
const styles = read('src/styles/global.css');
const pkgText = read('package.json');
const lockText = read('package-lock.json');
const pkg = pkgText ? JSON.parse(pkgText) : { dependencies: {}, devDependencies: {} };
const lock = lockText ? JSON.parse(lockText) : { packages: { '': {} } };
const lockRoot = lock.packages?.[''] || {};

assertMatches(doc, /Phase 10A/i, 'Public landing doc must mention Phase 10A.');
assertMatches(doc, /Public Landing Page|Root Route Polish/i, 'Public landing doc must mention Public Landing Page or Root Route Polish.');
assertMatches(doc, /completed\/merged through Phase 9H|Phase 9H/i, 'Public landing doc must mention completed/merged through Phase 9H.');
assertMatches(doc, /local-first quiz study app/i, 'Public landing doc must mention local-first quiz study app.');
assertMatches(doc, /JSON/i, 'Public landing doc must mention JSON.');
assertMatches(doc, /CSV/i, 'Public landing doc must mention CSV.');
assertMatches(doc, /text\/Markdown|Text\/Markdown/i, 'Public landing doc must mention text/Markdown.');
assertMatches(doc, /\.txt\/\.md|\.txt.*\.md/i, 'Public landing doc must mention .txt/.md.');
assertMatches(doc, /Dùng quiz mẫu|demo quickstart/i, 'Public landing doc must mention Dùng quiz mẫu or demo quickstart.');
assertMatches(doc, /Library/i, 'Public landing doc must mention Library.');
assertMatches(doc, /Study Room/i, 'Public landing doc must mention Study Room.');
assertMatches(doc, /Dashboard/i, 'Public landing doc must mention Dashboard.');
assertMatches(doc, /backup\/restore|backup.*restore/i, 'Public landing doc must mention backup/restore.');
assertMatches(doc, /EduGen\/File Processor.*separate|EduGen.*not bundled|separate.*EduGen\/File Processor/i, 'Public landing doc must mention EduGen/File Processor separate or not bundled.');
assertMatches(doc, /PDF\/DOCX\/PPTX\/ZIP.*requires.*separate configured|PDF\/DOCX\/PPTX\/ZIP.*requires.*configured/i, 'Public landing doc must mention PDF/DOCX/PPTX/ZIP requires separate configured service.');
assertMatches(doc, /Frontend-only hosting alone does not provide document conversion|frontend-only hosting alone does not provide document conversion/i, 'Public landing doc must mention frontend-only hosting alone does not provide document conversion.');
assertMatches(doc, /manual AI workflow|Manual AI workflow/i, 'Public landing doc must mention manual AI workflow.');
assertMatches(doc, /No built-in AI generation|no built-in AI generation/i, 'Public landing doc must mention no built-in AI generation.');
assertMatches(doc, /No external AI\/API calls|no external AI\/API calls/i, 'Public landing doc must mention no external AI/API calls.');
assertMatches(doc, /No API key\/BYOK|no API key\/BYOK/i, 'Public landing doc must mention no API key/BYOK.');
assertMatches(doc, /No OCR|no OCR/i, 'Public landing doc must mention no OCR.');
assertMatches(doc, /No backend\/cloud sync|no backend\/cloud sync/i, 'Public landing doc must mention no backend/cloud sync.');
assertMatches(doc, /release tag has not been created|no release tag created/i, 'Public landing doc must mention no release tag created.');
assertMatches(doc, /GitHub Release has not been published|GitHub release has not been published/i, 'Public landing doc must mention GitHub release has not been published.');
assertMatches(doc, /Phase 10B.*SEO.*Open Graph.*Social Preview Metadata/i, 'Public landing doc must mention Phase 10B SEO / Open Graph / Social Preview Metadata as next step.');

assertIncludes(readme, 'docs/public-landing-page.md', 'README.md must link to docs/public-landing-page.md.');
assertMatches(releaseQa, /Phase 10A/i, 'RELEASE_QA_V2.md must include Phase 10A.');
assertMatches(finalAudit, /public-landing-page\.md|public landing|root route polish/i, 'final RC audit must link/reference public landing/root route polish.');
assertMatches(releaseDraft, /public-landing-page\.md|public landing|root route polish/i, 'GitHub release draft must link/reference public landing/root route polish.');
assertMatches(publishChecklist, /public-landing-page\.md|public landing|root route polish/i, 'Release tag publish checklist must link/reference public landing/root route polish.');
assertIncludes(workflow, 'node scripts/validate-public-landing-page.js', 'CI workflow must run validate-public-landing-page.js.');

assertIncludes(main, "import Home from './routes/Home.jsx';", 'Root router must import Home route.');
assertIncludes(main, '<Route index element={<Home />} />', 'Root index route must render Home, not redirect immediately.');
assertMatches(home, /ShimeChamhoc v2/i, 'Home route must identify ShimeChamhoc v2.');
assertMatches(home, /local-first|cục bộ/i, 'Home route must mention local-first/cục bộ.');
assertMatches(home, /Dùng quiz mẫu/i, 'Home route must mention Dùng quiz mẫu.');
assertMatches(home, /JSON/i, 'Home route must mention JSON.');
assertMatches(home, /CSV/i, 'Home route must mention CSV.');
assertMatches(home, /Text\/Markdown|text\/Markdown/i, 'Home route must mention text/Markdown.');
assertMatches(home, /\.txt\/\.md|\.txt.*\.md/i, 'Home route must mention .txt/.md.');
assertMatches(home, /PDF\/DOCX\/PPTX\/ZIP/i, 'Home route must mention PDF/DOCX/PPTX/ZIP.');
assertMatches(home, /EduGen.*không được bundle|EduGen.*không.*bundle|EduGen.*not bundled|separate/i, 'Home route must state EduGen is separate/not bundled.');
assertMatches(home, /không tự có chuyển đổi tài liệu|frontend-only|document conversion/i, 'Home route must avoid frontend-only document conversion claim.');
assertMatches(home, /không gọi AI\/API|no external AI\/API|không có built-in AI generation/i, 'Home route must state no AI/API calls.');
assertMatches(home, /không có API key\/BYOK|no API key\/BYOK/i, 'Home route must state no API key/BYOK.');
assertMatches(home, /Không OCR|không OCR|no OCR/i, 'Home route must state no OCR.');
assertMatches(home, /không thêm backend\/cloud sync|không backend\/cloud sync|no backend\/cloud sync/i, 'Home route must state no backend/cloud sync.');
assertMatches(home, /navigate\('\/dashboard'\)/, 'Home route should include safe Dashboard CTA.');
assertMatches(home, /navigate\('\/library'\)/, 'Home route should include safe Library/demo CTA.');
assertMatches(home, /navigate\('\/study-room'\)/, 'Home route should include safe Study Room CTA.');
assertMatches(styles, /publicLanding/, 'global.css must include public landing styles.');
assertNotMatches(routeConfig, /auth|login|protected/i, 'Route config must not introduce auth/login/protected routes.');

[
  'validate-accessibility-keyboard-smoke',
  'validate-study-dashboard-regression-smoke',
  'validate-backup-restore-regression-smoke',
  'validate-import-regression-smoke',
  'validate-release-tag-publish-checklist',
  'validate-release-package-cleanliness',
  'validate-github-release-draft',
  'validate-release-tag-decision',
  'validate-ci-green-verification',
  'validate-final-rc-audit',
  'validate-local-e2e-verification-docs',
  'validate-onboarding-e2e-smoke',
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
assertIncludes(workflow, 'npm run test:e2e:smoke', 'CI workflow must preserve E2E smoke.');
assertIncludes(workflow, 'npm run test:e2e:onboarding', 'CI workflow must preserve onboarding E2E.');
assertIncludes(workflow, 'actions/upload-artifact@v4', 'CI workflow must preserve failure artifact upload.');
assertNotMatches(workflow, /continue-on-error:\s*true/i, 'CI workflow must not include broad continue-on-error.');

if (pkg.version !== lock.version || pkg.version !== lockRoot.version) {
  failures.push(`package version metadata mismatch: package=${pkg.version}, lock=${lock.version}, root=${lockRoot.version}`);
}
for (const kind of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
  const pkgDeps = JSON.stringify(pkg[kind] || {});
  const lockDeps = JSON.stringify(lockRoot[kind] || {});
  if (pkgDeps !== lockDeps) failures.push(`package.json ${kind} must match package-lock root metadata.`);
}

const runtimePhaseMarker = /Phase 10A|public-landing-page\.md|Public Landing Page|Root Route Polish/i;
for (const file of collectFiles('e2e', /\.spec\.(js|ts)$/)) {
  const text = fs.readFileSync(file, 'utf8');
  if (runtimePhaseMarker.test(text)) failures.push(`E2E spec contains Phase 10A marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/data', /textQuizParser|import|quizDraft|aiPrompt|aiOutput|fileProcessor|backup|restore/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (runtimePhaseMarker.test(text)) failures.push(`import/parser/AI/backup source contains Phase 10A marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/state', /storage|schema|history|recommendation|review|goal|plan/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (runtimePhaseMarker.test(text)) failures.push(`storage/state source contains Phase 10A marker: ${path.relative(root, file)}`);
}
for (const file of collectFiles('src/quiz', /scoring|spaced|mastery|history|recommendation|study/i)) {
  const text = fs.readFileSync(file, 'utf8');
  if (runtimePhaseMarker.test(text)) failures.push(`learning logic source contains Phase 10A marker: ${path.relative(root, file)}`);
}

const tracked = gitTrackedFiles();
if (tracked.length) {
  const forbiddenTracked = tracked.filter(file => {
    const normalized = file.replace(/\\/g, '/');
    if (/^(node_modules|dist|test-results|playwright-report|coverage)(\/|$)/.test(normalized)) return true;
    if (/^FETCH_HEAD$|(^|\/)\.DS_Store$/.test(normalized)) return true;
    if (/\.log$|npm-debug\.log|yarn-error\.log|pnpm-debug\.log/i.test(normalized)) return true;
    if (/^\.env($|\.)/.test(normalized) && normalized !== '.env.example') return true;
    return false;
  });
  if (forbiddenTracked.length) failures.push(`Generated/local artifacts or env files are tracked: ${forbiddenTracked.join(', ')}`);
}

const publicDocs = [
  ['README.md', readme],
  ['RELEASE_QA_V2.md', releaseQa],
  ['docs/public-landing-page.md', doc],
  ['docs/final-rc-audit.md', finalAudit],
  ['docs/github-release-draft.md', releaseDraft],
  ['docs/release-tag-publish-checklist.md', publishChecklist]
];

function guarded(context) {
  return /no |not |does not|do not|must not|unless|without|unsupported|forbidden|avoid|separate|separately|requires|manual|only|caveat|future|later|not bundled|not included|not claim|has not been|should not|cannot|before|placeholder|after.*passes|actual .*run|if claiming|evidence|configured|tested|unavailable|boundary|claim|imply|safe claims|do not say|stop condition|local-first|where applicable|checked|advisory|not guaranteed|not full|does not certify|vẫn chưa|không|chưa được|riêng|cần|thủ công|future phase|separate future phase/i.test(context);
}

const misleadingClaims = [
  { label: 'built-in AI generation', pattern: /built-in AI (?:quiz )?generation/i },
  { label: 'external AI/API integration', pattern: /external AI\/API integration|AI API integration|AI\/API integration|calls external AI APIs|external AI\/API calls/i },
  { label: 'OCR', pattern: /OCR support|supports OCR|OCR claim|OCR added|OCR implementation/i },
  { label: 'EduGen bundled', pattern: /EduGen (?:is )?bundled|bundled into Shime/i },
  { label: 'frontend-only document conversion', pattern: /frontend-only .*document conversion|frontend-only .*PDF\/DOCX\/PPTX\/ZIP/i },
  { label: 'backend/cloud sync', pattern: /backend\/cloud sync|cloud sync|backend accounts/i },
  { label: 'account/auth sync', pattern: /account\/auth sync|auth sync|account sync|login\/auth|auth\/login/i },
  { label: 'production/security certification', pattern: /production certified|security certified|production\/security certification|production certification|security certification/i },
  { label: 'WCAG/accessibility certification', pattern: /WCAG compliance|WCAG compliant|accessibility certification|accessibility certified/i },
  { label: 'release tag created', pattern: /release tag created|tag was created|created a release tag/i },
  { label: 'GitHub release published', pattern: /GitHub release published|release published|published a GitHub release|published a release/i },
  { label: 'SEO optimization/crawler success', pattern: /SEO optimization|crawler indexing success|all crawlers render/i }
];

for (const [file, content] of publicDocs) {
  const lines = content.split(/\r?\n/);
  lines.forEach((line, index) => {
    const context = lines.slice(Math.max(0, index - 8), index + 1).join(' ');
    for (const { label, pattern } of misleadingClaims) {
      if (pattern.test(line) && !guarded(context)) failures.push(`${file}:${index + 1} may overclaim ${label}: ${line.trim()}`);
    }
  });
}

if (failures.length > 0) {
  console.error('validate-public-landing-page failed:');
  failures.forEach(failure => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('validate-public-landing-page: PASS');
console.log('- public landing doc, root route, CTA, and claims boundaries are present');
console.log('- CI validator registration and prior validator chain are preserved');
console.log('- package version/dependencies unchanged and unsupported public claims are guarded');
