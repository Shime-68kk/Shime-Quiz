import { useState } from 'react';
import {
  applySafeCapsuleRehearsalLabAction,
  createInitialSafeCapsuleRehearsalLabState,
  SAFE_CAPSULE_REHEARSAL_ACTIONS
} from './safeCapsuleRehearsalLabModel.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const BUTTONS = [
  ['steady_progress', 'developer.runSteady'],
  ['struggling_streak', 'developer.runStruggling'],
  ['review_pressure_high', 'developer.runPressure'],
  ['low_energy_focus', 'developer.runLowEnergy'],
  ['privacy_attack_raw_quiz', 'developer.runQuizAttack'],
  ['privacy_attack_raw_rf', 'developer.runRfAttack'],
  ['privacy_attack_secret', 'developer.runSecretAttack']
];

function ResultTable({ results, t }) {
  if (!results.length) return <p className="muted">{t('developer.noRehearsal')}</p>;

  return (
    <div className="settingsTableWrap">
      <table className="settingsTable" aria-label="Safe capsule rehearsal results">
        <thead>
          <tr>
            <th>scenario id</th>
            <th>accepted/rejected</th>
            <th>reason</th>
            <th>quality</th>
            <th>compatibility</th>
            <th>privacy</th>
            <th>package</th>
            <th>checksum</th>
            <th>summary code</th>
            <th>action</th>
            <th>tone</th>
            <th>status</th>
          </tr>
        </thead>
        <tbody>
          {results.map(result => (
            <tr key={result.scenarioId}>
              <td>{result.scenarioId}</td>
              <td>{result.accepted ? 'accepted' : 'rejected'}</td>
              <td>{result.rejectionReasonCode || 'NONE'}</td>
              <td>{result.qualityScore.overall}</td>
              <td>{result.compatibilityScore}</td>
              <td>{result.qualityScore.privacy}</td>
              <td>{result.privacyEvidenceSummary.packageCreated ? 'yes' : 'no'}</td>
              <td>{result.privacyEvidenceSummary.checksumStatus}</td>
              <td>{result.capsule?.safeSummaryCode || 'NONE'}</td>
              <td>{result.recommendedCompanionAction}</td>
              <td>{result.companionTone}</td>
              <td>{result.noSendStatus}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EvidenceCodes({ result, t }) {
  if (!result) return <p className="muted">{t('developer.noEvidence')}</p>;
  const codes = [
    ...result.qualityScore.explanationCodes,
    ...result.privacyEvidenceSummary.summaryCodes
  ];
  return (
    <ul className="settingsChecklist" aria-label="Safe capsule evidence summary codes">
      {Array.from(new Set(codes)).map(code => (
        <li key={code}>
          <strong>CODE</strong>
          <span>{code}</span>
        </li>
      ))}
    </ul>
  );
}

export default function SafeCapsuleRehearsalLab() {
  const { t } = useShimeLanguage();
  const [state, setState] = useState(() => createInitialSafeCapsuleRehearsalLabState());

  const runScenario = scenarioId => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, {
      type: SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_SCENARIO,
      scenarioId
    }));
  };

  const runAll = () => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_ALL));
  };

  const clear = () => {
    setState(current => applySafeCapsuleRehearsalLabAction(current, SAFE_CAPSULE_REHEARSAL_ACTIONS.CLEAR));
  };

  return (
    <section className="settingsPanel safeCapsuleRehearsalLab" aria-label={t('developer.rehearsalLabel')}>
      <div className="sectionHeader">
        <p className="eyebrow">Mock-only rehearsal</p>
        <h2>{t('developer.rehearsalLabel')}</h2>
      </div>

      <div className="settingsNotice" role="note">
        <strong>{t('developer.rehearsalTitle')}</strong>
        <p>{t('developer.rehearsalBody')}</p>
      </div>

      <div className="settingsActions" aria-label="Safe capsule rehearsal controls">
        {BUTTONS.map(([scenarioId, labelKey]) => (
          <button key={scenarioId} type="button" onClick={() => runScenario(scenarioId)}>
            {t(labelKey)}
          </button>
        ))}
        <button type="button" onClick={runAll}>{t('developer.runAll')}</button>
        <button type="button" onClick={clear}>{t('developer.clearRehearsal')}</button>
      </div>

      <dl className="settingsCompactList" aria-label="Safe capsule rehearsal safety status">
        <div><dt>mock-only status</dt><dd>{state.mockOnlyStatus}</dd></div>
        <div><dt>no-send status</dt><dd>{state.noSendStatus}</dd></div>
        <div><dt>realBridgeEnabled</dt><dd>{String(state.realBridgeEnabled)}</dd></div>
        <div><dt>transportEnabled</dt><dd>{String(state.transportEnabled)}</dd></div>
      </dl>

      <ResultTable results={state.results} t={t} />

      <div>
        <h3>Evidence summary codes</h3>
        <EvidenceCodes result={state.latestResult} t={t} />
      </div>
    </section>
  );
}
