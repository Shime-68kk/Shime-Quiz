/**
 * tests/unit/migrationJournalTestHarness.test.js
 *
 * Phase 17F — Test-Only Migration Journal Prototype unit tests.
 *
 * All tests use the test-only harness (tests/unit/helpers/migrationJournalTestHarness.js).
 * No browser APIs are required. No real storage is accessed.
 * No localStorage access, no indexedDB access, no storage adapter registry access.
 * All data is synthetic.
 */

import { describe, it, expect } from 'vitest';
import {
  ALLOWED_MODES_PHASE17F,
  JOURNAL_STATUS,
  VALID_TRANSITIONS,
  REQUIRED_FIELDS,
  createPlannedDryRunEntry,
  validateRequiredFields,
  rejectLiveMode,
  transitionStatus,
  attachWriteVerification,
  attachRollbackSnapshot,
  markFailed,
  markRollbackReady,
  markRolledBack,
  completeEntry,
} from './helpers/migrationJournalTestHarness.js';

// ── Synthetic test data helpers ───────────────────────────────────────────────

function syntheticEntryFields() {
  return {
    journalId:     'journal-test-001',
    operationId:   'op-test-001',
    manifestId:    'manifest-phase17f-01',
    sourceKey:     'shimeV2_settings_synthetic',
    targetStore:   'shime-v2-idb-dry-run',
    dataFamily:    'settings',
    operationType: 'copy',
    mode:          'dry-run',
    timestamp:     '2026-05-17T00:00:00.000Z',
    sourceChecksum: 'sha256-synthetic-abc123',
    claimBoundary: 'Phase 17F test-only; no live migration',
  };
}

function makePlannedEntry(overrides = {}) {
  const result = createPlannedDryRunEntry({ ...syntheticEntryFields(), ...overrides });
  if (!result.ok) throw new Error(`createPlannedDryRunEntry failed: ${result.error}`);
  return result.entry;
}

// ── 1. Creating a valid planned dry-run journal entry ─────────────────────────

describe('createPlannedDryRunEntry — valid planned dry-run entry', () => {
  it('returns ok:true with a planned dry-run entry using synthetic fields', () => {
    const result = createPlannedDryRunEntry(syntheticEntryFields());
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('planned');
    expect(result.entry.mode).toBe('dry-run');
  });

  it('returns ok:true with mode=test (also allowed)', () => {
    const result = createPlannedDryRunEntry({ ...syntheticEntryFields(), mode: 'test' });
    expect(result.ok).toBe(true);
    expect(result.entry.mode).toBe('test');
  });

  it('defaults mode to dry-run when not specified', () => {
    const result = createPlannedDryRunEntry({});
    expect(result.ok).toBe(true);
    expect(result.entry.mode).toBe('dry-run');
  });

  it('includes all required fields in the created entry', () => {
    const result = createPlannedDryRunEntry(syntheticEntryFields());
    expect(result.ok).toBe(true);
    for (const field of REQUIRED_FIELDS) {
      expect(result.entry).toHaveProperty(field);
    }
  });

  it('initializes nullable fields to null', () => {
    const result = createPlannedDryRunEntry(syntheticEntryFields());
    expect(result.entry.targetChecksum).toBeNull();
    expect(result.entry.readBeforeWriteChecksum).toBeNull();
    expect(result.entry.writeVerification).toBeNull();
    expect(result.entry.rollbackSnapshotRef).toBeNull();
    expect(result.entry.errorCode).toBeNull();
  });

  it('claimBoundary field is preserved as provided', () => {
    const result = createPlannedDryRunEntry({
      ...syntheticEntryFields(),
      claimBoundary: 'Phase 17F test-only; no live migration',
    });
    expect(result.ok).toBe(true);
    expect(result.entry.claimBoundary).toBe('Phase 17F test-only; no live migration');
  });
});

// ── 2. Rejecting missing required fields ──────────────────────────────────────

