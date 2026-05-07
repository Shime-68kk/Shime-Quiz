import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const docsPath = 'docs/ai-integration-readiness.md';
const releaseQaPath = 'RELEASE_QA_V2.md';
const workflowPath = '.github/workflows/e2e-smoke.yml';

for (const file of [docsPath, releaseQaPath, workflowPath]) {
  assert(exists(file), `${file} must exist`);
}

const docs = read(docsPath);
const releaseQa = read(releaseQaPath);
const workflow = read(workflowPath);

const requiredDocPhrases = [
  'planning and readiness phase only',
  'does **not** add built-in AI quiz generation',
  'generateQuizDraftFromText',
  'explicit user confirmation',
  'No silent sending',
  'content may leave the device',
  'BYOK frontend-only prototype',
  'Hosted backend proxy',
  'parse/normalize into flat v2 draft',
  'import validation',
  'manual AI output review',
  'quiz draft quality review',
  'preview',
  'user confirms save',
  'No auto-save and no auto-import',
  'Phase 8E sample fixtures and evaluation suite'
];

for (const phrase of requiredDocPhrases) {
  assert(docs.includes(phrase), `AI integration readiness doc must include: ${phrase}`);
}

const requiredReleasePhrases = [
  'Phase 8D',
  'AI integration readiness',
  'planning/readiness only',
  'does not add built-in AI generation',
  'does not call external AI APIs',
  'does not add API key handling',
  'does not add BYOK',
  'no auto-save or auto-import'
];

for (const phrase of requiredReleasePhrases) {
  assert(releaseQa.includes(phrase), `RELEASE_QA_V2.md must include: ${phrase}`);
}

assert(workflow.includes('node scripts/validate-ai-integration-readiness.js'), 'CI must run validate-ai-integration-readiness.js');
assert(workflow.includes('node scripts/validate-ai-output-import-hardening.js'), 'CI must preserve AI output hardening validator');
assert(workflow.includes('node scripts/validate-ai-prompt-export.js'), 'CI must preserve AI prompt export validator');
assert(workflow.includes('node scripts/validate-ai-planning-docs.js'), 'CI must preserve AI planning docs validator');

const forbiddenRuntimeFiles = [
  'src/data/aiIntegrationClient.js',
  'src/services/aiProviderClient.js',
  'src/services/openAiClient.js',
  'src/services/aiClient.js'
];
for (const file of forbiddenRuntimeFiles) {
  assert(!exists(file), `${file} should not be added in Phase 8D`);
}

const runtimeFilesToScan = [
  'src/routes/Library.jsx',
  'src/data/aiPromptBuilder.js',
  'src/data/aiOutputReview.js'
].filter(exists);
const runtimeCombined = runtimeFilesToScan.map(read).join('\n');

const forbiddenRuntimePatterns = [
  /OPENAI_API_KEY/i,
  /ANTHROPIC_API_KEY/i,
  /GEMINI_API_KEY/i,
  /apiKey/i,
  /dangerouslyAllowBrowser/i,
  /from\s+['"]openai['"]/i,
  /from\s+['"]@anthropic\/sdk['"]/i,
  /chat\.completions/i,
  /generateQuizDraftFromText\s*\(/i
];

for (const pattern of forbiddenRuntimePatterns) {
  assert(!pattern.test(runtimeCombined), `Runtime app code must not contain AI implementation pattern: ${pattern}`);
}

const packageText = read('package.json');
assert(!/"openai"\s*:/.test(packageText), 'package.json must not add OpenAI SDK');
assert(!/"@anthropic\/sdk"\s*:/.test(packageText), 'package.json must not add Anthropic SDK');

console.log('[validate-ai-integration-readiness] AI integration readiness docs and no-implementation guardrails passed.');
