import { loadBundledQuizData, parseQuizJsonText } from './data/questionLoader.js';
import { buildSearchIndex, shouldShowQuestion } from './quiz/search.js';
import { createExamQuiz, EXAM_TITLE_PREFIX } from './quiz/quizEngine.js';
import { QUIZ_BUILDER_TITLE_PREFIX, buildCustomQuiz, flattenQuestionPool, getBuilderTopics } from './quiz/quizBuilder.js';
import { clearProgressData, createDebouncedProgressSaver, loadProgressData, saveProgressData, STORAGE_KEY as PROGRESS_STORAGE_KEY } from './quiz/progress.js';
import { clearQuizHistory, createQuizHistoryItem, HISTORY_STORAGE_KEY, loadQuizHistory, saveQuizHistoryItem } from './quiz/history.js';
import { asArrayUserAns, calculateQuizScore, isAnswerCorrect } from './quiz/scoring.js';
import { $, exposeDomGlobals } from './ui/dom.js';
import {
  closeTextbookImporter,
  createSheepPopupController,
  importerPasteExample,
  openTextbookImporter,
  setupMobileToolsMenu
} from './ui/modals.js';
import { initTextbookImporter } from './ui/textbookImporter.js';
import { buildResultTopicBreakdown, showQuizResult } from './ui/renderResult.js';
import {
  applyChoiceUI,
  buildQuestionMap,
  initAIExplain,
  renderMathDebounced,
  renderQuestion as renderQuizQuestion,
  renderQuizSelect,
  setupChoiceDelegation,
  updateCurrentQuestionCell,
  updateQuestionCell
} from './ui/renderQuiz.js';
import { initHelpTour } from './ui/helpTour.js';
import { initTheme, toggleTheme } from './ui/theme.js';
import { initKeyboardShortcuts } from './ui/keyboardShortcuts.js';
import { initHistoryPanel } from './ui/historyPanel.js';
import { initDataBackupPanel } from './ui/dataBackupPanel.js';
import { initAnalyticsPanel } from './ui/analyticsPanel.js';
import { initCollectionsPanel } from './ui/collectionsPanel.js';
import { createQuestionKey, findDueReviewQuestions, getDueReviewCount, getDueReviewKeys, loadReviewSchedule, REVIEW_STORAGE_KEY, updateReviewScheduleFromAttempt } from './quiz/spacedRepetition.js';
import { createLearningAnalytics } from './quiz/analytics.js';
import { createDailyRecommendations } from './quiz/recommendations.js';
import { RECOMMENDATION_FEEDBACK_STORAGE_KEY, saveRecommendationFeedback } from './quiz/recommendationFeedback.js';
import { createStudyPlan, loadStudyGoal, STUDY_GOAL_STORAGE_KEY } from './quiz/studyGoal.js';
import { STUDY_SESSION_COMPLETION_STORAGE_KEY, STUDY_SESSION_STORAGE_KEY, beginStudySessionStep, completeActiveStudySessionStep } from './quiz/studySession.js';
import { createExamReadiness } from './quiz/examReadiness.js';
import {
  MISTAKE_NOTEBOOK_STORAGE_KEY,
  addMistakeNotebookEntries,
  clearMistakeNotebook,
  createMistakeEntriesFromAttempt,
  getMistakeNotebookStats,
  loadMistakeNotebook,
  saveMistakeNote,
  setMistakeNotebookStatus
} from './quiz/mistakeNotebook.js';
import { applyBookmarksToQuiz, BOOKMARK_STORAGE_KEY, loadBookmarks, persistLegacyBookmarksFromQuiz, setQuestionBookmark } from './quiz/bookmarks.js';
import { COLLECTIONS_STORAGE_KEY, getCollectionQuestionKeySet, getQuestionKeyForCollection, loadCollections } from './quiz/collections.js';
import { exposeSanitizeGlobal, sanitizeHTML } from './utils/sanitize.js';
import { removeStorageItem } from './utils/storage.js';
import { initFeedbackSystem, showToast } from './ui/toast.js';
import { initOnboarding, markOnboardingDismissed, markOnboardingImportedData, ONBOARDING_DISMISSED_KEY, ONBOARDING_IMPORTED_DATA_KEY } from './ui/onboarding.js';
import { initQuizBuilderPanel } from './ui/quizBuilderPanel.js';
import { initStudyGoalPanel } from './ui/studyGoalPanel.js';
import { initStudySessionPanel } from './ui/studySessionPanel.js';
import { initMistakeNotebookPanel } from './ui/mistakeNotebookPanel.js';
import { APP_VERSION_LABEL } from './version.js';
import { clampInt, deepClone, shuffleInPlace, strip } from './utils/helpers.js';

window.__SHIME_MAIN_MODULE_LOADED = true;
window.__SHIME_APP_READY = false;
window.__SHIME_BOOT_STATUS = 'main-module-loaded';
window.dispatchEvent(new CustomEvent('shime-main-module-loaded'));

function markAppReady(reason = 'ready') {
  window.__SHIME_APP_READY = true;
  window.__SHIME_BOOT_STATUS = reason;
  window.dispatchEvent(new CustomEvent('shime-app-ready', { detail: { reason } }));
}

exposeDomGlobals();
exposeSanitizeGlobal();
initFeedbackSystem();
const versionEl = document.getElementById('appVersion');
if (versionEl) versionEl.textContent = APP_VERSION_LABEL;

const APP_LOCAL_STORAGE_KEYS = [
  PROGRESS_STORAGE_KEY,
  HISTORY_STORAGE_KEY,
  REVIEW_STORAGE_KEY,
  BOOKMARK_STORAGE_KEY,
  COLLECTIONS_STORAGE_KEY,
  ONBOARDING_DISMISSED_KEY,
  ONBOARDING_IMPORTED_DATA_KEY,
  RECOMMENDATION_FEEDBACK_STORAGE_KEY,
  STUDY_GOAL_STORAGE_KEY,
  STUDY_SESSION_STORAGE_KEY,
  STUDY_SESSION_COMPLETION_STORAGE_KEY,
  MISTAKE_NOTEBOOK_STORAGE_KEY
];

let searchKeywordN = '';
let currentQuizIndex = 0;
let isSubmitted = false;
let qCells = [];
let mapBuilt = false;
let currentCellIndex = -1;
let searchIndex = [];

let allQuizzes = [], quiz = null, idx = 0, answers = [], timerId = null;
let manualJsonLoaded = false;
let quizStartedAt = null;
let quizTimerMinutes = 0;
let quizTimerSeconds = 0;
let questionFilter = 'all'; // all | bookmark | wrong | wrongHistory | dueReview | unanswered
let filteredQuestionIndexes = [];
let wrongHistoryQuestionKeysCache = null;
let dueReviewKeysCache = null;
let searchDebounceTimer = null;
let isPracticeMode = false;
let quizSessionMode = 'normal';
let practiceSourceTitle = '';
let autoNextTimer = null;
let currentTimeLeft = 0;
let lastSubmittedAttemptId = '';
let activeStudySessionStepIdForCurrentQuiz = '';

let startHelpTour = () => {
  showToast('Hướng dẫn chưa sẵn sàng. Hãy tải lại trang nếu lỗi còn tiếp diễn.', { type: 'warning' });
};
let textbookImporter = {
  importerParse: () => showToast('Trình nhập giáo trình chưa sẵn sàng. Hãy tải lại trang rồi thử lại.', { type: 'error' }),
  importValidQuestions: () => showToast('Trình nhập giáo trình chưa sẵn sàng. Hãy tải lại trang rồi thử lại.', { type: 'error' }),
  downloadGeneratedJSON: () => showToast('Trình nhập giáo trình chưa sẵn sàng. Hãy tải lại trang rồi thử lại.', { type: 'error' }),
  resetImportPreview: () => showToast('Trình nhập giáo trình chưa sẵn sàng. Hãy tải lại trang rồi thử lại.', { type: 'error' })
};
let historyPanel = { refresh: () => {} };
let analyticsPanel = { refresh: () => {} };
let collectionsPanel = { refresh: () => {}, refreshCurrentQuestionControls: () => {} };
let onboardingPanel = { refresh: () => {} };
let quizBuilderPanel = { refresh: () => {} };
let studyGoalPanel = { refresh: () => {} };
let studySessionPanel = { refresh: () => {} };
let mistakeNotebookPanel = { refresh: () => {} };
let sheepPopup = { close: () => {} };
let prefetchAIExplain = () => {};

function showStartupError(error, fallbackMessage = 'Ứng dụng gặp lỗi khi khởi động. Bạn có thể thử nạp JSON thủ công hoặc sửa dữ liệu cục bộ.') {
  console.error(error);
  const status = $('#statusMessage');
  if (status) {
    status.textContent = fallbackMessage;
  }
  showToast(fallbackMessage, { type: 'error', timeout: 9000 });
}

function runBootStep(label, fn, fallback) {
  try {
    const result = fn();
    return result ?? fallback;
  } catch (error) {
    showStartupError(error, `${label} gặp lỗi. Các nút khôi phục vẫn có thể dùng được.`);
    return fallback;
  }
}

function withTimeout(promise, timeoutMs, timeoutMessage) {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs);
    Promise.resolve(promise)
      .then(value => {
        window.clearTimeout(timer);
        resolve(value);
      })
      .catch(error => {
        window.clearTimeout(timer);
        reject(error);
      });
  });
}

function repairLocalAppData() {
  if (!confirm('Xóa dữ liệu học tập cục bộ của ứng dụng trên máy này?\n\nThao tác này sẽ xóa lịch sử, tiến độ, ôn tập, câu đã lưu, bộ sưu tập và sổ lỗi sai.')) {
    return;
  }

  APP_LOCAL_STORAGE_KEYS.forEach(key => removeStorageItem(key));
  showToast('Đã sửa/xóa dữ liệu cục bộ. Ứng dụng sẽ tải lại.', { type: 'success', timeout: 2200 });
  window.setTimeout(() => window.location.reload(), 500);
}

