# Phase 20C — Performance / Quota / Import Stress Test Plan

## Purpose

Phase 20C is a docs/static-validator/CI-only performance, quota, and import stress-test
planning gate for Shime Quiz / ShimeChamhoc v2. It does not implement runtime stress
fixtures. It does not add tests. It does not add UI. It does not add telemetry or
analytics. It does not collect user data. It does not modify storage behavior, FSRS
behavior, backup/export/restore behavior, package files, or dependencies.

Phase 20C is a plan-only gate. Its job is to define the performance, storage quota, and
import stress-test plan that will provide evidence for the Phase 20D beta-ready-or-hold
decision. This phase must not implement runtime stress fixtures, production tests,
telemetry, analytics, sync, migration runtime, storage backend switching, or package
changes.

```text
PERFORMANCE_STRESS_DECISION: PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES
```

Phase 20C is docs/static-validator/CI-only. Phase 20C is a plan-only gate. Phase 20C
does not implement runtime stress fixtures. Phase 20C does not add tests. Phase 20C does
not add UI. Phase 20C does not add telemetry. Phase 20C does not add analytics. Phase
20C does not collect user data. Phase 20C does not change import parser behavior. Phase
20C does not change backup/export/restore behavior. Phase 20C does not implement sync
runtime. Phase 20C does not implement storage backend switch. Phase 20C does not
implement migration runtime. localStorage remains canonical production storage.
Backup/export/restore behavior remains unchanged. Manual transfer remains a
user-controlled action. Sync remains unshipped. Beta readiness remains gated by
Phase 20D.

---

## Relationship to Phase 20A

Phase 20A established:

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A confirmed that the local-first production baseline is stable for beta
discussion, defined the safety invariants that must remain active throughout all future
phases, and specified the Phase 20B–20D scopes. Phase 20A did not claim beta readiness;
beta readiness remains gated by Phase 20B–20D.

Phase 20C inherits all Phase 20A safety invariants unchanged:

- localStorage remains the canonical production source of truth.
- No sync runtime exists.
- No account/cloud/auth/backend exists.
- No production IndexedDB storage exists.
- No runtime migration exists.
- No dual-write exists.
- No localStorage deletion happens.
- Backup/export/restore behavior remains unchanged.
- Manual transfer is the only cross-device data movement path.
- FSRS active scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS public opt-in has not shipped.
- The Phase 17B StorageAdapter scaffold remains test-only.
- The Phase 18A test-only IndexedDBAdapter prototype remains test-only.
- The Phase 18E synthetic local backend pilot remains internal.

Phase 20C also inherits the Phase 20A evidence inventory: Phase 17A–17I storage
readiness work, Phase 18A–18E local backend pilots, Phase 19A–19D sync and trust
decisions. None of these constraints are relaxed by Phase 20C.

---

## Relationship to Phase 20B

Phase 20B established:

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B defined the real user testing plan and data safety feedback plan. Phase 20B
identified the following inputs to Phase 20C:

- Storage quota warnings and large import behavior need systematic stress testing beyond
  qualitative Phase 20B observation.
- Import flow correctness and performance under larger datasets need documented boundaries.
- Backup and restore performance under repeated cycles needs a rehearsal plan.
- Mobile/PWA behavior under stress (large library, large import) needs explicit scenarios.
- Review schedule and FSRS due-count accuracy under volume needs defined measurement.

Phase 20C consumes Phase 20B feedback about storage quota warnings and large import
behavior. Phase 20C translates Phase 20B qualitative scenario guidance into concrete
stress-test planning with defined data sets, measurement approaches, failure thresholds,
and Phase 20D evidence handoff.

Phase 20B did not implement stress fixtures or runtime measurement infrastructure.
Phase 20C does not implement them either. Phase 20C defines the plan. If stress fixtures
are ever implemented, that requires an explicit separate gate after Phase 20D.

---

## Current production baseline

The following statements describe the current production state as of Phase 20C. None of
these are changed by Phase 20C.

