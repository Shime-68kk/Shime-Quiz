# Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc

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

This phase defines design direction only. It must not create reminder scheduling, backup health tracking, last-backup tracking, restore overwrite behavior, import behavior, runtime UI, or any backend behavior.

## Inputs

- Phase 22H decision: `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_BROADER_ACTUAL_EVIDENCE_STILL_LIMITED`.
- Phase 23A research: uninstall, device loss, clear-site-data, private/incognito, browser switch, storage pressure/quota eviction, and platform backup behavior remain data-survival risks or verification-required areas.
- Phase 23B UX/copy direction: Vietnamese-first data-survival copy should be calm, plain-language, and explicit that user-controlled backup files are not automatic protection.
- Phase 23C backup health direction: future states are `NO_BACKUP_YET`, `FRESH_BACKUP`, `AGING_BACKUP`, `STALE_BACKUP`, and `UNKNOWN_BACKUP_STATE`.

## Product stance

Backup reminder purpose is to help learners remember to create and keep a user-controlled backup file before local data becomes hard to recover. Local-first must not push data-loss risk onto users silently.

Reminders are a communication layer, not a recovery guarantee. Manual backup/export is not sync. Platform backup is not guaranteed. A reminder can say that creating a backup file is recommended; it must not say that Shime can prevent every data-loss scenario.

Normal study flow should stay available. The never-block-normal-study principle means routine review, quiz taking, and browsing should not be blocked by default. Pre-risk-action prompts may add friction only before risky actions such as restore overwrite, large import, destructive local-data action, manual transfer to another device, or an unknown backup state before risky action.

## Reminder design principles

Backup reminder cadence direction should be state-based and calm:

- `NO_BACKUP_YET`: show an early gentle nudge after meaningful learning data exists, then a more visible reminder on data-protection surfaces.
- `FRESH_BACKUP`: no recurring reminder by default; keep a quiet status available where backup health is shown.
- `AGING_BACKUP`: use a gentle reminder that suggests refreshing the backup when convenient.
- `STALE_BACKUP`: use a visible or persistent non-blocking reminder, especially near data-protection surfaces.
- `UNKNOWN_BACKUP_STATE`: explain uncertainty and invite the learner to create a new backup file before risky actions.

Reminder escalation without panic should move from quiet helper copy, to visible reminder, to persistent non-blocking reminder only when the design has enough backup health evidence to justify the increase. Escalation must never imply blame.

Snooze or dismiss direction: future UI may offer a short snooze or dismissal for normal study flow. Dismissal should not hide pre-risk-action prompts before restore overwrite, large import, manual transfer, destructive local-data action, or unknown backup state before risky action.

Explicit coverage terms: gentle reminder state, visible reminder state, persistent non-blocking reminder state, relationship to NO_BACKUP_YET, relationship to FRESH_BACKUP, relationship to AGING_BACKUP, relationship to STALE_BACKUP, relationship to UNKNOWN_BACKUP_STATE, pre-risk-action friction principles, never-block-normal-study principle, and non-blaming recovery tone.

## Reminder states

