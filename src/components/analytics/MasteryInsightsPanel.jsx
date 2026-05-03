import Badge from '../Badge.jsx';
import Card from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';
import ProgressBar from '../ProgressBar.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';

function getScoreTone(score) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'danger';
}

function TopicLabel({ topic, topicsById, subjectsById }) {
  const topicMeta = topicsById.get(topic.topicId || topic.id);
  const subjectMeta = subjectsById.get(topic.subjectId || topicMeta?.subjectId);
  const topicLabel = topicMeta?.title || topic.topicId || topic.id || 'Chủ đề không rõ';
  const subjectLabel = subjectMeta?.title || topic.subjectId || '';

  return (
    <span>
      <strong>{topicLabel}</strong>
      {subjectLabel ? <small>{subjectLabel}</small> : null}
    </span>
  );
}

function TopicMasteryList({ title, emptyText, topics, topicsById, subjectsById, mode }) {
  return (
    <Card title={title} eyebrow="Mức nắm vững v2">
      {!topics.length ? (
        <p className="muted">{emptyText}</p>
      ) : (
        <div className="masteryTopicList">
          {topics.map(topic => (
            <article className="masteryTopicItem" key={`${mode}-${topic.topicId || topic.id}`}>
              <TopicLabel topic={topic} topicsById={topicsById} subjectsById={subjectsById} />
              <div className="masteryTopicItem__score">
                <Badge tone={getScoreTone(topic.score)}>{topic.score}%</Badge>
                <small>
                  {topic.itemCount} mục · {topic.weakItemCount} cần luyện
                </small>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}

function WeakItemList({ items, topicsById }) {
  return (
    <Card title="Câu cần củng cố" eyebrow="Mức nắm vững từng mục">
      {!items.length ? (
        <p className="muted">Chưa có câu nào ở mức cần củng cố.</p>
      ) : (
        <div className="masteryWeakItemList">
          {items.map(item => {
            const topic = topicsById.get(item.topicId);
            return (
              <article className="masteryWeakItem" key={item.itemId}>
                <div>
                  <strong>{item.prompt || 'Câu hỏi không có nội dung'}</strong>
                  <small>{topic?.title || item.topicId || 'Chủ đề không rõ'}</small>
                </div>
                <div className="masteryWeakItem__meta">
                  <Badge tone={getScoreTone(item.score)}>{item.score}%</Badge>
                  <small>{item.wrongCount} sai · {item.correctCount} đúng</small>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}

export default function MasteryInsightsPanel() {
  const { mastery, historyState: history, scheduleState: schedule, subjectsById, topicsById } = useDashboardLearningData();

  if (!mastery.hasMasteryData) {
    return (
      <Card title="Mức độ nắm vững" eyebrow="Mức nắm vững v2" variant="elevated">
        <EmptyState
          icon="◍"
          title="Chưa đủ dữ liệu để tính mức độ nắm vững"
          description="Hoàn thành vài phiên học để xem đánh giá."
        />
      </Card>
    );
  }

  return (
    <section className="masterySection" aria-label="Mức độ nắm vững">
      <Card title="Mức độ nắm vững" eyebrow="Mức nắm vững v2" variant="elevated">
        <div className="masteryOverview">
          <div>
            <Badge tone={getScoreTone(mastery.averageMastery)}>Đánh giá cơ bản</Badge>
            <strong className="metric">{mastery.averageMastery}%</strong>
            <p className="muted">
              Tính từ lịch sử học và lịch ôn cục bộ. Đây là mô hình đơn giản, không phải AI.
            </p>
          </div>
          <ProgressBar value={mastery.averageMastery} label="Mức độ nắm vững trung bình" />
        </div>
      </Card>

      <div className="cardGrid cardGrid--three" aria-label="Tóm tắt mức độ nắm vững">
        <Card title="Mục đã có dữ liệu" eyebrow="Mức nắm vững v2">
          <Badge tone="info">Có bằng chứng</Badge>
          <strong className="metric">{mastery.evidenceItemCount}</strong>
          <p className="muted">Trong tổng số {mastery.itemCount} mục trong thư viện hiện tại.</p>
        </Card>
        <Card title="Tỷ lệ đúng lịch sử" eyebrow="Mức nắm vững v2">
          <Badge tone={getScoreTone(mastery.correctRate)}>{mastery.correctRate}%</Badge>
          <strong className="metric">{mastery.correctRate}%</strong>
          <p className="muted">Chỉ tính các câu có chấm đúng/sai.</p>
        </Card>
        <Card title="Mục cần củng cố" eyebrow="Mức nắm vững v2">
          <Badge tone={mastery.weakItemCount ? 'warning' : 'success'}>{mastery.weakItemCount} mục</Badge>
          <strong className="metric">{mastery.weakItemCount}</strong>
          <p className="muted">Các mục có điểm nắm vững dưới 60%.</p>
        </Card>
      </div>

      <div className="cardGrid cardGrid--two" aria-label="Mức độ nắm vững theo chủ đề">
        <TopicMasteryList
          title="Chủ đề cần luyện thêm"
          emptyText="Chưa xác định chủ đề yếu từ dữ liệu hiện tại."
          topics={mastery.weakTopics}
          topicsById={topicsById}
          subjectsById={subjectsById}
          mode="weak"
        />
        <TopicMasteryList
          title="Chủ đề mạnh"
          emptyText="Cần thêm câu trả lời đúng ổn định để xác định chủ đề mạnh."
          topics={mastery.strongTopics}
          topicsById={topicsById}
          subjectsById={subjectsById}
          mode="strong"
        />
      </div>

      <WeakItemList items={mastery.weakItems} topicsById={topicsById} />

      {(history.discarded || schedule.discarded) ? (
        <p className="historyPanelMessage" role="status">
          Một phần dữ liệu lịch sử hoặc lịch ôn cũ bị lỗi nên đã được bỏ qua an toàn.
        </p>
      ) : null}
    </section>
  );
}
