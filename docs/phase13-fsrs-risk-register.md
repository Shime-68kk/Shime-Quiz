# Phase 13B - FSRS Risk Register

Phase 13B is a docs/static-validator/CI-only phase. This risk register defines the risks that must be resolved before Phase 14 or later implements any FSRS runtime behavior.

| Risk | Severity | Mitigation | Phase owner | Blocks Phase 14 entry |
| --- | --- | --- | --- | --- |
| Data corruption from automatic migration | Critical | Do not run destructive automatic conversion. Preserve current records and require explicit migration design with backup and rollback evidence. | Phase 14 runtime owner | Yes |
| Loss of current due schedule | Critical | Keep `dueAt`, current scheduler fields, and original records available until migrated records are verified. | Phase 14 runtime owner | Yes |
| Wrong mapping from SM-2-like records to FSRS fields | High | Treat `easeFactor`, `intervalDays`, `repetitionCount`, and `wrongCount` as approximate seed inputs only. Do not claim they are reliable FSRS memory state. | Phase 13B/Phase 14 | Yes |
| Missing historical review logs | High | Do not replay invented logs. Initialize future FSRS cards conservatively and record migration source metadata. | Phase 14 runtime owner | Yes |
| Binary correct/wrong signal not matching FSRS four-rating model | High | Design a future rating input or mapping policy for `Again`, `Hard`, `Good`, and `Easy` before runtime rollout. | Phase 14 runtime owner | Yes |
| Backup/restore compatibility break | Critical | Keep backup/export/import compatibility tests and preserve old scheduler payloads during import/export. | Phase 14 runtime owner | Yes |
| Study Room UI rating-flow disruption | High | Introduce any four-rating Study Room UI only in a later runtime phase with explicit UX and regression coverage. | Phase 14 runtime owner | Yes |
| Dashboard due-count mismatch | High | Route summaries through a normalized scheduler adapter so current and future FSRS due dates are counted consistently. | Phase 14 runtime owner | Yes |
| Weighted practice selection drift | High | Feed weighted practice a normalized due state and compare selection behavior before changing runtime weighting. | Phase 14 runtime owner | Yes |
| localStorage capacity increase from review logs | Medium | Define compact review log retention, per-card caps, and storage pressure checks before storing detailed logs. | Phase 14 runtime owner | Yes |
| Overclaiming FSRS before runtime implementation | High | Keep public wording limited to architecture plan, migration plan, future, planned, and not implemented language. | Phase 13B | Yes |
| Adding dependency too early | Medium | Do not add `ts-fsrs` until Phase 14 or later approves bundle, API, license, and behavior impact. | Phase 14 runtime owner | No |
| Making rollback impossible | Critical | Preserve current scheduler records, prior due values, and scheduler versioning until rollback tests pass. | Phase 14 runtime owner | Yes |
| Confusing future/planned docs with implemented feature | Medium | Label all Phase 13B material as planning-only and keep the static validator claim guard active. | Phase 13B | Yes |
| Breaking local-first identity | High | Keep stable item identity mapping from `questionKey`, `itemId`, or item key and avoid account/cloud identity assumptions. | Phase 14 runtime owner | Yes |
| Accidentally introducing sync/cloud/AI assumptions | Medium | State that FSRS planning does not add automatic sync, cloud sync, AI, API, OCR, PowerSync, or ElectricSQL assumptions. | Phase 13B/Phase 14 | No |
| Storage schema ambiguity between current and future records | High | Require `schedulerVersion` or `schedulerKind` and preserve scheduler-specific payloads. | Phase 14 runtime owner | Yes |
| Importing mixed scheduler backups incorrectly | High | Treat mixed backups as versioned data, preserve unknown fields, and avoid destructive import-time conversion. | Phase 14 runtime owner | Yes |
| Current scheduler removal before FSRS validation | Critical | Keep the current scheduler available as a rollback path and for non-migrated records. | Phase 14 runtime owner | Yes |

## Phase 14 Entry Conditions

Phase 14 should not start runtime FSRS work until these planning risks have accepted mitigation:

- A small scheduler adapter boundary is approved as the first runtime step.
- Minimal data model scaffolding for dual scheduler support and `schedulerVersion` or `schedulerKind` semantics is defined.
- Opt-in/new-card rollout strategy is accepted.
- Rollback strategy is accepted.
- Backup/export/import compatibility requirements are accepted.
- Study Room rating-flow ownership is explicit.
- Dashboard and weighted practice due-state normalization is explicit.
- Storage pressure and localStorage review-log retention strategy is accepted.
- Claim boundaries remain clear: FSRS runtime is not implemented by Phase 13B.

The Phase 14 entry recommendation is to implement the adapter boundary and data model scaffolding first, then introduce FSRS only behind an opt-in/new-card pathway after backup and rollback rules are defined.
