# Phase 15A — Active FSRS Scheduling Architecture & Rollout Plan

## Subtitle: Docs / Static Validator / CI Only

---

## 1. Executive Summary

Phase 15A is **docs/static-validator/CI-only**. It does not implement active FSRS scheduling.

- Active FSRS scheduling is **not enabled** in this phase.
- Production `ts-fsrs.next()` is **not called** in Phase 15A.
- No `src/` files are changed in Phase 15A.
- No `tests/` files are changed in Phase 15A.
- Phase 15B may implement active scheduling **only after** this architecture contract is accepted and merged.
- Phase 15C implements Dashboard mixed scheduler due-count display.
- Hybrid local-first/sync work is deferred to Phase 16A+ and must **not** mix with Phase 15B/15C runtime work.

---

## 2. Ten Phase 14O Gate Decisions

All ten gates from Phase 14O are resolved here. Active scheduling must not ship before all ten are satisfied.

### Gate 1: Active-Scheduling Scope and Rollback Plan

**Scope**: Active scheduling is implemented in `reviewSchedulerAdapter.js` and `reviewScheduleStorage.js` only. It is activated by a double gate: the user-visible `fsrsExperimentalEnabled` toggle **and** an internal second-layer flag `fsrsActiveSchedulingEnabled` (default OFF, not user-visible). The call site is `scheduleReview` in `reviewSchedulerAdapter.js` — never the bridge UI handler.

**Rollback plan**: Two rollback paths exist.

- Path A — User flips `fsrsExperimentalEnabled` OFF: all future reviews use SM-2. Existing `fsrs-active` records keep their last FSRS-computed `dueAt` and `intervalDays` frozen. No records are demoted or cleared.
- Path B — Engineering flips `fsrsActiveSchedulingEnabled` OFF: identical behavior to Path A's go-forward part. This is the primary engineering kill-switch and requires no user action.

Neither rollback path causes a mass reschedule storm because `dueAt`/`intervalDays` are preserved rather than reverted to SM-2 defaults.

### Gate 2: Rating Mapping

**Decision** (memoryRating-dominant when present, objectiveCorrect-dominant when absent):

| objectiveCorrect | memoryRating | continueWithoutRating | FSRS rating | Notes |
|---|---|---|---|---|
| false | (ignored) | (ignored) | `Again` | Wrong always → Again |
| null (unanswered) | (ignored) | (ignored) | `Again` | Unanswered = wrong |
| true | `Hard` | false | `Hard` | |
| true | `Good` | false | `Good` | |
| true | `Easy` | false | `Easy` | |
| true | null | true | SM-2 fallback | See Gate 2 / Section 5 |
| true | null | false | `Good` (defensive) | Should not occur in production |

Wrong/unanswered → `Again` is unambiguous and matches Phase 14N inert log policy. Hard/Good/Easy buttons are only shown after a correct objective answer (Phase 14N bridge enforces this).

### Gate 3: Backward Compatibility for Existing `fsrsReviewLogs`

All existing Phase 14N bridge logs have the shape `{ rating, source: 'phase14n-studyroom-bridge', activeScheduling: false, reviewedAt, objectiveCorrect }`. These logs are **inert** in Phase 14N and do not need to be re-played by Phase 15B's `ts-fsrs.next()` call. Phase 15B uses only the `fsrsPayload` seeded by Phase 14L (which contains `state: 'New'`, `stability: 1.0`, `difficulty: 5.0`) as the starting point. Historical Phase 14N logs are preserved and are compatible with future replay if Phase 16C introduces an append-only event log; no migration or backfill is needed in Phase 15B.

### Gate 4: Zero-Log Dormant Cards

**Decision**: Active scheduling does **not** require pre-existing memory rating logs. Zero `fsrsReviewLogs` is the **dominant** case at activation time (Phase 14N bridge only fires on the second review onward; most `fsrs-planned` records will have zero logs). Phase 15B uses the dormant `fsrsPayload` (already set to FSRS New-card defaults by Phase 14L) as the starting card for `ts-fsrs.next()`. Empty logs are normal, not an error condition.

### Gate 5: Dashboard Due-Count Strategy

