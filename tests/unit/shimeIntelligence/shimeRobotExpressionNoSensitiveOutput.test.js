import { describe, expect, it } from 'vitest';
import { runShimeExpressionStressBenchmark } from '../../../tools/shimeIntelligence/shimeExpressionStressBenchmark.mjs';
import { runShimeFusionQaHarness } from '../../../src/shimeIntelligence/shimeFusionQaHarness.js';

describe('shimeRobotExpressionNoSensitiveOutput', () => {
  it('stress and QA outputs contain no forbidden sensitive fields', () => {
    const output = {
      stress: runShimeExpressionStressBenchmark({ validCount: 100, attackCount: 20 }),
      harness: runShimeFusionQaHarness()
    };
    const serialized = JSON.stringify(output);
    ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'].forEach(key => {
      expect(serialized).not.toContain(key);
    });
  });
});
