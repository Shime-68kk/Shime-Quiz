import {
  createStudyRoomDerivedSafeCapsule,
  createStudyRoomDerivedSummaryDiagnostics,
  validateStudyRoomDerivedSummaryInput
} from '../../deviceBridge/studyRoomDerivedSummary.js';
import {
  createMockRobotImportPackage,
  createMockRobotImportPackageSummary
} from '../../deviceBridge/mockRobotImportPackage.js';
import { createSafeCapsulePrivacyEvidence } from '../../deviceBridge/safeCapsulePrivacyEvidence.js';

export const SAFE_CAPSULE_REHEARSAL_SCENARIOS = Object.freeze([
  'steady_progress',
  'struggling_streak',
  'review_pressure_high',
  'low_energy_focus',
  'disconnected_device_context',
  'privacy_attack_raw_quiz',
  'privacy_attack_raw_rf',
  'privacy_attack_secret',
  'malformed_summary',
  'unknown_field_injection'
]);

export const SAFE_CAPSULE_REHEARSAL_ACTIONS = Object.freeze({
  RUN_SCENARIO: 'run_scenario',
  RUN_ALL: 'run_all',
  CLEAR: 'clear'
});

const BASE_SUMMARY = Object.freeze({
  correctCount: 8,
  incorrectCount: 1,
  skippedCount: 1,
  totalCount: 10,
  sessionDurationBucket: 'medium',
  recentAccuracyBucket: 'high',
  dueReviewCountBucket: 'low',
  consecutiveErrorsBucket: 'none',
  hesitationBucket: 'low',
  focusNeedSignalBucket: 'low',
  userEnergySelfReportBucket: 'medium',
  monotonicImportId: 2001
});

const SCENARIO_INPUTS = Object.freeze({
  steady_progress: Object.freeze({ ...BASE_SUMMARY }),
  struggling_streak: Object.freeze({
    ...BASE_SUMMARY,
    correctCount: 3,
    incorrectCount: 6,
    skippedCount: 1,
    recentAccuracyBucket: 'low',
    consecutiveErrorsBucket: 'high',
    focusNeedSignalBucket: 'high',
    monotonicImportId: 2002
  }),
  review_pressure_high: Object.freeze({
    ...BASE_SUMMARY,
    dueReviewCountBucket: 'high',
    sessionDurationBucket: 'long',
    focusNeedSignalBucket: 'medium',
    monotonicImportId: 2003
  }),
  low_energy_focus: Object.freeze({
    ...BASE_SUMMARY,
    dueReviewCountBucket: 'medium',
    sessionDurationBucket: 'long',
    focusNeedSignalBucket: 'rest_or_light_review',
    userEnergySelfReportBucket: 'low',
    monotonicImportId: 2004
  }),
  disconnected_device_context: Object.freeze({
    ...BASE_SUMMARY,
    focusNeedSignalBucket: 'none',
    monotonicImportId: 2005
  }),
  privacy_attack_raw_quiz: Object.freeze({
    ...BASE_SUMMARY,
    prompt: 'private question',
    correctAnswer: 'private answer',
    monotonicImportId: 2006
  }),
  privacy_attack_raw_rf: Object.freeze({
    ...BASE_SUMMARY,
    ssid: 'HomeNetwork',
    bssid: 'aa:bb:cc:dd:ee:ff',
    monotonicImportId: 2007
  }),
  privacy_attack_secret: Object.freeze({
    ...BASE_SUMMARY,
    token: 'secret-token',
    password: 'private password',
    monotonicImportId: 2008
  }),
  malformed_summary: Object.freeze({
    ...BASE_SUMMARY,
    correctCount: 99,
    totalCount: 10,
    monotonicImportId: 2009
  }),
  unknown_field_injection: Object.freeze({
    ...BASE_SUMMARY,
    deckId: 'deck_private',
    unexpectedPayload: 'blocked',
    monotonicImportId: 2010
  })
});

const REJECTION_CODE_BY_SCENARIO = Object.freeze({
  privacy_attack_raw_quiz: 'REJECTED_FOR_RAW_QUIZ',
  privacy_attack_raw_rf: 'REJECTED_FOR_RAW_RF',
  privacy_attack_secret: 'REJECTED_FOR_SECRET',
  malformed_summary: 'REJECTED_FOR_MALFORMED_SUMMARY',
  unknown_field_injection: 'REJECTED_FOR_UNKNOWN_FIELD'
});

export function createInitialSafeCapsuleRehearsalLabState() {
  return {
    results: [],
    latestResult: null,
    mockOnlyStatus: 'mock_only_not_connected',
    noSendStatus: 'no_send_preview_only',
    realBridgeEnabled: false,
    transportEnabled: false
  };
}

function scoreAccepted({ capsule, packageResult }) {
  const explanationCodes = ['PRIVACY_SAFE_FIELDS_ONLY', 'CHECKSUM_VALID', 'R5X19_COMPATIBLE', 'MOCK_ONLY', 'NO_TRANSPORT'];
  if (capsule?.recommendedCompanionAction && capsule.recommendedCompanionAction !== 'none') {
    explanationCodes.push('ACTION_RECOMMENDATION_PRESENT');
  }

  return {
    overall: 96,
    privacy: 100,
    compatibility: packageResult?.ok ? 100 : 0,
    actionability: capsule?.recommendedCompanionAction && capsule.recommendedCompanionAction !== 'none' ? 95 : 70,
    freshness: 95,
    explanationCodes
  };
}

