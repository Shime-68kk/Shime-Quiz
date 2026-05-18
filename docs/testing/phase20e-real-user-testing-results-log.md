# Phase 20E — Real User Testing Results Log

## Purpose

This document is the Phase 20E real user testing results log. It provides a
structured template for recording executed real user testing sessions for Shime Quiz
/ ShimeChamhoc v2. It does not implement runtime code. It does not collect
telemetry, analytics, or user accounts. It does not modify storage behavior, FSRS
behavior, backup/export/restore behavior, or import behavior.

Phase 20E creates a results log structure. Phase 20E does not claim that testing is
complete unless actual user-provided results are recorded in the session entries
below.

```text
REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
```

This token means the repo now contains a structured results log template and evidence
protocol for real user testing. It does not mean real user testing is complete. Real
user testing is complete only when actual tester-provided results are recorded in the
session entries below.

## Status

```text
REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
```

Sessions recorded: 0 of 5 minimum required.

No tester has completed a session yet. All session entries below are empty templates.
Phase 20G must not reconsider `BETA_READY` until at minimum the evidence requirements
in `docs/release/phase20e-real-user-testing-evidence-protocol.md` are met.

## Relationship to Phase 20B

Phase 20B established:

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B defined the real user testing plan and data safety feedback plan. Phase 20B
did not execute real user testing. Phase 20B did not record results. Phase 20B did
not collect data. Phase 20B is plan-only and cannot substitute for executed evidence.

Phase 20E executes the Phase 20B plan. Phase 20E does not replace the Phase 20B ADR
or plan. Phase 20E adds the first executed results log artifact to the repo. Phase 20E
does not override the Phase 20D HOLD decision. Phase 20E does not claim beta
readiness. Phase 20E creates structure for recording evidence that Phase 20G will
evaluate.

Read Phase 20B artifacts at:
- `docs/adr/phase20b-real-user-testing-data-safety-feedback.md`
- `docs/testing/phase20b-real-user-testing-plan.md`

## Relationship to Phase 20D HOLD

Phase 20D established:

```text
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

Phase 20D held because: real user testing had not been completed; stress-test
evidence had not been executed; and no repo evidence of executed beta-ready signals
existed. Phase 20E does not override the HOLD decision. Phase 20E creates the
artifact that Phase 20D identified as missing. The HOLD remains active until Phase
20G evaluates whether the collected evidence is sufficient.

Read Phase 20D artifacts at:
- `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`
- `docs/release/phase20d-beta-hold-evidence.md`

## Test execution rules

1. Complete the pre-test safety checklist with every tester before starting any
   session. Do not start a session until all checklist items are confirmed.
2. Use the session template below for every recorded session. Do not summarize or
   paraphrase tester feedback — record it faithfully.
3. Do not record private study content from the tester's library.
4. Do not record contact information of any kind.
5. Do not record credentials, passwords, or device identifiers.
6. Do not collect telemetry or analytics. Do not add in-app data collection.
7. Do not ask testers to use irreplaceable study data without a confirmed backup.
   A backup must be created before any risky import, restore, or manual transfer
   testing. Do not skip this step.
8. Testers should use duplicate or synthetic test data where possible. If a tester
   insists on using real data, confirm a fresh backup export exists before proceeding.
9. Stop if tester confuses backup with sync. Clarify before continuing: a backup is a
   manual snapshot, not an automatic sync.
10. Stop if tester believes Shime has cloud sync, account, or backend features.
    Correct the misunderstanding before continuing.
11. Stop if restore overwrite risk is unclear to the tester. Clarify that restore may
    overwrite current data.
12. Stop if tester sees beta-ai or any AI capability implication in any public-facing
    copy shown during the session. Record the exact copy as a hold signal and report
    it.
13. Stop the session if the tester expects built-in AI, OCR, or automated AI quiz
    generation and cannot be easily corrected. Record the expectation as a hold signal.

## Tester privacy rules

- Do not record tester names in this document unless the tester has given explicit
  written consent and the recording serves a clear purpose.
- Do not record any study card content from the tester's library.
- Do not record any login or account credentials.
- Do not record device identifiers, browser fingerprints, or geolocation data.
- Do not upload any tester-identifiable data to any external service.
- No account, no cloud, no backend — Shime does not collect user data. This document
  must not introduce data collection.

## What to record

Record the following for each tester session:

- Session number and approximate date (no time or timezone required)
- Tester profile: general description only (e.g., "Vietnamese-speaking student, first
  time using Shime"; no names or identifiers)
- Device and browser/platform (e.g., "Android Chrome", "iOS Safari", "Desktop Firefox")
- Scenarios completed: list each scenario and whether it completed without issues
- Observed friction: list any UX difficulty, confusion, or unexpected behavior
- Copy comprehension result: did the tester understand local-first / no-cloud / no-sync?
- Vietnamese-first copy result: did Vietnamese-speaking testers understand key trust
  statements?
- FSRS boundary result: did the tester understand FSRS is experimental and not
  publicly opt-in?
- EduGen boundary result: did the tester understand EduGen is manual paste-and-review,
  not a built-in AI feature?
- Backup and restore understanding: did the tester understand backup is not sync?
- Hold signals: list any stop condition triggered, with exact wording observed
- Pass signals: list any positive evidence toward beta readiness criteria
- Tester overall assessment: brief summary of overall session quality

## What not to record

Do not record any of the following in this document:

- Tester names, email addresses, phone numbers, or any identifying information
- Study card content, deck names, or private learning material
- Credentials, passwords, or session tokens
- Telemetry data, analytics events, or usage statistics
- Device serial numbers or unique identifiers
- Any content not directly relevant to the testing observation

## Required pre-test safety checklist

Complete this checklist with every tester before starting any session. All items must
be confirmed. Do not start testing if any item cannot be confirmed.

- [ ] Tester has been told this is a beta product and data safety is not guaranteed.
- [ ] Tester has been told all data is stored locally on their device (localStorage),
      not on any Shime server.
- [ ] Tester has been told there is no cloud sync and no automatic backup.
- [ ] Tester has been told that backup is not sync; a backup is a manual snapshot.
- [ ] Tester has been told that restore may overwrite current data.
- [ ] Tester has been told that manual transfer is not sync.
- [ ] Tester has been told to use test/duplicate data if possible.
- [ ] Tester has made a backup export if using real study data, or has confirmed they
      are using test/duplicate data and accept the risk.
- [ ] Tester has read or been briefed on the Vietnamese-first trust statement (if
      Vietnamese-speaking).
- [ ] Tester understands that FSRS is experimental and not publicly available for
      opt-in.
- [ ] Tester understands that FSRS data does not sync between devices.
- [ ] Tester knows there is no built-in AI, no OCR, and no automated AI quiz
      generation in Shime.
- [ ] Tester knows how to reach the testing coordinator if something goes wrong.

## Tester session template

Copy this template for each new session. Replace `[...]` placeholders with actual
observed results. Leave `[No result yet]` if not applicable or not observed.

```markdown
### Session N — [Approximate date, e.g., 2026-05-18]

