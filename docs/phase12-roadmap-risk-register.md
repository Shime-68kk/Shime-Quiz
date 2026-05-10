# Phase 12 Roadmap / Risk Register / Scope Lock

## 1. Purpose

Phase 12A creates the controlled roadmap, risk register, and scope lock for the next Shime Quiz development track after Phase 11.

Phase 12A is a docs/static-validator/CI-only phase. It does not implement runtime app behavior changes, storage changes, backup format changes, UI changes, algorithm changes, package changes, release packaging, release tagging, or GitHub Release publication.

## 2. Baseline

The project is completed/merged through Phase 11H. Phase 11H added the Phase 11 cross-device transfer track closure and release-readiness re-audit.

The current app remains local-first and browser-local. Current portability remains manual backup/export/import. A Web Share runtime prototype exists where the browser/platform supports it. Normal backup file download remains fallback, and restore from backup remains available.

Phase 12A does not change these boundaries. It only documents the next controlled track and claim limits. QR transfer is not implemented by Phase 12A. Cloud/account sync is not implemented by Phase 12A. Encryption is not implemented by Phase 12A.

## 3. Phase 12 theme

**Stability + UX + Performance + Data Safety Track**

Phase 12 prioritizes safe, incremental improvements over large architecture rewrites. The track should plan risky changes before runtime implementation, preserve the local-first/browser-local product model, and avoid unsupported claims about features that are only planned or being evaluated.

## 4. Technical track

Planned technical areas for Phase 12 are:

- **Storage capacity risk.** Document and reduce the risk that browser-local data grows beyond practical localStorage limits.
- **IndexedDB migration planning.** Evaluate a future IndexedDB migration path, data model, compatibility plan, migration safety strategy, rollback expectations, and backup/restore impact before any storage runtime change.
- **Storage quota warning runtime.** Plan a later user-facing warning when storage pressure becomes risky, without changing storage schema during Phase 12A.
- **Unit test foundation.** Plan a minimal Vitest-oriented unit test foundation for pure functions and safety-critical logic before larger algorithm or storage changes.
- **Route-level code splitting.** Plan route-level code splitting and measurement boundaries before changing runtime bundling behavior.
- **Future FSRS evaluation.** Evaluate FSRS as a future learning-algorithm option only. Phase 12A does not change SM-2/SRT behavior or Study Room scoring.

Boundaries:

- IndexedDB migration is planned/evaluated, not implemented in Phase 12A.
- Storage quota warning runtime is planned for a later phase, not implemented in Phase 12A.
- Unit tests are planned, not added by Phase 12A.
- Route-level code splitting is planned, not implemented in Phase 12A.
- FSRS is future evaluation only, not implemented by Phase 12A.

## 5. UX track

Planned UX areas for Phase 12 are:

- **Dashboard Today Card / "what should I study today?"** Plan a simpler first dashboard experience that helps users understand the next action.
- **Study flow micro-feedback.** Plan lightweight feedback for study sessions while preserving existing scoring and learning logic.
- **Onboarding aha moment.** Explore a later path that helps new users reach a first study action quickly.
- **Mobile readability / typography.** Explore later readability improvements for quiz content on small screens.
- **Keyboard navigation.** Explore later keyboard-flow completion and shortcut discoverability.
- **Mastery visualization / heatmap.** Explore later mastery visualization that makes progress easier to understand.

Boundaries:

- Dashboard Today Card is planned, not implemented by Phase 12A.
- Study micro-feedback is planned, not implemented by Phase 12A.
- No Study Room scoring or learning algorithm changes are made in Phase 12A.

## 6. Recommended Phase 12 sequence

1. Phase 12A — Roadmap / Risk Register / Scope Lock
2. Phase 12B — Storage Capacity / IndexedDB Migration Plan
3. Phase 12C — Storage Quota Warning Runtime
4. Phase 12D — Dashboard Today Card UX Plan
5. Phase 12E — Dashboard Today Card Runtime
6. Phase 12F — Unit Test Foundation Plan
7. Phase 12G — Vitest Unit Test Foundation
8. Phase 12H — Study Flow Micro-feedback Plan
9. Phase 12I — Study Flow Micro-feedback Runtime
10. Phase 12J — Route-level Code Splitting Plan
11. Phase 12K — Route-level Code Splitting Runtime
12. Phase 12L — Phase 12 Closure / Next-track Decision

