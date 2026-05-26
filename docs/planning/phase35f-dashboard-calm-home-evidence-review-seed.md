# Phase 35F — Dashboard Calm Home Evidence Review Seed

## Status token

PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_PLANNING_SEED

## Purpose

Review Phase 35E evidence for the Dashboard Calm Home / Progress Journal split. Phase 35F is an evidence review, not automatic next runtime implementation.

## Inputs from Phase 35E

- Phase 35E patch and handoff.
- `docs/testing/phase35e-dashboard-calm-home-evidence.md`
- `docs/release/phase35e-dashboard-calm-home-summary.md`
- Validation command outputs and browser evidence.

## Review surfaces

- `/dashboard` default `Hôm nay` view.
- `Nhật ký tiến độ` secondary view.
- Keyboard and screen-reader semantics for tabs and panels.
- 375px responsive behavior.
- Reduced-motion behavior.
- Claim guardrails and forbidden system-change boundaries.

## Evidence required

Reviewers should verify that `Chào mừng quay lại`, `Học tiếp`, daily/today journey, and study goal surfaces remain visible by default, and that progress-journal surfaces are visible only after switching tabs.

## Non-goals

No data/query/scheduler/storage changes, no import/parser changes, no sync/cloud/backend/auth work, no telemetry, no dependency changes, no broad Dashboard redesign, and no automatic readiness upgrade.

## Decision options

HOLD_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

NEEDS_DASHBOARD_CALM_HOME_FIXES

PASS_TO_PHASE35G_NEXT_UI_POLISH_SCOPE

## Forbidden default approvals

Phase 35F must not default-approve beta ready status, public launch readiness, broad validation, stress-tested readiness, data-loss guarantees, sync/cloud/backend/auth, telemetry, AI/OCR/API-key/BYOK behavior, Dynamic Canvas Themes, or a broad Dashboard redesign.

## Recommended next step

Run a focused evidence review and choose one of the explicit decision options before starting any Phase 35G work.

