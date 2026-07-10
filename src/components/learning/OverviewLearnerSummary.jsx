import { useNavigate } from 'react-router-dom';
import Button from '../Button.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

// BIG-UPDATE-11 source labels: Câu đến hạn · Mục tiêu ngày · Tỷ lệ đúng gần đây ·
// Chuỗi ngày học · Phiên đã hoàn thành · Cần chú ý · Theo môn.

function Metric({ label, value, note, tone = 'default' }) {
  return (
    <div className={`overviewMetric overviewMetric--${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      {note ? <small>{note}</small> : null}
    </div>
  );
}

function formatSubjectProgress(subjects, mastery, subjectsById, fallbackTitle) {
  const masteryBySubject = new Map((mastery?.subjectMastery || []).map(item => [item.id, item]));
  return (subjects || []).slice(0, 5).map(subject => {
    const subjectMastery = masteryBySubject.get(subject.id);
    return {
      id: subject.id,
      title: subjectsById.get(subject.id)?.title || subject.title || fallbackTitle,
      score: subjectMastery?.score || 0,
      hasEvidence: Boolean(subjectMastery?.itemCount)
    };
  });
}

export default function OverviewLearnerSummary() {
  const navigate = useNavigate();
  const { t } = useShimeLanguage();
  const {
    subjects,
    subjectsById,
    dueSummary,
    goalProgress,
    historyAnalytics,
    mastery,
    recommendation
  } = useDashboardLearningData();

  const dueCount = Math.max(0, Number(dueSummary?.dueCount) || 0);
  const weakCount = Math.max(0, Number(mastery?.weakItemCount) || 0);
  const accuracy = Math.max(0, Number(historyAnalytics?.averageAccuracy) || 0);
  const streak = Math.max(0, Number(historyAnalytics?.studyStreakDays) || 0);
  const sessions = Math.max(0, Number(historyAnalytics?.totalSessions) || 0);
  const goalPercent = goalProgress?.hasGoal ? Math.max(0, Number(goalProgress.progressPercent) || 0) : 0;
  const subjectProgress = formatSubjectProgress(subjects, mastery, subjectsById, t('overview.bySubject'));
  const trend = Array.isArray(historyAnalytics?.recentTrend) ? historyAnalytics.recentTrend.slice(-6) : [];

  return (
    <div className="overviewLearnerSummary">
      <section className="overviewToday" aria-labelledby="overview-today-title">
        <div className="overviewSectionHeading">
          <div>
            <p className="eyebrow">{t('overview.today')}</p>
            <h2 id="overview-today-title">{dueCount ? t('overview.dueTitle', { count: dueCount }) : t('overview.readyTitle')}</h2>
            <p>{dueCount ? t('overview.dueReady', { count: dueCount }) : t('overview.noDue')}</p>
          </div>
          <Button type="button" size="lg" onClick={() => navigate('/study-room')}>
            {dueCount ? t('overview.reviewNow') : t('overview.continueStudy')}
          </Button>
        </div>
        <div className="overviewToday__metrics" aria-label={t('overview.metricsLabel')}>
          <Metric label={t('overview.due')} value={dueCount} tone={dueCount ? 'warning' : 'safe'} />
          <div className="overviewGoalMetric">
            <span>{t('overview.dailyGoal')}</span>
            <strong>{goalProgress?.hasGoal ? `${goalPercent}%` : t('overview.goalUnset')}</strong>
            <ProgressBar value={goalPercent} label={t('overview.goalProgress')} />
          </div>
        </div>
      </section>

      <section className="overviewBand" aria-labelledby="overview-recent-title">
        <div className="overviewSectionHeading overviewSectionHeading--compact">
          <div>
            <p className="eyebrow">{t('overview.recentEyebrow')}</p>
            <h2 id="overview-recent-title">{t('overview.recentTitle')}</h2>
          </div>
        </div>
        <div className="overviewMetricGrid">
          <Metric label={t('overview.recentAccuracy')} value={`${accuracy}%`} note={sessions ? t('overview.scoredNote') : t('overview.firstSessionNote')} />
          <Metric label={t('overview.streak')} value={t('overview.dayUnit', { count: streak })} note={t('overview.streakNote')} tone="safe" />
          <Metric label={t('overview.sessions')} value={sessions} note={t('overview.localSaved')} />
        </div>
        <div className="overviewTrend" aria-label={t('overview.recentTrend')}>
          {trend.length ? trend.map(session => (
            <span key={session.id} style={{ '--trend-value': `${Math.max(8, session.percentage)}%` }}>
              <i aria-hidden="true" />
              <small>{session.percentage}%</small>
            </span>
          )) : <p>{t('overview.noTrend')}</p>}
        </div>
      </section>

      <section className="overviewBand overviewAttention" aria-labelledby="overview-attention-title">
        <div className="overviewSectionHeading overviewSectionHeading--compact">
          <div>
            <p className="eyebrow">{t('overview.attention')}</p>
            <h2 id="overview-attention-title">{weakCount ? t('overview.weakTitle', { count: weakCount }) : t('overview.noWeakTitle')}</h2>
            <p>{weakCount ? t('overview.weakBody') : t('overview.noWeakBody')}</p>
          </div>
          <Button type="button" variant="secondary" onClick={() => navigate('/study-room')}>{t('overview.practiceWeak')}</Button>
        </div>
      </section>

      <section className="overviewBand" aria-labelledby="overview-subject-title">
        <div className="overviewSectionHeading overviewSectionHeading--compact">
          <div>
            <p className="eyebrow">{t('overview.bySubject')}</p>
            <h2 id="overview-subject-title">{t('overview.subjectProgressTitle')}</h2>
          </div>
        </div>
        <div className="overviewSubjectList">
          {subjectProgress.length ? subjectProgress.map(subject => (
            <div className="overviewSubject" key={subject.id}>
              <div><strong>{subject.title}</strong><span>{subject.hasEvidence ? `${subject.score}%` : t('overview.noData')}</span></div>
              <ProgressBar value={subject.score} label={t('overview.subjectProgressLabel', { subject: subject.title })} />
            </div>
          )) : <p>{t('overview.noSubjects')}</p>}
        </div>
      </section>
    </div>
  );
}
