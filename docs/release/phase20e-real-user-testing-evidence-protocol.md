# Phase 20E — Real User Testing Evidence Protocol

## Purpose

This document is the Phase 20E real user testing evidence protocol. It defines what
counts as valid evidence, what tester profiles are acceptable, how to conduct sessions
safely, and what conditions must be met before Phase 20G may reconsider the Phase 20D
HOLD decision. It does not implement runtime code. It does not collect telemetry,
analytics, or user accounts. It does not modify storage behavior, FSRS behavior,
backup/export/restore behavior, or import behavior.

Phase 20E creates a results log structure and this evidence protocol. Phase 20E does
not claim real user testing is complete. Phase 20G must not reconsider `BETA_READY`
until real evidence recorded in `docs/testing/phase20e-real-user-testing-results-log.md`
exists and the conditions below are met.

## Evidence status

```text
REAL_USER_TEST_EXECUTION_STATUS: RESULTS_LOG_TEMPLATE_READY
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
```

Evidence collected: none.

No tester sessions have been conducted. No results exist. The HOLD decision from
Phase 20D remains active. `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` is not overridden
by Phase 20E. Phase 20E creates the results log structure only.

## Minimum evidence needed before Phase 20G

Phase 20G must not reconsider `BETA_READY` until all of the following are satisfied:

1. **Real user testing evidence from Phase 20E:**
   - Minimum 3 completed tester sessions recorded with real tester-provided results
     in `docs/testing/phase20e-real-user-testing-results-log.md`.
   - No unresolved critical hold signals (stop conditions triggered and not corrected
     by copy change).
   - At least one Vietnamese-speaking tester confirms Vietnamese-first trust copy is
     comprehensible.
   - All completed sessions confirm backup-is-not-sync boundary understood from copy
     alone.
   - All completed sessions confirm restore-may-overwrite risk understood from copy
     alone.
   - No session observes `beta-ai` substring in any public-facing copy or UI string.
   - No session observes built-in AI, OCR, or AI quiz generation capability claimed.

2. **Stress-test evidence from Phase 20F:**
   - Performance baseline measured.
   - Storage quota warning observed and recorded.
   - Large-import stress-test results recorded.
   - Mobile/PWA stress observation recorded.

3. **No critical data safety hold signals remain unresolved.**

4. **`beta-ai` naming remains cleaned as established by Phase 20D.**

5. **No cloud/sync/account/backend/AI/OCR overclaims appear in any copy, UI string,
   or public document.**

## Tester profile

Acceptable tester profiles for Phase 20E sessions:

- Trusted team members or close collaborators who understand this is a beta product.
- Testers who are comfortable with localStorage-only data storage.
- Testers who can be explicitly briefed on the no-sync, no-cloud baseline before
  testing.
- Vietnamese-speaking testers who can evaluate Vietnamese-first trust copy. At least
  one Vietnamese-speaking tester is required.
- Testers who can follow the pre-test safety checklist without prompting.
- Testers who can give qualitative feedback about flows, copy, and trust signals.

Unacceptable tester profiles for Phase 20E sessions:

- General public users who expect production stability guarantees.
- Users with irreplaceable study libraries who have not made a backup.
- Users who have been told sync or cloud backup is available.
- Users who expect multi-device sync to work.
- Users who have not been briefed on the beta nature of the product.
- Users who are not comfortable with manual data management.
- Users who expect built-in AI, OCR, or AI quiz generation.

## Recruitment boundary

Testers must be recruited from among people who:

- Know the project team personally or through trusted referral.
- Understand they are testing beta software.
- Have agreed to use test or duplicate data wherever possible.
- Have agreed not to share private study content with the testing coordinator.

Do not recruit testers through public channels, social media, or any form of open
beta announcement during Phase 20E. Phase 20E is internal/trusted-collaborator only.

## Data safety protocol

Before each session:

- Confirm the pre-test safety checklist (see results log) is complete.
- Confirm the tester is using test or duplicate data, or has made a backup of any
  real study data they intend to use.
- Confirm the tester understands: no cloud, no sync, no account, no backend.
- Confirm the tester understands: backup is not sync; a backup is a manual snapshot.
- Confirm the tester understands: restore may overwrite current data.

During each session:

- Do not record private study content from the tester's library.
- Do not record contact information.
- Do not record credentials.
- Stop if any stop condition below is triggered.

After each session:

- Record session results in the results log template immediately.
- Do not retain tester-identifiable information outside the results log template.
- Do not upload tester data to any external service.

## Backup protocol

Before any session that involves restore, large import, or risky data operation:

1. Ask the tester to navigate to the backup/export section of Shime.
2. Ask the tester to export a backup labeled with the session date and number.
3. Confirm the tester has downloaded the backup file to a safe location outside the
   browser (download folder, external drive, or email to self).
4. Do not proceed with restore or large-import testing until the backup is confirmed.
5. Record in the session log whether the backup step was completed before the risky
   operation.

State clearly to the tester:

> "This backup is a manual snapshot of your local data. It is not a cloud backup.
> It is not synced automatically. If you restore from this backup later, it may
> overwrite your current data."

## Restore protocol

Before any restore scenario:

1. Confirm the tester understands restore may overwrite current data.
2. Confirm the tester has a backup of their current state before restoring.
3. Confirm the tester understands the restore source (which backup file, from when).
4. Proceed only after the tester explicitly confirms they accept the overwrite risk.

Stop condition: if the tester cannot confirm they understand restore-may-overwrite
risk without coordinator explanation, record a hold signal and do not proceed with
restore testing.

## Manual transfer protocol

Before any manual transfer (export then import on another device) scenario:

1. Confirm the tester understands manual transfer is the only cross-device data
   movement path. There is no automatic sync.
2. Confirm the tester understands that after a manual transfer, both devices have
   independent copies. Changes on one device do not appear on the other.
3. Confirm the tester understands that a manual transfer is not the same as sync and
   is not equivalent to cloud backup.
4. Walk the tester through: export on device A, transfer the file (e.g., email, USB,
   AirDrop), import on device B.

Stop condition: if the tester believes manual transfer produces ongoing sync, record a
hold signal.

## Local-first trust-copy protocol

During any session:

1. Ask the tester to find the trust statement about data storage (e.g., in onboarding
   or settings).
2. Ask the tester: "Where does Shime store your data?"
3. Record whether the tester answers: local browser storage / on this device / locally.
4. Ask the tester: "Does Shime sync your data anywhere?"
5. Record whether the tester answers: no / not by default / only if I export manually.

Stop condition: if the tester believes data is stored on Shime servers, a Shime cloud,
or any remote backend, record a hold signal and correct the misunderstanding. Do not
continue until corrected.

## Vietnamese-first copy comprehension protocol

For Vietnamese-speaking testers:

1. Ask the tester to read the primary Vietnamese-language trust statement aloud.
2. Ask the tester to explain in their own words: what the statement says about data
   storage, cloud, and sync.
3. Record whether the explanation matches the intended trust position:
   - Data is local, stored on your device.
   - No cloud sync.
   - No account or backend.
   - Backup is a manual snapshot.
4. Record any wording the tester found confusing or misleading.

Pass signal: tester explains local-first trust position accurately without prompting.
Hold signal: tester misunderstands Vietnamese trust copy or finds it misleading.

At least one Vietnamese-speaking tester must complete this protocol before Phase 20G.

## FSRS and review schedule observation protocol

During any session that includes a study scenario:

1. Observe whether the tester sees FSRS-related UI elements.
2. Confirm the tester sees only the legacy scheduler by default.
3. If the tester asks about FSRS or spaced repetition, explain:
   - FSRS is an experimental scheduling feature.
   - FSRS is not publicly available for opt-in yet.
   - FSRS data does not sync between devices.
4. Record whether the tester tried to enable FSRS and what UI they encountered.
5. Record whether the tester understood the FSRS experimental boundary.

Hold signal: tester believes FSRS is production-ready or publicly opt-in.
Hold signal: tester believes FSRS data syncs automatically.

## Import observation protocol

During any session that includes an import scenario:

1. Observe the tester importing a small library (under 100 cards).
2. If testing large import, observe the tester importing a larger library (200–500+
   cards) and note any quota or performance warnings.
3. Record:
   - Did the import complete without errors?
   - Did any quota warning appear?
   - How long did the import take (approximate)?
   - Did the tester understand what the import was doing?
4. Confirm the tester does not believe import is equivalent to sync.
5. Confirm the tester understands imported data is stored locally only.

Stop condition: if import fails, crashes, or causes data loss, stop the session,
record the failure as a hold signal, and do not proceed with further risky operations.

## Mobile/PWA observation protocol

For mobile device sessions:

1. Confirm the tester is accessing Shime via browser on mobile (not a native app).
2. Confirm the tester can install the PWA (add to home screen) if they wish.
3. Observe whether the UI renders acceptably on the device.
4. Observe whether the study session flow works on mobile.
5. Observe whether backup/export works on mobile (is the file accessible?).
6. Record any mobile-specific friction or breakage.

Hold signal: backup export file is inaccessible on mobile in a way that blocks the
tester's data safety.

## Stop conditions

Stop the session immediately and record a hold signal if any of the following occur:

