/**
 * tests/unit/helpers/singleKeyReversibleMigrationPilot.js
 *
 * Phase 17H — Single-Key Reversible Migration Pilot behind Test-Only Gate
 *
 * Test-only helper for a single-key reversible migration pilot for one
 * low-risk recommendation-feedback candidate family using synthetic data only.
 *
 * Uses the Phase 17F test-only migration journal harness and the Phase 17G
 * single-key dry-run rehearsal helper.
 * No browser APIs. No production storage. No real localStorage or IndexedDB.
 * Synthetic data only. Dry-run/test mode only — live mode is rejected.
 *
 * Phase 17H extends Phase 17G by exercising the full reversible flow:
 *   backup snapshot → synthetic write plan → verification →
 *   rollback rehearsal → rollback verification → final audit result
 *
 * This module proves that a single synthetic key can be backed up,
 * have a write plan verified, be rolled back, and have the restored state
 * verified — all without touching real storage.
 */

import {
  createPlannedDryRunEntry,
  transitionStatus,
  attachWriteVerification,
  attachRollbackSnapshot,
  markFailed,
  markRollbackReady,
  markRolledBack,
} from './migrationJournalTestHarness.js';

import {
  validateSyntheticSourcePayload,
} from './singleKeyDryRunMigrationRehearsal.js';

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE17H_IDENTITY = 'Phase 17H — Single-Key Reversible Migration Pilot';

// ── Pilot family for Phase 17H ─────────────────────────────────────────────────

export const PHASE17H_PILOT_FAMILY = 'recommendation-feedback';

export const PHASE17H_ALLOWED_FAMILIES = Object.freeze(['recommendation-feedback']);

// ── Allowed modes (dry-run/test only) ─────────────────────────────────────────

export const ALLOWED_MODES_PHASE17H = Object.freeze(['dry-run', 'test']);

// ── Synthetic manifest constants ───────────────────────────────────────────────

export const PHASE17H_MANIFEST_ID    = 'phase17h-rec-feedback-pilot-v1';
export const PHASE17H_SOURCE_KEY     = 'shimeV2RecommendationFeedbackV1';
export const PHASE17H_TARGET_STORE   = 'shime-v2-idb-rec-feedback';
export const PHASE17H_RISK_CLASS     = 'low';
export const PHASE17H_OPERATION_TYPE = 'copy';
export const PHASE17H_CLAIM_BOUNDARY =
  'Phase 17H test-only; no live migration; no real data movement; reversible pilot only';

// ── Required manifest entry fields ────────────────────────────────────────────

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
  'manifestId',
  'mode',
  'dataFamily',
  'status',
  'sourceChecksum',
  'targetChecksum',
  'restoredChecksum',
  'writeVerification',
  'rollbackVerification',
  'rollbackSnapshotRef',
  'journalEntries',
  'claimBoundary',
]);

// ── 1. Build a synthetic reversible manifest entry ────────────────────────────

/**
 * Build a synthetic manifest entry for the Phase 17H recommendation-feedback pilot.
 * Returns a frozen object. Does not access any storage or browser APIs.
 *
 * @param {object} overrides - Optional field overrides.
 * @returns {{ ok: true, entry: object } | { ok: false, error: string, reason: string }}
 */
export function buildSyntheticReversibleManifestEntry(overrides = {}) {
  const family = Object.prototype.hasOwnProperty.call(overrides, 'dataFamily')
    ? overrides.dataFamily
    : PHASE17H_PILOT_FAMILY;

  if (!PHASE17H_ALLOWED_FAMILIES.includes(family)) {
    return {
      ok: false,
      error: 'unsupported_pilot_family',
      reason: `Phase 17H only supports pilot family "${PHASE17H_PILOT_FAMILY}"; received: "${family}"`,
    };
  }

  const entry = Object.freeze({
    manifestId:    overrides.manifestId    ?? PHASE17H_MANIFEST_ID,
    sourceKey:     overrides.sourceKey     ?? PHASE17H_SOURCE_KEY,
    targetStore:   overrides.targetStore   ?? PHASE17H_TARGET_STORE,
    dataFamily:    family,
    riskClass:     overrides.riskClass     ?? PHASE17H_RISK_CLASS,
    operationType: overrides.operationType ?? PHASE17H_OPERATION_TYPE,
    claimBoundary: overrides.claimBoundary ?? PHASE17H_CLAIM_BOUNDARY,
  });

  return { ok: true, entry };
}

// ── Re-export validateSyntheticSourcePayload from Phase 17G ───────────────────

export { validateSyntheticSourcePayload };

// ── 2. Synthetic checksum (deterministic, Phase 17H-scoped) ──────────────────

/**
 * Produce a deterministic synthetic checksum for a given label and data key.
 * No crypto. No storage. Purely synthetic string computation.
 *
 * @param {string} label - e.g. 'source', 'target', 'restored', 'read-before-write'
 * @param {string} key   - e.g. the manifest's sourceKey or targetStore
 * @returns {string}
 */
export function syntheticChecksum(label, key) {
  return `sha256-synthetic-${label}-${key}-phase17h`;
}

// ── 3. Default pilot ID provider (non-deterministic) ─────────────────────────

function defaultPilotId(manifestEntry) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `pilot-phase17h-${manifestEntry.sourceKey}-${rand}`;
}

// ── 4. Run the full reversible pilot ─────────────────────────────────────────

/**
 * Run a single-key reversible migration pilot for one recommendation-feedback key.
 *
 * Options:
 *   - mode: 'dry-run' (default) or 'test'
 *   - manifestEntry: the synthetic manifest entry (from buildSyntheticReversibleManifestEntry)
 *   - sourcePayload: synthetic source payload object (non-null required)
 *   - rollbackSnapshotRef: optional synthetic rollback snapshot ref object
 *   - idProvider: optional function (manifestEntry) => string for deterministic pilotId in tests
 *
 * Returns:
 *   { ok: true, pilotId, manifestId, mode, dataFamily, status, sourceChecksum,
 *     targetChecksum, restoredChecksum, writeVerification, rollbackVerification,
 *     rollbackSnapshotRef, journalEntries, manifestEntry, claimBoundary, reversiblePilotOnly }
 *   { ok: false, error, reason }
 *
 * The returned objects are immutable snapshots. Input objects are not mutated.
 *
 * Status path (happy path):
 *   planned → backup-captured → write-attempted → write-verified →
 *   rollback-ready → rolled-back
 * Pilot result status: 'completed' (after successful rollback verification)
 *
 * Invariants:
 *   - rollbackSnapshotRef attached BEFORE write-attempted
 *   - writeVerification required for write-verified
 *   - rollbackSnapshotRef required for rollback-ready and rolled-back
 *   - restoredChecksum must match sourceChecksum for pilot completion
 */
