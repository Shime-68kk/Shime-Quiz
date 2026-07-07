import { summarizeShimeEcosystemFusion } from './appRobotFusionEngine.js';

export function createShimeEcosystemDecisionAudit(results = []) {
  return results.map((result, index) => {
    const summary = summarizeShimeEcosystemFusion(result);
    return {
      step: index + 1,
      scenarioId: `scenario_${String(index + 1).padStart(5, '0')}`,
      productDoctrineSummary: result.productDoctrineSummary || {},
      fsrsSignalSummary: {
        memoryPressureBucket: summary.memoryPressureBucket,
        forgettingRiskBucket: summary.forgettingRiskBucket,
        recoveryNeedBucket: summary.recoveryNeedBucket
      },
      capsuleSummary: {
        privacyStatus: result.learningCapsule?.privacyStatus,
        dryRunOnly: result.learningCapsule?.dryRunOnly
      },
      companionIntent: result.learningCapsule?.companionIntent || 'neutral_wait',
      robotInterventionFamily: summary.robotInterventionFamily,
      timetableRecommendation: summary.timetableRecommendation,
      transportRecommendation: summary.transportRecommendation,
      safetyOutcome: summary.safetyOutcome,
      invariantStatus: summary.invariantStatus,
      privacyStatus: result.learningCapsule?.privacyStatus || 'unknown',
      dryRunOnly: true,
      reasonCodes: [...(result.reasonCodes || [])]
    };
  });
}
