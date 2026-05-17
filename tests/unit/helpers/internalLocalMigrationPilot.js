/**
 * tests/unit/helpers/internalLocalMigrationPilot.js
 *
 * Phase 18D — Internal / Test-Only Local Migration Pilot
 *
 * Test-only/internal-only helper for a local migration pilot for the
 * recommendation-feedback key family using synthetic data only.
 *
 * No production storage imports. No real browser globals.
 * No real localStorage. No real window.localStorage. No production indexedDB.
 * Synthetic data only. Test/internal mode only — live mode is rejected.
 * No production IndexedDBAdapter. No production registry switch.
 * No app boot migration. No user-facing toggle. No real data movement.
 * No localStorage deletion. No production claims.
 *
 * This module provides:
 *   - createInternalLocalMigrationPilot()  — create a pilot configuration
 *   - runInternalLocalMigrationPilot()     — run the full internal pilot
 *   - validatePilotPreflight()             — validate preflight conditions
 *   - createPilotSnapshot()               — capture synthetic snapshot before write
 *   - simulatePilotWrite()                — simulate write to synthetic target
 *   - verifyPilotWrite()                  — verify simulated write output
 *   - simulatePilotRollback()             — simulate rollback using snapshot
 *   - verifyPilotRollback()               — verify rollback restored original state
 *
 * The pilot models:
 *   - internal/test-only gate
 *   - recommendation-feedback family only
 *   - localStorage remains canonical write/read surface in metadata
 *   - synthetic source payload
 *   - snapshot before write simulation
 *   - write verification before success
 *   - rollback verification before completion
 *   - stop-on-failure
 *   - explicit failure codes
 *   - no real data movement
 *   - no localStorage deletion
 *   - no production registry switch
 *   - no production IndexedDBAdapter
 *   - no real browser storage dependency
 *   - no real user data movement
 */

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE18D_IDENTITY =
  'Phase 18D — Internal / Test-Only Local Migration Pilot';

export const PHASE18D_CLAIM_BOUNDARY =
  'Phase 18D internal/test-only; no production IndexedDBAdapter; ' +
  'no live migration; no real data movement; localStorage canonical; ' +
  'no localStorage deletion; no production registry switch; ' +
  'internal and test-only pilot only; no production behavior change';

// ── Pilot family constants ─────────────────────────────────────────────────────

export const PHASE18D_PILOT_FAMILY = 'recommendation-feedback';

export const PHASE18D_ALLOWED_FAMILIES = Object.freeze(['recommendation-feedback']);

// ── Allowed modes (test/internal-test-only) ───────────────────────────────────

export const ALLOWED_MODES_PHASE18D = Object.freeze(['test', 'internal-test-only']);

// ── Synthetic manifest constants ───────────────────────────────────────────────

export const PHASE18D_MANIFEST_ID    = 'phase18d-rec-feedback-local-pilot-v1';
export const PHASE18D_SOURCE_KEY     = 'shimeV2RecommendationFeedbackV1';
export const PHASE18D_TARGET_STORE   = 'shime-v2-idb-rec-feedback';
export const PHASE18D_RISK_CLASS     = 'low';
export const PHASE18D_OPERATION_TYPE = 'copy';

// ── canonical source designation ──────────────────────────────────────────────

export const PHASE18D_CANONICAL_SOURCE = 'localStorage';

// ── Required manifest fields ───────────────────────────────────────────────────

export const REQUIRED_MANIFEST_FIELDS = Object.freeze([
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'riskClass',
  'operationType',
  'claimBoundary',
]);

// ── Required pilot result fields ──────────────────────────────────────────────

export const REQUIRED_PILOT_RESULT_FIELDS = Object.freeze([
  'pilotId',
  'mode',
  'dataFamily',
  'status',
  'canonicalSource',
  'sourceChecksum',
  'targetChecksum',
  'restoredChecksum',
  'preflight',
  'snapshot',
  'writeVerification',
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
  PREFLIGHT_FAILED:                'preflight_failed',
  SNAPSHOT_FAILED:                 'snapshot_failed',
  WRITE_SIMULATION_FAILED:         'write_simulation_failed',
  WRITE_VERIFICATION_FAILED:       'write_verification_failed',
  ROLLBACK_SIMULATION_FAILED:      'rollback_simulation_failed',
  ROLLBACK_VERIFICATION_FAILED:    'rollback_verification_failed',
  ROLLBACK_CHECKSUM_MISMATCH:      'rollback_checksum_mismatch',
});