export function runSingleKeyReversibleMigrationPilot(options = {}) {
  const {
    mode = 'dry-run',
    manifestEntry,
    sourcePayload,
    rollbackSnapshotRef,
    idProvider,
  } = options;

  // ── Gate 1: mode check ───────────────────────────────────────────────────────
  if (!ALLOWED_MODES_PHASE17H.includes(mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      reason: `Phase 17H only permits dry-run/test mode; received mode: "${mode}"`,
    };
  }

  // ── Gate 2: manifest entry required ─────────────────────────────────────────
  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok: false,
      error: 'missing_manifest_entry',
      reason: 'Phase 17H requires a synthetic manifest entry',
    };
  }

  // ── Gate 3: family check ─────────────────────────────────────────────────────
  if (!PHASE17H_ALLOWED_FAMILIES.includes(manifestEntry.dataFamily)) {
    return {
      ok: false,
      error: 'unsupported_pilot_family',
      reason: `Phase 17H only supports pilot family "${PHASE17H_PILOT_FAMILY}"; received: "${manifestEntry.dataFamily}"`,
    };
  }

  // ── Gate 4: source payload check ─────────────────────────────────────────────
  const payloadCheck = validateSyntheticSourcePayload(sourcePayload);
  if (!payloadCheck.ok) return payloadCheck;

  const journalEntries = [];

  const pilotId = idProvider
    ? idProvider(manifestEntry)
    : defaultPilotId(manifestEntry);

  // ── Step 1: Create planned journal entry ──────────────────────────────────────
  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const plannedResult = createPlannedDryRunEntry({
    manifestId:    manifestEntry.manifestId,
    sourceKey:     manifestEntry.sourceKey,
    targetStore:   manifestEntry.targetStore,
    dataFamily:    manifestEntry.dataFamily,
    operationType: manifestEntry.operationType,
    mode,
    sourceChecksum,
    claimBoundary: manifestEntry.claimBoundary,
  });

  if (!plannedResult.ok) {
    return { ok: false, error: plannedResult.error, reason: plannedResult.reason ?? plannedResult.error };
  }

  journalEntries.push(plannedResult.entry);

  // ── Step 2: Transition to backup-captured ──────────────────────────────────
  const backupResult = transitionStatus(plannedResult.entry, 'backup-captured');
  if (!backupResult.ok) {
    return { ok: false, error: backupResult.error, reason: 'Failed to transition to backup-captured' };
  }

  // Attach synthetic rollback snapshot reference (inert test metadata)
  // REQUIRED before write-attempted — backup must exist before write plan
  const snapshotRef = rollbackSnapshotRef ?? Object.freeze({
    snapshotId:    `snap-phase17h-${manifestEntry.sourceKey}`,
    capturedAt:    '2026-05-17T00:00:00.000Z',
    synthetic:     true,
    claimBoundary: 'Phase 17H test-only rollback metadata; no real snapshot',
  });

  const withSnapshotResult = attachRollbackSnapshot(backupResult.entry, snapshotRef);
  if (!withSnapshotResult.ok) {
    return { ok: false, error: withSnapshotResult.error, reason: 'Failed to attach rollback snapshot' };
  }

  journalEntries.push(withSnapshotResult.entry);

  // ── Step 3: Transition to write-attempted ─────────────────────────────────
  const writeAttemptedResult = transitionStatus(withSnapshotResult.entry, 'write-attempted');
  if (!writeAttemptedResult.ok) {
    return { ok: false, error: writeAttemptedResult.error, reason: 'Failed to transition to write-attempted' };
  }

  // Attach synthetic read-before-write checksum
  const readBeforeWriteChecksum = syntheticChecksum('read-before-write', manifestEntry.sourceKey);
  const withRbwChecksum = Object.freeze({
    ...writeAttemptedResult.entry,
    readBeforeWriteChecksum,
  });

  journalEntries.push(withRbwChecksum);

  // ── Step 4: Transition to write-verified ──────────────────────────────────
  const writeVerifiedResult = transitionStatus(withRbwChecksum, 'write-verified');
  if (!writeVerifiedResult.ok) {
    return { ok: false, error: writeVerifiedResult.error, reason: 'Failed to transition to write-verified' };
  }

  // Attach synthetic write verification metadata
  const targetChecksum = syntheticChecksum('target', manifestEntry.targetStore);
  const writeVerification = Object.freeze({
    verified:      true,
    targetChecksum,
    verifiedAt:    '2026-05-17T00:00:00.000Z',
    synthetic:     true,
    claimBoundary: 'Phase 17H test-only write verification; no real write occurred',
  });

  const withVerifResult = attachWriteVerification(writeVerifiedResult.entry, writeVerification);
  if (!withVerifResult.ok) {
    return { ok: false, error: withVerifResult.error, reason: 'Failed to attach write verification' };
  }

  const withTargetChecksum = Object.freeze({
    ...withVerifResult.entry,
    targetChecksum,
  });

  journalEntries.push(withTargetChecksum);

  // ── Step 5: Transition to rollback-ready (requires rollbackSnapshotRef) ──
  const rollbackReadyResult = markRollbackReady(withTargetChecksum);
  if (!rollbackReadyResult.ok) {
    return { ok: false, error: rollbackReadyResult.error, reason: 'Failed to transition to rollback-ready: rollbackSnapshotRef required' };
  }

  journalEntries.push(rollbackReadyResult.entry);

  // ── Step 6: Transition to rolled-back (requires rollbackSnapshotRef) ─────
  const rolledBackResult = markRolledBack(rollbackReadyResult.entry);
  if (!rolledBackResult.ok) {
    return { ok: false, error: rolledBackResult.error, reason: 'Failed to transition to rolled-back' };
  }

  // ── Step 7: Compute and verify restoredChecksum ──────────────────────────
  // Simulate restore: checksum of restored data must match original source
  const restoredChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  if (restoredChecksum !== sourceChecksum) {
    return {
      ok: false,
      error: 'rollback_checksum_mismatch',
      reason: `Restored checksum does not match source checksum: expected "${sourceChecksum}", got "${restoredChecksum}"`,
    };
  }

  // ── Step 8: Attach rollback verification metadata ─────────────────────────
  const rollbackVerification = Object.freeze({
    verified:        true,
    restoredChecksum,
    matchesSource:   true,
    verifiedAt:      '2026-05-17T00:00:00.000Z',
    synthetic:       true,
    claimBoundary:   'Phase 17H test-only rollback verification; no real data restored',
  });

  const finalJournalEntry = Object.freeze({
    ...rolledBackResult.entry,
    restoredChecksum,
    rollbackVerification,
  });

  journalEntries.push(finalJournalEntry);

  return {
    ok:                  true,
    pilotId,
    manifestId:          manifestEntry.manifestId,
    mode,
    dataFamily:          PHASE17H_PILOT_FAMILY,
    status:              'completed',
    sourceChecksum,
    targetChecksum,
    restoredChecksum,
    writeVerification,
    rollbackVerification,
    rollbackSnapshotRef: snapshotRef,
    journalEntries:      Object.freeze(journalEntries.map(e => Object.freeze({ ...e }))),
    manifestEntry:       Object.freeze({ ...manifestEntry }),
    claimBoundary:       PHASE17H_CLAIM_BOUNDARY,
    reversiblePilotOnly: true,
  };
}

