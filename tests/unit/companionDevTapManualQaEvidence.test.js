import { describe, expect, it } from 'vitest';
import { runCompanionDevTapQaHarness } from '../../tools/deviceBridge/companionDevTapQaHarness.mjs';
import { createCompanionDevTapQaTranscript } from '../../tools/deviceBridge/companionDevTapQaTranscript.mjs';

describe('companion dev tap manual QA evidence', () => {
  it('summary includes required PASS evidence fields', () => {
    const { summary } = runCompanionDevTapQaHarness();

    [
      'devOnly',
      'noExternalSend',
      'noPersistence',
      'disabledByDefault',
      'preEnableIgnored',
      'manualEnableRequired',
      'unsubscribeWorks',
      'blockedSensitiveEventCount',
      'result'
    ].forEach(key => {
      expect(summary).toHaveProperty(key);
    });
    expect(summary.result).toBe('PASS');
  });

  it('product-readable transcript has no forbidden raw fields', () => {
    const transcript = createCompanionDevTapQaTranscript().join('\n');

    expect(transcript).toContain('dev-only fake facade QA');
    expect(transcript).toContain('simulated only');
    ['private text', 'private answer', 'correctAnswer', 'userAnswer', 'sourceMetadata', 'backupPayload'].forEach(text => {
      expect(transcript).not.toContain(text);
    });
  });
});
