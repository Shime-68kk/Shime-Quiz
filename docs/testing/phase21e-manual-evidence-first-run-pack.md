# Phase 21E — Manual Evidence First Run Pack

## Purpose

Phase 21E creates first-run instructions only. It gives a tester a practical, safe sequence for the first manual evidence session after Phase 21D kept HOLD because filled evidence remained insufficient.

Phase 21E does not execute the first run, does not implement runtime behavior, does not add telemetry or analytics, and does not claim beta readiness.

## Status

```text
MANUAL_EVIDENCE_FIRST_RUN_PACK_STATUS: READY_FOR_FIRST_MANUAL_RUN
MANUAL_EVIDENCE_FIRST_RUN_COMPLETED: NO
```

HOLD remains active until actual filled evidence exists. BETA_READY is not claimed.

## Relationship to Phase 21A

Phase 21A created the broader manual evidence execution run pack. Phase 21E narrows that guidance into a first-run pack that a user or tester can actually follow for one safe initial session.

Phase 21E does not replace Phase 21A with results. It prepares the first manual evidence run without claiming that manual evidence has been executed.

## Relationship to Phase 21D

Phase 21D recorded `LOCAL_FIRST_HYBRID_BETA_FILLED_EVIDENCE_DECISION: HOLD_INSUFFICIENT_FILLED_EVIDENCE` because `REAL_USER_TEST_FILLED_SESSIONS: 0` and `PERFORMANCE_STRESS_FILLED_RUNS: 0`.

Phase 21E responds to that HOLD by preparing fillable first-run instructions. It does not re-decide readiness.

## First-run principle

Use duplicate, generated, or disposable test data. Do not use irreplaceable study data without a backup.

Create a backup before restore, import, repeated backup/restore rehearsal, or manual export/import transfer. Stop if backup/restore behavior is unclear.

## Who should run this

A tester who can use the app like a normal learner may run the first session. The tester should be able to describe local-first storage, backup responsibility, no account/cloud/sync/backend, and Vietnamese-first trust copy without sharing private study content or contact information.

## What data to use

Use generated decks, duplicate study sets, or small disposable libraries. Include onboarding, create/import small library, study session, JSON import, CSV import, text/markdown import, and an import larger library attempt when it can be done safely with generated content.

## What data not to use

Do not use irreplaceable study data without backup. Do not record raw sensitive test content, credentials, contact information, backup file contents, device identifiers, telemetry, analytics, or private notes.

## Pre-run backup checklist

- Confirm the tester understands Backup is not sync.
- Confirm Restore may overwrite current data.
- Create a backup before any risky action.
- Keep the backup outside the evidence log.
- Stop if the tester believes backup is sync.
- Stop if the tester expects cloud/account/backend recovery.

## First-run sequence overview

Run one careful session covering onboarding, create/import small library, study session, backup creation, restore rehearsal, manual transfer rehearsal, mobile/PWA observation, local-first trust-copy comprehension, and Vietnamese-first copy comprehension.

If time allows, add generated larger library import, storage quota estimate, large import warning, repeated backup/restore rehearsal, due cards / review schedule count checks, FSRS experimental/off/default boundary checks, and EduGen Draft Workshop import boundary checks.

## Step 1 — Environment and version check

Record approximate date, platform class, browser class, install mode, and version observed. Use anonymized notes only.

Confirm no account/cloud/sync/backend path is presented and no built-in AI/OCR/AI generation claim appears.

## Step 2 — Create or import small library

Complete onboarding, then create or import a small library using duplicate/generated/test data. Prefer JSON import, CSV import, or text/markdown import if practical.

Record expected item count, observed item count, and due cards / review schedule count. Stop if due/review counts look inconsistent.

## Step 3 — Study session check

Run a short study session. Record whether progress persists, due cards / review schedule count remains understandable, and FSRS remains experimental/off/default unless the tester intentionally changes an experimental setting.

## Step 4 — Backup creation check

