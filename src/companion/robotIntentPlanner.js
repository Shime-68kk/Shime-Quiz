import { governCompanionDecision } from './safetyGovernor.js';

export const SAFE_ROBOT_COMMANDS = Object.freeze([
  'neutral',
  'focus',
  'encourage',
  'celebrate',
  'due_review',
  'session_complete',
  'error_signal'
]);

function commandForActionFamily(actionFamily) {
  return SAFE_ROBOT_COMMANDS.includes(actionFamily) ? actionFamily : 'neutral';
}

export function planRobotIntent(decision = {}, context = {}, history = []) {
  const governed = governCompanionDecision(decision, context, history);
  const command = governed.allowed ? commandForActionFamily(governed.actionFamily) : 'neutral';

  return {
    ok: governed.allowed,
    command,
    mode: governed.decision.shouldMove ? 'future_motion_review' : 'expression_only',
    intensity: governed.decision.urgency === 'high' ? 'medium' : 'low',
    reasonCodes: governed.reasonCodes,
    payload: {
      command,
      reasonCode: governed.reasonCodes[0] || 'neutral_fallback'
    }
  };
}
