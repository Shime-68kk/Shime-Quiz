import { useMemo, useState } from 'react';
import {
  applySafeCapsuleControlCenterAction,
  createInitialSafeCapsuleControlCenterState,
  SAFE_CAPSULE_CONTROL_CENTER_ACTIONS
} from './safeCapsuleControlCenterModel.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const PRIVACY_AUDIT_LABELS = [
  ['rawQuizFieldsDetected', 'developer.auditQuiz'],
  ['rawAnswerFieldsDetected', 'developer.auditAnswers'],
  ['rawHistoryDetected', 'developer.auditHistory'],
  ['rawDocumentTextDetected', 'developer.auditDocument'],
  ['rawSourceMetadataDetected', 'developer.auditSource'],
  ['rawCardDeckIdsDetected', 'developer.auditIds'],
  ['rawRfIdentifiersDetected', 'developer.auditRf'],
  ['secretsDetected', 'developer.auditSecrets'],
  ['unknownUnsafeFieldsDetected', 'developer.auditUnknown']
];

function BucketList({ capsule, t }) {
  if (!capsule) return <p className="muted">{t('developer.noCapsule')}</p>;

  return (
    <dl className="settingsCompactList" aria-label="Safe capsule buckets">
      <div><dt>learningStateBucket</dt><dd>{capsule.learningStateBucket}</dd></div>
      <div><dt>studyLoadBucket</dt><dd>{capsule.studyLoadBucket}</dd></div>
      <div><dt>reviewUrgencyBucket</dt><dd>{capsule.reviewUrgencyBucket}</dd></div>
      <div><dt>sessionMoodBucket</dt><dd>{capsule.sessionMoodBucket}</dd></div>
      <div><dt>sessionEnergyBucket</dt><dd>{capsule.sessionEnergyBucket}</dd></div>
      <div><dt>focusNeedBucket</dt><dd>{capsule.focusNeedBucket}</dd></div>
      <div><dt>safeSummaryCode</dt><dd>{capsule.safeSummaryCode}</dd></div>
      <div><dt>checksum</dt><dd>{capsule.checksum}</dd></div>
      <div><dt>privacyClass</dt><dd>{capsule.privacyClass}</dd></div>
    </dl>
  );
}

function PrivacyAudit({ audit, t }) {
  if (!audit) return <p className="muted">{t('developer.noPrivacyAudit')}</p>;

  return (
    <ul className="settingsChecklist" aria-label="Privacy audit checklist">
      {PRIVACY_AUDIT_LABELS.map(([key, labelKey]) => (
        <li key={key}>
          <strong>{audit[key] === false ? t('developer.auditOk') : t('developer.auditReview')}</strong>
          <span>{t(labelKey)}</span>
        </li>
      ))}
    </ul>
  );
}

function MockPackageSummary({ summary, t }) {
  if (!summary) return <p className="muted">{t('developer.noMockPackage')}</p>;

  return (
    <dl className="settingsCompactList" aria-label="Mock robot import package summary">
      <div><dt>target</dt><dd>{summary.target}</dd></div>
      <div><dt>bridgeMode</dt><dd>{summary.bridgeMode}</dd></div>
      <div><dt>checksumStatus</dt><dd>{summary.checksumStatus}</dd></div>
      <div><dt>importPathHint</dt><dd>{summary.importPathHint}</dd></div>
      <div><dt>R5X19.2</dt><dd>{summary.compatibleWithR5X19_2 ? 'compatible' : 'not_ready'}</dd></div>
    </dl>
  );
}

export default function SafeCapsuleControlCenter() {
  const { t } = useShimeLanguage();
  const [state, setState] = useState(() => createInitialSafeCapsuleControlCenterState());
  const runAction = action => {
    setState(current => applySafeCapsuleControlCenterAction(current, action));
  };

  const bridgeFlags = useMemo(() => ([
    ['bridgeStatus', state.bridgeStatus],
    ['realBridgeEnabled', String(state.realBridgeEnabled)],
    ['transportEnabled', String(state.transportEnabled)],
    ['persistentWritesEnabled', String(state.persistentWritesEnabled)],
    ['motionControlsEnabled', String(state.motionControlsEnabled)]
  ]), [state]);

  return (
    <section className="settingsPanel safeCapsuleControlCenter" aria-label={t('developer.capsuleControlLabel')}>
      <div className="sectionHeader">
        <p className="eyebrow">Dev-only · Mock only</p>
        <h2>{t('developer.capsuleControlTitle')}</h2>
      </div>

      <div className="settingsNotice" role="note">
        <strong>{t('developer.capsuleControlLabel')}</strong>
        <p>{t('developer.capsuleControlBody')}</p>
      </div>

      <div className="settingsActions" aria-label="Safe capsule sample controls">
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STEADY)}>
          {t('developer.createSteady')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_STRUGGLING)}>
          {t('developer.createStruggling')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_HIGH_REVIEW_PRESSURE)}>
          {t('developer.createPressure')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_SAMPLE_LOW_ENERGY)}>
          {t('developer.createLowEnergy')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.RUN_PRIVACY_AUDIT)} disabled={!state.capsule}>
          {t('developer.runPrivacy')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CREATE_MOCK_ROBOT_IMPORT_PACKAGE)} disabled={!state.capsule}>
          {t('developer.createMockPackage')}
        </button>
        <button type="button" onClick={() => runAction(SAFE_CAPSULE_CONTROL_CENTER_ACTIONS.CLEAR_PREVIEW)}>
          {t('developer.clearPreview')}
        </button>
      </div>

      <div className="settingsGrid">
        <div>
          <h3>Capsule preview</h3>
          <BucketList capsule={state.capsule} t={t} />
        </div>
        <div>
          <h3>{t('developer.bridgeStatus')}</h3>
          <dl className="settingsCompactList" aria-label="Mock bridge status">
            {bridgeFlags.map(([label, value]) => (
              <div key={label}><dt>{label}</dt><dd>{value}</dd></div>
            ))}
          </dl>
          <p className="muted">Compatibility status: {state.compatibilityStatus.status}</p>
        </div>
        <div>
          <h3>Privacy audit</h3>
          <PrivacyAudit audit={state.privacyAudit} t={t} />
        </div>
        <div>
          <h3>Mock export envelope</h3>
          <MockPackageSummary summary={state.mockPackageSummary} t={t} />
        </div>
      </div>
    </section>
  );
}
