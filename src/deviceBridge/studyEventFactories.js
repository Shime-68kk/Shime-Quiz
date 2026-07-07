import { createDeviceEvent, DEVICE_EVENT_TYPES } from './deviceEventSchema.js';
import { createPrivacySafeFailure, sanitizeDevicePayload } from './redactionPolicy.js';

const PAYLOAD_DEFAULTS_BY_EVENT_TYPE = Object.freeze({
  [DEVICE_EVENT_TYPES.ANSWER_CORRECT]: { status: 'correct' },
  [DEVICE_EVENT_TYPES.ANSWER_WRONG]: { status: 'wrong' }
});

function toFactoryFailure(reason, message, issues = []) {
  return {
    ...createPrivacySafeFailure(reason, message),
    issues
  };
}

function makePayloadCandidate(input, defaults = {}) {
  return Object.fromEntries(
    Object.entries({ ...defaults, ...input }).filter(([key]) => key !== 'sessionId')
  );
}

function createStudyEvent(eventType, input = {}) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return toFactoryFailure(
      'invalid_factory_input',
      'Study event factory input must be a plain object.',
      [{ code: 'input_not_object', message: 'Study event factory input must be a plain object.', path: '$' }]
    );
  }

  const sanitized = sanitizeDevicePayload(makePayloadCandidate(input, PAYLOAD_DEFAULTS_BY_EVENT_TYPE[eventType]));
  if (!sanitized.ok) {
    return toFactoryFailure('unsafe_device_payload', 'Study event payload failed privacy validation.', sanitized.issues);
  }

  const created = createDeviceEvent({
    eventType,
    sessionId: input.sessionId,
    payload: sanitized.payload
  });

  if (!created.ok) {
    return toFactoryFailure('invalid_device_event', 'Study event could not be created.', created.issues);
  }

  return {
    ok: true,
    event: created.event
  };
}

export function createSessionStartedEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.SESSION_STARTED, input);
}

export function createQuestionPresentedEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.QUESTION_PRESENTED, input);
}

export function createAnswerCorrectEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.ANSWER_CORRECT, input);
}

export function createAnswerWrongEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.ANSWER_WRONG, input);
}

export function createReviewDueEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.REVIEW_DUE, input);
}

export function createSessionCompleteEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.SESSION_COMPLETE, input);
}

export function createBridgeErrorEvent(input) {
  return createStudyEvent(DEVICE_EVENT_TYPES.BRIDGE_ERROR, input);
}
