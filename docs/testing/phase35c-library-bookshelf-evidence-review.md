# Phase 35C — Library Bookshelf Evidence Review

## Status tokens

```text
PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_STATUS: COMPLETED_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW
PHASE35C_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
PHASE35C_REVIEW_SCOPE: LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE35C_LIBRARY_BOOKSHELF_SCOPE_STATUS: LIBRARY_TAB_SEGMENTATION_REVIEWED_AND_CARRIED_FORWARD
PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE_SEED_STATUS: PREPARED_RESEARCH_SCOPE_SEED
```

## Scope

Phase 35C reviews Phase 35B Library Bookshelf evidence only. It does not change runtime behavior, tests, routes, import logic, storage, backup/restore, scheduler, FSRS, sync, cloud, backend, auth, telemetry, dependencies, or release readiness.

## Inputs from Phase 35B

- `docs/testing/phase35b-library-bookshelf-evidence.md`
- `docs/release/phase35b-library-bookshelf-summary.md`
- Phase 35B runtime commit `c405e0c` and follow-up E2E tab-targeting commits `46bd8fb` and `cb37030`
- Phase 35B merge commit `c2175dd`, visible on `origin/main`

## Review method

The review checked Phase 35B evidence for default tab behavior, workshop tab behavior, mounted panel state preservation, E2E tab-targeting corrections, accessibility, reduced-motion handling, 375px mobile behavior, and forbidden system changes. The review conclusion is limited to whether the Library Bookshelf tab segmentation can be carried forward as an accepted input for the next research/scope phase.

## Library Bookshelf evidence review table

| Review surface | Phase 35B evidence | Review finding | Remaining limitation | Decision impact | Allowed claim | Not allowed claim |
|---|---|---|---|---|---|---|
| default `Kệ sách của tôi` shelf tab | Phase 35B source and browser evidence reported `useState('shelf')`, visible subject/catalog grid, and hidden import/admin controls on initial `/library` load. | Evidence supports carrying forward the learner-facing default shelf tab. | Phase 35C did not implement new runtime checks. | Supports pass to Phase 35D research/scope. | `/library` defaults to the reviewed shelf tab. | Do not claim Dashboard redesign or public readiness. |
| `Xưởng nạp tài liệu` workshop tab | Phase 35B evidence reported import/configuration/backup/admin tooling moved behind the workshop tab. | Evidence supports carrying forward the workshop containment model. | Workshop usability remains bounded to Phase 35B evidence. | Supports pass to Phase 35D research/scope. | Import/admin tooling is behind the reviewed workshop tab. | Do not claim import behavior redesign or expansion. |
| raw input state preservation | Phase 35B evidence reported both panels stay mounted and raw textarea text survived tab switching. | Evidence supports carrying forward the mounted-panel preservation requirement. | No broad data-loss guarantee. | Supports pass to Phase 35D research/scope. | Raw tab-switch input preservation was reviewed. | Do not claim guaranteed data-loss prevention. |
| smoke E2E tab-targeting fix | Commit `46bd8fb` updated the smoke test to target the workshop tab before workshop-only controls. | Evidence supports the corrected smoke assumption after Phase 35B. | Phase 35C docs lane did not own E2E execution. | Supports pass to Phase 35D research/scope. | Smoke test assumptions were reviewed as aligned with tab segmentation. | Do not claim full regression coverage. |
| onboarding E2E tab-targeting fix | Commit `cb37030` updated onboarding smoke coverage to target the workshop tab before workshop-only controls. | Evidence supports the corrected onboarding assumption after Phase 35B. | Phase 35C docs lane did not own E2E execution. | Supports pass to Phase 35D research/scope. | Onboarding test assumptions were reviewed as aligned with tab segmentation. | Do not claim onboarding redesign. |
| accessibility and keyboard behavior | Phase 35B evidence reported tab roles, `aria-selected`, `aria-controls`, focus-visible styling, and hidden-panel keyboard exclusion. | Evidence supports carrying forward the accessible tab structure requirement. | Does not replace a fresh assistive technology audit. | Supports pass to Phase 35D research/scope. | Keyboard and ARIA evidence was reviewed. | Do not claim comprehensive accessibility certification. |
| reduced-motion behavior | Phase 35B evidence reported `prefers-reduced-motion: reduce` suppresses tab transition and tab switching remains immediate. | Evidence supports carrying forward reduced-motion compatibility for this tab system. | Does not approve broader motion changes. | Supports pass to Phase 35D research/scope. | Reduced-motion tab evidence was reviewed. | Do not claim Dynamic Canvas Themes or broader effects. |
| mobile 375px behavior | Phase 35B evidence reported 375px viewport checks with tappable tabs and no horizontal overflow. | Evidence supports carrying forward the narrow-viewport tab behavior. | Does not approve full mobile polish across the app. | Supports pass to Phase 35D research/scope. | 375px Library tab evidence was reviewed. | Do not claim broad mobile readiness. |
| import/parser/database/prompt/drop-zone preservation | Phase 35B evidence reported no changes to import parsers, validators, prompt builder/output review, file processor client, or drop-zone lifecycle. | Evidence supports preserving existing import and prompt behavior. | Phase 35C does not add parser/database stress evidence. | Supports pass to Phase 35D research/scope. | No reviewed import/parser/prompt behavior changes. | Do not claim new import capability or parser correctness expansion. |
| backup/restore/storage/scheduler/FSRS/route preservation | Phase 35B evidence reported no changes to backup/restore behavior, storage files, FSRS/scheduler files, route behavior, packages, or dependencies. | Evidence supports preserving these systems while carrying forward tab segmentation. | No new storage or backup stress testing. | Supports pass to Phase 35D research/scope. | No reviewed backup/storage/scheduler/FSRS/route changes. | Do not claim sync, cloud, backend, or auth behavior. |
| readiness and claim guardrails | Phase 35B and Phase 35C tokens keep `LIMITED_BETA_CANDIDATE` as the highest approved readiness. | Evidence supports maintaining readiness guardrails. | Broad validation and stress-tested readiness remain unapproved. | Required for pass to Phase 35D research/scope. | Limited beta candidate status is carried forward. | Do not claim `BETA_READY`, public production readiness, or broad validation. |
| Phase 35D dashboard research/scope seed | Phase 35C prepares Phase 35D as dashboard deconstruction research/scope, not runtime implementation. | Evidence supports opening a scoped research gate next. | No Dashboard runtime work. | Defines the next phase boundary. | Phase 35D may research and scope Dashboard deconstruction. | Do not claim automatic Dashboard implementation. |

