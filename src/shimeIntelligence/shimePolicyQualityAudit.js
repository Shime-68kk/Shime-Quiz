import { runShimeEcosystemFusion } from './appRobotFusionEngine.js';
import { selectRobotPolicyFromFsrsSignals, selectTimetablePolicyFromFsrsSignals } from './fsrsRobotPolicyMatrix.js';

function addIssue(list, condition, code, detail) {
  if (condition) list.push({ code, detail });
}

export function runShimePolicyQualityAudit(options = {}) {
  const riskyMappings = [];
  const missingMappings = [];
  const recommendedFixes = [];

  const highDue = selectRobotPolicyFromFsrsSignals({ duePressureBucket: 'high', recoveryNeedBucket: 'none' });
  const lapse = selectRobotPolicyFromFsrsSignals({ recoveryNeedBucket: 'high', duePressureBucket: 'medium' });
  const stability = selectRobotPolicyFromFsrsSignals({ stabilityBucket: 'high' });
  const memoryRisk = selectRobotPolicyFromFsrsSignals({ retrievabilityBucket: 'low', forgettingRiskBucket: 'high' });
  const quiet = selectTimetablePolicyFromFsrsSignals({ duePressureBucket: 'high' }, { quietMode: true });
  const classroom = selectRobotPolicyFromFsrsSignals({ duePressureBucket: 'high' }, { classroomSafe: true });
  const privacy = runShimeEcosystemFusion({ fsrs: { question: 'blocked' } });
  const transport = runShimeEcosystemFusion({ fsrs: { dueCount: 5, retrievability: 0.5, stability: 3, difficulty: 5 }, transportHealth: 'disconnected' });
  const robotUnavailable = runShimeEcosystemFusion({ fsrs: { dueCount: 5, retrievability: 0.5, stability: 3, difficulty: 5 }, robotAvailability: 'offline' });
  const appUnavailable = runShimeEcosystemFusion({ fsrs: { dueCount: 0, retrievability: 0.8, stability: 20, difficulty: 3 }, sessionPhase: 'idle', transportHealth: 'disabled' });
  const timetable = runShimeEcosystemFusion({ fsrs: { dueCount: 20, overdueCount: 5, retrievability: 0.4, stability: 3, difficulty: 6 } });

  addIssue(riskyMappings, highDue.robotPolicy !== 'review_due_nudge', 'high_due_not_calm_nudge', highDue.robotPolicy);
  addIssue(riskyMappings, ['shame', 'pressure'].includes(highDue.robotPolicy), 'high_due_pressure_or_shame', highDue.robotPolicy);
  addIssue(riskyMappings, lapse.robotPolicy !== 'gentle_encourage', 'repeated_lapse_not_recovery_support', lapse.robotPolicy);
  addIssue(riskyMappings, stability.robotPolicy !== 'celebrate_stability_gain', 'stability_gain_not_prioritized', stability.robotPolicy);
  addIssue(riskyMappings, memoryRisk.robotPolicy !== 'memory_risk_nudge', 'low_retrievability_not_memory_support', memoryRisk.robotPolicy);
  addIssue(riskyMappings, quiet.timetablePolicy !== 'protect_rest', 'quiet_mode_not_protecting_rest', quiet.timetablePolicy);
  addIssue(riskyMappings, classroom.intensityPolicy !== 'reduced', 'classroom_not_reduced_intensity', classroom.intensityPolicy);
  addIssue(riskyMappings, privacy.learningCapsule.privacyStatus !== 'blocked', 'privacy_unsafe_not_blocked', privacy.learningCapsule.privacyStatus);
  addIssue(riskyMappings, !['reconnect_hint', 'neutral_presence'].includes(transport.robotInterventionPlan.interventionFamily), 'transport_unsafe_not_neutral_or_reconnect', transport.robotInterventionPlan.interventionFamily);
  addIssue(riskyMappings, robotUnavailable.fusedState !== 'dry_run_ready' || robotUnavailable.robotInterventionPlan.interventionFamily !== 'do_nothing', 'robot_unavailable_blocks_app_or_not_neutral', robotUnavailable.robotInterventionPlan.interventionFamily);
  addIssue(riskyMappings, appUnavailable.robotInterventionPlan.interventionFamily !== 'reconnect_hint' && appUnavailable.robotInterventionPlan.interventionFamily !== 'neutral_presence', 'app_unavailable_not_neutral', appUnavailable.robotInterventionPlan.interventionFamily);
  addIssue(riskyMappings, timetable.timetablePlan.scheduleMutationAllowed !== false || timetable.timetablePlan.notificationAllowed !== false || timetable.timetablePlan.calendarMutationAllowed !== false, 'timetable_not_suggestion_only', timetable.timetablePlan.routineRecommendation);

  [
    ['high_due_pressure', highDue],
    ['repeated_lapse', lapse],
    ['stability_gain', stability],
    ['memory_risk', memoryRisk],
    ['quiet_mode', quiet],
    ['classroom_safe', classroom]
  ].forEach(([name, selection]) => {
    addIssue(missingMappings, !Array.isArray(selection.reasonCodes) || selection.reasonCodes.length === 0, `missing_reason_codes:${name}`, selection);
  });

  if (riskyMappings.length > 0) recommendedFixes.push('Harden FSRS robot policy matrix and intervention planner mappings.');
  if (missingMappings.length > 0) recommendedFixes.push('Add reason codes for all policy selections.');
  if (options.requireTransportDiversity === true) recommendedFixes.push('Add richer transport recommendation evidence before real transport QA.');

  const penalty = riskyMappings.length * 15 + missingMappings.length * 5 + recommendedFixes.length;
  const policyQualityScore = Math.max(0, 100 - penalty);
  const overallStatus = riskyMappings.length > 0 ? 'FAIL' : missingMappings.length > 0 ? 'WARN' : 'PASS';

  return {
    policyQualityScore,
    riskyMappings,
    missingMappings,
    recommendedFixes,
    overallStatus,
    dryRunOnly: true,
    sendStatus: 'not_sent',
    reasonCodes: ['shime_policy_quality_audit_completed']
  };
}