// ── Deterministic synthetic checksum ─────────────────────────────────────────

/**
 * Produce a deterministic synthetic checksum for a given label and key.
 * No crypto. No storage. Purely synthetic string computation.
 *
 * @param {string} label - e.g. 'source', 'target', 'restored'
 * @param {string} key   - e.g. the source key or target store name
 * @returns {string}
 */
export function syntheticChecksum(label, key) {
  return `sha256-synthetic-${label}-${key}-phase18d`;
}

// ── Default pilot ID provider ─────────────────────────────────────────────────

function defaultPilotId(manifestEntry) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `pilot-phase18d-${manifestEntry.sourceKey}-${rand}`;
}

// ── 1. Create internal/test-only pilot configuration ─────────────────────────

/**
 * Build a synthetic manifest entry for the Phase 18D recommendation-feedback pilot.
 * Returns a frozen object. Does not access any storage or browser APIs.
 *
 * @param {object} overrides - Optional field overrides.
 * @returns {{ ok: true, entry: object } | { ok: false, error: string, reason: string }}
 */
export function createInternalLocalMigrationPilot(overrides = {}) {
  const family = Object.prototype.hasOwnProperty.call(overrides, 'dataFamily')
    ? overrides.dataFamily
    : PHASE18D_PILOT_FAMILY;

  if (!PHASE18D_ALLOWED_FAMILIES.includes(family)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY,
      reason: `Phase 18D only supports pilot family "${PHASE18D_PILOT_FAMILY}"; received: "${family}"`,
    };
  }

  const entry = Object.freeze({
    manifestId:      overrides.manifestId      ?? PHASE18D_MANIFEST_ID,
    sourceKey:       overrides.sourceKey       ?? PHASE18D_SOURCE_KEY,
    targetStore:     overrides.targetStore     ?? PHASE18D_TARGET_STORE,
    dataFamily:      family,
    riskClass:       overrides.riskClass       ?? PHASE18D_RISK_CLASS,
    operationType:   overrides.operationType   ?? PHASE18D_OPERATION_TYPE,
    canonicalSource: PHASE18D_CANONICAL_SOURCE,
    claimBoundary:   overrides.claimBoundary   ?? PHASE18D_CLAIM_BOUNDARY,
  });

  return { ok: true, entry };
}

// ── 2. Validate pilot preflight ───────────────────────────────────────────────

/**
 * Validate all preflight conditions for the internal migration pilot.
 *
 * Checks:
 *   - mode is allowed (test or internal-test-only)
 *   - testOnlyGate is explicitly true
 *   - manifest entry is valid
 *   - dataFamily is recommendation-feedback
 *   - source payload is provided and non-null
 *
 * @param {object} options
 * @param {string} options.mode
 * @param {boolean} options.testOnlyGate
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @returns {{ ok: true, checks: string[] } | { ok: false, error: string, reason: string }}
 */
export function validatePilotPreflight(options = {}) {
  const { mode, testOnlyGate, manifestEntry, sourcePayload } = options;
  const checks = [];

  // Check 1: mode must be allowed
  if (!ALLOWED_MODES_PHASE18D.includes(mode)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.LIVE_MODE_REJECTED,
      reason: `Phase 18D only permits test/internal-test-only mode; received mode: "${mode}"`,
    };
  }
  checks.push('mode_allowed');

  // Check 2: testOnlyGate must be explicitly true
  if (testOnlyGate !== true) {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_TEST_ONLY_GATE,
      reason: 'Phase 18D requires testOnlyGate: true to be explicitly set before running the pilot',
    };
  }
  checks.push('test_only_gate_confirmed');

  // Check 3: manifest entry must be provided
  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_MANIFEST_ENTRY,
      reason: 'Phase 18D requires a synthetic manifest entry',
    };
  }
  checks.push('manifest_entry_present');

  // Check 4: family must be recommendation-feedback
  if (!PHASE18D_ALLOWED_FAMILIES.includes(manifestEntry.dataFamily)) {
    return {
      ok:     false,
      error:  FAILURE_CODES.UNSUPPORTED_PILOT_FAMILY,
      reason: `Phase 18D only supports pilot family "${PHASE18D_PILOT_FAMILY}"; received: "${manifestEntry.dataFamily}"`,
    };
  }
  checks.push('family_allowed');

  // Check 5: source payload must be provided and non-null
  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.MISSING_SOURCE_PAYLOAD,
      reason: 'Phase 18D requires a synthetic source payload (non-null)',
    };
  }
  if (typeof sourcePayload !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.INVALID_SOURCE_PAYLOAD,
      reason: 'Phase 18D source payload must be an object',
    };
  }
  checks.push('source_payload_present');

  return { ok: true, checks: Object.freeze(checks) };
}

