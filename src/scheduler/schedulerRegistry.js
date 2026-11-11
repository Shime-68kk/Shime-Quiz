import { validateSchedulerAdapter } from './schedulerAdapterContract.js';
import { sm2SchedulerAdapter, SM2_SCHEDULER_ID } from './sm2SchedulerAdapter.js';
import { fsrsBetaSchedulerAdapter, FSRS_BETA_SCHEDULER_ID } from './fsrsBetaSchedulerAdapter.js';
import { evaluateFsrsReadinessGate, createPassingFsrsBetaEvidence } from './fsrsReadinessGate.js';

const registry = new Map();

export function registerScheduler(adapter, options = {}) {
  const validation = validateSchedulerAdapter(adapter);
  if (!validation.ok) throw new TypeError(`Invalid scheduler adapter: ${validation.error}`);
  const existing = registry.get(adapter.schedulerId);
  if (existing && options.replace !== true) {
    throw new TypeError(`Scheduler already registered: ${adapter.schedulerId}`);
  }
  if (existing && adapter.schedulerId === SM2_SCHEDULER_ID && adapter !== sm2SchedulerAdapter) {
    throw new TypeError('The stable SM-2 fallback cannot be replaced.');
  }
  registry.set(adapter.schedulerId, adapter);
  return adapter;
}

export function unregisterScheduler(schedulerId) {
  const id = String(schedulerId || '').trim();
  if (!id || id === SM2_SCHEDULER_ID) return false;
  return registry.delete(id);
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
    stateSchemaVersion: adapter.stateSchemaVersion,
    stabilityLevel: adapter.stabilityLevel,
    privacyClass: adapter.privacyClass,
    supportsRollback: adapter.supportsRollback,
    requiresExplicitOptIn: adapter.requiresExplicitOptIn === true,
    capabilities: Array.isArray(adapter.capabilities) ? [...adapter.capabilities] : []
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

export function resolveSchedulerSelection(preference = {}, context = {}) {
  const requestedSchedulerId = String(
    preference.schedulerPreference || preference.activeSchedulerId || preference.schedulerId || SM2_SCHEDULER_ID
  ).trim();
  const scheduler = getScheduler(requestedSchedulerId);
  if (!scheduler) return fallbackToStableScheduler('unknown_scheduler');
  if (requestedSchedulerId === SM2_SCHEDULER_ID) {
    return {
      scheduler,
      activeSchedulerId: SM2_SCHEDULER_ID,
      fallbackReason: '',
      decisionCodes: ['SM2_BASELINE', 'LOCAL_ONLY']
    };
  }

  const explicitOptIn =
    preference.explicitOptIn === true ||
    preference.fsrsBetaOptIn === true ||
    preference.fsrsExperimentalEnabled === true;
  if (scheduler.requiresExplicitOptIn === true && !explicitOptIn) {
    return fallbackToStableScheduler('explicit_opt_in_required');
  }
  if (typeof scheduler.canActivate === 'function') {
    try {
      if (scheduler.canActivate({ preference, context }) !== true) {
        return fallbackToStableScheduler('scheduler_activation_gate_blocked');
      }
    } catch {
      return fallbackToStableScheduler('scheduler_activation_gate_failed');
    }
  }

  return {
    scheduler,
    activeSchedulerId: scheduler.schedulerId,
    fallbackReason: '',
    decisionCodes: ['LOCAL_ONLY']
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
      ...resolveSchedulerSelection({ schedulerId: FSRS_BETA_SCHEDULER_ID, explicitOptIn: true }),
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
