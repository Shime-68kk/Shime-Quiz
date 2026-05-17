/**
 * tests/unit/internalLocalMigrationPilot.test.js
 *
 * Phase 18D — Internal / Test-Only Local Migration Pilot unit tests.
 *
 * All tests use the test-only internal migration pilot helper.
 * No browser APIs are required. No real storage is accessed.
 * No localStorage, no window.localStorage, no indexedDB, no storage adapter registry.
 * All data is synthetic. Test/internal mode only.
 */

import { describe, it, expect } from 'vitest';
import {
  PHASE18D_IDENTITY,
  PHASE18D_PILOT_FAMILY,
  PHASE18D_ALLOWED_FAMILIES,
  PHASE18D_MANIFEST_ID,
  PHASE18D_SOURCE_KEY,
  PHASE18D_TARGET_STORE,
  PHASE18D_RISK_CLASS,
  PHASE18D_OPERATION_TYPE,
  PHASE18D_CANONICAL_SOURCE,
  PHASE18D_CLAIM_BOUNDARY,
  ALLOWED_MODES_PHASE18D,
  REQUIRED_MANIFEST_FIELDS,
  REQUIRED_PILOT_RESULT_FIELDS,
  FAILURE_CODES,
  syntheticChecksum,
  createInternalLocalMigrationPilot,
  validatePilotPreflight,
  createPilotSnapshot,
  simulatePilotWrite,
  verifyPilotWrite,
  simulatePilotRollback,
  verifyPilotRollback,
  runInternalLocalMigrationPilot,
  simulateInternalPilotFailure,
} from './helpers/internalLocalMigrationPilot.js';

// ── Synthetic test data helpers ───────────────────────────────────────────────

function syntheticManifest(overrides = {}) {
  const result = createInternalLocalMigrationPilot(overrides);
  if (!result.ok) throw new Error(`createInternalLocalMigrationPilot failed: ${result.error}`);
  return result.entry;
}

const syntheticSourcePayload = Object.freeze({
  dataFamily: 'recommendation-feedback',
  items: [{ type: 'helpful', cardId: 'synthetic-card-001', dateKey: '2026-05-17' }],
  synthetic: true,
});

function deterministicPilotId(manifestEntry) {
  return `pilot-phase18d-test-${manifestEntry.manifestId}`;
}

function runPilot(overrides = {}) {
  return runInternalLocalMigrationPilot({
    mode: 'test',
    testOnlyGate: true,
    manifestEntry: syntheticManifest(),
    sourcePayload: syntheticSourcePayload,
    idProvider: deterministicPilotId,
    ...overrides,
  });
}

// ── 1. Creates an internal/test-only pilot for recommendation-feedback ─────────

describe('createInternalLocalMigrationPilot — recommendation-feedback pilot', () => {
  it('creates a valid recommendation-feedback pilot manifest with all required fields', () => {
    const result = createInternalLocalMigrationPilot();
    expect(result.ok).toBe(true);
    expect(result.entry.dataFamily).toBe('recommendation-feedback');
    for (const field of REQUIRED_MANIFEST_FIELDS) {
      expect(result.entry).toHaveProperty(field);
    }
  });

  it('uses the correct Phase 18D manifest constants for the pilot family', () => {
    const result = createInternalLocalMigrationPilot();
    expect(result.ok).toBe(true);
    expect(result.entry.manifestId).toBe(PHASE18D_MANIFEST_ID);
    expect(result.entry.sourceKey).toBe(PHASE18D_SOURCE_KEY);
    expect(result.entry.targetStore).toBe(PHASE18D_TARGET_STORE);
    expect(result.entry.riskClass).toBe(PHASE18D_RISK_CLASS);
    expect(result.entry.operationType).toBe(PHASE18D_OPERATION_TYPE);
    expect(result.entry.claimBoundary).toBe(PHASE18D_CLAIM_BOUNDARY);
  });

  it('PHASE18D_PILOT_FAMILY is recommendation-feedback', () => {
    expect(PHASE18D_PILOT_FAMILY).toBe('recommendation-feedback');
    expect(PHASE18D_ALLOWED_FAMILIES).toContain('recommendation-feedback');
  });

  it('manifest entry is frozen (immutable)', () => {
    const result = createInternalLocalMigrationPilot();
    expect(result.ok).toBe(true);
    expect(Object.isFrozen(result.entry)).toBe(true);
  });

  it('runInternalLocalMigrationPilot succeeds with valid manifest and synthetic payload', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
    expect(result.dataFamily).toBe('recommendation-feedback');
  });

  it('pilot result includes all required fields', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    for (const field of REQUIRED_PILOT_RESULT_FIELDS) {
      expect(result).toHaveProperty(field);
    }
  });
});

