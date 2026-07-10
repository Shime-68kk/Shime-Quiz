import { useMemo, useState } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import { runSchedulerComparisonLab } from '../../scheduler/schedulerComparisonLab.js';
import { createPassingFsrsBetaEvidence, evaluateFsrsReadinessGate } from '../../scheduler/fsrsReadinessGate.js';
import { createSchedulerPreferenceModel, applySchedulerPreferenceAction } from '../../scheduler/schedulerBetaPreferenceModel.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

export default function SchedulerEvidencePanel() {
  const { t } = useShimeLanguage();
  const [comparison, setComparison] = useState(null);
  const [preference, setPreference] = useState({ state: 'sm2_stable', explicitUserOptIn: false });
  const evidence = useMemo(() => createPassingFsrsBetaEvidence(), []);
  const readiness = useMemo(() => evaluateFsrsReadinessGate(evidence), [evidence]);
  const model = useMemo(() => createSchedulerPreferenceModel(preference, evidence), [preference, evidence]);

  return (
    <div className="settingsPanel">
      <Card eyebrow={t('developer.schedulerEyebrow')} title={t('developer.schedulerTitle')} variant="default">
        <div className="settingsPanel__section">
          <p className="settingsPanel__helper">
            {t('developer.schedulerBody')}
          </p>
          <p className="settingsPanel__status">
            SM2 default · FSRS beta status: {readiness.recommendation} · readiness score: {readiness.readinessScore}
          </p>
          <p className="settingsPanel__helperSecondary">
            Active scheduler preview: {model.activeSchedulerId}; rollback: {model.rollbackAvailable ? 'available' : 'blocked'}
          </p>

          <div className="buttonRow">
            <Button variant="secondary" onClick={() => setComparison(runSchedulerComparisonLab())}>
              {t('developer.compareSchedulers')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPreference(current => applySchedulerPreferenceAction(current, { type: 'preview_fsrs_effect' }))}
            >
              {t('developer.previewFsrs')}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPreference(current => applySchedulerPreferenceAction(current, { type: 'rollback_to_sm2' }))}
            >
              {t('developer.rollbackSm2')}
            </Button>
            <Button variant="ghost" onClick={() => setComparison(null)}>
              {t('developer.clearScheduler')}
            </Button>
          </div>

          {comparison && (
            <div className="settingsPanel__warningBlock" aria-live="polite">
              <p className="settingsPanel__helper">
                Scenarios: {comparison.aggregate.totalScenarios}; FSRS promising: {comparison.aggregate.fsrsPromisingCount};
                FSRS risks: {comparison.aggregate.fsrsRiskCount}; SM2 safer: {comparison.aggregate.sm2SaferCount}.
              </p>
              <p className="settingsPanel__helperSecondary">
                Recommendation: {comparison.aggregate.defaultRecommendation}
              </p>
              <p className="settingsPanel__helperSecondary">
                Risk codes: {Array.from(new Set(comparison.scenarioResults.flatMap(result => result.riskCodes))).join(', ')}
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
