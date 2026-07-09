import { describe, expect, it } from 'vitest';
import {
  SCHEDULER_PREFERENCE_STATES,
  applySchedulerPreferenceAction,
  createSchedulerPreferenceModel
} from '../../src/scheduler/schedulerBetaPreferenceModel.js';
import { createPassingFsrsBetaEvidence } from '../../src/scheduler/fsrsReadinessGate.js';

describe('schedulerBetaPreferenceModel', () => {
  it('defaults to SM2 with rollback available', () => {
    expect(createSchedulerPreferenceModel()).toMatchObject({
      activeSchedulerId: 'sm2',
      defaultSchedulerId: 'sm2',
      betaEnabled: false,
      rollbackAvailable: true
    });
  });

  it('allows FSRS beta only after explicit opt-in and passing evidence', () => {
    const model = createSchedulerPreferenceModel({
      state: SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN,
      explicitUserOptIn: true
    }, createPassingFsrsBetaEvidence());
    expect(model).toMatchObject({ activeSchedulerId: 'fsrs-beta', betaEnabled: true });
    expect(model.backupMetadata.fsrsCanBeDefault).toBe(false);
  });

  it('models rollback and clearing beta preference', () => {
    const optedIn = applySchedulerPreferenceAction({}, { type: 'opt_into_fsrs_beta' });
    expect(optedIn.state).toBe(SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN);
    const rolledBack = applySchedulerPreferenceAction(optedIn, { type: 'rollback_to_sm2' });
    expect(rolledBack).toMatchObject({ state: SCHEDULER_PREFERENCE_STATES.FALLBACK_TO_SM2, explicitUserOptIn: false });
  });
});
