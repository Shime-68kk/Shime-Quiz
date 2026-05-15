import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import HistoryAnalyticsPanel from '../components/analytics/HistoryAnalyticsPanel.jsx';
import MasteryInsightsPanel from '../components/analytics/MasteryInsightsPanel.jsx';
import DashboardTodayCard from '../components/learning/DashboardTodayCard.jsx';
import StudyGoalCard from '../components/learning/StudyGoalCard.jsx';
import TodayJourneyCard from '../components/learning/TodayJourneyCard.jsx';
import ReviewSchedulePanel from '../components/study/ReviewSchedulePanel.jsx';
import SmartPracticePanel from '../components/study/SmartPracticePanel.jsx';
import StudyHistoryPanel from '../components/study/StudyHistoryPanel.jsx';
import { useNavigate } from 'react-router-dom';
import { DashboardLearningDataProvider, useDashboardLearningData } from '../dashboard/DashboardLearningDataContext.jsx';
import { computeMixedSchedulerDueSummary } from '../quiz/reviewSchedulerAdapter.js';

const itemTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  short_answer: 'Trả lời ngắn',
  flashcard: 'Flashcard'
};

// UI-only data overview. Future learning metrics should come from dedicated
// services rather than embedding quiz, mastery, or spaced-repetition logic here.
function buildSummaries(summary) {
  return [
    {
      label: 'Môn học',
      value: summary.subjectCount,
      tone: 'info',
      badge: 'Dữ liệu phiên',
      note: 'Số môn học trong bộ chuyển đổi v2 hiện tại.',
      progress: Math.min(100, summary.subjectCount * 35)
    },
    {
      label: 'Chủ đề',
      value: summary.topicCount,
      tone: 'success',
      badge: 'Đã chuẩn hóa',
      note: 'Chủ đề/chương đã qua bộ chuyển đổi dữ liệu.',
      progress: Math.min(100, summary.topicCount * 22)
    },
    {
      label: 'Học liệu',
      value: summary.itemCount,
      tone: 'warning',
      badge: 'Nhiều dạng',
      note: 'Bao gồm trắc nghiệm, flashcard và trả lời ngắn.',
      progress: Math.min(100, summary.itemCount * 12)
    }
  ];
}

export default function Dashboard() {
  return (
    <DashboardLearningDataProvider>
      <DashboardContent />
    </DashboardLearningDataProvider>
  );
}

