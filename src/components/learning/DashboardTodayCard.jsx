import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import { RECOMMENDATION_TYPES } from '../../learning/recommendationLite.js';

function getSafeItemCount(summary = {}) {
  return Math.max(0, Number(summary.itemCount) || 0);
}

function getTodayCardState({ itemCount, recommendation, dueSummary, smartPracticeSelection, weakPracticeSelection, todayPlan, historyRecords, mastery }) {
  const dueCount = Math.max(0, Number(dueSummary?.dueCount) || 0);
  const smartCount = Math.max(0, Number(smartPracticeSelection?.selectedCount) || 0);
  const weakCount = Math.max(0, Number(mastery?.weakItemCount) || 0);
  const historyCount = Array.isArray(historyRecords) ? historyRecords.filter(Boolean).length : 0;
  const firstPlanStep = Array.isArray(todayPlan?.steps) ? todayPlan.steps[0] : null;

  if (!itemCount || recommendation?.type === RECOMMENDATION_TYPES.LIBRARY_EMPTY) {
    return {
      badge: 'Bắt đầu',
      title: 'Hôm nay: thêm học liệu để bắt đầu',
      body: 'Chưa có dữ liệu ôn tập. Hãy thêm hoặc nhập bộ câu hỏi trong Thư viện để tạo phiên học đầu tiên.',
      meta: ['0 câu trong thư viện', 'Chưa có lịch ôn'],
      actionLabel: 'Mở Thư viện',
      target: { route: '/library' }
    };
  }

  if (dueCount > 0) {
    return {
      badge: 'Đến hạn',
      title: `Hôm nay: ${dueCount} câu đang chờ bạn`,
      body: 'Ưu tiên ôn các câu đến hạn trước. Dashboard vẫn giữ các thống kê chi tiết ở bên dưới.',
      meta: [`${dueCount} câu đến hạn`, `${itemCount} học liệu trong thư viện`],
      actionLabel: 'Học hôm nay',
      target: {
        route: '/study-room',
        state: {
          selection: {
            mode: 'due-review',
            source: 'dashboard-today-card',
            label: 'Ôn tập hôm nay',
            dueCount
          }
        }
      }
    };
  }

  if (firstPlanStep?.routeState) {
    return {
      badge: firstPlanStep.status || 'Gợi ý',
      title: `Hôm nay: ${firstPlanStep.title}`,
      body: firstPlanStep.reason || 'Bạn có thể bắt đầu một phiên học ngắn với dữ liệu hiện có.',
      meta: [
        firstPlanStep.estimatedItemCount ? `Khoảng ${firstPlanStep.estimatedItemCount} mục` : `${itemCount} học liệu trong thư viện`,
        historyCount ? `${historyCount} lượt học đã ghi nhận` : 'Chưa có lịch sử học'
      ],
      actionLabel: firstPlanStep.actionLabel || 'Bắt đầu học',
      target: {
        route: '/study-room',
        state: { selection: firstPlanStep.routeState }
      }
    };
  }

  if (smartCount > 0) {
    return {
      badge: weakCount > 0 ? 'Cần củng cố' : 'Gợi ý',
      title: weakCount > 0 ? 'Hôm nay: luyện phần cần củng cố' : 'Hôm nay: bắt đầu một phiên học ngắn',
      body: weakCount > 0
        ? 'Một số nội dung có thể cần luyện thêm dựa trên dữ liệu cục bộ hiện có.'
        : 'Chưa có câu đến hạn. Bạn vẫn có thể học tiếp với phiên luyện tập ngắn.',
      meta: [`${smartCount} mục gợi ý`, `${itemCount} học liệu trong thư viện`],
      actionLabel: 'Bắt đầu học',
      target: {
        route: '/study-room',
        state: {
          selection: {
            mode: 'smart-practice',
            source: 'dashboard-today-card',
            label: weakCount > 0 ? 'Luyện phần yếu' : 'Luyện tập thông minh',
            requestedCount: smartPracticeSelection.requestedCount,
            selectedItemIds: (weakPracticeSelection?.selectedCount ? weakPracticeSelection : smartPracticeSelection).selectedItemIds
          }
        }
      }
    };
  }

  return {
    badge: 'Sẵn sàng',
    title: 'Hôm nay bạn có thể bắt đầu một phiên học ngắn',
    body: 'Chưa có dữ liệu ôn tập đủ rõ để gợi ý chi tiết. Bạn vẫn có thể tiếp tục học bằng Study Room hiện có.',
    meta: [`${itemCount} học liệu trong thư viện`, historyCount ? `${historyCount} lượt học đã ghi nhận` : 'Chưa có lịch sử học'],
    actionLabel: 'Tiếp tục học',
    target: { route: '/study-room' }
  };
}

