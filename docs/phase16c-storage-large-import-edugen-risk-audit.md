# Phase 16C — Storage / Large Import Safety / EduGen Bulk Import Risk Audit

## 1. Phase statement

Phase 16C is docs/tests/validator/CI only.

This phase:

- Does not implement runtime changes.
- Does not modify `src/` files.
- Does not modify `e2e/` files.
- Does not change `package.json` or `package-lock.json`.
- Does not implement IndexedDB migration.
- Does not implement event log runtime.
- Does not implement StorageAdapter runtime.
- Does not implement SyncAdapter runtime.
- Does not implement EduGen connector runtime.
- Does not add new localStorage keys.
- Does not change storage schema.
- Does not change backup/export/import runtime behavior.
- Does not add dependencies.
- Does not add UI.
- Introduces no runtime changes of any kind.

Phase 16B established the Hybrid Local-First Architecture ADR and defined
the optional sync direction. Phase 16C builds on that foundation with a
thorough storage surface inventory, large import risk register, EduGen
bulk import risk register, FSRS metadata safety requirements, backup/export/import
safety requirements, IndexedDB migration prerequisites, and event log
prerequisites. This audit creates the safety map needed before any future
storage migration, sync, or EduGen runtime connector phases.

---

## 2. Storage surface inventory

The following is the complete storage surface inventory for Shime Quiz as of
Phase 16C. All surfaces use browser-local `localStorage`. No cloud, sync, or
IndexedDB storage exists.

### 2.1 Canonical data

Canonical data is authoritative and must be preserved through all future
migrations, imports, exports, backups, and restores.

| Surface | localStorage key | Schema | Owner module |
|---|---|---|---|
| Quiz library (subjects/topics/items) | `shimeV2LearningDataV1` | `LIBRARY_SCHEMA_VERSION` | `src/data/learningDataStore.js` |
| Review schedule records | `shimeV2ReviewScheduleV1` | `REVIEW_SCHEDULE_SCHEMA_VERSION` | `src/state/reviewScheduleStorage.js` |
| Study history records | `shimeV2StudyHistoryV1` | `STUDY_HISTORY_SCHEMA_VERSION` | `src/state/studyHistoryStorage.js` |
| Settings (including FSRS flags) | `shimeV2SettingsV1` | `SETTINGS_SCHEMA_VERSION` | `src/state/settingsStorage.js` |
| Recommendation feedback | `shimeV2RecommendationFeedbackV1` | `RECOMMENDATION_FEEDBACK_SCHEMA_VERSION` | `src/state/recommendationFeedbackStorage.js` |
| Study goal | `shimeV2StudyGoalV1` | `STUDY_GOAL_SCHEMA_VERSION` | `src/state/studyGoalStorage.js` |
| Study plan progress | `shimeV2StudyPlanProgressV1` | `STUDY_PLAN_PROGRESS_SCHEMA_VERSION` | `src/state/studyPlanProgressStorage.js` |

### 2.2 Derived data

Derived data is recomputable from canonical data and must never be treated as
authoritative. Derived data must never be synced as an authoritative value.

| Surface | Source | Where computed |
|---|---|---|
| Dashboard due counts | Review schedule records + current time | `computeMixedSchedulerDueSummary()` |
| FSRS retrievability | `fsrsPayload.stability` + elapsed time | FSRS library computation |
| Progress summaries | Study history + quiz library | Dashboard aggregation |
| SM-2 ease factors | Review schedule records | Stored in `easeFactor` field |
| UI display state | All canonical surfaces | Route components |

### 2.3 FSRS metadata fields (canonical, must be preserved)

The following FSRS metadata fields are canonical and must survive all future
migrations, imports, exports, backups, and restores:

