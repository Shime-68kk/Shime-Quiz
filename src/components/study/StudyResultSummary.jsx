import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';

import { readStudyHistory } from '../../state/studyHistoryStorage.js';
import { computeHistoryAnalytics } from '../../analytics/historyAnalytics.js';
import { readReviewSchedule } from '../../state/reviewScheduleStorage.js';

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
  if (!summary) return null;

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
            <Badge tone="success">Tổng kết phiên học</Badge>
            <h2>Tổng kết phiên học</h2>
            <p>
              {persistenceNote || 'Kết quả học tập được xử lý cục bộ trên trình duyệt này. Lịch sử học và lịch ôn tập sẽ được cập nhật khi phiên học hoàn tất thành công.'}
            </p>
          </div>
          <div className="studyResultHero__score" aria-label={`Tỷ lệ đúng ${summary.accuracy}%`}>
            <strong>{summary.accuracy}%</strong>
            <span>Tỷ lệ đúng</span>
          </div>
        </div>

        <div className="resultDelightRow" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {streak > 0 && (
            <div className="delightBadge delightBadge--streak" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #ff9f43, #ff5252)', color: '#fff', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(255, 82, 82, 0.25)', animation: 'tourPulseStrong 1.5s infinite' }}>
              <span style={{ fontSize: '1.2rem' }}>🔥</span> Chuỗi học tập: {streak} ngày liên tiếp
            </div>
          )}
          {nextDueCount > 0 ? (
            <div className="delightBadge delightBadge--calendar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #475569, #1e293b)', border: '1px solid rgba(255,255,255,0.08)', color: '#dbe7ff', fontWeight: '600', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <span>📅</span> {nextDueCount} câu tiếp theo đến hạn trong 24 giờ tới
            </div>
          ) : (
            <div className="delightBadge delightBadge--calendar" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '999px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontWeight: '600', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)' }}>
              <span>✓</span> Tuyệt vời! Bạn không còn câu nào đến hạn trong 24 giờ tới
            </div>
          )}
        </div>

        {historyMessage ? <p className="studyHistorySaveMessage" role="status">{historyMessage}</p> : null}

        <ProgressBar value={summary.accuracy} label={`Tỷ lệ đúng ${summary.accuracy}%`} />

        <div className="resultMetricGrid" aria-label="Thống kê phiên học">
          <SummaryMetric label="Tổng số mục" value={summary.totalItems} />
          <SummaryMetric label="Đã trả lời" value={summary.answeredCount} />
          <SummaryMetric label="Đúng" value={summary.correctCount} />
          <SummaryMetric label="Sai" value={summary.wrongCount} />
          <SummaryMetric label="Chưa trả lời" value={summary.unansweredCount} />
          <SummaryMetric label="Tỷ lệ đúng" value={`${summary.accuracy}%`} hint={summary.scoredTotal ? `${summary.scoredTotal} mục có chấm điểm` : 'Chưa có mục được chấm'} />
          <SummaryMetric label="Thẻ ghi nhớ đã xem" value={summary.flashcardReviewedCount} />
          <SummaryMetric label="Không chấm điểm" value={summary.unscoredCount} />
        </div>

        <div className="studyActions studyActions--result">
          <Button type="button" onClick={onRestart}>Làm lại phiên học</Button>
          <Button type="button" variant="secondary" onClick={onContinue}>Tiếp tục học</Button>
          <Button type="button" variant="ghost" onClick={onGoToLibrary}>Quay về thư viện</Button>
          <Button type="button" variant="ghost" onClick={onGoToDashboard}>Về tổng quan</Button>
        </div>
      </Card>

      <Card title="Chi tiết từng mục" variant="elevated">
        <div className="resultDetailList">
          {summary.visibleDetails.map(detail => (
            <details className="resultDetail" key={detail.id}>
              <summary>
                <span>{detail.index + 1}. {detail.prompt}</span>
                <Badge tone={statusTone[detail.status] || 'neutral'}>{detail.statusLabel}</Badge>
              </summary>
              <div className="resultDetail__body">
                <p><strong>Loại:</strong> {detail.typeLabel}</p>
                {detail.userAnswer ? <p><strong>Câu trả lời của bạn:</strong> {detail.userAnswer}</p> : null}
                {detail.correctAnswer ? <p><strong>Đáp án đúng:</strong> {detail.correctAnswer}</p> : null}
                <p><strong>Trạng thái:</strong> {detail.statusLabel}</p>
                {detail.explanation ? <p><strong>Giải thích:</strong> {detail.explanation}</p> : null}
              </div>
            </details>
          ))}
        </div>
        {summary.hiddenDetailCount ? (
          <p className="muted">Đã ẩn {summary.hiddenDetailCount} mục còn lại để giữ màn hình gọn gàng.</p>
        ) : null}
      </Card>
    </div>
  );
}
