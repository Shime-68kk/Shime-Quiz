# Phase 14P — FSRS Foundation Closure / Phase 15 Parallel Handoff

## Subtitle: Docs / Static Validator / CI Only

---

## Summary

Phase 14P is a **docs/static-validator/CI-only** closure phase. It summarizes Phase 14's completed FSRS foundation, documents what remains explicitly deferred, defines safe Phase 15 parallel lanes for Codex and Claude, and establishes file ownership guardrails for future parallel work. Phase 14P does not implement active FSRS scheduling, does not call production `ts-fsrs.next()`, and makes no changes to any runtime or UI source files. Existing SM-2-like heuristic scheduling remains the only active production scheduler.

---

## What Phase 14P Does NOT Do

- Phase 14P does **not** activate FSRS scheduling.
- Phase 14P does **not** call production `ts-fsrs.next()`.
- Phase 14P does **not** modify any `src/` file.
- Phase 14P does **not** modify `src/routes/StudyRoom.jsx`.
- Phase 14P does **not** modify `src/routes/Dashboard.jsx`.
- Phase 14P does **not** modify `reviewSchedulerAdapter.js`, `reviewScheduleStorage.js`, `fsrsWrapper.js`, or `settingsStorage.js`.
- Phase 14P does **not** change `package.json` or `package-lock.json`.
- Phase 14P does **not** add dependencies.
- Phase 14P does **not** claim that active FSRS scheduling is live for users.

---

## Phase 14 Completed Foundation

Phase 14 spans milestones 14A through 14P and delivers an FSRS foundation that is dormant-safe, backup-hardened, and ready for Phase 15 active scheduling.

### Phase 14A — Scheduler Adapter Boundary
Defined the `reviewSchedulerAdapter.js` boundary to isolate SM-2 from future FSRS integration.

### Phase 14B — FSRS Wrapper Prototype
Added `fsrsWrapper.js` as a thin wrapper around `ts-fsrs` (pinned at 5.3.3). No production calls.

### Phase 14C — FSRS Persistence/Backup Harness
Defined the persistence model for FSRS metadata fields (`fsrsPayload`, `fsrsEnrolled`, `fsrsReviewLogs`).

### Phase 14D — Developer-Gated FSRS Adapter Routing
Added developer-gated routing in the adapter layer; routing remains dormant in production.

### Phase 14E — FSRS User-Facing Entry Decision
Documented the user-facing entry decision: experimental toggle is the access gate.

### Phase 14F — FSRS Experimental Toggle Plan
Specified the experimental toggle design and the `fsrsExperimentalEnabled` setting schema.

### Phase 14G — Settings Storage Schema
Implemented lazy settings storage with the `fsrsExperimentalEnabled` field; v2 backup updated.

### Phase 14H — FSRS Experimental Toggle UI
Added the visible `/settings` route with `FsrsExperimentalSettingsPanel`. Toggle is **default OFF**. Active FSRS scheduling remains disabled regardless of toggle state.

### Phase 14I — FSRS Two-Step Rating UI Fixture
Added the hidden `/dev/fsrs-ui-fixture` route with `FsrsTwoStepScaffold`. Fixture exists for developer preview only and is not linked from any production navigation.

### Phase 14J — FSRS Enrollment Readiness Harness
Added dormant FSRS enrollment readiness helpers (`isFsrsNewCardEnrollmentEligible`, `scheduleDormantFsrsReview`) and metadata/log support. Enrollment is dormant.

### Phase 14K — FSRS Readiness Audit / Regression Hardening
Hardened validators and tests against scope drift; confirmed active scheduling boundary.

### Phase 14L — Production Enrollment Wiring (Dormant)
Wired dormant FSRS enrollment into the production review schedule update path (`updateReviewScheduleFromHistoryRecord`) for strictly eligible new-card first completed reviews. Enrollment writes `fsrs-planned` records only; active FSRS scheduling remains disabled.

### Phase 14M — FSRS Metadata Backup/Import/Export Hardening
Hardened backup/import/export to preserve dormant FSRS metadata fields (`fsrsPayload`, `fsrsEnrolled`, `fsrsReviewLogs`, `fsrsEnrolledAt`) through export/import cycles. No active scheduling.

