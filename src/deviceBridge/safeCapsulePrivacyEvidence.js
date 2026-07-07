import { SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS } from './safeLearningCapsule.js';

export const SAFE_CAPSULE_PRIVACY_EVIDENCE_TYPE = 'safe_capsule_privacy_evidence';

const ZERO_CATEGORY_HITS = Object.freeze({
  rawQuiz: 0,
  rawAnswer: 0,
  rawHistory: 0,
  rawDocument: 0,
  rawSourceMetadata: 0,
  rawCardDeckIds: 0,
  rawRfIdentifiers: 0,
  secrets: 0,
  unknownUnsafe: 0
});

const CATEGORY_MAP = Object.freeze({
  forbidden_raw_field: 'rawQuiz',
  app_quiz_field: 'rawQuiz',
  raw_answer: 'rawAnswer',
  app_history_field: 'rawHistory',
  document_text_field: 'rawDocument',
  raw_identifier: 'rawSourceMetadata',
  raw_rf_identifier: 'rawRfIdentifiers',
  rf_identifier: 'rawRfIdentifiers',
  credential_or_secret: 'secrets',
  unknown_field: 'unknownUnsafe',
  unknown_unsafe_field: 'unknownUnsafe',
  malformed_input: 'unknownUnsafe',
  invalid_count: 'unknownUnsafe',
  invalid_total: 'unknownUnsafe',
  array_payload: 'unknownUnsafe'
});

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

function safeBucket(value, fallback = null) {
  return typeof value === 'string' && /^[a-zA-Z0-9_.:-]+$/.test(value) ? value : fallback;
}

function countForbiddenHits(issues = []) {
  const hits = { ...ZERO_CATEGORY_HITS };
  issues.forEach(issue => {
    const mapped = CATEGORY_MAP[issue.category] || CATEGORY_MAP[issue.code] || 'unknownUnsafe';
    hits[mapped] = (hits[mapped] || 0) + 1;
    if (mapped !== 'rawAnswer' && /answer/i.test(issue.path || '')) hits.rawAnswer += 1;
    if (mapped !== 'rawHistory' && /history/i.test(issue.path || '')) hits.rawHistory += 1;
    if (mapped !== 'rawDocument' && /document|textContent/i.test(issue.path || '')) hits.rawDocument += 1;
    if (mapped !== 'rawSourceMetadata' && /sourceMetadata/i.test(issue.path || '')) hits.rawSourceMetadata += 1;
    if (mapped !== 'rawCardDeckIds' && /card|deck/i.test(issue.path || '')) hits.rawCardDeckIds += 1;
    if (mapped !== 'rawRfIdentifiers' && /ssid|bssid|mac|apList/i.test(issue.path || '')) hits.rawRfIdentifiers += 1;
    if (mapped !== 'secrets' && /token|secret|password|credential/i.test(issue.path || '')) hits.secrets += 1;
  });
  return hits;
}

function hasRawValueEcho(value) {
  const text = JSON.stringify(value);
  return RAW_VALUE_PATTERNS.some(pattern => pattern.test(text));
}

export function createSafeCapsulePrivacyEvidence({
  scenarioId = 'unknown_scenario',
  derivedSummary = null,
  capsule = null,
  mockPackage = null,
  rejectionResult = null,
  createdAtBucket = '2026-07-08'
} = {}) {
  const accepted = Boolean(capsule && mockPackage && !rejectionResult?.rejected);
  const rejected = Boolean(rejectionResult?.rejected);
  const issues = rejectionResult?.issues || [];
  const forbiddenCategoryHits = countForbiddenHits(issues);
  const unsafeFieldCount = Object.values(forbiddenCategoryHits).reduce((sum, value) => sum + value, 0);
  const packageObject = mockPackage?.package || mockPackage || null;
  const summaryCodes = [];

  if (accepted) summaryCodes.push('ACCEPTED_SAFE_CAPSULE');
  if (rejected) summaryCodes.push(rejectionResult.rejectionReasonCode || 'REJECTED_UNSAFE_INPUT');
  if (packageObject?.checksumStatus === 'valid') summaryCodes.push('CHECKSUM_VALID');
  if (packageObject?.bridgeMode === 'mock_only') summaryCodes.push('MOCK_ONLY');
  if (packageObject?.target === 'R5X19.2_SAFE_MOCK_IMPORT') summaryCodes.push('R5X19_COMPATIBLE');
  if (packageObject?.transportEnabled === false) summaryCodes.push('NO_TRANSPORT');

  const evidence = {
    evidenceType: SAFE_CAPSULE_PRIVACY_EVIDENCE_TYPE,
    schemaVersion: 1,
    createdAtBucket: safeBucket(createdAtBucket, '2026-07-08'),
    scenarioId: safeBucket(scenarioId, 'unknown_scenario'),
    accepted,
    rejected,
    rejectionReasonCode: rejected ? safeBucket(rejectionResult.rejectionReasonCode, 'REJECTED_UNSAFE_INPUT') : null,
    safeFieldCount: capsule ? SAFE_LEARNING_CAPSULE_ALLOWED_FIELDS.filter(field => Object.prototype.hasOwnProperty.call(capsule, field)).length : 0,
    unsafeFieldCount,
    forbiddenCategoryHits,
    rawValueEchoDetected: false,
    packageCreated: Boolean(packageObject),
    checksumStatus: packageObject?.checksumStatus || (capsule ? 'unknown' : 'not_created'),
    bridgeMode: packageObject?.bridgeMode || 'mock_only',
    transportEnabled: Boolean(packageObject?.transportEnabled),
    realBridgeEnabled: Boolean(packageObject?.realBridgeEnabled),
    motionLockedExpected: Boolean(packageObject?.motionLockedExpected),
    summaryCodes
  };

  return {
    ...evidence,
    rawValueEchoDetected: hasRawValueEcho(evidence)
  };
}
