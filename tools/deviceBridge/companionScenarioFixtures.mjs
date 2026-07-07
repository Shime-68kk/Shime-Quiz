export const companionScenarioFixtures = Object.freeze([
  {
    name: 'first_question_presented',
    events: [
      { eventType: 'session_started', payload: { progressCount: 0, totalCount: 5, transportStatus: 'connected' } },
      { eventType: 'question_presented', payload: { itemType: 'multiple_choice', progressCount: 1, totalCount: 5 } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'correct_answer_streak',
    events: [
      { eventType: 'answer_correct', payload: { itemType: 'multiple_choice', progressCount: 2, totalCount: 5, status: 'correct' } },
      { eventType: 'answer_correct', payload: { itemType: 'multiple_choice', progressCount: 3, totalCount: 5, status: 'correct' } }
    ],
    presence: { presenceBucket: 'near', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'wrong_answer_after_attempts',
    events: [
      { eventType: 'answer_wrong', payload: { itemType: 'short_answer', progressCount: 2, totalCount: 5, status: 'wrong' } },
      { eventType: 'answer_wrong', payload: { itemType: 'short_answer', progressCount: 3, totalCount: 5, status: 'wrong' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'medium', sensorHealth: 'healthy' }
  },
  {
    name: 'user_near_before_session',
    events: [],
    presence: { presenceBucket: 'approaching', approachVelocityBucket: 'approaching_slow', confidenceBucket: 'medium', sensorHealth: 'healthy' }
  },
  {
    name: 'user_approaches_during_review_due',
    events: [
      { eventType: 'review_due', payload: { dueCountBucket: '20_plus', totalCount: 20 } }
    ],
    presence: { presenceBucket: 'approaching', approachVelocityBucket: 'approaching_fast', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'low_accuracy_session_complete',
    events: [
      { eventType: 'session_complete', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'low', scoreBucket: 'low' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'high_accuracy_session_complete',
    events: [
      { eventType: 'session_complete', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'high', scoreBucket: 'high' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' },
    profile: 'premium_showcase'
  },
  {
    name: 'transport_disconnected_during_session',
    events: [
      { eventType: 'question_presented', payload: { itemType: 'flashcard', progressCount: 2, totalCount: 5, transportStatus: 'disconnected' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'robot_sensor_unhealthy',
    events: [
      { eventType: 'session_started', payload: { progressCount: 0, totalCount: 5, transportStatus: 'connected' } }
    ],
    presence: { presenceBucket: 'unknown', approachVelocityBucket: 'unknown', confidenceBucket: 'low', sensorHealth: 'degraded' }
  },
  {
    name: 'repeated_events_rate_limit',
    events: [
      { eventType: 'answer_correct', payload: { progressCount: 1, totalCount: 5, status: 'correct' } },
      { eventType: 'answer_correct', payload: { progressCount: 2, totalCount: 5, status: 'correct' } },
      { eventType: 'answer_correct', payload: { progressCount: 3, totalCount: 5, status: 'correct' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' },
    history: ['celebrate', 'celebrate']
  },
  {
    name: 'sensitive_payload_attack',
    events: [
      { eventType: 'question_presented', payload: { itemType: 'short_answer', question: 'private text' } }
    ],
    presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' },
    expectBlocked: true
  }
]);
