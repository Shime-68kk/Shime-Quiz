/**
 * Phase 25M — Backup Health Limited Default-Off UI View-Model Prototype
 *
 * PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE
 * PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES
 * PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE
 *
 * Limited default-off UI view-model prototype. Pure functions only.
 * No localStorage, no IndexedDB, no fetch, no network, no UI, no telemetry.
 * No backup/export/restore behavior changes. No writes. No JSX/React.
 *
 * Import gate: only this file and its unit tests may import this module at this stage.
 * No UI/routes/settings/library/dashboard/backup/restore/entry-point file may import this module.
 * No production entry point may import this module.
 *
 * This module imports Phase 25K integration prototype only from the allowed path.
 * It does not wire into routes, navigation, settings, library, or dashboard.
 */

import {
  isBackupHealthIntegrationEnabled,
  createBackupHealthIntegrationState,
  BACKUP_HEALTH_STATE,
} from './backupHealthIntegrationPrototype.js';

export { BACKUP_HEALTH_STATE };

/**
 * Vietnamese-first calm display copy by state.
 * Avoids alarmist language, guaranteed data-loss prevention, automatic backup,
 * cloud sync, account recovery, platform backup preservation, or broad reliability claims.
 */
const UI_COPY_BY_STATE = {
  [BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP]: {
    tone: 'calm',
    titleVi: 'Đã sao lưu gần đây',
    bodyVi: 'Bạn đã xuất bản sao lưu thủ công gần đây. Hãy tiếp tục duy trì thói quen này.',
    actionLabelVi: 'Xem hướng dẫn sao lưu',
  },
  [BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE]: {
    tone: 'reminder',
    titleVi: 'Nhắc nhở sao lưu',
    bodyVi: 'Bản sao lưu cuối có thể đã cũ. Hãy xuất bản sao lưu thủ công để giữ dữ liệu an toàn.',
    actionLabelVi: 'Xem hướng dẫn sao lưu',
  },
  [BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA]: {
    tone: 'limited-evidence',
    titleVi: 'Đã kiểm tra khôi phục (dữ liệu thử nghiệm)',
    bodyVi: 'Quy trình khôi phục đã được xác minh với dữ liệu thử nghiệm. Chưa xác minh với dữ liệu thực.',
    actionLabelVi: 'Xem hướng dẫn sao lưu',
  },
  [BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE]: {
    tone: 'conservative',
    titleVi: 'Trạng thái sao lưu không khả dụng',
    bodyVi: 'Không thể xác định trạng thái sao lưu lúc này. Hãy kiểm tra lại sau.',
    actionLabelVi: null,
  },
  [BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED]: {
    tone: 'conservative',
    titleVi: 'Chưa ghi nhận sao lưu',
    bodyVi: 'Chưa có bản sao lưu nào được ghi nhận trên trình duyệt này. Hãy xuất bản sao lưu để bảo vệ dữ liệu của bạn.',
    actionLabelVi: 'Xem hướng dẫn sao lưu',
  },
  [BACKUP_HEALTH_STATE.UNKNOWN]: {
    tone: 'conservative',
    titleVi: 'Trạng thái sao lưu chưa rõ',
    bodyVi: 'Trạng thái sao lưu chưa được xác định. Hãy kiểm tra lại sau.',
    actionLabelVi: null,
  },
};

const COPY_FALLBACK = {
  tone: 'conservative',
  titleVi: 'Trạng thái sao lưu chưa rõ',
  bodyVi: 'Trạng thái sao lưu chưa được xác định.',
  actionLabelVi: null,
};

/**
 * Determines whether the Backup Health UI prototype is enabled.
 *
 * Default behavior:
 *   isBackupHealthUiPrototypeEnabled(undefined)                          -> false
 *   isBackupHealthUiPrototypeEnabled({})                                 -> false
 *   isBackupHealthUiPrototypeEnabled({ enabled: false })                 -> false
 *   isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'test' })    -> true
 *   isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'default-off' }) -> true
 *   isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'production' })  -> false
 *   isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'live' })    -> false
 *
 * Only explicit test/default-off opt-in enables this prototype.
 * Production/live modes are rejected.
 *
 * @param {object|undefined|null} options
 * @param {boolean} [options.enabled]
 * @param {string} [options.mode] - must be 'test' or 'default-off' to enable
 * @returns {boolean}
 */
export function isBackupHealthUiPrototypeEnabled(options) {
  if (options === null || options === undefined) return false;
  if (typeof options !== 'object') return false;
  if (options.enabled !== true) return false;

  const mode = options.mode;
  return mode === 'test' || mode === 'default-off';
}

/**
 * Creates a Backup Health UI view model from integration state.
 *
 * When disabled, returns a conservative hidden result with no display copy.
 * When enabled, calls the Phase 25K integration prototype and maps the state
 * to calm Vietnamese-first display metadata.
 *
 * Returns plain objects only. No renders, routes, writes, or side effects.
 *
 * @param {object|null|undefined} input - raw signal input passed to Phase 25K/25I layers
 * @param {object} [options]
 * @param {boolean} [options.enabled]
 * @param {string} [options.mode] - 'test' or 'default-off'
 * @param {number} [options.currentTimeMs] - injected current time (ms); forwarded to Phase 25K
 * @param {number} [options.staleThresholdMs] - stale threshold override; forwarded to Phase 25K
 * @returns {{ enabled: boolean, visible: boolean, stateId: string, source: string, tone?: string, titleVi?: string, bodyVi?: string, actionLabelVi?: string|null }}
 */
export function createBackupHealthUiModel(input, options) {
  if (!isBackupHealthUiPrototypeEnabled(options)) {
    return {
      enabled: false,
      visible: false,
      stateId: 'unknown',
      source: 'phase25m_disabled',
    };
  }

  const integrationOptions = {
    enabled: options.enabled,
    mode: options.mode,
  };
  if (typeof options.currentTimeMs === 'number') {
    integrationOptions.currentTimeMs = options.currentTimeMs;
  }
  if (typeof options.staleThresholdMs === 'number') {
    integrationOptions.staleThresholdMs = options.staleThresholdMs;
  }

  const integration = createBackupHealthIntegrationState(input, integrationOptions);
  const stateId = integration.stateId || BACKUP_HEALTH_STATE.UNKNOWN;

  const copy = UI_COPY_BY_STATE[stateId] || COPY_FALLBACK;

  return {
    enabled: true,
    visible: true,
    stateId,
    tone: copy.tone,
    titleVi: copy.titleVi,
    bodyVi: copy.bodyVi,
    actionLabelVi: copy.actionLabelVi,
    source: 'phase25k_integration_prototype',
  };
}
