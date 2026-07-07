import { describe, expect, it } from 'vitest';
import { createCompanionEvidenceBenchmark } from '../../tools/deviceBridge/companionEvidenceBenchmark.mjs';
import { createCompanionV2VsLegacyComparisonReport } from '../../tools/deviceBridge/companionV2VsLegacyComparisonReport.mjs';

const FORBIDDEN = ['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'sourceMetadata', 'settings', 'studyHistory', 'backupPayload', 'importedDocumentText', 'libraryItemContent', 'rawQuizPayload', 'cameraFrames', 'audioRecording', 'biometricIdentity'];

describe('companionV2ReportPrivacy', () => {
  it('keeps generated evidence and comparison reports free of forbidden fields', () => {
    const report = createCompanionEvidenceBenchmark({ count: 1000, attackCount: 120, seed: 45 });
    const comparison = createCompanionV2VsLegacyComparisonReport();
    const serialized = JSON.stringify({
      summary: report.summary,
      golden: report.golden,
      coverage: report.coverage,
      readiness: report.readiness,
      auditSample: report.auditSample,
      comparison
    });
    FORBIDDEN.forEach(key => expect(serialized).not.toContain(key));
  });
});
