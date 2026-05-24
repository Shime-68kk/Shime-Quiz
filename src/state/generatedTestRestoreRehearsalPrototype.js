/**
 * Phase 28D — Test-Only No-Write Generated/Test Restore Rehearsal Prototype
 *
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_PROTOTYPE_STATUS: IMPLEMENTED_TEST_ONLY_NO_WRITE_GENERATED_TEST_PROTOTYPE
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_SCOPE: GENERATED_TEST_DATA_ONLY_NO_REAL_LEARNER_DATA_NO_RESTORE_EXECUTION_NO_WRITES
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_DECISION: HOLD_FOR_REVIEW_BEFORE_ANY_RESTORE_REHEARSAL_EXECUTION
 * PHASE28D_GENERATED_TEST_RESTORE_REHEARSAL_EVIDENCE_INTERPRETATION: UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM
 *
 * Pure functions only. No side effects. No storage reads or writes.
 * No localStorage, no IndexedDB, no fetch, no XMLHttpRequest, no sendBeacon.
 * No telemetry or analytics. No Date.now. No browser APIs. No process.env. No import.meta.env.
 * No backup/export/restore module imports. No storage driver imports.
 * No production integration. Not imported by production modules.
 * Generated/test data only boundary: all inputs must be generated or test data.
 * canExecuteRestore is always false in Phase 28D.
 * canWriteProductionState is always false in Phase 28D.
 * canUseRealLearnerData is always false in Phase 28D.
 * canChangeBackupFormat is always false in Phase 28D.
 * canOverwriteRestoreTarget is always false in Phase 28D.
 * canClaimDataLossPrevention is always false in Phase 28D.
 * canClaimProductionSafety is always false in Phase 28D.
 *
 * Do not import this file from production backup/export/restore, UI, route,
 * settings, library, dashboard, or storage driver modules.
 *
 * Evidence level: unit_static_only or generated_test_rehearsal_only.
 * This file does not prove production runtime restore safety.
 * No sync/cloud/account/auth/backend.
 */

import {
  createGeneratedTestRestoreRehearsalPlan,
  deriveRestoreRehearsalSafetyState,
} from './restoreRehearsalPlanner.js';

/**
 * Required outcome state IDs for deriveGeneratedTestRestoreRehearsalOutcome.
 * Conservative priority (check in this order — highest priority first):
 *   telemetry_or_sync_blocked
 *   storage_migration_blocked
 *   backup_format_change_blocked
 *   external_backup_file_blocked
 *   restore_overwrite_blocked
 *   production_state_write_blocked
 *   real_learner_data_blocked
 *   planner_not_ready
 *   synthetic_anomaly_detected
 *   generated_test_restore_rehearsal_ready
 *   generated_test_restore_rehearsal_unavailable
 */
export const GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME = {
  TELEMETRY_OR_SYNC_BLOCKED: 'telemetry_or_sync_blocked',
  STORAGE_MIGRATION_BLOCKED: 'storage_migration_blocked',
  BACKUP_FORMAT_CHANGE_BLOCKED: 'backup_format_change_blocked',
  EXTERNAL_BACKUP_FILE_BLOCKED: 'external_backup_file_blocked',
  RESTORE_OVERWRITE_BLOCKED: 'restore_overwrite_blocked',
  PRODUCTION_STATE_WRITE_BLOCKED: 'production_state_write_blocked',
  REAL_LEARNER_DATA_BLOCKED: 'real_learner_data_blocked',
  PLANNER_NOT_READY: 'planner_not_ready',
  SYNTHETIC_ANOMALY_DETECTED: 'synthetic_anomaly_detected',
  GENERATED_TEST_RESTORE_REHEARSAL_READY: 'generated_test_restore_rehearsal_ready',
  GENERATED_TEST_RESTORE_REHEARSAL_UNAVAILABLE: 'generated_test_restore_rehearsal_unavailable',
};

