import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { createStudyRoomSafeLearningCapsule } from '../../src/deviceBridge/studyRoomSafeCapsuleAdapter.js';
import { createSafeCapsuleMockExport } from '../../src/deviceBridge/safeCapsuleMockExport.js';
import { createSafeCapsulePreviewModel } from '../../src/deviceBridge/safeCapsulePreviewModel.js';

const FIXTURE_DIR = path.join(process.cwd(), 'tests/fixtures/safe-learning-capsule-adapter');

function capsuleFromFixture(name = 'derived-steady-session.json') {
  const summary = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, name), 'utf8'));
  return createStudyRoomSafeLearningCapsule(summary).capsule;
}

describe('safeCapsulePreviewModel', () => {
  it('preview includes only safe display fields', () => {
    const capsule = capsuleFromFixture();
    const exportResult = createSafeCapsuleMockExport(capsule);
    const preview = createSafeCapsulePreviewModel(capsule, exportResult);

    expect(Object.keys(preview).sort()).toEqual([
      'bridgeStatus',
      'checksumStatus',
      'companionTone',
      'exportReadyForMockRobotImport',
      'focusNeedBucket',
      'learningStateBucket',
      'privacyClass',
      'recommendedCompanionAction',
      'reviewUrgencyBucket',
      'safeSummaryCode',
      'sessionEnergyBucket',
      'sessionMoodBucket',
      'studyLoadBucket'
    ].sort());
    expect(preview.bridgeStatus).toBe('mock_only_not_connected');
  });

  it('preview never shows raw question, answer, history, or source text', () => {
    const capsule = capsuleFromFixture();
    const preview = createSafeCapsulePreviewModel(capsule, createSafeCapsuleMockExport(capsule));
    const text = JSON.stringify(preview);

    expect(text).not.toMatch(/prompt|question|answer|correctAnswer|explanation|userAnswer|studyHistory|sourceMetadata|documentText|cardId|deckId/i);
  });

  it('checksum status is displayed', () => {
    const capsule = capsuleFromFixture();
    const validPreview = createSafeCapsulePreviewModel(capsule, createSafeCapsuleMockExport(capsule));
    const invalidPreview = createSafeCapsulePreviewModel({ ...capsule, checksum: 'ffffffff' }, null);

    expect(validPreview.checksumStatus).toBe('valid');
    expect(invalidPreview.checksumStatus).toBe('invalid');
  });

  it('source does not call network, storage, transport, or live device APIs', () => {
    const source = fs.readFileSync(path.join(process.cwd(), 'src/deviceBridge/safeCapsulePreviewModel.js'), 'utf8');

    expect(source).not.toMatch(/localStorage|sessionStorage|indexedDB/i);
    expect(source).not.toMatch(/fetch\s*\(|XMLHttpRequest|navigator\.serial|navigator\.bluetooth|mqtt/i);
    expect(source).not.toMatch(/new\s+DeviceBridge|StudyRoom\.jsx/i);
  });
});
