import { useNavigate } from 'react-router-dom';
import Badge from '../Badge.jsx';
import Button from '../Button.jsx';
import Card from '../Card.jsx';
import { useDashboardLearningData } from '../../dashboard/DashboardLearningDataContext.jsx';
import { RECOMMENDATION_TYPES } from '../../learning/recommendationLite.js';
import { useShimeLanguage } from '../../uiI18n/useShimeLanguage.js';

function getSafeItemCount(summary = {}) {
  return Math.max(0, Number(summary.itemCount) || 0);
}

function getTodayCardState({ itemCount, recommendation, dueSummary, smartPracticeSelection, weakPracticeSelection, todayPlan, historyRecords, mastery, t }) {
  const dueCount = Math.max(0, Number(dueSummary?.dueCount) || 0);
  const smartCount = Math.max(0, Number(smartPracticeSelection?.selectedCount) || 0);
  const weakCount = Math.max(0, Number(mastery?.weakItemCount) || 0);
  const historyCount = Array.isArray(historyRecords) ? historyRecords.filter(Boolean).length : 0;
  const firstPlanStep = Array.isArray(todayPlan?.steps) ? todayPlan.steps[0] : null;

  if (!itemCount || recommendation?.type === RECOMMENDATION_TYPES.LIBRARY_EMPTY) {
    return {
      badge: t('today.startBadge'),
      title: t('today.emptyTitle'),
      body: t('today.emptyBody'),
      meta: [t('today.emptyItems'), t('today.noSchedule')],
      actionLabel: t('home.openLibrary'),
      target: { route: '/library' }
    };
  }

  if (dueCount > 0) {
    return {
      badge: t('today.dueBadge'),
      title: t('today.dueTitle', { count: dueCount }),
      body: t('today.dueBody'),
      meta: [t('today.dueMeta', { count: dueCount }), t('today.libraryMeta', { count: itemCount })],
      actionLabel: t('today.studyToday'),
      target: {
        route: '/study-room',
        state: {
          selection: {
            mode: 'due-review',
            source: 'dashboard-today-card',
            label: t('study.dueReview'),
            dueCount
          }
        }
      }
    };
  }

  if (firstPlanStep?.routeState) {
    return {
      badge: t('today.suggestion'),
      title: t('today.planTitle'),
      body: t('today.planBody'),
      meta: [
        firstPlanStep.estimatedItemCount ? t('today.approxItems', { count: firstPlanStep.estimatedItemCount }) : t('today.libraryMeta', { count: itemCount }),
        historyCount ? t('today.historyCount', { count: historyCount }) : t('today.noHistory')
      ],
      actionLabel: t('today.startStudy'),
      target: {
        route: '/study-room',
        state: { selection: firstPlanStep.routeState }
      }
    };
  }

  if (smartCount > 0) {
    return {
      badge: weakCount > 0 ? t('today.needsWork') : t('today.suggestion'),
      title: weakCount > 0 ? t('today.weakTitle') : t('today.shortTitle'),
      body: weakCount > 0
        ? t('today.weakBody')
        : t('today.shortBody'),
      meta: [t('today.suggestedItems', { count: smartCount }), t('today.libraryMeta', { count: itemCount })],
      actionLabel: t('today.startStudy'),
      target: {
        route: '/study-room',
        state: {
          selection: {
            mode: 'smart-practice',
            source: 'dashboard-today-card',
            label: weakCount > 0 ? t('overview.practiceWeak') : t('study.smartPractice'),
            requestedCount: smartPracticeSelection.requestedCount,
            selectedItemIds: (weakPracticeSelection?.selectedCount ? weakPracticeSelection : smartPracticeSelection).selectedItemIds
          }
        }
      }
    };
  }

  return {
    badge: t('today.readyBadge'),
    title: t('today.readyTitle'),
    body: t('today.readyBody'),
    meta: [t('today.libraryMeta', { count: itemCount }), historyCount ? t('today.historyCount', { count: historyCount }) : t('today.noHistory')],
    actionLabel: t('study.continueStudy'),
    target: { route: '/study-room' }
  };
}

function getGreeting(t) {
  const hr = new Date().getHours();
  if (hr < 12) return t('today.morning');
  if (hr < 18) return t('today.afternoon');
  return t('today.evening');
}

export default function DashboardTodayCard() {
  const navigate = useNavigate();
  const { t } = useShimeLanguage();
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
    mastery,
    t
  });

  const greeting = getGreeting(t);
  const streak = historyAnalytics?.studyStreakDays || 0;

  const completedSteps = planStepProgress?.completedCount || 0;
  const totalSteps = planStepProgress?.totalSteps || 0;
  const stepPercent = totalSteps ? Math.round((completedSteps / totalSteps) * 100) : (goalProgress?.hasGoal ? goalProgress.progressPercent : 0);

  const showRing = totalSteps > 0 || goalProgress?.hasGoal;
  const ringLabel = totalSteps > 0 ? `${completedSteps}/${totalSteps}` : `${stepPercent}%`;
  const ringSub = totalSteps > 0 ? t('today.steps') : t('today.goal');

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
            <span className="streakFlame">
              {t('today.streak', { count: streak })}
            </span>
          )}
        </div>
      }
      eyebrow={t('today.cardEyebrow')}
      variant="elevated"
      className="dashboardTodayCard"
      aria-labelledby="dashboardTodayCardTitle"
    >
      <div className="dashboardTodayCard__layout">
        <div className="dashboardTodayCard__main">
          <Badge tone={itemCount ? 'info' : 'warning'}>{state.badge}</Badge>
          <h3 id="dashboardTodayCardTitle">{state.title}</h3>
          <p className="muted">{state.body}</p>
          <ul className="dashboardTodayCard__meta" aria-label={t('today.summary')}>
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
              <span style={{ fontSize: '0.78rem', fontWeight: '800', color: 'var(--brand-dark)' }}>{t('today.journey')}</span>
            </div>
          )}
          <Button type="button" size="lg" onClick={handlePrimaryAction}>
            {state.actionLabel}
          </Button>
          <p className="muted">{t('today.safety')}</p>
        </div>
      </div>
    </Card>
  );
}