**Decision**: Active FSRS scheduling may ship before Dashboard mixed-count display, on the condition that `getDueSummary` in `reviewSchedulerAdapter.js` counts `fsrs-active` records into the FSRS-family bucket (`fsrsPlannedCount`). The Dashboard total `dueCount` is already kind-agnostic and remains numerically correct. Dashboard mixed-scheduler split display is Phase 15C. No claim is made that Dashboard mixed scheduler UI is implemented before Phase 15C ships.

### Gate 6: Backup/Restore Compatibility

**Decision**: No new top-level backup fields are added in Phase 15B. `fsrs-active` records pass through `getPreservedFsrsFields` in `reviewScheduleStorage.js` because that function's allowlist already permits all `schedulerKind` values that are not `sm2-heuristic` or `current-heuristic`. `fsrsPayload` and `fsrsReviewLogs` are already preserved by Phase 14M. Phase 15B must add a round-trip backup test verifying that `fsrs-active` records survive export/import bit-identically. Backup schema version is not bumped (no schema change). An older app reading a `fsrs-active` backup degrades to SM-2 via `getSchedulerKind`'s fallback — the safest possible degradation.

### Gate 7: Toggle OFF Rollback Behavior

**Decision**:
- User toggle OFF and internal flag OFF both stop all future active scheduling.
- Existing `fsrsPayload` and `fsrsReviewLogs` are preserved.
- Do not clear or demote `fsrs-active` records.
- Keep the last FSRS-computed `dueAt` and `intervalDays` frozen.
- Future reviews on `fsrs-active` records fall back to SM-2 using the synchronized SM-2 fields maintained in parallel during Phase 15B.
- Avoid mass reschedule storms: do not revert `dueAt` to SM-2 defaults on toggle OFF.

### Gate 8: Manual/Browser Smoke Requirements

Required before Phase 15B merges:
- App loads normally.
- `/settings` toggle ON/OFF cycle preserves dormant records.
- Study Room: new card → complete → SM-2 schedule (bridge does not show on first review).
- Study Room: second review of enrolled card with toggle ON → bridge shows → rate Good → `schedulerKind` transitions to `fsrs-active` → `dueAt` reflects FSRS computation (verify in localStorage).
- Study Room: wrong answer → rating Again → FSRS scheduled as Again.
- Study Room: correct → Continue without rating → SM-2 path; `fsrsPayload` unchanged; kind unchanged.
- Toggle OFF mid-session → subsequent reviews use SM-2.
- Backup export → clear → import → records intact including any `fsrs-active` ones.
- `/dev/fsrs-ui-fixture` still works.
- Dashboard still loads (no claim of mixed display).

### Gate 9: Unit/Static Validator Requirements

Required unit tests (Phase 15B, `tests/unit/`):
- `reviewSchedulerAdapter.activeScheduling.test.js`: double gate checks; correct/wrong/unanswered/skip-rating paths; malformed payload fallback; `ts-fsrs.next()` error fallback; SM-2 fields kept synchronized.
- `reviewScheduleStorage.activeScheduling.test.js`: `fsrs-active` preserves through `normalizeScheduleRecord`; `appendFsrsReviewLog` accepts both `fsrs-planned` and `fsrs-active`; `getDueSummary` counts `fsrs-active` into FSRS-family bucket.
- `fsrsWrapper.activeProduction.test.js`: production wrapper returns identical results to `scheduleFsrsReviewForTest`.

Required integration tests (Phase 15B):
- Full enrollment-to-activation flow test.
- Toggle OFF rollback test.
- Backup round-trip test for `fsrs-active` records.

Required static validator (Phase 15B): `scripts/validate-phase15b-fsrs-active-scheduling.js`.

### Gate 10: Release/Claim Guardrails

No user-facing copy may claim active FSRS scheduling until Phase 15B is fully validated and shipped. The Phase 14N bridge copy ("Your study schedule is not changed by this rating yet.") must be updated in Phase 15B when active scheduling actually engages. The `fsrsActiveSchedulingEnabled` internal flag must never appear in user-visible settings panels. Validators must enforce all claim guardrails. Claim guardrail lifts require a separate Phase 15D decision doc.

---

## 3. Active Scheduling Gate

The exact conditions for calling `ts-fsrs.next()` in Phase 15B (and only Phase 15B+):

