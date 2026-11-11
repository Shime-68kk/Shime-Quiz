// Ôn cấp tốc với FSRS (ts-fsrs, FSRS-6).
//
// Every answer is a real FSRS review: wrong → Again, right → Good. FSRS's
// short-term learning steps handle "today" (1 min → 10 min → graduate), and its
// long-term model handles the following days/weeks, so the same deck keeps
// working after the exam.
//
// "Học liên tục" never runs dry: due cards first, then new cards (a few at a
// time), and when nothing is due it keeps going with the cards FSRS predicts
// are weakest (lowest retrievability) — early reviews that FSRS accounts for.
// Pure functions only: callers own persistence and time.

import { State } from 'ts-fsrs';
import { createFsrsSeedPayload, getFsrsRetrievability, scheduleFsrsReview } from '../quiz/fsrsWrapper.js';

// All ts-fsrs calls go through the project's approved wrapper (src/quiz/fsrsWrapper.js).
export const CRAM_FSRS_OPTIONS = Object.freeze({
  requestRetention: 0.95, // exam mode: aim to remember 95%
  maximumInterval: 365,
  enableFuzz: false,
  enableShortTerm: true,
  learningSteps: ['1m', '10m'],
  relearningSteps: ['5m']
});

export const MAX_ACTIVE_LEARNING = 6;
export const RECENT_WINDOW = 2;
export const KNOWN_RETRIEVABILITY = 0.9;
export const MOCK_TEST_SIZE = 25;

export const LEVELS = Object.freeze([
  { id: 1, min: 0, title: 'Mới bắt đầu' },
  { id: 2, min: 0.15, title: 'Đang làm quen' },
  { id: 3, min: 0.4, title: 'Đang tiến bộ' },
  { id: 4, min: 0.7, title: 'Khá vững' },
  { id: 5, min: 0.9, title: 'Sẵn sàng đi thi' }
]);

function toDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getRecord(states, itemId) {
  const record = states?.[itemId];
  return record && typeof record === 'object' && record.fsrs && typeof record.fsrs.stateValue === 'number' ? record : null;
}

export function getRetrievability(record, now) {
  if (!record) return 0;
  try {
    if (record.fsrs.stateValue === State.New) return 0;
    const value = Number(getFsrsRetrievability(record.fsrs, new Date(now), CRAM_FSRS_OPTIONS));
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0;
  } catch {
    return 0;
  }
}

function dueTime(record) {
  return toDate(record?.fsrs?.due)?.getTime() ?? Number.POSITIVE_INFINITY;
}

function isLearning(record) {
  const state = record?.fsrs?.stateValue;
  return state === State.Learning || state === State.Relearning;
}

export function isKnown(record, now) {
  return Boolean(record && record.fsrs.stateValue === State.Review && getRetrievability(record, now) >= KNOWN_RETRIEVABILITY);
}

export function isDue(record, now) {
  return Boolean(record && dueTime(record) <= now);
}

export function getLevel(knownRatio) {
  let level = LEVELS[0];
  for (const candidate of LEVELS) if (knownRatio >= candidate.min) level = candidate;
  return level;
}

/** Only what a learner cares about: how far through, and what % is memorised. */
export function summarize(items, states, now) {
  let seen = 0;
  let known = 0;
  let due = 0;
  let mistakes = 0;
  for (const item of items) {
    const record = getRecord(states, item.id);
    if (!record) continue;
    seen += 1;
    if (isKnown(record, now)) known += 1;
    if (record.fsrs.stateValue === State.Review && isDue(record, now)) due += 1;
    if (record.wrong > 0) mistakes += 1;
  }
  const total = items.length;
  const knownRatio = total ? known / total : 0;
  return {
    total,
    seen,
    known,
    due,
    mistakes,
    knownPercent: Math.round(knownRatio * 100),
    seenPercent: total ? Math.round((seen / total) * 100) : 0,
    level: getLevel(knownRatio)
  };
}

/**
 * Choose the next card. Order:
 *  1. learning/relearning steps that are due now (short-term memory);
 *  2. review cards that are due, weakest first;
 *  3. a new card, while fewer than MAX_ACTIVE_LEARNING cards are in learning;
 *  4. the learning card due soonest;
 *  5. "ôn trước hạn": the weakest card overall (continuous mode never ends).
 * Cards shown in the last RECENT_WINDOW turns are skipped when possible.
 */
export function pickNextCard(items, states, now, { recent = [], allowAhead = true } = {}) {
  const recentSet = new Set(recent.slice(-RECENT_WINDOW));
  const pool = items.filter(item => !recentSet.has(item.id));
  const candidates = pool.length ? pool : items;

  const learningDue = [];
  const reviewDue = [];
  const learning = [];
  const fresh = [];
  const ahead = [];
  let activeLearning = 0;

  for (const item of items) {
    if (isLearning(getRecord(states, item.id))) activeLearning += 1;
  }

  for (const item of candidates) {
    const record = getRecord(states, item.id);
    if (!record) {
      fresh.push(item.id);
      continue;
    }
    const due = dueTime(record);
    if (isLearning(record)) {
      if (due <= now) learningDue.push({ id: item.id, key: due });
      else learning.push({ id: item.id, key: due });
    } else if (due <= now) {
      reviewDue.push({ id: item.id, key: getRetrievability(record, now) });
    } else {
      ahead.push({ id: item.id, key: getRetrievability(record, now) });
    }
  }

  const byKey = (a, b) => a.key - b.key;
  if (learningDue.length) return learningDue.sort(byKey)[0].id;
  if (reviewDue.length) return reviewDue.sort(byKey)[0].id;
  if (fresh.length && activeLearning < MAX_ACTIVE_LEARNING) return fresh[0];
  if (learning.length) return learning.sort(byKey)[0].id;
  if (fresh.length) return fresh[0];
  if (allowAhead && ahead.length) return ahead.sort(byKey)[0].id;
  return null;
}

/** Scope is finished when every card has been learned and nothing is due. */
export function isScopeComplete(items, states, now) {
  return items.every(item => {
    const record = getRecord(states, item.id);
    return record && record.fsrs.stateValue === State.Review && !isDue(record, now);
  });
}

function minutesUntil(date, now) {
  return Math.max(1, Math.round((date.getTime() - now) / 60000));
}

export function formatWait(minutes) {
  if (minutes < 60) return `${minutes} phút`;
  if (minutes < 60 * 24) return `${Math.round(minutes / 60)} giờ`;
  return `${Math.round(minutes / 1440)} ngày`;
}

/** Apply one answer as an FSRS review. */
export function answerCard(states, itemId, isCorrect, now) {
  const prev = getRecord(states, itemId);
  const nowDate = new Date(now);
  const payload = prev ? prev.fsrs : createFsrsSeedPayload(nowDate, CRAM_FSRS_OPTIONS);
  const wasReview = payload.stateValue === State.Review;
  const next = scheduleFsrsReview(payload, isCorrect ? 'good' : 'again', nowDate, CRAM_FSRS_OPTIONS).card.fsrsPayload;
  const record = {
    fsrs: next,
    seen: (prev?.seen || 0) + 1,
    right: (prev?.right || 0) + (isCorrect ? 1 : 0),
    wrong: (prev?.wrong || 0) + (isCorrect ? 0 : 1),
    lastAt: now
  };
  const wait = minutesUntil(new Date(next.due), now);
  let kind;
  if (!isCorrect) kind = 'again';
  else if (next.stateValue !== State.Review) kind = 'stepUp';
  else if (!wasReview) kind = 'learned';
  else kind = 'reviewPassed';
  return { states: { ...states, [itemId]: record }, outcome: { kind, waitMinutes: wait } };
}

/** Mock test: pick questions proportionally from every chapter, shuffled. */
export function buildMockTest(chapters, size = MOCK_TEST_SIZE, random = Math.random) {
  const total = chapters.reduce((sum, chapter) => sum + chapter.items.length, 0);
  const picked = [];
  for (const chapter of chapters) {
    const quota = Math.max(1, Math.round((chapter.items.length / total) * size));
    const ids = chapter.items.map(item => item.id);
    shuffleInPlace(ids, random);
    picked.push(...ids.slice(0, quota));
  }
  shuffleInPlace(picked, random);
  return picked.slice(0, size);
}

function shuffleInPlace(list, random) {
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

const KEEP_ORDER = /(trên|cả hai|cả ba|cả 2|cả 3|tất cả|a và b|a, b)/iu;

/** Shuffle choices unless an option refers to other options ("Cả 3 phương án trên"). */
export function orderChoices(choices, random = Math.random) {
  const list = Array.isArray(choices) ? choices.slice() : [];
  if (list.some(choice => KEEP_ORDER.test(choice?.text || ''))) return list;
  return shuffleInPlace(list, random);
}
