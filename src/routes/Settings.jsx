import { useCallback } from 'react';
import PageHeader from '../components/PageHeader.jsx';
import FsrsExperimentalSettingsPanel from '../components/settings/FsrsExperimentalSettingsPanel.jsx';
import EduGenDraftWorkshopPanel from '../components/settings/EduGenDraftWorkshopPanel.jsx';
import EduGenDraftReviewPanel from '../components/edugen/EduGenDraftReviewPanel.jsx';
// Phase 31C — default-off Data Safety Center prototype (hidden unless explicitly enabled in test/dev)
import DataSafetyCenterPrototype from '../features/dataSafety/DataSafetyCenterPrototype.jsx';
import { shouldShowDataSafetyCenterPrototype } from '../features/dataSafety/dataSafetyCenterPrototype.js';
// Phase 31G — internal visibility config derived from env; default-off; no user-visible toggle; no storage writes
import { createDataSafetyInternalVisibilityConfig } from '../features/dataSafety/dataSafetyInternalVisibility.js';
import {
  getLearningDataSnapshot,
  getLearningDataMetadataSnapshot,
  setLearningData
} from '../data/learningDataStore.js';
import { prepareEdugenDraftLibraryImport } from '../edugen/edugenDraftImport.js';

/**
 * Phase 16H — wire the EduGen draft review panel into the existing v2
 * library import path. Confirmation now genuinely saves to the library
 * (additive merge into a dedicated "Bản nháp EduGen" subject/topic),
 * with duplicate detection so existing study progress is never silently
 * overwritten. No scheduler/FSRS call is added; no network is added.
 */
function handleEdugenDraftConfirmImport({ items, summary }) {
  const currentRawData = getLearningDataSnapshot();
  const currentMetadata = getLearningDataMetadataSnapshot();

  const prepared = prepareEdugenDraftLibraryImport({
    draftItems: items,
    currentRawData,
    summary
  });

  if (!prepared.ok) {
    if (prepared.error === 'all_duplicates') {
      return {
        persisted: false,
        addedCount: 0,
        duplicateCount: prepared.summary.duplicateCount,
        message:
          'Tất cả thẻ EduGen vừa xác nhận đã có sẵn trong thư viện (trùng câu hỏi/đáp án). Không có thẻ nào được lưu để tránh ghi đè.'
      };
    }
    return {
      persisted: false,
      addedCount: 0,
      duplicateCount: prepared.summary.duplicateCount,
      message: 'Không có thẻ EduGen hợp lệ nào để lưu vào thư viện.'
    };
  }

  const result = setLearningData(prepared.mergedRawData, {
    sourceType: currentMetadata?.sourceType || 'edugen-draft',
    sourceName: currentMetadata?.sourceName || 'Bản nháp EduGen'
  });

  if (!result.ok) {
    return {
      persisted: false,
      addedCount: 0,
      duplicateCount: prepared.summary.duplicateCount,
      message:
        result.error === 'storage_write_failed'
          ? 'Đã ghép thẻ EduGen vào phiên hiện tại nhưng không lưu được cục bộ. Hãy kiểm tra dung lượng/quyền lưu trữ của trình duyệt.'
          : 'Không thể lưu thẻ EduGen vào thư viện vì dữ liệu chưa hợp lệ.'
    };
  }

  return {
    persisted: true,
    addedCount: prepared.summary.addedCount,
    duplicateCount: prepared.summary.duplicateCount,
    subjectId: prepared.subjectId,
    topicId: prepared.topicId
  };
}

// Phase 31G — internal visibility config; default-off; opt-in via internal env flag only
// With no flag set (default/production): returns { enabled: false, mode: 'default' } — prototype hidden.
// With VITE_SHIME_DATA_SAFETY_INTERNAL_VISIBILITY=1/true/enabled in dev/test: may render for internal builds only.
const PHASE31C_PROTOTYPE_CONFIG = createDataSafetyInternalVisibilityConfig(
  typeof import.meta !== 'undefined' ? import.meta.env : {}
);

import ThemeSettingsPanel from '../components/settings/ThemeSettingsPanel.jsx';
import DeviceBridgeUiConcept from '../components/settings/DeviceBridgeUiConcept.jsx';
import CompanionDevPanel from '../components/settings/CompanionDevPanel.jsx';
import SafeCapsuleControlCenter from '../components/settings/SafeCapsuleControlCenter.jsx';
import SafeCapsuleRehearsalLab from '../components/settings/SafeCapsuleRehearsalLab.jsx';
import SafeCapsuleExportVault from '../components/settings/SafeCapsuleExportVault.jsx';
import SafeCapsuleEndToEndVerificationPanel from '../components/settings/SafeCapsuleEndToEndVerificationPanel.jsx';
import { ShimeLanguageProvider } from '../uiI18n/ShimeLanguageProvider.jsx';
import ShimeLanguageSwitch from '../uiI18n/ShimeLanguageSwitch.jsx';

export default function Settings() {
  const onConfirmImport = useCallback(handleEdugenDraftConfirmImport, []);

  return (
    <div className="pageRoot">
      <ShimeLanguageProvider>
        <PageHeader title="Cài đặt" subtitle="Tuỳ chọn nâng cao" />
        <ShimeLanguageSwitch />
        <ThemeSettingsPanel />
        <FsrsExperimentalSettingsPanel />
        <DeviceBridgeUiConcept />
        <CompanionDevPanel />
        <SafeCapsuleControlCenter />
        <SafeCapsuleRehearsalLab />
        <SafeCapsuleExportVault />
        <SafeCapsuleEndToEndVerificationPanel />
        <EduGenDraftWorkshopPanel />
        <EduGenDraftReviewPanel onConfirmImport={onConfirmImport} />
        {shouldShowDataSafetyCenterPrototype(PHASE31C_PROTOTYPE_CONFIG) && (
          <DataSafetyCenterPrototype />
        )}
      </ShimeLanguageProvider>
    </div>
  );
}
