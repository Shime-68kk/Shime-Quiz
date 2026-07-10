import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';

import { readStudyHistory } from '../../state/studyHistoryStorage.js';
import { computeHistoryAnalytics } from '../../analytics/historyAnalytics.js';
import { readReviewSchedule } from '../../state/reviewScheduleStorage.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

const statusTone = {
  correct: 'success',
  wrong: 'danger',
  unanswered: 'warning',
  reviewed_flashcard: 'info',
  unscored: 'neutral'
};

function SummaryMetric({ label, value, hint }) {
  return (
    <div className="resultMetric">
      <span>{label}</span>
      <strong>{value}</strong>
      {hint ? <small>{hint}</small> : null}
    </div>
  );
}

export default function StudyResultSummary({ summary, persistenceNote = '', historyMessage = '', onRestart, onContinue, onGoToLibrary, onGoToDashboard }) {
  const { t } = useShimeLanguage();
  if (!summary) return null;

  const statusLabels = {
    correct: t('study.correct'),
    wrong: t('study.wrong'),
    unanswered: t('study.unanswered'),
    reviewed_flashcard: t('study.reviewedFlashcards'),
    unscored: t('study.unscored')
  };
  const typeLabels = {
    multiple_choice: t('library.multipleChoice'),
    short_answer: t('library.shortAnswer'),
    flashcard: t('library.flashcard')
  };

  const history = readStudyHistory();
  const analytics = computeHistoryAnalytics(history?.records || []);
  const streak = analytics.studyStreakDays || 0;

  const schedule = readReviewSchedule();
  const now = Date.now();
  const next24h = now + 24 * 60 * 60 * 1000;
  const nextDueCount = (schedule.records || []).filter(r => {
    const dueTime = new Date(r.dueAt).getTime();
    return dueTime > now && dueTime <= next24h;
  }).length;

  return (
    <div className="studyResultStack">
      <Card
        className="studyResultHero phase37uil-streak-fire-ignition-micro-moment-pilot"
        data-phase37uil-streak-fire-ignition="session-complete-summary"
        variant="elevated"
      >
        <div className="studyResultHero__header">
          <div>
            <Badge tone="success">{t('study.resultTitle')}</Badge>
            <h2>{t('study.resultTitle')}</h2>
            <p>
              {persistenceNote || t('study.resultLocalBody')}
            </p>
          </div>
          <div className="studyResultHero__score" aria-label={t('study.accuracyLabel', { value: summary.accuracy })}>
            <strong>{summary.accuracy}%</strong>
            <span>{t('study.accuracy')}</span>
          </div>
        </div>

        <div className="resultDelightRow">
          {streak > 0 && (
            <div className="delightBadge delightBadge--streak">
              {t('study.streakResult', { count: streak })}
            </div>
          )}
          {nextDueCount > 0 ? (
            <div className="delightBadge delightBadge--calendar">
              {t('study.nextDue', { count: nextDueCount })}
            </div>
          ) : (
            <div className="delightBadge delightBadge--safe">
              {t('study.noNextDue')}
            </div>
          )}
        </div>

        {historyMessage ? <p className="studyHistorySaveMessage" role="status">{historyMessage}</p> : null}

        <ProgressBar value={summary.accuracy} label={t('study.accuracyLabel', { value: summary.accuracy })} />

        <div className="resultMetricGrid" aria-label={t('study.sessionStats')}>
          <SummaryMetric label={t('study.totalItems')} value={summary.totalItems} />
          <SummaryMetric label={t('study.answered')} value={summary.answeredCount} />
          <SummaryMetric label={t('study.correct')} value={summary.correctCount} />
          <SummaryMetric label={t('study.wrong')} value={summary.wrongCount} />
          <SummaryMetric label={t('study.unanswered')} value={summary.unansweredCount} />
          <SummaryMetric label={t('study.accuracy')} value={`${summary.accuracy}%`} hint={summary.scoredTotal ? t('study.scoredItems', { count: summary.scoredTotal }) : t('study.noScoredItems')} />
          <SummaryMetric label={t('study.reviewedFlashcards')} value={summary.flashcardReviewedCount} />
          <SummaryMetric label={t('study.unscored')} value={summary.unscoredCount} />
        </div>

        <div className="studyActions studyActions--result">
          <Button type="button" onClick={onRestart}>{t('study.restart')}</Button>
          <Button type="button" variant="secondary" onClick={onContinue}>{t('study.continueStudy')}</Button>
          <Button type="button" variant="ghost" onClick={onGoToLibrary}>{t('study.backLibrary')}</Button>
          <Button type="button" variant="ghost" onClick={onGoToDashboard}>{t('study.backOverview')}</Button>
        </div>
      </Card>

      <Card title={t('study.itemDetails')} variant="elevated">
        <div className="resultDetailList">
          {summary.visibleDetails.map(detail => (
            <details className="resultDetail" key={detail.id}>
              <summary>
                <span>{detail.index + 1}. {detail.prompt}</span>
                <Badge tone={statusTone[detail.status] || 'neutral'}>{statusLabels[detail.status] || detail.statusLabel}</Badge>
              </summary>
              <div className="resultDetail__body">
                <p><strong>{t('study.type')}</strong> {typeLabels[detail.type] || detail.typeLabel}</p>
                {detail.userAnswer ? <p><strong>{t('study.yourAnswer')}:</strong> {detail.userAnswer}</p> : null}
                {detail.correctAnswer ? <p><strong>{t('library.correctAnswerLabel')}</strong> {detail.correctAnswer}</p> : null}
                <p><strong>{t('study.status')}</strong> {statusLabels[detail.status] || detail.statusLabel}</p>
                {detail.explanation ? <p><strong>{t('study.explanation')}</strong> {detail.explanation}</p> : null}
              </div>
            </details>
          ))}
        </div>
        {summary.hiddenDetailCount ? (
          <p className="muted">{t('study.hiddenDetails', { count: summary.hiddenDetailCount })}</p>
        ) : null}
      </Card>
    </div>
  );
}
