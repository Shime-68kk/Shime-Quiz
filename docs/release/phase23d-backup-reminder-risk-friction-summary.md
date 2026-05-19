# Phase 23D — Backup Reminder + Risk Friction Summary

## Status token

PHASE23D_BACKUP_REMINDER_RISK_FRICTION_DESIGN_STATUS: COMPLETED_DOCS_ONLY

## Scope

Phase 23D is a docs-only backup reminder and pre-risk-action friction design gate.
Phase 23D does not implement runtime UI.
Phase 23D does not implement reminder scheduling.
Phase 23D does not implement backup health tracking.
Phase 23D does not change backup/export/restore behavior.
Phase 23D does not change import behavior.
Phase 23D does not make Shime BETA_READY.
Phase 23D does not make backup/export/restore adapter-aware.
Phase 23D does not verify platform backup behavior.
Phase 23D does not add sync, cloud, account, auth, or backend behavior.

## Design summary

Phase 23D defines backup reminder design direction and pre-risk-action friction design direction for future work. It keeps normal study non-blocking by default while allowing extra confirmation before risky local-data actions.

Reminder direction relates to Phase 23C backup health states: no reminder for a fresh backup, gentle nudges for no backup or aging backup, visible reminders for stale backup, and an uncertainty prompt for unknown backup state before risky action.

Manual backup/export is not sync. Platform backup is not guaranteed. Backup reminders must not claim to prevent all data loss.

## Reminder states

- `NO_REMINDER_NEEDED`: label `Không cần nhắc lúc này`; helper `Bạn có thể tiếp tục học. Khi cần, hãy giữ tệp sao lưu ở nơi bạn tin cậy.`
- `GENTLE_BACKUP_NUDGE`: label `Nhắc nhẹ sao lưu`; helper `Bạn đã có dữ liệu học quan trọng. Khi rảnh, hãy tạo tệp sao lưu để tự giữ.`
- `VISIBLE_BACKUP_REMINDER`: label `Nên tạo bản sao lưu`; helper `Bản sao lưu có thể chưa bao gồm thay đổi mới. Hãy tạo tệp sao lưu mới khi bạn có thể.`
- `PERSISTENT_NON_BLOCKING_REMINDER`: label `Sao lưu đã cũ`; helper `Bạn vẫn có thể học tiếp. Trước khi thao tác rủi ro, hãy tạo tệp sao lưu mới.`
- `PRE_RISK_ACTION_PROMPT`: label `Sao lưu trước khi tiếp tục`; helper `Thao tác này có thể ảnh hưởng dữ liệu học trên thiết bị này. Hãy tạo tệp sao lưu nếu bạn muốn giữ bản hiện tại.`
- `UNKNOWN_BACKUP_STATUS_PROMPT`: label `Chưa rõ trạng thái sao lưu`; helper `Shime chưa xác định chắc bạn có bản sao lưu mới hay chưa. Trước thao tác này, bạn nên tạo tệp sao lưu mới.`

## Pre-risk-action surfaces

Phase 23D covers restore overwrite, large import, manual transfer to another device, before destructive local-data action, after detecting no backup yet, after detecting stale backup, and unknown backup state before risky action.

Future restore overwrite prompt direction should recommend backing up the current device before proceeding. Future large import backup-before-action prompt direction should recommend a backup because many local records may change. Future manual transfer/device switch copy should explain that the learner controls a backup file and should verify data on the target device. Clear-data or uninstall education should remain explicit that platform behavior is uncertain.

## Product stance

Reminder copy must be calm and non-blaming.
Reminder copy must be Vietnamese-first.
Reminder copy must not create panic.
Normal study flow must not be blocked by default.
Pre-risk-action prompts may add friction only before risky actions.
Manual backup/export must never be called sync.
Platform backup must never be implied as guaranteed.
Backup reminders must not claim to prevent all data loss.

## What Phase 23D can claim

- Backup reminder design direction exists.
- Pre-risk-action friction design direction exists.
- Vietnamese-first reminder copy has been drafted.
- Non-blocking reminder principles have been defined.

## What Phase 23D must not claim

Phase 23D must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, backup reminder is implemented, pre-risk-action friction is implemented, backup health tracking is implemented, last-backup tracking is implemented, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Guardrails

- Docs/design/static-validator/CI-only.
- No runtime UI implementation.
- No reminder scheduling implementation.
- No backup health tracking implementation.
- No backup/export/restore behavior change.
- No import behavior change.
- No sync, cloud, account, auth, or backend behavior.
- No platform backup preservation claim.
- No ADR.

## Next recommended phase

Next recommended phase: Phase 23E — Evidence-Run Plan for Data-Survival Comprehension
