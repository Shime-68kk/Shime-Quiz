import { describe, expect, it } from 'vitest';
import {
  fallbackToStableScheduler,
  getDefaultScheduler,
  getScheduler,
  listSchedulers,
  resolveUserSchedulerPreference
} from '../../src/scheduler/schedulerRegistry.js';
import { createPassingFsrsBetaEvidence } from '../../src/scheduler/fsrsReadinessGate.js';

describe('schedulerRegistry', () => {
  it('keeps SM2 as the default scheduler', () => {
    expect(getDefaultScheduler().schedulerId).toBe('sm2');
    expect(listSchedulers().map(scheduler => scheduler.schedulerId)).toEqual(['sm2', 'fsrs-beta']);
  });

  it('requires explicit FSRS beta preference and readiness', () => {
    expect(resolveUserSchedulerPreference({ schedulerPreference: 'fsrs-beta' }).activeSchedulerId).toBe('sm2');
    expect(resolveUserSchedulerPreference({
      schedulerPreference: 'fsrs-beta',
      fsrsBetaOptIn: true
    }, createPassingFsrsBetaEvidence()).activeSchedulerId).toBe('fsrs-beta');
  });

  it('falls back unknown or unsafe states to SM2', () => {
    expect(getScheduler('missing')).toBeNull();
    expect(fallbackToStableScheduler('missing').activeSchedulerId).toBe('sm2');
  });
});
