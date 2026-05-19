# Phase 23A — Local Data Survival / Uninstall & Device-Loss Protection Research Gate

## Status token

PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY

## Scope

Phase 23A is a docs-only research gate.
Phase 23A does not implement runtime data-survival behavior.
Phase 23A does not make Shime BETA_READY.
Phase 23A does not make backup/export/restore adapter-aware.
Phase 23A does not verify platform backup behavior.

This phase defines the local data survival risk landscape before StorageAdapter expansion, production IndexedDB storage, storage migration, adapter-aware backup/export/restore, or optional sync work resumes. It covers uninstall, device loss, broken devices, clear-site-data actions, browser switches, private or incognito sessions, storage pressure, quota eviction, PWA uncertainty, native wrapper uncertainty, user expectations, user-controlled backup files, backup health, backup reminders, and pre-risk-action friction.

## Inputs

- Phase 22H ended with `LOCAL_FIRST_HYBRID_BETA_EVIDENCE_DECISION: HOLD_BROADER_ACTUAL_EVIDENCE_STILL_LIMITED`.
- Phase 22H remaining gaps still include second physical device transfer, real storage exhaustion, cross-browser coverage, PWA/offline behavior, real mobile file picker behavior, long-duration endurance, and broad external real-user evidence.
- The Opus Phase 23 report is used as strategic input only. It says local-first is not the same as data-safe and recommends a docs/research gate before runtime work resumes. Platform behavior from that report is not treated as verified evidence.

## Platform risk research

Android native app uninstall risk: if Shime is later wrapped as a native Android app, uninstall behavior may remove app-scoped local data. Whether OS backup restores that data is platform-, configuration-, account-, and app-policy-dependent; verification required.

Android TWA or PWA uninstall risk: uninstalling a Trusted Web Activity shell, removing a PWA install, clearing Chrome storage, or changing Chrome profiles can affect locally stored web data in ways that must be tested on real devices; verification required.

iOS native app uninstall risk: if Shime is later shipped as a native iOS app, deleting the app may remove app container data. Whether iCloud or device backup restores that data depends on native storage choices and backup settings; verification required.

iOS PWA storage risk: iOS web app and Safari storage behavior can differ by version, install mode, storage pressure, and user settings. Any claim that PWA storage survives reinstall, offload, browser cleanup, or device restore requires real-device testing; verification required.

Desktop and mobile browser clear-site-data risk: browser actions such as clear browsing data, site settings reset, storage deletion, profile removal, or browser uninstall can erase local Shime data. This is a core data-survival risk for local-first web storage; verification required for each target browser and OS.

Private or incognito mode risk: private or incognito sessions are commonly temporary. Users may create study data that disappears after the session closes. Shime must treat private-session storage as high risk and must not imply durable data survival; verification required for browser-specific behavior.

Browser switch risk: local-first browser storage is usually scoped to the browser profile and origin. Moving from Chrome to Safari, Edge, Firefox, or a mobile browser does not automatically carry data with it. A user-controlled backup file is the safest cross-browser bridge until separately verified alternatives exist.

Device loss or broken device risk: if all learning data exists only on one device, loss, theft, factory reset, or hardware failure can make that data unrecoverable. Local-first privacy does not solve physical device loss.

Storage pressure or quota eviction risk: browsers and mobile operating systems may constrain or evict site storage under low-space conditions. Shime must verify quota behavior on real browsers and devices before claiming resilience; verification required.

Platform backup verification-required flags: Android backup, iOS backup, browser profile backup, PWA install state, TWA behavior, and native wrapper data preservation are all verification required. Phase 23A records risks and decisions; it does not verify platform backup behavior.

## Data survival risk matrix

| Scenario | Primary risk | User impact | Phase 23A stance |
|---|---|---|---|
| Android native app uninstall risk | App-scoped data may be removed | Decks, reviews, and settings may be lost | verification required before claims |
| Android TWA or PWA uninstall risk | Web storage or shell-associated data may be removed or orphaned | User may expect reinstall to restore data | verification required before claims |
| iOS native app uninstall risk | App container data may be deleted | User may lose all local learning history | verification required before claims |
| iOS PWA storage risk | Safari/PWA storage may be version- and pressure-dependent | Data may not survive cleanup, reinstall, or restore | verification required before claims |
| Desktop and mobile browser clear-site-data risk | User or browser deletes origin storage | Local decks and review history may disappear | must be surfaced as a risk |
| Private or incognito mode risk | Storage may be temporary | Data may vanish when session closes | warn and discourage serious use |
| Browser switch risk | Storage does not automatically move | New browser appears empty | require user-controlled backup/import |
| Device loss or broken device risk | Device-local data becomes unreachable | No recovery without backup | backup habit is required |
| Storage pressure or quota eviction risk | Browser or OS removes storage | Unexpected local data loss | verification required and backup health needed |

