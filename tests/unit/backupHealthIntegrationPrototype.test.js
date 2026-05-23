/**
 * Phase 25K — Backup Health Integration Prototype Unit Tests
 *
 * Test-only. Uses generated/fixture data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network.
 *
 * PHASE25K_BACKUP_HEALTH_TEST_ONLY_DEFAULT_OFF_INTEGRATION_STATUS: COMPLETED_TEST_ONLY_DEFAULT_OFF_PROTOTYPE
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_SCOPE: TEST_ONLY_DEFAULT_OFF_READ_ONLY_NO_UI_NO_WRITES
 * PHASE25K_BACKUP_HEALTH_INTEGRATION_DECISION: PASS_TO_PHASE25L_PRODUCTION_UI_DESIGN_GATE_ONLY
 */

import { describe, it, expect } from 'vitest';
import {
  isBackupHealthIntegrationEnabled,
  createBackupHealthIntegrationState,
  BACKUP_HEALTH_STATE,
} from '../../src/state/backupHealthIntegrationPrototype.js';

const NOW_MS = 1_716_000_000_000; // Fixed synthetic timestamp for test stability
const RECENT_MS = NOW_MS - 1 * 24 * 60 * 60 * 1000; // 1 day ago
const STALE_MS = NOW_MS - 10 * 24 * 60 * 60 * 1000; // 10 days ago
const FUTURE_MS = NOW_MS + 1 * 24 * 60 * 60 * 1000; // 1 day future

const testOpts = { enabled: true, mode: 'test', currentTimeMs: NOW_MS };
const defaultOffOpts = { enabled: true, mode: 'default-off', currentTimeMs: NOW_MS };

// ── isBackupHealthIntegrationEnabled ─────────────────────────────────────────

describe('isBackupHealthIntegrationEnabled', () => {
  it('default disabled with undefined options', () => {
    expect(isBackupHealthIntegrationEnabled(undefined)).toBe(false);
  });

  it('returns false with null options', () => {
    expect(isBackupHealthIntegrationEnabled(null)).toBe(false);
  });

  it('default disabled with empty options', () => {
    expect(isBackupHealthIntegrationEnabled({})).toBe(false);
  });

  it('disabled when enabled false', () => {
    expect(isBackupHealthIntegrationEnabled({ enabled: false })).toBe(false);
  });

  it('returns false when enabled is true but mode is missing', () => {
    expect(isBackupHealthIntegrationEnabled({ enabled: true })).toBe(false);
  });

  it('rejects unsupported mode', () => {
    expect(isBackupHealthIntegrationEnabled({ enabled: true, mode: 'production' })).toBe(false);
    expect(isBackupHealthIntegrationEnabled({ enabled: true, mode: 'live' })).toBe(false);
    expect(isBackupHealthIntegrationEnabled({ enabled: true, mode: '' })).toBe(false);
  });

  it('returns true for explicit test mode', () => {
    expect(isBackupHealthIntegrationEnabled({ enabled: true, mode: 'test' })).toBe(true);
  });

  it('returns true for explicit default-off mode', () => {
    expect(isBackupHealthIntegrationEnabled({ enabled: true, mode: 'default-off' })).toBe(true);
  });

  it('does not mutate options object', () => {
    const opts = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => isBackupHealthIntegrationEnabled(opts)).not.toThrow();
    expect(opts.enabled).toBe(true);
    expect(opts.mode).toBe('test');
  });
});

// ── createBackupHealthIntegrationState — disabled path ───────────────────────

describe('createBackupHealthIntegrationState — disabled path', () => {
  it('returns disabled sentinel for undefined options', () => {
    const result = createBackupHealthIntegrationState(null, undefined);
    expect(result.enabled).toBe(false);
    expect(result.stateId).toBe('unknown');
    expect(result.source).toBe('phase25k_disabled');
  });

  it('returns disabled sentinel for empty options', () => {
    const result = createBackupHealthIntegrationState({}, {});
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('phase25k_disabled');
  });

  it('returns disabled sentinel when enabled is false', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      { enabled: false, currentTimeMs: NOW_MS }
    );
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('phase25k_disabled');
  });

  it('disabled path does not require signal input — null input is safe', () => {
    const result = createBackupHealthIntegrationState(null, undefined);
    expect(result.enabled).toBe(false);
    expect(result.stateId).toBe('unknown');
  });

  it('disabled path does not require signal input — undefined input is safe', () => {
    const result = createBackupHealthIntegrationState(undefined, undefined);
    expect(result.enabled).toBe(false);
  });
});

