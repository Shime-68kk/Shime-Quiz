import { createDeviceBridgeFacade } from './deviceBridgeFacade.js';
import { getSharedDeviceBridgeFacade } from './deviceBridgeRuntime.js';
import { sanitizeDevicePayload } from './redactionPolicy.js';

const ADAPTER_INPUT_KEYS = Object.freeze([
  'sessionId',
  'itemIndex',
  'itemType',
  'progressCount',
  'totalCount',
  'status',
  'scoreBucket',
  'accuracyBucket',
  'dueCountBucket',
  'bridgeStatus',
  'transportStatus',
  'reasonCode',
  'message'
]);

const ADAPTER_INPUT_KEY_SET = new Set(ADAPTER_INPUT_KEYS);

const EVENT_METHODS = Object.freeze({
  sessionStarted: 'session_started',
  questionPresented: 'question_presented',
  answerCorrect: 'answer_correct',
  answerWrong: 'answer_wrong',
  reviewDue: 'review_due',
  sessionComplete: 'session_complete',
  bridgeError: 'bridge_error'
});

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeFailure(reason, message, issues = []) {
  return {
    ok: false,
    reason,
    message,
    issues
  };
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function sanitizeAdapterInput(input) {
  if (!isPlainObject(input)) {
    return makeFailure(
      'invalid_studyroom_bridge_input',
      'StudyRoom bridge input must be a plain object.',
      [makeIssue('input_not_object', 'StudyRoom bridge input must be a plain object.')]
    );
  }

  const unknownIssues = Object.keys(input)
    .filter(key => !ADAPTER_INPUT_KEY_SET.has(key))
    .map(key => makeIssue('adapter_field_not_allowed', `StudyRoom bridge field is not allowed: ${key}`, `$.${key}`));

  if (unknownIssues.length > 0) {
    return makeFailure('unsafe_studyroom_bridge_input', 'StudyRoom bridge input failed privacy validation.', unknownIssues);
  }

  const payloadCandidate = Object.fromEntries(Object.entries(input).filter(([key]) => key !== 'sessionId'));
  const sanitized = sanitizeDevicePayload(payloadCandidate);
  if (!sanitized.ok) {
    return makeFailure('unsafe_studyroom_bridge_input', 'StudyRoom bridge input failed privacy validation.', sanitized.issues);
  }

  return {
    ok: true,
    input: {
      sessionId: input.sessionId,
      ...sanitized.payload
    },
    issues: []
  };
}

function safeEmit(facade, eventName, input) {
  const sanitized = sanitizeAdapterInput(input);
  if (!sanitized.ok) return sanitized;

  try {
    return facade.emitStudyEvent(eventName, sanitized.input);
  } catch {
    return makeFailure('studyroom_bridge_emit_failed', 'StudyRoom bridge emit failed safely.');
  }
}

export function createStudyRoomBridgeAdapter(options = {}) {
  const useIsolatedFacade = Object.prototype.hasOwnProperty.call(options, 'enabled') || Object.prototype.hasOwnProperty.call(options, 'connectMock');
  const facade = options.facade || (
    useIsolatedFacade
      ? createDeviceBridgeFacade({ enabled: options.enabled === true })
      : getSharedDeviceBridgeFacade()
  );
  if (!options.facade && options.enabled === true && options.connectMock === true) {
    facade.connectMock();
  }

  return {
    sessionStarted(input) {
      return safeEmit(facade, EVENT_METHODS.sessionStarted, input);
    },

    questionPresented(input) {
      return safeEmit(facade, EVENT_METHODS.questionPresented, input);
    },

    answerCorrect(input) {
      return safeEmit(facade, EVENT_METHODS.answerCorrect, input);
    },

    answerWrong(input) {
      return safeEmit(facade, EVENT_METHODS.answerWrong, input);
    },

    reviewDue(input) {
      return safeEmit(facade, EVENT_METHODS.reviewDue, input);
    },

    sessionComplete(input) {
      return safeEmit(facade, EVENT_METHODS.sessionComplete, input);
    },

    bridgeError(input) {
      return safeEmit(facade, EVENT_METHODS.bridgeError, input);
    },

    getSnapshot() {
      return facade.getSnapshot();
    },

    getDebugEvents() {
      return facade.getDebugEvents();
    }
  };
}
