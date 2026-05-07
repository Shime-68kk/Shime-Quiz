#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');
const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

const statusPath = 'docs/release-candidate-status.md';
assert(exists(statusPath), 'docs/release-candidate-status.md must exist');
assert(exists('RELEASE_QA_V2.md'), 'RELEASE_QA_V2.md must exist');
assert(exists('package.json'), 'package.json must exist');

const status = exists(statusPath) ? read(statusPath) : '';
const qa = exists('RELEASE_QA_V2.md') ? read('RELEASE_QA_V2.md') : '';
const pkg = exists('package.json') ? JSON.parse(read('package.json')) : {};

assert(pkg.version === '2.0.0-beta-ai.1', 'package version must remain 2.0.0-beta-ai.1');
assert(qa.includes('Phase 8G'), 'RELEASE_QA_V2.md must include Phase 8G');
assert(status.includes('Phase 8F'), 'release status must mention Phase 8F');
assert(/Phase 8F\.1[^\n]*(PARTIAL|pending|manual Ubuntu browser smoke still pending)/i.test(status), 'release status must state Phase 8F.1 is partial/pending, not passed');
assert(!/Phase 8F\.1[^\n]*(status:\s*PASS|is\s+PASS|browser smoke passed)/i.test(status), 'release status must not claim Phase 8F.1 passed');
assert(/EduGen[^\n]*(separate|not bundled)|not bundled into Shime/i.test(status), 'release status must state EduGen is separate/not bundled');
assert(status.includes('VITE_FILE_PROCESSOR_URL') || /browser-reachable EduGen/i.test(status), 'release status must mention VITE_FILE_PROCESSOR_URL or browser-reachable EduGen');
assert(/built-in AI quiz generation/i.test(status), 'release status must forbid built-in AI generation claims');
assert(/external AI\/API calls|external AI API/i.test(status), 'release status must forbid external AI/API call claims');
assert(/OCR/i.test(status), 'release status must forbid OCR claims');
assert(/manual smoke checklist|Final manual smoke checklist/i.test(status), 'release status must include a final manual smoke checklist');
assert(/JSON import/i.test(status) && /CSV import/i.test(status), 'release status must include JSON and CSV import paths');
assert(/Paste text\/Markdown/i.test(status) || /text\/Markdown draft import/i.test(status), 'release status must include text/Markdown import path');
assert(/\.txt.*\.md|\.md.*\.txt/i.test(status), 'release status must include .txt/.md import path');
assert(/PDF\/DOCX\/PPTX\/ZIP/i.test(status), 'release status must include EduGen PDF/DOCX/PPTX/ZIP import path');
assert(/user confirms save|user-confirmed save/i.test(status), 'release status must preserve user-confirmed save boundary');

if (failures.length > 0) {
  console.error('validate-release-candidate-status failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('validate-release-candidate-status: PASS');
console.log('- release candidate status doc exists');
console.log('- Phase 8F.1 remains partial/pending');
console.log('- EduGen, AI, OCR, deployment, and manual-smoke caveats are documented');
console.log('- package version unchanged');
