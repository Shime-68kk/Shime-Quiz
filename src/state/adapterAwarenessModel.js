/**
 * Phase 27C — Test-Only No-Write Adapter-Awareness Model
 *
 * PHASE27C_ADAPTER_AWARENESS_MODEL_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_MODEL
 * PHASE27C_ADAPTER_AWARENESS_MODEL_SCOPE: PURE_FUNCTIONS_NO_PRODUCTION_IMPORTS_NO_BACKUP_RESTORE_WRITES
 * PHASE27C_ADAPTER_AWARENESS_MODEL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_INTEGRATION
 * PHASE27C_ADAPTER_AWARENESS_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM
 *
 * Pure functions only. No side effects. No storage reads or writes.
 * No localStorage, no IndexedDB, no fetch, no XMLHttpRequest, no sendBeacon.
 * No telemetry or analytics. No Date.now. No browser APIs.
 * No backup/export/restore module imports.
 * No production integration. Not imported by production modules.
 * Generated/test data only boundary: all inputs must be generated or test data.
 * canClaimProductionSafety is always false in Phase 27C.
 *
 * Do not import this file from production backup/export/restore, UI, route,
 * settings, library, dashboard, or storage driver modules.
 *
 * Evidence level: unit_static_only or generated_test_rehearsal_only.
 * This file does not prove production runtime adapter-aware backup/restore safety.
 */

/**
 * Required state IDs for deriveAdapterAwarenessState.
 * Conservative priority (check in this order — highest priority first):
 *   adapter_status_unavailable
 *   restore_rehearsal_verified_generated_data
 *   missing_source_adapter
 *   missing_target_adapter
 *   different_adapter_context
 *   same_adapter_context
 *   unknown_adapter_state
 */
export const ADAPTER_AWARENESS_STATE = {
  ADAPTER_STATUS_UNAVAILABLE: 'adapter_status_unavailable',
  RESTORE_REHEARSAL_VERIFIED_GENERATED_DATA: 'restore_rehearsal_verified_generated_data',
  MISSING_SOURCE_ADAPTER: 'missing_source_adapter',
  MISSING_TARGET_ADAPTER: 'missing_target_adapter',
  DIFFERENT_ADAPTER_CONTEXT: 'different_adapter_context',
  SAME_ADAPTER_CONTEXT: 'same_adapter_context',
  UNKNOWN_ADAPTER_STATE: 'unknown_adapter_state',
};

/**
 * Allowed severity levels for createAdapterCompatibilityWarning.
 */
export const ADAPTER_COMPATIBILITY_SEVERITY = {
  INFO: 'info',
  CAUTION: 'caution',
  UNAVAILABLE: 'unavailable',
};

/**
 * Allowed evidence levels for summarizeAdapterAwarenessForBackupHealth.
 */
