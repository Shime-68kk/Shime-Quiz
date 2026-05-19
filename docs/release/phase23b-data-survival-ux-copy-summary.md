# Phase 23B — Data-Survival UX Copy Summary

## Status token

PHASE23B_DATA_SURVIVAL_UX_COPY_STATUS: COMPLETED_DOCS_ONLY

Phase 23B is a docs-only UX/copy decision gate.
Phase 23B does not implement runtime UI.
Phase 23B does not make Shime BETA_READY.
Phase 23B does not make backup/export/restore adapter-aware.
Phase 23B does not verify platform backup behavior.
Phase 23B does not add sync, cloud, account, auth, or backend behavior.

## Scope

Phase 23B defines Vietnamese-first data-survival UX copy direction only. It does not modify runtime behavior, storage, import, backup, restore, FSRS behavior, source code, dependencies, telemetry, or ADRs.

## UX copy summary

The decision doc defines copy direction for onboarding where-your-data-lives explanation, first meaningful content backup nudge, Settings `Bảo vệ dữ liệu`, backup health language, backup reminder language, pre-risk-action friction, restore overwrite warning, large import backup-before-action warning, manual backup/export wording, manual transfer wording, user-controlled backup file wording, and platform backup uncertainty wording.

The Vietnamese copy library covers onboarding, first backup nudge, fresh backup health, stale backup health, no backup yet, old-backup reminder, pre-restore backup prompt, restore overwrite confirmation, large import backup recommendation, manual transfer explanation, platform backup uncertainty explanation, and non-blaming recovery tone.

Tone rules: calm, non-blaming, Vietnamese-first, plain-language, not panic-inducing, no jargon unless explained, never call manual backup/export sync, never imply platform backup is guaranteed, and never imply backup prevents all data loss.

## Product stance

Shime should explain that local learning data lives on the current device/browser by default and that learners should create user-controlled backup files before risky actions. Manual backup/export should be framed as a learner-controlled file action, not automatic cross-device behavior.

## What Phase 23B can claim

- Vietnamese-first data-survival UX copy direction exists.
- Backup and restore risk copy has been planned.
- Manual backup/export wording rules have been defined.
- User-controlled backup file copy direction has been defined.

## What Phase 23B must not claim

Phase 23B must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Guardrails

Phase 23B is docs/UX-copy/static-validator/CI-only. It preserves Phase 22H HOLD context and Phase 23A verification-required platform backup uncertainty. It does not implement runtime UI, does not verify platform backup behavior, and does not add sync, cloud, account, auth, backend, adapter-aware backup/export, or adapter-aware restore behavior.

Tone guardrails: calm, non-blaming, Vietnamese-first, plain-language, not panic-inducing.

## Next recommended phase

Next recommended phase: Phase 23C — Backup Health / Last-Backup Indicator Design Doc