| Field | Purpose |
|---|---|
| `schedulerKind` | Routes scheduling in `getSchedulerKind()`; loss collapses routing |
| `schedulerVersion` | Audit trail for scheduler transitions |
| `dueAt` | Authoritative next review date |
| `intervalDays` | Current interval state |
| `easeFactor` | SM-2 ease fallback |
| `repetitionCount` | SM-2 repetition count |
| `correctStreak` | SM-2 correct streak |
| `wrongCount` | SM-2 wrong count fallback |
| `fsrsPayload` | Full FSRS card state object |
| `fsrsPayload.stability` | Core FSRS parameter; loss collapses schedule |
| `fsrsPayload.difficulty` | Core FSRS parameter; loss resets difficulty estimates |
| `fsrsPayload.state` | New/Learning/Review/Relearning state |
| `fsrsPayload.reps` | FSRS repetition count |
| `fsrsPayload.lapses` | FSRS lapse count |
| `fsrsReviewLogs` | Per-item review log (capped at 20 by `FSRS_REVIEW_LOG_CAP`) |
| `fsrsEnabledAt` | Write-once optimizer cutoff timestamp |

`fsrsActiveSchedulingEnabled` is internal/test-controlled and must NOT be
synced, imported as user-facing state, or treated as canonical for migration
or sync purposes.

### 2.4 Backup/export payload

The v2 backup payload (`V2_BACKUP_SCHEMA_VERSION = 'shime-v2-backup-v1'`) includes
all canonical sections: `library`, `studyHistory`, `reviewSchedule`,
`recommendationFeedback`, `studyGoal`, `studyPlanProgress`, and `settings`.

Three backup modes exist:
- `FULL` — library with answers + all learning state. Restore is supported.
- `REDACTED_LIBRARY` — library with answers removed. Restore is not supported.
- `PROGRESS_ONLY` — learning state only; requires matching library. Restore is not supported.

### 2.5 Review logs

`fsrsReviewLogs` is a per-item append-only array capped at `FSRS_REVIEW_LOG_CAP = 20`
entries. This is a bounded design seed for a future global event log. It is
canonical FSRS metadata and must be preserved through backup/restore.

A global append-only review event log is future work and is not implemented in
Phase 16C or any earlier phase.

---

## 3. Large import risk register

### 3.1 Identified risks

| Risk | Severity | Description |
|---|---|---|
| localStorage quota pressure | HIGH | Large imports (many subjects/topics/items) push localStorage toward browser quota limits. localStorage quota is typically 5–10 MB per origin; a large quiz library with FSRS metadata can approach this limit. |
| JSON parse/stringify cost | MEDIUM | Large JSON payloads cause synchronous blocking on parse (import) and stringify (backup/export). Payloads over 1 MB can cause visible UI freeze. |
| UI slowdowns | MEDIUM | Rendering hundreds or thousands of items from a freshly-imported library can cause frame drops in Library and Dashboard views. |
| Duplicate item IDs | HIGH | If imported items share `itemId` values with existing items, `mergeScheduleRecords()` silently overwrites existing schedule records. Existing FSRS metadata for duplicate IDs is lost. |
| Invalid item shapes | MEDIUM | Malformed items (missing required fields, wrong types) may pass basic array validation but cause runtime failures in StudyRoom. `validateLearningDataImport()` provides structural validation but cannot guarantee all edge cases. |
| Partial import failure | HIGH | If a multi-step import (library write, then schedule reconcile) fails mid-way, the library may be updated but schedule records may be stale or corrupt. No import transaction semantics exist today. |
| Backup size growth | MEDIUM | Each large import increases v2 backup payload size. Extremely large libraries may cause backup JSON serialization to exceed blob limits. |
| Restore regression | HIGH | Restoring a backup that includes a very large library may fail at preflight stage if `preflightRestoreWrites()` cannot fit the combined payload. This is a silent restore failure without clear user guidance. |
| Data loss on overwrite | CRITICAL | If import silently replaces existing library without user confirmation, all existing study progress (schedule records, FSRS metadata) becomes orphaned for replaced items. |

