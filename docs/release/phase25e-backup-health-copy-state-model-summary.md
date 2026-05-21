# Phase 25E — Backup Health Copy and State Model Summary
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

## Copy/state model summary
Phase 25E refines future-only Backup Health copy into six state names: Unknown backup status, No backup recorded in this browser, Recent manual backup recorded, Backup may be stale, Restore recently verified on generated/test data, and Backup status unavailable.

Each future state defines state name, user-facing meaning, primary microcopy, secondary microcopy, allowed action label, allowed copy, forbidden copy, evidence required before runtime implementation, and Telemetry/analytics boundary: none.

State copy remains Vietnamese-first, local-first, learner-owned, and limited to manual backup reminders, user-owned backup files, browser storage uncertainty, and generated/test data restore evidence.

## Safe copy boundaries
Safe copy examples:
- Manual backup reminder: "Bạn có thể tạo tệp sao lưu thủ công sau khi học hoặc chỉnh sửa dữ liệu quan trọng."
- Local-first explanation: "Shime Quiz lưu dữ liệu học trong trình duyệt/thiết bị này theo hướng local-first."
- Browser storage can be cleared warning: "Dữ liệu trong trình duyệt có thể bị xóa bởi bạn, trình duyệt, hệ điều hành, hoặc khi đặt lại thiết bị."
- User-owned backup file explanation: "Tệp sao lưu là tệp do bạn tạo và tự lưu giữ ở nơi bạn kiểm soát."
- Restore verification limited to generated/test data: "Bằng chứng khôi phục chỉ áp dụng cho dữ liệu tạo thử hoặc dữ liệu kiểm thử đã nêu."
- Backup status unknown: "Trạng thái sao lưu chưa xác định; bạn có thể tạo tệp sao lưu thủ công."
- Backup status unavailable: "Hiện chưa thể hiển thị trạng thái sao lưu; việc xuất thủ công vẫn phụ thuộc vào luồng đã được phê duyệt."

Forbidden copy examples:
- Forbidden Automatic backup: "Shime Quiz tự động sao lưu dữ liệu của bạn."
- Forbidden Cloud sync: "Dữ liệu đã được đồng bộ lên đám mây."
- Forbidden Account recovery: "Đăng nhập tài khoản để khôi phục dữ liệu học."
- Forbidden Platform backup preservation: "Nền tảng sẽ giữ lại bản sao lưu cho bạn."
- Forbidden Guaranteed data-loss prevention: "Bạn sẽ không mất dữ liệu."
- Forbidden Production adapter-aware backup/export/restore: "Backup/export/restore production adapter-aware đã được phê duyệt."
- Forbidden BETA_READY: "BETA_READY."

Tone must be calm, non-alarmist, Vietnamese-first, local-first, and learner-owned.
Copy should nudge manual backup without fear.
Copy should avoid shame, urgency inflation, or guarantees.
Copy should avoid implying Shime Quiz monitors private data.

## Phase 25F gate framing
Phase 25F is not automatically approved by Phase 25E.
Phase 25F must be a separate runtime design gate if opened.
Phase 25F must not implement runtime backup health UI unless separately approved after design review.
Phase 25F must include file ownership, rollback/removal plan, copy review, generated/test data evidence plan, manual/browser smoke plan, current-phase validator, strict reviewer, and tester evidence if manual/browser behavior is claimed.

## Validation summary
Phase 25E adds a current-phase static validator and CI registration. The validator checks required files, required headings, status and decision tokens, Phase 25D references, required guardrail statements, copy examples, future-only state names, state fields, Phase 25F gate framing, rollback plan, workflow registration, forbidden positive claims, historical validator boundaries, and exact changed-file allowlist.

## Rollback plan
Remove docs/planning/phase25e-backup-health-copy-state-model.md.
Remove docs/release/phase25e-backup-health-copy-state-model-summary.md.
Remove scripts/validate-phase25e-backup-health-copy-state-model.js.
Remove Phase 25E CI registration.
No learner data migration or cleanup is required because Phase 25E changes no runtime behavior.

## Guardrails
Phase 25E must not claim runtime backup health UI is implemented.
Phase 25E must not claim production adapter-aware backup/export/restore.
Phase 25E must not claim broad backup reliability.
Phase 25E must not claim guaranteed data-loss prevention.
Phase 25E preserves existing runtime behavior, backup file format, restore overwrite behavior, current localStorage backup compatibility, default storage driver, Phase 24E scaffold behavior, and production backup/export/restore behavior.

## Next recommended phase
Next recommended phase: Phase 25F — Backup Health Runtime Design Gate
Phase 25F is a separate runtime design gate and is not automatically approved.
Phase 25E does not approve runtime backup health UI.
Phase 25E does not approve production adapter-aware backup/export/restore.
