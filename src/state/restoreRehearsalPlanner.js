/**
 * Phase 28B — Test-Only No-Write Restore Rehearsal Planner
 *
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_PURE_PLANNER
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_WRITES
 * PHASE28B_RESTORE_REHEARSAL_PLANNER_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_REHEARSAL_EXECUTION
 * PHASE28B_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM
 *
 * Pure functions only. No side effects. No storage reads or writes.
 * No localStorage, no IndexedDB, no fetch, no XMLHttpRequest, no sendBeacon.
 * No telemetry or analytics. No Date.now. No browser APIs. No process.env. No import.meta.env.
 * No backup/export/restore module imports. No storage driver imports.
 * No production integration. Not imported by production modules.
 * Generated/test data only boundary: all inputs must be generated or test data.
 * canExecuteRestore is always false in Phase 28B.
 * canWriteProductionState is always false in Phase 28B.
 * canUseRealLearnerData is always false in Phase 28B.
 * canChangeBackupFormat is always false in Phase 28B.
 * canOverwriteRestoreTarget is always false in Phase 28B.
 * canClaimDataLossPrevention is always false in Phase 28B.
 * canClaimProductionSafety is always false in Phase 28B.
 *
 * Do not import this file from production backup/export/restore, UI, route,
 * settings, library, dashboard, or storage driver modules.
 *
 * Evidence level: unit_static_only or generated_test_plan_only.
 * This file does not prove production runtime restore safety.
 * No sync/cloud/account/auth/backend.
 */

/**
 * Required state IDs for deriveRestoreRehearsalSafetyState.
 * Conservative priority (check in this order — highest priority first):
 *   telemetry_or_sync_blocked
 *   storage_migration_blocked
 *   backup_format_change_blocked
 *   external_backup_file_blocked
 *   restore_overwrite_blocked
 *   production_state_write_blocked
 *   real_learner_data_blocked
 *   missing_generated_test_data
 *   generated_test_rehearsal_plan_ready
 *   restore_rehearsal_planner_unavailable
 */
export const RESTORE_REHEARSAL_SAFETY_STATE = {
  TELEMETRY_OR_SYNC_BLOCKED: 'telemetry_or_sync_blocked',
  STORAGE_MIGRATION_BLOCKED: 'storage_migration_blocked',
  BACKUP_FORMAT_CHANGE_BLOCKED: 'backup_format_change_blocked',
  EXTERNAL_BACKUP_FILE_BLOCKED: 'external_backup_file_blocked',
  RESTORE_OVERWRITE_BLOCKED: 'restore_overwrite_blocked',
  PRODUCTION_STATE_WRITE_BLOCKED: 'production_state_write_blocked',
  REAL_LEARNER_DATA_BLOCKED: 'real_learner_data_blocked',
  MISSING_GENERATED_TEST_DATA: 'missing_generated_test_data',
  GENERATED_TEST_REHEARSAL_PLAN_READY: 'generated_test_rehearsal_plan_ready',
  RESTORE_REHEARSAL_PLANNER_UNAVAILABLE: 'restore_rehearsal_planner_unavailable',
};

/**
 * Allowed severity levels.
 */
export const RESTORE_REHEARSAL_SEVERITY = {
  INFO: 'info',
  CAUTION: 'caution',
  BLOCKED: 'blocked',
  UNAVAILABLE: 'unavailable',
};

/**
 * Allowed evidence levels for summarizeRestoreRehearsalPlan.
 */
export const RESTORE_REHEARSAL_EVIDENCE_LEVEL = {
  UNIT_STATIC_ONLY: 'unit_static_only',
  GENERATED_TEST_PLAN_ONLY: 'generated_test_plan_only',
  UNKNOWN: 'unknown',
};

// ── Internal helpers ──────────────────────────────────────────────────────────

