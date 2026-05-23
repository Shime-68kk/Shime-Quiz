/**
 * Phase 25M — Backup Health UI Prototype Unit Tests
 *
 * Test-only. Uses generated/fixture data only. No real learner data.
 * No browser APIs, no localStorage, no IndexedDB, no network.
 *
 * PHASE25M_BACKUP_HEALTH_LIMITED_DEFAULT_OFF_UI_PROTOTYPE_STATUS: COMPLETED_DEFAULT_OFF_UI_VIEW_MODEL_PROTOTYPE
 * PHASE25M_BACKUP_HEALTH_UI_SCOPE: DEFAULT_OFF_READ_ONLY_VIEW_MODEL_NO_ROUTE_NO_WRITES
 * PHASE25M_BACKUP_HEALTH_UI_DECISION: PASS_TO_PHASE25N_MANUAL_EVIDENCE_AND_PHASE25_CLOSURE_GATE
 */

import { describe, it, expect } from 'vitest';
import {
  isBackupHealthUiPrototypeEnabled,
  createBackupHealthUiModel,
  BACKUP_HEALTH_STATE,
} from '../../src/state/backupHealthUiPrototype.js';

const NOW_MS = 1_716_000_000_000; // Fixed synthetic timestamp for test stability
const RECENT_MS = NOW_MS - 1 * 24 * 60 * 60 * 1000; // 1 day ago
const STALE_MS = NOW_MS - 10 * 24 * 60 * 60 * 1000; // 10 days ago

const testOpts = { enabled: true, mode: 'test', currentTimeMs: NOW_MS };
const defaultOffOpts = { enabled: true, mode: 'default-off', currentTimeMs: NOW_MS };

// ── isBackupHealthUiPrototypeEnabled ─────────────────────────────────────────

describe('isBackupHealthUiPrototypeEnabled', () => {
  it('default disabled with undefined options', () => {
    expect(isBackupHealthUiPrototypeEnabled(undefined)).toBe(false);
  });

  it('returns false with null options', () => {
    expect(isBackupHealthUiPrototypeEnabled(null)).toBe(false);
  });

  it('default disabled with empty options', () => {
    expect(isBackupHealthUiPrototypeEnabled({})).toBe(false);
  });

  it('disabled when enabled false', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: false })).toBe(false);
  });

  it('returns false when enabled true but no mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true })).toBe(false);
  });

  it('enabled only for explicit test mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'test' })).toBe(true);
  });

  it('enabled only for explicit default-off mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'default-off' })).toBe(true);
  });

  it('rejects unsupported production mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'production' })).toBe(false);
  });

  it('rejects unsupported live mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true, mode: 'live' })).toBe(false);
  });

  it('rejects empty string mode', () => {
    expect(isBackupHealthUiPrototypeEnabled({ enabled: true, mode: '' })).toBe(false);
  });

  it('does not mutate options object', () => {
    const opts = Object.freeze({ enabled: true, mode: 'test' });
    expect(() => isBackupHealthUiPrototypeEnabled(opts)).not.toThrow();
    expect(opts.enabled).toBe(true);
    expect(opts.mode).toBe('test');
  });
});

// ── createBackupHealthUiModel — disabled path ────────────────────────────────

describe('createBackupHealthUiModel — disabled path', () => {
  it('disabled path does not require signal input — undefined options returns disabled sentinel', () => {
    const result = createBackupHealthUiModel(null, undefined);
    expect(result.enabled).toBe(false);
    expect(result.visible).toBe(false);
    expect(result.stateId).toBe('unknown');
    expect(result.source).toBe('phase25m_disabled');
  });

  it('returns disabled sentinel for empty options', () => {
    const result = createBackupHealthUiModel({}, {});
    expect(result.enabled).toBe(false);
    expect(result.visible).toBe(false);
    expect(result.source).toBe('phase25m_disabled');
  });

  it('returns disabled sentinel when enabled is false', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      { enabled: false, currentTimeMs: NOW_MS }
    );
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('phase25m_disabled');
  });

  it('returns disabled sentinel for production mode', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      { enabled: true, mode: 'production', currentTimeMs: NOW_MS }
    );
    expect(result.enabled).toBe(false);
    expect(result.source).toBe('phase25m_disabled');
  });

  it('disabled sentinel has no tone or titleVi', () => {
    const result = createBackupHealthUiModel(null, undefined);
    expect(result.tone).toBeUndefined();
    expect(result.titleVi).toBeUndefined();
    expect(result.bodyVi).toBeUndefined();
    expect(result.actionLabelVi).toBeUndefined();
  });
});

