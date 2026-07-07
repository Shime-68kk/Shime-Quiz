import {
  FORBIDDEN_COMPANION_KEYS,
  collectForbiddenCompanionKeys
} from './companionContextSchema.js';
import { SAFE_ROBOT_COMMANDS } from './robotIntentPlanner.js';

export const COMPANION_ROBOT_PROTOCOL_VERSION = 'shime-companion-robot-intent-v0';
export const COMPANION_ROBOT_MESSAGE_TYPE = 'robot_command';

export const ALLOWED_COMPANION_ROBOT_PAYLOAD_KEYS = Object.freeze([
  'command',
  'reasonCode',
  'intensityBucket',
  'safetyMode',
  'transportStatus'
]);

function safeIntensity(value) {
  return ['low', 'medium', 'high'].includes(value) ? value : 'low';
}

function safeTransport(value) {
  return ['unknown', 'disabled', 'disconnected', 'connecting', 'connected', 'error'].includes(value) ? value : 'unknown';
}

function safeMode(value) {
  return ['motion_disabled', 'expression_only', 'privacy_locked', 'classroom_safe', 'future_motion_review'].includes(value)
    ? value
    : 'motion_disabled';
}

export function createCompanionRobotCommandEnvelope(robotIntent = {}, context = {}, options = {}) {
  const forbidden = collectForbiddenCompanionKeys({ robotIntent, context });
  if (forbidden.length > 0) {
    return {
      ok: false,
      envelope: null,
      reason: 'forbidden_companion_robot_payload',
      issues: forbidden
    };
  }

  const command = SAFE_ROBOT_COMMANDS.includes(robotIntent.command) ? robotIntent.command : null;
  if (!command) {
    return {
      ok: false,
      envelope: null,
      reason: 'unknown_robot_command',
      issues: [{ code: 'unknown_robot_command', message: 'Robot command is not allowed.', path: '$.command' }]
    };
  }

  const safetyState = context.safetyState || {};
  const sessionState = context.sessionState || {};
  const payload = {
    command,
    reasonCode: String(robotIntent.reasonCodes?.[0] || robotIntent.payload?.reasonCode || 'companion_intent'),
    intensityBucket: safeIntensity(robotIntent.intensity),
    safetyMode: safeMode(robotIntent.mode === 'future_motion_review' ? 'future_motion_review' : safetyState.safetyMode),
    transportStatus: safeTransport(sessionState.transportStatus)
  };

  return {
    ok: true,
    envelope: {
      protocolVersion: COMPANION_ROBOT_PROTOCOL_VERSION,
      messageId: options.messageId || `companion_robot_${options.step ?? 0}`,
      messageType: COMPANION_ROBOT_MESSAGE_TYPE,
      emittedAt: options.emittedAt || '1970-01-01T00:00:00.000Z',
      source: 'shime-companion-kernel',
      payload
    },
    issues: []
  };
}

export function containsForbiddenRobotProtocolKey(value) {
  return collectForbiddenCompanionKeys(value).length > 0 ||
    JSON.stringify(value).split('"').some(token => FORBIDDEN_COMPANION_KEYS.includes(token));
}
