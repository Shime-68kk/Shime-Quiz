import {
  Rating,
  State,
  createEmptyCard,
  fsrs,
  generatorParameters
} from 'ts-fsrs';

export const FSRS_TEST_SCHEDULER_KIND = 'fsrs-v4-test';
export const FSRS_TEST_SCHEDULER_VERSION = 'ts-fsrs-5.3.3-test';

const RATING_NAMES = {
  [Rating.Again]: 'Again',
  [Rating.Hard]: 'Hard',
  [Rating.Good]: 'Good',
  [Rating.Easy]: 'Easy'
};

const RATING_VALUES = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy
};

const STATE_NAMES = {
  [State.New]: 'New',
  [State.Learning]: 'Learning',
  [State.Review]: 'Review',
  [State.Relearning]: 'Relearning'
};

const STATE_VALUES = {
  new: State.New,
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning
};

const scheduler = fsrs(generatorParameters({ enable_fuzz: false }));

function toDate(value, label) {
  const date = value instanceof Date ? new Date(value.getTime()) : new Date(value || '');
  if (Number.isNaN(date.getTime())) {
    throw new TypeError(`${label} must be a valid date.`);
  }
  return date;
}

function toIso(value, label) {
  return toDate(value, label).toISOString();
}

function optionalIso(value, label) {
  if (!value) return null;
  return toIso(value, label);
}

function toFiniteNumber(value, label) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    throw new TypeError(`${label} must be a finite number.`);
  }
  return number;
}

function toNonNegativeInteger(value, label) {
  const number = Math.floor(toFiniteNumber(value, label));
  if (number < 0) {
    throw new TypeError(`${label} must be a non-negative integer.`);
  }
  return number;
}

function normalizeRating(rating) {
  if (RATING_NAMES[rating]) return rating;
  const key = String(rating || '').trim().toLowerCase();
  const normalized = RATING_VALUES[key];
  if (!normalized) {
    throw new TypeError('FSRS test rating must be Again, Hard, Good, or Easy.');
  }
  return normalized;
}

function normalizeState(state) {
  if (STATE_NAMES[state]) return state;
  const key = String(state || '').trim().toLowerCase();
  if (Object.prototype.hasOwnProperty.call(STATE_VALUES, key)) return STATE_VALUES[key];
  throw new TypeError('FSRS test card state must be New, Learning, Review, or Relearning.');
}

