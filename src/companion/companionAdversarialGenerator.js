const EVENT_TYPES = Object.freeze([
  'session_started',
  'question_presented',
  'answer_correct',
  'answer_wrong',
  'review_due',
  'session_complete',
  'bridge_error'
]);

const ITEM_TYPES = Object.freeze(['flashcard', 'multiple_choice', 'short_answer', 'true_false', 'unknown']);

function createPrng(seed = 1) {
  let state = (Number(seed) >>> 0) || 1;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function pick(rand, values) {
  return values[Math.floor(rand() * values.length) % values.length];
}

function event(eventType, sessionId, payload = {}) {
  return { eventType, sessionId, payload };
}

function sequenceForType(type, index, rand) {
  const sessionId = `adv_${index}_${Math.floor(rand() * 100000)}`;
  const count = 3 + Math.floor(rand() * 7);
  const base = { id: `adv-${index}-${type}`, name: type.replaceAll('_', ' '), kind: type, valid: true, expectedTags: [type], events: [], options: {} };

  switch (type) {
    case 'long_correct_streak':
      base.expectedTags.push('celebrate_small');
      base.events = [event('session_started', sessionId, { progressCount: 0, totalCount: count, transportStatus: 'connected' }), ...Array.from({ length: count }, (_, i) => event('answer_correct', sessionId, { progressCount: i + 1, totalCount: count, status: 'correct' }))];
      break;
    case 'long_wrong_streak':
      base.expectedTags.push('suggest_break');
      base.events = Array.from({ length: count }, (_, i) => event('answer_wrong', sessionId, { progressCount: i + 1, totalCount: count, status: 'wrong' }));
      break;
    case 'alternating_correct_wrong':
      base.events = Array.from({ length: count }, (_, i) => event(i % 2 ? 'answer_correct' : 'answer_wrong', sessionId, { progressCount: i + 1, totalCount: count, status: i % 2 ? 'correct' : 'wrong' }));
      break;
    case 'repeated_question_presented_spam':
      base.expectedTags.push('repeated_event_spam');
      base.events = Array.from({ length: 8 }, (_, i) => event('question_presented', sessionId, { itemIndex: i, itemType: pick(rand, ITEM_TYPES), progressCount: i + 1, totalCount: 8 }));
      break;
    case 'session_complete_without_answers':
      base.events = [event('session_complete', sessionId, { progressCount: count, totalCount: count, accuracyBucket: 'unknown' })];
      break;
    case 'answer_before_question':
      base.events = [event('answer_correct', sessionId, { progressCount: 1, totalCount: count, status: 'correct' }), event('question_presented', sessionId, { itemIndex: 1, itemType: pick(rand, ITEM_TYPES), progressCount: 2, totalCount: count })];
      break;
    case 'session_complete_repeated':
      base.events = [event('session_complete', sessionId, { progressCount: count, totalCount: count, accuracyBucket: 'high' }), event('session_complete', sessionId, { progressCount: count, totalCount: count, accuracyBucket: 'high' })];
      break;
    case 'review_due_storm':
      base.expectedTags.push('review_reminder');
      base.events = Array.from({ length: 6 }, () => event('review_due', sessionId, { dueCountBucket: '20_plus', totalCount: 20 }));
      break;
    case 'bridge_error_storm':
      base.expectedTags.push('transport_block');
      base.events = Array.from({ length: 5 }, () => event('bridge_error', sessionId, { reasonCode: 'transport_disconnected', transportStatus: 'error' }));
      break;
    case 'disconnected_mid_session':
      base.expectedTags.push('disconnected');
      base.events = [event('session_started', sessionId, { progressCount: 0, totalCount: count, transportStatus: 'connected' }), event('bridge_error', sessionId, { reasonCode: 'transport_disconnected', transportStatus: 'disconnected' })];
      break;
    case 'transport_recovered':
      base.events = [event('bridge_error', sessionId, { transportStatus: 'error' }), event('session_started', sessionId, { progressCount: 0, totalCount: count, transportStatus: 'connected' })];
      break;
    case 'sensor_unhealthy':
      base.options.robotAvailability = 'unhealthy';
      base.events = [event('question_presented', sessionId, { progressCount: 1, totalCount: count })];
      break;
    case 'robot_unavailable':
      base.options.robotAvailability = 'offline';
      base.events = [event('question_presented', sessionId, { progressCount: 1, totalCount: count })];
      break;
    case 'classroom_safe_profile':
      base.options = { profile: 'classroom_safe', safetyMode: 'classroom_safe' };
      base.expectedTags.push('classroom_safe_downgrade');
      base.events = Array.from({ length: 6 }, (_, i) => event('answer_correct', sessionId, { progressCount: i + 1, totalCount: 6, status: 'correct' }));
      break;
    case 'premium_showcase_profile':
      base.options = { profile: 'premium_showcase' };
      base.events = [...Array.from({ length: 5 }, (_, i) => event('answer_correct', sessionId, { progressCount: i + 1, totalCount: 6, status: 'correct' })), event('session_complete', sessionId, { progressCount: 6, totalCount: 6, accuracyBucket: 'high' })];
      break;
    case 'malformed_event_type':
      base.valid = false;
      base.expectedTags.push('malformed_event');
      base.events = [event('unknown_event', sessionId, {})];
      break;
    case 'unknown_item_type':
      base.events = [event('question_presented', sessionId, { itemIndex: 0, itemType: 'unknown', progressCount: 1, totalCount: count })];
      break;
    case 'missing_session_id':
      base.valid = false;
      base.events = [{ eventType: 'question_presented', payload: { itemIndex: 0, itemType: 'multiple_choice', progressCount: 1, totalCount: count } }];
      break;
    case 'sensitive_key_attack':
      base.valid = false;
      base.attack = true;
      base.expectedTags.push('sensitive_attack');
      base.events = [event('question_presented', sessionId, { question: 'private content' })];
      break;
    case 'nested_sensitive_key_attack':
      base.valid = false;
      base.attack = true;
      base.expectedTags.push('sensitive_attack');
      base.events = [event('session_started', sessionId, { safe: { correctAnswer: 'private content' } })];
      break;
    case 'huge_bounded_sequence':
      base.expectedTags.push('steady_progress');
      base.events = Array.from({ length: 40 }, (_, i) => event(pick(rand, EVENT_TYPES), sessionId, { progressCount: i + 1, totalCount: 40, status: i % 3 === 0 ? 'correct' : 'wrong', transportStatus: 'connected' }));
      break;
    default:
      base.events = [event(pick(rand, EVENT_TYPES), sessionId, { progressCount: 1, totalCount: count })];
  }

  return base;
}

export const COMPANION_ADVERSARIAL_SCENARIO_TYPES = Object.freeze([
  'long_correct_streak',
  'long_wrong_streak',
  'alternating_correct_wrong',
  'repeated_question_presented_spam',
  'session_complete_without_answers',
  'answer_before_question',
  'session_complete_repeated',
  'review_due_storm',
  'bridge_error_storm',
  'disconnected_mid_session',
  'transport_recovered',
  'sensor_unhealthy',
  'robot_unavailable',
  'classroom_safe_profile',
  'premium_showcase_profile',
  'malformed_event_type',
  'unknown_item_type',
  'missing_session_id',
  'sensitive_key_attack',
  'nested_sensitive_key_attack',
  'huge_bounded_sequence'
]);

export function generateCompanionAdversarialScenarios(options = {}) {
  const count = Number.isFinite(options.count) ? Math.max(1, Math.floor(options.count)) : 100;
  const maxEvents = Number.isFinite(options.maxEvents) ? Math.max(1, Math.floor(options.maxEvents)) : 50;
  const rand = createPrng(options.seed || 31032);
  return Array.from({ length: count }, (_, index) => {
    const type = COMPANION_ADVERSARIAL_SCENARIO_TYPES[index % COMPANION_ADVERSARIAL_SCENARIO_TYPES.length];
    const scenario = sequenceForType(type, index, rand);
    return {
      ...scenario,
      events: scenario.events.slice(0, maxEvents),
      seed: options.seed || 31032
    };
  });
}
