import { runSafeCapsuleRehearsalScenario } from './safeCapsuleRehearsalLabModel.js';
import { createManualSafeCapsuleHandoffPack } from '../../deviceBridge/safeCapsuleManualExportPackage.js';
import {
  createRobotMockImportReportFixture,
  verifyRobotMockImportReport
} from '../../deviceBridge/robotMockImportReport.js';
import { evaluateHardwareReadinessGate } from '../../deviceBridge/hardwareReadinessGate.js';

export const SAFE_CAPSULE_E2E_ACTIONS = Object.freeze({
  CREATE_SAMPLE_HANDOFF: 'create_sample_handoff',
  CREATE_MATCHING_REPORT: 'create_matching_report',
  CREATE_FAILING_CHECKSUM_REPORT: 'create_failing_checksum_report',
  CREATE_PRIVACY_ATTACK_REPORT: 'create_privacy_attack_report',
  CREATE_TRANSPORT_ATTACK_REPORT: 'create_transport_attack_report',
  VERIFY: 'verify',
  CLEAR: 'clear'
});

export function createInitialSafeCapsuleEndToEndVerificationState() {
  return {
    overallStatus: 'no_export_created',
    handoffPack: null,
    robotReport: null,
    verification: null,
    readinessGate: evaluateHardwareReadinessGate({ browserCapabilityProbe: 'not_requested' }),
    endToEndPass: false,
    capsuleCountMatch: false,
    checksumMatch: false,
    privacyPass: false,
    r5x19CompatibilityPass: false,
    motionLockedPass: false,
    realBridgeDisabledPass: true,
    transportDisabledPass: true,
    rawDataLeakPass: true,
    recommendedNextStepCode: 'NOT_READY_FOR_REAL_BRIDGE'
  };
}

function sampleHandoff() {
  const scenarios = ['steady_progress', 'struggling_streak', 'review_pressure_high', 'low_energy_focus'].map(runSafeCapsuleRehearsalScenario);
  return createManualSafeCapsuleHandoffPack(scenarios.map(result => result.mockPackage), {
    createdAtBucket: '2026-07-08',
    exportId: 'e2e_verification_sample',
    privacyEvidence: scenarios.map(result => result.privacyEvidenceSummary)
  }).handoffPack;
}

function withReportStatus(state, report, status = 'report_loaded') {
  return { ...state, robotReport: report, overallStatus: status };
}

function deriveVerifyState(state) {
  if (!state.handoffPack || !state.robotReport) return { ...state, overallStatus: state.handoffPack ? 'waiting_for_mock_import_report' : 'no_export_created' };
  const verification = verifyRobotMockImportReport(state.robotReport, state.handoffPack);
  const report = state.robotReport;
  let overallStatus = verification.ok ? 'verified_pass' : 'verified_failed';
  let recommendedNextStepCode = verification.ok ? 'READY_FOR_MANUAL_ROBOT_MOCK_QA' : 'NEEDS_REEXPORT';
  if (report.transportEnabled !== false) {
    overallStatus = 'blocked_by_transport_flag';
    recommendedNextStepCode = 'BLOCKED_TRANSPORT_FLAG';
  } else if (report.motionLocked !== true) {
    overallStatus = 'blocked_by_motion_unlock';
    recommendedNextStepCode = 'BLOCKED_MOTION_UNLOCK';
  } else if (report.privacyPassCount !== report.acceptedCount || report.rawQuizRejected !== true) {
    overallStatus = 'blocked_by_privacy';
    recommendedNextStepCode = 'BLOCKED_PRIVACY_ATTACK';
  } else if (!verification.checksumMatch) {
    overallStatus = 'blocked_by_checksum';
    recommendedNextStepCode = 'BLOCKED_CHECKSUM_MISMATCH';
  }
  const gate = evaluateHardwareReadinessGate({
    appSafeCapsuleValidatorsPass: true,
    controlCenterPass: true,
    rehearsalLabPass: true,
    exportVaultPass: true,
    mockImportVerificationPass: verification.ok,
    noRawDataLeakPass: report.rawQuizRejected === true && report.rawRfRejected === true && report.secretRejected === true,
    noTransportRuntimePass: report.transportEnabled === false,
    firmwareMotionLockedPass: report.motionLocked === true,
    userExplicitHardwareConsent: false,
    developerModeEnabled: false,
    browserCapabilityProbe: 'not_requested'
  });
  return {
    ...state,
    verification,
    readinessGate: gate,
    overallStatus,
    endToEndPass: verification.ok,
    capsuleCountMatch: verification.capsuleCountMatch,
    checksumMatch: verification.checksumMatch,
    privacyPass: verification.privacyPass && report.rawQuizRejected === true && report.rawRfRejected === true && report.secretRejected === true,
    r5x19CompatibilityPass: report.target === 'R5X19.2_SAFE_MOCK_IMPORT',
    motionLockedPass: report.motionLocked === true,
    realBridgeDisabledPass: report.realBridgeEnabled === false,
    transportDisabledPass: report.transportEnabled === false,
    rawDataLeakPass: report.rawQuizRejected === true && report.rawRfRejected === true && report.secretRejected === true,
    recommendedNextStepCode
  };
}

export function applySafeCapsuleEndToEndVerificationAction(state, action) {
  const current = state || createInitialSafeCapsuleEndToEndVerificationState();
  const type = action?.type || action;
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CLEAR) return createInitialSafeCapsuleEndToEndVerificationState();
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF) {
    return { ...current, handoffPack: sampleHandoff(), overallStatus: 'export_ready', recommendedNextStepCode: 'NOT_READY_FOR_REAL_BRIDGE' };
  }
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CREATE_MATCHING_REPORT) {
    return withReportStatus(current, createRobotMockImportReportFixture({ handoffPack: current.handoffPack }), 'report_loaded');
  }
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CREATE_FAILING_CHECKSUM_REPORT) {
    return withReportStatus(current, createRobotMockImportReportFixture({ handoffPack: current.handoffPack, checksumPassCount: 0 }), 'report_loaded');
  }
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CREATE_PRIVACY_ATTACK_REPORT) {
    return withReportStatus(current, createRobotMockImportReportFixture({ handoffPack: current.handoffPack, overrides: { rawQuizRejected: false }, reportChecksum: 'badbad00' }), 'report_loaded');
  }
  if (type === SAFE_CAPSULE_E2E_ACTIONS.CREATE_TRANSPORT_ATTACK_REPORT) {
    return withReportStatus(current, createRobotMockImportReportFixture({ handoffPack: current.handoffPack, overrides: { transportEnabled: true }, reportChecksum: 'badbad00' }), 'report_loaded');
  }
  if (type === SAFE_CAPSULE_E2E_ACTIONS.VERIFY) return deriveVerifyState(current);
  return current;
}
