import { describe, expect, it } from 'vitest';
import { scoreCompanionBehavior } from '../../src/companion/companionQualityScoring.js';

describe('companionQualityScoring', () => {
  it('scores safe transcripts high and spammy transcripts lower', () => {
    const safe = scoreCompanionBehavior([{ policyIntent: 'focus_gently', finalRobotIntent: 'focus', dryRunOnly: true, privacyStatus: 'redacted_coarse_only', reasonCodes: [] }]);
    const spam = scoreCompanionBehavior(Array.from({ length: 5 }, () => ({ policyIntent: 'celebrate_small', finalRobotIntent: 'celebrate', dryRunOnly: true, privacyStatus: 'redacted_coarse_only', reasonCodes: [] })));
    expect(safe.scores.privacyScore).toBe(100);
    expect(spam.scores.nonSpamScore).toBeLessThan(100);
  });

  it('sensitive and unsafe entries fail safely', () => {
    expect(scoreCompanionBehavior([{ policyIntent: 'x', finalRobotIntent: 'neutral', dryRunOnly: true, privacyStatus: 'redacted_coarse_only', prompt: 'bad' }]).passed).toBe(false);
    expect(scoreCompanionBehavior([{ policyIntent: 'x', finalRobotIntent: 'neutral', dryRunOnly: false, privacyStatus: 'redacted_coarse_only' }]).passed).toBe(false);
  });
});

