let historyPanelInitialized = false;

const dateTimeFormatter = typeof Intl !== 'undefined'
  ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' })
  : null;

function formatDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';

  try {
    return dateTimeFormatter ? dateTimeFormatter.format(date) : date.toLocaleString();
  } catch {
    return date.toLocaleString();
  }
}

function formatDuration(seconds) {
  const totalSeconds = Number(seconds);
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '';

  const rounded = Math.round(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const secs = String(rounded % 60).padStart(2, '0');
  return minutes > 0 ? `${minutes}:${secs}` : `0:${secs}`;
}

function formatAnswerValue(value, choices = []) {
  if (value == null || (Array.isArray(value) && value.length === 0)) return 'Chưa trả lời';

  if (Array.isArray(value)) {
    return value.map(index => choices[index] || `(${index + 1})`).join(' | ');
  }

  if (Number.isInteger(value)) return choices[value] || `(${value + 1})`;
  return String(value);
}

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

function getLocalDateKey(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getHeatmapDays(history, daysToShow = 35) {
  const counts = new Map();
  history.forEach(item => {
    const key = getLocalDateKey(item.createdAt);
    if (!key) return;
    counts.set(key, (counts.get(key) || 0) + 1);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = [];

  for (let offset = daysToShow - 1; offset >= 0; offset--) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = getLocalDateKey(date);
    const count = counts.get(key) || 0;
    days.push({ date, key, count, level: Math.min(4, count) });
  }

  return days;
}

function createActivityHeatmap(history) {
  const wrap = document.createElement('section');
  wrap.className = 'historyHeatmap';
  wrap.setAttribute('aria-label', 'Hoạt động học tập gần đây');

  const head = document.createElement('div');
  head.className = 'historyHeatmapHead';
  appendText(head, 'Hoạt động gần đây', 'historyHeatmapTitle');
  appendText(head, `${history.length} lượt làm bài`, 'muted historyHeatmapCount');
  wrap.appendChild(head);

  const grid = document.createElement('div');
  grid.className = 'historyHeatmapGrid';
  const cells = document.createDocumentFragment();

  getHeatmapDays(history).forEach(day => {
    const cell = document.createElement('span');
    cell.className = `historyHeatmapCell level-${day.level}`;
    const label = `${day.count} lượt làm bài ngày ${formatDateTime(day.date)}`;
    cell.setAttribute('aria-label', label);
    cell.title = label;
    cells.appendChild(cell);
  });

  grid.appendChild(cells);
  wrap.appendChild(grid);

  const legend = document.createElement('div');
  legend.className = 'historyHeatmapLegend muted';
  appendText(legend, 'Ít', '', 'span');
  for (let level = 0; level <= 4; level++) {
    const dot = document.createElement('span');
    dot.className = `historyHeatmapCell level-${level}`;
    dot.setAttribute('aria-hidden', 'true');
    legend.appendChild(dot);
  }
  appendText(legend, 'Nhiều', '', 'span');
  wrap.appendChild(legend);

  return wrap;
}

function getWrongQuestionsCount(item) {
  const questions = item?.details?.questions;
  if (!Array.isArray(questions)) return null;
  return questions.reduce((count, question) => count + (question?.isCorrect === false ? 1 : 0), 0);
}

function canPracticeWrong(item) {
  const count = getWrongQuestionsCount(item);
  return Number.isInteger(count) && count > 0;
}

function getPracticeButtonText(wrongCount) {
  if (!Number.isInteger(wrongCount)) return 'Luyện câu sai';
  return wrongCount > 0 ? 'Luyện câu sai (' + wrongCount + ')' : 'Luyện câu sai';
}

function configurePracticeButton(button, item, wrongCount) {
  button.disabled = !canPracticeWrong(item);
  button.title = !item.details
    ? 'Details are only available for new attempts.'
    : wrongCount === 0
      ? 'Không có câu sai trong lượt làm bài này'
      : 'Tạo bài luyện tập từ các câu sai';
}

function createDueReviewCard(dueCount, onReviewDue) {
  const card = document.createElement('section');
  card.className = 'historyDueCard';
  card.setAttribute('aria-label', 'Ôn tập hôm nay');

  const text = document.createElement('div');
  appendText(text, 'Ôn tập hôm nay', 'historyDueTitle');
  appendText(text, `Câu cần ôn: ${dueCount}`, 'muted historyDueCount');
  appendText(text, dueCount > 0
    ? 'Các câu đã đến hạn theo lịch ôn tập cá nhân.'
    : 'Khi bạn làm quiz, hệ thống sẽ tự tạo lịch ôn lại câu yếu.', 'muted historyDueHint');
  card.appendChild(text);

  const button = appendButton(card, dueCount > 0 ? `Ôn tập (${dueCount})` : 'Chưa có câu cần ôn', 'btn small ok', () => {
    if (dueCount > 0) onReviewDue?.();
  });
  button.disabled = dueCount <= 0;
  button.title = dueCount > 0
    ? 'Bắt đầu phiên ôn tập các câu đã đến hạn'
    : 'Hãy làm thêm bài quiz hoặc quay lại sau nhé';

  return card;
}

function createHistoryItem(item, onViewDetails, onPracticeWrong) {
  const row = document.createElement('article');
  row.className = 'historyItem';

  const top = document.createElement('div');
  top.className = 'historyItemTop';

  const score = document.createElement('div');
  score.className = 'historyScore';
  score.textContent = `${item.correctCount}/${item.totalQuestions} câu đúng`;

  const percent = document.createElement('span');
  percent.className = 'pill';
  percent.textContent = `${item.percentage}%`;

  top.append(score, percent);
  if (item.mode === 'mock_exam') {
    const mode = document.createElement('span');
    mode.className = 'pill historyModePill';
    mode.textContent = 'Mock Exam';
    top.appendChild(mode);
  }
  row.appendChild(top);

  const details = [`${formatDateTime(item.createdAt)}`, `${item.totalQuestions} câu`];
  const duration = formatDuration(item.timeSpent ?? item.timeSpentSeconds);
  if (duration) details.push(`Thời gian: ${duration}`);

  appendText(row, details.join(' · '), 'muted historyMeta');

  const actions = document.createElement('div');
  actions.className = 'historyItemActions';
  appendButton(actions, 'Xem chi tiết', 'btn small secondary', () => onViewDetails?.(item.id));

  const wrongCount = getWrongQuestionsCount(item);
  const practiceButton = appendButton(
    actions,
    getPracticeButtonText(wrongCount),
    'btn small ok',
    () => onPracticeWrong?.(item)
  );
  configurePracticeButton(practiceButton, item, wrongCount);

  row.appendChild(actions);

  return row;
}

function createChoiceList(question) {
  const choices = Array.isArray(question.choices) ? question.choices : [];
  if (!choices.length) return null;

  const userAnswers = Array.isArray(question.userAnswer)
    ? question.userAnswer
    : Number.isInteger(question.userAnswer)
      ? [question.userAnswer]
      : [];
  const correctAnswers = Array.isArray(question.correctAnswer)
    ? question.correctAnswer
    : Number.isInteger(question.correctAnswer)
      ? [question.correctAnswer]
      : [];

  const userAnswerSet = new Set(userAnswers);
  const correctAnswerSet = new Set(correctAnswers);
  const list = document.createElement('ol');
  list.className = 'historyChoiceList';
  const fragment = document.createDocumentFragment();

  choices.forEach((choice, index) => {
    const item = document.createElement('li');
    item.className = 'historyChoice';
    const isUserAnswer = userAnswerSet.has(index);
    const isCorrectAnswer = correctAnswerSet.has(index);
    if (isUserAnswer) item.classList.add('is-user-answer');
    if (isCorrectAnswer) item.classList.add('is-correct-answer');

    appendText(item, choice || `Lựa chọn ${index + 1}`, 'historyChoiceText');

    if (isUserAnswer || isCorrectAnswer) {
      const badges = document.createElement('div');
      badges.className = 'historyChoiceBadges';
      if (isUserAnswer) appendText(badges, 'Bạn chọn', 'historyMiniBadge');
      if (isCorrectAnswer) appendText(badges, 'Đáp án đúng', 'historyMiniBadge is-correct');
      item.appendChild(badges);
    }

    fragment.appendChild(item);
  });

  list.appendChild(fragment);
  return list;
}

function createDetailQuestion(question) {
  const item = document.createElement('article');
  item.className = `historyDetailQuestion ${question.isCorrect ? 'is-correct' : 'is-wrong'}`;

  const head = document.createElement('div');
  head.className = 'historyDetailQuestionHead';
  appendText(head, `Câu ${Number(question.index) + 1}`, 'historyDetailQuestionTitle');
  appendText(head, question.isCorrect ? 'Đúng' : 'Sai', `historyStatus ${question.isCorrect ? 'is-correct' : 'is-wrong'}`, 'span');
  item.appendChild(head);

  appendText(item, question.questionText || '(Không có nội dung câu hỏi)', 'historyQuestionText');

  const choiceList = createChoiceList(question);
  if (choiceList) item.appendChild(choiceList);

  const answerBlock = document.createElement('div');
  answerBlock.className = 'historyAnswerBlock';
  appendText(answerBlock, `Bạn chọn: ${formatAnswerValue(question.userAnswer, question.choices)}`, 'historyAnswerLine');
  appendText(answerBlock, `Đáp án đúng: ${formatAnswerValue(question.correctAnswer, question.choices)}`, 'historyAnswerLine is-correct');
  item.appendChild(answerBlock);

  return item;
}

export function initHistoryPanel({ loadHistory, clearHistory, onPracticeWrong, onReviewDue, loadDueReviewCount } = {}) {
  if (historyPanelInitialized) return { refresh: () => {} };
  historyPanelInitialized = true;

  const list = document.getElementById('historyList');
  const clearButton = document.getElementById('btnClearHistory');
  let currentMode = 'list';
  let currentDetailId = null;
  let cachedHistory = [];
  let detailRenderToken = 0;

  function refreshHistoryCache() {
    const history = loadHistory?.();
    cachedHistory = Array.isArray(history) ? history : [];
    return cachedHistory;
  }

  function getHistory() {
    return cachedHistory;
  }

  function findHistoryItem(id) {
    return getHistory().find(item => item.id === id) || null;
  }

  function cancelPendingDetailRender() {
    detailRenderToken += 1;
  }

  function renderEmpty(parent = list) {
    const empty = document.createElement('div');
    empty.className = 'muted historyEmpty';
    empty.textContent = 'Lịch sử giúp bạn xem lại điểm, câu sai và luyện lại sau mỗi lượt làm bài. Hãy bấm Bắt đầu để tạo lịch sử đầu tiên.';
    parent.appendChild(empty);
  }

  function renderList() {
    if (!list) return;

    cancelPendingDetailRender();
    currentMode = 'list';
    currentDetailId = null;

    const history = refreshHistoryCache();
    const dueCount = Math.max(0, Number(loadDueReviewCount?.()) || 0);
    const fragment = document.createDocumentFragment();
    if (clearButton) clearButton.disabled = history.length === 0;

    fragment.appendChild(createDueReviewCard(dueCount, onReviewDue));

    if (!history.length) {
      renderEmpty(fragment);
      list.replaceChildren(fragment);
      return;
    }

    fragment.appendChild(createActivityHeatmap(history));
    history.forEach(item => fragment.appendChild(createHistoryItem(item, renderDetail, onPracticeWrong)));
    list.replaceChildren(fragment);
  }

  function renderQuestionsChunked(container, questions, token, startIndex = 0) {
    if (token !== detailRenderToken) return;

    const chunkSize = 20;
    const fragment = document.createDocumentFragment();
    const end = Math.min(startIndex + chunkSize, questions.length);

    for (let i = startIndex; i < end; i++) {
      fragment.appendChild(createDetailQuestion(questions[i]));
    }

    container.appendChild(fragment);

    if (end < questions.length) {
      requestAnimationFrame(() => renderQuestionsChunked(container, questions, token, end));
    }
  }

  function renderDetail(id) {
    if (!list) return;

    const item = findHistoryItem(id) || refreshHistoryCache().find(historyItem => historyItem.id === id) || null;
    if (!item) return renderList();

    cancelPendingDetailRender();
    const token = detailRenderToken;
    currentMode = 'detail';
    currentDetailId = id;
    if (clearButton) clearButton.disabled = getHistory().length === 0;

    const wrapper = document.createElement('section');
    wrapper.className = 'historyDetailView';

    const top = document.createElement('div');
    top.className = 'historyDetailTop';
    const backButton = appendButton(top, '← Quay lại', 'btn small ghost', renderList);
    wrapper.appendChild(top);

    appendText(wrapper, item.mode === 'mock_exam' ? 'Chi tiết Mock Exam' : 'Chi tiết lượt làm bài', 'historyDetailTitle');
    appendText(
      wrapper,
      `${formatDateTime(item.createdAt)} · ${item.correctCount}/${item.totalQuestions} câu đúng · ${item.percentage}%`,
      'muted historyMeta'
    );

    const duration = formatDuration(item.timeSpent ?? item.timeSpentSeconds);
    if (duration) appendText(wrapper, `Thời gian: ${duration}`, 'muted historyMeta');

    if (item.mode === 'mock_exam' && Array.isArray(item.topicBreakdown) && item.topicBreakdown.length) {
      const sectionWrap = document.createElement('section');
      sectionWrap.className = 'historyMockSections';
      appendText(sectionWrap, 'Review theo phần', 'historyDetailTitle');
      item.topicBreakdown.slice(0, 8).forEach(section => {
        const row = document.createElement('div');
        row.className = `historyMockSection ${section.percentage >= 70 ? 'is-strong' : 'is-weak'}`;
        appendText(row, `${section.topic}: ${section.correct}/${section.total} đúng (${section.percentage}%)`, 'historyMockSectionText');
        appendText(row, `${section.wrong} sai · ${section.unanswered || 0} chưa làm`, 'muted historyMockSectionMeta');
        sectionWrap.appendChild(row);
      });
      wrapper.appendChild(sectionWrap);
    }

    const detailActions = document.createElement('div');
    detailActions.className = 'historyItemActions';
    const wrongCount = getWrongQuestionsCount(item);
    const practiceButton = appendButton(
      detailActions,
      getPracticeButtonText(wrongCount),
      'btn small ok',
      () => onPracticeWrong?.(item)
    );
    configurePracticeButton(practiceButton, item, wrongCount);
    wrapper.appendChild(detailActions);

    const questions = item.details?.questions;
    if (!Array.isArray(questions) || !questions.length) {
      appendText(wrapper, 'Details are only available for new attempts.', 'muted historyEmpty');
      list.replaceChildren(wrapper);
      requestAnimationFrame(() => backButton.focus({ preventScroll: true }));
      return;
    }

    const questionsWrap = document.createElement('div');
    questionsWrap.className = 'historyDetailQuestions';
    wrapper.appendChild(questionsWrap);

    if (item.details.truncated) {
      appendText(wrapper, 'Một số câu đã được lược bớt để giữ lịch sử nhỏ gọn.', 'muted historyMeta');
    }

    list.replaceChildren(wrapper);
    requestAnimationFrame(() => backButton.focus({ preventScroll: true }));
    renderQuestionsChunked(questionsWrap, questions, token);
  }

  clearButton?.addEventListener('click', () => {
    if (!getHistory().length && !refreshHistoryCache().length) return;
    if (!confirm('Xóa toàn bộ lịch sử làm bài?')) return;

    clearHistory?.();
    cachedHistory = [];
    renderList();
  });

  function refresh() {
    refreshHistoryCache();
    if (currentMode === 'detail' && currentDetailId && findHistoryItem(currentDetailId)) {
      renderDetail(currentDetailId);
      return;
    }

    renderList();
  }

  refresh();
  return { refresh };
}
