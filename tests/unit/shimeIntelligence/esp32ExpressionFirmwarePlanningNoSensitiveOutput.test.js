import { describe, expect, it } from 'vitest';
import { createExpressionProtocolGoldenFixtures } from '../../../src/shimeIntelligence/expressionProtocolGoldenFixtures.js';
import { createEsp32ExpressionSerialQaKit } from '../../../src/shimeIntelligence/esp32ExpressionSerialQaKit.js';
import { createEsp32ExpressionExpectedLogs } from '../../../src/shimeIntelligence/esp32ExpressionExpectedLogs.js';

const forbidden = ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'];

describe('esp32ExpressionFirmwarePlanningNoSensitiveOutput', () => {
  it('keeps valid payloads and expected valid logs free of forbidden sensitive names', () => {
    const fixtures = createExpressionProtocolGoldenFixtures();
    const kit = createEsp32ExpressionSerialQaKit(fixtures);
    const logs = createEsp32ExpressionExpectedLogs(fixtures);
    const validOnly = JSON.stringify({
      payloads: kit.validPayloads,
      logs: logs.logs.filter(log => log.expectedStatus === 'ACCEPT')
    });
    forbidden.forEach(key => expect(validOnly).not.toContain(key));
  });
});

