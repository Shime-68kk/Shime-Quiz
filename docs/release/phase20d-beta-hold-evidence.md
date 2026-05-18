# Phase 20D — Beta HOLD Evidence

## Purpose

This document records the evidence Phase 20D consulted to reach its `HOLD` decision
on local-first hybrid beta-readiness. Phase 20D is docs/static-validator/CI-only and
does not execute new tests, stress fixtures, runtime measurements, or data
collection. This document does not claim that plans constitute evidence; it records
what exists and what is missing.

## Decision summary

```text
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING
```

Phase 20D records `HOLD` on `LOCAL_FIRST_HYBRID_BETA_DECISION` because the repo does
not contain executed real-user testing results or executed performance/quota/import
stress-test results, and because `BETA_READY` would be a misleading claim against
absent evidence.

Phase 20D records `REMOVE_BETA_AI_PUBLIC_NAMING` on `BETA_AI_NAMING_DECISION` because
the substring `beta-ai` in public/package/version naming can imply built-in AI
capability that Shime does not ship.

## Phase 17 evidence

Phase 17 storage and migration readiness work is test-only/planning/internal unless
the repo proves otherwise. Phase 17A established a backup/rollback harness before any
migration. Phase 17B introduced the StorageAdapter scaffold behind a LocalStorage
driver only. Phase 17C added an IndexedDB dry-run harness with no live migration.
Phase 17D/17E documented the migration journal/event-log architecture and per-key
migration manifest design. Phase 17F implemented a test-only migration journal
prototype. Phase 17G added a single-key dry-run migration rehearsal. Phase 17H
implemented a single-key reversible migration pilot behind a test-only gate. Phase
17I closed local migration readiness as the gate into Phase 18.

None of this constitutes a production migration. None of this proves beta-readiness.
The production storage backend remains localStorage.

## Phase 18 evidence

Phase 18A introduced a test-only IndexedDBAdapter prototype with an injectable fake
backend. Phase 18B audited backup/export compatibility as a docs/static-validator
exercise only. Phase 18C documented manual migration UX. Phase 18D recorded the
internal/test-only synthetic local migration pilot. Phase 18E recorded the limited
local backend pilot with rollback gates as a helper/doc lane (synthetic only).

None of this constitutes a shipped local backend switch. None of this proves
beta-readiness of an alternate storage backend. The Phase 18A and 18D/18E artifacts
remain internal/test-only.

## Phase 19 evidence

Phase 19A established the FSRS public opt-in sequencing gate as a docs/static-validator
decision. Phase 19B chose the optional sync architecture direction
(`HYBRID_STAGED_APPROACH`) as a design decision. Phase 19C defined the optional sync
conflict model (`EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK`) as a design decision.
Phase 19D produced no-cloud / default-off trust copy as Vietnamese-first user-facing
language.

Phase 19 is design-only. No runtime sync was implemented. No cloud, account, auth,
or backend was implemented. Phase 19 does not prove beta-readiness of any sync,
cloud, or account feature, because Phase 19 did not ship any of them.

## Phase 20A evidence

Phase 20A established:

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A was audit-only. Phase 20A confirmed that the local-first hybrid runtime
baseline is stable for continued internal/test usage and listed safety invariants
that must remain active. Phase 20A explicitly did not claim beta readiness.

Phase 20A is supporting evidence for `HOLD` because it documents that even the
stabilization audit defers the beta decision to Phase 20D.

## Phase 20B evidence

Phase 20B established:

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B defined the real user testing plan and data safety feedback plan as
docs/static-validator/CI-only artifacts. Phase 20B did not execute real user
testing. Phase 20B did not collect tester feedback. Phase 20B did not collect
private study content. Phase 20B did not collect telemetry or analytics. Phase 20B
did not produce a real-user beta-ready signal. The repo contains no real-user
beta-ready signal as of Phase 20D.

Phase 20B is plan-only and does not constitute evidence of beta-readiness.

## Phase 20C evidence

Phase 20C established:

```text
PERFORMANCE_STRESS_DECISION: PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES
```

Phase 20C defined the performance, storage quota, and import stress-test plan as
docs/static-validator/CI-only artifacts. Phase 20C did not implement runtime stress
fixtures. Phase 20C did not execute performance, storage quota, or import stress
measurements. Phase 20C did not produce a measured beta-ready signal.

Phase 20C is plan-only and does not constitute evidence of beta-readiness.

## Evidence supporting HOLD

The following evidence supports `HOLD`:

- Phase 20A audit explicitly defers beta-readiness to Phase 20D.
- Phase 20B is plan-only and did not execute real user testing.
- Phase 20C is plan-only and did not execute stress testing.
- Phase 17/18 storage readiness work is test-only/internal.
- Phase 19 sync/trust work is design-only with no runtime sync.
- Backup/export/restore are not adapter-aware.
- Data-loss prevention is not guaranteed.
- The repo contains no executed real-user testing results log.
- The repo contains no executed performance/quota/import stress-test result log.
- The substring `beta-ai` in public/package/version naming is misleading and must be
  cleaned before any public beta claim.

## Evidence missing for BETA_READY

The following evidence would have to exist before `BETA_READY` could be reconsidered
(BETA_READY should be reconsidered only after real testing and stress-test evidence
exists).
It does not exist as of Phase 20D:

- An executed real-user testing results log.
- An executed performance scenario result log.
- An executed storage quota warning measurement log.
- An executed large-import stress-test result log.
- An executed repeated backup/restore cycle rehearsal log.
- An executed mobile/PWA stress observation log.
- An executed FSRS review-schedule due-count accuracy measurement log.
- An executed manual transfer rehearsal log on multiple real devices.
- A signed-off post-execution beta-readiness decision based on the above.

