# Phase 12F — Unit Test Foundation Plan

## 1. Purpose

Phase 12F documents a plan for a future unit test foundation for Shime Quiz.

Phase 12F is docs/static-validator/CI-only. Phase 12F does not add Vitest. Unit tests are not added by Phase 12F. Phase 12F does not add test scripts, does not add coverage tooling, and does not change package.json or package-lock.json. Package-lock.json is not changed by Phase 12F. Runtime app behavior is not changed by Phase 12F. Algorithms are not changed by Phase 12F. It prepares a future Phase 12G implementation where a small unit test foundation may be added if approved.

## 2. Baseline

The project is completed/merged through Phase 12E. Phase 12E added Dashboard Today Card runtime so the Dashboard has a clearer first study action while existing Dashboard sections remain available.

The app remains local-first and browser-local. Manual backup/export/import remains the portability model. There is no backend, cloud, or account sync requirement.

## 3. Why unit tests are needed

Unit tests are needed before larger future work because several important behaviors are implemented in helpers and algorithms where regressions can be hard to notice through manual checks alone.

Future work that would benefit from a unit test foundation includes FSRS evaluation or migration, IndexedDB migration or runtime storage changes, Study flow micro-feedback, route-level code splitting, parser/import hardening, and backup/restore compatibility work. These future changes are not implemented by Phase 12F.

A small unit test foundation should first protect current behavior before any larger runtime or algorithm changes are attempted.

## 4. Candidate test targets

Phase 12G should verify exact file locations before adding tests. Candidate test targets include:

- Spaced repetition / review scheduling helpers, including scheduling intervals, reset behavior, due-state handling, and edge cases.
- Mastery/progress helpers, including score boundaries, empty inputs, and topic aggregation.
- Weighted selection helpers, including deterministic seeded selection, fallback behavior, and empty or undersized pools.
- Quiz parser helpers, including malformed input, missing answers, extra whitespace, and multiple-choice parsing edge cases.
- Import validation helpers, including duplicate handling, schema validation, and safe rejection of invalid quiz payloads.
- Backup validation/compatibility helpers, including version checks, malformed payload handling, and compatibility boundaries.
- Storage quota helper from Phase 12C if it remains sufficiently isolated, including unavailable API, invalid usage/quota values, and threshold calculations.
- Dashboard Today Card data/summary helpers if they become isolated later, including empty library, no due reviews, and fallback copy states.

Phase 12F does not modify these files and does not add tests for them.

## 5. Test strategy for Phase 12G

Phase 12G should add Vitest as a dev dependency only if approved. It should add a minimal unit test script only when unit tests are actually added.

Recommended strategy:

- Start with pure functions only.
- Avoid changing algorithm behavior while adding tests.
- Prefer deterministic fixtures over broad snapshot tests.
- Include edge cases such as empty input, malformed input, missing fields, invalid numbers, and boundary values.
- Keep tests fast and local.
- Run unit tests in CI after static validators or in a clearly documented order.
- Do not require a browser or Playwright environment for pure unit tests.

## 6. Initial test coverage priorities

1. Spaced repetition scheduling invariants — these protect review timing and reduce the risk of silent learning-schedule regressions.
2. Weighted selection determinism/fallbacks — these protect reproducible recommendations and stable behavior for small or empty quiz pools.
3. Parser/import edge cases — these protect user-created quiz content from malformed input and unexpected import outcomes.
4. Backup validation/compatibility helpers — these protect local-first portability and reduce restore risk.
5. Storage quota helper behavior — this protects the Phase 12C advisory warning from false warnings and unavailable browser API failures.
6. Dashboard Today Card summary helper if isolated later — this protects Phase 12E Dashboard copy/summary logic without testing full UI rendering first.

## 7. Guardrails for algorithm tests

Future tests must not silently rewrite algorithms. Phase 12G should characterize current behavior first and verify known invariants.

Phase 12G should avoid changing scoring, SRT, mastery, recommendation logic, parser behavior, persisted data shape, or backup format while adding tests. Phase 12G should not implement FSRS migration, should not change data models, and should not change persisted data shape.

## 8. CI expectations for future Phase 12G

Future CI changes should add a unit test command only when Vitest and tests are actually added. Existing validators must remain registered, Playwright smoke/onboarding steps must remain preserved, and broad continue-on-error should not be added.

Pure unit tests should not depend on browser installation. E2E environment-blocked status should be documented separately from unit test results.

## 9. Non-goals for Phase 12F

Phase 12F does not:

- add Vitest
- add unit tests
- add test scripts
- add coverage tooling
- add fast-check
- change package.json
- change package-lock.json
- change package version
- add dependencies
- change runtime app behavior
- change algorithms
- change Study Room behavior
- change Dashboard behavior
- change storage schema
- change backup format
- implement FSRS
- implement IndexedDB
- create release package
- create release tag
- publish GitHub Release

## 10. Allowed claims after Phase 12F

Allowed claims:

- Unit Test Foundation Plan exists.
- Candidate pure-function test targets are documented.
- Future Vitest adoption strategy is documented.
- Future CI expectations for unit tests are documented.
- No unit test tooling or tests were added by Phase 12F.
- No package/dependency changes were made by Phase 12F.

## 11. Forbidden claims after Phase 12F

Forbidden claims:

- Vitest added
- unit tests added
- coverage added
- test script added
- package dependencies changed
- package version changed
- algorithms changed
- FSRS implemented
- IndexedDB implemented
- release package created
- release tag created
- GitHub Release published

## 12. Recommended next phase

Recommended next phase: Phase 12G — Vitest Unit Test Foundation.

Phase 12G should be the first phase allowed to modify package.json/package-lock.json, add Vitest, and add minimal pure-function unit tests if approved.


## Phase 12G follow-up — Vitest Unit Test Foundation

Phase 12G implements the planned minimal Vitest foundation. It adds Vitest as a dev dependency, adds `npm run test:unit`, and adds initial tests for selected pure/near-pure helpers.

Phase 12G does not intentionally change runtime app behavior or scoring/SRT/mastery/recommendation algorithm behavior. Unit tests remain limited and do not replace E2E smoke/onboarding checks.
