import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload',
  'cameraFrames',
  'audioRecording',
  'biometricIdentity'
]);

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.keys(value).sort().reduce((acc, key) => {
    acc[key] = sortValue(value[key]);
    return acc;
  }, {});
}

export function assertShimeEvidenceIsSafe(value) {
  const serialized = JSON.stringify(value);
  const hits = FORBIDDEN.filter(key => serialized.includes(key));
  if (hits.length > 0) throw new Error(`Unsafe Shime evidence: ${hits.join(',')}`);
}

export function writeShimeJson(filePath, value) {
  assertShimeEvidenceIsSafe(value);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(sortValue(value), null, 2)}\n`);
  return filePath;
}

export function writeShimeMarkdown(filePath, markdown) {
  assertShimeEvidenceIsSafe({ markdown });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${markdown.trim()}\n`);
  return filePath;
}