// ── 5. Simulate failure path ──────────────────────────────────────────────────

/**
 * Simulate a failure during a reversible pilot, returning a failed journal entry.
 * Returns { ok: true, failedEntry } or { ok: false, error, reason }.
 *
 * errorCode must be a non-empty string.
 * failAtStatus must be one of: 'planned', 'backup-captured', 'write-attempted',
 *   'write-verified', 'rollback-ready'.
 */
export function simulateReversiblePilotFailure(options = {}) {
  const {
    mode = 'dry-run',
    manifestEntry,
    sourcePayload,
    errorCode,
    failAtStatus = 'planned',
  } = options;

  if (!ALLOWED_MODES_PHASE17H.includes(mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      reason: `Phase 17H only permits dry-run/test mode; received mode: "${mode}"`,
    };
  }

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok: false,
      error: 'missing_manifest_entry',
      reason: 'Phase 17H requires a synthetic manifest entry',
    };
  }

  const payloadCheck = validateSyntheticSourcePayload(sourcePayload);
  if (!payloadCheck.ok) return payloadCheck;

  if (typeof errorCode !== 'string' || errorCode.trim() === '') {
    return {
      ok: false,
      error: 'missing_error_code',
      reason: 'errorCode must be a non-empty string for failure simulation',
    };
  }

  const sourceChecksum = syntheticChecksum('source', manifestEntry.sourceKey);

  const plannedResult = createPlannedDryRunEntry({
    manifestId:    manifestEntry.manifestId,
    sourceKey:     manifestEntry.sourceKey,
    targetStore:   manifestEntry.targetStore,
    dataFamily:    manifestEntry.dataFamily,
    operationType: manifestEntry.operationType,
    mode,
    sourceChecksum,
    claimBoundary: manifestEntry.claimBoundary,
  });

  if (!plannedResult.ok) {
    return { ok: false, error: plannedResult.error, reason: plannedResult.reason ?? plannedResult.error };
  }

  let current = plannedResult.entry;

  if (failAtStatus !== 'planned') {
    // Ordered steps, each requiring special handling for snapshot attachment
    const stepsToReach = {
      'backup-captured': ['backup-captured'],
      'write-attempted': ['backup-captured', 'write-attempted'],
      'write-verified':  ['backup-captured', 'write-attempted', 'write-verified'],
      'rollback-ready':  ['backup-captured', 'write-attempted', 'write-verified', 'rollback-ready'],
    };

    const path = stepsToReach[failAtStatus];
    if (!path) {
      return {
        ok: false,
        error: 'invalid_fail_at_status',
        reason: `Unknown failAtStatus: "${failAtStatus}"`,
      };
    }

    for (const step of path) {
      if (step === 'backup-captured') {
        const r = transitionStatus(current, step);
        if (!r.ok) return { ok: false, error: r.error, reason: `Failed to transition to ${step}` };
        // Attach required rollback snapshot before write plan
        const snapshotRef = Object.freeze({
          snapshotId:  `snap-failure-${manifestEntry.sourceKey}`,
          capturedAt:  '2026-05-17T00:00:00.000Z',
          synthetic:   true,
        });
        const withSnapshot = attachRollbackSnapshot(r.entry, snapshotRef);
        if (!withSnapshot.ok) return { ok: false, error: withSnapshot.error };
        current = withSnapshot.entry;
      } else if (step === 'rollback-ready') {
        const r = markRollbackReady(current);
        if (!r.ok) return { ok: false, error: r.error, reason: 'Failed to transition to rollback-ready' };
        current = r.entry;
      } else {
        const r = transitionStatus(current, step);
        if (!r.ok) return { ok: false, error: r.error, reason: `Failed to transition to ${step}` };
        current = r.entry;
      }
    }
  }

  const failResult = markFailed(current, errorCode);
  if (!failResult.ok) {
    return { ok: false, error: failResult.error, reason: failResult.reason ?? failResult.error };
  }

  return { ok: true, failedEntry: failResult.entry };
}
