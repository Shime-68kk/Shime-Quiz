import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';

export default function SmartPracticePanel() {
  const navigate = useNavigate();
  const { items: allItems, smartPracticeSelection: selection, historyState: history, scheduleState: schedule } = useDashboardLearningData();
  const hasItems = allItems.length > 0;
  const canStart = selection.selectedCount > 0;

  function startSmartPractice() {
    if (!canStart) return;
    navigate('/study-room', {
      state: {
        selection: {
          mode: 'smart-practice',
          source: 'weighted-practice',
          label: 'Luyện tập thông minh',
          requestedCount: selection.requestedCount,
          selectedItemIds: selection.selectedItemIds
        }
      }
    });
  }

  return (
    <Card title="Luyện tập thông minh" eyebrow="Luyện tập có trọng số v2" variant="elevated">
      {!hasItems ? (
        <EmptyState
          icon="◇"
          title="Chưa có học liệu để luyện"
          description="Nạp hoặc tạo thư viện v2 trước khi bắt đầu luyện tập thông minh."
        />
      ) : (
        <div className="smartPracticePanel">
          <p className="muted">Ưu tiên câu đến hạn, câu từng sai và câu chưa luyện.</p>

          <div className="smartPracticeSummary" aria-label="Tóm tắt luyện tập thông minh">
            <div className="reviewScheduleMetric">
              <span>Số câu đề xuất</span>
              <strong>{selection.selectedCount}</strong>
            </div>
            <div className="reviewScheduleMetric">
              <span>Tổng ứng viên</span>
              <strong>{selection.candidateCount}</strong>
            </div>
          </div>

          <div className="smartPracticeActions">
            <Button type="button" size="sm" onClick={startSmartPractice} disabled={!canStart}>
              Luyện tập thông minh
            </Button>
            <p className="muted">
              {canStart
                ? `Phiên này chọn tối đa ${selection.requestedCount} câu phù hợp từ thư viện hiện tại.`
                : 'Không có câu phù hợp để luyện lúc này.'}
            </p>
          </div>

          {selection.selectedEntries.length ? (
            <div className="smartPracticeReasons" aria-label="Một số câu được ưu tiên">
              {selection.selectedEntries.slice(0, 5).map(entry => (
                <span className="reviewDueItem" key={entry.itemId}>
                  <Badge tone={entry.due ? 'warning' : entry.wrongCount ? 'danger' : 'info'}>
                    Điểm {entry.weight}
                  </Badge>
                  <span>{entry.item.prompt}</span>
                </span>
              ))}
            </div>
          ) : null}

          {(history.discarded || schedule.discarded) ? (
            <p className="historyPanelMessage" role="status">
              Dữ liệu lịch sử hoặc lịch ôn cũ bị lỗi nên đã được bỏ qua an toàn.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
