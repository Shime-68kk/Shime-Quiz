/**
 * Phase 31C — Data Safety Center Prototype Pure Module
 *
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_DECISION: PASS_TO_PHASE31D_DATA_SAFETY_UX_EVIDENCE_REVIEW
 * PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
 *
 * Pure functions only. No localStorage, no IndexedDB, no sessionStorage, no fetch,
 * no XMLHttpRequest, no WebSocket, no navigator.sendBeacon, no network calls.
 * No backup/export/restore behavior changes. No storage writes. No telemetry.
 * No sync/cloud/backend/account/auth. No BYOC/WebDAV/P2P/device-transfer.
 *
 * Default is OFF. The prototype section must not be visible in production.
 * This module does not import backup, export, restore, storage, sync, cloud,
 * backend, account, or auth modules.
 */

/**
 * Default-off flag. Must remain false unless explicitly activated in test/dev.
 * Never set this to true in production entry points.
 */
export const DATA_SAFETY_CENTER_PROTOTYPE_DEFAULT_ENABLED = false;

const ALLOWED_MODES = new Set(['test', 'dev']);

/**
 * Normalize a raw config input into a safe prototype config object.
 * Always returns a conservative/disabled result for unknown input.
 */
export function normalizeDataSafetyPrototypeConfig(input) {
  if (!input || typeof input !== 'object') {
    return { enabled: false, mode: 'default' };
  }
  return {
    enabled: input.enabled === true,
    mode: typeof input.mode === 'string' && input.mode.length > 0 ? input.mode : 'default',
  };
}

/**
 * Returns true only when the config explicitly enables the prototype in an
 * allowed mode (test or dev). Returns false for all other inputs, including
 * empty objects, null, undefined, and production mode.
 *
 * This is the guard used in the Settings mount point.
 * With the default empty config {}, this always returns false.
 */
export function shouldShowDataSafetyCenterPrototype(input) {
  if (!input || typeof input !== 'object') {
    return false;
  }
  const config = normalizeDataSafetyPrototypeConfig(input);
  if (!config.enabled) {
    return false;
  }
  return ALLOWED_MODES.has(config.mode);
}

/**
 * Build the view model for the Data Safety Center prototype sections.
 * All action controls are disabled/placeholder. No real behavior.
 * Returns a static descriptive view model with all required sections.
 */
