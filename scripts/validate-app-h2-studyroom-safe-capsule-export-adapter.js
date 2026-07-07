#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from '../src/deviceBridge/safeLearningCapsule.js';
import {
  createStudyRoomSafeLearningCapsule,
  STUDYROOM_SAFE_SUMMARY_ALLOWED_FIELDS
} from '../src/deviceBridge/studyRoomSafeCapsuleAdapter.js';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  'docs/device-bridge/app-h1-safe-learning-capsule-contract.md',
  'src/deviceBridge/safeLearningCapsule.js',
  'tests/unit/safeLearningCapsule.test.js',
  'docs/device-bridge/app-h2-studyroom-safe-capsule-export-adapter.md',
  'docs/release/app-h2-studyroom-safe-capsule-export-adapter-summary.md',
  'scripts/validate-app-h2-studyroom-safe-capsule-export-adapter.js',
  'src/deviceBridge/studyRoomSafeCapsuleAdapter.js',
  'tests/unit/studyRoomSafeCapsuleAdapter.test.js',
  'tests/fixtures/studyroom-safe-capsule-adapter/valid-derived-summary.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-raw-question.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-raw-answer.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-study-history.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-source-metadata.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-document-text.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-rf-fields.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-secrets.json',
  'tests/fixtures/studyroom-safe-capsule-adapter/invalid-unknown-field.json'
];

const STATUS_TOKEN = 'APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS: APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED';

const REQUIRED_DOC_TEXT = [
  STATUS_TOKEN,
  'checksum32(capsuleId|sourceType|safeSummaryCode)',
  'APP-H2 does not wire into `src/routes/StudyRoom.jsx`.',
  'APP-H2 does not export capsules to a device.',
  'APP-H2 does not enable serial, WebSocket, Bluetooth, MQTT, or robot transport.',
  'APP-H2 does not modify firmware.',
  'StudyRoom safe capsule adapter added: Yes.',
  'Raw quiz fields rejected: Yes.',
  'Raw study history rejected: Yes.',
  'Raw document text rejected: Yes.',
  'Raw RF identifiers rejected: Yes.',
  'Secrets rejected: Yes.',
  'Output allowed fields only: Yes.',
  'Robot checksum rule preserved: Yes.',
  'Real device bridge enabled: No.',
  'Serial/WebSocket enabled: No.',
  'Robot firmware changed: No.',
  'StudyRoom runtime changed: No.'
];

