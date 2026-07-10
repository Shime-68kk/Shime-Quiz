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

function getFriendlyFeedback(percentage) {
  const pct = Number(percentage) || 0;
  if (pct >= 85) {
    return {
      status: 'Xuất sắc! 🏆',
      message: 'Bạn đã hoàn thành phiên học với kết quả cực kỳ ấn tượng. Các câu hỏi đã được ghi nhớ rất tốt.',
      tone: 'success'
    };
  } else if (pct >= 60) {
    return {
      status: 'Khá tốt! 🌱',
      message: 'Bạn đang đi đúng hướng. Ôn tập thêm một chút nữa sẽ giúp bạn ghi nhớ sâu sắc hơn.',
      tone: 'info'
    };
  } else {
    return {
      status: 'Cố gắng lên! 📚',
      message: 'Đừng nản chí! Luyện tập thường xuyên là chìa khóa để cải thiện điểm số và trí nhớ.',
      tone: 'warning'
    };
  }
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
            <aside className="historyDetail" aria-label="Chi tiết lịch sử học" style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)',
              borderRadius: '16px',
              padding: '20px',
              boxShadow: 'var(--glass-shadow)'
            }}>
              <div className="historyDetail__header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <Badge tone="success">Phiên học hoàn tất</Badge>
                  <h3 style={{ margin: '8px 0 4px', fontSize: '1.25rem' }}>{formatDateTime(selectedRecord.completedAt)}</h3>
                  <p className="muted" style={{ margin: 0 }}>
                    Thời gian học: {formatDuration(selectedRecord.durationSeconds)} · Tổng số {selectedRecord.totalItems} câu hỏi.
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId('')}>Đóng</Button>
              </div>

              {/* Friendly Human Summary */}
              <div className="friendlySummary" style={{
                padding: '16px',
                borderRadius: '12px',
                background: 'var(--color-primary-soft)',
                border: '1px solid var(--glass-border)',
                marginBottom: '20px'
              }}>
                <h4 style={{ margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text)', fontSize: '1.02rem' }}>
                  Hiệu quả: <strong style={{ color: 'var(--brand-dark)' }}>{getFriendlyFeedback(selectedRecord.percentage).status}</strong>
                </h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text)', lineHeight: '1.4' }}>
                  {getFriendlyFeedback(selectedRecord.percentage).message}
                </p>
              </div>

              {/* Technical Details Toggle */}
              <details className="technicalDetails" style={{
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                background: 'rgba(0,0,0,0.02)',
                overflow: 'hidden'
              }}>
                <summary className="technicalDetailsSummary" style={{
                  padding: '12px 16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  userSelect: 'none',
                  background: 'var(--color-primary-soft)',
                  borderBottom: '1px solid var(--glass-border)',
                  color: 'var(--color-text)'
                }}>
                  Xem thông số và nội dung câu hỏi
                </summary>
                
                <div style={{ padding: '16px' }}>
                  <div className="historyMetrics historyMetrics--detail" style={{ marginBottom: '16px' }}>
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
                </div>
              </details>
            </aside>
          ) : null}
        </div>
      )}
    </Card>
  );
}
