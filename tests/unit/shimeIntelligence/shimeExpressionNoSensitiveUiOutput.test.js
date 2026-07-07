import { describe, expect, it } from 'vitest';
import { runRobotExpressionPreviewPanel } from '../../../src/components/settings/robotExpressionPreviewPanelAdapter.js';
import { runShimeFusionPanelDryRun } from '../../../src/components/settings/shimeEcosystemFusionPanelAdapter.js';

describe('shimeExpressionNoSensitiveUiOutput', () => {
  it('preview output contains no forbidden sensitive fields', () => {
    const result = runRobotExpressionPreviewPanel(runShimeFusionPanelDryRun({ fsrs: { question: 'private' } }));
    const serialized = JSON.stringify(result);
    ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'].forEach(key => {
      expect(serialized).not.toContain(key);
    });
  });
});
