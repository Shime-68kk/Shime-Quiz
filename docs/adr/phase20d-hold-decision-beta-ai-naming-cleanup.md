# Phase 20D — HOLD Decision + beta-ai Naming Cleanup Gate

## Purpose

Phase 20D is a docs/static-validator/CI-only release decision and naming cleanup gate
for Shime Quiz / ShimeChamhoc v2. It closes Phase 20 with an honest HOLD decision on
beta readiness and removes misleading positive public/package/version naming that uses
the substring `beta-ai`. It does not implement runtime behavior changes, tests, sync,
cloud, account/auth/backend, telemetry, analytics, storage migration, FSRS scheduling
changes, backup/export/restore behavior changes, import parser behavior changes, or UI
behavior changes.

Phase 20D is a decision and naming-cleanup gate. Its outputs are this ADR, the Phase
20D HOLD evidence document, this Phase 20D static validator, CI registration of Phase
20D after Phase 20C, and version/name string cleanup in `package.json`,
`package-lock.json`, `src/version.js`, `sw.js`, and positive public release/deploy
docs and validator hard-pins. Phase 20D does not change runtime behavior. Phase 20D
does not introduce dependencies. Phase 20D does not modify `tests/`, `e2e/`, or any
runtime source file other than the `APP_VERSION` string in `src/version.js` and the
`CACHE_VERSION` string in `sw.js`.

```text
LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD
BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING
```

## Decision

Phase 20D records two fixed decisions consumed from the Phase 20D-R research result:

- `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` — Shime Quiz is not approved as beta-ready
  for broad public release in Phase 20D. The local-first hybrid baseline remains the
  shipped runtime, but the project must not claim "beta-ready" until real user testing
  evidence and performance/quota/import stress-test evidence have been executed and
  recorded.
- `BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING` — the substring `beta-ai`
  must be removed from all positive public/package/version naming. Public-facing
  version strings switch to non-AI naming such as `v2.0.0-beta.1`. Remaining
  occurrences of `beta-ai` are allowed only inside explicit warning, forbidden, or
  naming-risk sections that describe the substring as misleading.

Phase 20D does not choose `BETA_READY`. Phase 20D does not claim beta-ready. Phase
20D does not unlock sync, runtime migration, account/auth/backend, cloud, telemetry,
or analytics. Phase 20D does not
re-enable any storage backend switch. Phase 20D does not introduce any AI capability.

## Evidence consumed

Phase 20D consumes the evidence inventory recorded in
`docs/release/phase20d-beta-hold-evidence.md`, which inherits and references the
artifacts produced by Phase 17 storage readiness work, Phase 18 local migration
pilots, Phase 19 sync/trust design gates, Phase 20A stabilization audit, Phase 20B
real user testing plan, and Phase 20C performance/quota/import stress-test plan.
The evidence document explicitly states that:

- Phase 17/18 storage and migration work is test-only/planning/internal.
- Phase 19 optional sync work is design-only with no runtime sync.
- Phase 20A is audit-only.
- Phase 20B is plan-only — no real user testing results were executed or recorded.
- Phase 20C is plan-only — no stress-test results were executed or recorded.

Phase 20D does not invent new evidence. Phase 20D does not retroactively claim that
plans constitute evidence. Phase 20D treats absent evidence as absent.

## Why the decision is HOLD

Phase 20D is `HOLD` because beta-readiness requires concrete evidence the repo does
not yet contain. There is no repo evidence of completed real user testing results.
There is no repo evidence of completed performance, storage quota, or import stress
test results. Phase 20B is plan-only. Phase 20C is plan-only. Beta-ready cannot be
claimed against missing evidence without misleading users. The honest decision is to
hold.

`beta-ai` naming also remains misleading and must be cleaned before any broader
public/beta/RC announcement. Phase 20D performs that cleanup as part of the gate.

Phase 20D records `HOLD` so that future phases can re-decide once real testing and
stress-test execution evidence exists.

## Relationship to Phase 20A

Phase 20A established:

```text
BETA_STABILIZATION_DECISION: LOCAL_FIRST_HYBRID_STABILIZATION_AUDIT_ONLY
```