```
getSettings().fsrsExperimentalEnabled === true
AND getSettings().fsrsActiveSchedulingEnabled === true
AND scheduler kind is fsrs-planned or fsrs-active (FSRS-family kind)
AND fsrsPayload validates (validateFsrsPayload returns true)
AND outcome is correct, wrong, or unanswered
AND resolved FSRS rating exists (derived per rating mapping policy)
AND call site is scheduleReview in reviewSchedulerAdapter.js only
AND call is guarded by try/catch with SM-2 fallback
```

`fsrsActiveSchedulingEnabled` is an internal second-layer flag, default `false`, not user-visible, not exposed in `FsrsExperimentalSettingsPanel` or any UI route. Both flags are re-read at gate time — never cached for a session.

---

## 4. Rating Mapping Policy

Inputs at decision time: `objectiveCorrect ∈ {true, false, null}`, `memoryRating ∈ {'Again','Hard','Good','Easy', null}`, `continueWithoutRating ∈ {true, false}`.

```
Wrong → Again
Unanswered → Again
Correct + Hard → Hard
Correct + Good → Good
Correct + Easy → Easy
Correct + Continue without rating → SM-2 fallback for that review only (see Section 5)
Correct + no rating / no skip (impossible defensive fallback) → Good
```

**Decision**: Do not invent a Good rating for explicit "Continue without rating". The user's explicit skip is honored by falling back to SM-2 for that review only, leaving `fsrsPayload` untouched.

---

## 5. Continue Without Rating Policy

When `objectiveCorrect === true` and the user clicks "Continue without rating":

1. Do **not** call `ts-fsrs.next()` for this review.
2. Update the record using `updateRecordFromResult` (SM-2 path) for this review only.
3. **Preserve** existing `fsrsPayload` and `fsrsReviewLogs` untouched.
4. Keep `schedulerKind` at its current value (`fsrs-planned` or `fsrs-active`) — do not demote.
5. Do not append a synthetic rating log (consistent with Phase 14N "no log appended on skip").

A heavy skipper effectively receives SM-2 scheduling even with the toggle ON — acceptable, conservative, and reversible. FSRS state only updates on user-confirmed memory ratings, which is the purpose of the two-step bridge.

**Rejected alternatives**:
- Treat as Good: silently invents user data; risks corrupting long-run stability/difficulty. Strongly rejected.
- Force a rating before scheduling: violates Phase 14N explicit UX contract. Rejected.
- No SM-2 update either (leave `dueAt` stale): creates phantom "due now" behavior. Rejected.

---

## 6. Scheduler Kind Policy

- **Keep `fsrs-planned`** for dormant records (set by Phase 14L enrollment; unchanged until first successful `ts-fsrs.next()` call).
- **Introduce `fsrs-active`** only after a successful production `ts-fsrs.next()` call on an `fsrs-planned` record.
- A record that is `fsrs-active` and falls through to SM-2 (skip case, malformed payload, error fallback) does **not** demote to `fsrs-planned` or `sm2-heuristic`. The kind reflects "this card has FSRS state worth preserving."
- Phase 15B must add `fsrs-active` to `FSRS_KIND_ALIASES` in `reviewSchedulerAdapter.js` so `getSchedulerKind`, `getDueSummary`, `shouldShowFsrsTwoStepBridge`, and `appendFsrsReviewLog` all treat it as FSRS-family.
- Phase 15B must widen `appendFsrsReviewLog`'s `record.schedulerKind !== 'fsrs-planned'` check to accept both `fsrs-planned` and `fsrs-active` (FSRS-family predicate).

Rationale for split kinds:
1. Distinguishes dormant vs. actively-scheduled records for validators, backup, and Dashboard.
2. Enables targeted rollback behavior on `fsrs-active` records without disturbing dormant `fsrs-planned` records.
3. Phase 15C Dashboard work needs the distinction to count records correctly.

---

## 7. Rollback Policy

**Path A — User flips `fsrsExperimentalEnabled` OFF:**
- All future reviews use SM-2 (existing Phase 14N behavior).
- Existing `fsrs-active` records: keep last FSRS-computed `dueAt` and `intervalDays`. Do not revert, do not clear `fsrsPayload` or `fsrsReviewLogs`, do not demote `schedulerKind`.
- The next review uses SM-2 from the current SM-2 fields (`easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount`), which Phase 15B must keep synchronized in parallel during active scheduling.
- Existing `fsrs-planned` (dormant) records: unchanged, per Phase 14N/14M guarantee.

