import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import StudyItemRenderer from '../components/study/StudyItemRenderer.jsx';
import StudyResultSummary from '../components/study/StudyResultSummary.jsx';
import FsrsProductionMemoryRatingBridge from '../components/study/FsrsProductionMemoryRatingBridge.jsx';
import { createStudyHistoryRecord, saveStudyHistoryRecord } from '../state/studyHistoryStorage.js';
import { readReviewSchedule, updateReviewScheduleFromHistoryRecord, appendFsrsReviewLog, getBridgeToggleEnabled } from '../state/reviewScheduleStorage.js';
import { selectDueReviewItems } from '../study/dueReviewSelector.js';
import { selectWeightedPracticeItems } from '../learning/weightedPracticeSelector.js';
import { readStudyHistory } from '../state/studyHistoryStorage.js';
import { markStudyPlanStepComplete } from '../state/studyPlanProgressStorage.js';
import { useLearningDataAdapter } from '../data/learningDataStore.js';
import {
  clearStudyDraft,
  createItemSetFingerprint,
  readStudyDraftForItems,
  saveStudyDraftForItems
} from '../state/studyDraftStorage.js';
import { createStudyAttemptSummary, getIncompleteStudyItemCount } from '../study/studyAttemptSummary.js';
import { normalizeAnswerText } from '../utils/text.js';
import { shouldShowFsrsTwoStepBridge } from '../quiz/reviewSchedulerAdapter.js';

function getStudyMode(selection) {
  if (selection?.mode === 'due-review') return 'due-review';
  if (selection?.mode === 'smart-practice') return 'smart-practice';
  return 'standard';
}

function getSelectionLabel(selection) {
  const mode = getStudyMode(selection);
  if (mode === 'due-review') return 'Ôn tập hôm nay';
  if (mode === 'smart-practice') return 'Luyện tập thông minh';
  if (!selection?.subjectTitle) return 'Toàn bộ thư viện';
  if (selection.topicTitle) return `${selection.subjectTitle} · ${selection.topicTitle}`;
  return selection.subjectTitle;
}

function getStudyItems(adapter, selection) {
  const mode = getStudyMode(selection);
  if (mode === 'due-review') {
    const schedule = readReviewSchedule();
    return selectDueReviewItems({
      items: adapter.getAllItems(),
      scheduleRecords: schedule.records || []
    }).map(entry => entry.item);
  }

  if (mode === 'smart-practice') {
    const allItems = adapter.getAllItems();
    const selectedIds = Array.isArray(selection?.selectedItemIds)
      ? selection.selectedItemIds.map(String).filter(Boolean)
      : [];

    if (selectedIds.length) {
      const byId = new Map(allItems.map(item => [String(item.id), item]));
      return selectedIds.map(itemId => byId.get(itemId)).filter(Boolean);
    }

    const history = readStudyHistory();
    const schedule = readReviewSchedule();
    return selectWeightedPracticeItems({
      items: allItems,
      historyRecords: history.records || [],
      scheduleRecords: schedule.records || [],
      requestedCount: selection?.requestedCount || 10,
      filter: { subjectId: selection?.subjectId, topicId: selection?.topicId }
    }).selectedItems;
  }

  if (selection?.topicId) return adapter.getItemsByTopic(selection.topicId);
  if (selection?.subjectId) return adapter.getItemsBySubject(selection.subjectId);
  return adapter.getAllItems();
}

function getTopicLookup(adapter) {
  return new Map(adapter.data.topics.map(topic => [topic.id, topic]));
}

function nowIso() {
  return new Date().toISOString();
}


function getChoiceText(choice) {
  if (typeof choice === 'string') return choice;
  return choice?.text ?? choice?.label ?? choice?.value ?? '';
}

function getAcceptableAnswers(item) {
  const answers = Array.isArray(item?.acceptableAnswers) ? item.acceptableAnswers : [];
  return [item?.correctAnswer, item?.answer, ...answers]
    .map(answer => String(answer ?? '').trim())
    .filter(Boolean)
    .filter((answer, index, all) => all.findIndex(candidate => normalizeAnswerText(candidate) === normalizeAnswerText(answer)) === index);
}

