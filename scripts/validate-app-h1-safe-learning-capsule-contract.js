#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import {
  computeSafeLearningCapsuleChecksum,
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from '../src/deviceBridge/safeLearningCapsule.js';

const ROOT = process.cwd();

const REQUIRED_FILES = [
  'docs/planning/app-h1-safe-learning-capsule-contract-seed.md',
  'docs/device-bridge/app-h1-safe-learning-capsule-contract.md',
  'docs/release/app-h1-safe-learning-capsule-contract-summary.md',
  'scripts/validate-app-h1-safe-learning-capsule-contract.js',
  'src/deviceBridge/safeLearningCapsule.js',
  'tests/unit/safeLearningCapsule.test.js',
  'tests/fixtures/safe-learning-capsule/valid-safe-capsule.json',
  'tests/fixtures/safe-learning-capsule/invalid-raw-quiz-fields.json',
  'tests/fixtures/safe-learning-capsule/invalid-raw-rf-identifiers.json',
  'tests/fixtures/safe-learning-capsule/invalid-secret-credential-fields.json',
  'tests/fixtures/safe-learning-capsule/invalid-unknown-fields.json',
  'tests/fixtures/safe-learning-capsule/invalid-checksum.json'
];

const STATUS_TOKEN = 'APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_STATUS: APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED';
const ALLOWED_STATUS = [
  'APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED',
  'APP_H1_NEEDS_FIX',
  'APP_H1_NOT_SAFE'
];

const REQUIRED_DOC_TEXT = [
  STATUS_TOKEN,
  'checksum32(capsuleId|sourceType|safeSummaryCode)',
  'Unknown fields are invalid.',
  'Raw quiz fields rejected: Yes.',
  'Raw RF identifiers rejected: Yes.',
  'Secrets rejected: Yes.',
  'Unknown fields rejected: Yes.',
  'Malformed input rejected: Yes.',
  'Raw study content exported: No.',
  'Real device bridge enabled: No.',
  'Robot firmware changed: No.',
  'Runtime StudyRoom integration changed: No.',
  'APP-H1 does not enable real app bridge writes.',
  'APP-H1 does not modify StudyRoom runtime integration.'
];

const FORBIDDEN_SOURCE_PATTERNS = [
  /localStorage|sessionStorage|indexedDB/i,
  /fetch\s*\(|XMLHttpRequest|WebSocket|navigator\.bluetooth|navigator\.serial|mqtt/i,
  /studyRoomBridgeAdapter|DeviceBridge\(|firmware|platformio/i
];

const FORBIDDEN_FIXTURE_KEYS = [
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
  if (!fs.existsSync(fullPath)) fail(`Missing required APP-H1 file: ${file}`);
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
  const statuses = [...text.matchAll(/APP_H1_[A-Z0-9_]+/g)].map(match => match[0]);
  if (!statuses.includes('APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_DEFINED')) {
    fail('APP-H1 defined status is missing.');
  }
  for (const status of statuses) {
    if (status.endsWith('_STATUS')) continue;
    if (status === 'APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT_SEED_STATUS') continue;
    if (!ALLOWED_STATUS.includes(status) && status !== 'APP_H1_SAFE_LEARNING_CAPSULE_CONTRACT') {
      fail(`Unexpected APP-H1 status language: ${status}`);
    }
  }
}

function assertSourceIsPure() {
  const source = read('src/deviceBridge/safeLearningCapsule.js');
  for (const pattern of FORBIDDEN_SOURCE_PATTERNS) {
    if (pattern.test(source)) fail(`safeLearningCapsule.js contains forbidden runtime/device reference: ${pattern}`);
  }
}

function assertValidFixture() {
  const fixture = readJson('tests/fixtures/safe-learning-capsule/valid-safe-capsule.json');
  const validation = validateSafeLearningCapsule(fixture);
  if (!validation.ok) fail(`valid safe capsule fixture failed validation: ${JSON.stringify(validation.issues)}`);
  const keys = Object.keys(fixture).sort();
  const expected = [...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort();
  if (JSON.stringify(keys) !== JSON.stringify(expected)) fail('valid safe capsule fixture does not contain exactly the allowed fields.');
  const checksum = computeSafeLearningCapsuleChecksum(fixture);
  if (fixture.checksum !== checksum) fail(`valid safe capsule checksum mismatch: expected ${checksum}, got ${fixture.checksum}`);
}

function assertInvalidFixture(file, expectedCode) {
  const fixture = readJson(`tests/fixtures/safe-learning-capsule/${file}`);
  const validation = validateSafeLearningCapsule(fixture);
  if (validation.ok) fail(`${file} unexpectedly passed validation.`);
  if (!validation.issues.some(issue => issue.code === expectedCode)) {
    fail(`${file} missing expected issue code ${expectedCode}. Got: ${validation.issues.map(issue => issue.code).join(', ')}`);
  }
}

function assertFixturePrivacy() {
  const validText = read('tests/fixtures/safe-learning-capsule/valid-safe-capsule.json');
  for (const key of FORBIDDEN_FIXTURE_KEYS) {
    if (validText.includes(key)) fail(`valid safe capsule fixture contains forbidden key/text: ${key}`);
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
    const summary = read('docs/release/app-h1-safe-learning-capsule-contract-summary.md');
    assertIncludes('APP-H1 summary out-of-scope section', summary, [
      'Existing dirty runtime/UI/Device Bridge/robot/generated work remains separate from APP-H1.',
      'APP-H1 does not approve or include StudyRoom runtime integration'
    ]);
    warn(`APP-H1 validator noticed out-of-scope local work and confirmed it is excluded: ${outOfScope.length} file(s).`);
  }
}

function main() {
  for (const file of REQUIRED_FILES) read(file);
  const docs = [
    read('docs/planning/app-h1-safe-learning-capsule-contract-seed.md'),
    read('docs/device-bridge/app-h1-safe-learning-capsule-contract.md'),
    read('docs/release/app-h1-safe-learning-capsule-contract-summary.md')
  ].join('\n');

  assertIncludes('APP-H1 docs', docs, REQUIRED_DOC_TEXT);
  assertStatusLanguage(docs);
  assertSourceIsPure();
  assertValidFixture();
  assertInvalidFixture('invalid-raw-quiz-fields.json', 'forbidden_capsule_field');
  assertInvalidFixture('invalid-raw-rf-identifiers.json', 'forbidden_capsule_field');
  assertInvalidFixture('invalid-secret-credential-fields.json', 'forbidden_capsule_field');
  assertInvalidFixture('invalid-unknown-fields.json', 'unknown_capsule_field');
  assertInvalidFixture('invalid-checksum.json', 'checksum_mismatch');
  assertFixturePrivacy();
  assertOutOfScopeWorkSeparated();

  console.log('APP-H1 Safe Learning Capsule Contract validator passed.');
}

main();
