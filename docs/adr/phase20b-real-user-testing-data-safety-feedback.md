# Phase 20B — Real User Testing / Data Safety Feedback Plan

## Purpose

Phase 20B is a docs/static-validator/CI-only real user testing and data safety feedback
planning gate for Shime Quiz / ShimeChamhoc v2. It does not implement sync. It does not
implement any runtime. It does not implement UI. It does not add tests. It does not change
storage behavior, FSRS behavior, backup/export/restore behavior, package files, or
dependencies.

Phase 20B is a plan-only gate. Its only job is to define the real user testing plan and
data safety feedback plan that will guide Phase 20C and Phase 20D. This phase must not
recruit users inside the app, collect telemetry, implement analytics, add user accounts,
or store tester identity in app code.

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B is docs/static-validator/CI-only. Phase 20B is a stabilization audit gate only.
Phase 20B does not implement user testing runtime. Phase 20B does not collect telemetry.
Phase 20B does not add analytics. Phase 20B does not add user accounts. Phase 20B does not
store tester identity in app code. Phase 20B does not add UI. Phase 20B does not add tests.
Phase 20B does not implement sync runtime. Phase 20B does not implement storage backend
switch. Phase 20B does not implement migration runtime. localStorage remains canonical
production storage. Backup/export/restore behavior remains unchanged. Manual transfer
remains a user-controlled action. Sync remains unshipped. Beta readiness remains gated
by Phase 20C and Phase 20D.

---

## Relationship to Phase 20A

Phase 20A established:

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A confirmed that the local-first production baseline is stable for beta discussion,
defined the safety invariants that must remain active throughout all future phases, and
specified the Phase 20B–20D scopes. Phase 20A did not claim beta readiness; beta readiness
remains gated by Phase 20B–20D.

Phase 20B inherits all Phase 20A safety invariants unchanged:

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

Phase 20B also inherits the Phase 19 local-first/sync/trust guardrails:

- Phase 19B: HYBRID_STAGED_APPROACH selected; no sync runtime implemented; localStorage
  remains canonical.
- Phase 19C: EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK adopted in docs only; backup-before-merge
  elevated to a static-validator invariant; no conflict resolver runtime.
- Phase 19D: Vietnamese-first trust copy and English companion in docs; allowed/forbidden
  claim boundary defined; no runtime.

None of these constraints are relaxed by Phase 20B. Phase 20B is a docs/static-validator/
CI-only phase and does not unlock any runtime implementation.

---

## Current production baseline

The following statements describe the current production state as of Phase 20B. None of
these are changed by Phase 20B.

- Phase 20B is docs/static-validator/CI-only.
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

---

## Testing decision

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B selects PLAN_ONLY_NO_DATA_COLLECTION.

This decision means:

- Phase 20B translates the Phase 17–20A evidence base into a concrete user testing plan.
- Phase 20B defines data safety feedback principles to protect testers and their data.
- Phase 20B does not implement user testing runtime.
- Phase 20B does not collect telemetry.
- Phase 20B does not add analytics.
- Phase 20B does not add user accounts.
- Phase 20B does not store tester identity in app code.
- Phase 20B does not add UI.
- Phase 20B does not add tests.
- Phase 20B does not implement sync runtime.
- Phase 20B does not implement storage backend switch.
- Phase 20B does not implement migration runtime.
- localStorage remains canonical production storage.
- Backup/export/restore behavior remains unchanged.
- Manual transfer remains a user-controlled action.
- Sync remains unshipped.
- Beta readiness remains gated by Phase 20C and Phase 20D.

Real user testing under this plan is conducted externally by a small trusted group of
testers, guided by the Phase 20B testing plan doc. No automated testing infrastructure
is added. No in-app recruitment mechanism is added. Tester feedback is collected via
external channels (manual notes, chat, email) and not stored in app code.

---

## What "real user testing" means in Phase 20B

"Real user testing" in Phase 20B means:

- A small trusted group of testers exercises the app under guided scenarios.
- Testers use the app in its current production state, which is localStorage-only,
  with no sync, no account, no cloud backend.
- Testers are guided by the Phase 20B testing plan document.
- Feedback is collected via manual external channels (notes, chat, email, voice call).
- Testing is observational and exploratory, not automated.
- Testers are trusted volunteers or close team members who understand the beta context.

