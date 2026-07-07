import { describe, expect, it } from 'vitest';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { collectForbiddenCompanionKeys } from '../../src/companion/companionContextSchema.js';

describe('companionAdversarialGenerator', () => {
  it('is deterministic for the same seed', () => {
    expect(generateCompanionAdversarialScenarios({ seed: 7, count: 12 })).toEqual(generateCompanionAdversarialScenarios({ seed: 7, count: 12 }));
  });

  it('changes generated sequences when seed changes', () => {
    expect(generateCompanionAdversarialScenarios({ seed: 7, count: 12 })).not.toEqual(generateCompanionAdversarialScenarios({ seed: 8, count: 12 }));
  });

  it('generates at least 100 bounded scenarios', () => {
    const scenarios = generateCompanionAdversarialScenarios({ seed: 31, count: 100, maxEvents: 50 });
    expect(scenarios).toHaveLength(100);
    expect(Math.max(...scenarios.map(scenario => scenario.events.length))).toBeLessThanOrEqual(50);
  });

  it('keeps valid scenarios free of sensitive keys and marks attacks invalid', () => {
    const scenarios = generateCompanionAdversarialScenarios({ seed: 31, count: 100 });
    const valid = scenarios.filter(scenario => scenario.valid);
    expect(valid.every(scenario => collectForbiddenCompanionKeys(scenario.events).length === 0)).toBe(true);
    expect(scenarios.filter(scenario => scenario.attack).every(scenario => scenario.valid === false)).toBe(true);
  });
});