// ── 3. Create synthetic snapshot before write simulation ──────────────────────

/**
 * Create a synthetic pre-write snapshot capturing the current (synthetic) source state.
 * No real storage is read. No real localStorage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @returns {{ ok: true, snapshot: object } | { ok: false, error: string, reason: string }}
 */
export function createPilotSnapshot(options = {}) {
  const { manifestEntry, sourcePayload } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.SNAPSHOT_FAILED,
      reason: 'createPilotSnapshot: manifestEntry is required',
    };
  }
  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.SNAPSHOT_FAILED,
      reason: 'createPilotSnapshot: sourcePayload is required',
    };
  }

  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const snapshot = Object.freeze({
    snapshotId:      `snap-phase18d-${manifestEntry.sourceKey}`,
    capturedAt:      '2026-05-17T00:00:00.000Z',
    sourceKey:       manifestEntry.sourceKey,
    canonicalSource: PHASE18D_CANONICAL_SOURCE,
    sourceChecksum,
    synthetic:       true,
    claimBoundary:   'Phase 18D test-only snapshot metadata; no real storage snapshot; localStorage unchanged',
  });

  return { ok: true, snapshot };
}

// ── 4. Simulate pilot write ───────────────────────────────────────────────────

/**
 * Simulate a write of the source payload to the synthetic target adapter.
 * No real storage is written. No real localStorage is modified.
 * Returns a synthetic write result with target checksum.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {*} options.sourcePayload
 * @param {object} options.snapshot
 * @returns {{ ok: true, writeResult: object } | { ok: false, error: string, reason: string }}
 */
export function simulatePilotWrite(options = {}) {
  const { manifestEntry, sourcePayload, snapshot } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_SIMULATION_FAILED,
      reason: 'simulatePilotWrite: manifestEntry is required',
    };
  }
  if (sourcePayload === null || sourcePayload === undefined) {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_SIMULATION_FAILED,
      reason: 'simulatePilotWrite: sourcePayload is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_SIMULATION_FAILED,
      reason: 'simulatePilotWrite: snapshot is required (must capture snapshot before write)',
    };
  }

  const targetChecksum = syntheticChecksum('target', manifestEntry.targetStore);

  const writeResult = Object.freeze({
    targetStore:     manifestEntry.targetStore,
    targetChecksum,
    simulatedAt:     '2026-05-17T00:00:00.000Z',
    synthetic:       true,
    localStorageUnchanged: true,
    noRealWrite:     true,
    claimBoundary:   'Phase 18D test-only write simulation; no real write occurred; localStorage unchanged',
  });

  return { ok: true, writeResult };
}

// ── 5. Verify pilot write ─────────────────────────────────────────────────────

/**
 * Verify the simulated write output matches expected checksum.
 * No real storage is read. No real localStorage is accessed.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.writeResult
 * @returns {{ ok: true, writeVerification: object } | { ok: false, error: string, reason: string }}
 */
export function verifyPilotWrite(options = {}) {
  const { manifestEntry, writeResult } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: 'verifyPilotWrite: manifestEntry is required',
    };
  }
  if (!writeResult || typeof writeResult !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: 'verifyPilotWrite: writeResult is required before write verification',
    };
  }

  const expectedChecksum = syntheticChecksum('target', manifestEntry.targetStore);

  if (writeResult.targetChecksum !== expectedChecksum) {
    return {
      ok:     false,
      error:  FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      reason: `Write verification failed: expected checksum "${expectedChecksum}", got "${writeResult.targetChecksum}"`,
    };
  }

  const writeVerification = Object.freeze({
    verified:        true,
    targetChecksum:  writeResult.targetChecksum,
    verifiedAt:      '2026-05-17T00:00:00.000Z',
    synthetic:       true,
    claimBoundary:   'Phase 18D test-only write verification; no real write verified; localStorage canonical',
  });

  return { ok: true, writeVerification };
}

// ── 6. Simulate pilot rollback ────────────────────────────────────────────────

