/**
 * tests/unit/helpers/limitedLocalBackendPilot.js
 *
 * Phase 18E — Limited Local Backend Pilot with Rollback Gates
 *
 * Test-only/internal-only helper for a limited local backend pilot with rollback
 * gates for the recommendation-feedback key family using synthetic data only.
 *
 * No production storage imports. No real browser globals.
 * No real localStorage. No real window.localStorage. No production indexedDB.
 * Synthetic data only. Test/internal mode only — live mode is rejected.
 * No production IndexedDBAdapter. No production registry switch.
 * No app boot migration. No user-facing toggle. No real data movement.
 * No localStorage deletion. No production claims.
 *
 * This module provides:
 *   - createLimitedLocalBackendPilot()  — create a pilot configuration
 *   - createSyntheticLocalBackend()     — create a synthetic local backend
 *   - validateBackendPilotPreflight()   — validate preflight conditions
 *   - captureBackendPilotSnapshot()     — capture synthetic snapshot before write
 *   - prepareBackendWriteGate()         — write gate check before backend commit
 *   - commitSyntheticBackendWrite()     — commit write to synthetic local backend
 *   - verifyBackendWriteGate()          — verify backend write result
 *   - prepareRollbackGate()             — rollback gate check before rollback
 *   - executeSyntheticRollback()        — execute synthetic rollback using snapshot
 *   - verifyRollbackGate()             — verify rollback restored original state
 *   - runLimitedLocalBackendPilot()     — run the full limited local backend pilot
 *
 * The pilot models:
 *   - internal/test-only gate
 *   - recommendation-feedback family only
 *   - synthetic local backend only (in-memory, no real IndexedDB)
 *   - localStorage remains canonical production source in metadata
 *   - backup/export behavior unchanged in metadata
 *   - restore behavior unchanged in metadata
 *   - preflight checks
 *   - snapshot before write gate
 *   - write gate before backend commit
 *   - write verification before rollback gate
 *   - rollback gate before rollback execution
 *   - rollback verification before completion
 *   - stop-on-failure
 *   - explicit failure codes
 *   - claim boundary
 *   - no real data movement
 *   - no localStorage deletion
 *   - no production registry switch
 *   - no production IndexedDBAdapter
 *   - no real browser storage dependency
 */

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE18E_IDENTITY =
  'Phase 18E — Limited Local Backend Pilot with Rollback Gates';

export const PHASE18E_CLAIM_BOUNDARY =
  'Phase 18E internal/test-only; limited local backend pilot; synthetic data only; ' +
  'no production IndexedDBAdapter; no live migration; no real data movement; ' +
  'localStorage canonical; no localStorage deletion; no production registry switch; ' +
  'backup/export unchanged; restore unchanged; internal and test-only pilot only; ' +
  'no production behavior change';

// ── Pilot family constants ─────────────────────────────────────────────────────

export const PHASE18E_PILOT_FAMILY = 'recommendation-feedback';

export const PHASE18E_ALLOWED_FAMILIES = Object.freeze(['recommendation-feedback']);

// ── Allowed modes ──────────────────────────────────────────────────────────────

export const ALLOWED_MODES_PHASE18E = Object.freeze(['test', 'internal-test-only']);

// ── Synthetic manifest constants ───────────────────────────────────────────────

export const PHASE18E_MANIFEST_ID    = 'phase18e-rec-feedback-local-backend-pilot-v1';
export const PHASE18E_SOURCE_KEY     = 'shimeV2RecommendationFeedbackV1';
export const PHASE18E_TARGET_STORE   = 'shime-v2-idb-rec-feedback';
export const PHASE18E_RISK_CLASS     = 'low';
export const PHASE18E_OPERATION_TYPE = 'copy';
export const PHASE18E_BACKEND_KIND   = 'synthetic';

// ── Canonical source designation ───────────────────────────────────────────────

export const PHASE18E_CANONICAL_SOURCE = 'localStorage';

// ── Required manifest fields ───────────────────────────────────────────────────

export const REQUIRED_MANIFEST_FIELDS = Object.freeze([
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'riskClass',
  'operationType',
  'backendKind',
  'claimBoundary',
]);

// ── Required pilot result fields ──────────────────────────────────────────────

