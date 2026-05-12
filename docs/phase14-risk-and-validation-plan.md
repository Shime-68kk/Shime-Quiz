# Phase 14 - Risk And Validation Plan

## Planning Boundary

This document is a Phase 13D planning artifact. It defines risks and validation requirements for future Phase 14 work. It does not implement runtime behavior, does not install ts-fsrs, does not migrate storage, and does not change Study Room, Dashboard, scheduler behavior, weighted practice, scoring, mastery, recommendation, or backup/import runtime.

## Risk Table

| Risk | Severity | Mitigation | Required Validation | Phase Owner | Blocks Phase 14A | Blocks Phase 14B |
|---|---|---|---|---|---|---|
| Data corruption from automatic migration | Critical | Never run destructive automatic conversion. Preserve current records and require explicit migration design with backup and rollback evidence. | Migration tests prove no existing record is overwritten without opt-in. | Phase 14 adapter/storage owner | Yes | Yes |
| Loss of current due schedule | Critical | Keep `dueAt` and all current scheduler fields intact. Preserve original records until any migrated record is verified. | Due schedule preservation tests and before/after due comparison for unchanged records. | Phase 14 scheduler owner | Yes | Yes |
| Wrong mapping from SM-2-like records to FSRS fields | High | Treat `easeFactor`, `intervalDays`, `repetitionCount`, and `wrongCount` as approximate seed inputs only. Mark seeded FSRS records clearly. | Seeded record tests confirm approximation markers and conservative initialization. | Phase 14 scheduler owner | Yes | Yes |
| Missing historical FSRS review logs | High | Do not replay invented review logs. Initialize future FSRS cards conservatively from available fields. | Tests confirm no fabricated review log history is stored or used for optimization. | Phase 14 scheduler owner | Yes | Yes |
| Binary correct/wrong signal not matching FSRS four-rating model | High | Define a rating mapping policy for Again, Hard, Good, and Easy before runtime rollout. Current binary or ternary outcomes are not four-rating equivalents. | Rating policy tests prove current outcome signals do not silently produce wrong FSRS states. | Phase 14 Study Room owner | No | Yes |
| Study Room UI disruption | High | Add any four-rating Study Room UI only after adapter, data, and rollback gates are proven. | Study Room completion tests pass unchanged for non-FSRS records; later rating UI tests pass for FSRS records. | Phase 14 Study Room owner | No | No |
| Dashboard due-count mismatch | High | Route due summaries through the scheduler adapter normalized interface. | Dashboard due-count tests for current-only and mixed scheduler states. | Phase 14 Dashboard owner | Yes | Yes |
| Weighted practice selection drift | High | Feed weighted practice a normalized due state from the adapter and keep FSRS retrievability as one input only. | Weighted practice regression comparison for current-only and mixed states. | Phase 14 selection owner | Yes | Yes |
| Backup/restore compatibility break | Critical | Preserve backup/export/import runtime for current-only and mixed scheduler payloads. Unknown scheduler-specific fields should be retained where possible. | Current-only and mixed backup round-trip tests; corrupt payload handling tests. | Phase 14 backup/import owner | Yes | Yes |
| localStorage capacity pressure from review logs | Medium | Define compact review log retention, per-card log caps, and storage pressure checks before storing detailed FSRS logs. | Storage growth estimation, per-card log cap tests, and quota warning behavior review. | Phase 14 storage owner | No | Yes |
| Rollback impossible | Critical | Preserve current scheduler records and prior due values. Keep rollback available until FSRS records are validated. | Rollback tests prove FSRS records can revert to preserved current-scheduler records. | Phase 14 adapter/storage owner | Yes | Yes |
| Adding `ts-fsrs` dependency too early | Medium | Do not add `ts-fsrs` until an approved sub-phase reviews bundle size, license, and API impact. | Dependency guard confirms no `ts-fsrs` in package files unless explicitly approved. | Phase 14 dependency owner | No | Conditional |
| Overclaiming FSRS before runtime implementation | High | Maintain strict public claim boundaries from Phase 13D and keep validators active. | Static claim validator passes; no public UI/docs copy claims FSRS without verified runtime. | Phase 14 release owner | Yes | Yes |
| Breaking local-first identity | High | Avoid account, cloud, sync, and external service assumptions. Preserve stable item identity mapping from `questionKey`, item id, or another item key. | Local-first review confirms no hidden upload, no account requirement, and no automatic sync. | Phase 14 privacy owner | Yes | Yes |
| Accidentally introducing sync/cloud/AI assumptions | Medium | State that FSRS planning does not add automatic sync, cloud sync, AI, API, OCR, PowerSync, or ElectricSQL assumptions. | Dependency and network behavior review; static claim guard covers sync/AI claims. | Phase 14 privacy owner | No | No |
| Storage schema ambiguity between current and future records | High | Require `schedulerVersion` or `schedulerKind` on future FSRS records and preserve current records with their own schema version. | Schema versioning tests prove mixed records do not corrupt each other. | Phase 14 storage owner | Yes | Yes |
| Importing mixed scheduler backups incorrectly | High | Treat mixed backups as versioned data. Preserve unknown fields and avoid destructive import-time conversion. | Mixed backup import tests and unknown-field preservation tests. | Phase 14 backup/import owner | No | Yes |
| Current scheduler removal before FSRS validation | Critical | Keep current scheduler active for non-migrated records and as rollback path until FSRS is validated. | Dual scheduler coexistence tests prove current scheduler records still schedule correctly. | Phase 14 scheduler owner | Yes | Yes |