/**
 * Simulate rollback of the write using the pre-write snapshot.
 * No real storage is modified. No localStorage is deleted.
 * Returns a synthetic rollback result.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.snapshot
 * @returns {{ ok: true, rollbackResult: object } | { ok: false, error: string, reason: string }}
 */
export function simulatePilotRollback(options = {}) {
  const { manifestEntry, snapshot } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_SIMULATION_FAILED,
      reason: 'simulatePilotRollback: manifestEntry is required',
    };
  }
  if (!snapshot || typeof snapshot !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_SIMULATION_FAILED,
      reason: 'simulatePilotRollback: snapshot is required for rollback simulation',
    };
  }

  const restoredChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const rollbackResult = Object.freeze({
    sourceKey:          manifestEntry.sourceKey,
    restoredChecksum,
    rolledBackAt:       '2026-05-17T00:00:00.000Z',
    snapshotRef:        snapshot.snapshotId,
    synthetic:          true,
    localStorageUnchanged: true,
    noLocalStorageDeletion: true,
    claimBoundary:      'Phase 18D test-only rollback simulation; no real storage modified; no localStorage deletion',
  });

  return { ok: true, rollbackResult };
}

// ── 7. Verify pilot rollback ───────────────────────────────────────────────────

/**
 * Verify the rollback restored the original source state.
 * No real storage is read. restoredChecksum must match sourceChecksum.
 *
 * @param {object} options
 * @param {object} options.manifestEntry
 * @param {object} options.rollbackResult
 * @param {string} options.sourceChecksum
 * @returns {{ ok: true, rollbackVerification: object } | { ok: false, error: string, reason: string }}
 */
export function verifyPilotRollback(options = {}) {
  const { manifestEntry, rollbackResult, sourceChecksum } = options;

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyPilotRollback: manifestEntry is required',
    };
  }
  if (!rollbackResult || typeof rollbackResult !== 'object') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyPilotRollback: rollbackResult is required before rollback verification',
    };
  }
  if (typeof sourceChecksum !== 'string') {
    return {
      ok:     false,
      error:  FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      reason: 'verifyPilotRollback: sourceChecksum is required',
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
    claimBoundary:    'Phase 18D test-only rollback verification; no real data restored; localStorage canonical',
  });

  return { ok: true, rollbackVerification };
}

// ── 8. Run the full internal local migration pilot ─────────────────────────────

/**
 * Run the complete internal/test-only local migration pilot.
 *
 * Options:
 *   - mode: 'test' (default) or 'internal-test-only'
 *   - testOnlyGate: must be true (explicit internal/test-only gate)
 *   - manifestEntry: the synthetic manifest entry (from createInternalLocalMigrationPilot)
 *   - sourcePayload: synthetic source payload object (non-null required)
 *   - idProvider: optional function (manifestEntry) => string for deterministic pilotId in tests
 *
 * Returns:
 *   { ok: true, pilotId, mode, dataFamily, status, canonicalSource, sourceChecksum,
 *     targetChecksum, restoredChecksum, preflight, snapshot, writeVerification,
 *     rollbackVerification, failureCode, claimBoundary }
 *   { ok: false, error, reason }
 *
 * The returned objects are immutable snapshots. Input objects are not mutated.
 *
 * Lifecycle (happy path):
 *   preflight → snapshot → write simulation → write verification →
 *   rollback simulation → rollback verification → completed
 *
 * Stop-on-failure: any step failure returns immediately with explicit failureCode.
 *
 * No real storage is accessed at any step.
 * localStorage remains the canonical production source of truth in all metadata.
 * No localStorage is deleted.
 * No production IndexedDBAdapter is created.
 * No production registry switch.
 */