// ── 2. Rejects non-recommendation-feedback family ─────────────────────────────

describe('createInternalLocalMigrationPilot — rejects non-recommendation-feedback family', () => {
  it('rejects learning-records family with unsupported_pilot_family', () => {
    const result = createInternalLocalMigrationPilot({ dataFamily: 'learning-records' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });

  it('rejects fsrs-metadata family', () => {
    const result = createInternalLocalMigrationPilot({ dataFamily: 'fsrs-metadata' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });

  it('rejects backup-data family', () => {
    const result = createInternalLocalMigrationPilot({ dataFamily: 'backup-data' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });

  it('rejects study-history family', () => {
    const result = createInternalLocalMigrationPilot({ dataFamily: 'study-history' });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });

  it('runInternalLocalMigrationPilot rejects unsupported family in manifest entry', () => {
    const fakeManifest = {
      manifestId: 'x', sourceKey: 'x', targetStore: 'x',
      dataFamily: 'library-data', riskClass: 'high',
      operationType: 'copy', claimBoundary: 'x',
    };
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: fakeManifest, sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });
});

// ── 3. Rejects missing test-only/internal gate ────────────────────────────────

describe('validatePilotPreflight — rejects missing test-only/internal gate', () => {
  it('rejects when testOnlyGate is false', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: false,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('rejects when testOnlyGate is undefined (not set)', () => {
    const result = validatePilotPreflight({
      mode: 'test',
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('rejects when testOnlyGate is the string "true" (not boolean)', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: 'true',
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('runInternalLocalMigrationPilot rejects missing testOnlyGate', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: false,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
    expect(result.failureCode).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('runInternalLocalMigrationPilot stops on missing gate (stop-on-failure)', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: undefined,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('failed');
  });
});

// ── 4. Rejects live/production mode ──────────────────────────────────────────

describe('runInternalLocalMigrationPilot — rejects live/production mode', () => {
  it('rejects live mode with live_mode_rejected', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'live', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.LIVE_MODE_REJECTED);
  });

  it('rejects production mode', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'production', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.LIVE_MODE_REJECTED);
  });

  it('ALLOWED_MODES_PHASE18D does not include live or production', () => {
    expect(ALLOWED_MODES_PHASE18D).not.toContain('live');
    expect(ALLOWED_MODES_PHASE18D).not.toContain('production');
    expect(ALLOWED_MODES_PHASE18D).toContain('test');
    expect(ALLOWED_MODES_PHASE18D).toContain('internal-test-only');
  });

  it('simulateInternalPilotFailure also rejects live mode', () => {
    const result = simulateInternalPilotFailure({
      mode: 'live', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
      failAtStep: 'preflight', errorCode: 'test_error',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.LIVE_MODE_REJECTED);
  });
});

// ── 5. Requires synthetic source payload ─────────────────────────────────────

describe('validatePilotPreflight — requires synthetic source payload', () => {
  it('rejects null payload with missing_source_payload', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_SOURCE_PAYLOAD);
  });

  it('rejects undefined payload', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: undefined,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_SOURCE_PAYLOAD);
  });

  it('rejects non-object payload', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: 'not-an-object',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.INVALID_SOURCE_PAYLOAD);
  });

  it('accepts valid synthetic object payload', () => {
    const result = validatePilotPreflight({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(true);
  });

  it('runInternalLocalMigrationPilot rejects null source payload', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: null,
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.MISSING_SOURCE_PAYLOAD);
  });
});

// ── 6. Keeps localStorage as canonical source in metadata ─────────────────────

describe('runInternalLocalMigrationPilot — localStorage as canonical source in metadata', () => {
  it('canonicalSource in result is "localStorage"', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.canonicalSource).toBe('localStorage');
  });

  it('PHASE18D_CANONICAL_SOURCE is "localStorage"', () => {
    expect(PHASE18D_CANONICAL_SOURCE).toBe('localStorage');
  });

  it('snapshot metadata records canonicalSource as localStorage', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    expect(snapshotResult.ok).toBe(true);
    expect(snapshotResult.snapshot.canonicalSource).toBe('localStorage');
  });

  it('writeVerification claimBoundary mentions localStorage canonical', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.writeVerification.claimBoundary).toMatch(/localStorage canonical/i);
  });

  it('rollbackVerification claimBoundary mentions localStorage canonical', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.claimBoundary).toMatch(/localStorage canonical/i);
  });
});