**Path B — Engineering flips `fsrsActiveSchedulingEnabled` OFF:**
- Identical user-visible behavior to Path A.
- This is the primary rollback handle requiring no user action.

**Rejected alternatives**:
- Revert active records to SM-2 scheduling immediately: triggers mass reschedule storm, risks creating thousands of "due now" cards. Rejected.
- Freeze FSRS records (no updates) but keep `dueAt`: equivalent for go-forward; chosen policy is strictly more recoverable because SM-2 updates continue flowing.

---

## 8. Existing Card Policy

**Strict no-migration, no-backfill stance.**

- No import-time enrollment (Phase 14M/14N guarantee preserved).
- No app-boot enrollment.
- No session-start enrollment.
- No "first toggle ON" enrollment sweep.
- Existing SM-2 cards remain SM-2 forever unless they organically enrolled via the Phase 14L path on a future new-card first completed review.
- Phase 15B must update `scheduleReview` to keep SM-2 fields (`easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount`, `intervalDays`) **synchronized in parallel** for `fsrs-active` records.

For `fsrs-active` write-back in Phase 15B:
- `dueAt`, `intervalDays` ← from FSRS output
- `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount` ← from SM-2 candidate
- `fsrsPayload`, `fsrsReviewLogs` ← from FSRS output
- `schedulerKind` ← `fsrs-active`

---

## 9. Dormant Record Policy

`fsrs-planned` records with zero `fsrsReviewLogs` are the **dominant** case at activation time (Phase 14N bridge fires only on the second review onward).

**Decision: Active scheduling does not require pre-existing memory logs.**

- On the first review after activation for an `fsrs-planned` record with empty logs: use the FSRS rating derived directly from objective correctness + bridge interaction per the rating mapping policy. The `fsrsPayload` seeded by Phase 14L (`state: 'New'`, `stability: 1.0`, `difficulty: 5.0`) is a valid New-card input to `ts-fsrs.next()`.
- Malformed `fsrsPayload` (fails `validateFsrsPayload`): fall back to SM-2 for this review; do not touch `fsrsPayload`; emit a diagnostic log. **Do not crash.** Add a malformed-payload counter for future cleanup decisions.
- Empty logs is normal, not an error condition.

**Rejected**: requiring at least one inert log before activation would mean most dormant records never activate (users rarely re-encounter new cards before rollout). Rejected.

---

## 10. Dashboard Policy

- Active scheduling may ship before Dashboard mixed-count display only if `getDueSummary` counts `fsrs-active` into the FSRS-family bucket.
- Dashboard total `dueCount` is already kind-agnostic (numerically correct).
- Dashboard mixed-scheduler split display is **Phase 15C**.
- No claim that Dashboard mixed scheduler UI is implemented before Phase 15C ships.
- Phase 15C (Dashboard mixed display) should follow Phase 15B closely, ideally in the same release cycle.

---

## 11. Backup/Restore Policy

- No new top-level backup fields in Phase 15B unless explicitly justified and approved.
- `fsrs-active` must round-trip through backup/restore: `dueAt`, `intervalDays`, `fsrsPayload.stability`, `fsrsPayload.difficulty`, `fsrsPayload.state`, `fsrsReviewLogs` must be bit-identical after export/import.
- `fsrsPayload` and `fsrsReviewLogs` remain preserved (Phase 14M guarantee).
- `getPreservedFsrsFields` in `reviewScheduleStorage.js` already allows `fsrs-active` through (its exclusion list is `['sm2-heuristic', 'current-heuristic']` only). Phase 15B must add a test verifying this.
- Backup schema version not bumped (no schema change).
- Down-version compat: an older app reading an `fsrs-active` backup falls back to SM-2 via `getSchedulerKind`'s default — safest possible degradation.

---

## 12. Phase 15B File Scope

**Allowed for Phase 15B:**
```
src/quiz/reviewSchedulerAdapter.js
src/state/reviewScheduleStorage.js
src/state/settingsStorage.js
src/quiz/fsrsWrapper.js
new tests under tests/
scripts/validate-phase15b-fsrs-active-scheduling.js
docs/phase15b-fsrs-active-scheduling.md
.github/workflows/e2e-smoke.yml
```

**Forbidden for Phase 15B unless explicitly re-approved:**
```
src/routes/StudyRoom.jsx
src/routes/Dashboard.jsx
src/components/study/FsrsProductionMemoryRatingBridge.jsx
src/quiz/dataBackup.js
src/state/v2BackupRestore.js
package.json
package-lock.json
```

Key Phase 15B code changes required:
1. Add `SCHEDULER_KIND_FSRS_ACTIVE = 'fsrs-active'` constant in `reviewSchedulerAdapter.js`.
2. Add `fsrs-active` to `FSRS_KIND_ALIASES`.
3. Implement double-gate `scheduleReview` path for FSRS-family records.
4. Add internal `fsrsActiveSchedulingEnabled` default `false` in `settingsStorage.js` `getDefaultSettings()`.
5. Widen `appendFsrsReviewLog` kind check from `=== 'fsrs-planned'` to FSRS-family predicate.
6. Add `fsrs-active` to `getDueSummary` FSRS-family count.
7. Expose a production-facing `scheduleFsrsReview` wrapper (or alias) in `fsrsWrapper.js` for Phase 15B's call site; `scheduleFsrsReviewForTest` remains test-only.
8. Keep SM-2 fields synchronized in parallel on `fsrs-active` write-back.

---

## 13. Phase 15C File Scope

Dashboard mixed scheduler due-count/display:
```
src/routes/Dashboard.jsx
src/quiz/reviewSchedulerAdapter.js (getDueSummary extension for display split)
docs/phase15c-dashboard-mixed-scheduler.md
tests/ (new unit tests)
scripts/validate-phase15c-dashboard-mixed-scheduler.js
.github/workflows/e2e-smoke.yml
```

---

## 14. Parallel Lane Plan

- **Phase 15A** — Claude owns docs/validator only. No source code changes. No test changes.
- **Phase 15B** — Codex owns active scheduling runtime. Touches Codex-owned files (`reviewSchedulerAdapter.js`, `reviewScheduleStorage.js`, `settingsStorage.js`, `fsrsWrapper.js`).
- **Phase 15C** — Codex owns Dashboard mixed scheduler (`Dashboard.jsx`, `reviewSchedulerAdapter.js`).
- **Claude may review/test/write-validators** but must not modify Codex-owned runtime files concurrently.
- **Codex must not touch** docs/validators owned by Claude during Phase 15B without coordination.
- If Phase 15C runs concurrently with Phase 15B, Dashboard work is Codex-only and Phase 15B leaves existing `Dashboard.jsx` `dueCount` rendering untouched.

**Coordination protocol**: at Phase 15B kickoff, confirm no file in the ownership table is currently in-flight in the other lane before opening a PR.

**File ownership (inherited from Phase 14P):**

| File | Owner |
|---|---|
| `src/state/reviewScheduleStorage.js` | Codex |
| `src/quiz/reviewSchedulerAdapter.js` | Codex |
| `src/routes/StudyRoom.jsx` | Codex |
| `src/routes/Dashboard.jsx` | Codex |
| `src/state/settingsStorage.js` | Codex |
| `src/quiz/dataBackup.js` | Codex |
| `src/state/v2BackupRestore.js` | Codex |

---

## 15. Hybrid Local-First Boundary

- Hybrid local-first is a **future Phase 16 track**, not part of Phase 15A/15B/15C.
- No sync/storage migration in Phase 15A, 15B, or 15C.
- Phase 16A may plan hybrid local-first docs-only after active scheduling stabilizes (after Phase 15D rollout audit).
- Implementation sequence (Phase 16+): IndexedDB migration → append-only event log → optional encrypted sync prototype → opt-in sync UI.
- No claim of sync/cloud/account/E2EE until implemented and verified in the appropriate Phase 16 milestone.
- Mixing sync work with active FSRS scheduling work in the same release window is **forbidden** and is the highest-risk path.

---

## 16. Required Tests for Phase 15B

**Unit tests** (new files under `tests/unit/`):