export const REQUIRED_PILOT_RESULT_FIELDS = Object.freeze([
  'pilotId',
  'mode',
  'dataFamily',
  'status',
  'canonicalSource',
  'backendKind',
  'sourceChecksum',
  'backendChecksum',
  'restoredChecksum',
  'preflight',
  'snapshot',
  'writeGate',
  'writeVerification',
  'rollbackGate',
  'rollbackVerification',
  'failureCode',
  'claimBoundary',
]);

// ── Failure codes ──────────────────────────────────────────────────────────────

export const FAILURE_CODES = Object.freeze({
  LIVE_MODE_REJECTED:              'live_mode_rejected',
  UNSUPPORTED_PILOT_FAMILY:        'unsupported_pilot_family',
  MISSING_TEST_ONLY_GATE:          'missing_test_only_gate',
  MISSING_MANIFEST_ENTRY:          'missing_manifest_entry',
  MISSING_SOURCE_PAYLOAD:          'missing_source_payload',
  INVALID_SOURCE_PAYLOAD:          'invalid_source_payload',
  MISSING_BACKEND:                 'missing_backend',
  INVALID_BACKEND_KIND:            'invalid_backend_kind',
  PREFLIGHT_FAILED:                'preflight_failed',
  SNAPSHOT_FAILED:                 'snapshot_failed',
  WRITE_GATE_FAILED:               'write_gate_failed',
  BACKEND_COMMIT_FAILED:           'backend_commit_failed',
  WRITE_VERIFICATION_FAILED:       'write_verification_failed',
  ROLLBACK_GATE_FAILED:            'rollback_gate_failed',
  ROLLBACK_FAILED:                 'rollback_failed',
  ROLLBACK_VERIFICATION_FAILED:    'rollback_verification_failed',
  ROLLBACK_CHECKSUM_MISMATCH:      'rollback_checksum_mismatch',
});

// ── Deterministic synthetic checksum ─────────────────────────────────────────

/**
 * Produce a deterministic synthetic checksum for a given label and key.
 * No crypto. No storage. Purely synthetic string computation.
 *
 * @param {string} label - e.g. 'source', 'backend', 'restored'
 * @param {string} key   - e.g. the source key or target store name
 * @returns {string}
 */
export function syntheticChecksum(label, key) {
  return `sha256-synthetic-${label}-${key}-phase18e`;
}

// ── Default pilot ID provider ─────────────────────────────────────────────────

function defaultPilotId(manifestEntry) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `pilot-phase18e-${manifestEntry.sourceKey}-${rand}`;
}

// ── 1. Create limited local backend pilot configuration ───────────────────────

/**
 * Build a synthetic manifest entry for the Phase 18E limited local backend pilot.
 * Returns a frozen object. Does not access any storage or browser APIs.
 *
 * @param {object} overrides - Optional field overrides.
 * @returns {{ ok: true, entry: object } | { ok: false, error: string, reason: string }}
 */
export function createLimitedLocalBackendPilot(overrides = {}) {
  const family = Object.prototype.hasOwnProperty.call(overrides, 'dataFamily')
    ? overrides.dataFamily
    : PHASE18E_PILOT_FAMILY;

  if (!PHASE18E_ALLOWED_FAMILIES.includes(family)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY,
      reason: `Phase 18E only supports pilot family "${PHASE18E_PILOT_FAMILY}"; received: "${family}"`,
    };
  }

  const entry = Object.freeze({
    manifestId:              overrides.manifestId      ?? PHASE18E_MANIFEST_ID,
    sourceKey:               overrides.sourceKey       ?? PHASE18E_SOURCE_KEY,
    targetStore:             overrides.targetStore     ?? PHASE18E_TARGET_STORE,
    dataFamily:              family,
    riskClass:               overrides.riskClass       ?? PHASE18E_RISK_CLASS,
    operationType:           overrides.operationType   ?? PHASE18E_OPERATION_TYPE,
    backendKind:             overrides.backendKind     ?? PHASE18E_BACKEND_KIND,
    canonicalSource:         PHASE18E_CANONICAL_SOURCE,
    backupExportUnchanged:   true,
    restoreUnchanged:        true,
    claimBoundary:           overrides.claimBoundary   ?? PHASE18E_CLAIM_BOUNDARY,
  });

  return { ok: true, entry };
}

