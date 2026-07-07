import { createRobotExpressionContract, FORBIDDEN_ROBOT_EXPRESSION_CHANNELS } from './robotExpressionContract.js';
import { assertRobotExpressionSafety } from './robotExpressionSafetyGate.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

function hasHigh(value) {
  return value === 'high' || value === 'very_high';
}

function channelsForProfile(profile = {}, family = 'neutral_presence') {
  if (profile.available === false || profile.robotAvailability === 'offline') return ['no_op'];
  if (profile.supportsDisplay && !profile.supportsLed && !profile.supportsSound) return ['display_expression'];
  if (profile.supportsLed && !profile.supportsDisplay && !profile.supportsSound) return ['led_expression'];
  const channels = [];
  if (profile.supportsDisplay !== false) channels.push('display_expression');
  if (profile.supportsLed === true) channels.push('led_expression');
  if (profile.supportsSound === true && family !== 'do_nothing') channels.push('sound_cue');
  if (family === 'neutral_presence' || family === 'do_nothing') channels.push('idle_presence');
  if (family !== 'do_nothing') channels.push('attention_hint');
  return [...new Set(channels.length > 0 ? channels : ['no_op'])];
}

function expressionFromFusion(input = {}) {
  const capsule = input.learningCapsule || {};
  const intervention = input.robotInterventionPlan || {};
  if (findSensitiveKeys(input).length > 0 || input.privacyStatus === 'blocked' || capsule.privacyStatus === 'blocked') return 'calm_error';
  if (input.robotCapabilityProfile?.available === false || input.robotAvailability === 'offline') return 'do_nothing';
  if (['disconnected', 'error', 'disabled'].includes(input.transportHealth)) return 'reconnect_hint';
  if (input.safetyMode === 'quiet_mode' || input.timetablePlan?.routineRecommendation === 'protect_rest') return 'do_nothing';
  if (intervention.interventionFamily) {
    if (intervention.interventionFamily === 'suggest_break') return 'suggest_break_soft';
    return intervention.interventionFamily;
  }
  if (hasHigh(capsule.recoveryNeedBucket)) return 'gentle_encourage';
  if (hasHigh(capsule.duePressureBucket)) return 'review_due_nudge';
  if (hasHigh(capsule.forgettingRiskBucket) || ['low', 'very_low'].includes(capsule.retrievabilityBucket)) return 'memory_risk_nudge';
  if (capsule.sessionPhase === 'complete' && hasHigh(capsule.stabilityBucket)) return 'celebrate_stability_gain';
  if (capsule.sessionPhase === 'complete') return 'celebrate_session_complete';
  return 'neutral_presence';
}

const DISPLAY_BY_FAMILY = Object.freeze({
  neutral_presence: 'soft_idle_face',
  focus_ritual: 'focus_breathing_prompt',
  review_due_nudge: 'review_due_badge',
  memory_risk_nudge: 'memory_risk_soft_hint',
  gentle_encourage: 'supportive_smile',
  recovery_praise: 'recovery_progress_badge',
  celebrate_stability_gain: 'stability_gain_celebration',
  celebrate_session_complete: 'session_complete_smile',
  suggest_break_soft: 'break_soft_prompt',
  reconnect_hint: 'connection_check_hint',
  calm_error: 'calm_error_notice',
  do_nothing: 'idle_blank'
});

export function mapFusionToRobotExpression(input = {}, options = {}) {
  const sensitive = findSensitiveKeys(input);
  const profile = input.robotCapabilityProfile || input.robotProfile || {};
  const rawFamily = expressionFromFusion({ ...input, robotCapabilityProfile: profile });
  const expressionFamily = profile.available === false ? 'do_nothing' : rawFamily;
  const classroomSafe = input.classroomSafe === true || input.safetyMode === 'classroom_safe';
  const allowedChannels = classroomSafe
    ? channelsForProfile({ ...profile, supportsSound: false }, expressionFamily)
    : channelsForProfile(profile, expressionFamily);
  const intensityBucket = classroomSafe || hasHigh(input.learningCapsule?.recoveryNeedBucket) || expressionFamily === 'do_nothing'
    ? 'low'
    : input.robotInterventionPlan?.intensityBucket || 'medium';
  const contract = createRobotExpressionContract({
    expressionFamily,
    allowedChannels,
    intensityBucket,
    classroomSafe,
    privacyStatus: sensitive.length > 0 ? 'blocked' : input.learningCapsule?.privacyStatus || input.privacyStatus || 'redacted_coarse_only',
    safetyStatus: sensitive.length > 0 ? 'blocked' : 'allowed_dry_run',
    reasonCodes: [...(input.robotInterventionPlan?.reasonCodes || []), ...(input.learningCapsule?.reasonCodes || []), 'robot_expression_mapped']
  }, { allowedChannels });
  const plan = {
    expressionFamily: contract.expressionFamily,
    allowedChannels: contract.allowedChannels,
    forbiddenChannels: [...FORBIDDEN_ROBOT_EXPRESSION_CHANNELS],
    displayExpression: contract.allowedChannels.includes('display_expression') ? DISPLAY_BY_FAMILY[contract.expressionFamily] : 'none',
    ledPattern: contract.allowedChannels.includes('led_expression') ? `${contract.expressionFamily}_soft_led` : 'none',
    soundCue: contract.allowedChannels.includes('sound_cue') ? `${contract.expressionFamily}_soft_chime` : 'none',
    motionPolicy: 'locked',
    intensityBucket: contract.intensityBucket,
    shouldInterrupt: false,
    shouldWait: !['review_due_nudge', 'reconnect_hint'].includes(contract.expressionFamily),
    scheduleMutationAllowed: false,
    notificationAllowed: false,
    calendarMutationAllowed: false,
    opensConnection: false,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    privacyStatus: contract.privacyStatus,
    safetyStatus: contract.safetyStatus,
    reasonCodes: contract.reasonCodes
  };
  const safety = assertRobotExpressionSafety(plan, options);
  return safety.ok ? plan : { ...plan, expressionFamily: 'calm_error', safetyStatus: 'blocked', reasonCodes: [...plan.reasonCodes, ...safety.failures] };
}
