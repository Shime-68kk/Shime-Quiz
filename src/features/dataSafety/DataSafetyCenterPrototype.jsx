/**
 * Phase 31C — Data Safety Center Prototype Component
 *
 * PHASE31C_DATA_SAFETY_UX_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_DATA_SAFETY_UX_PROTOTYPE
 * PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
 *
 * Static/descriptive UI only. Default-off. No storage writes. No network calls.
 * No backup/export/restore behavior changes. No sync/cloud/backend/account/auth.
 * No telemetry. No BYOC/WebDAV/P2P/device-transfer. No BETA_READY claim.
 *
 * Action controls are disabled, inert, and clearly marked as placeholder/non-functional.
 * No click handler calls backup/export/restore/storage APIs.
 * No click handler writes localStorage/IndexedDB.
 */

import Card from '../../components/Card.jsx';
import { getDataSafetyCenterPrototypeViewModel } from './dataSafetyCenterPrototype.js';

export default function DataSafetyCenterPrototype() {
  const vm = getDataSafetyCenterPrototypeViewModel();
  const { sections } = vm;

  return (
    <div className="settingsPanel dataSafetyCenterPrototype" data-testid="data-safety-center-prototype">

      <Card
        eyebrow="Thử nghiệm nội bộ"
        title="An toàn dữ liệu (Data Safety Center — Prototype)"
        variant="default"
      >
        <div className="settingsPanel__section">
          <p className="settingsPanel__badge settingsPanel__badge--warning">
            Bản thử nghiệm nội bộ mặc định tắt. Default-off internal prototype.
          </p>
          <p className="settingsPanel__helperSecondary">
            PHASE31C_PROTOTYPE_SCOPE: DEFAULT_OFF_UI_ONLY_NO_STORAGE_WRITES_NO_BACKUP_RESTORE_BEHAVIOR_CHANGES
          </p>
        </div>
      </Card>

      {/* Section: Readiness / status summary */}
      <div
        className="dataSafety__readinessSummary settingsPanel__section"
        data-testid="dsc-readiness-summary"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.readinessSummary.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.readinessSummary.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.readinessSummary.bodyEn}
        </p>
        <p className="settingsPanel__badge settingsPanel__badge--info">
          Trạng thái: {sections.readinessSummary.statusLabel}
        </p>
        <p className="settingsPanel__helperSecondary">
          PHASE31C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
        </p>
      </div>

      {/* Section: Local data explanation */}
      <div
        className="dataSafety__localData settingsPanel__section"
        data-testid="dsc-local-data"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.localDataExplanation.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.localDataExplanation.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.localDataExplanation.bodyEn}
        </p>
      </div>

      {/* Section: Export backup placeholder */}
      <div
        className="dataSafety__exportBackup settingsPanel__section"
        data-testid="dsc-export-backup"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.exportBackup.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.exportBackup.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.exportBackup.bodyEn}
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="settingsPanel__actionBtn settingsPanel__actionBtn--placeholder"
          data-testid="dsc-export-backup-btn"
        >
          {sections.exportBackup.actionLabel}
        </button>
        <p className="settingsPanel__helperSecondary">
          {sections.exportBackup.actionLabelEn}
        </p>
      </div>

      {/* Section: Import preview placeholder */}
      <div
        className="dataSafety__importPreview settingsPanel__section"
        data-testid="dsc-import-preview"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.importPreview.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.importPreview.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.importPreview.bodyEn}
        </p>
        <button
          type="button"
          disabled
          aria-disabled="true"
          className="settingsPanel__actionBtn settingsPanel__actionBtn--placeholder"
          data-testid="dsc-import-preview-btn"
        >
          {sections.importPreview.actionLabel}
        </button>
        <p className="settingsPanel__helperSecondary">
          {sections.importPreview.actionLabelEn}
        </p>
      </div>

      {/* Section: Restore caution block */}
      <div
        className="dataSafety__restoreCaution settingsPanel__section"
        data-testid="dsc-restore-caution"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.restoreCaution.titleVi}
        </h3>
        <div className="settingsPanel__warningBlock">
          <p className="settingsPanel__badge settingsPanel__badge--warning">
            Cảnh báo: Không có đảm bảo chống mất dữ liệu. No guaranteed data-loss prevention.
          </p>
        </div>
        <p className="settingsPanel__helper">
          {sections.restoreCaution.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.restoreCaution.bodyEn}
        </p>
      </div>

      {/* Section: Backup reminder concept */}
      <div
        className="dataSafety__backupReminder settingsPanel__section"
        data-testid="dsc-backup-reminder"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.backupReminder.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.backupReminder.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.backupReminder.bodyEn}
        </p>
      </div>

      {/* Section: Browser / storage limitation explanation */}
      <div
        className="dataSafety__browserStorageLimit settingsPanel__section"
        data-testid="dsc-browser-storage-limit"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.browserStorageLimit.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.browserStorageLimit.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.browserStorageLimit.bodyEn}
        </p>
      </div>

      {/* Section: Evidence gaps / beta limitations panel */}
      <div
        className="dataSafety__evidenceGaps settingsPanel__section"
        data-testid="dsc-evidence-gaps"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.evidenceGaps.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.evidenceGaps.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.evidenceGaps.bodyEn}
        </p>
      </div>

      {/* Section: Help / FAQ block */}
      <div
        className="dataSafety__helpFaq settingsPanel__section"
        data-testid="dsc-help-faq"
      >
        <h3 className="settingsPanel__sectionTitle">
          {sections.helpFaq.titleVi}
        </h3>
        <p className="settingsPanel__helper">
          {sections.helpFaq.bodyVi}
        </p>
        <p className="settingsPanel__helperSecondary">
          {sections.helpFaq.bodyEn}
        </p>
      </div>

    </div>
  );
}