function isDisplayOnlyAnswerCorrect(item, itemState = {}) {
  if (!item || !itemState.checked) return null;
  if (item.type === 'multiple_choice') {
    const choices = Array.isArray(item.choices) ? item.choices : [];
    const selectedChoice = choices.find(choice => String(choice.id) === String(itemState.answer || ''));
    if (!selectedChoice) return false;
    const expected = normalizeAnswerText(item.correctAnswer);
    return Boolean(expected) && (
      normalizeAnswerText(selectedChoice.id) === expected ||
      normalizeAnswerText(getChoiceText(selectedChoice)) === expected
    );
  }
  if (item.type === 'short_answer') {
    const response = normalizeAnswerText(itemState.answer || '');
    if (!response) return false;
    return getAcceptableAnswers(item).some(answer => normalizeAnswerText(answer) === response);
  }
  return null;
}

function getCheckedAnswerFeedback(item, itemState = {}) {
  const isCorrect = isDisplayOnlyAnswerCorrect(item, itemState);
  if (isCorrect === true) {
    return {
      tone: 'success',
      title: 'Chính xác — tiếp tục nhé.',
      message: 'Bạn có thể chuyển sang item tiếp theo khi sẵn sàng.'
    };
  }
  if (isCorrect === false) {
    return {
      tone: 'warning',
      title: 'Chưa đúng — xem lại đáp án rồi thử câu tiếp theo.',
      message: 'Feedback này chỉ hỗ trợ luồng học; cách chấm điểm và lịch ôn tập không thay đổi.'
    };
  }
  return {
    tone: 'info',
    title: 'Đã ghi nhận thao tác học.',
    message: 'Tiếp tục giữ nhịp học hiện tại nhé.'
  };
}

function getCompletionFeedback(summary, mode) {
  if (!summary) {
    return {
      tone: 'info',
      title: 'Phiên học đã hoàn tất.',
      message: 'Kết quả phiên học được xử lý cục bộ trên trình duyệt này.'
    };
  }
  const prefix = mode === 'due-review'
    ? 'Hoàn thành phiên ôn tập ngắn.'
    : mode === 'smart-practice'
      ? 'Hoàn thành phiên luyện tập thông minh.'
      : 'Hoàn thành phiên học ngắn.';
  return {
    tone: 'success',
    title: prefix,
    message: `${summary.answeredCount}/${summary.totalItems} mục đã được trả lời. Bạn có thể xem tổng kết, học tiếp hoặc quay lại thư viện.`
  };
}

function formatSavedTime(value) {
  if (!value) return '';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    }).format(new Date(value));
  } catch {
    return '';
  }
}

