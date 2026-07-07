import { describe, expect, it } from 'vitest';
import { createCompanionGoldenReplay, createCompanionGoldenSnapshot } from '../../src/companion/companionGoldenReplay.js';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';
import { checkCompanionOutputForSensitiveData } from '../../src/companion/companionInvariants.js';

describe('companionGoldenReplay', () => {
  it('creates deterministic golden snapshots without raw payloads', () => {
    const scenarios = generateCompanionAdversarialScenarios({ seed: 9, count: 10 });
    const a = createCompanionGoldenReplay(scenarios);
    const b = createCompanionGoldenReplay(scenarios);
    expect(a).toEqual(b);
    expect(checkCompanionOutputForSensitiveData(a).ok).toBe(true);
    expect(JSON.stringify(a)).not.toContain('payload');
  });

  it('captures expected core scenario intent and command families', () => {
    const fixtures = getCompanionReplayFixtures();
    const high = createCompanionGoldenSnapshot(fixtures.find(fixture => fixture.name === 'high accuracy completion'));
    expect(high.finalIntent).toBe('celebrate_small');
    expect(high.finalCommand).toBe('session_complete');
    expect(high.invariantStatus).toBe('pass');
  });
});
