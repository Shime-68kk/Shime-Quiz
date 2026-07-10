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
function handleEdugenDraftConfirmImport({ items, summary }, t) {
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
        message: t('edugen.allDuplicates')
      };
    }
    return {
      persisted: false,
      addedCount: 0,
      duplicateCount: prepared.summary.duplicateCount,
      message: t('edugen.noValidCards')
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
          ? t('edugen.storageFailed')
          : t('edugen.libraryInvalid')
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
import SchedulerEvidencePanel from '../components/settings/SchedulerEvidencePanel.jsx';
import ShimeLanguageSwitch from '../uiI18n/ShimeLanguageSwitch.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';
import SettingsDisclosure from '../components/settings/SettingsDisclosure.jsx';

export default function Settings() {
  const { t } = useShimeLanguage();
  const onConfirmImport = useCallback(payload => handleEdugenDraftConfirmImport(payload, t), [t]);

  return (
    <div className="pageRoot settingsPage">
        <PageHeader eyebrow={t('settings.eyebrow')} title={t('settings.title')} subtitle={t('settings.subtitle')} />

        <section className="settingsSection" aria-labelledby="settings-appearance-title">
          <div className="settingsSection__heading">
            <p className="eyebrow">{t('settings.appearance')}</p>
            <h2 id="settings-appearance-title">{t('settings.appearance')}</h2>
            <p>{t('settings.appearanceBody')}</p>
          </div>
          <div className="settingsPreferenceGrid">
        <ShimeLanguageSwitch />
        <ThemeSettingsPanel />
          </div>
          <p className="settingsMotionNote">{t('settings.reducedMotionNote')}</p>
        </section>

        <section className="settingsSection settingsSection--experimental" aria-labelledby="settings-experimental-title">
          <div className="settingsSection__heading">
            <p className="eyebrow">{t('status.beta')}</p>
            <h2 id="settings-experimental-title">{t('settings.experimental')}</h2>
            <p>{t('settings.experimentalBody')}</p>
          </div>
        <FsrsExperimentalSettingsPanel />
          <p className="settingsBoundaryNote">{t('settings.noScheduleChange')} {t('settings.noCardMigration')}</p>
        </section>

        <SettingsDisclosure
          title={t('settings.advanced')}
          description={t('settings.advancedBody')}
          tone="advanced"
        >
          <EduGenDraftWorkshopPanel />
          <EduGenDraftReviewPanel onConfirmImport={onConfirmImport} />
        </SettingsDisclosure>

        <SettingsDisclosure
          title={t('settings.developer')}
          description={t('settings.developerBody')}
          tone="developer"
        >
          <p className="settingsBoundaryNote">{t('settings.safeCapsuleOnly')}</p>
          <DeviceBridgeUiConcept />
          <CompanionDevPanel />
          <SafeCapsuleControlCenter />
          <SafeCapsuleRehearsalLab />
          <SafeCapsuleExportVault />
          <SafeCapsuleEndToEndVerificationPanel />
          <SchedulerEvidencePanel />
          {shouldShowDataSafetyCenterPrototype(PHASE31C_PROTOTYPE_CONFIG) && (
            <DataSafetyCenterPrototype />
          )}
        </SettingsDisclosure>
    </div>
  );
}