// ── createBackupHealthUiModel — enabled path ─────────────────────────────────

describe('createBackupHealthUiModel — enabled path', () => {
  it('enabled path derives view model from Phase 25K integration prototype', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(result.enabled).toBe(true);
    expect(result.visible).toBe(true);
    expect(result.source).toBe('phase25k_integration_prototype');
    expect(typeof result.stateId).toBe('string');
    expect(typeof result.tone).toBe('string');
    expect(typeof result.titleVi).toBe('string');
    expect(typeof result.bodyVi).toBe('string');
  });

  it('enabled path works with default-off mode', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      defaultOffOpts
    );
    expect(result.enabled).toBe(true);
    expect(result.source).toBe('phase25k_integration_prototype');
  });

  it('recent manual backup maps to calm Vietnamese copy', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RECENT_MANUAL_BACKUP);
    expect(result.tone).toBe('calm');
    expect(result.titleVi).toBeTruthy();
    expect(result.bodyVi).toBeTruthy();
    expect(result.enabled).toBe(true);
    expect(result.visible).toBe(true);
  });

  it('stale backup maps to non-alarmist reminder copy', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: STALE_MS },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.BACKUP_MAY_BE_STALE);
    expect(result.tone).toBe('reminder');
    expect(result.titleVi).toBeTruthy();
    expect(result.bodyVi).toBeTruthy();
  });

  it('generated/test restore verification maps to limited evidence copy', () => {
    const result = createBackupHealthUiModel(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'generated',
      },
      testOpts
    );
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
    expect(result.tone).toBe('limited-evidence');
    expect(result.titleVi).toBeTruthy();
    expect(result.bodyVi).toBeTruthy();
  });

  it('real/user restore verification does not count as verified', () => {
    const result = createBackupHealthUiModel(
      {
        restoreVerifiedAtMs: RECENT_MS,
        restoreVerificationDataKind: 'real',
      },
      testOpts
    );
    expect(result.stateId).not.toBe(BACKUP_HEALTH_STATE.RESTORE_VERIFIED_TEST_DATA);
  });

  it('unavailable/error signal maps conservatively', () => {
    const resultUnavailable = createBackupHealthUiModel(
      { unavailable: true },
      testOpts
    );
    expect(resultUnavailable.stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
    expect(resultUnavailable.tone).toBe('conservative');

    const resultError = createBackupHealthUiModel(
      { error: new Error('test') },
      testOpts
    );
    expect(resultError.stateId).toBe(BACKUP_HEALTH_STATE.STATUS_UNAVAILABLE);
    expect(resultError.tone).toBe('conservative');
  });

  it('unknown/no-input states map conservatively', () => {
    const resultUnknown = createBackupHealthUiModel(null, testOpts);
    expect(resultUnknown.stateId).toBe(BACKUP_HEALTH_STATE.UNKNOWN);
    expect(resultUnknown.tone).toBe('conservative');
  });

  it('no-backup-recorded state maps conservatively', () => {
    const result = createBackupHealthUiModel({}, testOpts);
    expect(result.stateId).toBe(BACKUP_HEALTH_STATE.NO_BACKUP_RECORDED);
    expect(result.tone).toBe('conservative');
  });

  it('copy does not contain forbidden guarantee language', () => {
    const states = [
      { manualBackupExportedAtMs: RECENT_MS },
      { manualBackupExportedAtMs: STALE_MS },
      { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'generated' },
      { unavailable: true },
      null,
      {},
    ];
    const FORBIDDEN_PHRASES = [
      'đảm bảo không mất dữ liệu',
      'tự động sao lưu',
      'đã an toàn tuyệt đối',
      'được bảo vệ trên mọi thiết bị',
      'khôi phục chắc chắn',
      'đồng bộ đám mây',
      'guaranteed data-loss prevention',
      'automatic backup',
      'cloud sync',
      'account recovery',
    ];
    for (const input of states) {
      const result = createBackupHealthUiModel(input, testOpts);
      const serialized = JSON.stringify(result).toLowerCase();
      for (const phrase of FORBIDDEN_PHRASES) {
        expect(serialized).not.toContain(phrase.toLowerCase());
      }
    }
  });
});

