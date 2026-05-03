import { getBuilderTopics } from './quizBuilder.js';
import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';

export const STUDY_SESSION_STORAGE_KEY = 'quizStudySessionV1';
export const STUDY_SESSION_COMPLETION_STORAGE_KEY = 'quizStudySessionCompletionsV1';

const MAX_STEPS = 4;
const MAX_COMPLETION_RECORDS = 30;
const MIN_STEP_QUESTIONS = 5;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function toSafeInteger(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

function todayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createId(prefix = 'session') {
  if (globalThis.crypto?.randomUUID) return `${prefix}-${globalThis.crypto.randomUUID()}`;
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeStep(step, index = 0) {
  if (!isPlainObject(step)) return null;
  const action = String(step.action || '').trim();
  const title = String(step.title || '').trim();
  if (!action || !title) return null;

  return {
    id: String(step.id || `${action}-${index}`),
    type: String(step.type || action),
    title,
    reason: String(step.reason || 'Dựa trên dữ liệu học cục bộ của bạn.'),
    action,
    actionLabel: String(step.actionLabel || 'Làm bước này'),
    estimatedQuestions: Math.max(0, toSafeInteger(step.estimatedQuestions, 0)),
    estimatedMinutes: Math.max(0, toSafeInteger(step.estimatedMinutes, 0)),
    payload: isPlainObject(step.payload) ? { ...step.payload } : {}
  };
}

function normalizeState(value) {
  if (!isPlainObject(value)) return null;
  const steps = Array.isArray(value.steps)
    ? value.steps.map(normalizeStep).filter(Boolean).slice(0, MAX_STEPS)
    : [];

  return {
    id: String(value.id || createId()),
    dateKey: String(value.dateKey || todayKey()),
    createdAt: String(value.createdAt || new Date().toISOString()),
    lastUpdatedAt: String(value.lastUpdatedAt || new Date().toISOString()),
    active: value.active !== false,
    activeStepId: value.activeStepId ? String(value.activeStepId) : '',
    steps,
    completedStepIds: Array.isArray(value.completedStepIds)
      ? [...new Set(value.completedStepIds.map(String).filter(Boolean))]
      : []
  };
}

export function loadStudySessionState() {
  try {
    return normalizeState(getJSON(STUDY_SESSION_STORAGE_KEY));
  } catch {
    removeStorageItem(STUDY_SESSION_STORAGE_KEY);
    return null;
  }
}

export function saveStudySessionState(state) {
  const normalized = normalizeState({
    ...(isPlainObject(state) ? state : {}),
    lastUpdatedAt: new Date().toISOString()
  });
  if (!normalized) return null;
  setJSON(STUDY_SESSION_STORAGE_KEY, normalized);
  return normalized;
}

export function clearStudySessionState() {
  removeStorageItem(STUDY_SESSION_STORAGE_KEY);
}

function makeStep({ type, title, reason, action, actionLabel, estimatedQuestions, payload = {} }) {
  return normalizeStep({
    id: `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    reason,
    action,
    actionLabel,
    estimatedQuestions,
    estimatedMinutes: Math.max(5, Math.round((Number(estimatedQuestions) || MIN_STEP_QUESTIONS) * 0.8)),
    payload
  });
}

function countQuestionBank(allQuizzes = []) {
  return (Array.isArray(allQuizzes) ? allQuizzes : []).reduce((sum, quiz) => {
    return sum + (Array.isArray(quiz?.questions) ? quiz.questions.length : 0);
  }, 0);
}

function getWeakTopic(analytics) {
  const topic = analytics?.mastery?.weakestTopics?.find(item => item && item.weakCount > 0 && item.masteryScore < 72)
    || analytics?.mastery?.weakestTopics?.[0];
  if (!topic) return null;
  return {
    key: topic.topic,
    label: topic.topic || 'Tất cả câu hỏi',
    masteryScore: toSafeInteger(topic.masteryScore, 0),
    weakCount: toSafeInteger(topic.weakCount, 0)
  };
}
function normalizeTopicLookupText(value) {
  return String(value || '').trim().toLocaleLowerCase('vi');
}

function createBuilderTopicResolver(allQuizzes = []) {
  const topics = getBuilderTopics(allQuizzes);
  const byKey = new Map();
  const byLabel = new Map();

  topics.forEach(topic => {
    if (!topic?.key) return;
    byKey.set(String(topic.key), topic);
    const labelKey = normalizeTopicLookupText(topic.label);
    if (labelKey && !byLabel.has(labelKey)) byLabel.set(labelKey, topic);
  });

  return function resolveBuilderTopic(...candidates) {
    for (const candidate of candidates) {
      const key = String(candidate || '').trim();
      if (key && byKey.has(key)) return byKey.get(key);
    }

    for (const candidate of candidates) {
      const labelKey = normalizeTopicLookupText(candidate);
      if (labelKey && byLabel.has(labelKey)) return byLabel.get(labelKey);
    }

    return null;
  };
}

function repairDeepDiveTopicStep(step, resolveBuilderTopic) {
  if (!step || step.action !== 'deepDiveTopic') return step;
  const topic = resolveBuilderTopic(
    step.payload?.topicKey,
    step.payload?.topicLabel,
    step.title?.replace(/^Củng cố\s+/i, '')
  );
  if (!topic) return null;
  return {
    ...step,
    payload: {
      ...step.payload,
      topicKey: topic.key,
      topicLabel: topic.label
    }
  };
}


function getRepeatedMistakeCount(analytics) {
  const patterns = Array.isArray(analytics?.mistakePatterns) ? analytics.mistakePatterns : [];
  const repeated = patterns.find(item => item?.type === 'repeated_questions');
  return toSafeInteger(repeated?.payload?.questionKeys?.length, 0);
}

function reorderForGoal(steps, studyPlan) {
  const focusMode = studyPlan?.goal?.focusMode || '';
  if (!focusMode) return steps;

  const priorityByFocus = {
    dueFirst: ['dueReview', 'mistakePractice', 'weakTopic', 'quickReview', 'miniMock'],
    weakFirst: ['weakTopic', 'mistakePractice', 'dueReview', 'quickReview', 'miniMock'],
    selectedTopics: ['weakTopic', 'quickReview', 'dueReview', 'mistakePractice', 'miniMock'],
    balanced: ['dueReview', 'weakTopic', 'mistakePractice', 'quickReview', 'miniMock']
  };
  const order = priorityByFocus[focusMode] || priorityByFocus.balanced;
  const indexFor = type => {
    const index = order.indexOf(type);
    return index >= 0 ? index : order.length;
  };
  return steps.slice().sort((a, b) => indexFor(a.type) - indexFor(b.type));
}

function createBaseSteps({ analytics = {}, studyPlan = null, allQuizzes = [] } = {}) {
  const steps = [];
  const questionBankCount = countQuestionBank(allQuizzes);
  const dailyTarget = Math.max(10, toSafeInteger(studyPlan?.todayTarget || studyPlan?.goal?.dailyQuestionTarget, 20));
  const dueCount = toSafeInteger(analytics?.dueReviewCount, 0);
  const openMistakeCount = toSafeInteger(analytics?.openMistakeCount, 0);
  const repeatedMistakeCount = getRepeatedMistakeCount(analytics);
  const weakTopic = getWeakTopic(analytics);
  const weakMasteryCount = toSafeInteger(analytics?.mastery?.weakCount, 0);
  const resolveBuilderTopic = createBuilderTopicResolver(allQuizzes);
  const weakBuilderTopic = weakTopic ? resolveBuilderTopic(weakTopic.key, weakTopic.label) : null;

  if (dueCount > 0) {
    steps.push(makeStep({
      type: 'dueReview',
      title: 'Ôn câu đến hạn',
      reason: `Có ${dueCount} câu đến hạn ôn, nên xử lý trước khi luyện phần mới.`,
      action: 'reviewDue',
      actionLabel: 'Ôn tập hôm nay',
      estimatedQuestions: Math.min(dailyTarget, Math.max(MIN_STEP_QUESTIONS, dueCount))
    }));
  }

  if (openMistakeCount > 0 || repeatedMistakeCount > 0) {
    steps.push(makeStep({
      type: 'mistakePractice',
      title: 'Luyện sổ lỗi sai',
      reason: repeatedMistakeCount > 0
        ? `Có ${repeatedMistakeCount} câu sai lặp lại cần xem lại theo nhóm nhỏ.`
        : `Có ${openMistakeCount} lỗi đang mở trong sổ lỗi sai.`,
      action: 'practiceMistakeNotebook',
      actionLabel: 'Luyện sổ lỗi',
      estimatedQuestions: Math.min(15, Math.max(MIN_STEP_QUESTIONS, openMistakeCount || repeatedMistakeCount))
    }));
  }

  if (weakTopic && weakBuilderTopic && (weakTopic.weakCount > 0 || weakTopic.masteryScore < 70)) {
    steps.push(makeStep({
      type: 'weakTopic',
      title: `Củng cố ${weakBuilderTopic.label}`,
      reason: `${weakBuilderTopic.label} có mastery khoảng ${weakTopic.masteryScore}%, phù hợp để luyện tập trung.`,
      action: 'deepDiveTopic',
      actionLabel: 'Luyện phần này',
      estimatedQuestions: Math.min(20, Math.max(10, weakTopic.weakCount || Math.round(dailyTarget / 2))),
      payload: { topicKey: weakBuilderTopic.key, topicLabel: weakBuilderTopic.label }
    }));
  } else if (weakMasteryCount > 0) {
    steps.push(makeStep({
      type: 'weakTopic',
      title: 'Củng cố vùng mastery thấp',
      reason: `Có ${weakMasteryCount} câu mastery thấp cần luyện thêm.`,
      action: 'masteryBoost',
      actionLabel: 'Mastery Boost',
      estimatedQuestions: Math.min(20, Math.max(10, weakMasteryCount))
    }));
  }

  steps.push(makeStep({
    type: 'quickReview',
    title: 'Quick Review cân bằng',
    reason: 'Một phiên ngắn giúp duy trì nhịp học và lấp khoảng trống nếu chưa đủ dữ liệu yếu/due.',
    action: 'quickReview',
    actionLabel: 'Quick Review',
    estimatedQuestions: Math.min(20, Math.max(10, dailyTarget))
  }));

  if (questionBankCount >= 30 && toSafeInteger(analytics?.totalAttempts, 0) > 0) {
    steps.push(makeStep({
      type: 'miniMock',
      title: 'Mini Mock cuối buổi',
      reason: 'Kết thúc bằng một bài mô phỏng ngắn để kiểm tra khả năng tổng hợp.',
      action: 'mockExam',
      actionLabel: 'Làm mock exam',
      estimatedQuestions: Math.min(30, Math.max(15, Math.round(dailyTarget * 0.75)))
    }));
  }

  return reorderForGoal(steps.filter(Boolean), studyPlan).slice(0, MAX_STEPS);
}

export function createTodayStudySessionPlan({ analytics = null, recommendations = [], studyPlan = null, allQuizzes = [], state = loadStudySessionState(), now = new Date() } = {}) {
  const dateKey = todayKey(now);
  const saved = state?.dateKey === dateKey ? state : null;
  const generatedSteps = createBaseSteps({ analytics: analytics || {}, recommendations, studyPlan, allQuizzes });
  const resolveBuilderTopic = createBuilderTopicResolver(allQuizzes);
  const sourceSteps = saved?.steps?.length ? saved.steps : generatedSteps;
  const steps = sourceSteps
    .map(step => repairDeepDiveTopicStep(step, resolveBuilderTopic))
    .filter(Boolean);
  const validStepIds = new Set(steps.map(step => step.id));
  const completed = new Set((saved?.completedStepIds || []).filter(stepId => validStepIds.has(stepId)));
  const totalQuestions = steps.reduce((sum, step) => sum + toSafeInteger(step.estimatedQuestions, 0), 0);
  const estimatedMinutes = steps.reduce((sum, step) => sum + toSafeInteger(step.estimatedMinutes, 0), 0);
  const completedCount = steps.filter(step => completed.has(step.id)).length;
  const hasQuestionBank = countQuestionBank(allQuizzes) > 0;

  return {
    id: saved?.id || createId(),
    dateKey,
    createdAt: saved?.createdAt || new Date().toISOString(),
    hasQuestionBank,
    hasSession: steps.length > 0,
    steps,
    completedStepIds: [...completed],
    completedCount,
    totalQuestions,
    estimatedMinutes,
    progressPercent: steps.length ? Math.round((completedCount / steps.length) * 100) : 0,
    primaryStep: steps.find(step => !completed.has(step.id)) || steps[0] || null,
    reason: studyPlan?.hasGoal
      ? `Theo mục tiêu học tập hôm nay: ${studyPlan.todayTarget || studyPlan.goal?.dailyQuestionTarget || 20} câu.`
      : 'Dựa trên câu cần ôn, sổ lỗi sai và mastery hiện tại.'
  };
}

export function persistStudySessionPlan(plan) {
  if (!plan?.steps?.length) return null;
  return saveStudySessionState({
    id: plan.id,
    dateKey: plan.dateKey,
    createdAt: plan.createdAt,
    steps: plan.steps,
    completedStepIds: plan.completedStepIds || [],
    active: true
  });
}

export function markStudySessionStepComplete(stepId, plan = null) {
  const activePlan = plan || createTodayStudySessionPlan();
  if (!activePlan?.steps?.length || !stepId) return null;
  const completed = new Set(activePlan.completedStepIds || []);
  completed.add(String(stepId));
  return saveStudySessionState({
    id: activePlan.id,
    dateKey: activePlan.dateKey,
    createdAt: activePlan.createdAt,
    steps: activePlan.steps,
    completedStepIds: [...completed],
    activeStepId: activePlan.activeStepId || '',
    active: true
  });
}

function normalizeCompletionRecord(record) {
  if (!isPlainObject(record)) return null;
  const sessionId = String(record.sessionId || '').trim();
  const completedAt = String(record.completedAt || '').trim();
  if (!sessionId || !completedAt) return null;

  return {
    id: String(record.id || createId('session-completion')),
    sessionId,
    completedAt,
    stepId: String(record.stepId || ''),
    stepType: String(record.stepType || ''),
    stepTitle: String(record.stepTitle || ''),
    stepsCompleted: toSafeInteger(record.stepsCompleted, 0),
    attemptedCount: toSafeInteger(record.attemptedCount, 0),
    correctCount: toSafeInteger(record.correctCount, 0),
    wrongCount: toSafeInteger(record.wrongCount, 0),
    timeSpent: toSafeInteger(record.timeSpent, 0),
    dueQuestionsCompleted: toSafeInteger(record.dueQuestionsCompleted, 0),
    mistakesPracticed: toSafeInteger(record.mistakesPracticed, 0),
    weakTopicsPracticed: toSafeInteger(record.weakTopicsPracticed, 0),
    nextActionType: String(record.nextActionType || ''),
    fullSessionComplete: Boolean(record.fullSessionComplete)
  };
}

export function loadStudySessionCompletions() {
  try {
    const raw = getJSON(STUDY_SESSION_COMPLETION_STORAGE_KEY);
    if (!Array.isArray(raw)) return [];
    return raw.map(normalizeCompletionRecord).filter(Boolean).slice(0, MAX_COMPLETION_RECORDS);
  } catch {
    removeStorageItem(STUDY_SESSION_COMPLETION_STORAGE_KEY);
    return [];
  }
}

export function saveStudySessionCompletions(records = []) {
  const normalized = (Array.isArray(records) ? records : [])
    .map(normalizeCompletionRecord)
    .filter(Boolean)
    .slice(0, MAX_COMPLETION_RECORDS);
  setJSON(STUDY_SESSION_COMPLETION_STORAGE_KEY, normalized);
  return normalized;
}

export function clearStudySessionCompletions() {
  removeStorageItem(STUDY_SESSION_COMPLETION_STORAGE_KEY);
}

export function beginStudySessionStep(stepId, plan = null) {
  const activePlan = plan || createTodayStudySessionPlan();
  if (!activePlan?.steps?.length || !stepId) return null;

  return saveStudySessionState({
    id: activePlan.id,
    dateKey: activePlan.dateKey,
    createdAt: activePlan.createdAt,
    steps: activePlan.steps,
    completedStepIds: activePlan.completedStepIds || [],
    activeStepId: String(stepId),
    active: true
  });
}

function getStepImpactCounts(step, attemptedCount) {
  const type = step?.type || '';
  return {
    dueQuestionsCompleted: type === 'dueReview' ? attemptedCount : 0,
    mistakesPracticed: type === 'mistakePractice' ? attemptedCount : 0,
    weakTopicsPracticed: type === 'weakTopic' ? attemptedCount : 0
  };
}

function getNextIncompleteStep(state) {
  const completed = new Set(state?.completedStepIds || []);
  return (state?.steps || []).find(step => !completed.has(step.id)) || null;
}

export function completeActiveStudySessionStep({ stepId = '', score = null, timeSpent = 0 } = {}) {
  const expectedStepId = String(stepId || '').trim();
  if (!expectedStepId) return null;

  const state = loadStudySessionState();
  if (!state?.activeStepId || !state.steps?.length) return null;
  if (String(state.activeStepId) !== expectedStepId) return null;

  const step = state.steps.find(item => item.id === expectedStepId);
  if (!step) return null;

  const completed = new Set(state.completedStepIds || []);
  completed.add(step.id);
  const nextState = saveStudySessionState({
    ...state,
    completedStepIds: [...completed],
    activeStepId: '',
    active: true
  });

  const attemptedCount = toSafeInteger(score?.total || score?.totalQuestions || step.estimatedQuestions, 0);
  const correctCount = toSafeInteger(score?.totalCorrect || score?.correctCount, 0);
  const wrongCount = Math.max(0, attemptedCount - correctCount);
  const nextStep = getNextIncompleteStep(nextState);
  const impact = getStepImpactCounts(step, attemptedCount);
  const record = normalizeCompletionRecord({
    id: createId('session-completion'),
    sessionId: nextState.id,
    completedAt: new Date().toISOString(),
    stepId: step.id,
    stepType: step.type,
    stepTitle: step.title,
    stepsCompleted: completed.size,
    attemptedCount,
    correctCount,
    wrongCount,
    timeSpent,
    ...impact,
    nextActionType: nextStep?.action || (completed.size >= nextState.steps.length ? 'stopToday' : 'quickReview'),
    fullSessionComplete: completed.size >= nextState.steps.length
  });

  const completions = [record, ...loadStudySessionCompletions()].slice(0, MAX_COMPLETION_RECORDS);
  saveStudySessionCompletions(completions);
  return record;
}

export function getStudySessionCompletionSummary(plan = null) {
  const activePlan = plan || createTodayStudySessionPlan();
  if (!activePlan?.id) return null;
  const records = loadStudySessionCompletions().filter(record => record.sessionId === activePlan.id);
  const completedStepIds = new Set([...(activePlan.completedStepIds || []), ...records.map(record => record.stepId).filter(Boolean)]);
  const lastRecord = records[0] || null;
  const totals = records.reduce((summary, record) => {
    summary.attemptedCount += toSafeInteger(record.attemptedCount, 0);
    summary.correctCount += toSafeInteger(record.correctCount, 0);
    summary.wrongCount += toSafeInteger(record.wrongCount, 0);
    summary.timeSpent += toSafeInteger(record.timeSpent, 0);
    summary.dueQuestionsCompleted += toSafeInteger(record.dueQuestionsCompleted, 0);
    summary.mistakesPracticed += toSafeInteger(record.mistakesPracticed, 0);
    summary.weakTopicsPracticed += toSafeInteger(record.weakTopicsPracticed, 0);
    return summary;
  }, { attemptedCount: 0, correctCount: 0, wrongCount: 0, timeSpent: 0, dueQuestionsCompleted: 0, mistakesPracticed: 0, weakTopicsPracticed: 0 });

  const nextStep = activePlan.steps.find(step => !completedStepIds.has(step.id)) || null;
  const stepsCompleted = completedStepIds.size;

  if (!stepsCompleted && !records.length) return null;

  return {
    sessionId: activePlan.id,
    stepsCompleted,
    totalSteps: activePlan.steps.length,
    completedStepIds: [...completedStepIds],
    lastRecord,
    nextStep,
    fullSessionComplete: activePlan.steps.length > 0 && stepsCompleted >= activePlan.steps.length,
    nextActionType: nextStep?.action || 'stopToday',
    ...totals
  };
}