`reviewSchedulerAdapter.activeScheduling.test.js`:
- Gate check: SM-2 result when `fsrsExperimentalEnabled` OFF.
- Gate check: SM-2 result when `fsrsActiveSchedulingEnabled` OFF.
- Gate check: SM-2 result when `schedulerKind` not FSRS-family.
- Both gates ON + `fsrs-planned` record + correct + Good → `ts-fsrs.next()` called; `schedulerKind: 'fsrs-active'`; FSRS-computed `dueAt`; `fsrsPayload.stability`/`difficulty` populated.
- Wrong outcome → rating Again; `fsrs-active` kind.
- Unanswered outcome → rating Again; FSRS scheduled.
- Skip rating (correct + null memoryRating + continueWithoutRating) → SM-2 path; `fsrsPayload` preserved; kind unchanged.
- Malformed `fsrsPayload` → SM-2 fallback; no crash; diagnostic emitted.
- `ts-fsrs.next()` throws → SM-2 fallback; no crash; diagnostic emitted; record not partially mutated.
- SM-2 fields kept synchronized on `fsrs-active` write-back.

`reviewScheduleStorage.activeScheduling.test.js`:
- `fsrs-active` records preserve through `normalizeScheduleRecord` round-trip.
- `appendFsrsReviewLog` accepts both `fsrs-planned` and `fsrs-active`.
- `getDueSummary` counts `fsrs-active` into FSRS-family bucket.

`fsrsWrapper.activeProduction.test.js`:
- Production wrapper function returns identical results to `scheduleFsrsReviewForTest` (regression).

**Integration tests** (new files under `tests/`):
- `fsrsActiveSchedulingEnrollmentToActivation.test.js`: new card → SM-2 first review → Phase 14L dormant enrollment → second review with bridge → Phase 15B active scheduling → `fsrs-active` kind.
- `fsrsActiveSchedulingRollback.test.js`: active record → toggle OFF → next review uses SM-2; `dueAt` advances without mass reschedule; `fsrsPayload` preserved.
- `fsrsActiveSchedulingBackupRoundTrip.test.js`: export with `fsrs-active` records → clear → import → bit-identical.

**Manual/browser smoke** (mandatory before Phase 15B merges — see Gate 8 above).

---

## 17. Required Validators for Phase 15B

`scripts/validate-phase15b-fsrs-active-scheduling.js` must check:
- Double gate exists in `reviewSchedulerAdapter.js` (`fsrsExperimentalEnabled === true && fsrsActiveSchedulingEnabled === true`).
- Internal `fsrsActiveSchedulingEnabled` flag in `settingsStorage.js` defaults `false`.
- `fsrsActiveSchedulingEnabled` NOT referenced in `FsrsExperimentalSettingsPanel` or any UI route.
- `ts-fsrs.next()` call exists exactly once in production, at the approved call site only.
- `fsrs-active` kind constant defined and added to `FSRS_KIND_ALIASES`.
- try/catch wraps the `.next()` call site.
- `appendFsrsReviewLog` accepts both `fsrs-planned` and `fsrs-active`.
- `getPreservedFsrsFields` passes `fsrs-active` kind through (not excluded).
- `getDueSummary` counts `fsrs-active` into FSRS-family bucket.
- No Dashboard UI claim before Phase 15C.
- No user-facing copy claims active FSRS scheduling.
- Backup fields preserved.
- No package/dependency changes.
- No migration/backfill paths.

---

## 18. Risk Register

