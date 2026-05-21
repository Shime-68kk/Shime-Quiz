# Phase 25E — Backup Health Copy and State Model Gate
## Status token
PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_STATUS: COMPLETED_COPY_STATE_MODEL_GATE

PHASE25E_BACKUP_HEALTH_COPY_STATE_MODEL_DECISION: PASS_TO_PHASE25F_RUNTIME_DESIGN_GATE_ONLY_IF_APPROVED

Phase 25D reference: PHASE25D_BACKUP_HEALTH_UX_PLANNING_STATUS: COMPLETED_UX_PLANNING_GATE
Phase 25D decision reference: PHASE25D_BACKUP_HEALTH_UX_DECISION: PASS_TO_PHASE25E_COPY_AND_STATE_MODEL_BEFORE_RUNTIME

## Scope
Phase 25E is docs/copy/static-validator/CI-only.
Phase 25E does not change runtime behavior.
Phase 25E does not implement backup health UI.
Phase 25E does not modify Phase 24E scaffold behavior.
Phase 25E does not implement production adapter-aware backup/export/restore.
Production backup/export/restore behavior remains unchanged by this patch.
Backup file format remains unchanged.
Restore overwrite behavior remains unchanged.
Current localStorage backup compatibility remains unchanged.
Default storage driver remains unchanged.
No IndexedDB.
No storage migration.
No sync/cloud/account/auth/backend.
No BETA_READY.
Historical full-chain validators remain manual/local/scheduled audit guidance.
Full historical scripts/validate-*.js chain is not used as a Phase 25E merge-blocking requirement.

## Inputs
- Phase 25D Backup Health UX Planning.
- Existing local-first backup/export/restore guardrails.
- Phase 25E master task constraints.

## Purpose
Refine future-only Backup Health wording into named states, microcopy, copy boundaries, and evidence gates before any runtime design or implementation is approved.

## Copy principles
- Backup health copy must describe uncertainty honestly and must not imply Shime Quiz has automatic backup, cloud sync, account recovery, platform backup preservation, or guaranteed data-loss prevention.
- Copy must treat backup files as user-owned files that learners create, store, and restore manually.
- Copy must say only what future generated/test data evidence and browser/manual smoke evidence can support.
- Copy must remain reversible because Phase 25E changes no runtime behavior.

## Future-only backup health state model
These states are future-only copy and state-model definitions. They are not runtime UI, not storage logic, and not approval for production adapter-aware backup/export/restore.

## State microcopy table
| State name | User-facing meaning | Primary microcopy | Secondary microcopy | Allowed action label | Allowed copy | Forbidden copy | Evidence required before runtime implementation | Telemetry/analytics boundary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Unknown backup status | The app cannot determine whether a manual backup has been recorded. | Trạng thái sao lưu chưa xác định. | Bạn có thể tạo một tệp sao lưu thủ công để tự lưu giữ dữ liệu học. | Create manual backup | Say backup status is unknown and suggest a user-owned manual backup file. | Must not say automatic backup is active, data is protected, or Shime Quiz monitors private data. | Separate runtime design gate, file ownership, rollback/removal plan, copy review, generated/test data evidence, manual/browser smoke plan, current-phase validator, strict reviewer, and tester evidence if manual/browser behavior is claimed. | none |
| No backup recorded in this browser | No approved local marker says this browser has recorded a manual backup event. | Chưa ghi nhận sao lưu thủ công trong trình duyệt này. | Nếu bạn đã lưu tệp ở nơi khác, hãy tiếp tục giữ tệp đó ở nơi bạn kiểm soát. | Create backup file | Say no manual backup is recorded in this browser and the user can create a user-owned backup file. | Must not say no backup exists anywhere, account recovery can restore data, or data loss is guaranteed. | Separate runtime design gate, approved marker design, file ownership, generated/test data evidence, browser/manual smoke evidence, rollback/removal plan, current-phase validator, and strict reviewer. | none |
| Recent manual backup recorded | A future approved local marker may show a manual backup action happened recently in this browser. | Đã ghi nhận sao lưu thủ công gần đây trong trình duyệt này. | Hãy giữ tệp sao lưu ở nơi bạn kiểm soát, bên ngoài dữ liệu trình duyệt. | Make another backup | Say a recent manual backup was recorded in this browser and remind users to keep the file. | Must not say latest data is guaranteed safe, cloud sync is enabled, or platform backup preservation is active. | Separate runtime design gate, timestamp/source evidence, file ownership, copy review, generated/test data evidence, browser/manual smoke evidence, current-phase validator, and strict reviewer. | none |
| Backup may be stale | A future approved local marker may show the last recorded manual backup is older than the accepted reminder window. | Sao lưu thủ công gần nhất có thể đã cũ. | Bạn có thể tạo tệp sao lưu mới nếu đã học thêm hoặc chỉnh sửa dữ liệu. | Refresh backup | Say the recorded manual backup may be stale and calmly suggest a new user-owned backup file. | Must not say the backup is invalid, data loss is likely, or guaranteed data-loss prevention exists. | Separate runtime design gate, stale-window approval, file ownership, rollback/removal plan, generated/test data evidence, browser/manual smoke evidence, copy review, and tester evidence if manual/browser behavior is claimed. | none |
| Restore recently verified on generated/test data | Future evidence may show restore behavior was checked using generated/test data, not real learner data. | Khôi phục đã được kiểm tra gần đây bằng dữ liệu tạo thử. | Kiểm tra này không phải là bảo đảm cho mọi tệp hoặc mọi dữ liệu học thật. | View restore guidance | Say restore verification is limited to generated/test data. | Must not say restore is guaranteed for all production data or production adapter-aware backup/export/restore is approved. | Separate runtime design gate, generated/test data evidence, browser/manual smoke evidence, no production backup/restore behavior changes unless separately approved, file ownership, current-phase validator, and strict reviewer. | none |
| Backup status unavailable | The app cannot display or evaluate backup status in the current context. | Hiện chưa thể hiển thị trạng thái sao lưu. | Nếu tính năng xuất dữ liệu vẫn khả dụng, bạn vẫn có thể tạo tệp sao lưu thủ công. | Try manual backup | Say backup status is unavailable and manual backup may still be available through approved export behavior. | Must not say Shime Quiz can recover account data, monitors private data, or preserves data through the platform. | Separate runtime design gate, unavailable-state design, file ownership, generated/test data evidence, browser/manual smoke evidence, rollback/removal plan, copy review, current-phase validator, and strict reviewer. | none |

