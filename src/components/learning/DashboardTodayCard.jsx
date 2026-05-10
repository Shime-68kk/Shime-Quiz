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
    mastery
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

  function handlePrimaryAction() {
    if (state.target?.state) {
      navigate(state.target.route, { state: state.target.state });
      return;
    }
    navigate(state.target?.route || '/study-room');
  }

  return (
    <Card
      title="Hôm nay nên học gì?"
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
          <Button type="button" size="lg" onClick={handlePrimaryAction}>
            {state.actionLabel}
          </Button>
          <p className="muted">Dùng dữ liệu và lộ trình hiện có; không thay đổi cách chấm điểm hoặc logic Study Room.</p>
        </div>
      </div>
    </Card>
  );
}