- Phase 20C is docs/static-validator/CI-only.
- Sync runtime is not implemented.
- Account/cloud sync is not implemented.
- No Shime-hosted backend exists.
- No account/auth/identity exists.
- No remote endpoint exists.
- No dual-write exists.
- No app-boot migration exists.
- No production storage backend switch exists.
- No production IndexedDB storage exists.
- No production IndexedDBAdapter exists.
- No runtime migration exists.
- No localStorage deletion happens.
- localStorage remains the canonical production source of truth.
- Backup/export/restore behavior remains unchanged.
- Backup is not sync.
- Restore may overwrite current data.
- The Phase 17B StorageAdapter scaffold remains test-only.
- The Phase 18A test-only IndexedDBAdapter prototype remains test-only.
- The Phase 18E synthetic local backend pilot remains internal.
- FSRS active scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS public opt-in has not shipped.
- Manual transfer is the only cross-device data movement available today.
- Performance and quota behavior have not been systematically stress-tested yet.

---

## Stress-test planning decision

```text
PERFORMANCE_STRESS_DECISION: PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES
```

Phase 20C selects PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES.

This decision means:

- Phase 20C translates the Phase 16K, 17A–18E, 20A, and 20B evidence base into a
  concrete stress-test plan.
- Phase 20C defines performance, quota, and import stress-test scenarios.
- Phase 20C defines test data sets for stress testing.
- Phase 20C defines measurement approaches and failure thresholds.
- Phase 20C defines Phase 20D evidence handoff requirements.
- Phase 20C does not implement runtime stress fixtures.
- Phase 20C does not add tests.
- Phase 20C does not add UI.
- Phase 20C does not add telemetry.
- Phase 20C does not add analytics.
- Phase 20C does not collect user data.
- Phase 20C does not change import parser behavior.
- Phase 20C does not change backup/export/restore behavior.
- Phase 20C does not implement sync runtime.
- Phase 20C does not implement storage backend switch.
- Phase 20C does not implement migration runtime.
- localStorage remains canonical production storage.
- Backup/export/restore behavior remains unchanged.
- Manual transfer remains a user-controlled action.
- Sync remains unshipped.
- Beta readiness remains gated by Phase 20D.

Stress testing under this plan is conducted manually by a small trusted group using
generated or duplicate test data. No automated stress testing infrastructure is added.
No in-app instrumentation is added. Results are recorded via external notes and provided
to Phase 20D as human-readable evidence.

---

## What Phase 20C measures

Phase 20C defines planned measurement of the following:

- App startup responsiveness with small libraries (under 50 cards).
- App startup responsiveness with large libraries (200–500+ cards).
- Dashboard today plan rendering performance with large libraries.
- Study Room session responsiveness with large due-card queues.
- Import flow performance and correctness for small, medium, and large JSON datasets.
- Import flow performance and correctness for CSV datasets.
- Import flow performance and correctness for text/markdown datasets.
- EduGen draft review import boundary behavior under realistic content volumes.
- Storage quota estimate accuracy and warning threshold behavior.
- Large import warning visibility and copy clarity.
- Backup creation performance and file integrity under repeated cycles.
- Restore performance and data integrity after backup/restore rehearsal.
- Manual export/import transfer correctness at scale.
- Review schedule due-count accuracy after large-library import and backup/restore.
- FSRS active/off/default boundary behavior under volume.
- Mobile viewport responsiveness and PWA/service worker cache boundary behavior.

---

## What Phase 20C does not measure yet

Phase 20C explicitly does not plan measurement of the following:

- Sync throughput or conflict resolution performance (sync is not implemented).
- Cloud storage quota (no cloud backend exists).
- IndexedDB performance in production (IndexedDB is test-only).
- Migration performance (migration runtime does not exist).
- Account/auth/backend latency (no backend exists).
- Automated concurrent-user load testing (no server exists).
- Real user telemetry or analytics (not collected).
- Statistical A/B performance comparison (no telemetry infrastructure).

---

## Performance risk areas

The following areas represent performance risk in the current production baseline.

### App startup with large library

localStorage reads are synchronous. A library with 500+ cards may cause a perceptible
delay on app startup, especially on low-memory mobile devices. The stress plan must
include startup measurement with small and large libraries to establish whether startup
time is acceptable for beta.

### Dashboard today plan with large library

The Dashboard today plan aggregates due cards across the full library. With a large
library, this aggregation may cause a perceptible delay or visual flash before the plan
is displayed. The stress plan must include Dashboard rendering with a large library.

### Study Room session with due cards

