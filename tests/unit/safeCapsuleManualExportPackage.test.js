import { describe, expect, it } from 'vitest';
import { runSafeCapsuleRehearsalScenario } from '../../src/components/settings/safeCapsuleRehearsalLabModel.js';
import {
  createManualSafeCapsuleHandoffPack,
  createSafeExportFileName,
  serializeManualHandoffJsonl,
  verifyManualSafeCapsuleHandoffPack
} from '../../src/deviceBridge/safeCapsuleManualExportPackage.js';

function pkg() {
  return runSafeCapsuleRehearsalScenario('steady_progress').mockPackage;
}

describe('safeCapsuleManualExportPackage', () => {
  it('creates and verifies safe handoff pack', () => {
    const result = createManualSafeCapsuleHandoffPack([pkg()], { exportId: 'manual_test_001', createdAtBucket: '2026-07-08' });
    expect(result.ok).toBe(true);
    expect(result.handoffPack.manifest.packageCount).toBe(1);
    expect(result.handoffPack.realBridgeEnabled).toBe(false);
    expect(result.handoffPack.transportEnabled).toBe(false);
    expect(verifyManualSafeCapsuleHandoffPack(result.handoffPack).ok).toBe(true);
  });

  it('rejects invalid, raw, RF, secret, and unknown package fields', () => {
    for (const bad of [
      { ...pkg(), realBridgeEnabled: true },
      { ...pkg(), prompt: 'private question' },
      { ...pkg(), ssid: 'HomeNetwork' },
      { ...pkg(), token: 'secret-token' },
      { ...pkg(), unknown: 'blocked' }
    ]) {
      expect(createManualSafeCapsuleHandoffPack([bad]).ok).toBe(false);
    }
  });

  it('JSONL and file name are safe', () => {
    const result = createManualSafeCapsuleHandoffPack([pkg()], { exportId: 'manual_test_001', createdAtBucket: '2026-07-08' });
    const jsonl = serializeManualHandoffJsonl(result.handoffPack);
    expect(jsonl).toContain('shime_robot_mock_import_package');
    expect(jsonl).toContain('R5X19.2_SAFE_MOCK_IMPORT');
    expect(jsonl).not.toMatch(/private question|private answer|HomeNetwork|secret-token|card_private/);
    expect(createSafeExportFileName(result.handoffPack)).toBe('shime-safe-capsule-2026-07-08-manual_test_001.jsonl');
  });
});
