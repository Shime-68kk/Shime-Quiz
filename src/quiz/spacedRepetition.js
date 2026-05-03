import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';
import { isAnswerCorrect } from './scoring.js';

export const REVIEW_STORAGE_KEY = 'quizReviewScheduleV1';
export const MAX_REVIEW_ITEMS = 1000;

const MIN_EASE = 1.3;
const MAX_EASE = 3.0;
const DEFAULT_EASE = 2.3;
const WRONG_REVIEW_DELAY_HOURS = 6;

function toSafeNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toSafeInteger(value, fallback = 0) {
  return Math.max(0, Math.round(toSafeNumber(value, fallback)));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function hashString(value) {
  const text = normalizeText(value);
  let hash = 2166136261;

  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

function safeIsoDate(value, fallback = new Date().toISOString()) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addHours(date, hours) {
  const next = new Date(date);
  next.setHours(next.getHours() + hours);
  return next;
}

function getQuestionSource(question, quiz) {
  return normalizeText(
    question?._reviewSource ||
    question?.chapter ||
    question?.category ||
    question?.section ||
    quiz?.title ||
    ''
  );
}

export function createQuestionKey(question, quiz) {
  if (!question || typeof question !== 'object') return '';
  if (typeof question._reviewKey === 'string' && question._reviewKey.trim()) return question._reviewKey;

  const source = getQuestionSource(question, quiz);
  const stableId = question.id ?? question.questionId ?? null;

  if (stableId != null && String(stableId).trim()) {
    return `q:${hashString(source)}:id:${hashString(String(stableId))}`;
  }

  const text = normalizeText(question.text);
  if (!text) return '';

  return `q:${hashString(source)}:text:${hashString(text)}`;
}

function normalizeReviewItem(item) {
  if (!item || typeof item !== 'object') return null;

  const questionKey = String(item.questionKey || '').trim();
  if (!questionKey) return null;

  const easeFactor = clamp(toSafeNumber(item.easeFactor, DEFAULT_EASE), MIN_EASE, MAX_EASE);
  const intervalDays = toSafeInteger(item.intervalDays, 0);
  const repetitionCount = toSafeInteger(item.repetitionCount, 0);
  const correctStreak = toSafeInteger(item.correctStreak, 0);
  const wrongCount = toSafeInteger(item.wrongCount, 0);
  const dueAt = safeIsoDate(item.dueAt);
  const lastReviewedAt = item.lastReviewedAt ? safeIsoDate(item.lastReviewedAt) : null;

  return {
    questionKey,
    easeFactor,
    intervalDays,
    repetitionCount,
    dueAt,
    lastReviewedAt,
    correctStreak,
    wrongCount
  };
}

function normalizeReviewMap(raw) {
  const items = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.values(raw)
      : [];

  const map = new Map();
  items.forEach(item => {
    try {
      const normalized = normalizeReviewItem(item);
      if (normalized) map.set(normalized.questionKey, normalized);
    } catch {}
  });

  return map;
}

function serializeReviewMap(map) {
  return Array.from(map.values())
    .sort((a, b) => {
      const dueDiff = new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
      if (dueDiff) return dueDiff;
      return new Date(b.lastReviewedAt || 0).getTime() - new Date(a.lastReviewedAt || 0).getTime();
    })
    .slice(0, MAX_REVIEW_ITEMS);
}

export function loadReviewSchedule() {
  try {
    return serializeReviewMap(normalizeReviewMap(getJSON(REVIEW_STORAGE_KEY)));
  } catch {
    removeStorageItem(REVIEW_STORAGE_KEY);
    return [];
  }
}

export function loadReviewScheduleMap() {
  try {
    return normalizeReviewMap(getJSON(REVIEW_STORAGE_KEY));
  } catch {
    removeStorageItem(REVIEW_STORAGE_KEY);
    return new Map();
  }
}

function getInitialReviewItem(questionKey, now) {
  return {
    questionKey,
    easeFactor: DEFAULT_EASE,
    intervalDays: 0,
    repetitionCount: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: null,
    correctStreak: 0,
    wrongCount: 0
  };
}

function updateReviewItem(item, isCorrect, now = new Date()) {
  const next = { ...item };
  next.lastReviewedAt = now.toISOString();

  if (isCorrect) {
    next.repetitionCount += 1;
    next.correctStreak += 1;
    next.easeFactor = clamp(next.easeFactor + 0.05, MIN_EASE, MAX_EASE);

    if (next.repetitionCount <= 1) next.intervalDays = 1;
    else if (next.repetitionCount === 2) next.intervalDays = 3;
    else next.intervalDays = Math.max(4, Math.round(Math.max(1, next.intervalDays) * next.easeFactor));

    next.dueAt = addDays(now, next.intervalDays).toISOString();
    return next;
  }

  next.repetitionCount = 0;
  next.correctStreak = 0;
  next.wrongCount += 1;
  next.easeFactor = clamp(next.easeFactor - 0.2, MIN_EASE, MAX_EASE);
  next.intervalDays = 0;
  next.dueAt = addHours(now, WRONG_REVIEW_DELAY_HOURS).toISOString();
  return next;
}

export function saveReviewSchedule(items) {
  const map = normalizeReviewMap(items);
  const serialized = serializeReviewMap(map);
  setJSON(REVIEW_STORAGE_KEY, serialized);
  return serialized;
}

export function updateReviewScheduleFromAttempt({ quiz, answers } = {}) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  if (!questions.length || !Array.isArray(answers)) return loadReviewSchedule();

  const now = new Date();
  const map = loadReviewScheduleMap();

  questions.forEach((question, index) => {
    const userValue = answers[index]?.value ?? null;
    if (userValue === null || (Array.isArray(userValue) && userValue.length === 0)) return;

    const questionKey = createQuestionKey(question, quiz);
    if (!questionKey) return;

    const current = map.get(questionKey) || getInitialReviewItem(questionKey, now);
    map.set(questionKey, updateReviewItem(current, isAnswerCorrect(question, userValue), now));
  });

  const serialized = serializeReviewMap(map);
  setJSON(REVIEW_STORAGE_KEY, serialized);
  return serialized;
}

export function getDueReviewCount() {
  const now = Date.now();
  return loadReviewSchedule().filter(item => new Date(item.dueAt).getTime() <= now).length;
}

export function getDueReviewKeys() {
  const now = Date.now();
  return new Set(
    loadReviewSchedule()
      .filter(item => new Date(item.dueAt).getTime() <= now)
      .map(item => item.questionKey)
  );
}

export function findDueReviewQuestions(allQuizzes = []) {
  const dueKeys = getDueReviewKeys();
  if (!dueKeys.size) return [];

  const seen = new Set();
  const result = [];
  const quizzes = Array.isArray(allQuizzes) ? allQuizzes : [];

  quizzes.forEach(sourceQuiz => {
    const questions = Array.isArray(sourceQuiz?.questions) ? sourceQuiz.questions : [];
    questions.forEach((question, index) => {
      const key = createQuestionKey(question, sourceQuiz);
      if (!key || !dueKeys.has(key) || seen.has(key)) return;

      seen.add(key);
      result.push({ question, sourceQuiz, sourceIndex: index, questionKey: key });
    });
  });

  return result;
}