function roundNumber(value, digits = 8) {
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  return Number(number.toFixed(digits));
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function extractFsrsPayload(card) {
  if (!card || typeof card !== 'object') {
    throw new TypeError('FSRS test payload must be an object.');
  }
  if (card.schedulerKind !== FSRS_TEST_SCHEDULER_KIND) {
    throw new TypeError(`FSRS test payload must use schedulerKind ${FSRS_TEST_SCHEDULER_KIND}.`);
  }
  if (!card.fsrsPayload || typeof card.fsrsPayload !== 'object') {
    throw new TypeError('FSRS test payload must include fsrsPayload.');
  }
  return clonePlain(card.fsrsPayload);
}

function toRawFsrsCard(card) {
  const payload = extractFsrsPayload(card);
  const rawCard = {
    due: toDate(payload.due, 'fsrsPayload.due'),
    stability: toFiniteNumber(payload.stability, 'fsrsPayload.stability'),
    difficulty: toFiniteNumber(payload.difficulty, 'fsrsPayload.difficulty'),
    elapsed_days: toNonNegativeInteger(payload.elapsedDays, 'fsrsPayload.elapsedDays'),
    scheduled_days: toNonNegativeInteger(payload.scheduledDays, 'fsrsPayload.scheduledDays'),
    reps: toNonNegativeInteger(payload.reps, 'fsrsPayload.reps'),
    lapses: toNonNegativeInteger(payload.lapses, 'fsrsPayload.lapses'),
    learning_steps: toNonNegativeInteger(payload.learningSteps, 'fsrsPayload.learningSteps'),
    state: normalizeState(payload.state)
  };

  if (payload.lastReview) {
    rawCard.last_review = toDate(payload.lastReview, 'fsrsPayload.lastReview');
  }

  return rawCard;
}

function calculateRetrievability(rawCard, now) {
  if (!rawCard || rawCard.state === State.New || !rawCard.last_review || rawCard.stability <= 0) {
    return null;
  }

  const value = scheduler.get_retrievability(rawCard, toDate(now, 'retrievability date'));
  const percentage = Number.parseFloat(String(value).replace('%', ''));
  if (!Number.isFinite(percentage)) return null;
  return roundNumber(percentage / 100, 6);
}

export function serializeFsrsCard(card, now = card?.due) {
  if (!card || typeof card !== 'object') {
    throw new TypeError('FSRS card must be an object.');
  }

  const stateValue = normalizeState(card.state);
  const dueAt = toIso(card.due, 'card.due');
  const lastReviewedAt = optionalIso(card.last_review, 'card.last_review');
  const stability = roundNumber(toFiniteNumber(card.stability, 'card.stability'));
  const difficulty = roundNumber(toFiniteNumber(card.difficulty, 'card.difficulty'));
  const scheduledDays = toNonNegativeInteger(card.scheduled_days, 'card.scheduled_days');
  const elapsedDays = toNonNegativeInteger(card.elapsed_days, 'card.elapsed_days');
  const reps = toNonNegativeInteger(card.reps, 'card.reps');
  const lapses = toNonNegativeInteger(card.lapses, 'card.lapses');
  const learningSteps = toNonNegativeInteger(card.learning_steps, 'card.learning_steps');
  const state = STATE_NAMES[stateValue];
  const retrievability = calculateRetrievability({ ...card, state: stateValue }, now);

  return {
    schedulerKind: FSRS_TEST_SCHEDULER_KIND,
    schedulerVersion: FSRS_TEST_SCHEDULER_VERSION,
    dueAt,
    stability,
    difficulty,
    retrievability,
    scheduledDays,
    elapsedDays,
    reps,
    lapses,
    learningSteps,
    state,
    stateValue,
    lastReviewedAt,
    fsrsPayload: {
      due: dueAt,
      stability,
      difficulty,
      retrievability,
      scheduledDays,
      elapsedDays,
      reps,
      lapses,
      learningSteps,
      state,
      stateValue,
      lastReview: lastReviewedAt
    }
  };
}

export function serializeFsrsReviewLog(log) {
  if (!log || typeof log !== 'object') {
    throw new TypeError('FSRS review log must be an object.');
  }

  const ratingValue = normalizeRating(log.rating);
  const stateValue = normalizeState(log.state);
  const dueAt = toIso(log.due, 'log.due');
  const reviewedAt = toIso(log.review, 'log.review');
  const stability = roundNumber(toFiniteNumber(log.stability, 'log.stability'));
  const difficulty = roundNumber(toFiniteNumber(log.difficulty, 'log.difficulty'));
  const elapsedDays = toNonNegativeInteger(log.elapsed_days, 'log.elapsed_days');
  const lastElapsedDays = toNonNegativeInteger(log.last_elapsed_days, 'log.last_elapsed_days');
  const scheduledDays = toNonNegativeInteger(log.scheduled_days, 'log.scheduled_days');
  const learningSteps = toNonNegativeInteger(log.learning_steps, 'log.learning_steps');

  return {
    schedulerKind: FSRS_TEST_SCHEDULER_KIND,
    schedulerVersion: FSRS_TEST_SCHEDULER_VERSION,
    rating: RATING_NAMES[ratingValue],
    ratingValue,
    state: STATE_NAMES[stateValue],
    stateValue,
    dueAt,
    reviewedAt,
    stability,
    difficulty,
    elapsedDays,
    lastElapsedDays,
    scheduledDays,
    learningSteps,
    fsrsPayload: {
      rating: RATING_NAMES[ratingValue],
      ratingValue,
      state: STATE_NAMES[stateValue],
      stateValue,
      due: dueAt,
      review: reviewedAt,
      stability,
      difficulty,
      elapsedDays,
      lastElapsedDays,
      scheduledDays,
      learningSteps
    }
  };
}

export function validateFsrsPayload(payload) {
  toRawFsrsCard(payload);
  return true;
}

export function createFsrsSeedCardForTest(now = new Date()) {
  return serializeFsrsCard(createEmptyCard(toDate(now, 'seed date')), now);
}

export function scheduleFsrsReviewForTest(card, rating, now = new Date()) {
  const reviewDate = toDate(now, 'review date');
  const rawCard = toRawFsrsCard(card);
  const ratingValue = normalizeRating(rating);
  const result = scheduler.next(rawCard, reviewDate, ratingValue);

  return {
    schedulerKind: FSRS_TEST_SCHEDULER_KIND,
    schedulerVersion: FSRS_TEST_SCHEDULER_VERSION,
    rating: RATING_NAMES[ratingValue],
    previousCard: serializeFsrsCard(rawCard, reviewDate),
    card: serializeFsrsCard(result.card, reviewDate),
    reviewLog: serializeFsrsReviewLog(result.log)
  };
}

export function getFsrsDueStatusForTest(card, now = new Date()) {
  const rawCard = toRawFsrsCard(card);
  const dueAt = toIso(rawCard.due, 'fsrsPayload.due');
  const dueTime = rawCard.due.getTime();
  const nowDate = toDate(now, 'due status date');

  return {
    isDue: dueTime <= nowDate.getTime(),
    isScheduled: true,
    dueAt,
    dueTime,
    schedulerKind: FSRS_TEST_SCHEDULER_KIND,
    schedulerVersion: FSRS_TEST_SCHEDULER_VERSION,
    retrievability: calculateRetrievability(rawCard, nowDate)
  };
}
