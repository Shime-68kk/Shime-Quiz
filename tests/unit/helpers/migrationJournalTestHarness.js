/**
 * tests/unit/helpers/migrationJournalTestHarness.js
 *
 * Phase 17F — Test-Only Migration Journal Prototype
 *
 * Pure helper functions for modeling migration journal entries in unit tests.
 * No browser APIs. No storage reads or writes. Synthetic data only.
 * Phase 17F permits dry-run/test mode only — live mode is rejected.
 *
 * This module proves the journal entry shape and safety rules from Phase 17D
 * and Phase 17E without touching production runtime migration.
 */

// ── Phase identity ─────────────────────────────────────────────────────────────

export const PHASE17F_IDENTITY = 'Phase 17F — Test-Only Migration Journal Prototype';

// ── Allowed modes in Phase 17F (test-only gate) ────────────────────────────────

export const ALLOWED_MODES_PHASE17F = Object.freeze(['dry-run', 'test']);

// ── Journal status values ──────────────────────────────────────────────────────

export const JOURNAL_STATUS = Object.freeze({
  PLANNED:          'planned',
  BACKUP_CAPTURED:  'backup-captured',
  WRITE_ATTEMPTED:  'write-attempted',
  WRITE_VERIFIED:   'write-verified',
  ROLLBACK_READY:   'rollback-ready',
  COMPLETED:        'completed',
  FAILED:           'failed',
  ROLLED_BACK:      'rolled-back',
});

// ── Allowed status transitions ─────────────────────────────────────────────────

export const VALID_TRANSITIONS = Object.freeze({
  'planned':          Object.freeze(['backup-captured', 'failed']),
  'backup-captured':  Object.freeze(['write-attempted', 'failed']),
  'write-attempted':  Object.freeze(['write-verified', 'rollback-ready', 'failed']),
  'write-verified':   Object.freeze(['completed', 'rollback-ready', 'failed']),
  'rollback-ready':   Object.freeze(['rolled-back', 'failed']),
  'completed':        Object.freeze([]),
  'failed':           Object.freeze(['rollback-ready']),
  'rolled-back':      Object.freeze([]),
});

// ── Required journal entry fields ──────────────────────────────────────────────

export const REQUIRED_FIELDS = Object.freeze([
  'journalId',
  'operationId',
  'manifestId',
  'sourceKey',
  'targetStore',
  'dataFamily',
  'operationType',
  'mode',
  'status',
  'timestamp',
  'sourceChecksum',
  'targetChecksum',
  'readBeforeWriteChecksum',
  'writeVerification',
  'rollbackSnapshotRef',
  'errorCode',
  'claimBoundary',
]);

// ── Helper: synthetic unique ID (no crypto, no storage) ───────────────────────

function syntheticId(prefix) {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

// ── 1. Create a planned dry-run journal entry ──────────────────────────────────

/**
 * Create a planned dry-run journal entry from synthetic fields.
 * Returns { ok: true, entry } or { ok: false, error, reason }.
 *
 * Phase 17F test-only gate: rejects any mode other than 'dry-run' or 'test'.
 */
export function createPlannedDryRunEntry(fields = {}) {
  const mode = Object.prototype.hasOwnProperty.call(fields, 'mode') ? fields.mode : 'dry-run';

  if (!ALLOWED_MODES_PHASE17F.includes(mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      reason: `Phase 17F only permits dry-run/test mode; received mode: "${mode}"`,
    };
  }

  const entry = Object.freeze({
    journalId:               fields.journalId               ?? syntheticId('journal'),
    operationId:             fields.operationId             ?? syntheticId('op'),
    manifestId:              fields.manifestId              ?? null,
    sourceKey:               fields.sourceKey               ?? null,
    targetStore:             fields.targetStore             ?? null,
    dataFamily:              fields.dataFamily              ?? null,
    operationType:           fields.operationType           ?? null,
    mode,
    status:                  'planned',
    timestamp:               fields.timestamp               ?? new Date().toISOString(),
    sourceChecksum:          fields.sourceChecksum          ?? null,
    targetChecksum:          null,
    readBeforeWriteChecksum: null,
    writeVerification:       null,
    rollbackSnapshotRef:     null,
    errorCode:               null,
    claimBoundary:           fields.claimBoundary           ?? null,
  });

  return { ok: true, entry };
}

// ── 2. Validate required fields ────────────────────────────────────────────────

/**
 * Validate that all required fields are present on an entry.
 */
export function validateRequiredFields(entry) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry', missingFields: [...REQUIRED_FIELDS] };
  }
  const missingFields = REQUIRED_FIELDS.filter(f => !(f in entry));
  if (missingFields.length > 0) {
    return { ok: false, error: 'missing_required_fields', missingFields };
  }
  return { ok: true };
}

// ── 3. Reject live-mode entries (Phase 17F gate) ───────────────────────────────

/**
 * Reject any entry whose mode is not in ALLOWED_MODES_PHASE17F.
 */
export function rejectLiveMode(entry) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (!ALLOWED_MODES_PHASE17F.includes(entry.mode)) {
    return {
      ok: false,
      error: 'live_mode_rejected',
      mode: entry.mode,
      reason: `Phase 17F only permits dry-run/test mode; received mode: "${entry.mode}"`,
    };
  }
  return { ok: true };
}

// ── 4 & 5. Status transitions ──────────────────────────────────────────────────

/**
 * Transition an entry to a new status.
 * Returns a new frozen entry; does not mutate the input.
 * Rejects invalid transitions.
 */
export function transitionStatus(entry, newStatus) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  const allowed = VALID_TRANSITIONS[entry.status];
  if (!allowed) {
    return { ok: false, error: 'invalid_current_status', currentStatus: entry.status };
  }
  if (!allowed.includes(newStatus)) {
    return {
      ok: false,
      error: 'invalid_transition',
      from: entry.status,
      to: newStatus,
      allowed: [...allowed],
    };
  }
  return { ok: true, entry: Object.freeze({ ...entry, status: newStatus }) };
}

// ── 6. Attach write verification result ───────────────────────────────────────

/**
 * Attach a write verification result object to the entry (immutable).
 */
export function attachWriteVerification(entry, verificationResult) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (verificationResult === null || verificationResult === undefined || typeof verificationResult !== 'object') {
    return { ok: false, error: 'invalid_verification_result' };
  }
  return { ok: true, entry: Object.freeze({ ...entry, writeVerification: verificationResult }) };
}

// ── 7. Attach rollback snapshot reference ─────────────────────────────────────

/**
 * Attach a rollback snapshot reference to the entry (immutable).
 */
export function attachRollbackSnapshot(entry, rollbackRef) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (rollbackRef === null || rollbackRef === undefined || typeof rollbackRef !== 'object') {
    return { ok: false, error: 'invalid_rollback_ref' };
  }
  return { ok: true, entry: Object.freeze({ ...entry, rollbackSnapshotRef: rollbackRef }) };
}

// ── 8. Mark failed with explicit error code ────────────────────────────────────

/**
 * Transition entry to 'failed' with a required non-empty error code.
 */
export function markFailed(entry, errorCode) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (typeof errorCode !== 'string' || errorCode.trim() === '') {
    return {
      ok: false,
      error: 'missing_error_code',
      reason: 'errorCode must be a non-empty string',
    };
  }
  const t = transitionStatus(entry, 'failed');
  if (!t.ok) return t;
  return { ok: true, entry: Object.freeze({ ...t.entry, errorCode }) };
}

// ── Transition to rollback-ready (requires rollbackSnapshotRef) ───────────────

/**
 * Transition entry to 'rollback-ready'.
 * Requires rollbackSnapshotRef to be attached first.
 */
export function markRollbackReady(entry) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (!entry.rollbackSnapshotRef) {
    return {
      ok: false,
      error: 'missing_rollback_snapshot',
      reason: 'rollbackSnapshotRef must be attached before marking rollback-ready',
    };
  }
  return transitionStatus(entry, 'rollback-ready');
}

// ── 9. Mark rolled back (requires rollbackSnapshotRef) ────────────────────────

/**
 * Transition entry to 'rolled-back'.
 * Requires rollbackSnapshotRef to be attached first.
 */
export function markRolledBack(entry) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (!entry.rollbackSnapshotRef) {
    return {
      ok: false,
      error: 'missing_rollback_snapshot',
      reason: 'rollbackSnapshotRef must be attached before marking rolled-back',
    };
  }
  return transitionStatus(entry, 'rolled-back');
}

// ── Complete entry (requires verified writeVerification) ──────────────────────

/**
 * Transition entry to 'completed'.
 * Requires writeVerification to be attached and verified === true.
 */
export function completeEntry(entry) {
  if (entry === null || entry === undefined || typeof entry !== 'object') {
    return { ok: false, error: 'invalid_entry' };
  }
  if (!entry.writeVerification || entry.writeVerification.verified !== true) {
    return {
      ok: false,
      error: 'write_verification_required',
      reason: 'writeVerification must be attached and verified=true before completion',
    };
  }
  return transitionStatus(entry, 'completed');
}
