import { collectForbiddenCompanionKeys } from './companionContextSchema.js';

export function governCompanionDecision(decision = {}, context = {}, history = []) {
  const forbidden = collectForbiddenCompanionKeys({ decision, context });
  if (forbidden.length > 0) {
    return {
      allowed: false,
      decision: { ...decision, shouldMove: false, allowedRobotActionFamily: 'neutral' },
      actionFamily: 'neutral',
      reasonCodes: ['sensitive_context_blocked'],
      issues: forbidden
    };
  }

  const reasons = [];
  const safetyState = context.safetyState || {};
  const sessionState = context.sessionState || {};
  const next = { ...decision };

  if (safetyState.privacyLock === false) {
    return {
      allowed: false,
      decision: { ...next, shouldMove: false, allowedRobotActionFamily: 'neutral' },
      actionFamily: 'neutral',
      reasonCodes: ['privacy_lock_failed'],
      issues: []
    };
  }

  if (['disabled', 'disconnected', 'error'].includes(sessionState.transportStatus)) {
    return {
      allowed: false,
      decision: { ...next, shouldMove: false, allowedRobotActionFamily: 'neutral' },
      actionFamily: 'neutral',
      reasonCodes: ['transport_unsafe'],
      issues: []
    };
  }

  if (next.shouldMove && safetyState.motionAllowed !== true) {
    next.shouldMove = false;
    reasons.push('motion_downgraded_by_default');
  }

  const recentCelebrations = history.filter(entry => entry === 'celebrate' || entry?.actionFamily === 'celebrate').length;
  if (next.allowedRobotActionFamily === 'celebrate' && recentCelebrations >= 2) {
    next.allowedRobotActionFamily = 'focus';
    reasons.push('celebration_rate_limited');
  }

  if (safetyState.childSafeMode !== false && next.urgency === 'high' && next.allowedRobotActionFamily === 'celebrate') {
    next.allowedRobotActionFamily = 'focus';
    reasons.push('student_safe_mode_reduced_intensity');
  }

  return {
    allowed: true,
    decision: next,
    actionFamily: next.allowedRobotActionFamily || 'neutral',
    reasonCodes: reasons.length ? reasons : ['allowed_expression_only'],
    issues: []
  };
}
