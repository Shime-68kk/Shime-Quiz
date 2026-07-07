import { createSafeLearningCapsule } from '../../deviceBridge/safeLearningCapsule.js';
import { createSafeCapsulePreviewModel } from '../../deviceBridge/safeCapsulePreviewModel.js';
import {
  createMockRobotImportPackage,
  createMockRobotImportPackageSummary,
  createSafeCapsulePrivacyAudit,
  MOCK_ROBOT_IMPORT_TARGET
} from '../../deviceBridge/mockRobotImportPackage.js';

export const SAFE_CAPSULE_CONTROL_CENTER_ACTIONS = Object.freeze({
  CREATE_SAMPLE_STEADY: 'create_sample_steady',
  CREATE_SAMPLE_STRUGGLING: 'create_sample_struggling',
  CREATE_SAMPLE_HIGH_REVIEW_PRESSURE: 'create_sample_high_review_pressure',
  CREATE_SAMPLE_LOW_ENERGY: 'create_sample_low_energy',
  CLEAR_PREVIEW: 'clear_preview',
  RUN_PRIVACY_AUDIT: 'run_privacy_audit',
  CREATE_MOCK_ROBOT_IMPORT_PACKAGE: 'create_mock_robot_import_package'
});

export const SAFE_CAPSULE_BRIDGE_STATUS = 'mock_only_not_connected';

const BASE_SAMPLE = Object.freeze({
  sourceType: 'mock_import',
  createdAtBucket: '2026-07-07',
  monotonicImportId: 1001,
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
});

const SAMPLE_INPUTS = Object.freeze({
  steady: Object.freeze({
    ...BASE_SAMPLE,
    capsuleId: 'sample_steady_capsule_001'
  }),
  struggling: Object.freeze({
    ...BASE_SAMPLE,
    capsuleId: 'sample_struggling_capsule_001',
    monotonicImportId: 1002,
    learningStateBucket: 'struggling',
    studyLoadBucket: 'moderate',
    reviewUrgencyBucket: 'medium',
    sessionMoodBucket: 'strained',
    sessionEnergyBucket: 'medium',
    focusNeedBucket: 'high',
    recommendedCompanionAction: 'encourage_break_or_review',
    companionTone: 'gentle',
    safeSummaryCode: 'NEEDS_GENTLE_SUPPORT'
  }),
  highReviewPressure: Object.freeze({
    ...BASE_SAMPLE,
    capsuleId: 'sample_review_pressure_001',
    monotonicImportId: 1003,
    learningStateBucket: 'needs_review',
    studyLoadBucket: 'heavy',
    reviewUrgencyBucket: 'high',
    sessionMoodBucket: 'strained',
    sessionEnergyBucket: 'medium',
    focusNeedBucket: 'medium',
    recommendedCompanionAction: 'suggest_review_focus',
    companionTone: 'focused',
    safeSummaryCode: 'REVIEW_SOON'
  }),
  lowEnergy: Object.freeze({
    ...BASE_SAMPLE,
    capsuleId: 'sample_low_energy_capsule_001',
    monotonicImportId: 1004,
    learningStateBucket: 'building',
    studyLoadBucket: 'heavy',
    reviewUrgencyBucket: 'medium',
    sessionMoodBucket: 'tired',
    sessionEnergyBucket: 'low',
    focusNeedBucket: 'rest_or_light_review',
    recommendedCompanionAction: 'encourage_break_or_review',
    companionTone: 'gentle',
    safeSummaryCode: 'HIGH_LOAD_BREAK_SUGGESTED'
  })
});

export function createInitialSafeCapsuleControlCenterState() {
  return {
    derivedSessionSummaryInput: null,
    capsule: null,
    preview: null,
    mockPackage: null,
    mockPackageSummary: null,
    privacyAudit: null,
    compatibilityStatus: {
      target: MOCK_ROBOT_IMPORT_TARGET,
      compatible: false,
      status: 'no_capsule_preview'
    },
    bridgeStatus: SAFE_CAPSULE_BRIDGE_STATUS,
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    motionControlsEnabled: false
  };
}

function createSampleCapsule(sampleName) {
  const created = createSafeLearningCapsule(SAMPLE_INPUTS[sampleName]);
  if (!created.ok) return { ok: false, capsule: null, error: created.error, issues: created.issues };
  return created;
}

function withCapsule(state, capsule) {
  const privacyAudit = createSafeCapsulePrivacyAudit(capsule);
  const mockResult = createMockRobotImportPackage(capsule);
  return {
    ...state,
    derivedSessionSummaryInput: null,
    capsule,
    preview: createSafeCapsulePreviewModel(capsule, mockResult.ok ? { summary: { exportReadyForMockRobotImport: true } } : null),
    mockPackage: null,
    mockPackageSummary: null,
    privacyAudit,
    compatibilityStatus: {
      target: MOCK_ROBOT_IMPORT_TARGET,
      compatible: mockResult.ok,
      status: mockResult.ok ? 'compatible_mock_import_preview' : 'not_compatible'
    },
    bridgeStatus: SAFE_CAPSULE_BRIDGE_STATUS,
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    motionControlsEnabled: false
  };
}

function createSampleState(state, sampleName) {
  const result = createSampleCapsule(sampleName);
  if (!result.ok) {
    return {
      ...state,
      error: result.error,
      privacyAudit: {
        ok: false,
        diagnostics: result.issues.map(issue => ({ code: issue.code, path: issue.path }))
      }
    };
  }
  return withCapsule(state, result.capsule);
}

export function applySafeCapsuleControlCenterAction(state, action) {
  const current = state || createInitialSafeCapsuleControlCenterState();
  const type = typeof action === 'string' ? action : action?.type;

  switch (type) {
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY:
      return createSampleState(current, 'steady');
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STRUGGLING:
      return createSampleState(current, 'struggling');
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_HIGH_REVIEW_PRESSURE:
      return createSampleState(current, 'highReviewPressure');
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_LOW_ENERGY:
      return createSampleState(current, 'lowEnergy');
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.RUN_PRIVACY_AUDIT:
      return {
        ...current,
        privacyAudit: current.capsule ? createSafeCapsulePrivacyAudit(current.capsule) : null
      };
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_MOCK_ROBOT_IMPORT_PACKAGE: {
      if (!current.capsule) return current;
      const result = createMockRobotImportPackage(current.capsule);
      return {
        ...current,
        mockPackage: result.ok ? result.package : null,
        mockPackageSummary: createMockRobotImportPackageSummary(result),
        compatibilityStatus: {
          target: MOCK_ROBOT_IMPORT_TARGET,
          compatible: result.ok,
          status: result.ok ? 'compatible_mock_import_package' : 'not_compatible'
        }
      };
    }
    case SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CLEAR_PREVIEW:
      return createInitialSafeCapsuleControlCenterState();
    default:
      return current;
  }
}

export function getSafeCapsuleControlCenterSampleInputs() {
  return SAMPLE_INPUTS;
}