function normalizeStringField(val) {
  if (typeof val !== 'string') return undefined;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function normalizeBooleanField(val) {
  return val === true;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * normalizeRestoreRehearsalPlanInput
 *
 * Pure function. Accepts generated/test data input only.
 * Normalizes input object. Never mutates input.
 * Tolerates null/undefined/non-object input.
 * Trims string fields. Normalizes empty strings to undefined.
 * Normalizes booleans conservatively (only true if === true).
 * Does not read storage, files, browser APIs, platform state,
 * environment variables, Date.now, or learner content.
 *
 * Recognized input fields:
 *   generatedTestData               — boolean
 *   fixtureId                       — string
 *   sourceAdapterId                 — string
 *   targetAdapterId                 — string
 *   adapterStateId                  — string
 *   backupFormatVersion             — string or number
 *   backupFormatChangeRequested     — boolean
 *   restoreOverwriteRequested       — boolean
 *   productionStateTargeted         — boolean
 *   realLearnerDataPresent          — boolean
 *   externalBackupFileProvided      — boolean
 *   storageMigrationRequested       — boolean
 *   telemetryRequested              — boolean
 *   syncCloudAccountBackendRequested — boolean
 *   expectedItemCount               — number
 *
 * @param {*} rawInput
 * @returns {object} normalized input (never null)
 */
export function normalizeRestoreRehearsalPlanInput(rawInput) {
  if (
    rawInput === null ||
    rawInput === undefined ||
    typeof rawInput !== 'object' ||
    Array.isArray(rawInput)
  ) {
    return {};
  }

  const normalized = {};

  const fixtureId = normalizeStringField(rawInput.fixtureId);
  if (fixtureId !== undefined) normalized.fixtureId = fixtureId;

  const sourceAdapterId = normalizeStringField(rawInput.sourceAdapterId);
  if (sourceAdapterId !== undefined) normalized.sourceAdapterId = sourceAdapterId;

  const targetAdapterId = normalizeStringField(rawInput.targetAdapterId);
  if (targetAdapterId !== undefined) normalized.targetAdapterId = targetAdapterId;

  const adapterStateId = normalizeStringField(rawInput.adapterStateId);
  if (adapterStateId !== undefined) normalized.adapterStateId = adapterStateId;

  if (rawInput.backupFormatVersion !== undefined && rawInput.backupFormatVersion !== null) {
    normalized.backupFormatVersion = rawInput.backupFormatVersion;
  }

  if (rawInput.expectedItemCount !== undefined && typeof rawInput.expectedItemCount === 'number') {
    normalized.expectedItemCount = rawInput.expectedItemCount;
  }

  if (normalizeBooleanField(rawInput.generatedTestData)) normalized.generatedTestData = true;
  if (normalizeBooleanField(rawInput.backupFormatChangeRequested)) normalized.backupFormatChangeRequested = true;
  if (normalizeBooleanField(rawInput.restoreOverwriteRequested)) normalized.restoreOverwriteRequested = true;
  if (normalizeBooleanField(rawInput.productionStateTargeted)) normalized.productionStateTargeted = true;
  if (normalizeBooleanField(rawInput.realLearnerDataPresent)) normalized.realLearnerDataPresent = true;
  if (normalizeBooleanField(rawInput.externalBackupFileProvided)) normalized.externalBackupFileProvided = true;
  if (normalizeBooleanField(rawInput.storageMigrationRequested)) normalized.storageMigrationRequested = true;
  if (normalizeBooleanField(rawInput.telemetryRequested)) normalized.telemetryRequested = true;
  if (normalizeBooleanField(rawInput.syncCloudAccountBackendRequested)) normalized.syncCloudAccountBackendRequested = true;

  return normalized;
}

/**
 * deriveRestoreRehearsalSafetyState
 *
 * Pure function. Accepts generated/test data input only.
 * Returns one of the RESTORE_REHEARSAL_SAFETY_STATE state IDs.
 * Conservative priority: most restrictive states take precedence.
 *
 * Priority order (highest first):
 *   telemetry_or_sync_blocked
 *   storage_migration_blocked
 *   backup_format_change_blocked
 *   external_backup_file_blocked
 *   restore_overwrite_blocked
 *   production_state_write_blocked
 *   real_learner_data_blocked
 *   missing_generated_test_data
 *   generated_test_rehearsal_plan_ready
 *   restore_rehearsal_planner_unavailable
 *
 * @param {*} input
 * @returns {string} state ID
 */
export function deriveRestoreRehearsalSafetyState(input) {
  const n = normalizeRestoreRehearsalPlanInput(input);

  if (n.telemetryRequested === true || n.syncCloudAccountBackendRequested === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED;
  }

  if (n.storageMigrationRequested === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED;
  }

  if (n.backupFormatChangeRequested === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED;
  }

  if (n.externalBackupFileProvided === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED;
  }

  if (n.restoreOverwriteRequested === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED;
  }

  if (n.productionStateTargeted === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED;
  }

  if (n.realLearnerDataPresent === true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED;
  }

  if (n.generatedTestData !== true) {
    return RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA;
  }

  return RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY;
}

/**
 * createGeneratedTestRestoreRehearsalPlan
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a plan object describing what a restore rehearsal would entail.
 * Does not execute restore. Does not write storage. Does not import
 * backup/export/restore modules. Steps are descriptive only, not executable.
 *
 * All safety capability fields are hardcoded to false in Phase 28B:
 *   canExecuteRestore        — always false
 *   canWriteProductionState  — always false
 *   canUseRealLearnerData    — always false
 *   canChangeBackupFormat    — always false
 *   canOverwriteRestoreTarget — always false
 *   canClaimDataLossPrevention — always false
 *
 * @param {*} input
 * @returns {object} plan object
 */
export function createGeneratedTestRestoreRehearsalPlan(input) {
  const stateId = deriveRestoreRehearsalSafetyState(input);
  const n = normalizeRestoreRehearsalPlanInput(input);

  const planId = `plan_${n.fixtureId || 'generated_test'}`;

  let severity;
  let steps;

  switch (stateId) {
    case RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY:
      severity = RESTORE_REHEARSAL_SEVERITY.INFO;
      steps = [
        'Xác minh đầu vào là dữ liệu thử nghiệm tổng hợp. (Verify input is generated/test data.)',
        'Xác minh không có dữ liệu người học thực tế. (Confirm no real learner data present.)',
        'Mô phỏng cấu trúc kế hoạch khôi phục từ fixture thử nghiệm. (Simulate restore plan structure from test fixture.)',
        'Kiểm tra các trường bắt buộc của kế hoạch. (Check required plan fields.)',
        'Trả về bản tóm tắt kế hoạch. Không thực thi khôi phục. (Return plan summary. Do not execute restore.)',
        'Giữ lại để xem xét trước khi thực thi bất kỳ thao tác khôi phục nào. (Hold for review before any restore execution.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: yêu cầu telemetry hoặc sync/cloud/backend không được phép trong Phase 28B. (Blocked: telemetry or sync/cloud/backend request not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: yêu cầu migration lưu trữ không được phép trong Phase 28B. (Blocked: storage migration request not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: yêu cầu thay đổi định dạng backup không được phép trong Phase 28B. (Blocked: backup format change request not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: file backup bên ngoài không được phép trong Phase 28B. (Blocked: external backup file not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: yêu cầu ghi đè khôi phục không được phép trong Phase 28B. (Blocked: restore overwrite request not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: ghi trạng thái sản xuất không được phép trong Phase 28B. (Blocked: production state write not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED:
      severity = RESTORE_REHEARSAL_SEVERITY.BLOCKED;
      steps = [
        'Bị chặn: dữ liệu người học thực tế không được phép trong Phase 28B. (Blocked: real learner data not allowed in Phase 28B.)',
      ];
      break;

    case RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA:
      severity = RESTORE_REHEARSAL_SEVERITY.CAUTION;
      steps = [
        'Thiếu dữ liệu thử nghiệm tổng hợp. Đặt generatedTestData: true để bật kế hoạch rehearsal. (Missing generated test data. Set generatedTestData: true to enable rehearsal planning.)',
      ];
      break;

    default:
      severity = RESTORE_REHEARSAL_SEVERITY.UNAVAILABLE;
      steps = [
        'Không thể tạo kế hoạch rehearsal khôi phục. Trạng thái planner không xác định. (Cannot create restore rehearsal plan. Planner state unavailable.)',
      ];
      break;
  }

  return {
    stateId,
    severity,
    planId,
    fixtureId: n.fixtureId,
    usesGeneratedTestData: n.generatedTestData === true,
    canExecuteRestore: false,
    canWriteProductionState: false,
    canUseRealLearnerData: false,
    canChangeBackupFormat: false,
    canOverwriteRestoreTarget: false,
    canClaimDataLossPrevention: false,
    steps,
    claimBoundary:
      'UNIT_STATIC_EVIDENCE_ONLY_NO_RESTORE_EXECUTION_CLAIM',
  };
}

/**
 * summarizeRestoreRehearsalPlan
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a summary object with Vietnamese-first copy.
 * canClaimProductionSafety is always false in Phase 28B.
 * evidenceLevel is one of: unit_static_only, generated_test_plan_only, unknown.
 *
 * Does not include UI routing, href, navigation, telemetry, storage,
 * backup/export/restore calls, browser APIs, or Date.now.
 *
 * @param {*} input
 * @returns {{ stateId, severity, labelVi, detailVi, canExecuteRestore, canUseRealLearnerData, canWriteProductionState, canClaimProductionSafety, evidenceLevel }}
 */
export function summarizeRestoreRehearsalPlan(input) {
  const stateId = deriveRestoreRehearsalSafetyState(input);
  const n = normalizeRestoreRehearsalPlanInput(input);

  const evidenceLevel =
    stateId === RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY
      ? RESTORE_REHEARSAL_EVIDENCE_LEVEL.GENERATED_TEST_PLAN_ONLY
      : stateId === RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_REHEARSAL_PLANNER_UNAVAILABLE
      ? RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNKNOWN
      : RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY;

  switch (stateId) {
    case RESTORE_REHEARSAL_SAFETY_STATE.GENERATED_TEST_REHEARSAL_PLAN_READY:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.INFO,
        labelVi: 'Kế hoạch rehearsal thử nghiệm sẵn sàng',
        detailVi:
          'Kế hoạch rehearsal khôi phục từ dữ liệu thử nghiệm tổng hợp đã sẵn sàng. Chỉ là bằng chứng đơn vị/tổng hợp, không phải bằng chứng an toàn sản xuất. Giữ lại để xem xét trước khi thực thi.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.GENERATED_TEST_PLAN_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.TELEMETRY_OR_SYNC_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: telemetry hoặc sync',
        detailVi:
          'Yêu cầu telemetry hoặc sync/cloud/backend không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.STORAGE_MIGRATION_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: migration lưu trữ',
        detailVi:
          'Yêu cầu migration lưu trữ không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.BACKUP_FORMAT_CHANGE_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: thay đổi định dạng backup',
        detailVi:
          'Yêu cầu thay đổi định dạng backup không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.EXTERNAL_BACKUP_FILE_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: file backup bên ngoài',
        detailVi:
          'File backup bên ngoài không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_OVERWRITE_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: ghi đè khôi phục',
        detailVi:
          'Yêu cầu ghi đè khôi phục không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.PRODUCTION_STATE_WRITE_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: ghi trạng thái sản xuất',
        detailVi:
          'Ghi trạng thái sản xuất không được phép trong Phase 28B. Không thể tạo kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.REAL_LEARNER_DATA_BLOCKED:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.BLOCKED,
        labelVi: 'Bị chặn: dữ liệu người học thực tế',
        detailVi:
          'Dữ liệu người học thực tế không được phép trong Phase 28B. Chỉ sử dụng dữ liệu thử nghiệm tổng hợp.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    case RESTORE_REHEARSAL_SAFETY_STATE.MISSING_GENERATED_TEST_DATA:
      return {
        stateId,
        severity: RESTORE_REHEARSAL_SEVERITY.CAUTION,
        labelVi: 'Thiếu dữ liệu thử nghiệm tổng hợp',
        detailVi:
          'Chưa cung cấp dữ liệu thử nghiệm tổng hợp. Đặt generatedTestData: true để bật kế hoạch rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNIT_STATIC_ONLY,
      };

    default:
      return {
        stateId: RESTORE_REHEARSAL_SAFETY_STATE.RESTORE_REHEARSAL_PLANNER_UNAVAILABLE,
        severity: RESTORE_REHEARSAL_SEVERITY.UNAVAILABLE,
        labelVi: 'Planner không xác định',
        detailVi:
          'Không thể xác định trạng thái planner. Thông tin đầu vào không hợp lệ hoặc không có sẵn.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: RESTORE_REHEARSAL_EVIDENCE_LEVEL.UNKNOWN,
      };
  }
}
