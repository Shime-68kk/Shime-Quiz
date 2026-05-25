# Phase 35A — Leader UI Structural Scope Gate Summary

## Status tokens

```text
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_STATUS: COMPLETED_LEADER_UI_SCOPE_GATE
PHASE35A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
PHASE35A_SCOPE_TYPE: DESIGN_SCOPE_GATE_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35A_UI_PLAN_HANDLING: STRATEGIC_REFERENCE_NOT_FULL_IMPLEMENTATION
PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED
```

This document is for internal review only. Not for public use.

Phase 35A is a structural scope gate and does not implement runtime UI changes.
Phase 35A treats `shime-ui-plan.md` as strategic reference, not a full implementation mandate.
Phase 35A confirms LIMITED_BETA_CANDIDATE remains the highest approved readiness status.
Phase 35A does not approve BETA_READY.
Phase 35A does not approve public production readiness.

---

## Scope

Phase 35A is a docs/design/testing/release/planning/static-validator/CI-only phase.

No runtime source changes. No unit test changes. No e2e test changes. No production-visible UI changes. No route/navigation/settings/library/dashboard runtime wiring. No package/dependency changes. No storage/backup/restore changes. No import parser changes. No local database pipeline changes. No prompt builder changes. No file drop-zone lifecycle changes. No scheduler/FSRS behavior changes. No sync/cloud/account/auth/backend. No telemetry/network calls. No BETA_READY approval. No public production readiness approval. No broad redesign implementation.

---

## Current readiness

```text
Controlled limited beta:    GO_CONTROLLED_LIMITED_BETA_WITH_LIMITATIONS (confirmed, not promoted)
Highest approved readiness: LIMITED_BETA_CANDIDATE (unchanged)
BETA_READY:                 NOT APPROVED (Phase 30C hold not lifted)
Public production:          NOT APPROVED
```

Phase 35A does not change any readiness status. All 10 inherited limitations from Phase 32F remain unresolved and are carried forward.

---

## Summary of decision

```text
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
```

Phase 35A has reviewed the current UI evidence and the `shime-ui-plan.md` strategic reference. The decision is to proceed to Phase 35B with the Library Bookshelf Tab System as the first small runtime UI implementation candidate.

This decision was reached based on:
- Library is the highest-urgency structural problem (import tools and study shelf overlap creates immediate cognitive overload).
- Library Bookshelf Tab System can be implemented as local UI state only, without data model, storage, or import pipeline changes.
- Rollback is simple (remove component/CSS diff).
- The UI plan rates this as its highest-priority structural change.

---

## What was reviewed

| Input reviewed | Summary |
|---|---|
| `leader-ui-shime-quiz-handoff.md` | Post-34C Leader UI context and guardrails |
| `shime-ui-plan.md` | Broad strategic UI research with 8 upgrade candidates |
| Phase 34A–34C docs | Design gate, implementation, and evidence review for Leader UI effects |
| Screenshot observations | 5 screens: Landing, Overview, Library, Study Room, Settings |

Eight UI upgrade candidates from the UI plan were evaluated:
1. Library Bookshelf Tab System — CHOSEN for Phase 35B
2. Dashboard simplification / Progress Journal split — Deferred to Phase 35D/35E
3. Hybrid Sliding Navigation Indicator — Deferred to Phase 35F
4. Elastic Button Compression — Deferred to Phase 35G
5. Study Room answer/feedback polish — Deferred to Phase 35H
6. Streak Fire Ignition — Deferred to Phase 35J
7. Collapsible Header — Deferred to Phase 35K
8. Dynamic Canvas Themes — Deferred to Phase 35L+ (gate only if explicitly approved)

---

## What Phase 35A supports

- Treating `shime-ui-plan.md` as a strategic reference for a staged, safe UI roadmap.
- Identifying Library cognitive overload and Dashboard cognitive overload as the two confirmed structural problems.
- Selecting Library Bookshelf Tab System as the first small runtime UI implementation candidate for Phase 35B.
- Preparing a Phase 35B seed with strict implementation constraints and guardrails.
- Creating a staged Leader UI roadmap (Phase 35B through Phase 35L+) that sequences structural fixes before micro-interaction polish.
- Confirming all readiness and data-safety guardrails remain in place.