// ── 2. Create synthetic local backend ─────────────────────────────────────────

/**
 * Create a synthetic local backend (in-memory, no real IndexedDB).
 * Maintains an internal store map. Does not touch any real browser storage.
 *
 * @param {object} options
 * @param {string} [options.backendKind='synthetic'] - must be 'synthetic'
 * @returns {{ ok: true, backend: object } | { ok: false, error: string, reason: string }}
 */
export function createSyntheticLocalBackend(options = {}) {
  const backendKind = options.backendKind ?? PHASE18E_BACKEND_KIND;

  if (backendKind !== 'synthetic') {
    return {
      ok:     false,
      error:  FAILURE_CODES.INVALID_BACKEND_KIND,
      reason: `Phase 18E only supports backendKind "synthetic"; received: "${backendKind}"`,
    };
  }

  const _store = new Map();

  const backend = Object.freeze({
    kind:         'synthetic',
    isReal:       false,
    isProduction: false,
    read(storeKey) {
      return _store.has(storeKey) ? _store.get(storeKey) : null;
    },
    write(storeKey, value) {
      _store.set(storeKey, value);
      return true;
    },
    delete(storeKey) {
      _store.delete(storeKey);
    },
    clear() {
      _store.clear();
    },
    has(storeKey) {
      return _store.has(storeKey);
    },
    claimBoundary: 'synthetic local backend; no real IndexedDB; no real localStorage; test-only',
  });

  return { ok: true, backend };
}

// ── 3. Validate backend pilot preflight ───────────────────────────────────────

/**
 * Validate all preflight conditions for the limited local backend pilot.
 *
 * Checks:
 *   - mode is allowed (test or internal-test-only)
 *   - testOnlyGate is explicitly true
 *   - manifest entry is valid
 *   - dataFamily is recommendation-feedback
 *   - source payload is provided and non-null
 *   - backend is provided and synthetic
 *
 * @param {object} options
 * @param {string} options.mode
 * @param {boolean} options.testOnlyGate
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @param {object} options.backend
 * @returns {{ ok: true, checks: string[] } | { ok: false, error: string, reason: string }}
 */
export function validateBackendPilotPreflight(options = {}) {
  const { mode, testOnlyGate, manifestEntry, sourcePayload, backend } = options;
  const checks = [];

  if (!ALLOWED_MODES_PHASE18E.includes(mode)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.LIVE_MODE_REJECTED,
      reason: `Phase 18E only permits test/internal-test-only mode; received mode: "${mode}"`,
    };
  }
  checks.push('mode_allowed');

  if (testOnlyGate !== true) {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_TEST_ONLY_GATE,
      reason: 'Phase 18E requires testOnlyGate: true to be explicitly set before running the pilot',
    };
  }
  checks.push('test_only_gate_confirmed');

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_MANIFEST_ENTRY,
      reason: 'Phase 18E requires a synthetic manifest entry',
    };
  }
  checks.push('manifest_entry_present');

  if (!PHASE18E_ALLOWED_FAMILIES.includes(manifestEntry.dataFamily)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY,
      reason: `Phase 18E only supports pilot family "${PHASE18E_PILOT_FAMILY}"; received: "${manifestEntry.dataFamily}"`,
    };
  }
  checks.push('family_allowed');

  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_SOURCE_PAYLOAD,
      reason: 'Phase 18E requires a synthetic source payload (non-null)',
    };
  }
  if (typeof sourcePayload !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.INVALID_SOURCE_PAYLOAD,
      reason: 'Phase 18E source payload must be an object',
    };
  }
  checks.push('source_payload_present');

  if (!backend || typeof backend !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_BACKEND,
      reason: 'Phase 18E requires a synthetic local backend',
    };
  }
  if (backend.kind !== 'synthetic' || backend.isReal !== false) {
    return {
      ok:     false,
      error:  FAILURE_CODES.INVALID_BACKEND_KIND,
      reason: 'Phase 18E requires a synthetic (non-real) backend',
    };
  }
  checks.push('synthetic_backend_present');

  return { ok: true, checks: Object.freeze(checks) };
}

// ── 4. Capture backend pilot snapshot ─────────────────────────────────────────

/**
 * Capture a synthetic pre-write snapshot of the source state.
 * No real storage is read. No real localStorage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @returns {{ ok: true, snapshot: object } | { ok: false, error: string, reason: string }}
 */
export function captureBackendPilotSnapshot(options = {}) {
  const { manifestEntry, sourcePayload } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.SNAPSHOT_FAILED,
      reason: 'captureBackendPilotSnapshot: manifestEntry is required',
    };
  }
  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.SNAPSHOT_FAILED,
      reason: 'captureBackendPilotSnapshot: sourcePayload is required',
    };
  }

  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const snapshot = Object.freeze({
    snapshotId:              `snap-phase18e-${manifestEntry.sourceKey}`,
    capturedAt:              '2026-05-17T00:00:00.000Z',
    sourceKey:               manifestEntry.sourceKey,
    canonicalSource:         PHASE18E_CANONICAL_SOURCE,
    sourceChecksum,
    synthetic:               true,
    backupExportUnchanged:   true,
    restoreUnchanged:        true,
    claimBoundary:
      'Phase 18E test-only snapshot metadata; no real storage snapshot; localStorage unchanged; ' +
      'backup/export unchanged; restore unchanged',
  });

  return { ok: true, snapshot };
}

// ── 5. Prepare backend write gate ─────────────────────────────────────────────

/**
 * Evaluate the write gate before committing to the synthetic backend.
 * Ensures snapshot exists and backend is ready before any write proceeds.
 * No real storage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.snapshot
 * @param {object} options.backend
 * @returns {{ ok: true, writeGate: object } | { ok: false, error: string, reason: string }}
 */
export function prepareBackendWriteGate(options = {}) {
  const { manifestEntry, snapshot, backend } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_GATE_FAILED,
      reason: 'prepareBackendWriteGate: manifestEntry is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_GATE_FAILED,
      reason: 'prepareBackendWriteGate: snapshot is required before write gate (must snapshot before write)',
    };
  }
  if (!backend || typeof backend !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_GATE_FAILED,
      reason: 'prepareBackendWriteGate: backend is required',
    };
  }
  if (backend.kind !== 'synthetic') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_GATE_FAILED,
      reason: 'prepareBackendWriteGate: only synthetic backend is permitted',
    };
  }

  const writeGate = Object.freeze({
    passed:            true,
    snapshotRef:       snapshot.snapshotId,
    backendKind:       backend.kind,
    checkedAt:         '2026-05-17T00:00:00.000Z',
    localStorageUnchanged: true,
    claimBoundary:
      'Phase 18E test-only write gate; no real write authorized; localStorage canonical',
  });

  return { ok: true, writeGate };
}

// ── 6. Commit synthetic backend write ─────────────────────────────────────────

/**
 * Commit the source payload to the synthetic local backend.
 * Only proceeds when writeGate is provided (enforces gate ordering).
 * No real storage is written. No real localStorage is modified.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @param {object} options.snapshot
 * @param {object} options.writeGate
 * @param {object} options.backend
 * @returns {{ ok: true, commitResult: object } | { ok: false, error: string, reason: string }}
 */
export function commitSyntheticBackendWrite(options = {}) {
  const { manifestEntry, sourcePayload, snapshot, writeGate, backend } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.BACKEND_COMMIT_FAILED,
      reason: 'commitSyntheticBackendWrite: manifestEntry is required',
    };
  }
  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.BACKEND_COMMIT_FAILED,
      reason: 'commitSyntheticBackendWrite: sourcePayload is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.BACKEND_COMMIT_FAILED,
      reason: 'commitSyntheticBackendWrite: snapshot is required (must snapshot before commit)',
    };
  }
  if (!writeGate || typeof writeGate !== 'object' || !writeGate.passed) {
    return {
      ok:     false,
      error:  FAILURE_CODES.BACKEND_COMMIT_FAILED,
      reason: 'commitSyntheticBackendWrite: writeGate must pass before backend commit',
    };
  }
  if (!backend || typeof backend !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.BACKEND_COMMIT_FAILED,
      reason: 'commitSyntheticBackendWrite: backend is required',
    };
  }

  backend.write(manifestEntry.targetStore, Object.freeze({ ...sourcePayload }));
  const backendChecksum = syntheticChecksum('backend', manifestEntry.targetStore);

  const commitResult = Object.freeze({
    targetStore:           manifestEntry.targetStore,
    backendChecksum,
    committedAt:           '2026-05-17T00:00:00.000Z',
    backendKind:           backend.kind,
    synthetic:             true,
    localStorageUnchanged: true,
    noRealWrite:           true,
    claimBoundary:
      'Phase 18E test-only backend commit; no real write occurred; localStorage unchanged; ' +
      'backup/export unchanged',
  });

  return { ok: true, commitResult };
}

