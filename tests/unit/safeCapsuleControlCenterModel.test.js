import { describe, expect, it } from 'vitest';
import {
  applySafeCapsuleControlCenterAction,
  createInitialSafeCapsuleControlCenterState,
  SAFE_CAPSULE_BRIDGE_STATUS,
  SAFE_CAPSULE_CONTROL_CENTER_ACTIONS
} from '../../src/components/settings/safeCapsuleControlCenterModel.js';
import { SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS } from '../../src/deviceBridge/safeLearningCapsule.js';

describe('safeCapsuleControlCenterModel', () => {
  it('starts inert with no generated capsule or package', () => {
    const state = createInitialSafeCapsuleControlCenterState();

    expect(state.capsule).toBe(null);
    expect(state.mockPackage).toBe(null);
    expect(state.bridgeStatus).toBe(SAFE_CAPSULE_BRIDGE_STATUS);
    expect(state.realBridgeEnabled).toBe(false);
    expect(state.transportEnabled).toBe(false);
  });

  it('creates sample steady capsule with only safe fields', () => {
    const state = applySafeCapsuleControlCenterAction(
      createInitialSafeCapsuleControlCenterState(),
      SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY
    );

    expect(Object.keys(state.capsule).sort()).toEqual([...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort());
    expect(state.preview.safeSummaryCode).toBe('STEADY_PROGRESS');
    expect(state.privacyAudit.rawQuizFieldsDetected).toBe(false);
    expect(state.compatibilityStatus.compatible).toBe(true);
  });

  it('creates struggling, high-pressure, and low-energy sample capsules', () => {
    const struggling = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STRUGGLING);
    const pressure = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_HIGH_REVIEW_PRESSURE);
    const lowEnergy = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_LOW_ENERGY);

    expect(struggling.capsule.safeSummaryCode).toBe('NEEDS_GENTLE_SUPPORT');
    expect(pressure.capsule.safeSummaryCode).toBe('REVIEW_SOON');
    expect(lowEnergy.capsule.safeSummaryCode).toBe('HIGH_LOAD_BREAK_SUGGESTED');
  });

  it('runs privacy audit and creates a mock robot import package', () => {
    let state = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_LOW_ENERGY);
    state = applySafeCapsuleControlCenterAction(state, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.RUN_PRIVACY_AUDIT);
    state = applySafeCapsuleControlCenterAction(state, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_MOCK_ROBOT_IMPORT_PACKAGE);

    expect(state.privacyAudit.ok).toBe(true);
    expect(state.mockPackageSummary.compatibleWithR5X19_2).toBe(true);
    expect(state.mockPackage.realBridgeEnabled).toBe(false);
    expect(state.mockPackage.transportEnabled).toBe(false);
    expect(JSON.stringify(state)).not.toMatch(/private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/i);
  });

  it('clears preview back to inert state', () => {
    const active = applySafeCapsuleControlCenterAction(null, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY);
    const cleared = applySafeCapsuleControlCenterAction(active, SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CLEAR_PREVIEW);

    expect(cleared).toEqual(createInitialSafeCapsuleControlCenterState());
  });
});
