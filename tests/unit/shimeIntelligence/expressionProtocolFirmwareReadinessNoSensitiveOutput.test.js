import { describe, expect, it } from 'vitest';
import { createExpressionProtocolGoldenFixtures } from '../../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';

const forbidden = ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'];

describe('expressionProtocolFirmwareReadinessNoSensitiveOutput', () => {
  it('does not include forbidden sensitive names in valid readiness outputs', () => {
    const serialized = JSON.stringify(createExpressionProtocolGoldenFixtures().fixtures.filter(fixture => fixture.validExpected));
    forbidden.forEach(key => expect(serialized).not.toContain(key));
  });
});