// ── 7. Verify backend write gate ──────────────────────────────────────────────

/**
 * Verify the backend commit result matches expected checksum.
 * No real storage is read. No real localStorage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.commitResult
 * @returns {{ ok: true, writeVerification: object } | { ok: false, error: string, reason: string }}
 */
export function verifyBackendWriteGate(options = {}) {
  const { manifestEntry, commitResult } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: 'verifyBackendWriteGate: manifestEntry is required',
    };
  }
  if (!commitResult || typeof commitResult !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: 'verifyBackendWriteGate: commitResult is required before write verification',
    };
  }

  const expectedChecksum = syntheticChecksum('backend', manifestEntry.targetStore);

  if (commitResult.backendChecksum !== expectedChecksum) {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: `Write verification failed: expected checksum "${expectedChecksum}", got "${commitResult.backendChecksum}"`,
    };
  }

  const writeVerification = Object.freeze({
    verified:          true,
    backendChecksum:   commitResult.backendChecksum,
    verifiedAt:        '2026-05-17T00:00:00.000Z',
    synthetic:         true,
    claimBoundary:
      'Phase 18E test-only write verification; no real write verified; localStorage canonical',
  });

  return { ok: true, writeVerification };
}

// ── 8. Prepare rollback gate ───────────────────────────────────────────────────

/**
 * Evaluate the rollback gate before executing rollback.
 * Ensures write verification passed and snapshot exists before rollback proceeds.
 * No real storage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.snapshot
 * @param {object} options.writeVerification
 * @returns {{ ok: true, rollbackGate: object } | { ok: false, error: string, reason: string }}
 */
export function prepareRollbackGate(options = {}) {
  const { manifestEntry, snapshot, writeVerification } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_GATE_FAILED,
      reason: 'prepareRollbackGate: manifestEntry is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_GATE_FAILED,
      reason: 'prepareRollbackGate: snapshot is required before rollback gate',
    };
  }
  if (!writeVerification || typeof writeVerification !== 'object' || !writeVerification.verified) {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_GATE_FAILED,
      reason: 'prepareRollbackGate: writeVerification must pass before rollback gate',
    };
  }

  const rollbackGate = Object.freeze({
    passed:            true,
    snapshotRef:       snapshot.snapshotId,
    writeVerified:     true,
    checkedAt:         '2026-05-17T00:00:00.000Z',
    noLocalStorageDeletion: true,
    claimBoundary:
      'Phase 18E test-only rollback gate; no real rollback authorized yet; localStorage canonical',
  });

  return { ok: true, rollbackGate };
}

// ── 9. Execute synthetic rollback ─────────────────────────────────────────────

/**
 * Execute synthetic rollback using the pre-write snapshot.
 * Only proceeds when rollbackGate is provided (enforces gate ordering).
 * No real storage is modified. No localStorage is deleted.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.snapshot
 * @param {object} options.rollbackGate
 * @param {object} options.backend
 * @returns {{ ok: true, rollbackResult: object } | { ok: false, error: string, reason: string }}
 */
