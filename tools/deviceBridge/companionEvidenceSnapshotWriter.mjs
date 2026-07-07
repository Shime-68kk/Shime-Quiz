import fs from 'node:fs';
import path from 'node:path';

const FORBIDDEN_ARTIFACT_KEYS = Object.freeze([
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

export function stableStringify(value) {
  return `${JSON.stringify(sortValue(value), null, 2)}\n`;
}

export function assertNoForbiddenArtifactData(value) {
  const serialized = JSON.stringify(value);
  const failures = FORBIDDEN_ARTIFACT_KEYS.filter(key => serialized.includes(`"${key}"`) || serialized.includes(key));
  if (failures.length > 0) {
    throw new Error(`Forbidden evidence artifact data: ${failures.join(',')}`);
  }
}

export function writeEvidenceJson(filePath, value) {
  assertNoForbiddenArtifactData(value);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, stableStringify(value));
  return filePath;
}

export function writeEvidenceMarkdown(filePath, markdown) {
  assertNoForbiddenArtifactData({ markdown });
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${markdown.trim()}\n`);
  return filePath;
}
