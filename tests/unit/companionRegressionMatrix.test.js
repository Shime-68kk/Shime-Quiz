import { describe, expect, it } from 'vitest';
import { collectForbiddenCompanionKeys } from '../../src/companion/companionContextSchema.js';
import { reduceLearningSignal } from '../../src/companion/learningSignalReducer.js';
import { SAFE_ROBOT_COMMANDS } from '../../src/companion/robotIntentPlanner.js';
import {
  runCompanionScenario,
  runCompanionScenarios
} from '../../tools/deviceBridge/companionScenarioSimulator.mjs';

function expectSafeResult(result) {
  expect(result.decision.reasonCodes.length).toBeGreaterThan(0);
  expect(result.governed.reasonCodes.length).toBeGreaterThan(0);
  expect(SAFE_ROBOT_COMMANDS).toContain(result.intent.command);
  expect(result.intent.mode).toBe('expression_only');
  expect(JSON.stringify(result.intent)).not.toMatch(/prompt|correctAnswer|userAnswer|sourceMetadata|backupPayload|rawQuizPayload/);
  expect(collectForbiddenCompanionKeys(result.context)).toEqual([]);
}

describe('companion regression matrix', () => {
  it('covers required scenario classes with deterministic safe outputs', () => {
    const first = runCompanionScenarios();
    const second = runCompanionScenarios();

    expect(first).toEqual(second);

    [
      'first_question_presented',
      'correct_answer_streak',
      'wrong_answer_after_attempts',
      'user_near_before_session',
      'user_approaches_during_review_due',
      'low_accuracy_session_complete',
      'high_accuracy_session_complete',
      'transport_disconnected_during_session',
      'robot_sensor_unhealthy',
      'repeated_events_rate_limit',
      'sensitive_payload_attack'
    ].forEach(name => {
      expect(first.map(result => result.name)).toContain(name);
    });

    first.forEach(expectSafeResult);
  });

  it('asserts representative scenario outcomes', () => {
    const byName = Object.fromEntries(runCompanionScenarios().map(result => [result.name, result]));

    expect(byName.first_question_presented.intent.command).toBe('focus');
    expect(byName.correct_answer_streak.intent.command).toBe('celebrate');
    expect(byName.wrong_answer_after_attempts.decision.intent).toBe('suggest_break');
    expect(byName.user_approaches_during_review_due.intent.command).toBe('due_review');
    expect(byName.high_accuracy_session_complete.decision.intent).toBe('celebrate_big');
    expect(byName.transport_disconnected_during_session.intent.command).toBe('neutral');
    expect(byName.robot_sensor_unhealthy.decision.reasonCodes).toContain('robot_presence_unavailable');
    expect(byName.repeated_events_rate_limit.intent.command).toBe('focus');
    expect(byName.sensitive_payload_attack.blocked).toBe(true);
    expect(byName.sensitive_payload_attack.intent.command).toBe('neutral');
  });

  it('handles malformed and unknown event inputs safely', () => {
    expect(reduceLearningSignal(undefined).issues[0].code).toBe('unknown_learning_event_type');
    expect(reduceLearningSignal([]).issues[0].code).toBe('invalid_learning_event');
    expect(reduceLearningSignal({ eventType: 'show_answer', payload: {} }).issues[0].code).toBe('unknown_learning_event_type');
  });

  it('keeps premium showcase motion blocked by default', () => {
    const result = runCompanionScenario({
      name: 'premium_showcase_motion_request',
      events: [
        { eventType: 'session_complete', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'high' } }
      ],
      presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' },
      profile: 'premium_showcase'
    });

    result.decision.shouldMove = true;
    const replanned = runCompanionScenario({
      name: 'premium_showcase_motion_still_blocked',
      events: [
        { eventType: 'session_complete', payload: { progressCount: 5, totalCount: 5, accuracyBucket: 'high' } }
      ],
      presence: { presenceBucket: 'present', approachVelocityBucket: 'still', confidenceBucket: 'high', sensorHealth: 'healthy' },
      profile: 'premium_showcase',
      history: []
    });

    expect(result.intent.mode).toBe('expression_only');
    expect(replanned.intent.mode).toBe('expression_only');
  });
});