const MAX_SYNTHETIC_ANOMALIES = 10;

// Planner state IDs used for mapping (string literals to avoid importing constants)
const PLANNER_STATES = {
  TELEMETRY_OR_SYNC_BLOCKED: 'telemetry_or_sync_blocked',
  STORAGE_MIGRATION_BLOCKED: 'storage_migration_blocked',
  BACKUP_FORMAT_CHANGE_BLOCKED: 'backup_format_change_blocked',
  EXTERNAL_BACKUP_FILE_BLOCKED: 'external_backup_file_blocked',
  RESTORE_OVERWRITE_BLOCKED: 'restore_overwrite_blocked',
  PRODUCTION_STATE_WRITE_BLOCKED: 'production_state_write_blocked',
  REAL_LEARNER_DATA_BLOCKED: 'real_learner_data_blocked',
  MISSING_GENERATED_TEST_DATA: 'missing_generated_test_data',
  GENERATED_TEST_REHEARSAL_PLAN_READY: 'generated_test_rehearsal_plan_ready',
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

function normalizeSyntheticAnomalies(val) {
  if (!Array.isArray(val)) return [];
  return val
    .filter(item => typeof item === 'string')
    .map(item => item.trim())
    .filter(item => item.length > 0)
    .slice(0, MAX_SYNTHETIC_ANOMALIES);
}

function mapPlannerStateToOutcome(plannerState, syntheticAnomalies) {
  switch (plannerState) {
    case PLANNER_STATES.TELEMETRY_OR_SYNC_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.TELEMETRY_OR_SYNC_BLOCKED;
    case PLANNER_STATES.STORAGE_MIGRATION_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.STORAGE_MIGRATION_BLOCKED;
    case PLANNER_STATES.BACKUP_FORMAT_CHANGE_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.BACKUP_FORMAT_CHANGE_BLOCKED;
    case PLANNER_STATES.EXTERNAL_BACKUP_FILE_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.EXTERNAL_BACKUP_FILE_BLOCKED;
    case PLANNER_STATES.RESTORE_OVERWRITE_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.RESTORE_OVERWRITE_BLOCKED;
    case PLANNER_STATES.PRODUCTION_STATE_WRITE_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PRODUCTION_STATE_WRITE_BLOCKED;
    case PLANNER_STATES.REAL_LEARNER_DATA_BLOCKED:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.REAL_LEARNER_DATA_BLOCKED;
    case PLANNER_STATES.MISSING_GENERATED_TEST_DATA:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PLANNER_NOT_READY;
    case PLANNER_STATES.GENERATED_TEST_REHEARSAL_PLAN_READY:
      if (syntheticAnomalies.length > 0) {
        return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.SYNTHETIC_ANOMALY_DETECTED;
      }
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_READY;
    default:
      return GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_UNAVAILABLE;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * normalizeGeneratedTestRestoreRehearsalInput
 *
 * Pure function. Accepts generated/test data input only.
 * Normalizes input object. Never mutates input.
 * Tolerates null/undefined/non-object input.
 * Trims string fields. Normalizes empty strings to undefined.
 * Normalizes booleans conservatively (only true if === true).
 * Normalizes syntheticAnomalies to array of trimmed non-empty strings, capped at 10.
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
 *   expectedItemCount               — number
 *   syntheticAnomalies              — array of strings (capped at 10)
 *   plannerStateId                  — string
 *   plannerSummary                  — string
 *   productionStateTargeted         — boolean
 *   realLearnerDataPresent          — boolean
 *   restoreOverwriteRequested       — boolean
 *   externalBackupFileProvided      — boolean
 *   storageMigrationRequested       — boolean
 *   telemetryRequested              — boolean
 *   syncCloudAccountBackendRequested — boolean
 *
 * @param {*} rawInput
 * @returns {object} normalized input (never null)
 */
export function normalizeGeneratedTestRestoreRehearsalInput(rawInput) {
  if (
    rawInput === null ||
    rawInput === undefined ||
    typeof rawInput !== 'object' ||
    Array.isArray(rawInput)
  ) {
    return { syntheticAnomalies: [] };
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

  if (typeof rawInput.expectedItemCount === 'number') {
    normalized.expectedItemCount = rawInput.expectedItemCount;
  }

  const plannerStateId = normalizeStringField(rawInput.plannerStateId);
  if (plannerStateId !== undefined) normalized.plannerStateId = plannerStateId;

  const plannerSummary = normalizeStringField(rawInput.plannerSummary);
  if (plannerSummary !== undefined) normalized.plannerSummary = plannerSummary;

  normalized.syntheticAnomalies = normalizeSyntheticAnomalies(rawInput.syntheticAnomalies);

  if (normalizeBooleanField(rawInput.generatedTestData)) normalized.generatedTestData = true;
  if (normalizeBooleanField(rawInput.productionStateTargeted)) normalized.productionStateTargeted = true;
  if (normalizeBooleanField(rawInput.realLearnerDataPresent)) normalized.realLearnerDataPresent = true;
  if (normalizeBooleanField(rawInput.restoreOverwriteRequested)) normalized.restoreOverwriteRequested = true;
  if (normalizeBooleanField(rawInput.externalBackupFileProvided)) normalized.externalBackupFileProvided = true;
  if (normalizeBooleanField(rawInput.storageMigrationRequested)) normalized.storageMigrationRequested = true;
  if (normalizeBooleanField(rawInput.telemetryRequested)) normalized.telemetryRequested = true;
  if (normalizeBooleanField(rawInput.syncCloudAccountBackendRequested))
    normalized.syncCloudAccountBackendRequested = true;

  return normalized;
}

/**
 * deriveGeneratedTestRestoreRehearsalOutcome
 *
 * Pure function. Accepts generated/test data input only.
 * Returns one of the GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME state IDs.
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
 *   planner_not_ready
 *   synthetic_anomaly_detected
 *   generated_test_restore_rehearsal_ready
 *   generated_test_restore_rehearsal_unavailable
 *
 * @param {*} rawInput
 * @returns {string} outcome state ID
 */
export function deriveGeneratedTestRestoreRehearsalOutcome(rawInput) {
  const n = normalizeGeneratedTestRestoreRehearsalInput(rawInput);
  const plannerState = deriveRestoreRehearsalSafetyState(rawInput);
  const syntheticAnomalies = n.syntheticAnomalies || [];
  return mapPlannerStateToOutcome(plannerState, syntheticAnomalies);
}

/**
 * createGeneratedTestRestoreRehearsal
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a non-executable rehearsal object from generated/test inputs and planner output.
 * Does not execute restore. Does not write storage. Does not import
 * backup/export/restore modules. Steps are descriptive only, not executable.
 *
 * All safety capability fields are hardcoded to false in Phase 28D:
 *   canExecuteRestore          — always false
 *   canWriteProductionState    — always false
 *   canUseRealLearnerData      — always false
 *   canChangeBackupFormat      — always false
 *   canOverwriteRestoreTarget  — always false
 *   canClaimDataLossPrevention — always false
 *
 * @param {*} rawInput
 * @returns {object} rehearsal object
 */
export function createGeneratedTestRestoreRehearsal(rawInput) {
  const n = normalizeGeneratedTestRestoreRehearsalInput(rawInput);
  const stateId = deriveGeneratedTestRestoreRehearsalOutcome(rawInput);
  const plannerPlan = createGeneratedTestRestoreRehearsalPlan(rawInput);
  const syntheticAnomalies = n.syntheticAnomalies || [];

  let severity;
  let steps;

  switch (stateId) {
    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_READY:
      severity = 'info';
      steps = [
        'Xác minh đầu vào là dữ liệu thử nghiệm tổng hợp được tạo. (Verify input is generated/test data.)',
        'Xác minh không có dữ liệu người học thực tế. (Confirm no real learner data present.)',
        'Xác minh trình lập kế hoạch Phase 28B đã sẵn sàng. (Confirm Phase 28B planner is ready.)',
        'Mô phỏng cấu trúc rehearsal khôi phục từ fixture thử nghiệm. (Simulate restore rehearsal structure from test fixture.)',
        'Kiểm tra các trường bắt buộc của đối tượng rehearsal. (Check required rehearsal object fields.)',
        'Xác minh tất cả cờ an toàn là false. (Verify all safety flags are false.)',
        'Trả về bản tóm tắt rehearsal. Không thực thi khôi phục. (Return rehearsal summary. Do not execute restore.)',
        'Giữ lại để xem xét trước khi thực thi bất kỳ thao tác khôi phục nào. (Hold for review before any restore execution.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.SYNTHETIC_ANOMALY_DETECTED:
      severity = 'caution';
      steps = [
        'Phát hiện dị thường tổng hợp trong đầu vào thử nghiệm. Xem xét syntheticAnomalies trước khi tiếp tục. (Synthetic anomaly detected in test input. Review syntheticAnomalies before proceeding.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PLANNER_NOT_READY:
      severity = 'caution';
      steps = [
        'Trình lập kế hoạch Phase 28B chưa sẵn sàng. Đặt generatedTestData: true và xóa các trường bị chặn. (Phase 28B planner not ready. Set generatedTestData: true and clear any blocked fields.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.TELEMETRY_OR_SYNC_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: yêu cầu telemetry hoặc sync/cloud/backend không được phép trong Phase 28D. (Blocked: telemetry or sync/cloud/backend request not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.STORAGE_MIGRATION_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: yêu cầu migration lưu trữ không được phép trong Phase 28D. (Blocked: storage migration request not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.BACKUP_FORMAT_CHANGE_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: yêu cầu thay đổi định dạng backup không được phép trong Phase 28D. (Blocked: backup format change request not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.EXTERNAL_BACKUP_FILE_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: file backup bên ngoài không được phép trong Phase 28D. (Blocked: external backup file not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.RESTORE_OVERWRITE_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: yêu cầu ghi đè khôi phục không được phép trong Phase 28D. (Blocked: restore overwrite request not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PRODUCTION_STATE_WRITE_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: ghi trạng thái sản xuất không được phép trong Phase 28D. (Blocked: production state write not allowed in Phase 28D.)',
      ];
      break;

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.REAL_LEARNER_DATA_BLOCKED:
      severity = 'blocked';
      steps = [
        'Bị chặn: dữ liệu người học thực tế không được phép trong Phase 28D. (Blocked: real learner data not allowed in Phase 28D.)',
      ];
      break;

    default:
      severity = 'unavailable';
      steps = [
        'Không thể tạo rehearsal khôi phục được tạo/thử nghiệm. Trạng thái không xác định. (Cannot create generated/test restore rehearsal. State unavailable.)',
      ];
      break;
  }

  return {
    stateId,
    severity,
    fixtureId: n.fixtureId,
    plannerStateId: plannerPlan.stateId,
    usesGeneratedTestData: n.generatedTestData === true,
    syntheticAnomalies,
    expectedItemCount: n.expectedItemCount,
    canExecuteRestore: false,
    canWriteProductionState: false,
    canUseRealLearnerData: false,
    canChangeBackupFormat: false,
    canOverwriteRestoreTarget: false,
    canClaimDataLossPrevention: false,
    steps,
    claimBoundary: 'UNIT_STATIC_EVIDENCE_ONLY_NO_RUNTIME_RESTORE_CLAIM',
  };
}

/**
 * summarizeGeneratedTestRestoreRehearsal
 *
 * Pure function. Accepts generated/test data input only.
 * Returns a summary object with Vietnamese-first copy.
 * canClaimProductionSafety is always false in Phase 28D.
 * evidenceLevel is one of: unit_static_only, generated_test_rehearsal_only, unknown.
 *
 * Does not include UI routing, href, navigation, telemetry, storage,
 * backup/export/restore calls, browser APIs, or Date.now.
 *
 * @param {*} rawInput
 * @returns {{ stateId, severity, labelVi, detailVi, canExecuteRestore, canUseRealLearnerData, canWriteProductionState, canClaimProductionSafety, evidenceLevel }}
 */
export function summarizeGeneratedTestRestoreRehearsal(rawInput) {
  const stateId = deriveGeneratedTestRestoreRehearsalOutcome(rawInput);

  const evidenceLevel =
    stateId === GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_READY
      ? 'generated_test_rehearsal_only'
      : stateId === GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_UNAVAILABLE
      ? 'unknown'
      : 'unit_static_only';

  switch (stateId) {
    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_READY:
      return {
        stateId,
        severity: 'info',
        labelVi: 'Rehearsal thử nghiệm được tạo sẵn sàng',
        detailVi:
          'Rehearsal khôi phục từ dữ liệu thử nghiệm tổng hợp được tạo đã sẵn sàng. Chỉ là bằng chứng đơn vị/tổng hợp, không phải bằng chứng an toàn sản xuất. Giữ lại để xem xét trước khi thực thi.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.SYNTHETIC_ANOMALY_DETECTED:
      return {
        stateId,
        severity: 'caution',
        labelVi: 'Phát hiện dị thường tổng hợp',
        detailVi:
          'Đã phát hiện dị thường tổng hợp trong đầu vào thử nghiệm. Xem xét các dị thường trước khi tiếp tục. Không thể tạo rehearsal sẵn sàng.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PLANNER_NOT_READY:
      return {
        stateId,
        severity: 'caution',
        labelVi: 'Trình lập kế hoạch chưa sẵn sàng',
        detailVi:
          'Trình lập kế hoạch Phase 28B chưa sẵn sàng. Cung cấp generatedTestData: true và xóa các trường bị chặn để bật rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.TELEMETRY_OR_SYNC_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: telemetry hoặc sync',
        detailVi:
          'Yêu cầu telemetry hoặc sync/cloud/backend không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.STORAGE_MIGRATION_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: migration lưu trữ',
        detailVi:
          'Yêu cầu migration lưu trữ không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.BACKUP_FORMAT_CHANGE_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: thay đổi định dạng backup',
        detailVi:
          'Yêu cầu thay đổi định dạng backup không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.EXTERNAL_BACKUP_FILE_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: file backup bên ngoài',
        detailVi:
          'File backup bên ngoài không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.RESTORE_OVERWRITE_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: ghi đè khôi phục',
        detailVi:
          'Yêu cầu ghi đè khôi phục không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.PRODUCTION_STATE_WRITE_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: ghi trạng thái sản xuất',
        detailVi:
          'Ghi trạng thái sản xuất không được phép trong Phase 28D. Không thể tạo rehearsal.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    case GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.REAL_LEARNER_DATA_BLOCKED:
      return {
        stateId,
        severity: 'blocked',
        labelVi: 'Bị chặn: dữ liệu người học thực tế',
        detailVi:
          'Dữ liệu người học thực tế không được phép trong Phase 28D. Chỉ sử dụng dữ liệu thử nghiệm tổng hợp được tạo.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel,
      };

    default:
      return {
        stateId: GENERATED_TEST_RESTORE_REHEARSAL_OUTCOME.GENERATED_TEST_RESTORE_REHEARSAL_UNAVAILABLE,
        severity: 'unavailable',
        labelVi: 'Rehearsal không xác định',
        detailVi:
          'Không thể xác định trạng thái rehearsal. Thông tin đầu vào không hợp lệ hoặc không có sẵn.',
        canExecuteRestore: false,
        canUseRealLearnerData: false,
        canWriteProductionState: false,
        canClaimProductionSafety: false,
        evidenceLevel: 'unknown',
      };
  }
}