Study Room sessions iterate over due cards. With a large due-card queue (100+ due cards),
session startup and card transitions may be noticeably slow. The stress plan must include
Study Room sessions with large due-card queues.

### Repeated backup/restore rehearsal

Backup and restore both read and write the full localStorage state. Repeated backup and
restore cycles on a large library may cause accumulating latency or data corruption. The
stress plan must include repeated backup/restore rehearsal.

---

## Storage quota risk areas

localStorage is subject to browser storage quota limits (typically 5–10 MB per origin).
The following areas represent quota risk.

### Small library quota safety

A small library (under 50 cards, simple text content) should safely fit within normal
localStorage quota. This must be verified to establish a safe baseline.

### Large library quota boundary

A library with 500+ cards, rich text, and full FSRS metadata may approach localStorage
quota limits on some browsers. The stress plan must include quota estimation and
measurement for large libraries.

### Large import quota warning

Importing a large file (e.g., 500+ card JSON) may push the library close to or past
quota limits. The storage quota warning must appear at the correct threshold and be
clearly actionable. The stress plan must verify warning visibility and copy clarity.

### Accumulated backup files

Backup files are exported to the user's download folder, not stored in localStorage.
However, accumulating many export files in the download folder is a hygiene concern.
The stress plan should note the expected backup file size for small and large libraries.

---

## Import risk areas

The following areas represent import risk in the current production baseline.

### Import small JSON

Importing a small JSON file (under 50 cards) should complete quickly and correctly.
The stress plan must verify import success and correctness for small JSON datasets.

### Import larger JSON

Importing a larger JSON file (200–500+ cards) may be slower and may approach quota
limits. The stress plan must verify import performance, correctness, and quota warning
behavior for larger JSON datasets.

### Import CSV

CSV import involves parsing a different format. The stress plan must verify import
success and correctness for CSV datasets at small and large sizes.

### Import text/markdown

Text and markdown import involves parsing unstructured or semi-structured content.
The stress plan must verify import correctness and boundary behavior for text and
markdown files.

### EduGen draft review import boundary

EduGen draft review generates content that must be reviewed before import. The stress
plan must verify that the draft review import boundary is enforced correctly and does
not silently add unreviewed content to the library.

### Large import warning

The large import warning must appear at the correct threshold, be clearly visible, and
communicate the storage quota risk accurately. The stress plan must verify warning
threshold accuracy and copy clarity.

---

## Backup and restore risk areas

The following areas represent backup and restore risk in the current production baseline.

### Backup file integrity

A backup file must be a complete, readable JSON snapshot of the full library state,
including cards, review schedules, and FSRS metadata if applicable. The stress plan
must verify backup file integrity for small and large libraries.

### Restore correctness

Restoring from a backup must replace the full library state correctly, preserving
card count, review schedules, and FSRS metadata. The stress plan must verify restore
correctness after backup of small and large libraries.

### Repeated backup/restore rehearsal

Repeated backup/restore cycles must not accumulate errors or corruption. The stress
plan must include at least three consecutive backup/restore rehearsal cycles on a large
library and verify item count, review schedule count, and data integrity after each.

### Restore may overwrite current data

Restore replaces current localStorage state. Testers must be briefed that restore may
overwrite current data before any restore operation in stress testing.

---

## Manual transfer risk areas

Manual transfer (export on one device, import on another) is the only cross-device data
movement path. The stress plan must cover the following transfer risk areas.

### Transfer correctness at scale

A manual transfer of a large library must preserve card count, review schedules, and
FSRS metadata correctly. The stress plan must verify transfer correctness for large
libraries.

### Transfer is not sync

After a manual transfer, the two devices have separate, diverging copies. The stress
plan must verify that the app makes no claim that the transfer was sync and that the
tester understands the divergence model.

---

## FSRS and review schedule risk areas

### FSRS active/off/default boundary

With FSRS active, the review schedule uses FSRS interval calculations. With FSRS off
or at default, the review schedule uses the standard scheduler. The stress plan must
verify that the FSRS/default boundary behaves correctly under volume and that due-card
counts are accurate after large-library import.

### Review schedule due-count accuracy

After a large-library import, backup/restore, or manual transfer, the due-card count
must accurately reflect the restored review schedule state. The stress plan must include
review schedule due-count accuracy verification after import, backup/restore, and
manual transfer.

