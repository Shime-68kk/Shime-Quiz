# Shime Ecosystem Evidence Review

## Purpose

This review checks the Phase 35 Shime intelligence evidence before any dev-only Control Center mount is trusted. It validates artifact presence, benchmark coverage, privacy status, policy matrix coverage, capsule safety, and dry-run markers.

## Current Safe Scope

- Evidence review is implemented in `src/shimeIntelligence/shimeEcosystemEvidenceReview.js`.
- Report generation is implemented in `tools/shimeIntelligence/shimeEcosystemEvidenceReviewReport.mjs`.
- The review reads generated artifacts and writes a deterministic summary under `docs/generated/shime-intelligence/`.
- It does not change app runtime behavior, scheduler behavior, storage, DeviceBridge runtime, firmware, transport, or robot behavior.

## Findings

- The 10000 scenario benchmark and 1000 attack scenario gate are enforced.
- Privacy audit must pass.
- Dry-run, motion lock, timetable suggestion-only, and transport recommendation-only markers are checked.
- Transport simulation diversity can warn if shallow while still remaining safe for a dry-run phase.

## Privacy Model

Generated evidence must contain summaries, buckets, labels, policy identifiers, and dry-run status only. Raw learning content and sensitive fields remain forbidden in valid evidence and UI output.

## Safety Model

`FAIL` blocks the Control Center. `WARN` allows dev-only manual QA only when warnings do not indicate sensitive data, runtime sends, scheduler mutation, or missing privacy gates.

## Manual QA Guidance

- Confirm `docs/generated/shime-intelligence/shime-ecosystem-evidence-review.json` exists.
- Confirm `overallStatus` is not `FAIL`.
- Review warnings before proceeding to human manual QA.
- Confirm Section D is explicit-click and displays labels only.

## Remaining Risks

- Evidence remains simulation-based. Real transport, ESP32 capability handshake, and robot expression mapping require separate future review.