## Phase 14A Validation Plan

Phase 14A must pass these checks before merge:

- Current scheduler regression tests prove `correct`, `wrong`, and `unanswered` scheduling behavior is unchanged.
- Adapter unit tests cover `getSchedulerKind`, `getDueStatus`, `getDueSummary`, and `scheduleReview` for the current path.
- Normalized due summary tests prove Dashboard and weighted practice consumers can read due status without knowing scheduler internals.
- Storage normalization tests, if any scaffolding exists, prove current `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1` records parse and serialize without data loss.
- Static claim validator passes with no FSRS runtime implementation claim and no ts-fsrs dependency claim.
- Package/dependency guard confirms `package.json` and `package-lock.json` do not include `ts-fsrs` unless explicitly approved.
- Build passes with `npm run build`.
- Unit tests pass with `npm run test:unit`.
- GitHub Actions remains green.

## Phase 14B Validation Plan

If Phase 14B introduces FSRS runtime, these additional checks are required:

- Rating mapping tests for Again, Hard, Good, and Easy.
- FSRS card state tests for New, Learning, Review, and Relearning.
- Opt-in or new-card isolation tests prove only selected records use FSRS.
- No automatic migration tests prove app startup and import do not convert current records without explicit user action.
- Rollback tests prove FSRS-scheduled records can revert to preserved current-scheduler records.
- Backup/import round-trip tests prove FSRS card and review-log fields survive export and reimport.
- Dashboard mixed scheduler due count tests prove current and FSRS due dates are counted correctly.
- Weighted practice mixed scheduler tests prove weak items, wrong count, unpracticed items, mastery, low correct rate, and future FSRS retrievability remain balanced.
- Public claim guard is updated only to match the runtime scope actually implemented and tested.

## Manual QA And E2E Plan

When Phase 14 runtime work begins, the following must be manually checked before each merge to main:

- App loads in a fresh browser with no schedule data.
- App loads with existing `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1` data.
- Study Room current scheduler path still completes sessions correctly.
- Study Room completion still saves local history and updates review schedules.
- Dashboard due review count matches expected due items.
- Dashboard review schedule panel displays correctly for current-scheduler records.
- Backup export produces a valid JSON payload containing current-scheduler records.
- Import from a current-only backup restores records correctly.
- Mixed current/FSRS backup import, if implemented later, preserves both scheduler record types correctly.
- Mixed scheduler states do not crash Study Room or Dashboard.
- Keyboard navigation and mobile layout remain usable if Study Room UI changes.

E2E smoke (`npm run test:e2e:smoke`) and onboarding smoke (`npm run test:e2e:onboarding`) should pass before each release candidate according to the existing Playwright workflow. Phase 13D does not run or claim E2E results unless those commands are executed.

## Claim Gate

Public FSRS claims are allowed only after the relevant later phase implements and validates the claimed behavior:

- FSRS runtime public claim: only after Phase 14B or later validates FSRS state transitions, due-date scheduling, regression behavior, and CI.
- ts-fsrs dependency public claim: only after a later approved phase installs the dependency in package files and reviews bundle, license, and API impact.
- FSRS opt-in public claim: only after opt-in or new-card behavior is implemented and tested.
- Existing-card FSRS support public claim: only after migration, rollback, and backup/import compatibility are implemented and tested.
- Adaptive learning public claim: only after the specific adaptive behavior exists, is tested, and is described without implying unimplemented AI, Glicko-2, IRT, sync, or semantic search.

## Local-First Privacy Gate

Every Phase 14 sub-phase must preserve:

- No hidden upload of study data, schedule records, or review history.
- No account requirement for core study behavior.
- No automatic sync of any kind.
- Browser-local storage as the default for core study data.
- Manual backup/export/import as the current safe portability path unless a later approved phase changes it.

Phase 14 must not introduce sync dependency, cloud storage assumptions, external AI/API calls, BYOK/API key support, OCR, or local AI as a side effect of scheduler adapter or FSRS runtime work.