Phase 20A confirmed that the local-first production baseline is stable for beta
discussion, defined safety invariants that must remain active throughout all future
phases, and explicitly did not claim beta readiness. Phase 20A explicitly deferred
beta readiness to Phase 20D.

Phase 20D inherits all Phase 20A safety invariants unchanged:

- localStorage remains the canonical production source of truth.
- No sync runtime exists.
- No account/cloud/auth/backend exists.
- No production IndexedDB storage exists.
- No runtime migration exists.
- No dual-write exists.
- localStorage is never deleted by the runtime.
- Backup/export/restore behavior remains unchanged.
- Manual transfer is the only cross-device data movement path.
- FSRS active scheduling remains experimental, double-gated, and internal/test-controlled.
- FSRS public opt-in has not shipped.
- The Phase 17B StorageAdapter scaffold remains test-only.
- The Phase 18A test-only IndexedDBAdapter prototype remains test-only.
- The Phase 18E synthetic local backend pilot remains internal.

Phase 20D records the Phase 20A audit as supporting `HOLD`: stabilization audit alone
is not equivalent to beta-readiness.

## Relationship to Phase 20B

Phase 20B established:

```text
REAL_USER_TESTING_DECISION: PLAN_ONLY_NO_DATA_COLLECTION
```

Phase 20B defined the real user testing plan and data safety feedback plan. Phase 20B
did not execute real user testing. Phase 20B did not record real user testing
results. Phase 20B did not collect data. Phase 20B did not produce evidence of
beta-readiness. Phase 20B was a plan only.

Phase 20D consumes Phase 20B as planning input. Because Phase 20B is plan-only, Phase
20B cannot support a `BETA_READY` decision. Phase 20D records this gap explicitly and
defers `BETA_READY` until Phase 20E (or a similarly named subsequent phase) executes
the plan and records real results.

## Relationship to Phase 20C

Phase 20C established:

```text
PERFORMANCE_STRESS_DECISION: PLAN_ONLY_NO_RUNTIME_STRESS_FIXTURES
```

Phase 20C defined the performance, storage quota, and import stress-test plan. Phase
20C did not implement runtime stress fixtures. Phase 20C did not execute
performance/quota/import stress measurements. Phase 20C did not collect performance
results. Phase 20C did not produce evidence of beta-readiness. Phase 20C was a plan
only.

Phase 20D consumes Phase 20C as planning input. Because Phase 20C is plan-only, Phase
20C cannot support a `BETA_READY` decision. Phase 20D records this gap explicitly and
defers `BETA_READY` until Phase 20F (or a similarly named subsequent phase) executes
the stress-test plan and records real measurements.

## Relationship to Phase 19 trust and sync guardrails

Phase 19A established the FSRS public opt-in sequencing gate. Phase 19B established
the optional sync architecture decision (`HYBRID_STAGED_APPROACH`). Phase 19C
established the optional sync conflict model (`EVENT_LOG_PLUS_PER_RECORD_REVISION_CLOCK`).
Phase 19D established the no-cloud / default-off trust copy.

Phase 20D inherits the Phase 19 guardrails unchanged. Phase 19 is design-only. There
is no sync runtime. There is no cloud. There is no account/auth/backend. Phase 20D
does not unlock these. Phase 20D does not weaken the Phase 19D trust copy that says
the app is no-cloud by default and does not collect data by default.

## Current production baseline

The current shipped runtime is local-first hybrid:

- localStorage is the canonical storage backend.
- StorageAdapter scaffold is test-only and not used in production write paths.
- IndexedDBAdapter is a test-only prototype, not the production backend.
- Backup/export/restore operates on localStorage.
- Manual transfer (export then import on another device) is the only cross-device
  data movement path.
- FSRS is double-gated and not opted-in by default.
- No telemetry, no analytics, no account, no cloud, no sync are shipped.

Phase 20D does not change any of this. Phase 20D records that this baseline is the
state on which the HOLD decision is made.

## What is ready

The following are ready as of Phase 20D:

