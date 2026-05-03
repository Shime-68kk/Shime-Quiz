import {
  addQuestionToCollection,
  createCollection,
  getCollectionQuestionCount,
  getQuestionCollectionMembership,
  isQuestionInCollection,
  loadCollections,
  removeQuestionFromCollection
} from '../quiz/collections.js';

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

function setStatus(message, type = '') {
  const status = document.getElementById('collectionsStatus');
  if (!status) return;
  status.textContent = message || '';
  status.classList.toggle('is-error', type === 'error');
  status.classList.toggle('is-success', type === 'success');
}

function fillSelect(select, collections, selectedId = '') {
  if (!select) return;

  const nextSelected = selectedId || select.value || collections[0]?.id || '';
  select.replaceChildren();

  if (!collections.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = 'Chưa có bộ sưu tập';
    select.appendChild(option);
    select.disabled = true;
    return;
  }

  collections.forEach(collection => {
    const option = document.createElement('option');
    option.value = collection.id;
    option.textContent = `${collection.name} (${getCollectionQuestionCount(collection)})`;
    select.appendChild(option);
  });

  select.disabled = false;
  select.value = collections.some(collection => collection.id === nextSelected) ? nextSelected : collections[0].id;
}

function createCollectionItem(collection, onPracticeCollection, getAvailableCount) {
  const item = document.createElement('article');
  item.className = 'collectionItem';

  const top = document.createElement('div');
  top.className = 'collectionItemTop';
  appendText(top, collection.name, 'collectionName');
  appendText(top, `${getCollectionQuestionCount(collection)} câu`, 'pill collectionCount', 'span');
  item.appendChild(top);

  const availableCount = Number(getAvailableCount?.(collection) || 0);
  const missingCount = Math.max(0, getCollectionQuestionCount(collection) - availableCount);
  const meta = availableCount > 0
    ? `${availableCount} câu có trong dữ liệu hiện tại${missingCount ? ` · ${missingCount} câu thiếu` : ''}`
    : 'Chưa tìm thấy câu nào trong dữ liệu hiện tại';
  appendText(item, meta, 'muted collectionMeta');

  const actions = document.createElement('div');
  actions.className = 'collectionActions';
  const practiceButton = appendButton(actions, 'Luyện bộ này', 'btn small ok', () => onPracticeCollection?.(collection));
  practiceButton.disabled = availableCount <= 0;
  item.appendChild(actions);

  return item;
}

export function initCollectionsPanel({
  onPracticeCollection,
  getCurrentQuestionKey,
  getAvailableCount,
  onCollectionsChanged
} = {}) {
  if (initialized) return { refresh: () => {}, refreshCurrentQuestionControls: () => {} };
  initialized = true;

  const list = document.getElementById('collectionsList');
  const nameInput = document.getElementById('collectionNameInput');
  const createButton = document.getElementById('btnCreateCollection');
  const select = document.getElementById('collectionSelect');
  const toggleButton = document.getElementById('btnToggleQuestionCollection');

  function getCollections() {
    return loadCollections();
  }

  function refreshCurrentQuestionControls() {
    const collections = getCollections();
    const questionKey = getCurrentQuestionKey?.() || '';
    fillSelect(select, collections);

    if (!toggleButton) return;

    if (!collections.length) {
      toggleButton.disabled = true;
      toggleButton.textContent = 'Tạo bộ trước';
      toggleButton.title = 'Tạo bộ sưu tập trước khi thêm câu hỏi';
      return;
    }

    if (!questionKey) {
      toggleButton.disabled = true;
      toggleButton.textContent = 'Thêm vào bộ';
      toggleButton.title = 'Chưa có câu hỏi hiện tại';
      return;
    }

    const selectedCollection = collections.find(collection => collection.id === select?.value) || collections[0];
    const isInSelected = isQuestionInCollection(selectedCollection, questionKey);
    const membershipCount = getQuestionCollectionMembership(questionKey, collections).length;

    toggleButton.disabled = false;
    toggleButton.textContent = isInSelected ? 'Bỏ khỏi bộ' : 'Thêm vào bộ';
    toggleButton.title = membershipCount
      ? `Câu này đang nằm trong ${membershipCount} bộ sưu tập`
      : 'Thêm câu hiện tại vào bộ sưu tập đã chọn';
  }

  function renderList() {
    if (!list) return;

    const collections = getCollections();
    list.replaceChildren();

    if (!collections.length) {
      appendText(list, 'Bạn chưa có bộ sưu tập nào. Tạo một bộ để lưu câu quan trọng và luyện lại theo nhóm.', 'muted collectionsEmpty');
      refreshCurrentQuestionControls();
      return;
    }

    const fragment = document.createDocumentFragment();
    collections.forEach(collection => {
      fragment.appendChild(createCollectionItem(collection, onPracticeCollection, getAvailableCount));
    });
    list.appendChild(fragment);
    refreshCurrentQuestionControls();
  }

  createButton?.addEventListener('click', () => {
    const name = nameInput?.value || '';
    if (!name.trim()) {
      setStatus('Nhập tên bộ sưu tập trước.', 'error');
      nameInput?.focus();
      return;
    }

    createCollection(name);
    if (nameInput) nameInput.value = '';
    setStatus('Đã tạo bộ sưu tập.', 'success');
    renderList();
    onCollectionsChanged?.();
  });

  nameInput?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    createButton?.click();
  });

  select?.addEventListener('change', refreshCurrentQuestionControls);

  toggleButton?.addEventListener('click', () => {
    const collections = getCollections();
    const collection = collections.find(item => item.id === select?.value) || collections[0];
    const questionKey = getCurrentQuestionKey?.() || '';

    if (!collection) {
      setStatus('Bạn cần tạo bộ sưu tập trước.', 'error');
      return;
    }

    if (!questionKey) {
      setStatus('Không xác định được câu hỏi hiện tại.', 'error');
      return;
    }

    if (isQuestionInCollection(collection, questionKey)) {
      removeQuestionFromCollection(collection.id, questionKey);
      setStatus('Đã bỏ câu hỏi khỏi bộ sưu tập.', 'success');
    } else {
      addQuestionToCollection(collection.id, questionKey);
      setStatus('Đã thêm câu hỏi vào bộ sưu tập.', 'success');
    }

    renderList();
    onCollectionsChanged?.();
  });

  renderList();
  return { refresh: renderList, refreshCurrentQuestionControls };
}
