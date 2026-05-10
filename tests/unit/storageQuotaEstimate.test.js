import { describe, expect, it, afterEach } from 'vitest';
import {
  normalizeStorageQuotaEstimate,
  getStorageQuotaWarningState
} from '../../src/utils/storageQuotaEstimate.js';

describe('storage quota estimate helpers', () => {
  afterEach(() => {
    delete globalThis.navigator;
  });

  it('marks high valid usage as warning-worthy', () => {
    const result = normalizeStorageQuotaEstimate({ usage: 75, quota: 100 });

    expect(result.ok).toBe(true);
    expect(result.shouldWarn).toBe(true);
    expect(result.percent).toBe(75);
  });

  it('ignores invalid or impossible estimates without warning', () => {
    expect(normalizeStorageQuotaEstimate({ usage: 101, quota: 100 })).toMatchObject({ ok: false, shouldWarn: false });
    expect(normalizeStorageQuotaEstimate({ usage: 0, quota: 100 })).toMatchObject({ ok: false, shouldWarn: false });
    expect(normalizeStorageQuotaEstimate({ usage: 50, quota: 0 })).toMatchObject({ ok: false, shouldWarn: false });
  });

  it('returns unavailable state when browser storage estimate API is missing', async () => {
    globalThis.navigator = {};

    await expect(getStorageQuotaWarningState()).resolves.toEqual({ available: false, shouldWarn: false });
  });

  it('uses navigator.storage.estimate when available', async () => {
    globalThis.navigator = {
      storage: {
        estimate: async () => ({ usage: 90, quota: 100 })
      }
    };

    await expect(getStorageQuotaWarningState()).resolves.toMatchObject({
      available: true,
      shouldWarn: true,
      percent: 90
    });
  });
});