## 7. Priority rationale

1. Lock roadmap/scope first so later work is evaluated against explicit boundaries.
2. Plan storage capacity and IndexedDB before touching storage runtime because storage migration risk includes data loss, backup compatibility, and rollback complexity.
3. Add storage quota warning before full migration so users can receive safety guidance without a full schema change.
4. Simplify Dashboard with a Today Card before adding more analytics or secondary detail.
5. Add unit tests before large algorithmic changes so pure functions and safety-critical paths have regression coverage.
6. Add study micro-feedback without changing scoring, spaced repetition, mastery, study history, or recommendation logic.
7. Plan and then implement code splitting so performance work has clear measurement and rollback boundaries.
8. Close Phase 12 before choosing a bigger next track such as storage migration runtime, FSRS, QR/transfer-code, cloud/account sync, or encryption architecture.

## 8. Risk register

| Risk | Impact | Mitigation | Phase where handled | Claim boundary |
| --- | --- | --- | --- | --- |
| localStorage capacity pressure | Larger quiz libraries and long study histories can exceed practical browser-local storage limits. | Document capacity risk, plan IndexedDB migration, and add quota-warning runtime before larger migration work. | Phase 12A, 12B, 12C | Storage capacity risk is documented; IndexedDB is not implemented by Phase 12A. |
| Silent write failure risk | Failed writes can cause confusing data loss or stale study state. | Evaluate quota checks, write error handling, and user-facing recovery guidance before runtime change. | Phase 12B, 12C | Storage quota warning is planned, not implemented by Phase 12A. |
| Storage migration data loss risk | A storage migration could corrupt or lose local user-owned data. | Require migration planning, backup guidance, compatibility checks, and rollback expectations before runtime migration. | Phase 12B and later implementation track | No storage migration is implemented by Phase 12A. |
| Backup/restore compatibility risk | Runtime storage changes could break existing backup files or user expectations. | Treat backup compatibility as a mandatory planning item before storage runtime changes. | Phase 12B and later implementation track | Backup format is not changed by Phase 12A. |
| Overclaiming IndexedDB/FSRS/QR/cloud/encryption | Public docs could imply features exist before implementation and evidence. | Maintain allowed/forbidden claims and static validator checks. | Phase 12A and CI | IndexedDB, FSRS, QR transfer, cloud/account sync, automatic sync, and encryption are future/planned only unless later phases implement them. |
| Dashboard complexity risk | Too many metrics can obscure the next study action. | Plan a Dashboard Today Card before runtime changes. | Phase 12D, 12E | Dashboard Today Card is planned, not implemented by Phase 12A. |
| Study flow retention risk | A cold study flow may reduce motivation. | Plan lightweight micro-feedback that does not change scoring or algorithms. | Phase 12H, 12I | Study micro-feedback is planned, not implemented by Phase 12A. |
| Runtime regression risk | Storage, dashboard, study flow, testing, and code splitting can affect core learning paths. | Sequence plan before runtime work; add validators and unit test foundation before larger changes. | Phase 12A through 12K | Phase 12A changes docs/static validator/CI only. |
| Package/dependency churn risk | New dependencies can increase audit, build, and maintenance risk. | Keep Phase 12A dependency-free; plan dependency choices in later phases only if justified. | Phase 12A and later planning phases | No package version or dependency changes by Phase 12A. |
| E2E environment-blocked risk | Local browsers or Playwright dependencies can block manual verification even when product code is unchanged. | Preserve CI E2E steps and classify local browser unavailability as environment-blocked, not product failure. | Phase 12A and CI | Do not claim E2E pass unless commands actually pass. |

## 9. Non-goals for Phase 12A

Phase 12A does not:

- change runtime app behavior
- change storage schema
- change backup format
- migrate to IndexedDB
- add storage quota warning UI
- add FSRS
- add QR transfer
- add transfer-code flow
- add WebRTC/session transfer
- add cloud/account sync
- add automatic sync
- add encryption
- add partial restore
- add incremental sync
- add Vitest/tests
- add route-level code splitting
- add Dashboard Today Card runtime
- add Study micro-feedback runtime
- add package dependencies
- change package version
- create release package
- create release tag
- publish GitHub Release

