const s = name => `replay_${name}`;

export const companionReplayFixtures = Object.freeze([
  { name: 'normal short session', events: [
    { eventType: 'session_started', sessionId: s('normal'), payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
    { eventType: 'question_presented', sessionId: s('normal'), payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } },
    { eventType: 'answer_correct', sessionId: s('normal'), payload: { progressCount: 1, totalCount: 3, status: 'correct' } },
    { eventType: 'session_complete', sessionId: s('normal'), payload: { progressCount: 3, totalCount: 3, accuracyBucket: 'high' } }
  ] },
  { name: 'long correct streak', events: [
    { eventType: 'session_started', sessionId: s('streak'), payload: { progressCount: 0, totalCount: 6, transportStatus: 'connected' } },
    ...[1, 2, 3, 4, 5].map(index => ({ eventType: 'answer_correct', sessionId: s('streak'), payload: { progressCount: index, totalCount: 6, status: 'correct' } }))
  ] },
  { name: 'one wrong answer then recovery', events: [
    { eventType: 'session_started', sessionId: s('recovery1'), payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
    { eventType: 'answer_wrong', sessionId: s('recovery1'), payload: { progressCount: 1, totalCount: 3, status: 'wrong' } },
    { eventType: 'answer_correct', sessionId: s('recovery1'), payload: { progressCount: 2, totalCount: 3, status: 'correct' } }
  ] },
  { name: 'repeated wrong answers', events: [1, 2, 3].map(index => ({ eventType: 'answer_wrong', sessionId: s('wrong'), payload: { progressCount: index, totalCount: 4, status: 'wrong' } })) },
  { name: 'repeated wrong answers then correct recovery', events: [
    ...[1, 2, 3].map(index => ({ eventType: 'answer_wrong', sessionId: s('wrong_recovery'), payload: { progressCount: index, totalCount: 5, status: 'wrong' } })),
    { eventType: 'answer_correct', sessionId: s('wrong_recovery'), payload: { progressCount: 4, totalCount: 5, status: 'correct' } }
  ] },
  { name: 'low accuracy completion', events: [{ eventType: 'session_complete', sessionId: s('low'), payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'low' } }] },
  { name: 'high accuracy completion', events: [{ eventType: 'session_complete', sessionId: s('high'), payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'high' } }] },
  { name: 'review due then study session', events: [
    { eventType: 'review_due', sessionId: s('review'), payload: { dueCountBucket: '20_plus', totalCount: 20 } },
    { eventType: 'session_started', sessionId: s('review'), payload: { progressCount: 0, totalCount: 4, transportStatus: 'connected' } }
  ] },
  { name: 'transport disconnected mid-session', events: [
    { eventType: 'session_started', sessionId: s('disconnect'), payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
    { eventType: 'bridge_error', sessionId: s('disconnect'), payload: { reasonCode: 'transport_disconnected', transportStatus: 'disconnected' } }
  ] },
  { name: 'robot unavailable', options: { robotAvailability: 'offline' }, events: [{ eventType: 'question_presented', sessionId: s('robot'), payload: { progressCount: 1, totalCount: 3 } }] },
  { name: 'sensor unhealthy', options: { robotAvailability: 'unhealthy' }, events: [{ eventType: 'question_presented', sessionId: s('sensor'), payload: { progressCount: 1, totalCount: 3 } }] },
  { name: 'classroom safe mode', options: { safetyMode: 'classroom_safe', profile: 'classroom_safe' }, events: [1, 2, 3, 4, 5].map(index => ({ eventType: 'answer_correct', sessionId: s('classroom'), payload: { progressCount: index, totalCount: 5, status: 'correct' } })) },
  { name: 'premium showcase mode', options: { profile: 'premium_showcase' }, events: [1, 2, 3, 4, 5].map(index => ({ eventType: 'answer_correct', sessionId: s('premium'), payload: { progressCount: index, totalCount: 5, status: 'correct' } })) },
  { name: 'spammy repeated question_presented events', events: [1, 2, 3, 4, 5, 6].map(index => ({ eventType: 'question_presented', sessionId: s('spam'), payload: { itemIndex: index, progressCount: index, totalCount: 6 } })) },
  { name: 'sensitive payload attack', events: [{ eventType: 'question_presented', sessionId: s('attack'), payload: { question: 'private text' } }] },
  { name: 'malformed event stream', events: [{ eventType: 'unknown_event', sessionId: s('bad'), payload: {} }] },
  { name: 'bridge_error recovery', events: [
    { eventType: 'bridge_error', sessionId: s('bridge_recovery'), payload: { transportStatus: 'error' } },
    { eventType: 'session_started', sessionId: s('bridge_recovery'), payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } }
  ] },
  { name: 'mixed session with due review and final completion', events: [
    { eventType: 'review_due', sessionId: s('mixed'), payload: { dueCountBucket: '20_plus' } },
    { eventType: 'session_started', sessionId: s('mixed'), payload: { progressCount: 0, totalCount: 4, transportStatus: 'connected' } },
    { eventType: 'answer_wrong', sessionId: s('mixed'), payload: { progressCount: 1, totalCount: 4, status: 'wrong' } },
    { eventType: 'answer_correct', sessionId: s('mixed'), payload: { progressCount: 2, totalCount: 4, status: 'correct' } },
    { eventType: 'session_complete', sessionId: s('mixed'), payload: { progressCount: 4, totalCount: 4, accuracyBucket: 'mixed' } }
  ] }
]);

export function getCompanionReplayFixtures() {
  return companionReplayFixtures.map(fixture => ({ ...fixture, events: fixture.events.map(event => ({ ...event, payload: { ...(event.payload || {}) } })) }));
}

