# Phase 35E — Dashboard Calm Home Summary

## Status tokens

PHASE35E_DASHBOARD_CALM_HOME_STATUS: COMPLETED_DASHBOARD_CALM_HOME_IMPLEMENTATION

PHASE35E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35E_DASHBOARD_CALM_HOME_DECISION: READY_FOR_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

PHASE35E_RUNTIME_SCOPE: DASHBOARD_LOCAL_UI_SEGMENTATION_ONLY_NO_DATA_OR_SCHEDULER_CHANGES

PHASE35E_DASHBOARD_DEFAULT_VIEW: HOM_NAY_DEFAULT_LEARNER_FACING_CALM_HOME

## Scope

Dashboard-only runtime UI segmentation: `Hôm nay` by default and `Nhật ký tiến độ` for deeper progress surfaces.

## Current readiness

Current readiness remains `LIMITED_BETA_CANDIDATE`; beta ready remains not approved.

## Runtime result

The Dashboard route keeps the existing header and `Học tiếp` action visible, while moving analytics, mastery, schedule, practice, history, and technical data summaries behind the progress journal tab.

## Chosen decision

PHASE35E_DASHBOARD_CALM_HOME_DECISION: READY_FOR_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

## User-facing change

Learners land on `Hôm nay` first and can switch to `Nhật ký tiến độ` when they want the deeper progress journal.

## Evidence summary

Evidence covers default view visibility, secondary tab reachability, panel mounting through `hidden`, keyboard focus, reduced-motion behavior, and 375px responsive behavior with no horizontal overflow.

## Validation summary

Validation passed for the Phase 35E validator, build, unit tests, Playwright smoke, onboarding smoke, and diff whitespace check. Patch apply check is recorded in the final handoff.

## Limitations carried forward

This phase does not change study logic, recommendations, scheduler semantics, storage, backup/restore, import parsing, sync, backend, auth, telemetry, or package dependencies.

## What is supported

Local Dashboard tab segmentation and a calmer default learner-facing home are supported.

## What remains not approved

Beta ready status, public launch readiness, broad validation, stress-tested readiness, data-loss guarantees, sync/cloud/backend/auth, telemetry, AI/OCR/API-key/BYOK behavior, Dynamic Canvas Themes, navigation indicator work, and broad Dashboard redesign remain not approved.

## Guardrails

Vietnamese-first copy remains. FSRS-related copy stays experimental and narrow. No new claims about cloud, telemetry, AI, OCR, account, or backend behavior are introduced.

## Next recommended phase

Phase 35F should review the Dashboard Calm Home evidence before any further runtime UI work.
