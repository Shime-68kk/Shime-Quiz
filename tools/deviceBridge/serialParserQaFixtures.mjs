import {
  EVENT_TO_ACTION,
  FORBIDDEN_PROTOCOL_KEYS,
  PROTOCOL_VERSION,
  getRobotActionForEvent,
  protocolFixtures
} from './protocolFixtures.mjs';

export const SERIAL_QA_ALLOWED_COMMANDS = Object.freeze([
  'celebrate',
  'encourage',
  'neutral',
  'focus',
  'session_complete',
  'due_review',
  'error_signal'
]);

function envelope(name, messageId, messageType, payload, expected = {}) {
  return {
    name,
    input: JSON.stringify({
      protocolVersion: PROTOCOL_VERSION,
      messageId,
      messageType,
      emittedAt: '2026-06-27T00:00:00.000Z',
      source: 'shime-quiz',
      payload
    }),
    expected: {
      accepted: true,
      kind: messageType,
      reason: 'accepted',
      ...expected
    }
  };
}

function robotEvent(name, fixture) {
  return {
    name,
    input: JSON.stringify(fixture),
    expected: {
      accepted: true,
      kind: 'robot_event',
      eventType: fixture.payload.eventType,
      action: getRobotActionForEvent(fixture.payload.eventType),
      reason: 'accepted'
    }
  };
}

function robotCommand(name, command) {
  return envelope(name, `serial_${name}`, 'robot_command', { command }, {
    kind: 'robot_command',
    command,
    action: command
  });
}

function invalidFixture(name, input, reason) {
  return {
    name,
    input,
    expected: {
      accepted: false,
      reason
    }
  };
}

export const serialParserQaFixtures = Object.freeze({
  hello: envelope('hello', 'serial_hello', 'hello', {
    bridgeStatus: 'enabled',
    transportStatus: 'connecting'
  }),
  ping: envelope('ping', 'serial_ping', 'ping', {
    transportStatus: 'connected'
  }),
  disconnect: envelope('disconnect', 'serial_disconnect', 'disconnect', {
    transportStatus: 'disconnected'
  }),
  sessionStarted: robotEvent('session_started', protocolFixtures.sessionStarted),
  questionPresented: robotEvent('question_presented', protocolFixtures.questionPresented),
  answerCorrect: robotEvent('answer_correct', protocolFixtures.answerCorrect),
  answerWrong: robotEvent('answer_wrong', protocolFixtures.answerWrong),
  reviewDue: robotEvent('review_due', protocolFixtures.reviewDue),
  sessionComplete: robotEvent('session_complete', protocolFixtures.sessionComplete),
  bridgeError: robotEvent('bridge_error', protocolFixtures.bridgeError),
  robotCommandCelebrate: robotCommand('robot_command_celebrate', 'celebrate'),
  robotCommandEncourage: robotCommand('robot_command_encourage', 'encourage'),
  robotCommandNeutral: robotCommand('robot_command_neutral', 'neutral'),
  robotCommandFocus: robotCommand('robot_command_focus', 'focus'),
  robotCommandSessionComplete: robotCommand('robot_command_session_complete', 'session_complete'),
  robotCommandDueReview: robotCommand('robot_command_due_review', 'due_review'),
  robotCommandErrorSignal: robotCommand('robot_command_error_signal', 'error_signal'),
  invalidUnknownEvent: envelope('invalid_unknown_event', 'serial_invalid_event', 'robot_event', {
    eventType: 'show_answer',
    sessionId: 'serial_fixture_session'
  }, {
    accepted: false,
    eventType: 'show_answer',
    reason: 'unknown_event'
  }),
  invalidUnknownCommand: envelope('invalid_unknown_command', 'serial_invalid_command', 'robot_command', {
    command: 'spin_motor'
  }, {
    accepted: false,
    command: 'spin_motor',
    reason: 'unknown_command'
  }),
  invalidSensitiveQuestion: envelope('invalid_sensitive_question', 'serial_sensitive_question', 'robot_event', {
    eventType: 'question_presented',
    sessionId: 'serial_fixture_session',
    question: 'private question'
  }, {
    accepted: false,
    reason: 'sensitive_payload_detected'
  }),
  invalidSensitiveAnswer: envelope('invalid_sensitive_answer', 'serial_sensitive_answer', 'robot_event', {
    eventType: 'answer_correct',
    sessionId: 'serial_fixture_session',
    answer: 'private answer'
  }, {
    accepted: false,
    reason: 'sensitive_payload_detected'
  }),
  invalidSensitiveCorrectAnswer: envelope('invalid_sensitive_correct_answer', 'serial_sensitive_correct_answer', 'robot_event', {
    eventType: 'answer_wrong',
    sessionId: 'serial_fixture_session',
    nested: {
      correctAnswer: 'private correct answer'
    }
  }, {
    accepted: false,
    reason: 'sensitive_payload_detected'
  }),
  malformedInput: invalidFixture('malformed_input', '{broken', 'malformed_message'),
  missingProtocolVersion: invalidFixture('missing_protocol_version', JSON.stringify({
    messageId: 'serial_missing_protocol',
    messageType: 'hello',
    emittedAt: '2026-06-27T00:00:00.000Z',
    source: 'shime-quiz',
    payload: {}
  }), 'invalid_protocol_version')
});

export function getValidSerialParserQaFixtures() {
  return [
    serialParserQaFixtures.hello,
    serialParserQaFixtures.ping,
    serialParserQaFixtures.disconnect,
    serialParserQaFixtures.sessionStarted,
    serialParserQaFixtures.questionPresented,
    serialParserQaFixtures.answerCorrect,
    serialParserQaFixtures.answerWrong,
    serialParserQaFixtures.reviewDue,
    serialParserQaFixtures.sessionComplete,
    serialParserQaFixtures.bridgeError,
    serialParserQaFixtures.robotCommandCelebrate,
    serialParserQaFixtures.robotCommandEncourage,
    serialParserQaFixtures.robotCommandNeutral,
    serialParserQaFixtures.robotCommandFocus,
    serialParserQaFixtures.robotCommandSessionComplete,
    serialParserQaFixtures.robotCommandDueReview,
    serialParserQaFixtures.robotCommandErrorSignal
  ];
}

export function getInvalidSerialParserQaFixtures() {
  return [
    serialParserQaFixtures.invalidUnknownEvent,
    serialParserQaFixtures.invalidUnknownCommand,
    serialParserQaFixtures.invalidSensitiveQuestion,
    serialParserQaFixtures.invalidSensitiveAnswer,
    serialParserQaFixtures.invalidSensitiveCorrectAnswer,
    serialParserQaFixtures.malformedInput,
    serialParserQaFixtures.missingProtocolVersion
  ];
}

export function getSerialParserQaLines() {
  return [
    ...getValidSerialParserQaFixtures(),
    ...getInvalidSerialParserQaFixtures()
  ].map(fixture => fixture.input);
}

export function findForbiddenSerialFixtureKeys(fixture) {
  return FORBIDDEN_PROTOCOL_KEYS.filter(key => new RegExp(`"${key}"\\s*:`).test(fixture.input));
}

export function getExpectedActionForSerialFixture(fixture) {
  if (fixture.expected.action) return fixture.expected.action;
  if (fixture.expected.eventType) return EVENT_TO_ACTION[fixture.expected.eventType] || 'error_signal';
  return null;
}
