export const FSRS_ROBOT_POLICY_MATRIX_VERSION = 'shime-fsrs-robot-policy-matrix-v1';

export function getFsrsRobotPolicyMatrix() {
  return {
    matrixVersion: FSRS_ROBOT_POLICY_MATRIX_VERSION,
    rules: [
      { id: 'privacy_unsafe', robotPolicy: 'calm_error', timetablePolicy: 'no_nudge', reasonCode: 'privacy_unsafe_blocks_policy' },
      { id: 'protect_rest', robotPolicy: 'do_nothing', timetablePolicy: 'protect_rest', reasonCode: 'protect_rest' },
      { id: 'stable_due_pressure', robotPolicy: 'review_due_nudge', timetablePolicy: 'short_session_soon', reasonCode: 'stable_due_pressure' },
      { id: 'struggle_due_pressure', robotPolicy: 'focus_ritual', timetablePolicy: 'recovery_session_today', reasonCode: 'struggle_due_pressure' },
      { id: 'memory_risk', robotPolicy: 'memory_risk_nudge', timetablePolicy: 'tiny_review_now', reasonCode: 'memory_risk_detected' },
      { id: 'recovery_needed', robotPolicy: 'gentle_encourage', timetablePolicy: 'recovery_session_today', reasonCode: 'recovery_needed' },
      { id: 'stability_gain', robotPolicy: 'celebrate_stability_gain', timetablePolicy: 'plan_next_window', reasonCode: 'stability_gain' },
      { id: 'habit_drift', robotPolicy: 'review_due_nudge', timetablePolicy: 'resume_habit', reasonCode: 'habit_drift' },
      { id: 'neutral', robotPolicy: 'do_nothing', timetablePolicy: 'no_nudge', reasonCode: 'no_intervention_needed' }
    ],
    reasonCodes: ['fsrs_robot_policy_matrix_loaded']
  };
}

function hasHigh(value) {
  return value === 'high' || value === 'very_high';
}

function applyContext(selection, context = {}) {
  const next = { ...selection };
  if (context.classroomSafe === true || context.safetyMode === 'classroom_safe') {
    next.intensityPolicy = 'reduced';
    next.reasonCodes = [...next.reasonCodes, 'classroom_safe_reduced'];
  }
  if (context.quietMode === true || context.safetyMode === 'quiet_mode') {
    next.robotPolicy = next.robotPolicy === 'calm_error' ? 'calm_error' : 'do_nothing';
    next.timetablePolicy = 'protect_rest';
    next.reasonCodes = [...next.reasonCodes, 'quiet_mode_blocks_interruption'];
  }
  return next;
}

export function selectRobotPolicyFromFsrsSignals(signals = {}, context = {}) {
  let selection;
  if (signals.privacyStatus === 'blocked' || context.privacySafe === false) {
    selection = { ruleId: 'privacy_unsafe', robotPolicy: 'calm_error', reasonCodes: ['privacy_unsafe_blocks_policy'] };
  } else if (context.userTired === true || context.safetyMode === 'quiet_mode') {
    selection = { ruleId: 'protect_rest', robotPolicy: 'do_nothing', reasonCodes: ['protect_rest'] };
  } else if (hasHigh(signals.recoveryNeedBucket) && hasHigh(signals.duePressureBucket)) {
    selection = { ruleId: 'struggle_due_pressure', robotPolicy: 'focus_ritual', reasonCodes: ['struggle_due_pressure'] };
  } else if (hasHigh(signals.recoveryNeedBucket)) {
    selection = { ruleId: 'recovery_needed', robotPolicy: 'gentle_encourage', reasonCodes: ['recovery_needed'] };
  } else if (hasHigh(signals.duePressureBucket)) {
    selection = { ruleId: 'stable_due_pressure', robotPolicy: 'review_due_nudge', reasonCodes: ['stable_due_pressure'] };
  } else if (hasHigh(signals.forgettingRiskBucket) || ['very_low', 'low'].includes(signals.retrievabilityBucket)) {
    selection = { ruleId: 'memory_risk', robotPolicy: 'memory_risk_nudge', reasonCodes: ['memory_risk_detected'] };
  } else if (signals.stabilityBucket === 'high' || signals.stabilityBucket === 'very_high') {
    selection = { ruleId: 'stability_gain', robotPolicy: 'celebrate_stability_gain', reasonCodes: ['stability_gain'] };
  } else if (hasHigh(signals.scheduleDriftBucket)) {
    selection = { ruleId: 'habit_drift', robotPolicy: 'review_due_nudge', reasonCodes: ['habit_drift'] };
  } else {
    selection = { ruleId: 'neutral', robotPolicy: 'do_nothing', reasonCodes: ['no_intervention_needed'] };
  }
  return applyContext({ intensityPolicy: 'normal', ...selection }, context);
}

export function selectTimetablePolicyFromFsrsSignals(signals = {}, context = {}) {
  const robotSelection = selectRobotPolicyFromFsrsSignals(signals, context);
  const byRule = {
    privacy_unsafe: 'no_nudge',
    protect_rest: 'protect_rest',
    stable_due_pressure: 'short_session_soon',
    struggle_due_pressure: 'recovery_session_today',
    memory_risk: 'tiny_review_now',
    recovery_needed: 'recovery_session_today',
    stability_gain: 'plan_next_window',
    habit_drift: 'resume_habit',
    neutral: 'no_nudge'
  };
  return {
    ruleId: robotSelection.ruleId,
    timetablePolicy: robotSelection.timetablePolicy || byRule[robotSelection.ruleId] || 'no_nudge',
    scheduleMutationAllowed: false,
    dryRunOnly: true,
    reasonCodes: [...robotSelection.reasonCodes, 'timetable_policy_suggestion_only']
  };
}

export function explainFsrsRobotPolicySelection(selection = {}) {
  return {
    ruleId: selection.ruleId || 'unknown',
    robotPolicy: selection.robotPolicy || 'do_nothing',
    timetablePolicy: selection.timetablePolicy || 'no_nudge',
    intensityPolicy: selection.intensityPolicy || 'normal',
    dryRunOnly: true,
    reasonCodes: [...(selection.reasonCodes || []), 'fsrs_robot_policy_explained']
  };
}
