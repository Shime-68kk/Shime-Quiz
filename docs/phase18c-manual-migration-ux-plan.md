# Phase 18C — Manual Migration UX Plan

## Purpose

This document defines the manual migration UX plan for a future phase in which users may optionally move their study data from localStorage to IndexedDB-backed storage.

Phase 18C is **docs/static-validator/CI-only**. It does not implement any UI, runtime migration logic, storage changes, or backup/export behavior changes. Its purpose is to plan user-facing requirements, copy direction, warning flows, and recovery paths so that future phases can implement them safely and honestly.

## Relationship to Phase 18B backup/export audit

Phase 18B confirmed the following production baseline before any migration planning began:

- localStorage is the canonical production source of truth.
- Production backup/export/restore behavior is unchanged from pre-Phase-17 behavior.
- backup/export is not adapter-aware.
- restore is not adapter-aware.
- No production IndexedDBAdapter exists.
- No production registry switch exists.
- No live migration exists.
- No real data movement has occurred.
- No localStorage deletion has occurred.

Phase 18C builds on that audit by converting it into a UX requirements plan. Every UX claim in this document presupposes the Phase 18B baseline. If any of those baseline conditions change before Phase 18D begins, this plan must be re-audited.

## Current production baseline

As of Phase 18C:

- **Production UI behavior is unchanged.** The user sees the same UI as before Phase 17.
- **No UI copy is shipped in Phase 18C.** No migration strings appear in the application.
- **No Settings toggle is added.** There is no user-accessible migration trigger.
- **Production backup/export behavior is unchanged.** Export produces the same JSON format, covering the same localStorage keys as before.
- **localStorage remains the canonical production source of truth.** All reads and writes use localStorage.
- **backup/export is not adapter-aware.** It does not read from IndexedDB.
- **restore is not adapter-aware.** It does not write to IndexedDB.
- **Phase 18C does not implement migration.** No data movement occurs.
- **Phase 18C does not move real data.** No key migration runs in production or test-fixture mode against real user data.
- **Phase 18C does not delete localStorage.** No localStorage key is removed.
- **Phase 18C does not implement production IndexedDBAdapter.** The adapter exists only as a test-only prototype (Phase 18A).
- **Phase 18C does not switch the production storage registry.** The registry remains localStorage-only.

## User trust principles

Any future migration flow must be designed around the following trust principles:

1. **Explicit consent.** Migration must be user-initiated. No automatic migration occurs at app boot, on upgrade, or on any background trigger.
2. **Backup before change.** The user must create and confirm a backup before migration begins. The app must not proceed past this gate without confirmation.
3. **Honest limitation disclosure.** The app must tell the user clearly what is and is not covered by the backup, and that backup does not guarantee zero data loss.
4. **Cancel at any safe point.** The user must be able to cancel migration before it starts. Once migration begins, the app must communicate clearly whether it is safe to cancel.
5. **Recovery path exists.** The app must provide a restore path. It must not imply that restore is always sufficient or that data loss is impossible.
6. **No silent deletion.** Source localStorage data is never silently deleted. Users must confirm any deletion, and deletion must occur only after successful migration and post-migration verification.
7. **No cloud/sync/account/auth implication.** Migration is a local-only operation. No data is sent to any server, sync service, or account backend.
8. **Transparent failure.** If migration fails, the app must say so clearly and point the user to the restore path. It must not pretend partial success is full success.

## Manual migration flow concept

This section describes the intended UX flow for a future migration phase. It is a planning document, not an implementation specification.

### Conceptual flow stages

1. **Discovery / Opt-in**
   - A user-visible prompt or Settings entry informs the user that an optional local migration to IndexedDB is available.
   - Copy must make clear this is optional, local-only, and experimental for the internal pilot phase.
   - No auto-trigger. User must navigate to the migration flow intentionally.

2. **Pre-migration information screen**
   - Explains what migration does (moves study data from localStorage to IndexedDB).
   - Explains what it does not do (cloud sync, account creation, backup guarantee).
   - Discloses backup coverage limitations.
   - Provides a link or button to create a backup before proceeding.

3. **Backup confirmation gate**
   - User must create a backup and confirm they have downloaded it.
   - App must not proceed to migration without this confirmation.
   - If the user skips or closes the backup step, migration must not proceed.

