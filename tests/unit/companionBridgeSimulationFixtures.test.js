import { describe, expect, it } from 'vitest';
import { collectForbiddenCompanionKeys } from '../../src/companion/companionContextSchema.js';
import {
  companionBridgeSimulationFixtures,
  getInvalidCompanionBridgeSimulationFixtures,
  getValidCompanionBridgeSimulationFixtures
} from '../../tools/deviceBridge/companionBridgeSimulationFixtures.mjs';

describe('companionBridgeSimulationFixtures', () => {
  it('contains all required scenario classes', () => {
    [
      'normal_short_study_session',
      'correct_streak_session',
      'repeated_wrong_answers',
      'low_accuracy_completion',
      'high_accuracy_completion',
      'review_due_before_session',
      'transport_disconnected_mid_session',
      'robot_presence_near_before_study',
      'robot_sensor_unhealthy',
      'repeated_question_presented_spam',
      'malformed_event',
      'sensitive_payload_attack',
      'premium_showcase_without_motion',
      'classroom_safe_mode',
      'bridge_error_recovery'
    ].forEach(name => expect(companionBridgeSimulationFixtures.map(s => s.name)).toContain(name));
  });

  it('valid fixtures contain no sensitive keys', () => {
    getValidCompanionBridgeSimulationFixtures().forEach(scenario => {
      expect(collectForbiddenCompanionKeys(scenario), scenario.name).toEqual([]);
    });
  });

  it('attack fixture is invalid and contains blocked private key', () => {
    const attack = getInvalidCompanionBridgeSimulationFixtures().find(scenario => scenario.name === 'sensitive_payload_attack');

    expect(attack.invalid).toBe(true);
    expect(collectForbiddenCompanionKeys(attack).map(issue => issue.path)).toContain('$.events[0].payload.question');
  });
});
