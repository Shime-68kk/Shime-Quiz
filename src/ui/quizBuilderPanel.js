import { buildCustomQuiz, getBuilderStats } from '../quiz/quizBuilder.js';

let initialized = false;

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function getNumber(id, fallback = 0) {
  const value = Number(document.getElementById(id)?.value);
  return Number.isFinite(value) ? value : fallback;
}

function setNumber(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = String(value);
}

function getChecked(id) {
  return Boolean(document.getElementById(id)?.checked);
}

function setChecked(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = Boolean(checked);
}


function getPresetHint(preset) {
  const hints = {
    custom: 'Tùy chỉnh số câu, chủ đề và nguồn ưu tiên theo nhu cầu.',
    quickReview: 'Ôn nhanh câu cần củng cố: ưu tiên câu cần ôn, mastery thấp, từng sai và chưa làm.',
    deepDive: 'Đào sâu một chương/chủ đề: chọn chủ đề trước, sau đó ưu tiên câu mastery thấp trong phạm vi đó.',
    mockExam: 'Giả lập đề thi cân bằng: phân bổ theo nhóm, chỉ ưu tiên nhẹ câu mastery thấp.',
    masteryBoost: 'Tập trung nâng vùng yếu: chọn câu mastery thấp, câu cần ôn và câu từng sai.'
  };

  return hints[preset] || hints.custom;
}