**Tester profile:** [General description, no identifying info]
**Device/platform:** [e.g., Android Chrome, iOS Safari, Desktop Firefox]
**Duration:** [Approximate, e.g., 45 minutes]

#### Scenarios completed

- [ ] Onboarding: [Completed / Incomplete / Notes]
- [ ] Create/import small library: [Completed / Incomplete / Notes]
- [ ] Import larger library: [Completed / Incomplete / Notes]
- [ ] Study session: [Completed / Incomplete / Notes]
- [ ] Due cards / review schedule: [Completed / Incomplete / Notes]
- [ ] Backup before risky action: [Completed / Incomplete / Notes]
- [ ] Restore from backup: [Completed / Incomplete / Notes]
- [ ] Manual export/import transfer: [Completed / Incomplete / Notes]
- [ ] Local-first copy comprehension: [Completed / Incomplete / Notes]
- [ ] Vietnamese-first copy comprehension (if applicable): [Completed / Incomplete / Notes]
- [ ] FSRS boundary observation: [Completed / Incomplete / Notes]
- [ ] EduGen Draft Workshop boundary observation: [Completed / Incomplete / Notes]
- [ ] Mobile/PWA basic usage: [Completed / Incomplete / Notes]
- [ ] beta-ai naming absence verification: [Confirmed absent / Issue found / Notes]
- [ ] no-cloud/default-off copy verification: [Confirmed / Issue found / Notes]
- [ ] backup-is-not-sync copy verification: [Confirmed / Issue found / Notes]
- [ ] restore-may-overwrite copy verification: [Confirmed / Issue found / Notes]

#### Observed friction

[List any UX friction, confusion, or unexpected behavior observed during the session.]

#### Copy comprehension result

[Did the tester understand that Shime stores data locally, has no cloud, no sync, no
account, no backend? Record the specific statements the tester made.]

#### Vietnamese-first copy comprehension result

[If tester is Vietnamese-speaking: did key trust statements in Vietnamese read
naturally and accurately? Record any difficulty or mistranslation observed.]

#### FSRS boundary result

[Did the tester understand FSRS is experimental and not publicly opt-in? Did they
understand FSRS data does not sync between devices?]

#### EduGen boundary result

[Did the tester understand EduGen Draft Workshop is a manual paste-and-review boundary
and not a built-in AI or OCR feature?]

#### Backup and restore understanding

[Did the tester understand backup is not sync? Did they understand restore may
overwrite current data? Did they complete the backup before risky action scenario
correctly?]

#### Hold signals

[List any stop condition triggered, with exact copy or behavior observed.]

