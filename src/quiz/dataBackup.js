import { STORAGE_KEY as PROGRESS_STORAGE_KEY } from './progress.js';
import { HISTORY_STORAGE_KEY } from './history.js';
import { REVIEW_STORAGE_KEY } from './spacedRepetition.js';
import { BOOKMARK_STORAGE_KEY } from './bookmarks.js';
import { COLLECTIONS_STORAGE_KEY } from './collections.js';
import { RECOMMENDATION_FEEDBACK_STORAGE_KEY } from './recommendationFeedback.js';
import { STUDY_GOAL_STORAGE_KEY } from './studyGoal.js';
import { STUDY_SESSION_COMPLETION_STORAGE_KEY, STUDY_SESSION_STORAGE_KEY } from './studySession.js';
import { MISTAKE_NOTEBOOK_STORAGE_KEY } from './mistakeNotebook.js';
import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';

export const BACKUP_VERSION = 1;
export const BACKUP_APP = 'shimechamhoc-quiz';

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function cloneJsonSafe(value, fallback) {
  if (value == null) return fallback;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return fallback;
  }
}

function normalizeArray(value) {
  return Array.isArray(value) ? cloneJsonSafe(value, []) : [];
}

function normalizeProgress(value) {
  return isPlainObject(value) ? cloneJsonSafe(value, null) : null;
}

function getBackupDataFromPayload(payload) {
  if (!isPlainObject(payload)) return null;
  if (isPlainObject(payload.data)) return payload.data;
  return payload;
}

function validateArrayField(data, key, label, errors) {
  if (!(key in data) || data[key] == null) return [];
  if (!Array.isArray(data[key])) {
    errors.push(`${label} phải là mảng.`);
    return [];
  }
  return normalizeArray(data[key]);
}

export function createBackupPayload() {
  const history = normalizeArray(getJSON(HISTORY_STORAGE_KEY));
  const reviewSchedule = normalizeArray(getJSON(REVIEW_STORAGE_KEY));
  const progress = normalizeProgress(getJSON(PROGRESS_STORAGE_KEY));
  const bookmarks = normalizeArray(getJSON(BOOKMARK_STORAGE_KEY));
  const collections = normalizeArray(getJSON(COLLECTIONS_STORAGE_KEY));
  const recommendationFeedback = normalizeArray(getJSON(RECOMMENDATION_FEEDBACK_STORAGE_KEY));
  const studyGoal = normalizeProgress(getJSON(STUDY_GOAL_STORAGE_KEY));
  const mistakeNotebook = normalizeArray(getJSON(MISTAKE_NOTEBOOK_STORAGE_KEY));
  const studySession = normalizeProgress(getJSON(STUDY_SESSION_STORAGE_KEY));
  const studySessionCompletions = normalizeArray(getJSON(STUDY_SESSION_COMPLETION_STORAGE_KEY));

  return {
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: {
      history,
      reviewSchedule,
      progress,
      bookmarks,
      collections,
      recommendationFeedback,
      studyGoal,
      mistakeNotebook,
      studySession,
      studySessionCompletions
    }
  };
}

export function getBackupFileName() {
  return `quiz-backup-${getTodayKey()}.json`;
}

export function downloadBackupFile(payload = createBackupPayload()) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = getBackupFileName();
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function parseBackupText(text) {
  try {
    return JSON.parse(String(text || ''));
  } catch {
    throw new Error('File sao lưu không phải JSON hợp lệ.');
  }
}

