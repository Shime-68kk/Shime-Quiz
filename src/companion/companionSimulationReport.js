export function createCompanionSimulationReport(results = []) {
  const acceptedCount = results.filter(result => result.accepted).length;
  const rejectedCount = results.filter(result => !result.accepted).length;
  const blockedCount = results.filter(result => result.safetyDecision?.allowed === false || result.robotIntent?.ok === false).length;
  const downgradedCount = results.filter(result => result.safetyDecision?.reasonCodes?.some(code => code.includes('downgraded') || code.includes('rate_limited'))).length;
  const robotCommands = results.map(result => result.robotIntent?.command).filter(Boolean);
  const privacyViolationsBlocked = results.filter(result => result.reasonCodes?.includes('forbidden_companion_key') || result.privacyStatus === 'blocked').length;

  return {
    eventCount: results.length,
    acceptedCount,
    rejectedCount,
    blockedCount,
    downgradedCount,
    robotCommands,
    privacyViolationsBlocked,
    finalCompanionState: results.at(-1)?.companionContext || null,
    finalRecommendation: rejectedCount === 0 && privacyViolationsBlocked === 0
      ? 'simulation_safe'
      : 'review_blocked_or_rejected_events'
  };
}
