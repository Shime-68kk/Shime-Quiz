import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';

function formatDateTime(value) {
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

export default function ReviewSchedulePanel() {
  const navigate = useNavigate();
  const { scheduleState, scheduleSummary, dueSummary } = useDashboardLearningData();
  const hasScheduledItems = scheduleSummary.totalScheduled > 0;
  const hasDueItems = dueSummary.dueCount > 0;

  function startDueReview() {
    if (!hasDueItems) return;
    navigate('/study-room', {
      state: {
        selection: {
          mode: 'due-review',
          source: 'review-schedule',
          label: 'Ôn tập hôm nay',
          dueCount: dueSummary.dueCount
        }
      }
    });
  }

  return (
    <Card title="Lịch ôn tập cục bộ" eyebrow="Lịch ôn v2" variant="elevated">
      {!hasScheduledItems ? (
        <EmptyState
          icon="↻"
          title="Chưa có câu cần ôn"
          description="Hoàn thành một phiên học có câu đúng/sai để tạo lịch ôn tập cục bộ."
        />
      ) : (
        <div className="reviewSchedulePanel">
          <div className="reviewScheduleSummary" aria-label="Tóm tắt lịch ôn tập">
            <div className="reviewScheduleMetric">
              <span>Câu đến hạn</span>
              <strong>{dueSummary.dueCount}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>Lần ôn tiếp theo</span>
              <strong>{formatDateTime(dueSummary.nextDueAt || scheduleSummary.nextDueAt)}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>Tổng câu đã lên lịch</span>
              <strong>{scheduleSummary.totalScheduled}</strong>
            </div>
          </div>

          <div className="reviewScheduleActions">
            <Button type="button" size="sm" onClick={startDueReview} disabled={!hasDueItems}>
              Ôn tập hôm nay
            </Button>
            <p className="muted">
              {hasDueItems
                ? 'Bắt đầu phiên chỉ gồm các câu đến hạn trong thư viện hiện tại.'
                : 'Không có câu cần ôn hôm nay.'}
            </p>
          </div>

          {hasDueItems ? (
            <div className="reviewDueList" aria-label="Một số câu đến hạn">
              {dueSummary.dueEntries.slice(0, 5).map(({ item, record }) => (
                <span className="reviewDueItem" key={record.itemId}>
                  <Badge tone="warning">Đến hạn</Badge>
                  <span>{item.prompt || record.itemId}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="muted">Không có câu cần ôn hôm nay.</p>
          )}

          {dueSummary.missingDueCount > 0 ? (
            <p className="historyPanelMessage" role="status">
              Một số câu trong lịch ôn không còn trong thư viện hiện tại nên đã được bỏ qua.
            </p>
          ) : null}

          {scheduleState.discarded ? (
            <p className="historyPanelMessage" role="status">Lịch ôn tập cũ bị lỗi nên đã được xóa an toàn.</p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
