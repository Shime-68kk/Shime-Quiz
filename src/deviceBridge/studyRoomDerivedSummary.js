import { createSafeLearningCapsule } from './safeLearningCapsule.js';

export const STUDYROOM_DERIVED_SUMMARY_ALLOWED_FIELDS = Object.freeze([
  'correctCount',
  'incorrectCount',
  'skippedCount',
  'totalCount',
  'sessionDurationBucket',
  'recentAccuracyBucket',
  'dueReviewCountBucket',
  'consecutiveErrorsBucket',
  'hesitationBucket',
  'focusNeedSignalBucket',
  'userEnergySelfReportBucket',
  'monotonicImportId'
]);

export const STUDYROOM_DERIVED_SUMMARY_FORBIDDEN_FIELDS = Object.freeze([
  'prompt',
  'question',
  'answer',
  'correctAnswer',
  'explanation',
  'userAnswer',
  'sourceMetadata',
  'settings',
  'studyHistory',
  'rawQuizPayload',
  'importedDocumentText',
  'documentText',
  'textContent',
  'rawFsrsLogs',
  'cardId',
  'cardIds',
  'deckId',
  'deckIds',
  'fileName',
  'filePath',
  'email',
  'username',
  'ssid',
  'bssid',
  'mac',
  'apList',
  'token',
  'secret',
  'password',
  'credential'
]);

const ALLOWED_FIELD_SET = new Set(STUDYROOM_DERIVED_SUMMARY_ALLOWED_FIELDS);
const FORBIDDEN_FIELD_SET = new Set(STUDYROOM_DERIVED_SUMMARY_FORBIDDEN_FIELDS);
const PRESSURE_BUCKETS = new Set(['none', 'low', 'medium', 'high']);
const ACCURACY_BUCKETS = new Set(['unknown', 'low', 'medium', 'high']);
const DURATION_BUCKETS = new Set(['short', 'medium', 'long']);
const ENERGY_BUCKETS = new Set(['unknown', 'low', 'medium', 'high']);
const FOCUS_BUCKETS = new Set(['none', 'low', 'medium', 'high', 'rest_or_light_review']);
const MAC_LIKE_PATTERN = /\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b/i;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, category, path = '$') {
  return {
    code,
    category,
    path,
    message: `StudyRoom derived summary rejected ${category}.`
  };
}

function childPath(path, key) {
  return path === '$' ? `$.${key}` : `${path}.${key}`;
}

function collectUnsafeIssues(value, path = '$', issues = []) {
  if (Array.isArray(value)) {
    issues.push(makeIssue('unsafe_derived_summary_input', 'array_payload', path));
    value.forEach((entry, index) => collectUnsafeIssues(entry, `${path}[${index}]`, issues));
    return issues;
  }

  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && MAC_LIKE_PATTERN.test(value)) {
      issues.push(makeIssue('unsafe_derived_summary_input', 'raw_rf_identifier', path));
    }
    return issues;
  }

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = childPath(path, key);
    const normalizedKey = key.toLowerCase();
    if (FORBIDDEN_FIELD_SET.has(key) || FORBIDDEN_FIELD_SET.has(normalizedKey)) {
      issues.push(makeIssue('unsafe_derived_summary_input', 'forbidden_raw_field', nextPath));
    }
    if (path === '$' && !ALLOWED_FIELD_SET.has(key)) {
      issues.push(makeIssue('unsafe_derived_summary_input', 'unknown_field', nextPath));
    }
    if (/ssid|bssid|mac|aplist/i.test(key)) {
      issues.push(makeIssue('unsafe_derived_summary_input', 'raw_rf_identifier', nextPath));
    }
    collectUnsafeIssues(entry, nextPath, issues);
  });

  return issues;
}

function validCount(value) {
  return Number.isInteger(value) && value >= 0;
}

function pressure(value, fallback = 'none') {
  return PRESSURE_BUCKETS.has(value) ? value : fallback;
}

function accuracy(input) {
  if (ACCURACY_BUCKETS.has(input.recentAccuracyBucket)) return input.recentAccuracyBucket;
  if (!validCount(input.correctCount) || !validCount(input.totalCount) || input.totalCount <= 0) return 'unknown';
  const ratio = input.correctCount / input.totalCount;
  if (ratio < 0.5) return 'low';
  if (ratio < 0.75) return 'medium';
  return 'high';
}

function highestPressure(...values) {
  if (values.includes('high')) return 'high';
  if (values.includes('medium')) return 'medium';
  if (values.includes('low')) return 'low';
  return 'none';
}

function studyLoad(input) {
  const duration = DURATION_BUCKETS.has(input.sessionDurationBucket) ? input.sessionDurationBucket : 'short';
  const review = pressure(input.dueReviewCountBucket);
  if (duration === 'long' || review === 'high') return 'heavy';
  if (duration === 'medium' || review === 'medium') return 'moderate';
  return 'light';
}