const FORBIDDEN_SOURCE_PATTERNS = [
  /localStorage|sessionStorage|indexedDB/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.serial|navigator\.bluetooth|mqtt/i,
  /new\s+DeviceBridge|connect\s*\(|send\s*\(|write\s*\(|firmware|platformio/i,
  /routes\/StudyRoom|StudyRoom\.jsx/i
];

const FORBIDDEN_VALID_OUTPUT_TEXT = [
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
  'rawFsrsReviewLogs',
  'cardId',
  'itemId',
  'perCardId',
  'SSID',
  'BSSID',
  'MAC',
  'rawAPLists',
  'credentials',
  'tokens',
  'secrets',
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
  if (!fs.existsSync(fullPath)) fail(`Missing required APP-H2 file: ${file}`);
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

function assertStatusLanguage(text) {
  const allowed = new Set([
    'APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_STATUS',
    'APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER',
    'APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED',
    'APP_H2_NEEDS_FIX',
    'APP_H2_NOT_SAFE'
  ]);
  const statuses = [...text.matchAll(/APP_H2_[A-Z0-9_]+/g)].map(match => match[0]);
  if (!statuses.includes('APP_H2_STUDYROOM_SAFE_CAPSULE_EXPORT_ADAPTER_DEFINED')) {
    fail('APP-H2 defined status is missing.');
  }
  for (const status of statuses) {
    if (!allowed.has(status)) fail(`Unexpected APP-H2 status language: ${status}`);
  }
}

function assertAdapterSourceIsPure() {
  const source = read('src/deviceBridge/studyRoomSafeCapsuleAdapter.js');
  for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
    if (pattern.test(source)) fail(`studyRoomSafeCapsuleAdapter.js contains forbidden runtime/device reference: ${pattern}`);
  }
  assertIncludes('adapter source', source, [
    'createSafeLearningCapsule',
    'validateSafeLearningCapsule',
    'SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS'
  ]);
}

function assertAllowedInputFields() {
  const required = [
    'correctCount',
    'incorrectCount',
    'totalCount',
    'dueReviewCount',
    'dueReviewCountBucket',
    'durationMs',
    'sessionDurationBucket',
    'recentAccuracyBucket',
    'userEnergySelfReportBucket',
    'focusNeedSignalBucket',
    'monotonicImportId'
  ];
  for (const field of required) {
    if (!STUDYROOM_SAFE_SUMMARY_ALLOWED_FIELDS.includes(field)) {
      fail(`adapter allowed input fields missing ${field}`);
    }
  }
}

function assertValidDerivedSummary() {
  const summary = readJson('tests/fixtures/studyroom-safe-capsule-adapter/valid-derived-summary.json');
  const result = createStudyRoomSafeLearningCapsule(summary);
  if (!result.ok) fail(`valid derived summary failed export: ${JSON.stringify(result.issues)}`);
  const capsuleValidation = validateSafeLearningCapsule(result.capsule);
  if (!capsuleValidation.ok) fail(`exported capsule failed APP-H1 validation: ${JSON.stringify(capsuleValidation.issues)}`);
  const keys = Object.keys(result.capsule).sort();
  const expected = [...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) fail('exported capsule does not contain exactly APP-H1 allowed fields.');
  const outputText = JSON.stringify(result.capsule);
  for (const forbidden of FORBIDDEN_VALID_OUTPUT_TEXT) {
    if (outputText.includes(forbidden)) fail(`exported capsule contains forbidden text: ${forbidden}`);
  }
}

function assertInvalidFixture(file, expectedCode) {
  const result = createStudyRoomSafeLearningCapsule(readJson(`tests/fixtures/studyroom-safe-capsule-adapter/${file}`));
  if (result.ok) fail(`${file} unexpectedly exported a capsule.`);
  if (!result.issues.some(issue => issue.code === expectedCode)) {
    fail(`${file} missing expected issue code ${expectedCode}. Got: ${result.issues.map(issue => issue.code).join(', ')}`);
  }
}

function assertOutOfScopeWorkSeparated() {
  const files = Array.from(new Set([
    ...gitLines(['diff', '--name-only']),
    ...gitLines(['diff', '--cached', '--name-only']),
    ...gitLines(['ls-files', '--others', '--exclude-standard'])
  ]));
  const outOfScope = files.filter(file => /^(dist|node_modules|test-results|firmware)\//.test(file) || /^src\/routes\/StudyRoom\.jsx$/.test(file));
  if (outOfScope.length > 0) {
    const summary = read('docs/release/app-h2-studyroom-safe-capsule-export-adapter-summary.md');
    assertIncludes('APP-H2 summary out-of-scope section', summary, [
      'Existing dirty runtime/UI/Device Bridge/robot/generated work remains separate from APP-H2.',
      'APP-H2 does not approve or include StudyRoom runtime integration'
    ]);
    warn(`APP-H2 validator noticed out-of-scope local work and confirmed it is excluded: ${outOfScope.length} file(s).`);
  }
}

function main() {
  for (const file of REQUIRED_FILES) read(file);
  const docs = [
    read('docs/device-bridge/app-h1-safe-learning-capsule-contract.md'),
    read('docs/device-bridge/app-h2-studyroom-safe-capsule-export-adapter.md'),
    read('docs/release/app-h2-studyroom-safe-capsule-export-adapter-summary.md')
  ].join('\n');

  assertIncludes('APP-H2 docs', docs, REQUIRED_DOC_TEXT);
  assertStatusLanguage(docs);
  assertAdapterSourceIsPure();
  assertAllowedInputFields();
  assertValidDerivedSummary();
  assertInvalidFixture('invalid-raw-question.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-raw-answer.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-study-history.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-source-metadata.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-document-text.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-rf-fields.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-secrets.json', 'forbidden_studyroom_summary_field');
  assertInvalidFixture('invalid-unknown-field.json', 'unknown_studyroom_summary_field');
  assertOutOfScopeWorkSeparated();

  console.log('APP-H2 StudyRoom Safe Capsule Export Adapter validator passed.');
}

main();
