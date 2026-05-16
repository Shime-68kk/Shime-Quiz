/**
 * tests/unit/helpers/singleKeyDryRunMigrationRehearsal.js
 *
 * Phase 17G — Single-Key Dry-Run Migration Rehearsal
 *
 * Test-only helper for rehearsing a single-key dry-run migration for one
 * low-risk recommendation-feedback candidate family.
 *
 * Uses the Phase 17F test-only migration journal harness.
 * No browser APIs. No production storage. No real localStorage or IndexedDB.
 * Synthetic data only. Dry-run/test mode only — live mode is rejected.
 *
 * This module proves that a single synthetic key can be represented by a
 * manifest fixture, run through a dry-run rehearsal, produce journal entries,
 * verify synthetic write metadata, and end safely without touching real data.
 */

import {
  createPlannedDryRunEntry,
  transitionStatus,
  attachWriteVerification,
  attachRollbackSnapshot,
  markFailed,
  completeEntry,
} from './migrationJournalTestHarness.js';

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE17G_IDENTITY = 'Phase 17G — Single-Key Dry-Run Migration Rehearsal';

// ── Pilot family for Phase 17G ─────────────────────────────────────────────────

export const PHASE17G_PILOT_FAMILY = 'recommendation-feedback';

export const PHASE17G_ALLOWED_FAMILIES = Object.freeze(['recommendation-feedback']);

// ── Allowed modes (dry-run/test only) ─────────────────────────────────────────

export const ALLOWED_MODES_PHASE17G = Object.freeze(['dry-run', 'test']);

// ── Synthetic manifest constants ───────────────────────────────────────────────

export const PHASE17G_MANIFEST_ID = 'phase17g-rec-feedback-pilot-v1';
export const PHASE17G_SOURCE_KEY  = 'shimeV2RecommendationFeedbackV1';
export const PHASE17G_TARGET_STORE = 'shime-v2-idb-rec-feedback';
export const PHASE17G_RISK_CLASS  = 'low';
export const PHASE17G_OPERATION_TYPE = 'copy';
export const PHASE17G_CLAIM_BOUNDARY = 'Phase 17G test-only; no live migration; no real data movement';

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

// ── 1. Build a synthetic manifest entry ───────────────────────────────────────

/**
 * Build a synthetic manifest entry for the recommendation-feedback pilot family.
 * Returns a frozen object. Does not access any storage or browser APIs.
 *
 * @param {object} overrides - Optional field overrides.
 * @returns {{ ok: true, entry: object } | { ok: false, error: string, reason: string }}
 */
export function buildSyntheticManifestEntry(overrides = {}) {
  const family = Object.prototype.hasOwnProperty.call(overrides, 'dataFamily')
    ? overrides.dataFamily
    : PHASE17G_PILOT_FAMILY;

  if (!PHASE17G_ALLOWED_FAMILIES.includes(family)) {
    return {
      ok: false,
      error: 'unsupported_pilot_family',
      reason: `Phase 17G only supports pilot family "${PHASE17G_PILOT_FAMILY}"; received: "${family}"`,
    };
  }

  const entry = Object.freeze({
    manifestId:    overrides.manifestId    ?? PHASE17G_MANIFEST_ID,
    sourceKey:     overrides.sourceKey     ?? PHASE17G_SOURCE_KEY,
    targetStore:   overrides.targetStore   ?? PHASE17G_TARGET_STORE,
    dataFamily:    family,
    riskClass:     overrides.riskClass     ?? PHASE17G_RISK_CLASS,
    operationType: overrides.operationType ?? PHASE17G_OPERATION_TYPE,
    claimBoundary: overrides.claimBoundary ?? PHASE17G_CLAIM_BOUNDARY,
  });

  return { ok: true, entry };
}

// ── 2. Validate synthetic source payload ──────────────────────────────────────

/**
 * Validate that a synthetic source payload is present and non-null.
 * Does not read real localStorage or storage adapters.
 *
 * @param {*} payload - The synthetic source payload.
 * @returns {{ ok: true } | { ok: false, error: string, reason: string }}
 */
export function validateSyntheticSourcePayload(payload) {
  if (payload === null || payload === undefined) {
    return {
      ok: false,
      error: 'missing_source_payload',
      reason: 'Phase 17G requires a non-null synthetic source payload; received null or undefined',
    };
  }
  if (typeof payload !== 'object') {
    return {
      ok: false,
      error: 'invalid_source_payload',
      reason: `Phase 17G source payload must be an object; received: ${typeof payload}`,
    };
  }
  return { ok: true };
}

// ── 3. Synthetic checksum (deterministic) ─────────────────────────────────────

/**
 * Produce a deterministic synthetic checksum for a given label and data key.
 * No crypto. No storage. Purely synthetic string computation.
 *
 * @param {string} label - e.g. 'source' or 'target'
 * @param {string} key - e.g. the manifest's sourceKey
 * @returns {string}
 */
export function syntheticChecksum(label, key) {
  return `sha256-synthetic-${label}-${key}-phase17g`;
}

// ── 4. Run a single-key dry-run rehearsal ─────────────────────────────────────

