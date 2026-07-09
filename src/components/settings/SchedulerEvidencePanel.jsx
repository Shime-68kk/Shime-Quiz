import { useMemo, useState } from 'react';
import Card from '../Card.jsx';
import Button from '../Button.jsx';
import { runSchedulerComparisonLab } from '../../scheduler/schedulerComparisonLab.js';
import { createPassingFsrsBetaEvidence, evaluateFsrsReadinessGate } from '../../scheduler/fsrsReadinessGate.js';
import { createSchedulerPreferenceModel, applySchedulerPreferenceAction } from '../../scheduler/schedulerBetaPreferenceModel.js';

export default function SchedulerEvidencePanel() {
  const [comparison, setComparison] = useState(null);
  const [preference, setPreference] = useState({ state: 'sm2_stable', explicitUserOptIn: false });
  const evidence = useMemo(() => createPassingFsrsBetaEvidence(), []);
  const readiness = useMemo(() => evaluateFsrsReadinessGate(evidence), [evidence]);
  const model = useMemo(() => createSchedulerPreferenceModel(preference, evidence), [preference, evidence]);

  return (
    <div className="settingsPanel">
      <Card eyebrow="Nội bộ" title="Phòng thử nghiệm thuật toán ôn tập" variant="default">
        <div className="settingsPanel__section">
          <p className="settingsPanel__helper">
            SM2 vẫn là mặc định ổn định. FSRS là beta, chỉ bật khi người dùng chọn.
            Có thể rollback về SM2. Không dùng cloud/AI/API. Không gửi nội dung câu hỏi/đáp án.
          </p>
          <p className="settingsPanel__status">
            SM2 default · FSRS beta status: {readiness.recommendation} · readiness score: {readiness.readinessScore}
          </p>
          <p className="settingsPanel__helperSecondary">
            Active scheduler preview: {model.activeSchedulerId}; rollback: {model.rollbackAvailable ? 'available' : 'blocked'}
          </p>

          <div className="buttonRow">
            <Button variant="secondary" onClick={() => setComparison(runSchedulerComparisonLab())}>
              Chạy so sánh SM2 và FSRS
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPreference(current => applySchedulerPreferenceAction(current, { type: 'preview_fsrs_effect' }))}
            >
              Xem preview FSRS beta
            </Button>
            <Button
              variant="ghost"
              onClick={() => setPreference(current => applySchedulerPreferenceAction(current, { type: 'rollback_to_sm2' }))}
            >
              Mô phỏng rollback về SM2
            </Button>
            <Button variant="ghost" onClick={() => setComparison(null)}>
              Xóa kết quả thử nghiệm
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
