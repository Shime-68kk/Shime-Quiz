# Phase 35A — Leader UI Structural Scope Review

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

---

## Scope review

Phase 35A scope is bounded to:

- Creating four docs/design/testing/release/planning files.
- Creating the Phase 35A static validator script (Codex lane).
- Updating `.github/workflows/e2e-smoke.yml` to register the Phase 35A validator (Codex lane).

The Claude docs/design lane owns only:

```text
docs/design/phase35a-leader-ui-structural-scope-gate.md
docs/testing/phase35a-leader-ui-structural-scope-review.md
docs/release/phase35a-leader-ui-structural-scope-summary.md
docs/planning/phase35b-leader-ui-library-bookshelf-seed.md
```

No source files, test files, package files, or runtime files are touched in Phase 35A.

Scope review: PASS — no scope expansion identified.

---

## Inputs reviewed

The following inputs were reviewed for Phase 35A:

| Input | Review result |
|---|---|
| `leader-ui-shime-quiz-handoff.md` | Reviewed. Context, guardrails, and recommended next-step plan consumed correctly. |
| `shime-ui-plan.md` | Reviewed. Treated as strategic reference only. Not used as a full implementation mandate. |
| Phase 34A design spec | Reviewed. Effect boundaries E01–E04 confirmed. |
| Phase 34B implementation evidence | Reviewed. E01–E03 active, E04 inactive/deferred. |
| Phase 34C evidence review decision | Reviewed. PASS_LEADER_UI_EFFECTS_WITH_LIMITED_EVIDENCE confirmed. |
| Screenshot observations (5 screens) | Reviewed. Landing, Overview, Library, Study Room, Settings observations recorded. |

Input review: PASS — all required inputs reviewed and consumed correctly.

---

## Screenshot evidence reviewed

Five screens were reviewed for structural problem identification.

| Screen | Problem observed | Urgency | Action |
|---|---|---|---|
| Landing | None — calm, clean entry layout | None | No immediate action needed |
| Overview (Dashboard) | Cognitive overload — analytics widgets dominate app-open experience | MODERATE | Deferred to Phase 35D/35E (scope gate required first) |
| Library | Cognitive overload — import tools and study shelf share same visual plane | HIGH | Chosen for Phase 35B: Bookshelf Tab System |
| Study Room | No structural blocker — E01–E02 effects active from Phase 34B; E04 deferred | None | Polish deferred to Phase 35H |
| Settings | No structural blocker — Data Safety UX present (default-off); minor textarea behavior risk noted | Low | Deferred to Phase 35I |

Screenshot evidence review: PASS — observations recorded accurately. Library identified as highest-urgency structural problem. Phase 35B candidate selection is supported by evidence.

---

## Candidate comparison review

Eight candidates were evaluated in the comparison table. Review of each:

| Candidate | Decision | Review |
|---|---|---|
| Library Bookshelf Tab System | CHOSEN for Phase 35B | Correct. Highest urgency, lowest risk, local UI state only, no forbidden area changes required. |
| Dashboard simplification / Progress Journal split | Deferred to Phase 35D/35E | Correct. Larger change surface; needs scope gate before implementation. |
| Hybrid Sliding Navigation Indicator | Deferred to Phase 35F | Correct. Micro-interaction polish; not a structural blocker; defer until structural screens stable. |
| Elastic Button Compression | Deferred to Phase 35G | Correct. CSS-only micro-interaction; not a structural blocker. |
| Study Room answer/feedback polish | Deferred to Phase 35H | Correct. Study Room functional; Phase 34B effects already active. |
| Streak Fire Ignition | Deferred to Phase 35J | Correct. Motivational polish; must not change scheduler or persistence. |
| Collapsible Header | Deferred to Phase 35K | Correct. Requires separate navigation/header ownership gate. Complex scroll/state interaction. |
| Dynamic Canvas Themes | Deferred to Phase 35L+ (gate only) | Correct. High implementation risk; requires separate data-safety and theme-state design gate. |

Candidate comparison review: PASS — all eight candidates evaluated. One candidate chosen. All deferred items recorded with rationale.

---

## Roadmap safety review

The staged roadmap was reviewed against the following safety criteria:

- Does not combine all major UI changes into a single runtime phase: PASS
- Each phase is independently scoped: PASS
- Structural phases precede micro-interaction phases: PASS
- Dynamic Canvas Themes explicitly gated/deferred: PASS
- Dashboard deconstruction has a separate scope gate (35D) before implementation (35E): PASS
- Navigation indicator has its own phase (35F) separate from structural work: PASS
- Advanced features (Streak Fire, Collapsible Header, Dynamic Themes) are in later phases (35J, 35K, 35L+): PASS
- All phases require prefers-reduced-motion, keyboard visibility, no layout shift, short motion duration: CONFIRMED in roadmap spec

Roadmap safety review: PASS

---

## Phase 35B seed review

The Phase 35B seed in `docs/planning/phase35b-leader-ui-library-bookshelf-seed.md` was reviewed:

| Requirement | Status |
|---|---|
| Candidate: Library Bookshelf Tab System | PRESENT |
| Default tab: `Kệ sách của tôi` | PRESENT |
| Secondary tab: `Xưởng nạp tài liệu` | PRESENT |
| Local UI state only | STATED |
| No import parser changes | STATED |
| No local database query/pipeline changes | STATED |
| No prompt builder changes | STATED |
| No file drop-zone lifecycle changes | STATED |
| No backup/restore behavior changes | STATED |
| Preserve raw text/input state during tab switches | STATED |
| Preserve current Library data and study entry behavior | STATED |
| Reduced motion: instant or non-animated tab switch acceptable | STATED |
| Rollback by removing small component/CSS diff | STATED |
| Decision options present | PRESENT |
| Required token: PHASE35B_LIBRARY_BOOKSHELF_SEED_STATUS: PREPARED_SMALL_IMPLEMENTATION_SEED | PRESENT |

Phase 35B seed review: PASS

---

## Guardrail review

The following guardrails from `leader-ui-shime-quiz-handoff.md` and the master spec were reviewed:

| Guardrail | Status in Phase 35A docs |
|---|---|
| No BETA_READY claim | CONFIRMED — all docs state BETA_READY not approved |
| No public production readiness claim | CONFIRMED |
| No guaranteed data-loss prevention claim | CONFIRMED |
| No storage/backup/restore changes | CONFIRMED — no runtime changes in Phase 35A |
| No sync/cloud/backend/account/auth changes | CONFIRMED |
| No telemetry/network changes | CONFIRMED |
| No import parser changes | CONFIRMED |
| No local database pipeline changes | CONFIRMED |
| No prompt builder changes | CONFIRMED |
| No file drop-zone lifecycle changes | CONFIRMED |
| No FSRS/scheduler changes | CONFIRMED |
| No data model changes | CONFIRMED |
| No route/navigation runtime wiring changes | CONFIRMED |
| All 10 inherited limitations carried forward | CONFIRMED — stated explicitly in design doc |
| Phase 30C Beta Ready hold not lifted | CONFIRMED |
| 3D card flip rejected | CONFIRMED |
| Confetti/casino-like effects rejected | CONFIRMED |
| Dynamic Canvas Themes not approved for implementation | CONFIRMED |

Guardrail review: PASS — all guardrails are present and correctly stated across Phase 35A docs.

---

## No runtime implementation review

Confirming Phase 35A has no runtime implementation:

- `src/**` files: NOT CHANGED.
- `tests/**` files: NOT CHANGED.
- `e2e/**` files: NOT CHANGED.
- `package.json` / `package-lock.json`: NOT CHANGED.
- `sw.js`, `boot-guard.js`: NOT CHANGED.
- Backup/restore/export/import/migration/storage files: NOT CHANGED.
- FSRS/scheduler files: NOT CHANGED.
- Sync/cloud/account/auth/backend files: NOT CHANGED.
- Route/navigation runtime wiring: NOT CHANGED.
- Telemetry/analytics: NOT CHANGED.

No runtime implementation review: PASS

---

## Forbidden claims review

The following claims are explicitly forbidden in Phase 35A docs:

| Forbidden claim | Present in docs? | Review |
|---|---|---|
| BETA_READY | Not present | PASS |
| Public production readiness | Not present | PASS |
| Guaranteed data-loss prevention | Not present | PASS |
| Broad validation or stress-tested readiness | Not present | PASS |
| Cloud/sync/backend/account/auth approval | Not present | PASS |
| Dynamic Canvas Themes implementation approval | Not present | PASS |
| 3D card flip approval | Not present | PASS |
| Confetti/casino-like effects approval | Not present | PASS |
| Dashboard implementation in Phase 35A | Not present | PASS |
| Navigation indicator implementation in Phase 35A | Not present | PASS |

Forbidden claims review: PASS

---

## Forbidden system changes review

| Forbidden system | Changed in Phase 35A? |
|---|---|
| Backup / restore / export / import | No |
| Storage drivers / migration | No |
| Database / data model | No |
| Import parsers | No |
| Prompt builders | No |
| File drop-zone lifecycle | No |
| FSRS / scheduler | No |
| Sync / cloud / account / auth / backend | No |
| Telemetry / analytics / network | No |
| Routes / navigation runtime wiring | No |
| Prior phase docs | No |
| Historical validators | No |

Forbidden system changes review: PASS

---

## Validator and CI review plan

The Phase 35A validator (Codex lane) must check:

- Required files exist (4 docs from Claude lane + 1 validator script from Codex lane).
- CI registers Phase 35A validator as the active check.
- Workflow uses `actions/checkout@v4` with `fetch-depth: 0`.
- No shell git fetch step in CI.
- No full historical validator chain.
- No continue-on-error in validator step.
- Validator does not execute internal git fetch.
- Validator verifies origin/main availability.
- Required tokens exist in docs.
- Decision token value is one of the allowed values.
- Required headings exist in all Phase 35A docs and Phase 35B seed.
- Required candidate names present.
- Staged roadmap does not combine all major UI changes into one runtime phase.
- Phase 35B seed names Library Bookshelf Tab System as the first implementation candidate.
- Docs state `shime-ui-plan.md` is strategic reference, not full implementation mandate.
- Docs state no runtime UI changes in Phase 35A.
- Docs do not approve BETA_READY, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention.
- Docs do not approve storage/backup/restore/sync/cloud/backend/account/auth/telemetry/network changes.
- Docs do not approve import parser, database pipeline, prompt builder, drop-zone lifecycle, scheduler, FSRS, data model, or route behavior changes.
- Docs reject or defer Dynamic Canvas Themes, 3D card flip, confetti, casino-like effects, sound, distracting animation.
- Exact changed files match exact allowed files using `origin/main..HEAD`.
- No forbidden files/areas changed.

Note: The Phase 35A validator may not pass until the Codex lane is integrated into the final branch. This Claude docs/design lane produces docs only.

Validator review plan: RECORDED

---

## Reviewer checklist

For a human reviewer reviewing Phase 35A:

- [ ] All four Claude-lane docs files exist under their correct paths.
- [ ] All required status tokens are present in each doc.
- [ ] Decision token is `PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION`.
- [ ] `shime-ui-plan.md` is treated as strategic reference, not full implementation mandate.
- [ ] BETA_READY is not claimed or implied.
- [ ] Public production readiness is not claimed or implied.
- [ ] No runtime source files were modified.
- [ ] No test files were modified.
- [ ] No package files were modified.
- [ ] Candidate comparison table has all 8 required candidates.
- [ ] Library Bookshelf Tab System is chosen as Phase 35B candidate.
- [ ] Dashboard deconstruction is deferred to Phase 35D/35E with rationale.
- [ ] Hybrid nav indicator is deferred to Phase 35F.
- [ ] Dynamic Canvas Themes is deferred to Phase 35L+ gate only.
- [ ] Staged roadmap has correct sequence (35B through 35L+).
- [ ] Staged roadmap does not combine all major UI changes into one phase.
- [ ] Phase 35B seed has all required constraints.
- [ ] Phase 35B seed states default tab `Kệ sách của tôi`.
- [ ] Phase 35B seed states secondary tab `Xưởng nạp tài liệu`.
- [ ] Phase 35B seed states local UI state only.
- [ ] All 10 inherited limitations carried forward.
- [ ] Phase 30C hold not lifted.
- [ ] No forbidden claims present.
- [ ] No forbidden system changes made.

---

## Tester checklist for Phase 35B

When Phase 35B is implemented, the tester must verify:

- [ ] Library opens to `Kệ sách của tôi` tab by default.
- [ ] `Xưởng nạp tài liệu` tab is accessible via tab click.
- [ ] Import tools are visible only in `Xưởng nạp tài liệu` tab.
- [ ] Study shelf (subject/book list) is visible in `Kệ sách của tôi` tab.
- [ ] Tab switch does not flush raw text/input state in import panels.
- [ ] Tab switch does not alter Library data or study entry behavior.
- [ ] Switching tabs multiple times produces no data loss or UI corruption.
- [ ] Study session launch from the shelf works correctly.
- [ ] `prefers-reduced-motion`: tab switch is instant or non-animated (no continuous animation).
- [ ] Keyboard focus: tab controls are keyboard-accessible.
- [ ] No console errors on tab switch.
- [ ] No layout shift on tab switch.
- [ ] Rollback: removing the component/CSS diff restores original Library layout.
- [ ] Build passes after Phase 35B implementation.
- [ ] Unit tests pass after Phase 35B implementation.
- [ ] Phase 35B validator passes.

---

## Open questions

1. Does the Library component render as a single file or is it split across multiple view components? Phase 35B needs to identify the exact file to modify.

2. Are the EduGen configuration panels rendered inside the Library component or injected from a separate route? If injected, conditional visibility may require additional state threading.

3. Does raw text/input state in the import textarea live in local component state or in a higher-level store? Phase 35B must verify this before implementing tab switch to ensure state is not flushed.

4. Is there a `prefers-reduced-motion` media query already in the codebase that Phase 35B can reference as a pattern? Phase 34B's effects CSS uses this pattern.

These questions do not block Phase 35A. They are scoping questions for Phase 35B to resolve during implementation.

---

## Review decision

```text
PHASE35A_LEADER_UI_STRUCTURAL_SCOPE_DECISION: PASS_TO_PHASE35B_SMALL_UI_IMPLEMENTATION
```

Phase 35A scope review is PASS. The docs/design lane has produced:
- Correct design doc with all required headings and tokens.
- Correct testing/review doc (this file) with all required sections.
- Correct release summary doc.
- Correct Phase 35B seed with all required constraints.

All guardrails are in place. No forbidden claims. No forbidden system changes. Phase 35B candidate correctly selected as Library Bookshelf Tab System.

Next step: Integrate Codex validator/CI lane, run full validation suite, produce final patch and handoff.
