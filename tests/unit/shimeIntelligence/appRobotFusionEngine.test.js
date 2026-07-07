import { describe, expect, it } from 'vitest';
import { runShimeEcosystemFusion } from '../../../src/shimeIntelligence/appRobotFusionEngine.js';

describe('appRobotFusionEngine', () => {
  it('combines safe FSRS, companion, robot, transport, and timetable plans', () => {
    const result = runShimeEcosystemFusion({
      fsrs: { dueCount: 10, retrievability: 0.3, stability: 2, difficulty: 8 },
      companionIntent: 'focus_gently',
      robotProfile: { supportsDisplay: true, supportsLed: true },
      transport: { userConsentState: 'explicit_yes', isSameLan: true, wifiHealth: 'good', latencyNeedBucket: 'live' }
    });
    expect(result.dryRunOnly).toBe(true);
    expect(result.sendStatus).toBe('not_sent');
    expect(result.robotInterventionPlan.suggestedMotionPolicy).toBe('locked');
    expect(result.safetyDecision.appAuthorityPreserved).toBe(true);
    expect(result.safetyDecision.schedulerMutationAllowed).toBe(false);
  });

  it('blocks unsafe sensitive fusion input', () => {
    const result = runShimeEcosystemFusion({ fsrs: { prompt: 'private' } });
    expect(result.learningCapsule.privacyStatus).toBe('blocked');
    expect(JSON.stringify(result)).not.toContain('private');
  });
});
