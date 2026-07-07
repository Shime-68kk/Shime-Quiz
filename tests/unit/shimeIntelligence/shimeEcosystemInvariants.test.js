import { describe, expect, it } from 'vitest';
import { assertShimeEcosystemInvariants } from '../../../src/shimeIntelligence/shimeEcosystemInvariants.js';

describe('shimeEcosystemInvariants', () => {
  it('passes safe output and fails unsafe output', () => {
    expect(assertShimeEcosystemInvariants({ dryRunOnly: true, sendStatus: 'not_sent', robotInterventionPlan: { sendStatus: 'not_sent', suggestedMotionPolicy: 'locked', reasonCodes: ['safe'] }, transportPlan: { opensConnection: false }, timetablePlan: { mutatesSchedule: false }, safetyDecision: { appAuthorityPreserved: true, reasonCodes: ['safe'] }, reasonCodes: ['safe'] }).ok).toBe(true);
    const bad = assertShimeEcosystemInvariants({ correctAnswer: 'private', dryRunOnly: false, sendStatus: 'sent', robotInterventionPlan: { sendStatus: 'sent', suggestedMotionPolicy: 'unlocked' }, timetablePlan: { mutatesSchedule: true } });
    expect(bad.ok).toBe(false);
    expect(bad.failures).toEqual(expect.arrayContaining(['sensitive_output', 'not_dry_run', 'send_status_not_safe', 'schedule_mutation']));
  });
});