### Phase 14N — Production Study Room Two-Step Memory Rating Bridge (Dormant)
Added the production Study Room two-step memory rating bridge for dormant `fsrs-planned` records. Bridge is conditionally shown when `fsrsExperimentalEnabled` is ON and the record is `fsrs-planned`. Memory ratings are **inert logs only** — they are written to `fsrsReviewLogs` by `appendFsrsReviewLog` but are not read back by the scheduler and do not affect any scheduling fields (`dueAt`, `intervalDays`, `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount`). Active FSRS scheduling remains disabled.

### Phase 14O — Active Scheduling Rollout Decision Gate
Created the active scheduling rollout decision gate: a docs/static-validator/CI-only safety checkpoint defining ten required gates that must all be satisfied before any future phase calls production `ts-fsrs.next()` or makes FSRS the active scheduler. Active FSRS scheduling remains disabled.

---

## Still Deferred

The following items remain **explicitly deferred** and must not be claimed as implemented:

- **Active FSRS scheduling** — `ts-fsrs.next()` is not called from any production path. SM-2-like scheduling remains the only active scheduler.
- **Production `ts-fsrs.next()`** — forbidden in all production code paths as of Phase 14P.
- **Dashboard mixed scheduler due-count** — Dashboard mixed scheduler due-count display remains deferred. Dashboard has not been modified.
- **Full rollout/rollback execution** — Toggle OFF is tested only at the dormant level. No full rollout or rollback from active scheduling has been executed.
- **Migration/backfill of existing SM-2 cards** — No import-time, app-boot, or session-start enrollment occurs. No migration of cards that are not `fsrs-planned`.
- **Any user-facing claim that FSRS scheduling has been activated** — no user-facing copy, docs, or validators may make this claim until a future phase satisfies all ten gates from Phase 14O.

---

## Phase 15 Candidate Lanes

Phase 15 is expected to include heavier production intelligence work and may involve Codex and Claude working in parallel lanes. The following lane assignments are **recommended starting points** and must be confirmed by the lane owner at Phase 15 kickoff.

### Codex Lane Candidates

These lanes touch runtime/scheduling logic and require careful scope isolation:

- **Active FSRS scheduling implementation** behind the existing experimental toggle (`fsrsExperimentalEnabled`). Must satisfy all ten gates from Phase 14O before shipping.
- **Rating-to-FSRS mapping** — define the exact mapping from Objective Correctness + Memory Rating to FSRS `Again`/`Hard`/`Good`/`Easy` rating values passed to `ts-fsrs.next()`.
- **Scheduler adapter activation** — modify `reviewSchedulerAdapter.js` to route `fsrs-planned` records through `ts-fsrs.next()` when toggle is ON.
- **Dashboard due-count strategy** — define and implement the Dashboard mixed scheduler due-count display for SM-2 + FSRS mixed state.
- **Rollback/disable policy** — define and test what happens when toggle is turned OFF after active scheduling has already run; which fields revert, which are preserved.

### Claude Lane Candidates

These lanes are safe to execute without touching Codex-owned runtime files:

- **UI copy polish** — settings toggle label, Study Room bridge wording, fixture labels.
- **Docs/validators** — Phase 15 docs files, static validators, CI integration.
- **Study Room bridge UX hardening** — accessibility, keyboard, mobile layout for `FsrsProductionMemoryRatingBridge`.
- **Accessibility/mobile/keyboard smoke** — manual and automated smoke for existing Phase 14 UI components.
- **Test expansion** — unit and integration tests for Phase 14 bridges and helpers.
- **Release guardrails** — claim guardrails, validator updates, release decision docs.

---

## File Ownership Guardrails

Codex and Claude **must not touch the same runtime files concurrently** in Phase 15. The following files are Codex-only during active scheduling implementation:

| File | Owner | Reason |
|------|-------|---------|
| `src/state/reviewScheduleStorage.js` | Codex | Scheduling field writes; `appendFsrsReviewLog` and `dueAt` mutations |
| `src/quiz/reviewSchedulerAdapter.js` | Codex | FSRS routing gate; `ts-fsrs.next()` call site |
| `src/routes/StudyRoom.jsx` | Codex | Production scheduling path; `updateReviewScheduleFromHistoryRecord` consumer |
| `src/routes/Dashboard.jsx` | Codex | Due-count display; mixed scheduler state |
| `src/state/settingsStorage.js` | Codex | Toggle state; `fsrsExperimentalEnabled` read path |
| `src/quiz/dataBackup.js` | Codex | Backup/export FSRS field coverage |
| `src/state/v2BackupRestore.js` | Codex | Import/restore FSRS field coverage |

