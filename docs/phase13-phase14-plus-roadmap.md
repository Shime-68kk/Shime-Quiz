# Phase 13C - Phase 14+ Roadmap

This document translates Phase 13C's local adaptive learning roadmap into a practical Phase 14+ sequence. It is planning only. It does not implement runtime behavior, add dependencies, change storage schema, or change Study Room, Dashboard, scheduler, scoring, mastery, recommendation, weighted practice, backup/import, or package files.

## 1. Phase 14 Recommended Entry

Phase 14 should start small. The recommended entry is FSRS adapter/data model scaffolding, not global scheduler replacement.

Phase 14 entry principles:

- Add a small FSRS adapter boundary before adding FSRS runtime behavior.
- Add model scaffolding for `schedulerVersion` or `schedulerKind`.
- Preserve the current SM-2-like / heuristic scheduler for existing records.
- Avoid global scheduler replacement.
- Use opt-in or new-card FSRS first.
- Preserve current schedule records.
- Define rollback and backup compatibility before migration.
- Keep backup/export/import compatibility with current local data.
- Do not destructively convert existing local data at app startup or import.
- Do not make public FSRS claims until runtime implementation, tests, and claim review are complete.

## 2. Suggested Phase 14 Split

### Phase 14A: Scheduler Adapter Boundary And Versioned Model Scaffolding

Goal:
Introduce the smallest runtime boundary that can route current scheduler records and future FSRS records without changing behavior.

Planning requirements:

- Define a local scheduler adapter contract.
- Keep current scheduler behavior unchanged through a current-scheduler adapter path.
- Define `schedulerVersion` or `schedulerKind` semantics.
- Preserve `quizReviewScheduleV1` and `shimeV2ReviewScheduleV1`.
- Preserve the existing review schedule `schemaVersion` envelope, including `schemaVersion: v2-review-schedule-v1`. This is planning language only and does not implement storage schema changes.
- Define normalized due summary output for Dashboard and weighted practice.
- Define rollback metadata before any migration.

Exit criteria:
Adapter tests pass, current behavior remains unchanged, package files remain approved, and public claims still say FSRS is not implemented unless Phase 14A explicitly includes verified runtime work.

### Phase 14B: FSRS Runtime Prototype Behind Opt-In/New-Card Path

Goal:
Introduce FSRS only behind the adapter and only for opt-in/new-card records.

Planning requirements:

- Decide whether `ts-fsrs` is approved for a later runtime commit.
- Map Again/Hard/Good/Easy ratings or define a temporary policy if Study Room UI is not ready.
- Store future FSRS fields only behind scheduler versioning.
- Keep current scheduler records active.
- Avoid automatic conversion of existing records.

Exit criteria:
FSRS prototype is isolated, current records still work, rollback path exists, and no unsupported public claim is made.

### Phase 14C: Backup/Export/Import Compatibility And Rollback Verification

Goal:
Prove mixed scheduler data can be exported, imported, restored, and rolled back.

Planning requirements:

- Validate current-only backups.
- Validate mixed current/FSRS backups.
- Preserve unknown scheduler-specific fields where possible.
- Avoid import-time destructive conversion.
- Test rollback from future FSRS records to preserved current records.

Exit criteria:
Backup/import tests pass, rollback tests pass, and corrupt/unknown payload behavior is documented.

### Phase 14D: Study Room Rating UI If Needed

Goal:
Add review rating input only if FSRS runtime requires it and only after adapter/data/rollback safety exists.

Planning requirements:

- Decide whether Study Room needs Again/Hard/Good/Easy buttons.
- Keep existing scoring behavior separate from FSRS rating input.
- Avoid changing completion semantics without tests.
- Keep accessibility and keyboard behavior testable.

Exit criteria:
Study Room tests pass, rating flow is clear, and existing study completion behavior is preserved or intentionally migrated with tests.

### Phase 14E: Dashboard/Due-Count Compatibility If Needed

Goal:
Normalize Dashboard due counts across current and future scheduler records.

Planning requirements:

- Read due summaries from the scheduler adapter.
- Compare current-only and mixed scheduler due counts.
- Keep due-count labels honest when FSRS is opt-in or partial.

Exit criteria:
Dashboard due-count tests pass and mixed scheduler states are not confusing.

### Phase 14F: Weighted Practice Integration If Needed

Goal:
Use future FSRS retrievability as one possible weighted-practice signal, not a replacement for the full selection layer.

Planning requirements:

- Feed weighted practice normalized due state.
- Add FSRS retrievability only when available.
- Preserve weak-item, unpracticed-item, wrong-count, and mastery signals.
- Compare selection drift before and after integration.

Exit criteria:
Weighted practice tests pass, explanations remain clear, and FSRS does not erase other local learning signals.

## 3. Phase 15+ Research Tracks

Phase 15+ should keep research tracks separate unless a later phase explicitly combines them.

Adaptive selection refinement:
Improve local weighted practice using clearer reason codes, normalized due state, weak-topic grouping, and later FSRS retrievability.

Glicko-2/IRT research:
Evaluate item difficulty and learner ability modeling. Keep this separate from FSRS scheduler runtime and do not change scoring, mastery, or recommendation until a later approved phase validates the model.

Local semantic assistance:
Research local AI, Transformers.js, semantic grouping, duplicate detection, hint/explanation support, and review content clustering under privacy and local-first constraints. Do not add Transformers.js or semantic search runtime in Phase 13C.

Optional sync/storage research:
Research PowerSync, ElectricSQL, optional sync, and IndexedDB storage evolution as infrastructure questions. Browser-local remains default, manual backup/export/import remains the current safe path, and no cloud/account sync is implemented by Phase 13C.

Analytics improvements:
Improve local analytics explanations, confidence labels, and user-visible uncertainty before claiming any adaptive intelligence quality.

## 4. Do Not Start Runtime Until Checklist

Do not start runtime implementation until these are ready:

- Adapter boundary planned.
- `schedulerVersion` or `schedulerKind` strategy planned.
- Backup/rollback plan ready.
- Local data migration risk understood.
- Current scheduler preservation plan ready.
- User-facing claim boundaries ready.
- Storage capacity risk understood.
- Validation/test plan ready.
- Opt-in/new-card first strategy selected.

If any item is missing, Phase 14 should remain planning or scaffolding-only.

## 5. Public Claims Gate

Before claiming FSRS implemented:
FSRS runtime must exist, `ts-fsrs` or equivalent must be approved if used, adapter tests must pass, migration/rollback must pass, backup/export/import must pass, Study Room and Dashboard behavior must be verified, and public docs must say exactly what scheduler scope is implemented.

Before claiming adaptive learning:
Selection, mastery, and scheduler behavior must be intentionally integrated and validated. A roadmap alone is not an adaptive learning engine.

Before claiming AI/local AI:
A local AI runtime or semantic runtime must exist, run locally as claimed, avoid hidden upload, pass performance/storage checks, and have content-quality validation.

Before claiming sync/cloud sync:
Sync must be implemented, opt-in, user-controlled, tested for conflicts and rollback, and documented without implying hidden upload or account requirement.

Before claiming IndexedDB migration:
Migration must be implemented, tested, rollback-safe, backup-compatible, and resilient to corrupt or oversized data.

Before claiming production/security/accessibility/performance certification:
The relevant certification or measurement evidence must exist. Phase 13C provides no such certification.
