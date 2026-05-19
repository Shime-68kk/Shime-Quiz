# Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc

## Status token

PHASE23B_DATA_SURVIVAL_UX_COPY_STATUS: COMPLETED_DOCS_ONLY

Phase 23B is a docs-only UX/copy decision gate.
Phase 23B does not implement runtime UI.
Phase 23B does not make Shime BETA_READY.
Phase 23B does not make backup/export/restore adapter-aware.
Phase 23B does not verify platform backup behavior.
Phase 23B does not add sync, cloud, account, auth, or backend behavior.

## Scope

Phase 23B turns Phase 23A data-survival research into Vietnamese-first UX copy direction for Shime data protection surfaces. It defines wording, tone, and placement direction only. It does not change runtime behavior, storage behavior, backup behavior, restore behavior, import behavior, FSRS behavior, telemetry, dependencies, or application source code.

## Inputs

Phase 22H ended with `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_BROADER_ACTUAL_EVIDENCE_STILL_LIMITED`, with remaining evidence gaps for second physical device transfer, real storage exhaustion, cross-browser coverage, PWA/offline behavior, real mobile file picker behavior, long-duration endurance, and broad external real-user evidence.

Phase 23A completed `PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY` and identified uninstall, device loss, clear-site-data, private/incognito, browser switch, storage pressure, PWA/TWA/native-wrapper uncertainty, user expectation, backup health, reminder, and pre-risk-action friction risks. Platform-specific backup behavior remains verification required.

## Product stance

Shime should explain local-first data ownership without making the learner carry hidden data-loss risk alone. The product stance is Vietnamese-first, calm, learner-owned, and data-respectful: Shime keeps learning data on the learner's device by default, and Shime should actively guide the learner to create user-controlled backup files before risky actions.

Copy should describe backup/export as a manual file action controlled by the learner. It must not describe manual backup/export as sync, cloud sync, account backup, or platform-guaranteed recovery.

## UX surfaces

- onboarding where-your-data-lives panel: explain early that learning data lives on this device/browser and that a backup file is the learner-controlled way to keep a copy.
- first meaningful content backup nudge: after the learner has created meaningful quiz or progress data, suggest making the first backup without interrupting study flow.
- Settings Bảo vệ dữ liệu surface: provide a dedicated Vietnamese-first area for backup status, backup/export action wording, restore/import warning copy, and manual transfer guidance.
- backup health language: show whether the latest known backup is fresh, stale, or absent using calm labels and dates where available.
- backup reminder language: remind when the backup becomes old, with action-oriented wording and no blame.
- pre-risk-action friction: before risky actions such as restore, overwrite, large import, clearing local data, or moving devices, ask the learner to confirm they have a backup file.
- restore overwrite warning: state that restore may replace current local learning data and recommend backing up current data first.
- large import backup-before-action warning: before large import, recommend making a backup because import may add many items or change the current library.
- manual backup/export wording: call the action `Sao lưu ra tệp` or `Xuất tệp sao lưu`, not sync.
- manual transfer wording: describe device transfer as creating a backup file on the old device and importing/restoring that file on the new device.
- user-controlled backup file wording: emphasize that the backup file is a copy the learner keeps in a location they choose.
- platform backup verification-required wording: explain that phone, browser, app, and operating-system backup behavior can differ and has not been verified by Phase 23B.

## Vietnamese copy library