window.addEventListener('error', event => {
  showStartupError(event.error || event.message, 'Có lỗi xảy ra. Nếu ứng dụng không phản hồi, hãy thử nạp JSON hoặc sửa dữ liệu cục bộ.');
});

window.addEventListener('unhandledrejection', event => {
  showStartupError(event.reason, 'Có lỗi xử lý dữ liệu. Nếu ứng dụng không phản hồi, hãy thử nạp JSON hoặc sửa dữ liệu cục bộ.');
});

window.addEventListener('app-storage-recovered', event => {
  const key = event?.detail?.key;
  if (!APP_LOCAL_STORAGE_KEYS.includes(key)) return;
  showToast('Đã phát hiện và sửa một mục dữ liệu cục bộ bị lỗi.', { type: 'warning', timeout: 6500 });
});

function showFileInputMissingMessage(message) {
  const status = $('#statusMessage');
  if (status) status.textContent = message;
  showToast(message, { type: 'error', timeout: 7000 });
}

function triggerHiddenFileInput(id, missingMessage) {
  const input = document.getElementById(id);
  if (!(input instanceof HTMLInputElement)) {
    showFileInputMissingMessage(missingMessage);
    return false;
  }

  input.value = '';
  input.click();
  return true;
}

function triggerJsonImport() {
  return triggerHiddenFileInput('fileInput', 'Không tìm thấy ô chọn file JSON. Hãy tải lại trang rồi thử lại.');
}

function triggerTextbookFileImport() {
  return triggerHiddenFileInput('textbookInput', 'Không tìm thấy ô chọn file giáo trình. Hãy tải lại trang rồi thử lại.');
}

function bindToolbarButton(id, handler) {
  const button = document.getElementById(id);
  if (!button || button.dataset.toolbarBound === '1') return;

  button.addEventListener('click', event => {
    event.preventDefault();
    handler();
  });
  button.dataset.toolbarBound = '1';
}

function bindToolbarActions() {
  bindToolbarButton('btnLoadJson', triggerJsonImport);
  bindToolbarButton('btnLoadTextbook', openTextbookImporter);
  bindToolbarButton('btnHelp', startHelpTour);

  setupMobileToolsMenu({
    onLoadJson: triggerJsonImport,
    onLoadTextbook: openTextbookImporter,
    onToggleTheme: toggleTheme,
    onHelp: startHelpTour
  });
}

function bindJsonFileInput() {
  const input = document.getElementById('fileInput');
  if (!(input instanceof HTMLInputElement)) {
    showFileInputMissingMessage('Không tìm thấy ô chọn file JSON. Hãy tải lại trang rồi thử lại.');
    return;
  }

  if (input.dataset.jsonBound === '1') return;
  input.dataset.jsonBound = '1';

  const processJsonText = (text, name = 'file JSON') => {
    const loaded = window.__SHIME_LOAD_JSON_DATA?.(String(text || ''), name);
    if (!loaded) throw new Error('Không thể nạp dữ liệu JSON vào ứng dụng.');
  };

  const processFile = (f) => {
    if (!f) return;

    const r = new FileReader();
    r.onload = () => {
      try {
        processJsonText(String(r.result || ''), f.name);
      } catch (err) {
        console.error(err);
        $('#statusMessage').textContent = '❌ Không đọc được JSON. Kiểm tra lại định dạng.';
        showToast('File JSON không hợp lệ hoặc sai định dạng.', { type: 'error', timeout: 7000 });
      } finally {
        input.value = '';
      }
    };
    r.onerror = () => {
      console.error(r.error);
      $('#statusMessage').textContent = '❌ Không đọc được file JSON.';
      showToast('Không đọc được file JSON.', { type: 'error', timeout: 7000 });
      input.value = '';
    };

    r.readAsText(f, 'utf-8');
  };

  input.addEventListener('change', event => {
    processFile(event.target.files?.[0]);
  });

  if (window.__SHIME_BOOT_PENDING_JSON?.text) {
    try {
      processJsonText(window.__SHIME_BOOT_PENDING_JSON.text, window.__SHIME_BOOT_PENDING_JSON.name || 'file JSON');
      window.__SHIME_BOOT_PENDING_JSON = null;
    } catch (err) {
      console.error(err);
    }
  }
}

function bindInlineReplacementActions() {
  document.getElementById('btnRestartApp')?.addEventListener('click', () => {
    window.location.reload();
  });

  document.getElementById('btnCloseSheepPopup')?.addEventListener('click', () => {
    sheepPopup.close();
  });

  document.getElementById('btnCloseTextbookImporter')?.addEventListener('click', closeTextbookImporter);
  document.getElementById('btnChooseTextbookFile')?.addEventListener('click', triggerTextbookFileImport);
  document.getElementById('btnPasteImporterExample')?.addEventListener('click', importerPasteExample);
  document.getElementById('btnPreviewImport')?.addEventListener('click', () => textbookImporter.importerParse());
  document.getElementById('btnImportValidQuestions')?.addEventListener('click', () => textbookImporter.importValidQuestions());
  document.getElementById('btnDownloadGenerated')?.addEventListener('click', () => textbookImporter.downloadGeneratedJSON());
  document.getElementById('btnResetImportPreview')?.addEventListener('click', () => textbookImporter.resetImportPreview());
  document.getElementById('btnRepairLocalData')?.addEventListener('click', repairLocalAppData);
}


window.__SHIME_LOAD_JSON_DATA = function loadJsonDataFromRecovery(data, sourceLabel = 'file JSON') {
  return loadJsonDataIntoApp(data, sourceLabel);
};
window.dispatchEvent(new CustomEvent('shime-json-loader-ready'));
consumeBootPendingJson('loader-registered');

function initCriticalRecoveryControls() {
  const helpTourController = runBootStep('Khởi tạo hướng dẫn', () => initHelpTour(), { startHelpTour });
  startHelpTour = helpTourController?.startHelpTour || startHelpTour;

  runBootStep('Khởi tạo giao diện sáng/tối', () => {
    initTheme(document.getElementById('btnTheme'));
  });
  runBootStep('Gắn toolbar', bindToolbarActions);
  runBootStep('Gắn input JSON', bindJsonFileInput);
  window.__SHIME_CRITICAL_CONTROLS_READY = true;
  window.__SHIME_BOOT_STATUS = 'critical-controls-ready';
  window.dispatchEvent(new CustomEvent('shime-critical-controls-ready'));
  consumeBootPendingJson('critical-controls-ready');
}

initCriticalRecoveryControls();

runBootStep('Gắn nút phụ', bindInlineReplacementActions);
runBootStep('Gắn chọn đáp án', () => setupChoiceDelegation(selectChoice));

textbookImporter = runBootStep(
  'Khởi tạo trình nhập giáo trình',
  () => initTextbookImporter({
    onQuizzesLoaded: (data) => {
      markOnboardingImportedData();
      handleData(data);
      onboardingPanel.refresh?.();
    }
  }),
  textbookImporter
);

sheepPopup = runBootStep('Khởi tạo trợ lý phản hồi', createSheepPopupController, sheepPopup);

const aiExplainController = runBootStep('Khởi tạo giải thích AI', () => initAIExplain({
  getQuiz: () => quiz,
  getIndex: () => idx,
  getAnswers: () => answers
}), { prefetchAIExplain });
prefetchAIExplain = aiExplainController?.prefetchAIExplain || prefetchAIExplain;

historyPanel = runBootStep('Khởi tạo lịch sử', () => initHistoryPanel({
  loadHistory: loadQuizHistory,
  clearHistory: clearQuizHistory,
  onPracticeWrong: startWrongQuestionPracticeFromHistory,
  onReviewDue: startDueReview,
  loadDueReviewCount: getDueReviewCount
}), historyPanel);

mistakeNotebookPanel = runBootStep('Khởi tạo sổ lỗi sai', () => initMistakeNotebookPanel({
  loadNotebook: loadMistakeNotebook,
  getStats: getMistakeNotebookStats,
  onPracticeNotebook: startMistakeNotebookPractice,
  onStatusChange: handleMistakeNotebookStatusChange,
  onSaveNote: handleMistakeNoteSave
}), mistakeNotebookPanel);

analyticsPanel = runBootStep('Khởi tạo thống kê', () => initAnalyticsPanel({
  computeAnalytics: getCurrentLearningAnalytics,
  computeRecommendations: (analytics) => createDailyRecommendations({
    analytics,
    topics: getBuilderTopics(allQuizzes),
    studyPlan: createStudyPlan({
      goal: loadStudyGoal(),
      history: loadQuizHistory(),
      analytics,
      allQuizzes
    })
  }),
  onPracticeWeak: startWeakQuestionPracticeFromAnalytics,
  onPracticeWeakMastery: startWeakMasteryPracticeFromAnalytics,
  onReviewDue: startDueReview,
  onPracticeMistakeNotebook: startMistakeNotebookPractice,
  onMistakePatternAction: handleMistakePatternAction,
  onRecommendationAction: handleDailyRecommendationAction,
  onRecommendationFeedback: handleRecommendationFeedback
}), analyticsPanel);

collectionsPanel = runBootStep('Khởi tạo bộ sưu tập', () => initCollectionsPanel({
  getCurrentQuestionKey,
  getAvailableCount: getAvailableQuestionCountForCollection,
  onPracticeCollection: startCollectionPractice,
  onCollectionsChanged: () => {
    analyticsPanel.refresh?.();
    onboardingPanel.refresh?.();
    quizBuilderPanel.refresh?.();
  }
}), collectionsPanel);

