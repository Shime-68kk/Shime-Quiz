export {
  BUCKETS,
  COMPANION_CONTEXT_VERSION,
  FORBIDDEN_COMPANION_KEYS,
  collectForbiddenCompanionKeys,
  createDefaultCompanionContext,
  validateCompanionContext
} from './companionContextSchema.js';
export { COMPANION_LEARNING_EVENT_TYPES, reduceLearningSignal } from './learningSignalReducer.js';
export { reduceRobotPresenceSignal } from './robotPresenceSignalReducer.js';
export { createCompanionDecision } from './companionPolicyEngine.js';
export { planRobotIntent, SAFE_ROBOT_COMMANDS } from './robotIntentPlanner.js';
export { governCompanionDecision } from './safetyGovernor.js';
export { PREMIUM_EXPERIENCE_PROFILES, getPremiumExperienceProfile } from './premiumExperienceProfiles.js';
export {
  createInitialCompanionBridgeState,
  processDeviceBridgeEvent,
  processDeviceBridgeEventSequence,
  getCompanionBridgeSnapshot
} from './companionBridgePipeline.js';
export {
  COMPANION_ROBOT_PROTOCOL_VERSION,
  createCompanionRobotCommandEnvelope
} from './companionRobotProtocolAdapter.js';
export {
  createCompanionTranscriptEntry,
  createCompanionTranscript,
  formatCompanionTranscript
} from './companionTranscriptBuilder.js';
export { createCompanionSimulationReport } from './companionSimulationReport.js';
export {
  COMPANION_DEV_TAP_FORBIDDEN_KEYS,
  COMPANION_DEV_TAP_MODES,
  COMPANION_DEV_TAP_PRIVACY_MODES,
  COMPANION_DEV_TAP_STATES,
  createCompanionDevTapSnapshot
} from './companionDevTapContract.js';
export { createCompanionDevTap } from './companionDevTap.js';
export {
  clearSharedCompanionLiveDevTapTranscript,
  createCompanionDevTapRuntime,
  disableSharedCompanionLiveDevTap,
  enableSharedCompanionLiveDevTap,
  getSharedCompanionLiveDevTapRuntime,
  getSharedCompanionLiveDevTapSnapshot,
  resetSharedCompanionLiveDevTapForTests,
  subscribeSharedCompanionLiveDevTap
} from './companionDevTapRuntime.js';
export {
  createInitialCompanionSessionState,
  getCompanionSessionSnapshot,
  reduceCompanionSessionEvent,
  resetCompanionSessionState
} from './companionSessionModel.js';
export {
  createInitialBehaviorMemory,
  rememberCompanionBehavior,
  resetBehaviorMemory,
  shouldSuppressBehavior
} from './companionBehaviorMemory.js';
export { applyCompanionHysteresis } from './companionHysteresis.js';
export { COMPANION_V2_INTENTS, createAdaptiveCompanionDecision } from './companionAdaptivePolicy.js';
export { scoreCompanionBehavior } from './companionQualityScoring.js';
export {
  auditCompanionDecisionSequence,
  auditContainsForbiddenData
} from './companionDecisionAudit.js';
export {
  runCompanionReplayBenchmark,
  runCompanionReplayScenario
} from './companionReplayBenchmark.js';
export {
  COMPANION_V2_ALLOWED_COMMANDS,
  COMPANION_V2_FORBIDDEN_OUTPUT_KEYS,
  assertCompanionDecisionInvariants,
  checkCompanionOutputForSensitiveData,
  checkCompanionReplayInvariants,
  summarizeInvariantFailures
} from './companionInvariants.js';
export {
  COMPANION_ADVERSARIAL_SCENARIO_TYPES,
  generateCompanionAdversarialScenarios
} from './companionAdversarialGenerator.js';
export {
  createCompanionGoldenReplay,
  createCompanionGoldenSnapshot
} from './companionGoldenReplay.js';
export {
  COMPANION_V2_REQUIRED_COVERAGE_CLASSES,
  analyzeCompanionScenarioCoverage
} from './companionScenarioCoverage.js';
export { evaluateCompanionV2Readiness } from './companionV2ReadinessGate.js';
export { compareCompanionPolicies } from './companionPolicyComparison.js';