- The local-first hybrid runtime baseline is stable for continued internal/test usage.
- Backup/export/restore operates against localStorage with documented manual transfer.
- Vietnamese-first UX copy and trust copy are aligned with the no-cloud/default-off
  position.
- Phase 17/18/19 readiness, design, and pilot work is documented.
- Phase 20A audit, Phase 20B plan, and Phase 20C plan are documented and validated.
- `beta-ai` substring is removed from positive public/package/version naming.

## What is not ready

The following are explicitly not ready as of Phase 20D:

- Real user testing has not been completed in repo evidence.
- Performance, storage quota, and import stress testing have not been completed in
  repo evidence (performance/quota/import stress testing has not been completed).
- Sync remains unshipped.
- Cloud/account/auth/backend remain absent.
- Production IndexedDB storage remains absent.
- Backup and restore are not adapter-aware.
- Data-loss prevention is not guaranteed.
- Built-in AI/OCR/AI quiz generation are not shipped.
- A `BETA_READY` decision cannot be made.

## Missing real-user testing evidence

Phase 20D records the following gap:

- Phase 20B defined the real user testing plan but did not execute it.
- The repo contains no real-user testing results log.
- No tester feedback dataset has been collected.
- No real-user data safety incident log exists.
- No real-user beta-ready signal exists.

Phase 20D treats the absence of these artifacts as decisive against `BETA_READY`.

## Missing performance/quota/import stress evidence

Phase 20D records the following gap:

- Phase 20C defined the performance/quota/import stress-test plan but did not execute it.
- The repo contains no performance measurement log.
- The repo contains no storage quota warning measurement log.
- The repo contains no large import stress-test result log.
- The repo contains no repeated backup/restore cycle rehearsal log.
- The repo contains no mobile/PWA stress observation log.

Phase 20D treats the absence of these artifacts as decisive against `BETA_READY`.

## Data-safety risk decision

Phase 20D does not promise that data loss cannot happen. localStorage remains the
canonical store and remains subject to browser quota, browser data clearing, and
device loss. Backup/export/restore continues to be the user's primary data-safety
mechanism. Phase 20D does not introduce any new data-safety guarantee, does not
introduce any new backup behavior, does not introduce any new restore behavior, and
does not promise sync of any kind.

## Backup and restore decision

Phase 20D does not change backup/export/restore behavior. Restore may overwrite
current data. Backup is not sync. Backup/export/restore are not adapter-aware. These
boundaries remain unchanged by Phase 20D.

## Import and quota decision

Phase 20D does not change import parser behavior. Phase 20D does not change storage
quota warning behavior. Large-import safety remains as defined by previous phases.
Phase 20D does not implement any quota-related runtime change.

## FSRS and scheduler decision

Phase 20D does not change FSRS scheduling. FSRS remains double-gated. FSRS public
opt-in has not shipped. The legacy scheduler remains the default. Phase 20D does not
ship FSRS by default.

## Optional sync decision

Phase 20D does not implement sync. Phase 20D does not unlock the Phase 19B/19C sync
design as runtime. Sync remains unshipped. Phase 20D explicitly inherits the Phase
19D no-cloud / default-off trust copy.

## No-cloud/default-off trust decision

Phase 20D does not weaken the no-cloud / default-off trust position. Shime stores
study data in the user's browser by default. Shime does not collect telemetry or
analytics by default. Shime does not require an account by default. These trust
properties remain unchanged.

## Naming cleanup decision

```text
BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING
```

The substring `beta-ai` is removed from positive public/package/version naming. The
non-AI naming `v2.0.0-beta.1` (and `2.0.0-beta.1` in package metadata) replaces it.
Public release/deploy docs and validator scripts that previously hard-pinned the
`beta-ai` substring are updated to the non-AI naming. Remaining `beta-ai`
occurrences are allowed only in explicit warning, forbidden, or naming-risk sections
that describe `beta-ai` as misleading and not acceptable as public naming.

## Why beta-ai naming is misleading

