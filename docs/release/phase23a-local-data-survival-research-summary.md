# Phase 23A — Local Data Survival Research Summary

## Status token

PHASE23A_DATA_SURVIVAL_RESEARCH_STATUS: COMPLETED_DOCS_ONLY

## Scope

Phase 23A is a docs-only research gate.
Phase 23A does not implement runtime data-survival behavior.
Phase 23A does not make Shime BETA_READY.
Phase 23A does not make backup/export/restore adapter-aware.
Phase 23A does not verify platform backup behavior.

This release summary records the Phase 23A research stance only. It does not change application behavior, storage behavior, backup/export/restore behavior, or platform support.

## Research summary

Phase 23A identifies local data survival as a separate product safety problem from local-first privacy. The main finding is that local-first is not data-safe by itself: uninstall, device loss, broken devices, clear browsing data, browser switches, private or incognito sessions, storage pressure, quota eviction, PWA uninstall, TWA uninstall, native wrapper uninstall, and platform backup uncertainty can still cause data loss without a user-controlled backup file.

The Opus Phase 23 report was used as strategic input, especially its warning that local-first should not push data-loss risk onto users. Platform-specific behavior from that report remains verification required.

## Key risks identified

- Android native app uninstall risk: verification required.
- Android TWA or PWA uninstall risk: verification required.
- iOS native app uninstall risk: verification required.
- iOS PWA storage risk: verification required.
- Desktop and mobile browser clear-site-data risk: verification required.
- Private or incognito mode risk: verification required.
- Browser switch risk: verification required.
- Device loss or broken device risk: local-only data can become unreachable without backup.
- Storage pressure or quota eviction risk: verification required.
- Platform backup verification-required flags: Android backup, iOS backup, browser profile backup, PWA install state, TWA behavior, and native wrapper preservation.
- User expectations and misunderstanding risks: users may assume reinstall, app-store backup, device backup, account sign-in, backup, restore, and sync are equivalent when they are not.

## Product stance

Shime should continue treating a user-controlled backup file as the near-term data-survival foundation. Backup health, backup reminders, and pre-risk-action friction should be designed before runtime storage or sync work resumes. Platform backup behavior must not be presented as protection until it is verified.

## What Phase 23A can claim

Phase 23A can claim that the local data survival risk landscape has been documented as a research gate and that future Phase 23 work has a scoped basis for Vietnamese copy, backup health design, reminder design, pre-risk-action friction design, and comprehension evidence planning.

## What Phase 23A must not claim

Phase 23A does not claim BETA_READY, local-first hybrid beta ready, sync exists, cloud sync exists, account/auth/backend exists, production sync ready, production IndexedDB storage exists, storage migration complete, backup/export adapter-aware, restore adapter-aware, guaranteed data-loss prevention, platform backup will preserve user data, built-in AI, AI quiz generation, OCR, external AI/API integration, or beta-ai public naming acceptable.

## Guardrails

- Docs/research/static-validator/CI-only.
- No runtime behavior change.
- No source, tests, e2e, service worker, dependency, ADR, storage runtime, backup runtime, restore runtime, FSRS runtime, sync, cloud, account, auth, backend, telemetry, or analytics change.
- Platform-specific behavior remains verification required.
- Phase 23A preserves the Phase 22H HOLD posture.

## Next recommended phase

Next recommended phase: Phase 23B — Data-Survival UX and Vietnamese Copy Decision Doc
