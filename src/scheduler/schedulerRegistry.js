import { validateSchedulerAdapter } from './schedulerAdapterContract.js';
import { sm2SchedulerAdapter, SM2_SCHEDULER_ID } from './sm2SchedulerAdapter.js';
import { fsrsBetaSchedulerAdapter, FSRS_BETA_SCHEDULER_ID } from './fsrsBetaSchedulerAdapter.js';
import { evaluateFsrsReadinessGate, createPassingFsrsBetaEvidence } from './fsrsReadinessGate.js';

const registry = new Map();

export function registerScheduler(adapter) {
  const validation = validateSchedulerAdapter(adapter);
  if (!validation.ok) throw new TypeError(`Invalid scheduler adapter: ${validation.error}`);
  registry.set(adapter.schedulerId, adapter);
  return adapter;
}

export function resetSchedulerRegistryForTest() {
  registry.clear();
  registerScheduler(sm2SchedulerAdapter);
  registerScheduler(fsrsBetaSchedulerAdapter);
}

export function getScheduler(schedulerId) {
  return registry.get(String(schedulerId || '').trim()) || null;
}

export function listSchedulers() {
  return Array.from(registry.values()).map(adapter => ({
    schedulerId: adapter.schedulerId,
    schedulerVersion: adapter.schedulerVersion,
    stabilityLevel: adapter.stabilityLevel,
    privacyClass: adapter.privacyClass,
    supportsRollback: adapter.supportsRollback,
    requiresExplicitOptIn: adapter.requiresExplicitOptIn === true
  }));
}

export function getDefaultScheduler() {
  return getScheduler(SM2_SCHEDULER_ID);
}

export function fallbackToStableScheduler(reason = 'unknown_scheduler') {
  return {
    scheduler: getDefaultScheduler(),
    activeSchedulerId: SM2_SCHEDULER_ID,
    fallbackReason: String(reason || 'unknown_scheduler'),
    decisionCodes: ['FALLBACK_TO_SM2', 'LOCAL_ONLY']
  };
}

export function resolveUserSchedulerPreference(settings = {}, evidence = createPassingFsrsBetaEvidence()) {
  const requested = String(settings.schedulerPreference || settings.activeSchedulerId || '').trim();
  if (requested !== FSRS_BETA_SCHEDULER_ID) {
    return {
      scheduler: getDefaultScheduler(),
      activeSchedulerId: SM2_SCHEDULER_ID,
      defaultSchedulerId: SM2_SCHEDULER_ID,
      betaEnabled: false,
      rollbackAvailable: true,
      reason: 'stable_default'
    };
  }

  const gate = evaluateFsrsReadinessGate(evidence);
  const explicitOptIn = settings.fsrsBetaOptIn === true || settings.fsrsExperimentalEnabled === true;
  if (explicitOptIn && gate.fsrsCanBeBetaOptIn === true) {
    return {
      scheduler: getScheduler(FSRS_BETA_SCHEDULER_ID),
      activeSchedulerId: FSRS_BETA_SCHEDULER_ID,
      defaultSchedulerId: SM2_SCHEDULER_ID,
      betaEnabled: true,
      rollbackAvailable: true,
      readiness: gate,
      reason: 'explicit_beta_opt_in'
    };
  }

  return {
    ...fallbackToStableScheduler('fsrs_beta_gate_or_opt_in_missing'),
    defaultSchedulerId: SM2_SCHEDULER_ID,
    betaEnabled: false,
    rollbackAvailable: true,
    readiness: gate
  };
}

resetSchedulerRegistryForTest();