4. **Browser capability check**
   - App checks IndexedDB availability and estimated quota.
   - If IndexedDB is unavailable, the flow stops and the user is informed (see Unsupported browser section).
   - If quota is likely insufficient, the user is warned before migration starts.

5. **Cancel-before-start confirmation**
   - A final confirmation screen summarizes what will happen.
   - User can cancel at this point with no data changed.

6. **Migration execution**
   - Keys are copied one at a time to IndexedDB.
   - Progress is visible to the user.
   - The app must not delete localStorage keys during this stage.

7. **Post-migration verification**
   - App reads back migrated keys and compares them to the localStorage originals.
   - User is shown a verification summary.
   - If verification fails, migration is treated as failed and the rollback path is offered.

8. **Source data retention / deletion decision**
   - After successful verification, the user is asked whether to keep or delete localStorage source data.
   - The default must be to keep source data.
   - Deletion must be a separate, explicit user action with its own confirmation.

9. **Completion summary**
   - Confirms which keys were migrated and verified.
   - Reminds the user that localStorage remains readable until production read surface is updated in a future phase.

## Required user-facing warnings for future phases

The following warnings must appear in the migration UX at the appropriate stage. These are planning requirements, not runtime strings.

- **Migration is optional and manual.** The user is not required to migrate. localStorage continues to work.
- **Backup before migration is required.** The app will not proceed without a confirmed backup.
- **Backup coverage has limitations.** The export covers a defined set of keys. Keys that are not covered by export may not be recoverable.
- **Migration cannot guarantee zero data loss.** Hardware failure, browser crash, or quota exhaustion during migration may result in partial or total data loss.
- **Cancel is available before migration starts.** Once migration begins, cancel may not be possible without leaving data in an intermediate state.
- **Interrupted migration.** If migration is interrupted, the user is informed of the last successfully migrated key and offered the restore recovery path.
- **Rollback path.** If migration fails or verification fails, the user is directed to restore from their backup. LocalStorage source data is retained until user explicitly deletes it.
- **Post-migration verification is mandatory.** Migration is not considered complete until key-level verification passes.
- **localStorage canonical.** localStorage remains canonical until a future explicit gate. The app reads from localStorage in production. IndexedDB is not the read source after Phase 18D.
- **No automatic migration at app boot.** The app never migrates data on startup without user action.
- **No silent deletion.** localStorage keys are never deleted without explicit user confirmation after successful migration and verification.
- **No cloud, sync, or account involvement.** Migration is entirely local. No data leaves the device.

## Backup-before-migration UX requirements

These requirements govern the backup gate that must precede any migration attempt.

- The backup step must appear before any migration UI that allows the user to start data movement.
- The app must use the existing export mechanism (v2 backup JSON) to produce the backup file.
- The app must inform the user of backup coverage limitations: which key families are covered, and which may not be recoverable from the export.
- The app must prompt the user to save the file to a location they control (local disk, external drive).
- The app must present a checkbox or explicit confirmation: "I have saved my backup and understand it may not cover all data."
- The app must not proceed to migration without that confirmation being set.
- If the user cannot complete the backup (e.g., export fails), migration must be blocked and the failure surfaced.
- The backup coverage map must be accurate at the time of the migration phase. If backup/export becomes adapter-aware in a future phase, coverage disclosures must be updated accordingly.

## Restore and rollback UX requirements

These requirements govern the recovery path if migration fails or is interrupted.

- The restore path must use the existing import mechanism (v2 backup JSON restore).
- The app must tell the user clearly that restore writes back to localStorage, not to IndexedDB.
- The app must not imply that restore recovers all data in all failure scenarios. Partial migration + partial backup coverage may still result in some data loss.
- After a failed migration, the app must surface the restore option prominently, not bury it in a settings menu.
- If localStorage source data was not deleted before failure, the app must confirm to the user that their original localStorage data is still intact.
- If localStorage source data was deleted before failure was detected, the app must tell the user clearly and direct them to the backup restore path.
- Rollback means: restore from backup into localStorage, then re-verify that the app is operating from localStorage. IndexedDB data from the failed migration may be left in place or cleared, but the user must be informed of this.

## Unsupported browser and quota UX requirements

These requirements govern the flow when the target environment cannot support migration.

### Unsupported browser

- If IndexedDB is unavailable (blocked by browser settings, private browsing restrictions, or browser version), migration must not start.
- The app must inform the user why migration is unavailable.
- The app must not imply IndexedDB failure is the user's fault.
- A suggested resolution (e.g., "try in a supported browser outside private mode") may be offered but must not be presented as guaranteed to work.
- The user's localStorage data is never affected by an unsupported browser check.

