import {
  clearStudySessionState,
  createTodayStudySessionPlan,
  getStudySessionCompletionSummary,
  markStudySessionStepComplete,
  persistStudySessionPlan
} from '../quiz/studySession.js';
import { showToast } from './toast.js';

let initialized = false;

function appendText(parent, text, className, tagName = 'div') {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function appendButton(parent, text, className, onClick) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.textContent = text;
  button.addEventListener('click', onClick);
  parent.appendChild(button);
  return button;
}

function formatDuration(seconds) {
  const total = Number(seconds);
  if (!Number.isFinite(total) || total <= 0) return '';
  const rounded = Math.round(total);
  const minutes = Math.floor(rounded / 60);
  const secs = String(rounded % 60).padStart(2, '0');
  return minutes > 0 ? `${minutes}:${secs}` : `0:${secs}`;
}

function getStepLabel(type) {
  const labels = {
    dueReview: 'Ôn tập',
    mistakePractice: 'Sổ lỗi',
    weakTopic: 'Vùng yếu',
    quickReview: 'Ôn nhanh',
    miniMock: 'Mock'
  };
  return labels[type] || 'Bước học';
}

function renderEmpty(container, onOpenBuilder) {
  container.replaceChildren();
  const empty = document.createElement('div');
  empty.className = 'studySessionEmpty muted';
  appendText(empty, 'Chưa có đủ dữ liệu để tạo buổi học. Hãy nạp câu hỏi hoặc làm một bài quiz đầu tiên.', '');
  appendButton(empty, 'Mở tạo đề', 'btn small secondary', () => onOpenBuilder?.());
  container.appendChild(empty);
}


function getNextActionCopy(summary) {
  if (!summary) return null;
  if (summary.fullSessionComplete) {
    return {
      title: 'Bạn đã hoàn thành buổi học hôm nay.',
      reason: 'Có thể dừng tại đây để giữ nhịp học bền vững, hoặc làm thêm một phiên Quick Review nhẹ nếu còn thời gian.',
      actionLabel: 'Quick Review nhẹ',
      action: 'quickReview',
      optional: true
    };
  }

  const nextStep = summary.nextStep;
  if (!nextStep) return null;
  return {
    title: `Tiếp theo: ${nextStep.title}`,
    reason: nextStep.reason || 'Đây là bước phù hợp tiếp theo trong buổi học hôm nay.',
    actionLabel: nextStep.actionLabel || 'Làm bước tiếp theo',
    action: nextStep.action,
    step: nextStep
  };
}

function renderCompletionReview(container, plan, handlers) {
  const summary = getStudySessionCompletionSummary(plan);
  if (!summary) return;

  const card = document.createElement('section');
  card.className = 'studySessionCompletionCard';
  card.setAttribute('aria-label', 'Tổng kết buổi học');

  appendText(card, 'Tổng kết buổi học', 'studySessionCompletionTitle');
  appendText(
    card,
    `${summary.stepsCompleted}/${summary.totalSteps} bước hoàn thành`,
    'muted studySessionCompletionSubtitle'
  );

  const metrics = document.createElement('div');
  metrics.className = 'studySessionCompletionMetrics';
  const metricItems = [
    ['Câu đã làm', summary.attemptedCount || 0],
    ['Đúng', summary.correctCount || 0],
    ['Sai', summary.wrongCount || 0]
  ];
  const duration = formatDuration(summary.timeSpent);
  if (duration) metricItems.push(['Thời gian', duration]);

  metricItems.forEach(([label, value]) => {
    const metric = document.createElement('article');
    metric.className = 'studySessionCompletionMetric';
    appendText(metric, String(value), 'studySessionCompletionMetricValue');
    appendText(metric, label, 'muted studySessionCompletionMetricLabel');
    metrics.appendChild(metric);
  });
  card.appendChild(metrics);

  const impact = [];
  if (summary.dueQuestionsCompleted) impact.push(`Đã xử lý khoảng ${summary.dueQuestionsCompleted} câu đến hạn ôn.`);
  if (summary.mistakesPracticed) impact.push(`Đã luyện ${summary.mistakesPracticed} câu từ sổ lỗi sai.`);
  if (summary.weakTopicsPracticed) impact.push(`Đã luyện ${summary.weakTopicsPracticed} câu thuộc vùng yếu.`);
  if (!impact.length && summary.stepsCompleted) impact.push('Tiến độ buổi học đã được ghi nhận để gợi ý bước tiếp theo.');

  const impactList = document.createElement('div');
  impactList.className = 'studySessionImpactList';
  impact.forEach(line => appendText(impactList, line, 'studySessionImpactLine'));
  card.appendChild(impactList);

  const next = getNextActionCopy(summary);
  if (next) {
    const nextBox = document.createElement('div');
    nextBox.className = 'studySessionNextAction';
    appendText(nextBox, 'Next best action', 'studySessionNextLabel');
    appendText(nextBox, next.title, 'studySessionNextTitle');
    appendText(nextBox, next.reason, 'muted studySessionNextReason');

    if (next.action) {
      appendButton(nextBox, next.actionLabel, next.optional ? 'btn small ghost' : 'btn small secondary', () => {
        if (next.step) {
          handlers.onStepAction?.(next.step);
        } else {
          handlers.onAdHocAction?.(next.action);
        }
      });
    }

    card.appendChild(nextBox);
  }

  container.appendChild(card);
}

