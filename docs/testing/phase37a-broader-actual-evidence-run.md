# Phase 37A - Broader Actual Evidence Run

## Status tokens

PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_STATUS: COMPLETED_BROADER_ACTUAL_EVIDENCE_RUN
PHASE37A_CURRENT_READINESS_STATUS: LIMITED_BETA_CANDIDATE_CONFIRMED_BETA_READY_NOT_APPROVED
PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_DECISION: PASS_TO_PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW
PHASE37A_EVIDENCE_SCOPE: BROADER_ACTUAL_EVIDENCE_RUN_ONLY_NO_RUNTIME_BEHAVIOR_CHANGES
PHASE37A_DATA_SCOPE: GENERATED_TEST_DATA_ONLY_UNLESS_EXPLICITLY_APPROVED
PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW_SEED_STATUS: PREPARED_REVIEW_SEED

## Scope

Phase 37A executed broader evidence against the existing app using generated/test data only. It changed only documentation, planning, CI workflow registration, and a static validator. No runtime behavior changes were made.

## Inputs from Phase 37

Phase 37 selected `PHASE37_SELECTED_NEXT_STEP: PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN` and kept the readiness boundary at `LIMITED_BETA_CANDIDATE`.

## Evidence method

Evidence came from required npm commands, existing Playwright smoke suites, existing unit coverage, and one ad hoc Playwright browser run against the built preview for generated CSV import, generated text/Markdown import, and reduced-motion media emulation. The ad hoc run used temporary `/tmp` generated data and removed it after completion.

## Test data policy

Only generated/test data was used. The JSON evidence used `tests/fixtures/valid-import.json`. CSV and text/Markdown evidence used temporary generated Phase 37A content. No real/private user data was used.

## Evidence run table

