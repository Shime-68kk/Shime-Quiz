export function planTimetableIntervention(input = {}) {
  let routineRecommendation = 'no_nudge';
  const reasonCodes = ['timetable_plan_created'];
  if (input.transportHealth === 'disconnected') {
    routineRecommendation = 'reconnect_before_study';
    reasonCodes.push('transport_first');
  } else if (input.sessionFatigueBucket === 'high' || input.safetyMode === 'quiet_mode') {
    routineRecommendation = 'protect_rest';
    reasonCodes.push('respect_rest');
  } else if (['high', 'very_high'].includes(input.recoveryNeedBucket)) {
    routineRecommendation = 'recovery_session_today';
    reasonCodes.push('recovery_need_high');
  } else if (['high', 'very_high'].includes(input.scheduleDriftBucket)) {
    routineRecommendation = 'resume_habit';
    reasonCodes.push('schedule_drift_high');
  } else if (['high', 'very_high'].includes(input.reviewUrgencyBucket)) {
    routineRecommendation = 'short_session_soon';
    reasonCodes.push('review_urgent');
  } else if (input.duePressureBucket === 'low') {
    routineRecommendation = 'tiny_review_now';
    reasonCodes.push('small_due_set');
  }
  return {
    routineRecommendation,
    timingWindowBucket: input.preferredStudyWindowBucket || input.localTimeBucket || 'next_available',
    nudgeLevel: routineRecommendation === 'no_nudge' ? 'none' : ['protect_rest', 'reduce_pressure'].includes(routineRecommendation) ? 'low' : 'medium',
    shouldDelay: routineRecommendation === 'protect_rest',
    shouldSuggestShortSession: ['tiny_review_now', 'short_session_soon'].includes(routineRecommendation),
    shouldSuggestRecoverySession: routineRecommendation === 'recovery_session_today',
    shouldRespectQuietMode: input.safetyMode === 'quiet_mode' || input.safetyMode === 'classroom_safe',
    mutatesSchedule: false,
    scheduleMutationAllowed: false,
    notificationAllowed: false,
    calendarMutationAllowed: false,
    dryRunOnly: true,
    reasonCodes
  };
}
