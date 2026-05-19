# Phase 23C — Backup Health Design Summary

## Status token

PHASE23C_BACKUP_HEALTH_DESIGN_STATUS: COMPLETED_DOCS_ONLY

## Scope

Phase 23C is a docs-only backup health design gate.
Phase 23C does not implement runtime UI.
Phase 23C does not implement backup health tracking.
Phase 23C does not change backup/export/restore behavior.
Phase 23C does not make Shime BETA_READY.
Phase 23C does not make backup/export/restore adapter-aware.
Phase 23C does not verify platform backup behavior.
Phase 23C does not add sync, cloud, account, auth, or backend behavior.

## Design summary

Phase 23C defines backup health design direction for a future last-backup indicator. The indicator should communicate whether Shime can confidently interpret the learner's user-controlled backup file freshness. It must remain calm, Vietnamese-first, non-blaming, and explicit that manual backup/export is not sync.

Suggested threshold direction is research/design direction, not implemented behavior: fresh means backup exists and is recent; aging means backup exists but may deserve a gentle reminder; stale means backup exists but should be refreshed; unknown means backup status cannot be confidently interpreted.

Future placement direction includes the Settings Bảo vệ dữ liệu surface, a Dashboard or home-surface lightweight indicator, and restore and import risk surfaces. Platform backup is not guaranteed and remains verification required.

## Backup health states

- `NO_BACKUP_YET`: label `Chưa có bản sao lưu`; helper `Bạn chưa tạo tệp sao lưu. Hãy xuất một bản sao khi bạn đã có dữ liệu học quan trọng.`
- `FRESH_BACKUP`: label `Sao lưu gần đây`; helper `Bạn đã có bản sao lưu gần đây. Hãy giữ tệp ở nơi bạn tin cậy.`
- `AGING_BACKUP`: label `Sao lưu sắp cũ`; helper `Bản sao lưu của bạn có thể chưa bao gồm các thay đổi mới. Khi rảnh, hãy tạo bản mới.`
- `STALE_BACKUP`: label `Nên sao lưu lại`; helper `Bản sao lưu có thể đã cũ. Trước thao tác rủi ro, hãy tạo bản sao lưu mới.`
- `UNKNOWN_BACKUP_STATE`: label `Chưa rõ trạng thái sao lưu`; helper `Shime chưa xác định chắc tình trạng sao lưu. Bạn có thể tạo bản sao lưu mới để yên tâm hơn.`

## Product stance

Backup health is a future communication layer, not a recovery promise. The last-backup indicator can help learners understand whether a recent user-controlled backup file appears to exist, but it must not claim guaranteed data-loss prevention.

Manual backup/export wording should say `tạo tệp sao lưu`, `xuất bản sao để tự giữ`, and `lưu tệp ở nơi bạn tin cậy`. It must not present manual export as automatic sync.

Backup health must not rely on color alone.
Every color state must have a text label.
Copy must remain clear in Vietnamese.
Tone must be calm and non-blaming.
Indicators must not block normal study flow by default.

## What Phase 23C can claim

- Backup health design direction exists.
- Last-backup indicator states have been planned.
- Vietnamese-first backup health copy has been drafted.
- Accessibility and tone rules for backup health have been defined.

## What Phase 23C must not claim

Phase 23C must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, backup health is implemented, last-backup tracking is implemented, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Guardrails

- Docs/design/static-validator/CI-only.
- No runtime UI or tracking implementation.
- No backup/export/restore behavior change.
- No sync, cloud, account, auth, or backend behavior.
- No platform backup preservation claim.
- No ADR.

## Next recommended phase

Next recommended phase: Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc
