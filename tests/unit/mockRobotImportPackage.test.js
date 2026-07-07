import { describe, expect, it } from 'vitest';
import { createSafeLearningCapsule } from '../../src/deviceBridge/safeLearningCapsule.js';
import {
  createMockRobotImportPackage,
  createMockRobotImportPackageSummary,
  createSafeCapsulePrivacyAudit,
  MOCK_ROBOT_IMPORT_TARGET
} from '../../src/deviceBridge/mockRobotImportPackage.js';

function validCapsule() {
  return createSafeLearningCapsule({
    capsuleId: 'mock_robot_capsule_0001',
    sourceType: 'mock_import',
    createdAtBucket: '2026-07-07',
    monotonicImportId: 1,
    learningStateBucket: 'steady',
    studyLoadBucket: 'normal',
    reviewUrgencyBucket: 'low',
    sessionMoodBucket: 'calm',
    sessionEnergyBucket: 'medium',
    focusNeedBucket: 'low',
    recommendedCompanionAction: 'quiet_presence',
    companionTone: 'calm',
    safeSummaryCode: 'STEADY_PROGRESS',
    expirationBucket: 'same_session',
    privacyClass: 'redacted_coarse_only'
  }).capsule;
}

describe('mockRobotImportPackage', () => {
  it('accepts valid capsule and includes R5X19.2 compatibility markers', () => {
    const result = createMockRobotImportPackage(validCapsule());

    expect(result.ok).toBe(true);
    expect(result.package).toMatchObject({
      packageType: 'shime_robot_mock_import_package',
      target: MOCK_ROBOT_IMPORT_TARGET,
      bridgeMode: 'mock_only',
      realBridgeEnabled: false,
      transportEnabled: false,
      persistentWritesEnabled: false,
      motionLockedExpected: true,
      checksumStatus: 'valid'
    });
    expect(createMockRobotImportPackageSummary(result).compatibleWithR5X19_2).toBe(true);
  });

  it('rejects invalid capsule and raw fields', () => {
    const capsule = { ...validCapsule(), checksum: 'ffffffff', prompt: 'private question' };
    const result = createMockRobotImportPackage(capsule);

    expect(result.ok).toBe(false);
    expect(result.package).toBe(null);
    expect(result.issues.map(issue => issue.code)).toContain('unknown_capsule_field');
  });

  it('keeps every real bridge and transport flag false', () => {
    const result = createMockRobotImportPackage(validCapsule());

    expect(result.package.realBridgeEnabled).toBe(false);
    expect(result.package.transportEnabled).toBe(false);
    expect(result.package.persistentWritesEnabled).toBe(false);
    expect(result.package.motionLockedExpected).toBe(true);
  });

  it('serialized package does not contain raw user values', () => {
    const result = createMockRobotImportPackage(validCapsule());

    expect(result.serialized).not.toMatch(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/i);
  });

  it('privacy audit reports explicit safe booleans', () => {
    const audit = createSafeCapsulePrivacyAudit(validCapsule());

    expect(audit).toMatchObject({
      rawQuizFieldsDetected: false,
      rawAnswerFieldsDetected: false,
      rawHistoryDetected: false,
      rawDocumentTextDetected: false,
      rawSourceMetadataDetected: false,
      rawCardDeckIdsDetected: false,
      rawRfIdentifiersDetected: false,
      secretsDetected: false,
      unknownUnsafeFieldsDetected: false,
      ok: true
    });
  });
});