### 3.2 Future requirements for safe large imports

Before any large import runtime implementation, the following safety
requirements must be met:

1. **Backup before large import** — the UI must offer (or require) a backup
   export before any import that replaces or substantially augments the library.
2. **Item count and byte-size guard** — the import flow must estimate the
   combined post-import storage footprint and warn the user if it approaches
   or exceeds a safe threshold (e.g., 4 MB combined library + schedule).
3. **Preview before commit** — the user must be shown a summary of what will
   change (items added, items replaced, FSRS records affected) before the
   import is committed.
4. **Import transaction semantics** — library write and schedule update must
   be atomic or roll back together. A partial write must not leave the app in
   an inconsistent state.
5. **Duplicate detection** — items with duplicate IDs must be surfaced before
   commit. The user must choose: keep existing, replace with imported, or
   merge.
6. **Rollback and recovery** — if import fails after library write, the
   previous library must be restorable from the pre-import snapshot or backup.
7. **User-visible warnings in Vietnamese** — all import warnings and errors
   must be presented in Vietnamese-first copy consistent with Phase 16A UX
   alignment.
8. **Storage quota check** — import must check `navigator.storage.estimate()`
   where available and warn if free space is insufficient.

---

## 4. EduGen bulk import risk register

### 4.1 Identified risks

EduGen is an optional external tool that processes documents to produce draft
quiz content. EduGen is not bundled with Shime Quiz. No built-in AI quiz
generation exists. No built-in OCR capability is part of the application. No EduGen connector runtime exists
in Phase 16C or any earlier phase.

When a future EduGen connector is implemented, the following risks apply to
EduGen-generated content imported into Shime Quiz:

| Risk | Severity | Description |
|---|---|---|
| Many items from document chunks | HIGH | A long document may produce hundreds or thousands of draft items, overwhelming localStorage quota in a single import. |
| Low-quality generated questions | HIGH | AI-generated questions may be ambiguous, incorrect, or duplicated. Users may assume generated output is correct without review. |
| Malformed JSON | MEDIUM | EduGen output that fails JSON parsing or schema validation must be rejected cleanly, not silently partially imported. |
| Repeated/duplicate cards | MEDIUM | Chunked document processing may produce near-duplicate questions across adjacent chunks. No deduplication exists in the current import path. |
| Missing source attribution | MEDIUM | Generated items lack `sourceMetadata` fields linking them to the source document, making review and auditing difficult. |
| Huge text fields | MEDIUM | Generated question/answer text from long document passages may be very large, consuming disproportionate storage per item. |
| Privacy misunderstandings | HIGH | Users may import documents containing personal or sensitive content without understanding that EduGen processes that content externally. |
| User trusting generated output | CRITICAL | Generated questions must be treated as drafts requiring review. Users must not be able to start active study from EduGen output without explicit confirmation. |
| No FSRS activation from import | HIGH | EduGen-imported items must not automatically trigger FSRS enrollment. `isFsrsNewCardEnrollmentEligible()` governs enrollment and must remain the only gate. |

### 4.2 Future requirements for safe EduGen bulk import

1. **EduGen output is draft, not trusted quiz** — all EduGen-generated content
   must be treated as a draft and must require explicit user review and approval
   before it enters the active quiz library or study schedule.
2. **Generated items require review before study** — items imported from EduGen
   must be placed in a review/draft state and must not immediately appear in
   study queues without user confirmation.
3. **`sourceMetadata` must be preserved** — future EduGen connector must attach
   `sourceMetadata` to each generated item: at minimum, source document
   identifier, chunk range, generation model identifier (if available), and
   import timestamp.
4. **No automatic FSRS activation from EduGen import** — EduGen-imported items
   must follow the existing enrollment eligibility path. No special FSRS
   activation may be triggered by import.
5. **No built-in AI/OCR/cloud claims** — Shime Quiz must not claim built-in AI
   quiz generation, built-in OCR, or cloud-based EduGen processing. EduGen is
   an optional external or local connector.
