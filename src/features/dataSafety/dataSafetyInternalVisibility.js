/**
 * Phase 31G — Data Safety UX Internal Visibility Helper
 *
 * PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_STATUS: COMPLETED_DEFAULT_OFF_INTERNAL_VISIBILITY_IMPLEMENTATION
 * PHASE31G_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31G_DATA_SAFETY_UX_INTERNAL_VISIBILITY_IMPLEMENTATION_DECISION: PASS_TO_PHASE31H_INTERNAL_VISIBILITY_EVIDENCE_REVIEW
 * PHASE31G_IMPLEMENTATION_SCOPE: DEFAULT_OFF_INTERNAL_VISIBILITY_ONLY_NO_USER_VISIBLE_TOGGLE_NO_STORAGE_WRITES
 *
 * Pure functions only. No browser storage APIs. No network or telemetry APIs.
 * No backup/export/restore behavior changes. No storage writes.
 * No sync/cloud/backend/account/auth. No BYOC/WebDAV/P2P/device-transfer.
 *
 * Default is OFF. The Data Safety UX prototype must not be visible in production.
 * Internal/dev/test opt-in only via VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY env flag.
 * No user-visible toggle. No persisted state. No backend/config fetch.
 */

/**
 * Default-off flag. Must remain false unless explicitly activated in test/dev.
 * Never set this to true in production entry points.
 */
export const DATA_SAFETY_INTERNAL_VISIBILITY_DEFAULT_ENABLED = false;

/**
 * The environment variable name used for internal/dev/test opt-in only.
 * Accepted true values: '1', 'true', 'enabled'.
 */
export const DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG =
  'VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY';

const ACCEPTED_TRUE_VALUES = new Set(['1', 'true', 'enabled']);

// Maps Vite MODE values to the Phase 31C shouldShowDataSafetyCenterPrototype ALLOWED_MODES ('dev', 'test').
const MODE_MAP = { development: 'dev', test: 'test' };

/**
 * Normalize the raw env flag value to a safe lowercase string.
 * Returns empty string for missing/null/undefined/non-string input.
 */
export function normalizeDataSafetyInternalVisibilityEnv(env) {
  if (env === null || env === undefined) {
    return '';
  }
  return String(env).trim().toLowerCase();
}

/**
 * Returns true only when the env flag matches an accepted true value.
 * Accepted values: '1', 'true', 'enabled'. All other values return false.
 * Invalid, missing, or empty values always return false.
 */
export function shouldEnableDataSafetyInternalVisibility(env) {
  const normalized = normalizeDataSafetyInternalVisibilityEnv(env);
  return ACCEPTED_TRUE_VALUES.has(normalized);
}

/**
 * Build a Data Safety Center Prototype config from the environment.
 * Returns a config object compatible with shouldShowDataSafetyCenterPrototype.
 *
 * Default (no env flag): { enabled: false, mode: 'default' } — prototype hidden.
 * Explicit internal flag + dev/test MODE: { enabled: true, mode: 'dev'|'test' }.
 *
 * No browser storage APIs. No network APIs. No cookies.
 * No user-visible toggle. No backend/config fetch.
 *
 * @param {object} env - environment object (e.g., import.meta.env in production,
 *   or a plain object in tests). Must not be null/undefined to enable.
 * @returns {{ enabled: boolean, mode: string }}
 */
export function createDataSafetyInternalVisibilityConfig(env) {
  if (!env || typeof env !== 'object') {
    return { enabled: false, mode: 'default' };
  }
  const rawFlag = env[DATA_SAFETY_INTERNAL_VISIBILITY_ENV_FLAG];
  if (!shouldEnableDataSafetyInternalVisibility(rawFlag)) {
    return { enabled: false, mode: 'default' };
  }
  const rawMode = env.MODE;
  const mode =
    typeof rawMode === 'string' && Object.prototype.hasOwnProperty.call(MODE_MAP, rawMode)
      ? MODE_MAP[rawMode]
      : 'dev';
  return { enabled: true, mode };
}