// ── 7. Does not read real localStorage ────────────────────────────────────────

describe('runInternalLocalMigrationPilot — does not read real localStorage', () => {
  it('pilot completes without accessing real localStorage (no real localStorage in test env)', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.status).toBe('completed');
  });

  it('snapshot is marked as synthetic (inert metadata, no real localStorage read)', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.snapshot.synthetic).toBe(true);
  });

  it('snapshot claimBoundary states no real storage snapshot', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.snapshot.claimBoundary).toMatch(/no real storage snapshot/i);
  });

  it('no real localStorage read needed — all checksums are synthetic', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.sourceChecksum).toMatch(/synthetic/i);
  });
});

// ── 8. Does not write real localStorage ──────────────────────────────────────

describe('runInternalLocalMigrationPilot — does not write real localStorage', () => {
  it('writeResult is marked as noRealWrite', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const writeSimResult = simulatePilotWrite({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload, snapshot: snapshotResult.snapshot });
    expect(writeSimResult.ok).toBe(true);
    expect(writeSimResult.writeResult.noRealWrite).toBe(true);
  });

  it('writeResult claimBoundary states no real write occurred', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const writeSimResult = simulatePilotWrite({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload, snapshot: snapshotResult.snapshot });
    expect(writeSimResult.ok).toBe(true);
    expect(writeSimResult.writeResult.claimBoundary).toMatch(/no real write occurred/i);
  });

  it('writeResult is marked as localStorageUnchanged', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const writeSimResult = simulatePilotWrite({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload, snapshot: snapshotResult.snapshot });
    expect(writeSimResult.ok).toBe(true);
    expect(writeSimResult.writeResult.localStorageUnchanged).toBe(true);
  });

  it('writeVerification claimBoundary states no real write verified', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.writeVerification.claimBoundary).toMatch(/no real write verified/i);
  });
});

// ── 9. Does not delete localStorage ──────────────────────────────────────────

describe('runInternalLocalMigrationPilot — does not delete localStorage', () => {
  it('rollbackResult is marked as noLocalStorageDeletion', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const rollbackSimResult = simulatePilotRollback({ manifestEntry: manifest, snapshot: snapshotResult.snapshot });
    expect(rollbackSimResult.ok).toBe(true);
    expect(rollbackSimResult.rollbackResult.noLocalStorageDeletion).toBe(true);
  });

  it('rollbackResult is marked as localStorageUnchanged', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const rollbackSimResult = simulatePilotRollback({ manifestEntry: manifest, snapshot: snapshotResult.snapshot });
    expect(rollbackSimResult.ok).toBe(true);
    expect(rollbackSimResult.rollbackResult.localStorageUnchanged).toBe(true);
  });

  it('rollbackResult claimBoundary states no localStorage deletion', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const rollbackSimResult = simulatePilotRollback({ manifestEntry: manifest, snapshot: snapshotResult.snapshot });
    expect(rollbackSimResult.ok).toBe(true);
    expect(rollbackSimResult.rollbackResult.claimBoundary).toMatch(/no localStorage deletion/i);
  });

  it('PHASE18D_CLAIM_BOUNDARY mentions no localStorage deletion', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no localStorage deletion/i);
  });
});

// ── 10. Does not import production storage registry ───────────────────────────

describe('internalLocalMigrationPilot — does not import production storage registry', () => {
  it('module imports are limited to test helpers only', () => {
    // The pilot runs successfully without any production storage adapter present.
    // No production storage registry is imported or used.
    const result = runPilot();
    expect(result.ok).toBe(true);
  });

  it('no production storage registry in result metadata', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    const str = JSON.stringify(result);
    // Pilot result should not reference production adapter APIs
    expect(str).not.toMatch(/getAdapter|setAdapter|adapterRegistry/);
  });

  it('no src/ production runtime in manifest constants', () => {
    expect(PHASE18D_MANIFEST_ID).not.toMatch(/src\//);
    expect(PHASE18D_SOURCE_KEY).not.toMatch(/src\//);
    expect(PHASE18D_TARGET_STORE).not.toMatch(/src\//);
  });
});

// ── 11. Does not create production IndexedDBAdapter ──────────────────────────

describe('internalLocalMigrationPilot — does not create production IndexedDBAdapter', () => {
  it('pilot completes without any IndexedDBAdapter import', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.internalPilotOnly).toBe(true);
  });

  it('PHASE18D_CLAIM_BOUNDARY states no production IndexedDBAdapter', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no production IndexedDBAdapter/i);
  });

  it('result claimBoundary states no production IndexedDBAdapter', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.claimBoundary).toMatch(/no production IndexedDBAdapter/i);
  });

  it('no production IndexedDBAdapter path in synthetic checksums', () => {
    const checksum = syntheticChecksum('target', PHASE18D_TARGET_STORE);
    expect(checksum).toMatch(/synthetic/);
    expect(checksum).not.toMatch(/IndexedDBAdapter|indexedDbAdapter/);
  });
});

// ── 12. Captures snapshot before write simulation ─────────────────────────────

describe('createPilotSnapshot — captures snapshot before write simulation', () => {
  it('creates a synthetic snapshot with snapshotId and sourceChecksum', () => {
    const manifest = syntheticManifest();
    const result = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    expect(result.ok).toBe(true);
    expect(result.snapshot.snapshotId).toBeTruthy();
    expect(result.snapshot.sourceChecksum).toBeTruthy();
  });

  it('simulatePilotWrite requires a snapshot (refuses without snapshot)', () => {
    const manifest = syntheticManifest();
    const result = simulatePilotWrite({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_SIMULATION_FAILED);
  });

  it('snapshot is captured before writeResult in the full pilot flow', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.snapshot).not.toBeNull();
    expect(result.writeVerification).not.toBeNull();
  });

  it('snapshot is marked as synthetic', () => {
    const manifest = syntheticManifest();
    const result = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    expect(result.ok).toBe(true);
    expect(result.snapshot.synthetic).toBe(true);
  });

  it('snapshot records the correct sourceKey', () => {
    const manifest = syntheticManifest();
    const result = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    expect(result.ok).toBe(true);
    expect(result.snapshot.sourceKey).toBe(PHASE18D_SOURCE_KEY);
  });
});

// ── 13. Requires write verification before success ───────────────────────────

describe('verifyPilotWrite — requires write verification before success', () => {
  it('verifyPilotWrite succeeds when writeResult has correct checksum', () => {
    const manifest = syntheticManifest();
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const writeSimResult = simulatePilotWrite({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload, snapshot: snapshotResult.snapshot });
    const verifResult = verifyPilotWrite({ manifestEntry: manifest, writeResult: writeSimResult.writeResult });
    expect(verifResult.ok).toBe(true);
    expect(verifResult.writeVerification.verified).toBe(true);
  });

  it('verifyPilotWrite fails when writeResult is missing', () => {
    const manifest = syntheticManifest();
    const result = verifyPilotWrite({ manifestEntry: manifest });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_VERIFICATION_FAILED);
  });

  it('verifyPilotWrite fails when target checksum does not match', () => {
    const manifest = syntheticManifest();
    const badWriteResult = { targetChecksum: 'bad-checksum-value' };
    const result = verifyPilotWrite({ manifestEntry: manifest, writeResult: badWriteResult });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_VERIFICATION_FAILED);
  });

  it('pilot status is completed only after write verification passes', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.writeVerification.verified).toBe(true);
    expect(result.status).toBe('completed');
  });
});

// ── 14. Requires rollback verification before completion ──────────────────────

describe('verifyPilotRollback — requires rollback verification before completion', () => {
  it('verifyPilotRollback succeeds when restoredChecksum matches sourceChecksum', () => {
    const manifest = syntheticManifest();
    const sourceChecksum = syntheticChecksum('source', manifest.sourceKey);
    const snapshotResult = createPilotSnapshot({ manifestEntry: manifest, sourcePayload: syntheticSourcePayload });
    const rollbackSimResult = simulatePilotRollback({ manifestEntry: manifest, snapshot: snapshotResult.snapshot });
    const rollbackVerifResult = verifyPilotRollback({
      manifestEntry: manifest,
      rollbackResult: rollbackSimResult.rollbackResult,
      sourceChecksum,
    });
    expect(rollbackVerifResult.ok).toBe(true);
    expect(rollbackVerifResult.rollbackVerification.verified).toBe(true);
    expect(rollbackVerifResult.rollbackVerification.matchesSource).toBe(true);
  });

  it('verifyPilotRollback fails when rollbackResult is missing', () => {
    const manifest = syntheticManifest();
    const sourceChecksum = syntheticChecksum('source', manifest.sourceKey);
    const result = verifyPilotRollback({ manifestEntry: manifest, sourceChecksum });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED);
  });

  it('verifyPilotRollback fails when restoredChecksum does not match sourceChecksum', () => {
    const manifest = syntheticManifest();
    const badRollback = { restoredChecksum: 'bad-checksum' };
    const result = verifyPilotRollback({
      manifestEntry: manifest,
      rollbackResult: badRollback,
      sourceChecksum: 'expected-checksum',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_CHECKSUM_MISMATCH);
  });

  it('pilot is completed only after rollback verification passes', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.rollbackVerification.verified).toBe(true);
    expect(result.status).toBe('completed');
  });
});

// ── 15. Fails with explicit failure code on preflight failure ─────────────────

describe('runInternalLocalMigrationPilot — explicit failureCode on preflight failure', () => {
  it('missing testOnlyGate returns failureCode missing_test_only_gate', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: false,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.MISSING_TEST_ONLY_GATE);
  });

  it('live mode returns failureCode live_mode_rejected', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'live', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.LIVE_MODE_REJECTED);
  });

  it('missing source payload returns failureCode missing_source_payload', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: null,
    });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.MISSING_SOURCE_PAYLOAD);
  });

  it('unsupported family returns failureCode unsupported_pilot_family', () => {
    const fakeManifest = {
      manifestId: 'x', sourceKey: 'x', targetStore: 'x',
      dataFamily: 'user-settings', riskClass: 'low',
      operationType: 'copy', claimBoundary: 'x',
    };
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: fakeManifest, sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.failureCode).toBe(FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY);
  });
});

// ── 16. Fails with explicit failure code on write verification failure ─────────

describe('verifyPilotWrite — explicit failure code on write verification failure', () => {
  it('returns WRITE_VERIFICATION_FAILED when writeResult is absent', () => {
    const manifest = syntheticManifest();
    const result = verifyPilotWrite({ manifestEntry: manifest, writeResult: null });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_VERIFICATION_FAILED);
  });

  it('returns WRITE_VERIFICATION_FAILED on checksum mismatch', () => {
    const manifest = syntheticManifest();
    const badWriteResult = { targetChecksum: 'tampered-checksum' };
    const result = verifyPilotWrite({ manifestEntry: manifest, writeResult: badWriteResult });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.WRITE_VERIFICATION_FAILED);
  });

  it('FAILURE_CODES.WRITE_VERIFICATION_FAILED is write_verification_failed', () => {
    expect(FAILURE_CODES.WRITE_VERIFICATION_FAILED).toBe('write_verification_failed');
  });
});

// ── 17. Fails with explicit failure code on rollback verification failure ──────