Phase 20D does not invent any of this. Phase 20D records the gap.

## Storage safety evidence

localStorage remains the canonical production storage backend. The StorageAdapter
scaffold (Phase 17B) is gated behind a LocalStorage driver. The Phase 18A
IndexedDBAdapter prototype is test-only and not used in production write paths.
Backup/export/restore continues to operate on localStorage. localStorage is never
deleted by the runtime. Restore may overwrite current data.

Storage safety evidence does not support `BETA_READY` because no production
IndexedDB storage exists, no executed storage quota stress-test result exists, and
no executed large-import stress-test result exists.

## Backup and restore evidence

Backup/export/restore operates on localStorage. Restore overwrites current data.
Backup is not sync. Backup/export/restore is not adapter-aware. No repeated
backup/restore cycle rehearsal has been executed as of Phase 20D.

## Import and quota evidence

Import parser behavior remains as defined by previous phases (Phase 16C/16K storage
quota and large import safety planning). No large-import stress measurement has been
executed as of Phase 20D. No storage quota warning effectiveness measurement has
been executed as of Phase 20D.

## Manual transfer evidence

Manual transfer (export then import on another device) remains the only cross-device
data movement path. No multi-device manual transfer rehearsal log has been recorded
as of Phase 20D.

## FSRS and scheduler evidence

FSRS scheduling remains double-gated and not opted-in by default. The legacy
scheduler remains the default. FSRS public opt-in has not shipped. No measured
review-schedule due-count accuracy log has been recorded under volume as of
Phase 20D.

## Optional sync evidence

There is no shipped sync runtime. Phase 19B/19C optional sync design is design-only.
Phase 19D no-cloud / default-off trust copy is the user-facing language. There is
no measured sync evidence because there is no sync to measure.

## No-cloud/default-off trust evidence

Shime stores study data in the user's browser by default. Shime does not collect
telemetry or analytics by default. Shime does not require an account by default.
Shime does not call any cloud or AI service at runtime. The Phase 19D trust copy
states these positions in Vietnamese-first user-facing language.

This evidence supports the `HOLD` decision because it confirms the no-cloud /
default-off position remains the baseline; it does not by itself constitute
beta-readiness of features that have not been built.

## beta-ai naming evidence

The substring `beta-ai` previously appeared in `package.json`, `package-lock.json`,
`src/version.js`, `sw.js`, public release/deploy documents (`RELEASE_QA.md`,
`RELEASE_QA_V2.md`, `RELEASE_NOTES.md`, `RELEASE_NOTES_V2.md`, `DEPLOY.md`,
`DEPLOY_V2.md`), supporting docs in `docs/` (`V2_DATA_MODEL.md`,
`release-candidate-status.md`, `release-tag-decision.md`,
`release-tag-creation-plan.md`, `release-candidate-tag-publish-gate.md`,
`github-release-publication-plan.md`), and validator scripts that hard-pinned
`2.0.0-beta-ai.1` as the expected package version.

Phase 20D replaces these positive public-facing occurrences with non-AI naming such
as `v2.0.0-beta.1`. Phase 20D allows `beta-ai` to remain only inside explicit
warning/forbidden/naming-risk sections that describe `beta-ai` as misleading. The
Phase 20C ADR's beta-ai naming warning section, the Phase 20C validator's required
beta-ai naming warning terms, and the Phase 16J negative-assertion check
(verifying that `sw.js` does not contain `beta-ai`) are examples of allowed
warning/forbidden occurrences.

## Remaining risks

Phase 20D acknowledges the following remaining risks even after the HOLD decision
and naming cleanup:

- Real user testing remains unexecuted; user-experienced data safety issues are
  unknown.
- Performance/quota/import stress remains unmeasured; scale boundaries are unknown.
- Backup/export/restore are not adapter-aware; if a future phase ships IndexedDB,
  backup compatibility must be re-audited.
- Manual transfer remains the only cross-device path; this is intentional and not a
  bug, but it must continue to be communicated honestly.
- The substring `beta-ai` may still appear in historical phase docs where it
  documents a past replacement; these remain non-positive references and are not
  Phase 20D's concern as long as no positive public naming uses `beta-ai`.

## Required evidence before reconsidering BETA_READY

`BETA_READY` may be reconsidered only after all of the following exist:

1. An executed real-user testing results log with documented tester feedback under
   the Phase 20B data-safety boundaries.
2. An executed performance/quota/import stress-test results log under the Phase 20C
   measurement plan.
3. An executed repeated backup/restore cycle rehearsal log.
4. An executed multi-device manual transfer rehearsal log.
5. An executed mobile/PWA stress observation log.
6. A signed-off beta-readiness re-decision phase (e.g. Phase 20G) that consumes
   the above evidence.

Phase 20D does not bypass these requirements.

## Recommendation

Phase 20D recommends recording the `HOLD` decision, executing the Phase 20B real
user testing plan in a follow-up phase (e.g. Phase 20E), executing the Phase 20C
performance/quota/import stress-test plan in a follow-up phase (e.g. Phase 20F),
and re-deciding beta-readiness only in a subsequent gate (e.g. Phase 20G) after
the executed evidence is recorded. Phase 20D recommends maintaining the no-cloud /
default-off trust position, maintaining the no-sync runtime position, and
maintaining localStorage as the canonical production storage backend.

Phase 20D recommends keeping `beta-ai` out of all positive public/package/version
naming permanently.