| State | Trigger direction | Product meaning | Suggested Vietnamese label | Suggested helper copy | Recommended tone | Blocking or non-blocking | What not to imply |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `NO_REMINDER_NEEDED` | Future backup health is `FRESH_BACKUP` or the learner is not near a risky action. | Shime has no reason to interrupt the learner with backup reminder copy. | `Không cần nhắc lúc này` | `Bạn có thể tiếp tục học. Khi cần, hãy giữ tệp sao lưu ở nơi bạn tin cậy.` | Quiet, respectful. | Non-blocking. | Must not imply backup/export is automatic protection or that platform backup is guaranteed. |
| `GENTLE_BACKUP_NUDGE` | Future state is `NO_BACKUP_YET` after meaningful content exists, or `AGING_BACKUP` when a light reminder is enough. | A calm backup reminder invites the learner to create or refresh a user-controlled backup file. | `Nhắc nhẹ sao lưu` | `Bạn đã có dữ liệu học quan trọng. Khi rảnh, hãy tạo tệp sao lưu để tự giữ.` | Calm, optional, non-blaming. | Non-blocking. | Must not imply danger is immediate or that backup reminder is implemented in Phase 23D. |
| `VISIBLE_BACKUP_REMINDER` | Future state is `STALE_BACKUP`, repeated `NO_BACKUP_YET`, or backup health appears on Settings Bảo vệ dữ liệu. | The learner should clearly notice that creating a backup file is recommended. | `Nên tạo bản sao lưu` | `Bản sao lưu có thể chưa bao gồm thay đổi mới. Hãy tạo tệp sao lưu mới khi bạn có thể.` | Clear, steady, not alarming. | Non-blocking for normal study. | Must not imply guaranteed data-loss prevention. |
| `PERSISTENT_NON_BLOCKING_REMINDER` | Future state remains `STALE_BACKUP` across data-protection visits or before repeated higher-risk flows. | A visible reminder can persist without preventing study. | `Sao lưu đã cũ` | `Bạn vẫn có thể học tiếp. Trước khi thao tác rủi ro, hãy tạo tệp sao lưu mới.` | Firm but calm, practical. | Non-blocking for normal study; may pair with pre-risk friction before risky actions. | Must not imply the learner caused a problem or that study is unsafe by itself. |
| `PRE_RISK_ACTION_PROMPT` | Before restore overwrite, large import, manual transfer to another device, destructive local-data action, or other risky local-data action. | Shime should add friction so the learner can back up before proceeding. | `Sao lưu trước khi tiếp tục` | `Thao tác này có thể ảnh hưởng dữ liệu học trên thiết bị này. Hãy tạo tệp sao lưu nếu bạn muốn giữ bản hiện tại.` | Direct, careful, learner-owned. | Blocking only for the risky confirmation step; never blocking normal study. | Must not imply restore/import behavior changed in Phase 23D or that backup/export/restore is adapter-aware. |
| `UNKNOWN_BACKUP_STATUS_PROMPT` | Future backup health is `UNKNOWN_BACKUP_STATE`, especially before risky action. | Shime cannot confidently explain backup status, so the learner should be offered a backup-first path. | `Chưa rõ trạng thái sao lưu` | `Shime chưa xác định chắc bạn có bản sao lưu mới hay chưa. Trước thao tác này, bạn nên tạo tệp sao lưu mới.` | Transparent, non-technical, non-blaming. | Blocking only for the risky confirmation step; non-blocking elsewhere. | Must not imply platform backup will preserve user data or that unknown means data is already lost. |

## Pre-risk-action friction surfaces

Restore overwrite prompt direction: before restore overwrite, future UI should explain that restoring can replace current local learning data. The copy should recommend creating a backup file of the current device first.

Large import backup-before-action prompt direction: before large import, future UI should recommend a manual backup/export of the current local data because large imports can change many questions, decks, or study records.

Manual transfer or device switch prompt direction: before manual transfer to another device, future UI should explain that the learner needs a user-controlled backup file and should verify the restored data on the target device before relying on it.

Clear-data or uninstall education direction: educational copy should state that clearing site data, uninstalling, private/incognito use, device loss, or browser switch can remove or strand local data. It must keep platform-specific behavior as verification required.

Destructive-action warning direction: before deleting local learning data, resetting a library, overwriting with restore, or other destructive local-data action, future UI should add a confirmation step that recommends backup first.

After detecting no backup yet: use `GENTLE_BACKUP_NUDGE` first and `VISIBLE_BACKUP_REMINDER` on data-protection surfaces. Do not block normal study.

After detecting stale backup: use `VISIBLE_BACKUP_REMINDER` or `PERSISTENT_NON_BLOCKING_REMINDER`; add `PRE_RISK_ACTION_PROMPT` before restore overwrite, large import, manual transfer, or destructive local-data action.

Unknown backup state before risky action: use `UNKNOWN_BACKUP_STATUS_PROMPT` and explain uncertainty plainly.

Surface coverage terms: before destructive local-data action, after detecting no backup yet, after detecting stale backup, and unknown backup state before risky action.

## Vietnamese copy examples

1. Gentle backup nudge: `Bạn đã có dữ liệu học quan trọng. Khi rảnh, hãy tạo tệp sao lưu để tự giữ.`
2. Visible backup reminder: `Nên tạo bản sao lưu mới để dữ liệu học gần đây có trong tệp bạn giữ.`
3. Persistent non-blocking stale-backup reminder: `Bản sao lưu có thể đã cũ. Bạn vẫn có thể học tiếp, nhưng nên sao lưu lại trước thao tác rủi ro.`
4. Pre-restore backup prompt: `Trước khi khôi phục, bạn có muốn tạo tệp sao lưu cho dữ liệu hiện tại trên thiết bị này không?`
5. Restore overwrite confirmation: `Khôi phục có thể thay thế dữ liệu học hiện tại trên thiết bị này. Hãy chỉ tiếp tục khi bạn đã giữ bản cần giữ.`
6. Large import backup-before-action prompt: `Lần nhập này có thể thay đổi nhiều dữ liệu học. Hãy tạo tệp sao lưu hiện tại trước khi tiếp tục nếu bạn muốn có đường quay lại.`
7. Manual transfer backup reminder: `Để chuyển sang thiết bị khác, hãy xuất tệp sao lưu, lưu ở nơi bạn tin cậy, rồi khôi phục trên thiết bị mới.`
8. Unknown backup status before risky action: `Shime chưa xác định chắc trạng thái sao lưu. Trước thao tác này, bạn nên tạo tệp sao lưu mới.`
9. Non-blaming recovery message after missing backup: `Shime không tìm thấy tệp sao lưu để khôi phục. Nếu bạn còn bản sao ở nơi khác, hãy chọn tệp đó; nếu không, Shime sẽ hướng dẫn các bước còn lại mà không đổ lỗi cho bạn.`
10. Dismiss/snooze helper copy: `Bạn có thể nhắc lại sau. Shime sẽ không chặn việc học bình thường, nhưng vẫn có thể nhắc trước thao tác rủi ro.`

## Tone and UX rules

Reminder copy must be calm and non-blaming.
Reminder copy must be Vietnamese-first.
Reminder copy must not create panic.
Normal study flow must not be blocked by default.
Pre-risk-action prompts may add friction only before risky actions.
Manual backup/export must never be called sync.
Platform backup must never be implied as guaranteed.
Backup reminders must not claim to prevent all data loss.

## Manual backup/export wording rules

Use `tạo tệp sao lưu`, `xuất bản sao để tự giữ`, `lưu tệp ở nơi bạn tin cậy`, and `khôi phục từ tệp sao lưu bạn chọn`.

Do not use wording that makes manual backup/export sound automatic. Manual backup/export is not sync. It is a learner-controlled file action that needs clear storage guidance and future evidence-run comprehension testing.

## Platform backup uncertainty

Platform backup is not guaranteed. Phase 23D does not verify platform backup behavior. Copy should say platform-specific preservation is uncertain until separately verified, especially for native wrappers, PWA/TWA behavior, uninstall, device replacement, browser clear-site-data, and storage pressure.

## What Phase 23D can claim

- Backup reminder design direction exists.
- Pre-risk-action friction design direction exists.
- Vietnamese-first reminder copy has been drafted.
- Non-blocking reminder principles have been defined.

## What Phase 23D must not claim

Phase 23D must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, backup reminder is implemented, pre-risk-action friction is implemented, backup health tracking is implemented, last-backup tracking is implemented, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Implementation prerequisites

Before any runtime work, Shime needs separate implementation planning and evidence for:

- Backup health and last-backup tracking semantics that match Phase 23C.
- Reminder scheduling rules, snooze/dismiss persistence, and accessibility behavior.
- Restore overwrite and large import confirmation flows that preserve learner control.
- Manual transfer/device switch education that has been comprehension-tested.
- Platform backup verification evidence instead of assumptions.
- Static and runtime tests that prove normal study remains non-blocking.

## Phase 23E roadmap implication

Phase 23E should test whether learners understand local data survival, manual backup/export, stale or unknown backup status, pre-risk-action prompts, platform backup uncertainty, and non-blaming recovery copy.

## Guardrails

- Docs/design/static-validator/CI-only.
- No runtime UI implementation.
- No reminder scheduling implementation.
- No backup health tracking or last-backup tracking implementation.
- No backup/export/restore behavior change.
- No import behavior change.
- No sync, cloud, account, auth, or backend behavior.
- No platform backup preservation claim.
- No ADR.

## Next recommended phase

Next recommended phase: Phase 23E — Evidence-Run Plan for Data-Survival Comprehension