## Default shelf tab review

Phase 35B evidence supports that `/library` defaults to `Kệ sách của tôi`, with learner-facing subject/catalog content visible first and workshop-only controls hidden on initial load. Phase 35C carries forward this default as a reviewed Library Bookshelf requirement.

## Workshop tab review

Phase 35B evidence supports that `Xưởng nạp tài liệu` contains the existing import/configuration/backup/admin tooling. Phase 35C treats this as reviewed segmentation, not as a change to import, backup, storage, or admin behavior.

## E2E smoke and onboarding fix review

Phase 35B follow-up commits updated smoke and onboarding E2E assumptions so workshop-only controls are checked after switching to `Xưởng nạp tài liệu`. Phase 35C carries these corrections forward as evidence that the tests reflect the new tab structure.

## Raw input state preservation review

Phase 35B evidence reports both tab panels remain mounted and raw text input survives switching from workshop to shelf and back. Phase 35C accepts this as evidence for tab-switch preservation only, not a broader data-loss guarantee.

## Accessibility and keyboard review

Phase 35B evidence reports tablist/tab roles, ARIA relationships, visible focus styling, and hidden-panel keyboard exclusion. Phase 35C accepts this as Library Bookshelf tab evidence while keeping comprehensive accessibility certification out of scope.

## Reduced-motion review

Phase 35B evidence reports tab switching remains immediate under reduced-motion preference and tab transition styling is suppressed. Phase 35C carries this forward for the Library tab system only.

## Mobile and responsive review

Phase 35B evidence reports that the tab system remains readable and tappable at 375px width with no horizontal overflow. Phase 35C carries this forward without approving broad mobile readiness across other app surfaces.

## Forbidden system change review

Phase 35B evidence reported no import parser, database/query, prompt builder, drop-zone lifecycle, backup/restore, storage, scheduler, FSRS, route, package, dependency, sync, backend, auth, or telemetry changes. Phase 35C made no runtime changes and does not expand these systems.

## Claim guardrail review

The highest approved readiness remains `LIMITED_BETA_CANDIDATE`. Phase 35C does not approve `BETA_READY`, public production readiness, broad validation, stress-tested readiness, Dynamic Canvas Themes implementation, Dashboard redesign, navigation indicator changes, Study Room polish, storage/sync/backend/auth behavior, telemetry, or new AI/OCR/API-key/BYOK behavior.

## Risks and follow-up

- Phase 35C relies on Phase 35B evidence rather than adding runtime changes.
- Any future Dashboard work must start with research/scope decisions before implementation.
- Manual tester or CI evidence can still be repeated by integration, but docs lane ownership remains limited to evidence documentation.

## Chosen review decision

```text
PHASE35C_LIBRARY_BOOKSHELF_EVIDENCE_REVIEW_DECISION: PASS_TO_PHASE35D_DASHBOARD_DECONSTRUCTION_RESEARCH_SCOPE
```

## Decision rationale

The Phase 35B evidence covers the required Library Bookshelf surfaces: default shelf tab, workshop containment, raw input state preservation, E2E tab-targeting fixes, keyboard/accessibility behavior, reduced-motion behavior, mobile 375px behavior, and forbidden system preservation. No evidence requires Library Bookshelf fixes or a hold.

## What Phase 35C supports

Phase 35C supports carrying the reviewed Library Bookshelf tab segmentation into Phase 35D as a stable input for Dashboard Deconstruction Research/Scope.

## What Phase 35C does not approve

Phase 35C does not approve Dashboard runtime redesign, public production readiness, `BETA_READY`, broad validation, stress-tested readiness, Dynamic Canvas Themes implementation, sync/cloud/backend/auth behavior, telemetry, or changes to import/storage/backup/scheduler/FSRS systems.

## Next recommended phase

Phase 35D — Dashboard Deconstruction Research/Scope Gate.
