import { afterEach, describe, expect, it } from 'vitest';
import { validateSchedulerAdapter } from '../../src/scheduler/schedulerAdapterContract.js';
import {
  getScheduler,
  listSchedulers,
  registerScheduler,
  resetSchedulerRegistryForTest,
  unregisterScheduler
} from '../../src/scheduler/schedulerRegistry.js';
import { sm2SchedulerAdapter } from '../../src/scheduler/sm2SchedulerAdapter.js';
import {
  getSchedulerRetrievability,
  migrateSchedulerRecord,
  scheduleRecordWithKernel
} from '../../src/scheduler/schedulerKernel.js';
import { scheduleReview } from '../../src/quiz/reviewSchedulerAdapter.js';

function futureAdapter(overrides = {}) {
  return {
    schedulerId: 'leitner-beta',
    schedulerVersion: 'leitner-beta-v1',
    stateSchemaVersion: 1,
    decisionCodePrefix: 'LEITNER_',
    stabilityLevel: 'beta',
    privacyClass: 'local_only',
    supportsRollback: true,
    requiresExplicitOptIn: true,
    capabilities: ['schedule', 'due-cards', 'workload', 'explain', 'retrievability'],
    migrateState(state = {}) {
      return { ...state, schemaVersion: 1, algorithmState: state.algorithmState || { box: 1 } };
    },
    computeNextReview(input) {
      if (input.schedulerState?.algorithmState?.crash === true) throw new Error('injected failure');
      const box = Math.min(5, Number(input.schedulerState?.algorithmState?.box || 1) + 1);
      const due = new Date(input.reviewedAt);
      due.setUTCDate(due.getUTCDate() + box);
      return {
        schedulerId: 'leitner-beta',
        nextReviewAt: due.toISOString(),
        intervalDays: box,
        easeFactor: input.easeFactor,
        decisionCodes: ['LEITNER_NEXT_BOX', 'LOCAL_ONLY'],
        migrationSafe: true,
        schedulerState: { schemaVersion: 1, algorithmState: { box } }
      };
    },
    computeDueCards({ cards = [], now = new Date() } = {}) {
      const time = new Date(now).getTime();
      return cards.filter(card => new Date(card.dueAt).getTime() <= time);
    },
    summarizeWorkload(input = {}) {
      return { schedulerId: 'leitner-beta', dueCount: this.computeDueCards(input).length };
    },
    validateInput() { return true; },
    explainDecision() { return { schedulerId: 'leitner-beta', decisionCodes: ['LEITNER_NEXT_BOX'] }; },
    getRetrievability(record) {
      return Number(record.schedulerState?.algorithmState?.retrievability ?? 0.42);
    },
    ...overrides
  };
}

const BASE_RECORD = {
  itemId: 'future-card',
  lastReviewedAt: '2026-05-01T00:00:00.000Z',
  dueAt: '2026-05-02T00:00:00.000Z',
  intervalDays: 1,
  repetitionCount: 1,
  easeFactor: 2.2,
  correctStreak: 1,
  wrongCount: 0
};

afterEach(() => resetSchedulerRegistryForTest());

describe('Scheduler Kernel v2 plug-and-play boundary', () => {
  it('keeps SM-2 registered as an immutable fallback', () => {
    expect(Object.isFrozen(sm2SchedulerAdapter)).toBe(true);
    expect(unregisterScheduler('sm2')).toBe(false);
    expect(() => registerScheduler({ ...sm2SchedulerAdapter, schedulerVersion: 'hostile' }, { replace: true }))
      .toThrow(/cannot be replaced/i);
    expect(getScheduler('sm2')).toBe(sm2SchedulerAdapter);
  });

  it('accepts a conforming future adapter without changing the kernel', () => {
    const adapter = registerScheduler(futureAdapter());
    expect(validateSchedulerAdapter(adapter)).toMatchObject({ ok: true, adapterId: 'leitner-beta' });
    expect(listSchedulers().find(item => item.schedulerId === 'leitner-beta')).toMatchObject({
      stateSchemaVersion: 1,
      capabilities: expect.arrayContaining(['schedule', 'retrievability'])
    });

    const result = scheduleRecordWithKernel({
      record: { ...BASE_RECORD, schedulerId: 'leitner-beta' },
      outcome: 'correct',
      context: { now: '2026-05-10T00:00:00.000Z' }
    });

    expect(result).toMatchObject({
      schedulerId: 'leitner-beta',
      schedulerAdapterVersion: 'leitner-beta-v1',
      schedulerStateSchemaVersion: 1,
      intervalDays: 2,
      repetitionCount: 2
    });
    expect(result.schedulerState.algorithmState.box).toBe(2);
    expect(result.fallbackSnapshot.schedulerId).toBe('sm2');
    expect(result.fsrsPayload).toBeUndefined();
  });

  it('routes a registered future record through the production review entry point', () => {
    registerScheduler(futureAdapter());
    const result = scheduleReview(
      { ...BASE_RECORD, schedulerId: 'leitner-beta' },
      'correct',
      { now: '2026-05-10T00:00:00.000Z' }
    );
    expect(result.schedulerId).toBe('leitner-beta');
    expect(result.fallbackSnapshot.schedulerId).toBe('sm2');
  });

  it('falls back atomically to the SM-2 shadow when an adapter throws', () => {
    registerScheduler(futureAdapter());
    const result = scheduleRecordWithKernel({
      record: {
        ...BASE_RECORD,
        schedulerId: 'leitner-beta',
        schedulerState: { algorithmState: { crash: true } }
      },
      outcome: 'correct',
      context: { now: '2026-05-10T00:00:00.000Z' }
    });

    expect(result.schedulerId).toBe('sm2');
    expect(result.schedulerFallbackReason).toBe('adapter_failure:leitner-beta');
    expect(new Date(result.dueAt).getTime()).toBeGreaterThan(new Date(result.lastReviewedAt).getTime());
  });

  it('falls back safely after a previously used adapter is unplugged', () => {
    registerScheduler(futureAdapter());
    unregisterScheduler('leitner-beta');
    const result = scheduleRecordWithKernel({
      record: { ...BASE_RECORD, schedulerId: 'leitner-beta' },
      outcome: 'wrong',
      context: { now: '2026-05-10T00:00:00.000Z' }
    });

    expect(result.schedulerId).toBe('sm2');
    expect(result.schedulerFallbackReason).toBe('unknown_scheduler');
  });

  it('migrates unknown state to SM-2 without discarding its legacy identifier', () => {
    const migrated = migrateSchedulerRecord({
      ...BASE_RECORD,
      schedulerId: 'future-missing',
      schedulerState: { algorithmState: { opaque: 7 } }
    });
    expect(migrated).toMatchObject({
      schedulerId: 'sm2',
      legacySchedulerId: 'future-missing',
      schedulerFallbackReason: 'unknown_scheduler_migration'
    });
    expect(migrated.schedulerState.algorithmState.opaque).toBe(7);
  });

  it('queries optional capabilities without coupling callers to an algorithm', () => {
    registerScheduler(futureAdapter());
    expect(getSchedulerRetrievability({
      ...BASE_RECORD,
      schedulerId: 'leitner-beta',
      schedulerState: { algorithmState: { retrievability: 0.17 } }
    })).toBe(0.17);
    expect(getSchedulerRetrievability({ ...BASE_RECORD, schedulerId: 'sm2' })).toBeNull();
  });
});