// Focus-mode shell only. It reuses the same item renderer for standard study
// and due-review mode. Future mastery, recommendations, and weighted selection
// should stay behind services instead of living inside route components.
export default function StudyRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const adapter = useLearningDataAdapter();
  const selection = location.state?.selection;
  const planStepId = selection?.planStepId || '';
  const planDateKey = selection?.planDateKey || '';
  const studyMode = getStudyMode(selection);
  const isDueReviewMode = studyMode === 'due-review';
  const isSmartPracticeMode = studyMode === 'smart-practice';
  const selectionLabel = getSelectionLabel(selection);
  const items = useMemo(() => getStudyItems(adapter, selection), [adapter, selection]);
  const itemSetFingerprint = useMemo(() => createItemSetFingerprint(items, studyMode), [items, studyMode]);
  const topicLookup = useMemo(() => getTopicLookup(adapter), [adapter]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersByItemId, setAnswersByItemId] = useState({});
  const [checkedByItemId, setCheckedByItemId] = useState({});
  const [flashcardRevealedByItemId, setFlashcardRevealedByItemId] = useState({});
  const [startedAt, setStartedAt] = useState(() => nowIso());
  const [saveStatus, setSaveStatus] = useState('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState('');
  const [completedAttempt, setCompletedAttempt] = useState(null);
  const [historySaveMessage, setHistorySaveMessage] = useState('');
  const [reviewScheduleMessage, setReviewScheduleMessage] = useState('');
  const [planProgressMessage, setPlanProgressMessage] = useState('');
  const [resultPersistenceNote, setResultPersistenceNote] = useState('');
  const [microFeedback, setMicroFeedback] = useState({ tone: 'info', title: '', message: '' });
  const [pendingSessionAction, setPendingSessionAction] = useState('');
  // Phase 14N: per-item bridge state — {phase:'auto-again'|'rated'|'skipped', rating} or undefined.
  const [bridgeStateByItemId, setBridgeStateByItemId] = useState({});
  const draftReadyRef = useRef(false);
  const saveTimerRef = useRef(null);

  const currentItem = items[currentIndex] || null;
  const currentTopic = currentItem ? topicLookup.get(currentItem.topicId) : null;
  const currentItemId = currentItem?.id ? String(currentItem.id) : '';
  const progressValue = items.length ? ((currentIndex + 1) / items.length) * 100 : 0;
  const currentItemState = currentItemId ? {
    answer: answersByItemId[currentItemId] || '',
    checked: Boolean(checkedByItemId[currentItemId]),
    revealed: Boolean(flashcardRevealedByItemId[currentItemId])
  } : {};

  // Phase 14N: bridge gate — re-evaluated per item, never session-cached.
  const isPostResult = Boolean(currentItemState.checked || currentItemState.revealed);
  const objectiveCorrect = isDisplayOnlyAnswerCorrect(currentItem, currentItemState);
  const currentBridgeState = currentItemId ? bridgeStateByItemId[currentItemId] : undefined;

  const bridgeScheduleRecord = useMemo(() => {
    if (!currentItemId || !isPostResult) return null;
    const schedule = readReviewSchedule();
    return (schedule.records || []).find(r => r.itemId === currentItemId) ?? null;
  }, [currentItemId, isPostResult]);

  const bridgeToggleEnabled = useMemo(() => {
    if (!isPostResult) return false;
    return getBridgeToggleEnabled();
  }, [isPostResult]);

  const showBridge = Boolean(
    !completedAttempt &&
    isPostResult &&
    shouldShowFsrsTwoStepBridge(bridgeScheduleRecord, bridgeToggleEnabled)
  );

  // Auto-append Again log for wrong/unanswered eligible items.
  useEffect(() => {
    if (!showBridge || !currentItemId || objectiveCorrect !== false || currentBridgeState) return;
    appendFsrsReviewLog(currentItemId, {
      rating: 'Again',
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: new Date().toISOString(),
      objectiveCorrect: false
    });
    setBridgeStateByItemId(prev => ({
      ...prev,
      [currentItemId]: { phase: 'auto-again', rating: 'Again' }
    }));
  }, [showBridge, currentItemId, objectiveCorrect, currentBridgeState]);

  useEffect(() => {
    draftReadyRef.current = false;
    setSaveStatus('idle');
    setLastSavedAt('');
    setCompletedAttempt(null);
    setHistorySaveMessage('');
    setReviewScheduleMessage('');
    setPlanProgressMessage('');
    setResultPersistenceNote('');
    setMicroFeedback({ tone: 'info', title: '', message: '' });
    setPendingSessionAction('');
    setBridgeStateByItemId({});

    if (!items.length) {
      setCurrentIndex(0);
      setAnswersByItemId({});
      setCheckedByItemId({});
      setFlashcardRevealedByItemId({});
      setStartedAt(nowIso());
      setStatusMessage('');
      setHistorySaveMessage('');
      setReviewScheduleMessage('');
      setPlanProgressMessage('');
      setResultPersistenceNote('');
      setMicroFeedback({ tone: 'info', title: '', message: '' });
      setPendingSessionAction('');
      setBridgeStateByItemId({});
      return;
    }

    const result = readStudyDraftForItems(items, { mode: studyMode });
    if (result.restored && result.draft) {
      setCurrentIndex(result.draft.currentItemIndex);
      setAnswersByItemId(result.draft.answersByItemId || {});
      setCheckedByItemId(result.draft.checkedByItemId || {});
      setFlashcardRevealedByItemId(result.draft.flashcardRevealedByItemId || {});
      setStartedAt(result.draft.startedAt || nowIso());
      setLastSavedAt(result.draft.updatedAt || '');
      setStatusMessage(isDueReviewMode
        ? 'Đã khôi phục phiên ôn tập gần nhất.'
        : isSmartPracticeMode
          ? 'Đã khôi phục phiên luyện tập thông minh gần nhất.'
          : 'Đã khôi phục phiên học gần nhất.');
    } else {
      setCurrentIndex(0);
      setAnswersByItemId({});
      setCheckedByItemId({});
      setFlashcardRevealedByItemId({});
      setStartedAt(nowIso());
      setStatusMessage(result.discarded ? 'Phiên học cũ không khớp chế độ hiện tại nên đã được bỏ qua.' : '');
    }

    window.requestAnimationFrame(() => {
      draftReadyRef.current = true;
    });
  }, [isDueReviewMode, isSmartPracticeMode, itemSetFingerprint, items, studyMode]);

  useEffect(() => {
    if (!draftReadyRef.current || !items.length || completedAttempt) return undefined;

    setSaveStatus('saving');
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);

    saveTimerRef.current = window.setTimeout(() => {
      const result = saveStudyDraftForItems(items, {
        mode: studyMode,
        currentItemIndex: currentIndex,
        answersByItemId,
        checkedByItemId,
        flashcardRevealedByItemId,
        startedAt
      }, { mode: studyMode });

      if (result.ok) {
        setLastSavedAt(result.draft.updatedAt);
        setSaveStatus('saved');
      } else {
        setSaveStatus('error');
        setStatusMessage('Không thể lưu phiên học cục bộ. Bạn vẫn có thể tiếp tục trong phiên hiện tại.');
      }
    }, 350);

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    };
  }, [answersByItemId, checkedByItemId, completedAttempt, currentIndex, flashcardRevealedByItemId, itemSetFingerprint, items, startedAt, studyMode]);

  function getCurrentAttemptState() {
    return {
      answersByItemId,
      checkedByItemId,
      flashcardRevealedByItemId
    };
  }

  function showMicroFeedback(nextFeedback) {
    setMicroFeedback({
      tone: nextFeedback?.tone || 'info',
      title: nextFeedback?.title || '',
      message: nextFeedback?.message || ''
    });
  }

  function clearSessionConfirmation() {
    setPendingSessionAction('');
  }

  function updateAnswer(value) {
    if (!currentItemId || completedAttempt) return;
    clearSessionConfirmation();
    setAnswersByItemId(current => ({ ...current, [currentItemId]: value }));
    setCheckedByItemId(current => ({ ...current, [currentItemId]: false }));
    showMicroFeedback({
      tone: 'info',
      title: 'Đã cập nhật câu trả lời.',
      message: 'Khi sẵn sàng, hãy kiểm tra đáp án để nhận phản hồi.'
    });
  }

  function checkCurrentAnswer() {
    if (!currentItemId || completedAttempt) return;
    clearSessionConfirmation();
    const nextItemState = { ...currentItemState, checked: true };
    setCheckedByItemId(current => ({ ...current, [currentItemId]: true }));
    showMicroFeedback(getCheckedAnswerFeedback(currentItem, nextItemState));
  }

  function resetCurrentAnswer() {
    if (!currentItemId || completedAttempt) return;
    setAnswersByItemId(current => {
      const next = { ...current };
      delete next[currentItemId];
      return next;
    });
    setCheckedByItemId(current => ({ ...current, [currentItemId]: false }));
    clearSessionConfirmation();
    showMicroFeedback({
      tone: 'info',
      title: 'Đã xóa câu trả lời hiện tại.',
      message: 'Bạn có thể thử lại mà không ảnh hưởng thư viện hoặc lịch ôn tập.'
    });
  }

  function toggleCurrentFlashcard() {
    if (!currentItemId || completedAttempt) return;
    clearSessionConfirmation();
    const willReveal = !flashcardRevealedByItemId[currentItemId];
    setFlashcardRevealedByItemId(current => ({ ...current, [currentItemId]: !current[currentItemId] }));
    showMicroFeedback({
      tone: willReveal ? 'success' : 'info',
      title: willReveal ? 'Đã lật thẻ — đọc chậm lại một nhịp nhé.' : 'Đã úp lại thẻ.',
      message: 'Thao tác flashcard không thay đổi điểm số hoặc lịch ôn tập cho đến khi bạn hoàn thành phiên.'
    });
  }

  function resetCurrentFlashcard() {
    if (!currentItemId || completedAttempt) return;
    clearSessionConfirmation();
    setFlashcardRevealedByItemId(current => ({ ...current, [currentItemId]: false }));
    showMicroFeedback({
      tone: 'info',
      title: 'Đã đặt lại flashcard.',
      message: 'Bạn có thể lật lại thẻ khi muốn ôn lại nội dung.'
    });
  }

  function goToPrevious() {
    if (completedAttempt) return;
    clearSessionConfirmation();
    setCurrentIndex(index => Math.max(0, index - 1));
  }

  function goToNext() {
    if (completedAttempt) return;
    clearSessionConfirmation();
    setCurrentIndex(index => Math.min(items.length - 1, index + 1));
  }

  function resetSessionState(message = 'Đã làm lại phiên học. Thư viện dữ liệu không bị thay đổi.') {
    clearStudyDraft();
    draftReadyRef.current = false;
    setCurrentIndex(0);
    setAnswersByItemId({});
    setCheckedByItemId({});
    setFlashcardRevealedByItemId({});
    setStartedAt(nowIso());
    setLastSavedAt('');
    setSaveStatus('idle');
    setCompletedAttempt(null);
    setHistorySaveMessage('');
    setReviewScheduleMessage('');
    setPlanProgressMessage('');
    setResultPersistenceNote('');
    setPendingSessionAction('');
    setBridgeStateByItemId({});
    showMicroFeedback({
      tone: 'info',
      title: 'Đã làm lại phiên học.',
      message: 'Tiến trình nháp trong Phòng học đã được đặt lại; thư viện dữ liệu không bị thay đổi.'
    });
    setStatusMessage(message === 'Đã làm lại phiên học. Thư viện dữ liệu không bị thay đổi.'
      ? isDueReviewMode
        ? 'Đã làm lại phiên ôn tập. Thư viện dữ liệu không bị thay đổi.'
        : isSmartPracticeMode
          ? 'Đã làm lại phiên luyện tập thông minh. Thư viện dữ liệu không bị thay đổi.'
          : message
      : message);
    window.requestAnimationFrame(() => {
      draftReadyRef.current = true;
    });
  }

  function requestRestartSession() {
    if (!items.length) return;
    setPendingSessionAction('restart');
    showMicroFeedback({
      tone: 'warning',
      title: 'Xác nhận làm lại phiên học?',
      message: 'Thao tác này chỉ xóa tiến trình nháp trong Phòng học, không xóa thư viện đã nạp.'
    });
  }

  function finishSession({ allowIncomplete = false } = {}) {
    if (!items.length || !currentItem) {
      setStatusMessage(isDueReviewMode
        ? 'Không có câu cần ôn hôm nay.'
        : isSmartPracticeMode
          ? 'Không có câu phù hợp để luyện lúc này.'
          : 'Chưa có mục học hợp lệ để hoàn thành phiên học.');
      return;
    }

    const incompleteCount = getIncompleteStudyItemCount(items, getCurrentAttemptState());
    if (incompleteCount > 0 && !allowIncomplete) {
      finishSession({ allowIncomplete: true });
      return;
    }

    if (completedAttempt) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    const completedAt = nowIso();
    const summary = createStudyAttemptSummary(items, getCurrentAttemptState());
    const historyRecord = createStudyHistoryRecord({
      startedAt,
      completedAt,
      itemSetFingerprint,
      summary
    });
    const historyResult = saveStudyHistoryRecord(historyRecord);
    const reviewScheduleResult = historyResult.saved
      ? updateReviewScheduleFromHistoryRecord(historyResult.record)
      : null;
    const planProgressResult = planStepId
      ? markStudyPlanStepComplete(planStepId, planDateKey)
      : null;
    const persistenceNote = historyResult.ok
      ? historyResult.duplicate
        ? 'Phiên học này đã có trong lịch sử cục bộ. Lịch ôn tập không cập nhật lại để tránh ghi trùng.'
        : reviewScheduleResult?.ok
          ? 'Kết quả học tập đã được lưu cục bộ. Lịch sử học và lịch ôn tập đã được cập nhật trên trình duyệt này.'
          : 'Kết quả học tập đã được lưu vào lịch sử cục bộ, nhưng lịch ôn tập chưa cập nhật thành công.'
      : 'Kết quả chỉ hiển thị trong phiên hiện tại vì không thể lưu lịch sử học cục bộ.';

    draftReadyRef.current = false;
    clearStudyDraft();
    setCompletedAttempt({
      id: historyRecord?.id || '',
      completedAt,
      itemSetFingerprint,
      summary
    });
    setPendingSessionAction('');
    showMicroFeedback(getCompletionFeedback(summary, studyMode));
    setSaveStatus('idle');
    setLastSavedAt('');
    setHistorySaveMessage(historyResult.ok
      ? historyResult.duplicate
        ? 'Phiên học này đã có trong lịch sử.'
        : 'Đã lưu vào lịch sử học cục bộ.'
      : 'Không thể lưu lịch sử học cục bộ. Kết quả vẫn hiển thị trong phiên hiện tại.');
    setReviewScheduleMessage(reviewScheduleResult
      ? reviewScheduleResult.ok
        ? `Đã cập nhật lịch ôn tập cục bộ cho ${reviewScheduleResult.updatedCount} câu.`
        : 'Không thể cập nhật lịch ôn tập cục bộ. Kết quả phiên học vẫn được giữ.'
      : historyResult.duplicate
        ? 'Lịch ôn tập không cập nhật lại để tránh trùng phiên học.'
        : 'Lịch ôn tập chưa được cập nhật.');
    setResultPersistenceNote(persistenceNote);
    setPlanProgressMessage(planProgressResult
      ? planProgressResult.ok
        ? 'Đã cập nhật tiến trình kế hoạch hôm nay.'
        : 'Không thể cập nhật tiến trình kế hoạch hôm nay.'
      : '');
    setStatusMessage(isDueReviewMode
      ? 'Đã hoàn thành phiên ôn tập. Bản nháp cục bộ đã được xóa.'
      : isSmartPracticeMode
        ? 'Đã hoàn thành phiên luyện tập thông minh. Bản nháp cục bộ đã được xóa.'
        : 'Đã hoàn thành phiên học. Bản nháp cục bộ đã được xóa.');
  }

  function requestFinishSession() {
    finishSession();
  }

  function confirmPendingSessionAction() {
    if (pendingSessionAction === 'finish') {
      finishSession({ allowIncomplete: true });
      return;
    }
    if (pendingSessionAction === 'restart') {
      resetSessionState();
    }
  }

  function cancelPendingSessionAction() {
    const wasFinish = pendingSessionAction === 'finish';
    setPendingSessionAction('');
    showMicroFeedback({
      tone: 'info',
      title: wasFinish ? 'Tiếp tục phiên học hiện tại.' : 'Đã giữ nguyên phiên học.',
      message: wasFinish ? 'Bạn có thể hoàn thành sau khi kiểm tra thêm câu.' : 'Tiến trình nháp hiện tại vẫn được giữ lại.'
    });
  }

  // Phase 14N: bridge handlers — scheduling and scoring are unaffected.
  function handleBridgeRating(rating) {
    if (!currentItemId || !showBridge || completedAttempt) return;
    appendFsrsReviewLog(currentItemId, {
      rating,
      source: 'phase14n-studyroom-bridge',
      activeScheduling: false,
      reviewedAt: new Date().toISOString(),
      objectiveCorrect: true
    });
    setBridgeStateByItemId(prev => ({
      ...prev,
      [currentItemId]: { phase: 'rated', rating }
    }));
  }

  function handleBridgeSkip() {
    if (!currentItemId || !showBridge || completedAttempt) return;
    setBridgeStateByItemId(prev => ({
      ...prev,
      [currentItemId]: { phase: 'skipped', rating: null }
    }));
  }

  function continueStudy() {
    setCompletedAttempt(null);
    setHistorySaveMessage('');
    setReviewScheduleMessage('');
    setPlanProgressMessage('');
    setResultPersistenceNote('');
    setPendingSessionAction('');
    showMicroFeedback({
      tone: 'info',
      title: 'Tiếp tục phiên học.',
      message: 'Bạn có thể quay lại câu hiện tại mà không thay đổi kết quả đã lưu.'
    });
    setStatusMessage(isDueReviewMode
      ? 'Bạn có thể tiếp tục ôn tập từ câu hiện tại.'
      : isSmartPracticeMode
        ? 'Bạn có thể tiếp tục luyện tập thông minh từ câu hiện tại.'
        : 'Bạn có thể tiếp tục học từ item hiện tại.');
    window.requestAnimationFrame(() => {
      draftReadyRef.current = true;
    });
  }

  function goToLibrary() {
    navigate('/library');
  }

  function goToDashboard() {
    navigate('/dashboard');
  }

  const draftStatusText = completedAttempt
    ? resultPersistenceNote || 'Phiên học đã hoàn thành. Kết quả học tập được xử lý cục bộ trên trình duyệt này.'
    : saveStatus === 'saving'
      ? 'Đang lưu tiến trình cục bộ...'
      : saveStatus === 'saved'
        ? `Đã lưu tiến trình cục bộ${formatSavedTime(lastSavedAt) ? ` lúc ${formatSavedTime(lastSavedAt)}` : ''}.`
        : saveStatus === 'error'
          ? 'Không thể lưu tiến trình cục bộ.'
          : lastSavedAt
            ? `Phiên học đã lưu${formatSavedTime(lastSavedAt) ? ` lúc ${formatSavedTime(lastSavedAt)}` : ''}.`
            : 'Tiến trình phiên học sẽ được lưu cục bộ trên thiết bị này.';

  return (
    <section className="studyRoom">
      <Card className="studyRoom__card" eyebrow="Chế độ tập trung" variant="elevated">
        <PageHeader
          compact
          eyebrow={isDueReviewMode ? 'Chế độ ôn tập' : isSmartPracticeMode ? 'Luyện tập thông minh' : 'Phòng học'}
          title={completedAttempt ? 'Tổng kết phiên học' : isDueReviewMode ? 'Chế độ ôn tập' : isSmartPracticeMode ? 'Luyện tập thông minh' : 'Phòng học tập trung'}
          subtitle={isDueReviewMode
            ? 'Chỉ hiển thị các câu đã đến hạn theo lịch ôn tập cục bộ. Kết quả vẫn dùng cùng luồng tổng kết, lịch sử và cập nhật lịch ôn.'
            : isSmartPracticeMode
              ? 'Ưu tiên câu đến hạn, câu từng sai và câu chưa luyện. Đây là lựa chọn có trọng số đơn giản, không phải AI.'
              : 'Renderer v2 hiển thị item từ thư viện hiện tại. Kết quả phiên học xử lý cục bộ trong lịch sử và lịch ôn tập v2.'}
          actions={items.length ? (
            <div className="studyHeaderActions">
              {!completedAttempt ? (
                <Button type="button" variant="secondary" size="sm" onClick={requestFinishSession}>
                  Hoàn thành phiên học
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" onClick={requestRestartSession}>
                Làm lại phiên học
              </Button>
            </div>
          ) : null}
        />

        <div className="studySourceBar" aria-label="Nguồn mục đang học">
          <Badge tone={isDueReviewMode ? 'warning' : isSmartPracticeMode ? 'success' : selection?.subjectTitle ? 'success' : 'info'}>
            {isDueReviewMode ? 'Chế độ ôn tập' : isSmartPracticeMode ? 'Luyện tập thông minh' : selection?.subjectTitle ? 'Lựa chọn từ Library' : 'Toàn bộ thư viện'}
          </Badge>
          <strong>{selectionLabel}</strong>
          <span>{isDueReviewMode ? `${items.length} câu đến hạn` : isSmartPracticeMode ? `${items.length} câu được chọn` : `${items.length} item`}</span>
        </div>

        {items.length ? (
          <div className="studyDraftStatus" role="status" aria-live="polite">
            <span>{draftStatusText}</span>
            {statusMessage ? <strong>{statusMessage}</strong> : null}
          </div>
        ) : null}

        {items.length && (microFeedback.title || microFeedback.message) ? (
          <div className={`studyFeedback studyFeedback--${microFeedback.tone || 'info'}`} role="status" aria-live="polite">
            {microFeedback.title ? <strong>{microFeedback.title}</strong> : null}
            {microFeedback.message ? <p>{microFeedback.message}</p> : null}
          </div>
        ) : null}

        {pendingSessionAction ? (
          <div className="studyFeedback studyFeedback--warning" role="status" aria-live="polite">
            <strong>{pendingSessionAction === 'finish' ? 'Xác nhận hoàn thành phiên học?' : 'Xác nhận làm lại phiên học?'}</strong>
            <p>{pendingSessionAction === 'finish'
              ? 'Bạn có thể hoàn thành ngay hoặc tiếp tục học thêm. Thao tác này không thay đổi cách chấm điểm.'
              : 'Làm lại chỉ đặt lại tiến trình nháp trong Phòng học; thư viện dữ liệu không bị xóa.'}</p>
            <div className="studyActions studyActions--compact">
              <Button type="button" onClick={confirmPendingSessionAction}>
                {pendingSessionAction === 'finish' ? 'Xác nhận hoàn thành' : 'Xác nhận làm lại'}
              </Button>
              <Button type="button" variant="ghost" onClick={cancelPendingSessionAction}>
                Tiếp tục phiên học
              </Button>
            </div>
          </div>
        ) : null}

        {items.length === 0 ? (
          <EmptyState
            icon="◇"
            title={isDueReviewMode ? 'Không có câu cần ôn hôm nay' : isSmartPracticeMode ? 'Không có câu phù hợp để luyện' : 'Chưa có mục học để học'}
            description={isDueReviewMode
              ? 'Lịch ôn tập hiện chưa có câu đến hạn khớp với thư viện hiện tại. Hãy hoàn thành thêm phiên học hoặc quay lại Dashboard.'
              : isSmartPracticeMode
                ? 'Thư viện, lịch sử hoặc lịch ôn hiện tại không tạo được phiên luyện tập thông minh. Hãy import thêm học liệu hoặc hoàn thành một phiên học thường.'
                : 'Thư viện hiện tại không có item hợp lệ cho lựa chọn này. Hãy quay lại Library để chọn subject/topic khác hoặc import dữ liệu v2 hợp lệ.'}
          />
        ) : completedAttempt ? (
          <StudyResultSummary
            summary={completedAttempt.summary}
            persistenceNote={resultPersistenceNote}
            historyMessage={[historySaveMessage, reviewScheduleMessage, planProgressMessage].filter(Boolean).join(' ')}
            onRestart={requestRestartSession}
            onContinue={continueStudy}
            onGoToLibrary={goToLibrary}
            onGoToDashboard={goToDashboard}
          />
        ) : (
          <div className="studySessionStack">
            <ProgressBar
              value={progressValue}
              label={`Tiến độ duyệt item ${currentIndex + 1} trên ${items.length}`}
            />

            <StudyItemRenderer
              item={currentItem}
              contextLabel={currentTopic?.title}
              itemState={currentItemState}
              actions={{
                onAnswerChange: updateAnswer,
                onCheck: checkCurrentAnswer,
                onResetAnswer: resetCurrentAnswer,
                onToggleReveal: toggleCurrentFlashcard,
                onResetReveal: resetCurrentFlashcard
              }}
            />

            {showBridge ? (
              <FsrsProductionMemoryRatingBridge
                objectiveCorrect={objectiveCorrect}
                bridgeState={currentBridgeState}
                onSelectRating={handleBridgeRating}
                onSkip={handleBridgeSkip}
              />
            ) : null}

            <nav className="studyStepper" aria-label="Điều hướng mục học tập">
              <Button type="button" variant="secondary" onClick={goToPrevious} disabled={currentIndex === 0}>
                Item trước
              </Button>
              <span aria-live="polite">
                {currentIndex + 1} / {items.length}
              </span>
              <Button type="button" onClick={goToNext} disabled={currentIndex >= items.length - 1}>
                Item tiếp theo
              </Button>
            </nav>
          </div>
        )}
      </Card>
    </section>
  );
}
