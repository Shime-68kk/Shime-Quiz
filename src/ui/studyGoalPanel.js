import { clearStudyGoal, createStudyPlan, loadStudyGoal, saveStudyGoal } from '../quiz/studyGoal.js';
import { showToast } from './toast.js';

let initialized = false;

function appendText(parent, text, className, tagName = 'div') {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text;
  parent.appendChild(el);
  return el;
}

function getEl(id) {
  return document.getElementById(id);
}

function getSelectedTopics() {
  return [...document.querySelectorAll('#goalTopicList input[type="checkbox"]:checked')]
    .map(input => input.value)
    .filter(Boolean);
}

function setStatus(message, type = '') {
  const status = getEl('studyGoalStatus');
  if (!status) return;
  status.textContent = message || '';
  status.classList.toggle('is-error', type === 'error');
  status.classList.toggle('is-success', type === 'success');
}

function formatFocusMode(mode) {
  const labels = {
    balanced: 'Cân bằng',
    weakFirst: 'Ưu tiên vùng yếu',
    dueFirst: 'Ưu tiên câu cần ôn',
    selectedTopics: 'Theo chương/chủ đề đã chọn'
  };
  return labels[mode] || labels.balanced;
}

function getTomorrowDateValue() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date.toISOString().slice(0, 10);
}

function renderTopicOptions(topics = [], selectedTopics = []) {
  const list = getEl('goalTopicList');
  if (!list) return;

  list.replaceChildren();
  const selected = new Set(selectedTopics);
  const items = Array.isArray(topics) ? topics : [];

  if (!items.length) {
    appendText(list, 'Chưa có chapter/category/topic rõ ràng. Kế hoạch sẽ dùng toàn bộ câu hỏi.', 'muted goalTopicEmpty');
    return;
  }

  items.slice(0, 32).forEach(topic => {
    const label = document.createElement('label');
    label.className = 'goalTopicOption';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = topic.key || topic.label || '';
    input.checked = selected.has(input.value) || selected.has(topic.label);
    label.appendChild(input);
    appendText(label, `${topic.label || topic.key} (${topic.count || 0})`, 'goalTopicLabel', 'span');
    list.appendChild(label);
  });
}

function fillForm(goal) {
  const dateInput = getEl('goalTargetDate');
  const dailyInput = getEl('goalDailyTarget');
  const focusInput = getEl('goalFocusMode');

  if (dateInput) dateInput.value = goal?.targetDate || getTomorrowDateValue();
  if (dailyInput) dailyInput.value = String(goal?.dailyQuestionTarget || 20);
  if (focusInput) focusInput.value = goal?.focusMode || 'balanced';
}

function renderPlan(plan, onStartToday) {
  const summary = getEl('studyGoalSummary');
  if (!summary) return;

  summary.replaceChildren();
  if (!plan?.hasGoal) {
    appendText(summary, 'Chưa có mục tiêu học tập. Đặt ngày mục tiêu và số câu mỗi ngày để app gợi ý phiên học phù hợp.', 'muted goalEmpty');
    return;
  }

  const goal = plan.goal;
  const card = document.createElement('div');
  card.className = 'studyGoalActiveCard';
  appendText(card, `Mục tiêu: ${goal.targetDate}`, 'studyGoalLine strong');
  appendText(card, plan.isPastDue ? 'Ngày mục tiêu đã qua' : `Còn ${plan.daysRemaining} ngày`, plan.isPastDue ? 'studyGoalWarning' : 'muted studyGoalLine');
  appendText(card, `Hôm nay: ${plan.todayTarget} câu · ${formatFocusMode(goal.focusMode)}`, 'studyGoalLine');
  appendText(card, `Đã hoàn thành ước tính: ${plan.completedQuestionCount}/${plan.totalPlannedQuestions} câu`, 'muted studyGoalLine');

  const meter = document.createElement('div');
  meter.className = 'studyGoalMeter';
  const fill = document.createElement('span');
  fill.style.width = `${Math.max(4, Math.min(100, plan.progressPercent))}%`;
  meter.appendChild(fill);
  card.appendChild(meter);

  appendText(card, `${plan.progressPercent}% tiến độ kế hoạch`, 'muted studyGoalLine');
  if (plan.warning) appendText(card, plan.warning, 'studyGoalWarning');
  appendText(card, plan.recommendedReason, 'muted studyGoalLine');

  const action = document.createElement('button');
  action.type = 'button';
  action.className = 'btn ok small';
  action.textContent = 'Bắt đầu hôm nay';
  action.addEventListener('click', () => onStartToday?.(plan));
  card.appendChild(action);

  summary.appendChild(card);
}

export function initStudyGoalPanel({ getTopics, getHistory, getAnalytics, getAllQuizzes, onStartToday, onGoalChanged } = {}) {
  if (initialized) return { refresh: () => {} };
  initialized = true;

  const saveButton = getEl('btnSaveStudyGoal');
  const clearButton = getEl('btnClearStudyGoal');
  const focusInput = getEl('goalFocusMode');

  function getPlan() {
    return createStudyPlan({
      goal: loadStudyGoal(),
      history: getHistory?.() || [],
      analytics: getAnalytics?.() || null,
      allQuizzes: getAllQuizzes?.() || []
    });
  }

  function refresh() {
    const goal = loadStudyGoal();
    fillForm(goal);
    renderTopicOptions(getTopics?.() || [], goal?.selectedTopics || []);
    renderPlan(getPlan(), onStartToday);
  }

  saveButton?.addEventListener('click', () => {
    try {
      const targetDate = getEl('goalTargetDate')?.value || '';
      const dailyQuestionTarget = Number(getEl('goalDailyTarget')?.value) || 20;
      const focusMode = getEl('goalFocusMode')?.value || 'balanced';
      const selectedTopics = focusMode === 'selectedTopics' ? getSelectedTopics() : [];

      const saved = saveStudyGoal({ targetDate, dailyQuestionTarget, focusMode, selectedTopics });
      setStatus('Đã lưu mục tiêu học tập.', 'success');
      showToast('Đã lưu mục tiêu học tập.', { type: 'success' });
      onGoalChanged?.(saved);
      refresh();
    } catch (error) {
      setStatus(error?.message || 'Không thể lưu mục tiêu.', 'error');
      showToast(error?.message || 'Không thể lưu mục tiêu.', { type: 'error' });
    }
  });

  clearButton?.addEventListener('click', () => {
    if (!loadStudyGoal()) return;
    if (!confirm('Xóa mục tiêu học tập hiện tại?')) return;
    clearStudyGoal();
    setStatus('Đã xóa mục tiêu học tập.');
    showToast('Đã xóa mục tiêu học tập.', { type: 'info' });
    onGoalChanged?.(null);
    refresh();
  });

  focusInput?.addEventListener('change', refresh);

  refresh();
  return { refresh, getPlan };
}
