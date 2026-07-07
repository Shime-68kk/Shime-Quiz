export const PROTOCOL_VERSION = 'shime-ws-robot-v0';

export const FORBIDDEN_PROTOCOL_KEYS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'backupPayload',
  'importedDocumentText',
  'libraryItemContent',
  'rawQuizPayload'
]);

export const EVENT_TO_ACTION = Object.freeze({
  session_started: 'focus',
  question_presented: 'focus',
  answer_correct: 'celebrate',
  answer_wrong: 'encourage',
  review_due: 'due_review',
  session_complete: 'session_complete',
  bridge_error: 'error_signal'
});

function envelope(messageId, messageType, payload, source = 'shime-quiz') {
  return {
    protocolVersion: PROTOCOL_VERSION,
    messageId,
    messageType,
    emittedAt: '2026-06-27T00:00:00.000Z',
    source,
    payload
  };
}

function robotEvent(messageId, eventType, payload = {}) {
  return envelope(messageId, 'robot_event', {
    eventType,
    sessionId: 'studyroom_session_fixture',
    ...payload
  });
}

export const protocolFixtures = Object.freeze({
  hello: envelope('fixture_hello', 'hello', {
    bridgeStatus: 'enabled',
    transportStatus: 'connecting'
  }),
  helloAck: envelope('fixture_hello_ack', 'hello_ack', {
    transportStatus: 'connected',
    message: 'protocol_ready'
  }, 'shime-esp32'),
  sessionStarted: robotEvent('fixture_session_started', 'session_started', {
    progressCount: 0,
    totalCount: 5
  }),
  questionPresented: robotEvent('fixture_question_presented', 'question_presented', {
    itemIndex: 1,
    itemType: 'multiple_choice',
    progressCount: 2,
    totalCount: 5
  }),
  answerCorrect: robotEvent('fixture_answer_correct', 'answer_correct', {
    itemIndex: 1,
    itemType: 'multiple_choice',
    progressCount: 2,
    totalCount: 5,
    status: 'correct'
  }),
  answerWrong: robotEvent('fixture_answer_wrong', 'answer_wrong', {
    itemIndex: 2,
    itemType: 'short_answer',
    progressCount: 3,
    totalCount: 5,
    status: 'wrong'
  }),
  reviewDue: robotEvent('fixture_review_due', 'review_due', {
    dueCountBucket: '1_5'
  }),
  sessionComplete: robotEvent('fixture_session_complete', 'session_complete', {
    progressCount: 5,
    totalCount: 5,
    scoreBucket: '80_100',
    accuracyBucket: '80_100'
  }),
  bridgeError: robotEvent('fixture_bridge_error', 'bridge_error', {
    reasonCode: 'transport_disconnected',
    transportStatus: 'disconnected'
  }),
  invalidSensitivePayload: robotEvent('fixture_invalid_sensitive', 'answer_correct', {
    itemIndex: 1,
    prompt: 'private prompt',
    correctAnswer: 'private answer'
  }),
  invalidMessageType: envelope('fixture_invalid_message_type', 'show_private_answer', {
    message: 'invalid'
  })
});

export function findForbiddenFixtureKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findForbiddenFixtureKeys(entry, `${path}[${index}]`, found));
    return found;
  }

  if (!value || typeof value !== 'object') return found;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_PROTOCOL_KEYS.includes(key)) found.push({ key, path: nextPath });
    findForbiddenFixtureKeys(entry, nextPath, found);
  });

  return found;
}

export function getRobotActionForEvent(eventType) {
  return EVENT_TO_ACTION[eventType] || 'error_signal';
}

export function getValidRobotEventFixtures() {
  return [
    protocolFixtures.sessionStarted,
    protocolFixtures.questionPresented,
    protocolFixtures.answerCorrect,
    protocolFixtures.answerWrong,
    protocolFixtures.reviewDue,
    protocolFixtures.sessionComplete,
    protocolFixtures.bridgeError
  ];
}

