import {
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from './safeLearningCapsule.js';

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function countBlockedRawIssues(issues = []) {
  return issues.filter(issue => (
    issue.code === 'forbidden_capsule_field' ||
    issue.code === 'forbidden_raw_content_value' ||
    issue.code === 'unknown_capsule_field'
  )).length;
}

function cloneAllowedCapsuleFields(capsule) {
  return Object.fromEntries(SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.map(field => [field, capsule[field]]));
}

export function createSafeCapsuleExportSummary(capsule, validation = validateSafeLearningCapsule(capsule)) {
  return {
    capsuleFieldCount: isPlainObject(capsule) ? Object.keys(capsule).length : 0,
    privacyClass: isPlainObject(capsule) ? capsule.privacyClass : null,
    checksum: isPlainObject(capsule) ? capsule.checksum : null,
    safeSummaryCode: isPlainObject(capsule) ? capsule.safeSummaryCode : null,
    blockedRawFieldCount: validation.ok ? 0 : countBlockedRawIssues(validation.issues),
    exportReadyForMockRobotImport: validation.ok
  };
}

export function createSafeCapsuleMockExport(capsule, options = {}) {
  const validation = validateSafeLearningCapsule(capsule);
  const summary = createSafeCapsuleExportSummary(capsule, validation);

  if (!validation.ok) {
    return {
      ok: false,
      envelope: null,
      serialized: null,
      summary,
      error: validation.error,
      issues: validation.issues.map(issue => ({
        code: issue.code,
        path: issue.path
      }))
    };
  }

  const safeCapsule = cloneAllowedCapsuleFields(capsule);
  const envelope = {
    exportMode: 'mock_only',
    destination: options.destination || 'robot_mock_import',
    realBridgeEnabled: false,
    transportEnabled: false,
    capsule: safeCapsule,
    summary
  };

  return {
    ok: true,
    envelope,
    serialized: JSON.stringify(envelope, null, 2),
    summary,
    error: null,
    issues: []
  };
}
