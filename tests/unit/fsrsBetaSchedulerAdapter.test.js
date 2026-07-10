import { describe, expect, it } from 'vitest';
import {
  computeFsrsBetaNextReview,
  fsrsBetaSchedulerAdapter,
  getFsrsBetaReadinessStatus
} from '../../src/scheduler/fsrsBetaSchedulerAdapter.js';
import { createPassingFsrsBetaEvidence } from '../../src/scheduler/fsrsReadinessGate.js';

const BASE_INPUT = {
  cardId: 'item-1',
  currentIntervalDays: 10,
  repetitionCount: 4,
  easeFactor: 2.2,
  lastReviewedAt: '2026-05-12T00:00:00.000Z',
  rating: 'good',
  elapsedDays: 10,
  localReviewHistorySummary: { totalReviews: 4, recentCorrectRate: 0.9, lapseCount: 0 },
  schedulerState: { stability: 10, difficulty: 4 }
};

describe('fsrsBetaSchedulerAdapter', () => {
  it('is beta, opt-in, local-only, and rollback-capable', () => {
    expect(fsrsBetaSchedulerAdapter).toMatchObject({
      schedulerId: 'fsrs-beta',
      stabilityLevel: 'beta',
      privacyClass: 'local_only',
      supportsRollback: true,
      requiresExplicitOptIn: true
    });
  });

  it('computes deterministic safe beta output', () => {
    const output = computeFsrsBetaNextReview(BASE_INPUT);
    expect(output).toEqual(computeFsrsBetaNextReview(BASE_INPUT));
    expect(output).toMatchObject({
      schedulerId: 'fsrs-beta',
      migrationSafe: true,
      rollbackHint: 'rollback_to_sm2_available'
    });
    expect(JSON.stringify(output)).not.toMatch(/question|answer|prompt/i);
  });

  it('returns readiness status without making FSRS default', () => {
    expect(getFsrsBetaReadinessStatus(createPassingFsrsBetaEvidence()))
      .toBe('fsrs_beta_ready_for_internal_testing');
    expect(getFsrsBetaReadinessStatus({ noNegativeIntervalPass: false })).toBe('fsrs_beta_blocked');
  });
});