"Real user testing" in Phase 20B does NOT mean:

- Public beta launch.
- App store release.
- In-app user recruitment.
- Automated feedback collection.
- Telemetry or analytics.
- User account creation.
- Any form of sync.
- Any form of cloud backend.
- Large-scale user study.
- Production storage changes to support testing.
- Storage migration triggered by testing.

---

## What Phase 20B does not collect

Phase 20B does not collect any of the following:

- Telemetry or usage analytics.
- Anonymous or identified user behavior data.
- In-app feedback submissions.
- Account credentials.
- Cloud credentials.
- Sync credentials.
- Device identifiers.
- Tester identity inside app code.
- Study card content from testers.
- Review schedule data from testers.
- FSRS metadata from testers.
- Backup files from testers (unless voluntarily shared by tester for debugging).
- localStorage contents from testers (unless voluntarily shared by tester for debugging).

Any debugging data shared voluntarily by a tester is handled manually and is not stored
in app code, not committed to the repository, and not included in any app bundle.

---

## Data safety principles

The following data safety principles apply to all Phase 20B testing activity:

1. Use duplicate/test data when possible. Testers should prefer synthetic or duplicate
   study libraries over their primary real study data. This reduces the risk of data loss
   or confusion affecting irreplaceable content.

2. Ask testers to make a backup before risky testing. Before any import, restore, or
   large-data operation, testers should be explicitly reminded to export a backup first.

3. Do not ask testers to use irreplaceable study data without backup. If a tester's
   primary study library is the only copy of their data, they must make a backup before
   any risky operation. Do not proceed if backup has not been made.

4. Do not promise that data loss cannot happen. Shime stores data in localStorage which
   can be cleared by browser events, device resets, or storage quota limits. Testers
   must be informed of this risk clearly.

5. Do not ask testers to share private study content unless they choose to. Tester
   feedback should focus on behaviors and flows, not card content.

6. Do not collect sensitive personal information. Phase 20B does not collect names,
   emails, addresses, phone numbers, or any other personal identifying information
   inside app code.

7. Do not collect account credentials. Phase 20B does not collect passwords, tokens,
   API keys, or any form of authentication credential.

8. Do not collect cloud credentials. Phase 20B does not collect cloud storage keys,
   service tokens, or remote access credentials.

9. Do not ask testers to test sync because sync is not shipped. Testers must be
   clearly informed that sync does not exist. If a tester believes sync is available,
   stop and correct that misunderstanding before continuing.

10. Stop testing if backup/restore behavior is unclear. If a tester cannot clearly
    distinguish backup from sync, or does not understand that restore may overwrite
    current data, stop testing on that scenario and record the confusion as feedback.

11. Stop testing if the tester believes Shime is cloud-backed. If a tester believes
    their data is stored in the cloud, stop testing and correct that misunderstanding.
    This is a critical trust violation boundary.

12. Stop testing if due dates/review schedules appear confusing or unsafe. If a tester
    is confused about whether review schedules are preserved correctly, stop testing
    on FSRS/review scenarios and record the confusion.

---

## Tester profile and recruitment boundaries

### Who should test

Phase 20B testing is appropriate for:

- Trusted team members or close collaborators who understand this is a beta product.
- Testers who are comfortable with the concept of localStorage-only data storage.
- Testers who can be explicitly briefed on the no-sync, no-cloud baseline.
- Testers who can follow the pre-test safety checklist.
- Testers who can give qualitative feedback about flows, copy, and trust signals.

### Who should not test yet

Phase 20B testing is not appropriate for:

- General public users who expect production stability guarantees.
- Users with irreplaceable study libraries who have not made a backup.
- Users who have been told sync or cloud backup is available.
- Users who expect multi-device sync to work.
- Users who have not been briefed on the beta nature of the product.

### Recruitment boundaries

- Do not recruit testers via in-app UI. Phase 20B does not add UI.
- Do not recruit testers via app store listings.
- Do not promise testers that their data is backed up automatically.
- Do not promise testers that data loss cannot happen.
- Do not store tester contact information or identity in app code.
- Do not offer testers cloud sync as an incentive. Sync does not exist.

---

## Test scenarios

