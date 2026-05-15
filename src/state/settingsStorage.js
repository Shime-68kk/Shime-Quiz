/**
 * src/state/settingsStorage.js
 *
 * Phase 14G — FSRS Settings Storage Scaffold
 *
 * Lazy initialization: getSettings() never writes to localStorage.
 * Only updateSettings() and importSettings() may write.
 *
 * Missing key → default OFF (fsrsExperimentalEnabled: false) returned in memory.
 * Invalid JSON → default OFF returned in memory, no localStorage write or remove.
 *
 * No UI. No enrollment. No adapter routing changes.
 */

import { getLocalStorage } from '../utils/storage.js';
import { publishLearningStorageChanged } from './localStorageSync.js';

export const SETTINGS_STORAGE_KEY = 'shimeV2SettingsV1';
export const SETTINGS_SCHEMA_VERSION = 'shime-v2-settings-v1';
export const SETTINGS_UPDATED_EVENT = 'shime-v2-settings-updated';

export const FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY = 'new-cards-only';

const FSRS_DESIRED_RETENTION_MIN = 0.70;
const FSRS_DESIRED_RETENTION_MAX = 0.97;
const FSRS_DESIRED_RETENTION_DEFAULT = 0.90;

const FSRS_MAXIMUM_INTERVAL_MIN = 1;
const FSRS_MAXIMUM_INTERVAL_MAX = 36500;
const FSRS_MAXIMUM_INTERVAL_DEFAULT = 36500;

/**
 * The canonical default settings object.
 * Returned in memory when the storage key is absent or invalid.
 * Never written to localStorage by getSettings().
 */
export function getDefaultSettings() {
  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    updatedAt: '',
    fsrsExperimentalEnabled: false,
    fsrsActiveSchedulingEnabled: false,
    fsrsEnrollmentMode: FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY,
    fsrsEnabledAt: null,
    fsrsDesiredRetention: FSRS_DESIRED_RETENTION_DEFAULT,
    fsrsMaximumInterval: FSRS_MAXIMUM_INTERVAL_DEFAULT
  };
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

/**
 * Normalize and validate a raw settings object.
 * Always returns a safe, fully-populated settings object.
 * Never throws.
 */
export function normalizeSettings(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return getDefaultSettings();
  }

  const defaults = getDefaultSettings();

  const fsrsExperimentalEnabled =
    typeof raw.fsrsExperimentalEnabled === 'boolean'
      ? raw.fsrsExperimentalEnabled
      : defaults.fsrsExperimentalEnabled;

  // Internal-only: not user-visible. Both flags required for active FSRS scheduling (Phase 15B).
  const fsrsActiveSchedulingEnabled =
    typeof raw.fsrsActiveSchedulingEnabled === 'boolean'
      ? raw.fsrsActiveSchedulingEnabled
      : false;

  // fsrsEnrollmentMode is locked to 'new-cards-only' in Phase 14G.
  const fsrsEnrollmentMode = FSRS_ENROLLMENT_MODE_NEW_CARDS_ONLY;

  // fsrsEnabledAt: must be a non-empty string (ISO) or null.
  let fsrsEnabledAt = null;
  if (typeof raw.fsrsEnabledAt === 'string' && raw.fsrsEnabledAt.trim()) {
    const parsed = new Date(raw.fsrsEnabledAt.trim());
    if (!Number.isNaN(parsed.getTime())) {
      fsrsEnabledAt = raw.fsrsEnabledAt.trim();
    }
  }

  const fsrsDesiredRetention = clampNumber(
    raw.fsrsDesiredRetention,
    FSRS_DESIRED_RETENTION_MIN,
    FSRS_DESIRED_RETENTION_MAX,
    FSRS_DESIRED_RETENTION_DEFAULT
  );

  const fsrsMaximumInterval = clampNumber(
    raw.fsrsMaximumInterval,
    FSRS_MAXIMUM_INTERVAL_MIN,
    FSRS_MAXIMUM_INTERVAL_MAX,
    FSRS_MAXIMUM_INTERVAL_DEFAULT
  );

  let updatedAt = '';
  if (typeof raw.updatedAt === 'string' && raw.updatedAt.trim()) {
    const parsed = new Date(raw.updatedAt.trim());
    if (!Number.isNaN(parsed.getTime())) {
      updatedAt = raw.updatedAt.trim();
    }
  }

  return {
    schemaVersion: SETTINGS_SCHEMA_VERSION,
    updatedAt,
    fsrsExperimentalEnabled,
    fsrsActiveSchedulingEnabled,
    fsrsEnrollmentMode,
    fsrsEnabledAt,
    fsrsDesiredRetention,
    fsrsMaximumInterval
  };
}

function emitSettingsUpdated(detail = {}) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail }));
  publishLearningStorageChanged({
    key: SETTINGS_STORAGE_KEY,
    section: 'settings',
    reason: detail.reason || 'settings_changed'
  });
}

/**
 * Read the current settings from localStorage.
 *
 * LAZY READ: if the key is absent, returns default in memory without writing.
 * INVALID JSON: returns default in memory without writing or removing.
 * Never throws.
 */
export function getSettings() {
  const storage = getLocalStorage();
  if (!storage) {
    return getDefaultSettings();
  }

  let raw;
  try {
    const text = storage.getItem(SETTINGS_STORAGE_KEY);
    if (!text) {
      // Key absent → return default in memory. Do NOT write.
      return getDefaultSettings();
    }
    raw = JSON.parse(text);
  } catch {
    // Invalid JSON → return default in memory. Do NOT write or remove.
    return getDefaultSettings();
  }

  return normalizeSettings(raw);
}

/**
 * Persist a settings patch to localStorage.
 *
 * Merges the patch over the current stored settings (or defaults if key is absent).
 * Sets updatedAt to now.
 * If fsrsExperimentalEnabled transitions false→true and fsrsEnabledAt is null,
 * records fsrsEnabledAt as the current timestamp (write-once, never cleared on disable).
 *
 * Returns { ok: true, settings } on success.
 * Returns { ok: false, error, ... } on failure.
 * Never throws.
 */
export function updateSettings(patch) {
  if (!patch || typeof patch !== 'object' || Array.isArray(patch)) {
    return { ok: false, error: 'invalid_patch' };
  }

  const storage = getLocalStorage();
  if (!storage) {
    return { ok: false, error: 'storage_unavailable' };
  }

  const current = getSettings();
  const now = new Date().toISOString();

  const merged = { ...current, ...patch };

  // Enforce fsrsEnabledAt write-once: only set when transitioning false→true.
  if (
    merged.fsrsExperimentalEnabled === true &&
    current.fsrsExperimentalEnabled === false &&
    !merged.fsrsEnabledAt
  ) {
    merged.fsrsEnabledAt = now;
  }

  // Never clear fsrsEnabledAt through updateSettings (optimizer cutoff is permanent).
  if (current.fsrsEnabledAt && !merged.fsrsEnabledAt) {
    merged.fsrsEnabledAt = current.fsrsEnabledAt;
  }

  merged.updatedAt = now;

  const normalized = normalizeSettings(merged);

  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    emitSettingsUpdated({ reason: 'settings_saved' });
    return { ok: true, settings: normalized };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error };
  }
}

/**
 * Import settings from a backup payload.
 *
 * Used exclusively by the v2 backup restore path.
 * Normalizes the incoming settings before writing.
 * fsrsEnabledAt preservation: if existing storage has a value and backup lacks it,
 * keeps the existing value (write-once protection).
 *
 * Returns { ok: true, settings } on success.
 * Returns { ok: false, error, ... } on failure.
 * Never throws.
 */
export function importSettings(rawSettings) {
  if (!rawSettings || typeof rawSettings !== 'object') {
    return { ok: false, error: 'invalid_settings' };
  }

  const storage = getLocalStorage();
  if (!storage) {
    return { ok: false, error: 'storage_unavailable' };
  }

  const normalized = normalizeSettings(rawSettings);

  // Preserve existing fsrsEnabledAt if the incoming backup lacks it.
  const existing = getSettings();
  if (existing.fsrsEnabledAt && !normalized.fsrsEnabledAt) {
    normalized.fsrsEnabledAt = existing.fsrsEnabledAt;
  }

  normalized.updatedAt = new Date().toISOString();

  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
    emitSettingsUpdated({ reason: 'settings_imported' });
    return { ok: true, settings: normalized };
  } catch (error) {
    return { ok: false, error: 'storage_write_failed', storageError: error };
  }
}

/**
 * Clear the settings key from localStorage.
 *
 * Used only in tests and explicit user data-clear flows.
 * After clearing, getSettings() will return the default in memory.
 *
 * Returns { ok: true } on success.
 * Returns { ok: false, error } on failure.
 * Never throws.
 */
export function clearSettings() {
  const storage = getLocalStorage();
  if (!storage) return { ok: false, error: 'storage_unavailable' };

  try {
    storage.removeItem(SETTINGS_STORAGE_KEY);
    emitSettingsUpdated({ reason: 'settings_cleared' });
    return { ok: true };
  } catch (error) {
    return { ok: false, error: 'storage_remove_failed', storageError: error };
  }
}

// ── Phase 15E: Controlled Internal Activation Harness ─────────────────────────
//
// These helpers are for INTERNAL/TEST/DEV use only.
// They MUST NOT be called by production UI, public settings panels,
// import/restore/app-boot/session-start flows, or any user-facing feature.
// Normal users cannot reach these functions from any UI path.
// Both FSRS gates (fsrsExperimentalEnabled + fsrsActiveSchedulingEnabled)
// must be explicitly set true by the caller for active scheduling to run.
//
// setFsrsActiveSchedulingForInternalTest(enabled):
//   Explicitly sets fsrsActiveSchedulingEnabled via updateSettings().
//   Normalizes boolean: only strict true → true; all else → false.
//   Preserves all other settings fields. Returns updateSettings() result.
//
// enableFsrsActiveSchedulingForInternalTest():
//   Convenience: sets fsrsActiveSchedulingEnabled to true.
//
// disableFsrsActiveSchedulingForInternalTest():
//   Convenience: sets fsrsActiveSchedulingEnabled to false.

export function setFsrsActiveSchedulingForInternalTest(enabled) {
  return updateSettings({ fsrsActiveSchedulingEnabled: enabled === true });
}

export function enableFsrsActiveSchedulingForInternalTest() {
  return setFsrsActiveSchedulingForInternalTest(true);
}

export function disableFsrsActiveSchedulingForInternalTest() {
  return setFsrsActiveSchedulingForInternalTest(false);
}
