import Badge from '../Badge.jsx';
import Card from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';

function formatDate(value) {
  if (!value) return 'Chưa có';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return 'Chưa có';
  }
}

function formatShortDate(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function AnalyticsMetricCard({ label, value, note, tone = 'info', progress }) {
  return (
    <Card title={label} eyebrow="Thống kê" variant="elevated">
      <Badge tone={tone}>{label}</Badge>
      <strong className="metric">{value}</strong>
      {note ? <p className="muted">{note}</p> : null}
      {typeof progress === 'number' ? (
        <div className="dashboardProgress">
          <ProgressBar value={progress} label={label} />
        </div>
      ) : null}
    </Card>
  );
}

function TopicName({ topic, topicsById, subjectsById }) {
  const topicMeta = topicsById.get(topic.topicId);
  const subjectMeta = subjectsById.get(topic.subjectId || topicMeta?.subjectId);
  const label = topicMeta?.title || topic.topicId || 'Chủ đề không rõ';
  const subjectLabel = subjectMeta?.title || topic.subjectId || '';

  return (
    <span>
      <strong>{label}</strong>
      {subjectLabel ? <small>{subjectLabel}</small> : null}
    </span>
  );
}

function TopicSummaryList({ title, emptyDescription, topics, topicsById, subjectsById, mode }) {
  return (
    <Card title={title} eyebrow="Theo chủ đề">
      {!topics.length ? (
        <p className="muted">{emptyDescription}</p>
      ) : (
        <div className="analyticsTopicList">
          {topics.map(topic => (
            <article className="analyticsTopicItem" key={`${mode}-${topic.topicId}`}>
              <TopicName topic={topic} topicsById={topicsById} subjectsById={subjectsById} />
              <div className="analyticsTopicItem__metrics">
                <Badge tone={mode === 'weak' ? 'warning' : 'success'}>
                  {mode === 'weak' ? `${topic.wrongCount} sai` : `${topic.accuracy}% đúng`}
                </Badge>
                <small>{topic.practicedCount} mục đã luyện</small>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

export default function HistoryAnalyticsPanel() {
  const { historyState, historyAnalytics: analytics, subjectsById, topicsById } = useDashboardLearningData();

  if (!analytics.hasHistory) {
    return (
      <Card title="Thống kê học tập" eyebrow="Phòng học v2" variant="elevated">
        <EmptyState
          icon="◌"
          title="Chưa có dữ liệu thống kê"
          description="Hoàn thành một phiên học để xem thống kê."
        />
      </Card>
    );
  }

  return (
    <section className="analyticsSection" aria-label="Thống kê học tập">
      <div className="cardGrid cardGrid--three" aria-label="Tóm tắt thống kê học tập">
        <AnalyticsMetricCard
          label="Tổng phiên học"
          value={analytics.totalSessions}
          note="Số phiên Phòng học đã hoàn thành."
          tone="info"
          progress={Math.min(100, analytics.totalSessions * 20)}
        />
        <AnalyticsMetricCard
          label="Số mục đã luyện"
          value={analytics.totalItemsPracticed}
          note={`${analytics.totalCorrect} đúng · ${analytics.totalWrong} sai · ${analytics.totalUnanswered} chưa trả lời`}
          tone="success"
          progress={Math.min(100, analytics.totalItemsPracticed * 8)}
        />
        <AnalyticsMetricCard
          label="Tỷ lệ đúng trung bình"
          value={`${analytics.averageAccuracy}%`}
          note="Tính trên các mục có chấm đúng/sai."
          tone="warning"
          progress={analytics.averageAccuracy}
        />
        <AnalyticsMetricCard
          label="Phiên tốt nhất"
          value={`${analytics.bestSessionAccuracy}%`}
          note="Tỷ lệ đúng cao nhất trong một phiên."
          tone="success"
          progress={analytics.bestSessionAccuracy}
        />
        <AnalyticsMetricCard
          label="Thẻ ghi nhớ đã xem"
          value={analytics.flashcardsReviewed}
          note="Flashcard được tính riêng, không cộng vào đúng/sai."
          tone="info"
          progress={Math.min(100, analytics.flashcardsReviewed * 12)}
        />
        <AnalyticsMetricCard
          label="Chuỗi ngày học"
          value={`${analytics.studyStreakDays} ngày`}
          note={`Lần học gần nhất: ${formatDate(analytics.lastStudiedAt)}`}
          tone="neutral"
          progress={Math.min(100, analytics.studyStreakDays * 25)}
        />
      </div>

      <Card title="Xu hướng phiên gần đây" eyebrow="7–8 phiên mới nhất" variant="elevated">
        <div className="analyticsTrendList" aria-label="Xu hướng phiên gần đây">
          {analytics.recentTrend.map(session => (
            <div className="analyticsTrendItem" key={session.id}>
              <span className="analyticsTrendItem__date">{formatShortDate(session.completedAt)}</span>
              <div className="analyticsTrendItem__barWrap" aria-hidden="true">
                <span className="analyticsTrendItem__bar" style={{ inlineSize: `${session.percentage}%` }} />
              </div>
              <strong>{session.percentage}%</strong>
              <small>{session.correctCount} đúng · {session.wrongCount} sai</small>
            </div>
          ))}
        </div>
      </Card>

      <div className="cardGrid cardGrid--two" aria-label="Thống kê theo chủ đề">
        <TopicSummaryList
          title="Chủ đề cần luyện thêm"
          emptyDescription="Chưa có chủ đề nào có câu sai."
          topics={analytics.weakestTopics}
          topicsById={topicsById}
          subjectsById={subjectsById}
          mode="weak"
        />
        <TopicSummaryList
          title="Chủ đề làm tốt"
          emptyDescription="Cần thêm phiên có chấm điểm để xác định chủ đề làm tốt."
          topics={analytics.strongestTopics}
          topicsById={topicsById}
          subjectsById={subjectsById}
          mode="strong"
        />
      </div>
    </section>
  );
}
