# Phase 12G — Vitest Unit Test Foundation

## 1. Purpose

Phase 12G adds a minimal Vitest unit test foundation for Shime Quiz. The goal is to make a small, deterministic unit test layer available before larger runtime or algorithm-adjacent phases continue.

This phase adds Vitest as a development dependency, adds a minimal `npm run test:unit` script, adds initial unit tests for existing pure or near-pure helpers, registers unit tests in CI, and adds a static validator for this foundation.

## 2. Baseline

The project is completed/merged through Phase 12F. Phase 12F documented the Unit Test Foundation Plan and identified candidate pure-function targets for future tests.

The app remains local-first and browser-local. Manual backup/export/import remains the portability model. There is no backend/cloud/account sync, no automatic sync, and no hidden upload of user study data.

## 3. What changed

Phase 12G changes are intentionally limited to unit test infrastructure and documentation:

- Vitest is added as a dev dependency.
- `npm run test:unit` is added as a minimal unit test script.
- Initial unit tests are added under `tests/unit/`.
- CI runs `npm run test:unit` after build and before the static-validator/E2E portions of the workflow.
- `scripts/validate-vitest-unit-test-foundation.js` checks the unit test foundation, documentation, package boundaries, and CI registration.

## 4. Initial test coverage

Initial tests are limited and do not claim broad coverage.

- `tests/unit/storageQuotaEstimate.test.js` covers normalization and unavailable/available browser storage estimate behavior for the Phase 12C storage quota helper. Browser storage APIs are mocked safely and restored after tests.
- `tests/unit/scoring.test.js` covers existing quiz scoring helper behavior for answer normalization, multiple-choice correctness, fill/numeric correctness, and score calculation.
- `tests/unit/weightedSelection.test.js` covers deterministic seeded random generation, history-stat aggregation, and weight clamping behavior for existing weighted selection helpers.

These tests characterize existing behavior. They do not rewrite algorithms and do not change runtime behavior.

## 5. Safety boundaries

Phase 12G makes no runtime app behavior changes and does not intentionally change runtime app behavior. It makes no scoring/SRT/mastery/recommendation changes, no Study Room behavior changes, no Dashboard behavior changes, no storage schema change, no backup format change, and no import/restore behavior change.

Phase 12G has no FSRS implementation, no IndexedDB implementation, no localStorage migration, no cloud/account sync, no automatic sync, no encryption, no QR transfer, no transfer-code flow, no WebRTC/session transfer, and no route-level code splitting.

## 6. How to run

Run unit tests:

```bash
npm run test:unit
```

Recommended local checks for this phase:

```bash
npm run build
npm run test:unit
node scripts/validate-vitest-unit-test-foundation.js
```

Unit tests do not replace Playwright E2E smoke/onboarding checks. E2E remains separate because it validates browser-level app flows.

## 7. User-facing claim boundaries

Allowed claims after Phase 12G:

- Vitest unit test foundation exists.
- Minimal pure-helper unit tests exist.
- Unit tests run through `npm run test:unit` and CI.
- Runtime/algorithm behavior was not intentionally changed.

Forbidden claims after Phase 12G:

- broad test coverage achieved
- full regression coverage
- E2E replaced by unit tests
- all bugs prevented
- algorithms improved or changed
- scoring/SRT/mastery/recommendation changed
- FSRS implemented
- IndexedDB implemented
- cloud/account sync implemented
- automatic sync implemented
- encryption implemented
- production quality certified
- security/accessibility/performance certified
- release package created
- release tag created
- GitHub Release published

## 8. Recommended next phase

Recommended next phase: Phase 12H — Study Flow Micro-feedback Plan.
