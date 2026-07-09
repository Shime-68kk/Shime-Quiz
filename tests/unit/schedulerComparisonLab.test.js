import { describe, expect, it } from 'vitest';
import {
  SCHEDULER_COMPARISON_SCENARIOS,
  runSchedulerComparisonLab
} from '../../src/scheduler/schedulerComparisonLab.js';

describe('schedulerComparisonLab', () => {
  it('runs the required deterministic scenario matrix', () => {
    const result = runSchedulerComparisonLab();
    expect(SCHEDULER_COMPARISON_SCENARIOS.map(s => s.scenarioId)).toEqual([
      'new_card_good_recall',
      'new_card_bad_recall',
      'mature_card_good_recall',
      'mature_card_lapse',
      'overloaded_review_queue',
      'sparse_history',
      'dense_history',
      'inconsistent_user',
      'cramming_pattern',
      'long_absence_return',
      'low_energy_session',
      'high_review_pressure'
    ]);
    expect(result.aggregate).toMatchObject({
      totalScenarios: 12,
      defaultRecommendation: 'keep_sm2_default_fsrs_beta'
    });
  });

  it('does not declare FSRS globally better', () => {
    const result = runSchedulerComparisonLab();
    expect(result.aggregate.fsrsRiskCount).toBeGreaterThan(0);
    expect(result.aggregate.sm2SaferCount).toBeGreaterThan(0);
  });
});