function getGreeting() {
  const hr = new Date().getHours();
  if (hr < 12) return 'Chào buổi sáng! ☕';
  if (hr < 18) return 'Chào buổi chiều! ☀️';
  return 'Chào buổi tối! 🌙';
}

export default function DashboardTodayCard() {
  const navigate = useNavigate();
  const {
    librarySummary,
    recommendation,
    dueSummary,
    smartPracticeSelection,
    weakPracticeSelection,
    todayPlan,
    historyRecords,
    mastery,
    planStepProgress,
    goalProgress,
    historyAnalytics
  } = useDashboardLearningData();

  const itemCount = getSafeItemCount(librarySummary);
  const state = getTodayCardState({
    itemCount,
    recommendation,
    dueSummary,
    smartPracticeSelection,
    weakPracticeSelection,
    todayPlan,
    historyRecords,
    mastery
  });

  const greeting = getGreeting();
  const streak = historyAnalytics?.studyStreakDays || 0;

  const completedSteps = planStepProgress?.completedCount || 0;
  const totalSteps = planStepProgress?.totalSteps || 0;
  const stepPercent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : (goalProgress?.hasGoal ? goalProgress.progressPercent : 0);

  const showRing = totalSteps > 0 || goalProgress?.hasGoal;
  const ringLabel = totalSteps > 0 ? `${completedSteps}/${totalSteps}` : `${stepPercent}%`;
  const ringSub = totalSteps > 0 ? "bước" : "mục tiêu";

  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stepPercent / 100) * circumference;

  function handlePrimaryAction() {
    if (state.target?.state) {
      navigate(state.target.route, { state: state.target.state });
      return;
    }
    navigate(state.target?.route || '/study-room');
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', flexWrap: 'wrap', gap: '10px' }}>
          <span>{greeting}</span>
          {streak > 0 && (
            <span className="streakFlame" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.95rem', background: 'rgba(255, 159, 67, 0.1)', padding: '4px 10px', borderRadius: '12px', border: '1px solid rgba(255, 159, 67, 0.2)', color: '#ff9f43', fontWeight: 'bold', animation: streak >= 3 ? 'tourPulseStrong 1.5s infinite' : 'none' }}>
              🔥 {streak} ngày liên tiếp
            </span>
          )}
        </div>
      }
      eyebrow="Today Card"
      variant="elevated"
      className="dashboardTodayCard"
      aria-labelledby="dashboardTodayCardTitle"
    >
      <div className="dashboardTodayCard__layout">
        <div className="dashboardTodayCard__main">
          <Badge tone={itemCount ? 'info' : 'warning'}>{state.badge}</Badge>
          <h3 id="dashboardTodayCardTitle">{state.title}</h3>
          <p className="muted">{state.body}</p>
          <ul className="dashboardTodayCard__meta" aria-label="Tóm tắt học hôm nay">
            {state.meta.map(item => <li key={item}>{item}</li>)}
          </ul>
        </div>
        <div className="dashboardTodayCard__action">
          {showRing && (
            <div className="dashboardTodayRingContainer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', borderRadius: '16px', background: 'var(--color-primary-soft)', border: '1px solid var(--border)', marginBottom: '12px' }}>
              <div style={{ position: 'relative', width: '90px', height: '90px' }}>
                <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="45" cy="45" r={radius} stroke="var(--border)" strokeWidth="6" fill="transparent" />
                  <circle cx="45" cy="45" r={radius} stroke="var(--brand)" strokeWidth="6" fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}
                  />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--brand-dark)', fontWeight: '800' }}>{ringLabel}</strong>
                  <span style={{ fontSize: '0.68rem', color: 'var(--muted)' }}>{ringSub}</span>
                </div>
              </div>
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--brand-dark)' }}>Hành trình ngày</span>
            </div>
          )}
          <Button type="button" size="lg" onClick={handlePrimaryAction}>
            {state.actionLabel}
          </Button>
          <p className="muted">Dùng dữ liệu và lộ trình hiện có; không thay đổi cách chấm điểm hoặc logic Study Room.</p>
        </div>
      </div>
    </Card>
  );
}
