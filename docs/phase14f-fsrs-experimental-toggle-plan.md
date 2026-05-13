# Phase 14F - FSRS Experimental Toggle Plan

## Scope

Phase 14F is docs/static-validator/CI only. It locks the future FSRS experimental toggle, settings schema, new-card definition, enrollment timing, rollback, and phase-split policy before any settings storage, visible toggle, Study Room rating UI, Dashboard mixed scheduler support, production adapter route, or enrollment runtime begins.

Phase 14F does not change runtime behavior. It does not change UI, package files, dependencies, source files, tests, storage schema, backup/import/export runtime, Study Room behavior, Dashboard behavior, scoring, mastery, weighted practice, recommendation, or scheduler runtime behavior.

Phase 14F does not create a settings storage key. It does not create `shimeV2SettingsV1`. It does not read or write `fsrsExperimentalEnabled`. It does not add a visible FSRS toggle. It does not add new-card enrollment runtime. It does not add a production FSRS route. It does not add Again/Hard/Good/Easy Study Room controls.

## Foundation

Phase 14A added the scheduler adapter boundary while keeping the current SM-2-like heuristic scheduler as production behavior. Phase 14B added exact-pinned `ts-fsrs` and an internal/test-only FSRS wrapper. Phase 14C added FSRS-shaped persistence preservation and backup compatibility harness coverage. Phase 14D added developer/test-only adapter routing behind `context.enableFsrsTestRoute === true`. Phase 14E locked Two-Step Evaluation: objective correctness and subjective memory rating are separate signals, wrong/unanswered future FSRS reviews auto-lock to Again, and correct future FSRS reviews may use Hard/Good/Easy only.

Phase 14F builds on those decisions but does not implement user-facing FSRS. It only defines the future toggle and enrollment policy that later runtime phases must follow.

## Toggle Scope

The future FSRS toggle should be global, experimental, and default OFF.

A global toggle is chosen over per-quiz or per-card toggles for the first user-facing iteration. Per-quiz and per-card controls would fragment scheduler state, make mixed study sessions harder to explain, and increase the chance of partial FSRS records before Study Room and Dashboard are ready. A single global experimental switch is easier to reason about, easier to disable, and safer for local-first rollback.

The future toggle must be labeled experimental until the full user-facing path is implemented and tested. Phase 14F does not add that toggle to any UI.

## Settings Schema Documented Only

A later phase may introduce a settings envelope similar to:

```json
{
  "schemaVersion": "shime-v2-settings-v1",
  "fsrsExperimentalEnabled": false,
  "fsrsEnrollmentMode": "new-cards-only"
}
```

The future storage key would be `shimeV2SettingsV1`. The future `fsrsExperimentalEnabled` default is `false`. The future `fsrsEnrollmentMode` value is locked to `"new-cards-only"` for the initial FSRS rollout.

This schema is documentation only in Phase 14F. No `shimeV2SettingsV1` key is created. No settings read/write helper is added. No runtime file reads or writes `fsrsExperimentalEnabled`. Backup/import/export support for this settings envelope is deferred to a later phase.

## New-Card Definition

For future FSRS enrollment, a new card means one of these conditions is true:

- There is no existing review schedule record for the item in `shimeV2ReviewScheduleV1`.
- A review schedule record exists, but `lastReviewedAt` is absent, null, or undefined.

Existing cards with due/review history remain on the current SM-2-like heuristic scheduler. A card with a meaningful `dueAt`, `lastReviewedAt`, `repetitionCount`, `correctStreak`, or `wrongCount` must not be automatically enrolled into FSRS merely because the toggle is ON.

Records with missing `schedulerKind` remain current scheduler records by read-time defaulting. Phase 14F does not backfill `schedulerKind`, `schedulerVersion`, `fsrsPayload`, or `fsrsReviewLogs` onto any existing record.

## Enrollment Timing

Future new-card enrollment must happen at first completed review of an eligible new card, not at import, not at item creation, and not at study session start.

Import/create/session-start enrollment would create scheduler state before a real review event exists. It would also risk orphan records: records marked as FSRS before the Study Room has the Two-Step Evaluation UI required to produce valid FSRS ratings.

Phase 14F does not implement enrollment timing. It only locks the rule that any later enrollment runtime must evaluate eligibility at the completed-review boundary.

## Orphan-Record Prevention

An orphan FSRS record is a record marked with an FSRS scheduler kind before the app can complete a valid FSRS review flow. The critical orphan-record risk is enrolling new FSRS cards while Study Room does not yet have Two-Step Evaluation.

Phase 14F prevents orphan records by adding no runtime enrollment and no settings toggle. Later phases must preserve this invariant:

**No runtime new-card enrollment before valid Study Room Two-Step FSRS rating UI exists.**