function DashboardContent() {
  const navigate = useNavigate();
  const {
    adapter,
    librarySummary: summary,
    dataSource,
    subjects,
    historyRecords,
    scheduleRecords,
    feedbackRecords,
    studyGoal,
    planProgressState
  } = useDashboardLearningData();
  const itemTypeEntries = Object.entries(summary.itemTypeCounts);
  const summaries = buildSummaries(summary);
  const sourceLabel = dataSource.sourceType === 'mock'
    ? 'Dữ liệu mẫu'
    : dataSource.sourceType === 'csv'
      ? 'Đã nạp CSV'
      : dataSource.sourceType === 'json'
        ? 'Đã nạp JSON'
         : 'Dữ liệu đã nạp';
  const hasStudyPlanProgress = Boolean(planProgressState?.day?.completedStepIds?.length);
  const isFirstRunEmptyState = dataSource.sourceType === 'mock'
    && !dataSource.importedAt
    && historyRecords.length === 0
    && scheduleRecords.length === 0
    && feedbackRecords.length === 0
    && !studyGoal
    && !hasStudyPlanProgress;

  return (
    <div className="pageStack">
      <PageHeader
        eyebrow="Bảng điều khiển"
        title="Chào mừng quay lại"
        subtitle="Tổng quan dữ liệu học v2 từ bộ chuyển đổi cục bộ. Logic học thích ứng sẽ được nối vào dịch vụ riêng ở giai đoạn sau."
        actions={<Button type="button" size="lg" onClick={() => navigate('/study-room')}>Học tiếp</Button>}
      />

      <Card title="Nguồn dữ liệu" eyebrow="Trạng thái thư viện" className="dataSourceCard">
        <div className="dataSourceCard__content">
          <Badge tone={dataSource.sourceType === 'mock' ? 'neutral' : 'success'}>{sourceLabel}</Badge>
          <div>
            <strong>{dataSource.sourceName}</strong>
            <p className="muted">
              {dataSource.importedAt
                ? `Đã lưu cục bộ lúc ${new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(dataSource.importedAt))}.`
                : 'Đang dùng dữ liệu mẫu. Nạp JSON/CSV trong Thư viện để lưu dữ liệu cho lần mở sau.'}
            </p>
          </div>
        </div>
      </Card>

      <DashboardTodayCard />

      {isFirstRunEmptyState ? (
        <Card title="Chưa có dữ liệu học tập" eyebrow="Bắt đầu an toàn" className="dashboardFirstRunOnboardingCard">
          <div className="textImportCard__intro">
            <p className="muted">
              Hãy bắt đầu ở Thư viện: dùng quiz mẫu, import JSON/CSV, hoặc dán nội dung text/Markdown. Phần này chỉ dẫn bạn đến luồng Thư viện hiện có, không tự nạp và không tự lưu dữ liệu.
            </p>
            <p className="muted">
              Quiz mẫu chỉ mở phần xem trước/kiểm tra chất lượng. Bạn vẫn cần xác nhận trước khi lưu vào thư viện cục bộ.
            </p>
            <p className="muted">
              AI trong Shime là quy trình thủ công copy/paste: Shime không gọi AI/API và không có API key/BYOK. Import tài liệu PDF/DOCX/PPTX/ZIP cần EduGen chạy riêng và được cấu hình.
            </p>
          </div>
          <div className="textImportActions">
            <Button type="button" variant="secondary" onClick={() => navigate('/library')}>
              Mở Thư viện
            </Button>
            <span className="muted">Không auto-load, không auto-save, không reset dữ liệu.</span>
          </div>
        </Card>
      ) : null}

      <TodayJourneyCard />

      <StudyGoalCard />

      <HistoryAnalyticsPanel />

      <MasteryInsightsPanel />

      <ReviewSchedulePanel />

      <MixedSchedulerDueNote scheduleRecords={scheduleRecords} />

      <SmartPracticePanel />

      <StudyHistoryPanel compact />

      <div className="cardGrid cardGrid--three" aria-label="Tóm tắt học liệu">
        {summaries.map(item => (
          <Card key={item.label} title={item.label} eyebrow="Tổng quan" variant="elevated">
            <Badge tone={item.tone}>{item.badge}</Badge>
            <strong className="metric">{item.value}</strong>
            <p className="muted">{item.note}</p>
            <div className="dashboardProgress">
              <ProgressBar value={item.progress} label={`${item.label} trong dữ liệu hiện tại`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="cardGrid cardGrid--two" aria-label="Tóm tắt loại học liệu">
        <Card title="Loại học liệu" eyebrow="Mô hình dữ liệu">
          <div className="badgeList" aria-label="Phân bổ loại học liệu">
            {itemTypeEntries.map(([type, count]) => (
              <Badge key={type} tone="info">
                {itemTypeLabels[type] || type}: {count}
              </Badge>
            ))}
          </div>
          <p className="muted">Bộ chuyển đổi hiện hỗ trợ trắc nghiệm, trả lời ngắn và thẻ ghi nhớ.</p>
        </Card>

        <Card title="Môn học hiện có" eyebrow="Xem nhanh thư viện">
          <div className="subjectMiniList">
            {subjects.map(subject => (
              <span key={subject.id} className="subjectMiniList__item">
                {subject.title}
              </span>
            ))}
          </div>
          <p className="muted">Dữ liệu này đến từ dữ liệu mẫu hoặc dữ liệu nạp cục bộ để chuẩn bị kiến trúc nhiều môn học.</p>
        </Card>
      </div>
    </div>
  );
}

// Phase 15C: narrow inline note shown only when experimental memory-scheduled cards are due.
// Copy uses "thử nghiệm" (experimental) — no overclaim language.
function MixedSchedulerDueNote({ scheduleRecords }) {
  const summary = computeMixedSchedulerDueSummary(scheduleRecords || []);
  if (summary.fsrsFamilyDueCount === 0) return null;
  return (
    <p
      className="muted dashboardMixedSchedulerNote"
      role="status"
      aria-live="polite"
      data-testid="mixed-scheduler-due-note"
    >
      {`Bao gồm ${summary.fsrsFamilyDueCount} thẻ dùng lịch học bộ nhớ thử nghiệm trong tổng số câu đến hạn.`}
    </p>
  );
}
