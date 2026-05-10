# Phase 11A — Cross-device Transfer UX Decision / Convenience Plan

## Purpose

Phase 11A starts a new product-convenience planning track after the Phase 10 release-readiness planning and evidence track. It evaluates better cross-device transfer UX for Shime Quiz / ShimeChamhoc v2 while preserving the local-first/browser-local product boundary.

This phase is a Cross-device Transfer UX Decision / Convenience Plan only. It does not implement transfer runtime features, QR transfer, WebRTC, Web Share, cloud sync, account sync, storage schema changes, backup/restore logic changes, import/parser changes, package changes, release tag creation, release package creation, or GitHub Release publication.

## Current baseline

- Completed/merged through Phase 10T.
- The current app is local-first/browser-local.
- Current portability is backup/export/import through explicit user action.
- No backend/cloud/account sync exists.
- No automatic cross-device sync exists.
- No QR transfer runtime exists.
- No Web Share implementation exists.
- No WebRTC/session transfer runtime exists.
- Release tag has not been created.
- GitHub Release has not been published.
- Release package has not been created or published.
- Package version remains unchanged unless explicitly approved.

## User problem

Desktop-to-phone transfer is currently too technical for general users. Manual export/import works as a local-first portability path, but it feels inconvenient when a user only wants to move quizzes from a desktop browser to a phone.

The phrase "JSON backup/import" is accurate for engineering, but it is not friendly for non-technical users. Users expect a simple front door such as "Move my quizzes to this device," "Transfer data," "Send to another device," or "Receive data." Local-first privacy remains valuable, but the UX needs clearer language and a simpler transfer flow.

## Candidate solutions

### 1. One-click backup + friendlier import UX

This option keeps the current local backup model but renames user-facing actions:

- Transfer data
- Send to another device
- Receive data
- Backup file
- Restore from file

Benefits:

- Lowest implementation and release risk.
- No backend required.
- No storage schema change required if only copy/flow changes are made.
- Compatible with the existing manual backup/export/import model.

Limitations:

- Still requires the user to move a file between devices.
- Does not create automatic sync.

Recommendation: first runtime polish candidate for Phase 11B.

### 2. Web Share API backup sharing

This option uses the browser/native share sheet where supported. A user exports a backup file and shares it via AirDrop, Nearby Share, messaging, Drive, or another installed target.

Benefits:

- No backend required.
- Natural mobile UX improvement on supported browsers/devices.
- Preserves user-controlled local-first portability.

Limitations:

- Browser/platform support varies.
- Needs a clear file-download fallback when unsupported.
- Sharing a backup file may expose private study data to whichever destination the user chooses.

Recommendation: good Phase 11D prototype after copy/flow polish and transfer safety hardening.

### 3. QR code containing backup data

A QR code can contain data directly, but full Shime backups may be too large for practical QR payloads.

Benefits:

- Familiar "scan to transfer" mental model.
- No backend required for tiny payloads.

Limitations:

- QR payload size can become too large quickly.
- A raw backup QR could expose private study data visually.
- Not reliable for full backups with quizzes, answers, progress, and history.

Recommendation: not recommended for full backups. Consider only for small transfer metadata, a key, or session information.

### 4. QR code / short transfer code with temporary transfer session

A better QR/code UX would let Device A create a code or QR, then Device B scans or enters it. Data transfers through a temporary session.

Possible mechanisms:

- WebRTC DataChannel with a signaling step.
- A temporary relay/signaling service if explicitly approved later.
- Local-network discovery only if feasible and safe.

Benefits:

- Much friendlier for desktop-to-phone transfer.
- Avoids forcing users to manually find and upload a backup file.

Limitations:

- Requires an additional transfer mechanism.
- WebRTC/DataChannel needs signaling and careful error handling.
- Privacy/security design must be explicit.
- Needs fallback to file backup/import.

Recommendation: good medium-term direction after safety hardening and mobile sharing prototype decisions.

### 5. Optional local-first encrypted transfer package

This option packages a backup with a one-time transfer key/passphrase. A QR code or short code can carry metadata or a key, while the backup package remains encrypted in transit/storage.

Benefits:

- Safer than raw backup sharing if implemented correctly.
- Compatible with a local-first transfer model.
- Could pair with import preview and clear user confirmation.

Limitations:

- Requires cryptographic implementation review.
- Requires careful UX so users do not lose keys or misunderstand guarantees.
- Do not claim encryption until implemented and tested.

