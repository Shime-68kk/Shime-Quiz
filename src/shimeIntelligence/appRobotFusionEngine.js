import { createLearningStateCapsule, summarizeLearningStateCapsule, validateLearningStateCapsule } from './learningStateCapsule.js';
import { planRobotIntervention } from './robotInterventionPlanner.js';
import { planTimetableIntervention } from './timetableInterventionPlanner.js';
import { planTransportBrain } from './transportBrain.js';
import { createRobotCapabilityProfile } from './transportCapabilityModel.js';
import { assertShimeEcosystemInvariants } from './shimeEcosystemInvariants.js';
import { getShimeProductDoctrine, summarizeShimeProductDoctrine } from './productDoctrine.js';

export function runShimeEcosystemFusion(input = {}, options = {}) {
  const robotProfile = createRobotCapabilityProfile(input.robotProfile || {});
  const productDoctrine = getShimeProductDoctrine();
  const learningCapsule = createLearningStateCapsule({
    ...(input.fsrs || {}),
    sessionPhase: input.sessionPhase,
    companionIntent: input.companionDecision?.intent || input.companionIntent,
    allowedActionFamily: input.companionDecision?.recommendedRobotActionFamily || input.allowedActionFamily,
    safetyMode: input.safetyMode,
    transportHealth: input.transportHealth,
    robotAvailability: input.robotAvailability,
    privacyStatus: input.privacyStatus,
    reasonCodes: input.reasonCodes
  }, options);
  const capsuleValidation = validateLearningStateCapsule(learningCapsule);
  const transportPlan = planTransportBrain({
    ...(input.transport || {}),
    deviceCapabilities: robotProfile,
    privacyMode: learningCapsule.privacyStatus === 'blocked' ? 'raw' : 'redacted',
    userConsentState: input.transport?.userConsentState || 'not_requested'
  });
  const robotInterventionPlan = capsuleValidation.ok
    ? planRobotIntervention(learningCapsule, { robotProfile })
    : planRobotIntervention({ ...learningCapsule, privacyStatus: 'blocked' }, { robotProfile });
  const timetablePlan = planTimetableIntervention({
    ...learningCapsule,
    ...(input.timetable || {})
  });
  const safetyDecision = {
    safetyOutcome: capsuleValidation.ok && robotInterventionPlan.suggestedMotionPolicy === 'locked' ? 'allowed_dry_run' : 'blocked',
    appAuthorityPreserved: true,
    fsrsSchedulerAuthorityPreserved: true,
    safetyGovernorApplied: true,
    schedulerMutationAllowed: false,
    robotMayMutateStudyData: false,
    reasonCodes: [...new Set(['safety_governor_applied', ...capsuleValidation.failures, ...robotInterventionPlan.reasonCodes])]
  };
  const result = {
    fusedState: 'dry_run_ready',
    productDoctrineSummary: summarizeShimeProductDoctrine(productDoctrine),
    learningCapsule,
    fsrsSignalSummary: {
      memoryPressureBucket: learningCapsule.memoryPressureBucket,
      duePressureBucket: learningCapsule.duePressureBucket,
      retrievabilityBucket: learningCapsule.retrievabilityBucket,
      stabilityBucket: learningCapsule.stabilityBucket,
      difficultyBucket: learningCapsule.difficultyBucket,
      forgettingRiskBucket: learningCapsule.forgettingRiskBucket,
      reviewUrgencyBucket: learningCapsule.reviewUrgencyBucket,
      recoveryNeedBucket: learningCapsule.recoveryNeedBucket,
      habitMomentumBucket: learningCapsule.habitMomentumBucket,
      scheduleDriftBucket: learningCapsule.scheduleDriftBucket,
      sessionLoadBucket: learningCapsule.sessionLoadBucket,
      longTermProgressBucket: learningCapsule.longTermProgressBucket,
      robotSupportNeedBucket: learningCapsule.robotSupportNeedBucket,
      routineSupportNeedBucket: learningCapsule.routineSupportNeedBucket
    },
    companionDecision: input.companionDecision || { intent: learningCapsule.companionIntent, reasonCodes: ['companion_signal_coarse'] },
    robotInterventionPlan,
    timetablePlan,
    transportPlan,
    safetyDecision,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    evidenceSummary: {
      capsule: summarizeLearningStateCapsule(learningCapsule),
      interventionFamily: robotInterventionPlan.interventionFamily,
      routineRecommendation: timetablePlan.routineRecommendation,
      transportRecommendation: transportPlan.recommendation
    },
    reasonCodes: [...new Set(['fusion_completed', ...learningCapsule.reasonCodes, ...safetyDecision.reasonCodes])]
  };
  const invariants = assertShimeEcosystemInvariants(result);
  return { ...result, invariantStatus: invariants.ok ? 'pass' : 'fail', invariantFailures: invariants.failures };
}

export function summarizeShimeEcosystemFusion(result = {}) {
  return {
    memoryPressureBucket: result.learningCapsule?.memoryPressureBucket || 'unknown',
    forgettingRiskBucket: result.learningCapsule?.forgettingRiskBucket || 'unknown',
    recoveryNeedBucket: result.learningCapsule?.recoveryNeedBucket || 'unknown',
    robotInterventionFamily: result.robotInterventionPlan?.interventionFamily || 'do_nothing',
    timetableRecommendation: result.timetablePlan?.routineRecommendation || 'no_nudge',
    transportRecommendation: result.transportPlan?.recommendation || 'app_local_only',
    safetyOutcome: result.safetyDecision?.safetyOutcome || 'blocked',
    invariantStatus: result.invariantStatus || 'unknown',
    dryRunOnly: result.dryRunOnly === true,
    sendStatus: result.sendStatus || 'not_sent'
  };
}

export function createShimeFusionPanelSnapshot(result = {}) {
  return {
    mode: 'shime_ecosystem_fusion_dry_run',
    ...summarizeShimeEcosystemFusion(result),
    reasonCodes: [...(result.reasonCodes || [])]
  };
}
