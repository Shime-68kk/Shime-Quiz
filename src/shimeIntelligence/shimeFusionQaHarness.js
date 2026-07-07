import { runShimeEcosystemFusion } from './appRobotFusionEngine.js';
import { mapFusionToRobotExpression } from './robotExpressionMapper.js';
import { createRobotExpressionPreviewRow } from './robotExpressionPreview.js';

export const SHIME_FUSION_QA_CASE_IDS = Object.freeze([
  'empty_state',
  'normal_review_day',
  'high_due_pressure',
  'low_retrievability',
  'repeated_lapse',
  'recovery_after_struggle',
  'high_stability_gain',
  'session_complete',
  'privacy_attack',
  'transport_unsafe',
  'robot_unavailable',
  'classroom_safe',
  'quiet_mode',
  'phone_desktop_robot',
  'display_only_robot',
  'led_only_robot',
  'motion_capable_locked'
]);

function caseInput(id) {
  const base = {
    fsrs: { dueCount: 3, overdueCount: 0, retrievability: 0.72, stability: 10, difficulty: 4, totalCount: 6 },
    robotProfile: { supportsDisplay: true, supportsLed: true, supportsSound: false, motionLocked: true },
    transport: { userConsentState: 'not_requested', payloadSizeBucket: 'tiny' }
  };
  const cases = {
    empty_state: null,
    normal_review_day: base,
    high_due_pressure: { ...base, fsrs: { ...base.fsrs, dueCount: 35, overdueCount: 10 } },
    low_retrievability: { ...base, fsrs: { ...base.fsrs, retrievability: 0.28, difficulty: 7 } },
    repeated_lapse: { ...base, fsrs: { ...base.fsrs, lapseCount: 4, wrongCount: 3, correctCount: 1, completionQualityBucket: 'low' } },
    recovery_after_struggle: { ...base, companionIntent: 'recovery_praise', fsrs: { ...base.fsrs, lapseCount: 2, correctCount: 3, wrongCount: 1 } },
    high_stability_gain: { ...base, sessionPhase: 'complete', fsrs: { ...base.fsrs, stability: 45, correctCount: 5, wrongCount: 0, completionQualityBucket: 'high' } },
    session_complete: { ...base, sessionPhase: 'complete', fsrs: { ...base.fsrs, correctCount: 3, wrongCount: 1 } },
    privacy_attack: { ...base, fsrs: { question: 'blocked' } },
    transport_unsafe: { ...base, transportHealth: 'disconnected' },
    robot_unavailable: { ...base, robotAvailability: 'offline' },
    classroom_safe: { ...base, safetyMode: 'classroom_safe', robotProfile: { ...base.robotProfile, supportsSound: true } },
    quiet_mode: { ...base, safetyMode: 'quiet_mode', timetable: { sessionFatigueBucket: 'high' } },
    phone_desktop_robot: { ...base, robotProfile: { ...base.robotProfile, supportsWifi: true, supportsWebSocket: true, supportsBle: true } },
    display_only_robot: { ...base, robotProfile: { supportsDisplay: true, supportsLed: false, supportsSound: false, motionLocked: true } },
    led_only_robot: { ...base, robotProfile: { supportsDisplay: false, supportsLed: true, supportsSound: false, motionLocked: true } },
    motion_capable_locked: { ...base, robotProfile: { ...base.robotProfile, supportsMotion: true, motionLocked: true } }
  };
  return cases[id] || base;
}

function expectedFor(id) {
  const map = {
    empty_state: { expectedBlockedOrSafeStatus: 'safe_empty', expectedLabels: ['empty_state'] },
    high_due_pressure: { expectedLabels: ['review_due_nudge'] },
    low_retrievability: { expectedLabels: ['memory_risk_nudge'] },
    repeated_lapse: { expectedLabels: ['gentle_encourage'] },
    high_stability_gain: { expectedLabels: ['celebrate_stability_gain'] },
    privacy_attack: { expectedBlockedOrSafeStatus: 'blocked', expectedLabels: ['calm_error'] },
    transport_unsafe: { expectedLabels: ['reconnect_hint'] },
    robot_unavailable: { expectedLabels: ['do_nothing'] },
    classroom_safe: { expectedLabels: ['classroom_safe'] },
    quiet_mode: { expectedLabels: ['do_nothing'] },
    display_only_robot: { expectedLabels: ['display_expression'] },
    led_only_robot: { expectedLabels: ['led_expression'] },
    motion_capable_locked: { expectedLabels: ['motion_locked'] }
  };
  return map[id] || { expectedLabels: ['dry_run'] };
}

export function createShimeFusionQaCase(id) {
  const input = caseInput(id);
  if (!input) {
    return {
      caseId: id,
      inputSummary: { empty: true },
      fusionOutput: null,
      expressionPreview: null,
      expectedBlockedOrSafeStatus: 'safe_empty',
      expectedLabels: ['empty_state'],
      manualQaNote: 'Section D should show empty state until explicit input exists.',
      dryRunOnly: true,
      sendStatus: 'not_sent'
    };
  }
  const fusionOutput = runShimeEcosystemFusion(input, { capsuleId: `qa_${id}` });
  const expressionPlan = mapFusionToRobotExpression({
    ...fusionOutput,
    robotCapabilityProfile: input.robotProfile,
    safetyMode: input.safetyMode,
    transportHealth: input.transportHealth,
    robotAvailability: input.robotAvailability
  });
  const expressionPreview = createRobotExpressionPreviewRow(expressionPlan, { scenarioId: id });
  const expected = expectedFor(id);
  return {
    caseId: id,
    inputSummary: {
      duePressureBucket: fusionOutput.learningCapsule?.duePressureBucket,
      forgettingRiskBucket: fusionOutput.learningCapsule?.forgettingRiskBucket,
      recoveryNeedBucket: fusionOutput.learningCapsule?.recoveryNeedBucket,
      privacyStatus: fusionOutput.learningCapsule?.privacyStatus,
      safetyMode: input.safetyMode || 'motion_disabled'
    },
    fusionOutput: {
      invariantStatus: fusionOutput.invariantStatus,
      safetyOutcome: fusionOutput.safetyDecision?.safetyOutcome,
      dryRunOnly: fusionOutput.dryRunOnly,
      sendStatus: fusionOutput.sendStatus
    },
    expressionPreview,
    expectedBlockedOrSafeStatus: expected.expectedBlockedOrSafeStatus || (expressionPlan.privacyStatus === 'blocked' ? 'blocked' : 'safe'),
    expectedLabels: expected.expectedLabels,
    manualQaNote: `Verify ${id} remains expression-only, dry-run, and label-only.`,
    dryRunOnly: true,
    sendStatus: 'not_sent'
  };
}

export function runShimeFusionQaHarness(options = {}) {
  const ids = options.caseIds || SHIME_FUSION_QA_CASE_IDS;
  const cases = ids.map(createShimeFusionQaCase);
  return {
    harnessVersion: 'shime-fusion-qa-harness-v1',
    caseCount: cases.length,
    cases,
    allDryRun: cases.every(entry => entry.dryRunOnly === true && entry.sendStatus === 'not_sent'),
    reasonCodes: ['shime_fusion_qa_harness_completed']
  };
}
