import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { RECOMMENDATION_TYPES } from '../../learning/recommendationLite.js';
import {
  RECOMMENDATION_FEEDBACK_TYPES,
  saveRecommendationFeedback
} from '../../state/recommendationFeedbackStorage.js';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import {
  markStudyPlanStepActive,
  markStudyPlanStepComplete,
  resetStudyPlanProgressForDate
} from '../../state/studyPlanProgressStorage.js';

function getRecommendationBadgeText(type) {
  switch (type) {
    case RECOMMENDATION_TYPES.LIBRARY_EMPTY:
      return 'Cần dữ liệu';
    case RECOMMENDATION_TYPES.DUE_REVIEW:
      return 'Đến hạn';
    case RECOMMENDATION_TYPES.WEAK_MASTERY:
      return 'Cần củng cố';
    case RECOMMENDATION_TYPES.FIRST_SESSION:
      return 'Bước đầu';
    case RECOMMENDATION_TYPES.SMART_PRACTICE:
      return 'Ưu tiên';
    default:
      return 'Gợi ý';
  }
}

function getStepTone(tone) {
  if (['success', 'warning', 'danger', 'info'].includes(tone)) return tone;
  return 'neutral';
}

function formatGoalSummary(progress) {
  if (!progress?.hasGoal) return 'Chưa thiết lập mục tiêu hôm nay.';
  if (progress.remainingToday === 0) return 'Bạn đã đạt mục tiêu hôm nay.';
  return `Đã luyện ${progress.itemsPracticedToday} mục, còn ${progress.remainingToday} mục.`;
}

