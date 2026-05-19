# Phase 23E — Data-Survival Comprehension Plan Summary

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

## Plan summary

Phase 23E adds a future evidence-run plan for testing whether non-technical Vietnamese learners understand Shime's local data-survival UX and copy direction. The plan uses generated/test data only, anonymized participant IDs, static/prototype prompts, and neutral observation notes.

The planned run focuses on comprehension of local-by-default storage, uninstall and clear-site-data risk, manual backup/export, stale backup state, backup health limits, restore overwrite risk, platform backup uncertainty, and the absence of sync/cloud/account/auth/backend behavior.

Recommended sample size: 5 to 8 participants for an initial comprehension run.

## Research scenarios

- where your data lives explanation
- first backup nudge comprehension
- backup health state comprehension
- backup reminder comprehension
- restore overwrite warning comprehension
- large import backup-before-action comprehension
- manual transfer to another device comprehension
- platform backup uncertainty comprehension
- non-blaming recovery tone comprehension
- manual backup/export is not sync comprehension

Core comprehension checks include:

- data is local by default
- local data can be lost on uninstall or clear-site-data
- manual backup/export is not sync
- platform backup is not guaranteed
- restore may overwrite current data
- a stale backup should be refreshed
- backup health does not guarantee data-loss prevention
- sync/cloud/account/backend are not present
- what action to take before changing device
- what action to take before risky import or restore

## Evidence thresholds

PASS_RESEARCH_DIRECTION: most participants can explain the core local-data, backup/export, stale backup, restore overwrite, platform uncertainty, and no-sync/no-cloud/no-account/no-backend concepts without moderator teaching. Phase 23F should decide whether to authorize a real evidence run, keep the copy/UX direction, and define implementation prerequisites.

HOLD_FOR_COPY_REVISION: participants generally understand the concept after reading, but repeated wording issues cause hesitation, unclear Vietnamese interpretation, or confusion between backup/export and sync. Phase 23F should require copy revision before evidence execution or runtime implementation.

HOLD_FOR_UX_REDESIGN: participants repeatedly miss the action to take, misunderstand backup health as guaranteed protection, miss restore overwrite risk, or cannot distinguish manual transfer from sync. Phase 23F should require UX redesign direction before evidence execution or runtime implementation.

BLOCKED_BY_RECRUITMENT_OR_ENVIRONMENT: the team cannot recruit appropriate non-technical Vietnamese learners, cannot run with generated/test data only, cannot preserve anonymization, or cannot provide a stable static prototype/session environment. Phase 23F should hold the track and resolve blockers before any evidence claim.

What forces HOLD or redesign:

- repeated belief that manual backup/export is automatic sync
- repeated belief that platform backup is guaranteed
- repeated failure to notice restore overwrite risk
- repeated belief that backup health guarantees data-loss prevention
- inability to run without personal data, telemetry, analytics, sync, account, cloud, auth, or backend behavior

## Ethics and anonymization

Use generated/test data only.
Do not collect personal learning data.
Use anonymized participant IDs.
Do not pressure participants to disclose personal device or backup habits.
Do not frame misunderstanding as user failure.
Keep Vietnamese-first and non-blaming tone.
Do not claim broad external real-user evidence from this small plan alone.

Observation records must use anonymized participant IDs and avoid names, email addresses, phone numbers, device serials, personal file names, school names, and personal backup habits.

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

## Guardrails

- Phase 23E is limited to docs/research/planning/static-validator/CI-only work.
- Do not run participant sessions.
- Do not collect personal data.
- Do not implement runtime UI, backup reminders, backup health tracking, or backup/export/restore behavior.
- Do not add sync, cloud, account, auth, backend behavior, telemetry, analytics, runtime implementation, or ADRs.

## Next recommended phase

Next recommended phase: Phase 23F — Phase 23 Decision Gate
