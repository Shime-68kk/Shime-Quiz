import { describe, expect, it } from 'vitest';
import { getShimeEcosystemPolicy } from '../../../src/shimeIntelligence/shimeEcosystemPolicy.js';

describe('shimeEcosystemPolicy', () => {
  it('declares FSRS canonical and robot/timetable suggestion-only rules', () => {
    const policy = getShimeEcosystemPolicy();
    expect(policy.fsrsCanonical).toBe(true);
    expect(policy.robotSuggestionOnly).toBe(true);
    expect(policy.timetableSuggestionOnly).toBe(true);
    expect(policy.capsuleOnlyBridge).toBe(true);
  });
});
