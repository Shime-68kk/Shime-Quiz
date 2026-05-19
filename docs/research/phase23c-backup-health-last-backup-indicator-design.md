# Phase 23C — Backup Health / Last-Backup Indicator Design Doc

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

This phase defines backup health / last-backup indicator design direction only. It does not add persistence, runtime UI, storage behavior, telemetry, analytics, reminders, or import/export logic.

## Inputs

- Phase 22H ended with `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_BROADER_ACTUAL_EVIDENCE_STILL_LIMITED`.
- Phase 22H gaps remain: second physical device transfer, real storage exhaustion, cross-browser coverage, PWA/offline behavior, real mobile file picker behavior, long-duration endurance, and broad external real-user evidence.
- Phase 23A completed `PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY` and documented uninstall, device loss, clear-site-data, private/incognito, browser switch, storage pressure/quota eviction, PWA/TWA/native-wrapper uncertainty, user expectation gaps, backup health, backup reminder, and pre-risk-action friction risks.
- Phase 23B completed `PHASE23B_DATA_SURVIVAL_UX_COPY_STATUS: COMPLETED_DOCS_ONLY` and defined Vietnamese-first data-survival copy direction without implementing runtime UI.

## Product stance

Shime Quiz / SimiQuiz remains Vietnamese-first, calm, local-first, learner-owned, and data-respectful. Local-first must not push data-loss risk onto learners. Backup health should help learners understand whether they have a recent user-controlled backup file before device loss, uninstall, clear-site-data, browser change, storage pressure, restore, or large import risk surfaces.

Manual backup/export is not sync. A backup file is user-controlled evidence that the learner intentionally saved or transferred. Platform backup is not guaranteed and must remain marked as verification required until tested on real devices and browser/app shells.

User-controlled backup file stance: the learner owns the backup file, chooses where to keep it, and should never be told that manual backup/export is automatic protection.

## Backup health concept

Backup health is a future product signal that interprets whether Shime can confidently communicate the freshness of the learner's most recent user-controlled backup file. It is not a promise that data is safe. It is a calm reminder layer that makes local data ownership visible.

The last-backup indicator purpose is to answer: "Do I have a recent backup file I control?" It should not answer: "Can Shime recover everything in every situation?"

What the indicator can claim: it can show design-direction backup freshness language when a future implementation has a trustworthy signal. What the indicator must not claim: it must not promise recovery, automatic sync, platform backup preservation, or verified backup health tracking.

Last backup timestamp meaning: a future timestamp may mean the app has recorded a completed manual backup/export event or has imported trusted backup metadata. Before implementation, the exact source of the timestamp must be specified and tested. If the timestamp source cannot be trusted, the state should become `UNKNOWN_BACKUP_STATE`, not a false fresh state.

## Backup freshness states

Vietnamese-first labels are required for every backup health state.

| State | Product meaning | Suggested Vietnamese label | Suggested helper copy | Recommended tone | What not to imply |
| --- | --- | --- | --- | --- | --- |
| `NO_BACKUP_YET` | Shime has no trustworthy record that the learner has created a user-controlled backup file. This is the no-backup-yet state. | `Chưa có bản sao lưu` | `Bạn chưa tạo tệp sao lưu. Hãy xuất một bản sao khi bạn đã có dữ liệu học quan trọng.` | Gentle, practical, non-blaming. | Do not imply data is already lost, that backup is automatic, or that platform backup will preserve user data. |
| `FRESH_BACKUP` | A backup exists and appears recent enough for a lightweight reassurance label. This is the fresh backup state. | `Sao lưu gần đây` | `Bạn đã có bản sao lưu gần đây. Hãy giữ tệp ở nơi bạn tin cậy.` | Calm, concise, confidence with limits. | Do not imply guaranteed data-loss prevention, device-loss recovery, or that manual export is sync. |
| `AGING_BACKUP` | A backup exists, but it may deserve a gentle reminder because learning data may have changed since then. This is the aging backup state. | `Sao lưu sắp cũ` | `Bản sao lưu của bạn có thể chưa bao gồm các thay đổi mới. Khi rảnh, hãy tạo bản mới.` | Helpful, low-pressure, non-blocking. | Do not shame the learner, block normal study flow by default, or imply an urgent failure. |
| `STALE_BACKUP` | A backup exists but should be refreshed before riskier actions or after meaningful data changes. This is the stale backup state. | `Nên sao lưu lại` | `Bản sao lưu có thể đã cũ. Trước khi đổi thiết bị, xoá dữ liệu, khôi phục hoặc nhập dữ liệu lớn, hãy tạo bản mới.` | Clear, calm, protective. | Do not imply current data is unrecoverable or that a fresh export guarantees recovery everywhere. |
| `UNKNOWN_BACKUP_STATE` | Shime cannot confidently interpret backup status, timestamp source, file validity, or environment state. This is the unknown backup state. | `Chưa rõ trạng thái sao lưu` | `Shime chưa xác định chắc tình trạng sao lưu. Bạn có thể tạo bản sao lưu mới để yên tâm hơn.` | Transparent, humble, user-controlled. | Do not invent a fresh/stale judgment, do not imply platform backup is verified, and do not claim tracking exists. |

## Threshold direction

Suggested threshold direction is research/design direction, not implemented behavior:

- `fresh`: backup exists and is recent.
- `aging`: backup exists but may deserve a gentle reminder.
- `stale`: backup exists but should be refreshed.
- `unknown`: backup status cannot be confidently interpreted.

