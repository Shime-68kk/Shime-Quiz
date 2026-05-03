import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';
import { asArrayAnswer, asArrayUserAns, isAnswerCorrect, isFillQuestion } from './scoring.js';
import { createQuestionKey } from './spacedRepetition.js';

export const HISTORY_STORAGE_KEY = 'quizHistoryV1';
export const QUIZ_HISTORY_KEY = HISTORY_STORAGE_KEY;
export const MAX_HISTORY_ITEMS = 50;
const MAX_WRONG_INDEXES = 50;
const MAX_DETAIL_QUESTIONS = 120;
const MAX_TEXT_LENGTH = 1200;
const MAX_CHOICE_LENGTH = 600;
const MAX_CHOICES = 12;

function createHistoryId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(toSafeNumber(value, fallback)));
}

function toSafeString(value, maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function normalizeSettings(settings = {}) {
  if (!settings || typeof settings !== 'object') settings = {};

  const normalized = {
    timerMinutes: toSafeInteger(settings.timerMinutes, 0),
    shuffleEnabled: Boolean(settings.shuffleEnabled)
  };

  if ('instantFeedback' in settings) normalized.instantFeedback = Boolean(settings.instantFeedback);
  if ('autoNextEnabled' in settings) normalized.autoNextEnabled = Boolean(settings.autoNextEnabled);
  if (typeof settings.strictMode === 'boolean') normalized.strictMode = settings.strictMode;
  if (typeof settings.deepCustomMode === 'boolean') normalized.deepCustomMode = settings.deepCustomMode;

  return normalized;
}


function normalizeMode(value) {
  const mode = String(value || '').trim();
  return mode === 'mock_exam' || mode === 'builder' || mode === 'practice' || mode === 'review' || mode === 'normal'
    ? mode
    : undefined;
}

function normalizeTopicBreakdown(breakdown) {
  if (!Array.isArray(breakdown)) return undefined;

  const normalized = breakdown
    .map(item => {
      if (!item || typeof item !== 'object') return null;
      const total = toSafeInteger(item.total, 0);
      if (!total) return null;
      const correct = Math.min(toSafeInteger(item.correct, 0), total);
      const wrong = Math.min(toSafeInteger(item.wrong, total - correct), total);
      const unanswered = Math.min(toSafeInteger(item.unanswered, 0), total);
      const percentage = Math.max(0, Math.min(100, toSafeInteger(item.percentage, Math.round((correct / total) * 100))));
      return {
        topic: toSafeString(item.topic || item.label || 'Tất cả câu hỏi', 160),
        total,
        correct,
        wrong,
        unanswered,
        percentage
      };
    })
    .filter(Boolean)
    .slice(0, 24);

  return normalized.length ? normalized : undefined;
}

function normalizeWrongIndexes(indexes, totalQuestions) {
  if (!Array.isArray(indexes)) return { indexes: undefined, truncated: false };

  const normalized = indexes
    .map(index => Number(index))
    .filter(index => Number.isInteger(index) && index >= 0 && index < totalQuestions);

  if (!normalized.length) return { indexes: undefined, truncated: false };

  return {
    indexes: normalized.slice(0, MAX_WRONG_INDEXES),
    truncated: normalized.length > MAX_WRONG_INDEXES
  };
}

function normalizeAnswerValue(value, choicesLength = 0) {
  if (value == null) return null;

  if (Array.isArray(value)) {
    const normalized = value
      .map(Number)
      .filter(index => Number.isInteger(index) && index >= 0 && index < choicesLength)
      .sort((a, b) => a - b);
    return normalized.length ? normalized : null;
  }

  const numeric = Number(value);
  if (Number.isInteger(numeric) && numeric >= 0 && numeric < choicesLength) return numeric;

  return toSafeString(value, MAX_CHOICE_LENGTH) || null;
}

function normalizeCorrectAnswerValue(value, questionType, choicesLength = 0) {
  if (questionType === 'fill') return toSafeString(value, MAX_CHOICE_LENGTH) || null;
  return normalizeAnswerValue(value, choicesLength);
}

function createQuestionDetail(question, answers, index, quiz) {
  if (!question || typeof question !== 'object') return null;

  const isFill = isFillQuestion(question);
  const choices = Array.isArray(question.choices)
    ? question.choices.slice(0, MAX_CHOICES).map(choice => toSafeString(choice, MAX_CHOICE_LENGTH))
    : [];
  const choicesLength = choices.length;
  const rawUserAnswer = answers?.[index]?.value ?? null;
  const rawCorrectAnswer = isFill ? (question.answerText ?? question.answer ?? '') : question.answer;
  const isCorrect = rawUserAnswer !== null && isAnswerCorrect(question, rawUserAnswer);

  return {
    index,
    questionKey: createQuestionKey(question, quiz) || undefined,
    questionId: question.id == null ? undefined : toSafeString(question.id, 120),
    questionText: toSafeString(question.text, MAX_TEXT_LENGTH),
    topic: toSafeString(question.chapter || question.category || question.topic || question.section || question.group || '', 160) || undefined,
    choices,
    userAnswer: normalizeAnswerValue(rawUserAnswer, choicesLength),
    correctAnswer: normalizeCorrectAnswerValue(rawCorrectAnswer, isFill ? 'fill' : 'choice', choicesLength),
    isCorrect
  };
}

function createHistoryDetails(quiz, answers) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  if (!questions.length) return undefined;

  const normalizedQuestions = questions
    .slice(0, MAX_DETAIL_QUESTIONS)
    .map((question, index) => createQuestionDetail(question, answers, index, quiz))
    .filter(Boolean);

  if (!normalizedQuestions.length) return undefined;

  return {
    questions: normalizedQuestions,
    truncated: questions.length > MAX_DETAIL_QUESTIONS
  };
}

function normalizeQuestionDetail(detail, totalQuestions) {
  if (!detail || typeof detail !== 'object') return null;

  const index = toSafeInteger(detail.index, 0);
  if (index >= totalQuestions) return null;

  const choices = Array.isArray(detail.choices)
    ? detail.choices.slice(0, MAX_CHOICES).map(choice => toSafeString(choice, MAX_CHOICE_LENGTH))
    : [];

  return {
    index,
    questionKey: detail.questionKey == null ? undefined : toSafeString(detail.questionKey, 220),
    questionId: detail.questionId == null ? undefined : toSafeString(detail.questionId, 120),
    questionText: toSafeString(detail.questionText ?? detail.text, MAX_TEXT_LENGTH),
    topic: toSafeString(detail.topic || detail.chapter || detail.category || '', 160) || undefined,
    choices,
    userAnswer: normalizeAnswerValue(detail.userAnswer, choices.length),
    correctAnswer: normalizeCorrectAnswerValue(detail.correctAnswer, choices.length ? 'choice' : 'fill', choices.length),
    isCorrect: Boolean(detail.isCorrect)
  };
}

function normalizeDetails(details, totalQuestions) {
  if (!details || typeof details !== 'object') return undefined;
  if (!Array.isArray(details.questions)) return undefined;

  const questions = details.questions
    .slice(0, MAX_DETAIL_QUESTIONS)
    .map(detail => normalizeQuestionDetail(detail, totalQuestions))
    .filter(Boolean);

  if (!questions.length) return undefined;

  return {
    questions,
    truncated: Boolean(details.truncated) || details.questions.length > MAX_DETAIL_QUESTIONS
  };
}

function normalizeHistoryItem(item) {
  if (!item || typeof item !== 'object') return null;

  const totalQuestions = toSafeInteger(item.totalQuestions, 0);
  const correctCount = Math.min(toSafeInteger(item.correctCount ?? item.score, 0), totalQuestions);
  const wrongCount = Math.min(toSafeInteger(item.wrongCount, totalQuestions - correctCount), totalQuestions);
  const percentage = Math.max(0, Math.min(100, toSafeInteger(item.percentage, 0)));

  if (!totalQuestions) return null;

  const normalized = {
    id: String(item.id || createHistoryId()),
    createdAt: String(item.createdAt || new Date().toISOString()),
    score: correctCount,
    totalQuestions,
    correctCount,
    wrongCount,
    percentage,
    settings: normalizeSettings(item.settings)
  };

  const mode = normalizeMode(item.mode);
  if (mode) normalized.mode = mode;

  const unansweredCount = toSafeInteger(item.unansweredCount, 0);
  if (unansweredCount) normalized.unansweredCount = Math.min(unansweredCount, totalQuestions);

  const topicBreakdown = normalizeTopicBreakdown(item.topicBreakdown);
  if (topicBreakdown) normalized.topicBreakdown = topicBreakdown;

  const timeSpent = toSafeNumber(item.timeSpent ?? item.timeSpentSeconds, NaN);
  if (Number.isFinite(timeSpent) && timeSpent >= 0) {
    normalized.timeSpent = Math.round(timeSpent);
  }

  const wrong = normalizeWrongIndexes(item.wrongQuestionIndexes, totalQuestions);
  if (wrong.indexes) normalized.wrongQuestionIndexes = wrong.indexes;
  if (wrong.truncated || item.wrongQuestionIndexesTruncated === true) {
    normalized.wrongQuestionIndexesTruncated = true;
  }

  const details = normalizeDetails(item.details, totalQuestions);
  if (details) normalized.details = details;

  return normalized;
}

