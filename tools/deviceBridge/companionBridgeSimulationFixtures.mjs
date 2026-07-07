export const companionBridgeSimulationFixtures = Object.freeze([
  {
    name: 'normal_short_study_session',
    profile: 'calm_companion',
    events: [
      { eventType: 'session_started', sessionId: 'sim_normal', payload: { progressCount: 0, totalCount: 3, transportStatus: 'connected' } },
      { eventType: 'question_presented', sessionId: 'sim_normal', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3 } },
      { eventType: 'answer_correct', sessionId: 'sim_normal', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: 3, status: 'correct' } },
      { eventType: 'session_complete', sessionId: 'sim_normal', payload: { progressCount: 3, totalCount: 3, accuracyBucket: 'high' } }
    ],
    presenceSignal: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'correct_streak_session',
    events: [
      { eventType: 'answer_correct', sessionId: 'sim_streak', payload: { progressCount: 1, totalCount: 4, status: 'correct' } },
      { eventType: 'answer_correct', sessionId: 'sim_streak', payload: { progressCount: 2, totalCount: 4, status: 'correct' } },
      { eventType: 'answer_correct', sessionId: 'sim_streak', payload: { progressCount: 3, totalCount: 4, status: 'correct' } }
    ],
    presenceSignal: { presenceBucket: 'near', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' }
  },
  {
    name: 'repeated_wrong_answers',
    events: [
      { eventType: 'answer_wrong', sessionId: 'sim_wrong', payload: { itemType: 'short_answer', progressCount: 1, totalCount: 4, status: 'wrong' } },
      { eventType: 'answer_wrong', sessionId: 'sim_wrong', payload: { itemType: 'short_answer', progressCount: 2, totalCount: 4, status: 'wrong' } }
    ]
  },
  {
    name: 'low_accuracy_completion',
    events: [
      { eventType: 'session_complete', sessionId: 'sim_low', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'low', scoreBucket: 'low' } }
    ]
  },
  {
    name: 'high_accuracy_completion',
    profile: 'premium_showcase',
    events: [
      { eventType: 'session_complete', sessionId: 'sim_high', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'high', scoreBucket: 'high' } }
    ]
  },
  {
    name: 'review_due_before_session',
    events: [
      { eventType: 'review_due', sessionId: 'sim_review', payload: { dueCountBucket: '20_plus', totalCount: 20 } }
    ]
  },
  {
    name: 'transport_disconnected_mid_session',
    events: [
      { eventType: 'question_presented', sessionId: 'sim_disconnect', payload: { itemType: 'flashcard', progressCount: 1, totalCount: 3, transportStatus: 'disconnected' } }
    ]
  },
  {
    name: 'robot_presence_near_before_study',
    events: [
      { eventType: 'session_started', sessionId: 'sim_near', payload: { progressCount: 0, totalCount: 5, transportStatus: 'connected' } }
    ],
    presenceSignal: { presenceBucket: 'approaching', approachVelocityBucket: 'approaching_slow', confidenceBucket: 'medium', sensorHealth: 'healthy' }
  },
  {
    name: 'robot_sensor_unhealthy',
    events: [
      { eventType: 'session_started', sessionId: 'sim_sensor', payload: { progressCount: 0, totalCount: 5, transportStatus: 'connected' } }
    ],
    presenceSignal: { presenceBucket: 'unknown', approachVelocityBucket: 'unknown', confidenceBucket: 'low', sensorHealth: 'degraded' }
  },
  {
    name: 'repeated_question_presented_spam',
    events: [
      { eventType: 'question_presented', sessionId: 'sim_spam', payload: { itemIndex: 1, itemType: 'multiple_choice', progressCount: 1, totalCount: 5 } },
      { eventType: 'question_presented', sessionId: 'sim_spam', payload: { itemIndex: 1, itemType: 'multiple_choice', progressCount: 1, totalCount: 5 } },
      { eventType: 'question_presented', sessionId: 'sim_spam', payload: { itemIndex: 1, itemType: 'multiple_choice', progressCount: 1, totalCount: 5 } }
    ]
  },
  {
    name: 'malformed_event',
    invalid: true,
    events: [
      { eventType: 'show_answer', sessionId: 'sim_malformed', payload: { message: 'unknown event' } }
    ]
  },
  {
    name: 'sensitive_payload_attack',
    invalid: true,
    events: [
      { eventType: 'question_presented', sessionId: 'sim_attack', payload: { itemType: 'short_answer', question: 'private text' } }
    ]
  },
  {
    name: 'premium_showcase_without_motion',
    profile: 'premium_showcase',
    events: [
      { eventType: 'answer_correct', sessionId: 'sim_premium', payload: { progressCount: 1, totalCount: 3, status: 'correct' } },
      { eventType: 'answer_correct', sessionId: 'sim_premium', payload: { progressCount: 2, totalCount: 3, status: 'correct' } }
    ],
    motionAllowed: false
  },
  {
    name: 'classroom_safe_mode',
    profile: 'classroom_safe',
    events: [
      { eventType: 'session_complete', sessionId: 'sim_classroom', payload: { progressCount: 4, totalCount: 4, accuracyBucket: 'high' } }
    ],
    childSafeMode: true
  },
  {
    name: 'bridge_error_recovery',
    events: [
      { eventType: 'bridge_error', sessionId: 'sim_error', payload: { reasonCode: 'transport_disconnected', transportStatus: 'error' } },
      { eventType: 'session_started', sessionId: 'sim_error', payload: { progressCount: 0, totalCount: 2, transportStatus: 'connected' } }
    ]
  }
]);

export function getValidCompanionBridgeSimulationFixtures() {
  return companionBridgeSimulationFixtures.filter(scenario => scenario.invalid !== true);
}

export function getInvalidCompanionBridgeSimulationFixtures() {
  return companionBridgeSimulationFixtures.filter(scenario => scenario.invalid === true);
}
