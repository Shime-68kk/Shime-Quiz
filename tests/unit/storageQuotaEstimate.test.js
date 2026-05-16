import { describe, expect, it, afterEach } from 'vitest';
import {
  normalizeStorageQuotaEstimate,
  getStorageQuotaWarningState,
  getLargeImportItemCountWarning,
  LARGE_IMPORT_ITEM_THRESHOLD
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

describe('large import item count warning helper', () => {
  it('returns isLarge=true when itemCount meets the threshold', () => {
    const result = getLargeImportItemCountWarning(LARGE_IMPORT_ITEM_THRESHOLD);
    expect(result.isLarge).toBe(true);
    expect(result.itemCount).toBe(LARGE_IMPORT_ITEM_THRESHOLD);
  });

  it('returns isLarge=true for counts well above the threshold', () => {
    expect(getLargeImportItemCountWarning(200)).toMatchObject({ isLarge: true, itemCount: 200 });
  });

  it('returns isLarge=false when itemCount is below the threshold', () => {
    expect(getLargeImportItemCountWarning(10)).toMatchObject({ isLarge: false, itemCount: 10 });
  });

  it('returns isLarge=false for 0 items', () => {
    expect(getLargeImportItemCountWarning(0)).toMatchObject({ isLarge: false, itemCount: 0 });
  });

  it('returns isLarge=false and does not throw for invalid inputs', () => {
    expect(getLargeImportItemCountWarning(-1)).toMatchObject({ isLarge: false });
    expect(getLargeImportItemCountWarning(null)).toMatchObject({ isLarge: false });
    expect(getLargeImportItemCountWarning(NaN)).toMatchObject({ isLarge: false });
    expect(getLargeImportItemCountWarning('lots')).toMatchObject({ isLarge: false });
    expect(getLargeImportItemCountWarning(undefined)).toMatchObject({ isLarge: false });
  });

  it('does not change import semantics — isLarge is advisory only', () => {
    const large = getLargeImportItemCountWarning(100);
    const small = getLargeImportItemCountWarning(5);
    expect(large).not.toHaveProperty('blocked');
    expect(large).not.toHaveProperty('prevented');
    expect(small).not.toHaveProperty('blocked');
  });
});
