import { describe, expect, it } from 'vitest';
import { planTimetableIntervention } from '../../../src/shimeIntelligence/timetableInterventionPlanner.js';

describe('timetableInterventionPlanner', () => {
  it('suggests only and never mutates schedules', () => {
    expect(planTimetableIntervention({ scheduleDriftBucket: 'high' }).routineRecommendation).toBe('resume_habit');
    expect(planTimetableIntervention({ recoveryNeedBucket: 'high' }).routineRecommendation).toBe('recovery_session_today');
    expect(planTimetableIntervention({ sessionFatigueBucket: 'high' }).routineRecommendation).toBe('protect_rest');
    expect(planTimetableIntervention({ duePressureBucket: 'none' }).routineRecommendation).toBe('no_nudge');
    expect(planTimetableIntervention({ scheduleDriftBucket: 'high' }).mutatesSchedule).toBe(false);
  });
});