1. Onboarding / where data lives: `Dữ liệu học của bạn được lưu trên thiết bị và trình duyệt này. Để giữ một bản sao do bạn kiểm soát, hãy tạo tệp sao lưu định kỳ.`
2. First backup nudge after meaningful content exists: `Bạn đã có nội dung học quan trọng. Nên tạo tệp sao lưu đầu tiên để có một bản sao riêng trước khi tiếp tục.`
3. Backup health fresh state: `Bản sao lưu gần đây: vẫn còn mới. Bạn đang có một tệp sao lưu gần thời điểm hiện tại.`
4. Backup health stale state: `Bản sao lưu đã cũ. Nên tạo tệp sao lưu mới để bản sao phản ánh tiến độ học gần đây hơn.`
5. No backup yet state: `Chưa ghi nhận tệp sao lưu nào. Khi đã có dữ liệu học quan trọng, hãy xuất một tệp sao lưu để tự giữ bản sao.`
6. Reminder after backup becomes old: `Đã lâu bạn chưa tạo tệp sao lưu. Hãy xuất một bản mới khi thuận tiện, nhất là trước khi đổi máy, cài lại ứng dụng, hoặc dọn dữ liệu trình duyệt.`
7. Pre-restore backup prompt: `Trước khi khôi phục, bạn nên sao lưu dữ liệu hiện tại ra tệp. Bước này giúp bạn giữ một bản sao nếu cần quay lại.`
8. Restore overwrite confirmation: `Khôi phục có thể thay thế dữ liệu học hiện có trên thiết bị này. Chỉ tiếp tục khi bạn đã hiểu rủi ro và đã cân nhắc tạo tệp sao lưu hiện tại.`
9. Large import backup recommendation: `Tệp nhập này có thể thêm hoặc thay đổi nhiều nội dung. Nên tạo tệp sao lưu trước khi nhập để giữ bản sao trạng thái hiện tại.`
10. Manual transfer explanation: `Để chuyển dữ liệu thủ công sang thiết bị khác, hãy xuất tệp sao lưu ở thiết bị cũ, lưu tệp ở nơi bạn chọn, rồi khôi phục tệp đó trên thiết bị mới.`
11. Platform backup uncertainty explanation: `Sao lưu của điện thoại, hệ điều hành, trình duyệt hoặc cửa hàng ứng dụng có thể hoạt động khác nhau. Shime chưa xác minh rằng các cơ chế đó luôn giữ lại dữ liệu học.`
12. Non-blaming recovery tone: `Nếu bạn không còn thấy dữ liệu, hãy kiểm tra xem bạn có tệp sao lưu gần đây không. Shime sẽ hướng dẫn bạn khôi phục từ tệp đó nếu có.`

## Tone rules

- calm
- non-blaming
- Vietnamese-first
- plain-language
- not panic-inducing
- no jargon unless explained
- never call manual backup/export sync
- never imply platform backup is guaranteed
- never imply backup prevents all data loss

## Manual backup/export wording rules

Use Vietnamese-first labels such as `Sao lưu ra tệp`, `Xuất tệp sao lưu`, `Tạo tệp sao lưu`, and `Khôi phục từ tệp sao lưu`.

Do not use sync wording for manual backup/export. The backup/export copy must make clear that the learner creates, stores, and moves a file they control. If English is useful, explain it in Vietnamese, for example: `tệp sao lưu (backup file)`.

Manual transfer wording should describe a deliberate file handoff: export the backup file from the old device, store it somewhere the learner chooses, then restore from that file on the new device. It must not imply automatic cross-device transfer.

## Platform backup uncertainty wording

Platform backup uncertainty should be explicit but calm: platform behavior is verification required. Copy may say that phone, browser, operating-system, PWA/TWA, or app-store backup behavior can vary and has not been verified here. It must not imply that uninstall, reinstall, device replacement, or platform backup will preserve learning data.

## Forbidden wording patterns

The decision explicitly rejects these unsafe wording patterns:

- `Your data is always safe.` is rejected because it overpromises.
- `Backup prevents data loss.` is rejected because backup reduces risk but cannot guarantee prevention.
- `Sync your backup.` is rejected because manual backup/export is not sync.
- `Platform backup will restore your data.` is rejected because platform behavior is verification required.
- `Delete/reinstall anytime.` is rejected because uninstall and reinstall behavior is not guaranteed safe.
- `BETA_READY.` is rejected because Phase 23B does not change beta readiness.
- `Cloud sync.` is rejected because Phase 23B does not add cloud sync behavior.

## What Phase 23B can claim

- Vietnamese-first data-survival UX copy direction exists.
- Backup and restore risk copy has been planned.
- Manual backup/export wording rules have been defined.
- User-controlled backup file copy direction has been defined.

## What Phase 23B must not claim

Phase 23B must not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Phase 23C roadmap implication

Phase 23C should design the backup health and last-backup indicator surface using this Vietnamese-first copy direction, including fresh, stale, and no-backup states. Phase 23B does not start Phase 23C implementation or design details beyond this implication.

## Guardrails

Phase 23B is docs/UX-copy/static-validator/CI-only. It preserves the HOLD context from Phase 22H, keeps Phase 23A platform behavior as verification required, and avoids runtime UI implementation. It does not add sync, cloud, account, auth, backend, adapter-aware backup/export, adapter-aware restore, or platform backup verification.

Tone guardrails: calm, non-blaming, Vietnamese-first, plain-language, not panic-inducing.

## Next recommended phase

Next recommended phase: Phase 23C — Backup Health / Last-Backup Indicator Design Doc