export function getDataSafetyCenterPrototypeViewModel() {
  return {
    source: 'phase31c_prototype',
    prototypeEnabled: true,
    sections: {
      readinessSummary: {
        sectionId: 'dsc-readiness-summary',
        titleVi: 'Trạng thái an toàn dữ liệu',
        titleEn: 'Data safety status',
        bodyVi:
          'Dữ liệu học tập của bạn được lưu cục bộ trên trình duyệt này. ' +
          'Đây là bản thử nghiệm nội bộ. Chưa được phê duyệt sản xuất.',
        bodyEn:
          'Your study data is stored locally in this browser. ' +
          'This is an internal prototype. Not approved for production.',
        statusLabel: 'LIMITED_BETA_CANDIDATE',
      },
      localDataExplanation: {
        sectionId: 'dsc-local-data',
        titleVi: 'Dữ liệu cục bộ / trình duyệt',
        titleEn: 'Local / browser-local data',
        bodyVi:
          'Tất cả dữ liệu ôn tập được lưu trên thiết bị này. ' +
          'Không có tài khoản yêu cầu. Không có đồng bộ đám mây. ' +
          'Không có sao lưu tự động. Bạn hoàn toàn kiểm soát dữ liệu của mình.',
        bodyEn:
          'All study data is saved on this device. ' +
          'No account required. No cloud sync. No automatic backup. ' +
          'You are in full control of your data.',
        noAccountRequired: true,
        noCloudSync: true,
        noAutomaticBackup: true,
      },
      exportBackup: {
        sectionId: 'dsc-export-backup',
        titleVi: 'Xuất bản sao lưu (placeholder)',
        titleEn: 'Export backup (placeholder)',
        bodyVi:
          'Bạn có thể xuất dữ liệu học tập thủ công để tạo bản sao lưu cục bộ. ' +
          'Chức năng này chưa được kích hoạt trong bản thử nghiệm này.',
        bodyEn:
          'You can manually export study data to create a local backup. ' +
          'This action is not activated in this prototype.',
        actionLabel: 'Xuất bản sao lưu (chưa hoạt động)',
        actionLabelEn: 'Export backup (placeholder — not functional)',
        disabled: true,
        placeholder: true,
        inert: true,
      },
      importPreview: {
        sectionId: 'dsc-import-preview',
        titleVi: 'Nhập bản sao lưu (placeholder)',
        titleEn: 'Import backup (placeholder)',
        bodyVi:
          'Bạn có thể nhập bản sao lưu đã xuất trước đó để xem trước nội dung. ' +
          'Chức năng này chưa được kích hoạt trong bản thử nghiệm này.',
        bodyEn:
          'You can import a previously exported backup to preview its content. ' +
          'This action is not activated in this prototype.',
        actionLabel: 'Nhập bản sao lưu (chưa hoạt động)',
        actionLabelEn: 'Import backup (placeholder — not functional)',
        disabled: true,
        placeholder: true,
        inert: true,
      },
      restoreCaution: {
        sectionId: 'dsc-restore-caution',
        titleVi: 'Lưu ý khi khôi phục',
        titleEn: 'Restore caution',
        bodyVi:
          'Khôi phục dữ liệu từ bản sao lưu sẽ ghi đè dữ liệu hiện tại. ' +
          'Không có đảm bảo chống mất dữ liệu. ' +
          'Không có xác minh khôi phục với dữ liệu thực của người dùng. ' +
          'Chức năng khôi phục chưa được phê duyệt trong bản thử nghiệm này.',
        bodyEn:
          'Restoring data from a backup will overwrite current data. ' +
          'No guaranteed data-loss prevention. ' +
          'No restore verification with real user data. ' +
          'Restore execution is not approved in this prototype.',
        noRestoreSafetyGuarantee: true,
        noRestoreExecution: true,
      },
      backupReminder: {
        sectionId: 'dsc-backup-reminder',
        titleVi: 'Nhắc nhở sao lưu',
        titleEn: 'Backup reminder',
        bodyVi:
          'Khuyến khích xuất bản sao lưu thủ công định kỳ. ' +
          'Không có sao lưu tự động. Không có lịch nhắc tự động.',
        bodyEn:
          'Encourage periodic manual backup exports. ' +
          'No automatic backup. No automatic reminder schedule.',
        noAutomaticBackup: true,
      },
      browserStorageLimit: {
        sectionId: 'dsc-browser-storage-limit',
        titleVi: 'Giới hạn lưu trữ trình duyệt',
        titleEn: 'Browser / storage limitation',
        bodyVi:
          'Dữ liệu lưu trữ trong trình duyệt có thể bị xóa bởi trình duyệt, ' +
          'hệ điều hành, hoặc khi xóa bộ nhớ cache. ' +
          'Không có đảm bảo lưu trữ vĩnh viễn. ' +
          'Xuất bản sao lưu thủ công là cách duy nhất để bảo vệ dữ liệu của bạn.',
        bodyEn:
          'Browser-stored data may be cleared by the browser, OS, or cache clearing. ' +
          'No permanent storage guarantee. ' +
          'Manual export is the only way to protect your data.',
        noStorageGuarantee: true,
      },
      evidenceGaps: {
        sectionId: 'dsc-evidence-gaps',
        titleVi: 'Khoảng trống bằng chứng / giới hạn beta',
        titleEn: 'Evidence gaps / beta limitations',
        bodyVi:
          'Bản thử nghiệm này chưa đạt trạng thái BETA_READY. ' +
          'Chưa có bằng chứng đầy đủ về khôi phục với dữ liệu thực. ' +
          'Chưa phê duyệt sản xuất rộng rãi. ' +
          'Trạng thái hiện tại: LIMITED_BETA_CANDIDATE.',
        bodyEn:
          'This prototype has not reached BETA_READY status. ' +
          'No full restore evidence with real user data. ' +
          'Not approved for broad production release. ' +
          'Current status: LIMITED_BETA_CANDIDATE.',
        limitedBetaCandidateOnly: true,
        betaReadyNotApproved: true,
      },
      helpFaq: {
        sectionId: 'dsc-help-faq',
        titleVi: 'Trợ giúp / Câu hỏi thường gặp',
        titleEn: 'Help / FAQ',
        bodyVi:
          'Dữ liệu của tôi ở đâu? Trên thiết bị này, trong bộ nhớ trình duyệt. ' +
          'Dữ liệu có được đồng bộ không? Không. ' +
          'Tôi có cần tài khoản không? Không. ' +
          'Làm thế nào để bảo vệ dữ liệu? Xuất bản sao lưu thủ công.',
        bodyEn:
          'Where is my data? On this device, in browser storage. ' +
          'Is data synced? No. ' +
          'Do I need an account? No account required. ' +
          'How to protect data? Manual export backup.',
        noCloudSync: true,
        noAccountRequired: true,
      },
    },
    copyBoundaries: {
      localFirstOnly: true,
      noAccountRequired: true,
      noCloudSync: true,
      noAutomaticBackup: true,
      noRestoreSafetyGuarantee: true,
      noProductionReadinessClaim: true,
      noBetaReadyClaim: true,
      noRealBackupBehaviorClaim: true,
      noTelemetryClaim: true,
      noAiOcrApiKeyByokClaim: true,
    },
  };
}