function collectWrongQuestionIndexes(quiz, answers) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  if (!questions.length) return [];

  const wrongIndexes = [];
  questions.forEach((question, index) => {
    const userValue = answers?.[index]?.value ?? null;
    if (userValue === null || !isAnswerCorrect(question, userValue)) wrongIndexes.push(index);
  });

  return wrongIndexes;
}

export function createQuizHistoryItem({ quiz, answers, score, settings, timeSpent, timeSpentSeconds, wrongQuestionIndexes, mode, topicBreakdown, unansweredCount } = {}) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const totalQuestions = toSafeInteger(score?.total ?? score?.totalQuestions ?? questions.length, 0);
  const correctCount = Math.min(toSafeInteger(score?.totalCorrect ?? score?.correctCount, 0), totalQuestions);
  const wrongCount = Math.max(0, totalQuestions - correctCount);
  const percentage = Math.max(0, Math.min(100, toSafeInteger(score?.percent ?? score?.percentage, 0)));
  const wrongIndexes = Array.isArray(wrongQuestionIndexes)
    ? wrongQuestionIndexes
    : collectWrongQuestionIndexes(quiz, answers);

  const item = {
    id: createHistoryId(),
    createdAt: new Date().toISOString(),
    score: correctCount,
    totalQuestions,
    correctCount,
    wrongCount,
    percentage,
    settings: normalizeSettings(settings)
  };

  const normalizedMode = normalizeMode(mode);
  if (normalizedMode) item.mode = normalizedMode;

  const safeUnansweredCount = toSafeInteger(unansweredCount, 0);
  if (safeUnansweredCount) item.unansweredCount = Math.min(safeUnansweredCount, totalQuestions);

  const normalizedTopicBreakdown = normalizeTopicBreakdown(topicBreakdown);
  if (normalizedTopicBreakdown) item.topicBreakdown = normalizedTopicBreakdown;

  const spent = toSafeNumber(timeSpent ?? timeSpentSeconds, NaN);
  if (Number.isFinite(spent) && spent >= 0) {
    item.timeSpent = Math.round(spent);
  }

  const wrong = normalizeWrongIndexes(wrongIndexes, totalQuestions);
  if (wrong.indexes) item.wrongQuestionIndexes = wrong.indexes;
  if (wrong.truncated) item.wrongQuestionIndexesTruncated = true;

  const details = createHistoryDetails(quiz, answers);
  if (details) item.details = details;

  return item;
}

export function loadQuizHistory() {
  try {
    const raw = getJSON(HISTORY_STORAGE_KEY);
    if (!Array.isArray(raw)) return [];

    return raw
      .map(item => {
        try {
          return normalizeHistoryItem(item);
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .slice(0, MAX_HISTORY_ITEMS);
  } catch {
    removeStorageItem(HISTORY_STORAGE_KEY);
    return [];
  }
}

export function saveQuizHistoryItem(item) {
  const normalized = normalizeHistoryItem(item);
  if (!normalized) return loadQuizHistory();

  const nextHistory = [normalized, ...loadQuizHistory()].slice(0, MAX_HISTORY_ITEMS);
  setJSON(HISTORY_STORAGE_KEY, nextHistory);
  return nextHistory;
}

export function addQuizHistoryItem(item) {
  return saveQuizHistoryItem(item)[0] || null;
}

export function clearQuizHistory() {
  removeStorageItem(HISTORY_STORAGE_KEY);
}