### Quota / storage pressure

- Before migration starts, the app should estimate how much storage the migration will require.
- If the estimated requirement exceeds available quota or a safe threshold (e.g., 80% of quota), the user must be warned before migration starts.
- The warning must not imply the app can guarantee a safe migration at lower storage levels.
- If quota exhaustion occurs during migration, migration stops at the last successfully written key.
- The user is informed of where migration stopped and offered the rollback/restore path.
- Partial IndexedDB data from a quota-failed migration must not become the production read source.

## Vietnamese-first copy direction

This section provides copy direction for future phases. These are planning principles and draft tone guidelines, not runtime strings. Final runtime copy must be written and reviewed separately.

### Tone and voice principles

- Use calm, direct Vietnamese. Avoid urgency or alarm in non-failure states.
- Use honest hedging when discussing data safety. Never promise zero data loss.
- Use plain vocabulary. Avoid technical terms (IndexedDB, localStorage, adapter) in user-facing copy. Prefer "bộ nhớ trình duyệt mới" (new browser storage) vs. "IndexedDB".
- When describing failure, be factual and recovery-oriented. Avoid blame language.

### Draft copy direction by flow stage

**Opt-in discovery (Settings)**

Direction: Calm, optional. Emphasize that nothing changes unless the user acts.

Example direction: "Dữ liệu học của bạn hiện được lưu trong bộ nhớ trình duyệt tiêu chuẩn. Bạn có thể chuyển sang bộ nhớ nâng cao nếu muốn — việc này hoàn toàn tùy chọn và không ảnh hưởng đến dữ liệu hiện tại."

**Backup gate**

Direction: Direct, not alarmist. Explain what backup covers and what it may not cover.

Example direction: "Trước khi chuyển dữ liệu, hãy tạo một bản sao lưu. Bản sao lưu không đảm bảo phục hồi toàn bộ dữ liệu trong mọi trường hợp, nhưng là bước bảo vệ quan trọng nhất."

**Coverage limitation disclosure**

Direction: Honest, matter-of-fact. Do not minimize risk.

Example direction: "Bản sao lưu bao gồm phần lớn dữ liệu học và cài đặt. Một số dữ liệu phụ có thể không được khôi phục hoàn toàn từ bản sao lưu."

**Cancel before start**

Direction: Reassuring. User has full control.

Example direction: "Bạn có thể hủy bây giờ mà không có bất kỳ thay đổi nào được thực hiện. Nhấn 'Hủy' để quay lại."

**Unsupported browser**

Direction: Factual, non-blaming.

Example direction: "Trình duyệt của bạn hiện không hỗ trợ tính năng này. Dữ liệu của bạn không bị ảnh hưởng. Bạn có thể thử lại trong trình duyệt khác."

**Quota warning**

Direction: Advisory, not alarmist.

Example direction: "Dung lượng lưu trữ của trình duyệt có thể không đủ để hoàn thành quá trình chuyển dữ liệu. Nếu tiếp tục, quá trình có thể dừng giữa chừng."

**Migration interrupted / failed**

Direction: Clear, recovery-focused. Tell user what happened and what to do next.

Example direction: "Quá trình chuyển dữ liệu đã dừng lại. Dữ liệu gốc của bạn vẫn còn nguyên. Bạn có thể khôi phục từ bản sao lưu đã tạo trước đó."

**No cloud implication**

Direction: Explicit when relevant (e.g., in FAQ or disclosure). Never imply cloud sync.

Example direction: "Quá trình này chỉ diễn ra trong trình duyệt của bạn. Không có dữ liệu nào được gửi lên máy chủ hoặc tài khoản nào."

### Copy anti-patterns to avoid

- Do not write: "Dữ liệu của bạn sẽ được bảo vệ hoàn toàn." (Data will be fully protected.) — overclaims safety guarantee.
- Do not write: "Đồng bộ hóa với đám mây." (Sync with cloud.) — no cloud exists.
- Do not write: "Chuyển dữ liệu đã hoàn tất và an toàn." (Migration complete and safe.) — cannot guarantee safety without verification results.
- Do not write anything that implies backup/export is adapter-aware.
- Do not write anything that implies migration has shipped in production.
- Do not write anything that implies IndexedDB is the current production storage.

