import {
  SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS,
  validateSafeLearningCapsule
} from './safeLearningCapsule.js';

export const MOCK_ROBOT_IMPORT_PACKAGE_TYPE = 'shime_robot_mock_import_package';
export const MOCK_ROBOT_IMPORT_TARGET = 'R5X19.2_SAFE_MOCK_IMPORT';
export const MOCK_ROBOT_IMPORT_PATH_HINT = '/SHIME_EXTERNAL_CAPSULE_MOCK/imports.jsonl';

export const SAFE_CAPSULE_PRIVACY_AUDIT_PASS = Object.freeze({
  rawQuizFieldsDetected: false,
  rawAnswerFieldsDetected: false,
  rawHistoryDetected: false,
  rawDocumentTextDetected: false,
  rawSourceMetadataDetected: false,
  rawCardDeckIdsDetected: false,
  rawRfIdentifiersDetected: false,
  secretsDetected: false,
  unknownUnsafeFieldsDetected: false
});

function cloneAllowedCapsuleFields(capsule) {
  return Object.fromEntries(SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.map(field => [field, capsule[field]]));
}

function summarizeIssues(issues = []) {
  return issues.map(issue => ({
    code: issue.code,
    path: issue.path,
    category: issue.category || 'capsule_validation'
  }));
}

export function createSafeCapsulePrivacyAudit(capsule) {
  const validation = validateSafeLearningCapsule(capsule);
  if (validation.ok) {
    return {
      ...SAFE_CAPSULE_PRIVACY_AUDIT_PASS,
      ok: true,
      diagnostics: []
    };
  }

  const unknownUnsafeFieldsDetected = validation.issues.some(issue => (
    issue.code === 'unknown_capsule_field' ||
    issue.code === 'forbidden_capsule_field' ||
    issue.code === 'forbidden_raw_content_value'
  ));

  return {
    ...SAFE_CAPSULE_PRIVACY_AUDIT_PASS,
    unknownUnsafeFieldsDetected,
    ok: false,
    diagnostics: summarizeIssues(validation.issues)
  };
}

export function createMockRobotImportPackage(capsule) {
  const validation = validateSafeLearningCapsule(capsule);
  if (!validation.ok) {
    return {
      ok: false,
      package: null,
      serialized: null,
      error: validation.error,
      issues: summarizeIssues(validation.issues)
    };
  }

  const safeCapsule = cloneAllowedCapsuleFields(capsule);
  const privacyAudit = createSafeCapsulePrivacyAudit(safeCapsule);
  const packageObject = {
    packageType: MOCK_ROBOT_IMPORT_PACKAGE_TYPE,
    target: MOCK_ROBOT_IMPORT_TARGET,
    bridgeMode: 'mock_only',
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    motionLockedExpected: true,
    capsule: safeCapsule,
    importPathHint: MOCK_ROBOT_IMPORT_PATH_HINT,
    checksumStatus: 'valid',
    privacyAudit
  };

  return {
    ok: true,
    package: packageObject,
    serialized: JSON.stringify(packageObject, null, 2),
    error: null,
    issues: []
  };
}

export function createMockRobotImportPackageSummary(packageResult) {
  const packageObject = packageResult?.package;
  return {
    packageType: packageObject?.packageType || null,
    target: packageObject?.target || null,
    bridgeMode: packageObject?.bridgeMode || 'mock_only',
    realBridgeEnabled: Boolean(packageObject?.realBridgeEnabled),
    transportEnabled: Boolean(packageObject?.transportEnabled),
    persistentWritesEnabled: Boolean(packageObject?.persistentWritesEnabled),
    motionLockedExpected: Boolean(packageObject?.motionLockedExpected),
    checksumStatus: packageObject?.checksumStatus || 'invalid',
    importPathHint: packageObject?.importPathHint || MOCK_ROBOT_IMPORT_PATH_HINT,
    compatibleWithR5X19_2: Boolean(packageResult?.ok && packageObject?.target === MOCK_ROBOT_IMPORT_TARGET)
  };
}
