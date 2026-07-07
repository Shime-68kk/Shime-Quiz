export const SAFE_LEARNING_CAPSULE_SCHEMA_VERSION = 'shime-safe-learning-capsule-v1';

export const SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS = Object.freeze([
  'schemaVersion',
  'capsuleId',
  'sourceType',
  'createdAtBucket',
  'monotonicImportId',
  'learningStateBucket',
  'studyLoadBucket',
  'reviewUrgencyBucket',
  'sessionMoodBucket',
  'sessionEnergyBucket',
  'focusNeedBucket',
  'recommendedCompanionAction',
  'companionTone',
  'safeSummaryCode',
  'expirationBucket',
  'privacyClass',
  'checksum'
]);

export const SAFE_LEARNING_CAPSULE_FORBIDDEN_FIELDS = Object.freeze([
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
  'document text',
  'rawFsrsReviewLogs',
  'rawFSRSReviewLogs',
  'cardId',
  'itemId',
  'perCardId',
  'ssid',
  'SSID',
  'bssid',
  'BSSID',
  'mac',
  'MAC',
  'rawApLists',
  'rawAPLists',
  'credentials',
  'credential',
  'tokens',
  'token',
  'secrets',
  'secret',
  'passwords',
  'password'
]);

export const SAFE_LEARNING_CAPSULE_ENUMS = Object.freeze({
  sourceType: Object.freeze(['shime_quiz_app', 'shime_quiz_studyroom', 'mock_import', 'manual_fixture']),
  learningStateBucket: Object.freeze(['unknown', 'new', 'building', 'steady', 'strong', 'needs_review', 'struggling']),
  studyLoadBucket: Object.freeze(['none', 'light', 'normal', 'moderate', 'heavy']),
  reviewUrgencyBucket: Object.freeze(['none', 'low', 'medium', 'high']),
  sessionMoodBucket: Object.freeze(['unknown', 'calm', 'confident', 'strained', 'tired']),
  sessionEnergyBucket: Object.freeze(['unknown', 'low', 'medium', 'high']),
  focusNeedBucket: Object.freeze(['none', 'low', 'medium', 'high', 'rest_or_light_review']),
  recommendedCompanionAction: Object.freeze([
    'none',
    'encourage',
    'slow_down',
    'suggest_break',
    'review_due',
    'celebrate',
    'quiet_presence',
    'encourage_break_or_review',
    'suggest_review_focus'
  ]),
  companionTone: Object.freeze(['quiet', 'warm', 'focused', 'celebratory', 'calm', 'gentle']),
  safeSummaryCode: Object.freeze([
    'NO_SIGNAL',
    'STEADY_PROGRESS',
    'REVIEW_SOON',
    'NEEDS_GENTLE_SUPPORT',
    'HIGH_LOAD_BREAK_SUGGESTED'
  ]),
  expirationBucket: Object.freeze(['same_session', 'same_day', 'short_window']),
  privacyClass: Object.freeze(['redacted_coarse_only'])
});

const ALLOWED_FIELD_SET = new Set(SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS);
const FORBIDDEN_FIELD_SET = new Set(SAFE_LEARNING_CAPSULE_FORBIDDEN_FIELDS);
const RAW_CONTENT_PATTERNS = [
  /correct\s*answer/i,
  /user\s*answer/i,
  /explanation/i,
  /imported\s*document/i,
  /raw\s*quiz/i,
  /study\s*history/i,
  /fsrs/i,
  /\bssid\b/i,
  /\bbssid\b/i,
  /\bmac\b/i,
  /password|secret|token|credential/i
];

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function isSafeIdentifier(value) {
  return typeof value === 'string' && /^[a-zA-Z0-9_-]{6,64}$/.test(value);
}

function isBucketDate(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function hasRawContentText(value) {
  if (typeof value !== 'string') return false;
  return RAW_CONTENT_PATTERNS.some(pattern => pattern.test(value));
}

function collectForbiddenFieldIssues(value, path = '$', issues = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenFieldIssues(entry, `${path}[${index}]`, issues));
    return issues;
  }

  if (!value || typeof value !== 'object') return issues;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_FIELD_SET.has(key)) {
      issues.push(makeIssue('forbidden_capsule_field', `Capsule contains forbidden field: ${key}`, nextPath));
    }
    if (hasRawContentText(entry)) {
      issues.push(makeIssue('forbidden_raw_content_value', `Capsule contains raw-content-like value at ${nextPath}.`, nextPath));
    }
    collectForbiddenFieldIssues(entry, nextPath, issues);
  });

  return issues;
}

