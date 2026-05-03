import { useEffect, useMemo, useState } from 'react';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import EmptyState from '../EmptyState.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import { resolveHistoryRecordDetails } from '../../history/historyDetailResolver.js';
import { clearStudyHistory } from '../../state/studyHistoryStorage.js';

function formatDateTime(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

function formatDuration(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  if (minutes <= 0) return `${remainder} giây`;
  return `${minutes} phút ${remainder} giây`;
}

function HistoryMetric({ label, value }) {
  return (
    <span className="historyMetric">
      <small>{label}</small>
      <strong>{value}</strong>
    </span>
  );
}

export default function StudyHistoryPanel({ compact = false }) {
  const { historyState, items, topicsById, subjectsById } = useDashboardLearningData();
  const [selectedId, setSelectedId] = useState('');
  const [message, setMessage] = useState(historyState.discarded ? 'Lịch sử cũ bị lỗi nên đã được xóa an toàn.' : '');
  const records = historyState.records || [];
  const selectedRecord = useMemo(
    () => records.find(record => record.id === selectedId) || null,
    [records, selectedId]
  );
  const selectedDetails = useMemo(
    () => selectedRecord
      ? resolveHistoryRecordDetails(selectedRecord, { items, topicsById, subjectsById })
      : [],
    [selectedRecord, items, topicsById, subjectsById]
  );

  useEffect(() => {
    if (selectedId && !records.some(record => record.id === selectedId)) {
      setSelectedId('');
    }
  }, [records, selectedId]);

  function handleClearHistory() {
    if (!records.length) return;
    if (!window.confirm('Xóa lịch sử học? Thao tác này chỉ xóa lịch sử Phòng học v2, không xóa thư viện hoặc bản nháp.')) {
      return;
    }

    const result = clearStudyHistory();
    setSelectedId('');
    setMessage(result.ok ? 'Đã xóa lịch sử học.' : 'Không thể xóa lịch sử học trên thiết bị này.');
  }

  return (
    <Card title="Lịch sử học" eyebrow="Phòng học v2" variant={compact ? 'default' : 'elevated'}>
      <div className="historyPanelHeader">
        <div>
          <p className="muted">Phiên học gần đây được lưu cục bộ trên thiết bị này.</p>
          {message ? <p className="historyPanelMessage" role="status">{message}</p> : null}
        </div>
        {records.length ? (
          <Button type="button" variant="danger" size="sm" onClick={handleClearHistory}>Xóa lịch sử</Button>
        ) : null}
      </div>

      {!records.length ? (
        <EmptyState
          icon="◌"
          title="Chưa có lịch sử học"
          description="Hoàn thành một phiên học trong Phòng học để xem tóm tắt tại đây."
        />
      ) : (
        <div className="historyPanelGrid">
          <div className="historyList" aria-label="Phiên học gần đây">
            {records.slice(0, compact ? 3 : 6).map(record => (
              <article className="historyCard" key={record.id}>
                <div className="historyCard__topline">
                  <Badge tone="info">Phiên học gần đây</Badge>
                  <span>{formatDateTime(record.completedAt)}</span>
                </div>
                <div className="historyMetrics" aria-label="Tóm tắt phiên học">
                  <HistoryMetric label="Đúng" value={record.correctCount} />
                  <HistoryMetric label="Sai" value={record.wrongCount} />
                  <HistoryMetric label="Chưa trả lời" value={record.unansweredCount} />
                  <HistoryMetric label="Tỷ lệ đúng" value={`${record.percentage}%`} />
                </div>
                <p className="muted">{record.totalItems} mục · {formatDuration(record.durationSeconds)}</p>
                <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedId(record.id)}>
                  Xem chi tiết
                </Button>
              </article>
            ))}
          </div>

          {selectedRecord ? (
            <aside className="historyDetail" aria-label="Chi tiết lịch sử học">
              <div className="historyDetail__header">
                <div>
                  <Badge tone="success">Chi tiết phiên học</Badge>
                  <h3>{formatDateTime(selectedRecord.completedAt)}</h3>
                  <p className="muted">{selectedRecord.totalItems} mục · {formatDuration(selectedRecord.durationSeconds)}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId('')}>Đóng</Button>
              </div>

              <div className="historyMetrics historyMetrics--detail">
                <HistoryMetric label="Đúng" value={selectedRecord.correctCount} />
                <HistoryMetric label="Sai" value={selectedRecord.wrongCount} />
                <HistoryMetric label="Chưa trả lời" value={selectedRecord.unansweredCount} />
                <HistoryMetric label="Không chấm điểm" value={selectedRecord.unscoredCount} />
                <HistoryMetric label="Thẻ đã xem" value={selectedRecord.flashcardReviewedCount} />
                <HistoryMetric label="Tỷ lệ đúng" value={`${selectedRecord.percentage}%`} />
              </div>

              <div className="historyItemResults">
                {selectedDetails.slice(0, 25).map((item, index) => (
                  <details className="historyItemResult" key={`${item.itemId}-${index}`}>
                    <summary>
                      <span>{index + 1}. {item.prompt}</span>
                      <Badge tone={item.statusTone}>{item.statusLabel}</Badge>
                    </summary>
                    <div className="historyItemResult__body">
                      <p><strong>Loại:</strong> {item.typeLabel}</p>
                      {item.topicLabel ? <p><strong>Chủ đề:</strong> {item.topicLabel}</p> : null}
                      {item.itemMissing ? <p className="historyItemResult__warning">{item.missingMessage}</p> : null}
                      {item.userAnswer ? <p><strong>Câu trả lời của bạn:</strong> {item.userAnswer}</p> : null}
                      {item.correctAnswer ? <p><strong>Đáp án đúng:</strong> {item.correctAnswer}</p> : null}
                      <p><strong>Trạng thái:</strong> {item.statusLabel}</p>
                    </div>
                  </details>
                ))}
              </div>
            </aside>
          ) : null}
        </div>
      )}
    </Card>
  );
}
