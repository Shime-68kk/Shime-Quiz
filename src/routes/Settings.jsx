import { lazy, Suspense, useCallback } from 'react';
import PageHeader from '../components/PageHeader.jsx';
// Phase 31C — default-off Data Safety Center prototype (hidden unless explicitly enabled in test/dev)
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
import ShimeLanguageSwitch from '../uiI18n/ShimeLanguageSwitch.jsx';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';
import SettingsDisclosure from '../components/settings/SettingsDisclosure.jsx';
import { shouldShowDeveloperTools } from '../config/productSurface.js';

const SHOW_DEVELOPER_TOOLS = shouldShowDeveloperTools(
  typeof import.meta !== 'undefined' ? import.meta.env : {}
);

// Heavy optional panels stay out of the Settings route until their disclosure
// is opened. Developer panels are additionally protected by the product surface
// gate above, so learner builds neither render nor request them by default.
const FsrsExperimentalSettingsPanel = lazy(() => import('../components/settings/FsrsExperimentalSettingsPanel.jsx'));
const EduGenDraftWorkshopPanel = lazy(() => import('../components/settings/EduGenDraftWorkshopPanel.jsx'));
const EduGenDraftReviewPanel = lazy(() => import('../components/edugen/EduGenDraftReviewPanel.jsx'));
const DeviceBridgeUiConcept = lazy(() => import('../components/settings/DeviceBridgeUiConcept.jsx'));
const CompanionDevPanel = lazy(() => import('../components/settings/CompanionDevPanel.jsx'));
const SafeCapsuleControlCenter = lazy(() => import('../components/settings/SafeCapsuleControlCenter.jsx'));
const SafeCapsuleRehearsalLab = lazy(() => import('../components/settings/SafeCapsuleRehearsalLab.jsx'));
const SafeCapsuleExportVault = lazy(() => import('../components/settings/SafeCapsuleExportVault.jsx'));
const SafeCapsuleEndToEndVerificationPanel = lazy(() => import('../components/settings/SafeCapsuleEndToEndVerificationPanel.jsx'));
const SchedulerEvidencePanel = lazy(() => import('../components/settings/SchedulerEvidencePanel.jsx'));
const DataSafetyCenterPrototype = lazy(() => import('../features/dataSafety/DataSafetyCenterPrototype.jsx'));

function SettingsPanelLoading({ label }) {
  return <p className="settingsMotionNote" role="status">{label}</p>;
}

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

        <SettingsDisclosure
          title={t('settings.advanced')}
          description={t('settings.advancedBody')}
          tone="advanced"
        >
          <Suspense fallback={<SettingsPanelLoading label={t('settings.loadingOptions')} />}>
            <FsrsExperimentalSettingsPanel />
            <p className="settingsBoundaryNote">{t('settings.noScheduleChange')} {t('settings.noCardMigration')}</p>
            <EduGenDraftWorkshopPanel />
            <EduGenDraftReviewPanel onConfirmImport={onConfirmImport} />
          </Suspense>
        </SettingsDisclosure>

        {SHOW_DEVELOPER_TOOLS ? (
          <SettingsDisclosure
            title={t('settings.developer')}
            description={t('settings.developerBody')}
            tone="developer"
          >
            <Suspense fallback={<SettingsPanelLoading label={t('settings.loadingDeveloperTools')} />}>
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
            </Suspense>
          </SettingsDisclosure>
        ) : null}
    </div>
  );
}
