import { checksum32 } from './safeLearningCapsule.js';

export const ROBOT_MOCK_IMPORT_REPORT_TYPE = 'r5x19_mock_import_report';
export const ROBOT_MOCK_IMPORT_TARGET = 'R5X19.2_SAFE_MOCK_IMPORT';

const ALLOWED_FIELDS = Object.freeze([
  'reportType',
  'schemaVersion',
  'source',
  'target',
  'importMode',
  'realBridgeEnabled',
  'transportEnabled',
  'persistentWritesEnabled',
  'motionLocked',
  'acceptedCount',
  'rejectedCount',
  'checksumPassCount',
  'privacyPassCount',
  'rawQuizRejected',
  'rawRfRejected',
  'secretRejected',
  'unknownFieldsRejected',
  'importedCapsuleIds',
  'reportChecksum'
]);

const FORBIDDEN_KEYS = /prompt|question|answer|correctAnswer|explanation|userAnswer|history|document|sourceMetadata|cardId|cardIds|deckId|deckIds|ssid|bssid|mac|apList|token|secret|password|credential/i;
const RAW_VALUE_PATTERNS = /private question|private answer|raw document|HomeNetwork|aa:bb:cc:dd:ee:ff|secret-token|card_private|deck_private/i;

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function issue(code, path = '$') {
  return { code, path };
}

function collectUnsafe(value, path = '$', issues = []) {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => collectUnsafe(entry, `${path}[${index}]`, issues));
    return issues;
  }
  if (!value || typeof value !== 'object') {
    if (typeof value === 'string' && RAW_VALUE_PATTERNS.test(value)) issues.push(issue('raw_value_echo_detected', path));
    return issues;
  }
  Object.entries(value).forEach(([key, entry]) => {
    const next = path === '$' ? `$.${key}` : `${path}.${key}`;
    if (!ALLOWED_FIELDS.includes(key) && FORBIDDEN_KEYS.test(key)) issues.push(issue('forbidden_report_field', next));
    collectUnsafe(entry, next, issues);
  });
  return issues;
}

export function computeRobotMockImportReportChecksum(report) {
  const ids = Array.isArray(report?.importedCapsuleIds) ? report.importedCapsuleIds.join('|') : '';
  return checksum32(`${report?.target}|${report?.acceptedCount}|${report?.checksumPassCount}|${report?.privacyPassCount}|${ids}`)
    .toString(16)
    .padStart(8, '0');
}

export function parseRobotMockImportReport(report) {
  const issues = [];
  if (!isPlainObject(report)) {
    return { ok: false, report: null, error: 'invalid_robot_mock_import_report', issues: [issue('report_not_object')] };
  }
  Object.keys(report).forEach(key => {
    if (!ALLOWED_FIELDS.includes(key)) issues.push(issue('unknown_report_field', `$.${key}`));
  });
  issues.push(...collectUnsafe(report));
  if (report.reportType !== ROBOT_MOCK_IMPORT_REPORT_TYPE) issues.push(issue('invalid_report_type', '$.reportType'));
  if (report.schemaVersion !== 1) issues.push(issue('invalid_schema_version', '$.schemaVersion'));
  if (report.source !== 'manual_jsonl_handoff') issues.push(issue('invalid_source', '$.source'));
  if (report.target !== ROBOT_MOCK_IMPORT_TARGET) issues.push(issue('invalid_target', '$.target'));
  if (report.importMode !== 'mock_only') issues.push(issue('invalid_import_mode', '$.importMode'));
  if (report.realBridgeEnabled !== false) issues.push(issue('real_bridge_enabled', '$.realBridgeEnabled'));
  if (report.transportEnabled !== false) issues.push(issue('transport_enabled', '$.transportEnabled'));
  if (report.persistentWritesEnabled !== false) issues.push(issue('persistent_writes_enabled', '$.persistentWritesEnabled'));
  if (report.motionLocked !== true) issues.push(issue('motion_unlocked', '$.motionLocked'));
  ['acceptedCount', 'rejectedCount', 'checksumPassCount', 'privacyPassCount'].forEach(field => {
    if (!Number.isInteger(report[field]) || report[field] < 0) issues.push(issue('invalid_count', `$.${field}`));
  });
  if (!Array.isArray(report.importedCapsuleIds) || report.importedCapsuleIds.some(id => typeof id !== 'string' || !/^[a-zA-Z0-9_-]{6,80}$/.test(id))) {
    issues.push(issue('invalid_imported_capsule_ids', '$.importedCapsuleIds'));
  }
  ['rawQuizRejected', 'rawRfRejected', 'secretRejected', 'unknownFieldsRejected'].forEach(field => {
    if (report[field] !== true) issues.push(issue('required_rejection_guard_missing', `$.${field}`));
  });
  if (report.reportChecksum !== computeRobotMockImportReportChecksum(report)) issues.push(issue('report_checksum_mismatch', '$.reportChecksum'));
  return { ok: issues.length === 0, report: issues.length ? null : report, error: issues.length ? 'invalid_robot_mock_import_report' : null, issues };
}

export function verifyRobotMockImportReport(report, handoffPack) {
  const parsed = parseRobotMockImportReport(report);
  if (!parsed.ok) return { ok: false, status: 'invalid_report', issues: parsed.issues };
  const packages = Array.isArray(handoffPack?.lines) ? handoffPack.lines.map(line => JSON.parse(line)) : [];
  const capsuleIds = packages.map(pkg => pkg.capsule?.capsuleId).filter(Boolean);
  const capsuleCountMatch = report.acceptedCount === packages.length && report.importedCapsuleIds.length === capsuleIds.length;
  const idsMatch = capsuleIds.every(id => report.importedCapsuleIds.includes(id));
  const checksumMatch = report.checksumPassCount === packages.length;
  const privacyPass = report.privacyPassCount === packages.length;
  return {
    ok: capsuleCountMatch && idsMatch && checksumMatch && privacyPass,
    status: capsuleCountMatch && idsMatch && checksumMatch && privacyPass ? 'verified_pass' : 'verified_failed',
    capsuleCountMatch,
    checksumMatch,
    privacyPass,
    idsMatch,
    issues: []
  };
}

export function createRobotMockImportReportFixture(options = {}) {
  const handoffPack = options.handoffPack;
  const packages = Array.isArray(handoffPack?.lines) ? handoffPack.lines.map(line => JSON.parse(line)) : [];
  const importedCapsuleIds = options.importedCapsuleIds || packages.map(pkg => pkg.capsule.capsuleId);
  const report = {
    reportType: ROBOT_MOCK_IMPORT_REPORT_TYPE,
    schemaVersion: 1,
    source: 'manual_jsonl_handoff',
    target: ROBOT_MOCK_IMPORT_TARGET,
    importMode: 'mock_only',
    realBridgeEnabled: false,
    transportEnabled: false,
    persistentWritesEnabled: false,
    motionLocked: true,
    acceptedCount: options.acceptedCount ?? importedCapsuleIds.length,
    rejectedCount: options.rejectedCount ?? 0,
    checksumPassCount: options.checksumPassCount ?? importedCapsuleIds.length,
    privacyPassCount: options.privacyPassCount ?? importedCapsuleIds.length,
    rawQuizRejected: true,
    rawRfRejected: true,
    secretRejected: true,
    unknownFieldsRejected: true,
    importedCapsuleIds,
    reportChecksum: ''
  };
  Object.assign(report, options.overrides || {});
  report.reportChecksum = options.reportChecksum || computeRobotMockImportReportChecksum(report);
  return report;
}
