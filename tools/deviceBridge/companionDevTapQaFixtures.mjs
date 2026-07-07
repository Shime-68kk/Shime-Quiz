export const companionDevTapQaFixtures = Object.freeze({
  normalSession: Object.freeze({
    name: 'normal_session',
    events: Object.freeze([
      { eventType: 'session_started', sessionId: 'qa_normal', payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
      { eventType: 'question_presented', sessionId: 'qa_normal', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } },
      { eventType: 'answer_correct', sessionId: 'qa_normal', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3, status: 'correct' } },
      { eventType: 'session_complete', sessionId: 'qa_normal', payload: { progressCount: 3, totalCount: 3, accuracyBucket: 'high' } }
    ])
  }),
  struggleSession: Object.freeze({
    name: 'struggle_session',
    events: Object.freeze([
      { eventType: 'session_started', sessionId: 'qa_struggle', payload: { progressCount: 0, totalCount: 4, transportStatus: 'connected' } },
      { eventType: 'question_presented', sessionId: 'qa_struggle', payload: { itemIndex: 1, itemType: 'short_answer', progressCount: 1, totalCount: 4 } },
      { eventType: 'answer_wrong', sessionId: 'qa_struggle', payload: { itemIndex: 1, itemType: 'short_answer', progressCount: 1, totalCount: 4, status: 'wrong' } },
      { eventType: 'question_presented', sessionId: 'qa_struggle', payload: { itemIndex: 2, itemType: 'short_answer', progressCount: 2, totalCount: 4 } },
      { eventType: 'answer_wrong', sessionId: 'qa_struggle', payload: { itemIndex: 2, itemType: 'short_answer', progressCount: 2, totalCount: 4, status: 'wrong' } },
      { eventType: 'session_complete', sessionId: 'qa_struggle', payload: { progressCount: 4, totalCount: 4, accuracyBucket: 'low', scoreBucket: 'low' } }
    ])
  }),
  reviewDue: Object.freeze({
    name: 'review_due',
    events: Object.freeze([
      { eventType: 'review_due', sessionId: 'qa_review', payload: { dueCountBucket: '20_plus', totalCount: 20 } },
      { eventType: 'session_started', sessionId: 'qa_review', payload: { progressCount: 0, totalCount: 5, transportStatus: 'connected' } }
    ])
  }),
  disconnectedError: Object.freeze({
    name: 'disconnected_error',
    events: Object.freeze([
      { eventType: 'bridge_error', sessionId: 'qa_error', payload: { reasonCode: 'transport_disconnected', transportStatus: 'disconnected' } }
    ])
  }),
  sensitiveAttack: Object.freeze({
    name: 'sensitive_attack',
    invalid: true,
    events: Object.freeze([
      { eventType: 'question_presented', sessionId: 'qa_attack', payload: { question: 'private text' } },
      { eventType: 'answer_correct', sessionId: 'qa_attack', payload: { answer: 'private answer' } },
      { eventType: 'answer_wrong', sessionId: 'qa_attack', payload: { nested: { correctAnswer: 'private answer' } } }
    ])
  })
});

export const ALLOWED_QA_EVENT_TYPES = Object.freeze([
  'session_started',
  'question_presented',
  'answer_correct',
  'answer_wrong',
  'review_due',
  'session_complete',
  'bridge_error'
]);

export const FORBIDDEN_QA_KEYS = Object.freeze([
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
  'rawQuizPayload',
  'cameraFrames',
  'audioRecording',
  'biometricIdentity'
]);

export function getValidCompanionDevTapQaFixtures() {
  return Object.values(companionDevTapQaFixtures).filter(fixture => fixture.invalid !== true);
}

export function getInvalidCompanionDevTapQaFixtures() {
  return Object.values(companionDevTapQaFixtures).filter(fixture => fixture.invalid === true);
}

export function findForbiddenQaKeys(value, path = '$', found = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => findForbiddenQaKeys(entry, `${path}[${index}]`, found));
    return found;
  }
  if (!value || typeof value !== 'object') return found;
  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_QA_KEYS.includes(key)) found.push({ key, path: nextPath });
    findForbiddenQaKeys(entry, nextPath, found);
  });
  return found;
}