export function executeSyntheticRollback(options = {}) {
  const { manifestEntry, snapshot, rollbackGate, backend } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_FAILED,
      reason: 'executeSyntheticRollback: manifestEntry is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_FAILED,
      reason: 'executeSyntheticRollback: snapshot is required for rollback',
    };
  }
  if (!rollbackGate || typeof rollbackGate !== 'object' || !rollbackGate.passed) {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_FAILED,
      reason: 'executeSyntheticRollback: rollbackGate must pass before rollback execution',
    };
  }
  if (!backend || typeof backend !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_FAILED,
      reason: 'executeSyntheticRollback: backend is required',
    };
  }

  backend.delete(manifestEntry.targetStore);
  const restoredChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const rollbackResult = Object.freeze({
    sourceKey:              manifestEntry.sourceKey,
    restoredChecksum,
    rolledBackAt:           '2026-05-17T00:00:00.000Z',
    snapshotRef:            snapshot.snapshotId,
    synthetic:              true,
    localStorageUnchanged:  true,
    noLocalStorageDeletion: true,
    claimBoundary:
      'Phase 18E test-only rollback execution; no real storage modified; no localStorage deletion',
  });

  return { ok: true, rollbackResult };
}

// ── 10. Verify rollback gate ───────────────────────────────────────────────────

/**
 * Verify the rollback restored the original source state.
 * restoredChecksum must match sourceChecksum.
 * No real storage is read.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.rollbackResult
 * @param {string} options.sourceChecksum
 * @returns {{ ok: true, rollbackVerification: object } | { ok: false, error: string, reason: string }}
 */
export function verifyRollbackGate(options = {}) {
  const { manifestEntry, rollbackResult, sourceChecksum } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyRollbackGate: manifestEntry is required',
    };
  }
  if (!rollbackResult || typeof rollbackResult !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyRollbackGate: rollbackResult is required before rollback verification',
    };
  }
  if (typeof sourceChecksum !== 'string') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyRollbackGate: sourceChecksum is required',
    };
  }

  if (rollbackResult.restoredChecksum !== sourceChecksum) {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_CHECKSUM_MISMATCH,
      reason: `Rollback verification failed: restored checksum "${rollbackResult.restoredChecksum}" does not match source checksum "${sourceChecksum}"`,
    };
  }

  const rollbackVerification = Object.freeze({
    verified:         true,
    restoredChecksum: rollbackResult.restoredChecksum,
    matchesSource:    true,
    verifiedAt:       '2026-05-17T00:00:00.000Z',
    synthetic:        true,
    claimBoundary:
      'Phase 18E test-only rollback verification; no real data restored; localStorage canonical',
  });

  return { ok: true, rollbackVerification };
}

// ── 11. Run the full limited local backend pilot ───────────────────────────────

/**
 * Run the complete limited local backend pilot with rollback gates.
 *
 * Options:
 *   - mode: 'test' (default) or 'internal-test-only'
 *   - testOnlyGate: must be true (explicit internal/test-only gate)
 *   - manifestEntry: the synthetic manifest entry (from createLimitedLocalBackendPilot)
 *   - sourcePayload: synthetic source payload object (non-null required)
 *   - backend: synthetic local backend (from createSyntheticLocalBackend)
 *   - idProvider: optional function (manifestEntry) => string for deterministic pilotId in tests
 *
 * Returns on success:
 *   { ok: true, pilotId, mode, dataFamily, status, canonicalSource, backendKind,
 *     sourceChecksum, backendChecksum, restoredChecksum,
 *     preflight, snapshot, writeGate, writeVerification,
 *     rollbackGate, rollbackVerification, failureCode, claimBoundary }
 *
 * Returns on failure:
 *   { ok: false, error, reason, failureCode, status, ... }
 *
 * The returned objects are immutable snapshots. Input objects are not mutated.
 *
 * Lifecycle (happy path):
 *   preflight → snapshot → writeGate → backendCommit → writeVerification →
 *   rollbackGate → rollback → rollbackVerification → completed
 *
 * Stop-on-failure: any step failure returns immediately with explicit failureCode.
 *
 * No real storage is accessed at any step.
 * localStorage remains the canonical production source of truth in all metadata.
 * No localStorage is deleted.
 * backup/export behavior is unchanged.
 * restore behavior is unchanged.
 * No production IndexedDBAdapter is created.
 * No production registry switch.
 */
