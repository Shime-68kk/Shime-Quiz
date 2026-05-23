import { describe, expect, it } from 'vitest';
import {
  BACKUP_HEALTH_STATE,
  BACKUP_HEALTH_STATE_LABELS,
  DEFAULT_STALE_THRESHOLD_MS,
  deriveBackupHealthState,
} from '../../src/state/backupHealthTestOnlyPrototype.js';

// All fixture data is generated/synthetic — no real learner data.

const NOW = 1_700_000_000_000; // fixed synthetic epoch ms
const RECENT_MS = NOW - 1 * 24 * 60 * 60 * 1000; // 1 day ago (recent)
const STALE_MS = NOW - 10 * 24 * 60 * 60 * 1000; // 10 days ago (stale)
const FUTURE_MS = NOW + 5 * 24 * 60 * 60 * 1000; // 5 days in future

const opts = { currentTimeMs: NOW };

describe('deriveBackupHealthState — unknown / no signal', () => {
  it('returns unknown when input is null', () => {
    expect(deriveBackupHealthState(null, opts)).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('returns unknown when input is undefined', () => {
    expect(deriveBackupHealthState(undefined, opts)).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('returns unknown when called with no arguments', () => {
    expect(deriveBackupHealthState()).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });
});

describe('deriveBackupHealthState — no backup recorded', () => {
  it('returns no_backup_recorded for empty signal object', () => {
    expect(deriveBackupHealthState({}, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('returns no_backup_recorded when only unrelated fields are present', () => {
    expect(deriveBackupHealthState({ someOtherField: true }, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });
});

describe('deriveBackupHealthState — recent manual backup', () => {
  it('returns recent_manual_backup when backup is within threshold', () => {
    const signals = { manualBackupExportedAtMs: RECENT_MS };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('treats a future timestamp as recent (safe fallback)', () => {
    const signals = { manualBackupExportedAtMs: FUTURE_MS };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('treats backup exactly at threshold as recent', () => {
    const signals = { manualBackupExportedAtMs: NOW - DEFAULT_STALE_THRESHOLD_MS };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });
});

describe('deriveBackupHealthState — stale manual backup', () => {
  it('returns backup_may_be_stale when backup exceeds threshold', () => {
    const signals = { manualBackupExportedAtMs: STALE_MS };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });

  it('uses custom stale threshold when provided', () => {
    const signals = { manualBackupExportedAtMs: NOW - 2 * 24 * 60 * 60 * 1000 }; // 2 days ago
    const customOpts = { currentTimeMs: NOW, staleThresholdMs: 1 * 24 * 60 * 60 * 1000 }; // 1-day threshold
    expect(deriveBackupHealthState(signals, customOpts)).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });
});

describe('deriveBackupHealthState — restore verified on generated/test data', () => {
  it('returns restore_verified_test_data for kind=generated', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'generated' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns restore_verified_test_data for kind=test', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'test' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns restore_verified_test_data for kind=fixture', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'fixture' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns restore_verified_test_data for kind=synthetic', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'synthetic' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('outranks manual backup recency when restore verified on test data', () => {
    const signals = {
      manualBackupExportedAtMs: STALE_MS,
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'generated',
    };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });
});

describe('deriveBackupHealthState — restore verification not counted for real/user/unknown data', () => {
  it('does not count restore verification when kind is user', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'user' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not count restore verification when kind is real', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'real' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not count restore verification when kind is empty string', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: '' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not count restore verification when kind is undefined', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not count restore verification when kind is unknown', () => {
    const signals = { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'unknown' };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });
});

describe('deriveBackupHealthState — status unavailable / error', () => {
  it('returns status_unavailable when unavailable=true', () => {
    const signals = { unavailable: true };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('returns status_unavailable when error is present', () => {
    const signals = { error: new Error('synthetic test error') };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('prefers status_unavailable over manual backup when unavailable=true', () => {
    const signals = { manualBackupExportedAtMs: RECENT_MS, unavailable: true };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('prefers status_unavailable over restore verification when error present', () => {
    const signals = {
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'generated',
      error: 'storage read failed',
    };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });
});

describe('deriveBackupHealthState — invalid/edge timestamps', () => {
  it('handles NaN timestamp safely (treated as no backup)', () => {
    const signals = { manualBackupExportedAtMs: NaN };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('handles Infinity timestamp safely (treated as recent)', () => {
    const signals = { manualBackupExportedAtMs: Infinity };
    // Infinity is not finite, so treated as no backup
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('handles -Infinity timestamp safely', () => {
    const signals = { manualBackupExportedAtMs: -Infinity };
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('handles string timestamp (treated as no backup)', () => {
    const signals = { manualBackupExportedAtMs: '2024-01-01' };
    // not a number type, so skipped
    expect(deriveBackupHealthState(signals, opts)).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });
});

describe('deriveBackupHealthState — no mutation of input signals', () => {
  it('does not mutate input signals object', () => {
    const signals = Object.freeze({ manualBackupExportedAtMs: RECENT_MS });
    expect(() => deriveBackupHealthState(signals, opts)).not.toThrow();
    expect(signals.manualBackupExportedAtMs).toBe(RECENT_MS);
  });

  it('does not add properties to input signals object', () => {
    const signals = { manualBackupExportedAtMs: RECENT_MS };
    const keysBefore = Object.keys(signals).join(',');
    deriveBackupHealthState(signals, opts);
    expect(Object.keys(signals).join(',')).toBe(keysBefore);
  });
});

describe('BACKUP_HEALTH_STATE_LABELS — Phase 25E name mapping', () => {
  it('maps unknown to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.UNKNOWN]).toBe(`Unknown backup status`);
  });

  it('maps no_backup_recorded to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED]).toBe(
      `No backup recorded in this browser`
    );
  });

  it('maps recent_manual_backup to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP]).toBe(
      `Recent manual backup recorded`
    );
  });

  it('maps backup_may_be_stale to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE]).toBe(
      `Backup may be stale`
    );
  });

  it('maps restore_verified_test_data to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA]).toBe(
      `Restore recently verified on generated/test data`
    );
  });

  it('maps status_unavailable to Phase 25E label', () => {
    expect(BACKUP_HEALTH_STATE_LABELS[BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE]).toBe(
      `Backup status unavailable`
    );
  });

  it('all required state ids have a label', () => {
    for (const id of Object.values(BACKUP_HEALTH_STATE)) {
      expect(BACKUP_HEALTH_STATE_LABELS[id]).toBeTruthy();
    }
  });
});