export function validateBackupPayload(payload) {
  const errors = [];
  const data = getBackupDataFromPayload(payload);

  if (!data) {
    return { ok: false, errors: ['File sao lưu không đúng cấu trúc.'], data: null, summary: null };
  }

  const history = validateArrayField(data, 'history', 'history', errors);
  const reviewSchedule = validateArrayField(data, 'reviewSchedule', 'reviewSchedule', errors);
  const progress = 'progress' in data ? normalizeProgress(data.progress) : null;
  const bookmarks = validateArrayField(data, 'bookmarks', 'bookmarks', errors);
  const collections = validateArrayField(data, 'collections', 'collections', errors);
  const recommendationFeedback = validateArrayField(data, 'recommendationFeedback', 'recommendationFeedback', errors);
  const studyGoal = 'studyGoal' in data ? normalizeProgress(data.studyGoal) : null;
  const mistakeNotebook = validateArrayField(data, 'mistakeNotebook', 'mistakeNotebook', errors);
  const studySession = 'studySession' in data ? normalizeProgress(data.studySession) : null;
  const studySessionCompletions = validateArrayField(data, 'studySessionCompletions', 'studySessionCompletions', errors);

  if ('progress' in data && data.progress != null && !isPlainObject(data.progress)) {
    errors.push('progress phải là object hoặc null.');
  }

  if ('studyGoal' in data && data.studyGoal != null && !isPlainObject(data.studyGoal)) {
    errors.push('studyGoal phải là object hoặc null.');
  }

  if ('studySession' in data && data.studySession != null && !isPlainObject(data.studySession)) {
    errors.push('studySession phải là object hoặc null.');
  }

  if (!('history' in data) && !('reviewSchedule' in data) && !('progress' in data) && !('bookmarks' in data) && !('collections' in data) && !('recommendationFeedback' in data) && !('studyGoal' in data) && !('mistakeNotebook' in data) && !('studySession' in data) && !('studySessionCompletions' in data)) {
    errors.push('File không có dữ liệu history, reviewSchedule, progress, bookmarks, collections, recommendationFeedback, studyGoal, mistakeNotebook, studySession hoặc studySessionCompletions.');
  }

  if (errors.length) {
    return { ok: false, errors, data: null, summary: null };
  }

  return {
    ok: true,
    errors: [],
    data: { history, reviewSchedule, progress, bookmarks, collections, recommendationFeedback, studyGoal, mistakeNotebook, studySession, studySessionCompletions },
    summary: {
      historyCount: history.length,
      reviewCount: reviewSchedule.length,
      bookmarkCount: bookmarks.length,
      collectionCount: collections.length,
      recommendationFeedbackCount: recommendationFeedback.length,
      hasStudyGoal: Boolean(studyGoal),
      hasStudySession: Boolean(studySession),
      studySessionCompletionCount: studySessionCompletions.length,
      mistakeCount: mistakeNotebook.length,
      hasProgress: Boolean(progress)
    }
  };
}

export function restoreBackupData(data) {
  if (!isPlainObject(data)) throw new Error('Dữ liệu khôi phục không hợp lệ.');

  setJSON(HISTORY_STORAGE_KEY, normalizeArray(data.history));
  setJSON(REVIEW_STORAGE_KEY, normalizeArray(data.reviewSchedule));
  setJSON(BOOKMARK_STORAGE_KEY, normalizeArray(data.bookmarks));
  setJSON(COLLECTIONS_STORAGE_KEY, normalizeArray(data.collections));
  setJSON(RECOMMENDATION_FEEDBACK_STORAGE_KEY, normalizeArray(data.recommendationFeedback));
  setJSON(MISTAKE_NOTEBOOK_STORAGE_KEY, normalizeArray(data.mistakeNotebook));

  const progress = normalizeProgress(data.progress);
  if (progress) setJSON(PROGRESS_STORAGE_KEY, progress);
  else removeStorageItem(PROGRESS_STORAGE_KEY);

  const studyGoal = normalizeProgress(data.studyGoal);
  if (studyGoal) setJSON(STUDY_GOAL_STORAGE_KEY, studyGoal);
  else removeStorageItem(STUDY_GOAL_STORAGE_KEY);

  const studySession = normalizeProgress(data.studySession);
  if (studySession) setJSON(STUDY_SESSION_STORAGE_KEY, studySession);
  else removeStorageItem(STUDY_SESSION_STORAGE_KEY);

  setJSON(STUDY_SESSION_COMPLETION_STORAGE_KEY, normalizeArray(data.studySessionCompletions));

  return true;
}