function setPresetActive(preset) {
  document.querySelectorAll('[data-builder-preset]').forEach(button => {
    const active = button.dataset.builderPreset === preset;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function createTopicCheckbox(topic, checked = false) {
  const label = document.createElement('label');
  label.className = 'builderTopicOption';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.value = topic.key;
  input.checked = checked;

  const text = document.createElement('span');
  text.textContent = `${topic.label} (${topic.count})`;

  label.append(input, text);
  return label;
}

function getSelectedTopicKeys() {
  return Array.from(document.querySelectorAll('#builderTopicList input[type="checkbox"]:checked'))
    .map(input => input.value)
    .filter(Boolean);
}

function renderTopics(topics, selectedKeys = []) {
  const list = document.getElementById('builderTopicList');
  if (!list) return;

  const selected = new Set(selectedKeys);
  list.replaceChildren();

  if (!topics.length) {
    const empty = document.createElement('div');
    empty.className = 'muted builderEmpty';
    empty.textContent = 'Chưa có dữ liệu chương/chủ đề. Nạp JSON để tạo đề tùy chỉnh.';
    list.appendChild(empty);
    return;
  }

  const allLabel = createTopicCheckbox({ key: '', label: 'Tất cả câu hỏi', count: topics.reduce((sum, item) => sum + item.count, 0) }, selected.size === 0);
  const allInput = allLabel.querySelector('input');
  allInput.addEventListener('change', () => {
    if (allInput.checked) {
      list.querySelectorAll('input[type="checkbox"]').forEach(input => {
        if (input !== allInput) input.checked = false;
      });
    }
    updatePreview();
  });
  list.appendChild(allLabel);

  topics.forEach(topic => {
    const row = createTopicCheckbox(topic, selected.has(topic.key));
    const input = row.querySelector('input');
    input.addEventListener('change', () => {
      if (input.checked && allInput) allInput.checked = false;
      if (!getSelectedTopicKeys().length && allInput) allInput.checked = true;
      updatePreview();
    });
    list.appendChild(row);
  });
}

let currentPreset = 'custom';
let latestStats = { total: 0, topics: [], dueCount: 0, bookmarkedCount: 0, weakCount: 0, lowMasteryCount: 0 };
let getAllQuizzesRef = () => [];
let getBookmarksRef = () => [];
let getDueReviewKeysRef = () => new Set();
let getHistoryRef = () => [];
let onStartQuizRef = () => false;

function getBuildOptions() {
  const selectedTopicKeys = getSelectedTopicKeys();
  const allTopicInput = document.querySelector('#builderTopicList input[value=""]');

  return {
    preset: currentPreset,
    topicKeys: allTopicInput?.checked ? [] : selectedTopicKeys,
    count: getNumber('builderQuestionCount', currentPreset === 'mockExam' ? 60 : 20),
    shuffle: getChecked('builderShuffle'),
    timerMinutes: getNumber('builderTimerMinutes', 0),
    includeBookmarked: getChecked('builderIncludeBookmarks'),
    includeDueReview: getChecked('builderIncludeDue'),
    includeWeak: getChecked('builderIncludeWeak'),
    bookmarks: getBookmarksRef(),
    reviewKeys: getDueReviewKeysRef(),
    history: getHistoryRef()
  };
}

function updatePreview() {
  const result = buildCustomQuiz(getAllQuizzesRef(), getBuildOptions());
  const count = result.selectedCount || 0;
  const button = document.getElementById('btnStartBuilderQuiz');

  setText('builderCountPreview', count > 0 ? `${count} câu được chọn` : 'Không có câu phù hợp');
  setText('builderSourceHint', result.sourceSummary || 'Nguồn chọn sẽ hiển thị tại đây.');
  setText('builderStatus', result.message || (count > 0 ? (result.selectionHint || 'Sẵn sàng tạo đề từ cấu hình hiện tại.') : 'Hãy nạp dữ liệu hoặc đổi bộ lọc.'));
  setText('builderPresetHint', getPresetHint(currentPreset));
  if (button) button.disabled = count <= 0;
}

function applyPreset(preset) {
  currentPreset = preset || 'custom';
  setPresetActive(currentPreset);

  if (currentPreset === 'quickReview') {
    setNumber('builderQuestionCount', 20);
    setChecked('builderIncludeWeak', true);
    setChecked('builderIncludeDue', true);
    setChecked('builderIncludeBookmarks', false);
    setNumber('builderTimerMinutes', 0);
  } else if (currentPreset === 'deepDive') {
    setNumber('builderQuestionCount', 30);
    setChecked('builderIncludeWeak', false);
    setChecked('builderIncludeDue', false);
    setChecked('builderIncludeBookmarks', false);
    setNumber('builderTimerMinutes', 0);
  } else if (currentPreset === 'mockExam') {
    setNumber('builderQuestionCount', 60);
    setChecked('builderIncludeWeak', false);
    setChecked('builderIncludeDue', false);
    setChecked('builderIncludeBookmarks', false);
    setChecked('builderShuffle', true);
    if (getNumber('builderTimerMinutes', 0) <= 0) setNumber('builderTimerMinutes', 60);
  } else if (currentPreset === 'masteryBoost') {
    setNumber('builderQuestionCount', 20);
    setChecked('builderIncludeWeak', true);
    setChecked('builderIncludeDue', true);
    setChecked('builderIncludeBookmarks', false);
    setChecked('builderShuffle', true);
    setNumber('builderTimerMinutes', 0);
  } else {
    setNumber('builderQuestionCount', 20);
  }

  updatePreview();
}

function refresh() {
  latestStats = getBuilderStats(getAllQuizzesRef(), {
    bookmarks: getBookmarksRef(),
    reviewKeys: getDueReviewKeysRef(),
    history: getHistoryRef()
  });

  const selectedKeys = getSelectedTopicKeys();
  renderTopics(latestStats.topics, selectedKeys);
  setText('builderStats', `${latestStats.total} câu · ${latestStats.topics.length || 1} nhóm · ${latestStats.lowMasteryCount || 0} mastery thấp · ${latestStats.weakCount} câu từng sai · ${latestStats.dueCount} cần ôn · ${latestStats.bookmarkedCount} đã lưu`);
  updatePreview();
}

export function initQuizBuilderPanel({ getAllQuizzes, getBookmarks, getDueReviewKeys, getHistory, onStartQuiz } = {}) {
  if (initialized) return { refresh };
  initialized = true;

  getAllQuizzesRef = typeof getAllQuizzes === 'function' ? getAllQuizzes : getAllQuizzesRef;
  getBookmarksRef = typeof getBookmarks === 'function' ? getBookmarks : getBookmarksRef;
  getDueReviewKeysRef = typeof getDueReviewKeys === 'function' ? getDueReviewKeys : getDueReviewKeysRef;
  getHistoryRef = typeof getHistory === 'function' ? getHistory : getHistoryRef;
  onStartQuizRef = typeof onStartQuiz === 'function' ? onStartQuiz : onStartQuizRef;

  document.querySelectorAll('[data-builder-preset]').forEach(button => {
    button.addEventListener('click', () => applyPreset(button.dataset.builderPreset || 'custom'));
  });

  [
    'builderQuestionCount',
    'builderTimerMinutes',
    'builderShuffle',
    'builderIncludeBookmarks',
    'builderIncludeDue',
    'builderIncludeWeak'
  ].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updatePreview);
    document.getElementById(id)?.addEventListener('change', updatePreview);
  });

  document.getElementById('btnStartBuilderQuiz')?.addEventListener('click', () => {
    const result = buildCustomQuiz(getAllQuizzesRef(), getBuildOptions());
    if (!result.quiz) {
      setText('builderStatus', result.message || 'Không có câu hỏi phù hợp để tạo đề.');
      return;
    }

    onStartQuizRef(result.quiz, {
      preset: currentPreset,
      selectedCount: result.selectedCount,
      message: result.message,
      selectionHint: result.selectionHint,
      sourceSummary: result.sourceSummary
    });
  });

  applyPreset('custom');
  refresh();
  return { refresh };
}
