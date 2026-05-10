# Phase 11C — Backup Format / Transfer Safety Hardening

## Purpose

Phase 11C prepares backup and transfer safety requirements after the Phase 11A cross-device transfer UX decision plan and the Phase 11B transfer UX copy polish.

This phase is docs/static-validator/CI only. No backup format/runtime behavior changes are implemented by this phase. It does not change the backup file format, storage schema, import/restore parser behavior, or runtime backup/restore behavior.

## Current baseline

- Completed/merged through Phase 11B.
- Current portability remains manual backup/export/import.
- Friendlier transfer UX copy exists from Phase 11B around the existing backup/restore panel.
- No QR transfer implemented.
- No Web Share implemented.
- No WebRTC/session transfer implemented.
- No backend/cloud/account sync implemented.
- No automatic cross-device sync implemented.
- No encryption implemented.
- Release package, release tag, and GitHub Release remain uncreated/unpublished.
- Package version remains unchanged unless explicitly approved.

## Why hardening is needed

Future transfer features need safer backup package handling before the app adds more convenient transfer paths. Users may move data between desktop and phone, and backup files may include private quiz/study data such as quizzes, answers, progress, study history, and local app data.

Transfer packages need validation before restore/import. Users also need clear choices before overwriting or merging data so a convenience feature does not silently destroy local work.

## Future backup package requirements

Future backup or transfer package work should define and test these requirements before runtime rollout:

- schema/version marker
- app/version metadata
- created-at timestamp
- optional source device/browser label if the user provides one
- data category summary for quizzes, answers, progress, study history, and settings/local app data if applicable
- checksum or error detection
- import preview summary
- compatibility check
- unknown/unsupported version handling
- safe failure behavior that leaves current local data unchanged when restore/import cannot be trusted

These items are future requirements only. Phase 11C documents the plan and does not implement checksum runtime, compression, encryption, import preview runtime, or backup format changes.

## Import preview requirements

A future import preview should show users what will be restored before any destructive action:

- number of quizzes
- number of question items if available
- progress/study history presence
- settings/local data presence if applicable
- source/date metadata if available
- warnings for unknown/unsupported versions
- privacy warning for user-owned study data
- clear confirmation before restore/import

If unsupported or suspicious backup data is detected, the preview should show clear user-facing guidance and fail safely before changing local data.

## Merge/replace/keep-both decision model

Future restore UX should define explicit choices before implementation:

- Replace current local data.
- Merge with current local data.
- Keep both / import as copy where possible.
- Cancel safely.

Duplicates and conflicts should be handled carefully. Progress and study history conflicts need explicit rules before implementation because silent merging could make study data confusing or incorrect.

## Duplicate/conflict handling plan

Future duplicate/conflict handling should consider:

- duplicate quiz title detection
- duplicate stable ID detection if IDs exist
- title suffix/copy strategy if keeping both
- conflict log or user-visible summary
- no silent destructive overwrite without confirmation

The product should prefer a user-visible summary over hidden mutation when imported backup data overlaps with existing local data.

## Privacy and security boundaries

- Backups may contain private user data.
- Keep backup files private.
- Do not expose full backup data in QR text.
- Do not store transfer data on a server unless explicitly designed and disclosed.
- Do not claim encryption unless implemented and tested.
- Optional encryption is future work only.
- No production/security/privacy certification is claimed by this plan.

## Compatibility and fallback

Existing manual backup/export/import remains the current portability path. Future changes must preserve existing backups or intentionally migrate them with clear user-facing guidance. Unknown backup versions should fail safely, parser errors should produce clear user-facing guidance, and future transfer features should keep a file fallback.

## Non-goals for Phase 11C

Phase 11C does not:

- change backup file format
- change storage schema
- change runtime backup/restore behavior
- change import/restore parser behavior
- implement import preview runtime
- implement merge/replace/keep-both runtime
- implement checksum runtime
- implement compression
- implement encryption
- implement QR transfer
- implement transfer code
- implement Web Share
- implement WebRTC/session transfer
- implement backend/cloud/account sync
- implement automatic cross-device sync
- create release package/tag/GitHub Release
- change package version/dependencies

## Claims control

Safe claims after Phase 11C:

- Backup transfer safety hardening plan exists.
- Future checksum/import-preview/merge requirements are documented.
- Privacy and compatibility requirements for future transfer work are documented.

Do not claim after Phase 11C:

- backup format changed
- checksum implemented
- compression implemented
- encryption implemented
- import preview implemented
- merge/replace/keep-both implemented
- QR transfer implemented
- Web Share implemented
- WebRTC/session transfer implemented
- cloud/account sync implemented
- automatic sync implemented
- release package/tag/GitHub Release created

## Recommended next step

Recommended next options:

- Phase 11D — Web Share / Mobile Sharing Prototype, if the user wants practical mobile sharing next.
- Phase 11D alternative — Backup Safety Runtime Implementation, if the user approves runtime safety changes first.
- User-approved final release execution.
- Keep the release candidate unpublished.

## Phase 11D follow-up: Web Share / mobile sharing prototype plan

Phase 11D adds [`docs/web-share-mobile-sharing-prototype-plan.md`](web-share-mobile-sharing-prototype-plan.md), a docs/static-validator/CI-only plan for a future optional Web Share/mobile share-sheet layer over the existing backup file flow. It does not implement Web Share runtime, QR transfer, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, checksum runtime, compression, import preview runtime, merge/replace/keep-both runtime, backup format changes, storage schema changes, or import/restore behavior changes.
