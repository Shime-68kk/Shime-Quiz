# Phase 23E — Evidence-Run Plan for Data-Survival Comprehension

## Status token

PHASE23E_DATA_SURVIVAL_COMPREHENSION_PLAN_STATUS: COMPLETED_DOCS_ONLY

## Scope

Phase 23E is a docs-only evidence-run planning gate.
Phase 23E does not execute user research sessions.
Phase 23E does not collect personal data.
Phase 23E does not implement runtime UI.
Phase 23E does not implement backup reminders.
Phase 23E does not implement backup health tracking.
Phase 23E does not change backup/export/restore behavior.
Phase 23E does not make Shime BETA_READY.
Phase 23E does not make backup/export/restore adapter-aware.
Phase 23E does not verify platform backup behavior.
Phase 23E does not add sync, cloud, account, auth, or backend behavior.

This plan defines a future evidence run for data-survival comprehension. It must not be treated as executed research or completion of data-survival evidence.

## Inputs

- Phase 22H ended with HOLD because broader actual evidence was still limited.
- Phase 23A established local data survival research direction.
- Phase 23B established data-survival UX and Vietnamese copy direction.
- Phase 23C established backup health and last-backup indicator design direction.
- Phase 23D established backup reminder and pre-risk-action friction design direction.
- Phase 23E plans a future comprehension evidence run only.

## Research goals

- Check whether non-technical Vietnamese learners understand that Shime stores data locally by default.
- Check whether participants understand local data can be lost through uninstall, browser/app data clearing, device loss, or device replacement.
- Check whether participants understand manual backup/export is not sync.
- Check whether participants understand platform backup is uncertain and not guaranteed.
- Check whether participants understand stale backup and unknown backup states.
- Check whether participants understand backup health does not guarantee data-loss prevention.
- Check whether participants understand restore and risky import actions can overwrite or affect current local data.
- Check whether participants can identify the action to take before changing device, importing a large file, restoring, or clearing local data.
- Check whether Vietnamese copy feels calm, non-blaming, and understandable without technical vocabulary.
- Identify whether Phase 23F should run evidence, revise copy, redesign UX direction, or hold.

## Participant profile

Recommended sample size: 5 to 8 participants for an initial comprehension run.

Participant focus:

- Vietnamese-first learners or students who can read Vietnamese app copy.
- Non-technical users who are not expected to know browser storage, IndexedDB, localStorage, platform backup, or sync terminology.
- Participants may use phones, tablets, or laptops, but the evidence run should not ask them to disclose personal device backup habits.
- Internal or external participants are acceptable only if the session uses generated/test data and anonymized participant IDs.
- Recruitment must avoid minors unless a separate consent and safeguarding process exists outside this plan.

Small-sample limitations:

- This sample can expose severe comprehension risk, repeated confusion, and copy problems.
- This sample cannot prove broad external real-user evidence complete.
- This sample cannot prove beta readiness or guaranteed protection from data loss.

## Session setup

- Use generated/test data only.
- Do not collect personal learning data.
- Do not ask participants to import real school files, real quiz sets, real backups, or personal account details.
- Use a scripted prototype, static screenshots, or paper-like mock screens derived from Phase 23B-23D direction.
- Do not connect to a live production account, sync service, backend, cloud storage, analytics, telemetry, or real backup provider.
- Use anonymized participant IDs such as `P01`, `P02`, and `P03`.
- Record only task outcome, participant explanation, observed confusion, and researcher notes.
- Do not collect names, email addresses, phone numbers, device serials, file names, school names, or personal backup habits.
- Explain that the session tests the wording and design, not the participant.

Suggested session structure:

1. Opening and consent for an anonymized comprehension session using generated/test data.
2. Warm-up: ask the participant to read a short Shime data-location message.
3. Scenario walkthroughs using static screens or a non-production prototype.
4. Comprehension questions after each scenario.
5. Final teach-back: ask the participant to explain what they would do before changing device or restoring data.
6. Moderator debrief and note cleanup without personal identifiers.

Task script:

- "Please read this screen and explain in your own words where your study data is stored."
- "You have created a few test quiz sets. What would you do before changing device?"
- "This screen says your backup is old. What does that mean, and what would you do?"
- "You are about to restore a backup. What might happen to current data?"
- "You are about to import a large generated file. What should you do first?"
- "Does this wording make you feel blamed, rushed, or confused?"

Moderator notes:

- Let participants think aloud without correcting them immediately.
- Ask follow-up questions only to clarify what they understood from the copy.
- Do not teach the intended answer before logging the first explanation.
- If a participant misunderstands, record the misunderstanding neutrally.
- Stop any line of questioning that leads toward personal device or backup disclosure.

## Scenario list

The future evidence run must include these scenarios:

1. where your data lives explanation: participant reads onboarding copy explaining local default storage.
2. first backup nudge comprehension: participant sees a first-backup prompt after generated quiz data exists.
3. backup health state comprehension: participant compares no-backup, fresh, aging, stale, and unknown backup states.
4. backup reminder comprehension: participant sees a calm backup reminder and explains whether it blocks study.
5. restore overwrite warning comprehension: participant sees a restore warning and explains overwrite risk.
6. large import backup-before-action comprehension: participant sees a large import prompt recommending backup first.
7. manual transfer to another device comprehension: participant explains how to move generated data to another device.
8. platform backup uncertainty comprehension: participant reads copy explaining platform backup is not guaranteed.
9. non-blaming recovery tone comprehension: participant reads missing-backup recovery copy and rates tone.
10. manual backup/export is not sync comprehension: participant distinguishes backup/export from automatic sync.

## Comprehension questions

1. In your own words, where is Shime data stored by default?
2. What could happen to local Shime data if the app/browser is uninstalled or site data is cleared?
3. Is manual backup/export the same as sync? Why or why not?
4. Can the app promise that platform backup will preserve your Shime data?
5. What might happen when you restore from a backup over current local data?
6. If a backup is stale, what should you do before a risky action?
7. Does a green or fresh backup health state guarantee data-loss prevention?
8. Does this screen say sync, cloud, account, auth, or backend behavior is present?
9. What action would you take before changing to another device?
10. What action would you take before a risky import or restore?
11. If backup status is unknown, what is the safest next step?
12. Which wording, if any, made you feel blamed or pressured?

## Evidence thresholds

PASS_RESEARCH_DIRECTION:

- Meaning: Most participants can explain local default storage, loss risks, manual backup/export, stale backup action, restore overwrite risk, platform backup uncertainty, and absence of sync/cloud/account/backend without moderator teaching.
- Phase 23F should decide whether to authorize a real evidence run, keep the copy/UX direction, and define implementation prerequisites. It still must not claim data-survival evidence completion from this plan alone.

HOLD_FOR_COPY_REVISION:

- Meaning: Participants generally understand the concept after reading, but repeated wording issues cause hesitation, unclear Vietnamese interpretation, or confusion between backup/export and sync.
- Phase 23F should require copy revision before evidence execution or runtime implementation.

HOLD_FOR_UX_REDESIGN:

- Meaning: Participants repeatedly miss the action to take, misunderstand backup health as guaranteed protection, miss restore overwrite risk, or cannot distinguish manual transfer from sync even after reading the planned screens.
- Phase 23F should require UX redesign direction before evidence execution or runtime implementation.

BLOCKED_BY_RECRUITMENT_OR_ENVIRONMENT:

- Meaning: The team cannot recruit appropriate non-technical Vietnamese learners, cannot run with generated/test data only, cannot preserve anonymization, or cannot provide a stable static prototype/session environment.
- Phase 23F should hold the track and resolve recruitment, ethics, or environment blockers before any evidence claim.

Failure criteria:

- Two or more participants interpret manual backup/export as automatic sync.
- Two or more participants believe platform backup is guaranteed.
- Two or more participants miss restore overwrite risk.
- Two or more participants think backup health guarantees no data loss.
- Any session requires personal data, personal files, personal backup details, telemetry, analytics, sync, account, auth, cloud, or backend behavior.
- Moderator correction is needed before a participant can answer core local-data questions.

What forces HOLD or redesign:

- HOLD_FOR_COPY_REVISION is forced by repeated wording hesitation, unclear Vietnamese interpretation, or sync-like reading of manual backup/export copy.
- HOLD_FOR_UX_REDESIGN is forced by repeated failure to identify the safe action, repeated belief that backup health guarantees data-loss prevention, repeated missed restore overwrite risk, or repeated confusion between manual transfer and sync.
- BLOCKED_BY_RECRUITMENT_OR_ENVIRONMENT is forced by inability to recruit the target participant profile, preserve anonymization, or run with generated/test data only.

Success criteria:

- Participants can teach back local-by-default behavior in plain Vietnamese.
- Participants can identify uninstall, clear-site-data, device loss, or device replacement as local-data risks.
- Participants know to create or refresh a manual backup/export before device change, large import, restore, or other risky action.
- Participants understand backup health is informational and not a guarantee.
- Participants understand Shime does not provide sync/cloud/account/backend behavior in this planned direction.
- Participants describe the tone as calm and not blaming.

## Observation log template

Participant IDs must be anonymized.

| Participant ID | Scenario | Prompt shown | Participant explanation | Observed confusion | Researcher note | Outcome | Follow-up needed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| P01 | where your data lives explanation | Generated/test prompt text | Participant's own words, no personal data | None / note confusion | Neutral note | Pass / revise / redesign / blocked | Yes / no |

## Tone and ethics rules

Use generated/test data only.
Do not collect personal learning data.
Use anonymized participant IDs.
Do not pressure participants to disclose personal device or backup habits.
Do not frame misunderstanding as user failure.
Keep Vietnamese-first and non-blaming tone.
Do not claim broad external real-user evidence from this small plan alone.

## Evidence interpretation rules

- Interpret confusion as a product/copy/design signal, not as participant failure.
- Treat repeated misunderstanding across participants as stronger evidence than a single isolated comment.
- Separate comprehension of the copy from preference about visual design.
- Do not count moderator-taught answers as unaided comprehension.
- Do not infer platform backup preservation from participant belief.
- Do not infer beta readiness from this plan.
- Do not infer data-survival evidence completion until sessions are actually run and documented in a later phase.
- Treat any need for personal data as a blocker.
- Preserve small-sample limitations in any Phase 23F decision.

## What Phase 23E can claim

- A data-survival comprehension evidence-run plan exists.
- Comprehension scenarios and questions have been planned.
- Anonymized observation rules have been defined.
- Phase 23F can use this plan to decide whether to run evidence, revise copy, or redesign UX direction.

## What Phase 23E must not claim

- BETA_READY.
- local-first hybrid beta ready.
- broad external real-user evidence complete.
- data-survival comprehension evidence complete.
- sync exists.
- cloud sync exists.
- account/auth/backend exists.
- production sync ready.
- production IndexedDB storage exists.
- storage migration complete.
- backup/export adapter-aware.
- restore adapter-aware.
- backup reminder is implemented.
- pre-risk-action friction is implemented.
- backup health tracking is implemented.
- last-backup tracking is implemented.
- guaranteed data-loss prevention.
- platform backup will preserve user data.
- built-in AI.
- AI quiz generation.
- OCR.
- external AI/API integration.
- beta-ai public naming acceptable.

## Phase 23F roadmap implication

Phase 23F can decide whether to:

- keep HOLD and schedule the planned comprehension evidence run;
- require copy revision before evidence execution;
- require UX redesign before evidence execution;
- block on recruitment, anonymization, or generated/test-data environment readiness;
- keep the data-survival track docs-only until real evidence is collected.

Phase 23F cannot use Phase 23E alone to claim beta readiness, data-survival evidence completion, runtime implementation, adapter-aware backup/restore, platform backup preservation, sync, cloud, account, auth, or backend behavior.

## Guardrails

- Phase 23E is limited to docs/research/planning/static-validator/CI-only work.
- Do not run participant sessions in Phase 23E.
- Do not collect personal data in Phase 23E.
- Do not implement runtime UI, backup reminders, backup health tracking, backup/export/restore behavior, sync, cloud, account, auth, or backend behavior.
- Do not modify runtime files, tests, e2e files, package files, service worker files, FSRS runtime, telemetry, analytics, or ADRs.

## Next recommended phase

Next recommended phase: Phase 23F — Phase 23 Decision Gate
