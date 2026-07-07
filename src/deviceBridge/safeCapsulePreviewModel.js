import { computeSafeLearningCapsuleChecksum, validateSafeLearningCapsule } from './safeLearningCapsule.js';

export function createSafeCapsulePreviewModel(capsule, mockExportResult = null) {
  const validation = validateSafeLearningCapsule(capsule);
  const expectedChecksum = computeSafeLearningCapsuleChecksum(capsule);

  return {
    learningStateBucket: capsule?.learningStateBucket ?? 'unknown',
    studyLoadBucket: capsule?.studyLoadBucket ?? 'none',
    reviewUrgencyBucket: capsule?.reviewUrgencyBucket ?? 'none',
    sessionMoodBucket: capsule?.sessionMoodBucket ?? 'unknown',
    sessionEnergyBucket: capsule?.sessionEnergyBucket ?? 'unknown',
    focusNeedBucket: capsule?.focusNeedBucket ?? 'none',
    recommendedCompanionAction: capsule?.recommendedCompanionAction ?? 'none',
    companionTone: capsule?.companionTone ?? 'quiet',
    safeSummaryCode: capsule?.safeSummaryCode ?? 'NO_SIGNAL',
    privacyClass: capsule?.privacyClass ?? 'redacted_coarse_only',
    checksumStatus: validation.ok && capsule?.checksum === expectedChecksum ? 'valid' : 'invalid',
    bridgeStatus: 'mock_only_not_connected',
    exportReadyForMockRobotImport: Boolean(mockExportResult?.summary?.exportReadyForMockRobotImport)
  };
}
