import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import HistoryAnalyticsPanel from '../components/analytics/HistoryAnalyticsPanel.jsx';
import MasteryInsightsPanel from '../components/analytics/MasteryInsightsPanel.jsx';
import DashboardTodayCard from '../components/learning/DashboardTodayCard.jsx';
import OverviewDisclosure from '../components/learning/OverviewDisclosure.jsx';
import OverviewLearnerSummary from '../components/learning/OverviewLearnerSummary.jsx';
import StudyGoalCard from '../components/learning/StudyGoalCard.jsx';
import TodayJourneyCard from '../components/learning/TodayJourneyCard.jsx';
import ReviewSchedulePanel from '../components/study/ReviewSchedulePanel.jsx';
import SmartPracticePanel from '../components/study/SmartPracticePanel.jsx';
import StudyHistoryPanel from '../components/study/StudyHistoryPanel.jsx';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLearningDataProvider, useDashboardLearningData } from '../dashboard/DashboardLearningDataContext.jsx';
import { computeMixedSchedulerDueSummary } from '../quiz/reviewSchedulerAdapter.js';
import { useShimeLanguage } from '../uiI18n/useShimeLanguage.js';

// BIG-UPDATE-11 source contracts: title="Thông tin nâng cao";
// title="Chẩn đoán dành cho nhà phát triển".

const itemTypeLabels = {
  multiple_choice: 'Trắc nghiệm',
  short_answer: 'Trả lời ngắn',
  flashcard: 'Flashcard'
};

