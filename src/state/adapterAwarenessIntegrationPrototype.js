/**
 * Phase 27E — Thin Read-Only Adapter-Awareness Integration Prototype
 *
 * PHASE27E_THIN_READ_ONLY_INTEGRATION_STATUS: IMPLEMENTED_TEST_ONLY_DEFAULT_OFF_READ_ONLY_PROTOTYPE
 * PHASE27E_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27E_INTEGRATION_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_PRODUCTION_INTEGRATION
 * PHASE27E_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM
 *
 * Thin read-only integration prototype. Test-only / default-off.
 * Not imported by production modules. Not imported by backup/export/restore, UI,
 * routes, settings, library, dashboard, or storage driver modules.
 *
 * Imports only from ./adapterAwarenessModel.js (Phase 27C pure-function model).
 * Does not import from production backup/export/restore modules.
 * Does not read environment variables, storage, learner content, files, or browser APIs.
 *
 * Enabled only with explicit options: { enabled: true, mode: 'test' } or
 * { enabled: true, mode: 'default-off' }. Everything else is disabled, including
 * missing options, enabled: false, production, live, staging, beta, and unknown modes.
 *
 * All functions are pure and deterministic. No side effects. No Date.now.
 * No localStorage, no IndexedDB, no fetch, no XMLHttpRequest, no sendBeacon.
 * No telemetry or analytics. No process.env reads. No import.meta.env reads.
 *
 * canClaimProductionSafety is always false in Phase 27E.
 * Evidence level: unit_static_only or generated_test_rehearsal_only.
 * This file does not prove production runtime adapter-aware backup/restore safety.
 *
 * Do not import this file from production backup/export/restore, UI, route,
 * settings, library, dashboard, or storage driver modules.
 */

import {
  normalizeAdapterAwarenessInput,
  deriveAdapterAwarenessState,
  createAdapterCompatibilityWarning,
  summarizeAdapterAwarenessForBackupHealth,
} from './adapterAwarenessModel.js';

/** State ID returned when integration is disabled. */
export const ADAPTER_INTEGRATION_DISABLED_STATE = 'adapter_integration_disabled';

// ── Internal helpers ──────────────────────────────────────────────────────────

