export const COMPANION_V2_INTENTS = Object.freeze([
  'neutral_wait',
  'focus_gently',
  'encourage',
  'celebrate_small',
  'celebrate_big',
  'suggest_break',
  'review_reminder',
  'reconnect_hint',
  'calm_error',
  'idle_presence',
  'recovery_praise',
  'steady_progress'
]);

function decision(fields = {}) {
  return {
    intent: 'neutral_wait',
    tone: 'calm',
    intensityBucket: 'low',
    reasonCodes: [],
    confidenceBucket: 'medium',
    recommendedRobotActionFamily: 'neutral',
    shouldNotify: false,
    shouldSpeak: false,
    shouldMove: false,
    ...fields
  };
}

export function createAdaptiveCompanionDecision(context = {}, session = {}, memory = {}, options = {}) {
  const safety = context.safetyState || {};
  const transport = session.transportHealth || context.sessionState?.transportStatus;
  if (safety.privacyLock === false || session.rejectedReason === 'forbidden_companion_key') {
    return decision({ intent: 'calm_error', tone: 'quiet', reasonCodes: ['privacy_lock_failed'], confidenceBucket: 'high' });
  }
  if (['disconnected', 'error', 'disabled'].includes(transport)) {
    return decision({ intent: 'reconnect_hint', tone: 'quiet', reasonCodes: ['transport_unsafe'], recommendedRobotActionFamily: 'neutral', confidenceBucket: 'high' });
  }
  if (session.robotAvailability === 'offline' || session.robotAvailability === 'unhealthy') {
    return decision({ intent: 'calm_error', tone: 'quiet', reasonCodes: ['robot_unavailable'], confidenceBucket: 'high' });
  }
  if (session.reviewUrgencyBucket === 'high') {
    return decision({ intent: 'review_reminder', reasonCodes: ['review_due'], recommendedRobotActionFamily: 'due_review', shouldNotify: true });
  }
  if (session.sessionPhase === 'complete') {
    if (session.completionQualityBucket === 'high') {
      return decision({ intent: options.profile === 'premium_showcase' && session.correctStreakBucket === 'large' ? 'celebrate_big' : 'celebrate_small', tone: 'cheerful', reasonCodes: ['session_complete_high_accuracy'], recommendedRobotActionFamily: 'session_complete', confidenceBucket: 'high' });
    }
    if (session.completionQualityBucket === 'low') {
      return decision({ intent: 'encourage', tone: 'calm', reasonCodes: ['session_complete_low_accuracy'], recommendedRobotActionFamily: 'encourage' });
    }
    return decision({ intent: 'celebrate_small', reasonCodes: ['session_complete'], recommendedRobotActionFamily: 'session_complete' });
  }
  if (session.recoveryBucket === 'strong' || session.recoveryBucket === 'small') {
    return decision({ intent: 'recovery_praise', tone: 'cheerful', reasonCodes: ['recovery_detected'], recommendedRobotActionFamily: 'encourage', confidenceBucket: 'high' });
  }
  if (session.repeatedWrongCountBucket === 'three_plus') {
    return decision({ intent: 'suggest_break', tone: 'calm', intensityBucket: 'medium', reasonCodes: ['repeated_wrong_high'], recommendedRobotActionFamily: 'encourage' });
  }
  if (session.struggleBucket === 'medium') {
    return decision({ intent: 'encourage', tone: 'calm', reasonCodes: ['struggle_detected'], recommendedRobotActionFamily: 'encourage' });
  }
  if (session.correctStreakBucket === 'large') {
    return decision({ intent: 'celebrate_small', tone: 'cheerful', reasonCodes: ['correct_streak'], recommendedRobotActionFamily: 'celebrate' });
  }
  if (session.correctStreakBucket === 'medium') {
    return decision({ intent: 'steady_progress', reasonCodes: ['steady_progress'], recommendedRobotActionFamily: 'focus' });
  }
  if (session.sessionPhase === 'question' || session.sessionPhase === 'starting') {
    return decision({ intent: 'focus_gently', reasonCodes: ['study_focus'], recommendedRobotActionFamily: 'focus' });
  }
  return decision({ intent: 'idle_presence', reasonCodes: ['no_action_needed'] });
}