| Surface | Data used | Evidence action | Result | Limitation | Decision impact |
| --- | --- | --- | --- | --- | --- |
| Dashboard baseline smoke | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` route rendering and Dashboard CTA checks | PASS | Chromium automation only | Supports evidence review, not readiness upgrade |
| Library shelf view | Empty storage, generated JSON import fixture after import | `npm run test:e2e:smoke` Library route, shelf tab, and imported subject visibility | PASS | Chromium automation only | Supports Phase 37B review |
| Library workshop tools | Empty storage and local fixture controls | `npm run test:e2e:onboarding` and `npm run test:e2e:smoke` reached workshop/import controls | PASS | Does not validate every document processor branch | Supports Phase 37B review |
| JSON import with generated/test data | `tests/fixtures/valid-import.json` and invalid generated fixtures | `npm run test:e2e:smoke` selected JSON, previewed, imported, and blocked invalid files | PASS | Browser-local storage only | Supports Phase 37B review |
| CSV/text import with generated/test data | Temporary generated CSV and generated text/Markdown content | Ad hoc Playwright run previewed and imported both CSV and text/Markdown | PASS | Command was ad hoc, not committed as a new test | Supports Phase 37B review |
| Study Room answer/check/reveal | Bundled/generated study data after storage reset | `npm run test:e2e:smoke` answered multiple choice, revealed flashcard, answered short answer, completed session | PASS | Chromium automation only | Supports Phase 37B review |
| Study Room queue/counter observation | Bundled/generated study data | `npm run test:e2e:smoke` advanced through multiple items and completion summary persisted local study/review keys | PASS | Did not stress large queues | Supports Phase 37B review |
| Mobile 375px Dashboard | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` set 375x812 viewport and checked no document overflow | PASS | Chromium mobile viewport emulation only | Supports Phase 37B review |
| Mobile 375px Library | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` checked Library no document overflow at 375x812 | PASS | Chromium mobile viewport emulation only | Supports Phase 37B review |
| Mobile 375px Study Room | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` checked Study Room no document overflow at 375x812 | PASS | Chromium mobile viewport emulation only | Supports Phase 37B review |
| Focus-visible keyboard path | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` tabbed primary routes; `npm run test:unit` retained focus-visible CSS coverage | PASS | Does not replace assistive technology review | Supports Phase 37B review |
| Reduced-motion check | Empty local browser storage and generated CSV/text content | Ad hoc Playwright run used `reducedMotion: reduce` on Dashboard, Library, and Study Room; unit tests retained reduced-motion CSS checks | PASS | Emulated media setting only | Supports Phase 37B review |
| Backup/export/import rehearsal | Empty local browser storage and bundled/generated app data | `npm run test:e2e:smoke` opened backup controls, triggered full backup download, and saw backup import control attached | LIMITED | Backup import/restore was not executed because non-destructive restore rehearsal was not part of the existing smoke path | Carries limitation to Phase 37B |
| E2E smoke | Generated fixtures and bundled data | `npm run test:e2e:smoke` | PASS | Chromium automation only | Supports Phase 37B review |
| E2E onboarding | Empty storage and generated/bundled data | `npm run test:e2e:onboarding` | PASS | Chromium automation only | Supports Phase 37B review |
| Build | Source tree from Phase 37 merge plus Phase 37A docs/validator/workflow | `npm run build` | PASS | Vite chunk-size warning remains informational | Supports Phase 37B review |
| Unit tests | Existing generated fixtures and static/unit coverage | `npm run test:unit` | PASS | Unit scope only | Supports Phase 37B review |
| Generated/test data policy | Generated fixtures, temporary generated CSV, temporary generated text/Markdown | Reviewed commands and data sources | PASS | No real/private user data approval requested | Keeps evidence bounded |
| No runtime changes | Git diff allowlist and static validator | Validator checks changed paths and forbidden areas | PASS | Static guard only | Keeps Phase 37A scoped |
| No readiness upgrade | Docs and release summary guardrail review | Required guardrail statements retained | PASS | Phase 37B must review evidence separately | Prevents Beta Ready approval |

## Dashboard evidence

`npm run test:e2e:smoke` passed the route rendering test and Dashboard "Hoc tiep" CTA test. `npm run test:e2e:onboarding` also passed the Dashboard first-run onboarding path to Library. These runs used reset browser storage and generated/bundled test data only.

## Library shelf evidence

`npm run test:e2e:smoke` imported `tests/fixtures/valid-import.json`, returned to the shelf tab, and observed the generated subject `Môn kiểm thử E2E`. Onboarding evidence also verified Library empty-state/workshop access.

## Library workshop and import evidence

The workshop controls were reached in both E2E suites. JSON import passed with the existing generated fixture. A separate ad hoc Playwright run used a temporary generated CSV and generated text/Markdown content, previewed both, imported both locally, and removed the temporary CSV file afterward.

## Study Room evidence

`npm run test:e2e:smoke` exercised answer/check on multiple-choice, flashcard reveal, short-answer check, session completion, local history/review key persistence, and reload persistence. This is not scheduler correctness certification.

## Mobile 375px evidence

`npm run test:e2e:smoke` set a 375x812 viewport and checked Dashboard, Library, and Study Room for document-level horizontal overflow. All three passed in Chromium emulation.

## Focus-visible evidence

`npm run test:e2e:smoke` tabbed through Dashboard, Library, and Study Room and verified focus moved away from `BODY`. `npm run test:unit` also includes existing static checks for focus-visible selectors. This does not claim assistive technology review completion.

## Reduced-motion evidence

The ad hoc Playwright run created a browser context with `reducedMotion: reduce`, verified the reduced-motion media query matched, and loaded Dashboard, Library, and Study Room without critical browser errors. Unit tests also retained existing reduced-motion CSS coverage.

## Backup/export/import rehearsal evidence

`npm run test:e2e:smoke` opened Library workshop backup controls, triggered a full backup JSON download, saw success feedback, and confirmed the backup import control was attached. Backup import/restore was not executed because this phase did not introduce a non-destructive restore rehearsal path and must not change backup/restore behavior.

## E2E smoke and onboarding evidence

`npm run test:e2e:smoke` result: 7 passed. `npm run test:e2e:onboarding` result: 3 passed.

## Build and unit validation evidence

`npm run build` passed. Vite reported the existing chunk-size warning after producing `dist/index.html`, CSS, JS, and icon assets. `npm run test:unit` passed 59 test files and 2676 tests.

## Not-run surfaces and reasons

Backup import/restore execution: `NOT_RUN_WITH_REASON` - the existing smoke suite only exercises safe export/download and import-control attachment; executing a restore would be potentially destructive without an already available non-destructive rehearsal path.

Physical-device mobile audit: `NOT_RUN_WITH_REASON` - Phase 37A used Chromium viewport emulation only.

Assistive technology review: `NOT_RUN_WITH_REASON` - Phase 37A checked keyboard focus and static focus/reduced-motion coverage only.

## Evidence boundaries

This run supports a Phase 37B evidence review. It does not approve broad validation, stress-tested readiness, external user validation, accessibility certification, or guaranteed data-loss prevention.

## Forbidden system change review

Phase 37A does not approve storage/backup/restore behavior changes. Phase 37A does not approve import/parser behavior changes. Phase 37A does not approve sync/cloud/account/auth/backend. Phase 37A does not approve telemetry/network calls. Phase 37A does not approve route behavior changes. Phase 37A does not approve event handler changes. Phase 37A does not approve tab-state changes. Phase 37A does not approve package/dependency changes. Phase 37A does not approve Study Room correctness/scoring/scheduler/queue/data changes.

## Claim guardrail review

Phase 37A does not approve BETA_READY. Phase 37A does not approve Beta Ready. Phase 37A does not approve public production readiness. Phase 37A does not approve broad validation. Phase 37A does not approve stress-tested readiness. Phase 37A does not approve guaranteed data-loss prevention. Phase 37A does not approve accessibility certification. Phase 37A does not approve assistive technology review completion. Phase 37A does not approve physical-device audit completion. Phase 37A does not approve built-in AI/OCR/API-key/BYOK behavior. Phase 37A does not approve Dynamic Canvas Themes. Phase 37A does not approve Streak Fire. Phase 37A does not approve Collapsible Header. Phase 37A does not approve broad UI redesign. Phase 37A does not approve automatic next runtime implementation.

## Risks and follow-up

Phase 37B should review the backup import/restore limitation, Chromium-only browser coverage, lack of physical-device audit, lack of assistive technology review, and absence of stress/large-data coverage before any later readiness review.

## Chosen evidence decision

PHASE37A_BROADER_ACTUAL_EVIDENCE_RUN_DECISION: PASS_TO_PHASE37B_BROADER_ACTUAL_EVIDENCE_REVIEW

## Decision rationale

The required evidence commands passed, broader generated-data browser coverage was collected, and limitations were recorded without expanding readiness claims.

## What Phase 37A supports

Phase 37A supports a broader actual evidence packet for Phase 37B review using generated/test data only.

## What Phase 37A does not approve

Phase 37A does not approve Beta Ready, public production readiness, broad validation, stress-tested readiness, guaranteed data-loss prevention, accessibility certification, assistive technology review completion, physical-device audit completion, storage/backup/restore behavior changes, import/parser behavior changes, sync/cloud/account/auth/backend, telemetry/network calls, built-in AI/OCR/API-key/BYOK behavior, route behavior changes, event handler changes, tab-state changes, package/dependency changes, Study Room correctness/scoring/scheduler/queue/data changes, Dynamic Canvas Themes, Streak Fire, Collapsible Header, broad UI redesign, or automatic next runtime implementation.

## Next recommended phase

Phase 37B - Broader Actual Evidence Review.