| Risk | Severity | Cause | Mitigation | Blocks merge? |
|---|---|---|---|---|
| Mass reschedule storm on toggle OFF | High | Reverting active records to SM-2 defaults | Rollback policy keeps `dueAt`/`intervalDays`; SM-2 fields kept in sync during active scheduling | Yes — policy locked in Phase 15A; test required in 15B |
| Skip-as-Good corruption | High | Inventing user data for "Continue without rating" | Continue-without-rating falls back to SM-2 path; `fsrsPayload` untouched | Yes — Phase 15A policy lock |
| Malformed `fsrsPayload` crash | High | Legacy/imported records with bad payload | `validateFsrsPayload` + try/catch → SM-2 fallback + diagnostic counter | Yes — Phase 15B test required |
| Zero-log dormant record dominance | Medium | Phase 14N bridge fires only on 2nd+ review | Dormant-record policy: empty logs are normal; FSRS seeds from default state in `fsrsPayload` | Yes — Phase 15A policy lock |
| Dashboard count drift | Medium | `fsrs-active` not counted in FSRS bucket | `getDueSummary` add `fsrs-active` to FSRS-family count; total `dueCount` already kind-agnostic | Yes — Phase 15B test |
| Backup round-trip drops `fsrs-active` | Medium | Allowlist mismatch in `getPreservedFsrsFields` | Existing allowlist already permits `fsrs-active`; Phase 15B must add a round-trip test | Yes — Phase 15B test |
| Phase 14N bridge copy misleading after activation | Medium | Copy says "not changed yet" but now changes | Bridge copy must be updated in Phase 15B when active scheduling actually engages | Yes — Phase 15B sub-task |
| Codex/Claude file collision during parallel work | Medium | Both lanes touching same file | File ownership table from Phase 14P enforced; Phase 15A static validator checks no `src/` changes | Yes — Phase 15A static check |
| Internal flag accidentally exposed | Low | UI mistake | Phase 15B validator asserts `fsrsActiveSchedulingEnabled` not referenced in any settings panel | Yes — Phase 15B validator |
| Two scheduler paths drift over time | Medium | SM-2 and FSRS maintained in parallel | Synchronization tests in Phase 15B; deprecation of SM-2 fields deferred to Phase 16+ | No — documented |
| Older app reads `fsrs-active` backup | Low | Forward compat | Falls back to SM-2 via `getSchedulerKind` default | No — graceful |
| `ts-fsrs` 5.3.3 unexpected output | Low | Library bug | `serializeFsrsCard` normalizes output; tests assert exact shape | No |

---

## 19. Claims Control

**Safe in Phase 15A:**
- Active scheduling architecture is planned.
- Active scheduling is not implemented in Phase 15A.
- `ts-fsrs.next()` is not called in Phase 15A.
- No `src/` files changed in Phase 15A.
- No `tests/` files changed in Phase 15A.

**Safe after Phase 15B ships and is validated:**
- Active FSRS scheduling is available for cards enrolled via the experimental toggle.

**Forbidden until the named phase ships and validators confirm it:**
- Any claim that FSRS scheduling has been activated — forbidden before Phase 15B ships.
- Any claim that production ts-fsrs.next is executed — forbidden before Phase 15B ships.
- Any claim that Dashboard per-scheduler split display is live — forbidden before Phase 15C ships.
- Any cloud sync claim — forbidden before Phase 16E ships.
- Any E2EE claim — forbidden before Phase 16E ships.
- Any multi-device sync claim — forbidden before Phase 16E ships.

---

## Active Scheduling Disabled Evidence (Phase 15A)

- `src/quiz/reviewSchedulerAdapter.js` does not call `.next()`.
- `src/state/reviewScheduleStorage.js` does not call `.next()`.
- `src/routes/StudyRoom.jsx` does not call `.next()`.
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx` does not call `.next()`.
- `fsrsWrapper.js` contains `.next()` only as a test-gated wrapper definition; it is not reachable from production scheduling paths.
- `dueAt`, `intervalDays`, `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount` are never updated from `ts-fsrs.next()` output.
- SM-2-like scheduling remains the only active production scheduler.

---

## Manual/Browser Smoke

Manual/browser smoke not run because Phase 15A is docs/static-validator/CI-only and no runtime/UI files changed. The existing Phase 14N/14P browser smoke baseline remains valid:
- App root loads normally.
- `/settings` loads; FSRS experimental toggle is visible and toggleable.
- `/dev/fsrs-ui-fixture` loads and works.
- Study Room loads; normal SM-2 flow works.
- Study Room shows memory rating bridge for eligible `fsrs-planned` cards when toggle is ON.
- Dashboard loads.

---

## Phase 15A Scope

### Files created in Phase 15A:
- `docs/phase15a-fsrs-active-scheduling-architecture.md` — this file
- `scripts/validate-phase15a-fsrs-active-scheduling-architecture.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 15A validator registered in CI after Phase 14P

### Files NOT modified in Phase 15A:
- Any `src/` file
- Any `tests/` file
- `package.json`
- `package-lock.json`
- E2E tests

---

## Next Phase

Phase 15B may implement active FSRS scheduling only after Phase 15A is merged, validated, and all ten gates above are satisfied. Phase 15B is a Codex lane. Phase 15A must be merged into `origin/main` before Phase 15B begins implementation.