---

## What Phase 35A does not approve

```text
Phase 35A does not approve BETA_READY.
Phase 35A does not approve public production readiness.
Phase 35A does not approve broad validation or stress-tested readiness.
Phase 35A does not approve guaranteed data-loss prevention.
Phase 35A does not approve storage, backup, restore, sync, cloud, backend, account, auth, telemetry, or network changes.
Phase 35A does not approve import parser, local database pipeline, prompt builder, file drop-zone lifecycle, scheduler, FSRS, data model, or route behavior changes.
Phase 35A does not approve Dynamic Canvas Themes implementation.
Phase 35A does not approve 3D card flip, confetti, casino-like effects, sound, or distracting animation.
Phase 35A does not approve Dashboard deconstruction implementation (deferred to Phase 35D/35E with separate gate).
Phase 35A does not approve Hybrid Sliding Navigation Indicator implementation (deferred to Phase 35F).
Phase 35A does not approve Streak Fire Ignition implementation (deferred to Phase 35J with gate).
Phase 35A does not approve Collapsible Header implementation (deferred to Phase 35K with research gate).
```

---

## Chosen Phase 35B candidate

```text
Library Bookshelf Tab System
```

- Default tab: `Kệ sách của tôi` — learner-facing study shelf.
- Secondary tab: `Xưởng nạp tài liệu` — import and configuration workshop.
- Implementation: local UI state only (`useState` tab controller).
- No import parsers, database pipelines, prompt builders, or drop-zone lifecycles modified.
- No storage or data model changes.
- Reduced motion: instant or non-animated tab switch acceptable.
- Rollback: remove small component/CSS diff.

See `docs/planning/phase35b-leader-ui-library-bookshelf-seed.md` for full implementation seed.

---

## Limitations carried forward

All 10 inherited limitations from Phase 32F remain unresolved through Phase 35A:

1. Restore rehearsal browser lane — BLOCKED_DEFAULT_OFF
2. Adapter-awareness browser lane — BLOCKED_DEFAULT_OFF
3. Generated/test stress evidence — smoke-level only
4. Rollback/removal evidence — simulation-only
5. No real learner data evidence
6. No public production readiness evidence
7. No guaranteed data-loss prevention
8. Ordinary-user Data Safety UX visibility — internal only
9. No sync/cloud/account/auth/backend evidence
10. Phase 30C Beta Ready hold not lifted

Phase 35B implementation must operate within LIMITED_BETA_CANDIDATE constraints subject to all 10 limitations.

---

## Validation summary

Phase 35A validation:

- `git diff --name-only origin/main...HEAD`: confirms only Claude-lane owned docs files changed.
- Static validator (Codex lane): checks required tokens, headings, candidate names, roadmap structure, and no-forbidden-file constraints.
- CI (`e2e-smoke.yml`): registers Phase 35A validator as the active check.

Note: Full validator pass requires Codex lane integration. Claude docs/design lane validation is limited to `git diff --name-only` check confirming only owned files changed.

Phase 35A validator may not be fully available until Codex lane is integrated.

---

## Guardrails

The following product guardrails remain in force for all future Leader UI phases:

- No new dependencies unless separately justified and approved.
- No package file changes in UI-only phases.
- No storage writes in visual-only work.
- No network calls or telemetry.
- No route/data model changes unless explicitly scoped.
- No backup/export/restore module changes.
- No sync/cloud/backend/account/auth changes.
- No FSRS scheduling behavior changes.
- No Data Safety UX visibility behavior changes.
- Every UI phase must include: `prefers-reduced-motion` support, keyboard/focus visibility, no layout shift where avoidable, short motion duration (120–250ms), no animation blocking quiz interaction, rollback/removal plan, screenshot/manual evidence plan.

---

## Next recommended phase

```text
Next recommended phase: Phase 35B — Leader UI Library Bookshelf Tab System
```

Phase 35B will implement the Library Bookshelf tab split as a small, safe, local-UI-state runtime change.
Phase 35A is a structural scope gate and does not implement runtime UI changes.
