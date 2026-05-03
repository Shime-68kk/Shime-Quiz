import { BOOKMARK_STORAGE_KEY } from '../quiz/bookmarks.js';
import { COLLECTIONS_STORAGE_KEY } from '../quiz/collections.js';
import { HISTORY_STORAGE_KEY } from '../quiz/history.js';
import { STORAGE_KEY as PROGRESS_STORAGE_KEY } from '../quiz/progress.js';
import { getJSON, getStorageItem, setStorageItem } from '../utils/storage.js';
import { showToast } from './toast.js';

export const ONBOARDING_DISMISSED_KEY = 'quizOnboardingDismissedV1';
export const ONBOARDING_IMPORTED_DATA_KEY = 'quizOnboardingImportedDataV1';

let initialized = false;

function hasArrayItems(key) {
  const value = getJSON(key);
  return Array.isArray(value) && value.length > 0;
}

function hasProgressData() {
  const value = getJSON(PROGRESS_STORAGE_KEY);
  return Boolean(value && typeof value === 'object');
}

export function markOnboardingImportedData() {
  setStorageItem(ONBOARDING_IMPORTED_DATA_KEY, '1');
}

export function markOnboardingDismissed() {
  setStorageItem(ONBOARDING_DISMISSED_KEY, '1');
}

export function hasMeaningfulLocalLearningData() {
  return Boolean(
    hasArrayItems(HISTORY_STORAGE_KEY) ||
    hasProgressData() ||
    getStorageItem(ONBOARDING_IMPORTED_DATA_KEY) === '1' ||
    hasArrayItems(BOOKMARK_STORAGE_KEY) ||
    hasArrayItems(COLLECTIONS_STORAGE_KEY)
  );
}

export function shouldShowOnboarding() {
  return getStorageItem(ONBOARDING_DISMISSED_KEY) !== '1' && !hasMeaningfulLocalLearningData();
}

export function initOnboarding({
  onLoadJson,
  onLoadTextbook,
  onStartExisting,
  onHelp,
  hasQuizData
} = {}) {
  if (initialized) return { refresh: () => {} };
  initialized = true;

  const card = document.getElementById('firstRunOnboarding');
  const dismissButton = document.getElementById('btnDismissOnboarding');
  const loadJsonButton = document.getElementById('btnOnboardingLoadJson');
  const loadTextbookButton = document.getElementById('btnOnboardingLoadTextbook');
  const startButton = document.getElementById('btnOnboardingStart');
  const helpButton = document.getElementById('btnOnboardingHelp');

  function refresh() {
    if (!card) return;
    card.hidden = !shouldShowOnboarding();
  }

  dismissButton?.addEventListener('click', () => {
    markOnboardingDismissed();
    refresh();
    showToast('Đã ẩn hướng dẫn bắt đầu. Bạn có thể dùng nút Hướng dẫn khi cần.', { type: 'info' });
  });

  loadJsonButton?.addEventListener('click', () => {
    onLoadJson?.();
  });

  loadTextbookButton?.addEventListener('click', () => {
    onLoadTextbook?.();
  });

  startButton?.addEventListener('click', () => {
    if (!hasQuizData?.()) {
      showToast('Chưa có dữ liệu quiz. Hãy nạp JSON hoặc giáo trình trước.', { type: 'warning' });
      onLoadJson?.();
      return;
    }

    onStartExisting?.();
  });

  helpButton?.addEventListener('click', () => {
    onHelp?.();
  });

  refresh();
  return { refresh };
}
