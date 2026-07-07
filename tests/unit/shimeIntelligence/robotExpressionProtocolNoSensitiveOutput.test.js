import { describe, expect, it } from 'vitest';
import { runRobotExpressionProtocolPipeline } from '../../../src/shimeIntelligence/robotExpressionProtocolPipeline.js';

const forbidden = [
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
];

describe('robotExpressionProtocolNoSensitiveOutput', () => {
  it('does not include forbidden keys in valid protocol output', () => {
    const result = runRobotExpressionProtocolPipeline({ fsrs: { dueCount: 4 }, robotProfile: { supportsDisplay: true, motionLocked: true } });
    const serialized = JSON.stringify(result);
    forbidden.forEach(key => {
      expect(serialized).not.toContain(key);
    });
  });
});

