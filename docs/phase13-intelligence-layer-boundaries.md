# Phase 13C - Intelligence Layer Boundaries

Phase 13C defines implementation and claim boundaries for Shime's current and future intelligence layers. It is docs/static-validator/CI-only and does not implement runtime behavior.

## 1. Current Scheduler

Current status:
Implemented today.

Implemented now:
Shime has a browser-local SM-2-like / heuristic scheduler that uses current schedule records such as `easeFactor`, `intervalDays`, `repetitionCount`, `correctStreak`, `wrongCount`, `dueAt`, and `lastReviewedAt`.

Planned next:
Phase 14+ may add an adapter boundary and versioned data model scaffolding before introducing a future FSRS scheduler.

Explicitly not implemented:
FSRS is not implemented yet. `ts-fsrs` is not installed.

Forbidden public claims:
Do not claim an FSRS scheduler is available, supported, shipped, or production-ready.

Prerequisites before implementation:
Adapter boundary, `schedulerVersion` or `schedulerKind`, backup/export/import compatibility, rollback, current scheduler preservation, and tests.

Required validation before public claim:
Unit tests, migration tests, backup/restore tests, due-count tests, Study Room completion tests, and explicit claim-boundary review.

## 2. Current Weighted Practice Selection

Current status:
Implemented today.

Implemented now:
Shime has weighted local practice selection that can prioritize due items, weak items, wrong-count signals, low correct-rate items, unpracticed items, bookmarks, and mastery signals.

Planned next:
Future weighted selection may read normalized due state from a scheduler adapter and may later consider FSRS retrievability.

Explicitly not implemented:
FSRS retrievability integration is not implemented. Glicko-2 is not implemented. IRT/adaptive rating is not implemented. AI-based selection is not implemented.

Forbidden public claims:
Do not claim Shime has an adaptive AI learning engine, certified personalization, FSRS-powered selection, Glicko/IRT ranking, or AI-based selection.

Prerequisites before implementation:
Stable adapter output, explainable weighting rules, regression comparison against current selection, and local-first storage boundaries.

Required validation before public claim:
Weighted-selection tests, Dashboard/Study Room smoke coverage, no scoring/mastery regression, and before/after selection drift review.

## 3. Future FSRS Layer

Current status:
Planned only.

Implemented now:
No FSRS runtime exists in Phase 13C.

Planned next:
Phase 14+ may add a small scheduler adapter, versioned model scaffolding, and an opt-in/new-card FSRS path after backup and rollback rules are defined.

Explicitly not implemented:
FSRS is not implemented yet. `ts-fsrs` is not installed. Study Room has no Again/Hard/Good/Easy rating UI from Phase 13C.

Forbidden public claims:
Do not claim FSRS scheduling, FSRS retrievability, FSRS migration, `ts-fsrs`, or FSRS-powered recommendations are implemented.

Prerequisites before implementation:
Adapter boundary, future FSRS card/review-log model, review rating policy, current scheduler preservation, rollback, backup/export/import compatibility, local-first behavior, and storage capacity review.

Required validation before public claim:
Scheduler unit tests, adapter contract tests, migration/rollback tests, backup/import tests, Dashboard due-count tests, Study Room completion tests, and weighted practice compatibility tests.

## 4. Future Adaptive Item Difficulty / Learner Ability

Current status:
Research only.

Implemented now:
No Glicko-2, IRT, or adaptive rating runtime is implemented.

Planned next:
Phase 15+ may research item difficulty and learner ability modeling separately from FSRS scheduling.

Explicitly not implemented:
Glicko-2 is not implemented. IRT is not implemented. IRT/adaptive rating is not implemented. Scoring, mastery, recommendation, and selection runtime are not changed by Phase 13C.

Forbidden public claims:
Do not claim calibrated item difficulty, learner ability rating, Glicko-2, IRT, adaptive rating, or certified adaptive assessment.

Prerequisites before implementation:
Model objective, data sufficiency review, bias/error review, explainable UI language, and independent validation separate from FSRS.

Required validation before public claim:
Offline model evaluation, regression tests proving scoring/mastery behavior is intentionally changed only when approved, and public claim review.

## 5. Future Local AI / Semantic Assistance