function resolveOptions(options) {
  if (
    options !== null &&
    options !== undefined &&
    typeof options === 'object' &&
    !Array.isArray(options) &&
    options.enabled === true &&
    (options.mode === 'test' || options.mode === 'default-off')
  ) {
    return { integrationEnabled: true, integrationMode: options.mode };
  }
  return { integrationEnabled: false, integrationMode: 'disabled' };
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * normalizeAdapterAwarenessSignalInput
 *
 * Pure function. Accepts explicit generated/test input objects only.
 * Normalizes sourceAdapterId, targetAdapterId, exportAdapterId, restoreAdapterId,
 * adapterStatusUnavailable, generatedTestData, restoreRehearsalVerified.
 * Returns integrationEnabled and integrationMode derived from options.
 * Never mutates input or options. Trims strings. Normalizes empty strings to undefined.
 * Never reads storage, learner content, files, browser APIs, or platform state.
 * Never reads environment variables.
 *
 * @param {*} rawInput
 * @param {*} options
 * @returns {object}
 */
export function normalizeAdapterAwarenessSignalInput(rawInput, options) {
  const { integrationEnabled, integrationMode } = resolveOptions(options);
  const normalized = normalizeAdapterAwarenessInput(rawInput);
  return {
    ...normalized,
    integrationEnabled,
    integrationMode,
  };
}

/**
 * createAdapterAwarenessSignal
 *
 * Pure function. Returns a signal object with integration status.
 * Disabled path returns conservative defaults with adapter_integration_disabled state.
 * Enabled path delegates to Phase 27C model using normalized explicit input only.
 *
 * @param {*} rawInput
 * @param {*} options
 * @returns {{ integrationEnabled: boolean, integrationMode: string, stateId: string, severity: string, messageVi: string, claimBoundary: string, canClaimProductionSafety: false, evidenceLevel: string }}
 */
export function createAdapterAwarenessSignal(rawInput, options) {
  const { integrationEnabled, integrationMode } = resolveOptions(options);

  if (!integrationEnabled) {
    return {
      integrationEnabled: false,
      integrationMode: 'disabled',
      stateId: ADAPTER_INTEGRATION_DISABLED_STATE,
      severity: 'unavailable',
      messageVi:
        'Tích hợp nhận biết adapter chưa được kích hoạt. Đây là prototype thử nghiệm mặc định tắt. Không phải bằng chứng an toàn sản xuất.',
      claimBoundary:
        'UNIT_STATIC_EVIDENCE_ONLY_NO_BROWSER_OR_BACKUP_RESTORE_BEHAVIOR_CLAIM',
      canClaimProductionSafety: false,
      evidenceLevel: 'unit_static_only',
    };
  }

  const normalizedInput = normalizeAdapterAwarenessInput(rawInput);
  const warning = createAdapterCompatibilityWarning(normalizedInput);
  const summary = summarizeAdapterAwarenessForBackupHealth(normalizedInput);

  return {
    integrationEnabled: true,
    integrationMode,
    stateId: warning.stateId,
    severity: warning.severity,
    messageVi: warning.messageVi,
    claimBoundary: warning.claimBoundary,
    canClaimProductionSafety: false,
    evidenceLevel: summary.evidenceLevel,
  };
}

/**
 * deriveAdapterAwarenessFromSignals
 *
 * Pure function. Returns a state id string.
 * Returns adapter_integration_disabled when integration is not enabled.
 * Delegates to Phase 27C deriveAdapterAwarenessState when enabled.
 * Covers all Phase 27C state IDs plus adapter_integration_disabled:
 *   adapter_integration_disabled, adapter_status_unavailable,
 *   restore_rehearsal_verified_generated_data, missing_source_adapter,
 *   missing_target_adapter, different_adapter_context,
 *   same_adapter_context, unknown_adapter_state.
 *
 * @param {*} rawInput
 * @param {*} options
 * @returns {string}
 */
export function deriveAdapterAwarenessFromSignals(rawInput, options) {
  const { integrationEnabled } = resolveOptions(options);

  if (!integrationEnabled) {
    return ADAPTER_INTEGRATION_DISABLED_STATE;
  }

  return deriveAdapterAwarenessState(rawInput);
}

/**
 * summarizeAdapterAwarenessIntegration
 *
 * Pure function. Returns a summary object including integrationEnabled/integrationMode.
 * canClaimProductionSafety is always false.
 *
 * @param {*} rawInput
 * @param {*} options
 * @returns {{ stateId: string, severity: string, labelVi: string, detailVi: string, integrationEnabled: boolean, integrationMode: string, canClaimProductionSafety: false, evidenceLevel: string }}
 */
export function summarizeAdapterAwarenessIntegration(rawInput, options) {
  const { integrationEnabled, integrationMode } = resolveOptions(options);

  if (!integrationEnabled) {
    return {
      stateId: ADAPTER_INTEGRATION_DISABLED_STATE,
      severity: 'unavailable',
      labelVi: 'Tích hợp chưa kích hoạt',
      detailVi:
        'Tích hợp nhận biết adapter chưa được kích hoạt. Đây là prototype thử nghiệm mặc định tắt. Không phải bằng chứng an toàn sản xuất.',
      integrationEnabled: false,
      integrationMode: 'disabled',
      canClaimProductionSafety: false,
      evidenceLevel: 'unit_static_only',
    };
  }

  const normalizedInput = normalizeAdapterAwarenessInput(rawInput);
  const summary = summarizeAdapterAwarenessForBackupHealth(normalizedInput);

  return {
    stateId: summary.stateId,
    severity: summary.severity,
    labelVi: summary.labelVi,
    detailVi: summary.detailVi,
    integrationEnabled: true,
    integrationMode,
    canClaimProductionSafety: false,
    evidenceLevel: summary.evidenceLevel,
  };
}