### FSRS data does not sync

FSRS review schedule data must not silently merge between devices. Manual transfer is
the only cross-device path for FSRS data. The stress plan must verify that no FSRS
data silently crosses device boundaries.

---

## Mobile/PWA risk areas

### Mobile viewport

Mobile viewport behavior (small screen layout, touch interactions, scroll behavior) must
be tested under stress conditions (large library, large import). The stress plan must
include mobile viewport scenarios for performance-sensitive flows.

### PWA/service worker cache boundary

PWA behavior introduces a service worker cache layer. The cache may serve stale content
or cause confusion about what data is current. The stress plan must include a
PWA/service worker cache boundary scenario that verifies the app behaves correctly
after cache clearing or hard reload.

---

## Test data design

The following test data sets are defined for Phase 20C stress testing.

### Small library set

- 10–20 cards.
- Simple text front/back content.
- No FSRS metadata.
- Exported as JSON.
- Expected localStorage size: well under 500 KB.

### Medium library set

- 50–100 cards.
- Mixed text content with some longer fields.
- May include review schedule metadata.
- Exported as JSON and CSV.
- Expected localStorage size: under 1 MB.

### Large library set

- 200–500 cards.
- Rich text content, longer fields.
- Full review schedule metadata and FSRS metadata if applicable.
- Exported as JSON.
- Expected localStorage size: 1–5 MB depending on content richness.
- This set approaches realistic quota-risk territory.

### Generated/duplicate data rule

Use generated or duplicate test data for all stress testing. Do not use irreplaceable
study data without backup. All stress test data sets must be generated synthetically
or duplicated from non-critical sources.

---

## Measurement approach

Phase 20C stress testing uses subjective manual measurement only. No automated
performance instrumentation is added.

### Subjective responsiveness

Testers report whether each operation feels immediate, slightly delayed, noticeably slow,
or unacceptably slow. This is a subjective 4-point scale: immediate / slight delay /
noticeable / unacceptable.

### Visible delay

Testers report any visible loading spinner, blank flash, or layout shift that occurs
during performance-sensitive operations. A visible delay is defined as any perceptible
moment where the UI is not immediately responsive to user input.

### Browser console errors

Testers check the browser developer console for errors during stress test scenarios.
Console errors must be recorded as potential failure signals.

### Import success/failure

Testers verify that each import operation either completes successfully (correct card
count, correct content) or fails with a clear error message. Partial imports or silent
failures are stop conditions.

### Import warnings

Testers verify that large import warnings appear at the correct threshold and are
clearly readable. Missing or incorrect warnings are stop conditions.

### Backup file creation

Testers verify that backup file creation produces a readable, complete JSON file.
Backup files must be openable in a text editor and must contain the expected card count.

### Restore success/failure

Testers verify that restore operations complete successfully with the correct card count
and review schedule state. Restore failures or incorrect post-restore state are stop
conditions.

### Item count after restore

Testers verify the item count displayed by the app after a restore matches the expected
count from the backup. Mismatches are stop conditions.

### Review schedule count after restore

Testers verify that the due-card count and review schedule state after a restore match
the expected state from the backup. Mismatches are stop conditions.

### Quota warning visibility

Testers verify that the storage quota warning appears when expected and is clearly
visible. Missing or unclear quota warnings for risky import sizes are stop conditions.

### Mobile layout usability

Testers verify that the mobile layout is usable for performance-sensitive flows (large
library startup, large import, backup/restore). Unreadable or broken layouts are stop
conditions.

### PWA/cache confusion

Testers verify that PWA/service worker caching does not cause visible confusion (stale
data display, incorrect card counts). PWA/cache confusion is a stop condition.

### Tester confidence before risky actions

Testers self-report their confidence level (1–5 scale) before each risky action
(large import, restore, manual transfer). Low confidence before a risky action is a
signal for copy review in Phase 20D.

---

## Safety and privacy boundaries

The following safety and privacy boundaries apply to all Phase 20C stress-testing
activity.

- Use generated or duplicate test data. Do not use irreplaceable study data without
  backup. All stress test data sets must be synthetic or duplicate.

- Do not use irreplaceable study data without backup. If a tester's primary study
  library is the only copy, make a backup before any stress test operation.

