import { checkCompanionOutputForSensitiveData } from './companionInvariants.js';

function commandFamily(decision = {}) {
  return decision.finalRobotIntent || decision.allowedRobotActionFamily || decision.recommendedRobotActionFamily || decision.command || 'neutral';
}

function intentFamily(decision = {}) {
  const intent = decision.adjustedIntent || decision.intent || decision.policyIntent || 'neutral_wait';
  if (intent.includes('celebrate')) return 'celebrate';
  if (intent.includes('error')) return 'error';
  if (intent.includes('reconnect')) return 'reconnect';
  if (intent.includes('break')) return 'break';
  if (intent.includes('review')) return 'review';
  if (intent.includes('focus')) return 'focus';
  if (intent.includes('encourage') || intent.includes('recovery')) return 'support';
  return 'neutral';
}

export function compareCompanionPolicies(v1Decision = {}, v2Decision = {}, options = {}) {
  const sensitive = checkCompanionOutputForSensitiveData({ v1: v1Decision, v2: v2Decision });
  const v1Intent = intentFamily(v1Decision);
  const v2Intent = intentFamily(v2Decision);
  const v1Command = commandFamily(v1Decision);
  const v2Command = commandFamily(v2Decision);
  const v1Unsafe = v1Decision.shouldMove === true || !Array.isArray(v1Decision.reasonCodes);
  const v2Unsafe = v2Decision.shouldMove === true || !Array.isArray(v2Decision.reasonCodes);
  let label = 'equivalent';
  if (!v1Unsafe && v2Unsafe) label = 'possible_regression';
  else if (v1Unsafe && !v2Unsafe) label = 'v2_improved';
  else if (v1Intent !== v2Intent || v1Command !== v2Command) label = options.strict ? 'needs_human_review' : 'equivalent';

  return {
    label,
    intentFamily: { v1: v1Intent, v2: v2Intent },
    commandFamily: { v1: v1Command, v2: v2Command },
    safetyOutcome: v2Unsafe ? 'possible_regression' : 'safe',
    privacyStatus: sensitive.ok ? 'redacted_coarse_only' : 'blocked',
    reasonCodePresence: {
      v1: Array.isArray(v1Decision.reasonCodes) && v1Decision.reasonCodes.length > 0,
      v2: Array.isArray(v2Decision.reasonCodes) && v2Decision.reasonCodes.length > 0
    },
    noSensitiveOutput: sensitive.ok
  };
}