6. **Item count guard** — EduGen import must enforce a maximum item count per
   import batch (e.g., 500 items) to prevent localStorage quota exhaustion.
7. **Draft workshop** — a future draft workshop UI must allow users to review,
   edit, approve, or reject individual generated items before library
   insertion.
8. **Duplicate detection** — EduGen-generated items must be checked for
   near-duplicate IDs or question text before commit.
9. **Privacy notice** — before connecting to any external EduGen service, the
   user must be shown a clear notice that their document content will be
   processed externally.

---

## 5. FSRS metadata safety requirements

### 5.1 Fields that must survive all storage operations

The following FSRS metadata fields must be preserved through import/export,
backup, restore, and any future IndexedDB migration:

- `schedulerKind` — do not normalize away non-SM2 values
- `schedulerVersion` — preserve as audit trail
- `dueAt` / due fields — authoritative scheduling date
- `intervalDays` — current interval state
- `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount` — SM-2 fallback fields
- `fsrsPayload` — full FSRS card state; must be preserved as-is if present
  - `fsrsPayload.stability`
  - `fsrsPayload.difficulty`
  - `fsrsPayload.state`
  - `fsrsPayload.reps`
  - `fsrsPayload.lapses`
- `fsrsReviewLogs` — capped at 20; all entries must round-trip intact
- `fsrsEnabledAt` — write-once; must use earlier value if conflict

### 5.2 Write-once and double-gate invariants

- `fsrsEnabledAt` must never be cleared through backup restore. The
  `importSettings()` write-once guard (Phase 14G) must be preserved in all
  future import/restore paths.
- `fsrsActiveSchedulingEnabled` must NOT be synced between devices or
  imported as user-facing state. This flag is internal/test-controlled only.
  Active FSRS scheduling remains double-gated and default OFF.
- Existing SM-2 cards must not be migrated or backfilled to FSRS by any
  import or restore operation.

### 5.3 Backup round-trip validation requirements

Before any storage architecture change (IndexedDB migration, sync adapter),
the following must be validated:

- `fsrsPayload` round-trips correctly through `createV2BackupPayload()` and
  `restoreV2BackupPayload()`.
- `fsrsEnabledAt` is preserved through backup restore (already protected by
  `importSettings()` write-once guard in `settingsStorage.js`).
- `fsrsReviewLogs` are capped at 20 and round-trip with all log fields intact.
- `getPreservedFsrsFields()` in `reviewScheduleStorage.js` correctly preserves
  all FSRS fields during schedule normalization.

---

## 6. Backup/export/import safety requirements

### 6.1 Current state

Backup/export/import is the primary portability model for Shime Quiz. The v2
backup framework (`v2BackupRestore.js`) is mature:
- Versioned schema (`V2_BACKUP_SCHEMA_VERSION`)
- Three backup modes (FULL, REDACTED_LIBRARY, PROGRESS_ONLY)
- Transactional restore with pre-flight check and rollback
- Settings and FSRS metadata preservation through `importSettings()` write-once guard

### 6.2 Requirements

1. **Backup remains primary portability** — backup/export/import is not a
   legacy fallback. Future sync must not frame backup as deprecated or
   secondary.
2. **Backups must preserve settings and FSRS metadata** — all settings fields
   including `fsrsEnabledAt`, `fsrsExperimentalEnabled`, and `fsrsActiveSchedulingEnabled`
   (with write-once guard) must survive backup/restore.
3. **Restore must validate and discard malformed metadata safely** —
   `normalizeSettings()` and `normalizeScheduleRecord()` must be the sole
   normalization paths. Malformed FSRS metadata must be discarded safely, not
   cause a crash or silent corruption.
4. **Large imports should recommend backup first** — before any import that
   substantially changes the library, the UI must offer or require a backup.