## Safe copy examples
- Manual backup reminder: "Bạn có thể tạo tệp sao lưu thủ công sau khi học hoặc chỉnh sửa dữ liệu quan trọng."
- Local-first explanation: "Shime Quiz lưu dữ liệu học trong trình duyệt/thiết bị này theo hướng local-first."
- Browser storage can be cleared warning: "Dữ liệu trong trình duyệt có thể bị xóa bởi bạn, trình duyệt, hệ điều hành, hoặc khi đặt lại thiết bị."
- User-owned backup file explanation: "Tệp sao lưu là tệp do bạn tạo và tự lưu giữ ở nơi bạn kiểm soát."
- Restore verification limited to generated/test data: "Bằng chứng khôi phục chỉ áp dụng cho dữ liệu tạo thử hoặc dữ liệu kiểm thử đã nêu."
- Backup status unknown: "Trạng thái sao lưu chưa xác định; bạn có thể tạo tệp sao lưu thủ công."
- Backup status unavailable: "Hiện chưa thể hiển thị trạng thái sao lưu; việc xuất thủ công vẫn phụ thuộc vào luồng đã được phê duyệt."

## Forbidden copy examples
- Forbidden Automatic backup: "Shime Quiz tự động sao lưu dữ liệu của bạn."
- Forbidden Cloud sync: "Dữ liệu đã được đồng bộ lên đám mây."
- Forbidden Account recovery: "Đăng nhập tài khoản để khôi phục dữ liệu học."
- Forbidden Platform backup preservation: "Nền tảng sẽ giữ lại bản sao lưu cho bạn."
- Forbidden Guaranteed data-loss prevention: "Bạn sẽ không mất dữ liệu."
- Forbidden Production adapter-aware backup/export/restore: "Backup/export/restore production adapter-aware đã được phê duyệt."
- Forbidden BETA_READY: "BETA_READY."

## Copy tone
Tone must be calm, non-alarmist, Vietnamese-first, local-first, and learner-owned.
Copy should nudge manual backup without fear.
Copy should avoid shame, urgency inflation, or guarantees.
Copy should avoid implying Shime Quiz monitors private data.

## Evidence required before runtime
Any future runtime phase must provide file ownership, rollback/removal plan, copy review, generated/test data evidence plan, manual/browser smoke plan, current-phase validator, strict reviewer, and tester evidence if manual/browser behavior is claimed.

## Phase 25F gate framing
Phase 25F is not automatically approved by Phase 25E.
Phase 25F must be a separate runtime design gate if opened.
Phase 25F must not implement runtime backup health UI unless separately approved after design review.
Phase 25F must include file ownership, rollback/removal plan, copy review, generated/test data evidence plan, manual/browser smoke plan, current-phase validator, strict reviewer, and tester evidence if manual/browser behavior is claimed.

## Rollback plan
Remove docs/planning/phase25e-backup-health-copy-state-model.md.
Remove docs/release/phase25e-backup-health-copy-state-model-summary.md.
Remove scripts/validate-phase25e-backup-health-copy-state-model.js.
Remove Phase 25E CI registration.
No learner data migration or cleanup is required because Phase 25E changes no runtime behavior.

## What Phase 25E can claim
Phase 25E can claim a completed docs/copy/static-validator/CI-only copy and state model gate for future Backup Health wording and evidence boundaries.

## What Phase 25E must not claim
Phase 25E must not claim runtime backup health UI is implemented.
Phase 25E must not claim production adapter-aware backup/export/restore.
Phase 25E must not claim broad backup reliability.
Phase 25E must not claim guaranteed data-loss prevention.
Phase 25E must not claim automatic backup, cloud sync, account recovery, platform backup preservation, IndexedDB, storage migration, sync/cloud/account/auth/backend, or BETA_READY.

## Guardrails
Phase 25E preserves existing runtime behavior, backup file format, restore overwrite behavior, current localStorage backup compatibility, default storage driver, Phase 24E scaffold behavior, and production backup/export/restore behavior.

## Next recommended phase
Next recommended phase: Phase 25F — Backup Health Runtime Design Gate
Phase 25F is a separate runtime design gate and is not automatically approved.
Phase 25E does not approve runtime backup health UI.
Phase 25E does not approve production adapter-aware backup/export/restore.
