import { describe, expect, it } from 'vitest';
import { explainFsrsRobotPolicySelection, getFsrsRobotPolicyMatrix, selectRobotPolicyFromFsrsSignals, selectTimetablePolicyFromFsrsSignals } from '../../../src/shimeIntelligence/fsrsRobotPolicyMatrix.js';

describe('fsrsRobotPolicyMatrix', () => {
  it('maps FSRS-derived memory buckets to robot and timetable policy without raw content', () => {
    const matrix = getFsrsRobotPolicyMatrix();
    expect(matrix.rules.length).toBeGreaterThanOrEqual(8);
    expect(selectRobotPolicyFromFsrsSignals({ duePressureBucket: 'high', recoveryNeedBucket: 'none' }).robotPolicy).toBe('review_due_nudge');
    expect(selectRobotPolicyFromFsrsSignals({ duePressureBucket: 'high', recoveryNeedBucket: 'high' }).robotPolicy).toBe('focus_ritual');
    expect(selectRobotPolicyFromFsrsSignals({ retrievabilityBucket: 'low', forgettingRiskBucket: 'high' }).robotPolicy).toBe('memory_risk_nudge');
    expect(selectRobotPolicyFromFsrsSignals({ recoveryNeedBucket: 'high' }).robotPolicy).toBe('gentle_encourage');
    expect(selectRobotPolicyFromFsrsSignals({ stabilityBucket: 'high' }).robotPolicy).toBe('celebrate_stability_gain');
    expect(selectRobotPolicyFromFsrsSignals({ scheduleDriftBucket: 'high' }).robotPolicy).toBe('review_due_nudge');
    expect(selectRobotPolicyFromFsrsSignals({ privacyStatus: 'blocked' }).robotPolicy).toBe('calm_error');
  });

  it('keeps timetable policy suggestion-only and respects quiet/classroom context', () => {
    const quiet = selectTimetablePolicyFromFsrsSignals({ duePressureBucket: 'high' }, { quietMode: true });
    const classroom = selectRobotPolicyFromFsrsSignals({ duePressureBucket: 'high' }, { classroomSafe: true });
    const explanation = explainFsrsRobotPolicySelection(classroom);
    expect(quiet.timetablePolicy).toBe('protect_rest');
    expect(quiet.scheduleMutationAllowed).toBe(false);
    expect(quiet.dryRunOnly).toBe(true);
    expect(classroom.intensityPolicy).toBe('reduced');
    expect(explanation.dryRunOnly).toBe(true);
  });
});