Create a backup before any risky action. Confirm the tester understands backup is a manual local export and not sync.

Stop if backup creation is unclear or if the tester believes backup creates cloud recovery.

## Step 5 — Restore rehearsal check

Using disposable data, make a controlled change and restore from backup. Record whether the expected library and progress return.

Stop if restore behavior is unclear or if the tester does not understand that Restore may overwrite current data.

## Step 6 — Manual transfer rehearsal check

Use manual export/import transfer as a one-time copy between browsers or devices where possible. Confirm this is not ongoing sync and does not involve account/cloud/sync/backend.

## Step 7 — Mobile/PWA observation check

Use a mobile viewport, mobile browser, or PWA install where available. Record layout usability, backup file access, restore comprehension, and PWA/service-worker cache boundary expectations.

The PWA/service-worker cache boundary must not be described as sync, cloud backup, or data-loss prevention.

## Step 8 — Local-first trust-copy comprehension check

Ask the tester to summarize local-first trust copy without recording contact information. Evidence should show whether the tester understands data is local, backup is their responsibility, Backup is not sync, Restore may overwrite current data, and no account/cloud/sync/backend exists.

Stop if the tester believes cloud/account/backend exists.

## Step 9 — Vietnamese-first copy comprehension check

When a Vietnamese-speaking tester is available, record an anonymized summary of Vietnamese-first copy comprehension. Confirm the copy does not imply sync, cloud, account, backend, built-in AI, OCR, AI quiz generation, or beta-ai public naming.

Stop if beta-ai or AI capability implication appears.

## Step 10 — Evidence summary

Summarize pass / hold / not tested for onboarding, create/import small library, import larger library, study session, due cards / review schedule count, JSON import, CSV import, text/markdown import, EduGen Draft Workshop import boundary, storage quota estimate, large import warning, backup before risky action, restore from backup, repeated backup/restore rehearsal, manual export/import transfer, mobile viewport, PWA/service-worker cache boundary, FSRS experimental/off/default boundary, beta-ai naming absence, no account/cloud/sync/backend, no built-in AI/OCR/AI generation, Vietnamese-first copy comprehension, and local-first trust-copy comprehension.

## Stop conditions

Stop the run if backup/restore behavior is unclear, if backup before risky action was skipped, if the tester believes backup is sync, if the tester believes cloud/account/backend exists, if due cards / review schedule count looks inconsistent, if beta-ai or AI capability implication appears, if private data would need to be recorded, or if tester data safety cannot be protected.

## Fillable evidence handoff

Use `docs/testing/phase21e-fillable-evidence-session-template.md` after the manual run. Leave unknown sections as `[pass / hold / not tested]` or `[fill after manual run]`.

Do not invent results. Do not commit private study content.

## Claim boundaries

Allowed claims after Phase 21E:

- first-run manual evidence pack exists;
- fillable evidence session template exists;
- first-run safety and claim checklist exists;
- HOLD remains active pending actual filled evidence;
- beta-ai naming cleanup remains preserved;
- no-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 21E:

- first manual evidence run has been executed;
- real user testing is complete;
- stress testing is complete;
- local-first hybrid beta is ready;
- sync exists;
- cloud sync exists;
- account/auth/backend exists;
- production sync is ready;
- production IndexedDB storage exists;
- storage migration is complete;
- backup/export is adapter-aware;
- restore is adapter-aware;
- data-loss prevention is guaranteed;
- built-in AI exists;
- AI quiz generation exists;
- OCR exists;
- beta-ai is acceptable public naming.

## Phase 21F handoff

Phase 21F should fill real-user evidence after actual anonymized sessions. Phase 21E only prepares the first run.

## Phase 21G handoff

Phase 21G should fill stress evidence after actual performance/quota/import runs. Phase 21E only identifies first-run stress observations that may be collected safely.

## Phase 21H handoff

Phase 21H may re-decide beta readiness only after actual filled Phase 21F and Phase 21G evidence exists and no critical hold signal remains unresolved.