Developer/test-only Phase 14D routing does not satisfy this requirement because it maps binary outcomes for tests only. Production FSRS enrollment needs the Phase 14E rating policy: wrong/unanswered auto-locks to Again, while correct answers can choose Hard/Good/Easy.

## Existing Record And Migration Policy

Existing SM-2-like heuristic cards must never be automatically migrated by a toggle. The future toggle state must not rewrite existing schedule records, fabricate review logs, or infer FSRS difficulty/stability/retrievability from SM-2-like fields.

The current `easeFactor` and FSRS `difficulty` are different mathematical states, not a simple conversion. Binary correct/wrong history and aggregate schedule fields cannot reconstruct reliable FSRS review logs. Any future migration seed strategy must be a separate approved phase with its own risk register, rollback plan, tests, and backup/import/export validation.

## Disable And Rollback Policy

Future disable/rollback behavior must be preservation-first and non-destructive:

- Disabling FSRS stops future new enrollment.
- Disabling FSRS must not delete `fsrsPayload`.
- Disabling FSRS must not delete `fsrsReviewLogs`.
- Disabling FSRS must not convert existing FSRS cards back to SM-2 automatically.
- Any future routing behavior for already-enrolled FSRS cards while disabled must be separately implemented and tested.

The safe policy is to preserve already-written FSRS data and avoid destructive conversion. If a later runtime phase chooses to route existing FSRS cards through current SM-2-like scheduling while disabled, that behavior must be explicit, tested, and reversible.

## Backup Import Export Policy

Phase 14F does not update backup/import/export runtime behavior. It does not add settings to `v2BackupRestore.js`.

Backup/import/export support for `shimeV2SettingsV1` is deferred until a later phase owns settings persistence and can test round-trip behavior. Until that phase lands, Shime must not claim that backup/import/export supports a user-facing FSRS settings toggle.

## Future Phase Split

The following split supersedes earlier broad Phase 14F ideas. Labels can change, but the safety boundaries are binding:

- Phase 14G: settings storage schema scaffold only. Add the `shimeV2SettingsV1` storage envelope and tests. No visible UI toggle, no adapter route change, no enrollment runtime, no Study Room change, and no Dashboard change.
- Phase 14H: visible experimental settings UX/copy only. Keep default OFF. Do not enable enrollment unless the project explicitly pairs the change with the completed Study Room Two-Step UI gate.
- Phase 14I: Study Room Two-Step FSRS rating UI. Implement the split answer/rating flow for FSRS-kind cards: wrong/unanswered auto-locks to Again, and correct answers can select Hard/Good/Easy.
- Phase 14J: guarded new-card enrollment and production adapter route. This phase may run only after the Two-Step UI exists and must preserve the new-card-only and rollback rules.
- Phase 14K: Dashboard mixed scheduler due-count and/or backup/import claim hardening for settings and user-facing FSRS records.
- Phase 14L or closure: Phase 14 closure and Phase 15 readiness assessment.

No future phase should merge settings storage, visible toggle UI, Study Room rating UI, production enrollment, Dashboard behavior, migration, and backup claims all at once.

## Claim Boundaries

After Phase 14F, the project may claim:

- The global experimental FSRS toggle plan is documented.
- The future toggle is planned as default OFF.
- The future settings schema shape is documented only.
- The new-card definition and first-completed-review enrollment timing are documented.
- The no-orphan-record rule is documented.
- Disable/rollback is documented as preservation-first and non-destructive.
- A static validator guards the Phase 14F docs/static-validator/CI scope.

After Phase 14F, the project must not claim:

- The FSRS toggle exists or is visible to users, because it is not implemented.
- Settings storage `shimeV2SettingsV1` exists, because it is not created in Phase 14F.
- New-card enrollment is active, because the runtime is not implemented.
- Study Room supports Two-Step Evaluation UI, because it is not implemented.
- Dashboard supports mixed scheduler due counts, because it is not implemented.
- Backup/import/export supports FSRS settings, because backup/import/export runtime is not changed.
- Production FSRS scheduling is enabled, because no user-facing production route exists.
- Existing SM-2 records are migrated, because automatic migration remains prohibited.
- Glicko, IRT, AI, semantic search, sync, cloud accounts, IndexedDB migration, encryption, OCR, or production/security/accessibility/performance certification exists because none of those claims are implemented by Phase 14F.

## Phase 14F Checklist

- Decision document added.
- Static validator added.
- CI workflow registers the validator.
- No runtime files changed.
- No UI files changed.
- No package or dependency files changed.
- No source or test files changed.
- No settings storage key created.
- No visible FSRS toggle added.
- No new-card enrollment runtime added.
- No storage, backup/import/export, scoring, mastery, weighted practice, recommendation, or scheduler runtime behavior changed.