Recommendation: plan and review before any claim. Do not claim encrypted backups from this document.

### 6. Optional account/cloud sync

Account/cloud sync can offer the best convenience, but it is a major architecture change.

Requirements:

- Backend/auth/account system.
- Security and privacy model.
- Sync conflict handling.
- Deletion/export/account lifecycle policy.
- Production operations and support decisions.

Recommendation: future architecture only, in Phase 12+ and only if explicitly approved. Do not implement in Phase 11A.

## Recommendation: staged implementation path

### Phase 11B — Cross-device Transfer UX Copy + Backup Flow Polish

- No backend.
- Rename technical backup/import UI to user-friendly transfer language.
- Add "Send to another device" and "Receive data" entry points.
- Keep existing backup/import internals.
- Avoid storage schema changes unless separately approved.

### Phase 11C — Backup Format / Transfer Safety Hardening

- Document or prepare schema versioning.
- Add or plan checksum/error detection for transfer packages.
- Add or plan import preview before overwrite.
- Define merge/replace/keep-both choices.
- Consider compression plan.
- Consider optional encryption plan, but do not claim encryption until implemented and tested.

### Phase 11D — Web Share / Mobile Sharing Prototype

- Use Web Share where available.
- Keep file fallback when unsupported.
- Improve mobile transfer experience without backend/cloud/account sync.

### Phase 11E — QR / Transfer Code Prototype Decision

- Prototype QR/session-code UX design.
- Decide whether WebRTC/DataChannel plus signaling is worth the complexity.
- Keep cloud/account sync out of scope unless explicitly approved.

### Phase 12 — Optional Cloud Sync / Account Sync

- Only if the user explicitly wants it.
- Requires backend/auth/cloud sync architecture.
- Requires security/privacy/conflict strategy before implementation.

## UX language recommendation

Avoid technical terms in primary UI:

- Avoid: JSON, localStorage, import/export, schema, backup blob.
- Prefer: Transfer data, Send to another device, Receive data, Save a backup file, Restore from backup, Move my quizzes to this device.

Technical details can remain in advanced help text, developer docs, and validation docs.

## Safety and privacy requirements

- Backups may contain quizzes, answers, progress, study history, and private local data.
- Backup data may contain private study data and should be handled as user-private content.
- Do not expose private data in QR text.
- Do not store transfer data on a server unless explicitly designed and disclosed.
- Do not claim end-to-end encryption unless implemented and tested.
- Do not claim encryption implemented from planning alone.
- Do not claim cloud sync unless implemented.
- Always provide import preview before overwriting data in future implementation.
- Provide merge/replace/keep-both decision points for future restore/transfer UX.
- Include checksum or error detection for transfer packages in future implementation.
- Keep file fallback available for unsupported Web Share or transfer-session environments.

## Non-goals for Phase 11A

Phase 11A does not:

- implement QR transfer
- implement WebRTC
- implement Web Share
- implement cloud sync
- implement account sync
- implement automatic cross-device sync
- implement encryption
- change backup/restore logic
- change import/parser behavior
- change storage schema
- change runtime app behavior; no runtime app behavior changed
- add dependencies
- change package version
- create release package
- create release tag
- publish GitHub Release

## Claims control

Safe claims after Phase 11A:

- Cross-device transfer UX decision plan exists.
- Recommended staged roadmap exists.
- Candidate solutions were compared at documentation level.

Forbidden claims after Phase 11A:

- QR transfer implemented.
- Web Share implemented.
- WebRTC/session transfer implemented.
- Cloud/account sync implemented.
- Automatic cross-device sync implemented.
- Encryption implemented.
- Backup/restore/import/storage runtime changed.
- Release package created or published.
- Release tag created.
- GitHub Release published.

## Recommended next step

Recommended next phase: Phase 11B — Cross-device Transfer UX Copy + Backup Flow Polish.

Other valid next choices:

- Stop and keep the release candidate unpublished.
- Run user-approved final release execution.


## Phase 11B follow-up: transfer UX copy polish

Phase 11B implements the first recommended runtime polish from this plan by updating existing backup/restore UI copy to friendlier transfer language. It keeps current manual backup/export/import mechanics and does not add QR transfer, Web Share, WebRTC/session transfer, backend/cloud/account sync, automatic sync, encryption, storage schema changes, backup file format changes, package/dependency changes, release tags, GitHub Releases, or release packages.
