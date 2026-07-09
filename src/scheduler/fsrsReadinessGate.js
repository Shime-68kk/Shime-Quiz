const GATE_NAMES = [
  'deterministicOutputPass',
  'dueCountSanityPass',
  'workloadSanityPass',
  'noNegativeIntervalPass',
  'noImpossibleNextReviewAtPass',
  'rollbackAvailablePass',
  'backupMetadataAvailablePass',
  'importExportCompatibilityPass',
  'studyRoomIntegrationSafePass',
  'userOptInRequiredPass'
];

const BLOCKED_REASON_BY_GATE = {
  deterministicOutputPass: 'deterministic_output_missing',
  dueCountSanityPass: 'due_count_sanity_missing',
  workloadSanityPass: 'workload_sanity_missing',
  noNegativeIntervalPass: 'negative_interval_risk',
  noImpossibleNextReviewAtPass: 'impossible_next_review_risk',
  rollbackAvailablePass: 'rollback_not_available',
  backupMetadataAvailablePass: 'backup_metadata_missing',
  importExportCompatibilityPass: 'import_export_compatibility_missing',
  studyRoomIntegrationSafePass: 'studyroom_integration_not_proven',
  userOptInRequiredPass: 'user_opt_in_not_enforced'
};

export function evaluateFsrsReadinessGate(evidence = {}) {
  const blockedReasons = [];
  let passCount = 0;

  for (const gate of GATE_NAMES) {
    if (evidence[gate] === true) passCount += 1;
    else blockedReasons.push(BLOCKED_REASON_BY_GATE[gate]);
  }

  const readinessScore = Math.round((passCount / GATE_NAMES.length) * 100);
  const fsrsCanBeBetaOptIn =
    readinessScore >= 80 &&
    evidence.rollbackAvailablePass === true &&
    evidence.userOptInRequiredPass === true &&
    evidence.noNegativeIntervalPass === true &&
    evidence.noImpossibleNextReviewAtPass === true;

  return {
    fsrsCanBeDefault: false,
    fsrsCanBeBetaOptIn,
    blockedReasons,
    readinessScore,
    recommendation: fsrsCanBeBetaOptIn
      ? 'fsrs_beta_opt_in_allowed_keep_sm2_default'
      : 'keep_sm2_default_collect_more_fsrs_evidence'
  };
}

export function createPassingFsrsBetaEvidence() {
  return Object.fromEntries(GATE_NAMES.map(name => [name, true]));
}

export { GATE_NAMES as FSRS_READINESS_GATE_NAMES };
