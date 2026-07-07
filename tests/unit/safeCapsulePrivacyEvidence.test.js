import { describe, expect, it } from 'vitest';
import { createStudyRoomDerivedSafeCapsule } from '../../src/deviceBridge/studyRoomDerivedSummary.js';
import { createMockRobotImportPackage } from '../../src/deviceBridge/mockRobotImportPackage.js';
import { createSafeCapsulePrivacyEvidence } from '../../src/deviceBridge/safeCapsulePrivacyEvidence.js';

const SUMMARY = {
  correctCount: 8,
  incorrectCount: 1,
  skippedCount: 1,
  totalCount: 10,
  sessionDurationBucket: 'medium',
  recentAccuracyBucket: 'high',
  dueReviewCountBucket: 'low',
  consecutiveErrorsBucket: 'none',
  hesitationBucket: 'low',
  focusNeedSignalBucket: 'low',
  userEnergySelfReportBucket: 'medium',
  monotonicImportId: 31
};

describe('safeCapsulePrivacyEvidence', () => {
  it('records accepted safe capsule evidence without raw values', () => {
    const capsule = createStudyRoomDerivedSafeCapsule(SUMMARY, { createdAtBucket: '2026-07-08' }).capsule;
    const mockPackage = createMockRobotImportPackage(capsule).package;
    const evidence = createSafeCapsulePrivacyEvidence({ scenarioId: 'steady_progress', derivedSummary: SUMMARY, capsule, mockPackage });

    expect(evidence).toMatchObject({
      evidenceType: 'safe_capsule_privacy_evidence',
      schemaVersion: 1,
      scenarioId: 'steady_progress',
      accepted: true,
      rejected: false,
      safeFieldCount: 17,
      unsafeFieldCount: 0,
      rawValueEchoDetected: false,
      packageCreated: true,
      checksumStatus: 'valid',
      bridgeMode: 'mock_only',
      transportEnabled: false,
      realBridgeEnabled: false,
      motionLockedExpected: true
    });
    expect(JSON.stringify(evidence)).not.toMatch(/private question|private answer|raw document|HomeNetwork|secret-token/);
  });

  it('records rejected evidence with category counts only', () => {
    const evidence = createSafeCapsulePrivacyEvidence({
      scenarioId: 'privacy_attack_raw_rf',
      rejectionResult: {
        rejected: true,
        rejectionReasonCode: 'REJECTED_FOR_RAW_RF',
        issues: [
          { code: 'unsafe_derived_summary_input', category: 'raw_rf_identifier', path: '$.ssid' },
          { code: 'unsafe_derived_summary_input', category: 'raw_rf_identifier', path: '$.bssid' }
        ]
      }
    });

    expect(evidence.accepted).toBe(false);
    expect(evidence.rejected).toBe(true);
    expect(evidence.packageCreated).toBe(false);
    expect(evidence.forbiddenCategoryHits.rawRfIdentifiers).toBe(2);
    expect(evidence.summaryCodes).toContain('REJECTED_FOR_RAW_RF');
    expect(JSON.stringify(evidence)).not.toMatch(/HomeNetwork|aa:bb:cc:dd:ee:ff/);
  });

  it('is deterministic for test inputs', () => {
    const first = createSafeCapsulePrivacyEvidence({ scenarioId: 'malformed_summary', rejectionResult: { rejected: true, rejectionReasonCode: 'REJECTED_FOR_MALFORMED_SUMMARY', issues: [] } });
    const second = createSafeCapsulePrivacyEvidence({ scenarioId: 'malformed_summary', rejectionResult: { rejected: true, rejectionReasonCode: 'REJECTED_FOR_MALFORMED_SUMMARY', issues: [] } });

    expect(second).toEqual(first);
  });
});