function scoreRejected(rejectionReasonCode) {
  return {
    overall: 0,
    privacy: 100,
    compatibility: 0,
    actionability: 0,
    freshness: 0,
    explanationCodes: ['MOCK_ONLY', 'NO_TRANSPORT', rejectionReasonCode]
  };
}

function safeIssues(issues = []) {
  return issues.map(issue => ({
    code: issue.code,
    category: issue.category || 'unknownUnsafe',
    path: issue.path
  }));
}

export function runSafeCapsuleRehearsalScenario(scenarioId) {
  const derivedSummary = SCENARIO_INPUTS[scenarioId];
  if (!derivedSummary) {
    const rejectionReasonCode = 'REJECTED_FOR_UNKNOWN_FIELD';
    const rejectionResult = { rejected: true, rejectionReasonCode, issues: [] };
    return {
      scenarioId: 'unknown_scenario',
      accepted: false,
      rejected: true,
      rejectionReasonCode,
      diagnostics: [],
      capsule: null,
      mockPackage: null,
      mockPackageSummary: null,
      privacyEvidenceSummary: createSafeCapsulePrivacyEvidence({ scenarioId: 'unknown_scenario', rejectionResult }),
      qualityScore: scoreRejected(rejectionReasonCode),
      compatibilityScore: 0,
      recommendedCompanionAction: 'none',
      companionTone: 'quiet',
      noSendStatus: 'no_send_preview_only',
      mockOnlyStatus: 'mock_only_not_connected'
    };
  }

  const validation = validateStudyRoomDerivedSummaryInput(derivedSummary);
  if (!validation.ok) {
    const rejectionReasonCode = REJECTION_CODE_BY_SCENARIO[scenarioId] || 'REJECTED_FOR_UNKNOWN_FIELD';
    const rejectionResult = {
      rejected: true,
      rejectionReasonCode,
      issues: safeIssues(validation.issues)
    };
    const diagnostics = createStudyRoomDerivedSummaryDiagnostics({ ok: false, issues: rejectionResult.issues });
    return {
      scenarioId,
      accepted: false,
      rejected: true,
      rejectionReasonCode,
      diagnostics,
      capsule: null,
      mockPackage: null,
      mockPackageSummary: null,
      privacyEvidenceSummary: createSafeCapsulePrivacyEvidence({ scenarioId, rejectionResult }),
      qualityScore: scoreRejected(rejectionReasonCode),
      compatibilityScore: 0,
      recommendedCompanionAction: 'none',
      companionTone: 'quiet',
      noSendStatus: 'no_send_preview_only',
      mockOnlyStatus: 'mock_only_not_connected'
    };
  }

  const capsuleResult = createStudyRoomDerivedSafeCapsule(derivedSummary, { createdAtBucket: '2026-07-08' });
  const packageResult = capsuleResult.ok ? createMockRobotImportPackage(capsuleResult.capsule) : { ok: false, package: null };
  const mockPackageSummary = createMockRobotImportPackageSummary(packageResult);
  const qualityScore = scoreAccepted({ capsule: capsuleResult.capsule, packageResult });
  const evidence = createSafeCapsulePrivacyEvidence({
    scenarioId,
    derivedSummary,
    capsule: capsuleResult.capsule,
    mockPackage: packageResult.package
  });

  return {
    scenarioId,
    accepted: true,
    rejected: false,
    rejectionReasonCode: null,
    diagnostics: { ok: true, rejectedIssueCount: 0, categories: [] },
    capsule: capsuleResult.capsule,
    mockPackage: packageResult.package,
    mockPackageSummary,
    privacyEvidenceSummary: evidence,
    qualityScore,
    compatibilityScore: mockPackageSummary.compatibleWithR5X19_2 ? 100 : 0,
    recommendedCompanionAction: capsuleResult.capsule.recommendedCompanionAction,
    companionTone: capsuleResult.capsule.companionTone,
    noSendStatus: 'no_send_preview_only',
    mockOnlyStatus: 'mock_only_not_connected'
  };
}

export function runAllSafeCapsuleRehearsals() {
  return SAFE_CAPSULE_REHEARSAL_SCENARIOS.map(runSafeCapsuleRehearsalScenario);
}

export function applySafeCapsuleRehearsalLabAction(state, action) {
  const current = state || createInitialSafeCapsuleRehearsalLabState();
  const type = action?.type || action;

  if (type === SAFE_CAPSULE_REHEARSAL_ACTIONS.CLEAR) {
    return createInitialSafeCapsuleRehearsalLabState();
  }

  if (type === SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_ALL) {
    const results = runAllSafeCapsuleRehearsals();
    return { ...current, results, latestResult: results[results.length - 1] };
  }

  if (type === SAFE_CAPSULE_REHEARSAL_ACTIONS.RUN_SCENARIO) {
    const result = runSafeCapsuleRehearsalScenario(action.scenarioId);
    return { ...current, results: [result], latestResult: result };
  }

  return current;
}

export function getSafeCapsuleRehearsalScenarioIds() {
  return SAFE_CAPSULE_REHEARSAL_SCENARIOS;
}
