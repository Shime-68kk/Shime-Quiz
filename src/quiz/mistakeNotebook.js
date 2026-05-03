import { getJSON, removeStorageItem, setJSON } from '../utils/storage.js';
import { createQuestionKey } from './spacedRepetition.js';
import { isAnswerCorrect, isFillQuestion } from './scoring.js';

export const MISTAKE_NOTEBOOK_STORAGE_KEY = 'quizMistakeNotebookV1';
export const MAX_MISTAKE_NOTEBOOK_ITEMS = 200;
const MAX_TEXT_LENGTH = 1200;
const MAX_CHOICE_LENGTH = 600;
const MAX_CHOICES = 12;
const VALID_STATUSES = new Set(['open', 'reviewed', 'resolved']);

function toSafeString(value, maxLength = MAX_TEXT_LENGTH) {
  const text = String(value ?? '').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
}

function createNotebookId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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

function normalizeCorrectAnswerValue(value, choicesLength = 0, isFill = false) {
  if (isFill) return toSafeString(value, MAX_CHOICE_LENGTH) || null;
  return normalizeAnswerValue(value, choicesLength);
}

function normalizeStatus(status) {
  const normalized = String(status || 'open').trim();
  return VALID_STATUSES.has(normalized) ? normalized : 'open';
}

function normalizeNotebookEntry(entry) {
  if (!entry || typeof entry !== 'object') return null;

  const questionKey = toSafeString(entry.questionKey, 260);
  if (!questionKey) return null;

  const choices = Array.isArray(entry.choices)
    ? entry.choices.slice(0, MAX_CHOICES).map(choice => toSafeString(choice, MAX_CHOICE_LENGTH)).filter(Boolean)
    : [];

  const mistakeCount = Math.max(1, Math.round(Number(entry.mistakeCount) || 1));
  const normalized = {
    id: toSafeString(entry.id, 120) || createNotebookId(),
    questionKey,
    questionText: toSafeString(entry.questionText || entry.text || 'Câu hỏi chưa có nội dung'),
    choices,
    userAnswer: normalizeAnswerValue(entry.userAnswer, choices.length),
    correctAnswer: normalizeCorrectAnswerValue(entry.correctAnswer, choices.length, !choices.length),
    topic: toSafeString(entry.topic || entry.chapter || entry.category || '', 160) || undefined,
    sourceAttemptId: toSafeString(entry.sourceAttemptId, 160) || undefined,
    createdAt: toSafeString(entry.createdAt, 80) || new Date().toISOString(),
    lastUpdatedAt: toSafeString(entry.lastUpdatedAt, 80) || toSafeString(entry.createdAt, 80) || new Date().toISOString(),
    mistakeCount,
    status: normalizeStatus(entry.status),
    note: toSafeString(entry.note, 600) || ''
  };

  return normalized;
}

export function loadMistakeNotebook() {
  try {
    const raw = getJSON(MISTAKE_NOTEBOOK_STORAGE_KEY);
    if (!Array.isArray(raw)) return [];

    const deduped = new Map();
    raw.forEach(item => {
      try {
        const normalized = normalizeNotebookEntry(item);
        if (!normalized) return;
        const existing = deduped.get(normalized.questionKey);
        if (!existing || new Date(normalized.lastUpdatedAt).getTime() >= new Date(existing.lastUpdatedAt).getTime()) {
          deduped.set(normalized.questionKey, normalized);
        }
      } catch {
        // Ignore a single malformed entry.
      }
    });

    return [...deduped.values()]
      .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
      .slice(0, MAX_MISTAKE_NOTEBOOK_ITEMS);
  } catch {
    removeStorageItem(MISTAKE_NOTEBOOK_STORAGE_KEY);
    return [];
  }
}

function saveNotebook(items) {
  const normalized = Array.isArray(items)
    ? items.map(item => normalizeNotebookEntry(item)).filter(Boolean)
    : [];
  setJSON(MISTAKE_NOTEBOOK_STORAGE_KEY, normalized.slice(0, MAX_MISTAKE_NOTEBOOK_ITEMS));
  return normalized;
}

export function clearMistakeNotebook() {
  removeStorageItem(MISTAKE_NOTEBOOK_STORAGE_KEY);
}

export function updateMistakeNotebookEntry(questionKey, updates = {}) {
  const key = toSafeString(questionKey, 260);
  if (!key) return loadMistakeNotebook();

  const now = new Date().toISOString();
  const items = loadMistakeNotebook();
  const next = items.map(item => item.questionKey === key
    ? normalizeNotebookEntry({ ...item, ...updates, questionKey: key, lastUpdatedAt: now })
    : item
  );
  saveNotebook(next);
  return loadMistakeNotebook();
}

export function setMistakeNotebookStatus(questionKey, status) {
  return updateMistakeNotebookEntry(questionKey, { status: normalizeStatus(status) });
}

export function saveMistakeNote(questionKey, note) {
  return updateMistakeNotebookEntry(questionKey, { note: toSafeString(note, 600) });
}

function getAnswerValueFromQuestion(question, answers, index) {
  return answers?.[index]?.value ?? null;
}

function getCorrectAnswerFromQuestion(question) {
  return isFillQuestion(question) ? (question.answerText ?? question.answer ?? '') : question.answer;
}

function getQuestionTopic(question = {}, quiz = {}) {
  return toSafeString(
    question.chapter ||
    question.category ||
    question.topic ||
    question.section ||
    question.group ||
    (Array.isArray(question.tags) ? question.tags[0] : '') ||
    quiz.chapter ||
    quiz.category ||
    quiz.topic ||
    '',
    160
  ) || undefined;
}

export function createMistakeEntriesFromAttempt({ quiz, answers, attemptId = '', includeBlank = true } = {}) {
  const questions = Array.isArray(quiz?.questions) ? quiz.questions : [];
  const now = new Date().toISOString();

  return questions.map((question, index) => {
    const userAnswer = getAnswerValueFromQuestion(question, answers, index);
    const isBlank = userAnswer == null || (Array.isArray(userAnswer) && userAnswer.length === 0);
    if ((!includeBlank && isBlank) || (!isBlank && isAnswerCorrect(question, userAnswer))) return null;

    const isFill = isFillQuestion(question);
    const choices = Array.isArray(question.choices)
      ? question.choices.slice(0, MAX_CHOICES).map(choice => toSafeString(choice, MAX_CHOICE_LENGTH)).filter(Boolean)
      : [];
    const questionKey = createQuestionKey(question, quiz) || toSafeString(question._reviewKey, 260);
    if (!questionKey) return null;

    return normalizeNotebookEntry({
      id: createNotebookId(),
      questionKey,
      questionText: question.text,
      choices,
      userAnswer: normalizeAnswerValue(userAnswer, choices.length),
      correctAnswer: normalizeCorrectAnswerValue(getCorrectAnswerFromQuestion(question), choices.length, isFill),
      topic: getQuestionTopic(question, quiz),
      sourceAttemptId: attemptId,
      createdAt: now,
      lastUpdatedAt: now,
      mistakeCount: 1,
      status: 'open'
    });
  }).filter(Boolean);
}

export function createMistakeEntriesFromHistoryItem(item) {
  const questions = Array.isArray(item?.details?.questions) ? item.details.questions : [];
  const now = new Date().toISOString();

  return questions.map(question => {
    if (!question || question.isCorrect !== false) return null;
    const choices = Array.isArray(question.choices)
      ? question.choices.slice(0, MAX_CHOICES).map(choice => toSafeString(choice, MAX_CHOICE_LENGTH)).filter(Boolean)
      : [];
    const questionKey = toSafeString(question.questionKey || question.questionId || question.questionText, 260);
    if (!questionKey) return null;

    return normalizeNotebookEntry({
      id: createNotebookId(),
      questionKey,
      questionText: question.questionText,
      choices,
      userAnswer: normalizeAnswerValue(question.userAnswer, choices.length),
      correctAnswer: normalizeCorrectAnswerValue(question.correctAnswer, choices.length, !choices.length),
      topic: question.topic,
      sourceAttemptId: item.id,
      createdAt: now,
      lastUpdatedAt: now,
      mistakeCount: 1,
      status: 'open'
    });
  }).filter(Boolean);
}

export function addMistakeNotebookEntries(entries = []) {
  const incoming = Array.isArray(entries)
    ? entries.map(entry => normalizeNotebookEntry(entry)).filter(Boolean)
    : [];
  if (!incoming.length) return { notebook: loadMistakeNotebook(), added: 0, updated: 0 };

  const existing = loadMistakeNotebook();
  const byKey = new Map(existing.map(item => [item.questionKey, item]));
  let added = 0;
  let updated = 0;
  const now = new Date().toISOString();

  incoming.forEach(entry => {
    const current = byKey.get(entry.questionKey);
    if (!current) {
      byKey.set(entry.questionKey, { ...entry, lastUpdatedAt: now });
      added += 1;
      return;
    }

    byKey.set(entry.questionKey, normalizeNotebookEntry({
      ...current,
      ...entry,
      id: current.id,
      createdAt: current.createdAt || entry.createdAt,
      mistakeCount: Math.max(1, Number(current.mistakeCount) || 1) + 1,
      status: current.status === 'resolved' ? 'open' : current.status,
      note: current.note || entry.note || '',
      lastUpdatedAt: now
    }));
    updated += 1;
  });

  const next = [...byKey.values()]
    .sort((a, b) => new Date(b.lastUpdatedAt).getTime() - new Date(a.lastUpdatedAt).getTime())
    .slice(0, MAX_MISTAKE_NOTEBOOK_ITEMS);
  saveNotebook(next);
  return { notebook: next, added, updated };
}

export function getMistakeNotebookStats(items = loadMistakeNotebook()) {
  const notebook = Array.isArray(items) ? items : [];
  return notebook.reduce((stats, item) => {
    stats.total += 1;
    const status = normalizeStatus(item.status);
    stats[status] = (stats[status] || 0) + 1;
    return stats;
  }, { total: 0, open: 0, reviewed: 0, resolved: 0 });
}
