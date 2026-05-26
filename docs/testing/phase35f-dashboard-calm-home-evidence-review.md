# Phase 35F — Dashboard Calm Home Evidence Review

## Status tokens

PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_STATUS: COMPLETED_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW

PHASE35F_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED

PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35G_NEXT_UI_POLISH_SCOPE

PHASE35F_REVIEW_SCOPE: DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES

PHASE35F_DASHBOARD_CALM_HOME_SCOPE_STATUS: DASHBOARD_CALM_HOME_REVIEWED_AND_CARRIED_FORWARD

PHASE35G_NEXT_UI_POLISH_SCOPE_SEED_STATUS: PREPARED_SCOPE_SEED

## Scope

Phase 35F is a docs, testing, release, planning, static-validator, and CI-only evidence review of the merged Phase 35E Dashboard Calm Home work. It does not change runtime behavior, source code, tests, e2e specs, package files, storage, backup, restore, import parsing, scheduler, FSRS, sync, cloud, backend, auth, telemetry, or data model behavior.

## Inputs from Phase 35E

- Phase 35E merged Dashboard Calm Home evidence in `docs/testing/phase35e-dashboard-calm-home-evidence.md`.
- Phase 35E release summary in `docs/release/phase35e-dashboard-calm-home-summary.md`.
- Phase 35E-HF1 merge on `origin/main` fixing post-merge validator safety.
- Existing E2E smoke and onboarding assertions that keep `/dashboard`, `Chào mừng quay lại`, and `Học tiếp` visible by default.

## Review method

The review checked the merged Phase 35E documentation, source/test references already on `origin/main`, CI registration, and validator safety requirements. No runtime implementation files were edited.

## Dashboard Calm Home evidence review table

| Evidence item | Review result |
| --- | --- |
| default `Hôm nay` view | Passed. Phase 35E evidence records `Hôm nay` as selected by default and the progress panel hidden initially. |
| `Chào mừng quay lại` | Passed. Existing smoke/onboarding assumptions and Phase 35E evidence keep the welcome heading visible by default. |
| `Học tiếp` | Passed. Existing smoke coverage and Phase 35E evidence keep the primary action visible in the default panel. |
| `Nhật ký tiến độ` | Passed. The secondary view remains reachable by button and carries deeper progress content. |
| progress/analytics surfaces | Passed. Analytics, mastery, schedule, practice, study history, data source, and library summary surfaces remain behind the progress journal. |
| E2E smoke | Passed as carried-forward Phase 35E evidence; Phase 35F reruns smoke validation without e2e file changes. |
| E2E onboarding | Passed as carried-forward Phase 35E evidence; Phase 35F reruns onboarding validation without e2e file changes. |
| keyboard/focus behavior | Passed. Phase 35E evidence records button tabs, visible focus, ARIA attributes, and native `hidden` panel behavior. |
| reduced-motion behavior | Passed. Phase 35E evidence records no required animation and reduced-motion transition disabling. |
| mobile 375px behavior | Passed. Phase 35E evidence records full-width tab stacking and no horizontal overflow at 375px. |
| no data/query/scheduler/storage changes | Passed. Phase 35F changed only allowed docs, CI, and static validator files. |
| validator post-merge safety | Passed. The Phase 35F validator supports `pr-diff`, `post-merge-main`, and `validator-hotfix` from initial implementation. |
| claim guardrails | Passed. Limited beta candidate remains the highest approved readiness status. |
| Phase 35G next UI polish scope seed | Passed. A Phase 35G scope seed is prepared without approving implementation. |

## Default Hôm nay view review

The default `Hôm nay` view is accepted as reviewed evidence. Phase 35E evidence records that `/dashboard` opens with `Hôm nay` selected, `Chào mừng quay lại` and `Học tiếp` visible, and learner-facing daily surfaces still available in the default panel.

## Nhật ký tiến độ view review

The `Nhật ký tiến độ` view is accepted as reviewed evidence. It remains a secondary view for deeper progress and analytics surfaces, not the first landing state.

## E2E smoke and onboarding review

The smoke and onboarding assumptions remain appropriate because the merged Phase 35E implementation preserves `/dashboard`, `Chào mừng quay lại`, and `Học tiếp` in the default user path. Phase 35F requires smoke and onboarding commands to run again for evidence review, but does not edit e2e specs.

## Accessibility and keyboard review

Phase 35E evidence is sufficient for this review: the switcher uses button tabs, tabpanel semantics, `aria-selected`, `aria-controls`, `aria-labelledby`, visible focus, and native `hidden` for inactive-panel accessibility and keyboard exclusion.

## Reduced-motion review

Phase 35E evidence is sufficient for this review: the Dashboard Calm Home split does not require animation, and tab transitions are disabled under `prefers-reduced-motion: reduce`.

## Mobile and responsive review

Phase 35E evidence is sufficient for this review: the 375px mobile case keeps the default learner action visible and records no horizontal overflow.

## Forbidden system change review

No forbidden system change is approved or introduced by Phase 35F. Phase 35F does not approve storage/backup/restore behavior changes, import parser changes, scheduler or FSRS changes, sync/cloud/account/auth/backend behavior, telemetry/network calls, package changes, or data model changes.

## Validator post-merge safety review

The Phase 35F validator is intentionally post-merge-main-safe from initial implementation. It verifies `origin/main` availability without running internal `git fetch`, supports `pr-diff`, supports `post-merge-main` when the required files exist and content checks pass with an empty diff, and supports `validator-hotfix` when only the Phase 35F validator changes.

## Claim guardrail review

Phase 35F confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status. Phase 35F does not approve BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, storage/backup/restore behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, or new Dashboard runtime changes.

## Risks and follow-up

Phase 35F relies on carried-forward Phase 35E evidence and repeated validation commands rather than changing implementation. Any visual or behavioral fixes found later must go through a separate scoped phase.

## Chosen review decision

PHASE35F_DASHBOARD_CALM_HOME_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35G_NEXT_UI_POLISH_SCOPE

## Decision rationale

The merged Phase 35E evidence supports carrying Dashboard Calm Home forward to a planning-only next phase. No reviewed item requires immediate Dashboard Calm Home fixes before Phase 35G scope selection.

## What Phase 35F supports

Phase 35F supports carrying the Dashboard Calm Home evidence forward and preparing Phase 35G as the next scope gate.

## What Phase 35F does not approve

Phase 35F does not approve BETA_READY. Phase 35F does not approve public production readiness. Phase 35F does not approve broad validation or stress-tested readiness. Phase 35F does not approve guaranteed data-loss prevention. Phase 35F does not approve storage/backup/restore behavior changes. Phase 35F does not approve sync/cloud/account/auth/backend. Phase 35F does not approve telemetry/network calls. Phase 35F does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 35F does not approve new Dashboard runtime changes. Phase 35F does not approve Navigation indicator implementation. Phase 35F does not approve Elastic Button Compression implementation. Phase 35F does not approve Study Room polish. Phase 35F does not approve Streak Fire. Phase 35F does not approve Collapsible Header. Phase 35F does not approve Dynamic Canvas Themes implementation.

## Next recommended phase

Next recommended phase: Phase 35G — Next UI Polish Scope Gate. Phase 35G is a scope gate and is not automatic runtime implementation.
