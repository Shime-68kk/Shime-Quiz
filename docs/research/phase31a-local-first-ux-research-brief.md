# Phase 31A — Local-First UX Research Brief

## Status

```text
PHASE31A_POST_LIMITED_BETA_ROADMAP_STATUS: COMPLETED_POST_LIMITED_BETA_ROADMAP_PLANNING
PHASE31A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE31A_ROADMAP_SCOPE: PLANNING_RESEARCH_ONLY_NO_RUNTIME_SYNC_CLOUD_OR_BACKEND
```

This is a research brief only. No implementation decisions are made in Phase 31A. All options described here are research items. Any option that proceeds to design or implementation requires a separate, explicitly-gated phase.

## Research scope

This brief examines local-first UX patterns for data safety, backup, and restore in the context of ShimeChamhoc v2.0.0-rc1. The app uses localStorage as its primary storage backend. Users are not prompted to create accounts or store data in the cloud.

Research questions:
1. How do local-first and offline-first web apps communicate data safety risks to users?
2. What UX patterns exist for backup/export discoverability in browser-based tools?
3. What failure modes are common with localStorage-based storage, and how should they be communicated?
4. What options exist for improving data portability without requiring server infrastructure?

This brief does not commit to any implementation. All options require a separate design or prototype gate.

## Current product tension

ShimeChamhoc v2.0.0-rc1 stores all user data (flashcard libraries, study history, FSRS state) in localStorage. localStorage is:
- Fast and available offline.
- Browser-tab-local: data does not sync between browsers or devices automatically.
- Erasable: clearing browser data, uninstalling the browser, or using private browsing mode removes all study data.
- Quota-bounded: browsers typically allow 5–10 MB per origin; large card libraries may approach this limit.

Current UX tension:
- Users expect their data to persist across sessions, which it does under normal conditions.
- Users may not know that clearing cookies/site data removes all study cards.
- Users may not know about the built-in backup/export feature until they need it.
- No in-app visual cue communicates storage risk or backup status in default flows.

LIMITED_BETA_CANDIDATE status acknowledges these limitations. BETA_READY requires addressing them through evidence collection and/or UX improvements.

## Option 1 — Better local backup UX

**Description**: Improve discoverability and copy for the existing backup/export feature without adding new storage infrastructure.

**What it includes**:
- Clearer entry points to backup/export in settings and dashboard.
- User-readable explanation of what backup means in local-first context.
- Risk acknowledgment copy ("Your data is stored locally in this browser").
- Export success confirmation with file-save reminder.
- Import confirmation with before/after summary.

**What it does not include**: Cloud storage, automatic backup, sync, account creation.

**User value**: Medium-high. Directly reduces surprise data loss for current limited beta users.

**Risk**: Low. No new storage infrastructure. No migration.

**Recommendation**: Include as part of Phase 31B Data Safety Center scope.

## Option 2 — Data Safety Center / Local Backup Center

**Description**: A dedicated in-app panel (settings page section, modal, or route) that surfaces the full local-first data safety model.

**What it includes**:
- Panel entry point from settings or dashboard.
- Storage model explanation: what localStorage is, what it means for the user's data.
- Backup/export flow: how to export, when to export, what the file contains.
- Restore flow: how to restore, what it overwrites, explicit risk acknowledgment.
- Failure scenario copy: quota exceeded, browser storage cleared, export interrupted.
- Known limitations: no cloud sync, no automatic backup, no guaranteed prevention.
- Optional: backup freshness indicator (last export date).

**What it does not include**: Cloud storage, server sync, automatic backup, BYOC/WebDAV.

**User value**: High. Proactively communicates storage risk before data loss occurs. Builds user trust.

**Risk**: Low for planning. Moderate for runtime implementation (UI surface requires design review, copy review, and evidence).

**Recommendation**: This is the highest-priority non-evidence lane. Plan in Phase 31B. Prototype in a separately-gated phase after Phase 31B design gate.

## Option 3 — Backup reminders

**Description**: In-app reminders that prompt users to export their data after a set period (e.g., weekly, after significant study sessions) or after reaching a card count threshold.

**What it includes**:
- Banner or toast notification triggered by elapsed time or study-session count.
- One-click path to backup/export from the reminder.
- Dismissable with "remind me later" or "don't show again" option.

**What it does not include**: Cloud storage, server sync, automatic background backup, scheduling APIs.

**User value**: High. Reduces data loss from infrequent manual backup.

**Risk**: Medium. Requires defining trigger logic, dismissal state (localStorage-backed), and notification UX. Risk of friction if too frequent.

**Recommendation**: Include as a design consideration within Phase 31B Data Safety Center scope. Defer runtime implementation to a later phase.

## Option 4 — One-time device transfer research

**Description**: Research options for transferring data from one device/browser to another without a server, such as QR-code export, file-based transfer, or local-network transfer.

**What it includes** (research only):
- QR-code export: encode backup data as a QR code, scan on target device.
- File-based transfer: manually copy the export file from source to target device.
- Local-network transfer: source device runs a local server; target device downloads the file via local WiFi.

**What it does not include**: Server infrastructure, cloud sync, account creation.

**User value**: Medium. Useful for users who want to continue studying on a different device.

**Risk**: Varies:
- File-based transfer: Low risk. Already feasible with existing export/import.
- QR-code export: Low complexity for small datasets. High risk for large datasets (QR codes have data limits).
- Local-network transfer: High complexity. Requires running a server process in the browser (Service Worker or WebRTC). Complex UX.

**Recommendation**: Research only. File-based transfer is already possible. QR-code and local-network options require deeper research. Defer to Opus 4.7 gate if desired.

## Option 5 — BYOC/WebDAV encrypted backup research

