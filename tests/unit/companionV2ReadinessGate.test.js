import { describe, expect, it } from 'vitest';
import { generateCompanionAdversarialScenarios } from '../../src/companion/companionAdversarialGenerator.js';
import { evaluateCompanionV2Readiness } from '../../src/companion/companionV2ReadinessGate.js';
import { getCompanionReplayFixtures } from '../../tools/deviceBridge/companionReplayFixtures.mjs';

describe('companionV2ReadinessGate', () => {
  it('includes all required dimensions and passes known safe benchmark', () => {
    const report = evaluateCompanionV2Readiness([
      ...getCompanionReplayFixtures(),
      ...generateCompanionAdversarialScenarios({ seed: 31, count: 100 })
    ]);
    expect(report.dimensions.map(entry => entry.name)).toEqual(expect.arrayContaining([
      'privacy',
      'safety',
      'determinism',
      'nonSpam',
      'behaviorCoverage',
      'robotCommandSafety',
      'classroomSafety',
      'disconnectedSafety',
      'sensitiveAttackHandling',
      'integrationReadiness'
    ]));
    expect(report.overall).toBe('PASS');
  });

  it('fails when coverage is missing', () => {
    const report = evaluateCompanionV2Readiness([{ name: 'only one', events: [{ eventType: 'question_presented', sessionId: 'x', payload: {} }] }]);
    expect(report.overall).toBe('FAIL');
    expect(report.blockers).toContain('behaviorCoverage');
  });
});