1. Tester confuses backup with sync and cannot be corrected by copy alone.
2. Tester believes Shime has cloud sync, account, or backend features.
3. Tester believes Shime has built-in AI, OCR, or automated AI quiz generation.
4. `beta-ai` substring appears in any public-facing copy or UI string during the
   session.
5. Restore overwrite risk is unclear to the tester without coordinator explanation.
6. Critical data safety incident occurs (data loss, failed backup, failed restore,
   import crash).
7. Vietnamese-speaking tester misunderstands Vietnamese trust copy in a way that could
   lead to data safety misalignment.
8. FSRS is described as production-ready or publicly opt-in in any UI string observed.
9. EduGen is described as a built-in AI or OCR feature in any UI string observed.
10. Any UI string or document shows no-cloud/no-sync claim being false.

Record the exact text or behavior that triggered the stop condition. Do not continue
the session until the coordinator has assessed the stop condition.

## Evidence quality rubric

| Quality level | Definition |
|---|---|
| Strong pass | Tester completes all required scenarios, understands all trust claims from copy alone, no hold signals |
| Weak pass | Tester completes most scenarios with minor coordinator intervention; no critical hold signals |
| Neutral | Tester completes some scenarios; mixed comprehension; no critical hold signals but gaps noted |
| Weak hold | Tester triggers one non-critical stop condition; corrected; noted as risk |
| Strong hold | Tester triggers critical stop condition; data safety risk or trust claim failure |

Phase 20G requires at least 3 sessions at weak-pass or better, with no unresolved
strong-hold signals.

## What counts as passing evidence

A session counts as passing evidence if:

- The tester completed onboarding without coordinator intervention.
- The tester successfully created, imported, and studied a library.
- The tester understood local-first storage from copy alone (no coaching required).
- The tester understood backup-is-not-sync from copy alone.
- The tester understood restore-may-overwrite from copy alone.
- The tester did not expect cloud, sync, account, or backend after reading trust copy.
- No `beta-ai` or AI capability implication was observed in public copy.
- No critical stop condition was triggered.

## What counts as hold evidence

A session counts as hold evidence if:

- A stop condition was triggered and could not be resolved by copy change alone.
- The tester believed Shime had cloud, sync, account, backend, built-in AI, or OCR.
- The tester's data was at risk due to missing backup or restore confusion.
- `beta-ai` substring appeared in any public-facing copy during the session.
- Vietnamese trust copy was misunderstood or misleading.
- Import crash, data loss, or backup failure occurred.
- FSRS was described as publicly available or production-ready.
- EduGen was described as a built-in AI or OCR capability.

Hold evidence from any session must be recorded and resolved before Phase 20G may
reconsider HOLD.

## Claim boundaries

Allowed claims after Phase 20E:

- The real-user testing results log structure exists in
  `docs/testing/phase20e-real-user-testing-results-log.md`.
- This evidence protocol exists.
- HOLD remains active.
- Beta-ready remains blocked until executed evidence exists.
- `beta-ai` naming cleanup remains required and preserved by Phase 20D.
- No-cloud/default-off trust boundaries remain active.

Forbidden claims after Phase 20E:

- Real user testing is complete. (Only allowed after actual user-provided results are
  recorded in the session entries in the results log.)
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

## Phase 20F relationship

Phase 20F executes the Phase 20C performance, storage quota, and import stress-test
plan. Phase 20F creates the stress-test results log artifact. Phase 20F is parallel
to Phase 20E's real-user testing execution — both phases produce evidence consumed
by Phase 20G.

Phase 20F read list:
- `docs/adr/phase20c-performance-quota-import-stress-test-plan.md`
- `docs/testing/phase20c-performance-quota-import-stress-test-plan.md`

Phase 20G requires both Phase 20E real-user evidence and Phase 20F stress-test
evidence before reconsidering HOLD.

## Phase 20G readiness gate

Phase 20G must not reconsider `BETA_READY` until:

1. Real user testing evidence exists (minimum sessions recorded with real results in
   `docs/testing/phase20e-real-user-testing-results-log.md`).
2. Stress-test evidence exists from Phase 20F.
3. No critical data safety hold signals remain unresolved.
4. `beta-ai` naming remains cleaned (no regression from Phase 20D cleanup).
5. No cloud/sync/account/backend/AI/OCR overclaims appear in any copy, UI string,
   or public document.

Phase 20G may not claim `BETA_READY` on the basis of:
- plans only (Phase 20B plan-only, Phase 20C plan-only)
- this evidence protocol alone
- audit/stabilization docs alone (Phase 20A)
- the existence of this log structure (RESULTS_LOG_TEMPLATE_READY does not equal
  testing-complete or beta-ready)
