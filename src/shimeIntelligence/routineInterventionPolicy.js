export const ROUTINE_INTERVENTION_POLICY_VERSION = 'shime-routine-intervention-policy-v1';

export function getRoutineInterventionPolicy() {
  return {
    policyVersion: ROUTINE_INTERVENTION_POLICY_VERSION,
    principles: [
      'user_agency_first',
      'suggest_do_not_force',
      'protect_rest',
      'do_not_shame',
      'do_not_escalate_single_miss',
      'fsrs_due_pressure_and_schedule_drift_are_signals',
      'child_or_classroom_mode_reduces_urgency',
      'quiet_mode_blocks_interruption',
      'dry_run_suggestion_only'
    ],
    scheduleMutationAllowed: false,
    notificationAllowed: false,
    calendarMutationAllowed: false,
    dryRunOnly: true,
    reasonCodes: ['routine_intervention_policy_loaded']
  };
}

export function validateRoutineInterventionPolicy(policy = getRoutineInterventionPolicy()) {
  const failures = [];
  if (policy.scheduleMutationAllowed !== false) failures.push('schedule_mutation_must_remain_false');
  if (policy.notificationAllowed !== false) failures.push('notification_must_remain_false');
  if (policy.calendarMutationAllowed !== false) failures.push('calendar_mutation_must_remain_false');
  if (policy.dryRunOnly !== true) failures.push('routine_policy_not_dry_run');
  ['user_agency_first', 'suggest_do_not_force', 'protect_rest', 'do_not_shame'].forEach(principle => {
    if (!policy.principles?.includes(principle)) failures.push(`missing_${principle}`);
  });
  return { ok: failures.length === 0, failures, reasonCodes: ['routine_intervention_policy_validated'] };
}

export function selectRoutineInterventionRule(signals = {}, context = {}) {
  if (context.quietMode === true || context.safetyMode === 'quiet_mode') {
    return { ruleId: 'quiet_mode', recommendation: 'protect_rest', nudgeLevel: 'none', reasonCodes: ['quiet_mode_blocks_interruption'] };
  }
  if (context.userTired === true || signals.sessionFatigueBucket === 'high') {
    return { ruleId: 'protect_rest', recommendation: 'protect_rest', nudgeLevel: 'low', reasonCodes: ['protect_rest'] };
  }
  if (signals.singleMiss === true && !['high', 'very_high'].includes(signals.duePressureBucket)) {
    return { ruleId: 'single_miss_no_escalation', recommendation: 'no_nudge', nudgeLevel: 'none', reasonCodes: ['do_not_escalate_single_miss'] };
  }
  if (['high', 'very_high'].includes(signals.recoveryNeedBucket)) {
    return { ruleId: 'recovery_need', recommendation: 'recovery_session_today', nudgeLevel: 'low', reasonCodes: ['recovery_need_support'] };
  }
  if (['high', 'very_high'].includes(signals.scheduleDriftBucket)) {
    return { ruleId: 'schedule_drift', recommendation: 'resume_habit', nudgeLevel: context.classroomSafe ? 'low' : 'medium', reasonCodes: ['schedule_drift_signal'] };
  }
  if (['high', 'very_high'].includes(signals.duePressureBucket)) {
    return { ruleId: 'due_pressure', recommendation: 'short_session_soon', nudgeLevel: context.classroomSafe ? 'low' : 'medium', reasonCodes: ['due_pressure_signal'] };
  }
  return { ruleId: 'no_intervention', recommendation: 'no_nudge', nudgeLevel: 'none', reasonCodes: ['no_routine_intervention_needed'] };
}
