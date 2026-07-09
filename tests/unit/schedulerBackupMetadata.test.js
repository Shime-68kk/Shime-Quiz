import { describe, expect, it } from 'vitest';
import {
  assertSchedulerMetadataHasNoRawContent,
  createSchedulerBackupMetadata,
  importSchedulerBackupMetadata
} from '../../src/scheduler/schedulerBackupMetadata.js';

describe('schedulerBackupMetadata', () => {
  it('exports safe scheduler metadata without raw content', () => {
    const metadata = createSchedulerBackupMetadata({ activeSchedulerId: 'fsrs-beta', betaEnabled: true });
    expect(metadata).toMatchObject({
      activeSchedulerId: 'fsrs-beta',
      defaultSchedulerId: 'sm2',
      rollbackSchedulerId: 'sm2',
      fsrsCanBeDefault: false,
      rawContentIncluded: false
    });
    expect(assertSchedulerMetadataHasNoRawContent(metadata)).toBe(true);
  });

  it('falls back unknown imported scheduler metadata to SM2', () => {
    expect(importSchedulerBackupMetadata({ activeSchedulerId: 'future-algorithm' })).toMatchObject({
      ok: true,
      activeSchedulerId: 'sm2',
      fallbackReason: 'unknown_scheduler_fallback'
    });
  });

  it('rejects raw content markers in metadata', () => {
    expect(() => assertSchedulerMetadataHasNoRawContent({ question: 'raw' })).toThrow(/question/);
  });
});