## User expectations

User expectations and misunderstanding risks are high because many learners treat an installed app as something that will survive uninstall, reinstall, phone replacement, or account sign-in. Shime currently must not rely on those assumptions. The product language must explain that local-first keeps data under user control by default, but the user still needs a backup file stored somewhere outside the app or browser.

Users may also misunderstand backup, export, restore, sync, and platform backup as interchangeable. Phase 23A keeps these terms separate: a user-controlled backup file is a portable artifact; platform backup behavior is verification required; sync/cloud/account/backend functionality is not claimed.

## Local-first is not data-safe by itself

Local-first is not data-safe by itself. Local-first reduces cloud dependency and improves user control, but it does not protect against uninstall, device loss, broken devices, clear browsing data, browser switch, private sessions, quota eviction, or storage pressure. Treating local-first as automatic data safety would transfer risk to learners.

## User-controlled backup file strategy

The safest near-term strategy is a user-controlled backup file that can be exported, inspected, stored outside Shime, and imported later. The file should remain the primary bridge for device transfer and browser transfer until adapter-aware backup/export/restore and any later optional sync have their own evidence gates.

Phase 23A does not make backup/export/restore adapter-aware. The strategy implication is that later phases should design user-facing copy and checks around backup freshness, backup location, and restore confidence without claiming guaranteed data-loss prevention.

## Backup health implications

Backup health implications include showing whether the user has a recent backup, whether the current local data has changed since that backup, and whether the backup file is stored outside risky local browser/app storage. A backup health surface should be calm and visible enough to support routine protection, not a panic-only warning.

Phase 23A does not implement a backup health indicator. It establishes that backup health is a required product design topic before beta-readiness can be reconsidered.

## Backup reminder implications

Backup reminder implications include timed reminders, change-based reminders after meaningful learning activity, and reminders before risky actions. Reminders must avoid implying cloud or platform recovery exists. They should point users toward a user-controlled backup file and plain Vietnamese copy.

Phase 23A does not implement reminders. It records the need for a later design decision before runtime work.

## Pre-risk-action friction implications

Pre-risk-action friction implications include warning users before import overwrite, clear-local-data actions, browser cleanup guidance, PWA uninstall guidance, device migration, or other actions that could make local data disappear. Friction should be strongest when there is no recent backup and softer when backup health is good.

Phase 23A does not implement pre-risk-action friction. It defines the research basis for that later UX work.

## Verification-required flags

- Android native app uninstall risk: verification required.
- Android TWA or PWA uninstall risk: verification required.
- iOS native app uninstall risk: verification required.
- iOS PWA storage risk: verification required.
- Desktop and mobile browser clear-site-data risk: verification required.
- Private or incognito mode risk: verification required.
- Browser switch risk: verification required.
- Device loss or broken device risk: verification required for recovery workflows.
- Storage pressure or quota eviction risk: verification required.
- Platform backup verification-required flags: Android backup, iOS backup, browser profile backup, PWA install state, TWA behavior, and native wrapper preservation.

## What Phase 23A can claim

Phase 23A can claim a completed docs-only research gate for local data survival risks. It can claim that the uninstall, device-loss, clear-site-data, private-session, browser-switch, storage-pressure, PWA, TWA, native-wrapper, backup-health, backup-reminder, and pre-risk-action-friction risks have been identified for later design and evidence phases.

## What Phase 23A must not claim

Phase 23A does not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Phase 23B–23F roadmap implication

Phase 23B–23F roadmap implication: Phase 23A should be followed by UX and evidence planning, not runtime implementation. The staged path remains:

1. Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc.
2. Phase 23C — Backup Health / Last-Backup Indicator Design Doc.
3. Phase 23D — Backup Reminder + Pre-Risk-Action Friction Design Doc.
4. Phase 23E — Evidence-Run Plan for Data-Survival Comprehension.
5. Phase 23F — Phase 23 Decision Gate.

## Guardrails

- Docs/research/static-validator/CI-only.
- No runtime behavior change.
- No source, tests, e2e, service worker, dependency, ADR, storage runtime, backup runtime, restore runtime, FSRS runtime, sync, cloud, account, auth, backend, telemetry, or analytics change.
- Platform behavior remains verification required unless proven by future evidence runs.
- Phase 23A keeps the Phase 22H HOLD posture intact.

## Next recommended phase

Next recommended phase: Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc
