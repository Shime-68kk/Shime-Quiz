/**
 * Phase 25K — Backup Health Test-Only Default-Off Integration Prototype
 *
 * PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY
 *
 * Test-only/default-off integration adapter. Pure functions only.
 * No localStorage, no IndexedDB, no fetch, no network, no UI, no telemetry.
 * No backup/export/restore behavior changes.
 * No data migration. No writes.
 *
 * Import gate: only this file and its unit tests may import this module at this stage.
 * No UI/routes/settings/library/dashboard/backup/restore file may import this module.
 * No production entry point may import this module.
 */

import {
  createBackupHealthSignal,
  BACKUP_HEALTH_STATE,
} from './backupHealthSignal.js';

export { BACKUP_HEALTH_STATE };

/**
 * Determines whether the backup health integration prototype is enabled.
 *
 * Default behavior:
 *   isBackupHealthIntegrationEnabled(undefined)        -> false
 *   isBackupHealthIntegrationEnabled({})               -> false
 *   isBackupHealthIntegrationEnabled({ enabled: false }) -> false
 *   isBackupHealthIntegrationEnabled({ enabled: true, mode: 'test' }) -> true
 *   isBackupHealthIntegrationEnabled({ enabled: true, mode: 'default-off' }) -> true
 *
 * Only an explicit test/default-off opt-in enables this prototype.
 *
 * @param {object|undefined|null} options
 * @param {boolean} [options.enabled]
 * @param {string} [options.mode] - must be 'test' or 'default-off' to enable
 * @returns {boolean}
 */
export function isBackupHealthIntegrationEnabled(options) {
  if (options === null || options === undefined) return false;
  if (typeof options !== 'object') return false;
  if (options.enabled !== true) return false;

  const mode = options.mode;
  return mode === 'test' || mode === 'default-off';
}

/**
 * Creates a backup health integration state object.
 *
 * When disabled, returns a conservative disabled sentinel.
 * When enabled, delegates to the Phase 25I signal layer and returns a wrapper.
 *
 * @param {object|null|undefined} input - raw signal input passed to Phase 25I signal layer
 * @param {object} [options]
 * @param {boolean} [options.enabled]
 * @param {string} [options.mode] - 'test' or 'default-off'
 * @param {number} [options.currentTimeMs] - injected current time (ms); forwarded to signal layer
 * @param {number} [options.staleThresholdMs] - stale threshold override; forwarded to signal layer
 * @returns {{ enabled: boolean, stateId: string, source: string, label?: string }}
 */
export function createBackupHealthIntegrationState(input, options) {
  if (!isBackupHealthIntegrationEnabled(options)) {
    return {
      enabled: false,
      stateId: 'unknown',
      source: 'phase25k_disabled',
    };
  }

  const signalOptions = {};
  if (options && typeof options.currentTimeMs === 'number') {
    signalOptions.currentTimeMs = options.currentTimeMs;
  }
  if (options && typeof options.staleThresholdMs === 'number') {
    signalOptions.staleThresholdMs = options.staleThresholdMs;
  }

  const { stateId, label } = createBackupHealthSignal(input, signalOptions);

  return {
    enabled: true,
    stateId,
    label,
    source: 'phase25i_signal_layer',
  };
}
