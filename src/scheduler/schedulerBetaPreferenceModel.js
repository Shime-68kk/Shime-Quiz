import { FSRS_BETA_SCHEDULER_ID } from './fsrsBetaSchedulerAdapter.js';
import { SM2_SCHEDULER_ID } from './sm2SchedulerAdapter.js';
import { evaluateFsrsReadinessGate } from './fsrsReadinessGate.js';

export const SCHEDULER_PREFERENCE_STATES = {
  SM2_STABLE: 'sm2_stable',
  FSRS_BETA_OPT_IN: 'fsrs_beta_opt_in',
  FSRS_BETA_PREVIEW_ONLY: 'fsrs_beta_preview_only',
  FALLBACK_TO_SM2: 'fallback_to_sm2',
  BLOCKED_EXPERIMENTAL: 'blocked_experimental_scheduler'
};

export function createSchedulerPreferenceModel(preference = {}, evidence = {}) {
  const requested = String(preference.state || SCHEDULER_PREFERENCE_STATES.SM2_STABLE);
  const readiness = evaluateFsrsReadinessGate(evidence);
  const betaRequested = requested === SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN;
  const betaPreview = requested === SCHEDULER_PREFERENCE_STATES.FSRS_BETA_PREVIEW_ONLY;
  const betaAllowed = betaRequested && preference.explicitUserOptIn === true && readiness.fsrsCanBeBetaOptIn === true;
  const activeSchedulerId = betaAllowed ? FSRS_BETA_SCHEDULER_ID : SM2_SCHEDULER_ID;

  return {
    activeSchedulerId,
    defaultSchedulerId: SM2_SCHEDULER_ID,
    betaEnabled: activeSchedulerId === FSRS_BETA_SCHEDULER_ID,
    rollbackAvailable: true,
    userFacingWarningCodes: betaAllowed || betaPreview
      ? ['FSRS_BETA_OPT_IN_ONLY', 'ROLLBACK_TO_SM2_AVAILABLE', 'LOCAL_ONLY_NO_RAW_CONTENT']
      : ['SM2_STABLE_DEFAULT'],
    backupMetadata: {
      schedulerPreferenceState: betaAllowed
        ? SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN
        : betaPreview
          ? SCHEDULER_PREFERENCE_STATES.FSRS_BETA_PREVIEW_ONLY
          : SCHEDULER_PREFERENCE_STATES.SM2_STABLE,
      activeSchedulerId,
      defaultSchedulerId: SM2_SCHEDULER_ID,
      rollbackSchedulerId: SM2_SCHEDULER_ID,
      fsrsCanBeDefault: false
    },
    importCompatibility: {
      unknownSchedulerFallback: SM2_SCHEDULER_ID,
      irreversibleMigrationRequired: false,
      rawContentRequired: false
    },
    readiness
  };
}

export function applySchedulerPreferenceAction(current = {}, action = {}) {
  const type = String(action.type || '').trim();
  if (type === 'preview_fsrs_effect') {
    return { ...current, state: SCHEDULER_PREFERENCE_STATES.FSRS_BETA_PREVIEW_ONLY };
  }
  if (type === 'opt_into_fsrs_beta') {
    return { ...current, state: SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN, explicitUserOptIn: true };
  }
  if (type === 'rollback_to_sm2') {
    return { ...current, state: SCHEDULER_PREFERENCE_STATES.FALLBACK_TO_SM2, explicitUserOptIn: false };
  }
  if (type === 'clear_beta_preference') {
    return { state: SCHEDULER_PREFERENCE_STATES.SM2_STABLE, explicitUserOptIn: false };
  }
  return { ...current, state: SCHEDULER_PREFERENCE_STATES.BLOCKED_EXPERIMENTAL };
}