function renderStep(step, completed, handlers) {
  const item = document.createElement('article');
  item.className = `studySessionStep ${completed ? 'is-complete' : ''}`;

  const top = document.createElement('div');
  top.className = 'studySessionStepTop';
  appendText(top, getStepLabel(step.type), 'studySessionStepType', 'span');
  appendText(top, completed ? 'Đã xong' : `${step.estimatedQuestions || 0} câu`, completed ? 'studySessionStepBadge is-complete' : 'studySessionStepBadge', 'span');
  item.appendChild(top);

  appendText(item, step.title, 'studySessionStepTitle');
  appendText(item, step.reason, 'muted studySessionStepReason');

  const meta = [];
  if (step.estimatedQuestions) meta.push(`${step.estimatedQuestions} câu`);
  if (step.estimatedMinutes) meta.push(`~${step.estimatedMinutes} phút`);
  if (meta.length) appendText(item, meta.join(' · '), 'muted studySessionStepMeta');

  const actions = document.createElement('div');
  actions.className = 'studySessionStepActions';
  appendButton(actions, step.actionLabel || 'Làm bước này', 'btn tiny secondary', () => handlers.onStepAction?.(step));
  const completeButton = appendButton(actions, completed ? 'Đã đánh dấu' : 'Đánh dấu xong', 'btn tiny ghost', () => handlers.onMarkComplete?.(step));
  completeButton.disabled = completed;
  item.appendChild(actions);

  return item;
}

export function initStudySessionPanel({ getPlanInput, onStepAction, onOpenBuilder } = {}) {
  if (initialized) return { refresh: () => {} };
  initialized = true;

  const panel = document.getElementById('studySessionPanel');
  const summary = document.getElementById('studySessionSummary');
  const list = document.getElementById('studySessionSteps');
  const startButton = document.getElementById('btnStartStudySession');
  const resetButton = document.getElementById('btnResetStudySession');
  let currentPlan = null;

  function computePlan() {
    const input = getPlanInput?.() || {};
    return createTodayStudySessionPlan(input);
  }

  function refresh() {
    if (!panel || !summary || !list) return;
    currentPlan = computePlan();

    summary.replaceChildren();
    list.replaceChildren();

    if (!currentPlan?.hasQuestionBank || !currentPlan?.steps?.length) {
      if (startButton) startButton.disabled = true;
      renderEmpty(list, onOpenBuilder);
      appendText(summary, 'Nạp dữ liệu hoặc làm bài đầu tiên để tạo buổi học hôm nay.', 'muted studySessionSummaryLine');
      return;
    }

    persistStudySessionPlan(currentPlan);
    if (startButton) startButton.disabled = false;

    appendText(summary, `${currentPlan.totalQuestions} câu · ~${currentPlan.estimatedMinutes} phút`, 'studySessionSummaryMain');
    appendText(summary, `${currentPlan.completedCount}/${currentPlan.steps.length} bước hoàn thành · ${currentPlan.reason}`, 'muted studySessionSummaryLine');

    const meter = document.createElement('div');
    meter.className = 'studySessionMeter';
    const fill = document.createElement('span');
    fill.style.width = `${Math.max(4, Math.min(100, currentPlan.progressPercent))}%`;
    meter.appendChild(fill);
    summary.appendChild(meter);

    renderCompletionReview(list, currentPlan, {
      onStepAction: handleStepAction,
      onAdHocAction: action => onStepAction?.(action, { action, type: action, payload: {} })
    });

    const completed = new Set(currentPlan.completedStepIds || []);
    currentPlan.steps.forEach(step => {
      list.appendChild(renderStep(step, completed.has(step.id), {
        onStepAction: handleStepAction,
        onMarkComplete: handleMarkComplete
      }));
    });
  }

  function handleStepAction(step) {
    if (!step) return;
    const plan = currentPlan || computePlan();
    persistStudySessionPlan(plan);
    onStepAction?.(step.action, step);
  }

  function handleMarkComplete(step) {
    if (!step) return;
    markStudySessionStepComplete(step.id, currentPlan || computePlan());
    showToast('Đã đánh dấu xong bước học.', { type: 'success', timeout: 2200 });
    refresh();
  }

  startButton?.addEventListener('click', () => {
    const plan = currentPlan || computePlan();
    if (!plan?.steps?.length) {
      showToast('Chưa có bước học phù hợp. Hãy nạp dữ liệu hoặc mở tạo đề.', { type: 'info' });
      onOpenBuilder?.();
      return;
    }
    persistStudySessionPlan(plan);
    const completed = new Set(plan.completedStepIds || []);
    const nextStep = plan.steps.find(step => !completed.has(step.id)) || plan.steps[0];
    onStepAction?.(nextStep.action, nextStep);
  });

  resetButton?.addEventListener('click', () => {
    clearStudySessionState();
    showToast('Đã làm mới buổi học hôm nay.', { type: 'info', timeout: 2200 });
    refresh();
  });

  refresh();
  return { refresh, getPlan: () => currentPlan || computePlan() };
}