export function checksum32(value) {
  const text = String(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash >>> 0;
}

export function formatChecksum32(value) {
  return checksum32(value).toString(16).padStart(8, '0');
}

export function computeSafeLearningCapsuleChecksum(capsule) {
  if (!isPlainObject(capsule)) return '';
  return formatChecksum32(`${capsule.capsuleId}|${capsule.sourceType}|${capsule.safeSummaryCode}`);
}

export function validateSafeLearningCapsule(capsule) {
  const issues = [];

  if (!isPlainObject(capsule)) {
    return {
      ok: false,
      error: 'invalid_safe_learning_capsule',
      issues: [makeIssue('capsule_not_object', 'Safe Learning Capsule must be a plain object.')]
    };
  }

  const keys = Object.keys(capsule);
  const missingFields = SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.filter(field => !Object.prototype.hasOwnProperty.call(capsule, field));
  missingFields.forEach(field => {
    issues.push(makeIssue('missing_required_field', `Missing required capsule field: ${field}`, `$.${field}`));
  });

  keys.filter(key => !ALLOWED_FIELD_SET.has(key)).forEach(key => {
    issues.push(makeIssue('unknown_capsule_field', `Unknown capsule field is not allowed: ${key}`, `$.${key}`));
  });

  issues.push(...collectForbiddenFieldIssues(capsule));

  if (capsule.schemaVersion !== SAFE_LEARNING_CAPSULE_SCHEMA_VERSION) {
    issues.push(makeIssue('invalid_schema_version', `schemaVersion must be ${SAFE_LEARNING_CAPSULE_SCHEMA_VERSION}.`, '$.schemaVersion'));
  }

  if (!isSafeIdentifier(capsule.capsuleId)) {
    issues.push(makeIssue('invalid_capsule_id', 'capsuleId must be a non-identifying safe token.', '$.capsuleId'));
  }

  if (!Number.isInteger(capsule.monotonicImportId) || capsule.monotonicImportId < 0) {
    issues.push(makeIssue('invalid_monotonic_import_id', 'monotonicImportId must be a non-negative integer.', '$.monotonicImportId'));
  }

  if (!isBucketDate(capsule.createdAtBucket)) {
    issues.push(makeIssue('invalid_created_at_bucket', 'createdAtBucket must be a YYYY-MM-DD bucket.', '$.createdAtBucket'));
  }

  if (!isBucketDate(capsule.expirationBucket) && !SAFE_LEARNING_CAPSULE_ENUMS.expirationBucket.includes(capsule.expirationBucket)) {
    issues.push(makeIssue('invalid_expiration_bucket', 'expirationBucket must be an allowed coarse expiration bucket or YYYY-MM-DD bucket.', '$.expirationBucket'));
  }

  Object.entries(SAFE_LEARNING_CAPSULE_ENUMS).forEach(([field, allowedValues]) => {
    if (field === 'expirationBucket') return;
    if (!allowedValues.includes(capsule[field])) {
      issues.push(makeIssue('invalid_bucket_value', `${field} must be one of: ${allowedValues.join(', ')}.`, `$.${field}`));
    }
  });

  const expectedChecksum = computeSafeLearningCapsuleChecksum(capsule);
  if (typeof capsule.checksum !== 'string' || !/^[a-f0-9]{8}$/.test(capsule.checksum)) {
    issues.push(makeIssue('invalid_checksum_format', 'checksum must be an 8-character lowercase checksum32 hex string.', '$.checksum'));
  } else if (capsule.checksum !== expectedChecksum) {
    issues.push(makeIssue('checksum_mismatch', 'checksum must match checksum32(capsuleId|sourceType|safeSummaryCode).', '$.checksum'));
  }

  return {
    ok: issues.length === 0,
    error: issues.length ? 'invalid_safe_learning_capsule' : null,
    issues
  };
}

export function createSafeLearningCapsule(input = {}) {
  if (!isPlainObject(input)) {
    return {
      ok: false,
      capsule: null,
      error: 'invalid_safe_learning_capsule_input',
      issues: [makeIssue('input_not_object', 'Safe Learning Capsule input must be a plain object.')]
    };
  }

  const capsule = {
    schemaVersion: input.schemaVersion || SAFE_LEARNING_CAPSULE_SCHEMA_VERSION,
    capsuleId: input.capsuleId,
    sourceType: input.sourceType || 'shime_quiz_app',
    createdAtBucket: input.createdAtBucket,
    monotonicImportId: input.monotonicImportId,
    learningStateBucket: input.learningStateBucket,
    studyLoadBucket: input.studyLoadBucket,
    reviewUrgencyBucket: input.reviewUrgencyBucket,
    sessionMoodBucket: input.sessionMoodBucket,
    sessionEnergyBucket: input.sessionEnergyBucket,
    focusNeedBucket: input.focusNeedBucket,
    recommendedCompanionAction: input.recommendedCompanionAction,
    companionTone: input.companionTone,
    safeSummaryCode: input.safeSummaryCode,
    expirationBucket: input.expirationBucket,
    privacyClass: input.privacyClass || 'redacted_coarse_only'
  };

  capsule.checksum = input.checksum || computeSafeLearningCapsuleChecksum(capsule);

  const validation = validateSafeLearningCapsule(capsule);
  if (!validation.ok) {
    return {
      ok: false,
      capsule: null,
      error: validation.error,
      issues: validation.issues
    };
  }

  return {
    ok: true,
    capsule,
    error: null,
    issues: []
  };
}
