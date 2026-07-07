import { describe, expect, it } from 'vitest';
import { evaluateHardwareReadinessGate } from '../../src/deviceBridge/hardwareReadinessGate.js';

describe('hardwareReadinessGate', () => {
  it('keeps realBridgeAllowed false even when checks pass', () => {
    const result = evaluateHardwareReadinessGate({
      appSafeCapsuleValidatorsPass: true, controlCenterPass: true, rehearsalLabPass: true, exportVaultPass: true,
      mockImportVerificationPass: true, noRawDataLeakPass: true, noTransportRuntimePass: true, firmwareMotionLockedPass: true,
      userExplicitHardwareConsent: true, developerModeEnabled: true, browserCapabilityProbe: 'not_requested'
    });
    expect(result.realBridgeAllowed).toBe(false);
    expect(result.readinessLevel).toBe('pre_hardware_review');
  });
  it('blocks when mock verification is missing', () => {
    const result = evaluateHardwareReadinessGate({ browserCapabilityProbe: 'not_requested' });
    expect(result.readinessLevel).toBe('blocked');
    expect(result.blockedChecks).toContain('mockImportVerificationPass');
  });
});