The following test scenario categories must be covered in Phase 20B testing sessions.
Detailed scenario steps are in the Phase 20B testing plan document.

### First-run onboarding

Observe how a new user experiences the app for the first time. Does the first-run
onboarding make clear that data is local-only? Does the trust copy land correctly?
Does the tester understand there is no account required?

### Create/import small library

Observe the tester creating a small study library or importing a small existing library.
Does the import flow feel safe? Does the tester understand where the data goes after import?

### Import larger library

Observe the tester importing a larger library (50+ cards). Does a storage quota warning
appear if appropriate? Does the import complete correctly? Does the tester feel confident
about the result?

### Study session

Observe the tester running a normal study session. Does the scheduler feel correct? Does
the review schedule / due cards display make sense? Is the session flow clear?

### Review schedule / due cards

Observe how the tester interprets the due card count and review schedule. Does it feel
trustworthy? Does the tester understand what "due" means? Is the FSRS/default boundary
understandable?

### Backup before risky action

Observe the tester making a backup before a risky operation (import, restore, large
data change). Does the backup flow feel safe? Does the tester understand the backup
is not sync?

### Restore from backup

Observe the tester restoring from a backup. Does the restore warning land correctly?
Does the tester understand restore may overwrite current data? Does the restore complete
correctly?

### Manual export/import transfer

Observe the tester exporting data on one device and importing it on another (or
simulating cross-device transfer). Does the manual transfer flow feel understandable?
Does the tester know this is not sync?

### FSRS experimental/off/default boundary

Observe the tester's understanding of the FSRS experimental status. Does the tester
understand FSRS is experimental and not public opt-in? Does the FSRS/default boundary
feel clear? Does any FSRS copy imply sync?

### EduGen draft review/import boundary

Observe the tester using EduGen draft review and import. Does the draft/import boundary
feel clear? Does the tester understand generated content requires review before import?

### Mobile/PWA basic usage

Observe the tester using the app on a mobile device or as a PWA. Does the mobile flow
feel stable? Does the app behave correctly for basic study and backup operations?

### Storage quota or large import warning

Observe whether a storage quota or large import warning appears correctly when appropriate.
Does the warning feel informative? Does the tester understand the implication?

### Vietnamese trust copy comprehension

Observe the tester reading Vietnamese-first trust copy. Does the Vietnamese copy land
clearly? Does the tester understand the no-cloud/default-off message? Is there any
confusion about the Vietnamese text?

### User confusion around sync/cloud/account claims

Observe whether any copy, UI element, or flow causes the tester to believe sync, cloud
backup, or account features exist. Record any confusion immediately. Stop the test if
the tester believes Shime is cloud-backed.

---

## Feedback questions

The following feedback questions must be asked of testers after each session. They are
designed to surface trust signal failures and data safety confusion.

### Data and storage understanding

- Did the tester understand data is local? Did the tester know that their data lives on
  this device and is not stored on a Shime server?
- Did the tester understand there is no cloud sync today? Was it clear that Shime does
  not automatically back up or sync data to a cloud service?
- Did the tester understand backup is not sync? Did the tester know that a backup file
  is a manual snapshot, not an automatic sync operation?
- Did the tester understand restore may overwrite current data? Did the tester know that
  a restore operation replaces current local state?

### Safety and confidence

- Did the tester feel safe before import/restore? Did the tester feel they understood
  the consequences of the action before proceeding?
- Did the tester know what to do before risky actions? Did the tester spontaneously
  make a backup before risky operations, or did they need to be prompted?
- Did any action feel like it could lose data? Was there any moment where the tester
  felt uncertain about whether their data was safe?

### Trust copy and clarity

- Did manual transfer feel understandable? Did the tester understand the export/import
  transfer flow and that it is manual, not automatic?
- Did any copy imply account/cloud/sync? Were there any words or phrases in the UI or
  docs that suggested sync, cloud backup, or account features exist?
- Did review schedules or FSRS copy feel confusing? Did the scheduler or due-card
  copy feel trustworthy? Did any FSRS copy suggest sync?
- Did Vietnamese-first trust copy feel clear? Did the Vietnamese trust copy land
  correctly? Was the language natural and unambiguous?

---

## Backup and restore safety checklist

Before any tester performs a restore or large import operation, confirm:

- [ ] Tester has been briefed that restore may overwrite current data.
- [ ] Tester has been briefed that backup is not sync.
- [ ] Tester has made a backup export before the operation, or has confirmed they are
      using test/duplicate data and accept the risk.
- [ ] Tester understands the backup file is a point-in-time snapshot, not a live copy.
- [ ] Tester understands the restore will replace current local state.
- [ ] Tester has been told not to restore if they have unsaved changes they want to keep.

If any checklist item cannot be confirmed, do not proceed with the restore or large import.
Record the inability to confirm as feedback on the clarity of the backup/restore flow.

---

## Manual transfer safety checklist

Before any tester performs a manual export/import transfer operation, confirm:

- [ ] Tester has been briefed that manual transfer is not sync.
- [ ] Tester has been briefed that after transfer, the two devices have separate copies
      that do not automatically stay in sync.
- [ ] Tester understands that if they edit data on both devices after a transfer, the
      copies will diverge and Shime cannot automatically merge them.
- [ ] Tester has made a backup before the transfer if using real study data.
- [ ] Tester understands the transfer is their responsibility to initiate and complete.

If any checklist item cannot be confirmed, stop and record the confusion as feedback on
the clarity of the manual transfer flow.

---

## FSRS and review schedule feedback boundaries

When observing FSRS and review schedule scenarios, the following boundaries apply:

- Do not imply that FSRS is publicly available. FSRS is experimental and not public opt-in.
- Do not imply that FSRS data syncs between devices. FSRS/review schedule data must not
  silently merge.
- Do not ask testers to test FSRS sync because FSRS sync is not shipped.
- If a tester believes their review schedule syncs automatically, stop and correct that
  misunderstanding. Record the confusion.
- Do not promise testers that FSRS review schedules are preserved across devices. Manual
  transfer is the only cross-device path, and it is user-controlled.
- If a tester finds the FSRS/default scheduler boundary confusing, record this as a
  feedback item for Phase 20C/20D copy review.

---

## Failure and escalation criteria

Testing must stop and be escalated if any of the following occur:

### Immediate stop conditions

- A tester loses real study data during a testing operation.
- A tester experiences a restore that overwrites data they did not intend to overwrite.
- A tester cannot recover their data after a restore or import operation.
- An import operation causes the app to become non-functional.
- A storage quota limit is hit unexpectedly during normal operation.
- A tester believes Shime is cloud-backed and cannot be corrected.
- A tester believes sync exists and cannot be corrected.
- A tester's backup cannot be restored (indicating a backup format regression).

### Escalation to Phase 20D hold

The following feedback patterns should trigger a Phase 20D hold recommendation:

- More than one tester confuses backup with sync.
- More than one tester believes data is automatically backed up to the cloud.
- Any tester loses data without a recoverable path.
- Any tester cannot complete a backup/restore cycle successfully.
- Any tester cannot complete a manual transfer successfully.
- Vietnamese trust copy is misunderstood by multiple Vietnamese-speaking testers.
- FSRS copy implies sync to multiple testers.

---

## Privacy and trust copy requirements

### Privacy boundaries

Phase 20B does not collect any personal information inside app code. Tester feedback
is handled via manual external channels and is not stored in app code.

The Vietnamese-first trust copy principles from Phase 19D apply to all Phase 20B
testing materials:

- The Vietnamese trust copy (`docs/trust/no-cloud-default-off.vi.md`) is the primary
  source of truth for all trust-critical user-facing copy.
- The English companion (`docs/trust/no-cloud-default-off.md`) must remain consistent
  with the Vietnamese version.
- Any conflict or ambiguity is resolved by the Vietnamese version.
- Forbidden claims defined in Phase 19D remain forbidden in Phase 20B.

### Required trust copy verification

Before testing begins, verify with each tester:

- The tester has read and understood the no-cloud/default-off trust statement.
- The tester understands data is stored locally on their device.
- The tester understands backup is not sync.
- The tester understands there is no account required and no cloud sync today.
- Vietnamese-speaking testers have read the Vietnamese trust copy first.

---

## Phase 20C scope

Phase 20C is `Phase 20C — Performance / Quota / Import Stress Test Plan`.

Scope:

- docs/static-validator/CI-only by default.
- May become test-only stress fixture only if explicitly approved by a separate gate.
- Plan performance, quota, and import stress testing.
- No sync runtime.
- No production migration.
- No storage backend switch.
- No account/auth/backend.
- No FSRS runtime changes.

Phase 20C should handle performance/quota/import stress test plan. Phase 20C does not
implement sync runtime or storage backend switching. Phase 20C is gated by Phase 20B
completing.

Phase 20C consumes Phase 20B feedback about storage quota warnings and large import
behavior. Phase 20C defines stress test scenarios that may reveal quota or performance
limits not visible in Phase 20B's qualitative testing.

---

## Phase 20D scope

Phase 20D is `Phase 20D — Release Decision: Local-First Hybrid Beta-Ready or Hold`.

Scope:

- docs/static-validator/CI-only decision gate.
- Consumes Phase 20A–20C evidence.
- Decides beta-ready or hold.
- No runtime by default.
- No runtime unless separately scoped and approved by a dedicated gate.

Phase 20D should decide local-first hybrid beta-ready or hold. Phase 20D is gated by
Phase 20B and Phase 20C completing. Phase 20D does not implement runtime unless a
separate explicit gate authorizes it.

Phase 20D consumes:

- Phase 20A stabilization audit evidence.
- Phase 20B real user testing feedback.
- Phase 20C performance/quota/import stress test results.

Phase 20D decides whether the local-first hybrid baseline is ready for a broader beta
announcement, or whether a hold is needed to address issues surfaced in Phase 20B–20C.

---

## What Phase 20B explicitly does not implement

Phase 20B does not implement any of the following. This list is stated so that the Phase
20B static validator and future static validators can cite it.

- Phase 20B does not implement sync runtime.
- Phase 20B does not implement user testing runtime.
- Phase 20B does not implement conflict resolver runtime.
- Phase 20B does not implement event log runtime.
- Phase 20B does not implement tombstone runtime.
- Phase 20B does not implement device identity runtime.
- Phase 20B does not implement account/auth/identity.
- Phase 20B does not implement a Shime-hosted backend.
- Phase 20B does not implement a remote endpoint.
- Phase 20B does not implement cloud sync.
- Phase 20B does not implement file-based sync.
- Phase 20B does not implement dual-write between backends.
- Phase 20B does not implement an app-boot migration.
- Phase 20B does not implement a production storage backend switch.
- Phase 20B does not implement a production IndexedDBAdapter.
- Phase 20B does not implement a runtime migration.
- Phase 20B does not delete localStorage entries.
- Phase 20B does not change backup/export/restore behavior.
- Phase 20B does not change FSRS behavior.
- Phase 20B does not change the active FSRS double-gate.
- Phase 20B does not ship public FSRS opt-in.
- Phase 20B does not change user-facing production UI copy.
- Phase 20B does not add tests of production behavior.
- Phase 20B does not add dependencies.
- Phase 20B does not add UI.
- Phase 20B does not add a settings sync toggle.
- Phase 20B does not collect telemetry.
- Phase 20B does not add analytics.
- Phase 20B does not add user accounts.
- Phase 20B does not store tester identity in app code.
- Phase 20B does not implement storage backend switch.
- Phase 20B does not implement migration runtime.
- Phase 20B does not unlock sync implementation in any subsequent phase by its own
  existence; each subsequent phase must clear its own gate.

---

## Acceptance criteria

Phase 20B is complete when all of the following hold:

- This ADR (`docs/adr/phase20b-real-user-testing-data-safety-feedback.md`) is present and
  includes all required headings and decision terms.
- The Phase 20B testing plan (`docs/testing/phase20b-real-user-testing-plan.md`) is present
  and includes all required headings.
- The Phase 20B static validator
  (`scripts/validate-phase20b-real-user-testing-data-safety-feedback.js`) is present,
  registered in `.github/workflows/e2e-smoke.yml` after the Phase 20A validator, and passes.
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
- No user accounts added.
- No tester identity stored in app code.
- Backup/export/restore behavior unchanged.
- FSRS behavior unchanged.
- localStorage remains the canonical production source of truth.
- No forbidden positive claims appear outside explicitly labelled forbidden-claim sections.
- Historical validator forward-compat entries are restricted to exact Phase 20B paths only
  (no broad allowlists).
- Artifacts created: patch, ZIP, handoff.
