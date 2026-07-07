export const SHIME_BUCKETS = Object.freeze(['none', 'very_low', 'low', 'medium', 'high', 'very_high', 'unknown']);

function finite(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function count(value) {
  const number = finite(value);
  return number === null ? 0 : Math.max(0, Math.floor(number));
}

export function bucketRetrievability(value) {
  const number = finite(value);
  if (number === null || number < 0) return 'unknown';
  if (number < 0.35) return 'very_low';
  if (number < 0.55) return 'low';
  if (number < 0.75) return 'medium';
  if (number < 0.9) return 'high';
  return 'very_high';
}

export function bucketStability(value) {
  const number = finite(value);
  if (number === null || number < 0) return 'unknown';
  if (number === 0) return 'none';
  if (number < 2) return 'very_low';
  if (number < 7) return 'low';
  if (number < 21) return 'medium';
  if (number < 60) return 'high';
  return 'very_high';
}

export function bucketDifficulty(value) {
  const number = finite(value);
  if (number === null || number < 0) return 'unknown';
  if (number < 2) return 'very_low';
  if (number < 4) return 'low';
  if (number < 6) return 'medium';
  if (number < 8) return 'high';
  return 'very_high';
}

export function bucketDuePressure(counts = {}) {
  const due = count(counts.dueCount) + count(counts.overdueCount);
  if (due <= 0) return 'none';
  if (due <= 3) return 'low';
  if (due <= 10) return 'medium';
  if (due <= 30) return 'high';
  return 'very_high';
}

export function bucketForgettingRisk(signals = {}) {
  if (signals.retrievabilityBucket === 'very_low' || signals.difficultyBucket === 'very_high') return 'very_high';
  if (signals.retrievabilityBucket === 'low' || signals.duePressureBucket === 'very_high') return 'high';
  if (signals.duePressureBucket === 'high' || signals.stabilityBucket === 'very_low') return 'medium';
  if (signals.retrievabilityBucket === 'high' || signals.retrievabilityBucket === 'very_high') return 'low';
  return 'unknown';
}

export function bucketScheduleDrift(signals = {}) {
  const overdue = count(signals.overdueCount);
  if (overdue <= 0) return 'none';
  if (overdue <= 2) return 'low';
  if (overdue <= 7) return 'medium';
  if (overdue <= 20) return 'high';
  return 'very_high';
}

export function bucketRecoveryNeed(signals = {}) {
  const lapses = count(signals.lapseCount);
  if (signals.completionQualityBucket === 'low' || lapses >= 5) return 'high';
  if (signals.recentReviewResultBucket === 'mostly_missed' || lapses >= 2) return 'medium';
  if (signals.recentReviewResultBucket === 'mixed') return 'low';
  return 'none';
}

export function bucketHabitMomentum(signals = {}) {
  const streak = count(signals.reviewStreak);
  const drift = signals.scheduleDriftBucket;
  if (drift === 'high' || drift === 'very_high') return 'low';
  if (streak >= 7) return 'very_high';
  if (streak >= 3) return 'high';
  if (streak >= 1) return 'medium';
  return 'unknown';
}

export function bucketCompletionQuality(signals = {}) {
  if (['low', 'mixed', 'high', 'unknown'].includes(signals.completionQualityBucket)) return signals.completionQualityBucket;
  const correct = count(signals.correctCount);
  const wrong = count(signals.wrongCount);
  const total = correct + wrong;
  if (total <= 0) return 'unknown';
  const ratio = correct / total;
  if (ratio >= 0.8) return 'high';
  if (ratio >= 0.5) return 'mixed';
  return 'low';
}

export function bucketSessionLoad(signals = {}) {
  const total = count(signals.totalCount ?? signals.sessionItemCount ?? signals.dueCount);
  if (total <= 0) return 'none';
  if (total <= 5) return 'low';
  if (total <= 15) return 'medium';
  if (total <= 35) return 'high';
  return 'very_high';
}

export function bucketLongTermProgress(signals = {}) {
  const stability = finite(signals.averageStability ?? signals.stability);
  const streak = count(signals.reviewStreak);
  if (stability === null && streak <= 0) return 'unknown';
  if (stability >= 60 || streak >= 14) return 'very_high';
  if (stability >= 21 || streak >= 7) return 'high';
  if (stability >= 7 || streak >= 3) return 'medium';
  if (stability >= 1 || streak >= 1) return 'low';
  return 'none';
}

export function bucketRobotSupportNeed(signals = {}) {
  if (signals.privacyStatus === 'blocked') return 'none';
  if (['high', 'very_high'].includes(signals.recoveryNeedBucket)) return 'high';
  if (['high', 'very_high'].includes(signals.duePressureBucket) || ['high', 'very_high'].includes(signals.forgettingRiskBucket)) return 'medium';
  if (signals.sessionPhase === 'complete' && ['high', 'very_high'].includes(signals.longTermProgressBucket)) return 'low';
  return 'none';
}

export function bucketRoutineSupportNeed(signals = {}) {
  if (signals.safetyMode === 'quiet_mode') return 'none';
  if (['high', 'very_high'].includes(signals.scheduleDriftBucket)) return 'high';
  if (['high', 'very_high'].includes(signals.duePressureBucket) || ['high', 'very_high'].includes(signals.sessionLoadBucket)) return 'medium';
  if (signals.duePressureBucket === 'low') return 'low';
  return 'none';
}
