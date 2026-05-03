import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';
import { createQuestionKey } from './spacedRepetition.js';

export const BOOKMARK_STORAGE_KEY = 'quizBookmarksV1';
export const MAX_BOOKMARK_ITEMS = 2000;

function safeIsoDate(value, fallback = new Date().toISOString()) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date.toISOString();
}

function normalizeBookmarkItem(item) {
  if (!item || typeof item !== 'object') return null;

  const questionKey = String(item.questionKey || '').trim();
  if (!questionKey) return null;

  return {
    questionKey,
    createdAt: safeIsoDate(item.createdAt)
  };
}

function normalizeBookmarkList(raw) {
  const items = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object'
      ? Object.entries(raw).map(([questionKey, value]) => ({
          questionKey,
          createdAt: value?.createdAt || value || undefined
        }))
      : [];

  const map = new Map();
  items.forEach(item => {
    try {
      const normalized = normalizeBookmarkItem(item);
      if (normalized) map.set(normalized.questionKey, normalized);
    } catch {}
  });

  return Array.from(map.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, MAX_BOOKMARK_ITEMS);
}

function saveBookmarkList(items) {
  const normalized = normalizeBookmarkList(items);
  setJSON(BOOKMARK_STORAGE_KEY, normalized);
  return normalized;
}

export function loadBookmarks() {
  try {
    return normalizeBookmarkList(getJSON(BOOKMARK_STORAGE_KEY));
  } catch {
    removeStorageItem(BOOKMARK_STORAGE_KEY);
    return [];
  }
}

export function loadBookmarkSet() {
  return new Set(loadBookmarks().map(item => item.questionKey));
}

export function getBookmarkCount() {
  return loadBookmarks().length;
}

export function getBookmarkQuestionKey(question, quiz) {
  return createQuestionKey(question, quiz);
}

export function isQuestionBookmarked(question, quiz, bookmarkSet = null) {
  const key = getBookmarkQuestionKey(question, quiz);
  if (!key) return false;
  return bookmarkSet ? bookmarkSet.has(key) : loadBookmarkSet().has(key);
}

export function setQuestionBookmark(question, quiz, bookmarked) {
  const questionKey = getBookmarkQuestionKey(question, quiz);
  if (!questionKey) return loadBookmarks();

  const current = loadBookmarks().filter(item => item.questionKey !== questionKey);
  if (bookmarked) {
    current.unshift({ questionKey, createdAt: new Date().toISOString() });
  }

  return saveBookmarkList(current);
}

export function applyBookmarksToQuiz(quiz, bookmarkSet = loadBookmarkSet()) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  questions.forEach(question => {
    question.bookmarked = isQuestionBookmarked(question, quiz, bookmarkSet);
  });
  return quiz;
}

export function persistLegacyBookmarksFromQuiz(quiz) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  if (!questions.length) return loadBookmarks();

  const current = loadBookmarks();
  const seen = new Set(current.map(item => item.questionKey));
  const additions = [];

  questions.forEach(question => {
    if (!question?.bookmarked) return;
    const questionKey = getBookmarkQuestionKey(question, quiz);
    if (!questionKey || seen.has(questionKey)) return;
    seen.add(questionKey);
    additions.push({ questionKey, createdAt: new Date().toISOString() });
  });

  if (!additions.length) return current;
  return saveBookmarkList([...additions, ...current]);
}

export function restoreBookmarks(items) {
  return saveBookmarkList(Array.isArray(items) ? items : []);
}

export function clearBookmarks() {
  removeStorageItem(BOOKMARK_STORAGE_KEY);
}