Claude must coordinate with Codex before touching any of these files. Coordination means: confirm the file is not actively being modified by Codex in the current Phase 15 sprint before making any changes.

---

## Claim Guardrails

The following claims must **not** be made until a future phase satisfies all ten gates from Phase 14O and explicitly lifts these restrictions:

- Do not claim that FSRS scheduling has been activated or enabled.
- Do not claim that `ts-fsrs.next()` is called in any production path.
- Do not claim that the Dashboard mixed scheduler due-count is implemented.
- Do not claim that active FSRS scheduling is live for users.
- No claim of production or security certification related to FSRS.
- No claim of built-in AI inference or external API usage for scheduling.
- No claim that SM-2-like scheduling has been replaced.

---

## Phase 15 Preflight Checklist

Before starting any Phase 15 sprint that activates FSRS scheduling:

- [ ] Fetch and reset to latest `origin/main`; confirm Phase 14P is merged.
- [ ] Confirm Phase 14O is present in `git log --oneline`.
- [ ] Choose one lane owner per file group from the file ownership table above.
- [ ] Define a rollback plan: what happens on toggle OFF after active scheduling has run.
- [ ] Define the Phase 15 validator and unit tests covering `ts-fsrs.next()` output, scheduling field mutation, FSRS log consumption, toggle guard, and rollback guard.
- [ ] Run `npm run build` and `npm run test:unit` on latest `origin/main` before branching.
- [ ] Run the full static validator chain (`for f in scripts/validate-*.js; do node "$f" || exit 1; done`) and confirm `FINAL_STATUS=0`.
- [ ] If any UI is touched: run browser smoke — Study Room with `fsrs-planned` card, Settings toggle ON/OFF, Dashboard, backup export/import, `/dev/fsrs-ui-fixture`.
- [ ] Run patch/ZIP integrity checks before handoff.
- [ ] Confirm no user-facing copy claims active FSRS scheduling before the active-scheduling phase is fully validated and shipped.

---

## Active Scheduling Disabled Evidence

- `src/quiz/reviewSchedulerAdapter.js` does not call `.next()`.
- `src/state/reviewScheduleStorage.js` does not call `.next()`.
- `src/routes/StudyRoom.jsx` does not call `.next()`.
- `src/components/study/FsrsProductionMemoryRatingBridge.jsx` does not call `.next()`.
- Memory ratings written by Phase 14N bridge are inert logs only — `appendFsrsReviewLog` writes to `fsrsReviewLogs` but the scheduler never reads them back.
- `dueAt`, `intervalDays`, `easeFactor`, `repetitionCount`, `correctStreak`, `wrongCount` are never updated from `ts-fsrs.next()` output.
- SM-2-like scheduling remains the only active production scheduler.

---

## No UI/Runtime Changes

Phase 14P makes no changes to any UI or runtime source files. Manual/browser smoke is not required because Phase 14P is docs/static-validator/CI-only and no runtime/UI files changed.

The existing Phase 14N/14O browser smoke baseline remains valid:
- App root loads normally.
- `/settings` loads; FSRS experimental toggle is visible and toggleable.
- `/dev/fsrs-ui-fixture` loads and works.
- Study Room loads; normal SM-2 flow works for non-`fsrs-planned` records.
- Study Room shows memory rating bridge for eligible `fsrs-planned` cards when toggle is ON.
- Dashboard loads.

---

## Validation

Run the Phase 14P static validator:

```bash
node scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js
```

Run the full validator chain:

```bash
for f in scripts/validate-*.js; do
  echo "== $f =="
  node "$f" || exit 1
done
```

---

## Phase 14P Scope

### Files created in Phase 14P:
- `docs/phase14p-fsrs-foundation-closure-phase15-handoff.md` — this file
- `scripts/validate-phase14p-fsrs-foundation-closure-phase15-handoff.js` — static validator
- `.github/workflows/e2e-smoke.yml` — Phase 14P validator registered in CI after Phase 14O

### Files NOT modified in Phase 14P:
- `src/routes/StudyRoom.jsx`
- `src/routes/Dashboard.jsx`
- `src/quiz/reviewSchedulerAdapter.js`
- `src/state/reviewScheduleStorage.js`
- `src/quiz/fsrsWrapper.js`
- `src/state/settingsStorage.js`
- `src/quiz/dataBackup.js`
- `src/state/v2BackupRestore.js`
- `package.json`
- `package-lock.json`
- E2E tests
- Any `src/` file
- Any `tests/` file
