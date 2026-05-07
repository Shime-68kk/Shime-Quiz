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

const planPath = 'docs/ai-quiz-draft-generation-plan.md';
const safetyPath = 'docs/ai-safety-and-privacy-contract.md';
const releaseQaPath = 'RELEASE_QA_V2.md';
const workflowPath = '.github/workflows/e2e-smoke.yml';

assert(exists(planPath), `${planPath} must exist`);
assert(exists(safetyPath), `${safetyPath} must exist`);
assert(exists(releaseQaPath), `${releaseQaPath} must exist`);
assert(exists(workflowPath), `${workflowPath} must exist`);

const plan = read(planPath);
const safety = read(safetyPath);
const releaseQa = read(releaseQaPath);
const workflow = read(workflowPath);
const combined = `${plan}\n${safety}\n${releaseQa}`;

const requiredPlanPhrases = [
  'planning/spec only',
  'does **not** support working AI quiz generation yet',
  'preview before save',
  'import validation',
  'advisory quality review',
  'Option A',
  'Option B',
  'Option C',
  'Phase 8B',
  'Phase 8C',
  'Phase 8D',
  'Phase 8E',
];

for (const phrase of requiredPlanPhrases) {
  assert(plan.includes(phrase), `${planPath} must include: ${phrase}`);
}

const requiredSafetyPhrases = [
  'Explicit consent before sending content to AI',
  'Preview before save',
  'Existing validation remains mandatory',
  'No learning-state writes from AI',
  'Honest privacy disclosure',
  'BYOK',
  'Backend proxy',
  'Prompt templates',
  'AI may make mistakes',
  'Private documents never leave the device',
];

for (const phrase of requiredSafetyPhrases) {
  assert(safety.includes(phrase), `${safetyPath} must include: ${phrase}`);
}

const forbiddenImplementationSignals = [
  'openai.chat.completions.create',
  'new OpenAI(',
  'fetch("https://api.openai.com',
  "fetch('https://api.openai.com",
  'VITE_OPENAI_API_KEY',
  'OPENAI_API_KEY=',
];

for (const signal of forbiddenImplementationSignals) {
  assert(!combined.includes(signal), `Planning docs must not include implementation/API-key signal: ${signal}`);
}

assert(releaseQa.includes('Phase 8A'), 'RELEASE_QA_V2.md must mention Phase 8A');
assert(releaseQa.includes('planning/spec only'), 'RELEASE_QA_V2.md must say Phase 8A is planning/spec only');
assert(releaseQa.includes('does not add working AI generation'), 'RELEASE_QA_V2.md must avoid AI support overclaim');
assert(workflow.includes('node scripts/validate-ai-planning-docs.js'), 'CI workflow must run validate-ai-planning-docs');

console.log('[validate-ai-planning-docs] PASS');