onboardingPanel = runBootStep('Khởi tạo hướng dẫn bắt đầu', () => initOnboarding({
  onLoadJson: triggerJsonImport,
  onLoadTextbook: openTextbookImporter,
  onStartExisting: () => document.getElementById('btnStart')?.click(),
  onHelp: () => startHelpTour(),
  hasQuizData: () => Boolean(quiz?.questions?.length)
}), onboardingPanel);

quizBuilderPanel = runBootStep('Khởi tạo tạo đề tùy chỉnh', () => initQuizBuilderPanel({
  getAllQuizzes: () => allQuizzes,
  getBookmarks: loadBookmarks,
  getDueReviewKeys: getDueReviewKeys,
  getHistory: loadQuizHistory,
  onStartQuiz: startBuilderQuiz
}), quizBuilderPanel);

studyGoalPanel = runBootStep('Khởi tạo mục tiêu học tập', () => initStudyGoalPanel({
  getTopics: () => getBuilderTopics(allQuizzes),
  getHistory: loadQuizHistory,
  getAnalytics: getCurrentLearningAnalytics,
  getAllQuizzes: () => allQuizzes,
  onStartToday: startStudyGoalToday,
  onGoalChanged: () => {
    analyticsPanel.refresh?.();
    studyGoalPanel.refresh?.();
    studySessionPanel.refresh?.();
  }
}), studyGoalPanel);

studySessionPanel = runBootStep('Khởi tạo buổi học hôm nay', () => initStudySessionPanel({
  getPlanInput: getStudySessionPlanInput,
  onStepAction: handleStudySessionStepAction,
  onOpenBuilder: openQuizBuilderFromRecommendation
}), studySessionPanel);

runBootStep('Khởi tạo sao lưu dữ liệu', () => initDataBackupPanel({
  onRestored: () => {
    invalidateLearningDataCaches();
    applyPersistentBookmarksToCurrentQuiz();
    historyPanel.refresh?.();
    mistakeNotebookPanel.refresh?.();
    analyticsPanel.refresh?.();
    collectionsPanel.refresh?.();
    onboardingPanel.refresh?.();
    quizBuilderPanel.refresh?.();
    studyGoalPanel.refresh?.();
    studySessionPanel.refresh?.();
  }
}));
function toNonNegativeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function captureQuizTimerSetting() {
  quizTimerMinutes = toNonNegativeNumber($('#timeLimit')?.value, 0);
  quizTimerSeconds = Math.max(0, Math.round(quizTimerMinutes * 60));
}

function restoreQuizTimerSetting(saved) {
  const settings = saved?.settings && typeof saved.settings === 'object' ? saved.settings : {};
  const savedMinutes = toNonNegativeNumber(settings.timerMinutes, NaN);

  if (Number.isFinite(savedMinutes)) {
    quizTimerMinutes = savedMinutes;
  } else if (toNonNegativeNumber(saved?.timeLeft, 0) > 0) {
    quizTimerMinutes = toNonNegativeNumber(saved.timeLeft, 0) / 60;
  } else {
    quizTimerMinutes = 0;
  }

  quizTimerSeconds = Math.max(0, Math.round(quizTimerMinutes * 60));
  if ($('#timeLimit')) $('#timeLimit').value = quizTimerMinutes;
}

function upsertExamIntoAllQuizzes(examQuiz) {
  // Nếu đã có "Đề thi ngẫu nhiên" thì replace, không nhân bản
  const idxExist = allQuizzes.findIndex(q => (q?.title || "").startsWith(EXAM_TITLE_PREFIX));
  if (idxExist >= 0) allQuizzes[idxExist] = examQuiz;
  else allQuizzes.unshift(examQuiz); // đẩy lên đầu cho dễ chọn

  // rebuild search index + dropdown
  searchIndex = buildSearchIndex(allQuizzes);
  $('#quizSelectGroup').style.display = 'grid';
  renderQuizSelect(allQuizzes);
}


function showJsonLoadedStatus(sourceLabel = 'file JSON') {
  const safeLabel = sanitizeHTML(sourceLabel);
  const status = $('#statusMessage');
  if (status) status.innerHTML = `✅ Đã nạp file: <b>${safeLabel}</b>. Bấm Bắt đầu ngay!`;
  showToast(`Đã nạp JSON: ${sourceLabel}`, { type: 'success' });
}

function normalizeIncomingQuizData(dataOrText) {
  const text = typeof dataOrText === 'string'
    ? String(dataOrText || '')
    : JSON.stringify(dataOrText);

  return parseQuizJsonText(text);
}

function isValidQuizQuestion(question) {
  if (!question || typeof question !== 'object') return false;
  if (!String(question.text || '').trim()) return false;

  if (Array.isArray(question.choices)) {
    return question.choices.filter(choice => String(choice || '').trim()).length >= 2;
  }

  return String(question.answerText || '').trim().length > 0;
}

function isValidQuizObject(candidate) {
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) return false;
  if (!Array.isArray(candidate.questions) || candidate.questions.length === 0) return false;
  return candidate.questions.every(isValidQuizQuestion);
}

function validateQuizDataStructure(data) {
  const quizzes = Array.isArray(data) ? data : [data];
  if (!quizzes.length || !quizzes.every(isValidQuizObject)) {
    throw new Error('Dữ liệu JSON không đúng cấu trúc quiz.');
  }
  return data;
}

function resetToIntroAfterDataLoad() {
  if (timerId) clearInterval(timerId);
  timerId = null;
  if (autoNextTimer) clearTimeout(autoNextTimer);
  autoNextTimer = null;

  idx = 0;
  answers = [];
  isSubmitted = false;
  quizStartedAt = null;
  currentTimeLeft = 0;
  mapBuilt = false;
  qCells = [];
  currentCellIndex = -1;
  questionFilter = 'all';
  filteredQuestionIndexes = [];
  activeStudySessionStepIdForCurrentQuiz = '';
  clearProgressData();
  isPracticeMode = false;
  quizSessionMode = 'normal';
  practiceSourceTitle = '';

  const timer = $('#timer');
  if (timer) timer.textContent = '∞';
  const intro = $('#screenIntro');
  const quizScreen = $('#screenQuiz');
  const resultScreen = $('#screenResult');
  if (quizScreen) quizScreen.style.display = 'none';
  if (resultScreen) resultScreen.style.display = 'none';
  if (intro) intro.style.display = 'block';
  updatePracticeModeBadge();
}

function loadJsonDataIntoApp(dataOrText, sourceLabel = 'file JSON') {
  try {
    const data = validateQuizDataStructure(normalizeIncomingQuizData(dataOrText));

    manualJsonLoaded = true;
    markOnboardingImportedData();
    handleData(data);
    resetToIntroAfterDataLoad();
    onboardingPanel.refresh?.();
    showJsonLoadedStatus(sourceLabel);
    window.__SHIME_BOOT_PENDING_JSON = null;
    return true;
  } catch (error) {
    console.error('[ShimeChamhoc] Không thể nạp JSON:', error);
    const status = $('#statusMessage');
    if (status) status.textContent = '❌ Không đọc được JSON. Kiểm tra lại định dạng.';
    showToast('File JSON không hợp lệ hoặc sai định dạng.', { type: 'error', timeout: 7000 });
    return false;
  }
}

function consumeBootPendingJson(reason = 'manual') {
  const pending = window.__SHIME_BOOT_PENDING_JSON;
  if (!pending) return false;

  const sourceLabel = pending.name || pending.sourceLabel || 'file JSON khôi phục';
  const payload = pending.text || (pending.data != null ? JSON.stringify(pending.data) : '');
  const loaded = loadJsonDataIntoApp(payload, sourceLabel);
  if (loaded) {
    window.dispatchEvent(new CustomEvent('shime-boot-pending-json-consumed', { detail: { reason, sourceLabel } }));
  }
  return loaded;
}
function handleData(data) {
  allQuizzes = Array.isArray(data) ? data : [data];
  searchIndex = buildSearchIndex(allQuizzes);
  if (allQuizzes.length > 1) {
    $('#quizSelectGroup').style.display = 'grid';
    renderQuizSelect(allQuizzes);
  }

  setupQuiz(0);
  markAppReady('quiz-data-loaded');
  onboardingPanel.refresh?.();
  quizBuilderPanel.refresh?.();
  studyGoalPanel.refresh?.();
  studySessionPanel.refresh?.();
}

function normalizeQuizQuestionIds(targetQuiz) {
  targetQuiz.questions.forEach((q, i) => {
    if (q._id == null) q._id = i;
  });
}

function applyPersistentBookmarksToCurrentQuiz() {
  if (!quiz?.questions?.length) return;
  applyBookmarksToQuiz(quiz);
}

function syncLegacyAndPersistentBookmarks(targetQuiz) {
  persistLegacyBookmarksFromQuiz(targetQuiz);
  applyBookmarksToQuiz(targetQuiz);
}

function handleBookmarkToggle(question, bookmarked) {
  setQuestionBookmark(question, quiz, bookmarked);
  applyPersistentBookmarksToCurrentQuiz();
  analyticsPanel.refresh?.();
  quizBuilderPanel.refresh?.();
  studyGoalPanel.refresh?.();
  studySessionPanel.refresh?.();
}

function setupQuiz(index) {
  currentQuizIndex = Number(index) || 0;
  quiz = deepClone(allQuizzes[index]);
  normalizeQuizQuestionIds(quiz);
  syncLegacyAndPersistentBookmarks(quiz);
  isPracticeMode = false;
  quizSessionMode = 'normal';
  practiceSourceTitle = '';
  $('#timeLimit').value = Math.round((quiz.timeLimit || 0) / 60);
  $('#statusMessage').innerHTML =
    `Đã nạp: <b>${sanitizeHTML(quiz.title || '')}</b>. Bấm Bắt đầu ngay!`;
  collectionsPanel.refresh?.();
  quizBuilderPanel.refresh?.();
  studySessionPanel.refresh?.();
}


$('#quizSelect').onchange = (e) => setupQuiz(e.target.value);

