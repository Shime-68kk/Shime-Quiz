import { describe, expect, it } from 'vitest';
import { createAdaptiveCompanionDecision } from '../../src/companion/companionAdaptivePolicy.js';

describe('companionAdaptivePolicy', () => {
  it('handles streak, repeated wrong, recovery, completion, disconnect, and privacy', () => {
    expect(createAdaptiveCompanionDecision({}, { correctStreakBucket: 'large', transportHealth: 'connected' }).intent).toBe('celebrate_small');
    expect(createAdaptiveCompanionDecision({}, { repeatedWrongCountBucket: 'three_plus', transportHealth: 'connected' }).intent).toBe('suggest_break');
    expect(createAdaptiveCompanionDecision({}, { recoveryBucket: 'strong', transportHealth: 'connected' }).intent).toBe('recovery_praise');
    expect(createAdaptiveCompanionDecision({}, { sessionPhase: 'complete', completionQualityBucket: 'low', transportHealth: 'connected' }).intent).toBe('encourage');
    expect(createAdaptiveCompanionDecision({}, { sessionPhase: 'complete', completionQualityBucket: 'high', transportHealth: 'connected' }).intent).toBe('celebrate_small');
    expect(createAdaptiveCompanionDecision({}, { transportHealth: 'disconnected' }).intent).toBe('reconnect_hint');
    expect(createAdaptiveCompanionDecision({ safetyState: { privacyLock: false } }, { transportHealth: 'connected' }).intent).toBe('calm_error');
  });

  it('keeps motion false by default', () => {
    expect(createAdaptiveCompanionDecision({}, { correctStreakBucket: 'large', transportHealth: 'connected' }).shouldMove).toBe(false);
  });
});