**Description**: Allow users to configure their own cloud storage (Dropbox, Google Drive, WebDAV server) as a backup target. The app encrypts the backup before upload and decrypts on restore.

**What it includes** (research only):
- User-provided storage credentials (API key, OAuth token, WebDAV URL/password).
- Client-side encryption of backup file before upload.
- Upload/download via browser Fetch API to user-controlled storage endpoint.
- No Shime server infrastructure.

**What it does not include**: Shime-operated cloud infrastructure, user account system, server sync.

**User value**: High for data portability and device sync. Users who already use Dropbox or similar services can store backups without trusting Shime.

**Risk**: High.
- Credential management in localStorage is sensitive.
- OAuth flows require a redirect URI and app registration.
- WebDAV server setup is not accessible to non-technical users.
- Conflict resolution between devices is complex.
- Encryption key management adds UX complexity.
- BYOC requires significant implementation effort and security review.

**Recommendation**: Research only. Do not implement in Phase 31A or Phase 31B. Requires dedicated architecture and security review gate. Opus 4.7 research gate optional.

## Option 6 — P2P/WebRTC transfer research

**Description**: Direct device-to-device data transfer using WebRTC data channels. Source and target devices are in the same network or use a STUN/TURN server for NAT traversal.

**What it includes** (research only):
- WebRTC peer connection between source and target device.
- Backup data transferred directly between devices, no server intermediary.
- Optional STUN/TURN server for NAT traversal (requires minimal server infrastructure).

**What it does not include**: Persistent server sync, cloud storage, account system.

**User value**: Medium. Useful for one-time device transfer. Low everyday utility compared to file-based transfer.

**Risk**: High.
- WebRTC P2P requires signaling (at minimum a STUN server or manual signal exchange).
- NAT traversal failure is common in corporate/school networks.
- Complex UX: both devices must be simultaneously active and connected.
- Conflict resolution on repeat transfers is undefined.
- Security model for P2P transfer of user study data requires review.

**Recommendation**: Research only. Do not implement in Phase 31A or Phase 31B. Defer to Opus 4.7 gate if desired.

## Comparative risk table

| Option | User value | Complexity | Data-loss risk | Privacy risk | Conflict-resolution need | Claim risk | Recommendation |
|--------|-----------|-----------|---------------|-------------|--------------------------|-----------|----------------|
| 1 — Better local backup UX | Medium-high | Low | Low — no new storage | Low | None | Low | Include in Phase 31B scope |
| 2 — Data Safety Center / Local Backup Center | High | Low (design); Moderate (runtime) | Low — no new storage | Low | None | Low | Highest priority; plan in Phase 31B |
| 3 — Backup reminders | High | Medium | Low — no new storage | Low — dismissal state only | None | Low | Include in Phase 31B design scope |
| 4 — Device transfer (file-based) | Medium | Low | Low — existing export | Low | None | Low | Already possible; improve copy |
| 4 — Device transfer (QR/local-network) | Medium | Medium-High | Medium — size limits, complexity | Low-Medium | None | Medium | Research only; Opus 4.7 gate optional |
| 5 — BYOC/WebDAV | High | High | Medium — credential exposure | High — external storage | High | High | Research only; no implementation |
| 6 — P2P/WebRTC | Medium | High | Low — no persistent storage | Medium — transfer security | High | High | Research only; no implementation |

## Recommendation

1. **Data Safety Center / Local Backup Center (Option 2)** is the highest-priority non-evidence lane. It addresses the core user trust gap without any new storage infrastructure. Plan in Phase 31B. Prototype in a separately-gated phase after design review.

2. **Better local backup UX (Option 1)** and **Backup reminders (Option 3)** should be folded into the Phase 31B Data Safety Center scope. They are low-risk improvements that complement the Data Safety Center.

3. **Evidence collection lanes** (restore rehearsal, adapter-awareness, before/after localStorage diff, stress test) must proceed in parallel or immediately after Phase 31B. These are required for BETA_READY and must not be deprioritized.

4. **BYOC/WebDAV (Option 5)** and **P2P/WebRTC (Option 6)** are research-only. An optional Opus 4.7 research gate can compare these options in depth. Do not implement until after BETA_READY is achieved and a dedicated architecture/security gate is completed.

5. **Device transfer (Option 4)**: File-based transfer is already possible via existing export/import. Improve copy and discoverability in the Data Safety Center. QR-code and local-network options are research-only.

## What not to implement yet

Do not implement in Phase 31A or Phase 31B:
- Server sync, cloud storage, account/auth/backend.
- BYOC/WebDAV encrypted backup.
- P2P/WebRTC device transfer.
- Automatic background backup.
- Any new storage infrastructure (IndexedDB production migration, cloud bucket).
- Any guaranteed data-loss prevention claim.

These remain outside the approved scope until BETA_READY evidence is collected, architecture gates are completed, and explicit phase-level decisions are made.

## Opus 4.7 research gate

An optional Opus 4.7 research gate can be used to compare BYOC/WebDAV, P2P/WebRTC, device-transfer, and no-server sync options in depth. This gate should be scoped as research-only with no implementation commitment.

Recommended Opus 4.7 research topics (if the team chooses to pursue):
- BYOC/WebDAV architecture options: OAuth vs. API key, encryption model, conflict resolution.
- P2P/WebRTC feasibility: STUN/TURN requirements, NAT traversal success rates, UX complexity.
- No-server device transfer: QR-code size limits, local WiFi transfer via Service Worker, feasibility assessment.
- Competitive analysis: how similar local-first apps (Obsidian, Logseq, Anki) handle sync and data portability.

This gate is not required for Phase 31B. It can proceed in parallel or after Phase 31B as a separate research phase.
