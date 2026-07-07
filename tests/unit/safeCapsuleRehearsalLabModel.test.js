import { describe, expect, it } from 'vitest';
import {
  applySafeCapsuleRehearsalLabAction,
  createInitialSafeCapsuleRehearsalLabState,
  getSafeCapsuleRehearsalScenarioIds,
  runAllSafeCapsuleRehearsals,
  runSafeCapsuleRehearsalScenario,
  SAFE_CAPSULE_REHEARSAL_ACTIONS
} from '../../src/components/settings/safeCapsuleRehearsalLabModel.js';

describe('safeCapsuleRehearsalLabModel', () => {
  it('runs valid scenarios with safe capsule, mock package, evidence, and scores', () => {
    const result = runSafeCapsuleRehearsalScenario('steady_progress');

    expect(result.accepted).toBe(true);
    expect(result.rejected).toBe(false);
    expect(result.mockPackage.target).toBe('R5X19.2_SAFE_MOCK_IMPORT');
    expect(result.mockPackage.realBridgeEnabled).toBe(false);
    expect(result.mockPackage.transportEnabled).toBe(false);
    expect(result.qualityScore.overall).toBeGreaterThan(90);
    expect(result.qualityScore.explanationCodes).toContain('PRIVACY_SAFE_FIELDS_ONLY');
    expect(result.compatibilityScore).toBe(100);
    expect(result.noSendStatus).toBe('no_send_preview_only');
    expect(JSON.stringify(result)).not.toMatch(/private question|private answer|HomeNetwork|secret-token|deck_private/);
  });

  it('rejects adversarial scenarios without creating packages', () => {
    const rawQuiz = runSafeCapsuleRehearsalScenario('privacy_attack_raw_quiz');
    const rawRf = runSafeCapsuleRehearsalScenario('privacy_attack_raw_rf');
    const secret = runSafeCapsuleRehearsalScenario('privacy_attack_secret');
    const unknown = runSafeCapsuleRehearsalScenario('unknown_field_injection');

    expect(rawQuiz).toMatchObject({ rejected: true, rejectionReasonCode: 'REJECTED_FOR_RAW_QUIZ', mockPackage: null });
    expect(rawRf).toMatchObject({ rejected: true, rejectionReasonCode: 'REJECTED_FOR_RAW_RF', mockPackage: null });
    expect(secret).toMatchObject({ rejected: true, rejectionReasonCode: 'REJECTED_FOR_SECRET', mockPackage: null });
    expect(unknown).toMatchObject({ rejected: true, rejectionReasonCode: 'REJECTED_FOR_UNKNOWN_FIELD', mockPackage: null });
  });

  it('runs all deterministic scenarios', () => {
    const results = runAllSafeCapsuleRehearsals();

    expect(results).toHaveLength(getSafeCapsuleRehearsalScenarioIds().length);
    expect(results.some(result => result.accepted)).toBe(true);
    expect(results.some(result => result.rejected)).toBe(true);
  });

  it('updates and clears lab state through explicit actions', () => {
    let state = createInitialSafeCapsuleRehearsalLabState();
    expect(state.results).toEqual([]);

    state = applySafeCapsuleRehearsalLabAction(state, { type: SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_SCENARIO, scenarioId: 'low_energy_focus' });
    expect(state.results).toHaveLength(1);
    expect(state.latestResult.scenarioId).toBe('low_energy_focus');

    state = applySafeCapsuleRehearsalLabAction(state, SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_ALL);
    expect(state.results.length).toBeGreaterThan(5);

    state = applySafeCapsuleRehearsalLabAction(state, SAFE_CAPSULE_REHEARSAL_ACTIONS.CLEAR);
    expect(state).toEqual(createInitialSafeCapsuleRehearsalLabState());
  });
});