Numeric thresholds, if later proposed, must be treated as research/design direction until validated. A possible design hypothesis is: fresh for a recent backup after meaningful study data exists, aging when the backup may miss normal learning progress, and stale when backup age or data changes make pre-risk-action friction appropriate. Implementation must not hard-code this phase as runtime behavior.

## Placement direction

Where backup health may appear:

Future backup health may appear in:

- Settings Bảo vệ dữ liệu surface: primary place for detailed backup health, last backup timestamp meaning, manual backup/export action, and restore/import warnings.
- Dashboard or home-surface lightweight indicator: small non-blocking badge that keeps backup health visible without interrupting study.
- Restore and import risk surfaces: reminder to create a backup before overwrite, large import, device transfer, clear-site-data, or other actions that could affect local learning data.

The indicator should be visible enough to prevent misunderstanding but not alarmist. Indicators must not block normal study flow by default.

## Vietnamese copy examples

1. No backup yet: `Chưa có bản sao lưu` / `Bạn chưa tạo tệp sao lưu. Khi có dữ liệu học quan trọng, hãy xuất một bản để tự giữ.`
2. Fresh backup: `Sao lưu gần đây` / `Bạn đã có bản sao lưu gần đây. Hãy lưu tệp ở nơi bạn tin cậy.`
3. Aging backup: `Sao lưu sắp cũ` / `Bản sao lưu có thể chưa có các thay đổi mới. Khi rảnh, hãy tạo bản mới.`
4. Stale backup: `Nên sao lưu lại` / `Bản sao lưu có thể đã cũ. Trước thao tác rủi ro, hãy tạo bản sao lưu mới.`
5. Unknown backup state: `Chưa rõ trạng thái sao lưu` / `Shime chưa xác định chắc tình trạng sao lưu. Bạn có thể tạo bản mới để yên tâm hơn.`
6. Backup health badge short label: `Sao lưu: gần đây`, `Sao lưu: nên cập nhật`, `Sao lưu: chưa rõ`.
7. Settings backup health helper: `Tệp sao lưu do bạn tự giữ. Shime không tự đồng bộ giữa thiết bị.`
8. Dashboard/home lightweight indicator: `Sao lưu gần đây` with helper `Dữ liệu học nên có bản sao do bạn giữ.`
9. Restore/import risk reminder using backup health: `Trước khi khôi phục hoặc nhập dữ liệu lớn, hãy tạo bản sao lưu mới để có đường quay lại nếu cần.`
10. Non-blaming stale-backup reminder: `Đã lâu bạn chưa tạo bản sao lưu mới. Nếu có thời gian, hãy xuất một bản để bảo vệ tiến độ học.`

## Accessibility rules

Backup health must not rely on color alone.
Every color state must have a text label.
Copy must remain clear in Vietnamese.
Tone must be calm and non-blaming.
Indicators must not block normal study flow by default.

Future UI must pair any color state with a visible Vietnamese text label and accessible name. Color may support scanning but must never carry the only meaning. Short badges need full helper text in Settings or an equivalent detail surface.

Accessibility color plus text rule: color is secondary, text is required.

## Manual backup/export wording rules

Manual backup/export wording must describe a user-controlled backup file, not automatic protection. Recommended wording patterns:

- `tạo tệp sao lưu`
- `xuất bản sao để tự giữ`
- `lưu tệp ở nơi bạn tin cậy`
- `không tự đồng bộ giữa thiết bị`

Reject wording that implies automatic sync, invisible cloud recovery, guaranteed recovery, or platform backup certainty.

## Platform backup uncertainty

Platform backup is not guaranteed. Phase 23C does not verify platform backup behavior. Future implementation must keep Android native, Android TWA/PWA, iOS native, iOS PWA, desktop browser, mobile browser, and wrapper-specific data preservation as verification required until real-device evidence exists.

## What Phase 23C can claim

- Backup health design direction exists.
- Last-backup indicator states have been planned.
- Vietnamese-first backup health copy has been drafted.
- Accessibility and tone rules for backup health have been defined.

## What Phase 23C must not claim

Phase 23C must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, backup health is implemented, last-backup tracking is implemented, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Implementation prerequisites

Before implementation, Shime must define and verify:

- trusted source for last-backup timestamp meaning;
- what counts as a completed manual backup/export event;
- whether backup metadata can be validated without reading private file contents unexpectedly;
- how restore/import risk surfaces consume backup health without changing backup behavior;
- threshold research with real learners and real data-change patterns;
- Vietnamese copy comprehension and non-blaming tone;
- accessibility behavior for badges, helper copy, focus order, screen readers, and color contrast;
- platform-specific uncertainty messaging;
- regression coverage that proves no runtime storage, backup/export, or restore behavior changes unless a later phase explicitly implements them.

## Phase 23D roadmap implication

Phase 23C defines the future states and copy that Phase 23D may use when designing backup reminders and pre-risk-action friction. Phase 23D should decide when reminders appear, when risk-action friction is appropriate, and how to avoid blocking normal study flow by default.

## Guardrails

- Docs/design/static-validator/CI-only.
- No runtime UI.
- No backup health tracking.
- No last-backup tracking.
- No backup/export/restore behavior change.
- No sync, cloud, account, auth, or backend behavior.
- No platform backup verification claim.
- No ADR.

## Next recommended phase

Next recommended phase: Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc
