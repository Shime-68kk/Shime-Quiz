import { validateDeviceEvent } from '../deviceEventSchema.js';
import { assertSafeDevicePayload } from '../redactionPolicy.js';

export const TRANSPORT_KINDS = Object.freeze({
  NOOP: 'noop',
  LOOPBACK: 'loopback',
  MOCK: 'mock'
});

export const TRANSPORT_STATES = Object.freeze({
  DISABLED: 'disabled',
  DISCONNECTED: 'disconnected',
  CONNECTED: 'connected',
  ERROR: 'error'
});

export const ROBOT_PROTOCOL_VERSION = 'shime-robot-protocol-v0';

export const ROBOT_MESSAGE_TYPES = Object.freeze({
  ROBOT_EVENT: 'robot_event',
  ROBOT_COMMAND: 'robot_command',
  ROBOT_STATUS_REQUEST: 'robot_status_request',
  ROBOT_DISCONNECT: 'robot_disconnect',
  ROBOT_PING: 'robot_ping'
});

export const ROBOT_COMMAND_NAMES = Object.freeze({
  CELEBRATE: 'celebrate',
  ENCOURAGE: 'encourage',
  NEUTRAL: 'neutral',
  FOCUS: 'focus',
  SESSION_COMPLETE: 'session_complete',
  DUE_REVIEW: 'due_review',
  ERROR_SIGNAL: 'error_signal'
});

const MESSAGE_TYPE_VALUES = new Set(Object.values(ROBOT_MESSAGE_TYPES));
const COMMAND_NAME_VALUES = new Set(Object.values(ROBOT_COMMAND_NAMES));

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function makeMessageId() {
  if (globalThis.crypto?.randomUUID) return `robot_msg_${globalThis.crypto.randomUUID()}`;
  return `robot_msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isValidRobotTimestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return false;
  return new Date(time).toISOString() === value;
}

export function createTransportResult(ok, fields = {}) {
  return {
    ok: ok === true,
    ...fields
  };
}

export function validateTransportEvent(event) {
  const validation = validateDeviceEvent(event);
  if (!validation.ok) {
    return {
      ok: false,
      error: 'invalid_transport_event',
      issues: validation.issues
    };
  }

  return {
    ok: true,
    error: null,
    issues: []
  };
}

export function validateRobotCommandName(command) {
  if (!COMMAND_NAME_VALUES.has(command)) {
    return {
      ok: false,
      error: 'invalid_robot_command',
      issues: [makeIssue('invalid_robot_command', 'Robot command is not recognized.', '$.payload.command')]
    };
  }

  return {
    ok: true,
    error: null,
    issues: []
  };
}

export function createTransportEnvelope(event, options = {}) {
  const eventValidation = validateTransportEvent(event);
  if (!eventValidation.ok) {
    return createTransportResult(false, {
      error: eventValidation.error,
      issues: eventValidation.issues,
      envelope: null
    });
  }

  const messageType = options.messageType || ROBOT_MESSAGE_TYPES.ROBOT_EVENT;
  const issues = [];

  if (!MESSAGE_TYPE_VALUES.has(messageType)) {
    issues.push(makeIssue('invalid_robot_message_type', 'Robot message type is not recognized.', '$.messageType'));
  }

  const emittedAt = options.emittedAt || new Date().toISOString();
  if (!isValidRobotTimestamp(emittedAt)) {
    issues.push(makeIssue('invalid_robot_emitted_at', 'Robot message emittedAt must be a valid ISO timestamp.', '$.emittedAt'));
  }

  if (issues.length > 0) {
    return createTransportResult(false, {
      error: 'invalid_transport_envelope',
      issues,
      envelope: null
    });
  }

  return createTransportResult(true, {
    envelope: {
      protocolVersion: ROBOT_PROTOCOL_VERSION,
      messageId: options.messageId || makeMessageId(),
      messageType,
      emittedAt,
      source: options.source || 'shime-quiz',
      payload: {
        eventId: event.eventId,
        eventType: event.eventType,
        eventEmittedAt: event.emittedAt,
        sessionId: event.sessionId,
        data: { ...event.payload }
      }
    },
    error: null,
    issues: []
  });
}

export function createRobotCommandEnvelope(command, payload = {}, options = {}) {
  const commandValidation = validateRobotCommandName(command);
  if (!commandValidation.ok) {
    return createTransportResult(false, {
      error: commandValidation.error,
      issues: commandValidation.issues,
      envelope: null
    });
  }

  if (!isPlainObject(payload)) {
    return createTransportResult(false, {
      error: 'invalid_robot_command_payload',
      issues: [makeIssue('invalid_robot_command_payload', 'Robot command payload must be a plain object.', '$.payload')],
      envelope: null
    });
  }

  const sanitized = assertSafeDevicePayload({ command, ...payload });
  if (!sanitized.ok) {
    return createTransportResult(false, {
      error: 'unsafe_robot_command_payload',
      issues: sanitized.issues,
      envelope: null
    });
  }

  const emittedAt = options.emittedAt || new Date().toISOString();
  if (!isValidRobotTimestamp(emittedAt)) {
    return createTransportResult(false, {
      error: 'invalid_robot_command_envelope',
      issues: [makeIssue('invalid_robot_emitted_at', 'Robot command emittedAt must be a valid ISO timestamp.', '$.emittedAt')],
      envelope: null
    });
  }

  return createTransportResult(true, {
    envelope: {
      protocolVersion: ROBOT_PROTOCOL_VERSION,
      messageId: options.messageId || makeMessageId(),
      messageType: ROBOT_MESSAGE_TYPES.ROBOT_COMMAND,
      emittedAt,
      source: options.source || 'shime-quiz',
      payload: sanitized.payload
    },
    error: null,
    issues: []
  });
}

