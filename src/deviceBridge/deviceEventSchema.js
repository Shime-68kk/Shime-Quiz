import { assertSafeDevicePayload } from './redactionPolicy.js';

export const DEVICE_EVENT_SCHEMA_VERSION = 'shime-device-event-v1';

export const DEVICE_EVENT_TYPES = Object.freeze({
  SESSION_STARTED: 'session_started',
  QUESTION_PRESENTED: 'question_presented',
  ANSWER_CORRECT: 'answer_correct',
  ANSWER_WRONG: 'answer_wrong',
  REVIEW_DUE: 'review_due',
  SESSION_COMPLETE: 'session_complete',
  ROBOT_COMMAND_REQUESTED: 'robot_command_requested',
  ROBOT_COMMAND_ACKNOWLEDGED: 'robot_command_acknowledged',
  BRIDGE_ERROR: 'bridge_error'
});

export const DEVICE_EVENT_SOURCES = Object.freeze({
  SHIME_QUIZ: 'shime-quiz'
});

export const DEVICE_EVENT_PRIVACY_LEVELS = Object.freeze({
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
});

const EVENT_TYPE_VALUES = new Set(Object.values(DEVICE_EVENT_TYPES));
const SOURCE_VALUES = new Set(Object.values(DEVICE_EVENT_SOURCES));

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function makeEventId() {
  if (globalThis.crypto?.randomUUID) return `evt_${globalThis.crypto.randomUUID()}`;
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

function isValidIsoTimestamp(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  const time = Date.parse(value);
  if (!Number.isFinite(time)) return false;
  return new Date(time).toISOString() === value;
}

export function isDeviceEventType(value) {
  return EVENT_TYPE_VALUES.has(value);
}

export function validateDeviceEvent(event) {
  const issues = [];

  if (!isPlainObject(event)) {
    return {
      ok: false,
      error: 'invalid_device_event',
      issues: [makeIssue('event_not_object', 'Device event must be a plain object.')]
    };
  }

  if (event.schemaVersion !== DEVICE_EVENT_SCHEMA_VERSION) {
    issues.push(makeIssue('invalid_schema_version', `schemaVersion must be ${DEVICE_EVENT_SCHEMA_VERSION}.`, '$.schemaVersion'));
  }

  if (typeof event.eventId !== 'string' || !event.eventId.trim()) {
    issues.push(makeIssue('invalid_event_id', 'eventId must be a non-empty string.', '$.eventId'));
  }

  if (!isDeviceEventType(event.eventType)) {
    issues.push(makeIssue('invalid_event_type', 'eventType must be a recognized Device Bridge event type.', '$.eventType'));
  }

  if (!isValidIsoTimestamp(event.emittedAt)) {
    issues.push(makeIssue('invalid_emitted_at', 'emittedAt must be a valid ISO timestamp.', '$.emittedAt'));
  }

  if (typeof event.sessionId !== 'string' || !event.sessionId.trim()) {
    issues.push(makeIssue('invalid_session_id', 'sessionId must be a non-empty string.', '$.sessionId'));
  }

  if (!SOURCE_VALUES.has(event.source)) {
    issues.push(makeIssue('invalid_source', 'source must be recognized.', '$.source'));
  }

  if (!isPlainObject(event.payload)) {
    issues.push(makeIssue('invalid_payload', 'payload must be a plain object.', '$.payload'));
  } else {
    issues.push(...assertSafeDevicePayload(event.payload).issues);
  }

  return {
    ok: issues.length === 0,
    error: issues.length ? 'invalid_device_event' : null,
    issues
  };
}

export function createDeviceEvent(input = {}) {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      event: null,
      error: 'invalid_device_event_input',
      issues: [makeIssue('input_not_object', 'Device event input must be a plain object.')]
    };
  }

  const event = {
    schemaVersion: input.schemaVersion || DEVICE_EVENT_SCHEMA_VERSION,
    eventId: input.eventId || makeEventId(),
    eventType: input.eventType,
    emittedAt: input.emittedAt || new Date().toISOString(),
    sessionId: input.sessionId,
    source: input.source || DEVICE_EVENT_SOURCES.SHIME_QUIZ,
    payload: isPlainObject(input.payload) ? { ...input.payload } : input.payload
  };

  const validation = validateDeviceEvent(event);
  if (!validation.ok) {
    return {
      ok: false,
      event: null,
      error: validation.error,
      issues: validation.issues
    };
  }

  return {
    ok: true,
    event,
    error: null,
    issues: []
  };
}
