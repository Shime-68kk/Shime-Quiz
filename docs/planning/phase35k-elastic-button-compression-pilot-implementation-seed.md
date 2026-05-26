# Phase 35K — Elastic Button Compression Pilot Implementation Seed

## Status token

PHASE35K_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED

## Purpose

Phase 35K should implement a small Elastic Button Compression Pilot selected by Phase 35J. It is a runtime pilot only and is not approval for an app-wide interaction rewrite.

## Inputs from Phase 35J

Phase 35J selected Elastic Button Compression Pilot after comparing remaining UI polish candidates. It confirmed LIMITED_BETA_CANDIDATE remains the highest approved readiness status and did not approve BETA_READY, public production readiness, broad validation, route behavior changes, package/dependency changes, Study Room answer feedback implementation, Streak Fire, Collapsible Header, Dynamic Canvas Themes implementation, or app-wide Elastic Button Compression.

## Runtime candidate

Elastic Button Compression Pilot.

## User-facing intent

Add subtle tactile pressed-state feedback to a narrow set of existing primary action/button surfaces so the interface feels more responsive while preserving behavior, layout, accessibility, and reduced-motion expectations.

## Allowed files / expected areas

Phase 35K may inspect and narrowly modify existing button or primary-action styling surfaces and directly related component class usage only where needed for the pilot. Expected areas are CSS utility/class additions, button class application on a narrow target set, active/pressed visual rules, focus-state preservation, reduced-motion overrides, and evidence documentation.

## Forbidden areas

Phase 35K must not add packages. Phase 35K must not change handlers, route behavior, submit behavior, data behavior, or pointer event routing. Phase 35K must not touch storage/backup/restore/import/parser/scheduler/FSRS/sync/cloud/account/auth/backend/telemetry systems, package files, Study Room answer correctness logic, or scheduler behavior.

## Implementation guidance

Prefer CSS utility/class additions over component rewrites. Target only a narrow set of existing primary action/button surfaces. Keep the compression subtle, reversible, and layout-stable. Do not use broad selectors that affect every button in the app. Do not alter disabled states, accessible labels, focus handling, click handlers, navigation handlers, form submit handlers, or pointer event routing.

## Accessibility and reduced-motion requirements

Preserve keyboard focus visibility, accessible names, tab order, button semantics, disabled behavior, and screen-reader expectations. Include reduced-motion fallback: no scale transform under `prefers-reduced-motion: reduce`.

## Mobile and touch requirements

Include desktop evidence and 375px mobile evidence. Include quick press/release evidence where practical. The pilot must not shrink touch targets, introduce horizontal overflow, clip focus rings, overlap text, create layout shift, or make touch release behavior unreliable.

## Validation required

Run the Phase 35K validator, build, unit tests, smoke E2E, onboarding E2E, whitespace check, and patch apply check against clean `origin/main`. Phase 35K validation must include evidence that no packages were added and no forbidden behavior areas were touched.

## Evidence required

Provide desktop and 375px mobile evidence for each selected pilot surface. Provide reduced-motion evidence showing no scale transform under `prefers-reduced-motion: reduce`. Provide quick press/release evidence where practical. Provide rollback evidence explaining which classes or CSS rules can be removed.

## Rollback plan

Rollback should remove pilot class usage and related CSS rules while leaving behavior handlers, routes, submit behavior, pointer routing, data behavior, dependencies, storage, scheduler, and Study Room answer logic unchanged.

## Decision options

HOLD_ELASTIC_BUTTON_COMPRESSION_PILOT_IMPLEMENTATION

NEEDS_ELASTIC_BUTTON_COMPRESSION_PILOT_REWORK

PASS_TO_PHASE35L_ELASTIC_BUTTON_COMPRESSION_PILOT_EVIDENCE_REVIEW

## Forbidden default approvals

Phase 35K must not approve app-wide Elastic Button Compression, broad validation, stress-tested readiness, public production readiness, storage/backup/restore behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, route behavior changes, package/dependency changes, Study Room answer feedback implementation, Streak Fire, Collapsible Header, or Dynamic Canvas Themes implementation.

## Recommended next step

Next recommended phase: Phase 35K — Elastic Button Compression Pilot Implementation.