function resumeSavedProgressIfNeeded() {
  const saved = loadProgressData();
  if (saved && confirm("🔄 Phát hiện bài làm chưa hoàn thành. Tiếp tục không?")) {
    quiz = saved.quiz;
    normalizeQuizQuestionIds(quiz);
    syncLegacyAndPersistentBookmarks(quiz);
    idx = saved.idx;
    answers = saved.answers;
    if (!Array.isArray(answers) || answers.length !== quiz.questions.length) {
      answers = quiz.questions.map(() => ({ value: null }));
    }

    currentTimeLeft = toNonNegativeNumber(saved.timeLeft, 0);
    quizStartedAt = Number(saved.startedAt) || Date.now();
    restoreQuizTimerSetting(saved);
    const savedSettings = saved.settings && typeof saved.settings === 'object' ? saved.settings : {};

    $('#instant').checked = Boolean(savedSettings.instant);
    $('#autoNext').checked = Boolean(savedSettings.autoNext);
    $('#shuffle').checked = Boolean(savedSettings.shuffle);
    quizSessionMode = saved.mode === 'mock_exam' ? 'mock_exam' : 'normal';
    isPracticeMode = quizSessionMode !== 'normal';

    $('#screenIntro').style.display = 'none';
    $('#screenQuiz').style.display = 'block';
    mapBuilt = false;
    qCells = [];
    currentCellIndex = -1;
    buildQuestionMapOnce();
    renderQuestion();

    runTimer();
  } else {
    clearProgressData();
  }
}

window.addEventListener('DOMContentLoaded', async () => {
  consumeBootPendingJson('dom-content-loaded');

  if (manualJsonLoaded || allQuizzes.length > 0) {
    markAppReady('manual-json-loaded');
    return;
  }

  try {
    const data = await withTimeout(
      loadBundledQuizData('data.json'),
      8000,
      'Không tải được dữ liệu mặc định trong thời gian cho phép.'
    );

    consumeBootPendingJson('before-bundled-data-apply');
    if (manualJsonLoaded || allQuizzes.length > 0) {
      markAppReady('manual-json-loaded');
      return;
    }

    handleData(data);
    resumeSavedProgressIfNeeded();
    onboardingPanel.refresh?.();
  } catch (error) {
    const message = navigator.onLine
      ? 'Không tải được dữ liệu mặc định. Bạn có thể nạp JSON thủ công.'
      : 'Bạn đang offline. Ứng dụng vẫn mở được nếu đã có dữ liệu trong bộ nhớ đệm. Bạn có thể nạp JSON thủ công.';
    showStartupError(error, message);
    markAppReady('bundled-data-fallback-shown');
    showToast(message, {
      type: 'warning',
      timeout: 10000,
      actionLabel: 'Nạp JSON',
      onAction: triggerJsonImport
    });
  }
});

function saveProgress() {
  if (!quiz || !answers.length) return;

  const data = {
    quiz,
    idx,
    answers,
    timeLeft: currentTimeLeft,
    startedAt: quizStartedAt,
    settings: {
      instant: $('#instant').checked,
      autoNext: $('#autoNext').checked,
      shuffle: $('#shuffle').checked,
      timerMinutes: quizTimerMinutes
    },
    mode: getCurrentAttemptMode()
  };

  saveProgressData(data);
}

const saveProgressDebounced = createDebouncedProgressSaver(saveProgress);

function buildQuestionMapOnce() {
  if (mapBuilt || !quiz) return;

  qCells = buildQuestionMap({
    quiz,
    onSelect: (i) => {
      idx = i;
      renderQuestion();
      saveProgressDebounced();
    }
  });

  mapBuilt = true;

  // cập nhật trạng thái ban đầu 1 lần
  updateAllCells();
  updateCurrentCell();
  applyQuestionFilter();
}

function updateCell(i) {
  updateQuestionCell({
    cell: qCells[i],
    question: quiz.questions[i],
    answer: answers[i]?.value ?? null,
    canShowResult: canRevealAnswersNow() || isSubmitted
  });
}

function updateAllCells() {
  for (let i = 0; i < qCells.length; i++) updateCell(i);
}

function updateCurrentCell() {
  updateCurrentQuestionCell({
    cells: qCells,
    previousIndex: currentCellIndex,
    currentIndex: idx
  });
  currentCellIndex = idx;
}


function getWrongHistoryQuestionKeys() {
  if (wrongHistoryQuestionKeysCache) return wrongHistoryQuestionKeysCache;

  const keys = new Set();

  loadQuizHistory().forEach(item => {
    const questions = item?.details?.questions;
    if (!Array.isArray(questions)) return;

    questions.forEach(question => {
      if (question?.isCorrect === false && question.questionKey) {
        keys.add(String(question.questionKey));
      }
    });
  });

  wrongHistoryQuestionKeysCache = keys;
  return wrongHistoryQuestionKeysCache;
}

function getDueReviewQuestionKeysCached() {
  if (!dueReviewKeysCache) dueReviewKeysCache = getDueReviewKeys();
  return dueReviewKeysCache;
}

function invalidateLearningDataCaches() {
  wrongHistoryQuestionKeysCache = null;
  dueReviewKeysCache = null;
}

function getQuestionKeyForCurrentQuiz(question) {
  return createQuestionKey(question, quiz);
}

function getCurrentQuestionKey() {
  if (!quiz?.questions?.length) return '';
  return getQuestionKeyForCollection(quiz.questions[idx], quiz);
}

function getAllAvailableQuestionsByKey() {
  const map = new Map();

  (Array.isArray(allQuizzes) ? allQuizzes : []).forEach(sourceQuiz => {
    const questions = Array.isArray(sourceQuiz?.questions) ? sourceQuiz.questions : [];
    questions.forEach((question, index) => {
      const key = getQuestionKeyForCollection(question, sourceQuiz);
      if (!key || map.has(key)) return;

      map.set(key, {
        key,
        question,
        sourceQuiz,
        sourceIndex: index
      });
    });
  });

  if (quiz?.questions?.length) {
    quiz.questions.forEach((question, index) => {
      const key = getQuestionKeyForCollection(question, quiz);
      if (!key || map.has(key)) return;

      map.set(key, {
        key,
        question,
        sourceQuiz: quiz,
        sourceIndex: index
      });
    });
  }

  return map;
}

function getAvailableQuestionCountForCollection(collection) {
  const keys = getCollectionQuestionKeySet(collection);
  if (!keys.size) return 0;

  const available = getAllAvailableQuestionsByKey();
  let count = 0;
  keys.forEach(key => {
    if (available.has(key)) count += 1;
  });
  return count;
}

function getQuestionsFromCollection(collection) {
  const keys = Array.isArray(collection?.questionKeys) ? collection.questionKeys : [];
  if (!keys.length) return [];

  const available = getAllAvailableQuestionsByKey();
  return keys
    .map(key => {
      const found = available.get(key);
      if (!found) return null;

      const question = deepClone(found.question);
      question._id = question._id ?? question.id ?? found.sourceIndex;
      question._reviewKey = key;
      question._reviewSource = found.sourceQuiz?.title || collection.name;
      return question;
    })
    .filter(Boolean);
}

