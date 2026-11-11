import { FSRS_BETA_SCHEDULER_ID } from './fsrsBetaSchedulerAdapter.js';
import { SM2_SCHEDULER_ID } from './sm2SchedulerAdapter.js';
import { SCHEDULER_PREFERENCE_STATES } from './schedulerBetaPreferenceModel.js';
import { getScheduler } from './schedulerRegistry.js';

export const SCHEDULER_BACKUP_METADATA_SCHEMA_VERSION = 'scheduler-backup-metadata-v1';

export function createSchedulerBackupMetadata(model = {}) {
  const activeSchedulerId = getScheduler(model.activeSchedulerId)
    ? model.activeSchedulerId
    : SM2_SCHEDULER_ID;
  const activeScheduler = getScheduler(activeSchedulerId);
  const stableScheduler = getScheduler(SM2_SCHEDULER_ID);
  return {
    schemaVersion: SCHEDULER_BACKUP_METADATA_SCHEMA_VERSION,
    activeSchedulerId,
    defaultSchedulerId: SM2_SCHEDULER_ID,
    rollbackSchedulerId: SM2_SCHEDULER_ID,
    schedulerPreferenceState: activeSchedulerId === SM2_SCHEDULER_ID
      ? SCHEDULER_PREFERENCE_STATES.SM2_STABLE
      : activeSchedulerId === FSRS_BETA_SCHEDULER_ID
        ? SCHEDULER_PREFERENCE_STATES.FSRS_BETA_OPT_IN
        : `scheduler_opt_in:${activeSchedulerId}`,
    schedulerAdapterVersion: activeScheduler?.schedulerVersion || '',
    schedulerStateSchemaVersion: activeScheduler?.stateSchemaVersion || 1,
    rollbackSchedulerVersion: stableScheduler?.schedulerVersion || '',
    fsrsCanBeDefault: false,
    rawContentIncluded: false
  };
}

export function importSchedulerBackupMetadata(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, activeSchedulerId: SM2_SCHEDULER_ID, fallbackReason: 'invalid_metadata' };
  }
  const activeSchedulerId = getScheduler(raw.activeSchedulerId)
    ? raw.activeSchedulerId
    : SM2_SCHEDULER_ID;
  return {
    ok: true,
    activeSchedulerId,
    defaultSchedulerId: SM2_SCHEDULER_ID,
    rollbackSchedulerId: SM2_SCHEDULER_ID,
    schedulerAdapterVersion: getScheduler(activeSchedulerId)?.schedulerVersion || '',
    schedulerStateSchemaVersion: getScheduler(activeSchedulerId)?.stateSchemaVersion || 1,
    fallbackReason: activeSchedulerId === raw.activeSchedulerId ? '' : 'unknown_scheduler_fallback',
    fsrsCanBeDefault: false,
    rawContentIncluded: false
  };
}

export function assertSchedulerMetadataHasNoRawContent(metadata = {}) {
  const text = JSON.stringify(metadata);
  const blocked = ['question', 'answer', 'prompt', 'explanation', 'userAnswer', 'sourceMetadata'];
  for (const key of blocked) {
    if (text.includes(key)) throw new TypeError(`Scheduler metadata contains raw content marker: ${key}`);
  }
  return true;
}