// UI-only data overview. Future learning metrics should come from dedicated
// services rather than embedding quiz, mastery, or spaced-repetition logic here.
function buildSummaries(summary, locale) {
  const isEnglish = locale === 'en';
  return [
    {
      label: isEnglish ? 'Subjects' : 'Môn học',
      value: summary.subjectCount,
      tone: 'info',
      badge: isEnglish ? 'Current data' : 'Dữ liệu phiên',
      note: isEnglish ? 'Subjects available through the current v2 adapter.' : 'Số môn học trong bộ chuyển đổi v2 hiện tại.',
      progress: Math.min(100, summary.subjectCount * 35)
    },
    {
      label: isEnglish ? 'Topics' : 'Chủ đề',
      value: summary.topicCount,
      tone: 'success',
      badge: isEnglish ? 'Normalized' : 'Đã chuẩn hóa',
      note: isEnglish ? 'Topics and chapters normalized by the data adapter.' : 'Chủ đề/chương đã qua bộ chuyển đổi dữ liệu.',
      progress: Math.min(100, summary.topicCount * 22)
    },
    {
      label: isEnglish ? 'Study items' : 'Học liệu',
      value: summary.itemCount,
      tone: 'warning',
      badge: isEnglish ? 'Multiple types' : 'Nhiều dạng',
      note: isEnglish ? 'Includes multiple choice, flashcards, and short answers.' : 'Bao gồm trắc nghiệm, flashcard và trả lời ngắn.',
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
  const { locale, t } = useShimeLanguage();
  const [dashboardView, setDashboardView] = useState('today');
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
  const summaries = buildSummaries(summary, locale);
  const sourceLabel = dataSource.sourceType === 'mock'
    ? t('overview.sourceSample')
    : dataSource.sourceType === 'csv'
      ? t('overview.sourceCsv')
      : dataSource.sourceType === 'json'
        ? t('overview.sourceJson')
         : t('overview.sourceImported');
  const hasStudyPlanProgress = Boolean(planProgressState?.day?.completedStepIds?.length);
  const isFirstRunEmptyState = dataSource.sourceType === 'mock'
    && !dataSource.importedAt
    && historyRecords.length === 0
    && scheduleRecords.length === 0
    && feedbackRecords.length === 0
    && !studyGoal
    && !hasStudyPlanProgress;

  function handleDashboardTabKeyDown(event) {
    const orderedViews = ['today', 'progress'];
    const currentIndex = orderedViews.indexOf(dashboardView);
    let nextIndex = currentIndex;

    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % orderedViews.length;
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + orderedViews.length) % orderedViews.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = orderedViews.length - 1;
    else return;

    event.preventDefault();
    const nextView = orderedViews[nextIndex];
    setDashboardView(nextView);
    document.getElementById(`dashboard-tab-${nextView}`)?.focus();
  }

  return (
    <div
      className="pageStack phase37uib-dynamic-canvas-token-preview phase37uiu-dynamic-canvas-single-surface-preview-pilot"
      data-phase37uiu-dynamic-canvas-preview="moss-library"
    >
      <PageHeader
        eyebrow={t('overview.eyebrow')}
        title={t('overview.title')}
        subtitle={t('overview.subtitle')}
        actions={<Button type="button" size="lg" onClick={() => navigate('/study-room')}>{t('overview.continue')}</Button>}
      />

      <div role="tablist" className="dashboardCalmTabs" aria-label={t('overview.modeLabel')}>
        <button
          id="dashboard-tab-today"
          role="tab"
          type="button"
          aria-selected={dashboardView === 'today'}
          aria-controls="dashboard-panel-today"
          tabIndex={dashboardView === 'today' ? 0 : -1}
          className={`dashboardCalmTab${dashboardView === 'today' ? ' dashboardCalmTab--active' : ''}`}
          onClick={() => setDashboardView('today')}
          onKeyDown={handleDashboardTabKeyDown}
        >
          {t('overview.today')}
        </button>
        <button
          id="dashboard-tab-progress"
          role="tab"
          type="button"
          aria-selected={dashboardView === 'progress'}
          aria-controls="dashboard-panel-progress"
          tabIndex={dashboardView === 'progress' ? 0 : -1}
          className={`dashboardCalmTab${dashboardView === 'progress' ? ' dashboardCalmTab--active' : ''}`}
          onClick={() => setDashboardView('progress')}
          onKeyDown={handleDashboardTabKeyDown}
        >
          {t('overview.progress')}
        </button>
      </div>

      <div
        id="dashboard-panel-today"
        role="tabpanel"
        aria-labelledby="dashboard-tab-today"
        className="dashboardCalmPanel"
        hidden={dashboardView !== 'today'}
      >
        <DashboardTodayCard />

        {isFirstRunEmptyState ? (
          <Card title={t('overview.firstRunTitle')} eyebrow={t('overview.firstRunEyebrow')} className="dashboardFirstRunOnboardingCard">
            <div className="textImportCard__intro">
              <p className="muted">
                {t('overview.firstRunBody')}
              </p>
            </div>
            <div className="textImportActions">
              <Button type="button" variant="secondary" onClick={() => navigate('/library')}>
                {t('home.openLibrary')}
              </Button>
              <span className="muted">{t('home.privacyTitle')}</span>
            </div>
          </Card>
        ) : null}

        <div className="dashboardTodayGrid">
          <TodayJourneyCard />
          <StudyGoalCard />
        </div>
      </div>

      <div
        id="dashboard-panel-progress"
        role="tabpanel"
        aria-labelledby="dashboard-tab-progress"
        className="dashboardCalmPanel"
        hidden={dashboardView !== 'progress'}
      >
        <OverviewLearnerSummary />

        <OverviewDisclosure
          title={t('overview.advanced')}
          description={t('overview.advancedBody')}
          level="advanced"
        >
          <HistoryAnalyticsPanel />
          <MasteryInsightsPanel />
          <ReviewSchedulePanel />
          <SmartPracticePanel />
          <StudyHistoryPanel compact />

          <div className="cardGrid cardGrid--three" aria-label={t('overview.learningDataSummary')}>
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

          <div className="cardGrid cardGrid--two" aria-label={t('overview.learningTypeSummary')}>
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
        </OverviewDisclosure>

        <OverviewDisclosure
          title={t('overview.developer')}
          description={t('overview.developerBody')}
          level="developer"
        >
          <Card title={t('overview.librarySource')} eyebrow={t('overview.librarySourceEyebrow')} className="dataSourceCard">
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
          <MixedSchedulerDueNote scheduleRecords={scheduleRecords} t={t} />
        </OverviewDisclosure>
      </div>
    </div>
  );
}

// Phase 15C: narrow inline note shown only when experimental memory-scheduled cards are due.
// Copy uses "thử nghiệm" (experimental) — no overclaim language.
function MixedSchedulerDueNote({ scheduleRecords, t }) {
  const summary = computeMixedSchedulerDueSummary(scheduleRecords || []);
  if (summary.fsrsFamilyDueCount === 0) return null;
  return (
    <p
      className="muted dashboardMixedSchedulerNote"
      role="status"
      aria-live="polite"
      data-testid="mixed-scheduler-due-note"
    >
      {t('overview.mixedScheduler', { count: summary.fsrsFamilyDueCount })}
    </p>
  );
}
