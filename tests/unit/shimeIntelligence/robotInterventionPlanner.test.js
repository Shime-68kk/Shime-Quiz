import { describe, expect, it } from 'vitest';
import { planRobotIntervention } from '../../../src/shimeIntelligence/robotInterventionPlanner.js';

const base = { privacyStatus: 'redacted_coarse_only', transportHealth: 'connected', robotAvailability: 'available', safetyMode: 'motion_disabled' };
const capable = { robotProfile: { supportsDisplay: true, supportsLed: true } };

describe('robotInterventionPlanner', () => {
  it('plans review, risk, recovery, stability, completion, privacy, and transport safely', () => {
    expect(planRobotIntervention({ ...base, duePressureBucket: 'high' }, capable).interventionFamily).toBe('review_due_nudge');
    expect(planRobotIntervention({ ...base, forgettingRiskBucket: 'high' }, capable).interventionFamily).toBe('memory_risk_nudge');
    expect(planRobotIntervention({ ...base, recoveryNeedBucket: 'high' }, capable).interventionFamily).toBe('gentle_encourage');
    expect(planRobotIntervention({ ...base, sessionPhase: 'complete', stabilityBucket: 'high' }, capable).interventionFamily).toBe('celebrate_stability_gain');
    expect(planRobotIntervention({ ...base, sessionPhase: 'complete' }, capable).interventionFamily).toBe('celebrate_session_complete');
    expect(planRobotIntervention({ ...base, privacyStatus: 'blocked' }).interventionFamily).toBe('calm_error');
    expect(planRobotIntervention({ ...base, transportHealth: 'error' }).interventionFamily).toBe('reconnect_hint');
    expect(planRobotIntervention({ ...base, duePressureBucket: 'high' }, capable).suggestedMotionPolicy).toBe('locked');
  });
});
