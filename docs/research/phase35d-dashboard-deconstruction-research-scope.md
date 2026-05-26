# Phase 35D — Dashboard Deconstruction Research Scope

## Status tokens

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_STATUS: COMPLETED_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
PHASE35D_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
PHASE35D_RESEARCH_SCOPE: DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35D_DASHBOARD_SCOPE_STATUS: DASHBOARD_SURFACES_RESEARCHED_AND_PHASE35E_SEEDED
PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION_SEED_STATUS: PREPARED_IMPLEMENTATION_SEED
```

## Scope

Phase 35D is a research, scope, docs, planning, static-validator, and CI-only phase. It does not implement Dashboard runtime changes and does not modify `src/**`, `tests/**`, `e2e/**`, package files, data model files, storage/backup/restore behavior, import parsers, scheduler/FSRS behavior, sync/cloud/backend/auth, telemetry, or route/navigation/settings/library/dashboard UI wiring.

## Inputs from Phase 35C

Phase 35C reviewed the Phase 35B Library Bookshelf tab system and carried it forward as stable input for Dashboard research. `/library` now defaults to `Kệ sách của tôi`, while import/configuration/backup/admin tooling remains behind `Xưởng nạp tài liệu`. Phase 35C did not approve Dashboard runtime redesign.

## Research method

Static inspection only:

- `find src -maxdepth 3 -type f | sort`
- `grep -R "Tổng quan\|Hành trình hôm nay\|Nhật ký\|Xu hướng\|Mức nắm vững\|Lịch sử học\|Câu cần củng cố\|Luyện tập thông minh" -n src tests e2e docs 2>/dev/null || true`
- `grep -R "dashboard\|Dashboard\|overview\|Overview" -n src tests e2e docs 2>/dev/null || true`
- Focused reads of `src/routes/Dashboard.jsx`, `src/dashboard/DashboardLearningDataContext.jsx`, Dashboard learning panels, Dashboard-related tests, and Phase 35A/35C docs.

## Current Dashboard surface inventory

| Dashboard surface | Current purpose | Learner-facing home candidate | Progress Journal candidate | Risk | Phase 35E recommendation |
| --- | --- | --- | --- | --- | --- |
| greeting / welcome header | `PageHeader` in `src/routes/Dashboard.jsx` with `Chào mừng quay lại`, local-data subtitle, and `Học tiếp` CTA. | Keep as top calm-home orientation and primary study entry. | No. | E2E assumes heading and CTA. | Preserve copy and CTA behavior. |
| daily progress summary | `DashboardTodayCard` answers "Hôm nay nên học gì?" using due, plan, mastery, and smart-practice inputs. | Keep as core calm-home surface. | No. | Duplicates `Hành trình hôm nay` when both are expanded. | Make it the primary first-screen learner surface in Phase 35E. |
| `Hành trình hôm nay` | `TodayJourneyCard` combines recommendation, goal, plan steps, progress actions, and feedback. | Keep only the most action-oriented subset. | Plan details and feedback history may move. | Dense and stateful; includes reset/mark-complete actions. | Narrow or reposition below the primary calm home without changing algorithms. |
| goals/targets | `StudyGoalCard` edits local daily target and focus mode. | Keep a compact status or shortcut. | Detailed goal editing may move or stay below fold. | Editing controls increase first-screen complexity. | Keep reachable, but do not combine with broad settings changes. |
| statistics cards | `HistoryAnalyticsPanel` renders six metric cards after history exists. | No, except one lightweight status if needed. | Yes. | Metric grid dominates the page and competes with next-action surfaces. | Move or group under Progress Journal candidate. |
| trends/session analytics | `Xu hướng phiên gần đây` in `HistoryAnalyticsPanel`. | No. | Yes. | Requires history context; not needed for immediate study start. | Move to journal/detail surface. |
| weak/strong topics | History topic lists and mastery topic lists. | Only a small "needs attention" hint if tied to action. | Yes. | Repeated weak-area concepts appear in multiple panels. | Prefer journal/detail, while calm home links to smart practice. |
| mastery/detail sections | `MasteryInsightsPanel` average mastery, evidence count, correct rate, weak item count. | No broad detail. | Yes. | Can imply precision beyond simple local model if overemphasized. | Move/detail under Progress Journal with boundary copy. |
| questions needing reinforcement | `Câu cần củng cố` in `MasteryInsightsPanel`. | Maybe a count plus action. | Yes. | Long prompts can overwhelm mobile and first viewport. | Keep detailed list out of first viewport. |
| review schedule | `ReviewSchedulePanel` shows due count, next due, scheduled count, and due entries. | Keep due count and "Ôn tập hôm nay" route if due. | Full schedule details are journal candidates. | Must preserve mixed-scheduler due-note boundaries. | Surface only action summary on calm home. |
| smart practice | `SmartPracticePanel` lists weighted-practice counts and selected reasons. | Keep CTA when no due review exists. | Detail list can move. | Algorithm details and selected prompt list add cognitive load. | Keep CTA summary only. |
| study history | `StudyHistoryPanel compact` shows recent sessions and detail drawer. | No, except last-session hint if needed. | Yes. | Contains destructive clear-history action and detailed results. | Move/detail under Progress Journal or below calm home. |
| data model / technical status sections | Data source card, summary cards, item type distribution, subject mini-list, mixed-scheduler note. | Keep minimal data-source trust copy for first-run or imported states. | Technical summaries belong outside calm first-screen. | Technical labels can feel administrative and duplicate Library. | Demote, collapse, or move below journal; do not alter data model. |

## Dashboard overload findings

The Dashboard now carries a learner action card, a daily journey planner, editable goals, analytics, mastery, review schedule, smart practice, study history, library/data-source summaries, item-type distribution, subject lists, and scheduler boundary copy. These are individually useful, but together they make `/dashboard` both a home screen and a progress/technical journal. Phase 35E should reduce first-screen decision cost by making the next study action primary while preserving access to detail.

## Calm Home candidate surfaces

- Greeting/welcome header with `Học tiếp`.
- `DashboardTodayCard` as the primary next-action surface.
- Minimal due-review or smart-practice CTA.
- Minimal goal progress status.
- First-run onboarding card and safe Library entry when the app has no meaningful saved study data.
- Minimal local-data/source boundary copy where needed for trust.

## Progress Journal candidate surfaces

- Full `HistoryAnalyticsPanel`.
- Full `MasteryInsightsPanel`, including `Câu cần củng cố`.
- Full `ReviewSchedulePanel` details.
- `StudyHistoryPanel` recent sessions, detail view, and clear-history action.
- Detailed goal editing and plan-step progress history if not needed on calm home.
- Data model, item-type, subject summary, and technical status sections.

## Existing tests and assumptions to protect

- `e2e/smoke.spec.js` opens `/dashboard`, expects `Chào mừng quay lại`, clicks `Học tiếp`, and checks route survival.
- `e2e/onboarding-smoke.spec.js` expects the Dashboard first-run onboarding card to guide to Library safe start options.
- Unit tests inspect `src/routes/Dashboard.jsx` for Vietnamese-first labels, `Lộ trình hôm nay`, `Tổng quan`, mixed-scheduler note wording, no English fallback, and no FSRS four-rating UI.
- `dashboardMixedSchedulerDueCount.test.jsx` protects mixed scheduler due-count behavior and no overclaim copy.
- Several FSRS, backup-health, adapter-awareness, and restore-rehearsal tests assert no broad dashboard route/navigation wiring or no Dashboard source changes for their phases.

## Proposed Phase 35E candidate

Dashboard Calm Home / Progress Journal Split. Phase 35E should be a small runtime candidate that reorganizes Dashboard presentation so the first screen centers on the learner's next action and moves or groups heavy analytics/history/detail surfaces into a clearly secondary progress-journal area. It must not redesign the whole Dashboard.

## Phase 35E allowed files / expected areas

Expected runtime areas for a narrow Phase 35E may include:

- `src/routes/Dashboard.jsx`
- Dashboard-only learning components under `src/components/learning/**`
- Dashboard-only analytics/study panel placement if needed under `src/components/analytics/**` and `src/components/study/**`
- Dashboard-specific CSS in `src/styles/global.css` or a narrow existing style path if the implementation seed authorizes it
- Focused unit/e2e updates that protect the changed Dashboard presentation
- Phase 35E docs, release summary, and validator

## Phase 35E forbidden areas

Phase 35E must not modify package/dependency files, storage/backup/restore modules, import parsers, database/query pipelines, prompt builders, file drop-zone lifecycle implementation, scheduler/FSRS runtime behavior, sync/cloud/account/auth/backend files, telemetry/analytics, data model files, or unrelated route/navigation/settings/library wiring. It must not implement Navigation indicator, Elastic Button Compression, Study Room polish, Streak Fire, Collapsible Header, or Dynamic Canvas Themes.

## Accessibility and mobile considerations

Phase 35E should preserve semantic headings, stable accessible names used by Playwright, keyboard-reachable CTAs, `aria-label` coverage on grouped metrics, `role="status"` for live status copy, and mobile readability at 375px. It should avoid placing long prompt lists, destructive controls, or dense metric grids in the first viewport.

## Risk assessment

Primary risks are breaking existing e2e assumptions around `Chào mừng quay lại` and `Học tiếp`, weakening first-run onboarding safety copy, hiding due-review/smart-practice access, changing scheduler or study-history behavior accidentally, and making Beta Ready/public-readiness claims through copy. The implementation should be layout/presentation scoped and preserve data reads.

## Rollback plan for Phase 35E

Rollback should revert Phase 35E Dashboard presentation edits and any matching focused tests/docs/validator changes. Because Phase 35E must not change storage schema, data model, scheduler, import, or backup behavior, rollback should not require data migration.

## Chosen research decision

```text
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_DECISION: PASS_TO_PHASE35E_DASHBOARD_CALM_HOME_IMPLEMENTATION
```

## Decision rationale

Static evidence shows a clear overload pattern and a bounded next runtime candidate. Dashboard ownership is identifiable, tests protecting critical assumptions are visible, and Phase 35E can be scoped to presentation and test updates while preserving runtime systems.

## What Phase 35D supports

Phase 35D supports preparing Phase 35E as a small Dashboard Calm Home Implementation candidate.

Next recommended phase: Phase 35E — Dashboard Calm Home Implementation

Phase 35E is a small runtime candidate and is not approval for a broad Dashboard redesign.

## What Phase 35D does not approve

Phase 35D confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 35D does not approve BETA_READY.
Phase 35D does not approve public production readiness.
Phase 35D does not approve broad validation or stress-tested readiness.
Phase 35D does not approve guaranteed data-loss prevention.
Phase 35D does not approve storage/backup/restore behavior changes.
Phase 35D does not approve sync/cloud/account/auth/backend.
Phase 35D does not approve telemetry/network calls.
Phase 35D does not approve built-in AI/OCR/API-key/BYOK behavior.
Phase 35D does not approve Dashboard runtime redesign in this phase.
Phase 35D does not approve Navigation indicator implementation.
Phase 35D does not approve Elastic Button Compression implementation.
Phase 35D does not approve Study Room polish.
Phase 35D does not approve Streak Fire.
Phase 35D does not approve Collapsible Header.
Phase 35D does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35E — Dashboard Calm Home Implementation