- Always create a restorable backup before destructive/risky tests. Before any large
  import, restore, or repeated backup/restore rehearsal, create a backup.

- Do not promise data loss cannot happen. localStorage can be cleared by browser events,
  device resets, or storage quota limits. Testers must be informed of this risk.

- Do not collect private study content. Stress test feedback focuses on performance,
  quota, and correctness behaviors, not card content.

- Do not collect telemetry or analytics. Phase 20C does not add telemetry or analytics.
  Measurement is manual and external.

- Do not collect account credentials or cloud credentials. Phase 20C does not involve
  account, authentication, or cloud services.

- Do not test sync because sync is not shipped. Stress testing must not simulate or
  test sync behavior.

- Stop testing if backup/restore results are unclear. If a tester cannot verify item
  count or review schedule state after a restore, stop and record the ambiguity.

- Stop testing if import creates confusing or unsafe data. If an import produces
  incorrect card counts, missing content, or inconsistent review schedules, stop and
  record the failure.

- Stop testing if due cards/review schedules look inconsistent. If the due-card count
  does not match expectations after import, backup, or restore, stop and record the
  inconsistency.

- Stop testing if storage quota warning is unclear or missing for risky import size.
  If a risky import size does not trigger the expected storage quota warning, stop and
  record the absence as a hold-signal for Phase 20D.

---

## Failure thresholds and hold criteria

### Immediate stop conditions

A stress testing operation must stop immediately if any of the following occur:

- An import operation causes data loss or produces an incorrect card count.
- A restore operation fails or produces incorrect post-restore state.
- A backup file is corrupted or unreadable after creation.
- A storage quota limit is hit unexpectedly during normal-sized operations.
- The app becomes non-functional during or after a stress test operation.
- Console errors indicate a critical failure during import, backup, or restore.
- A review schedule or due-card count is incorrect after import or restore.

### Phase 20D hold signals

The following patterns should trigger a Phase 20D hold recommendation:

- App startup is unacceptably slow (subjective scale: unacceptable) with a large library
  on any tested browser/device.
- Large import warning is missing or unclear for any dataset exceeding the defined quota
  warning threshold.
- Backup/restore rehearsal produces incorrect item counts or review schedule state on
  any attempt.
- Mobile layout is unusable for any performance-sensitive flow.
- PWA/service worker cache causes incorrect data display on any tested scenario.
- Review schedule due-count accuracy fails after import, backup, or restore.
- EduGen draft review import boundary allows unreviewed content to enter the library.

---

## Phase 20D evidence handoff

At the conclusion of Phase 20C stress testing, prepare a Phase 20D evidence summary:

- List of stress test scenarios completed.
- Subjective responsiveness ratings for each scenario.
- List of any visible delays, console errors, or failures observed.
- List of any stop conditions triggered and their resolutions.
- List of any Phase 20D hold signals observed.
- Recommendation: beta-ready, hold for specific issues, or conditional beta with known
  limitations documented.

This evidence handoff document is an external artifact (not app code, not committed to
the repository). It is provided to the Phase 20D decision gate as human-readable notes.

Phase 20D consumes Phase 20A stabilization audit evidence, Phase 20B real user testing
feedback, and Phase 20C stress-test plan results.

Phase 20D is defined as:

`Phase 20D — Release Decision: Local-First Hybrid Beta-Ready or Hold`

Scope:

- docs/static-validator/CI-only decision gate
- consumes Phase 20A stabilization audit, Phase 20B feedback plan, Phase 20C
  stress-test plan, and Phase 20C measurement results
- decides beta-ready or hold
- no runtime by default
- must include version/name claim cleanup, including removal or replacement of
  misleading beta-ai naming before any public beta claim
- Phase 20D should gate the beta-ai naming decision

Phase 20D is the final gate before any broader beta announcement. Phase 20D decides
beta-ready or hold based on Phase 20A–20C evidence.

---

## Version naming note

The version string v2.0.0-beta-ai.1 is potentially misleading.

The substring beta-ai can imply built-in AI capability. The project must not publicly
imply built-in AI, AI API integration, OCR, or automated AI quiz generation.

Before any public beta/RC claim, version/name strings should be changed to a non-AI
name such as `v2.0.0-beta.1` or a later approved equivalent.

