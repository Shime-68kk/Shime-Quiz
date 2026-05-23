/**
 * Phase 25I — Backup Health Thin Read-Only Signal Layer
 *
 * PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER
 * PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES
 * PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_DECISION: PASS_TO_PHASE25J_READ_ONLY_INTEGRATION_DESIGN_GATE
 *
 * Read-only signal normalization layer. Pure functions only.
 * No localStorage, no IndexedDB, no fetch, no network, no UI, no telemetry.
 * No backup/export/restore behavior changes.
 * No data migration. No writes.
 *
 * Production import gate: only this file and its unit tests may import
 * src/state/backupHealthTestOnlyPrototype.js at this stage.
 * No UI/routes/settings/library/dashboard/backup/restore file may import this module.
 */

import {
  deriveBackupHealthState,
  BACKUP_HEALTH_STATE,
  BACKUP_HEALTH_STATE_LABELS,
  DEFAULT_STALE_THRESHOLD_MS,
} from './backupHealthTestOnlyPrototype.js';

export { BACKUP_HEALTH_STATE, BACKUP_HEALTH_STATE_LABELS, DEFAULT_STALE_THRESHOLD_MS };

/**
 * Normalizes raw signal input, resolving field aliases.
 * Returns a plain object safe to pass to deriveBackupHealthState.
 *
 * @param {object|null|undefined} rawInput
 * @returns {object|null} normalized signals or null if input is nullish
 */
export function normalizeBackupHealthSignals(rawInput) {
  if (rawInput === null || rawInput === undefined) {
    return null;
  }

  const normalized = {};

  // Canonical field
  if (typeof rawInput.manualBackupExportedAtMs === 'number') {
    normalized.manualBackupExportedAtMs = rawInput.manualBackupExportedAtMs;
  }

  // Alias: lastManualExportCompletedAtMs -> manualBackupExportedAtMs
  if (
    normalized.manualBackupExportedAtMs === undefined &&
    typeof rawInput.lastManualExportCompletedAtMs === 'number'
  ) {
    normalized.manualBackupExportedAtMs = rawInput.lastManualExportCompletedAtMs;
  }

  if (typeof rawInput.restoreVerifiedAtMs === 'number') {
    normalized.restoreVerifiedAtMs = rawInput.restoreVerifiedAtMs;
  }

  if (typeof rawInput.restoreVerificationDataKind === 'string') {
    normalized.restoreVerificationDataKind = rawInput.restoreVerificationDataKind;
  }

  if (rawInput.unavailable !== undefined) {
    normalized.unavailable = rawInput.unavailable;
  }

  if (rawInput.error !== undefined) {
    normalized.error = rawInput.error;
  }

  return normalized;
}

/**
 * Creates a backup health signal result from raw input.
 * Normalizes aliases and derives the health state via Phase 25G helper.
 *
 * @param {object|null|undefined} rawInput - raw signal input object
 * @param {object} [options]
 * @param {number} [options.currentTimeMs] - injected current time (ms)
 * @param {number} [options.staleThresholdMs] - stale threshold override (ms)
 * @returns {{ stateId: string, label: string }}
 */
export function createBackupHealthSignal(rawInput, options = {}) {
  const normalized = normalizeBackupHealthSignals(rawInput);
  const stateId = deriveBackupHealthState(normalized, options);
  const label = BACKUP_HEALTH_STATE_LABELS[stateId] || BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.UNKNOWN];
  return { stateId, label };
}

/**
 * Derives the backup health state id directly from normalized signals.
 * Thin wrapper for use cases that want state id only.
 *
 * @param {object|null|undefined} rawInput
 * @param {object} [options]
 * @param {number} [options.currentTimeMs]
 * @param {number} [options.staleThresholdMs]
 * @returns {string} one of BACKUP_HEALTH_STATE values
 */
export function deriveBackupHealthFromSignals(rawInput, options = {}) {
  const normalized = normalizeBackupHealthSignals(rawInput);
  return deriveBackupHealthState(normalized, options);
}
