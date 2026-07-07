import { describe, expect, it } from 'vitest';
import { applySafeCapsuleEndToEndVerificationAction, createInitialSafeCapsuleEndToEndVerificationState, SAFE_CAPSULE_E2E_ACTIONS } from '../../src/components/settings/safeCapsuleEndToEndVerificationModel.js';

describe('safeCapsuleEndToEndVerificationModel', () => {
  it('passes matching mock report but does not allow real bridge', () => {
    let state = createInitialSafeCapsuleEndToEndVerificationState();
    state = applySafeCapsuleEndToEndVerificationAction(state, SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF);
    state = applySafeCapsuleEndToEndVerificationAction(state, SAFE_CAPSULE_E2E_ACTIONS.CREATE_MATCHING_REPORT);
    state = applySafeCapsuleEndToEndVerificationAction(state, SAFE_CAPSULE_E2E_ACTIONS.VERIFY);
    expect(state.overallStatus).toBe('verified_pass');
    expect(state.endToEndPass).toBe(true);
    expect(state.readinessGate.realBridgeAllowed).toBe(false);
    expect(state.recommendedNextStepCode).toBe('READY_FOR_MANUAL_ROBOT_MOCK_QA');
  });
  it('blocks checksum and transport attacks', () => {
    let checksum = applySafeCapsuleEndToEndVerificationAction(null, SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF);
    checksum = applySafeCapsuleEndToEndVerificationAction(checksum, SAFE_CAPSULE_E2E_ACTIONS.CREATE_FAILING_CHECKSUM_REPORT);
    checksum = applySafeCapsuleEndToEndVerificationAction(checksum, SAFE_CAPSULE_E2E_ACTIONS.VERIFY);
    expect(checksum.overallStatus).toBe('blocked_by_checksum');
    let transport = applySafeCapsuleEndToEndVerificationAction(null, SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF);
    transport = applySafeCapsuleEndToEndVerificationAction(transport, SAFE_CAPSULE_E2E_ACTIONS.CREATE_TRANSPORT_ATTACK_REPORT);
    transport = applySafeCapsuleEndToEndVerificationAction(transport, SAFE_CAPSULE_E2E_ACTIONS.VERIFY);
    expect(transport.overallStatus).toBe('blocked_by_transport_flag');
  });
});
