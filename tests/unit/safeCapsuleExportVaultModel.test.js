import { describe, expect, it } from 'vitest';
import {
  applySafeCapsuleExportVaultAction,
  createInitialSafeCapsuleExportVaultState,
  SAFE_CAPSULE_EXPORT_VAULT_ACTIONS
} from '../../src/components/settings/safeCapsuleExportVaultModel.js';

describe('safeCapsuleExportVaultModel', () => {
  it('starts inert with no persistence or transport', () => {
    const state = createInitialSafeCapsuleExportVaultState();
    expect(state.browserPersistenceEnabled).toBe(false);
    expect(state.realBridgeEnabled).toBe(false);
    expect(state.transportEnabled).toBe(false);
    expect(state.packageCount).toBe(0);
  });

  it('adds safe packages, builds, verifies, and marks copy/download', () => {
    let state = applySafeCapsuleExportVaultAction(null, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.ADD_ALL_SAFE);
    expect(state.packageCount).toBe(4);
    state = applySafeCapsuleExportVaultAction(state, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.BUILD_HANDOFF);
    expect(state.copyReady).toBe(true);
    expect(state.downloadReady).toBe(true);
    expect(state.lastFileName).toMatch(/\.jsonl$/);
    expect(state.lastJsonlPreviewSafe).toContain('R5X19.2_SAFE_MOCK_IMPORT');
    state = applySafeCapsuleExportVaultAction(state, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.VERIFY_HANDOFF);
    expect(state.lastVerificationStatus).toBe('valid');
    state = applySafeCapsuleExportVaultAction(state, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_COPIED);
    state = applySafeCapsuleExportVaultAction(state, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.MARK_DOWNLOADED);
    expect(state.copied).toBe(true);
    expect(state.downloaded).toBe(true);
  });

  it('rejects adversarial package and clears vault', () => {
    let state = applySafeCapsuleExportVaultAction(null, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.REJECT_ADVERSARIAL);
    expect(state.rejectedCount).toBe(1);
    expect(state.packageCount).toBe(0);
    state = applySafeCapsuleExportVaultAction(state, SAFE_CAPSULE_EXPORT_VAULT_ACTIONS.CLEAR);
    expect(state).toEqual(createInitialSafeCapsuleExportVaultState());
  });
});