export const ADAPTER_AWARENESS_EVIDENCE_LEVEL = {
  UNIT_STATIC_ONLY: 'unit_static_only',
  GENERATED_TEST_REHEARSAL_ONLY: 'generated_test_rehearsal_only',
  UNKNOWN: 'unknown',
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function normalizeStringField(val) {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * normalizeAdapterAwarenessInput
 *
 * Pure function. Accepts generated/test data input only.
 * Normalizes a small object with optional fields.
 * Never mutates input. Tolerates null/undefined/non-object.
 * Trims string fields. Normalizes empty strings to undefined.
 * Preserves unknown adapter state as unknown/unavailable, not as safe/compatible.
 * Does not read files, storage, learner content, browser APIs, or platform state.
 *
 * Recognized input fields:
 *   sourceAdapterId      — canonical source adapter ID
 *   targetAdapterId      — canonical target adapter ID
 *   exportAdapterId      — alias for sourceAdapterId
 *   restoreAdapterId     — alias for targetAdapterId
 *   adapterId            — general adapter ID (fallback for both source and target)
 *   adapterKind          — string describing adapter kind
 *   backupFormatVersion  — string or number
 *   generatedTestData    — boolean, true if input is generated/test data only
 *   restoreRehearsalVerified — boolean, true if restore rehearsal was verified
 *   adapterStatusUnavailable — boolean, true if adapter status is explicitly unavailable
 *
 * @param {*} rawInput
 * @returns {object} normalized input (never null)
 */
export function normalizeAdapterAwarenessInput(rawInput) {
  if (rawInput === null || rawInput === undefined || typeof rawInput !== 'object' || Array.isArray(rawInput)) {
    return {};
  }

  const normalized = {};

  // sourceAdapterId: canonical field, then exportAdapterId alias, then adapterId fallback
  const sourceAdapterId =
    normalizeStringField(rawInput.sourceAdapterId) ??
    normalizeStringField(rawInput.exportAdapterId) ??
    normalizeStringField(rawInput.adapterId);
  if (sourceAdapterId !== undefined) {
    normalized.sourceAdapterId = sourceAdapterId;
  }

  // targetAdapterId: canonical field, then restoreAdapterId alias, then adapterId fallback
  const targetAdapterId =
    normalizeStringField(rawInput.targetAdapterId) ??
    normalizeStringField(rawInput.restoreAdapterId) ??
    normalizeStringField(rawInput.adapterId);
  if (targetAdapterId !== undefined) {
    normalized.targetAdapterId = targetAdapterId;
  }

  const adapterKind = normalizeStringField(rawInput.adapterKind);
  if (adapterKind !== undefined) {
    normalized.adapterKind = adapterKind;
  }

  if (rawInput.backupFormatVersion !== undefined && rawInput.backupFormatVersion !== null) {
    normalized.backupFormatVersion = rawInput.backupFormatVersion;
  }

  if (rawInput.generatedTestData === true) {
    normalized.generatedTestData = true;
  }

  if (rawInput.restoreRehearsalVerified === true) {
    normalized.restoreRehearsalVerified = true;
  }

  if (rawInput.adapterStatusUnavailable === true) {
    normalized.adapterStatusUnavailable = true;
  }

  return normalized;
}

/**
 * deriveAdapterAwarenessState
 *
 * Pure function. Accepts generated/test data input only.
 * Returns one of the ADAPTER_AWARENESS_STATE state IDs.
 * Conservative priority: more restrictive states take precedence.
 *
 * Priority order (highest first):
 *   adapter_status_unavailable
 *   restore_rehearsal_verified_generated_data
 *   missing_source_adapter
 *   missing_target_adapter
 *   different_adapter_context
 *   same_adapter_context
 *   unknown_adapter_state
 *
 * Generated/test restore rehearsal evidence may produce
 * restore_rehearsal_verified_generated_data but must not imply production
 * restore safety.
 *
 * @param {*} input
 * @returns {string} state ID
 */
export function deriveAdapterAwarenessState(input) {
  const normalized = normalizeAdapterAwarenessInput(input);

  if (normalized.adapterStatusUnavailable === true) {
    return ADAPTER_AWARENESS_STATE.ADAPTER_STATUS_UNAVAILABLE;
  }

  if (normalized.restoreRehearsalVerified === true && normalized.generatedTestData === true) {
    return ADAPTER_AWARENESS_STATE.RESTORE_REHEARSAL_VERIFIED_GENERATED_DATA;
  }

  if (normalized.sourceAdapterId === undefined) {
    return ADAPTER_AWARENESS_STATE.MISSING_SOURCE_ADAPTER;
  }

  if (normalized.targetAdapterId === undefined) {
    return ADAPTER_AWARENESS_STATE.MISSING_TARGET_ADAPTER;
  }

  if (normalized.sourceAdapterId !== normalized.targetAdapterId) {
    return ADAPTER_AWARENESS_STATE.DIFFERENT_ADAPTER_CONTEXT;
  }

  return ADAPTER_AWARENESS_STATE.SAME_ADAPTER_CONTEXT;
}

/**
 * createAdapterCompatibilityWarning
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a warning object: { stateId, severity, messageVi, claimBoundary }.
 *
 * Message is Vietnamese-first and conservative.
 * Does not claim guaranteed compatibility, guaranteed data-loss prevention,
 * automatic backup, platform backup preservation, cloud/account recovery,
 * production adapter-aware backup/export/restore, or BETA_READY.
 *
 * @param {*} input
 * @returns {{ stateId: string, severity: string, messageVi: string, claimBoundary: string }}
 */
export function createAdapterCompatibilityWarning(input) {
  const stateId = deriveAdapterAwarenessState(input);

  switch (stateId) {
    case ADAPTER_AWARENESS_STATE.ADAPTER_STATUS_UNAVAILABLE:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.UNAVAILABLE,
        messageVi:
          'Không thể xác định trạng thái adapter. Thông tin adapter hiện không có sẵn. Đây là dữ liệu thử nghiệm tổng hợp.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };

    case ADAPTER_AWARENESS_STATE.RESTORE_REHEARSAL_VERIFIED_GENERATED_DATA:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.INFO,
        messageVi:
          'Kiểm tra thử nghiệm khôi phục với dữ liệu tổng hợp đã hoàn thành. Đây chỉ là bằng chứng đơn vị/tổng hợp, không phải bằng chứng sản xuất.',
        claimBoundary:
          'GENERATED_TEST_REHEARSAL_ONLY_NO_PRODUCTION_RESTORE_SAFETY_CLAIM',
      };

    case ADAPTER_AWARENESS_STATE.MISSING_SOURCE_ADAPTER:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        messageVi:
          'Không tìm thấy thông tin adapter nguồn. Không thể xác minh tính tương thích adapter.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };

    case ADAPTER_AWARENESS_STATE.MISSING_TARGET_ADAPTER:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        messageVi:
          'Không tìm thấy thông tin adapter đích. Không thể xác minh tính tương thích adapter.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };

    case ADAPTER_AWARENESS_STATE.DIFFERENT_ADAPTER_CONTEXT:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        messageVi:
          'Adapter nguồn và đích khác nhau. Cần xem xét kỹ trước khi tiến hành bất kỳ thao tác khôi phục nào.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };

    case ADAPTER_AWARENESS_STATE.SAME_ADAPTER_CONTEXT:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.INFO,
        messageVi:
          'Adapter nguồn và đích giống nhau. Đây là dữ liệu thử nghiệm tổng hợp, không phải bằng chứng an toàn sản xuất.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };

    default:
      return {
        stateId: ADAPTER_AWARENESS_STATE.UNKNOWN_ADAPTER_STATE,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        messageVi:
          'Không xác định được trạng thái adapter. Không có đủ thông tin để đánh giá tính tương thích.',
        claimBoundary:
          'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_BEHAVIOR_CLAIM',
      };
  }
}

/**
 * summarizeAdapterAwarenessForBackupHealth
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a summary object:
 *   { stateId, severity, labelVi, detailVi, canClaimProductionSafety, evidenceLevel }
 *
 * canClaimProductionSafety is always false in Phase 27C.
 * evidenceLevel is one of: unit_static_only, generated_test_rehearsal_only, unknown.
 *
 * Does not include UI routing, href, navigation, telemetry, storage,
 * backup/export/restore calls, browser APIs, or Date.now.
 *
 * @param {*} input
 * @returns {{ stateId: string, severity: string, labelVi: string, detailVi: string, canClaimProductionSafety: false, evidenceLevel: string }}
 */
export function summarizeAdapterAwarenessForBackupHealth(input) {
  const stateId = deriveAdapterAwarenessState(input);
  const normalized = normalizeAdapterAwarenessInput(input);

  const evidenceLevel =
    normalized.restoreRehearsalVerified === true && normalized.generatedTestData === true
      ? ADAPTER_AWARENESS_EVIDENCE_LEVEL.GENERATED_TEST_REHEARSAL_ONLY
      : stateId === ADAPTER_AWARENESS_STATE.UNKNOWN_ADAPTER_STATE ||
        stateId === ADAPTER_AWARENESS_STATE.ADAPTER_STATUS_UNAVAILABLE
      ? ADAPTER_AWARENESS_EVIDENCE_LEVEL.UNKNOWN
      : ADAPTER_AWARENESS_EVIDENCE_LEVEL.UNIT_STATIC_ONLY;

  switch (stateId) {
    case ADAPTER_AWARENESS_STATE.ADAPTER_STATUS_UNAVAILABLE:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.UNAVAILABLE,
        labelVi: 'Adapter không xác định',
        detailVi:
          'Thông tin adapter không có sẵn. Không thể đánh giá tính tương thích. Dữ liệu thử nghiệm tổng hợp.',
        canClaimProductionSafety: false,
        evidenceLevel: ADAPTER_AWARENESS_EVIDENCE_LEVEL.UNKNOWN,
      };

    case ADAPTER_AWARENESS_STATE.RESTORE_REHEARSAL_VERIFIED_GENERATED_DATA:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.INFO,
        labelVi: 'Kiểm tra thử nghiệm đã hoàn thành',
        detailVi:
          'Kiểm tra thử nghiệm khôi phục với dữ liệu tổng hợp đã hoàn thành. Chỉ là bằng chứng đơn vị/tổng hợp.',
        canClaimProductionSafety: false,
        evidenceLevel: ADAPTER_AWARENESS_EVIDENCE_LEVEL.GENERATED_TEST_REHEARSAL_ONLY,
      };

    case ADAPTER_AWARENESS_STATE.MISSING_SOURCE_ADAPTER:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        labelVi: 'Thiếu thông tin adapter nguồn',
        detailVi:
          'Không tìm thấy thông tin adapter nguồn. Không thể xác minh tính tương thích.',
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case ADAPTER_AWARENESS_STATE.MISSING_TARGET_ADAPTER:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        labelVi: 'Thiếu thông tin adapter đích',
        detailVi:
          'Không tìm thấy thông tin adapter đích. Không thể xác minh tính tương thích.',
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case ADAPTER_AWARENESS_STATE.DIFFERENT_ADAPTER_CONTEXT:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        labelVi: 'Adapter khác nhau',
        detailVi:
          'Adapter nguồn và đích khác nhau. Cần xem xét kỹ trước khi tiến hành khôi phục.',
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case ADAPTER_AWARENESS_STATE.SAME_ADAPTER_CONTEXT:
      return {
        stateId,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.INFO,
        labelVi: 'Adapter giống nhau',
        detailVi:
          'Adapter nguồn và đích giống nhau. Dữ liệu thử nghiệm tổng hợp, không phải bằng chứng an toàn sản xuất.',
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    default:
      return {
        stateId: ADAPTER_AWARENESS_STATE.UNKNOWN_ADAPTER_STATE,
        severity: ADAPTER_COMPATIBILITY_SEVERITY.CAUTION,
        labelVi: 'Không xác định',
        detailVi:
          'Không xác định được trạng thái adapter. Không có đủ thông tin để đánh giá.',
        canClaimProductionSafety: false,
        evidenceLevel: ADAPTER_AWARENESS_EVIDENCE_LEVEL.UNKNOWN,
      };
  }
}