## 10. Allowed claims after Phase 12A

After Phase 12A, it is safe to claim:

- Phase 12 roadmap / risk register / scope lock exists.
- Phase 12 is scoped as a Stability + UX + Performance + Data Safety track.
- Storage capacity risk is documented.
- IndexedDB migration is planned for future evaluation, not implemented.
- Dashboard Today Card is planned, not implemented.
- Study flow micro-feedback is planned, not implemented.
- Unit test foundation is planned, not implemented.
- Route-level code splitting is planned, not implemented.
- FSRS is future evaluation only, not implemented.
- QR/cloud/encryption remain future architecture options only, not implemented.

## 11. Forbidden claims after Phase 12A

Do not claim:

- Do not claim IndexedDB implemented.
- Do not claim storage migration implemented.
- Do not claim storage quota warning implemented.
- Do not claim FSRS implemented.
- Do not claim QR transfer implemented.
- Do not claim transfer-code flow implemented.
- Do not claim WebRTC/session transfer implemented.
- Do not claim cloud/account sync implemented.
- Do not claim automatic sync implemented.
- Do not claim encryption implemented.
- Do not claim partial restore implemented.
- Do not claim incremental sync implemented.
- Do not claim Dashboard Today Card implemented.
- Do not claim Study micro-feedback implemented.
- Do not claim route-level code splitting implemented.
- Do not claim Vitest/unit tests added.
- Do not claim package version changed.
- Do not claim dependencies changed.
- Do not claim release package created.
- Do not claim release tag created.
- Do not claim GitHub Release published.
- Do not claim production/security/accessibility/performance certification.

## 12. Recommended next phase

Recommended next phase: **Phase 12B — Storage Capacity / IndexedDB Migration Plan**.

## Phase 12B update — Storage Capacity / IndexedDB Migration Plan

Phase 12B adds a dedicated storage capacity / IndexedDB migration plan in `docs/storage-capacity-indexeddb-migration-plan.md`. IndexedDB remains planned/evaluated only. No storage migration, storage schema change, or backup format change happened in Phase 12B.

Recommended next phase after Phase 12B: Phase 12C — Storage Quota Warning Runtime. Phase 12C should remain small and focused on warning/runtime visibility rather than schema migration.

## Phase 12C update — Storage Quota Warning Runtime

Phase 12C is the next runtime step after Phase 12B. It adds a small advisory storage quota warning using browser storage estimate data where available. It does not implement IndexedDB, does not migrate localStorage, and does not change storage schema or backup format.

The following roadmap item remains next: Phase 12D — Dashboard Today Card UX Plan. Phase 12D and Phase 12E are not implemented by Phase 12C.

## Phase 12D follow-up — Dashboard Today Card UX Plan

Phase 12D adds Dashboard Today Card UX planning. Today Card runtime remains future Phase 12E work. No Dashboard runtime behavior changed in Phase 12D. Phase 12E — Dashboard Today Card Runtime is the recommended next phase.



### Phase 12E follow-up

Phase 12E marks Dashboard Today Card Runtime as the current runtime Dashboard simplification step. It implements the Today Card while preserving existing Dashboard metrics and without changing Study Room logic, scoring/SRT/mastery/recommendation algorithms, storage schema, or backup format. Later Phase 12 work remains unimplemented unless completed separately.

## Phase 12F follow-up — Unit Test Foundation planning

Phase 12F adds Unit Test Foundation planning. It documents candidate pure-function test targets, a future Vitest adoption strategy, and future CI expectations.

Vitest and unit tests remain future Phase 12G work. No package/dependency changes happened in Phase 12F. Recommended next phase: Phase 12G — Vitest Unit Test Foundation.


## Phase 12G follow-up — Vitest Unit Test Foundation

Phase 12G is the Vitest Unit Test Foundation phase. It adds minimal Vitest tooling, `npm run test:unit`, and initial pure-helper unit tests.

Later phases remain unimplemented unless completed separately. Recommended next phase: Phase 12H — Study Flow Micro-feedback Plan.
