import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import ProgressBar from '../ProgressBar.jsx';

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

export default function StudyResultSummary({ summary, persistenceNote = '', historyMessage = '', onRestart, onContinue, onGoToLibrary }) {
  if (!summary) return null;

  return (
    <div className="studyResultStack">
      <Card className="studyResultHero" variant="elevated">
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
