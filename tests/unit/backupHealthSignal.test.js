/**
 * Phase 25I — Backup Health Signal Layer Unit Tests
 *
 * Test-only. Uses generated/fixture data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network.
 *
 * PHASE25I_BACKUP_HEALTH_READ_ONLY_SIGNAL_LAYER_STATUS: COMPLETED_THIN_READ_ONLY_SIGNAL_LAYER
 * PHASE25I_BACKUP_HEALTH_RUNTIME_SCOPE: READ_ONLY_NO_UI_NO_WRITES_NO_BACKUP_RESTORE_CHANGES
 */

import { describe, it, expect } from 'vitest';
import {
  createBackupHealthSignal,
  normalizeBackupHealthSignals,
  deriveBackupHealthFromSignals,
  BACKUP_HEALTH_STATE,
  DEFAULT_STALE_THRESHOLD_MS,
} from '../../src/state/backupHealthSignal.js';

const NOW_MS = 1_716_000_000_000; // Fixed synthetic timestamp for test stability
const RECENT_MS = NOW_MS - 1 * 24 * 60 * 60 * 1000; // 1 day ago (within stale threshold)
const STALE_MS = NOW_MS - 10 * 24 * 60 * 60 * 1000; // 10 days ago (beyond 7-day threshold)
const FUTURE_MS = NOW_MS + 1 * 24 * 60 * 60 * 1000; // 1 day in future

const opts = (extra = {}) => ({ currentTimeMs: NOW_MS, ...extra });

describe('normalizeBackupHealthSignals', () => {
  it('returns null for null input', () => {
    expect(normalizeBackupHealthSignals(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(normalizeBackupHealthSignals(undefined)).toBeNull();
  });

  it('returns empty object for empty input', () => {
    const result = normalizeBackupHealthSignals({});
    expect(result).toEqual({});
  });

  it('passes through canonical manualBackupExportedAtMs', () => {
    const result = normalizeBackupHealthSignals({ manualBackupExportedAtMs: RECENT_MS });
    expect(result.manualBackupExportedAtMs).toBe(RECENT_MS);
  });

  it('aliases lastManualExportCompletedAtMs to manualBackupExportedAtMs', () => {
    const result = normalizeBackupHealthSignals({ lastManualExportCompletedAtMs: RECENT_MS });
    expect(result.manualBackupExportedAtMs).toBe(RECENT_MS);
  });

  it('canonical field takes precedence over alias', () => {
    const result = normalizeBackupHealthSignals({
      manualBackupExportedAtMs: RECENT_MS,
      lastManualExportCompletedAtMs: STALE_MS,
    });
    expect(result.manualBackupExportedAtMs).toBe(RECENT_MS);
  });

  it('does not mutate input object', () => {
    const input = { lastManualExportCompletedAtMs: RECENT_MS };
    const frozen = Object.freeze({ ...input });
    const result = normalizeBackupHealthSignals(frozen);
    expect(result).not.toBe(frozen);
    expect(result.manualBackupExportedAtMs).toBe(RECENT_MS);
  });
});

describe('createBackupHealthSignal', () => {
  it('returns UNKNOWN for null input', () => {
    const { stateId } = createBackupHealthSignal(null, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('returns UNKNOWN for undefined input', () => {
    const { stateId } = createBackupHealthSignal(undefined, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('returns NO_BACKUP_RECORDED for empty signal object', () => {
    const { stateId } = createBackupHealthSignal({}, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('returns RECENT_MANUAL_BACKUP for recent canonical export timestamp', () => {
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: RECENT_MS }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('returns RECENT_MANUAL_BACKUP for recent alias timestamp (lastManualExportCompletedAtMs)', () => {
    const { stateId } = createBackupHealthSignal({ lastManualExportCompletedAtMs: RECENT_MS }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('returns BACKUP_MAY_BE_STALE for stale export timestamp', () => {
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: STALE_MS }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });

  it('returns RESTORE_VERIFIED_TEST_DATA for generated kind', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'generated',
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns RESTORE_VERIFIED_TEST_DATA for test kind', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'test',
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns RESTORE_VERIFIED_TEST_DATA for fixture kind', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'fixture',
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('returns RESTORE_VERIFIED_TEST_DATA for synthetic kind', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'synthetic',
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('does not count real/user kind as verified — falls through to manual backup check', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'real',
      manualBackupExportedAtMs: RECENT_MS,
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('does not count unknown kind as verified', () => {
    const { stateId } = createBackupHealthSignal({
      restoreVerifiedAtMs: RECENT_MS,
      restoreVerificationDataKind: 'unknown',
      manualBackupExportedAtMs: STALE_MS,
    }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });

  it('returns STATUS_UNAVAILABLE when unavailable is true', () => {
    const { stateId } = createBackupHealthSignal({ unavailable: true }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('returns STATUS_UNAVAILABLE when error is present', () => {
    const { stateId } = createBackupHealthSignal({ error: new Error('storage read failed') }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('handles future timestamp conservatively — treated as recent (non-stale)', () => {
    // Future timestamp produces negative age; treated as recent (age <= threshold)
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: FUTURE_MS }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('handles NaN timestamp safely — treated as no backup', () => {
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: NaN }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('handles Infinity timestamp as no backup (not finite)', () => {
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: Infinity }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not mutate input object', () => {
    const input = Object.freeze({ lastManualExportCompletedAtMs: RECENT_MS });
    expect(() => createBackupHealthSignal(input, opts())).not.toThrow();
  });

  it('returns a label string alongside stateId', () => {
    const { stateId, label } = createBackupHealthSignal({}, opts());
    expect(typeof label).toBe('string');
    expect(label.length).toBeGreaterThan(0);
    expect(stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('does not require write APIs — no localStorage/IndexedDB used', () => {
    // This test asserts the signal layer is usable in a pure test env with no write APIs.
    // If the module used localStorage it would throw here in vitest (no browser env).
    const result = createBackupHealthSignal({ manualBackupExportedAtMs: RECENT_MS }, opts());
    expect(result.stateId).toBeDefined();
  });

  it('can import and use Phase 25G helper without UI wiring', () => {
    // Verifies the import chain works in test env with no UI/routing/storage dependencies.
    expect(DEFAULT_STALE_THRESHOLD_MS).toBe(7 * 24 * 60 * 60 * 1000);
    const { stateId } = createBackupHealthSignal({ manualBackupExportedAtMs: RECENT_MS }, opts());
    expect(stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });
});

describe('deriveBackupHealthFromSignals', () => {
  it('returns state id string for null input', () => {
    expect(deriveBackupHealthFromSignals(null, opts())).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('returns state id string for valid input', () => {
    const result = deriveBackupHealthFromSignals({ manualBackupExportedAtMs: RECENT_MS }, opts());
    expect(result).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('alias normalization works in direct derive path', () => {
    const result = deriveBackupHealthFromSignals({ lastManualExportCompletedAtMs: STALE_MS }, opts());
    expect(result).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });
});