describe('validateRequiredFields — rejecting missing required fields', () => {
  it('returns ok:true for a fully populated entry', () => {
    const entry = makePlannedEntry();
    const result = validateRequiredFields(entry);
    expect(result.ok).toBe(true);
  });

  it('returns ok:false when entry is null', () => {
    const result = validateRequiredFields(null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_entry');
  });

  it('returns ok:false when entry is undefined', () => {
    const result = validateRequiredFields(undefined);
    expect(result.ok).toBe(false);
  });

  it('returns ok:false with missingFields when fields are absent', () => {
    const partial = { journalId: 'j1', operationId: 'op1' };
    const result = validateRequiredFields(partial);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_required_fields');
    expect(Array.isArray(result.missingFields)).toBe(true);
    expect(result.missingFields.length).toBeGreaterThan(0);
    expect(result.missingFields).toContain('status');
  });

  it('returns ok:false for an empty object', () => {
    const result = validateRequiredFields({});
    expect(result.ok).toBe(false);
    expect(result.missingFields).toEqual(expect.arrayContaining(REQUIRED_FIELDS));
  });
});

// ── 3. Rejecting live mode — Phase 17F test-only gate ─────────────────────────

describe('rejectLiveMode — live-mode rejection', () => {
  it('allows dry-run mode', () => {
    const entry = makePlannedEntry({ mode: 'dry-run' });
    expect(rejectLiveMode(entry).ok).toBe(true);
  });

  it('allows test mode', () => {
    const entry = makePlannedEntry({ mode: 'test' });
    expect(rejectLiveMode(entry).ok).toBe(true);
  });

  it('rejects live mode with error live_mode_rejected', () => {
    const entry = { ...makePlannedEntry(), mode: 'live' };
    const result = rejectLiveMode(entry);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('rejects production mode', () => {
    const entry = { ...makePlannedEntry(), mode: 'production' };
    const result = rejectLiveMode(entry);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('createPlannedDryRunEntry rejects live mode at creation time', () => {
    const result = createPlannedDryRunEntry({ ...syntheticEntryFields(), mode: 'live' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('ALLOWED_MODES_PHASE17F contains only dry-run and test', () => {
    expect(ALLOWED_MODES_PHASE17F).toContain('dry-run');
    expect(ALLOWED_MODES_PHASE17F).toContain('test');
    expect(ALLOWED_MODES_PHASE17F).not.toContain('live');
    expect(ALLOWED_MODES_PHASE17F).not.toContain('production');
  });
});

// ── 4. Valid status transition path ───────────────────────────────────────────

describe('transitionStatus — valid status transition path', () => {
  it('transitions from planned to backup-captured', () => {
    const entry = makePlannedEntry();
    const result = transitionStatus(entry, 'backup-captured');
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('backup-captured');
  });

  it('transitions through the full happy path: planned → backup-captured → write-attempted → write-verified → completed', () => {
    let entry = makePlannedEntry();

    let r = transitionStatus(entry, 'backup-captured');
    expect(r.ok).toBe(true);
    entry = r.entry;

    r = transitionStatus(entry, 'write-attempted');
    expect(r.ok).toBe(true);
    entry = r.entry;

    r = transitionStatus(entry, 'write-verified');
    expect(r.ok).toBe(true);
    entry = r.entry;

    const withVerification = attachWriteVerification(entry, { verified: true, checksum: 'sha256-verified' });
    expect(withVerification.ok).toBe(true);

    const completed = completeEntry(withVerification.entry);
    expect(completed.ok).toBe(true);
    expect(completed.entry.status).toBe('completed');
  });

  it('all entries in JOURNAL_STATUS have a transition map entry', () => {
    for (const status of Object.values(JOURNAL_STATUS)) {
      expect(VALID_TRANSITIONS).toHaveProperty(status);
    }
  });
});

// ── 5. Invalid transition rejection ───────────────────────────────────────────

describe('transitionStatus — invalid transition rejection', () => {
  it('rejects transitioning from planned directly to completed', () => {
    const entry = makePlannedEntry();
    const result = transitionStatus(entry, 'completed');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_transition');
    expect(result.from).toBe('planned');
    expect(result.to).toBe('completed');
  });

  it('rejects transitioning from planned to rolled-back', () => {
    const entry = makePlannedEntry();
    const result = transitionStatus(entry, 'rolled-back');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_transition');
  });

  it('rejects any transition from completed (terminal)', () => {
    const entry = makePlannedEntry();
    let e = transitionStatus(entry, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = transitionStatus(e, 'write-verified').entry;
    e = attachWriteVerification(e, { verified: true }).entry;
    const completed = completeEntry(e);
    expect(completed.ok).toBe(true);

    const tryTransition = transitionStatus(completed.entry, 'planned');
    expect(tryTransition.ok).toBe(false);
    expect(tryTransition.error).toBe('invalid_transition');
  });

  it('rejects any transition from rolled-back (terminal)', () => {
    const entry = makePlannedEntry();
    let e = entry;
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = attachRollbackSnapshot(e, { snapshotKey: 'snap-001', capturedAt: '2026-05-17T00:00:00Z' }).entry;
    e = markRollbackReady(e).entry;
    e = markRolledBack(e).entry;
    expect(e.status).toBe('rolled-back');

    const tryAgain = transitionStatus(e, 'planned');
    expect(tryAgain.ok).toBe(false);
  });

  it('includes the allowed transitions list in the error', () => {
    const entry = makePlannedEntry();
    const result = transitionStatus(entry, 'write-verified');
    expect(result.ok).toBe(false);
    expect(Array.isArray(result.allowed)).toBe(true);
    expect(result.allowed).toContain('backup-captured');
  });
});

// ── 6. Write verification attached before completion ──────────────────────────

describe('attachWriteVerification — write verification attachment', () => {
  it('attaches write verification result to the entry', () => {
    const entry = makePlannedEntry();
    const verif = { verified: true, checksum: 'sha256-verified-abc', verifiedAt: '2026-05-17T00:00:00Z' };
    const result = attachWriteVerification(entry, verif);
    expect(result.ok).toBe(true);
    expect(result.entry.writeVerification).toEqual(verif);
  });

  it('rejects null verification result', () => {
    const entry = makePlannedEntry();
    const result = attachWriteVerification(entry, null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_verification_result');
  });

  it('does not mutate the original entry', () => {
    const entry = makePlannedEntry();
    const originalVerif = entry.writeVerification;
    attachWriteVerification(entry, { verified: true });
    expect(entry.writeVerification).toBe(originalVerif);
  });
});

// ── 7. Completion requires successful write verification ──────────────────────

describe('completeEntry — write verification before completion', () => {
  it('rejects completion when writeVerification is null', () => {
    const entry = makePlannedEntry();
    let e = transitionStatus(entry, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = transitionStatus(e, 'write-verified').entry;
    // writeVerification is still null
    const result = completeEntry(e);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('write_verification_required');
  });

  it('rejects completion when writeVerification.verified is false', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = transitionStatus(e, 'write-verified').entry;
    e = attachWriteVerification(e, { verified: false }).entry;
    const result = completeEntry(e);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('write_verification_required');
  });

  it('succeeds when writeVerification.verified is true and status is write-verified', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = transitionStatus(e, 'write-verified').entry;
    e = attachWriteVerification(e, { verified: true }).entry;
    const result = completeEntry(e);
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('completed');
  });
});

// ── 8. Rollback-ready requires rollback snapshot metadata ─────────────────────

describe('markRollbackReady — rollback-ready requires rollback snapshot metadata', () => {
  it('rejects rollback-ready without rollbackSnapshotRef', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    // rollbackSnapshotRef is null — must fail
    const result = markRollbackReady(e);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_rollback_snapshot');
  });

  it('allows rollback-ready when rollbackSnapshotRef is present', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = attachRollbackSnapshot(e, { snapshotKey: 'snap-001', capturedAt: '2026-05-17T00:00:00Z' }).entry;
    const result = markRollbackReady(e);
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('rollback-ready');
  });
});

// ── 9. Rolled-back status requires rollback snapshot metadata ─────────────────

describe('markRolledBack — rolled-back requires rollback snapshot metadata', () => {
  it('rejects rolled-back without rollbackSnapshotRef', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = attachRollbackSnapshot(e, { snapshotKey: 'snap-001' }).entry;
    e = markRollbackReady(e).entry;
    // Manually remove rollback ref to test guard
    const eNoSnap = { ...e, rollbackSnapshotRef: null };
    const result = markRolledBack(eNoSnap);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_rollback_snapshot');
  });

  it('succeeds when rollbackSnapshotRef is present and status is rollback-ready', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = attachRollbackSnapshot(e, { snapshotKey: 'snap-001', capturedAt: '2026-05-17T00:00:00Z' }).entry;
    e = markRollbackReady(e).entry;
    const result = markRolledBack(e);
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('rolled-back');
  });
});

// ── 10. Failure includes explicit error code ──────────────────────────────────

describe('markFailed — failure includes explicit error code', () => {
  it('transitions to failed with an explicit error code', () => {
    const entry = makePlannedEntry();
    const result = markFailed(entry, 'quota_exceeded');
    expect(result.ok).toBe(true);
    expect(result.entry.status).toBe('failed');
    expect(result.entry.errorCode).toBe('quota_exceeded');
  });

  it('rejects null error code', () => {
    const entry = makePlannedEntry();
    const result = markFailed(entry, null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('rejects empty string error code', () => {
    const entry = makePlannedEntry();
    const result = markFailed(entry, '');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('rejects whitespace-only error code', () => {
    const entry = makePlannedEntry();
    const result = markFailed(entry, '   ');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('rejects failure from a terminal state (completed → failed invalid)', () => {
    let e = makePlannedEntry();
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    e = transitionStatus(e, 'write-verified').entry;
    e = attachWriteVerification(e, { verified: true }).entry;
    e = completeEntry(e).entry;
    // completed → failed is invalid
    const result = markFailed(e, 'unexpected_error');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_transition');
  });
});

// ── 11. Synthetic-only behavior ───────────────────────────────────────────────

describe('synthetic-only behavior — no localStorage, no indexedDB, no storage adapter registry', () => {
  it('createPlannedDryRunEntry does not access globalThis.localStorage', () => {
    const originalLocalStorage = globalThis.localStorage;
    let accessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      createPlannedDryRunEntry(syntheticEntryFields());
    } finally {
      if (originalLocalStorage !== undefined) {
        Object.defineProperty(globalThis, 'localStorage', {
          value: originalLocalStorage,
          configurable: true,
          writable: true,
        });
      } else {
        delete globalThis.localStorage;
      }
    }
    expect(accessed).toBe(false);
  });

  it('createPlannedDryRunEntry does not access globalThis.indexedDB', () => {
    const originalIdb = globalThis.indexedDB;
    let accessed = false;
    Object.defineProperty(globalThis, 'indexedDB', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      createPlannedDryRunEntry(syntheticEntryFields());
    } finally {
      if (originalIdb !== undefined) {
        Object.defineProperty(globalThis, 'indexedDB', {
          value: originalIdb,
          configurable: true,
          writable: true,
        });
      } else {
        delete globalThis.indexedDB;
      }
    }
    expect(accessed).toBe(false);
  });

  it('all harness functions operate with no browser globals required', () => {
    const entry = makePlannedEntry();
    expect(() => validateRequiredFields(entry)).not.toThrow();
    expect(() => rejectLiveMode(entry)).not.toThrow();
    expect(() => transitionStatus(entry, 'backup-captured')).not.toThrow();
    expect(() => attachWriteVerification(entry, { verified: true })).not.toThrow();
    expect(() => attachRollbackSnapshot(entry, { snapshotKey: 'snap' })).not.toThrow();
    expect(() => markFailed(entry, 'test_error')).not.toThrow();
  });

  it('all synthetic test data uses only synthetic key names', () => {
    const entry = makePlannedEntry();
    // sourceKey is synthetic — not a real user data key
    expect(entry.sourceKey).toBe('shimeV2_settings_synthetic');
    // no real user data
    expect(entry.targetChecksum).toBeNull();
    expect(entry.readBeforeWriteChecksum).toBeNull();
  });
});

// ── 12. Immutability / no unexpected mutation ─────────────────────────────────

describe('immutability — no unexpected mutation of input entries', () => {
  it('transitionStatus does not mutate the original entry', () => {
    const entry = makePlannedEntry();
    const originalStatus = entry.status;
    transitionStatus(entry, 'backup-captured');
    expect(entry.status).toBe(originalStatus);
  });

  it('attachWriteVerification does not mutate the original entry', () => {
    const entry = makePlannedEntry();
    attachWriteVerification(entry, { verified: true });
    expect(entry.writeVerification).toBeNull();
  });

  it('attachRollbackSnapshot does not mutate the original entry', () => {
    const entry = makePlannedEntry();
    attachRollbackSnapshot(entry, { snapshotKey: 'snap' });
    expect(entry.rollbackSnapshotRef).toBeNull();
  });

  it('markFailed does not mutate the original entry', () => {
    const entry = makePlannedEntry();
    markFailed(entry, 'test_error');
    expect(entry.status).toBe('planned');
    expect(entry.errorCode).toBeNull();
  });

  it('returned entries from transitionStatus are independent objects', () => {
    const entry = makePlannedEntry();
    const result = transitionStatus(entry, 'backup-captured');
    expect(result.entry).not.toBe(entry);
    expect(result.entry.status).toBe('backup-captured');
    expect(entry.status).toBe('planned');
  });
});

// ── 13. Claim boundary remains explicit ───────────────────────────────────────

describe('claimBoundary — claim boundary remains explicit', () => {
  it('claimBoundary is preserved through status transitions', () => {
    const boundary = 'Phase 17F test-only; no live migration';
    let e = makePlannedEntry({ claimBoundary: boundary });
    e = transitionStatus(e, 'backup-captured').entry;
    e = transitionStatus(e, 'write-attempted').entry;
    expect(e.claimBoundary).toBe(boundary);
  });

  it('claimBoundary is preserved after attaching writeVerification', () => {
    const boundary = 'Phase 17F test-only; no live migration';
    const e = makePlannedEntry({ claimBoundary: boundary });
    const result = attachWriteVerification(e, { verified: true });
    expect(result.entry.claimBoundary).toBe(boundary);
  });

  it('claimBoundary is preserved after attachRollbackSnapshot', () => {
    const boundary = 'Phase 17F test-only; no live migration';
    const e = makePlannedEntry({ claimBoundary: boundary });
    const result = attachRollbackSnapshot(e, { snapshotKey: 'snap-001' });
    expect(result.entry.claimBoundary).toBe(boundary);
  });

  it('claimBoundary is preserved after markFailed', () => {
    const boundary = 'Phase 17F test-only; no live migration';
    const e = makePlannedEntry({ claimBoundary: boundary });
    const result = markFailed(e, 'test_error');
    expect(result.entry.claimBoundary).toBe(boundary);
  });

  it('claimBoundary can be null (optional field)', () => {
    const result = createPlannedDryRunEntry({ mode: 'dry-run', claimBoundary: null });
    expect(result.ok).toBe(true);
    expect(result.entry.claimBoundary).toBeNull();
  });
});