export default function TodayJourneyCard() {
  const navigate = useNavigate();
  const {
    recommendation,
    smartPracticeSelection,
    weakPracticeSelection,
    todayPlan,
    planProgressState,
    planStepProgress,
    goalProgress,
    dueSummary,
    mastery,
    notices
  } = useDashboardLearningData();
  const [feedbackStatus, setFeedbackStatus] = useState(null);
  const [planStatus, setPlanStatus] = useState(null);

  function startSmartPractice(selection, label = 'Luyện tập thông minh') {
    if (!selection?.selectedCount) return;
    navigate('/study-room', {
      state: {
        selection: {
          mode: 'smart-practice',
          source: 'daily-journey',
          label,
          requestedCount: selection.requestedCount,
          selectedItemIds: selection.selectedItemIds
        }
      }
    });
  }

  function runRecommendation() {
    switch (recommendation.type) {
      case RECOMMENDATION_TYPES.LIBRARY_EMPTY:
        navigate('/library');
        return;
      case RECOMMENDATION_TYPES.DUE_REVIEW:
        navigate('/study-room', {
          state: {
            selection: {
              mode: 'due-review',
              source: 'daily-journey',
              label: 'Ôn tập hôm nay',
              dueCount: recommendation.dueCount
            }
          }
        });
        return;
      case RECOMMENDATION_TYPES.WEAK_MASTERY:
        startSmartPractice(weakPracticeSelection?.selectedCount ? weakPracticeSelection : smartPracticeSelection, 'Luyện phần yếu');
        return;
      case RECOMMENDATION_TYPES.FIRST_SESSION:
        navigate('/study-room');
        return;
      case RECOMMENDATION_TYPES.SMART_PRACTICE:
        startSmartPractice(smartPracticeSelection);
        return;
      default:
        navigate('/dashboard');
    }
  }

  function runStep(step) {
    if (!step) return;
    if (step.id) markStudyPlanStepActive(step.id, planProgressState?.dateKey);
    if (step.type === 'import_data') {
      navigate('/library');
      return;
    }
    if (step.routeState) {
      navigate('/study-room', { state: { selection: step.routeState } });
      return;
    }
    navigate('/study-room');
  }

  function toggleStepComplete(step) {
    if (!step?.id) return;
    const status = planStepProgress.getStatus(step.id);
    if (status === 'completed') {
      setPlanStatus({
        tone: 'success',
        text: 'Bước này đã hoàn thành và sẽ không tự bỏ đánh dấu khi bấm lại.'
      });
      return;
    }

    const result = markStudyPlanStepComplete(step.id, planProgressState?.dateKey);

    if (!result.ok) {
      setPlanStatus({ tone: 'danger', text: 'Không thể lưu tiến trình kế hoạch cục bộ.' });
      return;
    }

    setPlanStatus({ tone: 'success', text: 'Đã đánh dấu hoàn thành.' });
  }

  function resetTodayProgress() {
    if (!window.confirm('Đặt lại tiến trình hôm nay? Thao tác này chỉ xóa trạng thái các bước trong kế hoạch hôm nay.')) return;
    const result = resetStudyPlanProgressForDate(planProgressState?.dateKey);
    if (!result.ok) {
      setPlanStatus({ tone: 'danger', text: 'Không thể đặt lại tiến trình kế hoạch cục bộ.' });
      return;
    }
    setPlanStatus({ tone: 'success', text: 'Đã đặt lại tiến trình hôm nay.' });
  }

  function getVisibleStepStatus(step) {
    const status = planStepProgress.getStatus(step?.id);
    if (status === 'completed') return { label: 'Đã hoàn thành', tone: 'success' };
    if (status === 'active') return { label: 'Đang làm', tone: 'warning' };
    return { label: 'Chưa làm', tone: 'neutral' };
  }

  function handleFeedback(feedbackType) {
    if (!recommendation?.type) return;
    const result = saveRecommendationFeedback({
      recommendationType: recommendation.type,
      feedback: feedbackType,
      reasonCode: 'daily_journey'
    });

    if (!result.ok) {
      setFeedbackStatus({ tone: 'danger', text: 'Không thể lưu phản hồi cục bộ. Bạn vẫn có thể tiếp tục học.' });
      return;
    }

    setFeedbackStatus({
      tone: 'success',
      text: feedbackType === RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY
        ? 'Đã ẩn gợi ý này trong hôm nay.'
        : 'Đã ghi nhận phản hồi.'
    });
  }

  const canRunRecommendation = recommendation.type === RECOMMENDATION_TYPES.LIBRARY_EMPTY
    || recommendation.type === RECOMMENDATION_TYPES.DUE_REVIEW
    || recommendation.type === RECOMMENDATION_TYPES.FIRST_SESSION
    || (recommendation.type === RECOMMENDATION_TYPES.WEAK_MASTERY
      ? Boolean((weakPracticeSelection?.selectedCount || smartPracticeSelection.selectedCount) > 0)
      : smartPracticeSelection.selectedCount > 0);

  return (
    <Card title="Hành trình hôm nay" eyebrow="Lộ trình hằng ngày" variant="elevated" className="dailyJourneyCard">
      <div className="dailyJourneyGrid">
        <section className="dailyJourneyPrimary" aria-labelledby="dailyJourneyRecommendationTitle">
          <div className="dailyJourneySectionHeader">
            <span>Gợi ý chính</span>
            <Badge tone={recommendation.tone}>{getRecommendationBadgeText(recommendation.type)}</Badge>
          </div>
          <h3 id="dailyJourneyRecommendationTitle">{recommendation.title}</h3>
          <p className="muted">{recommendation.reason}</p>
          <p className="recommendationCard__explain">
            Dựa trên lịch sử học cục bộ, lịch ôn, mức độ nắm vững cơ bản và mục tiêu học tập nếu có.
          </p>
          <div className="dailyJourneyActions">
            <Button type="button" size="sm" onClick={runRecommendation} disabled={!canRunRecommendation}>
              {recommendation.actionLabel}
            </Button>
            {recommendation.type === RECOMMENDATION_TYPES.WEAK_MASTERY && smartPracticeSelection.selectedCount > 0 ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => startSmartPractice(smartPracticeSelection)}>
                Luyện tập thông minh
              </Button>
            ) : null}
          </div>
        </section>

        <section className="dailyJourneyGoal" aria-label="Mục tiêu hôm nay">
          <div className="dailyJourneySectionHeader">
            <span>Mục tiêu hôm nay</span>
            {goalProgress.hasGoal ? <Badge tone={goalProgress.remainingToday === 0 ? 'success' : 'info'}>{goalProgress.progressPercent}%</Badge> : <Badge tone="neutral">Chưa đặt</Badge>}
          </div>
          <p>{formatGoalSummary(goalProgress)}</p>
          {goalProgress.hasGoal ? (
            <ProgressBar value={goalProgress.progressPercent} label="Tiến độ mục tiêu hôm nay" />
          ) : null}
          <div className="dailyJourneyMeta" aria-label="Tóm tắt hành trình hôm nay">
            <span>Câu đến hạn: <strong>{dueSummary.dueCount}</strong></span>
            <span>Mục cần củng cố: <strong>{mastery?.weakItemCount || 0}</strong></span>
          </div>
        </section>
      </div>

      <section className="dailyJourneyPlan" aria-labelledby="dailyJourneyPlanTitle">
        <div className="dailyJourneySectionHeader">
          <span id="dailyJourneyPlanTitle">Kế hoạch hôm nay</span>
          {planStepProgress.totalSteps > 0 ? (
            <Badge tone={planStepProgress.allCompleted ? 'success' : 'info'}>
              Đã hoàn thành {planStepProgress.completedCount}/{planStepProgress.totalSteps} bước
            </Badge>
          ) : todayPlan.goalCompleted ? <Badge tone="success">Bạn đã đạt mục tiêu hôm nay</Badge> : <Badge tone="info">Đề xuất</Badge>}
        </div>

        {planStepProgress.allCompleted ? (
          <p className="studyPlanNotice" role="status">Bạn đã hoàn thành kế hoạch hôm nay.</p>
        ) : null}

        {!todayPlan.hasPlan ? (
          <p className="muted">Không có kế hoạch phù hợp.</p>
        ) : (
          <div className="studyPlanList" aria-label="Các bước trong hành trình hôm nay">
            {todayPlan.steps.map((step, index) => {
              const visibleStatus = getVisibleStepStatus(step);
              const isCompleted = visibleStatus.label === 'Đã hoàn thành';
              return (
                <article className={`studyPlanStep ${isCompleted ? 'studyPlanStep--completed' : ''}`} key={step.id || `${step.type}-${index}`}>
                  <div className="studyPlanStep__marker" aria-hidden="true">{index + 1}</div>
                  <div className="studyPlanStep__body">
                    <div className="studyPlanStep__topline">
                      <span className="studyPlanStep__label">Bước {index + 1}</span>
                      <Badge tone={visibleStatus.tone}>{visibleStatus.label}</Badge>
                      <Badge tone={getStepTone(step.tone)}>{step.status}</Badge>
                    </div>
                    <strong>{step.title}</strong>
                    <p className="muted">{step.reason}</p>
                    {step.estimatedItemCount > 0 ? <span className="studyPlanStep__count">Khoảng {step.estimatedItemCount} mục</span> : null}
                  </div>
                  <div className="studyPlanStep__action">
                    <Button type="button" size="sm" onClick={() => runStep(step)}>{step.actionLabel}</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => toggleStepComplete(step)}>
                      {isCompleted ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
        {todayPlan.hasPlan ? (
          <div className="studyPlanProgressActions">
            <Button type="button" size="sm" variant="ghost" onClick={resetTodayProgress}>
              Đặt lại tiến trình hôm nay
            </Button>
          </div>
        ) : null}
      </section>

      {planStatus ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${planStatus.tone}`} role="status">
          {planStatus.text}
        </p>
      ) : null}

      <div className="recommendationFeedback" aria-label="Phản hồi gợi ý">
        <span>Phản hồi:</span>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.HELPFUL)}>Hữu ích</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT)}>Không phù hợp</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY)}>Ẩn hôm nay</Button>
      </div>

      {feedbackStatus ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${feedbackStatus.tone}`} role="status">
          {feedbackStatus.text}
        </p>
      ) : null}

      {recommendation.hiddenFallback ? (
        <p className="historyPanelMessage" role="status">
          Một số gợi ý đã ẩn hôm nay, nên hệ thống hiển thị lựa chọn an toàn khác.
        </p>
      ) : null}

      {notices.hasDiscardedLocalData ? (
        <p className="historyPanelMessage" role="status">
          Một phần dữ liệu cũ bị lỗi nên đã được bỏ qua an toàn khi tạo hành trình hôm nay.
        </p>
      ) : null}
    </Card>
  );
}