export function runLimitedLocalBackendPilot(options = {}) {
  const {
    mode = 'test',
    testOnlyGate,
    manifestEntry,
    sourcePayload,
    backend,
    idProvider,
  } = options;

  // ── Step 1: Preflight (stop-on-failure) ───────────────────────────────────────
  const preflightResult = validateBackendPilotPreflight({
    mode,
    testOnlyGate,
    manifestEntry,
    sourcePayload,
    backend,
  });

  if (!preflightResult.ok) {
    return {
      ok:          false,
      error:       preflightResult.error,
      reason:      preflightResult.reason,
      failureCode: preflightResult.error,
      status:      'failed',
      preflight:   null,
    };
  }

  const preflight = Object.freeze({
    passed:    true,
    checks:    preflightResult.checks,
    checkedAt: '2026-05-17T00:00:00.000Z',
  });

  const pilotId = idProvider
    ? idProvider(manifestEntry)
    : defaultPilotId(manifestEntry);

  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  // ── Step 2: Snapshot (stop-on-failure) ────────────────────────────────────────
  const snapshotResult = captureBackendPilotSnapshot({ manifestEntry, sourcePayload });

  if (!snapshotResult.ok) {
    return {
      ok:          false,
      error:       snapshotResult.error,
      reason:      snapshotResult.reason,
      failureCode: FAILURE_CODES.SNAPSHOT_FAILED,
      status:      'failed',
      preflight,
      snapshot:    null,
    };
  }

  const { snapshot } = snapshotResult;

  // ── Step 3: Write gate (stop-on-failure) ──────────────────────────────────────
  const writeGateResult = prepareBackendWriteGate({ manifestEntry, snapshot, backend });

  if (!writeGateResult.ok) {
    return {
      ok:          false,
      error:       writeGateResult.error,
      reason:      writeGateResult.reason,
      failureCode: FAILURE_CODES.WRITE_GATE_FAILED,
      status:      'failed',
      preflight,
      snapshot,
      writeGate:   null,
    };
  }

  const { writeGate } = writeGateResult;

  // ── Step 4: Backend commit (stop-on-failure) ──────────────────────────────────
  const commitResult_r = commitSyntheticBackendWrite({
    manifestEntry,
    sourcePayload,
    snapshot,
    writeGate,
    backend,
  });

  if (!commitResult_r.ok) {
    return {
      ok:          false,
      error:       commitResult_r.error,
      reason:      commitResult_r.reason,
      failureCode: FAILURE_CODES.BACKEND_COMMIT_FAILED,
      status:      'failed',
      preflight,
      snapshot,
      writeGate,
      writeVerification: null,
    };
  }

  const { commitResult } = commitResult_r;

  // ── Step 5: Write verification (stop-on-failure) ──────────────────────────────
  const writeVerifResult = verifyBackendWriteGate({ manifestEntry, commitResult });

  if (!writeVerifResult.ok) {
    return {
      ok:                false,
      error:             writeVerifResult.error,
      reason:            writeVerifResult.reason,
      failureCode:       FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      status:            'failed',
      preflight,
      snapshot,
      writeGate,
      writeVerification: null,
    };
  }

  const { writeVerification } = writeVerifResult;
  const backendChecksum = commitResult.backendChecksum;

  // ── Step 6: Rollback gate (stop-on-failure) ───────────────────────────────────
  const rollbackGateResult = prepareRollbackGate({ manifestEntry, snapshot, writeVerification });

  if (!rollbackGateResult.ok) {
    return {
      ok:               false,
      error:            rollbackGateResult.error,
      reason:           rollbackGateResult.reason,
      failureCode:      FAILURE_CODES.ROLLBACK_GATE_FAILED,
      status:           'failed',
      preflight,
      snapshot,
      writeGate,
      writeVerification,
      rollbackGate:     null,
    };
  }

  const { rollbackGate } = rollbackGateResult;

  // ── Step 7: Rollback execution (stop-on-failure) ──────────────────────────────
  const rollbackExecResult = executeSyntheticRollback({
    manifestEntry,
    snapshot,
    rollbackGate,
    backend,
  });

  if (!rollbackExecResult.ok) {
    return {
      ok:                   false,
      error:                rollbackExecResult.error,
      reason:               rollbackExecResult.reason,
      failureCode:          FAILURE_CODES.ROLLBACK_FAILED,
      status:               'failed',
      preflight,
      snapshot,
      writeGate,
      writeVerification,
      rollbackGate,
      rollbackVerification: null,
    };
  }

  const { rollbackResult } = rollbackExecResult;

  // ── Step 8: Rollback verification (stop-on-failure) ───────────────────────────
  const rollbackVerifResult = verifyRollbackGate({ manifestEntry, rollbackResult, sourceChecksum });

  if (!rollbackVerifResult.ok) {
    return {
      ok:                   false,
      error:                rollbackVerifResult.error,
      reason:               rollbackVerifResult.reason,
      failureCode:          rollbackVerifResult.error,
      status:               'failed',
      preflight,
      snapshot,
      writeGate,
      writeVerification,
      rollbackGate,
      rollbackVerification: null,
    };
  }

  const { rollbackVerification } = rollbackVerifResult;
  const restoredChecksum = rollbackResult.restoredChecksum;

  // ── Step 9: Final result ───────────────────────────────────────────────────────
  return Object.freeze({
    ok:                   true,
    pilotId,
    mode,
    dataFamily:           PHASE18E_PILOT_FAMILY,
    status:               'completed',
    canonicalSource:      PHASE18E_CANONICAL_SOURCE,
    backendKind:          PHASE18E_BACKEND_KIND,
    sourceChecksum,
    backendChecksum,
    restoredChecksum,
    preflight,
    snapshot,
    writeGate,
    writeVerification,
    rollbackGate,
    rollbackVerification,
    failureCode:          null,
    manifestEntry:        Object.freeze({ ...manifestEntry }),
    backupExportUnchanged: true,
    restoreUnchanged:     true,
    internalPilotOnly:    true,
    claimBoundary:        PHASE18E_CLAIM_BOUNDARY,
  });
}

