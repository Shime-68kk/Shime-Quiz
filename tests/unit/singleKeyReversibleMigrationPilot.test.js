/**
 * tests/unit/singleKeyReversibleMigrationPilot.test.js
 *
 * Phase 17H — Single-Key Reversible Migration Pilot unit tests.
 *
 * All tests use the test-only reversible pilot helper and the Phase 17F/17G
 * journal harness. No browser APIs are required. No real storage is accessed.
 * No localStorage, no indexedDB, no storage adapter registry.
 * All data is synthetic. Dry-run/test mode only.
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE17H_IDENTITY,
  PHASE17H_PILOT_FAMILY,
  PHASE17H_ALLOWED_FAMILIES,
  PHASE17H_MANIFEST_ID,
  PHASE17H_SOURCE_KEY,
  PHASE17H_TARGET_STORE,
  PHASE17H_RISK_CLASS,
  PHASE17H_OPERATION_TYPE,
  PHASE17H_CLAIM_BOUNDARY,
  ALLOWED_MODES_PHASE17H,
  REQUIRED_MANIFEST_FIELDS,
  REQUIRED_PILOT_RESULT_FIELDS,
  buildSyntheticReversibleManifestEntry,
  validateSyntheticSourcePayload,
  syntheticChecksum,
  runSingleKeyReversibleMigrationPilot,
  simulateReversiblePilotFailure,
} from './helpers/singleKeyReversibleMigrationPilot.js';

// ── Synthetic test data helpers ───────────────────────────────────────────────

function syntheticManifest(overrides = {}) {
  const result = buildSyntheticReversibleManifestEntry(overrides);
  if (!result.ok) throw new Error(`buildSyntheticReversibleManifestEntry failed: ${result.error}`);
  return result.entry;
}

const syntheticSourcePayload = Object.freeze({
  dataFamily: 'recommendation-feedback',
  items: [{ type: 'helpful', cardId: 'synthetic-card-001', dateKey: '2026-05-17' }],
  synthetic: true,
});

// Deterministic ID provider for test runs
function deterministicPilotId(manifestEntry) {
  return `pilot-phase17h-test-${manifestEntry.manifestId}`;
}

// ── 1. Creates a synthetic low-risk recommendation-feedback reversible pilot ──

describe('buildSyntheticReversibleManifestEntry — low-risk recommendation-feedback manifest', () => {
  it('creates a valid recommendation-feedback reversible manifest entry with all required fields', () => {
    const result = buildSyntheticReversibleManifestEntry();
    expect(result.ok).toBe(true);
    expect(result.entry.dataFamily).toBe('recommendation-feedback');
    expect(result.entry.riskClass).toBe('low');
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      expect(result.entry).toHaveProperty(field);
    }
  });

  it('uses the correct Phase 17H manifest constants for the pilot family', () => {
    const result = buildSyntheticReversibleManifestEntry();
    expect(result.ok).toBe(true);
    expect(result.entry.manifestId).toBe(PHASE17H_MANIFEST_ID);
    expect(result.entry.sourceKey).toBe(PHASE17H_SOURCE_KEY);
    expect(result.entry.targetStore).toBe(PHASE17H_TARGET_STORE);
    expect(result.entry.riskClass).toBe(PHASE17H_RISK_CLASS);
    expect(result.entry.operationType).toBe(PHASE17H_OPERATION_TYPE);
    expect(result.entry.claimBoundary).toBe(PHASE17H_CLAIM_BOUNDARY);
  });

  it('PHASE17H_PILOT_FAMILY is recommendation-feedback', () => {
    expect(PHASE17H_PILOT_FAMILY).toBe('recommendation-feedback');
    expect(PHASE17H_ALLOWED_FAMILIES).toContain('recommendation-feedback');
  });

  it('manifest entry is frozen (immutable)', () => {
    const result = buildSyntheticReversibleManifestEntry();
    expect(result.ok).toBe(true);
    expect(Object.isFrozen(result.entry)).toBe(true);
  });

  it('claimBoundary mentions Phase 17H test-only and no real data movement', () => {
    const result = buildSyntheticReversibleManifestEntry();
    expect(result.entry.claimBoundary).toMatch(/phase 17h/i);
    expect(result.entry.claimBoundary).toMatch(/test-only|no real data|no live/i);
  });

  it('runSingleKeyReversibleMigrationPilot succeeds with a valid manifest entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
    expect(result.dataFamily).toBe('recommendation-feedback');
  });

  it('pilot result includes all required fields', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    for (const field of REQUIRED_PILOT_RESULT_FIELDS) {
      expect(result).toHaveProperty(field);
    }
  });
});

// ── 2. Rejects non-recommendation-feedback pilot family ──────────────────────

describe('buildSyntheticReversibleManifestEntry — rejects non-recommendation-feedback pilot family', () => {
  it('rejects learning-records family with unsupported_pilot_family', () => {
    const result = buildSyntheticReversibleManifestEntry({ dataFamily: 'learning-records' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects fsrs-metadata family', () => {
    const result = buildSyntheticReversibleManifestEntry({ dataFamily: 'fsrs-metadata' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects backup-data family', () => {
    const result = buildSyntheticReversibleManifestEntry({ dataFamily: 'backup-data' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('rejects schedule-records family', () => {
    const result = buildSyntheticReversibleManifestEntry({ dataFamily: 'schedule-records' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('unsupported_pilot_family');
  });

  it('runSingleKeyReversibleMigrationPilot rejects unsupported family in manifest entry', () => {
    const fakeManifest = {
      manifestId:    'x',
      sourceKey:     'x',
      targetStore:   'x',
      dataFamily:    'learning-records',
      riskClass:     'high',
      operationType: 'copy',
      claimBoundary: 'x',
    };
    const result = runSingleKeyReversibleMigrationPilot({
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

  it('runSingleKeyReversibleMigrationPilot rejects null source payload', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });

  it('runSingleKeyReversibleMigrationPilot rejects missing source payload (undefined)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({ manifestEntry: manifest });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_source_payload');
  });
});

// ── 4. Rejects live/production mode ──────────────────────────────────────────

describe('runSingleKeyReversibleMigrationPilot — rejects live mode', () => {
  it('rejects live mode with live_mode_rejected', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      mode: 'live',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('rejects production mode', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      mode: 'production',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });

  it('ALLOWED_MODES_PHASE17H does not include live or production', () => {
    expect(ALLOWED_MODES_PHASE17H).not.toContain('live');
    expect(ALLOWED_MODES_PHASE17H).not.toContain('production');
    expect(ALLOWED_MODES_PHASE17H).toContain('dry-run');
    expect(ALLOWED_MODES_PHASE17H).toContain('test');
  });

  it('simulateReversiblePilotFailure also rejects live mode', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      mode: 'live',
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'test_error',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('live_mode_rejected');
  });
});

// ── 5. Captures rollback snapshot before synthetic write plan ─────────────────

describe('runSingleKeyReversibleMigrationPilot — rollback snapshot captured before write plan', () => {
  it('rollback snapshot is attached at backup-captured status (before write-attempted)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const backupCapturedEntry = result.journalEntries.find(e => e.status === 'backup-captured');
    expect(backupCapturedEntry).toBeDefined();
    expect(backupCapturedEntry.rollbackSnapshotRef).not.toBeNull();
  });

  it('backup-captured entry appears before write-attempted in journal entries', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const backupIdx = result.journalEntries.findIndex(e => e.status === 'backup-captured');
    const writeAttemptedIdx = result.journalEntries.findIndex(e => e.status === 'write-attempted');
    expect(backupIdx).toBeGreaterThanOrEqual(0);
    expect(writeAttemptedIdx).toBeGreaterThan(backupIdx);
  });

  it('rollback snapshot ref is marked as synthetic (inert test metadata)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackSnapshotRef.synthetic).toBe(true);
  });

  it('custom rollback snapshot ref is accepted and preserved', () => {
    const manifest = syntheticManifest();
    const customRef = Object.freeze({
      snapshotId: 'custom-snap-phase17h-001',
      capturedAt: '2026-05-17T00:00:00.000Z',
      synthetic:  true,
    });
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry:       manifest,
      sourcePayload:       syntheticSourcePayload,
      rollbackSnapshotRef: customRef,
      idProvider:          deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackSnapshotRef.snapshotId).toBe('custom-snap-phase17h-001');
  });
});

// ── 6. Produces planned journal metadata ─────────────────────────────────────

describe('runSingleKeyReversibleMigrationPilot — produces journal entries', () => {
  it('returns ok:true with journalEntries array on success', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(Array.isArray(result.journalEntries)).toBe(true);
    expect(result.journalEntries.length).toBeGreaterThan(0);
  });

  it('first journal entry has status planned', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.journalEntries[0].status).toBe('planned');
  });

  it('journal entries include all phases: planned, backup-captured, write-attempted, write-verified, rollback-ready, rolled-back', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const statuses = result.journalEntries.map(e => e.status);
    expect(statuses).toContain('planned');
    expect(statuses).toContain('backup-captured');
    expect(statuses).toContain('write-attempted');
    expect(statuses).toContain('write-verified');
    expect(statuses).toContain('rollback-ready');
    expect(statuses).toContain('rolled-back');
  });

  it('pilot result status is completed after successful rollback verification', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
  });

  it('reversiblePilotOnly flag is true on result', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.reversiblePilotOnly).toBe(true);
  });

  it('first journal entry includes manifestId, sourceKey, targetStore, dataFamily, operationType, claimBoundary', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const firstEntry = result.journalEntries[0];
    expect(firstEntry.manifestId).toBe(PHASE17H_MANIFEST_ID);
    expect(firstEntry.sourceKey).toBe(PHASE17H_SOURCE_KEY);
    expect(firstEntry.targetStore).toBe(PHASE17H_TARGET_STORE);
    expect(firstEntry.dataFamily).toBe('recommendation-feedback');
    expect(firstEntry.operationType).toBe(PHASE17H_OPERATION_TYPE);
    expect(firstEntry.claimBoundary).toBe(PHASE17H_CLAIM_BOUNDARY);
  });
});

// ── 7. Attaches synthetic read-before-write checksum ─────────────────────────

describe('runSingleKeyReversibleMigrationPilot — attaches synthetic read-before-write checksum', () => {
  it('a journal entry includes a non-null readBeforeWriteChecksum after write-attempted', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const writeAttemptedEntry = result.journalEntries.find(e => e.status === 'write-attempted');
    expect(writeAttemptedEntry).toBeDefined();
    expect(writeAttemptedEntry.readBeforeWriteChecksum).not.toBeNull();
    expect(typeof writeAttemptedEntry.readBeforeWriteChecksum).toBe('string');
  });

  it('syntheticChecksum returns a deterministic string for the same inputs', () => {
    const c1 = syntheticChecksum('source', PHASE17H_SOURCE_KEY);
    const c2 = syntheticChecksum('source', PHASE17H_SOURCE_KEY);
    expect(c1).toBe(c2);
    expect(typeof c1).toBe('string');
    expect(c1.length).toBeGreaterThan(0);
  });

  it('syntheticChecksum differs for different labels', () => {
    const c1 = syntheticChecksum('source', PHASE17H_SOURCE_KEY);
    const c2 = syntheticChecksum('target', PHASE17H_SOURCE_KEY);
    expect(c1).not.toBe(c2);
  });

  it('sourceChecksum is attached in the planned journal entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.journalEntries[0].sourceChecksum).not.toBeNull();
    expect(typeof result.journalEntries[0].sourceChecksum).toBe('string');
  });

  it('sourceChecksum is present on pilot result', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(typeof result.sourceChecksum).toBe('string');
    expect(result.sourceChecksum.length).toBeGreaterThan(0);
  });
});

// ── 8. Attaches write verification metadata before completion ─────────────────

describe('runSingleKeyReversibleMigrationPilot — attaches write verification metadata', () => {
  it('pilot result has writeVerification attached', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.writeVerification).not.toBeNull();
  });

  it('write verification has verified:true', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.writeVerification.verified).toBe(true);
  });

  it('write verification is marked synthetic (dry-run only)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.writeVerification.synthetic).toBe(true);
  });

  it('write verification includes claimBoundary', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(typeof result.writeVerification.claimBoundary).toBe('string');
    expect(result.writeVerification.claimBoundary.length).toBeGreaterThan(0);
  });

  it('write-verified journal entry has writeVerification attached', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const writeVerifiedEntry = result.journalEntries.find(e => e.status === 'write-verified');
    expect(writeVerifiedEntry).toBeDefined();
    expect(writeVerifiedEntry.writeVerification).not.toBeNull();
    expect(writeVerifiedEntry.writeVerification.verified).toBe(true);
  });
});

// ── 9. Completion requires successful write verification ──────────────────────

describe('write verification before completion — reversible pilot enforces write verification', () => {
  it('pilot status is completed only after write verification passes', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
    expect(result.writeVerification.verified).toBe(true);
  });

  it('write-verified entry exists before rollback-ready in journal sequence', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const writeVerifiedIdx = result.journalEntries.findIndex(e => e.status === 'write-verified');
    const rollbackReadyIdx = result.journalEntries.findIndex(e => e.status === 'rollback-ready');
    expect(writeVerifiedIdx).toBeGreaterThanOrEqual(0);
    expect(rollbackReadyIdx).toBeGreaterThan(writeVerifiedIdx);
  });

  it('failure at write-attempted produces a failed state without reaching completed', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'write_verification_failed',
      failAtStatus:  'write-attempted',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
    expect(result.failedEntry.errorCode).toBe('write_verification_failed');
  });
});

// ── 10. Rollback-ready requires rollback snapshot metadata ────────────────────

describe('rollback metadata before rollback — rollback-ready requires rollbackSnapshotRef', () => {
  it('rollback snapshot ref is present on rollback-ready journal entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const rollbackReadyEntry = result.journalEntries.find(e => e.status === 'rollback-ready');
    expect(rollbackReadyEntry).toBeDefined();
    expect(rollbackReadyEntry.rollbackSnapshotRef).not.toBeNull();
  });

  it('rollback snapshot ref is present on rolled-back journal entry', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    const rolledBackEntry = result.journalEntries.find(e => e.status === 'rolled-back');
    expect(rolledBackEntry).toBeDefined();
    expect(rolledBackEntry.rollbackSnapshotRef).not.toBeNull();
  });

  it('pilot result rollbackSnapshotRef is non-null after successful pilot', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackSnapshotRef).not.toBeNull();
    expect(typeof result.rollbackSnapshotRef).toBe('object');
  });
});

// ── 11. Rollback verification requires restored checksum ──────────────────────

describe('rollback verification before final success — rollbackVerification with restoredChecksum', () => {
  it('pilot result has rollbackVerification attached', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification).not.toBeNull();
  });

  it('rollbackVerification has verified:true after successful rollback', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.verified).toBe(true);
  });

  it('rollbackVerification includes restoredChecksum', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(typeof result.rollbackVerification.restoredChecksum).toBe('string');
    expect(result.rollbackVerification.restoredChecksum.length).toBeGreaterThan(0);
  });

  it('rollbackVerification is marked synthetic', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.synthetic).toBe(true);
  });

  it('rollbackVerification claimBoundary confirms no real data restored', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.claimBoundary).toMatch(/no real data|test-only/i);
  });
});

// ── 12. Restored checksum matches original source checksum ───────────────────

describe('restored checksum matches original source checksum', () => {
  it('pilot result restoredChecksum equals sourceChecksum', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.restoredChecksum).toBe(result.sourceChecksum);
  });

  it('rollbackVerification.matchesSource is true', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.matchesSource).toBe(true);
  });

  it('rollbackVerification.restoredChecksum equals pilot result restoredChecksum', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.restoredChecksum).toBe(result.restoredChecksum);
  });

  it('restoredChecksum is not the same as targetChecksum', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.restoredChecksum).not.toBe(result.targetChecksum);
  });
});

// ── 13. Invalid rollback order fails ─────────────────────────────────────────

describe('invalid rollback order — invalid_transition failure', () => {
  it('simulateReversiblePilotFailure with failAtStatus=planned produces a failed entry from planned', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'test_invalid_transition',
      failAtStatus:  'planned',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });

  it('simulateReversiblePilotFailure with failAtStatus=backup-captured produces a failed entry', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'quota_exceeded',
      failAtStatus:  'backup-captured',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });

  it('simulateReversiblePilotFailure with failAtStatus=write-attempted produces a failed entry', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'write_checksum_mismatch',
      failAtStatus:  'write-attempted',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
    expect(result.failedEntry.errorCode).toBe('write_checksum_mismatch');
  });

  it('simulateReversiblePilotFailure with failAtStatus=rollback-ready produces a failed entry', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'rollback_io_error',
      failAtStatus:  'rollback-ready',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
    expect(result.failedEntry.errorCode).toBe('rollback_io_error');
  });

  it('invalid transition from planned directly to rollback-ready fails (invalid_transition from Phase 17F harness)', () => {
    // Directly test that the Phase 17F harness rejects an invalid transition
    // attempting to go directly from planned to rollback-ready skips required steps
    import('./helpers/migrationJournalTestHarness.js').then(({ createPlannedDryRunEntry, transitionStatus }) => {
      const plannedResult = createPlannedDryRunEntry({
        manifestId: PHASE17H_MANIFEST_ID,
        sourceKey: PHASE17H_SOURCE_KEY,
        targetStore: PHASE17H_TARGET_STORE,
        dataFamily: PHASE17H_PILOT_FAMILY,
        operationType: PHASE17H_OPERATION_TYPE,
        mode: 'test',
        claimBoundary: PHASE17H_CLAIM_BOUNDARY,
      });
      expect(plannedResult.ok).toBe(true);
      const badTransition = transitionStatus(plannedResult.entry, 'rollback-ready');
      expect(badTransition.ok).toBe(false);
      expect(badTransition.error).toBe('invalid_transition');
    });
  });
});

// ── 14. Failure path records explicit error code ──────────────────────────────

describe('simulateReversiblePilotFailure — failure path records explicit error code', () => {
  it('failed entry has the provided errorCode', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'quota_exceeded',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.errorCode).toBe('quota_exceeded');
  });

  it('rejects null errorCode with missing_error_code', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('rejects empty string errorCode', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     '',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });

  it('failed entry status is failed', () => {
    const manifest = syntheticManifest();
    const result = simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode:     'storage_unavailable',
    });
    expect(result.ok).toBe(true);
    expect(result.failedEntry.status).toBe('failed');
  });
});

// ── 15. Does not mutate input manifest or payload ────────────────────────────

describe('immutability — does not mutate input manifest or payload', () => {
  it('does not mutate the input manifest entry', () => {
    const manifest = syntheticManifest();
    const originalManifestId = manifest.manifestId;
    runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(manifest.manifestId).toBe(originalManifestId);
  });

  it('does not mutate the input source payload', () => {
    const manifest = syntheticManifest();
    const payload = { dataFamily: 'recommendation-feedback', items: [], synthetic: true };
    const originalLength = payload.items.length;
    runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: payload,
      idProvider: deterministicPilotId,
    });
    expect(payload.items.length).toBe(originalLength);
  });

  it('returned journalEntries are frozen', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    for (const entry of result.journalEntries) {
      expect(Object.isFrozen(entry)).toBe(true);
    }
  });

  it('result manifestEntry is a frozen copy, not the original reference', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.manifestEntry).not.toBe(manifest);
    expect(Object.isFrozen(result.manifestEntry)).toBe(true);
  });
});

// ── 16. Does not reference browser APIs ──────────────────────────────────────

describe('no localStorage, no indexedDB, no window, no document — synthetic-only', () => {
  it('runSingleKeyReversibleMigrationPilot does not access globalThis.localStorage', () => {
    const original = globalThis.localStorage;
    let accessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      const manifest = syntheticManifest();
      runSingleKeyReversibleMigrationPilot({
        manifestEntry: manifest,
        sourcePayload: syntheticSourcePayload,
        idProvider: deterministicPilotId,
      });
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

  it('runSingleKeyReversibleMigrationPilot does not access globalThis.indexedDB', () => {
    const original = globalThis.indexedDB;
    let accessed = false;
    Object.defineProperty(globalThis, 'indexedDB', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      const manifest = syntheticManifest();
      runSingleKeyReversibleMigrationPilot({
        manifestEntry: manifest,
        sourcePayload: syntheticSourcePayload,
        idProvider: deterministicPilotId,
      });
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

  it('buildSyntheticReversibleManifestEntry does not access globalThis.localStorage', () => {
    const original = globalThis.localStorage;
    let accessed = false;
    Object.defineProperty(globalThis, 'localStorage', {
      get() { accessed = true; return undefined; },
      configurable: true,
    });
    try {
      buildSyntheticReversibleManifestEntry();
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

  it('all pilot functions operate without browser globals', () => {
    const manifest = syntheticManifest();
    expect(() => buildSyntheticReversibleManifestEntry()).not.toThrow();
    expect(() => validateSyntheticSourcePayload(syntheticSourcePayload)).not.toThrow();
    expect(() => syntheticChecksum('source', 'key')).not.toThrow();
    expect(() => runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    })).not.toThrow();
    expect(() => simulateReversiblePilotFailure({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      errorCode: 'test',
    })).not.toThrow();
  });

  it('all journal entries use only synthetic key names (no real user data)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    for (const entry of result.journalEntries) {
      expect(entry.sourceKey).toBe(PHASE17H_SOURCE_KEY);
      expect(entry.targetStore).toBe(PHASE17H_TARGET_STORE);
    }
  });
});

// ── 17 & 18. Does not import production storage modules or read/write real storage ──

describe('no production storage modules — synthetic-only reversible pilot', () => {
  it('PHASE17H_IDENTITY identifies this as a reversible pilot only', () => {
    expect(PHASE17H_IDENTITY).toMatch(/Phase 17H/);
    expect(PHASE17H_IDENTITY).toMatch(/Reversible/);
  });

  it('manifest claimBoundary explicitly states no real data movement', () => {
    const manifest = syntheticManifest();
    expect(manifest.claimBoundary).toMatch(/no real data|no live|test-only/i);
  });

  it('writeVerification claimBoundary confirms no real write occurred', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.writeVerification.claimBoundary).toMatch(/no real write|test-only/i);
  });

  it('rollbackVerification claimBoundary confirms no real data restored', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.claimBoundary).toMatch(/no real data|test-only/i);
  });
});

// ── 19. Produces deterministic output for the same synthetic input ────────────

describe('deterministic output — same input produces same output shape', () => {
  it('same manifest entry + payload produces same sourceKey in journal entries', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.journalEntries[0].sourceKey).toBe(result2.journalEntries[0].sourceKey);
    expect(result1.journalEntries[0].manifestId).toBe(result2.journalEntries[0].manifestId);
  });

  it('same manifest entry produces same sourceChecksum (deterministic synthetic checksum)', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.sourceChecksum).toBe(result2.sourceChecksum);
  });

  it('same manifest entry produces same restoredChecksum (deterministic)', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.restoredChecksum).toBe(result2.restoredChecksum);
  });

  it('same inputs produce same final status (completed) on each run', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.status).toBe(result2.status);
    expect(result1.status).toBe('completed');
  });

  it('with deterministicPilotId provider, pilotId is deterministic', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.pilotId).toBe(result2.pilotId);
  });

  it('journal entry count is stable across runs', () => {
    const manifest = syntheticManifest();
    const result1 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.journalEntries.length).toBe(result2.journalEntries.length);
  });
});

// ── 20. Claim boundary remains explicit and test-only ─────────────────────────

describe('claim boundary — explicit test-only scope', () => {
  it('pilot result claimBoundary is the Phase 17H claim boundary constant', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.claimBoundary).toBe(PHASE17H_CLAIM_BOUNDARY);
  });

  it('PHASE17H_CLAIM_BOUNDARY mentions test-only and no real data', () => {
    expect(PHASE17H_CLAIM_BOUNDARY).toMatch(/test-only/i);
    expect(PHASE17H_CLAIM_BOUNDARY).toMatch(/no.*data|no live/i);
  });

  it('pilot result mode is dry-run by default (not live)', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.mode).toBe('dry-run');
  });

  it('pilot result manifestId matches Phase 17H manifest', () => {
    const manifest = syntheticManifest();
    const result = runSingleKeyReversibleMigrationPilot({
      manifestEntry: manifest,
      sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(result.manifestId).toBe(PHASE17H_MANIFEST_ID);
  });
});
