/**
 * Phase 25G — Backup Health Test-Only Runtime Prototype
 *
 * PHASE25G_BACKUP_HEALTH_RUNTIME_SCOPE: TEST_ONLY_NO_PRODUCTION_IMPORTS_NO_UI
 *
 * This module is TEST-ONLY. Do not import from production UI, routes,
 * settings, dashboard, library, backup, restore, or storage modules.
 *
 * Pure state derivation helper with no storage, network, or side-effect calls.
 */

// State IDs — Phase 25E mapping reference in docs
export const BACKUP_HEALTH_STATE = {
  UNKNOWN: `unknown`,
  NO_BACKUP_RECORDED: `no_backup_recorded`,
  RECENT_MANUAL_BACKUP: `recent_manual_backup`,
  BACKUP_MAY_BE_STALE: `backup_may_be_stale`,
  RESTORE_VERIFIED_TEST_DATA: `restore_verified_test_data`,
  STATUS_UNAVAILABLE: `status_unavailable`,
};

// Phase 25E display name mapping
export const BACKUP_HEALTH_STATE_LABELS = {
  [BACKUP_HEALTH_STATE.UNKNOWN]: `Unknown backup status`,
  [BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED]: `No backup recorded in this browser`,
  [BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP]: `Recent manual backup recorded`,
  [BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE]: `Backup may be stale`,
  [BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA]: `Restore recently verified on generated/test data`,
  [BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE]: `Backup status unavailable`,
};

// Default stale threshold: 7 days in ms
export const DEFAULT_STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000;

// Accepted restore verification data kinds that count as verified
const VERIFIED_DATA_KINDS = new Set([`generated`, `test`, `fixture`, `synthetic`]);

/**
 * Derives a backup health state id from input signals.
 *
 * @param {object|null|undefined} inputSignals - plain object of backup signals
 * @param {number} [inputSignals.manualBackupExportedAtMs] - epoch ms of last manual export
 * @param {number} [inputSignals.restoreVerifiedAtMs] - epoch ms of last restore verification
 * @param {string} [inputSignals.restoreVerificationDataKind] - kind of data used for verification
 * @param {boolean} [inputSignals.unavailable] - signals that status cannot be determined
 * @param {*} [inputSignals.error] - signals an error condition
 * @param {object} [options]
 * @param {number} [options.currentTimeMs] - injected current time (defaults to Date.now())
 * @param {number} [options.staleThresholdMs] - stale threshold override
 * @returns {string} one of BACKUP_HEALTH_STATE values
 */
export function deriveBackupHealthState(inputSignals, options = {}) {
  // No signal provided at all -> unknown
  if (inputSignals === null || inputSignals === undefined) {
    return BACKUP_HEALTH_STATE.UNKNOWN;
  }

  const {
    manualBackupExportedAtMs,
    restoreVerifiedAtMs,
    restoreVerificationDataKind,
    unavailable,
    error,
  } = inputSignals;

  const currentTimeMs = (options && typeof options.currentTimeMs === `number`)
    ? options.currentTimeMs
    : Date.now();

  const staleThresholdMs = (options && typeof options.staleThresholdMs === `number`)
    ? options.staleThresholdMs
    : DEFAULT_STALE_THRESHOLD_MS;

  // Conservative: if unavailable or error is present, prefer status_unavailable
  if (unavailable || error) {
    return BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE;
  }

  // Restore verification from generated/test data outranks manual backup recency
  if (typeof restoreVerifiedAtMs === `number` && isFinite(restoreVerifiedAtMs)) {
    const kind = typeof restoreVerificationDataKind === `string`
      ? restoreVerificationDataKind.toLowerCase()
      : ``;
    if (VERIFIED_DATA_KINDS.has(kind)) {
      return BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA;
    }
  }

  // Manual backup present
  if (typeof manualBackupExportedAtMs === `number` && isFinite(manualBackupExportedAtMs)) {
    const ageMs = currentTimeMs - manualBackupExportedAtMs;
    // Future timestamps or negative age treated as recent (safe fallback)
    if (ageMs <= staleThresholdMs) {
      return BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP;
    }
    return BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE;
  }

  // Empty signal object (no backup fields present)
  return BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED;
}
