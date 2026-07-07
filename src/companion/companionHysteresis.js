import { shouldSuppressBehavior } from './companionBehaviorMemory.js';

export function applyCompanionHysteresis(decision = {}, memory = {}, session = {}, options = {}) {
  const reasons = [];
  let adjustedIntent = decision.intent || 'neutral_wait';
  let adjustedTone = decision.tone || 'calm';
  let adjustedIntensityBucket = decision.intensityBucket || 'low';
  let action = decision.recommendedRobotActionFamily || 'neutral';
  let downgradeApplied = false;

  if (['disconnected', 'error', 'disabled'].includes(session.transportHealth) || options.transportUnsafe) {
    return {
      ...decision,
      adjustedIntent: 'reconnect_hint',
      adjustedTone: 'quiet',
      adjustedIntensityBucket: 'low',
      recommendedRobotActionFamily: 'neutral',
      reasonCodes: [...(decision.reasonCodes || []), 'transport_unsafe'],
      downgradeApplied: true
    };
  }

  if (options.profile === 'classroom_safe' || session.safetyMode === 'classroom_safe') {
    adjustedIntensityBucket = 'low';
    if (adjustedIntent === 'celebrate_big') adjustedIntent = 'celebrate_small';
    reasons.push('classroom_safe_conservative');
    downgradeApplied = true;
  }

  if (adjustedIntent === 'celebrate_big' && session.correctStreakBucket !== 'large') {
    adjustedIntent = 'celebrate_small';
    adjustedIntensityBucket = 'low';
    reasons.push('celebration_threshold_not_met');
    downgradeApplied = true;
  }

  if (adjustedIntent === 'suggest_break' && !['three_plus'].includes(session.repeatedWrongCountBucket)) {
    adjustedIntent = 'encourage';
    action = 'encourage';
    reasons.push('break_suggestion_delayed');
    downgradeApplied = true;
  }

  if (shouldSuppressBehavior(memory, adjustedIntent) || shouldSuppressBehavior(memory, action)) {
    adjustedIntent = adjustedIntent.includes('celebrate') ? 'steady_progress' : 'neutral_wait';
    action = adjustedIntent === 'steady_progress' ? 'focus' : 'neutral';
    adjustedIntensityBucket = 'low';
    reasons.push('behavior_rate_limited');
    downgradeApplied = true;
  }

  return {
    ...decision,
    adjustedIntent,
    adjustedTone,
    adjustedIntensityBucket,
    recommendedRobotActionFamily: action,
    reasonCodes: [...(decision.reasonCodes || []), ...reasons],
    downgradeApplied
  };
}

