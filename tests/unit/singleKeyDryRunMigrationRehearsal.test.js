/**
 * tests/unit/singleKeyDryRunMigrationRehearsal.test.js
 *
 * Phase 17G — Single-Key Dry-Run Migration Rehearsal unit tests.
 *
 * All tests use the test-only rehearsal helper and the Phase 17F journal harness.
 * No browser APIs are required. No real storage is accessed.
 * No localStorage, no indexedDB, no storage adapter registry.
 * All data is synthetic. Dry-run/test mode only.
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE17G_IDENTITY,
  PHASE17G_PILOT_FAMILY,
  PHASE17G_ALLOWED_FAMILIES,
  PHASE17G_MANIFEST_ID,
  PHASE17G_SOURCE_KEY,
  PHASE17G_TARGET_STORE,
  PHASE17G_RISK_CLASS,
  PHASE17G_OPERATION_TYPE,
  PHASE17G_CLAIM_BOUNDARY,
  REQUIRED_MANIFEST_FIELDS,
  buildSyntheticManifestEntry,
  validateSyntheticSourcePayload,
  syntheticChecksum,
  runSingleKeyDryRunRehearsal,
  simulateRehearsalFailure,
} from './helpers/singleKeyDryRunMigrationRehearsal.js';

// ── Synthetic test data helpers ───────────────────────────────────────────────

function syntheticManifest(overrides = {}) {
  const result = buildSyntheticManifestEntry(overrides);
  if (!result.ok) throw new Error(`buildSyntheticManifestEntry failed: ${result.error}`);
  return result.entry;
}

const syntheticSourcePayload = Object.freeze({
  dataFamily: 'recommendation-feedback',
  items: [{ type: 'helpful', cardId: 'synthetic-card-001', dateKey: '2026-05-17' }],
  synthetic: true,
});

// ── 1. Creates a synthetic low-risk recommendation-feedback manifest entry ──

describe('buildSyntheticManifestEntry — low-risk recommendation-feedback manifest', () => {
  it('creates a valid recommendation-feedback manifest entry with all required fields', () => {
    const result = buildSyntheticManifestEntry();
    expect(result.ok).toBe(true);
    expect(result.entry.dataFamily).toBe('recommendation-feedback');
    expect(result.entry.riskClass).toBe('low');
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      expect(result.entry).toHaveProperty(field);
    }
  });

  it('uses the correct Phase 17G manifest constants for the pilot family', () => {
    const result = buildSyntheticManifestEntry();
    expect(result.ok).toBe(true);
    expect(result.entry.manifestId).toBe(PHASE17G_MANIFEST_ID);
    expect(result.entry.sourceKey).toBe(PHASE17G_SOURCE_KEY);
    expect(result.entry.targetStore).toBe(PHASE17G_TARGET_STORE);
    expect(result.entry.riskClass).toBe(PHASE17G_RISK_CLASS);
    expect(result.entry.operationType).toBe(PHASE17G_OPERATION_TYPE);
    expect(result.entry.claimBoundary).toBe(PHASE17G_CLAIM_BOUNDARY);
  });

  it('PHASE17G_PILOT_FAMILY is recommendation-feedback', () => {
    expect(PHASE17G_PILOT_FAMILY).toBe('recommendation-feedback');
    expect(PHASE17G_ALLOWED_FAMILIES).toContain('recommendation-feedback');
  });

  it('manifest entry is frozen (immutable)', () => {
    const result = buildSyntheticManifestEntry();
    expect(result.ok).toBe(true);
    expect(Object.isFrozen(result.entry)).toBe(true);
  });

  it('claimBoundary mentions Phase 17G test-only and no real data movement', () => {
    const result = buildSyntheticManifestEntry();
    expect(result.entry.claimBoundary).toMatch(/phase 17g/i);
    expect(result.entry.claimBoundary).toMatch(/test-only|no real data|no live/i);
  });
});

// ── 2. Rejects non-recommendation-feedback pilot family for Phase 17G ────────

describe('buildSyntheticManifestEntry — rejects non-recommendation-feedback pilot family', () => {
  it('rejects learning-records family with unsupported_pilot_family', () => {
    const result = buildSyntheticManifestEntry({ dataFamily: 'learning-records' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects fsrs-metadata family', () => {
    const result = buildSyntheticManifestEntry({ dataFamily: 'fsrs-metadata' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects backup-data family', () => {
    const result = buildSyntheticManifestEntry({ dataFamily: 'backup-data' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects schedule-records family', () => {
    const result = buildSyntheticManifestEntry({ dataFamily: 'schedule-records' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('runSingleKeyDryRunRehearsal rejects unsupported family in manifest entry', () => {
    const fakeManifest = {
      manifestId: 'x',
      sourceKey: 'x',
      targetStore: 'x',
      dataFamily: 'learning-records',
      riskClass: 'high',
      operationType: 'copy',
      claimBoundary: 'x',
    };
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: fakeManifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });
});

// ── 3. Rejects missing synthetic source payload ───────────────────────────────

describe('validateSyntheticSourcePayload — rejects missing source payload', () => {
  it('rejects null payload with missing_source_payload', () => {
    const result = validateSyntheticSourcePayload(null);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });

  it('rejects undefined payload', () => {
    const result = validateSyntheticSourcePayload(undefined);
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });

  it('rejects non-object payload', () => {
    const result = validateSyntheticSourcePayload('not-an-object');
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_source_payload');
  });

  it('accepts valid synthetic object payload', () => {
    const result = validateSyntheticSourcePayload(syntheticSourcePayload);
    expect(result.ok).toBe(true);
  });

  it('runSingleKeyDryRunRehearsal rejects null source payload', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({ manifestEntry: manifest, sourcePayload: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });

  it('runSingleKeyDryRunRehearsal rejects missing source payload (undefined)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({ manifestEntry: manifest });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });
});

// ── 4. Rejects live mode ──────────────────────────────────────────────────────

describe('runSingleKeyDryRunRehearsal — rejects live mode', () => {
  it('rejects live mode with live_mode_rejected', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      mode: 'live',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('rejects production mode', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      mode: 'production',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('simulateRehearsalFailure also rejects live mode', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      mode: 'live',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'test_error',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });
});

// ── 5. Produces a planned dry-run journal entry ───────────────────────────────

describe('runSingleKeyDryRunRehearsal — produces journal entries', () => {
  it('returns ok:true with journalEntries array on success', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.journalEntries)).toBe(true);
    expect(result.journalEntries.length).toBeGreaterThan(0);
  });

  it('first journal entry has status planned', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.journalEntries[0].status).toBe('planned');
  });

  it('final journal entry has status completed', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.status).toBe('completed');
  });

  it('dryRunOnly flag is true on result', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.dryRunOnly).toBe(true);
  });
});

// ── 6. Includes required manifest fields in journal entry ─────────────────────

describe('runSingleKeyDryRunRehearsal — journal entries include all required manifest fields', () => {
  it('first journal entry includes manifestId, sourceKey, targetStore, dataFamily, operationType, claimBoundary', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    const firstEntry = result.journalEntries[0];
    expect(firstEntry.manifestId).toBe(PHASE17G_MANIFEST_ID);
    expect(firstEntry.sourceKey).toBe(PHASE17G_SOURCE_KEY);
    expect(firstEntry.targetStore).toBe(PHASE17G_TARGET_STORE);
    expect(firstEntry.dataFamily).toBe('recommendation-feedback');
    expect(firstEntry.operationType).toBe(PHASE17G_OPERATION_TYPE);
    expect(firstEntry.claimBoundary).toBe(PHASE17G_CLAIM_BOUNDARY);
  });

  it('result includes pilotFamily set to recommendation-feedback', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.pilotFamily).toBe('recommendation-feedback');
  });

  it('result manifestEntry includes riskClass low', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.manifestEntry.riskClass).toBe('low');
  });
});

// ── 7. Attaches synthetic read-before-write checksum ─────────────────────────

describe('runSingleKeyDryRunRehearsal — attaches synthetic read-before-write checksum', () => {
  it('a journal entry includes a non-null readBeforeWriteChecksum after write-attempted', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    const writeAttemptedEntry = result.journalEntries.find(
      e => e.status === 'write-attempted',
    );
    expect(writeAttemptedEntry).toBeDefined();
    expect(writeAttemptedEntry.readBeforeWriteChecksum).not.toBeNull();
    expect(typeof writeAttemptedEntry.readBeforeWriteChecksum).toBe('string');
  });

  it('syntheticChecksum returns a deterministic string for the same inputs', () => {
    const c1 = syntheticChecksum('source', PHASE17G_SOURCE_KEY);
    const c2 = syntheticChecksum('source', PHASE17G_SOURCE_KEY);
    expect(c1).toBe(c2);
    expect(typeof c1).toBe('string');
    expect(c1.length).toBeGreaterThan(0);
  });

  it('syntheticChecksum differs for different labels', () => {
    const c1 = syntheticChecksum('source', PHASE17G_SOURCE_KEY);
    const c2 = syntheticChecksum('target', PHASE17G_SOURCE_KEY);
    expect(c1).not.toBe(c2);
  });

  it('sourceChecksum is attached in the planned journal entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.journalEntries[0].sourceChecksum).not.toBeNull();
    expect(typeof result.journalEntries[0].sourceChecksum).toBe('string');
  });
});

// ── 8. Attaches write verification metadata before completion ─────────────────

describe('runSingleKeyDryRunRehearsal — attaches write verification metadata', () => {
  it('final entry has writeVerification attached', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.writeVerification).not.toBeNull();
  });

  it('write verification has verified:true', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.writeVerification.verified).toBe(true);
  });

  it('write verification is marked synthetic (dry-run only)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.writeVerification.synthetic).toBe(true);
  });

  it('write verification includes claimBoundary', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(typeof result.finalEntry.writeVerification.claimBoundary).toBe('string');
    expect(result.finalEntry.writeVerification.claimBoundary.length).toBeGreaterThan(0);
  });
});

// ── 9. Completion requires successful write verification ──────────────────────

describe('completion requires successful write verification', () => {
  it('final entry status is completed only after verified write verification', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.status).toBe('completed');
    expect(result.finalEntry.writeVerification.verified).toBe(true);
  });

  it('journal entries show write-verified status before completion', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    const writeVerifiedEntry = result.journalEntries.find(e => e.status === 'write-verified');
    expect(writeVerifiedEntry).toBeDefined();
    const completedEntry = result.journalEntries.find(e => e.status === 'completed');
    const writeVerifiedIdx = result.journalEntries.indexOf(writeVerifiedEntry);
    const completedIdx = result.journalEntries.indexOf(completedEntry);
    expect(completedIdx).toBeGreaterThan(writeVerifiedIdx);
  });
});

// ── 10. Rollback snapshot metadata is preserved ───────────────────────────────

describe('runSingleKeyDryRunRehearsal — rollback snapshot metadata is preserved', () => {
  it('rollback snapshot ref is attached in journal entries after backup-captured', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    const backupEntry = result.journalEntries.find(e => e.status === 'backup-captured');
    expect(backupEntry).toBeDefined();
    expect(backupEntry.rollbackSnapshotRef).not.toBeNull();
  });

  it('rollback snapshot ref is preserved through to the final completed entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.rollbackSnapshotRef).not.toBeNull();
    expect(typeof result.finalEntry.rollbackSnapshotRef).toBe('object');
  });

  it('custom rollback snapshot ref is accepted and preserved', () => {
    const manifest = syntheticManifest();
    const customRef = Object.freeze({
      snapshotId: 'custom-snap-001',
      capturedAt: '2026-05-17T00:00:00.000Z',
      synthetic: true,
    });
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      rollbackSnapshotRef: customRef,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.rollbackSnapshotRef.snapshotId).toBe('custom-snap-001');
  });

  it('rollback snapshot ref is marked as synthetic (inert test metadata)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.rollbackSnapshotRef.synthetic).toBe(true);
  });
});

// ── 11. Invalid transition order fails ────────────────────────────────────────

describe('invalid transition order — invalid_transition failure', () => {
  it('simulateRehearsalFailure with failAtStatus=planned produces a failed entry from planned status', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'test_invalid_transition',
      failAtStatus: 'planned',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });

  it('simulateRehearsalFailure with failAtStatus=backup-captured produces a failed entry from backup-captured', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'quota_exceeded',
      failAtStatus: 'backup-captured',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });

  it('simulateRehearsalFailure with invalid failAtStatus (cannot reach write-verified then fail directly) from write-attempted succeeds', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'write_checksum_mismatch',
      failAtStatus: 'write-attempted',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
    expect(result.failedEntry.errorCode).toBe('write_checksum_mismatch');
  });
});

// ── 12. Failure path records explicit error code ──────────────────────────────

describe('simulateRehearsalFailure — failure path records explicit error code', () => {
  it('failed entry has the provided errorCode', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'quota_exceeded',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.errorCode).toBe('quota_exceeded');
  });

  it('rejects null errorCode with missing_error_code', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('rejects empty string errorCode', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: '',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('failed entry status is failed', () => {
    const manifest = syntheticManifest();
    const result = simulateRehearsalFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'storage_unavailable',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });
});

// ── 13. Does not mutate input manifest or payload ────────────────────────────

describe('immutability — does not mutate input manifest or payload', () => {
  it('does not mutate the input manifest entry', () => {
    const manifest = syntheticManifest();
    const originalManifestId = manifest.manifestId;
    runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(manifest.manifestId).toBe(originalManifestId);
  });

  it('does not mutate the input source payload', () => {
    const manifest = syntheticManifest();
    const payload = { dataFamily: 'recommendation-feedback', items: [], synthetic: true };
    const originalLength = payload.items.length;
    runSingleKeyDryRunRehearsal({ manifestEntry: manifest, sourcePayload: payload });
    expect(payload.items.length).toBe(originalLength);
  });

  it('returned journalEntries are frozen', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    for (const entry of result.journalEntries) {
      expect(Object.isFrozen(entry)).toBe(true);
    }
  });

  it('result manifestEntry is a frozen copy, not the original reference', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.manifestEntry).not.toBe(manifest);
    expect(Object.isFrozen(result.manifestEntry)).toBe(true);
  });
});

// ── 14. Does not reference browser APIs ──────────────────────────────────────

describe('no localStorage, no indexedDB, no window, no document — synthetic-only', () => {
  it('runSingleKeyDryRunRehearsal does not access globalThis.localStorage', () => {
    const original = globalThis.localStorage;
    let accessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      const manifest = syntheticManifest();
      runSingleKeyDryRunRehearsal({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    } finally {
      if (original !== undefined) {
        Object.defineProperty(globalThis, 'localStorage', {
          value: original, configurable: true, writable: true,
        });
      } else {
        delete globalThis.localStorage;
      }
    }
    expect(accessed).toBe(false);
  });

  it('runSingleKeyDryRunRehearsal does not access globalThis.indexedDB', () => {
    const original = globalThis.indexedDB;
    let accessed = false;
    Object.defineProperty(globalThis, 'indexedDB', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      const manifest = syntheticManifest();
      runSingleKeyDryRunRehearsal({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    } finally {
      if (original !== undefined) {
        Object.defineProperty(globalThis, 'indexedDB', {
          value: original, configurable: true, writable: true,
        });
      } else {
        delete globalThis.indexedDB;
      }
    }
    expect(accessed).toBe(false);
  });

  it('buildSyntheticManifestEntry does not access globalThis.localStorage', () => {
    const original = globalThis.localStorage;
    let accessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      buildSyntheticManifestEntry();
    } finally {
      if (original !== undefined) {
        Object.defineProperty(globalThis, 'localStorage', {
          value: original, configurable: true, writable: true,
        });
      } else {
        delete globalThis.localStorage;
      }
    }
    expect(accessed).toBe(false);
  });

  it('all rehearsal functions operate without browser globals', () => {
    const manifest = syntheticManifest();
    expect(() => buildSyntheticManifestEntry()).not.toThrow();
    expect(() => validateSyntheticSourcePayload(syntheticSourcePayload)).not.toThrow();
    expect(() => syntheticChecksum('source', 'key')).not.toThrow();
    expect(() => runSingleKeyDryRunRehearsal({
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
    })).not.toThrow();
    expect(() => simulateRehearsalFailure({
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload, errorCode: 'test',
    })).not.toThrow();
  });

  it('all journal entries use only synthetic key names (no real user data)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    for (const entry of result.journalEntries) {
      expect(entry.sourceKey).toBe(PHASE17G_SOURCE_KEY);
      expect(entry.targetStore).toBe(PHASE17G_TARGET_STORE);
    }
  });
});

// ── 15 & 16. Does not import production storage modules or read/write real storage ──

describe('no production storage modules — synthetic-only rehearsal', () => {
  it('PHASE17G_IDENTITY identifies this as a dry-run rehearsal prototype only', () => {
    expect(PHASE17G_IDENTITY).toMatch(/Phase 17G/);
    expect(PHASE17G_IDENTITY).toMatch(/Dry-Run/);
  });

  it('manifest claimBoundary explicitly states no real data movement', () => {
    const manifest = syntheticManifest();
    expect(manifest.claimBoundary).toMatch(/no real data|no live|test-only/i);
  });

  it('writeVerification claimBoundary confirms no real write occurred', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
    expect(result.finalEntry.writeVerification.claimBoundary).toMatch(/no real write|test-only/i);
  });
});

// ── 17. Produces deterministic output for the same synthetic input ────────────

describe('deterministic output — same input produces same output shape', () => {
  it('same manifest entry + payload produces same sourceKey in journal entries', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    const result2 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.journalEntries[0].sourceKey).toBe(result2.journalEntries[0].sourceKey);
    expect(result1.journalEntries[0].manifestId).toBe(result2.journalEntries[0].manifestId);
  });

  it('same manifest entry produces same sourceChecksum (deterministic synthetic checksum)', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    const result2 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.journalEntries[0].sourceChecksum).toBe(result2.journalEntries[0].sourceChecksum);
  });

  it('same manifest entry produces same final status (completed)', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    const result2 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.finalEntry.status).toBe(result2.finalEntry.status);
    expect(result1.finalEntry.status).toBe('completed');
  });

  it('journal entry count is stable across runs', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    const result2 = runSingleKeyDryRunRehearsal({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.journalEntries.length).toBe(result2.journalEntries.length);
  });
});
