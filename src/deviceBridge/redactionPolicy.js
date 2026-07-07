export const FORBIDDEN_DEVICE_EVENT_KEYS = Object.freeze([
  'prompt',
  'question',
  'front',
  'back',
  'correctAnswer',
  'answer',
  'acceptableAnswers',
  'explanation',
  'userAnswer',
  'typedAnswer',
  'sourceMetadata',
  'sourceName',
  'importedFileName',
  'importedDocumentName',
  'rawText',
  'cleanedText',
  'backupPayload',
  'settings',
  'studyHistory',
  'fullHistory'
]);

export const ALLOWED_DEVICE_PAYLOAD_KEYS = Object.freeze([
  'itemIndex',
  'itemType',
  'progressCount',
  'totalCount',
  'status',
  'scoreBucket',
  'accuracyBucket',
  'dueCountBucket',
  'bridgeStatus',
  'transportStatus',
  'command',
  'reasonCode',
  'message'
]);

const FORBIDDEN_KEY_SET = new Set(FORBIDDEN_DEVICE_EVENT_KEYS);
const ALLOWED_PAYLOAD_KEY_SET = new Set(ALLOWED_DEVICE_PAYLOAD_KEYS);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function makeIssue(code, message, path = '$') {
  return { code, message, path };
}

function cloneValue(value) {
  if (Array.isArray(value)) return value.map(entry => cloneValue(entry));
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneValue(entry)]));
}

function collectForbiddenKeyIssues(value, path = '$', issues = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectForbiddenKeyIssues(entry, `${path}[${index}]`, issues));
    return issues;
  }

  if (!value || typeof value !== 'object') return issues;

  Object.entries(value).forEach(([key, entry]) => {
    const nextPath = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (FORBIDDEN_KEY_SET.has(key)) {
      issues.push(makeIssue('forbidden_sensitive_key', `Payload contains forbidden sensitive key: ${key}`, nextPath));
    }
    collectForbiddenKeyIssues(entry, nextPath, issues);
  });

  return issues;
}

function collectPayloadKeyIssues(payload) {
  return Object.keys(payload)
    .filter(key => !ALLOWED_PAYLOAD_KEY_SET.has(key))
    .map(key => makeIssue('payload_field_not_allowed', `Payload field is not allowed: ${key}`, `$.payload.${key}`));
}

export function containsForbiddenDevicePayloadData(value) {
  return collectForbiddenKeyIssues(value).length > 0;
}

export function sanitizeDevicePayload(payload) {
  if (!isPlainObject(payload)) {
    return {
      ok: false,
      payload: null,
      issues: [makeIssue('invalid_payload', 'Device event payload must be a plain object.', '$.payload')]
    };
  }

  const issues = [
    ...collectPayloadKeyIssues(payload),
    ...collectForbiddenKeyIssues(payload, '$.payload')
  ];

  if (issues.length > 0) {
    return {
      ok: false,
      payload: null,
      issues
    };
  }

  const sanitizedPayload = {};
  ALLOWED_DEVICE_PAYLOAD_KEYS.forEach(key => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      sanitizedPayload[key] = cloneValue(payload[key]);
    }
  });

  return {
    ok: true,
    payload: sanitizedPayload,
    issues: []
  };
}

export function assertSafeDevicePayload(payload) {
  return sanitizeDevicePayload(payload);
}

export function createPrivacySafeFailure(reasonCode, message) {
  return {
    ok: false,
    reason: reasonCode || 'privacy_violation',
    message: message || 'Device event payload failed privacy validation.'
  };
}