Current status:
Research only.

Implemented now:
No local AI runtime, Transformers.js runtime, semantic search runtime, built-in AI generation, external AI/API integration, API key/BYOK support, or OCR is implemented.

Planned next:
Phase 15+ may research local semantic grouping, duplicate detection, hint/explanation support, and review content clustering under local-first constraints.

Explicitly not implemented:
Transformers.js is not implemented. semantic search is not implemented. built-in AI quiz generation is not implemented. external AI/API integration is not implemented. OCR is not implemented.

Forbidden public claims:
Do not claim local AI, semantic search, AI quiz generation, external AI/API support, BYOK/API key support, OCR, automatic explanations, or AI-powered content clustering.

Prerequisites before implementation:
Privacy review, local model size/performance review, manual user confirmation for content changes, and clear fallback behavior.

Required validation before public claim:
Local-only execution evidence, no hidden upload verification, performance/storage tests, content quality review, and UI copy review.

## 6. Future Optional Sync

Current status:
Research only.

Implemented now:
No sync runtime is implemented.

Planned next:
A later phase may research optional user-controlled sync as infrastructure, not learning logic.

Explicitly not implemented:
PowerSync is not implemented. ElectricSQL is not implemented. cloud sync is not implemented. automatic sync is not implemented. account sync is not implemented. There is no hidden upload and no account requirement.

Forbidden public claims:
Do not claim automatic sync, cloud sync, account sync, cross-device live sync, PowerSync, ElectricSQL, or backend-backed learning state.

Prerequisites before implementation:
Explicit user opt-in, conflict-resolution design, local backup/export/import preservation, privacy review, and offline behavior design.

Required validation before public claim:
Sync conflict tests, export/import compatibility tests, no hidden upload verification, account-free core-flow verification, and rollback tests.

## 7. Future Storage Evolution

Current status:
Future/planned research only.

Implemented now:
Current runtime storage remains browser-local localStorage and existing local wrappers.

Planned next:
IndexedDB may be evaluated later if review logs, semantic indexes, or larger libraries exceed practical localStorage capacity.

Explicitly not implemented:
IndexedDB runtime migration is not implemented. Storage schema is not changed by Phase 13C. Encryption is not implemented.

Forbidden public claims:
Do not claim IndexedDB migration, encrypted local storage, production storage reliability, or solved storage capacity.

Prerequisites before implementation:
Storage capacity model, migration plan, backup-before-migration behavior, rollback, corrupt-payload handling, and browser compatibility review.

Required validation before public claim:
Migration tests, rollback tests, quota tests, backup/restore tests, corrupt-data tests, and user-visible error-state tests.

## 8. Privacy/Local-First Boundary

Current status:
Implemented as the current product boundary.

Implemented now:
Core learning data is browser-local by default. Manual backup/export/import remains the current supported portability path.

Planned next:
Future intelligence layers must preserve browser-local defaults unless a separate approved phase explicitly changes that boundary.

Explicitly not implemented:
Cloud sync is not implemented. Automatic sync is not implemented. External AI/API integration is not implemented. Encryption is not implemented. OCR is not implemented.

Forbidden public claims:
Do not claim hidden upload, automatic cloud backup, account-required learning, encrypted storage, production security certification, or AI-backed processing.

Prerequisites before implementation:
Explicit user consent, transparent data-flow documentation, no hidden uploads, local fallback behavior, and manual backup/export/import compatibility.

Required validation before public claim:
Privacy boundary review, local-only tests, export/import tests, and public wording review.

## Explicit Non-Implementation Statements

- FSRS is not implemented yet.
- `ts-fsrs` is not installed.
- Glicko-2 is not implemented.
- IRT is not implemented.
- IRT/adaptive rating is not implemented.
- Transformers.js is not implemented.
- PowerSync is not implemented.
- ElectricSQL is not implemented.
- Cloud sync is not implemented.
- Automatic sync is not implemented.
- IndexedDB runtime migration is not implemented.
- Encryption is not implemented.
- Built-in AI is not implemented.
- Built-in AI quiz generation is not implemented.
- External AI/API is not implemented.
- External AI/API integration is not implemented.
- OCR is not implemented.
- These are forbidden public claims until later phases implement and validate them.
