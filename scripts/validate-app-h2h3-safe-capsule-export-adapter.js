#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  computeSafeLearningCapsuleChecksum,
  validateSafeLearningCapsule
} from '../src/deviceBridge/safeLearningCapsule.js';
import { createStudyRoomSafeLearningCapsule } from '../src/deviceBridge/studyRoomSafeCapsuleAdapter.js';
import { createSafeCapsuleMockExport } from '../src/deviceBridge/safeCapsuleMockExport.js';
import { createSafeCapsulePreviewModel } from '../src/deviceBridge/safeCapsulePreviewModel.js';

const ROOT = process.cwd();
const FIXTURE_DIR = 'tests/fixtures/safe-learning-capsule-adapter';

const REQUIRED_FILES = [
  'docs/device-bridge/app-h1-safe-learning-capsule-contract.md',
  'docs/device-bridge/app-h2h3-studyroom-safe-capsule-export-adapter.md',
  'docs/release/app-h2h3-studyroom-safe-capsule-export-adapter-summary.md',
  'docs/testing/app-h2h3-safe-capsule-export-test-matrix.md',
  'scripts/validate-app-h2h3-safe-capsule-export-adapter.js',
  'src/deviceBridge/safeLearningCapsule.js',
  'src/deviceBridge/studyRoomSafeCapsuleAdapter.js',
  'src/deviceBridge/safeCapsuleMockExport.js',
  'src/deviceBridge/safeCapsulePreviewModel.js',
  'tests/unit/safeLearningCapsule.test.js',
  'tests/unit/studyRoomSafeCapsuleAdapter.test.js',
  'tests/unit/safeCapsuleMockExport.test.js',
  'tests/unit/safeCapsulePreviewModel.test.js',
  `${FIXTURE_DIR}/derived-steady-session.json`,
  `${FIXTURE_DIR}/derived-struggling-session.json`,
  `${FIXTURE_DIR}/derived-high-review-pressure.json`,
  `${FIXTURE_DIR}/derived-low-energy-long-session.json`,
  `${FIXTURE_DIR}/invalid-raw-question-input.json`,
  `${FIXTURE_DIR}/invalid-raw-answer-input.json`,
  `${FIXTURE_DIR}/invalid-study-history-input.json`,
  `${FIXTURE_DIR}/invalid-source-metadata-input.json`,
  `${FIXTURE_DIR}/invalid-document-text-input.json`,
  `${FIXTURE_DIR}/invalid-card-id-input.json`,
  `${FIXTURE_DIR}/invalid-rf-identifier-input.json`,
  `${FIXTURE_DIR}/invalid-secret-input.json`,
  `${FIXTURE_DIR}/invalid-unknown-field-input.json`
];

const REQUIRED_DOC_TEXT = [
  'APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS: APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED',
  'This phase does not approve Beta Ready.',
  'This phase does not enable a real robot bridge.',
  'This phase does not send data to ESP32.',
  'This phase does not change firmware.',
  'This phase does not export raw quiz, app, study, source, document, RF, credential, token, secret, password, email, username, or local file path data.',
  'Real bridge work must be a later gated/manual phase.',
  'checksum32(capsuleId|sourceType|safeSummaryCode)',
  'Compatible with R5X19.2 mock import: Yes.',
  'Real device bridge enabled: No.',
  'Serial/WebSocket enabled: No.',
  'Cloud/backend/telemetry enabled: No.',
  'Robot firmware changed: No.',
  'StudyRoom runtime changed: No.',
  'UI changed: No.'
];

const REQUIRED_ALLOWED_FIELD_TEXT = SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.map(field => `\`${field}\``);

const FORBIDDEN_DOC_EXAMPLES = [
  '`prompt`',
  '`question`',
  '`answer`',
  '`correctAnswer`',
  '`explanation`',
  '`userAnswer`',
  '`sourceMetadata`',
  '`studyHistory`',
  '`importedDocumentText`',
  '`SSID`',
  '`BSSID`',
  '`MAC`',
  '`tokens`',
  '`secrets`',
  '`passwords`'
];

