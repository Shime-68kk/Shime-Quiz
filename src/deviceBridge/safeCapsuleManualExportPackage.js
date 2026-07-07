import { checksum32, SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS, validateSafeLearningCapsule } from './safeLearningCapsule.js';
import { MOCK_ROBOT_IMPORT_PATH_HINT, MOCK_ROBOT_IMPORT_TARGET } from './mockRobotImportPackage.js';

export const MANUAL_HANDOFF_EXPORT_TYPE = 'shime_safe_capsule_manual_handoff_pack';
const RAW_VALUE_PATTERNS = [
  /private question/i,
  /private answer/i,
  /raw document/i,
  /HomeNetwork/i,
  /aa:bb:cc:dd:ee:ff/i,
  /secret-token/i,
  /card_private/i,
  /deck_private/i
];
const ALLOWED_PACKAGE_FIELDS = Object.freeze([
  'packageType',
  'target',
  'bridgeMode',
  'realBridgeEnabled',
  'transportEnabled',
  'persistentWritesEnabled',
  'motionLockedExpected',
  'capsule',
  'importPathHint',
  'checksumStatus',
  'privacyAudit'
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function hasRawValueEcho(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return RAW_VALUE_PATTERNS.some(pattern => pattern.test(text));
}

function validateMockPackage(pkg) {
  const issues = [];
  if (!isPlainObject(pkg)) issues.push({ code: 'package_not_object' });
  if (isPlainObject(pkg) && Object.keys(pkg).some(key => !ALLOWED_PACKAGE_FIELDS.includes(key))) {
    issues.push({ code: 'unknown_package_field' });
  }
  if (pkg?.packageType !== 'shime_robot_mock_import_package') issues.push({ code: 'invalid_package_type' });
  if (pkg?.target !== MOCK_ROBOT_IMPORT_TARGET) issues.push({ code: 'invalid_target' });
  if (pkg?.bridgeMode !== 'mock_only') issues.push({ code: 'invalid_bridge_mode' });
  if (pkg?.realBridgeEnabled !== false) issues.push({ code: 'real_bridge_enabled' });
  if (pkg?.transportEnabled !== false) issues.push({ code: 'transport_enabled' });
  if (pkg?.persistentWritesEnabled !== false) issues.push({ code: 'persistent_writes_enabled' });
  if (pkg?.motionLockedExpected !== true) issues.push({ code: 'motion_not_locked' });
  if (pkg?.checksumStatus !== 'valid') issues.push({ code: 'invalid_checksum_status' });
  if (hasRawValueEcho(pkg)) issues.push({ code: 'raw_value_echo_detected' });

  const capsuleValidation = validateSafeLearningCapsule(pkg?.capsule);
  if (!capsuleValidation.ok) {
    issues.push(...capsuleValidation.issues.map(issue => ({ code: issue.code, path: issue.path })));
  }
  if (pkg?.capsule && Object.keys(pkg.capsule).some(key => !SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.includes(key))) {
    issues.push({ code: 'unknown_capsule_field' });
  }

  return { ok: issues.length === 0, issues };
}

function safeExportId(options) {
  if (typeof options.exportId === 'string' && /^[a-zA-Z0-9_-]{6,80}$/.test(options.exportId)) return options.exportId;
  const bucket = options.createdAtBucket || '2026-07-08';
  return `manual_handoff_${bucket.replaceAll('-', '')}`;
}

export function serializeManualHandoffJsonl(handoffPack) {
  return Array.isArray(handoffPack?.lines) ? `${handoffPack.lines.join('\n')}\n` : '';
}

export function verifyManualSafeCapsuleHandoffPack(handoffPack) {
  const lines = Array.isArray(handoffPack?.lines) ? handoffPack.lines : [];
  const parsedPackages = [];
  const issues = [];

  lines.forEach((line, index) => {
    try {
      const parsed = JSON.parse(line);
      parsedPackages.push(parsed);
      const validation = validateMockPackage(parsed);
      if (!validation.ok) issues.push({ code: 'invalid_line_package', index, issues: validation.issues });
    } catch {
      issues.push({ code: 'invalid_jsonl_line', index });
    }
  });

  const transportFlagCount = parsedPackages.filter(pkg => pkg.transportEnabled !== false).length;
  const realBridgeFlagCount = parsedPackages.filter(pkg => pkg.realBridgeEnabled !== false).length;
  const rawEcho = hasRawValueEcho(lines.join('\n'));
  const checksumText = lines.join('\n');

  return {
    ok: issues.length === 0 && !rawEcho && transportFlagCount === 0 && realBridgeFlagCount === 0,
    lineCount: lines.length,
    checksum32: checksum32(checksumText).toString(16).padStart(8, '0'),
    forbiddenRawValueEchoDetected: rawEcho,
    forbiddenFieldCount: issues.length,
    transportFlagCount,
    realBridgeFlagCount,
    issues
  };
}

export function createManualSafeCapsuleHandoffPack(packages = [], options = {}) {
  if (!Array.isArray(packages) || packages.length === 0) {
    return { ok: false, handoffPack: null, error: 'manual_handoff_requires_packages', issues: [{ code: 'empty_package_list' }] };
  }

  const issues = [];
  packages.forEach((pkg, index) => {
    const validation = validateMockPackage(pkg);
    if (!validation.ok) issues.push({ code: 'invalid_mock_package', index, issues: validation.issues });
  });
  if (issues.length) return { ok: false, handoffPack: null, error: 'invalid_manual_handoff_package_input', issues };

  const lines = packages.map(pkg => JSON.stringify(pkg));
  const createdAtBucket = options.createdAtBucket || '2026-07-08';
  const exportId = safeExportId({ ...options, createdAtBucket });
  const privacyEvidence = Array.isArray(options.privacyEvidence) ? options.privacyEvidence : [];
  const provisional = { lines };
  const verification = verifyManualSafeCapsuleHandoffPack(provisional);
  const handoffPack = {
    exportType: MANUAL_HANDOFF_EXPORT_TYPE,
    schemaVersion: 1,
    target: MOCK_ROBOT_IMPORT_TARGET,
    bridgeMode: 'manual_handoff_mock_only',
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    motionLockedExpected: true,
    createdAtBucket,
    exportId,
    manifest: {
      capsuleCount: packages.length,
      packageCount: packages.length,
      evidenceCount: privacyEvidence.length,
      checksumStatus: verification.ok ? 'valid' : 'invalid',
      privacyStatus: verification.forbiddenRawValueEchoDetected ? 'blocked' : 'safe',
      compatibilityStatus: 'R5X19.2_SAFE_MOCK_IMPORT_READY',
      importPathHint: MOCK_ROBOT_IMPORT_PATH_HINT,
      instructionsCode: 'MANUAL_COPY_JSONL_TO_MOCK_IMPORT_FOLDER'
    },
    lines,
    privacyEvidence,
    verification
  };

  return { ok: true, handoffPack, error: null, issues: [] };
}

export function createSafeExportFileName(handoffPack) {
  const exportId = String(handoffPack?.exportId || 'manual_handoff').replace(/[^a-zA-Z0-9_-]/g, '_');
  const bucket = String(handoffPack?.createdAtBucket || '2026-07-08').replace(/[^0-9-]/g, '');
  return `shime-safe-capsule-${bucket}-${exportId}.jsonl`;
}
