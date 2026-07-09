import { computeSm2NextReview } from './sm2SchedulerAdapter.js';
import { computeFsrsBetaNextReview } from './fsrsBetaSchedulerAdapter.js';

export const SCHEDULER_COMPARISON_SCENARIOS = [
  ['new_card_good_recall', 0, 0, 2.2, 'good', 1, 0.9],
  ['new_card_bad_recall', 0, 0, 2.2, 'again', 1, 0.2],
  ['mature_card_good_recall', 21, 5, 2.4, 'good', 21, 0.9],
  ['mature_card_lapse', 30, 8, 2.1, 'again', 30, 0.55],
  ['overloaded_review_queue', 5, 3, 2.0, 'hard', 8, 0.6],
  ['sparse_history', 2, 1, 2.2, 'good', 2, 0.7],
  ['dense_history', 14, 12, 2.5, 'easy', 14, 0.95],
  ['inconsistent_user', 7, 6, 1.8, 'hard', 7, 0.5],
  ['cramming_pattern', 1, 10, 1.7, 'good', 1, 0.65],
  ['long_absence_return', 60, 4, 2.0, 'hard', 120, 0.45],
  ['low_energy_session', 3, 2, 2.1, 'again', 3, 0.4],
  ['high_review_pressure', 10, 5, 2.2, 'good', 10, 0.75]
].map(([scenarioId, interval, reps, ease, rating, elapsed, correctRate]) => ({
  scenarioId,
  input: {
    cardId: scenarioId,
    currentIntervalDays: interval,
    repetitionCount: reps,
    easeFactor: ease,
    lastReviewedAt: '2026-06-01T00:00:00.000Z',
    rating,
    elapsedDays: elapsed,
    localReviewHistorySummary: {
      totalReviews: reps,
      recentCorrectRate: correctRate,
      lapseCount: correctRate < 0.6 ? 2 : 0
    },
    schedulerState: {
      stability: Math.max(1, interval || 1),
      difficulty: correctRate < 0.6 ? 7 : 4
    }
  }
}));

function bucketDelta(delta) {
  const abs = Math.abs(delta);
  if (abs === 0) return 'same';
  if (abs <= 2) return delta > 0 ? 'slightly_later' : 'slightly_sooner';
  if (abs <= 14) return delta > 0 ? 'later' : 'sooner';
  return delta > 0 ? 'much_later' : 'much_sooner';
}

function compareScenario(scenario) {
  const sm2Output = computeSm2NextReview(scenario.input);
  const fsrsOutput = computeFsrsBetaNextReview(scenario.input);
  const delta = fsrsOutput.intervalDays - sm2Output.intervalDays;
  const riskCodes = ['OUTPUT_STABLE'];
  const fsrsLooksBetterCodes = [];
  const sm2SaferCodes = [];

  if (scenario.input.localReviewHistorySummary.totalReviews < 2) {
    riskCodes.push('INSUFFICIENT_HISTORY');
    sm2SaferCodes.push('SM2_BASELINE_SAFER');
  }
  if (delta >= 14) riskCodes.push('FSRS_TOO_AGGRESSIVE');
  if (delta <= -7) riskCodes.push('FSRS_TOO_CONSERVATIVE');
  if (fsrsOutput.workloadBucket === 'high' && sm2Output.workloadBucket !== 'high') riskCodes.push('DUE_COUNT_SPIKE');
  if (riskCodes.length === 1 && delta >= 1) fsrsLooksBetterCodes.push('FSRS_PROMISING_BETA');
  if (riskCodes.length > 1) sm2SaferCodes.push('SM2_BASELINE_SAFER', 'ROLLBACK_REQUIRED');

  return {
    scenarioId: scenario.scenarioId,
    sm2Output,
    fsrsOutput,
    intervalDeltaBucket: bucketDelta(delta),
    dueDateDeltaBucket: bucketDelta(delta),
    workloadDeltaBucket: sm2Output.workloadBucket === fsrsOutput.workloadBucket ? 'same' : 'changed',
    riskCodes,
    fsrsLooksBetterCodes,
    sm2SaferCodes,
    recommendation: sm2SaferCodes.length > 0 ? 'keep_sm2_for_this_scenario' : 'fsrs_beta_preview_ok'
  };
}

export function runSchedulerComparisonLab(scenarios = SCHEDULER_COMPARISON_SCENARIOS) {
  const scenarioResults = scenarios.map(compareScenario);
  const aggregate = {
    totalScenarios: scenarioResults.length,
    fsrsPromisingCount: scenarioResults.filter(result => result.fsrsLooksBetterCodes.includes('FSRS_PROMISING_BETA')).length,
    fsrsRiskCount: scenarioResults.filter(result => result.riskCodes.some(code => code !== 'OUTPUT_STABLE')).length,
    sm2SaferCount: scenarioResults.filter(result => result.sm2SaferCodes.includes('SM2_BASELINE_SAFER')).length,
    defaultRecommendation: 'keep_sm2_default_fsrs_beta'
  };
  return { scenarioResults, aggregate };
}