/**
 * Run a single-key dry-run migration rehearsal for one recommendation-feedback key.
 *
 * Options:
 *   - mode: 'dry-run' (default) or 'test'
 *   - manifestEntry: the synthetic manifest entry (from buildSyntheticManifestEntry)
 *   - sourcePayload: synthetic source payload object (non-null required)
 *   - rollbackSnapshotRef: optional synthetic rollback snapshot ref object
 *
 * Returns:
 *   { ok: true, rehearsalId, pilotFamily, manifestEntry, journalEntries, finalEntry }
 *   { ok: false, error, reason }
 *
 * The returned objects are immutable snapshots. Input objects are not mutated.
 *
 * Status path (happy path):
 *   planned → backup-captured → write-attempted → write-verified → completed
 *
 * Rollback snapshot is attached at backup-captured and preserved throughout.
 */
export function runSingleKeyDryRunRehearsal(options = {}) {
  const {
    mode = 'dry-run',
    manifestEntry,
    sourcePayload,
    rollbackSnapshotRef,
  } = options;

  // ── Gate 1: mode check ───────────────────────────────────────────────────────
  if (!ALLOWED_MODES_PHASE17G.includes(mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      reason: `Phase 17G only permits dry-run/test mode; received mode: "${mode}"`,
    };
  }

  // ── Gate 2: manifest entry required ─────────────────────────────────────────
  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok: false,
      error: 'missing_manifest_entry',
      reason: 'Phase 17G requires a synthetic manifest entry',
    };
  }

  // ── Gate 3: family check ─────────────────────────────────────────────────────
  if (!PHASE17G_ALLOWED_FAMILIES.includes(manifestEntry.dataFamily)) {
    return {
      ok: false,
      error: 'unsupported_pilot_family',
      reason: `Phase 17G only supports pilot family "${PHASE17G_PILOT_FAMILY}"; received: "${manifestEntry.dataFamily}"`,
    };
  }

  // ── Gate 4: source payload check ─────────────────────────────────────────────
  const payloadCheck = validateSyntheticSourcePayload(sourcePayload);
  if (!payloadCheck.ok) return payloadCheck;

  const journalEntries = [];

  const rehearsalId = `rehearsal-phase17g-${Date.now()}`;

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
  const snapshotRef = rollbackSnapshotRef ?? {
    snapshotId:  `snap-phase17g-${manifestEntry.sourceKey}`,
    capturedAt:  '2026-05-17T00:00:00.000Z',
    synthetic:   true,
    claimBoundary: 'Phase 17G test-only rollback metadata; no real snapshot',
  };

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
    verified:       true,
    targetChecksum,
    verifiedAt:     '2026-05-17T00:00:00.000Z',
    synthetic:      true,
    claimBoundary:  'Phase 17G test-only write verification; no real write occurred',
  });

  const withVerifResult = attachWriteVerification(writeVerifiedResult.entry, writeVerification);
  if (!withVerifResult.ok) {
    return { ok: false, error: withVerifResult.error, reason: 'Failed to attach write verification' };
  }

  // Attach synthetic target checksum to the entry
  const withTargetChecksum = Object.freeze({
    ...withVerifResult.entry,
    targetChecksum,
  });

  journalEntries.push(withTargetChecksum);

  // ── Step 5: Complete the entry ────────────────────────────────────────────
  const completedResult = completeEntry(withTargetChecksum);
  if (!completedResult.ok) {
    return { ok: false, error: completedResult.error, reason: 'Failed to complete journal entry' };
  }

  journalEntries.push(completedResult.entry);

  return {
    ok:             true,
    rehearsalId,
    pilotFamily:    PHASE17G_PILOT_FAMILY,
    manifestEntry:  Object.freeze({ ...manifestEntry }),
    journalEntries: Object.freeze(journalEntries.map(e => Object.freeze({ ...e }))),
    finalEntry:     completedResult.entry,
    dryRunOnly:     true,
    claimBoundary:  PHASE17G_CLAIM_BOUNDARY,
  };
}

// ── 5. Simulate failure path ──────────────────────────────────────────────────

/**
 * Simulate a failure during a dry-run rehearsal, returning a failed journal entry.
 * Returns { ok: true, failedEntry } or { ok: false, error, reason }.
 *
 * errorCode must be a non-empty string.
 */
export function simulateRehearsalFailure(options = {}) {
  const {
    mode = 'dry-run',
    manifestEntry,
    sourcePayload,
    errorCode,
    failAtStatus = 'planned',
  } = options;

  if (!ALLOWED_MODES_PHASE17G.includes(mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      reason: `Phase 17G only permits dry-run/test mode; received mode: "${mode}"`,
    };
  }

  if (!manifestEntry || typeof manifestEntry !== 'object') {
    return {
      ok: false,
      error: 'missing_manifest_entry',
      reason: 'Phase 17G requires a synthetic manifest entry',
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
    // Walk through the standard path up to failAtStatus via valid intermediates.
    const pathToStatus = {
      'backup-captured':  ['backup-captured'],
      'write-attempted':  ['backup-captured', 'write-attempted'],
      'write-verified':   ['backup-captured', 'write-attempted', 'write-verified'],
    };
    const path = pathToStatus[failAtStatus];
    if (!path) {
      // Direct single transition attempt.
      const r = transitionStatus(current, failAtStatus);
      if (!r.ok) return { ok: false, error: r.error, reason: `Failed to transition to ${failAtStatus}` };
      current = r.entry;
    } else {
      for (const step of path) {
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
