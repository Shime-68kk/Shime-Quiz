# Phase 11D — Web Share / Mobile Sharing Prototype Plan

## Purpose

Phase 11D creates a Web Share / Mobile Sharing Prototype Plan for improving future mobile backup sharing while preserving Shime Quiz / ShimeChamhoc v2's local-first boundaries. It follows the Phase 11A cross-device transfer UX decision plan, the Phase 11B transfer UX copy polish, and the Phase 11C backup transfer safety hardening plan.

This phase is docs/static-validator/CI only. No Web Share runtime is implemented in Phase 11D, no runtime app code changes are made, and no backup format/runtime behavior changes are implemented by this phase.

## Current baseline

- Completed/merged through Phase 11C.
- Current portability remains manual backup/export/import.
- Phase 11B friendlier transfer copy exists in the current backup/restore UI.
- Phase 11C documents future backup safety requirements before richer transfer flows.
- No Web Share runtime exists.
- No QR transfer implemented.
- No WebRTC/session transfer implemented.
- No backend/cloud/account sync implemented.
- No automatic sync implemented.
- No encryption implemented.
- Release package/tag/GitHub Release remain uncreated/unpublished.
- Package version remains unchanged unless explicitly approved.

## Why Web Share could improve mobile UX

Manual backup/export/import is reliable and local-first, but mobile users often expect a native sharing flow. A future Web Share implementation could make the existing backup file easier to move through AirDrop, Nearby Share, messaging, files, or another user-selected destination without requiring Shime to run a backend or create account sync.

Web Share is a convenience layer over the current backup file flow. It should not become an automatic sync feature, cloud storage feature, QR transfer feature, or WebRTC/session transfer feature.

## Web Share API candidate behavior

A future runtime phase could add the following behavior:

1. User taps **Share backup file** after creating a backup.
2. Shime creates the same local backup file that the current backup/download flow already produces.
3. If the browser supports file sharing through the Web Share API, the browser/native share sheet opens.
4. The user chooses the destination, such as device sharing, messaging, local files, or another installed app.
5. If Web Share is unsupported or fails safely, fallback remains normal backup file download.
6. Restore from backup file remains available on the receiving device.

The future UI should also keep **Save backup file** available so users are never blocked by unsupported Web Share behavior.

## Browser/platform support considerations

Web Share support varies by browser, operating system, file type, installed apps, browser security context, and whether the browser supports sharing files instead of only text/URLs. A future implementation should:

- detect capability before showing or enabling a share action;
- keep the normal backup file download fallback visible;
- avoid requiring Web Share for portability;
- provide clear unsupported-browser guidance;
- avoid broad platform-support claims unless tested on the named platform/browser;
- continue to support restore from backup file independently from sharing.

## Privacy requirements

Backup files may contain quiz content, answers, progress, and study history. Future Web Share UX must make this clear before the user shares the file.

Privacy boundaries:

- Do not upload backup files to a Shime server.
- The user chooses the destination in the browser/native share sheet.
- No cloud sync claim is allowed.
- No account sync claim is allowed.
- No automatic sync claim is allowed.
- No encryption implementation or encrypted-backup claim is allowed unless encryption is actually implemented and tested in a future approved phase.
- Do not expose full backup data in QR text.
- Keep local file fallback available for users who do not want to invoke a share sheet.

## Fallback requirements

Future Web Share behavior must be optional and recoverable:

- normal file download remains available;
- restore from backup file remains available;
- unsupported browser must show clear fallback text;
- failed share attempts must not corrupt or delete local data;
- the app must not require a backend, account, QR code, WebRTC session, or cloud service to complete the current manual transfer flow.

## Non-goals for Phase 11D

Phase 11D does not:

- implement Web Share runtime;
- change runtime app code;
- change backup file format;
- change storage schema;
- change import/restore behavior;
- add dependencies;
- implement QR transfer;
- implement transfer codes;
- implement WebRTC/session transfer;
- add backend/cloud/account sync;
- implement automatic sync;
- implement encryption;
- create release package/tag/GitHub Release;
- publish a GitHub Release.

## Future implementation checklist

A later approved runtime phase should consider:

- confirm backup file generation remains compatible with existing restore behavior;
- verify whether `navigator.share` and `navigator.canShare` support file sharing in target browsers;
- keep **Save backup file** as fallback;
- keep **Restore from backup file** as the receiving-device path;
- show a privacy warning before sharing;
- handle unsupported browsers with clear fallback messaging;
- handle user cancellation without reporting a product failure;
- avoid storing or transmitting backup data through Shime servers;
- add tests for capability detection, fallback copy, and unchanged download behavior;
- update docs and claims only after measured runtime validation.

## Recommended next step

Recommended next options after Phase 11D, if accepted:

- Phase 11E — Web Share Runtime Prototype, if the user approves runtime transfer convenience work;
- Backup Safety Runtime Implementation, if the user wants checksum/import-preview/merge safety before share-sheet work;
- user-approved final release execution;
- or keep the release candidate unpublished.


## Phase 11E runtime follow-up

Phase 11E implements a small Web Share runtime prototype where supported by the browser/platform. The implementation keeps the Phase 11D fallback requirements: normal backup file download remains available, restore from backup file remains available, and unsupported browsers use clear fallback copy. The prototype does not upload backup files to a server and does not create cloud sync, automatic sync, QR transfer, WebRTC/session transfer, account sync, or encryption.


Phase 11E validation phrases: backup files may include quiz content, answers, progress, and study history; normal backup file download remains the fallback; no QR transfer; no WebRTC/session transfer; no backend/cloud/account sync; no cloud/automatic sync; no automatic sync; no encryption implementation.

## Phase 11F fallback hardening follow-up

Phase 11F adds [`docs/web-share-runtime-qa-fallback-hardening.md`](web-share-runtime-qa-fallback-hardening.md) and hardens the Phase 11E Web Share runtime prototype. Normal backup file download remains fallback, restore from backup remains available, and unsupported browser behavior, `navigator.canShare` capability gaps, user cancel behavior, and share failure behavior are handled with non-destructive guidance.

Phase 11F does not implement QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, or encryption. It does not change backup format, storage schema, import/restore behavior, package version/dependencies, release package, release tag, or GitHub Release status.


Phase 11F validation phrase: Web Share fallback guidance keeps normal backup file download available.


## Phase 11H closure note

Phase 11H re-audits the Web Share planning and runtime track in [`docs/cross-device-transfer-track-closure.md`](cross-device-transfer-track-closure.md). The closure confirms that the Web Share runtime prototype exists where supported, Web Share support depends on browser/platform capability, normal backup file download remains fallback, and restore from backup remains available.

Phase 11H does not add QR transfer, transfer-code flow, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, backup format/storage schema/import behavior changes, package/dependency changes, release package, release tag, or GitHub Release.
