# Phase 35E — Dashboard Calm Home Evidence

## Status tokens

PHASE35E_DASHBOARD_CALM_HOME_STATUS: COMPLETED_DASHBOARD_CALM_HOME_IMPLEMENTATION

PHASE35E_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35E_DASHBOARD_CALM_HOME_DECISION: READY_FOR_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

PHASE35E_RUNTIME_SCOPE: DASHBOARD_LOCAL_UI_SEGMENTATION_ONLY_NO_DATA_OR_SCHEDULER_CHANGES

PHASE35E_DASHBOARD_DEFAULT_VIEW: HOM_NAY_DEFAULT_LEARNER_FACING_CALM_HOME

## Scope

Phase 35E is limited to Dashboard-local UI segmentation. It adds a default `Hôm nay` view and a secondary `Nhật ký tiến độ` view without changing routes, storage, import, scheduler, sync, auth, backend, telemetry, or package behavior.

## Inputs from Phase 35D

Phase 35D identified `src/routes/Dashboard.jsx` as the Dashboard assembly point and kept `src/dashboard/DashboardLearningDataContext.jsx` out of this runtime UI phase. Phase 35D-HF1 is visible on `origin/main` at merge commit `8e243a5`.

## Implementation summary

`/dashboard` now renders a two-button accessible tab switcher after the existing page header. `Hôm nay` is the local default state and keeps the learner action surfaces visible. `Nhật ký tiến độ` contains analytics, mastery, schedule, practice, study history, data source, and library summary surfaces.

## Changed files

- `src/routes/Dashboard.jsx`
- `src/styles/global.css`
- `tests/unit/dashboardCalmHomeTabs.test.jsx`
- `docs/testing/phase35e-dashboard-calm-home-evidence.md`
- `docs/release/phase35e-dashboard-calm-home-summary.md`
- `docs/planning/phase35f-dashboard-calm-home-evidence-review-seed.md`
- `scripts/validate-phase35e-dashboard-calm-home.js`
- `.github/workflows/e2e-smoke.yml`

## Default Hôm nay view evidence

Static and browser evidence confirm `/dashboard` opens with `Hôm nay` selected (`aria-selected="true"`). `Chào mừng quay lại`, the `Học tiếp` CTA, `DashboardTodayCard`, `TodayJourneyCard`, and `StudyGoalCard` remain in the default panel. The progress panel carries the native `hidden` attribute by default.

## Nhật ký tiến độ view evidence

The secondary tab is reachable by button. After switching, `Nhật ký tiến độ` reports `aria-selected="true"`, the default panel carries `hidden`, and the progress panel exposes `Nguồn dữ liệu`, `HistoryAnalyticsPanel`, `MasteryInsightsPanel`, `ReviewSchedulePanel`, `SmartPracticePanel`, `StudyHistoryPanel`, and the existing library summary cards.

## Raw UI state preservation notes

Both Dashboard panels stay mounted through the `hidden` attribute. Inactive panel controls are not keyboard reachable because native `hidden` removes the panel from the accessibility tree and tab order.

## Existing Dashboard test assumptions

Existing smoke and onboarding assumptions still pass because the welcome header, `Học tiếp`, and first-run onboarding remain visible by default. No E2E assertions needed to move behind the progress tab.

## E2E updates, if any

No E2E spec files were changed.

## Accessibility and keyboard evidence

The switcher uses real buttons with `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, `role="tabpanel"`, and `aria-labelledby`. Keyboard tabbing reached `Hôm nay` and `Nhật ký tiến độ` with visible solid focus outlines. Native `hidden` prevents inactive-panel controls from being reached through normal tab order.

## Reduced-motion evidence

The tab switcher does not require animation. CSS transitions on Dashboard tabs are disabled under `prefers-reduced-motion: reduce`; a Playwright reduced-motion context switched immediately to `Nhật ký tiến độ` and displayed `Nguồn dữ liệu`.

## Mobile and responsive evidence

At 375px width, the tabs stack to full-width touch targets and the document has no horizontal overflow (`scrollWidth=375`, `clientWidth=375`, `bodyScrollWidth=375`). The default `Hôm nay` view keeps `Học tiếp` and today surfaces near the top.

## Forbidden system change review

No data, query, scheduler, storage, parser, import, backup, restore, sync, auth, backend, telemetry, package, dependency, or unrelated route files were changed.

## Claim guardrail review

Phase 35E keeps the project at limited beta candidate status. It does not approve beta ready status, public release readiness, broad validation, stress claims, data-loss guarantees, cloud/backend/sync, telemetry, AI/OCR behavior, Dynamic Canvas Themes, or a broad Dashboard redesign.

## Validation summary

Validation results:

- `npm ci --include=dev --ignore-scripts --no-audit --no-fund --progress=false`: passed.
- `node scripts/validate-phase35e-dashboard-calm-home.js`: passed.
- `npm run build`: passed; Vite reported the existing chunk-size warning.
- `npm run test:unit`: passed, 53 files and 2642 tests.
- `npm run test:e2e:smoke`: passed, 7 tests.
- `npm run test:e2e:onboarding`: passed, 3 tests.
- `git diff --check`: passed.

The Phase 35E validator checks required files, status tokens, docs headings, workflow registration, changed-file boundaries, Dashboard tab semantics, CSS requirements, and claim guardrails.

## Risks and follow-up

This phase does not redesign the content inside either panel. Phase 35F should review browser evidence and decide whether fixes are needed before any later UI polish scope.

## Decision

PHASE35E_DASHBOARD_CALM_HOME_DECISION: READY_FOR_PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

## What Phase 35E supports

Phase 35E supports a calmer Dashboard default view with local tab switching and preserved mounted panels.

## What Phase 35E does not approve

Phase 35E does not approve beta ready status, public launch, broad system validation, stress-tested claims, data-loss guarantees, sync/cloud/backend/auth, telemetry, AI/OCR/API-key/BYOK behavior, Dynamic Canvas Themes, navigation indicator work, or a broad Dashboard redesign.

## Next recommended phase

Phase 35F should be an evidence review of the Dashboard Calm Home implementation.
