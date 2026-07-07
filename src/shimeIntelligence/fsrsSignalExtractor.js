import {
  bucketCompletionQuality,
  bucketDifficulty,
  bucketDuePressure,
  bucketForgettingRisk,
  bucketHabitMomentum,
  bucketLongTermProgress,
  bucketRecoveryNeed,
  bucketRetrievability,
  bucketRobotSupportNeed,
  bucketScheduleDrift,
  bucketRoutineSupportNeed,
  bucketSessionLoad,
  bucketStability
} from './memoryStateBuckets.js';
import { findSensitiveKeys } from './shimeEcosystemInvariants.js';

function n(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.max(0, number) : 0;
}

export function extractFsrsMemorySignals(input = {}) {
  const sensitive = findSensitiveKeys(input);
  if (sensitive.length > 0) {
    return {
      memoryPressureBucket: 'unknown',
      duePressureBucket: 'unknown',
      retrievabilityBucket: 'unknown',
      stabilityBucket: 'unknown',
      difficultyBucket: 'unknown',
      forgettingRiskBucket: 'unknown',
      reviewUrgencyBucket: 'unknown',
      recoveryNeedBucket: 'unknown',
      habitMomentumBucket: 'unknown',
      scheduleDriftBucket: 'unknown',
      sessionLoadBucket: 'unknown',
      longTermProgressBucket: 'unknown',
      robotSupportNeedBucket: 'none',
      routineSupportNeedBucket: 'none',
      recommendedSessionMode: 'blocked',
      confidenceBucket: 'low',
      reasonCodes: ['sensitive_input_blocked']
    };
  }

  const duePressureBucket = bucketDuePressure(input);
  const retrievabilityBucket = bucketRetrievability(input.retrievability);
  const stabilityBucket = bucketStability(input.stability);
  const difficultyBucket = bucketDifficulty(input.difficulty);
  const completionQualityBucket = bucketCompletionQuality(input);
  const scheduleDriftBucket = bucketScheduleDrift(input);
  const recoveryNeedBucket = bucketRecoveryNeed({ ...input, completionQualityBucket });
  const habitMomentumBucket = bucketHabitMomentum({ ...input, scheduleDriftBucket });
  const sessionLoadBucket = bucketSessionLoad(input);
  const longTermProgressBucket = bucketLongTermProgress(input);
  const forgettingRiskBucket = bucketForgettingRisk({ duePressureBucket, retrievabilityBucket, stabilityBucket, difficultyBucket });
  const memoryPressureBucket = ['very_high', 'high'].includes(forgettingRiskBucket) || ['very_high', 'high'].includes(duePressureBucket)
    ? 'high'
    : duePressureBucket === 'none'
      ? 'none'
      : 'medium';
  const reviewUrgencyBucket = duePressureBucket === 'very_high' ? 'very_high' : duePressureBucket;
  const recommendedSessionMode = recoveryNeedBucket === 'high'
    ? 'recovery_review'
    : ['high', 'very_high'].includes(reviewUrgencyBucket)
      ? 'review_due'
      : forgettingRiskBucket === 'high'
        ? 'memory_risk_review'
        : 'balanced';
  const reasonCodes = ['fsrs_signal_extracted'];
  if (n(input.dueCount) > 0) reasonCodes.push('due_items_present');
  if (n(input.overdueCount) > 0) reasonCodes.push('overdue_items_present');
  if (forgettingRiskBucket === 'high' || forgettingRiskBucket === 'very_high') reasonCodes.push('memory_risk_detected');
  const robotSupportNeedBucket = bucketRobotSupportNeed({ ...input, duePressureBucket, forgettingRiskBucket, recoveryNeedBucket, sessionPhase: input.sessionPhase, longTermProgressBucket });
  const routineSupportNeedBucket = bucketRoutineSupportNeed({ ...input, duePressureBucket, scheduleDriftBucket, sessionLoadBucket });

  return {
    memoryPressureBucket,
    duePressureBucket,
    retrievabilityBucket,
    stabilityBucket,
    difficultyBucket,
    forgettingRiskBucket,
    reviewUrgencyBucket,
    recoveryNeedBucket,
    habitMomentumBucket,
    scheduleDriftBucket,
    sessionLoadBucket,
    longTermProgressBucket,
    robotSupportNeedBucket,
    routineSupportNeedBucket,
    recommendedSessionMode,
    confidenceBucket: retrievabilityBucket === 'unknown' && stabilityBucket === 'unknown' ? 'medium' : 'high',
    reasonCodes
  };
}