// ── 12. Simulate a failure path ───────────────────────────────────────────────

/**
 * Simulate a failure at a specific pilot step, returning a failed pilot result.
 * Used in tests to verify stop-on-failure behavior and explicit failure codes.
 *
 * Options:
 *   - mode: 'test' (default) or 'internal-test-only'
 *   - testOnlyGate: must be true
 *   - manifestEntry: synthetic manifest entry
 *   - failAtStep: 'preflight' | 'snapshot' | 'write-gate' | 'backend-commit' |
 *                 'write-verification' | 'rollback-gate' | 'rollback' | 'rollback-verification'
 *   - errorCode: explicit failure code string
 *
 * Returns:
 *   { ok: false, error, reason, failureCode, status, stoppedAtStep }
 */
export function simulateBackendPilotFailure(options = {}) {
  const {
    mode = 'test',
    testOnlyGate,
    manifestEntry,
    failAtStep = 'preflight',
    errorCode,
  } = options;

  if (!ALLOWED_MODES_PHASE18E.includes(mode)) {
    return {
      ok:          false,
      error:       FAILURE_CODES.LIVE_MODE_REJECTED,
      reason:      `Phase 18E only permits test/internal-test-only mode; received: "${mode}"`,
      failureCode: FAILURE_CODES.LIVE_MODE_REJECTED,
      status:      'failed',
    };
  }

  if (typeof errorCode !== 'string' || errorCode.trim() === '') {
    return {
      ok:          false,
      error:       'missing_error_code',
      reason:      'errorCode must be a non-empty string for failure simulation',
      failureCode: 'missing_error_code',
      status:      'failed',
    };
  }

  const validSteps = [
    'preflight', 'snapshot', 'write-gate', 'backend-commit',
    'write-verification', 'rollback-gate', 'rollback', 'rollback-verification',
  ];
  if (!validSteps.includes(failAtStep)) {
    return {
      ok:          false,
      error:       'invalid_fail_at_step',
      reason:      `Unknown failAtStep: "${failAtStep}"`,
      failureCode: 'invalid_fail_at_step',
      status:      'failed',
    };
  }

  return {
    ok:            false,
    error:         errorCode,
    reason:        `Simulated failure at step "${failAtStep}": ${errorCode}`,
    failureCode:   errorCode,
    status:        'failed',
    stoppedAtStep: failAtStep,
    mode,
    testOnlyGate,
    manifestEntry: manifestEntry ? Object.freeze({ ...manifestEntry }) : null,
  };
}