5. **Future migration must require pre-migration backup** — any future
   IndexedDB migration phase must require a successful backup export before
   migration proceeds. The UI must enforce this.
6. **Future sync must not replace backup/export** — sync is real-time
   convenience. Backup is data ownership assurance. Both must coexist.
7. **Preflight check must be validated before large restores** — `preflightRestoreWrites()`
   must correctly estimate the combined restore payload size. If the preflight
   fails, the user must see a clear Vietnamese-first error message.

---

## 7. IndexedDB migration prerequisites

No IndexedDB migration is implemented in Phase 16C or any earlier phase. The
following prerequisites must be met before any IndexedDB migration runtime
phase begins:

### 7.1 Schema inventory

- All localStorage keys and their schema versions must be inventoried and
  documented before migration begins.
- All FSRS metadata fields must be mapped to their IndexedDB object store
  equivalents with explicit field preservation guarantees.

### 7.2 Versioned envelopes

- IndexedDB object stores must use versioned schema envelopes matching the
  current localStorage schema versions.
- Schema version must be stored in the object store metadata, not only in
  individual records.

### 7.3 Migration tests

- Unit tests must cover: successful migration, partial migration (interrupted),
  corrupt record handling, duplicate record handling, and rollback.
- Backup/restore regression tests must be run before and after migration with
  FSRS-active data.

### 7.4 Backup-before-migration

- The migration UI must require a successful backup export before proceeding.
- The migration must not begin if the pre-migration backup fails or is not
  confirmed by the user.

### 7.5 Rollback plan

- The localStorage source copy must be preserved until migration is verified.
- Migration state must be tracked separately to allow safe retry after
  interruption.
- The rollback path must restore the pre-migration localStorage state exactly.

### 7.6 Read-after-write verification

- After migration, a read-after-write check must confirm all records are
  accessible from IndexedDB before the localStorage source is cleared.
- FSRS metadata fields must be spot-checked during verification.

### 7.7 Quota and error handling

- IndexedDB quota errors must be caught and surfaced to the user with a
  clear Vietnamese-first error message and backup recommendation.
- The app must gracefully degrade to localStorage if IndexedDB is unavailable
  or blocked.

### 7.8 Browser compatibility

- IndexedDB availability must be detected before migration begins.
- Browsers that block IndexedDB (e.g., Safari Private Browsing) must fall
  back to localStorage without error.

### 7.9 No silent destructive migration

- No migration step must silently delete or overwrite user data.
- Every destructive operation must be user-visible and reversible.

---

## 8. Event log prerequisites

An append-only review event log is future work. No event log runtime exists in
Phase 16C or any earlier phase.

### 8.1 Sequence requirements

The correct implementation sequence is:

1. **Plan first** (future docs-only phase) — define event schema, compaction
   policy, and relationship to sync conflict resolution.
2. **Scaffold second** (future scaffold phase) — implement static structure,
   no production writes.
3. **Implement last** (future runtime phase, after sync adapter exists).

No event log planning should begin runtime implementation until an approved
event log schema ADR is merged.

### 8.2 Future event log schema (planning reference only, not implemented)

```json
{
  "eventId": "uuid-v4",
  "eventKind": "review_result",
  "itemId": "string",
  "sessionId": "string",
  "rating": "Hard|Good|Easy|Again|null",
  "outcome": "correct|wrong|unanswered",
  "schedulerKind": "sm2-heuristic|fsrs-planned|fsrs-active",
  "reviewedAt": "ISO",
  "deviceId": "string (optional)"
}
```

This schema is not implemented. It is planning context only.

### 8.3 Compaction and storage requirements

- A global event log must apply a compaction policy at least as strict as
  `FSRS_REVIEW_LOG_CAP = 20` (the per-item log cap precedent in
  `reviewScheduleStorage.js`).
- Compaction/snapshot policy is future work.
- The event log must not grow unbounded. A maximum log size must be enforced
  before any event log runtime is shipped.

