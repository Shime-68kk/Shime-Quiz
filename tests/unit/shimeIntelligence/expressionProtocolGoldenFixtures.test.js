import { describe, expect, it } from 'vitest';
import { createExpressionProtocolGoldenFixtures } from '../../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { ALLOWED_ROBOT_EXPRESSION_FAMILIES } from '../../../src/shimeIntelligence/robotExpressionContract.js';

const forbidden = ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'];

describe('expressionProtocolGoldenFixtures', () => {
  it('includes every expression family and rejects invalid fixtures', () => {
    const fixtures = createExpressionProtocolGoldenFixtures();
    const validFamilies = fixtures.fixtures.filter(fixture => fixture.validExpected).map(fixture => fixture.envelope.expressionFamily);
    ALLOWED_ROBOT_EXPRESSION_FAMILIES.forEach(family => expect(validFamilies).toContain(family));
    expect(fixtures.allValidFixturesPass).toBe(true);
    expect(fixtures.allInvalidFixturesReject).toBe(true);
  });

  it('keeps valid fixtures free of forbidden sensitive fields', () => {
    const validSerialized = JSON.stringify(createExpressionProtocolGoldenFixtures().fixtures.filter(fixture => fixture.validExpected));
    forbidden.forEach(key => expect(validSerialized).not.toContain(key));
  });
});

