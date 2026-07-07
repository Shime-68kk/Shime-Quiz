import { describe, expect, it } from 'vitest';
import { runCompanionDevTapQaHarness } from '../../tools/deviceBridge/companionDevTapQaHarness.mjs';

describe('companion dev tap QA harness', () => {
  it('proves disabled, manual enable, sensitive block, and unsubscribe behavior', () => {
    const result = runCompanionDevTapQaHarness();

    expect(result.summary).toMatchObject({
      result: 'PASS',
      disabledByDefault: true,
      preEnableIgnored: true,
      manualEnableRequired: true,
      noExternalSend: true,
      noPersistence: true,
      unsubscribeWorks: true
    });
    expect(result.summary.acceptedEventCount).toBeGreaterThan(0);
    expect(result.summary.blockedSensitiveEventCount).toBeGreaterThan(0);
  });

  it('transcript stays bounded and redacted', () => {
    const result = runCompanionDevTapQaHarness();
    const serialized = JSON.stringify(result.transcript);

    expect(result.transcript.length).toBeLessThanOrEqual(100);
    ['private text', 'private answer', 'correctAnswer', 'sourceMetadata', 'backupPayload'].forEach(text => {
      expect(serialized).not.toContain(text);
    });
  });
});