// ── createBackupHealthIntegrationState — enabled path (test mode) ────────────

describe('createBackupHealthIntegrationState — enabled path', () => {
  it('enabled path derives state from Phase 25I signal layer', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('phase25i_signal_layer');
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.label).toBe('string');
  });

  it('enabled path works with default-off mode', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      defaultOffOpts
    );
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('phase25i_signal_layer');
  });

  it('recent manual export signal passes through as RECENT_MANUAL_BACKUP', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });

  it('derives NO_BACKUP_RECORDED for empty signal object', () => {
    const result = createBackupHealthIntegrationState({}, testOpts);
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
  });

  it('derives UNKNOWN for null input', () => {
    const result = createBackupHealthIntegrationState(null, testOpts);
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
  });

  it('generated/test restore verification passes through as RESTORE_VERIFIED_TEST_DATA', () => {
    const result = createBackupHealthIntegrationState(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'generated',
      },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('test data kind passes through as RESTORE_VERIFIED_TEST_DATA', () => {
    const result = createBackupHealthIntegrationState(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'test',
      },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('real/user restore verification does not count as verified', () => {
    const result = createBackupHealthIntegrationState(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'real',
      },
      testOpts
    );
    expect(result.stateId).not.toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('user restore verification does not count as verified', () => {
    const result = createBackupHealthIntegrationState(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'user',
      },
      testOpts
    );
    expect(result.stateId).not.toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('unavailable signal maps to STATUS_UNAVAILABLE conservatively', () => {
    const result = createBackupHealthIntegrationState(
      { unavailable: true },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('error signal maps to STATUS_UNAVAILABLE conservatively', () => {
    const result = createBackupHealthIntegrationState(
      { error: new Error('test error') },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
  });

  it('stale backup maps to BACKUP_MAY_BE_STALE', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: STALE_MS },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
  });

  it('future timestamp is handled safely through signal layer (no throw)', () => {
    expect(() =>
      createBackupHealthIntegrationState(
        { manualBackupExportedAtMs: FUTURE_MS },
        testOpts
      )
    ).not.toThrow();
  });

  it('invalid timestamp (NaN) is handled safely', () => {
    expect(() =>
      createBackupHealthIntegrationState(
        { manualBackupExportedAtMs: NaN },
        testOpts
      )
    ).not.toThrow();
  });

  it('alias field lastManualExportCompletedAtMs passes through signal layer', () => {
    const result = createBackupHealthIntegrationState(
      { lastManualExportCompletedAtMs: RECENT_MS },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
  });
});

// ── Immutability ──────────────────────────────────────────────────────────────

describe('createBackupHealthIntegrationState — immutability', () => {
  it('does not mutate input signal object', () => {
    const input = Object.freeze({ manualBackupExportedAtMs: RECENT_MS });
    expect(() => createBackupHealthIntegrationState(input, testOpts)).not.toThrow();
  });

  it('does not mutate options object', () => {
    const input = { manualBackupExportedAtMs: RECENT_MS };
    const opts = Object.freeze({ enabled: true, mode: 'test', currentTimeMs: NOW_MS });
    expect(() => createBackupHealthIntegrationState(input, opts)).not.toThrow();
  });

  it('does not add properties to input', () => {
    const input = { manualBackupExportedAtMs: RECENT_MS };
    const keys = Object.keys(input);
    createBackupHealthIntegrationState(input, testOpts);
    expect(Object.keys(input)).toEqual(keys);
  });
});

// ── No write APIs ─────────────────────────────────────────────────────────────

describe('createBackupHealthIntegrationState — no write APIs', () => {
  it('result does not expose write, persist, or save methods', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(typeof result.write).toBe('undefined');
    expect(typeof result.persist).toBe('undefined');
    expect(typeof result.save).toBe('undefined');
    expect(typeof result.export).toBe('undefined');
  });
});

// ── No UI or browser/manual behavior ─────────────────────────────────────────

describe('createBackupHealthIntegrationState — no UI or browser behavior', () => {
  it('result does not expose render, show, open, or navigate methods', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(typeof result.render).toBe('undefined');
    expect(typeof result.show).toBe('undefined');
    expect(typeof result.open).toBe('undefined');
    expect(typeof result.navigate).toBe('undefined');
  });

  it('result does not contain route or href strings', () => {
    const result = createBackupHealthIntegrationState(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('/settings');
    expect(serialized).not.toContain('/dashboard');
    expect(serialized).not.toContain('/library');
  });
});