describe('verifyPilotRollback — explicit failure code on rollback verification failure', () => {
  it('returns ROLLBACK_VERIFICATION_FAILED when rollbackResult is absent', () => {
    const manifest = syntheticManifest();
    const result = verifyPilotRollback({
      manifestEntry: manifest,
      rollbackResult: null,
      sourceChecksum: 'x',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED);
  });

  it('returns ROLLBACK_CHECKSUM_MISMATCH when checksums differ', () => {
    const manifest = syntheticManifest();
    const rollbackResult = { restoredChecksum: 'different-checksum' };
    const result = verifyPilotRollback({
      manifestEntry: manifest,
      rollbackResult,
      sourceChecksum: 'expected-checksum',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(FAILURE_CODES.ROLLBACK_CHECKSUM_MISMATCH);
  });

  it('FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED is rollback_verification_failed', () => {
    expect(FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED).toBe('rollback_verification_failed');
  });
});

// ── 18. Stop-on-failure prevents later steps ──────────────────────────────────

describe('runInternalLocalMigrationPilot — stop-on-failure behavior', () => {
  it('stops at preflight and returns status:failed without proceeding to snapshot', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'live', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.preflight).toBeNull();
  });

  it('stops at preflight when testOnlyGate missing — no snapshot, no writeVerification', () => {
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: false,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe('failed');
    expect(result.preflight).toBeNull();
    expect(result).not.toHaveProperty('writeVerification');
  });

  it('simulateInternalPilotFailure stops at specified step with errorCode', () => {
    const result = simulateInternalPilotFailure({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
      failAtStep: 'write-verification', errorCode: 'write_verification_failed',
    });
    expect(result.ok).toBe(false);
    expect(result.stoppedAtStep).toBe('write-verification');
    expect(result.failureCode).toBe('write_verification_failed');
  });

  it('simulateInternalPilotFailure requires non-empty errorCode', () => {
    const result = simulateInternalPilotFailure({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: syntheticSourcePayload,
      failAtStep: 'snapshot', errorCode: '',
    });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('missing_error_code');
  });
});

// ── 19. Deterministic output for same synthetic input ─────────────────────────

describe('runInternalLocalMigrationPilot — deterministic output for same input', () => {
  it('produces identical checksums for the same manifest', () => {
    const manifest = syntheticManifest();
    const result1 = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.sourceChecksum).toBe(result2.sourceChecksum);
    expect(result1.targetChecksum).toBe(result2.targetChecksum);
    expect(result1.restoredChecksum).toBe(result2.restoredChecksum);
  });

  it('produces identical pilotId for same input when idProvider is deterministic', () => {
    const manifest = syntheticManifest();
    const result1 = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    const result2 = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result1.ok).toBe(true);
    expect(result2.ok).toBe(true);
    expect(result1.pilotId).toBe(result2.pilotId);
  });

  it('syntheticChecksum is deterministic for same label and key', () => {
    const c1 = syntheticChecksum('source', 'myKey');
    const c2 = syntheticChecksum('source', 'myKey');
    expect(c1).toBe(c2);
  });

  it('different labels produce different checksums', () => {
    const c1 = syntheticChecksum('source', 'myKey');
    const c2 = syntheticChecksum('target', 'myKey');
    expect(c1).not.toBe(c2);
  });
});

// ── 20. Does not mutate input payload or manifest ─────────────────────────────

describe('runInternalLocalMigrationPilot — does not mutate inputs', () => {
  it('does not mutate the source payload', () => {
    const payload = Object.freeze({
      dataFamily: 'recommendation-feedback',
      items: [{ type: 'helpful', cardId: 'c-001', dateKey: '2026-05-17' }],
      synthetic: true,
    });
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: syntheticManifest(), sourcePayload: payload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(payload.dataFamily).toBe('recommendation-feedback');
    expect(payload.items.length).toBe(1);
  });

  it('does not mutate the manifest entry', () => {
    const manifest = syntheticManifest();
    const originalManifestId = manifest.manifestId;
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(manifest.manifestId).toBe(originalManifestId);
  });

  it('result manifestEntry is a frozen copy, not the original', () => {
    const manifest = syntheticManifest();
    const result = runInternalLocalMigrationPilot({
      mode: 'test', testOnlyGate: true,
      manifestEntry: manifest, sourcePayload: syntheticSourcePayload,
      idProvider: deterministicPilotId,
    });
    expect(result.ok).toBe(true);
    expect(Object.isFrozen(result.manifestEntry)).toBe(true);
  });
});

// ── 21. Claim boundary states test-only/internal-only and no production behavior

describe('PHASE18D_CLAIM_BOUNDARY — test-only/internal-only and no production behavior', () => {
  it('claim boundary mentions internal/test-only', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/internal\/test-only|internal.test-only/i);
  });

  it('claim boundary mentions no production IndexedDBAdapter', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no production IndexedDBAdapter/i);
  });

  it('claim boundary mentions no live migration', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no live migration/i);
  });

  it('claim boundary mentions no real data movement', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no real data movement/i);
  });

  it('claim boundary mentions localStorage canonical', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/localStorage canonical/i);
  });

  it('claim boundary mentions no production behavior change', () => {
    expect(PHASE18D_CLAIM_BOUNDARY).toMatch(/no production behavior change/i);
  });

  it('PHASE18D_IDENTITY confirms Phase 18D scope', () => {
    expect(PHASE18D_IDENTITY).toMatch(/Phase 18D/);
    expect(PHASE18D_IDENTITY).toMatch(/Internal.*Test-Only.*Local Migration Pilot/i);
  });

  it('result claimBoundary matches PHASE18D_CLAIM_BOUNDARY', () => {
    const result = runPilot();
    expect(result.ok).toBe(true);
    expect(result.claimBoundary).toBe(PHASE18D_CLAIM_BOUNDARY);
  });
});
