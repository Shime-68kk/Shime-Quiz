import { describe, expect, it } from 'vitest';
import { applySafeCapsuleEndToEndVerificationAction, createInitialSafeCapsuleEndToEndVerificationState, SAFE_CAPSULE_E2E_ACTIONS } from '../../src/components/settings/safeCapsuleEndToEndVerificationModel.js';
import { createRobotMockImportReportFixture, parseRobotMockImportReport, verifyRobotMockImportReport } from '../../src/deviceBridge/robotMockImportReport.js';

function handoff() {
  return applySafeCapsuleEndToEndVerificationAction(createInitialSafeCapsuleEndToEndVerificationState(), SAFE_CAPSULE_E2E_ACTIONS.CREATE_SAMPLE_HANDOFF).handoffPack;
}

describe('robotMockImportReport', () => {
  it('accepts valid report and verifies handoff', () => {
    const pack = handoff();
    const report = createRobotMockImportReportFixture({ handoffPack: pack });
    expect(parseRobotMockImportReport(report).ok).toBe(true);
    expect(verifyRobotMockImportReport(report, pack).ok).toBe(true);
  });
  it('rejects raw, RF, secret, unknown, transport, and bridge fields safely', () => {
    const base = createRobotMockImportReportFixture({ handoffPack: handoff() });
    for (const bad of [
      { ...base, prompt: 'private question' },
      { ...base, ssid: 'HomeNetwork' },
      { ...base, token: 'secret-token' },
      { ...base, unexpected: true },
      { ...base, transportEnabled: true },
      { ...base, realBridgeEnabled: true }
    ]) {
      const result = parseRobotMockImportReport(bad);
      expect(result.ok).toBe(false);
      expect(JSON.stringify(result.issues)).not.toMatch(/private question|HomeNetwork|secret-token/);
    }
  });
  it('detects checksum count mismatch against handoff', () => {
    const pack = handoff();
    const report = createRobotMockImportReportFixture({ handoffPack: pack, checksumPassCount: 0 });
    expect(verifyRobotMockImportReport(report, pack).ok).toBe(false);
  });
});