const SOURCE_FILES = [
  'src/deviceBridge/studyRoomSafeCapsuleAdapter.js',
  'src/deviceBridge/safeCapsuleMockExport.js',
  'src/deviceBridge/safeCapsulePreviewModel.js'
];

const FORBIDDEN_SOURCE_PATTERNS = [
  /\bSerial\b/,
  /\bWebSocket\b/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /\bBLE\b/,
  /\bBluetooth\b/,
  /\bWiFi\b/,
  /localStorage/,
  /navigator\.serial/,
  /navigator\.bluetooth/,
  /new\s+DeviceBridge/,
  /StudyRoom\.jsx/
];

const FORBIDDEN_SAFE_FIXTURE_TEXT = [
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'rawQuizPayload',
  'importedDocumentText',
  'documentText',
  'rawFsrsLogs',
  'cardId',
  'deckId',
  'fileName',
  'filePath',
  'email',
  'username',
  'ssid',
  'bssid',
  'mac',
  'token',
  'secret',
  'password'
];

function fail(message) {
  console.error(message);
  process.exit(1);
}

function warn(message) {
  console.warn(message);
}

function read(file) {
  const fullPath = path.join(ROOT, file);
  if (!fs.existsSync(fullPath)) fail(`Missing required APP-H2/H3 file: ${file}`);
  return fs.readFileSync(fullPath, 'utf8');
}

function readJson(file) {
  return JSON.parse(read(file));
}

function assertIncludes(label, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) fail(`${label} missing required text: ${needle}`);
  }
}

function gitLines(args) {
  try {
    return execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })
      .trim()
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

function assertDocs() {
  const docs = [
    read('docs/device-bridge/app-h2h3-studyroom-safe-capsule-export-adapter.md'),
    read('docs/release/app-h2h3-studyroom-safe-capsule-export-adapter-summary.md'),
    read('docs/testing/app-h2h3-safe-capsule-export-test-matrix.md')
  ].join('\n');

  assertIncludes('APP-H2/H3 docs', docs, REQUIRED_DOC_TEXT);
  assertIncludes('allowed capsule fields', docs, REQUIRED_ALLOWED_FIELD_TEXT);
  assertIncludes('forbidden field examples', docs, FORBIDDEN_DOC_EXAMPLES);

  const allowedStatuses = new Set([
    'APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS',
    'APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER',
    'APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED',
    'APP_H2H3_SAFE_CAPSULE_EXPORT_TEST_MATRIX_STATUS',
    'APP_H2H3_TEST_MATRIX_DEFINED',
    'APP_H2H3_NEEDS_FIX',
    'APP_H2H3_NOT_SAFE'
  ]);
  const statuses = [...docs.matchAll(/APP_H2H3_[A-Z0-9_]+/g)].map(match => match[0]);
  if (!statuses.includes('APP_H2H3_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED')) {
    fail('APP-H2/H3 defined status is missing.');
  }
  for (const status of statuses) {
    if (!allowedStatuses.has(status)) fail(`Unexpected APP-H2/H3 status token: ${status}`);
  }
}

function assertSourcePurity() {
  SOURCE_FILES.forEach(file => {
    const source = read(file);
    FORBIDDEN_SOURCE_PATTERNS.forEach(pattern => {
      if (pattern.test(source)) fail(`${file} contains forbidden source pattern: ${pattern}`);
    });
  });
}

function assertFixtures() {
  [
    'derived-steady-session.json',
    'derived-struggling-session.json',
    'derived-high-review-pressure.json',
    'derived-low-energy-long-session.json'
  ].forEach(file => {
    const text = read(`${FIXTURE_DIR}/${file}`);
    FORBIDDEN_SAFE_FIXTURE_TEXT.forEach(term => {
      if (text.includes(term)) fail(`Safe derived fixture ${file} contains forbidden text: ${term}`);
    });
  });
}

