# Phase 11F — Web Share Runtime QA / Fallback Hardening

## Purpose

Phase 11F hardens the Phase 11E Web Share runtime prototype with QA-focused fallback behavior, unsupported-browser guidance, user-cancel handling, share-failure handling, and claims-control documentation.

This phase is a small runtime hardening pass limited to the existing backup/restore panel plus docs, a static validator, and CI registration. It does not change the backup file format, storage schema, or import/restore behavior.

## Current baseline

- Completed/merged through Phase 11E.
- Web Share runtime prototype exists where supported by browser/platform capability.
- Current transfer remains local-first manual backup/export/import with optional Web Share for backup files where supported.
- Normal backup file download remains fallback.
- Restore from backup remains available.
- No QR transfer is implemented.
- No WebRTC/session transfer is implemented.
- No backend/cloud/account sync is implemented.
- No automatic sync is implemented.
- No encryption implementation exists.
- Package version remains unchanged unless explicitly approved.
- Release package/tag/GitHub Release remain uncreated/unpublished.

## Runtime fallback expectations

The normal `Sao lưu dữ liệu` backup download button remains primary and always usable. The optional `Chia sẻ file sao lưu` action is only a convenience path over the same backup file content.

Browser/platform support may vary. The runtime should use `navigator.share` feature detection and `navigator.canShare` file-capability checks before attempting to share a backup file.

Unsupported browser behavior must be clear and non-blocking: if `navigator.share` is unavailable, or if `navigator.canShare` is unavailable or returns false for the backup file, the user should be told to use the normal backup file download flow.

User cancel behavior must be non-destructive. If the user closes or cancels the native/browser share sheet, the app should not show a scary/destructive error and must not change backup data.

Share failure behavior must be non-destructive. If sharing fails for browser, platform, permission, file, or destination reasons, the app should show fallback guidance and keep the normal backup file download available.

## Privacy requirements

Backup files may contain private quiz/study data. Backup files may include quiz content, answers, progress, and study history. Users should share backup files only through destinations they trust.

The Web Share fallback hardening does not upload backup files to a server, does not create cloud sync, and does not create automatic sync. The user chooses the destination through the browser/native share sheet or by manually downloading the backup file.

## Manual QA checklist

Use this checklist only when manually executing evidence later:

- Browser with Web Share support: `Chia sẻ file sao lưu` opens the native/browser share sheet where file sharing is supported.
- Browser without Web Share support: fallback copy explains that normal backup file download remains available.
- `navigator.canShare` false/unsupported path (canShare false/unsupported path): app gives fallback guidance instead of blocking backup download.
- User cancel path: canceling the share sheet produces non-destructive guidance and does not mutate backup data.
- Share failure path: failed sharing shows non-destructive guidance and keeps the backup download available.
- Normal backup download still works through `Sao lưu dữ liệu`.
- Restore from backup still works through `Chọn file sao lưu` and the existing restore flow.
- Mobile viewport check confirms helper copy remains readable and controls remain usable.

## Non-goals for Phase 11F

Phase 11F does not:

- change backup file format;
- change storage schema;
- change import/restore behavior;
- implement QR transfer;
- implement transfer codes;
- implement WebRTC/session transfer;
- implement backend/cloud/account sync;
- implement automatic sync;
- implement encryption;
- add dependencies;
- change package version;
- create a release package, tag, or GitHub Release.

## Claims control

Safe claims after this phase:

- Web Share fallback hardening exists.
- Normal backup file download remains fallback.
- Unsupported browser, user cancel, and share failure paths are documented and handled non-destructively.

Unsafe claims after this phase:

- QR transfer implemented.
- WebRTC/session transfer implemented.
- Cloud/account sync implemented.
- Automatic sync implemented.
- Encryption implemented.
- Backup format/storage schema/import behavior changed.
- Release package/tag/GitHub Release created.

## Recommended next step

Recommended next options after Phase 11F, if accepted:

- Phase 11G — Manual Evidence Run, if the user wants actual device/browser evidence.
- Phase 11H — Cross-device Transfer Track Closure / Release Readiness Re-audit.
- User-approved final release execution.
- Keep the release candidate unpublished.


## Phase 11H closure note

Phase 11H closes and re-audits the Phase 11 transfer work in [`docs/cross-device-transfer-track-closure.md`](cross-device-transfer-track-closure.md). It confirms that Web Share fallback hardening exists, unsupported browser fallback is documented, user cancel and share failure behavior are non-destructive, normal backup file download remains fallback, and restore from backup remains available.

No QR transfer, transfer-code flow, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format/storage schema/import behavior change, package/dependency change, release package, release tag, or GitHub Release is added by Phase 11H.
