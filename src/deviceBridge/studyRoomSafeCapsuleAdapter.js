import {
  createSafeLearningCapsule,
  formatChecksum32,
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  SAFE_LEARNING_CAPSULE_FORBIDDEN_FIELDS,
  validateSafeLearningCapsule
} from './safeLearningCapsule.js';

export const STUDYROOM_SAFE_SUMMARY_ALLOWED_FIELDS = Object.freeze([
  'sessionIdBucket',
  'correctCount',
  'incorrectCount',
  'skippedCount',
  'totalCount',
  'recentAccuracyBucket',
  'sessionDurationBucket',
  'dueReviewCountBucket',
  'overdueReviewPressureBucket',
  'consecutiveErrorsBucket',
  'hesitationBucket',
  'focusNeedSignalBucket',
  'userEnergySelfReportBucket',
  'monotonicImportId',
  'nowBucket'
]);

const ALLOWED_INPUT_FIELD_SET = new Set(STUDYROOM_SAFE_SUMMARY_ALLOWED_FIELDS);

const FORBIDDEN_INPUT_CATEGORIES = Object.freeze({
  app_quiz_field: Object.freeze(['prompt', 'question', 'answer', 'correctAnswer', 'explanation', 'userAnswer', 'rawQuizPayload']),
  app_history_field: Object.freeze(['settings', 'studyHistory', 'rawFsrsLogs', 'rawFsrsReviewLogs']),
  document_text_field: Object.freeze(['importedDocumentText', 'documentText', 'textContent']),
  raw_identifier: Object.freeze(['sourceMetadata', 'cardId', 'cardIds', 'deckId', 'deckIds', 'fileName', 'filePath', 'email', 'username']),
  rf_identifier: Object.freeze(['ssid', 'SSID', 'bssid', 'BSSID', 'mac', 'MAC', 'apList', 'rawApLists', 'rawAPLists']),
  credential_or_secret: Object.freeze(['token', 'tokens', 'secret', 'secrets', 'password', 'passwords', 'credential', 'credentials'])
});

const FORBIDDEN_CATEGORY_BY_KEY = new Map([
  ...SAFE_LEARNING_CAPSULE_FORBIDDEN_FIELDS.map(key => [key, 'app_quiz_field']),
  ...Object.entries(FORBIDDEN_INPUT_CATEGORIES).flatMap(([category, keys]) => keys.map(key => [key, category]))
]);

const PRESSURE_BUCKETS = new Set(['none', 'low', 'medium', 'high']);
const ACCURACY_BUCKETS = new Set(['unknown', 'low', 'medium', 'high']);
const DURATION_BUCKETS = new Set(['short', 'medium', 'long']);
const ENERGY_BUCKETS = new Set(['unknown', 'low', 'medium', 'high']);
const FOCUS_BUCKETS = new Set(['none', 'low', 'medium', 'high', 'rest_or_light_review']);
const SESSION_ID_BUCKET_PATTERN = /^session_bucket_[a-z0-9_-]{4,48}$/;
const DAY_BUCKET_PATTERN = /^day_bucket_\d{4}_\d{2}_\d{2}$/;
const MAC_LIKE_PATTERN = /\b[0-9a-f]{2}(?::[0-9a-f]{2}){5}\b/i;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(category, path = '$') {
  return {
    code: 'unsafe_studyroom_summary_input',
    category,
    message: `StudyRoom safe summary rejected category: ${category}`,
    path
  };
}

function makeValidationIssue(code, message, path = '$') {
  return { code, category: 'unknown_unsafe_field', message, path };
}

function pathFor(path, key) {
  return path === '$' ? `$.${key}` : `${path}.${key}`;
}

function isMacLike(value) {
  return typeof value === 'string' && MAC_LIKE_PATTERN.test(value);
}

function collectUnsafeInputIssues(value, path = '$', issues = []) {
  if (Array.isArray(value)) {
    issues.push(makeIssue('unknown_unsafe_field', path));
    value.forEach((entry, index) => collectUnsafeInputIssues(entry, `${path}[${index}]`, issues));
    return issues;
  }

  if (!value || typeof value !== 'object') {
    if (isMacLike(value)) issues.push(makeIssue('rf_identifier', path));
    return issues;
  }

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = pathFor(path, key);
    const forbiddenCategory = FORBIDDEN_CATEGORY_BY_KEY.get(key);
    if (forbiddenCategory) {
      issues.push(makeIssue(forbiddenCategory, nextPath));
    }
    if (path === '$' && !ALLOWED_INPUT_FIELD_SET.has(key)) {
      issues.push(makeIssue('unknown_unsafe_field', nextPath));
    }
    if (isMacLike(entry)) {
      issues.push(makeIssue('rf_identifier', nextPath));
    }
    if (Array.isArray(entry) && /ap|ssid|bssid|mac/i.test(key)) {
      issues.push(makeIssue('rf_identifier', nextPath));
    }
    collectUnsafeInputIssues(entry, nextPath, issues);
  });

  return issues;
}

