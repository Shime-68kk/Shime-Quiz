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
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

function getRecommendationBadgeText(type, t) {
  switch (type) {
    case RECOMMENDATION_TYPES.LIBRARY_EMPTY:
      return t('journey.needData');
    case RECOMMENDATION_TYPES.DUE_REVIEW:
      return t('journey.due');
    case RECOMMENDATION_TYPES.WEAK_MASTERY:
      return t('journey.reinforce');
    case RECOMMENDATION_TYPES.FIRST_SESSION:
      return t('journey.firstStep');
    case RECOMMENDATION_TYPES.SMART_PRACTICE:
      return t('journey.priority');
    default:
      return t('journey.suggestion');
  }
}

function getStepTone(tone) {
  if (['success', 'warning', 'danger', 'info'].includes(tone)) return tone;
  return 'neutral';
}

function formatGoalSummary(progress, t) {
  if (!progress?.hasGoal) return t('journey.goalUnset');
  if (progress.remainingToday === 0) return t('journey.goalComplete');
  return t('journey.goalProgress', { practiced: progress.itemsPracticedToday, remaining: progress.remainingToday });
}

export default function TodayJourneyCard() {
  const navigate = useNavigate();
  const { t } = useShimeLanguage();
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

  function startSmartPractice(selection, label = t('study.smartPractice')) {
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
              label: t('study.dueReview'),
              dueCount: recommendation.dueCount
            }
          }
        });
        return;
      case RECOMMENDATION_TYPES.WEAK_MASTERY:
        startSmartPractice(weakPracticeSelection?.selectedCount ? weakPracticeSelection : smartPracticeSelection, t('overview.practiceWeak'));
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
        text: t('journey.stepCompleteNote')
      });
      return;
    }

    const result = markStudyPlanStepComplete(step.id, planProgressState?.dateKey);

    if (!result.ok) {
      setPlanStatus({ tone: 'danger', text: t('journey.saveFailed') });
      return;
    }

    setPlanStatus({ tone: 'success', text: t('journey.markedComplete') });
  }

  function resetTodayProgress() {
    if (!window.confirm(t('journey.resetConfirm'))) return;
    const result = resetStudyPlanProgressForDate(planProgressState?.dateKey);
    if (!result.ok) {
      setPlanStatus({ tone: 'danger', text: t('journey.resetFailed') });
      return;
    }
    setPlanStatus({ tone: 'success', text: t('journey.resetDone') });
  }

  function getVisibleStepStatus(step) {
    const status = planStepProgress.getStatus(step?.id);
    if (status === 'completed') return { label: t('journey.completed'), tone: 'success' };
    if (status === 'active') return { label: t('journey.active'), tone: 'warning' };
    return { label: t('journey.pending'), tone: 'neutral' };
  }

  function handleFeedback(feedbackType) {
    if (!recommendation?.type) return;
    const result = saveRecommendationFeedback({
      recommendationType: recommendation.type,
      feedback: feedbackType,
      reasonCode: 'daily_journey'
    });

    if (!result.ok) {
      setFeedbackStatus({ tone: 'danger', text: t('journey.feedbackFailed') });
      return;
    }

    setFeedbackStatus({
      tone: 'success',
      text: feedbackType === RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY
        ? t('journey.hiddenToday')
        : t('journey.feedbackSaved')
    });
  }

  const canRunRecommendation = recommendation.type === RECOMMENDATION_TYPES.LIBRARY_EMPTY
    || recommendation.type === RECOMMENDATION_TYPES.DUE_REVIEW
    || recommendation.type === RECOMMENDATION_TYPES.FIRST_SESSION
    || (recommendation.type === RECOMMENDATION_TYPES.WEAK_MASTERY
      ? Boolean((weakPracticeSelection?.selectedCount || smartPracticeSelection.selectedCount) > 0)
      : smartPracticeSelection.selectedCount > 0);

  return (
    <Card title={t('journey.title')} eyebrow={t('journey.eyebrow')} variant="elevated" className="dailyJourneyCard">
      <div className="dailyJourneyGrid">
        <section className="dailyJourneyPrimary" aria-labelledby="dailyJourneyRecommendationTitle">
          <div className="dailyJourneySectionHeader">
            <span>{t('journey.mainSuggestion')}</span>
            <Badge tone={recommendation.tone}>{getRecommendationBadgeText(recommendation.type, t)}</Badge>
          </div>
          <h3 id="dailyJourneyRecommendationTitle">{t('journey.stepTitle')}</h3>
          <p className="muted">{t('journey.stepBody')}</p>
          <p className="recommendationCard__explain">
            {t('journey.basis')}
          </p>
          <div className="dailyJourneyActions">
            <Button type="button" size="sm" onClick={runRecommendation} disabled={!canRunRecommendation}>
              {recommendation.type === RECOMMENDATION_TYPES.LIBRARY_EMPTY ? t('home.openLibrary') : recommendation.type === RECOMMENDATION_TYPES.DUE_REVIEW ? t('today.studyToday') : t('today.startStudy')}
            </Button>
            {recommendation.type === RECOMMENDATION_TYPES.WEAK_MASTERY && smartPracticeSelection.selectedCount > 0 ? (
              <Button type="button" size="sm" variant="ghost" onClick={() => startSmartPractice(smartPracticeSelection)}>
                {t('study.smartPractice')}
              </Button>
            ) : null}
          </div>
        </section>

        <section className="dailyJourneyGoal" aria-label={t('journey.todayGoal')}>
          <div className="dailyJourneySectionHeader">
            <span>{t('journey.todayGoal')}</span>
            {goalProgress.hasGoal ? <Badge tone={goalProgress.remainingToday === 0 ? 'success' : 'info'}>{goalProgress.progressPercent}%</Badge> : <Badge tone="neutral">{t('goal.unset')}</Badge>}
          </div>
          <p>{formatGoalSummary(goalProgress, t)}</p>
          {goalProgress.hasGoal ? (
            <ProgressBar value={goalProgress.progressPercent} label={t('goal.progressLabel')} />
          ) : null}
          <div className="dailyJourneyMeta" aria-label={t('journey.summary')}>
            <span>{t('journey.dueCount', { count: dueSummary.dueCount })}</span>
            <span>{t('journey.weakCount', { count: mastery?.weakItemCount || 0 })}</span>
          </div>
        </section>
      </div>

      <section className="dailyJourneyPlan" aria-labelledby="dailyJourneyPlanTitle">
        <div className="dailyJourneySectionHeader">
          <span id="dailyJourneyPlanTitle">{t('journey.planTitle')}</span>
          {planStepProgress.totalSteps > 0 ? (
            <Badge tone={planStepProgress.allCompleted ? 'success' : 'info'}>
              {t('journey.completedSteps', { completed: planStepProgress.completedCount, total: planStepProgress.totalSteps })}
            </Badge>
          ) : todayPlan.goalCompleted ? <Badge tone="success">{t('journey.goalComplete')}</Badge> : <Badge tone="info">{t('journey.proposed')}</Badge>}
        </div>

        {planStepProgress.allCompleted ? (
          <p className="studyPlanNotice" role="status">{t('journey.planComplete')}</p>
        ) : null}

        {!todayPlan.hasPlan ? (
          <p className="muted">{t('journey.noPlan')}</p>
        ) : (
          <div className="studyPlanList" aria-label={t('journey.stepsLabel')}>
            {todayPlan.steps.map((step, index) => {
              const visibleStatus = getVisibleStepStatus(step);
              const isCompleted = planStepProgress.getStatus(step?.id) === 'completed';
              return (
                <article className={`studyPlanStep ${isCompleted ? 'studyPlanStep--completed' : ''}`} key={step.id || `${step.type}-${index}`}>
                  <div className="studyPlanStep__marker" aria-hidden="true">{index + 1}</div>
                  <div className="studyPlanStep__body">
                    <div className="studyPlanStep__topline">
                      <span className="studyPlanStep__label">{t('journey.stepLabel', { number: index + 1 })}</span>
                      <Badge tone={visibleStatus.tone}>{visibleStatus.label}</Badge>
                      <Badge tone={getStepTone(step.tone)}>{getRecommendationBadgeText(recommendation.type, t)}</Badge>
                    </div>
                    <strong>{t('journey.stepTitle')}</strong>
                    <p className="muted">{t('journey.stepBody')}</p>
                    {step.estimatedItemCount > 0 ? <span className="studyPlanStep__count">{t('today.approxItems', { count: step.estimatedItemCount })}</span> : null}
                  </div>
                  <div className="studyPlanStep__action">
                    <Button type="button" size="sm" onClick={() => runStep(step)}>{step.type === 'import_data' ? t('home.openLibrary') : t('today.startStudy')}</Button>
                    <Button type="button" size="sm" variant="ghost" onClick={() => toggleStepComplete(step)}>
                      {isCompleted ? t('journey.completed') : t('journey.markComplete')}
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
              {t('journey.reset')}
            </Button>
          </div>
        ) : null}
      </section>

      {planStatus ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${planStatus.tone}`} role="status">
          {planStatus.text}
        </p>
      ) : null}

      <div className="recommendationFeedback" aria-label={t('journey.feedbackLabel')}>
        <span>{t('journey.feedback')}</span>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.HELPFUL)}>{t('journey.helpful')}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.NOT_RELEVANT)}>{t('journey.notRelevant')}</Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => handleFeedback(RECOMMENDATION_FEEDBACK_TYPES.HIDDEN_TODAY)}>{t('journey.hideToday')}</Button>
      </div>

      {feedbackStatus ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${feedbackStatus.tone}`} role="status">
          {feedbackStatus.text}
        </p>
      ) : null}

      {recommendation.hiddenFallback ? (
        <p className="historyPanelMessage" role="status">
          {t('journey.hiddenNotice')}
        </p>
      ) : null}

      {notices.hasDiscardedLocalData ? (
        <p className="historyPanelMessage" role="status">
          {t('journey.legacyNotice')}
        </p>
      ) : null}
    </Card>
  );
}