export function runInternalLocalMigrationPilot(options = {}) {
  const {
    mode = 'test',
    testOnlyGate,
    manifestEntry,
    sourcePayload,
    idProvider,
  } = options;

  // ── Step 1: Preflight (stop-on-failure) ───────────────────────────────────────
  const preflightResult = validatePilotPreflight({
    mode,
    testOnlyGate,
    manifestEntry,
    sourcePayload,
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
    passed:     true,
    checks:     preflightResult.checks,
    checkedAt:  '2026-05-17T00:00:00.000Z',
  });

  const pilotId = idProvider
    ? idProvider(manifestEntry)
    : defaultPilotId(manifestEntry);

  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  // ── Step 2: Snapshot (stop-on-failure) ────────────────────────────────────────
  const snapshotResult = createPilotSnapshot({ manifestEntry, sourcePayload });

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

  // ── Step 3: Write simulation (stop-on-failure) ────────────────────────────────
  const writeSimResult = simulatePilotWrite({ manifestEntry, sourcePayload, snapshot });

  if (!writeSimResult.ok) {
    return {
      ok:          false,
      error:       writeSimResult.error,
      reason:      writeSimResult.reason,
      failureCode: FAILURE_CODES.WRITE_SIMULATION_FAILED,
      status:      'failed',
      preflight,
      snapshot,
      writeVerification: null,
    };
  }

  const { writeResult } = writeSimResult;

  // ── Step 4: Write verification (stop-on-failure) ──────────────────────────────
  const writeVerifResult = verifyPilotWrite({ manifestEntry, writeResult });

  if (!writeVerifResult.ok) {
    return {
      ok:               false,
      error:            writeVerifResult.error,
      reason:           writeVerifResult.reason,
      failureCode:      FAILURE_CODES.WRITE_VERIFICATION_FAILED,
      status:           'failed',
      preflight,
      snapshot,
      writeVerification: null,
    };
  }

  const { writeVerification } = writeVerifResult;
  const targetChecksum = writeResult.targetChecksum;

  // ── Step 5: Rollback simulation (stop-on-failure) ─────────────────────────────
  const rollbackSimResult = simulatePilotRollback({ manifestEntry, snapshot });

  if (!rollbackSimResult.ok) {
    return {
      ok:                 false,
      error:              rollbackSimResult.error,
      reason:             rollbackSimResult.reason,
      failureCode:        FAILURE_CODES.ROLLBACK_SIMULATION_FAILED,
      status:             'failed',
      preflight,
      snapshot,
      writeVerification,
      rollbackVerification: null,
    };
  }

  const { rollbackResult } = rollbackSimResult;

  // ── Step 6: Rollback verification (stop-on-failure) ───────────────────────────
  const rollbackVerifResult = verifyPilotRollback({ manifestEntry, rollbackResult, sourceChecksum });

  if (!rollbackVerifResult.ok) {
    return {
      ok:                  false,
      error:               rollbackVerifResult.error,
      reason:              rollbackVerifResult.reason,
      failureCode:         FAILURE_CODES.ROLLBACK_VERIFICATION_FAILED,
      status:              'failed',
      preflight,
      snapshot,
      writeVerification,
      rollbackVerification: null,
    };
  }

  const { rollbackVerification } = rollbackVerifResult;
  const restoredChecksum = rollbackResult.restoredChecksum;

  // ── Step 7: Final result ───────────────────────────────────────────────────────
  return Object.freeze({
    ok:                  true,
    pilotId,
    mode,
    dataFamily:          PHASE18D_PILOT_FAMILY,
    status:              'completed',
    canonicalSource:     PHASE18D_CANONICAL_SOURCE,
    sourceChecksum,
    targetChecksum,
    restoredChecksum,
    preflight,
    snapshot,
    writeVerification,
    rollbackVerification,
    failureCode:         null,
    manifestEntry:       Object.freeze({ ...manifestEntry }),
    claimBoundary:       PHASE18D_CLAIM_BOUNDARY,
    internalPilotOnly:   true,
  });
}

// ── 9. Simulate a failure path ────────────────────────────────────────────────

/**
 * Simulate a failure at a specific pilot step, returning a failed pilot result.
 *
 * Options:
 *   - mode: 'test' (default) or 'internal-test-only'
 *   - testOnlyGate: must be true
 *   - manifestEntry: synthetic manifest entry
 *   - sourcePayload: synthetic source payload
 *   - failAtStep: 'preflight' | 'snapshot' | 'write' | 'write-verification' |
 *                 'rollback' | 'rollback-verification'
 *   - errorCode: explicit failure code string
 *
 * Returns:
 *   { ok: false, error, reason, failureCode, status, stoppedAtStep }
 */
export function simulateInternalPilotFailure(options = {}) {
  const {
    mode = 'test',
    testOnlyGate,
    manifestEntry,
    sourcePayload,
    failAtStep = 'preflight',
    errorCode,
  } = options;

  if (!ALLOWED_MODES_PHASE18D.includes(mode)) {
    return {
      ok:          false,
      error:       FAILURE_CODES.LIVE_MODE_REJECTED,
      reason:      `Phase 18D only permits test/internal-test-only mode; received: "${mode}"`,
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

  const validSteps = ['preflight', 'snapshot', 'write', 'write-verification', 'rollback', 'rollback-verification'];
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
