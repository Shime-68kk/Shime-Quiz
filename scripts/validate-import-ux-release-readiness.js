#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function read(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertIncludes(content, needle, label) {
  assert(content.includes(needle), `${label} should include: ${needle}`);
}

const library = read('src/routes/Library.jsx');
const fileProcessorClient = read('src/services/fileProcessorClient.js');
const readinessDocPath = 'docs/import-readiness-checklist.md';
const edugenDocPath = 'docs/edugen-document-draft-integration.md';
const qualityDocPath = 'docs/quiz-draft-quality-review.md';
const releaseQa = read('RELEASE_QA_V2.md');
const workflow = read('.github/workflows/e2e-smoke.yml');

assert(fs.existsSync(readinessDocPath), 'import readiness checklist should exist');
assert(fs.existsSync(edugenDocPath), 'EduGen document integration doc should exist');
assert(fs.existsSync(qualityDocPath), 'quality review doc should exist');

const readinessDoc = read(readinessDocPath);
const edugenDoc = read(edugenDocPath);
const qualityDoc = read(qualityDocPath);
const combinedDocsAndUi = [library, fileProcessorClient, readinessDoc, edugenDoc, qualityDoc, releaseQa].join('\n');

for (const text of [
  'Chọn cách nhập phù hợp',
  'Tạo quiz từ văn bản/Markdown',
  'Tạo quiz từ file văn bản/Markdown',
  'Tạo quiz từ tài liệu',
  'PDF, DOCX, PPTX hoặc ZIP',
  'VITE_FILE_PROCESSOR_URL',
  'EduGen chỉ trích xuất chữ'
]) {
  assertIncludes(library, text, 'Library import UX');
}

assertIncludes(fileProcessorClient, 'Không kết nối được EduGen File Processor', 'EduGen unavailable error');
assertIncludes(fileProcessorClient, 'CORS', 'EduGen unavailable guidance');
assertIncludes(fileProcessorClient, 'VITE_FILE_PROCESSOR_URL', 'EduGen unavailable guidance');
assertIncludes(fileProcessorClient, 'Không tìm thấy nội dung chữ trong tài liệu.', 'empty extraction message');
assertIncludes(fileProcessorClient, 'Chỉ hỗ trợ file PDF, DOCX, PPTX hoặc ZIP trong bước này.', 'unsupported document message');
assert(!fileProcessorClient.includes('stack'), 'EduGen client should not surface raw stack traces');

for (const text of [
  'PORT=3001 npm start',
  'VITE_FILE_PROCESSOR_URL=http://localhost:3001 npm run build',
  'npm run preview',
  'Vercel/Netlify/static Shime frontend does not include EduGen',
  'quality review panel',
  'no auto-save',
  'save/import only happens after user confirmation'
]) {
  assertIncludes(readinessDoc, text, 'import readiness checklist');
}

for (const text of [
  'Phase 7G',
  'No new import file types',
  'manual smoke checklist'
]) {
  assertIncludes(releaseQa, text, 'release QA Phase 7G note');
}

for (const text of [
  'validate-import-ux-release-readiness.js',
  'validate-quiz-draft-quality.js',
  'validate-edugen-document-integration.js',
  'validate-text-file-import.js'
]) {
  assertIncludes(workflow, text, 'CI workflow');
}

const forbiddenPositivePatterns = [
  /OCR\s+(is|đã|duoc|được)\s+(supported|hỗ trợ|them|thêm)/i,
  /AI\s+(quiz\s+generation|tạo quiz)\s+(is|đã|duoc|được)?\s*(supported|hỗ trợ|them|thêm)/i,
  /legacy\s+\.doc\/?\.ppt\s+(is|are)\s+supported/i,
  /\.doc\s+và\s+\.ppt\s+được\s+hỗ\s+trợ/i
];
for (const pattern of forbiddenPositivePatterns) {
  assert(!pattern.test(combinedDocsAndUi), `should not include unsupported positive claim matching ${pattern}`);
}

assert(/OCR/i.test(combinedDocsAndUi), 'unsupported OCR caveat should be documented');
assert(/AI/i.test(combinedDocsAndUi), 'unsupported AI caveat should be documented');
assert(/\.doc/.test(combinedDocsAndUi) && /\.ppt/.test(combinedDocsAndUi), 'legacy .doc/.ppt unsupported caveat should be documented');

console.log('Import UX/release readiness validator passed.');
