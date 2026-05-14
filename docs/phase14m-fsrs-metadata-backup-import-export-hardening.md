# Phase 14M — FSRS Metadata Backup / Import / Export Hardening

## Summary

Phase 14M hardens the preservation of dormant FSRS metadata that Phase 14L
introduced into review schedule records.

It adds tests and a validator that prove backup, restore, validation, and the
review schedule read/write cycle all preserve `schedulerKind`,
`schedulerVersion`, `fsrsPayload`, and `fsrsReviewLogs` without loss,
corruption, or unexpected side-effects.

No runtime code changes are needed: the existing `getPreservedFsrsFields()`
function in `src/state/reviewScheduleStorage.js` and the pass-through behaviour
of `validateEnvelopeSection()` in `src/state/v2BackupRestore.js` already
handle preservation correctly.

---

## What Phase 14M does

- Adds `tests/unit/fsrsMetadataBackupImportExportHardening.test.js` covering
  the full backup → validate → restore → read round-trip for FSRS metadata.
- Adds `scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js`
  that statically asserts boundary compliance.
- Updates `.github/workflows/e2e-smoke.yml` to run the new validator.
- Updates historical validators with Phase 14M allowlist entries.
- Creates this doc.

---

## What Phase 14M does NOT do

- Phase 14M does not modify `src/routes/StudyRoom.jsx`.
- Phase 14M does not modify `src/routes/Dashboard.jsx`.
- Active FSRS scheduling remains disabled.
- Production `ts-fsrs.next()` is not used anywhere.
- No enrollment happens at backup/restore time.
- No enrollment happens at import, app boot, or session start.
- No migration or backfill of existing cards.
- No production Two-Step UI (Again / Hard / Good / Easy) is added.
- Future Phase 14N or 15 may handle production Two-Step UI or active FSRS
  scheduling.

---

## Metadata preservation policy

Backup/restore and the review schedule normalization path preserve these fields
on every review schedule record:

| Field | Type | Preserved |
|---|---|---|
| `schedulerKind` | string | Yes — if non-empty and not an SM-2 heuristic variant |
| `schedulerVersion` | string | Yes — if non-empty |
| `fsrsPayload` | plain object | Yes — deep-cloned if valid plain object |
| `fsrsReviewLogs` | array of plain objects | Yes — capped at `FSRS_REVIEW_LOG_CAP = 20` |

For dormant Phase 14L records:
- `schedulerKind: 'fsrs-planned'`
- `schedulerVersion: 'phase14j-dormant-readiness'`

---

## Backup / restore flow

1. **Backup creation** (`createV2BackupPayload`): reads the raw review schedule
   envelope from localStorage; FSRS fields on records are included verbatim in
   the backup JSON.

2. **Validation** (`validateV2BackupPayload`): `validateEnvelopeSection()` only
   checks the envelope schema version and that `records` is an array; individual
   record fields including FSRS metadata pass through unchanged.

3. **Restore** (`restoreV2BackupPayload`): writes the validated envelope back to
   localStorage as-is; FSRS fields in records are preserved in storage.

4. **Read after restore** (`readReviewSchedule`): `normalizeEnvelope()` runs
   `normalizeScheduleRecord()` → `getPreservedFsrsFields()` which preserves
   `schedulerKind`, `schedulerVersion`, `fsrsPayload`, and a capped
   `fsrsReviewLogs`.

---

## Log cap policy

`fsrsReviewLogs` is capped at `FSRS_REVIEW_LOG_CAP = 20` (the latest 20 logs
are kept).

If a backup contains a record with more than 20 logs, after a restore and a
subsequent `readReviewSchedule()` call the logs are capped at 20. The cap is
applied by `getPreservedFsrsFields()` at every normalize-read boundary, not at
write time.

---

## Legacy backup compatibility

Older backups without FSRS metadata:
- Validate without error.
- Restore without error.
- Produce SM-2-like records after restore (no FSRS fields added).

Restore does not enroll cards into FSRS. Enrollment only happens via the
`updateReviewScheduleFromHistoryRecord()` path (Phase 14L).

---

## Invalid metadata handling policy

If a backup record contains malformed FSRS subfields:
- A non-object `fsrsPayload` is silently dropped; the base record is preserved.
- A non-array `fsrsReviewLogs` is silently dropped; the base record is preserved.
- A non-string `schedulerKind` or `schedulerVersion` is silently dropped.
- Non-plain-object entries within `fsrsReviewLogs` are filtered out before
  capping.

The restore never crashes on malformed FSRS subfields. The base schedule record
(`itemId`, `dueAt`, `intervalDays`, etc.) is always preserved if the record
has a valid `itemId`.

---

## Toggle independence

Backup/restore does not depend on `fsrsExperimentalEnabled`.

Toggle OFF:
- Does not block backup creation.
- Does not delete existing dormant FSRS metadata during restore.
- Does not modify stored FSRS fields in already-enrolled records.

---

## Active scheduling disabled

- `ts-fsrs.next()` is not called in `v2BackupRestore.js`,
  `reviewScheduleStorage.js`, or any path touched by Phase 14M.
- `scheduleReview()` in the adapter still throws for `fsrs-planned` records
  without `enableFsrsTestRoute === true` (Phase 14A invariant preserved).

---

## Deferred work

- Phase 14N or later: production Two-Step UI (Again / Hard / Good / Easy)
  integrated into StudyRoom.
- Phase 14O or later: active FSRS scheduling via `ts-fsrs.next()`.
- Phase 14P or later: Dashboard mixed-scheduler due count.
- No migration or backfill of existing cards is planned in Phase 14M, 14N.

---

## Files changed

| File | Change |
|---|---|
| `docs/phase14m-fsrs-metadata-backup-import-export-hardening.md` | This doc |
| `tests/unit/fsrsMetadataBackupImportExportHardening.test.js` | New unit tests (15 cases) |
| `scripts/validate-phase14m-fsrs-metadata-backup-import-export-hardening.js` | New static validator |
| `.github/workflows/e2e-smoke.yml` | Adds Phase 14M validator step |
| `scripts/validate-phase14k-fsrs-readiness-audit.js` | Adds Phase 14M allowlist entries |
| `scripts/validate-phase14l-production-enrollment-wiring.js` | Adds Phase 14M allowlist entries |