The substring `beta-ai` can imply built-in AI capability (beta-ai naming can imply
built-in AI). Shime Quiz does not ship
built-in AI. Shime does not ship OCR. Shime does not ship automated AI quiz
generation. Shime does not ship an AI API integration. Shime does not call an AI
service at runtime. The EduGen workflow is a manual paste-and-review boundary, not a
built-in AI feature. Public/package/version naming that includes `beta-ai` therefore
risks misleading users into expecting AI features that the app does not provide.

For this reason Phase 20D removes `beta-ai` from positive public/package/version
naming and replaces it with non-AI naming such as `v2.0.0-beta.1`.

## Release naming and version boundary

Phase 20D fixes the following naming boundary:

- `package.json` and `package-lock.json` version fields use `2.0.0-beta.1`.
- `src/version.js` `APP_VERSION` uses `2.0.0-beta.1`.
- `sw.js` `CACHE_VERSION` uses `shimechamhoc-v2.0.0-beta.1`.
- Public release/deploy documents use `v2.0.0-beta.1`.
- Validator scripts that previously asserted `2.0.0-beta-ai.1` now assert
  `2.0.0-beta.1`.

Phase 20D does not claim that `v2.0.0-beta.1` is itself a beta-ready release. The
version string is administrative naming hygiene only. Beta readiness remains
governed by the `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` decision recorded above.

## Required user-facing claim boundaries

Phase 20D requires the following user-facing claim boundaries to remain enforced:

- Shime does not promise data loss cannot happen.
- Shime does not promise cross-device sync.
- Shime does not advertise built-in AI, OCR, or automated AI quiz generation.
- Shime does not advertise zero-knowledge or end-to-end encryption.
- Shime does not advertise account/cloud/auth/backend features.
- Shime does not advertise production IndexedDB storage.
- Backup is not sync.
- Restore may overwrite current data.
- Manual transfer is the only cross-device data movement path.

## What Phase 20D explicitly does not implement

Phase 20D explicitly does not implement any of the following:

- sync runtime
- cloud/account/auth/backend
- production IndexedDB storage backend switch
- runtime migration
- runtime stress fixtures
- runtime performance measurement infrastructure
- telemetry
- analytics
- AI integration
- OCR
- automated AI quiz generation
- FSRS-by-default
- a `BETA_READY` decision

## Post-20D next steps

Phase 20D recommends the following sequence after this gate:

```text
20E — Execute real user testing results log
20F — Execute performance/quota/import stress results log
20G — Beta readiness re-decision after evidence
```

These phases must execute the Phase 20B and Phase 20C plans and record real results
before any future `BETA_READY` decision can be re-evaluated. Phase 20D does not
unlock sync/runtime/migration based on this decision. Phase 20D does not skip
post-20D phases.

## Acceptance criteria

Phase 20D is accepted only if all of the following hold:

1. This ADR exists and contains the required headings, decision tokens, and decision
   rationale.
2. `docs/release/phase20d-beta-hold-evidence.md` exists and contains the required
   evidence headings and gap statements.
3. `scripts/validate-phase20d-hold-decision-beta-ai-naming-cleanup.js` exists and
   enforces every Phase 20D guard listed in the master plan.
4. `.github/workflows/e2e-smoke.yml` registers the Phase 20D validator strictly after
   Phase 20C and does not use `continue-on-error: true`.
5. `LOCAL_FIRST_HYBRID_BETA_DECISION: HOLD` is present in this ADR and is not
   overridden by an active `BETA_READY` claim.
6. `BETA_AI_NAMING_DECISION: REMOVE_BETA_AI_PUBLIC_NAMING` is present in this ADR.
7. `package.json`, `package-lock.json`, `src/version.js`, and `sw.js` use non-AI
   naming and do not contain positive `beta-ai` substrings.
8. Positive public release/deploy documents and validator hard-pins no longer use
   `beta-ai` as the expected version.
9. No `tests/`, `e2e/`, runtime parser, FSRS runtime, storage/migration runtime, or
   backup/export/restore runtime files have changed.
10. No dependencies have been added.
11. Historical validator forward-compat changes are limited to the exact Phase 20D
    entries.
12. The Phase 20D validator and the full validator chain pass.