Phase 20D should decide or gate this naming cleanup. Do not change package files in
Phase 20C.

---

## What Phase 20C explicitly does not implement

Phase 20C does not implement any of the following. This list is stated so that the Phase
20C static validator and future static validators can cite it.

- Phase 20C does not implement sync runtime.
- Phase 20C does not implement runtime stress fixtures.
- Phase 20C does not implement performance instrumentation runtime.
- Phase 20C does not implement telemetry.
- Phase 20C does not implement analytics.
- Phase 20C does not implement user testing runtime.
- Phase 20C does not implement conflict resolver runtime.
- Phase 20C does not implement event log runtime.
- Phase 20C does not implement tombstone runtime.
- Phase 20C does not implement device identity runtime.
- Phase 20C does not implement account/auth/identity.
- Phase 20C does not implement a Shime-hosted backend.
- Phase 20C does not implement a remote endpoint.
- Phase 20C does not implement cloud sync.
- Phase 20C does not implement file-based sync.
- Phase 20C does not implement dual-write between backends.
- Phase 20C does not implement an app-boot migration.
- Phase 20C does not implement a production storage backend switch.
- Phase 20C does not implement a production IndexedDBAdapter.
- Phase 20C does not implement a runtime migration.
- Phase 20C does not delete localStorage entries.
- Phase 20C does not change backup/export/restore behavior.
- Phase 20C does not change FSRS behavior.
- Phase 20C does not change the active FSRS double-gate.
- Phase 20C does not ship public FSRS opt-in.
- Phase 20C does not change user-facing production UI copy.
- Phase 20C does not add production tests.
- Phase 20C does not add dependencies.
- Phase 20C does not add UI.
- Phase 20C does not add a settings sync toggle.
- Phase 20C does not change import parser behavior.
- Phase 20C does not implement storage backend switch.
- Phase 20C does not collect user data.
- Phase 20C does not collect tester identity in app code.
- Phase 20C does not implement migration runtime.
- Phase 20C does not unlock sync implementation in any subsequent phase by its own
  existence; each subsequent phase must clear its own gate.

---

## Forbidden positive claims

The following positive claims are forbidden after Phase 20C. They must not appear in
any Phase 20C doc outside an explicitly labelled forbidden-claim section.

- stress testing has completed
- local-first hybrid beta is ready
- sync exists
- cloud sync exists
- account/auth/backend exists
- production sync is ready
- storage migration is complete
- production IndexedDB storage exists
- backup/export is adapter-aware
- restore is adapter-aware
- data-loss prevention is guaranteed
- encrypted end-to-end
- zero-knowledge
- sync just works
- no conflicts
- FSRS sync is available
- review schedules sync automatically
- built-in AI exists
- AI quiz generation exists
- OCR exists
- beta-ai is acceptable for public release

---

## Acceptance criteria

Phase 20C is complete when all of the following hold:

- This ADR (`docs/adr/phase20c-performance-quota-import-stress-test-plan.md`) is present
  and includes all required headings and decision terms.
- The Phase 20C stress-test plan
  (`docs/testing/phase20c-performance-quota-import-stress-test-plan.md`) is present and
  includes all required headings.
- The Phase 20C static validator
  (`scripts/validate-phase20c-performance-quota-import-stress-test-plan.js`) is present,
  registered in `.github/workflows/e2e-smoke.yml` after the Phase 20B validator, and passes.
- The full validator chain passes with `FINAL_STATUS=0`.
- No `src/` files changed.
- No `tests/` files changed.
- No `e2e/` files changed.
- `package.json` unchanged.
- `package-lock.json` unchanged.
- No FSRS runtime files changed.
- No storage/migration runtime files changed.
- No backup/export/restore runtime files changed.
- No dependencies added.
- No UI added.
- No sync runtime added.
- No account/auth/backend added.
- No remote endpoint added.
- No telemetry added.
- No analytics added.
- No runtime stress fixtures added.
- No user data collected.
- Backup/export/restore behavior unchanged.
- FSRS behavior unchanged.
- localStorage remains the canonical production source of truth.
- No forbidden positive claims appear outside explicitly labelled forbidden-claim
  sections.
- Historical validator forward-compat entries are restricted to exact Phase 20C paths
  only (no broad allowlists).
- Artifacts created: patch, ZIP, handoff.