#### Pass signals

[List any positive evidence toward beta readiness criteria.]

#### Overall assessment

[Brief qualitative summary of the session. Was the session coherent? Would this tester
recommend Shime to another user at this stage?]
```

## Session 1

[No result yet. Session 1 has not been conducted. Record actual tester results here
when the session is complete. Do not invent results.]

## Session 2

[No result yet. Session 2 has not been conducted. Record actual tester results here
when the session is complete. Do not invent results.]

## Session 3

[No result yet. Session 3 has not been conducted. Record actual tester results here
when the session is complete. Do not invent results.]

## Session 4

[No result yet. Session 4 has not been conducted. Record actual tester results here
when the session is complete. Do not invent results.]

## Session 5

[No result yet. Session 5 has not been conducted. Record actual tester results here
when the session is complete. Do not invent results.]

## Evidence summary

Sessions completed: 0 of 5 minimum required.

No evidence has been collected yet. This section must be updated after each session
is recorded. Phase 20G must not evaluate beta readiness until real evidence exists
in this section.

Required evidence before Phase 20G may reconsider HOLD:
- Minimum 3 completed tester sessions recorded with real results
- No unresolved critical hold signals
- No copy implying cloud/sync/account/backend/AI/OCR overclaim
- No `beta-ai` naming observed in any public-facing copy
- Vietnamese-first copy confirmed comprehensible by at least one Vietnamese-speaking
  tester
- Backup-is-not-sync boundary confirmed understood by all testers
- Restore-may-overwrite risk confirmed understood by all testers

## Hold signals

No hold signals recorded yet. Hold signals will be recorded here as sessions are
completed.

A hold signal is any observation that prevents beta readiness claim, including:

- Tester confusion between backup and sync that could not be corrected by copy alone
- Tester belief in cloud sync, account, or backend features
- Tester belief in built-in AI, OCR, or automated AI quiz generation
- `beta-ai` substring observed in any public-facing copy or UI string
- Restore overwrite risk unclear to tester without coordinator explanation
- Critical data safety concern observed during any session
- Vietnamese-first copy misunderstood or misleading to Vietnamese-speaking tester
- FSRS described as production-ready or publicly opt-in

## Pass signals

No pass signals recorded yet. Pass signals will be recorded here as sessions are
completed.

A pass signal is any observation that supports a future beta readiness claim, including:

- Tester completes onboarding without coordinator intervention
- Tester successfully creates, imports, and studies a library
- Tester understands local-first storage without confusion
- Tester understands backup-is-not-sync from copy alone
- Tester understands restore-may-overwrite from copy alone
- Vietnamese-speaking tester reads Vietnamese trust copy without confusion
- Tester does not expect cloud, sync, account, or backend after reading trust copy
- Tester correctly identifies EduGen as a manual draft-review workflow, not AI

## Claim boundaries

Allowed claims after Phase 20E:

- The real-user testing results log structure exists in this repo.
- The evidence protocol exists in `docs/release/phase20e-real-user-testing-evidence-protocol.md`.
- HOLD remains active.
- Beta-ready remains blocked until executed evidence exists.
- `beta-ai` naming cleanup remains required and preserved by Phase 20D.
- No-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 20E:

- Real user testing is complete. (Only allowed after actual user-provided results are
  recorded in the session entries above.)
- Local-first hybrid beta is ready.
- Sync exists.
- Cloud sync exists.
- Account/auth/backend exists.
- Production sync is ready.
- Production IndexedDB storage exists.
- Storage migration is complete.
- Backup/export is adapter-aware.
- Restore is adapter-aware.
- Data-loss prevention is guaranteed.
- Built-in AI exists.
- AI quiz generation exists.
- OCR exists.
- `beta-ai` is acceptable public naming.

## Phase 20F handoff

Phase 20F executes the Phase 20C performance, storage quota, and import stress-test
plan. Phase 20F creates the stress-test results log. Phase 20F does not require Phase
20E sessions to be complete before starting, but Phase 20G must have both Phase 20E
real-user evidence and Phase 20F stress-test evidence before reconsidering HOLD.

Phase 20F read list:
- `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`
- `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`
- `docs/adr/phase20d-hold-decision-beta-ai-naming-cleanup.md`

## Phase 20G handoff

Phase 20G is the beta readiness re-decision gate. Phase 20G must not reconsider
`BETA_READY` until:

1. Real user testing evidence exists (minimum sessions recorded with real results in
   this document).
2. Stress-test evidence exists from Phase 20F.
3. No critical data safety hold signals remain unresolved.
4. `beta-ai` naming remains cleaned and no regression appears.
5. No cloud/sync/account/backend/AI/OCR overclaims appear in any copy, UI string, or
   public document.

Phase 20G cannot be unblocked by this document alone. Phase 20G requires this
document's session entries to be non-empty with real tester-provided results.