function startCollectionPractice(collection) {
  const questions = getQuestionsFromCollection(collection);
  if (!questions.length) {
    showToast('Không tìm thấy câu hỏi nào của bộ sưu tập trong dữ liệu hiện tại.', { type: 'warning' });
    collectionsPanel.refresh?.();
    return false;
  }

  const collectionName = collection?.name || 'Bộ sưu tập';
  quiz = buildPracticeQuizFromQuestions(questions, collectionName);
  quiz.title = `Luyện bộ sưu tập · ${collectionName}`;
  isPracticeMode = true;
  quizSessionMode = 'practice';
  practiceSourceTitle = collectionName;
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

function updateFilterChipState() {
  document.querySelectorAll('.filterChip[data-filter]').forEach(button => {
    button.classList.toggle('active', button.dataset.filter === questionFilter);
  });
}

function updateQuestionSearchSummary(matchCount = 0) {
  const countEl = $('#questionSearchCount');
  if (countEl) {
    const total = quiz?.questions?.length || 0;
    countEl.textContent = `${matchCount}/${total} kết quả`;
  }

  const emptyEl = $('#questionFilterEmpty');
  if (emptyEl) {
    emptyEl.hidden = matchCount > 0;
    emptyEl.textContent = questionFilter === 'bookmark'
      ? 'Bạn chưa lưu câu nào. Bấm ⭐ ở câu hỏi quan trọng để lưu và luyện lại nhanh hơn.'
      : questionFilter === 'dueReview'
        ? 'Chưa có câu đến hạn ôn tập. Hãy làm thêm quiz để hệ thống tạo lịch ôn.'
        : questionFilter === 'wrongHistory'
          ? 'Chưa có câu sai trong lịch sử hiện tại. Hoàn thành bài quiz để tạo dữ liệu luyện tập.'
          : questionFilter === 'unanswered'
            ? 'Bạn đã trả lời hết các câu đang hiển thị.'
            : 'Không tìm thấy câu hỏi phù hợp. Thử xóa từ khóa hoặc đổi bộ lọc.';
  }

  const practiceButton = $('#btnPracticeFiltered');
  if (practiceButton) {
    practiceButton.disabled = matchCount <= 0;
    practiceButton.textContent = matchCount > 0 ? `Luyện từ kết quả (${matchCount})` : 'Không có kết quả';
  }
}

function getFilteredQuestions() {
  if (!quiz?.questions?.length) return [];
  return filteredQuestionIndexes
    .map(index => quiz.questions[index])
    .filter(Boolean);
}

function startFilteredQuestionPractice() {
  const selectedQuestions = getFilteredQuestions();
  if (!selectedQuestions.length) {
    showToast('Không có câu hỏi phù hợp để luyện tập.', { type: 'warning' });
    return false;
  }

  quiz = buildPracticeQuizFromQuestions(selectedQuestions, quiz?.title || 'kết quả lọc');
  quiz.title = `Luyện tập từ tìm kiếm · ${selectedQuestions.length} câu`;
  isPracticeMode = true;
  quizSessionMode = 'practice';
  practiceSourceTitle = 'Kết quả tìm kiếm';
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

// Filter chỉ scan 1 lần khi bấm filter hoặc sau debounce tìm kiếm.
function applyQuestionFilter() {
  if (!mapBuilt || !quiz?.questions?.length) {
    filteredQuestionIndexes = [];
    updateQuestionSearchSummary(0);
    updateFilterChipState();
    return;
  }

  const wrongHistoryKeys = questionFilter === 'wrongHistory' ? getWrongHistoryQuestionKeys() : new Set();
  const dueReviewKeys = questionFilter === 'dueReview' ? getDueReviewQuestionKeysCached() : new Set();
  const matches = [];

  for (let i = 0; i < quiz.questions.length; i++) {
    const q = quiz.questions[i];
    const ans = answers[i]?.value ?? null;
    const questionKey = (questionFilter === 'wrongHistory' || questionFilter === 'dueReview')
      ? getQuestionKeyForCurrentQuiz(q)
      : '';

    const show = shouldShowQuestion({
      question: q,
      answer: ans,
      questionFilter,
      canShowWrong: canRevealAnswersNow() || isSubmitted,
      searchIndex,
      searchKeywordN,
      currentQuizIndex,
      questionIndex: i,
      isWrongHistory: Boolean(questionKey && wrongHistoryKeys.has(questionKey)),
      isDueReview: Boolean(questionKey && dueReviewKeys.has(questionKey))
    });

    const cell = qCells[i];
    if (cell) {
      const nextDisplay = show ? '' : 'none';
      if (cell.style.display !== nextDisplay) cell.style.display = nextDisplay;
    }
    if (show) matches.push(i);
  }

  filteredQuestionIndexes = matches;
  updateQuestionSearchSummary(matches.length);
  updateFilterChipState();
}

function selectChoice(choiceIndex) {
  const q = quiz.questions[idx];
  if (!answers[idx]) answers[idx] = { value: null };

  const isMulti = Array.isArray(q.answer);

  if (!isMulti) {
    answers[idx].value = choiceIndex;
  } else {
    const cur = asArrayUserAns(answers[idx].value);
    const pos = cur.indexOf(choiceIndex);
    if (pos >= 0) cur.splice(pos, 1);
    else cur.push(choiceIndex);
    cur.sort((a, b) => a - b);
    answers[idx].value = cur.length ? cur : null;
  }

  applyChoiceUI({ quiz, idx, answers, isSubmitted, instant: canRevealAnswersNow() });

  // update map cell + save
  if (mapBuilt) {
    updateCell(idx);
    applyQuestionFilter();
  }

  saveProgressDebounced();

  // Prefetch AI silently (especially useful in instant-mode / wrong answers)
  try {
    const userVal = answers[idx].value;
    const instant = canRevealAnswersNow();
    if (instant) {
      // prioritize prefetch when user seems wrong
      if (!isAnswerCorrect(q, userVal)) prefetchAIExplain(q, userVal);
    } else {
      // light prefetch anyway
      prefetchAIExplain(q, userVal);
    }
  } catch {}

  // instant explanation text (local)
  const canShowResult = canRevealAnswersNow() || isSubmitted;
  if (canShowResult && answers[idx].value !== null) {
    if (q.explanation) {
      $('#explain').textContent = "Giải thích: " + q.explanation;
      renderMathDebounced($('#explain'), 50);
    }
  }

  // auto next (only for single-choice, otherwise user needs multi picks)
  if (!isMulti && $('#autoNext').checked && idx < quiz.questions.length - 1) {
    clearTimeout(autoNextTimer);
    const extra = 500;
    const delay = ($('#instant').checked ? 800 : 250) + extra;
    autoNextTimer = setTimeout(() => {
      idx++;
      renderQuestion();
      saveProgressDebounced();
    }, delay);
  }
  try {
    const instant = canRevealAnswersNow();
    const userVal = answers[idx].value;
    sheepPopup.recordAnswer({
      instant,
      idx,
      userVal,
      isWrong: userVal !== null && !isAnswerCorrect(q, userVal)
    });
  } catch {}
}

function updatePracticeModeBadge() {
  const badge = $('#practiceModeBadge');
  if (!badge) return;

  const count = quiz?.questions?.length || 0;
  const isSpecialMode = quizSessionMode === 'practice' || quizSessionMode === 'review' || isPracticeMode;
  badge.hidden = !isSpecialMode;

  if (quizSessionMode === 'mock_exam') {
    badge.textContent = count ? `Mock Exam · ${count} câu` : 'Mock Exam';
    return;
  }

  if (quizSessionMode === 'review') {
    badge.textContent = count ? `Review mode · ${count} câu cần ôn` : 'Review mode';
    return;
  }

  if (quizSessionMode === 'builder') {
    badge.textContent = count ? `${practiceSourceTitle || 'Tạo đề'} · ${count} câu` : (practiceSourceTitle || 'Tạo đề');
    return;
  }

  if (isSpecialMode) {
    badge.textContent = count ? `Practice mode · ${count} câu sai` : 'Practice mode';
  }
}

function renderQuestion() {
  updatePracticeModeBadge();
  collectionsPanel.refreshCurrentQuestionControls?.();
  renderQuizQuestion({
    quiz,
    idx,
    answers,
    isSubmitted,
    instant: canRevealAnswersNow(),
    isMapBuilt: () => mapBuilt,
    saveProgressDebounced,
    buildQuestionMapOnce,
    updateCell,
    updateCurrentCell,
    applyQuestionFilter,
    onBookmarkToggle: handleBookmarkToggle
  });
}

function flashElement(el) {
  if (!el) return;

  el.classList.remove('kbd-flash');
  void el.offsetWidth;
  el.classList.add('kbd-flash');
  window.setTimeout(() => el.classList.remove('kbd-flash'), 260);
}

function flashChoice(choiceIndex) {
  flashElement(document.querySelector(`#qChoices .choice[data-choice=\"${choiceIndex}\"]`));
}

function goNextQuestion() {
  if (!quiz || idx >= quiz.questions.length - 1) return;

  idx++;
  renderQuestion();
  saveProgressDebounced();
}

function goPreviousQuestion() {
  if (!quiz || idx <= 0) return;

  idx--;
  renderQuestion();
  saveProgressDebounced();
}

function goNextQuestionByShortcut() {
  goNextQuestion();
  flashElement($('#btnNext'));
}

function goPreviousQuestionByShortcut() {
  goPreviousQuestion();
  flashElement($('#btnPrev'));
}

function canUseQuizShortcuts() {
  const quizScreen = $('#screenQuiz');
  return Boolean(
    quiz?.questions?.length &&
    !isSubmitted &&
    quizScreen &&
    getComputedStyle(quizScreen).display !== 'none'
  );
}

function selectChoiceByShortcut(choiceIndex) {
  if (!canUseQuizShortcuts()) return;

  const q = quiz.questions[idx];
  if (!Array.isArray(q?.choices) || choiceIndex < 0 || choiceIndex >= q.choices.length) return;

  selectChoice(choiceIndex);
  flashChoice(choiceIndex);
}

function getHistorySettings() {
  return {
    timerMinutes: quizTimerMinutes,
    shuffleEnabled: Boolean($('#shuffle')?.checked),
    strictMode: Boolean($('#instant')?.checked),
    deepCustomMode: Boolean(quiz?.title?.startsWith(EXAM_TITLE_PREFIX) || quiz?.title?.startsWith(QUIZ_BUILDER_TITLE_PREFIX))
  };
}


function getCurrentAttemptMode() {
  return quizSessionMode === 'mock_exam' ? 'mock_exam' : quizSessionMode || 'normal';
}

function canRevealAnswersNow() {
  return quizSessionMode !== 'mock_exam' && $('#instant')?.checked;
}

function getUnansweredCount() {
  return Array.isArray(quiz?.questions)
    ? quiz.questions.reduce((count, _question, index) => {
        const value = answers[index]?.value ?? null;
        return count + (value === null || (Array.isArray(value) && value.length === 0) ? 1 : 0);
      }, 0)
    : 0;
}

function getMockReadinessImpact(score) {
  if (quizSessionMode !== 'mock_exam') return '';
  const percent = Number(score?.percent) || 0;
  if (percent >= 85) return 'Tác động readiness: kết quả mock exam này là tín hiệu mạnh cho mức sẵn sàng cao.';
  if (percent >= 70) return 'Tác động readiness: kết quả mock exam này hỗ trợ mức gần sẵn sàng, nhưng vẫn nên ôn lại phần sai.';
  return 'Tác động readiness: kết quả mock exam này sẽ giúp xác định phần cần củng cố trong analytics.';
}

function getQuestionsByIndexes(indexes = []) {
  if (!quiz?.questions?.length) return [];
  return (Array.isArray(indexes) ? indexes : [])
    .map(index => quiz.questions[index])
    .filter(Boolean);
}

function startMockExamSectionPractice(topic, indexes = []) {
  const questions = getQuestionsByIndexes(indexes);
  if (!questions.length) {
    showToast('Không tìm thấy câu hỏi của phần này trong bài hiện tại.', { type: 'warning' });
    return false;
  }

  quiz = buildPracticeQuizFromQuestions(questions, topic || 'phần cần ôn');
  quiz.title = `Luyện phần mock exam · ${topic || 'phần cần ôn'}`;
  isPracticeMode = true;
  quizSessionMode = 'practice';
  practiceSourceTitle = topic || 'Mock Exam';
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

function getTimeSpentSeconds() {
  if (quizTimerSeconds > 0 && Number.isFinite(currentTimeLeft)) {
    return Math.max(0, Math.round(quizTimerSeconds - currentTimeLeft));
  }

  if (!quizStartedAt) return null;
  return Math.max(0, Math.round((Date.now() - quizStartedAt) / 1000));
}

$('#btnNext').onclick = goNextQuestion;
$('#btnPrev').onclick = goPreviousQuestion;

initKeyboardShortcuts({
  isEnabled: canUseQuizShortcuts,
  onNext: goNextQuestionByShortcut,
  onPrevious: goPreviousQuestionByShortcut,
  onSelectChoice: selectChoiceByShortcut
});

function startQuizSession({ shuffle = false } = {}) {
  if (!quiz?.questions?.length) return;

  activeStudySessionStepIdForCurrentQuiz = '';
  markOnboardingDismissed();
  onboardingPanel.refresh?.();

  isSubmitted = false;
  if (shuffle) shuffleInPlace(quiz.questions);
  normalizeQuizQuestionIds(quiz);
  applyPersistentBookmarksToCurrentQuiz();
  answers = quiz.questions.map(() => ({ value: null }));
  idx = 0;
  quizStartedAt = Date.now();
  captureQuizTimerSetting();
  if (quizSessionMode === 'mock_exam') {
    $('#instant').checked = false;
    $('#autoNext').checked = false;
  }

  mapBuilt = false;
  qCells = [];
  currentCellIndex = -1;
  questionFilter = 'all';

  $('#screenIntro').style.display = 'none';
  $('#screenResult').style.display = 'none';
  $('#screenQuiz').style.display = 'block';

  updatePracticeModeBadge();
  buildQuestionMapOnce();
  renderQuestion();
  requestAnimationFrame(() => document.getElementById('qText')?.focus({ preventScroll: true }));
  startTimer();
}

function buildPracticeQuizFromQuestions(questions, sourceTitle = '') {
  const practiceQuestions = deepClone(questions || []).filter(Boolean);
  practiceQuestions.forEach((q, i) => {
    q._id = q._id ?? q.id ?? q.questionId ?? i;
    q._reviewKey = q._reviewKey || createQuestionKey(q, { title: sourceTitle });
    q._reviewSource = q._reviewSource || sourceTitle;
  });

  const practiceQuiz = {
    title: sourceTitle ? `Luyện lại câu sai · ${sourceTitle}` : 'Luyện lại câu sai',
    timeLimit: 0,
    shuffle: false,
    questions: practiceQuestions
  };

  applyBookmarksToQuiz(practiceQuiz);
  return practiceQuiz;
}

function getWrongQuestionsFromCurrentAttempt() {
  if (!quiz?.questions?.length) return [];

  return quiz.questions.filter((question, index) => {
    const value = answers[index]?.value ?? null;
    return value === null || !isAnswerCorrect(question, value);
  });
}

function normalizeHistoryAnswerValue(value) {
  if (Array.isArray(value)) return value.map(Number).filter(Number.isInteger).sort((a, b) => a - b);
  if (Number.isInteger(value)) return value;
  if (value == null) return null;
  return String(value);
}

function questionFromHistoryDetail(detail, fallbackIndex) {
  const choices = Array.isArray(detail?.choices) ? detail.choices.slice() : [];
  const question = {
    text: String(detail?.questionText || `Câu ${fallbackIndex + 1}`),
    explanation: '',
    _id: detail?.questionId ?? detail?.index ?? fallbackIndex,
    _reviewKey: detail?.questionKey || '',
    _reviewSource: 'history'
  };

  if (choices.length) {
    question.choices = choices;
    question.answer = normalizeHistoryAnswerValue(detail.correctAnswer);
  } else {
    question.type = 'fill';
    question.answerText = String(detail?.correctAnswer ?? '');
  }

  return question;
}

function getWrongQuestionsFromHistoryItem(item) {
  const details = item?.details?.questions;
  if (!Array.isArray(details)) return [];

  return details
    .filter(question => question && question.isCorrect === false)
    .map((question, index) => questionFromHistoryDetail(question, index));
}

function beginWrongQuestionPractice(wrongQuestions, sourceTitle = '') {
  if (!Array.isArray(wrongQuestions) || !wrongQuestions.length) {
    showToast('Không có câu sai để luyện lại.', { type: 'info' });
    return false;
  }

  quiz = buildPracticeQuizFromQuestions(wrongQuestions, sourceTitle);
  isPracticeMode = true;
  quizSessionMode = 'practice';
  practiceSourceTitle = sourceTitle;
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

function questionFromMistakeEntry(entry, fallbackIndex = 0) {
  const choices = Array.isArray(entry?.choices) ? entry.choices.slice() : [];
  const question = {
    text: String(entry?.questionText || `Câu lỗi sai ${fallbackIndex + 1}`),
    explanation: entry?.note ? `Ghi chú: ${entry.note}` : '',
    _id: entry?.questionKey || fallbackIndex,
    _reviewKey: entry?.questionKey || '',
    _reviewSource: 'mistake-notebook',
    chapter: entry?.topic || undefined,
    category: entry?.topic || undefined
  };

  if (choices.length) {
    question.choices = choices;
    question.answer = normalizeHistoryAnswerValue(entry.correctAnswer);
  } else {
    question.type = 'fill';
    question.answerText = String(entry?.correctAnswer ?? '');
  }

  return question;
}

function startMistakeNotebookPractice(items = null) {
  const sourceItems = Array.isArray(items) ? items : loadMistakeNotebook().filter(item => (item.status || 'open') === 'open');
  const questions = sourceItems.map((item, index) => questionFromMistakeEntry(item, index)).filter(Boolean);

  if (!questions.length) {
    showToast('Sổ lỗi sai chưa có câu đang mở để luyện.', { type: 'info' });
    mistakeNotebookPanel.refresh?.();
    return false;
  }

  quiz = buildPracticeQuizFromQuestions(questions, 'sổ lỗi sai');
  quiz.title = 'Luyện sổ lỗi sai';
  isPracticeMode = true;
  quizSessionMode = 'practice';
  practiceSourceTitle = 'Sổ lỗi sai';
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

function getHistoryMistakeDetailsByKeys(keys = new Set()) {
  if (!keys.size) return [];
  const found = new Map();

  loadQuizHistory().forEach(item => {
    const details = Array.isArray(item?.details?.questions) ? item.details.questions : [];
    details.forEach(detail => {
      if (!detail || detail.isCorrect !== false) return;
      const key = String(detail.questionKey || detail.questionId || detail.questionText || '').trim();
      if (key && keys.has(key) && !found.has(key)) found.set(key, detail);
    });
  });

  return [...found.values()];
}

function startMistakePatternPractice(pattern = {}) {
  const keys = new Set((pattern?.payload?.questionKeys || []).filter(Boolean));
  const notebookItems = loadMistakeNotebook().filter(item => {
    if ((item.status || 'open') !== 'open') return false;
    if (keys.size) return keys.has(item.questionKey);
    return Number(item.mistakeCount || 1) >= 2;
  });

  if (notebookItems.length) return startMistakeNotebookPractice(notebookItems);

  const historyDetails = getHistoryMistakeDetailsByKeys(keys);
  if (historyDetails.length) {
    const questions = historyDetails.map((detail, index) => questionFromHistoryDetail(detail, index)).filter(Boolean);
    return beginWrongQuestionPractice(questions, pattern?.title || 'mẫu lỗi sai');
  }

  showToast('Chưa có đủ câu phù hợp để luyện mẫu lỗi sai này.', { type: 'info' });
  return false;
}

function startMistakeTopicPractice(pattern = {}) {
  const topic = String(pattern?.payload?.topic || '').trim();
  if (!topic) return startMistakePatternPractice(pattern);

  const notebookItems = loadMistakeNotebook().filter(item => (item.status || 'open') === 'open' && String(item.topic || 'Tất cả câu hỏi') === topic);
  if (notebookItems.length) return startMistakeNotebookPractice(notebookItems);

  const historyDetails = [];
  loadQuizHistory().forEach(item => {
    const details = Array.isArray(item?.details?.questions) ? item.details.questions : [];
    details.forEach(detail => {
      if (detail?.isCorrect === false && String(detail.topic || 'Tất cả câu hỏi') === topic) historyDetails.push(detail);
    });
  });

  if (historyDetails.length) {
    const questions = historyDetails.slice(0, 40).map((detail, index) => questionFromHistoryDetail(detail, index)).filter(Boolean);
    return beginWrongQuestionPractice(questions, topic);
  }

  showToast('Chưa tìm thấy câu lỗi sai thuộc phần này.', { type: 'info' });
  return false;
}

function openMistakePatternsPanel() {
  document.getElementById('analyticsPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestAnimationFrame(() => document.querySelector('.mistakePatternBlock .btn')?.focus({ preventScroll: true }));
  return true;
}

function handleMistakePatternAction(action, pattern = {}) {
  if (action === 'practiceMistakeTopic') return startMistakeTopicPractice(pattern);
  if (action === 'practiceRepeatedMistakes') return startMistakePatternPractice(pattern);
  if (action === 'openMistakeNotebook') return openMistakeNotebookPanel();
  if (action === 'openMistakePatterns') return openMistakePatternsPanel();
  if (action === 'practiceRepeatedMistakes') return startMistakePatternPractice(recommendation);
  if (action === 'reviewDue') return startDueReview();
  if (action === 'quickReview') return startBuilderPreset('quickReview');
  if (action === 'masteryBoost') return startBuilderPreset('masteryBoost');
  if (action === 'mockExam') return startBuilderPreset('mockExam');
  if (action === 'openBuilder') return openQuizBuilderFromRecommendation();
  return false;
}

function handleMistakeNotebookStatusChange(questionKey, status) {
  setMistakeNotebookStatus(questionKey, status);
  showToast('Đã cập nhật sổ lỗi sai.', { type: 'success', timeout: 2400 });
  mistakeNotebookPanel.refresh?.();
  analyticsPanel.refresh?.();
}

function handleMistakeNoteSave(questionKey, note) {
  saveMistakeNote(questionKey, note);
  showToast('Đã lưu ghi chú lỗi sai.', { type: 'success', timeout: 2400 });
  mistakeNotebookPanel.refresh?.();
}

function addCurrentMistakesToNotebook() {
  if (!quiz?.questions?.length) return false;

  const entries = createMistakeEntriesFromAttempt({ quiz, answers, attemptId: lastSubmittedAttemptId });
  if (!entries.length) {
    showToast('Không có câu sai để thêm vào sổ lỗi.', { type: 'info' });
    return false;
  }

  const result = addMistakeNotebookEntries(entries);
  mistakeNotebookPanel.refresh?.();
  analyticsPanel.refresh?.();
  showToast(`Đã thêm/cập nhật ${entries.length} câu trong sổ lỗi sai.`, { type: 'success' });
  return result;
}

function openMistakeNotebookPanel() {
  document.getElementById('mistakeNotebookPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestAnimationFrame(() => document.getElementById('btnPracticeMistakeNotebook')?.focus({ preventScroll: true }));
  return true;
}

function startWrongQuestionPracticeFromResult() {
  beginWrongQuestionPractice(getWrongQuestionsFromCurrentAttempt(), quiz?.title || 'bài vừa làm');
}

function startWrongQuestionPracticeFromHistory(item) {
  if (!item?.details?.questions?.length) {
    showToast('Chi tiết chỉ có với các lượt làm bài mới.', { type: 'info' });
    return;
  }

  beginWrongQuestionPractice(getWrongQuestionsFromHistoryItem(item), formatHistoryAttemptTitle(item));
}

function startWeakMasteryPracticeFromAnalytics(weakQuestions) {
  const requestedKeys = new Set(
    (Array.isArray(weakQuestions) ? weakQuestions : [])
      .map(item => item?.questionKey)
      .filter(Boolean)
  );

  if (!requestedKeys.size) {
    showToast('Chưa có dữ liệu mastery đủ để luyện câu yếu.', { type: 'info' });
    return;
  }

  const questions = flattenQuestionPool(allQuizzes)
    .filter(item => requestedKeys.has(item.questionKey))
    .map(item => {
      const question = deepClone(item.question);
      question._id = question._id ?? question.id ?? item.questionIndex;
      question._reviewKey = item.questionKey;
      question._reviewSource = item.sourceQuiz?.title || item.topicLabel || 'mastery';
      return question;
    });

  if (!questions.length) {
    showToast('Các câu mastery yếu chưa có trong dữ liệu hiện tại.', { type: 'warning' });
    return;
  }

  beginWrongQuestionPractice(questions, 'mastery yếu');
}

function startWeakQuestionPracticeFromAnalytics(weakQuestions) {
  const questions = Array.isArray(weakQuestions)
    ? weakQuestions
        .map((item, index) => questionFromHistoryDetail(item.sampleDetail, index))
        .filter(Boolean)
    : [];

  beginWrongQuestionPractice(questions, 'câu yếu');
}

function formatHistoryAttemptTitle(item) {
  const date = new Date(item?.createdAt);
  if (Number.isNaN(date.getTime())) return 'lịch sử';
  return date.toLocaleString('vi-VN');
}

function buildReviewQuizFromDueItems(dueItems) {
  const reviewQuestions = dueItems.map((item, index) => {
    const question = deepClone(item.question);
    question._id = question._id ?? question.id ?? item.sourceIndex ?? index;
    question._reviewKey = item.questionKey;
    question._reviewSource = item.sourceQuiz?.title || 'review';
    return question;
  });

  const reviewQuiz = {
    title: 'Ôn tập hôm nay',
    timeLimit: 0,
    shuffle: false,
    questions: reviewQuestions
  };

  applyBookmarksToQuiz(reviewQuiz);
  return reviewQuiz;
}

function startDueReview() {
  const dueItems = findDueReviewQuestions(allQuizzes);

  if (!dueItems.length) {
    showToast('Hôm nay chưa có câu cần ôn. Hãy hoàn thành thêm quiz hoặc quay lại sau nhé.', { type: 'info' });
    historyPanel.refresh?.();
    return false;
  }

  quiz = buildReviewQuizFromDueItems(dueItems);
  isPracticeMode = true;
  quizSessionMode = 'review';
  practiceSourceTitle = 'Ôn tập hôm nay';
  $('#timeLimit').value = 0;
  startQuizSession({ shuffle: false });
  return true;
}

function startBuilderPreset(preset, overrides = {}) {
  const defaultCounts = {
    quickReview: 20,
    deepDive: 30,
    mockExam: 60,
    masteryBoost: 20
  };

  const result = buildCustomQuiz(allQuizzes, {
    preset,
    count: overrides.count || defaultCounts[preset] || 20,
    topicKeys: overrides.topicKey ? [overrides.topicKey] : (Array.isArray(overrides.topicKeys) ? overrides.topicKeys : []),
    shuffle: preset !== 'deepDive',
    timerMinutes: preset === 'mockExam' ? 60 : 0,
    includeWeak: preset === 'quickReview' || preset === 'masteryBoost',
    includeDueReview: preset === 'quickReview' || preset === 'masteryBoost',
    includeBookmarked: false,
    bookmarks: loadBookmarks(),
    reviewKeys: getDueReviewKeys(),
    history: loadQuizHistory()
  });

  if (!result.quiz) {
    showToast(result.message || 'Không có câu hỏi phù hợp để tạo đề gợi ý.', { type: 'warning' });
    return false;
  }

  return startBuilderQuiz(result.quiz, {
    preset,
    selectedCount: result.selectedCount,
    message: overrides.message || result.message,
    selectionHint: result.selectionHint,
    sourceSummary: overrides.sourceSummary || result.sourceSummary
  });
}

function openQuizBuilderFromRecommendation() {
  const button = document.getElementById('btnStartBuilderQuiz');
  const panel = document.getElementById('quizBuilderPanel');
  panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  requestAnimationFrame(() => button?.focus({ preventScroll: true }));
}

function startFirstQuizFromRecommendation() {
  if (quiz?.questions?.length) {
    document.getElementById('btnStart')?.click();
    return true;
  }

  showToast('Chưa có dữ liệu câu hỏi. Hãy nạp JSON hoặc nạp giáo trình để bắt đầu.', { type: 'info' });
  triggerJsonImport();
  return false;
}

function getCurrentLearningAnalytics() {
  const history = loadQuizHistory();
  const reviewSchedule = loadReviewSchedule();
  const analytics = createLearningAnalytics({
    history,
    reviewSchedule,
    bookmarks: loadBookmarks(),
    mistakeNotebook: loadMistakeNotebook(),
    allQuizzes
  });
  const studyPlan = createStudyPlan({
    goal: loadStudyGoal(),
    history,
    analytics,
    allQuizzes
  });

  return {
    ...analytics,
    examReadiness: createExamReadiness({ analytics, history, reviewSchedule, studyPlan })
  };
}

function startStudyGoalToday(plan = null) {
  const activePlan = plan || createStudyPlan({
    goal: loadStudyGoal(),
    history: loadQuizHistory(),
    analytics: getCurrentLearningAnalytics(),
    allQuizzes
  });

  if (!activePlan?.hasGoal) {
    showToast('Chưa có mục tiêu học tập. Hãy tạo mục tiêu trước.', { type: 'info' });
    return openQuizBuilderFromRecommendation();
  }

  const goal = activePlan.goal;
  const count = Math.max(1, Number(goal.dailyQuestionTarget) || 20);

  if (goal.focusMode === 'dueFirst' && activePlan.dueReviewCount > 0) return startDueReview();

  if (goal.focusMode === 'weakFirst') {
    return startBuilderPreset('masteryBoost', {
      count,
      topicKeys: goal.selectedTopics,
      sourceSummary: 'Theo mục tiêu học tập: ưu tiên mastery thấp và câu cần ôn.'
    });
  }

  if (goal.focusMode === 'selectedTopics' && goal.selectedTopics?.length) {
    return startBuilderPreset('deepDive', {
      count,
      topicKeys: goal.selectedTopics,
      sourceSummary: 'Theo mục tiêu học tập: tập trung chương/chủ đề đã chọn.'
    });
  }

  return startBuilderPreset('quickReview', {
    count,
    topicKeys: goal.selectedTopics || [],
    sourceSummary: 'Theo mục tiêu học tập: phiên ôn nhanh cân bằng.'
  });
}


function getStudySessionPlanInput() {
  const history = loadQuizHistory();
  const reviewSchedule = loadReviewSchedule();
  const analytics = getCurrentLearningAnalytics();
  const studyPlan = createStudyPlan({
    goal: loadStudyGoal(),
    history,
    analytics,
    allQuizzes
  });
  const recommendations = createDailyRecommendations({
    analytics,
    topics: getBuilderTopics(allQuizzes),
    studyPlan
  });

  return {
    analytics,
    recommendations,
    studyPlan,
    allQuizzes
  };
}

function handleStudySessionStepAction(action, step = {}) {
  const recommendation = {
    id: `study-session-${step.type || action}`,
    action,
    payload: step.payload || {},
    source: 'studySession'
  };

  let didStart = handleDailyRecommendationAction(action, recommendation);
  if (!didStart && action === 'deepDiveTopic' && step.payload?.topicKey) {
    didStart = startBuilderPreset('deepDive', {
      topicKey: step.payload.topicKey,
      sourceSummary: step.payload.topicLabel ? `Buổi học hôm nay: tập trung ${step.payload.topicLabel}.` : 'Buổi học hôm nay: tập trung chủ đề yếu.'
    });
  }

  if (didStart && step.id) {
    const activeState = beginStudySessionStep(step.id);
    activeStudySessionStepIdForCurrentQuiz = activeState ? String(step.id) : '';
  }

  return didStart;
}


function handleRecommendationFeedback(recommendation = {}, feedback = 'helpful') {
  const recommendationType = recommendation.feedbackType || recommendation.id || recommendation.action;
  if (!recommendationType) return;

  saveRecommendationFeedback({ recommendationType, feedback });
  const message = feedback === 'hidden_today'
    ? 'Đã ẩn gợi ý này trong hôm nay.'
    : 'Đã ghi nhận phản hồi.';
  showToast(message, { type: 'success', timeout: 2600 });
  analyticsPanel.refresh?.();
}

function handleDailyRecommendationAction(action, recommendation = {}) {
  if (action === 'reviewDue') return startDueReview();
  if (action === 'practiceMistakeNotebook') return startMistakeNotebookPractice();
  if (action === 'openMistakeNotebook') return openMistakeNotebookPanel();
  if (action === 'openMistakePatterns') return openMistakePatternsPanel();
  if (action === 'practiceRepeatedMistakes') return startMistakePatternPractice(recommendation);
  if (action === 'practiceWeakMastery') return startWeakMasteryPracticeFromAnalytics(recommendation?.payload?.weakQuestions || createLearningAnalytics({ history: loadQuizHistory(), reviewSchedule: loadReviewSchedule(), bookmarks: loadBookmarks(), mistakeNotebook: loadMistakeNotebook(), allQuizzes }).mastery?.weakestQuestions);
  if (action === 'practiceWeak') return startWeakQuestionPracticeFromAnalytics(createLearningAnalytics({ history: loadQuizHistory(), reviewSchedule: loadReviewSchedule(), bookmarks: loadBookmarks(), mistakeNotebook: loadMistakeNotebook(), allQuizzes }).weakQuestions);
  if (action === 'quickReview') return startBuilderPreset('quickReview');
  if (action === 'masteryBoost') return startBuilderPreset('masteryBoost');
  if (action === 'mockExam') return startBuilderPreset('mockExam');
  if (action === 'deepDiveTopic') return startBuilderPreset('deepDive', {
    topicKey: recommendation?.payload?.topicKey,
    sourceSummary: recommendation?.payload?.topicLabel ? `Deep Dive theo ${recommendation.payload.topicLabel}.` : ''
  });
  if (action === 'startGoalToday') return startStudyGoalToday();
  if (action === 'editStudyGoal') {
    document.getElementById('studyGoalPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestAnimationFrame(() => document.getElementById('goalTargetDate')?.focus({ preventScroll: true }));
    return true;
  }
  if (action === 'startFirstQuiz') return startFirstQuizFromRecommendation();
  if (action === 'openBuilder') return openQuizBuilderFromRecommendation();
  return false;
}

function startBuilderQuiz(builderQuiz, meta = {}) {
  if (!builderQuiz?.questions?.length) {
    showToast('Không có câu hỏi phù hợp để tạo đề.', { type: 'warning' });
    return false;
  }

  quiz = deepClone(builderQuiz);
  normalizeQuizQuestionIds(quiz);
  applyPersistentBookmarksToCurrentQuiz();
  isPracticeMode = true;
  quizSessionMode = meta?.preset === 'mockExam' ? 'mock_exam' : 'builder';
  practiceSourceTitle = meta?.preset === 'quickReview'
    ? 'Quick Review'
    : meta?.preset === 'deepDive'
      ? 'Deep Dive'
      : meta?.preset === 'mockExam'
        ? 'Mock Exam'
        : meta?.preset === 'masteryBoost'
          ? 'Mastery Boost'
          : 'Tạo đề';

  const timerMinutes = Math.max(0, Math.round(Number(quiz.timeLimit || 0) / 60));
  $('#timeLimit').value = timerMinutes;
  startQuizSession({ shuffle: Boolean(quiz.shuffle) });

  if (meta?.message) showToast(meta.message, { type: 'info' });
  else showToast(`Đã tạo đề ${quiz.questions.length} câu.`, { type: 'success' });
  if (meta?.selectionHint) showToast(meta.selectionHint, { type: 'info', duration: 3600 });
  if (meta?.sourceSummary) showToast(meta.sourceSummary, { type: 'info', duration: 4200 });
  return true;
}

$('#btnStart').onclick = () => {
  if (!quiz) return;
  isPracticeMode = false;
  quizSessionMode = 'normal';
  practiceSourceTitle = '';
  startQuizSession({ shuffle: $('#shuffle').checked });
};

$('#btnSubmit').onclick = () => {
  if (!quiz || isSubmitted) return;
  const confirmMessage = quizSessionMode === 'mock_exam'
    ? 'Bạn muốn nộp Mock Exam? Sau khi nộp mới xem đáp án và phân tích.'
    : 'Bạn muốn nộp bài?';
  if (!confirm(confirmMessage)) return;
  isSubmitted = true;
  if (mapBuilt) {
    updateAllCells();
    applyQuestionFilter();
  }

  const score = calculateQuizScore(quiz, answers);
  const timeSpentSeconds = getTimeSpentSeconds();
  const topicBreakdown = buildResultTopicBreakdown({ quiz, answers });
  const historyItem = createQuizHistoryItem({
    quiz,
    answers,
    score,
    timeSpent: timeSpentSeconds,
    settings: getHistorySettings(),
    mode: getCurrentAttemptMode(),
    unansweredCount: getUnansweredCount(),
    topicBreakdown
  });
  lastSubmittedAttemptId = historyItem.id || '';
  saveQuizHistoryItem(historyItem);
  updateReviewScheduleFromAttempt({ quiz, answers });
  const sessionCompletion = activeStudySessionStepIdForCurrentQuiz
    ? completeActiveStudySessionStep({
        stepId: activeStudySessionStepIdForCurrentQuiz,
        score,
        timeSpent: timeSpentSeconds
      })
    : null;
  activeStudySessionStepIdForCurrentQuiz = '';

  if (sessionCompletion?.fullSessionComplete) {
    showToast('Đã hoàn thành buổi học hôm nay. Xem tổng kết trong mục Buổi học hôm nay.', { type: 'success', timeout: 4200 });
  } else if (sessionCompletion) {
    showToast('Đã ghi nhận bước học. Xem bước tiếp theo trong Buổi học hôm nay.', { type: 'success', timeout: 3600 });
  }
  invalidateLearningDataCaches();
  historyPanel.refresh?.();
  mistakeNotebookPanel.refresh?.();
  analyticsPanel.refresh?.();
  collectionsPanel.refresh?.();
  quizBuilderPanel.refresh?.();
  studyGoalPanel.refresh?.();
  studySessionPanel.refresh?.();

  clearProgressData();
  clearInterval(timerId);
  showQuizResult({
    quiz,
    answers,
    score,
    mode: getCurrentAttemptMode(),
    timeSpentSeconds,
    readinessImpact: getMockReadinessImpact(score),
    onPracticeWrong: startWrongQuestionPracticeFromResult,
    onAddMistakesToNotebook: addCurrentMistakesToNotebook,
    onPracticeSection: startMockExamSectionPractice
  });
  requestAnimationFrame(() => document.getElementById('resultTitle')?.focus({ preventScroll: true }));
};

function startTimer() {
  currentTimeLeft = quizTimerSeconds;
  runTimer();
}

function runTimer() {
  if (timerId) clearInterval(timerId);

  if (currentTimeLeft <= 0) {
    $('#timer').textContent = '∞';
    return;
  }

  timerId = setInterval(() => {
    currentTimeLeft--;
    saveProgressDebounced();
    const m = Math.floor(currentTimeLeft / 60);
    const s = (currentTimeLeft % 60).toString().padStart(2, '0');
    $('#timer').textContent = `${m}:${s}`;
    if (currentTimeLeft <= 0) {
      clearInterval(timerId);
      $('#btnSubmit').click();
    }
  }, 1000);
}


window.addEventListener('beforeunload', event => {
  if (quizSessionMode !== 'mock_exam' || isSubmitted || !quiz?.questions?.length) return;
  event.preventDefault();
  event.returnValue = '';
});

document.querySelectorAll('.filterChip[data-filter]').forEach(button => {
  button.addEventListener('click', () => {
    questionFilter = button.dataset.filter || 'all';
    applyQuestionFilter();
  });
});

$('#searchBox')?.addEventListener('input', (e) => {
  clearTimeout(searchDebounceTimer);
  searchDebounceTimer = setTimeout(() => {
    const nextKeyword = strip(e.target.value);
    if (nextKeyword === searchKeywordN) return;
    searchKeywordN = nextKeyword;
    applyQuestionFilter();
  }, 140);
});

$('#btnClearSearch')?.addEventListener('click', () => {
  const box = $('#searchBox');
  if (box) box.value = '';
  searchKeywordN = '';
  applyQuestionFilter();
});

$('#btnPracticeFiltered')?.addEventListener('click', startFilteredQuestionPractice);
// ===== Button: Tạo đề thi =====
$('#btnMakeExam').onclick = () => {
  try {
    const total = clampInt($('#examCount').value, 10, 2000);
    const p1 = clampInt($('#p1').value, 0, 100);
    const p2 = clampInt($('#p2').value, 0, 100);
    const p3 = clampInt($('#p3').value, 0, 100);

    const examQuiz = createExamQuiz(allQuizzes, {
      total,
      percents: [p1, p2, p3]
    });

    upsertExamIntoAllQuizzes(examQuiz);
    // chuyển sang quiz đề thi vừa tạo
    $('#quizSelect').value = 0;
    setupQuiz(0);

    $('#examInfo').textContent = `✅ Đã tạo: ${examQuiz.title}. Bấm "Bắt đầu" để làm.`;
  } catch (e) {
    $('#examInfo').textContent = '❌ ' + (e?.message || e);
  }
};

