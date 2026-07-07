# Shime Robot-Led Ecosystem Roadmap

## Purpose

This roadmap defines how Shime can evolve from a local-first learning app into a robot-led learning intelligence ecosystem while preserving learner agency, app authority, and privacy.

## Current Safe Scope

- Roadmap is encoded as data in `src/shimeIntelligence/ecosystemRoadmapModel.js`.
- It is not mounted into production routes.
- It does not create runtime behavior, persistence, network transport, notification, calendar, robot command, or schedule mutation.

## Stages

1. Local-first app intelligence.
2. Device Bridge safe event layer.
3. Companion Cognitive Engine V2.
4. FSRS-to-robot learning capsule.
5. Robot expression-only prototype.
6. ESP32 Wi-Fi/BLE capability handshake.
7. Phone/desktop/robot local pairing.
8. Presence-aware routine support.
9. Timetable suggestion engine.
10. Local-only optional AI research.
11. Privacy-preserving personalization.
12. Motion-capable robot future safety phase.

## Boundaries

- Shime Quiz remains the source of truth.
- Shime Robot receives capsules only.
- No stage allows raw learning payloads to robot.
- No stage allows robot schedule mutation without a separate future safety gate.
- Notification and calendar integrations are not implemented in this phase.

## Privacy Model

Every stage requires a redacted/coarse capsule privacy gate. Raw learning data, settings, study history, backups, imported document content, camera data, audio, and biometric identity remain outside robot-facing outputs.

## Safety Model

Each stage has a safety gate, privacy gate, and manual QA gate. Motion-capable behavior is explicitly deferred to a future high-risk safety phase.

## Manual QA Guidance

- Confirm roadmap evidence is generated under `docs/generated/shime-intelligence/shime-roadmap-evidence.md`.
- Confirm the roadmap does not imply production robot behavior is active.
- Confirm each stage preserves local-first authority.

## Remaining Risks

- Product messaging must keep future capabilities clearly separated from current dry-run logic.
- Pairing and transport phases need separate security review before implementation.
