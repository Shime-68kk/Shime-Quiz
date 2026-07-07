import { deriveAllowedActionFamilies } from './transportCapabilityModel.js';

function base(fields = {}) {
  return {
    interventionFamily: 'neutral_presence',
    emotionalTone: 'calm',
    intensityBucket: 'low',
    suggestedExpression: 'soft_idle',
    suggestedLightPattern: 'steady_dim',
    suggestedSoundCue: 'none',
    suggestedMotionPolicy: 'locked',
    timingWindowBucket: 'next_safe_pause',
    shouldInterrupt: false,
    shouldWait: true,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['robot_plan_created'],
    ...fields
  };
}

export function planRobotIntervention(capsule = {}, options = {}) {
  if (capsule.privacyStatus !== 'redacted_coarse_only') {
    return base({ interventionFamily: 'calm_error', emotionalTone: 'quiet', reasonCodes: ['privacy_not_safe'] });
  }
  if (['disconnected', 'error', 'disabled'].includes(capsule.transportHealth)) {
    return base({ interventionFamily: 'reconnect_hint', suggestedExpression: 'quiet_wait', reasonCodes: ['transport_not_safe'] });
  }
  if (capsule.robotAvailability === 'offline' || capsule.robotAvailability === 'unhealthy') {
    return base({ interventionFamily: 'do_nothing', reasonCodes: ['robot_unavailable'] });
  }

  let plan = base();
  if (['high', 'very_high'].includes(capsule.recoveryNeedBucket)) {
    plan = base({ interventionFamily: 'gentle_encourage', emotionalTone: 'warm', suggestedExpression: 'supportive', reasonCodes: ['recovery_need_high'] });
  } else if (['high', 'very_high'].includes(capsule.duePressureBucket)) {
    plan = base({ interventionFamily: 'review_due_nudge', emotionalTone: 'focused', suggestedLightPattern: 'slow_pulse', reasonCodes: ['due_pressure_high'] });
  } else if (['high', 'very_high'].includes(capsule.forgettingRiskBucket)) {
    plan = base({ interventionFamily: 'memory_risk_nudge', emotionalTone: 'gentle', suggestedExpression: 'focus_soft', reasonCodes: ['forgetting_risk_high'] });
  } else if (capsule.companionIntent === 'recovery_praise') {
    plan = base({ interventionFamily: 'recovery_praise', emotionalTone: 'warm', suggestedExpression: 'small_smile', reasonCodes: ['recovery_detected'] });
  } else if (capsule.sessionPhase === 'complete' && capsule.stabilityBucket === 'high') {
    plan = base({ interventionFamily: 'celebrate_stability_gain', emotionalTone: 'cheerful', suggestedLightPattern: 'soft_success', reasonCodes: ['stability_gain'] });
  } else if (capsule.sessionPhase === 'complete') {
    plan = base({ interventionFamily: 'celebrate_session_complete', emotionalTone: 'cheerful', suggestedExpression: 'small_smile', reasonCodes: ['session_complete'] });
  }

  const allowed = deriveAllowedActionFamilies(options.robotProfile || {}, capsule.safetyMode);
  if (!allowed.includes(plan.interventionFamily)) {
    plan = base({ interventionFamily: 'neutral_presence', reasonCodes: ['capability_limited'] });
  }
  if (capsule.safetyMode === 'classroom_safe') {
    plan.intensityBucket = 'low';
    plan.shouldInterrupt = false;
    plan.reasonCodes = [...plan.reasonCodes, 'classroom_safe_reduced'];
  }
  return plan;
}