function reviewUrgency(input) {
  return pressure(input.dueReviewCountBucket);
}

function energy(input) {
  return ENERGY_BUCKETS.has(input.userEnergySelfReportBucket) ? input.userEnergySelfReportBucket : 'unknown';
}

function focus(input) {
  if (FOCUS_BUCKETS.has(input.focusNeedSignalBucket)) return input.focusNeedSignalBucket;
  if (studyLoad(input) === 'heavy' && energy(input) === 'low') return 'rest_or_light_review';
  if (pressure(input.consecutiveErrorsBucket) === 'high') return 'high';
  if (pressure(input.hesitationBucket) === 'high') return 'medium';
  return 'low';
}

function learningState(input) {
  const accuracyBucket = accuracy(input);
  const errorPressure = pressure(input.consecutiveErrorsBucket);
  if (accuracyBucket === 'low' && errorPressure === 'high') return 'struggling';
  if (accuracyBucket === 'high' && reviewUrgency(input) !== 'high') return 'steady';
  if (accuracyBucket === 'medium') return 'building';
  if (accuracyBucket === 'low') return 'needs_review';
  return 'unknown';
}

function safeSummaryCode(input) {
  if (focus(input) === 'rest_or_light_review') return 'HIGH_LOAD_BREAK_SUGGESTED';
  if (reviewUrgency(input) === 'high') return 'REVIEW_SOON';
  if (learningState(input) === 'struggling') return 'NEEDS_GENTLE_SUPPORT';
  if (learningState(input) === 'unknown') return 'NO_SIGNAL';
  return 'STEADY_PROGRESS';
}

function recommendation(input) {
  const focusBucket = focus(input);
  const state = learningState(input);
  if (focusBucket === 'rest_or_light_review') return 'encourage_break_or_review';
  if (reviewUrgency(input) === 'high') return 'suggest_review_focus';
  if (state === 'struggling') return 'encourage_break_or_review';
  if (state === 'steady') return 'quiet_presence';
  return 'encourage';
}

function tone(input) {
  const action = recommendation(input);
  if (action === 'quiet_presence') return 'calm';
  if (action === 'encourage_break_or_review') return 'gentle';
  if (action === 'suggest_review_focus') return 'focused';
  return 'warm';
}

function bucketDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function validateStudyRoomDerivedSummaryInput(input) {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      error: 'invalid_studyroom_derived_summary',
      issues: [makeIssue('derived_summary_not_object', 'malformed_input')]
    };
  }

  const issues = collectUnsafeIssues(input);
  ['correctCount', 'incorrectCount', 'skippedCount', 'totalCount', 'monotonicImportId'].forEach(field => {
    if (!validCount(input[field])) {
      issues.push(makeIssue('invalid_derived_summary_count', 'invalid_count', `$.${field}`));
    }
  });
  if (validCount(input.totalCount)) {
    const answered = (input.correctCount || 0) + (input.incorrectCount || 0) + (input.skippedCount || 0);
    if (answered > input.totalCount) {
      issues.push(makeIssue('invalid_derived_summary_total', 'invalid_total', '$.totalCount'));
    }
  }

  return {
    ok: issues.length === 0,
    error: issues.length ? 'invalid_studyroom_derived_summary' : null,
    issues
  };
}

export function createStudyRoomDerivedSafeCapsule(input = {}, options = {}) {
  const validation = validateStudyRoomDerivedSummaryInput(input);
  if (!validation.ok) {
    return { ok: false, capsule: null, error: validation.error, issues: validation.issues };
  }

  const createdAtBucket = typeof options.createdAtBucket === 'string' ? options.createdAtBucket : bucketDate(options.now);
  const capsuleInput = {
    capsuleId: `studyroom_derived_${String(input.monotonicImportId).padStart(6, '0')}`,
    sourceType: 'shime_quiz_studyroom',
    createdAtBucket,
    monotonicImportId: input.monotonicImportId,
    learningStateBucket: learningState(input),
    studyLoadBucket: studyLoad(input),
    reviewUrgencyBucket: reviewUrgency(input),
    sessionMoodBucket: energy(input) === 'low' ? 'tired' : accuracy(input) === 'low' ? 'strained' : 'calm',
    sessionEnergyBucket: energy(input),
    focusNeedBucket: focus(input),
    recommendedCompanionAction: recommendation(input),
    companionTone: tone(input),
    safeSummaryCode: safeSummaryCode(input),
    expirationBucket: 'same_session',
    privacyClass: 'redacted_coarse_only'
  };

  return createSafeLearningCapsule(capsuleInput);
}

export function createStudyRoomDerivedSummaryDiagnostics(result) {
  if (result?.ok) {
    return {
      ok: true,
      rejectedIssueCount: 0,
      categories: []
    };
  }

  const categories = Array.from(new Set((result?.issues || []).map(issue => issue.category || issue.code))).sort();
  return {
    ok: false,
    rejectedIssueCount: result?.issues?.length || 0,
    categories
  };
}