### 8.4 Event log is not currently needed for safety

The existing `fsrsReviewLogs` per-item bounded log is sufficient for FSRS
optimizer support in the current phase. A global event log adds complexity
and should only be implemented when sync conflict resolution requires it.

---

## 9. Claim guardrails

### 9.1 Safe claims after Phase 16C

```
Phase 16C is docs/tests/validator/CI only — no runtime changes of any kind.
Storage surface inventory is documented.
Large import risk is documented.
EduGen bulk import risk is documented.
FSRS metadata safety requirements are documented.
Backup/export/import safety requirements are documented.
IndexedDB migration prerequisites are documented.
Event log prerequisites are documented.
No IndexedDB migration has been implemented.
No event log runtime is in production.
No StorageAdapter runtime has been implemented.
No SyncAdapter runtime has been implemented.
No EduGen connector runtime has been implemented.
Backup/export/import remains the primary portability model.
Active FSRS remains experimental, double-gated, default OFF,
  internal/test-controlled.
```

### 9.2 Forbidden claims (permanently forbidden)

The following categories of assertions are permanently forbidden and must not
appear in any public-facing surface, release note, or user communication:

- Asserting that EduGen has been bundled with or is included in Shime Quiz.
- Asserting that a built-in AI generation feature for quizzes exists.
- Asserting that a built-in OCR feature exists.
- Asserting that a cloud-based sync feature exists in the application.
- Asserting that sync functionality has been deployed or enabled for users.
- Asserting that an IndexedDB migration has been finished and deployed to production.
- Asserting that an event log has been shipped or is running in production.
- Asserting that AI-generated questions are accurate or can be trusted without review.
- Asserting that active FSRS has been rolled out broadly to all or most users.
- Asserting that active FSRS is enabled for all users.
- Any production, security, or accessibility certification claims.

---

## 10. Proposed next phase

**Phase 16D — Shime Study Identity / Product Principles**

Phase 16D should document the core Shime study identity and product principles:
what kind of learner Shime Quiz is designed for, the study philosophy behind
spaced repetition, and the product values that inform future feature decisions.
This is a docs/static-validator/CI-only phase with no runtime changes.

Alternatively, if the team prefers to address visual polish before identity
documentation:

**Phase 16D — Visual Polish Quick Wins**

Phase 16D could address small visual/UX polish items: accessibility
improvements, visual consistency, responsive layout refinements. This is a
runtime phase with UI changes only, no learning logic changes.

---

## 11. Evidence of audit source read

The following source files were read for this audit (no modifications made):

- `src/state/reviewScheduleStorage.js` — FSRS metadata fields, review log cap, schedule normalization
- `src/state/settingsStorage.js` — settings schema, FSRS flags, write-once `fsrsEnabledAt` guard
- `src/state/v2BackupRestore.js` — backup modes, restore transaction, preflight check, settings preservation
- `src/quiz/dataBackup.js` — legacy backup payload structure
- `docs/storage-capacity-indexeddb-migration-plan.md` — Phase 12B storage capacity risk and IndexedDB prerequisites
- `docs/phase16b-hybrid-local-first-optional-sync-direction.md` — hybrid local-first ADR, FSRS sync boundary

Key findings:
- `FSRS_REVIEW_LOG_CAP = 20` is defined in `reviewScheduleStorage.js` and is the bounded log precedent
- `getPreservedFsrsFields()` correctly preserves `schedulerKind`, `schedulerVersion`, `fsrsPayload`, `fsrsReviewLogs`
- `importSettings()` has write-once `fsrsEnabledAt` protection
- `preflightRestoreWrites()` provides a storage space check before full restore
- `v2BackupRestore.js` uses transactional restore with `snapshotRestoreKeys()` + `rollbackRestoreWrites()`
- `dataBackup.js` is a legacy path that does not include v2 settings or FSRS metadata — future imports should prefer the v2 path
