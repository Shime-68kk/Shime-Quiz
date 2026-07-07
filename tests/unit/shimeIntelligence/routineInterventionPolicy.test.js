import { describe, expect, it } from 'vitest';
import { getRoutineInterventionPolicy, selectRoutineInterventionRule, validateRoutineInterventionPolicy } from '../../../src/shimeIntelligence/routineInterventionPolicy.js';

describe('routineInterventionPolicy', () => {
  it('preserves agency, rest, and suggestion-only boundaries', () => {
    const policy = getRoutineInterventionPolicy();
    const validation = validateRoutineInterventionPolicy(policy);
    expect(policy.principles).toContain('user_agency_first');
    expect(policy.principles).toContain('suggest_do_not_force');
    expect(policy.principles).toContain('protect_rest');
    expect(policy.principles).toContain('do_not_shame');
    expect(policy.scheduleMutationAllowed).toBe(false);
    expect(policy.notificationAllowed).toBe(false);
    expect(policy.calendarMutationAllowed).toBe(false);
    expect(policy.dryRunOnly).toBe(true);
    expect(validation.ok).toBe(true);
  });

  it('selects routine rules without escalating one missed session', () => {
    expect(selectRoutineInterventionRule({}, { quietMode: true }).recommendation).toBe('protect_rest');
    expect(selectRoutineInterventionRule({ sessionFatigueBucket: 'high' }).recommendation).toBe('protect_rest');
    expect(selectRoutineInterventionRule({ singleMiss: true, duePressureBucket: 'low' }).recommendation).toBe('no_nudge');
    expect(selectRoutineInterventionRule({ recoveryNeedBucket: 'high' }).recommendation).toBe('recovery_session_today');
    expect(selectRoutineInterventionRule({ scheduleDriftBucket: 'high' }).recommendation).toBe('resume_habit');
    expect(selectRoutineInterventionRule({ duePressureBucket: 'high' }).recommendation).toBe('short_session_soon');
  });
});