function assertAdapterAndExport() {
  const steady = createStudyRoomSafeLearningCapsule(readJson(`${FIXTURE_DIR}/derived-steady-session.json`));
  if (!steady.ok) fail(`steady fixture failed adapter export: ${JSON.stringify(steady.issues)}`);
  if (!validateSafeLearningCapsule(steady.capsule).ok) fail('steady capsule failed APP-H1 validation');
  if (steady.capsule.checksum !== computeSafeLearningCapsuleChecksum(steady.capsule)) {
    fail('steady capsule checksum does not match APP-H1/robot rule');
  }
  if (JSON.stringify(Object.keys(steady.capsule).sort()) !== JSON.stringify([...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort())) {
    fail('adapter output does not contain exactly APP-H1 allowed fields');
  }
  if (steady.capsule.capsuleId === readJson(`${FIXTURE_DIR}/derived-steady-session.json`).sessionIdBucket) {
    fail('adapter capsuleId must not equal sessionIdBucket');
  }

  const mockExport = createSafeCapsuleMockExport(steady.capsule);
  if (!mockExport.ok) fail(`mock export failed: ${JSON.stringify(mockExport.issues)}`);
  if (mockExport.envelope.realBridgeEnabled !== false || mockExport.envelope.transportEnabled !== false) {
    fail('mock export must keep bridge and transport disabled');
  }
  const preview = createSafeCapsulePreviewModel(steady.capsule, mockExport);
  if (preview.bridgeStatus !== 'mock_only_not_connected') fail('preview bridge status must be mock_only_not_connected');
  if (preview.checksumStatus !== 'valid') fail('preview checksum status must be valid');

  [
    ['invalid-raw-question-input.json', 'app_quiz_field'],
    ['invalid-raw-answer-input.json', 'app_quiz_field'],
    ['invalid-study-history-input.json', 'app_history_field'],
    ['invalid-source-metadata-input.json', 'raw_identifier'],
    ['invalid-document-text-input.json', 'document_text_field'],
    ['invalid-card-id-input.json', 'raw_identifier'],
    ['invalid-rf-identifier-input.json', 'rf_identifier'],
    ['invalid-secret-input.json', 'credential_or_secret'],
    ['invalid-unknown-field-input.json', 'unknown_unsafe_field']
  ].forEach(([file, category]) => {
    const result = createStudyRoomSafeLearningCapsule(readJson(`${FIXTURE_DIR}/${file}`));
    if (result.ok) fail(`${file} unexpectedly exported a capsule`);
    if (!result.issues.some(issue => issue.category === category)) {
      fail(`${file} missing expected safe category ${category}`);
    }
  });
}

function assertOutOfScopeWorkSeparated() {
  const files = Array.from(new Set([
    ...gitLines(['diff', '--name-only']),
    ...gitLines(['diff', '--cached', '--name-only']),
    ...gitLines(['ls-files', '--others', '--exclude-standard'])
  ]));
  const outOfScope = files.filter(file => (
    /^(dist|node_modules|test-results|firmware)\//.test(file) ||
    /^src\/routes\/StudyRoom\.jsx$/.test(file) ||
    /^src\/components\//.test(file) ||
    /^src\/styles\//.test(file)
  ));
  if (outOfScope.length > 0) {
    const summary = read('docs/release/app-h2h3-studyroom-safe-capsule-export-adapter-summary.md');
    assertIncludes('APP-H2/H3 summary out-of-scope section', summary, [
      'Existing dirty runtime/UI/Device Bridge/robot/generated work remains separate from APP-H2/H3.',
      'APP-H2/H3 does not approve or include real Device Bridge transport'
    ]);
    warn(`APP-H2/H3 validator noticed out-of-scope local work and confirmed it is excluded: ${outOfScope.length} file(s).`);
  }
}

function main() {
  REQUIRED_FILES.forEach(read);
  assertDocs();
  assertSourcePurity();
  assertFixtures();
  assertAdapterAndExport();
  assertOutOfScopeWorkSeparated();
  console.log('APP-H2/H3 Safe Capsule Export Adapter validator passed.');
}

main();
