import { validateCompanionContext } from './companionContextSchema.js';
import { getPremiumExperienceProfile } from './premiumExperienceProfiles.js';

function decision(fields) {
  return {
    intent: 'idle_presence',
    tone: 'calm',
    urgency: 'low',
    reasonCodes: [],
    allowedRobotActionFamily: 'neutral',
    shouldSpeak: false,
    shouldMove: false,
    shouldNotify: false,
    ...fields
  };
}

export function createCompanionDecision(inputContext = {}) {
  const validation = validateCompanionContext(inputContext);
  if (!validation.ok) {
    return decision({
      intent: 'calm_error',
      urgency: 'high',
      reasonCodes: ['invalid_or_sensitive_context'],
      allowedRobotActionFamily: 'error_signal'
    });
  }

  const context = validation.context;
  const profile = getPremiumExperienceProfile(context.userExperienceMode);
  const learning = context.learningState;
  const performance = context.performanceState;
  const presence = context.robotPresenceState;
  const safety = context.safetyState;

  if (!safety.privacyLock) {
    return decision({
      intent: 'calm_error',
      tone: 'quiet',
      urgency: 'high',
      reasonCodes: ['privacy_lock_failed'],
      allowedRobotActionFamily: 'neutral'
    });
  }

  if (context.sessionState.transportStatus === 'disconnected' || context.sessionState.transportStatus === 'error') {
    return decision({
      intent: 'reconnect_hint',
      tone: 'quiet',
      urgency: 'medium',
      reasonCodes: ['transport_not_ready'],
      allowedRobotActionFamily: 'error_signal',
      shouldNotify: profile.allowNotify
    });
  }

  if (presence.robotAvailability === 'unhealthy' || presence.robotAvailability === 'offline') {
    return decision({
      intent: 'calm_error',
      tone: 'quiet',
      urgency: 'medium',
      reasonCodes: ['robot_presence_unavailable'],
      allowedRobotActionFamily: 'error_signal'
    });
  }

  if (learning.reviewUrgencyBucket === 'high' || learning.sessionPhase === 'review') {
    return decision({
      intent: 'review_reminder',
      tone: profile.tone,
      urgency: learning.reviewUrgencyBucket === 'high' ? 'high' : 'medium',
      reasonCodes: ['review_due'],
      allowedRobotActionFamily: 'due_review',
      shouldNotify: profile.allowNotify
    });
  }

  if (performance.frustrationRiskBucket === 'high') {
    return decision({
      intent: 'suggest_break',
      tone: 'calm',
      urgency: 'medium',
      reasonCodes: ['frustration_risk_high'],
      allowedRobotActionFamily: 'encourage',
      shouldSpeak: profile.allowNotify
    });
  }

  if (learning.sessionPhase === 'complete') {
    const high = performance.accuracyBucket === 'high';
    return decision({
      intent: high && profile.celebrationStyle === 'big' ? 'celebrate_big' : 'celebrate_small',
      tone: profile.tone,
      urgency: 'low',
      reasonCodes: [high ? 'session_complete_high_accuracy' : 'session_complete'],
      allowedRobotActionFamily: 'session_complete',
      shouldSpeak: profile.allowNotify
    });
  }

  if (performance.momentumBucket === 'streak') {
    return decision({
      intent: profile.celebrationStyle === 'none' ? 'focus_gently' : 'celebrate_small',
      tone: profile.tone,
      urgency: 'low',
      reasonCodes: ['positive_streak'],
      allowedRobotActionFamily: profile.celebrationStyle === 'none' ? 'focus' : 'celebrate'
    });
  }

  if (performance.frustrationRiskBucket === 'medium') {
    return decision({
      intent: 'encourage',
      tone: 'calm',
      urgency: 'low',
      reasonCodes: ['recent_wrong_answer'],
      allowedRobotActionFamily: 'encourage'
    });
  }

  if (learning.sessionPhase === 'question' || learning.sessionPhase === 'starting') {
    return decision({
      intent: 'focus_gently',
      tone: profile.tone,
      urgency: 'low',
      reasonCodes: ['study_focus'],
      allowedRobotActionFamily: 'focus'
    });
  }

  if (presence.presenceBucket === 'approaching' || presence.approachVelocityBucket === 'approaching_fast') {
    return decision({
      intent: 'idle_presence',
      tone: profile.tone,
      urgency: 'low',
      reasonCodes: ['user_presence_detected'],
      allowedRobotActionFamily: 'neutral'
    });
  }

  return decision({
    intent: 'neutral_wait',
    tone: profile.tone,
    reasonCodes: ['no_action_needed'],
    allowedRobotActionFamily: 'neutral'
  });
}
