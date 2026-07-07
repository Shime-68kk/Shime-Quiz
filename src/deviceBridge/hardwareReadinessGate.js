export function evaluateHardwareReadinessGate(input = {}) {
  const checks = {
    appSafeCapsuleValidatorsPass: input.appSafeCapsuleValidatorsPass === true,
    controlCenterPass: input.controlCenterPass === true,
    rehearsalLabPass: input.rehearsalLabPass === true,
    exportVaultPass: input.exportVaultPass === true,
    mockImportVerificationPass: input.mockImportVerificationPass === true,
    noRawDataLeakPass: input.noRawDataLeakPass === true,
    noTransportRuntimePass: input.noTransportRuntimePass === true,
    firmwareMotionLockedPass: input.firmwareMotionLockedPass === true,
    userExplicitHardwareConsent: input.userExplicitHardwareConsent === true,
    developerModeEnabled: input.developerModeEnabled === true,
    browserCapabilityProbe: input.browserCapabilityProbe === 'not_requested'
  };
  const passedChecks = Object.entries(checks).filter(([, pass]) => pass).map(([key]) => key);
  const blockedChecks = Object.entries(checks).filter(([, pass]) => !pass).map(([key]) => key);
  const corePass = [
    'appSafeCapsuleValidatorsPass',
    'controlCenterPass',
    'rehearsalLabPass',
    'exportVaultPass',
    'mockImportVerificationPass',
    'noRawDataLeakPass',
    'noTransportRuntimePass',
    'firmwareMotionLockedPass'
  ].every(key => checks[key]);
  return {
    gateType: 'hardware_readiness_gate',
    realBridgeAllowed: false,
    readinessLevel: corePass && checks.userExplicitHardwareConsent && checks.developerModeEnabled ? 'pre_hardware_review' : corePass ? 'mock_ready' : 'blocked',
    requiredBeforeRealBridge: ['separate_hardware_phase', 'explicit_user_consent', 'security_review', 'firmware_motion_lock_evidence', 'transport_threat_model'],
    passedChecks,
    blockedChecks,
    nextPhaseRecommendation: corePass ? 'HARDWARE_GATED_BRIDGE_READINESS_REVIEW_ONLY' : 'KEEP_MOCK_ONLY_AND_FIX_BLOCKERS'
  };
}