function asCount(value) {
  return Number.isInteger(value) && value >= 0 ? value : null;
}

function getAccuracyBucket(summary) {
  if (ACCURACY_BUCKETS.has(summary.recentAccuracyBucket)) return summary.recentAccuracyBucket;
  const correct = asCount(summary.correctCount);
  const total = asCount(summary.totalCount);
  if (correct === null || total === null || total <= 0) return 'unknown';
  const ratio = correct / total;
  if (ratio < 0.5) return 'low';
  if (ratio < 0.75) return 'medium';
  return 'high';
}

function getPressureBucket(...values) {
  if (values.includes('high')) return 'high';
  if (values.includes('medium')) return 'medium';
  if (values.includes('low')) return 'low';
  return 'none';
}

function getConsecutiveErrorsBucket(summary) {
  return PRESSURE_BUCKETS.has(summary.consecutiveErrorsBucket) ? summary.consecutiveErrorsBucket : 'none';
}

function getReviewUrgencyBucket(summary) {
  return getPressureBucket(
    PRESSURE_BUCKETS.has(summary.dueReviewCountBucket) ? summary.dueReviewCountBucket : 'none',
    PRESSURE_BUCKETS.has(summary.overdueReviewPressureBucket) ? summary.overdueReviewPressureBucket : 'none'
  );
}

function getStudyLoadBucket(summary) {
  const duration = DURATION_BUCKETS.has(summary.sessionDurationBucket) ? summary.sessionDurationBucket : 'short';
  const pressure = getReviewUrgencyBucket(summary);
  if (duration === 'long' || pressure === 'high') return 'heavy';
  if (duration === 'medium' || pressure === 'medium') return 'moderate';
  return 'light';
}

function getSessionEnergyBucket(summary) {
  return ENERGY_BUCKETS.has(summary.userEnergySelfReportBucket) ? summary.userEnergySelfReportBucket : 'unknown';
}

function getFocusNeedBucket(summary) {
  if (FOCUS_BUCKETS.has(summary.focusNeedSignalBucket)) return summary.focusNeedSignalBucket;
  if (getStudyLoadBucket(summary) === 'heavy' && getSessionEnergyBucket(summary) === 'low') return 'rest_or_light_review';
  if (getConsecutiveErrorsBucket(summary) === 'high') return 'high';
  if (getAccuracyBucket(summary) === 'low') return 'medium';
  return 'low';
}

function getLearningStateBucket(summary) {
  const accuracy = getAccuracyBucket(summary);
  const errors = getConsecutiveErrorsBucket(summary);
  const pressure = getReviewUrgencyBucket(summary);
  if (accuracy === 'low' && errors === 'high') return 'struggling';
  if (accuracy === 'high' && pressure !== 'high') return 'steady';
  if (accuracy === 'medium') return 'building';
  if (accuracy === 'low') return 'needs_review';
  return 'unknown';
}

function getSessionMoodBucket(summary) {
  const accuracy = getAccuracyBucket(summary);
  const energy = getSessionEnergyBucket(summary);
  if (energy === 'low') return 'tired';
  if (accuracy === 'high') return 'calm';
  if (accuracy === 'low') return 'strained';
  return 'calm';
}

function getRecommendedCompanionAction(summary) {
  const pressure = getReviewUrgencyBucket(summary);
  const learningState = getLearningStateBucket(summary);
  const focusNeed = getFocusNeedBucket(summary);
  if (focusNeed === 'rest_or_light_review') return 'encourage_break_or_review';
  if (pressure === 'high') return 'suggest_review_focus';
  if (learningState === 'struggling') return 'encourage_break_or_review';
  if (learningState === 'steady') return 'quiet_presence';
  return 'encourage';
}

function getCompanionTone(summary) {
  const action = getRecommendedCompanionAction(summary);
  if (action === 'quiet_presence') return 'calm';
  if (action === 'encourage_break_or_review') return 'gentle';
  if (action === 'suggest_review_focus') return 'focused';
  return 'warm';
}

function getSafeSummaryCode(summary) {
  const focusNeed = getFocusNeedBucket(summary);
  const pressure = getReviewUrgencyBucket(summary);
  const learningState = getLearningStateBucket(summary);
  if (focusNeed === 'rest_or_light_review') return 'HIGH_LOAD_BREAK_SUGGESTED';
  if (pressure === 'high') return 'REVIEW_SOON';
  if (learningState === 'struggling') return 'NEEDS_GENTLE_SUPPORT';
  if (learningState === 'unknown') return 'NO_SIGNAL';
  return 'STEADY_PROGRESS';
}