## What Phase 18C explicitly does not implement

- No UI migration flow is implemented.
- No migration trigger or Settings toggle is added.
- No runtime migration logic runs.
- No localStorage keys are read for migration purposes.
- No IndexedDB keys are written for migration purposes.
- No localStorage keys are deleted.
- No production IndexedDBAdapter is registered.
- No production storage registry is modified.
- No backup/export changes are made.
- No restore changes are made.
- No new dependencies are added.
- No new tests are added.
- No new fixtures are added.
- No runtime copy strings are implemented.

## Claim boundaries

### Allowed claims after Phase 18C merges

- Manual migration UX requirements are planned.
- Future migration copy must be backup-first and recovery-aware.
- Production UI behavior remains unchanged.
- Production backup/export behavior remains unchanged.
- localStorage remains the canonical production source of truth.
- Phase 18D may begin only as an internal/test-only pilot if all go criteria pass.

### Forbidden claims after Phase 18C merges

- Manual migration UI exists in the application.
- A migration toggle exists.
- Production migration has shipped.
- Production IndexedDB storage exists.
- backup/export supports IndexedDB-backed production storage.
- backup is adapter-aware.
- restore is adapter-aware.
- Data-loss prevention is guaranteed.
- Live migration is safe.
- Cloud, sync, account, auth, or backend exists.
- Public active FSRS rollout exists.
- Built-in AI or OCR exists.

## Go/no-go criteria for Phase 18D

Phase 18D is planned as: **Phase 18D — Internal / Test-Only Local Migration Pilot**

### Go criteria (all must be true)

- Phase 18B and Phase 18C are merged on main and CI is green.
- This UX plan (Phase 18C doc) references the Phase 18B backup/export audit.
- The pilot targets a single low-risk key family only, unless separately approved by the project leader.
- The pilot remains internal and test-only; no production app boot path is used.
- No user-facing toggle is added in Phase 18D.
- No real user data is used; synthetic fixtures only.
- localStorage remains the canonical write surface throughout Phase 18D.
- backup/export behavior remains unchanged throughout Phase 18D.
- A rollback path must be proven functional before Phase 18D is considered complete.
- Post-migration verification is mandatory and must pass before Phase 18D claims success.

### No-go criteria (any one blocks Phase 18D)

- Any request to ship a UI toggle for migration.
- Any request to run migration at app boot.
- Any request to make IndexedDB the production read source.
- Any request to delete localStorage in the pilot.
- Any request to claim backup/export is adapter-aware when it is not.
- Any request to touch or use real user data in the pilot.
- Any request to add sync, cloud, account, auth, or backend to the pilot.

## Future sequencing

```
Phase 18A  Test-Only IndexedDBAdapter prototype (injectable fake backend)
Phase 18B  Backup/Export Compatibility Audit (docs/static-validator/CI-only)
Phase 18C  Manual Migration UX Plan (this document — docs/static-validator/CI-only)
Phase 18D  Internal/Test-Only Local Migration Pilot (single key family, synthetic data, no real users)
Phase 18E+ (TBD) Controlled internal activation, verification harness, potential rollout gate
```

Each phase must pass its go criteria before the next phase begins. No phase may skip the go/no-go check.

## Acceptance criteria

Phase 18C is PASS when:

- `docs/phase18c-manual-migration-ux-plan.md` exists and contains all required headings from the master task file.
- The document clearly states that Phase 18C is docs/static-validator/CI-only.
- The document clearly states that production UI behavior is unchanged.
- The document clearly states that no UI copy is shipped in Phase 18C.
- The document clearly states that no Settings toggle is added.
- The document clearly states that production backup/export behavior is unchanged.
- The document clearly states that localStorage remains the canonical production source of truth.
- The document clearly states that backup/export is not adapter-aware.
- The document clearly states that restore is not adapter-aware.
- The document clearly states that Phase 18C does not implement migration.
- The document clearly states that Phase 18C does not move real data.
- The document clearly states that Phase 18C does not delete localStorage.
- The document clearly states that Phase 18C does not implement production IndexedDBAdapter.
- The document clearly states that Phase 18C does not switch the production storage registry.
- All required UX plan topics are covered.
- Vietnamese-first copy direction is included.
- Phase 18D go/no-go criteria are defined.
- No runtime files, test files, package files, or backup/export runtime files were modified.
- CI is green.
