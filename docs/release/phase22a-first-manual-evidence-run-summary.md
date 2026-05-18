# Phase 22A — First Manual Evidence Run Summary

## Purpose

Summarize the first actual Phase 22A manual/browser-style evidence run without expanding product claims or changing runtime behavior.

This summary follows the Phase 21G handoff and uses the Phase 21E first-run pack plus Phase 21F capture structure.

## Status

```text
PHASE22A_FIRST_MANUAL_EVIDENCE_STATUS: EXECUTED_WITH_ANONYMIZED_RESULTS
FIRST_MANUAL_EVIDENCE_RUN_EXECUTED: YES
```

HOLD remains active. BETA_READY is not claimed in Phase 22A.

## Execution status

The first manual/browser-style evidence run was executed in a local Playwright Chromium environment on 2026-05-18 using generated/test data only.

## Evidence quality

Evidence quality is useful but partial. The run produced direct browser observations for startup, onboarding copy, generated JSON import, limited Study Room answer flow, backup creation, restore preview and restore completion, manual transfer copy, mobile-sized viewport basics, and claim boundaries.

It is not a substitute for real-user evidence or stress evidence. The scenario coverage includes app startup, onboarding, small library, Study Room, backup, restore, manual transfer, mobile, PWA, trust-copy, Vietnamese-first, FSRS, EduGen, and beta-ai boundary terms.

## What was executed

- `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`
- `npm run build`
- `npm run test:unit`
- `npx playwright install chromium`
- local Vite app run with `npm run dev`
- browser observation against `http://127.0.0.1:4173/`
- generated JSON fixture import
- backup creation before restore testing
- restore preview, overwrite confirmation, and restore completion with disposable data
- limited Study Room answer path
- mobile-sized viewport observation

## What was not executed

CSV import, text/Markdown import, larger library import, storage quota warning trigger, repeated backup/restore rehearsal, transfer to another physical device, PWA install, offline service-worker behavior, stress testing, and real-user comprehension interviews were not executed.

## Pass signals

The app opened, first-run copy rendered, generated JSON import succeeded, Study Room accepted a generated answer and wrote local progress key families, backup download succeeded, restore preview and overwrite confirmation were understandable, restore completed, mobile-sized Library had no horizontal overflow, and no critical browser errors were captured.

## Hold signals

HOLD remains active because Phase 22A is one first-run observation only. Real-user evidence and stress evidence remain incomplete, and broader data-safety evidence is still required.

## Data safety assessment

The run used generated/disposable data and recorded anonymized observations only. No private study content, contact information, credentials, backup file contents, telemetry, analytics, device identifiers, browser fingerprints, geolocation, or account/cloud credentials are committed.

Data-loss prevention is not guaranteed.

## Backup and restore assessment

Backup-before-restore was observed. Restore preview showed file validity, restore support, full-backup mode, recognized-key limits, and PWA cache boundary copy. The confirmation dialog warned that restore can overwrite current Shime data on this device.

Repeated restore rehearsal and failure-path testing remain untested.

## Manual transfer assessment

Observed copy explained the current transfer path as save a backup file here and restore it on another device. It said the flow does not create automatic cloud sync.

Actual transfer to another physical device remains untested.

## Trust-copy comprehension assessment

Visible copy supported local-first/no-cloud/default-off boundaries, but no real-user comprehension interview was performed. Phase 22B should collect tester summaries.

## Vietnamese-first copy assessment

Vietnamese-first UI copy was visible in the exercised flows. Comprehension was not tested with a Vietnamese-speaking real user.

## FSRS and review schedule assessment

FSRS remained boundary-limited in observed copy. Phase 22A does not claim active scheduler readiness, FSRS public rollout readiness, or FSRS sync readiness.

## EduGen boundary assessment

EduGen copy remained framed as separate/configured draft workflow support. Phase 22A does not claim built-in AI, AI quiz generation, OCR, or automatic AI import.

## Mobile/PWA assessment

A mobile-sized Chromium viewport showed Library with mobile navigation and no horizontal overflow. PWA install, offline behavior, and mobile file handling remain untested.

## beta-ai naming assessment

No beta-ai naming appeared in the observed browser flows. beta-ai remains unacceptable public naming.

## Remaining evidence gaps

Remaining gaps include actual real-user sessions, stress runs, larger imports, quota behavior, CSV/text imports, repeated backup/restore rehearsal, cross-device transfer, mobile/PWA file handling, PWA install/offline behavior, and tester comprehension evidence.

## Recommendation

Keep HOLD active. Use Phase 22A as the first actual anonymized run, then proceed to Phase 22B real-user evidence and Phase 22C stress evidence before any readiness re-decision.

## Phase 22B relationship

Phase 22B should fill real-user evidence only from actual anonymized sessions and should not treat this single browser observation as completed real-user testing.

## Phase 22C relationship

Phase 22C should fill stress evidence only from actual stress runs and should not treat this first-run observation as completed stress testing.

## Phase 22D readiness gate

Phase 22D must not reconsider BETA_READY unless enough actual first-run, real-user, and stress evidence exists and unresolved critical data safety hold signals are addressed.
