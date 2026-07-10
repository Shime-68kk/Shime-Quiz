import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import {
  DEFAULT_DAILY_ITEM_TARGET,
  STUDY_GOAL_FOCUS_MODES,
  clearStudyGoal,
  saveStudyGoal
} from '../../state/studyGoalStorage.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

function formatDate(value, locale, fallback) {
  if (!value) return fallback;
  try {
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'vi-VN', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`));
  } catch {
    return fallback;
  }
}

function getInitialForm(goal) {
  return {
    dailyItemTarget: goal?.dailyItemTarget || DEFAULT_DAILY_ITEM_TARGET,
    targetDate: goal?.targetDate || '',
    focusMode: goal?.focusMode || STUDY_GOAL_FOCUS_MODES.BALANCED
  };
}

export default function StudyGoalCard() {
  const navigate = useNavigate();
  const { locale, t } = useShimeLanguage();
  const focusModeLabels = {
    [STUDY_GOAL_FOCUS_MODES.BALANCED]: t('goal.balanced'),
    [STUDY_GOAL_FOCUS_MODES.DUE_REVIEW_FIRST]: t('goal.dueFirst'),
    [STUDY_GOAL_FOCUS_MODES.WEAK_AREAS_FIRST]: t('goal.weakFirst')
  };
  const { goalState, historyState, goalProgress: progress } = useDashboardLearningData();
  const goal = goalState.goal;
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState(() => getInitialForm(goal));
  const [status, setStatus] = useState(null);
  useEffect(() => {
    if (!isEditing) setForm(getInitialForm(goal));
  }, [goal, isEditing]);

  function startEditing() {
    setStatus(null);
    setForm(getInitialForm(goal));
    setIsEditing(true);
  }

  function cancelEditing() {
    setStatus(null);
    setForm(getInitialForm(goal));
    setIsEditing(false);
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = saveStudyGoal({
      dailyItemTarget: form.dailyItemTarget,
      targetDate: form.targetDate,
      focusMode: form.focusMode,
      isActive: true
    });

    if (!result.ok) {
      setStatus({ tone: 'danger', text: t('goal.saveFailed') });
      return;
    }

    setStatus({ tone: 'success', text: t('goal.saved') });
    setIsEditing(false);
  }

  function handleClear() {
    if (!window.confirm(t('goal.clearConfirm'))) return;
    const result = clearStudyGoal();
    if (!result.ok) {
      setStatus({ tone: 'danger', text: t('goal.clearFailed') });
      return;
    }
    setStatus({ tone: 'success', text: t('goal.cleared') });
    setIsEditing(false);
  }

  function startStudy() {
    navigate('/study-room');
  }

  return (
    <Card title={t('goal.title')} eyebrow={t('goal.eyebrow')} variant="elevated" className="studyGoalCard">
      {isEditing ? (
        <form className="studyGoalForm" onSubmit={handleSubmit}>
          <label className="studyGoalField">
            <span>{t('goal.today')}</span>
            <select
              value={form.dailyItemTarget}
              onChange={event => setForm(current => ({ ...current, dailyItemTarget: Number(event.target.value) }))}
            >
              {[10, 20, 30].map(value => <option key={value} value={value}>{t('goal.itemsPerDay', { count: value })}</option>)}
            </select>
          </label>

          <label className="studyGoalField">
            <span>{t('goal.targetDate')}</span>
            <input
              type="date"
              value={form.targetDate}
              onChange={event => setForm(current => ({ ...current, targetDate: event.target.value }))}
            />
          </label>

          <label className="studyGoalField">
            <span>{t('goal.focusMode')}</span>
            <select
              value={form.focusMode}
              onChange={event => setForm(current => ({ ...current, focusMode: event.target.value }))}
            >
              <option value={STUDY_GOAL_FOCUS_MODES.BALANCED}>{t('goal.balanced')}</option>
              <option value={STUDY_GOAL_FOCUS_MODES.DUE_REVIEW_FIRST}>{t('goal.dueFirst')}</option>
              <option value={STUDY_GOAL_FOCUS_MODES.WEAK_AREAS_FIRST}>{t('goal.weakFirst')}</option>
            </select>
          </label>

          <div className="studyGoalActions">
            <Button type="submit" size="sm">{t('goal.save')}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={cancelEditing}>{t('common.cancel')}</Button>
          </div>
        </form>
      ) : goal ? (
        <div className="studyGoalPanel">
          <div className="studyGoalSummary">
            <Badge tone="info">{focusModeLabels[goal.focusMode] || t('goal.balanced')}</Badge>
            <div>
              <strong>{t('goal.todayValue', { count: goal.dailyItemTarget })}</strong>
              <p className="muted">
                {t('goal.progressValue', { practiced: progress.itemsPracticedToday, remaining: progress.remainingToday })}
              </p>
            </div>
          </div>

          <ProgressBar value={progress.progressPercent} label={t('goal.progressLabel')} />

          <div className="studyGoalMetrics" aria-label={t('goal.summary')}>
            <div className="reviewScheduleMetric">
              <span>{t('goal.practiced')}</span>
              <strong>{progress.itemsPracticedToday}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>{t('goal.remaining')}</span>
              <strong>{progress.remainingToday}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>{t('goal.sessions')}</span>
              <strong>{progress.sessionsToday}</strong>
            </div>
          </div>

          <div className="studyGoalMeta">
            <span>{t('goal.targetDateValue', { date: formatDate(goal.targetDate, locale, t('goal.unset')) })}</span>
            {goal.targetDate ? (
              <span>
                {progress.daysRemaining >= 0
                  ? t('goal.daysRemaining', { count: progress.daysRemaining })
                  : t('goal.datePassed')}
              </span>
            ) : null}
            <span>{t('goal.focusValue', { mode: focusModeLabels[goal.focusMode] || t('goal.balanced') })}</span>
          </div>

          {progress.targetDateWarning ? (
            <p className="historyPanelMessage" role="status">{t('goal.datePassed')}</p>
          ) : null}

          <div className="studyGoalActions">
            <Button type="button" size="sm" onClick={startStudy}>{t('today.startStudy')}</Button>
            <Button type="button" size="sm" variant="ghost" onClick={startEditing}>{t('goal.edit')}</Button>
            <Button type="button" size="sm" variant="danger" onClick={handleClear}>{t('goal.clear')}</Button>
          </div>
        </div>
      ) : (
        <div className="studyGoalEmpty">
          <p className="muted">{t('goal.emptyBody')}</p>
          <Button type="button" size="sm" onClick={startEditing}>{t('goal.setup')}</Button>
        </div>
      )}

      {(goalState.discarded || historyState.discarded) ? (
        <p className="historyPanelMessage" role="status">
          {t('goal.legacyNotice')}
        </p>
      ) : null}

      {status ? (
        <p className={`recommendationFeedback__status recommendationFeedback__status--${status.tone}`} role="status">
          {status.text}
        </p>
      ) : null}
    </Card>
  );
}