function makeCapsuleId(summary) {
  const base = `${summary.sessionIdBucket}|${summary.monotonicImportId}|${summary.nowBucket}`;
  return `studyroom_capsule_${formatChecksum32(base)}`;
}

function normalizeSummary(summary) {
  return {
    capsuleId: makeCapsuleId(summary),
    sourceType: 'shime_quiz_studyroom',
    createdAtBucket: summary.nowBucket.replace(/^day_bucket_(\d{4})_(\d{2})_(\d{2})$/, '$1-$2-$3'),
    monotonicImportId: summary.monotonicImportId,
    learningStateBucket: getLearningStateBucket(summary),
    studyLoadBucket: getStudyLoadBucket(summary),
    reviewUrgencyBucket: getReviewUrgencyBucket(summary),
    sessionMoodBucket: getSessionMoodBucket(summary),
    sessionEnergyBucket: getSessionEnergyBucket(summary),
    focusNeedBucket: getFocusNeedBucket(summary),
    recommendedCompanionAction: getRecommendedCompanionAction(summary),
    companionTone: getCompanionTone(summary),
    safeSummaryCode: getSafeSummaryCode(summary),
    expirationBucket: 'same_session',
    privacyClass: 'redacted_coarse_only'
  };
}

export function validateStudyRoomSafeSummaryInput(summary) {
  if (!isPlainObject(summary)) {
    return {
      ok: false,
      error: 'invalid_studyroom_safe_summary',
      issues: [makeValidationIssue('summary_not_object', 'StudyRoom safe summary must be a plain object.')]
    };
  }

  const issues = collectUnsafeInputIssues(summary);

  if (typeof summary.sessionIdBucket !== 'string' || !SESSION_ID_BUCKET_PATTERN.test(summary.sessionIdBucket)) {
    issues.push(makeValidationIssue('invalid_session_id_bucket', 'sessionIdBucket must be a safe non-reversible bucket.', '$.sessionIdBucket'));
  }
  if (!Number.isInteger(summary.monotonicImportId) || summary.monotonicImportId < 0) {
    issues.push(makeValidationIssue('invalid_monotonic_import_id', 'monotonicImportId must be a non-negative integer.', '$.monotonicImportId'));
  }
  if (typeof summary.nowBucket !== 'string' || !DAY_BUCKET_PATTERN.test(summary.nowBucket)) {
    issues.push(makeValidationIssue('invalid_now_bucket', 'nowBucket must be a day bucket.', '$.nowBucket'));
  }
  ['correctCount', 'incorrectCount', 'skippedCount', 'totalCount'].forEach(field => {
    if (!Number.isInteger(summary[field]) || summary[field] < 0) {
      issues.push(makeValidationIssue('invalid_count', `${field} must be a non-negative integer.`, `$.${field}`));
    }
  });
  if (Number.isInteger(summary.totalCount)) {
    const answered = (summary.correctCount || 0) + (summary.incorrectCount || 0) + (summary.skippedCount || 0);
    if (answered > summary.totalCount) {
      issues.push(makeValidationIssue('invalid_count_total', 'Derived counts must not exceed totalCount.', '$.totalCount'));
    }
  }

  return {
    ok: issues.length === 0,
    error: issues.length ? 'invalid_studyroom_safe_summary' : null,
    issues
  };
}

export function createStudyRoomSafeLearningCapsule(summary = {}) {
  const inputValidation = validateStudyRoomSafeSummaryInput(summary);
  if (!inputValidation.ok) {
    return {
      ok: false,
      capsule: null,
      error: inputValidation.error,
      issues: inputValidation.issues
    };
  }

  const created = createSafeLearningCapsule(normalizeSummary(summary));
  if (!created.ok) return created;

  const validation = validateSafeLearningCapsule(created.capsule);
  if (!validation.ok) {
    return {
      ok: false,
      capsule: null,
      error: validation.error,
      issues: validation.issues
    };
  }

  const outputKeys = Object.keys(created.capsule).sort();
  const allowedKeys = [...SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS].sort();
  if (JSON.stringify(outputKeys) !== JSON.stringify(allowedKeys)) {
    return {
      ok: false,
      capsule: null,
      error: 'unsafe_capsule_output',
      issues: [makeValidationIssue('unsafe_output_fields', 'Safe capsule output must contain only APP-H1 allowed fields.')]
    };
  }

  return created;
}
