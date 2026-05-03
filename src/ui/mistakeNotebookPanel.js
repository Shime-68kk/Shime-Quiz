let mistakeNotebookPanelInitialized = false;

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

function formatAnswerValue(value, choices = []) {
  if (value == null || (Array.isArray(value) && !value.length)) return 'Chưa trả lời';
  if (Array.isArray(value)) return value.map(index => choices[index] || `(${index + 1})`).join(' | ');
  if (Number.isInteger(value)) return choices[value] || `(${value + 1})`;
  return String(value);
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Không rõ thời gian';
  try {
    return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date);
  } catch {
    return date.toLocaleString();
  }
}

function getStatusLabel(status) {
  if (status === 'reviewed') return 'Đã xem lại';
  if (status === 'resolved') return 'Đã xử lý';
  return 'Đang mở';
}

function createNotebookEntry(entry, { onStatusChange, onSaveNote } = {}) {
  const item = document.createElement('article');
  item.className = `mistakeEntry is-${entry.status || 'open'}`;

  const head = document.createElement('div');
  head.className = 'mistakeEntryHead';
  const titleWrap = document.createElement('div');
  appendText(titleWrap, entry.topic || 'Tất cả câu hỏi', 'mistakeTopic');
  appendText(titleWrap, `Sai ${entry.mistakeCount || 1} lần · ${formatDate(entry.lastUpdatedAt || entry.createdAt)}`, 'muted mistakeMeta');
  head.appendChild(titleWrap);
  appendText(head, getStatusLabel(entry.status), `mistakeStatus is-${entry.status || 'open'}`, 'span');
  item.appendChild(head);

  appendText(item, entry.questionText || 'Câu hỏi chưa có nội dung', 'mistakeQuestionText');

  const answers = document.createElement('div');
  answers.className = 'mistakeAnswers';
  appendText(answers, `Bạn chọn: ${formatAnswerValue(entry.userAnswer, entry.choices)}`, 'mistakeAnswer is-user');
  appendText(answers, `Đáp án đúng: ${formatAnswerValue(entry.correctAnswer, entry.choices)}`, 'mistakeAnswer is-correct');
  item.appendChild(answers);

  const note = document.createElement('textarea');
  note.className = 'mistakeNoteInput';
  note.rows = 2;
  note.maxLength = 600;
  note.placeholder = 'Ghi chú ngắn: vì sao sai, cần nhớ gì...';
  note.value = entry.note || '';
  note.setAttribute('aria-label', 'Ghi chú lỗi sai');
  item.appendChild(note);

  const actions = document.createElement('div');
  actions.className = 'mistakeEntryActions';
  appendButton(actions, 'Lưu ghi chú', 'btn tiny secondary', () => onSaveNote?.(entry.questionKey, note.value));
  appendButton(actions, 'Đã xem lại', 'btn tiny secondary', () => onStatusChange?.(entry.questionKey, 'reviewed')).disabled = entry.status === 'reviewed';
  appendButton(actions, 'Đã xử lý', 'btn tiny ok', () => onStatusChange?.(entry.questionKey, 'resolved')).disabled = entry.status === 'resolved';
  if (entry.status !== 'open') appendButton(actions, 'Mở lại', 'btn tiny ghost', () => onStatusChange?.(entry.questionKey, 'open'));
  item.appendChild(actions);

  return item;
}

export function initMistakeNotebookPanel({
  loadNotebook,
  getStats,
  onPracticeNotebook,
  onStatusChange,
  onSaveNote
} = {}) {
  if (mistakeNotebookPanelInitialized) return { refresh: () => {} };
  mistakeNotebookPanelInitialized = true;

  const panel = document.getElementById('mistakeNotebookPanel');
  const list = document.getElementById('mistakeNotebookList');
  const count = document.getElementById('mistakeNotebookCount');
  const practiceButton = document.getElementById('btnPracticeMistakeNotebook');
  const filterButtons = Array.from(document.querySelectorAll('[data-mistake-filter]'));
  let filter = 'open';
  let cachedNotebook = [];

  function refreshCache() {
    const items = loadNotebook?.();
    cachedNotebook = Array.isArray(items) ? items : [];
    return cachedNotebook;
  }

  function getFilteredItems() {
    if (filter === 'all') return cachedNotebook;
    return cachedNotebook.filter(item => (item.status || 'open') === filter);
  }

  function updateFilterState() {
    filterButtons.forEach(button => {
      const active = button.dataset.mistakeFilter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function renderEmpty(fragment) {
    const empty = document.createElement('div');
    empty.className = 'muted mistakeEmpty';
    empty.textContent = filter === 'all'
      ? 'Bạn chưa có lỗi sai nào trong sổ. Sau khi làm bài, hãy thêm câu sai để ôn lại có hệ thống.'
      : 'Không có mục nào trong bộ lọc này.';
    fragment.appendChild(empty);
  }

  function render() {
    if (!list) return;

    refreshCache();
    const stats = getStats?.(cachedNotebook) || { total: cachedNotebook.length, open: 0, reviewed: 0, resolved: 0 };
    if (count) count.textContent = `${stats.open || 0} đang mở · ${stats.total || 0} tổng`;
    if (practiceButton) {
      practiceButton.disabled = (stats.open || 0) <= 0;
      practiceButton.textContent = (stats.open || 0) > 0 ? `Luyện sổ lỗi (${stats.open})` : 'Chưa có lỗi cần luyện';
    }

    updateFilterState();
    const fragment = document.createDocumentFragment();
    const items = getFilteredItems();
    if (!items.length) renderEmpty(fragment);
    else items.forEach(entry => fragment.appendChild(createNotebookEntry(entry, {
      onStatusChange: (questionKey, status) => {
        onStatusChange?.(questionKey, status);
        render();
      },
      onSaveNote: (questionKey, note) => {
        onSaveNote?.(questionKey, note);
        render();
      }
    })));

    list.replaceChildren(fragment);
  }

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filter = button.dataset.mistakeFilter || 'open';
      render();
    });
  });

  practiceButton?.addEventListener('click', () => {
    const openItems = refreshCache().filter(item => (item.status || 'open') === 'open');
    onPracticeNotebook?.(openItems);
  });

  render();
  return { refresh: render };
}