// ── Immutability ──────────────────────────────────────────────────────────────

describe('createBackupHealthUiModel — does not mutate inputs or options', () => {
  it('does not mutate input signal object', () => {
    const input = Object.freeze({ manualBackupExportedAtMs: RECENT_MS });
    expect(() => createBackupHealthUiModel(input, testOpts)).not.toThrow();
  });

  it('does not mutate options object', () => {
    const input = { manualBackupExportedAtMs: RECENT_MS };
    const opts = Object.freeze({ enabled: true, mode: 'test', currentTimeMs: NOW_MS });
    expect(() => createBackupHealthUiModel(input, opts)).not.toThrow();
  });

  it('does not add properties to input', () => {
    const input = { manualBackupExportedAtMs: RECENT_MS };
    const keys = Object.keys(input);
    createBackupHealthUiModel(input, testOpts);
    expect(Object.keys(input)).toEqual(keys);
  });
});

// ── No write APIs ─────────────────────────────────────────────────────────────

describe('createBackupHealthUiModel — does not use write APIs', () => {
  it('result does not expose write, persist, save, or export methods', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(typeof result.write).toBe('undefined');
    expect(typeof result.persist).toBe('undefined');
    expect(typeof result.save).toBe('undefined');
    expect(typeof result.export).toBe('undefined');
    expect(typeof result.store).toBe('undefined');
  });
});

// ── No route/render/navigate methods ─────────────────────────────────────────

describe('createBackupHealthUiModel — does not expose render/show/open/navigate methods', () => {
  it('result does not expose render, show, open, or navigate methods', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    expect(typeof result.render).toBe('undefined');
    expect(typeof result.show).toBe('undefined');
    expect(typeof result.open).toBe('undefined');
    expect(typeof result.navigate).toBe('undefined');
  });

  it('result does not contain route or href strings', () => {
    const result = createBackupHealthUiModel(
      { manualBackupExportedAtMs: RECENT_MS },
      testOpts
    );
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain('/settings');
    expect(serialized).not.toContain('/dashboard');
    expect(serialized).not.toContain('/library');
  });
});

// ── Vietnamese copy quick check ───────────────────────────────────────────────

describe('createBackupHealthUiModel — Vietnamese-first copy', () => {
  it('titleVi and bodyVi are non-empty strings when enabled', () => {
    const states = [
      { manualBackupExportedAtMs: RECENT_MS },
      { manualBackupExportedAtMs: STALE_MS },
      { restoreVerifiedAtMs: RECENT_MS, restoreVerificationDataKind: 'generated' },
      { unavailable: true },
      null,
      {},
    ];
    for (const input of states) {
      const result = createBackupHealthUiModel(input, testOpts);
      expect(typeof result.titleVi).toBe('string');
      expect(result.titleVi.length).toBeGreaterThan(0);
      expect(typeof result.bodyVi).toBe('string');
      expect(result.bodyVi.length).toBeGreaterThan(0);
    }
  });
});
