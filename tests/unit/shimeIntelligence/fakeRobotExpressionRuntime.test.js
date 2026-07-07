import { describe, expect, it } from 'vitest';
import { applyRobotExpressionPlan, createFakeRobotExpressionRuntime, getFakeRobotExpressionSnapshot, resetFakeRobotExpressionRuntime } from '../../../src/shimeIntelligence/fakeRobotExpressionRuntime.js';
import { mapFusionToRobotExpression } from '../../../src/shimeIntelligence/robotExpressionMapper.js';
import { runShimeEcosystemFusion } from '../../../src/shimeIntelligence/appRobotFusionEngine.js';

function plan() {
  return mapFusionToRobotExpression(runShimeEcosystemFusion({ fsrs: { dueCount: 20, retrievability: 0.5, stability: 5, difficulty: 4 }, robotProfile: { supportsDisplay: true } }));
}

describe('fakeRobotExpressionRuntime', () => {
  it('starts neutral, applies safe plans, bounds transcript, and resets', () => {
    const initial = createFakeRobotExpressionRuntime({ transcriptLimit: 2 });
    expect(initial.currentExpressionFamily).toBe('neutral_presence');
    const first = applyRobotExpressionPlan(initial, plan(), { scenarioId: 'a' });
    const second = applyRobotExpressionPlan(first, plan(), { scenarioId: 'b' });
    const third = applyRobotExpressionPlan(second, plan(), { scenarioId: 'c' });
    const snapshot = getFakeRobotExpressionSnapshot(third);
    expect(snapshot.recentPreviewRows).toHaveLength(2);
    expect(snapshot.motionPolicy).toBe('locked');
    expect(snapshot.dryRunOnly).toBe(true);
    expect(snapshot.sendStatus).toBe('not_sent');
    expect(resetFakeRobotExpressionRuntime().recentPreviewRows).toEqual([]);
  });
});
